/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');

const CatalogProduct = require('../../models/CatalogProduct');
const CatalogProductMockup = require('../../models/CatalogProductMockup');
const CatalogProductInventory = require('../../models/CatalogProductInventory');

/**
 * Non-destructive extraction migration:
 * - design.sampleMockups -> catalogproductmockups
 * - stocks              -> catalogproductinventories
 *
 * Idempotent strategy:
 * - mockups: upsert by { productId, colorKey, viewKey }
 * - inventory: upsert by { productId } (unique)
 *
 * Old embedded fields are NOT deleted.
 */

async function main() {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    throw new Error('MONGO_URL is required');
  }

  await mongoose.connect(mongoUrl);
  console.log('[extract] connected');

  const cursor = CatalogProduct.find({}, { design: 1, stocks: 1 })
    .lean()
    .cursor();

  let scanned = 0;
  let mockupOps = 0;
  let invOps = 0;

  const bulkMockups = [];
  const bulkInventories = [];

  const flush = async () => {
    if (bulkMockups.length) {
      const res = await CatalogProductMockup.bulkWrite(bulkMockups, { ordered: false });
      mockupOps += (res.upsertedCount || 0) + (res.modifiedCount || 0);
      bulkMockups.length = 0;
    }
    if (bulkInventories.length) {
      const res = await CatalogProductInventory.bulkWrite(bulkInventories, { ordered: false });
      invOps += (res.upsertedCount || 0) + (res.modifiedCount || 0);
      bulkInventories.length = 0;
    }
  };

  for await (const product of cursor) {
    scanned += 1;
    const productId = product._id;

    const sampleMockups = product?.design?.sampleMockups;
    if (Array.isArray(sampleMockups) && sampleMockups.length) {
      for (const m of sampleMockups) {
        if (!m || !m.viewKey || !m.imageUrl) continue;
        const colorKey = m.colorKey || '';

        bulkMockups.push({
          updateOne: {
            filter: { productId, colorKey, viewKey: m.viewKey },
            update: {
              $setOnInsert: { productId, colorKey, viewKey: m.viewKey },
              $set: {
                imageUrl: m.imageUrl,
                placeholders: Array.isArray(m.placeholders) ? m.placeholders : [],
                displacementSettings: m.displacementSettings || undefined,
                metadata: m.metadata || undefined,
              },
            },
            upsert: true,
          },
        });
      }
    }

    const stocks = product?.stocks || {};
    // Only create inventory doc if there's at least one meaningful field present,
    // otherwise we keep it absent (read layer can default values).
    const hasAnyStockData =
      stocks &&
      Object.keys(stocks).some((k) => stocks[k] !== undefined && stocks[k] !== null && stocks[k] !== '');

    if (hasAnyStockData) {
      bulkInventories.push({
        updateOne: {
          filter: { productId },
          update: {
            $setOnInsert: { productId },
            $set: {
              currentStock: stocks.currentStock ?? null,
              minimumQuantity: stocks.minimumQuantity ?? 1,
              stockLocation: stocks.stockLocation ?? '',
              lowStockAlertEnabled: stocks.lowStockAlertEnabled ?? false,
              lowStockAlertEmail: stocks.lowStockAlertEmail ?? '',
              lowStockThreshold: stocks.lowStockThreshold ?? 10,
              outOfStockBehavior: stocks.outOfStockBehavior ?? 'default',
              // new fields default-safe
              reservedStock: 0,
              incomingStock: 0,
            },
          },
          upsert: true,
        },
      });
    }

    if (bulkMockups.length >= 1000 || bulkInventories.length >= 500) {
      await flush();
      console.log(`[extract] scanned=${scanned} mockupOps=${mockupOps} invOps=${invOps}`);
    }
  }

  await flush();
  console.log(`[extract] done scanned=${scanned} mockupOps=${mockupOps} invOps=${invOps}`);

  await mongoose.disconnect();
  console.log('[extract] disconnected');
}

main().catch((err) => {
  console.error('[extract] failed', err);
  process.exitCode = 1;
});

