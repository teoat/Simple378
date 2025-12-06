import { test, expect } from '@playwright/test';

// Smoke test for the Network & Flow tab
// Assumes authentication path is similar to existing analytics spec

test.describe('Visualization Network & Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('renders network, flow, timeline, heatmap and exports', async ({ page }) => {
    await page.goto('/cases/123e4567-e89b-12d3-a456-426614174000/visualization');

    await page.getByText('Network & Flow').click();

    await expect(page.getByText('Entity Network')).toBeVisible();
    await expect(page.getByText('Financial Flows')).toBeVisible();
    await expect(page.getByText('Transaction Timeline')).toBeVisible();
    await expect(page.getByText('Activity Heatmap')).toBeVisible();

    // Export buttons present
    await expect(page.getByText('Export SVG/PNG')).toBeVisible();

    // Status/legend presence
    await expect(page.getByText('Subject')).toBeVisible();
    await expect(page.getByText('Bank')).toBeVisible();
    await expect(page.getByText('Other')).toBeVisible();

    // Reset view control exists
    await expect(page.getByText('Reset view')).toBeVisible();
  });
});
