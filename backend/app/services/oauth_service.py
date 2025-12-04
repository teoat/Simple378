"""
OAuth/SSO Authentication Service.

Supports:
- Google OAuth 2.0
- Microsoft Azure AD  
- GitHub OAuth
- Generic OAuth 2.0 providers
"""
import httpx
from typing import Dict, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import structlog

from app.db.models import User, OAuthAccount
from app.core.config import settings
from app.core.security import create_access_token

logger = structlog.get_logger()


class OAuthProvider:
    """Base OAuth provider class."""
    
    def __init__(self, name: str, client_id: str, client_secret: str):
        self.name = name
        self.client_id = client_id
        self.client_secret = client_secret
    
    def get_authorization_url(self, state: str, redirect_uri: str) -> str:
        """Get OAuth authorization URL."""
        raise NotImplementedError
    
    async def exchange_code_for_token(self, code: str, redirect_uri: str) -> Dict:
        """Exchange authorization code for access token."""
        raise NotImplementedError
    
    async def get_user_info(self, access_token: str) -> Dict:
        """Get user information from provider."""
        raise NotImplementedError


class GoogleOAuthProvider(OAuthProvider):
    """Google OAuth 2.0 provider."""
    
    AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    TOKEN_URL = "https://oauth2.googleapis.com/token"
    USER_INFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
    
    def __init__(self):
        super().__init__(
            name="google",
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET
        )
    
    def get_authorization_url(self, state: str, redirect_uri: str) -> str:
        """Get Google OAuth authorization URL."""
        params = {
            "client_id": self.client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "access_type": "offline",
            "prompt": "consent"
        }
        
        query_string = "&".join(f"{k}={v}" for k, v in params.items())
        return f"{self.AUTHORIZATION_URL}?{query_string}"
    
    async def exchange_code_for_token(self, code: str, redirect_uri: str) -> Dict:
        """Exchange Google authorization code for tokens."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.TOKEN_URL,
                data={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "code": code,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code"
                }
            )
            response.raise_for_status()
            return response.json()
    
    async def get_user_info(self, access_token: str) -> Dict:
        """Get Google user information."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self.USER_INFO_URL,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            response.raise_for_status()
            data = response.json()
            
            return {
                "provider_user_id": data["id"],
                "email": data["email"],
                "name": data.get("name"),
                "picture": data.get("picture"),
                "email_verified": data.get("verified_email", False)
            }


class MicrosoftOAuthProvider(OAuthProvider):
    """Microsoft Azure AD OAuth provider."""
    
    AUTHORIZATION_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
    TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
    USER_INFO_URL = "https://graph.microsoft.com/v1.0/me"
    
    def __init__(self):
        super().__init__(
            name="microsoft",
            client_id=settings.MICROSOFT_CLIENT_ID,
            client_secret=settings.MICROSOFT_CLIENT_SECRET
        )
    
    def get_authorization_url(self, state: str, redirect_uri: str) -> str:
        """Get Microsoft OAuth authorization URL."""
        params = {
            "client_id": self.client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "openid email profile User.Read",
            "state": state,
            "response_mode": "query"
        }
        
        query_string = "&".join(f"{k}={v}" for k, v in params.items())
        return f"{self.AUTHORIZATION_URL}?{query_string}"
    
    async def exchange_code_for_token(self, code: str, redirect_uri: str) -> Dict:
        """Exchange Microsoft authorization code for tokens."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.TOKEN_URL,
                data={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "code": code,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code"
                }
            )
            response.raise_for_status()
            return response.json()
    
    async def get_user_info(self, access_token: str) -> Dict:
        """Get Microsoft user information."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self.USER_INFO_URL,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            response.raise_for_status()
            data = response.json()
            
            return {
                "provider_user_id": data["id"],
                "email": data.get("mail") or data.get("userPrincipalName"),
                "name": data.get("displayName"),
                "picture": None,  # Requires separate API call
                "email_verified": True  # Azure AD emails are verified
            }


class GitHubOAuthProvider(OAuthProvider):
    """GitHub OAuth provider."""
    
    AUTHORIZATION_URL = "https://github.com/login/oauth/authorize"
    TOKEN_URL = "https://github.com/login/oauth/access_token"
    USER_INFO_URL = "https://api.github.com/user"
    
    def __init__(self):
        super().__init__(
            name="github",
            client_id=settings.GITHUB_CLIENT_ID,
            client_secret=settings.GITHUB_CLIENT_SECRET
        )
    
    def get_authorization_url(self, state: str, redirect_uri: str) -> str:
        """Get GitHub OAuth authorization URL."""
        params = {
            "client_id": self.client_id,
            "redirect_uri": redirect_uri,
            "scope": "read:user user:email",
            "state": state
        }
        
        query_string = "&".join(f"{k}={v}" for k, v in params.items())
        return f"{self.AUTHORIZATION_URL}?{query_string}"
    
    async def exchange_code_for_token(self, code: str, redirect_uri: str) -> Dict:
        """Exchange GitHub authorization code for tokens."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.TOKEN_URL,
                data={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "code": code,
                    "redirect_uri": redirect_uri
                },
                headers={"Accept": "application/json"}
            )
            response.raise_for_status()
            return response.json()
    
    async def get_user_info(self, access_token: str) -> Dict:
        """Get GitHub user information."""
        async with httpx.AsyncClient() as client:
            # Get user profile
            response = await client.get(
                self.USER_INFO_URL,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            response.raise_for_status()
            data = response.json()
            
            # Get primary email
            email_response = await client.get(
                "https://api.github.com/user/emails",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            emails = email_response.json()
            primary_email = next(
                (e["email"] for e in emails if e["primary"]),
                data.get("email")
            )
            
            return {
                "provider_user_id": str(data["id"]),
                "email": primary_email,
                "name": data.get("name") or data.get("login"),
                "picture": data.get("avatar_url"),
                "email_verified": True
            }


class OAuthService:
    """OAuth/SSO service for handling authentication."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.providers = {
            "google": GoogleOAuthProvider(),
            "microsoft": MicrosoftOAuthProvider(),
            "github": GitHubOAuthProvider()
        }
    
    def get_provider(self, provider_name: str) -> OAuthProvider:
        """Get OAuth provider by name."""
        provider = self.providers.get(provider_name)
        if not provider:
            raise ValueError(f"Unknown OAuth provider: {provider_name}")
        return provider
    
    def get_authorization_url(
        self,
        provider_name: str,
        state: str,
        redirect_uri: str
    ) -> str:
        """Get OAuth authorization URL."""
        provider = self.get_provider(provider_name)
        return provider.get_authorization_url(state, redirect_uri)
    
    async def handle_callback(
        self,
        provider_name: str,
        code: str,
        redirect_uri: str
    ) -> Tuple[User, str]:
        """
        Handle OAuth callback and return user + JWT token.
        
        Returns:
            (User, access_token)
        """
        provider = self.get_provider(provider_name)
        
        # Exchange code for token
        token_data = await provider.exchange_code_for_token(code, redirect_uri)
        access_token = token_data["access_token"]
        refresh_token = token_data.get("refresh_token")
        
        # Get user info from provider
        user_info = await provider.get_user_info(access_token)
        
        # Find or create OAuth account
        result = await self.db.execute(
            select(OAuthAccount).where(
                OAuthAccount.provider == provider_name,
                OAuthAccount.provider_user_id == user_info["provider_user_id"]
            )
        )
        oauth_account = result.scalars().first()
        
        if oauth_account:
            # Update token
            oauth_account.access_token = access_token
            oauth_account.refresh_token = refresh_token
            oauth_account.updated_at = datetime.utcnow()
            await self.db.commit()
            
            # Get user
            result = await self.db.execute(
                select(User).where(User.id == oauth_account.user_id)
            )
            user = result.scalars().first()
            
            logger.info("OAuth login", provider=provider_name, user_id=str(user.id))
        else:
            # Create new user and OAuth account
            user = await self._create_user_from_oauth(user_info)
            
            oauth_account = OAuthAccount(
                user_id=user.id,
                provider=provider_name,
                provider_user_id=user_info["provider_user_id"],
                access_token=access_token,
                refresh_token=refresh_token
            )
            
            self.db.add(oauth_account)
            await self.db.commit()
            
            logger.info("OAuth account created", 
                       provider=provider_name,
                       user_id=str(user.id))
        
        # Create JWT for our application
        jwt_token = create_access_token(str(user.id))
        
        return user, jwt_token
    
    async def _create_user_from_oauth(self, user_info: Dict) -> User:
        """Create new user from OAuth user info."""
        from app.core.security import get_password_hash
        import uuid
        
        # Generate random password (not used for OAuth login)
        random_password = get_password_hash(str(uuid.uuid4()))
        
        user = User(
            username=user_info["email"].split("@")[0],  # Use email prefix as username
            email=user_info["email"],
            hashed_password=random_password,
            is_active=True,
            email_verified=user_info.get("email_verified", False)
        )
        
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        
        return user
    
    async def refresh_token(
        self,
        provider_name: str,
        refresh_token: str
    ) -> str:
        """Refresh OAuth access token."""
        # Implementation depends on provider
        # Most providers support refresh token flow
        pass
    
    async def get_linked_accounts(self, user_id: str) -> list:
        """Get all OAuth accounts linked to user."""
        result = await self.db.execute(
            select(OAuthAccount).where(OAuthAccount.user_id == user_id)
        )
        accounts = result.scalars().all()
        
        return [
            {
                "provider": account.provider,
                "linked_at": account.created_at.isoformat()
            }
            for account in accounts
        ]
    
    async def unlink_account(self, user_id: str, provider: str) -> bool:
        """Unlink OAuth account."""
        result = await self.db.execute(
            select(OAuthAccount).where(
                OAuthAccount.user_id == user_id,
                OAuthAccount.provider == provider
            )
        )
        account = result.scalars().first()
        
        if not account:
            return False
        
        await self.db.delete(account)
        await self.db.commit()
        
        logger.info("OAuth account unlinked", user_id=user_id, provider=provider)
        
        return True
