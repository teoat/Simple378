import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHotkeys } from 'react-hotkeys-hook';

interface Alert {
  id: string;
  subject_name: string;
  risk_score: number;
  triggered_rules: string[];
  created_at: string;
  status: 'pending' | 'flagged' | 'resolved';
}

interface AlertListProps {
  alerts: Alert[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function AlertList({ alerts, selectedId, onSelect }: AlertListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToItem = (id: string) => {
    const element = document.getElementById(`alert-item-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Keyboard navigation
  useHotkeys('up', () => {
    if (!selectedId && alerts.length > 0) {
      onSelect(alerts[0].id);
      return;
    }
    const currentIndex = alerts.findIndex(a => a.id === selectedId);
    if (currentIndex > 0) {
      onSelect(alerts[currentIndex - 1].id);
      scrollToItem(alerts[currentIndex - 1].id);
    }
  });

  useHotkeys('down', () => {
    if (!selectedId && alerts.length > 0) {
      onSelect(alerts[0].id);
      return;
    }
    const currentIndex = alerts.findIndex(a => a.id === selectedId);
    if (currentIndex < alerts.length - 1) {
      onSelect(alerts[currentIndex + 1].id);
      scrollToItem(alerts[currentIndex + 1].id);
    }
  });

  return (
    <div className="space-y-2">
      <div id="queue-status" className="sr-only" aria-live="polite" aria-atomic="true">
        {selectedId 
          ? `Alert ${alerts.findIndex(a => a.id === selectedId) + 1} of ${alerts.length} selected`
          : `${alerts.length} alerts in queue`}
      </div>

      <div 
        ref={listRef} 
        className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)] pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        role="feed"
        aria-label="Alert Queue"
        aria-busy="false"
        aria-describedby="queue-status"
      >
        <AnimatePresence initial={false}>
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              id={`alert-item-${alert.id}`}
              layoutId={alert.id}
              onClick={() => onSelect(alert.id)}
              className={cn(
                "cursor-pointer rounded-xl p-4 transition-all duration-200 border-l-4 relative overflow-hidden group",
                "backdrop-blur-md bg-white/5 dark:bg-slate-900/20 hover:bg-white/10 dark:hover:bg-slate-800/30",
                selectedId === alert.id 
                  ? "bg-blue-500/20 dark:bg-blue-500/20 border-l-blue-500 shadow-2xl shadow-blue-500/30 ring-2 ring-blue-500/50 scale-[1.02]" 
                  : "border-l-transparent border-t border-r border-b border-white/5",
              alert.risk_score > 80 && selectedId !== alert.id ? "border-l-red-500/50" :
              alert.risk_score > 60 && selectedId !== alert.id ? "border-l-orange-500/50" :
              alert.risk_score <= 60 && selectedId !== alert.id ? "border-l-yellow-500/50" : ""
            )}
            initial={{ opacity: 0, x: -20 }}
            animate={selectedId === alert.id ? {
              opacity: 1,
              x: 0,
              scale: [1, 1.02, 1.02],
              boxShadow: [
                "0 0 0 0 rgba(59, 130, 246, 0)",
                "0 0 20px 5px rgba(59, 130, 246, 0.3)",
                "0 0 20px 5px rgba(59, 130, 246, 0.3)"
              ]
            } : { opacity: 1, x: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3 }}
            role="article"
            aria-label={`Alert from ${alert.subject_name}, risk score ${alert.risk_score}, ${alert.triggered_rules.length} triggered rules`}
            aria-selected={selectedId === alert.id}
            aria-posinset={index + 1}
            aria-setsize={alerts.length}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(alert.id);
              }
            }}
          >
            {/* Selection Indicator */}
            {selectedId === alert.id && (
              <motion.div 
                layoutId="selection-glow"
                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/10 to-transparent pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] text-slate-500 font-mono tracking-wider">#{alert.id.slice(0, 8)}</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <h3 className={cn(
                "font-semibold text-sm mb-2 transition-colors",
                selectedId === alert.id ? "text-white" : "text-slate-200 group-hover:text-white"
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
              </div>

              <div className="flex flex-wrap gap-1.5">
                {alert.triggered_rules.slice(0, 2).map((rule, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 bg-white/5 dark:bg-slate-800/50 rounded text-slate-400 border border-white/5">
                    {rule}
                  </span>
                ))}
                {alert.triggered_rules.length > 2 && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-white/5 dark:bg-slate-800/50 rounded text-slate-400 border border-white/5">
                    +{alert.triggered_rules.length - 2}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
