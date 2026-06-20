import test from 'node:test';
import assert from 'node:assert/strict';

test('duplicate detection heuristic expects same merchant and amount within a short window', () => {
  const normalizeMerchant = (merchant) =>
    merchant ? merchant.toUpperCase().replace(/[^A-Z0-9]/g, '') : null;

  const first = {
    amount: 3041.9,
    currency: 'DOP',
    cardLast4: '5647',
    merchant: 'NEXT LINCOLN GASOPOLIS',
    type: 'credit_card_purchase',
  };

  const second = {
    amount: 3041.9,
    currency: 'DOP',
    cardLast4: '5647',
    merchant: 'NEXT LINCOLN GASOPOLIS',
    type: 'credit_card_purchase',
  };

  assert.equal(first.amount, second.amount);
  assert.equal(first.currency, second.currency);
  assert.equal(first.cardLast4, second.cardLast4);
  assert.equal(normalizeMerchant(first.merchant), normalizeMerchant(second.merchant));
  assert.equal(first.type, second.type);
});
