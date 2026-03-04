const express = require('express');
const router = express.Router();
const ShopifyOrder = require('../models/ShopifyOrder');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/admin/shopify-orders
 * @desc    List Shopify orders (ShopifyOrder collection only)
 * @access  Private (Superadmin)
 */
router.get('/', protect, authorize('superadmin'), async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const rawLimit = parseInt(req.query.limit) || 25;
    const limit = Math.min(Math.max(rawLimit, 1), 100);
    const shop = req.query.shop ? String(req.query.shop).toLowerCase() : '';
    const search = req.query.search || req.query.q || '';

    const financialStatusParam = req.query.financialStatus || req.query.financial_status;
    const fulfillmentStatusParam = req.query.fulfillmentStatus || req.query.fulfillment_status;

    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom) : null;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo) : null;

    const filter = {};
    const andConditions = [];

    if (shop) {
      filter.shop = shop;
    }

    if (financialStatusParam) {
      andConditions.push({
        $or: [
          { financialStatus: financialStatusParam },
          { 'raw.financial_status': financialStatusParam },
        ],
      });
    }

    if (fulfillmentStatusParam) {
      andConditions.push({
        $or: [
          { fulfillmentStatus: fulfillmentStatusParam },
          { 'raw.fulfillment_status': fulfillmentStatusParam },
        ],
      });
    }

    if (dateFrom || dateTo) {
      const range = {};
      if (dateFrom) range.$gte = dateFrom;
      if (dateTo) range.$lte = dateTo;
      andConditions.push({
        $or: [
          { createdAtShopify: range },
          { createdAt: range },
        ],
      });
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      andConditions.push({
        $or: [
          { shopifyOrderId: searchRegex },
          { customerEmail: searchRegex },
          { 'raw.email': searchRegex },
          { 'raw.customer.email': searchRegex },
        ],
      });
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    const skip = (page - 1) * limit;

    const total = await ShopifyOrder.countDocuments(filter);
    const pages = Math.max(Math.ceil(total / limit), 1);

    const docs = await ShopifyOrder.find(filter)
      .sort({ createdAtShopify: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const orders = docs.map((doc) => {
      const raw = doc.raw || {};

      const customerEmail =
        doc.customerEmail ||
        raw.email ||
        (raw.customer && raw.customer.email) ||
        null;

      let itemsCount = 0;
      if (Array.isArray(raw.line_items)) {
        itemsCount = raw.line_items.reduce(
          (sum, li) => sum + (Number(li.quantity) || 0),
          0
        );
      } else if (Array.isArray(doc.line_items)) {
        itemsCount = doc.line_items.length;
      }

      const totalPrice =
        doc.totalPrice ||
        raw.total_price ||
        raw.current_total_price ||
        null;

      const currency =
        doc.currency ||
        raw.currency ||
        raw.presentment_currency ||
        null;

      const financialStatus =
        doc.financialStatus ||
        raw.financial_status ||
        null;

      const fulfillmentStatus =
        doc.fulfillmentStatus ||
        raw.fulfillment_status ||
        null;

      return {
        _id: doc._id,
        shop: doc.shop,
        shopifyOrderId: doc.shopifyOrderId,
        createdAtShopify: doc.createdAtShopify || doc.createdAt,
        updatedAtShopify: doc.updatedAtShopify || doc.updatedAt,
        customerEmail,
        itemsCount,
        totalPrice,
        currency,
        financialStatus,
        fulfillmentStatus,
        raw,
      };
    });

    return res.json({
      success: true,
      page,
      limit,
      total,
      pages,
      orders,
    });
  } catch (error) {
    console.error('[AdminShopifyOrders] Error listing orders:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to list Shopify orders' });
  }
});

/**
 * @route   GET /api/admin/shopify-orders/:shopifyOrderId
 * @desc    Get single Shopify order detail
 * @access  Private (Superadmin)
 */
router.get('/:shopifyOrderId', protect, authorize('superadmin'), async (req, res) => {
  try {
    const { shopifyOrderId } = req.params;
    const order = await ShopifyOrder.findOne({ shopifyOrderId }).lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.json({ success: true, data: order });
  } catch (error) {
    console.error('[AdminShopifyOrders] Error fetching order detail:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch order details' });
  }
});

/**
 * @route   GET /api/admin/shopify-orders/debug/orders/count
 * @desc    Debug helper to see order stats
 * @access  Private (Superadmin)
 */
router.get('/debug/orders/count', protect, authorize('superadmin'), async (req, res) => {
  try {
    const total = await ShopifyOrder.countDocuments({});
    const latest = await ShopifyOrder.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('shopifyOrderId orderName createdAt')
      .lean();

    return res.json({
      success: true,
      total,
      latest
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
