import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { Link } from 'react-router-dom';
import { 
  Briefcase, AlertTriangle, Clock, CheckCircle, 
  TrendingUp, TrendingDown, ArrowRight, Users,
  FileText, BarChart3, Zap
} from 'lucide-react';
import { api } from '../lib/api';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { RiskDistributionChart, RiskData } from '../components/dashboard/RiskDistributionChart';
import { WeeklyActivityChart, ActivityData } from '../components/dashboard/WeeklyActivityChart';
import { PipelineHealthStatus, PipelineStage } from '../components/dashboard/PipelineHealthStatus';
import { DataQualityAlerts, DataQualityAlert } from '../components/dashboard/DataQualityAlerts';
import { TrendAnalysis } from '../components/predictive/TrendAnalysis';
import { ScenarioSimulation } from '../components/predictive/ScenarioSimulation';
import { EnhancedMetricCard } from '../components/dashboard/EnhancedMetricCard';
import { CollapsibleSection } from '../components/dashboard/CollapsibleSection';
import '../styles/dashboard-enhanced.css';

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
      color: 'blue' as const,
      link: '/cases',
      sparklineData: [120, 135, 128, 142, 156, 148, 165], // Mock 7-day data
    },
    {
      title: 'High Risk Subjects',
      value: dashboardData?.metrics?.high_risk_subjects ?? 0,
      delta: dashboardData?.metrics?.high_risk_delta ?? 0,
      icon: AlertTriangle,
      color: 'red' as const,
      link: '/cases?risk=high',
      sparklineData: [35, 38, 42, 39, 45, 43, 48],
    },
    {
      title: 'Pending Reviews',
      value: dashboardData?.metrics?.pending_reviews ?? 0,
      delta: dashboardData?.metrics?.pending_delta ?? 0,
      icon: Clock,
      color: 'amber' as const,
      link: '/adjudication',
      sparklineData: [145, 138, 132, 128, 135, 130, 127],
    },
    {
      title: 'Resolved Today',
      value: dashboardData?.metrics?.resolved_today ?? 0,
      delta: dashboardData?.metrics?.resolved_today ?? 0, // Delta is same as value for "today"
      icon: CheckCircle,
      color: 'emerald' as const,
      link: '/cases?status=resolved',
      sparklineData: [15, 18, 22, 19, 25, 21, 23],
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
    <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Enhanced Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">
            <BarChart3 className="w-7 h-7 text-blue-500" />
            Dashboard Overview
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Welcome back. Here's your real-time system status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-600 dark:text-slate-400">Auto-refresh: 30s</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Updated just now
          </div>
        </div>
      </div>

      <DataQualityAlerts alerts={alerts} />

      {/* Enhanced Stats Grid */}
      <div className="dashboard-section">
        <div className="dashboard-grid dashboard-grid-4col">
          {statCards.map((card) => (
            <EnhancedMetricCard
              key={card.title}
              title={card.title}
              value={card.value}
              delta={card.delta}
              icon={card.icon}
              color={card.color}
              link={card.link}
              sparklineData={card.sparklineData}
              updatedAgo="2m"
            />
          ))}
        </div>
      </div>

      <PipelineHealthStatus stages={dashboardData?.pipeline.stages || []} />

      {/* Charts Row with Insights */}
      <div className="dashboard-section">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Chart */}
          <div className="lg:col-span-2">
            <div className="chart-container">
              <div className="chart-header">
                <h3 className="chart-title">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Weekly Activity Trends
                </h3>
              </div>
              <div className="chart-insight">
                <div className="chart-insight-text">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Case volume increased 15% this week ↗️</span>
                </div>
              </div>
              <div className="h-[300px]">
                <WeeklyActivityChart data={dashboardData?.charts.weekly_activity || []} />
              </div>
            </div>
          </div>

          {/* Risk Distribution */}
          <div>
            <div className="chart-container">
              <div className="chart-header">
                <h3 className="chart-title">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Risk Distribution
                </h3>
              </div>
              <div className="chart-insight">
                <div className="chart-insight-text">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">20% of cases are high/critical</span>
                </div>
              </div>
              <div className="h-[300px]">
                <RiskDistributionChart data={dashboardData?.charts.risk_distribution || []} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dashboard-section">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <RecentActivity activities={dashboardData?.activity || []} />

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-500" />
                Quick Actions
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/cases/new" className="quick-action-btn">
                <div className="quick-action-icon bg-gradient-to-br from-blue-500 to-blue-600">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-200">New Case</span>
              </Link>
              <Link to="/ingestion" className="quick-action-btn">
                <div className="quick-action-icon bg-gradient-to-br from-emerald-500 to-emerald-600">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-200">Upload Data</span>
              </Link>
              <Link to="/adjudication" className="quick-action-btn">
                <div className="quick-action-icon bg-gradient-to-br from-amber-500 to-amber-600">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-200">Review Alerts</span>
              </Link>
              <Link to="/settings" className="quick-action-btn">
                <div className="quick-action-icon bg-gradient-to-br from-purple-500 to-purple-600">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-200">Team Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Advanced Analytics */}
      <div className="dashboard-section">
        <CollapsibleSection
          title="Trend Analysis"
          icon={<BarChart3 className="w-5 h-5" />}
          summary="AI-powered insights: Case volume ↗️ 15%, Risk score ↘️ 5%"
          defaultExpanded={false}
        >
          <TrendAnalysis />
        </CollapsibleSection>
      </div>

      <div className="dashboard-section">
        <CollapsibleSection
          title="Scenario Simulation"
          icon={<Zap className="w-5 h-5" />}
          summary="Test different scenarios and predict outcomes"
          defaultExpanded={false}
        >
          <ScenarioSimulation />
        </CollapsibleSection>
      </div>
    </div>
  );
}
