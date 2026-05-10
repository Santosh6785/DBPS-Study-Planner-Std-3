const CACHE = "studyplan-v4";
const LOCAL_FILES = [
  "./index.html","./data.js","./app.js",
  "./manifest.json","./icon-192.svg","./icon-512.svg","./icon-180.png",
];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(LOCAL_FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  if(!e.request.url.startsWith(self.location.origin)){
    e.respondWith(fetch(e.request).catch(()=>new Response("",{status:408})));return;
  }
  e.respondWith(caches.match(e.request).then(cached=>{
    if(cached)return cached;
    return fetch(e.request).then(res=>{
      if(!res||res.status!==200)return res;
      caches.open(CACHE).then(c=>c.put(e.request,res.clone()));return res;
    }).catch(()=>caches.match("./index.html"));
  }));
});
