/* Amiyo Editor - offline support. Keep this file in the same folder as the editor's .html file.
   Network first (so a new step is picked up as soon as you are online), cached copy when offline. Media you import is never cached here. */
const CACHE = 'amiyo-editor-v1';
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('message', function(e){
  var d = e.data || {};
  if (d.type === 'cache-page' && d.url) e.waitUntil(caches.open(CACHE).then(function(c){ return fetch(d.url, {cache:'reload'}).then(function(r){ if (r && r.ok) return c.put(d.url, r); }); }).catch(function(){}));
});
function timeout(ms){ return new Promise(function(_, rej){ setTimeout(function(){ rej(new Error('timeout')); }, ms); }); }
self.addEventListener('fetch', function(e){
  var r = e.request;
  if (r.method !== 'GET' || r.headers.has('range')) return;
  var u = new URL(r.url);
  var font = /(^|\.)(fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(u.host);
  if (u.origin !== location.origin && !font) return;
  if (/\.(mp4|mov|webm|mkv|avi|mp3|wav|m4a|aac|ogg)$/i.test(u.pathname)) return;
  if (font) {
    e.respondWith(caches.open(CACHE).then(function(c){ return c.match(r).then(function(hit){
      var net = fetch(r).then(function(res){ if (res && (res.ok || res.type === 'opaque')) c.put(r, res.clone()); return res; }).catch(function(){ return hit; });
      return hit || net;
    }); }));
    return;
  }
  e.respondWith(caches.open(CACHE).then(function(c){
    return Promise.race([fetch(r), timeout(r.mode === 'navigate' ? 5000 : 8000)]).then(function(res){
      if (res && res.ok) c.put(r, res.clone());
      return res;
    }).catch(function(){
      return c.match(r, {ignoreSearch: true}).then(function(hit){ return hit || fetch(r); });
    });
  }));
});
