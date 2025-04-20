// public/service-worker.js

const CACHE_NAME = "dt-hauling-cache-v1";
const urlsToCache = [
  "/submit-load",
  "/styles.css",
  "/dt-bg.png",
  "/login-bg.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
