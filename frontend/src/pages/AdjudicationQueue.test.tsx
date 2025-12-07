import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '../test/test-utils';
import { AdjudicationQueue } from './AdjudicationQueue';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
vi.mock('../lib/api', () => ({
  apiRequest: vi.fn()
}));

vi.mock('../hooks/useWebSocket', () => ({
  useWebSocket: vi.fn(() => ({ lastMessage: null }))
}));

vi.mock('react-hot-toast', () => ({
  default: vi.fn(),
  __esModule: true
}));

vi.mock('react-hotkeys-hook', () => ({
  useHotkeys: vi.fn()
}));

// Import mocks after mocking
import { apiRequest } from '../lib/api';
import { useWebSocket } from '../hooks/useWebSocket';
import toast from 'react-hot-toast';
import { useHotkeys } from 'react-hotkeys-hook';

// Mock child components
vi.mock('../../components/adjudication/AlertList', () => ({
  AlertList: ({ alerts, selectedId, onSelect }: any) => (
    <div data-testid="alert-list">
      {alerts.map((alert: any) => (
        <div
          key={alert.id}
          data-testid={`alert-item-${alert.id}`}
          className={selectedId === alert.id ? 'selected' : ''}
          onClick={() => onSelect(alert.id)}
        >
          {alert.subject_name} - Risk: {alert.risk_score}
        </div>
      ))}
    </div>
  )
}));

vi.mock('../../components/adjudication/AlertCard', () => ({
  AlertCard: ({ alert }: any) => (
    <div data-testid="alert-card">
      <h3>{alert.subject_name}</h3>
      <p>Risk Score: {alert.risk_score}</p>
    </div>
  )
}));

vi.mock('../../components/adjudication/DecisionPanel', () => ({
  DecisionPanel: ({ onDecision, disabled }: any) => (
    <div data-testid="decision-panel">
      <button
        data-testid="approve-btn"
        onClick={() => onDecision('approve', 'high')}
        disabled={disabled}
      >
        Approve
      </button>
      <button
        data-testid="reject-btn"
        onClick={() => onDecision('reject', 'high')}
        disabled={disabled}
      >
        Reject
      </button>
      <button
        data-testid="escalate-btn"
        onClick={() => onDecision('escalate', 'high')}
        disabled={disabled}
      >
        Escalate
      </button>
    </div>
  )
}));

vi.mock('../../components/adjudication/ContextTabs', () => ({
  ContextTabs: ({ alertId }: any) => (
    <div data-testid="context-tabs">
      Context for alert {alertId}
    </div>
  )
}));

vi.mock('../../components/adjudication/AdjudicationQueueSkeleton', () => ({
  AdjudicationQueueSkeleton: () => <div data-testid="loading-skeleton">Loading...</div>
}));

vi.mock('../../components/adjudication/EvidenceTab', () => ({
  EvidenceTab: ({ evidence }: any) => (
    <div data-testid="evidence-tab">
      Evidence: {Array.isArray(evidence) ? evidence.length : 0} items
    </div>
  )
}));

describe('AdjudicationQueue', () => {
  const mockApiRequest = vi.mocked(apiRequest);
  const mockUseWebSocket = vi.mocked(useWebSocket);
  const mockToast = vi.mocked(toast);
  const mockUseHotkeys = vi.mocked(useHotkeys);

  const mockQueueData = {
    items: [
      {
        id: '1',
        subject_id: 'sub1',
        subject_name: 'John Doe',
        risk_score: 85,
        status: 'pending' as const,
        decision: null,
        created_at: '2024-01-01T00:00:00Z',
        triggered_rules: ['rule1', 'rule2'],
        adjudication_status: 'pending'
      },
      {
        id: '2',
        subject_id: 'sub2',
        subject_name: 'Jane Smith',
        risk_score: 92,
        status: 'pending' as const,
        decision: null,
        created_at: '2024-01-02T00:00:00Z',
        triggered_rules: ['rule3'],
        adjudication_status: 'pending'
      }
    ],
    total: 2,
    page: 1,
    pages: 1
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockApiRequest.mockImplementation((url: string) => {
      if (url.startsWith('/adjudication/queue')) {
        return Promise.resolve(mockQueueData);
      }
      if (url.startsWith('/evidence/analysis/')) {
        return Promise.resolve([]); // Return empty evidence array
      }
      return Promise.resolve({});
    });
    mockUseWebSocket.mockReturnValue({ lastMessage: null });
    mockUseHotkeys.mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders loading skeleton initially', () => {
    mockApiRequest.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<AdjudicationQueue />);

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders adjudication queue with alerts', async () => {
    render(<AdjudicationQueue />);

    await waitFor(() => {
      expect(screen.getByText('Adjudication Queue')).toBeInTheDocument();
      expect(screen.getByText('2 alerts pending review')).toBeInTheDocument();
    });

    expect(screen.getByTestId('alert-list')).toBeInTheDocument();
    expect(screen.getByText('John Doe - Risk: 85')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith - Risk: 92')).toBeInTheDocument();
  });

  it('auto-selects first alert when data loads', async () => {
    render(<AdjudicationQueue />);

    await waitFor(() => {
      expect(screen.getByTestId('alert-card')).toBeInTheDocument();
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByTestId('context-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('decision-panel')).toBeInTheDocument();
  });

  it('allows manual alert selection', async () => {
    render(<AdjudicationQueue />);

    await waitFor(() => {
      expect(screen.getByTestId('alert-list')).toBeInTheDocument();
    });

    const janeAlert = screen.getByText('Jane Smith - Risk: 92');
    fireEvent.click(janeAlert);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('handles decision submission - approve', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true });

    render(<AdjudicationQueue />);

    await waitFor(() => {
      expect(screen.getByTestId('decision-panel')).toBeInTheDocument();
    });

    const approveBtn = screen.getByTestId('approve-btn');
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('/adjudication/1/decision', {
        method: 'POST',
        body: JSON.stringify({
          decision: 'confirmed_fraud',
          notes: 'Decision: approve (Confidence: high)'
        })
      });
    });

    expect(mockToast.success).toHaveBeenCalledWith('Alert approved');
  });

  it('handles decision submission - reject', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true });

    render(<AdjudicationQueue />);

    await waitFor(() => {
      expect(screen.getByTestId('decision-panel')).toBeInTheDocument();
    });

    const rejectBtn = screen.getByTestId('reject-btn');
    fireEvent.click(rejectBtn);

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('/adjudication/1/decision', {
        method: 'POST',
        body: JSON.stringify({
          decision: 'false_positive',
          notes: 'Decision: reject (Confidence: high)'
        })
      });
    });
  });

  it('handles decision submission - escalate', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true });

    render(<AdjudicationQueue />);

    await waitFor(() => {
      expect(screen.getByTestId('decision-panel')).toBeInTheDocument();
    });

    const escalateBtn = screen.getByTestId('escalate-btn');
    fireEvent.click(escalateBtn);

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('/adjudication/1/decision', {
        method: 'POST',
        body: JSON.stringify({
          decision: 'escalated',
          notes: 'Decision: escalate (Confidence: high)'
        })
      });
    });
  });

  it('handles decision submission error', async () => {
    const error = new Error('API Error');
    mockApiRequest.mockRejectedValueOnce(error);

    render(<AdjudicationQueue />);

    await waitFor(() => {
      expect(screen.getByTestId('decision-panel')).toBeInTheDocument();
    });

    const approveBtn = screen.getByTestId('approve-btn');
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to submit decision: API Error');
    });
  });

  it('handles undo decision', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true });

    render(<AdjudicationQueue />);

    await waitFor(() => {
      expect(screen.getByTestId('decision-panel')).toBeInTheDocument();
    });

    // Submit a decision first
    const approveBtn = screen.getByTestId('approve-btn');
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Alert approved');
    });

    // Mock the undo toast interaction
    const undoBtn = screen.getByText('Undo');
    fireEvent.click(undoBtn);

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('/adjudication/1/revert', {
        method: 'POST'
      });
    });

    expect(mockToast.success).toHaveBeenCalledWith('Decision reverted successfully');
  });

  it('filters alerts by status', async () => {
    render(<AdjudicationQueue />);

    await waitFor(() => {
      expect(screen.getByText('Adjudication Queue')).toBeInTheDocument();
    });

    // Click on "All" filter
    const allFilter = screen.getByRole('button', { name: /all/i });
    fireEvent.click(allFilter);

    expect(allFilter).toHaveClass('bg-blue-500');

    // Click on "Flagged" filter
    const flaggedFilter = screen.getByRole('button', { name: /flagged/i });
    fireEvent.click(flaggedFilter);

    expect(flaggedFilter).toHaveClass('bg-blue-500');
  });

  it('sorts alerts by different criteria', async () => {
    render(<AdjudicationQueue />);

    await waitFor(() => {
      expect(screen.getByText('Adjudication Queue')).toBeInTheDocument();
    });

    const sortSelect = screen.getByRole('combobox', { name: /sort by/i });
    fireEvent.change(sortSelect, { target: { value: 'created_at' } });

    expect(sortSelect).toHaveValue('created_at');
  });

  it('toggles sort order', async () => {
    render(<AdjudicationQueue />);

    await waitFor(() => {
      expect(screen.getByText('Adjudication Queue')).toBeInTheDocument();
    });

    const sortButton = screen.getByRole('button', { name: /sort ascending/i });
    fireEvent.click(sortButton);

    expect(sortButton).toHaveAttribute('aria-label', 'Sort descending');
  });

  it('refreshes queue data', async () => {
    render(<AdjudicationQueue />);

    await waitFor(() => {
      expect(screen.getByText('Adjudication Queue')).toBeInTheDocument();
    });

    const refreshBtn = screen.getByRole('button', { name: /refresh queue/i });
    fireEvent.click(refreshBtn);

    // Should trigger refetch
    expect(mockApiRequest).toHaveBeenCalled();
  });

  it('handles keyboard shortcuts', async () => {
    const mockRefetch = vi.fn();
    mockUseHotkeys.mockImplementation((keys, callback) => {
      if (keys === 'ctrl+r,cmd+r') {
        // Simulate the callback being called
        callback({ preventDefault: vi.fn() } as any);
      }
    });

    render(<AdjudicationQueue />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Queue refreshed');
    });
  });

  it('handles WebSocket queue updates', async () => {
    const mockInvalidateQueries = vi.fn();
    const queryClient = new QueryClient();
    queryClient.invalidateQueries = mockInvalidateQueries;

    mockUseWebSocket.mockReturnValue({
      lastMessage: { type: 'queue_updated' }
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AdjudicationQueue />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['adjudication', 'queue']
      });
    });
  });

  it('handles WebSocket alert resolved by another user', async () => {
    const mockInvalidateQueries = vi.fn();
    const queryClient = new QueryClient();
    queryClient.invalidateQueries = mockInvalidateQueries;

    // Mock localStorage
    const mockLocalStorage = {
      getItem: vi.fn(() => JSON.stringify({ id: 'user1' })),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0
    };
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

    mockUseWebSocket.mockReturnValue({
      lastMessage: {
        type: 'alert_resolved',
        payload: { resolver_id: 'user2' }
      }
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AdjudicationQueue />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Alert resolved by another analyst', { icon: '👥' });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['adjudication', 'queue']
      });
    });
  });

  it('handles pagination', async () => {
    const paginatedData = {
      ...mockQueueData,
      pages: 3,
      page: 2
    };
    mockApiRequest.mockResolvedValue(paginatedData);

    render(<AdjudicationQueue />);

    await waitFor(() => {
      expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    });

    const nextBtn = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextBtn);

    expect(mockApiRequest).toHaveBeenCalled();
  });

  it('shows empty state when no alerts', async () => {
    mockApiRequest.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pages: 1
    });

    render(<AdjudicationQueue />);

    await waitFor(() => {
      expect(screen.getByText('No alerts in queue')).toBeInTheDocument();
      expect(screen.getByText('All clear! 🎉')).toBeInTheDocument();
    });
  });

  it('shows no alert selected state', async () => {
    // Mock empty data and no selection
    mockApiRequest.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pages: 1
    });

    render(<AdjudicationQueue />);

    await waitFor(() => {
      expect(screen.getByText('No Alert Selected')).toBeInTheDocument();
      expect(screen.getByText('Select an alert from the queue to review and take action')).toBeInTheDocument();
    });
  });

  it('disables decision buttons during submission', async () => {
    // Mock pending state
    mockApiRequest.mockImplementation(() => new Promise(() => {}));

    render(<AdjudicationQueue />);

    await waitFor(() => {
      expect(screen.getByTestId('decision-panel')).toBeInTheDocument();
    });

    // Decision buttons should be disabled during pending state
    const approveBtn = screen.getByTestId('approve-btn');
    expect(approveBtn).toBeDisabled();
  });

  it('optimistically updates UI on decision submission', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true });

    render(<AdjudicationQueue />);

    await waitFor(() => {
      expect(screen.getByTestId('alert-list')).toBeInTheDocument();
    });

    // Initially 2 alerts
    expect(screen.getAllByTestId(/^alert-item-/)).toHaveLength(2);

    const approveBtn = screen.getByTestId('approve-btn');
    fireEvent.click(approveBtn);

    await waitFor(() => {
      // Should optimistically remove the alert
      expect(screen.getAllByTestId(/^alert-item-/)).toHaveLength(1);
    });
  });

  it('reverts optimistic updates on error', async () => {
    const error = new Error('Network error');
    mockApiRequest.mockRejectedValueOnce(error);

    render(<AdjudicationQueue />);

    await waitFor(() => {
      expect(screen.getByTestId('alert-list')).toBeInTheDocument();
    });

    const approveBtn = screen.getByTestId('approve-btn');
    fireEvent.click(approveBtn);

    // Should revert the optimistic update on error
    await waitFor(() => {
      expect(screen.getAllByTestId(/^alert-item-/)).toHaveLength(2);
    });
  });
});