import { Filter, X } from 'lucide-react';
import { cn } from '../../lib/utils';


interface CaseFiltersProps {
  status: string;
  riskScore: string;
  assignedTo: string;
  onFilterChange: (filters: { status?: string; riskScore?: string; assignedTo?: string }) => void;
  className?: string;
}

export function CaseFilters({ status, riskScore, assignedTo, onFilterChange, className }: CaseFiltersProps) {
  const allStatuses = ['all', 'open', 'in-progress', 'flagged', 'closed'];
  const allRiskScores = ['all', 'high', 'medium', 'low'];
  const allAssignedTo = ['all', 'Alice', 'Bob', 'Charlie']; // Dummy data for assigned users

  const handleClearFilters = () => {
    onFilterChange({ status: 'all', riskScore: 'all', assignedTo: 'all' });
  };

  const isFilterActive = status !== 'all' || riskScore !== 'all' || assignedTo !== 'all';

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="flex items-center gap-2 px-3 py-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
        <Filter className="h-4 w-4 text-slate-500" />
        
        {/* Status Filter */}
        <label htmlFor="status-filter" className="sr-only">Status</label>
        <select
          id="status-filter"
          value={status}
          onChange={(e) => onFilterChange({ status: e.target.value })}
          className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 border-none focus:ring-0 focus:outline-none"
        >
          {allStatuses.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s.replace('-', ' ')}
            </option>
          ))}
        </select>

        {/* Risk Score Filter */}
        <label htmlFor="risk-score-filter" className="sr-only">Risk Score</label>
        <select
          id="risk-score-filter"
          value={riskScore}
          onChange={(e) => onFilterChange({ riskScore: e.target.value })}
          className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 border-none focus:ring-0 focus:outline-none ml-2"
        >
          {allRiskScores.map((rs) => (
            <option key={rs} value={rs} className="capitalize">
              {rs.replace('-', ' ')}
            </option>
          ))}
        </select>

        {/* Assigned To Filter */}
        <label htmlFor="assigned-to-filter" className="sr-only">Assigned To</label>
        <select
          id="assigned-to-filter"
          value={assignedTo}
          onChange={(e) => onFilterChange({ assignedTo: e.target.value })}
          className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 border-none focus:ring-0 focus:outline-none ml-2"
        >
          {allAssignedTo.map((user) => (
            <option key={user} value={user} className="capitalize">
              {user}
            </option>
          ))}
        </select>
      </div>
      
      {isFilterActive && (
        <button
          onClick={handleClearFilters}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          title="Clear all filters"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
