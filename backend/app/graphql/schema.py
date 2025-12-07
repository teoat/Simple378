import strawberry
from typing import List, Optional
from app.graphql.types import EventType
from app.db.session import get_db
from app.services.event_service import EventService  # Import the new service
from strawberry.scalars import JSON


@strawberry.input
class EventInput:
    aggregateId: str
    aggregateType: str
    eventType: str
    data: JSON
    correlationId: Optional[str] = None
    causationId: Optional[str] = None


@strawberry.type
class Query:
    @strawberry.field
    def hello(self) -> str:
        return "Hello from GraphQL"

    @strawberry.field
    async def events(
        self,
        info,  # strawberry passes info as the first arg in resolvers
        aggregate_id: Optional[str] = None,
        limit: int = 100,
    ) -> List[EventType]:
        """Fetch events from database using EventService, optionally filtered by aggregate_id"""
        async for db in get_db():  # get_db is an async_generator
            event_service = EventService(db)
            domain_events = await event_service.get_events(
                aggregate_id=aggregate_id, limit=limit
            )

            # Since EventService returns DomainEvent, we need to map to EventType
            # Assuming EventType has a constructor that takes keyword arguments matching DomainEvent fields
            event_list = []
            for de in domain_events:
                event_list.append(
                    EventType(
                        id=de.id,
                        aggregateId=de.aggregateId,
                        aggregateType=de.aggregateType,
                        eventType=de.eventType,
                        timestamp=de.timestamp,
                        nodeId=de.nodeId,
                        clock=de.clock,
                        version=de.version,
                        data=de.data,
                        checksum=de.checksum,
                        correlationId=de.correlationId,
                        causationId=de.causationId,
                    )
                )
            return event_list


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def add_event(self, info, event_input: EventInput) -> EventType:
        """Add a new event to the event store"""
        async for db in get_db():
            event_service = EventService(db)
            domain_event = await event_service.add_event(
                aggregate_id=event_input.aggregateId,
                aggregate_type=event_input.aggregateType,
                event_type=event_input.eventType,
                data=event_input.data,
                correlation_id=event_input.correlationId,
                causation_id=event_input.causationId,
            )

            # Convert DomainEvent to EventType
            return EventType(
                id=domain_event.id,
                aggregateId=domain_event.aggregateId,
                aggregateType=domain_event.aggregateType,
                eventType=domain_event.eventType,
                timestamp=domain_event.timestamp,
                nodeId=domain_event.nodeId,
                clock=domain_event.clock,
                version=domain_event.version,
                data=domain_event.data,
                checksum=domain_event.checksum,
                correlationId=domain_event.correlationId,
                causationId=domain_event.causationId,
            )


schema = strawberry.Schema(query=Query, mutation=Mutation)
