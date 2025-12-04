# Frontend Page Documentation

This document provides a detailed overview of the current pages in the frontend application, including their layout, features, and key components.

## Overview

The frontend is built with React, TypeScript, and Tailwind CSS. It uses `react-router-dom` for routing and `react-query` for data fetching. The application is wrapped in an `AppShell` component for authenticated routes, providing a common Sidebar and Header.

## Pages

### 1. Login
- **Route:** `/login`
- **Component:** `src/pages/Login.tsx`
- **Description:** Entry point for the application.
- **Layout:**
  - Split-screen design (on large screens).
  - Left side: Login form container with welcome text.
  - Right side: Branding area with "Advanced Fraud Detection" messaging and abstract background visual.
- **Features:**
  - **Authentication:** `LoginForm` component handling email/password input.
  - **Validation:** Real-time form validation with visual feedback.
  - **Animation:** Animated background elements and entry transitions using `framer-motion`.
  - **Responsive:** Adapts to mobile (single column) and desktop layouts.

### 2. Dashboard
- **Route:** `/dashboard` (Home)
- **Component:** `src/pages/Dashboard.tsx`
- **Description:** The main landing page providing a high-level overview of system status.
- **Layout:**
  - Header with "New Case" action.
  - **Metrics Grid:** Four key statistic cards (`StatCard`).
  - **Charts Section:** Two side-by-side charts (`RiskDistributionChart`, `WeeklyActivityChart`).
  - **Activity Feed:** List of recent system activities.
- **Features:**
  - **Real-time Updates:** WebSocket integration for live metric updates.
  - **Visualizations:** Interactive charts showing risk distribution and activity trends.
  - **Status Indicators:** "Active Cases", "High Risk Subjects", "Pending Reviews", and "System Load" metrics with trend indicators.
  - **Accessibility:** Live announcements for screen readers when data updates.

### 3. Case Management (Case List)
- **Route:** `/cases`
- **Component:** `src/pages/CaseList.tsx`
- **Description:** A comprehensive list of fraud cases for management and review.
- **Layout:**
  - Header with "New Case" button.
  - **Controls Bar:** Search input (`CaseSearch`) and Status filters (`CaseFilters`).
  - **Data Grid:** Responsive table displaying case details.
  - **Pagination:** Footer with page navigation controls.
- **Features:**
  - **Search & Filter:** Debounced search functionality (switching between Meilisearch and DB) and status filtering.
  - **Sorting:** Clickable column headers to sort by ID, Subject, Risk Score, Status, etc.
  - **Bulk Actions:** Checkbox selection for multiple cases, enabling bulk deletion.
  - **Quick Preview:** Hover over a case to see a quick summary card (`QuickPreview`).
  - **Real-time:** Updates via WebSocket for case creation/modification.
  - **Keyboard Shortcuts:** `/` to search, `Esc` to clear.

### 4. Case Detail
- **Route:** `/cases/:id`
- **Component:** `src/pages/CaseDetail.tsx`
- **Description:** In-depth view of a specific investigation case.
- **Layout:**
  - **Header:** Case subject info, status, risk score, and action toolbar (Edit, Download, Escalate, Approve).
  - **Navigation Tabs:** Overview, Graph Analysis, Timeline, Financials, Evidence.
  - **Content Area:** Dynamic content based on selected tab.
- **Features:**
  - **Overview:** Summary, key metrics, recent activity timeline, and AI insights.
  - **Graph Analysis:** Interactive node-link diagram (`EntityGraph`) visualizing relationships.
  - **Timeline:** Chronological view of case events (`Timeline`).
  - **Financials:** Sankey diagram (`FinancialSankey`) showing flow of funds.
  - **Evidence:** File upload interface for case evidence.
  - **Keyboard Navigation:** Shortcuts (1-5) to switch tabs.

### 5. Adjudication Queue
- **Route:** `/adjudication`
- **Component:** `src/pages/AdjudicationQueue.tsx`
- **Description:** specific workflow for analysts to review flagged transactions/alerts.
- **Layout:**
  - **Split View:**
    - Left Sidebar: List of pending alerts/items in the queue (`AlertList`).
    - Main Area: Detailed view of the selected alert (`AlertCard`).
- **Features:**
  - **Queue Management:** Pagination and status indicators for the queue.
  - **Decisioning:** "Approve", "Reject", or "Escalate" actions with optional comments.
  - **Optimistic UI:** Immediate feedback on decisions with "Undo" capability.
  - **Collaboration:** Real-time notifications if another analyst resolves an alert.

### 6. Reconciliation
- **Route:** `/reconciliation`
- **Component:** `src/pages/Reconciliation.tsx`
- **Description:** Tool for matching internal expenses with bank transactions.
- **Layout:**
  - **Header:** Controls for matching confidence threshold and "Auto-Reconcile" button.
  - **Upload Area:** Form to upload bank transaction files.
  - **Two-Column Lists:** "Expenses" (internal) vs. "Transactions" (bank).
- **Features:**
  - **Drag-and-Drop:** Manual matching by dragging an item from one list to the other.
  - **Auto-Reconciliation:** AI/Algorithmic matching based on the confidence threshold.
  - **File Upload:** Ingestion of transaction files.
  - **Visual Feedback:** matched/unmatched status indicators.

### 7. Forensics & Ingestion
- **Route:** `/forensics`
- **Component:** `src/pages/Forensics.tsx`
- **Description:** Interface for uploading and analyzing files or data.
- **Layout:**
  - **Header:** Title and "CSV Import" action.
  - **Upload Zone:** Drag-and-drop area for files.
  - **Pipeline View:** Visual progress of processing stages (`ProcessingPipeline`).
  - **Results Area:** Display of analysis results (metadata, OCR, flags).
  - **History:** List of past uploads.
- **Features:**
  - **Multi-stage Processing:** Visualization of Upload -> Virus Scan -> OCR -> Metadata -> Forensics -> Indexing.
  - **Analysis Results:** Display of extracted metadata and forensic flags (e.g., manipulation detection).
  - **CSV Wizard:** Modal for mapping and importing CSV transaction data.

### 8. Settings
- **Route:** `/settings`
- **Component:** `src/pages/Settings.tsx`
- **Description:** User and application configuration.
- **Layout:**
  - **Tabs:** General, Security, Audit Log.
- **Features:**
  - **General:** Profile editing (Name, Email) and Theme toggling (Light/Dark mode).
  - **Security:** Password change form.
  - **Audit Log:** Searchable table of system audit logs (`AuditLogViewer`).
