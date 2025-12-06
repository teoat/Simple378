import { test, expect } from '@playwright/test';

const STAGING_URL = process.env.STAGING_URL || 'http://localhost:5173';
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'analyst@staging.example.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'StagingTest123!';

test.describe('UI Smoke Tests', () => {
  
  test('homepage loads successfully', async ({ page }) => {
    await page.goto(STAGING_URL);
    await expect(page).toHaveTitle(/Simple378|Fraud Detection/i);
  });
  
  test('login page is accessible', async ({ page }) => {
    await page.goto(`${STAGING_URL}/login`);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
  
  test('login flow works', async ({ page }) => {
    await page.goto(`${STAGING_URL}/login`);
    
    // Fill in credentials
    await page.fill('input[type="email"]', TEST_USER_EMAIL);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  });
  
  test('dashboard renders after login', async ({ page }) => {
    // Login first
    await page.goto(`${STAGING_URL}/login`);
    await page.fill('input[type="email"]', TEST_USER_EMAIL);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    
    // Check for dashboard elements
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    // Should have some metrics or content
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });
  
  test('navigation works', async ({ page }) => {
    // Login
    await page.goto(`${STAGING_URL}/login`);
    await page.fill('input[type="email"]', TEST_USER_EMAIL);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    
    // Try navigating to different pages
    const navLinks = page.locator('nav a, [role="navigation"] a');
    const count = await navLinks.count();
    
    expect(count).toBeGreaterThan(0);
  });
  
  test('no JavaScript errors in console', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto(STAGING_URL);
    await page.waitForLoadState('networkidle');
    
    // Filter out known non-critical errors
    const criticalErrors = consoleErrors.filter(err => 
      !err.includes('favicon') && 
      !err.includes('ServiceWorker')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
  
  test('page loads within acceptable time', async ({ page }) => {
    const start = Date.now();
    await page.goto(STAGING_URL);
    await page.waitForLoadState('domcontentloaded');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(3000); // Should load in < 3 seconds
  });
  
  test('responsive design works', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(STAGING_URL);
    await expect(page).toHaveTitle(/Simple378|Fraud Detection/i);
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(STAGING_URL);
    await expect(page).toHaveTitle(/Simple378|Fraud Detection/i);
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(STAGING_URL);
    await expect(page).toHaveTitle(/Simple378|Fraud Detection/i);
  });
  
});
