# Phase 5 Deployment Guide

## Quick Start Deployment

This guide walks through deploying Phase 5 enterprise features to production.

---

## Pre-Deployment Checklist

### Frontend
- [x] Service worker created and registered
- [x] PWA manifest configured
- [x] Offline sync queue implemented
- [x] Camera modal component built
- [x] Enterprise settings tab added
- [x] Admin dashboard component created
- [x] All hooks implemented
- [x] App.tsx integrated with PWA components

### Backend
- [x] Tenant endpoint created (`/api/tenant/*`)
- [x] Monitoring endpoint created (`/api/monitoring/*`)
- [x] API router updated with new endpoints
- [x] Error handling implemented
- [x] Admin RBAC verified for audit logs

### Testing
- [x] Manual component testing
- [x] Hook functionality verified
- [x] API endpoint creation verified
- [x] Integration with App.tsx confirmed

---

## Deployment Steps

### Step 1: Backend Deployment

#### 1.1 Verify Backend Files
```bash
# Check new endpoint files
ls -la backend/app/api/v1/endpoints/tenant.py
ls -la backend/app/api/v1/endpoints/monitoring.py

# Expected: Both files exist and are ~9KB
```

#### 1.2 Verify API Router
```bash
# Check that imports are updated
grep -n "tenant, monitoring" backend/app/api/v1/api.py

# Expected: Should see both modules imported
```

#### 1.3 Install Dependencies (if needed)
```bash
cd backend
pip install psutil  # For CPU/memory monitoring
pip install -r requirements-production.txt
```

#### 1.4 Test Backend Locally
```bash
# Start the backend
cd backend
python -m uvicorn app.main:app --reload

# In another terminal, test endpoints
curl http://localhost:8000/api/health

# Test tenant endpoint (requires auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/tenant/config

# Test monitoring endpoint (requires auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/monitoring/health
```

#### 1.5 Configure Environment Variables
```bash
# Create .env.production in backend directory
TENANT_ID=default-tenant
TENANT_NAME="Production Tenant"
TENANT_PLAN=enterprise
TENANT_REGION=us-east

# Optional: Database configuration
DATABASE_URL=postgresql://user:password@prod-db:5432/simple378
```

#### 1.6 Deploy Backend
```bash
# Using Docker
docker build -f backend/Dockerfile -t simple378-backend:latest .
docker push simple378-backend:latest

# Or using direct deployment
cd backend
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

---

### Step 2: Frontend Deployment

#### 2.1 Verify Frontend Files
```bash
# Check service worker
ls -la frontend/public/service-worker.js

# Check component files
ls -la frontend/src/components/pwa/
ls -la frontend/src/components/modal/
ls -la frontend/src/components/admin/

# Check hook files
ls -la frontend/src/hooks/usePWA.ts
ls -la frontend/src/hooks/useCamera.ts
ls -la frontend/src/hooks/useTenant.ts
ls -la frontend/src/hooks/useMonitoring.ts

# Expected: All files exist
```

#### 2.2 Configure Frontend Environment
```bash
# Create .env.production in frontend directory
VITE_API_BASE_URL=https://api.production.example.com
VITE_PWA_SCOPE=/
```

#### 2.3 Build Frontend
```bash
cd frontend
npm install  # Install any new dependencies
npm run build  # Creates dist/

# Expected: dist/ folder with all assets
```

#### 2.4 Verify Service Worker
```bash
# Check that service-worker.js is in dist/
ls -la dist/service-worker.js

# Verify it's being served at root
# Visit: https://your-domain/service-worker.js
```

#### 2.5 Deploy Frontend
```bash
# Using Docker
docker build -f frontend/Dockerfile -t simple378-frontend:latest .
docker push simple378-frontend:latest

# Or using S3 + CloudFront (AWS)
aws s3 sync dist/ s3://your-bucket/ --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"

# Or using Firebase Hosting
firebase deploy --only hosting
```

---

### Step 3: Database Setup (Optional but Recommended)

#### 3.1 Create Tables
```sql
-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255),
  region VARCHAR(50) DEFAULT 'us-east',
  plan VARCHAR(50) DEFAULT 'standard',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  features JSONB DEFAULT '[]',
  limits JSONB,
  compliance_standards JSONB DEFAULT '["SOC2", "HIPAA", "GDPR", "CCPA"]'
);

-- Tenant usage table
CREATE TABLE IF NOT EXISTS tenant_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  api_calls_this_month INT DEFAULT 0,
  storage_used_gb DECIMAL(10,2) DEFAULT 0,
  team_members_active INT DEFAULT 0,
  cases_created INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id)
);

-- Health metrics table
CREATE TABLE IF NOT EXISTS health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  response_time_ms DECIMAL(10,2),
  error_rate DECIMAL(5,2),
  uptime_percent DECIMAL(5,2),
  active_users INT,
  cpu_usage DECIMAL(5,2),
  memory_usage DECIMAL(5,2)
);

-- Create indexes for performance
CREATE INDEX idx_health_metrics_timestamp ON health_metrics(timestamp DESC);
CREATE INDEX idx_tenant_usage_tenant_id ON tenant_usage(tenant_id);
CREATE INDEX idx_tenant_domain ON tenants(domain);
```

#### 3.2 Insert Default Tenant
```sql
INSERT INTO tenants (name, domain, region, plan, features, limits)
VALUES (
  'Default Tenant',
  'default.example.com',
  'us-east',
  'enterprise',
  '["advanced_analytics","ai_orchestration","real_time_collaboration","custom_integrations","api_access","sso","dedicated_support","custom_training"]',
  '{"api_calls_per_month": null, "storage_gb": null, "team_members": null, "cases": null}'
);
```

---

### Step 4: Configuration & Verification

#### 4.1 Configure Nginx/Reverse Proxy
```nginx
# Ensure service worker is served with correct headers
location /service-worker.js {
  add_header Cache-Control "max-age=0, no-cache, no-store, must-revalidate";
  add_header Service-Worker-Allowed "/";
}

# API proxy
location /api/ {
  proxy_pass http://backend:8000;
  proxy_set_header Authorization $http_authorization;
  proxy_pass_header Authorization;
}

# PWA manifest
location /manifest.json {
  add_header Content-Type "application/manifest+json";
}
```

#### 4.2 Verify HTTPS
```bash
# Service Worker and PWA require HTTPS
# Verify SSL certificate
openssl s_client -connect your-domain:443

# Expected: Should show valid certificate
```

#### 4.3 Test API Endpoints
```bash
# Get auth token (adjust endpoint as needed)
TOKEN=$(curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.access_token')

# Test tenant endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/tenant/config | jq

# Test monitoring endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/monitoring/health | jq

# Test audit logs
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/audit-logs/ | jq
```

#### 4.4 Test Service Worker
```bash
# Open browser DevTools
# Go to Application > Service Workers
# Verify: "Service Worker registered successfully"

# Check IndexedDB
# Go to Application > Storage > IndexedDB
# Verify: SyncQueue database created
```

#### 4.5 Test PWA Install
```bash
# Visit the application
# Check for install prompt banner at top
# Click "Install" button
# Verify app installs to home screen
```

---

### Step 5: Monitoring Setup (Recommended)

#### 5.1 Configure Alerts
```bash
# Option A: Using Slack webhook
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# Option B: Using PagerDuty
export PAGERDUTY_API_KEY="your-pagerduty-key"
```

#### 5.2 Set Up Metrics Collection (Optional)
```bash
# Using Prometheus (recommended for production)
# Update monitoring.py to export metrics:
# - Install prometheus_client
# - Add @track_metrics decorator to endpoints

# Using Grafana for visualization
# - Set up Prometheus datasource
# - Import dashboard from PHASE5_FINAL_SUMMARY.md
```

#### 5.3 Configure Logging
```bash
# Ensure audit logging is enabled
# Check: backend/app/api/v1/endpoints/audit.py

# Configure log rotation
# Update logging config to write to:
# - /var/log/simple378/api.log
# - /var/log/simple378/error.log
```

---

### Step 6: Testing in Production

#### 6.1 Smoke Tests
```bash
# Test all critical endpoints
./scripts/smoke-test.sh

# Expected: All tests pass
```

#### 6.2 Feature Gates Testing
```bash
# Test feature gate works correctly
curl -H "Authorization: Bearer $TOKEN" \
  http://your-domain/api/tenant/feature/ai_orchestration

# Expected: Returns {"feature": "ai_orchestration", "enabled": true}
```

#### 6.3 Offline Testing
```bash
# Open DevTools
# Go to Network tab
# Set throttle to "Offline"
# Navigate to different pages
# Verify: App still works with cached content
```

#### 6.4 Load Testing
```bash
# Use Apache Bench or similar
ab -n 1000 -c 100 https://your-domain/api/health

# Expected: No 5xx errors, <200ms average response time
```

---

## Post-Deployment Verification

### Checklist
- [ ] Service worker registered (check browser DevTools)
- [ ] PWA install banner appears
- [ ] All API endpoints responding
- [ ] Tenant config loading correctly
- [ ] Monitoring health endpoint working
- [ ] Audit logs retrievable
- [ ] Offline mode working
- [ ] Cache functioning correctly
- [ ] Error alerts configured

### Monitoring Commands
```bash
# Check backend logs
docker logs simple378-backend | tail -100

# Check frontend service worker
curl https://your-domain/service-worker.js

# Check API response time
time curl -H "Authorization: Bearer $TOKEN" \
  https://your-domain/api/tenant/config

# Check error rate
curl -H "Authorization: Bearer $TOKEN" \
  https://your-domain/api/monitoring/health | jq '.error_rate'
```

---

## Rollback Plan

If deployment fails:

### 1. Quick Rollback
```bash
# Revert to previous backend version
docker pull simple378-backend:previous
docker tag simple378-backend:previous simple378-backend:latest

# Revert to previous frontend version
aws s3 sync s3://your-bucket-backup/ s3://your-bucket/ --delete
```

### 2. Database Rollback (if needed)
```bash
# If you added database tables and need to rollback:
DROP TABLE IF EXISTS health_metrics CASCADE;
DROP TABLE IF EXISTS tenant_usage CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
```

### 3. Config Rollback
```bash
# Restore previous environment variables
export TENANT_PLAN=standard  # or whatever was previous
export TENANT_REGION=us-east
```

---

## Common Issues & Solutions

### Issue: Service Worker not registering
**Solution:**
1. Verify HTTPS is enabled
2. Check service-worker.js is at root of domain
3. Check browser console for errors
4. Clear browser cache and hard refresh

### Issue: Offline mode not working
**Solution:**
1. Verify IndexedDB is available in browser
2. Check that you've visited app at least once online
3. Verify service worker has cached assets
4. Check Network tab in DevTools for 404s

### Issue: Tenant endpoint returns 401
**Solution:**
1. Verify auth token is being sent
2. Check token hasn't expired
3. Verify user has admin permissions
4. Check Authorization header format: "Bearer $TOKEN"

### Issue: Monitoring metrics show zero
**Solution:**
1. Metrics are calculated from in-memory data
2. Make several API requests first
3. Wait 10 seconds for metrics to update
4. Check that useMonitoring hook is running

### Issue: PWA install button doesn't appear
**Solution:**
1. Verify HTTPS is enabled
2. Check manifest.json is valid
3. Verify service worker is registered
4. Try on Chrome/Edge (not all browsers support)
5. Check that app isn't already "installed"

---

## Performance Tuning

### Optimize Cache Hit Rate
```javascript
// In frontend/public/service-worker.js
const CACHE_VERSION = 'v1'; // Increment on updates
const NETWORK_TIMEOUT = 3000; // Increase if slow network
```

### Optimize API Response Time
```python
# In backend/app/api/v1/endpoints/monitoring.py
METRICS_COLLECTION_INTERVAL = 10  # seconds
ALERT_CHECK_INTERVAL = 60  # seconds
```

### Optimize Database Queries
```sql
-- Add indexes if performance degrades
CREATE INDEX idx_tenants_plan ON tenants(plan);
CREATE INDEX idx_tenant_usage_month ON tenant_usage(last_updated);
```

---

## Support

For issues during deployment:
1. Check logs: `docker logs simple378-backend`
2. Check browser console: DevTools > Console
3. Check network requests: DevTools > Network
4. Review documentation: `docs/PHASE5_*`
5. Check GitHub issues or contact support

---

## Success Criteria

✅ Deployment successful when:
- Service worker is registered
- PWA install prompt appears
- All API endpoints return 200
- Tenant config loads correctly
- Monitoring health endpoint works
- Offline mode functions
- No errors in browser console
- No errors in backend logs
- Performance metrics are healthy

---

## Next Steps

After successful deployment:
1. Monitor system health for 24 hours
2. Gather user feedback on PWA experience
3. Tune performance based on actual usage
4. Configure backup and disaster recovery
5. Plan Phase 6 features (native apps, advanced AI, etc.)

---

**Deployment Date:** December 7, 2024  
**Status:** Ready for Production ✅  
**Estimated Deployment Time:** 30-60 minutes  
**Rollback Time:** <5 minutes  

Good luck with deployment! 🚀
