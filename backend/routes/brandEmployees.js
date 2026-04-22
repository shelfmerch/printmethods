const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const BrandEmployee = require('../models/BrandEmployee');
const Store = require('../models/Store');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const { protect } = require('../middleware/auth');

// Helper: verify brand access (owner or brand_admin team member)
async function assertBrandAccess(req, brandId) {
  const store = await Store.findById(brandId);
  if (!store) throw Object.assign(new Error('Brand store not found'), { status: 404 });
  const isOwner = store.merchant.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'superadmin';
  if (!isOwner && !isAdmin) {
    // Also allow brand_admin team members
    const BrandTeamMember = require('../models/BrandTeamMember');
    const isTeamAdmin = await BrandTeamMember.findOne({
      brandId,
      userId: req.user._id,
      role: { $in: ['brand_admin', 'hr_manager'] },
      inviteStatus: 'accepted',
    });
    if (!isTeamAdmin) throw Object.assign(new Error('Not authorized'), { status: 403 });
  }
  return store;
}

// @route   GET /api/brand-employees/:brandId
// @desc    List all employees for a brand
// @access  Brand owner / brand_admin / hr_manager
router.get('/:brandId', protect, async (req, res) => {
  try {
    await assertBrandAccess(req, req.params.brandId);
    const employees = await BrandEmployee.find({ brandId: req.params.brandId })
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: employees });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/brand-employees/:brandId
// @desc    Add one employee by email (creates wallet for them)
// @access  Brand owner / brand_admin / hr_manager
router.post('/:brandId', protect, async (req, res) => {
  try {
    const store = await assertBrandAccess(req, req.params.brandId);
    const { email, name, department, employeeId } = req.body;

    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    // Find or create wallet for this email
    let user = await User.findOne({ email: email.toLowerCase() });
    let walletId = null;

    if (user) {
      // Get or create their wallet
      let wallet = await Wallet.findOne({ userId: user._id });
      if (!wallet) {
        wallet = await Wallet.create({ userId: user._id, currency: 'INR', balancePaise: 0 });
      }
      walletId = wallet._id;
    }
    // If user doesn't exist yet, wallet will be created when they register

    const inviteToken = crypto.randomBytes(32).toString('hex');
    const employee = await BrandEmployee.findOneAndUpdate(
      { brandId: req.params.brandId, email: email.toLowerCase() },
      {
        name: name || undefined,
        department: department || undefined,
        employeeId: employeeId || undefined,
        invitedBy: req.user._id,
        inviteStatus: user ? 'active' : 'pending',
        inviteToken,
        inviteExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        userId: user?._id || undefined,
        walletId: walletId || undefined,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, data: employee, message: 'Employee added' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Employee already added for this brand' });
    }
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/brand-employees/:brandId/bulk
// @desc    Bulk-add employees from an array of emails
// @access  Brand owner / brand_admin / hr_manager
router.post('/:brandId/bulk', protect, async (req, res) => {
  try {
    await assertBrandAccess(req, req.params.brandId);
    const { employees } = req.body; // [{ email, name, department }]
    if (!Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({ success: false, message: 'employees array required' });
    }

    const results = { added: 0, skipped: 0, errors: [] };

    for (const emp of employees) {
      if (!emp.email) { results.errors.push({ email: emp.email, error: 'Missing email' }); continue; }
      try {
        const user = await User.findOne({ email: emp.email.toLowerCase() });
        let walletId = null;
        if (user) {
          let wallet = await Wallet.findOne({ userId: user._id });
          if (!wallet) wallet = await Wallet.create({ userId: user._id, currency: 'INR', balancePaise: 0 });
          walletId = wallet._id;
        }
        const inviteToken = crypto.randomBytes(32).toString('hex');
        await BrandEmployee.findOneAndUpdate(
          { brandId: req.params.brandId, email: emp.email.toLowerCase() },
          {
            name: emp.name || undefined,
            department: emp.department || undefined,
            invitedBy: req.user._id,
            inviteStatus: user ? 'active' : 'pending',
            inviteToken,
            inviteExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            userId: user?._id || undefined,
            walletId: walletId || undefined,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        results.added++;
      } catch (e) {
        if (e.code === 11000) { results.skipped++; } else { results.errors.push({ email: emp.email, error: e.message }); }
      }
    }

    res.json({ success: true, data: results });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// @route   PATCH /api/brand-employees/:brandId/:employeeId/status
// @desc    Activate or deactivate an employee
// @access  Brand owner / brand_admin / hr_manager
router.patch('/:brandId/:employeeId/status', protect, async (req, res) => {
  try {
    await assertBrandAccess(req, req.params.brandId);
    const { status } = req.body;
    if (!['active', 'deactivated'].includes(status)) {
      return res.status(400).json({ success: false, message: 'status must be active or deactivated' });
    }
    const emp = await BrandEmployee.findOneAndUpdate(
      { _id: req.params.employeeId, brandId: req.params.brandId },
      { inviteStatus: status },
      { new: true }
    );
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, data: emp });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/brand-employees/:brandId/:employeeId
// @desc    Remove an employee from the brand
// @access  Brand owner / brand_admin / hr_manager
router.delete('/:brandId/:employeeId', protect, async (req, res) => {
  try {
    await assertBrandAccess(req, req.params.brandId);
    await BrandEmployee.findOneAndDelete({ _id: req.params.employeeId, brandId: req.params.brandId });
    res.json({ success: true, message: 'Employee removed' });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/brand-employees/link-wallet
// @desc    Called on user signup — links wallet to any pending employee records
// @access  Internal (called from auth routes after signup)
router.post('/link-wallet', async (req, res) => {
  try {
    const { email, userId } = req.body;
    if (!email || !userId) return res.status(400).json({ success: false });

    // Find or create wallet
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) wallet = await Wallet.create({ userId, currency: 'INR', balancePaise: 0 });

    // Link all pending employee records for this email
    const result = await BrandEmployee.updateMany(
      { email: email.toLowerCase(), inviteStatus: 'pending' },
      { userId, walletId: wallet._id, inviteStatus: 'active' }
    );

    res.json({ success: true, linked: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
