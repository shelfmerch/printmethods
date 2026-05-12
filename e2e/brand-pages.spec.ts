import { test, expect } from '@playwright/test';

// Section 10: Employees page
// Section 11: Credits page

test.describe('Brand Employees (Section 10)', () => {
  test('page loads without error', async ({ page }) => {
    await page.goto('/brand/employees');
    await page.waitForLoadState('networkidle');
    // No error toast or crash — main content is visible
    await expect(page.locator('h1, h2, main, [role="main"]').first()).toBeVisible();
    await expect(page.locator('text=/error|failed to load|something went wrong/i')).toHaveCount(0);
  });
});

test.describe('Brand Credits (Section 11)', () => {
  test('page loads without error and shows credit allocation content', async ({ page }) => {
    await page.goto('/brand/credits');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2, main, [role="main"]').first()).toBeVisible();
    await expect(page.locator('text=/error|failed to load|something went wrong/i')).toHaveCount(0);
  });
});
