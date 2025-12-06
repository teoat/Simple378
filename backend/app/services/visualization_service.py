from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from datetime import datetime, timedelta
from typing import Dict, Any, List
from app.db.models import Transaction
from decimal import Decimal

class VisualizationService:
    @staticmethod
    async def get_kpis(db: AsyncSession, period_days: int = 30) -> Dict[str, Any]:
        """
        Calculate financial KPIs based on transactions.
        """
        now = datetime.utcnow()
        start_date = now - timedelta(days=period_days)
        
        # Total Balance (Cash on Hand) - Sum of all transactions
        # In a real system, this would be sum of asset accounts
        result_balance = await db.execute(select(func.sum(Transaction.amount)))
        cash_on_hand = result_balance.scalar() or Decimal(0)

        # Revenue (Deposits/Positive) in period
        result_revenue = await db.execute(
            select(func.sum(Transaction.amount))
            .where(Transaction.date >= start_date)
            .where(Transaction.amount > 0)
        )
        revenue = result_revenue.scalar() or Decimal(0)

        # Burn Rate (Expenses/Negative) in period
        result_expenses = await db.execute(
            select(func.sum(Transaction.amount))
            .where(Transaction.date >= start_date)
            .where(Transaction.amount < 0)
        )
        burn_rate = abs(result_expenses.scalar() or Decimal(0))

        # Compare with previous period for trends
        prev_start = start_date - timedelta(days=period_days)
        
        # Previous Burn Rate
        prev_burn_result = await db.execute(
            select(func.sum(Transaction.amount))
            .where(Transaction.date >= prev_start)
            .where(Transaction.date < start_date)
            .where(Transaction.amount < 0)
        )
        prev_burn = abs(prev_burn_result.scalar() or Decimal(0))
        
        # Calculate trend percentage
        burn_trend = 0
        if prev_burn > 0:
            burn_trend = int(((burn_rate - prev_burn) / prev_burn) * 100)
            
        return {
            "burn_rate": {
                "value": float(burn_rate),
                "trend": burn_trend,
                "direction": "up" if burn_trend > 0 else "down"
            },
            "cash_on_hand": {
                "value": float(cash_on_hand),
                "trend": 0,
                "direction": "neutral"
            },
            "monthly_revenue": {
                 "value": float(revenue),
                 "trend": 0, # TODO: specific trend calc
                 "direction": "up"
            },
            "outstanding_debt": {
                "value": 0, # Placeholder
                "trend": 0,
                "direction": "neutral"
            }
        }

    @staticmethod
    async def get_expense_trend(db: AsyncSession) -> List[Dict[str, Any]]:
        """
        Get monthly expense breakdown for the last 6 months.
        """
        # Using pure SQL for date truncation as it varies by DB (SQLite vs Postgres)
        # Assuming SQLite for local dev based on user_information potentially, or Postgres.
        # Let's try to be generic or use Python grouping if dataset is small, 
        # but better to use SQLAlchemy extract.
        
        six_months_ago = datetime.utcnow() - timedelta(days=180)
        
        query = (
            select(
                func.strftime('%Y-%m', Transaction.date).label('month'), # SQLite specific
                func.sum(Transaction.amount).label('total')
            )
            .where(Transaction.date >= six_months_ago)
            .where(Transaction.amount < 0)
            .group_by('month')
            .order_by('month')
        )
        
        try:
            result = await db.execute(query)
            rows = result.all()
        except:
            # Fallback for Postgres (to_char) if sqlite fails or vice versa
            # For now assuming SQLite as per common dev setups, but let's be safe
            # If this is Postgres, use to_char(date, 'YYYY-MM')
            # Let's fetch raw records and aggregate in python to be DB-agnostic for MVP
            query_raw = (
                select(Transaction.date, Transaction.amount)
                .where(Transaction.date >= six_months_ago)
                .where(Transaction.amount < 0)
            )
            result_raw = await db.execute(query_raw)
            raw_rows = result_raw.all()
            
            monthly_data = {}
            for date, amount in raw_rows:
                month_key = date.strftime('%b') # Jan, Feb...
                monthly_data[month_key] = monthly_data.get(month_key, 0) + abs(float(amount))
                
            # Sort by month? 
            # A simple return for now:
            return [{"name": k, "amount": v} for k, v in monthly_data.items()]

        # Process SQL result
        trend_data = []
        for row in rows:
            # month str '2025-01'
            dt = datetime.strptime(row.month, '%Y-%m')
            trend_data.append({
                "name": dt.strftime('%b'),
                "amount": abs(float(row.total))
            })
            
        return trend_data

    @staticmethod
    async def get_balance_sheet(db: AsyncSession) -> List[Dict[str, Any]]:
        """
        Get simple balance sheet based on positive/negative balances.
        """
        # For MVP, we mock the structure but could populate with real sums
        return [
            {"name": "Assets", "children": [
                {"name": "Cash", "size": 15000},
                {"name": "Receivables", "size": 4000},
            ]},
            {"name": "Liabilities", "children": [
                {"name": "Payables", "size": 5000},
            ]},
            {"name": "Equity", "children": [
                {"name": "Retained Earnings", "size": 14000},
            ]},
        ]
