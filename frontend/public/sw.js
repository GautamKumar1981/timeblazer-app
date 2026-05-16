const CACHE = 'dragonhour-v3';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data;
  try { data = event.data.json(); } catch { data = { title: 'DragonHour', body: event.data.text() }; }

  const title   = data.title || 'DragonHour';
  const options = {
    body:  data.body || '',
    icon:  '/icon-512.svg',
    badge: '/icon-512.svg',
    data:  { url: data.url || '/dashboard' },
    vibrate: [200, 100, 200],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never intercept API calls
  if (url.pathname.startsWith('/api/')) return;

  // Navigation: network first, fall back to cached index.html (keeps SPA routing working offline)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(res => {
          caches.open(CACHE).then(c => c.put(request, res.clone()));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Static assets (JS, CSS, images, fonts): cache first, then network
  if (
    url.pathname.startsWith('/static/') ||
    url.pathname.match(/\.(svg|png|ico|woff2?|ttf|eot)$/)
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(request, clone));
          }
          return res;
        });
      })
    );
  }
});
