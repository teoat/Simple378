import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface KPICardProps {
  title: string;
  value: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  status?: 'success' | 'warning' | 'danger' | 'neutral';
}

export function KPICard({ title, value, trend, trendDirection = 'neutral', icon: Icon, status = 'neutral' }: KPICardProps) {
  const statusStyles = {
    success: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    danger: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    neutral: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  };

  const trendStyles = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-slate-500 dark:text-slate-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-xl", statusStyles[status])}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={cn("text-sm font-medium flex items-center gap-1", trendStyles[trendDirection])}>
            {trendDirection === 'up' ? '↑' : trendDirection === 'down' ? '↓' : '•'} {trend}
          </span>
        )}
      </div>
      
      <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</h3>
      <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</div>
    </div>
  );
}
