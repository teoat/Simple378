# Implementation Action Plans - Critical Priority Items

**Date:** December 6, 2025  
**Purpose:** Detailed implementation specifications for Critical Priority enhancements  
**Parent Document:** COMPREHENSIVE_PAGE_DIAGNOSIS.md

---

## Overview

This document provides actionable implementation details for the 8 Critical Priority items identified in the comprehensive diagnosis. Each item includes technical specifications, acceptance criteria, and integration requirements.

---

## 1. Bulk Operations (Case List)

### Objective
Enable batch actions on multiple cases simultaneously to improve workflow efficiency for teams managing 100+ cases.

### Technical Specification

**Frontend Components:**
```typescript
// New component: BulkActionBar.tsx
interface BulkActionBarProps {
  selectedCount: number;
  onArchive: () => void;
  onAssign: (userId: string) => void;
  onDelete: () => void;
  onExport: () => void;
  onClearSelection: () => void;
}

// Add to CaseList.tsx
const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());
```

**API Endpoints:**
```typescript
POST /api/v1/cases/bulk/archive
POST /api/v1/cases/bulk/assign
POST /api/v1/cases/bulk/delete
POST /api/v1/cases/bulk/export
```

**UI Flow:**
1. Checkbox appears on hover for each case row
2. "Select All" checkbox in table header
3. Bulk action bar appears at bottom when 1+ cases selected
4. Confirmation modal for destructive actions (delete)
5. Progress indicator for long-running operations (export 1000+ cases)

**Acceptance Criteria:**
- [ ] Can select/deselect individual cases
- [ ] "Select All" works across all pages (with warning >100 items)
- [ ] Bulk archive completes in <5s for 100 cases
- [ ] Bulk assign shows user picker dropdown
- [ ] Bulk delete requires confirmation + reason
- [ ] Bulk export generates CSV/Excel within 30s for 1000 cases
- [ ] Undo functionality for archive/assign (30s grace period)

**Effort Estimate:** 40 hours (1 week)

---

## 2. Collaborative Comments (Case Detail)

### Objective
Enable team members to discuss cases, mention colleagues, and track conversation threads directly within case detail page.

### Technical Specification

**Frontend Components:**
```typescript
// New component: CommentThread.tsx
interface Comment {
  id: string;
  author: User;
  content: string;
  mentions: string[]; // User IDs
  attachments?: Attachment[];
  createdAt: string;
  editedAt?: string;
  replies?: Comment[];
}

// CommentEditor with rich text + mentions
// @username autocomplete using Tribute.js or similar
```

**API Endpoints:**
```typescript
GET    /api/v1/cases/:id/comments
POST   /api/v1/cases/:id/comments
PUT    /api/v1/comments/:id
DELETE /api/v1/comments/:id
POST   /api/v1/comments/:id/replies
```

**Real-time Updates:**
```typescript
// WebSocket events
wsClient.on('case.comment.added', (data) => {
  appendComment(data.comment);
  showNotification(`${data.author} commented`);
});
```

**UI Features:**
- Threaded replies (1 level deep)
- @mention autocomplete (triggers notification)
- Rich text editor (bold, italic, links, code blocks)
- Attachment support (images, PDFs)
- Edit/delete own comments (within 15 min)
- "Pin" important comments to top

**Acceptance Criteria:**
- [ ] Comments appear in real-time to all viewers
- [ ] @mentions send email + in-app notification
- [ ] Comment timestamps are relative ("2 hours ago")
- [ ] Attachments preview inline (images) or show file icon
- [ ] Reply threads collapse/expand
- [ ] Users can edit comments within 15 minutes
- [ ] Deleted comments show "[deleted]" placeholder
- [ ] Comment count badge shows in case list

**Effort Estimate:** 80 hours (2 weeks)

---

## 3. Scheduled Ingestion (Ingestion & Mapping)

### Objective
Automate recurring data imports from SFTP, email attachments, or API endpoints on configurable schedules.

### Technical Specification

**Frontend Components:**
```typescript
// New component: ScheduleBuilder.tsx
interface IngestionSchedule {
  id: string;
  name: string;
  sourceType: 'sftp' | 'email' | 'api' | 's3';
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  cronExpression?: string;
  sourceConfig: {
    host?: string;
    path?: string;
    credentials: string; // Encrypted reference
  };
  mappingTemplateId: string;
  notifications: {
    onSuccess: string[]; // Email addresses
    onFailure: string[];
  };
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
}
```

**Backend Service:**
```python
# services/ingestion_scheduler.py
class IngestionScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
    
    def schedule_job(self, schedule: IngestionSchedule):
        job = self.scheduler.add_job(
            func=self._run_ingestion,
            trigger='cron',
            **parse_cron(schedule.cronExpression),
            id=schedule.id
        )
        return job
```

**API Endpoints:**
```typescript
GET    /api/v1/ingestion/schedules
POST   /api/v1/ingestion/schedules
PUT    /api/v1/ingestion/schedules/:id
DELETE /api/v1/ingestion/schedules/:id
POST   /api/v1/ingestion/schedules/:id/run  // Manual trigger
GET    /api/v1/ingestion/schedules/:id/history
```

**UI Flow:**
1. "Schedules" tab in Ingestion page
2. List of configured schedules with last run status
3. "New Schedule" button opens wizard:
   - Step 1: Name & source type
   - Step 2: Connection details (SFTP host, credentials)
   - Step 3: Frequency picker (daily at 2am, weekly Monday, etc.)
   - Step 4: Select mapping template
   - Step 5: Configure notifications
4. Test connection button
5. "Run Now" button for manual execution

**Acceptance Criteria:**
- [ ] Can schedule daily, weekly, monthly ingestions
- [ ] Custom cron expressions supported
- [ ] Encrypted credential storage (AWS Secrets Manager / Vault)
- [ ] Email notifications on success/failure
- [ ] Failed jobs auto-retry 3x with exponential backoff
- [ ] Detailed logs accessible from UI
- [ ] Can pause/resume schedules without deletion
- [ ] Supports SFTP, S3, Email (IMAP), REST APIs

**Effort Estimate:** 120 hours (3 weeks)

---

## 4. Custom Category Trees (Categorization)

### Objective
Allow organizations to define industry-specific category hierarchies (construction, healthcare, legal) beyond default accounting categories.

### Technical Specification

**Data Model:**
```typescript
interface CategoryNode {
  id: string;
  name: string;
  code?: string; // e.g., "GL-4000" for accounting code
  parentId?: string;
  level: number; // 0 = root, 1 = category, 2 = subcategory
  icon?: string;
  color?: string;
  isActive: boolean;
  metadata?: {
    glAccount?: string;
    taxDeductible?: boolean;
    requiresApproval?: boolean;
  };
}

interface CategoryTree {
  id: string;
  name: string;
  organizationId: string;
  isDefault: boolean;
  nodes: CategoryNode[];
  createdAt: string;
  updatedAt: string;
}
```

**Frontend Components:**
```typescript
// CategoryTreeBuilder.tsx - Drag-drop tree editor
// Uses react-sortable-tree or similar
// CategoryPicker.tsx - Hierarchical dropdown
```

**API Endpoints:**
```typescript
GET    /api/v1/categories/trees
POST   /api/v1/categories/trees
PUT    /api/v1/categories/trees/:id
GET    /api/v1/categories/trees/:id/nodes
POST   /api/v1/categories/trees/:id/nodes
PUT    /api/v1/categories/nodes/:id
DELETE /api/v1/categories/nodes/:id
POST   /api/v1/categories/trees/:id/import  // CSV import
GET    /api/v1/categories/trees/:id/export  // CSV export
```

**UI Features:**
- Visual tree builder with drag-drop reordering
- Import from CSV (Parent, Category, Code columns)
- Export to Excel for offline editing
- Color coding by category type
- Icon picker for visual distinction
- "Clone Tree" to start from template
- Merge/split categories (with transaction reassignment)

**Acceptance Criteria:**
- [ ] Can create unlimited depth hierarchy (recommend max 4 levels)
- [ ] Drag-drop reordering updates all transactions
- [ ] CSV import validates structure before applying
- [ ] Color codes persist in all transaction views
- [ ] Can mark categories as "archived" without deletion
- [ ] Bulk reassign transactions when merging categories
- [ ] Tree export includes all metadata
- [ ] Default categories ship with system (10-15 common ones)

**Effort Estimate:** 80 hours (2 weeks)

---

## 5. Three-Way Reconciliation (Reconciliation)

### Objective
Implement bank-book-statement reconciliation for enterprise accounting compliance, identifying discrepancies across all three sources.

### Technical Specification

**Data Model:**
```typescript
interface ThreeWayReconciliation {
  id: string;
  period: { start: string; end: string };
  bankBalance: number;
  bookBalance: number;
  statementBalance: number;
  
  reconciliationItems: {
    bankToBook: ReconciliationItem[];
    bookToStatement: ReconciliationItem[];
    bankToStatement: ReconciliationItem[];
  };
  
  variances: {
    bankBookDiff: number;
    bookStatementDiff: number;
    bankStatementDiff: number;
  };
  
  status: 'pending' | 'in_progress' | 'reviewed' | 'approved';
  approvedBy?: string;
  approvedAt?: string;
}

interface ReconciliationItem {
  id: string;
  type: 'deposit_in_transit' | 'outstanding_check' | 'bank_fee' | 'adjustment';
  amount: number;
  description: string;
  date: string;
  resolved: boolean;
}
```

**Algorithm:**
```typescript
// Three-way matching logic
function performThreeWayMatch(
  bankTxns: Transaction[],
  bookTxns: Transaction[],
  statementTxns: Transaction[]
): ThreeWayResult {
  // Step 1: Match bank ↔ book
  const bankBookMatches = matchTransactions(bankTxns, bookTxns);
  
  // Step 2: Match book ↔ statement
  const bookStatementMatches = matchTransactions(bookTxns, statementTxns);
  
  // Step 3: Identify three-way matches (ideal)
  const perfectMatches = findPerfectMatches(bankBookMatches, bookStatementMatches);
  
  // Step 4: Classify variances
  const variances = classifyVariances({
    unmatchedBank,
    unmatchedBook,
    unmatchedStatement
  });
  
  return { matches, variances };
}
```

**UI Components:**
```typescript
// ThreeWayReconciliationView.tsx
// Three-column layout: Bank | Book | Statement
// Drag-drop matching between columns
// Variance classification panel
// Approval workflow
```

**Acceptance Criteria:**
- [ ] Can upload/import from all three sources
- [ ] Auto-match exact amount+date across all three
- [ ] Manual drag-drop for fuzzy matches
- [ ] Variance report with classification (timing, fees, errors)
- [ ] Approval workflow with comments
- [ ] Export reconciliation report (PDF, Excel)
- [ ] Period locking after approval (no retroactive changes)
- [ ] Audit trail of all reconciliation actions

**Effort Estimate:** 160 hours (4 weeks)

---

## 6. Risk-Based Queue Prioritization (Adjudication)

### Objective
Automatically prioritize adjudication queue by risk score, amount, and aging to ensure high-impact items are reviewed first.

### Technical Specification

**Scoring Algorithm:**
```typescript
interface QueueItem {
  id: string;
  riskScore: number; // 0-100 from ML model
  amount: number;
  daysPending: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

function calculatePriority(item: QueueItem): number {
  const riskWeight = 0.5;
  const amountWeight = 0.3;
  const agingWeight = 0.2;
  
  const normalizedRisk = item.riskScore / 100;
  const normalizedAmount = Math.min(item.amount / 100000, 1); // Cap at $100k
  const normalizedAging = Math.min(item.daysPending / 30, 1); // Cap at 30 days
  
  const priorityScore = 
    (normalizedRisk * riskWeight) +
    (normalizedAmount * amountWeight) +
    (normalizedAging * agingWeight);
  
  return priorityScore * 100; // 0-100 scale
}
```

**API Endpoints:**
```typescript
GET /api/v1/adjudication/queue?sort=priority&order=desc
PUT /api/v1/adjudication/priority-weights // Admin config
```

**UI Features:**
- Priority badge on each queue item (colored dot)
- Sort by: Priority (default), Risk, Amount, Date
- Filters: "Show Critical Only", "My Assignments"
- Priority distribution chart (25 critical, 100 high, etc.)
- Admin panel to adjust weighting formula

**Acceptance Criteria:**
- [ ] Queue auto-sorts by priority on load
- [ ] Priority recalculates every hour (cron job)
- [ ] "Critical" items (top 10%) highlighted in red
- [ ] Email alerts for new critical items
- [ ] Admin can adjust weights with preview
- [ ] Manual override: "Move to Top" button
- [ ] Priority history tracked per item

**Effort Estimate:** 40 hours (1 week)

---

## 7. Visualization Page - Core Implementation

### Objective
Build the missing Visualization page with 7 essential chart types for financial analysis.

### Technical Specification

**Chart Library:** Recharts (React wrapper for D3)

**Core Charts:**
1. **Cash Flow Over Time** (Line chart)
2. **Expense Breakdown** (Pie chart)
3. **Category Comparison** (Bar chart)
4. **Fund Flow** (Sankey diagram)
5. **Timeline** (Gantt-style)
6. **Risk Distribution** (Stacked area)
7. **Vendor Spend** (Horizontal bar)

**Component Structure:**
```typescript
// Visualization.tsx (main page)
// ChartContainer.tsx (wrapper for consistent styling)
// ChartSelector.tsx (dropdown to switch chart types)
// FilterPanel.tsx (date range, category filters)
// ExportButton.tsx (PNG, SVG, CSV export)

interface ChartConfig {
  type: 'line' | 'pie' | 'bar' | 'sankey' | 'timeline' | 'area';
  dataSource: string; // API endpoint
  filters: {
    dateRange: { start: string; end: string };
    categories?: string[];
    minAmount?: number;
  };
  displayOptions: {
    title: string;
    xAxis?: string;
    yAxis?: string;
    colors?: string[];
  };
}
```

**API Endpoints:**
```typescript
GET /api/v1/visualization/cashflow?start=...&end=...
GET /api/v1/visualization/expenses/breakdown
GET /api/v1/visualization/category-comparison
GET /api/v1/visualization/fund-flow
POST /api/v1/visualization/export // Returns PNG/SVG
```

**Acceptance Criteria:**
- [ ] All 7 chart types render correctly
- [ ] Charts are interactive (hover for values, click to drill down)
- [ ] Date range picker filters all charts
- [ ] Export to PNG (for reports), SVG (for editing), CSV (data)
- [ ] Charts responsive on mobile/tablet
- [ ] Loading states with skeleton screens
- [ ] Empty state when no data ("No transactions in this period")
- [ ] Accessibility: Keyboard navigation, ARIA labels

**Effort Estimate:** 200 hours (5 weeks)

---

## 8. Summary Page - Core Implementation

### Objective
Build the missing Final Summary page with automated report generation and 3 essential templates.

### Technical Specification

**Report Templates:**
1. **Forensic Investigation Report** (30+ pages)
   - Executive summary
   - Methodology
   - Findings
   - Evidence attachments
   - Recommendations
   
2. **Executive Summary** (2-3 pages)
   - Key metrics
   - Risk highlights
   - Action items
   
3. **Audit Trail** (chronological log)
   - All system actions
   - User activities
   - Data changes

**Report Generation Engine:**
```typescript
interface ReportTemplate {
  id: string;
  name: string;
  sections: ReportSection[];
  formatting: {
    pageSize: 'A4' | 'Letter';
    orientation: 'portrait' | 'landscape';
    font: string;
    margins: { top: number; right: number; bottom: number; left: number };
  };
}

interface ReportSection {
  id: string;
  type: 'text' | 'table' | 'chart' | 'image';
  title: string;
  content: any;
  order: number;
}

// PDF generation using jsPDF or html2pdf
async function generateReport(
  templateId: string,
  caseId: string
): Promise<Blob> {
  const template = await getTemplate(templateId);
  const data = await getCaseData(caseId);
  
  const pdf = new jsPDF(template.formatting);
  
  for (const section of template.sections) {
    await renderSection(pdf, section, data);
  }
  
  return pdf.output('blob');
}
```

**API Endpoints:**
```typescript
GET  /api/v1/reports/templates
POST /api/v1/reports/generate
GET  /api/v1/reports/:id/download
GET  /api/v1/reports/:id/preview
```

**UI Flow:**
1. Summary page shows 3 template cards
2. Click "Generate Forensic Report"
3. Modal appears with options:
   - Include attachments? (yes/no)
   - Include all transactions? (yes/filtered)
   - Date range
4. Progress indicator (5-30s for generation)
5. Preview in browser (first 3 pages)
6. Download PDF or share link

**Acceptance Criteria:**
- [ ] Can generate all 3 templates in <30s
- [ ] PDFs are professional quality (proper headers/footers, page numbers)
- [ ] Images/charts embed correctly
- [ ] Table of contents auto-generated with page links
- [ ] Preview loads first 3 pages without full generation
- [ ] Can email report directly from UI
- [ ] Reports include metadata (generated by, date, version)
- [ ] Can regenerate with updated data (versioning)

**Effort Estimate:** 160 hours (4 weeks)

---

## Implementation Priority Order

**Week 1-2:** Risk-Based Queue + Bulk Operations (parallel teams)  
**Week 3-4:** Custom Category Trees  
**Week 5-8:** Three-Way Reconciliation  
**Week 9-10:** Collaborative Comments  
**Week 11-13:** Scheduled Ingestion  
**Week 14-18:** Visualization Page (5 charts minimum)  
**Week 19-22:** Summary Page (3 templates minimum)

**Total:** 22 weeks (5.5 months) for all 8 critical items

---

## Resource Requirements

**Frontend Team:** 2 senior developers  
**Backend Team:** 2 senior developers  
**DevOps:** 1 engineer (infrastructure for scheduling)  
**QA:** 1 tester (dedicated)  
**Design:** 1 UI/UX designer (part-time, 20%)

**Total:** 6.2 FTE

---

## Success Criteria

### Phase Completion Checkpoints

**Month 1 (Weeks 1-4):**
- [ ] Bulk operations live in production
- [ ] Risk-based queue deployed
- [ ] Custom categories in beta

**Month 2 (Weeks 5-8):**
- [ ] Three-way reconciliation alpha testing
- [ ] Collaborative comments live

**Month 3 (Weeks 9-13):**
- [ ] Scheduled ingestion operational
- [ ] Visualization page (5 charts) in beta

**Month 4-5 (Weeks 14-22):**
- [ ] Visualization complete (7 charts)
- [ ] Summary page operational (3 templates)

### KPIs

| Metric | Baseline | Target (Post-Implementation) |
|--------|----------|------------------------------|
| Time to close case | 8 hours | 3 hours |
| Manual reconciliation time | 4 hours | 30 minutes |
| Report generation time | 2 hours | 5 minutes |
| Team collaboration lag | 2 days | 2 hours |
| User satisfaction | 7.2/10 | 8.5/10 |

---

*Document Version: 1.0*  
*Last Updated: December 6, 2025*  
*Approved By: [Pending]*
