require('dotenv').config();
const mongoose = require('mongoose');
const CareIcon = require('./models/CareIcon');

const checkIcons = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    const dbName = process.env.DB_NAME;
    const connectionString = dbName ? `${mongoUrl}/${dbName}` : mongoUrl;
    
    await mongoose.connect(connectionString);
    console.log('Connected to MongoDB');

    const icons = await CareIcon.find();
    console.log('Total icons in DB:', icons.length);
    icons.forEach(icon => {
      console.log(`- ${icon.iconKey}: ${icon.label} (${icon.type})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error checking icons:', error);
    process.exit(1);
  }
};

checkIcons();
