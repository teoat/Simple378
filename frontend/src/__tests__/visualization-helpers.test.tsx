import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { parsePathResponse } from '../pages/Visualization';
import { ForceDirectedGraph } from '../components/visualization/ForceDirectedGraph';
import { SankeyFlow } from '../components/visualization/SankeyFlow';

const mockGraphData = {
  nodes: [
    { id: 'a', name: 'A', group: 1 },
    { id: 'b', name: 'B', group: 2 },
  ],
  links: [
    { source: 'a', target: 'b', value: 1 },
  ],
};

const mockSankeyData = {
  nodes: [
    { id: 'in', name: 'Inflow' },
    { id: 'bank', name: 'Bank' },
  ],
  links: [
    { source: 'in', target: 'bank', value: 10 },
  ],
};

describe('parsePathResponse', () => {
  it('handles top-level path', () => {
    expect(parsePathResponse({ path: ['a', 'b'] })).toEqual(['a', 'b']);
  });

  it('handles nested path shapes', () => {
    expect(parsePathResponse({ data: { path: [1, 2] } })).toEqual(['1', '2']);
    expect(parsePathResponse({ data: { shortest_path: ['x'] } })).toEqual(['x']);
  });

  it('returns empty array for invalid shapes', () => {
    expect(parsePathResponse({})).toEqual([]);
    expect(parsePathResponse({ data: { foo: 'bar' } })).toEqual([]);
  });
});

describe('ForceDirectedGraph controls', () => {
  it('calls onReset when reset is clicked', () => {
    const onReset = vi.fn();
    render(
      <ForceDirectedGraph
        data={mockGraphData as any}
        highlightedNodes={['a']}
        highlightedLinks={[{ source: 'a', target: 'b' }]}
        onReset={onReset}
      />
    );

    fireEvent.click(screen.getByText('Reset view'));
    expect(onReset).toHaveBeenCalled();
  });
});

describe('SankeyFlow rendering', () => {
  it('renders node labels when data is provided', () => {
    render(<SankeyFlow data={mockSankeyData as any} />);
    expect(screen.getByText('Inflow')).toBeInTheDocument();
    expect(screen.getByText('Bank')).toBeInTheDocument();
  });
});
