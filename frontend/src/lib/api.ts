/**
 * API Client
 * Re-exports the scalable API client as the default API
 * This enables load balancing, distributed caching, and automatic failover
 */

// Re-export the scalable API client as the unified API
export { scalableApi as api, scalableApi as default } from './scalableApi';
import { scalableApi } from './scalableApi';

/**
 * @deprecated Use `api` (scalableApi) directly instead.
 * apiRequest function for backward compatibility
 * Used in components that expect a function-style API call
 */
interface TokenData {
  token: string;
  expires: number;
  fingerprint: string;
}

export async function apiRequest<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const method = options?.method?.toUpperCase() || 'GET';

  // Prepare headers
  const headers = new Headers(options?.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Add secure auth token if available
  const secureToken = localStorage.getItem('auth_token');
  if (secureToken) {
    try {
      const tokenData = JSON.parse(atob(secureToken)) as TokenData;

      // Validate token hasn't expired
      if (tokenData.expires > Date.now()) {
        headers.set('Authorization', `Bearer ${tokenData.token}`);
      } else {
        // Token expired, trigger logout
        window.dispatchEvent(new CustomEvent('auth-error', {
          detail: { status: 401, message: 'Token expired' }
        }));
      }
    } catch (error) {
      // Invalid token format, trigger logout
      window.dispatchEvent(new CustomEvent('auth-error', {
        detail: { status: 401, message: 'Invalid token format' }
      }));
    }
  }

  // Prepare request options
  const requestOptions: RequestInit = {
    method,
    headers,
    ...options,
  };

  // Handle body for different methods
  if (method !== 'GET' && method !== 'HEAD' && options?.body) {
    requestOptions.body = options.body;
  }

  const response = await fetch(url, requestOptions);

  if (!response.ok) {
    await response.text().catch(() => 'Unknown error');
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  // Handle empty responses
  const contentType = response.headers?.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  } else {
    return response.text() as T;
  }
}

// Subject API endpoints using the scalable client
export const subjectsApi = {
  getSubjects: (params?: {
    status?: string;
    min_risk?: number;
    max_risk?: number;
    search?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    return scalableApi.get(`/subjects?${searchParams.toString()}`);
  },

  getSubject: (subjectId: string) => scalableApi.get(`/subjects/${subjectId}`),

  deleteSubject: (subjectId: string) => scalableApi.delete(`/subjects/${subjectId}`),

  exportSubjectData: (subjectId: string) => scalableApi.get(`/subjects/${subjectId}/export`),

  batchUpdateCases: (data: { case_ids: string[]; status?: string; assigned_to?: string }) =>
    scalableApi.patch('/cases/batch', data),
};
