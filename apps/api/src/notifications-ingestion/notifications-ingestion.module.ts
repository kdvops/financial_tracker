import { Module } from '@nestjs/common';

import { CommonAuthModule } from '../common/auth/common-auth.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { NotificationsIngestionController } from './notifications-ingestion.controller';
import { NotificationsIngestionService } from './notifications-ingestion.service';

@Module({
  imports: [CommonAuthModule, TransactionsModule],
  controllers: [NotificationsIngestionController],
  providers: [NotificationsIngestionService],
})
export class NotificationsIngestionModule {}
