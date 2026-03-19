/**
 * Catalog Facade Service
 * Wraps CatalogProduct + CatalogProductVariant for public API.
 */
const CatalogProduct = require('../../models/CatalogProduct');
const CatalogProductVariant = require('../../models/CatalogProductVariant');
const { NotFoundError } = require('../core/errors');
const catalogService = require('../../services/catalog.service');

/**
 * Map a CatalogProduct to a public blueprint DTO.
 */
function toBlueprintDTO(product) {
    return {
        id: product._id,
        name: product.name,
        description: product.description,
        category_id: product.categoryId,
        product_type_code: product.productTypeCode,
        tags: product.tags || [],
        base_price: product.basePrice,
        images: (product.galleryImages || []).map(img => ({
            id: img.id,
            url: img.url,
            position: img.position,
            is_primary: img.isPrimary,
            type: img.imageType,
        })),
        design: product.design ? {
            dpi: product.design.dpi,
            views: (product.design.views || []).map(v => ({
                key: v.key,
                mockup_image_url: v.mockupImageUrl,
                placeholders: (v.placeholders || []).map(p => ({
                    id: p.id,
                    x_in: p.xIn,
                    y_in: p.yIn,
                    width_in: p.widthIn,
                    height_in: p.heightIn,
                })),
            })),
        } : null,
        shipping: product.shipping ? {
            weight_grams: product.shipping.packageWeightGrams,
            length_cm: product.shipping.packageLengthCm,
            width_cm: product.shipping.packageWidthCm,
            height_cm: product.shipping.packageHeightCm,
        } : null,
        created_at: product.createdAt,
        updated_at: product.updatedAt,
    };
}

/**
 * Map a CatalogProductVariant to a public DTO.
 */
function toVariantDTO(variant) {
    return {
        id: variant._id,
        catalog_product_id: variant.catalogProductId,
        size: variant.size,
        color: variant.color,
        color_hex: variant.colorHex,
        sku: variant.sku,
        base_price: variant.basePrice,
        is_active: variant.isActive,
    };
}

/**
 * List catalog blueprints.
 */
async function listBlueprints({ page = 1, limit = 20, category } = {}) {
    const filter = { isActive: true, isPublished: true };
    if (category) filter.categoryId = category;

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
        CatalogProduct.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        CatalogProduct.countDocuments(filter),
    ]);

    return {
        items: products.map(toBlueprintDTO),
        total,
        page,
        limit,
    };
}

/**
 * Get a single blueprint by ID.
 */
async function getBlueprint(id) {
    const product = await CatalogProduct.findOne({ _id: id, isActive: true, isPublished: true }).lean();
    if (!product) {
        throw new NotFoundError('Blueprint');
    }
    return toBlueprintDTO(product);
}

/**
 * Get variants for a blueprint.
 */
async function getBlueprintVariants(blueprintId) {
    const product = await CatalogProduct.findOne({ _id: blueprintId, isActive: true, isPublished: true }).lean();
    if (!product) {
        throw new NotFoundError('Blueprint');
    }

    const variants = await CatalogProductVariant.find({
        catalogProductId: blueprintId,
        isActive: true,
    }).lean();

    return variants.map(toVariantDTO);
}

/**
 * List print providers (placeholder — returns catalog groupings).
 */
async function listPrintProviders() {
    // Aggregate unique productTypeCodes as "providers"
    const types = await CatalogProduct.distinct('productTypeCode', { isActive: true, isPublished: true });
    return types.map((code, i) => ({
        id: `provider_${i + 1}`,
        name: code,
        product_type_code: code,
    }));
}

/**
 * Get catalog pricing (returns base prices by product type).
 */
async function getCatalogPricing({ productTypeCode } = {}) {
    const filter = { isActive: true, isPublished: true };
    if (productTypeCode) filter.productTypeCode = productTypeCode;

    const products = await CatalogProduct.find(filter)
        .select('name productTypeCode basePrice')
        .lean();

    return products.map(p => ({
        blueprint_id: p._id,
        name: p.name,
        product_type_code: p.productTypeCode,
        base_price: p.basePrice,
    }));
}

module.exports = {
    listBlueprints,
    getBlueprint,
    getBlueprintVariants,
    listPrintProviders,
    getCatalogPricing,
    // New catalog endpoints (preferred)
    listCatalogProducts: catalogService.listCatalogProducts,
    getCatalogProductDetail: catalogService.getCatalogProductDetail,
    getCatalogVariants: catalogService.getCatalogVariants,
};
