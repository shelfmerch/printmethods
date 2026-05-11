# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mockup-generation.spec.ts >> Mockup Generation >> generate realistic mockups
- Location: e2e\mockup-generation.spec.ts:5:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('[data-testid="generate-mockup"]')

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
  3  | test.describe('Mockup Generation', () => {
  4  | 
  5  |   test('generate realistic mockups', async ({ page }) => {
  6  |     await page.goto('/mockups');
  7  | 
> 8  |     await page.click('[data-testid="generate-mockup"]');
     |                ^ Error: page.click: Test timeout of 60000ms exceeded.
  9  | 
  10 |     await expect(page.locator('[data-testid="mockup-result"]')).toBeVisible();
  11 |   });
  12 | 
  13 |   test('switch mockup variants', async ({ page }) => {
  14 |     await page.goto('/mockups');
  15 | 
  16 |     await page.click('[data-testid="variant-black"]');
  17 | 
  18 |     await expect(page.locator('[data-testid="mockup-preview"]')).toBeVisible();
  19 |   });
  20 | 
  21 |   test('download generated mockup', async ({ page }) => {
  22 |     await page.goto('/mockups');
  23 | 
  24 |     const downloadPromise = page.waitForEvent('download');
  25 | 
  26 |     await page.click('[data-testid="download-mockup"]');
  27 | 
  28 |     const download = await downloadPromise;
  29 | 
  30 |     expect(download.suggestedFilename()).toContain('.png');
  31 |   });
  32 | });
  33 | 
```