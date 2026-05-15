import { test, expect, devices } from '@playwright/test';

test.use(devices['iPhone 13']);

test.describe('Responsive Testing', () => {

  test('mobile navbar works', async ({ page }) => {
    await page.goto('/');

    await page.click('[data-testid="mobile-menu"]');

    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
  });

  test('product editor responsive layout', async ({ page }) => {
    await page.goto('/editor');

    await expect(page.locator('[data-testid="editor-container"]')).toBeVisible();
  });
});
