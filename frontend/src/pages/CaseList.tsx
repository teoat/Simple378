import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from '../hooks/useWebSocket';
import { useCaseList } from '../hooks/useCaseList';
import { PageErrorBoundary } from '../components/PageErrorBoundary';
import { CaseListSkeleton } from '../components/cases/CaseListSkeleton';
import { CaseSearch } from '../components/cases/CaseSearch';
import { CaseFilters } from '../components/cases/CaseFilters';
import { CaseTable } from '../components/cases/CaseTable';
import { BulkActions } from '../components/cases/BulkActions';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

/**
 * CaseList Page Component
 * Displays paginated list of cases with filtering, sorting, and real-time updates
 */
export function CaseList() {
  const [hoveredCase, setHoveredCase] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Get all case list state from custom hook
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    setPage,
    sortBy,
    sortOrder,
    selectedCases,
    data,
    isLoading,
    error,
    handleSort,
    handleSelectCase,
    handleSelectAll,
    clearSelection,
  } = useCaseList();

  // WebSocket integration for real-time case updates
  useWebSocket('/ws', {
    onMessage: (message) => {
      if (
        message.type === 'case_updated' ||
        message.type === 'case_created' ||
        message.type === 'case_deleted'
      ) {
        // Invalidate queries to refetch cases
        queryClient.invalidateQueries({ queryKey: ['cases'] });
        queryClient.invalidateQueries({ queryKey: ['cases-search'] });

        // Show appropriate toast notification
        if (message.type === 'case_created') {
          toast.success('New case created', {
            icon: '🔔',
            duration: 3000,
          });
        } else if (message.type === 'case_updated') {
          toast('Case updated', {
            icon: 'ℹ️',
            duration: 2000,
          });
        }
      }
    },
  });

  // Loading state
  if (isLoading) {
    return (
      <PageErrorBoundary pageName="Case Management">
        <div className="p-8 space-y-8 min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
          <CaseListSkeleton />
        </div>
      </PageErrorBoundary>
    );
  }

  // Error state
  if (error) {
    return (
      <PageErrorBoundary pageName="Case Management">
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-sm">
            Error loading cases: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        </div>
      </PageErrorBoundary>
    );
  }

  // Main render
  return (
    <PageErrorBoundary pageName="Case Management">
      <div className="p-8 space-y-8 min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
        {/* Skip link for keyboard users */}
        <a
          href="#case-table"
          className={cn(
            'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
            'bg-blue-600 text-white px-4 py-2 rounded-lg',
            'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'z-50 shadow-lg'
          )}
        >
          Skip to case table
        </a>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Case Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage and investigate fraud cases
            </p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 backdrop-blur-md bg-blue-600/90 dark:bg-blue-500/90 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 font-medium border border-blue-400/20">
            <Plus className="h-5 w-5" />
            New Case
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-lg bg-white/10 dark:bg-slate-800/20 p-4 rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/30">
          <CaseSearch
            ref={searchInputRef}
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              setPage(1); // Reset to first page on search
            }}
            className="w-full md:w-96"
          />
          <CaseFilters
            status={statusFilter}
            riskScore="all"
            assignedTo="all"
            onFilterChange={(filters) => {
              if (filters.status) setStatusFilter(filters.status);
            }}
            className="w-full md:w-auto"
          />
        </div>

        {/* Bulk Actions */}
      {selectedCases.size > 0 && (
        <BulkActions
          selectedIds={selectedCases}
          onClearSelection={clearSelection}
        />
      )}

        {/* Data Grid */}
        <div className="relative">
          <div className="backdrop-blur-xl bg-white/10 dark:bg-slate-900/20 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/30 overflow-hidden">
            <CaseTable
              cases={data?.items || []}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              selectedCases={selectedCases}
              onSelectCase={handleSelectCase}
              onSelectAll={handleSelectAll}
              hoveredCase={hoveredCase}
              onHoverCase={setHoveredCase}
              mousePos={mousePos}
              onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
            />

            {/* Empty state */}
            {data?.items.length === 0 && !isLoading && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="h-8 w-8 text-slate-400">📋</div>
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  No cases found
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {data && data.items.length > 0 && (
            <div className="flex justify-between items-center mt-6 px-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing{' '}
                <span className="font-medium text-slate-900 dark:text-white">
                  {((data.page - 1) * 20) + 1}
                </span>{' '}
                -{' '}
                <span className="font-medium text-slate-900 dark:text-white">
                  {Math.min(data.page * 20, data.total)}
                </span>{' '}
                of{' '}
                <span className="font-medium text-slate-900 dark:text-white">{data.total}</span>{' '}
                cases
              </p>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Page {data.page} of {data.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={data.page === 1}
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                  disabled={data.page === data.pages}
                  aria-label="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageErrorBoundary>
  );
}
