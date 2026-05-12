import { test, expect } from '@playwright/test';

// Section 13: Billing & Subscription

test.describe('Billing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/brand/billing');
    await page.waitForLoadState('networkidle');
  });

  test('shows Free plan card with ₹0 price', async ({ page }) => {
    await expect(page.getByText('Free').first()).toBeVisible();
    await expect(page.getByText(/₹0/)).toBeVisible();
  });

  test('Free plan shows expected features', async ({ page }) => {
    await expect(page.getByText('1 swag store')).toBeVisible();
    await expect(page.getByText('Up to 50 employees')).toBeVisible();
    await expect(page.getByText('10 live swag store products')).toBeVisible();
  });

  test('shows Growth plan card with ₹4,999/month price', async ({ page }) => {
    await expect(page.getByText('Growth').first()).toBeVisible();
    await expect(page.getByText(/₹4,999/)).toBeVisible();
    await expect(page.getByText(/month/i).first()).toBeVisible();
  });

  test('Growth plan shows Most Popular badge', async ({ page }) => {
    await expect(page.getByText('Most Popular')).toBeVisible();
  });

  test('Growth plan shows expected features', async ({ page }) => {
    await expect(page.getByText('5 swag stores')).toBeVisible();
    await expect(page.getByText('Unlimited kits')).toBeVisible();
  });

  test('shows Enterprise plan card with custom pricing', async ({ page }) => {
    await expect(page.getByText('Enterprise').first()).toBeVisible();
    await expect(page.getByText(/Custom|Contact/i).first()).toBeVisible();
  });
});
