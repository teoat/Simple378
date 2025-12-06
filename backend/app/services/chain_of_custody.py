import hashlib
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from uuid import UUID

class ChainOfCustodyService:
    """Service for managing evidence chain of custody with SHA-256 hashing."""
    
    @staticmethod
    def generate_hash(data: Any) -> str:
        """
        Generate SHA-256 hash for any data (file content, JSON, etc.).
        """
        if isinstance(data, (dict, list)):
            # For structured data, serialize to JSON first
            data_str = json.dumps(data, sort_keys=True)
        elif isinstance(data, str):
            data_str = data
        elif isinstance(data, bytes):
            return hashlib.sha256(data).hexdigest()
        else:
            data_str = str(data)
        
        return hashlib.sha256(data_str.encode('utf-8')).hexdigest()
    
    @staticmethod
    def create_custody_entry(
        actor_id: UUID,
        action: str,
        resource_id: UUID,
        resource_type: str,
        evidence_hash: str,
        details: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create a chain of custody log entry.
        
        Args:
            actor_id: ID of the user performing the action
            action: Action performed (e.g., "created", "viewed", "exported", "modified")
            resource_id: ID of the resource (evidence, case, etc.)
            resource_type: Type of resource (e.g., "evidence", "report", "analysis")
            evidence_hash: SHA-256 hash of the evidence at time of action
            details: Additional metadata
        """
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "actor_id": str(actor_id),
            "action": action,
            "resource_id": str(resource_id),
            "resource_type": resource_type,
            "evidence_hash": evidence_hash,
            "details": details or {}
        }
    
    @staticmethod
    def verify_integrity(current_hash: str, stored_hash: str) -> bool:
        """
        Verify that evidence has not been tampered with by comparing hashes.
        """
        return current_hash == stored_hash
    
    @staticmethod
    def format_custody_log_for_report(custody_log: List[Dict[str, Any]]) -> str:
        """
        Format custody log entries for inclusion in PDF reports.
        """
        if not custody_log:
            return "No custody log entries."
        
        lines = ["Chain of Custody Log:", "=" * 80]
        
        for i, entry in enumerate(custody_log, 1):
            lines.append(f"\nEntry #{i}")
            lines.append(f"  Timestamp: {entry['timestamp']}")
            lines.append(f"  Action: {entry['action']}")
            lines.append(f"  Actor: {entry['actor_id']}")
            lines.append(f"  Resource: {entry['resource_type']} ({entry['resource_id']})")
            lines.append(f"  Evidence Hash (SHA-256): {entry['evidence_hash']}")
            if entry.get('details'):
                lines.append(f"  Details: {json.dumps(entry['details'], indent=4)}")
        
        return "\n".join(lines)
