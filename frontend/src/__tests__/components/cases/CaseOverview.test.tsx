import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CaseOverview } from '../../../components/cases/CaseOverview';

const mockCaseData = {
  id: '1',
  subject_name: 'John Doe',
  description: 'Test case description',
  risk_score: 0.8,
  created_at: '2024-01-01T00:00:00Z',
};

describe('CaseOverview', () => {
  it('renders case summary correctly', () => {
    render(<CaseOverview caseData={mockCaseData} />);

    expect(screen.getByText('Case Summary')).toBeInTheDocument();
    expect(screen.getByText('Test case description')).toBeInTheDocument();
    expect(screen.getByText('Total Alerts')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders recent activity section', () => {
    render(<CaseOverview caseData={mockCaseData} />);

    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
  });
});