import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/test-utils';
import { CaseList } from './CaseList';

describe('CaseList', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(component);
  };

  it('renders loading state initially', () => {
    renderWithProviders(<CaseList />);
    expect(screen.getByText('Loading cases...')).toBeInTheDocument();
  });

  it('displays cases when data is loaded', async () => {
    // Mock successful data loading
    vi.mock('../hooks/useCaseList', () => ({
      useCaseList: () => ({
        cases: [
          {
            id: '1',
            title: 'Fraud Case 1',
            status: 'open',
            risk_score: 85,
            created_at: '2024-01-01',
            updated_at: '2024-01-02'
          },
          {
            id: '2',
            title: 'Fraud Case 2',
            status: 'closed',
            risk_score: 45,
            created_at: '2024-01-01',
            updated_at: '2024-01-02'
          }
        ],
        isLoading: false,
        total: 2,
        page: 1,
        pages: 1
      })
    }));

    renderWithProviders(<CaseList />);

    await waitFor(() => {
      expect(screen.getByText('Fraud Case 1')).toBeInTheDocument();
      expect(screen.getByText('Fraud Case 2')).toBeInTheDocument();
    });
  });

  it('displays case status badges correctly', async () => {
    vi.mock('../hooks/useCaseList', () => ({
      useCaseList: () => ({
        cases: [
          { id: '1', title: 'Open Case', status: 'open', risk_score: 50, created_at: '2024-01-01', updated_at: '2024-01-01' },
          { id: '2', title: 'Closed Case', status: 'closed', risk_score: 50, created_at: '2024-01-01', updated_at: '2024-01-01' },
          { id: '3', title: 'Pending Case', status: 'pending', risk_score: 50, created_at: '2024-01-01', updated_at: '2024-01-01' }
        ],
        isLoading: false,
        total: 3,
        page: 1,
        pages: 1
      })
    }));

    renderWithProviders(<CaseList />);

    await waitFor(() => {
      expect(screen.getByText('open')).toBeInTheDocument();
      expect(screen.getByText('closed')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
    });
  });

  it('displays risk scores with correct colors', async () => {
    vi.mock('../hooks/useCaseList', () => ({
      useCaseList: () => ({
        cases: [
          { id: '1', title: 'High Risk', status: 'open', risk_score: 85, created_at: '2024-01-01', updated_at: '2024-01-01' },
          { id: '2', title: 'Medium Risk', status: 'open', risk_score: 65, created_at: '2024-01-01', updated_at: '2024-01-01' },
          { id: '3', title: 'Low Risk', status: 'open', risk_score: 25, created_at: '2024-01-01', updated_at: '2024-01-01' }
        ],
        isLoading: false,
        total: 3,
        page: 1,
        pages: 1
      })
    }));

    renderWithProviders(<CaseList />);

    await waitFor(() => {
      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText('65')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });
  });

  it('shows empty state when no cases', async () => {
    vi.mock('../hooks/useCaseList', () => ({
      useCaseList: () => ({
        cases: [],
        isLoading: false,
        total: 0,
        page: 1,
        pages: 0
      })
    }));

    renderWithProviders(<CaseList />);

    await waitFor(() => {
      expect(screen.getByText('No cases found')).toBeInTheDocument();
    });
  });

  it('handles search functionality', async () => {
    vi.mock('../hooks/useCaseList', () => ({
      useCaseList: () => ({
        cases: [
          { id: '1', title: 'Test Case', status: 'open', risk_score: 50, created_at: '2024-01-01', updated_at: '2024-01-01' }
        ],
        isLoading: false,
        total: 1,
        page: 1,
        pages: 1
      })
    }));

    renderWithProviders(<CaseList />);

    await waitFor(() => {
      expect(screen.getByText('Test Case')).toBeInTheDocument();
    });

    // Search input should be present
    const searchInput = screen.getByPlaceholderText(/search cases/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('displays pagination when multiple pages', async () => {
    vi.mock('../hooks/useCaseList', () => ({
      useCaseList: () => ({
        cases: [
          { id: '1', title: 'Case 1', status: 'open', risk_score: 50, created_at: '2024-01-01', updated_at: '2024-01-01' }
        ],
        isLoading: false,
        total: 25,
        page: 1,
        pages: 3
      })
    }));

    renderWithProviders(<CaseList />);

    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument(); // Total count
      expect(screen.getByText('1 of 3')).toBeInTheDocument(); // Page info
    });
  });

  it('allows creating new case', async () => {
    vi.mock('../hooks/useCaseList', () => ({
      useCaseList: () => ({
        cases: [],
        isLoading: false,
        total: 0,
        page: 1,
        pages: 0
      })
    }));

    renderWithProviders(<CaseList />);

    await waitFor(() => {
      const createButton = screen.getByRole('button', { name: /create case/i });
      expect(createButton).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    vi.mock('../hooks/useCaseList', () => ({
      useCaseList: () => ({
        cases: [],
        isLoading: false,
        error: 'Failed to load cases',
        total: 0,
        page: 1,
        pages: 0
      })
    }));

    renderWithProviders(<CaseList />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load cases')).toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', async () => {
    vi.mock('../hooks/useCaseList', () => ({
      useCaseList: () => ({
        cases: [
          { id: '1', title: 'Accessible Case', status: 'open', risk_score: 50, created_at: '2024-01-01', updated_at: '2024-01-01' }
        ],
        isLoading: false,
        total: 1,
        page: 1,
        pages: 1
      })
    }));

    renderWithProviders(<CaseList />);

    await waitFor(() => {
      // Check for proper heading structure
      const heading = screen.getByRole('heading', { name: /cases/i });
      expect(heading).toBeInTheDocument();

      // Check for table structure
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
  });
});