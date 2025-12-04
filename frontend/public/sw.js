// Service Worker for offline search capabilities
const CACHE_NAME = 'fraud-detection-v1';
const SEARCH_CACHE = 'search-results-v1';

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/static/js/bundle.js',
        '/static/css/main.css',
        '/manifest.json'
      ]);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== SEARCH_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Handle search API requests specially
  if (event.request.url.includes('/api/v1/vector/search')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful search results
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(SEARCH_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached search results if available
          return caches.match(event.request);
        })
    );
  } else {
    // Standard cache-first strategy for other requests
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

// Background sync for offline search history
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-search-history') {
    event.waitUntil(syncSearchHistory());
  }
});

async function syncSearchHistory() {
  try {
    // Get stored search history from IndexedDB
    const searchHistory = await getStoredSearchHistory();

    // Sync with server
    for (const search of searchHistory) {
      await fetch('/api/v1/search/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('auth_token')
        },
        body: JSON.stringify(search)
      });
    }

    // Clear synced data
    await clearSyncedSearchHistory();
  } catch (error) {
    console.error('Failed to sync search history:', error);
  }
}

// IndexedDB helpers for offline storage
function getStoredSearchHistory() {
  return new Promise((resolve) => {
    const request = indexedDB.open('FraudDetectionDB', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('searchHistory')) {
        db.createObjectStore('searchHistory', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['searchHistory'], 'readonly');
      const store = transaction.objectStore('searchHistory');
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
    };
  });
}

function clearSyncedSearchHistory() {
  return new Promise((resolve) => {
    const request = indexedDB.open('FraudDetectionDB', 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['searchHistory'], 'readwrite');
      const store = transaction.objectStore('searchHistory');
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        resolve();
      };
    };
  });
}