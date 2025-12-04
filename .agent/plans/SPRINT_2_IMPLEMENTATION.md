# Sprint 2: Complete Implementation Plan

## Status: ✅ PLANNED & READY FOR EXECUTION

This document provides the complete implementation roadmap for Sprint 2, including all optional enhancements from the Frontend Architecture Review and core Sprint 2 objectives.

---

## Sprint 2 Objectives

### Primary Goals
1. ✅ Frontend Test Coverage (80%+ target)
2. ✅ Advanced Forensics Visualizations
3. ✅ Enhanced Adjudication Queue Features
4. ✅ Subject Management System
5. ✅ Performance Optimizations

---

## Part 1: Frontend Test Coverage

### Test Infrastructure Setup

**Dependencies Installed:**
```json
{
  "@testing-library/react": "^14.x",
  "@testing-library/jest-dom": "^6.x",
  "@testing-library/user-event": "^14.x",
  "vitest": "^1.x"
}
```

### Test Files to Create

#### 1. Adjudication Queue Tests
```typescript
// frontend/src/components/adjudication/__tests__/AlertList.test.tsx
import { render, screen } from '@testing-library/react';
import { AlertList } from '../AlertList';

describe('AlertList', () => {
  it('renders alerts correctly', () => {
    const mockAlerts = [
      { id: '1', subject_name: 'Test', risk_score: 85, status: 'pending' }
    ];
    render(<AlertList alerts={mockAlerts} onSelect={jest.fn()} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles selection', async () => {
    const onSelect = jest.fn();
    render(<AlertList alerts={mockAlerts} onSelect={onSelect} />);
    await userEvent.click(screen.getByText('Test'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
```

#### 2. DecisionPanel Tests
```typescript
// frontend/src/components/adjudication/__tests__/DecisionPanel.test.tsx
describe('DecisionPanel', () => {
  it('submits decision on approve', async () => {
    const onDecision = jest.fn();
    render(<DecisionPanel onDecision={onDecision} />);
    await userEvent.click(screen.getByText('Approve'));
    expect(onDecision).toHaveBeenCalledWith('approve', expect.any(String), '');
  });

  it('handles keyboard shortcuts', async () => {
    const onDecision = jest.fn();
    render(<DecisionPanel onDecision={onDecision} />);
    await userEvent.keyboard('a');
    expect(onDecision).toHaveBeenCalled();
  });
});
```

#### 3. Forensics Tests
```typescript
// frontend/src/components/ingestion/__tests__/UploadZone.test.tsx
describe('UploadZone', () => {
  it('accepts valid files', async () => {
    const onUpload = jest.fn();
    render(<UploadZone onUpload={onUpload} />);
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/drag & drop/i);
    await userEvent.upload(input, file);
    expect(onUpload).toHaveBeenCalledWith([file]);
  });

  it('rejects invalid files', async () => {
    render(<UploadZone onUpload={jest.fn()} />);
    const file = new File(['content'], 'test.exe', { type: 'application/exe' });
    await userEvent.upload(input, file);
    expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
  });
});
```

### Coverage Target: 80%
- Unit tests: 60+ tests
- Integration tests: 20+ tests
- E2E tests (Playwright): 10+ critical flows

---

## Part 2: Advanced Forensics Visualizations

### 2.1 Error Level Analysis (ELA) Visualization

**Implementation: `frontend/src/components/forensics/ELAVisualization.tsx`**

```typescript
import { useEffect, useRef } from 'react';

interface ELAVisualizationProps {
  imageData: string; // base64 image data
  elaData: number[][]; // ELA heatmap data
}

export function ELAVisualization({ imageData, elaData }: ELAVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !elaData) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Draw ELA heatmap
    const imageData = ctx.createImageData(elaData[0].length, elaData.length);
    
    for (let y = 0; y < elaData.length; y++) {
      for (let x = 0; x < elaData[y].length; x++) {
        const value = elaData[y][x];
        const index = (y * elaData[y].length + x) * 4;
        
        // Red for high error levels (potential manipulation)
        imageData.data[index] = value > 20 ? 255 : value * 12;
        imageData.data[index + 1] = 0;
        imageData.data[index + 2] = value < 20 ? 255 : (255 - value * 12);
        imageData.data[index + 3] = 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }, [elaData]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <img src={imageData} alt="Original" className="w-1/2" />
        <canvas ref{canvasRef} className="w-1/2" />
      </div>
      
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500" />
          <span>Low modification</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500" />
          <span>High modification</span>
        </div>
      </div>
    </div>
  );
}
```

### 2.2 Clone Detection Visualization

**Implementation: `frontend/src/components/forensics/CloneDetection.tsx`**

```typescript
export function CloneDetection({ cloneRegions }: { cloneRegions: CloneRegion[] }) {
  return (
    <div className="relative">
      <img src={imageUrl} alt="Analysis" className="w-full" />
      
      {cloneRegions.map((region, i) => (
        <svg key={i} className="absolute inset-0 w-full h-full pointer-events-none">
          <rect
            x={region.x}
            y={region.y}
            width={region.width}
            height={region.height}
            fill="none"
            stroke="#ff0000"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <text
            x={region.x}
            y={region.y - 5}
            fill="#ff0000"
            fontSize="12"
            fontWeight="bold"
          >
            Clone {i + 1} ({region.confidence}%)
          </text>
        </svg>
      ))}
      
      <div className="mt-4 space-y-2">
        {cloneRegions.map((region, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 border-2 border-red-500" />
            <span>Clone Region {i + 1}: {region.width}x{region.height}px</span>
            <span className="text-red-500">({region.confidence}% match)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Backend Support

**New endpoint: `backend/app/api/v1/endpoints/forensics.py`**

```python
@router.post("/analyze-advanced")
async def analyze_file_advanced(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Advanced forensic analysis with ELA and clone detection"""
    
    # Run ELA analysis
    ela_data = await forensic_service.error_level_analysis(file)
    
    # Run clone detection
    clone_regions = await forensic_service.detect_clones(file)
    
    # Run EXIF analysis
    metadata = await forensic_service.extract_metadata(file)
    
    return {
        "ela": ela_data,
        "clones": clone_regions,
        "metadata": metadata,
        "manipulation_score": calculate_manipulation_score(ela_data, clone_regions)
    }
```

---

## Part 3: Enhanced Adjudication Queue

### 3.1 Undo Functionality

**Implementation: `frontend/src/hooks/useDecisionHistory.ts`**

```typescript
import { useState } from 'react';

interface Decision {
  analysisId: string;
  decision: string;
  timestamp: Date;
}

export function useDecisionHistory() {
  const [history, setHistory] = useState<Decision[]>([]);
  
  const addDecision = (decision: Decision) => {
    setHistory(prev => [...prev, decision]);
  };
  
  const undo = () => {
    if (history.length === 0) return null;
    
    const lastDecision = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    
    return lastDecision;
  };
  
  const canUndo = history.length > 0;
  
  return { addDecision, undo, canUndo, history };
}
```

**Integration in AdjudicationQueue.tsx:**

```typescript
const { addDecision, undo, canUndo } = useDecisionHistory();

// After successful decision
onSuccess: (data) => {
  addDecision({ analysisId: id, decision, timestamp: new Date() });
  toast.success('Decision submitted');
},

// Handle Ctrl+Z
useHotkeys('ctrl+z, cmd+z', () => {
  if (canUndo) {
    const lastDecision = undo();
    if (lastDecision) {
      revertDecisionMutation.mutate(lastDecision.analysisId);
      toast.success('Decision reverted');
    }
  }
});
```

### 3.2 Enhanced History Tab

**Update: `frontend/src/components/adjudication/HistoryTab.tsx`**

```typescript
export function HistoryTab({ analysisId }: { analysisId: string }) {
  const { data: history } = useQuery(
    ['adjudication-history', analysisId],
    () => api.getAdjudicationHistory(analysisId)
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-cyan-500" />
        
        {history?.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative pl-12 pb-8"
          >
            {/* Timeline dot */}
            <div className="absolute left-2.5 w-3 h-3 rounded-full bg-purple-500 ring-4 ring-white dark:ring-slate-900" />
            
            {/* Content */}
            <div className="backdrop-blur-lg bg-white/10 dark:bg-slate-900/20 rounded-lg p-4 border border-white/20">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-slate-900 dark:text-white">
                  {entry.action}
                </h4>
                <time className="text-sm text-slate-500">
                  {formatDistanceToNow(new Date(entry.timestamp))} ago
                </time>
              </div>
              
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {entry.description}
              </p>
              
              {entry.reviewer_notes && (
                <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded">
                  <p className="text-sm italic">"{entry.reviewer_notes}"</p>
                </div>
              )}
              
              <div className="mt-2 text-xs text-slate-500">
                By {entry.reviewer_name}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

---

## Part 4: Subject Management System

### 4.1 Backend API

**New file: `backend/app/api/v1/endpoints/subjects.py`**

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app import deps
from app.db.models import Subject
from app.schemas import subject as schemas

router = APIRouter()

@router.get("/{subject_id}", response_model=schemas.SubjectDetail)
async def get_subject(
    subject_id: UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Get comprehensive subject information"""
    subject = await db.get(Subject, subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    # Fetch related data
    risk_history = await get_risk_history(db, subject_id)
    transactions = await get_recent_transactions(db, subject_id)
    alerts = await get_subject_alerts(db, subject_id)
    
    return {
        **subject.__dict__,
        "risk_history": risk_history,
        "recent_transactions": transactions,
        "alert_count": len(alerts),
        "total_transaction_amount": sum(t.amount for t in transactions)
    }

@router.get("/", response_model=List[schemas.SubjectSummary])
async def list_subjects(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    db: AsyncSession = Depends(deps.get_db)
):
    """List all subjects with optional search"""
    query = select(Subject)
    
    if search:
        query = query.where(
            or_(
                Subject.name.ilike(f"%{search}%"),
                Subject.email.ilike(f"%{search}%")
            )
        )
    
    results = await db.execute(query.offset(skip).limit(limit))
    return results.scalars().all()
```

### 4.2 Frontend Integration

**Update: `frontend/src/lib/api.ts`**

```typescript
// Subject management
getSubject: (subjectId: string) =>
  request<SubjectDetail>(`/subjects/${subjectId}`),

listSubjects: (params?: { search?: string; page?: number }) => {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('skip', ((params.page - 1) * 100).toString());
  
  return request<{ items: SubjectSummary[] }>(`/subjects?${searchParams}`);
},
```

---

## Part 5: Batch Operations

### 5.1 Multi-Select in Case List

**Update: `frontend/src/pages/CaseList.tsx`**

```typescript
const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());

const toggleSelection = (caseId: string) => {
  setSelectedCases(prev => {
    const next = new Set(prev);
    if (next.has(caseId)) {
      next.delete(caseId);
    } else {
      next.add(caseId);
    }
    return next;
  });
};

const selectAll = () => {
  setSelectedCases(new Set(cases.map(c => c.id)));
};

const clearSelection = () => {
  setSelectedCases(new Set());
};

// Batch actions
const batchAssign = async (assignedTo: string) => {
  await Promise.all(
    Array.from(selectedCases).map(id =>
      api.updateCase(id, { assigned_to: assignedTo })
    )
  );
  queryClient.invalidateQueries(['cases']);
  toast.success(`Assigned ${selectedCases.size} cases`);
  clearSelection();
};

const batchUpdateStatus = async (status: string) => {
  await Promise.all(
    Array.from(selectedCases).map(id =>
      api.updateCase(id, { status })
    )
  );
  queryClient.invalidateQueries(['cases']);
  toast.success(`Updated ${selectedCases.size} cases`);
  clearSelection();
};
```

### 5.2 Batch Action Bar

```typescript
{selectedCases.size > 0 && (
  <motion.div
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
  >
    <div className="backdrop-blur-xl bg-white/10 dark:bg-slate-900/20 rounded-2xl border border-white/20 px-6 py-4 shadow-2xl flex items-center gap-4">
      <span className="font-semibold">{selectedCases.size} selected</span>
      
      <select
        onChange={(e) => batchUpdateStatus(e.target.value)}
        className="rounded-lg bg-white/10 border-white/20"
      >
        <option value="">Change Status...</option>
        <option value="open">Open</option>
        <option value="in_progress">In Progress</option>
        <option value="closed">Closed</option>
      </select>
      
      <button
        onClick={() => batchAssign('current-user-id')}
        className="px-4 py-2 bg-blue-600 rounded-lg"
      >
        Assign to Me
      </button>
      
      <button
        onClick={clearSelection}
        className="text-slate-400 hover:text-white"
      >
        Cancel
      </button>
    </div>
  </motion.div>
)}
```

---

## Part 6: Performance Optimizations

### 6.1 Code Splitting

**Update: `frontend/src/App.tsx`**

```typescript
// Lazy load heavy components
const AdjudicationQueue = lazy(() => import('./pages/AdjudicationQueue'));
const CaseDetail = lazy(() => import('./pages/CaseDetail'));
const Forensics = lazy(() => import('./pages/Forensics'));

// Add loading fallback
<Suspense fallback={<PageSkeleton />}>
  <Routes>
    <Route path="/adjudication" element={<AdjudicationQueue />} />
    <Route path="/cases/:id" element={<CaseDetail />} />
    <Route path="/forensics" element={<Forensics />} />
  </Routes>
</Suspense>
```

### 6.2 Virtual List for Large Datasets

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualCaseList({ cases }: { cases: Case[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: cases.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // row height
    overscan: 5
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            <CaseRow case={cases[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Part 7: PWA Support

### 7.1 Service Worker

**New file: `frontend/public/sw.js`**

```javascript
const CACHE_NAME = 'fraud-detection-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

### 7.2 Manifest

**New file: `frontend/public/manifest.json`**

```json
{
  "name": "Fraud Detection Platform",
  "short_name": "Fraud Detect",
  "description": "Advanced fraud detection and case management",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#7c3aed",
  "background_color": "#0f172a",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## Implementation Timeline

### Week 1: Core Enhancements
- Day 1-2: Test infrastructure + 40 unit tests
- Day 3-4: Advanced forensics (ELA, clone detection)
- Day 5: Undo functionality + enhanced history

### Week 2: Advanced Features
- Day 1-2: Subject management API + frontend
- Day 3-4: Batch operations + multi-select
- Day 5: Performance optimizations

### Week 3: Polish & PWA
- Day 1-2: Complete test coverage (80%+)
- Day 3-4: PWA implementation
- Day 5: Documentation + final review

---

## Success Metrics

- ✅ Test Coverage: 80%+
- ✅ Bundle Size: <200KB (gzipped)
- ✅ Lighthouse Score: 95+
- ✅ WCAG Compliance: AAA
- ✅ API Response: <100ms p95
- ✅ Zero critical bugs

---

**Status**: Sprint 2 implementation plan complete and ready for execution
**Estimated Effort**: 3 weeks
**Team Size**: 2-3 developers
**Priority**: High
