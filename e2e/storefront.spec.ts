import { test, expect } from '@playwright/test';

// Section 21: Storefront (path-based)

test.describe('Storefront', () => {
  test('storefront loads for the active store subdomain', async ({ page }) => {
    // Find the subdomain from the Stores page
    await page.goto('/stores');
    await page.waitForLoadState('networkidle');

    // Extract subdomain from the URL shown in the card (e.g. "bain.techvibz.org")
    const subdomainText = await page
      .locator('text=/.+\\.techvibz\\.org/i')
      .first()
      .textContent()
      .catch(() => null);

    let slug: string | null = null;
    if (subdomainText) {
      // "bain.techvibz.org" → "bain"
      slug = subdomainText.trim().split('.')[0];
    }

    if (!slug) {
      // Fallback: look for store link text
      const storeCard = page.locator('[class*="card"]').filter({ hasText: /Active/i }).first();
      const cardText = await storeCard.textContent().catch(() => '');
      const match = cardText.match(/subdomain[:\s]+([a-z0-9-]+)/i)
        || cardText.match(/([a-z0-9-]+)\.techvibz\.org/i);
      slug = match?.[1] ?? null;
    }

    if (!slug) {
      test.skip();
      return;
    }

    await page.goto(`/store/${slug}`);
    await page.waitForLoadState('networkidle');

    // Storefront is customer-facing — different UI from merchant dashboard
    // No sidebar, shows a product grid or empty state
    const hasSidebar = await page.locator('aside').isVisible().catch(() => false);
    expect(hasSidebar).toBe(false);

    const hasProducts = await page.locator('img').first().isVisible().catch(() => false);
    const hasEmpty = await page.locator('text=/no products|coming soon|empty/i').isVisible().catch(() => false);
    expect(hasProducts || hasEmpty).toBe(true);
  });
});
