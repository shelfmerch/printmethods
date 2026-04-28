const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const SupportTicket = require('../models/SupportTicket');
const DirectOrder = require('../models/DirectOrder');
const KitSend = require('../models/KitSend');
const { assertBrandAccess } = require('../utils/brandAccess');
const {
  notifySuperadminNewSupportTicket,
  sendSupportTicketReplyEmail,
} = require('../utils/mailer');

const nextTicketNumber = async () => {
  const year = new Date().getFullYear();
  const last = await SupportTicket.findOne({ ticketNumber: new RegExp(`^TKT-${year}-`) })
    .sort({ createdAt: -1 })
    .select('ticketNumber')
    .lean();
  const lastSeq = Number(String(last?.ticketNumber || '').split('-').pop() || 0);
  return `TKT-${year}-${String(lastSeq + 1).padStart(4, '0')}`;
};

const verifyOrderAccess = async (orderId, orderType, user) => {
  if (user?.role === 'superadmin') return { allowed: true, brandId: user._id };
  if (orderType === 'direct_order' || orderType === 'quotation') {
    const order = await DirectOrder.findOne({ _id: orderId, merchantId: user._id }).select('_id merchantId');
    return { allowed: Boolean(order), brandId: order?.merchantId || user._id };
  }
  if (orderType === 'kit_send') {
    const kitSend = await KitSend.findById(orderId).select('_id brandId');
    if (!kitSend) return { allowed: false };
    await assertBrandAccess({ user }, kitSend.brandId);
    return { allowed: true, brandId: user._id };
  }
  return { allowed: false };
};

const canAccessTicket = (ticket, user) => {
  if (!ticket) return false;
  if (user?.role === 'superadmin') return true;
  return String(ticket.brandId) === String(user?._id);
};

router.post('/', protect, async (req, res) => {
  try {
    const { orderId, orderType, subject, category, description, attachments = [] } = req.body || {};
    if (!orderId || !orderType || !subject || !category || !description) {
      return res.status(400).json({ success: false, message: 'Order, subject, category, and description are required' });
    }

    const access = await verifyOrderAccess(orderId, orderType, req.user);
    if (!access.allowed) return res.status(403).json({ success: false, message: 'Not authorized for this order' });

    const ticketNumber = await nextTicketNumber();
    const ticket = await SupportTicket.create({
      orderId,
      orderType,
      brandId: access.brandId,
      raisedBy: req.user._id,
      ticketNumber,
      subject,
      category,
      description,
      attachments: Array.isArray(attachments) ? attachments : [],
      messages: [{ from: req.user._id, fromRole: 'brand', text: description, at: new Date() }],
    });

    try {
      await notifySuperadminNewSupportTicket({ ticketNumber, subject, brandEmail: req.user.email });
    } catch (emailErr) {
      console.error('Support ticket notification failed:', emailErr);
    }

    res.json({ success: true, data: ticket });
  } catch (err) {
    console.error('Support ticket create error:', err);
    res.status(500).json({ success: false, message: 'Failed to create support ticket' });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user?.role === 'superadmin' ? {} : { brandId: req.user._id };
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
    const tickets = await SupportTicket.find(filter)
      .populate('raisedBy', 'name email')
      .populate('brandId', 'name email companyName')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json({ success: true, data: tickets });
  } catch (err) {
    console.error('Support ticket list error:', err);
    res.status(500).json({ success: false, message: 'Failed to list tickets' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('raisedBy', 'name email')
      .populate('brandId', 'name email companyName')
      .populate('messages.from', 'name email role')
      .lean();
    if (!canAccessTicket(ticket, req.user)) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (err) {
    console.error('Support ticket detail error:', err);
    res.status(500).json({ success: false, message: 'Failed to load ticket' });
  }
});

router.post('/:id/message', protect, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id).populate('brandId', 'email');
    if (!canAccessTicket(ticket, req.user)) return res.status(404).json({ success: false, message: 'Ticket not found' });
    const text = String(req.body?.text || '').trim();
    if (!text) return res.status(400).json({ success: false, message: 'Message is required' });

    const fromRole = req.user?.role === 'superadmin' ? 'superadmin' : 'brand';
    ticket.messages.push({ from: req.user._id, fromRole, text, at: new Date() });
    await ticket.save();

    try {
      await sendSupportTicketReplyEmail({
        to: fromRole === 'superadmin' ? ticket.brandId?.email : (process.env.SUPERADMIN_EMAIL || process.env.EMAIL_USER),
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
      });
    } catch (emailErr) {
      console.error('Support ticket reply email failed:', emailErr);
    }

    res.json({ success: true, data: ticket });
  } catch (err) {
    console.error('Support ticket message error:', err);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

router.put('/:id/status', protect, authorize('superadmin'), async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!['in_review', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid ticket status' });
    }
    const ticket = await SupportTicket.findById(req.params.id).populate('brandId', 'email');
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    ticket.status = status;
    if (status === 'resolved') ticket.resolvedAt = new Date();
    await ticket.save();

    try {
      await sendSupportTicketReplyEmail({ to: ticket.brandId?.email, ticketNumber: ticket.ticketNumber, subject: ticket.subject, status });
    } catch (emailErr) {
      console.error('Support ticket status email failed:', emailErr);
    }

    res.json({ success: true, data: ticket });
  } catch (err) {
    console.error('Support ticket status error:', err);
    res.status(500).json({ success: false, message: 'Failed to update ticket status' });
  }
});

module.exports = router;
