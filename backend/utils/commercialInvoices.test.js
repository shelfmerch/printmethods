const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildDirectOrderInvoicePayload,
  buildKitSendInvoicePayload,
  invoiceTotals,
} = require('./commercialInvoices');

test('invoiceTotals maps line items and totals consistently', () => {
  const totals = invoiceTotals({
    items: [{ productName: 'Tee', quantity: 2, unitPrice: 250 }],
    shipping: 50,
    tax: 90,
  });

  assert.equal(totals.productionCost, 500);
  assert.equal(totals.shippingCost, 50);
  assert.equal(totals.tax, 90);
  assert.equal(totals.totalAmount, 640);
  assert.equal(totals.items[0].productName, 'Tee');
});

test('buildDirectOrderInvoicePayload creates a DirectOrder invoice payload', () => {
  const payload = buildDirectOrderInvoicePayload({
    _id: 'order1',
    merchantId: 'merchant1',
    orderType: 'quotation',
    items: [{ productName: 'Mug', quantity: 1, unitPrice: 300 }],
    shipping: 0,
    tax: 54,
    total: 354,
    payment: { method: 'razorpay' },
  });

  assert.equal(payload.orderModel, 'DirectOrder');
  assert.equal(payload.sourceType, 'quotation');
  assert.equal(payload.totalAmount, 354);
  assert.equal(payload.status, 'paid');
});

test('buildKitSendInvoicePayload creates a KitSend invoice payload', () => {
  const payload = buildKitSendInvoicePayload({
    kitSend: {
      _id: 'send1',
      brandId: 'store1',
      recipientCount: 3,
      itemsCostPerRecipient: 100,
      tax: 54,
      total: 354,
    },
    kit: {
      name: 'Welcome Kit',
      items: [{ catalogProductId: { name: 'Bottle' } }],
    },
    store: { merchant: 'merchant1' },
  });

  assert.equal(payload.orderModel, 'KitSend');
  assert.equal(payload.sourceType, 'kit_send');
  assert.equal(payload.merchantId, 'merchant1');
  assert.equal(payload.items[0].quantity, 3);
});
