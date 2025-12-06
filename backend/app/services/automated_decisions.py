from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models import Subject, AuditLog, ActionType
from app.models.mens_rea import AnalysisResult
from app.services.workflow_engine import WorkflowEngine

class NotificationService:
    """
    Intelligent notification system for automated alerts and updates.
    """

    def __init__(self):
        self.notification_channels = {
            "email": self._send_email,
            "sms": self._send_sms,
            "push": self._send_push,
            "slack": self._send_slack,
            "webhook": self._send_webhook
        }

    async def send_notification(self, notification: Dict[str, Any], db: AsyncSession):
        """
        Send a notification through appropriate channels.
        """
        channels = notification.get("channels", ["email"])
        recipients = notification.get("recipients", [])

        for channel in channels:
            if channel in self.notification_channels:
                try:
                    await self.notification_channels[channel](notification, recipients, db)
                except Exception as e:
                    print(f"Failed to send {channel} notification: {e}")

        # Log notification
        audit_log = AuditLog(
            actor_id=None,  # System notification
            action=ActionType.VIEW,
            resource_id=None,
            details={
                "action": "notification_sent",
                "type": notification.get("type"),
                "channels": channels,
                "recipient_count": len(recipients)
            }
        )
        db.add(audit_log)
        await db.commit()

    async def _send_email(self, notification: Dict[str, Any], recipients: List[str], db: AsyncSession):
        """Send email notification."""
        # In a real implementation, integrate with email service (SendGrid, SES, etc.)
        print(f"EMAIL: Sending '{notification.get('title')}' to {recipients}")

        # Mock email sending - log to database
        for recipient in recipients:
            audit_log = AuditLog(
                actor_id=None,
                action=ActionType.VIEW,
                resource_id=None,
                details={
                    "notification_type": "email",
                    "recipient": recipient,
                    "title": notification.get("title"),
                    "message": notification.get("message")
                }
            )
            db.add(audit_log)
        await db.commit()

    async def _send_sms(self, notification: Dict[str, Any], recipients: List[str], db: AsyncSession):
        """Send SMS notification."""
        # In a real implementation, integrate with SMS service (Twilio, etc.)
        print(f"SMS: Sending '{notification.get('title')}' to {recipients}")

    async def _send_push(self, notification: Dict[str, Any], recipients: List[str], db: AsyncSession):
        """Send push notification."""
        # In a real implementation, integrate with push service (Firebase, etc.)
        print(f"PUSH: Sending '{notification.get('title')}' to {recipients}")

    async def _send_slack(self, notification: Dict[str, Any], recipients: List[str], db: AsyncSession):
        """Send Slack notification."""
        # In a real implementation, integrate with Slack API
        print(f"SLACK: Sending '{notification.get('title')}' to {recipients}")

    async def _send_webhook(self, notification: Dict[str, Any], recipients: List[str], db: AsyncSession):
        """Send webhook notification."""
        # In a real implementation, send HTTP requests to configured webhooks
        print(f"WEBHOOK: Sending '{notification.get('title')}' to {recipients}")

class DecisionTrigger:
    """
    Automated decision triggers based on case conditions and rules.
    """

    def __init__(self, workflow_engine: WorkflowEngine, notification_service: NotificationService):
        self.workflow_engine = workflow_engine
        self.notification_service = notification_service
        self.triggers: Dict[str, Dict[str, Any]] = {}

    def register_trigger(self, trigger_id: str, conditions: Dict[str, Any], actions: List[Dict[str, Any]]):
        """Register a decision trigger."""
        self.triggers[trigger_id] = {
            "conditions": conditions,
            "actions": actions,
            "enabled": True
        }

    async def evaluate_triggers(self, subject_id: str, event_type: str, db: AsyncSession):
        """
        Evaluate all triggers for a given case event.
        """
        # Get case data
        case_data = await self._get_case_data(subject_id, db)
        if not case_data:
            return

        # Check each trigger
        for trigger_id, trigger_config in self.triggers.items():
            if not trigger_config["enabled"]:
                continue

            if self._matches_conditions(case_data, event_type, trigger_config["conditions"]):
                await self._execute_actions(subject_id, trigger_config["actions"], case_data, db)

    def _matches_conditions(self, case_data: Dict[str, Any], event_type: str, conditions: Dict[str, Any]) -> bool:
        """Check if case data matches trigger conditions."""

        # Check event type
        if conditions.get("event_type") and conditions["event_type"] != event_type:
            return False

        # Check risk score range
        if "risk_score_min" in conditions and case_data.get("risk_score", 0) < conditions["risk_score_min"]:
            return False
        if "risk_score_max" in conditions and case_data.get("risk_score", 0) > conditions["risk_score_max"]:
            return False

        # Check status
        if "statuses" in conditions and case_data.get("status") not in conditions["statuses"]:
            return False

        # Check amount thresholds
        if "amount_min" in conditions and case_data.get("total_amount", 0) < conditions["amount_min"]:
            return False
        if "amount_max" in conditions and case_data.get("total_amount", 0) > conditions["amount_max"]:
            return False

        # Check transaction count
        if "transaction_count_min" in conditions and case_data.get("transaction_count", 0) < conditions["transaction_count_min"]:
            return False

        # Check time-based conditions
        if "days_active_min" in conditions and case_data.get("days_active", 0) < conditions["days_active_min"]:
            return False

        return True

    async def _execute_actions(self, subject_id: str, actions: List[Dict[str, Any]], case_data: Dict[str, Any], db: AsyncSession):
        """Execute trigger actions."""
        for action in actions:
            action_type = action.get("type")

            try:
                if action_type == "update_status":
                    await self._update_case_status(subject_id, action["status"], db)

                elif action_type == "send_notification":
                    await self._send_notification(action, case_data, db)

                elif action_type == "assign_investigator":
                    await self._assign_investigator(subject_id, action["investigator_id"], db)

                elif action_type == "escalate":
                    await self._escalate_case(subject_id, action.get("reason", "Automatic escalation"), db)

                elif action_type == "create_task":
                    await self._create_task(subject_id, action, db)

                elif action_type == "run_workflow":
                    await self.workflow_engine.process_case_event(
                        "trigger_activated",
                        {**case_data, "trigger_action": action},
                        db
                    )

            except Exception as e:
                print(f"Error executing trigger action {action_type}: {e}")

    async def _get_case_data(self, subject_id: str, db: AsyncSession) -> Optional[Dict[str, Any]]:
        """Get case data for trigger evaluation."""
        try:
            subject_uuid = __import__('uuid').UUID(subject_id)

            # Get subject and analysis
            subject_query = select(Subject, AnalysisResult).outerjoin(
                AnalysisResult, Subject.id == AnalysisResult.subject_id
            ).where(Subject.id == subject_uuid)

            result = await db.execute(subject_query)
            row = result.first()

            if not row:
                return None

            subject, analysis = row

            # Get transaction count and total
            from sqlalchemy import func
            tx_stats_query = select(
                func.count(Transaction.id),
                func.sum(Transaction.amount)
            ).where(Transaction.subject_id == subject_uuid)

            tx_result = await db.execute(tx_stats_query)
            tx_stats = tx_result.first()
            tx_count = tx_stats[0] or 0
            total_amount = float(tx_stats[1] or 0)

            return {
                "subject_id": subject_id,
                "risk_score": analysis.risk_score if analysis else 0,
                "status": analysis.adjudication_status if analysis else "new",
                "transaction_count": tx_count,
                "total_amount": total_amount,
                "days_active": (datetime.utcnow().date() - subject.created_at.date()).days if subject.created_at else 0
            }

        except Exception as e:
            print(f"Error getting case data for triggers: {e}")
            return None

    async def _update_case_status(self, subject_id: str, status: str, db: AsyncSession):
        """Update case status."""
        subject_uuid = __import__('uuid').UUID(subject_id)

        analysis_query = select(AnalysisResult).where(AnalysisResult.subject_id == subject_uuid)
        result = await db.execute(analysis_query)
        analysis = result.scalars().first()

        if analysis:
            analysis.adjudication_status = status
            db.add(analysis)

            audit_log = AuditLog(
                actor_id=None,
                action=ActionType.EDIT,
                resource_id=subject_uuid,
                details={"action": "auto_status_update", "new_status": status, "trigger": "system"}
            )
            db.add(audit_log)
            await db.commit()

    async def _send_notification(self, action: Dict[str, Any], case_data: Dict[str, Any], db: AsyncSession):
        """Send notification."""
        notification = {
            "type": action.get("notification_type", "alert"),
            "title": action.get("title", "Automated Alert"),
            "message": action.get("message", "Case condition met"),
            "priority": action.get("priority", "normal"),
            "channels": action.get("channels", ["email"]),
            "recipients": action.get("recipients", []),
            "case_data": case_data
        }

        await self.notification_service.send_notification(notification, db)

    async def _assign_investigator(self, subject_id: str, investigator_id: str, db: AsyncSession):
        """Assign case to investigator."""
        subject_uuid = __import__('uuid').UUID(subject_id)

        audit_log = AuditLog(
            actor_id=None,
            action=ActionType.EDIT,
            resource_id=subject_uuid,
            details={"action": "auto_assignment", "investigator": investigator_id, "trigger": "system"}
        )
        db.add(audit_log)
        await db.commit()

    async def _escalate_case(self, subject_id: str, reason: str, db: AsyncSession):
        """Escalate a case."""
        subject_uuid = __import__('uuid').UUID(subject_id)

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
            details={"action": "auto_escalation", "reason": reason, "trigger": "system"}
        )
        db.add(audit_log)
        await db.commit()

    async def _create_task(self, subject_id: str, action: Dict[str, Any], db: AsyncSession):
        """Create a task for the case."""
        subject_uuid = __import__('uuid').UUID(subject_id)

        # In a real implementation, this would create a task record
        audit_log = AuditLog(
            actor_id=None,
            action=ActionType.EDIT,
            resource_id=subject_uuid,
            details={
                "action": "task_created",
                "task_title": action.get("title"),
                "task_description": action.get("description"),
                "trigger": "system"
            }
        )
        db.add(audit_log)
        await db.commit()

# Default trigger configurations
def create_default_triggers(workflow_engine: WorkflowEngine, notification_service: NotificationService) -> List[Dict[str, Any]]:
    """Create default automated decision triggers."""
    trigger_system = DecisionTrigger(workflow_engine, notification_service)

    # Critical risk trigger
    trigger_system.register_trigger(
        "critical_risk_alert",
        {
            "event_type": "case_created",
            "risk_score_min": 90
        },
        [
            {
                "type": "escalate",
                "reason": "Critical risk score detected"
            },
            {
                "type": "send_notification",
                "notification_type": "urgent",
                "title": "CRITICAL RISK CASE",
                "message": "A case with critical risk score has been created and requires immediate attention.",
                "priority": "critical",
                "channels": ["email", "sms"],
                "recipients": ["compliance@company.com", "senior-investigator@company.com"]
            }
        ]
    )

    # High-value transaction trigger
    trigger_system.register_trigger(
        "high_value_transaction",
        {
            "event_type": "transaction_added",
            "amount_min": 50000
        },
        [
            {
                "type": "update_status",
                "status": "under_review"
            },
            {
                "type": "send_notification",
                "notification_type": "alert",
                "title": "High-Value Transaction Detected",
                "message": "A transaction over $50,000 has been detected and flagged for review.",
                "priority": "high",
                "channels": ["email"],
                "recipients": ["investigator@company.com"]
            }
        ]
    )

    # Suspicious pattern trigger
    trigger_system.register_trigger(
        "suspicious_pattern",
        {
            "event_type": "analysis_completed",
            "risk_score_min": 70
        },
        [
            {
                "type": "assign_investigator",
                "investigator_id": "pattern-specialist"
            },
            {
                "type": "create_task",
                "title": "Review Suspicious Pattern",
                "description": "Investigate detected suspicious transaction patterns"
            }
        ]
    )

    return [trigger_system]