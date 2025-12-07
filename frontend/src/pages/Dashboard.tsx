import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { Link } from 'react-router-dom';
import { 
  Briefcase, AlertTriangle, Clock, CheckCircle, 
  TrendingUp, TrendingDown, ArrowRight, Users,
  FileText
} from 'lucide-react';
import { api } from '../lib/api';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { RiskDistributionChart, RiskData } from '../components/dashboard/RiskDistributionChart';
import { WeeklyActivityChart, ActivityData } from '../components/dashboard/WeeklyActivityChart';
import { PipelineHealthStatus, PipelineStage } from '../components/dashboard/PipelineHealthStatus';
import { DataQualityAlerts, DataQualityAlert } from '../components/dashboard/DataQualityAlerts';
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

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  user: string;
}

interface DashboardChartData {
  risk_distribution: RiskData[];
  weekly_activity: ActivityData[];
}

interface DashboardPipelineStatus {
  stages: PipelineStage[];
}

interface DashboardData {
  metrics: DashboardMetrics;
  activity: ActivityItem[];
  charts: DashboardChartData;
  pipeline: DashboardPipelineStatus;
}

export function Dashboard() {
  const queryClient = useQueryClient();
  const { lastMessage } = useWebSocket();

  useEffect(() => {
    if (lastMessage?.type === 'STATS_UPDATE') {
      // Invalidate query to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  }, [lastMessage, queryClient]);

  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      try {
        // Parallel fetch implementation with better error handling
        const [metrics, activity, charts] = await Promise.all([
          api.get<DashboardMetrics>('/dashboard/metrics'),
          api.get<ActivityItem[]>('/dashboard/activity'),
          api.get<DashboardChartData>('/dashboard/charts'),
        ]);
        
        // Mock pipeline data for now until we have dedicated endpoint
        const pipeline: DashboardPipelineStatus = {
          stages: [
            { id: '1', name: 'Ingestion', status: 'healthy', metric: '1,245', metricLabel: 'Records' },
            { id: '2', name: 'Categorize', status: 'warning', metric: '89%', metricLabel: 'Complete' },
            { id: '3', name: 'Reconcile', status: 'healthy', metric: '94%', metricLabel: 'Match Rate' },
            { id: '4', name: 'Adjudicate', status: 'critical', metric: '12', metricLabel: 'Pending' },
            { id: '5', name: 'Visualize', status: 'healthy', metric: 'Ready', metricLabel: 'Status' }
          ]
        };

        return { metrics, activity, charts, pipeline };
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        throw err;
      }
    },
    refetchInterval: 30000,
    retry: 2,
    retryDelay: 1000,
  });

  const alerts: DataQualityAlert[] = useMemo(() => {
    if (!dashboardData) return [];
    
    const generatedAlerts: DataQualityAlert[] = [];
    
    // Logic to generate quality alerts based on metrics
    if (dashboardData.metrics.pending_reviews > 100) {
      generatedAlerts.push({
        id: 'adj_backlog',
        type: 'critical',
        title: 'Adjudication Backlog',
        description: `High volume of pending reviews (${dashboardData.metrics.pending_reviews} items).`,
        actionText: 'Go to Queue',
        actionHandler: () => window.location.href = '/adjudication'
      });
    }

    if (dashboardData.metrics.high_risk_subjects > 20) {
      generatedAlerts.push({
         id: 'high_risk_spike',
         type: 'warning',
         title: 'High Risk Subject Spike',
         description: `${dashboardData.metrics.high_risk_subjects} subjects flagged as high risk.`,
         actionText: 'Review Subjects',
         actionHandler: () => window.location.href = '/cases?risk=high'
      });
    }

    return generatedAlerts;
  }, [dashboardData]);

  const statCards = [
    {
      title: 'Total Cases',
      value: dashboardData?.metrics?.total_cases ?? 0,
      delta: dashboardData?.metrics?.total_cases_delta ?? 0,
      icon: Briefcase,
      color: 'blue',
      link: '/cases',
    },
    {
      title: 'High Risk Subjects',
      value: dashboardData?.metrics?.high_risk_subjects ?? 0,
      delta: dashboardData?.metrics?.high_risk_delta ?? 0,
      icon: AlertTriangle,
      color: 'red',
      link: '/cases?risk=high',
    },
    {
      title: 'Pending Reviews',
      value: dashboardData?.metrics?.pending_reviews ?? 0,
      delta: dashboardData?.metrics?.pending_delta ?? 0,
      icon: Clock,
      color: 'amber',
      link: '/adjudication',
    },
    {
      title: 'Resolved Today',
      value: dashboardData?.metrics?.resolved_today ?? 0,
      delta: dashboardData?.metrics?.resolved_today ?? 0, // Delta is same as value for "today"
      icon: CheckCircle,
      color: 'emerald',
      link: '/cases?status=resolved',
    },
  ];

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-screen">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Dashboard Unavailable
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Unable to load dashboard data. Please check your connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && !dashboardData) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-screen text-slate-500 dark:text-slate-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-lg">Loading Dashboard...</p>
      </div>
    );
  }

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

      <DataQualityAlerts alerts={alerts} />

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
                  {card.value.toLocaleString()}
                </span>
                {card.delta !== 0 && (
                  <span className={`flex items-center text-sm ${card.delta > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {card.delta > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {Math.abs(card.delta)} {card.title === 'Resolved Today' ? '' : 'today'}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <PipelineHealthStatus stages={dashboardData?.pipeline.stages || []} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 h-[380px]">
           <WeeklyActivityChart data={dashboardData?.charts.weekly_activity || []} />
        </div>

        {/* Risk Distribution */}
        <div className="h-[380px]">
          <RiskDistributionChart data={dashboardData?.charts.risk_distribution || []} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <RecentActivity activities={dashboardData?.activity || []} />

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
