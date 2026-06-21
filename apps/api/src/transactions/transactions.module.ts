import { Module } from '@nestjs/common';

import { AlertsModule } from '../alerts/alerts.module';
import { BankParsersModule } from '../bank-parsers/bank-parsers.module';
import { CardsModule } from '../cards/cards.module';
import { CategorizationModule } from '../categorization/categorization.module';
import { CategoriesModule } from '../categories/categories.module';
import { DuplicateDetectorModule } from '../duplicate-detector/duplicate-detector.module';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [
    AlertsModule,
    BankParsersModule,
    CardsModule,
    DuplicateDetectorModule,
    CategorizationModule,
    CategoriesModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
