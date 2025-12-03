# Phase 1: Foundation - Technical Specification

## Goals
- Initialize the project repository and directory structure.
- Configure the local development environment using Docker Compose.
- Establish the database schema with GDPR compliance baked in.
- Create the basic backend (FastAPI) and frontend (React) skeletons.

## 1. Project Structure
We will use a monorepo approach.

```text
/
├── backend/                # FastAPI Application
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/         # Route handlers
│   │   ├── core/           # Config, Security, Events
│   │   ├── db/             # Models, Migrations (Alembic)
│   │   ├── schemas/        # Pydantic models
│   │   └── services/       # Business logic
│   ├── tests/
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities (API client, etc.)
│   │   ├── App.tsx         # Main App component
│   │   └── main.tsx        # Entry point
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── .env.example
```

## 2. Infrastructure (Docker Compose)
The `docker-compose.yml` will define the following services:
- **`backend`**: Python 3.12, FastAPI.
- **`frontend`**: Node 20, Vite dev server.
- **`db`**: PostgreSQL 16. Alpine based.
- **`vector_db`**: Qdrant.
- **`cache`**: Redis 7.
- **`observability`**: Prometheus, Jaeger.

## 3. Observability & Security
### Observability
- **Logging**: Structured JSON logging.
- **Metrics**: Prometheus endpoint for system metrics.
- **Tracing**: Jaeger for distributed tracing.

### Security
- **RBAC**: Role-Based Access Control (Admin, Analyst, Auditor, Viewer).
- **API Scopes**: Granular permissions for API access.

### Testing Strategy
- **Integration Tests**: Testcontainers for isolated environment testing.
- **Unit Tests**: Pytest (Backend), Vitest (Frontend).

## 3. Database Schema (GDPR Focus)

### Core Tables
1.  **`users`**: System operators/analysts.
2.  **`subjects`**: The individuals being investigated.
    - `id`: UUID
    - `encrypted_pii`: JSONB (Name, ID numbers) - Encrypted at application level.
    - `created_at`: Timestamp
    - `retention_policy_id`: FK

3.  **`consents`**: Tracking legal basis for data processing.
    - `subject_id`: FK
    - `consent_type`: Enum (Explicit, LegitimateInterest, LegalObligation)
    - `granted_at`: Timestamp
    - `expires_at`: Timestamp

4.  **`audit_logs`**: Immutable record of access.
    - `actor_id`: FK (User)
    - `action`: Enum (View, Edit, Delete, Export)
    - `resource_id`: UUID
    - `timestamp`: Timestamp

## 4. Backend Implementation Tasks
1.  Initialize `poetry` project.
2.  Install dependencies: `fastapi`, `uvicorn`, `sqlalchemy`, `asyncpg`, `pydantic-settings`, `alembic`.
3.  Configure `Settings` class using `pydantic-settings` to read from `.env`.
4.  Set up Async SQLAlchemy engine.
5.  Create initial Alembic migration for the tables above.

## 5. Frontend Implementation Tasks
1.  Initialize Vite project (React + TypeScript).
2.  Install `tailwindcss`, `postcss`, `autoprefixer`.
3.  Configure `shadcn/ui` (optional but recommended for speed) or custom design system.
4.  Set up `React Query` provider.
5.  Create a basic layout with a Sidebar and Header.

## 6. Next Steps (Immediate)
1.  Run the shell commands to generate the folder structure.
2.  Create the `docker-compose.yml` file.
3.  Initialize the Backend and Frontend projects.
