-- TimescaleDB Specific Optimization Script
-- Applied on container startup for fraud_timescale
-- Timestamp: 2025-12-06

-- ============================================================
-- 1. TimescaleDB-Specific Tuning
-- ============================================================

-- Enable compression for time-series data (saves ~10x space)
ALTER SYSTEM SET timescaledb.compress_order_by = 'time DESC';
ALTER SYSTEM SET timescaledb.compress_segmentby = 'host';
ALTER SYSTEM SET timescaledb.compress_chunk_time_interval = '1 week';

-- Tune chunk sizing for analytics workload
ALTER SYSTEM SET timescaledb.max_rows_per_chunk = 100000;

-- Query planning
ALTER SYSTEM SET work_mem = '50MB';
ALTER SYSTEM SET jit = on;                        -- JIT compilation for complex queries
ALTER SYSTEM SET jit_above_cost = 100000;         -- Compile queries above 100ms cost

SELECT pg_reload_conf();

-- ============================================================
-- 2. Hypertable Optimization
-- ============================================================
-- Assuming metrics/timeseries data stored in hypertables

-- Create indexes on common query patterns (time-series)
CREATE INDEX IF NOT EXISTS idx_metrics_time 
  ON metrics(time DESC) 
  WHERE region IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_metrics_host_time 
  ON metrics(host, time DESC) 
  WHERE metric_type = 'system';

-- ============================================================
-- 3. Continuous Aggregates for Analytics
-- ============================================================
-- Pre-aggregate commonly-queried time ranges

-- Example: hourly rollup (adjust based on actual schema)
CREATE MATERIALIZED VIEW IF NOT EXISTS metrics_hourly
WITH (timescaledb.continuous, timescaledb.materialized_only = false) AS
SELECT time_bucket('1 hour', time) AS bucket,
       host,
       AVG(value) AS avg_value,
       MAX(value) AS max_value,
       MIN(value) AS min_value,
       COUNT(*) AS sample_count
FROM metrics
GROUP BY bucket, host;

-- Enable automatic refresh
SELECT add_continuous_aggregate_policy(
  'metrics_hourly',
  start_offset => INTERVAL '3 hour',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '30 minutes'
);

-- ============================================================
-- 4. Data Retention Policy
-- ============================================================
-- Automatically compress old data

SELECT add_compression_policy('metrics', INTERVAL '30 days');

-- Optionally remove very old data (adjust retention window as needed)
-- SELECT add_retention_policy('metrics', INTERVAL '1 year');

-- ============================================================
-- 5. Autovacuum & Maintenance
-- ============================================================

ALTER SYSTEM SET autovacuum = on;
ALTER SYSTEM SET autovacuum_max_workers = 2;
ALTER SYSTEM SET autovacuum_naptime = '30s';

-- ============================================================
-- 6. Performance Monitoring
-- ============================================================

-- Enable statistics collection
ALTER SYSTEM SET log_statement = 'ddl';           -- Log DDL for optimization tracking
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries >1000ms

SELECT pg_reload_conf();

-- ============================================================
-- 7. Connection and Memory
-- ============================================================
-- Already set via POSTGRES_INITDB_ARGS

-- Verify settings applied
DO $$ 
BEGIN
  RAISE NOTICE 'TimescaleDB optimization applied: %', NOW();
  RAISE NOTICE 'Compression policies configured';
  RAISE NOTICE 'JIT enabled for complex queries';
  RAISE NOTICE 'Continuous aggregates created';
END $$;
