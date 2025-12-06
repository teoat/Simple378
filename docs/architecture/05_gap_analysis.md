# Gap Analysis & Improvement Plan

## 1. Observability & Monitoring
**Gap:** While "Audit Logging" is defined for GDPR, standard application observability is missing.
**Risk:** Difficult to debug production issues or monitor system health.
**Recommendation:**
- **Structured Logging:** Implement JSON logging (structlog/loguru) for all backend services.
- **Metrics:** Expose Prometheus metrics (`/metrics`) from FastAPI and Celery.
- **Tracing:** Integrate OpenTelemetry/Jaeger to trace requests across Backend -> DB -> AI Services.

## 2. Testing Strategy
**Gap:** "Unit tests" are mentioned, but a comprehensive testing pyramid is undefined.
**Risk:** Integration bugs and regressions in complex flows (e.g., AI orchestration).
**Recommendation:**
- **Integration Tests:** Use `Testcontainers` (or Docker Compose) to test API endpoints against real DB/Redis.
- **E2E Tests:** Implement Playwright for critical frontend flows (Login -> Dashboard -> Case Review).
- **Performance:** Define specific SLAs (e.g., "Graph rendering < 200ms for 10k nodes").

## 3. Security Details
**Gap:** RBAC is mentioned but roles are not defined. API security is high-level.
**Risk:** Unauthorized access or privilege escalation.
**Recommendation:**
- **RBAC Model:** Define specific roles: `Admin`, `Analyst`, `Auditor`, `Viewer`.
- **API Security:** Implement specific scopes for OAuth2 tokens (e.g., `cases:read`, `cases:write`).

## 4. Error Handling
**Gap:** No global strategy for consistent error reporting.
**Risk:** Inconsistent API responses and poor frontend UX during failures.
**Recommendation:**
- **Backend:** Create a global exception handler to return standard `ProblemDetails` (RFC 7807) JSON.
- **Frontend:** Implement Error Boundaries and a global Toast notification system for API errors.

## 5. Data Governance & Backups
**Gap:** Backup mechanisms and disaster recovery are vague.
**Risk:** Data loss in case of corruption or attack.
**Recommendation:**
- **Backups:** Automated `pg_dump` to encrypted S3 bucket (daily).
- **Retention:** Implement automated "TTL" for non-critical logs in Redis/Postgres.

## 6. Technical Debt & Scalability Risks
**Gap:** Several MVP implementation choices pose immediate scalability or correctness risks.
- **Blocking Event Loop:** `IngestionService.process_csv` performs CPU-bound CSV parsing inside an `async def` endpoint, which will block the FastAPI event loop.
- **Currency Precision:** Using `Float` for financial amounts (`Transaction` model) leads to floating-point errors.
- **Memory Usage:**
    - `IngestionService` loads entire files into RAM.
    - `GraphAnalyzer` fetches ALL transactions for a subject, risking OOM for high-volume entities.
- **Security:**
    - CORS is set to `["*"]`.
    - No file size limits on uploads.

**Recommendation:**
- **Refactor Ingestion:** Stream file processing and run parsing in a `ProcessPoolExecutor` or Celery task.
- **Use Decimals:** Migrate `amount` columns to `Numeric/Decimal`.
- **Pagination:** Implement pagination for Graph API transaction fetching.