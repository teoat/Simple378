/**
 * Service Worker for Fraud Detection Platform
 * Handles caching, offline functionality, and background sync
 */

const CACHE_NAME = 'fraud-detection-v1';
const API_CACHE_NAME = 'fraud-detection-api-v1';

// Resources to cache immediately
const STATIC_CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
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

// Queue requests for background sync
async function queueForSync(request) {
  const syncStore = await openSyncStore();

  const requestData = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: request.method !== 'GET' ? await request.clone().text() : null,
    timestamp: Date.now()
  };

  await syncStore.add('syncQueue', requestData);
  console.log('[SW] Queued request for sync:', request.url);
}

// Open IndexedDB for background sync
async function openSyncStore() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fraud-detection-sync', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
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

// Process queued requests
async function processSyncQueue() {
  const syncStore = await openSyncStore();
  const transaction = syncStore.transaction(['syncQueue'], 'readwrite');
  const store = transaction.objectStore('syncQueue');

  const requests = await new Promise((resolve) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
  });

  for (const queuedRequest of requests) {
    try {
      const request = new Request(queuedRequest.url, {
        method: queuedRequest.method,
        headers: queuedRequest.headers,
        body: queuedRequest.body
      });

      const response = await fetch(request);
      if (response.ok) {
        // Remove from queue on success
        await new Promise((resolve) => {
          const deleteRequest = store.delete(queuedRequest.id);
          deleteRequest.onsuccess = resolve;
        });
        console.log('[SW] Synced request:', queuedRequest.url);
      }
    } catch (error) {
      console.log('[SW] Failed to sync request:', queuedRequest.url, error);
    }
  }
}

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: data.url,
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
    self.registration.showNotification(data.title, options)
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
});