import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { BearerAuthGuard } from '../common/auth/bearer-auth.guard';
import { CurrentUser } from '../common/auth/current-user.decorator';
import type { JwtPayload } from '../common/auth/jwt-payload.interface';
import { MarkDuplicateDto } from './dto/mark-duplicate.dto';
import { TransactionsQueryDto } from './dto/transactions-query.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@UseGuards(BearerAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  list(
    @CurrentUser() user: JwtPayload,
    @Query() query: TransactionsQueryDto,
  ) {
    return this.transactionsService.listForUser(user.sub, query);
  }

  @Get(':id')
  getById(@CurrentUser() user: JwtPayload, @Param('id') transactionId: string) {
    return this.transactionsService.getByIdForUser(user.sub, transactionId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') transactionId: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.updateForUser(user.sub, transactionId, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') transactionId: string) {
    return this.transactionsService.removeForUser(user.sub, transactionId);
  }

  @Post(':id/mark-duplicate')
  markDuplicate(
    @CurrentUser() user: JwtPayload,
    @Param('id') transactionId: string,
    @Body() dto: MarkDuplicateDto,
  ) {
    return this.transactionsService.markDuplicateForUser(
      user.sub,
      transactionId,
      dto,
    );
  }

  @Post(':id/reprocess')
  reprocess(@CurrentUser() user: JwtPayload, @Param('id') transactionId: string) {
    return this.transactionsService.reprocessForUser(user.sub, transactionId);
  }
}
