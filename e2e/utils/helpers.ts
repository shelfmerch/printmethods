import { Page, expect, request } from '@playwright/test';

const BACKEND_URL = 'http://localhost:5000';

export async function loginWithToken(page: Page, email: string) {
  const apiContext = await request.newContext();
  const response = await apiContext.post(`${BACKEND_URL}/api/auth/test-login`, {
    data: { email }
  });

  if (!response.ok()) {
    throw new Error(`loginWithToken failed for ${email}: ${response.status()}`);
  }

  const { token, refreshToken } = await response.json();
  await apiContext.dispose();

  await page.goto('http://localhost:5173');
  await page.evaluate(
    ({ t, rt }) => {
      localStorage.setItem('token', t);
      localStorage.setItem('refreshToken', rt);
    },
    { t: token, rt: refreshToken }
  );
}

export async function uploadDesign(page: Page, filePath: string) {
  await page.setInputFiles('[data-testid="upload-design"]', filePath);
}

export async function waitForToast(page: Page, text: string) {
  await expect(page.getByText(text)).toBeVisible();
}

export async function addProductToCart(page: Page) {
  await page.click('[data-testid="add-to-cart"]');
}

export async function generateMockup(page: Page) {
  await page.click('[data-testid="generate-mockup"]');
  await expect(page.locator('[data-testid="mockup-result"]')).toBeVisible();
}
