# Phase 4: Visualizations & UX - Tasks & Todos

**Goal:** Create a premium, interactive user interface.

## 1. Login & Authentication

- [ ] **Design Implementation**:
  - [ ] Split Screen Layout (Data Viz Animation + Login Form).
  - [ ] Glassmorphism Card effect.
  - [ ] Biometric Login button (WebAuthn).

## 2. Dashboard & Layout

- [ ] **App Shell**:
  - [ ] Implement responsive sidebar navigation.
  - [ ] **Notification Center**:
    - [ ] Implement Bell Icon with badge.
    - [ ] Create Dropdown for recent notifications.
    - [ ] Implement Toast message system.
- [ ] **Dashboard Views**:
  - [ ] Implement "Operational" view (Tasks, Queue).
  - [ ] Implement "Strategic" view (Trends, Heatmap).

## 3. Case Management UI

- [ ] **Case List**:
  - [ ] Data Grid with sort/filter and Risk Score heat bars.
  - [ ] Quick Preview hover card.
- [ ] **Case Detail**:
  - [ ] Header with Subject Profile.
  - [ ] Tabs: Overview, Graph, Timeline, Files.

## 4. Reconciliation UI (New)

- [ ] **Split View Interface**:
  - [ ] Left Pane: Expense Table (Source).
  - [ ] Right Pane: Reconciliation Table (Internal).
- [ ] **Interactions**:
  - [ ] Visual Diff highlighting (Match/Partial/Orphan).
  - [ ] Drag & Drop matching.
  - [ ] Auto-Reconcile action.

## 5. Forensics Upload UI

- [ ] **Drop Zone**: Full-screen overlay.
- [ ] **Processing State**: Animated progress bars.
- [ ] **Results View**: Split view (Original vs Extracted).

## 6. Settings & Admin UI

- [ ] **Tabs**: General, Users, Security, Logs.
- [ ] **Audit Log**: Searchable table with JSON diff.
- [ ] **Theme Toggle**: Cyber Dark / Corporate Light.

## 7. Advanced Visualizations

- [ ] **Entity Graph**:
  - [ ] **Library**: Implement `React Flow` (Decision: Best for Case View).
  - [ ] **Layout**: Implement `elkjs` or `dagre` for automatic layout.
  - [ ] **Interactivity**: Click to expand (Progressive Loading), Drag nodes.
  - [ ] **Performance**: Use Web Workers for layout calculations.
- [ ] **Financial Flow**:
  - [ ] Implement Sankey diagram for money trails.
- [ ] **Timeline**:
  - [ ] Implement interactive timeline for event sequencing.

## 7. AI Assistant UI
- [ ] **Chat Interface**:
    - [ ] Build a floating or side-panel chat widget.
    - [ ] Implement streaming responses (typing effect).
    - [ ] Render citations/evidence links in chat bubbles.

## 8. Offline Sync UI
- [ ] **Sync Status**:
    - [ ] Add indicator (Online/Offline/Syncing).
- [ ] **Conflict Resolution**:
    - [ ] Create UI to show conflicting data versions and allow user selection.
