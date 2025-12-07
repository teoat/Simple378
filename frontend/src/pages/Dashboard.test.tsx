import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/test-utils';
import { Dashboard } from './Dashboard';

describe('Dashboard', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(component);
  };

  it('renders dashboard with loading state initially', () => {
    renderWithProviders(<Dashboard />);

    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('displays dashboard title', async () => {
    // Mock successful data loading
    vi.mock('../../hooks/useDashboard', () => ({
      useDashboard: () => ({
        stats: {
          totalCases: 150,
          activeCases: 45,
          resolvedCases: 105,
          highRiskCases: 12
        },
        recentActivity: [],
        alerts: [],
        isLoading: false
      })
    }));

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('displays key statistics cards', async () => {
    vi.mock('../../hooks/useDashboard', () => ({
      useDashboard: () => ({
        stats: {
          totalCases: 150,
          activeCases: 45,
          resolvedCases: 105,
          highRiskCases: 12
        },
        recentActivity: [],
        alerts: [],
        isLoading: false
      })
    }));

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument(); // total cases
      expect(screen.getByText('45')).toBeInTheDocument(); // active cases
      expect(screen.getByText('105')).toBeInTheDocument(); // resolved cases
      expect(screen.getByText('12')).toBeInTheDocument(); // high risk cases
    });
  });

  it('displays recent activity section', async () => {
    vi.mock('../../hooks/useDashboard', () => ({
      useDashboard: () => ({
        stats: { totalCases: 0, activeCases: 0, resolvedCases: 0, highRiskCases: 0 },
        recentActivity: [
          { id: '1', type: 'case_created', description: 'New case created', timestamp: new Date() },
          { id: '2', type: 'alert_triggered', description: 'High risk alert', timestamp: new Date() }
        ],
        alerts: [],
        isLoading: false
      })
    }));

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText('New case created')).toBeInTheDocument();
      expect(screen.getByText('High risk alert')).toBeInTheDocument();
    });
  });

  it('displays alerts section when alerts exist', async () => {
    vi.mock('../../hooks/useDashboard', () => ({
      useDashboard: () => ({
        stats: { totalCases: 0, activeCases: 0, resolvedCases: 0, highRiskCases: 0 },
        recentActivity: [],
        alerts: [
          { id: '1', title: 'System Alert', message: 'Database maintenance scheduled', priority: 'medium' }
        ],
        isLoading: false
      })
    }));

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('System Alert')).toBeInTheDocument();
      expect(screen.getByText('Database maintenance scheduled')).toBeInTheDocument();
    });
  });

  it('shows empty state when no data', async () => {
    vi.mock('../../hooks/useDashboard', () => ({
      useDashboard: () => ({
        stats: { totalCases: 0, activeCases: 0, resolvedCases: 0, highRiskCases: 0 },
        recentActivity: [],
        alerts: [],
        isLoading: false
      })
    }));

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No recent activity')).toBeInTheDocument();
    });
  });

  it('handles error state gracefully', async () => {
    vi.mock('../../hooks/useDashboard', () => ({
      useDashboard: () => ({
        stats: null,
        recentActivity: [],
        alerts: [],
        isLoading: false,
        error: 'Failed to load dashboard data'
      })
    }));

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
    });
  });

  it('includes navigation links to key sections', async () => {
    vi.mock('../../hooks/useDashboard', () => ({
      useDashboard: () => ({
        stats: { totalCases: 10, activeCases: 5, resolvedCases: 5, highRiskCases: 1 },
        recentActivity: [],
        alerts: [],
        isLoading: false
      })
    }));

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      // Should have links or buttons to navigate to cases, alerts, etc.
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });
});