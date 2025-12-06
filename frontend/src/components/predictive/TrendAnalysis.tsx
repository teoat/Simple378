import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { api } from '../../lib/api';

interface TrendData {
  trends: Array<{
    metric: string;
    value: number;
    change: number;
    direction: string;
  }>;
  insights: string[];
  recommendations: string[];
  severity_distribution: { [key: string]: number };
  outcome_distribution: { [key: string]: number };
}

export function TrendAnalysis() {
  const [timePeriod, setTimePeriod] = useState('30d');

  const { data: trendData, isLoading } = useQuery<TrendData>({
    queryKey: ['trends', timePeriod],
    queryFn: () => api.get(`/predictive/analytics/trends?time_period=${timePeriod}`)
  });

  const timeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' }
  ];

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <BarChart3 className="h-4 w-4 text-slate-500" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'increasing': return 'text-red-600';
      case 'decreasing': return 'text-green-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Trend Analysis
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            AI-powered insights into case patterns and trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Analytics Dashboard
          </span>
        </div>
      </div>

      {/* Time Period Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Time Period:
            </span>
            <div className="flex gap-2">
              {timeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimePeriod(option.value)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    timePeriod === option.value
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : trendData ? (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendData.trends.map((trend, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 capitalize">
                        {trend.metric.replace('_', ' ')}
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {typeof trend.value === 'number' && trend.metric.includes('rate')
                          ? `${trend.value.toFixed(1)}%`
                          : trend.value.toLocaleString()
                        }
                      </p>
                    </div>
                    {getTrendIcon(trend.direction)}
                  </div>
                  <div className={`text-xs mt-2 ${getTrendColor(trend.direction)}`}>
                    {trend.direction === 'increasing' && '↗️ Increasing'}
                    {trend.direction === 'decreasing' && '↘️ Decreasing'}
                    {trend.direction === 'stable' && '→ Stable'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Severity Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(trendData.severity_distribution).map(([severity, count]) => (
                    <div key={severity} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          severity === 'high' ? 'bg-red-500' :
                          severity === 'medium' ? 'bg-amber-500' :
                          'bg-green-500'
                        }`} />
                        <span className="text-sm font-medium capitalize">{severity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              severity === 'high' ? 'bg-red-500' :
                              severity === 'medium' ? 'bg-amber-500' :
                              'bg-green-500'
                            }`}
                            style={{
                              width: `${(count / Math.max(...Object.values(trendData.severity_distribution))) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Outcome Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(trendData.outcome_distribution).map(([outcome, count]) => (
                    <div key={outcome} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          outcome === 'approved' ? 'bg-green-500' :
                          outcome === 'denied' ? 'bg-red-500' :
                          outcome === 'escalated' ? 'bg-amber-500' :
                          'bg-blue-500'
                        }`} />
                        <span className="text-sm font-medium capitalize">
                          {outcome.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              outcome === 'approved' ? 'bg-green-500' :
                              outcome === 'denied' ? 'bg-red-500' :
                              outcome === 'escalated' ? 'bg-amber-500' :
                              'bg-blue-500'
                            }`}
                            style={{
                              width: `${(count / Math.max(...Object.values(trendData.outcome_distribution))) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights and Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {trendData.insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {trendData.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No trend data available</p>
            <p className="text-sm text-slate-500 mt-1">Try selecting a different time period</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}