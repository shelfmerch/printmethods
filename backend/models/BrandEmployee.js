const mongoose = require('mongoose');

/**
 * BrandEmployee
 * An employee invited by a brand admin to order from the brand swag store.
 * Has a linked Wallet for company-allocated credits.
 * Not a dashboard user — they order via the store storefront.
 */
const BrandEmployeeSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    // Linked system User account (set when they sign up or are matched by email)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    employeeId: {
      type: String, // HR system employee ID for reference
      trim: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    inviteStatus: {
      type: String,
      enum: ['pending', 'active', 'deactivated'],
      default: 'pending',
      index: true,
    },
    inviteToken: {
      type: String,
      select: false,
    },
    inviteExpiry: {
      type: Date,
    },
    // Wallet linked to this employee for company credits
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      sparse: true,
    },
    // Running totals (denormalized for quick display)
    totalCreditAllocatedPaise: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCreditUsedPaise: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// One employee email per brand
BrandEmployeeSchema.index({ brandId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('BrandEmployee', BrandEmployeeSchema);
