const express = require('express');
const router = express.Router();
const { verifyShopifyWebhook } = require('../utils/shopifyUtils');

/**
 * Shared handler logic for Shopify GDPR webhooks.
 * Expects req.body to be a Buffer (set by express.raw middleware).
 */
const handleGdprWebhook = (topicLabel) => async (req, res) => {
  const hmacHeader = req.get('x-shopify-hmac-sha256');
  const shopDomain = (req.get('x-shopify-shop-domain') || '').toLowerCase();
  const rawBody = req.body;

  try {
    if (!Buffer.isBuffer(rawBody)) {
      console.error('[GDPR WEBHOOK ERROR] req.body is not Buffer. Check express.raw() middleware order.', {
        topic: topicLabel,
        shopDomain,
        bodyType: typeof rawBody,
      });
      return res.status(500).send('Webhook misconfigured');
    }

    const secret = process.env.SHOPIFY_WEBHOOK_SECRET || process.env.SHOPIFY_API_SECRET;
    if (!verifyShopifyWebhook(rawBody, hmacHeader, secret)) {
      console.error('[GDPR WEBHOOK HMAC FAIL]', { topic: topicLabel, shopDomain });
      return res.status(401).send('Invalid signature');
    }

    const payload = JSON.parse(rawBody.toString('utf8'));

    // For compliance staging: log-only, no destructive actions.
    console.log('[Shopify GDPR Webhook]', {
      topic: topicLabel,
      shop: shopDomain,
      payload,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[GDPR WEBHOOK ERROR]', {
      topic: topicLabel,
      shopDomain,
      message: err.message,
    });
    // For robustness, still return 200 so Shopify considers it delivered.
    return res.status(200).json({ ok: false, error: err.message });
  }
};

// Concrete handlers so logic can be reused by base route
const customersDataRequestHandler = handleGdprWebhook('customers/data_request');
const customersRedactHandler = handleGdprWebhook('customers/redact');
const shopRedactHandler = handleGdprWebhook('shop/redact');

// POST /api/shopify/gdpr/customers-data-request
router.post('/customers-data-request', customersDataRequestHandler);

// POST /api/shopify/gdpr/customers-redact
router.post('/customers-redact', customersRedactHandler);

// POST /api/shopify/gdpr/shop-redact
router.post('/shop-redact', shopRedactHandler);

// POST /api/shopify/gdpr
// Base GDPR endpoint used in shopify.app.toml
router.post('/', async (req, res) => {
  const topic = (req.get('x-shopify-topic') || '').toLowerCase();

  if (topic === 'customers/data_request') {
    return customersDataRequestHandler(req, res);
  }

  if (topic === 'customers/redact') {
    return customersRedactHandler(req, res);
  }

  if (topic === 'shop/redact') {
    return shopRedactHandler(req, res);
  }

  console.warn('[GDPR WEBHOOK UNKNOWN TOPIC]', {
    topic,
    path: req.originalUrl,
  });

  // Acknowledge unknown topics with 200 to avoid retries, but signal not handled.
  return res.status(200).json({ ok: false, reason: 'unsupported_topic', topic });
});

module.exports = router;

