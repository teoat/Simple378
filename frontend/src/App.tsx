import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './context/AuthContext';
import { AIProvider } from './context/AIContext';
import { AuthGuard } from './components/auth/AuthGuard';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LoadingState } from './components/ui/Loading';
import { AppShell } from './components/layout/AppShell';
import { AIAssistant } from './components/ai/AIAssistant';
import { NetworkMonitor } from './components/NetworkMonitor';
import { PWAInstallBanner } from './components/pwa/PWAInstallBanner';
import { OfflineSyncStatus } from './components/pwa/OfflineSyncStatus';

// Lazy load route components for code splitting
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const CaseList = lazy(() => import('./pages/CaseList').then(m => ({ default: m.CaseList })));
const CaseDetail = lazy(() => import('./pages/CaseDetail').then(m => ({ default: m.CaseDetail })));
const Reconciliation = lazy(() => import('./pages/Reconciliation').then(m => ({ default: m.Reconciliation })));
const Forensics = lazy(() => import('./pages/Forensics').then(m => ({ default: m.Forensics })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const AdjudicationQueue = lazy(() => import('./pages/AdjudicationQueue').then(m => ({ default: m.AdjudicationQueue })));
const FinalSummary = lazy(() => import('./pages/FinalSummary').then(m => ({ default: m.FinalSummary })));
const Ingestion = lazy(() => import('./pages/Ingestion').then(m => ({ default: m.Ingestion })));
const Visualization = lazy(() => import('./pages/Visualization').then(m => ({ default: m.Visualization })));

// Error Pages
const NotFound = lazy(() => import('./pages/errors/NotFound').then(m => ({ default: m.NotFound })));
const Forbidden = lazy(() => import('./pages/errors/Forbidden').then(m => ({ default: m.Forbidden })));
const ServerError = lazy(() => import('./pages/errors/ServerError').then(m => ({ default: m.ServerError })));
const Unauthorized = lazy(() => import('./pages/errors/Unauthorized').then(m => ({ default: m.Unauthorized })));
const Offline = lazy(() => import('./pages/errors/Offline').then(m => ({ default: m.Offline })));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingState message="Loading page..." />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <NetworkMonitor />
          <PWAInstallBanner />
          <OfflineSyncStatus />
          <AuthProvider>
            <AIProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                
                {/* Error pages (public) */}
                <Route path="/401" element={<Unauthorized />} />
                <Route path="/403" element={<Forbidden />} />
                <Route path="/500" element={<ServerError />} />
                <Route path="/offline" element={<Offline />} />
                
                {/* Protected routes */}
                <Route
                  element={
                    <ErrorBoundary>
                      <AuthGuard>
                        <AppShell />
                      </AuthGuard>
                    </ErrorBoundary>
                  }
                >
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/cases" element={<CaseList />} />
                  <Route path="/cases/:id" element={<CaseDetail />} />
                  <Route path="/summary/:caseId" element={<FinalSummary />} />
                  <Route path="/adjudication" element={<AdjudicationQueue />} />
                  <Route path="/reconciliation" element={<Reconciliation />} />
                  <Route path="/forensics" element={<Forensics />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/ingestion" element={<Ingestion />} />
                  <Route path="/visualization/:caseId" element={<Visualization />} />
                </Route>
                
                {/* Catch-all 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <AIAssistant />
            <Toaster position="top-right" />
            </AIProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
