import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Upload, Users, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';

interface QuickAction {
  icon: typeof Plus;
  label: string;
  onClick: () => void;
  color: string;
}

interface FloatingActionMenuProps {
  actions?: QuickAction[];
  className?: string;
}

export function FloatingActionMenu({ actions, className }: FloatingActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultActions: QuickAction[] = actions || [
    {
      icon: FileText,
      label: 'New Case',
      onClick: () => console.log('New Case'),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Upload,
      label: 'Upload Evidence',
      onClick: () => console.log('Upload Evidence'),
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Users,
      label: 'Add Subject',
      onClick: () => console.log('Add Subject'),
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Shield,
      label: 'Security Alert',
      onClick: () => console.log('Security Alert'),
      color: 'from-red-500 to-orange-500',
    },
  ];

  return (
    <div className={cn('fixed bottom-8 right-8 z-50', className)}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute bottom-20 right-0 space-y-3"
          >
            {defaultActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, x: 50, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: 50, y: 20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    action.onClick();
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-md',
                    'bg-gradient-to-r text-white font-medium',
                    'hover:shadow-xl transition-all group',
                    action.color
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm whitespace-nowrap">{action.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        role="button"
        tabIndex={0}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setIsOpen(false);
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen((v) => !v);
          }
        }}
        onBlur={(e) => {
          const related = e.relatedTarget as HTMLElement | null;
          if (!related || !e.currentTarget.contains(related)) {
            setIsOpen(false);
          }
        }}
        className={cn(
          'w-14 h-14 rounded-full shadow-2xl backdrop-blur-md',
          'flex items-center justify-center transition-all',
          isOpen
            ? 'bg-slate-800 dark:bg-slate-700 rotate-45'
            : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-blue-500/50'
        )}
        aria-label="Quick actions"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Plus className="w-7 h-7 text-white" />
      </motion.button>
    </div>
  );
}
