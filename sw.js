/* Успешное Дело — light SW: shell only, never cache big video */
const CACHE = "ud-site-v19-video-full";
const PRECACHE = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/main.js",
  "./js/form-config.js",
  "./media/brand/logo-ud-mark.webp",
  "./media/brand/logo-ud-mark.png",
  "./media/hero/warehouse-still.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll(PRECACHE.map((u) => new Request(u, { cache: "reload" })))
      )
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try {
    url = new URL(req.url);
  } catch (_) {
    return;
  }
  if (url.origin !== self.location.origin) return;

  /* never intercept game / video / large media — go network */
  if (url.pathname.includes("/game/")) return;
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url.pathname)) return;

  const isHTML =
    req.mode === "navigate" ||
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith("/") ||
    (req.headers.get("accept") || "").includes("text/html");

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match("./index.html")))
    );
    return;
  }

  /* css/js/small images: stale-while-revalidate */
  const isStatic = /\.(css|js|png|jpe?g|webp|svg|ico|woff2?)(\?|$)/i.test(url.pathname);
  if (!isStatic) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok && (res.type === "basic" || res.type === "cors")) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
