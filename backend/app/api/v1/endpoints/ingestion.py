from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
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
    Legacy upload endpoint (direct CSV processing).
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
        if not transactions:
            return []
            
        subject_id = transactions[0].subject_id
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

# --- New Wizard Endpoints ---

@router.post("/session", response_model=Dict[str, Any])
async def create_upload_session(
    file: UploadFile = File(...),
    current_user = Depends(require_permission(Permission.INGESTION_UPLOAD))
):
    """
    Step 1: Upload file for temp storage and get schema (headers).
    """
    try:
        if not file.filename.lower().endswith('.csv'):
             raise HTTPException(status_code=400, detail="Only CSV files are supported currently")

        upload_id = await IngestionService.save_temp_file(file)
        headers = IngestionService.detect_csv_headers(upload_id)
        
        return {
            "upload_id": upload_id,
            "filename": file.filename,
            "headers": headers,
            "detected_type": "csv"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload initialization failed: {str(e)}")

@router.post("/{upload_id}/preview")
async def preview_mapping(
    upload_id: str,
    mapping: Dict[str, str],
    current_user = Depends(require_permission(Permission.INGESTION_UPLOAD))
):
    """
    Step 2: Preview data with applied mapping.
    """
    try:
        preview_data = IngestionService.preview_mapping(upload_id, mapping)
        return preview_data
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Preview failed: {str(e)}")

@router.post("/{upload_id}/finish")
async def finish_import(
    upload_id: str,
    mapping: Dict[str, str] = Body(...),
    subject_id: str = Body(...), # Or UUID
    bank_name: str = Body(...),
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(require_permission(Permission.INGESTION_UPLOAD))
):
    """
    Step 3: Process full file and save transactions.
    """
    try:
        # Convert string UUID to UUID object if needed
        try:
             s_uuid = UUID(subject_id)
        except ValueError:
             raise HTTPException(status_code=400, detail="Invalid subject_id UUID")

        transactions = await IngestionService.process_csv_with_mapping(
            db=db,
            upload_id=upload_id,
            mapping=mapping,
            subject_id=s_uuid,
            bank_name=bank_name
        )
        return {"count": len(transactions), "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")

@router.post("/{upload_id}/auto-map")
async def auto_map_fields(
    upload_id: str,
    current_user = Depends(require_permission(Permission.INGESTION_UPLOAD))
):
    """
    Step 2: Auto-suggest field mappings based on column names and sample data.
    """
    try:
        from app.services.auto_mapper import AutoMapper
        
        # Get headers and sample data
        headers = IngestionService.detect_csv_headers(upload_id)
        sample_data = IngestionService.preview_mapping(upload_id, {}, limit=10)
        
        # Get suggestions
        suggestions = AutoMapper.suggest_mapping(headers, sample_data if sample_data else None)
        
        # Calculate confidence for each suggestion
        confidence_scores = {}
        for target, source in suggestions.items():
            confidence_scores[target] = AutoMapper.calculate_confidence(
                target, source, sample_data if sample_data else None
            )
        
        return {
            "suggestions": suggestions,
            "confidence": confidence_scores,
            "available_fields": headers
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auto-mapping failed: {str(e)}")

@router.post("/{upload_id}/analyze-redactions")
async def analyze_redactions(
    upload_id: str,
    mapping: Dict[str, str] = Body(...),
    start_balance: float = Body(None),
    end_balance: float = Body(None),
    current_user = Depends(require_permission(Permission.INGESTION_UPLOAD))
):
    """
    Step 2.5: Analyze for redaction gaps (Advanced Feature).
    """
    try:
        from app.services.redaction_analyzer import RedactionAnalyzer
        
        # Get all data mapped
        # Note: In production we might want to paginate or limit this, but for analysis we likely need context
        # Re-using preview_mapping with high limit for MVP analysis
        raw_data = IngestionService.preview_mapping(upload_id, mapping, limit=10000)
        
        gaps = RedactionAnalyzer.analyze_sequence_gaps(raw_data)
        
        balance_discrepancies = []
        if start_balance is not None and end_balance is not None:
             from decimal import Decimal
             balance_discrepancies = RedactionAnalyzer.analyze_running_balance(
                 raw_data, 
                 Decimal(str(start_balance)), 
                 Decimal(str(end_balance))
             )
             
        return {
            "gaps": gaps,
            "balance_findings": balance_discrepancies,
            "total_analyzed": len(raw_data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
