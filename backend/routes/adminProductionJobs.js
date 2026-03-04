const express = require('express');
const router = express.Router();
const ProductionJob = require('../models/ProductionJob');
const ImportedOrder = require('../models/ImportedOrder');
const { protect, superadminOnly } = require('../middleware/auth');

/**
 * @route   POST /api/admin/production-jobs
 * @desc    Create a production job from an ImportedOrder (Super Admin only)
 * @access  Private (Superadmin)
 */
router.post('/', protect, superadminOnly, async (req, res) => {
  try {
    const { importedOrderId } = req.body;
    if (!importedOrderId) return res.status(400).json({ success: false, message: 'importedOrderId is required' });

    const order = await ImportedOrder.findById(importedOrderId);
    if (!order) return res.status(404).json({ success: false, message: 'ImportedOrder not found' });

    // HARD GATE: Check if all items are mapped and have assets
    const unmappedItems = order.items.filter(it => !it.mapped || (!it.printAssets?.frontUrl && !it.printAssets?.backUrl));
    if (unmappedItems.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot create job: One or more items are not fully mapped or missing print assets',
        unmapped: unmappedItems.map(i => i.title)
      });
    }

    // Idempotent: return existing if shop + shopifyOrderId matches
    let job = await ProductionJob.findOne({ shop: order.shop, shopifyOrderId: order.shopifyOrderId });
    if (job) {
      return res.json({ success: true, data: job, message: 'Job already exists' });
    }

    // Create snapshot
    job = new ProductionJob({
      shop: order.shop,
      importedOrderId: order._id,
      shopifyOrderId: order.shopifyOrderId,
      merchantId: order.merchantId,
      customer: order.customer,
      shippingAddress: order.shippingAddress,
      items: order.items.map(it => ({
        title: it.title,
        variantTitle: it.variantTitle,
        sku: it.sku,
        quantity: it.quantity,
        shopifyProductId: it.shopifyProductId,
        shopifyVariantId: it.shopifyVariantId,
        printAssets: it.printAssets,
        mockupUrls: it.mockupUrls
      })),
      status: 'queued'
    });

    await job.save();

    order.status = 'job_created';
    await order.save();

    res.json({ success: true, data: job });
  } catch (error) {
    console.error('[ProductionJob] Create Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/admin/production-jobs
 */
router.get('/', protect, superadminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 25, shop, status, search } = req.query;
    const query = {};

    if (shop) query.shop = shop;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { shopifyOrderId: search },
        { 'customer.email': new RegExp(search, 'i') },
        { 'items.sku': new RegExp(search, 'i') }
      ];
    }

    const total = await ProductionJob.countDocuments(query);
    const jobs = await ProductionJob.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: jobs,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   PATCH /api/admin/production-jobs/:id/status
 */
router.patch('/:id/status', protect, superadminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['queued', 'manufacturing', 'qc', 'packed', 'shipped', 'delivered', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const job = await ProductionJob.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   PATCH /api/admin/production-jobs/:id/shipping
 */
router.patch('/:id/shipping', protect, superadminOnly, async (req, res) => {
  try {
    const { carrier, trackingNumber, trackingUrl, shippedAt } = req.body;
    const update = {
      shipping: { carrier, trackingNumber, trackingUrl, shippedAt: shippedAt || new Date() }
    };
    
    if (trackingNumber) {
      update.status = 'shipped';
    }

    const job = await ProductionJob.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
