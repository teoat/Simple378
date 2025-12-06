const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const API_V1 = `${API_BASE_URL}/api/v1`;
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRY_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY = 100; // ms

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
  timeout?: number;
  skipRetry?: boolean;
}

class ApiError extends Error {
  status: number;
  data: unknown;
  statusText: string;
  isTimeout: boolean;
  isNetworkError: boolean;

  constructor(
    message: string,
    status: number,
    statusText: string,
    data: unknown,
    isTimeout = false,
    isNetworkError = false
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    this.isTimeout = isTimeout;
    this.isNetworkError = isNetworkError;
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
  // Trigger logout if token is cleared (401 response)
  window.dispatchEvent(new CustomEvent('auth:logout'));
}

// Fetch with timeout support
async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number }
): Promise<Response> {
  const { timeout = REQUEST_TIMEOUT, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

// Retry logic with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts = MAX_RETRY_ATTEMPTS,
  initialDelay = INITIAL_RETRY_DELAY
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const apiError = error as ApiError;

      // Don't retry on 4xx errors (except 408 Timeout and 429 Too Many Requests)
      if (apiError.status && apiError.status >= 400 && apiError.status < 500) {
        if (apiError.status !== 408 && apiError.status !== 429) {
          throw error;
        }
      }

      // Don't retry on last attempt
      if (attempt === maxAttempts - 1) {
        throw error;
      }

      // Calculate exponential backoff with jitter
      const delay = Math.min(
        initialDelay * Math.pow(2, attempt) + Math.random() * 1000,
        30000 // Max 30 second delay
      );

      console.debug(
        `[API] Retry attempt ${attempt + 1}/${maxAttempts} after ${Math.round(delay)}ms`,
        apiError.message
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Request failed after all retries');
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { 
    requiresAuth = true,
    timeout = REQUEST_TIMEOUT,
    skipRetry = false,
    ...fetchOptions 
  } = options;

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

  // Wrapper function for the actual request
  const performRequest = async (): Promise<T> => {
    let response: Response;
    try {
      response = await fetchWithTimeout(url, {
        ...fetchOptions,
        headers,
        timeout,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError(
            `Request timed out after ${timeout}ms. Please check your connection and try again.`,
            0,
            'Timeout',
            null,
            true, // isTimeout
            false // isNetworkError
          );
        }
        if (error instanceof TypeError) {
          throw new ApiError(
            'Network error - please check your connection and try again.',
            0,
            'Network Error',
            null,
            false,
            true // isNetworkError
          );
        }
      }
      throw new ApiError(
        'Request failed due to an unknown network error.',
        0,
        'Unknown Network Error',
        null,
        false,
        true
      );
    }

    // Handle 401 Unauthorized - trigger logout
    if (response.status === 401) {
      clearAuthToken();
      throw new ApiError(
        'Your session has expired. Please log in again.',
        401,
        'Unauthorized',
        null
      );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[API] Request failed:', {
        status: response.status,
        statusText: response.statusText,
        url,
        data: errorData,
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
  };

  // Use retry logic unless skipRetry is true
  if (skipRetry) {
    return performRequest();
  }

  return retryWithBackoff(performRequest);
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
  getCases: (params?: { page?: number; limit?: number; search?: string; status?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.sortBy) searchParams.set('sort_by', params.sortBy);
    if (params?.sortOrder) searchParams.set('sort_order', params.sortOrder);
    return request<{
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
    }>(`/subjects?${searchParams.toString()}`);
  },

  searchCases: (query: string) =>
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
    }>(`/search/cases?q=${encodeURIComponent(query)}`),

  createCase: (data: { subject_name: string; description?: string }) =>
    request<{
      id: string;
      subject_name: string;
      status: string;
      created_at: string;
    }>('/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCase: (id: string, data: { status?: string; assigned_to?: string; description?: string }) =>
    request<{
      id: string;
      subject_name: string;
      status: string;
      updated_at: string;
    }>(`/cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCase: (id: string) =>
    request(`/cases/${id}`, {
      method: 'DELETE',
    }),

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

  // Bulk Operations
  bulkArchiveCases: (ids: string[]) =>
    request<{ count: number }>('/cases/bulk/archive', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),

  bulkAssignCases: (ids: string[], userId: string) =>
    request<{ count: number }>('/cases/bulk/assign', {
      method: 'POST',
      body: JSON.stringify({ ids, assigned_to: userId }),
    }),

  bulkDeleteCases: (ids: string[]) =>
    request<{ count: number }>('/cases/bulk/delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),

  bulkExportCases: (ids: string[]) =>
    fetch(`${API_V1}/cases/bulk/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ ids }),
    }).then((res) => {
      if (!res.ok) throw new Error('Export failed');
      return res.blob();
    }),

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

  autoReconcile: (threshold?: number) =>
    request<{ matched: number; unmatched: number }>('/reconciliation/auto-match', {
      method: 'POST',
      body: JSON.stringify({ threshold }),
    }),

  createMatch: (expenseId: string, transactionId: string, confidence?: number) =>
    request<{
      id: string;
      expense_id: string;
      transaction_id: string;
      confidence: number;
      created_at: string;
      status: string;
      created_by?: string;
    }>('/reconciliation/matches', {
      method: 'POST',
      body: JSON.stringify({ expense_id: expenseId, transaction_id: transactionId, confidence }),
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

  batchImportTransactions: (transactions: Array<Record<string, unknown>>) =>
    request<Array<Record<string, unknown>>>('/ingestion/batch', {
      method: 'POST',
      body: JSON.stringify(transactions),
    }),

  // Ingestion Wizard
  createUploadSession: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_V1}/ingestion/session`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      body: formData,
    }).then(res => {
      if (!res.ok) throw new Error('Upload session creation failed');
      return res.json();
    });
  },

  previewMapping: (uploadId: string, mapping: Record<string, string>) =>
    request<Array<Record<string, unknown>>>(`/ingestion/${uploadId}/preview`, {
      method: 'POST',
      body: JSON.stringify(mapping),
    }),

  finishImport: (uploadId: string, mapping: Record<string, string>, subjectId: string, bankName: string) =>
    request<{ count: number; status: string }>(`/ingestion/${uploadId}/finish`, {
      method: 'POST',
      body: JSON.stringify({ mapping, subject_id: subjectId, bank_name: bankName }),
    }),

  analyzeRedactions: (
    uploadId: string, 
    mapping: Record<string, string>,
    startBalance?: number,
    endBalance?: number
  ) =>
    request<{
      gaps: Array<{ type: string; inferred_value: string; confidence: number; context: string }>;
      balance_findings: Array<{ type: string; inferred_value: number; confidence: number; context: string }>;
      total_analyzed: number;
    }>(`/ingestion/${uploadId}/analyze-redactions`, {
      method: 'POST',
      body: JSON.stringify({ mapping, start_balance: startBalance, end_balance: endBalance }),
    }),

  autoMapFields: (uploadId: string) =>
    request<{
      suggestions: Record<string, string>;
      confidence: Record<string, number>;
      available_fields: string[];
    }>(`/ingestion/${uploadId}/auto-map`, {
      method: 'POST',
    }),

  // Visualization
  getFinancialKPIs: () =>
    request<Record<string, { value: number; trend: number; direction: string }>>('/visualization/kpis'),

  getExpenseTrend: () =>
    request<Array<{ name: string; amount: number }>>('/visualization/expenses'),

  getBalanceSheet: () =>
    request<Array<{ name: string; children: Array<{ name: string; size: number }> }>>('/visualization/balance-sheet'),

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
        details: Record<string, unknown>;
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

  updatePassword: (data: { current_password: string; new_password: string }) =>
    request('/users/password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // AI Assistant
  sendChatMessage: (message: string) =>
    request<{ response: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  sendAIFeedback: (messageId: string, feedback: 'positive' | 'negative', context?: string) =>
    request<{ status: string; message: string; feedback_id: string }>('/ai/feedback', {
      method: 'POST',
      body: JSON.stringify({ message_id: messageId, feedback, conversation_context: context }),
    }),

  getAIMetrics: (days = 7) =>
    request<{
      period_days: number;
      feedback: {
        positive: number;
        negative: number;
        total: number;
        satisfaction_rate: number;
      };
      stats: {
        learning_enabled: boolean;
        last_updated: string;
      };
    }>(`/ai/metrics?days=${days}`),

  // Adjudication
  getAdjudicationQueue: (page = 1, limit = 100, sortBy: 'risk_score' | 'created_at' | 'priority' = 'priority', sortOrder: 'asc' | 'desc' = 'desc') =>
    request<{
      items: Array<{
        id: string;
        subject_id: string;
        status: string;
        risk_score: number;
        created_at: string;
        updated_at?: string;
        adjudication_status: string;
        decision?: string;
        reviewer_notes?: string;
        reviewer_id?: string;
        indicators: Array<{
          id: string;
          type: string;
          confidence: number;
          evidence: Record<string, unknown>;
          created_at: string;
        }>;
      }>;
      total: number;
      page: number;
      pages: number;
    }>(`/adjudication/queue?page=${page}&limit=${limit}&sort_by=${sortBy}&sort_order=${sortOrder}`),

  submitDecision: (analysisId: string, decision: string, notes?: string) =>
    request<{
      id: string;
      subject_id: string;
      status: string;
      risk_score: number;
      created_at: string;
      decision: string;
      reviewer_notes?: string;
      adjudication_status: string;
    }>(`/adjudication/${analysisId}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision, notes }),
    }),

  revertDecision: (analysisId: string) =>
    request<{
      id: string;
      subject_id: string;
      status: string;
      risk_score: number;
      created_at: string;
      adjudication_status: string;
    }>(`/adjudication/${analysisId}/revert`, {
      method: 'POST',
    }),

  getAdjudicationHistory: (analysisId: string) =>
    request<
      Array<{
        id: string;
        decision: string;
        reviewer_notes?: string;
        reviewer_id: string;
        created_at: string;
      }>
    >(`/adjudication/${analysisId}/history`),

  // Context tabs for adjudication
  getEvidenceForAnalysis: (analysisId: string) =>
    request<
      Array<{
        id: string;
        filename: string;
        file_type: string;
        upload_date: string;
        metadata?: Record<string, unknown>;
      }>
    >(`/forensics/evidence/${analysisId}`),

  getAIAnalysis: (subjectId: string) =>
    request<{
      status: string;
      findings: Record<string, unknown>;
      verdict: string;
    }>(`/ai/investigate/${subjectId}`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  // 2FA Setup and Verification
  setup2FA: (method: 'totp' | 'sms') =>
    request<{
      qr_code?: string;
      secret?: string;
      message: string;
    }>('/auth/2fa/setup', {
      method: 'POST',
      body: JSON.stringify({ method }),
    }),

  verify2FA: (data: { code: string; method: 'totp' | 'sms' }) =>
    request<{
      backup_codes?: string[];
      message: string;
    }>('/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Comments
  getComments: (caseId: string) =>
    request<
      Array<{
        id: string;
        case_id: string;
        user_id: string;
        user_name: string;
        user_avatar?: string;
        content: string;
        created_at: string;
        parent_id?: string;
        attachments?: Array<{ name: string; url: string; type: string }>;
      }>
    >(`/cases/${caseId}/comments`),

  addComment: (caseId: string, content: string, parentId?: string) =>
    request<{
      id: string;
      case_id: string;
      user_id: string;
      user_name: string;
      content: string;
      created_at: string;
      parent_id?: string;
    }>(`/cases/${caseId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parent_id: parentId }),
    }),

  deleteComment: (commentId: string) =>
    request(`/comments/${commentId}`, {
      method: 'DELETE',
    }),

  // Categorization
  getCategorizationTransactions: (params?: { search?: string; category?: string; uncategorized?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.uncategorized) searchParams.append('uncategorized', 'true');

    return request<{
      transactions: Array<{
        id: string;
        date: string;
        description: string;
        amount: number;
        category: string | null;
        confidence: number;
        source: string;
        ai_suggestion?: string;
        ai_confidence?: number;
      }>;
      total: number;
      categorized: number;
      uncategorized: number;
    }>(`/categorization/transactions?${searchParams.toString()}`);
  },

  getCategorizationCategories: () =>
    request<string[]>('/categorization/categories'),

  getCategorizationAISuggestions: () =>
    request<Array<{
      transactionId: string;
      suggestedCategory: string;
      confidence: number;
      reasoning: string;
    }>>('/categorization/ai-suggestions'),

  categorizeTransaction: (transactionId: string, category: string) =>
    request<{
      id: string;
      category: string;
      confidence: number;
      updated_at: string;
    }>(`/categorization/transactions/${transactionId}/categorize`, {
      method: 'POST',
      body: JSON.stringify({ category }),
    }),

  bulkCategorizeTransactions: (transactionIds: string[], category: string) =>
    request<{
      categorized: number;
      failed: number;
      errors?: string[];
    }>('/categorization/bulk-categorize', {
      method: 'POST',
      body: JSON.stringify({ transactionIds, category }),
    }),

  // Case Summary
  getCaseSummary: (caseId: string) =>
    request<{
      id: string;
      subject_name: string;
      status: string;
      risk_score: number;
      created_at: string;
      completed_at?: string;
      confidence?: number;
      findings?: Array<{
        id: string;
        type: string;
        title: string;
        description: string;
        impact?: string;
        recommendation?: string;
      }>;
      ingestion_stats?: {
        records_processed: number;
        files_ingested: number;
      };
      reconciliation_stats?: {
        match_rate: number;
        conflicts_resolved: number;
      };
      adjudication_stats?: {
        decisions_made: number;
        avg_resolution_time: string;
      };
    }>(`/cases/${caseId}/summary`),
};

export { ApiError };
