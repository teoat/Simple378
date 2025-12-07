import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Create a custom render function that includes providers
const AllTheProviders = ({ children, initialEntries = ['/'] }: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    initialEntries?: string[];
  },
) => {
  const { initialEntries, ...renderOptions } = options || {};
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders initialEntries={initialEntries}>{children}</AllTheProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Helper to create mock implementations
export const createMockQuery = (data: any, isLoading = false, error?: any) => ({
  data,
  isLoading,
  error,
  refetch: vi.fn(),
});

export const createMockMutation = () => ({
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  isLoading: false,
  error: null,
  data: null,
  reset: vi.fn(),
});

// Common test utilities
export const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'analyst',
  ...overrides,
});

export const createMockCase = (overrides = {}) => ({
  id: '1',
  title: 'Test Fraud Case',
  status: 'open',
  risk_score: 85,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
  description: 'Test case description',
  ...overrides,
});

export const createMockAlert = (overrides = {}) => ({
  id: '1',
  title: 'High Risk Transaction',
  message: 'Suspicious transaction detected',
  risk_score: 95,
  status: 'pending',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Mock utilities
export const mockApiResponse = (data: any) => ({
  data,
  status: 200,
  statusText: 'OK',
});

export const mockApiError = (error: any) => {
  throw error;
};

// Common test data
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'analyst',
};

export const mockCase = {
  id: '1',
  title: 'Test Fraud Case',
  status: 'open',
  risk_score: 85,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
  description: 'Test case description',
};

export const mockAlert = {
  id: '1',
  title: 'High Risk Transaction',
  message: 'Suspicious transaction detected',
  risk_score: 95,
  status: 'pending',
  created_at: '2024-01-01T00:00:00Z',
};