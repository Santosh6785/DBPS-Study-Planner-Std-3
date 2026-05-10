// ── Study Planner PWA – Service Worker ──────────────────
const CACHE = "studyplan-v2";

// Only cache local files — NO external URLs
const LOCAL_FILES = [
  "./index.html",
  "./data.js",
  "./app.js",
  "./manifest.json",
  "./icon-192.svg",
  "./icon-512.svg",
  "./icon-180.png",
];

// ── Install: pre-cache all local assets ─────────────────
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(LOCAL_FILES))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: delete old caches ──────────────────────────
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch strategy ───────────────────────────────────────
self.addEventListener("fetch", e => {
  const url = e.request.url;

  // Skip non-GET requests
  if (e.request.method !== "GET") return;

  // External URLs (Google Fonts, CDNs): network-first, no caching
  if (!url.startsWith(self.location.origin)) {
    e.respondWith(
      fetch(e.request).catch(() => new Response("", { status: 408 }))
    );
    return;
  }

  // Local files: cache-first, fallback to network, fallback to index.html
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200) return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
