from fastapi import APIRouter
from app.api.v1.endpoints import login, mens_rea, adjudication, ingestion, audit, graph, ai, forensics, orchestration, subjects, compliance, dashboard

api_router = APIRouter()
api_router.include_router(login.router, prefix="/login", tags=["login"])
api_router.include_router(mens_rea.router, prefix="/analysis/mens-rea", tags=["mens-rea"])
api_router.include_router(adjudication.router, prefix="/adjudication", tags=["adjudication"])
api_router.include_router(ingestion.router, prefix="/ingestion", tags=["ingestion"])
api_router.include_router(audit.router, prefix="/audit-logs", tags=["audit"])
api_router.include_router(graph.router, prefix="/graph", tags=["graph"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(forensics.router, prefix="/forensics", tags=["forensics"])
api_router.include_router(orchestration.router, prefix="/orchestration", tags=["orchestration"])
api_router.include_router(subjects.router, prefix="/subjects", tags=["subjects"])
api_router.include_router(compliance.router, prefix="/compliance", tags=["compliance"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
