# Frontend Page Descriptions

This document provides a comprehensive description of every page in the Simple378 frontend application, detailing their features, functions, and design elements based on the current codebase.

## 1. Adjudication Queue (`AdjudicationQueue.tsx`)

**Path:** `/frontend/src/pages/AdjudicationQueue.tsx`

### Description
The central hub for analysts to review flagged cases and alerts. It provides a prioritized queue of items requiring human attention, integrated with AI assistance.

### Features
- **Queue Management:** Displays a paginated list of alerts/cases pending review.
- **Real-time Updates:** Uses WebSockets to show new alerts instantly as they are flagged.
- **AI Assistant:** Integrated "AI Reasoning" tab that explains why a case was flagged.
- **Decision Making:** Interface for analysts to approve, reject, or escalate cases.
- **Concurrency Handling:** Detects if another analyst resolves an alert while viewing it.

### Functions
- **Data Fetching:** `useQuery` fetches paginated queue data (`api.getAdjudicationQueue`).
- **Real-time Sync:** `useWebSocket` listens for `alert_added`, `alert_resolved`, and `queue_updated` events.
- **State Management:** `useAdjudicationQueue` hook manages the selection state and decision logic.
- **Optimistic Updates:** UI updates immediately upon decision, invalidated by query refetch.

### Design
- **Layout:** Three-column layout:
  1.  **Left:** Scrollable list of alerts (`AlertList`).
  2.  **Center:** Detailed view of the selected alert (`AlertCard`).
  3.  **Right:** AI Assistant panel (`AIReasoningTab`).
- **Components:** Uses `AdjudicationQueueSkeleton` for loading states.
- **Feedback:** Toast notifications for new alerts and successful actions.

---

## 2. Case Detail (`CaseDetail.tsx`)

**Path:** `/frontend/src/pages/CaseDetail.tsx`

### Description
A comprehensive view of a specific investigation case, aggregating all available data including graphs, timelines, financials, and evidence.

### Features
- **Multi-view Interface:** Tabbed navigation to switch between different analytical views.
- **Entity Graph:** Visualizes relationships between the subject and other entities.
- **Timeline:** Chronological view of events and transactions.
- **Financial Analysis:** Detailed breakdown of financial data.
- **Evidence Management:** Interface to view and upload evidence files.
- **Keyboard Navigation:** Shortcuts (1-5) to switch tabs quickly.

### Functions
- **Routing:** Uses `useParams` to retrieve the case ID from the URL.
- **Data Fetching:** `useCaseDetail` hook aggregates data fetching logic.
- **Animations:** `framer-motion` used for smooth tab transitions.

### Design
- **Header:** Prominent subject info, risk score (`RiskBar`), and status (`StatusBadge`).
- **Navigation:** Tab bar for Overview, Graph Analysis, Timeline, Financials, and Evidence.
- **Layout:**
  - **Main Content:** Dynamic area changing based on selected tab.
  - **Sidebar:** Actions (Escalate, Approve) and AI Insights.
- **Visuals:** Glassmorphism headers, animated transitions.

---

## 3. Case List (`CaseList.tsx`)

**Path:** `/frontend/src/pages/CaseList.tsx`

### Description
The primary registry of all cases in the system, allowing for searching, filtering, and management.

### Features
- **Data Grid:** Paginated table of cases with sortable columns.
- **Search & Filter:** Real-time search and multi-criteria filtering (status, risk, assignee).
- **Bulk Actions:** Select multiple cases to perform batch operations.
- **Real-time Updates:** List refreshes automatically when cases are created or updated via WebSocket.

### Functions
- **State Management:** `useCaseList` hook manages search query, filters, pagination, and sorting state.
- **Real-time Sync:** `useWebSocket` listens for `case_created`, `case_updated`, `case_deleted`.
- **Cache Management:** `useQueryClient` invalidates queries to ensure data freshness.

### Design
- **Components:** `CaseTable`, `CaseSearch`, `CaseFilters`, `BulkActions`.
- **Layout:** Responsive container with glassmorphism effects.
- **Interactions:** Hover effects on rows, smooth pagination controls.

---

## 4. Dashboard (`Dashboard.tsx`)

**Path:** `/frontend/src/pages/Dashboard.tsx`

### Description
The landing page for authenticated users, providing a high-level overview of system status, key metrics, and recent activity.

### Features
- **Key Metrics:** Cards displaying Active Cases, High Risk Subjects, Pending Reviews, and System Load.
- **Visualizations:** Charts for Risk Distribution and Weekly Activity.
- **Activity Feed:** Real-time list of recent system actions.
- **Quick Actions:** Button to create a new case.

### Functions
- **Data Fetching:** Parallel `useQuery` calls for metrics and activity feed.
- **Real-time Sync:** `useWebSocket` updates stats dynamically without page reload.
- **Accessibility:** Live region announcements for screen readers when stats update.

### Design
- **Layout:** Grid-based layout adapting to screen size (1 col mobile -> 4 cols desktop for metrics).
- **Visuals:** `StatCard` components with trend indicators. Animated entry using `framer-motion`.
- **Theme:** Fully responsive and dark-mode compatible.

---

## 5. Forensics & Ingestion (`Forensics.tsx`)

**Path:** `/frontend/src/pages/Forensics.tsx`

### Description
A tool for uploading and analyzing raw data files, performing OCR, metadata extraction, and forensic validation.

### Features
- **File Upload:** Drag-and-drop zone for file ingestion.
- **Progress Tracking:** Real-time visualization of the processing pipeline (Upload -> Scan -> OCR -> etc.).
- **CSV Import:** Wizard for batch importing transaction data.
- **Analysis Results:** Displays extracted metadata, OCR text, and forensic flags (e.g., manipulation detection).
- **History:** Log of recent uploads.

### Functions
- **Upload Logic:** `useMutation` handles file transmission.
- **Progress Sync:** `useForensicsProgress` hook connects to WebSocket for granular progress updates.
- **Batch Processing:** Dedicated logic for parsing and mapping CSV columns.

### Design
- **Components:** `UploadZone`, `ProcessingPipeline`, `ForensicResults`, `CSVWizard`.
- **Visuals:** Step-by-step progress bars, split-view for results (file vs data).

---

## 6. Login (`Login.tsx`)

**Path:** `/frontend/src/pages/Login.tsx`

### Description
The entry point for the application, handling user authentication.

### Features
- **Authentication:** Secure login form.
- **Visual Appeal:** High-end animated background to establish premium feel.

### Functions
- **Auth Logic:** Delegated to `LoginForm` component.
- **Error Handling:** Wrapped in `PageErrorBoundary`.

### Design
- **Layout:** Split screen (Form on one side, branding/messaging on the other).
- **Visuals:** Animated background blobs, glassmorphism cards, gradient text.

---

## 7. Reconciliation (`Reconciliation.tsx`)

**Path:** `/frontend/src/pages/Reconciliation.tsx`

### Description
A workspace for matching internal expense records with external bank transactions to identify discrepancies.

### Features
- **Drag-and-Drop Matching:** Intuitive interface to link expenses to transactions.
- **Auto-Reconciliation:** Algorithm to automatically match items based on a confidence threshold.
- **Manual Upload:** Ability to upload transaction files for a specific subject/bank.
- **Visual Feedback:** Indicators for matched, unmatched, and flagged items.

### Functions
- **Data Fetching:** Fetches separate lists for expenses and transactions.
- **Interaction:** Drag-and-drop API handlers (`onDragStart`, `onDrop`).
- **Mutation:** `autoReconcileMutation` triggers the backend matching algorithm.

### Design
- **Layout:** Two-column split view (Expenses vs. Bank Transactions).
- **Interactions:** Draggable items, drop zones highlighted on drag over.
- **Components:** `TransactionRow` displays individual line items.

---

## 8. Search Analytics (`SearchAnalytics.tsx`)

**Path:** `/frontend/src/pages/SearchAnalytics.tsx`

### Description
A dashboard providing insights into how users are utilizing the search functionality.

### Features
- **Usage Metrics:** Total searches, active users, average results count.
- **Performance Metrics:** Cache hit rate, success rate, average response time.
- **Popular Queries:** List of most frequent search terms.
- **Insights:** AI-generated textual insights about search patterns.

### Functions
- **Data Fetching:** `useQuery` with aggressive caching (stale time 5 mins) and retry logic.
- **Normalization:** Uses `normalizeSearchAnalytics` to ensure data consistency.
- **Error Handling:** Custom error UI with retry button.

### Design
- **Layout:** Grid of summary cards and detailed panels.
- **Visuals:** Uses icons (`lucide-react`) to represent data categories. Clean, dashboard-style presentation.

---

## 9. Semantic Search (`SemanticSearch.tsx`)

**Path:** `/frontend/src/pages/SemanticSearch.tsx`

### Description
An advanced search interface allowing users to find cases using natural language queries.

### Features
- **Natural Language Processing:** Accepts complex queries (e.g., "high-risk transactions in NY").
- **Filtering:** Advanced filters for date range, risk score, and status.
- **Saved Searches:** Ability to save and reload complex search configurations.
- **History:** Access to previous search queries.

### Functions
- **Search Logic:** `useQuery` triggers search API. Mocked semantic scoring in current implementation.
- **State Management:** Local state for query string, active filters, and saved searches.

### Design
- **Layout:** Tabbed interface separating the main Search view, Filters, and Saved Searches.
- **Components:** `Card`-based results list, `Badge` for metadata.

---

## 10. Settings (`Settings.tsx`)

**Path:** `/frontend/src/pages/Settings.tsx`

### Description
User configuration center for profile management, security settings, and system preferences.

### Features
- **Profile Management:** Update name and email.
- **Security:** Change password with strict validation rules.
- **Two-Factor Auth:** Setup wizard for 2FA (TOTP/SMS).
- **Theme:** Toggle between Light and Dark modes.
- **Audit Log:** View history of user actions.

### Functions
- **Validation:** `useFormValidation` hook ensures data integrity before submission.
- **Mutations:** Separate mutations for profile, password, and preferences updates.
- **Theme Logic:** Direct DOM manipulation for class toggling + backend persistence.

### Design
- **Layout:** Vertical tabs for navigation (General, Security, Audit).
- **Interactions:** Real-time validation feedback, modal for 2FA setup.
