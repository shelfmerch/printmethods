/* eslint-disable no-console */
/**
 * Converts catalogproductvariants.viewImages from legacy URL strings
 * to ObjectId refs on catalogproductmockups.
 *
 * Run after extract-catalogproduct-mockups-inventory.js so mockups exist.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const CatalogProductVariant = require('../../models/CatalogProductVariant');
const { VIEW_KEYS, isUrlString, resolveViewImagesToMockupIds } = require('../../utils/viewImagesRef');
const { populateViewImages } = require('../../utils/populateViewImages');

async function migrate() {
  const mongoUrl = process.env.MONGO_URL;
  const dbName = process.env.DB_NAME;

  if (!mongoUrl) {
    console.error('MONGO_URL is required');
    process.exit(1);
  }

  const connectionString = dbName
    ? `${mongoUrl}/${dbName}?retryWrites=true&w=majority`
    : `${mongoUrl}?retryWrites=true&w=majority`;

  await mongoose.connect(connectionString);
  console.log('[viewimages-refs] connected');

  const variants = await CatalogProductVariant.find({});
  console.log(`[viewimages-refs] scanning ${variants.length} variants`);

  let updated = 0;
  let skipped = 0;

  for (const variant of variants) {
    const vi = variant.viewImages;
    if (!vi) {
      skipped += 1;
      continue;
    }

    const hasUrl = VIEW_KEYS.some((k) => isUrlString(vi[k]));
    const hasOnlyRefs = VIEW_KEYS.every((k) => {
      const slot = vi[k];
      return slot == null || slot === '' || mongoose.Types.ObjectId.isValid(slot);
    });

    if (!hasUrl && hasOnlyRefs) {
      const emptySlots = VIEW_KEYS.filter((k) => !vi[k]);
      if (emptySlots.length === 0) {
        skipped += 1;
        continue;
      }
      await populateViewImages(variant, variant.catalogProductId);
      const filled = emptySlots.some((k) => variant.viewImages?.[k]);
      if (filled) {
        await variant.save();
        updated += 1;
        console.log(`  filled empty slots: ${variant._id} (${variant.color} ${variant.size})`);
      } else {
        skipped += 1;
      }
      continue;
    }

    if (hasUrl) {
      const resolved = await resolveViewImagesToMockupIds(
        Object.fromEntries(VIEW_KEYS.map((k) => [k, vi[k]])),
        { catalogProductId: variant.catalogProductId, color: variant.color }
      );
      variant.viewImages = resolved;
      await variant.save();
      updated += 1;
      console.log(`  url -> ref: ${variant._id} (${variant.color} ${variant.size})`);
      continue;
    }

    skipped += 1;
  }

  console.log(`[viewimages-refs] done updated=${updated} skipped=${skipped}`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('[viewimages-refs] failed', err);
  process.exitCode = 1;
});
