import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CaseDetail from '../pages/CaseDetail';

describe('CaseDetail Page', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('should render loading state initially', () => {
    renderWithProviders(<CaseDetail caseId="123" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render case information when loaded', async () => {
    vi.mock('../lib/api', () => ({
      api: {
        get: vi.fn().mockResolvedValue({
          id: '123',
          case_number: 'CASE-001',
          title: 'Test Case',
          description: 'Test Description',
          status: 'open',
          priority: 'high',
        }),
      },
    }));

    renderWithProviders(<CaseDetail caseId="123" />);
    
    await waitFor(() => {
      expect(screen.getByText('CASE-001')).toBeInTheDocument();
      expect(screen.getByText('Test Case')).toBeInTheDocument();
    });
  });

  it('should handle loading error gracefully', async () => {
    vi.mock('../lib/api', () => ({
      api: {
        get: vi.fn().mockRejectedValue(new Error('Failed to load case')),
      },
    }));

    renderWithProviders(<CaseDetail caseId="123" />);
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('should enable edit mode when edit button clicked', async () => {
    vi.mock('../lib/api', () => ({
      api: {
        get: vi.fn().mockResolvedValue({
          id: '123',
          title: 'Test Case',
          status: 'open',
        }),
      },
    }));

    const user = userEvent.setup();
    renderWithProviders(<CaseDetail caseId="123" />);
    
    await waitFor(() => {
      const editButton = screen.getByRole('button', { name: /edit/i });
      expect(editButton).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    expect(screen.getByRole('textbox', { name: /title/i })).toBeInTheDocument();
  });

  it('should submit form when save clicked', async () => {
    const mockUpdate = vi.fn().mockResolvedValue({ success: true });
    
    vi.mock('../lib/api', () => ({
      api: {
        get: vi.fn().mockResolvedValue({
          id: '123',
          title: 'Test Case',
          status: 'open',
        }),
        put: mockUpdate,
      },
    }));

    const user = userEvent.setup();
    renderWithProviders(<CaseDetail caseId="123" />);

    await waitFor(() => {
      const editButton = screen.getByRole('button', { name: /edit/i });
      expect(editButton).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    const titleInput = screen.getByRole('textbox', { name: /title/i });
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Case');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  it('should display all required tabs', async () => {
    vi.mock('../lib/api', () => ({
      api: {
        get: vi.fn().mockResolvedValue({
          id: '123',
          title: 'Test Case',
          status: 'open',
        }),
      },
    }));

    renderWithProviders(<CaseDetail caseId="123" />);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /details/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /events/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /evidence/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /audit/i })).toBeInTheDocument();
    });
  });

  it('should switch tabs correctly', async () => {
    vi.mock('../lib/api', () => ({
      api: {
        get: vi.fn().mockResolvedValue({
          id: '123',
          title: 'Test Case',
          status: 'open',
        }),
      },
    }));

    const user = userEvent.setup();
    renderWithProviders(<CaseDetail caseId="123" />);

    const eventsTab = await screen.findByRole('tab', { name: /events/i });
    await user.click(eventsTab);

    expect(eventsTab).toHaveAttribute('aria-selected', 'true');
  });
});
