const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { protect } = require('../middleware/auth');
const DirectOrder = require('../models/DirectOrder');
const CatalogProduct = require('../models/CatalogProduct');
const ALLOWED_STATUSES = ['on-hold', 'quotation', 'po_received', 'partially_paid', 'paid', 'in-production', 'shipped', 'delivered', 'fulfilled', 'cancelled', 'refunded'];

const getRazorpay = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
};

const buildDirectReceipt = (userId) => {
  const timestamp = Date.now().toString(36);
  const userSuffix = String(userId || '').slice(-8);
  return `dir_${timestamp}_${userSuffix}`.slice(0, 40);
};

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

const assertDirectOrderAccess = (order, user) => {
  if (!order) {
    return { allowed: false, status: 404, message: 'Order not found' };
  }

  if (user?.role === 'superadmin') {
    return { allowed: true };
  }

  if (String(order.merchantId) !== String(user?._id)) {
    return { allowed: false, status: 403, message: 'Not authorized to access this order' };
  }

  return { allowed: true };
};

// @route  POST /api/direct-orders/razorpay/create
// @desc   Create a Razorpay payment order for direct checkout
// @access Private (merchant/user must be logged in)
router.post('/razorpay/create', protect, async (req, res) => {
  try {
    const { items, shippingInfo, deliveryMode, deliveryCountries, deliveryNote, orderType = 'direct' } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const normalizedItems = items.map((item) => ({ ...item }));
    if (orderType === 'sample') {
      const productIds = normalizedItems.map((item) => item.catalogProductId).filter(Boolean);
      const products = await CatalogProduct.find({ _id: { $in: productIds } }).select('basePrice sampleAvailable').lean();
      const productById = new Map(products.map((product) => [String(product._id), product]));
      for (const item of normalizedItems) {
        const product = productById.get(String(item.catalogProductId));
        if (!product?.sampleAvailable) {
          return res.status(400).json({ success: false, message: 'Sample is not available for one or more selected products' });
        }
        item.quantity = 1;
        item.unitPrice = Number(product.basePrice || item.unitPrice || 0);
      }
    }

    // Compute totals server-side from catalog prices
    let subtotal = 0;
    for (const item of normalizedItems) {
      subtotal += item.unitPrice * item.quantity;
    }
    const total = subtotal; // shipping calculated separately if needed

    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(500).json({ success: false, message: 'Payment gateway not configured' });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // paise
      currency: 'INR',
      receipt: buildDirectReceipt(req.user._id),
      notes: { userId: req.user._id.toString(), orderType },
    });

    // Save a pending order record
    const order = await DirectOrder.create({
      merchantId: req.user._id,
      customerEmail: req.user.email || shippingInfo?.email,
      customerName: req.user.name || shippingInfo?.fullName,
      customerPhone: req.user.phone || shippingInfo?.phone,
      orderType: orderType === 'sample' ? 'sample' : 'direct',
      items: normalizedItems,
      subtotal,
      shipping: 0,
      tax: 0,
      total,
      deliveryMode: deliveryMode || 'single_address',
      shippingAddress: deliveryMode === 'single_address' ? shippingInfo : undefined,
      deliveryCountries: deliveryMode === 'multi_country' ? (deliveryCountries || []) : [],
      deliveryNote: deliveryNote || '',
      status: 'on-hold',
      shipment: {
        statusUpdatedAt: new Date(),
        statusHistory: [
          {
            status: 'on-hold',
            at: new Date(),
            note: 'Direct order created',
            actor: buildActor(req.user),
          },
        ],
      },
      payment: { method: 'razorpay', razorpayOrderId: razorpayOrder.id },
    });

    res.json({
      success: true,
      data: {
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    });
  } catch (err) {
    console.error('Direct order Razorpay create error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create payment order' });
  }
});

// @route  POST /api/direct-orders/razorpay/verify
// @desc   Verify Razorpay payment and mark order as paid
// @access Private
router.post('/razorpay/verify', protect, async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSig !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed: invalid signature' });
    }

    const order = await DirectOrder.findOne({ _id: orderId, merchantId: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = 'paid';
    order.payment = {
      ...order.payment,
      razorpayPaymentId,
      razorpaySignature,
    };
    appendStatusHistory(order, 'paid', req.user, 'Payment verified');
    await order.save();

    try {
      const { sendOrderConfirmationEmail } = require('../utils/mailer');
      await sendOrderConfirmationEmail({
        to: req.user.email,
        orderId: order._id,
        items: order.items,
        total: order.total,
      });
    } catch (emailErr) {
      console.error('Order confirmation email failed:', emailErr);
      // Non-fatal - order is already saved as paid
    }

    res.json({ success: true, data: { orderId: order._id, status: order.status } });
  } catch (err) {
    console.error('Direct order verify error:', err);
    res.status(500).json({ success: false, message: err.message || 'Payment verification failed' });
  }
});

// @route  GET /api/direct-orders
// @desc   List the logged-in user's direct orders
// @access Private
router.get('/', protect, async (req, res) => {
  try {
    const orders = await DirectOrder.find({ merchantId: req.user._id, orderType: { $ne: 'quotation' } })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// @route  GET /api/direct-orders/:id
// @desc   Get a single direct order
// @access Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await DirectOrder.findOne({ _id: req.params.id, merchantId: req.user._id })
      .populate('items.catalogProductId', 'name galleryImages')
      .populate('items.decorationMethodId', 'name code')
      .lean();
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
});

router.patch('/:id/status', protect, async (req, res) => {
  try {
    if (req.user?.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Only superadmin can update direct order status' });
    }
    const { status, note = '' } = req.body || {};
    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    const order = await DirectOrder.findById(req.params.id);
    const access = assertDirectOrderAccess(order, req.user);
    if (!access.allowed) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    order.status = status;
    appendStatusHistory(order, status, req.user, note);
    await order.save();

    return res.json({ success: true, data: order });
  } catch (err) {
    console.error('Direct order status update error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

router.patch('/:id/shipment', protect, async (req, res) => {
  try {
    if (req.user?.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Only superadmin can update direct shipment details' });
    }
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

    const order = await DirectOrder.findById(req.params.id);
    const access = assertDirectOrderAccess(order, req.user);
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
  } catch (err) {
    console.error('Direct order shipment update error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update shipment details' });
  }
});

module.exports = router;
