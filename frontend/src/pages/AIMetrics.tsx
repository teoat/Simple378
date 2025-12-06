import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Brain, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  TrendingUp, 
  Activity 
} from 'lucide-react';

export function AIMetrics() {
  const [period, setPeriod] = useState<number>(30);
  
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['ai-metrics', period],
    queryFn: () => api.getAIMetrics(period),
    refetchInterval: 30000 // Refresh every 30s
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading AI insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 dark:bg-red-900/10 rounded-lg">
        <p>Failed to load metrics. Please try again later.</p>
      </div>
    );
  }

  const feedbackData = [
    { name: 'Positive', value: metrics?.feedback.positive || 0, color: '#22c55e' },
    { name: 'Negative', value: metrics?.feedback.negative || 0, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            AI Performance Analytics
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Real-time insights into Frenly AI usage and satisfaction
          </p>
        </div>
        
        <div className="flex gap-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setPeriod(days)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === days
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Last {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Satisfaction Rate</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {metrics?.feedback.satisfaction_rate}%
              </h3>
            </div>
            <div className={`p-3 rounded-full ${
              (metrics?.feedback.satisfaction_rate || 0) >= 90 ? 'bg-green-100 text-green-600' : 
              (metrics?.feedback.satisfaction_rate || 0) >= 70 ? 'bg-yellow-100 text-yellow-600' :
              'bg-red-100 text-red-600'
            }`}>
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>Target: 90%+</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Feedback</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {metrics?.feedback.total}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <MessageSquare className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Recorded interactions
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Positive Feedback</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {metrics?.feedback.positive}
              </h3>
            </div>
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <ThumbsUp className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Helpful responses
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Negative Feedback</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {metrics?.feedback.negative}
              </h3>
            </div>
            <div className="p-3 bg-red-100 text-red-600 rounded-full">
              <ThumbsDown className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Issues flagged
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback Distribution */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Feedback Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={feedbackData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {feedbackData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-slate-600 dark:text-slate-300">Positive ({metrics?.feedback.positive})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-slate-600 dark:text-slate-300">Negative ({metrics?.feedback.negative})</span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">System Health</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Learning System</p>
                <p className="text-sm text-slate-500">Continuous learning loop</p>
              </div>
              <div className="flex items-center text-green-600 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></div>
                Active
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Last Training</p>
                <p className="text-sm text-slate-500">Model fine-tuning update</p>
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {new Date(metrics?.stats.last_updated || Date.now()).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Response Cache</p>
                <p className="text-sm text-slate-500">Redis caching layer</p>
              </div>
              <div className="flex items-center text-green-600 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full text-sm font-medium">
                Enabled
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
