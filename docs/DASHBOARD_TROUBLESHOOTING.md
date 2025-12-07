# Dashboard Launch Troubleshooting Guide

This guide helps diagnose and resolve issues with the Dashboard page in Simple378.

## Quick Diagnosis

### 1. Check Backend Status

```bash
# Test if backend is running
curl http://localhost:8000/health

# Expected response: {"status":"ok"}
```

### 2. Check Dashboard Endpoints

```bash
# Test dashboard metrics endpoint (requires authentication)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/v1/dashboard/metrics

# Expected response: JSON with metrics data
```

### 3. Check Browser Console

Open browser DevTools (F12) and check the Console tab for errors:
- Red errors indicate JavaScript issues
- Failed network requests indicate API connectivity problems
- CORS errors indicate backend configuration issues

## Common Issues and Solutions

### Issue 1: "Dashboard Unavailable" Error

**Symptoms:**
- Dashboard shows error message
- Network tab shows failed API requests

**Causes:**
- Backend is not running
- Backend is running on wrong port
- Authentication token is invalid or expired

**Solutions:**

1. **Start the backend:**
   ```bash
   cd backend
   poetry run uvicorn app.main:app --reload --port 8000
   ```

2. **Verify API URL in frontend .env:**
   ```bash
   cd frontend
   cat .env
   # Should contain: VITE_API_URL=http://localhost:8000
   ```

3. **Re-login to get fresh token:**
   - Clear browser cache and localStorage
   - Login again to get new authentication token

### Issue 2: Dashboard Loads But Shows No Data

**Symptoms:**
- Dashboard renders but all metrics show 0
- Charts are empty
- No recent activity

**Causes:**
- Database has no data
- User doesn't have permissions to view data
- Data queries are failing silently

**Solutions:**

1. **Seed the database:**
   ```bash
   cd backend
   poetry run python seed_data.py
   ```

2. **Check database connection:**
   ```bash
   cd backend
   poetry run python -c "from app.db.session import engine; print('DB OK')"
   ```

3. **Check user permissions:**
   - Verify user has correct role and tenant_id
   - Check audit logs for access denials

### Issue 3: Dashboard Loads Slowly

**Symptoms:**
- Dashboard takes >5 seconds to load
- Loading spinner shows for extended time

**Causes:**
- Database queries are slow
- Network latency
- Too many concurrent requests

**Solutions:**

1. **Check database indexes:**
   ```sql
   -- Ensure indexes exist on frequently queried columns
   SELECT * FROM pg_indexes WHERE tablename IN ('subjects', 'analysis_results', 'audit_logs');
   ```

2. **Enable query caching:**
   - Dashboard already implements 30-second cache
   - Can be extended in `Dashboard.tsx` by adjusting `refetchInterval`

3. **Check network performance:**
   - Use browser DevTools Network tab
   - Look for slow requests (>1s)
   - Consider increasing backend timeout settings

### Issue 4: WebSocket Connection Fails

**Symptoms:**
- Real-time updates don't work
- Console shows WebSocket errors

**Causes:**
- WebSocket server not configured
- Proxy/firewall blocking WebSocket
- CORS issues

**Solutions:**

1. **Verify WebSocket endpoint:**
   ```bash
   # Check if WebSocket endpoint exists
   curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" http://localhost:8000/ws
   ```

2. **Check CORS settings in backend:**
   ```python
   # In backend/app/main.py
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173", "http://localhost:5174"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

### Issue 5: Predictive Analytics Sections Show Errors

**Symptoms:**
- TrendAnalysis component shows "No data"
- ScenarioSimulation fails to run

**Causes:**
- Predictive endpoints not implemented or failing
- Insufficient data for analysis
- AI service unavailable

**Solutions:**

1. **Check if predictive endpoints exist:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:8000/api/v1/predictive/analytics/trends?time_period=30d
   ```

2. **Verify AI service configuration:**
   - Check that ANTHROPIC_API_KEY is set in .env
   - Verify AI service is properly initialized

3. **Handle gracefully with fallback UI:**
   - Components should show "Coming Soon" or similar if endpoints don't exist

## Development Mode Testing

### Start Both Services

```bash
# Terminal 1: Backend
cd backend
poetry run uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev

# Access at: http://localhost:5173/dashboard
```

### Enable Debug Logging

Add to `Dashboard.tsx` for detailed logging:

```typescript
useEffect(() => {
  console.log('Dashboard data:', dashboardData);
  console.log('Loading state:', isLoading);
  console.log('Error state:', error);
}, [dashboardData, isLoading, error]);
```

### Use Health Check Utility

```typescript
import { checkDashboardHealth, logDashboardDiagnostics } from '../utils/dashboardHealthCheck';

// In component or console
const results = await checkDashboardHealth('http://localhost:8000/api/v1');
logDashboardDiagnostics(results);
```

## Production Deployment Issues

### Issue: Dashboard Works Locally But Not in Production

**Solutions:**

1. **Verify environment variables:**
   ```bash
   # Check production .env has correct API URL
   echo $VITE_API_URL
   ```

2. **Check reverse proxy configuration:**
   - Nginx/Apache must properly proxy `/api/*` to backend
   - WebSocket upgrade headers must be forwarded

3. **Verify HTTPS/WSS:**
   - If frontend is HTTPS, backend must be HTTPS
   - WebSocket must use WSS (not WS) with HTTPS

## Performance Optimization

### Current Optimizations

1. **Parallel API Calls:**
   - Dashboard fetches metrics, activity, and charts concurrently
   - Reduces total load time by ~66%

2. **Query Caching:**
   - React Query caches dashboard data for 30 seconds
   - Reduces redundant API calls

3. **Retry Logic:**
   - Dashboard now retries failed requests 2 times
   - 1-second delay between retries

### Future Improvements

1. **Implement Server-Side Caching:**
   - Cache dashboard metrics in Redis
   - Reduce database query load

2. **Add Incremental Loading:**
   - Load critical metrics first
   - Lazy load charts and secondary data

3. **Implement Progressive Web App:**
   - Cache dashboard data offline
   - Show last known state when offline

## API Endpoint Reference

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/api/v1/dashboard/metrics` | GET | Dashboard KPI metrics | `{ total_cases, high_risk_subjects, pending_reviews, resolved_today, ... }` |
| `/api/v1/dashboard/activity` | GET | Recent system activity | `Array<{ id, type, message, timestamp, user }>` |
| `/api/v1/dashboard/charts` | GET | Chart data | `{ weekly_activity, risk_distribution }` |
| `/api/v1/predictive/analytics/trends` | GET | Trend analysis | `{ trends, insights, recommendations, ... }` |
| `/api/v1/predictive/simulation/scenario` | POST | Scenario simulation | Varies by scenario type |

## Support

If issues persist:

1. Check backend logs: `tail -f backend/logs/app.log`
2. Check browser console for errors
3. Verify database connectivity and data
4. Review this guide's common issues section
5. Create a GitHub issue with:
   - Error messages
   - Browser console logs
   - Network request details
   - Steps to reproduce

## Recent Changes

### 2024-12-07: Enhanced Error Handling
- Added retry logic (2 retries with 1s delay)
- Improved error state UI with reload button
- Added better loading indicators
- Created health check utility

### Component Dependencies

Dashboard relies on:
- `@tanstack/react-query` for data fetching
- `lucide-react` for icons
- `framer-motion` for animations
- `recharts` for charts
- Backend API endpoints (listed above)
- WebSocket for real-time updates

All dependencies are properly installed via `package.json`.
