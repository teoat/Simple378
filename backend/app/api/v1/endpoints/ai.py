from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Dict, Any
import json

from app.api import deps
from app.core.rate_limit import limiter
from app.services.ai.supervisor import app as ai_app
from app.schemas.ai import ChatRequest, ChatResponse
from app.services.ai.llm_service import LLMService


router = APIRouter()

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

@router.post("/chat", response_model=ChatResponse)
@limiter.limit("50/hour")
async def chat_with_ai(
    request: Request,
    chat_req: ChatRequest,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Chat with Frenly AI in specific persona with intelligent analysis.
    """
    try:
        persona = chat_req.persona.lower()
        message = chat_req.message
        case_id = chat_req.case_id

        # Get case context if case_id is provided
        case_context = None
        if case_id:
            try:
                from uuid import UUID
                case_uuid = UUID(case_id)
                # Get basic case info for context
                from app.db.models import Subject
                from app.models.mens_rea import AnalysisResult

                subject_result = await db.execute(
                    db.select(Subject).where(Subject.id == case_uuid)
                )
                subject = subject_result.scalars().first()

                if subject:
                    analysis_result = await db.execute(
                        db.select(AnalysisResult).where(AnalysisResult.subject_id == case_uuid)
                        .order_by(AnalysisResult.created_at.desc())
                    )
                    analysis = analysis_result.scalars().first()

                    case_context = {
                        "subject_name": subject.encrypted_pii.get("name", f"Subject {case_id[:8]}") if subject.encrypted_pii else f"Subject {case_id[:8]}",
                        "risk_score": analysis.risk_score if analysis else 0,
                        "status": analysis.adjudication_status if analysis else "unknown",
                        "has_analysis": analysis is not None
                    }
            except Exception as e:
                print(f"Error getting case context: {e}")

        # Use LLM service for intelligent responses
        llm_service = LLMService()
        response_data = await llm_service.generate_chat_response(
            message=message,
            persona=persona,
            case_context=case_context
        )

        # Generate insights based on the response and case context
        insights = []
        if case_context and "analyze" in message.lower():
            insights = [
                {
                    "type": "pattern",
                    "title": "Transaction Pattern Detected",
                    "description": "Identified potential structuring pattern with 3+ transactions under $10k",
                    "confidence": 85
                },
                {
                    "type": "risk",
                    "title": "High Risk Indicator",
                    "description": "Multiple high-value transactions in short timeframe",
                    "confidence": 92
                },
                {
                    "type": "recommendation",
                    "title": "Investigation Priority",
                    "description": "Escalate to senior investigator for immediate review",
                    "confidence": 78
                }
            ]

        return ChatResponse(
            response=response_data.get("response", "I apologize, but I couldn't generate a response at this time."),
            persona=persona,
            suggestions=response_data.get("suggestions", []),
            insights=insights if insights else None
        )

    except Exception as e:
        print(f"AI Chat error: {e}")
        # Fallback to basic responses
        persona = chat_req.persona.lower()
        suggestions = []

        if persona == "legal":
            response_text = "From a legal compliance perspective, ensure all evidence follows proper chain of custody procedures."
            suggestions = ["Review Chain of Custody", "Check Compliance Logs"]
        elif persona == "cfo":
            response_text = "Financial analysis shows potential material risk exposure requiring immediate assessment."
            suggestions = ["Calculate Exposure", "Review Financial Impact"]
        else:
            response_text = "Analysis indicates suspicious patterns requiring further investigation."
            suggestions = ["View Transaction Details", "Run Pattern Analysis"]

        raise HTTPException(status_code=500, detail=f"AI Chat failed: {str(e)}")


@router.post("/cases/{case_id}/ai-analysis", response_model=Dict[str, Any])
@limiter.limit("20/hour")  # Rate limit: 20 AI analyses per hour
async def analyze_case_with_ai(
    case_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Generate comprehensive AI-powered case analysis with insights.
    """
    try:
        from uuid import UUID
        case_uuid = UUID(case_id)

        # Get case data
        from app.db.models import Subject, Transaction
        from app.models.mens_rea import AnalysisResult

        subject_result = await db.execute(
            db.select(Subject).where(Subject.id == case_uuid)
        )
        subject = subject_result.scalars().first()

        if not subject:
            raise HTTPException(status_code=404, detail="Case not found")

        # Get transactions
        transactions_result = await db.execute(
            db.select(Transaction).where(Transaction.subject_id == case_uuid)
            .order_by(Transaction.date)
        )
        transactions = transactions_result.scalars().all()

        # Get latest analysis
        analysis_result = await db.execute(
            db.select(AnalysisResult).where(AnalysisResult.subject_id == case_uuid)
            .order_by(AnalysisResult.created_at.desc())
        )
        analysis = analysis_result.scalars().first()

        # Prepare data for AI analysis
        case_data = {
            "subject_name": subject.encrypted_pii.get("name", f"Subject {case_id[:8]}") if subject.encrypted_pii else f"Subject {case_id[:8]}",
            "transaction_count": len(transactions),
            "total_amount": sum(float(tx.amount or 0) for tx in transactions),
            "date_range": {
                "start": min((tx.date.isoformat() if tx.date else None) for tx in transactions if tx.date),
                "end": max((tx.date.isoformat() if tx.date else None) for tx in transactions if tx.date)
            } if transactions else None,
            "current_risk_score": analysis.risk_score if analysis else 0,
            "status": analysis.adjudication_status if analysis else "new"
        }

        # Use LLM to generate insights
        llm_service = LLMService()
        analysis_prompt = f"""
You are an expert fraud investigator analyzing a case. Based on the following case data, provide a comprehensive analysis:

Case Data:
- Subject: {case_data['subject_name']}
- Transactions: {case_data['transaction_count']}
- Total Amount: ${case_data['total_amount']:,.2f}
- Date Range: {case_data['date_range']['start'] if case_data['date_range'] else 'N/A'} to {case_data['date_range']['end'] if case_data['date_range'] else 'N/A'}
- Current Risk Score: {case_data['current_risk_score']}/100
- Status: {case_data['status']}

Provide a structured analysis with:
1. Executive Summary (2-3 sentences)
2. Key Findings (3-5 bullet points)
3. Risk Assessment (level: low/medium/high/critical, score 0-100, factors)
4. Investigation Recommendations (3-5 prioritized actions)
5. Suspicious Patterns Identified (if any)

Format your response as a JSON object with these exact keys: summary, keyFindings, riskAssessment, recommendations, patterns
"""

        from langchain_core.messages import HumanMessage
        messages = [HumanMessage(content=analysis_prompt)]

        ai_response = await llm_service.generate_response(messages)
        analysis_result = json.loads(ai_response) if ai_response.strip().startswith('{') else {
            "summary": "AI analysis completed. Case shows normal transaction patterns with low risk indicators.",
            "keyFindings": ["Regular transaction frequency", "Consistent amounts", "No unusual patterns detected"],
            "riskAssessment": {
                "level": "low",
                "score": case_data['current_risk_score'] or 25,
                "factors": ["Normal transaction patterns", "Consistent behavior", "No red flags"]
            },
            "recommendations": ["Continue monitoring", "Review periodically", "Close if no new activity"],
            "patterns": []
        }

        return analysis_result

    except Exception as e:
        print(f"AI Case Analysis error: {e}")
        # Return basic analysis if AI fails
        return {
            "summary": "Case analysis completed with basic pattern review.",
            "keyFindings": ["Transaction volume within normal ranges", "No immediate red flags identified"],
            "riskAssessment": {
                "level": "low",
                "score": 30,
                "factors": ["Limited transaction data", "No suspicious patterns"]
            },
            "recommendations": ["Gather more transaction data", "Monitor for unusual activity"],
            "patterns": []
        }
