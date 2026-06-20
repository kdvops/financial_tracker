import { Module } from '@nestjs/common';

import { BankParsersModule } from '../bank-parsers/bank-parsers.module';
import { CardsModule } from '../cards/cards.module';
import { DuplicateDetectorModule } from '../duplicate-detector/duplicate-detector.module';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [BankParsersModule, CardsModule, DuplicateDetectorModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
