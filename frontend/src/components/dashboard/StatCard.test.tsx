import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';
import { describe, it, expect } from 'vitest';
import { Activity } from 'lucide-react';

describe('StatCard', () => {
  it('renders title and value correctly', () => {
    render(
      <StatCard
        title="Active Cases"
        value={123}
        trend={{ value: 5.2, isPositive: true }}
        icon={Activity}
        index={0}
      />
    );

    expect(screen.getByText('Active Cases')).toBeInTheDocument();
  });

  it('renders trend correctly', () => {
    render(
      <StatCard
        title="Test Card"
        value={100}
        trend={{ value: 10, isPositive: true }}
        icon={Activity}
        index={0}
      />
    );

    expect(screen.getByText('↑ 10%')).toBeInTheDocument();
  });

  it('renders negative trend correctly', () => {
    render(
      <StatCard
        title="Test Card"
        value={100}
        trend={{ value: 5, isPositive: false }}
        icon={Activity}
        index={0}
      />
    );

    expect(screen.getByText('↓ 5%')).toBeInTheDocument();
  });
});
