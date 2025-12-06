-- Create tenant-related tables for Phase 5 enterprise features

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    region VARCHAR(50) DEFAULT 'us-east-1',
    plan VARCHAR(50) DEFAULT 'standard',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    features JSONB DEFAULT '[]',
    limits JSONB,
    compliance_standards JSONB DEFAULT '["SOC2", "HIPAA", "GDPR", "CCPA"]'
);

-- Tenant usage table
CREATE TABLE IF NOT EXISTS tenant_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    api_calls_this_month INT DEFAULT 0,
    storage_used_gb DECIMAL(10,2) DEFAULT 0,
    team_members_active INT DEFAULT 0,
    cases_created INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id)
);

-- Health metrics table
CREATE TABLE IF NOT EXISTS health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_time_ms DECIMAL(10,2),
    error_rate DECIMAL(5,2),
    uptime_percent DECIMAL(5,2),
    active_users INT,
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_health_metrics_timestamp ON health_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_tenant_usage_tenant_id ON tenant_usage(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_domain ON tenants(domain);
CREATE INDEX IF NOT EXISTS idx_tenants_plan ON tenants(plan);

-- Insert default production tenant
INSERT INTO tenants (name, domain, region, plan, features, limits)
VALUES (
    'Production Fraud Detection Platform',
    'fraud-detection.example.com',
    'us-east-1',
    'enterprise',
    '["advanced_analytics","ai_orchestration","real_time_collaboration","custom_integrations","api_access","sso","dedicated_support","custom_training","pwa_offline","mobile_camera","multi_tenant","enterprise_monitoring"]',
    '{"api_calls_per_month": null, "storage_gb": null, "team_members": null, "cases": null}'
) ON CONFLICT DO NOTHING;