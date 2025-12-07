"""
WebSocket server for real-time updates.
"""

from fastapi import WebSocket
from typing import Dict, Set
import structlog

logger = structlog.get_logger()


class ConnectionManager:
    """Manages WebSocket connections and broadcasts messages."""

    def __init__(self):
        # Map of user_id -> Set of WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Map of WebSocket -> user_id
        self.connection_users: Dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept a new WebSocket connection."""
        await websocket.accept()

        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()

        self.active_connections[user_id].add(websocket)
        self.connection_users[websocket] = user_id

        logger.info(
            "WebSocket connected",
            user_id=user_id,
            total_connections=len(self.active_connections),
        )

    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection."""
        user_id = self.connection_users.get(websocket)
        if user_id and user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

        if websocket in self.connection_users:
            del self.connection_users[websocket]

        logger.info("WebSocket disconnected", user_id=user_id)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send a message to a specific WebSocket connection."""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error("Failed to send WebSocket message", error=str(e))
            self.disconnect(websocket)

    async def broadcast_to_user(self, message: dict, user_id: str):
        """Broadcast a message to all connections for a specific user."""
        if user_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(
                        "Failed to broadcast to user", user_id=user_id, error=str(e)
                    )
                    disconnected.append(connection)

            # Clean up disconnected connections
            for connection in disconnected:
                self.disconnect(connection)

    async def broadcast_to_all(self, message: dict):
        """Broadcast a message to all connected clients."""
        disconnected = []
        for user_id, connections in self.active_connections.items():
            for connection in connections:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error("Failed to broadcast", user_id=user_id, error=str(e))
                    disconnected.append(connection)

        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(connection)


# Global connection manager instance
manager = ConnectionManager()


# Event emitter functions
async def emit_case_created(case_id: str, user_id: str):
    """Emit case_created event."""
    await manager.broadcast_to_user(
        {"type": "case_created", "payload": {"case_id": case_id}}, user_id
    )


async def emit_case_updated(case_id: str, user_id: str):
    """Emit case_updated event."""
    await manager.broadcast_to_user(
        {"type": "case_updated", "payload": {"case_id": case_id}}, user_id
    )


async def emit_case_deleted(case_id: str, user_id: str):
    """Emit case_deleted event."""
    await manager.broadcast_to_user(
        {"type": "case_deleted", "payload": {"case_id": case_id}}, user_id
    )


async def emit_alert_added(analysis_id: str, user_id: str):
    """Emit alert_added event."""
    await manager.broadcast_to_user(
        {"type": "alert_added", "payload": {"analysis_id": analysis_id}}, user_id
    )


async def emit_alert_resolved(analysis_id: str, user_id: str):
    """Emit alert_resolved event."""
    await manager.broadcast_to_user(
        {"type": "alert_resolved", "payload": {"analysis_id": analysis_id}}, user_id
    )


async def emit_queue_updated(user_id: str):
    """Emit queue_updated event."""
    await manager.broadcast_to_user({"type": "queue_updated", "payload": {}}, user_id)


async def emit_stats_update(stats: dict, user_id: str = None):
    """Emit stats update event."""
    message = {"type": "STATS_UPDATE", "payload": stats}

    if user_id:
        await manager.broadcast_to_user(message, user_id)
    else:
        await manager.broadcast_to_all(message)


async def emit_upload_progress(upload_id: str, progress: int, user_id: str):
    """Emit upload progress event."""
    await manager.broadcast_to_user(
        {
            "type": "upload_progress",
            "payload": {"upload_id": upload_id, "progress": progress},
        },
        user_id,
    )


async def emit_processing_stage(upload_id: str, stage: str, user_id: str):
    """Emit processing stage event."""
    await manager.broadcast_to_user(
        {
            "type": "processing_stage",
            "payload": {"upload_id": upload_id, "stage": stage},
        },
        user_id,
    )


async def emit_processing_complete(upload_id: str, user_id: str):
    """Emit processing complete event."""
    await manager.broadcast_to_user(
        {"type": "processing_complete", "payload": {"upload_id": upload_id}}, user_id
    )


async def emit_processing_error(upload_id: str, error: str, user_id: str):
    """Emit processing error event."""
    await manager.broadcast_to_user(
        {
            "type": "processing_error",
            "payload": {"upload_id": upload_id, "error": error},
        },
        user_id,
    )
