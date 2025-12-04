import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useHotkeys } from 'react-hotkeys-hook';
import toast from 'react-hot-toast';
import { api } from '../lib/api';

export function useAdjudicationQueue(alerts: any[], selectedId: string | null, setSelectedId: (id: string | null) => void) {
  const queryClient = useQueryClient();
  const [lastAction, setLastAction] = useState<{
    id: string;
    decision: string;
    notes?: string;
  } | null>(null);

  // Revert decision mutation
  const revertDecisionMutation = useMutation({
    mutationFn: api.revertDecision,
    onSuccess: () => {
      toast.success('Decision reverted');
      setLastAction(null);
      queryClient.invalidateQueries({ queryKey: ['adjudication-queue'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to revert decision: ${error.message}`);
    },
  });

  const handleUndo = (id: string) => {
    revertDecisionMutation.mutate(id);
  };

  // Keyboard shortcut for undo
  useHotkeys('ctrl+z, meta+z', (e) => {
    e.preventDefault();
    if (lastAction) {
      handleUndo(lastAction.id);
    }
  }, [lastAction]);

  // Submit decision mutation
  const submitDecisionMutation = useMutation({
    mutationFn: ({ analysisId, decision, notes }: { analysisId: string; decision: string; notes?: string }) =>
      api.submitDecision(analysisId, decision, notes),
    onSuccess: (_, variables) => {
      // Store last action for undo
      setLastAction({
        id: variables.analysisId,
        decision: variables.decision,
        notes: variables.notes
      });

      toast.success((t) => (
        <span className="flex items-center gap-2">
          Decision submitted
          <button
            onClick={() => {
              handleUndo(variables.analysisId);
              toast.dismiss(t.id);
            }}
            className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors"
          >
            Undo
          </button>
        </span>
      ));

      // Invalidate and refetch queue
      queryClient.invalidateQueries({ queryKey: ['adjudication-queue'] });

      // Auto-advance to next alert
      const currentIndex = alerts.findIndex(a => a.id === selectedId);
      if (currentIndex < alerts.length - 1) {
        setSelectedId(alerts[currentIndex + 1].id);
      } else if (alerts.length > 1) {
        setSelectedId(alerts[0].id);
      } else {
        setSelectedId(null);
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit decision: ${error.message}`);
    },
  });

  const handleDecision = (decision: 'approve' | 'reject' | 'escalate', _confidence: string, comment?: string) => {
    if (!selectedId) return;

    // Map frontend decision to backend format
    const decisionMap: Record<string, string> = {
      approve: 'confirmed_fraud',
      reject: 'false_positive',
      escalate: 'escalated',
    };

    submitDecisionMutation.mutate({
      analysisId: selectedId,
      decision: decisionMap[decision] || decision,
      notes: comment,
    });
  };

  return {
    handleDecision,
    submitDecisionMutation,
    lastAction,
  };
}