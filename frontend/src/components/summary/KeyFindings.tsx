import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, DollarSign, CheckCircle2, AlertOctagon, Lightbulb, Edit2, Check, X } from 'lucide-react';
import clsx from 'clsx';
import { Button } from '../ui/Button';

export interface Finding {
  id: string;
  type: 'pattern' | 'amount' | 'confirmation' | 'false_positive' | 'recommendation';
  severity: 'high' | 'medium' | 'low';
  description: string;
  evidence?: string[];
}

interface KeyFindingsProps {
  findings: Finding[];
  caseId: string;
  editable?: boolean;
}

const severityColors = {
  high: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800',
  medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-800',
  low: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-800',
};

const typeIcons = {
  pattern: AlertOctagon,
  amount: DollarSign,
  confirmation: CheckCircle2,
  false_positive: X,
  recommendation: Lightbulb,
};

export const KeyFindings: FC<KeyFindingsProps> = ({ findings: initialFindings, editable = false }) => {
  const [findings, setFindings] = useState(initialFindings);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (finding: Finding) => {
    setEditingId(finding.id);
    setEditValue(finding.description);
  };

  const handleSave = () => {
    if (editingId) {
      setFindings(prev =>
        prev.map(f => (f.id === editingId ? { ...f, description: editValue } : f))
      );
      setEditingId(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
            Key Findings
          </h3>
        </div>
        <div className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
          AI Generated
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
        {findings.map((finding, idx) => {
          const Icon = typeIcons[finding.type] || Shield;
          const isEditing = editingId === finding.id;

          return (
            <motion.div
              key={finding.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div
                  className={clsx(
                    'mt-1 p-1.5 rounded-md border text-xs',
                    severityColors[finding.severity]
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full text-sm rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-800 p-2 focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        aria-label="Edit Finding Description"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancel}
                          className="h-7 text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          className="h-7 text-xs bg-blue-600 text-white hover:bg-blue-700"
                        >
                          <Check className="w-3 h-3 mr-1" /> Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start group-hover:bg-opacity-100">
                      <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
                        {finding.description}
                      </p>
                      {editable && (
                        <button
                          onClick={() => handleEdit(finding)}
                          className="ml-2 p-1 text-slate-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                  
                  {finding.evidence && finding.evidence.length > 0 && !isEditing && (
                    <div className="mt-2 flex flex-wrap gap-2">
                       {finding.evidence.map((ev, i) => (
                         <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs rounded border border-slate-200 dark:border-slate-700 font-mono">
                           {ev}
                         </span>
                       ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
