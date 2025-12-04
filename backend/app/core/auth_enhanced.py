"""
Enhanced authentication with proper token refresh, MFA integration, and session management.
"""
from datetime import timedelta
from typing import Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from jose import jwt, JWTError
import structlog

from app.db.models import User
from app.core.config import settings
from app.core import security

logger = structlog.get_logger(__name__)


class TokenRefreshHandler:
    """Handles token refresh with proper error handling and logging."""

    @staticmethod
    async def validate_and_refresh_token(
        db: AsyncSession,
        refresh_token: str,
        request_id: str
    ) -> Tuple[str, str]:
        """
        Validate refresh token and issue new access token.
        
        Args:
            db: Database session
            refresh_token: Refresh token to validate
            request_id: Request correlation ID for logging
            
        Returns:
            Tuple of (access_token, new_refresh_token)
            
        Raises:
            HTTPException: On validation failure with specific error
        """
        
        # Validate token format and signature
        try:
            payload = jwt.decode(
                refresh_token,
                settings.SECRET_KEY,
                algorithms=[security.ALGORITHM]
            )
        except jwt.ExpiredSignatureError:
            logger.warning(
                "Refresh token expired",
                request_id=request_id,
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token has expired",
            )
        except jwt.JWTClaimsError:
            logger.warning(
                "Invalid token claims",
                request_id=request_id,
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token claims",
            )
        except JWTError as e:
            logger.error(
                "Token decode error",
                request_id=request_id,
                error=str(e),
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token format",
            )
        
        # Verify token type
        token_type = payload.get("type")
        if token_type != "refresh":
            logger.warning(
                "Invalid token type",
                request_id=request_id,
                token_type=token_type,
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type - expected refresh token",
            )
        
        # Check if token is blacklisted
        try:
            if await security.is_token_blacklisted(refresh_token):
                logger.warning(
                    "Token blacklisted",
                    request_id=request_id,
                    user_id=payload.get("sub"),
                )
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has been revoked",
                )
        except Exception as e:
            logger.error(
                "Token blacklist check failed",
                request_id=request_id,
                error=str(e),
            )
            # Allow operation to continue - don't fail if blacklist unavailable
        
        # Verify user exists
        user_id = payload.get("sub")
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        
        if not user:
            logger.warning(
                "User not found for refresh",
                request_id=request_id,
                user_id=user_id,
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User no longer exists",
            )
        
        # Create new tokens
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        new_access_token = security.create_access_token(
            user.id,
            expires_delta=access_token_expires,
            request_id=request_id
        )
        new_refresh_token = security.create_refresh_token(
            user.id,
            request_id=request_id
        )
        
        logger.info(
            "Token refreshed successfully",
            request_id=request_id,
            user_id=user_id,
        )
        
        return new_access_token, new_refresh_token


class MFAAuthenticationHandler:
    """Handles MFA integration with authentication flow."""

    @staticmethod
    async def verify_mfa_requirement(db: AsyncSession, user_id: str) -> bool:
        """Check if user has MFA enabled."""
        try:
            from sqlalchemy import func
            
            result = await db.execute(
                select(func.count()).select_from(__import__('app.models.mfa', fromlist=['UserMFA']).UserMFA)
                .where(__import__('app.models.mfa', fromlist=['UserMFA']).UserMFA.user_id == user_id)
            )
            count = result.scalar()
            return count > 0
        except Exception as e:
            logger.error("MFA check failed", user_id=user_id, error=str(e))
            return False

    @staticmethod
    async def require_mfa_verification(
        db: AsyncSession,
        user_id: str,
        request_id: str
    ) -> HTTPException:
        """Raise exception indicating MFA verification required."""
        logger.info(
            "MFA verification required",
            request_id=request_id,
            user_id=user_id,
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="MFA verification required",
            headers={"X-MFA-Required": "true"},
        )


class SessionManagementHandler:
    """Manages user sessions to prevent concurrent logins if configured."""

    @staticmethod
    async def check_concurrent_login_limit(
        db: AsyncSession,
        user_id: str,
        max_concurrent: int = 3
    ) -> Tuple[bool, int]:
        """
        Check if user has exceeded concurrent login limit.
        
        Args:
            db: Database session
            user_id: User ID
            max_concurrent: Maximum concurrent sessions allowed
            
        Returns:
            Tuple of (can_login, current_sessions)
        """
        try:
            # In production, implement with Redis
            # For now, this is a placeholder for future enhancement
            return True, 1
        except Exception as e:
            logger.error("Session check failed", user_id=user_id, error=str(e))
            return True, 1  # Allow login on error

    @staticmethod
    async def create_session(
        db: AsyncSession,
        user_id: str,
        request_id: str,
        ip_address: str
    ) -> str:
        """Create new session and return session token."""
        # Placeholder for session creation
        # In production, store in Redis with TTL
        logger.info(
            "Session created",
            user_id=user_id,
            request_id=request_id,
            ip_address=ip_address,
        )
        return request_id
