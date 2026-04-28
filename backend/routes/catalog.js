const express = require('express');
const router = express.Router();
const CatalogProduct = require('../models/CatalogProduct');
const CatalogProductVariant = require('../models/CatalogProductVariant');

// @route  GET /api/catalog
// @desc   Public catalog — list all active+published products
// @access Public
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 60, page = 1 } = req.query;
    const filter = { isActive: true, isPublished: true };
    if (category) filter.categoryId = category;
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const products = await CatalogProduct.find(filter)
      .select('name shortDescription categoryId basePrice currency sampleAvailable galleryImages design stocks gst pricing')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await CatalogProduct.countDocuments(filter);

    // Attach unique colors per product (from variants)
    const productIds = products.map(p => p._id);
    const variants = await CatalogProductVariant.find(
      { catalogProductId: { $in: productIds }, isActive: true },
      'catalogProductId color colorHex'
    ).lean();

    const colorsByProduct = {};
    for (const v of variants) {
      const key = v.catalogProductId.toString();
      if (!colorsByProduct[key]) colorsByProduct[key] = [];
      if (!colorsByProduct[key].find(c => c.color === v.color)) {
        colorsByProduct[key].push({ color: v.color, colorHex: v.colorHex });
      }
    }

    const result = products.map(p => ({
      _id: p._id,
      name: p.name,
      shortDescription: p.shortDescription,
      categoryId: p.categoryId,
      basePrice: p.basePrice,
      sampleAvailable: Boolean(p.sampleAvailable),
      currency: p.currency,
      minimumQuantity: p.stocks?.minimumQuantity ?? 1,
      primaryImage: p.galleryImages?.find(g => g.isPrimary)?.url
        || p.galleryImages?.[0]?.url
        || p.design?.sampleMockups?.[0]?.imageUrl
        || null,
      colors: colorsByProduct[p._id.toString()] || [],
      specificPrices: (p.pricing?.specificPrices || [])
        .filter(sp => sp.minQuantity > 1)
        .sort((a, b) => a.minQuantity - b.minQuantity),
      gst: p.gst,
    }));

    res.json({ success: true, data: result, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Catalog list error:', err);
    res.status(500).json({ success: false, message: 'Failed to load catalog' });
  }
});

// @route  GET /api/catalog/:id
// @desc   Public product detail — full info for ordering
// @access Public
router.get('/:id', async (req, res) => {
  try {
    const product = await CatalogProduct.findOne({
      _id: req.params.id,
      isActive: true,
      isPublished: true,
    })
      .populate('allowedPrintMethodIds', 'name code baseRatePaisePerSqIn colorRatePaise minColors hasColors active moq description')
      .lean();

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const variants = await CatalogProductVariant.find({
      catalogProductId: product._id,
      isActive: true,
    }).lean();

    // Build size list from variants
    const sizes = [...new Set(variants.map(v => v.size))];
    const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL', '5XL'];
    sizes.sort((a, b) => {
      const ai = SIZE_ORDER.indexOf(a);
      const bi = SIZE_ORDER.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

    // Unique colors
    const colorMap = {};
    for (const v of variants) {
      if (!colorMap[v.color]) colorMap[v.color] = { color: v.color, colorHex: v.colorHex };
    }
    const colors = Object.values(colorMap);

    // Tiered pricing from specificPrices (sorted by minQuantity)
    const tiers = (product.pricing?.specificPrices || [])
      .filter(sp => sp.minQuantity >= 1)
      .sort((a, b) => a.minQuantity - b.minQuantity)
      .map(sp => ({
        minQuantity: sp.minQuantity,
        discountType: sp.discountType,
        discountValue: sp.discountValue,
        useDiscount: sp.useDiscount,
        useSpecificPrice: sp.useSpecificPrice,
        specificPriceTaxExcl: sp.specificPriceTaxExcl,
      }));

    res.json({
      success: true,
      data: {
        _id: product._id,
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription,
        highlights: product.highlights,
        categoryId: product.categoryId,
        basePrice: product.basePrice,
        sampleAvailable: Boolean(product.sampleAvailable),
        currency: product.currency,
        gst: product.gst,
        minimumQuantity: product.stocks?.minimumQuantity ?? 1,
        galleryImages: product.galleryImages,
        design: product.design,
        printMethods: (product.allowedPrintMethodIds || []).filter(pm => pm.active !== false),
        variants,
        colors,
        sizes,
        pricingTiers: tiers,
        shipping: product.shipping,
      },
    });
  } catch (err) {
    console.error('Catalog product error:', err);
    res.status(500).json({ success: false, message: 'Failed to load product' });
  }
});

module.exports = router;
