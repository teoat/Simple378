# Phase 5 Quick Start

## Setup (One-time)
```bash
# Backend
cd backend
./setup.sh

# Frontend (if needed)
cd frontend
npm install
```

## Run
```bash
# Backend
cd backend && poetry run uvicorn app.main:app --reload

# Frontend
cd frontend && npm run dev
```

## Test Features

### 1. PDF Reports
```bash
curl -o report.pdf http://localhost:8000/api/v1/adjudication/{id}/report
open report.pdf  # Verify watermark and evidence table
```

### 2. GDPR Delete
```bash
curl -X DELETE http://localhost:8000/api/v1/subjects/{id}
# Returns: {"status": "success", "message": "Subject and all data deleted"}
```

### 3. GDPR Export
```bash
curl http://localhost:8000/api/v1/subjects/{id}/export > export.json
cat export.json  # Verify complete data export
```

## Docs
- **Full Testing Guide**: [`walkthrough.md`](file:///Users/Arief/.gemini/antigravity/brain/be59325e-6cc7-4add-9309-c127abb97f33/walkthrough.md)
- **Remaining Tasks**: [`task.md`](file:///Users/Arief/.gemini/antigravity/brain/be59325e-6cc7-4add-9309-c127abb97f33/task.md)
- **API Docs**: http://localhost:8000/api/v1/docs
