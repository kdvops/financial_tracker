import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  NormalizedTransaction,
  TransactionDetailItem,
  TransactionListItem,
  TransactionStatus,
} from '@financial-tracker/shared-contracts';

import { AlertsService } from '../alerts/alerts.service';
import { BankParsersService } from '../bank-parsers/bank-parsers.service';
import { CardsService } from '../cards/cards.service';
import { CategorizationService } from '../categorization/categorization.service';
import { CategoriesService } from '../categories/categories.service';
import { DuplicateDetectorService } from '../duplicate-detector/duplicate-detector.service';
import { PrismaService } from '../prisma/prisma.service';
import type { MarkDuplicateDto } from './dto/mark-duplicate.dto';
import type { TransactionsQueryDto } from './dto/transactions-query.dto';
import type { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly alertsService: AlertsService,
    private readonly bankParsersService: BankParsersService,
    private readonly cardsService: CardsService,
    private readonly duplicateDetectorService: DuplicateDetectorService,
    private readonly categoriesService: CategoriesService,
    private readonly categorizationService: CategorizationService,
  ) {}

  async processRawMessage(rawMessageId: string) {
    const rawMessage = await this.prismaService.rawMessage.findUnique({
      where: { id: rawMessageId },
    });

    if (!rawMessage) {
      throw new NotFoundException('Raw message not found');
    }

    try {
      const normalized = this.bankParsersService.parse({
        provider: rawMessage.provider,
        subject: rawMessage.subject,
        normalizedText: rawMessage.normalizedText,
        receivedAt: rawMessage.receivedAt,
      });

      if (!normalized) {
        await this.prismaService.rawMessage.update({
          where: { id: rawMessage.id },
          data: {
            processingStatus: 'FAILED',
          },
        });

        return null;
      }

      const cardMatch = await this.cardsService.findMatchForTransaction(
        rawMessage.userId,
        normalized.cardLast4,
      );
      const category = await this.categorizationService.categorize({
        userId: rawMessage.userId,
        merchant: normalized.merchant,
        type: normalized.type,
      });
      const transactionStatus = this.resolveTransactionStatus(normalized);
      const preliminaryStatus = cardMatch.hasConflict
        ? 'NEEDS_REVIEW'
        : transactionStatus;

      const transaction = await this.prismaService.transaction.upsert({
        where: {
          rawMessageId: rawMessage.id,
        },
        update: {
          cardId: cardMatch.cardId,
          categoryId: category?.id ?? null,
          bankName: normalized.bankName,
          cardLast4: normalized.cardLast4,
          type: normalized.type,
          amount: normalized.amount,
          currency: normalized.currency,
          merchant: normalized.merchant,
          transactionDate: new Date(normalized.transactionDate),
          source: rawMessage.source,
          status: preliminaryStatus,
          confidence: normalized.confidence,
        },
        create: {
          userId: rawMessage.userId,
          cardId: cardMatch.cardId,
          categoryId: category?.id ?? null,
          rawMessageId: rawMessage.id,
          bankName: normalized.bankName,
          cardLast4: normalized.cardLast4,
          type: normalized.type,
          amount: normalized.amount,
          currency: normalized.currency,
          merchant: normalized.merchant,
          transactionDate: new Date(normalized.transactionDate),
          source: rawMessage.source,
          status: preliminaryStatus,
          confidence: normalized.confidence,
        },
      });

      const isDuplicate =
        preliminaryStatus !== 'NEEDS_REVIEW' &&
        (await this.duplicateDetectorService.isProbableDuplicate({
          transactionId: transaction.id,
          userId: rawMessage.userId,
          amount: Number(transaction.amount),
          currency: transaction.currency,
          cardLast4: transaction.cardLast4,
          merchant: transaction.merchant,
          transactionDate: transaction.transactionDate,
          type: transaction.type,
        }));

      const finalStatus = isDuplicate
        ? 'DUPLICATE_SUSPECTED'
        : preliminaryStatus;

      const finalTransaction =
        finalStatus === preliminaryStatus
          ? transaction
          : await this.prismaService.transaction.update({
              where: { id: transaction.id },
              data: {
                status: finalStatus,
              },
            });

      if (
        finalStatus === 'CATEGORIZED' &&
        finalTransaction.type === 'credit_card_purchase'
      ) {
        await this.alertsService.evaluateBudgetAlertsForTransaction({
          userId: rawMessage.userId,
          transactionId: finalTransaction.id,
          categoryId: finalTransaction.categoryId,
          currency: finalTransaction.currency,
          transactionDate: finalTransaction.transactionDate,
        });
      }

      await this.prismaService.rawMessage.update({
        where: { id: rawMessage.id },
        data: {
          processingStatus: this.resolveRawMessageStatus(finalStatus),
        },
      });

      return finalTransaction;
    } catch {
      await this.prismaService.rawMessage.update({
        where: { id: rawMessage.id },
        data: {
          processingStatus: 'FAILED',
        },
      });
      throw new Error('Failed to process raw message');
    }
  }

  private resolveRawMessageStatus(status: TransactionStatus) {
    if (status === 'DUPLICATE_SUSPECTED') {
      return 'DUPLICATE_SUSPECTED';
    }

    if (status === 'NEEDS_REVIEW') {
      return 'NEEDS_REVIEW';
    }

    return 'NORMALIZED';
  }

  async listForUser(userId: string, query: TransactionsQueryDto) {
    const items = await this.prismaService.transaction.findMany({
      where: {
        userId,
        cardId: query.cardId,
        categoryId: query.categoryId,
        type: query.type,
        status: query.status,
        transactionDate: {
          gte: query.from ? new Date(query.from) : undefined,
          lte: query.to ? new Date(query.to) : undefined,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        transactionDate: 'desc',
      },
    });

    return {
      items: items.map((item) => this.mapTransaction(item)),
      total: items.length,
    };
  }

  async getByIdForUser(
    userId: string,
    transactionId: string,
  ): Promise<TransactionDetailItem> {
    const transaction = await this.prismaService.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
      include: {
        category: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return this.mapTransactionDetail(transaction);
  }

  async updateForUser(
    userId: string,
    transactionId: string,
    dto: UpdateTransactionDto,
  ): Promise<TransactionDetailItem> {
    const existing = await this.prismaService.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Transaction not found');
    }

    const categoryId = await this.resolveCategoryId(userId, dto.categoryId);
    const cardId = await this.resolveCardId(userId, dto.cardId);

    const updated = await this.prismaService.transaction.update({
      where: { id: transactionId },
      data: {
        categoryId,
        cardId,
        merchant: dto.merchant,
        status: dto.status,
        confidence: dto.confidence,
      },
      include: {
        category: true,
      },
    });

    await this.handleBudgetAlertEvaluation(updated);

    return this.mapTransactionDetail(updated);
  }

  async removeForUser(userId: string, transactionId: string) {
    const transaction = await this.prismaService.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    await this.prismaService.transaction.delete({
      where: { id: transactionId },
    });

    return { success: true };
  }

  async markDuplicateForUser(
    userId: string,
    transactionId: string,
    dto: MarkDuplicateDto,
  ): Promise<TransactionDetailItem> {
    const transaction = await this.prismaService.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
      include: {
        category: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const duplicateGroupId = dto.duplicateGroupId ?? transaction.duplicateGroupId ?? transaction.id;
    const updated = await this.prismaService.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'DUPLICATE_SUSPECTED',
        duplicateGroupId,
      },
      include: {
        category: true,
      },
    });

    return this.mapTransactionDetail(updated);
  }

  async reprocessForUser(userId: string, transactionId: string) {
    const transaction = await this.prismaService.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
      select: {
        rawMessageId: true,
      },
    });

    if (!transaction?.rawMessageId) {
      throw new NotFoundException('Transaction cannot be reprocessed');
    }

    return this.processRawMessage(transaction.rawMessageId);
  }

  private async resolveCategoryId(userId: string, categoryId?: string | null) {
    if (categoryId === undefined) {
      return undefined;
    }

    if (categoryId === null) {
      return null;
    }

    const categories = await this.categoriesService.listForUser(userId);
    const category = categories.find((entry) => entry.id === categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category.id;
  }

  private async resolveCardId(userId: string, cardId?: string | null) {
    if (cardId === undefined) {
      return undefined;
    }

    if (cardId === null) {
      return null;
    }

    const card = await this.prismaService.card.findFirst({
      where: {
        id: cardId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    return card.id;
  }

  private async handleBudgetAlertEvaluation(transaction: {
    id: string;
    userId: string;
    categoryId: string | null;
    currency: string;
    transactionDate: Date;
    type: string;
    status: string;
  }) {
    if (
      transaction.status !== 'CATEGORIZED' ||
      transaction.type !== 'credit_card_purchase'
    ) {
      return;
    }

    await this.alertsService.evaluateBudgetAlertsForTransaction({
      userId: transaction.userId,
      transactionId: transaction.id,
      categoryId: transaction.categoryId,
      currency: transaction.currency,
      transactionDate: transaction.transactionDate,
    });
  }

  private mapTransaction(transaction: {
    id: string;
    type: string;
    amount: unknown;
    currency: string;
    merchant: string | null;
    category: { name: string } | null;
    categoryId: string | null;
    cardId: string | null;
    cardLast4: string | null;
    transactionDate: Date;
    source: string;
    status: string;
  }): TransactionListItem {
    return {
      id: transaction.id,
      type: transaction.type as TransactionListItem['type'],
      amount: Number(transaction.amount),
      currency: transaction.currency as TransactionListItem['currency'],
      merchant: transaction.merchant,
      category: transaction.category?.name ?? null,
      categoryId: transaction.categoryId,
      cardLast4: transaction.cardLast4,
      cardId: transaction.cardId,
      transactionDate: transaction.transactionDate.toISOString(),
      source: transaction.source as TransactionListItem['source'],
      status: transaction.status as TransactionStatus,
    };
  }

  private mapTransactionDetail(transaction: {
    id: string;
    type: string;
    amount: unknown;
    currency: string;
    merchant: string | null;
    category: { name: string } | null;
    categoryId: string | null;
    cardId: string | null;
    cardLast4: string | null;
    bankName: string | null;
    rawMessageId: string | null;
    transactionDate: Date;
    source: string;
    status: string;
    confidence: unknown;
    createdAt: Date;
    updatedAt: Date;
  }): TransactionDetailItem {
    return {
      ...this.mapTransaction(transaction),
      bankName: transaction.bankName,
      rawMessageId: transaction.rawMessageId,
      confidence:
        transaction.confidence === null ? null : Number(transaction.confidence),
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
    };
  }

  private resolveTransactionStatus(
    normalized: NormalizedTransaction,
  ): TransactionStatus {
    if (normalized.confidence < 0.7 || normalized.type === 'unknown') {
      return 'NEEDS_REVIEW';
    }

    return 'CATEGORIZED';
  }
}
