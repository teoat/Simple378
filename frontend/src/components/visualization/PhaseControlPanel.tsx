import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Upload, FileText, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { api } from '../../lib/api';

interface Milestone {
  id: string;
  name: string;
  date: string;
  amount: number;
  status: 'complete' | 'pending' | 'alert' | 'upcoming';
  description?: string;
  phase?: string;
}

interface PhaseControlPanelProps {
  milestone: Milestone;
  onStatusUpdate?: (milestoneId: string, newStatus: string) => void;
}

export function PhaseControlPanel({ milestone, onStatusUpdate }: PhaseControlPanelProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  // Mutation to mark milestone as complete
  const markCompleteMutation = useMutation({
    mutationFn: async (data: { milestoneId: string; notes?: string; evidence?: File }) => {
      // If evidence file is provided, upload it first
      let evidenceUrl = null;
      if (data.evidence) {
        const formData = new FormData();
        formData.append('file', data.evidence);
        formData.append('type', 'milestone_evidence');
        
        const uploadResponse = await api.post<{ url: string }>('/evidence/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        evidenceUrl = uploadResponse.url;
      }

      // Update milestone status
      return api.patch(`/milestones/${data.milestoneId}/status`, {
        status: 'complete',
        notes: data.notes,
        evidence_url: evidenceUrl,
        completed_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visualization'] });
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      setIsConfirming(false);
      setNotes('');
      setSelectedFile(null);
      onStatusUpdate?.(milestone.id, 'complete');
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleMarkComplete = () => {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    markCompleteMutation.mutate({
      milestoneId: milestone.id,
      notes: notes || undefined,
      evidence: selectedFile || undefined
    });
  };

  const handleCancel = () => {
    setIsConfirming(false);
    setNotes('');
    setSelectedFile(null);
  };

  // Don't show panel for already completed milestones
  if (milestone.status === 'complete') {
    return (
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-green-700 dark:text-green-300">
            <CheckCircle className="h-6 w-6" />
            <div>
              <p className="font-semibold">Phase Completed</p>
              <p className="text-sm text-green-600 dark:text-green-400">
                This milestone was marked as complete on {new Date(milestone.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-200 dark:border-blue-800">
      <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <CheckCircle className="h-5 w-5" />
          Phase Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {!isConfirming ? (
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Current Phase: {milestone.phase || 'Phase'}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                {milestone.description || milestone.name}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Amount:</span>
                  <span className="font-semibold ml-2">${milestone.amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500">Status:</span>
                  <span className={`font-semibold ml-2 capitalize ${
                    milestone.status === 'pending' ? 'text-amber-600' :
                    milestone.status === 'alert' ? 'text-red-600' :
                    'text-slate-600'
                  }`}>
                    {milestone.status}
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleMarkComplete}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Mark Phase as Complete
            </Button>

            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <p className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                Marking this phase as complete will trigger the next fund release
              </p>
              <p className="ml-6">
                Requires approval from authorized personnel
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Confirm Phase Completion
              </h4>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                This action will mark the phase as complete and may trigger fund release.
                Please add notes and upload supporting evidence.
              </p>
            </div>

            {/* Notes Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Completion Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this phase completion..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-[100px]"
                rows={4}
              />
            </div>

            {/* Evidence Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Supporting Evidence (Optional)
              </label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 text-center">
                <input
                  type="file"
                  id="evidence-upload"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <label
                  htmlFor="evidence-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  {selectedFile ? (
                    <>
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div className="text-sm">
                        <p className="font-medium text-slate-700 dark:text-slate-300">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedFile(null);
                        }}
                      >
                        Remove
                      </Button>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-slate-400" />
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        <p className="font-medium">Click to upload evidence</p>
                        <p className="text-xs">PDF, Images, or Documents (max 10MB)</p>
                      </div>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1"
                disabled={markCompleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleMarkComplete}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={markCompleteMutation.isPending}
              >
                {markCompleteMutation.isPending ? (
                  <>Processing...</>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Completion
                  </>
                )}
              </Button>
            </div>

            {markCompleteMutation.isError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-800 dark:text-red-200">
                  Failed to mark phase as complete. Please try again.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
