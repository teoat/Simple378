from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict
from datetime import datetime, timedelta
from app.schemas.analysis import (
    AnalysisResult, 
    RiskForecastRequest, 
    RiskForecast, 
    ShortestPathRequest,
    ShortestPathResult,
    CommunityResult,
    CentralityResult
)
from app.services.heuristic_engine import HeuristicEngine
from app.services.risk_forecast import RiskForecastService
from app.services.graph_analytics import GraphAnalyticsService

# In a real app, these services would be injected via dependency injection
heuristic_engine = HeuristicEngine()
risk_service = RiskForecastService()
graph_service = GraphAnalyticsService()

router = APIRouter()

@router.post("/evaluate/{subject_id}", response_model=AnalysisResult)
async def evaluate_subject(subject_id: str, context: Dict):
    """
    Evaluates heuristic rules for a subject given a transaction context.
    """
    # 1. Run Heuristics
    triggered_rules = heuristic_engine.evaluate_transaction(context)
    
    # Calculate simple risk score aggregator (demo logic)
    base_score = 10
    for rule in triggered_rules:
        if rule.severity == 'critical': base_score += 50
        elif rule.severity == 'high': base_score += 25
        elif rule.severity == 'medium': base_score += 10
        elif rule.severity == 'low': base_score += 5
    
    risk_score = min(100, base_score)

    return AnalysisResult(
        subject_id=subject_id,
        risk_score=risk_score,
        triggered_rules=triggered_rules
    )

@router.post("/forecast", response_model=RiskForecast)
async def forecast_risk(request: RiskForecastRequest):
    """
    Forecasts risk score based on mock history data (Real app would query DB).
    """
    # Mock history extraction
    # In production: history = db.query(RiskScoreHistory).filter(...)
    now = datetime.utcnow()
    mock_history = [
        (now - timedelta(days=90), 20.0),
        (now - timedelta(days=60), 25.0),
        (now - timedelta(days=30), 40.0),
        (now - timedelta(days=1), 45.0),
    ]
    
    return risk_service.forecast_risk(request, mock_history)

@router.post("/graph/communities", response_model=List[CommunityResult])
async def detect_communities(nodes: List[Dict], edges: List[Dict]):
    """
    Ad-hoc community detection on provided graph data.
    """
    graph_service.build_graph_from_data(nodes, edges)
    return graph_service.detect_communities()

@router.post("/graph/centrality", response_model=List[CentralityResult])
async def detect_centrality(nodes: List[Dict], edges: List[Dict]):
    """
    Ad-hoc centrality analysis on provided graph data.
    """
    graph_service.build_graph_from_data(nodes, edges)
    return graph_service.calculate_centrality()

@router.post("/graph/shortest-path", response_model=ShortestPathResult)
async def shortest_path(req: ShortestPathRequest, nodes: List[Dict], edges: List[Dict]):
    """
    Find shortest path in the provided graph.
    """
    graph_service.build_graph_from_data(nodes, edges)
    return graph_service.find_shortest_path(req.source_id, req.target_id)

# --- Phase 3 & 4 Additions ---

from app.services.compliance_report import ComplianceReportService
from app.services.entity_resolution import EntityResolutionService, EntityMatch
from app.services.sar_generator import SARGeneratorService

report_service = ComplianceReportService()
resolution_service = EntityResolutionService()
sar_service = SARGeneratorService()

@router.post("/report/{subject_id}")
async def generate_report(subject_id: str, analysis_result: AnalysisResult, forecast: RiskForecast):
    """
    Generates a full compliance report.
    """
    return report_service.generate_heuristic_report(subject_id, analysis_result, forecast)

@router.post("/resolution/duplicates", response_model=List[EntityMatch])
async def find_duplicates(entities: List[Dict[str, str]]):
    """
    Finds duplicate entities in the provided list.
    """
    return resolution_service.find_duplicates(entities)

@router.post("/sar/generate")
async def generate_sar(subject_name: str, triggered_rules: List[Dict], risk_score: float):
    """
    Generates a SAR narrative (mocked AI).
    """
    # Convert dict back to RuleResult schema for internal service if needed, 
    # but service is flexible. We'll pass objects if possible or adapt.
    # For now, simplistic adaptation:
    from app.schemas.analysis import RuleResult
    rules_objs = []
    for r in triggered_rules:
        rules_objs.append(RuleResult(
            rule_id=r.get('rule_id', 'unknown'),
            rule_name=r.get('rule_name', 'unknown'),
            triggered=True,
            severity=r.get('severity', 'low'),
            context=r.get('context', {})
        ))
        
    return {"narrative": sar_service.generate_narrative(subject_name, rules_objs, risk_score)}
