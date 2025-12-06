import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface RiskBarProps {
  score: number;
  className?: string;
  showLabel?: boolean;
}

export function RiskBar({ score, className, showLabel = true }: RiskBarProps) {
  const getColor = (s: number) => {
    if (s >= 80) return 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/50';
    if (s >= 60) return 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-orange-500/50';
    if (s >= 30) return 'bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-yellow-500/50';
    return 'bg-gradient-to-r from-green-400 to-green-500 shadow-green-500/50';
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden backdrop-blur-sm">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full shadow-lg", getColor(score))}
        />
      </div>
      {showLabel && (
        <span className={cn(
          "text-sm font-bold w-8 text-right",
          score >= 80 ? "text-red-600 dark:text-red-400" :
          score >= 60 ? "text-orange-600 dark:text-orange-400" :
          score >= 30 ? "text-yellow-600 dark:text-yellow-400" :
          "text-green-600 dark:text-green-400"
        )}>
          {score}
        </span>
      )}
    </div>
  );
}
