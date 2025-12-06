from fastapi import APIRouter
from app.api.v1.endpoints import login, mens_rea, adjudication, ingestion, audit, graph, ai, forensics, orchestration, subjects, compliance, dashboard, cases, reconciliation, websocket, users, summary, evidence, analysis, search, predictive, tenant, monitoring

api_router = APIRouter()

# Health check endpoint
@api_router.get("/health")
async def health_check():
    """API health check endpoint"""
    return {"status": "healthy", "api_version": "v1"}

api_router.include_router(login.router, prefix="/login", tags=["login"])
api_router.include_router(mens_rea.router, prefix="/analysis/mens-rea", tags=["mens-rea"])
api_router.include_router(analysis.router, prefix="/analysis/advanced", tags=["analysis-advanced"])
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
api_router.include_router(cases.router, prefix="/cases", tags=["cases"])
api_router.include_router(reconciliation.router, prefix="/reconciliation", tags=["reconciliation"])
api_router.include_router(evidence.router, prefix="/evidence", tags=["evidence"])
api_router.include_router(websocket.router, tags=["websocket"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(summary.router, prefix="/summary", tags=["summary"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(predictive.router, prefix="/predictive", tags=["predictive"])
api_router.include_router(tenant.router, tags=["tenant"])
api_router.include_router(monitoring.router, tags=["monitoring"])
