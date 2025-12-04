import { test, expect } from '@playwright/test';

test('login flow', async ({ page }) => {
  await page.goto('/login');

  // Fill in credentials
  await page.fill('input[name="email"]', 'admin@example.com');
  await page.fill('input[name="password"]', 'password');

  // Click login
  await page.click('button[type="submit"]');

  // Expect redirect to dashboard
  await expect(page).toHaveURL('/dashboard');
  
  // Check for dashboard content
  await expect(page.getByText('Dashboard')).toBeVisible();

  // Navigate to Forensics
  await page.click('a[href="/forensics"]');
  await expect(page).toHaveURL('/forensics');
  await expect(page.getByText('Forensic Analysis')).toBeVisible();

  // Note: We can't easily test file upload without a real file, but we can check if the dropzone exists
  await expect(page.getByText('Drag & drop files here')).toBeVisible();

  // Navigate to Adjudication
  await page.click('a[href="/adjudication"]');
  await expect(page).toHaveURL('/adjudication');
  await expect(page.getByText('Adjudication Queue')).toBeVisible();
});
