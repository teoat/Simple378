"""
WebSocket endpoint for real-time updates.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.websocket import manager
import structlog

logger = structlog.get_logger()
router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time updates.
    Clients should connect with a valid auth token in the query string.
    """
    # Extract token from query params
    token = websocket.query_params.get("token")
    
    if not token:
        await websocket.close(code=1008, reason="Authentication required")
        return
    
    # Verify token and get user (simplified - in production use proper JWT verification)
    try:
        # For MVP, we'll use a simple token check
        # In production, decode JWT and get user_id
        user_id = token  # Simplified - should decode JWT to get user_id
    except Exception as e:
        logger.error("WebSocket authentication failed", error=str(e))
        await websocket.close(code=1008, reason="Invalid token")
        return
    
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            # Echo back or handle client messages if needed
            # For now, we just keep the connection alive
            logger.debug("WebSocket message received", user_id=user_id, data=data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("WebSocket disconnected", user_id=user_id)
    except Exception as e:
        logger.error("WebSocket error", user_id=user_id, error=str(e))
        manager.disconnect(websocket)

