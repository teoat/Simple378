import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Case Management E2E', () => {
  test('should complete full case lifecycle', async ({ page, context }) => {
    // 1. Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL(`${BASE_URL}/dashboard`);
    expect(page.url()).toContain('/dashboard');

    // 2. Navigate to cases
    await page.click('a:has-text("Cases")');
    await page.waitForURL(`${BASE_URL}/cases`);

    // 3. Create new case
    await page.click('button:has-text("New Case")');
    await page.waitForURL(`${BASE_URL}/cases/new`);

    await page.fill('input[placeholder="Case Number"]', 'CASE-E2E-001');
    await page.fill('input[placeholder="Title"]', 'E2E Test Case');
    await page.fill('textarea[placeholder="Description"]', 'Created via E2E test');

    // Select priority
    await page.click('select[name="priority"]');
    await page.click('option:has-text("High")');

    // Submit form
    await page.click('button:has-text("Create Case")');

    // Wait for case to be created and redirect
    await page.waitForURL(/\/cases\/[a-f0-9-]+/);
    const caseUrl = page.url();
    expect(caseUrl).toMatch(/\/cases\/[a-f0-9-]+/);

    // 4. Verify case details
    expect(await page.textContent('h1')).toContain('CASE-E2E-001');
    expect(await page.textContent('body')).toContain('E2E Test Case');

    // 5. Edit case
    await page.click('button:has-text("Edit")');
    await page.fill('input[value="E2E Test Case"]', 'E2E Test Case - Updated');

    // Update status
    await page.click('select[name="status"]');
    await page.click('option:has-text("In Progress")');

    await page.click('button:has-text("Save")');

    // Wait for update confirmation
    await expect(page.locator('text=Case updated successfully')).toBeVisible();

    // 6. Return to cases list
    await page.click('a:has-text("Cases")');
    await page.waitForURL(`${BASE_URL}/cases`);

    // 7. Verify case appears in list
    await expect(page.locator('text=CASE-E2E-001')).toBeVisible();
  });

  test('should filter and search cases', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');

    // Navigate to cases
    await page.waitForURL(`${BASE_URL}/dashboard`);
    await page.click('a:has-text("Cases")');
    await page.waitForURL(`${BASE_URL}/cases`);

    // Search for case
    await page.fill('input[placeholder="Search cases..."]', 'CASE-E2E-001');
    await page.waitForTimeout(500); // Wait for search results

    // Verify search results
    expect(await page.textContent('.case-list')).toContain('CASE-E2E-001');

    // Filter by status
    await page.click('select[name="status"]');
    await page.click('option:has-text("In Progress")');
    await page.waitForTimeout(500);

    // Verify filtered results
    const cases = await page.locator('.case-item').count();
    expect(cases).toBeGreaterThan(0);
  });

  test('should handle offline mode', async ({ page, context }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Go to cases page (to cache data)
    await page.click('a:has-text("Cases")');
    await page.waitForURL(`${BASE_URL}/cases`);

    // Enable offline mode
    await context.setOffline(true);

    // Wait a moment for offline detection
    await page.waitForTimeout(1000);

    // Verify offline indicator visible
    expect(await page.textContent('body')).toContain('Offline');

    // Try to create a case (should queue)
    await page.click('button:has-text("New Case")');
    await page.waitForURL(`${BASE_URL}/cases/new`);

    await page.fill('input[placeholder="Case Number"]', 'CASE-OFFLINE-001');
    await page.fill('input[placeholder="Title"]', 'Offline Case');

    await page.click('button:has-text("Create Case")');

    // Verify offline message
    expect(await page.textContent('body')).toContain('saved offline');

    // Go back online
    await context.setOffline(false);

    // Wait for sync indicator or confirmation
    await page.waitForTimeout(2000);

    // Verify sync completed or queued
    const statusText = await page.textContent('body');
    expect(statusText).toMatch(/synced|queued/i);
  });

  test('should display real-time metrics on dashboard', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Verify KPI cards are visible
    await expect(page.locator('.kpi-card')).first().toBeVisible();

    // Verify metrics are populated
    const kpiText = await page.textContent('.kpi-card');
    expect(kpiText).toMatch(/\d+/); // Should contain numbers

    // Verify charts are rendered
    await expect(page.locator('canvas[role="img"]')).toBeVisible();
  });

  test('should handle pagination correctly', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');

    // Navigate to cases
    await page.waitForURL(`${BASE_URL}/dashboard`);
    await page.click('a:has-text("Cases")');
    await page.waitForURL(`${BASE_URL}/cases`);

    // Check for pagination controls
    const pagination = page.locator('.pagination');
    const isVisible = await pagination.isVisible().catch(() => false);

    if (isVisible) {
      // Click next page
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(500);

      // Verify URL changed
      expect(page.url()).toContain('page=2');

      // Click previous page
      await page.click('button:has-text("Previous")');
      await page.waitForTimeout(500);

      expect(page.url()).toContain('page=1');
    }
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Go to non-existent case
    await page.goto(`${BASE_URL}/cases/invalid-id`);

    // Verify error message
    expect(await page.textContent('body')).toContain('not found');

    // Verify navigation back works
    await page.click('a:has-text("Back to Cases")');
    await page.waitForURL(`${BASE_URL}/cases`);
  });

  test('should support bulk operations', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');

    // Navigate to cases
    await page.waitForURL(`${BASE_URL}/dashboard`);
    await page.click('a:has-text("Cases")');
    await page.waitForURL(`${BASE_URL}/cases`);

    // Select multiple cases
    await page.click('input[type="checkbox"].select-all');

    // Verify bulk action menu appeared
    expect(await page.textContent('.bulk-actions')).toBeTruthy();

    // Select bulk action
    await page.click('button:has-text("Change Status")');

    // Select new status
    await page.click('option:has-text("Closed")');

    // Confirm action
    await page.click('button:has-text("Apply")');

    // Wait for completion
    await expect(page.locator('text=Applied to')).toBeVisible();
  });
});
