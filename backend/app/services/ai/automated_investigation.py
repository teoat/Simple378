from typing import Dict, Any, List, Optional, Callable
from datetime import datetime, timedelta
import asyncio
from enum import Enum
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, and_, or_, update
from app.db.models import Subject, Transaction, AuditLog, ActionType
from app.db.models import AnalysisResult
from app.services.ai.llm_service import LLMService
from app.services.ai.case_classifier import CaseClassifier
from app.services.ai.predictive_fraud_prevention import PredictiveFraudPrevention
from app.services.notification_service import NotificationService

class InvestigationStep(Enum):
    INITIAL_ANALYSIS = "initial_analysis"
    TRANSACTION_REVIEW = "transaction_review"
    PATTERN_ANALYSIS = "pattern_analysis"
    ENTITY_VERIFICATION = "entity_verification"
    RISK_ASSESSMENT = "risk_assessment"
    DECISION_MAKING = "decision_making"
    CASE_CLOSURE = "case_closure"
    ESCALATION = "escalation"

class AutomatedInvestigationWorkflow:
    """
    AI-powered automated investigation workflow system.
    """

    def __init__(self):
        self.llm_service = LLMService()
        self.case_classifier = CaseClassifier()
        self.fraud_prevention = PredictiveFraudPrevention()
        self.notification_service = NotificationService()
        self.workflows: Dict[str, InvestigationWorkflow] = {}

    def register_workflow(self, workflow: 'InvestigationWorkflow'):
        """Register an investigation workflow."""
        self.workflows[workflow.id] = workflow

    async def start_investigation(self, subject_id: str, db: AsyncSession) -> Dict[str, Any]:
        """
        Start an automated investigation for a subject.
        """
        # Classify the case
        categorization = await self.case_classifier.categorize_case(subject_id, db)

        # Select appropriate workflow
        workflow = self._select_workflow(categorization)

        if not workflow:
            return {
                "status": "no_workflow",
                "message": "No suitable workflow found for case type",
                "categorization": categorization
            }

        # Initialize workflow execution
        execution = WorkflowExecution(workflow, subject_id, categorization)

        # Execute initial steps
        results = await execution.execute_step(InvestigationStep.INITIAL_ANALYSIS, db)

        # Log workflow start
        audit_log = AuditLog(
            actor_id=None,  # System
            action="workflow_started",
            resource_id=subject_id,
            details={
                "workflow_id": workflow.id,
                "categorization": categorization,
                "initial_step": InvestigationStep.INITIAL_ANALYSIS.value
            }
        )
        db.add(audit_log)
        await db.commit()

        return {
            "status": "started",
            "workflow_id": workflow.id,
            "execution_id": execution.id,
            "current_step": execution.current_step,
            "categorization": categorization,
            "initial_results": results
        }

    async def continue_investigation(self, execution_id: str, db: AsyncSession) -> Dict[str, Any]:
        """
        Continue an ongoing investigation workflow.
        """
        # Find execution (in real implementation, this would be stored in database)
        # For now, we'll simulate continuation

        return {
            "status": "continued",
            "message": "Investigation workflow continued"
        }

    async def execute_workflow_step(self, subject_id: str, step: InvestigationStep, db: AsyncSession) -> Dict[str, Any]:
        """
        Execute a specific workflow step.
        """
        # Get case categorization
        categorization = await self.case_classifier.categorize_case(subject_id, db)

        # Select workflow
        workflow = self._select_workflow(categorization)

        if not workflow:
            return {"error": "No workflow available"}

        # Execute step
        execution = WorkflowExecution(workflow, subject_id, categorization)
        results = await execution.execute_step(step, db)

        return {
            "step": step.value,
            "results": results,
            "next_steps": execution.get_next_steps()
        }

    def _select_workflow(self, categorization: Dict[str, Any]) -> Optional['InvestigationWorkflow']:
        """Select appropriate workflow based on case categorization."""
        category = categorization.get('category', 'SUSPICIOUS_ACTIVITY')
        risk_level = categorization.get('risk_level', 'MEDIUM')

        # Select workflow based on category and risk
        if category == 'MONEY_LAUNDERING' or risk_level == 'CRITICAL':
            return self.workflows.get('high_risk_investigation')

        elif category == 'FRAUD' or risk_level == 'HIGH':
            return self.workflows.get('fraud_investigation')

        elif category == 'REGULATORY_VIOLATION':
            return self.workflows.get('compliance_investigation')

        else:
            return self.workflows.get('standard_investigation')

class InvestigationWorkflow:
    """
    Defines a complete investigation workflow.
    """

    def __init__(self, workflow_id: str, name: str, description: str):
        self.id = workflow_id
        self.name = name
        self.description = description
        self.steps: Dict[InvestigationStep, WorkflowStep] = {}

    def add_step(self, step_type: InvestigationStep, step: 'WorkflowStep'):
        """Add a step to the workflow."""
        self.steps[step_type] = step

    def get_step(self, step_type: InvestigationStep) -> Optional['WorkflowStep']:
        """Get a workflow step."""
        return self.steps.get(step_type)

class WorkflowStep:
    """
    Represents a single step in an investigation workflow.
    """

    def __init__(self, step_type: InvestigationStep, name: str, action: Callable, conditions: Optional[Dict[str, Any]] = None):
        self.step_type = step_type
        self.name = name
        self.action = action
        self.conditions = conditions or {}

    async def execute(self, context: Dict[str, Any], db: AsyncSession) -> Dict[str, Any]:
        """Execute the workflow step."""
        # Check conditions
        if not self._check_conditions(context):
            return {"status": "skipped", "reason": "Conditions not met"}

        # Execute action
        try:
            result = await self.action(context, db)
            return {
                "status": "completed",
                "step": self.step_type.value,
                "result": result
            }
        except Exception as e:
            return {
                "status": "failed",
                "step": self.step_type.value,
                "error": str(e)
            }

    def _check_conditions(self, context: Dict[str, Any]) -> bool:
        """Check if step conditions are met."""
        for condition_key, condition_value in self.conditions.items():
            context_value = context.get(condition_key)
            if context_value != condition_value:
                return False
        return True

class WorkflowExecution:
    """
    Manages the execution of a workflow instance.
    """

    def __init__(self, workflow: InvestigationWorkflow, subject_id: str, categorization: Dict[str, Any]):
        self.id = f"execution_{subject_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        self.workflow = workflow
        self.subject_id = subject_id
        self.categorization = categorization
        self.current_step = InvestigationStep.INITIAL_ANALYSIS
        self.completed_steps: List[InvestigationStep] = []
        self.step_results: Dict[str, Any] = {}

    async def execute_step(self, step: InvestigationStep, db: AsyncSession) -> Dict[str, Any]:
        """Execute a specific workflow step."""
        workflow_step = self.workflow.get_step(step)
        if not workflow_step:
            return {"error": f"Step {step.value} not found in workflow"}

        context = {
            "subject_id": self.subject_id,
            "categorization": self.categorization,
            "previous_results": self.step_results
        }

        result = await workflow_step.execute(context, db)

        if result["status"] == "completed":
            self.completed_steps.append(step)
            self.step_results[step.value] = result
            self.current_step = self._get_next_step()

        return result

    def get_next_steps(self) -> List[InvestigationStep]:
        """Get available next steps."""
        next_steps = []

        # Define workflow progression
        step_order = [
            InvestigationStep.INITIAL_ANALYSIS,
            InvestigationStep.TRANSACTION_REVIEW,
            InvestigationStep.PATTERN_ANALYSIS,
            InvestigationStep.ENTITY_VERIFICATION,
            InvestigationStep.RISK_ASSESSMENT,
            InvestigationStep.DECISION_MAKING,
            InvestigationStep.CASE_CLOSURE
        ]

        current_index = step_order.index(self.current_step) if self.current_step in step_order else -1

        if current_index >= 0 and current_index < len(step_order) - 1:
            next_steps.append(step_order[current_index + 1])

        # Always allow escalation
        if InvestigationStep.ESCALATION not in self.completed_steps:
            next_steps.append(InvestigationStep.ESCALATION)

        return next_steps

    def _get_next_step(self) -> InvestigationStep:
        """Determine the next step in the workflow."""
        next_steps = self.get_next_steps()
        return next_steps[0] if next_steps else InvestigationStep.CASE_CLOSURE

# Workflow Step Actions
class WorkflowActions:
    """Collection of workflow step actions."""

    @staticmethod
    async def initial_analysis(context: Dict[str, Any], db: AsyncSession) -> Dict[str, Any]:
        """Perform initial case analysis."""
        subject_id = context["subject_id"]
        categorization = context["categorization"]

        # Get basic case data
        case_classifier = CaseClassifier()
        detailed_analysis = await case_classifier.categorize_case(subject_id, db)

        # Get transaction summary
        subject_uuid = __import__('uuid').UUID(subject_id)
        tx_query = select(Transaction).where(Transaction.subject_id == subject_uuid).limit(50)
        tx_result = await db.execute(tx_query)
        transactions = tx_result.scalars().all()

        transaction_summary = {
            "count": len(transactions),
            "total_amount": sum(float(tx.amount or 0) for tx in transactions),
            "avg_amount": sum(float(tx.amount or 0) for tx in transactions) / len(transactions) if transactions else 0,
            "date_range": {
                "start": min((tx.date for tx in transactions if tx.date), default=None),
                "end": max((tx.date for tx in transactions if tx.date), default=None)
            }
        }

        return {
            "categorization": detailed_analysis,
            "transaction_summary": transaction_summary,
            "risk_assessment": categorization,
            "next_recommended_steps": ["transaction_review", "pattern_analysis"]
        }

    @staticmethod
    async def transaction_review(context: Dict[str, Any], db: AsyncSession) -> Dict[str, Any]:
        """Review transactions for suspicious patterns."""
        subject_id = context["subject_id"]

        subject_uuid = __import__('uuid').UUID(subject_id)
        tx_query = select(Transaction).where(Transaction.subject_id == subject_uuid).order_by(desc(Transaction.date))
        tx_result = await db.execute(tx_query)
        transactions = tx_result.scalars().all()

        # Analyze transactions for red flags
        red_flags = []

        # Check for high-value transactions
        high_value = [tx for tx in transactions if float(tx.amount or 0) > 10000]
        if high_value:
            red_flags.append({
                "type": "high_value_transactions",
                "count": len(high_value),
                "total_amount": sum(float(tx.amount or 0) for tx in high_value),
                "transactions": [{"id": str(tx.id), "amount": float(tx.amount or 0), "date": tx.date} for tx in high_value[:5]]
            })

        # Check for round amounts
        round_amounts = [tx for tx in transactions if float(tx.amount or 0) % 100 == 0 and float(tx.amount or 0) > 500]
        if round_amounts:
            red_flags.append({
                "type": "round_amounts",
                "count": len(round_amounts),
                "transactions": [{"id": str(tx.id), "amount": float(tx.amount or 0)} for tx in round_amounts[:5]]
            })

        # Check for unusual timing
        unusual_timing = [tx for tx in transactions if tx.date and (tx.date.hour < 6 or tx.date.hour > 22)]
        if unusual_timing:
            red_flags.append({
                "type": "unusual_timing",
                "count": len(unusual_timing),
                "transactions": [{"id": str(tx.id), "hour": tx.date.hour if tx.date else None} for tx in unusual_timing[:5]]
            })

        return {
            "total_transactions": len(transactions),
            "red_flags": red_flags,
            "suspicious_count": len(red_flags),
            "recommendations": WorkflowActions._generate_transaction_recommendations(red_flags)
        }

    @staticmethod
    async def pattern_analysis(context: Dict[str, Any], db: AsyncSession) -> Dict[str, Any]:
        """Analyze patterns in transaction data."""
        subject_id = context["subject_id"]

        subject_uuid = __import__('uuid').UUID(subject_id)
        tx_query = select(Transaction).where(Transaction.subject_id == subject_uuid).order_by(Transaction.date)
        tx_result = await db.execute(tx_query)
        transactions = tx_result.scalars().all()

        if len(transactions) < 5:
            return {"error": "Insufficient transaction data for pattern analysis"}

        # Analyze temporal patterns
        dates = [tx.date for tx in transactions if tx.date]
        amounts = [float(tx.amount or 0) for tx in transactions]

        temporal_patterns = WorkflowActions._analyze_temporal_patterns(dates, amounts)
        amount_patterns = WorkflowActions._analyze_amount_patterns(amounts)
        merchant_patterns = WorkflowActions._analyze_merchant_patterns(transactions)

        # Detect suspicious patterns
        suspicious_patterns = []

        # Check for structuring (multiple transactions just under reporting threshold)
        under_threshold = [amt for amt in amounts if 9000 < amt < 10000]
        if len(under_threshold) >= 3:
            suspicious_patterns.append({
                "type": "structuring",
                "description": "Multiple transactions just under $10,000 reporting threshold",
                "confidence": 0.8,
                "evidence": f"{len(under_threshold)} transactions between $9,000-$10,000"
            })

        # Check for velocity (rapid succession of transactions)
        if temporal_patterns.get("avg_gap_hours", 24) < 1:
            suspicious_patterns.append({
                "type": "high_velocity",
                "description": "Unusually rapid transaction frequency",
                "confidence": 0.7,
                "evidence": f"Average gap: {temporal_patterns['avg_gap_hours']:.1f} hours"
            })

        return {
            "temporal_patterns": temporal_patterns,
            "amount_patterns": amount_patterns,
            "merchant_patterns": merchant_patterns,
            "suspicious_patterns": suspicious_patterns,
            "pattern_confidence": len(suspicious_patterns) / max(len(transactions) / 10, 1)
        }

    @staticmethod
    async def entity_verification(context: Dict[str, Any], db: AsyncSession) -> Dict[str, Any]:
        """Verify entity information and relationships."""
        subject_id = context["subject_id"]

        subject_uuid = __import__('uuid').UUID(subject_id)
        subject_query = select(Subject).where(Subject.id == subject_uuid)
        subject_result = await db.execute(subject_query)
        subject = subject_result.scalars().first()

        verification_results = {
            "identity_verified": False,
            "address_verified": False,
            "relationships_analyzed": False,
            "risk_factors": []
        }

        # Check if PII exists
        if subject and subject.encrypted_pii:
            verification_results["identity_verified"] = True
            pii_data = subject.encrypted_pii

            # Check for complete identity information
            has_name = bool(pii_data.get("name"))
            has_address = bool(pii_data.get("address"))
            has_id_number = bool(pii_data.get("id_number"))

            verification_results["identity_complete"] = has_name and has_address and has_id_number

            if not has_address:
                verification_results["risk_factors"].append("Missing address information")

            if not has_id_number:
                verification_results["risk_factors"].append("Missing identification number")
        else:
            verification_results["risk_factors"].append("No identity information available")

        return verification_results

    @staticmethod
    async def risk_assessment(context: Dict[str, Any], db: AsyncSession) -> Dict[str, Any]:
        """Perform comprehensive risk assessment."""
        subject_id = context["subject_id"]
        categorization = context["categorization"]

        # Use predictive fraud prevention for risk assessment
        fraud_prevention = PredictiveFraudPrevention()
        risk_analysis = await fraud_prevention.predict_case_escalation_risk(subject_id, db)

        # Combine with categorization
        final_risk_score = max(
            categorization.get("confidence", 0) * 100,
            risk_analysis.get("escalation_probability", 0) * 100
        )

        risk_level = "low"
        if final_risk_score > 80:
            risk_level = "critical"
        elif final_risk_score > 60:
            risk_level = "high"
        elif final_risk_score > 40:
            risk_level = "medium"

        return {
            "final_risk_score": final_risk_score,
            "risk_level": risk_level,
            "categorization_risk": categorization,
            "escalation_risk": risk_analysis,
            "assessment_factors": [
                "Transaction patterns",
                "Amount anomalies",
                "Temporal behavior",
                "Entity verification status"
            ]
        }

    @staticmethod
    async def decision_making(context: Dict[str, Any], db: AsyncSession) -> Dict[str, Any]:
        """Make automated decision based on investigation results."""
        risk_assessment = context.get("previous_results", {}).get("risk_assessment", {})
        risk_score = risk_assessment.get("final_risk_score", 0)

        decision = {
            "decision": "pending",
            "confidence": 0.0,
            "reasoning": "",
            "recommended_actions": []
        }

        if risk_score > 80:
            decision.update({
                "decision": "escalate",
                "confidence": 0.9,
                "reasoning": "Critical risk indicators detected",
                "recommended_actions": [
                    "Immediate escalation to senior investigator",
                    "Enhanced monitoring and transaction blocking",
                    "Customer contact for verification",
                    "Regulatory reporting if required"
                ]
            })
        elif risk_score > 60:
            decision.update({
                "decision": "investigate",
                "confidence": 0.8,
                "reasoning": "High risk indicators require investigation",
                "recommended_actions": [
                    "Detailed investigation by fraud analyst",
                    "Additional documentation review",
                    "Customer verification",
                    "Enhanced monitoring"
                ]
            })
        elif risk_score > 40:
            decision.update({
                "decision": "monitor",
                "confidence": 0.7,
                "reasoning": "Moderate risk indicators detected",
                "recommended_actions": [
                    "Add to watchlist",
                    "Periodic review",
                    "Transaction monitoring",
                    "Pattern analysis continuation"
                ]
            })
        else:
            decision.update({
                "decision": "close",
                "confidence": 0.6,
                "reasoning": "Low risk indicators, case can be closed",
                "recommended_actions": [
                    "Case closure",
                    "Archive for future reference",
                    "Remove from active monitoring"
                ]
            })

        return decision

    @staticmethod
    def _generate_transaction_recommendations(red_flags: List[Dict[str, Any]]) -> List[str]:
        """Generate recommendations based on transaction red flags."""
        recommendations = []

        for flag in red_flags:
            if flag["type"] == "high_value_transactions":
                recommendations.append(f"Review {flag['count']} high-value transactions totaling ${flag['total_amount']:,.2f}")
            elif flag["type"] == "round_amounts":
                recommendations.append(f"Investigate {flag['count']} round-amount transactions")
            elif flag["type"] == "unusual_timing":
                recommendations.append(f"Verify legitimacy of {flag['count']} transactions at unusual hours")

        if not recommendations:
            recommendations.append("No significant red flags detected in transaction review")

        return recommendations

    @staticmethod
    def _analyze_temporal_patterns(dates: List[datetime], amounts: List[float]) -> Dict[str, Any]:
        """Analyze temporal patterns in transactions."""
        if not dates:
            return {"error": "No date data available"}

        # Calculate gaps between transactions
        sorted_dates = sorted(dates)
        gaps = []
        for i in range(1, len(sorted_dates)):
            gap = (sorted_dates[i] - sorted_dates[i-1]).total_seconds() / 3600  # hours
            gaps.append(gap)

        avg_gap_hours = sum(gaps) / len(gaps) if gaps else 0

        # Analyze daily patterns
        hourly_counts = {}
        for date in dates:
            hour = date.hour
            hourly_counts[hour] = hourly_counts.get(hour, 0) + 1

        peak_hour = max(hourly_counts.keys(), key=lambda x: hourly_counts[x]) if hourly_counts else None

        return {
            "avg_gap_hours": avg_gap_hours,
            "peak_transaction_hour": peak_hour,
            "total_span_days": (max(sorted_dates) - min(sorted_dates)).days if sorted_dates else 0,
            "transaction_frequency": len(dates) / max((max(sorted_dates) - min(sorted_dates)).days, 1) if sorted_dates else 0
        }

    @staticmethod
    def _analyze_amount_patterns(amounts: List[float]) -> Dict[str, Any]:
        """Analyze amount patterns."""
        if not amounts:
            return {"error": "No amount data available"}

        import statistics
        return {
            "mean": statistics.mean(amounts),
            "median": statistics.median(amounts),
            "std_dev": statistics.stdev(amounts) if len(amounts) > 1 else 0,
            "min": min(amounts),
            "max": max(amounts),
            "range": max(amounts) - min(amounts),
            "coefficient_of_variation": statistics.stdev(amounts) / statistics.mean(amounts) if statistics.mean(amounts) > 0 else 0
        }

    @staticmethod
    def _analyze_merchant_patterns(transactions: List) -> Dict[str, Any]:
        """Analyze merchant patterns."""
        merchants = [tx.description for tx in transactions if tx.description]
        merchant_counts = {}

        for merchant in merchants:
            merchant_counts[merchant] = merchant_counts.get(merchant, 0) + 1

        unique_merchants = len(merchant_counts)
        total_transactions = len(transactions)

        # Calculate diversity metrics
        diversity_ratio = unique_merchants / total_transactions if total_transactions > 0 else 0

        # Find most common merchants
        top_merchants = sorted(merchant_counts.items(), key=lambda x: x[1], reverse=True)[:5]

        return {
            "unique_merchants": unique_merchants,
            "total_transactions": total_transactions,
            "diversity_ratio": diversity_ratio,
            "top_merchants": [{"merchant": m, "count": c} for m, c in top_merchants],
            "concentration": top_merchants[0][1] / total_transactions if top_merchants else 0
        }

# Create default workflows
def create_default_workflows() -> List[InvestigationWorkflow]:
    """Create default investigation workflows."""
    workflows = []

    # High Risk Investigation Workflow
    high_risk_workflow = InvestigationWorkflow(
        "high_risk_investigation",
        "High Risk Investigation",
        "Comprehensive investigation for high-risk cases"
    )

    high_risk_workflow.add_step(
        InvestigationStep.INITIAL_ANALYSIS,
        WorkflowStep(InvestigationStep.INITIAL_ANALYSIS, "Initial Analysis", WorkflowActions.initial_analysis)
    )

    high_risk_workflow.add_step(
        InvestigationStep.TRANSACTION_REVIEW,
        WorkflowStep(InvestigationStep.TRANSACTION_REVIEW, "Transaction Review", WorkflowActions.transaction_review)
    )

    high_risk_workflow.add_step(
        InvestigationStep.PATTERN_ANALYSIS,
        WorkflowStep(InvestigationStep.PATTERN_ANALYSIS, "Pattern Analysis", WorkflowActions.pattern_analysis)
    )

    high_risk_workflow.add_step(
        InvestigationStep.ENTITY_VERIFICATION,
        WorkflowStep(InvestigationStep.ENTITY_VERIFICATION, "Entity Verification", WorkflowActions.entity_verification)
    )

    high_risk_workflow.add_step(
        InvestigationStep.RISK_ASSESSMENT,
        WorkflowStep(InvestigationStep.RISK_ASSESSMENT, "Risk Assessment", WorkflowActions.risk_assessment)
    )

    high_risk_workflow.add_step(
        InvestigationStep.DECISION_MAKING,
        WorkflowStep(InvestigationStep.DECISION_MAKING, "Decision Making", WorkflowActions.decision_making)
    )

    workflows.append(high_risk_workflow)

    # Standard Investigation Workflow
    standard_workflow = InvestigationWorkflow(
        "standard_investigation",
        "Standard Investigation",
        "Routine investigation for standard-risk cases"
    )

    standard_workflow.add_step(
        InvestigationStep.INITIAL_ANALYSIS,
        WorkflowStep(InvestigationStep.INITIAL_ANALYSIS, "Initial Analysis", WorkflowActions.initial_analysis)
    )

    standard_workflow.add_step(
        InvestigationStep.TRANSACTION_REVIEW,
        WorkflowStep(InvestigationStep.TRANSACTION_REVIEW, "Transaction Review", WorkflowActions.transaction_review)
    )

    standard_workflow.add_step(
        InvestigationStep.DECISION_MAKING,
        WorkflowStep(InvestigationStep.DECISION_MAKING, "Decision Making", WorkflowActions.decision_making)
    )

    workflows.append(standard_workflow)

    return workflows