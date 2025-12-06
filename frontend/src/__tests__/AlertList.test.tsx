import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertList } from '../components/adjudication/AlertList';

const mockAlerts = [
  {
    id: 'alert-1',
    subject_name: 'John Doe',
    risk_score: 85,
    triggered_rules: ['High Amount', 'Frequent Transactions'],
    created_at: '2024-01-01T10:00:00Z',
    status: 'pending' as const,
  },
  {
    id: 'alert-2',
    subject_name: 'Jane Smith',
    risk_score: 45,
    triggered_rules: ['Unusual Pattern'],
    created_at: '2024-01-01T11:00:00Z',
    status: 'flagged' as const,
  },
];

describe('AlertList', () => {
  it('renders alerts correctly', () => {
    const onSelect = vi.fn();
    render(<AlertList alerts={mockAlerts} selectedId={null} onSelect={onSelect} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Risk: 85')).toBeInTheDocument();
    expect(screen.getByText('Risk: 45')).toBeInTheDocument();
  });

  it('displays triggered rules', () => {
    const onSelect = vi.fn();
    render(<AlertList alerts={mockAlerts} selectedId={null} onSelect={onSelect} />);

    expect(screen.getByText('High Amount')).toBeInTheDocument();
    expect(screen.getByText('Frequent Transactions')).toBeInTheDocument();
    expect(screen.getByText('Unusual Pattern')).toBeInTheDocument();
  });

  it('shows truncated rules count when more than 2 rules', () => {
    const alertWithManyRules = {
      ...mockAlerts[0],
      triggered_rules: ['Rule 1', 'Rule 2', 'Rule 3', 'Rule 4'],
    };
    const onSelect = vi.fn();
    render(<AlertList alerts={[alertWithManyRules]} selectedId={null} onSelect={onSelect} />);

    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('calls onSelect when alert is clicked', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<AlertList alerts={mockAlerts} selectedId={null} onSelect={onSelect} />);

    await user.click(screen.getByText('John Doe'));
    expect(onSelect).toHaveBeenCalledWith('alert-1');
  });

  it('calls onSelect when Enter key is pressed', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<AlertList alerts={mockAlerts} selectedId={null} onSelect={onSelect} />);

    const alertElement = screen.getByRole('article', { name: /Alert from John Doe/ });
    alertElement.focus();
    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledWith('alert-1');
  });

  it('calls onSelect when Space key is pressed', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<AlertList alerts={mockAlerts} selectedId={null} onSelect={onSelect} />);

    const alertElement = screen.getByRole('article', { name: /Alert from John Doe/ });
    alertElement.focus();
    await user.keyboard(' ');

    expect(onSelect).toHaveBeenCalledWith('alert-1');
  });

  it('applies selected styling when alert is selected', () => {
    const onSelect = vi.fn();
    render(<AlertList alerts={mockAlerts} selectedId="alert-1" onSelect={onSelect} />);

    const selectedAlert = screen.getByRole('article', { name: /Alert from John Doe/ });
    expect(selectedAlert).toHaveAttribute('aria-selected', 'true');
  });

  it('displays correct risk score colors', () => {
    const onSelect = vi.fn();
    render(<AlertList alerts={mockAlerts} selectedId={null} onSelect={onSelect} />);

    // High risk (>80) should have red styling
    const highRiskElement = screen.getByText('Risk: 85').closest('div');
    expect(highRiskElement).toHaveClass('bg-red-500/20');

    // Medium risk (45) should have yellow styling
    const mediumRiskElement = screen.getByText('Risk: 45').closest('div');
    expect(mediumRiskElement).toHaveClass('bg-yellow-500/20');
  });

  it('shows alert ID truncated', () => {
    const onSelect = vi.fn();
    render(<AlertList alerts={mockAlerts} selectedId={null} onSelect={onSelect} />);

    expect(screen.getByText('#alert-1')).toBeInTheDocument();
  });

  it('displays formatted time', () => {
    const onSelect = vi.fn();
    render(<AlertList alerts={mockAlerts} selectedId={null} onSelect={onSelect} />);

    // Should show time in 12-hour format with AM/PM
    expect(screen.getByText(/07:00 PM/)).toBeInTheDocument();
    expect(screen.getByText(/08:00 PM/)).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    const onSelect = vi.fn();
    render(<AlertList alerts={mockAlerts} selectedId="alert-1" onSelect={onSelect} />);

    const list = screen.getByRole('feed', { name: 'Alert Queue' });
    expect(list).toBeInTheDocument();

    const selectedAlert = screen.getByRole('article', { name: /Alert from John Doe/ });
    expect(selectedAlert).toHaveAttribute('aria-selected', 'true');
    expect(selectedAlert).toHaveAttribute('aria-posinset', '1');
    expect(selectedAlert).toHaveAttribute('aria-setsize', '2');
  });

  it('updates screen reader status', () => {
    const onSelect = vi.fn();
    const { rerender } = render(<AlertList alerts={mockAlerts} selectedId={null} onSelect={onSelect} />);

    expect(screen.getByText('2 alerts in queue')).toBeInTheDocument();

    rerender(<AlertList alerts={mockAlerts} selectedId="alert-1" onSelect={onSelect} />);
    expect(screen.getByText('Alert 1 of 2 selected')).toBeInTheDocument();
  });
});