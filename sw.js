const VERSION="clinical-reasoning-v11";
const CORE=[
  "./","./index.html","./assets/styles.css","./assets/app.js","./articles.json","./offline.html",
  "./assets/icons/icon-192.png","./assets/icons/icon-512.png",
  "./articles/2026-09-21-acute-neck-arm-tingling.html",
  "./articles/2026-09-20-knee-oa-posterior-pain.html",
  "./articles/2026-09-19-lateral-elbow.html",
  "./articles/2026-09-18-plantar.html","./articles/2026-09-18-shoulder.html",
  "./assets/briefs/2026-09-21-neck-painmap.svg","./assets/briefs/2026-09-21-neck-exam-sequence.svg",
  "./assets/briefs/plantar-painmap-v4.jpg","./assets/briefs/plantar-exams-v4.jpg",
  "./assets/briefs/shoulder-painmap-v4.jpg","./assets/briefs/shoulder-exams-v4.jpg",
  "./assets/briefs/elbow-painmap-v4.jpg","./assets/briefs/elbow-exams-v4.jpg",
  "./assets/briefs/knee-painmap-v4.jpg","./assets/briefs/knee-exams-v4.jpg"
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