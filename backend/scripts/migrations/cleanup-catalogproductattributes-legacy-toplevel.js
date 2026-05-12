/* eslint-disable no-console */
/**
 * One-time cleanup: remove redundant top-level strings (material, gsm, hoodType, …)
 * from catalogproductattributes after migrating to nested `attributes` only.
 *
 * For each doc: ensures `attributes` is populated (from nested or legacy top-level),
 * then $set attributes + $unset legacy keys.
 *
 * Safe to re-run (idempotent).
 */
require('dotenv').config();
const mongoose = require('mongoose');

const CatalogProductAttribute = require('../../models/CatalogProductAttribute');
const {
  mirrorCatalogAttributes,
  attributesFromNormalizedDoc,
  unsetLegacyCatalogProductAttributeFields,
} = require('../../utils/catalogAttributesMirror');

async function main() {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) throw new Error('MONGO_URL is required');
  await mongoose.connect(mongoUrl);
  console.log('[attr-cleanup] connected');

  const legacyUnset = unsetLegacyCatalogProductAttributeFields();
  let scanned = 0;
  let updated = 0;

  const cursor = CatalogProductAttribute.find({}).lean().cursor();

  for await (const doc of cursor) {
    scanned += 1;
    const merged = attributesFromNormalizedDoc(doc);
    const plain = merged ? mirrorCatalogAttributes(merged) : mirrorCatalogAttributes(doc.attributes || {});

    const res = await CatalogProductAttribute.updateOne(
      { _id: doc._id },
      {
        $set: { attributes: plain },
        $unset: legacyUnset,
      },
    );
    if (res.modifiedCount > 0) updated += 1;

    if (scanned % 500 === 0) {
      console.log(`[attr-cleanup] scanned=${scanned} updated=${updated}`);
    }
  }

  console.log(`[attr-cleanup] done scanned=${scanned} modified=${updated}`);
  await mongoose.disconnect();
  console.log('[attr-cleanup] disconnected');
}

main().catch((err) => {
  console.error('[attr-cleanup] failed', err);
  process.exitCode = 1;
});
