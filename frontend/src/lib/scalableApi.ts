import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { LoadBalancer } from '../hooks/useScaling';
import { APIResponse, FrontendAPIError } from '../types/api.d'; // Import new types

// Extend AxiosRequestConfig to include custom properties
declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

/**
 * Enhanced API client with load balancing and distributed caching
 * Distributes requests across multiple servers and caches responses
 * 
 * Fix #1: This is the primary API client - api.ts re-exports this
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const BACKUP_URL = import.meta.env.VITE_API_BACKUP_URL || null;

interface TokenData {
  token: string;
  expires: number;
}

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
        const secureToken = localStorage.getItem('token'); // Use 'token' for consistency
        if (secureToken) {
          try {
            const tokenData = JSON.parse(atob(secureToken)) as TokenData;
            // Check expiry
            if (tokenData.expires > Date.now()) {
              config.headers.Authorization = `Bearer ${tokenData.token}`;
            } else {
              // Token expired, trigger logout
              window.dispatchEvent(new CustomEvent('auth-error', {
                detail: { status: 401, message: 'Token expired' }
              }));
            }
          } catch {
            // Invalid token, trigger logout
            window.dispatchEvent(new CustomEvent('auth-error', {
              detail: { status: 401, message: 'Invalid token format' }
            }));
          }
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

        // Always expect APIResponse structure for successful calls
        const apiResponse = response.data as APIResponse;
        if (apiResponse && apiResponse.status === false) {
          // If backend indicates an error, throw FrontendAPIError
          throw new FrontendAPIError(
            apiResponse.message || 'Unknown API error',
            apiResponse.code || response.status,
            false,
            apiResponse.data
          );
        }
        return response; // Return the full response, data will be response.data.data
      },
      async (error: AxiosError) => {
        const config = error.config;
        const responseData = error.response?.data as APIResponse;

        // If GET request failed, try in-memory cache
        if (config?.method === 'get') {
          const cached = this.getCacheEntry(config.url || '');
          if (cached) {
            console.log('[ScalableApi] Returning cached response for:', config.url);
            return { data: cached, status: 200, config, fromCache: true };
          }
        }

        // If server error and has backup, try next server
        if (error.response?.status && error.response.status >= 500 && config && this.servers.length > 1 && !config._retry) {
          const nextServer = this.loadBalancer.getNextServer();
          if (nextServer !== config.baseURL) {
            console.log('[ScalableApi] Retrying with server:', nextServer);
            config.baseURL = nextServer;
            config._retry = true; // Mark as retried to prevent infinite loops
            return this.client(config);
          }
        }

        // Centralized error handling for non-2xx responses
        const errorMessage = responseData?.message || error.message || 'Network Error';
        const errorCode = responseData?.code || error.response?.status || 500;
        const errorData = responseData?.data || null;

        throw new FrontendAPIError(
          errorMessage,
          errorCode,
          false, // Backend status is false for errors
          errorData
        );
      }
    );
  }

  private setCacheEntry(key: string, data: unknown, ttl: number = 60000): void {
    // If cache is full, force cleanup to maintain size (simple LRU approximation)
    if (this.inMemoryCache.size >= 100) {
      this.cleanupCache(true);
    }

    this.inMemoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
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

  private cleanupCache(force: boolean = false): void {
    const now = Date.now();
    // 1. Delete expired entries
    for (const [key, entry] of this.inMemoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.inMemoryCache.delete(key);
      }
    }
    
    // 2. If still over limit and forced, delete oldest entries (LRU-ish by insertion time)
    if (force && this.inMemoryCache.size >= 100) {
        // Map is ordered by insertion. Delete the first key.
        const firstKey = this.inMemoryCache.keys().next().value;
        if (firstKey) {
            this.inMemoryCache.delete(firstKey);
        }
    }
  }

  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config);
    return this.unwrapResponse<T>(response.data);
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config);
    return this.unwrapResponse<T>(response.data);
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put(url, data, config);
    return this.unwrapResponse<T>(response.data);
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch(url, data, config);
    return this.unwrapResponse<T>(response.data);
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config);
    return this.unwrapResponse<T>(response.data);
  }

  private unwrapResponse<T>(data: unknown): T {
    // If the response is wrapped in APIResponse format, return the inner data
    if (data && typeof data === 'object' && 'data' in data && 'status' in data) {
      return (data as { data: T }).data;
    }
    // Otherwise return as is
    return data as T;
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

