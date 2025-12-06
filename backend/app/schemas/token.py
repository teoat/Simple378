from typing import Optional
from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: Optional[str] = None

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    type: Optional[str] = "access"
    jti: Optional[str] = None  # Token ID for blacklisting
