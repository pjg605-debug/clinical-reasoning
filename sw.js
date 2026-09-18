const VERSION="clinical-reasoning-v4";
const CORE=[
  "./","./index.html","./assets/styles.css","./assets/app.js","./articles.json","./offline.html",
  "./assets/icons/icon-192.png","./assets/icons/icon-512.png",
  "./articles/2026-09-19-lateral-elbow.html",
  "./articles/2026-09-18-plantar.html","./articles/2026-09-18-shoulder.html"
];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET")return;
  const url=new URL(req.url);
  if(url.origin!==location.origin)return;

  if(req.mode==="navigate"){
    event.respondWith(
      fetch(req).then(res=>{
        const copy=res.clone();
        caches.open(VERSION).then(c=>c.put("./index.html",copy));
        return res;
      }).catch(async()=>{
        return (await caches.match("./index.html"))||(await caches.match("./offline.html"));
      })
    );
    return;
  }

  if(url.pathname.endsWith("/articles.json")||url.pathname.includes("/articles/")){
    event.respondWith(
      fetch(req).then(res=>{
        const copy=res.clone();
        caches.open(VERSION).then(c=>c.put(req,copy));
        return res;
      }).catch(()=>caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached=>{
      const network=fetch(req).then(res=>{
        const copy=res.clone();
        caches.open(VERSION).then(c=>c.put(req,copy));
        return res;
      }).catch(()=>cached);
      return cached||network;
    })
  );
});