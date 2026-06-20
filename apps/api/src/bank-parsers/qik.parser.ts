import type { NormalizedTransaction } from '@financial-tracker/shared-contracts';

import type { BankParser, BankParserInput } from './interfaces/bank-parser.interface';
import {
  extractAmount,
  extractCardLast4,
  extractLineValue,
  normalizeWhitespace,
  parseDateString,
} from './utils/parser-helpers';

export class QikParser implements BankParser {
  supports(input: BankParserInput): boolean {
    const combined = `${input.subject ?? ''} ${input.normalizedText ?? ''}`.toLowerCase();
    return combined.includes('qik');
  }

  parse(input: BankParserInput): NormalizedTransaction | null {
    const text = input.normalizedText ?? '';
    const normalized = normalizeWhitespace(text);
    const isServicePayment =
      normalized.toLowerCase().includes('monto total pagado') &&
      normalized.toLowerCase().includes('pago de servicio');

    if (isServicePayment) {
      return this.parseServicePayment(input, text);
    }

    return this.parseCardPurchase(input, normalized, text);
  }

  private parseCardPurchase(
    input: BankParserInput,
    normalized: string,
    rawText: string,
  ): NormalizedTransaction | null {
    const amount = extractAmount(normalized);
    const merchantMatch = normalized.match(/transacci[oó]n de (?:RD\$|DOP|US\$|USD)\s?[\d,]+(?:\.\d{2})? en (.+?) con tu tarjeta/i);
    const transactionDate = parseDateString(
      extractLineValue(rawText, 'Fecha y hora'),
      input.receivedAt,
    );
    const cardLast4 = extractCardLast4(normalized);

    if (!amount || !merchantMatch) {
      return null;
    }

    const merchant = merchantMatch[1];
    if (!merchant) {
      return null;
    }

    return {
      bankName: 'Qik',
      type: 'credit_card_purchase',
      amount,
      currency: 'DOP',
      merchant: normalizeWhitespace(merchant),
      cardLast4,
      transactionDate,
      confidence: this.calculateConfidence({
        amountFound: Boolean(amount),
        merchantFound: Boolean(merchantMatch),
        cardFound: Boolean(cardLast4),
        dateFound: Boolean(transactionDate),
      }),
    };
  }

  private parseServicePayment(input: BankParserInput, text: string): NormalizedTransaction | null {
    const amount = extractAmount(text);
    const merchant = extractLineValue(text, 'Servicio');
    const transactionDate = parseDateString(
      extractLineValue(text, 'Fecha y hora'),
      input.receivedAt,
    );
    const cardLast4 = extractCardLast4(text);

    if (!amount || !merchant) {
      return null;
    }

    return {
      bankName: 'Qik',
      type: 'credit_card_purchase',
      amount,
      currency: 'DOP',
      merchant,
      cardLast4,
      transactionDate,
      confidence: this.calculateConfidence({
        amountFound: Boolean(amount),
        merchantFound: Boolean(merchant),
        cardFound: Boolean(cardLast4),
        dateFound: Boolean(transactionDate),
      }),
    };
  }

  private calculateConfidence(input: {
    amountFound: boolean;
    merchantFound: boolean;
    cardFound: boolean;
    dateFound: boolean;
  }) {
    let confidence = 0.2;
    if (input.amountFound) confidence += 0.25;
    confidence += 0.15;
    if (input.merchantFound) confidence += 0.2;
    if (input.cardFound) confidence += 0.2;
    if (input.dateFound) confidence += 0.2;
    return Number(Math.min(confidence, 0.99).toFixed(3));
  }
}
