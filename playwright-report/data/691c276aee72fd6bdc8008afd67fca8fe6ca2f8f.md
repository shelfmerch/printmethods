# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication >> unauthenticated request to protected page redirects to login
- Location: e2e\auth.spec.ts:10:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/dashboard
Call log:
  - navigating to "http://localhost:5173/dashboard", waiting until "load"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e6]:
    - heading "This site can’t be reached" [level=1] [ref=e7]
    - paragraph [ref=e8]:
      - strong [ref=e9]: localhost
      - text: refused to connect.
    - generic [ref=e10]:
      - paragraph [ref=e11]: "Try:"
      - list [ref=e12]:
        - listitem [ref=e13]: Checking the connection
        - listitem [ref=e14]:
          - link "Checking the proxy and the firewall" [ref=e15] [cursor=pointer]:
            - /url: "#buttons"
    - generic [ref=e16]: ERR_CONNECTION_REFUSED
  - generic [ref=e17]:
    - button "Reload" [ref=e19] [cursor=pointer]
    - button "Details" [ref=e20] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Authentication', () => {
  4  |   test('authenticated user can access dashboard', async ({ page }) => {
  5  |     await page.goto('/dashboard');
  6  |     await expect(page).toHaveURL(/dashboard/);
  7  |     await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
  8  |   });
  9  | 
  10 |   test('unauthenticated request to protected page redirects to login', async ({ browser }) => {
  11 |     // Intentionally use a fresh context with no stored auth state
  12 |     const context = await browser.newContext();
  13 |     const page = await context.newPage();
> 14 |     await page.goto('http://localhost:5173/dashboard');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/dashboard
  15 |     await expect(page).toHaveURL(/login/);
  16 |     await context.close();
  17 |   });
  18 | 
  19 |   test('logout clears session and redirects to login', async ({ page }) => {
  20 |     await page.goto('/dashboard');
  21 |     await page.click('[data-testid="profile-menu"]');
  22 |     await page.click('[data-testid="logout-btn"]');
  23 |     await expect(page).toHaveURL(/login/);
  24 |   });
  25 | });
  26 | 
```