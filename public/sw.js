const LEGACY_CACHES = ["finance-track-v1", "static-cache-v1", "dynamic-cache-v1"];

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      ...LEGACY_CACHES.map((name) => caches.delete(name)),
      self.registration.unregister(),
    ]).then(() => self.clients.claim()),
  );
});