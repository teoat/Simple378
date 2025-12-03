import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { StatCard } from '../components/dashboard/StatCard';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { RiskDistributionChart } from '../components/dashboard/RiskDistributionChart';
import { WeeklyActivityChart } from '../components/dashboard/WeeklyActivityChart';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { BarChart3, TrendingUp, Users, AlertCircle, Plus } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export function Dashboard() {
  const queryClient = useQueryClient();
  const { data: metrics, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: api.getDashboardMetrics,
  });

  // Real-time updates
  useWebSocket('/ws', {
    onMessage: (message) => {
      if (message.type === 'STATS_UPDATE') {
        queryClient.setQueryData(['dashboard-stats'], message.payload);
        toast.success('Dashboard updated', { 
          id: 'dashboard-update', 
          duration: 2000,
          icon: '🔄',
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          }
        });
      }
    }
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: api.getRecentActivity,
  });

  if (statsLoading || activityLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Overview of fraud detection system status
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            <Plus className="h-5 w-5" />
            New Case
          </motion.button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Active Cases"
            value={metrics?.active_cases ?? 0}
            icon={BarChart3}
            trend={{ value: 12, isPositive: true }}
            index={0}
          />
          <StatCard
            title="High Risk Subjects"
            value={metrics?.high_risk_subjects ?? 0}
            icon={AlertCircle}
            trend={{ value: 5, isPositive: false }}
            index={1}
          />
          <StatCard
            title="Pending Reviews"
            value={metrics?.pending_reviews ?? 0}
            icon={Users}
            index={2}
          />
          <StatCard
            title="System Load"
            value={`${metrics?.system_load ?? 0}%`}
            icon={TrendingUp}
            index={3}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-[400px]">
            <RiskDistributionChart />
          </div>
          <div className="h-[400px]">
            <WeeklyActivityChart />
          </div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <RecentActivity activities={activity ?? []} />
        </motion.div>
      </div>
    </div>
  );
}
