const CACHE_NAME = 'mindful-v2.3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json?v=2.3',
  './icon-192.png?v=2.3',
  './icon-512.png?v=2.3',
  './audio/meditation.mp3',
  './audio/breathing.mp3',
  './audio/morning.mp3',
  './audio/evening.mp3'
];

// 安裝並預載入最新資源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 啟動時徹底刪除所有舊版本快取 (包括 v1.2, v2.1, v2.2)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// 請求攔截
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((networkRes) => {
        if (networkRes.ok && networkRes.type === 'basic') {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkRes;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
