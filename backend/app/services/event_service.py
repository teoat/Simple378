from typing import List, Optional, Any, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.db.models import Event
from app.schemas.event import (
    DomainEvent,
)  # Assuming DomainEvent is the common output schema
import uuid


class EventService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_events(
        self, aggregate_id: Optional[str] = None, limit: int = 100
    ) -> List[DomainEvent]:
        query = select(Event).order_by(desc(Event.created_at)).limit(limit)

        if aggregate_id:
            query = query.where(Event.aggregate_id == aggregate_id)

        result = await self.db.execute(query)
        db_events = result.scalars().all()

        domain_events = []
        for event in db_events:
            meta = event.metadata_ or {}

            domain_events.append(
                DomainEvent(
                    id=str(event.id),
                    aggregateId=str(event.aggregate_id),
                    aggregateType=event.aggregate_type,
                    eventType=event.event_type,
                    timestamp=event.created_at.timestamp() * 1000,
                    nodeId=meta.get("node_id", "backend"),
                    clock=event.version,  # Using version as primitive clock
                    version=event.version,
                    data=event.payload,
                    checksum=meta.get("checksum", ""),
                    correlationId=meta.get("correlation_id"),
                    causationId=meta.get("causation_id"),
                )
            )

        return domain_events

    async def add_event(
        self,
        aggregate_id: str,
        aggregate_type: str,
        event_type: str,
        data: Dict[str, Any],
        correlation_id: Optional[str] = None,
        causation_id: Optional[str] = None,
    ) -> DomainEvent:
        """Add a new event to the event store"""
        event_id = str(uuid.uuid4())
        version = 1  # For simplicity, assuming new aggregate
        checksum = "placeholder"  # Compute proper checksum in production

        db_event = Event(
            id=event_id,
            aggregate_id=aggregate_id,
            aggregate_type=aggregate_type,
            event_type=event_type,
            version=version,
            payload=data,
            metadata_={
                "node_id": "event-service",
                "checksum": checksum,
                "correlation_id": correlation_id,
                "causation_id": causation_id,
            },
        )

        self.db.add(db_event)
        await self.db.commit()
        await self.db.refresh(db_event)

        return DomainEvent(
            id=str(db_event.id),
            aggregateId=str(db_event.aggregate_id),
            aggregateType=db_event.aggregate_type,
            eventType=db_event.event_type,
            timestamp=db_event.created_at.timestamp() * 1000,
            nodeId="event-service",
            clock=db_event.version,
            version=db_event.version,
            data=db_event.payload,
            checksum=checksum,
            correlationId=correlation_id,
            causationId=causation_id,
        )
