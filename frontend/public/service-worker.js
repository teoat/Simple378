/**
 * Service Worker for AntiGravity Fraud Detection Platform
 * Handles caching, offline functionality, and background sync
 * 
 * IMPROVED: Added retry limits with exponential backoff to prevent infinite retry loops
 */

const CACHE_NAME = 'antigravity-v3';
const API_CACHE_NAME = 'antigravity-api-v3';

// Retry configuration
const MAX_RETRIES = 3;
const BACKOFF_MULTIPLIER = 5; // seconds
const MAX_BACKOFF = 300; // 5 minutes

// Resources to cache immediately
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache
const API_CACHE_URLS = [
  '/api/v1/dashboard/metrics',
  '/api/v1/subjects/',
  '/api/v1/cases/'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle static resources
  event.respondWith(
    caches.match(request)
      .then((response) => {
        return response || fetch(request);
      })
  );
});

// Handle API requests with caching and offline support
async function handleApiRequest(request) {
  const url = new URL(request.url);

  // For GET requests, try cache first, then network
  if (request.method === 'GET') {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Return cached response and update in background
      fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
          caches.open(API_CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
          });
        }
      });
      return cachedResponse;
    }

    // Try network request
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        // Cache successful responses
        const cache = await caches.open(API_CACHE_NAME);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      console.log('[SW] Network request failed, returning offline response');
      // Return offline response for critical endpoints
      if (API_CACHE_URLS.some(apiUrl => url.pathname.startsWith(apiUrl))) {
        return new Response(JSON.stringify({
          error: 'Offline',
          message: 'You are currently offline. Please check your connection.'
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw error;
    }
  }

  // For other methods (POST, PUT, DELETE), try network first
  try {
    return await fetch(request);
  } catch (error) {
    // Queue for background sync if it's a write operation
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      await queueForSync(request);
    }
    throw error;
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    // Return offline page for navigation requests
    const cache = await caches.open(CACHE_NAME);
    return await cache.match('/offline.html') || new Response('Offline', { status: 503 });
  }
}

// Queue requests for background sync (FIXED: includes retry tracking)
async function queueForSync(request) {
  const syncStore = await openSyncStore();
  const transaction = syncStore.transaction(['syncQueue'], 'readwrite');
  const store = transaction.objectStore('syncQueue');

  const requestData = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: request.method !== 'GET' ? await request.clone().text() : null,
    timestamp: Date.now(),
    lastRetryTime: Date.now(),  // Track for exponential backoff
    retries: 0                   // Track retry attempts
  };

  await new Promise((resolve, reject) => {
    const addRequest = store.add(requestData);
    addRequest.onsuccess = resolve;
    addRequest.onerror = () => reject(addRequest.error);
  });

  console.log('[SW] Queued request for sync:', request.url);
}

// Open IndexedDB for background sync (FIXED: added retries index)
async function openSyncStore() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('antigravity-sync', 2); // Bumped version for schema update

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Handle upgrade from v1 to v2
      if (!db.objectStoreNames.contains('syncQueue')) {
        const store = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        store.createIndex('retries', 'retries', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      // Create dead letter queue for failed requests
      if (!db.objectStoreNames.contains('deadLetterQueue')) {
        db.createObjectStore('deadLetterQueue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(processSyncQueue());
  }
});

// Process queued requests (FIXED: with retry limits and exponential backoff)
async function processSyncQueue() {
  const syncStore = await openSyncStore();
  const transaction = syncStore.transaction(['syncQueue', 'deadLetterQueue'], 'readwrite');
  const store = transaction.objectStore('syncQueue');
  const deadLetterStore = transaction.objectStore('deadLetterQueue');

  const requests = await new Promise((resolve) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
  });

  const now = Date.now();
  const deadLetterQueue = [];

  for (const queuedRequest of requests) {
    // Check retry limit
    if (queuedRequest.retries >= MAX_RETRIES) {
      console.warn('[SW] Max retries exceeded, moving to dead letter:', queuedRequest.url);
      deadLetterQueue.push(queuedRequest);
      
      // Move to dead letter queue
      await new Promise((resolve) => {
        const addRequest = deadLetterStore.add({
          ...queuedRequest,
          movedAt: now,
          reason: 'max_retries_exceeded'
        });
        addRequest.onsuccess = resolve;
      });
      
      // Remove from sync queue
      await new Promise((resolve) => {
        const deleteRequest = store.delete(queuedRequest.id);
        deleteRequest.onsuccess = resolve;
      });
      
      continue;
    }

    // Check backoff timing (exponential backoff)
    const backoffMs = Math.min(
      BACKOFF_MULTIPLIER * 1000 * Math.pow(2, queuedRequest.retries),
      MAX_BACKOFF * 1000
    );
    
    if (now - queuedRequest.lastRetryTime < backoffMs) {
      console.log('[SW] Backoff still active for', queuedRequest.url);
      continue; // Wait longer before retrying
    }

    try {
      const request = new Request(queuedRequest.url, {
        method: queuedRequest.method,
        headers: queuedRequest.headers,
        body: queuedRequest.body
      });

      const response = await fetch(request);
      
      if (response.ok) {
        // Success: remove from queue
        await new Promise((resolve) => {
          const deleteRequest = store.delete(queuedRequest.id);
          deleteRequest.onsuccess = resolve;
        });
        console.log('[SW] Synced successfully:', queuedRequest.url);
      } else if (response.status >= 500) {
        // Server error: retry with backoff
        queuedRequest.retries += 1;
        queuedRequest.lastRetryTime = now;
        queuedRequest.lastError = `Server error: ${response.status}`;
        await new Promise((resolve) => {
          const updateRequest = store.put(queuedRequest);
          updateRequest.onsuccess = resolve;
        });
        console.log('[SW] Server error, retrying:', queuedRequest.url, `(attempt ${queuedRequest.retries}/${MAX_RETRIES})`);
      } else {
        // Client error (4xx): don't retry, move to dead letter
        console.warn('[SW] Client error, moving to dead letter:', queuedRequest.url);
        await new Promise((resolve) => {
          const addRequest = deadLetterStore.add({
            ...queuedRequest,
            movedAt: now,
            reason: `client_error_${response.status}`
          });
          addRequest.onsuccess = resolve;
        });
        await new Promise((resolve) => {
          const deleteRequest = store.delete(queuedRequest.id);
          deleteRequest.onsuccess = resolve;
        });
      }
    } catch (error) {
      // Network error: retry with backoff
      queuedRequest.retries += 1;
      queuedRequest.lastRetryTime = now;
      queuedRequest.lastError = error.message || 'Network error';
      await new Promise((resolve) => {
        const updateRequest = store.put(queuedRequest);
        updateRequest.onsuccess = resolve;
      });
      console.log('[SW] Network error, retrying:', queuedRequest.url, `(attempt ${queuedRequest.retries}/${MAX_RETRIES})`);
    }
  }

  // Notify about dead letter items (in production: send to Sentry/logging service)
  if (deadLetterQueue.length > 0) {
    console.error('[SW] Dead letter queue has', deadLetterQueue.length, 'items');
    
    // Notify main thread about failed syncs
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_FAILED',
        count: deadLetterQueue.length,
        items: deadLetterQueue.map(item => ({
          url: item.url,
          method: item.method,
          timestamp: item.timestamp,
          retries: item.retries
        }))
      });
    });
  }
}

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'New alert available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: data.url || '/',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Case'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'AntiGravity Alert', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view' && event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Allow main thread to request sync status
  if (event.data && event.data.type === 'GET_SYNC_STATUS') {
    getSyncStatus().then(status => {
      event.source.postMessage({
        type: 'SYNC_STATUS',
        ...status
      });
    });
  }
});

// Get current sync queue status
async function getSyncStatus() {
  try {
    const syncStore = await openSyncStore();
    const transaction = syncStore.transaction(['syncQueue', 'deadLetterQueue'], 'readonly');
    const syncQueue = transaction.objectStore('syncQueue');
    const deadLetterQueue = transaction.objectStore('deadLetterQueue');
    
    const pending = await new Promise((resolve) => {
      const request = syncQueue.count();
      request.onsuccess = () => resolve(request.result);
    });
    
    const failed = await new Promise((resolve) => {
      const request = deadLetterQueue.count();
      request.onsuccess = () => resolve(request.result);
    });
    
    return { pending, failed };
  } catch (error) {
    return { pending: 0, failed: 0, error: error.message };
  }
}
