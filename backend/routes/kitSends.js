const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Kit = require('../models/Kit');
const KitSend = require('../models/KitSend');
const KitRedemption = require('../models/KitRedemption');
const CatalogProduct = require('../models/CatalogProduct');
const { assertBrandAccess } = require('../utils/brandAccess');
const razorpayService = require('../services/razorpayService');
const { sendKitInviteEmail } = require('../utils/mailer');

function roundCurrency(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function cleanEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function buildRedemptionLink(token) {
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.CLIENT_PORT || 8080}`;
  return `${baseUrl.replace(/\/$/, '')}/redeem/${token}`;
}

async function computeKitSendPricing(kit, payload) {
  const productIds = kit.items.map((item) => item.catalogProductId);
  const products = await CatalogProduct.find({ _id: { $in: productIds } }).lean();
  const productById = new Map(products.map((product) => [String(product._id), product]));

  const recipientEmails = Array.isArray(payload.recipientEmails)
    ? payload.recipientEmails.map(cleanEmail).filter(Boolean)
    : [];
  const surpriseRecipients = Array.isArray(payload.surpriseRecipients) ? payload.surpriseRecipients : [];
  const recipientCount = payload.deliveryMode === 'surprise' ? surpriseRecipients.length : recipientEmails.length;

  if (!recipientCount) {
    throw Object.assign(new Error('At least one recipient is required'), { status: 400 });
  }

  const overageDecisions = Array.isArray(payload.overageDecisions) ? payload.overageDecisions : [];
  const overageDecisionByProduct = new Map(overageDecisions.map((entry) => [String(entry.catalogProductId), entry]));
  const overageItems = [];
  let itemsTotal = 0;

  for (const item of kit.items) {
    const product = productById.get(String(item.catalogProductId));
    if (!product) {
      throw Object.assign(new Error('One or more kit products could not be loaded'), { status: 400 });
    }

    const minimumQuantity = product.stocks?.minimumQuantity || 1;
    let chargeQty = recipientCount;

    if (product.fulfillmentType === 'inventory' && recipientCount < minimumQuantity) {
      const decision = overageDecisionByProduct.get(String(product._id));
      if (!decision || decision.mode !== 'order_full_moq') {
        throw Object.assign(new Error(`${product.name} requires a minimum order of ${minimumQuantity}`), {
          status: 400,
          code: 'MOQ_NOT_MET',
          details: {
            productId: String(product._id),
            productName: product.name,
            minimumQuantity,
            recipientCount,
          },
        });
      }

      chargeQty = minimumQuantity;
      overageItems.push({
        catalogProductId: product._id,
        overageQty: minimumQuantity - recipientCount,
      });
    }

    itemsTotal += Number(product.basePrice || 0) * chargeQty;
  }

  const itemsCostPerRecipient = roundCurrency(itemsTotal / recipientCount);
  const serviceFee = roundCurrency(itemsTotal * 0.15);
  const tax = roundCurrency((itemsTotal + serviceFee) * 0.18);
  const total = roundCurrency(itemsTotal + serviceFee + tax);

  return {
    recipientCount,
    recipientEmails,
    surpriseRecipients,
    overageItems,
    itemsCostPerRecipient,
    serviceFee,
    tax,
    total,
  };
}

async function getSendStats(kitSendId) {
  const redemptions = await KitRedemption.aggregate([
    { $match: { kitSendId: new mongoose.Types.ObjectId(String(kitSendId)) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const counts = { pending: 0, redeemed: 0, closed: 0 };
  redemptions.forEach((entry) => {
    counts[entry._id] = entry.count;
  });

  return {
    total: counts.pending + counts.redeemed + counts.closed,
    pending: counts.pending,
    redeemed: counts.redeemed,
    closed: counts.closed,
  };
}

router.post('/razorpay/create', protect, async (req, res) => {
  try {
    const { kitId, brandId, deliveryMode, fromName, message, sendInviteAt, scheduledAt } = req.body;
    if (!kitId || !brandId || !deliveryMode) {
      return res.status(400).json({ success: false, message: 'kitId, brandId, and deliveryMode are required' });
    }

    await assertBrandAccess(req, brandId);

    const kit = await Kit.findById(kitId).lean();
    if (!kit) {
      return res.status(404).json({ success: false, message: 'Kit not found' });
    }
    if (String(kit.brandId) !== String(brandId)) {
      return res.status(403).json({ success: false, message: 'Kit does not belong to this brand' });
    }

    const pricing = await computeKitSendPricing(kit, req.body);
    const amountPaise = Math.max(100, Math.round(pricing.total * 100));
    const receipt = `kit_${Date.now().toString(36)}`;
    const razorpayOrder = await razorpayService.createOrder(amountPaise, 'INR', receipt, {
      kitId: String(kit._id),
      brandId: String(brandId),
    });

    const kitSend = await KitSend.create({
      kitId,
      brandId,
      deliveryMode,
      fromName: fromName || '',
      message: message || '',
      sendInviteAt: sendInviteAt || 'immediate',
      scheduledAt: scheduledAt || undefined,
      recipientCount: pricing.recipientCount,
      recipientEmails: pricing.recipientEmails,
      surpriseRecipients: pricing.surpriseRecipients,
      itemsCostPerRecipient: pricing.itemsCostPerRecipient,
      serviceFee: pricing.serviceFee,
      tax: pricing.tax,
      total: pricing.total,
      overageItems: pricing.overageItems,
      status: 'pending_payment',
      payment: {
        razorpayOrderId: razorpayOrder.id,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        kitSend,
        razorpayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          receipt: razorpayOrder.receipt,
        },
        razorpayKeyId: razorpayService.getKeyId(),
      },
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code: err.code,
      details: err.details,
    });
  }
});

router.post('/razorpay/verify', protect, async (req, res) => {
  try {
    const { kitSendId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!kitSendId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Missing Razorpay verification fields' });
    }

    const kitSend = await KitSend.findById(kitSendId);
    if (!kitSend) {
      return res.status(404).json({ success: false, message: 'Kit send not found' });
    }

    await assertBrandAccess(req, kitSend.brandId);

    if (!razorpayService.verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      return res.status(400).json({ success: false, message: 'Invalid Razorpay signature' });
    }

    kitSend.payment = { razorpayOrderId, razorpayPaymentId, razorpaySignature };
    kitSend.status = kitSend.deliveryMode === 'surprise' ? 'completed' : 'paid';
    await kitSend.save();

    const existingCount = await KitRedemption.countDocuments({ kitSendId: kitSend._id });
    if (!existingCount) {
      if (kitSend.deliveryMode === 'surprise') {
        const docs = kitSend.surpriseRecipients.map((recipient) => ({
          kitSendId: kitSend._id,
          brandId: kitSend.brandId,
          recipientEmail: cleanEmail(recipient.recipientEmail),
          recipientName: recipient.recipientName || '',
          status: 'redeemed',
          surpriseItems: recipient.selections || [],
          surpriseAddress: recipient.address || {},
          selectedItems: recipient.selections || [],
          shippingAddress: recipient.address || {},
          redeemedAt: new Date(),
        }));
        if (docs.length) {
          await KitRedemption.insertMany(docs);
        }
      } else {
        const redemptions = [];
        for (const email of kitSend.recipientEmails) {
          const redemption = await KitRedemption.create({
            kitSendId: kitSend._id,
            brandId: kitSend.brandId,
            recipientEmail: cleanEmail(email),
            status: 'pending',
          });
          redemptions.push(redemption);
        }

        if (kitSend.sendInviteAt === 'immediate') {
          await Promise.all(redemptions.map(async (redemption) => {
            try {
              await sendKitInviteEmail({
                to: redemption.recipientEmail,
                recipientName: redemption.recipientName || redemption.recipientEmail,
                fromName: kitSend.fromName,
                message: kitSend.message,
                redeemUrl: buildRedemptionLink(redemption.token),
              });
            } catch (emailErr) {
              console.error('[KitSends] Failed to send invite email:', emailErr.message);
            }
          }));
          kitSend.status = 'invites_sent';
          await kitSend.save();
        }
      }
    }

    res.json({ success: true, data: kitSend });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const brandId = req.query.brandId;
    if (!brandId) {
      return res.status(400).json({ success: false, message: 'brandId is required' });
    }

    await assertBrandAccess(req, brandId);

    const sends = await KitSend.find({ brandId })
      .populate('kitId', 'name status')
      .sort({ createdAt: -1 })
      .lean();

    const statsList = await Promise.all(
      sends.map(async (send) => ({
        ...send,
        stats: await getSendStats(send._id),
      }))
    );

    res.json({ success: true, data: statsList });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const send = await KitSend.findById(req.params.id)
      .populate('kitId')
      .populate('brandId', 'name slug');

    if (!send) {
      return res.status(404).json({ success: false, message: 'Kit send not found' });
    }

    await assertBrandAccess(req, send.brandId._id || send.brandId);

    res.json({
      success: true,
      data: {
        send,
        stats: await getSendStats(send._id),
      },
    });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

router.post('/:id/close', protect, async (req, res) => {
  try {
    const send = await KitSend.findById(req.params.id);
    if (!send) {
      return res.status(404).json({ success: false, message: 'Kit send not found' });
    }

    await assertBrandAccess(req, send.brandId);
    await KitRedemption.updateMany({ kitSendId: send._id, status: 'pending' }, { status: 'closed' });
    send.status = 'closed';
    await send.save();

    res.json({ success: true, message: 'Campaign closed' });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

router.post('/:id/resend-invites', protect, async (req, res) => {
  try {
    const send = await KitSend.findById(req.params.id);
    if (!send) {
      return res.status(404).json({ success: false, message: 'Kit send not found' });
    }

    await assertBrandAccess(req, send.brandId);

    const pendingRedemptions = await KitRedemption.find({ kitSendId: send._id, status: 'pending' });
    await Promise.all(pendingRedemptions.map(async (redemption) => {
      try {
        await sendKitInviteEmail({
          to: redemption.recipientEmail,
          recipientName: redemption.recipientName || redemption.recipientEmail,
          fromName: send.fromName,
          message: send.message,
          redeemUrl: buildRedemptionLink(redemption.token),
        });
      } catch (emailErr) {
        console.error('[KitSends] Resend invite failed:', emailErr.message);
      }
    }));

    res.json({
      success: true,
      message: `Resent ${pendingRedemptions.length} invite${pendingRedemptions.length === 1 ? '' : 's'}`,
    });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

module.exports = router;
