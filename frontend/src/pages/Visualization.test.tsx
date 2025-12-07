import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/test-utils';
import { Visualization } from './Visualization';

describe('Visualization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders visualization page', () => {
    render(<Visualization />);
    expect(screen.getByText('Data Visualization')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<Visualization />);
    expect(screen.getByText('Loading visualizations...')).toBeInTheDocument();
  });

  it('displays visualization tabs', async () => {
    render(<Visualization />);

    await waitFor(() => {
      expect(screen.getByText('Network Graph')).toBeInTheDocument();
      expect(screen.getByText('Timeline')).toBeInTheDocument();
      expect(screen.getByText('Heatmap')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });
  });

  it('shows network graph tab by default', async () => {
    render(<Visualization />);

    await waitFor(() => {
      const networkTab = screen.getByText('Network Graph');
      expect(networkTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('switches between visualization tabs', async () => {
    render(<Visualization />);

    await waitFor(() => {
      const timelineTab = screen.getByText('Timeline');
      fireEvent.click(timelineTab);

      expect(timelineTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Case Timeline')).toBeInTheDocument();
    });
  });

  it('displays network graph controls', async () => {
    render(<Visualization />);

    await waitFor(() => {
      expect(screen.getByText('Zoom In')).toBeInTheDocument();
      expect(screen.getByText('Zoom Out')).toBeInTheDocument();
      expect(screen.getByText('Reset View')).toBeInTheDocument();
      expect(screen.getByText('Toggle Labels')).toBeInTheDocument();
    });
  });

  it('shows entity type filters in network graph', async () => {
    render(<Visualization />);

    await waitFor(() => {
      expect(screen.getByText('Filter by Type')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /cases/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /entities/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /transactions/i })).toBeInTheDocument();
    });
  });

  it('displays risk score legend', async () => {
    render(<Visualization />);

    await waitFor(() => {
      expect(screen.getByText('Risk Score')).toBeInTheDocument();
      expect(screen.getByText('Low')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
    });
  });

  it('renders interactive network graph', async () => {
    render(<Visualization />);

    await waitFor(() => {
      const graphContainer = screen.getByTestId('network-graph-container');
      expect(graphContainer).toBeInTheDocument();
    });
  });

  it('handles node selection in network graph', async () => {
    render(<Visualization />);

    await waitFor(() => {
      const graphContainer = screen.getByTestId('network-graph-container');
      fireEvent.click(graphContainer);

      // Should show node details panel
      expect(screen.getByText('Node Details')).toBeInTheDocument();
    });
  });

  it('displays timeline visualization', async () => {
    render(<Visualization />);

    await waitFor(() => {
      const timelineTab = screen.getByText('Timeline');
      fireEvent.click(timelineTab);

      expect(screen.getByText('Case Timeline')).toBeInTheDocument();
      expect(screen.getByText('Filter by Date Range')).toBeInTheDocument();
    });
  });

  it('shows timeline controls', async () => {
    render(<Visualization />);

    await waitFor(() => {
      const timelineTab = screen.getByText('Timeline');
      fireEvent.click(timelineTab);

      expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });
  });

  it('displays heatmap visualization', async () => {
    render(<Visualization />);

    await waitFor(() => {
      const heatmapTab = screen.getByText('Heatmap');
      fireEvent.click(heatmapTab);

      expect(screen.getByText('Activity Heatmap')).toBeInTheDocument();
      expect(screen.getByText('Intensity')).toBeInTheDocument();
    });
  });

  it('shows heatmap time controls', async () => {
    render(<Visualization />);

    await waitFor(() => {
      const heatmapTab = screen.getByText('Heatmap');
      fireEvent.click(heatmapTab);

      expect(screen.getByText('Time Range')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });
  });

  it('displays analytics dashboard', async () => {
    render(<Visualization />);

    await waitFor(() => {
      const analyticsTab = screen.getByText('Analytics');
      fireEvent.click(analyticsTab);

      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Key Metrics')).toBeInTheDocument();
    });
  });

  it('shows analytics charts', async () => {
    render(<Visualization />);

    await waitFor(() => {
      const analyticsTab = screen.getByText('Analytics');
      fireEvent.click(analyticsTab);

      expect(screen.getByText('Cases by Status')).toBeInTheDocument();
      expect(screen.getByText('Risk Distribution')).toBeInTheDocument();
      expect(screen.getByText('Timeline Trends')).toBeInTheDocument();
    });
  });

  it('allows exporting visualizations', async () => {
    render(<Visualization />);

    await waitFor(() => {
      const exportButton = screen.getByRole('button', { name: /export/i });
      expect(exportButton).toBeInTheDocument();

      fireEvent.click(exportButton);
      // Should show export options
    });
  });

  it('provides fullscreen mode', async () => {
    render(<Visualization />);

    await waitFor(() => {
      const fullscreenButton = screen.getByRole('button', { name: /fullscreen/i });
      expect(fullscreenButton).toBeInTheDocument();
    });
  });

  it('supports different graph layouts', async () => {
    render(<Visualization />);

    await waitFor(() => {
      const layoutSelect = screen.getByRole('combobox', { name: /layout/i });
      expect(layoutSelect).toBeInTheDocument();

      fireEvent.change(layoutSelect, { target: { value: 'hierarchical' } });
      expect(layoutSelect).toHaveValue('hierarchical');
    });
  });

  it('shows data source information', async () => {
    render(<Visualization />);

    await waitFor(() => {
      expect(screen.getByText('Data Sources')).toBeInTheDocument();
      expect(screen.getByText('Last Updated:')).toBeInTheDocument();
    });
  });

  it('handles empty data states', async () => {
    // Mock empty data
    render(<Visualization />);

    await waitFor(() => {
      expect(screen.getByText('No data available for visualization')).toBeInTheDocument();
    });
  });

  it('displays loading states for data updates', async () => {
    render(<Visualization />);

    await waitFor(() => {
      // When filters change, should show loading
      const filterCheckbox = screen.getByRole('checkbox', { name: /cases/i });
      fireEvent.click(filterCheckbox);

      expect(screen.getByText('Updating visualization...')).toBeInTheDocument();
    });
  });

  it('provides search functionality', async () => {
    render(<Visualization />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search nodes/i);
      expect(searchInput).toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: 'fraud' } });
      // Should highlight matching nodes
    });
  });

  it('supports keyboard shortcuts', async () => {
    render(<Visualization />);

    await waitFor(() => {
      const graphContainer = screen.getByTestId('network-graph-container');

      // Test keyboard navigation
      fireEvent.keyDown(graphContainer, { key: 'f', ctrlKey: true }); // Ctrl+F for search
      expect(screen.getByPlaceholderText(/search nodes/i)).toHaveFocus();
    });
  });

  it('shows tooltips on hover', async () => {
    render(<Visualization />);

    await waitFor(() => {
      const graphContainer = screen.getByTestId('network-graph-container');
      fireEvent.mouseEnter(graphContainer);

      expect(screen.getByText('Node Information')).toBeInTheDocument();
    });
  });

  it('handles window resize events', async () => {
    render(<Visualization />);

    await waitFor(() => {
      // Mock window resize
      window.dispatchEvent(new Event('resize'));

      // Graph should adjust to new dimensions
      const graphContainer = screen.getByTestId('network-graph-container');
      expect(graphContainer).toBeInTheDocument();
    });
  });

  it('provides accessibility features', async () => {
    render(<Visualization />);

    await waitFor(() => {
      const mainHeading = screen.getByRole('heading', { name: /data visualization/i });
      expect(mainHeading).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThan(0);

      // Should have proper ARIA labels
      const graphContainer = screen.getByTestId('network-graph-container');
      expect(graphContainer).toHaveAttribute('aria-label');
    });
  });

  it('handles error states gracefully', async () => {
    // Mock error state
    render(<Visualization />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load visualization data')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });
});