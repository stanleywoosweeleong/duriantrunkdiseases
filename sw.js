/* 榴莲树干病辨症 — service worker
 *
 * Update policy, in plain terms:
 *   - The HTML is fetched network-first. If you are online you always get the
 *     newest app; the cached copy is only a fallback for no signal.
 *   - Everything else (icons, manifest) is cache-first with a quiet background
 *     refresh, so the app opens instantly in the orchard.
 *   - A new worker does NOT take over silently. The page is told, and the
 *     farmer taps to reload — nothing is lost mid-diagnosis.
 *
 * Bump CACHE_VERSION on every deploy. That is the whole update mechanism.
 */
const CACHE_VERSION = 'dtd-v2026-08-30-15';
const CACHE = CACHE_VERSION;

const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest?v=2',
  './icons/icon-192.png?v=2',
  './icons/icon-512.png?v=2',
  './icons/maskable-192.png?v=2',
  './icons/maskable-512.png?v=2',
  './icons/apple-touch-icon.png?v=2',
  './icons/favicon-64.png?v=2',
  './icons/favicon-32.png?v=2'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // cache: 'reload' bypasses the HTTP cache so a deploy is never missed
    await cache.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' })));
    // do NOT skipWaiting here — the page decides when to switch over
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    if (self.registration.navigationPreload) {
      await self.registration.navigationPreload.enable();
    }
    await self.clients.claim();
  })());
});

// the page asks for the switch once the farmer taps "reload"
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'VERSION') {
    event.source && event.source.postMessage({ type: 'VERSION', version: CACHE_VERSION });
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // never touch third-party

  // HTML: network first, so an update lands the moment there is signal
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith((async () => {
      try {
        const preload = await event.preloadResponse;
        const fresh = preload || await fetch(req);
        // only a good response may become the offline copy — caching a 404 or a
        // Pages error page would strand the orchard on it, silently
        if (fresh && fresh.ok && fresh.type !== 'opaque') {
          const cache = await caches.open(CACHE);
          cache.put('./index.html', fresh.clone());
        }
        return fresh;
      } catch (err) {
        const cache = await caches.open(CACHE);
        return (await cache.match('./index.html')) || (await cache.match('./')) ||
               new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
      }
    })());
    return;
  }

  // everything else: cache first, refresh quietly behind it
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req);
    const network = fetch(req).then((res) => {
      if (res && res.status === 200 && res.type === 'basic') cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    return hit || (await network) ||
           new Response('', { status: 504, statusText: 'offline' });
  })());
});
