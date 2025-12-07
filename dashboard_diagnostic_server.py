#!/usr/bin/env python3
"""
Dashboard Diagnostic Script
Tests dashboard endpoints with mock data without requiring full database setup
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import uvicorn

app = FastAPI(title="Dashboard Diagnostic Server")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.post("/api/v1/login")
async def login(credentials: dict):
    """Mock login endpoint - accepts any credentials"""
    # Mock JWT token (base64 encoded JSON)
    import base64
    import json
    
    token_data = {
        "token": "mock-jwt-token-for-testing",
        "expires": int((datetime.utcnow() + timedelta(hours=24)).timestamp() * 1000)
    }
    
    return {
        "access_token": base64.b64encode(json.dumps(token_data).encode()).decode(),
        "token_type": "bearer",
        "user": {
            "id": "1",
            "email": credentials.get("email", "test@example.com"),
            "full_name": "Test User",
            "role": "admin"
        }
    }


@app.post("/auth/login")
async def auth_login(credentials: dict):
    """Mock auth login endpoint - accepts any credentials"""
    # Mock JWT token (base64 encoded JSON)
    import base64
    import json
    
    token_data = {
        "token": "mock-jwt-token-for-testing",
        "expires": int((datetime.utcnow() + timedelta(hours=24)).timestamp() * 1000)
    }
    
    return {
        "access_token": base64.b64encode(json.dumps(token_data).encode()).decode(),
        "token_type": "bearer",
        "user": {
            "id": "1",
            "email": credentials.get("email", "test@example.com"),
            "full_name": "Test User",
            "role": "admin"
        }
    }


@app.get("/api/v1/dashboard/metrics")
async def get_dashboard_metrics():
    """Mock dashboard metrics endpoint"""
    return {
        "total_cases": 1234,
        "total_cases_delta": 12,
        "high_risk_subjects": 45,
        "high_risk_delta": 3,
        "pending_reviews": 127,
        "pending_delta": -15,
        "resolved_today": 23,
    }


@app.get("/api/v1/dashboard/activity")
async def get_dashboard_activity():
    """Mock dashboard activity endpoint"""
    now = datetime.utcnow()
    activities = []
    
    activity_types = [
        ("case", "Case #123 reviewed"),
        ("alert", "New high-risk alert detected (Score: 92)"),
        ("case", "Case #456 closed"),
        ("review", "Analyst completed review"),
        ("alert", "System anomaly detected"),
    ]
    
    for i, (activity_type, message) in enumerate(activity_types):
        activities.append({
            "id": f"activity_{i}",
            "type": activity_type,
            "message": message,
            "timestamp": (now - timedelta(minutes=i * 5)).isoformat(),
            "user": f"User {i % 3 + 1}",
        })
    
    return activities


@app.get("/api/v1/dashboard/charts")
async def get_dashboard_charts():
    """Mock dashboard charts endpoint"""
    # Weekly activity data (last 7 days)
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekly_activity = [
        {"day": day, "cases": 10 + (i * 5), "reviews": 8 + (i * 3)}
        for i, day in enumerate(days)
    ]
    
    # Risk distribution
    risk_distribution = [
        {"range": "0-30", "count": 450, "riskLevel": "Low"},
        {"range": "31-60", "count": 350, "riskLevel": "Medium"},
        {"range": "61-80", "count": 150, "riskLevel": "High"},
        {"range": "81-100", "count": 50, "riskLevel": "Critical"},
    ]
    
    return {
        "weekly_activity": weekly_activity,
        "risk_distribution": risk_distribution,
    }


@app.get("/api/v1/predictive/analytics/trends")
async def get_trends(time_period: str = "30d"):
    """Mock trends endpoint"""
    return {
        "trends": [
            {
                "metric": "case_volume",
                "value": 234,
                "change": 12.5,
                "direction": "increasing"
            },
            {
                "metric": "avg_risk_score",
                "value": 67.3,
                "change": -5.2,
                "direction": "decreasing"
            },
            {
                "metric": "resolution_rate",
                "value": 85.4,
                "change": 3.1,
                "direction": "increasing"
            },
            {
                "metric": "false_positive_rate",
                "value": 12.1,
                "change": -2.3,
                "direction": "decreasing"
            }
        ],
        "insights": [
            "Case volume has increased by 12.5% over the selected period",
            "Average risk score shows a positive downward trend",
            "Resolution rate is improving consistently"
        ],
        "recommendations": [
            "Consider increasing analyst capacity to handle volume growth",
            "Current risk assessment model is performing well",
            "Focus on maintaining current resolution practices"
        ],
        "severity_distribution": {
            "low": 450,
            "medium": 350,
            "high": 150
        },
        "outcome_distribution": {
            "approved": 600,
            "denied": 200,
            "escalated": 150,
            "pending": 100
        }
    }


@app.post("/api/v1/predictive/simulation/scenario")
async def run_scenario(scenario_data: dict):
    """Mock scenario simulation endpoint"""
    scenario_type = scenario_data.get("scenario_type", "what_if")
    
    if scenario_type == "what_if":
        return {
            "scenario": "what_if",
            "baseline_outcome": "denied",
            "simulated_outcome": "approved",
            "impact": "positive",
            "confidence": 0.82,
            "factors_affected": ["risk_score", "transaction_volume", "pattern_match"]
        }
    elif scenario_type == "burn_rate":
        return {
            "scenario": "burn_rate",
            "monthly_capacity": 1200,
            "burn_rate": 45000,
            "bottlenecks": ["Manual review queue", "Data ingestion"],
            "recommendations": [
                "Add 2 more analysts to review team",
                "Automate low-risk case processing"
            ]
        }
    elif scenario_type == "vendor_stress":
        return {
            "scenario": "vendor_stress",
            "affected_cases": 234,
            "risk_increase": 15,
            "critical_dependencies": ["Payment Processor", "KYC Service"]
        }
    elif scenario_type == "dependency_risk":
        return {
            "scenario": "dependency_risk",
            "overall_risk": 0.45,
            "critical_dependencies": ["External API", "Database Service"],
            "recommendations": [
                "Implement circuit breaker for External API",
                "Add database replication",
                "Set up monitoring alerts"
            ]
        }
    
    return {"scenario": scenario_type, "status": "completed"}


if __name__ == "__main__":
    print("\n" + "="*60)
    print("Dashboard Diagnostic Server")
    print("="*60)
    print("\nThis server provides mock dashboard endpoints for testing.")
    print("\nEndpoints available:")
    print("  - GET  /health")
    print("  - GET  /api/v1/dashboard/metrics")
    print("  - GET  /api/v1/dashboard/activity")
    print("  - GET  /api/v1/dashboard/charts")
    print("  - GET  /api/v1/predictive/analytics/trends")
    print("  - POST /api/v1/predictive/simulation/scenario")
    print("\nStarting server on http://localhost:8000")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
