/**
 * Orders Facade Service
 * Wraps StoreOrder model for public API (v1 = StoreOrder only).
 */
const StoreOrder = require('../../models/StoreOrder');
const Store = require('../../models/Store');
const { NotFoundError, ValidationError } = require('../core/errors');
const webhookService = require('./webhookService');
const { WEBHOOK_EVENTS } = require('../core/constants');

/**
 * Map a StoreOrder to a public DTO.
 */
function toDTO(order) {
    return {
        id: order._id,
        store_id: order.storeId,
        customer_email: order.customerEmail || null,
        status: order.status,
        items: (order.items || []).map(item => ({
            product_id: item.storeProductId,
            product_name: item.productName,
            mockup_url: item.mockupUrl,
            quantity: item.quantity,
            price: item.price,
            variant: item.variant ? {
                color: item.variant.color,
                size: item.variant.size,
                sku: item.variant.sku,
            } : null,
        })),
        subtotal: order.subtotal,
        shipping: order.shipping,
        tax: order.tax,
        total: order.total,
        shipping_address: order.shippingAddress ? {
            full_name: order.shippingAddress.fullName,
            email: order.shippingAddress.email,
            phone: order.shippingAddress.phone,
            address1: order.shippingAddress.address1,
            address2: order.shippingAddress.address2,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            zip_code: order.shippingAddress.zipCode,
            country: order.shippingAddress.country,
        } : null,
        fulfillment: {
            status: order.fulfillmentPayment?.status || 'PAYMENT_PENDING',
            provider_orders: (order.providerOrders || []).map(po => ({
                provider_order_id: po.providerOrderId,
                status: po.status,
            })),
        },
        created_at: order.createdAt,
        updated_at: order.updatedAt,
    };
}

/**
 * Get user's store IDs.
 */
async function getUserStoreIds(userId) {
    const stores = await Store.find({ merchant: userId }).select('_id');
    return stores.map(s => s._id);
}

/**
 * List orders for all stores owned by the user.
 */
async function listOrders(userId, { status, from, to, page = 1, limit = 20, storeId } = {}) {
    const storeIds = await getUserStoreIds(userId);
    const filter = { storeId: { $in: storeIds } };

    if (storeId) filter.storeId = storeId;
    if (status) filter.status = status;
    if (from || to) {
        filter.createdAt = {};
        if (from) filter.createdAt.$gte = new Date(from);
        if (to) filter.createdAt.$lte = new Date(to);
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
        StoreOrder.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        StoreOrder.countDocuments(filter),
    ]);

    return {
        items: orders.map(toDTO),
        total,
        page,
        limit,
    };
}

/**
 * Get a single order by ID.
 */
async function getOrder(orderId, userId) {
    const storeIds = await getUserStoreIds(userId);
    const order = await StoreOrder.findOne({
        _id: orderId,
        storeId: { $in: storeIds },
    }).lean();

    if (!order) {
        throw new NotFoundError('Order');
    }
    return toDTO(order);
}

/**
 * Create an order.
 */
async function createOrder(userId, data) {
    const store = await Store.findOne({ _id: data.store_id, merchant: userId });
    if (!store) {
        throw new NotFoundError('Store');
    }

    const order = await StoreOrder.create({
        merchantId: userId,
        storeId: data.store_id,
        customerEmail: data.customer_email,
        items: (data.items || []).map(item => ({
            storeProductId: item.product_id,
            productName: item.product_name,
            mockupUrl: item.mockup_url,
            quantity: item.quantity,
            price: item.price,
            variant: item.variant,
        })),
        subtotal: data.subtotal,
        shipping: data.shipping || 0,
        tax: data.tax || 0,
        total: data.total,
        shippingAddress: data.shipping_address ? {
            fullName: data.shipping_address.full_name,
            email: data.shipping_address.email,
            phone: data.shipping_address.phone,
            address1: data.shipping_address.address1,
            address2: data.shipping_address.address2,
            city: data.shipping_address.city,
            state: data.shipping_address.state,
            zipCode: data.shipping_address.zip_code,
            country: data.shipping_address.country,
        } : undefined,
        status: 'on-hold',
    });

    const dto = toDTO(order);

    // Dispatch webhook
    webhookService.dispatchEvent(WEBHOOK_EVENTS.ORDER_CREATED, dto, userId).catch(() => { });

    return dto;
}

/**
 * Cancel an order.
 */
async function cancelOrder(orderId, userId) {
    const storeIds = await getUserStoreIds(userId);
    const order = await StoreOrder.findOneAndUpdate(
        {
            _id: orderId,
            storeId: { $in: storeIds },
            status: { $in: ['on-hold', 'paid'] },
        },
        { status: 'cancelled' },
        { new: true }
    );

    if (!order) {
        throw new NotFoundError('Order (or order cannot be cancelled)');
    }

    const dto = toDTO(order);
    webhookService.dispatchEvent(WEBHOOK_EVENTS.ORDER_UPDATED, dto, userId).catch(() => { });

    return dto;
}

/**
 * Get fulfillment details for an order.
 */
async function getOrderFulfillment(orderId, userId) {
    const storeIds = await getUserStoreIds(userId);
    const order = await StoreOrder.findOne({
        _id: orderId,
        storeId: { $in: storeIds },
    }).lean();

    if (!order) {
        throw new NotFoundError('Order');
    }

    return {
        order_id: order._id,
        status: order.status,
        fulfillment_payment: {
            status: order.fulfillmentPayment?.status || 'PAYMENT_PENDING',
        },
        provider_orders: (order.providerOrders || []).map(po => ({
            provider_order_id: po.providerOrderId,
            status: po.status,
        })),
    };
}

module.exports = {
    listOrders,
    getOrder,
    createOrder,
    cancelOrder,
    getOrderFulfillment,
    toDTO,
};
