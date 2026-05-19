/**
 * One-time migration: remove isEmailVerified and isPhoneVerified from all
 * User documents. Under the new architecture, a stored email/phone IS a
 * verified email/phone — booleans are redundant.
 *
 * Usage:
 *   node backend/scripts/remove-verification-flags.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const result = await mongoose.connection.collection('users').updateMany(
    {},
    { $unset: { isEmailVerified: '', isPhoneVerified: '' } }
  );

  console.log(`Done. Modified ${result.modifiedCount} user documents.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
