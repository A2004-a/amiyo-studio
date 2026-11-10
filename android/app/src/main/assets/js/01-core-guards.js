/* Amiyo Studio - 01-core-guards.js */
/* Head & core performance guards and throttlers */
/* Scripts 0 to 38 */


;
/* ==================== Script 0 id="am-perf-resize" ==================== */
/* Lag fix: ~70 handlers listen to "resize" and many scripts fire it. Each handler now runs at once for a single event but at most
   every 120 ms during a burst (last event always delivered). Nothing is removed; handlers just stop running dozens of times per second. */
(function(){"use strict";
if(window.__amPerfResize) return; window.__amPerfResize=1;
var add=window.addEventListener, rem=window.removeEventListener, map=new WeakMap(), GAP=120;
function wrap(fn){
  var last=0, timer=0, pend=null;
  return function(e){
    var now=Date.now();
    if(!timer && now-last>=GAP){ last=now; return fn.call(this,e); }
    pend=e; var self=this;
    if(!timer) timer=setTimeout(function(){ timer=0; last=Date.now(); try{ fn.call(self,pend); }catch(err){ try{console.error(err);}catch(x){} } },Math.max(10,GAP-(now-last)));
  };
}
window.addEventListener=function(t,fn,o){
  if(t==="resize"&&typeof fn==="function"&&!(o&&typeof o==="object"&&o.once)){
    var cap=(o===true)||(o&&o.capture)||false, m=map.get(fn); if(!m){ m={}; map.set(fn,m); }
    var k=cap?"c":"b"; if(!m[k]) m[k]=wrap(fn);
    return add.call(this,t,m[k],o);
  }
  return add.apply(this,arguments);
};
window.removeEventListener=function(t,fn,o){
  if(t==="resize"&&typeof fn==="function"){ var m=map.get(fn), cap=(o===true)||(o&&o.capture)||false; if(m&&m[cap?"c":"b"]) return rem.call(this,t,m[cap?"c":"b"],o); }
  return rem.apply(this,arguments);
};
})();

;
/* ==================== Script 1 id="am-lag-ro" ==================== */
/* Lag step 3: 19 ResizeObservers re-measure the layout together. Each one now reports at once for the first change and at most ~12 times a second
   after that (latest size always delivered). Same observers, same callbacks, nothing removed. */
(function(){"use strict";
var RO=window.ResizeObserver; if(!RO||window.__amRO) return; window.__amRO=1;
var P=function(cb){
  var self=this, last=0, timer=0, ents=new Map(), ro;
  function flush(){ timer=0; last=performance.now(); if(!ents.size) return; var a=Array.from(ents.values()); ents.clear(); try{ cb.call(self,a,self); }catch(e){ try{console.error(e);}catch(x){} } }
  ro=new RO(function(list){ for(var i=0;i<list.length;i++) ents.set(list[i].target,list[i]);
    if(timer) return; var gap=performance.now()-last; if(gap>=80){ flush(); } else timer=setTimeout(flush,80-gap); });
  this.observe=function(t,o){ return ro.observe(t,o); }; this.unobserve=function(t){ ents.delete(t); return ro.unobserve(t); };
  this.disconnect=function(){ clearTimeout(timer); timer=0; ents.clear(); return ro.disconnect(); };
};
P.prototype=RO.prototype; window.ResizeObserver=P;
})();

;
/* ==================== Script 2 id="am-fast-boot" ==================== */
/* Fast start: the page shell + an "Opening editor" screen appear first; the editor's ~1,580 inline scripts then run in the SAME ORDER,
   in short slices (about 10 ms) so the phone can paint and respond in between. Nothing is removed or reordered.
   Safe mode (runs everything the old way): add ?nodefer to the address, or run  localStorage.setItem("amiyo.nodefer","1")  and reload. */
(function(){"use strict";
var D=document, W=window; if(W.__amFB) return; W.__amFB=1;
var safe=false; try{ safe=localStorage.getItem("amiyo.nodefer")==="1"||/[?&]nodefer\b/.test(location.search); }catch(e){}
var nAddW=W.addEventListener, nRemW=W.removeEventListener, nAddD=D.addEventListener, nRemD=D.removeEventListener;
var holding=false, finished=false, loadFired=false, dclFired=false, queue=[];
nAddW.call(W,"load",function(){ loadFired=true; },true);
function qlate(target,t,fn,o){ queue.push({target:target,t:t,fn:fn,o:o}); }
function mkAdd(target,native){ return function(t,fn,o){
  if((t==="load"||t==="DOMContentLoaded")&&typeof fn==="function"){
    if(holding){ qlate(target,t,fn,o); return; }
    if(finished&&((t==="load"&&loadFired)||(t==="DOMContentLoaded"&&dclFired))){ setTimeout(function(){ try{ fn.call(target,new Event(t)); }catch(e){ try{console.error(e);}catch(x){} } },0); return; }
  }
  return native.apply(this||target,arguments); }; }
function mkRem(target,native){ return function(t,fn){
  if(t==="load"||t==="DOMContentLoaded"){ for(var i=queue.length-1;i>=0;i--) if(queue[i].t===t&&queue[i].fn===fn&&queue[i].target===target) queue.splice(i,1); }
  return native.apply(this||target,arguments); }; }
W.addEventListener=mkAdd(W,nAddW); W.removeEventListener=mkRem(W,nRemW);
D.addEventListener=mkAdd(D,nAddD); D.removeEventListener=mkRem(D,nRemD);
function cover(){ return D.getElementById("amBoot"); }
function bar(p){ try{ var b=D.getElementById("amBootBar"); if(b) b.style.width=Math.min(100,Math.round(p*100))+"%"; var c=cover(); if(c&&c.__t) c.__t.textContent="Opening editor… "+Math.min(99,Math.round(p*100))+"%"; }catch(e){} }
var ch=null, cb=null; try{ ch=new MessageChannel(); ch.port1.onmessage=function(){ var f=cb; cb=null; if(f) f(); }; }catch(e){}
function yieldTo(f){ if(ch){ cb=f; ch.port2.postMessage(0); } else setTimeout(f,0); }
var times=[];
function exec(n,idx){ var a=performance.now(); try{ if(!n.parentNode) return; var s=D.createElement("script"); if(n.id) s.id=n.id; s.text=n.text; n.parentNode.replaceChild(s,n); }catch(e){ try{console.error(e);}catch(x){} } times.push([n.id||("inline #"+idx),performance.now()-a,(n.text||"").length]); }
function report(){
  var sum=0; times.forEach(function(x){ sum+=x[1]; }); var top=times.slice().sort(function(a,b){return b[1]-a[1];}).slice(0,8).map(function(x){ return [x[0],Math.round(x[1]),x[2]]; });
  var r={readyAtMs:Math.round(performance.now()),scriptsMs:Math.round(sum),count:times.length,top:top};
  try{ W.AM_FASTBOOT.timing=r; localStorage.setItem("amiyo.boot.v1",JSON.stringify(r)); }catch(e){} return r; }
function done(){
  report(); holding=false; finished=true; var q=queue; queue=[]; var i=0;
  function fire(){ var t0=performance.now();
    while(i<q.length){ var e=q[i++];
      if(e.t==="load"&&!loadFired){ nAddW.call(W,"load",e.fn,e.o); continue; }
      try{ e.fn.call(e.target,new Event(e.t)); }catch(err){ try{console.error(err);}catch(x){} }
      if(performance.now()-t0>10&&i<q.length) return yieldTo(fire); }
    uncover(); }
  fire(); }
function uncover(){ var c=cover(); if(!c) return; var n=0;
  (function w(){ if(!window.__amiyoBooted&&++n<60) return setTimeout(w,100);
    c.style.opacity="0"; setTimeout(function(){ try{ c.remove(); }catch(e){} },260); })(); }
function start(){
  dclFired=true;
  var nodes=Array.prototype.slice.call(D.querySelectorAll('script[type="text/x-am-defer"]')), total=nodes.length, i=0;
  holding=true; try{ W.AM_FASTBOOT={total:total,safe:safe}; }catch(e){}
  function step(){ var t0=performance.now();
    while(i<total){ exec(nodes[i],i); i++; if(!safe&&performance.now()-t0>10){ bar(i/total); return yieldTo(step); } }
    bar(1); done(); }
  step(); }
setTimeout(function(){ if(!finished&&cover()&&(performance.now()>60000)){ try{ cover().remove(); }catch(e){} } },61000);   /* last-resort: never leave the cover up */
if(D.readyState==="loading") nAddD.call(D,"DOMContentLoaded",function(){ setTimeout(start,0); }); else setTimeout(start,0);
})();

;
/* ==================== Script 3 id="amiyo-export16-edit-lock" ==================== */
/* Export plan step 16: while an export is running the project is frozen. The full-screen export card already stopped the mouse, but keys
   still reached the editor: Delete removed a clip, Ctrl+Z undid, Ctrl+D copied, M added a marker, I and O moved In and Out, Space started
   playback, all under the running export (and into autosave afterwards). This listener runs first (head, capture) and keeps those keys away
   from the editor. Esc, Tab and Enter/Space on the export card's own buttons still work. */
(function(){try{
  if(window.__x16lock) return; window.__x16lock=1;
  var lastToast=0;
  function exporting(){ try{ return !!(window.__amiyoExporting||window.__amExporting); }catch(e){ return false; } }
  window.addEventListener("keydown",function(e){
    if(!exporting()) return;
    var k=e.key;
    if(k==="Escape"||k==="Tab"||k==="Shift"||k==="Control"||k==="Alt"||k==="Meta"||k==="CapsLock"||k==="AltGraph") return;
    var t=e.target;
    if((k==="Enter"||k===" ")&&t&&t.tagName==="BUTTON"&&t.closest&&t.closest("#amExp")) return;   /* a focused Pause / Cancel button of the export card */
    e.stopImmediatePropagation();
    var mod=e.ctrlKey||e.metaKey||e.altKey, plain=k.length===1||/^(Enter|Delete|Backspace|Arrow(Up|Down|Left|Right)|Home|End|PageUp|PageDown)$/.test(k);
    if(!mod){ if(plain) e.preventDefault(); }                        /* F5, F12 and the browser's own keys are left alone */
    else if((e.ctrlKey||e.metaKey)&&!e.altKey&&/^[a-z]$/i.test(k)&&!/^[rwtnplqf]$/i.test(k)&&!(e.shiftKey&&/^[ijc]$/i.test(k))) e.preventDefault();
    var now=Date.now();
    if(now-lastToast>4000){ lastToast=now; try{ if(typeof toast==="function") toast("An export is running, so editing is paused until it finishes. Press Esc to stop it.",3500); }catch(x){} }
  },true);
  window.AMIYO_EXPORT16_LOCK=1;
}catch(e){ try{ window.__swl&&window.__swl(e); }catch(x){} }})();

;
/* ==================== Script 4 id="amiyo-pp3-s04" ==================== */
/* Premiere-style step 4: Alt+scroll zooms the timeline around the pointer; "\" toggles between fit-all and your previous zoom. */
(function(){try{
  if(window.__ppS04) return; window.__ppS04=1;
  window.AMIYO_PP3=window.AMIYO_PP3||{}; window.AMIYO_PP3.step=4;
  var prev=null, fitZ=0;
  function ts(){ return document.getElementById("timelineScroll"); }
  function lw(){ try{ return labelW(); }catch(e){ return 188; } }
  function typing(t){ return t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable); }
  window.addEventListener("wheel",function(e){
    if(!e.altKey||e.ctrlKey||e.metaKey) return;
    var s=ts(); if(!s||!s.contains(e.target)||typeof window.amiyoZoomBy!=="function") return;
    e.preventDefault(); e.stopPropagation();
    var d=Math.abs(e.deltaY)>=Math.abs(e.deltaX)?e.deltaY:e.deltaX;
    window.amiyoZoomBy(Math.pow(1.0022,-Math.max(-120,Math.min(120,d))),e.clientX-s.getBoundingClientRect().left,true);
  },{capture:true,passive:false});
  function toggle(){
    var s=ts(); if(!s||typeof window.amiyoZoomFit!=="function") return;
    var z=Number(timelineZoom), left=s.scrollLeft;
    if(prev&&Math.abs(z-fitZ)<1.5){ var p=prev; prev=null; window.amiyoZoomTo(p.z,lw(),p.t,true); return; }
    prev={z:z,t:left/(6.4*z/100)}; window.amiyoZoomFit(); setTimeout(function(){ try{ fitZ=Number(timelineZoom); }catch(e){} },80);
  }
  window.addEventListener("keydown",function(e){
    if(e.code!=="Backslash"||e.shiftKey||e.ctrlKey||e.metaKey||e.altKey||typing(e.target)) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); toggle();
  },true);
  window.AMIYO_PP3.zoomToggle=toggle;
}catch(e){ try{window.__swl&&window.__swl(e)}catch(_){} }})();

;
/* ==================== Script 5 id="amiyo-dedupe-writes" ==================== */
/* Perf guard: ignore DOM writes that would not change anything, so per-frame loops stop forcing style/layout work. */
(function(){
  if(window.__amiyoDedupe) return; window.__amiyoDedupe=true;
  try{
    var E=Element.prototype, N=Node.prototype;
    var sa=E.setAttribute;
    E.setAttribute=function(n,v){ try{ if(this.getAttribute(n)===String(v)) return; }catch(e){} return sa.call(this,n,v); };
    var HOT={timeReadout:1,prTcBtn:1,pr2Tc:1,ppDur:1}, HS={};
    var tcd=Object.getOwnPropertyDescriptor(N,'textContent');
    if(tcd&&tcd.set) Object.defineProperty(N,'textContent',{configurable:true,enumerable:tcd.enumerable,get:tcd.get,set:function(v){
      try{ var s=v==null?'':String(v), f=this.firstChild;
        if(this.nodeType===1){ if(!f?s==='':(f.nodeType===3&&!f.nextSibling&&f.data===s)) return;
          /* timecode readouts: at most ~15 text updates a second, the last value always lands */
          var id=this.id; if(id&&HOT[id]){ var now=performance.now(), st=HS[id]||(HS[id]={t:0,h:0});
            if(now-st.t<66){ var el=this; st.v=s; if(!st.h){ st.h=setTimeout(function(){ st.h=0; st.t=performance.now(); try{ tcd.set.call(el,st.v); }catch(e){} },70-(now-st.t)); } return; }
            st.t=now; if(st.h){ clearTimeout(st.h); st.h=0; } } } }catch(e){}
      return tcd.set.call(this,v); }});
    var cn=Object.getOwnPropertyDescriptor(E,'className');
    if(cn&&cn.set) Object.defineProperty(E,'className',{configurable:true,enumerable:cn.enumerable,get:cn.get,set:function(v){ try{ if(typeof this.className==='string'&&this.className===String(v)) return; }catch(e){} return cn.set.call(this,v); }});
    [['title',HTMLElement.prototype],['hidden',HTMLElement.prototype]].forEach(function(p){
      var d=Object.getOwnPropertyDescriptor(p[1],p[0]); if(!d||!d.set) return;
      Object.defineProperty(p[1],p[0],{configurable:true,enumerable:d.enumerable,get:d.get,set:function(v){ try{ var cur=d.get.call(this); if(cur===(p[0]==='hidden'?!!v:String(v))) return; }catch(e){} return d.set.call(this,v); }});
    });
  }catch(e){}
})();

;
/* ==================== Script 6 id="amiyo-pro2-s06" ==================== */
/* runs first (placed at the top of the page) so the ` key reaches this before the older handler, which only knows the preview and timeline */
(function(){try{
var mx=0,my=0,B=function(){return document.body};
function typing(t){return t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable)}
addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY},{passive:true,capture:true});
function inside(sel){var el=document.querySelector(sel);if(!el)return false;var r=el.getBoundingClientRect();return r.width>0&&mx>=r.left&&mx<=r.right&&my>=r.top&&my<=r.bottom}
function mine(){var b=B();return b.classList.contains('am-max-left')?'left':b.classList.contains('am-max-right')?'right':null}
function setMine(m){var b=B();b.classList.remove('am-max-left','am-max-right');if(m)b.classList.add('am-max-'+m);
 setTimeout(function(){try{dispatchEvent(new Event('resize'))}catch(e){}},30);
 var live=document.getElementById('a11yLive');if(live)live.textContent=m?('Panel maximized. Press the backquote key or Escape to restore.'):'Panels restored'}
function pill(){if(document.getElementById('t6Pill'))return;var p=document.createElement('div');p.id='t6Pill';p.setAttribute('role','group');p.setAttribute('aria-label','Maximized panel');
 p.innerHTML='<span>Panel maximized</span><button type="button" title="Restore (` or Esc)">Restore ⤡</button>';
 p.querySelector('button').addEventListener('click',function(){
  if(mine())setMine(null);else window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true,cancelable:true}))});
 document.body.appendChild(p)}
function boot(){pill();
 var bar=document.getElementById('t3Bar');if(bar&&!bar.__t6){bar.__t6=1;bar.addEventListener('dblclick',function(){setMine(mine()==='left'?null:'left')})}
 var tabs=document.querySelector('#inspectorCol .pp-tabs,#inspectorCol [role=tablist]');if(tabs&&!tabs.__t6){tabs.__t6=1;tabs.addEventListener('dblclick',function(){setMine(mine()==='right'?null:'right')})}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
setInterval(boot,1500);
addEventListener('keydown',function(e){try{
 if(typing(e.target)||e.ctrlKey||e.metaKey||e.altKey)return;
 var m=mine();
 if(e.key==='Escape'&&m){setMine(null);return}
 if(e.code!=='Backquote')return;
 if(!m&&(B().classList.contains('am-max-preview')||B().classList.contains('am-max-timeline')))return; /* the older handler restores its own */
 if(m){e.preventDefault();e.stopImmediatePropagation();setMine(null);return}
 if(inside('.sidebar')){e.preventDefault();e.stopImmediatePropagation();setMine('left')}
 else if(inside('#inspectorCol')){e.preventDefault();e.stopImmediatePropagation();setMine('right')}
}catch(x){console.warn('pro2-s06',x)}},true);
}catch(e){console.warn('pro2-s06',e)}})();

;
/* ==================== Script 7 id="amiyo-al-keyguard" ==================== */
/* Step 4: while Audio Lab is open, the video editor's own keyboard shortcuts (Space = play the timeline, S = split, Delete/Backspace = delete the selected clip, Ctrl+Z = undo the project, Ctrl+D/C/V) must not also fire behind it. Editor key handlers are wrapped so they stand still while the Audio Lab window is open; Audio Lab's own handlers are untouched. */
(function(){try{
var ae=EventTarget.prototype.addEventListener,re=EventTarget.prototype.removeEventListener,map=new WeakMap();
function open(){var m=document.getElementById('alm');return !!(m&&m.style.display==='block')}
EventTarget.prototype.addEventListener=function(t,f,o){
 var a=Array.prototype.slice.call(arguments);
 try{
  if(t==='keydown'&&typeof f==='function'&&(this===window||this===document||this==null)){
   var cs=document.currentScript,id=(cs&&cs.id)||'';
   if(cs&&!/^amiyo-(al-|up10-audio-lab)/.test(id)){
    var orig=f,w=map.get(orig);
    if(!w){w=function(e){if(open())return;return orig.apply(this,arguments)};map.set(orig,w)}
    a[1]=w;
   }
  }
 }catch(e){}
 return ae.apply(this,a)};
EventTarget.prototype.removeEventListener=function(t,f){var a=Array.prototype.slice.call(arguments);try{if(t==='keydown'&&typeof f==='function'&&map.has(f))a[1]=map.get(f)}catch(e){}return re.apply(this,a)};
}catch(e){}})();

;
/* ==================== Script 8 id="amiyo-fetch-null-guard" ==================== */
/* Fix: fetch(null) / fetch(undefined) turned into a request for ".../Downloads/null", which the browser blocks (CORS error on file://). A missing media link now fails quietly, with no network request, and the caller's own error handling runs as usual. */
(function(){
  var of=window.fetch; if(!of) return;
  window.fetch=function(input,init){
    var u=input;
    try{ if(u&&typeof u==="object"&&!(u instanceof Request)&&typeof u.href==="string") u=u.href; }catch(e){}
    if(u==null||u===""||u==="null"||u==="undefined"||(typeof u==="string"&&/\/(null|undefined)$/.test(u)&&/^file:/i.test(u))){
      return Promise.reject(new TypeError("No media link to load"));
    }
    return of.apply(this,arguments);
  };
})();

;
/* ==================== Script 9 id="amiyo-s01-idle-polling" ==================== */
/* Step 1: idle polling. Amiyo runs ~18 timers (250-1500 ms). While the tab is hidden and nothing is playing, they only burn battery, so skip them; they resume the moment the tab is visible or media plays. */
(function(){
  var si=window.setInterval;
  function busy(){
    try{ var m=document.querySelectorAll("video,audio"); for(var i=0;i<m.length;i++){ if(!m[i].paused&&!m[i].ended) return true; } }catch(e){ return true; }
    try{ if(typeof isPlaying!=="undefined"&&isPlaying) return true; }catch(e){}
    return false;
  }
  window.setInterval=function(fn,ms){
    var a=Array.prototype.slice.call(arguments,2);
    if(typeof fn!=="function"||ms>2000) return si.apply(window,arguments);
    return si.apply(window,[function(){ if(document.hidden&&!busy()) return; return fn.apply(this,a); },ms]);
  };
})();

;
/* ==================== Script 10 id="amiyo-v117-nav-collapse" ==================== */
/* Step 117-12: the left Workspace menu (24 panel buttons) used 380 px of an 804 px sidebar, leaving the working panel cramped and scrolling.
   Click "Workspace" (or press Enter on it) to collapse the menu to just the open panel and give the panel the room; click again to expand.
   Your choice is remembered. Buttons are also a little tighter by default. Panels and shortcuts are unchanged. */
(function(){
  var KEY='amiyoNavCollapsed';
  function get(){try{return localStorage.getItem(KEY)==='1';}catch(e){return false;}}
  function set(v){try{localStorage.setItem(KEY,v?'1':'0');}catch(e){}}
  var st=document.createElement('style'); st.id='amiyo-v117-style';
  st.textContent='.sidebar #nav .navbtn{padding-top:5px;padding-bottom:5px}'+
    '.sidebar .section-title.am-navtoggle{cursor:pointer;display:flex;align-items:center;justify-content:space-between;user-select:none}'+
    '.sidebar .section-title.am-navtoggle::after{content:"\\25BE";font-size:11px;opacity:.7;transition:transform .15s}'+
    'body.am-nav-collapsed .sidebar .section-title.am-navtoggle::after{transform:rotate(-90deg)}'+
    'body.am-nav-collapsed .sidebar #nav .navbtn:not(.active){display:none}'+
    'body.am-nav-collapsed .sidebar #nav{display:block}'+
    'body.am-nav-collapsed .sidebar #nav .navbtn.active{width:100%}';
  (document.head||document.documentElement).appendChild(st);
  function apply(v){
    document.body.classList.toggle('am-nav-collapsed',v);
    var t=document.querySelector('.sidebar .section-title.am-navtoggle'); if(t){ t.setAttribute('aria-expanded',v?'false':'true'); t.title=v?'Show all panels':'Collapse the panel list'; }
  }
  function wire(){
    var t=document.querySelector('.sidebar .section-title'), n=document.getElementById('nav');
    if(!t||!n){setTimeout(wire,400);return;}
    t.classList.add('am-navtoggle'); t.setAttribute('role','button'); t.tabIndex=0; t.setAttribute('aria-controls','nav');
    function flip(){ var v=!document.body.classList.contains('am-nav-collapsed'); set(v); apply(v); }
    t.addEventListener('click',flip);
    t.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); flip(); } });
    /* picking a panel while collapsed: re-expand so the choice is visible and the menu is usable */
    n.addEventListener('click',function(e){ if(document.body.classList.contains('am-nav-collapsed')&&e.target.closest('.navbtn.active')){ set(false); apply(false); } },true);
    apply(get());
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',wire); else wire();
})();

;
/* ==================== Script 11 id="amiyo-v116-marker-colour" ==================== */
/* Step 116-11: marker colours. Markers already had a colour field but no way to change it. Alt+K cycles the colour of the marker at the playhead
   (within half a second; otherwise the closest one before it) through blue, red, orange, yellow, green and purple. The timeline marker strip
   already draws m.color, so it updates at once. One undo step. Ignored while typing. */
(function(){
  var PAL=['#ff8040','#ff5a5a','#ff9a3d','#ffd23f','#4cd97b','#b388ff'], NAME=['blue','red','orange','yellow','green','purple'];
  function typing(t){return t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable);}
  addEventListener('keydown',function(e){
    try{
      if(e.code!=='KeyK'||!e.altKey||e.shiftKey||e.ctrlKey||e.metaKey||typing(e.target)) return;
      e.preventDefault(); e.stopImmediatePropagation();
      var list=(project.markers||[]).filter(function(m){return isFinite(m.time);});
      if(!list.length){ notify('No markers yet. Press M to add one at the playhead.'); return; }
      var t=currentTime, best=null, d=1e9;
      list.forEach(function(m){ var x=Math.abs(m.time-t); if(x<d){d=x;best=m;} });
      if(d>0.5){ best=null; list.forEach(function(m){ if(m.time<=t&&(!best||m.time>best.time)) best=m; }); }
      if(!best){ notify('Move the playhead to a marker, then press Alt+K'); return; }
      var i=PAL.indexOf(String(best.color||'').toLowerCase()), n=(i+1)%PAL.length, id=best.id;
      transact('Marker colour',function(){ var m=project.markers.find(function(x){return x.id===id;}); if(m) m.color=PAL[n]; });
      try{renderAll();}catch(x){}
      notify('Marker colour: '+NAME[n]+(best.label?'  ('+best.label+')':''));
    }catch(err){try{console.warn('marker colour',err);}catch(x){}}
  },true);
})();

;
/* ==================== Script 12 id="amiyo-v115-enable-clip" ==================== */
/* Step 115-10: Shift+D disables / enables the selected clips without deleting them (Premiere's Enable Clip). A disabled clip is invisible and silent in the
   preview and in exports, but stays on the timeline (hatched and faded) with its trims and effects, and is restored exactly when enabled again.
   Stored on the clip, so it is saved with the project. One undo step. Ignored while typing. */
(function(){
  function typing(t){return t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable);}
  var st=document.createElement('style'); st.id='amiyo-v115-style';
  st.textContent='#tracks .clip.am-off{opacity:.45!important;background-image:repeating-linear-gradient(135deg,rgba(0,0,0,.28) 0 6px,transparent 6px 12px)!important}'+
    '#tracks .clip.am-off::after{content:"off";position:absolute;right:4px;top:2px;font:700 9px/1 ui-monospace,monospace;color:#fff;background:#6b6258;border-radius:3px;padding:1px 3px;pointer-events:none}';
  (document.head||document.documentElement).appendChild(st);
  function find(id){for(var i=0;i<project.tracks.length;i++){var cl=project.tracks[i].clips||[];for(var j=0;j<cl.length;j++)if(cl[j].id===id)return cl[j];}return null;}
  var busy=false;
  function mark(){ busy=false; try{ document.querySelectorAll('#tracks .clip[data-clip]').forEach(function(el){ var c=find(el.getAttribute('data-clip')); el.classList.toggle('am-off',!!(c&&c.amOff)); }); }catch(e){} }
  function sched(){ if(!busy){busy=true;setTimeout(mark,100);} }
  function wire(){ var t=document.getElementById('tracks'); if(!t){setTimeout(wire,500);return;} new MutationObserver(sched).observe(t,{childList:true,subtree:true}); mark(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',wire); else wire();
  addEventListener('keydown',function(e){
    try{
      if(e.code!=='KeyD'||!e.shiftKey||e.ctrlKey||e.metaKey||e.altKey||typing(e.target)) return;
      var ids=[].map.call(document.querySelectorAll('#tracks .clip.selected'),function(el){return el.getAttribute('data-clip');});
      e.preventDefault(); e.stopImmediatePropagation();
      if(!ids.length){ notify('Select a clip first (Shift+D disables or enables it)'); return; }
      var clips=ids.map(find).filter(Boolean); if(!clips.length) return;
      var enable=clips.every(function(c){return !!c.amOff;}), n=0;
      transact(enable?'Enable clips':'Disable clips',function(){
        ids.forEach(function(id){ var c=find(id); if(!c) return; n++;
          if(enable){ var o=c.amOff; c.opacity=o.o; c.volume=o.v; delete c.amOff; }
          else if(!c.amOff){ c.amOff={o:c.opacity==null?1:c.opacity,v:c.volume==null?1:c.volume}; c.opacity=0; c.volume=0; }
        });
      });
      try{renderAll();}catch(x){}
      notify((enable?'Enabled ':'Disabled ')+n+' clip'+(n>1?'s':''));
    }catch(err){try{console.warn('enable clip',err);}catch(x){}}
  },true);
})();

;
/* ==================== Script 13 id="amiyo-v114-play-range" ==================== */
/* Step 114-09: Shift+Space plays just the In to Out range (the whole project if no In/Out is set) and stops at Out, so you can check a section.
   Alt+Shift+Space does the same but loops until you press Space or click Pause. Uses the editor's own Play button, so audio, speed
   and meters behave exactly as normal. Ignored while typing. */
(function(){
  var timer=0;
  function typing(t){return t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable);}
  function stopWatch(){ if(timer){clearInterval(timer);timer=0;} }
  function pb(){return document.getElementById('playBtn');}
  function begin(loop){
    var io=(window.amiyoGetIO&&window.amiyoGetIO())||{}, dur=getProjectDuration(), a=io.i==null?0:io.i, b=io.o==null?dur:io.o;
    if(!(b>a+0.05)){ notify('Nothing to play in that range'); return; }
    stopWatch();
    if(isPlaying) pb().click();
    setTimeout(function(){
      setCurrentTime(a); if(!isPlaying) pb().click();
      notify((loop?'Looping ':'Playing ')+a.toFixed(2)+' to '+b.toFixed(2)+' s');
      var t0=Date.now();
      timer=setInterval(function(){
        try{
          if(!isPlaying&&Date.now()-t0>400){ stopWatch(); return; }
          if(isPlaying&&currentTime>=b-0.02){
            if(loop){ setCurrentTime(a); }
            else { stopWatch(); pb().click(); setCurrentTime(b); }
          }
        }catch(e){ stopWatch(); }
      },25);
    },60);
  }
  window.addEventListener('keydown',function(e){
    try{
      if(typing(e.target)) return;
      if(e.code==='Space'&&timer&&!e.shiftKey){ stopWatch(); return; }  /* plain Space: let the editor pause, we just stop watching */
      if(e.code!=='Space'||!e.shiftKey||e.ctrlKey||e.metaKey) return;
      e.preventDefault(); e.stopImmediatePropagation(); begin(!!e.altKey);
    }catch(err){try{console.warn('play range',err);}catch(x){}}
  },true);
  document.addEventListener('click',function(e){ if(timer&&e.target.closest&&e.target.closest('#playBtn,#stopBtn')) stopWatch(); },true);
})();

;
/* ==================== Script 14 id="amiyo-v113-alt-drag-copy" ==================== */
/* Step 113-08: hold Alt while dragging a clip to drag a COPY (Premiere). The original stays where it was; you carry the duplicate.
   Implemented safely: when the drag ends and the clip really moved, a copy is placed at its old position/track in one undo step.
   If the drag is cancelled or the clip did not move, nothing is added. Locked tracks are never copied into. */
(function(){
  var drag=null;
  function find(id){for(var i=0;i<project.tracks.length;i++){var cl=project.tracks[i].clips||[];for(var j=0;j<cl.length;j++)if(cl[j].id===id)return {c:cl[j],t:project.tracks[i]};}return null;}
  document.addEventListener('pointerdown',function(e){
    try{
      drag=null; if(e.button!==0||!e.altKey) return; var el=e.target.closest&&e.target.closest('#tracks .clip'); if(!el||e.target.closest('[data-resize]')) return;
      var f=find(el.dataset.clip); if(!f) return;
      drag={id:f.c.id,trackId:f.t.id,start:f.c.start,snap:JSON.parse(JSON.stringify(f.c))};
    }catch(err){drag=null;}
  },true);
  function finish(){
    var d=drag; drag=null; if(!d) return;
    setTimeout(function(){
      try{
        var f=find(d.id); if(!f) return;
        if(f.t.id===d.trackId&&Math.abs(f.c.start-d.start)<1e-3) return;
        var tr=project.tracks.find(function(t){return t.id===d.trackId;}); if(!tr||tr.locked) return;
        var s=d.start,e2=d.start+d.snap.duration,clash=(tr.clips||[]).some(function(c){return c.id!==d.id&&c.start<e2-1e-3&&c.start+c.duration>s+1e-3;});
        if(clash){ notify('Moved only: the old spot is taken, so no copy was left behind'); return; }
        transact('Alt-drag copy',function(){
          var cp=JSON.parse(JSON.stringify(d.snap)); cp.id=uid('clip'); cp.start=d.start; cp.selected=false; tr.clips.push(cp);
        });
        try{renderAll();}catch(x){}
        notify('Alt-drag: copy kept at the original spot');
      }catch(err){try{console.warn('alt drag copy',err);}catch(x){}}
    },120);
  }
  window.addEventListener('pointerup',finish,true); window.addEventListener('pointercancel',function(){drag=null;},true);
})();

;
/* ==================== Script 15 id="amiyo-v112-maximize-panel" ==================== */
/* Step 112-07: ` (backtick) maximizes the panel under the mouse, like Premiere. Over the preview it hides the timeline; over the timeline it hides
   the preview. Press ` again (or Esc) to restore. Only the two centre panels are affected, nothing is deleted or changed in the project. */
(function(){
  var mx=0,my=0,mode=null;
  function typing(t){return t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable);}
  var st=document.createElement('style'); st.id='amiyo-v112-max-style';
  st.textContent='body.am-max-preview .center>.timeline{display:none!important}body.am-max-timeline .center>.preview-wrap{display:none!important}'+
    'body.am-max-preview .center,body.am-max-timeline .center{grid-template-rows:minmax(0,1fr)!important}';
  (document.head||document.documentElement).appendChild(st);
  addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;},{passive:true,capture:true});
  function inside(sel){var el=document.querySelector(sel); if(!el) return false; var r=el.getBoundingClientRect(); return mx>=r.left&&mx<=r.right&&my>=r.top&&my<=r.bottom&&r.width>0;}
  function set(m){
    document.body.classList.remove('am-max-preview','am-max-timeline'); mode=m;
    if(m) document.body.classList.add('am-max-'+m);
    setTimeout(function(){try{dispatchEvent(new Event('resize'));renderAll();}catch(e){}},30);
  }
  addEventListener('keydown',function(e){
    try{
      if(typing(e.target)||e.ctrlKey||e.metaKey||e.altKey) return;
      if(e.key==='Escape'&&mode){ set(null); notify('Panels restored'); return; }
      if(e.code!=='Backquote') return;
      e.preventDefault(); e.stopImmediatePropagation();
      if(mode){ set(null); notify('Panels restored'); return; }
      if(inside('.preview-wrap')){ set('preview'); notify('Preview maximized  (` or Esc to restore)'); }
      else if(inside('.timeline')){ set('timeline'); notify('Timeline maximized  (` or Esc to restore)'); }
      else notify('Hover the preview or timeline, then press `');
    }catch(err){try{console.warn('maximize panel',err);}catch(x){}}
  },true);
})();

;
/* ==================== Script 16 id="amiyo-v111-track-bulk-keys" ==================== */
/* Step 111-06: shortcuts for the track bulk actions (they were menu-only). Alt+Shift+L locks every track, or unlocks all if everything is
   already locked. Alt+Shift+O mutes every track, or unmutes all if everything is already muted. One undo step each; ignored while typing. */
(function(){
  function typing(t){return t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable);}
  function toggle(key,label,onMsg,offMsg){
    var tr=project.tracks.filter(function(t){return t.clips||true;}); if(!tr.length) return;
    var all=tr.every(function(t){return !!t[key];}), v=!all;
    transact(label,function(){ project.tracks.forEach(function(t){ t[key]=v; }); });
    try{renderAll();}catch(e){}
    notify(v?onMsg:offMsg);
  }
  window.addEventListener('keydown',function(e){
    try{
      if(!e.altKey||!e.shiftKey||e.ctrlKey||e.metaKey||typing(e.target)) return;
      if(e.code==='KeyL'){ e.preventDefault(); e.stopImmediatePropagation(); toggle('locked','Lock all tracks','All tracks locked','All tracks unlocked'); }
      else if(e.code==='KeyO'){ e.preventDefault(); e.stopImmediatePropagation(); toggle('muted','Mute all tracks','All tracks muted','All tracks unmuted'); }
    }catch(err){try{console.warn('track bulk',err);}catch(x){}}
  },true);
})();

;
/* ==================== Script 17 id="amiyo-v110-select-at-playhead" ==================== */
/* Step 110-05: D selects the clip under the playhead (Premiere "select clip at playhead"). Press D again to move to the next clip stacked
   at the same time (cycles through tracks). Locked tracks are skipped. Ignored while typing or with Ctrl/Alt/Shift held,
   so Ctrl+D (duplicate) and Alt+D (length) keep working. */
(function(){
  function typing(t){return t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable);}
  window.addEventListener('keydown',function(e){
    try{
      if(e.code!=='KeyD'||e.ctrlKey||e.metaKey||e.altKey||e.shiftKey||typing(e.target)) return;
      var t=currentTime,EPS=1e-3,hits=[];
      project.tracks.forEach(function(tr){ if(tr.locked||tr.hidden) return;
        (tr.clips||[]).forEach(function(c){ if(t>=c.start-EPS&&t<c.start+c.duration-EPS) hits.push([c,tr]); }); });
      e.preventDefault(); e.stopImmediatePropagation();
      if(!hits.length){ notify('No clip under the playhead'); return; }
      var cur=-1; hits.forEach(function(h,i){ if(h[0].id===(document.querySelector('#tracks .clip.selected')||{getAttribute:function(){return null;}}).getAttribute('data-clip')) cur=i; });
      var h=hits[(cur+1)%hits.length];
      var el=document.querySelector('#tracks .clip[data-clip="'+h[0].id+'"]'); if(!el){ notify('Clip is not visible on the timeline, zoom out'); return; }
      el.scrollIntoView({block:'nearest',inline:'nearest'}); el.click();
      notify('Selected clip on '+(h[1].name||'track')+(hits.length>1?'  ('+(((cur+1)%hits.length)+1)+' of '+hits.length+', D again for next)':''));
    }catch(err){try{console.warn('select at playhead',err);}catch(x){}}
  },true);
})();

;
/* ==================== Script 18 id="amiyo-v109-timecode-field" ==================== */
/* Step 109-04: click the time readout (top of the preview) to type a time and jump there, like Premiere's timecode field.
   Accepts 90, 1:30, 01:02:03.5, and relative +5 / -2.5 (seconds). Enter jumps, Esc cancels. The old Go to Time dialog still works. */
(function(){
  function parse(s,cur){
    s=String(s||'').trim(); if(!s) return null;
    var rel=/^[+-]/.test(s)?(s[0]==='-'?-1:1):0; if(rel) s=s.slice(1).trim();
    if(!/^\d+(:\d+){0,2}(\.\d+)?$/.test(s)) return null;
    var p=s.split(':').map(parseFloat), v=0; p.forEach(function(x){v=v*60+x;});
    return rel?cur+rel*v:v;
  }
  function open(el){
    if(document.getElementById('amTcInput')) return;
    var r=el.getBoundingClientRect(), i=document.createElement('input'); i.id='amTcInput'; i.type='text'; i.autocomplete='off';
    i.setAttribute('aria-label','Go to time (seconds, m:ss, or +/- offset)'); i.placeholder='1:30 or +5';
    i.style.cssText='position:fixed;z-index:99990;left:'+Math.round(r.left)+'px;top:'+Math.round(r.top-3)+'px;width:'+Math.max(150,Math.round(r.width))+'px;height:'+Math.round(r.height+6)+'px;box-sizing:border-box;padding:0 8px;font:600 12px ui-monospace,Menlo,Consolas,monospace;color:#fff;background:#1d1a17;border:1px solid #ff7a3d;border-radius:6px;outline:none';
    document.body.appendChild(i); i.focus();
    var done=false; function close(){ if(done) return; done=true; try{i.remove();}catch(e){} }
    i.addEventListener('keydown',function(e){
      e.stopPropagation();
      if(e.key==='Escape'){ e.preventDefault(); close(); }
      else if(e.key==='Enter'){ e.preventDefault(); var t=parse(i.value,currentTime);
        if(t===null){ i.style.borderColor='#ff5a5a'; notify('Type a time like 90, 1:30 or +5'); return; }
        setCurrentTime(t); close(); notify('Jumped to '+currentTime.toFixed(2)+' s'); }
    });
    i.addEventListener('blur',close);
  }
  function wire(){
    var el=document.getElementById('timeReadout'); if(!el){setTimeout(wire,500);return;}
    el.style.cursor='text'; el.title='Click to type a time and jump there (1:30, 90, +5, -2)';
    el.setAttribute('role','button'); el.tabIndex=0;
    el.addEventListener('click',function(){open(el);});
    el.addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); open(el);} });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',wire); else wire();
})();

;
/* ==================== Script 19 id="amiyo-v108-clip-tooltip" ==================== */
/* Step 108-03: clip tooltips contained stray badge letters and blank lines ("Demo Scene 01.svg / T / Start ... Length ...").
   Hovering a clip now shows a clean card: name, track, start, length, end, speed and volume (only when not default). Display only; the project is never changed. */
(function(){
  function t(s){var m=Math.floor(s/60),x=s-m*60;return m+':'+(x<10?'0':'')+x.toFixed(2);}
  function find(id){try{for(var i=0;i<project.tracks.length;i++){var cl=project.tracks[i].clips||[];for(var j=0;j<cl.length;j++)if(cl[j].id===id)return [cl[j],project.tracks[i]];}}catch(e){}return null;}
  function name(c,el){try{var a=(typeof getAsset==='function'&&getAsset(c.assetId))||null;var n=a&&(a.name||a.title||a.fileName||a.filename);if(n)return n;if(c.text)return String(c.text).slice(0,40);var l=el&&el.getAttribute('aria-label');if(l){var m=l.match(/^\w+ clip (.*) on /);if(m)return m[1];}}catch(e){}return 'Clip';}
  var busy=false;
  function pass(){
    busy=false;
    try{
      document.querySelectorAll('#tracks .clip[data-clip]').forEach(function(el){
        var f=find(el.getAttribute('data-clip')); if(!f) return; var c=f[0],tr=f[1];
        var s=[name(c,el)+'  -  '+(tr.name||'Track'),'Start '+t(c.start)+'   Length '+t(c.duration)+'   End '+t(c.start+c.duration)];
        if(c.speed&&Math.abs(c.speed-1)>.001) s.push('Speed '+(Math.round(c.speed*100)/100)+'x');
        if(c.volume!=null&&Math.abs(c.volume-1)>.001) s.push('Volume '+Math.round(c.volume*100)+'%');
        if(c.gainDb&&Math.abs(c.gainDb)>=.05) s.push('Gain '+(c.gainDb>0?'+':'')+c.gainDb+' dB');
        var v=s.join('\n'); if(el.title!==v) el.title=v;
      });
    }catch(e){}
  }
  function wire(){
    var tr=document.getElementById('tracks'); if(!tr){setTimeout(wire,500);return;}
    new MutationObserver(function(){ if(!busy){busy=true;setTimeout(pass,120);} }).observe(tr,{childList:true,subtree:true});
    pass();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',wire); else wire();
})();

;
/* ==================== Script 20 id="amiyo-v107-taller-timeline" ==================== */
/* Step 107-02: the timeline only showed about four tracks on first launch (the preview took ~60% of the height).
   If you have never dragged the splitter, the timeline now starts at ~44% of the centre column (min 300 px).
   Your own saved height, the splitter, double-click reset and phones are untouched. */
(function(){
  function go(){
    try{
      var c=document.querySelector('.center'), tl=document.querySelector('.timeline'); if(!c||!tl||!tl.querySelector('.tl-split')){setTimeout(go,400);return;}
      if(matchMedia('(max-width:1024px)').matches||c.style.gridTemplateRows) return;
      var saved=false; try{ for(var i=0;i<localStorage.length;i++){ if(/tl.?h|timeline.?h|split/i.test(localStorage.key(i))) saved=true; } }catch(e){}
      if(saved) return;
      var h=Math.max(300,Math.round(c.clientHeight*0.44)); if(c.clientHeight-h<230) return;
      c.style.gridTemplateRows='minmax(0,1fr) '+h+'px'; window.dispatchEvent(new Event('resize'));
    }catch(e){}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){setTimeout(go,900);}); else setTimeout(go,900);
})();

;
/* ==================== Script 21 id="amiyo-v106-meter-fade" ==================== */
/* Step 106-01: the master meter sat fully opaque over the right side of the picture, hiding video. It now stays faint until you
   hover it or audio is actually playing, is a little slimmer, and never blocks clicks on the picture beneath its gaps. */
(function(){
  var s=document.createElement('style'); s.id='amiyo-v106-meter-style';
  s.textContent='#prMeter{opacity:.38;transition:opacity .18s ease}'+
    '#prMeter:hover,#prMeter:focus-visible,#prMeter.am-live{opacity:1}'+
    '#prMeter .am-scale span{font-size:8px;padding:1px 2px}';
  (document.head||document.documentElement).appendChild(s);
  function wire(){
    var m=document.getElementById('prMeter'), v=document.getElementById('videoEl'), pb=document.getElementById('playBtn');
    if(!m||!pb){setTimeout(wire,500);return;}
    setInterval(function(){
      try{
        var playing=/pause/i.test(pb.textContent||'')||(v&&!v.paused&&!v.ended);
        m.classList.toggle('am-live',!!playing);
      }catch(e){}
    },400);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',wire); else wire();
})();

;
/* ==================== Script 22 id="amiyo-v105-marker-nav" ==================== */
/* Step 105-15: marker navigation. M (add marker) and the Markers & chapters list already exist.
   New: Shift+M jumps to the next marker, Alt+Shift+M to the previous one (Premiere style; Ctrl+Shift+M is a browser shortcut, so Alt is used).
   Ignored while typing. Each jump shows "Marker 2 of 4 - label". */
(function(){
  function typing(t){return t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable);}
  window.addEventListener('keydown',function(e){
    try{
      if(e.code!=='KeyM'||!e.shiftKey||e.ctrlKey||e.metaKey||typing(e.target)) return;
      var prev=e.altKey, list=(project.markers||[]).filter(function(m){return isFinite(m.time);}).sort(function(a,b){return a.time-b.time;});
      e.preventDefault(); e.stopImmediatePropagation();
      if(!list.length){ notify('No markers yet. Press M to add one at the playhead.'); return; }
      var t=currentTime, EPS=1e-3, idx=-1, i;
      if(prev){ for(i=list.length-1;i>=0;i--) if(list[i].time<t-EPS){idx=i;break;} }
      else { for(i=0;i<list.length;i++) if(list[i].time>t+EPS){idx=i;break;} }
      if(idx<0){ notify(prev?'No earlier marker':'No later marker'); return; }
      setCurrentTime(list[idx].time);
      notify('Marker '+(idx+1)+' of '+list.length+(list[idx].label?' - '+list[idx].label:''));
    }catch(err){try{console.warn('marker nav',err);}catch(x){}}
  },true);
})();

;
/* ==================== Script 23 id="amiyo-v100-zoom" ==================== */
/* Step 100-10: timeline zoom. "=" / "-" and Ctrl+wheel already zoom; this adds "\" = fit whole timeline (Premiere), a labelled zoom slider,
   and double-click on the slider to reset to the default zoom. */
(function(){
  function typing(t){return t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable);}
  window.addEventListener('keydown',function(e){
    try{
      if(e.key!=='\\'||e.ctrlKey||e.metaKey||e.altKey||typing(e.target)) return;
      var b=document.getElementById('fitTimelineBtn'); if(!b) return;
      e.preventDefault(); e.stopImmediatePropagation(); b.click(); notify('Timeline fitted to your project');
    }catch(err){}
  },true);
  function wire(){
    var s=document.getElementById('timelineZoom'); if(!s){setTimeout(wire,500);return;}
    s.setAttribute('aria-label','Timeline zoom');
    s.title='Timeline zoom  (= in, - out, \\ fit, double-click to reset)';
    s.ondblclick=function(){ s.value=250; s.dispatchEvent(new Event('input',{bubbles:true})); };
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',wire); else wire();
})();

;
/* ==================== Script 24 id="amiyo-v99-edit-points" ==================== */
/* Step 99-09: Up / Down arrows jump the playhead to the previous / next edit point (any clip start or end), like Premiere.
   J K L shuttle, C razor, Left/Right frame step and Home/End already exist and are untouched.
   Ignored while typing, with modifier keys held, or while a clip is selected (arrows may nudge clips then). */
(function(){
  function typing(t){return t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable);}
  function fmt(s){var m=Math.floor(s/60),x=s-m*60;return (m<10?'0':'')+m+':'+(x<10?'0':'')+x.toFixed(2);}
  window.addEventListener('keydown',function(e){
    try{
      if((e.key!=='ArrowUp'&&e.key!=='ArrowDown')||e.ctrlKey||e.metaKey||e.altKey||e.shiftKey||typing(e.target)) return;
      if(document.querySelector('.clip.selected')) return;
      var t=currentTime, EPS=1e-3, pts=[0], end=0;
      project.tracks.forEach(function(tr){(tr.clips||[]).forEach(function(c){pts.push(c.start,c.start+c.duration);end=Math.max(end,c.start+c.duration);});});
      if(end<=0) return;
      pts=pts.filter(function(v){return isFinite(v);}).sort(function(a,b){return a-b;});
      var tgt=null,i;
      if(e.key==='ArrowDown'){ for(i=0;i<pts.length;i++) if(pts[i]>t+EPS){tgt=pts[i];break;} }
      else { for(i=pts.length-1;i>=0;i--) if(pts[i]<t-EPS){tgt=pts[i];break;} }
      e.preventDefault(); e.stopImmediatePropagation();
      if(tgt===null){ notify(e.key==='ArrowDown'?'No later edit point':'No earlier edit point'); return; }
      setCurrentTime(tgt); notify((e.key==='ArrowDown'?'Next':'Previous')+' edit point '+fmt(tgt));
    }catch(err){try{console.warn('edit-point jump',err);}catch(x){}}
  },true);
})();

;
/* ==================== Script 25 id="amiyo-v98-gap-ripple" ==================== */
/* Step 98-08: Shift+Delete with NO clip selected closes the empty gap under the playhead (Premiere's "ripple delete gap").
   With a clip selected, the editor's own ripple delete runs exactly as before. Locked tracks are never touched. */
(function(){
  function typing(t){return t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable);}
  window.addEventListener('keydown',function(e){
    try{
      if(!(e.shiftKey&&e.key==='Delete')||e.ctrlKey||e.metaKey||e.altKey||typing(e.target)) return;
      if(document.querySelector('.clip.selected')) return;
      var t=currentTime, EPS=1e-3, closed=0, tracks=0;
      transact('Ripple delete gap',function(){
        project.tracks.forEach(function(tr){
          if(tr.locked||!tr.clips||!tr.clips.length) return;
          var cl=tr.clips.slice().sort(function(a,b){return a.start-b.start;});
          var prevEnd=0,next=null;
          for(var i=0;i<cl.length;i++){
            if(cl[i].start>t+EPS){next=cl[i];break;}
            prevEnd=Math.max(prevEnd,cl[i].start+cl[i].duration);
          }
          if(!next||prevEnd>t+EPS) return;
          var gap=next.start-prevEnd; if(gap<=EPS) return;
          cl.forEach(function(c){ if(c.start>=next.start-EPS) c.start=Math.max(0,c.start-gap); });
          closed=Math.max(closed,gap); tracks++;
        });
      });
      if(tracks){ e.preventDefault(); e.stopImmediatePropagation(); notify('Closed '+closed.toFixed(2)+' s gap on '+tracks+' track'+(tracks>1?'s':'')); }
    }catch(err){try{console.warn('gap ripple',err);}catch(x){}}
  },true);
})();

;
/* ==================== Script 26 ==================== */
window.__amiyoCaches=function(){try{return window.caches||null;}catch(e){return null;}};

;
/* ==================== Script 27 id="amiyo-big-guard" ==================== */
/* Very large files (default over 1.5 GB, change with localStorage amiyo_bigfile_mb): they play and edit straight from your disk.
   They are not copied into browser storage, and tools that would load the whole file into memory stop with a clear message instead of crashing the tab. */
(function(){
  var BIGB=function(){ try{ var m=+localStorage.getItem("amiyo_bigfile_mb"); return (m>0?m:1500)*1048576; }catch(e){ return 1572864000; } };
  window.__amiyoBigBytes=BIGB;
  var CAP=1.5e9;
  function bad(){ var e=new Error("This file is too large (over 1.5 GB) to load into memory, so this tool cannot read it. Playing and editing it still work."); e.name="RangeError"; return e; }
  try{ if(window.Blob&&Blob.prototype.arrayBuffer&&!Blob.prototype.__amiyoBig){ var ba=Blob.prototype.arrayBuffer; Blob.prototype.arrayBuffer=function(){ if(this.size>CAP) return Promise.reject(bad()); return ba.call(this); }; Blob.prototype.__amiyoBig=true; } }catch(e){}
  try{ if(window.Response&&!Response.prototype.__amiyoBig){ var ra=Response.prototype.arrayBuffer; Response.prototype.arrayBuffer=function(){ try{ var n=+this.headers.get("content-length"); if(n>CAP) return Promise.reject(bad()); }catch(e){} return ra.call(this); }; Response.prototype.__amiyoBig=true; } }catch(e){}
  try{ if(window.FileReader&&!FileReader.prototype.__amiyoBig){ ["readAsDataURL","readAsArrayBuffer","readAsBinaryString"].forEach(function(n){ var o=FileReader.prototype[n]; FileReader.prototype[n]=function(b){ if(b&&b.size>CAP){ var self=this; setTimeout(function(){ try{ self.dispatchEvent(new ProgressEvent("error")); }catch(e){} },0); return; } return o.call(this,b); }; }); FileReader.prototype.__amiyoBig=true; } }catch(e){}
})();

;
/* ==================== Script 28 id="amiyo-pr-step57-safe-insert" ==================== */
/* Step 57: safe insertBefore. If a script asks to insert before a node that has since moved (the phone toolbar menu moves buttons around),
   the new node is added at the end instead of throwing "Something went wrong". Normal calls behave exactly as before. */
(function(){
  if(Node.prototype.__amiyoSafeIns) return;
  var nib=Node.prototype.insertBefore;
  Node.prototype.insertBefore=function(n,r){ if(r&&r.parentNode!==this){ try{ window.__amiyoSafeInsCount=(window.__amiyoSafeInsCount||0)+1; }catch(e){} r=null; } return nib.call(this,n,r); };
  Node.prototype.__amiyoSafeIns=true;
})();

;
/* ==================== Script 29 id="amiyo-pr-step60-same-attr" ==================== */
/* Step 60: setAttribute with the value an element already has is skipped. The editor's accessibility and label scripts re-applied the same
   labels about 400 times a second, and each write woke up every DOM watcher again (a loop that kept the phone busy while idle). */
(function(){
  if(Element.prototype.__amiyoSameAttr) return;
  var sa=Element.prototype.setAttribute;
  Element.prototype.setAttribute=function(n,v){ try{ if(this.getAttribute(n)===String(v)){ window.__amiyoSameAttrSkips=(window.__amiyoSameAttrSkips||0)+1; return; } }catch(e){} return sa.call(this,n,v); };
  Element.prototype.__amiyoSameAttr=true;
})();

;
/* ==================== Script 30 id="amiyo-form-a11y-fix" ==================== */
/* Form field fix (runs the moment HTML is inserted, so DevTools never logs the problem):
   1) every input/select/textarea gets an id when it has neither id nor name;
   2) every <label> is tied to the field next to it; a label with no field next to it gets a hidden dummy input nested inside it
      (valid HTML; the label text and the sibling structure stay exactly as they were). Only attributes/hidden nodes are added. */
(function(){"use strict";
  var n=0, SEL="input,select,textarea", RX=/<\s*(label|input|select|textarea)/i;
  function isField(e){ return !!(e&&e.matches&&e.matches(SEL)&&e.type!=="hidden"); }
  function ensureId(f){ if(!f.id&&!f.name){ f.id="af_"+(f.type||f.tagName.toLowerCase())+"_"+(++n); } return f.id||null; }
  function targetFor(l){
    var e=l.nextElementSibling;
    if(e){ if(isField(e)) return e; if(e.tagName!=="LABEL"&&e.querySelector){ var d=e.querySelector(SEL); if(d&&isField(d)) return d; } }
    return null;
  }
  function fixLabel(l){
    if(l.hasAttribute("for")||l.querySelector("input,select,textarea,button,meter,output,progress")) return;
    var t=targetFor(l), id=t&&(t.id||(t.id="af_lbl_"+(++n)));
    if(id){ l.htmlFor=id; return; }
    var i=document.createElement("input"); i.type="checkbox"; i.hidden=true; i.tabIndex=-1; i.id="af_dummy_"+(++n); i.setAttribute("aria-hidden","true"); l.appendChild(i);
  }
  function fix(root){
    if(!root||!root.querySelectorAll) return;
    try{
      if(isField(root)) ensureId(root);
      var fs=root.querySelectorAll(SEL); for(var i=0;i<fs.length;i++){ if(fs[i].type!=="hidden") ensureId(fs[i]); }
      if(root.tagName==="LABEL") fixLabel(root);
      var ls=root.querySelectorAll("label"); for(var j=0;j<ls.length;j++) fixLabel(ls[j]);
    }catch(e){ try{ window.__swl&&window.__swl(e); }catch(x){} }
  }
  try{
    var d=Object.getOwnPropertyDescriptor(Element.prototype,"innerHTML");
    if(d&&d.set&&!d.set.__amiyoFormFix){
      var os=d.set; var ns=function(v){ os.call(this,v); if(typeof v==="string"&&RX.test(v)) fix(this); }; ns.__amiyoFormFix=true;
      Object.defineProperty(Element.prototype,"innerHTML",{configurable:true,enumerable:d.enumerable,get:d.get,set:ns});
    }
  }catch(e){}
  try{
    var ia=Element.prototype.insertAdjacentHTML;
    Element.prototype.insertAdjacentHTML=function(pos,html){ var r=ia.call(this,pos,html); if(typeof html==="string"&&RX.test(html)) fix((/^(afterbegin|beforeend)$/i.test(pos)||!this.parentElement)?this:this.parentElement); return r; };
  }catch(e){}
  try{
    var ce=Document.prototype.createElement;
    Document.prototype.createElement=function(tag){ var el=ce.apply(this,arguments); try{ var t=String(tag).toLowerCase(); if(t==="input"||t==="select"||t==="textarea") el.setAttribute("name","af_"+t+"_"+(++n)); }catch(e){} return el; };
  }catch(e){}
  /* every other way of putting nodes on the page: checked in a microtask (before the next paint), so label+field pairs added one after the other still get linked */
  var pend=[], sched=false, QS="label,input,select,textarea";
  function flush(){ sched=false; var a=pend; pend=[]; for(var i=0;i<a.length;i++){ var x=a[i]; if(x&&x.isConnected) fix(x); } }
  function note(x){
    try{
      if(!x) return;
      if(x.nodeType===11){ for(var c=x.firstElementChild;c;c=c.nextElementSibling) note(c); return; }
      if(x.nodeType!==1) return;
      var t=x.tagName; if(!(t==="LABEL"||t==="INPUT"||t==="SELECT"||t==="TEXTAREA"||(x.firstElementChild&&x.querySelector(QS)))) return;
      pend.push(x.parentNode&&x.parentNode.nodeType===1&&t==="LABEL"?x.parentNode:x); if(!sched){ sched=true; (window.queueMicrotask||function(f){ Promise.resolve().then(f); })(flush); }
    }catch(e){}
  }
  function wrap(proto,name,pick){
    try{ var o=proto[name]; if(typeof o!=="function"||o.__amiyoFF) return;
      var w=function(){ var nodes=pick(arguments), frag=[]; nodes.forEach(function(x){ if(x&&x.nodeType===11){ for(var c=x.firstElementChild;c;c=c.nextElementSibling) frag.push(c); } else frag.push(x); });
        var r=o.apply(this,arguments); frag.forEach(note); return r; };
      w.__amiyoFF=true; proto[name]=w; }catch(e){}
  }
  var first=function(a){ return [a[0]]; }, second=function(a){ return [a[1]]; }, all=function(a){ return [].slice.call(a); };
  wrap(Node.prototype,"appendChild",first); wrap(Node.prototype,"insertBefore",first); wrap(Node.prototype,"replaceChild",first);
  ["append","prepend","before","after","replaceWith"].forEach(function(m){ wrap(Element.prototype,m,all); });
  wrap(Element.prototype,"insertAdjacentElement",second);
  try{
    var od=Object.getOwnPropertyDescriptor(Element.prototype,"outerHTML");
    if(od&&od.set&&!od.set.__amiyoFF){ var oset=od.set; var nset=function(v){ var par=this.parentNode; oset.call(this,v); if(par&&typeof v==="string"&&RX.test(v)){ if(par.nodeType===1) fix(par); } }; nset.__amiyoFF=true;
      Object.defineProperty(Element.prototype,"outerHTML",{configurable:true,enumerable:od.enumerable,get:od.get,set:nset}); }
  }catch(e){}
  var timer=0; function later(){ if(!timer) timer=setTimeout(function(){ timer=0; fix(document.body); },300); }
  function start(){ fix(document.body); try{ new MutationObserver(later).observe(document.body,{childList:true,subtree:true}); }catch(e){} }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start); else start();
})();

;
/* ==================== Script 31 id="amiyo-idle-freeze" ==================== */
/* Step 1: idle freeze. While the editor tab is not on screen (and nothing is exporting) its animation frames and
   interval timers stand still, so the phone is not running the editor's 40+ loops behind the other tabs. Everything resumes the moment you open the tab. */
(function(){
  var idle=false, held=new Map(), seq=0, nRAF=window.requestAnimationFrame.bind(window), nCAF=window.cancelAnimationFrame.bind(window), nSI=window.setInterval.bind(window);
  function busy(){ return !!window.__amiyoExporting; }
  window.__amiyoIdleStats={skipped:0,held:0};
  window.requestAnimationFrame=function(cb){
    var id=++seq+1e9;
    var nid=nRAF(function(t){ if(idle&&!busy()){ held.set(id,cb); window.__amiyoIdleStats.held++; } else cb(t); });
    return nid;
  };
  function flush(){ var t=performance.now(), list=Array.from(held.entries()); held.clear(); list.forEach(function(e){ try{ e[1](t); }catch(err){ console.warn(err); } }); }
  window.setInterval=function(fn,ms){
    var args=[].slice.call(arguments,2);
    return nSI(function(){ if(idle&&!busy()){ window.__amiyoIdleStats.skipped++; return; } if(typeof fn==="function") fn.apply(this,args); else (0,eval)(fn); },ms);
  };
  nSI(function(){ if(held.size&&(!idle||busy())) flush(); },400);
  window.addEventListener("message",function(ev){
    var d=ev.data; if(ev.source!==window.parent||!d||d.amiyo!==1||d.type!=="idle") return;
    var was=idle; idle=!!d.on; if(was&&!idle) flush();
  });
})();

;
/* ==================== Script 32 id="am-lagfix-s01" ==================== */
/* Lag fix step 1: calm frame loops. Four "always on" animation-frame loops (status-bar FPS counter, play-range watcher,
   playhead-follow loop, mixer-dock loop) ran 60x a second even when nothing was happening. While you are not playing,
   exporting, or touching/typing (last 2 s), those four now tick ~8x a second instead. The moment you play or touch
   anything they return to full speed. Nothing is removed; same code, same results. */
(function(){"use strict";
if(window.__amLagS1) return; window.__amLagS1=1;
var nRAF=window.requestAnimationFrame.bind(window), nCAF=window.cancelAnimationFrame.bind(window);
var last=performance.now(), fake=new Map(), seq=0, cache=new WeakMap();
var SIG=[/^function t\(n\)\{f\+\+;if\(n-last>1000/, /^function watch\(\)\s*\{\s*place\(\)/,
         /^function loop\(\)\{requestAnimationFrame\(loop\);if\(!on\|\|down\)return/,
         /^function loop\(\)\{\s*requestAnimationFrame\(loop\);\s*if\(A\.current\(\)!=='pp6mix'\)/];
function isIdleLoop(fn){ var v=cache.get(fn); if(v===undefined){ v=false; try{ var s=Function.prototype.toString.call(fn); for(var i=0;i<SIG.length;i++) if(SIG[i].test(s)){ v=true; break; } }catch(e){} cache.set(fn,v); } return v; }
function touch(){ last=performance.now(); }
["pointerdown","pointermove","touchstart","touchmove","keydown","wheel","mousedown"].forEach(function(t){ window.addEventListener(t,touch,{capture:true,passive:true}); });
function calm(){
  if(window.__amiyoExporting) return false;
  try{ if(isPlaying) return false; }catch(e){ return false; }
  return performance.now()-last>2000;
}
window.requestAnimationFrame=function(cb){
  if(typeof cb==="function" && isIdleLoop(cb) && calm()){
    var id=++seq+2e9;
    var tm=setTimeout(function(){ fake.delete(id); try{ cb(performance.now()); }catch(e){ try{ console.error(e); }catch(x){} } },125);
    fake.set(id,tm); return id;
  }
  return nRAF(cb);
};
window.cancelAnimationFrame=function(id){ if(id>2e9&&fake.has(id)){ clearTimeout(fake.get(id)); fake.delete(id); return; } return nCAF(id); };
window.__amLagS1stats=function(){ return {pending:fake.size}; };
})();

;
/* ==================== Script 33 id="amiyo-perf-governor" ==================== */
/* Smoothness governor. The editor has ~50 background timers and ~25 DOM watchers that all wake up at once and re-trigger each other.
   1) DOM watchers are batched: many changes -> one callback (whole-page watchers at most 4x/second, others 10x/second).
   2) Background timers are slowed (200-500ms -> 500ms) and skipped while you are scrolling/touching or the tab is hidden.
   Playback, export, hold-to-repeat buttons (<=100ms) and the 1s safety timers are untouched. */
(function(){
  if(window.__amiyoGov) return;
  var perf=window.__amiyoGov={moBatches:0,moRecords:0,skipped:0};
  var NativeMO=window.MutationObserver, hot=0;
  function exporting(){ return !!window.__amiyoExporting; }
  /* --- 1. batched MutationObserver --- */
  if(NativeMO){
    var PerfMO=function(cb){
      var self=this, recs=[], timer=0, last=0, gap=100, mo;
      function run(){
        timer=0;
        /* while an export is running the cosmetic/accessibility watchers have nothing useful to do: hold their changes and replay them once, after it ends */
        if(exporting() && recs.length){ timer=setTimeout(run,1500); return; }
        last=performance.now();
        if(!recs.length) return;
        var r=recs; recs=[]; perf.moBatches++; perf.moRecords+=r.length;
        try{ cb.call(self,r,self); }catch(e){ try{ window.__swl&&window.__swl(e); }catch(x){} }
      }
      mo=new NativeMO(function(list){
        for(var i=0;i<list.length;i++) recs.push(list[i]);
        if(recs.length>3000) recs.splice(0,recs.length-3000);
        if(timer) return;
        timer=setTimeout(run,Math.max(16,gap-(performance.now()-last)));
      });
      this.observe=function(t,o){
        try{ if(o&&o.subtree&&(t===document.body||t===document.documentElement||t===document)) gap=250; }catch(e){}
        return mo.observe(t,o);
      };
      this.disconnect=function(){ clearTimeout(timer); timer=0; recs=[]; return mo.disconnect(); };
      this.takeRecords=function(){ var r=recs.concat(mo.takeRecords()); recs=[]; return r; };
    };
    PerfMO.prototype=NativeMO.prototype;
    window.MutationObserver=PerfMO;
  }
  /* --- 2. calmer background timers --- */
  var NEEDS=/isPlaying|__amiyoExporting|\bplaying\b|currentTime|videoEl|\.paused|narrat|audioContext|exporting/, needCache=new WeakMap();
  function needsPlay(fn){ var v=needCache.get(fn); if(v===undefined){ try{ v=NEEDS.test(Function.prototype.toString.call(fn)); }catch(e){ v=true; } needCache.set(fn,v); } return v; }
  function playingNow(){ try{ return !!isPlaying; }catch(e){ return false; } }
  var SI=window.setInterval;
  window.setInterval=function(fn,ms){
    var a=[].slice.call(arguments), d=+ms||0, orig=d;
    if(typeof fn==="function" && d>=200 && d<500){ d=500; a[1]=500; }
    if(typeof fn==="function" && orig>=200 && orig<1000){
      var f=fn;
      a[0]=function(){
        if(!exporting() && (document.hidden || performance.now()-hot<150)){ perf.skipped++; return; }
        /* Plus smoothness step 1: while the video is playing, background watchers that do not look at playback are paused (they resume on pause) */
        if(!exporting() && playingNow() && !needsPlay(f)){ perf.skipped++; perf.calm=(perf.calm||0)+1; return; }
        return f.apply(this,arguments);
      };
    }
    return SI.apply(window,a);
  };
  window.amiyoBusyTouch=function(){ return performance.now()-hot<400; };
  ["touchmove","scroll","wheel","pointermove"].forEach(function(ev){
    window.addEventListener(ev,function(){ hot=performance.now(); },{capture:true,passive:true});
  });
  /* --- 3. cheaper painting on touch screens --- */
  var s=document.createElement("style"); s.id="amiyo-perf-css";
  s.textContent="@media (pointer:coarse){*{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}}html,body{-webkit-tap-highlight-color:transparent}#tracks,#timelineScroll{-webkit-overflow-scrolling:touch}";
  (document.head||document.documentElement).appendChild(s);
})();

;
/* ==================== Script 34 id="amiyo-step160-quiet" ==================== */
/* Step 1 (build plan 2): Quiet errors recorder. Places that catch an error and carry on now report here (deduplicated, capped at 80, no pop-ups). See Help > Problems log. */
(function(){"use strict";var MAX=80,list=[],map=Object.create(null),total=0;
window.__swl=function(e){try{total++;var n=(e&&e.name)||"Error",m=String((e&&e.message)||e||"unknown").replace(/\s+/g," ").slice(0,160),k=n+"|"+m,r=map[k];
if(r){r.n++;r.t=Date.now();return;}if(list.length>=MAX)return;var w="";try{var st=String(e&&e.stack||"").split("\n");for(var i=1;i<st.length;i++){if(st[i].indexOf("__swl")<0){w=st[i].trim().replace(/^at\s+/,"").slice(-90);break;}}}catch(x){}
r=map[k]={k:n,m:m,w:w,n:1,t:Date.now()};list.push(r);}catch(x){}};
window.amiyoQuiet={list:function(){return list.slice();},total:function(){return total;}};})();

;
/* ==================== Script 35 id="amiyo-lite-guard" ==================== */
/* Step 5: low-memory / lag guard. Every second it checks (a) how full the JavaScript heap is and (b) whether the page stalled.
   If the phone is struggling it switches to Lite mode BEFORE Chrome shows "isn't responding": picture strips, new thumbnails and new waveforms are turned off
   (editing, preview and export are untouched). A bar says so, with a button to turn them back on. */
(function(){
  var lite=false, last=performance.now(), strikes=[], bar=null, noAuto=0;
  window.__amiyoLite=false;
  document.addEventListener("visibilitychange",function(){ last=performance.now(); });
  function mem(){ try{ var m=performance.memory; if(m&&m.jsHeapSizeLimit) return m.usedJSHeapSize/m.jsHeapSizeLimit; }catch(e){window.__swl&&window.__swl(e)} return 0; }
  function showBar(why){
    if(!bar){
      bar=document.createElement("div"); bar.id="amiyoLiteBar"; bar.setAttribute("role","status");
      bar.style.cssText="position:fixed;left:8px;right:8px;top:calc(8px + env(safe-area-inset-top,0px));z-index:2147483000;display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;background:#3a2a10;border:1px solid #ffb454;color:#ffe6bd;font:500 12.5px/1.35 system-ui,sans-serif;box-shadow:0 6px 22px rgba(0,0,0,.5)";
      var t=document.createElement("span"); t.style.flex="1"; t.className="lt"; bar.appendChild(t);
      var b=document.createElement("button"); b.type="button"; b.textContent="Turn back on"; b.style.cssText="min-height:36px;padding:0 12px;border-radius:8px;border:0;background:#ffb454;color:#1a0c03;font:600 12.5px system-ui";
      b.onclick=function(){ noAuto=Date.now()+10*60*1000; set(false); }; bar.appendChild(b);
      var x=document.createElement("button"); x.type="button"; x.textContent="×"; x.setAttribute("aria-label","Dismiss"); x.style.cssText="min-height:36px;min-width:32px;border:0;background:none;color:#ffe6bd;font-size:20px";
      x.onclick=function(){ bar.style.display="none"; }; bar.appendChild(x);
    }
    bar.querySelector(".lt").textContent="Lite mode on: "+why+" New frame thumbnails are paused so the editor stays responsive.";
    bar.style.display="flex"; if(!bar.isConnected) document.body.appendChild(bar);
  }
  function set(on,why){
    if(lite===on) return; lite=on; window.__amiyoLite=on;
    if(on){
      try{ if(window.amiyoSnapNow) window.amiyoSnapNow("before slowdown",true); }catch(e){window.__swl&&window.__swl(e)}   /* Step 6: a stall often comes right before a crash, so save a recovery point now */
      showBar(why||"the phone is running low on memory.");
    } else {
      if(bar) bar.style.display="none";
      try{ if(typeof renderTracks==="function") renderTracks(); }catch(e){window.__swl&&window.__swl(e)}
    }
  }
  window.amiyoSetLite=set;
  setInterval(function(){
    var now=performance.now(), drift=now-last-1000; last=now;
    if(lite||Date.now()<noAuto||document.hidden||window.__amiyoExporting) return;
    var f=mem();
    if(f>0.8){ set(true,"memory is almost full."); return; }
    var _desk=!(window.matchMedia&&matchMedia("(pointer:coarse)").matches);   /* desktop: a busy moment is not a reason to hide the frames */
    if(_desk) return;
    if(drift>1200){ strikes.push(now); }
    strikes=strikes.filter(function(t){ return now-t<30000; });
    if(drift>2000||strikes.length>=2) set(true,"the editor was freezing.");
  },1000);
})();

;
/* ==================== Script 36 id="amiyo-pwa-head" ==================== */
/* Builds the web-app manifest in the page itself (so this stays one file) and catches the browser's install offer, which can fire before the rest of the page has loaded. */
(function(){
  try{
    window.__amiyoInstallEvt=null;
    window.addEventListener("beforeinstallprompt",function(e){ e.preventDefault(); window.__amiyoInstallEvt=e; try{ window.dispatchEvent(new Event("amiyo-install-ready")); }catch(_){} });
    if(!/^https?:$/.test(location.protocol)) return;
    var base=location.origin+location.pathname, scope=base.replace(/[^\/]*$/,"");
    var icons=[
      {src:"data:image/png;base64,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",sizes:"192x192",type:"image/png",purpose:"any"},
      {src:"data:image/png;base64,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",sizes:"512x512",type:"image/png",purpose:"any"},
      {src:"data:image/png;base64,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",sizes:"512x512",type:"image/png",purpose:"maskable"}
    ];
    var man={name:"Amiyo Studio",short_name:"Amiyo Studio",description:"Edit, cut, caption and export videos right in your browser.",id:base,start_url:base,scope:scope,display:"standalone",orientation:"any",background_color:"#0a0908",theme_color:"#0a0908",categories:["multimedia","video","productivity"],icons:icons,launch_handler:{client_mode:["focus-existing","auto"]},file_handlers:[{action:base,name:"Amiyo Editor media",accept:{"video/*":[".mp4",".mov",".webm",".mkv",".avi"],"audio/*":[".mp3",".wav",".m4a",".ogg"],"image/*":[".png",".jpg",".jpeg",".webp",".gif",".svg"],"application/json":[".amiyovideo"]}}]};
    var l=document.createElement("link"); l.rel="manifest"; l.href="data:application/manifest+json;charset=utf-8,"+encodeURIComponent(JSON.stringify(man));
    document.head.appendChild(l);
  }catch(e){ try{ console.warn("PWA manifest",e); }catch(_){} }
})();

;
/* ==================== Script 37 id="amiyo-w06-fonts" ==================== */
/* W06: web fonts load only when online and not in data-saver mode; offline/failed loads quietly use the system fallback stack. */
(function(){
 var U="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap",done=0;
 function load(){
  if(done||document.getElementById('amiyoFonts')) return;
  try{ var c=navigator.connection; if(c&&c.saveData) return; }catch(e){}
  if(navigator.onLine===false) return;
  done=1;
  var l=document.createElement('link'); l.id='amiyoFonts'; l.rel='stylesheet'; l.href=U; l.media='print';
  l.onload=function(){ l.media='all'; };
  l.onerror=function(){ done=0; try{ l.remove(); }catch(e){} };
  document.head.appendChild(l);
 }
 window.addEventListener('online',load);
 if(document.readyState==='complete') setTimeout(load,200); else window.addEventListener('load',function(){ setTimeout(load,200); });
})();

;
/* ==================== Script 38 id="amiyo-so3-s01-guard" ==================== */
/* Legacy scripts write an inline grid-template-rows onto .app (3-row, 4-row, ...). Inline !important beats every
   stylesheet rule, and the page's lag-fix throttles MutationObserver callbacks by 200-400ms, so an observer cannot undo it
   in time. Instead the write itself is ignored for .app while the desktop layout (> 1024px) is active; the stylesheet
   above owns the rows. Costs one string compare per setProperty call and removes the re-write churn. */
(function(){"use strict";var app=null;
function isApp(st){if(!app||!app.isConnected)app=document.querySelector(".app");return !!app&&st===app.style}
function desk(){return window.innerWidth>1024}
var CSD=window.CSSStyleDeclaration&&CSSStyleDeclaration.prototype;if(!CSD)return;
var sp=CSD.setProperty;
CSD.setProperty=function(n,v,p){if(n==="grid-template-rows"&&desk()&&isApp(this))return;return sp.call(this,n,v,p)};
var d=Object.getOwnPropertyDescriptor(CSD,"gridTemplateRows");
if(d&&d.set){Object.defineProperty(CSD,"gridTemplateRows",{configurable:true,enumerable:d.enumerable,get:d.get,set:function(v){if(desk()&&isApp(this))return;d.set.call(this,v)}})}
function clean(){if(!desk())return;var a=document.querySelector(".app");if(a&&a.style.getPropertyValue("grid-template-rows"))a.style.removeProperty("grid-template-rows")}
window.addEventListener("resize",clean,{passive:true});document.addEventListener("DOMContentLoaded",clean);window.addEventListener("load",clean);
})();
