import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GradientCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: 'blue' | 'purple' | 'green' | 'orange' | 'pink';
  glow?: boolean;
}

const gradients = {
  blue: 'from-blue-500/10 via-cyan-500/10 to-blue-500/10',
  purple: 'from-purple-500/10 via-pink-500/10 to-purple-500/10',
  green: 'from-green-500/10 via-emerald-500/10 to-green-500/10',
  orange: 'from-orange-500/10 via-red-500/10 to-orange-500/10',
  pink: 'from-pink-500/10 via-purple-500/10 to-pink-500/10',
};

const glowColors = {
  blue: 'shadow-blue-500/20',
  purple: 'shadow-purple-500/20',
  green: 'shadow-green-500/20',
  orange: 'shadow-orange-500/20',
  pink: 'shadow-pink-500/20',
};

const cornerGlowColors = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
};

export function GradientCard({ 
  children, 
  className, 
  gradient = 'blue',
  glow = true 
}: GradientCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border backdrop-blur-xl',
        'bg-gradient-to-br',
        gradients[gradient],
        'border-white/20 dark:border-slate-700/30',
        'shadow-2xl',
        glow && glowColors[gradient],
        className
      )}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent animate-shimmer" />
      
      {/* Decorative corner glow */}
      <div className={cn(
        'absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-30',
        cornerGlowColors[gradient]
      )} />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
