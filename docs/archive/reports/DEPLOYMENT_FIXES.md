# Deployment Fixes & E2E Review Log

## Deployment Issues & Resolutions

### 1. Backend Build Failure

**Issue**: The backend build failed because `poetry.lock` was out of sync with `pyproject.toml`, and the `poetry install` command failed.
**Fix**:

- Removed `backend/poetry.lock` to force dependency resolution.
- Modified `docker-compose.yml` to mount `/app/.venv` as an anonymous volume. This prevents the host's empty (or missing) `.venv` directory from overwriting the container's pre-built virtual environment.
- Updated `docker-compose.yml` to use direct `alembic` and `uvicorn` commands instead of `poetry run`, as `poetry` was not available in the runtime path.

### 2. Frontend Build Slowness

**Issue**: The frontend build context transfer was extremely slow (hundreds of seconds) due to including `node_modules`.
**Fix**: Created `frontend/.dockerignore` to exclude `node_modules`, `dist`, and other non-essential files.

### 3. Frontend Connectivity (Nginx)

**Issue**: The frontend container (Nginx) failed to start because it couldn't resolve the `backend` upstream hostname at startup, and the port mapping was incorrect (mapped 5173:5173, but Nginx listens on 8080).
**Fix**:

- Updated `docker-compose.yml` to map port `5173:8080`.
- Added `restart: always` to the frontend service to ensure Nginx retries connection to the backend if it fails initially.

### 4. MCP Server Build

**Issue**: Missing `dotenv` dependency.
**Fix**: Added `dotenv` to `mcp-server/package.json`.

## E2E Review Summary

### Status: ✅ Success

The application was successfully deployed locally using Docker Compose.

### Verification Steps

1. **Navigation**: Successfully navigated to the Dashboard.
2. **Authentication**: Verified access to protected routes (Dashboard, Case List, Adjudication, Forensics, Settings).
3. **UI Elements**: Confirmed presence of navigation elements ("Cases", "Adjudication Queue", "Forensics", "Settings"), indicating the application shell is loaded and functional.

### Recommendations

- Ensure `frontend/.dockerignore` is committed to the repository.
- The `docker-compose.yml` changes (port mapping, volume mounts) should be preserved for local development.

### 5. Frontend Port Standardization & API URL

**Issue**:
- Frontend host port was 5173, inconsistent with production (8080).
- `VITE_API_URL` was set to `localhost`, which is not robust for inter-container communication.

**Fix**:

- Updated `docker-compose.yml` to map port `8080:8080`.
- Updated `docker-compose.yml` to set `VITE_API_URL=http://backend:8000`.
