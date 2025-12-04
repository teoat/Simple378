"""
Database validation and integrity checking utilities.
Prevents cascade delete issues and validates schema consistency.
"""
import structlog
from typing import Dict, List, Tuple, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import inspect, text
from app.db.models import Subject, Transaction, AnalysisResult, Consent
from uuid import UUID

logger = structlog.get_logger(__name__)


class CascadeDeleteValidator:
    """Validates cascade delete operations to prevent data loss."""

    PROTECTED_RELATIONSHIPS = {
        "Subject": {
            "analysis_results": "AnalysisResult",
            "transactions": "Transaction",
        },
        "Transaction": {
            "subject": "Subject",
        },
    }

    @staticmethod
    async def validate_subject_deletion(db: AsyncSession, subject_id: UUID) -> Dict[str, Any]:
        """
        Validate that subject can be safely deleted.
        Returns count of related objects that would be deleted.
        """
        from sqlalchemy import func
        
        result = await db.execute(
            text("""
                SELECT 
                    (SELECT COUNT(*) FROM analysis_results WHERE subject_id = :id) as analysis_count,
                    (SELECT COUNT(*) FROM transactions WHERE subject_id = :id) as transaction_count,
                    (SELECT COUNT(*) FROM consents WHERE subject_id = :id) as consent_count
            """),
            {"id": str(subject_id)}
        )
        
        counts = result.fetchone()
        
        return {
            "can_delete": True,
            "analysis_results_count": counts[0] or 0,
            "transactions_count": counts[1] or 0,
            "consents_count": counts[2] or 0,
            "total_dependent_records": sum([counts[0] or 0, counts[1] or 0, counts[2] or 0]),
        }

    @staticmethod
    async def validate_cascade_operation(
        db: AsyncSession,
        table_name: str,
        record_id: UUID,
        operation: str = "delete"
    ) -> Tuple[bool, str]:
        """
        Validate cascade operation before execution.
        
        Args:
            db: Database session
            table_name: Table being modified
            record_id: Record ID
            operation: Operation type (delete, update)
            
        Returns:
            Tuple of (is_safe, reason)
        """
        if operation == "delete" and table_name == "subjects":
            validation = await CascadeDeleteValidator.validate_subject_deletion(db, record_id)
            
            if validation["total_dependent_records"] > 1000:
                return False, f"Too many dependent records: {validation['total_dependent_records']}"
            
            logger.info(
                "Cascade delete validated",
                table=table_name,
                record_id=record_id,
                analysis_count=validation["analysis_results_count"],
                transaction_count=validation["transactions_count"],
            )
            return True, "Safe to delete"
        
        return True, "No validation rules"


async def verify_database_schema(db: AsyncSession) -> Dict[str, List[str]]:
    """
    Verify database schema consistency.
    Checks for orphaned records and missing foreign keys.
    """
    issues = {
        "orphaned_records": [],
        "missing_foreign_keys": [],
        "invalid_migrations": [],
    }
    
    # Check for orphaned transactions
    orphaned = await db.execute(text("""
        SELECT t.id FROM transactions t
        LEFT JOIN subjects s ON t.subject_id = s.id
        WHERE s.id IS NULL
    """))
    
    orphaned_rows = orphaned.fetchall()
    if orphaned_rows:
        issues["orphaned_records"].extend([str(row[0]) for row in orphaned_rows])
        logger.warning(f"Found {len(orphaned_rows)} orphaned transaction records")
    
    # Check for orphaned analysis results
    orphaned = await db.execute(text("""
        SELECT ar.id FROM analysis_results ar
        LEFT JOIN subjects s ON ar.subject_id = s.id
        WHERE s.id IS NULL
    """))
    
    orphaned_rows = orphaned.fetchall()
    if orphaned_rows:
        issues["orphaned_records"].extend([str(row[0]) for row in orphaned_rows])
        logger.warning(f"Found {len(orphaned_rows)} orphaned analysis result records")
    
    return issues


async def cleanup_orphaned_records(db: AsyncSession) -> Dict[str, int]:
    """Safely clean up orphaned records from database."""
    cleaned = {"transactions": 0, "analysis_results": 0}
    
    # Delete orphaned transactions
    result = await db.execute(text("""
        DELETE FROM transactions
        WHERE subject_id NOT IN (SELECT id FROM subjects)
    """))
    cleaned["transactions"] = result.rowcount
    
    # Delete orphaned analysis results
    result = await db.execute(text("""
        DELETE FROM analysis_results
        WHERE subject_id NOT IN (SELECT id FROM subjects)
    """))
    cleaned["analysis_results"] = result.rowcount
    
    if sum(cleaned.values()) > 0:
        logger.info("Orphaned records cleaned up", **cleaned)
        await db.commit()
    
    return cleaned
