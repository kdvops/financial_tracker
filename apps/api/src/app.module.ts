import { Module } from '@nestjs/common';

import { AlertsModule } from './alerts/alerts.module';
import { AuthModule } from './auth/auth.module';
import { BankParsersModule } from './bank-parsers/bank-parsers.module';
import { BudgetsModule } from './budgets/budgets.module';
import { CardsModule } from './cards/cards.module';
import { CategorizationModule } from './categorization/categorization.module';
import { CategoriesModule } from './categories/categories.module';
import { CommonAuthModule } from './common/auth/common-auth.module';
import { DuplicateDetectorModule } from './duplicate-detector/duplicate-detector.module';
import { HealthModule } from './health/health.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationsIngestionModule } from './notifications-ingestion/notifications-ingestion.module';
import { PrismaModule } from './prisma/prisma.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    CommonAuthModule,
    AlertsModule,
    BankParsersModule,
    BudgetsModule,
    CardsModule,
    CategoriesModule,
    CategorizationModule,
    DuplicateDetectorModule,
    HealthModule,
    DashboardModule,
    UsersModule,
    AuthModule,
    TransactionsModule,
    NotificationsIngestionModule,
  ],
})
export class AppModule {}
