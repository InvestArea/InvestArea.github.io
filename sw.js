/**
 * InvestArea — Qarabağ Aqro İnvestisiya Portalı Service Worker (PWA)
 * Tam Oflayn Dəstək, Ağıllı Keşləmə və Şəbəkə Bərpa Sinxronizasiyası
 */

const CACHE_STATIC_NAME = 'investarea-static-v2';
const CACHE_API_NAME = 'investarea-api-v2';
const CACHE_TILES_NAME = 'investarea-tiles-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/portal',
  '/register.html',
  '/admin.html',
  '/admin-parcels.html',
  '/admin-documents.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/css/style.css',
  '/css/admin.css',
  '/js/app.js',
  '/js/admin.js',
  '/js/pwa.js',
  '/images/pwa-icon.svg',
  '/images/pwa-icon-192.png',
  '/images/pwa-icon-512.png',
  '/images/apple-touch-icon.png',
  '/gis/karabakh_districts.geojson',
  '/gis/karabakh_settlements.geojson',
  '/gis/azerbaijan_villages_adm3.geojson',
  '/gis/water_resources.geojson',
  '/gis/economic_zones.geojson'
];

// 1. QURAŞDIRILMA (INSTALL): Bütün zəruri resursları əvvəlcədən keşlə
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then((cache) => {
      // Core resursları keşləyirik, xəta verənləri keçirik
      return Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[PWA SW] Pre-cache xətası (${url}):`, err.message);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// 2. AKTİVLƏŞDİRMƏ (ACTIVATE): Köhnə keşləri təmizlə və dərhal nəzarəti ələ al
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_API_NAME && key !== CACHE_TILES_NAME) {
            console.log('[PWA SW] Köhnə keş təmizlənir:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH STRATEGİYALARI (Network First / Cache First / Offline Fallbacks)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // POST, PUT, DELETE sorğuları keşlənə bilməz - birbaşa şəbəkəyə
  if (req.method !== 'GET') {
    return;
  }

  // A. API SORĞULARI: Network-First with Cache Fallback (Əvvəlcə Şəbəkə, Yoxdursa Keş)
  if (url.pathname.startsWith('/api/v1/')) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_API_NAME).then((cache) => {
              cache.put(req, clone);
            });
          }
          return networkRes;
        })
        .catch(async () => {
          // İnternet kəsilib - Keşlənmiş cavabı tap
          const cachedRes = await caches.match(req);
          if (cachedRes) {
            const headers = new Headers(cachedRes.headers);
            headers.append('X-InvestArea-Offline-Source', 'CacheAPI');
            return new Response(cachedRes.body, {
              status: cachedRes.status,
              statusText: cachedRes.statusText,
              headers: headers
            });
          }

          // Əgər dəqiq sorğu tapılmadısa və axtarış və ya sahədirsə, ümumi sahələr keşini qaytar
          if (url.pathname === '/api/v1/search' || url.pathname === '/api/v1/parcels') {
            const fallbackParcels = await caches.match('/api/v1/parcels');
            if (fallbackParcels) return fallbackParcels;
          }

          return new Response(JSON.stringify({
            offline: true,
            message: "Oflayn rejim: İnternet bağlantısı yoxdur. Məlumatlar yerli yaddaşdan təqdim olunur."
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
          });
        })
    );
    return;
  }

  // B. XƏRİTƏ TAYLLARI (OpenStreetMap, Google Maps, ESRI)
  if (url.hostname.includes('tile.openstreetmap.org') ||
      url.hostname.includes('mt1.google.com') ||
      url.hostname.includes('arcgisonline.com')) {
    event.respondWith(
      caches.match(req).then((cachedTile) => {
        if (cachedTile) return cachedTile;
        return fetch(req)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              const clone = networkRes.clone();
              caches.open(CACHE_TILES_NAME).then((cache) => cache.put(req, clone));
            }
            return networkRes;
          })
          .catch(() => {
            // Şəbəkə yoxdur və tayl keşdə yoxdur: şəffaf 1x1 və ya qrid SVG qaytar
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#0f172a" fill-opacity="0.3"/><line x1="0" y1="0" x2="256" y2="256" stroke="#10b981" stroke-opacity="0.1"/><text x="128" y="132" font-size="12" fill="#64748b" text-anchor="middle">Oflayn Xəritə</text></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          });
      })
    );
    return;
  }

  // C. STATİK RESURSLAR (GeoJSON, CSS, JS, Şəkillər, Şriftlər): Cache-First with Network Fallback
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      if (cachedRes) {
        // Fon yenilənməsi (Stale-While-Revalidate)
        fetch(req).then((freshRes) => {
          if (freshRes && freshRes.status === 200) {
            caches.open(CACHE_STATIC_NAME).then((cache) => cache.put(req, freshRes));
          }
        }).catch(() => {});
        return cachedRes;
      }

      return fetch(req).then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_STATIC_NAME).then((cache) => cache.put(req, clone));
        }
        return networkRes;
      }).catch(async () => {
        // Navigasiya sorğusudursa (HTML səhifə), index.html qaytar
        if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
          const fallback = await caches.match('/index.html') || await caches.match('/portal');
          if (fallback) return fallback;
        }
        return new Response('Oflayn Resurs Əlçatmazdır', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
