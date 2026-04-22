const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const BrandTeamMember = require('../models/BrandTeamMember');
const Store = require('../models/Store');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendVerificationEmail } = require('../utils/mailer');

// Helper: verify the requesting user owns or is admin of the given brandId
async function assertBrandAccess(req, brandId) {
  const store = await Store.findById(brandId);
  if (!store) throw Object.assign(new Error('Brand store not found'), { status: 404 });
  const isOwner = store.merchant.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'superadmin';
  const isTeamAdmin = await BrandTeamMember.findOne({
    brandId,
    userId: req.user._id,
    role: 'brand_admin',
    inviteStatus: 'accepted',
  });
  if (!isOwner && !isAdmin && !isTeamAdmin) {
    throw Object.assign(new Error('Not authorized'), { status: 403 });
  }
  return store;
}

// @route   GET /api/brand-team/:brandId
// @desc    List all team members for a brand
// @access  Brand owner / brand_admin
router.get('/:brandId', protect, async (req, res) => {
  try {
    await assertBrandAccess(req, req.params.brandId);
    const members = await BrandTeamMember.find({ brandId: req.params.brandId })
      .populate('userId', 'name email avatar')
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: members });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/brand-team/:brandId/invite
// @desc    Invite a team member by email
// @access  Brand owner / brand_admin
router.post('/:brandId/invite', protect, async (req, res) => {
  try {
    const store = await assertBrandAccess(req, req.params.brandId);
    const { email, role } = req.body;

    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    const validRoles = ['brand_admin', 'hr_manager', 'finance', 'marketing'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Upsert: if already invited, update token & resend
    const member = await BrandTeamMember.findOneAndUpdate(
      { brandId: req.params.brandId, inviteEmail: email.toLowerCase() },
      {
        invitedBy: req.user._id,
        role: role || 'hr_manager',
        inviteStatus: 'pending',
        inviteToken,
        inviteExpiry,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // If this email already has a User account, link it
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      member.userId = existingUser._id;
      await member.save();
    }

    // Send invite email
    const inviteLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/brand-team/accept?token=${inviteToken}`;
    try {
      await sendVerificationEmail(
        email,
        `You've been invited to manage ${store.brandProfile?.companyName || store.name}'s swag store`,
        `<p>Hi,</p>
         <p><strong>${req.user.name}</strong> has invited you to join the <strong>${store.brandProfile?.companyName || store.name}</strong> swag store team as <strong>${(role || 'hr_manager').replace('_', ' ')}</strong>.</p>
         <p><a href="${inviteLink}" style="background:#000;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Accept Invitation</a></p>
         <p>This link expires in 7 days.</p>`
      );
    } catch (mailErr) {
      console.error('Failed to send team invite email:', mailErr.message);
    }

    res.status(201).json({ success: true, data: member, message: 'Invite sent' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'This email is already invited' });
    }
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/brand-team/accept
// @desc    Accept a team invite via token
// @access  Public (token-gated)
router.post('/accept', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Token required' });

    const member = await BrandTeamMember.findOne({ inviteToken: token })
      .select('+inviteToken');

    if (!member) return res.status(404).json({ success: false, message: 'Invalid or expired invite' });
    if (member.inviteExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'Invite has expired' });
    }
    if (member.inviteStatus === 'accepted') {
      return res.json({ success: true, message: 'Already accepted', data: member });
    }

    // Link user account by email
    const user = await User.findOne({ email: member.inviteEmail });
    member.inviteStatus = 'accepted';
    member.acceptedAt = new Date();
    member.inviteToken = undefined;
    if (user) member.userId = user._id;
    await member.save();

    res.json({ success: true, message: 'Invite accepted', data: { brandId: member.brandId, role: member.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/brand-team/:brandId/:memberId
// @desc    Remove a team member
// @access  Brand owner / brand_admin
router.delete('/:brandId/:memberId', protect, async (req, res) => {
  try {
    await assertBrandAccess(req, req.params.brandId);
    await BrandTeamMember.findOneAndDelete({
      _id: req.params.memberId,
      brandId: req.params.brandId,
    });
    res.json({ success: true, message: 'Team member removed' });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// @route   PATCH /api/brand-team/:brandId/:memberId/role
// @desc    Update a team member's role
// @access  Brand owner / brand_admin
router.patch('/:brandId/:memberId/role', protect, async (req, res) => {
  try {
    await assertBrandAccess(req, req.params.brandId);
    const { role } = req.body;
    const member = await BrandTeamMember.findOneAndUpdate(
      { _id: req.params.memberId, brandId: req.params.brandId },
      { role },
      { new: true }
    );
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

module.exports = router;
