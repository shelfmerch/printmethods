import { test, expect } from '@playwright/test';

test.describe('Order Management', () => {

  test('orders table loads', async ({ page }) => {
    await page.goto('/orders');

    await expect(page.locator('[data-testid="orders-table"]')).toBeVisible();
  });

  test('filter orders by status', async ({ page }) => {
    await page.goto('/orders');

    await page.selectOption('[data-testid="status-filter"]', 'processing');

    await expect(page.locator('[data-testid="orders-table"]')).toContainText('Processing');
  });

  test('open order details', async ({ page }) => {
    await page.goto('/orders');

    await page.click('[data-testid="view-order"]');

    await expect(page.locator('[data-testid="order-details"]')).toBeVisible();
  });
});
