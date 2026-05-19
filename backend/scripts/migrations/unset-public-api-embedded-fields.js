/**
 * Remove public-API-era fields embedded on core collections (stores, storeproducts).
 * Run: node scripts/migrations/unset-public-api-embedded-fields.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Store = require('../../models/Store');
const StoreProduct = require('../../models/StoreProduct');

async function run() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL;
  if (!uri) {
    throw new Error('Set MONGODB_URI, MONGO_URI, or MONGO_URL');
  }

  await mongoose.connect(uri);

  const storeResult = await Store.updateMany(
    { status: { $exists: true } },
    { $unset: { status: 1 } },
  );
  console.log('Unset stores.status:', storeResult.modifiedCount);

  const productResult = await StoreProduct.updateMany(
    { $or: [{ source: { $exists: true } }, { channel: { $exists: true } }] },
    { $unset: { source: 1, channel: 1 } },
  );
  console.log('Unset storeproducts.source/channel:', productResult.modifiedCount);

  try {
    await Store.collection.dropIndex('status_1');
    console.log('Dropped index stores.status_1');
  } catch (err) {
    if (err?.codeName !== 'IndexNotFound' && err?.code !== 27) {
      console.warn('stores.status_1 index drop skipped:', err.message);
    }
  }

  try {
    await StoreProduct.collection.dropIndex('source_1');
    console.log('Dropped index storeproducts.source_1');
  } catch (err) {
    if (err?.codeName !== 'IndexNotFound' && err?.code !== 27) {
      console.warn('storeproducts.source_1 index drop skipped:', err.message);
    }
  }

  try {
    await StoreProduct.collection.dropIndex('storeId_1_source_1');
    console.log('Dropped index storeproducts.storeId_1_source_1');
  } catch (err) {
    if (err?.codeName !== 'IndexNotFound' && err?.code !== 27) {
      console.warn('storeId_1_source_1 index drop skipped:', err.message);
    }
  }

  await mongoose.disconnect();
  console.log('Embedded public API field cleanup finished.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
