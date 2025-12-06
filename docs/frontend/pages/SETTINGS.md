# ⚙️ Settings Page

> User preferences and application configuration

**Route:** `/settings`  
**File:** `src/pages/Settings.tsx`  
**Access:** Header icon (⚙️) - Modal/Slide-out

---

## Overview

The Settings page allows users to manage their profile, security settings, application preferences, and view audit logs. It's accessed via the settings icon in the main header.

---

## Screenshot

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ⚙️ Settings                                                        [✕]     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [👤 Profile] [🔐 Security] [🎨 Preferences] [📋 Audit Log]                 │
│  ════════════════════════════════════════════════════════════════════════  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ 👤 PROFILE SETTINGS                                                   │ │
│  ├───────────────────────────────────────────────────────────────────────┤ │
│  │                                                                        │ │
│  │  ┌─────┐                                                              │ │
│  │  │     │  Name:  Sarah Kim                                            │ │
│  │  │ 👤  │  Email: sarah.kim@company.com                                │ │
│  │  │     │  Role:  Senior Investigator                                  │ │
│  │  └─────┘  Dept:  Fraud Detection Unit                                 │ │
│  │                                                                        │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │ Display Name     [Sarah Kim                              ]      │  │ │
│  │  │ Email            [sarah.kim@company.com                  ] 🔒   │  │ │
│  │  │ Phone            [+62 812 3456 7890                      ]      │  │ │
│  │  │ Timezone         [Asia/Jakarta                          ▼]      │  │ │
│  │  │ Language         [English                               ▼]      │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                        │ │
│  │  [Upload Photo]                                    [Save Changes]     │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Profile Management | ✅ | Name, phone, timezone |
| Avatar Upload | ✅ | Profile picture |
| Password Change | ✅ | Update password |
| Two-Factor Auth | ✅ | Enable/disable 2FA |
| Theme Toggle | ✅ | Light/dark mode |
| Notifications | ✅ | Email/push preferences |
| Audit Log | ✅ | View activity history |
| Session Management | ✅ | View/revoke sessions |

---

## Tabs

### 👤 Profile Tab

| Field | Type | Editable |
|-------|------|----------|
| Display Name | Text | Yes |
| Email | Email | No (admin only) |
| Phone | Phone | Yes |
| Timezone | Dropdown | Yes |
| Language | Dropdown | Yes |
| Avatar | Image upload | Yes |

### 🔐 Security Tab

```
┌───────────────────────────────────────────────────────────────────────┐
│ 🔐 SECURITY SETTINGS                                                  │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  PASSWORD                                                              │
│  ─────────────────────────────────────────────────────────────────    │
│  Last changed: 30 days ago                                            │
│  [Change Password]                                                     │
│                                                                        │
│  TWO-FACTOR AUTHENTICATION                                            │
│  ─────────────────────────────────────────────────────────────────    │
│  Status: [✓ Enabled]                                                  │
│  Method: Authenticator App                                            │
│  [Configure 2FA] [View Recovery Codes]                                │
│                                                                        │
│  ACTIVE SESSIONS                                                       │
│  ─────────────────────────────────────────────────────────────────    │
│  • Chrome on Windows (Current) - Jakarta - Now                        │
│  • Mobile App on iOS - Jakarta - 2 hours ago                          │
│  • Firefox on Mac - Singapore - Yesterday                             │
│  [Revoke All Other Sessions]                                          │
│                                                                        │
└───────────────────────────────────────────────────────────────────────┘
```

**Security Features:**

| Feature | Description |
|---------|-------------|
| **Change Password** | Require current password + new password |
| **2FA Setup** | QR code for authenticator app |
| **Recovery Codes** | One-time backup codes |
| **Session List** | View all active sessions |
| **Session Revoke** | Log out other devices |

### 🎨 Preferences Tab

| Setting | Options |
|---------|---------|
| **Theme** | Light / Dark / System |
| **Compact Mode** | On / Off |
| **Default Page** | Dashboard / Cases / Adjudication |
| **Notifications** | Email, Push, In-app toggles |
| **Date Format** | DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD |
| **Number Format** | 1,000.00 / 1.000,00 |

### 📋 Audit Log Tab

```
┌───────────────────────────────────────────────────────────────────────┐
│ 📋 AUDIT LOG                           Filter: [Last 30 days ▼]       │
├───────────────────────────────────────────────────────────────────────┤
│ Timestamp        │ Action           │ Details           │ IP Address │
├──────────────────┼──────────────────┼───────────────────┼────────────┤
│ Today 10:23 AM   │ Login            │ Chrome/Windows    │ 103.x.x.x  │
│ Today 09:15 AM   │ Case Updated     │ CASE-2024-001     │ 103.x.x.x  │
│ Yesterday        │ Password Changed │ -                 │ 103.x.x.x  │
│ 3 days ago       │ 2FA Enabled      │ Authenticator     │ 103.x.x.x  │
│ 5 days ago       │ Report Generated │ CASE-2024-002     │ 103.x.x.x  │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Components Used

| Component | Purpose |
|-----------|---------|
| `SettingsTabs` | Tab navigation |
| `ProfileForm` | Profile editing |
| `AvatarUpload` | Image upload |
| `PasswordForm` | Password change |
| `TwoFactorSetup` | 2FA configuration |
| `SessionList` | Active sessions |
| `PreferencesForm` | App settings |
| `AuditLogTable` | Activity history |

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/user/profile` | Get user profile |
| PUT | `/api/v1/user/profile` | Update profile |
| POST | `/api/v1/user/avatar` | Upload avatar |
| POST | `/api/v1/user/password` | Change password |
| POST | `/api/v1/user/2fa/setup` | Initialize 2FA |
| POST | `/api/v1/user/2fa/verify` | Verify 2FA code |
| GET | `/api/v1/user/sessions` | List sessions |
| DELETE | `/api/v1/user/sessions/:id` | Revoke session |
| GET | `/api/v1/user/audit-log` | Get audit log |

---

## State Management

```typescript
// Fetch user profile
const { data: profile } = useQuery({
  queryKey: ['user', 'profile'],
  queryFn: api.getProfile,
});

// Update profile
const updateProfile = useMutation({
  mutationFn: api.updateProfile,
  onSuccess: () => {
    queryClient.invalidateQueries(['user', 'profile']);
    toast.success('Profile updated');
  },
});

// Theme state (via context)
const { theme, setTheme } = useTheme();
```

---

## Validation Rules

| Field | Rules |
|-------|-------|
| Display Name | Required, 2-50 chars |
| Phone | Valid phone format |
| Current Password | Required for password change |
| New Password | Min 8 chars, uppercase, number |
| 2FA Code | 6 digits |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Esc` | Close settings |
| `1-4` | Switch tabs |
| `Ctrl+S` | Save changes |

---

## Related Pages

- Opens as modal from any authenticated page
- [Dashboard](./08_DASHBOARD.md) - Return to main app
