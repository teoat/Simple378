import { apiRequest } from './api';

export enum EvidenceType {
  DOCUMENT = 'document',
  CHAT = 'chat',
  VIDEO = 'video',
  PHOTO = 'photo',
}

export enum ProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Evidence {
  id: string;
  case_id: string;
  type: EvidenceType;
  filename: string;
  size?: number;
  mime_type?: string;
  uploaded_by?: string;
  uploaded_at?: string;
  status: ProcessingStatus;
  processed_at?: string;
  tags?: string[];
  metadata?: any;
  // Relations
  document?: DocumentMetadata;
  chat?: ChatMetadata;
  video?: VideoMetadata;
  photo?: PhotoMetadata;
}

export interface DocumentMetadata {
  page_count: number;
  extracted_text?: string;
  ocr_confidence?: number;
}

export interface ChatMetadata {
  platform: string;
  message_count: number;
  date_range_start?: string;
  date_range_end?: string;
}

export interface VideoMetadata {
  duration: number;
  resolution?: any;
  transcript?: string;
}

export interface PhotoMetadata {
  dimensions?: any;
  ocr_text?: string;
  classification?: string;
}

export const evidenceApi = {
  upload: async (
    caseId: string,
    file: File,
    type: EvidenceType,
    tags?: string[],
    onProgress?: (progress: number) => void,
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (tags?.length) {
      formData.append('tags', tags.join(','));
    }

    const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
    const token = localStorage.getItem('token');

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.open('POST', `${BASE_URL}/evidence/${caseId}/evidence`);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            onProgress(percentComplete);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(xhr.statusText));
        }
      };

      xhr.onerror = () => reject(new Error('Network Error'));

      xhr.send(formData);
    });
  },

  list: async (caseId: string): Promise<Evidence[]> => {
    return apiRequest(`/evidence/${caseId}/evidence`);
  },

  get: async (id: string): Promise<Evidence> => {
    return apiRequest(`/evidence/${id}`);
  },

  process: async (id: string): Promise<Evidence> => {
    return apiRequest(`/evidence/${id}/process`, { method: 'POST' });
  },

  reprocess: async (id: string): Promise<Evidence> => {
    return apiRequest(`/evidence/${id}/reprocess`, { method: 'POST' });
  },
};
