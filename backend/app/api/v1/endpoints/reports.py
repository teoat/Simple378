from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, func
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timedelta
import uuid
import json

from app.api import deps
from app.db.models import Subject, Transaction, AuditLog
from app.db.models import AnalysisResult
from app.services.reporting import ReportService

router = APIRouter()

class ReportComponent(BaseModel):
    id: str
    type: str  # chart, table, metric, text
    chart_type: Optional[str] = None
    title: str
    data_source: str
    config: Dict[str, Any]
    position: Dict[str, Any]

class ReportFilter(BaseModel):
    field: str
    operator: str
    value: Any

class ReportSchedule(BaseModel):
    frequency: str  # daily, weekly, monthly
    recipients: List[str]
    format: str  # pdf, excel, html

class ReportDefinition(BaseModel):
    id: str
    title: str
    description: str
    components: List[ReportComponent]
    layout: str  # grid, freeform
    filters: List[ReportFilter]
    schedule: Optional[ReportSchedule] = None

class ReportTemplate(BaseModel):
    id: str
    name: str
    description: str
    category: str
    definition: ReportDefinition
    is_public: bool
    created_by: str
    created_at: datetime

@router.post("/generate", response_model=Dict[str, Any])
async def generate_report(
    report_def: ReportDefinition,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Generate a report based on the provided definition.
    """
    try:
        # Generate report data
        report_data = await ReportService.generate_report(report_def, db)

        # Log report generation
        audit_log = AuditLog(
            actor_id=current_user.id,
            action="report_generated",
            resource_id=str(uuid.uuid4()),
            details={
                "report_title": report_def.title,
                "component_count": len(report_def.components),
                "data_sources": list(set(comp.data_source for comp in report_def.components))
            }
        )
        db.add(audit_log)
        await db.commit()

        return {
            "status": "success",
            "report_id": str(uuid.uuid4()),
            "data": report_data,
            "generated_at": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

@router.post("/export/{format}", response_model=Dict[str, Any])
async def export_report(
    format: str,
    report_def: ReportDefinition,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Export a report in the specified format (pdf, excel, html).
    """
    if format not in ['pdf', 'excel', 'html']:
        raise HTTPException(status_code=400, detail="Unsupported export format")

    try:
        # Generate report data
        report_data = await ReportService.generate_report(report_def, db)

        # Create export
        export_result = await ReportService.export_report(report_data, format, report_def.title)

        # Log export
        audit_log = AuditLog(
            actor_id=current_user.id,
            action="report_exported",
            resource_id=str(uuid.uuid4()),
            details={
                "report_title": report_def.title,
                "export_format": format,
                "file_size": len(export_result["content"]) if "content" in export_result else 0
            }
        )
        db.add(audit_log)
        await db.commit()

        return export_result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report export failed: {str(e)}")

@router.post("/schedule", response_model=Dict[str, Any])
async def schedule_report(
    report_def: ReportDefinition,
    schedule: ReportSchedule,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Schedule a report for automated generation and delivery.
    """
    try:
        # Validate schedule
        if schedule.frequency not in ['daily', 'weekly', 'monthly']:
            raise HTTPException(status_code=400, detail="Invalid frequency")

        if schedule.format not in ['pdf', 'excel', 'html']:
            raise HTTPException(status_code=400, detail="Invalid format")

        # Create scheduled report record (would be stored in database)
        scheduled_report = {
            "id": str(uuid.uuid4()),
            "report_definition": report_def.dict(),
            "schedule": schedule.dict(),
            "created_by": str(current_user.id),
            "created_at": datetime.utcnow(),
            "next_run": calculate_next_run(schedule.frequency),
            "is_active": True
        }

        # In a real implementation, this would be stored in a scheduled_reports table
        # and processed by a background job scheduler

        # Log scheduling
        audit_log = AuditLog(
            actor_id=current_user.id,
            action="report_scheduled",
            resource_id=scheduled_report["id"],
            details={
                "report_title": report_def.title,
                "frequency": schedule.frequency,
                "recipient_count": len(schedule.recipients)
            }
        )
        db.add(audit_log)
        await db.commit()

        return {
            "status": "success",
            "scheduled_report_id": scheduled_report["id"],
            "next_run": scheduled_report["next_run"].isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report scheduling failed: {str(e)}")

@router.get("/templates", response_model=List[ReportTemplate])
async def get_report_templates(
    category: Optional[str] = None,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Get available report templates.
    """
    try:
        # In a real implementation, templates would be stored in a database
        # For now, return predefined templates
        templates = [
            ReportTemplate(
                id="fraud-overview",
                name="Fraud Overview Dashboard",
                description="Comprehensive view of fraud detection metrics and trends",
                category="analytics",
                definition=ReportDefinition(
                    id="fraud-overview",
                    title="Fraud Overview",
                    description="Key fraud detection metrics",
                    components=[
                        ReportComponent(
                            id="risk-trend",
                            type="chart",
                            chart_type="line",
                            title="Risk Score Trends",
                            data_source="risk_scores",
                            config={"time_range": "30d"},
                            position={"x": 0, "y": 0, "width": 400, "height": 300}
                        ),
                        ReportComponent(
                            id="case-status",
                            type="chart",
                            chart_type="pie",
                            title="Case Status Distribution",
                            data_source="cases",
                            config={},
                            position={"x": 420, "y": 0, "width": 300, "height": 300}
                        )
                    ],
                    layout="grid",
                    filters=[]
                ),
                is_public=True,
                created_by="system",
                created_at=datetime.utcnow()
            ),
            ReportTemplate(
                id="transaction-analysis",
                name="Transaction Analysis Report",
                description="Detailed analysis of transaction patterns and anomalies",
                category="transactions",
                definition=ReportDefinition(
                    id="transaction-analysis",
                    title="Transaction Analysis",
                    description="Transaction pattern analysis",
                    components=[
                        ReportComponent(
                            id="transaction-volume",
                            type="chart",
                            chart_type="bar",
                            title="Transaction Volume by Day",
                            data_source="transactions",
                            config={"group_by": "date"},
                            position={"x": 0, "y": 0, "width": 500, "height": 300}
                        ),
                        ReportComponent(
                            id="suspicious-transactions",
                            type="table",
                            title="Suspicious Transactions",
                            data_source="transactions",
                            config={"filter": "risk_score > 0.7"},
                            position={"x": 0, "y": 320, "width": 800, "height": 400}
                        )
                    ],
                    layout="grid",
                    filters=[]
                ),
                is_public=True,
                created_by="system",
                created_at=datetime.utcnow()
            )
        ]

        # Filter by category if specified
        if category:
            templates = [t for t in templates if t.category == category]

        return templates

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch templates: {str(e)}")

@router.post("/templates", response_model=ReportTemplate)
async def save_report_template(
    template: ReportTemplate,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Save a custom report template.
    """
    try:
        # In a real implementation, this would be stored in a report_templates table
        template.id = str(uuid.uuid4())
        template.created_by = str(current_user.id)
        template.created_at = datetime.utcnow()

        # Log template creation
        audit_log = AuditLog(
            actor_id=current_user.id,
            action="template_created",
            resource_id=template.id,
            details={
                "template_name": template.name,
                "category": template.category
            }
        )
        db.add(audit_log)
        await db.commit()

        return template

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Template save failed: {str(e)}")

def calculate_next_run(frequency: str) -> datetime:
    """Calculate the next run time based on frequency."""
    now = datetime.utcnow()
    if frequency == 'daily':
        return now + timedelta(days=1)
    elif frequency == 'weekly':
        return now + timedelta(weeks=1)
    elif frequency == 'monthly':
        # Approximate month as 30 days
        return now + timedelta(days=30)
    else:
        return now + timedelta(days=1)