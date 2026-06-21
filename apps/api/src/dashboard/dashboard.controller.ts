import { Controller, Get, UseGuards } from '@nestjs/common';

import { BearerAuthGuard } from '../common/auth/bearer-auth.guard';
import { CurrentUser } from '../common/auth/current-user.decorator';
import type { JwtPayload } from '../common/auth/jwt-payload.interface';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(BearerAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.getSummary(user.sub);
  }

  @Get('spending-by-category')
  getSpendingByCategory(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.getSpendingByCategory(user.sub);
  }

  @Get('spending-by-card')
  getSpendingByCard(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.getSpendingByCard(user.sub);
  }
}
