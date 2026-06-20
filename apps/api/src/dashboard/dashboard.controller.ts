import { Controller, Get } from '@nestjs/common';

import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('spending-by-category')
  getSpendingByCategory() {
    return this.dashboardService.getSpendingByCategory();
  }

  @Get('spending-by-card')
  getSpendingByCard() {
    return this.dashboardService.getSpendingByCard();
  }
}
