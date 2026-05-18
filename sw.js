const CACHE_VERSION = 'v1';

// Handle installation
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Handle activation
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheName.startsWith('app-')) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Handle fetch requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only cache GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests entirely
  if (url.origin !== self.location.origin) {
    return;
  }

  // Check if this is a request for an app directory
  const appMatch = url.pathname.match(/\/apps\/([^/]+)\//);

  if (appMatch) {
    const appName = appMatch[1];
    const cacheName = `app-${appName}-${CACHE_VERSION}`;

    event.respondWith(
      caches.open(cacheName).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            return response;
          }

          return fetch(request).then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            const responseToCache = response.clone();
            cache.put(request, responseToCache);
            return response;
          }).catch(() => {
            // Return offline page if available
            return cache.match('/offline.html').catch(() => {
              return new Response('Offline - App not downloaded', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'text/plain'
                })
              });
            });
          });
        });
      })
    );
    return;
  }

  // Shared root assets (e.g. /style.css, /i18n.js): search every app cache.
  // If any app downloaded these files, serve from cache; otherwise pass
  // through to the network so the online hub keeps behaving normally.
  event.respondWith(
    caches.keys().then(async (names) => {
      for (const name of names) {
        if (!name.startsWith('app-')) continue;
        const cache = await caches.open(name);
        const hit = await cache.match(request);
        if (hit) return hit;
      }
      return fetch(request);
    })
  );
});

// Handle messages from clients (for cache management)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_APP') {
    const { appName, files } = event.data;
    const cacheName = `app-${appName}-${CACHE_VERSION}`;

    event.waitUntil(
      caches.open(cacheName).then((cache) => {
        return cache.addAll(files).then(() => {
          event.ports[0].postMessage({ success: true });
        }).catch((err) => {
          console.error('Failed to cache app:', err);
          event.ports[0].postMessage({ success: false, error: err.message });
        });
      })
    );
  }

  if (event.data && event.data.type === 'DELETE_APP') {
    const { appName } = event.data;
    const cacheName = `app-${appName}-${CACHE_VERSION}`;

    event.waitUntil(
      caches.delete(cacheName).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }

  if (event.data && event.data.type === 'GET_INSTALLED_APPS') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        const apps = cacheNames
          .filter((name) => name.startsWith('app-'))
          .map((name) => name.replace(`-${CACHE_VERSION}`, '').replace('app-', ''));
        event.ports[0].postMessage({ apps });
      })
    );
  }
});