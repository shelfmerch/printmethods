import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('authenticated user can access dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
  });

  test('unauthenticated request to protected page redirects to login', async ({ browser }) => {
    // Intentionally use a fresh context with no stored auth state
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('http://localhost:5173/dashboard');
    await expect(page).toHaveURL(/login/);
    await context.close();
  });

  test('logout clears session and redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="profile-menu"]');
    await page.click('[data-testid="logout-btn"]');
    await expect(page).toHaveURL(/login/);
  });
});
