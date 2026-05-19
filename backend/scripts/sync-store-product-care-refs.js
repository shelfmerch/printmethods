/**
 * Sync storeproducts.careInstructions to ref-only careIconId rows from catalogproducts.
 * Run: node scripts/sync-store-product-care-refs.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const StoreProduct = require('../models/StoreProduct');
const { syncStoreProductCareFromCatalog } = require('../utils/storeProductRefs');

async function main() {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) throw new Error('MONGO_URL is not set');

  await mongoose.connect(mongoUrl);
  console.log('Syncing store product careInstructions refs from catalog…');

  const cursor = StoreProduct.find({}).cursor();
  let n = 0;

  for await (const sp of cursor) {
    await syncStoreProductCareFromCatalog(sp);
    await sp.save();
    n += 1;
    const iconCount = sp.careInstructions?.icons?.length || 0;
    console.log(`  ${sp._id} ← ${iconCount} careIconId ref(s)`);
  }

  console.log(`Done. Updated ${n} store product(s).`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
