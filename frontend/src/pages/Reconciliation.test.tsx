import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '../test/test-utils';
import { Reconciliation } from './Reconciliation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock('react-hot-toast', () => ({
  default: vi.fn(),
  __esModule: true
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

// Mock VirtualTransactionList component
vi.mock('../../components/reconciliation/VirtualTransactionList', () => ({
  VirtualTransactionList: vi.fn().mockImplementation(({
    transactions,
    selectedId,
    onSelect,
    onUnmatch,
    colorTheme,
    height
  }: any) => (
    <div data-testid={`transaction-list-${colorTheme}`}>
      <div data-testid="transaction-count">{transactions.length} transactions</div>
      {transactions.map((transaction: any) => (
        <div
          key={transaction.id}
          data-testid={`transaction-${transaction.id}`}
          className={selectedId === transaction.id ? 'selected' : ''}
          onClick={() => onSelect(transaction.id)}
        >
          <div data-testid={`transaction-description-${transaction.id}`}>
            {transaction.description}
          </div>
          <div data-testid={`transaction-amount-${transaction.id}`}>
            ${transaction.amount}
          </div>
          <div data-testid={`transaction-status-${transaction.id}`}>
            {transaction.matchStatus}
          </div>
          {transaction.matchStatus === 'matched' && (
            <button
              data-testid={`unmatch-${transaction.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onUnmatch(transaction.id);
              }}
            >
              Unmatch
            </button>
          )}
        </div>
      ))}
    </div>
  ))
}));

// Import mocks after mocking
import { api } from '../lib/api';
import toast from 'react-hot-toast';

describe('Reconciliation', () => {
  const mockApi = vi.mocked(api);
  const mockToast = vi.mocked(toast);

  const mockInternalTransactions = [
    {
      id: 'int1',
      date: '2024-01-01',
      description: 'Office Supplies Purchase',
      amount: -150.00,
      account: 'Office Expenses',
      category: 'Supplies',
      source: 'internal' as const,
      matchStatus: 'unmatched' as const
    },
    {
      id: 'int2',
      date: '2024-01-02',
      description: 'Client Payment Received',
      amount: 2500.00,
      account: 'Revenue',
      category: 'Income',
      source: 'internal' as const,
      matchStatus: 'matched' as const,
      matchedWith: 'ext1',
      confidence: 0.95
    },
    {
      id: 'int3',
      date: '2024-01-03',
      description: 'Software License',
      amount: -299.99,
      account: 'IT Expenses',
      category: 'Software',
      source: 'internal' as const,
      matchStatus: 'conflict' as const
    }
  ];

  const mockExternalTransactions = [
    {
      id: 'ext1',
      date: '2024-01-02',
      description: 'Payment from Client ABC',
      amount: 2500.00,
      account: 'Checking Account',
      category: 'Deposit',
      source: 'external' as const,
      matchStatus: 'matched' as const,
      matchedWith: 'int2',
      confidence: 0.95
    },
    {
      id: 'ext2',
      date: '2024-01-04',
      description: 'ATM Withdrawal',
      amount: -50.00,
      account: 'Checking Account',
      category: 'Withdrawal',
      source: 'external' as const,
      matchStatus: 'unmatched' as const
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock API responses
    mockApi.get.mockImplementation((url: string) => {
      if (url === '/reconciliation/transactions?source=internal') {
        return Promise.resolve(mockInternalTransactions);
      }
      if (url === '/reconciliation/transactions?source=external') {
        return Promise.resolve(mockExternalTransactions);
      }
      return Promise.resolve([]);
    });

    mockApi.post.mockResolvedValue({ success: true });
    mockApi.delete.mockResolvedValue({ success: true });
  });

  it('renders reconciliation page with loading state initially', () => {
    // Mock loading state
    mockApi.get.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<Reconciliation />);

    expect(screen.getByText('Loading reconciliation data...')).toBeInTheDocument();
  });

  it('renders reconciliation page with transaction data', async () => {
    render(<Reconciliation />);

    await waitFor(() => {
      expect(screen.getByText('Transaction Reconciliation')).toBeInTheDocument();
    });

    // Check header
    expect(screen.getByText('Transaction Reconciliation')).toBeInTheDocument();
    expect(screen.getByText('Use AI/ML to automatically match internal records with external bank statements')).toBeInTheDocument();

    // Check stats cards
    expect(screen.getByText('3')).toBeInTheDocument(); // Internal records
    expect(screen.getByText('2')).toBeInTheDocument(); // External records
    expect(screen.getByText('1')).toBeInTheDocument(); // Matched (appears twice, but we check it exists)

    // Check transaction lists are rendered
    expect(screen.getByTestId('transaction-list-blue')).toBeInTheDocument();
    expect(screen.getByTestId('transaction-list-purple')).toBeInTheDocument();

    // Check transaction counts
    expect(screen.getByText('3 records')).toBeInTheDocument(); // Internal
    expect(screen.getByText('2 records')).toBeInTheDocument(); // External
  });

  it('displays transactions in the correct lists', async () => {
    render(<Reconciliation />);

    await waitFor(() => {
      expect(screen.getByTestId('transaction-list-blue')).toBeInTheDocument();
    });

    // Check internal transactions
    const internalList = screen.getByTestId('transaction-list-blue');
    expect(within(internalList).getByText('3 transactions')).toBeInTheDocument();
    expect(within(internalList).getByTestId('transaction-int1')).toBeInTheDocument();
    expect(within(internalList).getByTestId('transaction-int2')).toBeInTheDocument();
    expect(within(internalList).getByTestId('transaction-int3')).toBeInTheDocument();

    // Check external transactions
    const externalList = screen.getByTestId('transaction-list-purple');
    expect(within(externalList).getByText('2 transactions')).toBeInTheDocument();
    expect(within(externalList).getByTestId('transaction-ext1')).toBeInTheDocument();
    expect(within(externalList).getByTestId('transaction-ext2')).toBeInTheDocument();
  });

  it('filters transactions by view', async () => {
    render(<Reconciliation />);

    await waitFor(() => {
      expect(screen.getByText('Transaction Reconciliation')).toBeInTheDocument();
    });

    // Initially shows all transactions
    expect(screen.getByText('3 records')).toBeInTheDocument(); // Internal
    expect(screen.getByText('2 records')).toBeInTheDocument(); // External

    // Click matched filter
    const matchedButton = screen.getByText('Matched');
    fireEvent.click(matchedButton);

    // Should show only matched transactions
    await waitFor(() => {
      expect(screen.getByText('1 records')).toBeInTheDocument(); // Internal matched
      expect(screen.getByText('1 records')).toBeInTheDocument(); // External matched
    });

    // Click unmatched filter
    const unmatchedButton = screen.getByText('Unmatched');
    fireEvent.click(unmatchedButton);

    // Should show only unmatched transactions
    await waitFor(() => {
      expect(screen.getByText('1 records')).toBeInTheDocument(); // Internal unmatched
      expect(screen.getByText('1 records')).toBeInTheDocument(); // External unmatched
    });

    // Click conflicts filter
    const conflictsButton = screen.getByText('Review');
    fireEvent.click(conflictsButton);

    // Should show conflicts and pending
    await waitFor(() => {
      expect(screen.getByText('1 records')).toBeInTheDocument(); // Internal conflicts
      expect(screen.getByText('0 records')).toBeInTheDocument(); // External conflicts
    });
  });

  it('searches transactions', async () => {
    render(<Reconciliation />);

    await waitFor(() => {
      expect(screen.getByText('Transaction Reconciliation')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search transactions...');

    // Search for "Office"
    fireEvent.change(searchInput, { target: { value: 'Office' } });

    await waitFor(() => {
      expect(screen.getByText('1 records')).toBeInTheDocument(); // Should find 1 internal transaction
    });

    // Search for "Payment"
    fireEvent.change(searchInput, { target: { value: 'Payment' } });

    await waitFor(() => {
      expect(screen.getByText('1 records')).toBeInTheDocument(); // Should find 1 internal transaction
      expect(screen.getByText('1 records')).toBeInTheDocument(); // Should find 1 external transaction
    });

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });

    await waitFor(() => {
      expect(screen.getByText('3 records')).toBeInTheDocument(); // Back to all internal
      expect(screen.getByText('2 records')).toBeInTheDocument(); // Back to all external
    });
  });

  it('allows selecting transactions for manual matching', async () => {
    render(<Reconciliation />);

    await waitFor(() => {
      expect(screen.getByText('Transaction Reconciliation')).toBeInTheDocument();
    });

    // Select internal transaction
    const internalTransaction = screen.getByTestId('transaction-int1');
    fireEvent.click(internalTransaction);

    // Select external transaction
    const externalTransaction = screen.getByTestId('transaction-ext1');
    fireEvent.click(externalTransaction);

    // Check that match preview appears
    expect(screen.getByText('int1')).toBeInTheDocument();
    expect(screen.getByText('ext1')).toBeInTheDocument();
    expect(screen.getByText('Create Match')).toBeInTheDocument();
  });

  it('performs manual matching', async () => {
    render(<Reconciliation />);

    await waitFor(() => {
      expect(screen.getByText('Transaction Reconciliation')).toBeInTheDocument();
    });

    // Select transactions
    fireEvent.click(screen.getByTestId('transaction-int1'));
    fireEvent.click(screen.getByTestId('transaction-ext2'));

    // Click match button
    const matchButton = screen.getByText('Create Match');
    fireEvent.click(matchButton);

    // Check API was called
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/reconciliation/match', {
        internal_id: 'int1',
        external_id: 'ext2'
      });
    });

    // Check success toast
    expect(mockToast.success).toHaveBeenCalledWith('Transactions matched successfully');
  });

  it('performs auto-reconciliation', async () => {
    render(<Reconciliation />);

    await waitFor(() => {
      expect(screen.getByText('Transaction Reconciliation')).toBeInTheDocument();
    });

    const autoMatchButton = screen.getByText('AI Auto-Match');
    fireEvent.click(autoMatchButton);

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/reconciliation/auto-match', {});
    });

    expect(mockToast.success).toHaveBeenCalledWith('Auto-reconciliation complete: 0 matched, 0 conflicts');
  });

  it('allows unmatching transactions', async () => {
    render(<Reconciliation />);

    await waitFor(() => {
      expect(screen.getByText('Transaction Reconciliation')).toBeInTheDocument();
    });

    // Find the matched transaction and click unmatch
    const unmatchButton = screen.getByTestId('unmatch-int2');
    fireEvent.click(unmatchButton);

    await waitFor(() => {
      expect(mockApi.delete).toHaveBeenCalledWith('/reconciliation/match/int2');
    });

    expect(mockToast.success).toHaveBeenCalledWith('Match removed');
  });

  it('calculates and displays correct statistics', async () => {
    render(<Reconciliation />);

    await waitFor(() => {
      expect(screen.getByText('Transaction Reconciliation')).toBeInTheDocument();
    });

    // Check stats (based on our mock data)
    const statElements = screen.getAllByText('1'); // Matched count appears in multiple places
    expect(statElements.length).toBeGreaterThan(0);

    // Check specific stats by their context
    expect(screen.getByText('3')).toBeInTheDocument(); // Internal records
    expect(screen.getByText('2')).toBeInTheDocument(); // External records
    expect(screen.getByText('1')).toBeInTheDocument(); // Matched (int2)
    expect(screen.getByText('1')).toBeInTheDocument(); // Unmatched (int1)
    expect(screen.getByText('1')).toBeInTheDocument(); // Conflicts (int3)
  });

  it('clears selection when clicking clear button', async () => {
    render(<Reconciliation />);

    await waitFor(() => {
      expect(screen.getByText('Transaction Reconciliation')).toBeInTheDocument();
    });

    // Select transactions
    fireEvent.click(screen.getByTestId('transaction-int1'));
    fireEvent.click(screen.getByTestId('transaction-ext1'));

    // Check selection is shown
    expect(screen.getByText('int1')).toBeInTheDocument();
    expect(screen.getByText('ext1')).toBeInTheDocument();

    // Click clear selection
    const clearButton = screen.getByText('Clear Selection');
    fireEvent.click(clearButton);

    // Check selection is cleared
    expect(screen.queryByText('int1')).not.toBeInTheDocument();
    expect(screen.queryByText('ext1')).not.toBeInTheDocument();
  });

  it('disables match button when selections are incomplete', async () => {
    render(<Reconciliation />);

    await waitFor(() => {
      expect(screen.getByText('Transaction Reconciliation')).toBeInTheDocument();
    });

    // Select only internal transaction
    fireEvent.click(screen.getByTestId('transaction-int1'));

    // Match button should be disabled
    const matchButton = screen.getByText('Create Match');
    expect(matchButton).toBeDisabled();

    // Select external transaction
    fireEvent.click(screen.getByTestId('transaction-ext1'));

    // Match button should now be enabled
    expect(matchButton).not.toBeDisabled();
  });
});