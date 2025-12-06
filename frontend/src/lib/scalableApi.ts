import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { LoadBalancer } from '../hooks/useScaling';

/**
 * Enhanced API client with load balancing and distributed caching
 * Distributes requests across multiple servers and caches responses
 * 
 * Fix #1: This is the primary API client - api.ts re-exports this
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const BACKUP_URL = import.meta.env.VITE_API_BACKUP_URL || null;

export class ScalableApiClient {
  private client: AxiosInstance;
  private loadBalancer: LoadBalancer;
  private servers: string[];
  private inMemoryCache: Map<string, { data: unknown; timestamp: number; ttl: number }> = new Map();

  constructor(servers: string[] = [BASE_URL]) {
    this.servers = servers.filter(Boolean);
    this.loadBalancer = new LoadBalancer(this.servers, 'round-robin');


    this.client = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add interceptors
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor: add auth token and select server
    this.client.interceptors.request.use(
      async (config) => {
        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // For relative URLs, prepend the base URL
        if (config.url && !config.url.startsWith('http')) {
          // Use load balancer if multiple servers
          if (this.servers.length > 1) {
            const server = this.loadBalancer.getNextServer();
            config.baseURL = server;
          } else {
            config.baseURL = BASE_URL;
          }
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: cache successful reads, handle errors
    this.client.interceptors.response.use(
      (response) => {
        // Cache GET requests in memory
        if (response.config.method === 'get' && response.config.url) {
          this.setCacheEntry(response.config.url, response.data);
        }
        return response;
      },
      async (error) => {
        const config = error.config;

        // If GET request failed, try in-memory cache
        if (config?.method === 'get') {
          const cached = this.getCacheEntry(config.url || '');
          if (cached) {
            console.log('[ScalableApi] Returning cached response for:', config.url);
            return { data: cached, status: 200, config, fromCache: true };
          }
        }

        // If server error and has backup, try next server
        if (error.response?.status >= 500 && config && this.servers.length > 1) {
          const nextServer = this.loadBalancer.getNextServer();
          if (nextServer !== config.baseURL) {
            console.log('[ScalableApi] Retrying with server:', nextServer);
            config.baseURL = nextServer;
            config._retry = true;
            return this.client(config);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private setCacheEntry(key: string, data: unknown, ttl: number = 60000): void {
    this.inMemoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    // Cleanup old entries periodically
    if (this.inMemoryCache.size > 100) {
      this.cleanupCache();
    }
  }

  private getCacheEntry(key: string): unknown | null {
    const entry = this.inMemoryCache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.inMemoryCache.delete(key);
      return null;
    }

    return entry.data;
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.inMemoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.inMemoryCache.delete(key);
      }
    }
  }

  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * Add servers to load balancer (for dynamic scaling)
   */
  addServers(servers: string[]) {
    servers.forEach(server => {
      if (!this.servers.includes(server)) {
        this.servers.push(server);
        this.loadBalancer = new LoadBalancer(this.servers, 'round-robin');
      }
    });
  }

  /**
   * Remove servers from load balancer (for decommissioning)
   */
  removeServers(servers: string[]) {
    this.servers = this.servers.filter(s => !servers.includes(s));
    if (this.servers.length === 0) {
      this.servers = [BASE_URL];
    }
    this.loadBalancer = new LoadBalancer(this.servers, 'round-robin');
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.inMemoryCache.clear();
  }

  /**
   * Get current server list
   */
  getServers(): string[] {
    return [...this.servers];
  }
}

// Build server list from environment
const serverList: string[] = [BASE_URL];
if (BACKUP_URL) {
  serverList.push(BACKUP_URL);
}

// Export singleton instance
export const scalableApi = new ScalableApiClient(serverList);

export default scalableApi;
