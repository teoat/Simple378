import { QueryClient } from '@tanstack/react-query';

/**
 * Global React Query configuration
 * Handles caching, retries, background updates
 * 
 * Fix #5: Enhanced React Query Configuration with retry and cache settings
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache strategy
      staleTime: 5 * 60 * 1000,              // Consider data stale after 5 min
      gcTime: 10 * 60 * 1000,                 // Keep cache 10 min after no subscribers
      refetchOnWindowFocus: true,             // Refetch when user switches back to tab
      refetchOnReconnect: true,               // Refetch when network reconnects
      
      // Retry strategy with exponential backoff
      retry: (failureCount, error: Error & { response?: { status?: number } }) => {
        // Don't retry client errors (4xx)
        const status = error?.response?.status;
        if (status && status >= 400 && status < 500) {
          return false;
        }
        
        // Retry server errors (5xx) up to 3 times
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => {
        // Exponential backoff: 1s, 2s, 4s, 8s (max 30s)
        return Math.min(1000 * Math.pow(2, attemptIndex), 30000);
      },
      
      // Network mode
      networkMode: 'always',  // Use online/offline events
    },
    
    mutations: {
      // Retry strategy for mutations
      retry: 1,  // Retry once on network errors
      retryDelay: 1000,
      
      // Network mode
      networkMode: 'always',
    }
  }
});

/**
 * Invalidate all queries matching a prefix
 */
export const invalidateQueriesWithPrefix = (prefix: string) => {
  queryClient.invalidateQueries({
    predicate: (query) => {
      const queryKey = query.queryKey;
      if (Array.isArray(queryKey) && queryKey.length > 0) {
        return queryKey[0] === prefix;
      }
      return false;
    }
  });
};

/**
 * Clear all caches - useful for logout
 */
export const clearAllCaches = () => {
  queryClient.clear();
};

/**
 * Prefetch a query - useful for anticipated navigation
 */
export const prefetchQuery = async <T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  staleTime?: number
) => {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: staleTime ?? 5 * 60 * 1000,
  });
};

export default queryClient;
