/* Portfolio Analysis — Service Worker
 *
 * Strategy:
 *   - /api/* : network-only (passes through, SW doesn't intercept)
 *   - GET everything else: stale-while-revalidate against a runtime cache
 *   - Precache a tiny app shell (icons + manifest) so the app icon is always
 *     available once installed.
 *
 * Bump CACHE_VERSION when the shell changes to invalidate stale caches.
 */

const CACHE_VERSION = "v1";
const CACHE_NAME = `portfolio-optimizer-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-180.png",
  "/icon-512-maskable.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(() => {}),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((n) => n !== CACHE_NAME)
          .map((n) => caches.delete(n)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Don't touch API calls, cross-origin, or Next.js HMR/WebSocket endpoints.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;

  // Stale-while-revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(req);
      const networkPromise = fetch(req)
        .then((res) => {
          if (res && res.ok && res.type === "basic") {
            cache.put(req, res.clone());
          }
          return res;
        })
        .catch(() => cached);
      return cached || networkPromise;
    }),
  );
});
