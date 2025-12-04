import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { AlertCard } from './AlertCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/input';

// Keep the Alert interface in one place, here in the list.
interface Alert {
  id: string;
  subject_name: string;
  risk_score: number;
  triggered_rules: string[];
  created_at: string;
  status: 'new' | 'under review' | 'resolved';
}

interface AlertListProps {
  alerts: Alert[];
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
}

type SortKey = 'created_at' | 'risk_score' | 'status';
type SortDirection = 'asc' | 'desc';

export function AlertList({ alerts: initialAlerts, selectedId: propSelectedId, onSelect }: AlertListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(propSelectedId || null);

  const handleSelect = (id: string | null) => {
    setSelectedId(id);
    onSelect?.(id);
  };
  const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<string>>(new Set());

  // Filtering state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('');
  
  // Sorting state
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ALERTS_PER_PAGE = 15;

  const handleToggleBulkSelect = (id: string) => {
    setBulkSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (bulkSelectedIds.size === filteredAlerts.length) {
      setBulkSelectedIds(new Set());
    } else {
      setBulkSelectedIds(new Set(filteredAlerts.map(a => a.id)));
    }
  };
  
  const filteredAlerts = initialAlerts
    .filter(alert => {
      const statusMatch = statusFilter === 'all' || alert.status === statusFilter;
      const riskMatch = riskFilter === '' || alert.risk_score >= parseInt(riskFilter);
      return statusMatch && riskMatch;
    });

  const sortedAlerts = useMemo(() => {
    return [...filteredAlerts].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredAlerts, sortKey, sortDirection]);
  
  const paginatedAlerts = useMemo(() => {
    const startIndex = (currentPage - 1) * ALERTS_PER_PAGE;
    return sortedAlerts.slice(startIndex, startIndex + ALERTS_PER_PAGE);
  }, [sortedAlerts, currentPage]);

  const totalPages = Math.ceil(sortedAlerts.length / ALERTS_PER_PAGE);

  // Keyboard navigation for main selection
  useHotkeys('up', () => {
    if (paginatedAlerts.length === 0) return;
    const currentIndex = paginatedAlerts.findIndex(a => a.id === selectedId);
    if (currentIndex > 0) {
      handleSelect(paginatedAlerts[currentIndex - 1].id);
    } else if (!selectedId && paginatedAlerts.length > 0) {
      handleSelect(paginatedAlerts[0].id);
    }
  }, [paginatedAlerts, selectedId]);

  useHotkeys('down', () => {
    if (paginatedAlerts.length === 0) return;
    const currentIndex = paginatedAlerts.findIndex(a => a.id === selectedId);
    if (currentIndex < paginatedAlerts.length - 1) {
      setSelectedId(paginatedAlerts[currentIndex + 1].id);
    } else if (!selectedId && paginatedAlerts.length > 0) {
      handleSelect(paginatedAlerts[0].id);
    }
  }, [paginatedAlerts, selectedId]);

  return (
    <div className="flex flex-col h-full">
      {/* Filter and Sort Controls */}
      <div className="p-4 bg-white/5 rounded-t-xl border-b border-white/10 flex items-center gap-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-[180px] px-3 py-2 border border-slate-300 rounded">
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="under review">Under Review</option>
          <option value="resolved">Resolved</option>
        </select>
        
        <Input
          type="number"
          placeholder="Min Risk Score"
          value={riskFilter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRiskFilter(e.target.value)}
          className="w-[160px]"
        />

        <select value={`${sortKey}-${sortDirection}`} onChange={(e) => {
          const [key, direction] = e.target.value.split('-');
          setSortKey(key as any);
          setSortDirection(direction as 'asc' | 'desc');
        }} className="w-[180px] px-3 py-2 border border-slate-300 rounded">
          <option value="created_at-desc">Newest First</option>
          <option value="created_at-asc">Oldest First</option>
          <option value="risk_score-desc">Risk: High to Low</option>
          <option value="risk_score-asc">Risk: Low to High</option>
        </select>
      </div>

      {/* Bulk Actions Bar */}
      {bulkSelectedIds.size > 0 && (
        <div className="p-2 px-4 bg-blue-500/10 border-b border-blue-500/20 flex items-center justify-between">
          <span className="text-sm font-semibold text-blue-300">{bulkSelectedIds.size} selected</span>
          <Button variant="ghost" size="sm">
            Actions
          </Button>
        </div>
      )}

      {/* Alert List */}
      <div
        className="flex-grow space-y-2 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        role="list"
        aria-label="Alert Queue"
      >
        <AnimatePresence>
          {paginatedAlerts.length > 0 ? (
            paginatedAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                isSelected={selectedId === alert.id}
                isBulkSelected={bulkSelectedIds.has(alert.id)}
                onSelect={handleSelect}
                onToggleBulkSelect={handleToggleBulkSelect}
              />
            ))
          ) : (
            <div className="text-center py-16 text-slate-500">
              <h3 className="text-lg font-semibold">No Alerts Found</h3>
              <p>Try adjusting your filters.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Pagination and Select All */}
      {totalPages > 1 && (
        <div className="p-2 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="select-all-checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={bulkSelectedIds.size === filteredAlerts.length && filteredAlerts.length > 0}
              onChange={handleSelectAll}
              aria-label="Select all alerts"
            />
            <label htmlFor="select-all-checkbox" className="text-sm text-slate-400">Select All</label>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
              Previous
            </Button>
            <span className="text-sm text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
