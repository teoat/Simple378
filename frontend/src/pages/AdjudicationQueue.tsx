import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertList } from '../components/adjudication/AlertList';
import { AlertCard } from '../components/adjudication/AlertCard';
import { useTheme } from '../hooks/useTheme';

// Mock data - replace with API call
const MOCK_ALERTS = [
  {
    id: 'alert_001',
    subject_name: 'John Doe Corp',
    risk_score: 85,
    triggered_rules: ['Velocity Mismatch', 'Shell Company'],
    created_at: '2024-03-12T10:30:00Z',
    status: 'pending' as const
  },
  {
    id: 'alert_002',
    subject_name: 'Acme Logistics',
    risk_score: 65,
    triggered_rules: ['Round Amount'],
    created_at: '2024-03-12T11:15:00Z',
    status: 'pending' as const
  },
  {
    id: 'alert_003',
    subject_name: 'Global Trade Ltd',
    risk_score: 45,
    triggered_rules: ['New Beneficiary'],
    created_at: '2024-03-12T09:00:00Z',
    status: 'flagged' as const
  }
];

export function AdjudicationQueue() {
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_ALERTS[0].id);
  const { isDark } = useTheme();

  const selectedAlert = MOCK_ALERTS.find(a => a.id === selectedId) || null;

  const handleDecision = (decision: 'approve' | 'reject' | 'escalate', confidence: string, comment?: string) => {
    console.log('Decision:', { decision, confidence, comment, alertId: selectedId });
    // TODO: Implement API call
    // On success, move to next alert
    const currentIndex = MOCK_ALERTS.findIndex(a => a.id === selectedId);
    if (currentIndex < MOCK_ALERTS.length - 1) {
      setSelectedId(MOCK_ALERTS[currentIndex + 1].id);
    } else {
      setSelectedId(null);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] p-6 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="grid grid-cols-12 gap-6 h-full">
        {/* Left Sidebar: Queue */}
        <div className="col-span-3 flex flex-col h-full">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Queue</h2>
            <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-1 rounded text-xs font-medium">
              {MOCK_ALERTS.length} Pending
            </span>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <AlertList 
              alerts={MOCK_ALERTS} 
              selectedId={selectedId} 
              onSelect={setSelectedId} 
            />
          </div>
        </div>

        {/* Main Content: Alert Details */}
        <div className="col-span-9 h-full">
          <AlertCard 
            alert={selectedAlert} 
            onDecision={handleDecision} 
          />
        </div>
      </div>
    </div>
  );
}
