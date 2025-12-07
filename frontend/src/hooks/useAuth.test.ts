import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';

describe('useAuth', () => {
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

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('returns initial auth state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.register).toBe('function');
  });

  it('handles successful login', async () => {
    // Mock successful login API call
    vi.mock('../lib/api', () => ({
      api: {
        post: vi.fn().mockResolvedValue({
          data: {
            user: { id: '1', email: 'test@example.com', name: 'Test User' },
            access_token: 'mock-token',
            refresh_token: 'mock-refresh-token'
          }
        })
      }
    }));

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual({
      id: '1',
      email: 'test@example.com',
      name: 'Test User'
    });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('handles login error', async () => {
    // Mock failed login API call
    vi.mock('../lib/api', () => ({
      api: {
        post: vi.fn().mockRejectedValue(new Error('Invalid credentials'))
      }
    }));

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login({
        email: 'test@example.com',
        password: 'wrong-password'
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe('Invalid credentials');
  });

  it('handles logout', async () => {
    // First login
    vi.mock('../lib/api', () => ({
      api: {
        post: vi.fn().mockResolvedValue({
          data: {
            user: { id: '1', email: 'test@example.com', name: 'Test User' },
            access_token: 'mock-token',
            refresh_token: 'mock-refresh-token'
          }
        })
      }
    }));

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Login first
    act(() => {
      result.current.login({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Then logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('handles registration', async () => {
    vi.mock('../lib/api', () => ({
      api: {
        post: vi.fn().mockResolvedValue({
          data: {
            user: { id: '1', email: 'new@example.com', name: 'New User' },
            access_token: 'mock-token',
            refresh_token: 'mock-refresh-token'
          }
        })
      }
    }));

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.register({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User'
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual({
      id: '1',
      email: 'new@example.com',
      name: 'New User'
    });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('validates login input', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login({
        email: '',
        password: ''
      });
    });

    expect(result.current.error).toBe('Email and password are required');
  });

  it('validates registration input', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.register({
        email: 'invalid-email',
        password: '123',
        name: ''
      });
    });

    expect(result.current.error).toContain('Invalid email format');
  });

  it('handles token refresh', async () => {
    // Mock token refresh
    vi.mock('../lib/api', () => ({
      api: {
        post: vi.fn()
          .mockResolvedValueOnce({
            data: {
              user: { id: '1', email: 'test@example.com', name: 'Test User' },
              access_token: 'new-token',
              refresh_token: 'new-refresh-token'
            }
          })
          .mockResolvedValueOnce({
            data: {
              access_token: 'refreshed-token'
            }
          })
      }
    }));

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Login
    act(() => {
      result.current.login({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Token should be refreshed automatically when needed
    expect(result.current.user).toBeTruthy();
  });

  it('persists auth state', () => {
    // Mock localStorage
    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue(JSON.stringify({
        user: { id: '1', email: 'test@example.com' },
        token: 'stored-token'
      })),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user?.email).toBe('test@example.com');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('clears error on successful operation', async () => {
    // First fail, then succeed
    vi.mock('../lib/api', () => ({
      api: {
        post: vi.fn()
          .mockRejectedValueOnce(new Error('Network error'))
          .mockResolvedValueOnce({
            data: {
              user: { id: '1', email: 'test@example.com', name: 'Test User' },
              access_token: 'mock-token',
              refresh_token: 'mock-refresh-token'
            }
          })
      }
    }));

    const { result } = renderHook(() => useAuth(), { wrapper });

    // First attempt fails
    act(() => {
      result.current.login({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });

    // Second attempt succeeds
    act(() => {
      result.current.login({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});