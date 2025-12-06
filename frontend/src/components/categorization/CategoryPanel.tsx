import { motion } from 'framer-motion';
import { Tag, TrendingUp, AlertTriangle } from 'lucide-react';

interface CategoryStats {
  name: string;
  count: number;
  percentage: number;
  trend: number;
  flagged: number;
}

interface CategoryPanelProps {
  categories: string[];
  stats?: CategoryStats[];
  onCategorySelect?: (category: string) => void;
  selectedCategory?: string | null;
}

export function CategoryPanel({
  categories,
  stats,
  onCategorySelect,
  selectedCategory
}: CategoryPanelProps) {
  const mockStats: CategoryStats[] = categories.map(category => ({
    name: category,
    count: Math.floor(Math.random() * 50) + 10,
    percentage: Math.floor(Math.random() * 20) + 5,
    trend: Math.floor(Math.random() * 20) - 10,
    flagged: Math.floor(Math.random() * 5),
  }));

  const displayStats = stats || mockStats;

  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
          <Tag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Category Overview
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Transaction distribution by category
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {displayStats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
              selectedCategory === stat.name
                ? 'border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
            onClick={() => onCategorySelect?.(stat.name)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-900 dark:text-white">
                {stat.name}
              </span>
              <div className="flex items-center gap-2">
                {stat.flagged > 0 && (
                  <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                    <AlertTriangle className="h-3 w-3" />
                    {stat.flagged}
                  </div>
                )}
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {stat.count} transactions
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.percentage}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  {stat.percentage}%
                </span>
                <div className={`flex items-center gap-1 ${
                  stat.trend > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  <TrendingUp className={`h-3 w-3 ${stat.trend < 0 ? 'rotate-180' : ''}`} />
                  <span>{Math.abs(stat.trend)}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {displayStats.length === 0 && (
        <div className="text-center py-8">
          <Tag className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">
            No categories available yet
          </p>
        </div>
      )}
    </div>
  );
}