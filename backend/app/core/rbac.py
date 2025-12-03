from fastapi import HTTPException, Depends
from typing import List
from app.api.deps import get_current_user
from app.db.models import User

def require_roles(allowed_roles: List[str]):
    """
    Dependency to enforce role-based access control.
    
    Usage:
        @router.get("/admin-only", dependencies=[Depends(require_roles(["admin"]))])
        async def admin_endpoint():
            ...
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker

# Convenience decorators
def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require admin role."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def require_analyst(current_user: User = Depends(get_current_user)) -> User:
    """Require analyst or higher role."""
    if current_user.role not in ["analyst", "senior_analyst", "admin"]:
        raise HTTPException(status_code=403, detail="Analyst access required")
    return current_user
