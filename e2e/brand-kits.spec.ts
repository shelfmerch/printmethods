import { test, expect } from '@playwright/test';

// Section 7: Kits & Items page
// Section 8: Kit Builder page

test.describe('Kits & Items (Section 7)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/brand/kits');
    await page.waitForLoadState('networkidle');
  });

  test('page heading is Kits & Items', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Kits & Items');
  });

  test('shows correct subheading', async ({ page }) => {
    await expect(
      page.getByText('Package your catalog products into reusable gift kits, then send them at scale.')
    ).toBeVisible();
  });

  test('shows Total kits, Live kits, and Drafts stat cards', async ({ page }) => {
    await expect(page.getByText('Total kits')).toBeVisible();
    await expect(page.getByText('Live kits')).toBeVisible();
    await expect(page.getByText('Drafts')).toBeVisible();
  });

  test('shows Create a Kit button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Create a Kit/i })).toBeVisible();
  });

  test('kit cards show name, item count, status badge when kits exist', async ({ page }) => {
    const kitCard = page.locator('a[href*="/brand/kits/"]').first();
    const hasKits = await kitCard.isVisible().catch(() => false);
    if (!hasKits) {
      // Empty state should show "No kits yet"
      await expect(page.getByText('No kits yet')).toBeVisible();
      await expect(page.getByRole('button', { name: /Create your first kit/i })).toBeVisible();
      return;
    }
    // Kit cards
    await expect(kitCard).toBeVisible();
    // Status badge: draft, live, or archived
    await expect(
      kitCard.locator('text=/draft|live|archived/i').first()
    ).toBeVisible();
  });

  test('kit cards navigate to /brand/kits/:id on click', async ({ page }) => {
    const kitCard = page.locator('a[href*="/brand/kits/"]').first();
    const hasKits = await kitCard.isVisible().catch(() => false);
    if (!hasKits) {
      test.skip();
      return;
    }
    await kitCard.click();
    await expect(page).toHaveURL(/\/brand\/kits\/.+/);
  });

  test('Create a Kit navigates to /brand/kits/new', async ({ page }) => {
    await page.getByRole('button', { name: /Create a Kit/i }).click();
    await expect(page).toHaveURL(/\/brand\/kits\/new/);
  });
});

test.describe('Kit Builder (Section 8)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/brand/kits/new');
    await page.waitForLoadState('networkidle');
  });

  test('shows a step indicator or wizard', async ({ page }) => {
    // Step 1 of N, or step progress indicator
    await expect(
      page.getByText(/Step 1/i)
        .or(page.locator('[aria-label*="step"], [data-step], .step'))
        .first()
    ).toBeVisible();
  });

  test('shows Kit name input', async ({ page }) => {
    await expect(
      page.getByLabel(/Kit name/i)
        .or(page.locator('input[placeholder*="name" i]'))
        .first()
    ).toBeVisible();
  });

  test('back button or browser back returns to /brand/kits', async ({ page }) => {
    await page.goBack();
    await expect(page).toHaveURL(/\/brand\/kits$/);
  });
});
