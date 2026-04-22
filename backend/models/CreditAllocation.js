const mongoose = require('mongoose');

/**
 * CreditAllocation
 * Audit trail for every credit gift from a brand's company wallet to an employee's wallet.
 * One record per allocation event (brand_admin → employee, on a specific occasion).
 */
const CreditAllocationSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BrandEmployee',
      required: true,
      index: true,
    },
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 1,
    },
    occasion: {
      type: String,
      enum: ['onboarding', 'birthday', 'anniversary', 'performance', 'festival', 'custom'],
      default: 'custom',
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    expiresAt: {
      type: Date, // null = no expiry
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'consumed'],
      default: 'active',
      index: true,
    },
    // Snapshot of wallet transaction IDs for traceability
    companyWalletTxnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WalletTransaction',
      sparse: true,
    },
    employeeWalletTxnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WalletTransaction',
      sparse: true,
    },
  },
  { timestamps: true }
);

// Fast lookup: all allocations for an employee in a brand
CreditAllocationSchema.index({ brandId: 1, employeeId: 1, createdAt: -1 });

module.exports = mongoose.model('CreditAllocation', CreditAllocationSchema);
