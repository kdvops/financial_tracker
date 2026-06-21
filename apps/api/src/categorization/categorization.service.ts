import { Injectable } from '@nestjs/common';

import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class CategorizationService {
  constructor(private readonly categoriesService: CategoriesService) {}

  async categorize(input: {
    userId?: string;
    merchant: string | null;
    type: string;
  }) {
    const customRule = input.userId
      ? await this.findCustomRuleMatch(input.userId, input.merchant)
      : null;

    if (customRule) {
      return customRule;
    }

    const categoryName = this.matchCategoryName(input);
    if (!categoryName) {
      return null;
    }

    return this.categoriesService.findSystemCategoryByName(categoryName);
  }

  private async findCustomRuleMatch(userId: string, merchant: string | null) {
    const normalizedMerchant = this.normalizeMerchant(merchant);
    if (!normalizedMerchant) {
      return null;
    }

    const rules = await this.categoriesService.listRulesForUser(userId);

    const matchedRule = rules.find((rule) =>
      normalizedMerchant.includes(rule.pattern.toUpperCase()),
    );

    if (!matchedRule) {
      return null;
    }

    return this.categoriesService.findAccessibleCategoryById(
      userId,
      matchedRule.categoryId,
    );
  }

  private matchCategoryName(input: { merchant: string | null; type: string }) {
    if (input.type === 'credit_card_payment') {
      return 'Pagos de tarjeta';
    }

    const merchant = this.normalizeMerchant(input.merchant);

    if (!merchant) {
      return 'Otros';
    }

    const exactRules: Array<[string, string]> = [
      ['SIRENA', 'Supermercado'],
      ['SUPERMERCADO', 'Supermercado'],
      ['NACIONAL', 'Supermercado'],
      ['GASOPOLIS', 'Combustible'],
      ['TEXACO', 'Combustible'],
      ['EDESUR', 'Servicios'],
      ['CLARO', 'Servicios'],
      ['NETFLIX', 'Suscripciones'],
      ['SPOTIFY', 'Suscripciones'],
      ['AMAZON PRIME', 'Suscripciones'],
      ['UBER', 'Transporte'],
      ['PEDIDOSYA', 'Restaurante'],
    ];

    for (const [pattern, category] of exactRules) {
      if (merchant.includes(pattern)) {
        return category;
      }
    }

    return 'Otros';
  }

  private normalizeMerchant(merchant: string | null) {
    if (!merchant) {
      return null;
    }

    return merchant.toUpperCase();
  }
}
