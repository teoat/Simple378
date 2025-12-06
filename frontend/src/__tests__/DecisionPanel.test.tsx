import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DecisionPanel } from '../components/adjudication/DecisionPanel';

describe('DecisionPanel', () => {
  const mockOnDecision = vi.fn();

  beforeEach(() => {
    mockOnDecision.mockClear();
  });

  it('renders decision buttons initially', () => {
    render(<DecisionPanel onDecision={mockOnDecision} />);

    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
    expect(screen.getByText('Escalate')).toBeInTheDocument();
  });

  it('shows keyboard shortcuts on buttons', () => {
    render(<DecisionPanel onDecision={mockOnDecision} />);

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('R')).toBeInTheDocument();
    expect(screen.getByText('E')).toBeInTheDocument();
  });

  it('selects decision when button is clicked', async () => {
    const user = userEvent.setup();
    render(<DecisionPanel onDecision={mockOnDecision} />);

    await user.click(screen.getByText('Approve'));

    expect(screen.getByText('Confirm Approve')).toBeInTheDocument();
    expect(screen.getByText('Submit Decision')).toBeInTheDocument();
  });

  it('handles keyboard shortcuts for decision selection', async () => {
    const user = userEvent.setup();
    render(<DecisionPanel onDecision={mockOnDecision} />);

    await user.keyboard('a');

    expect(screen.getByText('Confirm Approve')).toBeInTheDocument();
  });

  it('does not respond to keyboard shortcuts when disabled', async () => {
    const user = userEvent.setup();
    render(<DecisionPanel onDecision={mockOnDecision} disabled={true} />);

    await user.keyboard('a');

    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.queryByText('Confirm Approve')).not.toBeInTheDocument();
  });

  it('shows confirmation form with selected decision', async () => {
    const user = userEvent.setup();
    render(<DecisionPanel onDecision={mockOnDecision} />);

    await user.click(screen.getByText('Reject'));

    expect(screen.getByText('Confirm Reject')).toBeInTheDocument();
    expect(screen.getByText('Confidence Level')).toBeInTheDocument();
    expect(screen.getByText('Comment')).toBeInTheDocument();
  });

  it('requires comment for reject decision', async () => {
    const user = userEvent.setup();
    render(<DecisionPanel onDecision={mockOnDecision} />);

    await user.click(screen.getByText('Reject'));
    await user.click(screen.getByText('Submit Decision'));

    expect(screen.getByText('Comment is required for this decision')).toBeInTheDocument();
    expect(mockOnDecision).not.toHaveBeenCalled();
  });

  it('requires comment for escalate decision', async () => {
    const user = userEvent.setup();
    render(<DecisionPanel onDecision={mockOnDecision} />);

    await user.click(screen.getByText('Escalate'));
    await user.click(screen.getByText('Submit Decision'));

    expect(screen.getByText('Comment is required for this decision')).toBeInTheDocument();
    expect(mockOnDecision).not.toHaveBeenCalled();
  });

  it('does not require comment for approve decision', async () => {
    const user = userEvent.setup();
    render(<DecisionPanel onDecision={mockOnDecision} />);

    await user.click(screen.getByText('Approve'));
    await user.click(screen.getByText('Submit Decision'));

    expect(mockOnDecision).toHaveBeenCalledWith('approve', 'medium', '');
  });

  it('submits decision with comment', async () => {
    const user = userEvent.setup();
    render(<DecisionPanel onDecision={mockOnDecision} />);

    await user.click(screen.getByText('Reject'));
    await user.type(screen.getByPlaceholderText('Reason for decision...'), 'Test comment');
    await user.click(screen.getByText('Submit Decision'));

    expect(mockOnDecision).toHaveBeenCalledWith('reject', 'medium', 'Test comment');
  });

  it('allows confidence level selection', async () => {
    const user = userEvent.setup();
    render(<DecisionPanel onDecision={mockOnDecision} />);

    await user.click(screen.getByText('Approve'));
    await user.click(screen.getByText('High'));
    await user.click(screen.getByText('Submit Decision'));

    expect(mockOnDecision).toHaveBeenCalledWith('approve', 'high', '');
  });

  it('cancels decision with Escape key', async () => {
    const user = userEvent.setup();
    render(<DecisionPanel onDecision={mockOnDecision} />);

    await user.click(screen.getByText('Approve'));
    expect(screen.getByText('Confirm Approve')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByText('Confirm Approve')).not.toBeInTheDocument();
    expect(screen.getByText('Approve')).toBeInTheDocument();
  });

  it('cancels decision with cancel button', async () => {
    const user = userEvent.setup();
    render(<DecisionPanel onDecision={mockOnDecision} />);

    await user.click(screen.getByText('Approve'));
    expect(screen.getByText('Confirm Approve')).toBeInTheDocument();

    await user.click(screen.getByText('Cancel (Esc)'));
    expect(screen.queryByText('Confirm Approve')).not.toBeInTheDocument();
  });

  it('resets form after successful submission', async () => {
    const user = userEvent.setup();
    render(<DecisionPanel onDecision={mockOnDecision} />);

    await user.click(screen.getByText('Reject'));
    await user.type(screen.getByPlaceholderText('Reason for decision...'), 'Test comment');
    await user.click(screen.getByText('Submit Decision'));

    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.queryByText('Confirm Reject')).not.toBeInTheDocument();
  });

  it('disables buttons when disabled prop is true', () => {
    render(<DecisionPanel onDecision={mockOnDecision} disabled={true} />);

    const approveButton = screen.getByText('Approve').closest('button');
    const rejectButton = screen.getByText('Reject').closest('button');
    const escalateButton = screen.getByText('Escalate').closest('button');

    expect(approveButton).toBeDisabled();
    expect(rejectButton).toBeDisabled();
    expect(escalateButton).toBeDisabled();
  });

  it('shows required asterisk for comment on reject/escalate', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<DecisionPanel onDecision={mockOnDecision} />);

    await user.click(screen.getByText('Reject'));
    expect(screen.getByText('Comment')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();

    // Reset the component state by rerendering
    rerender(<DecisionPanel onDecision={mockOnDecision} key="reset" />);
    await user.click(screen.getByText('Approve'));
    expect(screen.getByText('Comment')).toBeInTheDocument();
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<DecisionPanel onDecision={mockOnDecision} />);

    const region = screen.getByRole('region', { name: 'Decision Panel' });
    expect(region).toBeInTheDocument();

    // Check that buttons have the correct aria attributes
    const approveButton = screen.getByText('Approve').closest('button');
    expect(approveButton).toHaveAttribute('aria-keyshortcuts', 'a');
    expect(approveButton).toHaveAttribute('aria-description', 'Approve this alert as legitimate. Keyboard shortcut: A');

    const rejectButton = screen.getByText('Reject').closest('button');
    expect(rejectButton).toHaveAttribute('aria-keyshortcuts', 'r');
    expect(rejectButton).toHaveAttribute('aria-description', 'Reject this alert as false positive. Keyboard shortcut: R');

    const escalateButton = screen.getByText('Escalate').closest('button');
    expect(escalateButton).toHaveAttribute('aria-keyshortcuts', 'e');
    expect(escalateButton).toHaveAttribute('aria-description', 'Escalate this alert for senior review. Keyboard shortcut: E');
  });

  it('shows different placeholder text for approve vs other decisions', async () => {
    const user = userEvent.setup();
    render(<DecisionPanel onDecision={mockOnDecision} />);

    await user.click(screen.getByText('Approve'));
    expect(screen.getByPlaceholderText('Optional comment...')).toBeInTheDocument();

    await user.click(screen.getByText('Cancel (Esc)'));
    await user.click(screen.getByText('Reject'));
    expect(screen.getByPlaceholderText('Reason for decision...')).toBeInTheDocument();
  });
});