const CACHE_NAME = "kalja-xyz-cache-v1";
const urlsToCache = [
  "/",
  "/cards/english.json",
  "/cards/finnish.json",
  "/locales/english.json",
  "/locales/finnish.json"
];


self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache)),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request)),
  );
});
