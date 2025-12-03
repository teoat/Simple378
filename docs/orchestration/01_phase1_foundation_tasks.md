# Phase 1: Foundation - Tasks & Todos

**Goal:** Solidify the infrastructure and ensure the project is ready for core feature development.

## 1. Infrastructure Verification
- [ ] **Docker Compose**: Verify all services start without errors.
    - [ ] Backend (FastAPI)
    - [ ] Frontend (Vite)
    - [ ] Postgres (Auth/Connection)
    - [ ] Redis (Connection)
    - [ ] Qdrant (Connection)
- [ ] **Environment Variables**: Ensure `.env` is correctly loaded by all services.

## 2. Backend Foundation
- [ ] **Database Migrations**:
    - [ ] Initialize Alembic: `alembic init alembic`
    - [ ] Configure `alembic.ini` to use `DATABASE_URL` from env.
    - [ ] Generate initial migration for `users`, `subjects`, `consents`, `audit_logs`.
    - [ ] Apply migration: `alembic upgrade head`.
- [ ] **Authentication Skeleton**:
    - [ ] Implement `core/security.py` (Password hashing, JWT token generation).
    - [ ] Create `/auth/login` endpoint.
    - [ ] Create `get_current_user` dependency.

## 3. Frontend Foundation
- [ ] **Project Cleanup**: Remove default Vite boilerplate.
- [ ] **Design System Setup**:
    - [ ] Install TailwindCSS (if not already fully configured).
    - [ ] Configure `tailwind.config.js` with project colors (Premium/Dark mode theme).
- [ ] **Routing**:
    - [ ] Install `react-router-dom`.
    - [ ] Create basic routes: `/login`, `/dashboard`, `/cases`.
- [ ] **API Client**:
    - [ ] Set up `axios` or `fetch` wrapper with base URL from env.

## 4. Foundation Hardening (Gap Analysis)
- [ ] **Observability**:
    - [ ] Implement structured logging (JSON format).
    - [ ] Set up Prometheus metrics endpoint.
    - [ ] Configure Jaeger tracing.
- [ ] **Testing Strategy**:
    - [ ] Set up Testcontainers for integration tests.
    - [ ] Create initial integration test suite.
- [ ] **Security**:
    - [ ] Define RBAC roles (Admin, Analyst, Auditor, Viewer).
    - [ ] Implement API scopes.
- [ ] **Error Handling**:
    - [ ] Implement Global Exception Handler (RFC 7807).
- [ ] **Data Governance**:
    - [ ] Implement automated backup strategy (pg_dump).

## 5. CI/CD Setup (Basic)
- [ ] **Pre-commit Hooks**:
    - [ ] Python: `black`, `isort`, `flake8`.
    - [ ] JS/TS: `eslint`, `prettier`.
