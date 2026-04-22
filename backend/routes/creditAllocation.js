const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const CreditAllocation = require('../models/CreditAllocation');
const BrandEmployee = require('../models/BrandEmployee');
const Store = require('../models/Store');
const Wallet = require('../models/Wallet');
const walletService = require('../services/walletService');
const { protect } = require('../middleware/auth');

// Helper: check brand access (owner, superadmin, or brand_admin/hr_manager team member)
async function assertBrandAccess(req, brandId) {
  const store = await Store.findById(brandId);
  if (!store) throw Object.assign(new Error('Brand store not found'), { status: 404 });
  const isOwner = store.merchant.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'superadmin';
  if (!isOwner && !isAdmin) {
    const BrandTeamMember = require('../models/BrandTeamMember');
    const isTeam = await BrandTeamMember.findOne({
      brandId,
      userId: req.user._id,
      role: { $in: ['brand_admin', 'hr_manager'] },
      inviteStatus: 'accepted',
    });
    if (!isTeam) throw Object.assign(new Error('Not authorized'), { status: 403 });
  }
  return store;
}

// ─── GET /api/credit-allocation/:brandId ─────────────────────────────────────
// List all credit allocations for a brand (paginated, filterable by employee)
router.get('/:brandId', protect, async (req, res) => {
  try {
    await assertBrandAccess(req, req.params.brandId);
    const { employeeId, limit = 50, skip = 0, occasion } = req.query;

    const query = { brandId: req.params.brandId };
    if (employeeId) query.employeeId = employeeId;
    if (occasion) query.occasion = occasion;

    const [allocations, total] = await Promise.all([
      CreditAllocation.find(query)
        .populate('employeeId', 'email name department')
        .populate('allocatedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit)),
      CreditAllocation.countDocuments(query),
    ]);

    // Enrich with rupee amounts
    const data = allocations.map((a) => ({
      ...a.toObject(),
      amountRupees: (a.amountPaise / 100).toFixed(2),
    }));

    res.json({ success: true, data, total });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/credit-allocation/:brandId/summary ─────────────────────────────
// Summary stats: total allocated, per-occasion breakdown
router.get('/:brandId/summary', protect, async (req, res) => {
  try {
    await assertBrandAccess(req, req.params.brandId);

    const [totals, byOccasion] = await Promise.all([
      CreditAllocation.aggregate([
        { $match: { brandId: new mongoose.Types.ObjectId(req.params.brandId) } },
        {
          $group: {
            _id: null,
            totalAllocatedPaise: { $sum: '$amountPaise' },
            count: { $sum: 1 },
          },
        },
      ]),
      CreditAllocation.aggregate([
        { $match: { brandId: new mongoose.Types.ObjectId(req.params.brandId) } },
        {
          $group: {
            _id: '$occasion',
            totalPaise: { $sum: '$amountPaise' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalAllocatedPaise: totals[0]?.totalAllocatedPaise || 0,
        totalAllocatedRupees: ((totals[0]?.totalAllocatedPaise || 0) / 100).toFixed(2),
        count: totals[0]?.count || 0,
        byOccasion: byOccasion.map((o) => ({
          occasion: o._id,
          totalPaise: o.totalPaise,
          totalRupees: (o.totalPaise / 100).toFixed(2),
          count: o.count,
        })),
      },
    });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/credit-allocation/:brandId ────────────────────────────────────
// Allocate credits from company wallet → employee wallet(s)
// Body: { employeeIds: [...], amountPaise, occasion, note, expiresAt? }
// OR:   { employeeId: "...", amountPaise, occasion, note, expiresAt? }  (single)
router.post('/:brandId', protect, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const store = await assertBrandAccess(req, req.params.brandId);
    let { employeeId, employeeIds, amountPaise, occasion = 'custom', note, expiresAt } = req.body;

    // Normalise to array
    const targets = employeeIds
      ? employeeIds
      : employeeId
      ? [employeeId]
      : null;

    if (!targets || targets.length === 0)
      return res.status(400).json({ success: false, message: 'employeeId or employeeIds required' });
    if (!amountPaise || !Number.isInteger(amountPaise) || amountPaise < 100)
      return res.status(400).json({ success: false, message: 'amountPaise must be an integer >= 100 (₹1)' });

    // Company wallet check
    if (!store.companyWalletId)
      return res.status(400).json({ success: false, message: 'Company wallet not set up. Please top up the company wallet first.' });

    const companyWallet = await Wallet.findById(store.companyWalletId).session(session);
    if (!companyWallet)
      return res.status(400).json({ success: false, message: 'Company wallet not found' });

    const totalRequired = amountPaise * targets.length;
    if (companyWallet.balancePaise < totalRequired) {
      await session.abortTransaction();
      session.endSession();
      return res.status(402).json({
        success: false,
        message: `Insufficient company wallet balance. Need ₹${(totalRequired / 100).toFixed(2)}, have ₹${(companyWallet.balancePaise / 100).toFixed(2)}`,
      });
    }

    const results = [];
    const errors = [];

    for (const empId of targets) {
      try {
        // Validate employee belongs to this brand
        const employee = await BrandEmployee.findOne({
          _id: empId,
          brandId: req.params.brandId,
          inviteStatus: { $in: ['active', 'pending'] },
        }).session(session);

        if (!employee) {
          errors.push({ employeeId: empId, error: 'Employee not found or deactivated' });
          continue;
        }

        // Get or create employee wallet
        let empWallet = employee.walletId
          ? await Wallet.findById(employee.walletId).session(session)
          : null;

        if (!empWallet) {
          // Employee may have registered by now — try by userId
          if (employee.userId) {
            empWallet = await Wallet.findOne({ userId: employee.userId }).session(session);
          }
          if (!empWallet) {
            // Create a wallet for them
            [empWallet] = await Wallet.create(
              [{ userId: employee.userId || new mongoose.Types.ObjectId(), currency: 'INR', balancePaise: 0, status: 'ACTIVE' }],
              { session }
            );
            // Link wallet to employee record
            employee.walletId = empWallet._id;
          }
        }

        const idempotencyKey = `credit_alloc_${req.params.brandId}_${empId}_${Date.now()}`;

        // 1. Debit company wallet
        const companyTxn = await walletService.debitWallet(
          null, // we'll do it directly via Wallet model since userId-based doesn't apply to company wallet
          0,    // placeholder — we'll use direct Wallet ops below
          {},
          session
        ).catch(() => null); // fallthrough to direct op

        // Direct company wallet debit (company wallet may not have a userId)
        const updatedCompanyWallet = await Wallet.findOneAndUpdate(
          { _id: store.companyWalletId, balancePaise: { $gte: amountPaise } },
          { $inc: { balancePaise: -amountPaise } },
          { new: true, session }
        );
        if (!updatedCompanyWallet) throw new Error('Company wallet debit failed (concurrent modification)');

        // 2. Credit employee wallet
        await Wallet.findOneAndUpdate(
          { _id: empWallet._id },
          { $inc: { balancePaise: amountPaise } },
          { session }
        );

        // 3. Update employee totals
        await BrandEmployee.findByIdAndUpdate(
          empId,
          {
            $inc: { totalCreditAllocatedPaise: amountPaise },
            walletId: empWallet._id,
          },
          { session }
        );

        // 4. Create CreditAllocation audit record
        const [allocation] = await CreditAllocation.create(
          [
            {
              brandId: req.params.brandId,
              employeeId: empId,
              allocatedBy: req.user._id,
              amountPaise,
              occasion,
              note,
              expiresAt: expiresAt ? new Date(expiresAt) : undefined,
              status: 'active',
            },
          ],
          { session }
        );

        results.push({ employeeId: empId, email: employee.email, allocation });
      } catch (err) {
        errors.push({ employeeId: empId, error: err.message });
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      data: {
        allocated: results.length,
        failed: errors.length,
        results,
        errors,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

module.exports = router;
