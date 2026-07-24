const CACHE_NAME = 'open-campus-ar-waiting-game-v9';
const CORE_ASSETS = [
  './',
  './index.html',
  './ar.html',
  './collection.html',
  './game.html',
  './ranking.html',
  './css/common.css',
  './css/ar.css',
  './css/game.css',
  './js/dinosaurs.js',
  './js/collection.js',
  './js/preload.js',
  './js/ar-main.js',
  './js/collection-page.js',
  './js/game-assets/p5.js',
  './js/game-assets/class.js',
  './js/game-assets/sketch.js',
  './js/ranking.js',
  './js/ranking-page.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // SupabaseのAPIレスポンスは絶対にキャッシュしない。
  // ランキング削除後に古い記録が残って見える問題を防ぐ。
  if (url.hostname.endsWith('.supabase.co')) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  const isHtml = request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/');

  if (isHtml || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    event.respondWith(
      fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
        return response;
      }).catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
        return response;
      });
    })
  );
});
