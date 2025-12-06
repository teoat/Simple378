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
  // Sorting props
  sortBy: 'risk_score' | 'created_at' | 'priority';
  sortOrder: 'asc' | 'desc';
  onSortChange: (key: string, order: 'asc' | 'desc') => void;
}

export function AlertList({ 
  alerts: initialAlerts, 
  selectedId: propSelectedId, 
  onSelect,
  sortBy,
  sortOrder,
  onSortChange
}: AlertListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(propSelectedId || null);

  const handleSelect = (id: string | null) => {
    setSelectedId(id);
    onSelect?.(id);
  };
  const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<string>>(new Set());

  // Filtering state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('');
  
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

  const filteredAlerts = initialAlerts
    .filter(alert => {
      const statusMatch = statusFilter === 'all' || alert.status === statusFilter;
      const riskMatch = riskFilter === '' || alert.risk_score >= parseInt(riskFilter);
      return statusMatch && riskMatch;
    });

  // Alerts are already sorted by the server
  
  // Alerts are always from the current server page
  
  const handleSelectAll = () => {
    if (bulkSelectedIds.size === filteredAlerts.length) {
      setBulkSelectedIds(new Set());
    } else {
      setBulkSelectedIds(new Set(filteredAlerts.map(a => a.id)));
    }
  };

  // Keyboard navigation for main selection
  useHotkeys('up', () => {
    if (filteredAlerts.length === 0) return;
    const currentIndex = filteredAlerts.findIndex(a => a.id === selectedId);
    if (currentIndex > 0) {
      handleSelect(filteredAlerts[currentIndex - 1].id);
    } else if (!selectedId && filteredAlerts.length > 0) {
      handleSelect(filteredAlerts[0].id);
    }
  }, [filteredAlerts, selectedId]);

  useHotkeys('down', () => {
    if (filteredAlerts.length === 0) return;
    const currentIndex = filteredAlerts.findIndex(a => a.id === selectedId);
    if (currentIndex < filteredAlerts.length - 1) {
      setSelectedId(filteredAlerts[currentIndex + 1].id);
    } else if (!selectedId && filteredAlerts.length > 0) {
      handleSelect(filteredAlerts[0].id);
    }
  }, [filteredAlerts, selectedId]);

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

        <select 
          value={`${sortBy}-${sortOrder}`} 
          onChange={(e) => {
            const [key, direction] = e.target.value.split('-');
            onSortChange(key, direction as 'asc' | 'desc');
          }} 
          className="w-[180px] px-3 py-2 border border-slate-300 rounded"
        >
          <option value="priority-desc">Priority (Risk)</option>
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
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
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
      
      {/* Internal Pagination Removed - Managed by Parent */}
    </div>
  );
}
