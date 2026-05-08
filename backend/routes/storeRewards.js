const express = require('express');
const mongoose = require('mongoose');
const Store = require('../models/Store');
const StoreCustomer = require('../models/StoreCustomer');
const BrandEmployee = require('../models/BrandEmployee');
const CreditAllocation = require('../models/CreditAllocation');
const Wallet = require('../models/Wallet');
const { verifyStoreToken } = require('../middleware/auth');

const router = express.Router();

const findEmployeeCreditContext = async (store, customer) => {
  if (!store || !customer?.email) return { employee: null, wallet: null, balancePaise: 0 };

  const employee = await BrandEmployee.findOne({
    brandId: store._id,
    email: customer.email.toLowerCase(),
    inviteStatus: { $in: ['active', 'pending'] },
  });

  if (!employee?.walletId) return { employee, wallet: null, balancePaise: 0 };

  const wallet = await Wallet.findById(employee.walletId);
  if (!wallet || wallet.status !== 'ACTIVE') return { employee, wallet: null, balancePaise: 0 };

  return { employee, wallet, balancePaise: wallet.balancePaise || 0 };
};

const resolveStoreCustomer = async (req, subdomain) => {
  const store = await Store.findOne({ slug: subdomain, isActive: true }).lean();
  if (!store) return { store: null, customer: null, error: { status: 404, message: 'Store not found' } };

  const customerIdFromToken = req.customer?.customer?.id;
  const storeIdFromToken = req.customer?.customer?.storeId;
  if (!customerIdFromToken || String(storeIdFromToken) !== String(store._id)) {
    return { store: null, customer: null, error: { status: 403, message: 'Customer does not belong to this store' } };
  }

  const customer = await StoreCustomer.findById(customerIdFromToken);
  if (!customer) return { store: null, customer: null, error: { status: 404, message: 'Customer not found' } };

  return { store, customer, error: null };
};

// GET /api/store-rewards/:subdomain/wallet
router.get('/:subdomain/wallet', verifyStoreToken, async (req, res) => {
  try {
    const { subdomain } = req.params;
    const { store, customer, error } = await resolveStoreCustomer(req, subdomain);
    if (error) return res.status(error.status).json({ success: false, message: error.message });

    const { wallet } = await findEmployeeCreditContext(store, customer);
    const remainingBalancePaise = wallet?.balancePaise || 0;

    // Pending (not credited yet) allocations for this employee (should be 0 in new flow)
    const employee = await BrandEmployee.findOne({
      brandId: store._id,
      email: customer.email.toLowerCase(),
      inviteStatus: { $in: ['active', 'pending'] },
    }).lean();

    let pendingClaimablePaise = 0;
    let hasClaimedRewards = remainingBalancePaise > 0;
    if (employee?._id) {
      const now = new Date();
      const agg = await CreditAllocation.aggregate([
        { $match: { brandId: store._id, employeeId: employee._id, status: 'active' } },
        {
          $addFields: {
            isExpired: {
              $and: [
                { $ne: ['$expiresAt', null] },
                { $lt: ['$expiresAt', now] },
              ],
            },
          },
        },
        { $match: { isExpired: false } },
        { $match: { employeeWalletTxnId: { $exists: false } } },
        { $group: { _id: null, total: { $sum: '$amountPaise' } } },
      ]);
      pendingClaimablePaise = agg[0]?.total || 0;
    }

    res.json({
      success: true,
      data: {
        totalBalancePaise: remainingBalancePaise,
        usedBalancePaise: 0,
        remainingBalancePaise,
        pendingClaimablePaise,
        hasClaimedRewards,
      },
    });
  } catch (e) {
    console.error('[store-rewards] wallet error', e);
    res.status(500).json({ success: false, message: 'Failed to load rewards wallet' });
  }
});

// GET /api/store-rewards/:subdomain
router.get('/:subdomain', verifyStoreToken, async (req, res) => {
  try {
    const { subdomain } = req.params;
    const { store, customer, error } = await resolveStoreCustomer(req, subdomain);
    if (error) return res.status(error.status).json({ success: false, message: error.message });

    const employee = await BrandEmployee.findOne({
      brandId: store._id,
      email: customer.email.toLowerCase(),
      inviteStatus: { $in: ['active', 'pending'] },
    }).lean();

    if (!employee?._id) return res.json({ success: true, data: [] });

    const allocations = await CreditAllocation.find({ brandId: store._id, employeeId: employee._id })
      .sort({ createdAt: -1 })
      .lean();

    const now = Date.now();
    const rewards = allocations.map((a) => {
      const credited = !!a.employeeWalletTxnId;

      // Manual claim removed. If it's consumed, it's used; otherwise it's credited.
      let status = a.status === 'consumed' ? 'used' : 'claimed';

      const title = (a.note && a.note.trim()) ? a.note.trim() : 'Reward';
      const category = a.occasion || 'custom';

      return {
        id: a._id.toString(),
        title,
        category,
        amountPaise: a.amountPaise || 0,
        status,
        expiresAt: a.expiresAt ? new Date(a.expiresAt).toISOString() : null,
        claimedAt: credited ? a.updatedAt?.toISOString?.() || null : null,
      };
    });

    res.json({ success: true, data: rewards });
  } catch (e) {
    console.error('[store-rewards] list error', e);
    res.status(500).json({ success: false, message: 'Failed to load rewards' });
  }
});

// Manual claim removed: rewards are auto-credited on assignment.
router.post('/:subdomain/:rewardId/claim', verifyStoreToken, async (req, res) => {
  return res.status(410).json({
    success: false,
    message: 'Manual claim is no longer required. Rewards are credited automatically.',
  });
});

module.exports = router;

