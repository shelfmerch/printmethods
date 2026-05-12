/* eslint-disable no-console */
/**
 * One-time / idempotent migration:
 * - Rewrites CatalogProduct.careInstructions.icons to ref-only { careIconId, label? }
 *   resolved from existing embedded snapshots via `careicons`.
 * - Syncs catalogproductcareinstructions to the same ref-only shape.
 *
 * Run: node backend/scripts/migrations/migrate-product-careinstructions.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const CatalogProduct = require('../../models/CatalogProduct');
const CatalogProductCareInstruction = require('../../models/CatalogProductCareInstruction');
const { toCatalogCareInstructionsRefs } = require('../../utils/careInstructionsRefs');

async function main() {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) throw new Error('MONGO_URL is required');
  await mongoose.connect(mongoUrl);
  console.log('[care-migrate] connected');

  const cursor = CatalogProduct.find({}, { careInstructions: 1, createdAt: 1, updatedAt: 1 })
    .lean()
    .cursor();

  let scanned = 0;
  let updatedProducts = 0;
  let updatedSide = 0;

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

    const resS = await CatalogProductCareInstruction.findOneAndUpdate(
      { productId },
      {
        $setOnInsert: { productId, createdAt: p.createdAt || new Date() },
        $set: {
          text: refs.text,
          icons: refs.icons,
          updatedAt: p.updatedAt || new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    if (resS) updatedSide += 1;

    if (scanned % 200 === 0) {
      console.log(`[care-migrate] scanned=${scanned} products=${updatedProducts} side=${updatedSide}`);
    }
  }

  console.log(`[care-migrate] done scanned=${scanned} products=${updatedProducts} side=${updatedSide}`);
  await mongoose.disconnect();
  console.log('[care-migrate] disconnected');
}

main().catch((err) => {
  console.error('[care-migrate] failed', err);
  process.exitCode = 1;
});
