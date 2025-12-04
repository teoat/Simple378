"""
Multi-Factor Authentication (MFA) Service

Supports multiple MFA methods:
- TOTP (Time-based One-Time Password) - Google Authenticator, Authy
- SMS OTP - Text message codes
- Email OTP - Email verification codes  
- Backup codes - Recovery codes
"""
import pyotp
import secrets
import hashlib
from typing import List, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import structlog

from app.db.models import User, UserMFA, MFABackupCode
from app.core.config import settings

logger = structlog.get_logger()


class MFAService:
    """Service for managing multi-factor authentication."""
    
    # OTP Configuration
    OTP_VALIDITY_SECONDS = 300  # 5 minutes
    TOTP_INTERVAL = 30  # 30 seconds
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    # ==================== TOTP Methods ====================
    
    async def setup_totp(self, user_id: str) -> Tuple[str, str]:
        """
        Generate TOTP secret for user.
        
        Returns:
            (secret, provisioning_uri) for QR code generation
        """
        # Generate secret
        secret = pyotp.random_base32()
        
        # Get user for provisioning URI
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalars().first()
        
        if not user:
            raise ValueError("User not found")
        
        # Generate provisioning URI for QR code
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(
            name=user.email,
            issuer_name=settings.APP_NAME
        )
        
        # Store encrypted secret (will be enabled after verification)
        mfa_record = UserMFA(
            user_id=user_id,
            method='totp',
            secret=self._encrypt_secret(secret),
            enabled=False
        )
        
        self.db.add(mfa_record)
        await self.db.commit()
        
        logger.info("TOTP setup initiated", user_id=user_id)
        
        return secret, provisioning_uri
    
    async def verify_totp_setup(self, user_id: str, code: str) -> bool:
        """
        Verify TOTP code during setup and enable if valid.
        """
        result = await self.db.execute(
            select(UserMFA).where(
                UserMFA.user_id == user_id,
                UserMFA.method == 'totp',
                UserMFA.enabled == False
            )
        )
        mfa_record = result.scalars().first()
        
        if not mfa_record:
            return False
        
        secret = self._decrypt_secret(mfa_record.secret)
        totp = pyotp.TOTP(secret)
        
        if totp.verify(code, valid_window=1):
            mfa_record.enabled = True
            await self.db.commit()
            logger.info("TOTP enabled", user_id=user_id)
            return True
        
        return False
    
    async def verify_totp(self, user_id: str, code: str) -> bool:
        """Verify TOTP code during login."""
        result = await self.db.execute(
            select(UserMFA).where(
                UserMFA.user_id == user_id,
                UserMFA.method == 'totp',
                UserMFA.enabled == True
            )
        )
        mfa_record = result.scalars().first()
        
        if not mfa_record:
            return False
        
        secret = self._decrypt_secret(mfa_record.secret)
        totp = pyotp.TOTP(secret)
        
        is_valid = totp.verify(code, valid_window=1)
        
        if is_valid:
            logger.info("TOTP verified", user_id=user_id)
        else:
            logger.warning("TOTP verification failed", user_id=user_id)
        
        return is_valid
    
    # ==================== SMS OTP Methods ====================
    
    async def send_sms_otp(self, user_id: str, phone: str) -> str:
        """Send OTP via SMS."""
        # Generate 6-digit code
        code = secrets.randbelow(1000000)
        code_str = f"{code:06d}"
        
        # Store code hash with expiry
        code_hash = self._hash_code(code_str)
        
        mfa_record = UserMFA(
            user_id=user_id,
            method='sms',
            phone=phone,
            secret=code_hash,
            expires_at=datetime.utcnow() + timedelta(seconds=self.OTP_VALIDITY_SECONDS),
            enabled=True
        )
        
        self.db.add(mfa_record)
        await self.db.commit()
        
        # TODO: Integrate with SMS service (Twilio)
        # await sms_service.send(phone, f"Your verification code is: {code_str}")
        
        logger.info("SMS OTP sent", user_id=user_id, phone_last4=phone[-4:])
        
        return code_str  # Only for development/testing
    
    async def verify_sms_otp(self, user_id: str, code: str) -> bool:
        """Verify SMS OTP code."""
        result = await self.db.execute(
            select(UserMFA).where(
                UserMFA.user_id == user_id,
                UserMFA.method == 'sms',
                UserMFA.enabled == True
            ).order_by(UserMFA.created_at.desc())
        )
        mfa_record = result.scalars().first()
        
        if not mfa_record:
            return False
        
        # Check expiry
        if mfa_record.expires_at and mfa_record.expires_at < datetime.utcnow():
            logger.warning("SMS OTP expired", user_id=user_id)
            return False
        
        code_hash = self._hash_code(code)
        is_valid = code_hash == mfa_record.secret
        
        if is_valid:
            # Invalidate after use
            await self.db.delete(mfa_record)
            await self.db.commit()
            logger.info("SMS OTP verified", user_id=user_id)
        else:
            logger.warning("SMS OTP verification failed", user_id=user_id)
        
        return is_valid
    
    # ==================== Email OTP Methods ====================
    
    async def send_email_otp(self, user_id: str, email: str) -> str:
        """Send OTP via email."""
        # Generate 6-digit code
        code = secrets.randbelow(1000000)
        code_str = f"{code:06d}"
        
        code_hash = self._hash_code(code_str)
        
        mfa_record = UserMFA(
            user_id=user_id,
            method='email',
            email=email,
            secret=code_hash,
            expires_at=datetime.utcnow() + timedelta(seconds=self.OTP_VALIDITY_SECONDS),
            enabled=True
        )
        
        self.db.add(mfa_record)
        await self.db.commit()
        
        # TODO: Integrate with email service
        # await email_service.send_otp(email, code_str)
        
        logger.info("Email OTP sent", user_id=user_id, email=email)
        
        return code_str  # Only for development/testing
    
    async def verify_email_otp(self, user_id: str, code: str) -> bool:
        """Verify email OTP code."""
        result = await self.db.execute(
            select(UserMFA).where(
                UserMFA.user_id == user_id,
                UserMFA.method == 'email',
                UserMFA.enabled == True
            ).order_by(UserMFA.created_at.desc())
        )
        mfa_record = result.scalars().first()
        
        if not mfa_record:
            return False
        
        # Check expiry
        if mfa_record.expires_at and mfa_record.expires_at < datetime.utcnow():
            logger.warning("Email OTP expired", user_id=user_id)
            return False
        
        code_hash = self._hash_code(code)
        is_valid = code_hash == mfa_record.secret
        
        if is_valid:
            await self.db.delete(mfa_record)
            await self.db.commit()
            logger.info("Email OTP verified", user_id=user_id)
        else:
            logger.warning("Email OTP verification failed", user_id=user_id)
        
        return is_valid
    
    # ==================== Backup Codes Methods ====================
    
    async def generate_backup_codes(self, user_id: str, count: int = 10) -> List[str]:
        """
        Generate backup recovery codes.
        
        Returns list of codes to show to user (store securely).
        """
        codes = []
        
        for _ in range(count):
            # Generate 8-character alphanumeric code
            code = secrets.token_hex(4).upper()
            codes.append(code)
            
            # Store hashed version
            backup_code = MFABackupCode(
                user_id=user_id,
                code_hash=self._hash_code(code),
                used=False
            )
            self.db.add(backup_code)
        
        await self.db.commit()
        
        logger.info("Backup codes generated", user_id=user_id, count=count)
        
        return codes
    
    async def verify_backup_code(self, user_id: str, code: str) -> bool:
        """Verify and invalidate backup code."""
        code_hash = self._hash_code(code.upper())
        
        result = await self.db.execute(
            select(MFABackupCode).where(
                MFABackupCode.user_id == user_id,
                MFABackupCode.code_hash == code_hash,
                MFABackupCode.used == False
            )
        )
        backup_code = result.scalars().first()
        
        if not backup_code:
            logger.warning("Invalid backup code", user_id=user_id)
            return False
        
        # Mark as used
        backup_code.used = True
        await self.db.commit()
        
        logger.info("Backup code verified and invalidated", user_id=user_id)
        
        return True
    
    # ==================== Helper Methods ====================
    
    async def get_enabled_methods(self, user_id: str) -> List[str]:
        """Get list of enabled MFA methods for user."""
        result = await self.db.execute(
            select(UserMFA.method).where(
                UserMFA.user_id == user_id,
                UserMFA.enabled == True
            ).distinct()
        )
        methods = [row[0] for row in result.all()]
        
        return methods
    
    async def disable_method(self, user_id: str, method: str) -> bool:
        """Disable an MFA method."""
        result = await self.db.execute(
            select(UserMFA).where(
                UserMFA.user_id == user_id,
                UserMFA.method == method
            )
        )
        mfa_record = result.scalars().first()
        
        if not mfa_record:
            return False
        
        await self.db.delete(mfa_record)
        await self.db.commit()
        
        logger.info("MFA method disabled", user_id=user_id, method=method)
        
        return True
    
    async def is_mfa_enabled(self, user_id: str) -> bool:
        """Check if user has any MFA method enabled."""
        methods = await self.get_enabled_methods(user_id)
        return len(methods) > 0
    
    def _encrypt_secret(self, secret: str) -> str:
        """Encrypt MFA secret (simplified - use proper encryption in production)."""
        # TODO: Use proper encryption (Fernet, AES-256-GCM)
        return secret  # Placeholder
    
    def _decrypt_secret(self, encrypted: str) -> str:
        """Decrypt MFA secret."""
        # TODO: Use proper decryption
        return encrypted  # Placeholder
    
    def _hash_code(self, code: str) -> str:
        """Hash verification code."""
        return hashlib.sha256(
            f"{code}{settings.SECRET_KEY}".encode()
        ).hexdigest()
