// import { chromium, request as playwrightRequest } from '@playwright/test';
// import path from 'path';
// import { users } from './fixtures/test-data';

// const BACKEND_URL = 'http://localhost:5002';
// const FRONTEND_URL = 'http://localhost:8080';
// const AUTH_DIR = path.join(__dirname, '.auth');

// async function getTestToken(email: string, role?: string): Promise<{ token: string; refreshToken: string }> {
//   const apiContext = await playwrightRequest.newContext();
//   const response = await apiContext.post(`${BACKEND_URL}/api/auth/test-login`, {
//     data: { email, ...(role && { role }) }
//   });

//   if (!response.ok()) {
//     const body = await response.text();
//     await apiContext.dispose();
//     throw new Error(`Test login failed for ${email} (${response.status()}): ${body}`);
//   }

//   const data = await response.json();
//   await apiContext.dispose();
//   return { token: data.token, refreshToken: data.refreshToken };
// }

// async function saveSession(token: string, refreshToken: string, savePath: string) {
//   const browser = await chromium.launch();
//   const context = await browser.newContext();
//   const page = await context.newPage();

//   // Land on the origin so localStorage is scoped to the right domain
//   await page.goto(FRONTEND_URL);

//   await page.evaluate(
//     ({ t, rt }) => {
//       localStorage.setItem('token', t);
//       localStorage.setItem('refreshToken', rt);
//     },
//     { t: token, rt: refreshToken }
//   );

//   await page.goto(`${FRONTEND_URL}/dashboard`);
//   await page.waitForURL(/dashboard/, { timeout: 15000 });

//   await context.storageState({ path: savePath });
//   await browser.close();
// }

// async function globalSetup() {
//   const merchant = await getTestToken(users.merchant.email);
//   await saveSession(merchant.token, merchant.refreshToken, path.join(AUTH_DIR, 'user.json'));

//   const admin = await getTestToken(users.admin.email, 'superadmin');
//   await saveSession(admin.token, admin.refreshToken, path.join(AUTH_DIR, 'admin.json'));
// }

// export default globalSetup;

import { chromium } from '@playwright/test';

async function globalSetup() {
  console.log('🔐 Setting up test auth session...');

  // Call test bypass route on backend
  const response = await fetch('http://localhost:5002/api/auth/test-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'koneti.sindhus@gmail.com' })
  });

  if (!response.ok) {
    throw new Error(`Test login failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();

  if (!data.token) {
    throw new Error('No token returned from test-login route');
  }

  console.log('✅ Got token from backend');

  // Open browser and inject token into localStorage
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');

  // Inject both tokens exactly as AuthContext expects
  await page.evaluate(({ token, refreshToken }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  }, { token: data.token, refreshToken: data.refreshToken || data.token });

  // Navigate to dashboard and wait for auth check to complete
  await page.goto('http://localhost:8080/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Save the full browser session
  await context.storageState({ path: 'e2e/.auth/user.json' });
  await browser.close();

  console.log('✅ Auth session saved to e2e/.auth/user.json');
}

export default globalSetup;