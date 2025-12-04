"""Environment variable validation."""
import os
import sys
from typing import List, Tuple
import structlog

logger = structlog.get_logger(__name__)


def validate_required_env_vars() -> Tuple[bool, List[str]]:
    """
    Validate that all required environment variables are set.
    
    Returns:
        Tuple of (is_valid, missing_vars)
    """
    required_vars = [
        "DATABASE_URL",
        "REDIS_URL",
        "QDRANT_URL",
        "SECRET_KEY",
    ]
    
    # Check for default/insecure values in production
    production_check_vars = {
        "SECRET_KEY": [
            "change_this_secret_key_in_production",
            "dev_secret_key_change_in_production_min_32_chars",
        ],
    }
    
    missing_vars = []
    insecure_vars = []
    
    # Check for missing variables
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    # Check for insecure default values in production
    environment = os.getenv("ENVIRONMENT", "development")
    if environment == "production":
        for var, insecure_values in production_check_vars.items():
            current_value = os.getenv(var, "")
            if current_value in insecure_values:
                insecure_vars.append(f"{var} (using default/insecure value)")
    
    all_issues = missing_vars + insecure_vars
    
    if all_issues:
        logger.error(
            "Environment validation failed",
            missing=missing_vars,
            insecure=insecure_vars,
            environment=environment,
        )
        return False, all_issues
    
    logger.info("Environment validation passed", environment=environment)
    return True, []


def check_optional_services() -> dict:
    """
    Check which optional services are configured.
    
    Returns:
        Dict of service status
    """
    services = {
        "anthropic": bool(os.getenv("ANTHROPIC_API_KEY")),
        "openai": bool(os.getenv("OPENAI_API_KEY")),
        "timescale": bool(os.getenv("TIMESCALE_URL")),
        "meilisearch": bool(os.getenv("MEILI_URL")),
        "sentry": bool(os.getenv("SENTRY_DSN")),
        "oauth_google": bool(os.getenv("GOOGLE_CLIENT_ID")),
        "oauth_microsoft": bool(os.getenv("MICROSOFT_CLIENT_ID")),
        "oauth_github": bool(os.getenv("GITHUB_CLIENT_ID")),
        "twilio": bool(os.getenv("TWILIO_ACCOUNT_SID")),
        "email": bool(os.getenv("MAIL_USERNAME")),
    }
    
    logger.info("Optional services status", **services)
    return services


def validate_database_url() -> bool:
    """
    Validate DATABASE_URL format.
    
    Returns:
        True if valid, False otherwise
    """
    db_url = os.getenv("DATABASE_URL", "")
    
    if not db_url:
        return False
    
    # Check for asyncpg driver
    if "postgresql+asyncpg://" not in db_url:
        logger.warning(
            "DATABASE_URL should use asyncpg driver",
            current_url=db_url.split("@")[0] + "@***",  # Hide credentials
        )
        return False
    
    return True


def startup_validation():
    """
    Run all validation checks at startup.
    Exits the application if critical validation fails.
    """
    logger.info("Running environment validation...")
    
    # Validate required vars
    is_valid, issues = validate_required_env_vars()
    if not is_valid:
        logger.error("❌ Critical environment variables missing or insecure!")
        for issue in issues:
            logger.error(f"  - {issue}")
        logger.error("Please check your .env file and try again.")
        sys.exit(1)
    
    # Validate database URL format
    if not validate_database_url():
        logger.error("❌ DATABASE_URL is invalid or missing asyncpg driver")
        sys.exit(1)
    
    # Check optional services (informational only)
    check_optional_services()
    
    logger.info("✅ Environment validation completed successfully")
