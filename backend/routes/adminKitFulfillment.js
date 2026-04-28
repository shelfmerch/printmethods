const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Kit = require('../models/Kit');
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
            populate: { path: 'items.catalogProductId', select: 'name galleryImages' },
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

        if (!groups.has(key)) {
          groups.set(key, {
            catalogProductId: productId,
            productName: product?.name || 'Selected product',
            color,
            size,
            totalQty: 0,
            campaignCount: 0,
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

module.exports = router;
