import asyncio
import random
from datetime import datetime, timedelta
from app.db.session import AsyncSessionLocal
from app.db.models import Subject
from app.models.mens_rea import AnalysisResult

import uuid

async def seed_data():
    async with AsyncSessionLocal() as session:
        print("Seeding data...")
        
        # Create subjects
        subjects = []
        for i in range(5):
            subject = Subject(
                id=uuid.uuid4(),
                created_at=datetime.utcnow() - timedelta(days=random.randint(0, 10)),
                encrypted_pii={"name": f"Subject {i}"}
            )
            session.add(subject)
            subjects.append(subject)
        
        await session.commit()
        
        # Create analysis results
        for i, subject in enumerate(subjects):
            risk_score = random.randint(10, 90)
            status = "pending"
            if risk_score > 80:
                status = "flagged"
            elif risk_score < 30:
                status = "reviewed"
                
            analysis = AnalysisResult(
                id=uuid.uuid4(),
                subject_id=subject.id,
                risk_score=risk_score,
                adjudication_status=status,
                created_at=subject.created_at
            )
            session.add(analysis)
            
            # Create indicators
            from app.models.mens_rea import Indicator
            indicator = Indicator(
                id=uuid.uuid4(),
                analysis_result_id=analysis.id,
                type="test_indicator",
                confidence=0.9,
                evidence={"detail": "test evidence"}
            )
            session.add(indicator)
            
        await session.commit()
        print("Data seeded successfully")

if __name__ == "__main__":
    asyncio.run(seed_data())
