import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useHotkeys } from 'react-hotkeys-hook';
import toast from 'react-hot-toast';
import { api } from '../lib/api';

export function useCaseDetail(id: string | undefined) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [showHelp, setShowHelp] = useState(false);

  // Keyboard shortcuts for tab navigation
  useHotkeys('1', () => {
    setActiveTab('Overview');
    toast('Switched to Overview', { icon: '📊', duration: 1000 });
  });

  useHotkeys('2', () => {
    setActiveTab('Graph Analysis');
    toast('Switched to Graph Analysis', { icon: '🔗', duration: 1000 });
  });

  useHotkeys('3', () => {
    setActiveTab('Timeline');
    toast('Switched to Timeline', { icon: '⏰', duration: 1000 });
  });

  useHotkeys('4', () => {
    setActiveTab('Financials');
    toast('Switched to Financials', { icon: '💰', duration: 1000 });
  });

  useHotkeys('5', () => {
    setActiveTab('Evidence');
    toast('Switched to Evidence', { icon: '🔒', duration: 1000 });
  });

  // Show keyboard shortcuts help
  useHotkeys('shift+?', () => setShowHelp(prev => !prev));

  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ['case', id],
    queryFn: () => api.getCase(id!),
    enabled: !!id,
  });

  const { data: timelineData } = useQuery({
    queryKey: ['case', id, 'timeline'],
    queryFn: () => api.getCaseTimeline(id!),
    enabled: !!id && activeTab === 'Timeline',
  });

  const { data: graphData } = useQuery({
    queryKey: ['graph', caseData?.subject_name],
    queryFn: () => api.getGraph(caseData!.subject_name),
    enabled: !!caseData?.subject_name && activeTab === 'Graph Analysis',
  });

  return {
    caseData,
    caseLoading,
    timelineData,
    graphData,
    activeTab,
    setActiveTab,
    showHelp,
    setShowHelp,
  };
}