#!/usr/bin/env python3
"""
Minimal Backend Server for E2E Testing
======================================

A lightweight FastAPI server with just the essential endpoints needed for
testing the Frenly AI integration and basic E2E functionality.
"""

import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn

app = FastAPI(title="AntiGravity Minimal API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data
MOCK_CASES = [
    {
        "id": "case-001",
        "subject_name": "John Doe",
        "status": "active",
        "risk_score": 75,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
    },
    {
        "id": "case-002",
        "subject_name": "Jane Smith",
        "status": "pending",
        "risk_score": 45,
        "created_at": "2024-01-02T00:00:00Z",
        "updated_at": "2024-01-02T00:00:00Z"
    }
]

MOCK_USERS = {
    "test@example.com": {
        "id": "user-001",
        "email": "test@example.com",
        "name": "Test User",
        "role": "analyst"
    }
}

# Pydantic models
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    user: Dict[str, Any]

class ChatRequest(BaseModel):
    message: str
    persona: Optional[str] = "analyst"

class ChatResponse(BaseModel):
    response: str
    persona: str
    suggestions: Optional[list] = None

# Routes
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"}

@app.post("/auth/login")
async def login(request: LoginRequest):
    """Mock login endpoint"""
    if request.email in MOCK_USERS and request.password == "password":
        return {
            "access_token": "mock-jwt-token-12345",
            "user": MOCK_USERS[request.email]
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/auth/me")
async def get_current_user():
    """Mock current user endpoint"""
    return MOCK_USERS["test@example.com"]

@app.get("/cases/")
async def get_cases(page: int = 1, limit: int = 10, search: Optional[str] = None):
    """Mock cases list endpoint"""
    cases = MOCK_CASES
    if search:
        cases = [c for c in cases if search.lower() in c["subject_name"].lower()]

    start = (page - 1) * limit
    end = start + limit

    return {
        "items": cases[start:end],
        "total": len(cases),
        "page": page,
        "pages": (len(cases) + limit - 1) // limit
    }

@app.get("/cases/{case_id}")
async def get_case(case_id: str):
    """Mock individual case endpoint"""
    case = next((c for c in MOCK_CASES if c["id"] == case_id), None)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@app.get("/dashboard/metrics")
async def get_dashboard_metrics():
    """Mock dashboard metrics"""
    return {
        "total_cases": len(MOCK_CASES),
        "total_cases_delta": 2,
        "high_risk_subjects": 1,
        "high_risk_delta": 0,
        "pending_reviews": 1,
        "pending_delta": 1,
        "resolved_today": 0
    }

@app.get("/dashboard/activity")
async def get_dashboard_activity():
    """Mock dashboard activity"""
    return [
        {
            "id": "1",
            "type": "case_created",
            "message": "New case created",
            "timestamp": "2024-01-01T00:00:00Z",
            "user": "Test User"
        }
    ]

@app.get("/dashboard/charts")
async def get_dashboard_charts():
    """Mock dashboard charts"""
    return {
        "risk_distribution": [
            {"name": "Low", "value": 50, "color": "#10B981"},
            {"name": "Medium", "value": 30, "color": "#F59E0B"},
            {"name": "High", "value": 15, "color": "#EF4444"},
            {"name": "Critical", "value": 5, "color": "#7F1D1D"}
        ],
        "weekly_activity": [
            {"date": "2024-01-01", "cases": 5, "alerts": 2},
            {"date": "2024-01-08", "cases": 3, "alerts": 1},
            {"date": "2024-01-15", "cases": 7, "alerts": 3}
        ]
    }

@app.post("/ai/chat")
async def ai_chat(request: ChatRequest):
    """Mock AI chat endpoint for Frenly AI integration"""
    # Simple mock responses based on message content
    message = request.message.lower()

    if "health" in message or "status" in message:
        response = "System is healthy. All services are running normally."
    elif "case" in message:
        response = "I can help you analyze cases. Would you like me to review case patterns or risk factors?"
    elif "test" in message:
        response = "Test message received successfully. Frenly AI integration is working!"
    elif "automation" in message:
        response = "I can assist with automating tasks. What would you like to automate?"
    else:
        response = "I understand you said: '{}'. How can I help you with fraud detection today?".format(request.message)

    return {
        "response": response,
        "persona": request.persona or "analyst",
        "suggestions": [
            "Analyze case patterns",
            "Review risk factors",
            "Check system status"
        ]
    }

@app.get("/users/profile")
async def get_user_profile():
    """Mock user profile endpoint"""
    return {
        "id": "user-001",
        "full_name": "Test User",
        "email": "test@example.com",
        "role": "analyst",
        "department": "Fraud Prevention",
        "phone_number": "+1234567890"
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)