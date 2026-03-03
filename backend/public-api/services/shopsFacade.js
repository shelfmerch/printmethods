/**
 * Shops Facade Service
 * Wraps existing Store model for public API, using DTO mapping.
 */
const Store = require('../../models/Store');
const { NotFoundError } = require('../core/errors');

/**
 * Map a Store document to a public DTO.
 */
function toDTO(store) {
    return {
        id: store._id,
        name: store.name,
        slug: store.slug,
        type: store.type,
        description: store.description || null,
        domain: store.domain || null,
        settings: {
            currency: store.settings?.currency || 'INR',
            timezone: store.settings?.timezone || 'UTC',
            logo_url: store.settings?.logoUrl || null,
            favicon_url: store.settings?.faviconUrl || null,
        },
        is_active: store.isActive,
        is_connected: store.isConnected,
        created_at: store.createdAt,
        updated_at: store.updatedAt,
    };
}

/**
 * List shops for the authenticated user.
 */
async function listShops(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;

    const [shops, total] = await Promise.all([
        Store.find({ merchant: userId, isActive: true })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Store.countDocuments({ merchant: userId, isActive: true }),
    ]);

    return {
        items: shops.map(toDTO),
        total,
        page,
        limit,
    };
}

/**
 * Get a single shop by ID.
 */
async function getShop(shopId, userId) {
    const store = await Store.findOne({ _id: shopId, merchant: userId }).lean();
    if (!store) {
        throw new NotFoundError('Shop');
    }
    return toDTO(store);
}

/**
 * Disconnect a shop (remove external connection).
 */
async function disconnectShop(shopId, userId) {
    const store = await Store.findOneAndUpdate(
        { _id: shopId, merchant: userId },
        {
            isConnected: false,
            $unset: { apiCredentials: 1, externalStoreId: 1, externalStoreName: 1 },
        },
        { new: true }
    );

    if (!store) {
        throw new NotFoundError('Shop');
    }

    return toDTO(store);
}

module.exports = {
    listShops,
    getShop,
    disconnectShop,
    toDTO,
};
