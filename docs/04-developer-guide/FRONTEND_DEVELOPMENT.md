# ⚛️ Frontend Development Guide

> Building and extending the React frontend

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
cd frontend
npm install
npm run dev
```

Access at: http://localhost:5173

---

## Project Structure

```
frontend/src/
├── components/          # Reusable components
│   ├── common/         # Buttons, inputs, modals
│   ├── layout/         # Headers, sidebars
│   └── domain/         # Business components
├── pages/              # Route components
├── hooks/              # Custom hooks
├── context/            # React contexts
├── lib/                # Utilities
├── types/              # TypeScript types
└── App.tsx             # Main app
```

---

## Creating Components

### Component Template

```typescript
// components/common/Card.tsx
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass';
}

export function Card({ 
  children, 
  className,
  variant = 'default' 
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-4',
        variant === 'glass' && 'bg-white/10 backdrop-blur-md',
        variant === 'default' && 'bg-white shadow-lg',
        className
      )}
    >
      {children}
    </div>
  );
}
```

### Component Guidelines

| Rule | Description |
|------|-------------|
| **Max 200 lines** | Split larger components |
| **Single responsibility** | One purpose per component |
| **TypeScript strict** | No `any` types |
| **Props interface** | Always define props |
| **Default exports** | Avoid, use named exports |

---

## Custom Hooks

### Data Fetching Hook

```typescript
// hooks/useCase.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useCase(id: string) {
  return useQuery({
    queryKey: ['case', id],
    queryFn: () => api.getCase(id),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.updateCase,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['case', data.id] });
    },
  });
}
```

### WebSocket Hook

```typescript
// hooks/useWebSocket.ts
export function useWebSocket(onMessage: (msg: WSMessage) => void) {
  const ws = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    ws.current = new WebSocket(`${WS_URL}?token=${token}`);
    ws.current.onmessage = (e) => onMessage(JSON.parse(e.data));
    
    return () => ws.current?.close();
  }, []);
  
  return {
    send: (msg: object) => ws.current?.send(JSON.stringify(msg)),
  };
}
```

---

## API Client

### Using the API

```typescript
import { api } from '@/lib/api';

// Fetch cases
const cases = await api.getCases({ status: 'open' });

// Create case
const newCase = await api.createCase({ subject_id: '...', priority: 'high' });

// Upload file
await api.uploadDocument(caseId, file);
```

### Error Handling

```typescript
try {
  const data = await api.getCase(id);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      // Token expired, redirect to login
    }
    if (error.status === 404) {
      // Case not found
    }
  }
}
```

---

## Styling

### Tailwind Classes

```tsx
// Use design tokens
<div className="bg-primary text-white rounded-lg p-4">
  Content
</div>
```

### Glassmorphism

```tsx
<div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
  Glass effect
</div>
```

### Animations

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
>
  Animated content
</motion.div>
```

---

## State Management

### Server State (React Query)

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['cases', filters],
  queryFn: () => api.getCases(filters),
});
```

### Client State (Context)

```typescript
const { user, isAuthenticated } = useAuth();
const { theme, toggleTheme } = useTheme();
```

### Local State

```typescript
const [isOpen, setIsOpen] = useState(false);
const [filters, setFilters] = useState<Filters>(defaultFilters);
```

---

## Adding a New Page

1. **Create page component:**
```typescript
// pages/NewPage.tsx
export function NewPage() {
  return (
    <div className="container mx-auto p-6">
      <h1>New Page</h1>
    </div>
  );
}
```

2. **Add route in App.tsx:**
```typescript
<Route path="/new-page" element={<NewPage />} />
```

3. **Add to navigation:**
```typescript
// components/layout/Sidebar.tsx
{ path: '/new-page', label: 'New Page', icon: IconComponent }
```

---

## Testing

### Component Test

```typescript
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Hello</Card>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Hook Test

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useCase } from './useCase';

test('fetches case', async () => {
  const { result } = renderHook(() => useCase('123'));
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
});
```

---

## Build & Deploy

```bash
# Development
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint

# Build production
npm run build

# Preview build
npm run preview
```

---

## Related

- [Frontend Architecture](../02-architecture/FRONTEND.md)
- [Testing Guide](./TESTING.md)
