import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CaseTable } from '../../../components/cases/CaseTable';

const mockCases = [
  {
    id: '1',
    subject_name: 'John Doe',
    risk_score: 0.8,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    assigned_to: 'Alice',
  },
  {
    id: '2',
    subject_name: 'Jane Smith',
    risk_score: 0.3,
    status: 'inactive',
    created_at: '2024-01-02T00:00:00Z',
    assigned_to: 'Bob',
  },
];

describe('CaseTable', () => {
  const defaultProps = {
    cases: mockCases,
    sortBy: '',
    sortOrder: 'desc' as const,
    onSort: vi.fn(),
    selectedCases: new Set<string>(),
    onSelectCase: vi.fn(),
    onSelectAll: vi.fn(),
    hoveredCase: null,
    onHoverCase: vi.fn(),
    mousePos: { x: 0, y: 0 },
    onMouseMove: vi.fn(),
  };

  it('renders case data correctly', () => {
    render(
      <MemoryRouter>
        <CaseTable {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('handles case selection', () => {
    const onSelectCase = vi.fn();
    render(
      <MemoryRouter>
        <CaseTable {...defaultProps} onSelectCase={onSelectCase} />
      </MemoryRouter>
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // First case checkbox

    expect(onSelectCase).toHaveBeenCalledWith('1');
  });

  it('handles select all', () => {
    const onSelectAll = vi.fn();
    render(
      <MemoryRouter>
        <CaseTable {...defaultProps} onSelectAll={onSelectAll} />
      </MemoryRouter>
    );

    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(selectAllCheckbox);

    expect(onSelectAll).toHaveBeenCalledWith(true);
  });

  it('calls onSort when column header is clicked', () => {
    const onSort = vi.fn();
    render(
      <MemoryRouter>
        <CaseTable {...defaultProps} onSort={onSort} />
      </MemoryRouter>
    );

    const subjectHeader = screen.getByText('Subject');
    fireEvent.click(subjectHeader);

    expect(onSort).toHaveBeenCalledWith('subject_name');
  });
});