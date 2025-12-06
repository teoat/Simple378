# 🔐 Login Page

> User authentication entry point

**Route:** `/login`  
**File:** `src/pages/Login.tsx`

---

## Overview

The Login page provides secure authentication for the Simple378 platform with a modern glassmorphism design.

---

## Screenshot

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│     ○ ○ ○                       (floating blobs)                    ○ ○    │
│              ○                                                        ○     │
│                    ┌─────────────────────────────────────┐                  │
│                    │                                     │                  │
│                    │         🔍 SIMPLE378                │                  │
│                    │    Forensic Investigation           │                  │
│                    │                                     │                  │
│                    │   ┌─────────────────────────────┐   │                  │
│                    │   │ 📧 Email                    │   │                  │
│                    │   │ admin@example.com           │   │                  │
│                    │   └─────────────────────────────┘   │                  │
│                    │                                     │                  │
│                    │   ┌─────────────────────────────┐   │                  │
│                    │   │ 🔒 Password                 │   │                  │
│                    │   │ ••••••••                    │   │                  │
│                    │   └─────────────────────────────┘   │                  │
│                    │                                     │                  │
│                    │   [        Sign In         ]        │                  │
│                    │                                     │                  │
│                    │   Forgot password?                  │                  │
│                    │                                     │                  │
│                    └─────────────────────────────────────┘                  │
│         ○                                                            ○      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Email/Password Auth | ✅ | Standard credentials login |
| Token Storage | ✅ | JWT stored in localStorage |
| Error Handling | ✅ | Invalid credential messages |
| Loading State | ✅ | Spinner during auth |
| Remember Me | ⚠️ | Planned |
| OAuth/SSO | ⚠️ | Planned |

---

## Components Used

| Component | Purpose |
|-----------|---------|
| `LoginForm` | Form with validation |
| `Input` | Styled input fields |
| `Button` | Submit button |
| `GlassCard` | Container with glassmorphism |

---

## Design Tokens

```css
/* Glassmorphism */
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.2);

/* Floating blobs */
animation: float 6s ease-in-out infinite;
```

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/auth/login` | Authenticate user |

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

---

## State Management

```typescript
// AuthContext usage
const { login, isLoading, error } = useAuth();

// Login handler
const handleSubmit = async (e) => {
  e.preventDefault();
  await login(email, password);
  navigate('/');
};
```

---

## Validation Rules

| Field | Rules |
|-------|-------|
| Email | Required, valid email format |
| Password | Required, min 6 characters |

---

## Accessibility

- [x] Form labels associated with inputs
- [x] Error messages announced
- [x] Keyboard navigation
- [x] Focus management
- [ ] Skip link (planned)


---

## 🚀 Zero Trust Heuristics (Proposed)

Risk-based authentication that adapts to user behavior.

### 1. 🌍 Impossible Travel Detection
Logic to prevent physically impossible login sequences.
- **Scenario:** Login from Jakarta (10:00 AM) -> Login from London (10:15 AM).
- **Action:** Immediate lock & security alert.

### 2. 🖱️ Behavioral Biometrics
Profiling user interaction patterns to detect bots or hijacked sessions.
- **Metric:** Mouse velocity, typing cadence (keystroke dynamics).
- **Trigger:** "Non-human interaction detected (0ms reaction time)."

### 3. 🛡️ Context-Aware MFA
Dynamic friction based on risk score.
- **Rule:** Low Risk (Home IP) = No MFA. High Risk (New Device + VPN) = Hardware Key required.

---

## Related Pages

- [Dashboard](./08_DASHBOARD.md) - After successful login
- [Settings](./SETTINGS.md) - Password reset
