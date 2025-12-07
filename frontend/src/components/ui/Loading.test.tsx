import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../../test/test-utils';
import { LoadingSpinner, LoadingState } from './Loading';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner data-testid="loading-spinner" />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin', 'h-6', 'w-6');
  });

  it('renders with small size', () => {
    render(<LoadingSpinner size="sm" data-testid="small-spinner" />);
    const spinner = screen.getByTestId('small-spinner');
    expect(spinner).toHaveClass('h-4', 'w-4');
  });

  it('renders with large size', () => {
    render(<LoadingSpinner size="lg" data-testid="large-spinner" />);
    const spinner = screen.getByTestId('large-spinner');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('renders with medium size (default)', () => {
    render(<LoadingSpinner size="md" data-testid="medium-spinner" />);
    const spinner = screen.getByTestId('medium-spinner');
    expect(spinner).toHaveClass('h-6', 'w-6');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-spinner" data-testid="custom-spinner" />);
    const spinner = screen.getByTestId('custom-spinner');
    expect(spinner).toHaveClass('custom-spinner');
  });

  it('has correct accessibility attributes', () => {
    render(<LoadingSpinner data-testid="accessible-spinner" />);
    const spinner = screen.getByTestId('accessible-spinner');
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('LoadingState', () => {
  it('renders with default message', () => {
    render(<LoadingState />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    // Check that spinner is present (it has aria-hidden=true)
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingState message="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('renders spinner with correct size', () => {
    render(<LoadingState />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-8', 'w-8'); // Large spinner for LoadingState
  });

  it('applies custom className', () => {
    render(<LoadingState className="custom-loading" />);
    const container = screen.getByText('Loading...').parentElement;
    expect(container).toHaveClass('custom-loading');
  });

  it('has proper container structure', () => {
    render(<LoadingState />);
    const container = screen.getByText('Loading...').parentElement;
    expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'py-8');
  });

  it('renders both spinner and message', () => {
    render(<LoadingState message="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});