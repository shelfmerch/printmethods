# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ai-design-tools.spec.ts >> AI Design Tools >> AI background removal works
- Location: e2e\ai-design-tools.spec.ts:15:3

# Error details

```
Error: ENOENT: no such file or directory, stat 'C:\Users\konet\printmethods\e2e\fixtures\mock-files\design.png'
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
  3  | test.describe('AI Design Tools', () => {
  4  | 
  5  |   test('AI generates design suggestions', async ({ page }) => {
  6  |     await page.goto('/ai-tools');
  7  | 
  8  |     await page.fill('[data-testid="prompt-input"]', 'Generate streetwear hoodie');
  9  | 
  10 |     await page.click('[data-testid="generate-ai-btn"]');
  11 | 
  12 |     await expect(page.locator('[data-testid="ai-result"]')).toBeVisible();
  13 |   });
  14 | 
  15 |   test('AI background removal works', async ({ page }) => {
  16 |     await page.goto('/ai-tools');
  17 | 
> 18 |     await page.setInputFiles('[data-testid="bg-upload"]', 'e2e/fixtures/mock-files/design.png');
     |     ^ Error: ENOENT: no such file or directory, stat 'C:\Users\konet\printmethods\e2e\fixtures\mock-files\design.png'
  19 | 
  20 |     await page.click('[data-testid="remove-bg"]');
  21 | 
  22 |     await expect(page.locator('[data-testid="bg-removed-preview"]')).toBeVisible();
  23 |   });
  24 | });
  25 | 
```