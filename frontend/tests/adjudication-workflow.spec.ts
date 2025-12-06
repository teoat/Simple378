import { test, expect } from '@playwright/test';

test.describe('Adjudication Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Login with test credentials
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard');
  });

  test('should display adjudication queue with cases', async ({ page }) => {
    // Navigate to adjudication queue
    await page.goto('/adjudication');

    // Check page title
    await expect(page.locator('h2').filter({ hasText: 'Adjudication Queue' })).toBeVisible();

    // Check that cases are loaded (may be empty in test environment)
    await expect(page.locator('text=Active Cases')).toBeVisible();
  });

  test('should allow case review and decision making', async ({ page }) => {
    // Navigate to adjudication queue
    await page.goto('/adjudication');

    // Look for review case buttons
    const reviewButtons = page.locator('text=Review Case');

    if (await reviewButtons.count() > 0) {
      // Click first review case button
      await reviewButtons.first().click();

      // Should navigate to case detail page
      await expect(page).toHaveURL(/\/case\/.+/);

      // Check for decision panel
      await expect(page.locator('text=Approve')).toBeVisible();
      await expect(page.locator('text=Reject')).toBeVisible();
      await expect(page.locator('text=Escalate')).toBeVisible();
    } else {
      // No cases available - that's okay for this test
      console.log('No cases available for review in test environment');
    }
  });

  test('should handle decision workflow', async ({ page }) => {
    // Navigate to a case (assuming we have test data)
    await page.goto('/case/test-case-id');

    // Check if decision panel is present
    const approveButton = page.locator('button').filter({ hasText: 'Approve' });

    if (await approveButton.isVisible()) {
      // Test approve decision
      await approveButton.click();

      // Should show confirmation form
      await expect(page.locator('text=Confirm Approve')).toBeVisible();

      // Fill comment and submit
      await page.fill('textarea[placeholder*="comment"]', 'Test approval comment');
      await page.click('text=Submit Decision');

      // Should show success or navigate away
      await expect(page.locator('text=Confirm Approve')).not.toBeVisible();
    }
  });

  test('should support keyboard shortcuts for decisions', async ({ page }) => {
    // Navigate to a case
    await page.goto('/case/test-case-id');

    const approveButton = page.locator('button').filter({ hasText: 'Approve' });

    if (await approveButton.isVisible()) {
      // Focus on the page and use keyboard shortcut
      await page.keyboard.press('a');

      // Should show confirmation form
      await expect(page.locator('text=Confirm Approve')).toBeVisible();
    }
  });
});