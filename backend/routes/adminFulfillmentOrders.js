const express = require('express');
const router = express.Router();
const FulfillmentOrder = require('../models/FulfillmentOrder');
const ShopifyOrder = require('../models/ShopifyOrder');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   POST /api/admin/fulfillment-orders
 * @desc    Queue a fulfillment job for a Shopify order (superadmin only)
 * @access  Private (Superadmin)
 */
router.post('/', protect, authorize('superadmin'), async (req, res) => {
  try {
    const { shop, shopifyOrderId } = req.body || {};

    if (!shop || !shopifyOrderId) {
      return res.status(400).json({
        success: false,
        message: 'shop and shopifyOrderId are required',
      });
    }

    const normalizedShop = String(shop).toLowerCase();
    const normalizedOrderId = String(shopifyOrderId);

    const sourceOrder = await ShopifyOrder.findOne({
      shop: normalizedShop,
      shopifyOrderId: normalizedOrderId,
    }).lean();

    if (!sourceOrder) {
      return res.status(404).json({
        success: false,
        message: 'Shopify order not found',
      });
    }

    // Idempotent: return existing fulfillment order if present
    let fulfillment = await FulfillmentOrder.findOne({
      shop: normalizedShop,
      shopifyOrderId: normalizedOrderId,
    });

    if (!fulfillment) {
      fulfillment = await FulfillmentOrder.create({
        shop: normalizedShop,
        shopifyOrderId: normalizedOrderId,
        merchantId: sourceOrder.merchantId || null,
        status: 'queued',
      });
    }

    return res.json({
      success: true,
      fulfillmentOrder: fulfillment,
    });
  } catch (error) {
    console.error('[AdminFulfillmentOrders] Error creating fulfillment order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create fulfillment order',
    });
  }
});

module.exports = router;

