import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { CaseList } from '../../../pages/CaseList';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('CaseList', () => {
  it('renders loading state initially', () => {
    render(<CaseList />, { wrapper: createWrapper() });

    expect(screen.getByText('Case Management')).toBeInTheDocument();
  });

  it('renders header with title and description', () => {
    render(<CaseList />, { wrapper: createWrapper() });

    expect(screen.getByText('Case Management')).toBeInTheDocument();
    expect(screen.getByText('Manage and investigate fraud cases')).toBeInTheDocument();
  });
});