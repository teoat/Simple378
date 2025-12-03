"""
Locust load testing scenarios for the Fraud Detection API.

Run with:
    locust -f tests/performance/locustfile.py --host=http://localhost:8000
"""
from locust import HttpUser, task, between
import random
import uuid

class FraudDetectionUser(HttpUser):
    """Simulates a user interacting with the Fraud Detection API."""
    
    wait_time = between(1, 3)  # Wait 1-3 seconds between tasks
    
    def on_start(self):
        """Called when a user starts - login and get tokens."""
        # Login to get auth token
        response = self.client.post("/api/v1/login/access-token", data={
            "username": "test@example.com",
            "password": "testpassword"
        })
        
        if response.status_code == 200:
            self.token = response.json().get("access_token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            self.headers = {}
    
    @task(3)
    def get_adjudication_queue(self):
        """Most common task - check adjudication queue."""
        self.client.get("/api/v1/adjudication/queue", headers=self.headers)
    
    @task(2)
    def get_health_check(self):
        """Health check endpoint."""
        self.client.get("/health")
    
    @task(1)
    def submit_decision(self):
        """Submit an adjudication decision."""
        # Generate a random UUID for testing
        analysis_id = str(uuid.uuid4())
        self.client.post(
            f"/api/v1/adjudication/{analysis_id}/decision",
            json={
                "decision": random.choice(["confirmed_fraud", "false_positive", "escalated"]),
                "notes": "Load test submission"
            },
            headers=self.headers
        )
   
    @task(1)
    def export_subject_data(self):
        """Test GDPR data export."""
        subject_id = str(uuid.uuid4())
        self.client.get(
            f"/api/v1/subjects/{subject_id}/export",
            headers=self.headers
        )

class AdminUser(HttpUser):
    """Simulates an admin user performing heavy operations."""
    
    wait_time = between(5, 10)
    
    def on_start(self):
        """Admin login."""
        response = self.client.post("/api/v1/login/access-token", data={
            "username": "admin@example.com",
            "password": "adminpassword"
        })
        
        if response.status_code == 200:
            self.token = response.json().get("access_token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            self.headers = {}
    
    @task
    def generate_case_report(self):
        """Generate PDF report - expensive operation."""
        analysis_id = str(uuid.uuid4())
        self.client.get(
            f"/api/v1/adjudication/{analysis_id}/report",
            headers=self.headers
        )
