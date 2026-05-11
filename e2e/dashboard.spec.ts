import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {

  test('dashboard metrics render correctly', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByText(/total sales/i)).toBeVisible();
    await expect(page.getByText(/orders/i)).toBeVisible();
    await expect(page.getByText(/revenue/i)).toBeVisible();
  });

  test('recent orders section loads', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.locator('[data-testid="recent-orders"]')).toBeVisible();
  });

  test('analytics charts render', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.locator('canvas')).toBeVisible();
  });
});
