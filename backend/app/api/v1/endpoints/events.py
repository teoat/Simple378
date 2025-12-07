from fastapi import APIRouter, Depends, Query
from typing import Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.event import SyncRequest, SyncResponse, DomainEvent
from app.api import deps
from app.db.models import User, Event
import structlog
from app.services.event_service import EventService  # Import the new service

router = APIRouter()
logger = structlog.get_logger()


@router.get("/", response_model=List[DomainEvent])
async def get_events(
    aggregate_id: Optional[str] = Query(None, alias="aggregateId"),
    limit: int = 100,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve events, optionally filtered by aggregate_id.
    """
    event_service = EventService(db)
    return await event_service.get_events(aggregate_id=aggregate_id, limit=limit)


@router.post("/sync", response_model=SyncResponse)
async def sync_events(
    sync_request: SyncRequest,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Sync offline events from client.
    """
    logger.info(
        "received_sync_request", count=len(sync_request.events), user_id=current_user.id
    )

    synced_ids = []
    failed_ids = []

    for domain_event in sync_request.events:
        try:
            # Check if event exists
            from sqlalchemy import select

            existing = await db.execute(
                select(Event).where(Event.id == domain_event.id)
            )
            if existing.scalar_one_or_none():
                synced_ids.append(domain_event.id)
                continue

            # Create new event
            db_event = Event(
                id=domain_event.id,
                aggregate_id=domain_event.aggregateId,
                aggregate_type=domain_event.aggregateType,
                event_type=domain_event.eventType,
                version=domain_event.version,
                payload=domain_event.data,
                metadata_={
                    "node_id": domain_event.nodeId,
                    "checksum": domain_event.checksum,
                    "correlation_id": domain_event.correlationId,
                    "causation_id": domain_event.causationId,
                    "synced_from_user": str(current_user.id),
                },
                # created_at handled by default, or could parse timestamp
            )
            db.add(db_event)
            synced_ids.append(domain_event.id)
        except Exception as e:
            logger.error("event_sync_failed", event_id=domain_event.id, error=str(e))
            failed_ids.append(domain_event.id)

    await db.commit()

    return {"synced": synced_ids, "failed": failed_ids, "conflicts": []}
