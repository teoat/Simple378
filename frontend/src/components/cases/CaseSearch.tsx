import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { forwardRef, useRef, useEffect } from 'react';

interface CaseSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const CaseSearch = forwardRef<HTMLInputElement, CaseSearchProps>(
  ({ value, onChange, className }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Trap focus when search is active
    useEffect(() => {
      if (value && containerRef.current) {
        const container = containerRef.current;
        
        const handleTab = (e: KeyboardEvent) => {
          if (e.key === 'Tab') {
            const focusableElements = container.querySelectorAll(
              'button, input, [href], [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement?.focus();
              }
            } else {
              if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement?.focus();
              }
            }
          }
        };

        container.addEventListener('keydown', handleTab as EventListener);
        return () => {
          container.removeEventListener('keydown', handleTab as EventListener);
        };
      }
    }, [value]);

    return (
      <div ref={containerRef} className={cn("relative", className)}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          ref={ref}
          type="text"
          placeholder="Search cases by ID, subject, or tags..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white transition-all duration-200 shadow-sm hover:shadow-md"
          aria-label="Search cases"
          aria-describedby="search-hint"
        />
        <span id="search-hint" className="sr-only">
          Press / to focus search, ESC to clear
        </span>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
          {value ? (
            <button
              onClick={() => onChange('')}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
              aria-label="Clear search"
            >
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                <span className="text-xs">ESC</span>
              </kbd>
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
              <span className="text-xs">/</span>
            </kbd>
          )}
        </div>
      </div>
    );
  }
);

CaseSearch.displayName = 'CaseSearch';
