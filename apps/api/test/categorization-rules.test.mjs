import test from 'node:test';
import assert from 'node:assert/strict';

test('basic categorization rules map known merchants and payments', () => {
  const categorize = (merchant, type) => {
    if (type === 'credit_card_payment') return 'Pagos de tarjeta';
    const normalized = merchant ? merchant.toUpperCase() : null;
    if (!normalized) return 'Otros';
    if (normalized.includes('SIRENA') || normalized.includes('SUPERMERCADO')) {
      return 'Supermercado';
    }
    if (normalized.includes('GASOPOLIS')) {
      return 'Combustible';
    }
    if (normalized.includes('EDESUR')) {
      return 'Servicios';
    }
    return 'Otros';
  };

  assert.equal(categorize('SIRENA MARKET COLINA', 'credit_card_purchase'), 'Supermercado');
  assert.equal(categorize('NEXT LINCOLN GASOPOLIS', 'credit_card_purchase'), 'Combustible');
  assert.equal(categorize('Electricidad / Edesur', 'credit_card_purchase'), 'Servicios');
  assert.equal(categorize(null, 'credit_card_payment'), 'Pagos de tarjeta');
});
