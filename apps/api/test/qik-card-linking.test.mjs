import test from 'node:test';
import assert from 'node:assert/strict';

import { QikParser } from '../dist/bank-parsers/qik.parser.js';

test('QikParser extracts last4 for card linking', () => {
  const parser = new QikParser();
  const parsed = parser.parse({
    provider: 'do.qik.app',
    subject: 'Usaste tu tarjeta de credito Qik',
    normalizedText:
      'Se hizo una transaccion de RD$ 3,041.90 en NEXT LINCOLN GASOPOLIS con tu tarjeta credito Qik que termina en 5647\nFecha y hora: 06-18-2026 08:30 PM (AST)',
    receivedAt: new Date('2026-06-18T20:30:00-04:00'),
  });

  assert.ok(parsed);
  assert.equal(parsed.cardLast4, '5647');
  assert.equal(parsed.confidence, 0.99);
});
