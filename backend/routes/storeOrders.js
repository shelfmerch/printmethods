const express = require('express');
const router = express.Router();
const StoreOrder = require('../models/StoreOrder');
const Store = require('../models/Store');
const { protect, authorize } = require('../middleware/auth');
const ALLOWED_STATUSES = ['on-hold', 'paid', 'in-production', 'shipped', 'delivered', 'fulfilled', 'cancelled', 'refunded'];

const buildActor = (user) => ({
  id: user?._id,
  role: user?.role || '',
  name: user?.name || '',
  email: user?.email || '',
});

const appendStatusHistory = (order, status, user, note = '') => {
  if (!order.shipment) order.shipment = {};
  const history = Array.isArray(order.shipment.statusHistory) ? order.shipment.statusHistory : [];
  order.shipment.statusHistory = [
    ...history,
    {
      status,
      at: new Date(),
      note,
      actor: buildActor(user),
    },
  ];
  order.shipment.statusUpdatedAt = new Date();
  if (status === 'shipped' && !order.shipment.shippedAt) {
    order.shipment.shippedAt = new Date();
  }
  if (status === 'delivered' && !order.shipment.deliveredAt) {
    order.shipment.deliveredAt = new Date();
  }
};

const assertOrderAccess = async (order, user) => {
  if (!order) {
    return { allowed: false, status: 404, message: 'Order not found' };
  }

  if (user.role === 'superadmin') {
    return { allowed: true };
  }

  const storeId = order.storeId?._id || order.storeId;
  const store = await Store.findById(storeId).select('merchant');
  if (!store || String(store.merchant) !== String(user._id)) {
    return { allowed: false, status: 403, message: 'Not authorized to access this order' };
  }

  return { allowed: true };
};

// @route   GET /api/store-orders
// @desc    List store orders for current merchant (all their stores)
//         Superadmin sees all orders across all active stores
// @access  Private (merchant, superadmin)
router.get('/', protect, authorize('merchant', 'superadmin'), async (req, res) => {
  try {
    const user = req.user;

    // Superadmin can see all orders; merchants only their own
    const storeFilter = user.role === 'superadmin' ? {} : { merchant: user._id };

    const stores = await Store.find({ ...storeFilter, isActive: true }, { _id: 1 });
    const storeIds = stores.map((s) => s._id);

    const orders = await StoreOrder.find({ storeId: { $in: storeIds } })
      .sort({ createdAt: -1 })
      .populate('storeId', 'name')
      .lean();

    return res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error listing store orders:', error);
    return res.status(500).json({ success: false, message: 'Failed to list store orders' });
  }
});

// @route   GET /api/store-orders/:id
// @desc    Get single order details with storeProduct designData populated
// @access  Private (merchant, superadmin)
router.get('/:id', protect, authorize('merchant', 'superadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const order = await StoreOrder.findById(id)
      .populate('storeId', 'name')
      .populate({
        path: 'items.storeProductId',
        select: 'title description designData galleryImages sellingPrice'
      });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Merchants can only see orders for their own stores
    const access = await assertOrderAccess(order, user);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    return res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching store order details:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch order details' });
  }
});

// @route   PATCH /api/store-orders/:id/status
// @desc    Update order status (superadmin only)
// @access  Private (superadmin)
router.patch('/:id/status', protect, authorize('superadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note = '' } = req.body || {};

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    const order = await StoreOrder.findById(id);
    const access = await assertOrderAccess(order, req.user);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    order.status = status;
    appendStatusHistory(order, status, req.user, note);
    await order.save();

    return res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error updating store order status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

// @route   PATCH /api/store-orders/:id/shipment
// @desc    Update shipment fields for a store order
// @access  Private (superadmin)
router.patch('/:id/shipment', protect, authorize('superadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      carrier = '',
      trackingNumber = '',
      trackingUrl = '',
      shippedAt,
      deliveredAt,
      internalNotes = '',
      status,
      note = '',
    } = req.body || {};

    const order = await StoreOrder.findById(id);
    const access = await assertOrderAccess(order, req.user);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    if (status && !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    if (!order.shipment) order.shipment = {};
    order.shipment.carrier = carrier;
    order.shipment.trackingNumber = trackingNumber;
    order.shipment.trackingUrl = trackingUrl;
    order.shipment.internalNotes = internalNotes;
    order.shipment.statusUpdatedAt = new Date();
    order.shipment.shippedAt = shippedAt ? new Date(shippedAt) : order.shipment.shippedAt;
    order.shipment.deliveredAt = deliveredAt ? new Date(deliveredAt) : order.shipment.deliveredAt;

    const nextStatus = status || (order.shipment.deliveredAt ? 'delivered' : order.shipment.shippedAt ? 'shipped' : order.status);
    if (nextStatus !== order.status || note) {
      order.status = nextStatus;
      appendStatusHistory(order, nextStatus, req.user, note || 'Shipment updated');
    }

    await order.save();
    return res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error updating store order shipment:', error);
    return res.status(500).json({ success: false, message: 'Failed to update shipment details' });
  }
});

// @route   GET /api/store-orders/admin/stats
// @desc    Get dashboard statistics for superadmins
// @access  Private (superadmin)
router.get('/admin/stats', protect, authorize('superadmin'), async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Revenue and Order counts
    const statsResult = await StoreOrder.aggregate([
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$total' },
                totalOrders: { $sum: 1 },
                deliveredOrders: {
                  $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
                }
              }
            }
          ],
          monthly: [
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
              $group: {
                _id: null,
                monthlyRevenue: { $sum: '$total' },
                monthlyOrders: { $sum: 1 }
              }
            }
          ],
          topProducts: [
            { $unwind: '$items' },
            {
              $group: {
                _id: '$items.storeProductId',
                productName: { $first: '$items.productName' },
                mockupUrl: { $first: '$items.mockupUrl' },
                salesCount: { $sum: '$items.quantity' },
                revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
              }
            },
            { $sort: { salesCount: -1 } },
            { $limit: 10 }
          ]
        }
      }
    ]);

    const stats = statsResult[0];
    const overall = stats.overall[0] || { totalRevenue: 0, totalOrders: 0, deliveredOrders: 0 };
    const monthly = stats.monthly[0] || { monthlyRevenue: 0, monthlyOrders: 0 };
    const topProducts = stats.topProducts || [];

    return res.json({
      success: true,
      data: {
        totalRevenue: overall.totalRevenue,
        totalOrders: overall.totalOrders,
        deliveredOrders: overall.deliveredOrders,
        monthlyRevenue: monthly.monthlyRevenue,
        monthlyOrders: monthly.monthlyOrders,
        topProducts: topProducts
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin statistics' });
  }
});

module.exports = router;
