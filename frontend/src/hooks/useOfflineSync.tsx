import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';

interface SyncItem {
  id: string;
  type: 'case' | 'transaction' | 'evidence' | 'note';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
}

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingItems: number;
  lastSyncTime: number | null;
  syncErrors: string[];
}

class OfflineSyncManager {
  private db: IDBDatabase | null = null;
  private syncQueue: SyncItem[] = [];
  private isOnline = navigator.onLine;
  private syncInProgress = false;

  constructor() {
    this.initIndexedDB();
    this.setupNetworkListeners();
  }

  private async initIndexedDB() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('fraudDetectionOffline', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains('cachedData')) {
          const cacheStore = db.createObjectStore('cachedData', { keyPath: 'key' });
          cacheStore.createIndex('type', 'type', { unique: false });
          cacheStore.createIndex('lastModified', 'lastModified', { unique: false });
        }

        if (!db.objectStoreNames.contains('userPreferences')) {
          db.createObjectStore('userPreferences', { keyPath: 'key' });
        }
      };
    });
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async queueForSync(item: Omit<SyncItem, 'id' | 'timestamp' | 'retryCount'>) {
    if (!this.db) await this.initIndexedDB();

    const syncItem: SyncItem = {
      ...item,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    };

    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.add(syncItem);

      request.onsuccess = () => {
        this.syncQueue.push(syncItem);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async processSyncQueue(): Promise<void> {
    if (!this.isOnline || this.syncInProgress || !this.db) return;

    this.syncInProgress = true;

    try {
      // Get all pending sync items
      const pendingItems = await this.getPendingSyncItems();

      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
          await this.removeFromSyncQueue(item.id);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          await this.incrementRetryCount(item.id);

          // Remove after max retries
          if (item.retryCount >= 3) {
            await this.removeFromSyncQueue(item.id);
          }
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncItem(item: SyncItem): Promise<void> {
    const endpoint = this.getEndpointForItem(item);

    let response;
    if (item.action === 'create') {
      response = await fetch(`/api/v1${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
      });
    } else if (item.action === 'update') {
      response = await fetch(`/api/v1${endpoint}/${item.data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
      });
    } else if (item.action === 'delete') {
      response = await fetch(`/api/v1${endpoint}/${item.data.id}`, {
        method: 'DELETE'
      });
    }

    if (!response!.ok) {
      throw new Error(`Sync failed: ${response!.status}`);
    }
  }

  private getEndpointForItem(item: SyncItem): string {
    switch (item.type) {
      case 'case': return '/cases';
      case 'transaction': return '/transactions';
      case 'evidence': return '/evidence';
      case 'note': return '/notes';
      default: return '';
    }
  }

  private async getPendingSyncItems(): Promise<SyncItem[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async removeFromSyncQueue(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async incrementRetryCount(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.get(id);

      request.onsuccess = () => {
        const item = request.result;
        item.retryCount += 1;

        const updateRequest = store.put(item);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async cacheData(key: string, data: any, type: string = 'generic'): Promise<void> {
    if (!this.db) await this.initIndexedDB();

    const cacheItem = {
      key,
      data,
      type,
      lastModified: Date.now(),
      version: 1
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readwrite');
      const store = transaction.objectStore('cachedData');
      const request = store.put(cacheItem);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedData(key: string): Promise<any> {
    if (!this.db) await this.initIndexedDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readonly');
      const store = transaction.objectStore('cachedData');
      const request = store.get(key);

      request.onsuccess = () => {
        const item = request.result;
        resolve(item ? item.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncStatus(): Promise<SyncStatus> {
    const pendingItems = this.syncQueue.length;
    const lastSyncTime = await this.getLastSyncTime();

    return {
      isOnline: this.isOnline,
      isSyncing: this.syncInProgress,
      pendingItems,
      lastSyncTime,
      syncErrors: [] // Would track sync errors in a real implementation
    };
  }

  private async getLastSyncTime(): Promise<number | null> {
    // In a real implementation, this would be stored and retrieved
    return Date.now() - 3600000; // Mock: 1 hour ago
  }

  async clearOldCache(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    // Clear cache older than maxAge (default 7 days)
    const cutoffTime = Date.now() - maxAge;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readwrite');
      const store = transaction.objectStore('cachedData');
      const index = store.index('lastModified');
      const range = IDBKeyRange.upperBound(cutoffTime);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// React hook for offline sync
export function useOfflineSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingItems: 0,
    lastSyncTime: null,
    syncErrors: []
  });

  const queryClient = useQueryClient();

  // Initialize sync manager
  const [syncManager] = useState(() => new OfflineSyncManager());

  // Update sync status periodically
  useEffect(() => {
    const updateStatus = async () => {
      const status = await syncManager.getSyncStatus();
      setSyncStatus(status);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [syncManager]);

  // Enhanced API request with offline support
  const offlineApiRequest = useCallback(async (url: string, options: RequestInit = {}) => {
    try {
      // Try online request first
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      // If offline, queue for sync
      if (!navigator.onLine) {
        await syncManager.queueForSync({
          type: 'api_request',
          action: 'sync',
          data: { url, options, timestamp: Date.now() }
        });
        throw new Error('Request queued for offline sync');
      }
      throw error;
    }
  }, [syncManager]);

  // Cache management
  const cacheData = useCallback(async (key: string, data: any, type: string = 'generic') => {
    await syncManager.cacheData(key, data, type);
  }, [syncManager]);

  const getCachedData = useCallback(async (key: string) => {
    return await syncManager.getCachedData(key);
  }, [syncManager]);

  // Enhanced query with offline support
  const useOfflineQuery = useCallback((queryKey: any[], queryFn: () => Promise<any>, options: any = {}) => {
    return useQuery({
      queryKey,
      queryFn: async () => {
        try {
          return await queryFn();
        } catch (error) {
          if (!navigator.onLine) {
            // Try to get cached data
            const cacheKey = JSON.stringify(queryKey);
            const cachedData = await syncManager.getCachedData(cacheKey);
            if (cachedData) {
              return cachedData;
            }
          }
          throw error;
        }
      },
      ...options,
      retry: (failureCount, error) => {
        // Don't retry if offline
        if (!navigator.onLine) return false;
        return failureCount < 3;
      }
    });
  }, [syncManager]);

  // Enhanced mutation with offline support
  const useOfflineMutation = useCallback((mutationFn: (variables: any) => Promise<any>, options: any = {}) => {
    return useMutation({
      mutationFn: async (variables: any) => {
        try {
          const result = await mutationFn(variables);
          // Cache successful mutations
          const cacheKey = `mutation_${Date.now()}`;
          await syncManager.cacheData(cacheKey, { variables, result }, 'mutation');
          return result;
        } catch (error) {
          if (!navigator.onLine) {
            // Queue for offline sync
            await syncManager.queueForSync({
              type: 'mutation',
              action: 'sync',
              data: { mutationFn: mutationFn.toString(), variables }
            });
          }
          throw error;
        }
      },
      ...options
    });
  }, [syncManager]);

  // Manual sync trigger
  const triggerSync = useCallback(async () => {
    await syncManager.processSyncQueue();
    // Refresh queries after sync
    queryClient.invalidateQueries();
  }, [syncManager, queryClient]);

  return {
    syncStatus,
    offlineApiRequest,
    cacheData,
    getCachedData,
    useOfflineQuery,
    useOfflineMutation,
    triggerSync
  };
}

// Sync status indicator component
export function SyncStatusIndicator() {
  const { syncStatus, triggerSync } = useOfflineSync();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all ${
        syncStatus.isOnline
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-red-50 text-red-700 border border-red-200'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          syncStatus.isOnline ? 'bg-green-500' : 'bg-red-500'
        } ${syncStatus.isSyncing ? 'animate-pulse' : ''}`} />

        <span className="text-sm font-medium">
          {syncStatus.isOnline ? 'Online' : 'Offline'}
        </span>

        {syncStatus.pendingItems > 0 && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            {syncStatus.pendingItems} pending
          </span>
        )}

        {syncStatus.isOnline && syncStatus.pendingItems > 0 && (
          <button
            onClick={triggerSync}
            disabled={syncStatus.isSyncing}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {syncStatus.isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        )}
      </div>
    </div>
  );
}