const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '../.env' });

async function test() {
  console.log('Testing native MongoDB driver connection...');
  const client = new MongoClient(process.env.MONGO_URL);
  try {
    await client.connect();
    console.log('✅ Connected!');
    await client.close();
    console.log('✅ Disconnected!');
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

test();
