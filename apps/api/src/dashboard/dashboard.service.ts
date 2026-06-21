import { Injectable } from '@nestjs/common';

import type {
  DashboardCardSpend,
  DashboardCategorySpend,
  DashboardSummary,
} from '@financial-tracker/shared-contracts';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prismaService: PrismaService) {}

  async getSummary(userId: string): Promise<DashboardSummary> {
    const { startOfMonth, startOfNextMonth } = getCurrentMonthRange();

    const [transactions, activeAlertsCount] = await Promise.all([
      this.prismaService.transaction.findMany({
        where: {
          userId,
          status: {
            not: 'DUPLICATE_SUSPECTED',
          },
        },
        select: {
          amount: true,
          currency: true,
          type: true,
          transactionDate: true,
        },
      }),
      this.prismaService.alert.count({
        where: {
          userId,
          isRead: false,
        },
      }),
    ]);

    let totalMonthlySpend = 0;
    let totalMonthlyPayments = 0;
    let estimatedBalance = 0;

    for (const transaction of transactions) {
      const amount = Number(transaction.amount);
      const inCurrentMonth =
        transaction.transactionDate >= startOfMonth &&
        transaction.transactionDate < startOfNextMonth;

      if (transaction.type === 'credit_card_purchase' && inCurrentMonth) {
        totalMonthlySpend += amount;
      }

      if (transaction.type === 'credit_card_payment' && inCurrentMonth) {
        totalMonthlyPayments += amount;
      }

      if (affectsPositiveBalance(transaction.type)) {
        estimatedBalance += amount;
      } else if (affectsNegativeBalance(transaction.type)) {
        estimatedBalance -= amount;
      }
    }

    return {
      totalMonthlySpend: Number(totalMonthlySpend.toFixed(2)),
      totalMonthlyPayments: Number(totalMonthlyPayments.toFixed(2)),
      estimatedBalance: Number(estimatedBalance.toFixed(2)),
      activeAlertsCount,
      currency: 'DOP',
    };
  }

  async getSpendingByCategory(userId: string): Promise<DashboardCategorySpend[]> {
    const { startOfMonth, startOfNextMonth } = getCurrentMonthRange();
    const transactions = await this.prismaService.transaction.findMany({
      where: {
        userId,
        type: 'credit_card_purchase',
        status: {
          not: 'DUPLICATE_SUSPECTED',
        },
        transactionDate: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      },
      include: {
        category: true,
      },
    });

    const totals = new Map<string, number>();

    for (const transaction of transactions) {
      const categoryName = transaction.category?.name ?? 'Otros';
      totals.set(categoryName, (totals.get(categoryName) ?? 0) + Number(transaction.amount));
    }

    return [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({
        category,
        amount: Number(amount.toFixed(2)),
        currency: 'DOP',
      }));
  }

  async getSpendingByCard(userId: string): Promise<DashboardCardSpend[]> {
    const { startOfMonth, startOfNextMonth } = getCurrentMonthRange();
    const transactions = await this.prismaService.transaction.findMany({
      where: {
        userId,
        type: 'credit_card_purchase',
        status: {
          not: 'DUPLICATE_SUSPECTED',
        },
        transactionDate: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      },
      include: {
        card: true,
      },
    });

    const totals = new Map<string, { displayName: string; amount: number }>();

    for (const transaction of transactions) {
      const cardId = transaction.cardId ?? 'unassigned';
      const displayName =
        transaction.card?.displayName ??
        (transaction.cardLast4 ? `Tarjeta ${transaction.cardLast4}` : 'Sin tarjeta asignada');
      const entry = totals.get(cardId) ?? { displayName, amount: 0 };
      entry.amount += Number(transaction.amount);
      totals.set(cardId, entry);
    }

    return [...totals.entries()]
      .sort((a, b) => b[1].amount - a[1].amount)
      .map(([cardId, entry]) => ({
        cardId,
        displayName: entry.displayName,
        amount: Number(entry.amount.toFixed(2)),
        currency: 'DOP',
      }));
  }
}

function getCurrentMonthRange() {
  const now = new Date();
  const startOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const startOfNextMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );

  return { startOfMonth, startOfNextMonth };
}

function affectsPositiveBalance(type: string) {
  return ['credit_card_purchase', 'fee', 'interest', 'atm_withdrawal'].includes(
    type,
  );
}

function affectsNegativeBalance(type: string) {
  return ['credit_card_payment', 'refund', 'reversal'].includes(type);
}
