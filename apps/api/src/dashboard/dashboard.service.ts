import { Injectable } from '@nestjs/common';

import type {
  DashboardCardSpend,
  DashboardCategorySpend,
  DashboardSummary,
} from '@financial-tracker/shared-contracts';

@Injectable()
export class DashboardService {
  getSummary(): DashboardSummary {
    return {
      totalMonthlySpend: 0,
      totalMonthlyPayments: 0,
      estimatedBalance: 0,
      activeAlertsCount: 0,
      currency: 'DOP',
    };
  }

  getSpendingByCategory(): DashboardCategorySpend[] {
    return [];
  }

  getSpendingByCard(): DashboardCardSpend[] {
    return [];
  }
}
