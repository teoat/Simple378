import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useWebSocket } from '../hooks/useWebSocket';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, Filter, Plus, Briefcase, ChevronRight, ChevronLeft, ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { subjectsApi } from '../lib/api';

interface Case {
  id: string;
  subject_name: string;
  status: string;
  risk_score: number;
  created_at: string;
  updated_at: string;
  assigned_to: string;
}

interface CaseListResponse {
  items: Case[];
  total: number;
  page: number;
  pages: number;
}

const SortIcon = ({ field, currentSortBy, sortOrder }: { field: string, currentSortBy: string, sortOrder: string }) => {
  if (currentSortBy !== field) return <ArrowUpDown className="w-3 h-3 text-slate-400" />;
  return sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />;
};

export function CaseList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { lastMessage } = useWebSocket();

  // State for server-side params
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');
  
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (lastMessage?.type && ['case_created', 'case_updated', 'case_deleted'].includes(lastMessage.type)) {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    }
  }, [lastMessage, queryClient]);

  const fetchCases = async () => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort_by: sortBy,
      sort_order: sortOrder,
    });
    
    if (debouncedSearch) params.append('search', debouncedSearch);
    if (statusFilter) params.append('status', statusFilter);
    
    if (riskFilter) {
      if (riskFilter === 'critical') params.append('min_risk', '90');
      else if (riskFilter === 'high') { params.append('min_risk', '70'); params.append('max_risk', '89'); }
      else if (riskFilter === 'medium') { params.append('min_risk', '40'); params.append('max_risk', '69'); }
      else if (riskFilter === 'low') params.append('max_risk', '39');
    }

    return apiRequest<CaseListResponse>('/cases/?' + params.toString());
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['cases', page, limit, sortBy, sortOrder, debouncedSearch, statusFilter, riskFilter],
    queryFn: fetchCases,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500) {
          return false;
        }
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const cases = data?.items || [];
  const totalPages = data?.pages || 1;

  // Error handling
  const handleRetry = () => {
    refetch();
  };

  // Virtual scrolling setup for performance with large datasets
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: cases.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated row height
    overscan: 5, // Render 5 extra items outside visible area
  });

  const handleSelectCase = (caseId: string, checked: boolean) => {
    const newSelected = new Set(selectedCases);
    if (checked) {
      newSelected.add(caseId);
    } else {
      newSelected.delete(caseId);
    }
    setSelectedCases(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && cases.length > 0) {
      setSelectedCases(new Set(cases.map((c: Case) => c.id)));
    } else {
      setSelectedCases(new Set());
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc'); // Default to desc for new new sort
    }
  };

  const isAllSelected = cases.length > 0 && selectedCases.size === cases.length;
  const isIndeterminate = selectedCases.size > 0 && selectedCases.size < cases.length;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'active':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300';
      case 'under review':
      case 'pending':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300';
      case 'escalated':
        return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300';
      case 'closed':
      case 'reviewed':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600 dark:text-red-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    if (score >= 40) return 'text-blue-600 dark:text-blue-400';
    return 'text-emerald-600 dark:text-emerald-400';
  };

  // Error state
  if (error && !isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Failed to load cases
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            We encountered an error while loading your cases. This might be a temporary issue.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-6">
      {/* Loading Skeleton */}
      {isLoading && !data && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>

          <div className="flex gap-4">
            <div className="h-10 flex-1 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  </div>
                  <div className="w-16 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Cases</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage and investigate fraud cases
          </p>
        </div>
        <button
          onClick={() => navigate('/cases/new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Case
        </button>
      </div>

      {/* Filters - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by case ID, subject..."
            title="Search cases"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
            <select
                title="Status Filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="under review">Under Review</option>
                <option value="reviewed">Reviewed</option>
                <option value="escalated">Escalated</option>
                <option value="closed">Closed</option>
            </select>

            <select
                title="Risk Filter"
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
                <option value="">All Risks</option>
                <option value="critical">Critical (90+)</option>
                <option value="high">High (70-89)</option>
                <option value="medium">Medium (40-69)</option>
                <option value="low">Low (&lt;40)</option>
            </select>
            
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}
            >
            <Filter className="w-4 h-4" />
            More
            </button>
        </div>
      </div>

      {/* Batch Actions Bar */}
      {selectedCases.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedCases.size} case{selectedCases.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  try {
                    await subjectsApi.batchUpdateCases({
                      case_ids: Array.from(selectedCases),
                      status: 'pending' 
                    });
                    queryClient.invalidateQueries({ queryKey: ['cases'] });
                    setSelectedCases(new Set());
                  } catch (error) {
                    console.error('Failed to batch update status:', error);
                  }
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md font-medium transition-colors"
                title="Mark selected as pending"
              >
                Mark Pending
              </button>
              <button
                onClick={() => setSelectedCases(new Set())}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm rounded-md font-medium transition-colors"
                title="Clear selection"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Card View for Small Screens */}
      <div className="block md:hidden space-y-4">
        {isLoading ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              <span className="ml-3 text-slate-500">Loading cases...</span>
            </div>
          </div>
        ) : cases.length > 0 ? (
          cases.map((c: Case) => (
            <div
              key={c.id}
              className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
                selectedCases.has(c.id) ? 'ring-2 ring-blue-500 border-blue-500' : ''
              }`}
              onClick={() => navigate(`/cases/${c.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedCases.has(c.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectCase(c.id, e.target.checked);
                    }}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                    <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">{c.subject_name}</h3>
                    <p className="text-sm text-slate-500 font-mono">{c.id.slice(0, 8)}...</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(c.status)} border-current bg-opacity-10`}>
                  {c.status.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${c.risk_score >= 80 ? 'bg-red-500' : c.risk_score >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${c.risk_score}%` }}
                    ></div>
                  </div>
                  <span className={`font-semibold text-sm ${getRiskColor(c.risk_score)}`}>
                    {c.risk_score}
                  </span>
                </div>
                <span className="text-sm text-slate-500">
                  {c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No cases found</h3>
            <p className="text-slate-500 mb-6">
              We couldn't find any cases matching your search criteria. Try adjusting your filters or create a new case.
            </p>
            <button
              onClick={() => navigate('/cases/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create First Case
            </button>
          </div>
        )}
      </div>

      {/* Table with Virtual Scrolling - Desktop Only */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div
          ref={parentRef}
          className="overflow-auto"
          style={{ height: cases.length > 50 ? '600px' : 'auto' }}
        >
          {cases.length > 50 ? (
            // Virtual scrolling for large datasets
            <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                  <tr>
                <th className="px-6 py-4 text-left w-10">
                    <input
                    type="checkbox"
                    title="Select all cases"
                    checked={isAllSelected}
                    ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                </th>
                <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => handleSort('id')}
                >
                    <div className="flex items-center gap-2">Case <SortIcon field="id" currentSortBy={sortBy} sortOrder={sortOrder} /></div>
                </th>
                <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    
                >
                    <div className="flex items-center gap-2">Subject</div>
                </th>
                <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => handleSort('status')}
                >
                     <div className="flex items-center gap-2">Status <SortIcon field="status" currentSortBy={sortBy} sortOrder={sortOrder} /></div>
                </th>
                <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => handleSort('risk_score')}
                >
                     <div className="flex items-center gap-2">Risk <SortIcon field="risk_score" currentSortBy={sortBy} sortOrder={sortOrder} /></div>
                </th>
                <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => handleSort('created_at')}
                >
                     <div className="flex items-center gap-2">Created <SortIcon field="created_at" currentSortBy={sortBy} sortOrder={sortOrder} /></div>
                </th>
                <th className="px-6 py-4"></th>
                </tr>
            </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoading ? (
                  <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex justify-center items-center flex-col gap-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                          <span className="text-sm">Loading cases...</span>
                      </div>
                      </td>
                  </tr>
                  ) : cases.length > 0 ? (
                  rowVirtualizer.getVirtualItems().map((virtualItem) => {
                    const c = cases[virtualItem.index];
                    return (
                      <tr
                      key={c.id}
                      style={{
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                      className={`group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors absolute top-0 left-0 w-full ${
                          selectedCases.has(c.id) ? 'bg-blue-50 dark:bg-blue-500/5' : ''
                      }`}
                      >
                    <td className="px-6 py-4">
                        <input
                        type="checkbox"
                        title={`Select case ${c.id}`}
                        checked={selectedCases.has(c.id)}
                        onChange={(e) => handleSelectCase(c.id, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                    </td>
                    <td
                        className="px-6 py-4 cursor-pointer"
                        onClick={() => navigate(`/cases/${c.id}`)}
                    >
                        <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors">
                            <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">{c.subject_name}</div>
                            <div className="text-sm text-slate-500 font-mono">{c.id.slice(0, 8)}...</div>
                        </div>
                        </div>
                    </td>
                    <td
                        className="px-6 py-4 text-slate-700 dark:text-slate-300 cursor-pointer font-medium"
                        onClick={() => navigate(`/cases/${c.id}`)}
                    >
                        {c.subject_name || 'Unknown Subject'}
                    </td>
                    <td
                        className="px-6 py-4 cursor-pointer"
                        onClick={() => navigate(`/cases/${c.id}`)}
                    >
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(c.status)} border-current bg-opacity-10`}>
                        {c.status.toUpperCase()}
                        </span>
                    </td>
                    <td
                        className="px-6 py-4 cursor-pointer"
                        onClick={() => navigate(`/cases/${c.id}`)}
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${c.risk_score >= 80 ? 'bg-red-500' : c.risk_score >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                    style={{ width: `${c.risk_score}%` }}
                                ></div>
                            </div>
                            <span className={`font-semibold text-sm ${getRiskColor(c.risk_score)}`}>
                            {c.risk_score}
                            </span>
                        </div>
                    </td>
                    <td
                        className="px-6 py-4 text-slate-500 text-sm cursor-pointer whitespace-nowrap"
                        onClick={() => navigate(`/cases/${c.id}`)}
                    >
                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100" />
                    </td>
                    </tr>
                ))
                ) : (
                <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <Briefcase className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No cases found</h3>
                        <p className="text-slate-500 mt-1 mb-6 text-center">
                            We couldn't find any cases matching your search criteria. Try adjusting your filters or create a new case.
                        </p>
                        <button
                            onClick={() => navigate('/cases/new')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Create First Case
                        </button>
                    </div>
                    </td>
                </tr>
                    );
                  })
                  ) : (
                  <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="max-w-sm mx-auto flex flex-col items-center">
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                              <Briefcase className="w-8 h-8 text-slate-400" />
                          </div>
                          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No cases found</h3>
                          <p className="text-slate-500 mt-1 mb-6 text-center">
                              We couldn't find any cases matching your search criteria. Try adjusting your filters or create a new case.
                          </p>
                          <button
                              onClick={() => navigate('/cases/new')}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                          >
                              <Plus className="w-4 h-4" />
                              Create First Case
                          </button>
                      </div>
                      </td>
                  </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            // Regular table for small datasets
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                  <th className="px-6 py-4 text-left w-10">
                      <input
                      type="checkbox"
                      title="Select all cases"
                      checked={isAllSelected}
                      ref={(el) => {
                          if (el) el.indeterminate = isIndeterminate;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                  </th>
                  <th
                      className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => handleSort('id')}
                  >
                      <div className="flex items-center gap-2">Case <SortIcon field="id" currentSortBy={sortBy} sortOrder={sortOrder} /></div>
                  </th>
                  <th
                      className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"

                  >
                      <div className="flex items-center gap-2">Subject</div>
                  </th>
                  <th
                      className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => handleSort('status')}
                  >
                       <div className="flex items-center gap-2">Status <SortIcon field="status" currentSortBy={sortBy} sortOrder={sortOrder} /></div>
                  </th>
                  <th
                      className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => handleSort('risk_score')}
                  >
                       <div className="flex items-center gap-2">Risk <SortIcon field="risk_score" currentSortBy={sortBy} sortOrder={sortOrder} /></div>
                  </th>
                  <th
                      className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => handleSort('created_at')}
                  >
                       <div className="flex items-center gap-2">Created <SortIcon field="created_at" currentSortBy={sortBy} sortOrder={sortOrder} /></div>
                  </th>
                  <th className="px-6 py-4"></th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center items-center flex-col gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                        <span className="text-sm">Loading cases...</span>
                    </div>
                    </td>
                </tr>
                ) : cases.length > 0 ? (
                cases.map((c: Case) => (
                    <tr
                    key={c.id}
                    className={`group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                        selectedCases.has(c.id) ? 'bg-blue-50 dark:bg-blue-500/5' : ''
                    }`}
                    >
                    <td className="px-6 py-4">
                        <input
                        type="checkbox"
                        title={`Select case ${c.id}`}
                        checked={selectedCases.has(c.id)}
                        onChange={(e) => handleSelectCase(c.id, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                    </td>
                    <td
                        className="px-6 py-4 cursor-pointer"
                        onClick={() => navigate(`/cases/${c.id}`)}
                    >
                        <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors">
                            <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">{c.subject_name}</div>
                            <div className="text-sm text-slate-500 font-mono">{c.id.slice(0, 8)}...</div>
                        </div>

                    </div>
                    </td>
                    <td
                        className="px-6 py-4 text-slate-700 dark:text-slate-300 cursor-pointer font-medium"
                        onClick={() => navigate(`/cases/${c.id}`)}
                    >
                        {c.subject_name || 'Unknown Subject'}
                    </td>
                    <td
                        className="px-6 py-4 cursor-pointer"
                        onClick={() => navigate(`/cases/${c.id}`)}
                    >
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(c.status)} border-current bg-opacity-10`}>
                        {c.status.toUpperCase()}
                        </span>
                    </td>
                    <td
                        className="px-6 py-4 cursor-pointer"
                        onClick={() => navigate(`/cases/${c.id}`)}
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${c.risk_score >= 80 ? 'bg-red-500' : c.risk_score >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${c.risk_score}%` }}
                                ></div>
                            </div>
                            <span className={`font-semibold text-sm ${getRiskColor(c.risk_score)}`}>
                            {c.risk_score}
                            </span>
                        </div>
                    </td>
                    <td
                        className="px-6 py-4 text-slate-500 text-sm cursor-pointer whitespace-nowrap"
                        onClick={() => navigate(`/cases/${c.id}`)}
                    >
                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100" />
                    </td>
                    </tr>
                ))
                ) : (
                <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <Briefcase className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No cases found</h3>
                        <p className="text-slate-500 mt-1 mb-6 text-center">
                            We couldn't find any cases matching your search criteria. Try adjusting your filters or create a new case.
                        </p>
                        <button
                            onClick={() => navigate('/cases/new')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Create First Case
                        </button>
                    </div>
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
        )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span>Show</span>
                <select 
                    title="Items per page"
                    value={limit}
                    onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1);
                    }}
                    className="border border-slate-300 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
                <span>per page</span>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                    Page <b>{page}</b> of <b>{totalPages}</b>
                </span>
                <div className="flex items-center gap-2">
                    <button
                        title="Previous page"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 border border-slate-200 dark:border-slate-700 rounded hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        title="Next page"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 border border-slate-200 dark:border-slate-700 rounded hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
