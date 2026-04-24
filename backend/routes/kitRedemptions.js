const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const KitRedemption = require('../models/KitRedemption');
const KitSend = require('../models/KitSend');
const { assertBrandAccess } = require('../utils/brandAccess');

router.get('/token/:token', async (req, res) => {
  try {
    const redemption = await KitRedemption.findOne({ token: req.params.token })
      .populate({
        path: 'kitSendId',
        populate: {
          path: 'kitId',
          populate: {
            path: 'items.catalogProductId',
          },
        },
      });

    if (!redemption) {
      return res.status(404).json({ success: false, message: 'Gift link not found' });
    }

    res.json({ success: true, data: redemption });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/token/:token/redeem', async (req, res) => {
  try {
    const redemption = await KitRedemption.findOne({ token: req.params.token }).populate('kitSendId');
    if (!redemption) {
      return res.status(404).json({ success: false, message: 'Gift link not found' });
    }

    if (redemption.status === 'redeemed') {
      return res.status(400).json({ success: false, message: "You've already received this gift" });
    }

    if (redemption.status === 'closed') {
      return res.status(400).json({ success: false, message: 'This gift link is no longer available' });
    }

    redemption.selectedItems = Array.isArray(req.body.selectedItems) ? req.body.selectedItems : [];
    redemption.shippingAddress = req.body.shippingAddress || {};
    redemption.status = 'redeemed';
    redemption.redeemedAt = new Date();
    await redemption.save();

    const send = await KitSend.findById(redemption.kitSendId._id || redemption.kitSendId);
    if (send) {
      const pendingCount = await KitRedemption.countDocuments({ kitSendId: send._id, status: 'pending' });
      send.status = pendingCount > 0 ? 'partially_redeemed' : 'completed';
      await send.save();
    }

    res.json({ success: true, data: redemption });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const { kitSendId } = req.query;
    if (!kitSendId) {
      return res.status(400).json({ success: false, message: 'kitSendId is required' });
    }

    const send = await KitSend.findById(kitSendId);
    if (!send) {
      return res.status(404).json({ success: false, message: 'Kit send not found' });
    }

    await assertBrandAccess(req, send.brandId);

    const redemptions = await KitRedemption.find({ kitSendId }).sort({ createdAt: -1 });
    res.json({ success: true, data: redemptions });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

module.exports = router;
