import { Injectable, NotFoundException } from '@nestjs/common';
import type { AlertListItem } from '@financial-tracker/shared-contracts';

import { PrismaService } from '../prisma/prisma.service';

interface EvaluateBudgetAlertInput {
  userId: string;
  transactionId: string;
  categoryId: string | null;
  currency: string;
  transactionDate: Date;
}

@Injectable()
export class AlertsService {
  constructor(private readonly prismaService: PrismaService) {}

  async listForUser(userId: string): Promise<AlertListItem[]> {
    const alerts = await this.prismaService.alert.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return alerts.map((alert) => ({
      id: alert.id,
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      isRead: alert.isRead,
      transactionId: alert.transactionId,
      createdAt: alert.createdAt.toISOString(),
    }));
  }

  async markAsRead(userId: string, alertId: string): Promise<AlertListItem> {
    const existing = await this.prismaService.alert.findFirst({
      where: {
        id: alertId,
        userId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Alert not found');
    }

    const alert = await this.prismaService.alert.update({
      where: { id: alertId },
      data: {
        isRead: true,
      },
    });

    return {
      id: alert.id,
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      isRead: alert.isRead,
      transactionId: alert.transactionId,
      createdAt: alert.createdAt.toISOString(),
    };
  }

  async evaluateBudgetAlertsForTransaction(input: EvaluateBudgetAlertInput) {
    if (!input.categoryId) {
      return;
    }

    const budgets = await this.prismaService.budget.findMany({
      where: {
        userId: input.userId,
        categoryId: input.categoryId,
        currency: input.currency,
        period: 'monthly',
      },
      include: {
        category: true,
      },
    });

    if (budgets.length === 0) {
      return;
    }

    const monthStart = new Date(
      Date.UTC(
        input.transactionDate.getUTCFullYear(),
        input.transactionDate.getUTCMonth(),
        1,
      ),
    );
    const nextMonthStart = new Date(
      Date.UTC(
        input.transactionDate.getUTCFullYear(),
        input.transactionDate.getUTCMonth() + 1,
        1,
      ),
    );

    const aggregate = await this.prismaService.transaction.aggregate({
      where: {
        userId: input.userId,
        categoryId: input.categoryId,
        type: 'credit_card_purchase',
        status: {
          not: 'DUPLICATE_SUSPECTED',
        },
        transactionDate: {
          gte: monthStart,
          lt: nextMonthStart,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const currentSpend = Number(aggregate._sum.amount ?? 0);

    for (const budget of budgets) {
      const limit = Number(budget.amount);
      const threshold = Number(budget.alertThreshold);
      const percentageUsed = limit === 0 ? 0 : (currentSpend / limit) * 100;

      if (percentageUsed < threshold) {
        continue;
      }

      const categoryName = budget.category?.name ?? 'Sin categoria';
      const title = `Presupuesto ${categoryName}`;
      const existingAlert = await this.prismaService.alert.findFirst({
        where: {
          userId: input.userId,
          type: 'budget_threshold',
          title,
          createdAt: {
            gte: monthStart,
            lt: nextMonthStart,
          },
        },
        select: {
          id: true,
        },
      });

      if (existingAlert) {
        continue;
      }

      const roundedSpend = Number(currentSpend.toFixed(2));
      const roundedLimit = Number(limit.toFixed(2));
      const roundedPercentage = Number(percentageUsed.toFixed(1));

      await this.prismaService.alert.create({
        data: {
          userId: input.userId,
          transactionId: input.transactionId,
          type: 'budget_threshold',
          severity: getBudgetAlertSeverity(percentageUsed),
          title,
          message: `Has usado ${roundedPercentage}% del presupuesto de ${categoryName} (${roundedSpend}/${roundedLimit} ${budget.currency}).`,
        },
      });
    }
  }
}

export function getBudgetAlertSeverity(percentageUsed: number) {
  if (percentageUsed >= 100) {
    return 'high';
  }

  if (percentageUsed >= 90) {
    return 'medium';
  }

  return 'low';
}
