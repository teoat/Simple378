import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { Link } from 'react-router-dom';
import { 
  Briefcase, AlertTriangle, Clock, CheckCircle, 
  TrendingUp, TrendingDown, ArrowRight, Users,
  FileText, Activity
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import {
  LineChartWrapper,
  PieChartWrapper
} from '../components/charts/ChartWrappers';
import { TrendAnalysis } from '../components/predictive/TrendAnalysis';
import { ScenarioSimulation } from '../components/predictive/ScenarioSimulation';

interface DashboardMetrics {
  total_cases: number;
  total_cases_delta: number;
  high_risk_subjects: number;
  high_risk_delta: number;
  pending_reviews: number;
  pending_delta: number;
  resolved_today: number;
}

export function Dashboard() {
  const queryClient = useQueryClient();
  const { lastMessage } = useWebSocket();

  useEffect(() => {
    if (lastMessage?.type === 'STATS_UPDATE') {
      // Invalidate query to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics'] });
    }
  }, [lastMessage, queryClient]);

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: () => apiRequest<DashboardMetrics>('/dashboard/metrics'),
    retry: false,
  });

  // Mock data for charts
  const activityData = [
    { date: 'Week 1', cases: 45, alerts: 23 },
    { date: 'Week 2', cases: 52, alerts: 31 },
    { date: 'Week 3', cases: 48, alerts: 27 },
    { date: 'Week 4', cases: 61, alerts: 42 },
  ];

  const riskDistribution = [
    { name: 'Critical', value: 5 },
    { name: 'High', value: 15 },
    { name: 'Medium', value: 35 },
    { name: 'Low', value: 45 },
  ];

  const statCards = [
    {
      title: 'Total Cases',
      value: metrics?.total_cases ?? 1234,
      delta: metrics?.total_cases_delta ?? 12,
      icon: Briefcase,
      color: 'blue',
      link: '/cases',
    },
    {
      title: 'High Risk Subjects',
      value: metrics?.high_risk_subjects ?? 45,
      delta: metrics?.high_risk_delta ?? 3,
      icon: AlertTriangle,
      color: 'red',
      link: '/cases?risk=high',
    },
    {
      title: 'Pending Reviews',
      value: metrics?.pending_reviews ?? 127,
      delta: metrics?.pending_delta ?? -15,
      icon: Clock,
      color: 'amber',
      link: '/adjudication',
    },
    {
      title: 'Resolved Today',
      value: metrics?.resolved_today ?? 23,
      delta: 23,
      icon: CheckCircle,
      color: 'emerald',
      link: '/cases?status=resolved',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">Last updated: Just now</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-500/30 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl bg-${card.color}-50 dark:bg-${card.color}-500/10`}>
                <card.icon className={`w-6 h-6 text-${card.color}-600 dark:text-${card.color}-400`} />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {isLoading ? '...' : card.value.toLocaleString()}
                </span>
                {card.delta !== 0 && (
                  <span className={`flex items-center text-sm ${card.delta > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {card.delta > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {Math.abs(card.delta)} today
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2">
          <LineChartWrapper
            data={activityData}
            xKey="date"
            yKeys={[
              { key: 'cases', name: 'Cases', color: '#3b82f6' },
              { key: 'alerts', name: 'Alerts', color: '#ef4444' },
            ]}
            title="Case Activity (30 Days)"
            subtitle="New cases and alerts over time"
            height={300}
          />
        </div>

        {/* Risk Distribution */}
        <div>
          <PieChartWrapper
            data={riskDistribution}
            dataKey="value"
            nameKey="name"
            title="Risk Distribution"
            subtitle="Cases by risk level"
            height={300}
            innerRadius={60}
            outerRadius={100}
            colors={['#ef4444', '#f59e0b', '#3b82f6', '#10b981']}
          />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Activity</h3>
            <Activity className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            {[
              { action: 'Case #123 reviewed', user: 'John D.', time: '2 min ago', type: 'review' },
              { action: 'New alert detected', user: 'System', time: '5 min ago', type: 'alert' },
              { action: 'Case #456 closed', user: 'Jane S.', time: '12 min ago', type: 'close' },
              { action: 'New case created', user: 'Mike R.', time: '25 min ago', type: 'create' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 mt-2 rounded-full ${
                  item.type === 'alert' ? 'bg-red-500' : 
                  item.type === 'review' ? 'bg-blue-500' : 
                  item.type === 'close' ? 'bg-emerald-500' : 'bg-slate-400'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-slate-900 dark:text-slate-100">{item.action}</p>
                  <p className="text-xs text-slate-500">{item.user} • {item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/cases/new"
              className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Briefcase className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-slate-700 dark:text-slate-200">New Case</span>
            </Link>
            <Link
              to="/ingestion"
              className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <FileText className="w-5 h-5 text-emerald-500" />
              <span className="font-medium text-slate-700 dark:text-slate-200">Upload Data</span>
            </Link>
            <Link
              to="/adjudication"
              className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span className="font-medium text-slate-700 dark:text-slate-200">Review Alerts</span>
            </Link>
            <Link
              to="/settings"
              className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Users className="w-5 h-5 text-purple-500" />
              <span className="font-medium text-slate-700 dark:text-slate-200">Team Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Trend Analysis */}
      <TrendAnalysis />

      {/* Scenario Simulation */}
      <ScenarioSimulation />
    </div>
  );
}
