import { test, expect } from '@playwright/test';

// Section 4: Orders page

test.describe('Orders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');
  });

  test('page heading is Orders', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Orders');
  });

  test('search input is visible with correct placeholder', async ({ page }) => {
    await expect(
      page.locator('input[placeholder="Search by email, product, or order ID"]')
    ).toBeVisible();
  });

  test('All Status filter dropdown is present with correct options', async ({ page }) => {
    const statusTrigger = page.getByRole('combobox').filter({ hasText: /All Status/i }).first();
    await statusTrigger.click();
    await expect(page.getByRole('option', { name: /On Hold/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /^Paid$/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /In Production/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /^Shipped$/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /^Delivered$/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /^Cancelled$/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /^Refunded$/i })).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('All Channels filter dropdown has Storefront and Direct Bulk options', async ({ page }) => {
    const channelTrigger = page.getByRole('combobox').filter({ hasText: /All Channels/i }).first();
    await channelTrigger.click();
    await expect(page.getByRole('option', { name: /Storefront/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /Direct Bulk/i })).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('Tracking State filter has correct options', async ({ page }) => {
    const trackingTrigger = page.getByRole('combobox').filter({ hasText: /Tracking/i }).first();
    await trackingTrigger.click();
    await expect(page.getByRole('option', { name: /Tracking Available/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /Missing Tracking/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /Needs Action/i })).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('All Months filter dropdown is present', async ({ page }) => {
    await expect(
      page.getByRole('combobox').filter({ hasText: /All Months/i }).first()
    ).toBeVisible();
  });

  test('orders table shows correct column headers when orders exist', async ({ page }) => {
    const table = page.locator('table');
    const hasOrders = await table.isVisible().catch(() => false);
    if (!hasOrders) {
      test.skip();
      return;
    }
    const headers = table.locator('thead th');
    await expect(headers.filter({ hasText: /Order/i })).toBeVisible();
    await expect(headers.filter({ hasText: /Channel/i })).toBeVisible();
    await expect(headers.filter({ hasText: /Customer/i })).toBeVisible();
    await expect(headers.filter({ hasText: /Status/i })).toBeVisible();
    await expect(headers.filter({ hasText: /Tracking/i })).toBeVisible();
    await expect(headers.filter({ hasText: /Amount/i })).toBeVisible();
    await expect(headers.filter({ hasText: /Action/i })).toBeVisible();
  });

  test('clicking View on first order navigates to order detail', async ({ page }) => {
    const viewBtn = page.getByRole('button', { name: /View/i }).first();
    const hasOrders = await viewBtn.isVisible().catch(() => false);
    if (!hasOrders) {
      test.skip();
      return;
    }
    await viewBtn.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/orders\//);
    // Detail page renders something — heading or order ID
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});
