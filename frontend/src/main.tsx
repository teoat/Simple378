import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from "@sentry/react"
import './index.css'
import App from './App.tsx'

// Initialize Sentry
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE, // 'development', 'production', etc.
  release: `frontend@${import.meta.env.VITE_APP_VERSION || '0.0.0'}`,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
    Sentry.breadcrumbsIntegration({
      console: true,
      dom: true,
      fetch: true,
      history: true,
      xhr: true,
    }),
  ],
  // Tracing
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% in production, 100% in dev
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  // Session Replay
  replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 0.0, // 10% in production, disabled in dev
  replaysOnErrorSampleRate: 1.0, // Always capture on error
  
  beforeSend(event) {
    // Add user context if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        event.user = {
          id: payload.sub,
          email: payload.email,
        };
      } catch {
        // Invalid token format, skip user context
      }
    }
    
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
      // Remove auth headers from request data
      if (event.request.headers) {
        delete event.request.headers['Authorization'];
      }
    }
    
    return event;
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register service worker for PWA support
import { registerServiceWorker } from './lib/serviceWorkerRegistration'
registerServiceWorker()
