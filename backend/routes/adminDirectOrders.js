const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const DirectOrder = require('../models/DirectOrder');
const { sendShippingNotificationEmail } = require('../utils/mailer');

const ADMIN_STATUSES = ['in-production', 'shipped', 'delivered', 'cancelled'];

const adminOnly = [protect, authorize('superadmin')];

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
};

const populateOrder = (query) => query
  .populate('merchantId', 'name email companyName')
  .populate('items.catalogProductId', 'name galleryImages')
  .populate('items.decorationMethodId', 'name code');

router.get('/', adminOnly, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const filter = { orderType: { $ne: 'quotation' } };
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }

    const [orders, total] = await Promise.all([
      populateOrder(
        DirectOrder.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
      ).lean(),
      DirectOrder.countDocuments(filter),
    ]);

    res.json({ success: true, data: { orders, total, page, limit } });
  } catch (err) {
    console.error('Admin direct orders list error:', err);
    res.status(500).json({ success: false, message: 'Failed to load direct orders' });
  }
});

router.get('/:id', adminOnly, async (req, res) => {
  try {
    const order = await populateOrder(DirectOrder.findById(req.params.id)).lean();
    if (!order) {
      return res.status(404).json({ success: false, message: 'Direct order not found' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    console.error('Admin direct order detail error:', err);
    res.status(500).json({ success: false, message: 'Failed to load direct order' });
  }
});

router.put('/:id/status', adminOnly, async (req, res) => {
  try {
    const {
      status,
      trackingNumber = '',
      carrier = '',
      trackingUrl = '',
      note = '',
    } = req.body || {};

    if (!ADMIN_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid direct order status' });
    }

    const order = await DirectOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Direct order not found' });
    }

    order.status = status;
    if (!order.shipment) order.shipment = {};
    if (status === 'shipped') {
      order.shipment.carrier = carrier;
      order.shipment.trackingNumber = trackingNumber;
      order.shipment.trackingUrl = trackingUrl;
      order.shipment.shippedAt = new Date();
    }
    if (status === 'delivered') {
      order.shipment.deliveredAt = new Date();
    }
    appendStatusHistory(order, status, req.user, note || `Marked ${status}`);
    await order.save();

    if (status === 'shipped') {
      try {
        await sendShippingNotificationEmail({
          to: order.customerEmail,
          recipientName: order.customerName,
          orderId: order._id,
          trackingNumber,
          carrier,
          trackingUrl,
          items: order.items,
        });
      } catch (emailErr) {
        console.error('Direct order shipping email failed:', emailErr);
      }
    }

    const updated = await populateOrder(DirectOrder.findById(order._id)).lean();
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Admin direct order status error:', err);
    res.status(500).json({ success: false, message: 'Failed to update direct order' });
  }
});

module.exports = router;
