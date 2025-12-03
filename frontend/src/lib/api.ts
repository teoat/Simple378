const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_V1 = `${API_BASE_URL}/api/v1`;

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class ApiError extends Error {
  status: number;
  data: unknown;
  statusText: string;

  constructor(message: string, status: number, statusText: string, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('auth_token');
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = true, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = `${API_V1}${endpoint}`;

  let response;
  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new ApiError('Network error - please check your connection and try again.', 0, 'Network Error', null);
    }
    throw new ApiError(
      'Request failed due to an unknown network error.',
      0,
      'Unknown Network Error',
      null
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('[API] Request failed:', {
      status: response.status,
      statusText: response.statusText,
      data: errorData
    });
    
    throw new ApiError(
      errorData.detail || `HTTP ${response.status} error`,
      response.status,
      response.statusText,
      errorData
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    return request<{ access_token: string; token_type: string }>('/login/access-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
      requiresAuth: false,
    });
  },

  // Dashboard
  getDashboardMetrics: () =>
    request<{
      active_cases: number;
      high_risk_subjects: number;
      pending_reviews: number;
      system_load: number;
    }>('/dashboard/metrics'),

  getRecentActivity: () =>
    request<
      Array<{
        id: string;
        type: string;
        message: string;
        timestamp: string;
        user: string;
      }>
    >('/activity/recent'),

  // Cases
  getCases: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    request<{
      items: Array<{
        id: string;
        subject_name: string;
        risk_score: number;
        status: string;
        created_at: string;
        assigned_to: string;
      }>;
      total: number;
      page: number;
      pages: number;
    }>(`/subjects?${new URLSearchParams(params as Record<string, string>).toString()}`),

  getCase: (id: string) =>
    request<{
      id: string;
      subject_name: string;
      risk_score: number;
      status: string;
      description: string;
      assigned_to: string;
      created_at: string;
    }>(`/subjects/${id}`),

  getCaseTimeline: (id: string) =>
    request<
      Array<{
        id: string;
        timestamp: string;
        event_type: string;
        description: string;
        user: string;
      }>
    >(`/cases/${id}/timeline`),

  // Graph
  getGraph: (subjectId: string) =>
    request<{
      nodes: Array<{ id: string; label: string; type: string }>;
      edges: Array<{ source: string; target: string; label: string }>;
    }>(`/graph/${subjectId}`),

  // Reconciliation
  getExpenses: () =>
    request<
      Array<{
        id: string;
        date: string;
        description: string;
        amount: number;
        status: string;
      }>
    >('/reconciliation/expenses'),

  getTransactions: () =>
    request<
      Array<{
        id: string;
        date: string;
        description: string;
        amount: number;
        status: string;
      }>
    >('/reconciliation/transactions'),

  autoReconcile: () =>
    request<{ matched: number; unmatched: number }>('/reconciliation/auto-match', {
      method: 'POST',
    }),

  // Ingestion
  uploadTransactions: (file: File, subjectId: string, bankName: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject_id', subjectId);
    formData.append('bank_name', bankName);

    return fetch(`${API_V1}/ingestion/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: formData,
    }).then((res) => {
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    });
  },

  // Forensics
  analyzeFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return fetch(`${API_V1}/forensics/analyze`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: formData,
    }).then((res) => {
      if (!res.ok) throw new Error('Analysis failed');
      return res.json();
    });
  },

  // Audit
  getAuditLogs: (params?: { page?: number; limit?: number; search?: string }) =>
    request<{
      items: Array<{
        id: string;
        timestamp: string;
        actor_id: string;
        action: string;
        resource_id: string;
        details: any;
      }>;
      total: number;
      page: number;
      pages: number;
    }>(`/audit-logs?${new URLSearchParams(params as Record<string, string>).toString()}`),

  exportAuditLogs: () =>
    fetch(`${API_V1}/audit/export`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    }).then((res) => {
      if (!res.ok) throw new Error('Export failed');
      return res.blob();
    }),

  // User Settings
  getProfile: () =>
    request<{ id: string; name: string; email: string; role: string }>('/users/profile'),

  updateProfile: (data: { name?: string; email?: string }) =>
    request('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updatePreferences: (preferences: { theme?: 'light' | 'dark' }) =>
    request('/users/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    }),

  // AI Assistant
  sendChatMessage: (message: string) =>
    request<{ response: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};

export { ApiError };
