import asyncio
from app.db.session import AsyncSessionLocal
from app.db.models import User
from sqlalchemy import select
from app.core.security import get_password_hash
from app.models.mens_rea import AnalysisResult # Register AnalysisResult model

async def create_user():
    async with AsyncSessionLocal() as session:
        # Check if user exists
        result = await session.execute(select(User).where(User.email == "admin@example.com"))
        user = result.scalars().first()
        
        if user:
            print("User exists. Updating password...")
            user.hashed_password = get_password_hash("password")
            session.add(user)
        else:
            print("Creating new user...")
            user = User(
                email="admin@example.com",
                hashed_password=get_password_hash("password"),
                full_name="Admin User",
                role="admin"
            )
            session.add(user)
            
        try:
            await session.commit()
            print("User created/updated successfully")
        except Exception as e:
            print(f"Error creating/updating user: {e}")
            await session.rollback()

if __name__ == "__main__":
    asyncio.run(create_user())
