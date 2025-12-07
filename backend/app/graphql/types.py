import strawberry
from typing import Optional
from strawberry.scalars import JSON


@strawberry.type
class EventType:
    id: str
    aggregateId: str
    aggregateType: str
    eventType: str
    timestamp: float
    nodeId: str
    clock: int
    version: int
    # JSON scalar is needed for data, Strawberry supports JSON via typing.JSON
    data: JSON
    correlationId: Optional[str]
    causationId: Optional[str]
    checksum: str
