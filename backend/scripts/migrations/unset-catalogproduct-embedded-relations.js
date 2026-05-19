/**
 * Remove attributes, stocks, and design.sampleMockups from catalogproducts.
 * Source of truth: catalogproductattributes, catalogproductinventories, catalogproductmockups.
 *
 * Run: node scripts/migrations/unset-catalogproduct-embedded-relations.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { DEPRECATED_CATALOG_PRODUCT_UNSET } = require('../../models/CatalogProduct');

async function run() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL;
  if (!uri) {
    throw new Error('Set MONGODB_URI, MONGO_URI, or MONGO_URL');
  }

  await mongoose.connect(uri);
  const collection = mongoose.connection.collection('catalogproducts');

  const existsOr = Object.keys(DEPRECATED_CATALOG_PRODUCT_UNSET).map((k) => ({
    [k]: { $exists: true },
  }));

  const result = await collection.updateMany(
    { $or: existsOr },
    { $unset: DEPRECATED_CATALOG_PRODUCT_UNSET },
  );
  console.log('Matched:', result.matchedCount, 'Modified:', result.modifiedCount);

  try {
    await collection.dropIndex('design.sampleMockups.colorKey_1');
    console.log('Dropped index design.sampleMockups.colorKey_1');
  } catch (err) {
    if (err?.codeName !== 'IndexNotFound' && err?.code !== 27) {
      console.warn('Index drop skipped (design.sampleMockups.colorKey_1):', err.message);
    }
  }

  const remaining = await collection.countDocuments({ $or: existsOr });
  console.log('Documents still containing deprecated fields:', remaining);

  await mongoose.disconnect();
  console.log('Catalog product embedded relation cleanup finished.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
