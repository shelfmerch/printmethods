// One-time migration script.
// Fix: backfill ShopifyOrder.myshopifyDomain and merchantId for historical data
// so that the super admin Shopify Orders dashboard can always resolve merchant names
// even if merchants were recreated after uninstall/reinstall.

const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const ShopifyOrder = require('../models/ShopifyOrder');
const ShopifyStore = require('../models/ShopifyStore');

async function run() {
  const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI;
  if (!mongoUrl) {
    console.error('Missing MONGO_URL / MONGODB_URI in environment');
    process.exit(1);
  }

  await mongoose.connect(mongoUrl);
  console.log('[Backfill] Connected to MongoDB');

  let updatedDomainOnly = 0;
  let updatedMerchant = 0;

  // Stream through orders so we don't load everything into memory at once.
  const cursor = ShopifyOrder.find({}).cursor();

  for await (const order of cursor) {
    let changed = false;

    // 1) Ensure myshopifyDomain is always set from the stored shop field.
    if (!order.myshopifyDomain && order.shop) {
      order.myshopifyDomain = order.shop.toLowerCase();
      changed = true;
      updatedDomainOnly++;
    }

    // 2) If merchantId is missing, try to resolve it from ShopifyStore
    // using the permanent myshopifyDomain/shop value.
    if (!order.merchantId && order.shop) {
      const shopDomain = order.myshopifyDomain || order.shop.toLowerCase();
      const store = await ShopifyStore.findOne({
        shop: shopDomain,
        merchantId: { $exists: true, $ne: null },
      }).select('merchantId shop');

      if (store && store.merchantId) {
        order.merchantId = store.merchantId;
        changed = true;
        updatedMerchant++;
      }
    }

    if (changed) {
      await order.save();
    }
  }

  console.log('[Backfill] Completed');
  console.log('[Backfill] Orders with myshopifyDomain set/updated:', updatedDomainOnly);
  console.log('[Backfill] Orders with merchantId backfilled from ShopifyStore:', updatedMerchant);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('[Backfill] Fatal error:', err);
  process.exit(1);
});

