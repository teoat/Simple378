import { Link } from 'react-router-dom';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface EnhancedMetricCardProps {
  title: string;
  value: number | string;
  delta?: number;
  icon: LucideIcon;
  color: 'blue' | 'red' | 'amber' | 'emerald' | 'purple';
  link: string;
  sparklineData?: number[];
  updatedAgo?: string;
}

const colorClasses = {
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-700',
  },
  red: {
    gradient: 'from-red-500 to-red-600',
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-700',
  },
  amber: {
    gradient: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-700',
  },
  emerald: {
    gradient: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-700',
  },
  purple: {
    gradient: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-700',
  },
};

export function EnhancedMetricCard({
  title,
  value,
  delta,
  icon: Icon,
  color,
  link,
  sparklineData,
  updatedAgo = '2m',
}: EnhancedMetricCardProps) {
  const colors = colorClasses[color];
  const deltaDirection = delta && delta > 0 ? 'positive' : delta && delta < 0 ? 'negative' : 'neutral';

  // Simple sparkline SVG
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length === 0) return null;

    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1;
    const width = 100;
    const height = 32;
    const step = width / (sparklineData.length - 1);

    const points = sparklineData
      .map((value, i) => {
        const x = i * step;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg
        className="w-full h-8 opacity-70"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={colors.text}
        />
      </svg>
    );
  };

  return (
    <Link to={link}>
      <motion.div
        className="metric-card-enhanced group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -4 }}
      >
        {/* Header */}
        <div className="metric-card-header">
          <div className={`metric-card-icon bg-gradient-to-br ${colors.gradient}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h3 className="metric-card-title">{title}</h3>
        </div>

        {/* Value */}
        <div className="metric-card-value">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>

        {/* Sparkline */}
        {sparklineData && (
          <div className="metric-card-sparkline">
            {renderSparkline()}
          </div>
        )}

        {/* Footer */}
        <div className="metric-card-footer">
          <div className={`metric-card-delta ${deltaDirection}`}>
            {delta !== undefined && delta !== 0 && (
              <>
                {delta > 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : delta < 0 ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <Minus className="w-3 h-3" />
                )}
                <span>{Math.abs(delta)} today</span>
              </>
            )}
            {(delta === undefined || delta === 0) && (
              <span className="text-gray-400">No change</span>
            )}
          </div>
          <span className="text-gray-400">
            <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {updatedAgo}
          </span>
        </div>

        {/* Hover Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.div>
    </Link>
  );
}
