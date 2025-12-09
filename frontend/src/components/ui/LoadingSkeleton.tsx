import { FC } from 'react';
import { cn } from '../../lib/utils';

interface LoadingSkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

/**
 * LoadingSkeleton component for showing loading states
 * 
 * Note: Uses the 'animate-ui-shimmer' CSS class defined in src/index.css
 */
export const LoadingSkeleton: FC<LoadingSkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  className,
  count = 1,
}) => {
  const baseClasses = [
    'animate-ui-shimmer',
    'bg-gradient-to-r',
    'from-slate-200 via-slate-300 to-slate-200',
    'dark:from-slate-700 dark:via-slate-600 dark:to-slate-700'
  ].join(' ');
  
  const variants = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
    card: 'rounded-xl h-32',
  };

  const style = {
    width: width || (variant === 'text' ? '100%' : variant === 'circular' ? '48px' : '100%'),
    height: height || (variant === 'circular' ? '48px' : variant === 'card' ? '128px' : '16px'),
  };

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={cn(baseClasses, variants[variant], className)}
            style={style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, variants[variant], className)}
      style={style}
    />
  );
};
