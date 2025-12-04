"""
Multi-Factor Authentication API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List

from app.api import deps
from app.db.session import get_db
from app.db.models import User
from app.services.mfa_service import MFAService
import structlog

logger = structlog.get_logger()
router = APIRouter()


# ==================== Request/Response Models ====================

class TOTPSetupResponse(BaseModel):
    secret: str
    provisioning_uri: str
    qr_code_url: str


class VerifyCodeRequest(BaseModel):
    code: str


class SendOTPRequest(BaseModel):
    phone: str | None = None
    email: str | None = None


class BackupCodesResponse(BaseModel):
    codes: List[str]
    message: str


class MFAStatusResponse(BaseModel):
    enabled: bool
    methods: List[str]


class DisableMethodRequest(BaseModel):
    method: str


# ==================== TOTP Endpoints ====================

@router.post("/totp/setup", response_model=TOTPSetupResponse)
async def setup_totp(
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Initialize TOTP setup for user.
    
    Returns secret and provisioning URI for QR code generation.
    """
    mfa_service = MFAService(db)
    
    secret, provisioning_uri = await mfa_service.setup_totp(str(current_user.id))
    
    # Generate QR code URL (frontend will render)
    qr_code_url = f"/api/v1/mfa/totp/qr?secret={secret}"
    
    return TOTPSetupResponse(
        secret=secret,
        provisioning_uri=provisioning_uri,
        qr_code_url=qr_code_url
    )


@router.post("/totp/verify-setup")
async def verify_totp_setup(
    request: VerifyCodeRequest,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Verify TOTP code and enable TOTP for user.
    """
    mfa_service = MFAService(db)
    
    is_valid = await mfa_service.verify_totp_setup(
        str(current_user.id),
        request.code
    )
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code"
        )
    
    return {"message": "TOTP enabled successfully"}


@router.post("/totp/verify")
async def verify_totp(
    request: VerifyCodeRequest,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Verify TOTP code during login/sensitive operations.
    """
    mfa_service = MFAService(db)
    
    is_valid = await mfa_service.verify_totp(
        str(current_user.id),
        request.code
    )
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code"
        )
    
    return {"message": "Code verified"}


# ==================== SMS OTP Endpoints ====================

@router.post("/sms/send")
async def send_sms_otp(
    request: SendOTPRequest,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Send OTP via SMS.
    """
    if not request.phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number required"
        )
    
    mfa_service = MFAService(db)
    
    # In production, don't return the code
    code = await mfa_service.send_sms_otp(
        str(current_user.id),
        request.phone
    )
    
    return {
        "message": "OTP sent to phone",
        "code": code  # TODO: Remove in production
    }


@router.post("/sms/verify")
async def verify_sms_otp(
    request: VerifyCodeRequest,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Verify SMS OTP code.
    """
    mfa_service = MFAService(db)
    
    is_valid = await mfa_service.verify_sms_otp(
        str(current_user.id),
        request.code
    )
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired code"
        )
    
    return {"message": "Code verified"}


# ==================== Email OTP Endpoints ====================

@router.post("/email/send")
async def send_email_otp(
    request: SendOTPRequest,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Send OTP via email.
    """
    email = request.email or current_user.email
    
    mfa_service = MFAService(db)
    
    code = await mfa_service.send_email_otp(
        str(current_user.id),
        email
    )
    
    return {
        "message": "OTP sent to email",
        "code": code  # TODO: Remove in production
    }


@router.post("/email/verify")
async def verify_email_otp(
    request: VerifyCodeRequest,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Verify email OTP code.
    """
    mfa_service = MFAService(db)
    
    is_valid = await mfa_service.verify_email_otp(
        str(current_user.id),
        request.code
    )
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired code"
        )
    
    return {"message": "Code verified"}


# ==================== Backup Codes Endpoints ====================

@router.post("/backup-codes/generate", response_model=BackupCodesResponse)
async def generate_backup_codes(
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate backup recovery codes.
    
    WARNING: These codes should be stored securely by the user.
    They cannot be retrieved again.
    """
    mfa_service = MFAService(db)
    
    codes = await mfa_service.generate_backup_codes(str(current_user.id))
    
    return BackupCodesResponse(
        codes=codes,
        message="Store these codes securely. They cannot be retrieved again."
    )


@router.post("/backup-codes/verify")
async def verify_backup_code(
    request: VerifyCodeRequest,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Verify and consume a backup code.
    """
    mfa_service = MFAService(db)
    
    is_valid = await mfa_service.verify_backup_code(
        str(current_user.id),
        request.code
    )
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid backup code"
        )
    
    return {"message": "Backup code verified"}


# ==================== Management Endpoints ====================

@router.get("/status", response_model=MFAStatusResponse)
async def get_mfa_status(
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get MFA status for current user.
    """
    mfa_service = MFAService(db)
    
    methods = await mfa_service.get_enabled_methods(str(current_user.id))
    enabled = len(methods) > 0
    
    return MFAStatusResponse(
        enabled=enabled,
        methods=methods
    )


@router.post("/disable")
async def disable_mfa_method(
    request: DisableMethodRequest,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Disable an MFA method.
    """
    mfa_service = MFAService(db)
    
    success = await mfa_service.disable_method(
        str(current_user.id),
        request.method
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="MFA method not found"
        )
    
    return {"message": f"{request.method} disabled successfully"}
