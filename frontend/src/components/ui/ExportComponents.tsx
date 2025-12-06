/**
 * Export Components
 * Reusable UI components for export functionality
 */

import { useState, useRef } from 'react';
import { Download, FileSpreadsheet, FileText, Image, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  exportToCSV,
  exportDataToExcel,
  exportTableToPDF,
  exportChartToPNG,
  generateFilename,
} from '../lib/exportUtils';

// ============================================================================
// Export Dropdown Button
// ============================================================================

export interface ExportColumn {
  key: string;
  header: string;
}

interface ExportDropdownProps {
  data: Record<string, unknown>[];
  columns?: ExportColumn[];
  filename: string;
  title?: string;
  chartRef?: React.RefObject<HTMLElement>;
  formats?: ('csv' | 'excel' | 'pdf' | 'png')[];
  className?: string;
  disabled?: boolean;
}

export function ExportDropdown({
  data,
  columns,
  filename,
  title,
  chartRef,
  formats = ['csv', 'excel', 'pdf'],
  className,
  disabled,
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleExport = async (format: string) => {
    setIsExporting(format);
    setIsOpen(false);

    try {
      const timestampedFilename = generateFilename(filename);

      switch (format) {
        case 'csv':
          exportToCSV(data, timestampedFilename, columns);
          break;
        case 'excel':
          exportDataToExcel(data, timestampedFilename);
          break;
        case 'pdf':
          exportTableToPDF(data, columns || [], timestampedFilename, title);
          break;
        case 'png':
          if (chartRef?.current) {
            await exportChartToPNG(chartRef.current, timestampedFilename);
          }
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(null);
    }
  };

  const formatOptions = [
    { id: 'csv', label: 'CSV', icon: FileText, description: 'Comma-separated values' },
    { id: 'excel', label: 'Excel', icon: FileSpreadsheet, description: 'Microsoft Excel (.xlsx)' },
    { id: 'pdf', label: 'PDF', icon: FileText, description: 'Adobe PDF document' },
    { id: 'png', label: 'Image', icon: Image, description: 'PNG image' },
  ].filter((opt) => formats.includes(opt.id as any));

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isExporting !== null}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors',
          'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
          'hover:bg-slate-50 dark:hover:bg-slate-700',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span>Export</span>
        <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg z-20 overflow-hidden">
            {formatOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleExport(option.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
              >
                <option.icon className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="font-medium text-sm text-slate-900 dark:text-slate-100">
                    {option.label}
                  </div>
                  <div className="text-xs text-slate-500">{option.description}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// Quick Export Buttons
// ============================================================================

interface QuickExportButtonProps {
  onClick: () => void;
  format: 'csv' | 'excel' | 'pdf' | 'png';
  loading?: boolean;
  className?: string;
}

export function QuickExportButton({
  onClick,
  format,
  loading,
  className,
}: QuickExportButtonProps) {
  const icons = {
    csv: FileText,
    excel: FileSpreadsheet,
    pdf: FileText,
    png: Image,
  };

  const labels = {
    csv: 'Export CSV',
    excel: 'Export Excel',
    pdf: 'Export PDF',
    png: 'Export Image',
  };

  const Icon = icons[format];

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium',
        'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200',
        'hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors',
        'disabled:opacity-50',
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
      {labels[format]}
    </button>
  );
}

// ============================================================================
// useExport Hook
// ============================================================================

export interface UseExportOptions {
  filename: string;
  title?: string;
}

export function useExport<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  options: UseExportOptions
) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportCSV = async () => {
    setIsExporting(true);
    setError(null);
    try {
      exportToCSV(data, generateFilename(options.filename), columns);
    } catch (e) {
      setError('Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const exportExcel = async () => {
    setIsExporting(true);
    setError(null);
    try {
      exportDataToExcel(data, generateFilename(options.filename));
    } catch (e) {
      setError('Failed to export Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const exportPDF = async () => {
    setIsExporting(true);
    setError(null);
    try {
      exportTableToPDF(data, columns, generateFilename(options.filename), options.title);
    } catch (e) {
      setError('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    error,
    exportCSV,
    exportExcel,
    exportPDF,
  };
}
