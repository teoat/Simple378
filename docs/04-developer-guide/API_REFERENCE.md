# 📡 API Reference

> REST API documentation for Simple378

---

## Base URL

```
Development: http://localhost:8000/api/v1
Production:  https://api.simple378.io/v1
```

---

## Authentication

All API requests require a Bearer token:

```bash
curl -H "Authorization: Bearer <token>" \
     https://api.simple378.io/v1/cases
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJ..."
}
```

---

## Cases

### List Cases
```http
GET /cases?page=1&per_page=25&status=open
```

**Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| page | int | Page number (default: 1) |
| per_page | int | Items per page (default: 25, max: 100) |
| status | string | Filter by status |
| priority | string | Filter by priority |
| investigator_id | uuid | Filter by investigator |

**Response:**
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "subject_id": "...",
      "status": "open",
      "priority": "high",
      "risk_score": 85.5,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "pages": 6
}
```

### Create Case
```http
POST /cases
Content-Type: application/json

{
  "subject_id": "550e8400-...",
  "priority": "high",
  "description": "Initial investigation notes"
}
```

### Get Case
```http
GET /cases/{id}
```

### Update Case
```http
PUT /cases/{id}
Content-Type: application/json

{
  "status": "in_progress",
  "investigator_id": "..."
}
```

### Delete Case
```http
DELETE /cases/{id}
```

---

## Transactions

### List Transactions
```http
GET /cases/{case_id}/transactions
```

### Create Transaction
```http
POST /cases/{case_id}/transactions
Content-Type: application/json

{
  "date": "2024-01-15",
  "amount": 50000000,
  "description": "Payment to vendor",
  "counterparty": "PT ABC"
}
```

---

## Adjudication

### Get Queue
```http
GET /adjudication/queue?page=1&per_page=25
```

**Response:**
```json
{
  "items": [
    {
      "id": "alert-123",
      "case_id": "...",
      "pattern_type": "mirroring",
      "risk_score": 92,
      "status": "pending",
      "created_at": "..."
    }
  ],
  "total": 127
}
```

### Submit Decision
```http
POST /adjudication/decide
Content-Type: application/json

{
  "alert_id": "alert-123",
  "decision": "approve",
  "notes": "Clear evidence of mirroring pattern"
}
```

**Decision values:** `approve`, `reject`, `escalate`, `defer`

---

## Analysis

### Run Analysis
```http
POST /analysis/run
Content-Type: application/json

{
  "case_id": "...",
  "analysis_types": ["patterns", "risk_score", "network"]
}
```

### Get Results
```http
GET /analysis/{analysis_id}
```

---

## Ingestion

### Upload Document
```http
POST /ingestion/upload
Content-Type: multipart/form-data

file: <binary>
case_id: "..."
```

**Response:**
```json
{
  "document_id": "doc-123",
  "filename": "statement.pdf",
  "status": "processing",
  "upload_time": "..."
}
```

### Get Processing Status
```http
GET /ingestion/{document_id}/status
```

---

## Search

### Semantic Search
```http
POST /search
Content-Type: application/json

{
  "query": "shell company payments in January",
  "filters": {
    "date_from": "2024-01-01",
    "date_to": "2024-01-31"
  },
  "limit": 20
}
```

---

## WebSocket

### Connect
```
ws://localhost:8000/ws?token=<access_token>
```

### Message Types

**Incoming:**
```json
{"type": "alert_added", "payload": {"alert_id": "...", "risk_score": 92}}
{"type": "case_updated", "payload": {"case_id": "...", "status": "closed"}}
{"type": "ping"}
```

**Outgoing:**
```json
{"type": "subscribe", "payload": {"channels": ["alerts", "cases"]}}
{"type": "pong"}
```

---

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error message",
  "code": "ERROR_CODE",
  "status": 400
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| UNAUTHORIZED | 401 | Invalid or expired token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 422 | Invalid request data |
| RATE_LIMITED | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal error |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Authentication | 10/minute |
| Read operations | 100/minute |
| Write operations | 30/minute |
| File uploads | 10/minute |

---

## Related

- [Backend Architecture](../02-architecture/BACKEND.md)
- [Testing](./TESTING.md)
