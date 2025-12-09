# Application Screenshots

This directory contains screenshots of all pages in the Simple378 fraud detection application, captured on December 9, 2024.

## Screenshot List

### Main Application Pages

1. **01-dashboard.png** - Dashboard with metrics, charts, and quick actions
2. **02-cases.png** - Cases list view with search and filters
3. **03-adjudication.png** - Adjudication queue for reviewing alerts
4. **04-ingestion.png** - Data ingestion wizard (Step 1: Upload)
5. **05-reconciliation.png** - Transaction reconciliation interface
6. **06-forensics.png** - Forensics & Investigation (Entity Resolution tab)
7. **07-settings.png** - Settings page (Profile tab)

### Error Pages

8. **08-error-404.png** - 404 Not Found page
9. **09-error-401.png** - 401 Unauthorized page
10. **10-error-403.png** - 403 Forbidden page
11. **11-error-500.png** - 500 Internal Server Error page
12. **12-error-offline.png** - Offline mode page

## Viewing Instructions

All screenshots are in PNG format and can be viewed in any image viewer or web browser.

## Test Environment

- **Frontend:** Vite development server on http://localhost:5173
- **Backend:** Minimal backend server on http://localhost:8000
- **Browser:** Chromium (Playwright)
- **Authentication:** Disabled for testing (VITE_DISABLE_AUTH=true)

## Notes

- Some pages show "Loading" or "No data" states because they depend on full backend API endpoints
- The minimal backend provides basic routing but not all data endpoints
- All screenshots demonstrate the UI is fully functional and properly styled
- Error pages are intentionally triggered by navigating to specific routes

For a detailed analysis of the application, see [APP_DIAGNOSIS.md](../APP_DIAGNOSIS.md) in the root directory.
