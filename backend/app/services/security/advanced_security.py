from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import secrets
import base64
import pyotp
import qrcode
from io import BytesIO
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from app.db.models import User, AuditLog
from app.core.security import create_access_token, verify_password


class AdvancedSecurityManager:
    """
    Advanced security features including MFA, RBAC, encryption, and threat detection.
    """

    def __init__(self):
        self.encryption_key = self._load_master_key()
        self.session_store: Dict[str, Dict[str, Any]] = {}
        self.threat_patterns: Dict[str, Any] = self._load_threat_patterns()

    def _load_master_key(self) -> bytes:
        """Load master encryption key."""
        # In production, this would be loaded from a secure key management service
        return secrets.token_bytes(32)

    def _load_threat_patterns(self) -> Dict[str, Any]:
        """Load known threat patterns for detection."""
        return {
            "brute_force": {
                "max_attempts": 5,
                "window_minutes": 15,
                "block_duration_minutes": 30,
            },
            "suspicious_ips": [
                "192.168.1.100",  # Example - would be loaded from threat intelligence
            ],
            "suspicious_user_agents": ["MaliciousBot/1.0", "VulnerabilityScanner"],
            "sql_injection_patterns": [
                "UNION SELECT",
                "DROP TABLE",
                "SCRIPT>",
                "<SCRIPT",
            ],
            "xss_patterns": ["<SCRIPT", "JAVASCRIPT:", "ONLOAD=", "ONERROR="],
        }

    async def setup_mfa(self, user_id: str, db: AsyncSession) -> Dict[str, Any]:
        """
        Set up Multi-Factor Authentication for user.
        """
        # Generate TOTP secret
        secret = pyotp.random_base32()

        # Create TOTP object
        totp = pyotp.TOTP(secret)

        # Generate QR code for authenticator apps
        provisioning_uri = totp.provisioning_uri(
            name=f"FraudDetection:{user_id}", issuer_name="AntiGravity Fraud Detection"
        )

        # Generate QR code image
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(provisioning_uri)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()

        # Store MFA setup temporarily (would be stored securely in production)
        setup_token = secrets.token_urlsafe(32)
        self.session_store[setup_token] = {
            "user_id": user_id,
            "secret": secret,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(minutes=10),
        }

        return {
            "setup_token": setup_token,
            "qr_code": qr_code_base64,
            "secret": secret,  # In production, don't return this
            "instructions": [
                "1. Install an authenticator app (Google Authenticator, Authy, etc.)",
                "2. Scan the QR code or manually enter the secret key",
                "3. Enter the 6-digit code to complete setup",
            ],
        }

    async def verify_mfa_setup(
        self, setup_token: str, verification_code: str, db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Verify MFA setup with verification code.
        """
        if setup_token not in self.session_store:
            return {"error": "Invalid or expired setup token"}

        setup_data = self.session_store[setup_token]

        # Check expiration
        if datetime.utcnow() > setup_data["expires_at"]:
            del self.session_store[setup_token]
            return {"error": "Setup token expired"}

        # Verify TOTP code
        totp = pyotp.TOTP(setup_data["secret"])
        if not totp.verify(verification_code):
            return {"error": "Invalid verification code"}

        # Update user with MFA secret
        user_id = setup_data["user_id"]
        user_result = await db.execute(select(User).where(User.id == user_id))
        user = user_result.scalars().first()

        if user:
            # Store MFA secret (in production, encrypt this)
            user.mfa_secret = setup_data["secret"]
            user.mfa_enabled = True
            db.add(user)

            # Audit MFA setup
            audit_log = AuditLog(
                actor_id=user_id,
                action="mfa_enabled",
                resource_id=user_id,
                details={"method": "totp", "timestamp": datetime.utcnow().isoformat()},
            )
            db.add(audit_log)

            await db.commit()

        # Clean up setup data
        del self.session_store[setup_token]

        return {
            "status": "success",
            "message": "MFA has been successfully enabled",
            "user_id": user_id,
        }

    async def authenticate_with_mfa(
        self, user_id: str, password: str, mfa_code: str, db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Authenticate user with password and MFA.
        """
        # Verify password first
        user_result = await db.execute(select(User).where(User.id == user_id))
        user = user_result.scalars().first()

        if not user or not verify_password(password, user.hashed_password):
            return {"error": "Invalid credentials"}

        # Verify MFA if enabled
        if user.mfa_enabled and user.mfa_secret:
            totp = pyotp.TOTP(user.mfa_secret)
            if not totp.verify(mfa_code):
                # Log failed MFA attempt
                audit_log = AuditLog(
                    actor_id=user_id,
                    action="mfa_failed",
                    resource_id=user_id,
                    details={
                        "reason": "invalid_code",
                        "timestamp": datetime.utcnow().isoformat(),
                    },
                )
                db.add(audit_log)
                await db.commit()

                return {"error": "Invalid MFA code"}

        # Generate access token
        access_token = create_access_token({"sub": str(user.id)})

        # Log successful authentication
        audit_log = AuditLog(
            actor_id=user_id,
            action="login_success",
            resource_id=user_id,
            details={"method": "mfa", "timestamp": datetime.utcnow().isoformat()},
        )
        db.add(audit_log)
        await db.commit()

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "mfa_enabled": user.mfa_enabled,
            },
        }

    async def setup_rbac(self, db: AsyncSession) -> Dict[str, Any]:
        """
        Set up Role-Based Access Control system.
        """
        # Define roles and permissions
        roles = {
            "super_admin": {
                "name": "Super Administrator",
                "permissions": ["*"],  # All permissions
                "description": "Full system access",
            },
            "tenant_admin": {
                "name": "Tenant Administrator",
                "permissions": [
                    "tenant.read",
                    "tenant.write",
                    "tenant.delete",
                    "user.read",
                    "user.write",
                    "user.delete",
                    "case.read",
                    "case.write",
                    "case.delete",
                    "report.read",
                    "report.write",
                    "report.delete",
                    "audit.read",
                ],
                "description": "Full tenant administration",
            },
            "compliance_officer": {
                "name": "Compliance Officer",
                "permissions": [
                    "case.read",
                    "case.write",
                    "report.read",
                    "report.write",
                    "audit.read",
                    "audit.write",
                    "compliance.read",
                    "compliance.write",
                ],
                "description": "Compliance monitoring and reporting",
            },
            "investigator": {
                "name": "Fraud Investigator",
                "permissions": [
                    "case.read",
                    "case.write",
                    "evidence.read",
                    "evidence.write",
                    "report.read",
                    "ai.read",
                    "ai.predict",
                ],
                "description": "Case investigation and analysis",
            },
            "analyst": {
                "name": "Data Analyst",
                "permissions": [
                    "case.read",
                    "report.read",
                    "report.write",
                    "analytics.read",
                    "dashboard.read",
                ],
                "description": "Data analysis and reporting",
            },
            "viewer": {
                "name": "Viewer",
                "permissions": ["case.read", "report.read", "dashboard.read"],
                "description": "Read-only access",
            },
        }

        # In production, these would be stored in a roles/permissions table
        # For now, we'll return the role definitions

        return {
            "roles": roles,
            "permissions_hierarchy": {
                "admin": ["write", "delete"],
                "editor": ["write"],
                "viewer": ["read"],
            },
            "setup_complete": True,
        }

    async def check_permission(
        self, user_id: str, resource: str, action: str, db: AsyncSession
    ) -> bool:
        """
        Check if user has permission for action on resource.
        """
        # Get user and their roles
        user_result = await db.execute(select(User).where(User.id == user_id))
        user = user_result.scalars().first()

        if not user:
            return False

        # Get user roles (simplified - in production would be a many-to-many relationship)
        user_roles = getattr(user, "roles", ["viewer"])  # Default to viewer

        # Check permissions for each role
        for role in user_roles:
            if await self._role_has_permission(role, resource, action):
                return True

        return False

    async def _role_has_permission(self, role: str, resource: str, action: str) -> bool:
        """Check if role has specific permission."""
        # Simplified permission checking - in production would query permissions table
        role_permissions = {
            "super_admin": ["*"],
            "tenant_admin": ["tenant.*", "user.*", "case.*", "report.*", "audit.*"],
            "compliance_officer": ["case.*", "report.*", "audit.*", "compliance.*"],
            "investigator": ["case.*", "evidence.*", "report.read", "ai.*"],
            "analyst": ["case.read", "report.*", "analytics.*", "dashboard.*"],
            "viewer": ["*.read", "dashboard.read"],
        }

        permissions = role_permissions.get(role, [])

        # Check for wildcard permissions
        for permission in permissions:
            if (
                permission == "*"
                or permission == f"{resource}.*"
                or permission == f"*.{action}"
                or permission == f"{resource}.{action}"
            ):
                return True

        return False

    async def encrypt_sensitive_data(
        self, data: str, tenant_id: Optional[str] = None
    ) -> str:
        """
        Encrypt sensitive data using AES-256.
        """
        from cryptography.fernet import Fernet
        import base64

        # Use tenant-specific key if provided, otherwise use master key
        if tenant_id:
            # In production, get tenant-specific key from key management service
            key = base64.urlsafe_b64encode(self.encryption_key[:32])
        else:
            key = base64.urlsafe_b64encode(self.encryption_key)

        fernet = Fernet(key)
        encrypted = fernet.encrypt(data.encode())
        return base64.urlsafe_b64encode(encrypted).decode()

    async def decrypt_sensitive_data(
        self, encrypted_data: str, tenant_id: Optional[str] = None
    ) -> str:
        """
        Decrypt sensitive data.
        """
        from cryptography.fernet import Fernet
        import base64

        # Use tenant-specific key if provided
        if tenant_id:
            key = base64.urlsafe_b64encode(self.encryption_key[:32])
        else:
            key = base64.urlsafe_b64encode(self.encryption_key)

        fernet = Fernet(key)
        encrypted_bytes = base64.urlsafe_b64decode(encrypted_data)
        decrypted = fernet.decrypt(encrypted_bytes)
        return decrypted.decode()

    async def detect_security_threats(
        self, request_data: Dict[str, Any], db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Detect security threats in requests.
        """
        threats_detected = []
        risk_score = 0

        # Check for brute force attempts
        ip_address = request_data.get("ip_address", "")
        if ip_address:
            failed_attempts = await self._count_recent_failures(ip_address, db)
            if failed_attempts >= self.threat_patterns["brute_force"]["max_attempts"]:
                threats_detected.append(
                    {
                        "type": "brute_force",
                        "severity": "high",
                        "description": f"Multiple failed login attempts from {ip_address}",
                    }
                )
                risk_score += 80

        # Check for suspicious IP addresses
        if ip_address in self.threat_patterns["suspicious_ips"]:
            threats_detected.append(
                {
                    "type": "suspicious_ip",
                    "severity": "high",
                    "description": f"Request from known suspicious IP: {ip_address}",
                }
            )
            risk_score += 90

        # Check for malicious user agents
        user_agent = request_data.get("user_agent", "")
        for suspicious_ua in self.threat_patterns["suspicious_user_agents"]:
            if suspicious_ua.lower() in user_agent.lower():
                threats_detected.append(
                    {
                        "type": "suspicious_user_agent",
                        "severity": "medium",
                        "description": f"Suspicious user agent detected: {user_agent}",
                    }
                )
                risk_score += 60

        # Check for SQL injection patterns
        query_params = request_data.get("query_params", "")
        for pattern in self.threat_patterns["sql_injection_patterns"]:
            if pattern in query_params.upper():
                threats_detected.append(
                    {
                        "type": "sql_injection_attempt",
                        "severity": "critical",
                        "description": f"Potential SQL injection detected: {pattern}",
                    }
                )
                risk_score += 100

        # Check for XSS patterns
        for pattern in self.threat_patterns["xss_patterns"]:
            if pattern in str(request_data):
                threats_detected.append(
                    {
                        "type": "xss_attempt",
                        "severity": "high",
                        "description": f"Potential XSS attack detected: {pattern}",
                    }
                )
                risk_score += 85

        # Log threats if detected
        if threats_detected:
            audit_log = AuditLog(
                actor_id=None,  # System detection
                action="security_threat_detected",
                resource_id=None,
                details={
                    "threats": threats_detected,
                    "risk_score": risk_score,
                    "request_data": request_data,
                    "timestamp": datetime.utcnow().isoformat(),
                },
            )
            db.add(audit_log)
            await db.commit()

        return {
            "threats_detected": threats_detected,
            "risk_score": min(risk_score, 100),
            "recommendations": self._generate_security_recommendations(
                threats_detected, risk_score
            ),
        }

    async def _count_recent_failures(self, ip_address: str, db: AsyncSession) -> int:
        """Count recent authentication failures from IP."""
        fifteen_minutes_ago = datetime.utcnow() - timedelta(minutes=15)

        result = await db.execute(
            select(func.count(AuditLog.id)).where(
                and_(
                    AuditLog.action.in_(["login_failed", "mfa_failed"]),
                    AuditLog.details.contains({"ip_address": ip_address}),
                    AuditLog.timestamp >= fifteen_minutes_ago,
                )
            )
        )

        return result.scalar() or 0

    def _generate_security_recommendations(
        self, threats: List[Dict[str, Any]], risk_score: int
    ) -> List[str]:
        """Generate security recommendations based on threats."""
        recommendations = []

        if risk_score >= 90:
            recommendations.extend(
                [
                    "🚨 CRITICAL: Block IP address immediately",
                    "🔍 Initiate security incident response",
                    "📞 Notify security team",
                    "🛡️ Enable emergency security protocols",
                ]
            )
        elif risk_score >= 70:
            recommendations.extend(
                [
                    "⚠️ HIGH RISK: Monitor IP address closely",
                    "🔒 Temporarily restrict access",
                    "📊 Review security logs",
                    "👥 Alert security personnel",
                ]
            )
        elif risk_score >= 50:
            recommendations.extend(
                [
                    "⚡ MEDIUM RISK: Log and monitor activity",
                    "👁️ Increase monitoring frequency",
                    "📝 Document incident",
                    "🔍 Review access patterns",
                ]
            )

        # Specific recommendations based on threat types
        threat_types = [t["type"] for t in threats]

        if "sql_injection_attempt" in threat_types:
            recommendations.append("🛡️ Review and update WAF rules for SQL injection")

        if "xss_attempt" in threat_types:
            recommendations.append("🛡️ Implement additional XSS protection measures")

        if "brute_force" in threat_types:
            recommendations.append("🔒 Implement rate limiting and CAPTCHA")

        return recommendations

    async def generate_security_report(
        self, tenant_id: Optional[str], db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Generate comprehensive security report.
        """
        # Get security metrics
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)

        # Authentication metrics
        auth_metrics = await db.execute(
            select(
                func.count(AuditLog.id).label("total_events"),
                func.sum(
                    func.case((AuditLog.action == "login_success", 1), else_=0)
                ).label("successful_logins"),
                func.sum(
                    func.case((AuditLog.action == "login_failed", 1), else_=0)
                ).label("failed_logins"),
            ).where(
                and_(
                    AuditLog.action.in_(
                        ["login_success", "login_failed", "mfa_failed"]
                    ),
                    AuditLog.timestamp >= thirty_days_ago,
                )
            )
        )

        metrics = auth_metrics.first()

        # Threat detection metrics
        threat_metrics = await db.execute(
            select(func.count(AuditLog.id)).where(
                and_(
                    AuditLog.action == "security_threat_detected",
                    AuditLog.timestamp >= thirty_days_ago,
                )
            )
        )

        threat_count = threat_metrics.scalar() or 0

        # MFA adoption
        mfa_users = await db.execute(
            select(func.count(User.id)).where(User.mfa_enabled == True)
        )

        total_users = await db.execute(select(func.count(User.id)))
        mfa_adoption = (mfa_users.scalar() or 0) / max(total_users.scalar() or 1, 1)

        return {
            "period": "30 days",
            "authentication": {
                "successful_logins": metrics.successful_logins or 0,
                "failed_logins": metrics.failed_logins or 0,
                "success_rate": (metrics.successful_logins or 0)
                / max(
                    (metrics.successful_logins or 0) + (metrics.failed_logins or 0), 1
                ),
            },
            "security_threats": {
                "total_threats": threat_count,
                "threats_per_day": threat_count / 30,
            },
            "mfa_adoption": {
                "enabled_users": mfa_users.scalar() or 0,
                "total_users": total_users.scalar() or 0,
                "adoption_rate": mfa_adoption,
            },
            "recommendations": self._generate_security_report_recommendations(
                metrics.successful_logins or 0,
                metrics.failed_logins or 0,
                threat_count,
                mfa_adoption,
            ),
            "generated_at": datetime.utcnow().isoformat(),
        }

    def _generate_security_report_recommendations(
        self, successful: int, failed: int, threats: int, mfa_rate: float
    ) -> List[str]:
        """Generate recommendations for security report."""
        recommendations = []

        total_attempts = successful + failed
        if total_attempts > 0:
            failure_rate = failed / total_attempts
            if failure_rate > 0.1:
                recommendations.append(
                    "⚠️ High authentication failure rate - review login security"
                )

        if threats > 10:
            recommendations.append(
                "🚨 High number of security threats detected - review threat patterns"
            )

        if mfa_rate < 0.5:
            recommendations.append(
                "🔐 Low MFA adoption - encourage users to enable multi-factor authentication"
            )

        if failure_rate > 0.05 and mfa_rate < 0.8:
            recommendations.append("🛡️ Implement mandatory MFA for high-risk accounts")

        return recommendations
