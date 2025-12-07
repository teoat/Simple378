import { QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FrontendAPIError } from '../types/api.d'; // Import FrontendAPIError

/**
 * Global error handler for React Query
 * Redirects for specific HTTP status codes and shows toast for others
 */
const globalErrorHandler = (error: unknown) => {
  if (error instanceof FrontendAPIError) {
    switch (error.code) {
      case 401: // Unauthorized
        window.location.href = '/401';
        break;
      case 403: // Forbidden
        window.location.href = '/403';
        break;
      case 500: // Internal Server Error
        toast.error(`Server Error: ${error.message}`);
        // Consider redirecting to a generic error page like /500
        // window.location.href = '/500';
        break;
      default:
        toast.error(`API Error: ${error.message} (Code: ${error.code})`);
        break;
    }
  } else if (error instanceof Error) {
    toast.error(`An unexpected error occurred: ${error.message}`);
  } else {
    toast.error('An unknown error occurred.');
  }
};

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
        const status = (error as FrontendAPIError)?.code || error?.response?.status;
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
      // onError: globalErrorHandler, // Add global error handler
    },
    
    mutations: {
      // Retry strategy for mutations
      retry: 1,  // Retry once on network errors
      retryDelay: 1000,
      
      // Network mode
      networkMode: 'always',
      onError: globalErrorHandler, // Add global error handler
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
