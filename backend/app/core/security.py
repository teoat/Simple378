from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings
import redis.asyncio as redis
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Redis client for token blacklist
_redis_client: Optional[redis.Redis] = None


async def get_redis_client() -> redis.Redis:
    """Get or create Redis client for token blacklist"""
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.Redis(
            host=getattr(settings, "REDIS_HOST", "localhost"),
            port=getattr(settings, "REDIS_PORT", 6379),
            db=getattr(settings, "REDIS_DB", 0),
            decode_responses=True,
        )
    return _redis_client


async def blacklist_token(token: str, expires_in: int):
    """Add token to blacklist with expiration"""
    redis_client = await get_redis_client()
    await redis_client.setex(f"blacklist:{token}", expires_in, "1")


async def is_token_blacklisted(token: str) -> bool:
    """Check if token is blacklisted"""
    redis_client = await get_redis_client()
    result = await redis_client.get(f"blacklist:{token}")
    return result is not None


def create_access_token(
    subject: Union[str, Any],
    expires_delta: timedelta = None,
    token_type: str = "access",
) -> str:
    """Create access or refresh token"""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        if token_type == "refresh":
            expire = datetime.now(timezone.utc) + timedelta(
                days=7
            )  # 7 days for refresh tokens
        else:
            expire = datetime.now(timezone.utc) + timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )

    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": token_type,
        "jti": str(uuid.uuid4()),  # Unique token ID for blacklisting
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(subject: Union[str, Any]) -> str:
    """Create a refresh token"""
    return create_access_token(
        subject, token_type="refresh", expires_delta=timedelta(days=7)
    )


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
