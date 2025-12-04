"""
WebSocket endpoint for real-time updates.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from jose import jwt, JWTError
from sqlalchemy.future import select
from app.core.websocket import manager
from app.core import security
from app.core.config import settings
from app.schemas.token import TokenPayload
from app.db.models import User
from app.db.session import get_db
from app.core.websocket_metrics import WebSocketMetrics
import structlog
import uuid

logger = structlog.get_logger()
router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time updates.
    Clients must connect with a valid JWT access token in the query string.

    Query Parameters:
        token (str): JWT access token obtained from /login endpoint

    Security:
        - Verifies JWT signature
        - Checks token expiration
        - Validates token is not blacklisted
        - Ensures token type is 'access' (not 'refresh')
        - Confirms user exists in database
    """
    # Step 1: Extract token from query parameters
    token = websocket.query_params.get("token")

    metrics = WebSocketMetrics()

    if not token:
        await websocket.close(code=1008, reason="Authentication required")
        logger.warning("WebSocket connection rejected: no token provided")
        metrics.record_auth_failure('no_token')
        return

    user_id = None
    metrics.start_auth()

    try:
        # Step 2: Check if token is blacklisted (for logged-out users)
        if await security.is_token_blacklisted(token):
            await websocket.close(code=1008, reason="Token has been revoked")
            logger.warning("WebSocket connection rejected: token blacklisted")
            metrics.record_auth_failure('blacklisted')
            return

        # Step 3: Decode and verify JWT signature
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[security.ALGORITHM]
        )

        # Step 4: Validate token structure and type
        token_data = TokenPayload(**payload)

        # Ensure it's an access token, not a refresh token
        if payload.get("type") != "access":
            await websocket.close(code=1008, reason="Invalid token type")
            logger.warning("WebSocket connection rejected: not an access token",
                           token_type=payload.get("type"))
            metrics.record_auth_failure('invalid_token_type')
            return

        # Step 5: Extract user_id from token
        user_id = token_data.sub

        # Step 6: Verify user exists in database
        async for db in get_db():
            try:
                user_uuid = uuid.UUID(user_id)
            except ValueError:
                await websocket.close(code=1008, reason="Invalid user ID format")
                logger.error("WebSocket connection rejected: invalid user ID format",
                             user_id=user_id)
                metrics.record_auth_failure('invalid_user_id')
                return

            result = await db.execute(select(User).where(User.id == user_uuid))
            user = result.scalars().first()

            if not user:
                await websocket.close(code=1008, reason="User not found")
                logger.warning("WebSocket connection rejected: user not found",
                               user_id=user_id)
                metrics.record_auth_failure('user_not_found')
                return

            # All authentication checks passed
            logger.info("WebSocket authenticated successfully",
                        user_id=user_id,
                        username=user.username)
            metrics.end_auth_success()
            metrics.user_id = user_id
            break  # Exit the async generator

    except JWTError as e:
        await websocket.close(code=1008, reason="Invalid token")
        logger.error("WebSocket JWT verification failed", error=str(e))
        metrics.record_auth_failure('invalid')
        return
    except Exception as e:
        await websocket.close(code=1008, reason="Authentication failed")
        logger.error("WebSocket authentication error", error=str(e), exc_info=True)
        metrics.record_auth_failure('exception')
        return

    # Connection authenticated - proceed with WebSocket lifecycle
    with metrics:
        await manager.connect(websocket, user_id)

        try:
            while True:
                # Keep connection alive and handle incoming messages
                data = await websocket.receive_text()
                logger.debug("WebSocket message received", user_id=user_id, data=data)
                # Echo back or handle client messages if needed
                # For now, we just keep the connection alive
        except WebSocketDisconnect:
            manager.disconnect(websocket)
            logger.info("WebSocket disconnected", user_id=user_id)
        except Exception as e:
            logger.error("WebSocket error", user_id=user_id, error=str(e), exc_info=True)
            manager.disconnect(websocket)
