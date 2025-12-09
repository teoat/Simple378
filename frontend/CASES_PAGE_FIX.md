# Cases Page Launch Issue Fix

## Problem
The cases page was failing to launch because API calls were not reaching the backend server.

## Root Cause
The `apiRequest` function in `src/lib/api.ts` was not prepending the base API URL to relative URLs. This caused requests like `/cases?page=1` to be sent to the frontend server (http://localhost:5173) instead of the backend API server (http://localhost:8000/api/v1).

## Solution
1. **Updated `apiRequest` function** to prepend `VITE_API_URL` for relative URLs
2. **Updated `.env.example`** to show correct API URL including `/api/v1` path

## Setup Instructions

### 1. Create .env file
```bash
cp .env.example .env
```

### 2. Verify API URL in .env
```env
VITE_API_URL=http://localhost:8000/api/v1
```

**Important:** The `/api/v1` path is required. Do not use just `http://localhost:8000`.

### 3. Start servers
```bash
# Terminal 1 - Backend
cd backend
# ... start backend server on port 8000

# Terminal 2 - Frontend  
cd frontend
npm install
npm run dev
```

### 4. Test
Navigate to http://localhost:5173/cases - the page should now load successfully and fetch case data from the backend.

## Files Changed
- `src/lib/api.ts` - Fixed `apiRequest` to prepend BASE_URL
- `.env.example` - Updated with correct API URL

## Affected Components
This fix resolves API issues for ALL components using `apiRequest`:
- CaseList, CaseDetail
- Forensics, FinalSummary, Ingestion, AdjudicationQueue
- All adjudication components
- Evidence API
- And more...

## Production Deployment
For production, update `VITE_API_URL` to point to your production API server:
```env
VITE_API_URL=https://api.your-domain.com/api/v1
```
