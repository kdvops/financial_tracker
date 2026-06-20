export type SupportedCurrency = 'DOP' | 'USD';

export type TransactionSource =
  | 'android_notification'
  | 'email'
  | 'manual'
  | 'import';

export type TransactionType =
  | 'credit_card_purchase'
  | 'credit_card_payment'
  | 'debit_card_purchase'
  | 'bank_transfer'
  | 'atm_withdrawal'
  | 'fee'
  | 'interest'
  | 'refund'
  | 'reversal'
  | 'unknown';

export type TransactionStatus =
  | 'RAW_RECEIVED'
  | 'PARSED'
  | 'NORMALIZED'
  | 'DUPLICATE_SUSPECTED'
  | 'CATEGORIZED'
  | 'RECONCILED'
  | 'NEEDS_REVIEW'
  | 'FAILED';

export interface DashboardSummary {
  totalMonthlySpend: number;
  totalMonthlyPayments: number;
  estimatedBalance: number;
  activeAlertsCount: number;
  currency: SupportedCurrency;
}

export interface DashboardCategorySpend {
  category: string;
  amount: number;
  currency: SupportedCurrency;
}

export interface DashboardCardSpend {
  cardId: string;
  displayName: string;
  amount: number;
  currency: SupportedCurrency;
}

export interface NormalizedTransaction {
  bankName: string | null;
  type: TransactionType;
  amount: number;
  currency: SupportedCurrency;
  merchant: string | null;
  cardLast4: string | null;
  transactionDate: string;
  confidence: number;
}

export interface TransactionListItem {
  id: string;
  type: TransactionType;
  amount: number;
  currency: SupportedCurrency;
  merchant: string | null;
  cardLast4: string | null;
  cardId?: string | null;
  transactionDate: string;
  source: TransactionSource;
  status: TransactionStatus;
}

export interface CardListItem {
  id: string;
  displayName: string;
  bankName: string | null;
  cardLast4: string | null;
  currency: SupportedCurrency;
  creditLimit: number | null;
  cutoffDay: number | null;
  dueDay: number | null;
}

export interface CardStatementSummary {
  cardId: string;
  displayName: string;
  currency: SupportedCurrency;
  estimatedBalance: number;
  currentMonthPurchases: number;
  currentMonthPayments: number;
  byCategory: Array<{
    category: string;
    amount: number;
  }>;
}
