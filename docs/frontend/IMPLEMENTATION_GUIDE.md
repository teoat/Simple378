# Frontend Implementation Guide

> Step-by-step guide to implement missing pages and features

**Last Updated:** December 6, 2025

---

## Table of Contents

1. [Pages Not Yet Implemented](#pages-not-yet-implemented)
2. [Ingestion & Mapping Implementation](#1-ingestion--mapping-page)
3. [Visualization Page Implementation](#2-visualization-page)
4. [Final Summary Page Implementation](#3-final-summary-page)
5. [Global Components](#4-global-components)
6. [Implementation Priority](#implementation-priority)

---

## Pages Not Yet Implemented

Based on the page documentation, the following features need implementation:

| Page | Current Status | Priority |
|------|----------------|----------|
| Ingestion & Mapping | Partial (Forensics.tsx) | 🔴 High |
| Visualization | Not exists | 🟡 Medium |
| Final Summary | Not exists | 🟡 Medium |
| Meta Agent (Frenly) | Not exists | 🔴 High |
| Global Search | Partial | 🟢 Low |

---

## 1. Ingestion & Mapping Page

### Current State
The `Forensics.tsx` page handles file uploads and processing but lacks:
- Multi-step wizard flow
- Database/API source options
- Field mapping interface
- Data preview before commit

### Implementation Steps

#### Step 1: Create Page Structure

```typescript
// src/pages/Ingestion.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type IngestionStep = 'source' | 'upload' | 'mapping' | 'preview' | 'confirm';

export default function Ingestion() {
  const [step, setStep] = useState<IngestionStep>('source');
  const [sourceType, setSourceType] = useState<'file' | 'database' | 'api'>('file');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [mapping, setMapping] = useState<FieldMapping[]>([]);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Data Ingestion</h1>
      
      {/* Progress Steps */}
      <StepProgress currentStep={step} steps={STEPS} />
      
      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 'source' && <SourceSelection onSelect={setSourceType} onNext={() => setStep('upload')} />}
        {step === 'upload' && <UploadStep sourceType={sourceType} onUpload={setUploadedFile} onNext={() => setStep('mapping')} />}
        {step === 'mapping' && <MappingStep file={uploadedFile} onMapping={setMapping} onNext={() => setStep('preview')} />}
        {step === 'preview' && <PreviewStep data={previewData} onNext={() => setStep('confirm')} />}
        {step === 'confirm' && <ConfirmStep onConfirm={handleSubmit} />}
      </AnimatePresence>
    </div>
  );
}
```

#### Step 2: Create Step Components

**SourceSelection.tsx**
```typescript
// src/components/ingestion/SourceSelection.tsx
export function SourceSelection({ onSelect, onNext }) {
  const [selected, setSelected] = useState<string | null>(null);
  
  const sources = [
    { id: 'file', icon: FileUp, label: 'File Upload', desc: 'CSV, JSON, Excel, PDF' },
    { id: 'database', icon: Database, label: 'Database', desc: 'SQL, PostgreSQL, MySQL' },
    { id: 'api', icon: Link, label: 'API Feed', desc: 'REST, GraphQL endpoints' },
  ];
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {sources.map(source => (
        <button
          key={source.id}
          onClick={() => { setSelected(source.id); onSelect(source.id); }}
          className={cn(
            'p-6 rounded-xl border-2 transition-all',
            selected === source.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          )}
        >
          <source.icon className="w-12 h-12 mb-4" />
          <h3>{source.label}</h3>
          <p className="text-sm text-gray-500">{source.desc}</p>
        </button>
      ))}
    </div>
  );
}
```

**FieldMapper.tsx**
```typescript
// src/components/ingestion/FieldMapper.tsx
interface FieldMapperProps {
  sourceFields: SourceField[];
  targetFields: TargetField[];
  mapping: FieldMapping[];
  onMappingChange: (mapping: FieldMapping[]) => void;
}

export function FieldMapper({ sourceFields, targetFields, mapping, onMappingChange }) {
  const handleDrop = (sourceId: string, targetId: string) => {
    const newMapping = [...mapping, { source: sourceId, target: targetId }];
    onMappingChange(newMapping);
  };
  
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-2">
        <h3>Source Fields</h3>
        {sourceFields.map(field => (
          <DraggableField key={field.id} field={field} />
        ))}
      </div>
      <div className="space-y-2">
        <h3>Target Model</h3>
        {targetFields.map(field => (
          <DroppableField 
            key={field.id} 
            field={field} 
            onDrop={(sourceId) => handleDrop(sourceId, field.id)}
            mappedFrom={mapping.find(m => m.target === field.id)?.source}
          />
        ))}
      </div>
    </div>
  );
}
```

#### Step 3: Add Routes

```typescript
// src/App.tsx - Add route
<Route path="/ingestion" element={<Ingestion />} />
```

#### Step 4: Update Sidebar Navigation

Add "Ingestion" to the sidebar navigation with the correct icon and order.

---

## 2. Visualization Page

### Implementation Steps

#### Step 1: Create Page Structure

```typescript
// src/pages/FinancialVisualization.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { KPICard } from '../components/visualization/KPICard';
import { ExpenseChart } from '../components/visualization/ExpenseChart';
import { BalanceTreemap } from '../components/visualization/BalanceTreemap';
import { AIInsightPanel } from '../components/visualization/AIInsightPanel';

export default function FinancialVisualization() {
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [aiQuestion, setAiQuestion] = useState('');
  
  const { data: kpis } = useQuery({
    queryKey: ['visualization', 'kpis', dateRange],
    queryFn: () => api.getFinancialKPIs(dateRange),
  });
  
  const { data: expenses } = useQuery({
    queryKey: ['visualization', 'expenses', dateRange],
    queryFn: () => api.getExpenseTrend(dateRange),
  });
  
  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Financial Visualization</h1>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </header>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <KPICard title="Cash Flow" value={kpis?.cashFlow} trend={kpis?.cashFlowTrend} icon={TrendingUp} />
        <KPICard title="Balance Sheet" value={kpis?.balanceRatio} status={kpis?.balanceStatus} icon={Scale} />
        <KPICard title="P&L Summary" value={kpis?.netProfit} margin={kpis?.margin} icon={DollarSign} />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <h2>Balance Sheet Breakdown</h2>
          <BalanceTreemap data={kpis?.balanceSheet} />
        </Card>
        
        <Card>
          <h2>AI Insights</h2>
          <AIInsightPanel 
            insight={aiInsight}
            onAsk={setAiQuestion}
          />
        </Card>
      </div>
      
      <Card>
        <h2>Monthly Expense Trend</h2>
        <ExpenseChart data={expenses} />
      </Card>
    </div>
  );
}
```

#### Step 2: Create Chart Components

**ExpenseChart.tsx** (using Recharts)
```typescript
// src/components/visualization/ExpenseChart.tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function ExpenseChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

**BalanceTreemap.tsx** (using D3 or Recharts Treemap)
```typescript
// src/components/visualization/BalanceTreemap.tsx
import { Treemap, ResponsiveContainer } from 'recharts';

export function BalanceTreemap({ data }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <Treemap
        data={data}
        dataKey="value"
        aspectRatio={4/3}
        stroke="#fff"
        fill="#8884d8"
      >
        <Tooltip />
      </Treemap>
    </ResponsiveContainer>
  );
}
```

#### Step 3: Create Backend Endpoints

```python
# backend/app/api/v1/visualization.py
from fastapi import APIRouter, Query
from datetime import date

router = APIRouter(prefix="/visualization", tags=["visualization"])

@router.get("/kpis")
async def get_financial_kpis(
    start_date: date = Query(None),
    end_date: date = Query(None),
):
    # Calculate KPIs from transaction data
    return {
        "cashFlow": calculate_cash_flow(start_date, end_date),
        "cashFlowTrend": "+15%",
        "balanceRatio": "1.8:1",
        "balanceStatus": "healthy",
        "netProfit": 850000000,
        "margin": "12%",
    }

@router.get("/expenses")
async def get_expense_trend(
    start_date: date = Query(None),
    end_date: date = Query(None),
):
    # Return monthly expense data
    return [
        {"month": "Jan", "amount": 500000000},
        {"month": "Feb", "amount": 450000000},
        # ...
    ]
```

---

## 3. Final Summary Page

### Implementation Steps

#### Step 1: Create Page Structure

```typescript
// src/pages/FinalSummary.tsx
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';

export default function FinalSummary() {
  const { caseId } = useParams();
  
  const { data: summary } = useQuery({
    queryKey: ['summary', caseId],
    queryFn: () => api.getCaseSummary(caseId),
  });
  
  const generatePDF = useMutation({
    mutationFn: () => api.generateReport(caseId),
    onSuccess: (url) => window.open(url, '_blank'),
  });
  
  const archiveCase = useMutation({
    mutationFn: () => api.archiveCase(caseId),
    onSuccess: () => navigate('/cases'),
  });
  
  return (
    <div className="p-6 space-y-6">
      {/* Success Banner */}
      <SuccessBanner 
        status={summary?.status}
        qualityScore={summary?.qualityScore}
        daysToResolution={summary?.daysToResolution}
      />
      
      {/* Executive Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard
          title="Ingestion"
          icon={FileUp}
          metrics={[
            { label: 'Records', value: summary?.ingestion?.records },
            { label: 'Files', value: summary?.ingestion?.files },
          ]}
          status={summary?.ingestion?.complete ? 'complete' : 'pending'}
        />
        <SummaryCard
          title="Reconciliation"
          icon={Repeat}
          metrics={[
            { label: 'Match Rate', value: `${summary?.reconciliation?.matchRate}%` },
            { label: 'New Records', value: summary?.reconciliation?.newRecords },
          ]}
          status="complete"
        />
        <SummaryCard
          title="Adjudication"
          icon={Scale}
          metrics={[
            { label: 'Resolved', value: summary?.adjudication?.resolved },
            { label: 'Avg Time', value: summary?.adjudication?.avgTime },
          ]}
          status="complete"
        />
      </div>
      
      {/* Key Findings */}
      <KeyFindings findings={summary?.findings} />
      
      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={() => generatePDF.mutate()} icon={FileDown}>
          Generate PDF Report
        </Button>
        <Button onClick={() => archiveCase.mutate()} variant="secondary" icon={Archive}>
          Archive Case
        </Button>
        <Button onClick={() => navigate('/cases/new')} variant="outline" icon={Plus}>
          Start New Case
        </Button>
      </div>
    </div>
  );
}
```

#### Step 2: Create PDF Generation Service

```python
# backend/app/services/report_generator.py
from weasyprint import HTML
from jinja2 import Template

class ReportGenerator:
    def __init__(self):
        self.template = self._load_template()
    
    def generate_pdf(self, case_id: str) -> bytes:
        # Fetch case data
        case_data = self._get_case_data(case_id)
        
        # Render HTML template
        html_content = self.template.render(
            case=case_data,
            generated_at=datetime.now(),
        )
        
        # Convert to PDF
        pdf = HTML(string=html_content).write_pdf()
        return pdf
```

---

## 4. Global Components

### Meta Agent (Frenly AI)

```typescript
// src/components/global/MetaAgent.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function MetaAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const sendMessage = async (text: string) => {
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    
    // Get AI response
    const response = await api.askFrenly(text, { context: getCurrentContext() });
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
  };
  
  return (
    <>
      {/* Floating Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-5 right-5 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg"
      >
        <Bot className="w-8 h-8 text-white" />
        {hasNotification && <span className="notification-dot" />}
      </button>
      
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed top-20 right-5 w-96 h-[60vh] bg-white rounded-2xl shadow-2xl"
          >
            <ChatPanel messages={messages} onSend={sendMessage} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

### Global Search

```typescript
// src/components/global/GlobalSearch.tsx
import { useState, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  
  // Cmd+K shortcut
  useHotkeys('mod+k', () => setIsOpen(true), { preventDefault: true });
  
  // Debounced search
  const { data: results } = useQuery({
    queryKey: ['search', query],
    queryFn: () => api.globalSearch(query),
    enabled: query.length > 2,
  });
  
  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput 
        placeholder="Search cases, IDs, or data..." 
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {results?.cases?.map(case => (
          <CommandItem key={case.id} onSelect={() => navigate(`/cases/${case.id}`)}>
            {case.name}
          </CommandItem>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
```

---

## Implementation Priority

### Phase 1: High Priority (Week 1-2)
- [ ] Ingestion multi-step wizard
- [ ] Field mapping interface
- [ ] Meta Agent UI shell

### Phase 2: Medium Priority (Week 3-4)
- [ ] Visualization page with charts
- [ ] Final Summary page
- [ ] PDF report generation

### Phase 3: Enhancement (Week 5-6)
- [ ] Global search with Cmd+K
- [ ] AI integration for Meta Agent
- [ ] Database/API source connections

### Phase 4: Polish (Week 7-8)
- [ ] Animations and transitions
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] E2E testing

### Phase 5: Advanced Analytics (Post-Launch) 🚀
- [ ] AI Auto-Mapping & Stitching (Ingestion)
- [ ] Many-to-One & ML Ghost Matching (Reconciliation)
- [ ] Story Mode & Link Analysis (Summary)
- [ ] Burn Rate Sim & What-If Analysis (Visualization)
- [ ] Redaction Gap Analysis (Ingestion)

---

## Dependencies to Install

```bash
# Charts
npm install recharts d3

# Drag and drop
npm install @dnd-kit/core @dnd-kit/sortable

# PDF generation (frontend preview)
npm install @react-pdf/renderer

# Command menu (for global search)
npm install cmdk

# Hotkeys
npm install react-hotkeys-hook
```

---

## Testing Checklist

For each implemented page:

- [ ] Component renders without errors
- [ ] All API calls work correctly
- [ ] Loading states display properly
- [ ] Error states are handled
- [ ] Mobile responsive
- [ ] Keyboard navigation works
- [ ] Screen reader accessible
- [ ] E2E test passes
