"""Seed test data for E2E Playwright tests.

This script creates:
- Test users with known credentials
- Test cases with specific IDs
- Test subjects for visualization
- Sample transactions for reconciliation

Run with: poetry run python scripts/seed_test_data.py
"""
import asyncio
import sys
from pathlib import Path
from datetime import datetime, timedelta
from decimal import Decimal
import uuid

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.session import AsyncSessionLocal
from app.db.models import User, Case, Subject, Transaction, Alert
from app.core.security import get_password_hash


# Known test IDs for E2E tests
TEST_CASE_ID = uuid.UUID("123e4567-e89b-12d3-a456-426614174000")
TEST_USER_ID = uuid.UUID("223e4567-e89b-12d3-a456-426614174000")
TEST_ADMIN_ID = uuid.UUID("323e4567-e89b-12d3-a456-426614174000")


async def seed_test_data():
    """Seed all test data."""
    print("🌱 Starting test data seeding...")
    
    async with AsyncSessionLocal() as session:
        try:
            # 1. Create test users
            print("\n👤 Creating test users...")
            
            test_user = User(
                id=TEST_USER_ID,
                email="test@example.com",
                hashed_password=get_password_hash("testpass123"),
                full_name="Test User",
                role="analyst",
                is_active=True,
                created_at=datetime.utcnow()
            )
            
            admin_user = User(
                id=TEST_ADMIN_ID,
                email="admin@example.com",
                hashed_password=get_password_hash("password"),
                full_name="Admin User",
                role="admin",
                is_active=True,
                created_at=datetime.utcnow()
            )
            
            session.add_all([test_user, admin_user])
            await session.flush()
            print("  ✅ Created test@example.com (password: testpass123)")
            print("  ✅ Created admin@example.com (password: password)")
            
            # 2. Create test cases
            print("\n📁 Creating test cases...")
            
            # Main test case for visualization/analytics tests
            main_case = Case(
                id=TEST_CASE_ID,
                case_number="CASE-E2E-001",
                title="E2E Test Case - Primary",
                description="Primary test case for E2E testing with full data",
                status="in_progress",
                priority="high",
                assigned_to=TEST_USER_ID,
                created_at=datetime.utcnow() - timedelta(days=30),
                updated_at=datetime.utcnow()
            )
            
            # Additional case for filtering tests
            filter_case = Case(
                id=uuid.uuid4(),
                case_number="CASE-E2E-002",
                title="E2E Test Case - Secondary",
                description="Secondary case for filter testing",
                status="pending",
                priority="medium",
                assigned_to=TEST_USER_ID,
                created_at=datetime.utcnow() - timedelta(days=15),
                updated_at=datetime.utcnow()
            )
            
            session.add_all([main_case, filter_case])
            await session.flush()
            print(f"  ✅ Created {main_case.case_number} (ID: {TEST_CASE_ID})")
            print(f"  ✅ Created {filter_case.case_number}")
            
            # 3. Create test subjects
            print("\n👥 Creating test subjects...")
            
            subject1 = Subject(
                id=uuid.uuid4(),
                case_id=TEST_CASE_ID,
                name="John Doe",
                subject_type="individual",
                email="john.doe@example.com",
                phone="+1234567890",
                address="123 Test St, Test City, TC 12345",
                created_at=datetime.utcnow()
            )
            
            subject2 = Subject(
                id=uuid.uuid4(),
                case_id=TEST_CASE_ID,
                name="Acme Corporation",
                subject_type="company",
                email="contact@acme.example.com",
                created_at=datetime.utcnow()
            )
            
            session.add_all([subject1, subject2])
            await session.flush()
            print(f"  ✅ Created subject: {subject1.name}")
            print(f"  ✅ Created subject: {subject2.name}")
            
            # 4. Create sample transactions
            print("\n💰 Creating sample transactions...")
            
            transactions = []
            base_date = datetime.utcnow() - timedelta(days=60)
            
            for i in range(20):
                trans = Transaction(
                    id=uuid.uuid4(),
                    case_id=TEST_CASE_ID,
                    subject_id=subject1.id if i % 2 == 0 else subject2.id,
                    transaction_date=base_date + timedelta(days=i*3),
                    amount=Decimal(1000 + (i * 500)),
                    transaction_type="credit" if i % 3 == 0 else "debit",
                    description=f"Test Transaction {i+1}",
                    counterparty=f"Party-{i+1}",
                    status="completed",
                    created_at=datetime.utcnow()
                )
                transactions.append(trans)
            
            session.add_all(transactions)
            await session.flush()
            print(f"  ✅ Created {len(transactions)} test transactions")
            
            # 5. Create test alerts for adjudication
            print("\n🚨 Creating test alerts...")
            
            alerts = []
            for i in range(5):
                alert = Alert(
                    id=uuid.uuid4(),
                    case_id=TEST_CASE_ID,
                    subject_id=subject1.id if i % 2 == 0 else subject2.id,
                    alert_type="high_risk_transaction",
                    severity="high" if i < 2 else "medium",
                    status="pending",
                    description=f"Test alert {i+1} - Suspicious activity detected",
                    triggered_rules=[f"rule_{i+1}", "velocity_check"],
                    metadata={
                        "risk_score": 75 + i,
                        "flagged_amount": 10000 + (i * 1000)
                    },
                    created_at=datetime.utcnow() - timedelta(hours=i*2)
                )
                alerts.append(alert)
            
            session.add_all(alerts)
            await session.flush()
            print(f"  ✅ Created {len(alerts)} test alerts")
            
            # Commit all changes
            await session.commit()
            
            print("\n" + "="*50)
            print("✅ Test data seeding completed successfully!")
            print("="*50)
            print("\n📋 Summary:")
            print(f"  • Users: 2 (test@example.com, admin@example.com)")
            print(f"  • Cases: 2 (primary: {TEST_CASE_ID})")
            print(f"  • Subjects: 2")
            print(f"  • Transactions: {len(transactions)}")
            print(f"  • Alerts: {len(alerts)}")
            print("\n🔑 Test Credentials:")
            print("  Email: test@example.com")
            print("  Password: testpass123")
            print("\n  Email: admin@example.com")
            print("  Password: password")
            print("\n🎯 Use Case ID for tests: 123e4567-e89b-12d3-a456-426614174000")
            print("="*50)
            
        except Exception as e:
            await session.rollback()
            print(f"\n❌ Error seeding test data: {e}")
            import traceback
            traceback.print_exc()
            raise


async def clear_test_data():
    """Clear existing test data (optional, for re-seeding)."""
    print("🧹 Clearing existing test data...")
    
    async with AsyncSessionLocal() as session:
        try:
            # Delete in reverse order of dependencies
            from sqlalchemy import delete
            
            await session.execute(delete(Alert).where(Alert.case_id == TEST_CASE_ID))
            await session.execute(delete(Transaction).where(Transaction.case_id == TEST_CASE_ID))
            await session.execute(delete(Subject).where(Subject.case_id == TEST_CASE_ID))
            await session.execute(delete(Case).where(Case.id == TEST_CASE_ID))
            await session.execute(delete(User).where(User.email.in_(['test@example.com', 'admin@example.com'])))
            
            await session.commit()
            print("  ✅ Test data cleared")
            
        except Exception as e:
            await session.rollback()
            print(f"  ⚠️  Error clearing test data: {e}")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Seed test data for E2E tests")
    parser.add_argument("--clear", action="store_true", help="Clear existing test data first")
    args = parser.parse_args()
    
    async def main():
        if args.clear:
            await clear_test_data()
        await seed_test_data()
    
    asyncio.run(main())
