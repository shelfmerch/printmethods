/**
 * One-time backfill: for every store, add its _id into the merchant user's
 * assignedStores array. Uses $addToSet so existing entries are never duplicated.
 *
 * Usage:
 *   node backend/scripts/backfill-assigned-stores.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const Store = require('../models/Store');
const User = require('../models/User');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const stores = await Store.find({}, '_id merchant').lean();
  console.log(`Found ${stores.length} stores to process`);

  let updated = 0;
  for (const store of stores) {
    if (!store.merchant) continue;
    const result = await User.findByIdAndUpdate(
      store.merchant,
      { $addToSet: { assignedStores: store._id } },
      { new: false }
    );
    if (result) updated++;
  }

  console.log(`Done. Updated ${updated} merchant user documents.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
