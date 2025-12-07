#!/usr/bin/env node

/**
 * Frontend Diagnostics for AntiGravity Fraud Detection System
 * Run this in the browser console or as a Node.js script
 */

const FrontendDiagnostics = {
  // Environment Check
  checkEnvironment: () => {
    console.group('🔍 Frontend Environment Diagnostics');

    console.log('User Agent:', navigator.userAgent);
    console.log('Viewport:', `${window.innerWidth}x${window.innerHeight}`);
    console.log('Online Status:', navigator.onLine);
    console.log('Cookies Enabled:', navigator.cookieEnabled);
    console.log('Local Storage:', localStorage.length, 'items');
    console.log('Session Storage:', sessionStorage.length, 'items');
    console.log('URL:', window.location.href);
    console.log('Protocol:', window.location.protocol);
    console.log('Host:', window.location.host);

    // Check for required APIs
    console.log('Fetch API:', typeof fetch !== 'undefined' ? '✅ Available' : '❌ Missing');
    console.log('WebSocket API:', typeof WebSocket !== 'undefined' ? '✅ Available' : '❌ Missing');
    console.log('LocalStorage API:', typeof localStorage !== 'undefined' ? '✅ Available' : '❌ Missing');
    console.log('SessionStorage API:', typeof sessionStorage !== 'undefined' ? '✅ Available' : '❌ Missing');

    console.groupEnd();
  },

  // React Component Analysis
  analyzeReactComponents: () => {
    console.group('⚛️ React Component Analysis');

    // Check if React is loaded
    if (typeof React === 'undefined') {
      console.error('❌ React is not loaded');
      console.groupEnd();
      return;
    }

    console.log('✅ React is loaded');

    // Check React DevTools
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      console.log('✅ React DevTools available');
    } else {
      console.log('⚠️ React DevTools not available');
    }

    // Find React root
    const reactRoots = document.querySelectorAll('[data-reactroot]');
    console.log('React Roots Found:', reactRoots.length);

    // Check for error boundaries
    const errorBoundaries = document.querySelectorAll('[data-error-boundary]');
    console.log('Error Boundaries:', errorBoundaries.length);

    // Check for Suspense boundaries
    const suspenseBoundaries = document.querySelectorAll('[data-suspense-boundary]');
    console.log('Suspense Boundaries:', suspenseBoundaries.length);

    console.groupEnd();
  },

  // Network Analysis
  analyzeNetwork: () => {
    console.group('🌐 Network Analysis');

    // Check current requests
    if (performance.getEntriesByType) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        console.log('Page Load Time:', navigation.loadEventEnd - navigation.navigationStart, 'ms');
        console.log('DNS Lookup:', navigation.domainLookupEnd - navigation.domainLookupStart, 'ms');
        console.log('TCP Connect:', navigation.connectEnd - navigation.connectStart, 'ms');
        console.log('Server Response:', navigation.responseStart - navigation.requestStart, 'ms');
        console.log('Page Download:', navigation.responseEnd - navigation.responseStart, 'ms');
      }
    }

    // Check API endpoints
    const apiEndpoints = [
      '/health',
      '/cases/',
      '/dashboard/metrics',
      '/auth/me'
    ];

    console.log('Testing API endpoints...');
    apiEndpoints.forEach(async (endpoint) => {
      try {
        const start = performance.now();
        const response = await fetch(`http://localhost:8000${endpoint}`, {
          method: 'GET',
          headers: {
            'Authorization': localStorage.getItem('auth_token') ?
              `Bearer ${JSON.parse(atob(localStorage.getItem('auth_token'))).token}` : ''
          }
        });
        const duration = performance.now() - start;

        console.log(`${endpoint}: ${response.status} (${duration.toFixed(2)}ms)`);
      } catch (error) {
        console.error(`${endpoint}: Failed - ${error.message}`);
      }
    });

    console.groupEnd();
  },

  // Performance Monitoring
  monitorPerformance: () => {
    console.group('⚡ Performance Monitoring');

    // Core Web Vitals
    if ('web-vitals' in window) {
      import('https://unpkg.com/web-vitals@3.5.2/dist/web-vitals.js').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS((metric) => console.log('CLS:', metric.value));
        getFID((metric) => console.log('FID:', metric.value));
        getFCP((metric) => console.log('FCP:', metric.value));
        getLCP((metric) => console.log('LCP:', metric.value));
        getTTFB((metric) => console.log('TTFB:', metric.value));
      });
    } else {
      console.log('⚠️ Web Vitals library not available');
    }

    // Memory usage
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      console.log('JS Heap Used:', (memInfo.usedJSHeapSize / 1024 / 1024).toFixed(2), 'MB');
      console.log('JS Heap Total:', (memInfo.totalJSHeapSize / 1024 / 1024).toFixed(2), 'MB');
      console.log('JS Heap Limit:', (memInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2), 'MB');
    } else {
      console.log('⚠️ Memory info not available');
    }

    // Long tasks
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn('🚨 Long Task:', entry.duration.toFixed(2), 'ms');
        }
      }
    });
    observer.observe({ entryTypes: ['longtask'] });

    console.groupEnd();
  },

  // Security Analysis
  analyzeSecurity: () => {
    console.group('🔐 Security Analysis');

    // Check HTTPS
    console.log('HTTPS:', window.location.protocol === 'https:' ? '✅ Enabled' : '❌ Disabled');

    // Check Content Security Policy
    const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    console.log('CSP Header:', csp ? '✅ Present' : '❌ Missing');

    // Check authentication
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
      try {
        const tokenData = JSON.parse(atob(authToken));
        const now = Date.now();
        const timeUntilExpiry = tokenData.expires - now;

        if (timeUntilExpiry < 0) {
          console.error('❌ Token expired');
        } else if (timeUntilExpiry < 5 * 60 * 1000) {
          console.warn('⚠️ Token expires soon:', new Date(tokenData.expires).toLocaleString());
        } else {
          console.log('✅ Token valid until:', new Date(tokenData.expires).toLocaleString());
        }
      } catch (error) {
        console.error('❌ Invalid token format');
      }
    } else {
      console.log('⚠️ No authentication token found');
    }

    // Check for mixed content
    const mixedContent = Array.from(document.querySelectorAll('img[src^="http:"], script[src^="http:"], link[href^="http:"]'));
    console.log('Mixed Content Issues:', mixedContent.length);

    console.groupEnd();
  },

  // Accessibility Audit
  auditAccessibility: () => {
    console.group('♿ Accessibility Audit');

    // Check for images without alt text
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    console.log('Images without alt text:', imagesWithoutAlt.length);

    // Check for missing labels
    const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    console.log('Inputs without labels:', inputsWithoutLabels.length);

    // Check for proper heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
    console.log('Heading hierarchy:', headingLevels);

    // Check for focus management
    const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    console.log('Focusable elements:', focusableElements.length);

    // Check for ARIA landmarks
    const landmarks = document.querySelectorAll('[role="main"], [role="navigation"], [role="complementary"], [role="banner"], [role="contentinfo"]');
    console.log('ARIA landmarks:', landmarks.length);

    // Check color contrast (basic)
    console.log('⚠️ Manual color contrast check required');

    console.groupEnd();
  },

  // Error Monitoring
  monitorErrors: () => {
    console.group('🚨 Error Monitoring Setup');

    // Global error handler
    window.addEventListener('error', (event) => {
      console.error('🚨 JavaScript Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled Promise Rejection:', event.reason);
    });

    // React error boundary monitoring
    if (window.addEventListener) {
      window.addEventListener('react-error-boundary', (event: any) => {
        console.error('🚨 React Error Boundary:', event.detail);
      });
    }

    console.log('✅ Error monitoring active');
    console.groupEnd();
  },

  // Run all diagnostics
  runFullDiagnostics: () => {
    console.clear();
    console.log('🚀 AntiGravity Frontend Diagnostics');
    console.log('=====================================');
    console.log('Running comprehensive diagnostic suite...\n');

    this.checkEnvironment();
    console.log('');

    this.analyzeReactComponents();
    console.log('');

    this.analyzeNetwork();
    console.log('');

    this.monitorPerformance();
    console.log('');

    this.analyzeSecurity();
    console.log('');

    this.auditAccessibility();
    console.log('');

    this.monitorErrors();
    console.log('');

    console.log('✅ Frontend diagnostics complete!');
    console.log('📊 Check the console output above for detailed results');
    console.log('🔧 Use individual diagnostic functions for deeper analysis');
  }
};

// Make diagnostics globally available
(window as any).diagnostics = FrontendDiagnostics;

// Auto-run diagnostics if in browser environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  console.log('💡 Frontend diagnostics loaded!');
  console.log('Run: diagnostics.runFullDiagnostics() to start analysis');
  console.log('Or run individual diagnostics: diagnostics.checkEnvironment(), etc.');
}