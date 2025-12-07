import { FC, ReactNode, createContext, useContext } from 'react';

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

interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs compound components must be used within a Tabs component');
  }
  return context;
};

export const Tabs: FC<TabsProps> & {
  List: FC<TabsListProps>;
  Trigger: FC<TabsTriggerProps>;
  Content: FC<TabsContentProps>;
} = ({ value, onValueChange, children, className }) => {
  return (
    <TabsContext.Provider value={{ activeTab: value, setActiveTab: onValueChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList: FC<TabsListProps> = ({ children, className }) => {
  return (
    <div className={`flex gap-2 border-b border-slate-200 dark:border-slate-800 ${className || ''}`} role="tablist">
      {children}
    </div>
  );
};

export const TabsTrigger: FC<TabsTriggerProps> = ({ value, children, className }) => {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;
  
  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      data-state={isActive ? 'active' : 'inactive'}
      onClick={() => setActiveTab(value)}
      className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 border-transparent hover:text-slate-900 dark:hover:text-slate-100 ${className || ''}`}
    >
      {children}
    </button>
  );
};

export const TabsContent: FC<TabsContentProps> = ({ value, children, className }) => {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === value;
  
  if (!isActive) {
    return null;
  }
  
  return (
    <div 
      role="tabpanel" 
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      data-state={isActive ? 'active' : 'inactive'}
      className={className}
    >
      {children}
    </div>
  );
};

Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;
