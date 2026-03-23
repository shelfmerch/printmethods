const mongoose  = require('mongoose');
require('dotenv').config();
const CatalogProduct        = require('../../models/CatalogProduct');
const CatalogProductVariant = require('../../models/CatalogProductVariant');
const { populateViewImages } = require('../../utils/populateViewImages');

async function migrate() {
  const mongoUrl = process.env.MONGO_URL;
  const dbName   = process.env.DB_NAME;

  if (!mongoUrl) {
    console.error('Error: MONGO_URL environment variable is not set.');
    process.exit(1);
  }

  const connectionString = dbName
    ? `${mongoUrl}/${dbName}?retryWrites=true&w=majority`
    : `${mongoUrl}?retryWrites=true&w=majority`;

  await mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Get all variants with at least one empty viewImage slot
  const variants = await CatalogProductVariant.find({
    $or: [
      { 'viewImages.front': { $in: [null, ''] } },
      { 'viewImages.back':  { $in: [null, ''] } },
      { 'viewImages.left':  { $in: [null, ''] } },
      { 'viewImages.right': { $in: [null, ''] } },
    ],
  });

  console.log(`Found ${variants.length} variants with empty viewImages`);

  // Group by catalogProductId to minimize DB reads
  const productMap = {};

  for (const variant of variants) {
    const pid = variant.catalogProductId.toString();

    if (!productMap[pid]) {
      productMap[pid] = await CatalogProduct.findById(pid)
        .select('name design.sampleMockups')
        .lean();
    }

    const catalogProduct = productMap[pid];
    if (!catalogProduct) {
      console.warn(`  Skipping variant ${variant._id} — catalog product not found`);
      continue;
    }

    const before = { ...variant.viewImages.toObject?.() ?? variant.viewImages };
    populateViewImages(variant, catalogProduct);
    const after = variant.viewImages;

    // Only save if something actually changed
    const changed = ['front', 'back', 'left', 'right'].some(
      v => before[v] !== after[v]
    );

    if (changed) {
      await variant.save();
      console.log(
        `  Updated: ${catalogProduct.name} — ${variant.color} ${variant.size}`
      );
    }
  }

  console.log('Migration complete.');
  await mongoose.disconnect();
}

migrate().catch(console.error);
