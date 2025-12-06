# ⚠️ Error Pages

> Error handling and fallback views

---

## Overview

Simple378 includes dedicated error pages for different error scenarios. These pages provide clear communication to users and helpful actions to recover.

---

## Error Page Types

### 404 - Page Not Found

**Route:** Any unmatched route  
**Component:** `NotFound.tsx`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                                                                             │
│                              ╔═══════════════╗                              │
│                              ║               ║                              │
│                              ║     404       ║                              │
│                              ║               ║                              │
│                              ╚═══════════════╝                              │
│                                                                             │
│                          🔍 Page Not Found                                  │
│                                                                             │
│              The page you're looking for doesn't exist or                  │
│                      has been moved to a new location.                     │
│                                                                             │
│                                                                             │
│                    [← Go Back]  [🏠 Go to Dashboard]                        │
│                                                                             │
│                                                                             │
│              Common pages:                                                  │
│              • Dashboard  • Cases  • Adjudication                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Clear 404 message
- Navigation options
- Quick links to common pages
- Animated illustration (optional)

---

### 401 - Unauthorized

**Route:** Protected routes when not authenticated  
**Component:** `Unauthorized.tsx`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                              ╔═══════════════╗                              │
│                              ║     🔒        ║                              │
│                              ║     401       ║                              │
│                              ╚═══════════════╝                              │
│                                                                             │
│                       🔐 Authentication Required                            │
│                                                                             │
│              You need to log in to access this page.                       │
│                                                                             │
│                         [🔑 Log In]                                         │
│                                                                             │
│              Session may have expired. Please log in again.                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Clear auth requirement message
- Redirect to login
- Preserves intended destination URL
- Session expiry explanation

---

### 403 - Forbidden

**Route:** Routes without required permissions  
**Component:** `Forbidden.tsx`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                              ╔═══════════════╗                              │
│                              ║     ⛔         ║                              │
│                              ║     403       ║                              │
│                              ╚═══════════════╝                              │
│                                                                             │
│                         ⛔ Access Denied                                    │
│                                                                             │
│              You don't have permission to access this resource.            │
│                                                                             │
│                    Contact your administrator if you believe               │
│                       this is an error.                                    │
│                                                                             │
│                    [← Go Back]  [📧 Contact Admin]                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Permission denied message
- Contact admin option
- Back navigation
- User's current role displayed

---

### 500 - Server Error

**Route:** API error fallback  
**Component:** `ServerError.tsx`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                              ╔═══════════════╗                              │
│                              ║     💥        ║                              │
│                              ║     500       ║                              │
│                              ╚═══════════════╝                              │
│                                                                             │
│                       ⚠️ Something Went Wrong                               │
│                                                                             │
│              We're experiencing technical difficulties.                    │
│              Our team has been notified and is working on it.             │
│                                                                             │
│                    [🔄 Try Again]  [🏠 Go Home]                             │
│                                                                             │
│              Error ID: ERR-2024-001-XYZ                                    │
│              If the problem persists, contact support.                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Friendly error message
- Retry action
- Error tracking ID
- Auto-reload option
- Support contact link

---

### Offline / Network Error

**Component:** `OfflineError.tsx`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                              ╔═══════════════╗                              │
│                              ║     📡        ║                              │
│                              ║   OFFLINE     ║                              │
│                              ╚═══════════════╝                              │
│                                                                             │
│                       📡 No Internet Connection                             │
│                                                                             │
│              Please check your network connection and try again.           │
│                                                                             │
│                         [🔄 Retry Connection]                               │
│                                                                             │
│              Some features may be unavailable while offline.               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Network status detection
- Auto-retry on reconnection
- Offline mode indicator
- Cached data availability notice

---

## Error Boundary

**Component:** `PageErrorBoundary.tsx`

Wraps all page components to catch React errors:

```typescript
<PageErrorBoundary fallback={<ErrorFallback />}>
  <PageComponent />
</PageErrorBoundary>
```

**Error Fallback Features:**
- Catches React rendering errors
- Shows friendly error message
- "Try Again" button to reset
- Error details in dev mode
- Reports to error tracking service

---

## Components Used

| Component | Purpose |
|-----------|---------|
| `ErrorLayout` | Consistent error page layout |
| `ErrorIllustration` | Animated SVG visuals |
| `ActionButtons` | Navigation options |
| `ErrorDetails` | Technical info (dev only) |
| `SupportLink` | Contact information |

---

## Error Tracking

All errors are logged to:
- Console (development)
- Sentry or similar service (production)
- Backend audit log (authenticated errors)

Error payload includes:
- Error type and message
- Stack trace
- User ID (if authenticated)
- Page URL
- Timestamp
- Browser/device info

---

## Best Practices

1. **Clear messaging** - Tell users what happened
2. **Actionable options** - Provide ways to recover
3. **Error IDs** - Help support identify issues
4. **Consistent styling** - Match app design
5. **Accessibility** - Screen reader friendly
6. **No jargon** - User-friendly language

---

## Related Documentation

- [Login](./01_LOGIN.md) - Authentication flow
- [Dashboard](./08_DASHBOARD.md) - Main entry point
