import { test, expect } from '@playwright/test';

test.describe('AI Design Tools', () => {

  test('AI generates design suggestions', async ({ page }) => {
    await page.goto('/ai-tools');

    await page.fill('[data-testid="prompt-input"]', 'Generate streetwear hoodie');

    await page.click('[data-testid="generate-ai-btn"]');

    await expect(page.locator('[data-testid="ai-result"]')).toBeVisible();
  });

  test('AI background removal works', async ({ page }) => {
    await page.goto('/ai-tools');

    await page.setInputFiles('[data-testid="bg-upload"]', 'e2e/fixtures/mock-files/design.png');

    await page.click('[data-testid="remove-bg"]');

    await expect(page.locator('[data-testid="bg-removed-preview"]')).toBeVisible();
  });
});
