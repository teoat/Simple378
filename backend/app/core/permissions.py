"""
OAuth2 Scopes and Fine-Grained Permissions

This module defines the OAuth2 scopes and permission system for the application.
"""

from enum import Enum
from typing import List, Set
from fastapi import Depends, HTTPException, status
from app.api import deps


class Permission(str, Enum):
    """Fine-grained permission scopes for OAuth2."""
    
    # Case Management
    CASES_READ = "cases:read"
    CASES_WRITE = "cases:write"
    CASES_DELETE = "cases:delete"
    
    # Subject Management
    SUBJECTS_READ = "subjects:read"
    SUBJECTS_WRITE = "subjects:write"
    SUBJECTS_DELETE = "subjects:delete"
    
    # Adjudication
    ADJUDICATION_READ = "adjudication:read"
    ADJUDICATION_APPROVE = "adjudication:approve"
    ADJUDICATION_REJECT = "adjudication:reject"
    
    # Analysis
    ANALYSIS_READ = "analysis:read"
    ANALYSIS_WRITE = "analysis:write"
    
    # Admin Functions
    ADMIN_USERS = "admin:users"
    ADMIN_SYSTEM = "admin:system"
    ADMIN_AUDIT = "admin:audit"
    
    # Ingestion
    INGESTION_UPLOAD = "ingestion:upload"
    INGESTION_DELETE = "ingestion:delete"
    
    # Reports
    REPORTS_READ = "reports:read"
    REPORTS_EXPORT = "reports:export"


class Role(str, Enum):
    """User roles with pre-defined permission sets."""
    
    ADMIN = "admin"
    ANALYST = "analyst"
    AUDITOR = "auditor"
    VIEWER = "viewer"


# Role to Permissions mapping
ROLE_PERMISSIONS: dict[Role, Set[Permission]] = {
    Role.ADMIN: {
        # Full access to everything
        Permission.CASES_READ,
        Permission.CASES_WRITE,
        Permission.CASES_DELETE,
        Permission.SUBJECTS_READ,
        Permission.SUBJECTS_WRITE,
        Permission.SUBJECTS_DELETE,
        Permission.ADJUDICATION_READ,
        Permission.ADJUDICATION_APPROVE,
        Permission.ADJUDICATION_REJECT,
        Permission.ANALYSIS_READ,
        Permission.ANALYSIS_WRITE,
        Permission.ADMIN_USERS,
        Permission.ADMIN_SYSTEM,
        Permission.ADMIN_AUDIT,
        Permission.INGESTION_UPLOAD,
        Permission.INGESTION_DELETE,
        Permission.REPORTS_READ,
        Permission.REPORTS_EXPORT,
    },
    Role.ANALYST: {
        # Can read/write cases and subjects, adjudicate, run analysis
        Permission.CASES_READ,
        Permission.CASES_WRITE,
        Permission.SUBJECTS_READ,
        Permission.SUBJECTS_WRITE,
        Permission.ADJUDICATION_READ,
        Permission.ADJUDICATION_APPROVE,
        Permission.ADJUDICATION_REJECT,
        Permission.ANALYSIS_READ,
        Permission.ANALYSIS_WRITE,
        Permission.INGESTION_UPLOAD,
        Permission.REPORTS_READ,
    },
    Role.AUDITOR: {
        # Read-only access + audit logs
        Permission.CASES_READ,
        Permission.SUBJECTS_READ,
        Permission.ADJUDICATION_READ,
        Permission.ANALYSIS_READ,
        Permission.ADMIN_AUDIT,
        Permission.REPORTS_READ,
        Permission.REPORTS_EXPORT,
    },
    Role.VIEWER: {
        # Read-only access to basic entities
        Permission.CASES_READ,
        Permission.SUBJECTS_READ,
        Permission.ANALYSIS_READ,
        Permission.REPORTS_READ,
    },
}


def get_user_permissions(user) -> Set[Permission]:
    """Get all permissions for a user based on their role."""
    role = Role(user.role) if user.role else Role.VIEWER
    return ROLE_PERMISSIONS.get(role, set())


def require_permission(permission: Permission):
    """Dependency to require a specific permission."""
    async def permission_checker(current_user = Depends(deps.get_current_user)):
        user_permissions = get_user_permissions(current_user)
        
        if permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required: {permission.value}"
            )
        
        return current_user
    
    return permission_checker


def require_any_permission(permissions: List[Permission]):
    """Dependency to require any one of the specified permissions."""
    async def permission_checker(current_user = Depends(deps.get_current_user)):
        user_permissions = get_user_permissions(current_user)
        
        if not any(perm in user_permissions for perm in permissions):
            required = ", ".join(p.value for p in permissions)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required (any): {required}"
            )
        
        return current_user
    
    return permission_checker


def require_all_permissions(permissions: List[Permission]):
    """Dependency to require all of the specified permissions."""
    async def permission_checker(current_user = Depends(deps.get_current_user)):
        user_permissions = get_user_permissions(current_user)
        
        if not all(perm in user_permissions for perm in permissions):
            required = ", ".join(p.value for p in permissions)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required (all): {required}"
            )
        
        return current_user
    
    return permission_checker
