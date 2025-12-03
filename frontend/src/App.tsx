import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';


import { CaseList } from './pages/CaseList';
import { CaseDetail } from './pages/CaseDetail';
import { Reconciliation } from './pages/Reconciliation';
import { Forensics } from './pages/Forensics';
import { Settings } from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cases" element={<CaseList />} />
          <Route path="/cases/:id" element={<CaseDetail />} />
          <Route path="/reconciliation" element={<Reconciliation />} />
          <Route path="/forensics" element={<Forensics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* Add other routes here as we build them */}
          <Route path="*" element={<div className="p-4">Page not found</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
