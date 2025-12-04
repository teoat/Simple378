/**
 * Forensics & File Analysis Types
 * Type definitions for forensic analysis and file ingestion
 */

/**
 * File metadata from forensic analysis
 */
export interface FileMetadata {
  filename: string;
  filesize: number;
  filetype: string;
  created_at: string;
  modified_at: string;
  accessed_at?: string;
  checksum_md5?: string;
  checksum_sha256?: string;
  [key: string]: unknown;
}

/**
 * Forensic flag/issue found in file
 */
export interface ForensicFlag {
  type: 'metadata' | 'content' | 'manipulation' | 'encoding' | 'security';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence?: string;
}

/**
 * Complete forensic analysis result
 */
export interface ForensicResult {
  upload_id: string;
  filename: string;
  filesize: number;
  status: 'pending' | 'analyzing' | 'complete' | 'error';
  metadata: FileMetadata;
  ocr_text?: string;
  flags: ForensicFlag[];
  analysis_time: number;
  created_at: string;
  extracted_entities?: {
    names: string[];
    emails: string[];
    phone_numbers: string[];
    bank_accounts: string[];
    dates: string[];
  };
}

/**
 * Processing stage during file analysis
 */
export type ProcessingStage =
  | 'upload'
  | 'virus_scan'
  | 'extraction'
  | 'ocr'
  | 'metadata'
  | 'forensics'
  | 'indexing'
  | 'complete';

/**
 * Upload progress event
 */
export interface UploadProgress {
  uploadId: string;
  stage: ProcessingStage;
  progress: number; // 0-100
  message?: string;
  estimatedTimeRemaining?: number;
}

/**
 * Batch import request for transactions/data
 */
export interface BatchImportRequest {
  items: Record<string, unknown>[];
  mappings: Record<string, string>;
  source: string;
  skipValidation?: boolean;
}

/**
 * Batch import result
 */
export interface BatchImportResult {
  successCount: number;
  failureCount: number;
  errors: Array<{
    rowNumber: number;
    field: string;
    message: string;
  }>;
}

/**
 * Upload history entry
 */
export interface UploadHistoryEntry {
  id: string;
  filename: string;
  filesize: number;
  uploadedAt: string;
  status: 'success' | 'failed' | 'processing';
  resultId?: string;
}
