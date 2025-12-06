import { FC } from 'react';
import { motion } from 'framer-motion';
import { PieChart, BarChart, TrendingUp, Activity } from 'lucide-react';
import clsx from 'clsx';

interface ChartEmbedProps {
  chartType: 'risk_distribution' | 'timeline' | 'network' | 'cashflow';
  title: string;
  className?: string;
}

export const ChartEmbed: FC<ChartEmbedProps> = ({ chartType, title, className }) => {
  // Placeholder visualization logic
  const renderPlaceholder = () => {
    switch (chartType) {
      case 'risk_distribution':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full border-[12px] border-emerald-500/20" />
              <div className="absolute inset-0 rounded-full border-[12px] border-red-500 border-l-transparent border-b-transparent rotate-45" />
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold dark:text-white">Risk</span>
              </div>
            </div>
          </div>
        );
      case 'timeline':
        return (
          <div className="flex items-end justify-between h-full px-4 pb-2 gap-2">
            {[40, 60, 45, 70, 85, 55, 65, 80].map((h, i) => (
              <div
                key={i}
                className="w-full bg-blue-500/80 rounded-t-sm"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        );
      case 'network':
        return (
          <div className="relative h-full w-full overflow-hidden">
             {/* Simple node simulation */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20" />
             <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-slate-400" />
             <div className="absolute top-3/4 left-3/4 w-3 h-3 rounded-full bg-slate-400" />
             <div className="absolute top-1/3 left-3/4 w-3 h-3 rounded-full bg-red-400" />
             
             <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-300 dark:stroke-slate-600">
               <line x1="50%" y1="50%" x2="25%" y2="25%" strokeWidth="1" />
               <line x1="50%" y1="50%" x2="75%" y2="75%" strokeWidth="1" />
               <line x1="50%" y1="50%" x2="75%" y2="33%" strokeWidth="1" />
             </svg>
          </div>
        );
      case 'cashflow':
        return (
          <div className="flex flex-col h-full justify-center px-4 gap-3">
             <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[70%]" />
             </div>
             <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                 <div className="h-full bg-red-500 w-[30%]" />
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  const Icon = ({
    risk_distribution: PieChart,
    timeline: TrendingUp,
    network: Activity,
    cashflow: BarChart,
  }[chartType]);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={clsx(
        "bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col",
        className
      )}
    >
      <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
        <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Icon className="w-4 h-4 opacity-70" />
          {title}
        </h4>
      </div>
      <div className="flex-1 min-h-[160px] p-4 bg-slate-50/50 dark:bg-slate-900/20">
        {renderPlaceholder()}
      </div>
    </motion.div>
  );
};
