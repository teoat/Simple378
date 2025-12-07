// frontend/src/types/api.d.ts

export interface APIResponse<T = any> {
    status: boolean;
    code: number;
    message: string;
    data?: T;
}

export class FrontendAPIError extends Error {
    public code: number;
    public data?: any;
    public status: boolean;

    constructor(message: string, code: number = 500, status: boolean = false, data?: any) {
        super(message);
        this.name = 'FrontendAPIError';
        this.code = code;
        this.status = status;
        this.data = data;
        Object.setPrototypeOf(this, FrontendAPIError.prototype);
    }
}

// Extend existing RequestInit for custom options if needed
declare global {
  interface RequestInit {
    skipErrorHandling?: boolean; // Option to skip centralized error handling for specific requests
  }
}
