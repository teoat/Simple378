import { render, screen } from '@testing-library/react';
import { AIInsightPanel } from './AIInsightPanel';

describe('AIInsightPanel', () => {
  it('renders without crashing', () => {
    render(<AIInsightPanel chartType="sankey" />);
    expect(screen.getByText('Cash Flow Pattern Analysis')).toBeInTheDocument();
  });
});
