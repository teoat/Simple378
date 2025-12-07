import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/test-utils';
import { CaseDetail } from './CaseDetail';

describe('CaseDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders case detail page', () => {
    render(<CaseDetail />);
    expect(screen.getByText('Case Details')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<CaseDetail />);
    expect(screen.getByText('Loading case details...')).toBeInTheDocument();
  });

  it('displays case header information', async () => {
    render(<CaseDetail />);

    await waitFor(() => {
      expect(screen.getByText('Case ID:')).toBeInTheDocument();
      expect(screen.getByText('Status:')).toBeInTheDocument();
      expect(screen.getByText('Risk Score:')).toBeInTheDocument();
      expect(screen.getByText('Created:')).toBeInTheDocument();
    });
  });

  it('shows case title and description', async () => {
    render(<CaseDetail />);

    await waitFor(() => {
      expect(screen.getByText('Case Title')).toBeInTheDocument();
      expect(screen.getByText('Case description')).toBeInTheDocument();
    });
  });

  it('displays tab navigation', async () => {
    render(<CaseDetail />);

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Evidence')).toBeInTheDocument();
      expect(screen.getByText('Timeline')).toBeInTheDocument();
      expect(screen.getByText('Analysis')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  it('shows overview tab by default', async () => {
    render(<CaseDetail />);

    await waitFor(() => {
      const overviewTab = screen.getByText('Overview');
      expect(overviewTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('switches between tabs', async () => {
    render(<CaseDetail />);

    await waitFor(() => {
      const evidenceTab = screen.getByText('Evidence');
      fireEvent.click(evidenceTab);

      expect(evidenceTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Evidence')).toBeInTheDocument();
    });
  });

  it('displays case statistics in overview', async () => {
    render(<CaseDetail />);

    await waitFor(() => {
      expect(screen.getByText('Total Alerts:')).toBeInTheDocument();
      expect(screen.getByText('High Risk Items:')).toBeInTheDocument();
      expect(screen.getByText('Evidence Count:')).toBeInTheDocument();
      expect(screen.getByText('Last Updated:')).toBeInTheDocument();
    });
  });

  it('shows risk score visualization', async () => {
    render(<CaseDetail />);

    await waitFor(() => {
      expect(screen.getByText('Risk Assessment')).toBeInTheDocument();
      // Should show risk score chart or gauge
    });
  });

  it('displays assigned analyst information', async () => {
    render(<CaseDetail />);

    await waitFor(() => {
      expect(screen.getByText('Assigned Analyst:')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('shows case priority level', async () => {
    render(<CaseDetail />);

    await waitFor(() => {
      expect(screen.getByText('Priority:')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
    });
  });

  it('displays evidence tab content', async () => {
    render(<CaseDetail />);

    await waitFor(() => {
      const evidenceTab = screen.getByText('Evidence');
      fireEvent.click(evidenceTab);

      expect(screen.getByText('Evidence Library')).toBeInTheDocument();
      expect(screen.getByText('Upload Evidence')).toBeInTheDocument();
    });
  });

  it('shows timeline of case events', async () => {
    render(<CaseDetail />);

    await waitFor(() => {
      const timelineTab = screen.getByText('Timeline');
      fireEvent.click(timelineTab);

      expect(screen.getByText('Case Timeline')).toBeInTheDocument();
      expect(screen.getByText('Case Created')).toBeInTheDocument();
      expect(screen.getByText('Evidence Added')).toBeInTheDocument();
    });
  });

  it('displays analysis results', async () => {
    render(<CaseDetail />);

    await waitFor(() => {
      const analysisTab = screen.getByText('Analysis');
      fireEvent.click(analysisTab);

      expect(screen.getByText('AI Analysis')).toBeInTheDocument();
      expect(screen.getByText('Risk Factors')).toBeInTheDocument();
      expect(screen.getByText('Recommendations')).toBeInTheDocument();
    });
  });

  it('shows available actions', async () => {
    render(<CaseDetail />);

    await waitFor(() => {
      const actionsTab = screen.getByText('Actions');
      fireEvent.click(actionsTab);

      expect(screen.getByText('Case Actions')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /escalate/i })).toBeInTheDocument();
    });
  });

  it('handles approve action', async () => {
    render(<CaseDetail />);

    await waitFor(() => {
      const actionsTab = screen.getByText('Actions');
      fireEvent.click(actionsTab);

      const approveButton = screen.getByRole('button', { name: /approve/i });
      fireEvent.click(approveButton);

      // Should show confirmation dialog or process approval
      expect(approveButton).toBeInTheDocument();
    });
  });

  it('handles reject action with comments', async () => {
    render(<CaseDetail />);

    await waitFor(() => {
      const actionsTab = screen.getByText('Actions');
      fireEvent.click(actionsTab);

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      fireEvent.click(rejectButton);

      // Should show comment input for rejection reason
      expect(screen.getByPlaceholderText(/reason for rejection/i)).toBeInTheDocument();
    });
  });

  it('handles escalate action', async () => {
    render(<CaseDetail />);

    await waitFor(() => {
      const actionsTab = screen.getByText('Actions');
      fireEvent.click(actionsTab);

      const escalateButton = screen.getByRole('button', { name: /escalate/i });
      fireEvent.click(escalateButton);

      // Should show escalation options
      expect(screen.getByText('Escalation Reason')).toBeInTheDocument();
    });
  });

  it('allows adding comments to case', async () => {
    render(<CaseDetail />);

    await waitFor(() => {
      const commentInput = screen.getByPlaceholderText(/add a comment/i);
      const commentButton = screen.getByRole('button', { name: /comment/i });

      fireEvent.change(commentInput, { target: { value: 'This is a test comment' } });
      fireEvent.click(commentButton);

      expect(commentInput).toHaveValue('');
    });
  });

  it('displays case comments history', async () => {
    render(<CaseDetail />);

    await waitFor(() => {
      expect(screen.getByText('Comments')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    });
  });

  it('allows file uploads', async () => {
    render(<CaseDetail />);

    await waitFor(() => {
      const uploadButton = screen.getByRole('button', { name: /upload/i });
      const fileInput = screen.getByLabelText(/upload file/i);

      expect(uploadButton).toBeInTheDocument();
      expect(fileInput).toBeInTheDocument();
    });
  });

  it('shows case status changes', async () => {
    render(<CaseDetail />);

    await waitFor(() => {
      expect(screen.getByText('Status History')).toBeInTheDocument();
      expect(screen.getByText('Status changed to: In Review')).toBeInTheDocument();
    });
  });

  it('displays related cases', async () => {
    render(<CaseDetail />);

    await waitFor(() => {
      expect(screen.getByText('Related Cases')).toBeInTheDocument();
      expect(screen.getByText('Case #1234')).toBeInTheDocument();
      expect(screen.getByText('Case #5678')).toBeInTheDocument();
    });
  });

  it('handles navigation back to case list', async () => {
    render(<CaseDetail />);

    await waitFor(() => {
      const backButton = screen.getByRole('button', { name: /back to cases/i });
      expect(backButton).toBeInTheDocument();

      fireEvent.click(backButton);
      // Should navigate back to case list
    });
  });

  it('shows loading states for async operations', async () => {
    render(<CaseDetail />);

    await waitFor(() => {
      // When performing actions, should show loading states
      expect(screen.getByText('Case Details')).toBeInTheDocument();
    });
  });

  it('handles error states gracefully', async () => {
    // Mock error state
    render(<CaseDetail />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load case details')).toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', async () => {
    render(<CaseDetail />);

    await waitFor(() => {
      const mainHeading = screen.getByRole('heading', { name: /case details/i });
      expect(mainHeading).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThan(0);

      const tabPanels = screen.getAllByRole('tabpanel');
      expect(tabPanels.length).toBeGreaterThan(0);
    });
  });
});