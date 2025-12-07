import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test/test-utils';
import { Login } from './Login';
import { AuthProvider } from '../context/AuthContext';

// Mock the auth context
const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false,
    isLoading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Mail: () => <div data-testid="mail-icon" />,
  Lock: () => <div data-testid="lock-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
}));

describe('Login Page', () => {
  beforeEach(() => {
    mockLogin.mockClear();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders login form with all required elements', () => {
      render(<Login />);

      // Check main elements
      expect(screen.getByText('Simple378')).toBeInTheDocument();
      expect(screen.getByText('Fraud Detection Platform')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument();

      // Check form elements
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument();

      // Check social login buttons
      expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /microsoft/i })).toBeInTheDocument();
    });

    it('renders skip link for accessibility', () => {
      render(<Login />);

      const skipLink = screen.getByRole('link', { name: /skip to main content/i });
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('has proper ARIA landmarks', () => {
      render(<Login />);

      expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
      expect(screen.getByRole('region')).toHaveAttribute('aria-labelledby', 'login-heading');
    });
  });

  describe('Form Validation', () => {
    it('shows error for empty email', async () => {
      render(<Login />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Email is required');
      });
    });

    it('shows error for empty password', async () => {
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Password is required');
      });
    });

    it('shows error for password too short', async () => {
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: '123' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Password must be at least 8 characters long');
      });
    });

    it('validates email format', () => {
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
    });

    it('validates password requirements', () => {
      render(<Login />);

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('minLength', '8');
    });
  });

  describe('Authentication Flow', () => {
    it('calls login function with correct credentials', async () => {
      mockLogin.mockResolvedValueOnce(undefined);

      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('navigates to dashboard on successful login', async () => {
      mockLogin.mockResolvedValueOnce(undefined);

      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('shows loading state during authentication', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Check loading state
      expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
      expect(screen.getByText('Signing you in...')).toBeInTheDocument();

      // Wait for completion
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });
    });

    it('handles authentication errors gracefully', async () => {
      const errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      mockLogin.mockRejectedValueOnce(new Error(errorMessage));

      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
      });

      // Button should be re-enabled
      expect(screen.getByRole('button', { name: /sign in/i })).not.toBeDisabled();
    });
  });

  describe('Password Visibility', () => {
    it('toggles password visibility', () => {
      render(<Login />);

      const passwordInput = screen.getByLabelText(/password/i);
      const toggleButton = screen.getByRole('button', { name: /show password/i });

      // Initially password is hidden
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(toggleButton).toHaveAttribute('aria-pressed', 'false');

      // Click to show password
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
      expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
      expect(toggleButton).toHaveAttribute('aria-label', 'Hide password');

      // Click to hide password again
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(toggleButton).toHaveAttribute('aria-pressed', 'false');
      expect(toggleButton).toHaveAttribute('aria-label', 'Show password');
    });
  });

  describe('Remember Me', () => {
    it('allows toggling remember me option', () => {
      render(<Login />);

      const rememberCheckbox = screen.getByRole('checkbox', { name: /remember me/i });

      expect(rememberCheckbox).not.toBeChecked();

      fireEvent.click(rememberCheckbox);
      expect(rememberCheckbox).toBeChecked();

      fireEvent.click(rememberCheckbox);
      expect(rememberCheckbox).not.toBeChecked();
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports tab navigation through form elements', () => {
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const rememberCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Focus should start on email input
      emailInput.focus();
      expect(document.activeElement).toBe(emailInput);

      // Tab to password
      fireEvent.keyDown(emailInput, { key: 'Tab' });
      expect(document.activeElement).toBe(passwordInput);

      // Tab to password toggle
      fireEvent.keyDown(passwordInput, { key: 'Tab' });
      // Tab to remember me checkbox
      fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
      expect(document.activeElement).toBe(rememberCheckbox);

      // Tab to submit button
      fireEvent.keyDown(rememberCheckbox, { key: 'Tab' });
      expect(document.activeElement).toBe(submitButton);
    });
  });

  describe('Accessibility', () => {
    it('provides proper form labels and descriptions', () => {
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute('aria-describedby', 'email-help');
      expect(passwordInput).toHaveAttribute('aria-describedby', 'password-help');

      expect(screen.getByText('Enter your email address to sign in')).toHaveClass('sr-only');
      expect(screen.getByText('Enter your password (minimum 8 characters)')).toHaveClass('sr-only');
    });

    it('announces form errors to screen readers', async () => {
      render(<Login />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorDiv = screen.getByRole('alert');
        expect(errorDiv).toHaveAttribute('aria-live', 'polite');
        expect(errorDiv).toHaveAttribute('id', 'login-error');
      });
    });

    it('provides proper autocomplete attributes', () => {
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute('autocomplete', 'email');
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });
  });

  describe('Social Login', () => {
    it('renders social login buttons (placeholders)', () => {
      render(<Login />);

      const googleButton = screen.getByRole('button', { name: /google/i });
      const microsoftButton = screen.getByRole('button', { name: /microsoft/i });

      expect(googleButton).toBeInTheDocument();
      expect(microsoftButton).toBeInTheDocument();

      // These are currently non-functional placeholders
      expect(googleButton).toBeDisabled();
      expect(microsoftButton).toBeDisabled();
    });
  });

  describe('Error Recovery', () => {
    it('clears previous errors on new form submission', async () => {
      // First submission with error
      render(<Login />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Second submission should clear previous error
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      // Error should be cleared when user starts typing
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});</content>
<parameter name="filePath">frontend/src/pages/Login.test.tsx