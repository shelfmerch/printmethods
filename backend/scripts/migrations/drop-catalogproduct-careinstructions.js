/**
 * Merge any remaining catalogproductcareinstructions into catalogproducts.careInstructions,
 * then drop the side collection.
 *
 * Run: node scripts/migrations/drop-catalogproduct-careinstructions.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const CatalogProduct = require('../../models/CatalogProduct');
const { toCatalogCareInstructionsRefs } = require('../../utils/careInstructionsRefs');

async function run() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL;
  if (!uri) {
    throw new Error('Set MONGODB_URI, MONGO_URI, or MONGO_URL');
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const side = db.collection('catalogproductcareinstructions');

  const sideDocs = await side.find({}).toArray();
  let merged = 0;

  for (const doc of sideDocs) {
    const productId = doc.productId;
    if (!productId) continue;

    const product = await CatalogProduct.findById(productId).select('careInstructions').lean();
    const embedded = product?.careInstructions;
    const hasEmbedded =
      embedded &&
      typeof embedded === 'object' &&
      ((typeof embedded.text === 'string' && embedded.text.trim() !== '') ||
        (Array.isArray(embedded.icons) && embedded.icons.length > 0));

    if (!hasEmbedded) {
      const refs = await toCatalogCareInstructionsRefs({
        text: doc.text || '',
        icons: doc.icons || [],
      });
      await CatalogProduct.updateOne({ _id: productId }, { $set: { careInstructions: refs } });
      merged += 1;
    }
  }

  console.log('Merged from side collection into catalogproducts:', merged);

  try {
    await side.drop();
    console.log('Dropped collection catalogproductcareinstructions');
  } catch (err) {
    if (err?.codeName === 'NamespaceNotFound') {
      console.log('Collection catalogproductcareinstructions already absent');
    } else {
      throw err;
    }
  }

  await mongoose.disconnect();
  console.log('Catalog product care instructions cleanup finished.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
