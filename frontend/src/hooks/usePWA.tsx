import { useEffect, useState, useRef } from 'react';

interface UpdateAvailable {
  version: string;
  timestamp: string;
  changelogs?: string[];
}

/**
 * Hook for PWA service worker registration and lifecycle management
 */
export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState<UpdateAvailable | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const deferredPromptRef = useRef<any>(null);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch((error) => {
        console.error('Service Worker registration failed:', error);
      });

      // Listen for update messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'UPDATE_AVAILABLE') {
          setUpdateAvailable(event.data.data);
        }
      });
    }

    // Handle app install prompt
    window.addEventListener('beforeinstallprompt', (event: any) => {
      event.preventDefault();
      deferredPromptRef.current = event;
      setIsInstallable(true);
    });

    // Handle online/offline
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    return () => {
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);

  const installApp = async () => {
    if (!deferredPromptRef.current) return;
    deferredPromptRef.current.prompt();
    const { outcome } = await deferredPromptRef.current.userChoice;
    console.log(`User ${outcome} the install prompt`);
    deferredPromptRef.current = null;
    setIsInstallable(false);
  };

  const triggerSync = async () => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        setIsSyncing(true);
        const registration = await navigator.serviceWorker.ready;
        const syncManager = registration.sync as any;
        await syncManager.register('sync-queue');
      } catch (error) {
        console.error('Sync registration failed:', error);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  return {
    isInstallable,
    isOnline,
    updateAvailable,
    isSyncing,
    installApp,
    triggerSync,
  };
}

/**
 * Hook for offline queue management using IndexedDB
 */
export function useOfflineQueue() {
  const [queue, setQueue] = useState<any[]>([]);
  const dbRef = useRef<IDBDatabase | null>(null);

  useEffect(() => {
    const initDB = async () => {
      const request = indexedDB.open('simple378-sync', 1);

      request.onerror = () => {
        console.error('IndexedDB failed:', request.error);
      };

      request.onsuccess = () => {
        dbRef.current = request.result;
        loadQueue();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('queue')) {
          db.createObjectStore('queue', { keyPath: 'id', autoIncrement: true });
        }
      };
    };

    initDB();
  }, []);

  const loadQueue = async () => {
    if (!dbRef.current) return;
    const tx = dbRef.current.transaction('queue', 'readonly');
    const store = tx.objectStore('queue');
    const request = store.getAll();

    request.onsuccess = () => {
      setQueue(request.result);
    };
  };

  const addToQueue = async (action: { method: string; url: string; body?: any }) => {
    if (!dbRef.current) return;
    const tx = dbRef.current.transaction('queue', 'readwrite');
    const store = tx.objectStore('queue');
    const request = store.add({
      ...action,
      timestamp: Date.now(),
      retries: 0,
    });

    request.onsuccess = () => {
      loadQueue();
    };
  };

  const removeFromQueue = async (id: number) => {
    if (!dbRef.current) return;
    const tx = dbRef.current.transaction('queue', 'readwrite');
    const store = tx.objectStore('queue');
    const request = store.delete(id);

    request.onsuccess = () => {
      loadQueue();
    };
  };

  return {
    queue,
    addToQueue,
    removeFromQueue,
  };
}
