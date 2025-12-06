# Frontend Pages Documentation

**Last Updated:** December 6, 2025

This directory contains detailed documentation for each page in the Simple378 frontend application.

## Overview

The Simple378 Fraud Detection System frontend is built with:
- **React 18** with TypeScript
- **React Router DOM** for routing
- **React Query** for server state management
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **Vite** for build tooling

## Page Index

| Page | Route | Documentation |
|------|-------|---------------|
| Login | `/login` | [LOGIN.md](./LOGIN.md) |
| Dashboard | `/dashboard` | [DASHBOARD.md](./DASHBOARD.md) |
| Case List | `/cases` | [CASE_LIST.md](./CASE_LIST.md) |
| Case Detail | `/cases/:id` | [CASE_DETAIL.md](./CASE_DETAIL.md) |
| Adjudication Queue | `/adjudication` | [ADJUDICATION_QUEUE.md](./ADJUDICATION_QUEUE.md) |
| Reconciliation | `/reconciliation` | [RECONCILIATION.md](./RECONCILIATION.md) |
| Forensics | `/forensics` | [FORENSICS.md](./FORENSICS.md) |
| Settings | `/settings` | [SETTINGS.md](./SETTINGS.md) |

## Route Structure

```
/
├── /login              (Public - Login page)
└── (Protected Routes - Require AuthGuard)
    ├── /dashboard      (Home - Dashboard overview)
    ├── /cases          (Case management list)
    │   └── /:id        (Case detail view)
    ├── /adjudication   (Adjudication queue workflow)
    ├── /reconciliation (Transaction reconciliation)
    ├── /forensics      (File upload & analysis)
    └── /settings       (User & app settings)
```

## Common Patterns

### Authentication
All protected routes are wrapped with `AuthGuard` component that:
- Validates JWT tokens on mount
- Redirects to `/login` if unauthenticated
- Maintains user session via `AuthContext`

### Layout
Protected pages are rendered within `AppShell` which provides:
- Responsive sidebar navigation
- Header with user profile
- Consistent page container styling

### Data Fetching
Pages use React Query for:
- Cached data fetching with `useQuery`
- Mutations with optimistic updates
- WebSocket integration for real-time updates

### Accessibility
All pages implement:
- ARIA labels and roles
- Keyboard navigation
- Screen reader announcements for live updates
- Focus management for modals and dialogs

---

**Related Documentation:**
- [Frontend Development Guidelines](../FRONTEND_DEVELOPMENT_GUIDELINES.md)
- [Frontend Pages Overview](../FRONTEND_PAGES.md)
