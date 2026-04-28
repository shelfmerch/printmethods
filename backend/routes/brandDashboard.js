const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Store = require('../models/Store');
const StoreProduct = require('../models/StoreProduct');
const StoreOrder = require('../models/StoreOrder');
const DirectOrder = require('../models/DirectOrder');
const Kit = require('../models/Kit');
const KitSend = require('../models/KitSend');
const BrandTeamMember = require('../models/BrandTeamMember');
const BrandEmployee = require('../models/BrandEmployee');
const Wallet = require('../models/Wallet');
const { assertBrandAccess } = require('../utils/brandAccess');
const { getPlanLimits, normalizePlanId } = require('../utils/planLimits');

function stageOf(order) {
  if (order.status === 'shipped' || order.status === 'delivered' || order.status === 'fulfilled') return 'shipped';
  return order.shipment?.productionStage || 'queued';
}

function countByStage(orders) {
  return orders.reduce((acc, order) => {
    if (order.status === 'in-production') {
      const stage = stageOf(order);
      acc[stage] = (acc[stage] || 0) + 1;
    }
    return acc;
  }, { queued: 0, printing: 0, packaging: 0, ready_to_ship: 0, shipped: 0 });
}

router.get('/:brandId/summary', protect, async (req, res) => {
  try {
    const store = await assertBrandAccess(req, req.params.brandId);
    const storeId = store._id;

    const [
      products,
      storeOrders,
      directOrders,
      kitCount,
      paidKitSendCount,
      teamCount,
      employeeCount,
      wallet,
    ] = await Promise.all([
      StoreProduct.find({ storeId }).select('status isActive').lean(),
      StoreOrder.find({ storeId }).select('status shipment.productionStage shipment.trackingNumber shipment.trackingUrl').lean(),
      DirectOrder.find({ merchantId: store.merchant, orderType: { $ne: 'quotation' } }).select('status shipment.productionStage').lean(),
      Kit.countDocuments({ brandId: storeId }),
      KitSend.countDocuments({ brandId: storeId, status: { $ne: 'pending_payment' } }),
      BrandTeamMember.countDocuments({ brandId: storeId, inviteStatus: { $ne: 'revoked' } }),
      BrandEmployee.countDocuments({ brandId: storeId, inviteStatus: { $ne: 'deactivated' } }),
      store.companyWalletId ? Wallet.findById(store.companyWalletId).lean() : Wallet.findOne({ userId: store.merchant }).lean(),
    ]);

    const allOrders = [...storeOrders, ...directOrders];
    const stages = countByStage(allOrders);
    const planId = normalizePlanId(store.subscriptionPlan);
    const plan = getPlanLimits(planId);

    const productCounts = {
      total: products.length,
      draft: products.filter((product) => product.status === 'draft').length,
      live: products.filter((product) => product.status === 'published' && product.isActive !== false).length,
    };

    const orderCounts = {
      total: allOrders.length,
      needsAction: allOrders.filter((order) => ['on-hold', 'paid'].includes(order.status)).length,
      inProduction: allOrders.filter((order) => order.status === 'in-production').length,
      printing: stages.printing || 0,
      packaging: stages.packaging || 0,
      readyToShip: stages.ready_to_ship || 0,
      shipped: allOrders.filter((order) => order.status === 'shipped').length,
      delivered: allOrders.filter((order) => order.status === 'delivered' || order.status === 'fulfilled').length,
    };

    const onboarding = {
      storeCreated: true,
      firstProductDesigned: productCounts.total > 0,
      teamMembersAdded: teamCount >= 2,
      walletToppedUp: (wallet?.balancePaise || 0) > 0,
      firstKitCreated: kitCount > 0 || paidKitSendCount > 0,
    };

    return res.json({
      success: true,
      data: {
        store: {
          id: store._id,
          name: store.brandProfile?.companyName || store.name,
          subscriptionPlan: planId,
          subscriptionStatus: store.subscriptionStatus,
        },
        plan,
        products: productCounts,
        orders: orderCounts,
        team: { members: teamCount },
        employees: { total: employeeCount },
        wallet: {
          balancePaise: wallet?.balancePaise || 0,
          balanceRupees: ((wallet?.balancePaise || 0) / 100).toFixed(2),
          currency: wallet?.currency || 'INR',
        },
        kits: {
          total: kitCount,
          paidSends: paidKitSendCount,
        },
        onboarding,
      },
    });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

module.exports = router;
