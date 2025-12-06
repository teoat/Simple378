import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertHeader } from './AlertHeader';
import { DecisionPanel } from './DecisionPanel';
import { ContextTabs } from './ContextTabs';

interface Alert {
  id: string;
  subject_id: string;
  subject_name: string;
  risk_score: number;
  triggered_rules: string[];
  created_at: string;
  status: 'pending' | 'flagged' | 'resolved';
}

interface AlertCardProps {
  alert: Alert | null;
  onDecision: (decision: 'approve' | 'reject' | 'escalate', confidence: string, comment?: string) => void;
  disabled?: boolean;
}

export function AlertCard({ alert, onDecision, disabled }: AlertCardProps) {
  const [activeTab, setActiveTab] = useState('evidence');

  if (!alert) {
    return (
      <div 
        className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm"
        role="status"
        aria-label="No alert selected"
      >
        <div className="text-center">
          <p className="text-slate-500 font-medium">No alert selected</p>
          <p className="text-slate-400 text-sm mt-1">Select an item from the queue to start reviewing</p>
        </div>
      </div>
    );
  }

  // Enhanced ARIA description
  const ariaDescription = `Alert from ${alert.subject_name}, risk score ${alert.risk_score}, triggered ${alert.triggered_rules.length} rules, status ${alert.status}, created ${new Date(alert.created_at).toLocaleDateString()}`;

  return (
    <motion.div
      key={alert.id}
      initial={{ opacity: 0, scale: 0.98, x: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.98, x: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col h-full rounded-2xl border border-white/20 dark:border-slate-700/30 bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl shadow-purple-500/5 overflow-hidden"
      role="article"
      aria-label={`Alert ${alert.id}`}
      aria-describedby={`alert-desc-${alert.id}`}
    >
      {/* Screen reader description */}
      <div id={`alert-desc-${alert.id}`} className="sr-only">
        {ariaDescription}
      </div>
      <AlertHeader alert={alert} />
      
      <div className="flex-1 overflow-hidden flex flex-col relative">
        <ContextTabs 
          alertId={alert.id}
          subjectId={alert.subject_id}
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      </div>

      <div className="p-6 border-t border-white/10 dark:border-slate-700/20 bg-black/20 backdrop-blur-md z-10">
        <DecisionPanel onDecision={onDecision} disabled={disabled} />
      </div>
    </motion.div>
  );
}
