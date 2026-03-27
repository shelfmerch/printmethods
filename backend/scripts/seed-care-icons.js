require('dotenv').config();
const mongoose = require('mongoose');
const CareIcon = require('../models/CareIcon');

const predefinedIcons = [
  { key: 'wash-cold', label: 'Wash Cold' },
  { key: 'wash-warm', label: 'Wash Warm' },
  { key: 'no-wash', label: 'Do Not Wash' },
  { key: 'no-bleach', label: 'Do Not Bleach' },
  { key: 'no-iron', label: 'Do Not Iron' },
  { key: 'no-dry-clean', label: 'Do Not Dry Clean' },
  { key: 'tumble-dry-normal', label: 'Tumble Dry Normal' },
  { key: 'tumble-dry-medium', label: 'Tumble Dry Medium' },
];

const seedCareIcons = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    const dbName = process.env.DB_NAME;
    const connectionString = dbName ? `${mongoUrl}/${dbName}` : mongoUrl;
    
    await mongoose.connect(connectionString);
    console.log('Connected to MongoDB');

    for (const icon of predefinedIcons) {
      // We use a placeholder URL for now, the frontend will map the key to the local SVG
      // until the admin uploads a custom one or we replace these with S3 URLs.
      const url = `(predefined-${icon.key})`; 
      
      await CareIcon.findOneAndUpdate(
        { iconKey: icon.key },
        {
          iconKey: icon.key,
          label: icon.label,
          url: url,
          type: 'predefined'
        },
        { upsert: true, new: true }
      );
      console.log(`Seeded icon: ${icon.key}`);
    }

    console.log('All icons seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding icons:', error);
    process.exit(1);
  }
};

seedCareIcons();
