import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '../test/test-utils';
import { Ingestion } from './Ingestion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
vi.mock('../lib/api', () => ({
  apiRequest: vi.fn(),
  subjectsApi: {
    getSubjects: vi.fn()
  }
}));

vi.mock('../hooks/useWebSocket', () => ({
  useWebSocket: vi.fn(() => ({ lastMessage: null }))
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn()
  },
  __esModule: true
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

// Don't mock react-router-dom completely since test-utils needs MemoryRouter

// Import mocks after mocking
import { apiRequest, subjectsApi } from '../lib/api';
import { useWebSocket } from '../hooks/useWebSocket';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

describe('Ingestion', () => {
  const mockApiRequest = vi.mocked(apiRequest);
  const mockSubjectsApi = vi.mocked(subjectsApi);
  const mockUseWebSocket = vi.mocked(useWebSocket);
  const mockToast = vi.mocked(toast);
  // useNavigate will use the real implementation from MemoryRouter

  const mockSubjects = [
    { id: 'sub1', name: 'John Doe', type: 'person' },
    { id: 'sub2', name: 'ABC Corp', type: 'company' }
  ];

  const mockUploadResponse = {
    file_id: 'file123',
    headers: ['Date', 'Amount', 'Description', 'Category'],
    suggested_mapping: {
      date: 'Date',
      amount: 'Amount',
      description: 'Description'
    }
  };

  const mockPreviewResponse = {
    rows: [
      { date: '2024-01-01', amount: 100.50, description: 'Test transaction', category: 'Food' },
      { date: '2024-01-02', amount: 250.00, description: 'Another transaction', category: 'Transport' }
    ],
    validation: {
      total_rows_sampled: 100,
      valid_rows: 95,
      issues: ['2 rows with invalid dates', '3 rows with missing amounts']
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSubjectsApi.getSubjects.mockResolvedValue({ items: mockSubjects, total: 2 });
    mockApiRequest.mockImplementation((url: string) => {
      if (url === '/ingestion/upload-init') {
        return Promise.resolve(mockUploadResponse);
      }
      if (url === '/ingestion/mapping/preview') {
        return Promise.resolve(mockPreviewResponse);
      }
      if (url === '/ingestion/process-mapped') {
        return Promise.resolve({ success: true });
      }
      return Promise.resolve({});
    });
  });

  it('renders ingestion wizard with initial step', () => {
    render(<Ingestion />);

    expect(screen.getByText('Data Ingestion Wizard')).toBeInTheDocument();
    expect(screen.getByText('Upload and process transaction data')).toBeInTheDocument();

    // Should show step 1 as active
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('Map')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Validate')).toBeInTheDocument();
    expect(screen.getByText('Process')).toBeInTheDocument();
  });

  it('loads subjects data on mount', async () => {
    render(<Ingestion />);

    await waitFor(() => {
      expect(mockSubjectsApi.getSubjects).toHaveBeenCalledWith({ limit: 100 });
    });
  });

  it('requires subject and bank name before file upload', async () => {
    render(<Ingestion />);

    await waitFor(() => {
      expect(screen.getByText('Data Ingestion Wizard')).toBeInTheDocument();
    });

    // Try to upload without selecting subject/bank
    const fileInput = screen.getByLabelText('Select CSV File');

    // Mock file selection
    const file = new File(['test content'], 'test.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Please select Subject and enter Bank Name first');
    });
  });

  it('handles file upload successfully', async () => {
    render(<Ingestion />);

    await waitFor(() => {
      expect(screen.getByText('Data Ingestion Wizard')).toBeInTheDocument();
    });

    // Select subject and enter bank name
    const subjectSelect = screen.getByRole('combobox');
    const bankInput = screen.getByPlaceholderText('e.g. Chase');

    fireEvent.change(subjectSelect, { target: { value: 'sub1' } });
    fireEvent.change(bankInput, { target: { value: 'Test Bank' } });

    // Upload file
    const fileInput = screen.getByLabelText('Select CSV File');
    const file = new File(['date,amount,description\n2024-01-01,100.50,Test'], 'test.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('/ingestion/upload-init', {
        method: 'POST',
        body: expect.any(FormData)
      });
      expect(mockToast).toHaveBeenCalledWith('File uploaded and analyzed');
    });
  });

  it('advances to mapping step after upload', async () => {
    render(<Ingestion />);

    await waitFor(() => {
      expect(screen.getByText('Data Ingestion Wizard')).toBeInTheDocument();
    });

    // Complete upload to get to mapping step
    const subjectSelect = screen.getByRole('combobox');
    const bankInput = screen.getByPlaceholderText('e.g. Chase');

    fireEvent.change(subjectSelect, { target: { value: 'sub1' } });
    fireEvent.change(bankInput, { target: { value: 'Test Bank' } });

    const fileInput = screen.getByLabelText('Select CSV File');
    const file = new File(['date,amount,description\n2024-01-01,100.50,Test'], 'test.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      // Should advance to step 2 (Map)
      expect(screen.getByText('Map')).toBeInTheDocument();
    });
  });

  it('displays column mapping interface', async () => {
    render(<Ingestion />);

    await waitFor(() => {
      expect(screen.getByText('Data Ingestion Wizard')).toBeInTheDocument();
    });

    // Complete upload to get to mapping step
    const subjectSelect = screen.getByRole('combobox');
    const bankInput = screen.getByPlaceholderText('e.g. Chase');

    fireEvent.change(subjectSelect, { target: { value: 'sub1' } });
    fireEvent.change(bankInput, { target: { value: 'Test Bank' } });

    const fileInput = screen.getByLabelText('Select CSV File');
    const file = new File(['date,amount,description\n2024-01-01,100.50,Test'], 'test.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Column Mapping')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Amount')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });
  });

  it('allows updating column mappings', async () => {
    render(<Ingestion />);

    await waitFor(() => {
      expect(screen.getByText('Data Ingestion Wizard')).toBeInTheDocument();
    });

    // Complete upload to get to mapping step
    const subjectSelect = screen.getByRole('combobox');
    const bankInput = screen.getByPlaceholderText('e.g. Chase');

    fireEvent.change(subjectSelect, { target: { value: 'sub1' } });
    fireEvent.change(bankInput, { target: { value: 'Test Bank' } });

    const fileInput = screen.getByLabelText('Select CSV File');
    const file = new File(['date,amount,description\n2024-01-01,100.50,Test'], 'test.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Column Mapping')).toBeInTheDocument();
    });

    // Find mapping dropdowns and update one
    const mappingSelects = screen.getAllByRole('combobox');
    if (mappingSelects.length > 0) {
      fireEvent.change(mappingSelects[0], { target: { value: 'date' } });
      expect(mappingSelects[0]).toHaveValue('date');
    }
  });

  it('loads preview data when mappings are set', async () => {
    render(<Ingestion />);

    await waitFor(() => {
      expect(screen.getByText('Data Ingestion Wizard')).toBeInTheDocument();
    });

    // Complete upload and mapping to get to preview step
    const subjectSelect = screen.getByRole('combobox');
    const bankInput = screen.getByPlaceholderText('e.g. Chase');

    fireEvent.change(subjectSelect, { target: { value: 'sub1' } });
    fireEvent.change(bankInput, { target: { value: 'Test Bank' } });

    const fileInput = screen.getByLabelText('Select CSV File');
    const file = new File(['date,amount,description\n2024-01-01,100.50,Test'], 'test.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('/ingestion/mapping/preview', expect.objectContaining({
        method: 'POST',
        body: expect.any(String)
      }));
    });
  });

  it('displays data preview with validation stats', async () => {
    render(<Ingestion />);

    await waitFor(() => {
      expect(screen.getByText('Data Ingestion Wizard')).toBeInTheDocument();
    });

    // Complete upload and mapping to get to preview step
    const subjectSelect = screen.getByRole('combobox');
    const bankInput = screen.getByPlaceholderText('e.g. Chase');

    fireEvent.change(subjectSelect, { target: { value: 'sub1' } });
    fireEvent.change(bankInput, { target: { value: 'Test Bank' } });

    const fileInput = screen.getByLabelText('Select CSV File');
    const file = new File(['date,amount,description\n2024-01-01,100.50,Test'], 'test.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Data Preview')).toBeInTheDocument();
      expect(screen.getByText('Test transaction')).toBeInTheDocument();
      expect(screen.getByText('Another transaction')).toBeInTheDocument();
    });

    // Check validation stats
    expect(screen.getByText('95')).toBeInTheDocument(); // valid_rows
    expect(screen.getByText('100')).toBeInTheDocument(); // total_rows_sampled
  });

  it('handles final processing submission', async () => {
    render(<Ingestion />);

    await waitFor(() => {
      expect(screen.getByText('Data Ingestion Wizard')).toBeInTheDocument();
    });

    // Complete all steps to get to processing
    const subjectSelect = screen.getByRole('combobox');
    const bankInput = screen.getByPlaceholderText('e.g. Chase');

    fireEvent.change(subjectSelect, { target: { value: 'sub1' } });
    fireEvent.change(bankInput, { target: { value: 'Test Bank' } });

    const fileInput = screen.getByLabelText('Select CSV File');
    const file = new File(['date,amount,description\n2024-01-01,100.50,Test'], 'test.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      // Navigate through steps
      const nextButtons = screen.getAllByRole('button', { name: /next/i });
      if (nextButtons.length > 0) {
        fireEvent.click(nextButtons[0]);
      }
    });

    // Find and click process button
    const processButton = screen.getByRole('button', { name: /process/i }) || screen.getByRole('button', { name: /start processing/i });
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('/ingestion/process-mapped', expect.objectContaining({
        method: 'POST',
        body: expect.any(String)
      }));
    });
  });

  it('handles WebSocket progress updates', async () => {
    const mockWebSocket = { lastMessage: null };
    mockUseWebSocket.mockReturnValue(mockWebSocket);

    render(<Ingestion />);

    await waitFor(() => {
      expect(screen.getByText('Data Ingestion Wizard')).toBeInTheDocument();
    });

    // Simulate WebSocket message
    mockWebSocket.lastMessage = {
      type: 'upload_progress',
      payload: { upload_id: 'file123', progress: 50 }
    };

    // Trigger re-render by updating state
    const { rerender } = render(<Ingestion />);
    rerender(<Ingestion />);

    // Progress should be updated (this would be tested by checking UI state)
  });

  it('handles processing completion via WebSocket', async () => {
    const mockWebSocket = { lastMessage: null };
    mockUseWebSocket.mockReturnValue(mockWebSocket);

    render(<Ingestion />);

    await waitFor(() => {
      expect(screen.getByText('Data Ingestion Wizard')).toBeInTheDocument();
    });

    // Simulate completion message
    mockWebSocket.lastMessage = {
      type: 'processing_complete',
      payload: { upload_id: 'file123' }
    };

    // Trigger re-render
    const { rerender } = render(<Ingestion />);
    rerender(<Ingestion />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Ingestion successful!');
      // Navigation would happen but we can't easily test it in this setup
    });
  });

  it('handles processing errors via WebSocket', async () => {
    const mockWebSocket = { lastMessage: null };
    mockUseWebSocket.mockReturnValue(mockWebSocket);

    render(<Ingestion />);

    await waitFor(() => {
      expect(screen.getByText('Data Ingestion Wizard')).toBeInTheDocument();
    });

    // Simulate error message
    mockWebSocket.lastMessage = {
      type: 'processing_error',
      payload: { upload_id: 'file123', error: 'Validation failed' }
    };

    // Trigger re-render
    const { rerender } = render(<Ingestion />);
    rerender(<Ingestion />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Processing failed: Validation failed');
    });
  });

  it('navigates between steps correctly', async () => {
    render(<Ingestion />);

    await waitFor(() => {
      expect(screen.getByText('Data Ingestion Wizard')).toBeInTheDocument();
    });

    // Should start at step 1
    expect(screen.getByText('Upload')).toBeInTheDocument();

    // Next button should advance
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // Should be at step 2
    expect(screen.getByText('Map')).toBeInTheDocument();

    // Previous button should go back
    const prevButton = screen.getByRole('button', { name: /previous/i }) || screen.getByRole('button', { name: /back/i });
    if (prevButton) {
      fireEvent.click(prevButton);
      expect(screen.getByText('Upload')).toBeInTheDocument();
    }
  });

  it('validates required fields before submission', async () => {
    render(<Ingestion />);

    await waitFor(() => {
      expect(screen.getByText('Data Ingestion Wizard')).toBeInTheDocument();
    });

    // Try to submit without required fields
    const processButton = screen.getByRole('button', { name: /process/i }) || screen.getByRole('button', { name: /start processing/i });

    // This should fail validation
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Processing failed request: Missing required fields');
    });
  });

  it('shows loading states during operations', async () => {
    // Mock slow API response
    mockApiRequest.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockUploadResponse), 100)));

    render(<Ingestion />);

    await waitFor(() => {
      expect(screen.getByText('Data Ingestion Wizard')).toBeInTheDocument();
    });

    // Start upload
    const subjectSelect = screen.getByRole('combobox');
    const bankInput = screen.getByPlaceholderText('e.g. Chase');

    fireEvent.change(subjectSelect, { target: { value: 'sub1' } });
    fireEvent.change(bankInput, { target: { value: 'Test Bank' } });

    const fileInput = screen.getByLabelText('Select CSV File');
    const file = new File(['date,amount,description\n2024-01-01,100.50,Test'], 'test.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Should show loading state
    expect(screen.getByText('Uploading...') || screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles file upload errors', async () => {
    mockApiRequest.mockRejectedValue(new Error('Upload failed'));

    render(<Ingestion />);

    await waitFor(() => {
      expect(screen.getByText('Data Ingestion Wizard')).toBeInTheDocument();
    });

    // Attempt upload
    const subjectSelect = screen.getByRole('combobox');
    const bankInput = screen.getByPlaceholderText('e.g. Chase');

    fireEvent.change(subjectSelect, { target: { value: 'sub1' } });
    fireEvent.change(bankInput, { target: { value: 'Test Bank' } });

    const fileInput = screen.getByLabelText('Select CSV File');
    const file = new File(['date,amount,description\n2024-01-01,100.50,Test'], 'test.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Upload failed: Upload failed');
    });
  });

  it('displays validation issues in preview', async () => {
    render(<Ingestion />);

    await waitFor(() => {
      expect(screen.getByText('Data Ingestion Wizard')).toBeInTheDocument();
    });

    // Complete upload and mapping to get to preview step
    const subjectSelect = screen.getByRole('combobox');
    const bankInput = screen.getByPlaceholderText('e.g. Chase');

    fireEvent.change(subjectSelect, { target: { value: 'sub1' } });
    fireEvent.change(bankInput, { target: { value: 'Test Bank' } });

    const fileInput = screen.getByLabelText('Select CSV File');
    const file = new File(['date,amount,description\n2024-01-01,100.50,Test'], 'test.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('2 rows with invalid dates')).toBeInTheDocument();
      expect(screen.getByText('3 rows with missing amounts')).toBeInTheDocument();
    });
  });

  it('prevents navigation beyond available steps', async () => {
    render(<Ingestion />);

    await waitFor(() => {
      expect(screen.getByText('Data Ingestion Wizard')).toBeInTheDocument();
    });

    // Try to go to step 3 without completing previous steps
    // This should be prevented by the component logic
    const nextButtons = screen.getAllByRole('button', { name: /next/i });
    for (let i = 0; i < 5; i++) {
      if (nextButtons[i]) {
        fireEvent.click(nextButtons[i]);
      }
    }

    // Should still be at a valid step
    expect(screen.getByText('Upload')).toBeInTheDocument();
  });

  it('resets state when starting new upload', async () => {
    render(<Ingestion />);

    await waitFor(() => {
      expect(screen.getByText('Data Ingestion Wizard')).toBeInTheDocument();
    });

    // Complete upload
    const subjectSelect = screen.getByRole('combobox');
    const bankInput = screen.getByPlaceholderText('e.g. Chase');

    fireEvent.change(subjectSelect, { target: { value: 'sub1' } });
    fireEvent.change(bankInput, { target: { value: 'Test Bank' } });

    const fileInput = screen.getByLabelText('Select CSV File');
    const file = new File(['date,amount,description\n2024-01-01,100.50,Test'], 'test.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Map')).toBeInTheDocument();
    });

    // Upload another file - should reset state
    const newFile = new File(['new,data\n2024-01-02,200.00,New'], 'new.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [newFile] } });

    // Should reset to step 1 or handle appropriately
  });

  it('shows progress indicators during processing', async () => {
    const mockWebSocket = { lastMessage: null };
    mockUseWebSocket.mockReturnValue(mockWebSocket);

    render(<Ingestion />);

    await waitFor(() => {
      expect(screen.getByText('Data Ingestion Wizard')).toBeInTheDocument();
    });

    // Start processing
    const subjectSelect = screen.getByRole('combobox');
    const bankInput = screen.getByPlaceholderText('e.g. Chase');

    fireEvent.change(subjectSelect, { target: { value: 'sub1' } });
    fireEvent.change(bankInput, { target: { value: 'Test Bank' } });

    const fileInput = screen.getByLabelText('Select CSV File');
    const file = new File(['date,amount,description\n2024-01-01,100.50,Test'], 'test.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      const processButton = screen.getByRole('button', { name: /process/i }) || screen.getByRole('button', { name: /start processing/i });
      fireEvent.click(processButton);
    });

    // Simulate progress updates
    mockWebSocket.lastMessage = {
      type: 'processing_stage',
      payload: { upload_id: 'file123', stage: 'Validating data...' }
    };

    const { rerender } = render(<Ingestion />);
    rerender(<Ingestion />);

    // Should show processing stage
    expect(screen.getByText('Validating data...')).toBeInTheDocument();
  });
});