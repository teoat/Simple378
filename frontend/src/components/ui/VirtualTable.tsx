/**
 * Virtual Table Component
 * Phase 3: Performance Optimization - Virtual Scrolling
 * 
 * Efficiently renders large datasets using virtualization
 */

import { useRef, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '../../lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface VirtualTableColumn<T> {
  key: keyof T | string;
  header: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  sticky?: boolean;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface VirtualTableProps<T> {
  data: T[];
  columns: VirtualTableColumn<T>[];
  rowHeight?: number;
  headerHeight?: number;
  maxHeight?: number;
  onRowClick?: (row: T, index: number) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  selectedRows?: Set<number>;
  onSelectRow?: (index: number, selected: boolean) => void;
  getRowId?: (row: T) => string | number;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  stickyHeader?: boolean;
}

// ============================================================================
// Virtual Table Component
// ============================================================================

export function VirtualTable<T extends Record<string, unknown>>({
  data,
  columns,
  rowHeight = 48,
  headerHeight = 48,
  maxHeight = 600,
  onRowClick,
  onSort,
  sortKey,
  sortDirection,
  selectedRows,
  onSelectRow,
  getRowId,
  className,
  emptyMessage = 'No data available',
  loading = false,
  stickyHeader = true,
}: VirtualTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculate total width
  const totalWidth = useMemo(() => {
    return columns.reduce((acc, col) => acc + (col.width || 150), 0);
  }, [columns]);

  // Setup virtualizer
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 10, // Render extra rows for smoother scrolling
  });

  // Get nested value from object
  const getValue = useCallback((row: T, key: string): unknown => {
    const keys = key.split('.');
    let value: unknown = row;
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = (value as Record<string, unknown>)[k];
      } else {
        return undefined;
      }
    }
    return value;
  }, []);

  // Handle sort click
  const handleSortClick = (key: string) => {
    if (!onSort) return;
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  // Render sort icon
  const renderSortIcon = (key: string) => {
    if (sortKey !== key) {
      return <ChevronsUpDown className="w-4 h-4 opacity-30" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-blue-500" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-500" />
    );
  };

  // Loading state
  if (loading) {
    return (
      <div
        className={cn(
          'border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden',
          className
        )}
        style={{ height: maxHeight }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div
        className={cn(
          'border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden',
          className
        )}
        style={{ height: maxHeight }}
      >
        <div className="flex items-center justify-center h-full text-slate-500">
          {emptyMessage}
        </div>
      </div>
    );
  }

  const virtualRows = rowVirtualizer.getVirtualItems();

  return (
    <div
      className={cn(
        'border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden',
        className
      )}
    >
      {/* Scrollable container */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ maxHeight, minWidth: totalWidth }}
      >
        {/* Table */}
        <table className="w-full border-collapse" style={{ minWidth: totalWidth }}>
          {/* Header */}
          <thead
            className={cn(
              'bg-slate-50 dark:bg-slate-800',
              stickyHeader && 'sticky top-0 z-10'
            )}
          >
            <tr>
              {columns.map((column, colIndex) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700',
                    column.sortable && 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700',
                    column.sticky && 'sticky left-0 bg-slate-50 dark:bg-slate-800 z-20',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth || column.width,
                    maxWidth: column.maxWidth,
                    height: headerHeight,
                  }}
                  onClick={() => column.sortable && handleSortClick(String(column.key))}
                >
                  <div className="flex items-center gap-2">
                    {column.headerRender ? column.headerRender() : column.header}
                    {column.sortable && renderSortIcon(String(column.key))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body with virtualization */}
          <tbody
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: 'relative',
            }}
          >
            {virtualRows.map((virtualRow) => {
              const row = data[virtualRow.index];
              const rowId = getRowId ? getRowId(row) : virtualRow.index;
              const isSelected = selectedRows?.has(virtualRow.index);

              return (
                <tr
                  key={rowId}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  className={cn(
                    'border-b border-slate-100 dark:border-slate-800',
                    'hover:bg-slate-50 dark:hover:bg-slate-800/50',
                    onRowClick && 'cursor-pointer',
                    isSelected && 'bg-blue-50 dark:bg-blue-900/20'
                  )}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                    height: rowHeight,
                  }}
                  onClick={() => onRowClick?.(row, virtualRow.index)}
                >
                  {columns.map((column) => {
                    const value = getValue(row, String(column.key));
                    return (
                      <td
                        key={String(column.key)}
                        className={cn(
                          'px-4 py-3 text-sm text-slate-900 dark:text-slate-100',
                          column.sticky && 'sticky left-0 bg-white dark:bg-slate-900 z-10',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                        style={{
                          width: column.width,
                          minWidth: column.minWidth || column.width,
                          maxWidth: column.maxWidth,
                        }}
                      >
                        {column.render
                          ? column.render(value, row, virtualRow.index)
                          : String(value ?? '')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer with row count */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500">
        Showing {data.length.toLocaleString()} rows
      </div>
    </div>
  );
}

// ============================================================================
// Virtual List (for non-table scenarios)
// ============================================================================

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  maxHeight?: number;
  className?: string;
}

export function VirtualList<T>({
  items,
  renderItem,
  itemHeight = 60,
  maxHeight = 400,
  className,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto', className)}
      style={{ maxHeight }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
