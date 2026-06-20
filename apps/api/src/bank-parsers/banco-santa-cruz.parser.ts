import type { NormalizedTransaction } from '@financial-tracker/shared-contracts';

import type { BankParser, BankParserInput } from './interfaces/bank-parser.interface';
import {
  extractAmount,
  extractCardLast4,
  extractLineValue,
  extractPatternValue,
  normalizeWhitespace,
  parseDateString,
} from './utils/parser-helpers';

export class BancoSantaCruzParser implements BankParser {
  supports(input: BankParserInput): boolean {
    const combined = `${input.subject ?? ''} ${input.normalizedText ?? ''}`.toLowerCase();
    return (
      combined.includes('banco santa cruz') ||
      combined.includes('notificacion de consumo') ||
      combined.includes('notificación de consumo')
    );
  }

  parse(input: BankParserInput): NormalizedTransaction | null {
    const text = input.normalizedText ?? '';
    const amountValue = extractLineValue(text, 'Monto');
    const amount = amountValue ? extractAmount(amountValue) : extractAmount(text);
    const merchant =
      extractPatternValue(
        text,
        /Lugar de transacci[oó]n:\s*(.+?)(?:Fecha y hora:|Estado:|tarjeta terminada|$)/i,
      ) ??
      extractLineValue(text, 'Lugar de transaccion') ??
      extractLineValue(text, 'Lugar de transacción');
    const transactionDate = parseDateString(
      extractPatternValue(
        text,
        /Fecha y hora:\s*(.+?)(?:Estado:|tarjeta terminada|$)/i,
      ) ?? extractLineValue(text, 'Fecha y hora'),
      input.receivedAt,
    );
    const cardLast4 = extractCardLast4(text);

    if (!amount || !merchant) {
      return null;
    }

    return {
      bankName: 'Banco Santa Cruz',
      type: 'credit_card_purchase',
      amount,
      currency: 'DOP',
      merchant: normalizeWhitespace(merchant),
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
