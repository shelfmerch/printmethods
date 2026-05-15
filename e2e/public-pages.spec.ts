import { test, expect } from '@playwright/test';

// Section 1: Public marketing pages — no auth required
// These tests run WITHOUT stored auth state
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Public Marketing Pages', () => {
  test('homepage loads with ShelfMerch logo', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('img[alt="ShelfMerch"]').first()).toBeVisible();
  });

  test('pricing page shows Free, Growth, Enterprise plan cards', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByText('Free').first()).toBeVisible();
    await expect(page.getByText('Growth').first()).toBeVisible();
    await expect(page.getByText('Enterprise').first()).toBeVisible();
  });

  test('platform page loads', async ({ page }) => {
    await page.goto('/platform');
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.locator('h1, h2, main')).toBeVisible();
  });

  test('about/our-story page loads', async ({ page }) => {
    await page.goto('/about/our-story');
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.locator('h1, h2, main')).toBeVisible();
  });

  test('support/help-center page loads', async ({ page }) => {
    await page.goto('/support/help-center');
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.locator('h1, h2, main')).toBeVisible();
  });

  test('privacy-policy page loads', async ({ page }) => {
    await page.goto('/privacy-policy');
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.locator('h1, h2, main')).toBeVisible();
  });

  test('terms-of-conditions page loads', async ({ page }) => {
    await page.goto('/terms-of-conditions');
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.locator('h1, h2, main')).toBeVisible();
  });

  test('catalog page loads with search input and product cards', async ({ page }) => {
    await page.goto('/catalog');
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    // At least one product card with a price
    await expect(page.locator('text=/₹[0-9]/').first()).toBeVisible();
  });
});
