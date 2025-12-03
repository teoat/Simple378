# Phase 5: Polish & Deploy - Tasks & Todos

**Goal:** Production readiness, legal compliance, and deployment.

## 1. Legal Reporting & Prosecution Artifacts

- [ ] **Evidence Package**:
  - [ ] Generate "Case Report" PDF with watermarking.
  - [ ] Include Chain-of-Custody log (SHA-256 hashes).
  - [ ] Include AI reasoning summary with disclaimers.
  - [ ] (Optional) Blockchain anchoring for evidence integrity.

## 2. Comprehensive Audit & Compliance

- [ ] **Audit Viewer**:
  - [ ] Create Admin UI to view immutable access logs.
- [ ] **GDPR Automation**:
  - [ ] Implement "Right to be Forgotten" (Cascading Delete).
  - [ ] Implement "Data Portability" (JSON/ZIP Export).
  - [ ] Implement Consent Management logic.

## 3. Scale & Optimization (Enterprise Tier)

- [ ] **Infrastructure Hardening**:
  - [ ] Implement API Gateway (Kong or Nginx).
  - [ ] Implement Event Bus (NATS or RabbitMQ) for decoupling.
  - [ ] Migrate Cache to Dragonfly (or optimized Redis).
- [ ] **Observability**:
  - [ ] Implement OpenTelemetry tracing.
  - [ ] Set up Prometheus/Grafana dashboards.

## 4. CI/CD & DevOps

- [ ] **GitHub Actions**:
  - [ ] Build and Push Docker images to registry.
  - [ ] Run automated tests on PR.
- [ ] **Staging Environment**:
  - [ ] Deploy to a staging server.
  - [ ] Seed with test data.

## 5. User Acceptance Testing (UAT)

- [ ] **Bug Bash**:
  - [ ] Internal team testing session.
- [ ] **Performance Testing**:
  - [ ] Load test API with `locust`.
  - [ ] Test graph rendering with 10k+ nodes.
