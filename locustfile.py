"""
Performance testing for fraud detection system using Locust.
Target: 100 RPS with <500ms p95 latency.
"""
from locust import HttpUser, task, between
import random
import uuid

class FraudDetectionUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        """Login and get auth token."""
        response = self.client.post("/api/v1/login", json={
            "email": "test@fraud.com",
            "password": "testpass123"
        })
        if response.status_code == 200:
            self.token = response.json().get("access_token")
        else:
            self.token = None
    
    @task(3)
    def view_dashboard(self):
        """Simulate viewing dashboard - most common operation."""
        if self.token:
            self.client.get(
                "/api/v1/subjects/",
                headers={"Authorization": f"Bearer {self.token}"}
            )
    
    @task(2)
    def analyze_subject(self):
        """Simulate fraud analysis."""
        if self.token:
            self.client.post(
                "/api/v1/mens-rea/analyze",
                json={
                    "subject_id": str(uuid.uuid4()),
                    "analysis_type": "transaction_pattern"
                },
                headers={"Authorization": f"Bearer {self.token}"}
            )
    
    @task(1)
    def build_graph(self):
        """Simulate graph visualization - expensive operation."""
        if self.token:
            subject_id = str(uuid.uuid4())
            self.client.get(
                f"/api/v1/graph/subgraph/{subject_id}?depth=2",
                headers={"Authorization": f"Bearer {self.token}"}
            )
    
    @task(1)
    def ai_investigation(self):
        """Simulate AI orchestrator query."""
        if self.token:
            self.client.post(
                "/api/v1/orchestration/investigate",
                json={
                    "case_id": str(uuid.uuid4()),
                    "message": "Analyze this case for fraud patterns"
                },
                headers={"Authorization": f"Bearer {self.token}"}
            )

# Run with: locust -f locustfile.py --host=http://localhost:8000
# Target: 100 users, 10 spawn rate, monitor p95 latency < 500ms
