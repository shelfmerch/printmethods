# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-panel.spec.ts >> Admin Panel >> admin dashboard loads
- Location: e2e\admin-panel.spec.ts:6:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/admin dashboard/i)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText(/admin dashboard/i)

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - region "Notifications (F8)":
      - list
    - region "Notifications alt+T"
    - generic [ref=e4]:
      - banner [ref=e5]:
        - generic [ref=e6]:
          - generic [ref=e7]:
            - link "ShelfMerch" [ref=e8] [cursor=pointer]:
              - /url: /
              - img "ShelfMerch" [ref=e9]
            - navigation [ref=e10]:
              - link "Catalog" [ref=e11] [cursor=pointer]:
                - /url: /products
              - link "Pricing" [ref=e12] [cursor=pointer]:
                - /url: "#pricing"
              - link "Support" [ref=e13] [cursor=pointer]:
                - /url: "#support"
              - link "Help Center" [ref=e14] [cursor=pointer]:
                - /url: "#help"
          - generic [ref=e15]:
            - button [ref=e16] [cursor=pointer]:
              - img
            - button "Open user menu" [ref=e18] [cursor=pointer]:
              - generic [ref=e20]:
                - img
      - complementary [ref=e21]:
        - paragraph [ref=e23]: SUPER ADMIN
        - navigation [ref=e24]:
          - generic [ref=e25]:
            - paragraph [ref=e26]: Core
            - button "Overview" [ref=e27] [cursor=pointer]:
              - img
              - text: Overview
            - button "Product Catalog" [ref=e28] [cursor=pointer]:
              - img
              - text: Product Catalog
            - button "Direct Orders" [ref=e29] [cursor=pointer]:
              - img
              - text: Direct Orders
          - generic [ref=e30]:
            - paragraph [ref=e31]: Platform
            - button "Quotations" [ref=e32] [cursor=pointer]:
              - img
              - text: Quotations
            - button "Shopify Orders" [ref=e33] [cursor=pointer]:
              - img
              - text: Shopify Orders
          - generic [ref=e34]:
            - paragraph [ref=e35]: Finance
            - button "Wallets" [ref=e36] [cursor=pointer]:
              - img
              - text: Wallets
            - button "Invoices" [ref=e37] [cursor=pointer]:
              - img
              - text: Invoices
            - button "Withdrawals" [ref=e38] [cursor=pointer]:
              - img
              - text: Withdrawals
          - generic [ref=e39]:
            - paragraph [ref=e40]: Platform
            - button "Active Stores" [ref=e41] [cursor=pointer]:
              - img
              - text: Active Stores
            - button "User Management" [ref=e42] [cursor=pointer]:
              - img
              - text: User Management
            - button "Platform Settings" [ref=e43] [cursor=pointer]:
              - img
              - text: Platform Settings
            - link "Variant Options" [ref=e44] [cursor=pointer]:
              - /url: /admin/variant-options
              - img
              - text: Variant Options
            - link "Design Assets" [ref=e45] [cursor=pointer]:
              - /url: /admin/assets
              - img
              - text: Design Assets
            - button "Catalogue Fields" [ref=e46] [cursor=pointer]:
              - img
              - text: Catalogue Fields
            - button "Print Methods" [ref=e47] [cursor=pointer]:
              - img
              - text: Print Methods
            - button "Audit Logs" [ref=e48] [cursor=pointer]:
              - img
              - text: Audit Logs
          - generic [ref=e49]:
            - paragraph [ref=e50]: Insights
            - button "Analytics" [ref=e51] [cursor=pointer]:
              - img
              - text: Analytics
            - button "Marketing" [ref=e52] [cursor=pointer]:
              - img
              - text: Marketing
            - button "Support" [ref=e53] [cursor=pointer]:
              - img
              - text: Support
      - main [ref=e54]:
        - generic [ref=e55]:
          - generic [ref=e56]:
            - generic [ref=e57]:
              - heading "Platform Overview" [level=1] [ref=e58]
              - paragraph [ref=e59]: Monitor your print-on-demand business at a glance
            - generic [ref=e60]:
              - combobox [ref=e61] [cursor=pointer]:
                - generic: This Month
                - img [ref=e62]
              - button "Export" [ref=e64] [cursor=pointer]:
                - img
                - text: Export
          - generic [ref=e65]:
            - generic [ref=e67]:
              - generic [ref=e68]:
                - img [ref=e69]
                - generic [ref=e71]:
                  - img [ref=e72]
                  - generic [ref=e75]: +23%
              - paragraph [ref=e76]: Monthly Revenue
              - paragraph [ref=e77]: ₹0
            - generic [ref=e79]:
              - generic [ref=e80]:
                - img [ref=e81]
                - generic [ref=e86]:
                  - img [ref=e87]
                  - generic [ref=e90]: +15%
              - paragraph [ref=e91]: Active Stores
              - paragraph [ref=e92]: "10"
            - generic [ref=e94]:
              - generic [ref=e95]:
                - img [ref=e96]
                - generic [ref=e100]:
                  - img [ref=e101]
                  - generic [ref=e104]: +8%
              - paragraph [ref=e105]: Base Products
              - paragraph [ref=e106]: "27"
            - generic [ref=e108]:
              - generic [ref=e109]:
                - img [ref=e110]
                - generic [ref=e115]:
                  - img [ref=e116]
                  - generic [ref=e119]: +12%
              - paragraph [ref=e120]: Orders Delivered
              - paragraph [ref=e121]: "0"
          - generic [ref=e122]:
            - generic [ref=e123]:
              - generic [ref=e124]:
                - heading "Revenue Trend" [level=3] [ref=e125]
                - paragraph [ref=e126]: Monthly revenue and order volume
              - img [ref=e130]:
                - generic [ref=e135]:
                  - generic [ref=e137]: Jan
                  - generic [ref=e139]: Feb
                  - generic [ref=e141]: Mar
                  - generic [ref=e143]: Apr
                  - generic [ref=e145]: May
                  - generic [ref=e147]: Jun
                - generic [ref=e149]:
                  - generic [ref=e151]: "0"
                  - generic [ref=e153]: "8500"
                  - generic [ref=e155]: "17000"
                  - generic [ref=e157]: "25500"
                  - generic [ref=e159]: "34000"
            - generic [ref=e169]:
              - generic [ref=e170]:
                - heading "Sales by Region" [level=3] [ref=e171]
                - paragraph [ref=e172]: Global distribution of orders
              - img [ref=e176]:
                - generic [ref=e177]:
                  - img [ref=e179]
                  - img [ref=e181]
                  - img [ref=e183]
                  - img [ref=e185]
                  - generic [ref=e186]:
                    - generic [ref=e188]: North America 45%
                    - generic [ref=e190]: Europe 30%
                    - generic [ref=e192]: Asia 18%
                    - generic [ref=e194]: Others 7%
          - generic [ref=e195]:
            - generic [ref=e196]:
              - heading "Top Performing Products" [level=3] [ref=e197]
              - paragraph [ref=e198]: Best sellers this month
            - table [ref=e201]:
              - rowgroup [ref=e202]:
                - row "Product Sales Revenue Store Actions" [ref=e203]:
                  - columnheader "Product" [ref=e204]
                  - columnheader "Sales" [ref=e205]
                  - columnheader "Revenue" [ref=e206]
                  - columnheader "Store" [ref=e207]
                  - columnheader "Actions" [ref=e208]
              - rowgroup
  - generic [ref=e209]: "0"
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
> 8  |     await expect(page.getByText(/admin dashboard/i)).toBeVisible();
     |                                                      ^ Error: expect(locator).toBeVisible() failed
  9  |   });
  10 | 
  11 |   test('tenant management works', async ({ page }) => {
  12 |     await page.goto('/admin/tenants');
  13 |     await expect(page.locator('[data-testid="tenant-table"]')).toBeVisible();
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