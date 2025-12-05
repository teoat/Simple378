# 🗄️ Database Architecture

> PostgreSQL database schema and design

---

## Overview

Simple378 uses PostgreSQL 15 as the primary database with TimescaleDB extension for time-series data.

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    users    │       │    cases    │       │   subjects  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)     │───────│ id (PK)     │
│ email       │  │    │ subject_id  │       │ name        │
│ password    │  └───►│ investigator│       │ type        │
│ role        │       │ status      │       │ risk_score  │
│ created_at  │       │ risk_score  │       │ metadata    │
└─────────────┘       │ created_at  │       └─────────────┘
                      └─────────────┘              │
                            │                      │
                            ▼                      ▼
                      ┌─────────────┐       ┌─────────────┐
                      │ transactions│       │  documents  │
                      ├─────────────┤       ├─────────────┤
                      │ id (PK)     │       │ id (PK)     │
                      │ case_id (FK)│       │ subject_id  │
                      │ date        │       │ filename    │
                      │ amount      │       │ content     │
                      │ description │       │ embedding   │
                      │ counterparty│       │ created_at  │
                      └─────────────┘       └─────────────┘
```

---

## Core Tables

### users

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR(255) | Unique email |
| hashed_password | VARCHAR(255) | Bcrypt hash |
| full_name | VARCHAR(255) | Display name |
| role | ENUM | admin, investigator, viewer |
| is_active | BOOLEAN | Account status |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last modified |

### cases

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| subject_id | UUID | FK to subjects |
| investigator_id | UUID | FK to users |
| status | ENUM | open, in_progress, closed |
| priority | ENUM | low, medium, high, critical |
| risk_score | DECIMAL(5,2) | Calculated risk (0-100) |
| summary | TEXT | Case summary |
| created_at | TIMESTAMP | Creation time |
| closed_at | TIMESTAMP | Closure time |

### transactions

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| case_id | UUID | FK to cases |
| account_id | UUID | FK to accounts |
| date | DATE | Transaction date |
| amount | DECIMAL(18,2) | Amount (precise) |
| description | TEXT | Description |
| counterparty | VARCHAR(255) | Other party |
| category | VARCHAR(100) | Transaction type |
| is_flagged | BOOLEAN | Flagged status |
| metadata | JSONB | Additional data |

### subjects

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Subject name |
| type | ENUM | individual, company |
| external_id | VARCHAR(100) | External reference |
| risk_score | DECIMAL(5,2) | Subject risk |
| metadata | JSONB | Additional data |

### documents

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| case_id | UUID | FK to cases |
| filename | VARCHAR(255) | Original filename |
| file_path | VARCHAR(500) | Storage path |
| file_type | VARCHAR(50) | MIME type |
| file_size | INTEGER | Size in bytes |
| content | TEXT | Extracted text |
| embedding | VECTOR(1536) | AI embedding |
| created_at | TIMESTAMP | Upload time |

---

## Analysis Tables

### analysis_results

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| case_id | UUID | FK to cases |
| analysis_type | VARCHAR(50) | Type of analysis |
| status | ENUM | pending, complete, failed |
| results | JSONB | Analysis output |
| confidence | DECIMAL(5,2) | Confidence score |
| created_at | TIMESTAMP | Run time |

### patterns

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(100) | Pattern name |
| type | VARCHAR(50) | mirroring, round_trip, etc |
| definition | JSONB | Pattern rules |
| is_system | BOOLEAN | Built-in vs custom |
| created_by | UUID | FK to users |

### alerts

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| case_id | UUID | FK to cases |
| pattern_id | UUID | FK to patterns |
| severity | ENUM | low, medium, high, critical |
| status | ENUM | new, reviewed, dismissed |
| data | JSONB | Alert details |
| created_at | TIMESTAMP | Detection time |

---

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_investigator ON cases(investigator_id);
CREATE INDEX idx_transactions_case ON transactions(case_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_alerts_case ON alerts(case_id);
CREATE INDEX idx_alerts_status ON alerts(status);

-- Full-text search
CREATE INDEX idx_transactions_desc ON transactions USING gin(to_tsvector('english', description));

-- JSONB indexes
CREATE INDEX idx_subjects_metadata ON subjects USING gin(metadata);
```

---

## Migrations

Using Alembic for migrations:

```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## Backup & Recovery

```bash
# Backup
pg_dump -U postgres simple378 > backup.sql

# Restore
psql -U postgres simple378 < backup.sql
```

---

## Related

- [Backend Architecture](./BACKEND.md)
- [API Reference](../04-developer-guide/API_REFERENCE.md)
