import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Modal } from '../ui/Modal';
import toast from 'react-hot-toast';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewCaseModal({ isOpen, onClose }: NewCaseModalProps) {
  const [subjectName, setSubjectName] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const createCaseMutation = useMutation({
    mutationFn: api.createCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Case created successfully');
      setSubjectName('');
      setDescription('');
      onClose();
    },
    onError: (error) => {
      toast.error(`Failed to create case: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) {
      toast.error('Subject name is required');
      return;
    }
    createCaseMutation.mutate({ subject_name: subjectName, description });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Case">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="subject-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Subject Name
          </label>
          <input
            id="subject-name"
            type="text"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-white"
            placeholder="e.g. John Doe, Corp Inc."
            required
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-white min-h-[100px]"
            placeholder="Case details..."
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createCaseMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {createCaseMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              'Create Case'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
