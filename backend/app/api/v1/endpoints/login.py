from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from jose import jwt, JWTError

from app.api import deps
from app.core import security
from app.core.config import settings
from app.core.rate_limit import limiter
from app.db.models import User
from app.schemas.token import Token, TokenPayload

router = APIRouter()

@router.post("/access-token", response_model=Token)
@limiter.limit("10/minute")  # Rate limit: 10 login attempts per minute
async def login_access_token(
    request: Any,
    db: AsyncSession = Depends(deps.get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Login attempt for user: {form_data.username}")

    # Find user by email
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()

    if not user:
        logger.warning(f"Login failed: User {form_data.username} not found")
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not security.verify_password(form_data.password, user.hashed_password):
        logger.warning(f"Login failed: Invalid password for user {form_data.username}")
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    logger.info(f"Login successful for user: {form_data.username}")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "refresh_token": security.create_refresh_token(user.id),
    }

@router.post("/refresh", response_model=Token)
@limiter.limit("20/minute")  # Rate limit: 20 refresh attempts per minute
async def refresh_token(
    request: Any,
    refresh_token: str,
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    """
    Refresh access token using a valid refresh token
    """
    try:
        # Decode and validate refresh token
        payload = jwt.decode(
            refresh_token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
        
        # Check if it's a refresh token
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        # Check if token is blacklisted
        if await security.is_token_blacklisted(refresh_token):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked"
            )
        
    except (JWTError, Exception):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    import uuid
    try:
        user_id = uuid.UUID(token_data.sub)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    # Verify user still exists
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create new tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "refresh_token": security.create_refresh_token(user.id),
    }

@router.post("/logout")
async def logout(
    current_user: User = Depends(deps.get_current_user),
    token: str = Depends(deps.reusable_oauth2)
) -> Any:
    """
    Logout user by blacklisting their token
    """
    try:
        # Decode token to get expiration
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        
        # Calculate remaining time until expiration
        from datetime import datetime
        exp = datetime.fromtimestamp(payload.get("exp", 0))
        now = datetime.utcnow()
        expires_in = int((exp - now).total_seconds())
        
        if expires_in > 0:
            # Blacklist the token
            await security.blacklist_token(token, expires_in)
        
        return {"message": "Successfully logged out"}
    
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to logout"
        )
