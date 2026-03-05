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
    const { shop, shopifyOrderId } = req.body;

    if (!shop || !shopifyOrderId) {
      return res.status(400).json({ success: false, message: 'shop and shopifyOrderId are required' });
    }

    // 1. Fetch from ShopifyOrder collection
    const source = await ShopifyOrder.findOne({ shop, shopifyOrderId: String(shopifyOrderId) });
    if (!source) {
      return res.status(404).json({ success: false, message: 'Source ShopifyOrder not found. Ensure it has been webhooked first.' });
    }

    // 2. Idempotency: return existing if already imported
    let imported = await ImportedOrder.findOne({ shop, shopifyOrderId: String(shopifyOrderId) });
    if (imported) {
      return res.json({ success: true, data: imported, message: 'Order already imported' });
    }

    // 3. Normalize data from ShopifyOrder.raw
    const raw = source.raw || {};
    
    // Extract customer
    const rawCustomer = raw.customer || {};
    const rawShipping = raw.shipping_address || {};
    
    const customer = {
      name: rawShipping.name || `${rawCustomer.first_name || ''} ${rawCustomer.last_name || ''}`.trim() || 'No Name',
      email: raw.email || rawCustomer.email || '',
      phone: raw.phone || rawShipping.phone || rawCustomer.phone || ''
    };

    const shippingAddress = {
      name: rawShipping.name || '',
      phone: rawShipping.phone || '',
      address1: rawShipping.address1 || '',
      address2: rawShipping.address2 || '',
      city: rawShipping.city || '',
      province: rawShipping.province || '',
      zip: rawShipping.zip || '',
      country: rawShipping.country || ''
    };

    // Extract items
    const lineItems = raw.line_items || [];
    const items = lineItems.map(li => ({
      lineItemId: String(li.id),
      title: li.title,
      variantTitle: li.variant_title || '',
      sku: li.sku || '',
      quantity: li.quantity || 1,
      shopifyProductId: String(li.product_id),
      shopifyVariantId: String(li.variant_id),
      properties: li.properties || [],
      mapped: false
    }));

    // 4. Create new ImportedOrder
    imported = new ImportedOrder({
      shop,
      shopifyOrderId: String(shopifyOrderId),
      shopifyOrderName: raw.name || `#${raw.order_number}` || String(shopifyOrderId),
      merchantId: source.merchantId,
      customer,
      shippingAddress,
      items,
      financialStatus: raw.financial_status || source.financialStatus,
      fulfillmentStatus: raw.fulfillment_status || source.fulfillmentStatus,
      totalPrice: raw.total_price || source.totalPrice,
      currency: raw.currency || source.currency,
      rawRef: source._id,
      status: 'needs_mapping'
    });

    // 5. Auto-Map check
    let allMapped = true;
    for (const item of imported.items) {
      const mapping = await ProductMapping.findOne({ 
        shop, 
        shopifyVariantId: item.shopifyVariantId, 
        active: true 
      });
      
      if (mapping) {
        item.mapped = true;
        item.mappingRef = mapping._id;
        item.printAssets = mapping.printAssets;
        item.mockupUrls = mapping.mockupUrls;
      } else {
        allMapped = false;
      }
    }

    if (allMapped && imported.items.length > 0) {
      imported.status = 'ready_for_job';
    } else {
      imported.status = 'needs_mapping';
    }

    await imported.save();
    res.json({ success: true, data: imported });
  } catch (error) {
    console.error('[ImportOrders] Error:', error);
    res.status(500).json({ success: false, message: 'Server error during import' });
  }
});

/**
 * @route   GET /api/admin/import-orders/unmapped-items
 * @desc    Get unique unmapped variants from all imported orders
 * @access  Private (Superadmin)
 */
router.get('/unmapped-items', protect, superadminOnly, async (req, res) => {
  try {
    const { shop } = req.query;
    const query = { 'items.mapped': false };
    if (shop) query.shop = shop;

    const orders = await ImportedOrder.find(query).lean();
    
    // Extract unique unmapped variants
    const unmappedMap = new Map();
    
    for (const order of orders) {
      for (const item of order.items) {
        if (!item.mapped) {
          const key = `${order.shop}_${item.shopifyVariantId}`;
          if (!unmappedMap.has(key)) {
            unmappedMap.set(key, {
              shop: order.shop,
              shopifyProductId: item.shopifyProductId,
              shopifyVariantId: item.shopifyVariantId,
              title: item.title,
              variantTitle: item.variantTitle,
              sku: item.sku,
              sampleOrderName: order.shopifyOrderName,
              merchantId: order.merchantId
            });
          }
        }
      }
    }

    res.json({ success: true, data: Array.from(unmappedMap.values()) });
  } catch (error) {
    console.error('[ImportOrders] Unmapped Items Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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
