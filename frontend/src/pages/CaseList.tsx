import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { PageErrorBoundary } from '../components/PageErrorBoundary';
import { CaseListSkeleton } from '../components/cases/CaseListSkeleton';
import toast from 'react-hot-toast';
import { Plus, MoreVertical, ChevronLeft, ChevronRight, Search, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { CaseSearch } from '../components/cases/CaseSearch';
import { CaseFilters } from '../components/cases/CaseFilters';
import { RiskBar } from '../components/cases/RiskBar';
import { StatusBadge } from '../components/cases/StatusBadge';
import { QuickPreview } from '../components/cases/QuickPreview';
import { useHotkeys } from 'react-hotkeys-hook';
import { cn } from '../lib/utils';
import { NewCaseModal } from '../components/cases/NewCaseModal';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { Tooltip } from '../components/ui/Tooltip';

const SortIcon = ({ column, sortBy, sortOrder }: { column: string; sortBy: string; sortOrder: 'asc' | 'desc' }) => {
  if (sortBy !== column) return null;
  return sortOrder === 'asc' ? (
    <ArrowUp className="h-3 w-3 inline-block ml-1" />
  ) : (
    <ArrowDown className="h-3 w-3 inline-block ml-1" />
  );
};

export function CaseList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [hoveredCase, setHoveredCase] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const navigate = useNavigate();

  // Keyboard shortcut to focus search
  useHotkeys('/', (e) => {
    e.preventDefault();
    searchInputRef.current?.focus();
    toast("Press ESC to exit search", { icon: "🔍", duration: 1500 });
  });

  // Keyboard shortcut to clear search
  useHotkeys('escape', () => {
    if (searchQuery) {
      setSearchQuery('');
      searchInputRef.current?.blur();
      toast("Search cleared", { icon: "✨", duration: 1000 });
    }
  }, { enableOnFormTags: ['INPUT'] });


  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Use Meilisearch when there's a search query, otherwise use regular endpoint
  const { data: searchData, isLoading: isSearchLoading, error: searchError } = useQuery({
    queryKey: ['cases-search', debouncedSearchQuery],
    queryFn: () => api.searchCases(debouncedSearchQuery),
    enabled: !!debouncedSearchQuery.trim(),
  });

  const { data: regularData, isLoading: isRegularLoading, error: regularError } = useQuery({
    queryKey: ['cases', { status: statusFilter !== 'all' ? statusFilter : undefined, page, limit, sortBy, sortOrder }],
    queryFn: () => api.getCases({ 
      status: statusFilter !== 'all' ? statusFilter : undefined,
      page,
      limit,
      sortBy: sortBy || undefined,
      sortOrder: sortBy ? sortOrder : undefined,
    }),
    enabled: !debouncedSearchQuery.trim(),
  });

  const error = searchError || regularError;

  // Use search results when available, otherwise use regular results
  const data = useMemo(() => {
    if (debouncedSearchQuery.trim() && searchData) {
      return {
        ...searchData,
        page: 1,
        pages: Math.ceil(searchData.total / limit),
      };
    }
    return regularData;
  }, [searchData, regularData, debouncedSearchQuery, limit]);

  const isLoading = isSearchLoading || isRegularLoading;
  const queryClient = useQueryClient();

  const deleteCasesMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => api.deleteCase(id)));
    },
    onSuccess: () => {
      toast.success('Selected cases deleted');
      setSelectedCases(new Set());
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
    onError: (error) => {
      toast.error(`Failed to delete cases: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedCases);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCases(newSelected);
  };

  const toggleAll = () => {
    if (data?.items && selectedCases.size === data.items.length) {
      setSelectedCases(new Set());
    } else {
      setSelectedCases(new Set(data?.items.map(i => i.id) || []));
    }
  };

  // WebSocket integration for real-time case updates
  useWebSocket('/ws', {
    onMessage: (message) => {
      if (message.type === 'case_updated' || message.type === 'case_created' || message.type === 'case_deleted') {
        queryClient.invalidateQueries({ queryKey: ['cases'] });
        queryClient.invalidateQueries({ queryKey: ['cases-search'] });
        
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

  if (isLoading) {
    return (
      <PageErrorBoundary pageName="Case Management">
        <CaseListSkeleton />
      </PageErrorBoundary>
    );
  }

  const handleMouseMove = (e: React.MouseEvent, id: string) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    setHoveredCase(id);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle sort order if same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to desc
      setSortBy(column);
      setSortOrder('desc');
    }
    setPage(1); // Reset to first page on sort
  };



  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-sm">
          Error loading cases: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  return (
    <PageErrorBoundary pageName="Case Management">
      <div className="p-8 space-y-8 min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
      {/* Skip link for keyboard users */}
      <a
        href="#case-table"
        className={cn(
          "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4",
          "bg-blue-600 text-white px-4 py-2 rounded-lg",
          "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "z-50 shadow-lg"
        )}
      >
        Skip to case table
      </a>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Case Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and investigate fraud cases</p>
        </div>
        <button
          onClick={() => setIsNewCaseModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 backdrop-blur-md bg-blue-600/90 dark:bg-blue-500/90 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 font-medium border border-blue-400/20"
        >
          <Plus className="h-5 w-5" />
          New Case
        </button>
      </div>

      <NewCaseModal isOpen={isNewCaseModalOpen} onClose={() => setIsNewCaseModalOpen(false)} />

      {/* Controls */}
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
          onStatusChange={(status) => {
            setStatusFilter(status);
            setPage(1); // Reset to first page on filter change
          }}
          className="w-full md:w-auto"
        />
      </div>

      {/* Data Grid */}
      <div className="relative">
        <div className="backdrop-blur-xl bg-white/10 dark:bg-slate-900/20 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/30 overflow-hidden">
          {
            <div className="overflow-x-auto">
              <table id="case-table" ref={tableRef} className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-4 w-12">
                      <input 
                        type="checkbox" 
                        aria-label="Select all cases"
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={!!data?.items?.length && selectedCases.size === data.items.length}
                        onChange={toggleAll}
                      />
                    </th>
                    <th 
                      className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                      onClick={() => handleSort('id')}
                    >
                      Case ID <SortIcon column="id" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th 
                      className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                      onClick={() => handleSort('subject_name')}
                    >
                      Subject <SortIcon column="subject_name" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th 
                      className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-48 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                      onClick={() => handleSort('risk_score')}
                    >
                      Risk Score <SortIcon column="risk_score" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th 
                      className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      Status <SortIcon column="status" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned To</th>
                    <th 
                      className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                      onClick={() => handleSort('created_at')}
                    >
                      Last Updated <SortIcon column="created_at" sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {data?.items.map((case_) => (
                    <motion.tr 
                      key={case_.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group hover:backdrop-blur-sm hover:bg-white/5 dark:hover:bg-slate-800/20 transition-all duration-200 relative focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:bg-blue-50/50 dark:focus-within:bg-blue-900/20 cursor-pointer"
                      onMouseMove={(e) => handleMouseMove(e, case_.id)}
                      onMouseLeave={() => setHoveredCase(null)}
                      tabIndex={0}
                      role="button"
                      aria-label={`View details for case ${case_.id.slice(0, 8)}, subject ${case_.subject_name}, risk level ${case_.risk_score}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/cases/${case_.id}`);
                        }
                      }}
                    >
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          aria-label={`Select case ${case_.id}`}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedCases.has(case_.id)}
                          onChange={() => toggleSelection(case_.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Link 
                          to={`/cases/${case_.id}`} 
                          className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          #{case_.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                            {case_.subject_name.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">{case_.subject_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <RiskBar score={case_.risk_score} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={case_.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {case_.assigned_to}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-500">
                        {new Date(case_.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Tooltip content="More actions">
                          <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Actions">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </Tooltip>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {data?.items.length === 0 && (
                <div className="py-8">
                  <EmptyState
                    icon={Search}
                    title="No cases found"
                    description={searchQuery ? "Try adjusting your search query or filters" : "Create your first case to get started"}
                    action={!searchQuery ? {
                      label: "Create New Case",
                      onClick: () => setIsNewCaseModalOpen(true)
                    } : undefined}
                  />
                </div>
              )}
            </div>
          }
        </div>
      </div>

        {/* Pagination */}
        {data && data.items.length > 0 && (
          <div className="flex justify-between items-center mt-6 px-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium text-slate-900 dark:text-white">
                {((data.page - 1) * limit) + 1}
              </span> - <span className="font-medium text-slate-900 dark:text-white">
                {Math.min(data.page * limit, data.total)}
              </span> of <span className="font-medium text-slate-900 dark:text-white">{data.total}</span> cases
            </p>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Page {data.page} of {data.pages}
              </span>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={data.page === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                disabled={data.page === data.pages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next Page"
              >
                <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Preview Hover Card */}
        {data?.items.map((case_) => (
          <QuickPreview
            key={`preview-${case_.id}`}
            isOpen={hoveredCase === case_.id}
            data={case_}
            position={mousePos}
          />
        ))}
      </div>


      {selectedCases.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-4 fade-in">
          <span className="font-medium">{selectedCases.size} selected</span>
          <div className="h-4 w-px bg-slate-700" />
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Cases"
      >
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300">
            Are you sure you want to delete {selectedCases.size} selected case{selectedCases.size > 1 ? 's' : ''}? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteCasesMutation.mutate(Array.from(selectedCases));
                setIsDeleteModalOpen(false);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

    </PageErrorBoundary>
  );
}
