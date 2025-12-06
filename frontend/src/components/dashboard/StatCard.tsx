import { type LucideIcon } from 'lucide-react';
import { motion, useSpring, useTransform, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  index?: number;
}

export function StatCard({ title, value, icon: Icon, trend, index = 0 }: StatCardProps) {
  // Animation for value updates (if it's a number)
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^0-9.-]+/g, '')) || 0;
  const springValue = useSpring(0, { stiffness: 50, damping: 20 });
  const displayValue = useTransform(springValue, (current) => {
    if (typeof value === 'string' && !value.match(/^\d/)) return value; // Return original string if not numeric
    return Math.round(current).toLocaleString() + (typeof value === 'string' && value.includes('%') ? '%' : '');
  });

  const pulseControls = useAnimation();

  useEffect(() => {
    springValue.set(numericValue);
    
    // Trigger pulse animation when value changes
    if (numericValue !== 0) {
      pulseControls.start({
        scale: [1, 1.05, 1],
        boxShadow: [
          '0 25px 50px -12px rgba(139, 92, 246, 0.1)',
          '0 25px 50px -12px rgba(139, 92, 246, 0.3)',
          '0 25px 50px -12px rgba(139, 92, 246, 0.1)',
        ],
        transition: { duration: 0.6, ease: 'easeInOut' }
      });
    }
  }, [numericValue, springValue, pulseControls]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={pulseControls}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl shadow-purple-500/10 backdrop-blur-xl transition-all duration-300 hover:border-purple-400/50 hover:shadow-purple-500/20 dark:border-slate-700/30 dark:bg-slate-900/20 dark:shadow-cyan-500/10"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <dt className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </dt>
          <dd className="mt-2 flex items-baseline">
            <motion.div className="text-3xl font-bold text-slate-900 dark:text-white">
              {typeof value === 'number' || (typeof value === 'string' && value.match(/^\d/)) ? (
                <motion.span>{displayValue}</motion.span>
              ) : (
                value
              )}
            </motion.div>
            {trend && (
              <div
                className={`ml-2 inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-medium ${
                  trend.isPositive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}%
              </div>
            )}
          </dd>
        </div>
        <div className="rounded-lg border border-purple-400/30 bg-purple-500/20 p-3 shadow-lg shadow-purple-500/20 backdrop-blur-sm dark:border-cyan-400/30 dark:bg-cyan-500/20 dark:shadow-cyan-500/20">
          <Icon className="h-6 w-6 text-purple-600 dark:text-cyan-400" aria-hidden="true" />
        </div>
      </div>
      
      {/* Decorative background glow */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl dark:bg-cyan-500/10" />
    </motion.div>
  );
}
