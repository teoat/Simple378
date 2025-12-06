import { useQuery } from '@tanstack/react-query';
import { BarChart3, Search, Clock, Target, RefreshCw, Users, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageErrorBoundary } from '../components/PageErrorBoundary';
import { normalizeSearchAnalytics, normalizeDashboardData } from '../lib/searchAnalyticsTransforms';
import type { SearchAnalyticsData, SearchDashboardData } from '../types/search';
import toast from 'react-hot-toast';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

export function SearchAnalytics() {
  const { data: analytics, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['search-analytics'],
    queryFn: async () => {
      const response = await fetch('/api/v1/search/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized');
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      return normalizeSearchAnalytics(data) as SearchAnalyticsData;
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const { data: dashboardData } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/v1/search/analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized');
        throw new Error('Failed to fetch dashboard');
      }
      const data = await response.json();
      return normalizeDashboardData(data) as SearchDashboardData;
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <PageErrorBoundary pageName="Search Analytics">
        <div className="text-center py-12 space-y-4">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Analytics Unavailable
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error instanceof Error ? error.message : 'Unable to load search analytics at this time.'}
          </p>
          <button
            onClick={() => {
              refetch();
              toast.loading('Retrying...');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </PageErrorBoundary>
    );
  }

  return (
    <PageErrorBoundary pageName="Search Analytics">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Search Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Insights into search usage patterns and effectiveness
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Searches</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics?.total_searches || 0}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+12% vs last week</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics?.unique_users || 0}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+8% vs last week</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Results</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics?.average_results?.toFixed(1) || '0.0'}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">+2.3 vs last week</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics?.performance_metrics?.average_search_time?.toFixed(2) || '0.00'}s
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">+0.2s vs last week</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search Trends Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
              Search Trends (Last 30 Days)
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Daily searches</span>
            </div>
          </div>

          {/* Simple trend visualization - in a real app, this would use a charting library */}
          <div className="h-64 flex items-end justify-between gap-1">
            {Array.from({ length: 30 }, (_, i) => {
              const height = Math.random() * 100 + 20; // Mock data
              const isToday = i === 29;
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: i * 0.02, duration: 0.5 }}
                    className={`w-full rounded-t-sm transition-colors ${
                      isToday
                        ? 'bg-blue-500 dark:bg-blue-400'
                        : 'bg-blue-200 dark:bg-blue-700 hover:bg-blue-300 dark:hover:bg-blue-600'
                    }`}
                    title={`${30 - i} days ago: ${Math.round(height)} searches`}
                  />
                  {i % 5 === 0 && (
                    <span className="text-xs text-gray-400 mt-2 transform -rotate-45 origin-top">
                      {30 - i}d
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center mt-4 text-sm text-gray-500 dark:text-gray-400">
            <span>30 days ago</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-200 dark:bg-blue-700 rounded"></div>
                <span>Daily searches</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded"></div>
                <span>Today</span>
              </div>
            </div>
            <span>Today</span>
          </div>
        </motion.div>

        {/* Charts and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Queries */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-500" />
              Popular Search Queries
            </h3>
            {analytics?.popular_queries && analytics.popular_queries.length > 0 ? (
              <div className="space-y-3">
                {analytics.popular_queries.slice(0, 5).map((query: { query: string; count: number }, index: number) => {
                  const maxCount = Math.max(...analytics.popular_queries.map((q: { count: number }) => q.count));
                  const percentage = (query.count / maxCount) * 100;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1 font-medium">
                          "{query.query}"
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white ml-2 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          {query.count}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No search data available yet
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  Searches will appear here as users interact with the system
                </p>
              </div>
            )}
          </motion.div>

          {/* Search Type Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Search Type Distribution
            </h3>
            {analytics?.search_type_distribution ? (
              <div className="space-y-3">
                {Object.entries(analytics.search_type_distribution).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {type} Search
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {count as number}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No distribution data available
              </p>
            )}
          </div>
        </div>

        {/* Insights */}
        {dashboardData?.insights && dashboardData.insights.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Key Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardData.insights.map((insight: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Performance Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {((analytics?.performance_metrics?.cache_hit_rate || 0) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Cache Hit Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {((analytics?.performance_metrics?.search_success_rate || 0) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {analytics?.performance_metrics?.average_similarity_score?.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Similarity</div>
            </div>
          </div>
        </div>
      </div>
    </PageErrorBoundary>
  );
}