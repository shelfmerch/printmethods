const test = require('node:test');
const assert = require('node:assert/strict');

const {
  calculatePackagingTotal,
  validatePackagingChoice,
  validateSingleLocationFulfillment,
} = require('./kitFulfillment');

const products = [
  {
    _id: 'shirt',
    name: 'T-shirt',
    variants: [
      { size: 'M', color: 'Black', isActive: true },
      { size: 'L', color: 'Black', isActive: true },
    ],
  },
  {
    _id: 'mug',
    name: 'Mug',
    variants: [],
  },
];

test('validatePackagingChoice accepts active packaging catalog products', () => {
  const choice = validatePackagingChoice({
    packaging: { mode: 'catalog_product', catalogProductId: 'box', branding: 'logo', notes: 'Pack neatly' },
    packagingProduct: { _id: 'box', categoryId: 'packaging', isActive: true },
  });

  assert.deepEqual(choice, {
    mode: 'catalog_product',
    catalogProductId: 'box',
    branding: 'logo',
    notes: 'Pack neatly',
  });
});

test('validatePackagingChoice rejects non-packaging catalog products', () => {
  assert.throws(
    () => validatePackagingChoice({
      packaging: { mode: 'catalog_product', catalogProductId: 'shirt' },
      packagingProduct: { _id: 'shirt', categoryId: 'apparel', isActive: true },
    }),
    /Selected packaging must be an active packaging product/
  );
});

test('calculatePackagingTotal charges packaging per kit unit', () => {
  assert.equal(calculatePackagingTotal({ packagingProduct: { basePrice: 35 }, quantity: 12 }), 420);
});

test('validateSingleLocationFulfillment requires address and total quantity', () => {
  assert.throws(
    () => validateSingleLocationFulfillment({
      products,
      payload: { singleLocationQuantity: 0, singleLocationAddress: {} },
    }),
    /Single location quantity is required/
  );
});

test('validateSingleLocationFulfillment requires variant quantity breakdowns to match total quantity', () => {
  assert.throws(
    () => validateSingleLocationFulfillment({
      products,
      payload: {
        singleLocationQuantity: 10,
        singleLocationAddress: { fullName: 'Office Admin', address1: 'HQ', city: 'Hyderabad', country: 'India' },
        singleLocationSelections: [
          { catalogProductId: 'shirt', size: 'M', color: 'Black', quantity: 6 },
        ],
      },
    }),
    /T-shirt quantities must add up to 10/
  );
});

test('validateSingleLocationFulfillment rejects selections for products outside the kit', () => {
  assert.throws(
    () => validateSingleLocationFulfillment({
      products,
      payload: {
        singleLocationQuantity: 10,
        singleLocationAddress: { fullName: 'Office Admin', address1: 'HQ', city: 'Hyderabad', country: 'India' },
        singleLocationSelections: [
          { catalogProductId: 'shirt', size: 'M', color: 'Black', quantity: 10 },
          { catalogProductId: 'hoodie', size: 'M', color: 'Black', quantity: 10 },
        ],
      },
    }),
    /Single location includes a product that is not in this kit/
  );
});

test('validateSingleLocationFulfillment rejects selections for non-variant products', () => {
  assert.throws(
    () => validateSingleLocationFulfillment({
      products,
      payload: {
        singleLocationQuantity: 10,
        singleLocationAddress: { fullName: 'Office Admin', address1: 'HQ', city: 'Hyderabad', country: 'India' },
        singleLocationSelections: [
          { catalogProductId: 'shirt', size: 'M', color: 'Black', quantity: 10 },
          { catalogProductId: 'mug', quantity: 10 },
        ],
      },
    }),
    /Single location size\/color selections are only allowed for variant products/
  );
});

test('validateSingleLocationFulfillment accepts complete variant breakdowns and fixed products', () => {
  const result = validateSingleLocationFulfillment({
    products,
    payload: {
      singleLocationQuantity: 10,
      singleLocationType: 'event',
      singleLocationAddress: { fullName: 'Office Admin', address1: 'HQ', city: 'Hyderabad', country: 'India' },
      singleLocationSelections: [
        { catalogProductId: 'shirt', size: 'M', color: 'Black', quantity: 6 },
        { catalogProductId: 'shirt', size: 'L', color: 'Black', quantity: 4 },
      ],
    },
  });

  assert.equal(result.quantity, 10);
  assert.equal(result.locationType, 'event');
  assert.deepEqual(result.selections, [
    { catalogProductId: 'shirt', size: 'M', color: 'Black', quantity: 6 },
    { catalogProductId: 'shirt', size: 'L', color: 'Black', quantity: 4 },
    { catalogProductId: 'mug', quantity: 10 },
  ]);
});
