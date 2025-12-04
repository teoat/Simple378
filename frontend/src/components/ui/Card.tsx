import { cn } from '../../lib/utils';

export const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
    {children}
  </div>
);

export const CardHeader = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
    {children}
  </div>
);

export const CardTitle = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <p className={cn("text-sm text-muted-foreground", className)}>
    {children}
  </p>
);

export const CardContent = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("p-6 pt-0", className)}>
    {children}
  </div>
);

export const CardFooter = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("flex items-center p-6 pt-0", className)}>
    {children}
  </div>
);
