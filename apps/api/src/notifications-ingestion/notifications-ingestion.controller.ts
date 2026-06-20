import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { BearerAuthGuard } from '../common/auth/bearer-auth.guard';
import { CurrentUser } from '../common/auth/current-user.decorator';
import type { JwtPayload } from '../common/auth/jwt-payload.interface';
import { NotificationBatchDto } from './dto/notification-batch.dto';
import { NotificationIngestionDto } from './dto/notification-ingestion.dto';
import { NotificationsIngestionService } from './notifications-ingestion.service';

@Controller('ingestion/notifications')
@UseGuards(BearerAuthGuard)
export class NotificationsIngestionController {
  constructor(
    private readonly notificationsIngestionService: NotificationsIngestionService,
  ) {}

  @Post()
  ingest(
    @CurrentUser() user: JwtPayload,
    @Body() dto: NotificationIngestionDto,
  ) {
    return this.notificationsIngestionService.ingest(user.sub, dto);
  }

  @Post('batch')
  ingestBatch(
    @CurrentUser() user: JwtPayload,
    @Body() dto: NotificationBatchDto,
  ) {
    return this.notificationsIngestionService.ingestBatch(user.sub, dto.items);
  }
}
