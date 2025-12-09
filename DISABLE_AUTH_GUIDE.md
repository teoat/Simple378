# Disabling Authentication for Development

This guide explains how to disable authentication in the Simple378 application for local development and testing purposes.

## ⚠️ WARNING

**NEVER enable this feature in production environments!** This feature is intended only for local development to facilitate testing and feature development without the need for login credentials.

## Backend Configuration

### Step 1: Enable the Flag

Add the following to your backend `.env` file:

```bash
DISABLE_AUTH=true
```

Or set the environment variable when starting the backend:

```bash
DISABLE_AUTH=true python -m uvicorn app.main:app --reload
```

### Step 2: Restart the Backend

The backend will now:
- Skip JWT token validation
- Automatically use a mock development user for all authenticated endpoints
- Mock user details:
  - ID: `00000000-0000-0000-0000-000000000001`
  - Email: `dev@example.com`
  - Name: `Development User`
  - Role: `admin`

## Frontend Configuration

### Step 1: Enable the Flag

Add the following to your frontend `.env` file:

```bash
VITE_DISABLE_AUTH=true
```

### Step 2: Restart the Frontend

The frontend will now:
- Skip the authentication guard on protected routes
- Automatically authenticate with a mock user
- Allow direct navigation to any page without login

## Testing the Configuration

1. **Start the backend** with `DISABLE_AUTH=true`
2. **Start the frontend** with `VITE_DISABLE_AUTH=true`
3. Navigate directly to any protected route (e.g., `/dashboard`, `/cases`)
4. You should be able to access all pages without logging in

## Example: Complete Development Setup

Create a `.env` file in the backend directory:

```bash
# backend/.env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/fraud_detection
REDIS_URL=redis://localhost:6379/0
QDRANT_URL=http://localhost:6333
SECRET_KEY=dev-secret-key-not-for-production
DISABLE_AUTH=true
```

Create a `.env` file in the frontend directory:

```bash
# frontend/.env
VITE_API_URL=http://localhost:8000/api/v1
VITE_DISABLE_AUTH=true
```

Then start both services:

```bash
# Terminal 1 - Backend
cd backend
uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Reverting to Normal Authentication

To re-enable authentication:

1. Set `DISABLE_AUTH=false` in backend `.env` (or remove the variable)
2. Set `VITE_DISABLE_AUTH=false` in frontend `.env` (or remove the variable)
3. Restart both backend and frontend

## Security Notes

- The `DISABLE_AUTH` flag should **never** be set to `true` in production
- This feature is designed for local development only
- When disabled, all API endpoints are accessible without authentication
- The mock user has admin role, giving full access to all features
- No actual user validation or permission checks occur when this flag is enabled

## Troubleshooting

### Backend still requires authentication

- Verify `DISABLE_AUTH=true` is set in your `.env` file
- Check that the backend server was restarted after changing the environment variable
- Ensure there are no typos in the variable name

### Frontend still redirects to login

- Verify `VITE_DISABLE_AUTH=true` is set in your `.env` file
- Environment variables in Vite must be prefixed with `VITE_`
- Restart the development server after changing environment variables
- Clear browser cache and local storage if issues persist

### API requests fail with 401 errors

- Ensure both backend AND frontend have the respective flags enabled
- The backend flag disables API authentication
- The frontend flag disables the authentication guard and UI flows
- Both must be enabled together for the feature to work properly
