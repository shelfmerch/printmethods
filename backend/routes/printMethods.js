const express = require('express');
const router = express.Router();
const PrintMethod = require('../models/PrintMethod');
const { protect, authorize } = require('../middleware/auth');

// ── GET all (superadmin + any authenticated) ─────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'superadmin' ? {} : { active: true };
    const methods = await PrintMethod.find(filter).sort({ sequence: 1, name: 1 });
    res.json({ success: true, data: methods });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET single ───────────────────────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const method = await PrintMethod.findById(req.params.id);
    if (!method) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: method });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST create (superadmin only) ────────────────────────────────────────────
router.post('/', protect, authorize('superadmin'), async (req, res) => {
  try {
    const {
      name, code, sequence, active,
      baseRatePaisePerSqIn, hasColors, colorRatePaise, minColors, maxColors,
      moq, note, description, iconCode,
    } = req.body;

    const method = await PrintMethod.create({
      name, code, sequence, active,
      baseRatePaisePerSqIn, hasColors, colorRatePaise, minColors, maxColors,
      moq, note, description, iconCode,
    });
    res.status(201).json({ success: true, data: method });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: `Code "${req.body.code}" already exists` });
    }
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── PUT update (superadmin only) ─────────────────────────────────────────────
router.put('/:id', protect, authorize('superadmin'), async (req, res) => {
  try {
    const method = await PrintMethod.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!method) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: method });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── DELETE (superadmin only) ─────────────────────────────────────────────────
router.delete('/:id', protect, authorize('superadmin'), async (req, res) => {
  try {
    await PrintMethod.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST price preview ────────────────────────────────────────────────────────
// Quick calc: POST /api/print-methods/:id/price-preview { areaSqIn, numColors, quantity }
router.post('/:id/price-preview', protect, async (req, res) => {
  try {
    const method = await PrintMethod.findById(req.params.id);
    if (!method) return res.status(404).json({ success: false, message: 'Not found' });

    const { areaSqIn = 0, numColors = 1, quantity = 1 } = req.body;

    if (method.moq > 1 && quantity < method.moq) {
      return res.status(400).json({
        success: false,
        message: `Minimum order for ${method.name} is ${method.moq} units`,
        moq: method.moq,
      });
    }

    const pricePerPiecePaise = method.computePricePaise(areaSqIn, numColors);
    res.json({
      success: true,
      data: {
        pricePerPiecePaise,
        totalPaise: pricePerPiecePaise * quantity,
        moq: method.moq,
        withinMoq: quantity >= method.moq,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
