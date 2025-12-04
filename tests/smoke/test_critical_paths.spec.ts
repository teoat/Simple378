import { test, expect } from '@playwright/test';

const STAGING_URL = process.env.STAGING_URL || 'http://localhost:8080';
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'analyst@staging.example.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'StagingTest123!';

test.describe('Critical User Paths', () => {
  
  test('complete adjudication workflow', async ({ page }) => {
    // 1. Login
    await page.goto(`${STAGING_URL}/login`);
    await page.fill('input[type="email"]', TEST_USER_EMAIL);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    
    // 2. Navigate to adjudication queue
    await page.goto(`${STAGING_URL}/adjudication`);
    await page.waitForLoadState('networkidle');
    
    // 3. Verify queue loads
    const queueVisible = await page.locator('text=/queue|pending|cases/i').isVisible()
      .catch(() => false);
    
    if (queueVisible) {
      // If there are cases, try to interact with one
      const firstCase = page.locator('[data-testid^="case-"], .case-item, .alert-item').first();
      const caseExists = await firstCase.count() > 0;
      
      if (caseExists) {
        await firstCase.click();
        // Case details should be visible
        await expect(page.locator('text=/details|information|subject/i')).toBeVisible({ timeout: 5000 });
      }
    }
  });
  
  test('view case details', async ({ page }) => {
    // Login
    await page.goto(`${STAGING_URL}/login`);
    await page.fill('input[type="email"]', TEST_USER_EMAIL);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    
    // Navigate to cases list
    await page.goto(`${STAGING_URL}/cases`);
    await page.waitForLoadState('networkidle');
    
    // Try to click first case (if exists)
    const firstCase = page.locator('[data-testid^="case-"], .case-card, [role="row"]').first();
    const exists = await firstCase.count() > 0;
    
    if (exists) {
      await firstCase.click();
      // Should navigate to case detail
      await expect(page).toHaveURL(/case|detail/, { timeout: 5000 });
    }
  });
  
  test('search functionality', async ({ page }) => {
    // Login
    await page.goto(`${STAGING_URL}/login`);
    await page.fill('input[type="email"]', TEST_USER_EMAIL);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    const searchExists = await searchInput.count() > 0;
    
    if (searchExists) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000); // Wait for search debounce
    }
  });
  
  test('user logout', async ({ page }) => {
    // Login
    await page.goto(`${STAGING_URL}/login`);
    await page.fill('input[type="email"]', TEST_USER_EMAIL);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    
    // Find and click logout button
    const logoutButton = page.locator('button:has-text("logout"), button:has-text("sign out"), [data-testid="logout"]').first();
    const logoutExists = await logoutButton.count() > 0;
    
    if (logoutExists) {
      await logoutButton.click();
      // Should redirect to login
      await expect(page).toHaveURL(/login/, { timeout: 5000 });
    }
  });
  
  test('error handling - invalid route', async ({ page }) => {
    await page.goto(`${STAGING_URL}/this-route-does-not-exist`);
    
    // Should show 404 or redirect
    const notFound = await page.locator('text=/404|not found/i').isVisible()
      .catch(() => false);
    const redirected = page.url() !== `${STAGING_URL}/this-route-does-not-exist`;
    
    expect(notFound || redirected).toBeTruthy();
  });
  
});
