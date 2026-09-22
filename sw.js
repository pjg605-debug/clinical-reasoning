const VERSION="clinical-reasoning-v14";
const CORE=[
  "./","./index.html","./assets/styles.css","./assets/app.js","./articles.json","./offline.html","./manifest.webmanifest",
  "./assets/icons/icon-192.png","./assets/icons/icon-512.png",
  "./articles/2026-09-23-gtps-lateral-hip.html",
  "./articles/2026-09-22-walking-leg-pain-stenosis.html",
  "./articles/2026-09-21-acute-neck-arm-tingling.html",
  "./articles/2026-09-20-knee-oa-posterior-pain.html",
  "./articles/2026-09-19-lateral-elbow.html",
  "./articles/2026-09-18-plantar.html","./articles/2026-09-18-shoulder.html",
  "./assets/briefs/2026-09-23-gtps-anatomy-painmap.svg","./assets/briefs/2026-09-23-gtps-exam-sequence.svg",
  "./assets/briefs/2026-09-22-lss-painmap.svg","./assets/briefs/2026-09-22-lss-walk-test.svg","./assets/briefs/2026-09-22-lss-outcomes.svg",
  "./assets/briefs/2026-09-21-neck-painmap.svg","./assets/briefs/2026-09-21-neck-exam-sequence.svg",
  "./assets/briefs/plantar-painmap-v4.jpg","./assets/briefs/plantar-exams-v4.jpg",
  "./assets/briefs/shoulder-painmap-v4.jpg","./assets/briefs/shoulder-exams-v4.jpg",
  "./assets/briefs/elbow-painmap-v4.jpg","./assets/briefs/elbow-exams-v4.jpg",
  "./assets/briefs/knee-painmap-v4.jpg","./assets/briefs/knee-exams-v4.jpg"
];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("clinical-reasoning-v")&&k!==VERSION).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

async function networkResponse(req,cacheKey=req){
  const res=await fetch(req);
  if(!res.ok)throw new Error("HTTP "+res.status);
  const cache=await caches.open(VERSION);
  await cache.put(cacheKey,res.clone());
  return res;
}

self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET")return;
  const url=new URL(req.url);
  const scope=new URL(self.registration.scope);
  if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;

  if(req.mode==="navigate"){
    event.respondWith(
      networkResponse(req).catch(async()=>{
        const cache=await caches.open(VERSION);
        const isShell=url.pathname===scope.pathname||url.pathname===scope.pathname+"index.html";
        return (await cache.match(req))||(isShell&&await cache.match("./index.html"))||(await cache.match("./offline.html"));
      })
    );
    return;
  }

  if(url.pathname.endsWith("/articles.json")||url.pathname.includes("/articles/")||url.pathname.endsWith("/manifest.webmanifest")){
    event.respondWith(
      networkResponse(req).catch(async()=>{
        const cache=await caches.open(VERSION);
        return (await cache.match(req))||Response.error();
      })
    );
    return;
  }

  const cached=caches.open(VERSION).then(cache=>cache.match(req));
  const network=networkResponse(req).catch(async()=>(await cached)||Response.error());
  event.waitUntil(network.then(()=>{}));
  event.respondWith(cached.then(res=>res||network));
});
