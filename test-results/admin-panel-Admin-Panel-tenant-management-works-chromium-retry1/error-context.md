# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-panel.spec.ts >> Admin Panel >> tenant management works
- Location: e2e\admin-panel.spec.ts:11:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="tenant-table"]')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('[data-testid="tenant-table"]')

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
  3  | test.use({ storageState: 'e2e/.auth/user.json' });
  4  | 
  5  | test.describe('Admin Panel', () => {
  6  |   test('admin dashboard loads', async ({ page }) => {
  7  |     await page.goto('/admin');
  8  |     await expect(page.getByText(/admin dashboard/i)).toBeVisible();
  9  |   });
  10 | 
  11 |   test('tenant management works', async ({ page }) => {
  12 |     await page.goto('/admin/tenants');
> 13 |     await expect(page.locator('[data-testid="tenant-table"]')).toBeVisible();
     |                                                                ^ Error: expect(locator).toBeVisible() failed
  14 |   });
  15 | 
  16 |   test('admin can disable store', async ({ page }) => {
  17 |     await page.goto('/admin/tenants');
  18 |     await page.click('[data-testid="disable-store"]');
  19 |     await expect(page.getByText(/store disabled/i)).toBeVisible();
  20 |   });
  21 | });
  22 | 
```