import { test, expect } from '@playwright/test';

// Section 5: Store Setup page
// Section 6: Create Swag Store form

test.describe('Store Setup (Section 5)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/stores');
    await page.waitForLoadState('networkidle');
  });

  test('shows ShelfMerch hosted swag store card', async ({ page }) => {
    await expect(page.getByText('ShelfMerch hosted swag store')).toBeVisible();
  });

  test('hosted store card shows Active badge or Create swag store button', async ({ page }) => {
    const isActive = await page.getByText('Active').isVisible().catch(() => false);
    if (isActive) {
      // Active store: Visit store, Customize, Add products
      await expect(page.getByRole('button', { name: /Visit store/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Customize/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Add products/i })).toBeVisible();
    } else {
      await expect(page.getByRole('button', { name: /Create swag store/i })).toBeVisible();
    }
  });

  test('shows Shopify store card with Connect Shopify button', async ({ page }) => {
    await expect(page.getByText('Shopify store')).toBeVisible();
    await expect(page.getByRole('button', { name: /Connect Shopify/i })).toBeVisible();
  });

  test('shows API docs card with Developer settings and View API docs buttons', async ({ page }) => {
    await expect(page.getByText('API docs')).toBeVisible();
    await expect(page.getByRole('button', { name: /Developer settings/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /View API docs/i })).toBeVisible();
  });
});

test.describe('Create Swag Store form (Section 6)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/create-store');
    await page.waitForLoadState('networkidle');
  });

  test('shows Company name input', async ({ page }) => {
    await expect(
      page.locator('input').filter({ has: page.locator('[id*="company"], [name*="company"]') })
        .or(page.getByLabel(/company name/i))
        .or(page.getByPlaceholder(/company/i))
        .first()
    ).toBeVisible();
  });

  test('shows Country dropdown with expected options', async ({ page }) => {
    // Find any select or combobox for Country
    const countryTrigger = page.getByRole('combobox').filter({ hasText: /India/i })
      .or(page.getByRole('combobox').filter({ hasText: /Country/i }))
      .first();
    await countryTrigger.click();
    for (const country of ['India', 'United States', 'United Kingdom', 'Canada', 'Australia']) {
      await expect(page.getByRole('option', { name: new RegExp(country, 'i') })).toBeVisible();
    }
    await page.keyboard.press('Escape');
  });

  test('shows Headcount selector with expected options', async ({ page }) => {
    const headcountTrigger = page.getByRole('combobox').filter({ hasText: /1-50|Headcount/i }).first();
    await headcountTrigger.click();
    for (const hc of ['1-50', '51-200', '201-500', '500+']) {
      await expect(page.getByRole('option', { name: hc })).toBeVisible();
    }
    await page.keyboard.press('Escape');
  });

  test('shows Industry dropdown with expected options', async ({ page }) => {
    const industryTrigger = page.getByRole('combobox').filter({ hasText: /Technology|Industry/i }).first();
    await industryTrigger.click();
    for (const industry of ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education']) {
      await expect(page.getByRole('option', { name: new RegExp(industry, 'i') })).toBeVisible();
    }
    await page.keyboard.press('Escape');
  });

  test('has a submit button to create the store', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /Create|Submit|Continue/i }).first()
    ).toBeVisible();
  });
});
