# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: order-management.spec.ts >> Order Management >> filter orders by status
- Location: e2e\order-management.spec.ts:11:3

# Error details

```
Error: page.selectOption: Test ended.
Call log:
  - waiting for locator('[data-testid="status-filter"]')

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Order Management', () => {
  4  | 
  5  |   test('orders table loads', async ({ page }) => {
  6  |     await page.goto('/orders');
  7  | 
  8  |     await expect(page.locator('[data-testid="orders-table"]')).toBeVisible();
  9  |   });
  10 | 
  11 |   test('filter orders by status', async ({ page }) => {
  12 |     await page.goto('/orders');
  13 | 
> 14 |     await page.selectOption('[data-testid="status-filter"]', 'processing');
     |                ^ Error: page.selectOption: Test ended.
  15 | 
  16 |     await expect(page.locator('[data-testid="orders-table"]')).toContainText('Processing');
  17 |   });
  18 | 
  19 |   test('open order details', async ({ page }) => {
  20 |     await page.goto('/orders');
  21 | 
  22 |     await page.click('[data-testid="view-order"]');
  23 | 
  24 |     await expect(page.locator('[data-testid="order-details"]')).toBeVisible();
  25 |   });
  26 | });
  27 | 
```