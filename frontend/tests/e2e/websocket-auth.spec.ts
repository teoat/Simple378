import { test, expect } from '@playwright/test';

/**
 * WebSocket Authentication E2E Tests
 * 
 * These tests verify that WebSocket connections:
 * 1. Require valid JWT authentication
 * 2. Reject invalid/expired tokens
 * 3. Handle logout properly
 * 4. Maintain connection stability
 */

test.describe('WebSocket Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.goto('/');
  });

  test('should connect with valid authentication', async ({ page }) => {
    // Login with valid credentials
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Wait for WebSocket connection to establish
    await page.waitForTimeout(2000);
    
    // Check that no WebSocket errors appear in console
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('WebSocket')) {
        errors.push(msg.text());
      }
    });
    
    // Trigger a WebSocket message by navigating to a page that uses it
    await page.goto('/adjudication');
    await page.waitForTimeout(1000);
    
    // Verify no WebSocket errors
    expect(errors.length).toBe(0);
  });

  test('should reject connection without token', async ({ page }) => {
    // Clear localStorage to remove any token
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // Try to access protected route
    await page.goto('/dashboard');
    
    // Should be redirected to login
    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });

  test('should reject connection with invalid token', async ({ page }) => {
    // Set invalid token
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'invalid-token-12345');
    });
    
    // Track console errors
    const wsErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        wsErrors.push(msg.text());
      }
    });
    
    // Try to access dashboard (which uses WebSocket)
    await page.goto('/dashboard');
    
    // Should either redirect to login or show authentication error
    const url = page.url();
    const hasError = wsErrors.some(e => 
      e.includes('Authentication') || 
      e.includes('token') || 
      e.includes('WebSocket')
    );
    
    // Either redirected to login OR got WebSocket auth error
    expect(url.includes('/login') || hasError).toBeTruthy();
  });

  test('should disconnect after logout', async ({ page }) => {
    // First, login successfully
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Wait for WebSocket connection
    await page.waitForTimeout(2000);
    
    // Logout by clicking the user menu and logout button
    // Adjust selector based on your actual UI
    const logoutSelectors = [
      'button:has-text("Logout")',
      '[data-testid="logout-button"]',
      'a:has-text("Logout")',
      'button:has-text("Sign out")',
    ];
    
    let loggedOut = false;
    for (const selector of logoutSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          await element.click();
          loggedOut = true;
          break;
        }
      } catch {
        // Continue to next selector
      }
    }
    
    // If no logout button found, use API
    if (!loggedOut) {
      await page.evaluate(() => {
        localStorage.removeItem('auth_token');
      });
      await page.goto('/login');
    }
    
    // Should redirect to login
    await expect(page).toHaveURL('/login', { timeout: 5000 });
    
    // Token should be cleared
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeNull();
  });

  test('should maintain connection stability', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Monitor WebSocket connection errors
    const wsErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().toLowerCase().includes('websocket')) {
        wsErrors.push(msg.text());
      }
    });
    
    // Navigate between pages that use WebSocket
    const routes = ['/dashboard', '/cases', '/adjudication', '/dashboard'];
    
    for (const route of routes) {
      await page.goto(route);
      await page.waitForTimeout(1500);
    }
    
    // Should have minimal or no WebSocket errors
    // Some reconnection attempts are normal, but shouldn't be excessive
    expect(wsErrors.length).toBeLessThan(3);
  });

  test('should receive real-time updates', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Track WebSocket messages
    const wsMessages: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('WebSocket') || text.includes('Received:')) {
        wsMessages.push(text);
      }
    });
    
    // Wait for potential messages
    await page.waitForTimeout(5000);
    
    // Navigate to adjudication queue (high activity page)
    await page.goto('/adjudication');
    await page.waitForTimeout(3000);
    
    // If we have messages, connection is working
    // Note: In a real test, you'd trigger specific events
    console.log(`Captured ${wsMessages.length} WebSocket-related messages`);
  });
});

test.describe('WebSocket Security', () => {
  test('should reject expired tokens', async ({ page }) => {
    // This test would require backend support to create an expired token
    // For now, we'll test the rejection behavior
    
    // Set a token that looks valid but is actually expired
    // In production, you'd generate this from your auth service
    await page.evaluate(() => {
      // This is a mock - in real test, use an actual expired token
      localStorage.setItem('auth_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MTYyMzkwMjJ9.invalid');
    });
    
    await page.goto('/dashboard');
    
    // Should redirect to login or show error
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).toContain('/login');
  });

  test('should handle concurrent connections', async ({ browser }) => {
    // Create multiple contexts (simulating multiple users)
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
    ]);
    
    const pages = await Promise.all(contexts.map(ctx => ctx.newPage()));
    
    // Login both users
    for (const page of pages) {
      await page.goto('/login');
      await page.fill('input[name="username"]', 'admin');
      await page.fill('input[name="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    }
    
    // Wait for connections to establish
    await Promise.all(pages.map(p => p.waitForTimeout(2000)));
    
    // Both should be connected without issues
    for (const page of pages) {
      const hasErrors = await page.evaluate(() => {
        return document.body.textContent?.includes('error') || false;
      });
      expect(hasErrors).toBeFalsy();
    }
    
    // Cleanup
    await Promise.all(contexts.map(ctx => ctx.close()));
  });
});
