# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: onboarding.spec.ts >> Merchant Onboarding >> merchant onboarding completes successfully
- Location: e2e\onboarding.spec.ts:5:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.fill: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('[name="storeName"]')

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
  3  | test.describe('Merchant Onboarding', () => {
  4  | 
  5  |   test('merchant onboarding completes successfully', async ({ page }) => {
  6  |     await page.goto('/onboarding');
  7  | 
> 8  |     await page.fill('[name="storeName"]', 'ShelfMerch Store');
     |                ^ Error: page.fill: Test timeout of 60000ms exceeded.
  9  |     await page.fill('[name="brandName"]', 'SM Brand');
  10 | 
  11 |     await page.selectOption('[name="industry"]', 'fashion');
  12 | 
  13 |     await page.click('button:has-text("Continue")');
  14 | 
  15 |     await page.fill('[name="subdomain"]', 'shelfmerch-demo');
  16 | 
  17 |     await page.click('button:has-text("Finish")');
  18 | 
  19 |     await expect(page).toHaveURL(/dashboard/);
  20 |   });
  21 | });
  22 | 
```