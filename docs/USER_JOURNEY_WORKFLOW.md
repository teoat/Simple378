# User Journey Workflow

This document outlines the logical workflow for a Fraud Analyst using the platform, from initial authentication to the final case resolution.

## Phase 1: Authentication & Entry
**Goal:** Secure access to the platform.
1.  **Page:** `Login` (`/login`)
2.  **User Action:** Enter email and password.
3.  **System Action:** Authenticates user via `AuthContext`, stores token, and redirects to the default protected route (`/dashboard`).

## Phase 2: Triage & Monitoring
**Goal:** Assess system status and identify high-priority items.
1.  **Page:** `Dashboard` (`/dashboard`)
2.  **Key Insights:**
    *   **Metrics:** Check "High Risk Subjects" and "Active Cases" cards to gauge workload.
    *   **Trends:** Review "Risk Distribution" to see if there is a spike in high-severity fraud.
    *   **Live Feed:** Monitor "Recent Activity" for immediate alerts.
3.  **Navigation Decision:**
    *   *For structured case work:* Navigate to **Case Management**.
    *   *For rapid alert review:* Navigate to **Adjudication**.
    *   *For data ingestion:* Navigate to **Forensics**.

## Phase 3: Case Selection
**Goal:** Select a specific subject or alert for investigation.

### Path A: Case Management
1.  **Page:** `Case List` (`/cases`)
2.  **User Action:**
    *   **Search:** Use the search bar to find a specific entity.
    *   **Filter:** Apply filters (e.g., Status="New", Risk="High").
    *   **Sort:** Order by Risk Score (Descending) to prioritize threats.
3.  **Selection:** Click on a table row to navigate to the Case Detail view.

### Path B: Adjudication Queue
1.  **Page:** `Adjudication Queue` (`/adjudication`)
2.  **Layout:** Split-pane interface for rapid processing.
3.  **Selection:** Select an item from the "Pending" list in the left sidebar.
4.  **Review:** Details appear in the `AlertCard` (Right panel).

## Phase 4: Investigation (Deep Dive)
**Goal:** Analyze evidence to determine if fraud occurred.
1.  **Page:** `Case Detail` (`/cases/:id`)
2.  **Workflow:**
    *   **Step 1: Overview:** Review the Case Summary, AI Insights, and Risk Score.
    *   **Step 2: Link Analysis:** Switch to **Graph Analysis** tab to detect structuring circles or shared identities.
    *   **Step 3: Financial Trail:** Switch to **Financials** tab to trace fund movement (`FinancialSankey`).
    *   **Step 4: Chronology:** Switch to **Timeline** tab to understand the sequence of events.
    *   **Step 5: Evidence:** Check existing files or upload new proofs in the **Evidence** tab.

## Phase 5: Resolution (Final Summary)
**Goal:** Make a formal decision and close the investigation loop.

### In Case Detail:
1.  **Action:** Click action buttons in the header.
    *   **Approve:** Confirms fraud. Changes status to `Resolved` / `Confirmed`.
    *   **Escalate:** flags for senior review. Changes status to `Escalated`.
    *   **Edit/Update:** Modify case details if needed.

### In Adjudication Queue:
1.  **Action:** Click decision buttons on `AlertCard`.
    *   **Approve:** Flags as positive fraud hit.
    *   **Reject:** Marks as False Positive.
2.  **Feedback:** System provides undo capability (toast notification) and advances to the next item in the queue.

## Post-Resolution
*   The case status is updated globally (Real-time via WebSocket).
*   Metrics on the **Dashboard** reflect the closed case/alert.
*   The action is logged and viewable in **Settings > Audit Log**.
