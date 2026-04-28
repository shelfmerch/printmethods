const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getPlanLimits,
  assertWithinPlanLimit,
} = require('./planLimits');

test('free plan exposes the agreed store employee and product limits', () => {
  const plan = getPlanLimits('free');

  assert.equal(plan.id, 'free');
  assert.equal(plan.maxStores, 1);
  assert.equal(plan.maxEmployees, 50);
  assert.equal(plan.maxActiveProducts, 10);
});

test('trial maps to free limits for legacy stores', () => {
  assert.deepEqual(getPlanLimits('trial'), getPlanLimits('free'));
});

test('growth plan allows five stores and unlimited kits', () => {
  const plan = getPlanLimits('growth');

  assert.equal(plan.maxStores, 5);
  assert.equal(plan.maxKits, Infinity);
});

test('assertWithinPlanLimit throws a friendly upgrade error when exceeded', () => {
  assert.throws(
    () => assertWithinPlanLimit({
      planId: 'free',
      resource: 'active products',
      currentCount: 10,
      attemptedAdd: 1,
      limitKey: 'maxActiveProducts',
    }),
    /Free allows up to 10 active products/
  );
});
