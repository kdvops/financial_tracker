import { Module } from '@nestjs/common';

import { CategoriesModule } from '../categories/categories.module';
import { CategorizationService } from './categorization.service';

@Module({
  imports: [CategoriesModule],
  providers: [CategorizationService],
  exports: [CategorizationService],
})
export class CategorizationModule {}
