/* Pulse Messenger — service worker
 * Provides installability + a lightweight offline shell.
 * Network-first for navigations and API calls (fresh data),
 * cache-first for static assets (icons, fonts, images).
 */

const CACHE_VERSION = 'pulse-v1'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`

const PRECACHE_URLS = ['/', '/icon.svg', '/icon-192.png', '/icon-512.png', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Only handle GET requests from the same origin.
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Never cache auth or realtime API responses — always go to the network.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request).catch(() => caches.match(request)))
    return
  }

  // Navigations: network-first, fall back to cached shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy))
          return response
        })
        .catch(() => caches.match(request).then((cached) => cached ?? caches.match('/'))),
    )
    return
  }

  // Static assets: cache-first with background refresh.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy))
          return response
        })
        .catch(() => cached)
      return cached ?? network
    }),
  )
})
