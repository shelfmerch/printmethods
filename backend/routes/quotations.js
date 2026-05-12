const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const DirectOrder = require('../models/DirectOrder');
const { notifySuperadminNewPO } = require('../utils/mailer');
const {
  getQuotationPaymentStatus,
  validateAdvanceAmount,
} = require('../utils/quotationPayments');
const {
  buildDirectOrderInvoicePayload,
  createCommercialInvoice,
  generateInvoicePdfBuffer,
} = require('../utils/commercialInvoices');
const { sendOrderConfirmationEmail } = require('../utils/mailer');

const getRazorpay = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
};

const buildActor = (user) => ({
  id: user?._id,
  role: user?.role || '',
  name: user?.name || '',
  email: user?.email || '',
});

const appendStatusHistory = (order, status, user, note = '') => {
  if (!order.shipment) order.shipment = {};
  order.shipment.statusHistory = [
    ...(order.shipment.statusHistory || []),
    { status, at: new Date(), note, actor: buildActor(user) },
  ];
  order.shipment.statusUpdatedAt = new Date();
};

const nextQuotationNumber = async () => {
  const year = new Date().getFullYear();
  const last = await DirectOrder.findOne({ 'quotation.number': new RegExp(`^QUO-${year}-`) })
    .sort({ createdAt: -1 })
    .select('quotation.number')
    .lean();
  const lastSeq = Number(String(last?.quotation?.number || '').split('-').pop() || 0);
  return `QUO-${year}-${String(lastSeq + 1).padStart(4, '0')}`;
};

const quotationFilter = { status: { $in: ['quotation', 'po_received', 'partially_paid', 'paid'] }, orderType: 'quotation' };

router.post('/create', protect, async (req, res) => {
  try {
    const { items, shippingInfo, deliveryMode, deliveryCountries, deliveryNote } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Quotation has no items' });
    }

    const subtotal = items.reduce((sum, item) => sum + Number(item.unitPrice || 0) * Number(item.quantity || 0), 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    const quotationNumber = await nextQuotationNumber();
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const order = await DirectOrder.create({
      merchantId: req.user._id,
      customerEmail: shippingInfo?.email || req.user.email,
      customerName: shippingInfo?.fullName || req.user.name,
      customerPhone: shippingInfo?.phone || req.user.phone || req.user.phoneNumber,
      orderType: 'quotation',
      items,
      subtotal,
      shipping: 0,
      tax,
      total,
      deliveryMode: deliveryMode || 'single_address',
      shippingAddress: deliveryMode === 'single_address' ? shippingInfo : undefined,
      deliveryCountries: deliveryMode === 'multi_country' ? (deliveryCountries || []) : [],
      deliveryNote: deliveryNote || '',
      status: 'quotation',
      shipment: {
        statusUpdatedAt: new Date(),
        statusHistory: [{ status: 'quotation', at: new Date(), note: 'Quotation created', actor: buildActor(req.user) }],
      },
      quotation: {
        number: quotationNumber,
        validUntil,
      },
    });

    res.json({
      success: true,
      data: {
        orderId: order._id,
        quotationNumber,
        validUntil,
        items: order.items,
        total: order.total,
      },
    });
  } catch (err) {
    console.error('Quotation create error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create quotation' });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user?.role === 'superadmin'
      ? { ...quotationFilter }
      : { ...quotationFilter, merchantId: req.user._id };
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;

    const quotes = await DirectOrder.find(filter)
      .populate('merchantId', 'name email companyName')
      .populate('items.catalogProductId', 'name galleryImages')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json({ success: true, data: quotes });
  } catch (err) {
    console.error('Quotation list error:', err);
    res.status(500).json({ success: false, message: 'Failed to list quotations' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const filter = req.user?.role === 'superadmin'
      ? { _id: req.params.id, orderType: 'quotation' }
      : { _id: req.params.id, orderType: 'quotation', merchantId: req.user._id };
    const quote = await DirectOrder.findOne(filter)
      .populate('merchantId', 'name email companyName')
      .populate('items.catalogProductId', 'name galleryImages')
      .populate('items.decorationMethodId', 'name code')
      .lean();
    if (!quote) return res.status(404).json({ success: false, message: 'Quotation not found' });
    res.json({ success: true, data: quote });
  } catch (err) {
    console.error('Quotation detail error:', err);
    res.status(500).json({ success: false, message: 'Failed to load quotation' });
  }
});

router.post('/:id/upload-po', protect, async (req, res) => {
  try {
    const { purchaseOrderUrl = '', purchaseOrderNumber = '' } = req.body || {};
    if (!purchaseOrderUrl && !purchaseOrderNumber) {
      return res.status(400).json({ success: false, message: 'PO document or number is required' });
    }

    const quote = await DirectOrder.findOne({ _id: req.params.id, orderType: 'quotation', merchantId: req.user._id });
    if (!quote) return res.status(404).json({ success: false, message: 'Quotation not found' });

    quote.quotation.purchaseOrderUrl = purchaseOrderUrl;
    quote.quotation.purchaseOrderNumber = purchaseOrderNumber;
    quote.status = 'po_received';
    appendStatusHistory(quote, 'po_received', req.user, 'Purchase order uploaded');
    await quote.save();

    try {
      await notifySuperadminNewPO({
        quotationNumber: quote.quotation.number,
        purchaseOrderNumber,
        purchaseOrderUrl,
        brandEmail: req.user.email,
      });
    } catch (emailErr) {
      console.error('PO notification failed:', emailErr);
    }

    res.json({ success: true, data: quote });
  } catch (err) {
    console.error('Quotation PO upload error:', err);
    res.status(500).json({ success: false, message: 'Failed to upload PO' });
  }
});

router.post('/:id/razorpay/advance-create', protect, async (req, res) => {
  try {
    const amountPaise = Math.round(Number(req.body?.amountPaise || 0));
    const quote = await DirectOrder.findOne({ _id: req.params.id, orderType: 'quotation', merchantId: req.user._id });
    if (!quote) return res.status(404).json({ success: false, message: 'Quotation not found' });
    const validation = validateAdvanceAmount(quote.total, amountPaise);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        minPaise: validation.minPaise,
        maxPaise: validation.maxPaise,
      });
    }

    const razorpay = getRazorpay();
    if (!razorpay) return res.status(500).json({ success: false, message: 'Payment gateway not configured' });
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `quo_${Date.now().toString(36)}`.slice(0, 40),
      notes: { quotationId: String(quote._id), quotationNumber: quote.quotation?.number || '' },
    });
    quote.quotation.advanceRazorpayOrderId = order.id;
    await quote.save();

    res.json({ success: true, data: { razorpayOrderId: order.id, razorpayKeyId: process.env.RAZORPAY_KEY_ID, amount: order.amount, currency: order.currency } });
  } catch (err) {
    console.error('Quotation advance create error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create advance payment' });
  }
});

router.post('/:id/razorpay/advance-verify', protect, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, amountPaise } = req.body || {};
    const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');
    if (expectedSig !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const quote = await DirectOrder.findOne({ _id: req.params.id, orderType: 'quotation', merchantId: req.user._id });
    if (!quote) return res.status(404).json({ success: false, message: 'Quotation not found' });
    quote.quotation.advancePaidPaise = Number(quote.quotation.advancePaidPaise || 0) + Math.round(Number(amountPaise || 0));
    quote.quotation.advanceRazorpayPaymentId = razorpayPaymentId;
    const nextStatus = getQuotationPaymentStatus(quote.total, quote.quotation.advancePaidPaise);
    if (nextStatus && quote.status !== nextStatus) {
      quote.status = nextStatus;
      appendStatusHistory(
        quote,
        nextStatus,
        req.user,
        nextStatus === 'paid' ? 'Full payment verified' : 'Advance payment verified'
      );
    }
    await quote.save();

    try {
      const invoice = await createCommercialInvoice(buildDirectOrderInvoicePayload(quote, {
        sourceType: 'quotation',
        paidAmount: Number(amountPaise || 0) / 100,
      }));
      const invoicePdf = await generateInvoicePdfBuffer({
        invoice,
        title: nextStatus === 'paid' ? 'Quotation Payment Invoice' : 'Quotation Advance Invoice',
        customerName: quote.customerName,
        customerEmail: quote.customerEmail,
      });
      await sendOrderConfirmationEmail({
        to: quote.customerEmail || req.user.email,
        orderId: quote.quotation?.number || quote._id,
        invoiceNumber: invoice.invoiceNumber,
        items: quote.items,
        total: invoice.totalAmount,
        attachments: [{ filename: `${invoice.invoiceNumber}.pdf`, content: invoicePdf }],
      });
    } catch (invoiceErr) {
      console.error('Quotation invoice email failed:', invoiceErr);
    }

    res.json({ success: true, data: quote });
  } catch (err) {
    console.error('Quotation advance verify error:', err);
    res.status(500).json({ success: false, message: 'Failed to verify advance payment' });
  }
});

router.post('/:id/confirm-payment', protect, authorize('superadmin'), async (req, res) => {
  try {
    const quote = await DirectOrder.findOne({ _id: req.params.id, orderType: 'quotation' });
    if (!quote) return res.status(404).json({ success: false, message: 'Quotation not found' });
    quote.status = 'paid';
    appendStatusHistory(quote, 'paid', req.user, req.body?.note || 'Payment manually confirmed');
    await quote.save();
    res.json({ success: true, data: quote });
  } catch (err) {
    console.error('Quotation confirm payment error:', err);
    res.status(500).json({ success: false, message: 'Failed to confirm payment' });
  }
});

module.exports = router;
