import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Archive, Trash2, Download, UserPlus, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';
import { api } from '../../lib/api';

interface BulkActionsProps {
  selectedIds: Set<string>;
  onClearSelection: () => void;
}

export function BulkActions({ selectedIds, onClearSelection }: BulkActionsProps) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const selectedCount = selectedIds.size;
  const queryClient = useQueryClient();

  // Archive Mutation
  const archiveMutation = useMutation({
    mutationFn: (ids: string[]) => api.bulkArchiveCases(ids),
    onSuccess: (data) => {
      toast.success(`Archived ${data.count} cases`);
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      onClearSelection();
    },
    onError: () => toast.error('Failed to archive cases'),
  });

  // Assign Mutation
  const assignMutation = useMutation({
    mutationFn: ({ ids, userId }: { ids: string[]; userId: string }) => 
      api.bulkAssignCases(ids, userId),
    onSuccess: (data) => {
      toast.success(`Assigned ${data.count} cases`);
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      setIsAssigning(false);
      onClearSelection();
    },
    onError: () => toast.error('Failed to assign cases'),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => api.bulkDeleteCases(ids),
    onSuccess: (data) => {
      toast.success(`Deleted ${data.count} cases`);
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      setIsConfirmingDelete(false);
      onClearSelection();
    },
    onError: () => toast.error('Failed to delete cases'),
  });

    // Export Mutation
  const exportMutation = useMutation({
    mutationFn: (ids: string[]) => api.bulkExportCases(ids),
    onSuccess: () => {
      toast.success('Export started');
      onClearSelection();
    },
    onError: () => toast.error('Failed to export cases'),
  });

  // Handlers
  const handleArchive = () => {
    archiveMutation.mutate(Array.from(selectedIds));
  };

  const handleExport = () => {
    exportMutation.mutate(Array.from(selectedIds));
  };

  const handleDelete = () => {
    deleteMutation.mutate(Array.from(selectedIds));
  };

  const handleAssign = (userId: string) => {
    assignMutation.mutate({ ids: Array.from(selectedIds), userId });
  };

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-2xl p-2 px-6 flex items-center gap-4">
        <div className="flex items-center gap-3 border-r border-slate-200 dark:border-slate-700 pr-4">
          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded-full">
            {selectedCount}
          </span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Selected
          </span>
          <button 
            onClick={onClearSelection}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Main Actions */}
          {!isAssigning && !isConfirmingDelete && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsAssigning(true)}
                className="rounded-full"
                title="Assign Users"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assign
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleArchive}
                isLoading={archiveMutation.isPending}
                className="rounded-full"
                title="Archive Cases"
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleExport}
                isLoading={exportMutation.isPending}
                className="rounded-full"
                title="Export Cases"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsConfirmingDelete(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                title="Delete Cases"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}

          {/* Assign Mode */}
          {isAssigning && (
            <div className="flex items-center gap-2 animate-in fade-in zoom-in">
              <span className="text-sm text-slate-500">Assign to:</span>
              <select 
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm px-2 py-1"
                onChange={(e) => handleAssign(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>Select User...</option>
                <option value="Alice">Alice</option>
                <option value="Bob">Bob</option>
                <option value="Charlie">Charlie</option>
              </select>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsAssigning(false)}
                className="ml-2 rounded-full"
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Delete Confirmation */}
          {isConfirmingDelete && (
            <div className="flex items-center gap-2 animate-in fade-in zoom-in">
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                Delete {selectedCount} cases?
              </span>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDelete}
                isLoading={deleteMutation.isPending}
                className="rounded-full px-4"
              >
                Confirm
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsConfirmingDelete(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}