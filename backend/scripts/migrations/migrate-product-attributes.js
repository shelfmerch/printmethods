/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');

const CatalogProduct = require('../../models/CatalogProduct');
const CatalogProductAttribute = require('../../models/CatalogProductAttribute');

/**
 * Non-destructive, idempotent migration:
 * - CatalogProduct.attributes -> catalogproductattributes (1:1)
 *
 * Does NOT remove embedded CatalogProduct.attributes.
 */

const FIELDS = ['material', 'gsm', 'hoodType', 'pocketStyle', 'fit', 'gender', 'brand'];

function pickAttributes(attrs) {
  if (!attrs || typeof attrs !== 'object') return null;
  const out = {};
  let any = false;
  for (const k of FIELDS) {
    const v = attrs[k];
    if (v !== undefined && v !== null && v !== '') {
      out[k] = String(v);
      any = true;
    } else {
      out[k] = '';
    }
  }
  return any ? out : out; // keep consistent keys even if empty
}

async function main() {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) throw new Error('MONGO_URL is required');
  await mongoose.connect(mongoUrl);
  console.log('[attr-migrate] connected');

  const cursor = CatalogProduct.find({}, { attributes: 1, createdAt: 1, updatedAt: 1 })
    .lean()
    .cursor();

  let scanned = 0;
  let ops = 0;
  const bulk = [];

  const flush = async () => {
    if (!bulk.length) return;
    const res = await CatalogProductAttribute.bulkWrite(bulk, { ordered: false });
    ops += (res.upsertedCount || 0) + (res.modifiedCount || 0);
    bulk.length = 0;
  };

  for await (const p of cursor) {
    scanned += 1;
    const productId = p._id;

    // CatalogProduct.attributes may be a Map or plain object in lean() output
    const attrs = p.attributes && typeof p.attributes === 'object' ? p.attributes : null;
    if (!attrs) continue;

    const picked = pickAttributes(attrs);
    if (!picked) continue;

    bulk.push({
      updateOne: {
        filter: { productId },
        update: {
          $setOnInsert: {
            productId,
            createdAt: p.createdAt,
          },
          $set: {
            ...picked,
            updatedAt: p.updatedAt,
          },
        },
        upsert: true,
      },
    });

    if (bulk.length >= 1000) {
      await flush();
      console.log(`[attr-migrate] scanned=${scanned} ops=${ops}`);
    }
  }

  await flush();
  console.log(`[attr-migrate] done scanned=${scanned} ops=${ops}`);
  await mongoose.disconnect();
  console.log('[attr-migrate] disconnected');
}

main().catch((err) => {
  console.error('[attr-migrate] failed', err);
  process.exitCode = 1;
});

