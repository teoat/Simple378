# Login Page

**Route:** `/login`  
**Component:** `src/pages/Login.tsx`  
**Status:** ✅ Implemented

---

## Overview

The Login page serves as the entry point for the Simple378 Fraud Detection System. It provides a secure authentication interface with a modern, premium design that establishes the application's professional identity.

---

## Layout

### Desktop (≥1024px)
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌─────────────────────────┐  ┌────────────────────────────┐ │
│  │                         │  │                            │ │
│  │     Welcome Back        │  │   Advanced Fraud           │ │
│  │                         │  │   Detection                │ │
│  │  ┌───────────────────┐  │  │                            │ │
│  │  │ Email             │  │  │   ┌──────────────────┐     │ │
│  │  └───────────────────┘  │  │   │  Abstract        │     │ │
│  │  ┌───────────────────┐  │  │   │  Background      │     │ │
│  │  │ Password          │  │  │   │  Visual          │     │ │
│  │  └───────────────────┘  │  │   └──────────────────┘     │ │
│  │  ┌───────────────────┐  │  │                            │ │
│  │  │     Sign In       │  │  │   Tagline & Features       │ │
│  │  └───────────────────┘  │  │                            │ │
│  │                         │  │                            │ │
│  └─────────────────────────┘  └────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Mobile (<1024px)
```
┌────────────────────────┐
│                        │
│    Logo & Branding     │
│                        │
├────────────────────────┤
│                        │
│    Welcome Back        │
│                        │
│  ┌──────────────────┐  │
│  │ Email            │  │
│  └──────────────────┘  │
│  ┌──────────────────┐  │
│  │ Password         │  │
│  └──────────────────┘  │
│  ┌──────────────────┐  │
│  │    Sign In       │  │
│  └──────────────────┘  │
│                        │
└────────────────────────┘
```

---

## Components

### LoginForm (`components/auth/LoginForm.tsx`)
The main authentication form component.

**Props:** None

**State:**
- `email: string` - User email input
- `password: string` - User password input
- `isLoading: boolean` - Form submission state
- `error: string | null` - Error message display

**Features:**
- Real-time validation with visual feedback
- Password visibility toggle
- "Remember me" checkbox
- Forgot password link

### Visual Elements
- **Animated Background:** CSS/Canvas-based abstract shapes
- **Logo:** SVG branding element
- **Entry Animations:** Framer Motion transitions

---

## Features

### Authentication Flow
1. User enters email and password
2. Client-side validation (email format, password requirements)
3. API call to `/api/v1/auth/login`
4. On success: Store JWT tokens, redirect to `/dashboard`
5. On failure: Display error message, clear password field

### Security Features
- **Rate Limiting:** Backend enforces login attempt limits
- **Token Storage:** JWT stored in httpOnly cookies or secure localStorage
- **CSRF Protection:** Token-based CSRF prevention
- **Input Sanitization:** XSS prevention on all inputs

### Validation Rules
| Field | Rule |
|-------|------|
| Email | Required, valid email format |
| Password | Required, minimum 8 characters |

### Animations
- **Page Entry:** Fade-in with slight upward movement
- **Background:** Subtle floating/pulsing abstract shapes
- **Form Fields:** Focus state animations
- **Button:** Hover effects and loading spinner

---

## API Integration

### Login Endpoint
```typescript
POST /api/v1/auth/login
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "securepassword"
}

Response (200):
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600
}

Response (401):
{
  "detail": "Invalid credentials"
}
```

---

## Accessibility

| Feature | Implementation |
|---------|----------------|
| Form Labels | `<label>` elements with `htmlFor` |
| Error Announcements | `role="alert"` on error messages |
| Focus Management | Auto-focus on email field on mount |
| Keyboard Navigation | Tab order through form elements |
| Screen Reader | Descriptive button text and form hints |

---

## Testing

### Unit Tests
- Form submission with valid credentials
- Form submission with invalid credentials
- Input validation error display
- Loading state during submission

### E2E Tests
- Complete login flow
- Invalid credentials handling
- Redirect after successful login
- Session persistence check

---

## Error Handling

| Error | User Message | Action |
|-------|--------------|--------|
| Invalid credentials | "Invalid email or password" | Clear password, focus email |
| Network error | "Unable to connect. Please try again." | Show retry button |
| Rate limited | "Too many attempts. Try again in X minutes." | Disable form temporarily |
| Server error | "Something went wrong. Please try again." | Show generic error |

---

## Related Files

```
frontend/src/
├── pages/Login.tsx           # Main page component
├── components/auth/
│   ├── LoginForm.tsx         # Login form component
│   └── AuthGuard.tsx         # Route protection
├── context/AuthContext.tsx   # Auth state management
└── lib/api.ts               # API client with login method
```

---

## Future Enhancements

- [ ] Social OAuth login (Google, Microsoft)
- [ ] Multi-factor authentication (TOTP)
- [ ] Biometric authentication support
- [ ] Password strength indicator
- [ ] "Magic link" passwordless login option
