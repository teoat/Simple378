import { cn } from '../../lib/utils';

interface LoadingSkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

export function LoadingSkeleton({ 
  variant = 'rectangular', 
  width, 
  height, 
  className,
  count = 1 
}: LoadingSkeletonProps) {
  const baseClasses = 'bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 animate-shimmer';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'h-32 rounded-xl',
  };

  const skeletonStyle = {
    width: width,
    height: height || (variant === 'circular' ? width : undefined),
  };

  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={cn(baseClasses, variantClasses[variant], className)}
      style={skeletonStyle}
    />
  ));

  return count === 1 ? skeletons[0] : <div className="space-y-3">{skeletons}</div>;
}

export function LoadingCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-start gap-4">
        <LoadingSkeleton variant="circular" width="48px" />
        <div className="flex-1 space-y-3">
          <LoadingSkeleton variant="text" width="60%" />
          <LoadingSkeleton variant="text" width="100%" />
          <LoadingSkeleton variant="text" width="80%" />
        </div>
      </div>
    </div>
  );
}

export function LoadingTable() {
  return (
    <div className="space-y-2">
      <LoadingSkeleton height="48px" className="rounded-t-lg" />
      <LoadingSkeleton height="64px" count={5} />
    </div>
  );
}
