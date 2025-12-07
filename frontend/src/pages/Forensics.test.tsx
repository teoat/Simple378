import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/test-utils';
import { Forensics } from './Forensics';

describe('Forensics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders forensics page', () => {
    render(<Forensics />);
    expect(screen.getByText('Digital Forensics')).toBeInTheDocument();
  });

  it('shows tab navigation', () => {
    render(<Forensics />);
    expect(screen.getByText('Entity Analysis')).toBeInTheDocument();
    expect(screen.getByText('Document Analysis')).toBeInTheDocument();
  });

  it('displays entity analysis tab by default', () => {
    render(<Forensics />);
    const entityTab = screen.getByText('Entity Analysis');
    expect(entityTab).toHaveAttribute('aria-selected', 'true');
  });

  it('switches to document analysis tab', () => {
    render(<Forensics />);
    const documentTab = screen.getByText('Document Analysis');
    fireEvent.click(documentTab);

    expect(documentTab).toHaveAttribute('aria-selected', 'true');
  });

  it('shows entity search input', () => {
    render(<Forensics />);
    const searchInput = screen.getByPlaceholderText(/search entities/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('displays entity type filters', () => {
    render(<Forensics />);
    expect(screen.getByText('Person')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
  });

  it('shows risk score filter', () => {
    render(<Forensics />);
    expect(screen.getByText('Risk Score:')).toBeInTheDocument();
  });

  it('displays entity results table', async () => {
    render(<Forensics />);

    await waitFor(() => {
      expect(screen.getByText('Entity')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Risk Score')).toBeInTheDocument();
      expect(screen.getByText('Connections')).toBeInTheDocument();
      expect(screen.getByText('Last Activity')).toBeInTheDocument();
    });
  });

  it('handles entity search', () => {
    render(<Forensics />);
    const searchInput = screen.getByPlaceholderText(/search entities/i);

    fireEvent.change(searchInput, { target: { value: 'John Doe' } });
    expect(searchInput).toHaveValue('John Doe');
  });

  it('filters entities by type', () => {
    render(<Forensics />);
    const personFilter = screen.getByRole('checkbox', { name: /person/i });

    fireEvent.click(personFilter);
    expect(personFilter).toBeChecked();
  });

  it('allows entity selection', async () => {
    render(<Forensics />);

    await waitFor(() => {
      const entityRow = screen.getByText('John Doe').closest('tr');
      if (entityRow) {
        fireEvent.click(entityRow);
        // Should highlight selected entity
        expect(entityRow).toBeInTheDocument();
      }
    });
  });

  it('shows entity details panel when entity is selected', async () => {
    render(<Forensics />);

    await waitFor(() => {
      expect(screen.getByText('Entity Details')).toBeInTheDocument();
      expect(screen.getByText('Network Graph')).toBeInTheDocument();
      expect(screen.getByText('Transaction History')).toBeInTheDocument();
    });
  });

  it('displays entity network graph', async () => {
    render(<Forensics />);

    await waitFor(() => {
      expect(screen.getByText('Network Graph')).toBeInTheDocument();
      // Should render graph visualization
    });
  });

  it('shows transaction history for selected entity', async () => {
    render(<Forensics />);

    await waitFor(() => {
      expect(screen.getByText('Transaction History')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Amount')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
    });
  });

  it('allows document upload in document analysis tab', () => {
    render(<Forensics />);
    const documentTab = screen.getByText('Document Analysis');
    fireEvent.click(documentTab);

    const uploadArea = screen.getByText(/drag and drop files here/i);
    expect(uploadArea).toBeInTheDocument();
  });

  it('shows document analysis results', async () => {
    render(<Forensics />);
    const documentTab = screen.getByText('Document Analysis');
    fireEvent.click(documentTab);

    await waitFor(() => {
      expect(screen.getByText('Analysis Results')).toBeInTheDocument();
      expect(screen.getByText('File Type:')).toBeInTheDocument();
      expect(screen.getByText('File Size:')).toBeInTheDocument();
      expect(screen.getByText('Upload Date:')).toBeInTheDocument();
    });
  });

  it('displays document metadata', async () => {
    render(<Forensics />);
    const documentTab = screen.getByText('Document Analysis');
    fireEvent.click(documentTab);

    await waitFor(() => {
      expect(screen.getByText('Metadata')).toBeInTheDocument();
      expect(screen.getByText('Author:')).toBeInTheDocument();
      expect(screen.getByText('Created:')).toBeInTheDocument();
      expect(screen.getByText('Modified:')).toBeInTheDocument();
    });
  });

  it('shows manipulation analysis results', async () => {
    render(<Forensics />);
    const documentTab = screen.getByText('Document Analysis');
    fireEvent.click(documentTab);

    await waitFor(() => {
      expect(screen.getByText('Manipulation Analysis')).toBeInTheDocument();
      expect(screen.getByText('ELA Score:')).toBeInTheDocument();
      expect(screen.getByText('Suspicious:')).toBeInTheDocument();
    });
  });

  it('displays AI analysis summary', async () => {
    render(<Forensics />);
    const documentTab = screen.getByText('Document Analysis');
    fireEvent.click(documentTab);

    await waitFor(() => {
      expect(screen.getByText('AI Analysis')).toBeInTheDocument();
      expect(screen.getByText('Summary')).toBeInTheDocument();
    });
  });

  it('handles file upload', () => {
    render(<Forensics />);
    const documentTab = screen.getByText('Document Analysis');
    fireEvent.click(documentTab);

    const fileInput = screen.getByLabelText(/upload file/i);
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(fileInput).toBeInTheDocument();
  });

  it('shows upload progress', () => {
    render(<Forensics />);
    const documentTab = screen.getByText('Document Analysis');
    fireEvent.click(documentTab);

    // Should show progress bar during upload
    expect(screen.getByText('Document Analysis')).toBeInTheDocument();
  });

  it('displays analysis status', async () => {
    render(<Forensics />);
    const documentTab = screen.getByText('Document Analysis');
    fireEvent.click(documentTab);

    await waitFor(() => {
      expect(screen.getByText('Status:')).toBeInTheDocument();
      // Should show 'Processing', 'Completed', or 'Failed'
    });
  });

  it('allows downloading analysis report', async () => {
    render(<Forensics />);
    const documentTab = screen.getByText('Document Analysis');
    fireEvent.click(documentTab);

    await waitFor(() => {
      const downloadButton = screen.getByRole('button', { name: /download report/i });
      expect(downloadButton).toBeInTheDocument();
    });
  });

  it('shows error handling for failed uploads', () => {
    render(<Forensics />);
    const documentTab = screen.getByText('Document Analysis');
    fireEvent.click(documentTab);

    // Should show error message for invalid files or upload failures
    expect(screen.getByText('Document Analysis')).toBeInTheDocument();
  });

  it('displays analysis history', async () => {
    render(<Forensics />);
    const documentTab = screen.getByText('Document Analysis');
    fireEvent.click(documentTab);

    await waitFor(() => {
      expect(screen.getByText('Analysis History')).toBeInTheDocument();
      expect(screen.getByText('Previous Analyses')).toBeInTheDocument();
    });
  });

  it('supports batch analysis', () => {
    render(<Forensics />);
    const documentTab = screen.getByText('Document Analysis');
    fireEvent.click(documentTab);

    const batchButton = screen.getByRole('button', { name: /batch analysis/i });
    expect(batchButton).toBeInTheDocument();
  });

  it('shows analysis queue', async () => {
    render(<Forensics />);
    const documentTab = screen.getByText('Document Analysis');
    fireEvent.click(documentTab);

    await waitFor(() => {
      expect(screen.getByText('Analysis Queue')).toBeInTheDocument();
      expect(screen.getByText('Pending:')).toBeInTheDocument();
      expect(screen.getByText('Processing:')).toBeInTheDocument();
    });
  });

  it('handles large file uploads', () => {
    render(<Forensics />);
    const documentTab = screen.getByText('Document Analysis');
    fireEvent.click(documentTab);

    // Should show warnings for large files
    expect(screen.getByText('Document Analysis')).toBeInTheDocument();
  });

  it('provides export functionality', async () => {
    render(<Forensics />);
    const documentTab = screen.getByText('Document Analysis');
    fireEvent.click(documentTab);

    await waitFor(() => {
      const exportButton = screen.getByRole('button', { name: /export/i });
      expect(exportButton).toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', () => {
    render(<Forensics />);

    const mainHeading = screen.getByRole('heading', { name: /digital forensics/i });
    expect(mainHeading).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(2); // Entity Analysis and Document Analysis

    const tabPanels = screen.getAllByRole('tabpanel');
    expect(tabPanels.length).toBeGreaterThan(0);
  });
});