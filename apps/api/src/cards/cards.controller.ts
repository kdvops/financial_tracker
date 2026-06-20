import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { BearerAuthGuard } from '../common/auth/bearer-auth.guard';
import { CurrentUser } from '../common/auth/current-user.decorator';
import type { JwtPayload } from '../common/auth/jwt-payload.interface';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';

@Controller('cards')
@UseGuards(BearerAuthGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.cardsService.list(user.sub);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateCardDto) {
    return this.cardsService.create(user.sub, dto);
  }

  @Get(':id/statement-summary')
  getStatementSummary(
    @CurrentUser() user: JwtPayload,
    @Param('id') cardId: string,
  ) {
    return this.cardsService.getStatementSummary(user.sub, cardId);
  }
}
