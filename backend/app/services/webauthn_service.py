"""
WebAuthn Service for passwordless/biometric authentication.

Supports:
- Platform authenticators (Touch ID, Face ID, Windows Hello)
- Cross-platform authenticators (Hardware security keys like YubiKey)
- Passkeys
"""
import base64
import secrets
from typing import Dict, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import structlog

from webauthn import (
    generate_registration_options,
    verify_registration_response,
    generate_authentication_options,
    verify_authentication_response,
    options_to_json
)
from webauthn.helpers.structs import (
    PublicKeyCredentialDescriptor,
    AuthenticatorSelectionCriteria,
    UserVerificationRequirement,
    ResidentKeyRequirement,
    AuthenticatorAttachment
)
from webauthn.helpers.cose import COSEAlgorithmIdentifier

from app.db.models import User, WebAuthnCredential
from app.core.config import settings

logger = structlog.get_logger()


class WebAuthnService:
    """Service for WebAuthn/Passkey authentication."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.rp_id = settings.WEBAUTHN_RP_ID  # e.g., "example.com"
        self.rp_name = settings.APP_NAME
        self.origin = settings.FRONTEND_URL
    
    async def generate_registration_options(
        self,
        user_id: str,
        username: str,
        display_name: str,
        require_resident_key: bool = False
    ) -> dict:
        """
        Generate WebAuthn registration options for credential creation.
        
        Args:
            user_id: User's unique identifier
            username: User's username/email
            display_name: User's display name
            require_resident_key: Require credential to be stored on authenticator
        
        Returns:
            Registration options dict for frontend
        """
        # Convert user_id to bytes
        user_id_bytes = user_id.encode('utf-8')
        
        # Get existing credentials to exclude
        result = await self.db.execute(
            select(WebAuthnCredential).where(
                WebAuthnCredential.user_id == user_id
            )
        )
        existing_credentials = result.scalars().all()
        
        exclude_credentials = [
            PublicKeyCredentialDescriptor(
                id=base64.b64decode(cred.credential_id)
            )
            for cred in existing_credentials
        ]
        
        # Generate options
        options = generate_registration_options(
            rp_id=self.rp_id,
            rp_name=self.rp_name,
            user_id=user_id_bytes,
            user_name=username,
            user_display_name=display_name,
            exclude_credentials=exclude_credentials,
            authenticator_selection=AuthenticatorSelectionCriteria(
                resident_key=ResidentKeyRequirement.REQUIRED if require_resident_key else ResidentKeyRequirement.DISCOURAGED,
                user_verification=UserVerificationRequirement.PREFERRED
            ),
            supported_pub_key_algs=[
                COSEAlgorithmIdentifier.ECDSA_SHA_256,
                COSEAlgorithmIdentifier.RSASSA_PKCS1_v1_5_SHA_256,
            ]
        )
        
        # Store challenge for verification
        challenge_b64 = base64.b64encode(options.challenge).decode('utf-8')
        
        # TODO: Store challenge in session/cache with expiry
        # await cache.set(f"webauthn_challenge:{user_id}", challenge_b64, ex=300)
        
        logger.info("WebAuthn registration options generated", user_id=user_id)
        
        return options_to_json(options)
    
    async def verify_registration(
        self,
        user_id: str,
        credential: dict,
        challenge: str
    ) -> bool:
        """
        Verify WebAuthn registration response and store credential.
        
        Args:
            user_id: User's unique identifier
            credential: Registration credential from frontend
            challenge: Challenge that was sent to client
        
        Returns:
            True if registration successful
        """
        try:
            # Verify the registration response
            verification = verify_registration_response(
                credential=credential,
                expected_challenge=base64.b64decode(challenge),
                expected_rp_id=self.rp_id,
                expected_origin=self.origin
            )
            
            # Store the credential
            webauthn_cred = WebAuthnCredential(
                user_id=user_id,
                credential_id=base64.b64encode(verification.credential_id).decode('utf-8'),
                public_key=base64.b64encode(verification.credential_public_key).decode('utf-8'),
                sign_count=verification.sign_count,
                device_type=credential.get('type', 'unknown'),
                transports=credential.get('transports', [])
            )
            
            self.db.add(webauthn_cred)
            await self.db.commit()
            
            logger.info("WebAuthn credential registered", user_id=user_id)
            
            return True
            
        except Exception as e:
            logger.error("WebAuthn registration verification failed", 
                        user_id=user_id, error=str(e))
            return False
    
    async def generate_authentication_options(
        self,
        username: Optional[str] = None
    ) -> dict:
        """
        Generate WebAuthn authentication options.
        
        Args:
            username: Optional username to get allowed credentials
        
        Returns:
            Authentication options dict for frontend
        """
        allowed_credentials = []
        
        if username:
            # Get user's credentials
            result = await self.db.execute(
                select(User).where(User.username == username)
            )
            user = result.scalars().first()
            
            if user:
                result = await self.db.execute(
                    select(WebAuthnCredential).where(
                        WebAuthnCredential.user_id == str(user.id)
                    )
                )
                credentials = result.scalars().all()
                
                allowed_credentials = [
                    PublicKeyCredentialDescriptor(
                        id=base64.b64decode(cred.credential_id),
                        transports=cred.transports
                    )
                    for cred in credentials
                ]
        
        # Generate options
        options = generate_authentication_options(
            rp_id=self.rp_id,
            allow_credentials=allowed_credentials,
            user_verification=UserVerificationRequirement.PREFERRED
        )
        
        # Store challenge
        challenge_b64 = base64.b64encode(options.challenge).decode('utf-8')
        
        # TODO: Store challenge in session/cache
        # await cache.set(f"webauthn_auth_challenge", challenge_b64, ex=300)
        
        logger.info("WebAuthn authentication options generated")
        
        return options_to_json(options)
    
    async def verify_authentication(
        self,
        credential: dict,
        challenge: str
    ) -> Optional[User]:
        """
        Verify WebAuthn authentication response.
        
        Args:
            credential: Authentication assertion from frontend
            challenge: Challenge that was sent to client
        
        Returns:
            User object if authentication successful, None otherwise
        """
        try:
            # Get credential from database
            credential_id_b64 = base64.b64encode(
                base64.b64decode(credential['id'])
            ).decode('utf-8')
            
            result = await self.db.execute(
                select(WebAuthnCredential).where(
                    WebAuthnCredential.credential_id == credential_id_b64
                )
            )
            stored_credential = result.scalars().first()
            
            if not stored_credential:
                logger.warning("WebAuthn credential not found")
                return None
            
            # Verify the authentication response
            verification = verify_authentication_response(
                credential=credential,
                expected_challenge=base64.b64decode(challenge),
                expected_rp_id=self.rp_id,
                expected_origin=self.origin,
                credential_public_key=base64.b64decode(stored_credential.public_key),
                credential_current_sign_count=stored_credential.sign_count
            )
            
            # Update sign count
            stored_credential.sign_count = verification.new_sign_count
            stored_credential.last_used = datetime.utcnow()
            await self.db.commit()
            
            # Get user
            result = await self.db.execute(
                select(User).where(User.id == stored_credential.user_id)
            )
            user = result.scalars().first()
            
            if user:
                logger.info("WebAuthn authentication successful", user_id=str(user.id))
            
            return user
            
        except Exception as e:
            logger.error("WebAuthn authentication verification failed", error=str(e))
            return None
    
    async def get_user_credentials(self, user_id: str) -> list:
        """Get all WebAuthn credentials for a user."""
        result = await self.db.execute(
            select(WebAuthnCredential).where(
                WebAuthnCredential.user_id == user_id
            )
        )
        credentials = result.scalars().all()
        
        return [
            {
                "id": cred.id,
                "device_type": cred.device_type,
                "created_at": cred.created_at.isoformat(),
                "last_used": cred.last_used.isoformat() if cred.last_used else None
            }
            for cred in credentials
        ]
    
    async def delete_credential(self, user_id: str, credential_id: str) -> bool:
        """Delete a WebAuthn credential."""
        result = await self.db.execute(
            select(WebAuthnCredential).where(
                WebAuthnCredential.user_id == user_id,
                WebAuthnCredential.id == credential_id
            )
        )
        credential = result.scalars().first()
        
        if not credential:
            return False
        
        await self.db.delete(credential)
        await self.db.commit()
        
        logger.info("WebAuthn credential deleted", user_id=user_id, credential_id=credential_id)
        
        return True
