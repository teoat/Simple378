import { test, expect } from '@playwright/test';

test.describe('Advanced Analytics & Visualization Features', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('Predictive Analytics Dashboard', async ({ page }) => {
    // Navigate to a case detail page
    // Using a mock case ID, assuming backend has data or we mock the API
    await page.goto('/cases/123e4567-e89b-12d3-a456-426614174000'); 

    // Check if Predictive Analytics tab exists and click it
    const predictiveTab = page.getByText('Predictive Analytics');
    await expect(predictiveTab).toBeVisible();
    await predictiveTab.click();

    // Verify key components are loaded
    await expect(page.getByText('Outcome Prediction')).toBeVisible();
    await expect(page.getByText('Risk Forecast')).toBeVisible();
    await expect(page.getByText('Resource Estimation')).toBeVisible();
    await expect(page.getByText('Pattern Alerts')).toBeVisible();

    // Check interaction with tabs in Predictive Dashboard
    await page.getByText('Risk Forecast').click();
    await expect(page.getByText('30-Day Risk Forecast')).toBeVisible(); // Chart title

    await page.getByText('Resource Estimate').click();
    await expect(page.getByText('Estimated Cost')).toBeVisible();
  });

  test('Advanced Visualization Page', async ({ page }) => {
    // Navigate to visualization page
    await page.goto('/cases/123e4567-e89b-12d3-a456-426614174000/visualization');

    // Verify Header
    await expect(page.getByText('Financial Visualization')).toBeVisible();

    // Verify default view (Cashflow)
    await expect(page.getByText('Cashflow Balance Analysis')).toBeVisible();
    await expect(page.getByText('Total Inflow')).toBeVisible();

    // Switch to Graphs View
    await page.getByText('Network & Flow').click();
    
    // Verify Graph components
    await expect(page.getByText('Entity Network')).toBeVisible();
    await expect(page.getByText('Financial Flows')).toBeVisible();
    await expect(page.getByText('Activity Heatmap')).toBeVisible();
    await expect(page.getByText('Transaction Timeline')).toBeVisible();

    // Verify controls are present
    await expect(page.getByText('Export SVG/PNG')).toBeVisible();
  });

  test('Ingestion Wizard Flow', async ({ page }) => {
    await page.goto('/ingestion');

    // Step 1: Upload
    await expect(page.getByText('Step 1: Upload')).toBeVisible();
    await page.fill('input[placeholder*="e.g. 123e4567"]', '123e4567-e89b-12d3-a456-426614174000');
    await page.fill('input[placeholder*="Chase"]', 'Chase');

    // We can't easily test file upload with fake data without more setup, 
    // but we can verify the UI structure exists
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
  });

});
