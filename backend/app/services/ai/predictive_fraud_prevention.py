from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
import asyncio
import numpy as np
import joblib
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, and_, or_
from app.db.models import Subject, Transaction, AuditLog
from app.db.models import AnalysisResult
from app.services.ai.ml_model_trainer import MLModelTrainer
from app.services.notification_service import NotificationService

class PredictiveFraudPrevention:
    """
    AI-powered predictive fraud prevention system.
    """

    def __init__(self, model_dir: str = "models"):
        self.model_dir = Path(model_dir)
        self.model_trainer = MLModelTrainer(model_dir)
        self.notification_service = NotificationService()

    async def analyze_transaction_risk(self, transaction_data: Dict[str, Any], db: AsyncSession) -> Dict[str, Any]:
        """
        Analyze a transaction for fraud risk using ML models.
        """
        # Extract features from transaction
        features = self._extract_transaction_features(transaction_data)

        # Load latest fraud detection model
        fraud_model, scaler = await self._load_latest_fraud_model()

        if not fraud_model:
            # Fallback to rule-based analysis
            return await self._rule_based_transaction_analysis(transaction_data, db)

        # Scale features and predict
        features_scaled = scaler.transform([features])
        fraud_probability = fraud_model.predict_proba(features_scaled)[0][1]
        is_fraud_prediction = fraud_model.predict(features_scaled)[0]

        # Load anomaly detection model
        anomaly_model, anomaly_scaler = await self._load_latest_anomaly_model()

        anomaly_score = None
        if anomaly_model:
            # Extract anomaly features
            anomaly_features = self._extract_anomaly_features(transaction_data)
            anomaly_features_scaled = anomaly_scaler.transform([anomaly_features])
            anomaly_score = anomaly_model.decision_function(anomaly_features_scaled)[0]

        # Combine predictions
        final_risk_score = self._combine_predictions(fraud_probability, anomaly_score)

        # Generate recommendations
        recommendations = self._generate_prevention_recommendations(
            final_risk_score, transaction_data, fraud_probability, anomaly_score
        )

        # Auto-actions for high-risk transactions
        if final_risk_score > 80:
            await self._trigger_high_risk_actions(transaction_data, final_risk_score, db)

        return {
            "risk_score": final_risk_score,
            "fraud_probability": fraud_probability,
            "anomaly_score": anomaly_score,
            "is_fraud_prediction": bool(is_fraud_prediction),
            "confidence": min(fraud_probability, 0.95),  # Conservative confidence
            "recommendations": recommendations,
            "analysis_timestamp": datetime.utcnow().isoformat(),
            "model_version": await self._get_model_version()
        }

    async def monitor_subject_behavior(self, subject_id: str, db: AsyncSession) -> Dict[str, Any]:
        """
        Monitor subject behavior patterns for early fraud detection.
        """
        # Get recent transactions
        seven_days_ago = datetime.utcnow() - timedelta(days=7)

        query = select(Transaction).where(
            and_(
                Transaction.subject_id == subject_id,
                Transaction.date >= seven_days_ago
            )
        ).order_by(desc(Transaction.date))

        result = await db.execute(query)
        recent_transactions = result.scalars().all()

        if len(recent_transactions) < 3:
            return {
                "status": "insufficient_data",
                "message": "Need at least 3 recent transactions for behavior analysis"
            }

        # Analyze behavior patterns
        behavior_analysis = self._analyze_behavior_patterns(recent_transactions)

        # Check for sudden changes
        anomaly_detected = self._detect_behavior_anomalies(behavior_analysis)

        # Predict future risk
        risk_forecast = self._forecast_subject_risk(behavior_analysis)

        # Generate alerts if needed
        if anomaly_detected or risk_forecast['risk_level'] == 'high':
            await self._generate_behavior_alert(subject_id, behavior_analysis, anomaly_detected, risk_forecast, db)

        return {
            "subject_id": subject_id,
            "analysis_period_days": 7,
            "transaction_count": len(recent_transactions),
            "behavior_patterns": behavior_analysis,
            "anomaly_detected": anomaly_detected,
            "risk_forecast": risk_forecast,
            "recommendations": self._generate_behavior_recommendations(behavior_analysis, anomaly_detected, risk_forecast)
        }

    async def predict_case_escalation_risk(self, subject_id: str, db: AsyncSession) -> Dict[str, Any]:
        """
        Predict the likelihood of case escalation based on current patterns.
        """
        # Get case data
        case_data = await self._get_case_data(subject_id, db)

        if not case_data:
            return {"error": "Case not found"}

        # Analyze escalation factors
        escalation_factors = self._analyze_escalation_factors(case_data)

        # Calculate escalation probability
        escalation_probability = self._calculate_escalation_probability(escalation_factors)

        # Time to escalation prediction
        time_to_escalation = self._predict_time_to_escalation(escalation_factors)

        # Generate prevention strategies
        prevention_strategies = self._generate_prevention_strategies(escalation_probability, escalation_factors)

        return {
            "subject_id": subject_id,
            "escalation_probability": escalation_probability,
            "time_to_escalation_days": time_to_escalation,
            "escalation_factors": escalation_factors,
            "prevention_strategies": prevention_strategies,
            "risk_level": self._categorize_escalation_risk(escalation_probability),
            "analysis_timestamp": datetime.utcnow().isoformat()
        }

    def _extract_transaction_features(self, transaction_data: Dict[str, Any]) -> List[float]:
        """Extract features from transaction data for ML prediction."""
        amount = transaction_data.get('amount', 0)
        timestamp = transaction_data.get('timestamp', datetime.utcnow())

        # Time-based features
        hour = timestamp.hour
        is_weekend = timestamp.weekday() >= 5
        is_business_hours = 9 <= hour <= 17

        # Amount-based features
        amount_log = np.log1p(amount) if amount > 0 else 0
        is_round_amount = amount % 100 == 0
        is_high_amount = amount > 10000

        # Merchant-based features (simplified)
        merchant = transaction_data.get('merchant', '').lower()
        is_online = any(word in merchant for word in ['online', 'web', 'internet'])
        is_foreign = any(word in merchant for word in ['international', 'foreign'])

        return [
            amount,
            amount_log,
            hour,
            int(is_weekend),
            int(is_business_hours),
            int(is_round_amount),
            int(is_high_amount),
            int(is_online),
            int(is_foreign)
        ]

    def _extract_anomaly_features(self, transaction_data: Dict[str, Any]) -> List[float]:
        """Extract features for anomaly detection."""
        amount = transaction_data.get('amount', 0)
        timestamp = transaction_data.get('timestamp', datetime.utcnow())

        return [
            amount,
            timestamp.hour,
            timestamp.weekday(),
            np.log1p(amount) if amount > 0 else 0
        ]

    async def _load_latest_fraud_model(self) -> Tuple[Optional[Any], Optional[Any]]:
        """Load the latest fraud detection model."""
        try:
            # Find latest fraud detection model
            model_files = list(self.model_dir.glob("fraud_detection_v*_metadata.json"))
            if not model_files:
                return None, None

            latest_model = max(model_files, key=lambda x: x.stat().st_mtime)
            model_version = latest_model.stem.replace('_metadata', '')

            model_path = self.model_dir / f"{model_version}.joblib"
            scaler_path = self.model_dir / f"{model_version}_scaler.joblib"

            if model_path.exists() and scaler_path.exists():
                model = joblib.load(model_path)
                scaler = joblib.load(scaler_path)
                return model, scaler

        except Exception as e:
            print(f"Error loading fraud model: {e}")

        return None, None

    async def _load_latest_anomaly_model(self) -> Tuple[Optional[Any], Optional[Any]]:
        """Load the latest anomaly detection model."""
        try:
            model_files = list(self.model_dir.glob("anomaly_detection_v*_metadata.json"))
            if not model_files:
                return None, None

            latest_model = max(model_files, key=lambda x: x.stat().st_mtime)
            model_version = latest_model.stem.replace('_metadata', '')

            model_path = self.model_dir / f"{model_version}.joblib"
            scaler_path = self.model_dir / f"{model_version}_scaler.joblib"

            if model_path.exists() and scaler_path.exists():
                model = joblib.load(model_path)
                scaler = joblib.load(scaler_path)
                return model, scaler

        except Exception as e:
            print(f"Error loading anomaly model: {e}")

        return None, None

    async def _rule_based_transaction_analysis(self, transaction_data: Dict[str, Any], db: AsyncSession) -> Dict[str, Any]:
        """Fallback rule-based transaction analysis."""
        amount = transaction_data.get('amount', 0)
        timestamp = transaction_data.get('timestamp', datetime.utcnow())

        risk_score = 0

        # Amount-based rules
        if amount > 50000:
            risk_score += 40
        elif amount > 10000:
            risk_score += 20
        elif amount > 1000:
            risk_score += 10

        # Time-based rules
        if timestamp.hour < 6 or timestamp.hour > 22:
            risk_score += 15

        if timestamp.weekday() >= 5:  # Weekend
            risk_score += 10

        # Round amount rule
        if amount % 100 == 0 and amount > 100:
            risk_score += 10

        # Cap at 100
        risk_score = min(risk_score, 100)

        return {
            "risk_score": risk_score,
            "fraud_probability": risk_score / 100,
            "anomaly_score": None,
            "is_fraud_prediction": risk_score > 70,
            "confidence": 0.7,
            "recommendations": self._generate_prevention_recommendations(risk_score, transaction_data, risk_score/100, None),
            "analysis_method": "rule_based",
            "analysis_timestamp": datetime.utcnow().isoformat()
        }

    def _combine_predictions(self, fraud_probability: float, anomaly_score: Optional[float]) -> float:
        """Combine fraud probability and anomaly score into final risk score."""
        if anomaly_score is None:
            return fraud_probability * 100

        # Convert anomaly score to 0-100 scale (lower anomaly score = higher risk)
        anomaly_risk = max(0, (anomaly_score * -1 + 0.5) * 200)  # Convert to 0-100

        # Weighted combination
        combined_score = (fraud_probability * 0.7 + anomaly_risk/100 * 0.3) * 100

        return min(combined_score, 100)

    def _generate_prevention_recommendations(self, risk_score: float, transaction_data: Dict[str, Any],
                                           fraud_prob: float, anomaly_score: Optional[float]) -> List[str]:
        """Generate prevention recommendations based on risk analysis."""
        recommendations = []

        if risk_score > 80:
            recommendations.extend([
                "🚨 BLOCK TRANSACTION - High risk detected",
                "🔍 Initiate immediate investigation",
                "📞 Contact customer for verification",
                "🛡️ Implement transaction hold"
            ])
        elif risk_score > 60:
            recommendations.extend([
                "⚠️ REVIEW TRANSACTION - Moderate risk",
                "📋 Additional verification required",
                "👁️ Enhanced monitoring recommended"
            ])
        elif risk_score > 40:
            recommendations.extend([
                "👀 MONITOR TRANSACTION - Low to moderate risk",
                "📊 Add to watchlist",
                "📈 Track similar patterns"
            ])

        # Specific recommendations based on factors
        amount = transaction_data.get('amount', 0)
        if amount > 10000:
            recommendations.append("💰 High-value transaction - Enhanced due diligence required")

        timestamp = transaction_data.get('timestamp', datetime.utcnow())
        if timestamp.hour < 6 or timestamp.hour > 22:
            recommendations.append("🕐 Unusual transaction time - Verify legitimacy")

        return recommendations

    async def _trigger_high_risk_actions(self, transaction_data: Dict[str, Any], risk_score: float, db: AsyncSession):
        """Trigger automated actions for high-risk transactions."""
        # Create audit log
        audit_log = AuditLog(
            actor_id=None,  # System action
            action="high_risk_transaction_detected",
            resource_id=None,
            details={
                "transaction_amount": transaction_data.get('amount'),
                "risk_score": risk_score,
                "timestamp": datetime.utcnow().isoformat(),
                "action": "automated_prevention_triggered"
            }
        )
        db.add(audit_log)
        await db.commit()

        # Send notification
        notification = {
            "type": "high_risk_transaction",
            "title": f"High-Risk Transaction Detected - ${transaction_data.get('amount', 0):,.2f}",
            "message": f"Transaction with risk score {risk_score:.1f} requires immediate attention.",
            "priority": "urgent",
            "channels": ["email", "sms"],
            "recipients": ["fraud-team@company.com", "compliance@company.com"],
            "transaction_data": transaction_data
        }

        await self.notification_service.send_notification(notification, db)

    def _analyze_behavior_patterns(self, transactions: List) -> Dict[str, Any]:
        """Analyze subject behavior patterns."""
        amounts = [float(tx.amount or 0) for tx in transactions]
        dates = [tx.date for tx in transactions if tx.date]

        patterns = {
            "avg_transaction_amount": np.mean(amounts) if amounts else 0,
            "transaction_frequency": len(transactions) / 7,  # Per day over 7 days
            "amount_volatility": np.std(amounts) / np.mean(amounts) if len(amounts) > 1 and np.mean(amounts) > 0 else 0,
            "peak_transaction_hour": max(set([tx.date.hour for tx in transactions if tx.date]), key=lambda x: [tx.date.hour for tx in transactions if tx.date].count(x)) if dates else 0,
            "weekend_transaction_ratio": len([tx for tx in transactions if tx.date and tx.date.weekday() >= 5]) / len(transactions) if transactions else 0,
            "merchant_diversity": len(set(tx.description for tx in transactions if tx.description)) / len(transactions) if transactions else 0
        }

        return patterns

    def _detect_behavior_anomalies(self, patterns: Dict[str, Any]) -> bool:
        """Detect anomalies in behavior patterns."""
        anomalies = []

        # Check for unusual frequency
        if patterns['transaction_frequency'] > 10:  # More than 10 transactions per day
            anomalies.append("high_frequency")

        # Check for high volatility
        if patterns['amount_volatility'] > 2.0:  # High amount variability
            anomalies.append("high_volatility")

        # Check for unusual timing
        if patterns['weekend_transaction_ratio'] > 0.8:  # Mostly weekend transactions
            anomalies.append("weekend_focused")

        return len(anomalies) > 0

    def _forecast_subject_risk(self, patterns: Dict[str, Any]) -> Dict[str, Any]:
        """Forecast future risk based on current patterns."""
        risk_score = 0

        # Frequency risk
        if patterns['transaction_frequency'] > 5:
            risk_score += 20

        # Volatility risk
        if patterns['amount_volatility'] > 1.0:
            risk_score += 30

        # Weekend activity risk
        if patterns['weekend_transaction_ratio'] > 0.6:
            risk_score += 15

        # Low merchant diversity risk
        if patterns['merchant_diversity'] < 0.3:
            risk_score += 25

        risk_level = "low" if risk_score < 30 else "medium" if risk_score < 60 else "high"

        return {
            "risk_score": min(risk_score, 100),
            "risk_level": risk_level,
            "confidence": 0.75,
            "timeframe_days": 30
        }

    async def _generate_behavior_alert(self, subject_id: str, patterns: Dict[str, Any],
                                     anomaly_detected: bool, forecast: Dict[str, Any], db: AsyncSession):
        """Generate alert for unusual behavior."""
        alert_type = "behavior_anomaly" if anomaly_detected else "risk_forecast"

        notification = {
            "type": alert_type,
            "title": f"Subject Behavior Alert - {subject_id[:8]}",
            "message": f"Unusual behavior detected. Risk forecast: {forecast['risk_level']} ({forecast['risk_score']}%)",
            "priority": "high" if forecast['risk_level'] == 'high' else "medium",
            "channels": ["email"],
            "recipients": ["fraud-analysts@company.com"],
            "subject_data": {
                "subject_id": subject_id,
                "patterns": patterns,
                "forecast": forecast
            }
        }

        await self.notification_service.send_notification(notification, db)

    def _generate_behavior_recommendations(self, patterns: Dict[str, Any], anomaly_detected: bool,
                                         forecast: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on behavior analysis."""
        recommendations = []

        if anomaly_detected:
            recommendations.append("🔍 Investigate unusual behavior patterns")
            recommendations.append("📞 Contact subject for verification")

        if forecast['risk_level'] == 'high':
            recommendations.append("⚠️ Increase monitoring frequency")
            recommendations.append("🚩 Add to high-risk watchlist")

        if patterns['transaction_frequency'] > 5:
            recommendations.append("📊 Review transaction frequency patterns")

        if patterns['amount_volatility'] > 1.0:
            recommendations.append("💰 Analyze amount volatility trends")

        return recommendations

    async def _get_case_data(self, subject_id: str, db: AsyncSession) -> Optional[Dict[str, Any]]:
        """Get case data for escalation analysis."""
        try:
            subject_uuid = __import__('uuid').UUID(subject_id)

            subject_query = select(Subject, AnalysisResult).outerjoin(
                AnalysisResult, Subject.id == AnalysisResult.subject_id
            ).where(Subject.id == subject_uuid)

            result = await db.execute(subject_query)
            row = result.first()

            if not row:
                return None

            subject, analysis = row

            # Get transaction count
            tx_query = select(Transaction).where(Transaction.subject_id == subject_uuid)
            tx_result = await db.execute(tx_query)
            transactions = tx_result.scalars().all()

            return {
                "subject_id": subject_id,
                "risk_score": analysis.risk_score if analysis else 0,
                "status": analysis.adjudication_status if analysis else "new",
                "transaction_count": len(transactions),
                "days_active": (datetime.utcnow().date() - subject.created_at.date()).days if subject.created_at else 0
            }

        except Exception as e:
            print(f"Error getting case data: {e}")
            return None

    def _analyze_escalation_factors(self, case_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze factors that could lead to case escalation."""
        factors = {
            "high_risk_score": case_data['risk_score'] > 70,
            "high_transaction_volume": case_data['transaction_count'] > 50,
            "recent_activity": case_data['days_active'] < 30,
            "unusual_status": case_data['status'] in ['flagged', 'escalated'],
            "escalation_probability": 0.0
        }

        # Calculate base probability
        probability = 0.0
        if factors['high_risk_score']:
            probability += 0.4
        if factors['high_transaction_volume']:
            probability += 0.2
        if factors['recent_activity']:
            probability += 0.15
        if factors['unusual_status']:
            probability += 0.25

        factors['escalation_probability'] = min(probability, 1.0)

        return factors

    def _calculate_escalation_probability(self, factors: Dict[str, Any]) -> float:
        """Calculate escalation probability."""
        return factors['escalation_probability']

    def _predict_time_to_escalation(self, factors: Dict[str, Any]) -> Optional[int]:
        """Predict time to escalation in days."""
        probability = factors['escalation_probability']

        if probability > 0.7:
            return 1  # Within 24 hours
        elif probability > 0.5:
            return 3  # Within 3 days
        elif probability > 0.3:
            return 7  # Within a week
        elif probability > 0.1:
            return 30  # Within a month
        else:
            return None  # Low probability

    def _generate_prevention_strategies(self, probability: float, factors: Dict[str, Any]) -> List[str]:
        """Generate prevention strategies."""
        strategies = []

        if probability > 0.7:
            strategies.extend([
                "🚨 Immediate intervention required",
                "📞 Direct customer contact",
                "🛡️ Transaction monitoring enhancement",
                "👥 Senior investigator assignment"
            ])
        elif probability > 0.5:
            strategies.extend([
                "⚠️ Enhanced monitoring",
                "📋 Additional documentation review",
                "👤 Customer verification"
            ])
        elif probability > 0.3:
            strategies.extend([
                "👀 Increased oversight",
                "📊 Pattern analysis",
                "📝 Documentation review"
            ])

        return strategies

    def _categorize_escalation_risk(self, probability: float) -> str:
        """Categorize escalation risk level."""
        if probability > 0.7:
            return "critical"
        elif probability > 0.5:
            return "high"
        elif probability > 0.3:
            return "medium"
        else:
            return "low"

    async def _get_model_version(self) -> str:
        """Get current model version."""
        return self.model_trainer.current_model_version