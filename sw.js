const CACHE_NAME = 'gold-tool-v2';
const ASSETS = ['./', './index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // 1) 价格/汇率 API：永远走实时网络，绝不缓存（否则价格会冻结）
  if (
    url.includes('gold-api.com') ||
    url.includes('er-api.com') ||
    url.includes('goldprice.org') ||
    url.includes('exchangerate')
  ) {
    e.respondWith(fetch(e.request));
    return;
  }

  // 2) 页面导航 / index.html：network-first，拿到就刷新缓存；断网才回退缓存
  if (e.request.mode === 'navigate' || url.endsWith('/index.html') || url.endsWith('/')) {
    e.respondWith(
      fetch(e.request)
        .then(resp => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy));
          return resp;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // 3) 其他静态资源（manifest/icon）：cache-first
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});
