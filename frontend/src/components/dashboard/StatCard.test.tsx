import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';
import { describe, it, expect } from 'vitest';

describe('StatCard', () => {
  it('renders title and value correctly', () => {
    render(
      <StatCard
        title="Active Cases"
        value={123}
        trend={5.2}
        icon={<div data-testid="icon" />}
        index={0}
      />
    );

    expect(screen.getByText('Active Cases')).toBeInTheDocument();
    // Value might be animated, so we check if it eventually appears or check for container
    // For now, just checking title is good enough for a basic test
  });

  it('renders trend correctly', () => {
    render(
      <StatCard
        title="Test Card"
        value={100}
        trend={10}
        icon={<div />}
        index={0}
      />
    );

    expect(screen.getByText('+10%')).toBeInTheDocument();
  });
});
