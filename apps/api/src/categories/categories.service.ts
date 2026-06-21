import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import type {
  CategoryListItem,
  CategoryRuleListItem,
} from '@financial-tracker/shared-contracts';

import { PrismaService } from '../prisma/prisma.service';
import type { CreateCategoryRuleDto } from './dto/create-category-rule.dto';
import type { UpdateCategoryRuleDto } from './dto/update-category-rule.dto';

const SYSTEM_CATEGORY_NAMES = [
  'Supermercado',
  'Combustible',
  'Restaurante',
  'Servicios',
  'Suscripciones',
  'Salud',
  'Educacion',
  'Transporte',
  'Compras',
  'Entretenimiento',
  'Viajes',
  'Transferencias',
  'Pagos de tarjeta',
  'Comisiones',
  'Otros',
] as const;

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  async ensureSystemCategories() {
    for (const name of SYSTEM_CATEGORY_NAMES) {
      const existing = await this.prismaService.category.findFirst({
        where: {
          userId: null,
          name,
        },
      });

      if (!existing) {
        await this.prismaService.category.create({
          data: {
            userId: null,
            name,
            isSystem: true,
          },
        });
      }
    }
  }

  async findSystemCategoryByName(name: string) {
    await this.ensureSystemCategories();

    return this.prismaService.category.findFirst({
      where: {
        userId: null,
        name,
      },
    });
  }

  async findAccessibleCategoryById(userId: string, categoryId: string) {
    return this.findAccessibleCategory(userId, categoryId);
  }

  async listRulesForUser(userId: string): Promise<CategoryRuleListItem[]> {
    const rules = await this.prismaService.categoryRule.findMany({
      where: {
        OR: [{ userId: null }, { userId }],
      },
      include: {
        category: true,
      },
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
    });

    return rules.map((rule) => ({
      id: rule.id,
      pattern: rule.pattern,
      categoryId: rule.categoryId,
      category: rule.category.name,
      priority: rule.priority,
    }));
  }

  async createRule(
    userId: string,
    dto: CreateCategoryRuleDto,
  ): Promise<CategoryRuleListItem> {
    const category = await this.findAccessibleCategory(userId, dto.categoryId);

    const rule = await this.prismaService.categoryRule.create({
      data: {
        userId,
        pattern: dto.pattern.trim(),
        categoryId: category.id,
        priority: dto.priority ?? 100,
      },
      include: {
        category: true,
      },
    });

    return {
      id: rule.id,
      pattern: rule.pattern,
      categoryId: rule.categoryId,
      category: rule.category.name,
      priority: rule.priority,
    };
  }

  async updateRule(
    userId: string,
    ruleId: string,
    dto: UpdateCategoryRuleDto,
  ): Promise<CategoryRuleListItem> {
    await this.ensureRuleOwnership(userId, ruleId);

    const category =
      dto.categoryId === undefined
        ? null
        : await this.findAccessibleCategory(userId, dto.categoryId);

    const rule = await this.prismaService.categoryRule.update({
      where: { id: ruleId },
      data: {
        pattern: dto.pattern?.trim(),
        categoryId: category?.id,
        priority: dto.priority,
      },
      include: {
        category: true,
      },
    });

    return {
      id: rule.id,
      pattern: rule.pattern,
      categoryId: rule.categoryId,
      category: rule.category.name,
      priority: rule.priority,
    };
  }

  async listForUser(userId: string): Promise<CategoryListItem[]> {
    await this.ensureSystemCategories();

    const categories = await this.prismaService.category.findMany({
      where: {
        OR: [{ userId: null }, { userId }],
      },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      isSystem: category.isSystem,
    }));
  }

  private async findAccessibleCategory(userId: string, categoryId: string) {
    const category = await this.prismaService.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ userId: null }, { userId }],
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  private async ensureRuleOwnership(userId: string, ruleId: string) {
    const rule = await this.prismaService.categoryRule.findFirst({
      where: {
        id: ruleId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!rule) {
      throw new NotFoundException('Category rule not found');
    }
  }
}
