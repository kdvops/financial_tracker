import type { NormalizedTransaction } from '@financial-tracker/shared-contracts';

import type { BankParser, BankParserInput } from './interfaces/bank-parser.interface';
import {
  extractAmount,
  extractCardLast4,
  normalizeWhitespace,
  parseDateString,
} from './utils/parser-helpers';

export class GenericBankParser implements BankParser {
  supports(): boolean {
    return true;
  }

  parse(input: BankParserInput): NormalizedTransaction | null {
    const text = `${input.subject ?? ''}\n${input.normalizedText ?? ''}`.trim();
    const normalizedText = normalizeWhitespace(text);
    const paymentLike =
      normalizedText.toLowerCase().includes('pago recibido') ||
      normalizedText.toLowerCase().includes('pago realizado') ||
      normalizedText.toLowerCase().includes('pago aplicado');

    if (paymentLike) {
      return this.parseCardPayment(input, normalizedText);
    }

    const amount = extractAmount(text);
    const cardLast4 = extractCardLast4(text);
    const merchantMatch = normalizedText.match(
      /\ben\s+(.+?)(?:\s+con\s+tarjeta|\s+tarjeta|\s+que\s+termina|\s*$)/i,
    );

    if (!amount) {
      return null;
    }

    const merchant = merchantMatch?.[1]
      ? normalizeWhitespace(merchantMatch[1])
      : null;

    return {
      bankName: null,
      type: 'unknown',
      amount,
      currency: 'DOP',
      merchant,
      cardLast4,
      transactionDate: parseDateString(null, input.receivedAt),
      confidence: merchant ? 0.65 : 0.45,
    };
  }

  private parseCardPayment(
    input: BankParserInput,
    text: string,
  ): NormalizedTransaction | null {
    const amount = extractAmount(text);
    const cardLast4 = extractCardLast4(text);

    if (!amount) {
      return null;
    }

    return {
      bankName: null,
      type: 'credit_card_payment',
      amount,
      currency: 'DOP',
      merchant: null,
      cardLast4,
      transactionDate: parseDateString(null, input.receivedAt),
      confidence: cardLast4 ? 0.8 : 0.6,
    };
  }
}
