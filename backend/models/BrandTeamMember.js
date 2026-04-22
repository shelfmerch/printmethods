const mongoose = require('mongoose');

/**
 * BrandTeamMember
 * A user who has been invited to manage a brand's swag store.
 * Roles: brand_admin, hr_manager, finance, marketing
 * Not the same as BrandEmployee (who only orders swag).
 */
const BrandTeamMemberSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true, // null until invite is accepted
      index: true,
    },
    inviteEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['brand_admin', 'hr_manager', 'finance', 'marketing'],
      default: 'hr_manager',
      required: true,
    },
    inviteStatus: {
      type: String,
      enum: ['pending', 'accepted', 'revoked'],
      default: 'pending',
    },
    inviteToken: {
      type: String,
      select: false,
    },
    inviteExpiry: {
      type: Date,
    },
    acceptedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Unique: one role per email per brand
BrandTeamMemberSchema.index({ brandId: 1, inviteEmail: 1 }, { unique: true });

module.exports = mongoose.model('BrandTeamMember', BrandTeamMemberSchema);
