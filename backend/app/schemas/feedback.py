from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID

class FeedbackBase(BaseModel):
    message_timestamp: datetime
    feedback: str

class FeedbackCreate(FeedbackBase):
    pass

class FeedbackInDB(FeedbackBase):
    id: UUID
    user_id: UUID

    model_config = ConfigDict(from_attributes=True)
