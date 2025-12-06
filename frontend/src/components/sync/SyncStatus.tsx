import React from 'react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Cloud, CloudOff, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SyncStatus({ className }: { className?: string }) {
  const { isOnline, isSyncing, unsyncedCount, syncError, forceSync } = useOfflineSync();

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isSyncing) return 'Syncing...';
    if (syncError) return 'Sync Error';
    if (unsyncedCount > 0) return `${unsyncedCount} unsynced`;
    return 'Synced';
  };

  const getIcon = () => {
    if (isSyncing) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (!isOnline) return <CloudOff className="w-4 h-4" />;
    if (syncError) return <AlertTriangle className="w-4 h-4" />;
    if (unsyncedCount > 0) return <Cloud className="w-4 h-4" />;
    return <CheckCircle2 className="w-4 h-4" />;
  };

  const getStatusColor = () => {
    if (!isOnline) return "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    if (syncError) return "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    if (isSyncing || unsyncedCount > 0) return "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
    return "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800";
  };

  return (
    <button
      onClick={forceSync}
      disabled={isSyncing || (!isOnline && unsyncedCount === 0)}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200",
        getStatusColor(),
        className
      )}
      title={syncError || "Click to sync"}
    >
      {getIcon()}
      <span>{getStatusText()}</span>
    </button>
  );
}
