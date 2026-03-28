const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, authorize } = require('../middleware/auth');
const Store = require('../models/Store');
const StoreProduct = require('../models/StoreProduct');
const StoreProductVariant = require('../models/StoreProductVariant');
const CatalogProduct = require('../models/CatalogProduct');
const CatalogProductVariant = require('../models/CatalogProductVariant');
const { uploadToS3 } = require('../utils/s3Upload');
const { compositeMockup } = require('../utils/compositeMockup');
const { v4: uuidv4 } = require('uuid');

// @route   POST /api/store-products
// @desc    Create or update a store product with design data, and optional variants
// @access  Private (merchant, superadmin)
router.post('/', protect, authorize('merchant', 'superadmin'), async (req, res) => {
  try {
    const {
      storeId,          // optional; if not provided, resolve the first active store for this merchant
      storeSlug,        // optional alternative to storeId
      catalogProductId, // required
      sellingPrice,     // required
      compareAtPrice,   // optional
      title,            // optional override
      description,      // optional override

      designData,       // optional object from editor
      variants,         // optional: [{ catalogProductVariantId, sku, sellingPrice, isActive }]
      status            // optional: 'draft' | 'published'
    } = req.body;

    if (!catalogProductId || sellingPrice === undefined) {
      return res.status(400).json({ success: false, message: 'catalogProductId and sellingPrice are required' });
    }

    const { id, _id } = req.body;
    const spId = id || _id;

    // Resolve store
    let store = null;
    let existingSp = null;

    if (spId && mongoose.Types.ObjectId.isValid(spId)) {
      existingSp = await StoreProduct.findById(spId);
    }

    if (existingSp) {
      store = await Store.findById(existingSp.storeId);
    } else if (storeId) {
      if (!mongoose.Types.ObjectId.isValid(storeId)) {
        return res.status(400).json({ success: false, message: 'Invalid storeId' });
      }
      store = await Store.findById(storeId);
    } else if (storeSlug) {
      store = await Store.findOne({ slug: storeSlug, isActive: true });
    } else {
      // default to first active native store of merchant
      store = await Store.findOne({ merchant: req.user._id, isActive: true, type: 'native' }).sort({ createdAt: 1 });
    }

    if (!store) {
      // No store found — enforce shop-first rule
      // If merchant has NO stores at all, return structured SHOP_REQUIRED error
      const anyStore = await Store.findOne({ merchant: req.user._id }).lean();
      if (!anyStore) {
        return res.status(422).json({
          success: false,
          error: {
            code: 'SHOP_REQUIRED',
            message: 'Create a shop before creating products',
          },
        });
      }
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // Authorization: merchants can only write to their own stores
    if (req.user.role !== 'superadmin' && String(store.merchant) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this store' });
    }

    let cleanDesignData = undefined;
    if (designData) {
      cleanDesignData = { ...designData };
      delete cleanDesignData.previewImagesByView;
      delete cleanDesignData.tags;
      delete cleanDesignData.galleryImages;
    }

    const spUpdateData = {
      storeId: store._id,
      catalogProductId,
      sellingPrice,
      ...(compareAtPrice !== undefined ? { compareAtPrice } : {}),
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(cleanDesignData ? { designData: cleanDesignData } : {}),
      isActive: true,
      // Handle status: if provided, set it and publishedAt accordingly
      ...(status === 'published' ? {
        status: 'published',
        publishedAt: new Date()
      } : status === 'draft' ? {
        status: 'draft',
        publishedAt: undefined
      } : {}),
    };

    // Stamp source/channel only on creation (not on update)
    if (!spId) {
      spUpdateData.source = 'native';
      spUpdateData.channel = 'web';
    }

    // Resolve StoreProduct: If ID provided, update; otherwise create new.
    // This avoids overwriting other listings of the same catalog product.

    let storeProduct;
    if (spId && mongoose.Types.ObjectId.isValid(spId)) {
      storeProduct = await StoreProduct.findOneAndUpdate(
        { _id: spId, storeId: store._id },
        { $set: spUpdateData },
        { new: true }
      );
      if (!storeProduct) {
        return res.status(404).json({ success: false, message: 'Store product to update not found' });
      }
    } else {
      // Create new listing
      storeProduct = new StoreProduct(spUpdateData);
      await storeProduct.save();
    }

    let createdVariants = [];
    if (Array.isArray(variants) && variants.length > 0) {
      // Upsert each variant for this store product
      createdVariants = await Promise.all(variants.map(async (v) => {
        if (!v.catalogProductVariantId || !v.sku) return null;
        const vpFilter = { storeProductId: storeProduct._id, catalogProductVariantId: v.catalogProductVariantId };
        const vpUpdate = {
          $set: {
            storeProductId: storeProduct._id,
            catalogProductVariantId: v.catalogProductVariantId,
            sku: v.sku,
            ...(v.sellingPrice !== undefined ? { sellingPrice: v.sellingPrice } : {}),
            ...(v.isActive !== undefined ? { isActive: v.isActive } : {}),
          },
        };
        return await StoreProductVariant.findOneAndUpdate(
          vpFilter,
          vpUpdate,
          { new: true, upsert: true, setDefaultsOnInsert: true },
        );
      }));
      createdVariants = createdVariants.filter(Boolean);

      // Replace-style sync: Delete any StoreProductVariant for this product that 
      // was NOT in the incoming variants list. This ensures removed sizes/colors
      // are actually gone from the store.
      const incomingCatalogVariantIds = createdVariants.map(v => v.catalogProductVariantId.toString());
      await StoreProductVariant.deleteMany({
        storeProductId: storeProduct._id,
        catalogProductVariantId: { $nin: incomingCatalogVariantIds }
      });
      console.log(`[StoreProducts] Synced variants for ${storeProduct._id}. Kept ${createdVariants.length}.`);
    }

    // Rebuild embedded variantsSummary on the StoreProduct so that
    // storefronts and dashboards can quickly read per-variant pricing.
    const allVariants = await StoreProductVariant.find({
      storeProductId: storeProduct._id,
      // We now include even inactive variants in the summary so they can be greyed out
      // but we filter them at reading time if needed.
    }).populate({
      path: 'catalogProductVariantId',
      select: 'size color colorHex basePrice skuTemplate isActive',
    });

    storeProduct.variantsSummary = allVariants
      .filter(v => v.catalogProductVariantId) // Filter out orphaned variants
      .map((v) => {
        const cv = v.catalogProductVariantId;
        return {
          catalogProductVariantId: cv._id,
          size: cv.size,
          color: cv.color,
          colorHex: cv.colorHex,
          sku: v.sku || cv.skuTemplate,
          sellingPrice: typeof v.sellingPrice === 'number' ? v.sellingPrice : undefined,
          basePrice: typeof cv.basePrice === 'number' ? cv.basePrice : undefined,
          isActive: v.isActive && cv.isActive, // Active only if both are active
        };
      });

    await storeProduct.save();

    return res.status(201).json({
      success: true,
      message: 'Store product saved',
      data: {
        storeProduct,
        variants: createdVariants,
      },
    });
  } catch (error) {
    console.error('Error saving store product:', error);
    return res.status(500).json({ success: false, message: 'Failed to save store product', error: error.message });
  }
});

// @route   GET /api/store-products/public/:storeId?
// @desc    List all public, active, published products for a specific store
// @access  Public
// NOTE: Uses req.tenant when available (subdomain-based), falls back to :storeId param
router.get(['/public', '/public/:storeId'], async (req, res) => {
  try {
    let storeId = null;

    // Priority 1: Use tenant from middleware (subdomain-based)
    if (req.tenant && req.tenant._id) {
      storeId = req.tenant._id;
    }
    // Priority 2: Fallback to path parameter
    else if (req.params.storeId) {
      storeId = req.params.storeId;
    }

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: 'Store identifier required. Provide store subdomain or storeId parameter.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({ success: false, message: 'Invalid store ID' });
    }

    const products = await StoreProduct.find({
      storeId: storeId,
      isActive: true,
      status: 'published',
    })
      .populate({
        path: 'catalogProductId',
        select: '_id name description categoryId subcategoryIds productTypeCode',
        lean: true
      })
      .sort({ updatedAt: -1 })
      .lean();

    return res.json({ success: true, data: products });
  } catch (error) {
    console.error('Error listing public store products:', error);
    return res.status(500).json({ success: false, message: 'Failed to list store products' });
  }
});

// @route   GET /api/store-products/public/:storeId?/:productId
// @desc    Get a specific store product for public storefront viewing
// @access  Public
// NOTE: Uses req.tenant when available (subdomain-based), falls back to :storeId param
// Note: Route order implies this only catches 2-segment paths, so explicit optional param was misleading/unreachable for 1-segment.
router.get('/public/:storeId/:productId', async (req, res) => {
  try {
    const { storeId, productId } = req.params;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    // Priority 1: Use tenant from middleware (subdomain-based)
    let resolvedStoreId = null;
    if (req.tenant && req.tenant._id) {
      resolvedStoreId = req.tenant._id;
    }
    // Priority 2: Fallback to path parameter
    else if (storeId) {
      if (!mongoose.Types.ObjectId.isValid(storeId)) {
        return res.status(400).json({ success: false, message: 'Invalid store ID' });
      }
      resolvedStoreId = storeId;
    }

    if (!resolvedStoreId) {
      return res.status(400).json({
        success: false,
        message: 'Store identifier required. Provide store subdomain or storeId parameter.'
      });
    }

    const storeProduct = await StoreProduct.findOne({
      _id: productId,
      storeId: resolvedStoreId,
      isActive: true,
      status: 'published',
    })
      .populate({
        path: 'catalogProductId',
        select: '_id name description categoryId subcategoryIds productTypeCode gst stocks careInstructions',
        lean: true
      })
      .lean();

    if (!storeProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Fetch variants for this product and populate catalog variant details (size/color)
    let variants = await StoreProductVariant.find({
      storeProductId: storeProduct._id,
      // Removed isActive: true to include OOS variants for storefront grey-out
    })
      .populate({ path: 'catalogProductVariantId', select: 'size color colorHex skuTemplate basePrice isActive' })
      .lean();

    // If no store-specific variants exist, fall back to catalog product variants
    // This handles default stores that haven't customized their variants
    if (!variants || variants.length === 0) {
      // Handle both populated object and direct ObjectId/string
      const catalogProductId = storeProduct.catalogProductId?._id
        ? storeProduct.catalogProductId._id
        : storeProduct.catalogProductId;

      if (catalogProductId) {
        console.log('[StoreProducts] Falling back to catalog variants for product:', productId, 'catalogProductId:', catalogProductId);

        // Check if designData has selected colors/sizes to filter variants
        const selectedColors = storeProduct.designData?.selectedColors;
        const selectedSizes = storeProduct.designData?.selectedSizes;
        const hasSelectedColors = Array.isArray(selectedColors) && selectedColors.length > 0;
        const hasSelectedSizes = Array.isArray(selectedSizes) && selectedSizes.length > 0;

        console.log('[StoreProducts] Filter criteria:', {
          hasSelectedColors,
          selectedColors,
          hasSelectedSizes,
          selectedSizes,
        });

        // Build query - filter by selected colors/sizes if they exist
        const variantQuery = {
          catalogProductId: catalogProductId,
          // We include even inactive ones so storefront can grey them out
          // but if we only want to show products that have AT LEAST ONE active variant 
          // we might need different logic. For now, let's include all within selection.
        };

        if (hasSelectedColors) {
          variantQuery.color = { $in: selectedColors };
        }

        if (hasSelectedSizes) {
          variantQuery.size = { $in: selectedSizes };
        }

        const catalogVariants = await CatalogProductVariant.find(variantQuery)
          .select('_id size color colorHex skuTemplate basePrice isActive')
          .lean();

        console.log('[StoreProducts] Found catalog variants:', catalogVariants.length, catalogVariants.map(cv => ({ size: cv.size, color: cv.color })));

        if (catalogVariants && catalogVariants.length > 0) {
          // Transform catalog variants to match StoreProductVariant format
          // Use store product's sellingPrice as the base price for variants
          const basePrice = storeProduct.sellingPrice || storeProduct.price || 0;

          variants = catalogVariants.map((cv) => ({
            catalogProductVariantId: {
              _id: cv._id,
              size: cv.size,
              color: cv.color,
              colorHex: cv.colorHex,
              skuTemplate: cv.skuTemplate,
              basePrice: cv.basePrice,
              isActive: cv.isActive,
            },
            size: cv.size,
            color: cv.color,
            colorHex: cv.colorHex,
            sku: cv.skuTemplate,
            sellingPrice: basePrice, // Use store product's selling price
            isActive: cv.isActive,
          }));

          console.log('[StoreProducts] Mapped variants:', variants.length, variants.map(v => ({ size: v.size, color: v.color })));
        } else {
          console.log('[StoreProducts] No catalog variants found for catalogProductId:', catalogProductId, 'with filters:', { hasSelectedColors, hasSelectedSizes });
        }
      } else {
        console.log('[StoreProducts] No catalogProductId found for product:', productId, 'storeProduct.catalogProductId:', storeProduct.catalogProductId);
      }
    } else {
      console.log('[StoreProducts] Using store-specific variants:', variants.length);
      // Compute effective isActive: a variant is only active if BOTH
      // the store variant AND the catalog variant are active.
      // Without this, an admin marking a catalog variant OOS would not
      // be reflected on the store page (store variant isActive stays true).
      variants = variants.map(v => ({
        ...v,
        isActive: (v.isActive !== false) && (v.catalogProductVariantId?.isActive !== false),
      }));
    }

    // Extract minimumQuantity from catalog product stocks
    const catalogProduct = storeProduct.catalogProductId;
    const minimumQuantity = (catalogProduct?.stocks?.minimumQuantity) || 1;

    return res.json({
      success: true,
      data: {
        ...storeProduct,
        minimumQuantity,
        variants,
      },
    });
  } catch (error) {
    console.error('Error fetching public store product:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch store product' });
  }
});

// @route   GET /api/store-products/:id
// @desc    Get a single store product by ID for the current merchant/superadmin
// @access  Private (merchant, superadmin)
router.get('/:id', protect, authorize('merchant', 'superadmin'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid store product ID' });
    }

    const sp = await StoreProduct.findById(id);
    if (!sp) {
      return res.status(404).json({ success: false, message: 'Store product not found' });
    }

    const store = await Store.findById(sp.storeId);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // Merchants can only access their own stores; superadmin can access all
    if (req.user.role !== 'superadmin' && String(store.merchant) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    return res.json({ success: true, data: sp });
  } catch (error) {
    console.error('Error fetching store product by id:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch store product' });
  }
});

// @route   GET /api/store-products
// @desc    List store products for current merchant (all their stores)
// @access  Private (merchant, superadmin)
router.get('/', protect, authorize('merchant', 'superadmin'), async (req, res) => {
  try {
    const { status, isActive, storeId } = req.query;

    let storeFilter = {};
    if (req.user.role !== 'superadmin') {
      storeFilter.merchant = req.user._id;
    }

    let storeIds = [];
    if (storeId) {
      // If storeId is provided, verify it belongs to the merchant
      if (!mongoose.Types.ObjectId.isValid(storeId)) {
        return res.status(400).json({ success: false, message: 'Invalid storeId' });
      }
      const store = await Store.findOne({ ...storeFilter, _id: storeId, isActive: true }, { _id: 1 });
      if (!store) {
        return res.status(404).json({ success: false, message: 'Store not found or not owned by you' });
      }
      storeIds = [store._id];
    } else {
      const stores = await Store.find({ ...storeFilter, isActive: true }, { _id: 1 });
      storeIds = stores.map(s => s._id);
    }

    const spFilter = { storeId: { $in: storeIds } };
    if (status) spFilter.status = status;
    if (isActive !== undefined) spFilter.isActive = isActive === 'true';

    const products = await StoreProduct.find(spFilter)
      .sort({ updatedAt: -1 })
      .lean();

    // Live-refresh variantsSummary.isActive from catalog variants so the
    // dashboard always reflects current stock, even if the product was
    // published before a variant went out of stock.
    if (products.length > 0) {
      const productIds = products.map(p => p._id);

      // Fetch all store variants for these products in one query
      const storeVariants = await StoreProductVariant.find({
        storeProductId: { $in: productIds },
      }).populate({
        path: 'catalogProductVariantId',
        select: 'size color colorHex basePrice skuTemplate isActive',
      }).lean();

      // Index by storeProductId for quick lookup
      const variantsByProduct = {};
      storeVariants.forEach(sv => {
        const spId = sv.storeProductId.toString();
        if (!variantsByProduct[spId]) variantsByProduct[spId] = [];
        variantsByProduct[spId].push(sv);
      });

      // Patch each product's variantsSummary with live isActive
      products.forEach(product => {
        const spId = product._id.toString();
        const liveVariants = variantsByProduct[spId];
        if (!liveVariants || liveVariants.length === 0) return;

        product.variantsSummary = liveVariants
          .filter(sv => sv.catalogProductVariantId)
          .map(sv => {
            const cv = sv.catalogProductVariantId;
            return {
              catalogProductVariantId: cv._id,
              size: cv.size,
              color: cv.color,
              colorHex: cv.colorHex,
              sku: sv.sku || cv.skuTemplate,
              sellingPrice: typeof sv.sellingPrice === 'number' ? sv.sellingPrice : undefined,
              basePrice: typeof cv.basePrice === 'number' ? cv.basePrice : undefined,
              // Live join: OOS if either the store variant or catalog variant is inactive
              isActive: sv.isActive !== false && cv.isActive !== false,
            };
          });
      });
    }

    return res.json({ success: true, data: products });
  } catch (error) {
    console.error('Error listing store products:', error);
    return res.status(500).json({ success: false, message: 'Failed to list store products' });
  }
});

// @route   PATCH /api/store-products/:id/design-preview
// @desc    Update design preview images in designData for a store product
// @access  Private (merchant, superadmin)
router.patch('/:id/design-preview', protect, authorize('merchant', 'superadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { viewKey, previewUrl, elements, designUrlsByPlaceholder } = req.body;

    if (!viewKey || !previewUrl) {
      return res.status(400).json({ success: false, message: 'viewKey and previewUrl are required' });
    }

    const sp = await StoreProduct.findById(id);
    if (!sp) return res.status(404).json({ success: false, message: 'Store product not found' });

    const store = await Store.findById(sp.storeId);
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });
    if (req.user.role !== 'superadmin' && String(store.merchant) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Initialize designData if it doesn't exist
    if (!sp.designData) {
      sp.designData = {};
    }

    // Initialize views object if it doesn't exist
    if (!sp.designData.views) {
      sp.designData.views = {};
    }

    // Initialize previewImagesByView if it doesn't exist
    // if (!sp.designData.previewImagesByView) {
    //   sp.designData.previewImagesByView = {};
    // }

    // Update the preview for this view
    // sp.designData.previewImagesByView[viewKey] = previewUrl;

    // Update view-specific data
    if (!sp.designData.views[viewKey]) {
      sp.designData.views[viewKey] = {};
    }
    sp.designData.views[viewKey].previewImageUrl = previewUrl;

    // Update elements and designUrlsByPlaceholder if provided
    if (elements !== undefined) {
      sp.designData.views[viewKey].elements = elements;
    }
    if (designUrlsByPlaceholder !== undefined) {
      sp.designData.views[viewKey].designUrlsByPlaceholder = designUrlsByPlaceholder;
    }

    // If this is the front view, also update the primary preview
    if (viewKey === 'front') {
      sp.designData.previewImageUrl = previewUrl;
    }

    // Mark the designData as modified so Mongoose saves it
    sp.markModified('designData');
    await sp.save();

    return res.json({
      success: true,
      message: `Preview saved for ${viewKey} view`,
      data: {
        viewKey,
        previewUrl,
        designData: sp.designData
      }
    });
  } catch (error) {
    console.error('Error updating design preview:', error);
    return res.status(500).json({ success: false, message: 'Failed to update design preview' });
  }
});

// @route   PATCH /api/store-products/:id/mockup
// @desc    Save a mockup preview (flat or model) with proper type separation
// @access  Private (merchant, superadmin)
router.patch('/:id/mockup', protect, authorize('merchant', 'superadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      mockupType,  // 'flat' | 'model'
      viewKey,     // 'front' | 'back' | 'left' | 'right'
      colorKey,    // Required for model mockups (e.g., 'cerulean-frost')
      imageUrl
    } = req.body;

    // Validation
    if (!mockupType || !viewKey || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'mockupType, viewKey, and imageUrl are required'
      });
    }

    if (!['flat', 'model'].includes(mockupType)) {
      return res.status(400).json({
        success: false,
        message: 'mockupType must be "flat" or "model"'
      });
    }

    if (mockupType === 'model' && !colorKey) {
      return res.status(400).json({
        success: false,
        message: 'colorKey is required for model mockups'
      });
    }

    const sp = await StoreProduct.findById(id);
    if (!sp) {
      return res.status(404).json({ success: false, message: 'Store product not found' });
    }

    const store = await Store.findById(sp.storeId);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    if (req.user.role !== 'superadmin' && String(store.merchant) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Initialize designData structures
    // if (!sp.designData) sp.designData = {};
    // if (!sp.designData.previewImagesByView) sp.designData.previewImagesByView = {};

    if (mockupType === 'flat') {
      // Store flat mockups separately
      if (!sp.designData.flatMockups) sp.designData.flatMockups = {};
      sp.designData.flatMockups[viewKey] = imageUrl;

      // Update legacy field for backward compatibility
      // sp.designData.previewImagesByView[viewKey] = imageUrl;

      // Update primary preview if front view
      if (viewKey === 'front') {
        sp.designData.previewImageUrl = imageUrl;
      }

      console.log(`[Mockup] Saved flat mockup for ${viewKey}:`, imageUrl.substring(0, 50) + '...');
    } else {
      // Store model mockups separately, keyed by color
      if (!sp.designData.modelMockups) sp.designData.modelMockups = {};
      if (!sp.designData.modelMockups[colorKey]) sp.designData.modelMockups[colorKey] = {};
      sp.designData.modelMockups[colorKey][viewKey] = imageUrl;

      // Update legacy field for backward compatibility with color-prefixed key
      // const legacyKey = `mockup-${colorKey}-${viewKey}`;
      // sp.designData.previewImagesByView[legacyKey] = imageUrl;

      console.log(`[Mockup] Saved model mockup for ${colorKey}/${viewKey}:`, imageUrl.substring(0, 50) + '...');
    }

    sp.markModified('designData');
    await sp.save();

    return res.json({
      success: true,
      message: `${mockupType} mockup saved for ${mockupType === 'model' ? `${colorKey}/${viewKey}` : viewKey}`,
      data: {
        mockupType,
        viewKey,
        colorKey: colorKey || null,
        imageUrl,
        flatMockups: sp.designData.flatMockups,
        modelMockups: sp.designData.modelMockups
      }
    });
  } catch (error) {
    console.error('Error saving mockup:', error);
    return res.status(500).json({ success: false, message: 'Failed to save mockup' });
  }
});

// @route   PATCH /api/store-products/:id
// @desc    Update store product fields (status, isActive, pricing, title, etc.)
// @access  Private (merchant, superadmin)
router.patch('/:id', protect, authorize('merchant', 'superadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};

    const sp = await StoreProduct.findById(id);
    if (!sp) return res.status(404).json({ success: false, message: 'Store product not found' });

    const store = await Store.findById(sp.storeId);
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });
    if (req.user.role !== 'superadmin' && String(store.merchant) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Handle publish/draft transitions
    if (updates.status === 'published' && sp.status !== 'published') {
      sp.status = 'published';
      sp.publishedAt = new Date();
    } else if (updates.status === 'draft') {
      sp.status = 'draft';
      sp.publishedAt = undefined;
    }

    if (typeof updates.isActive === 'boolean') sp.isActive = updates.isActive;
    if (updates.title !== undefined) sp.title = updates.title;
    if (updates.description !== undefined) sp.description = updates.description;
    if (updates.sellingPrice !== undefined) sp.sellingPrice = updates.sellingPrice;
    if (updates.compareAtPrice !== undefined) sp.compareAtPrice = updates.compareAtPrice;


    // Handle storeId update (reassign product to different store)
    if (updates.storeId && String(updates.storeId) !== String(sp.storeId)) {
      // Validate the new store exists and belongs to this user
      const newStore = await Store.findById(updates.storeId);
      if (!newStore) {
        return res.status(404).json({ success: false, message: 'Target store not found' });
      }
      if (req.user.role !== 'superadmin' && String(newStore.merchant) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: 'Not authorized to publish to this store' });
      }

      console.log('[StoreProducts] Reassigning product from store', sp.storeId, 'to', updates.storeId);
      sp.storeId = updates.storeId;
    }

    // Handle designData updates
    if (updates.designData !== undefined) {
      let cleanDesignData = { ...updates.designData };
      delete cleanDesignData.previewImagesByView;
      delete cleanDesignData.tags;
      delete cleanDesignData.galleryImages;
      
      sp.designData = { ...(sp.designData || {}), ...cleanDesignData };
      
      // Also delete from existing designData if they are already present
      if (sp.designData) {
        delete sp.designData.previewImagesByView;
        delete sp.designData.tags;
        delete sp.designData.galleryImages;
      }
      
      sp.markModified('designData');
    }

    // Persist basic StoreProduct field changes before working with variants
    await sp.save();

    let updatedVariants = [];
    if (Array.isArray(updates.variants) && updates.variants.length > 0) {
      // Upsert each variant for this store product (same logic as POST route)
      updatedVariants = await Promise.all(
        updates.variants.map(async (v) => {
          if (!v.catalogProductVariantId || !v.sku) return null;

          const vpFilter = {
            storeProductId: sp._id,
            catalogProductVariantId: v.catalogProductVariantId,
          };

          const vpUpdate = {
            $set: {
              storeProductId: sp._id,
              catalogProductVariantId: v.catalogProductVariantId,
              sku: v.sku,
              ...(v.sellingPrice !== undefined ? { sellingPrice: v.sellingPrice } : {}),
              ...(v.isActive !== undefined ? { isActive: v.isActive } : {}),
            },
          };

          return await StoreProductVariant.findOneAndUpdate(
            vpFilter,
            vpUpdate,
            { new: true, upsert: true, setDefaultsOnInsert: true },
          );
        })
      );

      updatedVariants = updatedVariants.filter(Boolean);

      // Replace-style sync: Delete any StoreProductVariant for this product that 
      // was NOT in the incoming variants list. This ensures removed sizes/colors
      // are actually gone from the store.
      const keepCatalogVariantIds = updatedVariants.map(v => v.catalogProductVariantId.toString());
      await StoreProductVariant.deleteMany({
        storeProductId: sp._id,
        catalogProductVariantId: { $nin: keepCatalogVariantIds }
      });
      console.log(`[StoreProducts] Synced variants for ${sp._id}. Kept ${updatedVariants.length}.`);
    }

    // Rebuild embedded variantsSummary from ALL StoreProductVariant docs
    // (include inactive ones so dashboard can show OOS), joining live catalog isActive
    const allVariants = await StoreProductVariant.find({
      storeProductId: sp._id,
    }).populate({
      path: 'catalogProductVariantId',
      select: 'size color colorHex basePrice skuTemplate isActive',
    });

    sp.variantsSummary = allVariants
      .filter(v => v.catalogProductVariantId) // Filter out orphaned variants
      .map((v) => {
        const cv = v.catalogProductVariantId;
        return {
          catalogProductVariantId: cv._id,
          size: cv.size,
          color: cv.color,
          colorHex: cv.colorHex,
          sku: v.sku || cv.skuTemplate,
          sellingPrice: typeof v.sellingPrice === 'number' ? v.sellingPrice : undefined,
          basePrice: typeof cv.basePrice === 'number' ? cv.basePrice : undefined,
          // isActive: true only if BOTH the store variant AND the catalog variant are active
          isActive: v.isActive !== false && cv.isActive !== false,
        };
      });

    await sp.save();

    return res.json({
      success: true,
      data: sp,
      variants: updatedVariants,
    });
  } catch (error) {
    console.error('Error updating store product:', error);
    return res.status(500).json({ success: false, message: 'Failed to update store product' });
  }
});

// @route   DELETE /api/store-products/:id
// @desc    Delete a store product and its variants
// @access  Private (merchant, superadmin)
router.delete('/:id', protect, authorize('merchant', 'superadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const sp = await StoreProduct.findById(id);
    if (!sp) return res.status(404).json({ success: false, message: 'Store product not found' });

    const store = await Store.findById(sp.storeId);
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });
    if (req.user.role !== 'superadmin' && String(store.merchant) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await StoreProductVariant.deleteMany({ storeProductId: sp._id });
    await sp.deleteOne();
    return res.json({ success: true, message: 'Store product deleted' });
  } catch (error) {
    console.error('Error deleting store product:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete store product' });
  }
});

// @route   POST /api/store-products/:id/generate-mockups
// @desc    Generate mockups server-side using sharp and persist URLs to designData.modelMockups
// @access  Private (merchant, superadmin)
router.post('/:id/generate-mockups', protect, authorize('merchant', 'superadmin'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid store product ID' });
    }

    const storeProduct = await StoreProduct.findById(id);
    if (!storeProduct) {
      return res.status(404).json({ success: false, message: 'Store product not found' });
    }

    const store = await Store.findById(storeProduct.storeId);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    if (req.user.role !== 'superadmin' && String(store.merchant) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const catalogProductId = storeProduct.catalogProductId?._id
      ? storeProduct.catalogProductId._id
      : storeProduct.catalogProductId;

    const catalogProduct = await CatalogProduct.findById(catalogProductId).lean();
    if (!catalogProduct) {
      return res.status(404).json({ success: false, message: 'Catalog product not found' });
    }

    const sampleMockups = catalogProduct.design?.sampleMockups || [];
    const physicalDimensions = catalogProduct.design?.physicalDimensions || { width: 20, height: 24 };

    const designData = storeProduct.designData || {};
    const selectedColors = Array.isArray(designData.selectedColors) ? designData.selectedColors : [];
    const placementsByView = (designData.placementsByView && typeof designData.placementsByView === 'object')
      ? designData.placementsByView
      : {};
    const designUrlsByPlaceholder = (designData.designUrlsByPlaceholder && typeof designData.designUrlsByPlaceholder === 'object')
      ? designData.designUrlsByPlaceholder
      : {};

    // Accept design-only image URLs from client (includes text elements)
    const clientDesignOnlyImages = (req.body?.designOnlyImages && typeof req.body.designOnlyImages === 'object')
      ? req.body.designOnlyImages
      : {};

    // Fall back to DB-stored designOnlyImages (for regeneration from MockupsLibrary)
    const storedDesignOnlyImages = (designData.designOnlyImages && typeof designData.designOnlyImages === 'object')
      ? designData.designOnlyImages
      : {};

    const normalizeViewKeyEarly = (view) => (view || 'front').toLowerCase().trim();

    // Merge: client (fresh capture) takes priority over stored, stored takes priority over raw elements
    const designImagesByView = {};
    // Apply stored first, then client overwrites
    for (const k of Object.keys(storedDesignOnlyImages)) {
      const nk = normalizeViewKeyEarly(k);
      const u = storedDesignOnlyImages[k];
      if (typeof u === 'string' && u) designImagesByView[nk] = u;
    }
    for (const k of Object.keys(clientDesignOnlyImages)) {
      const nk = normalizeViewKeyEarly(k);
      const u = clientDesignOnlyImages[k];
      if (typeof u === 'string' && u) designImagesByView[nk] = u;
    }

    /** True if this view has a full-canvas design-only PNG (text + all artwork), not just a single image URL */
    const hasDesignOnlyCaptureForView = (vk) => {
      const check = (obj) => {
        if (!obj || typeof obj !== 'object') return false;
        return Object.keys(obj).some(
          (key) => normalizeViewKeyEarly(key) === vk && typeof obj[key] === 'string' && obj[key]
        );
      };
      return check(storedDesignOnlyImages) || check(clientDesignOnlyImages);
    };

    // Only fill missing views from elements array (backward compat, no text)
    if (Array.isArray(designData.elements)) {
      for (const el of designData.elements) {
        if (el?.type === 'image' && el?.imageUrl && el?.visible !== false) {
          const vk = (el.view || 'front').toLowerCase();
          if (!designImagesByView[vk]) {
            designImagesByView[vk] = el.imageUrl;
          }
        }
      }
    }

    // Load catalog variants (used for per-color viewImages + fallback color discovery)
    const catalogVariants = await CatalogProductVariant.find({
      catalogProductId: catalogProductId,
      ...(selectedColors.length > 0 ? { color: { $in: selectedColors } } : {}),
    }).lean();

    const variantsByColor = {};
    catalogVariants.forEach(v => {
      const key = (v.color || '').toLowerCase();
      if (!variantsByColor[key]) variantsByColor[key] = v;
    });

    const modelMockups = (designData.modelMockups && typeof designData.modelMockups === 'object')
      ? { ...designData.modelMockups }
      : {};

    const errors = [];

    const normalizeColorKey = (color) => (color || '').toLowerCase().trim().replace(/\s+/g, '-');
    const normalizeViewKey = (view) => (view || 'front').toLowerCase().trim();

    // Optional: restrict generation to a single color (sent by MockupsLibrary for lazy sequential loading)
    const colorFilter = req.body?.colorFilter || null;

    // Fallback color discovery for older drafts where selectedColors wasn't persisted
    const allColors = (() => {
      if (selectedColors.length > 0) return selectedColors;

      const byColor = designData.selectedSizesByColor;
      if (byColor && typeof byColor === 'object' && !Array.isArray(byColor)) {
        const keys = Object.keys(byColor).filter(Boolean);
        if (keys.length > 0) return keys;
      }

      const unique = new Set();
      catalogVariants.forEach(v => {
        if (v && v.color) unique.add(v.color);
      });
      return Array.from(unique);
    })();

    const colorsToProcess = colorFilter
      ? allColors.filter(c => normalizeColorKey(c) === colorFilter)
      : allColors;

    // Process each color sequentially; save intermediate results after each color
    // so the client polling can pick up completed rows before the full job finishes.
    for (const color of colorsToProcess) {
      const colorKey = normalizeColorKey(color);
      if (!modelMockups[colorKey]) modelMockups[colorKey] = {};

      const variant = variantsByColor[(color || '').toLowerCase()] || null;

      const colorMockups = [
        ...sampleMockups.filter((m) => !m.colorKey || m.colorKey === color),
      ];

      if (variant && variant.viewImages) {
        for (const view of ['front', 'back', 'left', 'right']) {
          const variantUrl = variant.viewImages[view];
          if (!variantUrl) continue;
          if (colorMockups.some((m) => (m.viewKey || '').toLowerCase() === view)) continue;

          const masterView = Array.isArray(designData.views)
            ? designData.views.find((v) => (v.key || '').toLowerCase() === view)
            : null;

          colorMockups.push({
            id: `variant-${variant._id}-${view}-${colorKey}`,
            viewKey: view,
            imageUrl: variantUrl,
            placeholders: (masterView && masterView.placeholders) ? masterView.placeholders : [],
          });
        }
      }

      // Process all views for this color sequentially
      for (const mockup of colorMockups) {
        const viewKey = normalizeViewKey(mockup.viewKey);
        const designUrl = designImagesByView[viewKey];
        const placeholder = Array.isArray(mockup.placeholders) ? mockup.placeholders[0] : null;

        // Reject if realistic composite takes longer than 5 s → Konva fallback
        const realisticWithTimeout = (compositePromise) =>
          Promise.race([
            compositePromise,
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error(`Composite timeout (>5 s) for ${colorKey}/${viewKey}`)),
                5000
              )
            ),
          ]);

        try {
          let imageBuffer;

          if (designUrl && placeholder) {
            const viewPlacements = placementsByView[viewKey] || {};
            const placementForPh = placeholder.id
              ? (viewPlacements[placeholder.id] ?? null)
              : null;

            const viewDesignUrls = designUrlsByPlaceholder[viewKey] || {};
            // Prefer full-view design-only PNG (includes text/shapes) over per-placeholder
            // image URLs — placeholder URLs are raw uploads and omit Konva text.
            const resolvedDesignUrl =
              hasDesignOnlyCaptureForView(viewKey)
                ? designUrl
                : (placeholder.id && viewDesignUrls[placeholder.id]
                  ? viewDesignUrls[placeholder.id]
                  : designUrl);

            try {
              // Realistic two-pass WebGL-style composite (fabric texture multiply).
              // compositeMockup already falls back to flat 'over' composite internally
              // if Pass 2 (fabric texture) fails.
              // eslint-disable-next-line no-await-in-loop
              imageBuffer = await realisticWithTimeout(
                compositeMockup(
                  mockup.imageUrl,
                  resolvedDesignUrl,
                  placeholder,
                  physicalDimensions,
                  placementForPh
                )
              );
              console.log(`[generate-mockups] realistic composite ok for ${colorKey}/${viewKey}`);
            } catch (compositeErr) {
              // compositeMockup itself failed entirely (e.g. design URL unreachable).
              // Konva-style fallback: download the bare garment image.
              console.warn(
                `[generate-mockups] realistic composite failed for ${colorKey}/${viewKey}, using bare garment fallback:`,
                compositeErr.message
              );
              const axios = require('axios');
              // eslint-disable-next-line no-await-in-loop
              const fallbackResp = await axios.get(mockup.imageUrl, { responseType: 'arraybuffer' });
              imageBuffer = Buffer.from(fallbackResp.data);
            }
          } else {
            const axios = require('axios');
            // eslint-disable-next-line no-await-in-loop
            const resp = await axios.get(mockup.imageUrl, { responseType: 'arraybuffer' });
            imageBuffer = Buffer.from(resp.data);
          }

          const filename = `generated-${uuidv4()}.png`;
          const folder = 'mockups/generated';
          // eslint-disable-next-line no-await-in-loop
          const s3Url = await uploadToS3(imageBuffer, filename, folder);
          modelMockups[colorKey][viewKey] = s3Url;
          console.log(`[generate-mockups] ✓ ${colorKey}/${viewKey}:`, s3Url);
        } catch (e) {
          const message = e && e.message ? e.message : String(e);
          console.error(`[generate-mockups] ✗ ${colorKey}/${viewKey}:`, message);
          errors.push(`${colorKey}/${viewKey}: ${message}`);
        }
      }

      // Save this color's results immediately so polling clients see it before the next color starts
      // eslint-disable-next-line no-await-in-loop
      await StoreProduct.findByIdAndUpdate(id, {
        $set: { [`designData.modelMockups.${colorKey}`]: modelMockups[colorKey] },
      });
      console.log(`[generate-mockups] saved intermediate results for color "${colorKey}"`);
    }

    if (Object.keys(clientDesignOnlyImages).length > 0) {
      const existingDesignOnly = (designData.designOnlyImages && typeof designData.designOnlyImages === 'object')
        ? designData.designOnlyImages
        : {};
      const mergedDesignOnlyImages = { ...existingDesignOnly };
      for (const k of Object.keys(clientDesignOnlyImages)) {
        const nk = normalizeViewKeyEarly(k);
        const u = clientDesignOnlyImages[k];
        if (typeof u === 'string' && u) mergedDesignOnlyImages[nk] = u;
      }
      await StoreProduct.findByIdAndUpdate(id, {
        $set: { 'designData.designOnlyImages': mergedDesignOnlyImages },
      });
    }

    // Re-fetch the full modelMockups so the response reflects all colors, not just
    // what was processed in this call (important when colorFilter is active).
    const refreshed = await StoreProduct.findById(id).lean();
    const finalModelMockups = refreshed?.designData?.modelMockups || modelMockups;

    return res.json({
      success: true,
      modelMockups: finalModelMockups,
      ...(errors.length > 0 ? { errors } : {}),
    });
  } catch (e) {
    console.error('[generate-mockups] Fatal:', e);
    return res.status(500).json({ success: false, message: e.message || 'Failed to generate mockups' });
  }
});

module.exports = router;
