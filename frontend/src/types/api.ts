/**
 * API Response Types
 * 
 * These types match the backend Pydantic schemas to ensure type safety
 * and consistency between frontend and backend.
 */

export interface Indicator {
  id: string;
  type: string;
  confidence: number;
  evidence: Record<string, unknown>;
  created_at: string;
}

export interface AnalysisResult {
  id: string;
  subject_id: string;
  status: string;
  risk_score: number;
  created_at: string;
  updated_at?: string;
  
  // Adjudication fields
  adjudication_status: string; // 'pending' | 'flagged' | 'reviewed'
  decision?: string; // 'confirmed_fraud' | 'false_positive' | 'escalated'
  reviewer_notes?: string;
  reviewer_id?: string;
  
  indicators: Indicator[];
}

export interface PaginatedAnalysisResult {
  items: AnalysisResult[];
  total: number;
  page: number;
  pages: number;
}

/**
 * UI Display Types
 * 
 * These types are used for rendering components and may differ
 * from API response types for better UX.
 */

export interface Alert {
  id: string;
  subject_id: string;
  subject_name: string;
  risk_score: number;
  triggered_rules: string[];
  created_at: string;
  status: 'pending' | 'flagged' | 'resolved';
}

export interface Case {
  id: string;
  subject_id: string;
  subject_name?: string;
  status: 'open' | 'under_review' | 'closed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at?: string;
  assigned_to?: string;
}

export interface DashboardStats {
  total_cases: number;
  active_alerts: number;
  pending_review: number;
  high_risk_cases: number;
  resolution_rate: number;
  avg_response_time: number;
}

/**
 * WebSocket Message Types
 */

export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
}

export interface StatsUpdateMessage {
  type: 'STATS_UPDATE';
  payload: DashboardStats;
}

export interface AlertAddedMessage {
  type: 'alert_added';
  payload: {
    analysis_id: string;
  };
}

export interface AlertResolvedMessage {
  type: 'alert_resolved';
  payload: {
    analysis_id?: string;
    id?: string;
  };
}

export interface QueueUpdatedMessage {
  type: 'queue_updated';
  payload: Record<string, never>;
}

export type WebSocketEventMessage =
  | StatsUpdateMessage
  | AlertAddedMessage
  | AlertResolvedMessage
  | QueueUpdatedMessage;

/**
 * Forensic Analysis Types
 */

export interface ForensicFlag {
  message: string;
}

export interface ForensicResult {
  metadata?: Record<string, unknown>;
  ocr_text?: string;
  flags?: ForensicFlag[];
}
