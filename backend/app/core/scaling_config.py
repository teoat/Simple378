"""
Deployment and scaling configuration for production.
Includes Redis-based sessions, auto-scaling policies, and distributed WebSocket management.
"""
import redis
import json
import structlog
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import uuid

logger = structlog.get_logger(__name__)


class RedisSessionStore:
    """
    Redis-backed session store for distributed WebSocket sessions.
    Enables horizontal scaling with session persistence.
    """

    def __init__(self, redis_url: str, ttl_hours: int = 24):
        self.redis_url = redis_url
        self.ttl_seconds = ttl_hours * 3600
        self.redis_client = redis.from_url(redis_url, decode_responses=True)

    async def create_session(
        self,
        user_id: str,
        connection_id: str,
        metadata: Dict[str, Any]
    ) -> str:
        """
        Create new session with persistence across instances.
        
        Args:
            user_id: User ID
            connection_id: Unique connection ID
            metadata: Session metadata
            
        Returns:
            Session token
        """
        session_key = f"session:{user_id}:{connection_id}"
        session_data = {
            "user_id": user_id,
            "connection_id": connection_id,
            "created_at": datetime.utcnow().isoformat(),
            "metadata": json.dumps(metadata),
        }
        
        self.redis_client.setex(
            session_key,
            self.ttl_seconds,
            json.dumps(session_data)
        )
        
        # Also track in user's active sessions
        user_sessions_key = f"user_sessions:{user_id}"
        self.redis_client.sadd(user_sessions_key, session_key)
        self.redis_client.expire(user_sessions_key, self.ttl_seconds)
        
        logger.info(
            "Session created",
            user_id=user_id,
            connection_id=connection_id,
        )
        
        return connection_id

    async def get_session(self, user_id: str, connection_id: str) -> Optional[Dict]:
        """Retrieve session data."""
        session_key = f"session:{user_id}:{connection_id}"
        session_data = self.redis_client.get(session_key)
        
        if session_data:
            return json.loads(session_data)
        
        return None

    async def invalidate_session(self, user_id: str, connection_id: str) -> bool:
        """Remove session."""
        session_key = f"session:{user_id}:{connection_id}"
        result = self.redis_client.delete(session_key)
        
        # Remove from user's active sessions
        user_sessions_key = f"user_sessions:{user_id}"
        self.redis_client.srem(user_sessions_key, session_key)
        
        logger.info(
            "Session invalidated",
            user_id=user_id,
            connection_id=connection_id,
        )
        
        return result > 0

    async def get_user_sessions(self, user_id: str) -> List[Dict]:
        """Get all active sessions for a user."""
        user_sessions_key = f"user_sessions:{user_id}"
        session_keys = self.redis_client.smembers(user_sessions_key)
        
        sessions = []
        for session_key in session_keys:
            session_data = self.redis_client.get(session_key)
            if session_data:
                sessions.append(json.loads(session_data))
        
        return sessions


class ConnectionPoolConfig:
    """Dynamic database connection pool configuration."""

    @staticmethod
    def get_pool_size(environment: str, load_estimate: float = 1.0) -> int:
        """
        Calculate appropriate pool size based on environment and load.
        
        Args:
            environment: Environment name (dev, staging, production)
            load_estimate: Estimated load multiplier (1.0 = normal)
            
        Returns:
            Recommended pool size
        """
        base_sizes = {
            "development": 5,
            "staging": 10,
            "production": 20,
        }
        
        base_size = base_sizes.get(environment, 10)
        adjusted_size = int(base_size * load_estimate)
        
        logger.info(
            "Connection pool calculated",
            environment=environment,
            base_size=base_size,
            load_estimate=load_estimate,
            adjusted_size=adjusted_size,
        )
        
        return adjusted_size

    @staticmethod
    def get_overflow_size(pool_size: int) -> int:
        """Calculate overflow pool size."""
        return max(int(pool_size * 0.5), 5)


class AutoScalingPolicy:
    """Auto-scaling policies for Kubernetes deployments."""

    @staticmethod
    def get_hpa_config(environment: str) -> Dict[str, Any]:
        """
        Get Horizontal Pod Autoscaler configuration.
        
        Returns:
            HPA configuration for kubectl/Helm
        """
        policies = {
            "staging": {
                "minReplicas": 2,
                "maxReplicas": 5,
                "targetCPUUtilizationPercentage": 70,
                "targetMemoryUtilizationPercentage": 80,
                "scaleDownWindow": 300,  # 5 minutes
                "scaleUpWindow": 60,  # 1 minute
            },
            "production": {
                "minReplicas": 3,
                "maxReplicas": 10,
                "targetCPUUtilizationPercentage": 60,
                "targetMemoryUtilizationPercentage": 75,
                "scaleDownWindow": 600,  # 10 minutes
                "scaleUpWindow": 30,  # 30 seconds
            },
        }
        
        return policies.get(environment, policies["staging"])

    @staticmethod
    def get_pdb_config(min_available: int = 1) -> Dict[str, Any]:
        """
        Get Pod Disruption Budget configuration.
        Ensures minimum availability during updates.
        """
        return {
            "apiVersion": "policy/v1",
            "kind": "PodDisruptionBudget",
            "metadata": {"name": "fraud-detection-pdb"},
            "spec": {
                "minAvailable": min_available,
                "selector": {
                    "matchLabels": {"app": "fraud-detection"}
                },
            },
        }


class LoadBalancingConfig:
    """Configuration for load balancing and session affinity."""

    @staticmethod
    def get_sticky_session_config() -> Dict[str, Any]:
        """Get sticky session configuration for WebSocket connections."""
        return {
            "sessionAffinity": "ClientIP",
            "sessionAffinityConfig": {
                "clientIP": {
                    "timeoutSeconds": 10800,  # 3 hours
                }
            },
        }

    @staticmethod
    def get_nginx_upstream_config(replicas: int) -> str:
        """Generate nginx upstream configuration."""
        servers = "\n".join(
            f"    server backend-{i}:8000;" for i in range(replicas)
        )
        
        frontend_servers = "\n".join(
            f"    server frontend-{i}:8080;" for i in range(replicas)
        )
        
        return f"""
upstream backend {{
    least_conn;
    keepalive 32;
{servers}
}}

upstream frontend {{
    least_conn;
{frontend_servers}
}}
"""
