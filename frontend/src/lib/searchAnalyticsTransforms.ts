import type { SearchAnalyticsData, SearchDashboardData } from '../types/search';

/**
 * Transform raw API response to normalized SearchAnalyticsData
 */
export function normalizeSearchAnalytics(data: unknown): SearchAnalyticsData {
  const raw = data as Record<string, unknown>;
  
  return {
    total_searches: Number(raw.total_searches || 0),
    unique_users: Number(raw.unique_users || 0),
    average_results: Number(raw.average_results || 0),
    popular_queries: Array.isArray(raw.popular_queries)
      ? (raw.popular_queries as Array<Record<string, unknown>>).map(q => ({
          query: String(q.query || ''),
          count: Number(q.count || 0),
        }))
      : [],
    search_type_distribution: typeof raw.search_type_distribution === 'object'
      ? (raw.search_type_distribution as Record<string, number>)
      : {},
    performance_metrics: {
      average_search_time: Number((raw.performance_metrics as Record<string, unknown>)?.average_search_time || 0),
      cache_hit_rate: Math.min(1, Math.max(0, Number((raw.performance_metrics as Record<string, unknown>)?.cache_hit_rate || 0))),
      search_success_rate: Math.min(1, Math.max(0, Number((raw.performance_metrics as Record<string, unknown>)?.search_success_rate || 0))),
      average_similarity_score: Number((raw.performance_metrics as Record<string, unknown>)?.average_similarity_score || 0),
    },
  };
}

/**
 * Transform raw API response to normalized SearchDashboardData
 */
export function normalizeDashboardData(data: unknown): SearchDashboardData {
  const raw = data as Record<string, unknown>;
  
  return {
    insights: Array.isArray(raw.insights)
      ? (raw.insights as string[])
      : [],
    recommendations: Array.isArray(raw.recommendations)
      ? (raw.recommendations as string[])
      : [],
    trends: Array.isArray(raw.trends)
      ? (raw.trends as Array<Record<string, unknown>>).map(t => ({
          period: String(t.period || ''),
          trend: (t.trend as 'up' | 'down' | 'stable') || 'stable',
          percentage: Number(t.percentage || 0),
        }))
      : [],
  };
}

/**
 * Calculate derived metrics from analytics
 */
export function calculateAnalyticsMetrics(data: SearchAnalyticsData) {
  return {
    avgSearchesPerUser: data.unique_users > 0 
      ? (data.total_searches / data.unique_users).toFixed(2)
      : '0.00',
    topQueryCount: data.popular_queries?.[0]?.count || 0,
    searchTypeVariety: Object.keys(data.search_type_distribution || {}).length,
    performanceRating: calculatePerformanceRating(data.performance_metrics),
  };
}

/**
 * Calculate overall performance rating (1-5 stars)
 */
export function calculatePerformanceRating(metrics: SearchAnalyticsData['performance_metrics']): number {
  const avgTime = metrics.average_search_time || 0;
  const successRate = metrics.search_success_rate || 0;
  const cacheHit = metrics.cache_hit_rate || 0;

  let rating = 3; // Base rating

  if (avgTime < 0.5) rating += 1; // Excellent speed
  else if (avgTime < 1) rating += 0.5; // Good speed

  if (successRate > 0.99) rating += 0.5; // High reliability
  
  if (cacheHit > 0.8) rating += 0.5; // Good cache performance

  return Math.min(5, Math.max(1, rating));
}
