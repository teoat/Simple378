from typing import List, Optional
from pydantic import BaseModel
from enum import Enum

class StatusEnum(str, Enum):
    success = "success"
    partial = "partial"
    failed = "failed"
    complete = "complete"
    pending = "pending"
    error = "error"

class SeverityEnum(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"

class FindingTypeEnum(str, Enum):
    pattern = "pattern"
    amount = "amount"
    confirmation = "confirmation"
    false_positive = "false_positive"
    recommendation = "recommendation"

class Finding(BaseModel):
    id: str
    type: FindingTypeEnum
    severity: SeverityEnum
    description: str
    evidence: Optional[List[str]] = []

class IngestionMetrics(BaseModel):
    records: int
    files: int
    completion: float
    status: StatusEnum

class ReconciliationMetrics(BaseModel):
    matchRate: float
    newRecords: int
    rejected: int
    status: StatusEnum

class AdjudicationMetrics(BaseModel):
    resolved: int
    totalAlerts: int
    avgTime: str
    status: StatusEnum

class CaseSummaryResponse(BaseModel):
    id: str
    status: StatusEnum
    dataQuality: float
    daysToResolution: int
    
    ingestion: IngestionMetrics
    reconciliation: ReconciliationMetrics
    adjudication: AdjudicationMetrics
    findings: List[Finding]
