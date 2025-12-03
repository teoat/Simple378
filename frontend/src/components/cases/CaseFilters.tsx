import { Filter, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CaseFiltersProps {
  status: string;
  onStatusChange: (status: string) => void;
  className?: string;
}

export function CaseFilters({ status, onStatusChange, className }: CaseFiltersProps) {
  const statuses = ['all', 'open', 'in-progress', 'flagged', 'closed'];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-2 px-3 py-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
        <Filter className="h-4 w-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Status:</span>
        <div className="flex gap-1">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-200 capitalize",
                status === s
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50"
              )}
            >
              {s.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>
      
      {status !== 'all' && (
        <button
          onClick={() => onStatusChange('all')}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          title="Clear filters"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
