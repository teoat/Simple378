# Settings Page

**Route:** `/settings`  
**Component:** `src/pages/Settings.tsx`  
**Status:** ✅ Implemented

---

## Overview

The Settings page provides user and application configuration options. It is organized into tabs for General settings, Security settings, and Audit Log viewing.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Header: "Settings"                                          │
├─────────────────────────────────────────────────────────────┤
│  [General] [Security] [Audit Log]                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  General Tab:                                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Profile                                                │ │
│  │ ──────────                                             │ │
│  │ Name:    [John Smith          ]                        │ │
│  │ Email:   [john.smith@company.com]                      │ │
│  │                                     [Save Changes]     │ │
│  │                                                        │ │
│  │ Appearance                                             │ │
│  │ ──────────                                             │ │
│  │ Theme:   (●) Light  ( ) Dark  ( ) System               │ │
│  │                                                        │ │
│  │ Notifications                                          │ │
│  │ ──────────────                                         │ │
│  │ [✓] Email notifications for high-risk alerts          │ │
│  │ [✓] Browser notifications                             │ │
│  │ [ ] Daily summary digest                              │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Tabs

### 1. General Tab
User profile and preferences.

**Sections:**
- **Profile:** Name and email editing
- **Appearance:** Theme toggle (Light/Dark/System)
- **Notifications:** Email and browser notification preferences

### 2. Security Tab
Password and security settings.

**Sections:**
- **Change Password:** Current password, new password, confirm
- **Two-Factor Authentication:** Enable/disable TOTP
- **Active Sessions:** View and revoke sessions

### 3. Audit Log Tab
System audit trail viewer.

**Features:**
- Searchable log table
- Filter by action type, user, date range
- Export to CSV
- Pagination

---

## Components

| Component | Description |
|-----------|-------------|
| `ProfileForm` | Name and email editing form |
| `ThemeToggle` | Light/Dark/System mode selector |
| `NotificationSettings` | Notification preference checkboxes |
| `PasswordChangeForm` | Password update form with validation |
| `SessionManager` | Active session list with revoke |
| `AuditLogViewer` | Searchable, filterable audit log table |

---

## Features

### Profile Management
- Edit display name
- Update email (with verification)
- Avatar upload

### Theme Settings
| Option | Description |
|--------|-------------|
| Light | Light color scheme |
| Dark | Dark color scheme |
| System | Follow OS preference |

### Security Features
- Password requirements: 8+ chars, uppercase, lowercase, number
- Password strength indicator
- Session management (view/revoke active sessions)
- Two-factor authentication setup

### Audit Log
| Column | Description |
|--------|-------------|
| Timestamp | Event date/time |
| User | Actor who performed action |
| Action | Type of action (login, create, update, delete) |
| Resource | Affected resource (case, alert, user) |
| IP Address | Source IP |
| Details | Additional context |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Get current user profile |
| PATCH | `/api/v1/users/me` | Update profile |
| POST | `/api/v1/auth/change-password` | Change password |
| GET | `/api/v1/users/me/sessions` | Get active sessions |
| DELETE | `/api/v1/users/me/sessions/:id` | Revoke session |
| GET | `/api/v1/audit-logs` | Get audit logs |

---

## Accessibility

| Feature | Implementation |
|---------|----------------|
| Tabs | ARIA tabs pattern |
| Forms | Proper labels and error messages |
| Theme Toggle | `role="radiogroup"` |
| Table | Proper headers and cell associations |

---

## Related Files

```
frontend/src/
├── pages/Settings.tsx
└── components/settings/
    ├── ProfileForm.tsx
    ├── ThemeToggle.tsx
    ├── NotificationSettings.tsx
    ├── PasswordChangeForm.tsx
    ├── SessionManager.tsx
    └── AuditLogViewer.tsx
```

---

## Future Enhancements

- [ ] Profile avatar upload
- [ ] Language/locale settings
- [ ] Keyboard shortcut customization
- [ ] API key management
- [ ] Data export (GDPR compliance)
- [ ] Account deletion option
