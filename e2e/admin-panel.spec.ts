import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/user.json' });

test.describe('Admin Panel', () => {
  test('admin dashboard loads', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByText(/admin dashboard/i)).toBeVisible();
  });

  test('tenant management works', async ({ page }) => {
    await page.goto('/admin/tenants');
    await expect(page.locator('[data-testid="tenant-table"]')).toBeVisible();
  });

  test('admin can disable store', async ({ page }) => {
    await page.goto('/admin/tenants');
    await page.click('[data-testid="disable-store"]');
    await expect(page.getByText(/store disabled/i)).toBeVisible();
  });
});
