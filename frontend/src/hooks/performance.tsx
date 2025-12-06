import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

interface VirtualScrollProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

export function VirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = ''
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index
    }));
  }, [items, startIndex, endIndex]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  const offsetY = startIndex * itemHeight;

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div key={index} style={{ height: itemHeight }}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook for managing large datasets with pagination
export function useLargeDataset<T>(
  fetchFunction: (page: number, pageSize: number) => Promise<{ items: T[]; total: number }>,
  pageSize: number = 50
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction(currentPage, pageSize);
      setData(prev => [...prev, ...result.items]);
      setTotalItems(result.total);
      setCurrentPage(prev => prev + 1);
      setHasMore(data.length + result.items.length < result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, currentPage, pageSize, loading, hasMore, data.length]);

  const refresh = useCallback(async () => {
    setData([]);
    setCurrentPage(0);
    setHasMore(true);
    setError(null);
    await loadMore();
  }, [loadMore]);

  // Auto-load first page
  useEffect(() => {
    loadMore();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    loading,
    error,
    totalItems,
    hasMore,
    loadMore,
    refresh
  };
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render #${renderCount.current}, time since last: ${timeSinceLastRender}ms`);
    }

    lastRenderTime.current = now;
  });

  return {
    renderCount: renderCount.current
  };
}

// Memoized data transformation hook
export function useMemoizedTransform<T, R>(
  data: T,
  transform: (data: T) => R,
  dependencies: any[] = []
): R {
  return useMemo(() => {
    const startTime = performance.now();
    const result = transform(data);
    const endTime = performance.now();

    // Log transformation performance
    if (process.env.NODE_ENV === 'development' && endTime - startTime > 10) {
      console.warn(`Data transformation took ${endTime - startTime}ms`);
    }

    return result;
  }, [data, ...dependencies]);
}

// Debounced search hook
export function useDebouncedSearch(
  searchFunction: (query: string) => void,
  delay: number = 300
) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchQuery, delay]);

  useEffect(() => {
    if (debouncedQuery) {
      searchFunction(debouncedQuery);
    }
  }, [debouncedQuery, searchFunction]);

  return {
    searchQuery,
    setSearchQuery,
    debouncedQuery
  };
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  callback: () => void,
  options: IntersectionObserverInit = {}
) {
  const targetRef = useRef<Element | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => {
      if (targetRef.current) {
        observer.unobserve(targetRef.current);
      }
    };
  }, [callback, options]);

  return targetRef;
}

// Service Worker registration hook
export function useServiceWorker() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          setIsRegistered(true);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  const updateServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update().then(() => {
          window.location.reload();
        });
      });
    }
  };

  return {
    isRegistered,
    updateAvailable,
    updateServiceWorker
  };
}

// CDN asset loading hook
export function useCDNAssets() {
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    // Load critical assets from CDN
    const loadAssets = async () => {
      try {
        // Example: Load chart library from CDN
        if (!window.d3) {
          await loadScript('https://d3js.org/d3.v7.min.js');
        }

        // Load other heavy assets as needed
        setAssetsLoaded(true);
      } catch (error) {
        console.error('Failed to load CDN assets:', error);
        setAssetsLoaded(true); // Continue without CDN assets
      }
    };

    loadAssets();
  }, []);

  return { assetsLoaded };
}

// Helper function to load scripts dynamically
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}