import mongoose from 'mongoose';

const MONGO_URI = 'mongodb+srv://shelfmerchcom_db_user:Karaoke%400313@shelfmerch.6uk2ux2.mongodb.net/shelfmerch_mouaz';

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Successfully connected to the database!");
    
    const db = mongoose.connection.db;
    
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`);
    
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`- ${col.name}: ${count} documents`);
      
      if (col.name === 'stores' && count > 0) {
        console.log("  Fetching 5 most recent from stores:");
        const docs = await db.collection('stores').find({}).sort({createdAt: -1}).limit(5).toArray();
        docs.forEach(s => {
          console.log(`    > ID: ${s._id} | Name: ${s.name} | Access: ${s.accessMode || 'N/A'}`);
          if (s.brandProfile) console.log(`      BrandProfile: ${JSON.stringify(s.brandProfile)}`);
        });
      }
    }

  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

main();
