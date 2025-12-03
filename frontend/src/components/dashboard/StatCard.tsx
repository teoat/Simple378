import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  name: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ElementType;
}

export function StatCard({ name, value, change, changeType, icon: Icon }: StatCardProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 dark:bg-slate-800">
      <dt className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">{name}</dt>
      <dd className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</dd>
      <div className="mt-2 flex items-center text-sm">
        {changeType === 'increase' ? (
          <ArrowUp className="mr-1.5 h-4 w-4 flex-shrink-0 text-green-500" aria-hidden="true" />
        ) : changeType === 'decrease' ? (
          <ArrowDown className="mr-1.5 h-4 w-4 flex-shrink-0 text-red-500" aria-hidden="true" />
        ) : null}
        <span
          className={cn(
            'font-medium',
            changeType === 'increase' ? 'text-green-600' : changeType === 'decrease' ? 'text-red-600' : 'text-slate-500'
          )}
        >
          {change}
        </span>
        <span className="ml-2 text-slate-500 dark:text-slate-400">from last month</span>
      </div>
      <div className="absolute top-4 right-4 rounded-md bg-blue-50 p-2 dark:bg-blue-900/20">
        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
      </div>
    </div>
  );
}
