# Execution Strategy & Build Philosophy

## 1. Core Philosophy
- **Iterative & Incremental:** We build in vertical slices. A feature is not done until it's backend-complete, frontend-connected, and tested.
- **Privacy-First:** Every data model change must be checked against GDPR requirements (consent, retention, minimization).
- **Offline-Ready:** Always consider "how does this work without internet?" during design and implementation.

## 2. Definition of Done (DoD)
For a task to be considered complete:
1.  **Code:** Implemented and pushed to the feature branch.
2.  **Tests:** Unit tests passed (Backend: Pytest, Frontend: Vitest/Jest).
3.  **Docs:** API documentation updated (if applicable).
4.  **Review:** Self-reviewed against the architectural guidelines.
5.  **GDPR:** No unencrypted PII exposed in logs or DB.

## 3. Branching Strategy
- **`main`**: Production-ready code.
- **`dev`**: Integration branch.
- **`feature/*`**: Individual tasks (e.g., `feature/mens-rea-engine`).

## 4. Development Workflow
1.  **Pick a Task:** Select from the Phase task list.
2.  **Create Branch:** `git checkout -b feature/task-name`
3.  **Implement:** Write code + tests.
4.  **Verify:** Run `docker-compose up` and test manually.
5.  **Merge:** PR to `dev` (or direct merge for solo dev).

## 5. Directory Structure for Docs
- `docs/architecture/`: High-level design.
- `docs/orchestration/`: Detailed task lists (this directory).
- `docs/api/`: API specs (OpenAPI).
