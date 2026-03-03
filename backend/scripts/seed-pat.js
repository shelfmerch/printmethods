#!/usr/bin/env node
/**
 * Seed a Personal Access Token (PAT) for a user.
 *
 * Usage:
 *   node scripts/seed-pat.js --email user@example.com --name "Phase1 PAT"
 *   node scripts/seed-pat.js --userId 64f... --name "Phase1 PAT" --scopes "shops.read,orders.read" --plan starter
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const apiKeyService = require('../public-api/services/apiKeyService');
const { ALL_SCOPES } = require('../public-api/core/constants');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function printUsageAndExit(message) {
  if (message) console.error(`Error: ${message}`);
  console.error('Usage: node scripts/seed-pat.js (--email <email> | --userId <id>) --name <name> [--scopes "a,b,c"] [--plan <planCode>]');
  process.exit(1);
}

async function connectDb() {
  const mongoUrl = process.env.MONGO_URL;
  const dbName = process.env.DB_NAME;

  if (!mongoUrl) {
    throw new Error('MONGO_URL is required in environment.');
  }

  const connectionString = dbName
    ? `${mongoUrl}/${dbName}?retryWrites=true&w=majority`
    : `${mongoUrl}?retryWrites=true&w=majority`;

  await mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const email = args.email ? String(args.email).trim().toLowerCase() : '';
  const userId = args.userId ? String(args.userId).trim() : '';
  const name = args.name ? String(args.name).trim() : '';
  const planCode = args.plan ? String(args.plan).trim() : 'free';
  const scopes = args.scopes
    ? String(args.scopes).split(',').map((s) => s.trim()).filter(Boolean)
    : ALL_SCOPES;

  if (!name) {
    printUsageAndExit('--name is required');
  }
  if (!email && !userId) {
    printUsageAndExit('Provide either --email or --userId');
  }

  await connectDb();

  const query = email ? { email } : { _id: userId };
  const user = await User.findOne(query).select('_id email isActive');
  if (!user) {
    throw new Error('User not found');
  }
  if (!user.isActive) {
    throw new Error('User is inactive');
  }

  const result = await apiKeyService.createApiKey({
    userId: user._id,
    name,
    scopes,
    planCode,
    type: 'personal_access_token',
  });

  console.log('PAT created successfully.');
  console.log(`User: ${user.email || user._id.toString()}`);
  console.log(`Name: ${result.name}`);
  console.log(`Plan: ${planCode}`);
  console.log(`Scopes: ${result.scopes.join(', ')}`);
  console.log(`PAT: ${result.key}`);
  console.log('Store this token securely. It is shown only once.');
}

run()
  .catch((error) => {
    console.error('Failed to seed PAT:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.connection.close();
    } catch (err) {
      // no-op
    }
  });
