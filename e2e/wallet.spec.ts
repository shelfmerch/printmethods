import { test, expect } from '@playwright/test';

// Section 12: Company Wallet

test.describe('Company Wallet', () => {
  test('wallet page loads and shows balance in ₹', async ({ page }) => {
    await page.goto('/wallet');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toBeVisible();
    // Balance in ₹ format
    await expect(page.locator('text=/₹[0-9]/').first()).toBeVisible();
  });

  test('wallet/top-up shows top-up amount form', async ({ page }) => {
    await page.goto('/wallet/top-up');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    // Amount input or preset buttons
    await expect(
      page.locator('input[type="number"], input[placeholder*="amount" i], button:has-text("₹")')
        .first()
    ).toBeVisible();
  });

  test('wallet/transactions shows transaction list or empty state', async ({ page }) => {
    await page.goto('/wallet/transactions');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    // Either a table/list or an empty state message
    const hasList = await page.locator('table, [role="list"], [class*="list"]').isVisible().catch(() => false);
    const hasEmpty = await page.locator('text=/no transactions|empty|no data/i').isVisible().catch(() => false);
    expect(hasList || hasEmpty).toBe(true);
  });
});
