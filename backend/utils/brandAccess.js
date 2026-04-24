const Store = require('../models/Store');

async function assertBrandAccess(req, brandId) {
  const store = await Store.findById(brandId);
  if (!store) {
    throw Object.assign(new Error('Brand store not found'), { status: 404 });
  }

  const isOwner = String(store.merchant) === String(req.user._id);
  const isAdmin = req.user.role === 'superadmin';

  if (!isOwner && !isAdmin) {
    const BrandTeamMember = require('../models/BrandTeamMember');
    const isTeamAdmin = await BrandTeamMember.findOne({
      brandId,
      userId: req.user._id,
      role: { $in: ['brand_admin', 'hr_manager'] },
      inviteStatus: 'accepted',
    });

    if (!isTeamAdmin) {
      throw Object.assign(new Error('Not authorized'), { status: 403 });
    }
  }

  return store;
}

module.exports = {
  assertBrandAccess,
};
