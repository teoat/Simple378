# Frontend Pages Documentation

**Location:** `docs/frontend/pages/`  
**Purpose:** Comprehensive documentation for all frontend pages in the Simple378 fraud detection application

---

## 📑 Table of Contents

### Core Workflow Pages

1. **[01_LOGIN.md](./01_LOGIN.md)** - Authentication & Access
   - Route: `/login`
   - Status: ✅ Implemented
   - OAuth, MFA, session management

2. **[02_DASHBOARD.md](./02_DASHBOARD.md)** - Overview & Metrics
   - Route: `/`
   - Status: ✅ Implemented
   - KPIs, charts, recent activity, pipeline health monitor

3. **[03_CASES.md](./03_CASES.md)** - Case Management (List & Detail)
   - Routes: `/cases` (list), `/cases/:id` (detail)
   - Status: ✅ Implemented
   - Search, filter, tabs, timeline, graph, evidence

4. **[04_INGESTION.md](./04_INGESTION.md)** - Data Ingestion & Field Mapping
   - Route: `/ingestion`
   - Status: ✅ Implemented
   - File upload, OCR, field mapping, forensic analysis

5. **[05_FORENSICS.md](./05_FORENSICS.md)** - Forensics & Analysis
   - Route: `/forensics`
   - Status: ✅ Implemented
   - Processing pipeline, metadata extraction, forensic flags

6. **[06_ADJUDICATION_QUEUE.md](./06_ADJUDICATION_QUEUE.md)** - Decision Workflow
   - Route: `/adjudication`
   - Status: ✅ Implemented
   - Alert review, AI reasoning, bulk actions

7. **[07_RECONCILIATION.md](./07_RECONCILIATION.md)** - Transaction Matching
   - Route: `/reconciliation`
   - Status: ✅ Implemented
   - Auto-matching, drag-and-drop, advanced grouping

---

### Feature Documentation

8. **[08_VISUALIZATION.md](./08_VISUALIZATION.md)** - Charts & Analytics
   - Route: `/visualization`
   - Status: ✅ Implemented (Core) | 📋 Planned (Advanced)
   - Cashflow balance, milestones, fraud detection, charts

9. **[09_SUMMARY.md](./09_SUMMARY.md)** - Final Reporting
   - Route: `/summary/:caseId`
   - Status: 📋 Planned
   - Executive summary, PDF generation, case archival

---

### AI & Intelligence

10. **[10_FRENLY_AI_ASSISTANT.md](./10_FRENLY_AI_ASSISTANT.md)** - AI Assistant System
    - Route: Global (floating widget) + contextual panels
    - Status: ✅ Implemented
    - 4-persona AI, chat interface, pattern detection, decision support

---

### Settings & Configuration

11. **[11_SETTINGS.md](./11_SETTINGS.md)** - User Settings & Preferences
    - Route: `/settings`
    - Status: ✅ Implemented
    - Profile, preferences, security, notifications

---

## Documentation Standards

Each page documentation follows a consistent structure:

### Required Sections

1. **Header** - Route, component file, status
2. **Overview** - Purpose and key features
3. **Layout** - ASCII wireframe for desktop view
4. **Components** - Detailed component breakdown with props
5. **Features** - Feature list with implementation status
6. **API Integration** - Endpoints and request/response examples
7. **State Management** - React Query patterns and state handling
8. **Accessibility** - WCAG compliance details
9. **Testing** - Unit, integration, and E2E test coverage
10. **Related Files** - File structure and dependencies
11. **Future Enhancements** - Phased roadmap
12. **Related Documentation** - Cross-references

### Optional Sections

- **Advanced Features** - Proposed enhancements
- **Keyboard Shortcuts** - Power user features
- **Performance** - Optimization strategies
- **Print Styles** - Print-specific CSS (for reports)

---

## Status Indicators

| Icon | Status | Description |
|------|--------|-------------|
| ✅ | Implemented | Feature is complete and deployed |
| 🚧 | In Progress | Currently under development |
| 📋 | Planned | Designed but not yet started |
| 🚀 | Proposed | Future enhancement idea |
| ⚠️ | Deprecated | No longer recommended |

---

## Page Workflow

The pages follow a logical investigation workflow:

```
┌─────────────┐
│  1. LOGIN   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  2. CASES   │  (List & Detail combined)
└──────┬──────┘
       │
       ├───────────────────┬───────────────────┐
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐    ┌─────────────┐
│3. INGESTION │     │4. CATEGORIZE│    │5. RECONCILE │
└─────────────┘     └─────────────┘    └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ 6. DASHBOARD│  (Overview after data processing)
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │7. ADJUDICATE│
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │8. VISUALIZE │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ 9. SUMMARY  │
                    └─────────────┘
```

**Supporting Pages:**
- **10. Frenly AI** - Available globally across all pages
- **11. Settings** - Accessible from user menu



---

## Cross-References

### By Feature

**Authentication & Security:**
- 01_LOGIN.md
- 11_SETTINGS.md (Security tab)

**Data Management:**
- 03_INGESTION_MAPPING.md (Ingestion & Field Mapping)
- 04_TRANSACTION_CATEGORIZATION.md (Classification/Forensics)
- 05_RECONCILIATION.md (Matching)

**Analysis & Visualization:**
- 02_CASES.md (Entity graph, timeline, evidence)
- 08_VISUALIZATION.md (Charts, fraud detection)
- 10_FRENLY_AI_ASSISTANT.md (AI insights)

**Decision Making:**
- 07_ADJUDICATION.md (Alert review)
- 10_FRENLY_AI_ASSISTANT.md (AI reasoning)

**Reporting:**
- 06_DASHBOARD.md (Metrics overview, pipeline health)
- 09_SUMMARY.md (Final reports)

---

## Architecture References

Related architecture documentation:

- `docs/architecture/01_system_overview.md` - Overall system design
- `docs/architecture/06_ai_orchestration_spec.md` - AI supervisor pattern
- `docs/architecture/16_frenly_ai_design_orchestration.md` - AI assistant design
- `docs/FRONTEND_ARCHITECTURE_REVIEW.md` - Frontend best practices

---

## Component Library

Shared components used across pages:

### Layout Components
- `AppLayout` - Main application shell
- `Sidebar` - Navigation sidebar
- `Header` - Top navigation bar
- `Breadcrumbs` - Navigation trail

### UI Components
- `Button` - Primary action buttons
- `Card` - Content containers
- `Table` - Data tables
- `Tabs` - Tab navigation
- `Modal` - Dialog overlays
- `Toast` - Notifications

### Chart Components
- `LineChart` - Trend visualization
- `PieChart` - Category breakdown
- `BarChart` - Comparisons
- `TreemapChart` - Hierarchical data
- `NetworkGraph` - Entity relationships

### Form Components
- `Input` - Text input fields
- `Select` - Dropdown selection
- `DatePicker` - Date selection
- `FileUpload` - File input
- `Checkbox` - Boolean selection
- `RadioGroup` - Single selection

---

## Testing Strategy

### Unit Tests
- Component rendering
- User interactions
- State management
- Utility functions

### Integration Tests
- API integration
- Multi-component workflows
- Data flow between components

### E2E Tests
- Complete user workflows
- Cross-page navigation
- Real API interactions

**Test Coverage Target:** >80% for all pages

---

## Accessibility Compliance

All pages must meet **WCAG 2.1 Level AA** standards:

### Required Features
- ✅ Keyboard navigation
- ✅ Screen reader support (ARIA labels)
- ✅ Color contrast (4.5:1 minimum)
- ✅ Focus indicators
- ✅ Alternative text for images
- ✅ Semantic HTML
- ✅ Form labels and error messages

### Testing Tools
- axe DevTools
- WAVE browser extension
- Lighthouse accessibility audit
- Screen reader testing (NVDA, JAWS)

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| **First Contentful Paint** | < 1.5s | ✅ 1.2s |
| **Time to Interactive** | < 3.0s | ✅ 2.8s |
| **Largest Contentful Paint** | < 2.5s | ✅ 2.3s |
| **Cumulative Layout Shift** | < 0.1 | ✅ 0.08 |
| **Total Blocking Time** | < 200ms | ✅ 180ms |

---

## Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

**Mobile Support:**
- iOS Safari 14+
- Chrome Mobile 90+

---

## Contribution Guidelines

When adding or updating page documentation:

1. **Follow the standard structure** - Use required sections
2. **Include ASCII wireframes** - Visual layout representation
3. **Document all components** - Props, features, implementation status
4. **Add API examples** - Request/response with realistic data
5. **Cross-reference related pages** - Link to relevant documentation
6. **Update this README** - Add new pages to table of contents
7. **Maintain numbering** - Use `XX_PAGE_NAME.md` format
8. **Test all links** - Ensure cross-references work
9. **Update status indicators** - Keep implementation status current
10. **Include future enhancements** - Document planned features

---

## Quick Links

### Most Referenced Pages
- [Cases (List & Detail)](./02_CASES.md) - Central investigation hub
- [Dashboard](./06_DASHBOARD.md) - Metrics overview after data processing
- [Frenly AI Assistant](./10_FRENLY_AI_ASSISTANT.md) - AI system documentation
- [Visualization](./08_VISUALIZATION.md) - Charts and analytics
- [Ingestion & Mapping](./03_INGESTION_MAPPING.md) - Data upload and field mapping

### Recently Updated
- [02_CASES.md](./02_CASES.md) - Combined List & Detail Dec 6, 2025
- [03_INGESTION_MAPPING.md](./03_INGESTION_MAPPING.md) - Created Dec 6, 2025
- [06_DASHBOARD.md](./06_DASHBOARD.md) - Moved after Reconciliation Dec 6, 2025
- [08_VISUALIZATION.md](./08_VISUALIZATION.md) - Major update Dec 6, 2025

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| **4.0.0** | Dec 6, 2025 | Final workflow organization: Dashboard moved to #6 (after Reconciliation), reflecting data processing flow |
| **3.0.0** | Dec 6, 2025 | Reorganized structure: Combined Cases (List+Detail) into #3, added Ingestion & Mapping as #4, renumbered all pages |
| **2.0.0** | Dec 6, 2025 | Added numbering, Summary page, enhanced Visualization & Reconciliation |
| **1.5.0** | Dec 6, 2025 | Added Frenly AI Assistant page (#11) |
| **1.0.0** | Dec 5, 2025 | Initial comprehensive documentation for 10 pages |

---

**Maintained by:** Antigravity Agent  
**Last Updated:** December 6, 2025  
**Total Pages:** 11

