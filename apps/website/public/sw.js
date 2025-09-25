const CACHE_NAME = "skyhelper-v1";
const RUNTIME = "runtime";

// max entries to prevent too much cache
const MAX_RUNTIME_ENTRIES = 50;

const PRECACHE_URLS = ["/", "/offline.html", "/boticon.png", "/icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME];
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (!currentCaches.includes(key)) return caches.delete(key);
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// network-first for navigation and API routes that must be fresh
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(RUNTIME);
    cache.put(request, response.clone());

    try {
      await trimCache(RUNTIME, MAX_RUNTIME_ENTRIES);
    } catch {
      /* ignore */
    }
    return response;
  } catch {
    const cache = await caches.match(request);
    if (cache) return cache;
    return caches.match("/offline.html");
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  const cache = await caches.open(RUNTIME);
  cache.put(request, response.clone());

  try {
    await trimCache(RUNTIME, MAX_RUNTIME_ENTRIES);
  } catch {
    /* ignore */
  }
  return response;
}

// Trim a cache to at most `maxItems` entries by deleting the oldest entries first.
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxItems) return;
  const deleteCount = keys.length - maxItems;
  for (let i = 0; i < deleteCount; i++) {
    try {
      await cache.delete(keys[i]);
    } catch {
      /* ignore */
    }
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET
  if (request.method !== "GET") return;

  if (url.pathname.startsWith("/api/commands")) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.pathname === "/commands") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(request));
  }
});
