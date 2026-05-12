import { test, expect } from '@playwright/test';

test.describe('API Validation', () => {

  test('products API returns 200', async ({ request }) => {
    const response = await request.get('/api/products');

    expect(response.status()).toBe(200);
  });

  test('orders API returns valid schema', async ({ request }) => {
    const response = await request.get('/api/orders');

    const body = await response.json();

    expect(Array.isArray(body.orders)).toBeTruthy();
  });

  test('auth API blocks unauthorized users', async ({ request }) => {
    const response = await request.get('/api/admin');

    expect(response.status()).toBe(401);
  });
});
