# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cart-checkout.spec.ts >> Cart & Checkout >> add product to cart
- Location: e2e\cart-checkout.spec.ts:5:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('[data-testid="product-card"]')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - generic [ref=e4]:
    - banner [ref=e5]:
      - generic [ref=e6]:
        - link "logo" [ref=e7] [cursor=pointer]:
          - /url: /
          - img "logo" [ref=e9]
        - navigation [ref=e10]:
          - link "Platform" [ref=e11] [cursor=pointer]:
            - /url: /platform
            - generic [ref=e12]: Platform
          - link "Products" [ref=e13] [cursor=pointer]:
            - /url: /products
            - generic [ref=e14]: Products
          - button "Solutions" [ref=e16] [cursor=pointer]:
            - generic [ref=e17]: Solutions
            - img [ref=e18]
          - button "About Us" [ref=e21] [cursor=pointer]:
            - generic [ref=e22]: About Us
            - img [ref=e23]
          - button "Support" [ref=e26] [cursor=pointer]:
            - generic [ref=e27]: Support
            - img [ref=e28]
          - link "Pricing" [ref=e30] [cursor=pointer]:
            - /url: /pricing
            - generic [ref=e31]: Pricing
        - button "Sindhu" [ref=e34] [cursor=pointer]:
          - img [ref=e35]
          - generic [ref=e38]: Sindhu
          - img [ref=e39]
    - banner [ref=e41]:
      - generic [ref=e43]:
        - img [ref=e44]
        - textbox "Search products, designs, or creators" [ref=e47]
    - main [ref=e48]:
      - generic [ref=e49]:
        - generic [ref=e51]:
          - heading "Shop by Category" [level=2] [ref=e52]
          - paragraph [ref=e53]: Browse our main product categories
        - generic [ref=e54]:
          - button "Scroll left" [ref=e55] [cursor=pointer]:
            - img [ref=e56]
          - generic [ref=e58]:
            - button "Apparel Apparel" [ref=e59] [cursor=pointer]:
              - img "Apparel" [ref=e60]
              - generic [ref=e62]: Apparel
            - button "Accessories Accessories" [ref=e63] [cursor=pointer]:
              - img "Accessories" [ref=e64]
              - generic [ref=e66]: Accessories
            - button "Home & Living Home & Living" [ref=e67] [cursor=pointer]:
              - img "Home & Living" [ref=e68]
              - generic [ref=e70]: Home & Living
            - button "Print Products Print Products" [ref=e71] [cursor=pointer]:
              - img "Print Products" [ref=e72]
              - generic [ref=e74]: Print Products
            - button "Packaging Packaging" [ref=e75] [cursor=pointer]:
              - img "Packaging" [ref=e76]
              - generic [ref=e78]: Packaging
            - button "Tech Tech" [ref=e79] [cursor=pointer]:
              - img "Tech" [ref=e80]
              - generic [ref=e82]: Tech
          - button "Scroll right" [ref=e83] [cursor=pointer]:
            - img [ref=e84]
      - generic [ref=e86]:
        - generic [ref=e88]:
          - heading "Explore ShelfMerch's Best" [level=2] [ref=e89]
          - paragraph [ref=e90]: Here are some of the most popular product categories in our catalog.
        - generic [ref=e91]:
          - link "superdry superdry From ₹799.00 2 sizes · 2 colors" [ref=e92] [cursor=pointer]:
            - /url: /products/6a01a02d7932851871b50f0e
            - img "superdry" [ref=e93]
            - generic [ref=e95]:
              - heading "superdry" [level=3] [ref=e96]
              - paragraph [ref=e97]: From ₹799.00
              - paragraph [ref=e98]: 2 sizes · 2 colors
          - link "testing testing From ₹399.99 5 sizes · 2 colors" [ref=e99] [cursor=pointer]:
            - /url: /products/69e37eed928ae04d8a7f59b9
            - img "testing" [ref=e100]
            - generic [ref=e102]:
              - heading "testing" [level=3] [ref=e103]
              - paragraph [ref=e104]: From ₹399.99
              - paragraph [ref=e105]: 5 sizes · 2 colors
          - link "Customized Optiknit Polo Customized Optiknit Polo From ₹449.00 8 sizes · 6 colors" [ref=e106] [cursor=pointer]:
            - /url: /products/69c4c8632f62270e37e57af4
            - img "Customized Optiknit Polo" [ref=e107]
            - generic [ref=e109]:
              - heading "Customized Optiknit Polo" [level=3] [ref=e110]
              - paragraph [ref=e111]: From ₹449.00
              - paragraph [ref=e112]: 8 sizes · 6 colors
          - link "Customized Mouse Pad Customized Mouse Pad From ₹199.00 1 size · 1 color" [ref=e113] [cursor=pointer]:
            - /url: /products/69c3bafda6a5043fff075e3f
            - img "Customized Mouse Pad" [ref=e114]
            - generic [ref=e116]:
              - heading "Customized Mouse Pad" [level=3] [ref=e117]
              - paragraph [ref=e118]: From ₹199.00
              - paragraph [ref=e119]: 1 size · 1 color
          - link "Customized Chef Coat Customized Chef Coat From ₹1199.00 5 sizes · 2 colors" [ref=e120] [cursor=pointer]:
            - /url: /products/69c38fdcbf392b11d085b259
            - img "Customized Chef Coat" [ref=e121]
            - generic [ref=e123]:
              - heading "Customized Chef Coat" [level=3] [ref=e124]
              - paragraph [ref=e125]: From ₹1199.00
              - paragraph [ref=e126]: 5 sizes · 2 colors
          - link "FrostPuff Beanie Cap FrostPuff Beanie Cap From ₹421.00 1 size · 1 color" [ref=e127] [cursor=pointer]:
            - /url: /products/69c281f19e7dfcb2a6260982
            - img "FrostPuff Beanie Cap" [ref=e128]
            - generic [ref=e130]:
              - heading "FrostPuff Beanie Cap" [level=3] [ref=e131]
              - paragraph [ref=e132]: From ₹421.00
              - paragraph [ref=e133]: 1 size · 1 color
      - generic [ref=e134]:
        - generic [ref=e136]:
          - heading "Hot New Products" [level=2] [ref=e137]
          - paragraph [ref=e138]: Get ahead of the game with our newest offering of products that just hit our catalog.
        - generic [ref=e139]:
          - link "Customized Canvas Customized Canvas From ₹349.00 1 size · 1 color" [ref=e140] [cursor=pointer]:
            - /url: /products/69c264dc9e7dfcb2a626064f
            - img "Customized Canvas" [ref=e141]
            - generic [ref=e143]:
              - heading "Customized Canvas" [level=3] [ref=e144]
              - paragraph [ref=e145]: From ₹349.00
              - paragraph [ref=e146]: 1 size · 1 color
          - link "Premium Shipping Box With Logo Premium Shipping Box With Logo From ₹49.00 1 size · 1 color" [ref=e147] [cursor=pointer]:
            - /url: /products/69c132e69e7dfcb2a625fefc
            - img "Premium Shipping Box With Logo" [ref=e148]
            - generic [ref=e150]:
              - heading "Premium Shipping Box With Logo" [level=3] [ref=e151]
              - paragraph [ref=e152]: From ₹49.00
              - paragraph [ref=e153]: 1 size · 1 color
          - link "Customized Square Tea Coaster Customized Square Tea Coaster From ₹349.00 1 size · 1 color" [ref=e154] [cursor=pointer]:
            - /url: /products/69c112da9e7dfcb2a625fbcf
            - img "Customized Square Tea Coaster" [ref=e155]
            - generic [ref=e157]:
              - heading "Customized Square Tea Coaster" [level=3] [ref=e158]
              - paragraph [ref=e159]: From ₹349.00
              - paragraph [ref=e160]: 1 size · 1 color
          - link "ZenCharge 3-in-1 Wireless Dock ZenCharge 3-in-1 Wireless Dock From ₹1499.00 1 size · 1 color" [ref=e161] [cursor=pointer]:
            - /url: /products/69c1052c9e7dfcb2a625fa1e
            - img "ZenCharge 3-in-1 Wireless Dock" [ref=e162]
            - generic [ref=e164]:
              - heading "ZenCharge 3-in-1 Wireless Dock" [level=3] [ref=e165]
              - paragraph [ref=e166]: From ₹1499.00
              - paragraph [ref=e167]: 1 size · 1 color
          - link "Round bluetooth speaker Round bluetooth speaker From ₹2949.00 1 size · 1 color" [ref=e168] [cursor=pointer]:
            - /url: /products/69c0ee6d9e7dfcb2a625f6b7
            - img "Round bluetooth speaker" [ref=e169]
            - generic [ref=e171]:
              - heading "Round bluetooth speaker" [level=3] [ref=e172]
              - paragraph [ref=e173]: From ₹2949.00
              - paragraph [ref=e174]: 1 size · 1 color
          - link "Customized Stanley Tumbler Customized Stanley Tumbler From ₹899.00 1 size · 4 colors" [ref=e175] [cursor=pointer]:
            - /url: /products/69c0e67f9e7dfcb2a625f469
            - img "Customized Stanley Tumbler" [ref=e176]
            - generic [ref=e178]:
              - heading "Customized Stanley Tumbler" [level=3] [ref=e179]
              - paragraph [ref=e180]: From ₹899.00
              - paragraph [ref=e181]: 1 size · 4 colors
    - contentinfo [ref=e182]:
      - generic [ref=e183]:
        - generic [ref=e184]:
          - generic [ref=e185]:
            - img "logo" [ref=e187]
            - paragraph [ref=e188]: A print-on-demand platform enabling businesses and creators to design, sell, and fulfill custom, sustainable merchandise without inventory.
            - link "Get started" [ref=e189] [cursor=pointer]:
              - /url: /auth
              - button "Get started" [ref=e190]:
                - text: Get started
                - img
          - generic [ref=e191]:
            - heading "Products" [level=4] [ref=e192]
            - list [ref=e193]:
              - listitem [ref=e194]:
                - link "Catalogue" [ref=e195] [cursor=pointer]:
                  - /url: /products
              - listitem [ref=e196]:
                - link "T-shirts" [ref=e197] [cursor=pointer]:
                  - /url: /products/category/t-shirts
              - listitem [ref=e198]: Polos
              - listitem [ref=e199]: Oversized
              - listitem [ref=e200]:
                - link "Hoodies" [ref=e201] [cursor=pointer]:
                  - /url: /products/category/hoodies
              - listitem [ref=e202]:
                - link "Sweatshirts" [ref=e203] [cursor=pointer]:
                  - /url: /products/category/sweatshirts
              - listitem [ref=e204]: Mrchx
              - listitem [ref=e205]: Tees Graphy
          - generic [ref=e206]:
            - heading "Solutions" [level=4] [ref=e207]
            - list [ref=e208]:
              - listitem [ref=e209]:
                - link "Creators & Agencies" [ref=e210] [cursor=pointer]:
                  - /url: /solutions/creators-agencies
              - listitem [ref=e211]:
                - link "Fashion & Apparel" [ref=e212] [cursor=pointer]:
                  - /url: /solutions/fashion-apparel
              - listitem [ref=e213]:
                - link "Entertainment & Media" [ref=e214] [cursor=pointer]:
                  - /url: /solutions/entertainment-media
              - listitem [ref=e215]:
                - link "Home Decor" [ref=e216] [cursor=pointer]:
                  - /url: /solutions/home-decor
              - listitem [ref=e217]:
                - link "Customized Merch" [ref=e218] [cursor=pointer]:
                  - /url: /solutions/customized-merch
              - listitem [ref=e219]:
                - link "Enterprise Merch" [ref=e220] [cursor=pointer]:
                  - /url: /solutions/enterprise-merch
              - listitem [ref=e221]:
                - link "Bulk Orders" [ref=e222] [cursor=pointer]:
                  - /url: /solutions/bulk-orders
          - generic [ref=e223]:
            - heading "About" [level=4] [ref=e224]
            - list [ref=e225]:
              - listitem [ref=e226]:
                - link "Our Story" [ref=e227] [cursor=pointer]:
                  - /url: /about/our-story
              - listitem [ref=e228]:
                - link "Careers" [ref=e229] [cursor=pointer]:
                  - /url: /about/careers
              - listitem [ref=e230]:
                - link "Contact Us" [ref=e231] [cursor=pointer]:
                  - /url: /support/contact-us
        - generic [ref=e232]:
          - heading "Our Partner Certifications" [level=3] [ref=e233]
          - generic [ref=e234]:
            - img "amfori" [ref=e235]
            - img "global" [ref=e236]
            - img "fairwear" [ref=e237]
            - img "sedex" [ref=e238]
            - img "bsci" [ref=e239]
            - img "sustainableapparelcoalition" [ref=e240]
            - img "higgindex" [ref=e241]
            - img "accord" [ref=e242]
            - img "organic" [ref=e243]
        - generic [ref=e245]:
          - paragraph [ref=e246]: 2024 Chitlu Innovations Pvt Ltd. All rights reserved
          - generic [ref=e247]:
            - link "Terms of Service" [ref=e248] [cursor=pointer]:
              - /url: /terms-of-conditions
            - generic [ref=e249]: "|"
            - link "Privacy Policy" [ref=e250] [cursor=pointer]:
              - /url: /privacy-policy
            - generic [ref=e251]: "|"
            - link "Data Deletion Policy" [ref=e252] [cursor=pointer]:
              - /url: /data-deletion-policy
            - generic [ref=e253]: "|"
            - link "Return & Refunds" [ref=e254] [cursor=pointer]:
              - /url: /support/customer-support-policy
          - generic [ref=e255]:
            - link [ref=e256] [cursor=pointer]:
              - /url: https://www.youtube.com/@shelfmerch
              - img [ref=e257]
            - link [ref=e259] [cursor=pointer]:
              - /url: https://www.instagram.com/shelfmerch?igsh=MTBoeno3b3c1NWtwdQ==
              - img [ref=e260]
            - link [ref=e263] [cursor=pointer]:
              - /url: https://www.linkedin.com/company/shelfmerch/
              - img [ref=e264]
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
> 8  |     await page.click('[data-testid="product-card"]');
     |                ^ Error: page.click: Test timeout of 60000ms exceeded.
  9  | 
  10 |     await page.click('[data-testid="add-to-cart"]');
  11 | 
  12 |     await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
  13 |   });
  14 | 
  15 |   test('checkout flow works', async ({ page }) => {
  16 |     await page.goto('/checkout');
  17 | 
  18 |     await page.fill('[name="fullName"]', 'Test User');
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