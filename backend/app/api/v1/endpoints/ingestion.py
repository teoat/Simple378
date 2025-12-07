from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict
from uuid import UUID
from pydantic import BaseModel

from app.api import deps
from app.services.ingestion import IngestionService
from app.schemas import transaction as schemas
import os

UPLOAD_DIR = "/tmp/simple378_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


class UploadInitResponse(BaseModel):
    file_id: str
    headers: List[str]
    suggested_mapping: Dict[str, str]


class PreviewRequest(BaseModel):
    file_id: str
    mapping: Dict[str, str]
    limit: int = 5


class ProcessMappedRequest(BaseModel):
    file_id: str
    mapping: Dict[str, str]
    subject_id: UUID
    bank_name: str


class AutoMapRequest(BaseModel):
    headers: List[str]


class ColumnMapping(BaseModel):
    source: str
    target: str | None
    confidence: float
    reasoning: str


router = APIRouter()


@router.post("/upload", response_model=List[schemas.Transaction])
async def upload_transactions(
    subject_id: UUID = Form(...),
    bank_name: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(deps.get_db),
    current_user=Depends(deps.verify_active_analyst),
):
    """
    Upload a CSV file of transactions for a specific subject and bank.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()

    try:
        transactions = await IngestionService.process_csv(
            db=db,
            file_content=content,
            bank_name=bank_name,
            subject_id=subject_id,
            filename=file.filename,
        )
        return transactions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")


@router.post("/auto-map", response_model=List[ColumnMapping])
async def auto_map_columns(
    request: AutoMapRequest, current_user=Depends(deps.verify_active_analyst)
):
    """
    Use AI to automatically map CSV headers to transaction fields.
    """
    try:
        mappings = await IngestionService.auto_map_columns(request.headers)
        return mappings
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auto-mapping failed: {str(e)}")


@router.post("/batch", response_model=List[schemas.Transaction])
async def create_transactions_batch(
    transactions: List[schemas.TransactionCreate],
    db: AsyncSession = Depends(deps.get_db),
    current_user=Depends(deps.verify_active_analyst),
):
    """
    Batch create transactions from mapped JSON data.
    """
    try:
        # Group by subject_id (assuming all are for same subject for now, or handle mixed)
        # For simplicity, we assume the frontend sends transactions for a single subject or we handle them individually.
        # But IngestionService.create_transactions_batch takes a single subject_id.

        # Let's assume all transactions in the batch belong to the same subject for this MVP endpoint
        if not transactions:
            return []

        subject_id = transactions[0].subject_id

        # Convert Pydantic models to dicts
        tx_dicts = [tx.dict(exclude={"subject_id"}) for tx in transactions]

        created_txs = await IngestionService.create_transactions_batch(
            db=db,
            transactions_data=tx_dicts,
            subject_id=subject_id,
            bank_name="Manual Import",
        )
        return created_txs
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to create transactions: {str(e)}"
        )


@router.post("/upload-init", response_model=UploadInitResponse)
async def init_upload(
    file: UploadFile = File(...), current_user=Depends(deps.verify_active_analyst)
):
    """
    Step 1: Upload file, detect headers, and get AI mapping suggestions.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    try:
        response = await IngestionService.init_upload(
            file_obj=file.file, filename=file.filename, upload_dir=UPLOAD_DIR
        )
        return UploadInitResponse(**response)
    except Exception as e:
        # Service handles specific HTTP exceptions, but catch generic ones
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=500, detail=f"Failed to process upload: {str(e)}"
        )


@router.post("/mapping/preview")
async def preview_mapping(
    request: PreviewRequest, current_user=Depends(deps.verify_active_analyst)
):
    """
    Step 2: Preview data with applied mapping.
    """
    try:
        return await IngestionService.preview_mapping(
            file_id=request.file_id,
            mapping=request.mapping,
            upload_dir=UPLOAD_DIR,
            limit=request.limit,
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Preview failed: {str(e)}")


@router.post("/process-mapped")
async def process_mapped(
    request: ProcessMappedRequest,
    db: AsyncSession = Depends(deps.get_db),
    current_user=Depends(deps.verify_active_analyst),
):
    """
    Step 3: Process the full file with confirmed mapping.
    """
    try:
        transactions = await IngestionService.process_mapped_file(
            db=db,
            file_id=request.file_id,
            mapping=request.mapping,
            subject_id=request.subject_id,
            bank_name=request.bank_name,
            upload_dir=UPLOAD_DIR,
            user_id=str(current_user.id),
        )
        return {"status": "success", "count": len(transactions)}

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
