import test from 'node:test';
import assert from 'node:assert/strict';

test('budget alert severity scales with percentage used', async () => {
  const getBudgetAlertSeverity = (percentageUsed) => {
    if (percentageUsed >= 100) return 'high';
    if (percentageUsed >= 90) return 'medium';
    return 'low';
  };

  assert.equal(getBudgetAlertSeverity(80), 'low');
  assert.equal(getBudgetAlertSeverity(95), 'medium');
  assert.equal(getBudgetAlertSeverity(120), 'high');
});
