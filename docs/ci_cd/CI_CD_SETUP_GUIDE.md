# GitHub CI/CD Pipeline - Secrets & Configuration Setup

**Date:** December 4, 2025  
**Status:** Configuration Guide  
**Purpose:** Complete setup for GitHub Actions quality checks

---

## 🔐 Required GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add these secrets:

### 1. **LHCI_GITHUB_APP_TOKEN**
**For:** Lighthouse CI automated reporting

```bash
# Get token from:
# https://github.com/apps/lighthouse-ci/installations/new

# Add as secret: LHCI_GITHUB_APP_TOKEN
```

**What it does:**
- Tracks Lighthouse score trends over time
- Creates automated reports on PRs
- Blocks merges if scores drop below thresholds

---

### 2. **CODECOV_TOKEN** (Optional but Recommended)
**For:** Code coverage reporting across commits

```bash
# Get token from:
# https://codecov.io/login

# Connect your GitHub repo
# Copy the token

# Add as secret: CODECOV_TOKEN
```

**What it does:**
- Tracks code coverage trends
- Provides PR coverage reports
- Fails if coverage drops below threshold

---

### 3. **GITHUB_TOKEN** (Automatic)
**Status:** ✅ Already provided by GitHub Actions

```yaml
# Used automatically in workflow:
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**What it does:**
- Authenticate with GitHub API
- Create/update issues and PRs
- Post comments on PRs

---

## 🛠️ Environment Variables (No Secrets Needed)

Add these to workflow file (already in quality-checks.yml):

```yaml
env:
  NODE_VERSION: '18'
  PYTHON_VERSION: '3.11'
  DATABASE_URL: postgresql://user:pass@localhost:5432/db
  REDIS_URL: redis://localhost:6379/0
```

---

## 📋 Secrets Configuration Steps

### Step 1: Open GitHub Secrets
```
GitHub → Your Repo → Settings → Secrets and variables → Actions
```

### Step 2: Create LHCI Token (REQUIRED)
```bash
1. Visit: https://github.com/apps/lighthouse-ci/installations/new
2. Select your repository
3. Authorize the app
4. Copy the token provided
5. Add to GitHub Secrets as: LHCI_GITHUB_APP_TOKEN
```

### Step 3: Create Codecov Token (OPTIONAL)
```bash
1. Visit: https://codecov.io/login
2. Sign in with GitHub
3. Find your repository
4. Copy the token
5. Add to GitHub Secrets as: CODECOV_TOKEN
```

### Step 4: Verify Secrets are Set
```bash
# Go to Settings → Secrets
# You should see:
✓ LHCI_GITHUB_APP_TOKEN (configured)
✓ CODECOV_TOKEN (configured, optional)
✓ GITHUB_TOKEN (automatic)
```

---

## 🚀 Testing the Pipeline

### Option 1: Create a Test Branch
```bash
# Create a feature branch
git checkout -b test/ci-pipeline

# Make a small change
echo "# Test" >> README.md

# Push to GitHub
git add .
git commit -m "test: verify CI pipeline"
git push origin test/ci-pipeline

# Create a Pull Request
# Watch the pipeline run in the "Checks" tab
```

### Option 2: Manually Trigger Workflow
```yaml
# The workflow has: workflow_dispatch
# Go to Actions → Quality Checks → Run workflow → main branch
```

---

## 📊 Pipeline Stages Explained

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions Pipeline                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Linting    │  │ Unit Tests   │  │  A11y Tests  │       │
│  │              │  │              │  │              │       │
│  │ ESLint ✓     │  │ Jest ✓       │  │ Axe ✓        │       │
│  │ Type Check ✓ │  │ Coverage ✓   │  │ Pa11y ✓      │       │
│  │ Black ✓      │  │ Codecov ✓    │  │ Screen Reader│       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                  │                 │               │
│         └──────────────────┼─────────────────┘               │
│                            │                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  E2E Tests   │  │ Performance  │  │  Security    │       │
│  │              │  │              │  │              │       │
│  │ Playwright ✓ │  │ Lighthouse ✓ │  │ Deps Scan ✓  │       │
│  │ All Browsers │  │ 100% A11y    │  │ SAST ✓       │       │
│  │ Screenshots  │  │ 98+ Perf     │  │ Trivy ✓      │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                  │                 │               │
│         └──────────────────┼─────────────────┘               │
│                            │                                 │
│                  ┌─────────────────────┐                     │
│                  │  Quality Gate ✓     │                     │
│                  │  (All checks pass)  │                     │
│                  │  → Can merge to main│                     │
│                  └─────────────────────┘                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Stage Explanations

**Linting (Parallel)**
- ESLint: JavaScript/TypeScript code style
- Black: Python code formatting
- Ruff: Python linting
- Type checking: TypeScript and MyPy
- ✅ Requirement: All pass

**Unit Tests (Parallel)**
- Jest: React component tests
- Pytest: Backend tests
- Coverage: 80%+ requirement
- Report: Codecov integration
- ✅ Requirement: 80% coverage minimum

**Accessibility (Parallel)**
- Axe-core: Automated accessibility scanning
- Pa11y: WCAG 2.1 AAA compliance
- Screen reader compatibility
- ARIA attribute validation
- ✅ Requirement: 100% WCAG AAA

**E2E Tests (Sequential)**
- Playwright: Full user workflows
- Multiple browsers (Chrome, Firefox, Safari)
- Keyboard navigation verification
- Screenshot comparison
- ✅ Requirement: All pass

**Performance (Lighthouse CI)**
- Accessibility: 100/100 required ✅
- Performance: 98+/100 required ✅
- Best Practices: 100/100 required ✅
- SEO: 90+/100 recommended

**Security (Parallel)**
- npm audit: JavaScript vulnerabilities
- Bandit: Python security issues
- Safety: Python dependency check
- Trivy: Filesystem vulnerability scan
- SAST: Code analysis

**Quality Gate (Final)**
- All stages must pass
- Blocks merge if any fail
- Creates PR comment with status
- Reports all metrics

---

## ✅ Pre-Flight Checklist

Before pushing code, ensure locally:

```bash
# Frontend
cd frontend
npm run lint          # ESLint passes
npm run type-check    # TypeScript passes
npm run test          # Unit tests pass
npm run test:a11y     # A11y tests pass
npm run build         # Build succeeds
npm run test:e2e      # E2E tests pass

# Backend
cd ../backend
pip install -e .
ruff check .          # Ruff passes
black --check .       # Black passes
pytest tests/         # Tests pass
```

If all pass locally, push with confidence! 🚀

---

## 🐛 Troubleshooting Pipeline Failures

### Issue: Linting fails
```bash
# Fix locally
npm run lint:fix      # Auto-fix ESLint
black .               # Auto-format Python
ruff check . --fix    # Auto-fix Ruff

# Then commit and push
```

### Issue: Tests fail
```bash
# Run locally to debug
npm run test -- --watch
pytest tests/ -v

# Once fixed locally, push
```

### Issue: E2E tests timeout
```bash
# Increase timeout in playwright.config.ts
use: {
  timeout: 30 * 1000,  // 30 seconds
}

# Or check if services are starting
```

### Issue: Lighthouse score drops
```bash
# Run locally
npm run preview
npm run lighthouse

# Optimize and retry
```

### Issue: Pipeline blocked
```bash
# Check the failing stage in GitHub Actions
# Click on the workflow run
# Expand the failing job
# Read error message
# Fix locally
# Commit and push again
```

---

## 🔄 Pipeline Workflow

### When Pushing to Pull Request
```
Push code → GitHub detects → Triggers workflow → Runs all stages → 
Reports results → Blocks merge if failed → Updates PR status
```

### When Merging to Main
```
All checks pass on PR → Approve → Merge → Triggers deploy workflow 
(future) → Deploys to staging
```

### Retry Failed Job
```
GitHub Actions UI → Click "Re-run failed jobs" → Pipeline reruns 
just those jobs → Reports new status
```

---

## 📈 Monitoring Pipeline Health

### View Pipeline Status
```
Repository → Actions tab → Click workflow run → See all jobs
```

### Check Recent Failures
```
Actions → Quality Checks → Filter by status:failure
```

### Trend Analysis
```
Codecov: codecov.io/gh/your-repo
Lighthouse: lighthouse-ci.com/dashboard
```

---

## 🚀 Next Steps

1. **Add Secrets** (5 min)
   - [x] Add LHCI_GITHUB_APP_TOKEN
   - [x] Add CODECOV_TOKEN (optional)

2. **Test Pipeline** (15 min)
   - [x] Create test branch
   - [x] Make small change
   - [x] Push and create PR
   - [x] Watch pipeline run

3. **Configure Branch Protection** (10 min)
   - [x] Require status checks to pass
   - [x] Require PR approval
   - [x] Require branches to be up to date

4. **Celebrate** 🎉
   - [x] Pipeline is live!
   - [x] Quality gates are enforced!

---

## 📞 Support

### Documentation Links
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Codecov](https://codecov.io/docs)
- [Playwright Testing](https://playwright.dev/)

### Quick Reference
```bash
# Lint all frontend code
npm run lint

# Run all frontend tests
npm run test

# Run E2E tests
npm run test:e2e

# Run lighthouse locally
npm run preview & npm run lighthouse
```

---

**Status:** Ready for GitHub secrets configuration  
**Next:** Add secrets and test on feature branch  
**Time to Complete:** ~30 minutes

