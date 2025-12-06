import strawberry
from typing import List, Optional
from app.graphql.types import EventType
from app.db.session import get_db
from app.db.models import Event
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

@strawberry.type
class Query:
    @strawberry.field
    def hello(self) -> str:
        return "Hello from GraphQL"

    @strawberry.field
    async def events(self, aggregate_id: Optional[str] = None, limit: int = 100) -> List[EventType]:
        """Fetch events from database, optionally filtered by aggregate_id"""
        async for db in get_db():
            query = select(Event).order_by(desc(Event.created_at)).limit(limit)
            
            if aggregate_id:
                query = query.where(Event.aggregate_id == aggregate_id)
            
            result = await db.execute(query)
            db_events = result.scalars().all()
            
            # Map DB events to GraphQL EventType
            event_list = []
            for event in db_events:
                meta = event.metadata_ or {}
                event_list.append(EventType(
                    id=str(event.id),
                    aggregateId=str(event.aggregate_id),
                    aggregateType=event.aggregate_type,
                    eventType=event.event_type,
                    timestamp=event.created_at.timestamp() * 1000,
                    nodeId=meta.get("node_id", "backend"),
                    clock=event.version,
                    version=event.version,
                    data=event.payload,
                    checksum=meta.get("checksum", ""),
                    correlationId=meta.get("correlation_id"),
                    causationId=meta.get("causation_id"),
                ))
            
            return event_list

schema = strawberry.Schema(query=Query)
