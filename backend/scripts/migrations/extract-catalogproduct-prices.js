/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');

const CatalogProduct = require('../../models/CatalogProduct');
const { isEmbeddedSpecificPriceEntry } = require('../../utils/catalogProductPriceRefs');
const { upsertPricesForProduct } = require('../../utils/catalogProductPriceRefs');
const { syncCatalogProductRelationRefs } = require('../../utils/catalogProductRefs');

/**
 * Migrate embedded pricing.specificPrices objects → catalogproductprices
 * and store ObjectId refs on catalogproducts.pricing.specificPrices[].
 */

async function main() {
  const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUrl) throw new Error('MONGO_URL / MONGODB_URI is required');

  await mongoose.connect(mongoUrl);
  console.log('[extract-prices] connected');

  const products = await CatalogProduct.find({}, { pricing: 1 }).lean();
  let migrated = 0;
  let rulesTotal = 0;

  for (const product of products) {
    const embedded = (product?.pricing?.specificPrices || []).filter(isEmbeddedSpecificPriceEntry);
    if (!embedded.length) continue;
    await upsertPricesForProduct(product._id, embedded, { syncRefs: true });
    migrated += 1;
    rulesTotal += embedded.length;
    console.log('[extract-prices]', product._id, '→', embedded.length, 'rule(s)');
  }

  for (const product of products) {
    await syncCatalogProductRelationRefs(product._id);
  }

  console.log('[extract-prices] products migrated:', migrated);
  console.log('[extract-prices] rules written:', rulesTotal);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
