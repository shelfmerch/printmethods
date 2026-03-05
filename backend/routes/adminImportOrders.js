const express = require('express');
const router = express.Router();
const ImportedOrder = require('../models/ImportedOrder');
const ShopifyOrder = require('../models/ShopifyOrder');
const ProductMapping = require('../models/ProductMapping');
const { protect, superadminOnly } = require('../middleware/auth');

/**
 * @route   POST /api/admin/import-orders
 * @desc    Import order(s) from ShopifyOrder collection (Super Admin only)
 * @access  Private (Superadmin)
 */
router.post('/', protect, superadminOnly, async (req, res) => {
  try {
    const { shop, shopifyOrderId, shopifyOrderIds } = req.body;
    const idsToImport = shopifyOrderIds || (shopifyOrderId ? [shopifyOrderId] : []);

    if (!shop || idsToImport.length === 0) {
      return res.status(400).json({ success: false, message: 'shop and shopifyOrderId(s) are required' });
    }

    const results = [];
    for (const id of idsToImport) {
      const source = await ShopifyOrder.findOne({ shop, shopifyOrderId: String(id) });
      if (!source) continue;

      // Idempotent: find or create
      let imported = await ImportedOrder.findOne({ shop, shopifyOrderId: String(id) });
      
      if (!imported) {
        // Normalize fields from raw Shopify payload
        const raw = source.raw || {};
        const customer = {
          name: raw.customer ? `${raw.customer.first_name || ''} ${raw.customer.last_name || ''}`.trim() : (raw.shipping_address?.name || 'No Name'),
          email: raw.email || raw.customer?.email || '',
          phone: raw.phone || raw.customer?.phone || ''
        };

        const addr = raw.shipping_address || {};
        const shippingAddress = {
          name: addr.name || '',
          phone: addr.phone || '',
          address1: addr.address1 || '',
          address2: addr.address2 || '',
          city: addr.city || '',
          province: addr.province || '',
          zip: addr.zip || '',
          country: addr.country || ''
        };

        const items = (raw.line_items || []).map(li => ({
          lineItemId: String(li.id),
          title: li.title,
          variantTitle: li.variant_title,
          sku: li.sku,
          quantity: li.quantity,
          shopifyProductId: String(li.product_id),
          shopifyVariantId: String(li.variant_id),
          properties: li.properties || [],
          mapped: false
        }));

        imported = new ImportedOrder({
          shop,
          shopifyOrderId: String(id),
          shopifyOrderName: raw.name || '',
          merchantId: source.merchantId,
          customer,
          shippingAddress,
          items,
          financialStatus: source.financialStatus,
          fulfillmentStatus: source.fulfillmentStatus,
          totalPrice: source.totalPrice,
          currency: source.currency,
          rawRef: source._id,
          status: 'imported'
        });
      }

      // Check for mappings
      let allMapped = true;
      for (const item of imported.items) {
        const mapping = await ProductMapping.findOne({ shop, shopifyVariantId: item.shopifyVariantId, active: true });
        if (mapping) {
          item.mapped = true;
          item.mappingRef = mapping._id;
          item.printAssets = mapping.printAssets;
          item.mockupUrls = mapping.mockupUrls;
        } else {
          allMapped = false;
        }
      }

      imported.status = allMapped ? 'ready_for_job' : 'needs_mapping';
      await imported.save();
      results.push(imported);
    }

    res.json({ success: true, importedOrders: results });
  } catch (error) {
    console.error('[ImportOrders] Error:', error);
    res.status(500).json({ success: false, message: 'Server error during import' });
  }
});

/**
 * @route   GET /api/admin/import-orders
 * @desc    List imported orders (Super Admin only)
 */
router.get('/', protect, superadminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 25, shop, status, search, dateFrom, dateTo } = req.query;
    const query = {};

    if (shop) query.shop = shop;
    if (status) query.status = status;
    if (dateFrom || dateTo) {
      query.importedAt = {};
      if (dateFrom) query.importedAt.$gte = new Date(dateFrom);
      if (dateTo) query.importedAt.$lte = new Date(dateTo);
    }
    if (search) {
      query.$or = [
        { shopifyOrderId: new RegExp(search, 'i') },
        { shopifyOrderName: new RegExp(search, 'i') },
        { 'customer.email': new RegExp(search, 'i') },
        { 'customer.name': new RegExp(search, 'i') }
      ];
    }

    const total = await ImportedOrder.countDocuments(query);
    const orders = await ImportedOrder.find(query)
      .sort({ importedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[ImportOrders] List Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/admin/import-orders/:id
 */
router.get('/:id', protect, superadminOnly, async (req, res) => {
  try {
    const order = await ImportedOrder.findById(req.params.id).populate('rawRef');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
