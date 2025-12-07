# Dashboard Diagnostic Server

A standalone mock API server for testing the Dashboard frontend without requiring a full backend setup.

## Purpose

This diagnostic server provides mock implementations of all dashboard endpoints, allowing you to:
- Test the Dashboard UI without database setup
- Develop frontend features independently
- Diagnose connectivity and integration issues
- Demonstrate the Dashboard with realistic mock data

## Requirements

- Python 3.8+
- FastAPI
- Uvicorn

Install dependencies:
```bash
pip install fastapi uvicorn
```

Or use the backend's poetry environment:
```bash
cd backend
poetry install
poetry run python ../dashboard_diagnostic_server.py
```

## Usage

### Start the Server

```bash
python3 dashboard_diagnostic_server.py
```

The server will start on `http://localhost:8000`

### Test Endpoints

Once running, you can test the endpoints:

```bash
# Health check
curl http://localhost:8000/health

# Dashboard metrics
curl http://localhost:8000/api/v1/dashboard/metrics

# Dashboard activity
curl http://localhost:8000/api/v1/dashboard/activity

# Dashboard charts
curl http://localhost:8000/api/v1/dashboard/charts

# Predictive trends
curl http://localhost:8000/api/v1/predictive/analytics/trends?time_period=30d

# Scenario simulation
curl -X POST http://localhost:8000/api/v1/predictive/simulation/scenario \
  -H "Content-Type: application/json" \
  -d '{"scenario_type": "what_if", "parameters": {}}'
```

### Use with Frontend

1. Start the diagnostic server:
   ```bash
   python3 dashboard_diagnostic_server.py
   ```

2. Ensure frontend `.env` has:
   ```
   VITE_API_URL=http://localhost:8000/api/v1
   ```

3. Start frontend:
   ```bash
   cd frontend
   npm run dev
   ```

4. Access Dashboard:
   ```
   http://localhost:5173/dashboard
   ```

The Dashboard will load with mock data from the diagnostic server.

## Mock Data Provided

### Dashboard Metrics
- Total cases: 1,234 (Δ +12)
- High risk subjects: 45 (Δ +3)
- Pending reviews: 127 (Δ -15)
- Resolved today: 23

### Activity Feed
- 5 recent activities with timestamps
- Mix of case, alert, and review activities
- Realistic user attribution

### Charts
- Weekly activity data (7 days)
- Risk distribution (Low, Medium, High, Critical)
- Realistic proportions and trends

### Predictive Analytics
- Trend analysis with 4 key metrics
- Insights and recommendations
- Severity and outcome distributions
- Multiple scenario simulation types

## Endpoints Provided

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/dashboard/metrics` | Dashboard KPI metrics |
| GET | `/api/v1/dashboard/activity` | Recent activity feed |
| GET | `/api/v1/dashboard/charts` | Chart data |
| GET | `/api/v1/predictive/analytics/trends` | Trend analysis |
| POST | `/api/v1/predictive/simulation/scenario` | Scenario simulation |

## Scenario Simulation Types

The server supports multiple scenario types:

### What-If Analysis
```json
{
  "scenario_type": "what_if",
  "parameters": {
    "scenario": "Increase review threshold",
    "changes": "Threshold from 70 to 85"
  }
}
```

### Burn Rate Prediction
```json
{
  "scenario_type": "burn_rate",
  "parameters": {
    "case_load": 50,
    "avg_resolution_time": 14
  }
}
```

### Vendor Stress Testing
```json
{
  "scenario_type": "vendor_stress",
  "parameters": {
    "vendor_id": "VENDOR_001",
    "stress_factor": 1.5
  }
}
```

### Dependency Risk Modeling
```json
{
  "scenario_type": "dependency_risk",
  "parameters": {
    "dependencies": "External API\nDatabase Service"
  }
}
```

## Troubleshooting

### Port 8000 Already in Use

Change the port in the script:
```python
uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
```

### CORS Errors

The server allows all origins by default. If you still see CORS errors, check:
1. Browser is not caching old CORS policies
2. Frontend is making requests to correct URL
3. No browser extensions blocking requests

### FastAPI Not Found

Install dependencies:
```bash
pip install fastapi uvicorn
```

Or use backend poetry environment:
```bash
cd backend
poetry install
poetry run python ../dashboard_diagnostic_server.py
```

## Limitations

- No authentication (accepts all requests)
- Mock data only (not connected to database)
- No state persistence (resets on restart)
- No WebSocket support (real-time updates won't work)

For full functionality, use the real backend server.

## See Also

- [Dashboard Troubleshooting Guide](docs/DASHBOARD_TROUBLESHOOTING.md)
- [Dashboard Investigation Summary](docs/DASHBOARD_INVESTIGATION_SUMMARY.md)
- [Dashboard Component](frontend/src/pages/Dashboard.tsx)
