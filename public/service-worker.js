// public/service-worker.js

const CACHE_NAME = "dt-hauling-cache-v3";
const urlsToCache = [
  "/submit-load",
  "/dt-bg.png",
  "/login-bg.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-forms") {
    event.waitUntil(syncOfflineForms());
  }
});

async function syncOfflineForms() {
  const forms = JSON.parse(await localforage.getItem("offlineForms") || "[]");
  if (!forms.length) return;

  const remaining = [];

  for (const form of forms) {
    try {
      const res = await fetch(form.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams(form.data)
      });
      if (!res.ok) throw new Error("Server error");
    } catch (err) {
      remaining.push(form);
    }
  }

  await localforage.setItem("offlineForms", JSON.stringify(remaining));

  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: "sync-complete", count: remaining.length });
    });
  });
}

self.addEventListener("message", (event) => {
  if (event.data?.type === "store-form") {
    storeOfflineForm(event.data);
  }
});

async function storeOfflineForm(formData) {
  const current = JSON.parse(await localforage.getItem("offlineForms") || "[]");
  current.push(formData);
  await localforage.setItem("offlineForms", JSON.stringify(current));
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: "queue-update", count: current.length });
  });

  // Display sync banner message
  clients.forEach(client => {
    client.postMessage({
      type: "show-banner",
      message: `⏳ ${current.length} load(s) waiting to sync`
    });
  });
} 
