from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
import json
import numpy as np
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, roc_auc_score
import joblib
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from app.db.models import Subject, Transaction
from app.db.models import AnalysisResult
from app.services.ai.llm_service import LLMService


class MLModelTrainer:
    """
    Advanced ML model training pipeline for fraud detection.
    """

    def __init__(self, model_dir: str = "models"):
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(exist_ok=True)
        self.llm_service = LLMService()
        self.current_model_version = "1.0.0"

    async def train_fraud_detection_model(self, db: AsyncSession) -> Dict[str, Any]:
        """
        Train an advanced fraud detection model using historical data.
        """
        print("Starting fraud detection model training...")

        # Extract features from historical data
        X, y, feature_names = await self._extract_training_features(db)

        if len(X) < 100:
            return {
                "status": "insufficient_data",
                "message": "Need at least 100 cases for training",
                "samples": len(X),
            }

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        # Train model
        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1,
        )

        model.fit(X_train_scaled, y_train)

        # Evaluate model
        train_score = model.score(X_train_scaled, y_train)
        test_score = model.score(X_test_scaled, y_test)

        # Cross-validation
        cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5)

        # Feature importance
        feature_importance = dict(zip(feature_names, model.feature_importances_))

        # Predictions for detailed metrics
        y_pred = model.predict(X_test_scaled)
        y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]

        classification_rep = classification_report(y_test, y_pred, output_dict=True)
        auc_score = roc_auc_score(y_test, y_pred_proba)

        # Save model
        model_version = f"fraud_detection_v{self._increment_version()}"
        model_path = self.model_dir / f"{model_version}.joblib"
        scaler_path = self.model_dir / f"{model_version}_scaler.joblib"
        metadata_path = self.model_dir / f"{model_version}_metadata.json"

        joblib.dump(model, model_path)
        joblib.dump(scaler, scaler_path)

        # Save metadata
        metadata = {
            "version": model_version,
            "created_at": datetime.utcnow().isoformat(),
            "training_samples": len(X_train),
            "test_samples": len(X_test),
            "features": feature_names,
            "feature_importance": feature_importance,
            "metrics": {
                "train_accuracy": train_score,
                "test_accuracy": test_score,
                "cv_mean": cv_scores.mean(),
                "cv_std": cv_scores.std(),
                "auc_score": auc_score,
                "classification_report": classification_rep,
            },
            "model_params": model.get_params(),
        }

        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2, default=str)

        # Update current model version
        self.current_model_version = model_version

        return {
            "status": "success",
            "model_version": model_version,
            "metrics": metadata["metrics"],
            "feature_importance": feature_importance,
            "training_samples": len(X_train),
            "test_samples": len(X_test),
        }

    async def train_anomaly_detection_model(self, db: AsyncSession) -> Dict[str, Any]:
        """
        Train an unsupervised anomaly detection model.
        """
        print("Training anomaly detection model...")

        # Get transaction data for anomaly detection
        transactions = await self._get_transaction_features(db)

        if len(transactions) < 1000:
            return {
                "status": "insufficient_data",
                "message": "Need at least 1000 transactions for anomaly detection",
                "samples": len(transactions),
            }

        # Prepare features for anomaly detection
        features = []
        for tx in transactions:
            features.append(
                [
                    tx["amount"],
                    tx["frequency_score"],
                    tx["amount_variability"],
                    tx["time_score"],
                    tx["merchant_score"],
                ]
            )

        X = np.array(features)

        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # Train Isolation Forest
        model = IsolationForest(
            n_estimators=100,
            contamination=0.1,  # Assume 10% anomalies
            random_state=42,
            n_jobs=-1,
        )

        # Fit model
        model.fit(X_scaled)

        # Get anomaly scores
        anomaly_scores = model.decision_function(X_scaled)
        predictions = model.predict(X_scaled)

        # Save model
        model_version = f"anomaly_detection_v{self._increment_version()}"
        model_path = self.model_dir / f"{model_version}.joblib"
        scaler_path = self.model_dir / f"{model_version}_scaler.joblib"

        joblib.dump(model, model_path)
        joblib.dump(scaler, scaler_path)

        # Calculate statistics
        anomaly_rate = (predictions == -1).sum() / len(predictions)
        mean_score = np.mean(anomaly_scores)
        std_score = np.std(anomaly_scores)

        metadata = {
            "version": model_version,
            "created_at": datetime.utcnow().isoformat(),
            "training_samples": len(X),
            "anomaly_rate": anomaly_rate,
            "mean_score": mean_score,
            "std_score": std_score,
            "contamination": 0.1,
        }

        metadata_path = self.model_dir / f"{model_version}_metadata.json"
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2, default=str)

        return {
            "status": "success",
            "model_version": model_version,
            "training_samples": len(X),
            "anomaly_rate": anomaly_rate,
            "mean_score": mean_score,
            "std_score": std_score,
        }

    async def _extract_training_features(
        self, db: AsyncSession
    ) -> Tuple[np.ndarray, np.ndarray, List[str]]:
        """
        Extract features and labels for supervised learning.
        """
        # Get cases with known outcomes
        query = (
            select(Subject, AnalysisResult)
            .outerjoin(AnalysisResult, Subject.id == AnalysisResult.subject_id)
            .where(
                and_(
                    AnalysisResult.adjudication_status.isnot(None),
                    AnalysisResult.risk_score.isnot(None),
                )
            )
            .limit(5000)
        )  # Limit for training

        result = await db.execute(query)
        rows = result.all()

        features = []
        labels = []

        for subject, analysis in rows:
            # Get transaction data for this subject
            tx_query = select(Transaction).where(Transaction.subject_id == subject.id)
            tx_result = await db.execute(tx_query)
            transactions = tx_result.scalars().all()

            if len(transactions) < 3:  # Skip cases with too few transactions
                continue

            # Extract features
            case_features = await self._extract_case_features(
                subject, transactions, analysis
            )

            # Determine label (fraudulent or legitimate)
            # This is a simplified labeling - in practice, this would come from verified case outcomes
            is_fraud = (
                analysis.adjudication_status in ["escalated", "confirmed_fraud"]
                or analysis.risk_score > 80
            )

            features.append(case_features)
            labels.append(1 if is_fraud else 0)

        feature_names = [
            "transaction_count",
            "total_amount",
            "avg_amount",
            "amount_std",
            "frequency_per_day",
            "days_active",
            "high_value_tx_count",
            "unusual_hours_tx_count",
            "merchant_diversity",
            "amount_trend",
            "risk_score",
        ]

        return np.array(features), np.array(labels), feature_names

    async def _extract_case_features(
        self, subject: Subject, transactions: List, analysis: AnalysisResult
    ) -> List[float]:
        """Extract numerical features from case data."""
        amounts = [float(tx.amount or 0) for tx in transactions]

        # Basic transaction metrics
        transaction_count = len(transactions)
        total_amount = sum(amounts)
        avg_amount = total_amount / transaction_count if transaction_count > 0 else 0
        amount_std = np.std(amounts) if len(amounts) > 1 else 0

        # Time-based features
        if transactions:
            dates = [tx.date for tx in transactions if tx.date]
            if dates:
                days_span = (max(dates) - min(dates)).days
                frequency_per_day = transaction_count / max(days_span, 1)
                days_active = days_span
            else:
                frequency_per_day = 0
                days_active = 0
        else:
            frequency_per_day = 0
            days_active = 0

        # High-value transactions (> $10k)
        high_value_count = len([amt for amt in amounts if amt > 10000])

        # Unusual hours transactions (assuming 9 PM - 6 AM is unusual)
        unusual_hours_count = 0
        for tx in transactions:
            if tx.date and (tx.date.hour >= 21 or tx.date.hour <= 6):
                unusual_hours_count += 1

        # Merchant diversity (unique descriptions)
        unique_merchants = len(
            set(tx.description for tx in transactions if tx.description)
        )
        merchant_diversity = (
            unique_merchants / transaction_count if transaction_count > 0 else 0
        )

        # Amount trend (simple linear trend)
        if len(amounts) > 1:
            x = np.arange(len(amounts))
            slope = np.polyfit(x, amounts, 1)[0]
            amount_trend = slope
        else:
            amount_trend = 0

        risk_score = analysis.risk_score or 0

        return [
            transaction_count,
            total_amount,
            avg_amount,
            amount_std,
            frequency_per_day,
            days_active,
            high_value_count,
            unusual_hours_count,
            merchant_diversity,
            amount_trend,
            risk_score,
        ]

    async def _get_transaction_features(self, db: AsyncSession) -> List[Dict[str, Any]]:
        """Get transaction features for anomaly detection."""
        # Get recent transactions
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)

        query = (
            select(Transaction).where(Transaction.date >= thirty_days_ago).limit(10000)
        )

        result = await db.execute(query)
        transactions = result.scalars().all()

        # Group by subject for pattern analysis
        subject_patterns = {}

        for tx in transactions:
            subject_id = str(tx.subject_id)

            if subject_id not in subject_patterns:
                subject_patterns[subject_id] = {
                    "transactions": [],
                    "total_amount": 0,
                    "tx_count": 0,
                }

            subject_patterns[subject_id]["transactions"].append(
                {
                    "amount": float(tx.amount or 0),
                    "date": tx.date,
                    "description": tx.description,
                }
            )
            subject_patterns[subject_id]["total_amount"] += float(tx.amount or 0)
            subject_patterns[subject_id]["tx_count"] += 1

        # Extract features for each subject
        features = []
        for subject_id, pattern in subject_patterns.items():
            if pattern["tx_count"] < 5:  # Skip subjects with too few transactions
                continue

            amounts = [tx["amount"] for tx in pattern["transactions"]]

            # Frequency score (transactions per day over the period)
            days_active = 30  # Approximation
            frequency_score = pattern["tx_count"] / days_active

            # Amount variability
            amount_variability = (
                np.std(amounts) / np.mean(amounts) if np.mean(amounts) > 0 else 0
            )

            # Time-based patterns (simplified)
            time_score = 0.5  # Placeholder for time-based anomaly scoring

            # Merchant diversity
            merchants = [
                tx["description"] for tx in pattern["transactions"] if tx["description"]
            ]
            merchant_score = len(set(merchants)) / len(merchants) if merchants else 0

            features.append(
                {
                    "subject_id": subject_id,
                    "amount": pattern["total_amount"],
                    "frequency_score": frequency_score,
                    "amount_variability": amount_variability,
                    "time_score": time_score,
                    "merchant_score": merchant_score,
                }
            )

        return features

    def _increment_version(self) -> str:
        """Increment model version."""
        try:
            version_parts = self.current_model_version.split(".")
            version_parts[-1] = str(int(version_parts[-1]) + 1)
            return ".".join(version_parts)
        except:
            return "1.0.1"

    async def get_model_performance(
        self, model_version: str
    ) -> Optional[Dict[str, Any]]:
        """Get performance metrics for a trained model."""
        metadata_path = self.model_dir / f"{model_version}_metadata.json"

        if metadata_path.exists():
            with open(metadata_path, "r") as f:
                return json.load(f)

        return None

    async def list_available_models(self) -> List[Dict[str, Any]]:
        """List all available trained models."""
        models = []

        for metadata_file in self.model_dir.glob("*_metadata.json"):
            try:
                with open(metadata_file, "r") as f:
                    metadata = json.load(f)
                    models.append(metadata)
            except:
                continue

        return sorted(models, key=lambda x: x.get("created_at", ""), reverse=True)
