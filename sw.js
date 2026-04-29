// ══ SERVICE WORKER — Naposo HKBP Ujung Menteng ══
// Strategi: cache-first untuk asset statis, network-first untuk API Supabase

const CACHE_NAME = 'naposo-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/kalender.html',
  '/reversement.html',
  '/css/index.css',
  '/css/kalender.css',
  '/css/reversement.css',
  '/js/index.js',
  '/js/kalender.js',
  '/js/reversement.js',
  '/img/icon-192.png',
  '/img/icon-512.png',
  '/img/categories/ibadah.png',
  '/img/categories/latihan-choir.png',
  '/img/categories/Badminton.png',
  '/img/categories/Basket.png',
  'https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap'
];

// Install: pre-cache semua asset statis
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: hapus cache lama
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: strategi per request
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Supabase API → network-first, fallback tidak cache
  if (url.hostname.includes('supabase.co')) {
    e.respondWith(
      fetch(e.request).catch(() => new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' }
      }))
    );
    return;
  }

  // Google Fonts → cache-first
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

  // Asset lokal → cache-first, network fallback
  if (url.origin === self.location.origin) {
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
});
