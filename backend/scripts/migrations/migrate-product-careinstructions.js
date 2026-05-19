/* eslint-disable no-console */
/**
 * Normalize catalogproducts.careInstructions.icons to ref-only { careIconId, label? }.
 *
 * Run: node scripts/migrations/migrate-product-careinstructions.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const CatalogProduct = require('../../models/CatalogProduct');
const { toCatalogCareInstructionsRefs } = require('../../utils/careInstructionsRefs');

async function main() {
  const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL;
  if (!mongoUrl) throw new Error('MONGODB_URI, MONGO_URI, or MONGO_URL is required');
  await mongoose.connect(mongoUrl);
  console.log('[care-migrate] connected');

  const cursor = CatalogProduct.find({}, { careInstructions: 1, updatedAt: 1 })
    .lean()
    .cursor();

  let scanned = 0;
  let updatedProducts = 0;

  for await (const p of cursor) {
    scanned += 1;
    const productId = p._id;
    const ci = p.careInstructions;
    if (!ci || typeof ci !== 'object') continue;

    const refs = await toCatalogCareInstructionsRefs(ci);
    const resP = await CatalogProduct.updateOne(
      { _id: productId },
      { $set: { careInstructions: refs, updatedAt: p.updatedAt || new Date() } },
    );
    if (resP.modifiedCount > 0) updatedProducts += 1;

    if (scanned % 200 === 0) {
      console.log(`[care-migrate] scanned=${scanned} products=${updatedProducts}`);
    }
  }

  console.log(`[care-migrate] done scanned=${scanned} products=${updatedProducts}`);
  await mongoose.disconnect();
  console.log('[care-migrate] disconnected');
}

main().catch((err) => {
  console.error('[care-migrate] failed', err);
  process.exitCode = 1;
});
