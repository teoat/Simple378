"""
Tenant management endpoints for multi-tenant SaaS features.
Provides tenant configuration, feature flags, data residency, and usage quotas.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, List, Optional
from app.schemas.tenant import TenantCreate, TenantUpdate, TenantResponse, TenantConfigUpdate
from app.api import deps
# from app.core.auth import get_current_user # Fixed bad import
from app.db.session import get_db
from app.db.models import User
import os
from datetime import datetime

router = APIRouter(prefix="/tenant", tags=["tenant"])


class TenantConfig:
    """Represents tenant configuration"""
    def __init__(
        self,
        id: str,
        name: str,
        region: str = "us-east",
        plan: str = "standard",
        features: List[str] = None,
        limits: Dict = None,
        compliance_standards: List[str] = None,
    ):
        self.id = id
        self.name = name
        self.region = region
        self.plan = plan
        self.features = features or self._get_default_features(plan)
        self.limits = limits or self._get_default_limits(plan)
        self.compliance_standards = compliance_standards or self._get_default_compliance()

    @staticmethod
    def _get_default_features(plan: str) -> List[str]:
        """Get default feature flags by plan tier"""
        base_features = ["basic_analytics", "audit_logs", "user_management"]
        
        if plan in ["professional", "enterprise"]:
            base_features.extend([
                "advanced_analytics",
                "ai_orchestration",
                "custom_integrations",
                "api_access",
            ])
        
        if plan == "enterprise":
            base_features.extend([
                "real_time_collaboration",
                "sso",
                "dedicated_support",
                "custom_training",
            ])
        
        return base_features

    @staticmethod
    def _get_default_limits(plan: str) -> Dict:
        """Get default usage limits by plan tier"""
        limits = {
            "free": {
                "api_calls_per_month": 10_000,
                "storage_gb": 1,
                "team_members": 2,
                "cases": 5,
            },
            "standard": {
                "api_calls_per_month": 500_000,
                "storage_gb": 100,
                "team_members": 10,
                "cases": 100,
            },
            "professional": {
                "api_calls_per_month": 5_000_000,
                "storage_gb": 1_000,
                "team_members": 50,
                "cases": 1_000,
            },
            "enterprise": {
                "api_calls_per_month": None,  # Unlimited
                "storage_gb": None,  # Unlimited
                "team_members": None,  # Unlimited
                "cases": None,  # Unlimited
            },
        }
        return limits.get(plan, limits["standard"])

    @staticmethod
    def _get_default_compliance() -> List[str]:
        """Get compliance standards for tenant"""
        return ["SOC2", "HIPAA", "GDPR", "CCPA"]

    def to_dict(self) -> Dict:
        """Convert to dictionary for API response"""
        return {
            "id": self.id,
            "name": self.name,
            "region": self.region,
            "plan": self.plan,
            "features": self.features,
            "limits": self.limits,
            "compliance_standards": self.compliance_standards,
            "created_at": datetime.utcnow().isoformat(),
        }


def get_tenant_id_from_env() -> str:
    """Get tenant ID from environment or default to 'default'"""
    return os.getenv("TENANT_ID", "default-tenant")


def get_tenant_config(tenant_id: str) -> TenantConfig:
    """
    Get tenant configuration.
    In production, this would query a tenants table.
    For now, returns mock config based on environment.
    """
    plan = os.getenv("TENANT_PLAN", "professional")
    region = os.getenv("TENANT_REGION", "us-east")
    name = os.getenv("TENANT_NAME", f"Tenant {tenant_id}")
    
    return TenantConfig(
        id=tenant_id,
        name=name,
        region=region,
        plan=plan,
    )


@router.get("/config")
async def get_tenant_configuration(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(get_db),
) -> Dict:
    """
    Get current tenant configuration including feature flags, limits, and compliance info.
    
    Returns:
        - id: Tenant identifier
        - name: Tenant display name
        - region: Data residency region (us-east, eu-west, etc)
        - plan: Subscription plan (free, standard, professional, enterprise)
        - features: List of enabled feature flags
        - limits: Usage limits for this tenant
        - compliance_standards: Standards this tenant complies with
    """
    tenant_id = get_tenant_id_from_env()
    tenant_config = get_tenant_config(tenant_id)
    return tenant_config.to_dict()


@router.get("/features")
async def get_tenant_features(
    current_user: User = Depends(deps.get_current_user),
) -> Dict:
    """
    Get list of enabled features for this tenant.
    Useful for quick feature gate checks.
    """
    tenant_id = get_tenant_id_from_env()
    tenant_config = get_tenant_config(tenant_id)
    
    return {
        "features": tenant_config.features,
        "plan": tenant_config.plan,
    }


@router.get("/feature/{feature_name}")
async def check_feature_enabled(
    feature_name: str,
    current_user: User = Depends(deps.get_current_user),
) -> Dict:
    """
    Check if a specific feature is enabled for this tenant.
    
    Args:
        feature_name: Name of the feature to check (e.g., 'ai_orchestration')
    
    Returns:
        - enabled: Boolean indicating if feature is available
        - feature: The feature name
    """
    tenant_id = get_tenant_id_from_env()
    tenant_config = get_tenant_config(tenant_id)
    
    is_enabled = feature_name in tenant_config.features
    
    return {
        "feature": feature_name,
        "enabled": is_enabled,
    }


@router.get("/limits")
async def get_tenant_limits(
    current_user: User = Depends(deps.get_current_user),
) -> Dict:
    """
    Get usage limits for this tenant.
    """
    tenant_id = get_tenant_id_from_env()
    tenant_config = get_tenant_config(tenant_id)
    
    return {
        "limits": tenant_config.limits,
        "plan": tenant_config.plan,
    }


@router.get("/usage")
async def get_tenant_usage(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(get_db),
) -> Dict:
    """
    Get current usage against limits for this tenant.
    Aggregates data from audit logs and usage tracking tables.
    
    In production, this would query usage tracking tables.
    For now, returns mock usage data.
    """
    tenant_id = get_tenant_id_from_env()
    tenant_config = get_tenant_config(tenant_id)
    limits = tenant_config.limits
    
    # Mock usage calculation
    usage = {
        "api_calls_this_month": 450_000,
        "api_calls_limit": limits.get("api_calls_per_month"),
        "storage_used_gb": 75,
        "storage_limit_gb": limits.get("storage_gb"),
        "team_members_active": 8,
        "team_members_limit": limits.get("team_members"),
        "cases_created": 24,
        "cases_limit": limits.get("cases"),
    }
    
    return {
        "usage": usage,
        "plan": tenant_config.plan,
        "calculated_at": datetime.utcnow().isoformat(),
    }


@router.get("/compliance")
async def get_tenant_compliance(
    current_user: User = Depends(deps.get_current_user),
) -> Dict:
    """
    Get compliance standards and certifications for this tenant.
    """
    tenant_id = get_tenant_id_from_env()
    tenant_config = get_tenant_config(tenant_id)
    
    return {
        "compliance_standards": tenant_config.compliance_standards,
        "data_residency_region": tenant_config.region,
        "gdpr_compliant": True,
        "hipaa_compliant": "HIPAA" in tenant_config.compliance_standards,
        "soc2_compliant": "SOC2" in tenant_config.compliance_standards,
    }


@router.get("/region/{feature_path}")
async def get_api_endpoint_for_region(
    feature_path: str,
    current_user: User = Depends(deps.get_current_user),
) -> Dict:
    """
    Get the appropriate API endpoint for a given feature based on tenant's data residency region.
    
    Args:
        feature_path: The API endpoint path (e.g., 'cases', 'forensics')
    
    Returns:
        - url: Full URL for the regional API endpoint
        - region: Data residency region being used
    """
    tenant_id = get_tenant_id_from_env()
    tenant_config = get_tenant_config(tenant_id)
    
    region_urls = {
        "us-east": "https://api-us-east.example.com/v1",
        "us-west": "https://api-us-west.example.com/v1",
        "eu-west": "https://api-eu-west.example.com/v1",
        "eu-central": "https://api-eu-central.example.com/v1",
        "ap-southeast": "https://api-ap-southeast.example.com/v1",
    }
    
    base_url = region_urls.get(tenant_config.region, region_urls["us-east"])
    
    return {
        "url": f"{base_url}/{feature_path}",
        "region": tenant_config.region,
        "tenant_id": tenant_id,
    }
