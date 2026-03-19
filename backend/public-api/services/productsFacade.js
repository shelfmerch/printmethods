/**
 * Products Facade Service
 * Wraps StoreProduct for public API.
 */
const StoreProduct = require('../../models/StoreProduct');
const CatalogProduct = require('../../models/CatalogProduct');
const CatalogProductVariant = require('../../models/CatalogProductVariant');
const { NotFoundError, ValidationError, ConflictError } = require('../core/errors');
const webhookService = require('./webhookService');
const { WEBHOOK_EVENTS } = require('../core/constants');

/**
 * Map a StoreProduct to a public DTO.
 */
function toDTO(product) {
    return {
        id: product._id,
        store_id: product.storeId,
        catalog_product_id: product.catalogProductId,
        title: product.title,
        description: product.description,
        selling_price: product.sellingPrice,
        compare_at_price: product.compareAtPrice || null,
        status: product.status,
        is_active: product.isActive,
        tags: product.tags || [],
        variants: (product.variantsSummary || []).map(v => ({
            catalog_variant_id: v.catalogProductVariantId,
            size: v.size,
            color: v.color,
            color_hex: v.colorHex,
            sku: v.sku,
            selling_price: v.sellingPrice,
            base_price: v.basePrice,
        })),
        images: (product.galleryImages || []).map(img => ({
            id: img.id,
            url: img.url,
            position: img.position,
            is_primary: img.isPrimary,
            type: img.imageType,
        })),
        published_at: product.publishedAt || null,
        created_at: product.createdAt,
        updated_at: product.updatedAt,
    };
}

/**
 * Customer-safe DTO — strips design internals.
 * Used by GET /shops/:shopId/products/:productId/public
 */
function toPublicProductDTO(doc) {
    return {
        id: doc._id,
        title: doc.title,
        description: doc.description,
        selling_price: doc.sellingPrice,
        status: doc.status,
        gallery_images: (doc.galleryImages || []).map((img) => ({
            id: img.id,
            url: img.url,
            position: img.position,
            is_primary: img.isPrimary,
            type: img.imageType,
            alt_text: img.altText || null,
        })),
        mockups: doc.designData?.modelMockups || {},
        variants: (doc.variantsSummary || [])
            .filter(v => v.isActive)
            .map(v => ({
                id: v.catalogProductVariantId,
                color: v.color,
                color_hex: v.colorHex,
                size: v.size,
                selling_price: v.sellingPrice,
                is_active: v.isActive,
            })),
        tags: doc.tags || [],
        published_at: doc.publishedAt || null,
    };
}

/**
 * List products for a user's stores.
 */
async function listProducts(userId, { storeId, status, page = 1, limit = 20 } = {}) {
    const Store = require('../../models/Store');
    const stores = await Store.find({ merchant: userId, isActive: true }).select('_id');
    const storeIds = stores.map(s => s._id);

    const filter = { storeId: { $in: storeIds }, isActive: true };
    if (storeId) filter.storeId = storeId;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
        StoreProduct.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        StoreProduct.countDocuments(filter),
    ]);

    return {
        items: products.map(toDTO),
        total,
        page,
        limit,
    };
}

/**
 * Get a single product by ID.
 */
async function getProduct(productId, userId) {
    const Store = require('../../models/Store');
    const stores = await Store.find({ merchant: userId }).select('_id');
    const storeIds = stores.map(s => s._id);

    const product = await StoreProduct.findOne({
        _id: productId,
        storeId: { $in: storeIds },
    }).lean();

    if (!product) {
        throw new NotFoundError('Product');
    }
    return toDTO(product);
}

/**
 * Create a product.
 */
async function createProduct(userId, data) {
    const Store = require('../../models/Store');
    const store = await Store.findOne({ _id: data.store_id, merchant: userId });
    if (!store) {
        throw new NotFoundError('Store');
    }

    // Validate catalog product exists
    const blueprintId = data.blueprint_id || data.catalog_product_id;
    const catalogProduct = await CatalogProduct.findOne({
        _id: blueprintId,
        isActive: true,
        isPublished: true,
    });
    if (!catalogProduct) {
        throw new NotFoundError('Blueprint');
    }

    if (!Array.isArray(data.selected_variant_ids) || data.selected_variant_ids.length === 0) {
        throw new ValidationError('At least one variant must be selected');
    }

    const variants = await CatalogProductVariant.find({
        _id: { $in: data.selected_variant_ids },
        catalogProductId: blueprintId,
        isActive: true,
        discontinuedAt: null,
    }).lean();

    if (variants.length !== data.selected_variant_ids.length) {
        throw new ValidationError('One or more selected variants are invalid or inactive');
    }

    const priceOverrideMap = {};
    (data.variant_price_overrides || []).forEach((o) => {
        if (o && o.catalog_variant_id) priceOverrideMap[o.catalog_variant_id] = o.selling_price;
    });

    const variantsSummary = variants.map((v) => ({
        catalogProductVariantId: v._id,
        size: v.size,
        color: v.color,
        colorHex: v.colorHex,
        sku: `CUSTOMIZED-${v.skuTemplate}`,
        basePrice: v.basePrice,
        sellingPrice: priceOverrideMap[v._id.toString()] ?? data.selling_price,
        isActive: true,
    }));

    const catalogSnapshot = {
        name: catalogProduct.name,
        category: catalogProduct.categoryId,
        material: catalogProduct.attributes?.material || null,
        shipping_weight_grams: catalogProduct.shipping?.packageWeightGrams || null,
        gst_slab: catalogProduct.gst?.slab || null,
        dpi: catalogProduct.design?.dpi || 300,
    };

    if (!data.design_data?.elements?.length) {
        throw new ValidationError('design_data.elements must not be empty');
    }

    const product = await StoreProduct.create({
        storeId: data.store_id,
        catalogProductId: blueprintId,
        source: 'api',
        title: data.title || catalogProduct.name,
        description: data.description || '',
        sellingPrice: data.selling_price,
        compareAtPrice: data.compare_at_price,
        tags: data.tags || [],
        designData: {
            elements: data.design_data.elements,
            placementsByView: data.design_data.placements_by_view,
            views: data.design_data.views,
            selectedColors: data.design_data.selected_colors,
            selectedSizes: data.design_data.selected_sizes,
            selectedSizesByColor: data.design_data.selected_sizes_by_color || {},
            primaryColorHex: data.design_data.primary_color_hex || null,
            modelMockups: data.design_data.model_mockups || {},
            displacementSettings: catalogProduct.design?.displacementSettings || {},
        },
        variantsSummary,
        catalogSnapshot,
        status: 'draft',
    });

    return toDTO(product);
}

/**
 * Update a product.
 */
async function updateProduct(productId, userId, data) {
    const Store = require('../../models/Store');
    const stores = await Store.find({ merchant: userId }).select('_id');
    const storeIds = stores.map(s => s._id);

    const update = {};
    if (data.title !== undefined) update.title = data.title;
    if (data.description !== undefined) update.description = data.description;
    if (data.selling_price !== undefined) update.sellingPrice = data.selling_price;
    if (data.compare_at_price !== undefined) update.compareAtPrice = data.compare_at_price;
    if (data.tags !== undefined) update.tags = data.tags;

    const product = await StoreProduct.findOneAndUpdate(
        { _id: productId, storeId: { $in: storeIds } },
        update,
        { new: true }
    );

    if (!product) {
        throw new NotFoundError('Product');
    }

    // Dispatch webhook
    webhookService.dispatchEvent(WEBHOOK_EVENTS.PRODUCT_UPDATED, toDTO(product), userId).catch(() => { });

    return toDTO(product);
}

/**
 * Delete a product.
 */
async function deleteProduct(productId, userId) {
    const Store = require('../../models/Store');
    const stores = await Store.find({ merchant: userId }).select('_id');
    const storeIds = stores.map(s => s._id);

    const result = await StoreProduct.findOneAndUpdate(
        { _id: productId, storeId: { $in: storeIds } },
        { isActive: false },
        { new: true }
    );

    if (!result) {
        throw new NotFoundError('Product');
    }

    return { id: productId, deleted: true };
}

/**
 * Publish a product.
 */
async function publishProduct(productId, userId) {
    const Store = require('../../models/Store');
    const stores = await Store.find({ merchant: userId }).select('_id');
    const storeIds = stores.map(s => s._id);

    const product = await StoreProduct.findOne({ _id: productId, storeId: { $in: storeIds } });

    if (!product) {
        throw new NotFoundError('Product');
    }

    if (product.status === 'published') {
        throw new ConflictError('Product is already published');
    }

    if (!product.galleryImages?.length && product.designData?.modelMockups) {
        const mockups = product.designData.modelMockups;
        const images = [];
        let position = 0;

        Object.entries(mockups).forEach(([colorKey, views]) => {
            ['front', 'back', 'left', 'right'].forEach((view) => {
                if (views && views[view]) {
                    images.push({
                        id: `gallery-${colorKey}-${view}-${Date.now()}`,
                        url: views[view],
                        position: position++,
                        isPrimary: position === 1,
                        imageType: 'mockup',
                        altText: `${product.title} — ${colorKey} ${view}`,
                    });
                }
            });
        });

        product.galleryImages = images;
    }

    product.status = 'published';
    product.publishedAt = new Date();
    await product.save();

    // Dispatch webhook
    webhookService.dispatchEvent(WEBHOOK_EVENTS.PRODUCT_PUBLISHED, toDTO(product), userId).catch(() => { });

    return toDTO(product);
}

/**
 * Get a public product (customer-safe) by shop+product ID.
 */
async function getPublicProduct(shopId, productId, userId) {
    const Store = require('../../models/Store');
    const store = await Store.findOne({ _id: shopId, merchant: userId, isActive: true }).lean();
    if (!store) throw new NotFoundError('Shop');

    const product = await StoreProduct.findOne({
        _id: productId,
        storeId: shopId,
        isActive: true,
        status: 'published',
    }).lean();
    if (!product) throw new NotFoundError('Product');

    return toPublicProductDTO(product);
}

/**
 * Unpublish a product.
 */
async function unpublishProduct(productId, userId) {
    const Store = require('../../models/Store');
    const stores = await Store.find({ merchant: userId }).select('_id');
    const storeIds = stores.map(s => s._id);

    const product = await StoreProduct.findOneAndUpdate(
        { _id: productId, storeId: { $in: storeIds } },
        { status: 'draft' },
        { new: true }
    );

    if (!product) {
        throw new NotFoundError('Product');
    }

    return toDTO(product);
}

module.exports = {
    listProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    publishProduct,
    unpublishProduct,
    toDTO,
    toPublicProductDTO,
    getPublicProduct,
};
