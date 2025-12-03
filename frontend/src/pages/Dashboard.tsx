import React from 'react';
import { Users, AlertTriangle, FileText, Activity } from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { RecentActivity } from '../components/dashboard/RecentActivity';

const stats = [
  { name: 'Active Cases', value: '24', change: '+12%', changeType: 'increase', icon: FileText },
  { name: 'High Risk Subjects', value: '7', change: '+4%', changeType: 'increase', icon: AlertTriangle },
  { name: 'Pending Reviews', value: '12', change: '-2%', changeType: 'decrease', icon: Users },
  { name: 'System Load', value: '34%', change: '+1%', changeType: 'neutral', icon: Activity },
];

export function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight dark:text-white">
          Dashboard
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Overview of current fraud detection operations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <StatCard
            key={item.name}
            name={item.name}
            value={item.value}
            change={item.change}
            changeType={item.changeType as 'increase' | 'decrease' | 'neutral'}
            icon={item.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-800">
          <h3 className="text-base font-semibold leading-6 text-slate-900 dark:text-white">
            Recent Activity
          </h3>
          <div className="mt-6">
            <RecentActivity />
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-800">
          <h3 className="text-base font-semibold leading-6 text-slate-900 dark:text-white">
            Risk Distribution
          </h3>
          <div className="mt-6 flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-500">Chart Placeholder (Recharts/Nivo)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
