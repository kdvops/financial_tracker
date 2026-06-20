import { Module } from '@nestjs/common';

import { BankParsersService } from './bank-parsers.service';

@Module({
  providers: [BankParsersService],
  exports: [BankParsersService],
})
export class BankParsersModule {}
