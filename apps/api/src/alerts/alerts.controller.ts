import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';

import { BearerAuthGuard } from '../common/auth/bearer-auth.guard';
import { CurrentUser } from '../common/auth/current-user.decorator';
import type { JwtPayload } from '../common/auth/jwt-payload.interface';
import { AlertsService } from './alerts.service';

@Controller('alerts')
@UseGuards(BearerAuthGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.alertsService.listForUser(user.sub);
  }

  @Patch(':id/read')
  markAsRead(@CurrentUser() user: JwtPayload, @Param('id') alertId: string) {
    return this.alertsService.markAsRead(user.sub, alertId);
  }
}
