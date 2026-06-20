import type { NormalizedTransaction } from '@financial-tracker/shared-contracts';

export interface BankParserInput {
  provider: string | null;
  subject: string | null;
  normalizedText: string | null;
  receivedAt: Date | null;
}

export interface BankParser {
  supports(input: BankParserInput): boolean;
  parse(input: BankParserInput): NormalizedTransaction | null;
}
