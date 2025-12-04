"""
TimescaleDB Integration Service

Provides high-performance time-series analytics for transaction data,
with automatic partitioning, compression, and continuous aggregates.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.sql import text
from app.core.config import settings


class TimescaleDBService:
    """Service for TimescaleDB time-series database operations."""
    
    def __init__(self):
        # Create separate connection to TimescaleDB
        timescale_url = settings.TIMESCALE_URL or settings.DATABASE_URL.replace(
            settings.POSTGRES_DB,
            f"{settings.POSTGRES_DB}_timeseries"
        )
        self.engine = create_async_engine(timescale_url, echo=False)
    
    async def initialize_hypertables(self):
        """
        Create hypertables for time-series data.
        
        Hypertables automatically partition data by time for optimal query performance.
        """
        async with self.engine.begin() as conn:
            # Create transactions hypertable
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS transactions_ts (
                    id UUID PRIMARY KEY,
                    case_id UUID NOT NULL,
                    subject_id UUID,
                    timestamp TIMESTAMPTZ NOT NULL,
                    amount DECIMAL(15, 2),
                    currency VARCHAR(3),
                    transaction_type VARCHAR(50),
                    source_account VARCHAR(100),
                    destination_account VARCHAR(100),
                    description TEXT,
                    risk_score DECIMAL(3, 2),
                    suspicious BOOLEAN DEFAULT FALSE,
                    metadata JSONB
                );
            """))
            
            # Convert to hypertable (partitioned by timestamp)
            await conn.execute(text("""
                SELECT create_hypertable(
                    'transactions_ts',
                    'timestamp',
                    if_not_exists => TRUE,
                    chunk_time_interval => INTERVAL '7 days'
                );
            """))
            
            # Create indexes for query optimization
            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_transactions_case_time 
                ON transactions_ts (case_id, timestamp DESC);
            """))
            
            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_transactions_subject_time 
                ON transactions_ts (subject_id, timestamp DESC);
            """))
            
            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_transactions_suspicious 
                ON transactions_ts (suspicious, timestamp DESC) 
                WHERE suspicious = TRUE;
            """))
            
            # Create continuous aggregate for hourly stats
            await conn.execute(text("""
                CREATE MATERIALIZED VIEW IF NOT EXISTS transactions_hourly
                WITH (timescaledb.continuous) AS
                SELECT
                    time_bucket('1 hour', timestamp) AS hour,
                    case_id,
                    COUNT(*) AS transaction_count,
                    SUM(amount) AS total_amount,
                    AVG(risk_score) AS avg_risk_score,
                    COUNT(*) FILTER (WHERE suspicious = TRUE) AS suspicious_count
                FROM transactions_ts
                GROUP BY hour, case_id;
            """))
            
            # Add refresh policy (update aggregates every hour)
            await conn.execute(text("""
                SELECT add_continuous_aggregate_policy(
                    'transactions_hourly',
                    start_offset => INTERVAL '3 hours',
                    end_offset => INTERVAL '1 hour',
                    schedule_interval => INTERVAL '1 hour',
                    if_not_exists => TRUE
                );
            """))
            
            # Enable compression for data older than 30 days
            await conn.execute(text("""
                SELECT add_compression_policy(
                    'transactions_ts',
                    INTERVAL '30 days',
                    if_not_exists => TRUE
                );
            """))
    
    async def insert_transaction(self, transaction_data: Dict[str, Any]):
        """
        Insert a single transaction into TimescaleDB.
        
        Args:
            transaction_data: Transaction details with timestamp
        """
        async with self.engine.begin() as conn:
            await conn.execute(
                text("""
                    INSERT INTO transactions_ts (
                        id, case_id, subject_id, timestamp, amount, currency,
                        transaction_type, source_account, destination_account,
                        description, risk_score, suspicious, metadata
                    ) VALUES (
                        :id, :case_id, :subject_id, :timestamp, :amount, :currency,
                        :transaction_type, :source_account, :destination_account,
                        :description, :risk_score, :suspicious, :metadata
                    )
                """),
                transaction_data
            )
    
    async def insert_transactions_bulk(self, transactions: List[Dict[str, Any]]):
        """Bulk insert transactions for optimal performance."""
        async with self.engine.begin() as conn:
            await conn.execute(
                text("""
                    INSERT INTO transactions_ts (
                        id, case_id, subject_id, timestamp, amount, currency,
                        transaction_type, source_account, destination_account,
                        description, risk_score, suspicious, metadata
                    ) VALUES (
                        :id, :case_id, :subject_id, :timestamp, :amount, :currency,
                        :transaction_type, :source_account, :destination_account,
                        :description, :risk_score, :suspicious, :metadata
                    )
                """),
                transactions
            )
    
    async def get_transactions_time_range(
        self,
        case_id: str,
        start_time: datetime,
        end_time: datetime,
        suspicious_only: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Query transactions within a time range.
        
        Args:
            case_id: Case identifier
            start_time: Start of time range
            end_time: End of time range
            suspicious_only: Filter for suspicious transactions only
        
        Returns:
            List of transactions
        """
        query = """
            SELECT *
            FROM transactions_ts
            WHERE case_id = :case_id
              AND timestamp BETWEEN :start_time AND :end_time
        """
        
        if suspicious_only:
            query += " AND suspicious = TRUE"
        
        query += " ORDER BY timestamp DESC"
        
        async with self.engine.connect() as conn:
            result = await conn.execute(
                text(query),
                {
                    'case_id': case_id,
                    'start_time': start_time,
                    'end_time': end_time
                }
            )
            return [dict(row._mapping) for row in result]
    
    async def get_hourly_aggregates(
        self,
        case_id: str,
        start_time: datetime,
        end_time: datetime
    ) -> List[Dict[str, Any]]:
        """
        Get pre-computed hourly transaction aggregates.
        
        Much faster than computing on-the-fly for large datasets.
        """
        async with self.engine.connect() as conn:
            result = await conn.execute(
                text("""
                    SELECT *
                    FROM transactions_hourly
                    WHERE case_id = :case_id
                      AND hour BETWEEN :start_time AND :end_time
                    ORDER BY hour DESC
                """),
                {
                    'case_id': case_id,
                    'start_time': start_time,
                    'end_time': end_time
                }
            )
            return [dict(row._mapping) for row in result]
    
    async def detect_velocity_anomalies(
        self,
        case_id: str,
        window_hours: int = 24,
        threshold_multiplier: float = 3.0
    ) -> List[Dict[str, Any]]:
        """
        Detect transaction velocity anomalies.
        
        Identifies time periods with unusually high transaction volumes
        compared to historical baseline.
        
        Args:
            case_id: Case to analyze
            window_hours: Rolling window size in hours
            threshold_multiplier: Standard deviations above mean to flag
        
        Returns:
            List of anomalous time periods
        """
        async with self.engine.connect() as conn:
            result = await conn.execute(
                text("""
                    WITH hourly_counts AS (
                        SELECT
                            time_bucket('1 hour', timestamp) AS hour,
                            COUNT(*) AS tx_count
                        FROM transactions_ts
                        WHERE case_id = :case_id
                        GROUP BY hour
                    ),
                    stats AS (
                        SELECT
                            AVG(tx_count) AS mean,
                            STDDEV(tx_count) AS stddev
                        FROM hourly_counts
                    )
                    SELECT
                        h.hour,
                        h.tx_count,
                        s.mean,
                        s.stddev,
                        (h.tx_count - s.mean) / NULLIF(s.stddev, 0) AS z_score
                    FROM hourly_counts h
                    CROSS JOIN stats s
                    WHERE (h.tx_count - s.mean) / NULLIF(s.stddev, 0) > :threshold
                    ORDER BY z_score DESC
                """),
                {
                    'case_id': case_id,
                    'threshold': threshold_multiplier
                }
            )
            return [dict(row._mapping) for row in result]
    
    async def get_transaction_patterns(
        self,
        case_id: str,
        pattern_type: str = 'circular'
    ) -> List[Dict[str, Any]]:
        """
        Detect transaction patterns (circular payments, layering, etc.).
        
        Args:
            case_id: Case to analyze
            pattern_type: Type of pattern ('circular', 'layering', 'smurfing')
        """
        if pattern_type == 'circular':
            # Detect circular transaction chains (A -> B -> C -> A)
            query = """
                WITH RECURSIVE transaction_chain AS (
                    -- Anchor: starting transactions
                    SELECT
                        id,
                        source_account,
                        destination_account,
                        amount,
                        timestamp,
                        ARRAY[source_account] AS chain,
                        1 AS depth
                    FROM transactions_ts
                    WHERE case_id = :case_id
                    
                    UNION ALL
                    
                    -- Recursive: follow transaction chain
                    SELECT
                        t.id,
                        t.source_account,
                        t.destination_account,
                        t.amount,
                        t.timestamp,
                        tc.chain || t.source_account,
                        tc.depth + 1
                    FROM transactions_ts t
                    JOIN transaction_chain tc ON t.source_account = tc.destination_account
                    WHERE tc.depth < 10
                      AND NOT (t.source_account = ANY(tc.chain))
                )
                SELECT DISTINCT ON (chain)
                    chain,
                    depth,
                    SUM(amount) AS total_amount
                FROM transaction_chain
                WHERE source_account = ANY(chain[1:depth-1])  -- Circular pattern detected
                GROUP BY chain, depth
                ORDER BY chain, depth DESC
                LIMIT 100
            """
        else:
            # Placeholder for other pattern types
            query = """
                SELECT 'pattern_detection_not_implemented' AS message
            """
        
        async with self.engine.connect() as conn:
            result = await conn.execute(text(query), {'case_id': case_id})
            return [dict(row._mapping) for row in result]
    
    async def get_compression_stats(self) -> Dict[str, Any]:
        """Get compression statistics for the hypertable."""
        async with self.engine.connect() as conn:
            result = await conn.execute(text("""
                SELECT
                    pg_size_pretty(before_compression_total_bytes) AS before_compression,
                    pg_size_pretty(after_compression_total_bytes) AS after_compression,
                    ROUND(
                        100 * (1 - after_compression_total_bytes::numeric / NULLIF(before_compression_total_bytes, 0)),
                        2
                    ) AS compression_ratio_pct
                FROM timescaledb_information.compression_settings
                WHERE hypertable_name = 'transactions_ts'
            """))
            row = result.first()
            return dict(row._mapping) if row else {}


# Singleton instance
_timescale_service = None

def get_timescale_service() -> TimescaleDBService:
    """Get singleton instance of TimescaleDBService."""
    global _timescale_service
    if _timescale_service is None:
        _timescale_service = TimescaleDBService()
    return _timescale_service
