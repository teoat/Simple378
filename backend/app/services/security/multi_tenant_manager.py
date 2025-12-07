from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import AuditLog


class MultiTenantManager:
    """
    Multi-tenant architecture with complete data isolation and tenant management.
    """

    def __init__(self):
        self.tenant_cache: Dict[str, Dict[str, Any]] = {}
        self.isolation_levels = {
            "shared_database": "schema_per_tenant",
            "separate_databases": "database_per_tenant",
            "hybrid": "mixed_isolation",
        }

    async def create_tenant(
        self, tenant_data: Dict[str, Any], db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Create a new tenant with isolated data environment.
        """
        tenant_id = str(uuid.uuid4())
        tenant_name = tenant_data.get("name", f"Tenant-{tenant_id[:8]}")

        # Create tenant record
        tenant_config = {
            "id": tenant_id,
            "name": tenant_name,
            "created_at": datetime.utcnow().isoformat(),
            "status": "active",
            "isolation_level": tenant_data.get("isolation_level", "shared_database"),
            "features": tenant_data.get("features", []),
            "limits": tenant_data.get(
                "limits",
                {
                    "max_users": 100,
                    "max_cases": 1000,
                    "storage_gb": 10,
                    "api_calls_per_month": 100000,
                },
            ),
            "settings": {
                "timezone": tenant_data.get("timezone", "UTC"),
                "currency": tenant_data.get("currency", "USD"),
                "compliance_requirements": tenant_data.get("compliance", []),
                "custom_fields": tenant_data.get("custom_fields", {}),
            },
            "security": {
                "encryption_key": self._generate_encryption_key(),
                "mfa_required": tenant_data.get("mfa_required", False),
                "password_policy": tenant_data.get("password_policy", "standard"),
                "session_timeout": tenant_data.get("session_timeout", 480),  # 8 hours
            },
        }

        # Store tenant configuration (in production, this would be in a separate tenant registry)
        self.tenant_cache[tenant_id] = tenant_config

        # Create tenant schema if using schema-per-tenant isolation
        if tenant_config["isolation_level"] == "shared_database":
            await self._create_tenant_schema(tenant_id, db)

        # Create audit log
        audit_log = AuditLog(
            actor_id=None,  # System action
            action="tenant_created",
            resource_id=tenant_id,
            details={
                "tenant_name": tenant_name,
                "isolation_level": tenant_config["isolation_level"],
                "features": tenant_config["features"],
            },
        )
        db.add(audit_log)
        await db.commit()

        return {
            "tenant_id": tenant_id,
            "status": "created",
            "config": tenant_config,
            "setup_instructions": self._generate_setup_instructions(tenant_config),
        }

    async def _create_tenant_schema(self, tenant_id: str, db: AsyncSession):
        """Create database schema for tenant isolation."""
        schema_name = f"tenant_{tenant_id.replace('-', '_')}"

        # Create tenant schema
        await db.execute(f"CREATE SCHEMA IF NOT EXISTS {schema_name}")

        # Create tenant-specific tables (simplified - in production would use migrations)
        await db.execute(
            f"""
            CREATE TABLE IF NOT EXISTS {schema_name}.tenant_config (
                key VARCHAR(255) PRIMARY KEY,
                value JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        )

        await db.execute(
            f"""
            CREATE TABLE IF NOT EXISTS {schema_name}.tenant_audit (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                action VARCHAR(100),
                actor_id UUID,
                resource_id UUID,
                details JSONB,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        )

        await db.commit()

    def _generate_encryption_key(self) -> str:
        """Generate tenant-specific encryption key."""
        # In production, use proper key management service
        return str(uuid.uuid4()).replace("-", "") + str(uuid.uuid4()).replace("-", "")

    def _generate_setup_instructions(self, tenant_config: Dict[str, Any]) -> List[str]:
        """Generate setup instructions for new tenant."""
        instructions = [
            f"1. Tenant ID: {tenant_config['id']}",
            f"2. Database Schema: tenant_{tenant_config['id'].replace('-', '_')}",
            f"3. Encryption Key: {tenant_config['security']['encryption_key'][:8]}...",
            "4. Configure domain and SSL certificates",
            "5. Set up user authentication and roles",
            "6. Configure compliance settings",
            "7. Set up monitoring and alerting",
            "8. Test tenant isolation and data access",
        ]

        if tenant_config["security"]["mfa_required"]:
            instructions.append("9. Enable MFA for all tenant users")

        return instructions

    async def get_tenant_context(
        self, tenant_id: str, db: AsyncSession
    ) -> Optional[Dict[str, Any]]:
        """
        Get tenant context for request processing.
        """
        if tenant_id in self.tenant_cache:
            return self.tenant_cache[tenant_id]

        # In production, load from tenant registry database
        return None

    async def validate_tenant_access(
        self, tenant_id: str, user_id: str, resource: str, action: str, db: AsyncSession
    ) -> bool:
        """
        Validate if user has access to resource within tenant.
        """
        tenant_context = await self.get_tenant_context(tenant_id, db)
        if not tenant_context:
            return False

        # Check if tenant is active
        if tenant_context.get("status") != "active":
            return False

        # Check resource limits
        if not await self._check_resource_limits(tenant_id, resource, db):
            return False

        # Check user permissions within tenant
        user_permissions = await self._get_user_permissions(tenant_id, user_id, db)

        # Check if action is allowed on resource
        return self._check_permission(user_permissions, resource, action)

    async def _check_resource_limits(
        self, tenant_id: str, resource: str, db: AsyncSession
    ) -> bool:
        """Check if tenant is within resource limits."""
        tenant_context = self.tenant_cache.get(tenant_id)
        if not tenant_context:
            return False

        limits = tenant_context.get("limits", {})

        # Check user count
        if resource == "users":
            user_count = await self._count_tenant_users(tenant_id, db)
            if user_count >= limits.get("max_users", 100):
                return False

        # Check case count
        elif resource == "cases":
            case_count = await self._count_tenant_cases(tenant_id, db)
            if case_count >= limits.get("max_cases", 1000):
                return False

        return True

    async def _count_tenant_users(self, tenant_id: str, db: AsyncSession) -> int:
        """Count users in tenant."""
        # In multi-tenant setup, users would have tenant_id field
        # For now, return mock count
        return 15

    async def _count_tenant_cases(self, tenant_id: str, db: AsyncSession) -> int:
        """Count cases in tenant."""
        # In multi-tenant setup, subjects would have tenant_id field
        # For now, return mock count
        return 450

    async def _get_user_permissions(
        self, tenant_id: str, user_id: str, db: AsyncSession
    ) -> Dict[str, List[str]]:
        """Get user permissions within tenant."""
        # Mock permissions - in production, this would query role-based permissions
        return {
            "cases": ["read", "write", "delete"],
            "reports": ["read", "write"],
            "users": ["read"],
            "settings": ["read"],
        }

    def _check_permission(
        self, permissions: Dict[str, List[str]], resource: str, action: str
    ) -> bool:
        """Check if action is allowed on resource."""
        resource_permissions = permissions.get(resource, [])
        return action in resource_permissions

    async def isolate_tenant_data(
        self, tenant_id: str, query: str, db: AsyncSession
    ) -> str:
        """
        Modify query to ensure tenant data isolation.
        """
        tenant_context = await self.get_tenant_context(tenant_id, db)
        if not tenant_context:
            raise ValueError(f"Tenant {tenant_id} not found")

        isolation_level = tenant_context.get("isolation_level", "shared_database")

        if isolation_level == "shared_database":
            # Add tenant_id filter to queries
            if "WHERE" in query.upper():
                # Insert tenant filter before ORDER BY/GROUP BY/LIMIT
                where_pos = query.upper().find("WHERE")
                filter_clause = f" tenant_id = '{tenant_id}' AND"
                query = query[: where_pos + 6] + filter_clause + query[where_pos + 6 :]
            else:
                # Add WHERE clause
                query += f" WHERE tenant_id = '{tenant_id}'"

        elif isolation_level == "schema_per_tenant":
            # Modify table names to include schema
            schema_name = f"tenant_{tenant_id.replace('-', '_')}"
            # This is a simplified example - real implementation would be more sophisticated
            query = query.replace("FROM subjects", f"FROM {schema_name}.subjects")

        return query

    async def encrypt_tenant_data(self, tenant_id: str, data: str) -> str:
        """Encrypt data using tenant-specific key."""
        tenant_context = self.tenant_cache.get(tenant_id)
        if not tenant_context:
            raise ValueError(f"Tenant {tenant_id} not found")

        encryption_key = tenant_context["security"]["encryption_key"]

        # Simple XOR encryption for demonstration (use proper encryption in production)
        encrypted = ""
        for i, char in enumerate(data):
            key_char = encryption_key[i % len(encryption_key)]
            encrypted += chr(ord(char) ^ ord(key_char))

        return encrypted

    async def decrypt_tenant_data(self, tenant_id: str, encrypted_data: str) -> str:
        """Decrypt data using tenant-specific key."""
        # XOR is symmetric, so same function works for both
        return await self.encrypt_tenant_data(tenant_id, encrypted_data)

    async def audit_tenant_action(
        self,
        tenant_id: str,
        action: str,
        actor_id: str,
        resource_id: str,
        details: Dict[str, Any],
        db: AsyncSession,
    ):
        """Audit action within tenant context."""
        audit_log = AuditLog(
            actor_id=actor_id if actor_id != "system" else None,
            action=action,
            resource_id=resource_id,
            details={**details, "tenant_id": tenant_id, "tenant_context": True},
        )
        db.add(audit_log)
        await db.commit()

    async def get_tenant_metrics(
        self, tenant_id: str, db: AsyncSession
    ) -> Dict[str, Any]:
        """Get tenant usage metrics."""
        tenant_context = self.tenant_cache.get(tenant_id)
        if not tenant_context:
            return {"error": "Tenant not found"}

        # Calculate current usage
        current_users = await self._count_tenant_users(tenant_id, db)
        current_cases = await self._count_tenant_cases(tenant_id, db)

        limits = tenant_context.get("limits", {})

        return {
            "tenant_id": tenant_id,
            "tenant_name": tenant_context.get("name"),
            "usage": {
                "users": {
                    "current": current_users,
                    "limit": limits.get("max_users", 100),
                    "utilization": current_users / limits.get("max_users", 100),
                },
                "cases": {
                    "current": current_cases,
                    "limit": limits.get("max_cases", 1000),
                    "utilization": current_cases / limits.get("max_cases", 1000),
                },
                "storage": {
                    "current_gb": 2.4,  # Mock data
                    "limit_gb": limits.get("storage_gb", 10),
                    "utilization": 0.24,
                },
                "api_calls": {
                    "current_month": 45230,  # Mock data
                    "limit_month": limits.get("api_calls_per_month", 100000),
                    "utilization": 0.45,
                },
            },
            "status": "active",
            "last_updated": datetime.utcnow().isoformat(),
        }

    async def update_tenant_config(
        self, tenant_id: str, updates: Dict[str, Any], db: AsyncSession
    ) -> Dict[str, Any]:
        """Update tenant configuration."""
        if tenant_id not in self.tenant_cache:
            return {"error": "Tenant not found"}

        # Update configuration
        tenant_config = self.tenant_cache[tenant_id]
        for key, value in updates.items():
            if key in tenant_config:
                if isinstance(tenant_config[key], dict):
                    tenant_config[key].update(value)
                else:
                    tenant_config[key] = value

        # Audit the change
        await self.audit_tenant_action(
            tenant_id,
            "tenant_config_updated",
            "system",
            tenant_id,
            {"updates": updates},
            db,
        )

        return {
            "status": "updated",
            "tenant_id": tenant_id,
            "updated_fields": list(updates.keys()),
        }

    async def suspend_tenant(
        self, tenant_id: str, reason: str, db: AsyncSession
    ) -> Dict[str, Any]:
        """Suspend tenant access."""
        if tenant_id not in self.tenant_cache:
            return {"error": "Tenant not found"}

        self.tenant_cache[tenant_id]["status"] = "suspended"
        self.tenant_cache[tenant_id]["suspended_at"] = datetime.utcnow().isoformat()
        self.tenant_cache[tenant_id]["suspension_reason"] = reason

        # Audit suspension
        await self.audit_tenant_action(
            tenant_id, "tenant_suspended", "system", tenant_id, {"reason": reason}, db
        )

        return {
            "status": "suspended",
            "tenant_id": tenant_id,
            "reason": reason,
            "suspended_at": self.tenant_cache[tenant_id]["suspended_at"],
        }

    async def reactivate_tenant(
        self, tenant_id: str, db: AsyncSession
    ) -> Dict[str, Any]:
        """Reactivate suspended tenant."""
        if tenant_id not in self.tenant_cache:
            return {"error": "Tenant not found"}

        if self.tenant_cache[tenant_id].get("status") != "suspended":
            return {"error": "Tenant is not suspended"}

        self.tenant_cache[tenant_id]["status"] = "active"
        self.tenant_cache[tenant_id]["reactivated_at"] = datetime.utcnow().isoformat()

        # Audit reactivation
        await self.audit_tenant_action(
            tenant_id,
            "tenant_reactivated",
            "system",
            tenant_id,
            {"previously_suspended": self.tenant_cache[tenant_id].get("suspended_at")},
            db,
        )

        return {
            "status": "reactivated",
            "tenant_id": tenant_id,
            "reactivated_at": self.tenant_cache[tenant_id]["reactivated_at"],
        }
