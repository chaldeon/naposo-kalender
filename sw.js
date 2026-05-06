// ══ SERVICE WORKER — Naposo HKBP Ujung Menteng ══
// Strategi: network-first untuk HTML, CSS, JS — cache-first untuk gambar & font

// ⚠️ Bump versi ini setiap deploy agar cache lama dihapus
const CACHE_NAME = 'naposo-v6';
const STATIC_ASSETS = [
  '/css/index.css',
  '/css/kalender.css',
  '/css/reversement.css',
  '/js/index.js',
  '/js/kalender.js',
  '/js/reversement.js',
  '/img/icon-192.png',
  '/img/icon-512.png',
  '/img/categories/ibadah.png',
  '/img/categories/ibadah-gabungan.png',
  '/img/categories/koor.png',
  '/img/categories/koor-gabungan.png',
  '/img/categories/latihan-koor.png',
  '/img/categories/latihan-koor-gabungan.png',
  '/img/categories/badminton.png',
  '/img/categories/basket.png',
  '/img/categories/futsal.png',
  '/img/categories/renang.png',
  '/img/categories/doa.png',
  '/img/categories/reversement.png',
  '/img/categories/ulang-tahun.png',
  'https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap'
];

// Install: pre-cache asset statis — pakai cache:'reload' agar dapat versi terbaru dari server
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(
        STATIC_ASSETS.map(url =>
          fetch(url, { cache: 'reload' })
            .then(res => { if (res.ok) cache.put(url, res); })
            .catch(() => {})
        )
      ))
      .then(() => self.skipWaiting())
  );
});

// Activate: hapus cache lama, ambil alih semua tab
// client.navigate() dihapus — tidak perlu reload paksa, clients.claim() sudah cukup
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch: strategi per request
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Supabase API → network-only, fallback array kosong
  if (url.hostname.includes('supabase.co')) {
    e.respondWith(
      fetch(e.request).catch(() => new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' }
      }))
    );
    return;
  }

  // Google Fonts → cache-first (font jarang berubah)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      }))
    );
    return;
  }

  if (url.origin === self.location.origin) {
    const isImage = /\.(png|jpe?g|gif|webp|svg|ico)$/i.test(url.pathname);

    if (isImage) {
      // Gambar → cache-first (jarang berubah, hemat bandwidth)
      e.respondWith(
        caches.match(e.request).then(cached => {
          if (cached) return cached;
          return fetch(e.request).then(res => {
            if (res.ok) {
              const clone = res.clone();
              caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
            }
            return res;
          });
        })
      );
      return;
    }

    // HTML, CSS, JS → network-first dengan cache:'reload' agar bypass browser HTTP cache,
    // timeout 3 detik, fallback ke SW cache
    const networkRequest = new Request(e.request.url, {
      cache: 'reload',
      headers: e.request.headers,
      mode: e.request.mode === 'navigate' ? 'navigate' : e.request.mode,
      credentials: e.request.credentials,
      redirect: e.request.redirect
    });

    e.respondWith(
      Promise.race([
        fetch(networkRequest).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
          return res;
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      ]).catch(() => caches.match(e.request))
    );
  }
});
