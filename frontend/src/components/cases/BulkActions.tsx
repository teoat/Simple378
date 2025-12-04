
import { Button } from '../ui/Button';

interface BulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
}

export function BulkActions({ selectedCount, onClearSelection }: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {selectedCount} case{selectedCount > 1 ? 's' : ''} selected
          </span>
          <Button variant="outline" size="sm" onClick={onClearSelection}>
            Clear Selection
          </Button>
        </div>

      </div>
    </div>
  );
}