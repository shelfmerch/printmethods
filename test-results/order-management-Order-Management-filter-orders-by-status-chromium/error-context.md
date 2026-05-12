# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: order-management.spec.ts >> Order Management >> filter orders by status
- Location: e2e\order-management.spec.ts:11:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.selectOption: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('[data-testid="status-filter"]')

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
        - generic [ref=e44]:
          - heading "Orders" [level=1] [ref=e45]
          - paragraph [ref=e46]: Track order progress, shipment readiness, and missing tracking details in one place.
        - generic [ref=e47]:
          - generic [ref=e48]:
            - img [ref=e49]
            - textbox "Search by email, product, or order ID" [ref=e52]
          - generic [ref=e53]:
            - combobox [ref=e54] [cursor=pointer]:
              - generic: All Status
              - img [ref=e55]
            - combobox [ref=e57] [cursor=pointer]:
              - generic: All Channels
              - img [ref=e58]
            - combobox [ref=e60] [cursor=pointer]:
              - generic: All Tracking States
              - img [ref=e61]
            - combobox [ref=e63] [cursor=pointer]:
              - generic: All Months
              - img [ref=e64]
        - table [ref=e68]:
          - rowgroup [ref=e69]:
            - row "Order Channel Customer Status Tracking Amount Action" [ref=e70]:
              - columnheader "Order" [ref=e71]
              - columnheader "Channel" [ref=e72]
              - columnheader "Customer" [ref=e73]
              - columnheader "Status" [ref=e74]
              - columnheader "Tracking" [ref=e75]
              - columnheader "Amount" [ref=e76]
              - columnheader "Action" [ref=e77]
          - rowgroup [ref=e78]:
            - row "#E30816E9 Customized Optiknit Polo 8/5/2026 Storefront koneti.sindhus5@gmail.com Paid Missing Tracking ₹2957.46 View" [ref=e79]:
              - cell "#E30816E9 Customized Optiknit Polo 8/5/2026" [ref=e80]:
                - generic [ref=e81]:
                  - paragraph [ref=e82]: "#E30816E9"
                  - paragraph [ref=e83]: Customized Optiknit Polo
                  - paragraph [ref=e84]: 8/5/2026
              - cell "Storefront" [ref=e85]:
                - generic [ref=e86]: Storefront
              - cell "koneti.sindhus5@gmail.com" [ref=e87]
              - cell "Paid" [ref=e88]:
                - generic [ref=e89]: Paid
              - cell "Missing Tracking" [ref=e90]:
                - generic [ref=e91]: Missing Tracking
              - cell "₹2957.46" [ref=e92]
              - cell "View" [ref=e93]:
                - button "View" [ref=e94] [cursor=pointer]:
                  - text: View
                  - img
            - row "#E30814FA Customized Optiknit Polo 8/5/2026 Storefront koneti.sindhus5@gmail.com Paid Missing Tracking ₹1974.40 View" [ref=e95]:
              - cell "#E30814FA Customized Optiknit Polo 8/5/2026" [ref=e96]:
                - generic [ref=e97]:
                  - paragraph [ref=e98]: "#E30814FA"
                  - paragraph [ref=e99]: Customized Optiknit Polo
                  - paragraph [ref=e100]: 8/5/2026
              - cell "Storefront" [ref=e101]:
                - generic [ref=e102]: Storefront
              - cell "koneti.sindhus5@gmail.com" [ref=e103]
              - cell "Paid" [ref=e104]:
                - generic [ref=e105]: Paid
              - cell "Missing Tracking" [ref=e106]:
                - generic [ref=e107]: Missing Tracking
              - cell "₹1974.40" [ref=e108]
              - cell "View" [ref=e109]:
                - button "View" [ref=e110] [cursor=pointer]:
                  - text: View
                  - img
            - row "#E1F31761 Customized Optiknit Polo 8/5/2026 Storefront koneti.sindhus5@gmail.com Paid Missing Tracking ₹988.40 View" [ref=e111]:
              - cell "#E1F31761 Customized Optiknit Polo 8/5/2026" [ref=e112]:
                - generic [ref=e113]:
                  - paragraph [ref=e114]: "#E1F31761"
                  - paragraph [ref=e115]: Customized Optiknit Polo
                  - paragraph [ref=e116]: 8/5/2026
              - cell "Storefront" [ref=e117]:
                - generic [ref=e118]: Storefront
              - cell "koneti.sindhus5@gmail.com" [ref=e119]
              - cell "Paid" [ref=e120]:
                - generic [ref=e121]: Paid
              - cell "Missing Tracking" [ref=e122]:
                - generic [ref=e123]: Missing Tracking
              - cell "₹988.40" [ref=e124]
              - cell "View" [ref=e125]:
                - button "View" [ref=e126] [cursor=pointer]:
                  - text: View
                  - img
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
     |                ^ Error: page.selectOption: Test timeout of 60000ms exceeded.
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