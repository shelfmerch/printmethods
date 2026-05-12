const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Kit = require('../models/Kit');
const KitSend = require('../models/KitSend');
const KitRedemption = require('../models/KitRedemption');
const { sendShippingNotificationEmail } = require('../utils/mailer');

const adminOnly = [protect, authorize('superadmin')];

const idOf = (value) => String(value?._id || value?.id || value || '');

const formatAddress = (address = {}) => [
  address.fullName,
  address.address1,
  address.city,
  address.state,
  address.zipCode,
  address.country,
].filter(Boolean).join(', ');

const buildActor = (user) => ({
  id: user?._id,
  role: user?.role || '',
  name: user?.name || '',
  email: user?.email || '',
});

router.get('/production-queue', adminOnly, async (req, res) => {
  try {
    const redemptions = await KitRedemption.find({
      status: 'redeemed',
      $or: [
        { shippingStatus: { $exists: false } },
        { shippingStatus: { $nin: ['shipped', 'delivered'] } },
      ],
    })
      .populate({
        path: 'kitSendId',
        populate: [
          {
            path: 'kitId',
            populate: { path: 'items.catalogProductId', select: 'name galleryImages design' },
          },
          { path: 'brandId', select: 'name slug brandProfile.companyName' },
        ],
      })
      .populate('selectedItems.catalogProductId', 'name galleryImages')
      .lean();

    const groups = new Map();

    redemptions.forEach((redemption) => {
      const kitSend = redemption.kitSendId || {};
      const kit = kitSend.kitId || {};
      const kitItems = Array.isArray(kit.items) ? kit.items : [];

      (redemption.selectedItems || []).forEach((selection) => {
        const product = selection.catalogProductId;
        const productId = idOf(product);
        if (!productId) return;

        const color = selection.color || '';
        const size = selection.size || '';
        const key = `${productId}|${color}|${size}`;
        const kitItem = kitItems.find((item) => idOf(item.catalogProductId) === productId);

        const placementViews = Array.isArray(product?.design?.views)
          ? product.design.views
            .filter((view) => Array.isArray(view.placeholders) && view.placeholders.length)
            .map((view) => ({
              view: view.key,
              placeholders: view.placeholders.map((placeholder) => ({
                name: placeholder.name || placeholder.id || 'Print area',
                xIn: placeholder.xIn,
                yIn: placeholder.yIn,
                widthIn: placeholder.widthIn,
                heightIn: placeholder.heightIn,
              })),
            }))
          : [];

        if (!groups.has(key)) {
          groups.set(key, {
            catalogProductId: productId,
            productName: product?.name || 'Selected product',
            color,
            size,
            totalQty: 0,
            campaignCount: 0,
            placementViews,
            campaigns: new Set(),
            recipients: [],
          });
        }

        const group = groups.get(key);
        const quantity = Number(selection.quantity || 1);
        group.totalQty += quantity;
        group.campaigns.add(idOf(kit));
        group.campaignCount = group.campaigns.size;
        group.recipients.push({
          redemptionId: idOf(redemption),
          recipientEmail: redemption.recipientEmail || '',
          recipientName: redemption.recipientName || '',
          campaignName: kit.name || 'Kit campaign',
          brandName: kitSend.brandId?.brandProfile?.companyName || kitSend.brandId?.name || '',
          kitSendId: idOf(kitSend),
          quantity,
          shippingAddress: redemption.shippingAddress || redemption.surpriseAddress || {},
          addressText: formatAddress(redemption.shippingAddress || redemption.surpriseAddress || {}),
          uploadedLogoUrl: kitItem?.uploadedLogoUrl || '',
          placementViews,
          trackingNumber: redemption.trackingNumber || '',
          carrier: redemption.carrier || '',
          trackingUrl: redemption.trackingUrl || '',
          shippingStatus: redemption.shippingStatus || 'ready',
          token: redemption.token,
        });
      });
    });

    const data = [...groups.values()]
      .map((group) => ({
        ...group,
        campaigns: undefined,
      }))
      .sort((a, b) => a.productName.localeCompare(b.productName));

    res.json({ success: true, data });
  } catch (err) {
    console.error('Admin kit fulfillment queue error:', err);
    res.status(500).json({ success: false, message: 'Failed to load kit fulfillment queue' });
  }
});

router.get('/orders', adminOnly, async (req, res) => {
  try {
    const kitSends = await KitSend.find({})
      .populate('kitId', 'name items')
      .populate('brandId', 'name slug brandProfile.companyName merchant')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const ids = kitSends.map((send) => send._id);
    const redemptions = await KitRedemption.aggregate([
      { $match: { kitSendId: { $in: ids } } },
      { $group: { _id: { kitSendId: '$kitSendId', status: '$status', shippingStatus: '$shippingStatus' }, count: { $sum: 1 } } },
    ]);

    const statsBySend = new Map();
    redemptions.forEach((entry) => {
      const key = idOf(entry._id.kitSendId);
      const current = statsBySend.get(key) || { pending: 0, redeemed: 0, shipped: 0, delivered: 0 };
      if (entry._id.status === 'pending') current.pending += entry.count;
      if (entry._id.status === 'redeemed') current.redeemed += entry.count;
      if (entry._id.shippingStatus === 'shipped') current.shipped += entry.count;
      if (entry._id.shippingStatus === 'delivered') current.delivered += entry.count;
      statsBySend.set(key, current);
    });

    const data = kitSends.map((send) => ({
      _id: idOf(send),
      kitName: send.kitId?.name || 'Kit',
      brandName: send.brandId?.brandProfile?.companyName || send.brandId?.name || '',
      deliveryMode: send.deliveryMode,
      recipientCount: send.recipientCount || send.singleLocationQuantity || 0,
      status: send.status,
      total: send.total,
      createdAt: send.createdAt,
      payment: send.payment || {},
      stats: statsBySend.get(idOf(send)) || { pending: 0, redeemed: 0, shipped: 0, delivered: 0 },
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error('Admin kit orders error:', err);
    res.status(500).json({ success: false, message: 'Failed to load kit orders' });
  }
});

router.get('/logos', adminOnly, async (req, res) => {
  try {
    const { catalogProductId } = req.query;
    if (!catalogProductId) {
      return res.status(400).json({ success: false, message: 'catalogProductId is required' });
    }

    const kits = await Kit.find({ 'items.catalogProductId': catalogProductId })
      .select('name items')
      .lean();

    const logos = [];
    kits.forEach((kit) => {
      (kit.items || []).forEach((item) => {
        if (idOf(item.catalogProductId) === String(catalogProductId) && item.uploadedLogoUrl) {
          logos.push({
            kitId: idOf(kit),
            kitName: kit.name,
            uploadedLogoUrl: item.uploadedLogoUrl,
          });
        }
      });
    });

    res.json({ success: true, data: logos });
  } catch (err) {
    console.error('Admin kit fulfillment logos error:', err);
    res.status(500).json({ success: false, message: 'Failed to load kit logos' });
  }
});

router.put('/redemption/:redemptionId/ship', adminOnly, async (req, res) => {
  try {
    const {
      trackingNumber = '',
      carrier = '',
      trackingUrl = '',
      note = '',
    } = req.body || {};

    if (!trackingNumber) {
      return res.status(400).json({ success: false, message: 'Tracking number is required' });
    }

    const redemption = await KitRedemption.findById(req.params.redemptionId)
      .populate({
        path: 'kitSendId',
        populate: { path: 'kitId', select: 'name' },
      });
    if (!redemption) {
      return res.status(404).json({ success: false, message: 'Kit redemption not found' });
    }

    redemption.trackingNumber = trackingNumber;
    redemption.carrier = carrier;
    redemption.trackingUrl = trackingUrl;
    redemption.shippingStatus = 'shipped';
    redemption.shippedAt = new Date();
    redemption.shippingHistory = [
      ...(redemption.shippingHistory || []),
      {
        status: 'shipped',
        at: new Date(),
        note: note || 'Marked shipped by superadmin',
        actor: buildActor(req.user),
      },
    ];
    await redemption.save();

    try {
      await sendShippingNotificationEmail({
        to: redemption.recipientEmail,
        recipientName: redemption.recipientName,
        orderId: redemption.kitSendId?.kitId?.name || redemption._id,
        trackingNumber,
        carrier,
        trackingUrl,
        items: redemption.selectedItems,
      });
    } catch (emailErr) {
      console.error('Kit redemption shipping email failed:', emailErr);
    }

    res.json({ success: true, data: redemption });
  } catch (err) {
    console.error('Admin kit fulfillment ship error:', err);
    res.status(500).json({ success: false, message: 'Failed to mark kit item shipped' });
  }
});

router.put('/redemption/:redemptionId/status', adminOnly, async (req, res) => {
  try {
    const { status, note = '' } = req.body || {};
    if (!['in-production', 'shipped', 'delivered'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid kit shipping status' });
    }

    const redemption = await KitRedemption.findById(req.params.redemptionId)
      .populate({
        path: 'kitSendId',
        populate: { path: 'kitId', select: 'name' },
      });
    if (!redemption) {
      return res.status(404).json({ success: false, message: 'Kit redemption not found' });
    }

    redemption.shippingStatus = status;
    if (status === 'delivered') redemption.deliveredAt = new Date();
    redemption.shippingHistory = [
      ...(redemption.shippingHistory || []),
      { status, at: new Date(), note: note || `Marked ${status} by superadmin`, actor: buildActor(req.user) },
    ];
    await redemption.save();

    if (status === 'delivered') {
      try {
        await sendShippingNotificationEmail({
          to: redemption.recipientEmail,
          recipientName: redemption.recipientName,
          orderId: redemption.kitSendId?.kitId?.name || redemption._id,
          status: 'delivered',
          items: redemption.selectedItems,
        });
      } catch (emailErr) {
        console.error('Kit redemption delivered email failed:', emailErr);
      }
    }

    res.json({ success: true, data: redemption });
  } catch (err) {
    console.error('Admin kit fulfillment status error:', err);
    res.status(500).json({ success: false, message: 'Failed to update kit item status' });
  }
});

module.exports = router;
