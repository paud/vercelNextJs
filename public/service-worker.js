// 自定义 Service Worker for Next.js + next-pwa
const CACHE_NAME = "my-app-cache-v1";
const OFFLINE_URL = "/offline.html"; // 离线备用页面

// 预缓存核心文件
const PRECACHE_URLS = [
  "/",
  "/offline.html",
  "/favicon.ico",
  "/manifest.json",
];

// 安装阶段，缓存文件
self.addEventListener("install", (event) => {
  console.log("[SW] Install event");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting(); // 立即激活新 SW
});

// 激活阶段，清理旧缓存
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate event");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // 立即控制页面
});

// 只缓存静态资源，API请求不缓存
function isStaticAsset(request) {
  const url = request.url;
  return (
    url.endsWith('.js') ||
    url.endsWith('.css') ||
    url.endsWith('.png') ||
    url.endsWith('.jpg') ||
    url.endsWith('.jpeg') ||
    url.endsWith('.svg') ||
    url.endsWith('.ico') ||
    url.endsWith('.webp') ||
    url.endsWith('.woff') ||
    url.endsWith('.woff2') ||
    url.endsWith('.ttf') ||
    url.endsWith('.eot') ||
    url.endsWith('.otf') ||
    url.endsWith('.json') ||
    url.endsWith('.html') ||
    url.endsWith('/')
  );
}

// 拦截请求
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  // 不缓存 API 请求
  if (event.request.url.includes('/api/')) return;
  if (!isStaticAsset(event.request)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 如果请求成功，更新缓存
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() =>
        // 请求失败（例如离线），从缓存取
        caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          // 如果缓存没有，再返回离线页面
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }
        })
      )
  );
});
