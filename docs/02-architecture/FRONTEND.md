# ⚛️ Frontend Architecture

> React TypeScript frontend documentation

---

## Overview

The frontend is a React 18 application built with TypeScript and Vite, featuring a modern glassmorphism UI with real-time updates.

---

## Project Structure

```
frontend/src/
├── components/              # Reusable UI components
│   ├── adjudication/       # Alert cards, reasoning panels
│   ├── charts/             # Chart wrappers (Recharts)
│   ├── common/             # Buttons, modals, loaders
│   ├── dashboard/          # Dashboard widgets
│   ├── layout/             # Headers, sidebars
│   └── reconciliation/     # Matching components
├── context/                # React contexts
│   ├── AuthContext.tsx     # Authentication state
│   └── ThemeContext.tsx    # Theme management
├── hooks/                  # Custom hooks
│   ├── useWebSocket.ts     # Real-time updates
│   ├── useAuth.ts          # Auth utilities
│   └── useCase.ts          # Case data
├── lib/                    # Utilities
│   ├── api.ts              # API client
│   └── utils.ts            # Helpers
├── pages/                  # Route components
│   ├── Dashboard.tsx
│   ├── CaseList.tsx
│   ├── CaseDetail.tsx
│   ├── AdjudicationQueue.tsx
│   ├── Reconciliation.tsx
│   └── Settings.tsx
├── types/                  # TypeScript definitions
└── App.tsx                 # Main application
```

---

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Authentication |
| Dashboard | `/` | System overview |
| Cases | `/cases` | Case list |
| Case Detail | `/cases/:id` | Single case |
| Adjudication | `/adjudication` | Alert review |
| Reconciliation | `/reconciliation` | Transaction matching |
| Search | `/search` | Semantic search |
| Analytics | `/analytics` | Search analytics |
| Ingestion | `/ingestion` | Document upload |
| Settings | `/settings` | User preferences |

---

## Key Components

### Layout Components

```typescript
// MainLayout.tsx - App shell with sidebar
<MainLayout>
  <Sidebar />      {/* Navigation */}
  <Header />       {/* Top bar */}
  <main>{children}</main>
</MainLayout>
```

### Common Components

| Component | Purpose |
|-----------|---------|
| `Button` | Styled buttons with variants |
| `Card` | Glassmorphism card container |
| `Modal` | Dialog overlay |
| `DataTable` | Sortable, paginated table |
| `LoadingSpinner` | Loading indicator |
| `Toast` | Notification system |

### Domain Components

| Component | Purpose |
|-----------|---------|
| `AlertCard` | Adjudication alert display |
| `RiskBar` | Risk score visualization |
| `EntityGraph` | Network relationship graph |
| `TransactionRow` | Reconciliation item |
| `FrenlyBubble` | AI assistant speech bubble |

---

## State Management

### React Query (Server State)

```typescript
// Fetch cases with caching
const { data, isLoading } = useQuery({
  queryKey: ['cases', filters],
  queryFn: () => api.getCases(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Context (Client State)

```typescript
// Authentication context
const { user, login, logout } = useAuth();

// Theme context
const { theme, toggleTheme } = useTheme();
```

---

## API Client

```typescript
// lib/api.ts
export const api = {
  // With automatic timeout (30s), retry (3x), and 401 handling
  getCases: (filters?: CaseFilters) =>
    request<PaginatedResponse<Case>>('/cases', { params: filters }),

  createCase: (data: CaseCreate) =>
    request<Case>('/cases', { method: 'POST', body: data }),
};
```

---

## WebSocket Integration

```typescript
// Real-time updates
const { lastMessage, sendMessage } = useWebSocket('/ws');

useEffect(() => {
  if (lastMessage?.type === 'alert_added') {
    queryClient.invalidateQueries(['adjudication']);
  }
}, [lastMessage]);
```

---

## Styling

### Design Tokens

```css
:root {
  --primary: #3b82f6;
  --secondary: #6366f1;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
}
```

### Glassmorphism

```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
}
```

---

## Testing

```bash
# Run tests
npm test

# With coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

---

## Related

- [Frontend Development](../04-developer-guide/FRONTEND_DEVELOPMENT.md)
- [Component Library](../04-developer-guide/FRONTEND_DEVELOPMENT.md#components)
