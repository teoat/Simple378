# UI Design Proposals

> **⚠️ DOCUMENT STATUS: SUPERSEDED**  
> **Date Superseded:** 2025-12-16  
> **Replaced By:** [CONSOLIDATED_ARCHITECTURE_SPEC.md](./CONSOLIDATED_ARCHITECTURE_SPEC.md)  
> **Closure Report:** [CONSOLIDATION_CLOSURE_REPORT.md](./CONSOLIDATION_CLOSURE_REPORT.md)  
>
> This document has been consolidated into the unified architecture specification.  
> All content has been integrated, conflicts resolved, and implementation status updated.  
> Please refer to the consolidated document for current architecture decisions.  
> This file is retained for historical reference only.

---

# UI Design Proposals (HISTORICAL)

## 1. Login & Authentication
**Goal:** Secure, professional entry point.
- **Design:**
    - **Split Screen:** Left side with dynamic data viz animation (particles/globe), Right side with login form.
    - **Glassmorphism:** Form card with blur effect over the background.
    - **Biometrics:** "Login with FaceID/TouchID" button (WebAuthn).

## 2. Dashboard & Layout
**Goal:** High-level overview and navigation.

### Option A: "Operational"
- Focus on "Tasks Due", "Queue Depth", "Recent Alerts".
- Good for analysts.

### Option B: "Strategic"
- Focus on "Fraud Trends", "Risk Heatmap", "System Health".
- Good for managers.

## 3. Notification Center
**Goal:** Keep users informed without overwhelming them.
- **UI Elements:**
    - **Bell Icon:** In the top navigation bar with a badge count.
    - **Dropdown:** Shows the last 5-10 notifications with "Mark all as read".
    - **Toast Messages:** Non-blocking popups for immediate feedback (e.g., "Case #123 Updated").

## 4. Case Management
**Goal:** Efficient browsing and detailed investigation.

### Case List
- **Data Grid:** Sortable/filterable table with "Risk Score" heat bars.
- **Quick Preview:** Hovering over a row shows a mini-graph of the subject's connections.

### Case Detail
- **Header:** Subject profile (Avatar, Risk Score, Status).
- **Tabs:**
    - **Overview:** Key stats, recent alerts, AI summary.
    - **Graph:** Full-screen interactive entity graph.
    - **Timeline:** Vertical timeline of events.
    - **Files:** Grid view of uploaded documents with thumbnail previews.

## 5. Reconciliation (New)
**Goal:** Compare and reconcile financial records.
- **Layout:** Side-by-Side Comparison (Split View).
- **Left Pane (Expense Table):**
    - Source of truth (e.g., Bank Statement).
    - Columns: Date, Description, Amount, Category.
- **Right Pane (Reconciliation Table):**
    - Internal records (e.g., ERP/Accounting System).
    - Columns: Date, Vendor, Amount, GL Code.
- **Interactions:**
    - **Visual Diff:** Green highlight for exact matches, Yellow for partial/suggested matches, Red for orphans.
    - **Drag & Match:** Drag a row from Left to Right to manually link them.
    - **Auto-Reconcile Button:** AI-driven matching with confidence scores.

## 6. Forensics Upload
**Goal:** Simple, drag-and-drop interface.
- **Drop Zone:** Full-screen overlay when dragging files.
- **Processing State:** Animated progress bars for each stage (Virus Scan -> OCR -> Indexing).
- **Results:** Split view showing original document vs. extracted text/metadata.

## 7. Human Adjudication
**Goal:** A focused interface for reviewing fraud alerts.

### Option A: "The Triage Card" (Speed-focused)
- **Layout:**
    - **Left:** List of pending alerts (compact).
    - **Center:** Large "Card" showing the current alert details (Subject, Risk Score, Triggered Rules).
    - **Right:** Quick Action buttons (Approve, Reject, Escalate) with keyboard shortcuts.
- **Vibe:** High-velocity, like an email inbox or Tinder for fraud.

### Option B: "The Deep Dive" (Context-focused)
- **Layout:**
    - **Top:** Alert summary banner.
    - **Main:** Split view.
        - **Left:** Transaction history and Entity Graph.
        - **Right:** Evidence details and AI reasoning.
    - **Bottom:** Decision form with required comment field.
- **Vibe:** Investigative, data-heavy.

## 8. CSV Ingestion Interface
**Goal:** User-friendly data import.
- **Drag & Drop Zone:** Large area to drop files.
- **Column Mapping Wizard:**
    - After upload, show a preview of the CSV.
    - Dropdowns above each column to map to system fields (e.g., "Map 'TxnDate' to 'timestamp'").
- **Progress Bar:** Real-time feedback on rows processed/failed.

## 9. Settings & Admin
**Goal:** Granular control.
- **Layout:** Vertical tabs (General, Users, Security, Logs).
- **Audit Log:** Searchable table with JSON diff viewer for changes.
- **Theme:** Toggle between "Cyber Dark" (Default) and "Corporate Light".