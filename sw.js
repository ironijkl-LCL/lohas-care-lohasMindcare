/* ============================================================
   Mindful Space — Service Worker v3.3
   Offline-first + Audio Cache + Notification Click
   ============================================================ */

const CACHE_VERSION = 'mindful-v3.3.0';
const RUNTIME_CACHE = 'mindful-runtime-v3.3.0';

// 核心靜態資源（首次安裝即 cache）
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './privacy-policy.html',
  './terms.html'
];

// 音檔（冥想引導，體積較大，獨立 cache）
const AUDIO_ASSETS = [
  './audio/meditation.mp3',
  './audio/breathing.mp3',
  './audio/morning.mp3',
  './audio/evening.mp3'
];

// ============ INSTALL ============
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const coreCache = await caches.open(CACHE_VERSION);
      await coreCache.addAll(CORE_ASSETS);

      // 音檔逐個 cache，避免單一 404 拖垮整個 install
      const audioCache = await caches.open(RUNTIME_CACHE);
      await Promise.all(
        AUDIO_ASSETS.map(async (url) => {
          try {
            const res = await fetch(url, { cache: 'no-cache' });
            if (res.ok) await audioCache.put(url, res);
          } catch (e) {
            console.warn('[SW] audio cache miss:', url, e.message);
          }
        })
      );

      self.skipWaiting();
    })()
  );
});

// ============ ACTIVATE ============
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== CACHE_VERSION && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// ============ FETCH ============
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // 只處理 GET
  if (req.method !== 'GET') return;

  // 只處理同源請求
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // 音檔：cache-first（體積大、唔常變）
  if (url.pathname.includes('/audio/')) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        try {
          const res = await fetch(req);
          if (res.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(req, res.clone());
          }
          return res;
        } catch (e) {
          return new Response('', { status: 504, statusText: 'Audio offline' });
        }
      })()
    );
    return;
  }

  // HTML：network-first（確保更新）
  if (req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          const cache = await caches.open(CACHE_VERSION);
          cache.put(req, res.clone());
          return res;
        } catch (e) {
          const cached = await caches.match(req);
          return cached || caches.match('./index.html');
        }
      })()
    );
    return;
  }

  // 其他靜態資源：cache-first + 背景更新（stale-while-revalidate）
  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      const fetchPromise = fetch(req)
        .then(async (res) => {
          if (res.ok) {
            const cache = await caches.open(CACHE_VERSION);
            cache.put(req, res.clone());
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })()
  );
});

// ============ NOTIFICATION CLICK ============
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = './index.html?from=notification';

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      });

      // 已有視窗：聚焦
      for (const client of allClients) {
        if (client.url.includes('index.html') && 'focus' in client) {
          await client.focus();
          if ('navigate' in client) await client.navigate(targetUrl);
          return;
        }
      }

      // 冇視窗：開新
      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })()
  );
});

// ============ PUSH（預留 Web Push） ============
self.addEventListener('push', (event) => {
  let data = { title: 'Mindful Space', body: '給自己 30 秒微練習。' };
  try {
    if (event.data) data = event.data.json();
  } catch (e) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icon-192.png',
      badge: './icon-192.png',
      vibrate: [100, 50, 100],
      tag: 'mindful-micro',
      renotify: true
    })
  );
});

// ============ MESSAGE（頁面 → SW 通訊） ============
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(event.data.title || 'Mindful Space', {
      body: event.data.body || '',
      icon: './icon-192.png',
      badge: './icon-192.png',
      vibrate: [100, 50, 100]
    });
  }
});
