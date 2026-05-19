/**
 * Remove deprecated storeproducts fields (variantsSummary, galleryImages, etc.).
 *
 * Run: node scripts/migrations/unset-storeproduct-variants-summary.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { DEPRECATED_STORE_PRODUCT_UNSET } = require('../../models/StoreProduct');

const TOP_LEVEL_KEYS = Object.keys(DEPRECATED_STORE_PRODUCT_UNSET).filter((k) => !k.includes('.'));

async function run() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL;
  if (!uri) {
    throw new Error('Set MONGODB_URI, MONGO_URI, or MONGO_URL');
  }

  await mongoose.connect(uri);
  const collection = mongoose.connection.collection('storeproducts');

  const existsOr = TOP_LEVEL_KEYS.map((k) => ({ [k]: { $exists: true } }));
  existsOr.push({ 'designData.galleryImages': { $exists: true } });

  const result = await collection.updateMany(
    { $or: existsOr },
    { $unset: DEPRECATED_STORE_PRODUCT_UNSET },
  );
  console.log('Matched:', result.matchedCount, 'Modified:', result.modifiedCount);

  for (const indexName of [
    'variantsSummary.catalogProductVariantId_1',
    'galleryImages_1',
    'source_1',
    'tags_1',
  ]) {
    try {
      await collection.dropIndex(indexName);
      console.log('Dropped index', indexName);
    } catch (err) {
      if (err?.codeName !== 'IndexNotFound' && err?.code !== 27) {
        console.warn(`Index drop skipped (${indexName}):`, err.message);
      }
    }
  }

  const remaining = await collection.countDocuments({ $or: existsOr });
  console.log('Documents still containing deprecated fields:', remaining);

  await mongoose.disconnect();
  console.log('Store product deprecated field cleanup finished.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
