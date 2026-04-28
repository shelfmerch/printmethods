const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildVariantRequirements,
  validateSelectionsForKit,
} = require('./kitVariantSelections');

const products = [
  {
    _id: 'shirt',
    name: 'T-shirt',
    variants: [
      { size: 'M', color: 'Black', isActive: true },
      { size: 'L', color: 'Black', isActive: true },
      { size: 'M', color: 'White', isActive: true },
    ],
  },
  {
    _id: 'mug',
    name: 'Coffee Mug',
    variants: [],
  },
];

test('buildVariantRequirements includes only products with active size/color variants', () => {
  const requirements = buildVariantRequirements(products);

  assert.deepEqual(requirements.map((entry) => entry.productId), ['shirt']);
  assert.deepEqual(requirements[0].sizes, ['L', 'M']);
  assert.deepEqual(requirements[0].colors, ['Black', 'White']);
});

test('validateSelectionsForKit rejects missing selection for a variant product', () => {
  assert.throws(
    () => validateSelectionsForKit({
      products,
      selections: [{ catalogProductId: 'mug', quantity: 1 }],
      context: 'Recipient',
    }),
    /Recipient must choose size and color for T-shirt/
  );
});

test('validateSelectionsForKit accepts selections for variant products and ignores non-variant products', () => {
  const validated = validateSelectionsForKit({
    products,
    selections: [
      { catalogProductId: 'shirt', size: 'M', color: 'Black', quantity: 1 },
      { catalogProductId: 'mug', quantity: 1 },
    ],
    context: 'Recipient',
  });

  assert.deepEqual(validated, [
    { catalogProductId: 'shirt', size: 'M', color: 'Black', quantity: 1 },
    { catalogProductId: 'mug', quantity: 1 },
  ]);
});

test('validateSelectionsForKit rejects inactive or nonexistent size/color combinations', () => {
  assert.throws(
    () => validateSelectionsForKit({
      products,
      selections: [{ catalogProductId: 'shirt', size: 'XL', color: 'Black', quantity: 1 }],
      context: 'Recipient',
    }),
    /Recipient selected an unavailable size\/color for T-shirt/
  );
});
