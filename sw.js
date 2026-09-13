// Mindful Space Service Worker v2.1
const CACHE_NAME = 'mindful-space-v2.2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './audio/meditation.mp3',
    './audio/breathing.mp3',
    './audio/morning.mp3',
    './audio/evening.mp3'
];

// 安裝：預快取核心資源
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE).catch(err => {
                console.warn('部分資源快取失敗：', err);
            }))
            .then(() => self.skipWaiting())
    );
});

// 啟用：清理舊版快取
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// 攔截請求：Cache First，網絡更新
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    // 唔快取 API 請求
    if (event.request.url.includes('api.open-meteo.com')) return;
    if (event.request.url.includes('script.google.com')) return;
    if (event.request.url.includes('mongodb-api.com')) return;

    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) {
                // 背景更新
                fetch(event.request).then(res => {
                    if (res && res.ok) {
                        caches.open(CACHE_NAME).then(c => c.put(event.request, res.clone()));
                    }
                }).catch(() => {});
                return cached;
            }
            return fetch(event.request).then(res => {
                if (res && res.ok && res.type === 'basic') {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                }
                return res;
            }).catch(() => {
                // 離線 fallback
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
