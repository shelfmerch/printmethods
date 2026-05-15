import { test, expect } from '@playwright/test';

// Section 9: Brand Team page

test.describe('Brand Team', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/brand/team');
    await page.waitForLoadState('networkidle');
  });

  test('page heading is Brand Team', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Brand Team');
  });

  test('shows Invite Member button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Invite Member/i })).toBeVisible();
  });

  test('shows refresh button', async ({ page }) => {
    // Refresh icon button — no text label
    await expect(
      page.locator('button').filter({ has: page.locator('svg') }).nth(0)
    ).toBeVisible();
  });

  test('Invite Member dialog opens with correct content', async ({ page }) => {
    await page.getByRole('button', { name: /Invite Member/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Invite Team Member')).toBeVisible();
    await expect(page.locator('input[placeholder="colleague@company.com"]')).toBeVisible();
    // Four role cards
    await expect(page.getByText('Brand Admin')).toBeVisible();
    await expect(page.getByText('HR Manager')).toBeVisible();
    await expect(page.getByText('Finance')).toBeVisible();
    await expect(page.getByText('Marketing')).toBeVisible();
    // Send Invite button
    await expect(page.getByRole('button', { name: /Send Invite/i })).toBeVisible();
  });

  test('Invite Member dialog can be closed without submitting', async ({ page }) => {
    await page.getByRole('button', { name: /Invite Member/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    // Close with Escape or the × button
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('shows member list with role badges when members exist', async ({ page }) => {
    const memberRow = page.locator('[class*="divide"] > div').first();
    const hasMembers = await memberRow.isVisible().catch(() => false);
    if (!hasMembers) {
      test.skip();
      return;
    }
    // Each member row has a role badge and invite status badge
    await expect(memberRow.locator('span, [class*="badge"]').first()).toBeVisible();
  });
});
