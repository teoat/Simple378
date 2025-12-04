import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useHotkeys } from 'react-hotkeys-hook';
import toast from 'react-hot-toast';
import { api } from '../lib/api';

export function useCaseList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());

  // Keyboard shortcuts
  useHotkeys('/', (e) => {
    e.preventDefault();
    // Focus handled in component
    toast("Press ESC to exit search", { icon: "🔍", duration: 1500 });
  });

  useHotkeys('escape', () => {
    if (searchQuery) {
      setSearchQuery('');
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

  // Queries
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

  // Handlers
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleSelectCase = (id: string) => {
    setSelectedCases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected && data?.items) {
      setSelectedCases(new Set(data.items.map(c => c.id)));
    } else {
      setSelectedCases(new Set());
    }
  };

  const clearSelection = () => setSelectedCases(new Set());

  return {
    // State
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    sortBy,
    sortOrder,
    selectedCases,
    data,
    isLoading,
    error,

    // Handlers
    handleSort,
    handleSelectCase,
    handleSelectAll,
    clearSelection,
  };
}