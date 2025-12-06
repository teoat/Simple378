import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { LoadBalancer, DistributedCache } from '../hooks/useScaling';

/**
 * Enhanced API client with load balancing and distributed caching
 * Distributes requests across multiple servers and caches responses
 */
export class ScalableApiClient {
  private client: AxiosInstance;
  private loadBalancer: LoadBalancer;
  private cache: DistributedCache;
  private servers: string[];

  constructor(servers: string[] = [
    process.env.REACT_APP_API_URL || 'http://localhost:8000',
  ]) {
    this.servers = servers;
    this.loadBalancer = new LoadBalancer(servers, 'least-connections');
    this.cache = new DistributedCache(servers);

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
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Select server using load balancer
        const server = await this.loadBalancer.getServerWithLeastConnections();
        if (server && !config.url?.startsWith('http')) {
          config.baseURL = server;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: cache successful reads, handle errors
    this.client.interceptors.response.use(
      (response) => {
        // Cache GET requests
        if (response.config.method === 'get') {
          this.cache.set(response.config.url || '', JSON.stringify(response.data));
        }
        return response;
      },
      async (error) => {
        const config = error.config;

        // If GET request failed, try cache
        if (config?.method === 'get') {
          const cached = this.cache.get(config.url || '');
          if (cached) {
            return { data: JSON.parse(cached), status: 200, config };
          }
        }

        // If server error, try next server
        if (error.response?.status >= 500 && config) {
          const nextServer = await this.loadBalancer.getNextServer();
          config.baseURL = nextServer;
          return this.client(config);
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
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
        this.loadBalancer = new LoadBalancer(this.servers, 'least-connections');
        this.cache = new DistributedCache(this.servers);
      }
    });
  }

  /**
   * Remove servers from load balancer (for decommissioning)
   */
  removeServers(servers: string[]) {
    this.servers = this.servers.filter(s => !servers.includes(s));
    this.loadBalancer = new LoadBalancer(this.servers, 'least-connections');
    this.cache = new DistributedCache(this.servers);
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.cache = new DistributedCache(this.servers);
  }

  /**
   * Get current server list
   */
  getServers(): string[] {
    return [...this.servers];
  }
}

// Export singleton instance
export const scalableApi = new ScalableApiClient([
  process.env.REACT_APP_API_URL || 'http://localhost:8000',
  process.env.REACT_APP_API_BACKUP_URL || 'http://localhost:8001',
].filter(Boolean));

export default scalableApi;
