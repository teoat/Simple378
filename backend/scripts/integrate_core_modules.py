#!/usr/bin/env python3
"""
Integration script to incorporate all new core modules into main.py.
Adds middleware, handlers, and configuration for scaling, monitoring, validation, and deployment.
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))

def update_main_py():
    """Update main.py with new imports and middleware."""
    
    main_py_path = os.path.join(
        os.path.dirname(__file__), "..", "app", "main.py"
    )
    
    if not os.path.exists(main_py_path):
        print(f"Error: {main_py_path} not found")
        return False
    
    with open(main_py_path, 'r') as f:
        content = f.read()
    
    # Check if already integrated
    if "from app.core.monitoring import MetricsCollector" in content:
        print("main.py already integrated with new modules")
        return True
    
    # New imports to add
    new_imports = '''# Core infrastructure modules
from app.core.monitoring import MetricsCollector, AlertingRules, HealthCheckCollector, track_request_metrics
from app.core.rate_limiting import TokenBucketRateLimiter, QuotaManager, DynamicThrottling
from app.core.validation import DataSanitizer, InputValidator, SecurityRuleValidator
from app.core.scaling_config import RedisSessionStore, ConnectionPoolConfig, AutoScalingPolicy
from app.core.deployment import (
    DeploymentValidator, BlueGreenDeployment, CanaryDeployment,
    RollingDeployment, DeploymentRollbackManager
)
'''
    
    # Find import section
    import_end = content.rfind("from fastapi")
    if import_end == -1:
        import_end = content.find("import")
    
    last_import_end = content.find("\n\n", import_end)
    if last_import_end == -1:
        last_import_end = import_end + 100
    
    # Initialize metrics collector after FastAPI app creation
    metrics_init = '''
# Initialize monitoring and infrastructure
metrics_collector = MetricsCollector()
health_collector = HealthCheckCollector()

# Initialize rate limiting (requires REDIS_URL)
try:
    rate_limiter = TokenBucketRateLimiter(
        redis_url=settings.REDIS_URL,
        rate_limit=100,
        window_seconds=60
    )
except Exception as e:
    logger.warning(f"Rate limiter initialization failed: {e}")
    rate_limiter = None

# Initialize deployment managers
deployment_validator = DeploymentValidator()
blue_green_deployment = BlueGreenDeployment()
canary_deployment = CanaryDeployment()
rollback_manager = DeploymentRollbackManager()
'''
    
    # Health check endpoint
    health_endpoint = '''
@app.get("/health")
async def health():
    """Basic health check."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
    }

@app.get("/health/detailed")
async def health_detailed():
    """Detailed health check with component status."""
    return health_collector.get_overall_status()

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint."""
    return metrics_collector.get_prometheus_metrics()
'''
    
    # Validation middleware for all requests
    validation_middleware = '''
@app.middleware("http")
async def validation_middleware(request, call_next):
    """Middleware to validate requests for security issues."""
    
    # Check for SQL injection in query params
    for key, value in request.query_params.items():
        if isinstance(value, str) and DataSanitizer.check_sql_injection(value):
            logger.warning(f"SQL injection attempt detected in {key}", extra={"request_id": request.headers.get("X-Request-ID")})
            return JSONResponse(
                status_code=400,
                content={"detail": "Invalid request parameters"}
            )
    
    response = await call_next(request)
    return response
'''
    
    # Rate limiting middleware
    rate_limit_middleware = '''
@app.middleware("http")
async def rate_limit_middleware(request, call_next):
    """Apply rate limiting based on client identifier."""
    if rate_limiter:
        client_id = request.client.host if request.client else "unknown"
        allowed, info = await rate_limiter.is_allowed(client_id)
        
        if not allowed:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests"},
                headers={
                    "X-RateLimit-Limit": str(info["limit"]),
                    "X-RateLimit-Remaining": str(info["remaining"]),
                    "X-RateLimit-Reset": str(info["reset_at"]),
                }
            )
        
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(info["limit"])
        response.headers["X-RateLimit-Remaining"] = str(info["remaining"])
        response.headers["X-RateLimit-Reset"] = str(info["reset_at"])
        return response
    
    return await call_next(request)
'''
    
    # Construct new content
    new_content = content[:last_import_end] + "\n" + new_imports
    
    # Find app creation line
    app_creation = new_content.find("app = FastAPI(")
    app_end = new_content.find("\n", app_creation) + 1
    
    # Add initialization after app creation
    new_content = (
        new_content[:app_end] + 
        metrics_init + 
        health_endpoint +
        validation_middleware +
        rate_limit_middleware +
        new_content[app_end:]
    )
    
    # Write updated content
    with open(main_py_path, 'w') as f:
        f.write(new_content)
    
    print(f"✓ Updated {main_py_path}")
    return True


def verify_modules():
    """Verify all new modules exist and are importable."""
    
    modules = [
        "app.core.monitoring",
        "app.core.rate_limiting",
        "app.core.validation",
        "app.core.scaling_config",
        "app.core.deployment",
    ]
    
    print("\nVerifying new modules...")
    for module in modules:
        try:
            __import__(module)
            print(f"✓ {module}")
        except ImportError as e:
            print(f"✗ {module}: {e}")
            return False
    
    return True


def create_integration_tests():
    """Create integration tests for new modules."""
    
    test_file = os.path.join(
        os.path.dirname(__file__), "..", "tests", "test_core_integration.py"
    )
    
    test_content = '''"""
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
'''
    
    os.makedirs(os.path.dirname(test_file), exist_ok=True)
    
    with open(test_file, 'w') as f:
        f.write(test_content)
    
    print(f"✓ Created {test_file}")


if __name__ == "__main__":
    print("Integration Script: New Core Modules")
    print("=" * 50)
    
    # Verify modules
    if not verify_modules():
        print("\n✗ Module verification failed")
        sys.exit(1)
    
    # Update main.py
    if not update_main_py():
        print("\n✗ main.py update failed")
        sys.exit(1)
    
    # Create integration tests
    try:
        create_integration_tests()
    except Exception as e:
        print(f"Warning: Could not create integration tests: {e}")
    
    print("\n✓ Integration complete!")
    print("\nNew capabilities added:")
    print("  - Comprehensive monitoring with Prometheus metrics")
    print("  - Token bucket rate limiting with Redis backend")
    print("  - Input validation and security rule enforcement")
    print("  - Connection pool auto-scaling configuration")
    print("  - Blue-green, canary, and rolling deployment strategies")
    print("  - Deployment validation and rollback management")
    print("\nNext steps:")
    print("  1. Test new modules: pytest backend/tests/test_core_integration.py")
    print("  2. Configure rate limiting: Set REDIS_URL in environment")
    print("  3. Monitor metrics: Visit /metrics endpoint")
    print("  4. Check health: Visit /health or /health/detailed")
