import { test, expect } from '@playwright/test';

// Section 20: Admin Panel (requires superadmin session)

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    // If we're redirected away, the user is not superadmin — skip all admin tests
    const url = page.url();
    if (!url.includes('/admin')) {
      test.skip();
    }
  });

  test('admin overview tab shows Platform Overview with stat cards', async ({ page }) => {
    await expect(page.getByText('Platform Overview')).toBeVisible();
    // Stats: Monthly Revenue, Active Stores, Base Products, Orders Delivered
    await expect(page.getByText(/Monthly Revenue/i)).toBeVisible();
    await expect(page.getByText(/Active Stores/i)).toBeVisible();
    await expect(page.getByText(/Base Products/i)).toBeVisible();
  });

  test('clicking users tab shows User Management table', async ({ page }) => {
    // Navigate via URL param — admin uses ?tab=users
    await page.goto('/admin?tab=users');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/User Management/i)).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    // Table columns
    const headers = page.locator('table thead th, table th');
    await expect(headers.filter({ hasText: /User|Name/i }).first()).toBeVisible();
    await expect(headers.filter({ hasText: /Store/i }).first()).toBeVisible();
  });

  test('clicking products tab shows base products catalog with search', async ({ page }) => {
    await page.goto('/admin?tab=products');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[placeholder*="search" i], input[placeholder*="Search" i]').first()).toBeVisible();
    await expect(page.locator('table, [class*="catalog"]').first()).toBeVisible();
  });

  test('clicking orders tab shows platform-wide orders', async ({ page }) => {
    await page.goto('/admin?tab=orders');
    await page.waitForLoadState('networkidle');
    // Orders section with status filter
    await expect(
      page.locator('select, [role="combobox"]').filter({ hasText: /status|all/i }).first()
        .or(page.getByText(/orders/i).first())
    ).toBeVisible();
  });

  test('/admin/print-methods page loads', async ({ page }) => {
    await page.goto('/admin/print-methods');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('/admin/variant-options page loads', async ({ page }) => {
    await page.goto('/admin/variant-options');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('/admin/assets page loads', async ({ page }) => {
    await page.goto('/admin/assets');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2, main').first()).toBeVisible();
  });

  test('/admin/withdrawals page loads', async ({ page }) => {
    await page.goto('/admin/withdrawals');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2, main').first()).toBeVisible();
  });
});
