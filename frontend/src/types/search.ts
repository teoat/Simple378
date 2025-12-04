/**
 * Search & Analytics Types
 * Type definitions for search functionality and analytics dashboard
 */

/**
 * Individual search query analytics
 */
export interface SearchQueryAnalytics {
  query: string;
  count: number;
  averageResultsReturned: number;
  averageResponseTime: number;
  lastSearched: string;
}

/**
 * Search analytics dashboard data
 */
export interface SearchAnalyticsData {
  total_searches: number;
  unique_users: number;
  average_results: number;
  popular_queries: Array<{
    query: string;
    count: number;
  }>;
  search_type_distribution: Record<string, number>;
  performance_metrics: {
    average_search_time: number;
    cache_hit_rate: number;
    search_success_rate: number;
    average_similarity_score: number;
  };
}

/**
 * Dashboard insights
 */
export interface SearchDashboardData {
  insights: string[];
  recommendations: string[];
  trends: {
    period: string;
    trend: 'up' | 'down' | 'stable';
    percentage: number;
  }[];
}

/**
 * Search request payload
 */
export interface SearchRequest {
  query: string;
  filters?: Record<string, unknown>;
  limit?: number;
  offset?: number;
}

/**
 * Search response
 */
export interface SearchResponse<T = unknown> {
  results: T[];
  total: number;
  executionTime: number;
  cachedResult: boolean;
}

/**
 * Analytics filter options
 */
export interface AnalyticsFilter {
  startDate: string;
  endDate: string;
  searchType?: 'all' | 'case' | 'transaction' | 'entity';
  userType?: 'all' | 'investigator' | 'analyst' | 'admin';
}
