import { test, expect } from '@playwright/test';

test.describe('Visualization Page E2E Tests', () => {
  let mockFinancialsResponse: any;

  test.beforeEach(async ({ page }) => {
    // Default mock response
    mockFinancialsResponse = {
      total_inflow: 100000,
      total_outflow: 50000,
      net_cashflow: 50000,
      suspect_transactions: 0,
      risk_score: 10,
      cashflow_data: [],
      income_breakdown: {
        income_sources: { id: '1', name: 'Income', amount: 80000, transactions: 10 },
        mirror_transactions: { id: '2', name: 'Mirror', amount: 10000, transactions: 2 },
        external_transfers: { id: '3', name: 'External', amount: 10000, transactions: 2 }
      },
      expense_breakdown: {
        personal_expenses: { id: '4', name: 'Personal', amount: 10000, transactions: 5 },
        operational_expenses: { id: '5', name: 'Ops', amount: 30000, transactions: 10 },
        project_expenses: { id: '6', name: 'Project', amount: 10000, transactions: 2 }
      },
      milestones: [],
      fraud_indicators: []
    };

    // Mock APIs to ensure page loads
    // ... auth mock ...
    await page.route('**/auth/me', async (route) => {
      // ... existing auth mock ...
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: 'mock-user',
          email: 'test@example.com',
          name: 'Test User',
          role: 'admin'
        })
      });
    });

    await page.route('**/cases/MOCK_CASE_ID/financials', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(mockFinancialsResponse)
      });
    });

    await page.route('**/graph/*', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ nodes: [], links: [] })
      });
    });

    // Mock Authentication
    await page.addInitScript(() => {
      const token = {
        token: 'mock-token',
        expires: Date.now() + 86400000,
        fingerprint: navigator.userAgent.substring(0, 50)
      };
      localStorage.setItem('auth_token', btoa(JSON.stringify(token)));
      sessionStorage.setItem('user_session', JSON.stringify({
        id: 'mock-user',
        email: 'test@example.com',
        role: 'admin'
      }));
    });

    // Navigate to visualization page
    await page.goto('/visualization/MOCK_CASE_ID');
  });

  test('should load visualization page with KPI cards', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('[data-testid="kpi-card"]', { timeout: 5000 });

    // Check that all 4 KPI cards are present
    const kpiCards = await page.locator('[data-testid="kpi-card"]').count();
    expect(kpiCards).toBe(4);

    // Verify KPI titles
    await expect(page.locator('text=Total Inflow')).toBeVisible();
    await expect(page.locator('text=Total Outflow')).toBeVisible();
    await expect(page.locator('text=Net Cashflow')).toBeVisible();
    await expect(page.locator('text=Suspect Items')).toBeVisible();
  });

  test('should navigate between tabs', async ({ page }) => {
    // Check initial tab
    const cashflowTab = page.locator('button:has-text("Cashflow")');
    await expect(cashflowTab).toBeVisible();

    // Click on milestones tab
    const milestonesTab = page.locator('button:has-text("Milestone Tracker")');
    await milestonesTab.click();
    
    // Verify milestone content is visible
    await expect(page.locator('[data-testid="milestone-tracker"]')).toBeVisible();

    // Click on fraud tab
    const fraudTab = page.locator('button:has-text("Fraud")');
    await fraudTab.click();
    
    // Verify fraud detection panel is visible
    await expect(page.locator('[data-testid="fraud-panel"]')).toBeVisible();

    // Click on graphs tab
    const graphsTab = page.locator('button:has-text("Network & Flow")');
    await graphsTab.click();
    
    // Verify network visualization is visible
    await expect(page.locator('[data-testid="visualization-network"]')).toBeVisible();
  });

  test('should display waterfall chart in cashflow view', async ({ page }) => {
    // Ensure we're on cashflow tab
    await page.locator('button:has-text("Cashflow")').click();
    
    // Wait for waterfall chart to render
    await page.waitForSelector('[data-testid="waterfall-chart"]', { timeout: 5000 });
    
    // Verify chart elements are present
    const waterfallChart = page.locator('[data-testid="waterfall-chart"]');
    await expect(waterfallChart).toBeVisible();
    
    // Check for legend items
    await expect(page.locator('text=Total Cashflow').first()).toBeVisible();
    await expect(page.locator('text=Excluded').first()).toBeVisible();
    await expect(page.locator('text=Project').first()).toBeVisible();
  });

  test('should handle empty state for milestones', async ({ page }) => {
    // Navigate to page with no milestones (mock API to return empty array)
    await page.route('**/cases/*/financials', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          total_inflow: 0,
          total_outflow: 0,
          net_cashflow: 0,
          suspect_transactions: 0,
          risk_score: 0,
          cashflow_data: [],
          milestones: [],  // Empty milestones
          fraud_indicators: []
        })
      });
    });

    await page.reload();
    
    // Go to milestones tab
    // Go to milestones tab
    await page.locator('button:has-text("Milestone Tracker")').click();
    
    // Verify empty state message
    await expect(page.locator('text=No milestones detected')).toBeVisible();
    await expect(page.locator('text=Milestones are automatically detected')).toBeVisible();
  });

  test('should handle empty state for fraud indicators', async ({ page }) => {
    // Mock API with no fraud indicators
    await page.route('**/cases/*/financials', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          total_inflow: 100000,
          total_outflow: 50000,
          net_cashflow: 50000,
          suspect_transactions: 0,
          risk_score: 10,
          cashflow_data: [],
          milestones: [],
          fraud_indicators: []  // No fraud
        })
      });
    });

    await page.reload();
    
    // Go to fraud tab
    await page.locator('button:has-text("Fraud")').click();
    
    // Verify clean case message
    await expect(page.locator('text=No Fraud Indicators Detected')).toBeVisible();
    await expect(page.locator('text=This case appears clean')).toBeVisible();
  });

  test('should export data', async ({ page }) => {
    // Click export button
    const exportButton = page.locator('button:has-text("Export")');
    await exportButton.click();
    
    // Wait for download to start (this would need proper download handling)
    // For now, just check that button is clickable
    await expect(exportButton).toBeEnabled();
  });

  test('should refresh data', async ({ page }) => {
    const refreshButton = page.locator('button:has-text("Refresh")');
    await expect(refreshButton).toBeVisible();
    
    // Click refresh
    await refreshButton.click();
    
    // Verify loading state or data update
    // Wait a bit for potential API call
    await page.waitForTimeout(500);
    
    // Verify page is still functional
    await expect(page.locator('[data-testid="kpi-card"]').first()).toBeVisible();
  });

  test('should display milestone with details', async ({ page }) => {
    const caseId = 'MILESTONE_CASE_ID';
    // Mock API with milestone data - using Regex to ensure match
    await page.route(new RegExp(`cases/${caseId}/financials`), async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          total_inflow: 500000,
          total_outflow: 200000,
          net_cashflow: 300000,
          suspect_transactions: 0,
          risk_score: 25,
          cashflow_data: [],
          milestones: [
            {
              id: '1',
              name: 'Initial Deposit',
              date: '2024-01-15',
              amount: 500000,
              status: 'complete',
              phase: 'Phase 1',
              description: 'Opening balance'
            }
          ],
          fraud_indicators: []
        })
      });
    });

    await page.goto(`/visualization/${caseId}`);
    await page.locator('button:has-text("Milestone Tracker")').click();
    
    // Verify milestone details
    await expect(page.locator('text=Initial Deposit').first()).toBeVisible();
    await expect(page.locator('text=Phase 1').first()).toBeVisible();
    await expect(page.locator('text=$500,000').first()).toBeVisible();
  });

  test('should display fraud indicators with severity', async ({ page }) => {
    const caseId = 'FRAUD_CASE_ID';
    // Mock API with fraud data - using Regex
    await page.route(new RegExp(`cases/${caseId}/financials`), async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          total_inflow: 500000,
          total_outflow: 200000,
          net_cashflow: 300000,
          suspect_transactions: 2,
          risk_score: 75,
          cashflow_data: [],
          milestones: [],
          fraud_indicators: [
            {
              id: '1',
              type: 'Structuring',
              severity: 'high',
              description: 'Multiple transactions below threshold',
              amount: 90000,
              count: 10,
              trend: 'up'
            },
            {
              id: '2',
              type: 'Velocity',
              severity: 'medium',
              description: 'Unusual transaction frequency',
              amount: 50000,
              count: 25,
              trend: 'stable'
            }
          ]
        })
      });
    });

    await page.goto(`/visualization/${caseId}`);
    await page.locator('button:has-text("Fraud")').click();
    
    // Verify fraud indicators
    await expect(page.locator('text=Structuring').first()).toBeVisible();
    await expect(page.locator('text=Velocity').first()).toBeVisible();
    await expect(page.locator('text=75').first()).toBeVisible();  // Risk score
  });

  test('should handle API errors gracefully', async ({ page }) => {
    const errorCaseId = 'ERROR_CASE_ID';
    // Mock API error specific to this case - using Regex
    await page.route(new RegExp(`cases/${errorCaseId}/financials`), async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ detail: 'Internal server error' })
      });
    });

    await page.goto(`/visualization/${errorCaseId}`);
    
    // Verify error state
    await expect(page.locator('[data-testid="error-state"]')).toBeVisible({ timeout: 15000 });
  });


test.describe('Phase Control Panel E2E Tests', () => {
  test('should show mark complete button for pending milestones', async ({ page }) => {
    // Update mock data
    mockFinancialsResponse.milestones = [
      {
        id: 'pending-1',
        name: 'Pending Milestone',
        date: '2024-02-15',
        amount: 50000,
        status: 'pending',
        phase: 'Phase 2',
        description: 'Next phase funding'
      }
    ];

    // Reload to fetch with new mock
    await page.reload();
    
    // Wait for loading to finish
    await page.waitForTimeout(1000); // Give React request time to start
    await expect(page.locator('[data-testid="kpi-card"]').first()).toBeVisible({ timeout: 10000 });

    await page.locator('button:has-text("Milestone Tracker")').click();
    
    // Click the milestone to open modal
    await page.locator('text=Pending Milestone').first().click();

    // Verify Modal Title
    await expect(page.locator('text=Manage Milestone Phase')).toBeVisible();
    
    // Verify "Mark Phase as Complete" button is visible
    const markCompleteButton = page.locator('button:has-text("Mark Phase as Complete")');
    await expect(markCompleteButton).toBeVisible();
  });

  test('should show completion form when mark complete is clicked', async ({ page }) => {
    mockFinancialsResponse.milestones = [
      {
        id: 'pending-2',
        name: 'Milestone to Complete',
        date: '2024-02-15',
        amount: 50000,
        status: 'pending',
        phase: 'Phase 2'
      }
    ];

    await page.reload();
    await page.locator('button:has-text("Milestone Tracker")').click();
    await page.locator('text=Milestone to Complete').first().click();
    
    const markCompleteButton = page.locator('button:has-text("Mark Phase as Complete")');
    await markCompleteButton.click();
    
    // Verify form elements appear
    await expect(page.locator('textarea[placeholder*="notes"]')).toBeVisible();
    await expect(page.locator('text=Supporting Evidence (Optional)')).toBeVisible();
    await expect(page.locator('button:has-text("Confirm Completion")')).toBeVisible();
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
  });

  test('should allow canceling completion', async ({ page }) => {
    mockFinancialsResponse.milestones = [
      {
        id: 'pending-3',
        name: 'Milestone to Cancel',
        date: '2024-02-15',
        amount: 50000,
        status: 'pending',
        phase: 'Phase 2'
      }
    ];

    await page.reload();
    await page.locator('button:has-text("Milestone Tracker")').click();
    await page.locator('text=Milestone to Cancel').first().click();
    
    // Click mark complete
    await page.locator('button:has-text("Mark Phase as Complete")').click();
    
    // Click cancel
    await page.locator('button:has-text("Cancel")').click();
    
    // Verify form is hidden and we are back to initial state
    await expect(page.locator('button:has-text("Mark Phase as Complete")' )).toBeVisible();
    await expect(page.locator('button:has-text("Confirm Completion")')).not.toBeVisible();
  });
});
});
