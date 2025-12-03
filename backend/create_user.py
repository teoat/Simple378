import asyncio
from app.db.session import AsyncSessionLocal
from app.db.models import User
from app.core.security import get_password_hash

async def create_user():
    async with AsyncSessionLocal() as session:
        user = User(
            email="admin@example.com",
            # hashed_password=get_password_hash("password"),
            hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWrn3IwnE1zPL.Xm8Q/Gce.1U/g6.O", # "password"
            full_name="Admin User",
            role="admin"
        )
        session.add(user)
        try:
            await session.commit()
            print("User created successfully")
        except Exception as e:
            print(f"Error creating user: {e}")
            await session.rollback()

if __name__ == "__main__":
    asyncio.run(create_user())
