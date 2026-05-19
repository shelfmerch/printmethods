/**
 * Drop MongoDB collections used by the removed public API (OpenAPI / PAT / OAuth / webhooks).
 * Run: node scripts/migrations/drop-public-api-collections.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const COLLECTIONS = [
  'apikeys',
  'apiclients',
  'oauthtokens',
  'apiusagelogs',
  'webhooksubscriptions',
  'webhookdeliveries',
  'subscriptionplans',
];

async function run() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL;
  if (!uri) {
    throw new Error('Set MONGODB_URI, MONGO_URI, or MONGO_URL');
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  for (const name of COLLECTIONS) {
    try {
      const exists = (await db.listCollections({ name }).toArray()).length > 0;
      if (!exists) {
        console.log(`Skip (missing): ${name}`);
        continue;
      }
      await db.dropCollection(name);
      console.log(`Dropped: ${name}`);
    } catch (err) {
      console.warn(`Failed to drop ${name}:`, err.message);
    }
  }

  await mongoose.disconnect();
  console.log('Public API collections cleanup finished.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
