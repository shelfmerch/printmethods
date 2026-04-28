const PLAN_LIMITS = {
  free: {
    id: 'free',
    legacyIds: ['trial'],
    name: 'Free',
    priceMonthlyPaise: 0,
    priceMonthlyUsdCents: 0,
    maxStores: 1,
    maxEmployees: 50,
    maxActiveProducts: 10,
    maxKits: 3,
    serviceFeePercent: 15,
  },
  growth: {
    id: 'growth',
    legacyIds: ['starter', 'business'],
    name: 'Growth',
    priceMonthlyPaise: 499900,
    priceMonthlyUsdCents: 5900,
    maxStores: 5,
    maxEmployees: 500,
    maxActiveProducts: 250,
    maxKits: Infinity,
    serviceFeePercent: 8,
  },
  enterprise: {
    id: 'enterprise',
    legacyIds: [],
    name: 'Enterprise',
    priceMonthlyPaise: null,
    priceMonthlyUsdCents: null,
    maxStores: Infinity,
    maxEmployees: Infinity,
    maxActiveProducts: Infinity,
    maxKits: Infinity,
    serviceFeePercent: 0,
  },
};

function normalizePlanId(planId) {
  const id = String(planId || 'free').toLowerCase();
  if (PLAN_LIMITS[id]) return id;

  const match = Object.values(PLAN_LIMITS).find((plan) => plan.legacyIds.includes(id));
  return match?.id || 'free';
}

function isKnownPlanId(planId) {
  const id = String(planId || '').toLowerCase();
  return Boolean(PLAN_LIMITS[id] || Object.values(PLAN_LIMITS).some((plan) => plan.legacyIds.includes(id)));
}

function getPlanLimits(planId) {
  return PLAN_LIMITS[normalizePlanId(planId)];
}

function formatLimit(limit) {
  return limit === Infinity ? 'unlimited' : String(limit);
}

function assertWithinPlanLimit({ planId, resource, currentCount, attemptedAdd = 1, limitKey }) {
  const plan = getPlanLimits(planId);
  const limit = plan[limitKey];
  if (limit === Infinity) return;

  if (currentCount + attemptedAdd > limit) {
    const error = new Error(
      `${plan.name} allows up to ${formatLimit(limit)} ${resource}. Upgrade to Growth or Enterprise to add more.`
    );
    error.status = 403;
    error.code = 'PLAN_LIMIT_EXCEEDED';
    error.plan = plan;
    error.limit = limit;
    throw error;
  }
}

module.exports = {
  PLAN_LIMITS,
  normalizePlanId,
  isKnownPlanId,
  getPlanLimits,
  assertWithinPlanLimit,
};
