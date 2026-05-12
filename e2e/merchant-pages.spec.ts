import { test, expect } from '@playwright/test';

// Section 14: Invoices
// Section 15: Analytics
// Section 16: Settings
// Section 17: Support

test.describe('Invoices (Section 14)', () => {
  test('page loads and shows invoice list or empty state', async ({ page }) => {
    await page.goto('/invoices');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    const hasList = await page.locator('table, [class*="invoice"]').isVisible().catch(() => false);
    const hasEmpty = await page.locator('text=/no invoices|empty|no data/i').isVisible().catch(() => false);
    expect(hasList || hasEmpty).toBe(true);
  });
});

test.describe('Analytics (Section 15)', () => {
  test('page loads with Total Revenue stat card', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText(/Total Revenue/i)).toBeVisible();
    // Revenue value in ₹
    await expect(page.locator('text=/₹[0-9]/').first()).toBeVisible();
  });
});

test.describe('Settings (Section 16)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
  });

  test('shows Store name input pre-filled', async ({ page }) => {
    const input = page.getByLabel(/Store Name/i).or(page.locator('input[id*="storeName"], input[id*="store-name"]')).first();
    await expect(input).toBeVisible();
    const value = await input.inputValue();
    expect(value.trim().length).toBeGreaterThan(0);
  });

  test('shows Subdomain input with .techvibz.org suffix', async ({ page }) => {
    await expect(page.getByLabel(/Subdomain/i).or(page.locator('input[id*="subdomain"]')).first()).toBeVisible();
    await expect(page.getByText('.techvibz.org')).toBeVisible();
  });

  test('shows Description textarea', async ({ page }) => {
    await expect(page.locator('textarea').first()).toBeVisible();
  });

  test('shows Full Name input in profile section', async ({ page }) => {
    await expect(
      page.getByLabel(/Full Name/i).or(page.locator('input[id*="fullName"], input[id*="full-name"]')).first()
    ).toBeVisible();
  });

  test('shows Save Store Settings button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Save Store Settings/i })).toBeVisible();
  });

  test('shows Danger Zone with Delete Store button', async ({ page }) => {
    await expect(page.getByText('Danger Zone')).toBeVisible();
    await expect(page.getByRole('button', { name: /Delete Store/i })).toBeVisible();
  });

  test('/settings/developer shows Developer Dashboard with tabs', async ({ page }) => {
    await page.goto('/settings/developer');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Developer Dashboard')).toBeVisible();
    // Tabs: Shops, API Keys, Webhooks, Rate Limits
    await expect(page.getByRole('tab', { name: /Shops/i }).or(page.getByText('Shops')).first()).toBeVisible();
    await expect(page.getByRole('tab', { name: /API Keys/i }).or(page.getByText('API Keys')).first()).toBeVisible();
  });

  test('/settings/developer/tokens shows Personal Access Tokens page', async ({ page }) => {
    await page.goto('/settings/developer/tokens');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Create|New Token|Generate/i }).first()
    ).toBeVisible();
  });
});

test.describe('Support (Section 17)', () => {
  test('page loads and shows support tickets or empty state', async ({ page }) => {
    await page.goto('/brand/support-tickets');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    const hasList = await page.locator('table, [class*="ticket"]').isVisible().catch(() => false);
    const hasEmpty = await page.locator('text=/no tickets|empty|submit|new ticket/i').isVisible().catch(() => false);
    expect(hasList || hasEmpty).toBe(true);
  });
});
