import { test, expect } from '@playwright/test';

test.describe('Cart & Checkout', () => {

  test('add product to cart', async ({ page }) => {
    await page.goto('/products');

    await page.click('[data-testid="product-card"]');

    await page.click('[data-testid="add-to-cart"]');

    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
  });

  test('checkout flow works', async ({ page }) => {
    await page.goto('/checkout');

    await page.fill('[name="fullName"]', 'Test User');
    await page.fill('[name="address"]', 'Test Address');
    await page.fill('[name="city"]', 'Bangalore');
    await page.fill('[name="pincode"]', '560001');

    await page.click('[data-testid="place-order"]');

    await expect(page.getByText(/order confirmed/i)).toBeVisible();
  });
});
