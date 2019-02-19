const version = 1;
const cacheStorageKey = "testCache-" + version;

// 这是需要预缓存的资源，也可以是appshell,可以通过webpack的插件来生成
const cacheList = ["/", "index.html", "main.css", "e.png", "pwa-fonts.png"];

// 注册成功的时候，以版本名为key主动缓存静态资源
self.addEventListener("install", function(e) {
  console.log("Cache event!");
  e.waitUntil(
    caches.open(cacheStorageKey).then(function(cache) {
      console.log("Adding to Cache:", cacheList);
      return cache.addAll(cacheList);
    })
    // .then(function() {
    //   // 注册成功跳过等待，酌情处理
    //   // console.log('Skip waiting!')
    //   // return self.skipWaiting()
    // })
  );
});

// 当新的serviceWorker被激活时，删除旧版本的缓存
self.addEventListener("activate", event => {
  console.log("Activate event");
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return cacheNames.filter(cacheName => cacheStorageKey !== cacheName);
      })
      .then(cachesToDelete => {
        return Promise.all(
          cachesToDelete.map(cacheToDelete => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => {
        console.log("Clients claims.");
        // 立即接管所有页面，酌情处理
        // 会导致新的sw接管旧的页面，同时旧版本的缓存已被清空
        self.clients.claim();
      })
  );
});

// 发起请求时去根据uri去匹配缓存，无法命中缓存则发起请求
self.addEventListener("fetch", function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});

self.addEventListener("message", event => {
  if (event.data === "skipWaiting") {
    console.log("Skip waiting!");
    self.skipWaiting();
  }
});


// self.clients.matchAll().then(function(clients) {
//   if (clients && clients.length) {
//     clients.forEach(function(client) {
//       client.postMessage("msg");
//     });
//   }
// });
