import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  NormalizedTransaction,
  TransactionListItem,
  TransactionStatus,
} from '@financial-tracker/shared-contracts';

import { BankParsersService } from '../bank-parsers/bank-parsers.service';
import { CardsService } from '../cards/cards.service';
import { DuplicateDetectorService } from '../duplicate-detector/duplicate-detector.service';
import { PrismaService } from '../prisma/prisma.service';
import type { TransactionsQueryDto } from './dto/transactions-query.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly bankParsersService: BankParsersService,
    private readonly cardsService: CardsService,
    private readonly duplicateDetectorService: DuplicateDetectorService,
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
        status: query.status,
        transactionDate: {
          gte: query.from ? new Date(query.from) : undefined,
          lte: query.to ? new Date(query.to) : undefined,
        },
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

  private mapTransaction(transaction: {
    id: string;
    type: string;
    amount: unknown;
    currency: string;
    merchant: string | null;
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
      cardLast4: transaction.cardLast4,
      cardId: transaction.cardId,
      transactionDate: transaction.transactionDate.toISOString(),
      source: transaction.source as TransactionListItem['source'],
      status: transaction.status as TransactionStatus,
    };
  }

  private resolveTransactionStatus(
    normalized: NormalizedTransaction,
  ): TransactionStatus {
    if (normalized.confidence < 0.7 || normalized.type === 'unknown') {
      return 'NEEDS_REVIEW';
    }

    return 'NORMALIZED';
  }
}
