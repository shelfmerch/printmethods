const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

function getMongoConnectionString() {
  const mongoUrl = process.env.MONGO_URL;
  const dbName = process.env.DB_NAME;

  if (!mongoUrl) {
    throw new Error('MONGO_URL environment variable is not set');
  }

  return dbName
    ? `${mongoUrl}/${dbName}?retryWrites=true&w=majority`
    : `${mongoUrl}?retryWrites=true&w=majority`;
}

async function getIndexNames(model) {
  const idx = await model.collection.indexes();
  return new Set(idx.map((i) => i.name));
}

async function ensureModelIndexes(model, { verbose }) {
  const before = await getIndexNames(model);

  // createIndexes() creates missing indexes declared in schema; it does NOT drop extras.
  await model.createIndexes();

  const after = await getIndexNames(model);

  const created = [...after].filter((name) => !before.has(name));
  const existing = [...after].filter((name) => before.has(name));

  console.log(`\n${model.modelName}:`);
  if (created.length) console.log(`  created:  ${created.join(', ')}`);
  else console.log('  created:  (none)');

  if (verbose) {
    console.log(`  existing: ${existing.join(', ')}`);
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const verbose = args.has('--verbose') || args.has('-v');
  const all = args.has('--all');

  const connectionString = getMongoConnectionString();

  console.log('Connecting to MongoDB...');
  await mongoose.connect(connectionString);
  console.log('Connected.');

  // Default scope = the models most relevant to catalog/store-product flows.
  // Use --all to run across every model in backend/models.
  const defaultModels = [
    require('../models/StoreProduct'),
    require('../models/StoreProductVariant'),
    require('../models/CatalogProduct'),
    require('../models/CatalogProductVariant'),
  ];

  if (!all) {
    for (const m of defaultModels) {
      // eslint-disable-next-line no-await-in-loop
      await ensureModelIndexes(m, { verbose });
    }
  } else {
    const fs = require('fs');
    const modelsDir = path.join(__dirname, '../models');
    const modelFiles = fs
      .readdirSync(modelsDir)
      .filter((f) => f.endsWith('.js'))
      .sort((a, b) => a.localeCompare(b));

    for (const file of modelFiles) {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const model = require(path.join(modelsDir, file));
      // eslint-disable-next-line no-await-in-loop
      await ensureModelIndexes(model, { verbose });
    }
  }

  await mongoose.connection.close();
  console.log('\nDone.');
  process.exit(0);
}

main().catch(async (err) => {
  console.error('ensure-indexes failed:', err);
  try {
    await mongoose.connection.close();
  } catch {
    // ignore
  }
  process.exit(1);
});

