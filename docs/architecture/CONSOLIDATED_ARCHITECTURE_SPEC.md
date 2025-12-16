# Consolidated Architecture Specification

## Document Status
**Status:** Active - Consolidated Design Specification  
**Version:** 1.0  
**Last Updated:** 2025-12-16  
**Replaces:** 03_proposed_additions.md, 04_ui_design_proposals.md

This document consolidates the initial architectural proposals (files 03 and 04) with the detailed orchestration specifications (files 11-16), resolving any conflicts and providing a unified architecture reference.

---

## Table of Contents
1. [Core System Features](#1-core-system-features)
2. [Authentication & Security](#2-authentication--security)
3. [Dashboard & Visualization](#3-dashboard--visualization)
4. [Case Management](#4-case-management)
5. [Adjudication System](#5-adjudication-system)
6. [Forensics & Data Ingestion](#6-forensics--data-ingestion)
7. [AI Assistant](#7-ai-assistant)
8. [Infrastructure & Services](#8-infrastructure--services)
9. [Implementation Status](#9-implementation-status)

---

## 1. Core System Features

### 1.1 System Architecture Overview
The Simple378 Fraud Detection System consists of:
- **Frontend:** React-based SPA with TypeScript
- **Backend:** FastAPI with Python
- **Database:** PostgreSQL for relational data
- **Vector Store:** Qdrant for semantic search
- **Cache/Queue:** Redis for caching and message queuing
- **API Gateway:** Nginx for routing and security

### 1.2 Key Capabilities
- Real-time fraud detection and analysis
- Human-in-the-loop adjudication
- Multi-format evidence processing
- AI-powered investigation assistance
- Comprehensive audit and compliance tracking

---

## 2. Authentication & Security

### 2.1 Authentication System
**Reference:** Detailed in `11_auth_page_design_orchestration.md`

#### Core Features
- **Multi-Factor Authentication (MFA):**
  - TOTP-based 2FA with QR code setup
  - Backup codes for recovery
  - Biometric authentication via WebAuthn
  - Platform authenticator support (FaceID/TouchID)

- **Session Management:**
  - JWT token-based authentication
  - Refresh token automatic renewal
  - Configurable session timeout
  - Multi-device support with concurrent sessions

- **Security Features:**
  - Token blacklisting on logout
  - IP tracking for suspicious activity
  - Device fingerprinting
  - Complete audit logging
  - Rate limiting protection

#### UI Design (from 04_ui_design_proposals.md)
- **Split-screen layout** with animated background (left) and glassmorphism login form (right)
- **Biometric priority** for mobile devices
- **Responsive design** adapting to mobile, tablet, and desktop
- **Accessibility:** Full WCAG 2.1 AA compliance

### 2.2 Access Control
- **Role-based permissions** for feature access
- **Data classification** and sensitive information protection
- **Audit logging** of all access and actions
- **Encryption** for data transmission and storage

---

## 3. Dashboard & Visualization

### 3.1 Dashboard Design
**Reference:** Detailed in `12_dashboard_page_design_orchestration.md`

#### Layout Options (from 04_ui_design_proposals.md)
**Option A - "Operational" (Recommended for Analysts):**
- Focus on "Tasks Due", "Queue Depth", "Recent Alerts"
- Real-time case metrics and workload indicators
- Quick access to pending items

**Option B - "Strategic" (Recommended for Managers):**
- Focus on "Fraud Trends", "Risk Heatmap", "System Health"
- High-level analytics and performance metrics
- Business intelligence visualization

#### Core Components
- **KPI Cards:** Real-time system metrics
- **Chart Widgets:** Interactive data visualization (Chart.js/D3.js)
- **Activity Timeline:** Recent system events
- **Quick Actions:** Common task shortcuts
- **Alert Center:** Priority notification display

### 3.2 Notification Center (from 03_proposed_additions.md)
- **Bell icon** in navigation with badge count
- **Dropdown view** showing last 5-10 notifications
- **Toast messages** for non-blocking immediate feedback
- **Channels:**
  - In-App: Server-Sent Events (SSE) or WebSockets
  - Email: SMTP for critical alerts
  - Webhook: Slack/Teams integration

---

## 4. Case Management

### 4.1 Case Management Interface
**Reference:** Detailed in `13_case_management_design_orchestration.md`

#### Case List View (from 04_ui_design_proposals.md)
- **Data grid** with sortable/filterable columns
- **Risk score heat bars** for visual prioritization
- **Quick preview** on hover showing mini-graph of connections
- **Bulk operations** for efficient case handling

#### Case Detail View
- **Header:** Subject profile with avatar, risk score, status
- **Tab interface:**
  - **Overview:** Key stats, recent alerts, AI summary
  - **Graph:** Interactive entity relationship visualization
  - **Timeline:** Vertical timeline of events
  - **Files:** Grid view of evidence with thumbnails
  - **Analysis:** Detailed forensic analysis results

### 4.2 Entity Graph Visualization
- **Interactive network graph** using D3.js or Cytoscape
- **Node types:** Subjects, transactions, accounts, entities
- **Edge types:** Transfers, relationships, ownership
- **Filtering and navigation** for large datasets
- **Evidence linking** to supporting documentation

---

## 5. Adjudication System

### 5.1 Human Adjudication Workflow
**Reference:** Detailed in `14_adjudication_queue_design_orchestration.md`  
**Original Proposal:** From `03_proposed_additions.md`

#### Architecture Components
- **Database Tables:**
  - `AdjudicationQueue`: Links AnalysisResult to User (analyst)
  - `AdjudicationDecision`: Records decision type, comments, timestamp
  
- **API Endpoints:**
  - `GET /api/v1/adjudication/queue`: List pending alerts
  - `POST /api/v1/adjudication/{alert_id}/decide`: Submit decision

- **Workflow States:**
  1. System generates high-score AnalysisResult
  2. Alert added to AdjudicationQueue
  3. Analyst reviews evidence in UI
  4. Analyst submits decision
  5. System updates Subject risk score

#### Decision Types
- **Approve:** Confirm fraud and escalate for action
- **Reject:** Mark as false positive with reasoning
- **Escalate:** Require higher-level review
- **Request More Info:** Need additional evidence/analysis

#### UI Design Options (from 04_ui_design_proposals.md)

**Option A - "The Triage Card" (Speed-focused - RECOMMENDED):**
- **Layout:** List (left) + Large Card (center) + Quick Actions (right)
- **Interaction:** High-velocity review with keyboard shortcuts
- **Use Case:** High-volume case processing
- **Vibe:** Like email inbox or card-based selection

**Option B - "The Deep Dive" (Context-focused):**
- **Layout:** Alert banner (top) + Split view (main) + Decision form (bottom)
- **Left pane:** Transaction history and entity graph
- **Right pane:** Evidence details and AI reasoning
- **Use Case:** Complex case investigation
- **Vibe:** Investigative, data-heavy analysis

### 5.2 Quality Assurance
- **Decision consistency** through standardized criteria
- **Quality metrics** tracking accuracy and completeness
- **Supervisor review** and feedback integration
- **Training integration** for analyst skill development

---

## 6. Forensics & Data Ingestion

### 6.1 Evidence Processing
**Reference:** Detailed in `15_forensics_ingestion_design_orchestration.md`  
**Original Proposal:** From `04_ui_design_proposals.md`

#### Upload Interface
- **Drag-and-drop zone** with full-screen overlay when active
- **Multi-file support** with parallel uploads
- **Processing pipeline visualization:**
  - Virus Scan → OCR → Metadata Extraction → Indexing
- **Animated progress bars** for each stage
- **Results view:** Split screen showing original vs extracted content

#### Processing Stages
1. **Upload:** File reception and validation
2. **Security:** Virus/malware scanning
3. **Metadata:** EXIF and file property extraction
4. **OCR:** Text extraction from images/documents
5. **Analysis:** Forensic analysis and pattern detection
6. **Indexing:** Search indexing and storage

### 6.2 CSV Ingestion System
**Reference:** From `03_proposed_additions.md` (Enhanced specification)

#### Architecture
- **Flexible Schema Mapping:**
  - `MappingConfig` to map CSV columns to Transaction model
  - Support for diverse column names (e.g., "Posting Date" vs "Date")
  - Template library for common bank formats

- **Data Validation:**
  - Pydantic models for row-by-row validation
  - Error reporting stored in `IngestionErrors` table
  - Streaming ingestion for large files

- **Async Processing:**
  - Background tasks (Celery/FastAPI BackgroundTasks)
  - Progress tracking and status updates
  - Failure recovery and retry logic

#### Multi-Bank Statement Support
- **Data Normalization:**
  - Unified Transaction model across all sources
  - Source tracking: `source_bank` and `source_file_id` fields
  - Automatic format detection

- **Entity Resolution:**
  - Fuzzy matching to identify same entities across banks
  - Name + DOB/SSN matching (when available)
  - Confidence scoring for matches

- **Cross-Bank Analysis:**
  - Mirroring detection across institutions
  - Aggregated velocity calculations
  - Multi-account risk assessment

#### CSV Ingestion UI (from 04_ui_design_proposals.md)
- **Large drag-and-drop area** for file upload
- **Column mapping wizard:**
  - Preview of CSV data
  - Dropdown menus to map columns to system fields
  - Save mappings as templates
- **Real-time progress bar** showing rows processed/failed
- **Error summary** with downloadable error report

### 6.3 Reconciliation Interface (from 04_ui_design_proposals.md)
**Status:** Proposed for future implementation

#### Layout
- **Side-by-side comparison** (split view)
- **Left pane:** Bank statement (source of truth)
- **Right pane:** Internal records (ERP/Accounting)

#### Features
- **Visual diff highlighting:**
  - Green: Exact matches
  - Yellow: Partial/suggested matches
  - Red: Unmatched orphans
- **Drag-and-match:** Manual linking between records
- **Auto-reconcile button:** AI-driven matching with confidence scores

---

## 7. AI Assistant

### 7.1 Frenly AI Integration
**Reference:** Detailed in `16_frenly_ai_design_orchestration.md`

#### Core Capabilities
- **Natural language queries** for case investigation
- **Multi-persona analysis:**
  - Investigator: Evidence-focused analysis
  - Auditor: Compliance-focused review
  - Defense: Alternative interpretations
- **Context-aware responses** using case data
- **Evidence citation** in all responses
- **Learning from analyst feedback**

#### User Interface
- **Chat interface** with conversation history
- **Persona selector** for different analysis perspectives
- **Code block rendering** for technical output
- **Evidence links** inline with responses
- **Export functionality** for reports

---

## 8. Infrastructure & Services

### 8.1 Notification Service
**From:** `03_proposed_additions.md`

#### Architecture
- **Service:** `NotificationService` in backend
- **Storage:** `notifications` table for history
- **Delivery Channels:**
  - In-App: SSE/WebSockets for real-time updates
  - Email: SMTP for critical alerts ("High Risk Subject Detected")
  - Webhook: Slack/Teams integration for operations teams

#### Features
- **Priority levels** for alert routing
- **User preferences** for notification channels
- **Digest mode** for non-critical notifications
- **Template system** for consistent messaging

### 8.2 API Gateway (Production)
**From:** `03_proposed_additions.md`

#### Component Selection
- **Technology:** Nginx or Traefik container
- **Position:** Secure entry point for entire application

#### Responsibilities
- **SSL Termination:** Handle HTTPS certificates
- **Rate Limiting:** Prevent abuse and DoS attacks
- **Routing:**
  - `/api/*` → Backend service
  - `/*` → Frontend static files
- **Security Headers:**
  - HSTS (HTTP Strict Transport Security)
  - CSP (Content Security Policy)
  - X-Frame-Options
  - X-Content-Type-Options

---

## 9. Implementation Status

### 9.1 Implemented Features
✅ **Complete:**
- Authentication system (file 11)
- Dashboard framework (file 12)
- Case management (file 13)
- Basic forensics upload (file 15)
- AI assistant framework (file 16)

### 9.2 Partially Implemented
🚧 **In Progress:**
- Adjudication queue (file 14) - UI complete, workflow refinement needed
- CSV ingestion - Basic upload works, advanced mapping needed
- Notification service - In-app notifications only

### 9.3 Planned Features
📋 **Roadmap:**
- Multi-bank statement ingestion with entity resolution
- Reconciliation interface (split-view comparison)
- API Gateway deployment
- Enhanced notification channels (Email, Webhooks)
- Advanced cross-bank analysis

---

## 10. Document History

### Consolidation Process
This document consolidates:
1. **03_proposed_additions.md:** Original architecture proposals
   - Sections integrated: Adjudication, CSV Ingestion, Notifications, API Gateway
2. **04_ui_design_proposals.md:** Original UI/UX proposals
   - Sections integrated: Login, Dashboard options, Case Management, Adjudication UI, Forensics UI, CSV Ingestion UI, Reconciliation

### Conflict Resolution
Where conflicts existed between proposals and orchestration files:
- **Detailed specifications** from orchestration files (11-16) took precedence
- **Additional features** from proposals were added as enhancements
- **UI design options** from proposals retained as alternatives
- **Architecture decisions** reconciled to maintain consistency

### Related Documents
- `11_auth_page_design_orchestration.md` - Authentication details
- `12_dashboard_page_design_orchestration.md` - Dashboard details
- `13_case_management_design_orchestration.md` - Case management details
- `14_adjudication_queue_design_orchestration.md` - Adjudication details
- `15_forensics_ingestion_design_orchestration.md` - Forensics details
- `16_frenly_ai_design_orchestration.md` - AI assistant details

---

## Conclusion

This consolidated specification provides a unified reference for the Simple378 architecture, combining the vision from early proposals with the detailed specifications from orchestration documents. All stakeholders should refer to this document for current architectural decisions, with detailed implementation guidance available in the referenced orchestration files (11-16).

For questions or updates to this specification, please follow the change management process outlined in CONTRIBUTING.md.
