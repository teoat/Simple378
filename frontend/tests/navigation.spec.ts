import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('can navigate through main pages after login', async ({ page }) => {
    await page.goto('/login');

    // Login
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard');

    // Navigate to Cases
    await page.click('a[href="/cases"]');
    await expect(page).toHaveURL('/cases');
    await expect(page.getByText('Cases')).toBeVisible();

    // Navigate to Adjudication Queue
    await page.click('a[href="/adjudication"]');
    await expect(page).toHaveURL('/adjudication');

    // Navigate to Forensics
    await page.click('a[href="/forensics"]');
    await expect(page).toHaveURL('/forensics');

    // Navigate to Settings
    await page.click('a[href="/settings"]');
    await expect(page).toHaveURL('/settings');
  });
});

test.describe('Dashboard', () => {
  test('displays key metrics', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    
    // Check for metric cards
    await expect(page.getByText('Dashboard')).toBeVisible();
  });
});
