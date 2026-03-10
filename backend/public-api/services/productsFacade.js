/**
 * Products Facade Service
 * Wraps StoreProduct for public API.
 */
const StoreProduct = require('../../models/StoreProduct');
const CatalogProduct = require('../../models/CatalogProduct');
const { NotFoundError, ValidationError } = require('../core/errors');
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
        mockup_images: (product.mockupImages || []).map(img => ({
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

    const product = await StoreProduct.create({
        storeId: data.store_id,
        catalogProductId: blueprintId,
        title: data.title || catalogProduct.name,
        description: data.description || catalogProduct.description,
        sellingPrice: data.selling_price,
        compareAtPrice: data.compare_at_price,
        tags: data.tags || [],
        mockup_images: data.mockup_images || [],
        variantsSummary: data.variants || [],
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
    if (data.variants !== undefined) update.variantsSummary = data.variants;

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

    const product = await StoreProduct.findOneAndUpdate(
        { _id: productId, storeId: { $in: storeIds } },
        { status: 'published', publishedAt: new Date() },
        { new: true }
    );

    if (!product) {
        throw new NotFoundError('Product');
    }

    // Dispatch webhook
    webhookService.dispatchEvent(WEBHOOK_EVENTS.PRODUCT_PUBLISHED, toDTO(product), userId).catch(() => { });

    return toDTO(product);
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
};
