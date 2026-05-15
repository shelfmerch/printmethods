# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api-validation.spec.ts >> API Validation >> orders API returns valid schema
- Location: e2e\api-validation.spec.ts:11:3

# Error details

```
SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('API Validation', () => {
  4  | 
  5  |   test('products API returns 200', async ({ request }) => {
  6  |     const response = await request.get('/api/products');
  7  | 
  8  |     expect(response.status()).toBe(200);
  9  |   });
  10 | 
  11 |   test('orders API returns valid schema', async ({ request }) => {
  12 |     const response = await request.get('/api/orders');
  13 | 
> 14 |     const body = await response.json();
     |                  ^ SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON
  15 | 
  16 |     expect(Array.isArray(body.orders)).toBeTruthy();
  17 |   });
  18 | 
  19 |   test('auth API blocks unauthorized users', async ({ request }) => {
  20 |     const response = await request.get('/api/admin');
  21 | 
  22 |     expect(response.status()).toBe(401);
  23 |   });
  24 | });
  25 | 
```