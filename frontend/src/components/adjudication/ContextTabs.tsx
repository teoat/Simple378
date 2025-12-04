import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { EvidenceTab } from './EvidenceTab';
import { GraphTab } from './GraphTab';
import { AIReasoningTab } from './AIReasoningTab';
import { HistoryTab } from './HistoryTab';
import { useHotkeys } from 'react-hotkeys-hook';

interface ContextTabsProps {
  alertId: string;
  subjectId: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ContextTabs({ alertId, subjectId, activeTab, onTabChange }: ContextTabsProps) {
  // Tab shortcuts
  useHotkeys('1', () => onTabChange('evidence'));
  useHotkeys('2', () => onTabChange('graph'));
  useHotkeys('3', () => onTabChange('ai'));
  useHotkeys('4', () => onTabChange('history'));

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="flex-1 flex flex-col h-full">
      <div className="px-6 pt-4 border-b border-white/10 dark:border-slate-700/20">
        <TabsList className="bg-black/20 p-1">
          <TabsTrigger value="evidence" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-200">
            Evidence <span className="ml-2 text-[10px] opacity-50 font-mono">1</span>
          </TabsTrigger>
          <TabsTrigger value="graph" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-200">
            Graph <span className="ml-2 text-[10px] opacity-50 font-mono">2</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-200">
            AI Reasoning <span className="ml-2 text-[10px] opacity-50 font-mono">3</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-200">
            History <span className="ml-2 text-[10px] opacity-50 font-mono">4</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-black/5">
        <TabsContent value="evidence" className="mt-0 h-full focus-visible:outline-none">
          <EvidenceTab alertId={alertId} />
        </TabsContent>
        <TabsContent value="graph" className="mt-0 h-full focus-visible:outline-none">
          <GraphTab subjectId={subjectId} />
        </TabsContent>
        <TabsContent value="ai" className="mt-0 h-full focus-visible:outline-none">
          <AIReasoningTab subjectId={subjectId} />
        </TabsContent>
        <TabsContent value="history" className="mt-0 h-full focus-visible:outline-none">
          <HistoryTab alertId={alertId} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
