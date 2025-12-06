import { useEffect, useState, useCallback } from 'react';
import { useEventSync, useEventStore } from '@/lib/eventSourcing';
import toast from 'react-hot-toast';

export interface OfflineSyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  unsyncedCount: number;
  lastSyncTime: number | null;
  syncError: string | null;
}

export function useOfflineSync(
  syncEndpoint = '/api/v1/events/sync',
  autoSyncInterval = 30000
) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const { sync, isSyncing, lastSyncResult } = useEventSync(syncEndpoint);
  const { getUnsyncedCount, isReady } = useEventStore();

  // Monitor unsynced count
  const updateCount = useCallback(async () => {
    if (isReady) {
      try {
        const count = await getUnsyncedCount();
        setUnsyncedCount(count);
      } catch (e) {
        console.error("Failed to get count", e);
      }
    }
  }, [isReady, getUnsyncedCount]);

  // Polling count
  useEffect(() => {
    const interval = setInterval(updateCount, 5000);
    updateCount();
    return () => clearInterval(interval);
  }, [updateCount]);

  // Auto-sync function
  const attemptSync = useCallback(async () => {
    if (isOnline && isReady) {
      try {
        await sync();
        setLastSyncTime(Date.now());
        updateCount();
        setSyncError(null);
      } catch (e) {
        console.error('Sync failed', e);
        setSyncError((e as Error).message);
      }
    }
  }, [isOnline, isReady, sync, updateCount]);

  // Monitor online status - MOVED AFTER attemptSync
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online. Syncing changes...');
      attemptSync();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast('You are offline. Changes will be saved locally.', { icon: '📡' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [attemptSync]);

  // Auto-sync interval
  useEffect(() => {
    if (autoSyncInterval > 0) {
      const interval = setInterval(attemptSync, autoSyncInterval);
      return () => clearInterval(interval);
    }
  }, [autoSyncInterval, attemptSync]);

  // Handle sync results (notifications)
  useEffect(() => {
    if (lastSyncResult) {
      updateCount();
      if (lastSyncResult.success) {
        if (lastSyncResult.syncedCount > 0) {
          toast.success(`Synced ${lastSyncResult.syncedCount} changes`);
        }
        if (lastSyncResult.conflicts && lastSyncResult.conflicts.length > 0) {
          toast.error(`${lastSyncResult.conflicts.length} conflicts detected`);
        }
      } else {
        setSyncError('Sync failed on server');
      }
    }
  }, [lastSyncResult, updateCount]);

  return {
    isOnline,
    isSyncing,
    unsyncedCount,
    lastSyncTime,
    syncError,
    forceSync: attemptSync,
  };
}
