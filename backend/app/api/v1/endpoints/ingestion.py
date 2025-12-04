from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.api import deps
from app.services.ingestion import IngestionService
from app.schemas import transaction as schemas
from app.core.permissions import Permission, require_permission

router = APIRouter()

@router.post("/upload", response_model=List[schemas.Transaction])
async def upload_transactions(
    subject_id: UUID = Form(...),
    bank_name: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(require_permission(Permission.INGESTION_UPLOAD))
):
    """
    Upload a CSV file of transactions for a specific subject and bank.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    content = await file.read()
    
    try:
        transactions = await IngestionService.process_csv(
            db=db,
            file_content=content,
            bank_name=bank_name,
            subject_id=subject_id,
            filename=file.filename
        )
        return transactions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

@router.post("/batch", response_model=List[schemas.Transaction])
async def create_transactions_batch(
    transactions: List[schemas.TransactionCreate],
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
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
        tx_dicts = [tx.dict(exclude={'subject_id'}) for tx in transactions]
        
        created_txs = await IngestionService.create_transactions_batch(
            db=db,
            transactions_data=tx_dicts,
            subject_id=subject_id,
            bank_name="Manual Import"
        )
        return created_txs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create transactions: {str(e)}")
