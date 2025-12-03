import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 dark:bg-slate-800">
      <dl>
        <dt className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </dt>
        <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
          <div className="flex items-baseline text-2xl font-semibold text-slate-900 dark:text-white">
            {value}
          </div>
          {trend && (
            <div
              className={`inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-medium md:mt-2 lg:mt-0 ${
                trend.isPositive
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {trend.isPositive ? '+' : '-'}{trend.value}%
            </div>
          )}
        </dd>
      </dl>
      <div className="absolute top-4 right-4 rounded-md bg-blue-50 p-2 dark:bg-blue-900/20">
        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
      </div>
    </div>
  );
}
