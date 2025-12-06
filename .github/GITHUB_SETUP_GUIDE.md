# GitHub Setup Guide - Phase A: CI/CD

**Repository:** teoat/378aph492  
**Date:** December 4, 2025

---

## 🔐 Step 1: Add GitHub Secrets

### Required Secrets

Navigate to: `https://github.com/teoat/378aph492/settings/secrets/actions`

Click **"New repository secret"** for each of the following:

#### 1. `DOCKERHUB_USERNAME`
- **Value:** Your Docker Hub username
- **Used by:** CD workflow for container publishing
- **Required:** Optional (only if deploying to Docker Hub)

#### 2. `DOCKERHUB_TOKEN`
- **Value:** Docker Hub access token
- **How to get:**
  1. Go to https://hub.docker.com/settings/security
  2. Click "New Access Token"
  3. Name: `Simple378-CI-CD`
  4. Permissions: Read, Write, Delete
  5. Copy the token
- **Used by:** CD workflow for container publishing
- **Required:** Optional (only if deploying to Docker Hub)

#### 3. `LHCI_GITHUB_APP_TOKEN`
- **Value:** LHCI GitHub App Token
- **Use this token:** `CP7kVQpGjW:97969647:vrZvxoNEpte4t2`
- **Used by:** Lighthouse CI for posting results
- **Required:** Recommended (for Lighthouse reports)

#### 4. `CODECOV_TOKEN` (Optional)
- **Value:** Codecov.io token for coverage reports
- **How to get:**
  1. Go to https://codecov.io/
  2. Sign in with GitHub
  3. Add repository `teoat/378aph492`
  4. Copy the token
- **Used by:** Unit test workflow for coverage tracking
- **Required:** Optional (nice to have)

#### 5. `PERCY_TOKEN` (Optional)
- **Value:** Percy.io token for visual regression
- **Use this token:** `web_4af025ac6a5d867691e69642515f7a0aa1a7a3729f9c4a0558db7b74ec9e0045`
- **Used by:** Visual regression workflow
- **Required:** Optional (future enhancement)

### Current Status
```bash
# Already configured in .agent/mcp_config.json:
✅ GITHUB_PERSONAL_ACCESS_TOKEN
✅ BRAVE_API_KEY

# Need to add to GitHub Secrets:
⚠️ DOCKERHUB_USERNAME (optional)
⚠️ DOCKERHUB_TOKEN (optional)
⚠️ LHCI_GITHUB_APP_TOKEN (recommended)
⚠️ CODECOV_TOKEN (optional)
⚠️ PERCY_TOKEN (optional)
```

---

## 🧪 Step 2: Test the Pipeline

### Option A: Manual Workflow Dispatch (Recommended for first test)

1. **Go to Actions Tab:**
   ```
   https://github.com/teoat/378aph492/actions/workflows/quality-checks.yml
   ```

2. **Click "Run workflow" dropdown**
   - Select branch: `main`
   - Click green "Run workflow" button

3. **Monitor Progress:**
   - Watch jobs execute in real-time
   - Click on each job to see logs
   - Fix any failures before proceeding

### Option B: Create Test Feature Branch

```bash
# 1. Create and checkout test branch
git checkout -b test/ci-pipeline

# 2. Make a small change to trigger workflow
echo "# CI/CD Test" >> README.md

# 3. Commit and push
git add README.md
git commit -m "test: trigger CI pipeline"
git push origin test/ci-pipeline

# 4. Go to GitHub and watch Actions tab
open https://github.com/teoat/378aph492/actions
```

### Expected Results

#### ✅ Successful Workflow Jobs:
```
✓ frontend-lint (Frontend Lint & Type Check)
✓ backend-lint (Backend Lint & Type Check)
✓ frontend-tests (Frontend Unit Tests)
✓ backend-tests (Backend Unit Tests)
✓ e2e-tests (E2E Tests - Playwright)
✓ accessibility-tests (Accessibility Tests)
✓ lighthouse (Lighthouse CI)
```

#### ❌ Common Failures and Fixes:

**1. Frontend tests fail - Dependencies missing**
```bash
cd frontend
npm ci
npm run test
# Fix any test failures locally first
```

**2. Backend tests fail - Python dependencies**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -e ".[dev]"
pytest
# Fix any test failures locally first
```

**3. Lighthouse fails - Preview server not starting**
```bash
cd frontend
npm run build
npm run preview
# Test manually first
```

**4. E2E tests fail - Playwright not installed**
```bash
cd frontend
npx playwright install --with-deps
npm run test:e2e
# Fix flaky tests
```

---

## 🛡️ Step 3: Configure Branch Protection Rules

### Navigate to Branch Settings
```
https://github.com/teoat/378aph492/settings/branches
```

### Click "Add rule" for `main` branch

#### Basic Settings
- **Branch name pattern:** `main`
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: `1`
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners (optional)

#### Status Checks
- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  
  **Select these status checks:**
  - ✅ `frontend-lint`
  - ✅ `backend-lint`
  - ✅ `frontend-tests`
  - ✅ `backend-tests`
  - ✅ `accessibility-tests`
  - ✅ `lighthouse`
  - ✅ `e2e-tests`

#### Additional Settings
- ✅ **Require conversation resolution before merging**
- ✅ **Require linear history** (optional, cleaner git history)
- ✅ **Include administrators** (enforce rules on admins too)
- ❌ **Allow force pushes** (keep disabled)
- ❌ **Allow deletions** (keep disabled)

### Click "Create" to save

---

## ✅ Step 4: Verify End-to-End Flow

### Test 1: Create a Valid Pull Request

```bash
# 1. Create feature branch
git checkout -b feature/test-protection

# 2. Make a valid change
echo "console.log('Testing CI/CD');" >> frontend/src/utils/testCI.ts

# 3. Commit and push
git add .
git commit -m "feat: test branch protection"
git push origin feature/test-protection

# 4. Create PR on GitHub
gh pr create --title "Test: Branch Protection" --body "Testing CI/CD pipeline"
```

**Expected Behavior:**
- ✅ All status checks run automatically
- ✅ PR shows "All checks have passed"
- ✅ "Merge" button is enabled (if approvals met)

### Test 2: Create a Failing Pull Request

```bash
# 1. Create another branch
git checkout -b feature/test-failure

# 2. Introduce a linting error
echo "const x = 'unused variable'" >> frontend/src/utils/bad.ts

# 3. Commit and push
git add .
git commit -m "feat: test failing checks"
git push origin feature/test-failure

# 4. Create PR
gh pr create --title "Test: Failing Checks" --body "Should fail linting"
```

**Expected Behavior:**
- ❌ Linting check fails
- ❌ PR shows "Some checks were not successful"
- ❌ "Merge" button is DISABLED
- ✅ Branch protection working correctly!

### Test 3: Fix and Re-run

```bash
# 1. Fix the error
git checkout feature/test-failure
rm frontend/src/utils/bad.ts

# 2. Commit fix
git add .
git commit -m "fix: remove linting error"
git push

# 3. Watch checks re-run automatically
```

**Expected Behavior:**
- ✅ Checks re-run automatically
- ✅ All checks pass
- ✅ "Merge" button becomes enabled

---

## 📊 Verification Checklist

### Before Moving to Phase B:

- [ ] All GitHub secrets added (at minimum: `LHCI_GITHUB_APP_TOKEN`)
- [ ] Manual workflow dispatch succeeds
- [ ] All 7 workflow jobs pass (lint, tests, a11y, lighthouse, e2e)
- [ ] Branch protection rule created for `main`
- [ ] Successful PR created and merged
- [ ] Failed PR blocked from merging
- [ ] Fixed PR allowed to merge
- [ ] Status checks displayed on PRs
- [ ] Administrators also blocked by rules

### Success Criteria:
```
✅ CI/CD pipeline fully operational
✅ Quality gates enforced automatically
✅ Failed tests prevent merges
✅ No manual intervention needed
✅ Ready for production deployments
```

---

## 🚀 Quick Commands Reference

```bash
# Add secrets via GitHub CLI (alternative to web UI)
gh secret set LHCI_GITHUB_APP_TOKEN --body "web_4af025ac6a5d867691e69642515f7a0aa1a7a3729f9c4a0558db7b74ec9e0045"
gh secret set DOCKERHUB_USERNAME --body "teoat"
gh secret set DOCKERHUB_TOKEN --body "your_dockerhub_token"
gh secret set PERCY_TOKEN --body "web_4af025ac6a5d867691e69642515f7a0aa1a7a3729f9c4a0558db7b74ec9e0045"

# List all secrets
gh secret list

# Trigger workflow manually
gh workflow run quality-checks.yml

# View workflow runs
gh run list --workflow=quality-checks.yml

# View specific run
gh run view <run-id> --log

# Create PR with CLI
gh pr create --title "Your Title" --body "Description"

# View PR checks
gh pr checks

# Merge PR (will fail if checks don't pass)
gh pr merge --auto --squash
```

---

## 🆘 Troubleshooting

### Issue: "No status checks found"
**Solution:** Run the workflow at least once first, then add to branch protection

### Issue: "Checks don't trigger on PR"
**Solution:** Ensure `pull_request` trigger exists in workflow file:
```yaml
on:
  pull_request:
    branches: [ main, develop ]
```

### Issue: "Frontend tests fail - module not found"
**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm test
```

### Issue: "Backend tests fail - import errors"
**Solution:**
```bash
cd backend
pip install -e ".[dev]"
pytest -v
```

### Issue: "Playwright browser not installed"
**Solution:**
```bash
npx playwright install chromium firefox webkit --with-deps
```

### Issue: "Lighthouse times out"
**Solution:** Increase timeout in workflow:
```yaml
- run: npm run lighthouse:ci
  timeout-minutes: 10
```

---

## 📈 Next Steps After Completion

Once all checks pass:

1. **Phase B: Staging Deployment**
   - Deploy to staging environment
   - Run integration tests
   - Verify end-to-end functionality

2. **Phase C: Monitoring Setup**
   - Configure Prometheus dashboards
   - Set up alerting rules
   - Implement log aggregation

3. **Phase D: Security Validation**
   - Run penetration tests
   - Dependency vulnerability scan
   - GDPR compliance verification

---

**Status:** Ready to implement  
**Estimated Time:** 1-2 hours  
**Difficulty:** Intermediate  

**Let's get started! 🚀**
