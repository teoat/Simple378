"""
Milestone management endpoints for tracking project phases and fund releases.
"""

from typing import List, Optional
from datetime import datetime
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from pydantic import BaseModel, Field

from app.api import deps
from app.db.models import Milestone as MilestoneModel, User

router = APIRouter()


# Pydantic Models
class MilestoneBase(BaseModel):
    name: str = Field(..., description="Milestone name")
    type: str = Field(
        ..., description="Milestone type: DOWN_PAYMENT, PROGRESS, HANDOVER, RETENTION"
    )
    amount_released: float = Field(..., description="Amount released at this milestone")
    due_date: Optional[str] = None
    phase: Optional[str] = None
    description: Optional[str] = None


class MilestoneCreate(MilestoneBase):
    project_id: str = Field(..., description="Associated project/case ID")


class MilestoneUpdate(BaseModel):
    status: Optional[str] = None
    actual_spend: Optional[float] = None
    notes: Optional[str] = None
    evidence_url: Optional[str] = None
    completed_at: Optional[str] = None


class MilestoneResponse(MilestoneBase):
    id: str
    project_id: str
    status: str
    actual_spend: float
    utilization_rate: float
    created_at: str
    updated_at: Optional[str]
    completed_at: Optional[str]
    notes: Optional[str]
    evidence_url: Optional[str]

    class Config:
        from_attributes = True


@router.get("/projects/{project_id}/milestones", response_model=List[MilestoneResponse])
async def get_project_milestones(
    project_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.verify_active_analyst),
):
    """
    Get all milestones for a project.
    """
    try:
        project_uuid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID")

    result = await db.execute(
        select(MilestoneModel)
        .where(MilestoneModel.project_id == project_uuid)
        .order_by(MilestoneModel.due_date)
    )
    milestones = result.scalars().all()

    return [
        MilestoneResponse(
            id=str(m.id),
            project_id=str(m.project_id),
            name=m.name,
            type=m.type,
            status=m.status,
            amount_released=float(m.amount_released or 0),
            actual_spend=float(m.actual_spend or 0),
            utilization_rate=float(m.actual_spend or 0)
            / float(m.amount_released or 1)
            * 100,
            due_date=m.due_date.isoformat() if m.due_date else None,
            phase=m.phase,
            description=m.description,
            notes=m.notes,
            evidence_url=m.evidence_url,
            created_at=m.created_at.isoformat() if m.created_at else "",
            updated_at=m.updated_at.isoformat() if m.updated_at else None,
            completed_at=m.completed_at.isoformat() if m.completed_at else None,
        )
        for m in milestones
    ]


@router.post(
    "/projects/{project_id}/milestones",
    response_model=MilestoneResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_milestone(
    project_id: str,
    milestone_data: MilestoneBase,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(
        deps.verify_admin
    ),  # Only admins can create milestones
):
    """
    Create a new milestone for a project.
    """
    try:
        project_uuid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID")

    # Create milestone
    new_milestone = MilestoneModel(
        id=uuid.uuid4(),
        project_id=project_uuid,
        name=milestone_data.name,
        type=milestone_data.type,
        status="LOCKED",  # Start as locked until previous milestone is complete
        amount_released=milestone_data.amount_released,
        actual_spend=0,
        due_date=(
            datetime.fromisoformat(milestone_data.due_date)
            if milestone_data.due_date
            else None
        ),
        phase=milestone_data.phase,
        description=milestone_data.description,
        created_at=datetime.utcnow(),
    )

    db.add(new_milestone)
    await db.commit()
    await db.refresh(new_milestone)

    return MilestoneResponse(
        id=str(new_milestone.id),
        project_id=str(new_milestone.project_id),
        name=new_milestone.name,
        type=new_milestone.type,
        status=new_milestone.status,
        amount_released=float(new_milestone.amount_released),
        actual_spend=0,
        utilization_rate=0,
        due_date=new_milestone.due_date.isoformat() if new_milestone.due_date else None,
        phase=new_milestone.phase,
        description=new_milestone.description,
        created_at=new_milestone.created_at.isoformat(),
        updated_at=None,
        completed_at=None,
    )


@router.patch("/milestones/{milestone_id}/status", response_model=MilestoneResponse)
async def update_milestone_status(
    milestone_id: str,
    update_data: MilestoneUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.verify_active_analyst),
):
    """
    Update milestone status (mark as complete, add notes, attach evidence).

    This endpoint is used by the Phase Control Panel to mark phases as complete.
    """
    try:
        milestone_uuid = uuid.UUID(milestone_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid milestone ID")

    # Fetch milestone
    result = await db.execute(
        select(MilestoneModel).where(MilestoneModel.id == milestone_uuid)
    )
    milestone = result.scalar_one_or_none()

    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    # Update fields
    if update_data.status:
        milestone.status = update_data.status
    if update_data.actual_spend is not None:
        milestone.actual_spend = update_data.actual_spend
    if update_data.notes:
        milestone.notes = update_data.notes
    if update_data.evidence_url:
        milestone.evidence_url = update_data.evidence_url
    if update_data.completed_at:
        milestone.completed_at = datetime.fromisoformat(update_data.completed_at)

    milestone.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(milestone)

    # If marked as complete, unlock next milestone
    if update_data.status == "COMPLETE":
        await _unlock_next_milestone(db, milestone.project_id, milestone.id)

    return MilestoneResponse(
        id=str(milestone.id),
        project_id=str(milestone.project_id),
        name=milestone.name,
        type=milestone.type,
        status=milestone.status,
        amount_released=float(milestone.amount_released),
        actual_spend=float(milestone.actual_spend or 0),
        utilization_rate=float(milestone.actual_spend or 0)
        / float(milestone.amount_released or 1)
        * 100,
        due_date=milestone.due_date.isoformat() if milestone.due_date else None,
        phase=milestone.phase,
        description=milestone.description,
        notes=milestone.notes,
        evidence_url=milestone.evidence_url,
        created_at=milestone.created_at.isoformat(),
        updated_at=milestone.updated_at.isoformat() if milestone.updated_at else None,
        completed_at=(
            milestone.completed_at.isoformat() if milestone.completed_at else None
        ),
    )


async def _unlock_next_milestone(
    db: AsyncSession, project_id: uuid.UUID, current_milestone_id: uuid.UUID
):
    """
    Helper function to unlock the next milestone in sequence after current is completed.
    """
    # Find next milestone with status 'LOCKED'
    result = await db.execute(
        select(MilestoneModel)
        .where(
            and_(
                MilestoneModel.project_id == project_id,
                MilestoneModel.status == "LOCKED",
            )
        )
        .order_by(MilestoneModel.due_date)
        .limit(1)
    )
    next_milestone = result.scalar_one_or_none()

    if next_milestone:
        next_milestone.status = "ACTIVE"
        next_milestone.updated_at = datetime.utcnow()
        await db.commit()


@router.post("/milestones/{milestone_id}/release-funds", response_model=dict)
async def release_funds(
    milestone_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.verify_admin),  # Only admins can release funds
):
    """
    Trigger fund release for a completed milestone.

    This would integrate with payment/financial systems.
    For now, it just marks the milestone as PAID.
    """
    try:
        milestone_uuid = uuid.UUID(milestone_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid milestone ID")

    result = await db.execute(
        select(MilestoneModel).where(MilestoneModel.id == milestone_uuid)
    )
    milestone = result.scalar_one_or_none()

    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    if milestone.status != "COMPLETE":
        raise HTTPException(
            status_code=400,
            detail="Milestone must be marked as complete before releasing funds",
        )

    # Mark as paid
    milestone.status = "PAID"
    milestone.updated_at = datetime.utcnow()

    await db.commit()

    return {
        "success": True,
        "message": f"Funds released for milestone: {milestone.name}",
        "amount": float(milestone.amount_released),
        "milestone_id": str(milestone.id),
    }
