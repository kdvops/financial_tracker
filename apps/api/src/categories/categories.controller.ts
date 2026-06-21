import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { BearerAuthGuard } from '../common/auth/bearer-auth.guard';
import { CurrentUser } from '../common/auth/current-user.decorator';
import type { JwtPayload } from '../common/auth/jwt-payload.interface';
import { CreateCategoryRuleDto } from './dto/create-category-rule.dto';
import { UpdateCategoryRuleDto } from './dto/update-category-rule.dto';
import { CategoriesService } from './categories.service';

@Controller('categories')
@UseGuards(BearerAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.categoriesService.listForUser(user.sub);
  }

  @Get('rules')
  listRules(@CurrentUser() user: JwtPayload) {
    return this.categoriesService.listRulesForUser(user.sub);
  }

  @Post('rules')
  createRule(@CurrentUser() user: JwtPayload, @Body() dto: CreateCategoryRuleDto) {
    return this.categoriesService.createRule(user.sub, dto);
  }

  @Patch('rules/:id')
  updateRule(
    @CurrentUser() user: JwtPayload,
    @Param('id') ruleId: string,
    @Body() dto: UpdateCategoryRuleDto,
  ) {
    return this.categoriesService.updateRule(user.sub, ruleId, dto);
  }
}
