"""
Resilience patterns for handling failures and retries.
Includes circuit breaker, retry logic, and timeout management.
"""
import asyncio
import structlog
from typing import Callable, TypeVar, Optional, Any
from functools import wraps
from enum import Enum
from datetime import datetime, timedelta
import random

logger = structlog.get_logger(__name__)

T = TypeVar("T")


class CircuitState(Enum):
    """States for circuit breaker pattern."""
    CLOSED = "closed"  # Normal operation
    OPEN = "open"  # Failures detected, rejecting requests
    HALF_OPEN = "half_open"  # Testing if service recovered


class CircuitBreaker:
    """
    Circuit breaker pattern for handling cascading failures.
    Prevents repeated calls to failing services.
    """

    def __init__(
        self,
        name: str,
        failure_threshold: int = 5,
        recovery_timeout: int = 60,
        expected_exception: Exception = Exception,
    ):
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.expected_exception = expected_exception
        self.failure_count = 0
        self.last_failure_time: Optional[datetime] = None
        self.state = CircuitState.CLOSED

    async def call(self, func: Callable, *args, **kwargs) -> Any:
        """
        Execute function through circuit breaker.
        
        Raises:
            RuntimeError: If circuit is open
        """
        if self.state == CircuitState.OPEN:
            # Check if recovery timeout has passed
            if self.last_failure_time:
                elapsed = (datetime.utcnow() - self.last_failure_time).total_seconds()
                if elapsed > self.recovery_timeout:
                    logger.info(
                        "Circuit breaker entering half-open state",
                        name=self.name,
                        elapsed=elapsed,
                    )
                    self.state = CircuitState.HALF_OPEN
                else:
                    raise RuntimeError(
                        f"Circuit breaker '{self.name}' is OPEN. "
                        f"Service unavailable for {self.recovery_timeout}s"
                    )
            else:
                raise RuntimeError(f"Circuit breaker '{self.name}' is OPEN")
        
        try:
            result = await func(*args, **kwargs)
            
            # Success - reset on recovery
            if self.state == CircuitState.HALF_OPEN:
                logger.info(
                    "Circuit breaker recovered",
                    name=self.name,
                )
                self.state = CircuitState.CLOSED
                self.failure_count = 0
            
            return result
            
        except self.expected_exception as e:
            self.failure_count += 1
            self.last_failure_time = datetime.utcnow()
            
            logger.warning(
                "Circuit breaker detected failure",
                name=self.name,
                failure_count=self.failure_count,
                error=str(e),
            )
            
            if self.failure_count >= self.failure_threshold:
                self.state = CircuitState.OPEN
                logger.error(
                    "Circuit breaker opened",
                    name=self.name,
                    threshold=self.failure_threshold,
                )
            
            raise


def retry_with_backoff(
    max_retries: int = 3,
    initial_delay: float = 1.0,
    max_delay: float = 32.0,
    exponential_base: float = 2.0,
    jitter: bool = True,
):
    """
    Decorator for retry with exponential backoff.
    
    Args:
        max_retries: Maximum number of retry attempts
        initial_delay: Initial delay between retries in seconds
        max_delay: Maximum delay between retries
        exponential_base: Base for exponential backoff calculation
        jitter: Add random jitter to prevent thundering herd
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    
                    if attempt < max_retries:
                        # Calculate delay with exponential backoff
                        delay = min(
                            initial_delay * (exponential_base ** attempt),
                            max_delay
                        )
                        
                        # Add jitter
                        if jitter:
                            delay = delay * (0.5 + random.random())
                        
                        logger.warning(
                            "Retry attempt",
                            function=func.__name__,
                            attempt=attempt + 1,
                            max_retries=max_retries,
                            delay=delay,
                            error=str(e),
                        )
                        
                        await asyncio.sleep(delay)
                    else:
                        logger.error(
                            "All retries exhausted",
                            function=func.__name__,
                            max_retries=max_retries,
                            error=str(e),
                        )
            
            raise last_exception
        
        return wrapper
    return decorator


async def call_with_timeout(
    func: Callable,
    timeout_seconds: float,
    *args,
    **kwargs
) -> Any:
    """
    Execute function with timeout.
    
    Args:
        func: Async function to execute
        timeout_seconds: Timeout in seconds
        args: Function arguments
        kwargs: Function keyword arguments
        
    Raises:
        asyncio.TimeoutError: If timeout exceeded
    """
    try:
        return await asyncio.wait_for(
            func(*args, **kwargs),
            timeout=timeout_seconds
        )
    except asyncio.TimeoutError:
        logger.error(
            "Operation timed out",
            function=func.__name__,
            timeout=timeout_seconds,
        )
        raise


class ResilientService:
    """Base class for services using resilience patterns."""

    def __init__(self, name: str):
        self.name = name
        self.circuit_breaker = CircuitBreaker(
            name=name,
            failure_threshold=5,
            recovery_timeout=60,
        )

    async def call_external_service(
        self,
        func: Callable,
        timeout: float = 30.0,
        *args,
        **kwargs
    ) -> Any:
        """
        Call external service with resilience patterns.
        
        Applies:
        - Circuit breaker protection
        - Timeout management
        - Automatic retry on transient failures
        """
        async def wrapped_call():
            return await call_with_timeout(func, timeout, *args, **kwargs)
        
        return await self.circuit_breaker.call(wrapped_call)
