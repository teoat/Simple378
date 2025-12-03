from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.api import deps
from app.services.ingestion import IngestionService
from app.schemas import transaction as schemas

router = APIRouter()

@router.post("/upload", response_model=List[schemas.Transaction])
async def upload_transactions(
    subject_id: UUID = Form(...),
    bank_name: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
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
