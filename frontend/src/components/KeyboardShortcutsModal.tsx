import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, MousePointerClick, ArrowRight, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import { cn } from '../lib/utils';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    keys: string[];
    description: string;
    icon?: React.ReactNode;
  }>;
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Global Shortcuts',
    shortcuts: [
      { keys: ['?'], description: 'Show keyboard shortcuts', icon: <Keyboard className="w-4 h-4" /> },
      { keys: ['Esc'], description: 'Close modals/dialogs' },
      { keys: ['Ctrl', 'K'], description: 'Open command palette (if available)' },
      { keys: ['Ctrl', '/'], description: 'Toggle sidebar' },
    ],
  },
  {
    title: 'Adjudication Queue',
    shortcuts: [
      { keys: ['J'], description: 'Next alert', icon: <ArrowDown className="w-4 h-4" /> },
      { keys: ['K'], description: 'Previous alert', icon: <ArrowUp className="w-4 h-4" /> },
      { keys: ['1'], description: 'Approve current alert' },
      { keys: ['2'], description: 'Reject current alert' },
      { keys: ['3'], description: 'Escalate current alert' },
      { keys: ['Tab'], description: 'Switch between context tabs' },
      { keys: ['Enter'], description: 'Submit decision' },
    ],
  },
  {
    title: 'Case Management',
    shortcuts: [
      { keys: ['Ctrl', 'F'], description: 'Focus search input' },
      { keys: ['Ctrl', 'N'], description: 'Create new case' },
      { keys: ['Arrow Right'], description: 'Next page', icon: <ArrowRight className="w-4 h-4" /> },
      { keys: ['Arrow Left'], description: 'Previous page', icon: <ArrowLeft className="w-4 h-4" /> },
      { keys: ['Enter'], description: 'Open selected case' },
    ],
  },
  {
    title: 'Forensics & Ingestion',
    shortcuts: [
      { keys: ['Ctrl', 'U'], description: 'Open file upload dialog' },
      { keys: ['Ctrl', 'I'], description: 'Open CSV import wizard' },
      { keys: ['Esc'], description: 'Cancel upload/import' },
    ],
  },
  {
    title: 'Reconciliation',
    shortcuts: [
      { keys: ['Ctrl', 'A'], description: 'Auto-reconcile all matches' },
      { keys: ['Space'], description: 'Select transaction for matching' },
      { keys: ['Enter'], description: 'Confirm match' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['G', 'D'], description: 'Go to Dashboard' },
      { keys: ['G', 'A'], description: 'Go to Adjudication Queue' },
      { keys: ['G', 'C'], description: 'Go to Case Management' },
      { keys: ['G', 'F'], description: 'Go to Forensics' },
      { keys: ['G', 'R'], description: 'Go to Reconciliation' },
    ],
  },
];

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="px-2 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm backdrop-blur-sm">
      {children}
    </kbd>
  );
}

function KeyCombo({ keys }: { keys: string[] }) {
  return (
    <div className="flex items-center gap-1">
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          <Key>{key}</Key>
          {index < keys.length - 1 && (
            <span className="text-slate-400 dark:text-slate-500 mx-1">+</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  // Close on Escape key
  useHotkeys('escape', () => {
    if (isOpen) onClose();
  }, { enabled: isOpen });

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-4xl max-h-[90vh] backdrop-blur-xl bg-white/10 dark:bg-slate-900/40 rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-2xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 dark:border-slate-700/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Keyboard className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Keyboard Shortcuts
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Press <Key>?</Key> to open this dialog
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-slate-700/30 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {shortcutGroups.map((group, groupIndex) => (
                  <motion.div
                    key={group.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIndex * 0.05 }}
                  >
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      {group.title}
                    </h3>
                    <div className="space-y-3">
                      {group.shortcuts.map((shortcut, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg backdrop-blur-sm bg-white/5 dark:bg-slate-800/20 border border-white/10 dark:border-slate-700/20 hover:bg-white/10 dark:hover:bg-slate-700/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {shortcut.icon && (
                              <div className="text-slate-400 dark:text-slate-500">
                                {shortcut.icon}
                              </div>
                            )}
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                              {shortcut.description}
                            </span>
                          </div>
                          <KeyCombo keys={shortcut.keys} />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 dark:border-slate-700/20 bg-black/5 backdrop-blur-sm">
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <MousePointerClick className="w-4 h-4" />
                    <span>Click outside or press Esc to close</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>Platform: {navigator.platform.includes('Mac') ? 'macOS' : 'Windows/Linux'}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

