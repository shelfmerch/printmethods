import { test, expect } from '@playwright/test';

// Section 2: Auth page — no password, OTP only
// Section 22: Unauthenticated redirect check

test.describe('Auth Page (Section 2)', () => {
  // Override storage state — auth page should be tested without a session
  test.use({ storageState: { cookies: [], origins: [] } });

  test('auth page shows email/phone input and Continue button, no password field', async ({ page }) => {
    await page.goto('/auth');
    // OTP-only: email/phone input must exist
    await expect(page.locator('input[type="email"], input[type="tel"], input[placeholder*="email"], input[placeholder*="phone"]').first()).toBeVisible();
    // Continue button (not a password submit)
    await expect(page.getByRole('button', { name: /continue/i })).toBeVisible();
    // No password field
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
  });
});

test.describe('Authenticated Session', () => {
  test('authenticated user can reach the dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard/);
  });
});

test.describe('Unauthenticated Redirect (Section 22)', () => {
  test('fresh context without auth is redirected to /auth when visiting /dashboard', async ({ browser }) => {
    // Intentionally use a fresh context with NO storage state
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('http://localhost:8081/dashboard');
    await expect(page).toHaveURL(/\/auth/);
    await context.close();
  });
});
