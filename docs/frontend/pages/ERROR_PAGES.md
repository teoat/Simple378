# Error Pages

**Status:** ✅ Implemented

---

## Overview

The Simple378 system includes comprehensive error handling with user-friendly error pages for various failure scenarios. Error pages maintain the application's design language while providing helpful guidance for recovery.

---

## Error Page Types

### 1. 404 - Not Found
**Route:** `*` (catch-all)  
**Component:** `src/pages/NotFound.tsx` or fallback UI  
**Trigger:** User navigates to non-existent route

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    🔍 404                               │
│              Page Not Found                             │
│                                                         │
│    The page you're looking for doesn't exist.          │
│         Perhaps it was moved or deleted.                │
│                                                         │
│    ┌─────────────────┐  ┌──────────────────┐          │
│    │  Go to Dashboard│  │  Back to Cases   │          │
│    └─────────────────┘  └──────────────────┘          │
│                                                         │
│    Recent Pages:                                        │
│    • Dashboard                                          │
│    • Case #5678                                         │
│    • Adjudication Queue                                 │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Suggested navigation links
- Recent pages history
- Search functionality
- Back button

---

### 2. 403 - Forbidden
**Trigger:** User attempts to access unauthorized resource  
**Common Scenarios:**
- Insufficient permissions for case
- Attempting admin action as regular user
- Accessing deleted/archived content

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    🔒 403                               │
│                 Access Denied                           │
│                                                         │
│     You don't have permission to access this            │
│              resource.                                  │
│                                                         │
│    If you believe this is an error, please              │
│    contact your system administrator.                   │
│                                                         │
│    ┌─────────────────┐  ┌──────────────────┐          │
│    │  Go to Dashboard│  │  Request Access  │          │
│    └─────────────────┘  └──────────────────┘          │
│                                                         │
│    Your current role: Analyst                           │
│    Required role: Senior Analyst or Admin               │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Clear permission requirements
- Role information display
- Request access button (sends email to admin)
- Return to safe page

---

### 3. 500 - Internal Server Error
**Trigger:** Unhandled server exception  
**Common Scenarios:**
- Database connection failure
- API service down
- Unexpected application error

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    ⚠️ 500                               │
│            Something Went Wrong                         │
│                                                         │
│    We encountered an unexpected error. Our team         │
│    has been notified and is working on a fix.           │
│                                                         │
│    Error ID: err_2025-12-06_a3f9b2                     │
│                                                         │
│    ┌─────────────────┐  ┌──────────────────┐          │
│    │   Try Again     │  │  Go to Dashboard │          │
│    └─────────────────┘  └──────────────────┘          │
│                                                         │
│    What you can do:                                     │
│    • Refresh the page                                   │
│    • Clear your browser cache                           │
│    • Try again in a few minutes                         │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Unique error ID for support
- Automatic error reporting to backend
- Retry functionality
- User-friendly suggestions

---

### 4. 401 - Unauthorized (Session Expired)
**Trigger:** JWT token expired or invalid  
**Common Scenarios:**
- User session timeout
- Token invalidated
- Logged out on another device

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    🔐 Session Expired                   │
│                                                         │
│         Your session has expired for security           │
│              reasons. Please log in again.              │
│                                                         │
│    ┌──────────────────────────────────────────┐        │
│    │              Log In Again                 │        │
│    └──────────────────────────────────────────┘        │
│                                                         │
│    Your work has been automatically saved.              │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Automatic redirect to login with return URL
- Work preservation notification
- Clear explanation of why session ended

---

### 5. Network Error (Offline)
**Trigger:** No internet connection or API unreachable  
**Component:** Handled by `ErrorBoundary` and custom network detection

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    📡 No Connection                     │
│                                                         │
│    Unable to connect to the server. Please check        │
│           your internet connection.                     │
│                                                         │
│    🔄 Retrying automatically...                         │
│                                                         │
│    ┌─────────────────┐  ┌──────────────────┐          │
│    │   Retry Now     │  │  Work Offline    │          │
│    └─────────────────┘  └──────────────────┘          │
│                                                         │
│    • Your changes will sync when reconnected            │
│    • View mode available for cached data                │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Auto-retry with exponential backoff
- Offline mode activation
- Sync status indicator
- Queue display for pending operations

---

## Error Boundary Implementation

### React Error Boundary
**Component:** `src/components/ErrorBoundary.tsx`  
**Purpose:** Catch React component errors

```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to error reporting service
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Page-Level Error Boundary
**Component:** `src/components/PageErrorBoundary.tsx`  
**Purpose:** Graceful degradation for page-level errors

**Features:**
- Isolated error containment (doesn't crash entire app)
- Fallback UI with context-aware recovery options
- Error details shown in development mode
- Automatic error reporting in production

---

## API Error Handling

### Standard Error Response Format
```typescript
interface APIError {
  error: {
    code: string;           // e.g., "CASE_NOT_FOUND"
    message: string;        // User-friendly message
    details?: any;          // Additional context
    timestamp: string;
    request_id: string;     // For debugging
  };
  status: number;          // HTTP status code
}
```

### Error Codes
| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `UNAUTHORIZED` | 401 | Invalid or expired token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily down |

---

## User Notifications

### Toast Notifications
Used for transient errors that don't require a full page:
- Form validation errors
- Save failures with retry option
- Temporary network issues
- Background operation failures

**Implementation:**
```typescript
import { toast } from 'react-hot-toast';

toast.error('Failed to save case', {
  action: {
    label: 'Retry',
    onClick: () => retrySave()
  }
});
```

### Modal Dialogs
Used for errors requiring user attention:
- Destructive action confirmations
- Data loss warnings
- Critical permission issues

---

## Error Recovery Patterns

### Automatic Retry
- Network requests: 3 retries with exponential backoff
- WebSocket reconnection: Infinite with backoff
- File uploads: Resume support

### Graceful Degradation
- Show cached data when API unavailable
- Disable features requiring connection
- Queue mutations for later sync

### User Guidance
- Clear error messages (no technical jargon)
- Actionable recovery steps
- Contact support option

---

## Development vs Production

### Development Mode
- Full error stack traces
- Detailed error information
- Source maps enabled
- Console warnings

### Production Mode
- User-friendly messages only
- Error reporting to monitoring service
- Obfuscated stack traces
- Error IDs for support tickets

---

## Monitoring & Logging

### Error Tracking
- **Service:** Sentry or similar
- **Captured Data:**
  - Error message and stack trace
  - User context (ID, role)
  - Browser and OS information
  - Recent user actions (breadcrumbs)
  - Network requests

### Error Metrics
- Error rate by page
- Error rate by API endpoint
- Most common error codes
- Time to recovery
- User impact (affected users)

---

## Accessibility

All error pages include:
- **ARIA live regions** for screen reader announcements
- **Focus management** to error message
- **Keyboard navigation** for all actions
- **High contrast** text and icons
- **Clear language** at 8th-grade reading level

---

## Testing Error Pages

### Manual Testing
1. Disconnect network → verify offline mode
2. Delete auth token → verify session expired
3. Access forbidden route → verify 403 page
4. Navigate to fake route → verify 404 page
5. Trigger server error (dev tools) → verify 500 page

### Automated Testing
```typescript
describe('Error Pages', () => {
  it('shows 404 for unknown routes', () => {
    render(<App />, { initialEntries: ['/fake-route'] });
    expect(screen.getByText(/not found/i)).toBeInTheDocument();
  });

  it('shows offline mode when network fails', async () => {
    server.use(
      rest.get('/api/*', (req, res) => res.networkError('Failed'))
    );
    // Test offline UI appears
  });
});
```

---

## Related Documentation
- [Frontend Error Handling](./docs/frontend/FRONTEND_DEVELOPMENT_GUIDELINES.md#error-handling)
- [API Error Responses](./docs/architecture/01_system_architecture.md#error-handling)
- [Monitoring Setup](./docs/ci_cd/CI_CD_SETUP_GUIDE.md#monitoring)

---

**Best Practices:**
- ✅ Always provide a way forward (action buttons)
- ✅ Log errors automatically
- ✅ Use unique error IDs
- ✅ Test error states regularly
- ✅ Make errors actionable
- ❌ Don't show stack traces to users
- ❌ Don't use technical jargon
- ❌ Don't blame the user
