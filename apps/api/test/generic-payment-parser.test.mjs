import test from 'node:test';
import assert from 'node:assert/strict';

import { GenericBankParser } from '../dist/bank-parsers/generic-bank.parser.js';

test('GenericBankParser parses credit card payments', () => {
  const parser = new GenericBankParser();
  const parsed = parser.parse({
    provider: 'mail',
    subject: 'Pago recibido',
    normalizedText: 'Pago recibido por RD$10,000.00 a tarjeta terminada 1234',
    receivedAt: new Date('2026-06-18T20:30:00-04:00'),
  });

  assert.ok(parsed);
  assert.equal(parsed.type, 'credit_card_payment');
  assert.equal(parsed.amount, 10000);
  assert.equal(parsed.cardLast4, '1234');
});
