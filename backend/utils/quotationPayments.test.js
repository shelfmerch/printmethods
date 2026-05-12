const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getQuotationPaymentStatus,
  minimumAdvancePaise,
  validateAdvanceAmount,
} = require('./quotationPayments');

test('requires at least 50 percent advance and allows full payment', () => {
  assert.equal(minimumAdvancePaise(1000), 50000);
  assert.equal(validateAdvanceAmount(1000, 49999).valid, false);
  assert.equal(validateAdvanceAmount(1000, 50000).valid, true);
  assert.equal(validateAdvanceAmount(1000, 100000).valid, true);
  assert.equal(validateAdvanceAmount(1000, 100001).valid, false);
});

test('marks quotation paid when cumulative payments reach total', () => {
  assert.equal(getQuotationPaymentStatus(1000, 0), null);
  assert.equal(getQuotationPaymentStatus(1000, 50000), 'partially_paid');
  assert.equal(getQuotationPaymentStatus(1000, 100000), 'paid');
  assert.equal(getQuotationPaymentStatus(1000, 110000), 'paid');
});
