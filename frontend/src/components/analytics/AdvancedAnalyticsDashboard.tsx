import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { apiRequest } from '../../lib/api';

interface DashboardMetric {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    tension?: number;
  }[];
}

interface DashboardData {
  metrics: DashboardMetric[];
  charts: {
    riskTrends: ChartData;
    caseStatus: ChartData;
    transactionVolume: ChartData;
    alertDistribution: ChartData;
  };
  alerts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recentActivity: {
    id: string;
    type: string;
    description: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }[];
}

export function AdvancedAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ['analytics-dashboard', timeRange],
    queryFn: () => apiRequest<DashboardData>(`/analytics/dashboard?timeRange=${timeRange}`),
    retry: false,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mock data for development - replace with real API call
  const mockData: DashboardData = useMemo(() => {
    const now = Date.now();
    return {
      metrics: [
        {
          title: 'Total Cases',
          value: 1247,
          change: 12.5,
          changeType: 'increase',
          icon: FileText,
          color: 'blue'
        },
        {
          title: 'Active Alerts',
          value: 89,
          change: -5.2,
          changeType: 'decrease',
          icon: AlertTriangle,
          color: 'red'
        },
        {
          title: 'Risk Score Avg',
          value: '72.4',
          change: 2.1,
          changeType: 'increase',
          icon: TrendingUp,
          color: 'orange'
        },
        {
          title: 'Transactions Processed',
          value: '45.2K',
          change: 8.7,
          changeType: 'increase',
          icon: Activity,
          color: 'green'
        },
        {
          title: 'False Positives',
          value: '3.2%',
          change: -0.8,
          changeType: 'decrease',
          icon: CheckCircle,
          color: 'emerald'
        },
        {
          title: 'Investigation Time',
          value: '2.4h',
          change: -15.3,
          changeType: 'decrease',
          icon: Clock,
          color: 'purple'
        }
      ],
      charts: {
        riskTrends: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Average Risk Score',
            data: [65, 68, 72, 69, 74, 71, 73],
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4
          }]
        },
        caseStatus: {
          labels: ['Open', 'Under Review', 'Escalated', 'Closed'],
          datasets: [{
            label: 'Case Status',
            data: [342, 156, 89, 660],
            backgroundColor: ['#3B82F6', '#F59E0B', '#EF4444', '#10B981']
          }]
        },

        transactionVolume: {
          labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
          datasets: [{
            label: 'Transactions',
            data: [120, 80, 450, 680, 520, 280],
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
          }]
        },
        alertDistribution: {
          labels: ['Low', 'Medium', 'High', 'Critical'],
          datasets: [{
            label: 'Alerts',
            data: [45, 23, 12, 9],
            backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#7C2D12']
          }]
        }

      },
      alerts: {
        critical: 9,
        high: 12,
        medium: 23,
        low: 45
      },
      recentActivity: [
        {
          id: '1',
          type: 'case_created',
          description: 'New high-risk case created for Subject ABC-123',
          timestamp: new Date(now - 1000 * 60 * 5).toISOString(),
          severity: 'high'
        },
        {
          id: '2',
          type: 'alert_triggered',
          description: 'Suspicious transaction pattern detected',
          timestamp: new Date(now - 1000 * 60 * 15).toISOString(),
          severity: 'medium'
        },
        {
          id: '3',
          type: 'case_resolved',
          description: 'Case XYZ-789 marked as resolved',
          timestamp: new Date(now - 1000 * 60 * 30).toISOString(),
          severity: 'low'
        },
        {
          id: '4',
          type: 'anomaly_detected',
          description: 'Unusual transaction volume spike detected',
          timestamp: new Date(now - 1000 * 60 * 45).toISOString(),
          severity: 'critical'
        }
      ]
    };
  }, []);

  const data = dashboardData || mockData;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decrease': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Real-time fraud detection insights and key performance metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant={timeRange === '24h' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('24h')}
            >

              24H
            </Button>
            <Button
              variant={timeRange === '7d' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('7d')}
            >

              7D
            </Button>
            <Button
              variant={timeRange === '30d' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('30d')}
            >

              30D
            </Button>
            <Button
              variant={timeRange === '90d' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('90d')}
            >

              90D
            </Button>
          </div>
          <Button onClick={() => refetch()} size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.metrics.map((metric: DashboardMetric, index: number) => {

          const IconComponent = metric.icon;
          return (
            <Card
              key={index}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedMetric === metric.title ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedMetric(
                selectedMetric === metric.title ? null : metric.title
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-${metric.color}-50 dark:bg-${metric.color}-900/20`}>
                  <IconComponent className={`h-4 w-4 text-${metric.color}-600 dark:text-${metric.color}-400`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {metric.value}
                </div>
                {metric.change && (
                  <div className="flex items-center gap-1 mt-1">
                    {getChangeIcon(metric.changeType || 'neutral')}
                    <span className={`text-xs font-medium ${
                      metric.changeType === 'increase' ? 'text-green-600' :
                      metric.changeType === 'decrease' ? 'text-red-600' :
                      'text-slate-500'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                    <span className="text-xs text-slate-500">vs last period</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Risk Score Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-center text-slate-500">
                <LineChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Interactive Chart</p>
                <p className="text-sm">Risk trends over time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Case Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Case Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-center text-slate-500">
                <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Status Breakdown</p>
                <p className="text-sm">Open, Under Review, Escalated, Closed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Volume */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Transaction Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-center text-slate-500">
                <BarChart3 className="w-8 h-8 mx-auto mb-1 opacity-50" />
                <p className="text-sm">Hourly Volume</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Alert Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.alerts).map(([severity, count]) => (
                <div key={severity} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      severity === 'critical' ? 'bg-red-500' :
                      severity === 'high' ? 'bg-orange-500' :
                      severity === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                    <span className="text-sm capitalize">{severity}</span>
                  </div>
                  <span className="font-semibold">{String(count)}</span>

                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {data.recentActivity.map((activity: DashboardData['recentActivity'][0]) => (

                <div
                  key={activity.id}
                  className={`p-3 rounded-lg border ${getSeverityColor(activity.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      activity.severity === 'critical' ? 'bg-red-500' :
                      activity.severity === 'high' ? 'bg-orange-500' :
                      activity.severity === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}