import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BulkActions } from '../../../components/cases/BulkActions';

describe('BulkActions', () => {
  it('renders nothing when no items selected', () => {
    const { container } = render(
      <BulkActions selectedCount={0} onClearSelection={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders selected count and buttons when items selected', () => {
    render(
      <BulkActions selectedCount={3} onClearSelection={() => {}} />
    );

    expect(screen.getByText('3 selected')).toBeInTheDocument();
    expect(screen.getByText('Clear Selection')).toBeInTheDocument();
  });
});