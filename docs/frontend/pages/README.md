# Frontend Pages Documentation

> Comprehensive documentation for all Simple378 frontend pages

**Last Updated:** December 6, 2025

---

## Page Workflow

```text
┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐
│   1   │───▶│   2   │───▶│   3   │───▶│   4   │───▶│   5   │───▶│   6   │───▶│   7   │───▶│   8   │───▶│   9   │───▶│  10   │
│ Login │    │ Cases │    │Detail │    │Ingest │    │Catgz  │    │Reconc │    │ Adjud │    │ Dash  │    │  Viz  │    │Summary│
└───────┘    └───────┘    └───────┘    └───────┘    └───────┘    └───────┘    └───────┘    └───────┘    └───────┘    └───────┘
```

---

## Core Pages

| # | Page | Route | Documentation |
|---|------|-------|---------------|
| 1 | Login | `/login` | [01_LOGIN.md](./01_LOGIN.md) |
| 2 | Case Management | `/cases` | [02_CASE_LIST.md](./02_CASE_LIST.md) |
| 3 | Case Detail | `/cases/:id` | [03_CASE_DETAIL.md](./03_CASE_DETAIL.md) |
| 4 | Ingestion & Mapping | `/ingestion` | [04_INGESTION.md](./04_INGESTION.md) |
| 5 | Categorization | `/categorization` | [05_TRANSACTION_CATEGORIZATION.md](./05_TRANSACTION_CATEGORIZATION.md) |
| 6 | Reconciliation | `/reconciliation` | [06_RECONCILIATION.md](./06_RECONCILIATION.md) |
| 7 | Human Adjudication | `/adjudication` | [07_ADJUDICATION.md](./07_ADJUDICATION.md) |
| 8 | Dashboard | `/dashboard` | [08_DASHBOARD.md](./08_DASHBOARD.md) |
| 9 | Visualization | `/visualization` | [09_VISUALIZATION.md](./09_VISUALIZATION.md) |
| 10 | Final Summary | `/summary` | [10_SUMMARY.md](./10_SUMMARY.md) |

---

## Extended Pages (Bonus Features)

| Page | Route | Documentation |
|------|-------|---------------|
| Search Analytics | `/search-analytics` | [SEARCH_ANALYTICS.md](./SEARCH_ANALYTICS.md) |
| Semantic Search | `/semantic-search` | [SEMANTIC_SEARCH.md](./SEMANTIC_SEARCH.md) |

---

## Global Pages

| Page | Access Method | Documentation |
|------|---------------|---------------|
| Settings | Header icon (⚙️) | [SETTINGS.md](./SETTINGS.md) |
| Error Pages | Fallback routes | [ERROR_PAGES.md](./ERROR_PAGES.md) |

---

## Implementation Resources

| Document | Description |
|----------|-------------|
| [IMPLEMENTATION_GUIDE.md](../IMPLEMENTATION_GUIDE.md) | Step-by-step guide for implementing missing pages |
| [COMPREHENSIVE_PAGE_WORKFLOW.md](../COMPREHENSIVE_PAGE_WORKFLOW.md) | Full workflow specification |

---

## Quick Reference

### Page by Function

| Function | Page |
|----------|------|
| **Authentication** | Login |
| **Browse Cases** | Case List |
| **Investigate Case** | Case Detail |
| **Upload Data** | Ingestion |
| **Map Fields** | Ingestion |
| **Label Transactions** | Categorization |
| **Match Records** | Reconciliation |
| **Resolve Conflicts** | Adjudication |
| **View Metrics** | Dashboard |
| **Analyze Finances** | Visualization |
| **Generate Reports** | Summary |
| **Search System** | Semantic Search |
| **Usage Insights** | Search Analytics |
| **User Preferences** | Settings |

### Common Components

| Component | Used In |
|-----------|---------|
| `Header` | All pages |
| `Sidebar` | All authenticated pages |
| `FrenlyPanel` | Case Detail, Adjudication, Visualization |
| `DataTable` | Case List, Reconciliation, Categorization |
| `ChartComponents` | Dashboard, Visualization, Summary |
| `FormComponents` | Login, Ingestion, Settings |

---

## Documentation Standards

Each page document includes:

- **Overview** - Purpose and description
- **Screenshot** - ASCII wireframe layout
- **Features** - Feature table with status
- **Components** - UI components used
- **API Endpoints** - Backend integration
- **State Management** - React Query / hooks
- **Keyboard Shortcuts** - Power user keys
- **Related Pages** - Navigation links

---

## Page Status Legend

| Status | Meaning |
|--------|---------|
| ✅ | Fully implemented |
| 🔲 | Planned/Not yet implemented |
| 🔄 | Partial implementation |
| ⚠️ | Needs attention |

---

## File List

```text
docs/frontend/pages/
├── README.md             # This file
├── 01_LOGIN.md              # Login page (Page 1)
├── 02_CASE_LIST.md          # Case management (Page 2)
├── 03_CASE_DETAIL.md        # Case investigation (Page 3)
├── 04_INGESTION.md          # Data ingestion & mapping (Page 4)
├── 05_TRANSACTION_05_TRANSACTION_CATEGORIZATION.md # Transaction categorization (Page 5)
├── 06_RECONCILIATION.md     # Data reconciliation (Page 6)
├── 07_ADJUDICATION.md       # Human adjudication (Page 7)
├── 08_DASHBOARD.md          # System dashboard (Page 8)
├── 09_VISUALIZATION.md      # Financial visualization (Page 9)
├── 10_SUMMARY.md            # Final summary (Page 10)
├── SEARCH_ANALYTICS.md   # Search analytics (Extended)
├── SEMANTIC_SEARCH.md    # AI-powered search (Extended)
├── SETTINGS.md           # User settings (Global)
└── ERROR_PAGES.md        # Error handling (Global)
```

---

## Contributing

When documenting a new page:

1. Copy an existing page doc as template
2. Fill in all sections
3. Update this README index
4. Link related pages bidirectionally
5. Add to COMPREHENSIVE_PAGE_WORKFLOW.md if applicable
