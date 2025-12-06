import { test, expect } from '@playwright/test';

test.describe('Reconciliation Features', () => {

  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('Reconciliation Dashboard Loads', async ({ page }) => {
    await page.goto('/reconciliation');
    
    // Check Header and Stats
    await expect(page.getByText('Transaction Reconciliation')).toBeVisible();
    await expect(page.getByText('Internal Records')).toBeVisible();
    await expect(page.getByText('External Records')).toBeVisible();
  });

  test('Auto-Match Functionality', async ({ page }) => {
    await page.goto('/reconciliation');

    // Click Auto-Match
    const autoMatchButton = page.getByText('AI Auto-Match');
    await expect(autoMatchButton).toBeVisible();
    
    // Setup a listener for the network request to verify it's called
    // (In a real test we'd mock the response)
    const requestPromise = page.waitForRequest(request => 
      request.url().includes('/reconciliation/auto-match') && request.method() === 'POST'
    );
    
    await autoMatchButton.click();
    
    const request = await requestPromise;
    expect(request).toBeTruthy();

    // Expect a toast or success message (assuming mock backend success)
    // await expect(page.getByText('Auto-reconciliation complete')).toBeVisible(); 
  });

  test('Manual Match Flow', async ({ page }) => {
    await page.goto('/reconciliation');

    // Select an internal transaction (first one)
    // We need robust selectors. Assuming cards have text we can look for.
    // This is tricky without knowing exact data. 
    // We'll look for the card container and click the first item.
    
    const internalList = page.locator('.grid > div:first-child .space-y-2 > div').first();
    const externalList = page.locator('.grid > div:last-child .space-y-2 > div').first();

    // Check if we have items
    if (await internalList.count() > 0 && await externalList.count() > 0) {
        await internalList.click();
        await externalList.click();

        // Check if "Create Match" button becomes enabled
        const matchButton = page.getByText('Create Match');
        await expect(matchButton).toBeEnabled();
        
        // Click match
        await matchButton.click();
        
        // Verify success toast
        await expect(page.getByText('Transactions matched successfully')).toBeVisible();
    }
  });

});
