import { useCallback, useRef } from 'react';

/**
 * Horizontal scaling utilities for load distribution
 */
export class LoadBalancer {
  private servers: string[];
  private currentIndex = 0;
  private strategy: 'round-robin' | 'least-connections';

  constructor(servers: string[], strategy: 'round-robin' | 'least-connections' = 'round-robin') {
    this.servers = servers;
    this.strategy = strategy;
  }

  /**
   * Round-robin load balancing
   */
  getNextServer(): string {
    const server = this.servers[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.servers.length;
    return server;
  }

  /**
   * Least-connections load balancing
   */
  async getServerWithLeastConnections(): Promise<string> {
    // If only one server, return it
    if (this.servers.length === 1) {
      return this.servers[0];
    }

    const loads = await Promise.all(
      this.servers.map(async (server) => {
        try {
          const response = await fetch(`${server}/api/health/load`);
          const data = await response.json();
          return { server, load: data.connections as number };
        } catch {
          return { server, load: Infinity };
        }
      })
    );

    const best = loads.reduce((min, current) => (current.load < min.load ? current : min));
    return best.server;
  }

  /**
   * Get current strategy
   */
  getStrategy(): string {
    return this.strategy;
  }
}

interface CacheEntry {
  value: unknown;
  ttl: number;
  timestamp: number;
}

/**
 * Distributed cache management
 */
export class DistributedCache {
  private cacheServers: string[];

  constructor(cacheServers: string[]) {
    this.cacheServers = cacheServers;
  }

  private getServerForKey(key: string): string {
    // Consistent hashing
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    const index = Math.abs(hash) % this.cacheServers.length;
    return this.cacheServers[index];
  }

  async get<T>(key: string): Promise<T | null> {
    const server = this.getServerForKey(key);
    try {
      const response = await fetch(`${server}/cache/${key}`);
      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      console.error(`Cache GET failed for ${key}:`, error);
    }
    return null;
  }

  async set(key: string, value: unknown, ttl: number = 3600): Promise<boolean> {
    const server = this.getServerForKey(key);
    try {
      const cacheEntry: CacheEntry = { value, ttl, timestamp: Date.now() };
      const response = await fetch(`${server}/cache/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cacheEntry),
      });
      return response.ok;
    } catch (error) {
      console.error(`Cache SET failed for ${key}:`, error);
      return false;
    }
  }
}

/**
 * Hook for client-side load balancing
 */
export function useLoadBalancing(apiServers: string[]) {
  const balancerRef = useRef(new LoadBalancer(apiServers));

  const getNextServer = useCallback(() => {
    return balancerRef.current.getNextServer();
  }, []);

  const getOptimalServer = useCallback(async () => {
    return balancerRef.current.getServerWithLeastConnections();
  }, []);

  return { getNextServer, getOptimalServer };
}

/**
 * Hook for distributed caching
 */
export function useDistributedCache(cacheServers: string[]) {
  const cacheRef = useRef(new DistributedCache(cacheServers));

  const get = useCallback(async <T,>(key: string): Promise<T | null> => {
    return cacheRef.current.get<T>(key);
  }, []);

  const set = useCallback(async (key: string, value: unknown, ttl?: number): Promise<boolean> => {
    return cacheRef.current.set(key, value, ttl);
  }, []);

  return { get, set };
}
