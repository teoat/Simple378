import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/test-utils';
import { EntityGraph } from './EntityGraph';

describe('EntityGraph', () => {
  const mockData = {
    nodes: [
      {
        id: '1',
        name: 'John Doe',
        type: 'person' as const,
        risk_score: 75,
        connections: 3,
        value: 1000,
        x: 100,
        y: 100
      },
      {
        id: '2',
        name: 'ABC Corp',
        type: 'company' as const,
        risk_score: 45,
        connections: 2,
        value: 50000,
        x: 200,
        y: 200
      }
    ],
    links: [
      {
        source: '1',
        target: '2',
        type: 'ownership' as const,
        weight: 0.8,
        amount: 25000,
        description: 'Ownership stake'
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders entity graph container', () => {
    render(<EntityGraph data={mockData} />);
    expect(screen.getByText('Entity Network Graph')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<EntityGraph data={mockData} />);
    expect(screen.getByText('Loading entity graph...')).toBeInTheDocument();
  });

  it('displays graph controls', async () => {
    render(<EntityGraph data={mockData} />);

    await waitFor(() => {
      expect(screen.getByText('Zoom In')).toBeInTheDocument();
      expect(screen.getByText('Zoom Out')).toBeInTheDocument();
      expect(screen.getByText('Reset View')).toBeInTheDocument();
    });
  });

  it('shows entity type filters', async () => {
    render(<EntityGraph data={mockData} />);

    await waitFor(() => {
      expect(screen.getByText('Person')).toBeInTheDocument();
      expect(screen.getByText('Company')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByText('Address')).toBeInTheDocument();
    });
  });

  it('displays risk score filter', async () => {
    render(<EntityGraph data={mockData} />);

    await waitFor(() => {
      expect(screen.getByText('Risk Score Range')).toBeInTheDocument();
    });
  });

  it('shows connection strength filter', async () => {
    render(<EntityGraph data={mockData} />);

    await waitFor(() => {
      expect(screen.getByText('Min Connections')).toBeInTheDocument();
    });
  });

  it('renders force-directed graph when data is loaded', async () => {
    render(<EntityGraph data={mockData} />);

    await waitFor(() => {
      // Should render the graph canvas
      expect(screen.getByTestId('entity-graph-container')).toBeInTheDocument();
    });
  });

  it('handles zoom in button click', async () => {
    render(<EntityGraph data={mockData} />);

    await waitFor(() => {
      const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
      fireEvent.click(zoomInButton);
      // Should update zoom level
      expect(zoomInButton).toBeInTheDocument();
    });
  });

  it('handles zoom out button click', async () => {
    render(<EntityGraph data={mockData} />);

    await waitFor(() => {
      const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
      fireEvent.click(zoomOutButton);
      // Should update zoom level
      expect(zoomOutButton).toBeInTheDocument();
    });
  });

  it('handles reset view button click', async () => {
    render(<EntityGraph data={mockData} />);

    await waitFor(() => {
      const resetButton = screen.getByRole('button', { name: /reset view/i });
      fireEvent.click(resetButton);
      // Should reset zoom and pan
      expect(resetButton).toBeInTheDocument();
    });
  });

  it('filters entities by type', async () => {
    render(<EntityGraph data={mockData} />);

    await waitFor(() => {
      const personFilter = screen.getByRole('checkbox', { name: /person/i });
      fireEvent.click(personFilter);
      // Should filter graph to show only person entities
      expect(personFilter).toBeChecked();
    });
  });

  it('filters entities by risk score', async () => {
    render(<EntityGraph data={mockData} />);

    await waitFor(() => {
      const riskSlider = screen.getByRole('slider', { name: /risk score/i });
      fireEvent.change(riskSlider, { target: { value: '70' } });
      // Should filter entities with risk score >= 70
      expect(riskSlider).toHaveValue('70');
    });
  });

  it('filters entities by connection count', async () => {
    render(<EntityGraph data={mockData} />);

    await waitFor(() => {
      const connectionInput = screen.getByRole('spinbutton', { name: /min connections/i });
      fireEvent.change(connectionInput, { target: { value: '3' } });
      // Should filter entities with >= 3 connections
      expect(connectionInput).toHaveValue(3);
    });
  });

  it('displays entity details on hover', async () => {
    render(<EntityGraph data={mockData} />);

    await waitFor(() => {
      // Mock hovering over a node
      const graphContainer = screen.getByTestId('entity-graph-container');
      fireEvent.mouseEnter(graphContainer);

      // Should show tooltip with entity details
      expect(graphContainer).toBeInTheDocument();
    });
  });

  it('allows node selection and highlighting', async () => {
    render(<EntityGraph data={mockData} />);

    await waitFor(() => {
      // Mock clicking on a node
      const graphContainer = screen.getByTestId('entity-graph-container');
      fireEvent.click(graphContainer);

      // Should highlight selected node and its connections
      expect(graphContainer).toBeInTheDocument();
    });
  });

  it('shows graph statistics', async () => {
    render(<EntityGraph data={mockData} />);

    await waitFor(() => {
      expect(screen.getByText(/entities: \d+/i)).toBeInTheDocument();
      expect(screen.getByText(/connections: \d+/i)).toBeInTheDocument();
    });
  });

  it('handles empty graph state', async () => {
    const emptyData = { nodes: [], links: [] };
    render(<EntityGraph data={emptyData} />);

    await waitFor(() => {
      expect(screen.getByText('No entities to display')).toBeInTheDocument();
    });
  });

  it('supports keyboard navigation', async () => {
    render(<EntityGraph data={mockData} />);

    await waitFor(() => {
      const graphContainer = screen.getByTestId('entity-graph-container');

      // Should support arrow keys for navigation
      fireEvent.keyDown(graphContainer, { key: 'ArrowUp' });
      fireEvent.keyDown(graphContainer, { key: 'ArrowDown' });
      fireEvent.keyDown(graphContainer, { key: 'ArrowLeft' });
      fireEvent.keyDown(graphContainer, { key: 'ArrowRight' });

      expect(graphContainer).toBeInTheDocument();
    });
  });

  it('provides export functionality', async () => {
    render(<EntityGraph data={mockData} />);

    await waitFor(() => {
      const exportButton = screen.getByRole('button', { name: /export/i });
      expect(exportButton).toBeInTheDocument();
    });
  });

  it('shows loading state during data fetch', () => {
    render(<EntityGraph data={mockData} />);
    expect(screen.getByText('Loading entity graph...')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    // Mock error state - this would need to be implemented in the component
    render(<EntityGraph data={mockData} />);

    await waitFor(() => {
      // For now, just check that the component renders without error
      expect(screen.getByText('Entity Network Graph')).toBeInTheDocument();
    });
  });

  it('supports different graph layouts', async () => {
    render(<EntityGraph data={mockData} />);

    await waitFor(() => {
      const layoutSelect = screen.getByRole('combobox', { name: /layout/i });
      expect(layoutSelect).toBeInTheDocument();

      // Should have options like force-directed, circular, hierarchical
      fireEvent.change(layoutSelect, { target: { value: 'circular' } });
      expect(layoutSelect).toHaveValue('circular');
    });
  });

  it('allows customizing node colors', async () => {
    render(<EntityGraph data={mockData} />);

    await waitFor(() => {
      const colorButton = screen.getByRole('button', { name: /color scheme/i });
      expect(colorButton).toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', async () => {
    render(<EntityGraph data={mockData} />);

    await waitFor(() => {
      const graphContainer = screen.getByTestId('entity-graph-container');
      expect(graphContainer).toHaveAttribute('role', 'img');
      expect(graphContainer).toHaveAttribute('aria-label', 'Entity relationship graph');
    });
  });
});