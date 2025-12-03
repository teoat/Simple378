from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from uuid import UUID

class TransactionBase(BaseModel):
    amount: float
    currency: str = "USD"
    date: datetime
    description: Optional[str] = None
    source_bank: str
    source_file_id: Optional[str] = None
    external_id: Optional[str] = None

class TransactionCreate(TransactionBase):
    subject_id: UUID

class Transaction(TransactionBase):
    id: UUID
    subject_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
