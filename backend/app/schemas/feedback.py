from pydantic import BaseModel
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

    class Config:
        orm_mode = True
