const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ShopifyStore = require('../models/ShopifyStore');

// @route   GET /api/shopify/stores
// @desc    Return connected Shopify shops for the logged-in merchant
// @access  Private (merchant, superadmin)
router.get('/stores', protect, authorize('merchant', 'superadmin'), async (req, res) => {
  try {
    const merchantId = req.user._id;

    const stores = await ShopifyStore.find({
      merchantId,
      isActive: true,
      accessToken: { $ne: null }
    }).select('shop isActive');

    return res.json({
      success: true,
      data: stores.map(s => ({
        shop: s.shop,
        isActive: s.isActive
      }))
    });
  } catch (error) {
    console.error('[ShopifyPublish] Error listing stores:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list Shopify stores'
    });
  }
});

// @route   POST /api/shopify/publish-product
// @desc    Publish a product to Shopify as draft
// @access  Private (merchant, superadmin)
router.post('/publish-product', protect, authorize('merchant', 'superadmin'), async (req, res) => {
  try {
    const merchantId = req.user._id;
    const {
      shop,
      storeProductId,
      title,
      description,
      galleryImages,
      variants
    } = req.body;

    // Validations
    if (!shop) {
      return res.status(400).json({ success: false, message: 'shop is required' });
    }
    if (!title) {
      return res.status(400).json({ success: false, message: 'title is required' });
    }
    if (!Array.isArray(galleryImages) || galleryImages.length === 0 || !galleryImages[0]?.url) {
      return res.status(400).json({ success: false, message: 'At least 1 galleryImages url is required' });
    }
    if (!Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({ success: false, message: 'At least 1 variant is required' });
    }

    // Fetch token
    const shopifyStore = await ShopifyStore.findOne({
      merchantId,
      shop: shop.toLowerCase(),
      isActive: true
    });

    if (!shopifyStore || !shopifyStore.accessToken) {
      return res.status(401).json({
        success: false,
        message: 'Shopify store not connected or token missing'
      });
    }

    // Build Shopify product payload
    const shopifyPayload = {
      product: {
        title: title,
        body_html: description || '',
        status: 'draft',
        images: galleryImages.map(img => ({ src: img.url })),
        options: [
          { name: 'Size' },
          { name: 'Color' }
        ],
        variants: variants.map(v => ({
          option1: v.size || 'Default',
          option2: v.color || 'Default',
          price: String(v.price ?? 0),
          sku: v.sku || ''
        }))
      }
    };

    // WARNING: Idempotency not implemented for MVP. 
    // A future version should track shopifyProductId in a separate mapping
    // to avoid creating duplicate products on repeated publish.

    // Call Shopify REST API
    const shopifyResponse = await fetch(
      `https://${shop}/admin/api/2026-01/products.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': shopifyStore.accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shopifyPayload)
      }
    );

    if (!shopifyResponse.ok) {
      const errorBody = await shopifyResponse.text();
      console.error('[ShopifyPublish] Shopify API error:', shopifyResponse.status, errorBody);
      return res.status(shopifyResponse.status).json({
        success: false,
        message: 'Shopify API error',
        details: errorBody
      });
    }

    const shopifyData = await shopifyResponse.json();
    const shopifyProductId = shopifyData.product?.id;

    console.log('[ShopifyPublish] Product created:', {
      shop,
      shopifyProductId,
      title,
      storeProductId
    });

    return res.json({
      ok: true,
      shop: shop,
      shopifyProductId: String(shopifyProductId)
    });
  } catch (error) {
    console.error('[ShopifyPublish] Error publishing product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to publish product to Shopify',
      error: error.message
    });
  }
});

module.exports = router;
