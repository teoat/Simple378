from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.schemas.event import SyncRequest, SyncResponse, DomainEvent
from app.api import deps
from app.db.models import User, Event
import structlog

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
    query = select(Event).order_by(desc(Event.created_at)).limit(limit)
    
    if aggregate_id:
        # aggregate_id is Uuid in DB, so cast or let SQLAlchemy handle string UUID
        query = query.where(Event.aggregate_id == aggregate_id)

    result = await db.execute(query)
    events = result.scalars().all()
    
    domain_events = []
    for event in events:
        # Map DB Event to DomainEvent
        # Assuming metadata_ contains things like nodeId, or default to 'backend'
        meta = event.metadata_ or {}
        
        domain_events.append(DomainEvent(
            id=str(event.id),
            aggregateId=str(event.aggregate_id),
            aggregateType=event.aggregate_type,
            eventType=event.event_type,
            timestamp=event.created_at.timestamp() * 1000,
            nodeId=meta.get("node_id", "backend"),
            clock=event.version, # Using version as primitive clock
            version=event.version,
            data=event.payload,
            checksum=meta.get("checksum", ""),
            correlationId=meta.get("correlation_id"),
            causationId=meta.get("causation_id"),
        ))

    return domain_events
    
@router.post("/sync", response_model=SyncResponse)
async def sync_events(
    sync_request: SyncRequest,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Sync offline events from client.
    """
    logger.info("received_sync_request", count=len(sync_request.events), user_id=current_user.id)
    
    synced_ids = []
    failed_ids = []
    
    for domain_event in sync_request.events:
        try:
            # Check if event exists
            from sqlalchemy import select
            existing = await db.execute(select(Event).where(Event.id == domain_event.id))
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
                    "synced_from_user": str(current_user.id)
                }
                # created_at handled by default, or could parse timestamp
            )
            db.add(db_event)
            synced_ids.append(domain_event.id)
        except Exception as e:
            logger.error("event_sync_failed", event_id=domain_event.id, error=str(e))
            failed_ids.append(domain_event.id)
            
    await db.commit()

    return {
        "synced": synced_ids,
        "failed": failed_ids,
        "conflicts": []
    }
