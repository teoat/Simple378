import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import { BrowserRouter } from 'react-router-dom';

// Mock the useAuth hook since we're testing a component that uses it
vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      logout: vi.fn(),
    }),
  };
});

describe('Header Component', () => {
  it('renders the platform title', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    expect(screen.getByText('Fraud Detection Platform')).toBeInTheDocument();
  });

  it('renders all action buttons with correct aria-labels', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    expect(screen.getByLabelText('View notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('View profile')).toBeInTheDocument();
    expect(screen.getByLabelText('Logout')).toBeInTheDocument();
  });
});
