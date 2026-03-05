const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function test() {
  console.log('Testing minimal connection...');
  console.log('URL:', process.env.MONGO_URL?.substring(0, 20) + '...');
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected!');
    await mongoose.disconnect();
    console.log('✅ Disconnected!');
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

test();
