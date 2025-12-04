import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RiskBar } from './RiskBar';
import { StatusBadge } from './StatusBadge';
import { Clock, Activity, Eye, Edit, AlertTriangle } from 'lucide-react';

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
          className="w-80 p-5 rounded-xl backdrop-blur-xl bg-white/15 dark:bg-slate-900/25 border border-white/30 dark:border-slate-700/40 shadow-2xl shadow-blue-500/20 pointer-events-auto"
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

            <div className="pt-3 border-t border-white/10 dark:border-slate-700/50 space-y-2">
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

            <div className="pt-3 border-t border-white/10 dark:border-slate-700/50 flex gap-2">
              <Link
                to={`/cases/${data.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg backdrop-blur-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 border border-blue-400/30 transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                View
              </Link>
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg backdrop-blur-sm bg-slate-500/20 hover:bg-slate-500/30 text-slate-600 dark:text-slate-400 border border-slate-400/30 transition-all">
                <Edit className="w-3.5 h-3.5" />
                Edit
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg backdrop-blur-sm bg-orange-500/20 hover:bg-orange-500/30 text-orange-600 dark:text-orange-400 border border-orange-400/30 transition-all">
                <AlertTriangle className="w-3.5 h-3.5" />
                Escalate
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
