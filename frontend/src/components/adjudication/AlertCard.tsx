import { motion } from 'framer-motion';
import { AlertCircle, Clock, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Alert } from '../../types/api';

interface AlertCardProps {
  alert: Alert | null;
  onDecision?: (decision: 'approve' | 'reject' | 'escalate', confidence: string, comment?: string) => void;
  disabled?: boolean;
  isSelected?: boolean;
  isBulkSelected?: boolean;
  onSelect?: (id: string) => void;
  onToggleBulkSelect?: (id: string) => void;
}

const statusStyles = {
  'new': 'border-l-blue-500',
  'under review': 'border-l-yellow-500',
  'resolved': 'border-l-green-500',
};

export function AlertCard({ alert, onDecision, disabled, isSelected, isBulkSelected, onSelect, onToggleBulkSelect }: AlertCardProps) {
  const statusClass = statusStyles[alert.status] || 'border-l-gray-500';

  return (
    <motion.div
      layoutId={alert.id}
      onClick={() => onSelect(alert.id)}
      className={cn(
        "cursor-pointer rounded-xl p-4 transition-all duration-200 border-l-4 relative overflow-hidden group",
        "backdrop-blur-md bg-white/5 dark:bg-slate-900/20 hover:bg-white/10 dark:hover:bg-slate-800/30",
        isSelected
          ? "bg-blue-500/20 dark:bg-blue-500/20 border-l-blue-500 shadow-2xl shadow-blue-500/30 ring-2 ring-blue-500/50 scale-[1.02]"
          : "border-t border-r border-b border-white/5",
        !isSelected && statusClass
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3 }}
      role="listitem"
      aria-label={`Alert from ${alert.subject_name}, risk score ${alert.risk_score}`}
      aria-selected={isSelected}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center h-full pt-1" onClick={(e) => { e.stopPropagation(); onToggleBulkSelect(alert.id); }}>
          <div className={cn("w-5 h-5 rounded border-2 flex items-center justify-center transition-all", isBulkSelected ? "bg-blue-500 border-blue-400" : "border-gray-500 group-hover:border-gray-400")}>
            {isBulkSelected && <Check className="w-4 h-4 text-white" />}
          </div>
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] text-slate-500 font-mono tracking-wider">#{alert.id.slice(0, 8)}</span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <h3 className={cn(
            "font-semibold text-sm mb-2 transition-colors",
            isSelected ? "text-white" : "text-slate-200 group-hover:text-white"
          )}>
            {alert.subject_name}
          </h3>

          <div className="flex items-center gap-2 mb-3">
            <div className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
              alert.risk_score > 80 ? "bg-red-500/20 text-red-400 border border-red-500/20" :
                alert.risk_score > 60 ? "bg-orange-500/20 text-orange-400 border border-orange-500/20" :
                  "bg-yellow-500/20 text-yellow-400 border border-yellow-500/20"
            )}>
              <AlertCircle className="w-3 h-3" />
              Risk: {alert.risk_score}
            </div>
            <span className="text-[10px] px-1.5 py-0.5 bg-gray-500/20 text-gray-300 rounded capitalize">
              {alert.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {alert.triggered_rules.slice(0, 3).map((rule, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 bg-white/5 dark:bg-slate-800/50 rounded text-slate-400 border border-white/5">
                {rule}
              </span>
            ))}
            {alert.triggered_rules.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 bg-white/5 dark:bg-slate-800/50 rounded text-slate-400 border border-white/5">
                +{alert.triggered_rules.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}