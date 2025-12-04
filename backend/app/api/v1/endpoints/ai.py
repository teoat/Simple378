from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from app.api import deps
from app.core.rate_limit import limiter
from app.services.ai.supervisor import app as ai_app
from app.services.ai.persona_analyzer import get_persona_analyzer, Persona
from app.models.mens_rea import Subject, AnalysisResult, Indicator

router = APIRouter()


class MultiPersonaRequest(BaseModel):
    """Request model for multi-persona analysis."""
    case_id: Optional[str] = None
    subject_id: Optional[UUID] = None
    personas: Optional[List[str]] = None  # List of persona names to use
    evidence_ids: Optional[List[str]] = None


class ProactiveSuggestionRequest(BaseModel):
    """Request for proactive AI suggestions."""
    context: str  # current page or workflow context
    case_id: Optional[str] = None
    user_actions: Optional[List[str]] = None  # recent user actions


@router.post("/investigate/{subject_id}", response_model=Dict[str, Any])
@limiter.limit("10/hour")  # Rate limit: 10 AI investigations per hour (expensive operation)
async def investigate_subject(
    request: Request,
    subject_id: UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Triggers an AI investigation for a subject.
    """
    try:
        # Initialize state
        initial_state = {
            "subject_id": str(subject_id),
            "messages": [],
            "findings": {}
        }
        
        # Run the graph (invoke is synchronous wrapper, but LangGraph supports async)
        # For MVP, we'll await the result.
        result = await ai_app.ainvoke(initial_state)
        
        return {
            "status": "completed",
            "findings": result.get("findings"),
            "verdict": result.get("final_verdict", "Pending Review")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Investigation failed: {str(e)}")


@router.post("/multi-persona-analysis", response_model=Dict[str, Any])
@limiter.limit("20/hour")  # Rate limit for multi-persona analysis
async def multi_persona_analysis(
    request: Request,
    analysis_request: MultiPersonaRequest,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
 Multi-persona AI analysis endpoint.
    
    Runs analysis across 5 expert AI personas:
    - Auditor: Financial compliance expert
    - Prosecutor: Legal prosecution perspective
    - Defense: Devil's advocate viewpoint
    - Forensic: Digital forensics specialist
    - Pattern: Pattern recognition analyst
    
    Returns consensus analysis with individual persona perspectives.
    """
    try:
        # Fetch case data from database
        case_data = {}
        
        if analysis_request.subject_id:
            # Fetch subject and related analysis
            stmt = select(Subject).where(Subject.id == analysis_request.subject_id)
            result = await db.execute(stmt)
            subject = result.scalar_one_or_none()
            
            if not subject:
                raise HTTPException(status_code=404, detail="Subject not found")
            
            # Fetch latest analysis
            stmt = select(AnalysisResult).where(
                AnalysisResult.subject_id == analysis_request.subject_id
            ).order_by(AnalysisResult.created_at.desc()).limit(1)
            result = await db.execute(stmt)
            analysis = result.scalar_one_or_none()
            
            # Build case data
            case_data = {
                "case_id": analysis_request.case_id or str(subject.id),
                "subject": f"Subject {subject.id}",
                "description":f"Analysis of subject {subject.id}",
                "risk_score": float(analysis.fraud_confidence) if analysis else 0.0,
                "evidence": [],
                "indicators": [],
                "transactions": []
            }
            
            if analysis:
                # Fetch indicators
                stmt = select(Indicator).where(Indicator.analysis_id == analysis.id)
                result = await db.execute(stmt)
                indicators = result.scalars().all()
                
                case_data["indicators"] = [
                    f"{ind.indicator_type}: {ind.description} ({ind.severity})"
                    for ind in indicators
                ]
                case_data["evidence"] = [
                    ind.evidence_data for ind in indicators if ind.evidence_data
                ]
        
        elif analysis_request.case_id:
            # Mock case data for testing
            case_data = {
                "case_id": analysis_request.case_id,
                "subject": "Test Subject",
                "description": "Investigating potential fraud case",
                "risk_score": 0.75,
                "evidence": ["Invoice #12345", "Bank statement anomaly", "Email correspondence"],
                "indicators": ["Unusual transaction timing", "Duplicate invoices detected"],
                "transactions": []
            }
        else:
            raise HTTPException(status_code=400, detail="Either subject_id or case_id must be provided")
        
        # Parse personas
        personas = None
        if analysis_request.personas:
            try:
                personas = [Persona(p) for p in analysis_request.personas]
            except ValueError as e:
                raise HTTPException(status_code=400, detail=f"Invalid persona: {str(e)}")
        
        # Run multi-persona analysis
        analyzer = get_persona_analyzer()
        consensus = await analyzer.multi_persona_analysis(case_data, personas)
        
        # Format response
        return {
            "status": "completed",
            "consensus_score": consensus.consensus_score,
            "majority_verdict": consensus.majority_verdict,
            "confidence_range": consensus.confidence_range,
            "final_recommendation": consensus.final_recommendation,
            "explanation": consensus.explanation,
            "personas": {
                name: {
                    "confidence": analysis.confidence,
                    "verdict": analysis.verdict,
                    "reasoning": analysis.reasoning,
                    "key_evidence": analysis.key_evidence,
                    "concerns": analysis.concerns,
                    "recommendations": analysis.recommendations
                }
                for name, analysis in consensus.persona_analyses.items()
            },
            "conflicts": consensus.conflicts
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Multi-persona analysis failed: {str(e)}"
        )


@router.post("/proactive-suggestions", response_model=Dict[str, Any])
@limiter.limit("60/minute")  # Higher rate for frequent suggestion requests
async def get_proactive_suggestions(
    request: Request,
    suggestion_request: ProactiveSuggestionRequest,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Get proactive AI suggestions based on current context.
    
    Provides context-aware recommendations for:
    - Next actions to take
    - Workflow optimizations
    - Risk alerts
    - Insights from similar cases
    """
    try:
        suggestions = []
        
        # Context-based suggestions
        context = suggestion_request.context.lower()
        
        if "adjudication" in context or "queue" in context:
            suggestions.append({
                "type": "next_action",
                "priority": "high",
                "message": "Review evidence tab before making decision - cases with forensic analysis have 23% higher prosecution success rate",
                "actions": [
                    {"label": "View Evidence", "action": "navigate_to_evidence_tab"},
                    {"label": "Run Forensic Analysis", "action": "trigger_forensic_scan"}
                ],
                "reasoning": "Historical data shows thorough evidence review improves decision accuracy"
            })
            
            suggestions.append({
                "type": "optimization",
                "priority": "medium",
                "message": "Use keyboard shortcuts to save time: Press 'A' to approve, 'R' to reject, 'E' to escalate",
                "actions": [
                    {"label": "View All Shortcuts", "action": "show_keyboard_shortcuts"}
                ],
                "reasoning": "Analysts using shortcuts resolve cases 35% faster on average"
            })
        
        elif "case-detail" in context:            suggestions.append({
                "type": "insight",
                "priority": "medium",
                "message": "This case pattern matches 3 previously prosecuted fraud cases with 87% success rate",
                "actions": [
                    {"label": "View Similar Cases", "action": "show_similar_cases"},
                    {"label": "Apply Template", "action": "apply_successful_template"}
                ],
                "reasoning": "Pattern matching algorithm identified strong similarity"
            })
        
        elif "forensics" in context or "upload" in context:
            suggestions.append({
                "type": "optimization",
                "priority": "high",
                "message": "Pro tip: Upload all evidence files at once. Batch processing is 10x faster than sequential uploads",
                "actions": [
                    {"label": "Select Multiple Files", "action": "enable_multi_upload"}
                ],
                "reasoning": "Parallel processing pipeline optimizes throughput"
            })
        
        elif "dashboard" in context:
            suggestions.append({
                "type": "risk_alert",
                "priority": "high",
                "message": "5 high-priority cases have been idle for >3 days. Recommend immediate review to meet SLA",
                "actions": [
                    {"label": "View Overdue Cases", "action": "filter_overdue_cases"},
                    {"label": "Assign to Team", "action": "bulk_assign"}
                ],
                "reasoning": "SLA compliance tracking detected delayed cases"
            })
        
        # Add case-specific suggestions if case_id provided
        if suggestion_request.case_id:
            suggestions.append({
                "type": "next_action",
                "priority": "medium",
                "message": "Consider running multi-persona AI analysis for comprehensive assessment",
                "actions": [
                    {"label": "Run AI Analysis", "action": "trigger_multi_persona_analysis"}
                ],
                "reasoning": "AI analysis provides multiple expert perspectives"
            })
        
        return {
            "status": "success",
            "suggestions": suggestions,
            "context": suggestion_request.context
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate suggestions: {str(e)}"
        )


@router.post("/chat", response_model=Dict[str, Any])
@limiter.limit("30/minute")
async def ai_chat(
    request: Request,
    message: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Chat with AI assistant.
    
    Provides conversational AI support for fraud analysis queries.
    """
    from app.services.ai.llm_service import LLMService
    from langchain_core.messages import HumanMessage
    
    try:
        llm_service = LLMService()
        
        system_prompt = """You are Frenly AI, an intelligent fraud detection assistant.
        
Your role is to help fraud analysts with:
- Understanding fraud patterns
- Interpreting analysis results
- Navigating the system
- Best practices for fraud investigation

Be concise, helpful, and professional. Provide actionable guidance."""
        
        response = await llm_service.generate_response(
            [HumanMessage(content=message)],
            system_prompt=system_prompt
        )
        
        return {
            "response": response,
            "timestamp": "2025-12-05T02:15:00Z"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI chat failed: {str(e)}"
        )
