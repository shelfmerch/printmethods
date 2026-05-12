# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Dashboard >> analytics charts render
- Location: e2e\dashboard.spec.ts:19:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('canvas')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('canvas')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - generic [ref=e4]:
    - complementary [ref=e5]:
      - link "ShelfMerch" [ref=e7] [cursor=pointer]:
        - /url: /
        - img "ShelfMerch" [ref=e8]
      - button "Bain bain.techvibz.org" [ref=e10] [cursor=pointer]:
        - generic [ref=e11]:
          - img
          - generic [ref=e12]:
            - paragraph [ref=e13]: Bain
            - paragraph [ref=e14]: bain.techvibz.org
        - img
      - navigation [ref=e15]:
        - link "Dashboard" [ref=e16] [cursor=pointer]:
          - /url: /dashboard
          - img
          - text: Dashboard
        - link "Products" [ref=e17] [cursor=pointer]:
          - /url: /products
          - img
          - text: Products
        - link "Store Setup" [ref=e18] [cursor=pointer]:
          - /url: /stores
          - img
          - text: Store Setup
        - link "Orders" [ref=e19] [cursor=pointer]:
          - /url: /orders
          - img
          - text: Orders
        - paragraph [ref=e20]: Brand
        - link "Employees" [ref=e21] [cursor=pointer]:
          - /url: /brand/employees
          - img
          - text: Employees
        - link "Credits" [ref=e22] [cursor=pointer]:
          - /url: /brand/credits
          - img
          - text: Credits
        - link "Team" [ref=e23] [cursor=pointer]:
          - /url: /brand/team
          - img
          - text: Team
        - link "Kits & Items" [ref=e24] [cursor=pointer]:
          - /url: /brand/kits
          - img
          - text: Kits & Items
        - link "Draft Orders" [ref=e25] [cursor=pointer]:
          - /url: /brand/draft-orders
          - img
          - text: Draft Orders
        - paragraph [ref=e26]: Finance
        - link "Company Wallet" [ref=e27] [cursor=pointer]:
          - /url: /wallet
          - img
          - text: Company Wallet
        - link "Billing" [ref=e28] [cursor=pointer]:
          - /url: /brand/billing
          - img
          - text: Billing
        - link "Invoices" [ref=e29] [cursor=pointer]:
          - /url: /invoices
          - img
          - text: Invoices
        - paragraph [ref=e30]: Other
        - link "Analytics" [ref=e31] [cursor=pointer]:
          - /url: /analytics
          - img
          - text: Analytics
        - link "Admin Panel" [ref=e32] [cursor=pointer]:
          - /url: /admin
          - img
          - text: Admin Panel
        - link "Settings" [ref=e33] [cursor=pointer]:
          - /url: /settings
          - img
          - text: Settings
        - link "Support" [ref=e34] [cursor=pointer]:
          - /url: /brand/support-tickets
          - img
          - text: Support
      - generic [ref=e36]:
        - paragraph [ref=e38]: Signed in as
        - paragraph [ref=e39]: koneti.sindhus@gmail.com
        - button "Log out" [ref=e40] [cursor=pointer]:
          - img
          - text: Log out
    - main [ref=e41]:
      - generic [ref=e42]:
        - generic [ref=e43]:
          - generic [ref=e44]:
            - paragraph [ref=e45]: Dashboard
            - heading "Bain" [level=1] [ref=e46]
            - paragraph [ref=e47]: A simple home view for setup, wallet, products, and production progress.
          - generic [ref=e48]:
            - button "Design product" [ref=e49] [cursor=pointer]:
              - img
              - text: Design product
            - button "Create kit" [ref=e50] [cursor=pointer]:
              - text: Create kit
              - img
        - generic [ref=e51]:
          - generic [ref=e52]:
            - paragraph [ref=e53]: Plan
            - generic [ref=e54]:
              - generic [ref=e55]: Free
              - generic [ref=e56]: 15% service fee
          - generic [ref=e57]:
            - paragraph [ref=e58]: Company wallet
            - generic [ref=e59]:
              - generic [ref=e60]: ₹29,211.48
              - button "Top up" [ref=e61] [cursor=pointer]
          - generic [ref=e62]:
            - paragraph [ref=e63]: Team and employees
            - generic [ref=e64]:
              - paragraph [ref=e65]: 0 team / 1 employees
              - paragraph [ref=e66]: "Employee limit: 50"
        - generic [ref=e67]:
          - generic [ref=e68]:
            - generic [ref=e69]:
              - generic [ref=e70]:
                - heading "Getting started" [level=2] [ref=e71]
                - paragraph [ref=e72]: 4/5 steps complete
              - generic [ref=e73]: In setup
            - generic [ref=e74]:
              - button "Create swag store Your company storefront is ready." [ref=e75] [cursor=pointer]:
                - img [ref=e77]
                - generic [ref=e80]:
                  - generic [ref=e81]: Create swag store
                  - generic [ref=e82]: Your company storefront is ready.
                - img [ref=e83]
              - button "Design first product Add your first branded item." [ref=e85] [cursor=pointer]:
                - img [ref=e87]
                - generic [ref=e90]:
                  - generic [ref=e91]: Design first product
                  - generic [ref=e92]: Add your first branded item.
                - img [ref=e93]
              - button "Add team members Invite HR, finance, or marketing." [ref=e95] [cursor=pointer]:
                - img [ref=e97]
                - generic [ref=e102]:
                  - generic [ref=e103]: Add team members
                  - generic [ref=e104]: Invite HR, finance, or marketing.
                - img [ref=e105]
              - button "Top up wallet Fund credits and fulfillment." [ref=e107] [cursor=pointer]:
                - img [ref=e109]
                - generic [ref=e112]:
                  - generic [ref=e113]: Top up wallet
                  - generic [ref=e114]: Fund credits and fulfillment.
                - img [ref=e115]
              - button "Create first kit Build an onboarding or event kit." [ref=e117] [cursor=pointer]:
                - img [ref=e119]
                - generic [ref=e122]:
                  - generic [ref=e123]: Create first kit
                  - generic [ref=e124]: Build an onboarding or event kit.
                - img [ref=e125]
          - generic [ref=e127]:
            - generic [ref=e128]:
              - heading "Product health" [level=2] [ref=e129]
              - generic [ref=e130]:
                - generic [ref=e131]:
                  - paragraph [ref=e132]: Total
                  - paragraph [ref=e133]: "22"
                - generic [ref=e134]:
                  - paragraph [ref=e135]: Live
                  - paragraph [ref=e136]: "2"
                - generic [ref=e137]:
                  - paragraph [ref=e138]: Draft
                  - paragraph [ref=e139]: "20"
              - paragraph [ref=e140]: Free plan allows 10 live products.
            - generic [ref=e141]:
              - generic [ref=e142]:
                - heading "Production" [level=2] [ref=e143]
                - button "Orders" [ref=e144] [cursor=pointer]
              - generic [ref=e145]:
                - generic [ref=e146]:
                  - generic [ref=e147]:
                    - img [ref=e148]
                    - generic [ref=e152]: In production
                  - generic [ref=e153]: "0"
                - generic [ref=e154]:
                  - generic [ref=e155]:
                    - img [ref=e156]
                    - generic [ref=e160]: Printing
                  - generic [ref=e161]: "0"
                - generic [ref=e162]:
                  - generic [ref=e163]:
                    - img [ref=e164]
                    - generic [ref=e168]: Packaging
                  - generic [ref=e169]: "0"
                - generic [ref=e170]:
                  - generic [ref=e171]:
                    - img [ref=e172]
                    - generic [ref=e177]: Shipped
                  - generic [ref=e178]: "0"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Dashboard', () => {
  4  | 
  5  |   test('dashboard metrics render correctly', async ({ page }) => {
  6  |     await page.goto('/dashboard');
  7  | 
  8  |     await expect(page.getByText(/total sales/i)).toBeVisible();
  9  |     await expect(page.getByText(/orders/i)).toBeVisible();
  10 |     await expect(page.getByText(/revenue/i)).toBeVisible();
  11 |   });
  12 | 
  13 |   test('recent orders section loads', async ({ page }) => {
  14 |     await page.goto('/dashboard');
  15 | 
  16 |     await expect(page.locator('[data-testid="recent-orders"]')).toBeVisible();
  17 |   });
  18 | 
  19 |   test('analytics charts render', async ({ page }) => {
  20 |     await page.goto('/dashboard');
  21 | 
> 22 |     await expect(page.locator('canvas')).toBeVisible();
     |                                          ^ Error: expect(locator).toBeVisible() failed
  23 |   });
  24 | });
  25 | 
```