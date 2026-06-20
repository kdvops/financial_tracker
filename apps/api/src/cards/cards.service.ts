import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CardListItem, CardStatementSummary } from '@financial-tracker/shared-contracts';

import { PrismaService } from '../prisma/prisma.service';
import type { CreateCardDto } from './dto/create-card.dto';

@Injectable()
export class CardsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(userId: string, dto: CreateCardDto): Promise<CardListItem> {
    const card = await this.prismaService.card.create({
      data: {
        userId,
        displayName: dto.displayName,
        bankName: dto.bankName ?? null,
        cardLast4: dto.cardLast4 ?? null,
        currency: dto.currency ?? 'DOP',
        creditLimit: dto.creditLimit ?? null,
        cutoffDay: dto.cutoffDay ?? null,
        dueDay: dto.dueDay ?? null,
      },
    });

    return this.mapCard(card);
  }

  async list(userId: string): Promise<CardListItem[]> {
    const cards = await this.prismaService.card.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return cards.map((card) => this.mapCard(card));
  }

  async findMatchForTransaction(userId: string, cardLast4: string | null) {
    if (!cardLast4) {
      return { cardId: null, hasConflict: false };
    }

    const cards = await this.prismaService.card.findMany({
      where: {
        userId,
        cardLast4,
      },
      select: {
        id: true,
      },
    });

    if (cards.length !== 1) {
      return {
        cardId: null,
        hasConflict: cards.length > 1,
      };
    }

    return {
      cardId: cards[0]?.id ?? null,
      hasConflict: false,
    };
  }

  async getStatementSummary(
    userId: string,
    cardId: string,
  ): Promise<CardStatementSummary> {
    const card = await this.prismaService.card.findFirst({
      where: {
        id: cardId,
        userId,
      },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    const transactions = await this.prismaService.transaction.findMany({
      where: {
        userId,
        cardId,
      },
      include: {
        category: true,
      },
      orderBy: {
        transactionDate: 'desc',
      },
    });

    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    let estimatedBalance = 0;
    let currentMonthPurchases = 0;
    let currentMonthPayments = 0;
    const categoryTotals = new Map<string, number>();

    for (const transaction of transactions) {
      const amount = Number(transaction.amount);
      const affectsPositive = [
        'credit_card_purchase',
        'fee',
        'interest',
        'atm_withdrawal',
      ].includes(transaction.type);
      const affectsNegative = [
        'credit_card_payment',
        'refund',
        'reversal',
      ].includes(transaction.type);

      if (affectsPositive) {
        estimatedBalance += amount;
      } else if (affectsNegative) {
        estimatedBalance -= amount;
      }

      if (transaction.transactionDate >= startOfMonth) {
        if (transaction.type === 'credit_card_purchase') {
          currentMonthPurchases += amount;
          const categoryName = transaction.category?.name ?? 'Otros';
          categoryTotals.set(
            categoryName,
            (categoryTotals.get(categoryName) ?? 0) + amount,
          );
        }

        if (transaction.type === 'credit_card_payment') {
          currentMonthPayments += amount;
        }
      }
    }

    return {
      cardId: card.id,
      displayName: card.displayName,
      currency: card.currency as CardStatementSummary['currency'],
      estimatedBalance: Number(estimatedBalance.toFixed(2)),
      currentMonthPurchases: Number(currentMonthPurchases.toFixed(2)),
      currentMonthPayments: Number(currentMonthPayments.toFixed(2)),
      byCategory: [...categoryTotals.entries()].map(([category, amount]) => ({
        category,
        amount: Number(amount.toFixed(2)),
      })),
    };
  }

  private mapCard(card: {
    id: string;
    displayName: string;
    bankName: string | null;
    cardLast4: string | null;
    currency: string;
    creditLimit: unknown;
    cutoffDay: number | null;
    dueDay: number | null;
  }): CardListItem {
    return {
      id: card.id,
      displayName: card.displayName,
      bankName: card.bankName,
      cardLast4: card.cardLast4,
      currency: card.currency as CardListItem['currency'],
      creditLimit: card.creditLimit === null ? null : Number(card.creditLimit),
      cutoffDay: card.cutoffDay,
      dueDay: card.dueDay,
    };
  }
}
