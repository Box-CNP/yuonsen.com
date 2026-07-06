/* お湯から、探す。— Service Worker(PWA: ホーム画面追加＋オフライン殻) */
const CACHE = 'oyu-v2';
const SHELL = [
  '/', '/index.html', '/app-config.js', '/manifest.json',
  '/onsen-photos/db/site_photos.js', '/onsen-photos/db/placeholders.js',
  '/icons/icon-192.png', '/icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  /* 外部(Supabase API / CDN / フォント)は SW を通さずネットワーク直行 */
  if (url.origin !== location.origin) return;

  /* ナビゲーション: ネット優先・オフラインなら殻を返す */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((r) => { if(r.ok){ const cp = r.clone(); caches.open(CACHE).then((c) => c.put('/', cp)); } return r; })
        .catch(() => caches.match('/').then((r) => r || caches.match('/index.html')))
    );
    return;
  }

  /* 同一オリジンの静的アセット: キャッシュ優先・裏で更新(正常レスポンスのみ保存) */
  e.respondWith(
    caches.match(req).then((cached) =>
      cached || fetch(req).then((r) => { if(r.ok){ const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); } return r; })
    )
  );
});
