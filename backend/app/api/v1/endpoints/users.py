from typing import Any
from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api import deps
from app.core import security
from app.db.models import User
from app.schemas import user as user_schema

router = APIRouter()

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

@router.get("/profile", response_model=user_schema.User)
async def read_user_me(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.patch("/profile", response_model=user_schema.User)
async def update_user_me(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_in: user_schema.UserUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update own user.
    """
    user_data = jsonable_encoder(current_user)
    update_data = user_in.dict(exclude_unset=True)
    
    # Don't allow password update here
    if "password" in update_data:
        del update_data["password"]
        
    for field in user_data:
        if field in update_data:
            setattr(current_user, field, update_data[field])
            
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.post("/password", response_model=user_schema.User)
async def update_password_me(
    *,
    db: AsyncSession = Depends(deps.get_db),
    password_in: PasswordUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update own password.
    """
    if not security.verify_password(password_in.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")
        
    hashed_password = security.get_password_hash(password_in.new_password)
    current_user.hashed_password = hashed_password
    
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.patch("/preferences")
async def update_preferences(
    *,
    db: AsyncSession = Depends(deps.get_db),
    preferences: dict = Body(...),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update user preferences (mock implementation as preferences aren't in User model yet).
    In a real app, this would update a preferences column or table.
    """
    # Just return success for now as we don't have a preferences column
    return {"status": "success", "preferences": preferences}
