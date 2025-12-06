from typing import Dict, Any, List, Optional, Callable
from datetime import datetime, timedelta
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_, desc
from app.db.models import Subject, Transaction, AuditLog, ActionType
from app.models.mens_rea import AnalysisResult
from app.services.ai.case_classifier import CaseClassifier

class WorkflowEngine:
    """
    Intelligent workflow automation engine with custom rules and triggers.
    """

    def __init__(self):
        self.rules: Dict[str, WorkflowRule] = {}
        self.triggers: Dict[str, Trigger] = {}
        self.case_classifier = CaseClassifier()

    def register_rule(self, rule: 'WorkflowRule'):
        """Register a workflow rule."""
        self.rules[rule.id] = rule

    def register_trigger(self, trigger: 'Trigger'):
        """Register a workflow trigger."""
        self.triggers[trigger.id] = trigger

    async def process_case_event(self, event_type: str, case_data: Dict[str, Any], db: AsyncSession):
        """
        Process a case event and execute matching rules and triggers.
        """
        # Find matching rules
        matching_rules = [
            rule for rule in self.rules.values()
            if rule.matches_event(event_type, case_data)
        ]

        # Execute matching rules
        for rule in matching_rules:
            try:
                await rule.execute(case_data, db)
            except Exception as e:
                print(f"Error executing rule {rule.id}: {e}")

        # Check triggers
        for trigger in self.triggers.values():
            if trigger.should_trigger(event_type, case_data):
                try:
                    await trigger.execute(case_data, db)
                except Exception as e:
                    print(f"Error executing trigger {trigger.id}: {e}")

    async def evaluate_case_automatically(self, subject_id: str, db: AsyncSession) -> Dict[str, Any]:
        """
        Automatically evaluate a case and suggest actions based on rules.
        """
        # Get case categorization
        categorization = await self.case_classifier.categorize_case(subject_id, db)

        # Get routing suggestion
        routing = await self.case_classifier.suggest_routing(subject_id, db)

        # Apply automatic rules based on categorization
        automatic_actions = await self._apply_automatic_rules(categorization, routing, db)

        return {
            "categorization": categorization,
            "routing": routing,
            "automatic_actions": automatic_actions,
            "recommendations": self._generate_recommendations(categorization, routing)
        }

    async def _apply_automatic_rules(self, categorization: Dict[str, Any], routing: Dict[str, Any], db: AsyncSession) -> List[Dict[str, Any]]:
        """Apply automatic rules based on case evaluation."""
        actions = []

        # High-risk cases get automatic escalation
        if categorization["risk_level"] in ["CRITICAL", "HIGH"]:
            actions.append({
                "type": "escalation",
                "action": "auto_escalate",
                "reason": f"Automatic escalation due to {categorization['risk_level']} risk level",
                "executed": True
            })

        # Critical cases trigger immediate notifications
        if categorization["risk_level"] == "CRITICAL":
            actions.append({
                "type": "notification",
                "action": "urgent_notification",
                "reason": "Critical risk case requires immediate attention",
                "executed": True
            })

        # Cases with money laundering indicators get special handling
        if categorization["category"] == "MONEY_LAUNDERING":
            actions.append({
                "type": "assignment",
                "action": "specialist_assignment",
                "reason": "Money laundering case requires specialized investigator",
                "executed": True
            })

        return actions

    def _generate_recommendations(self, categorization: Dict[str, Any], routing: Dict[str, Any]) -> List[str]:
        """Generate human-readable recommendations."""
        recommendations = []

        if categorization["risk_level"] == "CRITICAL":
            recommendations.append("🚨 IMMEDIATE ATTENTION REQUIRED - Critical risk case")
            recommendations.append("📞 Notify compliance officer within 1 hour")
            recommendations.append("🔒 Freeze related accounts pending investigation")

        elif categorization["risk_level"] == "HIGH":
            recommendations.append("⚠️ HIGH PRIORITY - Review within 4 hours")
            recommendations.append("📋 Gather all related transaction data")
            recommendations.append("👥 Assign to senior investigator")

        if categorization["category"] == "MONEY_LAUNDERING":
            recommendations.append("💰 Money laundering indicators detected")
            recommendations.append("🏛️ Check for SAR filing requirements")
            recommendations.append("🔗 Trace fund origins and destinations")

        elif categorization["category"] == "FRAUD":
            recommendations.append("🎭 Direct fraud indicators present")
            recommendations.append("🕵️ Initiate victim notification process")
            recommendations.append("📜 Preserve all digital evidence")

        recommendations.append(f"👤 Assigned to: {routing['suggested_investigator']}")
        recommendations.append(f"⏰ Estimated completion: {routing['estimated_time']}")

        return recommendations

class WorkflowRule:
    """Represents a workflow automation rule."""

    def __init__(self, rule_id: str, name: str, conditions: Dict[str, Any], actions: List[Dict[str, Any]]):
        self.id = rule_id
        self.name = name
        self.conditions = conditions
        self.actions = actions

    def matches_event(self, event_type: str, case_data: Dict[str, Any]) -> bool:
        """Check if this rule matches the given event and case data."""
        # Check event type
        if self.conditions.get("event_type") and self.conditions["event_type"] != event_type:
            return False

        # Check risk score conditions
        if "risk_score_min" in self.conditions:
            if case_data.get("risk_score", 0) < self.conditions["risk_score_min"]:
                return False

        if "risk_score_max" in self.conditions:
            if case_data.get("risk_score", 0) > self.conditions["risk_score_max"]:
                return False

        # Check category conditions
        if "categories" in self.conditions:
            if case_data.get("category") not in self.conditions["categories"]:
                return False

        # Check amount conditions
        if "amount_min" in self.conditions:
            if case_data.get("total_amount", 0) < self.conditions["amount_min"]:
                return False

        return True

    async def execute(self, case_data: Dict[str, Any], db: AsyncSession):
        """Execute the rule's actions."""
        for action in self.actions:
            action_type = action.get("type")

            if action_type == "update_status":
                await self._update_case_status(case_data["subject_id"], action["status"], db)

            elif action_type == "assign_investigator":
                await self._assign_investigator(case_data["subject_id"], action["investigator_id"], db)

            elif action_type == "create_notification":
                await self._create_notification(case_data["subject_id"], action["message"], action.get("priority", "normal"), db)

            elif action_type == "escalate":
                await self._escalate_case(case_data["subject_id"], action.get("reason", "Automatic escalation"), db)

    async def _update_case_status(self, subject_id: str, status: str, db: AsyncSession):
        """Update case status."""
        subject_uuid = uuid.UUID(subject_id)

        # Find and update analysis result
        analysis_query = select(AnalysisResult).where(AnalysisResult.subject_id == subject_uuid)
        result = await db.execute(analysis_query)
        analysis = result.scalars().first()

        if analysis:
            analysis.adjudication_status = status
            db.add(analysis)

            # Log the change
            audit_log = AuditLog(
                actor_id=None,  # System action
                action=ActionType.EDIT,
                resource_id=subject_uuid,
                details={"action": "auto_status_update", "new_status": status, "rule": self.id}
            )
            db.add(audit_log)

            await db.commit()

    async def _assign_investigator(self, subject_id: str, investigator_id: str, db: AsyncSession):
        """Assign case to investigator."""
        # In a real implementation, this would update assignment tables
        subject_uuid = uuid.UUID(subject_id)

        audit_log = AuditLog(
            actor_id=None,
            action=ActionType.EDIT,
            resource_id=subject_uuid,
            details={"action": "auto_assignment", "investigator": investigator_id, "rule": self.id}
        )
        db.add(audit_log)
        await db.commit()

    async def _create_notification(self, subject_id: str, message: str, priority: str, db: AsyncSession):
        """Create a notification."""
        # In a real implementation, this would create notification records
        subject_uuid = uuid.UUID(subject_id)

        audit_log = AuditLog(
            actor_id=None,
            action=ActionType.VIEW,  # Using VIEW for notifications
            resource_id=subject_uuid,
            details={"action": "auto_notification", "message": message, "priority": priority, "rule": self.id}
        )
        db.add(audit_log)
        await db.commit()

    async def _escalate_case(self, subject_id: str, reason: str, db: AsyncSession):
        """Escalate a case."""
        subject_uuid = uuid.UUID(subject_id)

        # Update status to escalated
        analysis_query = select(AnalysisResult).where(AnalysisResult.subject_id == subject_uuid)
        result = await db.execute(analysis_query)
        analysis = result.scalars().first()

        if analysis:
            analysis.adjudication_status = "escalated"
            db.add(analysis)

        audit_log = AuditLog(
            actor_id=None,
            action=ActionType.EDIT,
            resource_id=subject_uuid,
            details={"action": "auto_escalation", "reason": reason, "rule": self.id}
        )
        db.add(audit_log)
        await db.commit()

class Trigger:
    """Represents an automated trigger."""

    def __init__(self, trigger_id: str, name: str, conditions: Dict[str, Any], action: Callable):
        self.id = trigger_id
        self.name = name
        self.conditions = conditions
        self.action = action

    def should_trigger(self, event_type: str, case_data: Dict[str, Any]) -> bool:
        """Check if this trigger should fire."""
        # Similar logic to WorkflowRule.matches_event
        if self.conditions.get("event_type") and self.conditions["event_type"] != event_type:
            return False

        if "risk_score_threshold" in self.conditions:
            if case_data.get("risk_score", 0) >= self.conditions["risk_score_threshold"]:
                return True

        return False

    async def execute(self, case_data: Dict[str, Any], db: AsyncSession):
        """Execute the trigger action."""
        await self.action(case_data, db)

# Predefined workflow rules
def create_default_rules() -> List[WorkflowRule]:
    """Create default workflow automation rules."""
    return [
        WorkflowRule(
            "high_risk_escalation",
            "High Risk Auto-Escalation",
            {
                "event_type": "case_created",
                "risk_score_min": 80
            },
            [
                {"type": "escalate", "reason": "High risk score detected"},
                {"type": "create_notification", "message": "High-risk case requires immediate attention", "priority": "urgent"}
            ]
        ),
        WorkflowRule(
            "money_laundering_specialist",
            "Money Laundering Specialist Assignment",
            {
                "event_type": "case_categorized",
                "categories": ["MONEY_LAUNDERING"]
            },
            [
                {"type": "assign_investigator", "investigator_id": "ml_specialist"},
                {"type": "update_status", "status": "under_review"}
            ]
        ),
        WorkflowRule(
            "critical_case_notification",
            "Critical Case Immediate Notification",
            {
                "event_type": "case_created",
                "risk_score_min": 90
            },
            [
                {"type": "create_notification", "message": "CRITICAL: Case requires immediate executive attention", "priority": "critical"}
            ]
        )
    ]