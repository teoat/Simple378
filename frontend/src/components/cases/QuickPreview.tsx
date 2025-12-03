import { motion, AnimatePresence } from 'framer-motion';
import { RiskBar } from './RiskBar';
import { StatusBadge } from './StatusBadge';
import { Clock, Activity } from 'lucide-react';

interface QuickPreviewProps {
  isOpen: boolean;
  data: {
    id: string;
    subject_name: string;
    risk_score: number;
    status: string;
    updated_at?: string;
    description?: string;
  };
  position: { x: number; y: number };
}

export function QuickPreview({ isOpen, data, position }: QuickPreviewProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          style={{ 
            position: 'fixed', 
            left: position.x + 20, 
            top: position.y - 20,
            zIndex: 50 
          }}
          className="w-80 p-4 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-2xl shadow-blue-500/10 pointer-events-none"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">{data.subject_name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">ID: {data.id.slice(0, 8)}</p>
            </div>
            <StatusBadge status={data.status} />
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1 text-slate-500 dark:text-slate-400">
                <span>Risk Score</span>
                <span className="font-medium">{data.risk_score}/100</span>
              </div>
              <RiskBar score={data.risk_score} showLabel={false} className="h-1.5" />
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700/50 space-y-2">
              <div className="flex items-center text-xs text-slate-600 dark:text-slate-300">
                <Activity className="w-3.5 h-3.5 mr-2 text-blue-500" />
                <span>Recent suspicious activity detected</span>
              </div>
              {data.updated_at && (
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 mr-2" />
                  <span>Updated {new Date(data.updated_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
