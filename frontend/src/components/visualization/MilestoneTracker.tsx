import { motion } from 'framer-motion';
import { Check, Clock, AlertTriangle, ChevronRight } from 'lucide-react';

interface Milestone {
  id: string;
  name: string;
  date: string;
  amount: number;
  status: 'complete' | 'pending' | 'alert' | 'upcoming';
  description?: string;
  phase?: string;
}

interface MilestoneTrackerProps {
  milestones?: Milestone[];
  onMilestoneClick?: (milestone: Milestone) => void;
}

export function MilestoneTracker({ milestones, onMilestoneClick }: MilestoneTrackerProps) {
  // Empty state if no milestones
  if (!milestones || milestones.length === 0) {
    return (
      <div className="py-12 text-center">
        <Clock className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400">No milestones detected</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
          Milestones are automatically detected from high-value transactions
        </p>
      </div>
    );
  }

  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'complete':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'upcoming':
        return <Clock className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'complete':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'pending':
        return 'border-amber-500 bg-amber-50 dark:bg-amber-900/20';
      case 'alert':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'upcoming':
        return 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50';
    }
  };

  const getLineColor = (status: Milestone['status']) => {
    switch (status) {
      case 'complete':
        return 'bg-green-500';
      case 'pending':
        return 'bg-amber-500';
      case 'alert':
        return 'bg-red-500';
      case 'upcoming':
        return 'bg-slate-300 dark:bg-slate-700';
    }
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-200 dark:bg-slate-800" />
      
      <div className="space-y-4">
        {milestones.map((milestone, index) => (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onMilestoneClick?.(milestone)}
            className={`relative flex items-start gap-4 p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md ${getStatusColor(milestone.status)}`}
          >
            {/* Timeline dot */}
            <div className={`absolute left-[-1.75rem] top-6 h-4 w-4 rounded-full border-4 border-white dark:border-slate-950 ${getLineColor(milestone.status)}`} />
            
            {/* Icon */}
            <div className="flex-shrink-0 mt-1">
              {getStatusIcon(milestone.status)}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {milestone.phase && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-slate-200 dark:bg-slate-700 rounded">
                        {milestone.phase}
                      </span>
                    )}
                    <span className="text-xs text-slate-500">
                      {new Date(milestone.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {milestone.name}
                  </h3>
                  {milestone.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {milestone.description}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  {milestone.amount > 0 && (
                    <p className="font-bold text-lg text-slate-900 dark:text-slate-100">
                      ${milestone.amount.toLocaleString()}
                    </p>
                  )}
                  <span className={`text-xs font-medium capitalize ${
                    milestone.status === 'complete' ? 'text-green-600' :
                    milestone.status === 'alert' ? 'text-red-600' :
                    milestone.status === 'pending' ? 'text-amber-600' :
                    'text-slate-500'
                  }`}>
                    {milestone.status}
                  </span>
                </div>
              </div>
            </div>
            
            <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0 self-center" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
