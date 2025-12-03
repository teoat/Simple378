from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import Any
import shutil
import os
import tempfile
from app.services.forensics import ForensicsService
from app.api import deps

router = APIRouter()
forensics_service = ForensicsService()

@router.post("/analyze", response_model=Any)
async def analyze_file(
    file: UploadFile = File(...),
    current_user: Any = Depends(deps.get_current_user)
) -> Any:
    """
    Upload a file for forensic analysis.
    Extracts metadata and checks for manipulation.
    """
    # Create a temporary file to save the upload
    try:
        suffix = os.path.splitext(file.filename)[1] if file.filename else ""
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    try:
        # Run analysis
        result = await forensics_service.analyze_document(tmp_path)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    finally:
        # Cleanup
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
