/**
 * Export Utilities
 * Phase 3: Enterprise Features - Independent Implementation
 * 
 * Provides PDF, Excel, CSV, and image export functionality
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// ============================================================================
// PDF Export
// ============================================================================

export interface PDFReportOptions {
  title: string;
  subtitle?: string;
  author?: string;
  date?: Date;
  logo?: string; // Base64 image
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'a4' | 'letter';
}

export interface PDFTableData {
  headers: string[];
  rows: (string | number)[][];
  title?: string;
}

export interface PDFSection {
  type: 'text' | 'table' | 'chart' | 'heading';
  content: string | PDFTableData | HTMLCanvasElement;
  options?: Record<string, unknown>;
}

/**
 * Generate a professional PDF report
 */
export function generatePDFReport(
  sections: PDFSection[],
  options: PDFReportOptions
): jsPDF {
  const pdf = new jsPDF({
    orientation: options.orientation || 'portrait',
    unit: 'mm',
    format: options.pageSize || 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Add header
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(options.title, margin, yPosition);
  yPosition += 10;

  if (options.subtitle) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100);
    pdf.text(options.subtitle, margin, yPosition);
    yPosition += 8;
  }

  // Add date
  const dateStr = (options.date || new Date()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  pdf.setFontSize(10);
  pdf.setTextColor(150);
  pdf.text(`Generated: ${dateStr}`, margin, yPosition);
  yPosition += 15;

  // Reset text color
  pdf.setTextColor(0);

  // Process sections
  for (const section of sections) {
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }

    switch (section.type) {
      case 'heading':
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(section.content as string, margin, yPosition);
        yPosition += 10;
        break;

      case 'text':
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(
          section.content as string,
          pageWidth - 2 * margin
        );
        pdf.text(lines, margin, yPosition);
        yPosition += lines.length * 6 + 5;
        break;

      case 'table':
        const tableData = section.content as PDFTableData;
        if (tableData.title) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(tableData.title, margin, yPosition);
          yPosition += 8;
        }
        
        autoTable(pdf, {
          head: [tableData.headers],
          body: tableData.rows,
          startY: yPosition,
          margin: { left: margin, right: margin },
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [59, 130, 246], textColor: 255 },
          alternateRowStyles: { fillColor: [248, 250, 252] },
        });
        
        yPosition = (pdf as any).lastAutoTable.finalY + 10;
        break;

      case 'chart':
        const canvas = section.content as HTMLCanvasElement;
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 2 * margin;
        const imgHeight = (canvas.height / canvas.width) * imgWidth;
        
        if (yPosition + imgHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
        break;
    }
  }

  // Add footer
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    if (options.author) {
      pdf.text(options.author, margin, pageHeight - 10);
    }
  }

  return pdf;
}

/**
 * Quick PDF export for a single table
 */
export function exportTableToPDF(
  data: Record<string, unknown>[],
  columns: { key: string; header: string }[],
  filename: string,
  title?: string
): void {
  const headers = columns.map((c) => c.header);
  const rows = data.map((row) =>
    columns.map((c) => String(row[c.key] ?? ''))
  );

  const pdf = generatePDFReport(
    [
      {
        type: 'table',
        content: { headers, rows, title },
      },
    ],
    { title: title || filename }
  );

  pdf.save(`${filename}.pdf`);
}

// ============================================================================
// Excel Export
// ============================================================================

export interface ExcelSheetData {
  name: string;
  data: Record<string, unknown>[];
  columns?: { key: string; header: string; width?: number }[];
}

/**
 * Export data to Excel with multiple sheets
 */
export function exportToExcel(
  sheets: ExcelSheetData[],
  filename: string
): void {
  const workbook = XLSX.utils.book_new();

  for (const sheet of sheets) {
    let wsData: (string | number | boolean | null)[][];

    if (sheet.columns) {
      // Use specified columns
      const headers = sheet.columns.map((c) => c.header);
      const rows = sheet.data.map((row) =>
        sheet.columns!.map((c) => {
          const val = row[c.key];
          if (val === null || val === undefined) return null;
          if (typeof val === 'object') return JSON.stringify(val);
          return val as string | number | boolean;
        })
      );
      wsData = [headers, ...rows];
    } else {
      // Auto-detect columns from first row
      const keys = sheet.data.length > 0 ? Object.keys(sheet.data[0]) : [];
      const headers = keys;
      const rows = sheet.data.map((row) =>
        keys.map((k) => {
          const val = row[k];
          if (val === null || val === undefined) return null;
          if (typeof val === 'object') return JSON.stringify(val);
          return val as string | number | boolean;
        })
      );
      wsData = [headers, ...rows];
    }

    const worksheet = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    if (sheet.columns) {
      worksheet['!cols'] = sheet.columns.map((c) => ({
        wch: c.width || 15,
      }));
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name.slice(0, 31));
  }

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  saveAs(blob, `${filename}.xlsx`);
}

/**
 * Quick Excel export for a single dataset
 */
export function exportDataToExcel(
  data: Record<string, unknown>[],
  filename: string,
  sheetName = 'Data'
): void {
  exportToExcel([{ name: sheetName, data }], filename);
}

// ============================================================================
// CSV Export
// ============================================================================

/**
 * Export data to CSV
 */
export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string,
  columns?: { key: string; header: string }[]
): void {
  if (data.length === 0) return;

  const keys = columns ? columns.map((c) => c.key) : Object.keys(data[0]);
  const headers = columns ? columns.map((c) => c.header) : keys;

  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      keys
        .map((k) => {
          const val = row[k];
          if (val === null || val === undefined) return '';
          const str = String(val);
          // Escape quotes and wrap in quotes if contains comma
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    ),
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
}

// ============================================================================
// Chart/Image Export
// ============================================================================

/**
 * Export a chart element to PNG
 */
export async function exportChartToPNG(
  chartElement: HTMLElement,
  filename: string
): Promise<void> {
  // Dynamic import to avoid SSR issues
  const html2canvas = (await import('html2canvas')).default;
  
  const canvas = await html2canvas(chartElement, {
    backgroundColor: '#ffffff',
    scale: 2, // Higher resolution
  });

  canvas.toBlob((blob) => {
    if (blob) {
      saveAs(blob, `${filename}.png`);
    }
  });
}

/**
 * Export a chart element to SVG (if using SVG-based charts)
 */
export function exportChartToSVG(
  svgElement: SVGElement,
  filename: string
): void {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  saveAs(blob, `${filename}.svg`);
}

/**
 * Get canvas from Recharts chart ref
 */
export async function getRechartsCanvas(
  chartContainer: HTMLElement
): Promise<HTMLCanvasElement> {
  const html2canvas = (await import('html2canvas')).default;
  return html2canvas(chartContainer, {
    backgroundColor: '#ffffff',
    scale: 2,
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format date for filenames
 */
export function getFilenameDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Generate a timestamped filename
 */
export function generateFilename(base: string, extension?: string): string {
  const date = getFilenameDate();
  const ext = extension ? `.${extension}` : '';
  return `${base}_${date}${ext}`;
}
