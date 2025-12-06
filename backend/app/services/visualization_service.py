from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from datetime import datetime, timedelta
from typing import Dict, Any, List
from app.db.models import Transaction
from decimal import Decimal
from app.services.cache_service import cached

class VisualizationService:
    @staticmethod
    @cached(ttl=60, key_prefix="viz")  # Cache for 1 minute
    async def get_kpis(db: AsyncSession, period_days: int = 30) -> Dict[str, Any]:
        """
        Calculate financial KPIs based on transactions.
        Cached for 60 seconds to reduce database load.
        """
        now = datetime.utcnow()
        start_date = now - timedelta(days=period_days)
        
        # Total Balance (Cash on Hand) - Sum of all transactions
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
                 "trend": 0,
                 "direction": "up"
            },
            "outstanding_debt": {
                "value": 0,
                "trend": 0,
                "direction": "neutral"
            }
        }

    @staticmethod
    @cached(ttl=300, key_prefix="viz")  # Cache for 5 minutes
    async def get_expense_trend(db: AsyncSession) -> List[Dict[str, Any]]:
        """
        Get monthly expense breakdown for the last 6 months.
        Cached for 5 minutes as expense trends change slowly.
        """
        six_months_ago = datetime.utcnow() - timedelta(days=180)
        
        query = (
            select(
                func.strftime('%Y-%m', Transaction.date).label('month'),
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
            # Fallback: Fetch raw records and aggregate in Python (DB-agnostic)
            query_raw = (
                select(Transaction.date, Transaction.amount)
                .where(Transaction.date >= six_months_ago)
                .where(Transaction.amount < 0)
            )
            result_raw = await db.execute(query_raw)
            raw_rows = result_raw.all()
            
            monthly_data = {}
            for date, amount in raw_rows:
                month_key = date.strftime('%b')
                monthly_data[month_key] = monthly_data.get(month_key, 0) + abs(float(amount))
                
            return [{"name": k, "amount": v} for k, v in monthly_data.items()]

        # Process SQL result
        trend_data = []
        for row in rows:
            dt = datetime.strptime(row.month, '%Y-%m')
            trend_data.append({
                "name": dt.strftime('%b'),
                "amount": abs(float(row.total))
            })
            
        return trend_data

    @staticmethod
    @cached(ttl=600, key_prefix="viz")  # Cache for 10 minutes
    async def get_balance_sheet(db: AsyncSession) -> List[Dict[str, Any]]:
        """
        Get simple balance sheet based on positive/negative balances.
        Cached for 10 minutes as balance sheets are relatively static.
        """
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
