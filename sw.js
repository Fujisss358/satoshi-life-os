// SATOSHI LIFE OS Service Worker
// Version: v20260530-0804  ← deploy.sh が自動書き換え
const SW_VERSION = "v20260530-0804";
const CACHE_NAME = "satoshi-life-os-" + SW_VERSION;
const OFFLINE_URL = "./";

// キャッシュするアセット（初回インストール時）
const PRECACHE = ["./"];

self.addEventListener("install", (event) => {
  console.log("[SW] Installing version:", SW_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  // 新しいSWをすぐに有効化（待機しない）
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating version:", SW_VERSION);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          })
      )
    ).then(() => {
      // すぐに全クライアントを制御下に置く → controllerchange が発火してページが自動リロード
      return self.clients.claim();
    })
  );
});

// アプリからの SKIP_WAITING メッセージを受け取って即時切り替え
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // Supabase・外部API・画像CDNはキャッシュしない（常にネットワーク）
  if (
    url.includes("supabase.co") ||
    url.includes("anthropic.com") ||
    url.includes("unsplash.com") ||
    url.includes("wikimedia.org") ||
    url.includes("googleapis.com") ||
    url.includes("jsdelivr.net") ||
    url.includes("fonts.g") ||
    !url.startsWith("https://fujisss358.github.io")
  ) {
    return; // デフォルト（ネットワーク直接）
  }

  // HTMLファイル（index.html / ルート）はネットワーク優先
  if (
    event.request.mode === "navigate" ||
    url.endsWith("/") ||
    url.endsWith("index.html")
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // その他：キャッシュ優先（ガイド画像など）
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
