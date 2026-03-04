const CACHE_NAME = "donor-match-v1";
const STATIC_ASSETS = ["/", "/index.html"];

// Install — cache shell
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — network-first for API, cache-first for static
self.addEventListener("fetch", (e) => {
  const { request } = e;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // API calls — network only (don't cache dynamic data)
  if (request.url.includes("/api/")) {
    e.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  // Static assets — cache-first
  e.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          // Update cache with new version
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
