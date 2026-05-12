import { test, expect } from '@playwright/test';

// Section 3: Merchant Dashboard

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('sidebar shows core navigation items', async ({ page }) => {
    const sidebar = page.locator('aside, nav').first();
    await expect(sidebar.getByRole('link', { name: /^Dashboard$/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /^Products$/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /Store Setup/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /^Orders$/i })).toBeVisible();
  });

  test('sidebar shows BRAND section with all items', async ({ page }) => {
    const sidebar = page.locator('aside, nav').first();
    await expect(sidebar.getByText('BRAND')).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /Employees/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /Credits/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /^Team$/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /Kits & Items/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /Draft Orders/i })).toBeVisible();
  });

  test('sidebar shows FINANCE section with all items', async ({ page }) => {
    const sidebar = page.locator('aside, nav').first();
    await expect(sidebar.getByText('FINANCE')).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /Company Wallet/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /Billing/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /Invoices/i })).toBeVisible();
  });

  test('sidebar shows OTHER section with all items', async ({ page }) => {
    const sidebar = page.locator('aside, nav').first();
    await expect(sidebar.getByText('OTHER')).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /Analytics/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /Settings/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /Support/i })).toBeVisible();
  });

  test('main content shows store name heading', async ({ page }) => {
    // Heading is the store name or fallback "Your swag store"
    await expect(page.locator('h1')).toBeVisible();
    const headingText = await page.locator('h1').textContent();
    expect(headingText?.trim().length).toBeGreaterThan(0);
  });

  test('main content shows Design product and Create kit buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Design product/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Create kit/i })).toBeVisible();
  });

  test('shows Plan stat card', async ({ page }) => {
    await expect(page.getByText('Plan').first()).toBeVisible();
  });

  test('shows Company wallet stat card with Top up button', async ({ page }) => {
    await expect(page.getByText('Company wallet').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Top up/i })).toBeVisible();
  });

  test('shows Team and employees stat card', async ({ page }) => {
    await expect(page.getByText(/Team and employees/i).first()).toBeVisible();
  });

  test('shows Getting started card with 5 onboarding steps', async ({ page }) => {
    await expect(page.getByText('Getting started')).toBeVisible();
    await expect(page.getByText('Create swag store')).toBeVisible();
    await expect(page.getByText('Design first product')).toBeVisible();
    await expect(page.getByText('Add team members')).toBeVisible();
    await expect(page.getByText('Top up wallet')).toBeVisible();
    await expect(page.getByText('Create first kit')).toBeVisible();
  });

  test('shows Product health card with Total, Live, Draft counts', async ({ page }) => {
    await expect(page.getByText('Product health')).toBeVisible();
    await expect(page.getByText('Total').first()).toBeVisible();
    await expect(page.getByText('Live').first()).toBeVisible();
    await expect(page.getByText('Draft').first()).toBeVisible();
  });

  test('shows Production card with pipeline stages and Orders button', async ({ page }) => {
    await expect(page.getByText('Production')).toBeVisible();
    await expect(page.getByText('In production')).toBeVisible();
    await expect(page.getByText('Printing')).toBeVisible();
    await expect(page.getByText('Packaging')).toBeVisible();
    await expect(page.getByText('Shipped')).toBeVisible();
    await expect(page.getByRole('button', { name: /^Orders$/i })).toBeVisible();
  });
});
