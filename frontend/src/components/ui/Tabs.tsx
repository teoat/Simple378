import { FC, ReactNode } from 'react';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const Tabs: FC<TabsProps> & {
  List: FC<TabsListProps>;
  Trigger: FC<TabsTriggerProps>;
  Content: FC<TabsContentProps>;
} = ({ value, onValueChange, children, className }) => {
  return (
    <div className={className} data-value={value} data-on-value-change={onValueChange}>
      {children}
    </div>
  );
};

export const TabsList: FC<TabsListProps> = ({ children, className }) => {
  return (
    <div className={`flex gap-2 border-b border-slate-200 dark:border-slate-800 ${className || ''}`}>
      {children}
    </div>
  );
};

export const TabsTrigger: FC<TabsTriggerProps> = ({ value, children, className }) => {
  return (
    <button
      data-value={value}
      className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 border-transparent hover:text-slate-900 dark:hover:text-slate-100 ${className || ''}`}
    >
      {children}
    </button>
  );
};

export const TabsContent: FC<TabsContentProps> = ({ value, children, className }) => {
  return (
    <div data-value={value} className={className}>
      {children}
    </div>
  );
};

Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;
