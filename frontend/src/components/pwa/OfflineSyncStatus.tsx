import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

/**
 * Component that shows offline status and manual sync trigger
 * Monitors online/offline events and displays sync status
 */
export function OfflineSyncStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingItems, setPendingItems] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check IndexedDB for pending items
  useEffect(() => {
    const checkPendingItems = async () => {
      if (!isOnline) {
        try {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open('SyncQueue', 1);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });

          const tx = db.transaction('pending', 'readonly');
          const store = tx.objectStore('pending');
          const countRequest = store.count();

          countRequest.onsuccess = () => {
            setPendingItems(countRequest.result);
          };

          db.close();
        } catch (err) {
          console.error('Failed to check pending items:', err);
        }
      }
    };

    checkPendingItems();
    const interval = setInterval(checkPendingItems, 5000);

    return () => clearInterval(interval);
  }, [isOnline]);

  const handleManualSync = async () => {
    if ('serviceWorker' in navigator) {
      setIsSyncing(true);
      try {
        const registration = await navigator.serviceWorker.ready;
        if ('sync' in registration) {
          await (registration as any).sync.register('sync-queue');
        }
      } catch (err) {
        console.error('Failed to trigger sync:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  if (isOnline && pendingItems === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`px-4 py-3 flex items-center justify-between gap-4 ${
          isOnline
            ? 'bg-green-50 border-b border-green-200'
            : 'bg-amber-50 border-b border-amber-200'
        }`}
      >
        <div className="flex items-center gap-3">
          {isOnline ? (
            <>
              <Wifi size={20} className="text-green-600" />
              <div className="text-sm text-green-800">
                <p className="font-semibold">Syncing offline changes</p>
                {pendingItems > 0 && (
                  <p className="text-green-700">{pendingItems} item{pendingItems !== 1 ? 's' : ''} pending</p>
                )}
              </div>
            </>
          ) : (
            <>
              <WifiOff size={20} className="text-amber-600" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold">You are offline</p>
                <p className="text-amber-700">
                  {pendingItems} action{pendingItems !== 1 ? 's' : ''} will sync when online
                </p>
              </div>
            </>
          )}
        </div>

        {isOnline && pendingItems > 0 && (
          <Button
            onClick={handleManualSync}
            disabled={isSyncing}
            size="sm"
            variant="secondary"
          >
            {isSyncing ? (
              <>
                <RefreshCw size={16} className="mr-1 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw size={16} className="mr-1" />
                Sync Now
              </>
            )}
          </Button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default OfflineSyncStatus;
