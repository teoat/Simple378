# Simple378

This is a simple project that contains a frontend and a backend.

## Frontend

The frontend is a React application that uses Vite as a build tool. It is written in TypeScript and uses a number of libraries, including:

*   React Router
*   TanStack Query
*   Tailwind CSS
*   ESLint
*   Playwright

### Frontend Code Analysis

A detailed analysis of the frontend code can be found in the [lint_analysis.md](frontend/lint_analysis.md) file. The analysis includes a summary of the issues found, a breakdown of the issues by file, and a set of recommendations for fixing them.

The linter found a total of **227 problems**, including **214 errors** and **13 warnings**. The issues have been prioritized based on their severity and potential impact on the application. The following is a summary of the scorecard:

| Page | Score |
| --- | --- |
| /Users/Arief/Desktop/Simple378/frontend/src/components/visualization/FraudDetectionPanel.tsx | 30 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/cases/EntityGraph.tsx | 36 |
| /Users/Arief/Desktop/Simple378/frontend/src/lib/reportGenerator.ts | 34 |
| /Users/Arief/Desktop/Simple378/frontend/src/hooks/performance.tsx | 18 |
| /Users/Arief/Desktop/Simple378/frontend/src/lib/api.test.ts | 18 |
| /Users/Arief/Desktop/Simple378/frontend/src/test/test-utils.tsx | 15 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/collaboration/SharedAIInsights.tsx | 12 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/settings/AuditLogViewer.tsx | 12 |
| /Users/Arief/Desktop/Simple378/frontend/src/pages/Visualization.tsx | 12 |
| /Users/Arief/Desktop/Simple378/frontend/src/types/react-force-graph.d.ts | 12 |
| /Users/Arief/Desktop/Simple378/frontend/src/lib/exportUtils.ts | 11 |
| /Users/Arief/Desktop/Simple378/frontend/src/hooks/useOfflineSync.tsx | 10 |
| /Users/Arief/Desktop/Simple378/frontend/src/hooks/useWebSocket.tsx | 10 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/analytics/AdvancedAnalyticsDashboard.tsx | 10 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/reports/ScheduledReports.tsx | 10 |
| /Users/Arief/Desktop/Simple378/frontend/src/pages/Ingestion.tsx | 7 |
| /Users/Arief/Desktop/Simple378/frontend/src/pages/Settings.tsx | 7 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/ui/ExportComponents.tsx | 7 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/visualization/ForceDirectedGraph.tsx | 6 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/visualization/TimelineZoom.tsx | 6 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/cases/FinancialFlowAnalysis.tsx | 6 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/collaboration/MentionsNotifications.tsx | 6 |
| /Users/Arief/Desktop/Simple378/frontend/src/context/AIContext.tsx | 6 |
| /Users/Arief/Desktop/Simple378/frontend/src/lib/evidenceApi.ts | 6 |
| /Users/Arief/Desktop/Simple378/frontend/src/lib/utils.test.ts | 6 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/ai/AIAssistant.tsx | 5 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/forensics/ProcessingPipeline.tsx | 5 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/graphs/EntityGraph.tsx | 5 |
| /Users/Arief/Desktop/Simple378/frontend/src/__tests__/visualization-helpers.test.tsx | 4 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/ai/NaturalLanguageSearch.tsx | 4 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/collaboration/ActivityFeed.tsx | 4 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/compliance/AuditTrail.tsx | 4 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/reconciliation/TransactionColumns.tsx | 4 |
| /Users/Arief/Desktop/Simple378/frontend/src/hooks/useCamera.tsx | 4 |
| /Users/Arief/Desktop/Simple378/frontend/src/hooks/usePWA.ts | 4 |
| /Users/Arief/Desktop/Simple378/frontend/src/App.test.tsx | 4 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/visualization/ActivityHeatmap.tsx | 3 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/visualization/SankeyFlow.tsx | 3 |
| /Users/Arief/Desktop/Simple378/frontend/tests/file-upload.spec.ts | 3 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/ai/AutomatedCaseSummaries.tsx | 2 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/ai/RelationshipExtraction.tsx | 2 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/cases/EvidenceCorrelationViewer.tsx | 2 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/cases/EvidenceLibrary.tsx | 2 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/forensics/FileUploader.tsx | 2 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/predictive/PredictiveDashboard.tsx | 2 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/predictive/ScenarioSimulation.tsx | 2 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/pwa/OfflineSyncStatus.tsx | 2 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/settings/SecuritySettings.tsx | 2 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/visualization/VisualizationNetwork.tsx | 2 |
| /Users/Arief/Desktop/Simple378/frontend/src/lib/api.ts | 2 |
| /Users/Arief/Desktop/Simple378/frontend/src/test/setup.ts | 2 |
| /Users/Arief/Desktop/Simple378/frontend/src/__tests__/DecisionPanel.test.tsx | 2 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/cases/Timeline.tsx | 2 |
| /Users/Arief/Desktop/Simple378/frontend/tests/e2e/case-management.spec.ts | 2 |
| /Users/Arief/Desktop/Simple378/frontend/src/__tests__/AlertList.test.tsx | 1 |
| /Users/Arief/Desktop/Simple378/frontend/src/__tests__/UploadZone.test.tsx | 1 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/ai/AIAssistant.test.tsx | 1 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/ui/ErrorBoundary.test.tsx | 1 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/visualization/AIInsightPanel.tsx | 1 |
| /Users/Arief/Desktop/Simple378/frontend/src/pages/CaseList.test.tsx | 1 |
| /Users/Arief/Desktop/Simple378/frontend/src/pages/__tests__/CaseDetail.test.tsx | 1 |
| /Users/Arief/Desktop/Simple378/frontend/src/vite-env.d.ts | 1 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/cases/VirtualCaseList.tsx | 0 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/reconciliation/VirtualTransactionList.tsx | 0 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/ui/Input.tsx | 0 |
| /Users/Arief/Desktop/Simple378/frontend/src/components/ui/VirtualTable.tsx | 0 |
| /Users/Arief/Desktop/Simple378/frontend/src/context/AuthContext.tsx | 0 |
| /Users/Arief/Desktop/Simple378/frontend/src/hooks/useAuth.test.ts | 0 |
| /Users/Arief/Desktop/Simple378/frontend/src/lib/eventSourcing.test.ts | 0 |

The recommendations for fixing the issues can be found in the [lint_analysis.md](frontend/lint_analysis.md) file.

## Docker Deployment

To run the application using Docker Compose, follow these steps:

1.  **Build the Docker images:**
    ```bash
    docker-compose build
    ```
2.  **Start the services:**
    ```bash
    docker-compose up
    ```
3.  **Access the application:**
    The frontend will be available at `http://localhost`.

**Note:** Make sure you have Docker and Docker Compose installed on your system.