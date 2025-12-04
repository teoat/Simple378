"""
Reset Staging Database Script
Drops all data and re-seeds the staging database
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import engine
from app.models import Base
from seed_staging import main as seed_main


async def reset_database():
    """Drop all tables and recreate them"""
    print("WARNING: This will delete ALL data from the staging database!")
    response = input("Are you sure you want to continue? (yes/no): ")
    
    if response.lower() != "yes":
        print("Operation cancelled")
        return
    
    print("\nDropping all tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        print("✓ Tables dropped")
    
    print("\nCreating fresh schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("✓ Schema created")
    
    print("\nSeeding with fresh data...")
    await seed_main()
    
    print("\n✓ Database reset complete!")


if __name__ == "__main__":
    asyncio.run(reset_database())
