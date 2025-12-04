import React from 'react';
import { Card } from '../ui/Card'; // Assuming a generic Card component exists in components/ui/Card.tsx

interface DashboardWidgetProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function DashboardWidget({ title, children, className }: DashboardWidgetProps) {
  return (
    <Card className={className}>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{title}</h2>
      {children}
    </Card>
  );
}
