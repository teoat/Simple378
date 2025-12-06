# Heuristic Analysis Enhancements: Phase 3 & 4 Implementation Plan

**Based on:** Conversation `9f595f71-6c76-467e-9edb-526d7b9a3fee` (Propose Heuristic Analysis Enhancements)
**Focus:** Breakdown of individuallly independent tasks for Phase 3 (Enterprise/Heuristic) and Phase 4 (AI/Predictive).
**Target:** Enhancing `CASE_DETAIL.md`, `Overview Tab`, and `Graph Analysis Tab`.

---

## 📅 Phase 3: Enterprise Heuristics (Deterministic Analysis)

**Goal:** Implement rule-based logic, deterministic forecasting, and scenario simulation to provide explainable risk assessments.

### 🟡 Tasks
| Task ID | Component | Task Name | Description | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| **3-A** | Backend | **Actionable Heuristic Rule Engine** | Develop a dedicated `RuleEngineService` (Python) that evaluates a list of `HeuristicRule` objects against `Transaction` data. <br>Use Python's `ast` or `simpleeval` for safe expression evaluation. | None |
| **3-B** | Config | **Heuristic Rule Set Definitions** | Define the initial JSON schema for rules and instantiate the "Top 10" Standard Fraud Rules: <br>1. Structuring (smurfing) <br>2. Velocity Spike (>10 tx/hr) <br>3. Round Amount Anomalies <br>4. High-Risk Country <br>5. New Account Burst, etc. | 3-A |
| **3-C** | Backend | **Risk Score Forecasting Service** | Implement `RiskForecastService` using simple deterministic models (Linear Regression / Moving Average) on `RiskScoreHistory`. <br>Endpoint: `GET /api/v1/analysis/forecast/{subject_id}`. | Database (History) |
| **3-D** | Frontend | **Trend Analysis Dashboard Widget** | Add a "Risk Trend" widget to the Case Detail > Overview Tab using `Recharts`. Visualize historical score vs. forecasted score (dashed line). | 3-C |
| **3-E** | Frontend | **Scenario Simulation (What-If) UI** | Add a "Simulation Mode" toggle to the Graph Visualization. <br>Allows users to manually set a node as "Fraud" and visually propagate "Tainted" status to neighbors based on transaction flow (Client-side logic). | basic Graph Viz |
| **3-F** | Backend | **Compliance/Heuristic Report** | specific Jinja2 template for `HeuristicAnalysisReport`. Lists all triggered rules, forecasted risk, and simulation results. | 3-A, 3-C |

---

## 🔮 Phase 4: AI & Graph Predictive (Probabilistic Analysis)

**Goal:** Implement advanced probabilistic models, graph theory algorithms, and NLP for deep insights.

### 🟣 Tasks
| Task ID | Component | Task Name | Description | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| **4-A** | Backend | **Graph Analytics Service** | Create a `GraphAnalyticsService` using `networkx` (or `memgraph`/`neo4j` driver). <br>Purpose: Run computationally intensive graph algorithms off the main thread. | None |
| **4-B** | Backend | **Community Detection Endpoint** | Implement Louvain or Label Propagation algorithm in 4-A. <br>Endpoint: `GET /api/v1/analysis/communities`. Returns `cluster_id` for nodes to color-code "Fraud Rings". | 4-A |
| **4-C** | Backend | **Efficiency/Centrality Metrics** | Implement PageRank and Betweenness Centrality in 4-A. <br>Endpoint: `GET /api/v1/analysis/centrality`. Use to size nodes (User 'Kingpins' appear larger). | 4-A |
| **4-D** | Frontend | **Shortest Path Visualizer** | Tool in Graph View: Select "Source" and "Target" nodes. <br>Frontend calls `GET /api/v1/analysis/shortest-path` and highlights the specific edges/nodes in the graph. | 4-A |
| **4-E** | AI Service | **Entity Disambiguation Agent** | Background job (Celery/Arq) that scans `Person` entities. <br>Uses 'Levenshtein Distance' + 'Address/DOB Matching' to suggest merging "J. Doe" and "John Doe". | None |
| **4-F** | AI Service | **Automated SAR Narrative API** | Prompt Engineering task (Claude/GPT). <br>Input: Triggered Rules (Phase 3) + Graph Metrics (Phase 4). <br>Output: 2-paragraph standard banking "Suspicious Activity Report" narrative. | 3-B, 4-C |

---

## 🔗 Integration Points

- **Case Detail > Overview:** Will host the **Risk Forecast** (3-D) and **SAR Narrative** (4-F).
- **Case Detail > Graph:** Will host **Community Detection** (4-B), **Centrality Sizing** (4-C), **Shortest Path** (4-D), and **Simulation Mode** (3-E).
- **Case Detail > Alerts:** Will host the results of the **Heuristic Rule Engine** (3-A).
