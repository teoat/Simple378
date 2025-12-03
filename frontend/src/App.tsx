import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './context/AuthContext';
import { AuthGuard } from './components/auth/AuthGuard';
import { Login } from './pages/Login';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { CaseList } from './pages/CaseList';
import { CaseDetail } from './pages/CaseDetail';
import { Reconciliation } from './pages/Reconciliation';
import { Forensics } from './pages/Forensics';
import { Settings } from './pages/Settings';
import { AIAssistant } from './components/ai/AIAssistant';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <AuthGuard>
                  <AppShell>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/cases" element={<CaseList />} />
                      <Route path="/cases/:id" element={<CaseDetail />} />
                      <Route path="/reconciliation" element={<Reconciliation />} />
                      <Route path="/forensics" element={<Forensics />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </AppShell>
                </AuthGuard>
              }
            />
          </Routes>
          <AIAssistant />
          <Toaster position="top-right" />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
