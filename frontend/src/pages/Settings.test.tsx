import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test/test-utils';
import { Settings } from './Settings';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock fetch globally for useTenant hook
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock dependencies
vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock('react-hot-toast', () => ({
  default: vi.fn(),
  __esModule: true
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  }
}));

// Import mocks after mocking
import { api } from '../lib/api';
import { useTenant } from '../hooks/useTenant';
import toast from 'react-hot-toast';

describe('Settings', () => {
  const mockApi = vi.mocked(api);
  const mockUseTenant = vi.mocked(useTenant);
  const mockToast = vi.mocked(toast);

  const mockProfile = {
    id: 'user1',
    full_name: 'John Doe',
    email: 'john@example.com',
    role: 'analyst',
    department: 'Fraud Prevention',
    phone_number: '+1234567890'
  };

  const expectedProfileForm = {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'analyst',
    department: 'Fraud Prevention',
    phone: '+1234567890'
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock fetch for tenant config
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({
        id: 'test-tenant',
        name: 'Test Tenant',
        features: ['advanced-analytics', 'ai-assistant'],
        region: 'us-east'
      })
    });

    // Mock profile endpoint
    mockApi.get.mockImplementation((url: string) => {
      if (url === '/users/profile') {
        return Promise.resolve(mockProfile);
      }
      if (url === '/audit-logs/?limit=5') {
        return Promise.resolve({ items: [] });
      }
      return Promise.resolve({});
    });

    // Mock other API methods
    mockApi.post.mockResolvedValue({ success: true });
    mockApi.put.mockResolvedValue({ success: true });
    mockApi.patch.mockResolvedValue({ success: true });
    mockApi.delete.mockResolvedValue({ success: true });
  });

  it('renders settings page with default profile tab', async () => {
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('Team')).toBeInTheDocument();
  });

  it('displays profile information when profile tab is active', async () => {
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Profile tab should be active by default
    await waitFor(() => {
      expect(screen.getByText('Profile Settings')).toBeInTheDocument();
    });
  });

  it('allows switching between tabs', async () => {
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Click on Security tab
    const securityTab = screen.getByText('Security');
    fireEvent.click(securityTab);

    // Should show security settings
    expect(screen.getByText('Change Password')).toBeInTheDocument();
  });

  it('allows updating profile information', async () => {
    mockApi.put.mockResolvedValue({ success: true });

    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    // Update name
    const nameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

    // Click save
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockApi.put).toHaveBeenCalledWith('/users/profile', expect.objectContaining({
        name: 'Jane Doe'
      }));
    });

    expect(mockToast).toHaveBeenCalledWith('Profile updated successfully');
  });

  it('handles profile update error', async () => {
    const error = new Error('Update failed');
    mockApi.put.mockRejectedValue(error);

    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Failed to update profile');
    });
  });

  it('allows changing password', async () => {
    mockApi.post.mockResolvedValue({ success: true });

    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Switch to security tab
    const securityTab = screen.getByText('Security');
    fireEvent.click(securityTab);

    // Fill password fields
    const currentPasswordInput = screen.getByPlaceholderText('Current password');
    const newPasswordInput = screen.getByPlaceholderText('New password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm new password');

    fireEvent.change(currentPasswordInput, { target: { value: 'oldpass' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpass123' } });

    // Click change password
    const changeButton = screen.getByRole('button', { name: /change password/i });
    fireEvent.click(changeButton);

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/users/change-password', {
        currentPassword: 'oldpass',
        newPassword: 'newpass123'
      });
    });

    expect(mockToast).toHaveBeenCalledWith('Password changed successfully');
  });

  it('validates password confirmation', async () => {
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Switch to security tab
    const securityTab = screen.getByText('Security');
    fireEvent.click(securityTab);

    // Fill password fields with mismatched confirmation
    const newPasswordInput = screen.getByPlaceholderText('New password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm new password');

    fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpass' } });

    // Click change password
    const changeButton = screen.getByRole('button', { name: /change password/i });
    fireEvent.click(changeButton);

    expect(mockToast).toHaveBeenCalledWith('Passwords do not match');
  });

  it('toggles password visibility', async () => {
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Switch to security tab
    const securityTab = screen.getByText('Security');
    fireEvent.click(securityTab);

    const passwordInput = screen.getByPlaceholderText('New password');
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click show password
    const toggleButton = screen.getByRole('button', { name: /show password/i });
    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('allows toggling two-factor authentication', async () => {
    mockApi.post.mockResolvedValue({ success: true });

    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Switch to security tab
    const securityTab = screen.getByText('Security');
    fireEvent.click(securityTab);

    // Toggle 2FA
    const twoFactorToggle = screen.getByRole('checkbox', { name: /two-factor authentication/i });
    fireEvent.click(twoFactorToggle);

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/users/2fa/toggle', { enabled: true });
    });
  });

  it('allows changing theme settings', async () => {
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Switch to theme tab
    const themeTab = screen.getByText('Theme');
    fireEvent.click(themeTab);

    // Change theme
    const darkThemeButton = screen.getByRole('button', { name: /dark/i });
    fireEvent.click(darkThemeButton);

    expect(darkThemeButton).toHaveClass('bg-blue-500');
  });

  it('allows configuring notification preferences', async () => {
    mockApi.put.mockResolvedValue({ success: true });

    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Switch to notifications tab
    const notificationsTab = screen.getByText('Notifications');
    fireEvent.click(notificationsTab);

    // Toggle email notifications
    const emailCheckbox = screen.getByRole('checkbox', { name: /email.*new case/i });
    fireEvent.click(emailCheckbox);

    // Save settings
    const saveButton = screen.getByRole('button', { name: /save notification settings/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockApi.put).toHaveBeenCalledWith('/users/notifications', expect.any(Object));
    });
  });

  it('shows team management for admin users', async () => {
    const adminProfile = { ...mockProfile, role: 'admin' };
    mockApi.get.mockResolvedValue(adminProfile);

    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Switch to team tab
    const teamTab = screen.getByText('Team');
    fireEvent.click(teamTab);

    expect(screen.getByText('Team Management')).toBeInTheDocument();
  });

  it('shows API keys management', async () => {
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Switch to API keys tab
    const apiKeysTab = screen.getByText('API Keys');
    fireEvent.click(apiKeysTab);

    expect(screen.getByText('API Key Management')).toBeInTheDocument();
  });

  it('allows creating new API key', async () => {
    mockApi.post.mockResolvedValue({
      id: 'key1',
      name: 'Test Key',
      key: 'sk-test123',
      createdAt: new Date().toISOString(),
      permissions: ['read']
    });

    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Switch to API keys tab
    const apiKeysTab = screen.getByText('API Keys');
    fireEvent.click(apiKeysTab);

    // Fill key name
    const nameInput = screen.getByPlaceholderText('API Key Name');
    fireEvent.change(nameInput, { target: { value: 'Test Key' } });

    // Click create
    const createButton = screen.getByRole('button', { name: /create api key/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/users/api-keys', {
        name: 'Test Key',
        permissions: ['read']
      });
    });
  });

  it('allows copying API key to clipboard', async () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn()
      }
    });

    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Switch to API keys tab
    const apiKeysTab = screen.getByText('API Keys');
    fireEvent.click(apiKeysTab);

    // Mock an existing key in the component
    // This would normally come from an API call, but for testing we'll assume it's rendered

    // Click copy button (assuming it exists)
    const copyButtons = screen.getAllByRole('button', { name: /copy/i });
    if (copyButtons.length > 0) {
      fireEvent.click(copyButtons[0]);
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    }
  });

  it('shows enterprise settings when tenant feature is enabled', async () => {
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Enterprise tab should be visible
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });

  it('handles tenant-specific settings', async () => {
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Switch to enterprise tab
    const enterpriseTab = screen.getByText('Enterprise');
    fireEvent.click(enterpriseTab);

    expect(screen.getByText('Test Tenant')).toBeInTheDocument();
  });

  it('shows audit log for admin users', async () => {
    const adminProfile = { ...mockProfile, role: 'admin' };
    mockApi.get.mockResolvedValue(adminProfile);

    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Switch to enterprise tab
    const enterpriseTab = screen.getByText('Enterprise');
    fireEvent.click(enterpriseTab);

    expect(screen.getByText('Audit Log')).toBeInTheDocument();
  });

  it('validates email format in profile update', async () => {
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    });

    const emailInput = screen.getByDisplayValue('john@example.com');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    expect(mockToast).toHaveBeenCalledWith('Please enter a valid email address');
  });

  it('handles API errors gracefully', async () => {
    mockApi.get.mockRejectedValue(new Error('Network error'));

    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Component should still render even with API errors
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('persists form state during navigation', async () => {
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    // Update name
    const nameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

    // Switch tabs
    const securityTab = screen.getByText('Security');
    fireEvent.click(securityTab);

    // Switch back
    const profileTab = screen.getByText('Profile');
    fireEvent.click(profileTab);

    // Name should still be updated
    expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
  });
});