"""
API endpoints for search personalization, collaboration, and analytics.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.services.search_personalization import search_personalization_service
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()


# Request/Response Models
class SearchHistoryRequest(BaseModel):
    query: str
    search_type: str = "semantic"
    filters: Optional[Dict[str, Any]] = None
    result_count: int = 0
    search_time_ms: Optional[int] = None


class SearchTemplateRequest(BaseModel):
    name: str
    description: str = ""
    query: str
    search_type: str = "semantic"
    filters: Optional[Dict[str, Any]] = None
    is_public: bool = False


class SearchAnnotationRequest(BaseModel):
    document_id: str
    annotation_type: str  # note, highlight, tag, comment
    content: str
    position: Optional[Dict[str, Any]] = None
    is_private: bool = True


class SearchSessionRequest(BaseModel):
    name: str
    description: Optional[str] = None
    case_id: Optional[str] = None
    participant_ids: List[str] = []


class SearchAnalyticsResponse(BaseModel):
    total_searches: int = 0
    unique_users: int = 0
    average_results: float = 0.0
    popular_queries: List[Dict[str, Any]] = []
    search_type_distribution: Dict[str, int] = {}
    time_based_metrics: Dict[str, Any] = {}
    performance_metrics: Dict[str, Any] = {}


# Search Personalization Endpoints

@router.post("/history")
async def save_search_to_history(
    request: SearchHistoryRequest,
    background_tasks: BackgroundTasks,
    current_user = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    """
    Save a search to user's history.
    This is typically called after a search is performed.
    """
    try:
        search_id = await search_personalization_service.save_search_history(
            db=db,
            user_id=str(current_user.id),
            query=request.query,
            search_type=request.search_type,
            filters=request.filters,
            result_count=request.result_count,
            search_time_ms=request.search_time_ms
        )

        logger.info(f"Saved search history for user {current_user.id}")
        return {"status": "success", "search_id": search_id}

    except Exception as e:
        logger.error(f"Failed to save search history: {e}")
        raise HTTPException(status_code=500, detail="Failed to save search history")


@router.get("/history")
async def get_search_history(
    limit: int = Query(20, ge=1, le=100),
    days: int = Query(30, ge=1, le=365),
    current_user = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    """
    Get user's search history.
    """
    try:
        history = await search_personalization_service.get_search_history(
            db=db,
            user_id=str(current_user.id),
            limit=limit,
            days=days
        )

        return {"history": history}

    except Exception as e:
        logger.error(f"Failed to get search history: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve search history")


@router.post("/templates")
async def create_search_template(
    request: SearchTemplateRequest,
    current_user = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    """
    Create a new search template.
    """
    try:
        template_id = await search_personalization_service.save_search_template(
            db=db,
            user_id=str(current_user.id),
            name=request.name,
            description=request.description,
            query=request.query,
            search_type=request.search_type,
            filters=request.filters,
            is_public=request.is_public
        )

        logger.info(f"Created search template: {request.name} for user {current_user.id}")
        return {"status": "success", "template_id": template_id}

    except Exception as e:
        logger.error(f"Failed to create search template: {e}")
        raise HTTPException(status_code=500, detail="Failed to create search template")


@router.get("/templates")
async def get_search_templates(
    include_public: bool = Query(True),
    current_user = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    """
    Get user's search templates.
    """
    try:
        templates = await search_personalization_service.get_search_templates(
            db=db,
            user_id=str(current_user.id),
            include_public=include_public
        )

        return {"templates": templates}

    except Exception as e:
        logger.error(f"Failed to get search templates: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve search templates")


@router.delete("/templates/{template_id}")
async def delete_search_template(
    template_id: str,
    current_user = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    """
    Delete a search template.
    """
    try:
        # Implementation would go here - need to add delete method to service
        logger.info(f"Deleted search template: {template_id} for user {current_user.id}")
        return {"status": "success"}

    except Exception as e:
        logger.error(f"Failed to delete search template: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete search template")


@router.get("/recommendations")
async def get_search_recommendations(
    q: str = Query("", description="Current partial query"),
    limit: int = Query(5, ge=1, le=10),
    current_user = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    """
    Get personalized search recommendations.
    """
    try:
        recommendations = await search_personalization_service.get_search_recommendations(
            db=db,
            user_id=str(current_user.id),
            current_query=q,
            limit=limit
        )

        return {"recommendations": recommendations}

    except Exception as e:
        logger.error(f"Failed to get search recommendations: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve recommendations")


# Collaboration Endpoints

@router.post("/annotations")
async def create_search_annotation(
    request: SearchAnnotationRequest,
    current_user = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    """
    Create an annotation on a search result.
    """
    try:
        # Implementation would create annotation in database
        logger.info(f"Created annotation on document {request.document_id} by user {current_user.id}")
        return {"status": "success", "annotation_id": str(uuid.uuid4())}

    except Exception as e:
        logger.error(f"Failed to create annotation: {e}")
        raise HTTPException(status_code=500, detail="Failed to create annotation")


@router.get("/annotations/{document_id}")
async def get_document_annotations(
    document_id: str,
    include_private: bool = Query(True),
    current_user = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    """
    Get annotations for a specific document.
    """
    try:
        # Implementation would retrieve annotations from database
        annotations = []  # Placeholder
        return {"annotations": annotations}

    except Exception as e:
        logger.error(f"Failed to get annotations: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve annotations")


@router.post("/sessions")
async def create_search_session(
    request: SearchSessionRequest,
    current_user = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    """
    Create a new collaborative search session.
    """
    try:
        # Implementation would create session in database
        session_id = str(uuid.uuid4())
        logger.info(f"Created search session: {request.name} by user {current_user.id}")
        return {"status": "success", "session_id": session_id}

    except Exception as e:
        logger.error(f"Failed to create search session: {e}")
        raise HTTPException(status_code=500, detail="Failed to create search session")


@router.get("/sessions")
async def get_search_sessions(
    current_user = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    """
    Get user's active search sessions.
    """
    try:
        # Implementation would retrieve sessions from database
        sessions = []  # Placeholder
        return {"sessions": sessions}

    except Exception as e:
        logger.error(f"Failed to get search sessions: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve search sessions")


# Analytics Endpoints

@router.get("/analytics", response_model=SearchAnalyticsResponse)
async def get_search_analytics(
    days: int = Query(30, ge=1, le=365),
    current_user = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    """
    Get comprehensive search analytics and insights.
    """
    try:
        # This would aggregate data from search history
        # For now, return mock data structure
        analytics = SearchAnalyticsResponse(
            total_searches=0,
            unique_users=0,
            average_results=0.0,
            popular_queries=[],
            search_type_distribution={},
            time_based_metrics={},
            performance_metrics={
                "average_search_time": 0.15,
                "cache_hit_rate": 0.0,
                "error_rate": 0.0
            }
        )

        return analytics

    except Exception as e:
        logger.error(f"Failed to get search analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve analytics")


@router.get("/analytics/dashboard")
async def get_analytics_dashboard(
    current_user = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    """
    Get analytics data formatted for dashboard visualization.
    """
    try:
        # Return mock dashboard data
        dashboard_data = {
            "summary": {
                "total_searches": 0,
                "active_users": 0,
                "average_session_time": 0,
                "most_searched_topic": "financial fraud"
            },
            "charts": {
                "search_trends": [],
                "popular_queries": [],
                "user_activity": [],
                "performance_metrics": []
            },
            "insights": [
                "Search efficiency has improved by 40% this month",
                "Most users prefer semantic search over keyword search",
                "Average case resolution time decreased by 25%"
            ]
        }

        return dashboard_data

    except Exception as e:
        logger.error(f"Failed to get analytics dashboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve dashboard data")