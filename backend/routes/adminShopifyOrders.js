const express = require('express');
const router = express.Router();
const ShopifyOrder = require('../models/ShopifyOrder');
const ShopifyStore = require('../models/ShopifyStore');
const User = require('../models/User');
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

    // Fix: some historical orders lost merchantId when merchants were recreated.
    // We now always store the permanent myshopifyDomain (or shop) on orders and
    // fall back to resolving the merchant through ShopifyStore when needed.

    // 1) Collect unique shops present in this page of orders.
    const shops = Array.from(
      new Set(
        docs
          .map((doc) => (doc.myshopifyDomain || doc.shop || '').toLowerCase())
          .filter(Boolean)
      )
    );

    // 2) Load ShopifyStore records to get merchantId by shop domain.
    const stores = shops.length
      ? await ShopifyStore.find({ shop: { $in: shops } })
          .select('shop merchantId')
          .lean()
      : [];

    const merchantIdByShop = new Map(
      stores
        .filter((s) => s.merchantId)
        .map((s) => [String(s.shop).toLowerCase(), String(s.merchantId)])
    );

    // 3) Collect all merchantIds needed: direct on order or via store fallback.
    const merchantIds = Array.from(
      new Set(
        docs
          .map((doc) => {
            const direct = doc.merchantId ? String(doc.merchantId) : null;
            if (direct) return direct;
            const key = (doc.myshopifyDomain || doc.shop || '').toLowerCase();
            return merchantIdByShop.get(key) || null;
          })
          .filter((id) => !!id)
      )
    );

    const merchants = merchantIds.length
      ? await User.find({ _id: { $in: merchantIds } })
          .select('name')
          .lean()
      : [];

    const merchantNameById = new Map(
      merchants.map((m) => [String(m._id), m.name || ''])
    );

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

      const shopDomain = (doc.myshopifyDomain || doc.shop || '').toLowerCase() || null;
      const fallbackMerchantId = shopDomain
        ? merchantIdByShop.get(shopDomain) || null
        : null;

      const effectiveMerchantId = doc.merchantId || fallbackMerchantId || null;

      const merchantName =
        effectiveMerchantId
          ? merchantNameById.get(String(effectiveMerchantId)) || null
          : null;

      return {
        _id: doc._id,
        shop: doc.shop,
        // Fix: include the effective merchantId (direct or resolved via shop)
        // so old orders still show the correct merchant on the dashboard.
        merchantId: effectiveMerchantId,
        merchantName,
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
