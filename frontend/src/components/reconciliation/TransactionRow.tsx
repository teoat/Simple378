
import { GripVertical, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TransactionRowProps {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'matched' | 'unmatched' | 'flagged';
  type: 'expense' | 'bank';
}

export function TransactionRow({ id, date, description, amount, status, type }: TransactionRowProps) {
  return (
    <div
      className={cn(
        'group flex items-center justify-between rounded-xl border p-4 backdrop-blur-sm transition-all hover:shadow-lg',
        status === 'matched'
          ? 'border-green-500/50 bg-green-500/10 dark:bg-green-500/20 shadow-green-500/10'
          : status === 'flagged'
          ? 'border-red-500/50 bg-red-500/10 dark:bg-red-500/20 shadow-red-500/10'
          : 'border-yellow-500/30 bg-yellow-500/5 dark:bg-yellow-500/10 border-dashed shadow-yellow-500/5'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="cursor-grab text-slate-400 hover:text-slate-600 active:cursor-grabbing dark:text-slate-500 dark:hover:text-slate-300">
          <GripVertical className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">{description}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{date} • ID: {id}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <span className={cn(
          "font-mono text-sm font-semibold",
          type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
        )}>
          {type === 'expense' ? '-' : '+'}${amount.toFixed(2)}
        </span>
        
        {status === 'matched' && (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">Matched</span>
          </div>
        )}
        {status === 'flagged' && (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-xs text-red-600 dark:text-red-400 font-medium">Flagged</span>
          </div>
        )}
        {status === 'unmatched' && (
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full border-2 border-dashed border-yellow-400 dark:border-yellow-500" />
            <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Unmatched</span>
          </div>
        )}
      </div>
    </div>
  );
}
