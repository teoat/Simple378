# 🧠 Semantic Search Page (Extended)

> AI-powered natural language search

**Route:** `/semantic-search`  
**File:** `src/pages/SemanticSearch.tsx`  
**Status:** Extended/Bonus Feature

---

## Overview

The Semantic Search page allows users to search using natural language queries. The AI interprets intent across the entire database, provides relevance scoring, and highlights matched terms.

---

## Screenshot

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🧠 Semantic Search                                       [💾 My Searches ▼] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ 🔍 "show me all companies with mirroring patterns over 500 million"  │ │
│  │                                                           [Search 🔎] │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  Filters: [Risk Score: 0-100] [Date: Any ▼] [Type: Company ▼] [Status ▼]   │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────     │
│  Found 23 results in 245ms          Sorted by: [Relevance ▼]               │
│  ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ ★★★★★ 98% Match                                                       │ │
│  │                                                                        │ │
│  │ 🏢 PT ABC Industries                          Case: CASE-2024-001     │ │
│  │ ───────────────────                                                   │ │
│  │ Pattern: [MIRRORING] detected with Rp 720M in circular transactions  │ │
│  │ Risk Score: 🔴 95   Last Activity: Jan 15, 2024                       │ │
│  │                                                                        │ │
│  │ Matched: "mirroring patterns", "company", "over 500 million"         │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ ★★★★☆ 87% Match                                                       │ │
│  │                                                                        │ │
│  │ 🏢 CV XYZ Corporation                         Case: CASE-2024-002     │ │
│  │ ───────────────────                                                   │ │
│  │ Pattern: [MIRRORING] detected with Rp 540M through subsidiary        │ │
│  │ Risk Score: 🟡 72   Last Activity: Jan 12, 2024                       │ │
│  │                                                                        │ │
│  │ Matched: "mirroring patterns", "company", "over 500 million"         │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ ★★★☆☆ 72% Match                                                       │ │
│  │                                                                        │ │
│  │ 🏢 PT DEF Trading                             Case: CASE-2024-005     │ │
│  │ ───────────────────                                                   │ │
│  │ Pattern: [ROUND_TRIP] with mirroring elements, Rp 890M total         │ │
│  │ Risk Score: 🟡 68   Last Activity: Jan 10, 2024                       │ │
│  │                                                                        │ │
│  │ Matched: "mirroring", "company", "500 million"                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  [Show More Results]                                                        │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────     │
│  📜 SEARCH HISTORY                          [💾 Save This Search]          │
│  ─────────────────────────────────────────────────────────────────────     │
│  • "high risk individuals in Jakarta" - 2 hours ago                        │
│  • "ghost employee patterns" - Yesterday                                    │
│  • "transactions over 1 billion" - 3 days ago                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Natural Language Input | ✅ | Conversational queries |
| Semantic Understanding | ✅ | AI interprets intent |
| Relevance Scoring | ✅ | Star rating for matches |
| Matched Terms | ✅ | Highlight matching parts |
| Advanced Filters | ✅ | Risk, date, type, status |
| Saved Searches | ✅ | Save and reuse queries |
| Search History | ✅ | Recent searches list |
| Result Preview | ✅ | Quick summary cards |

---

## How It Works

1. **User enters natural language query**
   - "show me companies with unusual patterns"
   
2. **AI interprets intent**
   - Entities: company
   - Pattern: unusual/anomaly
   - Context: fraud detection

3. **Query vector generated**
   - Semantic embedding created
   - Compared against document embeddings

4. **Results ranked by relevance**
   - Cosine similarity scoring
   - Metadata boosting (risk, recency)

---

## Query Examples

| Natural Language Query | Interpretation |
|------------------------|----------------|
| "high risk individuals in Jakarta" | Risk ≥70, type: individual, location: Jakarta |
| "mirroring over 500 million" | Pattern: mirroring, amount ≥500M |
| "cases assigned to me this week" | Assignee: current user, date: this week |
| "shell companies with bank connections" | Pattern: shell, has bank account links |

---

## Result Card Elements

| Element | Description |
|---------|-------------|
| **Relevance Stars** | 1-5 star rating |
| **Match Percentage** | Confidence score |
| **Entity Info** | Name, type, case link |
| **Pattern Badge** | Detected fraud pattern |
| **Risk Indicator** | Color-coded risk score |
| **Matched Terms** | Highlighted query matches |

---

## Components Used

| Component | Purpose |
|-----------|---------|
| `SemanticSearchInput` | Large search bar |
| `FilterBar` | Advanced filters |
| `ResultCard` | Individual result display |
| `RelevanceStars` | Visual match score |
| `MatchHighlight` | Term highlighting |
| `SearchHistory` | Recent queries |
| `SavedSearches` | User favorites |

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/search/semantic` | Execute semantic search |
| GET | `/api/v1/search/history` | Get search history |
| POST | `/api/v1/search/save` | Save a search |
| GET | `/api/v1/search/saved` | Get saved searches |

---

## State Management

```typescript
// Search query
const [query, setQuery] = useState('');

// Execute search
const { data: results, isLoading } = useQuery({
  queryKey: ['semantic-search', query, filters],
  queryFn: () => api.semanticSearch(query, filters),
  enabled: query.length > 3,
});

// Saved searches
const { data: savedSearches } = useQuery({
  queryKey: ['saved-searches'],
  queryFn: api.getSavedSearches,
});
```

---

## Advanced Filters

| Filter | Options |
|--------|---------|
| **Risk Score** | Range slider (0-100) |
| **Date Range** | Any, Last week, Last month, Custom |
| **Entity Type** | All, Individual, Company |
| **Status** | All, Open, Closed, Under Review |
| **Pattern** | Any, Mirroring, Shell, Ghost, etc. |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search input |
| `Enter` | Execute search |
| `↑` / `↓` | Navigate results |
| `Enter` | Open selected result |
| `S` | Save current search |

---

## Performance

- Vector search via Qdrant/Pinecone
- Query caching for repeated searches
- Debounced input (300ms)
- Lazy load result details

---

## Related Pages

- [Search Analytics](./SEARCH_ANALYTICS.md) - Usage insights
- [Case Detail](./03_CASE_DETAIL.md) - View full case
- [Dashboard](./08_DASHBOARD.md) - Return to overview
