"""
Integration tests for core infrastructure modules.
"""
import pytest
from app.core.monitoring import MetricsCollector, AlertingRules
from app.core.rate_limiting import TokenBucketRateLimiter
from app.core.validation import DataSanitizer, InputValidator
from app.core.scaling_config import ConnectionPoolConfig
from app.core.deployment import DeploymentValidator, BlueGreenDeployment


@pytest.mark.asyncio
async def test_metrics_collector():
    """Test metrics collection."""
    collector = MetricsCollector()
    
    # Record HTTP request
    collector.record_http_request(
        method="GET",
        endpoint="/test",
        status_code=200,
        duration_seconds=0.1,
        correlation_id="test-123"
    )
    
    # Verify metrics
    metrics = collector.get_prometheus_metrics()
    assert "http_requests_total" in metrics
    assert "GET_/test_200" in metrics


def test_data_sanitizer():
    """Test input sanitization."""
    # Test SQL injection detection
    assert DataSanitizer.check_sql_injection("SELECT * FROM users WHERE id=1")
    assert not DataSanitizer.check_sql_injection("Hello world")
    
    # Test XSS detection
    assert DataSanitizer.check_xss_attack("<script>alert('xss')</script>")
    assert not DataSanitizer.check_xss_attack("Hello world")
    
    # Test email validation
    assert DataSanitizer.validate_email("test@example.com")
    assert not DataSanitizer.validate_email("invalid-email")


def test_input_validator():
    """Test input validation."""
    # Test pagination
    page, page_size = InputValidator.validate_pagination(1, 50)
    assert page == 1
    assert page_size == 50
    
    # Test with invalid values
    page, page_size = InputValidator.validate_pagination(0, 200)
    assert page == 1
    assert page_size == 100  # Capped at max


def test_connection_pool_config():
    """Test connection pool configuration."""
    dev_size = ConnectionPoolConfig.get_pool_size("development")
    staging_size = ConnectionPoolConfig.get_pool_size("staging")
    prod_size = ConnectionPoolConfig.get_pool_size("production")
    
    assert dev_size < staging_size < prod_size


def test_deployment_validator():
    """Test deployment validation."""
    validator = DeploymentValidator()
    
    # Test migration validation
    result = validator.validate_database_migrations(5)
    assert result["passed"]
    assert result["details"]["pending_migrations"] == 5


@pytest.mark.asyncio
async def test_blue_green_deployment():
    """Test blue-green deployment."""
    deployment = BlueGreenDeployment()
    
    # Prepare new environment
    status = await deployment.prepare_new_environment("v2.0.0")
    assert status["status"] == "preparing"
    
    # Switch traffic
    switch_result = await deployment.switch_traffic("blue", "green")
    assert switch_result["status"] == "switched"
    assert deployment.active_environment == "green"
    
    # Rollback
    rollback_result = await deployment.rollback()
    assert rollback_result["status"] == "switched"
    assert deployment.active_environment == "blue"
