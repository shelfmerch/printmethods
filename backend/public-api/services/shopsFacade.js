/**
 * Shops Facade Service
 * Wraps existing Store model for public API, using DTO mapping.
 */
const Store = require('../../models/Store');
const { NotFoundError, ValidationError } = require('../core/errors');

/**
 * Generate a URL-safe slug from a name string.
 */
function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Map a Store document to a public DTO.
 */
function toDTO(store) {
    return {
        id: store._id,
        name: store.name,
        slug: store.slug,
        type: store.type,
        currency: store.currency || store.settings?.currency || 'INR',
        country: store.country || 'India',
        status: store.status || (store.isActive ? 'active' : 'inactive'),
        description: store.description || null,
        domain: store.domain || null,
        settings: {
            currency: store.settings?.currency || store.currency || 'INR',
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
 * Create a new shop via API.
 */
async function createShop(userId, { name, currency = 'INR', country = 'India' } = {}) {
    if (!name || !name.trim()) {
        throw new ValidationError('name is required');
    }

    let baseSlug = generateSlug(name.trim());
    if (!baseSlug) {
        baseSlug = `shop-${Date.now().toString(36)}`;
    }

    // Ensure slug uniqueness
    let slug = baseSlug;
    let suffix = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const existing = await Store.findOne({ slug }).lean();
        if (!existing) break;
        slug = `${baseSlug}-${suffix++}`;
    }

    const store = await Store.create({
        name: name.trim(),
        slug,
        merchant: userId,
        type: 'native',
        currency: (currency || 'INR').toUpperCase(),
        country: country || 'India',
        status: 'active',
        description: '',
        settings: {
            currency: (currency || 'INR').toUpperCase(),
            timezone: 'UTC',
            primaryColor: '#000000',
        },
        isActive: true,
        isConnected: false,
    });

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
    createShop,
    disconnectShop,
    toDTO,
};
