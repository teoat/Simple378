"""
Staging Database Seeding Script
Creates realistic test data for the staging environment
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models import User, AnalysisResult, Indicator, AdjudicationDecision
from app.core.security import get_password_hash
from datetime import datetime, timedelta
import random


async def create_test_users(db):
    """Create test user accounts for QA team"""
    print("Creating test users...")
    
    test_users = [
        {
            "email": "analyst@staging.example.com",
            "password": "StagingTest123!",
            "full_name": "Test Analyst",
            "role": "analyst",
            "is_active": True
        },
        {
            "email": "admin@staging.example.com",
            "password": "StagingAdmin123!",
            "full_name": "Test Admin",
            "role": "admin",
            "is_active": True
        },
        {
            "email": "reviewer@staging.example.com",
            "password": "StagingReview123!",
            "full_name": "Test Reviewer",
            "role": "reviewer", 
            "is_active": True
        }
    ]
    
    for user_data in test_users:
        # Check if user exists
        result = await db.execute(
            select(User).where(User.email == user_data["email"])
        )
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            print(f"  User {user_data['email']} already exists, skipping...")
            continue
        
        # Create new user
        user = User(
            email=user_data["email"],
            hashed_password=get_password_hash(user_data["password"]),
            full_name=user_data["full_name"],
            role=user_data["role"],
            is_active=user_data["is_active"]
        )
        db.add(user)
        print(f"  Created user: {user_data['email']}")
    
    await db.commit()
    print(f"✓ Created {len(test_users)} test users\n")


async def create_sample_cases(db):
    """Create sample fraud analysis cases with varying risk profiles"""
    print("Creating sample analysis cases...")
    
    # Risk profiles for realistic test data
    risk_profiles = [
        {
            "risk_score": 0.95,
            "status": "flagged",
            "indicators": [
                {"type": "unusual_transaction_pattern", "confidence": 0.98},
                {"type": "velocity_anomaly", "confidence": 0.92},
                {"type": "suspicious_amount", "confidence": 0.85}
            ]
        },
        {
            "risk_score": 0.75,
            "status": "flagged",
            "indicators": [
                {"type": "geolocation_mismatch", "confidence": 0.80},
                {"type": "unusual_time_pattern", "confidence": 0.70}
            ]
        },
        {
            "risk_score": 0.45,
            "status": "pending",
            "indicators": [
                {"type": "minor_velocity_increase", "confidence": 0.50},
                {"type": "borderline_amount", "confidence": 0.40}
            ]
        },
        {
            "risk_score": 0.15,
            "status": "pending",
            "indicators": [
                {"type": "normal_pattern", "confidence": 0.20}
            ]
        }
    ]
    
    # Check existing cases count
    result = await db.execute(select(AnalysisResult))
    existing_count = len(result.scalars().all())
    
    if existing_count >= 50:
        print(f"  Already have {existing_count} cases, skipping seed...")
        return
    
    cases_to_create = 100 - existing_count
    print(f"  Creating {cases_to_create} new cases...")
    
    for i in range(cases_to_create):
        # Randomly select a risk profile
        profile = random.choice(risk_profiles)
        
        # Create analysis result
        created_date = datetime.utcnow() - timedelta(
            days=random.randint(0, 30),
            hours=random.randint(0, 23)
        )
        
        analysis = AnalysisResult(
            subject_id=f"SUBJ-{random.randint(10000, 99999)}",
            risk_score=profile["risk_score"],
            status=profile["status"],
            adjudication_status="pending",
            created_at=created_date,
            updated_at=created_date
        )
        db.add(analysis)
        await db.flush()  # Get the ID
        
        # Create indicators for this case
        for ind_data in profile["indicators"]:
            indicator = Indicator(
                analysis_id=analysis.id,
                type=ind_data["type"],
                confidence=ind_data["confidence"],
                description=f"Test {ind_data['type'].replace('_', ' ')} indicator"
            )
            db.add(indicator)
    
    await db.commit()
    print(f"✓ Created {cases_to_create} sample analysis cases\n")


async def create_adjudication_history(db):
    """Create some adjudication decisions for testing dashboard"""
    print("Creating adjudication decision history...")
    
    # Get some existing cases
    result = await db.execute(
        select(AnalysisResult)
        .where(AnalysisResult.adjudication_status == "pending")
        .limit(20)
    )
    cases = result.scalars().all()
    
    if not cases:
        print("  No pending cases to adjudicate, skipping...")
        return
    
    # Get analyst user
    result = await db.execute(
        select(User).where(User.email == "analyst@staging.example.com")
    )
    analyst = result.scalar_one_or_none()
    
    if not analyst:
        print("  Analyst user not found, cannot create decisions")
        return
    
    decisions_created = 0
    for case in cases[:10]:  # Adjudicate first 10
        decision_type = random.choice(["approve", "reject", "escalate"])
        
        decision = AdjudicationDecision(
            analysis_id=case.id,
            analyst_id=analyst.id,
            decision=decision_type,
            notes=f"Staging test decision - {decision_type}",
            reasoning=f"This is a test {decision_type} decision for staging environment validation",
            created_at=datetime.utcnow() - timedelta(days=random.randint(0, 10))
        )
        db.add(decision)
        
        # Update case status
        case.adjudication_status = "reviewed"
        case.decision = decision_type
        decisions_created += 1
    
    await db.commit()
    print(f"✓ Created {decisions_created} adjudication decisions\n")


async def main():
    """Main seeding function"""
    print("=" * 50)
    print("STAGING DATABASE SEEDING")
    print("=" * 50)
    print()
    
    async with AsyncSessionLocal() as db:
        try:
            await create_test_users(db)
            await create_sample_cases(db)
            await create_adjudication_history(db)
            
            print("=" * 50)
            print("✓ STAGING DATABASE SEEDED SUCCESSFULLY")
            print("=" * 50)
            print()
            print("Test Credentials:")
            print("  Analyst: analyst@staging.example.com / StagingTest123!")
            print("  Admin: admin@staging.example.com / StagingAdmin123!")
            print("  Reviewer: reviewer@staging.example.com / StagingReview123!")
            print()
            
        except Exception as e:
            print(f"Error seeding database: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(main())
