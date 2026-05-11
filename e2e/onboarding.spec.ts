import { test, expect } from '@playwright/test';

test.describe('Merchant Onboarding', () => {

  test('merchant onboarding completes successfully', async ({ page }) => {
    await page.goto('/onboarding');

    await page.fill('[name="storeName"]', 'ShelfMerch Store');
    await page.fill('[name="brandName"]', 'SM Brand');

    await page.selectOption('[name="industry"]', 'fashion');

    await page.click('button:has-text("Continue")');

    await page.fill('[name="subdomain"]', 'shelfmerch-demo');

    await page.click('button:has-text("Finish")');

    await expect(page).toHaveURL(/dashboard/);
  });
});
