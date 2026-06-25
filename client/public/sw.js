const CACHE_NAME = 'esek-tech-crm-v1';
const RUNTIME_CACHE = 'esek-tech-runtime-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // API requests - network first
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/ws')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const cache = caches.open(RUNTIME_CACHE);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets - cache first
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      });
    })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'New notification',
    icon: '/manus-storage/esek-tech-logo_88d01e05.jpg',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect fill="%23000" width="96" height="96"/><text x="48" y="64" font-size="40" font-weight="bold" fill="%23fff" text-anchor="middle">ET</text></svg>',
    tag: 'esek-notification',
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification('Esek Tech CRM', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncPendingTasks());
  }
  if (event.tag === 'sync-comments') {
    event.waitUntil(syncPendingComments());
  }
});

async function syncPendingTasks() {
  try {
    const db = await openIndexedDB();
    const pendingTasks = await getPendingTasks(db);
    
    for (const task of pendingTasks) {
      await fetch('/api/trpc/tasks.update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
    }
    
    await clearPendingTasks(db);
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

async function syncPendingComments() {
  try {
    const db = await openIndexedDB();
    const pendingComments = await getPendingComments(db);
    
    for (const comment of pendingComments) {
      await fetch('/api/trpc/comments.create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment),
      });
    }
    
    await clearPendingComments(db);
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('EsekTechCRM', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function getPendingTasks(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingTasks'], 'readonly');
    const store = transaction.objectStore('pendingTasks');
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function getPendingComments(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingComments'], 'readonly');
    const store = transaction.objectStore('pendingComments');
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function clearPendingTasks(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingTasks'], 'readwrite');
    const store = transaction.objectStore('pendingTasks');
    const request = store.clear();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

function clearPendingComments(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingComments'], 'readwrite');
    const store = transaction.objectStore('pendingComments');
    const request = store.clear();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
