// Service Worker Registration with offline search support

interface SearchResult {
  document_id: string;
  content: string;
  score: number;
  semantic_score?: number;
  keyword_score?: number;
  metadata: {
    case_id?: string;
    subject_id?: string;
    file_type?: string;
    filename?: string;
    uploaded_by?: string;
  };
}

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js') // Updated to match our service worker file
        .then((registration) => {
          console.log('ServiceWorker registered: ', registration);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available, show update notification
                  if (confirm('New version available! Reload to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error: Error) => {
          console.error('ServiceWorker registration failed: ', error);
        });
    });
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error: Error) => {
        console.error(error.message);
      });
  }
}

// Request background sync for offline search history
export function requestBackgroundSync() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(() => {
      // Background sync not supported in all browsers
      console.log('Service worker ready, background sync not implemented');
    });
  }
}

// Check if app is running offline
export function isOnline(): boolean {
  return navigator.onLine;
}

// Listen for online/offline events
export function setupNetworkListeners(
  onOnline: () => void,
  onOffline: () => void
) {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
}

// Offline search storage using IndexedDB
export class OfflineSearchStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('FraudDetectionDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('searchHistory')) {
          db.createObjectStore('searchHistory', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('searchResults')) {
          db.createObjectStore('searchResults', { keyPath: 'query' });
        }
      };
    });
  }

  async storeSearchHistory(searchData: Record<string, unknown>): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['searchHistory'], 'readwrite');
      const store = transaction.objectStore('searchHistory');
      const request = store.add(searchData);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        // Request background sync
        requestBackgroundSync();
        resolve();
      };
    });
  }

  async getStoredSearchHistory(): Promise<Record<string, unknown>[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['searchHistory'], 'readonly');
      const store = transaction.objectStore('searchHistory');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as Record<string, unknown>[]);
    });
  }

  async storeSearchResults(query: string, results: SearchResult[]): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['searchResults'], 'readwrite');
      const store = transaction.objectStore('searchResults');
      const request = store.put({ query, results, timestamp: Date.now() });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getStoredSearchResults(query: string): Promise<SearchResult[] | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['searchResults'], 'readonly');
      const store = transaction.objectStore('searchResults');
      const request = store.get(query);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result && Date.now() - result.timestamp < 24 * 60 * 60 * 1000) { // 24 hours
          resolve(result.results);
        } else {
          resolve(null);
        }
      };
    });
  }
}

// Global instance
export const offlineSearchStorage = new OfflineSearchStorage();
