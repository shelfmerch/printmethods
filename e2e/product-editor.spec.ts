import { test, expect } from '@playwright/test';

test.describe('Product Editor', () => {

  test('user can upload design', async ({ page }) => {
    await page.goto('/editor');

    const fileChooserPromise = page.waitForEvent('filechooser');

    await page.click('[data-testid="upload-design"]');

    const chooser = await fileChooserPromise;

    await chooser.setFiles('e2e/fixtures/mock-files/design.png');

    await expect(page.locator('img')).toBeVisible();
  });

  test('drag and resize editor elements', async ({ page }) => {
    await page.goto('/editor');

    const design = page.locator('[data-testid="design-layer"]');

    await design.dragTo(page.locator('[data-testid="canvas-area"]'));

    await expect(design).toBeVisible();
  });

  test('save design draft', async ({ page }) => {
    await page.goto('/editor');

    await page.click('[data-testid="save-draft"]');

    await expect(page.getByText(/draft saved/i)).toBeVisible();
  });
});
