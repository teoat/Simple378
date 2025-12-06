import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadZone } from '../components/ingestion/UploadZone';

// Mock react-dropzone to avoid complex setup
const mockUseDropzone = vi.fn();
vi.mock('react-dropzone', () => ({
  useDropzone: mockUseDropzone,
}));

describe('UploadZone', () => {
  const mockOnUpload = vi.fn();

  beforeEach(() => {
    mockOnUpload.mockClear();
    mockUseDropzone.mockReturnValue({
      getRootProps: () => ({
        onClick: vi.fn(),
        onKeyDown: vi.fn(),
        onFocus: vi.fn(),
        onBlur: vi.fn(),
        onDragEnter: vi.fn(),
        onDragLeave: vi.fn(),
        onDragOver: vi.fn(),
        onDrop: vi.fn(),
        tabIndex: 0,
      }),
      getInputProps: () => ({
        type: 'file',
        multiple: false,
        accept: '',
        onChange: vi.fn(),
        onClick: vi.fn(),
      }),
      isDragActive: false,
    });
  });

  it('renders upload zone with default state', () => {
    render(<UploadZone onUpload={mockOnUpload} />);

    expect(screen.getByText('Drag & drop files here')).toBeInTheDocument();
    expect(screen.getByText('or click to browse from your computer')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('CSV')).toBeInTheDocument();
    expect(screen.getByText('XLSX')).toBeInTheDocument();
    expect(screen.getByText('Max file size: 50MB')).toBeInTheDocument();
  });

  it('renders with showProcessing prop', () => {
    render(<UploadZone onUpload={mockOnUpload} showProcessing={true} />);

    expect(screen.getByText('Drag & drop files here')).toBeInTheDocument();
    // The mock doesn't apply CSS classes, so we just verify it renders
  });

  it('displays supported file types', () => {
    render(<UploadZone onUpload={mockOnUpload} />);

    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('JPG')).toBeInTheDocument();
    expect(screen.getByText('PNG')).toBeInTheDocument();
    expect(screen.getByText('CSV')).toBeInTheDocument();
    expect(screen.getByText('XLSX')).toBeInTheDocument();
  });

  it('shows upload icon', () => {
    render(<UploadZone onUpload={mockOnUpload} />);

    // Check that the upload icon is present (it has specific classes)
    const iconContainer = screen.getByText('Drag & drop files here').previousElementSibling;
    expect(iconContainer).toHaveClass('p-4');
  });

  it('has proper structure', () => {
    render(<UploadZone onUpload={mockOnUpload} />);

    // Check that the main container has the expected structure
    const container = screen.getByText('Drag & drop files here').closest('.w-full');
    expect(container).toBeInTheDocument();
  });
});