/**
 * User Settings Types
 * Type definitions for user preferences and security settings
 */

/**
 * User profile information
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'investigator' | 'analyst' | 'viewer';
  department?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    webhooks: boolean;
  };
  emailDigest: 'none' | 'daily' | 'weekly' | 'monthly';
  itemsPerPage: number;
  defaultView: 'list' | 'grid' | 'kanban';
  compactMode: boolean;
}

/**
 * Two-factor authentication settings
 */
export interface TwoFactorAuthSettings {
  enabled: boolean;
  method: 'authenticator' | 'sms' | 'email';
  backupCodes: string[];
  verifiedAt?: string;
  phoneNumber?: string;
}

/**
 * Security settings for user account
 */
export interface SecuritySettings {
  passwordChangedAt?: string;
  passwordExpiresAt?: string;
  twoFactorAuth: TwoFactorAuthSettings;
  loginHistory: LoginRecord[];
  activeSessions: SessionRecord[];
  trustedDevices: DeviceRecord[];
  apiKeys: ApiKeyRecord[];
}

/**
 * Login record for history
 */
export interface LoginRecord {
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  location?: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
}

/**
 * Active session record
 */
export interface SessionRecord {
  id: string;
  createdAt: string;
  expiresAt: string;
  ipAddress: string;
  userAgent: string;
  current: boolean; // Is this the current session?
}

/**
 * Trusted device record
 */
export interface DeviceRecord {
  id: string;
  name: string;
  addedAt: string;
  lastUsed: string;
  ipAddress: string;
  trusted: boolean;
}

/**
 * API key record for programmatic access
 */
export interface ApiKeyRecord {
  id: string;
  name: string;
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
  scopes: string[];
  maskedKey: string; // Only last 4 characters visible
}

/**
 * Privacy settings
 */
export interface PrivacySettings {
  dataCollection: boolean;
  analytics: boolean;
  crashReports: boolean;
  profileVisibility: 'private' | 'team' | 'public';
  dataExportUrl?: string;
  dataExportCreatedAt?: string;
}

/**
 * User settings response (combined)
 */
export interface UserSettings {
  profile: UserProfile;
  preferences: UserPreferences;
  security: SecuritySettings;
  privacy: PrivacySettings;
}

/**
 * Update profile request
 */
export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

/**
 * Update password request
 */
export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

/**
 * Update preferences request
 */
export interface UpdatePreferencesRequest {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  timezone?: string;
  notifications?: Partial<UserPreferences['notifications']>;
  emailDigest?: 'none' | 'daily' | 'weekly' | 'monthly';
}

/**
 * Enable 2FA request
 */
export interface Enable2FARequest {
  method: 'authenticator' | 'sms';
  phoneNumber?: string; // Required for SMS method
  verificationCode: string;
}

/**
 * Verify 2FA code request
 */
export interface Verify2FARequest {
  code: string;
  rememberDevice?: boolean;
}
