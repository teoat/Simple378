import { render, screen } from '@testing-library/react';
import { AuthGuard } from './AuthGuard';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import * as AuthContextModule from '../../context/AuthContext';

// Mock useAuth
const useAuthSpy = vi.spyOn(AuthContextModule, 'useAuth');

describe('AuthGuard', () => {
  it('renders children when authenticated', () => {
    useAuthSpy.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    useAuthSpy.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/protected"
            element={
              <AuthGuard>
                <div>Protected Content</div>
              </AuthGuard>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders loading state', () => {
    useAuthSpy.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
