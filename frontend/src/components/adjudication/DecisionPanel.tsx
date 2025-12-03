import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Send } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHotkeys } from 'react-hotkeys-hook';

interface DecisionPanelProps {
  onDecision: (decision: 'approve' | 'reject' | 'escalate', confidence: string, comment?: string) => void;
  disabled?: boolean;
}

export function DecisionPanel({ onDecision, disabled }: DecisionPanelProps) {
  const [selectedDecision, setSelectedDecision] = useState<'approve' | 'reject' | 'escalate' | null>(null);
  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high'>('medium');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  // Keyboard shortcuts
  useHotkeys('a', () => !disabled && handleDecisionClick('approve'), { enabled: !selectedDecision });
  useHotkeys('r', () => !disabled && handleDecisionClick('reject'), { enabled: !selectedDecision });
  useHotkeys('e', () => !disabled && handleDecisionClick('escalate'), { enabled: !selectedDecision });
  useHotkeys('esc', () => {
    if (selectedDecision) {
      setSelectedDecision(null);
      setComment('');
      setError('');
    }
  }, { enableOnFormTags: true });

  const handleDecisionClick = (decision: 'approve' | 'reject' | 'escalate') => {
    setSelectedDecision(decision);
    setError('');
    // Focus comment area if needed?
  };

  const handleSubmit = () => {
    if (!selectedDecision) return;

    if ((selectedDecision === 'reject' || selectedDecision === 'escalate') && !comment.trim()) {
      setError('Comment is required for this decision');
      return;
    }

    onDecision(selectedDecision, confidence, comment);
    // Reset state after submission (parent should handle loading state)
    setSelectedDecision(null);
    setComment('');
    setConfidence('medium');
  };

  const getDecisionColor = (type: string) => {
    switch (type) {
      case 'approve': return 'bg-green-500';
      case 'reject': return 'bg-red-500';
      case 'escalate': return 'bg-orange-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-4">
      {!selectedDecision ? (
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => handleDecisionClick('approve')}
            disabled={disabled}
            className="group relative overflow-hidden rounded-xl border border-green-500/30 bg-green-500/10 p-4 hover:bg-green-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-400 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-green-100">Approve</span>
              <kbd className="absolute top-2 right-2 text-[10px] font-mono text-green-500/50 border border-green-500/30 rounded px-1">A</kbd>
            </div>
          </button>

          <button
            onClick={() => handleDecisionClick('reject')}
            disabled={disabled}
            className="group relative overflow-hidden rounded-xl border border-red-500/30 bg-red-500/10 p-4 hover:bg-red-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col items-center gap-2">
              <XCircle className="h-6 w-6 text-red-400 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-red-100">Reject</span>
              <kbd className="absolute top-2 right-2 text-[10px] font-mono text-red-500/50 border border-red-500/30 rounded px-1">R</kbd>
            </div>
          </button>

          <button
            onClick={() => handleDecisionClick('escalate')}
            disabled={disabled}
            className="group relative overflow-hidden rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 hover:bg-orange-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-orange-400 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-orange-100">Escalate</span>
              <kbd className="absolute top-2 right-2 text-[10px] font-mono text-orange-500/50 border border-orange-500/30 rounded px-1">E</kbd>
            </div>
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              Confirm {selectedDecision.charAt(0).toUpperCase() + selectedDecision.slice(1)}
              <span className={cn("h-2 w-2 rounded-full", getDecisionColor(selectedDecision))} />
            </h3>
            <button 
              onClick={() => setSelectedDecision(null)}
              className="text-sm text-slate-400 hover:text-white"
            >
              Cancel (Esc)
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confidence Level</label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setConfidence(level)}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border",
                      confidence === level 
                        ? "bg-purple-500/20 border-purple-500 text-purple-100 shadow-[0_0_10px_rgba(168,85,247,0.2)]" 
                        : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800"
                    )}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Comment {selectedDecision !== 'approve' && <span className="text-red-400">*</span>}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={selectedDecision === 'approve' ? "Optional comment..." : "Reason for decision..."}
                className="w-full h-24 rounded-lg bg-black/20 border border-white/10 p-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 resize-none"
                autoFocus
              />
              {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            </div>

            <button
              onClick={handleSubmit}
              className={cn(
                "w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all",
                selectedDecision === 'approve' ? "bg-green-600 hover:bg-green-500" :
                selectedDecision === 'reject' ? "bg-red-600 hover:bg-red-500" :
                "bg-orange-600 hover:bg-orange-500"
              )}
            >
              <Send className="h-4 w-4" />
              Submit Decision
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
