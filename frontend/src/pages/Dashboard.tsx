import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { StatCard } from '../components/dashboard/StatCard';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { BarChart3, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: api.getDashboardMetrics,
    refetchInterval: 30000, // Refetch every 30s
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: api.getRecentActivity,
  });

  if (metricsLoading || activityLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            New Case
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Active Cases"
          value={metrics?.active_cases ?? 0}
          icon={BarChart3}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="High Risk Subjects"
          value={metrics?.high_risk_subjects ?? 0}
          icon={TrendingUp}
          trend={{ value: 5, isPositive: false }}
        />
        <StatCard
          title="Pending Reviews"
          value={metrics?.pending_reviews ?? 0}
          icon={BarChart3}
        />
        <StatCard
          title="System Load"
          value={`${metrics?.system_load ?? 0}%`}
          icon={TrendingUp}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
            Case Risk Distribution
          </h2>
          <div className="h-64 flex items-center justify-center text-slate-400">
            Chart Placeholder
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
            Weekly Activity
          </h2>
          <div className="h-64 flex items-center justify-center text-slate-400">
            Chart Placeholder
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <RecentActivity activities={activity ?? []} />
      </div>
    </div>
  );
}
