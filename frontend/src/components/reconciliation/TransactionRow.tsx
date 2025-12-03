import React from 'react';
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
        'group flex items-center justify-between rounded-md border p-3 shadow-sm transition-all hover:shadow-md',
        status === 'matched'
          ? 'border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/20'
          : status === 'flagged'
          ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20'
          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
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
        
        {status === 'matched' && <CheckCircle className="h-5 w-5 text-green-500" />}
        {status === 'flagged' && <AlertCircle className="h-5 w-5 text-red-500" />}
        {status === 'unmatched' && <div className="h-5 w-5 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600" />}
      </div>
    </div>
  );
}
