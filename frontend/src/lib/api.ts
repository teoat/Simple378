/**
 * API Client
 * Re-exports the scalable API client as the default API
 * This enables load balancing, distributed caching, and automatic failover
 */

// Re-export the scalable API client as the unified API
export { scalableApi as api, scalableApi as default } from './scalableApi';
import { scalableApi } from './scalableApi';

/**
 * apiRequest function for backward compatibility
 * Used in components that expect a function-style API call
 */
export async function apiRequest<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const method = options?.method?.toUpperCase() || 'GET';
  const body = options?.body ? JSON.parse(options.body as string) : undefined;
  
  switch (method) {
    case 'POST':
      return scalableApi.post<T>(url, body);
    case 'PUT':
      return scalableApi.put<T>(url, body);
    case 'PATCH':
      return scalableApi.patch<T>(url, body);
    case 'DELETE':
      return scalableApi.delete<T>(url);
    default:
      return scalableApi.get<T>(url);
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

