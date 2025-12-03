import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CaseSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function CaseSearch({ value, onChange, className }: CaseSearchProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
      <input
        type="text"
        placeholder="Search cases by ID, subject, or tags..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white transition-all duration-200 shadow-sm hover:shadow-md"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
    </div>
  );
}
