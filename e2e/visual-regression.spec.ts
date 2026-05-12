import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {

  test('homepage visual snapshot', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveScreenshot('homepage.png');
  });

  test('editor snapshot', async ({ page }) => {
    await page.goto('/editor');

    await expect(page).toHaveScreenshot('editor.png');
  });
});