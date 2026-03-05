const express = require('express');
const router = express.Router();
const ProductMapping = require('../models/ProductMapping');
const ImportedOrder = require('../models/ImportedOrder');
const { protect, superadminOnly } = require('../middleware/auth');

/**
 * @route   POST /api/admin/product-mappings
 * @desc    Create or update product mapping and auto-apply to pending orders (Super Admin only)
 * @access  Private (Superadmin)
 */
router.post('/', protect, superadminOnly, async (req, res) => {
  try {
    const { 
      shop, 
      shopifyProductId, 
      shopifyVariantId, 
      merchantId, 
      internalProductId, 
      internalVariantId, 
      printAssets, 
      mockupUrls,
      printMeta 
    } = req.body;

    if (!shop || !shopifyVariantId || !shopifyProductId || !printAssets) {
      return res.status(400).json({ success: false, message: 'shop, variantId, productId and printAssets are required' });
    }

    // Upsert mapping
    const mapping = await ProductMapping.findOneAndUpdate(
      { shop, shopifyVariantId },
      {
        shop,
        shopifyProductId,
        shopifyVariantId,
        merchantId,
        internalProductId,
        internalVariantId,
        printAssets,
        mockupUrls,
        printMeta,
        active: true
      },
      { upsert: true, new: true }
    );

    // Auto-apply to ImportedOrders
    const affectedOrders = await ImportedOrder.find({
      shop,
      'items.shopifyVariantId': shopifyVariantId,
      status: { $in: ['imported', 'needs_mapping'] }
    });

    for (const order of affectedOrders) {
      let allMapped = true;
      for (const item of order.items) {
        if (item.shopifyVariantId === shopifyVariantId) {
          item.mapped = true;
          item.mappingRef = mapping._id;
          item.printAssets = mapping.printAssets;
          item.mockupUrls = mapping.mockupUrls;
        }
        if (!item.mapped) allMapped = false;
      }
      order.status = allMapped ? 'ready_for_job' : 'needs_mapping';
      await order.save();
    }

    res.json({ success: true, data: mapping, appliedTo: affectedOrders.length });
  } catch (error) {
    console.error('[ProductMapping] Save Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/admin/product-mappings
 */
router.get('/', protect, superadminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 25, shop, search } = req.query;
    const query = { active: true };

    if (shop) query.shop = shop;
    if (search) {
      query.$or = [
        { shopifyProductId: search },
        { shopifyVariantId: search }
      ];
    }

    const total = await ProductMapping.countDocuments(query);
    const mappings = await ProductMapping.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: mappings,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/admin/product-mappings/:id
 */
router.delete('/:id', protect, superadminOnly, async (req, res) => {
  try {
    const mapping = await ProductMapping.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!mapping) return res.status(404).json({ success: false, message: 'Mapping not found' });
    res.json({ success: true, message: 'Mapping deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
