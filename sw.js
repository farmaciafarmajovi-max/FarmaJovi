const CACHE='farmajovi-v8-serena24h-20261112';
const CORE=['./','./index.html','./redesign.css?v=20261112-24h','./catalog.js?v=20261112','./website.js?v=20261112-24h','./site-insights.js?v=20261017-sernac','./manifest.webmanifest?v=9','./farmajovi-install-192.png','./farmajovi-install-512.png','./logo-farmajovi-header.jpg?v=20261015-2','./farmajovi-storefront.jpg','./farmajovi-interior.jpg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('farmajovi-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith(fetch(event.request).then(response=>{
  if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)))}
  return response;
 }).catch(()=>caches.open(CACHE).then(cache=>cache.match(event.request).then(cached=>cached||(event.request.mode==='navigate'?cache.match('./index.html'):Response.error())))));
});


