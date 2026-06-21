import { Injectable, NotFoundException } from '@nestjs/common';
import type { BudgetListItem } from '@financial-tracker/shared-contracts';

import { PrismaService } from '../prisma/prisma.service';
import type { CreateBudgetDto } from './dto/create-budget.dto';
import type { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private readonly prismaService: PrismaService) {}

  async listForUser(userId: string): Promise<BudgetListItem[]> {
    const budgets = await this.prismaService.budget.findMany({
      where: { userId },
      include: {
        category: true,
      },
      orderBy: [{ period: 'asc' }, { createdAt: 'desc' }],
    });

    return budgets.map((budget) => this.mapBudget(budget));
  }

  async create(userId: string, dto: CreateBudgetDto): Promise<BudgetListItem> {
    const categoryId = await this.resolveAccessibleCategoryId(userId, dto.categoryId);

    const budget = await this.prismaService.budget.create({
      data: {
        userId,
        categoryId,
        amount: dto.amount,
        currency: dto.currency ?? 'DOP',
        period: dto.period ?? 'monthly',
        alertThreshold: dto.alertThreshold ?? 80,
      },
      include: {
        category: true,
      },
    });

    return this.mapBudget(budget);
  }

  async update(
    userId: string,
    budgetId: string,
    dto: UpdateBudgetDto,
  ): Promise<BudgetListItem> {
    await this.ensureBudgetOwnership(userId, budgetId);

    const categoryId =
      dto.categoryId === undefined
        ? undefined
        : await this.resolveAccessibleCategoryId(userId, dto.categoryId);

    const budget = await this.prismaService.budget.update({
      where: { id: budgetId },
      data: {
        categoryId,
        amount: dto.amount,
        currency: dto.currency,
        period: dto.period,
        alertThreshold: dto.alertThreshold,
      },
      include: {
        category: true,
      },
    });

    return this.mapBudget(budget);
  }

  async remove(userId: string, budgetId: string) {
    await this.ensureBudgetOwnership(userId, budgetId);

    await this.prismaService.budget.delete({
      where: { id: budgetId },
    });

    return { success: true };
  }

  private async ensureBudgetOwnership(userId: string, budgetId: string) {
    const budget = await this.prismaService.budget.findFirst({
      where: {
        id: budgetId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }
  }

  private async resolveAccessibleCategoryId(userId: string, categoryId?: string | null) {
    if (categoryId === undefined) {
      return undefined;
    }

    if (categoryId === null) {
      return null;
    }

    const category = await this.prismaService.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ userId: null }, { userId }],
      },
      select: {
        id: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category.id;
  }

  private mapBudget(budget: {
    id: string;
    categoryId: string | null;
    amount: unknown;
    currency: string;
    period: string;
    alertThreshold: unknown;
    category: { name: string } | null;
  }): BudgetListItem {
    return {
      id: budget.id,
      categoryId: budget.categoryId,
      category: budget.category?.name ?? null,
      amount: Number(budget.amount),
      currency: budget.currency as BudgetListItem['currency'],
      period: budget.period,
      alertThreshold: Number(budget.alertThreshold),
    };
  }
}
