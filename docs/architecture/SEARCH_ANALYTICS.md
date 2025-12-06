# Search & Analytics

**Status:** ✅ Implemented (Basic Search) | 📋 Planned (Advanced Analytics)

---

## Overview

The Search & Analytics system provides comprehensive search capabilities across cases, subjects, transactions, and documents, combined with analytics dashboards for fraud detection insights and performance metrics.

---

## Search Features

### 1. Case Search
**Location:** Case List Page  
**Implementation:** `components/cases/CaseSearch.tsx`

**Search Modes:**

#### Database Search (Default)
- **Technology:** PostgreSQL full-text search
- **Performance:** < 100ms for typical queries
- **Capabilities:**
  - Case title and description
  - Subject names
  - Case IDs
  - Status and priority
  - Date ranges

**Query Syntax:**
```
Basic:     "fraud investigation"
Exact:     "wire transfer"
Wildcard:  bank*
Multiple:  fraud OR suspicious
Exclude:   investigation -closed
```

#### Meilisearch (Planned)
- **Technology:** Meilisearch self-hosted
- **Performance:** < 50ms with typo tolerance
- **Capabilities:**
  - Fuzzy matching
  - Synonym support
  - Faceted search
  - Instant results as-you-type
  - Relevance ranking

**Toggle:**
```typescript
const [searchMode, setSearchMode] = useState<'db' | 'meilisearch'>('db');
```

---

### 2. Global Search (Planned)
**Hotkey:** `Ctrl+K` / `Cmd+K`  
**Component:** Command palette style

**Search Across:**
- Cases
- Subjects
- Transactions
- Documents
- Settings
- Help articles

**Features:**
- Recent searches
- Search history
- Quick actions (Create Case, Open Settings, etc.)
- Keyboard navigation
- Results grouped by type

---

### 3. Advanced Filters

#### Case Filters
```typescript
interface CaseFilters {
  status?: 'open' | 'pending' | 'closed' | 'archived';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  created_after?: string;
  created_before?: string;
  risk_score_min?: number;
  risk_score_max?: number;
  tags?: string[];
}
```

**UI:**
```
┌────────────────────────────────────────────────────────┐
│  Search: [                            ] [🔍] [Filters] │
├────────────────────────────────────────────────────────┤
│  Active Filters:                                       │
│  ✕ Status: Open  ✕ Priority: High  ✕ Risk > 75        │
├────────────────────────────────────────────────────────┤
│  Filter by:                                            │
│  Status:      [ All ▾ ]                               │
│  Priority:    [ All ▾ ]                               │
│  Risk Score:  [0] ━━━━━━━━━ [100]                    │
│  Date Range:  [Start] to [End]                        │
│  Assignee:    [ Search assignee... ]                  │
│  Tags:        [ Select tags... ]                      │
│                                                        │
│  [Clear All]  [Apply Filters]                         │
└────────────────────────────────────────────────────────┘
```

---

### 4. Transaction Search
**Location:** Reconciliation Page, Case Detail

**Search Fields:**
- Transaction ID
- Amount (exact or range)
- Date range
- Subject/Entity name
- Account number
- Description/memo
- Category
- Status

**Operators:**
```
Amount:      amount > 10000
             amount:1000-5000
Date:        date:2025-12-01..2025-12-06
             date > 2025-11-01
Subject:     subject:"Acme Corp"
Category:    category:wire_transfer
Status:      status:flagged OR status:pending
```

---

### 5. Document Search (Planned)
**Technology:** Qdrant vector search + keyword search

**Capabilities:**
- Full-text search in OCR'ed documents
- Semantic similarity search
- Search by metadata (author, date, file type)
- Search within specific cases
- Search by document tags

---

## Analytics Features

### 1. Dashboard Metrics
**Location:** Dashboard Page  
**Update Frequency:** Real-time via WebSocket

**Key Metrics:**

#### Overview Cards
```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Active Cases    │  │  High Risk       │  │  Pending         │
│      127         │  │  Subjects: 34    │  │  Decisions: 18   │
│  ↑ 12 this week  │  │  ↑ 5 this week   │  │  ↓ 3 this week   │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

#### Time Series Charts
- **Cases Over Time:** Daily/weekly/monthly trends
- **Alert Volume:** Incoming alerts by day
- **Decision Throughput:** Adjudications per day
- **Risk Distribution:** Changes in risk levels

---

### 2. Case Analytics

**Available Views:**
1. **Status Distribution** (Pie Chart)
   - Open, Pending, Closed, Archived percentages
   
2. **Priority Breakdown** (Bar Chart)
   - Cases by priority level
   
3. **Assignment Load** (Horizontal Bar)
   - Cases per analyst
   
4. **Resolution Time** (Line Chart)
   - Average days to close by week
   
5. **Conversion Funnel**
   - Alert → Investigation → Decision → Closed

---

### 3. Subject Analytics (Planned)

**Risk Score Distribution:**
```
Critical (90-100):  ████████░░  45 subjects
High (75-89):       ██████████  78 subjects
Medium (50-74):     ████████░░  124 subjects
Low (25-49):        ██████░░░░  89 subjects
Minimal (0-24):     ████░░░░░░  56 subjects
```

**Subject Network Metrics:**
- Most connected subjects
- Subjects with highest transaction volume
- Subjects with most alerts
- New subjects this month

---

### 4. Transaction Analytics

**Volume Metrics:**
- Total transaction count
- Total transaction value
- Average transaction size
- Transactions by category

**Anomaly Detection:**
- Transactions deviating from norms
- Unusual time-of-day patterns
- Unexpected transaction categories
- Suspicious velocity patterns

**Heat Maps:**
```
         Mon   Tue   Wed   Thu   Fri   Sat   Sun
00-06    ░░░   ░░░   ░░░   ░░░   ░░░   ░░░   ░░░
06-12    ████  ████  ████  ████  ████  ██░░  ░░░
12-18    ██████████████████████████████  ████  ██░░
18-00    ████  ████  ████  ████  ████  ████  ░░░
```

---

### 5. Performance Analytics

**Analyst Metrics:**
- Cases handled per analyst
- Average resolution time
- Decision accuracy (if feedback available)
- Productivity trends

**System Metrics:**
- API response times
- AI analysis duration
- Queue wait times
- Error rates

---

## API Endpoints

### Search APIs

#### Case Search
```http
GET /api/v1/cases/search?q={query}&mode={db|meilisearch}&filters={json}
```

**Response:**
```json
{
  "results": [
    {
      "id": "case_123",
      "title": "Wire Transfer Investigation",
      "snippet": "Suspicious <em>wire transfer</em> to offshore account...",
      "score": 0.95,
      "metadata": {
        "status": "open",
        "priority": "high",
        "created_at": "2025-12-01T10:00:00Z"
      }
    }
  ],
  "total": 47,
  "took_ms": 23
}
```

#### Global Search
```http
GET /api/v1/search?q={query}&types={cases,subjects,transactions}
```

---

### Analytics APIs

#### Dashboard Metrics
```http
GET /api/v1/analytics/dashboard?period={day|week|month}
```

#### Time Series Data
```http
GET /api/v1/analytics/timeseries?metric={cases|alerts|decisions}&start={date}&end={date}
```

#### Custom Reports
```http
POST /api/v1/analytics/reports
Content-Type: application/json

{
  "name": "Weekly Fraud Summary",
  "metrics": ["case_count", "alert_count", "risk_distribution"],
  "filters": { "priority": "high" },
  "group_by": "status",
  "period": "week"
}
```

---

## Search Optimization

### Indexing Strategy

**PostgreSQL Indexes:**
```sql
-- Full-text search
CREATE INDEX idx_cases_search ON cases 
USING GIN (to_tsvector('english', title || ' ' || description));

-- Common filters
CREATE INDEX idx_cases_status ON cases (status);
CREATE INDEX idx_cases_priority ON cases (priority);
CREATE INDEX idx_cases_created ON cases (created_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_cases_status_priority ON cases (status, priority);
```

**Meilisearch Configuration (Planned):**
```json
{
  "searchableAttributes": [
    "title",
    "description",
    "subject_names",
    "tags"
  ],
  "filterableAttributes": [
    "status",
    "priority",
    "created_at",
    "risk_score"
  ],
  "sortableAttributes": [
    "created_at",
    "updated_at",
    "risk_score"
  ],
  "rankingRules": [
    "words",
    "typo",
    "proximity",
    "attribute",
    "sort",
    "exactness"
  ]
}
```

---

## Export Capabilities

### Report Formats
- **CSV:** Tabular data export
- **PDF:** Formatted reports with charts
- **JSON:** Raw data for external tools
- **Excel:** Multi-sheet workbooks

### Scheduled Reports
```typescript
interface ScheduledReport {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  filters: CaseFilters;
  format: 'csv' | 'pdf' | 'excel';
  last_sent: string;
  next_scheduled: string;
}
```

---

## Advanced Search Features (Planned)

### 1. Saved Searches
- Save frequently used queries
- Share searches with team
- Subscribe to search alerts

### 2. Search Suggestions
- Auto-complete based on history
- Popular searches
- Related searches

### 3. Search Analytics
- Most common queries
- Failed searches (0 results)
- Click-through rates
- Search refinement patterns

---

## Performance Benchmarks

| Operation | Target | Actual |
|-----------|--------|--------|
| Simple DB search | < 100ms | ~50ms |
| Complex filtered search | < 200ms | ~120ms |
| Meilisearch (planned) | < 50ms | N/A |
| Dashboard metrics load | < 500ms | ~300ms |
| Report generation | < 3s | ~2s |
| Export (1000 records) | < 5s | ~3s |

---

## User Experience

### Search Best Practices
- **Debounced Input:** 300ms delay before search
- **Loading States:** Skeleton loaders during search
- **Empty States:** Helpful messages for 0 results
- **Error Handling:** Graceful degradation on failure
- **Pagination:** Infinite scroll or page-based

### Analytics Best Practices
- **Responsive Charts:** Mobile-friendly visualizations
- **Interactive Tooltips:** Detailed info on hover
- **Drill-Down:** Click chart to filter table
- **Export Options:** Share insights easily
- **Date Range Selector:** Quick presets (Today, This Week, etc.)

---

## Accessibility

- **Keyboard Navigation:** Tab through search results
- **Screen Reader Support:** Announce result counts
- **ARIA Labels:** Clear labels for filters and charts
- **Focus Management:** Logical tab order
- **High Contrast:** Charts readable in all modes

---

## Related Documentation
- [Case List Page](./02_CASE_LIST.md)
- [Dashboard](./08_DASHBOARD.md)
- [Semantic Search](./SEMANTIC_SEARCH.md)
- [Architecture: Vector Search](./docs/architecture/01_system_architecture.md#vector-search)

---

**Future Enhancements:**
- [ ] Natural language queries ("Show me high-risk cases from last week")
- [ ] ML-powered search result ranking
- [ ] Predictive analytics dashboard
- [ ] Anomaly detection alerts
- [ ] Custom dashboard widgets
