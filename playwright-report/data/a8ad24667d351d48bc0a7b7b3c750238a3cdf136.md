# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cart-checkout.spec.ts >> Cart & Checkout >> checkout flow works
- Location: e2e\cart-checkout.spec.ts:15:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.fill: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('[name="fullName"]')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - generic [ref=e5]:
    - heading "404" [level=1] [ref=e6]
    - paragraph [ref=e7]: Oops! Page not found
    - link "Return to Home" [ref=e8] [cursor=pointer]:
      - /url: /
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Cart & Checkout', () => {
  4  | 
  5  |   test('add product to cart', async ({ page }) => {
  6  |     await page.goto('/products');
  7  | 
  8  |     await page.click('[data-testid="product-card"]');
  9  | 
  10 |     await page.click('[data-testid="add-to-cart"]');
  11 | 
  12 |     await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
  13 |   });
  14 | 
  15 |   test('checkout flow works', async ({ page }) => {
  16 |     await page.goto('/checkout');
  17 | 
> 18 |     await page.fill('[name="fullName"]', 'Test User');
     |                ^ Error: page.fill: Test timeout of 60000ms exceeded.
  19 |     await page.fill('[name="address"]', 'Test Address');
  20 |     await page.fill('[name="city"]', 'Bangalore');
  21 |     await page.fill('[name="pincode"]', '560001');
  22 | 
  23 |     await page.click('[data-testid="place-order"]');
  24 | 
  25 |     await expect(page.getByText(/order confirmed/i)).toBeVisible();
  26 |   });
  27 | });
  28 | 
```