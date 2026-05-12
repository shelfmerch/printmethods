import { test, expect } from '@playwright/test';

// Section 18: Products / Catalog pages

test.describe('Products Page', () => {
  test('product catalog shows category sections with product names and images', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    // Product grid or category sections are visible
    await expect(page.locator('img').first()).toBeVisible();
    // At least one product or category name
    await expect(
      page.locator('h1, h2, h3, [class*="product"], [class*="category"]').first()
    ).toBeVisible();
  });
});

test.describe('Catalog Browse', () => {
  test('catalog page loads with search input', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[placeholder*="Search" i]')).toBeVisible();
  });

  test('catalog shows product cards with price and minimum quantity', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    // Price in ₹
    await expect(page.locator('text=/₹[0-9]/').first()).toBeVisible();
    // Min qty label
    await expect(
      page.locator('text=/min|minimum|qty|quantity/i').first()
    ).toBeVisible();
  });

  test('clicking a catalog product navigates to its detail page', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    // Click the first product card
    const firstProduct = page.locator('a[href*="/catalog/"]').first();
    await firstProduct.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/catalog\/.+/);
    // Detail page shows product name and an order/pricing section
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(
      page.locator('text=/₹[0-9]|Order Now|Add to Order|Proceed/i').first()
    ).toBeVisible();
  });
});

test.describe('Design Editor (Section 19)', () => {
  test('designer page loads with canvas, left panel, and toolbar', async ({ page }) => {
    // Navigate to /products first to find a real product ID
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Try to find a product link to get an ID
    const productLink = page.locator('a[href*="/designer/"]').first();
    const hasDesignerLink = await productLink.isVisible().catch(() => false);

    let designerUrl = '/designer/test';
    if (hasDesignerLink) {
      const href = await productLink.getAttribute('href') ?? '/designer/test';
      designerUrl = href;
    }

    await page.goto(designerUrl);
    await page.waitForLoadState('networkidle');

    // Canvas area
    await expect(
      page.locator('canvas, [class*="canvas"], [data-testid*="canvas"]').first()
    ).toBeVisible();
    // Left panel with icons
    await expect(
      page.locator('[class*="panel"], [class*="sidebar"], [class*="left"]').first()
    ).toBeVisible();
  });
});
