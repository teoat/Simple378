import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Check, AlertTriangle, Unlink, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';

// Re-using types from parent or defining shared types would be better, 
// but for now I'll duplicate the interface to keep this component self-contained for the refactor.
interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  account: string;
  category: string;
  source: 'internal' | 'external';
  matchStatus: 'matched' | 'unmatched' | 'pending' | 'conflict';
  matchedWith?: string;
  confidence?: number;
}

interface VirtualTransactionListProps {
  transactions: Transaction[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUnmatch?: (id: string) => void;
  colorTheme: 'blue' | 'purple';
  height?: number; // Optional fixed height for the container
}

export function VirtualTransactionList({
  transactions,
  selectedId,
  onSelect,
  onUnmatch,
  colorTheme,
  height = 600
}: VirtualTransactionListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimate based on visual average
    overscan: 5,
  });

  const getStatusBadge = (status: Transaction['matchStatus'], confidence?: number) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1';
    switch (status) {
      case 'matched':
        return <span className={`${baseClasses} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`}><Check className="h-3 w-3" /> Matched</span>;
      case 'unmatched':
        return <span className={`${baseClasses} bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400`}>Unmatched</span>;
      case 'pending':
        return <span className={`${baseClasses} bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400`}><AlertTriangle className="h-3 w-3" /> Review ({Math.round((confidence || 0) * 100)}%)</span>;
      case 'conflict':
        return <span className={`${baseClasses} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`}><AlertTriangle className="h-3 w-3" /> Conflict</span>;
      default:
        return null;
    }
  };

  return (
    <div 
      ref={parentRef} 
      className="w-full overflow-y-auto pr-2"
      style={{ height: height }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const transaction = transactions[virtualRow.index];
          const isSelected = selectedId === transaction.id;
          
          return (
            <div
              key={transaction.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                paddingBottom: '8px' // Gap between items
              }}
              ref={rowVirtualizer.measureElement}
              data-index={virtualRow.index}
            >
              <div
                className={`p-4 rounded-lg border transition-all cursor-pointer h-full ${
                  isSelected
                    ? colorTheme === 'blue' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md ring-1 ring-blue-500' 
                        : 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md ring-1 ring-purple-500'
                    : transaction.matchStatus === 'matched'
                    ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                }`}
                onClick={() => onSelect(transaction.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-1 rounded">
                        {transaction.id.slice(0, 8)}...
                      </span>
                      {getStatusBadge(transaction.matchStatus, transaction.confidence)}
                    </div>
                    <p className="font-medium truncate text-slate-900 dark:text-slate-100" title={transaction.description}>
                      {transaction.description}
                    </p>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <span>{transaction.date}</span>
                      <span>•</span>
                      <span>{transaction.account}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${
                      transaction.amount < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'
                    }`}>
                      ${Math.abs(transaction.amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full inline-block mt-1">
                      {transaction.category}
                    </p>
                  </div>
                </div>
                
                {transaction.matchedWith && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Matched: <span className="font-mono">{transaction.matchedWith.slice(0, 8)}...</span>
                    </span>
                    {onUnmatch && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 px-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnmatch(transaction.id);
                        }}
                      >
                        <Unlink className="h-3 w-3 mr-1" /> Unmatch
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
