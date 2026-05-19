/**
 * Backfill ObjectId refs on catalogproducts:
 *   shipping.inventoryId, attributeId, mockupIds[]
 *
 * Run: node scripts/migrations/backfill-catalogproduct-relation-refs.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { syncCatalogProductRelationRefs } = require('../../utils/catalogProductRefs');

async function run() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL;
  if (!uri) {
    throw new Error('Set MONGODB_URI, MONGO_URI, or MONGO_URL');
  }

  await mongoose.connect(uri);
  const collection = mongoose.connection.collection('catalogproducts');
  const products = await collection.find({}, { projection: { _id: 1 } }).toArray();

  let updated = 0;
  for (const row of products) {
    await syncCatalogProductRelationRefs(row._id);
    updated += 1;
  }

  const withInventoryRef = await collection.countDocuments({
    'shipping.inventoryId': { $exists: true, $ne: null },
  });
  const withAttributeRef = await collection.countDocuments({
    attributeId: { $exists: true, $ne: null },
  });
  const withMockupRefs = await collection.countDocuments({
    mockupIds: { $exists: true, $not: { $size: 0 } },
  });

  console.log('Products processed:', updated);
  console.log('With shipping.inventoryId:', withInventoryRef);
  console.log('With attributeId:', withAttributeRef);
  console.log('With mockupIds:', withMockupRefs);

  await mongoose.disconnect();
  console.log('Catalog product relation ref backfill finished.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
