const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Kit = require('../models/Kit');
const KitSend = require('../models/KitSend');
const CatalogProduct = require('../models/CatalogProduct');
const CatalogProductVariant = require('../models/CatalogProductVariant');
const { assertBrandAccess } = require('../utils/brandAccess');
const { attachVariantsToProducts } = require('../utils/kitVariantSelections');
const { normalizePackaging, validatePackagingChoice } = require('../utils/kitFulfillment');
const { assertWithinPlanLimit } = require('../utils/planLimits');

async function attachVariantsToKit(kit) {
  const kitObject = kit?.toObject ? kit.toObject() : kit;
  if (!kitObject?.items?.length) return kitObject;

  const products = kitObject.items
    .map((item) => item.catalogProductId)
    .filter((product) => product && typeof product === 'object');
  const productIds = products.map((product) => product._id);
  if (!productIds.length) return kitObject;

  const variants = await CatalogProductVariant.find({
    catalogProductId: { $in: productIds },
    isActive: true,
  }).lean();
  const productsWithVariants = attachVariantsToProducts(products, variants);
  const productById = new Map(productsWithVariants.map((product) => [String(product._id), product]));

  return {
    ...kitObject,
    items: kitObject.items.map((item) => {
      const product = item.catalogProductId;
      if (!product || typeof product !== 'object') return item;
      return {
        ...item,
        catalogProductId: productById.get(String(product._id)) || product,
      };
    }),
  };
}

async function normalizeAndValidatePackaging(packaging) {
  const normalized = normalizePackaging(packaging);
  if (normalized.mode === 'none') return normalized;
  const packagingProduct = await CatalogProduct.findById(normalized.catalogProductId).lean();
  return validatePackagingChoice({ packaging: normalized, packagingProduct });
}

router.get('/', protect, async (req, res) => {
  try {
    const brandId = req.query.brandId;
    if (!brandId) {
      return res.status(400).json({ success: false, message: 'brandId is required' });
    }

    const store = await assertBrandAccess(req, brandId);

    const currentKitCount = await Kit.countDocuments({ brandId });
    assertWithinPlanLimit({
      planId: store.subscriptionPlan,
      resource: 'kits',
      currentCount: currentKitCount,
      attemptedAdd: 1,
      limitKey: 'maxKits',
    });

    const kits = await Kit.find({ brandId }).sort({ updatedAt: -1 }).lean();
    const objectBrandId = mongoose.Types.ObjectId.isValid(String(brandId))
      ? new mongoose.Types.ObjectId(String(brandId))
      : null;

    const sends = objectBrandId
      ? await KitSend.aggregate([
          { $match: { brandId: objectBrandId } },
          { $sort: { createdAt: -1 } },
          { $group: { _id: '$kitId', lastSentAt: { $first: '$createdAt' } } },
        ])
      : [];

    const lastSentByKit = Object.fromEntries(sends.map((entry) => [String(entry._id), entry.lastSentAt]));

    res.json({
      success: true,
      data: kits.map((kit) => ({
        ...kit,
        lastSentAt: lastSentByKit[String(kit._id)] || null,
      })),
    });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { brandId, name, status = 'draft', items = [] } = req.body;
    if (!brandId || !name) {
      return res.status(400).json({ success: false, message: 'brandId and name are required' });
    }

    await assertBrandAccess(req, brandId);

    const packaging = await normalizeAndValidatePackaging(req.body.packaging);

    const kit = await Kit.create({
      brandId,
      name,
      status,
      items,
      packaging,
      sampleRequested: Boolean(req.body.sampleRequested),
      createdBy: req.user._id,
    });

    const populated = await Kit.findById(kit._id)
      .populate('items.catalogProductId')
      .populate('packaging.catalogProductId');
    res.status(201).json({ success: true, data: await attachVariantsToKit(populated) });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const kit = await Kit.findById(req.params.id)
      .populate('items.catalogProductId')
      .populate('packaging.catalogProductId')
      .populate('createdBy', 'name email');

    if (!kit) {
      return res.status(404).json({ success: false, message: 'Kit not found' });
    }

    await assertBrandAccess(req, kit.brandId);
    res.json({ success: true, data: await attachVariantsToKit(kit) });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const existing = await Kit.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Kit not found' });
    }

    await assertBrandAccess(req, existing.brandId);

    const packaging = req.body.packaging !== undefined
      ? await normalizeAndValidatePackaging(req.body.packaging)
      : existing.packaging;

    const updated = await Kit.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name ?? existing.name,
        status: req.body.status ?? existing.status,
        items: Array.isArray(req.body.items) ? req.body.items : existing.items,
        packaging,
        sampleRequested: req.body.sampleRequested !== undefined ? Boolean(req.body.sampleRequested) : existing.sampleRequested,
      },
      { new: true }
    )
      .populate('items.catalogProductId')
      .populate('packaging.catalogProductId');

    res.json({ success: true, data: await attachVariantsToKit(updated) });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const existing = await Kit.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Kit not found' });
    }

    await assertBrandAccess(req, existing.brandId);

    const paidSendCount = await KitSend.countDocuments({
      kitId: existing._id,
      status: { $in: ['paid', 'invites_sent', 'partially_redeemed', 'completed'] },
    });

    if (paidSendCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Paid kit sends exist for this kit, so it cannot be deleted',
      });
    }

    await existing.deleteOne();
    res.json({ success: true, message: 'Kit deleted' });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

module.exports = router;
