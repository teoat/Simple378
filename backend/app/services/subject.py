from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.db.models import Subject
from app.db.models import AnalysisResult
import uuid


class SubjectService:
    @staticmethod
    async def delete_subject_data(db: AsyncSession, subject_id: uuid.UUID) -> bool:
        """
        Execute a cascading delete for a subject and all related data.
        Returns True if subject was found and deleted, False otherwise.
        """
        # Fetch subject to ensure existence
        result = await db.execute(select(Subject).where(Subject.id == subject_id))
        subject = result.scalars().first()

        if not subject:
            return False

        # Note: SQLAlchemy cascade="all, delete-orphan" on relationships
        # should handle children, but explicit deletion is safer for GDPR audit.

        # Delete subject (cascades should handle the rest if configured,
        # but let's rely on the model definitions)
        await db.delete(subject)
        await db.commit()
        return True

    @staticmethod
    async def export_subject_data(db: AsyncSession, subject_id: uuid.UUID) -> dict:
        """
        Collect all data related to a subject for data portability.
        """
        # Fetch subject with all relationships
        query = (
            select(Subject)
            .where(Subject.id == subject_id)
            .options(
                selectinload(Subject.transactions),
                selectinload(Subject.analysis_results).selectinload(
                    AnalysisResult.indicators
                ),
                selectinload(Subject.consents),
            )
        )
        result = await db.execute(query)
        subject = result.scalars().first()

        if not subject:
            return None

        # Serialize data
        data = {
            "subject": {
                "id": str(subject.id),
                "created_at": (
                    subject.created_at.isoformat() if subject.created_at else None
                ),
                "encrypted_pii": subject.encrypted_pii,
            },
            "transactions": [
                {
                    "id": str(t.id),
                    "amount": t.amount,
                    "date": t.date.isoformat() if t.date else None,
                    "description": t.description,
                }
                for t in subject.transactions
            ],
            "analysis_results": [
                {
                    "id": str(ar.id),
                    "status": ar.status,
                    "risk_score": ar.risk_score,
                    "indicators": [
                        {
                            "type": i.type,
                            "confidence": i.confidence,
                            "evidence": i.evidence,
                        }
                        for i in ar.indicators
                    ],
                }
                for ar in subject.analysis_results
            ],
            "consents": [
                {
                    "type": c.consent_type,
                    "granted_at": c.granted_at.isoformat() if c.granted_at else None,
                }
                for c in subject.consents
            ],
        }

        return data
