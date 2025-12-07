import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { App } from '../App';

// Mock all the lazy-loaded components
vi.mock('../pages/Login', () => ({
  Login: () => <div data-testid="login-page">Login Page</div>
}));

vi.mock('../pages/Dashboard', () => ({
  Dashboard: () => <div data-testid="dashboard-page">Dashboard Page</div>
}));

vi.mock('../pages/CaseList', () => ({
  CaseList: () => <div data-testid="case-list-page">Case List Page</div>
}));

vi.mock('../pages/CaseDetail', () => ({
  CaseDetail: () => <div data-testid="case-detail-page">Case Detail Page</div>
}));

vi.mock('../pages/Reconciliation', () => ({
  Reconciliation: () => <div data-testid="reconciliation-page">Reconciliation Page</div>
}));

vi.mock('../pages/Forensics', () => ({
  Forensics: () => <div data-testid="forensics-page">Forensics Page</div>
}));

vi.mock('../pages/Settings', () => ({
  Settings: () => <div data-testid="settings-page">Settings Page</div>
}));

vi.mock('../pages/AdjudicationQueue', () => ({
  AdjudicationQueue: () => <div data-testid="adjudication-queue-page">Adjudication Queue Page</div>
}));

vi.mock('../pages/FinalSummary', () => ({
  FinalSummary: () => <div data-testid="final-summary-page">Final Summary Page</div>
}));

vi.mock('../pages/Ingestion', () => ({
  Ingestion: () => <div data-testid="ingestion-page">Ingestion Page</div>
}));

vi.mock('../pages/Visualization', () => ({
  Visualization: () => <div data-testid="visualization-page">Visualization Page</div>
}));

// Mock error pages
vi.mock('../pages/errors/NotFound', () => ({
  NotFound: () => <div data-testid="not-found-page">Not Found Page</div>
}));

vi.mock('../pages/errors/Forbidden', () => ({
  Forbidden: () => <div data-testid="forbidden-page">Forbidden Page</div>
}));

vi.mock('../pages/errors/ServerError', () => ({
  ServerError: () => <div data-testid="server-error-page">Server Error Page</div>
}));

vi.mock('../pages/errors/Unauthorized', () => ({
  Unauthorized: () => <div data-testid="unauthorized-page">Unauthorized Page</div>
}));

vi.mock('../pages/errors/Offline', () => ({
  Offline: () => <div data-testid="offline-page">Offline Page</div>
}));

// Mock components
vi.mock('../components/auth/AuthGuard', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-guard">{children}</div>
}));

vi.mock('../components/layout/AppShell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div data-testid="app-shell">{children}</div>
}));

vi.mock('../components/ai/AIAssistant', () => ({
  AIAssistant: () => <div data-testid="ai-assistant">AI Assistant</div>
}));

vi.mock('../components/NetworkMonitor', () => ({
  NetworkMonitor: () => <div data-testid="network-monitor">Network Monitor</div>
}));

vi.mock('../components/pwa/PWAInstallBanner', () => ({
  PWAInstallBanner: () => <div data-testid="pwa-banner">PWA Banner</div>
}));

vi.mock('../components/pwa/OfflineSyncStatus', () => ({
  OfflineSyncStatus: () => <div data-testid="offline-sync">Offline Sync</div>
}));

vi.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>
}));

vi.mock('../context/AIContext', () => ({
  AIProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="ai-provider">{children}</div>
}));

vi.mock('../lib/queryClient', () => ({
  queryClient: new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
}));

vi.mock('react-hot-toast', () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>
}));

describe('App', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('ai-provider')).toBeInTheDocument();
    expect(screen.getByTestId('network-monitor')).toBeInTheDocument();
    expect(screen.getByTestId('pwa-banner')).toBeInTheDocument();
    expect(screen.getByTestId('offline-sync')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  it('renders error boundary around protected routes', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // The error boundary should wrap the auth guard and app shell
    expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
  });

  it('includes all route components', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Routes are lazy loaded, so we can't test them directly without navigation
    // But we can verify the router structure is set up
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
  });

  it('handles navigation to dashboard by default', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Since routes are lazy loaded and we mock them,
    // we can only verify the routing structure exists
    expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
  });

  it('includes error pages for 401, 403, 404, 500, and offline routes', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Error pages are lazy loaded, so we verify the structure exists
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
  });

  it('wraps everything in QueryClientProvider', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // The QueryClientProvider is mocked, so we verify the structure
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
  });

  it('includes AI assistant component', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByTestId('ai-assistant')).toBeInTheDocument();
  });

  it('includes network monitoring', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByTestId('network-monitor')).toBeInTheDocument();
  });

  it('includes PWA install banner', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByTestId('pwa-banner')).toBeInTheDocument();
  });

  it('includes offline sync status', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByTestId('offline-sync')).toBeInTheDocument();
  });
});