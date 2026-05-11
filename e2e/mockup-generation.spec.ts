import { test, expect } from '@playwright/test';

test.describe('Mockup Generation', () => {

  test('generate realistic mockups', async ({ page }) => {
    await page.goto('/mockups');

    await page.click('[data-testid="generate-mockup"]');

    await expect(page.locator('[data-testid="mockup-result"]')).toBeVisible();
  });

  test('switch mockup variants', async ({ page }) => {
    await page.goto('/mockups');

    await page.click('[data-testid="variant-black"]');

    await expect(page.locator('[data-testid="mockup-preview"]')).toBeVisible();
  });

  test('download generated mockup', async ({ page }) => {
    await page.goto('/mockups');

    const downloadPromise = page.waitForEvent('download');

    await page.click('[data-testid="download-mockup"]');

    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('.png');
  });
});
