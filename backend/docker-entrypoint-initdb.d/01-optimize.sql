-- Database Performance Optimization Script
-- Applied on container startup for fraud_db
-- Timestamp: 2025-12-06

-- ============================================================
-- 1. Dynamic Configuration Tuning (if not already set)
-- ============================================================
-- Note: Parameters set via POSTGRES_INITDB_ARGS take precedence

-- Verify and apply additional tuning
ALTER SYSTEM SET random_page_cost = 1.1;           -- SSD-aware cost model
ALTER SYSTEM SET checkpoint_completion_target = 0.9; -- Smoother checkpoints
ALTER SYSTEM SET wal_buffers = '16MB';             -- Faster WAL writes
ALTER SYSTEM SET default_statistics_target = 100;  -- Better query planning
ALTER SYSTEM SET autovacuum_vacuum_scale_factor = 0.05; -- More frequent vacuuming
ALTER SYSTEM SET autovacuum_analyze_scale_factor = 0.02; -- More frequent analysis

SELECT pg_reload_conf();

-- ============================================================
-- 2. Create Performance-Critical Indexes
-- ============================================================
-- These indexes optimize common query patterns

CREATE INDEX IF NOT EXISTS idx_cases_created_at 
  ON cases(created_at DESC) 
  WHERE status != 'deleted';

CREATE INDEX IF NOT EXISTS idx_cases_risk_score 
  ON cases(risk_score DESC NULLS LAST) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_cases_subject_id_created 
  ON cases(subject_id, created_at DESC) 
  WHERE status != 'deleted';

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp 
  ON audit_logs(timestamp DESC) 
  WHERE action NOT LIKE 'read%';

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action 
  ON audit_logs(user_id, action, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_subjects_created_at 
  ON subjects(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_indicators_case_id 
  ON indicators(case_id, confidence DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_subject_created 
  ON transactions(subject_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_search_history_user 
  ON search_history(user_id, created_at DESC) 
  WHERE status = 'completed';

-- ============================================================
-- 3. Table-Level Configuration
-- ============================================================
-- Optimize table storage

ALTER TABLE cases SET (fillfactor = 90);           -- Room for updates
ALTER TABLE audit_logs SET (fillfactor = 100);    -- Immutable append-only
ALTER TABLE transactions SET (fillfactor = 95);   -- Mostly immutable

-- ============================================================
-- 4. Autovacuum Tuning per Table
-- ============================================================
-- Balance between memory and freshness

ALTER TABLE audit_logs SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

ALTER TABLE cases SET (
  autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_analyze_scale_factor = 0.02
);

-- ============================================================
-- 5. Connection Pool Verification
-- ============================================================
-- Ensure connection settings align with application config

-- fraud_db should support:
-- - FastAPI backend (default 10 connections)
-- - MCP server (additional 5-10 connections)
-- - Maintenance tasks (2-3 connections)
-- Total: 20-25 typical, 100 max_connections provides 4x headroom

-- ============================================================
-- 6. Query Planning Configuration
-- ============================================================

ALTER SYSTEM SET join_collapse_limit = 12;        -- Better join ordering
ALTER SYSTEM SET from_collapse_limit = 12;        -- Better FROM planning

-- ============================================================
-- Finalize
-- ============================================================

SELECT pg_reload_conf();

-- Log optimization applied
DO $$ 
BEGIN
  RAISE NOTICE 'Database optimization applied: %', NOW();
  RAISE NOTICE 'Indexes created, tuning parameters set';
  RAISE NOTICE 'Next: Monitor with pg_stat_statements and EXPLAIN ANALYZE';
END $$;
