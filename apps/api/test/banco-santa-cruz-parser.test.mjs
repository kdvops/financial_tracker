import test from 'node:test';
import assert from 'node:assert/strict';

import { BancoSantaCruzParser } from '../dist/bank-parsers/banco-santa-cruz.parser.js';

test('BancoSantaCruzParser parses purchase emails', () => {
  const parser = new BancoSantaCruzParser();
  const parsed = parser.parse({
    provider: 'notificaciones@bsc.com.do',
    subject: 'Notificación, Banco Santa Cruz',
    normalizedText:
      'NOTIFICACIÓN DE CONSUMO\nTe notificamos que desde tu tarjeta de Crédito Clásica terminada en 0250 fue realizada la siguiente transacción:\nMonto: RD$ 515.80\nLugar de transacción: SIRENA MARKET COLINA CTROSANTO DOMINGODO\nFecha y hora: 2/06/2026 09:47:22\nEstado: Aprobada',
    receivedAt: new Date('2026-06-02T09:47:22-04:00'),
  });

  assert.ok(parsed);
  assert.equal(parsed.bankName, 'Banco Santa Cruz');
  assert.equal(parsed.type, 'credit_card_purchase');
  assert.equal(parsed.amount, 515.8);
  assert.equal(parsed.merchant, 'SIRENA MARKET COLINA CTROSANTO DOMINGODO');
  assert.equal(parsed.cardLast4, '0250');
});
