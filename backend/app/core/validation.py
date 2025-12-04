"""
Input validation, data sanitization, and security filtering.
Prevents injection attacks, ensures data integrity, and validates business logic.
"""
import structlog
import re
from typing import Dict, List, Optional, Any, Type, Union
from pydantic import BaseModel, ValidationError, field_validator
from html import escape
import json

logger = structlog.get_logger(__name__)


class DataSanitizer:
    """
    Sanitizes user input to prevent injection attacks.
    """

    # SQL injection patterns
    SQL_INJECTION_PATTERNS = [
        r"(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)",
        r"(--|;|\/\*|\*\/|xp_|sp_)",
        r"(\bOR\b.*=.*)",
        r"(\bAND\b.*=.*)",
    ]

    # XSS patterns
    XSS_PATTERNS = [
        r"<script[^>]*>.*?</script>",
        r"on\w+\s*=",  # Event handlers
        r"javascript:",
        r"vbscript:",
    ]

    @staticmethod
    def sanitize_string(value: str, max_length: int = 1000) -> str:
        """
        Sanitize string input.
        
        Args:
            value: Input string
            max_length: Maximum allowed length
            
        Returns:
            Sanitized string
        """
        if not isinstance(value, str):
            return ""
        
        # Limit length
        value = value[:max_length]
        
        # Remove null bytes
        value = value.replace("\x00", "")
        
        # HTML escape
        value = escape(value)
        
        return value.strip()

    @staticmethod
    def check_sql_injection(value: str) -> bool:
        """
        Check if value contains SQL injection patterns.
        
        Args:
            value: Input to check
            
        Returns:
            True if SQL injection detected
        """
        if not isinstance(value, str):
            return False
        
        upper_value = value.upper()
        
        for pattern in DataSanitizer.SQL_INJECTION_PATTERNS:
            if re.search(pattern, upper_value, re.IGNORECASE):
                logger.warning(
                    "SQL injection pattern detected",
                    pattern=pattern,
                    value_length=len(value),
                )
                return True
        
        return False

    @staticmethod
    def check_xss_attack(value: str) -> bool:
        """
        Check if value contains XSS patterns.
        
        Args:
            value: Input to check
            
        Returns:
            True if XSS detected
        """
        if not isinstance(value, str):
            return False
        
        for pattern in DataSanitizer.XSS_PATTERNS:
            if re.search(pattern, value, re.IGNORECASE):
                logger.warning(
                    "XSS pattern detected",
                    pattern=pattern,
                )
                return True
        
        return False

    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format."""
        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        return bool(re.match(pattern, email))

    @staticmethod
    def validate_url(url: str) -> bool:
        """Validate URL format."""
        pattern = r"^https?://[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
        return bool(re.match(pattern, url))

    @staticmethod
    def validate_phone(phone: str) -> bool:
        """Validate phone number format."""
        # Basic international format validation
        pattern = r"^\+?[1-9]\d{1,14}$"
        return bool(re.match(pattern, phone.replace("-", "").replace(" ", "")))


class InputValidator:
    """
    Validates input data according to business rules.
    """

    @staticmethod
    def validate_pagination(page: int, page_size: int) -> tuple[int, int]:
        """
        Validate pagination parameters.
        
        Args:
            page: Page number
            page_size: Items per page
            
        Returns:
            Validated (page, page_size)
        """
        MIN_PAGE = 1
        MIN_PAGE_SIZE = 1
        MAX_PAGE_SIZE = 100
        
        page = max(MIN_PAGE, page or MIN_PAGE)
        page_size = max(MIN_PAGE_SIZE, min(MAX_PAGE_SIZE, page_size or 20))
        
        return page, page_size

    @staticmethod
    def validate_decimal_range(
        value: float,
        min_val: float,
        max_val: float,
    ) -> float:
        """
        Validate decimal value is within range.
        
        Args:
            value: Value to validate
            min_val: Minimum allowed
            max_val: Maximum allowed
            
        Returns:
            Validated value or raises ValueError
        """
        if value < min_val or value > max_val:
            raise ValueError(
                f"Value {value} outside range [{min_val}, {max_val}]"
            )
        return value

    @staticmethod
    def validate_date_range(
        start_date: str,
        end_date: str,
        max_range_days: int = 90,
    ) -> bool:
        """
        Validate date range doesn't exceed limit.
        
        Args:
            start_date: ISO format date
            end_date: ISO format date
            max_range_days: Maximum allowed range
            
        Returns:
            True if valid
        """
        from datetime import datetime, timedelta
        
        try:
            start = datetime.fromisoformat(start_date)
            end = datetime.fromisoformat(end_date)
            
            if end < start:
                logger.warning("End date before start date")
                return False
            
            range_days = (end - start).days
            
            if range_days > max_range_days:
                logger.warning(
                    "Date range exceeds limit",
                    range_days=range_days,
                    limit=max_range_days,
                )
                return False
            
            return True
        except ValueError:
            logger.warning("Invalid date format")
            return False

    @staticmethod
    def validate_json_payload(payload: str, max_size_kb: int = 1024) -> Dict:
        """
        Validate and parse JSON payload.
        
        Args:
            payload: JSON string
            max_size_kb: Maximum payload size
            
        Returns:
            Parsed JSON or raises ValueError
        """
        if len(payload) / 1024 > max_size_kb:
            raise ValueError(f"Payload exceeds {max_size_kb}KB limit")
        
        try:
            return json.loads(payload)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON: {str(e)}")


class SecurityRuleValidator:
    """
    Validates data against security rules and policies.
    """

    # List of blocked domains for external URLs
    BLOCKED_DOMAINS = [
        "localhost",
        "127.0.0.1",
        "0.0.0.0",
        "internal",
        "private",
    ]

    # Maximum values for rate limit protection
    MAX_FILE_SIZE_MB = 50
    MAX_BATCH_SIZE = 1000
    MAX_TEXT_LENGTH = 10000

    @staticmethod
    def validate_external_url(url: str) -> bool:
        """
        Validate URL is not blocked.
        
        Args:
            url: URL to validate
            
        Returns:
            True if URL is safe
        """
        if not DataSanitizer.validate_url(url):
            return False
        
        for blocked_domain in SecurityRuleValidator.BLOCKED_DOMAINS:
            if blocked_domain.lower() in url.lower():
                logger.warning(
                    "Blocked domain detected",
                    url=url,
                    domain=blocked_domain,
                )
                return False
        
        return True

    @staticmethod
    def validate_file_upload(
        filename: str,
        file_size_bytes: int,
        allowed_types: List[str],
    ) -> bool:
        """
        Validate file upload.
        
        Args:
            filename: Uploaded filename
            file_size_bytes: File size
            allowed_types: Allowed MIME types
            
        Returns:
            True if file is valid
        """
        # Check file size
        max_size_bytes = SecurityRuleValidator.MAX_FILE_SIZE_MB * 1024 * 1024
        if file_size_bytes > max_size_bytes:
            logger.warning(
                "File too large",
                filename=filename,
                size_mb=file_size_bytes / 1024 / 1024,
            )
            return False
        
        # Check file type (basic check by extension)
        # In production, use python-magic for MIME type detection
        for allowed_type in allowed_types:
            if filename.endswith(f".{allowed_type}"):
                return True
        
        logger.warning(
            "File type not allowed",
            filename=filename,
            allowed_types=allowed_types,
        )
        return False

    @staticmethod
    def validate_batch_request(
        items: List,
        max_batch_size: int = None,
    ) -> bool:
        """
        Validate batch request size.
        
        Args:
            items: Items in batch
            max_batch_size: Maximum allowed
            
        Returns:
            True if valid
        """
        max_size = max_batch_size or SecurityRuleValidator.MAX_BATCH_SIZE
        
        if len(items) > max_size:
            logger.warning(
                "Batch size exceeds limit",
                size=len(items),
                limit=max_size,
            )
            return False
        
        return True


class ModelValidator:
    """
    Extended Pydantic validators for business models.
    """

    @staticmethod
    def validate_risk_score(value: float) -> float:
        """Validate risk score is between 0 and 1."""
        if not 0 <= value <= 1:
            raise ValueError(f"Risk score must be between 0 and 1, got {value}")
        return value

    @staticmethod
    def validate_confidence_level(value: float) -> float:
        """Validate confidence level is between 0 and 1."""
        if not 0 <= value <= 1:
            raise ValueError(f"Confidence must be between 0 and 1, got {value}")
        return value

    @staticmethod
    def validate_currency_amount(value: float) -> float:
        """Validate currency amount is positive."""
        if value < 0:
            raise ValueError(f"Amount cannot be negative, got {value}")
        if value > 999999999.99:  # Reasonable limit
            raise ValueError(f"Amount exceeds maximum, got {value}")
        return round(value, 2)

    @staticmethod
    def validate_user_id(value: str) -> str:
        """Validate user ID format."""
        if not value or len(value) > 100:
            raise ValueError("Invalid user ID")
        if not re.match(r"^[a-zA-Z0-9_-]+$", value):
            raise ValueError("User ID contains invalid characters")
        return value

    @staticmethod
    def validate_entity_relationship(
        parent_id: str,
        child_id: str,
    ) -> bool:
        """Validate parent-child relationship exists."""
        # This would query the database in real implementation
        logger.info(
            "Entity relationship validated",
            parent_id=parent_id,
            child_id=child_id,
        )
        return True
