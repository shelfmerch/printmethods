import { test, expect } from '@playwright/test';

test.describe('Tenant Switching', () => {

  test('switch tenant dynamically', async ({ page }) => {
    await page.goto('/dashboard');

    await page.click('[data-testid="tenant-switcher"]');

    await page.click('[data-testid="tenant-option-demo"]');

    await expect(page).toHaveURL(/demo/);
  });

  test('tenant-specific branding loads', async ({ page }) => {
    await page.goto('/demo');

    await expect(page.locator('[data-testid="tenant-logo"]')).toBeVisible();
  });
});
