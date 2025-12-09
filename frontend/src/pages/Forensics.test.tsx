import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test/test-utils';
import { Forensics } from './Forensics';

describe('Forensics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders forensics page', () => {
    render(<Forensics />);
    expect(screen.getByText('Forensics & Investigation')).toBeInTheDocument();
  });

  it('shows tab navigation', () => {
    render(<Forensics />);
    expect(screen.getByText('Entity Resolution')).toBeInTheDocument();
    expect(screen.getByText('Document Forensics')).toBeInTheDocument();
  });

  it('displays entity resolution tab by default', () => {
    render(<Forensics />);
    const entityTab = screen.getByRole('tab', { name: 'Entity Resolution' });
    expect(entityTab).toHaveAttribute('aria-selected', 'true');
  });

  it('switches to document forensics tab', () => {
    render(<Forensics />);
    const documentTab = screen.getByRole('tab', { name: 'Document Forensics' });
    fireEvent.click(documentTab);

    expect(documentTab).toHaveAttribute('aria-selected', 'true');
  });

  it('shows entity search input', () => {
    render(<Forensics />);
    const searchInput = screen.getByPlaceholderText(/search entities/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('displays filter buttons', () => {
    render(<Forensics />);
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Person')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('shows AI resolve button', () => {
    render(<Forensics />);
    expect(screen.getByText(/AI Resolve/i)).toBeInTheDocument();
  });

  it('handles entity search', () => {
    render(<Forensics />);
    const searchInput = screen.getByPlaceholderText(/search entities/i);

    fireEvent.change(searchInput, { target: { value: 'John Doe' } });
    expect(searchInput).toHaveValue('John Doe');
  });

  it('shows select entity message by default', () => {
    render(<Forensics />);
    expect(screen.getByText('Select an Entity')).toBeInTheDocument();
  });

  it('allows document upload in document forensics tab', () => {
    render(<Forensics />);
    const documentTab = screen.getByRole('tab', { name: 'Document Forensics' });
    fireEvent.click(documentTab);

    expect(screen.getByText(/Upload Document for Analysis/i)).toBeInTheDocument();
  });

  it('shows document analysis pipeline', async () => {
    render(<Forensics />);
    const documentTab = screen.getByRole('tab', { name: 'Document Forensics' });
    fireEvent.click(documentTab);

    await waitFor(() => {
      expect(screen.getByText('Analysis Pipeline')).toBeInTheDocument();
    });
  });

  it('displays analysis capabilities', async () => {
    render(<Forensics />);
    const documentTab = screen.getByRole('tab', { name: 'Document Forensics' });
    fireEvent.click(documentTab);

    await waitFor(() => {
      expect(screen.getByText('Analysis Capabilities')).toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', () => {
    render(<Forensics />);

    const mainHeading = screen.getByRole('heading', { name: /forensics & investigation/i });
    expect(mainHeading).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(2); // Entity Resolution and Document Forensics

    const tabPanels = screen.getAllByRole('tabpanel');
    expect(tabPanels.length).toBe(1); // Only the active tab panel is rendered
  });
});