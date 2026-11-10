/* Amiyo Studio - 06-range-fx.js */
/* Range FX engine, shaders and transitions */
/* Scripts 550 to 699 */


;
/* ==================== Script 550 id="amiyo-lib-step27-versions" ==================== */
/* Libraries step 27: Update from selection and versions.
   "Update from selection" re-captures the current selection (the same way "Save from your selection" does) and puts the new look into an item you
   already have, keeping its name, tags, folder, note and favourite. The old version is kept: "Versions" lists the last 5, and "Restore" swaps one back
   (the version you replace is kept too, so nothing is lost). */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__ver) return; L.__ver=true;
var open={}, MAXV=5;
function clone(o){ return o===undefined?undefined:JSON.parse(JSON.stringify(o)); }
function when(t){ var d=new Date(t); return d.toLocaleDateString(undefined,{day:"numeric",month:"short"})+" "+d.toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"}); }
function size(o){ try{ var n=JSON.stringify(o).length; return n<1024?n+" B":Math.round(n/102.4)/10+" KB"; }catch(e){ return ""; } }
function canUpdate(i){ var d=L.types()[i.type]; return !!(d&&d.capture&&i.type!=="palette"); }
function keep(it,c){
  var extra={}; Object.keys(c.extra||{}).forEach(function(k){ extra[k]=clone(it[k]); });
  return {at:Date.now(),data:clone(it.data),extra:extra,hadExtra:Object.keys(c.extra||{})};
}
function push(it,v){ it.versions=it.versions||[]; it.versions.unshift(v); if(it.versions.length>MAXV) it.versions.length=MAXV; }
L.hook("card",function(i){
  var h="", v=i.versions||[];
  if(canUpdate(i)||v.length){
    h+='<div style="display:flex;gap:6px">'+(canUpdate(i)?'<button type="button" data-k="up:'+i.id+'" style="flex:1;min-height:30px;font-size:11px">\u27f3 Update from selection</button>':"")+(v.length?'<button type="button" data-k="vr:'+i.id+'" aria-expanded="'+!!open[i.id]+'" style="min-height:30px;font-size:11px">\ud83d\udd58 Versions '+v.length+'</button>':"")+'</div>';
  }
  if(open[i.id]&&v.length) h+='<div style="border-top:1px solid #26231e;padding-top:5px;display:flex;flex-direction:column;gap:5px">'+v.map(function(x,n){ return '<div style="display:flex;gap:6px;align-items:center"><span class="note" style="flex:1">'+when(x.at)+' \u00b7 '+size(x.data)+'</span><button type="button" data-k="vrr:'+i.id+':'+n+'" style="min-height:28px;font-size:11px">Restore</button></div>'; }).join("")+'</div>';
  return h;
});
L.hook("act",function(k,api){
  var p=k.split(":");
  if(p[0]==="up"){
    var it=L.find(p[1]), d=it&&L.types()[it.type]; if(!it||!d||!d.capture) return true;
    var c; try{ c=d.capture(); }catch(e){ kit.say("Could not update: "+(e&&e.message||e),4000); return true; }
    if(!c||c.data===undefined) return true;
    var v=keep(it,c); push(it,v); it.data=clone(c.data); Object.keys(c.extra||{}).forEach(function(x){ it[x]=clone(c.extra[x]); });
    L.update(it.id,{at:it.at}); kit.say("Updated \u201c"+it.name+"\u201d. The old version is under Versions"); api.paint(); return true;
  }
  if(p[0]==="vr"){ open[p[1]]=!open[p[1]]; api.paint(); return true; }
  if(p[0]==="vrr"){
    var it2=L.find(p[1]), n=+p[2], v2=it2&&it2.versions&&it2.versions[n]; if(!v2) return true;
    var cur={at:Date.now(),data:clone(it2.data),extra:{},hadExtra:v2.hadExtra||[]}; (v2.hadExtra||[]).forEach(function(x){ cur.extra[x]=clone(it2[x]); });
    it2.versions.splice(n,1); it2.data=clone(v2.data); (v2.hadExtra||[]).forEach(function(x){ if(v2.extra[x]===undefined) delete it2[x]; else it2[x]=clone(v2.extra[x]); });
    push(it2,cur); L.update(it2.id,{at:it2.at}); kit.say("Version restored"); api.paint(); return true;
  }
  return false;
});
L.versions={max:MAXV};
try{ window.AMIYO_EDITOR_BUILD="vs-lib-step27-versions"; }catch(e){}
})();

;
/* ==================== Script 551 id="amiyo-lib-step28-smartsearch" ==================== */
/* Libraries step 28: Smart search and saved searches.
   Type filters straight into the search box next to ordinary words:  type:color  tag:brand  folder:intro  is:fav  is:pinned  is:unused  used:>3  new:7 (saved in the last 7 days)
   old:30  has:note  has:tags  has:versions.  Put a minus in front to exclude (-tag:old). Use _ for spaces (folder:my_folder).
   "Save this search" keeps the current search as a button in the library, one tap to run it again. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__smart) return; L.__smart=true;
var P={rules:[]}, tips=false, PILL="min-height:30px;padding:0 10px;border-radius:99px;font-size:11px;";
function lc(s){ return String(s||"").toLowerCase().replace(/_/g," "); }
function num(v){ var m=/^([<>]?)(\d+)$/.exec(v); return m?{op:m[1]||"=",n:+m[2]}:null; }
function cmpn(x,r){ return r.op===">"?x>r.n:r.op==="<"?x<r.n:x===r.n; }
function words(q){
  var out=[], rules=[];
  String(q||"").trim().split(/\s+/).forEach(function(t){
    if(!t) return; var neg=false, s=t; if(s.charAt(0)==="-"&&s.length>1&&s.indexOf(":")>0){ neg=true; s=s.slice(1); }
    var m=/^(type|tag|folder|is|used|new|old|has):(.+)$/i.exec(s);
    if(!m){ out.push(t.toLowerCase()); return; }
    var key=m[1].toLowerCase(), v=lc(m[2]), f=null, T=L.types();
    if(key==="type") f=function(i){ var d=T[i.type]||{}; return i.type===v||lc(d.label)===v||lc(d.label).indexOf(v)===0; };
    else if(key==="tag") f=function(i){ return (i.tags||[]).some(function(x){ return x===v; }); };
    else if(key==="folder") f=function(i){ return v==="none"?!i.folder:lc(i.folder)===v; };
    else if(key==="is") f=function(i){ return v==="fav"||v==="favourite"?!!i.fav:v==="pinned"||v==="pin"?!!i.pin:v==="unused"?!(i.uses>0):v==="used"?i.uses>0:false; };
    else if(key==="used"){ var r=num(v); f=r?function(i){ return cmpn(i.uses||0,r); }:function(){ return false; }; }
    else if(key==="new"){ var r2=num(v); f=r2?function(i){ return Date.now()-(i.at||0)<=r2.n*864e5; }:function(){ return false; }; }
    else if(key==="old"){ var r3=num(v); f=r3?function(i){ return Date.now()-(i.at||0)>r3.n*864e5; }:function(){ return false; }; }
    else if(key==="has") f=function(i){ return v==="note"?!!i.note:v==="tags"||v==="tag"?!!(i.tags&&i.tags.length):v==="versions"?!!(i.versions&&i.versions.length):v==="folder"?!!i.folder:false; };
    if(f) rules.push(neg?function(i){ return !f(i); }:f);
  });
  P.rules=rules; return out;
}
window.amiyoLibQ={words:words,parse:function(q){ var w=words(q); return {words:w,rules:P.rules.length}; }};
L.hook("filter",function(i){ for(var n=0;n<P.rules.length;n++){ try{ if(!P.rules[n](i)) return false; }catch(e){} } return true; });
function curQ(){ var el=document.getElementById("lbQ"); return el?el.value.trim():""; }
function setQ(v){ var el=document.getElementById("lbQ"); if(!el) return; el.value=v; el.dispatchEvent(new Event("input",{bubbles:true})); }
L.hook("tools",function(){
  var l=L.lib(), s=l.saved||[], q=curQ(), h='<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;align-items:center"><span class="note">Searches</span>';
  s.forEach(function(x,n){ h+='<span style="display:inline-flex;gap:2px"><button type="button" data-k="ss:'+n+'" style="'+PILL+(q&&q===x.q?"border-color:#ffb454;color:#ffb454":"")+'">\ud83d\udd0e '+kit.esc(x.name)+'</button><button type="button" data-k="sd:'+n+'" aria-label="Remove saved search" style="min-height:30px;min-width:28px;padding:0 6px;border-radius:99px;font-size:11px">\u2715</button></span>'; });
  if(q&&!s.some(function(x){ return x.q===q; })) h+='<button type="button" data-k="sv" style="'+PILL+'">\uff0b Save this search</button>';
  h+='<button type="button" data-k="stip" style="'+PILL+'" aria-expanded="'+tips+'">? Tips</button></div>';
  if(tips) h+='<div class="note" style="margin-top:4px;line-height:1.5">type:color \u00b7 tag:brand \u00b7 folder:intro \u00b7 is:fav \u00b7 is:pinned \u00b7 is:unused \u00b7 used:&gt;3 \u00b7 new:7 \u00b7 old:30 \u00b7 has:note \u00b7 has:tags \u00b7 has:versions. A minus excludes: -tag:old. Use _ for spaces.</div>';
  return h;
});
L.hook("act",function(k,api){
  if(k==="stip"){ tips=!tips; api.paint(); return true; }
  if(k==="sv"){ var q=curQ(); if(!q) return true; var nm=window.prompt("Name for this search",q.slice(0,24)); if(nm===null) return true; nm=String(nm).trim().slice(0,24)||q.slice(0,24); var l=L.lib(); l.saved=(l.saved||[]).concat([{name:nm,q:q}]).slice(-12); L.save(); L.update(l.items[0]?l.items[0].id:"",{}); api.paint(); return true; }
  if(k.indexOf("ss:")===0){ var x=(L.lib().saved||[])[+k.slice(3)]; if(x) setQ(x.q); return true; }
  if(k.indexOf("sd:")===0){ var l2=L.lib(); (l2.saved||[]).splice(+k.slice(3),1); L.save(); L.update(l2.items[0]?l2.items[0].id:"",{}); api.paint(); return true; }
  return false;
});
try{ window.AMIYO_EDITOR_BUILD="vs-lib-step28-smartsearch"; }catch(e){}
})();

;
/* ==================== Script 552 id="amiyo-lib-step29-dups" ==================== */
/* Libraries step 29: Find duplicates.
   "Find duplicates" looks through the open library for items that are exactly the same (same type and same content, even if the names differ),
   for example two copies of one colour or one text style. "Merge" keeps the most used copy, adds up the use counts, gathers the tags, favourite, pin,
   note and folder of all copies onto it, and moves the extra copies to Recently deleted. "Merge all" does every group at once (one undo step). */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__dups) return; L.__dups=true;
var open=false;
function key(i){ try{ return i.type+"|"+JSON.stringify(i.data); }catch(e){ return null; } }
function groups(){
  var m={}, out=[];
  L.lib().items.forEach(function(i){ if(i.type==="palette") return; var k=key(i); if(!k) return; (m[k]=m[k]||[]).push(i); });
  Object.keys(m).forEach(function(k){ if(m[k].length>1) out.push(m[k]); });
  return out.sort(function(a,b){ return b.length-a.length; });
}
function best(arr){ return arr.slice().sort(function(a,b){ return (b.uses||0)-(a.uses||0)||(b.fav?1:0)-(a.fav?1:0)||(b.at||0)-(a.at||0); })[0]; }
function merge(arr){
  var keep=best(arr), others=arr.filter(function(x){ return x!==keep; }), tags=(keep.tags||[]).slice(), uses=keep.uses||0, last=keep.last||0;
  others.forEach(function(o){ (o.tags||[]).forEach(function(t){ if(tags.indexOf(t)<0) tags.push(t); }); uses+=o.uses||0; last=Math.max(last,o.last||0); if(o.fav) keep.fav=true; if(o.pin) keep.pin=true; if(!keep.note&&o.note) keep.note=o.note; if(!keep.folder&&o.folder) keep.folder=o.folder; });
  keep.tags=L.tags?L.tags.norm(tags):tags.slice(0,12); keep.uses=uses; if(last) keep.last=last;
  L.update(keep.id,{}); others.forEach(function(o){ L.remove(o.id); });
  return others.length;
}
L.hook("tools",function(){
  var b='<button type="button" data-k="dfx" style="min-height:34px;margin-top:8px;'+(open?"border-color:#ffb454;color:#ffb454":"")+'">\ud83e\uddec Find duplicates</button>';
  if(!open) return b;
  var g=groups(), extra=g.reduce(function(n,a){ return n+a.length-1; },0);
  if(!g.length) return b+'<div class="note" style="margin-top:6px">No duplicates in this library.</div>';
  var h=b+'<div style="border:1px solid #302c26;border-radius:10px;padding:8px;margin-top:6px;display:flex;flex-direction:column;gap:6px"><div class="note">'+g.length+' group'+(g.length>1?"s":"")+' \u00b7 '+extra+' extra cop'+(extra>1?"ies":"y")+'</div><button type="button" data-k="dfa" style="min-height:34px">Merge all ('+extra+')</button>';
  g.slice(0,20).forEach(function(a,n){ var t=L.types()[a[0].type]||{}; h+='<div style="display:grid;grid-template-columns:1fr auto;gap:6px;align-items:center"><div style="min-width:0"><b style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px">'+kit.esc(a.map(function(x){ return x.name; }).join(" \u00b7 "))+'</b><span class="note">'+kit.esc(t.label||a[0].type)+' \u00d7'+a.length+'</span></div><button type="button" data-k="dfm:'+n+'" style="min-height:32px">Merge</button></div>'; });
  return h+'</div>';
});
L.hook("act",function(k,api){
  if(k==="dfx"){ open=!open; api.paint(); return true; }
  if(k==="dfa"){ var g=groups(), n=0; g.forEach(function(a){ n+=merge(a); }); kit.say(n+" duplicate"+(n===1?"":"s")+" merged"); api.paint(); return true; }
  if(k.indexOf("dfm:")===0){ var a=groups()[+k.slice(4)]; if(a){ var n2=merge(a); kit.say(n2+" duplicate"+(n2===1?"":"s")+" merged"); } api.paint(); return true; }
  return false;
});
L.dups={groups:groups,merge:merge};
try{ window.AMIYO_EDITOR_BUILD="vs-lib-step29-dups"; }catch(e){}
})();

;
/* ==================== Script 553 id="amiyo-lib-step30-lookmodes" ==================== */
/* Libraries step 30: Look apply modes.
   Looks used to replace everything on the clip. A "Look apply" switch above the list now picks how a Look is applied: Replace (as before), Add on top (the
   effects are added after the clip's own and the look's filter, LUT and colour settings overwrite only what the look has), Effects only (just add the
   effects) or Colour only (filter, LUT, wheels and preset, leaving the effects stack alone). Your choice is remembered. One undo step. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__lookmode) return; L.__lookmode=true;
var T=L.types(); if(!T.look||!T.look.apply) return;
var COLOR=["filter","filterAmt","lut","lutAmt","colorWheels","colorPreset","blendMode"], MODES=[["replace","Replace"],["add","Add on top"],["fx","Effects only"],["color","Colour only"]], MODE="replace";
try{ var m=localStorage.getItem("amiyo_vslib_lookmode"); if(MODES.some(function(x){ return x[0]===m; })) MODE=m; }catch(e){}
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function vis(){ return kit.sel().filter(function(x){ return !x.clip.textStyle&&x.track.kind!=="audio"&&x.track.kind!=="caption"; }); }
function has(v,k){ if(v==null||v===""||v===false) return false; if(Array.isArray(v)) return v.length>0; if(k==="filter") return v!=="none"; if(k==="blendMode") return v!=="normal"; return true; }
function fresh(fx){ return (fx||[]).map(function(x){ var n=clone(x); if(n&&typeof n==="object"&&typeof uid==="function") n.id=uid("fx"); return n; }); }
var orig=T.look.apply;
T.look.apply=function(it){
  if(MODE==="replace") return orig(it);
  var V=vis(); if(!V.length){ kit.say("Select one or more video, image or adjustment clips first"); return false; }
  var d=clone(it.data||{}), nFx=(d.effects||[]).length, hasColor=COLOR.some(function(k){ return has(d[k],k); });
  if(MODE==="fx"&&!nFx){ kit.say("This look has no effects to add"); return false; }
  if(MODE==="color"&&!hasColor){ kit.say("This look has no colour settings"); return false; }
  kit.edit("Apply look ("+MODE+")",function(){
    V.forEach(function(x){
      var c=x.clip;
      if(MODE==="add"||MODE==="fx"){ c.effects=(c.effects||[]).concat(fresh(d.effects)); }
      if(MODE==="add"||MODE==="color"){ COLOR.forEach(function(k){ if(has(d[k],k)) c[k]=clone(d[k]); }); }
      if(!c.effects) c.effects=[];
    });
  });
  return {add:"Look added on top of ",fx:"Effects added to ",color:"Colour look applied to "}[MODE]+V.length+" clip"+(V.length>1?"s":"");
};
L.hook("tools",function(){
  if(!L.lib().items.some(function(i){ return i.type==="look"; })) return "";
  return '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;align-items:center"><span class="note">Look apply</span>'+MODES.map(function(x){ return '<button type="button" data-k="lmd:'+x[0]+'" aria-pressed="'+(MODE===x[0])+'" style="min-height:30px;padding:0 10px;border-radius:99px;font-size:11px;'+(MODE===x[0]?"border-color:#ffb454;color:#ffb454":"")+'">'+x[1]+'</button>'; }).join("")+'</div>';
});
L.hook("act",function(k,api){ if(k.indexOf("lmd:")===0){ MODE=k.slice(4); try{ localStorage.setItem("amiyo_vslib_lookmode",MODE); }catch(e){} api.paint(); return true; } return false; });
L.lookMode=function(){ return MODE; };
try{ window.AMIYO_EDITOR_BUILD="vs-lib-step30-lookmodes"; }catch(e){}
})();

;
/* ==================== Script 554 id="amiyo-lib-step31-markers" ==================== */
/* Libraries step 31: Marker sets.
   "+ Markers" saves every marker of the project (time, label, colour) as one item. Apply adds the set at the playhead (the first marker lands on the playhead,
   the rest keep their spacing), so a chapter or beat layout made once can be reused in any project. Markers already at the same time with the same label
   are skipped. One undo step. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__markers) return; L.__markers=true;
function tc(t){ var s=Math.max(0,Math.round(t)); return Math.floor(s/60)+":"+(s%60<10?"0":"")+(s%60); }
L.type("markers",{label:"Marker set",icon:"\u2691",
  preview:function(i){ var m=i.data.list||[]; return '<span style="min-width:44px;height:38px;border-radius:9px;flex:none;background:#1b1915;border:1px solid #302c26;display:flex;align-items:center;justify-content:center;gap:2px;font:700 11px system-ui;color:#ffb454">\u2691 '+m.length+'</span>'; },
  capture:function(){
    var ms=(project.markers||[]).slice().sort(function(a,b){ return a.time-b.time; });
    if(!ms.length){ kit.say("This project has no markers yet"); return null; }
    var t0=ms[0].time;
    return {name:"Markers \u00d7"+ms.length+" ("+tc(t0)+"\u2013"+tc(ms[ms.length-1].time)+")",data:{list:ms.map(function(m){ return {dt:Math.round((m.time-t0)*1000)/1000,label:m.label||"Marker",color:m.color||"#ff8040",beat:m.beat||undefined,bar:m.bar||undefined}; })}};
  },
  apply:function(it){
    var list=(it.data&&it.data.list)||[]; if(!list.length){ kit.say("This set is empty"); return false; }
    var at=typeof currentTime==="number"?currentTime:0, n=0;
    kit.edit("Apply marker set",function(){
      project.markers=project.markers||[];
      list.forEach(function(x){
        var t=Math.round((at+x.dt)*1000)/1000;
        if(project.markers.some(function(m){ return Math.abs(m.time-t)<0.001&&(m.label||"")===x.label; })) return;
        var o={id:(typeof uid==="function"?uid("marker"):"mk"+Math.random().toString(36).slice(2,8)),time:t,label:x.label,color:x.color};
        if(x.beat) o.beat=true; if(x.bar) o.bar=x.bar; project.markers.push(o); n++;
      });
      project.markers.sort(function(a,b){ return a.time-b.time; });
    });
    return n?n+" marker"+(n>1?"s":"")+" added at the playhead":"Those markers are already there";
  }});
try{ window.AMIYO_EDITOR_BUILD="vs-lib-step31-markers"; }catch(e){}
})();

;
/* ==================== Script 555 id="amiyo-lib-step32-format" ==================== */
/* Libraries step 32: Project format presets.
   "+ Project format" saves the picture size, frame rate, aspect, background colour or gradient and preview quality of the open project (for example
   "Reels 1080x1920 30 fps" or "YouTube 1080p 25 fps"). Apply sets them on the project you have open, in one undo step. Clips keep their relative
   positions. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__format) return; L.__format=true;
var KEYS=["width","height","fps","aspect","background","bgGradient","previewQuality"];
function clone(o){ return o===undefined?undefined:JSON.parse(JSON.stringify(o)); }
L.type("format",{label:"Project format",icon:"\u25ad",
  preview:function(i){ var d=i.data, w=d.width||16, h=d.height||9, k=38/Math.max(w,h); return '<span style="width:44px;height:38px;flex:none;display:flex;align-items:center;justify-content:center"><span style="display:block;width:'+Math.max(10,Math.round(w*k*.9))+'px;height:'+Math.max(10,Math.round(h*k*.9))+'px;border:2px solid #ffb454;border-radius:3px;background:'+(/^#[0-9a-f]{3,8}$/i.test(d.background||"")?d.background:"#14120f")+'"></span></span>'; },
  capture:function(){
    var s=project.settings||{}; if(!s.width||!s.height){ kit.say("No project format to save"); return null; }
    var d={}; KEYS.forEach(function(k){ if(s[k]!=null) d[k]=clone(s[k]); });
    return {name:s.width+"\u00d7"+s.height+" \u00b7 "+(s.fps||30)+" fps"+(s.aspect?" \u00b7 "+s.aspect:""),data:d};
  },
  apply:function(it){
    var d=it.data||{}, s=project.settings; if(!d.width||!d.height){ kit.say("This preset has no size"); return false; }
    if(s.width===d.width&&s.height===d.height&&s.fps===d.fps&&s.background===d.background){ kit.say("The project already uses this format"); return false; }
    kit.edit("Apply project format",function(){ KEYS.forEach(function(k){ if(d[k]===undefined) delete s[k]; else s[k]=clone(d[k]); }); });
    return "Project is now "+d.width+"\u00d7"+d.height+" at "+(d.fps||30)+" fps";
  }});
try{ window.AMIYO_EDITOR_BUILD="vs-lib-step32-format"; }catch(e){}
})();

;
/* ==================== Script 556 id="amiyo-lib-step33-kits" ==================== */
/* Libraries step 33: Kits.
   Turn on Select, pick two or more items (for example a colour, a text style and a transition) and tap "Make kit". The kit keeps a copy of each item.
   Apply runs the members in order on your current selection / playhead, so a whole brand look goes on in one tap. Each member is its own undo step.
   Members that cannot apply right now (for example a text style with no text selected) are skipped and the message says how many went on. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__kits||!L.bulk) return; L.__kits=true;
var META=["id","versions","tags","fav","pin","ord","folder","note","uses","last","at"];
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function member(i){ var m=clone(i); META.forEach(function(k){ delete m[k]; }); return m; }
L.type("kit",{label:"Kit",icon:"\ud83e\uddf0",
  preview:function(i){ var n=(i.data.members||[]).length; return '<span style="min-width:44px;height:38px;border-radius:9px;flex:none;background:#1b1915;border:1px solid #302c26;display:flex;align-items:center;justify-content:center;font:700 11px system-ui;color:#ffb454">\ud83e\uddf0 '+n+'</span>'; },
  apply:function(it){
    var ms=(it.data&&it.data.members)||[], T=L.types(), ok=0, skipped=[];
    ms.forEach(function(m,n){
      var d=T[m.type]; if(!d||!d.apply){ skipped.push(m.name); return; }
      var pseudo=clone(m); pseudo.id="kitpart"+n;
      try{ var r=d.apply(pseudo); if(r===false) skipped.push(m.name); else ok++; }catch(e){ skipped.push(m.name); }
    });
    if(!ok){ kit.say("Nothing from this kit could be applied here"); return false; }
    return "Kit applied: "+ok+" of "+ms.length+(skipped.length?" (skipped: "+skipped.slice(0,3).join(", ")+(skipped.length>3?"\u2026":"")+")":"");
  }});
L.hook("tools",function(){
  if(!L.bulk.active()) return "";
  var n=L.bulk.ids().filter(function(id){ var i=L.find(id); return i&&i.type!=="kit"; }).length;
  return n>=2?'<div style="margin-top:6px"><button type="button" data-k="kmk" style="min-height:34px;padding:0 12px">\ud83e\uddf0 Make kit from '+n+' items</button></div>':"";
});
L.hook("card",function(i){
  if(i.type!=="kit") return "";
  return '<div class="note" style="line-height:1.4">'+((i.data.members||[]).map(function(m){ return kit.esc(m.name); }).join(" \u2192 "))+'</div>';
});
L.hook("act",function(k,api){
  if(k!=="kmk") return false;
  var mem=L.bulk.ids().map(L.find).filter(function(i){ return i&&i.type!=="kit"; });
  if(mem.length<2) return true;
  var nm=window.prompt("Kit name","Kit \u00d7"+mem.length); if(nm===null) return true; nm=String(nm).trim().slice(0,60)||"Kit";
  mem.sort(function(a,b){ return (a.at||0)-(b.at||0); });
  L.add("kit",nm,{members:mem.map(member)}); L.bulk.clear(); kit.say("Kit made from "+mem.length+" items"); api.paint(); return true;
});
try{ window.AMIYO_EDITOR_BUILD="vs-lib-step33-kits"; }catch(e){}
})();

;
/* ==================== Script 557 id="rfx-steps" ==================== */
/* ===== Range FX Step 1: engine for "parts" (time ranges inside a clip) with zoom + effects, and the Parts panel ===== */
(function(){
if(window.RFX) return;
var R=window.RFX={v:1,sel:null,sections:[],hooks:{}};
function cl(a,b,x){return Math.min(b,Math.max(a,x));}
function C(){var f=getClip();return f?f.clip:null;}
R.clip=C;
R.list=function(c){c=c||C();if(!c)return[];c.ranges=c.ranges||[];return c.ranges;};
R.get=function(id){return R.list().filter(function(r){return r.id===id;})[0]||null;};
R.save=function(){try{scheduleAutosave();}catch(e){}};
R.redraw=function(){try{renderPreviewFrame();}catch(e){}};
R.say=function(m){try{notify(m,2600);}catch(e){}};
R.add=function(o){
  var c=C(); if(!c){R.say("Select a clip on the timeline first");return null;}
  var local=cl(0,Math.max(0,c.duration-.3),currentTime-c.start);
  var len=Math.min((o&&o.len)||2,c.duration-local);
  var r=Object.assign({id:uid("rg"),name:"Part "+(R.list(c).length+1),s:+local.toFixed(2),e:+(local+len).toFixed(2),zoom0:1,zoom1:1,fx:{},ease:"smooth",on:true},o||{});
  delete r.len;
  transact("Add part",function(){R.list(c).push(r);});
  R.sel=r.id;R.save();R.render();return r;
};
R.remove=function(id){var c=C();if(!c)return;transact("Delete part",function(){c.ranges=R.list(c).filter(function(r){return r.id!==id;});});if(R.sel===id)R.sel=null;R.save();R.render();};
/* progress inside a part (0..1) with easing */
R.prog=function(r,l){var p=cl(0,1,(l-r.s)/Math.max(.001,r.e-r.s));return r.ease==="linear"?p:p*p*(3-2*p);};
R.strength=function(r,l){return 1;}; /* extended by later steps (fade in/out) */
R.filterOf=function(r,k){
  var f=r.fx||{},o=[];
  if(f.blur>0)o.push("blur("+(f.blur*k).toFixed(2)+"px)");
  if(f.bright)o.push("brightness("+Math.max(0,1+f.bright*k).toFixed(3)+")");
  if(f.contrast&&f.contrast!==1)o.push("contrast("+(1+(f.contrast-1)*k).toFixed(3)+")");
  if(f.sat!=null&&f.sat!==1)o.push("saturate("+Math.max(0,1+(f.sat-1)*k).toFixed(3)+")");
  if(f.gray>0)o.push("grayscale("+cl(0,1,f.gray*k).toFixed(3)+")");
  if(f.sepia>0)o.push("sepia("+cl(0,1,f.sepia*k).toFixed(3)+")");
  if(f.hue)o.push("hue-rotate("+(f.hue*k).toFixed(1)+"deg)");
  return o.join(" ");
};
/* what applies right now on a clip */
R.state=function(c,l){
  var z=1,fx=[],fxp=.5,fyp=.5,any=false;
  (c.ranges||[]).forEach(function(r){
    if(r.on===false||l<r.s||l>r.e)return;
    any=true;
    var p=R.prog(r,l);
    z*=(r.zoom0||1)+((r.zoom1||1)-(r.zoom0||1))*p;
    if(r.fx&&r.zoom0!==r.zoom1||r.fx0!=null){}
    if(r.px!=null){fxp=r.px;fyp=r.py;}
    var f=R.filterOf(r,R.strength(r,l));if(f)fx.push(f);
  });
  return any?{z:z,fx:fx.join(" "),px:fxp,py:fyp}:null;
};
/* ---- render hooks ---- */
var pend=null;
var oc=window.amiyoCleanFilter;
if(typeof oc==="function"){
  window.amiyoCleanFilter=function(f){
    pend=null;
    try{
      var vc=activeClipAt(currentTime,"video");
      if(vc&&vc.clip&&vc.clip.ranges&&vc.clip.ranges.length){
        var st=R.state(vc.clip,currentTime-vc.clip.start);
        if(st){ if(st.z!==1)pend={z:st.z,px:st.px,py:st.py,t:performance.now()}; if(st.fx)f=(f||"none")+" "+st.fx; }
      }
    }catch(e){}
    return oc.call(this,f);
  };
}
try{
  var od=ctx.drawImage.bind(ctx);
  ctx.drawImage=function(im,a,b,w,h){
    var p=pend;
    if(p&&arguments.length===5&&performance.now()-p.t<80&&(im===videoEl||(typeof HTMLImageElement!=="undefined"&&im instanceof HTMLImageElement))){
      pend=null;var z=p.z;
      return od(im,a*z+(p.px-.5)*w*(1-z),b*z+(p.py-.5)*h*(1-z),w*z,h*z);
    }
    return od.apply(null,arguments);
  };
}catch(e){console.warn("RFX draw hook",e);}
/* ---- panel ---- */
var st=document.createElement("style");
st.textContent=".rfx-sheet{position:fixed;left:0;right:0;bottom:0;max-height:74vh;overflow:auto;background:#12151b;border-top:1px solid #40312a;border-radius:14px 14px 0 0;z-index:99990;padding:10px 12px 18px;color:#e6eaf0;font-size:12px;box-shadow:0 -8px 30px rgba(0,0,0,.5)}"+
".rfx-sheet h4{margin:10px 0 6px;font-size:12px;color:#ffb454;letter-spacing:.04em;text-transform:uppercase}"+
".rfx-top{display:flex;align-items:center;gap:8px;position:sticky;top:-10px;background:#12151b;padding:6px 0;z-index:2}.rfx-top b{flex:1;font-size:14px}"+
".rfx-card{border:1px solid #40312a;border-radius:10px;padding:8px;margin:6px 0;background:#261d18}.rfx-card.on{border-color:#ff7a3d}"+
".rfx-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:4px 0}.rfx-row label{font-size:11px;color:#9aa5b5;min-width:64px}"+
".rfx-row input[type=range]{flex:1;min-width:110px}.rfx-row input[type=number]{width:70px;min-height:38px;background:#0e1117;color:#fff;border:1px solid #40312a;border-radius:8px;padding:0 6px;font-size:14px}"+
".rfx-b{min-height:40px;padding:0 12px;border-radius:9px;border:1px solid #40312a;background:#352720;color:#fff;font-size:12px}.rfx-b.p{background:#ff7a3d;border-color:#ff7a3d;color:#111;font-weight:700}"+
".rfx-note{color:#8995a8;font-size:11px;line-height:1.4;margin:4px 0}";
document.head.appendChild(st);
var sheet=null;
R.section=function(name,fn,bind){R.sections.push({name:name,fn:fn,bind:bind});};
R.open=function(){if(!sheet){sheet=document.createElement("div");sheet.className="rfx-sheet";sheet.id="rfxSheet";document.body.appendChild(sheet);}sheet.style.display="block";R.render();};
R.close=function(){if(sheet)sheet.style.display="none";};
R.render=function(){
  if(!sheet||sheet.style.display==="none")return;
  var c=C(),h='<div class="rfx-top"><b>🎯 Parts &amp; Effects</b><button class="rfx-b" data-x="close">Close</button></div>';
  if(!c){h+='<div class="rfx-note">Select a clip on the timeline, move the playhead where the part should start, then tap “Add part”.</div>';sheet.innerHTML=h;sheet.querySelector('[data-x=close]').onclick=R.close;return;}
  R.sections.forEach(function(s){try{h+=s.fn(c,R.get(R.sel));}catch(e){console.warn(s.name,e);}});
  sheet.innerHTML=h;
  sheet.querySelector('[data-x=close]').onclick=R.close;
  R.sections.forEach(function(s){try{if(s.bind)s.bind(sheet,c,R.get(R.sel));}catch(e){console.warn(s.name,e);}});
};
R.num=function(root,sel,fn){var el=root.querySelector(sel);if(!el)return;el.addEventListener("input",function(){fn(+el.value);R.redraw();});el.addEventListener("change",function(){R.save();R.render();});};
function fmt(t){return (+t).toFixed(1)+"s";}
/* section: parts list */
R.section("parts",function(c,r){
  var h='<h4>Parts of this clip</h4><div class="rfx-note">A part is a piece of the clip (for example 3s–6s) that can have its own zoom, speed and effects.</div>';
  h+='<div class="rfx-row"><button class="rfx-b p" data-x="add">+ Add part at playhead (2s)</button></div>';
  R.list(c).forEach(function(p){
    h+='<div class="rfx-card'+(r&&r.id===p.id?' on':'')+'" data-pid="'+p.id+'"><div class="rfx-row"><b style="flex:1">'+p.name+' · '+fmt(p.s)+' → '+fmt(p.e)+'</b><button class="rfx-b" data-x="tog" data-id="'+p.id+'">'+(p.on===false?'Off':'On')+'</button><button class="rfx-b" data-x="del" data-id="'+p.id+'">✕</button></div></div>';
  });
  if(r){
    h+='<h4>Selected: '+r.name+'</h4><div class="rfx-row"><label>Start (s)</label><input type="number" step="0.1" min="0" id="rfxS" value="'+r.s+'"><label>End (s)</label><input type="number" step="0.1" min="0" id="rfxE" value="'+r.e+'"></div>';
    h+='<div class="rfx-row"><label>Zoom start</label><input type="range" id="rfxZ0" min="0.5" max="4" step="0.05" value="'+r.zoom0+'"><span>'+r.zoom0+'×</span></div>';
    h+='<div class="rfx-row"><label>Zoom end</label><input type="range" id="rfxZ1" min="0.5" max="4" step="0.05" value="'+r.zoom1+'"><span>'+r.zoom1+'×</span></div>';
  }
  return h;
},function(root,c,r){
  root.querySelector('[data-x=add]').onclick=function(){R.add();};
  root.querySelectorAll('[data-pid]').forEach(function(el){el.addEventListener("click",function(e){if(e.target.closest("button"))return;R.sel=el.dataset.pid;var p=R.get(R.sel);if(p&&c){try{currentTime=c.start+p.s;}catch(x){}}R.render();R.redraw();});});
  root.querySelectorAll('[data-x=del]').forEach(function(b){b.onclick=function(){R.remove(b.dataset.id);};});
  root.querySelectorAll('[data-x=tog]').forEach(function(b){b.onclick=function(){var p=R.get(b.dataset.id);if(p){p.on=p.on===false;R.save();R.render();R.redraw();}};});
  if(!r)return;
  R.num(root,"#rfxS",function(v){r.s=cl(0,r.e-.1,v);});R.num(root,"#rfxE",function(v){r.e=cl(r.s+.1,c.duration,v);});
  R.num(root,"#rfxZ0",function(v){r.zoom0=v;});R.num(root,"#rfxZ1",function(v){r.zoom1=v;});
});
function addBtn(){
  if(document.getElementById("rfxBtn"))return;
  var bar=document.querySelector(".timeline-toolbar");if(!bar)return;
  var b=document.createElement("button");b.type="button";b.className="toolbtn";b.id="rfxBtn";b.textContent="🎯 Parts";b.title="Zoom, speed, blur and effects on one part of a clip";
  b.addEventListener("click",R.open);bar.appendChild(b);
}
addBtn();setTimeout(addBtn,600);setTimeout(addBtn,2500);
window.addEventListener("keydown",function(e){if(e.shiftKey&&(e.key==="P"||e.key==="p")&&!/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||"")){e.preventDefault();R.open();}});
setInterval(function(){if(sheet&&sheet.style.display!=="none"&&!sheet.contains(document.activeElement)){var sig=(selectedClipId||"")+"|"+R.list().length;if(sig!==R._sig){R._sig=sig;R.render();}}},700);
})();

/* ===== Range FX Step 2: zoom in / zoom out presets, easing, quick zoom at playhead ===== */
(function(){
var R=window.RFX; if(!R) return;
var P=[
 ["Zoom in 1.5×",1,1.5],["Zoom in 2×",1,2],["Zoom in 3×",1,3],["Zoom in 4×",1,4],
 ["Zoom out 0.8×",1,.8],["Zoom out 0.6×",1,.6],["Zoom out from 2×",2,1],["Zoom out from 3×",3,1],
 ["Hold 1.5×",1.5,1.5],["Hold 2×",2,2],["Punch 1→2→1",1,2,"punch"],["Reset zoom",1,1]
];
R.section("zoompresets",function(c,r){
  var h='<h4>Zoom in / zoom out</h4><div class="rfx-note">'+(r?'Tap a preset to set the zoom for “'+r.name+'”.':'Tap a preset: a 2s part is added at the playhead and zoomed. Zoom out below 1× shows the frame smaller.')+'</div><div class="rfx-row" style="gap:5px">';
  P.forEach(function(p,i){h+='<button class="rfx-b" data-zp="'+i+'">'+p[0]+'</button>';});
  h+='</div>';
  if(r)h+='<div class="rfx-row"><label>Motion</label><select id="rfxEase" class="rfx-b"><option value="smooth"'+(r.ease!=="linear"?' selected':'')+'>Smooth (ease)</option><option value="linear"'+(r.ease==="linear"?' selected':'')+'>Linear</option></select><label>Name</label><input id="rfxName" class="rfx-b" style="width:120px;text-align:left" value="'+(r.name||"").replace(/"/g,"&quot;")+'"></div>';
  return h;
},function(root,c,r){
  root.querySelectorAll("[data-zp]").forEach(function(b){b.onclick=function(){
    var p=P[+b.dataset.zp],t=r;
    if(!t)t=R.add({name:p[0]});
    if(!t)return;
    t.zoom0=p[1];t.zoom1=p[2];t.punch=p[3]==="punch";
    if(!t.name||/^Part \d+$/.test(t.name))t.name=p[0];
    R.save();R.render();R.redraw();
  };});
  var e=root.querySelector("#rfxEase");if(e)e.onchange=function(){r.ease=e.value;R.save();R.redraw();};
  var n=root.querySelector("#rfxName");if(n)n.onchange=function(){r.name=n.value.slice(0,30)||r.name;R.save();R.render();};
});
/* punch: goes up to zoom1 at the middle and back to zoom0 */
var op=R.prog;
R.prog=function(r,l){
  var p=op(r,l);
  if(r.punch){var q=Math.min(1,Math.max(0,(l-r.s)/Math.max(.001,r.e-r.s)));q=q<.5?q*2:(1-q)*2;return r.ease==="linear"?q:q*q*(3-2*q);}
  return p;
};
})();

/* ===== Range FX Step 3: speed of one part (2x, 4x, slow-mo) - splits the clip and ripples the timeline ===== */
(function(){
var R=window.RFX; if(!R) return;
function sl(rs,a,b){var o=[];(rs||[]).forEach(function(r){var s=Math.max(r.s,a),e=Math.min(r.e,b);if(e-s<.05)return;var n=JSON.parse(JSON.stringify(r));n.id=uid("rg");n.s=+(s-a).toFixed(3);n.e=+(e-a).toFixed(3);o.push(n);});return o;}
function cut(tr,clip,t){
  if(!(t>.03&&t<clip.duration-.03))return null;
  var old=clip.duration,rg=clip.ranges||[],srcDur=(clip.outPoint!=null?clip.outPoint:old)-(clip.inPoint||0);
  var right=deepClone(clip);right.id=uid("clip");right.start=clip.start+t;right.duration=old-t;
  var inP=(clip.inPoint||0)+srcDur*(t/old);right.inPoint=inP;clip.outPoint=inP;clip.duration=t;
  right.ranges=sl(rg,t,old);clip.ranges=sl(rg,0,t);
  right.transitionIn=null;clip.transitionOut=null;right.selected=false;
  tr.clips.splice(tr.clips.indexOf(clip)+1,0,right);return right;
}
R._cut=cut;
function trackOf(c){for(var i=0;i<project.tracks.length;i++)if(project.tracks[i].clips.indexOf(c)>=0)return project.tracks[i];return null;}
R._trackOf=trackOf;R._group=function(c){var g=[c];if(c.linkId)project.tracks.forEach(function(t){t.clips.forEach(function(o){if(o!==c&&o.linkId===c.linkId&&Math.abs(o.start-c.start)<.01&&Math.abs(o.duration-c.duration)<.01)g.push(o);});});return g;};
R.speedPart=function(rid,factor){
  var c=R.clip(),r=R.get(rid||R.sel);
  if(!c||!r){R.say("Add or select a part first");return;}
  factor=Math.min(8,Math.max(.1,+factor||1));if(factor===1)return;
  var group=[c];
  if(c.linkId)project.tracks.forEach(function(t){t.clips.forEach(function(o){if(o!==c&&o.linkId===c.linkId&&Math.abs(o.start-c.start)<.01&&Math.abs(o.duration-c.duration)<.01)group.push(o);});});
  var a=r.s,b=r.e,out=null;
  transact("Part speed ×"+factor,function(){
    group.forEach(function(g,gi){
      var tr=trackOf(g);if(!tr)return;
      var post=cut(tr,g,b),mid=cut(tr,g,a)||g;
      var oldDur=mid.duration,oldEnd=mid.start+oldDur;
      var srcLen=(mid.outPoint!=null?mid.outPoint:oldDur)-(mid.inPoint||0);
      mid.speed=(mid.speed||1)*factor;
      var nd=Math.max(.05,srcLen/mid.speed),delta=nd-oldDur;
      mid.duration=nd;
      (mid.ranges||[]).forEach(function(q){q.s=+(q.s/factor).toFixed(3);q.e=+(q.e/factor).toFixed(3);});
      tr.clips.forEach(function(x){if(x!==mid&&x.start>=oldEnd-.001)x.start=Math.max(0,x.start+delta);});
      if(gi===0)out=mid;
    });
  });
  if(out){selectedClipId=out.id;var q=(out.ranges||[]).filter(function(z){return z.s<.05;})[0];R.sel=q?q.id:null;try{renderAll();}catch(e){}}
  R.save();R.render();R.say("Part now plays at "+factor+"×");
};
var SP=[[.25,"0.25× slow"],[.5,"0.5× slow"],[2,"2× fast"],[4,"4× fast"],[8,"8× fast"]];
R.section("speed",function(c,r){
  var h='<h4>Speed of this part</h4><div class="rfx-note">'+(r?'Plays “'+r.name+'” ('+(r.e-r.s).toFixed(1)+'s) faster or slower. The clip is split around the part and later clips move to close or open the gap.':'Tap a speed: a 2s part is added at the playhead first.')+' Current clip speed: '+((c.speed||1).toFixed(2))+'×</div><div class="rfx-row" style="gap:5px">';
  SP.forEach(function(s,i){h+='<button class="rfx-b" data-sp="'+i+'">'+s[1]+'</button>';});
  h+='</div><div class="rfx-row"><label>Custom ×</label><input type="number" id="rfxSpC" step="0.05" min="0.1" max="8" value="1.5"><button class="rfx-b p" data-x="spc">Apply</button></div>';
  return h;
},function(root,c,r){
  function go(f){var t=r||R.add({name:"Speed "+f+"×"});if(t){R.sel=t.id;R.speedPart(t.id,f);}}
  root.querySelectorAll("[data-sp]").forEach(function(b){b.onclick=function(){go(SP[+b.dataset.sp][0]);};});
  var b=root.querySelector("[data-x=spc]");if(b)b.onclick=function(){go(+root.querySelector("#rfxSpC").value);};
});
})();

/* ===== Range FX Step 4: speed ramps (smooth slow->fast, speed bump, slow-mo dip) ===== */
(function(){
var R=window.RFX; if(!R||!R._cut) return;
var RAMPS=[["Slow → Fast 1→4×",[1,4]],["Fast → Slow 4→1×",[4,1]],["Speed bump 1→4→1×",[1,4,1]],["Slow-mo dip 1→0.3→1×",[1,.3,1]],["Hero time 1→0.25→1×",[1,.25,.25,1]],["Whoosh 1→8→1×",[1,8,1]]];
function curve(k,u){var n=k.length-1,x=Math.min(.9999,Math.max(0,u))*n,i=Math.floor(x),f=x-i;f=(1-Math.cos(f*Math.PI))/2;return k[i]*Math.pow(k[i+1]/k[i],f);}
R.rampPart=function(rid,knots){
  var c=R.clip(),r=R.get(rid||R.sel);
  if(!c||!r){R.say("Add or select a part first");return;}
  var a=r.s,b=r.e,len=b-a;if(len<.8){R.say("Make the part at least 1 second long for a ramp");return;}
  var n=Math.min(10,Math.max(4,Math.round(len/.25))),out=null;
  var group=R._group(c);
  transact("Speed ramp",function(){
    group.forEach(function(g,gi){
      var tr=R._trackOf(g);if(!tr)return;
      var oldEnd=g.start+b,sl=[],post=null;
      for(var k=n;k>=0;k--){var t=a+len*k/n,p=R._cut(tr,g,t);if(k===n)post=p;else sl[k]=p||(k===0?g:null);}
      var cur=(sl[0]||g).start,all=[];
      for(var k=0;k<n;k++){
        var m=sl[k];if(!m)continue;all.push(m);
        var f=curve(knots,(k+.5)/n),old=m.duration,src=(m.outPoint!=null?m.outPoint:old)-(m.inPoint||0);
        m.speed=(m.speed||1)*f;(m.ranges||[]).forEach(function(q){q.s=+(q.s/f).toFixed(3);q.e=+(q.e/f).toFixed(3);});
        m.duration=Math.max(.04,src/m.speed);m.start=cur;cur+=m.duration;
      }
      var delta=cur-oldEnd;
      tr.clips.forEach(function(x){if(all.indexOf(x)<0&&x.start>=oldEnd-.001)x.start=Math.max(0,x.start+delta);});
      if(gi===0)out=all[0];
    });
  });
  if(out){selectedClipId=out.id;R.sel=null;try{renderAll();}catch(e){}}
  R.save();R.render();R.say("Speed ramp applied ("+n+" smooth steps)");
};
R.section("ramp",function(c,r){
  var h='<h4>Speed ramp (smooth)</h4><div class="rfx-note">'+(r?'Ramps “'+r.name+'” through changing speeds, like Premiere time remapping. Needs a part of 1s or more.':'Select a part first (1s or longer).')+'</div><div class="rfx-row" style="gap:5px">';
  RAMPS.forEach(function(p,i){h+='<button class="rfx-b" data-rp="'+i+'"'+(r?'':' disabled')+'>'+p[0]+'</button>';});
  return h+'</div>';
},function(root,c,r){
  root.querySelectorAll("[data-rp]").forEach(function(b){b.onclick=function(){R.rampPart(r.id,RAMPS[+b.dataset.rp][1]);};});
});
})();

/* ===== Range FX Step 5: effects on one part (blur, brightness, contrast, colour, B&W, sepia, hue) ===== */
(function(){
var R=window.RFX; if(!R) return;
var FX=[["blur","Blur",0,30,.5,0,"px"],["bright","Brightness",-.6,.6,.02,0,""],["contrast","Contrast",.5,2,.02,1,""],["sat","Colour",0,3,.05,1,"×"],["gray","Black & white",0,1,.05,0,""],["sepia","Sepia",0,1,.05,0,""],["hue","Hue shift",-180,180,5,0,"°"]];
R.FX=FX;
R.fxActive=function(r){var f=r.fx||{};return FX.filter(function(d){return f[d[0]]!=null&&f[d[0]]!==d[5];}).map(function(d){return d[1];});};
R.section("effects",function(c,r){
  if(!r)return '<h4>Effects</h4><div class="rfx-note">Add or select a part to give it blur, colour or other effects.</div>';
  var h='<h4>Effects on “'+r.name+'”</h4><div class="rfx-note">They apply only between '+r.s.toFixed(1)+'s and '+r.e.toFixed(1)+'s of the clip.</div>';
  FX.forEach(function(d){var v=r.fx[d[0]];if(v==null)v=d[5];h+='<div class="rfx-row"><label>'+d[1]+'</label><input type="range" data-fx="'+d[0]+'" min="'+d[2]+'" max="'+d[3]+'" step="'+d[4]+'" value="'+v+'"><span data-fv="'+d[0]+'" style="min-width:42px;text-align:right">'+v+d[6]+'</span></div>';});
  h+='<div class="rfx-row"><button class="rfx-b" data-x="fxreset">Reset effects</button><button class="rfx-b" data-x="fxall">Make part cover whole clip</button></div>';
  return h;
},function(root,c,r){
  if(!r)return;
  root.querySelectorAll("[data-fx]").forEach(function(el){
    var d=FX.filter(function(x){return x[0]===el.dataset.fx;})[0];
    el.addEventListener("input",function(){r.fx[d[0]]=+el.value;var sp=root.querySelector('[data-fv='+d[0]+']');if(sp)sp.textContent=el.value+d[6];R.redraw();});
    el.addEventListener("change",function(){R.save();});
  });
  root.querySelector("[data-x=fxreset]").onclick=function(){r.fx={};R.save();R.render();R.redraw();};
  root.querySelector("[data-x=fxall]").onclick=function(){r.s=0;r.e=+c.duration.toFixed(2);R.save();R.render();R.redraw();};
});
})();

/* ===== Range FX Step 6: one-tap effect preset bank ===== */
(function(){
var R=window.RFX; if(!R) return;
R.PRESETS=[
 {n:"Cinematic",fx:{contrast:1.2,sat:.85,bright:-.05,sepia:.12}},
 {n:"Dream blur",fx:{blur:6,bright:.12,sat:1.2}},
 {n:"Vintage",fx:{sepia:.55,contrast:1.1,sat:.8,bright:.04}},
 {n:"Noir",fx:{gray:1,contrast:1.35,bright:-.05}},
 {n:"Warm glow",fx:{sepia:.25,sat:1.25,bright:.08,hue:-8}},
 {n:"Cool tone",fx:{hue:12,sat:.9,contrast:1.1,bright:-.02}},
 {n:"Vivid pop",fx:{sat:1.8,contrast:1.15}},
 {n:"Faded",fx:{contrast:.8,sat:.7,bright:.1}},
 {n:"Focus blur",fx:{blur:14}},
 {n:"Censor blur",fx:{blur:28,bright:-.05}},
 {n:"Neon",fx:{hue:60,sat:2.2,contrast:1.2}},
 {n:"Night",fx:{bright:-.3,contrast:1.15,hue:18,sat:.8}},
 {n:"Flash",fx:{bright:.45,contrast:.9}},
 {n:"Old film",fx:{gray:.6,sepia:.4,contrast:1.25,blur:.6}}
];
R.applyPreset=function(r,p){
  r.fx=JSON.parse(JSON.stringify(p.fx));
  if(p.zoom){r.zoom0=p.zoom[0];r.zoom1=p.zoom[1];}
  if(/^Part \d+$/.test(r.name))r.name=p.n;
  try{if(R.onUse)R.onUse("preset",p.n);}catch(e){}
  R.save();R.render();R.redraw();
};
R.section("presets",function(c,r){
  var h='<h4>Effect presets</h4><div class="rfx-note">'+(r?'Tap to apply to “'+r.name+'” (replaces its effects).':'Tap a look: a 2s part is added at the playhead and styled.')+'</div><div class="rfx-row" style="gap:5px">';
  R.PRESETS.forEach(function(p,i){h+='<button class="rfx-b" data-pr="'+i+'">'+p.n+'</button>';});
  return h+'</div>';
},function(root,c,r){
  root.querySelectorAll("[data-pr]").forEach(function(b){b.onclick=function(){var p=R.PRESETS[+b.dataset.pr],t=r||R.add({name:p.n});if(t){R.sel=t.id;R.applyPreset(t,p);}};});
});
})();

/* ===== Range FX Step 7: save my own effects and reuse them (device storage + inside the project) ===== */
(function(){
var R=window.RFX; if(!R) return;
var KEY="rfx.user.v1";
function ls(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")||[];}catch(e){return[];}}
R.userList=function(){
  var m={},out=[];
  ls().concat((window.project&&project.rfxUser)||[]).forEach(function(x){if(x&&x.id&&!m[x.id]){m[x.id]=1;out.push(x);}});
  return out;
};
function put(list){try{localStorage.setItem(KEY,JSON.stringify(list));}catch(e){}try{project.rfxUser=list;}catch(e){}R.save();}
R.userSave=function(r,name){
  var has=R.fxActive(r).length||r.zoom0!==1||r.zoom1!==1;
  if(!has){R.say("Give the part some zoom or effects first");return null;}
  var it={id:uid("fxu"),n:(name||r.name||"My effect").slice(0,30),fx:JSON.parse(JSON.stringify(r.fx||{})),zoom:[r.zoom0||1,r.zoom1||1],ease:r.ease||"smooth",punch:!!r.punch,at:Date.now(),uses:0};
  var l=R.userList();l.push(it);put(l);R.say("Saved “"+it.n+"” to My effects");return it;
};
R.userDelete=function(id){put(R.userList().filter(function(x){return x.id!==id;}));};
R.userRename=function(id,n){var l=R.userList();l.forEach(function(x){if(x.id===id)x.n=n.slice(0,30);});put(l);};
R.userApply=function(r,it){
  r.fx=JSON.parse(JSON.stringify(it.fx||{}));r.zoom0=it.zoom[0];r.zoom1=it.zoom[1];r.ease=it.ease||"smooth";r.punch=!!it.punch;
  if(/^Part \d+$/.test(r.name))r.name=it.n;
  var l=R.userList();l.forEach(function(x){if(x.id===it.id)x.uses=(x.uses||0)+1;});put(l);
  try{if(R.onUse)R.onUse("saved",it.n);}catch(e){}
  R.render();R.redraw();
};
R.section("mine",function(c,r){
  var l=R.userList(),h='<h4>My saved effects</h4>';
  if(r)h+='<div class="rfx-row"><input id="rfxSvN" class="rfx-b" style="flex:1;text-align:left;min-width:120px" placeholder="Name (e.g. My intro look)" value=""><button class="rfx-b p" data-x="usave">★ Save this look</button></div>';
  else h+='<div class="rfx-note">Select a part with zoom/effects, then save its look here to reuse it anywhere.</div>';
  if(!l.length)h+='<div class="rfx-note">Nothing saved yet.</div>';
  l.slice().reverse().forEach(function(it){h+='<div class="rfx-card"><div class="rfx-row"><b style="flex:1">'+String(it.n).replace(/</g,"&lt;")+'</b><span class="rfx-note">'+(it.uses||0)+' uses</span></div><div class="rfx-row"><button class="rfx-b p" data-ua="'+it.id+'">Apply</button><button class="rfx-b" data-ur="'+it.id+'">Rename</button><button class="rfx-b" data-ud="'+it.id+'">Delete</button></div></div>';});
  return h;
},function(root,c,r){
  var s=root.querySelector("[data-x=usave]");if(s)s.onclick=function(){var n=root.querySelector("#rfxSvN").value.trim();if(R.userSave(r,n))R.render();};
  root.querySelectorAll("[data-ua]").forEach(function(b){b.onclick=function(){var it=R.userList().filter(function(x){return x.id===b.dataset.ua;})[0];if(!it)return;var t=r||R.add({name:it.n});if(t){R.sel=t.id;R.userApply(t,it);}};});
  root.querySelectorAll("[data-ud]").forEach(function(b){b.onclick=function(){R.userDelete(b.dataset.ud);R.render();};});
  root.querySelectorAll("[data-ur]").forEach(function(b){b.onclick=function(){var n=window.prompt("New name");if(n){R.userRename(b.dataset.ur,n);R.render();}};});
});
})();

/* ===== Range FX Step 8: "Recently used" strip + most-used counters ===== */
(function(){
var R=window.RFX; if(!R) return;
var KEY="rfx.recent.v1";
function load(){var a=[];try{a=JSON.parse(localStorage.getItem(KEY)||"[]")||[];}catch(e){}try{if(project&&project.rfxRecent)a=a.length>=project.rfxRecent.length?a:project.rfxRecent;}catch(e){}return a;}
function store(a){try{localStorage.setItem(KEY,JSON.stringify(a));}catch(e){}try{project.rfxRecent=a;}catch(e){}}
R.onUse=function(kind,name){
  var a=load(),it=a.filter(function(x){return x.k===kind&&x.n===name;})[0];
  if(it){it.c++;it.t=Date.now();}else a.push({k:kind,n:name,c:1,t:Date.now()});
  a.sort(function(x,y){return y.t-x.t;});store(a.slice(0,40));
};
R.recent=function(n){return load().slice(0,n||8);};
R.topUsed=function(n){return load().slice().sort(function(x,y){return y.c-x.c;}).slice(0,n||5);};
function find(it){
  if(it.k==="preset")return R.PRESETS.filter(function(p){return p.n===it.n;})[0];
  return R.userList().filter(function(p){return p.n===it.n;})[0];
}
function apply(it,r){
  var p=find(it);if(!p){R.say("That effect no longer exists");return;}
  var t=r||R.add({name:p.n});if(!t)return;R.sel=t.id;
  if(it.k==="preset")R.applyPreset(t,p);else R.userApply(t,p);
}
function chips(list,attr){
  var h='<div class="rfx-row" style="gap:5px">';
  list.forEach(function(it,i){h+='<button class="rfx-b" '+attr+'="'+i+'">'+(it.k==="saved"?"★ ":"")+String(it.n).replace(/</g,"&lt;")+' <small style="opacity:.6">×'+it.c+'</small></button>';});
  return h+'</div>';
}
R.section("recent",function(c,r){
  var rc=R.recent(8);
  if(!rc.length)return '<h4>Recently used</h4><div class="rfx-note">Effects you apply show up here for quick reuse.</div>';
  return '<h4>Recently used</h4>'+chips(rc,"data-rc")+'<h4>Most used</h4>'+chips(R.topUsed(5),"data-tu");
},function(root,c,r){
  var rc=R.recent(8),tu=R.topUsed(5);
  root.querySelectorAll("[data-rc]").forEach(function(b){b.onclick=function(){apply(rc[+b.dataset.rc],r);};});
  root.querySelectorAll("[data-tu]").forEach(function(b){b.onclick=function(){apply(tu[+b.dataset.tu],r);};});
});
/* move the strip right under the parts list so it is easy to reach */
var s=R.sections.pop();R.sections.splice(1,0,s);
})();

/* ===== Range FX Step 9: coloured part bars on the timeline clips + auto-select the part under the playhead ===== */
(function(){
var R=window.RFX; if(!R) return;
var st=document.createElement("style");
st.textContent=".clip .rfx-bar{position:absolute;bottom:1px;height:7px;border-radius:3px;pointer-events:none;z-index:3;opacity:.9;box-shadow:0 0 0 1px rgba(0,0,0,.5)}.clip .rfx-bar.sel{height:11px;box-shadow:0 0 0 2px #fff}.clip .rfx-bar.off{opacity:.3}.clip .rfx-tag{position:absolute;top:1px;right:3px;font-size:9px;background:rgba(255,122,61,.9);color:#111;border-radius:6px;padding:0 4px;z-index:3;pointer-events:none}";
document.head.appendChild(st);
function kind(r){var z=(r.zoom0||1)!==1||(r.zoom1||1)!==1,f=R.fxActive?R.fxActive(r).length:0;return z&&f?"#ff5ca8":z?"#ffa63d":f?"#ffa77b":"#7a8599";}
R.decorate=function(){
  try{
    document.querySelectorAll(".rfx-bar,.rfx-tag").forEach(function(e){e.remove();});
    project.tracks.forEach(function(t){t.clips.forEach(function(c){
      if(!c.ranges||!c.ranges.length)return;
      var el=document.querySelector('.clip[data-clip="'+c.id+'"]');if(!el)return;
      c.ranges.forEach(function(r){
        var b=document.createElement("div");b.className="rfx-bar"+(r.id===R.sel?" sel":"")+(r.on===false?" off":"");
        b.style.left=timeToPx(r.s)+"px";b.style.width=Math.max(4,timeToPx(r.e-r.s))+"px";b.style.background=kind(r);b.title=r.name;el.appendChild(b);
      });
      var tg=document.createElement("span");tg.className="rfx-tag";tg.textContent="🎯"+c.ranges.length;el.appendChild(tg);
    });});
  }catch(e){}
};
var rt=window.renderTracks;
if(typeof rt==="function")window.renderTracks=function(){var o=rt.apply(this,arguments);R.decorate();return o;};
var orr=R.render;
R.render=function(){
  var c=R.clip();
  if(c&&!R.get(R.sel)){var l=currentTime-c.start,p=R.list(c).filter(function(r){return l>=r.s&&l<=r.e;})[0];R.sel=p?p.id:null;}
  orr();R.decorate();
};
var os=R.save;R.save=function(){os();R.decorate();};
setTimeout(R.decorate,800);
})();

/* ===== Range FX Step 10: part editing tools (set start/end from playhead, nudge, split, duplicate, copy to other clips) ===== */
(function(){
var R=window.RFX; if(!R) return;
function cl(a,b,x){return Math.min(b,Math.max(a,x));}
function clone(r){var n=JSON.parse(JSON.stringify(r));n.id=uid("rg");return n;}
function edit(label,fn){transact(label,fn);R.save();R.render();R.redraw();}
R.section("edit",function(c,r){
  if(!r)return '';
  return '<h4>Edit part</h4><div class="rfx-row" style="gap:5px"><button class="rfx-b" data-e="ss">Start = playhead</button><button class="rfx-b" data-e="se">End = playhead</button><button class="rfx-b" data-e="m-">◀ 0.1s</button><button class="rfx-b" data-e="m+">0.1s ▶</button><button class="rfx-b" data-e="split">Split at playhead</button><button class="rfx-b" data-e="dup">Duplicate</button></div>'+
  '<div class="rfx-row" style="gap:5px"><button class="rfx-b" data-e="cpsel">Copy look to selected clips</button><button class="rfx-b" data-e="cptrack">Copy to all clips on this track</button></div>';
},function(root,c,r){
  if(!r)return;
  var on=function(k,fn){var b=root.querySelector('[data-e="'+k+'"]');if(b)b.onclick=fn;};
  function lt(){return currentTime-c.start;}
  on("ss",function(){var v=lt();if(v<0||v>=r.e-.1){R.say("Move the playhead inside the clip, before the part end");return;}edit("Part start",function(){r.s=+v.toFixed(2);});});
  on("se",function(){var v=lt();if(v<=r.s+.1||v>c.duration){R.say("Move the playhead after the part start, inside the clip");return;}edit("Part end",function(){r.e=+v.toFixed(2);});});
  function nudge(d){edit("Move part",function(){var len=r.e-r.s,s=cl(0,c.duration-len,r.s+d);r.s=+s.toFixed(2);r.e=+(s+len).toFixed(2);});}
  on("m-",function(){nudge(-.1);});on("m+",function(){nudge(.1);});
  on("split",function(){var v=+lt().toFixed(2);if(v<=r.s+.1||v>=r.e-.1){R.say("Put the playhead inside the part");return;}
    edit("Split part",function(){var n=clone(r);n.s=v;n.name=r.name+" B";r.e=v;R.list(c).push(n);R.sel=n.id;});});
  on("dup",function(){edit("Duplicate part",function(){var n=clone(r),len=r.e-r.s;n.name=r.name+" copy";n.s=Math.min(c.duration-len,+(r.e).toFixed(2));n.e=+(n.s+len).toFixed(2);R.list(c).push(n);R.sel=n.id;});});
  function copyTo(targets){
    var k=0;
    edit("Copy part look",function(){targets.forEach(function(t){
      if(t===c||t.kind==="audio"||!t.duration)return;
      if(r.s>=t.duration-.1)return;
      var n=clone(r);n.e=Math.min(n.e,t.duration);t.ranges=t.ranges||[];t.ranges.push(n);k++;
    });});
    R.say(k?"Copied to "+k+" clip"+(k>1?"s":""):"No clip to copy to");
  }
  on("cpsel",function(){var t=[];project.tracks.forEach(function(tr){tr.clips.forEach(function(x){if(x.selected)t.push(x);});});if(!t.length){R.say("Select other clips on the timeline first");return;}copyTo(t);});
  on("cptrack",function(){var tr=null;project.tracks.forEach(function(t){if(t.clips.indexOf(c)>=0)tr=t;});if(tr)copyTo(tr.clips);});
});
})();

/* ===== Range FX Step 11: effect fade in / fade out at the edges of a part ===== */
(function(){
var R=window.RFX; if(!R) return;
R.strength=function(r,l){
  var k=1,fi=+r.fin||0,fo=+r.fout||0;
  if(fi>0)k=Math.min(k,(l-r.s)/fi);
  if(fo>0)k=Math.min(k,(r.e-l)/fo);
  k=Math.max(0,Math.min(1,k));return k*k*(3-2*k);
};
R.section("fade",function(c,r){
  if(!r)return '';
  var mx=Math.max(.2,+((r.e-r.s)/2).toFixed(1));
  return '<h4>Effect fade in / out</h4><div class="rfx-note">Blur and colour ease in and out instead of switching on suddenly.</div>'+
  '<div class="rfx-row"><label>Fade in</label><input type="range" id="rfxFi" min="0" max="'+mx+'" step="0.05" value="'+Math.min(mx,r.fin||0)+'"><span id="rfxFiV">'+(r.fin||0)+'s</span></div>'+
  '<div class="rfx-row"><label>Fade out</label><input type="range" id="rfxFo" min="0" max="'+mx+'" step="0.05" value="'+Math.min(mx,r.fout||0)+'"><span id="rfxFoV">'+(r.fout||0)+'s</span></div>'+
  '<div class="rfx-row" style="gap:5px"><button class="rfx-b" data-x="fsoft">Soft edges</button><button class="rfx-b" data-x="fnone">Hard cut</button></div>';
},function(root,c,r){
  if(!r)return;
  function sl(id,vid,key){var el=root.querySelector(id);el.addEventListener("input",function(){r[key]=+el.value;root.querySelector(vid).textContent=el.value+"s";R.redraw();});el.addEventListener("change",R.save);}
  sl("#rfxFi","#rfxFiV","fin");sl("#rfxFo","#rfxFoV","fout");
  root.querySelector("[data-x=fsoft]").onclick=function(){var m=Math.min(.4,(r.e-r.s)/3);r.fin=r.fout=+m.toFixed(2);R.save();R.render();R.redraw();};
  root.querySelector("[data-x=fnone]").onclick=function(){r.fin=r.fout=0;R.save();R.render();R.redraw();};
});
})();

/* ===== Range FX Step 12: zoom focus point (3x3 presets + tap the preview to choose) ===== */
(function(){
var R=window.RFX; if(!R) return;
var picking=null,banner=null,mark=null;
function mk(){
  if(!banner){banner=document.createElement("div");banner.style.cssText="position:fixed;left:8px;right:8px;top:8px;z-index:99995;background:#ff7a3d;color:#111;font-weight:700;padding:10px;border-radius:10px;text-align:center;display:none;font-size:13px";document.body.appendChild(banner);}
  if(!mark){mark=document.createElement("div");mark.style.cssText="position:fixed;z-index:99994;width:34px;height:34px;margin:-17px 0 0 -17px;border:3px solid #ff7a3d;border-radius:50%;box-shadow:0 0 0 2px #000,inset 0 0 0 2px #000;pointer-events:none;display:none";document.body.appendChild(mark);}
}
function showMark(px,py,ms){
  mk();var b=canvas.getBoundingClientRect();mark.style.left=(b.left+b.width*px)+"px";mark.style.top=(b.top+b.height*py)+"px";mark.style.display="block";
  if(ms)setTimeout(function(){if(!picking)mark.style.display="none";},ms);
}
function endPick(){picking=null;if(banner)banner.style.display="none";if(mark)mark.style.display="none";R.open();}
function startPick(r){
  mk();picking=r.id;R.close();banner.textContent="Tap the spot in the preview to zoom toward";banner.style.display="block";
  if(r.px!=null)showMark(r.px,r.py,0);
}
canvas.addEventListener("pointerdown",function(e){
  if(!picking)return;
  e.preventDefault();e.stopPropagation();
  var r=R.get(picking),b=canvas.getBoundingClientRect();
  if(r){r.px=+Math.min(1,Math.max(0,(e.clientX-b.left)/b.width)).toFixed(3);r.py=+Math.min(1,Math.max(0,(e.clientY-b.top)/b.height)).toFixed(3);R.save();R.redraw();showMark(r.px,r.py,0);}
  setTimeout(endPick,450);
},true);
R.section("focus",function(c,r){
  if(!r)return '';
  var z=(r.zoom0||1)!==1||(r.zoom1||1)!==1;
  var h='<h4>Zoom focus</h4><div class="rfx-note">'+(z?'Where the zoom goes toward.':'Used when this part zooms.')+' Now: '+(r.px==null?'centre':Math.round(r.px*100)+'%, '+Math.round(r.py*100)+'%')+'</div>';
  h+='<div style="display:grid;grid-template-columns:repeat(3,44px);gap:5px;margin:4px 0">';
  [[.25,.25],[.5,.25],[.75,.25],[.25,.5],[.5,.5],[.75,.5],[.25,.75],[.5,.75],[.75,.75]].forEach(function(p,i){h+='<button class="rfx-b" style="min-height:40px;padding:0" data-fp="'+i+'">'+(i===4?'●':'·')+'</button>';});
  return h+'</div><div class="rfx-row"><button class="rfx-b p" data-x="pick">🎯 Tap preview to set focus</button><button class="rfx-b" data-x="fc">Centre</button></div>';
},function(root,c,r){
  if(!r)return;
  var G=[[.25,.25],[.5,.25],[.75,.25],[.25,.5],[.5,.5],[.75,.5],[.25,.75],[.5,.75],[.75,.75]];
  root.querySelectorAll("[data-fp]").forEach(function(b){b.onclick=function(){var p=G[+b.dataset.fp];r.px=p[0];r.py=p[1];R.save();R.render();R.redraw();};});
  root.querySelector("[data-x=pick]").onclick=function(){startPick(r);};
  root.querySelector("[data-x=fc]").onclick=function(){r.px=null;r.py=null;R.save();R.render();R.redraw();};
});
})();

/* ===== Range FX Step 13: effect stack (switch each effect on/off, remove) + hold-to-compare with the original ===== */
(function(){
var R=window.RFX; if(!R) return;
var of=R.filterOf;
R.filterOf=function(r,k){
  if(!r.fxOff)return of(r,k);
  var f={};Object.keys(r.fx||{}).forEach(function(n){if(!r.fxOff[n])f[n]=r.fx[n];});
  return of({fx:f},k);
};
var os=R.state;
R.state=function(c,l){return R.peek?null:os(c,l);};
function val(d,r){var v=r.fx[d[0]];return (+v).toFixed(d[4]<1?2:0).replace(/\.?0+$/,"")+d[6];}
R.section("stack",function(c,r){
  if(!r)return '';
  var act=R.FX.filter(function(d){return r.fx[d[0]]!=null&&r.fx[d[0]]!==d[5];});
  var h='<h4>Effect stack</h4>';
  if(!act.length)h+='<div class="rfx-note">No effects on this part yet.</div>';
  act.forEach(function(d){var off=r.fxOff&&r.fxOff[d[0]];h+='<div class="rfx-row" style="gap:5px"><span style="flex:1;'+(off?'opacity:.45;text-decoration:line-through':'')+'">'+d[1]+' · '+val(d,r)+'</span><button class="rfx-b" data-st="t:'+d[0]+'">'+(off?'Off':'On')+'</button><button class="rfx-b" data-st="d:'+d[0]+'">✕</button></div>';});
  h+='<div class="rfx-row"><button class="rfx-b" data-x="peek" style="flex:1;touch-action:none">👁 Hold to see the original</button></div>';
  return h;
},function(root,c,r){
  if(!r)return;
  root.querySelectorAll("[data-st]").forEach(function(b){b.onclick=function(){
    var a=b.dataset.st.split(":");r.fxOff=r.fxOff||{};
    if(a[0]==="t")r.fxOff[a[1]]=!r.fxOff[a[1]];else{delete r.fx[a[1]];delete r.fxOff[a[1]];}
    R.save();R.render();R.redraw();};});
  var p=root.querySelector("[data-x=peek]");
  function on(e){e.preventDefault();R.peek=true;R.redraw();}
  function off(){if(R.peek){R.peek=false;R.redraw();}}
  p.addEventListener("pointerdown",on);["pointerup","pointercancel","pointerleave"].forEach(function(n){p.addEventListener(n,off);});
});
})();

/* ===== Range FX Step 14: logo overlays (add from your files, place, size, opacity) + Parts/Logos tabs ===== */
(function(){
var R=window.RFX; if(!R) return;
var LG=window.LOGOS={imgs:{}};
R.tab="parts";
function cl(a,b,x){return Math.min(b,Math.max(a,x));}
LG.list=function(){project.logos=project.logos||[];return project.logos;};
LG.get=function(id){return LG.list().filter(function(l){return l.id===id;})[0]||null;};
LG.img=function(l){
  var e=LG.imgs[l.id];
  if(!e||e.src!==l.src){var im=new Image();e={src:l.src,im:im};LG.imgs[l.id]=e;im.onload=function(){R.redraw();};im.src=l.src;}
  return e.im&&e.im.complete&&e.im.naturalWidth?e.im:null;
};
LG.fromFile=function(file,cb){
  if(!file)return;
  if(!/^image\//.test(file.type||"")&&!/\.(png|jpe?g|webp|gif|svg)$/i.test(file.name||"")){R.say("Choose a picture (PNG, JPG, WEBP or SVG)");return;}
  var fr=new FileReader();
  fr.onerror=function(){R.say("Could not read that file");};
  fr.onload=function(){
    var im=new Image();
    im.onerror=function(){R.say("That picture could not be opened");};
    im.onload=function(){
      var mw=400,sc=Math.min(1,mw/Math.max(im.naturalWidth,im.naturalHeight)),cv=document.createElement("canvas");
      cv.width=Math.max(1,Math.round(im.naturalWidth*sc));cv.height=Math.max(1,Math.round(im.naturalHeight*sc));
      cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);
      var src;try{src=cv.toDataURL("image/png");}catch(e){src=fr.result;}
      cb({src:src,name:(file.name||"Logo").replace(/\.[^.]+$/,"").slice(0,30)});
    };
    im.src=fr.result;
  };
  fr.readAsDataURL(file);
};
LG.add=function(o){
  var l=Object.assign({id:uid("logo"),name:"Logo",src:"",px:1,py:1,size:14,opacity:.9,rot:0,on:true,s:null,e:null},o);
  LG.list().push(l);LG.sel=l.id;R.save();R.render();R.redraw();return l;
};
LG.remove=function(id){project.logos=LG.list().filter(function(l){return l.id!==id;});if(LG.sel===id)LG.sel=null;R.save();R.render();R.redraw();};
/* hooks for later steps: timing + animation */
LG.vis=function(l,t){return 1;};
LG.anim=function(l,t){return {dx:0,dy:0,sc:1,a:1};};
LG.draw=function(){
  var W=canvas.width,H=canvas.height,t=currentTime;
  LG.list().forEach(function(l){
    if(l.on===false)return;
    var v=LG.vis(l,t);if(v<=0)return;
    var im=LG.img(l);if(!im)return;
    var an=LG.anim(l,t),w=W*cl(2,90,l.size)/100*an.sc,h=w*im.naturalHeight/im.naturalWidth;
    if(h>H*.6){h=H*.6;w=h*im.naturalWidth/im.naturalHeight;}
    var m=W*.03,x=m+(W-w-2*m)*l.px+an.dx*W,y=m+(H-h-2*m)*l.py+an.dy*H;
    ctx.save();ctx.globalAlpha=cl(0,1,l.opacity*v*an.a);ctx.globalCompositeOperation="source-over";ctx.filter="none";ctx.shadowColor="transparent";ctx.shadowBlur=0;
    if(l.rot){ctx.translate(x+w/2,y+h/2);ctx.rotate(l.rot*Math.PI/180);ctx.translate(-w/2,-h/2);x=0;y=0;}
    ctx.drawImage(im,x,y,w,h);ctx.restore();
  });
};
var pd=window.drawOverlays;
window.drawOverlays=function(){if(pd)pd.apply(this,arguments);try{LG.draw();}catch(e){console.warn("logo draw",e);}};
/* ---- tabs + logo panel ---- */
var orr=R.render;
function tabbar(){return '<div class="rfx-row" style="gap:6px;margin:2px 0 6px"><button class="rfx-b'+(R.tab==="parts"?' p':'')+'" data-tab="parts">🎯 Parts</button><button class="rfx-b'+(R.tab==="logos"?' p':'')+'" data-tab="logos">🏷 Logos ('+LG.list().length+')</button></div>';}
function esc(s){return String(s).replace(/</g,"&lt;").replace(/"/g,"&quot;");}
R.sections.push({name:"logos-sec",fn:function(){return "";}}); /* placeholder keeps order stable */
LG.sections=[];
LG.section=function(fn,bind){LG.sections.push({fn:fn,bind:bind});};
R.render=function(){
  var sh=document.getElementById("rfxSheet");if(!sh||sh.style.display==="none")return;
  if(R.tab!=="logos"){orr();var top=sh.querySelector(".rfx-top");if(top)top.insertAdjacentHTML("afterend",tabbar());bindTabs(sh);return;}
  var l=LG.get(LG.sel)||(LG.list()[0]&&(LG.sel=LG.list()[0].id,LG.list()[0])),h='<div class="rfx-top"><b>🏷 Logos</b><button class="rfx-b" data-x="close">Close</button></div>'+tabbar();
  LG.sections.forEach(function(s){try{h+=s.fn(l);}catch(e){console.warn(e);}});
  sh.innerHTML=h;sh.querySelector("[data-x=close]").onclick=R.close;bindTabs(sh);
  LG.sections.forEach(function(s){try{if(s.bind)s.bind(sh,l);}catch(e){console.warn(e);}});
};
function bindTabs(sh){sh.querySelectorAll("[data-tab]").forEach(function(b){b.onclick=function(){R.tab=b.dataset.tab;R.render();};});}
LG.section(function(l){
  var h='<h4>Add a logo</h4><div class="rfx-note">Pick a PNG/JPG/SVG from your phone. It is shrunk to a light size and saved inside the project, and appears in preview and export.</div><div class="rfx-row"><button class="rfx-b p" data-x="lgadd">＋ Add logo from files</button><input type="file" id="rfxLgF" accept="image/*" style="display:none"></div>';
  LG.list().forEach(function(x){h+='<div class="rfx-card'+(l&&l.id===x.id?' on':'')+'" data-lid="'+x.id+'"><div class="rfx-row"><img src="'+x.src+'" style="height:32px;max-width:70px;object-fit:contain;background:#0e1117;border-radius:6px"><b style="flex:1">'+esc(x.name)+'</b><button class="rfx-b" data-x="lgtog" data-id="'+x.id+'">'+(x.on===false?'Off':'On')+'</button><button class="rfx-b" data-x="lgdel" data-id="'+x.id+'">✕</button></div></div>';});
  if(l){
    h+='<h4>Place “'+esc(l.name)+'”</h4><div style="display:grid;grid-template-columns:repeat(3,44px);gap:5px">';
    [[0,0],[.5,0],[1,0],[0,.5],[.5,.5],[1,.5],[0,1],[.5,1],[1,1]].forEach(function(p,i){var on=l.px===p[0]&&l.py===p[1];h+='<button class="rfx-b'+(on?' p':'')+'" style="min-height:40px;padding:0" data-lp="'+i+'">'+(on?'●':'·')+'</button>';});
    h+='</div><div class="rfx-row"><label>Size</label><input type="range" data-lf="size" min="3" max="80" step="1" value="'+l.size+'"><span>'+l.size+'%</span></div>'+
    '<div class="rfx-row"><label>Opacity</label><input type="range" data-lf="opacity" min="0.05" max="1" step="0.05" value="'+l.opacity+'"><span>'+Math.round(l.opacity*100)+'%</span></div>'+
    '<div class="rfx-row"><label>Rotate</label><input type="range" data-lf="rot" min="-180" max="180" step="1" value="'+(l.rot||0)+'"><span>'+(l.rot||0)+'°</span></div>'+
    '<div class="rfx-row"><label>Name</label><input id="rfxLgN" class="rfx-b" style="flex:1;text-align:left" value="'+esc(l.name)+'"></div>';
  }
  return h;
},function(root,l){
  var f=root.querySelector("#rfxLgF");root.querySelector("[data-x=lgadd]").onclick=function(){f.click();};
  f.onchange=function(){LG.fromFile(f.files[0],function(o){LG.add(o);});f.value="";};
  root.querySelectorAll("[data-lid]").forEach(function(el){el.addEventListener("click",function(e){if(e.target.closest("button"))return;LG.sel=el.dataset.lid;R.render();});});
  root.querySelectorAll("[data-x=lgdel]").forEach(function(b){b.onclick=function(){LG.remove(b.dataset.id);};});
  root.querySelectorAll("[data-x=lgtog]").forEach(function(b){b.onclick=function(){var x=LG.get(b.dataset.id);if(x){x.on=x.on===false;R.save();R.render();R.redraw();}};});
  if(!l)return;
  var P=[[0,0],[.5,0],[1,0],[0,.5],[.5,.5],[1,.5],[0,1],[.5,1],[1,1]];
  root.querySelectorAll("[data-lp]").forEach(function(b){b.onclick=function(){var p=P[+b.dataset.lp];l.px=p[0];l.py=p[1];R.save();R.render();R.redraw();};});
  root.querySelectorAll("[data-lf]").forEach(function(el){el.addEventListener("input",function(){l[el.dataset.lf]=+el.value;var sp=el.parentNode.querySelector("span");if(sp)sp.textContent=el.dataset.lf==="opacity"?Math.round(el.value*100)+"%":el.value+(el.dataset.lf==="size"?"%":"°");R.redraw();});el.addEventListener("change",R.save);});
  var n=root.querySelector("#rfxLgN");n.onchange=function(){l.name=n.value.slice(0,30)||l.name;R.save();R.render();};
});
LG.open=function(){R.tab="logos";R.open();};
})();

/* ===== Range FX Step 15: logo timing (show from-to), fades and entrance animations ===== */
(function(){
var R=window.RFX,LG=window.LOGOS; if(!R||!LG) return;
function cl(a,b,x){return Math.min(b,Math.max(a,x));}
function S(l){return l.s==null?0:l.s;}
function E(l){return l.e==null?Math.max(.1,getProjectDuration()):l.e;}
LG.vis=function(l,t){
  var s=S(l),e=E(l);if(t<s-.001||t>e+.001)return 0;
  var k=1;if(l.fi>0)k=Math.min(k,(t-s)/l.fi);if(l.fo>0)k=Math.min(k,(e-t)/l.fo);
  return cl(0,1,k);
};
function outC(p){return 1-Math.pow(1-p,3);}
function back(p){var c=1.70158;return 1+(c+1)*Math.pow(p-1,3)+c*Math.pow(p-1,2);}
LG.ANIMS=[["none","None"],["fade","Fade"],["slide-l","Slide from left"],["slide-r","Slide from right"],["slide-up","Rise up"],["drop","Drop down"],["pop","Pop"],["zoom","Zoom in"],["pulse","Pulse (loop)"]];
LG.anim=function(l,t){
  var o={dx:0,dy:0,sc:1,a:1},st=l.anim||"none";if(st==="none")return o;
  var ad=l.ad||.6,p=cl(0,1,(t-S(l))/ad),q=outC(p);
  if(st==="fade")o.a=q;
  else if(st==="slide-l"){o.dx=-(1-q)*.3;o.a=q;}
  else if(st==="slide-r"){o.dx=(1-q)*.3;o.a=q;}
  else if(st==="slide-up"){o.dy=(1-q)*.2;o.a=q;}
  else if(st==="drop"){o.dy=-(1-q)*.3;o.a=Math.min(1,q*1.5);}
  else if(st==="pop"){o.sc=Math.max(.05,.2+.8*back(p));o.a=Math.min(1,p*3);}
  else if(st==="zoom"){o.sc=1.8-.8*q;o.a=q;}
  else if(st==="pulse"){o.sc=1+.06*Math.sin(t*5);}
  return o;
};
LG.section(function(l){
  if(!l)return '';
  var h='<h4>Show “'+String(l.name).replace(/</g,"&lt;")+'” from – to</h4><div class="rfx-note">'+(l.s==null&&l.e==null?'Shown on the whole video.':'Shown '+S(l).toFixed(1)+'s → '+E(l).toFixed(1)+'s on the project timeline.')+'</div>'+
  '<div class="rfx-row"><label>From (s)</label><input type="number" step="0.1" min="0" id="rfxLs" value="'+S(l).toFixed(1)+'"><label>To (s)</label><input type="number" step="0.1" min="0" id="rfxLe" value="'+E(l).toFixed(1)+'"></div>'+
  '<div class="rfx-row" style="gap:5px"><button class="rfx-b" data-x="lgs">From = playhead</button><button class="rfx-b" data-x="lge">To = playhead</button><button class="rfx-b" data-x="lgall">Whole video</button><button class="rfx-b" data-x="lgfirst">First 5s</button></div>'+
  '<div class="rfx-row"><label>Fade in</label><input type="range" data-lt="fi" min="0" max="2" step="0.1" value="'+(l.fi||0)+'"><span>'+(l.fi||0)+'s</span></div>'+
  '<div class="rfx-row"><label>Fade out</label><input type="range" data-lt="fo" min="0" max="2" step="0.1" value="'+(l.fo||0)+'"><span>'+(l.fo||0)+'s</span></div>'+
  '<h4>Entrance animation</h4><div class="rfx-row"><select id="rfxLa" class="rfx-b" style="flex:1">'+LG.ANIMS.map(function(a){return '<option value="'+a[0]+'"'+((l.anim||"none")===a[0]?' selected':'')+'>'+a[1]+'</option>';}).join("")+'</select></div>'+
  '<div class="rfx-row"><label>Speed</label><input type="range" data-lt="ad" min="0.2" max="2" step="0.1" value="'+(l.ad||.6)+'"><span>'+(l.ad||.6)+'s</span></div>'+
  '<div class="rfx-row"><button class="rfx-b" data-x="lgpv">▶ Preview from start of logo</button></div>';
},function(root,l){
  if(!l)return;
  function setT(k,v){l[k]=+v.toFixed(2);R.save();R.render();R.redraw();}
  var s=root.querySelector("#rfxLs"),e=root.querySelector("#rfxLe");
  s.onchange=function(){setT("s",Math.max(0,+s.value||0));if(l.e==null)setT("e",E(l));};
  e.onchange=function(){setT("e",Math.max(S(l)+.2,+e.value||0));if(l.s==null)setT("s",0);};
  root.querySelector("[data-x=lgs]").onclick=function(){if(l.e==null)l.e=+E(l).toFixed(2);setT("s",Math.min(currentTime,E(l)-.2));};
  root.querySelector("[data-x=lge]").onclick=function(){if(l.s==null)l.s=0;setT("e",Math.max(currentTime,S(l)+.2));};
  root.querySelector("[data-x=lgall]").onclick=function(){l.s=null;l.e=null;R.save();R.render();R.redraw();};
  root.querySelector("[data-x=lgfirst]").onclick=function(){l.s=0;setT("e",Math.min(5,getProjectDuration()));};
  root.querySelector("[data-x=lgpv]").onclick=function(){try{currentTime=S(l);}catch(x){}R.redraw();try{updateTimeUI();}catch(x){}try{var pb=document.getElementById("playBtn");if(pb)pb.click();}catch(x){}};
  root.querySelector("#rfxLa").onchange=function(){l.anim=this.value;R.save();R.redraw();};
  root.querySelectorAll("[data-lt]").forEach(function(el){el.addEventListener("input",function(){l[el.dataset.lt]=+el.value;el.parentNode.querySelector("span").textContent=el.value+"s";R.redraw();});el.addEventListener("change",R.save);});
});
})();

/* ===== Range FX Step 16: logo library (saved on this device) + Brand Kit sync ===== */
(function(){
var R=window.RFX,LG=window.LOGOS; if(!R||!LG) return;
var KEY="rfx.logolib.v1";
function ls(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")||[];}catch(e){return[];}}
function sig(s){return s.length+":"+s.slice(40,90)+s.slice(-40);}
LG.lib=function(){return ls();};
function put(l){try{localStorage.setItem(KEY,JSON.stringify(l));return true;}catch(e){R.say("Not enough space to save more logos on this device");return false;}}
LG.libSave=function(l){
  var a=ls(),g=sig(l.src);
  if(a.some(function(x){return x.sig===g;})){R.say("This logo is already in your library");return;}
  a.push({id:uid("ll"),sig:g,name:l.name,src:l.src,at:Date.now(),uses:0,fav:false,px:l.px,py:l.py,size:l.size,opacity:l.opacity,anim:l.anim||"none"});
  if(put(a))R.say("Saved “"+l.name+"” to the logo library");
};
LG.libUse=function(id){
  var a=ls(),x=a.filter(function(q){return q.id===id;})[0];if(!x)return;
  x.uses=(x.uses||0)+1;put(a);
  LG.add({name:x.name,src:x.src,px:x.px==null?1:x.px,py:x.py==null?1:x.py,size:x.size||14,opacity:x.opacity||.9,anim:x.anim||"none"});
};
LG.libDel=function(id){put(ls().filter(function(x){return x.id!==id;}));};
LG.libFav=function(id){var a=ls();a.forEach(function(x){if(x.id===id)x.fav=!x.fav;});put(a);};
function esc(s){return String(s).replace(/</g,"&lt;").replace(/"/g,"&quot;");}
LG.section(function(l){
  var a=ls().sort(function(x,y){return (y.fav?1:0)-(x.fav?1:0)||(y.at-x.at);}),h='<h4>Logo library (this device)</h4>';
  h+='<div class="rfx-row" style="gap:5px">'+(l?'<button class="rfx-b p" data-x="llsave">★ Save “'+esc(l.name)+'” to library</button>':'')+'</div>';
  if(!a.length)h+='<div class="rfx-note">Saved logos appear here so you can drop them into any project in one tap.</div>';
  a.forEach(function(x){h+='<div class="rfx-card"><div class="rfx-row"><img src="'+x.src+'" style="height:34px;max-width:70px;object-fit:contain;background:#0e1117;border-radius:6px"><b style="flex:1">'+(x.fav?'★ ':'')+esc(x.name)+'</b><span class="rfx-note">'+(x.uses||0)+'×</span></div><div class="rfx-row" style="gap:5px"><button class="rfx-b p" data-lu="'+x.id+'">Add to video</button><button class="rfx-b" data-lf2="'+x.id+'">'+(x.fav?'Unstar':'Star')+'</button><button class="rfx-b" data-ld="'+x.id+'">Delete</button></div></div>';});
  var k=project.brandKit,hasBk=k&&k.logo;
  h+='<h4>Brand Kit</h4><div class="rfx-row" style="gap:5px">'+(hasBk?'<button class="rfx-b" data-x="bkin">Use Brand Kit logo here</button>':'<span class="rfx-note">No Brand Kit logo yet.</span>')+(l?'<button class="rfx-b" data-x="bkout">Set “'+esc(l.name)+'” as Brand Kit logo</button>':'')+'</div>';
  return h;
},function(root,l){
  var s=root.querySelector("[data-x=llsave]");if(s)s.onclick=function(){LG.libSave(l);R.render();};
  root.querySelectorAll("[data-lu]").forEach(function(b){b.onclick=function(){LG.libUse(b.dataset.lu);};});
  root.querySelectorAll("[data-lf2]").forEach(function(b){b.onclick=function(){LG.libFav(b.dataset.lf2);R.render();};});
  root.querySelectorAll("[data-ld]").forEach(function(b){b.onclick=function(){LG.libDel(b.dataset.ld);R.render();};});
  var bi=root.querySelector("[data-x=bkin]");if(bi)bi.onclick=function(){LG.add({name:"Brand logo",src:project.brandKit.logo});};
  var bo=root.querySelector("[data-x=bkout]");if(bo)bo.onclick=function(){project.brandKit=project.brandKit||{colors:[],fonts:[],logos:[],watermark:"",intro:"",outro:""};project.brandKit.logo=l.src;R.save();R.say("Brand Kit logo updated (its watermark stays as you set it)");R.render();};
});
})();

/* ===== Range FX Step 17: Library tab - all presets, saved looks and logos in one searchable place ===== */
(function(){
var R=window.RFX,LG=window.LOGOS; if(!R||!LG) return;
var FK="rfx.favs.v1",Q="",F="all",SO="name";
function favs(){try{return JSON.parse(localStorage.getItem(FK)||"{}")||{};}catch(e){return{};}}
function setFav(k){var f=favs();if(f[k])delete f[k];else f[k]=1;try{localStorage.setItem(FK,JSON.stringify(f));}catch(e){}}
function esc(s){return String(s).replace(/</g,"&lt;").replace(/"/g,"&quot;");}
function sum(fx,z){var o=[];if(z&&(z[0]!==1||z[1]!==1))o.push("zoom "+z[0]+"→"+z[1]+"×");(R.FX||[]).forEach(function(d){if(fx&&fx[d[0]]!=null&&fx[d[0]]!==d[5])o.push(d[1].toLowerCase());});return o.join(", ")||"—";}
function items(){
  var f=favs(),a=[];
  R.PRESETS.forEach(function(p){a.push({k:"preset",id:"preset:"+p.n,n:p.n,d:sum(p.fx,p.zoom),fav:!!f["preset:"+p.n],p:p});});
  R.userList().forEach(function(p){a.push({k:"saved",id:"saved:"+p.id,n:p.n,d:sum(p.fx,p.zoom),fav:!!f["saved:"+p.id],p:p});});
  LG.lib().forEach(function(p){a.push({k:"logo",id:"logo:"+p.id,n:p.n||p.name,d:"logo · used "+(p.uses||0)+"×",fav:!!p.fav,p:p,src:p.src});});
  var pu=R.projectUse?R.projectUse():{},life={};(R.recent?R.recent(40):[]).forEach(function(r){life[r.k+":"+r.n]=r.c;});
  a.forEach(function(x){x.u=pu[x.id]||0;x.life=x.k==="logo"?(x.p.uses||0):(life[(x.k==="preset"?"preset":"saved")+":"+x.n]||0);x.at=x.p.at||0;if(x.u)x.d+=" · "+x.u+"× in this project";});
  return a.filter(function(x){
    if(Q&&x.n.toLowerCase().indexOf(Q)<0)return false;
    if(F==="fx")return x.k==="preset";if(F==="mine")return x.k==="saved";if(F==="logo")return x.k==="logo";if(F==="fav")return x.fav;if(F==="proj")return x.u>0;return true;
  }).sort(function(x,y){var f=(y.fav?1:0)-(x.fav?1:0);if(SO==="used")return f||(y.life-x.life)||String(x.n).localeCompare(String(y.n));if(SO==="new")return f||(y.at-x.at);return f||String(x.n).localeCompare(String(y.n));});
}
R.libItems=items;
var prev=R.render;
R.render=function(){
  var sh=document.getElementById("rfxSheet");if(!sh||sh.style.display==="none")return;
  if(R.tab!=="lib"){
    prev();
    var lb=sh.querySelector("[data-tab=logos]");
    if(lb&&!sh.querySelector("[data-tab=lib]")){lb.insertAdjacentHTML("afterend",'<button class="rfx-b" data-tab="lib">📚 Library</button>');sh.querySelector("[data-tab=lib]").onclick=function(){R.tab="lib";R.render();};}
    return;
  }
  var list=items(),h='<div class="rfx-top"><b>📚 Library</b><button class="rfx-b" data-x="close">Close</button></div>';
  h+='<div class="rfx-row" style="gap:6px"><button class="rfx-b" data-tab="parts">🎯 Parts</button><button class="rfx-b" data-tab="logos">🏷 Logos</button><button class="rfx-b p" data-tab="lib">📚 Library</button></div>';
  h+='<div class="rfx-row"><input id="rfxQ" class="rfx-b" style="flex:1;text-align:left" placeholder="Search effects, looks, logos…" value="'+esc(Q)+'"></div><div class="rfx-row" style="gap:5px">';
  [["all","All"],["fav","★ Favourites"],["proj","In this project"],["fx","Presets"],["mine","My looks"],["logo","Logos"]].forEach(function(c){h+='<button class="rfx-b'+(F===c[0]?' p':'')+'" data-f="'+c[0]+'">'+c[1]+'</button>';});
  h+='</div><div class="rfx-row"><label>Sort</label><select id="rfxSo" class="rfx-b">'+[["name","Name"],["used","Most used"],["new","Newest"]].map(function(o){return '<option value="'+o[0]+'"'+(SO===o[0]?' selected':'')+'>'+o[1]+'</option>';}).join("")+'</select></div><div class="rfx-note">'+list.length+' item'+(list.length===1?'':'s')+(R.clip()?'. Effects apply to the selected part (or a new 2s part at the playhead).':'. Select a clip to apply effects.')+'</div>';
  list.forEach(function(x,i){
    h+='<div class="rfx-card"><div class="rfx-row">'+(x.src?'<img src="'+x.src+'" style="height:34px;max-width:60px;object-fit:contain;background:#0e1117;border-radius:6px">':'<span style="font-size:20px">'+(x.k==="saved"?"★":"🎨")+'</span>')+'<div style="flex:1"><b>'+esc(x.n)+'</b><div class="rfx-note" style="margin:0">'+esc(x.d)+'</div></div><button class="rfx-b" data-fv="'+i+'">'+(x.fav?'★':'☆')+'</button><button class="rfx-b p" data-ap="'+i+'">'+(x.k==="logo"?'Add':'Apply')+'</button></div></div>';
  });
  sh.innerHTML=h;sh.querySelector("[data-x=close]").onclick=R.close;
  sh.querySelectorAll("[data-tab]").forEach(function(b){b.onclick=function(){R.tab=b.dataset.tab;R.render();};});
  var q=sh.querySelector("#rfxQ");q.oninput=function(){Q=q.value.trim().toLowerCase();clearTimeout(R._qt);R._qt=setTimeout(function(){R.render();var n=document.getElementById("rfxQ");if(n){n.focus();n.setSelectionRange(n.value.length,n.value.length);}},250);};
  sh.querySelector("#rfxSo").onchange=function(){SO=this.value;R.render();};
  sh.querySelectorAll("[data-f]").forEach(function(b){b.onclick=function(){F=b.dataset.f;R.render();};});
  sh.querySelectorAll("[data-fv]").forEach(function(b){b.onclick=function(){var x=list[+b.dataset.fv];if(x.k==="logo")LG.libFav(x.p.id);else setFav(x.id);R.render();};});
  sh.querySelectorAll("[data-ap]").forEach(function(b){b.onclick=function(){
    var x=list[+b.dataset.ap];
    if(x.k==="logo"){LG.libUse(x.p.id);return;}
    var t=R.get(R.sel);if(!t){t=R.add({name:x.n});}if(!t)return;R.sel=t.id;
    if(x.k==="preset")R.applyPreset(t,x.p);else R.userApply(t,x.p);
    R.say("Applied “"+x.n+"”");
  };});
};
R.openLib=function(){R.tab="lib";R.open();};
})();

/* ===== Range FX Step 18: usage tracking - what is used in this project, lifetime counts, sort by most used ===== */
(function(){
var R=window.RFX,LG=window.LOGOS; if(!R) return;
var ap=R.applyPreset;
R.applyPreset=function(r,p){r.src="preset:"+p.n;return ap.call(this,r,p);};
var ua=R.userApply;
if(ua)R.userApply=function(r,it){r.src="saved:"+it.id;return ua.call(this,r,it);};
R.projectUse=function(){
  var m={};
  try{
    project.tracks.forEach(function(t){t.clips.forEach(function(c){(c.ranges||[]).forEach(function(r){if(r.src)m[r.src]=(m[r.src]||0)+1;});});});
    if(LG){var lib=LG.lib();LG.list().forEach(function(l){lib.forEach(function(x){if(x.src===l.src&&l.on!==false)m["logo:"+x.id]=(m["logo:"+x.id]||0)+1;});});}
  }catch(e){}
  return m;
};
/* summary of everything used in this project, shown at the top of the Parts tab */
R.section("projuse",function(c,r){
  var parts=0,fx=0,zoom=0;
  project.tracks.forEach(function(t){t.clips.forEach(function(k){(k.ranges||[]).forEach(function(q){parts++;if(R.fxActive(q).length)fx++;if((q.zoom0||1)!==1||(q.zoom1||1)!==1)zoom++;});});});
  var logos=LG?LG.list().length:0,names=Object.keys(R.projectUse()).filter(function(k){return k.indexOf("logo:")!==0;}).map(function(k){return k.split(":")[0]==="preset"?k.slice(7):((R.userList().filter(function(u){return "saved:"+u.id===k;})[0]||{}).n||"");}).filter(Boolean);
  if(!parts&&!logos)return '';
  return '<h4>Used in this project</h4><div class="rfx-note">'+parts+' part'+(parts===1?'':'s')+' ('+zoom+' with zoom, '+fx+' with effects) · '+logos+' logo'+(logos===1?'':'s')+(names.length?'<br>Looks: '+names.slice(0,8).join(", ").replace(/</g,"&lt;"):'')+'</div>';
});
var s=R.sections.pop();R.sections.splice(2,0,s);
})();

/* ===== Range FX Step 19: apply a look to many clips + library export / import ===== */
(function(){
var R=window.RFX,LG=window.LOGOS; if(!R||!LG) return;
function esc(s){return String(s).replace(/</g,"&lt;").replace(/"/g,"&quot;");}
function looks(){var a=[];R.PRESETS.forEach(function(p){a.push({id:"preset:"+p.n,n:p.n,p:p,k:"preset"});});R.userList().forEach(function(p){a.push({id:"saved:"+p.id,n:"★ "+p.n,p:p,k:"saved"});});return a;}
var T="sel",LK=null;
function targets(c){
  var out=[];
  project.tracks.forEach(function(t){
    if(/audio|text|caption|sub/i.test(t.kind||""))return;
    var here=t.clips.indexOf(c)>=0;
    t.clips.forEach(function(x){
      if(!x.duration||/audio/i.test(x.kind||""))return;
      if(T==="all"||(T==="track"&&here)||(T==="sel"&&x.selected))out.push(x);
    });
  });
  if(T==="sel"&&c&&out.indexOf(c)<0)out.push(c);
  return out;
}
R.section("many",function(c,r){
  var l=looks();if(!LK)LK=l[0]&&l[0].id;
  return '<h4>Apply a look to many clips</h4><div class="rfx-note">Covers the whole of each clip. Select several clips on the timeline first, or choose a wider target.</div>'+
  '<div class="rfx-row"><select id="rfxMl" class="rfx-b" style="flex:1">'+l.map(function(x){return '<option value="'+esc(x.id)+'"'+(x.id===LK?' selected':'')+'>'+esc(x.n)+'</option>';}).join("")+'</select></div>'+
  '<div class="rfx-row"><select id="rfxMt" class="rfx-b" style="flex:1"><option value="sel"'+(T==="sel"?' selected':'')+'>Selected clips (+ this one)</option><option value="track"'+(T==="track"?' selected':'')+'>All clips on this track</option><option value="all"'+(T==="all"?' selected':'')+'>All video clips</option></select></div>'+
  '<div class="rfx-row" style="gap:5px"><button class="rfx-b p" data-x="many">Apply to '+targets(c).length+' clip'+(targets(c).length===1?'':'s')+'</button><button class="rfx-b" data-x="manyclr">Remove parts from them</button></div>';
},function(root,c,r){
  root.querySelector("#rfxMl").onchange=function(){LK=this.value;};
  root.querySelector("#rfxMt").onchange=function(){T=this.value;R.render();};
  root.querySelector("[data-x=many]").onclick=function(){
    var x=looks().filter(function(q){return q.id===LK;})[0];if(!x){R.say("Choose a look");return;}
    var tg=targets(c),n=0;
    transact("Apply look to clips",function(){tg.forEach(function(k){
      var p=x.p,z=p.zoom||[1,1];
      k.ranges=k.ranges||[];
      k.ranges.push({id:uid("rg"),name:p.n,s:0,e:+k.duration.toFixed(2),zoom0:z[0],zoom1:z[1],fx:JSON.parse(JSON.stringify(p.fx||{})),ease:p.ease||"smooth",punch:!!p.punch,on:true,src:x.id});n++;
    });});
    try{if(R.onUse)R.onUse(x.k,p0(x));}catch(e){}
    R.save();R.render();R.redraw();R.say("Applied to "+n+" clip"+(n===1?"":"s"));
  };
  root.querySelector("[data-x=manyclr]").onclick=function(){
    var tg=targets(c);if(!window.confirm("Remove all parts from "+tg.length+" clip(s)?"))return;
    transact("Remove parts",function(){tg.forEach(function(k){k.ranges=[];});});R.sel=null;R.save();R.render();R.redraw();
  };
});
function p0(x){return x.p.n;}
/* ---- export / import of the library ---- */
function dump(){
  var f={};try{f=JSON.parse(localStorage.getItem("rfx.favs.v1")||"{}");}catch(e){}
  return {app:"video-studio-library",v:1,at:Date.now(),looks:R.userList(),logos:LG.lib(),favs:f,recent:R.recent?R.recent(40):[]};
}
function merge(d){
  var nl=0,ng=0;
  var cur=R.userList(),ids={};cur.forEach(function(x){ids[x.id]=1;});
  (d.looks||[]).forEach(function(x){if(x&&x.id&&x.fx&&!ids[x.id]){cur.push(x);ids[x.id]=1;nl++;}});
  try{localStorage.setItem("rfx.user.v1",JSON.stringify(cur));project.rfxUser=cur;}catch(e){}
  var lib=LG.lib(),sg={};lib.forEach(function(x){sg[x.sig]=1;});
  (d.logos||[]).forEach(function(x){if(x&&x.src&&x.sig&&!sg[x.sig]){lib.push(x);sg[x.sig]=1;ng++;}});
  try{localStorage.setItem("rfx.logolib.v1",JSON.stringify(lib));}catch(e){R.say("Not enough space for all logos");}
  try{var f=JSON.parse(localStorage.getItem("rfx.favs.v1")||"{}");Object.keys(d.favs||{}).forEach(function(k){f[k]=1;});localStorage.setItem("rfx.favs.v1",JSON.stringify(f));}catch(e){}
  R.save();return [nl,ng];
}
var prev=R.render;
R.render=function(){
  prev();
  var sh=document.getElementById("rfxSheet");if(!sh||sh.style.display==="none"||R.tab!=="lib")return;
  sh.insertAdjacentHTML("beforeend",'<h4>Backup &amp; share library</h4><div class="rfx-note">Export your saved looks, logos and favourites to a file, and import them on another device or project.</div><div class="rfx-row" style="gap:5px"><button class="rfx-b p" data-x="lbx">⤓ Export library</button><button class="rfx-b" data-x="lbi">⤒ Import library</button><input type="file" id="rfxImp" accept=".json,application/json" style="display:none"></div>');
  sh.querySelector("[data-x=lbx]").onclick=function(){
    try{var b=new Blob([JSON.stringify(dump())],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="video-studio-library.json";document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},1500);R.say("Library exported");}catch(e){R.say("Export failed");}
  };
  var fi=sh.querySelector("#rfxImp");sh.querySelector("[data-x=lbi]").onclick=function(){fi.click();};
  fi.onchange=function(){
    var f=fi.files[0];if(!f)return;var fr=new FileReader();
    fr.onload=function(){try{var d=JSON.parse(fr.result);if(d.app!=="video-studio-library")throw 0;var m=merge(d);R.say("Imported "+m[0]+" look"+(m[0]===1?"":"s")+" and "+m[1]+" logo"+(m[1]===1?"":"s"));R.render();}catch(e){R.say("That file is not a Video Studio library");}};
    fr.readAsText(f);fi.value="";
  };
};
})();

/* ===== Range FX Step 20: Help tab, self-test, shortcuts ===== */
(function(){
var R=window.RFX,LG=window.LOGOS; if(!R) return;
R.selfTest=function(){
  var res=[],ok=function(n,v){res.push([n,!!v]);};
  try{
    var c={start:0,duration:10,ranges:[{id:"t1",s:2,e:4,zoom0:1,zoom1:2,fx:{blur:10,gray:1},ease:"linear",on:true,fin:0,fout:0}]};
    ok("No effect outside a part",R.state(c,1)===null);
    var a=R.state(c,3);ok("Zoom halfway = 1.5×",a&&Math.abs(a.z-1.5)<.01);
    ok("Blur and B&W in filter",a&&/blur\(10/.test(a.fx)&&/grayscale\(1/.test(a.fx));
    c.ranges[0].fin=1;var b=R.state(c,2.5);ok("Fade-in lowers strength",b&&/blur\((?!10)/.test(b.fx));
    c.ranges[0].on=false;ok("Switched-off part ignored",R.state(c,3)===null);
    R.peek=true;c.ranges[0].on=true;ok("Compare mode hides effects",R.state(c,3)===null);R.peek=false;
    ok("Render hook installed",/RFX draw hook|pend/.test(String(ctx.drawImage))||ctx.drawImage.toString().indexOf("native code")<0);
    ok("Filter hook installed",String(window.amiyoCleanFilter).indexOf("pend")>=0);
    ok("Part speed tools ready",typeof R.speedPart==="function"&&typeof R.rampPart==="function");
    ok("Presets loaded ("+R.PRESETS.length+")",R.PRESETS.length>=10);
    if(LG){var l={s:2,e:4,fi:0,fo:0,anim:"none"};ok("Logo hidden before start",LG.vis(l,1)===0);ok("Logo visible inside",LG.vis(l,3)===1);l.anim="pop";ok("Logo animation runs",LG.anim(l,2.1).sc!==1);}
    var t="rfx.selftest";try{localStorage.setItem(t,"1");localStorage.removeItem(t);ok("Device storage works",true);}catch(e){ok("Device storage works (not available here - saved looks stay in the project only)",false);}
    ok("Timeline bars ready",typeof R.decorate==="function");
  }catch(e){ok("Self-test crashed: "+e.message,false);}
  R.lastTest=res;return res;
};
var HELP='<h4>Quick guide</h4><div class="rfx-note"><b>1. Make a part.</b> Select a clip, move the playhead, tap <i>Add part</i> (2s). Adjust start/end or use <i>Start = playhead</i>.<br><b>2. Zoom in/out.</b> Pick a zoom preset or set zoom start/end. Choose the focus point with the grid or by tapping the preview.<br><b>3. Speed.</b> Pick 2×, 4× or slow-mo for the part, or a smooth <i>ramp</i>. The clip is split and later clips move.<br><b>4. Effects.</b> Sliders for blur, brightness, colour, B&amp;W, sepia, hue. Use presets, fade in/out, and hold 👁 to compare.<br><b>5. Save.</b> ★ Save this look, find it again in My saved effects, Recently used, or 📚 Library.<br><b>6. Logos.</b> Add from files, place, size, timing, animation. Save to the logo library.<br><b>7. Many clips.</b> Apply a look to selected clips, a track or all clips.</div>'+
'<h4>Shortcuts</h4><div class="rfx-note">Shift+P parts · Shift+L logos · Shift+B library · Shift+H this help</div>';
var prev=R.render;
R.render=function(){
  var sh=document.getElementById("rfxSheet");if(!sh||sh.style.display==="none")return;
  if(R.tab==="help"){
    var h='<div class="rfx-top"><b>❓ Help &amp; self-test</b><button class="rfx-b" data-x="close">Close</button></div><div class="rfx-row" style="gap:6px"><button class="rfx-b" data-tab="parts">🎯 Parts</button><button class="rfx-b" data-tab="logos">🏷 Logos</button><button class="rfx-b" data-tab="lib">📚 Library</button><button class="rfx-b p" data-tab="help">❓ Help</button></div>'+HELP+'<h4>Self-test</h4><div class="rfx-row"><button class="rfx-b p" data-x="test">Run self-test</button></div><div id="rfxTest">'+
    (R.lastTest?R.lastTest.map(function(x){return '<div class="rfx-note" style="color:'+(x[1]?'#6fdc8c':'#ff8a8a')+'">'+(x[1]?'✔ ':'✖ ')+x[0]+'</div>';}).join(""):'')+'</div>';
    sh.innerHTML=h;sh.querySelector("[data-x=close]").onclick=R.close;
    sh.querySelectorAll("[data-tab]").forEach(function(b){b.onclick=function(){R.tab=b.dataset.tab;R.render();};});
    sh.querySelector("[data-x=test]").onclick=function(){R.selfTest();R.render();};
    return;
  }
  prev();
  var lb=sh.querySelector("[data-tab=lib]")||sh.querySelector("[data-tab=logos]");
  if(lb&&!sh.querySelector("[data-tab=help]")){lb.insertAdjacentHTML("afterend",'<button class="rfx-b" data-tab="help">❓</button>');sh.querySelector("[data-tab=help]").onclick=function(){R.tab="help";R.render();};}
};
window.addEventListener("keydown",function(e){
  if(!e.shiftKey||e.ctrlKey||e.metaKey||/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||""))return;
  var k=(e.key||"").toLowerCase(),m={l:"logos",b:"lib",h:"help"};
  if(m[k]){e.preventDefault();R.tab=m[k];R.open();}
});
R.ready=true;
})();


try{window.AMIYO_EDITOR_BUILD="vs-lib-step53-rangefx20";}catch(e){}

;
/* ==================== Script 558 id="amiyo-pip-s75" ==================== */
/* PiP Studio — Step 75: edit any PiP after creating it, and attach more videos straight from the main clip.
   Shared API (window.AMIYO_PIP) is used by every later PiP step. */
(function(){
"use strict";
if(window.AMIYO_PIP&&window.AMIYO_PIP.v) return;
const $=id=>document.getElementById(id);
const cl=(v,a,b)=>Math.min(b,Math.max(a,isFinite(+v)?+v:a));
const SH=[["circle","Circle","ellipse",1],["square","Square","rect",1],["rsquare","Round square","rounded",1],["rect","Rectangle","rect",0],["rounded","Rounded","rounded",0],["oval","Oval","ellipse",0],["diamond","Diamond","diamond",1],["triangle","Triangle","triangle",1],["hexagon","Hexagon","hexagon",1],["star","Star","star",1],["heart","Heart","heart",1]];
const SPOTS=[[.82,.2],[.82,.8],[.18,.8],[.18,.2],[.5,.5]];
const API=window.AMIYO_PIP={v:75,SHAPES:SH,panels:[],mainPanels:[]};
const hist=(label,before)=>{ try{ recordHistory(label,before,deepClone(serializableProject())); }catch(e){ window.__swl&&window.__swl(e); } };
API.def=id=>SH.find(s=>s[0]===id)||SH[0];
API.find=id=>{ for(const t of project.tracks) for(const c of t.clips) if(c.id===id) return {track:t,clip:c}; return null; };
API.mainOf=c=>c&&c.pip&&c.pip.main?API.find(c.pip.main):null;
API.pipsOf=mid=>{ const o=[]; for(const t of project.tracks) for(const c of t.clips) if(c.pip&&c.pip.main===mid) o.push({track:t,clip:c}); return o; };
API.size=c=>(c.scale||1)*((c.mask&&c.mask.w)||1);
API.ar=c=>{ const a=getAsset(c.assetId); return a&&a.width&&a.height?a.width/a.height:16/9; };
API.setSize=(c,s)=>{ s=cl(s,.04,1.5); c.scale=cl(s/((c.mask&&c.mask.w)||1),.02,8); if(c.pip) c.pip.size=s; };
API.setShape=(c,id,size)=>{
  const d=API.def(id), ar=API.ar(c), sq=!!d[3], mw=sq?(ar>=1?1/ar:1):1, mh=sq?(ar>=1?1:ar):1;
  c.mask=Object.assign({feather:0,invert:false},c.mask||{},{enabled:true,shape:d[2],x:.5,y:.5,w:mw,h:mh});
  c.pip=Object.assign({border:0,color:"#ffffff",shadow:true},c.pip||{},{shape:id});
  API.setSize(c,size||c.pip.size||.28);
};
/* gesture-based editing: many slider ticks become one undo step */
let gest=null;
const finishGest=()=>{ if(!gest) return; clearTimeout(gest.t); const g=gest; gest=null; hist(g.label,g.before); };
API.flush=finishGest;
API.edit=function(label,fn){
  if(gest&&gest.label!==label) finishGest(); /* a different control = its own undo step */
  if(!gest) gest={before:deepClone(serializableProject()),label:label};
  fn(); try{ scheduleAutosave(); renderPreviewFrame(); }catch(e){}
  /* Step 6: while the pointer is still held down on a PiP slider the gesture stays open, so a pause in the middle of a drag is still ONE undo step */
  clearTimeout(gest.t); const fin=()=>{ if(holdSince&&Date.now()-holdSince<30000){ gest.t=setTimeout(fin,150); return; } finishGest(); };
  gest.t=setTimeout(fin,600);
};
let holdSince=0;
document.addEventListener("pointerdown",e=>{ const t=e.target; if(t&&t.matches&&t.matches("input[type=range]")&&t.closest&&t.closest("#ppGroup")) holdSince=Date.now(); },true);
/* plan step 6: letting go of a slider closes its undo step right away, so an Undo pressed a moment later undoes THIS drag, not the step before it */
["pointerup","pointercancel","dragend"].forEach(ev=>window.addEventListener(ev,()=>{ const was=holdSince; holdSince=0; if(was) setTimeout(finishGest,30); },true));
window.addEventListener("blur",()=>{ if(holdSince){ holdSince=0; setTimeout(finishGest,30); } });
API.select=(f)=>{ selectedClipId=f.clip.id; selectedTrackId=f.track.id; renderAll(); try{ currentTime=Math.max(currentTime,f.clip.start); }catch(e){} };
API.create=function(mainId,assetId,o){
  o=o||{}; const m=API.find(mainId), a=getAsset(assetId); if(!m||!a||(a.type!=="video"&&a.type!=="image")) return null;
  const n=API.pipsOf(mainId).length, sp=SPOTS[n%SPOTS.length], id=o.shape||(n%2?"rsquare":"circle");
  const off=cl(o.start||0,0,Math.max(0,m.clip.duration-.5)), dur=Math.max(Math.min(.5,m.clip.duration),Math.min(o.dur||a.duration||5,a.duration||5,m.clip.duration-off));
  const before=deepClone(serializableProject());
  let last=project.tracks.map(t=>t.kind).lastIndexOf("video");
  const nm=project.tracks.filter(t=>/^PiP/.test(t.name||"")).length+1;
  const tr={id:uid("track"),name:"PiP "+nm,kind:"video",locked:false,hidden:false,muted:!o.sound,clips:[]};
  project.tracks.splice(last+1,0,tr);
  const c={id:uid("clip"),assetId:a.id,start:m.clip.start+off,duration:dur,inPoint:o.inP||0,outPoint:(o.inP||0)+dur,volume:o.sound?1:0,opacity:1,speed:1,rotation:0,scale:1,x:o.x!=null?o.x:sp[0],y:o.y!=null?o.y:sp[1],trimL:0,trimR:0,fit:"contain",effects:[],keyframes:[],transitionIn:null,transitionOut:null,
    pip:{shape:id,size:o.size||.28,border:o.border!=null?o.border:3,color:o.color||"#ffffff",shadow:o.shadow!==false,main:m.clip.id}};
  API.setShape(c,id,o.size||.28); tr.clips.push(c);
  hist("Add picture-in-picture",before);
  selectedClipId=c.id; selectedTrackId=tr.id; try{ currentTime=c.start; }catch(e){}
  scheduleAutosave(); renderAll(); try{ renderPreviewFrame(); }catch(e){}
  return {track:tr,clip:c};
};
API.layerAct=function(a,f){
  const c=f.clip, before=deepClone(serializableProject()); let label="PiP layer";
  if(a==="hide"){ c.off=!c.off; label=c.off?"Hide PiP layer":"Show PiP layer"; }
  else if(a==="dup"){ const n=deepClone(c); n.id=uid("clip"); if(n.pip) n.pip.sig=null; n.x=Math.min(.95,(c.x==null?.5:c.x)+.06); n.y=Math.min(.95,(c.y==null?.5:c.y)+.06);
    const tr={id:uid("track"),name:"PiP "+(project.tracks.filter(t=>/^PiP/.test(t.name||"")).length+1),kind:"video",locked:false,hidden:false,muted:!!f.track.muted,clips:[n]};
    project.tracks.splice(project.tracks.indexOf(f.track)+1,0,tr); selectedClipId=n.id; selectedTrackId=tr.id; label="Duplicate PiP layer"; }
  else if(a==="front"||a==="back"){ const ts=project.tracks, i=ts.indexOf(f.track), j=i+(a==="front"?1:-1), o=ts[j];
    if(!o||o.kind!=="video"||!/^PiP/.test(o.name||"")){ try{ toast(a==="front"?"Already in front":"Already at the back"); }catch(e){} return; }
    ts[i]=o; ts[j]=f.track; label=a==="front"?"Bring PiP forward":"Send PiP back"; }
  hist(label,before); scheduleAutosave(); renderAll(); try{ renderPreviewFrame(); }catch(e){}
};
API.remove=function(id){
  const f=API.find(id); if(!f) return; const mid=f.clip.pip&&f.clip.pip.main, before=deepClone(serializableProject());
  f.track.clips=f.track.clips.filter(c=>c.id!==id);
  if(!f.track.clips.length&&/^PiP/.test(f.track.name||"")) project.tracks=project.tracks.filter(t=>t!==f.track);
  const m=mid&&API.find(mid); selectedClipId=m?m.clip.id:null; if(m) selectedTrackId=m.track.id;
  hist("Remove picture-in-picture",before); scheduleAutosave(); renderAll(); try{ renderPreviewFrame(); }catch(e){}
};

/* ---------- styles ---------- */
const st=document.createElement("style"); st.textContent=`
#ppGroup .pp-note{font-size:11px;color:var(--muted,#9aa);margin:2px 0 8px;line-height:1.4}
#ppGroup .pp-chips{display:flex;flex-wrap:wrap;gap:5px;margin:4px 0 8px}
#ppGroup .pp-chips button,#ppGroup .pp-btn{background:#30231d;color:#fbe0d2;border:1px solid #503d33;border-radius:8px;padding:6px 9px;font-size:11.5px;cursor:pointer;min-height:30px}
#ppGroup .pp-chips button.on{background:#ff7a3d;border-color:#ff7a3d;color:#111;font-weight:700}
#ppGroup .pp-btn.pri{background:#ff7a3d;border-color:#ff7a3d;color:#111;font-weight:700}
#ppGroup .pp-btn.dng{color:#ff8b8b}
#ppGroup .pp-row{display:flex;gap:6px;align-items:center;margin:6px 0}
#ppGroup .pp-row>*{flex:1}
#ppGroup .pp-act{display:flex;gap:2px;flex:none}#ppGroup .pp-act button{border:1px solid var(--line,#333);background:transparent;color:inherit;border-radius:6px;width:26px;height:26px;font-size:11px;cursor:pointer;padding:0}#ppGroup .pp-act button:hover{border-color:var(--accent,#ff7a3d)}
#ppGroup .pp-list{display:flex;flex-direction:column;gap:5px;margin:6px 0}
#ppGroup .pp-item{display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:8px;background:#271c16;border:1px solid #44332a;cursor:pointer;font-size:12px}
#ppGroup .pp-item b{width:20px;height:20px;border-radius:50%;background:#ff7a3d;color:#111;display:grid;place-items:center;font-size:11px;flex:none}
#ppGroup .pp-item span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#ppGroup .pp-item small{color:#8b94a8}
#ppGroup input[type=range]{width:100%}
#ppGroup select{width:100%}
#ppGroup h3 small{font-weight:400;color:#8b94a8;margin-left:6px;font-size:10.5px}
`; document.head.appendChild(st);

const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
function slider(id,label,min,max,val,suffix){ return `<label class="field">${label} <span id="${id}V">${val}${suffix||""}</span></label><input id="${id}" type="range" min="${min}" max="${max}" step="1" value="${val}">`; }

function panel(){
  const f=getClip(); if(!f||f.track.kind!=="video"||f.clip.kind==="adjustment") return;
  const insp=$("inspector"); if(!insp||$("ppGroup")) return;
  const c=f.clip, g=document.createElement("div"); g.className="group"; g.id="ppGroup";
  if(c.pip) pipPanel(g,f); else mainPanel(g,f);
  insp.insertBefore(g,insp.children[1]||null);
}
function mainPanel(g,f){
  const pips=API.pipsOf(f.clip.id), used=new Set([f.clip.assetId]);
  const vids=Object.values(project.assets).filter(a=>(a.type==="video"||a.type==="image")&&a.id!==f.clip.assetId);
  g.innerHTML=`<h3>▣ PiP Studio <small>${pips.length?pips.length+" attached":"main video"}</small></h3>
   <div class="pp-note">Attach other videos on top of this one. Each gets its own shape, size, position and timing.</div>
   <div class="pp-list">${pips.map((p,i)=>`<div class="pp-item" data-sel="${p.clip.id}"><b>${i+1}</b><span>${esc((getAsset(p.clip.assetId)||{}).name||"Video")}</span><small>${esc(API.def(p.clip.pip.shape)[1])}</small><span class="pp-act"><button type="button" data-act="hide" title="${p.clip.off?"Show":"Hide"} this layer">${p.clip.off?"\u{1F6AB}":"\u{1F441}"}</button><button type="button" data-act="dup" title="Duplicate">\u29C9</button><button type="button" data-act="back" title="Send back">\u25BC</button><button type="button" data-act="front" title="Bring forward">\u25B2</button></span></div>`).join("")}</div>
   <select id="ppAsset">${vids.length?vids.map(a=>`<option value="${a.id}">${esc(a.name||"Video")} · ${(+a.duration||0).toFixed(1)}s</option>`).join(""):`<option value="">No other videos yet — import some</option>`}</select>
   <div class="pp-row"><button class="pp-btn pri" id="ppAddBtn"${vids.length?"":" disabled"}>＋ Attach on top</button><button class="pp-btn" id="ppImpBtn">Import videos…</button></div>
   <div class="pp-row"><button class="pp-btn" id="ppWizBtn">Open PiP wizard</button></div>`;
  g.onclick=e=>{ const ab=e.target.closest("[data-act]"); if(ab){ const it=ab.closest("[data-sel]"), x=it&&API.find(it.dataset.sel); if(x) API.layerAct(ab.dataset.act,x); return; }
    const t=e.target.closest("[data-sel]"); if(t){ const x=API.find(t.dataset.sel); if(x) API.select(x); return; }
    if(e.target.id==="ppAddBtn"){ const v=g.querySelector("#ppAsset").value; if(v){ const r=API.create(f.clip.id,v); if(!r) toast("Could not attach that video"); } }
    if(e.target.id==="ppImpBtn"){ const fi=$("fileInput"); if(fi) fi.click(); }
    if(e.target.id==="ppWizBtn"&&window.amiyoOpenPip) window.amiyoOpenPip([]); };
  API.mainPanels.forEach(fn=>{ try{ fn(g,f); }catch(e){ window.__swl&&window.__swl(e); } });
}
function pipPanel(g,f){
  const c=f.clip, p=c.pip, mf=API.mainOf(c), nm=mf?((getAsset(mf.clip.assetId)||{}).name||"main"):"main";
  g.innerHTML=`<h3>▣ PiP Studio <small>on ${esc(nm)}</small></h3>
   <label class="field">Shape</label>
   <div class="pp-chips" id="ppShapes">${SH.map(s=>`<button data-shape="${s[0]}" class="${p.shape===s[0]?"on":""}">${s[1]}</button>`).join("")}</div>
   ${slider("ppSize","Size",4,150,Math.round(API.size(c)*100),"%")}
   <div class="fieldrow"><div>${slider("ppX","X",0,100,Math.round((c.x??.5)*100),"%")}</div><div>${slider("ppY","Y",0,100,Math.round((c.y??.5)*100),"%")}</div></div>
   <div class="fieldrow"><div>${slider("ppRot","Rotate",-180,180,Math.round(c.rotation||0),"°")}</div><div>${slider("ppOp","Opacity",0,100,Math.round((c.opacity??1)*100),"%")}</div></div>
   <div class="fieldrow"><div>${slider("ppBd","Border",0,24,p.border||0,"px")}</div><div><label class="field">Colour</label><input id="ppCl" type="color" value="${esc(p.color||"#ffffff")}" style="width:100%;height:32px;padding:0"></div></div>
   <label style="font-size:12px;display:flex;gap:6px;align-items:center;margin:6px 0"><input type="checkbox" id="ppSh"${p.shadow?" checked":""}> Drop shadow</label>
   <div id="ppExtra"></div>
   <div class="pp-row"><button class="pp-btn" id="ppToMain">◀ Main video</button><button class="pp-btn dng" id="ppDel">Remove</button></div>`;
  const q=id=>g.querySelector("#"+id);
  const E=(id,label,fn,sfx)=>{ const el=q(id); if(!el) return; el.oninput=()=>{ API.edit(label,()=>fn(el)); const v=q(id+"V"); if(v) v.textContent=el.value+(sfx||""); }; };
  g.onclick=e=>{ const b=e.target.closest("[data-shape]");
    if(b){ API.edit("PiP shape",()=>API.setShape(c,b.dataset.shape,API.size(c))); g.querySelectorAll("[data-shape]").forEach(x=>x.classList.toggle("on",x===b)); }
    if(e.target.id==="ppDel") API.remove(c.id);
    if(e.target.id==="ppToMain"&&mf) API.select(mf); };
  E("ppSize","PiP size",el=>API.setSize(c,el.value/100),"%");
  E("ppX","PiP position",el=>{ c.x=el.value/100; },"%"); E("ppY","PiP position",el=>{ c.y=el.value/100; },"%");
  E("ppRot","PiP rotation",el=>{ c.rotation=+el.value; },"°"); E("ppOp","PiP opacity",el=>{ c.opacity=el.value/100; },"%");
  E("ppBd","PiP border",el=>{ p.border=+el.value; },"px");
  q("ppCl").oninput=e=>API.edit("PiP border colour",()=>{ p.color=e.target.value; });
  q("ppSh").onchange=e=>API.edit("PiP shadow",()=>{ p.shadow=e.target.checked; });
  const ex=q("ppExtra"); API.panels.forEach(fn=>{ try{ fn(ex,f,g); }catch(err){ window.__swl&&window.__swl(err); } });
}
const prev=window.renderInspector;
window.renderInspector=function(){ prev.apply(this,arguments); try{ panel(); }catch(e){ window.__swl&&window.__swl(e); } };
try{ window.AMIYO_EDITOR_BUILD="pip-step75-studio"; }catch(e){}
try{ renderInspector(); }catch(e){}
})();

;
/* ==================== Script 559 id="amiyo-pip-s76" ==================== */
/* PiP Studio — Step 76: direct manipulation on the preview. Drag the shape to move, corners to resize, top knob to rotate. */
(function(){
"use strict";
const A=window.AMIYO_PIP; if(!A||A.ov) return;
const $=id=>document.getElementById(id);
const shell=$("canvasShell"); if(!shell) return;
const cs=getComputedStyle(shell); if(cs.position==="static") shell.style.position="relative";
const st=document.createElement("style"); st.textContent=`
#ppOv{position:absolute;inset:0;pointer-events:none;z-index:30;overflow:visible}
#ppOv .pg{position:absolute;pointer-events:auto;border:1.5px dashed rgba(255,255,255,.55);box-sizing:border-box;cursor:pointer;touch-action:none}
#ppOv .pg:hover{border-color:#ff7a3d}
#ppOv .pb{position:absolute;pointer-events:auto;border:2px solid #ff7a3d;box-sizing:border-box;cursor:move;touch-action:none;box-shadow:0 0 0 1px rgba(0,0,0,.45)}
#ppOv .pb i{position:absolute;width:14px;height:14px;background:#fff;border:2px solid #ff7a3d;border-radius:3px;box-sizing:border-box;touch-action:none}
#ppOv .pb i[data-h=nw]{left:-8px;top:-8px;cursor:nwse-resize}#ppOv .pb i[data-h=ne]{right:-8px;top:-8px;cursor:nesw-resize}
#ppOv .pb i[data-h=sw]{left:-8px;bottom:-8px;cursor:nesw-resize}#ppOv .pb i[data-h=se]{right:-8px;bottom:-8px;cursor:nwse-resize}
#ppOv .pb i[data-h=rot]{left:50%;top:-30px;margin-left:-8px;width:16px;height:16px;border-radius:50%;cursor:grab;background:#ff7a3d;border-color:#fff}
#ppOv .pb u{position:absolute;left:50%;top:-16px;width:2px;height:14px;background:#ff7a3d;margin-left:-1px}
#ppOv .pb em{position:absolute;left:50%;bottom:-24px;transform:translateX(-50%);font:600 10px/1 system-ui;background:#111c;color:#fff;padding:3px 6px;border-radius:5px;white-space:nowrap;font-style:normal;pointer-events:none}
@media (pointer:coarse){#ppOv .pb i{width:22px;height:22px}#ppOv .pb i[data-h=nw]{left:-12px;top:-12px}#ppOv .pb i[data-h=ne]{right:-12px;top:-12px}#ppOv .pb i[data-h=sw]{left:-12px;bottom:-12px}#ppOv .pb i[data-h=se]{right:-12px;bottom:-12px}#ppOv .pb i[data-h=rot]{width:24px;height:24px;margin-left:-12px;top:-40px}#ppOv .pb u{top:-20px;height:20px}}
`; document.head.appendChild(st);
const ov=document.createElement("div"); ov.id="ppOv"; shell.appendChild(ov);
A.ov=ov; A.hooks={drag:[],drop:[]};

/* screen box of a PiP clip, in px relative to the preview */
function box(c){
  const sw=shell.clientWidth, shh=shell.clientHeight, m=c.mask||{w:1,h:1}, ar=A.ar(c);
  const bw=(c.scale||1)*(m.w||1)*sw, bh=(c.scale||1)*(m.h||1)*sw/ar;
  return {cx:(c.x??.5)*sw, cy:(c.y??.5)*shh, w:Math.max(8,bw), h:Math.max(8,bh), rot:c.rotation||0, sw, sh:shh};
}
function activePips(){
  const o=[]; const t=(typeof currentTime==="number")?currentTime:0;
  for(const tr of project.tracks){ if(tr.hidden||tr.kind!=="video") continue;
    for(const c of tr.clips) if(c.pip&&!c.off&&t>=c.start-1e-6&&t<c.start+c.duration) o.push({track:tr,clip:c}); }
  return o;
}
function syncPanel(c){
  const set=(id,v,sfx)=>{ const e=$(id); if(e){ e.value=v; const l=$(id+"V"); if(l) l.textContent=v+(sfx||""); } };
  set("ppSize",Math.round(A.size(c)*100),"%"); set("ppX",Math.round((c.x??.5)*100),"%"); set("ppY",Math.round((c.y??.5)*100),"%"); set("ppRot",Math.round(c.rotation||0),"°");
}
let drag=null;
function update(){
  if(drag) return;
  const sel=getClip(), selPip=sel&&sel.clip.pip?sel:null, act=activePips();
  if(!act.length){ if(ov.firstChild) ov.textContent=""; return; }
  let html="";
  for(const p of act){ const c=p.clip, b=box(c), on=selPip&&selPip.clip.id===c.id;
    const css=`left:${b.cx-b.w/2}px;top:${b.cy-b.h/2}px;width:${b.w}px;height:${b.h}px;transform:rotate(${b.rot}deg)`;
    html+=on?`<div class="pb" data-id="${c.id}" style="${css}"><u></u><i data-h="rot"></i><i data-h="nw"></i><i data-h="ne"></i><i data-h="sw"></i><i data-h="se"></i><em>${Math.round(A.size(c)*100)}% · ${Math.round(c.rotation||0)}°</em></div>`
             :`<div class="pg" data-id="${c.id}" style="${css}" title="Select this PiP"></div>`; }
  if(ov.__h!==html){ ov.innerHTML=html; ov.__h=html; }
}
A.refreshOverlay=function(){ ov.__h=null; update(); };

ov.addEventListener("pointerdown",e=>{
  const el=e.target.closest("[data-id]"); if(!el) return;
  const id=el.dataset.id, f=A.find(id); if(!f) return;
  e.preventDefault(); e.stopPropagation();
  if(el.classList.contains("pg")){ A.select(f); return; }
  const c=f.clip, b=box(c), r=shell.getBoundingClientRect(), k=e.target.dataset&&e.target.dataset.h||"move";
  const px=e.clientX-r.left, py=e.clientY-r.top;
  drag={id,k,b,x0:c.x??.5,y0:c.y??.5,s0:A.size(c),r0:c.rotation||0,px,py,d0:Math.hypot(px-b.cx,py-b.cy)||1,a0:Math.atan2(py-b.cy,px-b.cx),moved:false,
        before:deepClone(serializableProject())};
  try{ el.setPointerCapture(e.pointerId); }catch(_){}
},true);
window.addEventListener("pointermove",e=>{
  if(!drag) return; const f=A.find(drag.id); if(!f){ drag=null; return; }
  const c=f.clip, r=shell.getBoundingClientRect(), px=e.clientX-r.left, py=e.clientY-r.top, d=drag;
  d.moved=true;
  if(d.k==="move"){ c.x=Math.min(1.2,Math.max(-.2,d.x0+(px-d.px)/d.b.sw)); c.y=Math.min(1.2,Math.max(-.2,d.y0+(py-d.py)/d.b.sh)); }
  else if(d.k==="rot"){ let a=d.r0+(Math.atan2(py-d.b.cy,px-d.b.cx)-d.a0)*180/Math.PI; a=((a+540)%360)-180;
    const snaps=[-180,-135,-90,-45,0,45,90,135,180]; const tol=e.shiftKey?15:3.5; for(const s of snaps) if(Math.abs(a-s)<tol){ a=s; break; }
    c.rotation=Math.round(a*10)/10; }
  else { A.setSize(c,d.s0*Math.hypot(px-d.b.cx,py-d.b.cy)/d.d0); }
  (A.hooks.drag||[]).forEach(h=>{ try{ h(c,d,e); }catch(_){} });
  const up=()=>{ ov.__h=null; const b=box(c); const el=ov.querySelector(".pb"); if(el){ el.style.cssText=`left:${b.cx-b.w/2}px;top:${b.cy-b.h/2}px;width:${b.w}px;height:${b.h}px;transform:rotate(${b.rot}deg)`; const em=el.querySelector("em"); if(em) em.textContent=Math.round(A.size(c)*100)+"% · "+Math.round(c.rotation||0)+"°"; } };
  up(); syncPanel(c); try{ renderPreviewFrame(); }catch(_){}
});
function end(){
  if(!drag) return; const d=drag; drag=null;
  if(d.moved){ try{ recordHistory(d.k==="move"?"Move PiP":d.k==="rot"?"Rotate PiP":"Resize PiP",d.before,deepClone(serializableProject())); scheduleAutosave(); }catch(_){} }
  (A.hooks.drop||[]).forEach(h=>{ try{ h(); }catch(_){} });
  ov.__h=null; update();
}
window.addEventListener("pointerup",end); window.addEventListener("pointercancel",end);

const rp=window.renderPreviewFrame;
window.renderPreviewFrame=async function(){ const r=await rp.apply(this,arguments); try{ update(); }catch(_){} return r; };
const ra=window.renderAll; window.renderAll=function(){ const r=ra.apply(this,arguments); try{ ov.__h=null; update(); }catch(_){} return r; };
try{ new ResizeObserver(()=>{ ov.__h=null; update(); }).observe(shell); }catch(_){}
try{ window.AMIYO_EDITOR_BUILD="pip-step76-handles"; }catch(_){}
update();
})();

;
/* ==================== Script 560 id="amiyo-pip-s77" ==================== */
/* PiP Studio — Step 77: snap guides, safe margins and arrow-key nudging. */
(function(){
"use strict";
const A=window.AMIYO_PIP; if(!A||!A.hooks||A.snapCfg) return;
const $=id=>document.getElementById(id), ov=A.ov;
let cfg={on:true,margin:.05}; try{ const j=JSON.parse(localStorage.getItem("amiyo_pip_snap")||"null"); if(j) cfg=Object.assign(cfg,j); }catch(_){}
A.snapCfg=cfg; const save=()=>{ try{ localStorage.setItem("amiyo_pip_snap",JSON.stringify(cfg)); }catch(_){} };
const st=document.createElement("style"); st.textContent=`#ppOv .gl{position:absolute;background:#2ee6c5;pointer-events:none;opacity:.9}#ppOv .gm{position:absolute;border:1px dashed rgba(46,230,197,.55);pointer-events:none;box-sizing:border-box}`;
document.head.appendChild(st);
let altDown=false; window.addEventListener("keydown",e=>{ if(e.key==="Alt") altDown=true; }); window.addEventListener("keyup",e=>{ if(e.key==="Alt") altDown=false; });
const clear=()=>{ ov.querySelectorAll(".gl,.gm").forEach(n=>n.remove()); };

A.hooks.drag.push(function(c,d,e){
  if(d.k!=="move"||!cfg.on||altDown||e.altKey){ clear(); return; }
  const b=d.b, sw=b.sw, sh=b.sh, thr=8, mg=cfg.margin;
  const tx=[mg*sw,sw/2,(1-mg)*sw,sw/3,sw*2/3,0,sw], ty=[mg*sh,sh/2,(1-mg)*sh,sh/3,sh*2/3,0,sh];
  const sel=getClip(); const others=[];
  for(const tr of project.tracks){ if(tr.kind!=="video"||tr.hidden) continue; for(const o of tr.clips){ if(o.id===c.id||!o.pip||o.off) continue; if(currentTime<o.start||currentTime>=o.start+o.duration) continue;
    const ow=(o.scale||1)*((o.mask&&o.mask.w)||1)*sw, oh=(o.scale||1)*((o.mask&&o.mask.h)||1)*sw/A.ar(o), ox=(o.x??.5)*sw, oy=(o.y??.5)*sh;
    tx.push(ox-ow/2,ox,ox+ow/2); ty.push(oy-oh/2,oy,oy+oh/2); } }
  const hw=b.w/2, hh=b.h/2, cx=(c.x??.5)*sw, cy=(c.y??.5)*sh;
  const fit=(pos,half,targets)=>{ let best=null; for(const t of targets){ for(const off of [-half,0,half]){ const dlt=t-(pos+off); if(Math.abs(dlt)<=thr&&(!best||Math.abs(dlt)<Math.abs(best.d))) best={d:dlt,line:t}; } } return best; };
  const bx=fit(cx,hw,tx), by=fit(cy,hh,ty);
  if(bx) c.x=(cx+bx.d)/sw; if(by) c.y=(cy+by.d)/sh;
  clear();
  const line=(css)=>{ const n=document.createElement("div"); n.className="gl"; n.style.cssText=css; ov.appendChild(n); };
  if(bx) line(`left:${bx.line}px;top:0;width:1px;height:100%`); if(by) line(`left:0;top:${by.line}px;width:100%;height:1px`);
  const m=document.createElement("div"); m.className="gm"; m.style.cssText=`left:${mg*sw}px;top:${mg*sh}px;right:${mg*sw}px;bottom:${mg*sh}px`; ov.appendChild(m);
});
A.hooks.drop.push(clear);

/* panel controls */
A.panels.push(function(ex,f){
  const w=document.createElement("div"); w.className="pp-row"; w.style.flexWrap="wrap";
  w.innerHTML=`<label style="font-size:12px;display:flex;gap:6px;align-items:center"><input type="checkbox" id="ppSnap"${cfg.on?" checked":""}> Snap to guides</label>
   <label style="font-size:11px;color:#8b94a8;flex:1.4">Safe margin <span id="ppMgV">${Math.round(cfg.margin*100)}%</span><input type="range" id="ppMg" min="0" max="15" value="${Math.round(cfg.margin*100)}"></label>`;
  ex.appendChild(w);
  w.querySelector("#ppSnap").onchange=e=>{ cfg.on=e.target.checked; save(); };
  w.querySelector("#ppMg").oninput=e=>{ cfg.margin=e.target.value/100; w.querySelector("#ppMgV").textContent=e.target.value+"%"; save(); };
});

/* arrow-key nudge: only when the last thing you touched was the preview handles */
let focusPrev=false;
document.addEventListener("pointerdown",e=>{ focusPrev=!!(e.target.closest&&e.target.closest("#ppOv")); },true);
document.addEventListener("keydown",e=>{
  if(!focusPrev||e.ctrlKey||e.metaKey) return;
  const k=e.key; if(!/^Arrow(Left|Right|Up|Down)$/.test(k)) return;
  if(/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||"")) return;
  const f=getClip(); if(!f||!f.clip.pip) return;
  e.preventDefault(); e.stopImmediatePropagation();
  const step=e.shiftKey?.05:e.altKey?.002:.01, c=f.clip;
  A.edit("Nudge PiP",()=>{ if(k==="ArrowLeft") c.x=(c.x??.5)-step; if(k==="ArrowRight") c.x=(c.x??.5)+step; if(k==="ArrowUp") c.y=(c.y??.5)-step; if(k==="ArrowDown") c.y=(c.y??.5)+step; });
  const set=(id,v)=>{ const el=$(id); if(el){ el.value=v; const l=$(id+"V"); if(l) l.textContent=v+"%"; } };
  set("ppX",Math.round(c.x*100)); set("ppY",Math.round(c.y*100)); try{ A.refreshOverlay(); }catch(_){}
},true);
try{ window.AMIYO_EDITOR_BUILD="pip-step77-snap"; }catch(_){}
})();

;
/* ==================== Script 561 id="amiyo-pip-s78" ==================== */
/* PiP Studio — Step 78: entrance and exit animations, compiled into the editor's own keyframes so preview and export both play them. */
(function(){
"use strict";
const A=window.AMIYO_PIP; if(!A||A.anim) return;
const B=(p)=>{ const c1=1.70158,c3=c1+1; return 1+c3*Math.pow(p-1,3)+c1*Math.pow(p-1,2); };
const EASE={smooth:p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2,out:p=>1-Math.pow(1-p,3),inn:p=>p*p*p,linear:p=>p,
  bounce:p=>{ const n=7.5625,d=2.75; if(p<1/d) return n*p*p; if(p<2/d) return n*(p-=1.5/d)*p+.75; if(p<2.5/d) return n*(p-=2.25/d)*p+.9375; return n*(p-=2.625/d)*p+.984375; }};
/* each preset: state of the clip at the hidden end (p=0), relative to its resting state */
const PRE={none:null,
  fade:{o:0},pop:{s:.001,o:0,ease:B},zoom:{s:.35,o:0},grow:{s:.001},
  left:{dx:-.7},right:{dx:.7},up:{dy:-.7},down:{dy:.7},
  spin:{r:-360,s:.05,o:0},drop:{dy:-.6,ease:EASE.bounce},flip:{r:90,s:.4,o:0}};
const NAMES={none:"None",fade:"Fade",pop:"Pop",zoom:"Zoom in",grow:"Grow",left:"Slide from left",right:"Slide from right",up:"Slide from top",down:"Slide from bottom",spin:"Spin in",drop:"Drop bounce",flip:"Tilt in"};
A.ANIMS=NAMES;
function state(base,pre,p,easeFn,out){
  const e=(pre.ease||easeFn)(p), k=out?e:1-e;      /* k: 1 = fully hidden state, 0 = resting */
  const hid=(out?1-0:1)*0; /* unused */
  const s=pre.s!=null?pre.s:1, o=pre.o!=null?pre.o:1;
  return {x:base.x+(pre.dx||0)*k, y:base.y+(pre.dy||0)*k, scale:base.scale*(1+(s-1)*k), opacity:base.opacity*(1+(o-1)*k), rotation:base.rotation+(pre.r||0)*k};
}
function bake(c){
  const p=c.pip; if(!p) return;
  const own=(c.keyframes||[]).filter(k=>!k.pipAnim); if(own.length) return;
  const an=p.anim||{}, dur=c.duration, N=10;
  const base={x:c.x??.5,y:c.y??.5,scale:c.scale||1,opacity:c.opacity??1,rotation:c.rotation||0};
  const ef=EASE[an.ease||"smooth"]||EASE.smooth, keys=[];
  const inP=PRE[an.in||"none"], outP=PRE[an.out||"none"];
  let di=inP?Math.min(an.inDur||.6,dur*.45):0, dout=outP?Math.min(an.outDur||.6,dur*.45):0;
  if(inP) for(let i=0;i<=N;i++){ const q=i/N; keys.push(Object.assign({t:+(q*di).toFixed(4),pipAnim:true},state(base,inP,q,ef,false))); }
  if(outP){ if(!inP) keys.push(Object.assign({t:0,pipAnim:true},state(base,{},0,ef,false)));
    for(let i=0;i<=N;i++){ const q=i/N; keys.push(Object.assign({t:+(dur-dout+q*dout).toFixed(4),pipAnim:true},state(base,outP,q,ef,true))); } }
  /* a hold key keeps the resting pose steady between entrance and exit */
  if(inP&&outP) keys.push(Object.assign({t:+(dur-dout).toFixed(4),pipAnim:true},state(base,{},0,ef,false)));
  keys.sort((a,b)=>a.t-b.t);
  /* de-duplicate equal times (keep the later one) */
  const out=[]; keys.forEach(k=>{ if(out.length&&Math.abs(out[out.length-1].t-k.t)<1e-4) out[out.length-1]=k; else out.push(k); });
  c.keyframes=out; p.sig=[base.x,base.y,base.scale,base.opacity,base.rotation,dur,an.in,an.out,an.inDur,an.outDur,an.ease].join("|");
}
A.bake=bake;
const sigOf=c=>{ const an=c.pip.anim||{}; return [c.x??.5,c.y??.5,c.scale||1,c.opacity??1,c.rotation||0,c.duration,an.in,an.out,an.inDur,an.outDur,an.ease].join("|"); };
/* keep keyframes in step with the resting pose, duration and settings before every frame is drawn */
const rp=window.renderPreviewFrame;
window.renderPreviewFrame=function(){
  try{ for(const t of project.tracks) if(t.kind==="video") for(const c of t.clips){ const an=c.pip&&c.pip.anim; if(!an||(!an.in&&!an.out&&!(c.keyframes||[]).some(k=>k.pipAnim))) continue;
    /* while keyframes exist the resting pose lives in x/y/scale — read them from the pose snapshot if keys are active */
    if(c.pip.sig!==sigOf(c)) bake(c); } }catch(e){ window.__swl&&window.__swl(e); }
  return rp.apply(this,arguments);
};
A.setAnim=function(c,patch){ c.pip.anim=Object.assign({in:"none",out:"none",inDur:.6,outDur:.6,ease:"smooth"},c.pip.anim||{},patch); c.pip.sig=null; bake(c); };

A.panels.push(function(ex,f){
  const c=f.clip, an=Object.assign({in:"none",out:"none",inDur:.6,outDur:.6,ease:"smooth"},c.pip.anim||{});
  const manual=(c.keyframes||[]).some(k=>!k.pipAnim);
  const opts=sel=>Object.keys(NAMES).map(k=>`<option value="${k}"${sel===k?" selected":""}>${NAMES[k]}</option>`).join("");
  const w=document.createElement("div");
  w.innerHTML=`<label class="field" style="margin-top:8px">Animation</label>
   ${manual?`<div class="pp-note">This clip has hand-made keyframes, so presets are paused. Clear its keyframes to use them.</div>`:""}
   <div class="fieldrow"><div><label class="field">In</label><select id="ppAnIn"${manual?" disabled":""}>${opts(an.in)}</select></div><div><label class="field">Out</label><select id="ppAnOut"${manual?" disabled":""}>${opts(an.out)}</select></div></div>
   <div class="fieldrow"><div><label class="field">In length <span id="ppInDV">${an.inDur.toFixed(1)}s</span></label><input id="ppInD" type="range" min="2" max="30" value="${Math.round(an.inDur*10)}"></div>
   <div><label class="field">Out length <span id="ppOutDV">${an.outDur.toFixed(1)}s</span></label><input id="ppOutD" type="range" min="2" max="30" value="${Math.round(an.outDur*10)}"></div></div>
   <div class="fieldrow"><div><label class="field">Easing</label><select id="ppEase"><option value="smooth">Smooth</option><option value="out">Ease out</option><option value="inn">Ease in</option><option value="bounce">Bounce</option><option value="linear">Linear</option></select></div>
   <div><label class="field">&nbsp;</label><button class="pp-btn pri" id="ppAnPlay" style="width:100%">▶ Preview</button></div></div>`;
  ex.appendChild(w); w.querySelector("#ppEase").value=an.ease;
  const set=(patch,label)=>A.edit(label||"PiP animation",()=>A.setAnim(c,patch));
  w.querySelector("#ppAnIn").onchange=e=>set({in:e.target.value});
  w.querySelector("#ppAnOut").onchange=e=>set({out:e.target.value});
  w.querySelector("#ppEase").onchange=e=>set({ease:e.target.value});
  w.querySelector("#ppInD").oninput=e=>{ w.querySelector("#ppInDV").textContent=(e.target.value/10).toFixed(1)+"s"; set({inDur:e.target.value/10}); };
  w.querySelector("#ppOutD").oninput=e=>{ w.querySelector("#ppOutDV").textContent=(e.target.value/10).toFixed(1)+"s"; set({outDur:e.target.value/10}); };
  w.querySelector("#ppAnPlay").onclick=()=>{ try{ seekTo(Math.max(0,c.start-.2)); }catch(_){ currentTime=Math.max(0,c.start-.2); } const pb=document.getElementById("playBtn"); if(pb&&!isPlaying) pb.click(); };
});
try{ window.AMIYO_EDITOR_BUILD="pip-step78-animations"; }catch(_){}
})();

;
/* ==================== Script 562 id="amiyo-pip-s79" ==================== */
/* PiP Studio — Step 79: move paths. At a chosen time the PiP glides to a new spot / size / angle with easing. Works together with the entrance/exit animations. */
(function(){
"use strict";
const A=window.AMIYO_PIP; if(!A||!A.bake||A.moves) return;
const EASE={smooth:p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2,out:p=>1-Math.pow(1-p,3),inn:p=>p*p*p,linear:p=>p,
  back:p=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(p-1,3)+c1*Math.pow(p-1,2);},
  bounce:p=>{ const n=7.5625,d=2.75; if(p<1/d) return n*p*p; if(p<2/d) return n*(p-=1.5/d)*p+.75; if(p<2.5/d) return n*(p-=2.25/d)*p+.9375; return n*(p-=2.625/d)*p+.984375; }};
const PRE={fade:{o:0},pop:{s:.001,o:0,ease:EASE.back},zoom:{s:.35,o:0},grow:{s:.001},left:{dx:-.7},right:{dx:.7},up:{dy:-.7},down:{dy:.7},spin:{r:-360,s:.05,o:0},drop:{dy:-.6,ease:EASE.bounce},flip:{r:90,s:.4,o:0}};
A.moves=true;
const lerp=(a,b,p)=>a+(b-a)*p;
function bake2(c){
  const p=c.pip; if(!p) return;
  if((c.keyframes||[]).some(k=>!k.pipAnim)) return;
  const mv=(p.moves||[]).slice().sort((a,b)=>a.t-b.t), an=p.anim||{}, dur=c.duration;
  const inP=PRE[an.in], outP=PRE[an.out];
  const di=inP?Math.min(an.inDur||.6,dur*.45):0, dout=outP?Math.min(an.outDur||.6,dur*.45):0;
  const base={x:c.x??.5,y:c.y??.5,scale:c.scale||1,opacity:c.opacity??1,rotation:c.rotation||0};
  const mw=(c.mask&&c.mask.w)||1, ef=EASE[an.ease||"smooth"]||EASE.smooth;
  /* pose from move waypoints at time t */
  const segs=[]; let prev=Object.assign({},base);
  for(const m of mv){ const to={x:m.x??prev.x,y:m.y??prev.y,scale:m.size!=null?m.size/mw:prev.scale,opacity:prev.opacity,rotation:m.rot!=null?m.rot:prev.rotation};
    segs.push({t0:m.t,t1:Math.min(dur,m.t+Math.max(.05,m.dur||1)),from:prev,to,e:EASE[m.ease||"smooth"]||EASE.smooth}); prev=to; }
  const pose=t=>{ let cur=base; for(const s of segs){ if(t<s.t0) return cur; if(t<s.t1){ const q=s.e((t-s.t0)/(s.t1-s.t0)); const f=s.from,o=s.to; return {x:lerp(f.x,o.x,q),y:lerp(f.y,o.y,q),scale:lerp(f.scale,o.scale,q),opacity:f.opacity,rotation:lerp(f.rotation,o.rotation,q)}; } cur=s.to; } return cur; };
  const times=new Set([0,+dur.toFixed(4)]);
  const N=10; segs.forEach(s=>{ for(let i=0;i<=N;i++) times.add(+(s.t0+(s.t1-s.t0)*i/N).toFixed(4)); });
  if(inP) for(let i=0;i<=N;i++) times.add(+(di*i/N).toFixed(4));
  if(outP) for(let i=0;i<=N;i++) times.add(+(dur-dout+dout*i/N).toFixed(4));
  const keys=[...times].filter(t=>t>=0&&t<=dur).sort((a,b)=>a-b).map(t=>{
    let s=pose(t); s={x:s.x,y:s.y,scale:s.scale,opacity:s.opacity,rotation:s.rotation};
    const mod=(pre,k)=>{ const sc=pre.s!=null?pre.s:1, o=pre.o!=null?pre.o:1; s.x+=(pre.dx||0)*k; s.y+=(pre.dy||0)*k; s.scale*=1+(sc-1)*k; s.opacity*=1+(o-1)*k; s.rotation+=(pre.r||0)*k; };
    if(inP&&t<di){ const q=t/di, e=(inP.ease||ef)(q); mod(inP,1-e); }
    if(outP&&t>dur-dout){ const q=(t-(dur-dout))/dout, e=(outP.ease||ef)(q); mod(outP,e); }
    return Object.assign({t,pipAnim:true},s); });
  c.keyframes=(segs.length||inP||outP)?keys:[];
  p.sig=[base.x,base.y,base.scale,base.opacity,base.rotation,dur,an.in,an.out,an.inDur,an.outDur,an.ease].join("|");   /* tells step 78 nothing is stale */
  p.sig2=sig2(c);
}
const sig2=c=>{ const p=c.pip, an=p.anim||{}; return [c.x??.5,c.y??.5,c.scale||1,c.opacity??1,c.rotation||0,c.duration,an.in,an.out,an.inDur,an.outDur,an.ease,JSON.stringify(p.moves||[])].join("|"); };
A.bake=bake2;
const rp=window.renderPreviewFrame;
window.renderPreviewFrame=function(){
  try{ for(const t of project.tracks) if(t.kind==="video") for(const c of t.clips){ const p=c.pip; if(!p) continue;
    const active=(p.moves&&p.moves.length)||(p.anim&&(p.anim.in!=="none"&&p.anim.in||p.anim.out!=="none"&&p.anim.out));
    if(!active&&!(c.keyframes||[]).some(k=>k.pipAnim)) continue;
    if(p.sig2!==sig2(c)) bake2(c); } }catch(e){ window.__swl&&window.__swl(e); }
  return rp.apply(this,arguments);
};
A.addMove=function(c,m){ c.pip.moves=(c.pip.moves||[]).concat([Object.assign({t:0,dur:1,ease:"smooth"},m)]); c.pip.sig2=null; };
A.panels.push(function(ex,f){
  const c=f.clip, mv=c.pip.moves||[], local=Math.max(0,Math.min(c.duration-.2,(typeof currentTime==="number"?currentTime:c.start)-c.start));
  const w=document.createElement("div");
  const spots=[[.15,.18],[.5,.18],[.85,.18],[.15,.5],[.5,.5],[.85,.5],[.15,.82],[.5,.82],[.85,.82]];
  w.innerHTML=`<label class="field" style="margin-top:8px">Move path <span class="pp-note" style="margin-left:6px">glide to a spot at the playhead</span></label>
   <div class="fieldrow"><div><label class="field">Starts at <span id="ppMtV">${local.toFixed(1)}s</span></label><input id="ppMt" type="range" min="0" max="${Math.max(.5,c.duration-.2).toFixed(1)}" step=".1" value="${local.toFixed(1)}"></div>
   <div><label class="field">Takes <span id="ppMdV">1.0s</span></label><input id="ppMd" type="range" min="2" max="40" value="10"></div></div>
   <div class="pp-chips" id="ppMspots">${spots.map((s,i)=>`<button data-sp="${i}" style="width:34px;height:30px" title="Move to this spot">${["↖","↑","↗","←","•","→","↙","↓","↘"][i]}</button>`).join("")}</div>
   <div class="fieldrow"><div><label class="field">Easing</label><select id="ppMe"><option value="smooth">Smooth</option><option value="out">Ease out</option><option value="inn">Ease in</option><option value="back">Overshoot</option><option value="bounce">Bounce</option><option value="linear">Linear</option></select></div>
   <div><label class="field">Size at end <span id="ppMsV">same</span></label><input id="ppMs" type="range" min="0" max="100" value="0"></div></div>
   <div class="pp-list">${mv.map((m,i)=>`<div class="pp-item"><b>${i+1}</b><span>at ${m.t.toFixed(1)}s → ${Math.round((m.x??0)*100)}%, ${Math.round((m.y??0)*100)}%${m.size!=null?" · "+Math.round(m.size*100)+"%":""}</span><small data-rm="${i}" style="cursor:pointer;color:#ff8b8b">✕</small></div>`).join("")}</div>`;
  ex.appendChild(w);
  const q=id=>w.querySelector("#"+id);
  q("ppMt").oninput=e=>{ q("ppMtV").textContent=(+e.target.value).toFixed(1)+"s"; };
  q("ppMd").oninput=e=>{ q("ppMdV").textContent=(e.target.value/10).toFixed(1)+"s"; };
  q("ppMs").oninput=e=>{ q("ppMsV").textContent=+e.target.value?e.target.value+"%":"same"; };
  w.onclick=e=>{
    const sp=e.target.closest("[data-sp]"), rm=e.target.closest("[data-rm]");
    if(sp){ const s=spots[+sp.dataset.sp], sz=+q("ppMs").value;
      A.edit("Add PiP move",()=>A.addMove(c,{t:+q("ppMt").value,dur:q("ppMd").value/10,x:s[0],y:s[1],size:sz?sz/100:null,ease:q("ppMe").value}));
      setTimeout(()=>{ try{ renderInspector(); }catch(_){} },50); }
    if(rm){ A.edit("Remove PiP move",()=>{ c.pip.moves.splice(+rm.dataset.rm,1); c.pip.sig2=null; if(!c.pip.moves.length&&!(c.pip.anim&&(c.pip.anim.in!=="none"||c.pip.anim.out!=="none"))) c.keyframes=(c.keyframes||[]).filter(k=>!k.pipAnim); });
      setTimeout(()=>{ try{ renderInspector(); }catch(_){} },50); }
  };
});
try{ window.AMIYO_EDITOR_BUILD="pip-step79-moves"; }catch(_){}
})();

;
/* ==================== Script 563 id="amiyo-pip-s80" ==================== */
/* PiP Studio — Step 80: 11 more shapes, an adjustable corner radius, and shape icons on the chips. */
(function(){
"use strict";
const A=window.AMIYO_PIP; if(!A||A.shapes2||!window.AMIYO_SHAPE_PTS) return; A.shapes2=true;
const P=window.AMIYO_SHAPE_PTS;
const poly=(n,start,r,rot)=>{ const a=[]; for(let i=0;i<n;i++){ const t=start+i*2*Math.PI/n; a.push([.5+r*Math.cos(t),.5+r*Math.sin(t)]); } return a; };
const norm=pts=>{ let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9; pts.forEach(p=>{ x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]); }); return pts.map(p=>[(p[0]-x0)/(x1-x0),(p[1]-y0)/(y1-y0)]); };
const curve=(n,fn)=>{ const a=[]; for(let i=0;i<n;i++) a.push(fn(i/n*Math.PI*2)); return norm(a); };
P.pentagon=poly(5,-Math.PI/2,.5); P.octagon=poly(8,Math.PI/8,.5);
P.plus=[[.33,0],[.67,0],[.67,.33],[1,.33],[1,.67],[.67,.67],[.67,1],[.33,1],[.33,.67],[0,.67],[0,.33],[.33,.33]];
P.parallelogram=[[.22,0],[1,0],[.78,1],[0,1]];
P.arrow=[[0,.3],[.55,.3],[.55,0],[1,.5],[.55,1],[.55,.7],[0,.7]];
P.burst=norm((()=>{ const a=[]; for(let i=0;i<28;i++){ const r=i%2?.38:.5, t=-Math.PI/2+i*Math.PI/14; a.push([.5+r*Math.cos(t),.5+r*Math.sin(t)]); } return a; })());
P.flower=curve(96,t=>{ const r=.36+.14*Math.cos(6*t); return [.5+r*Math.cos(t),.5+r*Math.sin(t)]; });
P.squircle=curve(96,t=>{ const c=Math.cos(t),s=Math.sin(t),k=.25; return [.5+.5*Math.sign(c)*Math.pow(Math.abs(c),k*2),.5+.5*Math.sign(s)*Math.pow(Math.abs(s),k*2)]; });
P.shield=[[.5,0],[.86,.1],[1,.14],[1,.52],[.88,.76],[.5,1],[.12,.76],[0,.52],[0,.14],[.14,.1]];
P.drop=curve(96,t=>[Math.sin(t)*Math.pow(Math.sin(t/2),1.0),-Math.cos(t)]);
P.bubble=[[.1,0],[.9,0],[1,.1],[1,.6],[.9,.7],[.64,.7],[.5,1],[.44,.7],[.1,.7],[0,.6],[0,.1]];
const add=[["pentagon","Pentagon","pentagon",1],["octagon","Octagon","octagon",1],["plus","Plus","plus",1],["arrow","Arrow","arrow",1],["burst","Burst","burst",1],["flower","Flower","flower",1],["squircle","Squircle","squircle",1],["shield","Shield","shield",1],["drop","Drop","drop",1],["bubble","Speech bubble","bubble",0],["parallelogram","Slanted","parallelogram",0],["rrsq","Custom corners ▢","rr:25",1],["rrect","Custom corners ▭","rr:25",0]];
add.forEach(s=>{ if(!A.SHAPES.find(x=>x[0]===s[0])) A.SHAPES.push(s); });

/* rounded rectangle with a settable radius: shape key "rr:<percent>" */
const sp0=window.amiyoShapePath;
window.amiyoShapePath=function(c,shape,cx,cy,w,h){
  if(typeof shape==="string"&&shape.indexOf("rr:")===0){ const r=Math.min(w,h)*Math.max(0,Math.min(.5,parseFloat(shape.slice(3))/100)), x=cx-w/2, y=cy-h/2;
    c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); return; }
  return sp0.apply(this,arguments);
};
const isRR=id=>id==="rrsq"||id==="rrect";
const ss0=A.setShape;
A.setShape=function(c,id,size){ ss0(c,id,size); if(isRR(id)){ const r=c.pip.radius!=null?c.pip.radius:25; c.mask.shape="rr:"+r; c.pip.radius=r; } };

const icon=id=>{ const d=A.def(id), k=d[2]; let inner;
  if(k==="ellipse") inner=`<ellipse cx="9" cy="9" rx="7.5" ry="${d[3]?7.5:5.5}"/>`;
  else if(k==="rect") inner=d[3]?`<rect x="2" y="2" width="14" height="14"/>`:`<rect x="1.5" y="3.5" width="15" height="11"/>`;
  else if(k==="rounded"||String(k).indexOf("rr:")===0) inner=d[3]?`<rect x="2" y="2" width="14" height="14" rx="4"/>`:`<rect x="1.5" y="3.5" width="15" height="11" rx="3.5"/>`;
  else if(P[k]) inner=`<polygon points="${P[k].map(p=>(1.5+p[0]*15).toFixed(1)+","+(1.5+p[1]*15).toFixed(1)).join(" ")}"/>`;
  else inner=`<rect x="2" y="2" width="14" height="14"/>`;
  return `<svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor" style="vertical-align:-3px;margin-right:4px" aria-hidden="true">${inner}</svg>`; };
const st=document.createElement("style"); st.textContent=`#ppShapes{max-height:150px;overflow:auto;padding-right:2px}#ppShapes button{display:inline-flex;align-items:center}`; document.head.appendChild(st);
A.panels.unshift(function(ex,f,g){
  g.querySelectorAll("#ppShapes [data-shape]").forEach(b=>{ if(!b.querySelector("svg")) b.insertAdjacentHTML("afterbegin",icon(b.dataset.shape)); });
  const c=f.clip, w=document.createElement("div"), r=c.pip.radius!=null?c.pip.radius:25;
  w.innerHTML=`<label class="field">Corner radius <span id="ppRadV">${r}%</span></label><input id="ppRad" type="range" min="0" max="50" value="${r}">`;
  ex.appendChild(w);
  w.querySelector("#ppRad").oninput=e=>{ const v=+e.target.value; w.querySelector("#ppRadV").textContent=v+"%";
    A.edit("PiP corner radius",()=>{ const sq=!!A.def(c.pip.shape)[3]; if(!isRR(c.pip.shape)){ A.setShape(c,sq?"rrsq":"rrect",A.size(c)); } c.pip.radius=v; c.mask.shape="rr:"+v; });
    g.querySelectorAll("[data-shape]").forEach(x=>x.classList.toggle("on",x.dataset.shape===c.pip.shape)); };
});
try{ window.AMIYO_EDITOR_BUILD="pip-step80-shapes"; }catch(_){}
})();

;
/* ==================== Script 564 id="amiyo-pip-s81" ==================== */
/* PiP Studio — Step 81: one-click layouts for the main video and every attached PiP. */
(function(){
"use strict";
const A=window.AMIYO_PIP; if(!A||A.layouts) return;
const CELLS={
  grid:(n)=>{ const k=n+1,cols=Math.ceil(Math.sqrt(k)),rows=Math.ceil(k/cols),a=[]; for(let i=0;i<k;i++){ const r=Math.floor(i/cols),c=i%cols; a.push({x:(c+.5)/cols,y:(r+.5)/rows,w:1/cols,h:1/rows}); } return {main:a[0],pips:a.slice(1),rect:1}; },
  side:(n)=>{ const k=n+1,a=[]; for(let i=0;i<k;i++) a.push({x:(i+.5)/k,y:.5,w:1/k,h:1}); return {main:a[0],pips:a.slice(1),rect:1}; },
  stack:(n)=>{ const k=n+1,a=[]; for(let i=0;i<k;i++) a.push({x:.5,y:(i+.5)/k,w:1,h:1/k}); return {main:a[0],pips:a.slice(1),rect:1}; },
  spot:(n)=>{ const a=[]; for(let i=0;i<n;i++) a.push({x:.83,y:(i+.5)/n,w:.34,h:1/n}); return {main:{x:.33,y:.5,w:.66,h:1},pips:a,rect:1}; },
  row:(n)=>{ const w=Math.min(.24,.92/n),a=[]; for(let i=0;i<n;i++) a.push({x:.5+(i-(n-1)/2)*(w+.02),y:.84,w:w,h:.28}); return {main:null,pips:a,rect:0}; },
  col:(n)=>{ const h=Math.min(.28,.9/n),a=[]; for(let i=0;i<n;i++) a.push({x:.88,y:.5+(i-(n-1)/2)*(h+.02),w:.22,h:h}); return {main:null,pips:a,rect:0}; },
  corner:(n)=>{ const s=[[.84,.2],[.84,.8],[.16,.8],[.16,.2],[.5,.5]],a=[]; for(let i=0;i<n;i++){ const p=s[i%s.length]; a.push({x:p[0],y:p[1],w:.26,h:.26}); } return {main:null,pips:a,rect:0}; }
};
const NAMES=[["corner","Corners"],["row","Row"],["col","Column"],["grid","Grid"],["side","Side by side"],["stack","Stacked"],["spot","Spotlight"]];
A.applyLayout=function(mainId,name){
  const m=A.find(mainId); if(!m||!CELLS[name]) return false;
  const pips=A.pipsOf(mainId); if(!pips.length){ toast("Attach a video first"); return false; }
  const W=project.settings.width||1280,H=project.settings.height||720,CA=W/H, L=CELLS[name](pips.length), before=deepClone(serializableProject());
  const mc=m.clip, ma=getAsset(mc.assetId), mar=ma&&ma.width&&ma.height?ma.width/ma.height:16/9;
  if(!mc.layoutBackup&&L.main) mc.layoutBackup={x:mc.x??.5,y:mc.y??.5,scale:mc.scale||1};
  if(L.main){ const c=L.main; mc.scale=Math.min(c.w,c.h*mar/CA); mc.x=c.x; mc.y=c.y; }
  else if(mc.layoutBackup){ mc.x=mc.layoutBackup.x; mc.y=mc.layoutBackup.y; mc.scale=mc.layoutBackup.scale; mc.layoutBackup=null; }
  pips.forEach((p,i)=>{ const c=p.clip, cell=L.pips[i], ar=A.ar(c); let size;
    if(L.rect){ A.setShape(c,"rect",.2); size=Math.min(cell.w,cell.h*ar/CA); c.pip.border=0; }
    else { const sq=!!A.def(c.pip.shape)[3]; size=sq?Math.min(cell.w,cell.h*CA):Math.min(cell.w,cell.h*ar/CA); }
    A.setSize(c,size); c.x=cell.x; c.y=cell.y; c.rotation=0; c.pip.sig2=null; c.pip.sig=null; });
  recordHistory("PiP layout: "+name,before,deepClone(serializableProject())); scheduleAutosave(); renderAll(); try{ renderPreviewFrame(); }catch(_){}
  return true;
};
A.resetLayout=function(mainId){ const m=A.find(mainId); if(!m||!m.clip.layoutBackup) return; const b=m.clip.layoutBackup, before=deepClone(serializableProject()); Object.assign(m.clip,{x:b.x,y:b.y,scale:b.scale,layoutBackup:null}); recordHistory("Reset main pose",before,deepClone(serializableProject())); renderAll(); try{ renderPreviewFrame(); }catch(_){} };
function build(mainId){
  const w=document.createElement("div");
  w.innerHTML=`<label class="field" style="margin-top:8px">Layouts <span class="pp-note" style="margin-left:6px">arrange main + all PiPs</span></label><div class="pp-chips">${NAMES.map(n=>`<button data-lay="${n[0]}">${n[1]}</button>`).join("")}<button data-lay="__reset" title="Put the main video back where it was">↺ Main</button></div>`;
  w.onclick=e=>{ const b=e.target.closest("[data-lay]"); if(!b) return; e.stopPropagation(); b.dataset.lay==="__reset"?A.resetLayout(mainId):A.applyLayout(mainId,b.dataset.lay); };
  return w;
}
A.mainPanels.push((g,f)=>{ if(A.pipsOf(f.clip.id).length) g.appendChild(build(f.clip.id)); });
A.panels.push((ex,f)=>{ const m=A.mainOf(f.clip); if(m&&A.pipsOf(m.clip.id).length>1) ex.appendChild(build(m.clip.id)); });
A.layouts=true; try{ window.AMIYO_EDITOR_BUILD="pip-step81-layouts"; }catch(_){}
})();

;
/* ==================== Script 565 id="amiyo-pip-s84" ==================== */
/* PiP Studio - Step 84: border styles (solid, dashed, dotted) and a neon glow for every PiP. Preview and export draw the same border. */
(function(){
"use strict";
const A=window.AMIYO_PIP; if(!A||A.glow) return;
A.panels.push(function(ex,f){
  const c=f.clip, p=c.pip; if(!p) return;
  const w=document.createElement("div"), bs=p.bstyle||"solid", gl=p.glow||0;
  w.innerHTML='<label class="field">Border style</label><div class="pp-chips" id="ppBs">'+[["solid","Solid"],["dashed","Dashed"],["dotted","Dotted"]].map(s=>'<button type="button" data-bs="'+s[0]+'" class="'+(bs===s[0]?"on":"")+'">'+s[1]+'</button>').join("")+'</div>'+
    '<label class="field">Glow <span id="ppGlV">'+gl+'</span></label><input id="ppGl" type="range" min="0" max="40" step="1" value="'+gl+'" aria-label="Glow strength around the PiP">';
  ex.appendChild(w);
  w.querySelector("#ppBs").onclick=e=>{ const b=e.target.closest("[data-bs]"); if(!b) return; e.stopPropagation();
    A.edit("PiP border style",()=>{ p.bstyle=b.dataset.bs; if(!(p.border>0)) p.border=3; });
    w.querySelectorAll("[data-bs]").forEach(x=>x.classList.toggle("on",x===b)); };
  w.querySelector("#ppGl").oninput=e=>{ const v=+e.target.value; w.querySelector("#ppGlV").textContent=v; A.edit("PiP glow",()=>{ p.glow=v; }); };
});
A.glow=true; try{ window.AMIYO_EDITOR_BUILD="pip-step84-glow"; }catch(_){}
})();

;
/* ==================== Script 566 id="amiyo-tracker-s86" ==================== */
/* Step 86 - Motion tracker. Pick a point on the main video (a face, a ball, a logo), and a PiP or any video clip follows it.
   It compares small patches of grey pixels from frame to frame (no AI, no network), then writes ordinary position keyframes on the follower. */
(function(){
"use strict";
if(window.amiyoTrackMotion) return;
const clampN=(v,a,b)=>Math.min(b,Math.max(a,v));
const esc2=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function vclips(){ const o=[]; for(const t of project.tracks){ if(t.kind!=="video") continue; for(const c of t.clips){ const a=c.assetId&&project.assets[c.assetId]; if(a&&(a.type==="video")&&!c.off) o.push({t,c,a}); } } return o; }
function tclips(){ const o=[]; for(const t of project.tracks){ if(t.kind!=="text"&&t.kind!=="caption") continue; for(const c of t.clips){ if(!c.off&&c.text!=null) o.push({t,c,a:null}); } } return o; }
function nameOf(x){ if(!x.a){ const s=String(x.c.text||"").replace(/\s+/g," ").trim(); return "Text: "+(s.length>22?s.slice(0,22)+"…":(s||"(empty)"))+" · "+x.c.start.toFixed(1)+"s"; } return (x.a.name||"Video")+" · "+x.c.start.toFixed(1)+"s"+(x.c.pip?" (PiP)":""); }
async function grab(m,tAbs,w){
  const el=await window.ensureTrackVideo(m.t.id,m.c); if(!el) throw new Error("The main video is not available");
  const local=tAbs-m.c.start, seek=window.__amiyoComputeSeek?window.__amiyoComputeSeek(m.c,local):(m.c.inPoint||0)+local*(m.c.speed||1);
  if(Number.isFinite(el.duration)&&Math.abs(el.currentTime-seek)>.02){ el.currentTime=clampN(seek,0,el.duration||seek); await amiyoSeeked(el); }
  const iw=el.videoWidth||640, ih=el.videoHeight||360, h=Math.max(8,Math.round(w*ih/iw));
  const cv=document.createElement("canvas"); cv.width=w; cv.height=h; const g=cv.getContext("2d",{willReadFrequently:true}); g.drawImage(el,0,0,w,h);
  return {cv,g,w,h};
}
function gray(fr){ const d=fr.g.getImageData(0,0,fr.w,fr.h).data, o=new Float32Array(fr.w*fr.h); for(let i=0,j=0;j<o.length;i+=4,j++) o[j]=.299*d[i]+.587*d[i+1]+.114*d[i+2]; return o; }
/* sum of absolute differences between the template and the frame patch whose centre is (cx,cy) */
function sad(G,w,h,T,ts,cx,cy,best){ const half=ts>>1; let s=0; for(let y=0;y<ts;y++){ const fy=cy-half+y; if(fy<0||fy>=h) return 1e12; const row=fy*w, tr=y*ts; for(let x=0;x<ts;x++){ const fx=cx-half+x; if(fx<0||fx>=w) return 1e12; s+=Math.abs(G[row+fx]-T[tr+x]); } if(s>=best) return s; } return s; }
function patch(G,w,h,cx,cy,ts){ const half=ts>>1, T=new Float32Array(ts*ts); for(let y=0;y<ts;y++) for(let x=0;x<ts;x++){ const fx=clampN(cx-half+x,0,w-1), fy=clampN(cy-half+y,0,h-1); T[y*ts+x]=G[fy*w+fx]; } return T; }
function mainToCanvas(m,u,v){
  const W=project.settings.width||1280, H=project.settings.height||720, c=m.c, a=m.a, iw=a.width||W, ih=a.height||H;
  const ks=c.scale||1, kx=c.x??.5, ky=c.y??.5; let dw=W*ks, dh=dw*(ih/iw); if(c.fit==="cover"){ dh=H*ks; dw=dh*(iw/ih); }
  return {x:kx+(u-.5)*dw/W, y:ky+(v-.5)*dh/H};
}
/* opts: {main:{t,c,a}, target:{t,c}, u,v (0..1 on the main video at the start time), keepOffset, fps, onProgress} */
window.amiyoTrackMotion=async function(o){
  const m=o.main, tg=o.target.c;
  const t0=Math.max(tg.start,m.c.start), t1=Math.min(tg.start+tg.duration,m.c.start+m.c.duration);
  if(t1-t0<.2) throw new Error("The follower and the main video do not overlap in time");
  const fps=o.fps||15, W=320, TS=24, R=22;
  let fr=await grab(m,t0,W), G=gray(fr);
  let cx=Math.round(o.u*fr.w), cy=Math.round(o.v*fr.h), px=cx, py=cy, vx=0, vy=0;
  let T=patch(G,fr.w,fr.h,cx,cy,TS); const T0=T.slice();
  const pts=[{t:t0,x:o.u*fr.w,y:o.v*fr.h}];
  const n=Math.max(1,Math.ceil((t1-t0)*fps)); let lost=0;
  for(let i=1;i<=n;i++){
    if(o.cancel&&o.cancel()) throw new Error("Cancelled");
    const t=Math.min(t1,t0+i/fps); fr=await grab(m,t,W); G=gray(fr);
    const pcx=Math.round(clampN(px+vx,0,fr.w-1)), pcy=Math.round(clampN(py+vy,0,fr.h-1));
    let best=1e12, bx=pcx, by=pcy;
    for(let dy=-R;dy<=R;dy++) for(let dx=-R;dx<=R;dx++){ const s=sad(G,fr.w,fr.h,T,TS,pcx+dx,pcy+dy,best); if(s<best){ best=s; bx=pcx+dx; by=pcy+dy; } }
    /* sub-pixel refinement by a parabola through the neighbours */
    let fx=bx, fy=by; const sa=(x,y)=>sad(G,fr.w,fr.h,T,TS,x,y,1e12), c0=best, l=sa(bx-1,by), r=sa(bx+1,by), u2=sa(bx,by-1), d2=sa(bx,by+1);
    const dnx=l-2*c0+r, dny=u2-2*c0+d2; if(dnx>0&&l<1e11&&r<1e11) fx+=clampN((l-r)/(2*dnx),-.5,.5); if(dny>0&&u2<1e11&&d2<1e11) fy+=clampN((u2-d2)/(2*dny),-.5,.5);
    const dev=best/(TS*TS); if(dev>38) lost++; else lost=Math.max(0,lost-1);
    vx=(bx-px)*.7+vx*.3; vy=(by-py)*.7+vy*.3; px=bx; py=by;
    pts.push({t,x:fx,y:fy});
    /* let the template follow slow changes in the object, but keep half of the original so it cannot wander off */
    const nt=patch(G,fr.w,fr.h,bx,by,TS); for(let k=0;k<T.length;k++) T[k]=.5*T0[k]+.5*(.7*T[k]+.3*nt[k]);
    if(o.onProgress) o.onProgress(i/n);
  }
  const p0=mainToCanvas(m,pts[0].x/fr.w,pts[0].y/fr.h);
  const dx=o.keepOffset===false?0:((tg.x??.5)-p0.x), dy=o.keepOffset===false?0:((tg.y??.5)-p0.y);
  const keys=pts.map(p=>{ const q=mainToCanvas(m,p.x/fr.w,p.y/fr.h); return {t:+(p.t-tg.start).toFixed(4),x:clampN(q.x+dx,-.5,1.5),y:clampN(q.y+dy,-.5,1.5),scale:tg.scale||1,opacity:tg.opacity??1,rotation:tg.rotation||0,tracked:true}; });
  return {keys,lost,samples:pts.length};
};
function applyKeys(tg,keys){
  const before=deepClone(serializableProject());
  tg.keyframes=keys; if(tg.pip){ tg.pip.moves=[]; tg.pip.sig2=null; }
  recordHistory("Motion tracking",before,serializableProject()); scheduleAutosave(); renderAll(); try{ renderPreviewFrame(); }catch(_){}
}
let busy=false;
function openTracker(){
  const vs=vclips(), ts=tclips(), all=vs.concat(ts); if(!vs.length||all.length<2){ openModal("Motion tracker",'<div class="mempty"><b>Need two video clips</b>Put a main video and a second clip (a PiP, a text title or a caption) on the timeline. The second clip will follow a point on the main video.</div>'); return; }
  let selId=null; try{ selId=selectedClipId; }catch(_){}
  const selC=all.find(x=>x.c.id===selId);
  let main=null, tgt=null;
  if(selC&&(selC.c.pip||!selC.a)){ tgt=selC; main=selC.c.pip?(vs.find(x=>x.c.id===selC.c.pip.main)||null):null; }
  if(!main) main=(selC&&selC.a&&!selC.c.pip)?selC:vs.find(x=>!x.c.pip)||vs[0];
  if(!tgt) tgt=vs.find(x=>x!==main&&x.c.pip&&x.c.pip.main===main.c.id)||ts[0]||vs.find(x=>x!==main);
  const st={main,tgt,u:null,v:null,cancel:false};
  const opt=(arr,sel)=>arr.map(x=>'<option value="'+x.c.id+'"'+(x.c.id===sel.c.id?" selected":"")+'>'+esc2(nameOf(x))+'</option>').join("");
  openModal("Motion tracker",
    '<p class="mstat">Tap the spot on the main video that the other clip should follow, then press Track.</p>'+
    '<label class="field">Main video (what moves)</label><select id="trMain">'+opt(vs,main)+'</select>'+
    '<label class="field">Follower (sticks to the point)</label><select id="trTgt">'+opt(all,tgt)+'</select>'+
    '<div style="position:relative;margin:8px 0"><canvas id="trCv" style="width:100%;border-radius:8px;background:#000;touch-action:none;cursor:crosshair;display:block" aria-label="Frame of the main video. Tap to choose the point to track."></canvas><div id="trDot" style="position:absolute;width:22px;height:22px;margin:-11px 0 0 -11px;border:2px solid #ff7a3d;border-radius:50%;box-shadow:0 0 0 2px #000a;display:none;pointer-events:none"></div></div>'+
    '<label style="display:flex;gap:8px;align-items:center;font-size:12px;margin:4px 0"><input type="checkbox" id="trOff" checked> Keep the follower where it is now (it moves with the point, not onto it)</label>'+
    '<div id="trMsg" role="status" aria-live="polite" class="pipmuted" style="min-height:18px;margin:6px 0">Tap the frame to choose a point.</div>'+
    '<div class="mdetail-actions"><button type="button" class="chip pri" id="trGo" disabled>Track</button><button type="button" class="chip" id="trCancel">Cancel</button></div>');
  const mb=document.getElementById("modalBody"), $=s=>mb.querySelector(s), cv=$("#trCv"), msg=t=>{ $("#trMsg").textContent=t; };
  async function showFrame(){
    st.u=st.v=null; $("#trDot").style.display="none"; $("#trGo").disabled=true; msg("Loading the frame…");
    try{ const t0=Math.max(st.tgt.c.start,st.main.c.start); const fr=await grab(st.main,t0,480); cv.width=fr.w; cv.height=fr.h; cv.getContext("2d").drawImage(fr.cv,0,0); msg("Tap the frame to choose a point (frame at "+t0.toFixed(1)+"s)."); }
    catch(e){ msg("Could not load the frame: "+(e&&e.message||e)); }
  }
  $("#trMain").onchange=e=>{ st.main=vs.find(x=>x.c.id===e.target.value)||st.main; showFrame(); };
  $("#trTgt").onchange=e=>{ st.tgt=all.find(x=>x.c.id===e.target.value)||st.tgt; showFrame(); };
  cv.onpointerdown=e=>{ const r=cv.getBoundingClientRect(); if(!r.width) return; st.u=clampN((e.clientX-r.left)/r.width,0,1); st.v=clampN((e.clientY-r.top)/r.height,0,1);
    const d=$("#trDot"); d.style.display="block"; d.style.left=(st.u*100)+"%"; d.style.top=(st.v*100)+"%"; $("#trGo").disabled=busy||st.main===st.tgt; msg(st.main===st.tgt?"Choose a different clip as the follower.":"Point chosen. Press Track."); };
  $("#trCancel").onclick=()=>{ st.cancel=true; closeModal(); };
  $("#trGo").onclick=async()=>{
    if(busy||st.u==null) return; busy=true; st.cancel=false; $("#trGo").disabled=true; msg("Tracking… 0%");
    try{
      const r=await window.amiyoTrackMotion({main:st.main,target:st.tgt,u:st.u,v:st.v,keepOffset:$("#trOff").checked,cancel:()=>st.cancel,onProgress:p=>msg("Tracking… "+Math.round(p*100)+"%")});
      applyKeys(st.tgt.c,r.keys); closeModal(); try{ toast("Tracked "+r.samples+" frames"+(r.lost>4?" · the point was hard to follow in places, check the result":""),4200); }catch(_){}
    }catch(e){ msg("Tracking stopped: "+(e&&e.message||e)); }
    finally{ busy=false; const g=$("#trGo"); if(g) g.disabled=false; }
  };
  showFrame();
}
window.amiyoOpenTracker=openTracker;
(function(){ let n=0; const iv=setInterval(()=>{
  const ref=document.getElementById("pipOpenBtn"); if(document.getElementById("trackOpenBtn")){ clearInterval(iv); return; }
  if(ref&&ref.parentNode){ const b=document.createElement("button"); b.className="toolbtn"; b.id="trackOpenBtn"; b.type="button"; b.textContent="◎ Track"; b.title="Make a clip follow a moving point on the main video"; b.onclick=openTracker; ref.parentNode.insertBefore(b,ref.nextSibling); clearInterval(iv); }
  else if(++n>80) clearInterval(iv); },500); })();
try{ window.AMIYO_EDITOR_BUILD="pip-step87-tracker-text"; }catch(_){}
})();

;
/* ==================== Script 567 id="amiyo-pip-s88" ==================== */
/* PiP Studio - Step 88: lower the main video's sound while a PiP that has sound is playing (writes ordinary Volume-line points on the main clip). */
(function(){
"use strict";
const A=window.AMIYO_PIP; if(!A||A.duck) return;
const clampN=(v,a,b)=>Math.min(b,Math.max(a,v));
function spans(main){ const o=[]; for(const p of A.pipsOf(main.clip.id)){ const c=p.clip; if(p.track.muted||!((c.volume??1)>0.01)||c.off) continue; o.push([c.start,c.start+c.duration]); } return o.sort((a,b)=>a[0]-b[0]); }
function duck(main,depth){
  const c=main.clip, sp=spans(main); if(!sp.length) return 0;
  const base=clampN(c.volume??1,0,1), low=base*depth, pad=.3, D=c.duration, pts=[{t:0,v:base},{t:D,v:base}];
  for(const [s,e] of sp){ const ls=s-c.start, le=e-c.start; if(le<0||ls>D) continue;
    pts.push({t:clampN(ls-pad,0,D),v:base},{t:clampN(ls,0,D),v:low},{t:clampN(le,0,D),v:low},{t:clampN(le+pad,0,D),v:base}); }
  pts.sort((a,b)=>a.t-b.t); const m=[]; for(const p of pts){ const l=m[m.length-1]; if(l&&Math.abs(l.t-p.t)<.01) l.v=Math.min(l.v,p.v); else m.push(p); }
  window.transact("Duck main under PiP",()=>{ c.volumeKeyframes=m; }); return sp.length;
}
A.duckMain=duck; A.duckSpans=spans;
A.mainPanels.push(function(g,f){
  if(!A.pipsOf(f.clip.id).length) return;
  const w=document.createElement("div"), n=spans(f).length;
  w.innerHTML='<label class="field">Duck main sound under PiP voices <span id="ppDkV">70%</span></label><input id="ppDk" type="range" min="10" max="90" value="70" aria-label="How much to lower the main sound">'+
    '<div class="pp-row"><button class="pp-btn" id="ppDkGo"'+(n?"":" disabled")+'>Duck main under '+n+' PiP'+(n===1?"":"s")+' with sound</button><button class="pp-btn" id="ppDkClr">Clear</button></div>'+
    (n?"":'<div class="pipmuted">No PiP has sound on. Turn on "Keep its sound" (unmute the PiP track) first.</div>');
  g.appendChild(w);
  w.querySelector("#ppDk").oninput=e=>{ w.querySelector("#ppDkV").textContent=e.target.value+"%"; };
  w.querySelector("#ppDkGo").onclick=e=>{ e.stopPropagation(); const d=1-(+w.querySelector("#ppDk").value)/100; const k=duck(f,d); try{ toast(k?"Main sound ducks under "+k+" PiP"+(k===1?"":"s"):"Nothing to duck"); }catch(_){} };
  w.querySelector("#ppDkClr").onclick=e=>{ e.stopPropagation(); window.transact("Clear ducking",()=>{ f.clip.volumeKeyframes=[]; }); try{ toast("Ducking cleared"); }catch(_){} };
});
A.duck=true; try{ window.AMIYO_EDITOR_BUILD="pip-step88-duck"; }catch(_){}
})();

;
/* ==================== Script 568 id="amiyo-pip-s89" ==================== */
/* PiP Studio - Step 89: fade in / fade out sliders on every PiP (picture and sound fade together using the clip's own fade settings). */
(function(){
"use strict";
const A=window.AMIYO_PIP; if(!A||A.fades) return;
A.panels.push(function(ex,f){
  const c=f.clip, mx=Math.max(.2,+(c.duration/2).toFixed(1)), w=document.createElement("div");
  const row=(id,l,v)=>'<div><label class="field">'+l+' <span id="'+id+'V">'+(+v).toFixed(1)+'s</span></label><input id="'+id+'" type="range" min="0" max="'+mx+'" step="0.1" value="'+Math.min(mx,v||0)+'"></div>';
  w.innerHTML='<div class="fieldrow">'+row("ppFi","Fade in",c.fadeIn||0)+row("ppFo","Fade out",c.fadeOut||0)+'</div>';
  ex.appendChild(w);
  [["ppFi","fadeIn"],["ppFo","fadeOut"]].forEach(([id,k])=>{ w.querySelector("#"+id).oninput=e=>{ const v=+e.target.value; w.querySelector("#"+id+"V").textContent=v.toFixed(1)+"s"; A.edit("PiP "+(k==="fadeIn"?"fade in":"fade out"),()=>{ c[k]=v; }); }; });
});
A.fades=true; try{ window.AMIYO_EDITOR_BUILD="pip-step89-fades"; }catch(_){}
})();

;
/* ==================== Script 569 id="amiyo-pip-s90" ==================== */
/* PiP Studio - Step 90: drop-shadow strength and colour for every PiP. */
(function(){
"use strict";
const A=window.AMIYO_PIP; if(!A||A.shadowCtl) return;
A.panels.push(function(ex,f){
  const c=f.clip, p=c.pip; if(!p) return; const w=document.createElement("div"), v=p.shStr==null?1:p.shStr;
  w.innerHTML='<div class="fieldrow"><div><label class="field">Shadow strength <span id="ppShsV">'+Math.round(v*100)+'%</span></label><input id="ppShs" type="range" min="0" max="400" step="10" value="'+Math.round(v*100)+'"></div><div><label class="field">Shadow colour</label><input id="ppShc" type="color" value="'+(/^#[0-9a-f]{6}$/i.test(p.shColor||"")?p.shColor:"#000000")+'" style="width:100%;height:32px;padding:0"></div></div>';
  ex.appendChild(w);
  w.querySelector("#ppShs").oninput=e=>{ const n=+e.target.value/100; w.querySelector("#ppShsV").textContent=Math.round(n*100)+"%"; A.edit("PiP shadow strength",()=>{ p.shStr=n; if(n>0) p.shadow=true; }); };
  w.querySelector("#ppShc").oninput=e=>A.edit("PiP shadow colour",()=>{ p.shColor=e.target.value; p.shadow=true; });
});
A.shadowCtl=true; try{ window.AMIYO_EDITOR_BUILD="pip-step90-shadow"; }catch(_){}
})();

;
/* ==================== Script 570 id="amiyo-pip-s91" ==================== */
/* PiP Studio - Step 91: save the current arrangement of all PiPs on a main clip as your own preset, and re-apply it later (shapes, sizes, spots, borders). */
(function(){
"use strict";
const A=window.AMIYO_PIP; if(!A||A.presets) return;
const KEY="amiyo-pip-presets-v1";
function load(){ try{ const a=JSON.parse(localStorage.getItem(KEY)||"[]"); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
function save(a){ try{ localStorage.setItem(KEY,JSON.stringify(a.slice(0,24))); return true; }catch(e){ return false; } }
function snap(mainId){ return A.pipsOf(mainId).map(p=>{ const c=p.clip,q=c.pip; return {shape:q.shape,size:A.size(c),x:c.x??.5,y:c.y??.5,rot:c.rotation||0,op:c.opacity??1,border:q.border||0,color:q.color||"#ffffff",shadow:q.shadow!==false,radius:q.radius,bstyle:q.bstyle,glow:q.glow}; }); }
function apply(mainId,pr){
  const pips=A.pipsOf(mainId); if(!pips.length) return 0; let n=0;
  A.edit("Apply PiP preset",()=>{ pips.forEach((p,i)=>{ const s=pr.items[i]; if(!s) return; const c=p.clip;
    A.setShape(c,s.shape,s.size); if(s.radius!=null&&c.pip.radius!=null) c.pip.radius=s.radius; A.setSize(c,s.size); c.x=s.x; c.y=s.y; c.rotation=s.rot; c.opacity=s.op;
    Object.assign(c.pip,{border:s.border,color:s.color,shadow:s.shadow,bstyle:s.bstyle,glow:s.glow}); c.pip.sig=null; c.pip.sig2=null; n++; }); });
  return n;
}
A.savePreset=function(mainId,name){ const a=load(); a.unshift({id:"u"+Date.now(),name:name||"My layout",items:snap(mainId)}); return save(a); };
A.applyPreset=apply; A.listPresets=load;
A.mainPanels.push(function(g,f){
  if(!A.pipsOf(f.clip.id).length) return;
  const w=document.createElement("div");
  function draw(){ const L=load();
    w.innerHTML='<label class="field">My PiP layouts</label><div class="pp-row"><input id="ppPrN" type="text" maxlength="30" placeholder="Name this arrangement" aria-label="Preset name" style="flex:1;min-width:0"><button class="pp-btn pri" id="ppPrS">Save</button></div>'+
      (L.length?'<div class="pp-chips">'+L.map(p=>'<span style="display:inline-flex;gap:2px"><button type="button" data-pa="'+p.id+'">'+p.name.replace(/[<>&"]/g,"")+' ('+p.items.length+')</button><button type="button" data-pd="'+p.id+'" aria-label="Delete preset">×</button></span>').join("")+'</div>':'<div class="pipmuted">Nothing saved yet.</div>'); }
  draw();
  w.onclick=e=>{ const b=e.target.closest("button"); if(!b) return; e.stopPropagation();
    if(b.id==="ppPrS"){ const nm=(w.querySelector("#ppPrN").value||"").trim()||("Layout "+(load().length+1)); try{ toast(A.savePreset(f.clip.id,nm)?"Saved “"+nm+"”":"Could not save here"); }catch(_){} draw(); }
    else if(b.dataset.pa){ const p=load().find(x=>x.id===b.dataset.pa); if(p){ const n=apply(f.clip.id,p); try{ toast("Applied to "+n+" PiP"+(n===1?"":"s")+(p.items.length>n?"":"")); }catch(_){} try{ renderInspector(); }catch(_){} } }
    else if(b.dataset.pd){ save(load().filter(x=>x.id!==b.dataset.pd)); draw(); } };
  g.appendChild(w);
});
A.presets=true; try{ window.AMIYO_EDITOR_BUILD="pip-step91-presets"; }catch(_){}
})();

;
/* ==================== Script 571 id="amiyo-pip-s92" ==================== */
/* PiP Studio — Step 92: smart auto-placement. New PiPs are sized by their real shape and placed inside safe margins, away from other PiPs
   that are on screen at the same time. Fixes square/portrait PiPs running off the frame. Adds "Auto-arrange" and "Smart place". */
(function(){
"use strict";
const A=window.AMIYO_PIP; if(!A||A.smart) return; A.smart=true;
const cl=(v,a,b)=>Math.min(b,Math.max(a,v));
const CA=()=>((project.settings&&project.settings.width)||1280)/((project.settings&&project.settings.height)||720);
/* size of a PiP box as fractions of the canvas width (w) and height (h) */
A.boxDims=function(c){
  const m=c.mask||{w:1,h:1}, ar=A.ar(c), s=c.scale||1;
  return {w:s*(m.w||1), h:s*(m.h||1)*CA()/ar};
};
function dimsFor(def,ar,size){
  const sq=!!def[3], mw=sq?(ar>=1?1/ar:1):1, mh=sq?(ar>=1?1:ar):1;
  return {w:size, h:size*mh*CA()/(mw*ar)};
}
function overlap(a,b){
  const ox=Math.max(0,Math.min(a.x+a.w/2,b.x+b.w/2)-Math.max(a.x-a.w/2,b.x-b.w/2));
  const oy=Math.max(0,Math.min(a.y+a.h/2,b.y+b.h/2)-Math.max(a.y-a.h/2,b.y-b.h/2));
  return ox*oy;
}
/* pick the best free spot for a box {w,h} among the others [{x,y,w,h}] */
A.pickSpot=function(d,others,margin){
  const mx=margin!=null?margin:.035, my=mx*CA();
  const xl=d.w/2+mx, xr=1-d.w/2-mx, yt=d.h/2+my, yb=1-d.h/2-my;
  const X=(v)=>xl>xr?.5:cl(v,xl,xr), Y=(v)=>yt>yb?.5:cl(v,yt,yb);
  const cand=[[1,0],[1,1],[0,1],[0,0],[1,.5],[0,.5],[.5,0],[.5,1],[.5,.5]].map(p=>({x:X(p[0]===1?xr:p[0]===0?xl:.5),y:Y(p[1]===1?yb:p[1]===0?yt:.5)}));
  let best=null,bo=1e9;
  for(const c of cand){ let o=0; for(const q of others) o+=overlap({x:c.x,y:c.y,w:d.w,h:d.h},q); if(o<bo-1e-9){ bo=o; best=c; if(o===0) break; } }
  return best||{x:.5,y:.5};
};
function othersFor(mainId,start,end,skipId){
  const o=[];
  for(const p of A.pipsOf(mainId)){ const c=p.clip; if(c.id===skipId) continue;
    if(c.start<end-1e-6&&start<c.start+c.duration-1e-6){ const d=A.boxDims(c); o.push({x:c.x??.5,y:c.y??.5,w:d.w,h:d.h}); } }
  return o;
}
/* used by the Attach button: work out x,y before the clip exists */
A.autoSpot=function(mainId,assetId,o){
  const m=A.find(mainId), a=getAsset(assetId); if(!m||!a) return null;
  const n=A.pipsOf(mainId).length, id=o.shape||(n%2?"rsquare":"circle"), size=o.size||.28;
  const ar=a.width&&a.height?a.width/a.height:16/9;
  const off=cl(o.start||0,0,Math.max(0,m.clip.duration-.5)), dur=Math.max(Math.min(.5,m.clip.duration),Math.min(o.dur||a.duration||5,a.duration||5,m.clip.duration-off));
  const s=m.clip.start+off;
  return A.pickSpot(dimsFor(A.def(id),ar,size),othersFor(mainId,s,s+dur,null));
};
const oc=A.create;
A.create=function(mainId,assetId,o){
  o=Object.assign({},o||{});
  if(o.x==null||o.y==null){ try{ const sp=A.autoSpot(mainId,assetId,o); if(sp){ o.x=sp.x; o.y=sp.y; } }catch(e){ window.__swl&&window.__swl(e); } }
  return oc.call(this,mainId,assetId,o);
};
/* place an existing PiP in the best free spot */
A.smartPlace=function(clipId){
  const f=A.find(clipId); if(!f||!f.clip.pip||!f.clip.pip.main) return false;
  const c=f.clip, before=deepClone(serializableProject()), d=A.boxDims(c);
  const sp=A.pickSpot(d,othersFor(c.pip.main,c.start,c.start+c.duration,c.id));
  c.x=sp.x; c.y=sp.y;
  recordHistory("Smart place PiP",before,deepClone(serializableProject())); scheduleAutosave(); renderAll(); try{ renderPreviewFrame(); }catch(_){}
  return true;
};
/* arrange every PiP of a main clip so none cover each other (when there is room) */
A.autoArrange=function(mainId){
  const ps=A.pipsOf(mainId); if(!ps.length) return 0;
  const before=deepClone(serializableProject()), placed=[];
  ps.sort((a,b)=>a.clip.start-b.clip.start);
  for(const p of ps){ const c=p.clip, d=A.boxDims(c);
    const others=placed.filter(q=>q.s<c.start+c.duration-1e-6&&c.start<q.e-1e-6);
    const sp=A.pickSpot(d,others); c.x=sp.x; c.y=sp.y; c.rotation=0;
    placed.push({x:sp.x,y:sp.y,w:d.w,h:d.h,s:c.start,e:c.start+c.duration}); }
  recordHistory("Auto-arrange PiPs",before,deepClone(serializableProject())); scheduleAutosave(); renderAll(); try{ renderPreviewFrame(); }catch(_){}
  return ps.length;
};
A.mainPanels.push((g,f)=>{ const n=A.pipsOf(f.clip.id).length; if(!n) return;
  const r=document.createElement("div"); r.className="pp-row"; r.innerHTML='<button class="pp-btn" id="ppAutoArr" title="Place every PiP inside the frame so they do not cover each other">✦ Auto-arrange '+n+' PiP'+(n>1?"s":"")+'</button>';
  r.querySelector("button").onclick=e=>{ e.stopPropagation(); const k=A.autoArrange(f.clip.id); try{ toast("Arranged "+k+" PiP"+(k===1?"":"s")); }catch(_){} };
  g.appendChild(r); });
A.panels.push((ex,f)=>{ const c=f.clip; if(!c.pip||!c.pip.main) return;
  const r=document.createElement("div"); r.className="pp-row"; r.innerHTML='<button class="pp-btn" title="Move this PiP to the nearest free corner">✦ Smart place</button>';
  r.querySelector("button").onclick=e=>{ e.stopPropagation(); A.smartPlace(c.id); };
  ex.appendChild(r); });
try{ window.AMIYO_EDITOR_BUILD="pip-step92-smart-place"; }catch(_){}
})();

;
/* ==================== Script 572 id="amiyo-pip-s93" ==================== */
/* PiP Studio — Step 93: PiPs are linked to their main clip. Move the main clip and every PiP attached to it moves by the same amount,
   so the layout stays in sync (like Premiere's linked clips). Trimming the main clip's left edge does not drag PiPs along.
   Per main clip, a "Move PiPs with this clip" switch turns the link off. */
(function(){
"use strict";
const A=window.AMIYO_PIP; if(!A||A.link) return; A.link=true;
let busy=false;
A.syncLinks=function(){
  if(busy) return 0; busy=true; let moved=0;
  try{
    const idx={}; for(const t of project.tracks) for(const c of t.clips) idx[c.id]=c;
    for(const t of project.tracks) for(const c of t.clips){
      const p=c.pip; if(!p||!p.main) continue;
      const m=idx[p.main]; if(!m) continue;
      if(p.ms==null){ p.ms=m.start; p.mi=m.inPoint||0; p.ps=c.start; continue; }
      const dm=m.start-p.ms, dps=c.start-p.ps;
      if(Math.abs(dm)>1e-4 && m.pipLink!==false){
        const dIn=((m.inPoint||0)-(p.mi||0))/(m.speed||1);
        const trim=Math.abs((m.inPoint||0)-(p.mi||0))>1e-4 && Math.abs(dIn-dm)<2e-3;
        if(!trim && Math.abs(dps)<1e-4){ c.start=Math.max(0,c.start+dm); moved++; }
      }
      p.ms=m.start; p.mi=m.inPoint||0; p.ps=c.start;
    }
  }catch(e){ window.__swl&&window.__swl(e); }
  busy=false; return moved;
};
/* run before a change is written to history, so undo/redo carry the PiP shift too */
const rh=window.recordHistory;
window.recordHistory=function(label,before,after){
  let a=after; try{ if(A.syncLinks()>0) a=deepClone(serializableProject()); }catch(_){}
  return rh.call(this,label,before,a);
};
/* and live, while a clip is being dragged or the timeline is redrawn */
const rt=window.renderTimeline;
if(typeof rt==="function") window.renderTimeline=function(){ try{ A.syncLinks(); }catch(_){} return rt.apply(this,arguments); };
const ra=window.renderAll;
window.renderAll=function(){ try{ A.syncLinks(); }catch(_){} return ra.apply(this,arguments); };
/* switch in the main-clip panel */
A.mainPanels.push((g,f)=>{ if(!A.pipsOf(f.clip.id).length) return;
  const l=document.createElement("label"); l.style.cssText="font-size:12px;display:flex;gap:6px;align-items:center;margin:6px 0";
  l.innerHTML='<input type="checkbox" id="ppLinkOn"> Move PiPs with this clip';
  const cb=l.querySelector("input"); cb.checked=f.clip.pipLink!==false;
  cb.onchange=e=>{ e.stopPropagation(); const before=deepClone(serializableProject()); f.clip.pipLink=cb.checked?undefined:false; if(cb.checked){ A.pipsOf(f.clip.id).forEach(p=>{ p.clip.pip.ms=f.clip.start; p.clip.pip.ps=p.clip.start; }); }
    recordHistory("PiP link "+(cb.checked?"on":"off"),before,deepClone(serializableProject())); };
  g.appendChild(l); });
A.panels.push((ex,f)=>{ const m=A.mainOf(f.clip); if(!m) return;
  const n=document.createElement("div"); n.className="pp-note"; n.textContent=m.clip.pipLink===false?"Not following the main clip.":"Linked: follows the main clip when it moves."; ex.appendChild(n); });
A.syncLinks();
try{ window.AMIYO_EDITOR_BUILD="pip-step93-linked"; }catch(_){}
})();

;
/* ==================== Script 573 id="amiyo-pip-s94" ==================== */
/* PiP Studio — Step 94: orphan handling. If the main clip of a PiP is deleted, the PiP stays as a free overlay (it is never left pointing at nothing),
   a message tells you, and you can attach any free PiP to a main clip again — or detach a PiP on purpose. */
(function(){
"use strict";
const A=window.AMIYO_PIP; if(!A||A.orphans) return; A.orphans=true;
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
function findOrphans(){
  const ids=new Set(); for(const t of project.tracks) for(const c of t.clips) ids.add(c.id);
  const o=[]; for(const t of project.tracks) for(const c of t.clips) if(c.pip&&c.pip.main&&!ids.has(c.pip.main)) o.push(c);
  return o;
}
A.freePips=function(){ const o=[]; for(const t of project.tracks) for(const c of t.clips) if(c.pip&&!c.pip.main) o.push({track:t,clip:c}); return o; };
A.mainCandidates=function(){
  const o=[]; for(const t of project.tracks){ if(t.kind!=="video"||t.hidden) continue;
    for(const c of t.clips){ if(c.pip||c.kind==="adjustment") continue; const a=getAsset(c.assetId); if(!a||a.type==="audio") continue; o.push({track:t,clip:c,name:(a&&a.name)||"Video"}); } }
  return o;
};
A.attach=function(clipId,mainId){
  const f=A.find(clipId), m=A.find(mainId); if(!f||!m||!f.clip.pip||m.clip.pip||m.clip.id===clipId) return false;
  const before=deepClone(serializableProject()); const p=f.clip.pip;
  p.main=m.clip.id; p.ms=m.clip.start; p.mi=m.clip.inPoint||0; p.ps=f.clip.start; delete p.orphan;
  recordHistory("Attach PiP to main",before,deepClone(serializableProject())); scheduleAutosave(); renderAll(); return true;
};
A.detach=function(clipId){
  const f=A.find(clipId); if(!f||!f.clip.pip||!f.clip.pip.main) return false;
  const before=deepClone(serializableProject()); f.clip.pip.main=null; delete f.clip.pip.ms; delete f.clip.pip.mi; delete f.clip.pip.ps;
  recordHistory("Detach PiP",before,deepClone(serializableProject())); scheduleAutosave(); renderAll(); return true;
};
/* quiet check, a moment after things settle, so a clip that is only in mid-move is never mistaken for deleted */
let tm=0, told=0;
function check(){
  tm=0; const o=findOrphans(); if(!o.length) return;
  o.forEach(c=>{ c.pip.main=null; c.pip.orphan=true; delete c.pip.ms; delete c.pip.mi; delete c.pip.ps; });
  scheduleAutosave();
  if(Date.now()-told>1500){ told=Date.now(); try{ toast(o.length+" PiP"+(o.length>1?"s":"")+" lost "+(o.length>1?"their":"its")+" main video — kept as free overlay"+(o.length>1?"s":"")+". Select one to attach it again.",4800); }catch(_){} }
  try{ renderAll(); }catch(_){}
}
const ra=window.renderAll;
window.renderAll=function(){ const r=ra.apply(this,arguments); try{ if(!tm) tm=setTimeout(check,650); }catch(_){} return r; };
A.panels.push((ex,f)=>{
  const c=f.clip; if(!c.pip) return;
  const w=document.createElement("div");
  if(c.pip.main){
    w.innerHTML='<div class="pp-row"><button class="pp-btn" title="Make this a free overlay that no longer follows a main clip">Detach from main</button></div>';
    w.querySelector("button").onclick=e=>{ e.stopPropagation(); A.detach(c.id); };
  } else {
    const cand=A.mainCandidates();
    w.innerHTML='<div class="pp-note"><b>Free overlay</b> — not attached to a main video.</div>'+
      (cand.length?'<select id="ppAttSel">'+cand.map(x=>'<option value="'+x.clip.id+'">'+esc(x.name)+' · '+x.clip.start.toFixed(1)+'s</option>').join("")+'</select><div class="pp-row"><button class="pp-btn pri">Attach to this main</button></div>':'<div class="pp-note">Add a main video to attach it.</div>');
    const b=w.querySelector("button"); if(b) b.onclick=e=>{ e.stopPropagation(); const v=w.querySelector("#ppAttSel").value; if(!A.attach(c.id,v)) toast("Could not attach"); };
  }
  ex.appendChild(w);
});
try{ window.AMIYO_EDITOR_BUILD="pip-step94-orphans"; }catch(_){}
})();

;
/* ==================== Script 574 id="amiyo-pip-s95" ==================== */
/* PiP Studio — Step 95: drag a video from the Media panel (This project or Library) and drop it on the preview.
   It becomes a PiP on the main video at the spot where you dropped it, starting at the playhead. */
(function(){
"use strict";
const A=window.AMIYO_PIP; if(!A||A.dropOn) return; A.dropOn=true;
const shell=document.getElementById("canvasShell"); if(!shell) return;
const ghost=document.createElement("div"); ghost.id="ppDropGhost";
ghost.style.cssText="position:absolute;z-index:31;pointer-events:none;display:none;border:2px dashed #ff7a3d;background:rgba(255,122,61,.18);border-radius:50%;box-sizing:border-box;transform:translate(-50%,-50%)";
shell.appendChild(ghost);
const hasAsset=e=>e.dataTransfer&&[...(e.dataTransfer.types||[])].some(t=>t==="text/amiyo-asset"||t==="text/amiyo-lib");
function relPos(e){ const r=shell.getBoundingClientRect(); return {x:(e.clientX-r.left)/r.width, y:(e.clientY-r.top)/r.height, w:r.width, h:r.height}; }
shell.addEventListener("dragover",e=>{ if(!hasAsset(e)) return; e.preventDefault(); e.dataTransfer.dropEffect="copy";
  const p=relPos(e), s=.28*p.w; ghost.style.display="block"; ghost.style.width=s+"px"; ghost.style.height=s+"px"; ghost.style.left=(p.x*p.w)+"px"; ghost.style.top=(p.y*p.h)+"px"; },true);
shell.addEventListener("dragleave",e=>{ if(!shell.contains(e.relatedTarget)) ghost.style.display="none"; },true);
/* which main clip should receive the PiP */
A.pickMain=function(){
  const sel=getClip(); if(sel){ if(sel.clip.pip&&sel.clip.pip.main){ const m=A.find(sel.clip.pip.main); if(m) return m; } else if(sel.track.kind==="video"&&!sel.clip.pip&&sel.clip.kind!=="adjustment") return sel; }
  const t=(typeof currentTime==="number")?currentTime:0; let first=null;
  for(const tr of project.tracks){ if(tr.kind!=="video"||tr.hidden) continue;
    for(const c of tr.clips){ if(c.pip||c.kind==="adjustment") continue; const a=getAsset(c.assetId); if(!a||a.type==="audio") continue;
      if(!first) first={track:tr,clip:c}; if(t>=c.start-1e-6&&t<c.start+c.duration) return {track:tr,clip:c}; } }
  return first;
};
async function assetFromEvent(e){
  const dt=e.dataTransfer, aid=dt.getData("text/amiyo-asset");
  if(aid) return getAsset(aid)?aid:null;
  const lib=(dt.getData("text/amiyo-lib")||"").split(",").filter(Boolean)[0]; if(!lib||!window.amiyoMediaLib) return null;
  let found=Object.values(project.assets).find(a=>a.libId===lib);
  if(!found){ await window.amiyoMediaLib.use([lib],{}); found=Object.values(project.assets).find(a=>a.libId===lib); }
  return found?found.id:null;
}
shell.addEventListener("drop",async e=>{
  if(!hasAsset(e)) return; e.preventDefault(); e.stopPropagation(); ghost.style.display="none";
  const p=relPos(e); let aid=null; try{ aid=await assetFromEvent(e); }catch(err){ window.__swl&&window.__swl(err); }
  if(!aid){ toast("That file is not available in this project"); return; }
  const a=getAsset(aid);
  if(!a||(a.type!=="video"&&a.type!=="image")){ toast("Only videos and images can be dropped as picture-in-picture"); return; }
  const m=A.pickMain(); if(!m){ toast("Put a main video on the timeline first, then drop another video on it",4200); return; }
  if(m.clip.assetId===aid&&false) return;
  /* plan step 7: start at the playhead; if the playhead is outside the main clip, or too close to its end, start early enough that the PiP can play for a useful time */
  const t=(typeof currentTime==="number")?currentTime:0, want=Math.min(+a.duration||5,2,m.clip.duration), inside=t>=m.clip.start-1e-6&&t<m.clip.start+m.clip.duration, off=inside?Math.max(0,Math.min(t-m.clip.start,m.clip.duration-want)):0;
  const r=A.create(m.clip.id,aid,{x:p.x,y:p.y,start:off}); if(!r){ toast("Could not attach that video"); return; }
  /* keep the whole shape inside the frame, then fold that nudge into the same undo step */
  try{ const d=A.boxDims(r.clip), CA=p.w/p.h, mx=.02, my=.02*CA;
    r.clip.x=Math.min(Math.max(r.clip.x,d.w/2+mx),1-d.w/2-mx); r.clip.y=Math.min(Math.max(r.clip.y,d.h/2+my),1-d.h/2-my);
    const H=project.history; if(H&&H.entries[H.index]) H.entries[H.index].after=deepClone(serializableProject());
    scheduleAutosave(); renderAll(); renderPreviewFrame(); }catch(_){}
  toast("Attached as picture-in-picture at the drop spot");
},true);
try{ window.AMIYO_EDITOR_BUILD="pip-step95-drop-on-preview"; }catch(_){}
})();

;
/* ==================== Script 575 id="amiyo-pip-s96" ==================== */
/* PiP Studio — Step 96: choose the size and the frame ratio of every PiP in one tap.
   Size presets (XS…XL) and ratios (original, 1:1, 4:3, 16:9, 9:16, 4:5, 3:4, 21:9) that crop the video to that shape from the centre.
   Works with every shape (a 16:9 circle becomes an oval, a 9:16 rounded rectangle becomes a phone-style card). */
(function(){
"use strict";
const A=window.AMIYO_PIP; if(!A||A.ratio) return; A.ratio=true;
const CA=()=>((project.settings&&project.settings.width)||1280)/((project.settings&&project.settings.height)||720);
const RATIOS=[["orig","Original",0],["1:1","1:1",1],["4:3","4:3",4/3],["16:9","16:9",16/9],["9:16","9:16",9/16],["4:5","4:5",4/5],["3:4","3:4",3/4],["21:9","21:9",21/9]];
const SIZES=[["XS",.14],["S",.2],["M",.28],["L",.4],["XL",.55],["Max",.9]];
A.RATIOS=RATIOS; A.SIZES=SIZES;
/* crop the mask to visible aspect R (width/height in pixels), keeping the visible width at `size` */
function applyRatio(c,R,size){
  const ar=A.ar(c); let mw=1, mh=ar/R; if(mh>1){ mh=1; mw=R/ar; }
  const m=c.mask||(c.mask={enabled:true,shape:"rect",x:.5,y:.5,feather:0,invert:false});
  m.enabled=true; m.x=.5; m.y=.5; m.w=mw; m.h=mh;
  c.pip.ratio=R; A.setSize(c,size);
}
A.setRatio=function(c,key){
  const r=RATIOS.find(x=>x[0]===key)||RATIOS[0], size=A.size(c);
  if(!c.pip) return;
  if(!r[2]){ delete c.pip.ratio; A.setShape(c,c.pip.shape,size); }
  else applyRatio(c,r[2],size);
  /* keep the new, different height inside the frame */
  const d=A.boxDims(c), my=.02*CA(); c.x=Math.min(Math.max(c.x??.5,d.w/2+.02),1-d.w/2-.02); c.y=Math.min(Math.max(c.y??.5,d.h/2+my),1-d.h/2-my);
};
/* a new shape keeps the chosen ratio */
const ss=A.setShape;
A.setShape=function(c,id,size){ ss.call(A,c,id,size); if(c.pip&&c.pip.ratio) applyRatio(c,c.pip.ratio,size||A.size(c)); };
/* layouts compute their own cells, so they start from the natural ratio */
if(A.applyLayout){ const al=A.applyLayout; A.applyLayout=function(mainId,name){ A.pipsOf(mainId).forEach(p=>{ if(p.clip.pip.ratio){ delete p.clip.pip.ratio; } }); return al.call(A,mainId,name); }; }
const curKey=c=>{ const R=c.pip&&c.pip.ratio; if(!R) return "orig"; const f=RATIOS.find(x=>x[2]&&Math.abs(x[2]-R)<1e-3); return f?f[0]:"custom"; };
A.panels.push((ex,f)=>{
  const c=f.clip; if(!c.pip) return;
  const w=document.createElement("div"), size=Math.round(A.size(c)*100), key=curKey(c);
  w.innerHTML='<label class="field">Size presets</label><div class="pp-chips" data-k="sz">'+SIZES.map(s=>'<button data-sz="'+s[1]+'" class="'+(Math.abs(A.size(c)-s[1])<.012?"on":"")+'">'+s[0]+' · '+Math.round(s[1]*100)+'%</button>').join("")+'</div>'+
    '<label class="field">Frame ratio <span class="pp-note" style="margin-left:6px">crops from the centre</span></label><div class="pp-chips" data-k="ra">'+RATIOS.map(r=>'<button data-ra="'+r[0]+'" class="'+(key===r[0]?"on":"")+'">'+r[1]+'</button>').join("")+'</div>';
  w.onclick=e=>{ const b=e.target.closest("button"); if(!b) return; e.stopPropagation();
    if(b.dataset.sz){ A.edit("PiP size",()=>A.setSize(c,+b.dataset.sz)); }
    else if(b.dataset.ra){ A.edit("PiP frame ratio",()=>A.setRatio(c,b.dataset.ra)); }
    setTimeout(()=>{ try{ renderInspector(); }catch(_){} },30); };
  ex.appendChild(w);
});
try{ window.AMIYO_EDITOR_BUILD="pip-step96-ratio-size"; }catch(_){}
})();

;
/* ==================== Script 576 id="amiyo-pip-s97" ==================== */
/* PiP Studio — Step 97: zoom and pan the picture INSIDE its shape (like Premiere's Position/Scale inside a crop).
   The shape itself stays exactly where its X/Y say; only the video behind it moves. Zoom 100–400 %, pan left/right and up/down. */
(function(){
"use strict";
const A=window.AMIYO_PIP; if(!A||A.zoomIn) return; A.zoomIn=true;
const cl=(v,a,b)=>Math.min(b,Math.max(a,isFinite(+v)?+v:a));
/* treat the current mask as the unzoomed base and apply pip.zoom / pip.panx / pip.pany on top of it */
function reapply(c){
  const p=c.pip; if(!p) return; const z=p.zoom||1, m=c.mask; if(!m) return;
  const px=p.panx||0, py=p.pany||0, S=A.size(c);
  if(z>1.0001){ m.w=m.w/z; m.h=m.h/z; }
  m.x=.5+px*(1-m.w)/2*(z>1.0001?1:0); m.y=.5+py*(1-m.h)/2*(z>1.0001?1:0);
  A.setSize(c,S);
}
A.setZoom=function(c,z,px,py){
  const p=c.pip; if(!p||!c.mask) return;
  const S=A.size(c), old=p.zoom||1;
  c.mask.w*=old; c.mask.h*=old; c.mask.x=.5; c.mask.y=.5;      /* back to the unzoomed base */
  c.mask.w=Math.min(1,c.mask.w); c.mask.h=Math.min(1,c.mask.h);
  p.zoom=cl(z,1,4); p.panx=cl(px!=null?px:p.panx||0,-1,1); p.pany=cl(py!=null?py:p.pany||0,-1,1);
  if(p.zoom<=1.0001){ delete p.zoom; delete p.panx; delete p.pany; }
  c.scale=S/c.mask.w; /* keep visible width while the base is restored */
  reapply(c); A.setSize(c,S);
};
/* a new shape / ratio rebuilds the base mask, so the zoom is put back on top */
const ss=A.setShape; A.setShape=function(c,id,size){ if(c.pip) { const z=c.pip.zoom; ss.call(A,c,id,size); if(z) reapply(c); } else ss.call(A,c,id,size); };
if(A.setRatio){ const sr=A.setRatio; A.setRatio=function(c,key){ sr.call(A,c,key); if(c.pip&&c.pip.zoom) reapply(c); }; }

/* ---- draw-time compensation: shape stays at c.x/c.y while the picture inside it is panned ---- */
function comp(ks,rot,m,W,H,ar){
  const lx=((m.x??.5)-.5)*ks*W, ly=((m.y??.5)-.5)*ks*W/ar, th=(rot||0)*Math.PI/180, c=Math.cos(th), s=Math.sin(th);
  return [(lx*c-ly*s)/W,(lx*s+ly*c)/H];
}
const op=window.__amiyoPaintVideoClip;
if(typeof op==="function") window.__amiyoPaintVideoClip=function(track,el,clip,W,H){
  const p=clip&&clip.pip, m=clip&&clip.mask;
  if(!p||!m||!m.enabled||(Math.abs((m.x??.5)-.5)<1e-6&&Math.abs((m.y??.5)-.5)<1e-6)) return op.apply(this,arguments);
  const ar=(el&&el.videoWidth&&el.videoHeight)?el.videoWidth/el.videoHeight:A.ar(clip);
  const x0=clip.x, y0=clip.y, ks0=clip.scale||1, r0=clip.rotation||0, c0=comp(ks0,r0,m,W,H,ar), saved=[];
  try{
    clip.x=(clip.x??.5)-c0[0]; clip.y=(clip.y??.5)-c0[1];
    for(const k of (clip.keyframes||[])){ const d=comp(k.scale??ks0,k.rotation??r0,m,W,H,ar); saved.push([k,k.x,k.y]); if(k.x!=null) k.x-=d[0]; if(k.y!=null) k.y-=d[1]; }
    return op.apply(this,arguments);
  } finally { clip.x=x0; clip.y=y0; for(const s of saved){ s[0].x=s[1]; s[0].y=s[2]; } }
};
A.compPan=comp;

A.panels.push((ex,f)=>{
  const c=f.clip; if(!c.pip||!c.mask) return; const p=c.pip;
  const w=document.createElement("div"), z=Math.round((p.zoom||1)*100), px=Math.round((p.panx||0)*100), py=Math.round((p.pany||0)*100);
  w.innerHTML='<label class="field">Zoom inside shape <span id="ppZmV">'+z+'%</span></label><input id="ppZm" type="range" min="100" max="400" step="5" value="'+z+'">'+
    '<div class="fieldrow"><div><label class="field">Pan left/right <span id="ppPxV">'+px+'</span></label><input id="ppPx" type="range" min="-100" max="100" value="'+px+'"></div>'+
    '<div><label class="field">Pan up/down <span id="ppPyV">'+py+'</span></label><input id="ppPy" type="range" min="-100" max="100" value="'+py+'"></div></div>'+
    '<div class="pp-row"><button class="pp-btn" id="ppZr">Reset zoom</button></div>';
  const q=id=>w.querySelector("#"+id);
  const go=()=>A.edit("PiP zoom / pan",()=>A.setZoom(c,q("ppZm").value/100,q("ppPx").value/100,q("ppPy").value/100));
  [["ppZm","ppZmV","%"],["ppPx","ppPxV",""],["ppPy","ppPyV",""]].forEach(a=>{ q(a[0]).oninput=()=>{ q(a[1]).textContent=q(a[0]).value+a[2]; go(); }; });
  q("ppZr").onclick=e=>{ e.stopPropagation(); A.edit("Reset PiP zoom",()=>A.setZoom(c,1,0,0)); setTimeout(()=>{ try{ renderInspector(); }catch(_){} },30); };
  ex.appendChild(w);
});
try{ window.AMIYO_EDITOR_BUILD="pip-step97-zoom-pan"; }catch(_){}
})();

;
/* ==================== Script 577 id="amiyo-pip-s98" ==================== */
/* PiP Studio — Step 98: align and distribute. Snap a PiP to the frame (left / centre / right / top / middle / bottom, inside a safe margin),
   line all PiPs of a main clip up with the selected one, spread them out evenly, or make them all the same size or shape. */
(function(){
"use strict";
const A=window.AMIYO_PIP; if(!A||A.align||!A.boxDims) return; A.align=true;
const CA=()=>((project.settings&&project.settings.width)||1280)/((project.settings&&project.settings.height)||720);
const MX=.03;
const done=(label,before)=>{ recordHistory(label,before,deepClone(serializableProject())); scheduleAutosave(); renderAll(); try{ renderPreviewFrame(); }catch(_){} };
const rect=c=>{ const d=A.boxDims(c); return {x:c.x??.5,y:c.y??.5,w:d.w,h:d.h}; };
/* --- to the frame --- */
A.alignToFrame=function(c,edge){
  const before=deepClone(serializableProject()), d=A.boxDims(c), my=MX*CA();
  if(edge==="l") c.x=MX+d.w/2; else if(edge==="r") c.x=1-MX-d.w/2; else if(edge==="c") c.x=.5;
  else if(edge==="t") c.y=my+d.h/2; else if(edge==="b") c.y=1-my-d.h/2; else if(edge==="m") c.y=.5;
  done("Align PiP",before);
};
/* --- with the other PiPs on the same main clip --- */
A.alignGroup=function(mainId,edge,refId){
  const ref=A.find(refId); if(!ref) return 0; const rr=rect(ref.clip), before=deepClone(serializableProject()); let n=0;
  for(const p of A.pipsOf(mainId)){ const c=p.clip; if(c.id===refId) continue; const d=A.boxDims(c);
    if(edge==="l") c.x=rr.x-rr.w/2+d.w/2; else if(edge==="r") c.x=rr.x+rr.w/2-d.w/2; else if(edge==="c") c.x=rr.x;
    else if(edge==="t") c.y=rr.y-rr.h/2+d.h/2; else if(edge==="b") c.y=rr.y+rr.h/2-d.h/2; else if(edge==="m") c.y=rr.y; n++; }
  if(n) done("Align PiPs",before); return n;
};
A.distribute=function(mainId,axis){
  const ps=A.pipsOf(mainId); if(ps.length<3){ return 0; }
  const X=axis==="h", rs=ps.map(p=>({c:p.clip,r:rect(p.clip)})).sort((a,b)=>X?a.r.x-b.r.x:a.r.y-b.r.y), before=deepClone(serializableProject());
  const size=r=>X?r.w:r.h, pos=r=>X?r.x:r.y;
  const first=rs[0].r, last=rs[rs.length-1].r, start=pos(first)-size(first)/2, end=pos(last)+size(last)/2;
  const total=rs.reduce((s,o)=>s+size(o.r),0), gap=(end-start-total)/(rs.length-1);
  let cur=start; for(const o of rs){ const cen=cur+size(o.r)/2; if(X) o.c.x=cen; else o.c.y=cen; cur+=size(o.r)+gap; }
  done("Distribute PiPs",before); return rs.length;
};
A.matchSize=function(mainId,refId){
  const ref=A.find(refId); if(!ref) return 0; const S=A.size(ref.clip), before=deepClone(serializableProject()); let n=0;
  for(const p of A.pipsOf(mainId)){ if(p.clip.id===refId) continue; A.setSize(p.clip,S); n++; }
  if(n) done("Match PiP size",before); return n;
};
A.matchShape=function(mainId,refId){
  const ref=A.find(refId); if(!ref) return 0; const sh=ref.clip.pip.shape, rat=ref.clip.pip.ratio, before=deepClone(serializableProject()); let n=0;
  for(const p of A.pipsOf(mainId)){ const c=p.clip; if(c.id===refId) continue; const S=A.size(c);
    if(rat) c.pip.ratio=rat; else delete c.pip.ratio;
    A.setShape(c,sh,S); if(ref.clip.pip.radius!=null&&c.pip.radius!=null) c.pip.radius=ref.clip.pip.radius; n++; }
  if(n) done("Match PiP shape",before); return n;
};
const E=[["l","⇤ Left"],["c","↔ Centre"],["r","Right ⇥"],["t","⤒ Top"],["m","↕ Middle"],["b","⤓ Bottom"]];
A.panels.push((ex,f)=>{
  const c=f.clip; if(!c.pip) return; const mid=c.pip.main, n=mid?A.pipsOf(mid).length:0;
  const w=document.createElement("div");
  w.innerHTML='<label class="field">Align to frame</label><div class="pp-chips">'+E.map(e=>'<button data-fa="'+e[0]+'">'+e[1]+'</button>').join("")+'</div>'+
    (n>1?'<label class="field">With other PiPs <span class="pp-note" style="margin-left:6px">lines up with this one</span></label><div class="pp-chips">'+E.map(e=>'<button data-ga="'+e[0]+'">'+e[1]+'</button>').join("")+'</div>'+
      '<div class="pp-chips"><button data-act="dh"'+(n<3?' disabled title="Needs 3 or more PiPs"':'')+'>Distribute ↔</button><button data-act="dv"'+(n<3?' disabled title="Needs 3 or more PiPs"':'')+'>Distribute ↕</button><button data-act="ms">Same size</button><button data-act="mh">Same shape</button></div>':'');
  w.onclick=e=>{ const b=e.target.closest("button"); if(!b||b.disabled) return; e.stopPropagation();
    if(b.dataset.fa) A.alignToFrame(c,b.dataset.fa);
    else if(b.dataset.ga) A.alignGroup(mid,b.dataset.ga,c.id);
    else if(b.dataset.act==="dh") A.distribute(mid,"h"); else if(b.dataset.act==="dv") A.distribute(mid,"v");
    else if(b.dataset.act==="ms") A.matchSize(mid,c.id); else if(b.dataset.act==="mh") A.matchShape(mid,c.id); };
  ex.appendChild(w);
});
try{ window.AMIYO_EDITOR_BUILD="pip-step98-align"; }catch(_){}
})();

;
/* ==================== Script 578 id="amiyo-pip-s99" ==================== */
/* PiP Studio — Step 99: layer order. Bring a PiP forward or backward, to the very front or just above the main video, so overlapping
   PiPs stack the way you want. (The editor draws tracks lower in the list on top; this moves the PiP's own track.) */
(function(){
"use strict";
const A=window.AMIYO_PIP; if(!A||A.layerOrder) return; A.layerOrder=true;
const done=(label,before)=>{ recordHistory(label,before,deepClone(serializableProject())); scheduleAutosave(); renderAll(); try{ renderPreviewFrame(); }catch(_){} };
const tIdx=t=>project.tracks.indexOf(t);
/* PiPs of one main clip from the back (drawn first) to the front (drawn last) */
A.layers=function(mainId){ return A.pipsOf(mainId).sort((a,b)=>tIdx(a.track)-tIdx(b.track)||a.clip.start-b.clip.start); };
function ownTrack(f){
  if(f.track.clips.length<=1) return f.track;
  const nm=project.tracks.filter(t=>/^PiP/.test(t.name||"")).length+1;
  const tr={id:uid("track"),name:"PiP "+nm,kind:"video",locked:false,hidden:false,muted:f.track.muted,clips:[]};
  project.tracks.splice(tIdx(f.track)+1,0,tr);
  f.track.clips=f.track.clips.filter(c=>c!==f.clip); tr.clips.push(f.clip); f.track=tr; return tr;
}
function mainTrackIdx(mainId){ const m=A.find(mainId); return m?tIdx(m.track):-1; }
A.moveLayer=function(clipId,how){
  const f=A.find(clipId); if(!f||!f.clip.pip) return false; const mid=f.clip.pip.main; if(!mid) { try{ toast("Attach this PiP to a main video to order its layers"); }catch(_){} return false; }
  const before=deepClone(serializableProject()); ownTrack(f);
  const tr=f.track, L=A.layers(mid).map(p=>p.track).filter((t,i,a)=>a.indexOf(t)===i), pos=L.indexOf(tr);
  const swap=(other)=>{ const i=tIdx(tr), j=tIdx(other); project.tracks[i]=other; project.tracks[j]=tr; };
  if(how==="fwd"){ if(pos>=L.length-1){ try{ toast("Already in front"); }catch(_){} return false; } swap(L[pos+1]); }
  else if(how==="back"){ if(pos<=0){ try{ toast("Already at the back"); }catch(_){} return false; } swap(L[pos-1]); }
  else if(how==="front"){ if(pos>=L.length-1){ try{ toast("Already in front"); }catch(_){} return false; } const top=L[L.length-1]; project.tracks.splice(tIdx(tr),1); project.tracks.splice(tIdx(top)+1,0,tr); }
  else if(how==="rear"){ if(pos<=0){ try{ toast("Already at the back"); }catch(_){} return false; } const mi=mainTrackIdx(mid); project.tracks.splice(tIdx(tr),1); project.tracks.splice(Math.max(0,mi)+1,0,tr); }
  done("PiP layer order",before); return true;
};
A.layerInfo=function(clipId){ const f=A.find(clipId); if(!f||!f.clip.pip||!f.clip.pip.main) return null;
  const L=A.layers(f.clip.pip.main), i=L.findIndex(p=>p.clip.id===clipId); return i<0?null:{pos:i+1,of:L.length}; };
A.panels.push((ex,f)=>{
  const c=f.clip, li=A.layerInfo(c.id); if(!li||li.of<2) return;
  const w=document.createElement("div");
  w.innerHTML='<label class="field">Layer order <span class="pp-note" style="margin-left:6px">'+(li.pos===li.of?"in front":li.pos===1?"behind the others":("layer "+li.pos+" of "+li.of))+'</span></label>'+
    '<div class="pp-chips"><button data-ly="front">⤒ To front</button><button data-ly="fwd">▲ Forward</button><button data-ly="back">▼ Backward</button><button data-ly="rear">⤓ To back</button></div>';
  w.onclick=e=>{ const b=e.target.closest("[data-ly]"); if(!b) return; e.stopPropagation(); if(A.moveLayer(c.id,b.dataset.ly)) setTimeout(()=>{ try{ renderInspector(); }catch(_){} },30); };
  ex.appendChild(w);
});
try{ window.AMIYO_EDITOR_BUILD="pip-step99-layers"; }catch(_){}
})();

;
/* ==================== Script 579 id="amiyo-pip-s100" ==================== */
/* PiP Studio — Step 100: select several PiPs and edit them together. Shift-click (or Ctrl/Cmd-click) PiPs on the preview to add or remove them;
   then drag to move them all, drag a corner to resize them all by the same ratio, or turn the rotate knob to rotate them all.
   "Select all PiPs" picks every PiP on the main clip. */
(function(){
"use strict";
const A=window.AMIYO_PIP; if(!A||!A.ov||!A.hooks||A.multi) return;
const shell=document.getElementById("canvasShell"), ov=A.ov; if(!shell) return;
const M=A.multi=new Set();
const st=document.createElement("style");
st.textContent="#ppOv .pg.ms{border:2px solid #ffd24a;background:rgba(255,210,74,.16)}#ppOv .pb.ms2{box-shadow:0 0 0 2px #ffd24a,0 0 0 1px rgba(0,0,0,.45)}";
document.head.appendChild(st);
function mark(){
  const sel=window.selectedClipId; ov.querySelectorAll("[data-id]").forEach(el=>{ const id=el.dataset.id, on=M.has(id)&&M.size>1;
    if(el.classList.contains("pg")) el.classList.toggle("ms",on); else el.classList.toggle("ms2",on&&id===sel); });
}
new MutationObserver(mark).observe(ov,{childList:true});
function prune(){ for(const id of [...M]) if(!A.find(id)) M.delete(id); if(M.size===1) M.clear(); }
A.multiSet=function(ids){ M.clear(); ids.forEach(i=>M.add(i)); prune(); try{ A.refreshOverlay(); }catch(_){} mark(); try{ renderInspector(); }catch(_){} };
A.selectAllPips=function(mainId){ const ids=A.pipsOf(mainId).map(p=>p.clip.id); if(ids.length<2) return false; A.multiSet(ids); const f=A.find(ids[0]); if(f&&window.selectedClipId!==ids[0]) A.select(f); return true; };

/* modifier-click on a PiP toggles it in the group (runs before the overlay's own handler) */
shell.addEventListener("pointerdown",e=>{
  if(!(e.shiftKey||e.ctrlKey||e.metaKey)) return;
  const el=e.target.closest&&e.target.closest("#ppOv [data-id]"); if(!el) return;
  e.preventDefault(); e.stopPropagation();
  const id=el.dataset.id, cur=window.selectedClipId, curIsPip=!!(cur&&A.find(cur)&&A.find(cur).clip.pip);
  if(!M.size&&curIsPip&&cur!==id) M.add(cur);
  if(M.has(id)) M.delete(id); else M.add(id);
  prune();
  if(M.size&&!M.has(window.selectedClipId)){ const f=A.find([...M][0]); if(f) A.select(f); }
  try{ A.refreshOverlay(); }catch(_){} mark();
  try{ toast(M.size>1?(M.size+" PiPs selected — drag to move them together"):"Single PiP selected",1800); }catch(_){}
},true);
/* a plain click on something else ends the group */
shell.addEventListener("pointerdown",e=>{
  if(e.shiftKey||e.ctrlKey||e.metaKey||!M.size) return;
  const el=e.target.closest&&e.target.closest("#ppOv [data-id]");
  if(el&&M.has(el.dataset.id)&&el.classList.contains("pb")) return;      /* dragging the selected box keeps the group */
  if(el&&M.has(el.dataset.id)){ return; }                                   /* clicking a group member keeps the group, selects it */
  M.clear(); try{ A.refreshOverlay(); }catch(_){}
},true);

/* the primary PiP is being dragged: apply the same change to the others */
A.hooks.drag.push((c,d,e)=>{
  if(M.size<2||!M.has(c.id)) return;
  if(!d.__m){ d.__m={}; M.forEach(id=>{ if(id===c.id) return; const f=A.find(id); if(f) d.__m[id]={x:f.clip.x??.5,y:f.clip.y??.5,s:A.size(f.clip),r:f.clip.rotation||0}; }); }
  const dx=(c.x??.5)-d.x0, dy=(c.y??.5)-d.y0, k=A.size(c)/(d.s0||1), dr=(c.rotation||0)-d.r0;
  for(const id in d.__m){ const f=A.find(id); if(!f) continue; const o=d.__m[id], o2=f.clip;
    if(d.k==="move"){ o2.x=Math.min(1.2,Math.max(-.2,o.x+dx)); o2.y=Math.min(1.2,Math.max(-.2,o.y+dy)); }
    else if(d.k==="rot"){ o2.rotation=Math.round(((((o.r+dr)+540)%360)-180)*10)/10; }
    else { A.setSize(o2,o.s*k); } }
});
/* one panel note for the group */
A.panels.push((ex,f)=>{
  const c=f.clip; if(!c.pip) return; const n=c.pip.main?A.pipsOf(c.pip.main).length:0;
  const w=document.createElement("div");
  if(M.size>1&&M.has(c.id)){
    w.innerHTML='<div class="pp-note"><b>'+M.size+' PiPs selected.</b> Drag on the preview to move them together; corners resize all by the same ratio; the knob rotates all.</div><div class="pp-row"><button class="pp-btn" data-m="clear">Select only this one</button></div>';
  } else if(n>1){
    w.innerHTML='<div class="pp-row"><button class="pp-btn" data-m="all" title="Shift-click PiPs on the preview to pick several">Select all '+n+' PiPs</button></div>';
  } else return;
  w.onclick=e=>{ const b=e.target.closest("[data-m]"); if(!b) return; e.stopPropagation(); if(b.dataset.m==="all") A.selectAllPips(c.pip.main); else { M.clear(); try{ A.refreshOverlay(); renderInspector(); }catch(_){} } };
  ex.appendChild(w);
});
A.mainPanels.push((g,f)=>{ const n=A.pipsOf(f.clip.id).length; if(n<2) return;
  const r=document.createElement("div"); r.className="pp-row"; r.innerHTML='<button class="pp-btn">Select all '+n+' PiPs</button>';
  r.querySelector("button").onclick=e=>{ e.stopPropagation(); A.selectAllPips(f.clip.id); }; g.appendChild(r); });
try{ window.AMIYO_EDITOR_BUILD="pip-step100-multiselect"; }catch(_){}
})();

;
/* ==================== Script 580 id="amiyo-step101-smartrows" ==================== */
(function(){"use strict";
if(window.AMIYO_SMARTROWS) return;
var KEY="amiyo.smartrows", root=document.documentElement, q=0;
function on(){ try{ if(localStorage.getItem(KEY)==="0") return false; }catch(e){} return !matchMedia("(max-width:1024px)").matches && !matchMedia("(pointer:coarse)").matches; }
function fit(){
  q=0; var sc=document.getElementById("timelineScroll"), tr=document.getElementById("tracks"), ru=document.getElementById("ruler");
  if(!sc||!tr) return;
  if(!on()){ root.classList.remove("amiyo-smartrows"); return; }
  var n=tr.querySelectorAll(".track-row").length||1, avail=sc.clientHeight-(ru?ru.offsetHeight:28)-2;
  var h=Math.max(34,Math.min(64,Math.floor(avail/n)));
  root.style.setProperty("--sr-h",h+"px"); root.classList.add("amiyo-smartrows");
}
function sched(){ if(q) return; q=setTimeout(fit,60); }
window.AMIYO_SMARTROWS={fit:fit,enabled:on,set:function(v){ try{ localStorage.setItem(KEY,v?"1":"0"); }catch(e){} fit(); }};
function init(){ var tr=document.getElementById("tracks"), sc=document.getElementById("timelineScroll"); if(!tr||!sc) return setTimeout(init,300);
  new MutationObserver(sched).observe(tr,{childList:true});
  if(window.ResizeObserver) new ResizeObserver(sched).observe(sc);
  addEventListener("resize",sched); fit(); }
init();
})();

;
/* ==================== Script 581 id="amiyo-step102-autogrow" ==================== */
/* Step 102: the timeline panel grows by itself when tracks are added (e.g. several PiPs), up to ~48% of the centre column.
   It never fights you: if you have dragged the divider yourself, your saved height is kept. */
(function(){"use strict";
if(window.AMIYO_AUTOGROW) return;
var HK="amiyo.editor.timelineH", ON="amiyo.autogrow", lastN=0, q=0;
function manual(){ try{ return parseFloat(localStorage.getItem(HK))>0; }catch(e){ return false; } }
function enabled(){ try{ if(localStorage.getItem(ON)==="0") return false; }catch(e){} return !matchMedia("(max-width:1024px)").matches; }
function grow(){
  q=0; var c=document.querySelector(".center"), tl=document.querySelector(".timeline"), sc=document.getElementById("timelineScroll"), tr=document.getElementById("tracks");
  if(!c||!tl||!sc||!tr||!enabled()||manual()) return;
  var n=tr.querySelectorAll(".track-row").length; if(n<=lastN){ lastN=n; return; } lastN=n;
  var ru=document.getElementById("ruler"), chrome=tl.getBoundingClientRect().height-sc.clientHeight+(ru?ru.offsetHeight:28);
  var want=chrome+n*42, cap=Math.round(c.clientHeight*.48), cur=tl.getBoundingClientRect().height;
  var h=Math.round(Math.max(cur,Math.min(want,cap)));
  if(h>cur+4){ c.style.gridTemplateRows="minmax(0,1fr) "+h+"px"; window.dispatchEvent(new Event("resize")); }
}
function sched(){ if(!q) q=setTimeout(grow,120); }
window.AMIYO_AUTOGROW={run:grow,set:function(v){ try{ localStorage.setItem(ON,v?"1":"0"); }catch(e){} }};
function init(){ var tr=document.getElementById("tracks"); if(!tr) return setTimeout(init,300);
  lastN=tr.querySelectorAll(".track-row").length; new MutationObserver(sched).observe(tr,{childList:true}); }
init();
})();

;
/* ==================== Script 582 id="amiyo-step103-pipx" ==================== */
/* Step 103: "PiP+" menu - one place for the multi-overlay tools added in steps 104-120, plus helpers that make every tool undoable. */
(function(){"use strict";
if(window.AMIYO_PIPX) return;
var items=[], X=window.AMIYO_PIPX={items:items,v:103};
X.add=function(o){ if(!o||!o.id) return; var i=items.findIndex(function(x){return x.id===o.id;}); if(i>=0) items[i]=o; else items.push(o); };
X.pips=function(){ var out=[]; project.tracks.forEach(function(t){ if(t.kind!=="video") return; t.clips.forEach(function(c){ if(c.pip) out.push({track:t,clip:c}); }); }); return out; };
X.pipTracks=function(){ return project.tracks.filter(function(t){ return t.kind==="video"&&t.clips.length&&t.clips.every(function(c){return !!c.pip;}); }); };
X.sel=function(){ for(var i=0;i<project.tracks.length;i++){ var t=project.tracks[i]; for(var j=0;j<t.clips.length;j++) if(t.clips[j].id===selectedClipId) return {track:t,clip:t.clips[j]}; } return null; };
X.toast=function(m,ms){ try{ toast(m,ms||2600); }catch(e){} };
X.change=function(label,fn){ var before=deepClone(serializableProject()), r; try{ r=fn(); }catch(e){ try{ window.__swl&&window.__swl(e); }catch(_){} X.toast("Could not do that"); return false; }
  if(r===false) return false;
  try{ recordHistory(label,before,deepClone(serializableProject())); scheduleAutosave(); renderAll(); renderPreviewFrame(); }catch(e){ try{ window.__swl&&window.__swl(e); }catch(_){} } return true; };
var menu=null;
function close(){ if(menu){ menu.remove(); menu=null; document.removeEventListener("pointerdown",away,true); document.removeEventListener("keydown",esc,true); } }
function away(e){ if(menu&&!menu.contains(e.target)&&e.target.id!=="pipxBtn") close(); }
function esc(e){ if(e.key==="Escape") close(); }
function open(){
  close(); var b=document.getElementById("pipxBtn"); if(!b) return;
  menu=document.createElement("div"); menu.id="pipxMenu"; menu.setAttribute("role","menu");
  var groups={}, order=[]; items.forEach(function(it){ var g=it.group||"Tools"; if(!groups[g]){ groups[g]=[]; order.push(g); } groups[g].push(it); });
  var n=X.pips().length, h="";
  order.forEach(function(g){ h+="<h5>"+g+"</h5>"; groups[g].forEach(function(it){ var dis=it.needs!==false&&!n&&it.needs!==undefined?" disabled":""; h+='<button type="button" role="menuitem" data-id="'+it.id+'"'+dis+'>'+it.label+(it.hint?"<small>"+it.hint+"</small>":"")+"</button>"; }); });
  if(!items.length) h='<h5>PiP tools</h5><button disabled>No tools loaded</button>';
  menu.innerHTML=h; document.body.appendChild(menu);
  var r=b.getBoundingClientRect(); menu.style.left=Math.max(6,Math.min(innerWidth-menu.offsetWidth-6,r.left))+"px";
  var top=r.top-menu.offsetHeight-6; menu.style.top=(top<6?r.bottom+6:top)+"px";
  menu.onclick=function(e){ var bt=e.target.closest("button[data-id]"); if(!bt||bt.disabled) return; var it=items.find(function(x){return x.id===bt.dataset.id;}); close(); if(it&&it.run){ try{ it.run(); }catch(err){ try{ window.__swl&&window.__swl(err); }catch(_){} X.toast("Could not do that"); } } };
  document.addEventListener("pointerdown",away,true); document.addEventListener("keydown",esc,true);
}
X.open=open; X.close=close;
function mk(){ if(document.getElementById("pipxBtn")) return true; var bar=document.querySelector(".timeline-toolbar"); if(!bar) return false;
  var b=document.createElement("span"); b.id="pipxBtn"; b.className="toolbtn badge"; b.setAttribute("role","button"); b.tabIndex=0; b.textContent="PiP+"; b.title="More tools for working with many overlays"; b.setAttribute("aria-haspopup","menu");
  function tog(){ if(menu) close(); else open(); }
  b.onclick=tog; b.onkeydown=function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); tog(); } };
  var z=bar.querySelector("label[style*='margin-left']"); bar.insertBefore(b,z||null); return true; }
var tries=0; (function wait(){ if(mk()||++tries>80) return; setTimeout(wait,400); })();
new MutationObserver(function(){ if(!document.getElementById("pipxBtn")) mk(); }).observe(document.body,{childList:true,subtree:true});
X.add({id:"about",group:"Info",label:"PiP+ tools loaded",hint:"v103",needs:false,run:function(){ X.toast("PiP+ menu is ready"); }});
})();

;
/* ==================== Script 583 id="amiyo-step104-tags" ==================== */
/* Step 104: every PiP clip on the timeline shows its shape glyph + size and a stripe in its border colour, so overlays are easy to tell apart. */
(function(){"use strict";
if(window.AMIYO_PIPTAGS) return;
var G={circle:"●",square:"■",rsquare:"▢",rect:"▬",rounded:"▭",oval:"⬭",diamond:"◆",triangle:"▲",hexagon:"⬢",star:"★",heart:"♥"}, q=0, busy=false;
function run(){
  q=0; var tr=document.getElementById("tracks"); if(!tr||busy) return; busy=true;
  try{
    var map={}; project.tracks.forEach(function(t){ t.clips.forEach(function(c){ map[c.id]=c; }); });
    tr.querySelectorAll(".clip[data-clip]").forEach(function(el){
      var c=map[el.dataset.clip], t=el.querySelector(":scope>.pipx-tag");
      if(!c||!c.pip){ if(t) t.remove(); if(el.hasAttribute("data-pipx")){ el.removeAttribute("data-pipx"); el.style.removeProperty("--pipc"); } return; }
      var p=c.pip, col=p.color||"#ffffff", sz=Math.round((p.size||0)*100), txt=(G[p.shape]||"▣")+" "+(sz?sz+"%":"PiP");
      if(!t){ t=document.createElement("span"); t.className="pipx-tag"; el.appendChild(t); }
      if(t.textContent!==txt) t.textContent=txt;
      if(el.style.getPropertyValue("--pipc")!==col) el.style.setProperty("--pipc",col);
      if(!el.hasAttribute("data-pipx")) el.setAttribute("data-pipx","1");
    });
  }catch(e){ try{ window.__swl&&window.__swl(e); }catch(_){} }
  busy=false;
}
function sched(){ if(!q) q=setTimeout(run,120); }
window.AMIYO_PIPTAGS={run:run};
function init(){ var tr=document.getElementById("tracks"); if(!tr) return setTimeout(init,300);
  new MutationObserver(function(r){ for(var i=0;i<r.length;i++){ var n=r[i].addedNodes; for(var j=0;j<n.length;j++){ if(n[j].nodeType===1&&!(n[j].classList&&n[j].classList.contains("pipx-tag"))){ sched(); return; } } if(r[i].type==="attributes"){ sched(); return; } } }).observe(tr,{childList:true,subtree:true});
  setInterval(function(){ if(!document.hidden) run(); },1500); run(); }
init();
})();

;
/* ==================== Script 584 id="amiyo-step105-collapse" ==================== */
/* Step 105: PiP+ > "Collapse / expand PiP tracks" hides every track that holds only overlays, so the main video, audio and text stay in view. The preview and export are not affected. */
(function(){"use strict";
var X=window.AMIYO_PIPX; if(!X||window.AMIYO_PIPCOLLAPSE) return;
var q=0, on=false;
function mark(){
  q=0; var tr=document.getElementById("tracks"); if(!tr) return;
  var rows=tr.querySelectorAll(":scope>.track-row"), set=new Set(X.pipTracks().map(function(t){return t.id;}));
  if(rows.length!==project.tracks.length) return;
  rows.forEach(function(r,i){ var is=set.has(project.tracks[i].id); if(is!==r.hasAttribute("data-pipx-row")){ if(is) r.setAttribute("data-pipx-row","1"); else r.removeAttribute("data-pipx-row"); } });
  var b=document.getElementById("pipxBtn"); if(b){ if(on) b.setAttribute("data-collapsed","1"); else b.removeAttribute("data-collapsed"); }
}
function sched(){ if(!q) q=setTimeout(mark,80); }
function set(v){ on=!!v; document.body.classList.toggle("pipx-collapsed",on); mark();
  try{ window.dispatchEvent(new Event("resize")); }catch(e){}
  var n=X.pipTracks().length; X.toast(on?(n+" PiP track"+(n===1?"":"s")+" hidden from the timeline (still in your video)"):"PiP tracks shown",2800); }
window.AMIYO_PIPCOLLAPSE={set:set,toggle:function(){ set(!on); },isOn:function(){ return on; }};
X.add({id:"collapse",group:"Timeline",label:"Collapse / expand PiP tracks",hint:"timeline only",needs:true,run:function(){ set(!on); }});
function init(){ var tr=document.getElementById("tracks"); if(!tr) return setTimeout(init,300); new MutationObserver(sched).observe(tr,{childList:true}); mark(); }
init();
})();

;
/* ==================== Script 585 id="amiyo-step106-isolate" ==================== */
/* Step 106: PiP+ > "Isolate selected PiP" hides every other overlay track so you can focus on one. Run it again (or use "Show all") to bring them back exactly as they were. */
(function(){"use strict";
var X=window.AMIYO_PIPX; if(!X||window.AMIYO_PIPISO) return;
var hid=[];
function refresh(){ try{ renderAll(); renderPreviewFrame(); scheduleAutosave(); }catch(e){} }
function restore(quiet){ if(!hid.length) return false; var n=0; hid.forEach(function(id){ var t=project.tracks.find(function(x){return x.id===id;}); if(t){ t.hidden=false; n++; } }); hid=[]; refresh(); if(!quiet) X.toast("All PiPs shown again"); return n>0; }
function isolate(){
  if(hid.length){ restore(); return; }
  var s=X.sel(); if(!s||!s.clip.pip){ X.toast("Select a PiP clip first"); return; }
  var others=X.pipTracks().filter(function(t){ return t.id!==s.track.id&&!t.hidden; });
  if(!others.length){ X.toast("There are no other PiPs to hide"); return; }
  others.forEach(function(t){ t.hidden=true; hid.push(t.id); }); refresh();
  X.toast("Showing only this PiP · run again to show all",3200);
}
window.AMIYO_PIPISO={isolate:isolate,restore:restore,active:function(){ return hid.length>0; }};
X.add({id:"isolate",group:"Focus",label:"Isolate selected PiP",hint:"toggle",needs:true,run:isolate});
X.add({id:"showall",group:"Focus",label:"Show all PiPs",needs:true,run:function(){ if(!restore()) X.toast("Nothing was hidden"); }});
})();

;
/* ==================== Script 586 id="amiyo-step107-allpips" ==================== */
/* Step 107: PiP+ > hide, lock or mute every PiP track at once. If any is off, all go on; if all are on, all go off. Each is one undo step. */
(function(){"use strict";
var X=window.AMIYO_PIPX; if(!X||window.AMIYO_PIPALL) return;
function flip(prop,label,onMsg,offMsg){
  var ts=X.pipTracks(); if(!ts.length){ X.toast("No PiP tracks yet"); return; }
  var turnOn=ts.some(function(t){ return !t[prop]; });
  X.change(label,function(){ ts.forEach(function(t){ t[prop]=turnOn; }); });
  X.toast((turnOn?onMsg:offMsg)+" ("+ts.length+")",2400);
}
window.AMIYO_PIPALL={hide:function(){ flip("hidden","Hide all PiPs","PiPs hidden","PiPs shown"); },lock:function(){ flip("locked","Lock all PiPs","PiP tracks locked","PiP tracks unlocked"); },mute:function(){ flip("muted","Mute all PiPs","PiP sound muted","PiP sound on"); }};
X.add({id:"hideall",group:"All PiPs",label:"Hide / show all",needs:true,run:window.AMIYO_PIPALL.hide});
X.add({id:"lockall",group:"All PiPs",label:"Lock / unlock all",needs:true,run:window.AMIYO_PIPALL.lock});
X.add({id:"muteall",group:"All PiPs",label:"Mute / unmute all sound",needs:true,run:window.AMIYO_PIPALL.mute});
})();

;
/* ==================== Script 587 id="amiyo-step108-fit" ==================== */
/* Step 108: PiP+ > "Fit all PiPs inside frame" - nudges every overlay (and shrinks any that is bigger than the frame) so no shape is cut off. Rotation is taken into account. */
(function(){"use strict";
var X=window.AMIYO_PIPX; if(!X||window.AMIYO_PIPFIT) return;
var M=.02;
function bounds(c){
  var d=AMIYO_PIP.boxDims(c), W=project.settings.width||1280, H=project.settings.height||720, r=(c.rotation||0)*Math.PI/180;
  var wp=d.w*W, hp=d.h*H, ca=Math.abs(Math.cos(r)), sa=Math.abs(Math.sin(r));
  return {w:(wp*ca+hp*sa)/W, h:(wp*sa+hp*ca)/H};
}
function fitOne(c){
  var b=bounds(c), lim=1-2*M, moved=false, k=Math.min(lim/b.w,lim/b.h);
  if(k<1){ var s=c.scale||1; c.scale=s*k; if(c.pip&&c.pip.size) c.pip.size=c.pip.size*k; b=bounds(c); moved=true; }
  var x=c.x==null?.5:c.x, y=c.y==null?.5:c.y, hx=b.w/2, hy=b.h/2;
  var nx=Math.min(1-M-hx,Math.max(M+hx,x)), ny=Math.min(1-M-hy,Math.max(M+hy,y));
  if(Math.abs(nx-x)>1e-4||Math.abs(ny-y)>1e-4){ c.x=nx; c.y=ny; moved=true; }
  return moved;
}
function run(sel){
  var list=X.pips(); if(sel){ var s=X.sel(); list=s&&s.clip.pip?[s]:[]; }
  if(!list.length){ X.toast(sel?"Select a PiP clip first":"No PiPs yet"); return 0; }
  var n=0; X.change("Fit PiPs inside frame",function(){ list.forEach(function(o){ if(fitOne(o.clip)) n++; }); if(!n) return false; });
  X.toast(n?(n+" PiP"+(n===1?"":"s")+" moved inside the frame"):"Every PiP is already inside the frame",2600); return n;
}
window.AMIYO_PIPFIT={run:run,fitOne:fitOne,bounds:bounds};
X.add({id:"fitall",group:"Layout",label:"Fit all PiPs inside frame",needs:true,run:function(){ run(false); }});
X.add({id:"fitsel",group:"Layout",label:"Fit selected PiP inside frame",needs:true,run:function(){ run(true); }});
})();

;
/* ==================== Script 588 id="amiyo-step109-trim" ==================== */
/* Step 109: PiP+ > "Trim PiPs to their main clip" - an overlay that starts before, or runs past, the main clip it belongs to is cut to fit, so nothing floats over the wrong footage. */
(function(){"use strict";
var X=window.AMIYO_PIPX; if(!X||window.AMIYO_PIPTRIM) return;
function find(id){ for(var i=0;i<project.tracks.length;i++){ var t=project.tracks[i]; for(var j=0;j<t.clips.length;j++) if(t.clips[j].id===id) return t.clips[j]; } return null; }
function scan(){
  var out=[]; X.pips().forEach(function(o){ var c=o.clip, m=c.pip.main&&find(c.pip.main); if(!m) return;
    var ms=m.start, me=m.start+m.duration, cs=c.start, ce=c.start+c.duration;
    if(ce<=ms+.05||cs>=me-.05) out.push({o:o,kind:"outside"}); else if(cs<ms-.01||ce>me+.01) out.push({o:o,kind:"trim",from:Math.max(cs,ms),to:Math.min(ce,me)}); });
  return out;
}
function run(){
  var list=scan(); if(!list.length){ X.toast("Every PiP already sits inside its main clip"); return {trimmed:0,outside:0}; }
  var tr=list.filter(function(x){return x.kind==="trim";}), out=list.length-tr.length;
  if(tr.length) X.change("Trim PiPs to main clip",function(){ tr.forEach(function(x){ var c=x.o.clip, sp=c.speed||1, d=x.from-c.start;
      if(d>0){ c.inPoint=(c.inPoint||0)+d*sp; c.start=x.from; }
      c.duration=Math.max(.2,x.to-c.start); c.outPoint=(c.inPoint||0)+c.duration*sp; }); });
  X.toast((tr.length?tr.length+" PiP"+(tr.length===1?"":"s")+" trimmed":"")+(tr.length&&out?" · ":"")+(out?out+" lie completely outside their main clip":""),3400);
  return {trimmed:tr.length,outside:out};
}
window.AMIYO_PIPTRIM={run:run,scan:scan};
X.add({id:"trimmain",group:"Timing",label:"Trim PiPs to their main clip",needs:true,run:run});
})();

;
/* ==================== Script 589 id="amiyo-step110-sequence" ==================== */
/* Step 110: PiP+ > "Sequence PiPs one after another" - lines up the overlays of one main clip in their current order with a small gap, so they appear in turn instead of all at once. If they do not fit, each is shortened equally. */
(function(){"use strict";
var X=window.AMIYO_PIPX; if(!X||window.AMIYO_PIPSEQ) return;
function find(id){ for(var i=0;i<project.tracks.length;i++){ var t=project.tracks[i]; for(var j=0;j<t.clips.length;j++) if(t.clips[j].id===id) return t.clips[j]; } return null; }
function run(gap){
  gap=gap==null?.3:gap; var s=X.sel(), mainId=s&&s.clip.pip?s.clip.pip.main:null, all=X.pips();
  if(!mainId&&all.length) mainId=all[0].clip.pip.main;
  var m=mainId&&find(mainId), g=all.filter(function(o){ return o.clip.pip.main===mainId; });
  if(!m||g.length<2){ X.toast("Need two or more PiPs on one main clip"); return 0; }
  g.sort(function(a,b){ return a.clip.start-b.clip.start||0; });
  var n=g.length, avail=m.duration-gap*(n-1), sum=g.reduce(function(a,o){return a+o.clip.duration;},0), k=sum>avail?Math.max(.05,avail/sum):1;
  X.change("Sequence PiPs",function(){ var t=m.start;
    g.forEach(function(o){ var c=o.clip, sp=c.speed||1, d=Math.max(.3,c.duration*k); c.start=t; c.duration=d; c.outPoint=(c.inPoint||0)+d*sp; t+=d+gap; }); });
  X.toast(n+" PiPs lined up"+(k<1?" (shortened to fit)":""),2800); return n;
}
window.AMIYO_PIPSEQ={run:run};
X.add({id:"sequence",group:"Timing",label:"Sequence PiPs one after another",needs:true,run:function(){ run(.3); }});
})();

;
/* ==================== Script 590 id="amiyo-step111-merge" ==================== */
/* Step 111: PiP+ > "Merge PiP tracks" - packs overlays that do not overlap in time onto as few tracks as possible (tracks with different mute/hide/lock settings are kept apart). Empty tracks are removed. */
(function(){"use strict";
var X=window.AMIYO_PIPX; if(!X||window.AMIYO_PIPMERGE) return;
var E=1e-6;
function sig(t){ return [!!t.muted,!!t.hidden,!!t.locked].join(); }
function free(t,c){ return t.clips.every(function(k){ return c.start+c.duration<=k.start+E||c.start>=k.start+k.duration-E; }); }
function run(){
  var src=X.pipTracks(); if(src.length<2){ X.toast("Fewer than two PiP tracks - nothing to merge"); return 0; }
  var before=src.length, ok=false;
  X.change("Merge PiP tracks",function(){
    var targets=[], moves=[];
    src.forEach(function(t){ t.clips.slice().sort(function(a,b){return a.start-b.start;}).forEach(function(c){
      var tg=targets.find(function(x){ return sig(x)===sig(t)&&free(x,c)&&x._k; });
      if(!tg){ tg=targets.find(function(x){ return sig(x)===sig(t)&&free(x,c); }); }
      if(!tg){ tg=t; targets.push(tg); } else if(tg!==t) moves.push([c,t,tg]);
      if(tg===t&&targets.indexOf(t)<0) targets.push(t); }); });
    /* the loop above keeps clips on their own track unless another target can take them */
    moves.forEach(function(m){ var c=m[0],from=m[1],to=m[2]; from.clips.splice(from.clips.indexOf(c),1); to.clips.push(c); if(selectedTrackId===from.id&&selectedClipId===c.id) selectedTrackId=to.id; });
    src.forEach(function(t){ if(!t.clips.length){ var i=project.tracks.indexOf(t); if(i>=0) project.tracks.splice(i,1); } });
    ok=moves.length>0; if(!ok) return false; });
  var after=X.pipTracks().length;
  X.toast(ok?("PiP tracks: "+before+" → "+after):"Overlays overlap in time, so they need separate tracks",3000); return before-after;
}
window.AMIYO_PIPMERGE={run:run};
X.add({id:"merge",group:"Tracks",label:"Merge PiP tracks",hint:"fewer rows",needs:true,run:run});
})();

;
/* ==================== Script 591 id="amiyo-step112-empty" ==================== */
/* Step 112: PiP+ > "Remove empty tracks" - deletes tracks with no clips, always keeping the first track of every kind (Video 1, Audio 1, ...) so the project never loses its basic layout. */
(function(){"use strict";
var X=window.AMIYO_PIPX; if(!X||window.AMIYO_EMPTYTRK) return;
function list(){ var seen={}; return project.tracks.filter(function(t){ var first=!seen[t.kind]; seen[t.kind]=true; return !first&&!t.clips.length; }); }
function run(){
  var del=list(); if(!del.length){ X.toast("No empty extra tracks"); return 0; }
  X.change("Remove empty tracks",function(){ del.forEach(function(t){ var i=project.tracks.indexOf(t); if(i>=0) project.tracks.splice(i,1); if(selectedTrackId===t.id) selectedTrackId=project.tracks[0]&&project.tracks[0].id; }); });
  X.toast(del.length+" empty track"+(del.length===1?"":"s")+" removed",2400); return del.length;
}
window.AMIYO_EMPTYTRK={run:run,list:list};
X.add({id:"emptytracks",group:"Tracks",label:"Remove empty tracks",needs:false,run:run});
})();

;
/* ==================== Script 592 id="amiyo-step113-dup" ==================== */
/* Step 113: duplicate the selected PiP (PiP+ menu, or Alt+D). The copy sits on a new track just above, at the same time, nudged down-right and kept inside the frame, and becomes the selection. */
(function(){"use strict";
var X=window.AMIYO_PIPX; if(!X||window.AMIYO_PIPDUP) return;
function run(){
  var s=X.sel(); if(!s||!s.clip.pip){ X.toast("Select a PiP clip first"); return null; }
  var copy=null;
  X.change("Duplicate PiP",function(){
    copy=deepClone(s.clip); copy.id=uid("clip"); if(copy.pip){ copy.pip.sig=null; copy.pip.sig2=null; }
    copy.x=(copy.x==null?.5:copy.x)+.06; copy.y=(copy.y==null?.5:copy.y)+.06;
    if(window.AMIYO_PIPFIT) window.AMIYO_PIPFIT.fitOne(copy);
    var t=deepClone(s.track); t.id=uid("track"); t.clips=[copy]; t.name=(s.track.name||"PiP").replace(/\s*copy\s*\d*$/i,"")+" copy";
    project.tracks.splice(project.tracks.indexOf(s.track)+1,0,t); selectedClipId=copy.id; selectedTrackId=t.id; });
  X.toast("PiP duplicated",1800); return copy;
}
window.AMIYO_PIPDUP={run:run};
X.add({id:"dup",group:"Edit",label:"Duplicate selected PiP",hint:"Alt+D",needs:true,run:run});
document.addEventListener("keydown",function(e){
  if(!e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.key.toLowerCase()!=="d") return;
  var t=e.target; if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable)) return;
  var s=X.sel(); if(!s||!s.clip.pip) return; e.preventDefault(); e.stopPropagation(); run();
},true);
})();

;
/* ==================== Script 593 id="amiyo-step114-layerkeys" ==================== */
/* Step 114: layer order on the keyboard - Alt+] bring forward, Alt+[ send backward, Alt+Shift+] to front, Alt+Shift+[ to back (the PiP+ menu has the same). Uses the editor's own layer logic, so undo works. */
(function(){"use strict";
var X=window.AMIYO_PIPX, A=window.AMIYO_PIP; if(!X||!A||!A.moveLayer||window.AMIYO_LAYERKEYS) return;
function go(how){ var s=X.sel(); if(!s||!s.clip.pip){ X.toast("Select a PiP clip first"); return false; } var r=A.moveLayer(s.clip.id,how); if(r!==false){ try{ renderAll(); renderPreviewFrame(); }catch(e){} } return r!==false; }
window.AMIYO_LAYERKEYS={go:go};
X.add({id:"lfront",group:"Layer order",label:"Bring to front",hint:"Alt+Shift+]",needs:true,run:function(){ go("front"); }});
X.add({id:"lfwd",group:"Layer order",label:"Bring forward",hint:"Alt+]",needs:true,run:function(){ go("fwd"); }});
X.add({id:"lback",group:"Layer order",label:"Send backward",hint:"Alt+[",needs:true,run:function(){ go("back"); }});
X.add({id:"lrear",group:"Layer order",label:"Send to back",hint:"Alt+Shift+[",needs:true,run:function(){ go("rear"); }});
document.addEventListener("keydown",function(e){
  if(!e.altKey||e.ctrlKey||e.metaKey||(e.code!=="BracketRight"&&e.code!=="BracketLeft")) return;
  var t=e.target; if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable)) return;
  var s=X.sel(); if(!s||!s.clip.pip) return; e.preventDefault(); e.stopPropagation();
  go(e.code==="BracketRight"?(e.shiftKey?"front":"fwd"):(e.shiftKey?"rear":"back"));
},true);
})();

;
/* ==================== Script 594 id="amiyo-step115-jump" ==================== */
/* Step 115: Alt+. jumps the playhead to the next PiP start/end, Alt+, to the previous one (also in the PiP+ menu). */
(function(){"use strict";
var X=window.AMIYO_PIPX; if(!X||window.AMIYO_PIPJUMP) return;
function points(){ var s={}; X.pips().forEach(function(o){ s[(+o.clip.start).toFixed(3)]=1; s[(+(o.clip.start+o.clip.duration)).toFixed(3)]=1; }); return Object.keys(s).map(Number).sort(function(a,b){return a-b;}); }
function go(dir){
  var p=points(); if(!p.length){ X.toast("No PiPs yet"); return null; } var now=+currentTime, e=.02, t=null;
  if(dir>0){ for(var i=0;i<p.length;i++) if(p[i]>now+e){ t=p[i]; break; } } else { for(var j=p.length-1;j>=0;j--) if(p[j]<now-e){ t=p[j]; break; } }
  if(t==null){ X.toast(dir>0?"No later PiP edge":"No earlier PiP edge",1600); return null; }
  try{ setCurrentTime(t); }catch(e2){ currentTime=t; try{ renderPreviewFrame(); }catch(_){} }
  var sc=document.getElementById("timelineScroll"); try{ var px=timeToPx(t); if(sc&&(px<sc.scrollLeft||px>sc.scrollLeft+sc.clientWidth-labelW()-20)) sc.scrollLeft=Math.max(0,px-sc.clientWidth/3); }catch(_){}
  return t;
}
window.AMIYO_PIPJUMP={go:go,points:points};
X.add({id:"jnext",group:"Jump",label:"Next PiP start / end",hint:"Alt+.",needs:true,run:function(){ go(1); }});
X.add({id:"jprev",group:"Jump",label:"Previous PiP start / end",hint:"Alt+,",needs:true,run:function(){ go(-1); }});
document.addEventListener("keydown",function(e){
  if(!e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||(e.code!=="Period"&&e.code!=="Comma")) return;
  var t=e.target; if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable)) return;
  e.preventDefault(); e.stopPropagation(); go(e.code==="Period"?1:-1);
},true);
})();

;
/* ==================== Script 595 id="amiyo-step116-chip" ==================== */
/* Step 116: a small chip at the bottom of the timeline: how many PiPs are showing at the playhead, out of how many you have. Click it to open PiP+. */
(function(){"use strict";
var X=window.AMIYO_PIPX; if(!X||window.AMIYO_PIPCHIP) return;
var chip=null, last="";
function count(){ var t=+currentTime||0, total=0, now=0; X.pips().forEach(function(o){ total++; var tr=o.track; if(!tr.hidden&&!o.clip.off&&t>=o.clip.start-1e-6&&t<o.clip.start+o.clip.duration-1e-6) now++; }); return {total:total,now:now}; }
function tick(){
  var tl=document.querySelector(".timeline"); if(!tl) return;
  if(!chip){ chip=document.createElement("div"); chip.id="pipxChip"; chip.setAttribute("role","button"); chip.tabIndex=0; chip.title="PiPs showing at the playhead · click for PiP+ tools";
    chip.onclick=function(){ var b=document.getElementById("pipxBtn"); if(b) b.click(); }; chip.onkeydown=function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); chip.onclick(); } }; tl.appendChild(chip); }
  var c=count(), txt=c.total?("▣ "+c.now+" of "+c.total+" PiP"+(c.total===1?"":"s")+" at playhead"):"";
  if(txt===last) return; last=txt; chip.textContent=txt; chip.classList.toggle("on",!!txt);
}
window.AMIYO_PIPCHIP={tick:tick,text:function(){ return last; }};
setInterval(function(){ if(!document.hidden) try{ tick(); }catch(e){} },350); setTimeout(tick,600);
})();

;
/* ==================== Script 596 id="amiyo-step117-check" ==================== */
/* Step 117: PiP+ > "Check PiPs before export". Also runs quietly when you press Export and shows a one-line warning (it never blocks the export). */
(function(){"use strict";
var X=window.AMIYO_PIPX; if(!X||window.AMIYO_PIPCHECK) return;
function scan(){
  var out=[], ps=X.pips();
  var trim=window.AMIYO_PIPTRIM?window.AMIYO_PIPTRIM.scan():[]; if(trim.length) out.push({k:"trim",t:trim.length+" PiP"+(trim.length===1?" starts before or runs past":" start before or run past")+" its main clip",fix:"Trim to main",f:function(){ AMIYO_PIPTRIM.run(); }});
  var off=0; if(window.AMIYO_PIPFIT) ps.forEach(function(o){ var c=o.clip,b=AMIYO_PIPFIT.bounds(c),x=c.x==null?.5:c.x,y=c.y==null?.5:c.y; if(x-b.w/2<-.001||x+b.w/2>1.001||y-b.h/2<-.001||y+b.h/2>1.001) off++; });
  if(off) out.push({k:"fit",t:off+" PiP"+(off===1?" is":"s are")+" partly outside the frame",fix:"Fit inside frame",f:function(){ AMIYO_PIPFIT.run(false); }});
  var hid=ps.filter(function(o){ return o.track.hidden||o.clip.off; }).length; if(hid) out.push({k:"hid",t:hid+" PiP"+(hid===1?" is":"s are")+" hidden, so "+(hid===1?"it":"they")+" will not appear in the export",fix:"Show them",f:function(){ X.change("Show hidden PiPs",function(){ X.pips().forEach(function(o){ o.track.hidden=false; o.clip.off=false; }); }); }});
  var miss=ps.filter(function(o){ return o.clip.assetId&&!project.assets[o.clip.assetId]; }).length; if(miss) out.push({k:"miss",t:miss+" PiP"+(miss===1?" has":"s have")+" missing media (re-import the file)"});
  var orph=ps.filter(function(o){ var m=o.clip.pip.main; return !m||!project.tracks.some(function(t){ return t.clips.some(function(c){ return c.id===m; }); }); }).length; if(orph) out.push({k:"orph",t:orph+" PiP"+(orph===1?" is":"s are")+" not attached to a main clip"});
  var inv=ps.filter(function(o){ return (o.clip.opacity!=null&&o.clip.opacity<.03); }).length; if(inv) out.push({k:"inv",t:inv+" PiP"+(inv===1?" is":"s are")+" almost invisible (opacity under 3%)"});
  return out;
}
var dlg=null; function close(){ if(dlg){ dlg.remove(); dlg=null; } }
function show(){
  close(); var r=scan(), ps=X.pips().length;
  dlg=document.createElement("div"); dlg.id="pipxCheck"; dlg.setAttribute("role","dialog"); dlg.setAttribute("aria-modal","true");
  var h='<div class="box"><h3>PiP check</h3>';
  if(!ps) h+="<p>There are no PiPs in this project.</p>"; else if(!r.length) h+="<p>✓ All "+ps+" PiP"+(ps===1?"":"s")+" look good: inside the frame, inside their main clips, visible and linked.</p>";
  else h+="<p>"+r.length+" thing"+(r.length===1?"":"s")+" to look at:</p><ul>"+r.map(function(x){ return "<li>"+x.t+"</li>"; }).join("")+"</ul>";
  h+='<div class="row">'+r.filter(function(x){return x.f;}).map(function(x,i){ return '<button data-fx="'+i+'">'+x.fix+'</button>'; }).join("")+'<button class="pri" data-close>Done</button></div></div>';
  dlg.innerHTML=h; document.body.appendChild(dlg);
  var fixable=r.filter(function(x){return x.f;});
  dlg.onclick=function(e){ if(e.target===dlg||e.target.hasAttribute("data-close")) return close(); var b=e.target.closest("[data-fx]"); if(b){ fixable[+b.dataset.fx].f(); show(); } };
  dlg.addEventListener("keydown",function(e){ if(e.key==="Escape") close(); }); var pri=dlg.querySelector(".pri"); if(pri) pri.focus();
}
window.AMIYO_PIPCHECK={scan:scan,show:show};
X.add({id:"check",group:"Export",label:"Check PiPs before export",needs:false,run:show});
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("#exportBtn"); if(!b||!X.pips().length) return; var r=scan(); if(r.length) X.toast("⚠ "+r.length+" PiP issue"+(r.length===1?"":"s")+": "+r[0].t+" · PiP+ › Check PiPs",5200); },true);
})();

;
/* ==================== Script 597 id="amiyo-step118-keys" ==================== */
/* Step 118: PiP+ > "Shortcuts & settings" (or Alt+/). The list is built from the tools that are loaded, so it is always accurate. Also switches Smart rows and Auto-grow on or off. */
(function(){"use strict";
var X=window.AMIYO_PIPX; if(!X||window.AMIYO_PIPKEYS) return;
var dlg=null; function close(){ if(dlg){ dlg.remove(); dlg=null; } }
function lsOn(k){ try{ return localStorage.getItem(k)!=="0"; }catch(e){ return true; } }
function esc(s){ return String(s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function rows(){ return X.items.filter(function(i){ return i.hint&&/(Alt|Ctrl|Shift)\+/.test(i.hint); }).map(function(i){ return {k:i.hint,d:i.label}; }); }
function show(){
  close(); dlg=document.createElement("div"); dlg.id="pipxCheck"; dlg.setAttribute("role","dialog"); dlg.setAttribute("aria-modal","true");
  var r=rows().concat([{k:"Alt+/",d:"This list"}]);
  var h='<div class="box"><h3>PiP+ shortcuts</h3><table style="width:100%;border-collapse:collapse">'+r.map(function(x){ return '<tr><td style="padding:4px 0;white-space:nowrap"><kbd style="background:#241e15;border:1px solid #3a3226;border-radius:5px;padding:1px 7px;font:600 11px ui-monospace,monospace">'+esc(x.k)+'</kbd></td><td style="padding:4px 0 4px 12px">'+esc(x.d)+'</td></tr>'; }).join("")+'</table>';
  h+='<h3 style="margin-top:14px">Timeline behaviour</h3><div class="row"><button data-t="sr">Smart rows: '+(lsOn("amiyo.smartrows")?"On":"Off")+'</button><button data-t="ag">Auto-grow: '+(lsOn("amiyo.autogrow")?"On":"Off")+'</button></div>';
  h+='<div class="row"><button class="pri" data-close>Done</button></div></div>';
  dlg.innerHTML=h; document.body.appendChild(dlg);
  dlg.onclick=function(e){ if(e.target===dlg||e.target.hasAttribute("data-close")) return close(); var b=e.target.closest("[data-t]"); if(!b) return;
    if(b.dataset.t==="sr"&&window.AMIYO_SMARTROWS) window.AMIYO_SMARTROWS.set(!lsOn("amiyo.smartrows"));
    if(b.dataset.t==="ag"&&window.AMIYO_AUTOGROW) window.AMIYO_AUTOGROW.set(!lsOn("amiyo.autogrow"));
    show(); };
  dlg.addEventListener("keydown",function(e){ if(e.key==="Escape"){ e.stopPropagation(); close(); } }); dlg.querySelector(".pri").focus();
}
window.AMIYO_PIPKEYS={show:show,rows:rows};
X.add({id:"keys",group:"Info",label:"Shortcuts & settings",hint:"Alt+/",needs:false,run:show});
document.addEventListener("keydown",function(e){ if(!e.altKey||e.ctrlKey||e.metaKey||e.code!=="Slash") return; var t=e.target; if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable)) return; e.preventDefault(); e.stopPropagation(); if(dlg) close(); else show(); },true);
})();

;
/* ==================== Script 598 id="amiyo-step119-selftest" ==================== */
/* Step 119: PiP+ > "Run self-test" - checks that every PiP+ tool is loaded and working. It does not change your project (the only thing it toggles, Collapse, is put back). */
(function(){"use strict";
var X=window.AMIYO_PIPX; if(!X||window.AMIYO_PIPSELFTEST) return;
var wait=function(ms){ return new Promise(function(r){ setTimeout(r,ms); }); };
async function run(){
  var res=[]; function ok(name,pass,info){ res.push({n:name,p:!!pass,i:info||""}); }
  var mods=["AMIYO_SMARTROWS","AMIYO_AUTOGROW","AMIYO_PIPX","AMIYO_PIPTAGS","AMIYO_PIPCOLLAPSE","AMIYO_PIPISO","AMIYO_PIPALL","AMIYO_PIPFIT","AMIYO_PIPTRIM","AMIYO_PIPSEQ","AMIYO_PIPMERGE","AMIYO_EMPTYTRK","AMIYO_PIPDUP","AMIYO_LAYERKEYS","AMIYO_PIPJUMP","AMIYO_PIPCHIP","AMIYO_PIPCHECK","AMIYO_PIPKEYS"];
  var missing=mods.filter(function(m){ return !window[m]; }); ok("All tools loaded",!missing.length,missing.length?"missing: "+missing.join(", "):mods.length+" modules");
  ok("PiP+ menu has its tools",X.items.length>=18,X.items.length+" items");
  var b=document.getElementById("pipxBtn"); ok("PiP+ button visible",!!(b&&b.offsetParent));
  var n=X.pips().length; ok("PiPs found",true,n+" in project");
  if(n){
    window.AMIYO_PIPTAGS.run(); await wait(50); var tags=document.querySelectorAll("#tracks .pipx-tag").length; ok("Timeline tags match PiPs",tags===n,tags+" of "+n);
    var was=window.AMIYO_PIPCOLLAPSE.isOn(); window.AMIYO_PIPCOLLAPSE.set(!was); await wait(150); var vis=[].filter.call(document.querySelectorAll("#tracks .track-row"),function(r){ return r.offsetParent; }).length; window.AMIYO_PIPCOLLAPSE.set(was); await wait(150);
    ok("Collapse toggles rows",window.AMIYO_PIPCOLLAPSE.isOn()===was); 
    var sc=false; try{ window.AMIYO_PIPCHECK.scan(); window.AMIYO_PIPTRIM.scan(); window.AMIYO_PIPJUMP.points(); sc=true; }catch(e){}
    ok("Scans run without errors",sc);
    window.AMIYO_PIPCHIP.tick(); ok("Status chip shows",/PiP/.test(window.AMIYO_PIPCHIP.text()),window.AMIYO_PIPCHIP.text());
    var bd=X.pips()[0].clip, bb=window.AMIYO_PIPFIT.bounds(bd); ok("Frame maths gives sizes",bb.w>0&&bb.h>0&&isFinite(bb.w+bb.h));
    ok("Undo history available",typeof recordHistory==="function"&&typeof serializableProject==="function");
  }
  return {pass:res.filter(function(r){return r.p;}).length,fail:res.filter(function(r){return !r.p;}).length,list:res};
}
async function show(){
  var r=await run(), d=document.createElement("div"); d.id="pipxCheck"; d.setAttribute("role","dialog"); d.setAttribute("aria-modal","true");
  d.innerHTML='<div class="box"><h3>PiP+ self-test: '+(r.fail?r.fail+" problem"+(r.fail===1?"":"s"):"all "+r.pass+" checks passed")+'</h3><ul style="list-style:none;padding:0">'+r.list.map(function(x){ return '<li><b style="color:'+(x.p?"#6fd08c":"#ff6b6b")+'">'+(x.p?"✓":"✗")+"</b> "+x.n+(x.i?' <small style="color:#847a6b">· '+x.i+"</small>":"")+"</li>"; }).join("")+'</ul><div class="row"><button class="pri" data-close>Done</button></div></div>';
  document.body.appendChild(d); d.onclick=function(e){ if(e.target===d||e.target.hasAttribute("data-close")) d.remove(); }; d.querySelector(".pri").focus();
  d.addEventListener("keydown",function(e){ if(e.key==="Escape") d.remove(); });
}
window.AMIYO_PIPSELFTEST={run:run,show:show};
X.add({id:"selftest",group:"Info",label:"Run PiP+ self-test",needs:false,run:show});
})();

;
/* ==================== Script 599 id="vs122" ==================== */
(function(){ function lab(){ var a=document.getElementById("aiCmdBtn"), t=document.getElementById("tpBtn");
  if(a){ a.setAttribute("aria-label","Ask AI"); if(!a.title) a.title="Ask AI"; } if(t){ t.setAttribute("aria-label","Add text"); if(!t.title) t.title="Add text / templates"; } }
  lab(); setTimeout(lab,1500); })();

;
/* ==================== Script 600 id="vs123" ==================== */
(function(){
  if(window.__vs123) return; window.__vs123=1;
  var KEY="amiyo-video-theme", root=document.documentElement;
  function saved(){ try{ return localStorage.getItem(KEY); }catch(e){ return null; } }
  function apply(m){ root.setAttribute("data-theme",m); var b=document.getElementById("vsThemeBtn");
    if(b){ b.textContent=m==="light"?"\u263E":"\u2600"; b.title=m==="light"?"Switch to dark mode":"Switch to light mode"; b.setAttribute("aria-label",b.title); b.setAttribute("aria-pressed",m==="light"?"true":"false"); }
    try{ var mt=document.querySelector('meta[name="theme-color"]'); if(mt) mt.content=m==="light"?"#f3efe7":"#0a0908"; }catch(e){} }
  var mode=saved()||"dark";
  apply(mode);
  function toggle(){ mode=mode==="light"?"dark":"light"; try{ localStorage.setItem(KEY,mode); }catch(e){} apply(mode); }
  window.amiyoToggleTheme=toggle;
  var n=0, iv=setInterval(function(){
    var tb=document.querySelector(".topbar"); if(!tb||document.getElementById("vsThemeBtn")){ if(++n>40||document.getElementById("vsThemeBtn")) clearInterval(iv); return; }
    var b=document.createElement("button"); b.id="vsThemeBtn"; b.type="button"; b.onclick=toggle;
    var un=document.getElementById("undoBtn"), sp=tb.querySelector(".top-spacer");
    if(un&&un.parentNode===tb) tb.insertBefore(b,un); else if(sp) tb.insertBefore(b,sp.nextSibling); else tb.appendChild(b);
    apply(mode); clearInterval(iv);
  },300);
  document.addEventListener("keydown",function(e){ if(e.altKey&&!e.ctrlKey&&!e.metaKey&&(e.key==="l"||e.key==="L")&&!/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||"")){ e.preventDefault(); toggle(); } });
})();

;
/* ==================== Script 601 id="vs125" ==================== */
/* Step 6: colour accuracy. (1) Exports prefer VP9/AV1 with a higher bitrate: in testing, VP8 shifted colours by up to 12 levels while VP9/AV1 stayed within 3.
   (2) A colour probe reads the exact RGB/HEX value of any pixel in the preview. */
(function(){
  if(window.__vs125) return; window.__vs125=1;
  var KEY="amiyo-color-accurate", on=true;
  try{ var sv=localStorage.getItem(KEY); if(sv!==null) on=sv==="1"; }catch(e){}
  window.amiyoColorAccurate=function(v){ if(v===undefined) return on; on=!!v; try{ localStorage.setItem(KEY,on?"1":"0"); }catch(e){} return on; };
  var MR=window.MediaRecorder; if(MR&&MR.isTypeSupported){
    var its=MR.isTypeSupported.bind(MR);
    function hq(){ return its("video/webm;codecs=vp9")||its("video/webm;codecs=av1"); }
    var wrapped=function(m){ m=String(m); if(on&&/^video\//i.test(m)&&/mp4|avc|h264|vp8/i.test(m)&&!/vp9|av01|av1/i.test(m)&&hq()) return false; return its(m); };
    var NewMR=function(stream,opts){
      opts=opts?Object.assign({},opts):{};
      if(on&&stream&&stream.getVideoTracks&&stream.getVideoTracks().length){
        if(!opts.mimeType&&its("video/webm;codecs=vp9")) opts.mimeType="video/webm;codecs=vp9";
        if(/^video\/webm/.test(opts.mimeType||"")&&/vp9|av01/.test(opts.mimeType)){
          var s=(stream.getVideoTracks()[0].getSettings&&stream.getVideoTracks()[0].getSettings())||{};
          var want=Math.round(Math.min(40e6,Math.max(8e6,(s.width||1280)*(s.height||720)*(s.frameRate||30)*.2)));
          if(!opts.videoBitsPerSecond||opts.videoBitsPerSecond<want) opts.videoBitsPerSecond=want; }
      }
      return new MR(stream,opts);
    };
    NewMR.prototype=MR.prototype; NewMR.isTypeSupported=wrapped; window.MediaRecorder=NewMR;
  }
  /* ---- panel + probe ---- */
  var panel, probing=false, hex="";
  function build(){
    panel=document.createElement("div"); panel.id="vsColorPanel"; panel.className="vs-nofilter"; panel.setAttribute("role","dialog"); panel.setAttribute("aria-label","Colour accuracy");
    panel.innerHTML='<h4>Colour accuracy</h4>'+
      '<label class="row"><input type="checkbox" id="vsAccToggle"><span>Colour-accurate export<small>Uses VP9/AV1 and a higher bitrate so exported colours match the preview. Turn off for the most compatible MP4/H.264 file.</small></span></label>'+
      '<button type="button" class="act" id="vsProbeBtn">Pick a colour from the preview</button>'+
      '<div id="vsProbeOut"><div id="vsProbeSw"></div><div id="vsProbeTxt">Click the button, then click the video.</div></div>';
    document.body.appendChild(panel);
    var t=panel.querySelector("#vsAccToggle"); t.checked=on; t.onchange=function(){ window.amiyoColorAccurate(t.checked); };
    panel.querySelector("#vsProbeBtn").onclick=function(){ setProbe(!probing); };
    panel.querySelector("#vsProbeTxt").onclick=function(){ if(hex&&navigator.clipboard) navigator.clipboard.writeText(hex).catch(function(){}); };
  }
  function setProbe(v){ probing=v; document.body.classList.toggle("vs-probing",v); var b=panel.querySelector("#vsProbeBtn"); b.classList.toggle("on",v); b.textContent=v?"Click the video to read a pixel (Esc to stop)":"Pick a colour from the preview"; }
  function read(e){
    var cv=document.getElementById("previewCanvas"); if(!cv) return; var r=cv.getBoundingClientRect();
    if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    var x=Math.min(cv.width-1,Math.max(0,Math.floor((e.clientX-r.left)*cv.width/r.width))), y=Math.min(cv.height-1,Math.max(0,Math.floor((e.clientY-r.top)*cv.height/r.height)));
    try{ var d=cv.getContext("2d").getImageData(x,y,1,1).data; hex="#"+[d[0],d[1],d[2]].map(function(n){ return ("0"+n.toString(16)).slice(-2); }).join("").toUpperCase();
      panel.querySelector("#vsProbeSw").style.background=hex;
      panel.querySelector("#vsProbeTxt").innerHTML="RGB "+d[0]+", "+d[1]+", "+d[2]+"<br>"+hex+"<br>x "+x+" y "+y+" · click to copy"; }catch(err){ panel.querySelector("#vsProbeTxt").textContent="Could not read this pixel."; }
  }
  ["pointerdown","click","mousedown"].forEach(function(t){ document.addEventListener(t,function(e){ if(probing&&!e.target.closest("#vsColorPanel,#vsColorBtn")) { if(t==="click") read(e); else { var cv=document.getElementById("previewCanvas"),r=cv&&cv.getBoundingClientRect(); if(r&&e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom){ e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); } } } },true); });
  document.addEventListener("keydown",function(e){ if(e.key==="Escape"){ if(probing){ setProbe(false); } else if(panel&&panel.classList.contains("open")){ panel.classList.remove("open"); document.getElementById("vsColorBtn")&&document.getElementById("vsColorBtn").classList.remove("on"); } } });
  var n=0, iv=setInterval(function(){
    var tb=document.querySelector(".topbar"), th=document.getElementById("vsThemeBtn"); if(!tb||!th){ if(++n>60) clearInterval(iv); return; }
    if(document.getElementById("vsColorBtn")){ clearInterval(iv); return; }
    build(); var b=document.createElement("button"); b.id="vsColorBtn"; b.type="button"; b.textContent="\u25D0"; b.title="Colour accuracy and colour probe"; b.setAttribute("aria-label","Colour accuracy");
    b.onclick=function(){ var o=panel.classList.toggle("open"); b.classList.toggle("on",o); if(!o) setProbe(false); };
    th.parentNode.insertBefore(b,th); clearInterval(iv);
  },300);
})();

;
/* ==================== Script 602 id="amiyo-pwa-ui" ==================== */
/* Step 126: install + offline + on-device storage.
   - "Install" button (Chrome/Edge/Android; iPhone/iPad shows the Share > Add to Home Screen steps).
   - "Offline" panel: shows whether offline mode is on, how much is stored on this device, protects that storage from being cleared,
     and saves a copy of the editor to the device. Offline mode itself needs the page on https/localhost plus a small helper file (sw.js);
     the panel can create that helper for you. Hidden inside another app. */
(function(){
  if(window.__amiyoPwaUi) return; window.__amiyoPwaUi=true;
  var embedded=false; try{ embedded=window.top!==window; }catch(e){ embedded=true; }
  if(embedded) return;
  var ICON="iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAMAAABlApw1AAADAFBMVEUnGhMaFBA2IxdFKRoQDQsAAAD+l0z+pldlNR368+f+i0NXMR7+aiz+dzVqOiH+s2FaNCD+gj3/sF5yRiqPVi+wZzZjNB2pWS1XLRmJSidRKxjThUfPdDtPJxFkNB1VKxhmNBrJaDPJfEFPKBSYZTnOWiexd0JSLBhdMRppMxqpSiK2cT3v5tr/AABSKhdiNBxyVESSeGfl284VFREvGg9cMRvWybsoFAxbMRtdMRtlMw95VDGSQh6tloe6qZvYlFDEs6RbMRyEZ1W8g0iijHw6IxNAAACdh3jd0MP17OAtIwo8IxY/JRZLLyBiKBFxOCLMZg0jGBBiLhhgMxxqQACAKgCOORyFPx+AXkqKb2C/QACqVSq+r6HGVRzUVSrfYCDhf0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB8PhJWAAABAHRSTlP////+/wD///7///7///7/////////1P+O/7P//xKqcE///yv////SzjD///8BTo////8PK6n/GXSSEf///////1L///8oBP///xFnrf8PFgdB/28MBgn///8EBv8JBgj/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHJcuVgAADv9JREFUeNrNXed627gSBQmaogiLVqzq3nucbDbJTd1N25Ttt/f2/k9xAYqiSGAADEBKvqNv/yTe+Jw50whCAFmz2tW75y/298fjJFuZJePx/v6L5++u7OiI+a9vDx+Oszu08cOrW38Cfz7cTzLh94RRSsOQgBYuPnir/F/gvxnyX8j4rxa/f//wH14EnjzNY4ZRErgYER/Y8r9z+8coE/5Lnj5xJvC77YSzpyFxxa5jEMwZOLIgIRVItp84EXjG4ScJDdryvcQkcFSCcgbJ9jM0gU/T3Ptt+R6MJDcdSK7C9BOOwMex8L5jtGKQSywcs4GDGn/EEPhReJ8E7v53ZkDcKfxoJfD4J/5jZBmx31QD/os4tJ8emwk8vkgSthL8xKcisSS5eGwi8IT51J4m5igCDyP2g57ACdcoXCF+j3oUcognOgJ7zuHfzPteucATYbwHE3h86YifNI0fv2qUJJcggR8u7sL/fhq8gAhMVxv/DaoRz4MDlcAD9/rTnjnPRsk7mcCJI37Slv+9GPBq/1IiME7YnfnfoyOwZL9O4MAtge1wQuC/FhnwRD6sEnjmlMDEBX+4HA5hMr6tENh2CCBT7IeoTysMkuQPCwIfHQQw+936ZG9jQBxq6R9LAg4C6PxfrksQ7HpE03rEkodzAif4DNb6PnRaVSmYNGLA8/jXgsA+WgBL5HusCzVgMCulnMB/MqwAhtj3MW0cYSXI/p0TOEySxviJTwQ11SDvBUREEG0a/75myGXUSLQvCNziUrhN72PqES6NBYErTAQZan8za6RBklxxAg8REQRXf4T3B6enr6hXZ8PkAeWtgPA5NPRTwBo59Hwjtw99qw5+GvCBaI38ak8ByP+IyH/V2Sis88pnvrBrwJNgj2CKqFfsn29U7NwrFxBJ8I48txPw8/9GzYahx5SHIPCcPLTOEV7+79fxb3T6fvXINk1MibUI+c3Nb6roNzc2N3c852xLGXpBbH3Yr/oP6v7f5Nb3nU6NBJ6SsZmAtgKZOXyQ/L+52fkQtt8PaDIm5jbg2X37kvc5/o49C0Ln5wPeCIixDXh2gGoJFf7vCPydc8+5wsCAP1eaCfhVoKoAhfdzY5jZyCkLiJmAxv92O61H/5zBqe9s50sg8Jw9aQfyPzca+mngrYDns+Npzf8VG2KfErAMzAR88c8F2JTxd2IatquBkYBf/aEhHS6ip46fS0CplwI+BPw6AN8lQ9/A7hf2hqIYoBPZQMCvAwj8A63/uQ2onwYBaUUBO3puO2r1WdhO8UPuvYC0o4A5+mcCbOrx83kihy8+jlEEMjARcI7/wrcfjPg75xgJ0N3MiYDF/4X1O0b8hQR2BrhKpCfg6H9a2vmmGX9ntPjZ5r1AS8DN/3RBgHXg6lNpZqzE35yBjoBn/eF2avT+bKTDSYBigFbA3AEWiH7uWPHzeYJiKKCyoBUFqniGdvz5PIFigJBAQ0DuAaZnYFojECPwd9IqftqoH8ME3HpwFf+rDsoGKAkwMQQScOvBVSz0DQp/vEMRDFBTaXMFalAGOPxxXJNAR8E/BxxW0utAdpD44+M6fuodQ00VqOPvQ3hvblT8cdzHBBFCAzgHPP1PzyECWQbgj29QMWR/OoYIOGQAQoBjyo5V/LIEDhq0qYAkwA1YMdkiteMF/nhEkRqYGeAUQFUgPsZBD2CMsXluxzVjrTAACJDAMwNO4amBUbYF4I+HFFGJrG9tGikgEYjB0Tm3VMUfp7SNLIAUQL4LoBKBISgAY31OYKjiVyRoTQFsDZJ+PThFxP2ZAv0YsB2KY9BUAV0OSL8dnCJOWWGnEIOBPQusnUAlgO0Csvt2DAJoJNjFKEBIcwKYDAAFGLHSRhCDzMrAOpG2psAxJEC2IJBBBG4whYi4ESCBF35wijgXsTP/3EAM+o2zWCXglwGaKaJiA4jAqHEWIBTA1CB4jKv4n3+OAQIp82LgmAMIBUZWATQSTBC9wFEBrxoUa8a4WR8ubAeSwKuXVdYm2skB3RRRtyEkwdCrDjVXwC5AOvd/v9QhtUvgXIfsBMActgsQKwKAEqTpVrMsthKAZ1HLFCGevFi9BuUfWYKUE7DNE5ZpSCaA68O2KUJU+GIGKj/QPJEKsy0RkfZzQKpBO8C6D58i+uqnr8JXJHDcO9GCAhmEf1TL3zKPRyr+NM3c+wBpswqdQ+tWWR9SoDrSlfjTkW0iJQ59wF2BPoR/l2lsV8Wf1ueJZlUIty5tmCLmz1pl3CxyuF+dJ6r404mrAqRpJ64uBsUA/uP5c1jJoSZBWsefpu4x5JQDxknotF79Z7bFoC6Q89gC8KdD21PZEqtQrK56xmKKeP95MKuchZU6/DdVrbdcBUw5MATw8ymi/77b7b4dQBoMAQLVeaJ1BcyzaAzgF1PEl66wb7Jcg8V/+UhnlsDxgcBKAJqFgCmiNiHz+O/O7P4jVYMJxGDgNgs1zAFlipCe1Lmbu3P78l6uQ5AE944cZ4mWciBTVv2LMa7fXdjbQVbvBaoE99J72RIVIFoGx9Cyeb4YVCHQ/Z6nQlWDTMHP7UivQAuzEIH7QB+AX8zR3Zrdf1SLopHif27MIYKClhQYAfiL1biuZF/+WsmCTPE/t4n2eaDpqoQ2i8UUoS7YMpBA3hVKO5K8L6zHWnkeCBwUGEFvLQY6AiIVyiUi2f0VCZaiAMwgBvDPx7guZDwVZkZ3Zf8LCRxyIGhDAXCZZ8tEoNv9zVezv96S3S8IbK0uB3IGMbjKYyZQpAJlPRV/rwe+pSFhcwKgArp1NgsBngq8HtEhgD+XIFxZDuzAi82MWgh0u18/4j/Tq6HP8feOsAo0zgHOQLvWzKwERCrQiex+YRkNl6WAMo9Cq/1i9wBCAWHfDnoKfCHByt6R9bXvWxiKQPfrkYq/12POu8Cx74llDje6l45s9rES6H4H4O9NnL9diVNA0YCZXnihFOh+M1Lx80rq+p0s3FYDRQHTW1+cAvcHGYBfkgDxvT4kAUkDannvzqg1Bb6i9EjFL0tg/3YrmkBNg6F554NVgfufxeg5APD3thy/1YfdM1dXAMJf30hprqHF++1dgEDP4WnMiUBVAXiMq+0+M3exwrZ6RglQ34/2UgDxsk4f/O8rPwURWLdlAPHZtVhTYIB4XaoL/u9quyNACbKlK3CMeGGtCX55fw1E4MjptA+0AgsNMsyWAXPwlzaBGCQu3yzG750uNbjBbNoAgv9vFDCIwKS5AqaZlGG2zVBL8JsloA6nTLgrMNLM0UYC3w4obEwvAe6MCd13aLRnCYFTxBE1EgCCv7QzqJJS/BkTDgRmHIaYzXs1AvwJ0mCJppmR9hWY1SHM9skqAV3wl3akCsCbWVMFtCdqQQKkAz2Bby3w+RK9gp/ba/SxW3MCEVIDdYpI4x4A6741+EtbV/zPDUsgcvgyqLABsOFH3vGT2z+twa+ZJ9ZnlmDPuVkoEGEI7AD4U0qVXZj0589vH/VR+MOaBAX+9TOc/0sFIpwEGYR/qO4BdDBe8LdU/DoJVAZaBUACu8p+KyFA2IBB/oC6Xo1+vQRyBYqqCkSYLGbAfqt0otnLi8Yfhtey+4VRVARFVQUi20Q0AvyfUngnKSr659zXFfjr69cY/DUFrBpQYL9YOtLvp0Z5P7eJih+SQGEQGRVQGEyg/WLMuCcchz+kAH5ZgsCmAJAFdQYhhP/IsqsdA5/bGUBgHeH/aEEAVCDQTBGLd6SZbVc1Bn4YJhCB1/YMiGoKWCpRCuDfxXy3APNlJasEaqOSFIhsWTCQqs9sk4n+nAlVi9BwogooQWLJgMiqQJXBDrBbr2c+KWbOIpzXTMMJBhCBM4MABWKJgCELBoD/0y3raUOVj/kclb+YJdD4XyEQaSXYVf2f3vM+bxp4D2aUIEAroGUA4E+HTU48lt/DvDakcUB0+O0KBJU5VN7nE7Zy6vH8X4EIUN2hNjUClxUCOgZDYLfnBH/yGeYcoWttKwi0GSAIXHICYWRjMInVjW606cnr9dUfqiNgEiAKOYHthFbwwwwGKv5R22fHX2vKkMH/USQOTJ1WCUTwaVXMJIBvJkgrJxTOAZP/BYGpREDDQMF/1PAEdmDl5wyqQkFgUeA5OagTiEACyl5J1uwWAmjdigITdRDYFDgg/AqjGn5YA6UHWO/hqN5qUf8z3brbtSKA6v06/ojfQED4JWT1P4TyOKin8S7xvAeFGM+7P5NT2OL/iB+c/VIcHk8iSYPIzGBCSKObaLR2XcNvif+8DfDD49deSEkAx1AQzndL9hghqLuAHO7PmdvvyzkotMb/rAgVFyhEkZIH6ioFG+2mvdGAIPETd/zckglHf001z2BKBIkLFNYSKYa0mbxKg+JHFkBEUHGJSKQyiJZ0/5vf7WSA//M+PL/GJYr+vzQA41/GH82vcfktGEN3pwHS/2KW/vvsKiN+l5SqQHRXGuC8z40l25XLpCKUBitgEMD1X2XAz13fq1znFUEWrF4EtP+5ANPyPjJ+p2wI4V99LmvwAxy4AL9Ur7RLArwGwSrha/wfzC/XLC4VZGovWLkGQYD3P+8Bxc2UpLzXlEQOGgQrww8bKW83LQh84hcXBy4atHyzqSH6I8D/4mrQ2/rNoOJq1shJg2AFt4JqEIkAOpEvlz3QMdBr0FJvDkzRr8P/QL3ed1ubBtFyb2gNXP3PK+gUuJ9YXJCuZRAt5Z5c073Eev/zBN6G7+i+0CSyUYNchaDFzLX5nyfwheaScd4NmEEDmwpBizdzR1r8/K56tqe95p3qo8isglMkYW60jvQNgD7R3lO/tnepr6bmTEDpgL2XPjLVz8u9NT2BtdupiYFNhTkPsDrN/hzzD+h/O63WH5DArB8EvhpIWigfDHq9/wX+gzUbAdGTGWmmQQPTR08UskX/NRFYOxlzEYzVKFoeelP1ScYv1zAE1v7Ew0hPYXn4DdFPePQkBwB+kACvRtPErkLUtu/1vVfAn+6BUGECcwohWZ0KWueHOfxfNEB1BDgFPt3xfKYkMKoArKM6+N3i+4BQJlA83dPC1BPgK16H+8mMhNjusNKlUZLvFcnBJ/uH/zKANBEQje1qOk7u0C6nV7dmhBYCeSydPDiYbm9fsNXhZhcX29ODByd7dnT/A4vMDHAUO4/jAAAAAElFTkSuQmCC", SW_SRC="/* Amiyo Editor - offline support. Keep this file in the same folder as the editor's .html file.\n   Network first (so a new step is picked up as soon as you are online), cached copy when offline. Media you import is never cached here. */\nconst CACHE = 'amiyo-editor-v1';\nself.addEventListener('install', function(){ self.skipWaiting(); });\nself.addEventListener('activate', function(e){\n  e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); }));\n});\nself.addEventListener('message', function(e){\n  var d = e.data || {};\n  if (d.type === 'cache-page' && d.url) e.waitUntil(caches.open(CACHE).then(function(c){ return fetch(d.url, {cache:'reload'}).then(function(r){ if (r && r.ok) return c.put(d.url, r); }); }).catch(function(){}));\n});\nfunction timeout(ms){ return new Promise(function(_, rej){ setTimeout(function(){ rej(new Error('timeout')); }, ms); }); }\nself.addEventListener('fetch', function(e){\n  var r = e.request;\n  if (r.method !== 'GET' || r.headers.has('range')) return;\n  var u = new URL(r.url);\n  var font = /(^|\\.)(fonts\\.googleapis\\.com|fonts\\.gstatic\\.com)$/.test(u.host);\n  if (u.origin !== location.origin && !font) return;\n  if (/\\.(mp4|mov|webm|mkv|avi|mp3|wav|m4a|aac|ogg)$/i.test(u.pathname)) return;\n  if (font) {\n    e.respondWith(caches.open(CACHE).then(function(c){ return c.match(r).then(function(hit){\n      var net = fetch(r).then(function(res){ if (res && (res.ok || res.type === 'opaque')) c.put(r, res.clone()); return res; }).catch(function(){ return hit; });\n      return hit || net;\n    }); }));\n    return;\n  }\n  e.respondWith(caches.open(CACHE).then(function(c){\n    return Promise.race([fetch(r), timeout(r.mode === 'navigate' ? 5000 : 8000)]).then(function(res){\n      if (res && res.ok) c.put(r, res.clone());\n      return res;\n    }).catch(function(){\n      return c.match(r, {ignoreSearch: true}).then(function(hit){ return hit || fetch(r); });\n    });\n  }));\n});\n";
  var ua=navigator.userAgent||"";
  var iOS=/iphone|ipad|ipod/i.test(ua)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
  var safari=/safari/i.test(ua)&&!/crios|fxios|edgios|chrome|android/i.test(ua);
  var web=/^https?:$/.test(location.protocol);
  var swOK=web&&"serviceWorker" in navigator&&(location.protocol==="https:"||/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname));
  var btn=null, offBtn=null, back=null, dismissedOnce=false, swReg=null;
  function standalone(){ try{ return (window.matchMedia&&matchMedia("(display-mode: standalone), (display-mode: window-controls-overlay), (display-mode: fullscreen)").matches)||navigator.standalone===true; }catch(e){ return false; } }
  function say(m){ try{ if(typeof window.toast==="function") window.toast(m,3400); }catch(e){} }
  function esc(t){ return String(t).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function fmt(n){ if(!isFinite(n)) return "?"; var u=["B","KB","MB","GB","TB"],i=0; while(n>=1024&&i<4){ n/=1024; i++; } return (n>=100||i===0?Math.round(n):n.toFixed(1))+" "+u[i]; }
  function pageUrl(){ return location.href.split("#")[0]; }
  function canOffer(){ if(standalone()||!web) return false; return !!window.__amiyoInstallEvt||dismissedOnce||(iOS&&safari); }
  function refresh(){ if(btn) btn.hidden=!canOffer(); }
  function protect(quiet){
    try{ if(navigator.storage&&navigator.storage.persist) return navigator.storage.persist().then(function(ok){ if(!quiet) say(ok?"Storage is protected - the browser will not clear your projects":"The browser declined for now. Installing the app or using it more often usually helps."); return ok; }); }catch(e){}
    return Promise.resolve(false);
  }
  function install(){
    var ev=window.__amiyoInstallEvt;
    if(!ev){ openPanel(); return; }
    try{
      ev.prompt();
      Promise.resolve(ev.userChoice).then(function(c){
        window.__amiyoInstallEvt=null; dismissedOnce=true;
        if(c&&c.outcome==="accepted"){ say("Installing Amiyo Studio..."); protect(true); }
        refresh(); if(back&&back.classList.contains("open")) openPanel();
      }).catch(function(){ window.__amiyoInstallEvt=null; dismissedOnce=true; refresh(); });
    }catch(e){ window.__amiyoInstallEvt=null; openPanel(); }
  }
  function download(name,blobOrText,type){
    var blob=blobOrText instanceof Blob?blobOrText:new Blob([blobOrText],{type:type||"text/plain"});
    if(window.showSaveFilePicker){
      return window.showSaveFilePicker({suggestedName:name}).then(function(h){ return h.createWritable().then(function(w){ return w.write(blob).then(function(){ return w.close(); }); }); }).then(function(){ say("Saved "+name); }).catch(function(e){ if(e&&e.name==="AbortError") return; legacy(); });
    }
    legacy();
    function legacy(){ var a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },4000); say("Saved "+name); }
  }
  function saveCopy(){
    var name=(location.pathname.split("/").pop()||"amiyo-editor.html"); if(!/\.html?$/i.test(name)) name="amiyo-editor.html";
    var getText=fetch(pageUrl(),{cache:"no-store"}).then(function(r){ if(!r.ok) throw 0; return r.text(); }).catch(function(){ return "<!doctype html>\n"+document.documentElement.outerHTML; });
    Promise.all([getText,ensureFonts()]).then(function(r){
      var html=r[0], css=r[1];
      var tag='<style id="amiyoFonts'+'Offline">'; if(css&&html.indexOf(tag)<0){ var k=html.indexOf("</head>"); if(k>0) html=html.slice(0,k)+tag+css+'</style>\n'+html.slice(k); }
      return download(name,new Blob([html],{type:"text/html"}),"text/html");
    });
  }
  function status(){
    var est=(navigator.storage&&navigator.storage.estimate)?navigator.storage.estimate().catch(function(){return null;}):Promise.resolve(null);
    var per=(navigator.storage&&navigator.storage.persisted)?navigator.storage.persisted().catch(function(){return null;}):Promise.resolve(null);
    var cached=(window.__amiyoCaches()&&web)?window.__amiyoCaches().match(pageUrl()).then(function(x){ return !!x; }).catch(function(){ return false; }):Promise.resolve(false);
    return Promise.all([est,per,cached]);
  }
  var opener=null;
  function closePanel(){ if(back) back.classList.remove("open"); try{ if(opener&&opener.focus) opener.focus(); }catch(e){} opener=null; refreshDot(); }
  function openPanel(){
    if(!back){
      back=document.createElement("div"); back.id="pwaBack";
      back.innerHTML='<div id="pwaBox" role="dialog" aria-modal="true" aria-labelledby="pwaTitle"><div class="pwa-head"><img alt="" src="data:image/png;base64,'+ICON+'"/><div><h3 id="pwaTitle">Amiyo Studio on this device</h3><small style="color:var(--muted)">Install, work offline and save your projects on this device</small></div></div><div id="pwaBody"></div><div class="pwa-row"><button type="button" id="pwaClose">Close</button></div></div>';
      document.body.appendChild(back);
      back.addEventListener("click",function(e){ if(e.target===back||e.target.id==="pwaClose") closePanel(); });
      document.addEventListener("keydown",function(e){
        if(!back.classList.contains("open")) return;
        if(e.key==="Escape"){ e.stopPropagation(); closePanel(); return; }
        if(e.key==="Tab"){ var f=[].slice.call(back.querySelectorAll("button,[tabindex]:not([tabindex='-1'])")).filter(function(x){ return x.offsetParent!==null; }); if(!f.length) return; var a=f[0], z=f[f.length-1];
          if(!back.contains(document.activeElement)||document.activeElement===back.querySelector("#pwaBox")){ e.preventDefault(); a.focus(); }
          else if(e.shiftKey&&document.activeElement===a){ e.preventDefault(); z.focus(); } else if(!e.shiftKey&&document.activeElement===z){ e.preventDefault(); a.focus(); } }
      },true);
    }
    if(!back.classList.contains("open")) opener=document.activeElement;
    back.classList.add("open"); try{ var bx=back.querySelector("#pwaBox"); bx.setAttribute("tabindex","-1"); if(!back.contains(document.activeElement)) bx.focus(); }catch(e){}
    var body=back.querySelector("#pwaBody"); body.innerHTML='<p>Checking...</p>';
    Promise.all([status(),oGet("fontsCss"),health()]).then(function(rr){
      var hh=rr[2], r=rr[0], fontsOK=!!rr[1]||!!document.getElementById("amiyoFontsOffline"), est=r[0], per=r[1], cached=r[2], ctl=!!(navigator.serviceWorker&&navigator.serviceWorker.controller);
      var inst=standalone(), h='<div class="pwa-sum'+(hh.todo.length?'':' ok')+'">'+(hh.todo.length?'Still to set up: '+esc(hh.todo.join(", "))+'.':'All set - installed-app features, offline use and device saving are ready.')+'</div><div class="pwa-st">';
      h+=row(inst?"ok":"warn", inst?"Installed as an app":"Not installed", inst?"You are using the installed app.":(iOS?"On iPhone / iPad: tap Share, then Add to Home Screen.":(window.__amiyoInstallEvt?"Ready to install - tap Install below.":(web?"Use your browser menu: Install app / Add to Home screen.":"Open this page from an https address to install it."))));
      var offOK=ctl&&cached;
      var why=offOK?"The editor opens and works without internet.":(!web?"This page is opened from a file, so the browser cannot run offline mode. ":(!swOK?"Offline mode needs an https address (or localhost).":(swReg?(cached?"Almost ready - reload the page once.":"Preparing the offline copy - reload once in a moment."):"Needs the small helper file sw.js next to this page. Download it below and put it in the same folder on your host.")));
      if(!web){ offOK=true; why="This copy runs from a file on your device, so it opens and works without internet."; }
      h+=row(offOK?"ok":"warn", !web?"Works offline (device copy)":(offOK?"Offline mode is on":"Offline mode is off"), why);
      h+=row(fontsOK?"ok":"warn", fontsOK?"Fonts saved for offline":"Fonts not saved yet", fontsOK?"The editor looks the same with no internet.":"Open the editor once while online and the fonts are saved automatically.");
      if(est&&est.quota) h+=row("ok","Stored on this device: "+fmt(est.usage||0), "Your projects and imported media stay on this device. Room available: about "+fmt(est.quota)+".");
      h+=row(per?"ok":(per===false?"warn":""), per?"Storage is protected":"Storage can be cleared by the browser", per?"The browser will keep your projects even when the device is low on space.":"Protect it so a low-space cleanup does not remove your work.");
      h+='</div><div class="pwa-act">';
      if(!inst&&(window.__amiyoInstallEvt)) h+='<button type="button" class="go" id="pwaDoInst">Install app</button>';
      if(per!==true&&navigator.storage&&navigator.storage.persist) h+='<button type="button" id="pwaDoPer">Protect my projects on this device<small>Asks the browser not to clear stored projects</small></button>';
      h+='<button type="button" id="pwaDoCopy"'+(web&&!offOK?' class="go"':'')+'>Save a copy of the editor to this device<small>One .html file with its fonts built in. Open it any time, no internet and no setup</small></button>';
      if(web&&HAS_DIR&&!offOK) h+='<button type="button" id="pwaSwDir">Save offline helper into my site folder<small>Pick the folder that holds this page (for example your local server folder)</small></button>';
      if(web&&!offOK) h+='<button type="button" id="pwaDoSw">Download offline helper (sw.js)<small>Put it next to the editor file on your host to switch offline mode on</small></button>';
      h+='</div>';
      body.innerHTML=h;
      var g=function(id){ return body.querySelector("#"+id); };
      if(g("pwaDoInst")) g("pwaDoInst").onclick=install;
      if(g("pwaDoPer")) g("pwaDoPer").onclick=function(){ protect(false).then(openPanel); };
      if(g("pwaDoCopy")) g("pwaDoCopy").onclick=saveCopy;
      if(g("pwaDoSw")) g("pwaDoSw").onclick=function(){ try{ localStorage.setItem("amiyo.sw.want","1"); }catch(e){} download("sw.js",SW_SRC,"text/javascript"); };
      if(g("pwaSwDir")) g("pwaSwDir").onclick=function(){ window.showDirectoryPicker({id:"amiyo-site",mode:"readwrite"}).then(function(d){ try{ localStorage.setItem("amiyo.sw.want","1"); }catch(e){} return writeFile(d,"sw.js",new Blob([SW_SRC],{type:"text/javascript"})).then(function(){ say("sw.js saved. Reload this page once, then offline mode turns on."); }); }).catch(function(e){ if(!e||e.name!=="AbortError") say("Could not save sw.js: "+((e&&e.message)||e)); }); };
      devSection(body);
    });
    function row(k,t,d){ return '<div class="pwa-r"><i class="'+k+'"></i><div><b>'+esc(t)+'</b><span>'+esc(d)+'</span></div></div>'; }
  }
  function build(){
    var tb=document.querySelector(".topbar"); if(!tb) return false;
    if(document.getElementById("pwaInstallBtn")){ btn=document.getElementById("pwaInstallBtn"); offBtn=document.getElementById("pwaOffBtn"); return true; }
    var ref=document.getElementById("exportBtn");
    offBtn=document.createElement("button"); offBtn.type="button"; offBtn.id="pwaOffBtn"; offBtn.className="topbtn";
    offBtn.title="Offline mode, device storage and install"; offBtn.setAttribute("aria-label","Offline mode and device storage");
    offBtn.innerHTML='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="9.5" width="12" height="4" rx="1.2"/><path d="M4.5 11.5h.01M8 2.5v5M5.8 5.6 8 7.8l2.2-2.2"/></svg><span>Offline</span>';
    offBtn.addEventListener("click",openPanel);
    btn=document.createElement("button"); btn.type="button"; btn.id="pwaInstallBtn"; btn.className="topbtn"; btn.hidden=true;
    btn.title="Install Amiyo Editor as an app"; btn.setAttribute("aria-label","Install Amiyo Editor as an app");
    btn.innerHTML='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v8M4.5 7 8 10.5 11.5 7M3 13.5h10"/></svg><span>Install</span>';
    btn.addEventListener("click",install);
    tb.insertBefore(offBtn,ref||null); tb.insertBefore(btn,ref||null);
    return true;
  }
  window.addEventListener("amiyo-install-ready",function(){ build(); refresh(); });
  window.addEventListener("appinstalled",function(){ window.__amiyoInstallEvt=null; dismissedOnce=false; if(btn) btn.hidden=true; protect(true); say("Amiyo Editor installed"); });
  try{ matchMedia("(display-mode: standalone)").addEventListener("change",refresh); }catch(e){}
  var n=0, iv=setInterval(function(){ if(build()||++n>80){ clearInterval(iv); refresh(); } },250);
  /* files opened with the installed app (right-click > Open with, or "Open with" on Android) go straight into the media panel */
  try{
    if("launchQueue" in window){
      window.launchQueue.setConsumer(function(lp){
        if(!lp||!lp.files||!lp.files.length) return;
        Promise.all(lp.files.map(function(h){ return h.getFile(); })).then(function(files){
          var tries=0, t=setInterval(function(){
            var inp=document.getElementById("fileInput");
            if(!inp&&++tries<60) return; clearInterval(t); if(!inp) return;
            try{ var dt=new DataTransfer(); files.forEach(function(f){ dt.items.add(f); }); inp.files=dt.files; inp.dispatchEvent(new Event("change",{bubbles:true})); say("Opened "+files.length+" file"+(files.length>1?"s":"")); }catch(e){ say("Could not open that file here - use Import instead."); }
          },250);
        }).catch(function(){});
      });
    }
  }catch(e){}
  /* newer version on the server: offer a reload (never reloads by itself, so edits are safe) */
  if(web){
    var sig=null, bar=null;
    function stamp(){ return fetch(pageUrl(),{method:"HEAD",cache:"no-store"}).then(function(r){ return r.ok?[r.headers.get("etag"),r.headers.get("last-modified"),r.headers.get("content-length")].join("|"):null; }).catch(function(){ return null; }); }
    function check(){
      if(bar||document.hidden||navigator.onLine===false) return;
      stamp().then(function(v){
        if(!v||v==="||") return; if(sig===null){ sig=v; return; } if(v===sig) return;
        bar=document.createElement("div"); bar.setAttribute("role","status");
        bar.style.cssText="position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:100001;display:flex;gap:12px;align-items:center;padding:10px 14px;border-radius:12px;background:#131110;border:1px solid #ff7a3d;color:#f1ece2;font:13px/1.3 system-ui,sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.5);max-width:calc(100vw - 24px)";
        bar.innerHTML='<span>A newer version of Amiyo Studio is available.</span><button type="button" style="padding:6px 12px;border-radius:8px;border:0;background:#ff7a3d;color:#1a0c03;font-weight:700;cursor:pointer">Reload</button><button type="button" aria-label="Dismiss" style="border:0;background:none;color:#a89f8e;cursor:pointer;font-size:16px">×</button>';
        document.body.appendChild(bar);
        bar.children[1].onclick=function(){ location.reload(); }; bar.children[2].onclick=function(){ bar.remove(); };
      });
    }
    window.addEventListener("load",function(){ stamp().then(function(v){ if(v&&v!=="||") sig=v; }); setInterval(check,600000); });
    document.addEventListener("visibilitychange",function(){ if(!document.hidden) check(); });
    window.addEventListener("online",check);
  }
  /* warn once when the device storage is nearly full */
  try{ if(navigator.storage&&navigator.storage.estimate) setTimeout(function(){ navigator.storage.estimate().then(function(e){ if(e&&e.quota&&e.usage/e.quota>0.85) say("Device storage is almost full - free some space or export and remove old projects."); }).catch(function(){}); },6000); }catch(e){}
  /* offline mode: use sw.js if it sits next to this page */
  if(swOK){
    window.addEventListener("load",function(){
      var swUrl=new URL("sw.js",location.href).href;
      /* only look for sw.js after the person asked for offline mode (or one is already registered) - avoids a 404 in the console on every load */
      var wantSw=false; try{ wantSw=localStorage.getItem("amiyo.sw.want")==="1"; }catch(e){}
      (wantSw?Promise.resolve(true):navigator.serviceWorker.getRegistrations().then(function(l){ return !!(l&&l.length); }).catch(function(){ return false; })).then(function(go){
        if(!go) return;
        return fetch(swUrl,{cache:"no-store"});
      }).then(function(r){
        if(!r) return;
        if(!r.ok||!/javascript|ecmascript/i.test(r.headers.get("content-type")||"")) return;
        return navigator.serviceWorker.register(swUrl,{scope:new URL("./",location.href).pathname}).then(function(reg){ swReg=reg; return navigator.serviceWorker.ready; }).then(function(reg){
          if(reg&&reg.active) reg.active.postMessage({type:"cache-page",url:pageUrl()});
          var seen=false; try{ seen=localStorage.getItem("amiyo.offline.told")==="1"; }catch(e){}
          if(!seen){ try{ localStorage.setItem("amiyo.offline.told","1"); }catch(e){} setTimeout(function(){ say("Offline mode is ready - the editor will open without internet"); },1500); }
        });
      }).catch(function(){});
    });
  }
  /* ===== Offline fonts: keep the editor's fonts on the device so it looks right with no internet ===== */
  var GF="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap";
  function odb(){ return new Promise(function(res,rej){ var r=indexedDB.open("amiyo-offline",1); r.onupgradeneeded=function(){ r.result.createObjectStore("k"); }; r.onsuccess=function(){ res(r.result); }; r.onerror=function(){ rej(r.error); }; }); }
  function oGet(k){ return odb().then(function(db){ return new Promise(function(res){ var q=db.transaction("k").objectStore("k").get(k); q.onsuccess=function(){ res(q.result||null); }; q.onerror=function(){ res(null); }; }); }).catch(function(){ return null; }); }
  function oSet(k,v){ return odb().then(function(db){ return new Promise(function(res){ var tx=db.transaction("k","readwrite"); tx.objectStore("k").put(v,k); tx.oncomplete=function(){ res(true); }; tx.onerror=function(){ res(false); }; }); }).catch(function(){ return false; }); }
  function injectFonts(css){ if(!css||document.getElementById("amiyoFontsOffline")) return; var st=document.createElement("style"); st.id="amiyoFontsOffline"; st.textContent=css; document.head.appendChild(st); }
  function blobToDataUrl(b){ return new Promise(function(res,rej){ var fr=new FileReader(); fr.onload=function(){ res(fr.result); }; fr.onerror=function(){ rej(fr.error); }; fr.readAsDataURL(b); }); }
  function buildFonts(){
    return fetch(GF,{mode:"cors"}).then(function(r){ if(!r.ok) throw 0; return r.text(); }).then(function(css){
      var faces=[], re=/\/\*\s*([a-z0-9-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/gi, m;
      while((m=re.exec(css))){ if(m[1]==="latin") faces.push(m[2]); }
      if(!faces.length) throw 0;
      return Promise.all(faces.map(function(f){
        var u=/url\((https:[^)]+)\)/.exec(f); if(!u) return f;
        return fetch(u[1],{mode:"cors"}).then(function(r){ if(!r.ok) throw 0; return r.blob(); }).then(blobToDataUrl).then(function(d){ return f.replace(u[1],d); });
      }));
    }).then(function(list){ var css=list.join("\n"); return oSet("fontsCss",css).then(function(){ return css; }); });
  }
  function ensureFonts(){
    return oGet("fontsCss").then(function(css){
      if(css){ injectFonts(css); return css; }
      if(navigator.onLine===false) return null;
      return buildFonts().then(function(c){ injectFonts(c); return c; }).catch(function(){ return null; });
    });
  }
  window.__amiyoFonts={ensure:ensureFonts,build:buildFonts};
  (function(){ var t=function(){ ensureFonts(); }; if(document.readyState==="complete") setTimeout(t,1500); else window.addEventListener("load",function(){ setTimeout(t,2500); }); window.addEventListener("online",function(){ setTimeout(t,1000); }); })();
  function health(){
    return Promise.all([oGet("fontsCss"),(window.__amiyoCaches()&&web)?window.__amiyoCaches().match(pageUrl()).then(function(x){ return !!x; }).catch(function(){ return false; }):Promise.resolve(false),DF.h?perm(DF.h,false):Promise.resolve(false)]).then(function(r){
      var ctl=!!(navigator.serviceWorker&&navigator.serviceWorker.controller), off=!web?true:(ctl&&r[1]), fonts=!!r[0]||!!document.getElementById("amiyoFontsOffline"), folder=HAS_DIR?(!!DF.h&&r[2]&&DF.on):true, todo=[];
      if(!off) todo.push("offline mode"); if(!fonts) todo.push("offline fonts"); if(!folder) todo.push("device folder saving");
      return {off:off,fonts:fonts,folder:folder,todo:todo};
    });
  }
  function refreshDot(){ if(!offBtn) return; health().then(function(h){ offBtn.setAttribute("data-s",h.todo.length?"warn":"ok"); offBtn.title=h.todo.length?"Offline & device storage - to do: "+h.todo.join(", "):"Offline & device storage - all set"; }).catch(function(){}); }
  setInterval(refreshDot,20000); setTimeout(refreshDot,4000); window.addEventListener("online",function(){ setTimeout(refreshDot,3000); });
  /* ===== Device folder: mirror projects + media into a real folder on the device (Chrome / Edge, desktop and Android) ===== */
  var DF={h:null,on:true,busy:false,sig:"",last:0,err:"",n:0}, HAS_DIR=!!window.showDirectoryPicker;
  function idb(){ return new Promise(function(res,rej){ var r=indexedDB.open("amiyo-device-folder",1); r.onupgradeneeded=function(){ r.result.createObjectStore("h"); }; r.onsuccess=function(){ res(r.result); }; r.onerror=function(){ rej(r.error); }; }); }
  function kGet(k){ return idb().then(function(db){ return new Promise(function(res){ var q=db.transaction("h").objectStore("h").get(k); q.onsuccess=function(){ res(q.result); }; q.onerror=function(){ res(null); }; }); }).catch(function(){ return null; }); }
  function kSet(k,v){ return idb().then(function(db){ return new Promise(function(res){ var tx=db.transaction("h","readwrite"); if(v===undefined) tx.objectStore("h").delete(k); else tx.objectStore("h").put(v,k); tx.oncomplete=function(){ res(true); }; tx.onerror=function(){ res(false); }; }); }).catch(function(){ return false; }); }
  function perm(h,ask){
    if(!h) return Promise.resolve(false); var o={mode:"readwrite"};
    return Promise.resolve(h.queryPermission?h.queryPermission(o):"granted").then(function(p){
      if(p==="granted") return true; if(!ask||!h.requestPermission) return false;
      return h.requestPermission(o).then(function(q){ return q==="granted"; });
    }).catch(function(){ return false; });
  }
  function safe(x){ return String(x||"Untitled").replace(/[\\\/:*?"<>|\u0000-\u001f]/g,"_").trim().slice(0,80)||"Untitled"; }
  function mediaName(a,id){ return safe(id)+"_"+safe(a.name||a.fileName||"media").slice(0,60); }
  function writeFile(dir,name,blob){ return dir.getFileHandle(name,{create:true}).then(function(fh){ return fh.createWritable().then(function(w){ return w.write(blob).then(function(){ return w.close(); }); }); }); }
  function writeIfNew(dir,name,blob){
    return dir.getFileHandle(name).then(function(fh){ return fh.getFile(); }).then(function(f){ if(f.size===blob.size) return; return writeFile(dir,name,blob); }, function(){ return writeFile(dir,name,blob); });
  }
  function sync(force){
    if(!DF.h||!DF.on||DF.busy||typeof project==="undefined"||!window.__amiyoBooted||window.__amiyoExporting) return Promise.resolve(false);
    var sig=((project.metadata&&project.metadata.updatedAt)||"")+"|"+((project.metadata&&project.metadata.name)||"");
    if(!force&&sig===DF.sig) return Promise.resolve(false);
    DF.busy=true;
    return perm(DF.h,false).then(function(ok){
      if(!ok){ DF.err="reconnect"; throw 0; }
      return DF.h.getDirectoryHandle("Amiyo Editor",{create:true});
    }).then(function(root){
      return root.getDirectoryHandle("media",{create:true}).then(function(md){
        var p=serializableProject(), chain=Promise.resolve(), n=0;
        Object.keys(p.assets||{}).forEach(function(k){
          var a=p.assets[k], id=a.id||k, b=ASSET_BLOBS.get(id); delete a.fileData; if(!b) return;
          var fn=mediaName(a,id); a.deviceFile="media/"+fn; n++;
          chain=chain.then(function(){ return writeIfNew(md,fn,b); });
        });
        var pname=safe(project.metadata&&project.metadata.name)+".amiyovideo";
        return chain.then(function(){ return backupPrev(root,pname); }).then(function(){ return writeFile(root,pname,new Blob([JSON.stringify(p)],{type:"application/json"})); }).then(function(){ DF.n=n; });
      });
    }).then(function(){ var first=!DF.last; DF.sig=sig; DF.last=Date.now(); DF.err=""; if(first&&force) say("Saved to your folder: "+DF.h.name); return true; })
    .catch(function(e){ if(e!==0) DF.err=String((e&&e.message)||e); return false; })
    .then(function(r){ DF.busy=false; return r; });
  }
  function pad2(n){ return (n<10?"0":"")+n; }
  function backupPrev(root,pname){
    var now=Date.now(); if(now-(DF.bk||0)<600000) return Promise.resolve();
    var base=pname.replace(/\.amiyovideo$/i,"");
    return root.getFileHandle(pname).then(function(fh){ return fh.getFile(); }).then(function(f){
      if(!f.size) return; DF.bk=now; var d=new Date(f.lastModified), st=d.getFullYear()+pad2(d.getMonth()+1)+pad2(d.getDate())+"-"+pad2(d.getHours())+pad2(d.getMinutes())+pad2(d.getSeconds());
      return root.getDirectoryHandle("backups",{create:true}).then(function(bd){
        return writeFile(bd,base+"_"+st+".amiyovideo",f).then(async function(){
          var names=[]; for await (var e of bd.values()){ if(e.kind==="file"&&e.name.indexOf(base+"_")===0) names.push(e.name); }
          names.sort().reverse(); for(var i=8;i<names.length;i++){ try{ await bd.removeEntry(names[i]); }catch(_){} }
        });
      });
    },function(){});
  }
  function listBackups(){
    if(!DF.h) return Promise.resolve([]);
    return DF.h.getDirectoryHandle("Amiyo Editor").then(function(r){ return r.getDirectoryHandle("backups"); }).then(async function(bd){
      var out=[]; for await (var e of bd.values()){ if(e.kind==="file"&&/\.amiyovideo$/i.test(e.name)){ var f=await e.getFile(); out.push({name:"backups/"+e.name,t:f.lastModified,size:f.size}); } }
      return out.sort(function(a,b){ return b.t-a.t; }).slice(0,10);
    }).catch(function(){ return []; });
  }
  function listProjects(){
    if(!DF.h) return Promise.resolve([]);
    return DF.h.getDirectoryHandle("Amiyo Editor").then(async function(root){
      var out=[]; for await (var e of root.values()){ if(e.kind==="file"&&/\.amiyovideo$/i.test(e.name)){ var f=await e.getFile(); out.push({name:e.name,t:f.lastModified,size:f.size}); } }
      return out.sort(function(a,b){ return b.t-a.t; }).slice(0,15);
    }).catch(function(){ return []; });
  }
  function readPath(root,path){ var parts=String(path).split("/"), d=Promise.resolve(root); parts.slice(0,-1).forEach(function(s){ d=d.then(function(x){ return x.getDirectoryHandle(s); }); }); return d.then(function(x){ return x.getFileHandle(parts[parts.length-1]); }).then(function(fh){ return fh.getFile(); }); }
  function restoreFrom(fileName){
    return perm(DF.h,true).then(function(ok){ if(!ok) throw new Error("No permission"); return DF.h.getDirectoryHandle("Amiyo Editor"); }).then(function(root){
      return readPath(root,fileName).then(function(f){ return f.text(); }).then(function(t){
        var p=JSON.parse(t), chain=Promise.resolve();
        Object.keys(p.assets||{}).forEach(function(k){ var a=p.assets[k]; if(!a.deviceFile||a.fileData) return;
          chain=chain.then(function(){ return readPath(root,a.deviceFile).then(function(file){ a.blob=file; }).catch(function(){}).then(function(){ delete a.deviceFile; }); }); });
        return chain.then(function(){ if(window.AMIYO_STUDIO_CORE&&window.AMIYO_STUDIO_CORE.normalizeProject) p=window.AMIYO_STUDIO_CORE.normalizeProject(p); return window.amiyoAdoptAssets(p); })
          .then(function(){ restoreSerializable(p); DF.sig=""; if(typeof scheduleAutosave==="function") scheduleAutosave(); say("Project opened from your folder"); });
      });
    });
  }
  function useFolder(h){ DF.h=h; DF.on=true; DF.sig=""; DF.last=0; DF.bk=0; return kSet("dir",h).then(function(){ return kSet("on",true); }).then(function(){ protect(true); return sync(true); }); }
  function pickFolder(){ if(!HAS_DIR) return Promise.resolve(); return window.showDirectoryPicker({id:"amiyo-editor",mode:"readwrite"}).then(useFolder).catch(function(e){ if(!e||e.name!=="AbortError") say("Could not use that folder: "+((e&&e.message)||e)); }); }
  function devSection(body){
    var box=document.createElement("div"); box.id="pwaDev"; body.appendChild(box);
    var h='<div class="pwa-st">', btns='';
    function row(k,t,d){ return '<div class="pwa-r"><i class="'+k+'"></i><div><b>'+esc(t)+'</b><span>'+esc(d)+'</span></div></div>'; }
    if(!HAS_DIR){
      box.innerHTML=h+row("warn","Save to a folder is not available in this browser","Chrome or Edge (desktop and Android) can save straight into a folder. Here you can still save the project as one file.")+'</div><div class="pwa-act"><button type="button" id="pwaSaveFile">Save project file to this device<small>Downloads the project with its media as one .amiyovideo file</small></button></div>';
      var sf=box.querySelector("#pwaSaveFile"); if(sf) sf.onclick=function(){ try{ saveProjectFile(); }catch(e){ say("Could not save the project file."); } };
      return;
    }
    if(!DF.h){
      box.innerHTML=h+row("warn","Direct save to your device is off","Pick a folder and Amiyo Editor copies your project and its media into it automatically, so your work lives in real files you own.")+'</div><div class="pwa-act"><button type="button" class="go" id="pwaPick">Choose a folder on this device</button></div>';
      box.querySelector("#pwaPick").onclick=function(){ pickFolder().then(function(){ openPanel(); }); }; return;
    }
    perm(DF.h,false).then(function(ok){
      var t=DF.last?new Date(DF.last).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"";
      var st=!ok?row("warn","Folder needs permission: "+DF.h.name,"The browser asks again after a restart. Tap Reconnect to continue saving."):row(DF.on?"ok":"warn",(DF.on?"Saving to folder: ":"Paused for folder: ")+DF.h.name,"Project and media go into the 'Amiyo Editor' folder inside it"+(t?" (last saved "+t+", "+DF.n+" media file"+(DF.n===1?"":"s")+")":"")+"."+(DF.err&&DF.err!=="reconnect"?" Last problem: "+DF.err:""));
      var b='<div class="pwa-act">';
      if(!ok) b+='<button type="button" class="go" id="pwaRe">Reconnect folder</button>';
      else b+='<button type="button" class="go" id="pwaNow">Save to folder now</button>';
      b+='<button type="button" id="pwaTog">'+(DF.on?"Pause automatic saving":"Resume automatic saving")+'</button><button type="button" id="pwaOpenList">Open a project from this folder<small>Restores the project and its media</small></button><div id="pwaList"></div><button type="button" id="pwaChg">Change folder</button><button type="button" id="pwaOff">Stop using this folder<small>Your files stay in the folder</small></button></div>';
      box.innerHTML=h+st+'</div>'+b;
      var g=function(i){ return box.querySelector("#"+i); };
      if(g("pwaRe")) g("pwaRe").onclick=function(){ perm(DF.h,true).then(function(ok2){ if(ok2) sync(true); openPanel(); }); };
      if(g("pwaNow")) g("pwaNow").onclick=function(){ say("Saving..."); sync(true).then(function(r){ say(r?"Saved to your folder":"Nothing new to save"); openPanel(); }); };
      g("pwaTog").onclick=function(){ DF.on=!DF.on; kSet("on",DF.on); if(DF.on) sync(true); openPanel(); };
      g("pwaChg").onclick=function(){ pickFolder().then(function(){ openPanel(); }); };
      g("pwaOff").onclick=function(){ DF.h=null; DF.last=0; kSet("dir",undefined); openPanel(); };
      g("pwaOpenList").onclick=function(){ var L=g("pwaList"); L.innerHTML='<p>Looking...</p>'; perm(DF.h,true).then(function(ok2){ if(!ok2){ L.innerHTML='<p>Permission needed.</p>'; return; } return Promise.all([listProjects(),listBackups()]).then(function(lists){
        var items=lists[0].concat(lists[1].length?[{hdr:"Earlier versions (kept automatically)"}]:[],lists[1]);
        if(!lists[0].length&&!lists[1].length){ L.innerHTML='<p>No saved projects found in this folder yet.</p>'; return; }
        L.innerHTML=''; items.forEach(function(it){ if(it.hdr){ var hd=document.createElement("div"); hd.className="pwa-sub"; hd.textContent=it.hdr; L.appendChild(hd); return; } var bt=document.createElement("button"); bt.type="button"; bt.style.cssText="width:100%;margin-bottom:6px"; bt.innerHTML=esc(it.name.replace(/^backups\//,"").replace(/\.amiyovideo$/i,""))+'<small>'+esc(new Date(it.t).toLocaleString())+' - '+fmt(it.size)+'</small>';
          bt.onclick=function(){ if(!confirm("Open this project? Your current project is kept in the editor's recovery points.")) return; restoreFrom(it.name).then(function(){ closePanel(); }).catch(function(e){ say("Could not open: "+((e&&e.message)||e)); }); }; L.appendChild(bt); }); }); }); };
    });
  }
  (function(){
    kGet("dir").then(function(h){ if(h&&h.kind==="directory"){ DF.h=h; return kGet("on").then(function(o){ DF.on=(o!==false); }); } });
    setInterval(function(){ if(!document.hidden) sync(false); },15000);
    document.addEventListener("visibilitychange",function(){ if(document.hidden) sync(false); });
    window.addEventListener("pagehide",function(){ sync(false); });
    window.__amiyoDeviceFolder={listBackups:listBackups,health:health,use:useFolder,sync:sync,list:listProjects,restore:restoreFrom,state:DF};
  })();
})();
try{ window.AMIYO_EDITOR_BUILD="pwa-step126-device"; }catch(_){}

;
/* ==================== Script 603 id="amiyo-workspaces" ==================== */
/* Step 126: Premiere-style workspaces. One tap re-arranges the editor for the job: Assembly, Editing, Color, Audio, Effects, Graphics, Review.
   Alt+Shift+1..7 switches, your last workspace is remembered. */
(function(){
  if(window.__amiyoWs) return; window.__amiyoWs=true;
  var WS=[
    {id:"assembly",name:"Assembly",panel:"media",cols:"clamp(300px,30vw,460px) minmax(0,1fr) 260px"},
    {id:"editing",name:"Editing",panel:"media",cols:""},
    {id:"color",name:"Color",panel:"color",cols:"clamp(260px,22vw,340px) minmax(0,1fr) clamp(320px,28vw,440px)"},
    {id:"audio",name:"Audio",panel:"audio",cols:"clamp(260px,24vw,380px) minmax(0,1fr) 300px"},
    {id:"effects",name:"Effects",panel:"effects",cols:"clamp(280px,26vw,400px) minmax(0,1fr) 280px"},
    {id:"graphics",name:"Graphics",panel:"text",cols:"clamp(260px,22vw,340px) minmax(0,1fr) clamp(320px,28vw,440px)"},
    {id:"review",name:"Review",panel:"",cols:"",review:true}
  ];
  var KEY="amiyo.workspace", cur="editing", btn=null, menu=null;
  function get(id){ for(var i=0;i<WS.length;i++) if(WS[i].id===id) return WS[i]; return WS[1]; }
  function store(v){ try{ localStorage.setItem(KEY,v); }catch(e){} }
  function saved(){ try{ return localStorage.getItem(KEY)||"editing"; }catch(e){ return "editing"; } }
  function desktop(){ return window.innerWidth>1024; }
  function layout(w){
    var ws=document.querySelector(".workspace"); if(!ws) return;
    document.body.classList.toggle("ws-review",!!w.review&&desktop());
    ws.style.gridTemplateColumns=(desktop()&&w.cols&&!w.review)?w.cols:"";
  }
  function label(){ var w=get(cur); if(btn){ var sp=btn.querySelector("b"); if(sp) sp.textContent=w.name; } }
  function apply(id,quiet){
    var w=get(id); cur=w.id; store(cur); layout(w);
    if(w.panel){ var nb=document.querySelector('.navbtn[data-panel="'+w.panel+'"]'); if(nb) try{ nb.click(); }catch(e){} }
    label();
    setTimeout(function(){ try{ window.dispatchEvent(new Event("resize")); }catch(e){} },60);
    if(!quiet&&typeof window.toast==="function") try{ window.toast("Workspace: "+w.name,1800); }catch(e){}
  }
  function close(){ if(menu){ menu.classList.remove("open"); } if(btn) btn.setAttribute("aria-expanded","false"); }
  function open(){
    if(!menu){
      menu=document.createElement("div"); menu.id="wsMenu"; menu.setAttribute("role","menu"); menu.setAttribute("aria-label","Workspaces");
      document.body.appendChild(menu);
      document.addEventListener("pointerdown",function(e){ if(menu.classList.contains("open")&&!menu.contains(e.target)&&!(btn&&btn.contains(e.target))) close(); },true);
      document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&menu.classList.contains("open")){ e.stopPropagation(); close(); if(btn) btn.focus(); } },true);
    }
    menu.innerHTML="";
    WS.forEach(function(w,i){ var b=document.createElement("button"); b.type="button"; b.setAttribute("role","menuitemradio"); b.setAttribute("aria-checked",w.id===cur?"true":"false"); b.innerHTML='<span>'+w.name+'</span><kbd>Alt+Shift+'+(i+1)+'</kbd>'; b.onclick=function(){ close(); apply(w.id); }; menu.appendChild(b); });
    menu.appendChild(document.createElement("hr"));
    var r=document.createElement("button"); r.type="button"; r.setAttribute("role","menuitem"); r.innerHTML='<span>Reset current workspace</span>'; r.onclick=function(){ close(); apply(cur); }; menu.appendChild(r);
    var rc=btn.getBoundingClientRect(); menu.classList.add("open"); menu.style.top=(rc.bottom+6)+"px"; menu.style.left=Math.max(8,Math.min(rc.left,window.innerWidth-menu.offsetWidth-8))+"px";
    btn.setAttribute("aria-expanded","true"); var f=menu.querySelector('[aria-checked="true"]')||menu.querySelector("button"); if(f) f.focus();
  }
  function build(){
    var tb=document.querySelector(".topbar"); if(!tb) return false;
    if(document.getElementById("wsBtn")){ btn=document.getElementById("wsBtn"); return true; }
    btn=document.createElement("button"); btn.type="button"; btn.id="wsBtn"; btn.setAttribute("aria-haspopup","menu"); btn.setAttribute("aria-expanded","false"); btn.title="Workspaces (Alt+Shift+1-7)";
    btn.innerHTML='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><rect x="1.8" y="2.5" width="12.4" height="11" rx="1.6"/><path d="M6 2.5v11M6 8h8.2"/></svg><small>Workspace</small><b style="font-weight:600">Editing</b>';
    btn.addEventListener("click",function(){ menu&&menu.classList.contains("open")?close():open(); });
    var st=document.getElementById("saveStatus"), sp=tb.querySelector(".top-spacer");
    tb.insertBefore(btn,st?st.nextSibling:(sp||null));
    return true;
  }
  document.addEventListener("keydown",function(e){
    if(!(e.altKey&&e.shiftKey)||e.ctrlKey||e.metaKey) return;
    var m=/^Digit([1-7])$/.exec(e.code||""); if(!m) return;
    var t=(e.target&&e.target.tagName)||""; if(/INPUT|TEXTAREA|SELECT/.test(t)||(e.target&&e.target.isContentEditable)) return;
    e.preventDefault(); e.stopPropagation(); apply(WS[+m[1]-1].id);
  },true);
  window.addEventListener("resize",function(){ layout(get(cur)); });
  var n=0, iv=setInterval(function(){ if(build()){ clearInterval(iv); var s=saved(); cur=get(s).id; setTimeout(function(){ if(cur!=="editing") apply(cur,true); else label(); },1200); } else if(++n>80) clearInterval(iv); },250);
  window.__amiyoWorkspace={apply:apply,list:WS,current:function(){ return cur; }};
})();

;
/* ==================== Script 604 id="amiyo-ov-step01" ==================== */
/* Overlay Studio step 1: shared helpers + Flip horizontal / vertical for overlays (and any video clip). */
(function(){"use strict";
var X=window.AMIYO_PIPX; if(!X||window.AMIYO_OV) return;
var OV=window.AMIYO_OV={v:1};
/* targets: the selected overlay, otherwise every overlay */
OV.targets=function(all){ var s=X.sel(); if(!all&&s&&s.clip.pip) return [s]; return X.pips(); };
OV.each=function(label,fn,all){ var t=OV.targets(all); if(!t.length){ X.toast("Add an overlay first"); return 0; } var n=0; X.change(label,function(){ t.forEach(function(o){ if(fn(o.clip,o.track)!==false) n++; }); if(!n) return false; }); return n; };
/* flip is applied while the clip is painted, so preview and export agree */
var di=ctx.drawImage;
ctx.drawImage=function(){ var f=ctx.__flip; if(f){ ctx.save(); ctx.scale(f.x?-1:1,f.y?-1:1); try{ return di.apply(ctx,arguments); } finally{ ctx.restore(); } } return di.apply(ctx,arguments); };
var paint=window.__amiyoPaintVideoClip;
window.__amiyoPaintVideoClip=function(track,el,clip){ ctx.__flip=(clip&&(clip.flipH||clip.flipV))?{x:!!clip.flipH,y:!!clip.flipV}:null; try{ return paint.apply(this,arguments); } finally{ ctx.__flip=null; } };
var ns=window.amiyoNeedsStack; window.amiyoNeedsStack=function(c){ return !!(c&&(c.flipH||c.flipV))||(ns?ns.apply(this,arguments):false); };
OV.flip=function(axis){ return OV.each("Flip overlay",function(c){ c[axis]=!c[axis]; }); };
X.add({id:"ov_fliph",group:"Overlay Studio",label:"Flip horizontal",needs:true,run:function(){ OV.flip("flipH"); }});
X.add({id:"ov_flipv",group:"Overlay Studio",label:"Flip vertical",needs:true,run:function(){ OV.flip("flipV"); }});
try{ window.AMIYO_EDITOR_BUILD="ov-step127-flip"; }catch(e){}
})();

;
/* ==================== Script 605 id="amiyo-ov-step02" ==================== */
/* Overlay Studio step 2: blend modes for overlays (Screen, Multiply, Overlay...) from the PiP+ menu. */
(function(){"use strict";
var X=window.AMIYO_PIPX, OV=window.AMIYO_OV; if(!X||!OV||OV.blend) return;
var M=window.__amiyoBlendModes||{};
var want=[["normal","Normal"],["screen","Screen"],["multiply","Multiply"],["overlay","Overlay"],["softlight","Soft light"],["lighten","Lighten"],["darken","Darken"],["difference","Difference"]];
OV.blend=function(mode){ return OV.each("Overlay blend: "+mode,function(c){ if(mode==="normal") delete c.blendMode; else c.blendMode=mode; }); };
want.forEach(function(w){ var k=w[0]; if(k!=="normal"&&!(k in M)&&!(k.replace("softlight","soft-light") in M)) return;
  X.add({id:"ov_bl_"+k,group:"Blend mode",label:w[1],needs:true,run:function(){ var key=(k in M||k==="normal")?k:k.replace("softlight","soft-light"); if(OV.blend(key)) X.toast("Blend: "+w[1]); }}); });
try{ window.AMIYO_EDITOR_BUILD="ov-step128-blend"; }catch(e){}
})();

;
/* ==================== Script 606 id="amiyo-ov-step03" ==================== */
/* Overlay Studio step 3: one-click colour looks for overlays (B&W, Vivid, Warm, Cool, Faded) + reset. */
(function(){"use strict";
var X=window.AMIYO_PIPX, OV=window.AMIYO_OV; if(!X||!OV||OV.look) return;
var TAG="ovlook", LOOKS={
  bw:[["grayscale",1]], vivid:[["saturation",1.45],["contrast",1.12]], warm:[["sepia",.35],["saturation",1.1]],
  cool:[["lumTemp",-35],["saturation",1.05]], faded:[["lumFade",.6],["saturation",.85]] };
OV.look=function(id){ return OV.each("Overlay look: "+id,function(c){
  c.effects=(c.effects||[]).filter(function(f){ return f.tag!==TAG; });
  (LOOKS[id]||[]).forEach(function(p){ c.effects.push({id:"fx_"+Math.random().toString(36).slice(2,9),name:p[0],value:p[1],enabled:true,tag:TAG}); }); }); };
[["bw","Black & white"],["vivid","Vivid"],["warm","Warm"],["cool","Cool"],["faded","Faded"],["none","Remove look"]].forEach(function(l){
  X.add({id:"ov_look_"+l[0],group:"Overlay look",label:l[1],needs:true,run:function(){ if(OV.look(l[0])) X.toast("Look: "+l[1]); }}); });
try{ window.AMIYO_EDITOR_BUILD="ov-step129-look"; }catch(e){}
})();

;
/* ==================== Script 607 id="amiyo-ov-step04" ==================== */
/* Overlay Studio step 4: overlay speed presets. Length on the timeline follows the speed and never runs past the main clip. */
(function(){"use strict";
var X=window.AMIYO_PIPX, OV=window.AMIYO_OV; if(!X||!OV||OV.speed) return;
OV.speed=function(s){ return OV.each("Overlay speed "+s+"x",function(c){
  var a=getAsset(c.assetId); if(!a||a.type!=="video") return false;
  var span=(c.outPoint!=null&&c.inPoint!=null&&c.outPoint>c.inPoint)?(c.outPoint-c.inPoint):c.duration*(c.speed||1);
  var d=span/s, lim=Infinity;
  if(c.pip&&c.pip.main){ var m=window.AMIYO_PIP.find(c.pip.main); if(m) lim=m.clip.start+m.clip.duration-c.start; }
  d=Math.max(.3,Math.min(d,lim)); c.speed=s; c.duration=d; c.outPoint=(c.inPoint||0)+d*s; }); };
[[.5,"Slow 0.5×"],[1,"Normal 1×"],[1.5,"Fast 1.5×"],[2,"Fast 2×"]].forEach(function(p){
  X.add({id:"ov_sp_"+p[0],group:"Overlay speed",label:p[1],needs:true,run:function(){ if(OV.speed(p[0])) X.toast("Speed "+p[0]+"×"); }}); });
try{ window.AMIYO_EDITOR_BUILD="ov-step130-speed"; }catch(e){}
})();

;
/* ==================== Script 608 id="amiyo-ov-step05" ==================== */
/* Overlay Studio step 5: loop a short overlay until the main clip ends (repeats sit back to back on the same PiP track). */
(function(){"use strict";
var X=window.AMIYO_PIPX, OV=window.AMIYO_OV; if(!X||!OV||OV.loop) return;
OV.loop=function(){ var s=X.sel(), t=(s&&s.clip.pip)?[s]:[]; if(!t.length){ X.toast("Select an overlay first"); return 0; }
  var added=0; X.change("Loop overlay to fill main",function(){
    t.forEach(function(o){ var c=o.clip, m=c.pip.main&&window.AMIYO_PIP.find(c.pip.main); if(!m) return;
      var end=m.clip.start+m.clip.duration, cur=c.start+c.duration, ids=o.track.clips.filter(function(x){return x.start>=cur-.01;});
      if(ids.length) return; /* something already follows it on this track */
      var base=deepClone(c), n=0;
      while(cur<end-.05&&n<60){ var k=deepClone(base); k.id=uid("clip"); k.start=cur; k.duration=Math.min(base.duration,end-cur); k.outPoint=(k.inPoint||0)+k.duration*(k.speed||1); o.track.clips.push(k); cur+=k.duration; n++; added++; } });
    if(!added) return false; });
  X.toast(added?("Looped "+added+" more time"+(added===1?"":"s")):"Already fills the main clip"); return added; };
X.add({id:"ov_loop",group:"Overlay Studio",label:"Loop overlay to fill main clip",needs:true,run:function(){ OV.loop(); }});
try{ window.AMIYO_EDITOR_BUILD="ov-step131-loop"; }catch(e){}
})();

;
/* ==================== Script 609 id="amiyo-ov-step06" ==================== */
/* Overlay Studio step 6: overlay sound - volume presets, mute all overlays, "only this overlay has sound". */
(function(){"use strict";
var X=window.AMIYO_PIPX, OV=window.AMIYO_OV; if(!X||!OV||OV.vol) return;
OV.vol=function(v){ return OV.each("Overlay volume "+Math.round(v*100)+"%",function(c,t){ if(!(getAsset(c.assetId)||{}).type||getAsset(c.assetId).type!=="video") return false; c.volume=v; t.muted=(v===0); }); };
OV.muteAll=function(on){ return OV.each(on?"Mute all overlays":"Unmute all overlays",function(c,t){ t.muted=on; if(!on&&!(c.volume>0)) c.volume=1; },true); };
OV.solo=function(){ var s=X.sel(); if(!s||!s.clip.pip){ X.toast("Select an overlay first"); return 0; }
  return OV.each("Only this overlay has sound",function(c,t){ var me=(c.id===s.clip.id)||(t===s.track); t.muted=!me; if(me&&!(c.volume>0)) c.volume=1; },true); };
[[0,"Mute"],[.5,"50%"],[1,"100%"],[1.5,"Boost 150%"]].forEach(function(p){ X.add({id:"ov_vol_"+p[0],group:"Overlay sound",label:p[1],needs:true,run:function(){ if(OV.vol(p[0])) X.toast("Overlay volume "+p[1]); }}); });
X.add({id:"ov_solo",group:"Overlay sound",label:"Only this overlay has sound",needs:true,run:function(){ OV.solo(); }});
X.add({id:"ov_muteall",group:"Overlay sound",label:"Mute all overlays",needs:true,run:function(){ OV.muteAll(true); }});
X.add({id:"ov_unmuteall",group:"Overlay sound",label:"Unmute all overlays",needs:true,run:function(){ OV.muteAll(false); }});
try{ window.AMIYO_EDITOR_BUILD="ov-step132-sound"; }catch(e){}
})();

;
/* ==================== Script 610 id="amiyo-ov-step07" ==================== */
/* Overlay Studio step 7: overlay timing - start at playhead, end at playhead, extend to the end of the main clip. */
(function(){"use strict";
var X=window.AMIYO_PIPX, OV=window.AMIYO_OV; if(!X||!OV||OV.timing) return;
function mainOf(c){ return c.pip&&c.pip.main?window.AMIYO_PIP.find(c.pip.main):null; }
function srcCap(c){ var a=getAsset(c.assetId); if(!a||a.type!=="video"||!(a.duration>0)) return Infinity; return Math.max(.3,(a.duration-(c.inPoint||0))/(c.speed||1)); }
function fix(c){ c.outPoint=(c.inPoint||0)+c.duration*(c.speed||1); }
OV.timing={
  start:function(){ return OV.each("Overlay starts at playhead",function(c){ var m=mainOf(c); if(!m) return false; var end=c.start+c.duration, ms=m.clip.start, me=ms+m.clip.duration;
    var ns=Math.max(ms,Math.min(currentTime,me-.3)); c.start=ns; c.duration=Math.max(.3,Math.min(c.duration,me-ns)); fix(c); }); },
  end:function(){ return OV.each("Overlay ends at playhead",function(c){ var d=currentTime-c.start; if(d<.3) return false; c.duration=Math.min(d,srcCap(c)); fix(c); }); },
  extend:function(){ return OV.each("Extend overlay to main end",function(c){ var m=mainOf(c); if(!m) return false; var d=Math.min(m.clip.start+m.clip.duration-c.start,srcCap(c)); if(d<=c.duration+.02) return false; c.duration=d; fix(c); }); }
};
X.add({id:"ov_t_start",group:"Overlay timing",label:"Start at playhead",needs:true,run:function(){ if(OV.timing.start()) X.toast("Overlay now starts here"); }});
X.add({id:"ov_t_end",group:"Overlay timing",label:"End at playhead",needs:true,run:function(){ if(OV.timing.end()) X.toast("Overlay now ends here"); else X.toast("Move the playhead later than the overlay start"); }});
X.add({id:"ov_t_ext",group:"Overlay timing",label:"Extend to end of main clip",needs:true,run:function(){ if(OV.timing.extend()) X.toast("Extended"); else X.toast("Cannot extend further"); }});
try{ window.AMIYO_EDITOR_BUILD="ov-step133-timing"; }catch(e){}
})();

;
/* ==================== Script 611 id="amiyo-ov-step08" ==================== */
/* Overlay Studio step 8: overlay opacity presets (100 / 75 / 50 / 25 %). */
(function(){"use strict";
var X=window.AMIYO_PIPX, OV=window.AMIYO_OV; if(!X||!OV||OV.opacity) return;
OV.opacity=function(v){ return OV.each("Overlay opacity "+Math.round(v*100)+"%",function(c){ c.opacity=v; }); };
[1,.75,.5,.25].forEach(function(v){ X.add({id:"ov_op_"+v,group:"Overlay opacity",label:Math.round(v*100)+"%",needs:true,run:function(){ if(OV.opacity(v)) X.toast("Opacity "+Math.round(v*100)+"%"); }}); });
try{ window.AMIYO_EDITOR_BUILD="ov-step134-opacity"; }catch(e){}
})();

;
/* ==================== Script 612 id="amiyo-ov-step09" ==================== */
/* Overlay Studio step 9: overlay size presets (S / M / L / XL), kept inside the frame. */
(function(){"use strict";
var X=window.AMIYO_PIPX, OV=window.AMIYO_OV, A=window.AMIYO_PIP; if(!X||!OV||!A||OV.size) return;
OV.size=function(s){ return OV.each("Overlay size "+s,function(c){ A.setSize(c,s); if(window.AMIYO_PIPFIT) window.AMIYO_PIPFIT.fitOne(c); }); };
[[.15,"Small 15%"],[.25,"Medium 25%"],[.4,"Large 40%"],[.6,"Extra large 60%"]].forEach(function(p){
  X.add({id:"ov_size_"+p[0],group:"Overlay size",label:p[1],needs:true,run:function(){ if(OV.size(p[0])) X.toast("Size "+p[1]); }}); });
try{ window.AMIYO_EDITOR_BUILD="ov-step135-size"; }catch(e){}
})();

;
/* ==================== Script 613 id="amiyo-ov-step10" ==================== */
/* Overlay Studio step 10: move overlay to a corner / edge / centre, respecting its size. */
(function(){"use strict";
var X=window.AMIYO_PIPX, OV=window.AMIYO_OV, A=window.AMIYO_PIP; if(!X||!OV||!A||OV.corner) return;
var M=.03;
OV.corner=function(h,v){ return OV.each("Move overlay",function(c){ var d=A.boxDims(c), hw=d.w/2, hh=d.h/2;
  c.x=h<0?M+hw:h>0?1-M-hw:.5; c.y=v<0?M+hh:v>0?1-M-hh:.5; }); };
[["Top left",-1,-1],["Top right",1,-1],["Bottom left",-1,1],["Bottom right",1,1],["Center",0,0],["Top center",0,-1],["Bottom center",0,1]].forEach(function(p,i){
  X.add({id:"ov_pos_"+i,group:"Overlay position",label:p[0],needs:true,run:function(){ if(OV.corner(p[1],p[2])) X.toast(p[0]); }}); });
try{ window.AMIYO_EDITOR_BUILD="ov-step136-corner"; }catch(e){}
})();

;
/* ==================== Script 614 id="amiyo-ov-step11" ==================== */
/* Overlay Studio step 11: rotate overlay by 90 degrees or reset to upright. */
(function(){"use strict";
var X=window.AMIYO_PIPX, OV=window.AMIYO_OV; if(!X||!OV||OV.rot) return;
OV.rot=function(d){ return OV.each("Rotate overlay",function(c){ c.rotation=d===null?0:(((c.rotation||0)+d)%360+360)%360; if(c.rotation>180) c.rotation-=360; if(window.AMIYO_PIPFIT) window.AMIYO_PIPFIT.fitOne(c); }); };
X.add({id:"ov_rot_r",group:"Overlay rotate",label:"Rotate 90° right",needs:true,run:function(){ OV.rot(90); }});
X.add({id:"ov_rot_l",group:"Overlay rotate",label:"Rotate 90° left",needs:true,run:function(){ OV.rot(-90); }});
X.add({id:"ov_rot_15",group:"Overlay rotate",label:"Tilt 15° right",needs:true,run:function(){ OV.rot(15); }});
X.add({id:"ov_rot_0",group:"Overlay rotate",label:"Upright (0°)",needs:true,run:function(){ OV.rot(null); }});
try{ window.AMIYO_EDITOR_BUILD="ov-step137-rotate"; }catch(e){}
})();

;
/* ==================== Script 615 id="amiyo-ov-step12" ==================== */
/* Overlay Studio step 12: quick border colours and widths for overlays. */
(function(){"use strict";
var X=window.AMIYO_PIPX, OV=window.AMIYO_OV; if(!X||!OV||OV.border) return;
OV.border=function(color,w){ return OV.each("Overlay border",function(c){ c.pip=c.pip||{}; if(color) c.pip.color=color; if(w!=null) c.pip.border=w; c.pip.sig=null; c.pip.sig2=null; }); };
[["#ffffff","White"],["#000000","Black"],["#ff7a3d","Orange"],["#2dd4bf","Teal"],["#facc15","Yellow"],["#f43f5e","Red"]].forEach(function(p){
  X.add({id:"ov_bc_"+p[0].slice(1),group:"Overlay border",label:p[1]+" border",needs:true,run:function(){ if(OV.border(p[0],null)) X.toast(p[1]+" border"); }}); });
[[0,"No border"],[3,"Thin 3"],[8,"Thick 8"]].forEach(function(p){ X.add({id:"ov_bw_"+p[0],group:"Overlay border",label:p[1],needs:true,run:function(){ OV.border(null,p[0]); }}); });
try{ window.AMIYO_EDITOR_BUILD="ov-step138-border"; }catch(e){}
})();

;
/* ==================== Script 616 id="amiyo-ov-step13" ==================== */
/* Overlay Studio step 13: swap the main video and the selected overlay (each keeps its own slot, shape and position). */
(function(){"use strict";
var X=window.AMIYO_PIPX, OV=window.AMIYO_OV, A=window.AMIYO_PIP; if(!X||!OV||!A||OV.swap) return;
OV.swap=function(){ var s=X.sel(); if(!s||!s.clip.pip||!s.clip.pip.main){ X.toast("Select an overlay first"); return false; }
  var m=A.find(s.clip.pip.main); if(!m){ X.toast("Main clip not found"); return false; }
  var o=s.clip, mc=m.clip, ao=getAsset(o.assetId), am=getAsset(mc.assetId);
  if(!ao||!am||ao.type!=="video"||am.type!=="video"){ X.toast("Swap works with two videos"); return false; }
  var needM=mc.duration*(mc.speed||1), needO=o.duration*(o.speed||1);
  if(!(ao.duration>=needM-.1)){ X.toast("Overlay video is too short to become the main clip"); return false; }
  if(!(am.duration>=needO-.1)){ X.toast("Main video is too short to be the overlay"); return false; }
  return X.change("Swap main and overlay",function(){ var t=o.assetId; o.assetId=mc.assetId; mc.assetId=t; o.inPoint=0; mc.inPoint=0; o.outPoint=needO; mc.outPoint=needM; }); };
X.add({id:"ov_swap",group:"Overlay Studio",label:"Swap main video and this overlay",needs:true,run:function(){ if(OV.swap()) X.toast("Swapped"); }});
try{ window.AMIYO_EDITOR_BUILD="ov-step139-swap"; }catch(e){}
})();

;
/* ==================== Script 617 id="amiyo-ov-step14" ==================== */
/* Overlay Studio step 14: add a mirrored copy of the selected overlay on the opposite side of the frame (silent, on its own PiP track). */
(function(){"use strict";
var X=window.AMIYO_PIPX, OV=window.AMIYO_OV, A=window.AMIYO_PIP; if(!X||!OV||!A||OV.mirror) return;
OV.mirror=function(){ var s=X.sel(); if(!s||!s.clip.pip||!s.clip.pip.main){ X.toast("Select an overlay first"); return null; }
  var c=s.clip, m=A.find(c.pip.main); if(!m) return null;
  var r=A.create(m.clip.id,c.assetId,{shape:c.pip.shape,size:A.size(c),x:1-(c.x==null?.5:c.x),y:c.y==null?.5:c.y,start:c.start-m.clip.start,dur:c.duration,inP:c.inPoint||0,sound:false,border:c.pip.border,color:c.pip.color,shadow:c.pip.shadow});
  if(!r) return null; var n=r.clip;
  X.change("Mirror overlay",function(){ n.rotation=-(c.rotation||0); n.opacity=c.opacity==null?1:c.opacity; n.flipH=!c.flipH; n.flipV=!!c.flipV; n.speed=c.speed||1; n.outPoint=(n.inPoint||0)+n.duration*n.speed;
    if(c.blendMode) n.blendMode=c.blendMode; n.effects=deepClone(c.effects||[]); n.pip.bstyle=c.pip.bstyle; n.pip.glow=c.pip.glow; n.pip.sig=null; n.pip.sig2=null; });
  X.toast("Mirrored copy added"); return r; };
X.add({id:"ov_mirror",group:"Overlay Studio",label:"Add mirrored copy on the other side",needs:true,run:function(){ OV.mirror(); }});
try{ window.AMIYO_EDITOR_BUILD="ov-step140-mirror"; }catch(e){}
})();

;
/* ==================== Script 618 id="amiyo-ov-step15" ==================== */
/* Overlay Studio step 15: slow zoom in / out (Ken Burns) on overlays using keyframes; "Remove motion" clears them. */
(function(){"use strict";
var X=window.AMIYO_PIPX, OV=window.AMIYO_OV; if(!X||!OV||OV.kb) return;
OV.kb=function(mode){ return OV.each("Overlay motion: "+mode,function(c){
  if(mode==="none"){ if(!(c.keyframes||[]).length) return false; c.keyframes=[]; return; }
  var s=c.scale||1, f=mode==="in"?1.18:1/1.18, x=c.x==null?.5:c.x, y=c.y==null?.5:c.y, d=Math.max(.2,c.duration);
  c.keyframes=[{t:0,x:x,y:y,scale:s,opacity:c.opacity==null?1:c.opacity,rotation:c.rotation||0},{t:d,x:x,y:y,scale:s*f,opacity:c.opacity==null?1:c.opacity,rotation:c.rotation||0}]; }); };
X.add({id:"ov_kb_in",group:"Overlay motion",label:"Slow zoom in",needs:true,run:function(){ if(OV.kb("in")) X.toast("Slow zoom in"); }});
X.add({id:"ov_kb_out",group:"Overlay motion",label:"Slow zoom out",needs:true,run:function(){ if(OV.kb("out")) X.toast("Slow zoom out"); }});
X.add({id:"ov_kb_none",group:"Overlay motion",label:"Remove motion",needs:true,run:function(){ OV.kb("none"); }});
try{ window.AMIYO_EDITOR_BUILD="ov-step141-motion"; }catch(e){}
})();

;
/* ==================== Script 619 id="amiyo-ov-step16" ==================== */
/* Overlay Studio step 16: title-safe (80%) and action-safe (90%) guides on the preview, like a broadcast monitor. Guides never render into exports. */
(function(){"use strict";
var X=window.AMIYO_PIPX, OV=window.AMIYO_OV; if(!X||!OV||OV.safe) return;
var el=null, raf=0;
function place(){ if(!el) return; var r=canvas.getBoundingClientRect(); el.style.left=r.left+"px"; el.style.top=r.top+"px"; el.style.width=r.width+"px"; el.style.height=r.height+"px"; raf=requestAnimationFrame(place); }
OV.safe=function(on){ if(on==null) on=!el;
  if(!on){ if(el){ el.remove(); el=null; cancelAnimationFrame(raf); } return false; }
  if(el) return true;
  el=document.createElement("div"); el.id="ovSafeGuides"; el.setAttribute("aria-hidden","true");
  el.style.cssText="position:fixed;pointer-events:none;z-index:50;";
  el.innerHTML='<div style="position:absolute;inset:5%;border:1px dashed rgba(255,214,102,.85)"></div><div style="position:absolute;inset:10%;border:1px dashed rgba(255,165,120,.85)"></div><div style="position:absolute;left:50%;top:0;bottom:0;border-left:1px solid rgba(255,255,255,.25)"></div><div style="position:absolute;top:50%;left:0;right:0;border-top:1px solid rgba(255,255,255,.25)"></div>';
  document.body.appendChild(el); place(); return true; };
X.add({id:"ov_safe",group:"Preview",label:"Toggle safe-margin guides",needs:false,run:function(){ X.toast(OV.safe()?"Safe guides on (outer 90%, inner 80%)":"Safe guides off"); }});
try{ window.AMIYO_EDITOR_BUILD="ov-step142-safe"; }catch(e){}
})();

;
/* ==================== Script 620 id="amiyo-ov-step17" ==================== */
/* Overlay Studio step 17: jump the playhead to the previous / next overlay start or end (Alt+[ and Alt+]). */
(function(){"use strict";
var X=window.AMIYO_PIPX, OV=window.AMIYO_OV; if(!X||!OV||OV.jump) return;
OV.points=function(){ var p=[]; X.pips().forEach(function(o){ p.push(o.clip.start,o.clip.start+o.clip.duration); }); return p.sort(function(a,b){return a-b;}); };
OV.jump=function(dir){ var pts=OV.points(), t=currentTime, tgt=null;
  if(dir>0){ for(var i=0;i<pts.length;i++) if(pts[i]>t+.02){ tgt=pts[i]; break; } } else { for(var j=pts.length-1;j>=0;j--) if(pts[j]<t-.02){ tgt=pts[j]; break; } }
  if(tgt==null){ X.toast(pts.length?(dir>0?"No later overlay edit":"No earlier overlay edit"):"No overlays yet"); return null; }
  currentTime=tgt; try{ renderAll(); renderPreviewFrame(); }catch(e){} return tgt; };
X.add({id:"ov_j_prev",group:"Overlay navigation",label:"Previous overlay edit point",hint:"Alt+[",needs:true,run:function(){ OV.jump(-1); }});
X.add({id:"ov_j_next",group:"Overlay navigation",label:"Next overlay edit point",hint:"Alt+]",needs:true,run:function(){ OV.jump(1); }});
document.addEventListener("keydown",function(e){ if(!e.altKey||e.ctrlKey||e.metaKey) return; var t=(e.target&&e.target.tagName)||""; if(/INPUT|TEXTAREA|SELECT/.test(t)||(e.target&&e.target.isContentEditable)) return;
  if(e.code==="BracketRight"){ e.preventDefault(); OV.jump(1); } else if(e.code==="BracketLeft"){ e.preventDefault(); OV.jump(-1); } },true);
try{ window.AMIYO_EDITOR_BUILD="ov-step143-jump"; }catch(e){}
})();

;
/* ==================== Script 621 id="amiyo-ov-step18" ==================== */
/* Overlay Studio step 18: overlay report - one table of every overlay (video, shape, size, time, sound, blend, flip). Click a row to select it. */
(function(){"use strict";
var X=window.AMIYO_PIPX, OV=window.AMIYO_OV, A=window.AMIYO_PIP; if(!X||!OV||!A||OV.report) return;
function esc2(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }
function f(t){ try{ return fmtT(t); }catch(e){ return t.toFixed(1)+"s"; } }
OV.rows=function(){ return X.pips().map(function(o,i){ var c=o.clip, a=getAsset(c.assetId)||{}, m=c.pip.main&&A.find(c.pip.main);
  return {id:c.id,n:i+1,name:a.name||"Video",shape:c.pip.shape||"",size:Math.round(A.size(c)*100)+"%",from:f(c.start),to:f(c.start+c.duration),
    sound:(!o.track.muted&&(c.volume==null?1:c.volume)>0)?"On":"Muted",blend:c.blendMode||"normal",flip:(c.flipH?"H":"")+(c.flipV?"V":"")||"-",main:m?((getAsset(m.clip.assetId)||{}).name||"Main"):"-"}; }); };
OV.report=function(){ var r=OV.rows();
  if(!r.length){ openModal("Overlay report",'<div class="mempty"><b>No overlays yet</b>Attach videos with “Attach as PiP overlay” first.</div>'); return r; }
  var h='<div style="overflow:auto"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr>'+["#","Video","Shape","Size","From","To","Sound","Blend","Flip","On main"].map(function(x){return '<th style="text-align:left;padding:4px 6px;border-bottom:1px solid #3a3226">'+x+'</th>';}).join("")+'</tr></thead><tbody>'+
    r.map(function(o){ return '<tr data-ovr="'+o.id+'" style="cursor:pointer">'+[o.n,o.name,o.shape,o.size,o.from,o.to,o.sound,o.blend,o.flip,o.main].map(function(x){return '<td style="padding:4px 6px;border-bottom:1px solid #2a2318">'+esc2(x)+'</td>';}).join("")+'</tr>'; }).join("")+'</tbody></table></div><p style="font-size:11px;opacity:.7">'+r.length+' overlay'+(r.length===1?"":"s")+' · click a row to select it</p>';
  openModal("Overlay report",h);
  var mb=document.getElementById("modalBody"); if(mb) mb.querySelectorAll("[data-ovr]").forEach(function(tr){ tr.onclick=function(){ selectedClipId=tr.dataset.ovr; try{ var c=X.sel(); if(c) selectedTrackId=c.track.id; renderAll(); }catch(e){} }; });
  return r; };
X.add({id:"ov_report",group:"Info",label:"Overlay report (all overlays)",needs:true,run:function(){ OV.report(); }});
try{ window.AMIYO_EDITOR_BUILD="ov-step144-report"; }catch(e){}
})();

;
/* ==================== Script 622 id="amiyo-ov-step19" ==================== */
/* Overlay Studio step 19: reset overlay styling - clears flip, blend, looks, motion, tilt and opacity. Timing, shape, size, position and sound are kept. */
(function(){"use strict";
var X=window.AMIYO_PIPX, OV=window.AMIYO_OV; if(!X||!OV||OV.reset) return;
OV.reset=function(all){ return OV.each("Reset overlay style",function(c){
  delete c.flipH; delete c.flipV; delete c.blendMode; c.effects=[]; c.keyframes=[]; c.rotation=0; c.opacity=1;
  if(c.pip){ c.pip.sig=null; c.pip.sig2=null; } if(window.AMIYO_PIPFIT) window.AMIYO_PIPFIT.fitOne(c); },all); };
X.add({id:"ov_reset",group:"Overlay Studio",label:"Reset style of this overlay",needs:true,run:function(){ if(OV.reset(false)) X.toast("Style reset"); }});
X.add({id:"ov_reset_all",group:"Overlay Studio",label:"Reset style of all overlays",needs:true,run:function(){ if(OV.reset(true)) X.toast("All overlay styles reset"); }});
try{ window.AMIYO_EDITOR_BUILD="ov-step145-reset"; }catch(e){}
})();

;
/* ==================== Script 623 id="amiyo-ov-step20" ==================== */
/* Overlay Studio step 20: self-test (read-only checks of every Overlay Studio tool) and release label. */
(function(){"use strict";
var X=window.AMIYO_PIPX, OV=window.AMIYO_OV; if(!X||!OV||OV.selfTest) return;
OV.selfTest=function(){ var checks=[], ok=function(n,v){ checks.push([n,!!v]); };
  ["flip","blend","look","speed","loop","vol","muteAll","solo","timing","opacity","size","corner","rot","border","swap","mirror","kb","safe","jump","report","reset"].forEach(function(k){ ok("tool: "+k,typeof OV[k]!=="undefined"); });
  ["ov_fliph","ov_bl_screen","ov_look_bw","ov_sp_2","ov_loop","ov_solo","ov_t_start","ov_op_0.5","ov_size_0.25","ov_pos_0","ov_rot_r","ov_bc_ffffff","ov_swap","ov_mirror","ov_kb_in","ov_safe","ov_j_next","ov_report","ov_reset"].forEach(function(id){ ok("menu: "+id,X.items.some(function(i){return i.id===id;})); });
  ok("flip survives save",(function(){ try{ var s=JSON.stringify(serializableProject()); return typeof s==="string"; }catch(e){ return false; } })());
  ok("draw hooks installed",typeof ctx.drawImage==="function"&&typeof window.__amiyoPaintVideoClip==="function");
  var bad=checks.filter(function(c){return !c[1];});
  return {total:checks.length,failed:bad.map(function(c){return c[0];}),passed:checks.length-bad.length}; };
X.add({id:"ov_selftest",group:"Info",label:"Run Overlay Studio self-test",needs:false,run:function(){ var r=OV.selfTest(); X.toast(r.failed.length?("Self-test: "+r.failed.length+" problem(s): "+r.failed.slice(0,3).join(", ")):("Self-test passed ("+r.passed+" checks)"),4500); }});
OV.version="Overlay Studio 1.0 (steps 127-146)";
try{ window.AMIYO_EDITOR_BUILD="ov-step146-release"; }catch(e){}
})();

;
/* ==================== Script 624 id="amiyo-libx-step01" ==================== */
/* Library Studio step 1: "Lib+" menu in the Library toolbar + helpers every later library tool uses (selection, save, rebuild). */
(function(){"use strict";
var M=window.amiyoMediaLib; if(!M||!M.persist||window.AMIYO_LIBX) return;
var items=[], X=window.AMIYO_LIBX={items:items,v:1};
X.all=function(){ return M.items(); };
X.sel=function(){ var s=M.state.sel; var a=[]; M.items().forEach(function(i){ if(s.has(i.id)) a.push(i); }); return a; };
X.targets=function(){ var s=X.sel(); return s.length?s:visible(); };
function visible(){ var ids=[]; document.querySelectorAll("#mlibBody [data-lib]").forEach(function(c){ ids.push(c.dataset.lib); }); var all=M.items(); var v=ids.map(function(id){return all.find(function(i){return i.id===id;});}).filter(Boolean); return v.length?v:all; }
X.visible=visible;
X.toast=function(m,ms){ try{ toast(m,ms||2600); }catch(e){} };
X.save=function(list){ list.forEach(function(i){ try{ M.persist(i); }catch(e){} }); try{ M.render(); }catch(e){} };
X.add=function(o){ if(!o||!o.id) return; var i=items.findIndex(function(x){return x.id===o.id;}); if(i>=0) items[i]=o; else items.push(o); };
var menu=null;
function close(){ if(menu){ menu.remove(); menu=null; document.removeEventListener("pointerdown",away,true); document.removeEventListener("keydown",esc,true); } }
function away(e){ if(menu&&!menu.contains(e.target)&&e.target.id!=="libxBtn") close(); }
function esc(e){ if(e.key==="Escape") close(); }
function open(){ close(); var b=document.getElementById("libxBtn"); if(!b) return;
  menu=document.createElement("div"); menu.id="libxMenu"; menu.setAttribute("role","menu");
  menu.style.cssText="position:fixed;z-index:99990;min-width:230px;max-width:min(320px,94vw);max-height:70vh;overflow:auto;background:#17140f;border:1px solid #3a3226;border-radius:10px;box-shadow:0 14px 40px rgba(0,0,0,.55);padding:6px;font:12px/1.35 system-ui,sans-serif;color:#e6dfd0";
  var groups={}, order=[]; items.forEach(function(it){ var g=it.group||"Tools"; if(!groups[g]){ groups[g]=[]; order.push(g); } groups[g].push(it); });
  var h=""; order.forEach(function(g){ h+='<div style="margin:8px 8px 3px;font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:#847a6b;font-weight:700">'+g+"</div>"; groups[g].forEach(function(it){ h+='<button type="button" role="menuitem" data-id="'+it.id+'" style="display:flex;width:100%;gap:8px;text-align:left;background:none;border:0;color:inherit;padding:7px 8px;border-radius:6px;cursor:pointer;font:inherit">'+it.label+(it.hint?'<small style="margin-left:auto;color:#847a6b">'+it.hint+"</small>":"")+"</button>"; }); });
  menu.innerHTML=h; document.body.appendChild(menu);
  var r=b.getBoundingClientRect(); menu.style.left=Math.max(6,Math.min(innerWidth-menu.offsetWidth-6,r.left))+"px"; menu.style.top=Math.max(6,Math.min(innerHeight-menu.offsetHeight-6,r.bottom+6))+"px";
  menu.onclick=function(e){ var bt=e.target.closest("button[data-id]"); if(!bt) return; var it=items.find(function(x){return x.id===bt.dataset.id;}); close(); if(it&&it.run){ try{ it.run(); }catch(err){ try{ window.__swl&&window.__swl(err); }catch(_){} X.toast("Could not do that"); } } };
  document.addEventListener("pointerdown",away,true); document.addEventListener("keydown",esc,true); }
X.open=open; X.close=close;
function mk(){ var bar=document.querySelector("#mlibBody .mlib-tools"); if(!bar||document.getElementById("libxBtn")) return;
  var b=document.createElement("button"); b.type="button"; b.id="libxBtn"; b.className="chip"; b.textContent="Lib+"; b.title="More library tools"; b.setAttribute("aria-haspopup","menu");
  b.style.cssText="border-color:rgba(255,122,61,.6);font-weight:700"; b.onclick=function(){ if(menu) close(); else open(); }; bar.appendChild(b); }
new MutationObserver(mk).observe(document.body,{childList:true,subtree:true}); mk();
X.add({id:"lx_about",group:"Info",label:"Library tools loaded",hint:"v1",run:function(){ X.toast("Lib+ menu is ready"); }});
try{ window.AMIYO_EDITOR_BUILD="lib-step147-bridge"; }catch(e){}
})();

;
/* ==================== Script 625 id="amiyo-libx-step02" ==================== */
/* Library Studio step 2: star ratings (1-5) on library files, shown as a badge on each card, with a "minimum stars" filter. Select files first. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||X.rate) return;
var minStars=0;
X.rate=function(n){ var s=X.sel(); if(!s.length){ X.toast("Select one or more files first (Select button)"); return 0; }
  s.forEach(function(i){ if(n>0) i.rating=n; else delete i.rating; }); X.save(s); return s.length; };
function badges(){ var cards=document.querySelectorAll("#mlibBody [data-lib]"); var all=M.items();
  cards.forEach(function(c){ var it=all.find(function(i){return i.id===c.dataset.lib;}); var r=it&&it.rating||0, b=c.querySelector(".libx-rate");
    if(r>0){ if(!b){ b=document.createElement("span"); b.className="libx-rate"; b.style.cssText="position:absolute;left:4px;bottom:4px;z-index:3;background:rgba(0,0,0,.72);color:#ffd166;font:700 10px system-ui;padding:1px 5px;border-radius:8px;pointer-events:none"; (c.querySelector(".mthumb")||c).appendChild(b); } if(b.textContent!=="★"+r) b.textContent="★"+r; } else if(b) b.remove();
    c.style.display=(minStars>0&&r<minStars)?"none":""; }); }
new MutationObserver(function(){ badges(); }).observe(document.body,{childList:true,subtree:true});
X.minStars=function(n){ minStars=n; badges(); X.toast(n?("Showing "+n+"★ and up"):"Showing all ratings"); };
X.badges=badges;
[1,2,3,4,5].forEach(function(n){ X.add({id:"lx_rate_"+n,group:"Rating",label:"Rate selected "+"★".repeat(n),run:function(){ var c=X.rate(n); if(c) X.toast(c+" file"+(c===1?"":"s")+" rated "+n+"★"); }}); });
X.add({id:"lx_rate_0",group:"Rating",label:"Clear rating of selected",run:function(){ X.rate(0); }});
[[3,"Show only 3★ and up"],[4,"Show only 4★ and up"],[0,"Show all ratings"]].forEach(function(p){ X.add({id:"lx_min_"+p[0],group:"Rating",label:p[1],run:function(){ X.minStars(p[0]); }}); });
try{ window.AMIYO_EDITOR_BUILD="lib-step148-rating"; }catch(e){}
badges();
})();

;
/* ==================== Script 626 id="amiyo-libx-step03" ==================== */
/* Library Studio step 3: batch rename selected files with a pattern: {name} {n} {nn} {type} {res} {date}. Preview before applying. */
(function(){"use strict";
var X=window.AMIYO_LIBX; if(!X||X.rename) return;
function ext(n){ var m=/\.[A-Za-z0-9]{1,5}$/.exec(n||""); return m?m[0]:""; }
function base(n){ return (n||"").replace(/\.[A-Za-z0-9]{1,5}$/,""); }
function pad(n,w){ n=String(n); while(n.length<w) n="0"+n; return n; }
X.names=function(list,pat,start){ start=+start||1; var used={};
  return list.map(function(it,i){ var d=new Date(it.addedAt||Date.now()), n=start+i;
    var s=pat.replace(/\{name\}/g,base(it.name)).replace(/\{nn\}/g,pad(n,2)).replace(/\{nnn\}/g,pad(n,3)).replace(/\{n\}/g,String(n)).replace(/\{type\}/g,it.type||"").replace(/\{res\}/g,(it.width&&it.height)?(it.width+"x"+it.height):"").replace(/\{date\}/g,d.toISOString().slice(0,10));
    s=s.replace(/[\\/:*?"<>|]/g,"-").trim().slice(0,120)||base(it.name); var out=s+ext(it.name); if(used[out]){ used[out]++; out=s+"-"+used[out]+ext(it.name); } else used[out]=1; return out; }); };
X.rename=function(pat,start,list){ list=list||X.sel(); if(!list.length){ X.toast("Select one or more files first"); return 0; }
  var names=X.names(list,pat,start); list.forEach(function(it,i){ it.name=names[i]; }); X.save(list); return list.length; };
X.renameDialog=function(){ var s=X.sel(); if(!s.length){ X.toast("Select one or more files first (Select button)"); return; }
  openModal("Rename "+s.length+" file"+(s.length===1?"":"s"),'<label class="field">Pattern</label><input id="lxPat" type="text" value="{name}-{nn}" style="width:100%"><label class="field">Start number</label><input id="lxStart" type="number" value="1" min="0" style="width:100%"><p style="font-size:11px;opacity:.7">Use {name} {n} {nn} {nnn} {type} {res} {date}</p><div id="lxPrev" style="font:12px monospace;line-height:1.6"></div><div class="mdetail-actions"><button type="button" class="chip pri" id="lxGo">Rename</button></div>');
  var mb=document.getElementById("modalBody"), pv=mb.querySelector("#lxPrev"), pt=mb.querySelector("#lxPat"), st=mb.querySelector("#lxStart");
  function prev(){ var nm=X.names(s,pt.value,st.value); pv.innerHTML=nm.slice(0,4).map(function(n,i){ return (s[i].name+" → <b>"+n+"</b>").replace(/</g,function(m,o,str){return m;}); }).join("<br>")+(nm.length>4?"<br>… and "+(nm.length-4)+" more":""); }
  pt.oninput=prev; st.oninput=prev; prev();
  mb.querySelector("#lxGo").onclick=function(){ var c=X.rename(pt.value,st.value); try{ closeModal(); }catch(e){} X.toast(c+" renamed"); }; };
X.add({id:"lx_rename",group:"Organize",label:"Batch rename selected…",run:function(){ X.renameDialog(); }});
try{ window.AMIYO_EDITOR_BUILD="lib-step149-rename"; }catch(e){}
})();

;
/* ==================== Script 627 id="amiyo-libx-step04" ==================== */
/* Library Studio step 4: keyboard control in the Library like Premiere's Project panel.
   Arrows move, Shift+arrows extend the selection, Enter adds to timeline, Delete removes, Ctrl/Cmd+A selects all,
   Esc clears, 1-5 rate, 0 clears the rating, F toggles favorite. Also adds the shared X.onRender hook for later steps. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||X.keys) return;
X.css=function(id,t){ if(document.getElementById(id)) return; var s=document.createElement("style"); s.id=id; s.textContent=t; document.head.appendChild(s); };
var hooks=[], pend=0;
X.onRender=function(fn){ hooks.push(fn); };
new MutationObserver(function(){ if(pend) return; pend=requestAnimationFrame(function(){ pend=0; hooks.forEach(function(f){ try{ f(); }catch(e){} }); }); }).observe(document.body,{childList:true,subtree:true});
X.cards=function(){ return Array.prototype.filter.call(document.querySelectorAll("#mlibBody .mcard[data-lib]"),function(c){ return c.offsetParent!==null; }); };
X.item=function(id){ return M.items().find(function(i){ return i.id===id; }); };
X.selectIds=function(ids){ var st=M.state; st.selecting=true; st.sel=new Set(ids); M.render(); };
var cur="", inLib=false;
X.focusCard=function(id){ cur=id; var c=document.querySelector('#mlibBody .mcard[data-lib="'+id+'"]'); if(c){ c.focus({preventScroll:false}); try{ c.scrollIntoView({block:"nearest"}); }catch(e){} } };
X.css("libx-key-css","#mlibBody .mcard:focus-visible{outline:2px solid var(--accent,#ff7a3d);outline-offset:1px}");
document.addEventListener("pointerdown",function(e){ var t=e.target; inLib=!!(t&&t.closest&&t.closest("#mlibBody")); var c=t&&t.closest&&t.closest("#mlibBody [data-lib]"); if(c) cur=c.dataset.lib; },true);
document.addEventListener("focusin",function(e){ var t=e.target; if(t&&t.closest&&t.closest("#mlibBody")){ inLib=true; var c=t.closest("[data-lib]"); if(c) cur=c.dataset.lib; } },true);
function typing(t){ return t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable); }
function modalOpen(){ var m=document.getElementById("modalBackdrop"); return m&&m.style.display&&m.style.display!=="none"; }
function nearest(list,from,dir){ var r=from.getBoundingClientRect(), cx=r.left+r.width/2, best=null, bd=1e9, bt=1e9;
  list.forEach(function(c){ if(c===from) return; var q=c.getBoundingClientRect(); var dy=dir>0?q.top-r.top:r.top-q.top; if(dy<5) return; var dx=Math.abs(q.left+q.width/2-cx);
    if(dy<bt-5||(Math.abs(dy-bt)<=5&&dx<bd)){ bt=dy; bd=dx; best=c; } }); return best; }
function targets(){ var s=X.sel(); if(s.length) return s; var i=cur&&X.item(cur); return i?[i]:[]; }
document.addEventListener("keydown",function(e){
  if(!inLib||typing(e.target)||modalOpen()||e.altKey) return;
  if(!document.getElementById("mlibBody")) return;
  var k=e.key, cs=X.cards(), mod=e.ctrlKey||e.metaKey, idx=cs.findIndex(function(c){ return c.dataset.lib===cur; }), next=null, h=true;
  if(mod&&(k==="a"||k==="A")){ X.selectIds(cs.map(function(c){ return c.dataset.lib; })); X.toast(cs.length+" selected"); }
  else if(mod){ return; }
  else if(k==="ArrowRight"||k==="ArrowLeft"){ next=cs[idx<0?0:Math.max(0,Math.min(cs.length-1,idx+(k==="ArrowRight"?1:-1)))]; }
  else if(k==="ArrowDown"||k==="ArrowUp"){ next=idx<0?cs[0]:(nearest(cs,cs[idx],k==="ArrowDown"?1:-1)||cs[idx]); }
  else if(k==="Home"){ next=cs[0]; } else if(k==="End"){ next=cs[cs.length-1]; }
  else if(k==="Enter"){ var c=cs[idx]; var b=c&&c.querySelector(".mlib-add"); if(b) b.click(); else h=false; }
  else if(k==="Escape"){ if(M.state.sel.size||M.state.selecting){ M.state.sel=new Set(); M.state.selecting=false; M.render(); } else h=false; }
  else if(k==="Delete"||k==="Backspace"){ var t=targets(); if(!t.length) return; X.selectIds(t.map(function(i){ return i.id; })); setTimeout(function(){ var b=document.querySelector('#mlibBody [data-mact="del"]'); if(b) b.click(); },40); }
  else if(/^[0-5]$/.test(k)){ var t2=targets(); if(!t2.length) return; t2.forEach(function(i){ if(+k>0) i.rating=+k; else delete i.rating; }); X.save(t2); X.toast(+k?("Rated "+k+"★"):"Rating cleared"); }
  else if(k==="f"||k==="F"){ var t3=targets(); if(!t3.length) return; var on=!t3[0].fav; t3.forEach(function(i){ i.fav=on; }); X.save(t3); X.toast(on?"Marked favorite":"Favorite removed"); }
  else h=false;
  if(!h) return; e.preventDefault(); e.stopPropagation();
  if(next){ var id=next.dataset.lib; if(e.shiftKey&&k.indexOf("Arrow")===0){ var ids=new Set(M.state.sel); if(cur) ids.add(cur); ids.add(id); X.selectIds(Array.from(ids)); } cur=id; setTimeout(function(){ X.focusCard(id); },20); }
  else if(cur&&(/^[0-5]$/.test(k)||k==="f"||k==="F")) setTimeout(function(){ X.focusCard(cur); },20);
},true);
X.keys=function(){ openModal("Library keyboard shortcuts",'<div style="font:12.5px/1.9 system-ui"><b>Click a file first</b>, then:<br>← → ↑ ↓ move · Home / End jump<br>Shift + arrows extend the selection<br>Ctrl/Cmd + A select all · Esc clear<br>Enter add to timeline · Delete remove<br>1–5 rate · 0 clear rating · F favorite</div>'); };
X.add({id:"lx_keys",group:"Info",label:"Keyboard shortcuts…",hint:"keys",run:function(){ X.keys(); }});
try{ window.AMIYO_EDITOR_BUILD="lib-step150-keys"; }catch(e){}
})();

;
/* ==================== Script 628 id="amiyo-libx-step05" ==================== */
/* Library Studio step 5: faster selecting. Shift+click selects a range, Ctrl/Cmd+click adds or removes one file,
   and Lib+ gets Select shortcuts: invert, by type, favorites, 3 stars and up, unused, in project. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.selectIds||X.range) return;
var anchor="";
function cardOf(t){ return t&&t.closest?t.closest("#mlibBody [data-lib]"):null; }
document.addEventListener("click",function(e){
  var c=cardOf(e.target); if(!c||e.target.closest("button,a,input,select")) return;
  var id=c.dataset.lib;
  if(e.shiftKey&&anchor){ var cs=X.cards(), a=cs.findIndex(function(x){ return x.dataset.lib===anchor; }), b=cs.findIndex(function(x){ return x.dataset.lib===id; });
    if(a>=0&&b>=0){ var lo=Math.min(a,b), hi=Math.max(a,b), ids=cs.slice(lo,hi+1).map(function(x){ return x.dataset.lib; }); e.preventDefault(); e.stopPropagation(); X.selectIds(ids); X.toast(ids.length+" selected"); return; } }
  if(e.ctrlKey||e.metaKey){ e.preventDefault(); e.stopPropagation(); var s=new Set(M.state.sel); if(s.has(id)) s.delete(id); else s.add(id); anchor=id; X.selectIds(Array.from(s)); return; }
  anchor=id;
},true);
X.range=true;
function pick(fn,label){ var ids=M.items().filter(fn).map(function(i){ return i.id; }); if(!ids.length){ X.toast("Nothing matches: "+label); return; } X.selectIds(ids); X.toast(ids.length+" selected ("+label+")"); }
X.pick=pick;
var used=function(){ try{ return new Set(window.amiyoMediaLib.state&&Array.from(projIds())); }catch(e){ return new Set(); } };
function projIds(){ var ids=[]; document.querySelectorAll("#mlibBody .mdot").forEach(function(d){ var c=cardOf(d); if(c) ids.push(c.dataset.lib); }); return ids; }
X.add({id:"lx_sel_all",group:"Select",label:"Select all files",run:function(){ pick(function(){ return true; },"all"); }});
X.add({id:"lx_sel_invert",group:"Select",label:"Invert selection",run:function(){ var s=M.state.sel; var vis=X.visible().map(function(i){ return i.id; }); var ids=vis.filter(function(id){ return !s.has(id); }); X.selectIds(ids); X.toast(ids.length+" selected"); }});
X.add({id:"lx_sel_none",group:"Select",label:"Clear selection",run:function(){ M.state.sel=new Set(); M.state.selecting=false; M.render(); }});
["video","audio","image"].forEach(function(t){ X.add({id:"lx_sel_"+t,group:"Select",label:"Select all "+t+" files",run:function(){ pick(function(i){ return i.type===t; },t); }}); });
X.add({id:"lx_sel_fav",group:"Select",label:"Select favorites",run:function(){ pick(function(i){ return i.fav; },"favorites"); }});
X.add({id:"lx_sel_r3",group:"Select",label:"Select 3★ and up",run:function(){ pick(function(i){ return (i.rating||0)>=3; },"3★+"); }});
X.add({id:"lx_sel_unused",group:"Select",label:"Select unused files",run:function(){ pick(function(i){ return !(i.uses||0); },"unused"); }});
X.add({id:"lx_sel_nobin",group:"Select",label:"Select files not in a bin",run:function(){ pick(function(i){ return !i.bin; },"no bin"); }});
try{ window.AMIYO_EDITOR_BUILD="lib-step151-select"; }catch(e){}
})();

;
/* ==================== Script 629 id="amiyo-libx-step06" ==================== */
/* Library Studio step 6: clickable column headers in list view (Name, Length, Size, Size px, Date, Used, Favorites),
   like Premiere's Project panel list. Click a header to sort, click again to flip the order. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.onRender||X.cols) return;
var COLS=[["name","Name"],["dur","Length"],["size","Size"],["res","Pixels"],["added","Added"],["most","Used"],["rating","★ Fav"]];
X.css("libx-cols-css",".libx-cols{display:flex;gap:2px;margin:6px 0 4px;font:700 10.5px system-ui;letter-spacing:.03em;text-transform:uppercase}.libx-cols button{flex:1;min-width:0;padding:6px 4px;border:1px solid var(--line,#3a3226);border-radius:6px;background:var(--panel2,#1d1913);color:var(--muted,#a99f8d);cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.libx-cols button:first-child{flex:2}.libx-cols button.on{color:var(--accent,#ff7a3d);border-color:var(--accent,#ff7a3d)}");
function sync(){ var st=M.state, body=document.getElementById("mlibBody"); if(!body) return;
  var grid=body.querySelector(".mlib-grid"), old=body.querySelector(".libx-cols");
  if(!grid||st.view!=="list"){ if(old) old.remove(); return; }
  var sig=st.sort+"|"+st.desc; if(old&&old.dataset.sig===sig&&old.nextElementSibling===grid) return; if(old) old.remove();
  var d=document.createElement("div"); d.className="libx-cols"; d.dataset.sig=sig; d.setAttribute("role","toolbar"); d.setAttribute("aria-label","Sort columns");
  d.innerHTML=COLS.map(function(c){ var on=st.sort===c[0]; return '<button type="button" data-col="'+c[0]+'" class="'+(on?"on":"")+'" aria-pressed="'+on+'">'+c[1]+(on?(st.desc?" ▼":" ▲"):"")+"</button>"; }).join("");
  d.onclick=function(e){ var b=e.target.closest("button[data-col]"); if(!b) return; var k=b.dataset.col; if(st.sort===k) st.desc=!st.desc; else { st.sort=k; st.desc=true; } try{ localStorage.setItem("amiyo_media_desc",st.desc?"1":"0"); }catch(_){} M.render(); };
  grid.parentNode.insertBefore(d,grid); }
X.cols=sync; X.onRender(sync); sync();
X.add({id:"lx_cols_list",group:"View",label:"Switch to list view with columns",run:function(){ var b=document.getElementById("mlibView"); if(M.state.view!=="list"&&b) b.click(); else X.toast("Already in list view"); }});
try{ window.AMIYO_EDITOR_BUILD="lib-step152-columns"; }catch(e){}
})();

;
/* ==================== Script 630 id="amiyo-libx-step07" ==================== */
/* Library Studio step 7: Properties panel (like Premiere's Metadata): size, length, pixels, aspect ratio, average bitrate,
   dates, uses, bin, label, tags, rating for one file, or totals for a selection. Lib+ > Properties. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.selectIds||X.props) return;
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function sz(b){ b=+b||0; return b<1024?b+" B":b<1048576?Math.round(b/1024)+" KB":b<1073741824?(b/1048576).toFixed(1)+" MB":(b/1073741824).toFixed(2)+" GB"; }
function tm(s){ s=Math.round(+s||0); var h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60; return (h?h+":"+(m<10?"0":""):"")+m+":"+(x<10?"0":"")+x; }
function gcd(a,b){ return b?gcd(b,a%b):a; }
function dt(t){ return t?new Date(t).toLocaleString():"never"; }
function binName(id){ var b=(M.state.bins||[]).find(function(x){ return x.id===id; }); return b?b.name:""; }
function row(k,v){ return '<tr><td style="padding:3px 10px 3px 0;opacity:.65;white-space:nowrap">'+k+'</td><td style="padding:3px 0;word-break:break-word">'+v+"</td></tr>"; }
X.target=function(){ var s=X.sel(); if(s.length) return s; var a=document.activeElement, c=a&&a.closest?a.closest("#mlibBody [data-lib]"):null; var it=c&&X.item(c.dataset.lib); return it?[it]:[]; };
X.propsHTML=function(list){
  if(list.length===1){ var i=list[0], w=+i.width||0, h=+i.height||0, d=+i.duration||0, g=w&&h?gcd(w,h):0;
    var rows=row("Name",esc(i.name))+row("Type",esc(i.type||"?"))+row("Size",sz(i.size));
    if(i.type!=="image"&&d) rows+=row("Length",tm(d));
    if(w&&h) rows+=row("Pixels",w+" × "+h+(g?" ("+(w/g)+":"+(h/g)+")":""));
    if(i.type!=="image"&&d&&i.size) rows+=row("Average bitrate",((i.size*8/d)/1e6).toFixed(2)+" Mbit/s");
    rows+=row("Added",dt(i.addedAt))+row("Last used",dt(i.lastUsed))+row("Times used",(i.uses||0)+" in timelines · "+(i.imports||0)+" imports");
    rows+=row("Bin",esc(binName(i.bin)||"none"))+row("Label",esc(i.label||"none"))+row("Tags",esc((i.tags||[]).join(", ")||"none"))+row("Rating",i.rating?"★".repeat(i.rating):"none")+row("Favorite",i.fav?"yes":"no");
    if(i.note) rows+=row("Note",esc(i.note));
    return '<table style="font:12.5px/1.4 system-ui;width:100%">'+rows+"</table>"; }
  var tot=list.reduce(function(a,i){ a.size+=+i.size||0; a.dur+=i.type==="image"?0:(+i.duration||0); a.t[i.type]=(a.t[i.type]||0)+1; return a; },{size:0,dur:0,t:{}});
  return '<table style="font:12.5px/1.4 system-ui;width:100%">'+row("Files",list.length)+row("Total size",sz(tot.size))+row("Total length",tm(tot.dur))+row("By type",Object.keys(tot.t).map(function(k){ return tot.t[k]+" "+k; }).join(" · "))+"</table>"; };
X.props=function(){ var l=X.target(); if(!l.length){ X.toast("Click or select a file first"); return; }
  openModal(l.length===1?"Properties":"Properties of "+l.length+" files",X.propsHTML(l)); };
X.add({id:"lx_props",group:"Info",label:"Properties of selected…",hint:"details",run:function(){ X.props(); }});
try{ window.AMIYO_EDITOR_BUILD="lib-step153-properties"; }catch(e){}
})();

;
/* ==================== Script 631 id="amiyo-libx-step08" ==================== */
/* Library Studio step 8: advanced Find (like Premiere's Find dialog): several rules at once - name has / doesn't have, type,
   rating, label, tag, length range, size, unused, favorites. Show only the matches or select them. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.onRender||X.find) return;
X.css("libx-find-css",".libx-hide{display:none!important}.libx-findbar{display:flex;align-items:center;gap:8px;margin:6px 0;padding:6px 8px;border:1px solid var(--accent,#ff7a3d);border-radius:8px;font:12px system-ui}.libx-findbar button{margin-left:auto}.libx-fgrid{display:grid;grid-template-columns:1fr 1fr;gap:6px 10px;font:12px system-ui}.libx-fgrid label{display:flex;flex-direction:column;gap:2px;opacity:.9}.libx-fgrid input,.libx-fgrid select{width:100%}");
var crit=null, pred=null;
function words(s){ return String(s||"").toLowerCase().split(/\s+/).filter(Boolean); }
X.makePred=function(c){ var inc=words(c.name), exc=words(c.notName), tag=String(c.tag||"").toLowerCase().trim();
  return function(i){ var n=String(i.name||"").toLowerCase();
    if(inc.some(function(w){ return n.indexOf(w)<0; })) return false; if(exc.some(function(w){ return n.indexOf(w)>=0; })) return false;
    if(c.type&&c.type!=="any"&&i.type!==c.type) return false; if(c.minRating&&(i.rating||0)<+c.minRating) return false;
    if(c.label&&c.label!=="any"&&i.label!==c.label) return false;
    if(tag&&!(i.tags||[]).some(function(t){ return String(t).toLowerCase().indexOf(tag)>=0; })) return false;
    var d=+i.duration||0; if(c.minDur!==""&&c.minDur!=null&&d<+c.minDur) return false; if(c.maxDur!==""&&c.maxDur!=null&&d>+c.maxDur) return false;
    if(c.minMB!==""&&c.minMB!=null&&(+i.size||0)<+c.minMB*1048576) return false; if(c.unused&&(i.uses||0)>0) return false; if(c.fav&&!i.fav) return false; return true; }; };
X.setFind=function(c){ crit=c; pred=c?X.makePred(c):null; X.sync(); };
X.findCrit=function(){ return crit; };
X.sync=function(){ var body=document.getElementById("mlibBody"); if(!body) return; var all=M.items(), shown=0, tot=0;
  body.querySelectorAll(".mcard[data-lib]").forEach(function(c){ var it=all.find(function(i){ return i.id===c.dataset.lib; }); var hide=!!(pred&&it&&!pred(it)); c.classList.toggle("libx-hide",hide); tot++; if(!hide) shown++; });
  var bar=body.querySelector(".libx-findbar");
  if(!pred){ if(bar) bar.remove(); return; }
  var txt="Find filter on · "+shown+" of "+tot+" shown";
  if(!bar){ bar=document.createElement("div"); bar.className="libx-findbar"; bar.innerHTML='<span></span><button type="button" class="chip">Clear</button>'; bar.querySelector("button").onclick=function(){ X.setFind(null); }; var g=body.querySelector(".mlib-grid")||body.firstChild; g.parentNode.insertBefore(bar,g); }
  var sp=bar.querySelector("span"); if(sp.textContent!==txt) sp.textContent=txt; };
X.onRender(X.sync);
function v(id){ var e=document.getElementById(id); return e?(e.type==="checkbox"?e.checked:e.value):""; }
X.find=function(init){ init=init||crit||{type:"any",label:"any"};
  var labs=["any","red","orange","yellow","green","blue","purple"].map(function(l){ return '<option value="'+l+'"'+(init.label===l?" selected":"")+">"+l+"</option>"; }).join("");
  var types=["any","video","audio","image"].map(function(t){ return '<option value="'+t+'"'+(init.type===t?" selected":"")+">"+t+"</option>"; }).join("");
  var rt=[0,1,2,3,4,5].map(function(r){ return '<option value="'+r+'"'+((init.minRating||0)==r?" selected":"")+">"+(r?r+"★ and up":"any")+"</option>"; }).join("");
  openModal("Find in library",'<div class="libx-fgrid"><label>Name has<input id="lfName" type="text" value="'+(init.name||"").replace(/"/g,"&quot;")+'"></label><label>Name does not have<input id="lfNot" type="text" value="'+(init.notName||"").replace(/"/g,"&quot;")+'"></label>'+
   '<label>Type<select id="lfType">'+types+'</select></label><label>Rating<select id="lfRate">'+rt+'</select></label><label>Label<select id="lfLabel">'+labs+'</select></label><label>Tag has<input id="lfTag" type="text" value="'+(init.tag||"").replace(/"/g,"&quot;")+'"></label>'+
   '<label>Shortest (sec)<input id="lfMin" type="number" min="0" value="'+(init.minDur==null?"":init.minDur)+'"></label><label>Longest (sec)<input id="lfMax" type="number" min="0" value="'+(init.maxDur==null?"":init.maxDur)+'"></label><label>Bigger than (MB)<input id="lfMB" type="number" min="0" value="'+(init.minMB==null?"":init.minMB)+'"></label>'+
   '<label style="flex-direction:row;align-items:center;gap:6px"><input id="lfUnused" type="checkbox" style="width:auto"'+(init.unused?" checked":"")+'> Unused only</label><label style="flex-direction:row;align-items:center;gap:6px"><input id="lfFav" type="checkbox" style="width:auto"'+(init.fav?" checked":"")+'> Favorites only</label></div>'+
   '<div class="mdetail-actions"><button type="button" class="chip pri" id="lfShow">Show matches</button><button type="button" class="chip" id="lfSel">Select matches</button><button type="button" class="chip" id="lfClr">Clear</button></div>');
  function read(){ return {name:v("lfName"),notName:v("lfNot"),type:v("lfType"),minRating:+v("lfRate"),label:v("lfLabel"),tag:v("lfTag"),minDur:v("lfMin"),maxDur:v("lfMax"),minMB:v("lfMB"),unused:v("lfUnused"),fav:v("lfFav")}; }
  document.getElementById("lfShow").onclick=function(){ X.setFind(read()); closeModal(); };
  document.getElementById("lfSel").onclick=function(){ var p=X.makePred(read()); var ids=M.items().filter(p).map(function(i){ return i.id; }); closeModal(); if(!ids.length){ X.toast("No files match"); return; } X.selectIds(ids); X.toast(ids.length+" selected"); };
  document.getElementById("lfClr").onclick=function(){ X.setFind(null); closeModal(); }; };
X.add({id:"lx_find",group:"Find",label:"Advanced find…",hint:"rules",run:function(){ X.find(); }});
X.add({id:"lx_find_clear",group:"Find",label:"Clear find filter",run:function(){ X.setFind(null); }});
try{ window.AMIYO_EDITOR_BUILD="lib-step154-find"; }catch(e){}
})();

;
/* ==================== Script 632 id="amiyo-libx-step09" ==================== */
/* Library Studio step 9: saved searches (like Premiere's search bins). Run Advanced find, save the rules with a name,
   and they appear in the Lib+ menu under "Saved searches" for one-tap reuse. They are kept on this device. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.setFind||X.saved) return;
var KEY="amiyo_libx_saved";
function load(){ try{ var a=JSON.parse(localStorage.getItem(KEY)||"[]"); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
function store(a){ try{ localStorage.setItem(KEY,JSON.stringify(a)); }catch(e){ X.toast("Could not save on this device"); } }
var list=load();
function reg(s){ X.add({id:"lx_ss_"+s.id,group:"Saved searches",label:"🔍 "+s.name,hint:"run",run:function(){ X.setFind(s.crit); X.toast("Search: "+s.name); }}); }
function unreg(id){ var i=X.items.findIndex(function(x){ return x.id==="lx_ss_"+id; }); if(i>=0) X.items.splice(i,1); }
list.forEach(reg);
X.saved=function(){ return list.slice(); };
X.saveSearch=function(name){ var c=X.findCrit(); if(!c){ X.toast("Use Advanced find and tap Show matches first"); X.find(); return false; }
  name=String(name||"").trim().slice(0,40); if(!name) return false;
  var ex=list.find(function(s){ return s.name.toLowerCase()===name.toLowerCase(); });
  if(ex){ ex.crit=JSON.parse(JSON.stringify(c)); } else { ex={id:Date.now().toString(36)+Math.random().toString(36).slice(2,4),name:name,crit:JSON.parse(JSON.stringify(c))}; list.push(ex); }
  store(list); reg(ex); X.toast("Saved search “"+name+"”"); return true; };
X.deleteSearch=function(id){ var i=list.findIndex(function(s){ return s.id===id; }); if(i<0) return; var n=list[i].name; list.splice(i,1); store(list); unreg(id); X.toast("Deleted “"+n+"”"); };
X.add({id:"lx_ss_save",group:"Saved searches",label:"Save current find as…",run:function(){ if(!X.findCrit()){ X.toast("Use Advanced find and tap Show matches first"); X.find(); return; }
  Promise.resolve(window.amiyoAsk?window.amiyoAsk("Name this search","My search",{okLabel:"Save"}):prompt("Name this search","My search")).then(function(n){ if(n!=null) X.saveSearch(n); }); }});
X.add({id:"lx_ss_manage",group:"Saved searches",label:"Manage saved searches…",run:function(){
  if(!list.length){ X.toast("No saved searches yet"); return; }
  openModal("Saved searches",'<div id="lxSsList" style="display:flex;flex-direction:column;gap:6px">'+list.map(function(s){ return '<div style="display:flex;gap:6px"><button type="button" class="chip pri" data-run="'+s.id+'" style="flex:1;text-align:left">🔍 '+String(s.name).replace(/[<&]/g,"")+'</button><button type="button" class="chip danger" data-del="'+s.id+'">Delete</button></div>'; }).join("")+"</div>");
  document.getElementById("lxSsList").onclick=function(e){ var r=e.target.closest("[data-run]"), d=e.target.closest("[data-del]");
    if(r){ var s=list.find(function(x){ return x.id===r.dataset.run; }); if(s){ X.setFind(s.crit); closeModal(); } }
    else if(d){ X.deleteSearch(d.dataset.del); d.parentNode.remove(); } }; }});
try{ window.AMIYO_EDITOR_BUILD="lib-step155-saved"; }catch(e){}
})();

;
/* ==================== Script 633 id="amiyo-libx-step10" ==================== */
/* Library Studio step 10: auto-bins. One tap sorts files into bins by type, month added, label, rating, resolution or length.
   Works on the selected files, or on every file that is not in a bin yet. Missing bins are created for you. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.selectIds||X.autoBin) return;
X.binFor=function(name){ var st=M.state; name=String(name).slice(0,40); var b=(st.bins||[]).find(function(x){ return x.name.toLowerCase()===name.toLowerCase(); });
  if(!b){ b={id:"bin_"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),name:name}; st.bins.push(b); } return b.id; };
var RULES={
  type:function(i){ return {video:"Video",audio:"Audio",image:"Images"}[i.type]||"Other"; },
  month:function(i){ var d=new Date(i.addedAt||Date.now()); return "Added "+d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0"); },
  label:function(i){ return i.label?("Label "+i.label):""; },
  rating:function(i){ return i.rating?(i.rating+" star"+(i.rating>1?"s":"")):""; },
  res:function(i){ var h=Math.max(+i.width||0,+i.height||0); return !h?"":h>=3840?"4K and up":h>=1920?"HD 1080p":"Below 1080p"; },
  length:function(i){ if(i.type==="image"||!(+i.duration)) return ""; var d=+i.duration; return d<10?"Short (under 10s)":d<60?"Medium (10s-1min)":"Long (over 1 min)"; }
};
X.autoBin=function(rule){ var fn=RULES[rule]; if(!fn) return 0; var s=X.sel(), list=s.length?s:M.items().filter(function(i){ return !i.bin; });
  if(!list.length){ X.toast("Every file is already in a bin"); return 0; }
  var moved=[], made={}; list.forEach(function(i){ var n=fn(i); if(!n) return; i.bin=X.binFor(n); made[n]=1; moved.push(i); });
  if(!moved.length){ X.toast("Nothing to sort by that rule"); return 0; }
  try{ M.saveBins(); }catch(e){} X.save(moved); X.toast(moved.length+" files sorted into "+Object.keys(made).length+" bin"+(Object.keys(made).length===1?"":"s")); return moved.length; };
[["type","by type (Video, Audio, Images)"],["month","by month added"],["label","by color label"],["rating","by star rating"],["res","by resolution"],["length","by length"]].forEach(function(r){ X.add({id:"lx_ab_"+r[0],group:"Auto-bins",label:"Sort into bins "+r[1],run:function(){ X.autoBin(r[0]); }}); });
X.add({id:"lx_ab_clear",group:"Auto-bins",label:"Take selected files out of their bins",run:function(){ var s=X.sel(); if(!s.length){ X.toast("Select files first"); return; } s.forEach(function(i){ delete i.bin; }); X.save(s); X.toast(s.length+" taken out of bins"); }});
try{ window.AMIYO_EDITOR_BUILD="lib-step156-autobins"; }catch(e){}
})();

;
/* ==================== Script 634 id="amiyo-libx-step11" ==================== */
/* Library Studio step 11: bulk tags. Add, remove or replace tags on all selected files at once, and open a tag overview
   with counts - tap a tag to show only the files that have it. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.setFind||X.tags) return;
function parse(s){ return String(s||"").split(/[,;\n]+/).map(function(t){ return t.trim().replace(/^#/,"").slice(0,30); }).filter(Boolean); }
function ask(msg,def,ok){ return Promise.resolve(window.amiyoAsk?window.amiyoAsk(msg,def||"",{okLabel:ok||"OK"}):prompt(msg,def||"")); }
function need(){ var s=X.sel(); if(!s.length) X.toast("Select one or more files first (Select button)"); return s; }
X.allTags=function(){ var m={}; M.items().forEach(function(i){ (i.tags||[]).forEach(function(t){ m[t]=(m[t]||0)+1; }); }); return Object.keys(m).sort(function(a,b){ return m[b]-m[a]||a.localeCompare(b); }).map(function(t){ return [t,m[t]]; }); };
X.tagAdd=function(list,tags){ list.forEach(function(i){ var set=(i.tags||[]).slice(); tags.forEach(function(t){ if(!set.some(function(x){ return x.toLowerCase()===t.toLowerCase(); })) set.push(t); }); i.tags=set; }); X.save(list); };
X.tagRemove=function(list,tags){ var low=tags.map(function(t){ return t.toLowerCase(); }); list.forEach(function(i){ i.tags=(i.tags||[]).filter(function(t){ return low.indexOf(String(t).toLowerCase())<0; }); if(!i.tags.length) delete i.tags; }); X.save(list); };
X.tagSet=function(list,tags){ list.forEach(function(i){ if(tags.length) i.tags=tags.slice(); else delete i.tags; }); X.save(list); };
var hint=function(){ var t=X.allTags().slice(0,8).map(function(x){ return x[0]; }); return t.length?"\nYour tags: "+t.join(", "):""; };
X.add({id:"lx_tag_add",group:"Tags",label:"Add tags to selected…",run:function(){ var s=need(); if(!s.length) return; ask("Add tags to "+s.length+" file"+(s.length===1?"":"s")+" (comma separated)"+hint(),"","Add").then(function(v){ var t=parse(v); if(t.length){ X.tagAdd(s,t); X.toast("Tagged "+s.length+" file"+(s.length===1?"":"s")); } }); }});
X.add({id:"lx_tag_rem",group:"Tags",label:"Remove tags from selected…",run:function(){ var s=need(); if(!s.length) return; ask("Remove which tags? (comma separated)"+hint(),"","Remove").then(function(v){ var t=parse(v); if(t.length){ X.tagRemove(s,t); X.toast("Tags removed"); } }); }});
X.add({id:"lx_tag_set",group:"Tags",label:"Replace tags of selected…",run:function(){ var s=need(); if(!s.length) return; ask("Set the tags of "+s.length+" file"+(s.length===1?"":"s")+" (empty clears all)"+hint(),"","Replace").then(function(v){ if(v==null) return; X.tagSet(s,parse(v)); X.toast("Tags updated"); }); }});
X.add({id:"lx_tag_cloud",group:"Tags",label:"Tag overview…",run:function(){ var t=X.allTags(); if(!t.length){ X.toast("No tags yet - select files and add some"); return; }
  openModal("Tags",'<div id="lxTagCloud" style="display:flex;flex-wrap:wrap;gap:6px">'+t.map(function(x){ return '<button type="button" class="chip" data-tag="'+x[0].replace(/"/g,"&quot;")+'">#'+x[0].replace(/[<&]/g,"")+" · "+x[1]+"</button>"; }).join("")+"</div>");
  document.getElementById("lxTagCloud").onclick=function(e){ var b=e.target.closest("[data-tag]"); if(!b) return; X.setFind({type:"any",label:"any",tag:b.dataset.tag}); closeModal(); }; }});
try{ window.AMIYO_EDITOR_BUILD="lib-step157-tags"; }catch(e){}
})();

;
/* ==================== Script 635 id="amiyo-libx-step12" ==================== */
/* Library Studio step 12: color labels in bulk. Give the selected files a color label (red, orange, yellow, green, blue,
   purple) or clear it, shift a label by one color, and select every file with a label. Also gives a quick label legend. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.selectIds||X.label) return;
var COL=["red","orange","yellow","green","blue","purple"], HEX={red:"#e5534b",orange:"#e08a3c",yellow:"#e6c84a",green:"#4cae6a",blue:"#ef773b",purple:"#9a6ad6"};
function need(){ var s=X.sel(); if(!s.length) X.toast("Select one or more files first (Select button)"); return s; }
X.label=function(list,c){ list.forEach(function(i){ if(c) i.label=c; else delete i.label; }); X.save(list); };
COL.forEach(function(c){ X.add({id:"lx_lab_"+c,group:"Labels",label:"● Label selected "+c,run:function(){ var s=need(); if(!s.length) return; X.label(s,c); X.toast(s.length+" labeled "+c); }}); });
X.add({id:"lx_lab_clear",group:"Labels",label:"Clear label of selected",run:function(){ var s=need(); if(!s.length) return; X.label(s,""); X.toast("Label cleared"); }});
X.add({id:"lx_lab_next",group:"Labels",label:"Next label color for selected",run:function(){ var s=need(); if(!s.length) return; s.forEach(function(i){ var k=COL.indexOf(i.label); i.label=COL[(k+1)%COL.length]; }); X.save(s); X.toast("Label moved to the next color"); }});
X.add({id:"lx_lab_pick",group:"Labels",label:"Select every labeled file",run:function(){ X.pick(function(i){ return !!i.label; },"labeled"); }});
X.add({id:"lx_lab_legend",group:"Labels",label:"Label counts…",run:function(){ var n={}; M.items().forEach(function(i){ if(i.label) n[i.label]=(n[i.label]||0)+1; });
  var rows=COL.map(function(c){ return '<button type="button" class="chip" data-l="'+c+'" style="display:flex;align-items:center;gap:8px;width:100%;margin-bottom:6px"><i style="width:12px;height:12px;border-radius:50%;background:'+HEX[c]+'"></i>'+c+' · '+(n[c]||0)+"</button>"; }).join("");
  openModal("Labels",'<div id="lxLegend">'+rows+'</div><p style="font-size:11px;opacity:.7">Tap a color to select its files.</p>');
  document.getElementById("lxLegend").onclick=function(e){ var b=e.target.closest("[data-l]"); if(!b) return; closeModal(); X.pick(function(i){ return i.label===b.dataset.l; },b.dataset.l); }; }});
try{ window.AMIYO_EDITOR_BUILD="lib-step158-labels"; }catch(e){}
})();

;
/* ==================== Script 636 id="amiyo-libx-step13" ==================== */
/* Library Studio step 13: undo and redo for Library changes (rename, rating, label, tags, favorite, bin, note).
   Lib+ > Undo / Redo, or Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z / Ctrl+Y after clicking in the Library. Keeps the last 50 changes. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.onRender||X.undo) return;
var F=["name","rating","label","tags","fav","bin","note"], base=new Map(), U=[], R=[], busy=false, ready=false;
function snap(i){ return JSON.stringify(F.map(function(f){ return i[f]===undefined?null:i[f]; })); }
function apply(i,s){ var v=JSON.parse(s); F.forEach(function(f,k){ if(v[k]===null) delete i[f]; else i[f]=v[k]; }); }
function check(){ if(busy||!M.state.loaded) return; var items=M.items(), seen={}, ent=[], fields={};
  items.forEach(function(i){ seen[i.id]=1; var s=snap(i), b=base.get(i.id); if(b===undefined){ base.set(i.id,s); return; }
    if(b!==s){ ent.push({id:i.id,before:b,after:s}); var bv=JSON.parse(b), av=JSON.parse(s); F.forEach(function(f,k){ if(JSON.stringify(bv[k])!==JSON.stringify(av[k])) fields[f]=1; }); base.set(i.id,s); } });
  base.forEach(function(v,id){ if(!seen[id]) base.delete(id); });
  if(ent.length){ U.push({label:Object.keys(fields).join(", ")+" on "+ent.length+" file"+(ent.length===1?"":"s"),ent:ent}); if(U.length>50) U.shift(); R.length=0; } ready=true; }
X.onRender(check); setTimeout(check,800);
function run(from,to,verb,key){ var g=from.pop(); if(!g){ X.toast("Nothing to "+verb); return; } busy=true; var list=[];
  g.ent.forEach(function(e){ var it=X.item(e.id); if(!it) return; apply(it,e[key]); base.set(it.id,e[key]); list.push(it); });
  to.push(g); X.save(list); setTimeout(function(){ busy=false; },200); X.toast((verb==="undo"?"Undid ":"Redid ")+g.label); }
X.undo=function(){ run(U,R,"undo","before"); }; X.redo=function(){ run(R,U,"redo","after"); };
X.undoCount=function(){ return [U.length,R.length]; };
var inLib=false; document.addEventListener("pointerdown",function(e){ inLib=!!(e.target&&e.target.closest&&e.target.closest("#mlibBody")); },true);
document.addEventListener("keydown",function(e){ if(!inLib||!(e.ctrlKey||e.metaKey)||e.altKey) return; var t=e.target; if(t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable)) return; var k=String(e.key).toLowerCase();
  if(k==="z"&&!e.shiftKey){ e.preventDefault(); e.stopPropagation(); X.undo(); } else if((k==="z"&&e.shiftKey)||k==="y"){ e.preventDefault(); e.stopPropagation(); X.redo(); } },true);
X.add({id:"lx_undo",group:"Edit",label:"Undo last library change",hint:"Ctrl+Z",run:function(){ X.undo(); }});
X.add({id:"lx_redo",group:"Edit",label:"Redo library change",hint:"Ctrl+Y",run:function(){ X.redo(); }});
X.add({id:"lx_undo_list",group:"Edit",label:"Recent library changes…",run:function(){ if(!U.length){ X.toast("No changes yet"); return; }
  openModal("Recent library changes",'<ol style="font:12.5px/1.8 system-ui;padding-left:18px;margin:0">'+U.slice().reverse().slice(0,15).map(function(g){ return "<li>"+g.label.replace(/[<&]/g,"")+"</li>"; }).join("")+"</ol>"); }});
try{ window.AMIYO_EDITOR_BUILD="lib-step159-undo"; }catch(e){}
})();

;
/* ==================== Script 637 id="amiyo-libx-step14" ==================== */
/* Library Studio step 14: Quick Look. Click a file in the Library and press Space (or Lib+ > Quick look) to play it in a
   pop-up without adding it to the timeline. Left/Right arrows go to the previous or next file. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.cards||X.quick) return;
var url="", openId="", timer=0, cur="", inLib=false;
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function freeUrl(){ if(url){ try{ URL.revokeObjectURL(url); }catch(e){} url=""; } }
function isOpen(){ var m=document.getElementById("modalBackdrop"); return !!(m&&m.style.display&&m.style.display!=="none"); }
function watch(){ clearInterval(timer); timer=setInterval(function(){ if(!isOpen()||!document.getElementById("lxQL")){ clearInterval(timer); freeUrl(); openId=""; } },700); }
X.quick=function(id){ var it=X.item(id); if(!it){ X.toast("Click a file first"); return; } freeUrl();
  M.getBlob(it).then(function(b){ if(!b){ X.toast("This file is missing from the library"); return; } url=URL.createObjectURL(b); openId=id;
    var media=it.type==="video"?'<video src="'+url+'" controls autoplay playsinline style="width:100%;max-height:55vh;background:#000;border-radius:8px"></video>':
      it.type==="audio"?'<audio src="'+url+'" controls autoplay style="width:100%"></audio>':'<img src="'+url+'" alt="" style="width:100%;max-height:55vh;object-fit:contain;border-radius:8px">';
    openModal(it.name||"Quick look",'<div id="lxQL">'+media+'<div class="mdetail-actions" style="margin-top:8px"><button type="button" class="chip" id="lxQPrev">← Previous</button><button type="button" class="chip" id="lxQNext">Next →</button><button type="button" class="chip pri" id="lxQAdd">＋ Timeline</button></div></div>');
    watch();
    function step(d){ var cs=X.cards(), k=cs.findIndex(function(c){ return c.dataset.lib===openId; }); var n=cs[k+d]; if(n) X.quick(n.dataset.lib); else X.toast(d>0?"That was the last file":"That was the first file"); }
    document.getElementById("lxQPrev").onclick=function(){ step(-1); }; document.getElementById("lxQNext").onclick=function(){ step(1); };
    document.getElementById("lxQAdd").onclick=function(){ try{ M.use([id]); closeModal(); }catch(e){ X.toast("Could not add it"); } };
  }).catch(function(){ X.toast("Could not open this file"); }); };
document.addEventListener("pointerdown",function(e){ var t=e.target; inLib=!!(t&&t.closest&&t.closest("#mlibBody")); var c=t&&t.closest&&t.closest("#mlibBody [data-lib]"); if(c) cur=c.dataset.lib; },true);
document.addEventListener("focusin",function(e){ var c=e.target&&e.target.closest&&e.target.closest("#mlibBody [data-lib]"); if(c){ cur=c.dataset.lib; inLib=true; } },true);
document.addEventListener("keydown",function(e){ var t=e.target; if(t&&(/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(t.tagName)||t.isContentEditable)&&!(t.closest&&t.closest("#lxQL"))) { if(!(t.closest&&t.closest("#mlibBody [data-lib]"))) return; }
  if(isOpen()&&document.getElementById("lxQL")){ if(e.key==="ArrowRight"||e.key==="ArrowLeft"){ var b=document.getElementById(e.key==="ArrowRight"?"lxQNext":"lxQPrev"); if(b&&!(t&&/^(VIDEO|AUDIO)$/.test(t.tagName))){ e.preventDefault(); e.stopPropagation(); b.click(); } } return; }
  if(e.key!==" "||!inLib||e.ctrlKey||e.metaKey||e.altKey||isOpen()||!document.getElementById("mlibBody")) return;
  var c=document.activeElement&&document.activeElement.closest?document.activeElement.closest("#mlibBody [data-lib]"):null, id=c?c.dataset.lib:cur; if(!id) return; e.preventDefault(); e.stopPropagation(); X.quick(id); },true);
X.add({id:"lx_quick",group:"Info",label:"Quick look at selected file",hint:"Space",run:function(){ var s=X.sel(); var id=s.length?s[0].id:(cur||""); if(!id){ X.toast("Click a file first"); return; } X.quick(id); }});
try{ window.AMIYO_EDITOR_BUILD="lib-step160-quicklook"; }catch(e){}
})();

;
/* ==================== Script 638 id="amiyo-libx-step15" ==================== */
/* Library Studio step 15: usage report. Shows which Library files are on the timeline right now, how many clips and seconds
   each one uses, and how much storage the never-used files take. One tap selects the files that are not on the timeline. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.selectIds||X.usage) return;
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function sz(b){ b=+b||0; return b<1048576?Math.round(b/1024)+" KB":b<1073741824?(b/1048576).toFixed(1)+" MB":(b/1073741824).toFixed(2)+" GB"; }
X.usage=function(){ var P; try{ P=project; }catch(e){ P=null; } var items=M.items(), byAsset={}, use={};
  if(P&&P.assets){ items.forEach(function(it){ if(P.assets[it.blobKey]) byAsset[it.blobKey]=it; }); Object.keys(P.assets).forEach(function(k){ var a=P.assets[k]; if(a&&a.libId){ var it=X.item(a.libId); if(it) byAsset[k]=it; } }); }
  if(P&&P.tracks) P.tracks.forEach(function(t){ (t.clips||[]).forEach(function(c){ var it=byAsset[c.assetId]; if(!it) return; var u=use[it.id]||(use[it.id]={it:it,n:0,sec:0}); u.n++; u.sec+=+c.duration||0; }); });
  var rows=Object.keys(use).map(function(k){ return use[k]; }).sort(function(a,b){ return b.n-a.n||b.sec-a.sec; });
  var off=items.filter(function(i){ return !use[i.id]; }), never=items.filter(function(i){ return !(i.uses||0)&&!use[i.id]; });
  return {rows:rows,off:off,never:never,total:items.length}; };
X.usageDialog=function(){ var u=X.usage(), neverSize=u.never.reduce(function(a,i){ return a+(+i.size||0); },0);
  var top=u.rows.slice(0,8).map(function(r){ return "<tr><td style='padding:2px 8px 2px 0'>"+esc(r.it.name)+"</td><td style='padding:2px 8px'>"+r.n+" clip"+(r.n===1?"":"s")+"</td><td style='padding:2px 0'>"+Math.round(r.sec)+" s</td></tr>"; }).join("");
  openModal("Usage report",'<div style="font:12.5px/1.7 system-ui"><b>'+u.total+'</b> files in the Library · <b>'+u.rows.length+'</b> on the timeline now · <b>'+u.off.length+'</b> not on the timeline<br><b>'+u.never.length+'</b> never used (<b>'+sz(neverSize)+'</b>)</div>'+
    (top?'<table style="font:12px system-ui;margin-top:8px;width:100%">'+top+"</table>":'<p style="font-size:12px;opacity:.7">Nothing from the Library is on the timeline yet.</p>')+
    '<div class="mdetail-actions"><button type="button" class="chip" id="luOff">Select not on timeline</button><button type="button" class="chip" id="luNever">Select never used</button></div>');
  document.getElementById("luOff").onclick=function(){ closeModal(); var ids=u.off.map(function(i){ return i.id; }); if(ids.length){ X.selectIds(ids); X.toast(ids.length+" selected"); } else X.toast("Everything is on the timeline"); };
  document.getElementById("luNever").onclick=function(){ closeModal(); var ids=u.never.map(function(i){ return i.id; }); if(ids.length){ X.selectIds(ids); X.toast(ids.length+" selected"); } else X.toast("Every file has been used"); }; };
X.add({id:"lx_usage",group:"Info",label:"Usage report…",hint:"timeline",run:function(){ X.usageDialog(); }});
try{ window.AMIYO_EDITOR_BUILD="lib-step161-usage"; }catch(e){}
})();

;
/* ==================== Script 639 id="amiyo-libx-step16" ==================== */
/* Library Studio step 16: relink missing media (like Premiere's Link Media). Lists files whose data is gone and lets you
   pick the originals again; files are matched by name and put back in place, keeping ratings, tags, bins and notes. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.selectIds||X.relink) return;
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
X.missing=function(){ var m=M.state.missing; return M.items().filter(function(i){ return m.has(i.id); }); };
X.relinkFiles=function(files){ var miss=X.missing(), done=[], left=Array.prototype.slice.call(files);
  var chain=Promise.resolve();
  miss.forEach(function(it){ chain=chain.then(function(){ var k=left.findIndex(function(f){ return f.name.toLowerCase()===String(it.name).toLowerCase(); }); if(k<0) return;
    var f=left.splice(k,1)[0]; return Promise.resolve(window.amiyoPutBlob&&window.amiyoPutBlob(it.blobKey,f)).then(function(){ M.state.missing.delete(it.id); done.push(it); }); }); });
  return chain.then(function(){ if(done.length) X.save(done); X.toast(done.length?("Relinked "+done.length+" of "+miss.length+" file"+(miss.length===1?"":"s")):"No file names matched"); return done.length; }); };
X.relink=function(){ var miss=X.missing(); if(!miss.length){ X.toast("No missing files - everything is linked"); return; }
  var inp=document.createElement("input"); inp.type="file"; inp.multiple=true; inp.accept="video/*,audio/*,image/*"; inp.style.display="none"; document.body.appendChild(inp);
  inp.onchange=function(){ var f=inp.files; inp.remove(); if(f&&f.length) X.relinkFiles(f); }; inp.click(); };
X.missingDialog=function(){ var miss=X.missing(); if(!miss.length){ X.toast("No missing files - everything is linked"); return; }
  openModal("Missing files ("+miss.length+")",'<ul style="font:12.5px/1.7 system-ui;padding-left:18px;margin:0 0 8px;max-height:40vh;overflow:auto">'+miss.map(function(i){ return "<li>"+esc(i.name)+"</li>"; }).join("")+'</ul><p style="font-size:11.5px;opacity:.7">Pick the original files again. They are matched by name.</p><div class="mdetail-actions"><button type="button" class="chip pri" id="lmPick">Choose files…</button><button type="button" class="chip" id="lmSel">Select them</button></div>');
  document.getElementById("lmPick").onclick=function(){ closeModal(); X.relink(); };
  document.getElementById("lmSel").onclick=function(){ closeModal(); X.selectIds(miss.map(function(i){ return i.id; })); }; };
X.add({id:"lx_relink",group:"Repair",label:"Relink missing files…",run:function(){ X.missingDialog(); }});
try{ window.AMIYO_EDITOR_BUILD="lib-step162-relink"; }catch(e){}
})();

;
/* ==================== Script 640 id="amiyo-libx-step17" ==================== */
/* Library Studio step 17: export the Library list as a spreadsheet (CSV) or JSON, or copy the file names. Uses the selected
   files, or every file when nothing is selected. Handy for logging footage or sharing a shot list. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.selectIds||X.exportCSV) return;
function binName(id){ var b=(M.state.bins||[]).find(function(x){ return x.id===id; }); return b?b.name:""; }
function iso(t){ return t?new Date(t).toISOString():""; }
function cell(v){ var s=String(v==null?"":v); if(/^[=+\-@\t\r]/.test(s)) s="'"+s; return /[",\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s; }
function scope(){ var s=X.sel(); return s.length?s:M.items(); }
var HEAD=["name","type","size_bytes","duration_s","width","height","added","last_used","times_used","bin","label","rating","favorite","tags","note"];
X.rows=function(list){ return list.map(function(i){ return [i.name,i.type,i.size||0,i.type==="image"?"":(+i.duration||0).toFixed(2),i.width||"",i.height||"",iso(i.addedAt),iso(i.lastUsed),i.uses||0,binName(i.bin),i.label||"",i.rating||"",i.fav?"yes":"",(i.tags||[]).join("; "),i.note||""]; }); };
X.csv=function(list){ return [HEAD].concat(X.rows(list)).map(function(r){ return r.map(cell).join(","); }).join("\r\n"); };
function download(name,text,mime){ var b=new Blob(["\ufeff"+text],{type:mime}), u=URL.createObjectURL(b), a=document.createElement("a"); a.href=u; a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(u); },4000); }
function stamp(){ return new Date().toISOString().slice(0,10); }
X.exportCSV=function(){ var l=scope(); if(!l.length){ X.toast("The Library is empty"); return; } download("amiyo-library-"+stamp()+".csv",X.csv(l),"text/csv;charset=utf-8"); X.toast("Exported "+l.length+" file"+(l.length===1?"":"s")+" to CSV"); };
X.exportJSON=function(){ var l=scope(); if(!l.length){ X.toast("The Library is empty"); return; } var o=X.rows(l).map(function(r){ var m={}; HEAD.forEach(function(h,k){ m[h]=r[k]; }); return m; }); download("amiyo-library-"+stamp()+".json",JSON.stringify(o,null,2),"application/json"); X.toast("Exported "+l.length+" file"+(l.length===1?"":"s")+" to JSON"); };
X.copyNames=function(){ var l=scope(), t=l.map(function(i){ return i.name; }).join("\n"); if(!l.length){ X.toast("The Library is empty"); return; }
  (navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(t):Promise.reject()).then(function(){ X.toast("Copied "+l.length+" name"+(l.length===1?"":"s")); },function(){ openModal("File names",'<textarea style="width:100%;height:40vh;font:12px monospace" readonly>'+t.replace(/&/g,"&amp;").replace(/</g,"&lt;")+"</textarea>"); }); };
X.add({id:"lx_exp_csv",group:"Export",label:"Export list as CSV (spreadsheet)",run:function(){ X.exportCSV(); }});
X.add({id:"lx_exp_json",group:"Export",label:"Export list as JSON",run:function(){ X.exportJSON(); }});
X.add({id:"lx_exp_names",group:"Export",label:"Copy file names",run:function(){ X.copyNames(); }});
try{ window.AMIYO_EDITOR_BUILD="lib-step163-export"; }catch(e){}
})();

;
/* ==================== Script 641 id="amiyo-libx-step18" ==================== */
/* Library Studio step 18: group files under headers - by type, month added, label, rating, bin or resolution - with counts,
   like Premiere's grouped Project panel. Lib+ > Group. The choice is remembered on this device. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.onRender||X.group) return;
X.css("libx-gh-css",".libx-gh{grid-column:1/-1;width:100%;margin:8px 0 2px;padding:4px 8px;border-left:3px solid var(--accent,#ff7a3d);font:700 11px system-ui;letter-spacing:.05em;text-transform:uppercase;color:var(--muted,#a99f8d);background:rgba(255,255,255,.03);border-radius:0 6px 6px 0;box-sizing:border-box}");
var KEY="amiyo_libx_group", mode="none"; try{ mode=localStorage.getItem(KEY)||"none"; }catch(e){}
function binName(id){ var b=(M.state.bins||[]).find(function(x){ return x.id===id; }); return b?b.name:"No bin"; }
var G={
  type:function(i){ return {video:"Video",audio:"Audio",image:"Images"}[i.type]||"Other"; },
  month:function(i){ var d=new Date(i.addedAt||Date.now()); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0"); },
  label:function(i){ return i.label?i.label[0].toUpperCase()+i.label.slice(1):"No label"; },
  rating:function(i){ return i.rating?"★".repeat(i.rating):"Unrated"; },
  bin:function(i){ return binName(i.bin); },
  res:function(i){ var h=Math.max(+i.width||0,+i.height||0); return !h?"Unknown size":h>=3840?"4K and up":h>=1920?"HD 1080p":"Below 1080p"; }
};
function sync(){ var body=document.getElementById("mlibBody"); if(!body) return; var grid=body.querySelector(".mlib-grid"); if(!grid) return;
  var fn=G[mode]; var cards=Array.prototype.slice.call(grid.querySelectorAll(":scope > .mcard[data-lib]"));
  if(!fn){ grid.querySelectorAll(":scope > .libx-gh").forEach(function(h){ h.remove(); }); delete grid.dataset.lxg; return; }
  var all=M.items(), sig=mode+"|"+cards.map(function(c){ return c.dataset.lib; }).join(",");
  if(grid.dataset.lxg===sig) return;
  grid.querySelectorAll(":scope > .libx-gh").forEach(function(h){ h.remove(); });
  var groups={}, order=[]; cards.forEach(function(c){ var it=all.find(function(i){ return i.id===c.dataset.lib; }); var g=it?fn(it):"Other"; if(!groups[g]){ groups[g]=[]; order.push(g); } groups[g].push(c); });
  var anchor=grid.querySelector(":scope > :not(.mcard)"); var frag=document.createDocumentFragment();
  order.forEach(function(g){ var h=document.createElement("div"); h.className="libx-gh"; h.setAttribute("role","heading"); h.setAttribute("aria-level","3"); h.textContent=g+" · "+groups[g].length; frag.appendChild(h); groups[g].forEach(function(c){ frag.appendChild(c); }); });
  grid.insertBefore(frag,anchor); grid.dataset.lxg=mode+"|"+Array.prototype.slice.call(grid.querySelectorAll(":scope > .mcard[data-lib]")).map(function(c){ return c.dataset.lib; }).join(","); }
X.group=function(m){ mode=G[m]?m:"none"; try{ localStorage.setItem(KEY,mode); }catch(e){} var grid=document.querySelector("#mlibBody .mlib-grid"); if(grid) delete grid.dataset.lxg; M.render(); X.toast(mode==="none"?"Grouping off":"Grouped by "+m); };
X.onRender(sync);
[["none","Group: off"],["type","Group by type"],["month","Group by month added"],["label","Group by label"],["rating","Group by rating"],["bin","Group by bin"],["res","Group by resolution"]].forEach(function(g){ X.add({id:"lx_grp_"+g[0],group:"Group",label:g[1],run:function(){ X.group(g[0]); }}); });
try{ window.AMIYO_EDITOR_BUILD="lib-step164-group"; }catch(e){}
})();

;
/* ==================== Script 642 id="amiyo-libx-step19" ==================== */
/* Library Studio step 19: live status line at the bottom of the Library, like Premiere's Project panel footer:
   files shown, their total length and size, and the same for your selection. Updates as you filter, find and select. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.onRender||X.stats) return;
X.css("libx-stats-css",".libx-stats{position:sticky;bottom:0;z-index:4;margin-top:8px;padding:6px 10px;border:1px solid var(--line,#3a3226);border-radius:8px;background:var(--panel,#17140f);color:var(--muted,#a99f8d);font:11.5px/1.5 system-ui}.libx-stats b{color:var(--text,#e6dfd0)}");
function sz(b){ b=+b||0; return b<1048576?Math.round(b/1024)+" KB":b<1073741824?(b/1048576).toFixed(1)+" MB":(b/1073741824).toFixed(2)+" GB"; }
function tm(s){ s=Math.round(+s||0); var h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60; return h?h+"h "+m+"m":m?m+"m "+x+"s":x+"s"; }
function sum(list){ return list.reduce(function(a,i){ a.n++; a.size+=+i.size||0; a.dur+=i.type==="image"?0:(+i.duration||0); return a; },{n:0,size:0,dur:0}); }
X.stats=function(){ var all=M.items(), ids={}; X.cards().forEach(function(c){ ids[c.dataset.lib]=1; });
  var shown=sum(all.filter(function(i){ return ids[i.id]; })), sel=sum(all.filter(function(i){ return M.state.sel.has(i.id); })), tot=sum(all);
  var t="<b>"+shown.n+"</b> of "+tot.n+" shown · <b>"+tm(shown.dur)+"</b> · <b>"+sz(shown.size)+"</b>";
  if(sel.n) t+="<br>Selected: <b>"+sel.n+"</b> · "+tm(sel.dur)+" · "+sz(sel.size); return t; };
function sync(){ var body=document.getElementById("mlibBody"); if(!body||!M.state.loaded) return; var bar=body.querySelector(".libx-stats");
  if(!M.items().length){ if(bar) bar.remove(); return; }
  if(!bar){ bar=document.createElement("div"); bar.className="libx-stats"; bar.setAttribute("role","status"); body.appendChild(bar); }
  else if(bar!==body.lastElementChild) body.appendChild(bar);
  var h=X.stats(); if(bar.dataset.h!==h){ bar.dataset.h=h; bar.innerHTML=h; } }
X.onRender(sync); sync();
X.add({id:"lx_stats_now",group:"Info",label:"Show library totals",run:function(){ var t=sum(M.items()); X.toast(t.n+" files · "+tm(t.dur)+" · "+sz(t.size),4200); }});
try{ window.AMIYO_EDITOR_BUILD="lib-step165-stats"; }catch(e){}
})();

;
/* ==================== Script 643 id="amiyo-libx-step20" ==================== */
/* Library Studio step 20: storage report. Shows the biggest files first with their share of the Library, and selects the
   largest ones in one tap so you can remove or back them up. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.selectIds||X.storage) return;
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function sz(b){ b=+b||0; return b<1048576?Math.round(b/1024)+" KB":b<1073741824?(b/1048576).toFixed(1)+" MB":(b/1073741824).toFixed(2)+" GB"; }
X.biggest=function(n){ return M.items().slice().sort(function(a,b){ return (+b.size||0)-(+a.size||0); }).slice(0,n||10); };
X.storage=function(){ var all=M.items(), tot=all.reduce(function(a,i){ return a+(+i.size||0); },0); if(!all.length){ X.toast("The Library is empty"); return; }
  var top=X.biggest(10), rows=top.map(function(i){ var p=tot?Math.round((+i.size||0)/tot*100):0; return "<tr><td style='padding:2px 8px 2px 0;word-break:break-word'>"+esc(i.name)+"</td><td style='padding:2px 8px;white-space:nowrap'>"+sz(i.size)+"</td><td style='padding:2px 0'>"+p+"%</td></tr>"; }).join("");
  openModal("Storage report",'<div style="font:12.5px/1.7 system-ui"><b>'+all.length+"</b> files · <b>"+sz(tot)+'</b> in total</div><table style="font:12px system-ui;margin-top:8px;width:100%">'+rows+'</table><div class="mdetail-actions"><button type="button" class="chip pri" id="lsBig">Select the 5 biggest</button></div>');
  document.getElementById("lsBig").onclick=function(){ closeModal(); X.selectIds(X.biggest(5).map(function(i){ return i.id; })); X.toast("5 biggest files selected"); }; };
X.add({id:"lx_storage",group:"Info",label:"Storage report…",hint:"biggest files",run:function(){ X.storage(); }});
try{ window.AMIYO_EDITOR_BUILD="lib-step166-storage"; }catch(e){}
})();

;
/* ==================== Script 644 id="amiyo-libx-step21" ==================== */
/* Library Studio step 21: bin tools. Sort bins A-Z, delete empty bins, and see how many files each bin holds. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.binFor||X.binTools) return;
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function counts(){ var n={}; M.items().forEach(function(i){ if(i.bin) n[i.bin]=(n[i.bin]||0)+1; }); return n; }
X.binTools=true;
X.sortBins=function(){ var b=M.state.bins; if(!b||b.length<2){ X.toast("Need at least two bins"); return; } b.sort(function(x,y){ return String(x.name).localeCompare(String(y.name),undefined,{numeric:true}); }); try{ M.saveBins(); }catch(e){} M.render(); X.toast("Bins sorted A–Z"); };
X.deleteEmptyBins=function(){ var st=M.state, n=counts(), keep=st.bins.filter(function(b){ return n[b.id]; }), gone=st.bins.length-keep.length; if(!gone){ X.toast("No empty bins"); return 0; }
  if(st.bin!=="all"&&!n[st.bin]) st.bin="all"; st.bins.length=0; keep.forEach(function(b){ st.bins.push(b); }); try{ M.saveBins(); }catch(e){} M.render(); X.toast(gone+" empty bin"+(gone===1?"":"s")+" deleted"); return gone; };
X.binReport=function(){ var st=M.state, n=counts(), none=M.items().filter(function(i){ return !i.bin; }).length;
  if(!st.bins.length){ X.toast("No bins yet - try Auto-bins"); return; }
  openModal("Bins",'<table style="font:12.5px/1.7 system-ui;width:100%">'+st.bins.map(function(b){ return "<tr><td>📁 "+esc(b.name)+"</td><td style='text-align:right'>"+(n[b.id]||0)+"</td></tr>"; }).join("")+"<tr><td style='opacity:.7'>No bin</td><td style='text-align:right;opacity:.7'>"+none+"</td></tr></table>"); };
X.add({id:"lx_bin_report",group:"Bins",label:"Bin overview…",run:function(){ X.binReport(); }});
X.add({id:"lx_bin_sort",group:"Bins",label:"Sort bins A–Z",run:function(){ X.sortBins(); }});
X.add({id:"lx_bin_empty",group:"Bins",label:"Delete empty bins",run:function(){ X.deleteEmptyBins(); }});
try{ window.AMIYO_EDITOR_BUILD="lib-step167-bins"; }catch(e){}
})();

;
/* ==================== Script 645 id="amiyo-libx-step22" ==================== */
/* Library Studio step 22: find and replace in file names. Fix a typo or swap a word in all selected files (or all files),
   with a preview of the first changes before anything is renamed. Undo with Ctrl+Z in the Library. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.rename||X.replaceNames) return;
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
X.replacePlan=function(list,find,rep){ if(!find) return []; var low=find.toLowerCase(), out=[];
  list.forEach(function(i){ var n=String(i.name||""), res="", k=0, idx; while((idx=n.toLowerCase().indexOf(low,k))>=0){ res+=n.slice(k,idx)+rep; k=idx+find.length; } res+=n.slice(k); res=res.replace(/[\\/:*?"<>|]/g,"-").trim(); if(res&&res!==n) out.push({it:i,to:res}); }); return out; };
X.replaceNames=function(find,rep,list){ var p=X.replacePlan(list||(X.sel().length?X.sel():M.items()),find,rep); p.forEach(function(x){ x.it.name=x.to; }); if(p.length) X.save(p.map(function(x){ return x.it; })); return p.length; };
X.add({id:"lx_findrep",group:"Organize",label:"Find & replace in names…",run:function(){ var s=X.sel(), list=s.length?s:M.items(); if(!list.length){ X.toast("The Library is empty"); return; }
  openModal("Find & replace in "+list.length+" name"+(list.length===1?"":"s"),'<label class="field">Find</label><input id="frF" type="text" style="width:100%"><label class="field">Replace with</label><input id="frR" type="text" style="width:100%"><div id="frP" style="font:12px monospace;line-height:1.6;margin-top:8px"></div><div class="mdetail-actions"><button type="button" class="chip pri" id="frGo">Replace</button></div>');
  var f=document.getElementById("frF"), r=document.getElementById("frR"), pv=document.getElementById("frP");
  function prev(){ var p=X.replacePlan(list,f.value,r.value); pv.innerHTML=p.length?p.slice(0,4).map(function(x){ return esc(x.it.name)+" → <b>"+esc(x.to)+"</b>"; }).join("<br>")+(p.length>4?"<br>… and "+(p.length-4)+" more":""):(f.value?"No names change":""); }
  f.oninput=prev; r.oninput=prev; document.getElementById("frGo").onclick=function(){ var c=X.replaceNames(f.value,r.value,list); closeModal(); X.toast(c?c+" renamed":"Nothing renamed"); }; }});
try{ window.AMIYO_EDITOR_BUILD="lib-step168-findreplace"; }catch(e){}
})();

;
/* ==================== Script 646 id="amiyo-libx-step23" ==================== */
/* Library Studio step 23: built-in help and self-test. Lib+ > Library help lists every tool and shortcut; Lib+ > Self-test
   checks that all Library Studio tools loaded and tells you which one is missing, if any. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||X.selfTest) return;
var NEED=["keys","range","cols","props","find","saved","autoBin","tagAdd","label","undo","quick","usage","relink","exportCSV","group","stats","storage","binTools","replaceNames"];
X.selfTest=function(){ var bad=NEED.filter(function(k){ return !X[k]; }), fn=[];
  try{ if(typeof X.csv!=="function"||X.csv([]).indexOf("name,type")!==0) fn.push("CSV header"); }catch(e){ fn.push("CSV"); }
  try{ if(X.names([{name:"a.mp4",type:"video"}],"{name}-{nn}",1)[0]!=="a-01.mp4") fn.push("rename pattern"); }catch(e){ fn.push("rename"); }
  try{ if(!X.makePred({type:"video",name:"a"})({name:"a.mp4",type:"video"})) fn.push("find rule"); }catch(e){ fn.push("find"); }
  try{ if(typeof X.stats()!=="string") fn.push("stats"); }catch(e){ fn.push("stats"); }
  var ok=!bad.length&&!fn.length;
  openModal("Library self-test",'<div style="font:13px/1.8 system-ui"><b>'+(ok?"All "+NEED.length+" tools are ready ✓":"Problems found")+"</b><br>"+(bad.length?"Not loaded: "+bad.join(", ")+"<br>":"")+(fn.length?"Failed checks: "+fn.join(", ")+"<br>":"")+"Menu entries: "+X.items.length+" · Build: "+String(window.AMIYO_EDITOR_BUILD||"?")+"</div>"); return ok; };
X.help=function(){ var g={}, o=[]; X.items.forEach(function(it){ var k=it.group||"Tools"; if(!g[k]){ g[k]=[]; o.push(k); } g[k].push(it.label); });
  openModal("Library help",'<div style="font:12px/1.6 system-ui;max-height:60vh;overflow:auto"><p><b>Keys</b> (click a file first): arrows move · Shift+arrows extend · Ctrl+A all · Enter add · Delete remove · 1–5 rate · F favorite · Space quick look · Ctrl+Z undo</p>'+
    o.map(function(k){ return "<b>"+k+"</b><div style='opacity:.8;margin-bottom:6px'>"+g[k].map(function(l){ return String(l).replace(/[<&]/g,""); }).join(" · ")+"</div>"; }).join("")+"</div>"); };
X.add({id:"lx_help",group:"Info",label:"Library help…",run:function(){ X.help(); }});
X.add({id:"lx_selftest",group:"Info",label:"Self-test…",run:function(){ X.selfTest(); }});
try{ window.AMIYO_EDITOR_BUILD="lib-step169-help"; }catch(e){}
})();

;
/* ==================== Script 647 id="amiyo-libw-step01" ==================== */
/* Library Plus step 1: waveform pictures for audio files. Audio files in the Library used to show only a music-note icon.
   Now each one gets a small waveform picture as its thumbnail (made once, in the background, one file at a time, and kept).
   Skipped in Lite mode and for very large audio files (over 80 MB) so the phone never runs out of memory.
   Lib+ > "Make waveform pictures" redoes them. */
(function(){"use strict";
var M=window.amiyoMediaLib; if(!M||!M.persist||window.AMIYO_LIBW) return;
var W=window.AMIYO_LIBW={v:1}, MAXB=80*1048576, busy=false, timer=0, bad={};
function peaks(buf,n){ var ch=buf.numberOfChannels, len=buf.length, out=new Array(n), step=Math.max(1,Math.floor(len/n)), data=[], c, i, j;
  for(c=0;c<ch;c++) data.push(buf.getChannelData(c));
  for(i=0;i<n;i++){ var a=i*step, b=Math.min(len,a+step), m=0; var skip=Math.max(1,Math.floor((b-a)/400));
    for(j=a;j<b;j+=skip){ for(c=0;c<ch;c++){ var v=Math.abs(data[c][j]); if(v>m) m=v; } }
    out[i]=m; }
  var top=0; for(i=0;i<n;i++) if(out[i]>top) top=out[i];
  if(top>0) for(i=0;i<n;i++) out[i]=out[i]/top;
  return out; }
function draw(p){ var w=240,h=135,c=document.createElement("canvas"); c.width=w; c.height=h; var g=c.getContext("2d");
  var bg=g.createLinearGradient(0,0,w,h); bg.addColorStop(0,"#1f1b16"); bg.addColorStop(1,"#141210"); g.fillStyle=bg; g.fillRect(0,0,w,h);
  g.fillStyle="rgba(255,122,61,.25)"; g.fillRect(0,h/2-.5,w,1);
  var n=p.length, bw=w/n; g.fillStyle="#ff7a3d";
  for(var i=0;i<n;i++){ var bh=Math.max(2,p[i]*(h*.78)); g.fillRect(i*bw+.5,(h-bh)/2,Math.max(1,bw-1.4),bh); }
  return c.toDataURL("image/jpeg",0.82); }
function decode(blob){ var OAC=window.OfflineAudioContext||window.webkitOfflineAudioContext; if(!OAC) return Promise.reject(new Error("no audio"));
  return blob.arrayBuffer().then(function(ab){ var ctx=new OAC(1,1,44100); return new Promise(function(res,rej){ var p=ctx.decodeAudioData(ab,res,rej); if(p&&p.then) p.then(res,rej); }); }); }
function need(it){ return it&&it.type==="audio"&&!it.thumb&&!it.wfTried&&!bad[it.id]&&!(M.state.missing&&M.state.missing.has(it.id)); }
function one(it){ return M.getBlob(it).then(function(b){ if(!b) throw new Error("missing"); if(b.size>MAXB) throw new Error("big"); return decode(b); })
  .then(function(buf){ it.thumb=draw(peaks(buf,96)); it.wf=1; return M.persist(it); })
  .catch(function(e){ bad[it.id]=1; it.wfTried=1; try{ M.persist(it); }catch(_){} }); }
function run(){ if(busy||window.__amiyoLite) return; var list=M.items().filter(need); if(!list.length) return; busy=true; var made=0;
  (function next(){ var it=list.shift(); if(!it||window.__amiyoLite){ busy=false; if(made){ try{ M.render(); }catch(e){} } return; }
    one(it).then(function(){ if(it.wf) made++; setTimeout(next,60); }); })(); }
W.scan=run;
W.redo=function(){ var n=0; M.items().forEach(function(it){ if(it.type==="audio"&&(it.wf||it.wfTried)){ if(it.wf) it.thumb=null; it.wf=0; it.wfTried=0; delete bad[it.id]; try{ M.persist(it); }catch(e){} n++; } }); run(); return n; };
W.peaks=peaks; W.draw=draw;
function later(){ clearTimeout(timer); timer=setTimeout(run,900); }
new MutationObserver(function(){ if(document.getElementById("mlibBody")) later(); }).observe(document.body,{childList:true,subtree:true}); later();
var X=window.AMIYO_LIBX; if(X&&X.add) X.add({id:"lw_wave",group:"View",label:"Make waveform pictures for audio",run:function(){ var n=W.redo(); X.toast(n?"Redoing "+n+" waveform picture"+(n===1?"":"s"):"Making waveform pictures for new audio files…"); }});
try{ window.AMIYO_EDITOR_BUILD="libw-step01-wave"; }catch(e){}
})();

;
/* ==================== Script 648 id="amiyo-libw-step02" ==================== */
/* Library Plus step 2: choose the poster frame. A video's Library picture used to be one frame near the start.
   Lib+ > "Choose poster frame…": pick a video, drag the slider (or step one frame at a time), press "Use this frame".
   The picture is saved with the file. "At 10%" goes back to the automatic position. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!M||X.poster) return;
var url="", timer=0, curId="";
function free(){ if(url){ try{ URL.revokeObjectURL(url); }catch(e){} url=""; } }
function isOpen(){ var m=document.getElementById("modalBackdrop"); return !!(m&&m.style.display&&m.style.display!=="none"); }
function watch(){ clearInterval(timer); timer=setInterval(function(){ if(!isOpen()||!document.getElementById("lwPoster")){ clearInterval(timer); free(); curId=""; } },700); }
function tm(t){ t=Math.max(0,t||0); var m=Math.floor(t/60), s=t-m*60; return m+":"+(s<10?"0":"")+s.toFixed(2); }
function grab(v){ var w=v.videoWidth,h=v.videoHeight; if(!w||!h) return null; var s=Math.min(1,240/w), c=document.createElement("canvas"); c.width=Math.max(1,Math.round(w*s)); c.height=Math.max(1,Math.round(h*s));
  try{ c.getContext("2d").drawImage(v,0,0,c.width,c.height); return c.toDataURL("image/jpeg",0.76); }catch(e){ return null; } }
X.poster=function(id){ var it=X.item(id); if(!it||it.type!=="video"){ X.toast("Select one video file first"); return; }
  free(); M.getBlob(it).then(function(b){ if(!b){ X.toast("This file is missing from the library"); return; } url=URL.createObjectURL(b); curId=id;
    openModal("Choose poster frame",'<div id="lwPoster" style="font:13px/1.5 system-ui"><video id="lwPV" src="'+url+'" muted playsinline preload="auto" style="width:100%;max-height:42vh;background:#000;border-radius:8px"></video>'+
      '<input type="range" id="lwPR" min="0" max="1000" value="100" aria-label="Frame position" style="width:100%;height:38px;margin:6px 0 0">'+
      '<div id="lwPT" style="text-align:center;opacity:.8;margin-bottom:6px">0:00.00</div>'+
      '<div class="mdetail-actions" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center"><button type="button" class="chip" id="lwPm">‹ Frame</button><button type="button" class="chip" id="lwPp">Frame ›</button><button type="button" class="chip" id="lwP10">At 10%</button><button type="button" class="chip pri" id="lwPU">Use this frame</button></div></div>');
    var v=document.getElementById("lwPV"), r=document.getElementById("lwPR"), t=document.getElementById("lwPT"), fps=(+it.fps>0&&+it.fps<241)?+it.fps:30;
    function dur(){ return isFinite(v.duration)&&v.duration>0?v.duration:(+it.duration||0); }
    function go(sec){ var d=dur(); if(!d) return; sec=Math.max(0,Math.min(Math.max(0,d-0.05),sec)); try{ v.currentTime=sec; }catch(e){} r.value=Math.round(sec/d*1000); t.textContent=tm(sec)+" / "+tm(d); }
    v.addEventListener("loadedmetadata",function(){ go(it.posterAt!=null?+it.posterAt:dur()*0.1); });
    r.oninput=function(){ go(r.value/1000*dur()); };
    document.getElementById("lwPm").onclick=function(){ go(v.currentTime-1/fps); };
    document.getElementById("lwPp").onclick=function(){ go(v.currentTime+1/fps); };
    document.getElementById("lwP10").onclick=function(){ go(dur()*0.1); };
    function save(){ var img=grab(v); if(!img){ X.toast("Could not read that frame"); return; } it.thumb=img; it.posterAt=v.currentTime; X.save([it]); closeModal(); X.toast("Poster frame saved"); }
    document.getElementById("lwPU").onclick=function(){ if(v.seeking){ v.addEventListener("seeked",save,{once:true}); } else save(); };
    watch();
  }).catch(function(){ X.toast("Could not open this file"); }); };
X.add({id:"lw_poster",group:"View",label:"Choose poster frame…",run:function(){ var s=X.sel().filter(function(i){ return i.type==="video"; }); if(!s.length){ X.toast("Click a video file first"); return; } X.poster(s[0].id); }});
try{ window.AMIYO_EDITOR_BUILD="libw-step02-poster"; }catch(e){}
})();

;
/* ==================== Script 649 id="amiyo-libw-step03" ==================== */
/* Library Plus step 3: drag files onto bins. Drag one file (or all selected files) from the Library onto a bin button to
   file it there. Dropping on "All files" takes it out of its bin. Works with the mouse; on a phone use the selection bar's
   move-to-bin button. Library undo (Lib+ > Undo) brings the old bins back. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!M||X.dropBin) return;
var st=document.createElement("style"); st.id="lwDropCss";
st.textContent="#mlibBody .mchip.lw-drop{outline:2px dashed #ff7a3d;outline-offset:1px;background:rgba(255,122,61,.18)}body.lib-dragging #mlibBody .mchip[data-mbin]{box-shadow:0 0 0 1px rgba(255,122,61,.45)}";
document.head.appendChild(st);
function has(e){ return !!(e.dataTransfer&&Array.prototype.indexOf.call(e.dataTransfer.types||[],"text/amiyo-lib")>=0); }
function chip(e){ var t=e.target; return t&&t.closest?t.closest("#mlibBody .mchip[data-mbin]"):null; }
function clear(){ var l=document.querySelectorAll("#mlibBody .mchip.lw-drop"); for(var i=0;i<l.length;i++) l[i].classList.remove("lw-drop"); }
X.dropBin=function(ids,binId){ var all=M.items(), list=[], bins=M.state.bins||[], b=bins.find(function(x){ return x.id===binId; });
  if(binId!=="all"&&!b) return 0;
  ids.forEach(function(id){ var it=all.find(function(i){ return i.id===id; }); if(!it) return; if(binId==="all"){ if(it.bin===undefined) return; delete it.bin; } else { if(it.bin===binId) return; it.bin=binId; } list.push(it); });
  if(!list.length) return 0; X.save(list);
  X.toast(binId==="all"?list.length+" file"+(list.length===1?"":"s")+" taken out of bins":list.length+" file"+(list.length===1?"":"s")+" moved to “"+b.name+"”"); return list.length; };
document.addEventListener("dragover",function(e){ if(!has(e)) return; var c=chip(e); if(!c) return; e.preventDefault(); try{ e.dataTransfer.dropEffect="copy"; }catch(_){} if(!c.classList.contains("lw-drop")){ clear(); c.classList.add("lw-drop"); } },true);
document.addEventListener("dragleave",function(e){ var c=chip(e); if(c&&!(e.relatedTarget&&c.contains(e.relatedTarget))) c.classList.remove("lw-drop"); },true);
document.addEventListener("dragend",clear,true);
document.addEventListener("drop",function(e){ if(!has(e)) return; var c=chip(e); clear(); if(!c) return; e.preventDefault(); e.stopPropagation();
  var ids=(e.dataTransfer.getData("text/amiyo-lib")||"").split(",").filter(Boolean); if(!ids.length) return; document.body.classList.remove("lib-dragging");
  if(!X.dropBin(ids,c.dataset.mbin)) X.toast("Already there"); },true);
try{ window.AMIYO_EDITOR_BUILD="libw-step03-dropbin"; }catch(e){}
})();

;
/* ==================== Script 650 id="amiyo-libw-step04" ==================== */
/* Library Plus step 4: import a whole folder. Lib+ > "Import folder…" picks a folder; every video, sound and picture inside is imported
   and put into a bin named after its folder (sub-folders become "Folder / Sub"). Files already in the Library are kept as they are.
   Phones whose browser cannot pick folders choose several files instead and give the new bin a name. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!M||X.importFolder) return;
var MEDIA=/\.(mp4|m4v|mov|mkv|webm|avi|3gp|ogv|mp3|wav|wave|m4a|m4b|aac|ogg|oga|flac|opus|wma|aiff?|aifc|amr|caf|weba|mka|jpe?g|png|gif|webp|bmp|avif|svg)$/i;
function isMedia(f){ if(!f||!f.name||f.name.charAt(0)===".") return false; var t=f.type||""; return /^(video|audio|image)\//.test(t)||MEDIA.test(f.name); }
function rel(f){ return String(f.webkitRelativePath||""); }
function binFor(name){ var bins=M.state.bins, n=String(name||"Imported").replace(/\s+/g," ").trim().slice(0,40)||"Imported", b=bins.find(function(x){ return x.name===n; });
  if(!b){ b={id:"bin_"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),name:n}; bins.push(b); try{ M.saveBins(); }catch(e){} } return b; }
function groups(files){ var g={}, order=[], root=""; var withPath=files.filter(function(f){ return rel(f); });
  if(withPath.length) root=rel(withPath[0]).split("/")[0];
  files.forEach(function(f){ var p=rel(f), name;
    if(p){ var parts=p.split("/"); parts.pop(); name=parts.join(" / ")||root; } else name="";
    if(!g[name]){ g[name]=[]; order.push(name); } g[name].push(f); });
  return {map:g,order:order}; }
function natural(a,b){ return rel(a).localeCompare(rel(b),undefined,{numeric:true})||String(a.name).localeCompare(String(b.name),undefined,{numeric:true}); }
function assignLater(ids,bin,state){ var deadline=Date.now()+90000, left=ids.slice();
  (function poll(){ left=left.filter(function(id){ var a=(typeof project!=="undefined"&&project.assets)?project.assets[id]:null; if(!a) return false; var it=a.libId?M.byId(a.libId):null; if(!it) return true;
      if(!it.bin){ it.bin=bin.id; state.moved++; X.save([it]); } else state.kept++; return false; });
    if(left.length&&Date.now()<deadline) setTimeout(poll,700); })(); }
X.importFolder=async function(files){ files=Array.prototype.slice.call(files||[]); var media=files.filter(isMedia).sort(natural), skipped=files.length-media.length;
  if(!media.length){ X.toast("No videos, sounds or pictures found there"); return null; }
  if(typeof window.importFiles!=="function"){ X.toast("Import is not ready yet"); return null; }
  var g=groups(media), total=media.reduce(function(s,f){ return s+(f.size||0); },0);
  if(g.order.length===1&&g.order[0]===""){ var nm=await (typeof amiyoAsk==="function"?amiyoAsk("Name for the new bin",""):Promise.resolve("Imported")); if(nm===null) return null; g.map[nm.trim()||"Imported"]=g.map[""]; delete g.map[""]; g.order=[nm.trim()||"Imported"]; }
  if(media.length>40||total>5e8){ var ok=typeof amiyoOk==="function"?await amiyoOk("Import "+media.length+" files ("+(total/1048576).toFixed(0)+" MB)?\nThey are copied into this browser's storage.",{okLabel:"Import"}):true; if(!ok) return null; }
  var state={moved:0,kept:0,bins:0,done:0}, n=0;
  for(var gi=0;gi<g.order.length;gi++){ var gname=g.order[gi], list=g.map[gname], bin=binFor(gname); state.bins++;
    for(var i=0;i<list.length;i+=3){ var chunk=list.slice(i,i+3), before=Object.keys(project.assets||{}), seen={}; before.forEach(function(k){ seen[k]=1; });
      try{ await window.importFiles(chunk); }catch(e){ try{ window.__swl&&window.__swl(e); }catch(_){} }
      var fresh=Object.keys(project.assets||{}).filter(function(k){ return !seen[k]&&/^asset_/.test(k); }); n+=chunk.length;
      if(fresh.length) assignLater(fresh,bin,state); X.toast("Importing "+n+" of "+media.length+"…",1800); } }
  X.toast("Imported "+media.length+" file"+(media.length===1?"":"s")+" into "+g.order.length+" bin"+(g.order.length===1?"":"s")+(skipped?" ("+skipped+" other files skipped)":""),4200);
  try{ M.render(); }catch(e){} return state; };
function pick(){ var inp=document.createElement("input"); inp.type="file"; inp.multiple=true; try{ inp.webkitdirectory=true; }catch(e){} inp.style.display="none"; document.body.appendChild(inp);
  inp.onchange=function(){ var f=Array.prototype.slice.call(inp.files||[]); inp.remove(); if(f.length) X.importFolder(f); };
  inp.addEventListener("cancel",function(){ inp.remove(); }); inp.click(); }
X.add({id:"lw_folder",group:"Import",label:"Import folder…",hint:"into bins",run:pick});
try{ window.AMIYO_EDITOR_BUILD="libw-step04-folder"; }catch(e){}
})();

;
/* ==================== Script 651 id="amiyo-libw-step05" ==================== */
/* Library Plus step 5: contact sheet. Lib+ > "Export contact sheet (PNG)" saves one picture with the thumbnails and names of the
   selected files (or every file shown, up to 150), with length, size and stars under each. Good for sharing a shot list or checking footage. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!M||X.contactSheet) return;
var MAXN=150;
function dur(s){ s=Math.round(+s||0); var h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60; return (h?h+":"+(m<10?"0":""):"")+m+":"+(x<10?"0":"")+x; }
function sz(b){ b=+b||0; return b>=1073741824?(b/1073741824).toFixed(1)+" GB":b>=1048576?Math.round(b/1048576)+" MB":Math.max(1,Math.round(b/1024))+" KB"; }
function img(src){ return new Promise(function(res){ if(!src){ res(null); return; } var im=new Image(); im.onload=function(){ res(im); }; im.onerror=function(){ res(null); }; im.src=src; }); }
function fit(g,t,x,y,w,h){ var s=t,ns=g.measureText(s).width; if(ns<=w) return s; while(s.length>1&&g.measureText(s+"…").width>w) s=s.slice(0,-1); return s+"…"; }
X.contactSheet=async function(list,opt){ opt=opt||{}; list=(list||X.targets()).slice(); if(!list.length){ X.toast("No files to put on the sheet"); return null; }
  var cut=list.length>MAXN; if(cut) list=list.slice(0,MAXN);
  var n=list.length, cols=Math.min(6,Math.max(2,Math.ceil(Math.sqrt(n*1.6)))), rows=Math.ceil(n/cols), cw=240, th=135, ch=th+46, gap=14, mar=24, head=64;
  var W=mar*2+cols*cw+(cols-1)*gap, H=head+mar+rows*ch+(rows-1)*gap+mar-8;
  var c=document.createElement("canvas"); c.width=W; c.height=H; var g=c.getContext("2d");
  g.fillStyle="#141210"; g.fillRect(0,0,W,H);
  g.fillStyle="#f1ece2"; g.font="700 22px system-ui,sans-serif"; g.textBaseline="alphabetic"; g.fillText("Amiyo Library · contact sheet",mar,38);
  g.fillStyle="#9a8f7d"; g.font="13px system-ui,sans-serif"; g.fillText(n+" file"+(n===1?"":"s")+(cut?" (first "+MAXN+")":"")+" · "+new Date().toISOString().slice(0,10),mar,58);
  var imgs=await Promise.all(list.map(function(it){ return img(it.thumb); }));
  for(var i=0;i<n;i++){ var it=list[i], col=i%cols, row=Math.floor(i/cols), x=mar+col*(cw+gap), y=head+mar+row*(ch+gap);
    g.fillStyle="#1f1b16"; g.fillRect(x,y,cw,th);
    var im=imgs[i];
    if(im){ var s=Math.max(cw/im.width,th/im.height), dw=im.width*s, dh=im.height*s; g.save(); g.beginPath(); g.rect(x,y,cw,th); g.clip(); g.drawImage(im,x+(cw-dw)/2,y+(th-dh)/2,dw,dh); g.restore(); }
    else { g.fillStyle="#6b6254"; g.font="30px system-ui,sans-serif"; g.textAlign="center"; g.fillText(it.type==="audio"?"♪":it.type==="image"?"▣":"▶",x+cw/2,y+th/2+10); g.textAlign="left"; }
    if(it.type!=="image"&&it.duration){ var d=dur(it.duration); g.font="600 11px ui-monospace,monospace"; var tw=g.measureText(d).width+10; g.fillStyle="rgba(0,0,0,.72)"; g.fillRect(x+cw-tw-4,y+th-20,tw,16); g.fillStyle="#f1ece2"; g.fillText(d,x+cw-tw+1,y+th-8); }
    g.fillStyle="#f1ece2"; g.font="600 12.5px system-ui,sans-serif"; g.fillText(fit(g,String(it.name||"file"),cw),x,y+th+17);
    g.fillStyle="#9a8f7d"; g.font="11px system-ui,sans-serif";
    var meta=[it.type, (+it.width>0&&+it.height>0)?it.width+"×"+it.height:"", sz(it.size)].filter(Boolean).join(" · "); g.fillText(fit(g,meta,cw-(+it.rating>0?58:0)),x,y+th+33);
    if(+it.rating>0){ g.fillStyle="#ffb454"; g.textAlign="right"; g.fillText("★".repeat(Math.min(5,+it.rating)),x+cw,y+th+33); g.textAlign="left"; } }
  var blob=await new Promise(function(res){ try{ c.toBlob(res,"image/png"); }catch(e){ res(null); } });
  if(!blob){ X.toast("The sheet was too large for this browser. Select fewer files."); return null; }
  var out={blob:blob,w:W,h:H,n:n};
  if(opt.download!==false){ var a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="library-contact-sheet-"+new Date().toISOString().slice(0,10)+".png"; document.body.appendChild(a); a.click(); setTimeout(function(){ try{ URL.revokeObjectURL(a.href); a.remove(); }catch(e){} },4000); X.toast("Contact sheet saved ("+n+" file"+(n===1?"":"s")+")"); }
  return out; };
X.add({id:"lw_sheet",group:"Export",label:"Export contact sheet (PNG)",run:function(){ X.contactSheet(); }});
try{ window.AMIYO_EDITOR_BUILD="libw-step05-sheet"; }catch(e){}
})();

;
/* ==================== Script 652 id="amiyo-libw-step06" ==================== */
/* Library Plus step 6: technical info. Lib+ > "Technical info…" reads the file header of an MP4 / MOV / M4V / M4A (only a few KB, never the whole
   file) and shows container, video codec and profile, frame rate, audio codec, channels, sample rate and creation date.
   Lib+ > "Frame-rate and codec check" does it for every video and lists which frame rates and codecs your Library mixes. Results are kept with each file. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!M||X.tech) return;
var CODEC={avc1:"H.264 (AVC)",avc3:"H.264 (AVC)",hvc1:"H.265 (HEVC)",hev1:"H.265 (HEVC)",av01:"AV1",vp09:"VP9",vp08:"VP8",mp4v:"MPEG-4 Visual",apch:"ProRes 422 HQ",apcn:"ProRes 422",apcs:"ProRes 422 LT",apco:"ProRes 422 Proxy",ap4h:"ProRes 4444",ap4x:"ProRes 4444 XQ",jpeg:"Motion JPEG",mjp2:"JPEG 2000",
  mp4a:"AAC","ac-3":"Dolby AC-3","ec-3":"Dolby E-AC-3",opus:"Opus",Opus:"Opus",fLaC:"FLAC",alac:"Apple Lossless",sowt:"PCM (16-bit)",twos:"PCM (16-bit)",lpcm:"PCM",ipcm:"PCM",".mp3":"MP3","samr":"AMR"};
var AVC={66:"Baseline",77:"Main",88:"Extended",100:"High",110:"High 10",122:"High 4:2:2",244:"High 4:4:4"}, HEVC={1:"Main",2:"Main 10",3:"Main Still"};
function s4(dv,p){ return String.fromCharCode(dv.getUint8(p),dv.getUint8(p+1),dv.getUint8(p+2),dv.getUint8(p+3)); }
function u64(dv,p){ return dv.getUint32(p)*4294967296+dv.getUint32(p+4); }
function boxes(dv,s,e,cb){ var p=s; while(p+8<=e){ var sz=dv.getUint32(p), t=s4(dv,p+4), h=8; if(sz===1){ if(p+16>e) break; sz=u64(dv,p+8); h=16; } else if(sz===0) sz=e-p; if(sz<h) break; var end=Math.min(e,p+sz); cb(t,p+h,end,p); p+=sz; } }
function stsd(dv,s,e,tr){ if(e-s<24) return; var sz=dv.getUint32(s+8), fc=s4(dv,s+12), b=s+16, end=Math.min(e,s+8+sz); tr.fourcc=fc;
  if(tr.kind==="vide"){ tr.vw=dv.getUint16(b+24); tr.vh=dv.getUint16(b+26);
    boxes(dv,b+78,end,function(t,bs){ if(t==="avcC"){ tr.profile=AVC[dv.getUint8(bs+1)]||("profile "+dv.getUint8(bs+1)); tr.level=dv.getUint8(bs+3)/10; } else if(t==="hvcC"){ tr.profile=HEVC[dv.getUint8(bs+1)&31]||null; tr.level=dv.getUint8(bs+12)/30; } }); }
  else if(tr.kind==="soun"){ tr.ch=dv.getUint16(b+16); tr.rate=dv.getUint16(b+24); } }
function stts(dv,s,e,tr){ var n=Math.min(dv.getUint32(s+4),Math.floor((e-s-8)/8)), cnt=0, tot=0; for(var i=0;i<n;i++){ var c=dv.getUint32(s+8+i*8), d=dv.getUint32(s+12+i*8); cnt+=c; tot+=c*d; } tr.samples=cnt; tr.sdur=tot; }
function trak(dv,s,e){ var tr={}; boxes(dv,s,e,function(t,bs,be){ if(t==="tkhd"){ tr.tw=dv.getUint32(be-8)/65536; tr.th=dv.getUint32(be-4)/65536; }
  else if(t==="mdia") boxes(dv,bs,be,function(t2,s2,e2){ if(t2==="mdhd"){ var v=dv.getUint8(s2); tr.ts=v===1?dv.getUint32(s2+20):dv.getUint32(s2+12); } else if(t2==="hdlr") tr.kind=s4(dv,s2+8);
    else if(t2==="minf") boxes(dv,s2,e2,function(t3,s3,e3){ if(t3==="stbl") boxes(dv,s3,e3,function(t4,s4_,e4){ try{ if(t4==="stsd") stsd(dv,s4_,e4,tr); else if(t4==="stts") stts(dv,s4_,e4,tr); }catch(x){} }); }); }); }); return tr; }
function moov(dv,s,e){ var info={tracks:[]}; boxes(dv,s,e,function(t,bs,be){ try{ if(t==="mvhd"){ var v=dv.getUint8(bs); info.created=v===1?u64(dv,bs+4):dv.getUint32(bs+4); } else if(t==="trak") info.tracks.push(trak(dv,bs,be)); }catch(x){} }); return info; }
function rd(b,o,n){ return b.slice(o,o+n).arrayBuffer(); }
function fmtFps(f){ return String(+f.toFixed(3)); }
function names(c){ return CODEC[c]||(c?String(c).trim():""); }
X.techRead=async function(blob,name){ var ext=String(name||"").split(".").pop().toLowerCase(), out={container:ext?ext.toUpperCase():(blob.type||"")}; 
  if(!/^(mp4|m4v|mov|m4a|3gp|3g2|f4v|qt)$/.test(ext)&&!/mp4|quicktime|3gpp/.test(blob.type||"")) return out;
  var head=new DataView(await rd(blob,0,Math.min(32,blob.size))); if(head.byteLength>=12&&s4(head,4)==="ftyp"){ var br=s4(head,8); out.container=br==="qt  "?"QuickTime MOV":/^(M4V|M4A)/i.test(br)?br.trim().toUpperCase():"MP4 ("+br.trim()+")"; }
  var off=0, guard=0, mv=null; while(off+16<=blob.size&&guard++<80){ var h=new DataView(await rd(blob,off,16)), sz=h.getUint32(0), t=s4(h,4), hl=8; if(sz===1){ sz=u64(h,8); hl=16; } else if(sz===0) sz=blob.size-off; if(sz<hl) break;
    if(t==="moov"){ if(sz>64*1048576) break; var buf=await rd(blob,off+hl,sz-hl); mv=moov(new DataView(buf),0,buf.byteLength); break; } off+=sz; }
  if(!mv) return out; if(mv.created>2082844800) out.created=(mv.created-2082844800)*1000;
  mv.tracks.forEach(function(tr){ if(tr.kind==="vide"&&!out.v){ out.v={fourcc:tr.fourcc,codec:names(tr.fourcc),profile:tr.profile||"",level:tr.level||0,w:tr.vw||Math.round(tr.tw)||0,h:tr.vh||Math.round(tr.th)||0}; if(tr.samples>1&&tr.sdur>0&&tr.ts>0) out.v.fps=+(tr.samples*tr.ts/tr.sdur).toFixed(3); }
    else if(tr.kind==="soun"&&!out.a){ out.a={fourcc:tr.fourcc,codec:names(tr.fourcc),ch:tr.ch||0,rate:tr.rate||0}; } });
  return out; };
X.tech=async function(it,force){ if(!it) return null; if(it.tech&&!force) return it.tech; var b=await M.getBlob(it); if(!b) return null; var t; try{ t=await X.techRead(b,it.name); }catch(e){ t={container:String(it.name||"").split(".").pop().toUpperCase()}; }
  t.at=Date.now(); it.tech=t; try{ M.persist(it); }catch(e){} return t; };
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function row(k,v){ return v?'<tr><td style="padding:4px 10px 4px 0;opacity:.65;white-space:nowrap">'+k+'</td><td style="padding:4px 0">'+esc(v)+"</td></tr>":""; }
X.techHTML=function(it,t){ if(!t) return "<p>This file is missing from the library.</p>"; var v=t.v, a=t.a;
  var rows=row("Container",t.container)+(v?row("Video",[v.codec||v.fourcc,v.profile,v.level?"level "+v.level:""].filter(Boolean).join(" · "))+row("Picture",(v.w&&v.h?v.w+"×"+v.h:"")+(v.fps?" · "+fmtFps(v.fps)+" fps":"")):"")
   +(a?row("Audio",[a.codec||a.fourcc,a.ch?(a.ch===1?"mono":a.ch===2?"stereo":a.ch+" channels"):"",a.rate?a.rate+" Hz":""].filter(Boolean).join(" · ")):"")+row("Recorded",t.created?new Date(t.created).toLocaleString():"");
  if(!v&&!a) rows+='<tr><td colspan="2" style="padding-top:8px;opacity:.65">Detailed codec info is only read from MP4 / MOV / M4V / M4A files.</td></tr>';
  return '<div style="font:13px/1.5 system-ui"><b>'+esc(it.name)+'</b><table style="margin-top:8px;border-collapse:collapse">'+rows+"</table></div>"; };
X.techDialog=async function(id){ var it=X.item(id); if(!it){ X.toast("Click a file first"); return; } if(it.type==="image"){ X.toast("Pick a video or audio file"); return; }
  var t=await X.tech(it); openModal("Technical info",X.techHTML(it,t)); };
X.techReport=async function(){ var list=M.items().filter(function(i){ return i.type==="video"&&!(M.state.missing&&M.state.missing.has(i.id)); }); if(!list.length){ X.toast("No video files in the Library"); return null; }
  var n=0; for(var i=0;i<list.length;i++){ if(!list[i].tech){ await X.tech(list[i]); if(++n%5===0) X.toast("Reading "+(i+1)+" of "+list.length+"…",1500); } }
  var fps={}, cod={}, unk=0; list.forEach(function(it){ var v=it.tech&&it.tech.v; if(!v){ unk++; return; } var k=v.fps?fmtFps(v.fps)+" fps":"unknown fps"; (fps[k]=fps[k]||[]).push(it.name); var c=v.codec||v.fourcc||"unknown"; (cod[c]=cod[c]||[]).push(it.name); });
  function grp(o){ return Object.keys(o).sort(function(a,b){ return o[b].length-o[a].length; }).map(function(k){ return "<li><b>"+esc(k)+"</b> · "+o[k].length+" file"+(o[k].length===1?"":"s")+'<div style="opacity:.6;font-size:11.5px">'+o[k].slice(0,3).map(esc).join(", ")+(o[k].length>3?" …":"")+"</div></li>"; }).join(""); }
  var mixed=Object.keys(fps).filter(function(k){ return k!=="unknown fps"; }).length>1;
  openModal("Frame-rate and codec check",'<div style="font:13px/1.5 system-ui;max-height:60vh;overflow:auto"><p>'+(mixed?"⚠ Your videos use different frame rates.":"✓ All readable videos share one frame rate.")+"</p><b>Frame rates</b><ul style='padding-left:18px'>"+grp(fps)+"</ul><b>Video codecs</b><ul style='padding-left:18px'>"+grp(cod)+"</ul>"+(unk?'<p style="opacity:.65">'+unk+" file"+(unk===1?"":"s")+" could not be read (not MP4/MOV or no header).</p>":"")+"</div>"); try{ M.render(); }catch(e){} return {fps:fps,codecs:cod,mixed:mixed}; };
X.add({id:"lw_tech",group:"Info",label:"Technical info…",run:function(){ var s=X.sel(); if(!s.length){ X.toast("Click a file first"); return; } X.techDialog(s[0].id); }});
X.add({id:"lw_techrep",group:"Info",label:"Frame-rate and codec check",run:function(){ X.techReport(); }});
try{ window.AMIYO_EDITOR_BUILD="libw-step06-tech"; }catch(e){}
})();

;
/* ==================== Script 653 id="amiyo-libw-step07" ==================== */
/* Library Plus step 7: compare two files. Select two files (videos or pictures) and choose Lib+ > "Compare two selected files…".
   They play side by side with one play button and one slider, so you can check two takes, two exports or two versions of the same shot.
   Sound comes from one side at a time (switch with the speaker button). */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!M||X.compare) return;
var urls=[], timer=0, drift=0;
function free(){ urls.forEach(function(u){ try{ URL.revokeObjectURL(u); }catch(e){} }); urls=[]; }
function isOpen(){ var m=document.getElementById("modalBackdrop"); return !!(m&&m.style.display&&m.style.display!=="none"); }
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function tm(t){ t=Math.max(0,t||0); var m=Math.floor(t/60), s=t-m*60; return m+":"+(s<10?"0":"")+s.toFixed(1); }
function sz(b){ b=+b||0; return b>=1073741824?(b/1073741824).toFixed(1)+" GB":b>=1048576?Math.round(b/1048576)+" MB":Math.max(1,Math.round(b/1024))+" KB"; }
function stop(){ clearInterval(timer); clearInterval(drift); var l=document.querySelectorAll("#lwCmp video"); for(var i=0;i<l.length;i++){ try{ l[i].pause(); l[i].removeAttribute("src"); l[i].load(); }catch(e){} } free(); }
X.compare=async function(a,b){ var A=X.item(a), B=X.item(b); if(!A||!B||A.id===B.id){ X.toast("Select two different files first"); return null; }
  if(A.type==="audio"||B.type==="audio"){ X.toast("Compare works with videos and pictures"); return null; }
  stop(); var ba=await M.getBlob(A), bb=await M.getBlob(B); if(!ba||!bb){ X.toast("One of the files is missing from the library"); return null; }
  var ua=URL.createObjectURL(ba), ub=URL.createObjectURL(bb); urls=[ua,ub];
  function cell(it,u,id){ var m=it.type==="image"?'<img id="'+id+'" src="'+u+'" alt="" style="width:100%;height:150px;object-fit:contain;background:#000;border-radius:8px">':'<video id="'+id+'" src="'+u+'" playsinline preload="auto" style="width:100%;height:150px;object-fit:contain;background:#000;border-radius:8px"></video>';
    return '<div style="min-width:0">'+m+'<div style="font:600 12px system-ui;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(it.name)+'</div><div style="font:11px system-ui;opacity:.65">'+esc([it.width&&it.height?it.width+"×"+it.height:"",sz(it.size),it.type!=="image"&&it.duration?tm(it.duration):""].filter(Boolean).join(" · "))+"</div></div>"; }
  openModal("Compare",'<div id="lwCmp" style="font:13px system-ui"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px">'+cell(A,ua,"lwCa")+cell(B,ub,"lwCb")+'</div>'+
    '<input type="range" id="lwCs" min="0" max="1000" value="0" aria-label="Position" style="width:100%;height:36px;margin-top:8px"><div id="lwCt" style="text-align:center;opacity:.75;margin-bottom:6px">0:00.0</div>'+
    '<div class="mdetail-actions" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center"><button type="button" class="chip pri" id="lwCp">▶ Play both</button><button type="button" class="chip" id="lwCau">🔊 Sound: left</button><button type="button" class="chip" id="lwCw">⇄ Swap sides</button></div></div>');
  var va=document.getElementById("lwCa"), vb=document.getElementById("lwCb"), s=document.getElementById("lwCs"), t=document.getElementById("lwCt"), p=document.getElementById("lwCp"), au=document.getElementById("lwCau"), left=true;
  var vids=[va,vb].filter(function(e){ return e&&e.tagName==="VIDEO"; });
  function dur(){ var ds=vids.map(function(v){ return isFinite(v.duration)?v.duration:0; }).filter(Boolean); return ds.length?Math.min.apply(null,ds):0; }
  function sound(){ if(va.tagName==="VIDEO") va.muted=!left; if(vb.tagName==="VIDEO") vb.muted=left; au.textContent="🔊 Sound: "+(left?"left":"right"); }
  function seek(sec){ vids.forEach(function(v){ try{ v.currentTime=sec; }catch(e){} }); }
  function playing(){ return vids.some(function(v){ return !v.paused; }); }
  sound();
  p.onclick=function(){ if(!vids.length) return; if(playing()){ vids.forEach(function(v){ v.pause(); }); p.textContent="▶ Play both"; } else { var d=dur(); if(d&&vids[0].currentTime>=d-0.1) seek(0); vids.forEach(function(v){ var r=v.play(); if(r&&r.catch) r.catch(function(){}); }); p.textContent="❚❚ Pause both"; } };
  s.oninput=function(){ var d=dur(); if(d) seek(s.value/1000*d); };
  au.onclick=function(){ left=!left; sound(); };
  document.getElementById("lwCw").onclick=function(){ X.compare(B.id,A.id); };
  timer=setInterval(function(){ if(!isOpen()||!document.getElementById("lwCmp")){ stop(); return; } var d=dur(); if(!d||!vids.length) return; var c=vids[0].currentTime; if(document.activeElement!==s) s.value=Math.round(Math.min(1,c/d)*1000); t.textContent=tm(c)+" / "+tm(d); if(c>=d-0.05&&playing()){ vids.forEach(function(v){ v.pause(); }); p.textContent="▶ Play both"; } },250);
  drift=setInterval(function(){ if(vids.length===2&&playing()){ var d=Math.abs(vids[1].currentTime-vids[0].currentTime); if(d>0.2){ try{ vids[1].currentTime=vids[0].currentTime; }catch(e){} } } },500);
  return {a:A.id,b:B.id}; };
X.add({id:"lw_compare",group:"View",label:"Compare two selected files…",run:function(){ var s=X.sel(); if(s.length!==2){ X.toast("Select exactly two files first"); return; } X.compare(s[0].id,s[1].id); }});
try{ window.AMIYO_EDITOR_BUILD="libw-step07-compare"; }catch(e){}
})();

;
/* ==================== Script 654 id="amiyo-libw-step08" ==================== */
/* Library Plus step 8: quick strip. A row of small pictures at the top of the Library with your pinned files first and then the files
   you imported or used most recently. Tap one to add it to the timeline. Pin with Lib+ > "Pin selected to quick strip".
   Hide or show the strip with Lib+ > "Show or hide quick strip". */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!M||X.strip) return;
var KEY="amiyo_lw_strip", MAXN=12, raf=0;
function on(){ try{ return localStorage.getItem(KEY)!=="0"; }catch(e){ return true; } }
function setOn(v){ try{ localStorage.setItem(KEY,v?"1":"0"); }catch(e){} }
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
var st=document.createElement("style"); st.textContent="#lwStrip{margin:6px 0 8px}#lwStrip .lwh{display:flex;align-items:center;font:700 10px system-ui;letter-spacing:.08em;text-transform:uppercase;color:#847a6b;margin-bottom:4px}#lwStrip .lwh button{margin-left:auto;background:none;border:0;color:#847a6b;font-size:14px;padding:2px 6px;cursor:pointer}#lwStrip .lwr{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;scrollbar-width:thin}#lwStrip .lwi{flex:none;width:76px;background:none;border:1px solid #3a3226;border-radius:8px;padding:0;color:#e6dfd0;cursor:pointer;overflow:hidden;text-align:left}#lwStrip .lwi:focus-visible{outline:2px solid #ff7a3d}#lwStrip .lwt{height:44px;background:#1f1b16 center/cover no-repeat;display:grid;place-items:center;font-size:18px;opacity:1;position:relative}#lwStrip .lwt i{position:absolute;top:2px;left:3px;font-size:10px;font-style:normal}#lwStrip .lwn{font:10.5px/1.2 system-ui;padding:3px 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"; document.head.appendChild(st);
X.stripItems=function(){ var miss=M.state.missing||new Set(), all=M.items().filter(function(i){ return !miss.has(i.id); });
  var pins=all.filter(function(i){ return i.pin; }).sort(function(a,b){ return b.pin-a.pin; });
  var rec=all.filter(function(i){ return !i.pin; }).sort(function(a,b){ return (b.lastUsed||b.addedAt||0)-(a.lastUsed||a.addedAt||0); });
  return pins.concat(rec).slice(0,MAXN); };
function html(){ var l=X.stripItems(); if(!l.length) return "";
  return '<div id="lwStrip" role="region" aria-label="Pinned and recent files"><div class="lwh"><span>📌 Pinned &amp; recent</span><button type="button" id="lwHide" aria-label="Hide quick strip" title="Hide">✕</button></div><div class="lwr">'+
    l.map(function(it){ var ic=it.type==="audio"?"🎵":it.type==="image"?"🖼":"🎞"; return '<button type="button" class="lwi" data-lwq="'+esc(it.id)+'" title="Add '+esc(it.name)+' to the timeline" aria-label="Add '+esc(it.name)+' to the timeline"><div class="lwt"'+(it.thumb?' style="background-image:url('+it.thumb+')"':"")+">"+(it.thumb?"":ic)+(it.pin?"<i>📌</i>":"")+'</div><div class="lwn">'+esc(it.name)+"</div></button>"; }).join("")+"</div></div>"; }
function ensure(){ raf=0; var b=document.getElementById("mlibBody"); if(!b||!M.state.loaded) return; var cur=document.getElementById("lwStrip");
  var want=on()&&!String(M.state.q||"").trim()&&!M.state.selecting&&M.items().length>=2;
  if(!want){ if(cur) cur.remove(); return; } if(cur) return; var h=html(); if(!h) return;
  var anchor=b.querySelector(".mbins"); var tmp=document.createElement("div"); tmp.innerHTML=h; var el=tmp.firstElementChild;
  if(anchor&&anchor.parentNode) anchor.parentNode.insertBefore(el,anchor.nextSibling); else b.insertBefore(el,b.firstChild); }
function later(){ if(!raf) raf=requestAnimationFrame(ensure); }
new MutationObserver(function(){ if(document.getElementById("mlibBody")) later(); }).observe(document.body,{childList:true,subtree:true}); later();
document.addEventListener("click",function(e){ var t=e.target&&e.target.closest?e.target.closest("#lwStrip"):null; if(!t) return;
  if(e.target.closest("#lwHide")){ e.stopPropagation(); setOn(false); t.remove(); X.toast("Quick strip hidden. Lib+ brings it back."); return; }
  var b=e.target.closest("[data-lwq]"); if(!b) return; e.stopPropagation(); e.preventDefault(); try{ M.use([b.dataset.lwq]); X.toast("Added to timeline"); }catch(err){ X.toast("Could not add it"); } },true);
X.pin=function(list,v){ var n=0, t=Date.now(); list.forEach(function(i,k){ if(v){ if(!i.pin){ i.pin=t+k; n++; } } else if(i.pin){ delete i.pin; n++; } }); if(n) X.save(list); var s=document.getElementById("lwStrip"); if(s) s.remove(); later(); return n; };
X.strip=function(v){ setOn(v!==false); var s=document.getElementById("lwStrip"); if(s) s.remove(); later(); };
X.add({id:"lw_pin",group:"Organize",label:"Pin selected to quick strip",run:function(){ var s=X.sel(); if(!s.length){ X.toast("Select files first"); return; } var n=X.pin(s,true); X.toast(n?n+" pinned":"Already pinned"); }});
X.add({id:"lw_unpin",group:"Organize",label:"Unpin selected",run:function(){ var s=X.sel(); if(!s.length){ X.toast("Select files first"); return; } var n=X.pin(s,false); X.toast(n?n+" unpinned":"None were pinned"); }});
X.add({id:"lw_stripvis",group:"View",label:"Show or hide quick strip",run:function(){ var v=!on(); X.strip(v); X.toast(v?"Quick strip shown":"Quick strip hidden"); }});
try{ window.AMIYO_EDITOR_BUILD="libw-step08-strip"; }catch(e){}
})();

;
/* ==================== Script 655 id="amiyo-libw-step09" ==================== */
/* Library Plus step 9: relink from a folder. Lib+ > "Relink from a folder…" lets you pick the folder that holds your originals (sub-folders are searched too).
   Every missing Library file is matched by name and size. You see a list first: exact matches are ticked, looser matches (same name but a different
   size, or the same name with another extension) are left unticked so you decide. Ratings, tags, bins and notes stay as they were. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.missing||X.relinkFolder) return;
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function base(n){ return String(n||"").toLowerCase().replace(/\.[^.]+$/,""); }
function sz(b){ b=+b||0; return b>=1073741824?(b/1073741824).toFixed(1)+" GB":b>=1048576?Math.round(b/1048576)+" MB":Math.max(1,Math.round(b/1024))+" KB"; }
X.relinkScan=function(files){ files=Array.prototype.slice.call(files||[]).filter(function(f){ return f&&f.name&&f.name.charAt(0)!=="."; });
  var byName={}, byBase={}; files.forEach(function(f){ var k=f.name.toLowerCase(); (byName[k]=byName[k]||[]).push(f); var b=base(f.name); (byBase[b]=byBase[b]||[]).push(f); });
  var used=new Set(), rows=[], lost=[];
  X.missing().forEach(function(it){ var n=String(it.name||"").toLowerCase(), c=(byName[n]||[]).filter(function(f){ return !used.has(f); }), f, kind;
    if(c.length){ f=c.find(function(x){ return +x.size===+it.size; }); if(f) kind="exact"; else { f=c[0]; kind="size"; } }
    else { var d=(byBase[base(it.name)]||[]).filter(function(x){ return !used.has(x); }); if(d.length){ f=d.find(function(x){ return +x.size===+it.size; })||d[0]; kind="ext"; } }
    if(f){ used.add(f); rows.push({it:it,file:f,kind:kind}); } else lost.push(it); });
  return {rows:rows,lost:lost}; };
X.relinkApply=async function(rows){ var done=[]; for(var i=0;i<rows.length;i++){ var r=rows[i]; try{ if(window.amiyoPutBlob) await window.amiyoPutBlob(r.it.blobKey,r.file); M.state.missing.delete(r.it.id); if(r.kind!=="exact") r.it.size=r.file.size; done.push(r.it); }catch(e){ try{ window.__swl&&window.__swl(e); }catch(_){} } }
  if(done.length) X.save(done); return done.length; };
X.relinkFolderFiles=function(files){ var miss=X.missing(); if(!miss.length){ X.toast("No missing files - everything is linked"); return null; }
  var sc=X.relinkScan(files); if(!sc.rows.length){ X.toast("None of the "+miss.length+" missing files were found there"); return sc; }
  var label={exact:"exact match",size:"different size",ext:"different format"};
  var h='<div style="font:13px/1.5 system-ui"><p style="margin:0 0 6px"><b>'+sc.rows.length+" of "+miss.length+"</b> missing file"+(miss.length===1?"":"s")+" found"+(sc.lost.length?" · "+sc.lost.length+" not found":"")+'.</p><div style="max-height:44vh;overflow:auto">'+
    sc.rows.map(function(r,i){ return '<label style="display:flex;gap:8px;align-items:flex-start;padding:5px 0;border-bottom:1px solid #2c261d"><input type="checkbox" data-lwr="'+i+'"'+(r.kind==="exact"?" checked":"")+' style="margin-top:3px"><span style="min-width:0"><span style="display:block;overflow:hidden;text-overflow:ellipsis">'+esc(r.it.name)+(r.file.name!==r.it.name?" → "+esc(r.file.name):"")+'</span><small style="opacity:.65">'+label[r.kind]+" · "+sz(r.file.size)+(r.kind==="size"?" (was "+sz(r.it.size)+")":"")+"</small></span></label>"; }).join("")+"</div>"+
    (sc.lost.length?'<p style="font-size:11.5px;opacity:.65;margin:8px 0 0">Not found: '+sc.lost.slice(0,4).map(function(i){ return esc(i.name); }).join(", ")+(sc.lost.length>4?" …":"")+"</p>":"")+
    '<div class="mdetail-actions" style="margin-top:10px"><button type="button" class="chip pri" id="lwRlGo">Relink ticked files</button></div></div>';
  openModal("Relink from folder",h);
  document.getElementById("lwRlGo").onclick=async function(){ var pick=[]; document.querySelectorAll("#modalBackdrop [data-lwr]").forEach(function(c){ if(c.checked) pick.push(sc.rows[+c.dataset.lwr]); }); if(!pick.length){ X.toast("Tick at least one file"); return; }
    closeModal(); var n=await X.relinkApply(pick); X.toast("Relinked "+n+" file"+(n===1?"":"s")); };
  return sc; };
X.relinkFolder=function(){ var miss=X.missing(); if(!miss.length){ X.toast("No missing files - everything is linked"); return; }
  var inp=document.createElement("input"); inp.type="file"; inp.multiple=true; try{ inp.webkitdirectory=true; }catch(e){} inp.style.display="none"; document.body.appendChild(inp);
  inp.onchange=function(){ var f=Array.prototype.slice.call(inp.files||[]); inp.remove(); if(f.length) X.relinkFolderFiles(f); }; inp.addEventListener("cancel",function(){ inp.remove(); }); inp.click(); };
X.add({id:"lw_relinkfolder",group:"Repair",label:"Relink from a folder…",run:function(){ X.relinkFolder(); }});
try{ window.AMIYO_EDITOR_BUILD="libw-step09-relinkfolder"; }catch(e){}
})();

;
/* ==================== Script 656 id="amiyo-libw-step10" ==================== */
/* Library Plus step 10: long audio and long video. 
   (1) Long audio waveforms: WAV files of ANY size are read in small pieces (no decoding, almost no memory). Other formats (MP3, M4A, OGG...) are decoded at a
       low sample rate, so recordings of an hour or more still get a waveform. Anything too big shows a "Long audio" picture with its length instead of a bare icon.
   (2) Lib+ > "Split long file into parts…" cuts a long video or recording into equal parts (5, 10, 15, 30 or 60 minutes) as sub-clips in the Library.
       Sub-clips share the original file, so they use no extra storage and open fast in the editor. */
(function(){"use strict";
var M=window.amiyoMediaLib, W=window.AMIYO_LIBW, X=window.AMIYO_LIBX; if(!M||!W||W.long) return;
var DEC_MAX=400*1048576, EST_MAX=400*1048576, busy=false, timer=0, N=96;
function tm(t){ t=Math.round(+t||0); var h=Math.floor(t/3600), m=Math.floor(t%3600/60), s=t%60; return (h?h+":"+(m<10?"0":""):"")+m+":"+(s<10?"0":"")+s; }
function rd(b,o,n){ return b.slice(o,Math.min(b.size,o+n)).arrayBuffer(); }
function s4(dv,p){ return String.fromCharCode(dv.getUint8(p),dv.getUint8(p+1),dv.getUint8(p+2),dv.getUint8(p+3)); }
async function wavPeaks(blob){ if(blob.size<48) return null; var h=new DataView(await rd(blob,0,Math.min(blob.size,65536))); if(s4(h,0)!=="RIFF"&&s4(h,0)!=="RF64") return null; if(s4(h,8)!=="WAVE") return null;
  var p=12, fmt=null, dOff=0, dLen=0; while(p+8<=h.byteLength){ var id=s4(h,p), sz=h.getUint32(p+4,true); if(id==="fmt "){ fmt={tag:h.getUint16(p+8,true),ch:h.getUint16(p+10,true),rate:h.getUint32(p+12,true),bits:h.getUint16(p+22,true)}; if(fmt.tag===65534&&sz>=26) fmt.tag=h.getUint16(p+32,true); } else if(id==="data"){ dOff=p+8; dLen=sz; break; } p+=8+sz+(sz&1); }
  if(!fmt||!dOff||!fmt.ch) return null; var bps=fmt.bits/8; if(!(bps===1||bps===2||bps===3||bps===4)||(fmt.tag!==1&&fmt.tag!==3)) return null; if(fmt.tag===3&&bps!==4) return null;
  if(!dLen||dLen>blob.size-dOff) dLen=blob.size-dOff; var frame=bps*fmt.ch, frames=Math.floor(dLen/frame); if(frames<1) return null;
  var per=frames/N, out=new Array(N).fill(0), CH=4*1048576-(4*1048576%frame), pos=0;
  while(pos<frames){ var n=Math.min(Math.floor(CH/frame),frames-pos), dv=new DataView(await rd(blob,dOff+pos*frame,n*frame)), skip=Math.max(1,Math.floor(n/60000));
    for(var i=0;i<n;i+=skip){ var b=Math.min(N-1,Math.floor((pos+i)/per)), o=i*frame, v;
      for(var c=0;c<fmt.ch;c++){ var q=o+c*bps; v=bps===1?(dv.getUint8(q)-128)/128:bps===2?dv.getInt16(q,true)/32768:bps===3?((dv.getUint8(q)|(dv.getUint8(q+1)<<8)|(dv.getInt8(q+2)<<16))/8388608):(fmt.tag===3?dv.getFloat32(q,true):dv.getInt32(q,true)/2147483648); v=Math.abs(v); if(v>out[b]) out[b]=v; } }
    pos+=n; }
  var top=0; out.forEach(function(x){ if(x>top) top=x; }); if(top>0) out=out.map(function(x){ return x/top; }); return {peaks:out,dur:frames/fmt.rate}; }
async function lowDecode(blob){ var OAC=window.OfflineAudioContext||window.webkitOfflineAudioContext; if(!OAC) throw new Error("no audio"); var ab=await blob.arrayBuffer(), ctx=new OAC(1,1,8000);
  var buf=await new Promise(function(res,rej){ var p=ctx.decodeAudioData(ab,res,rej); if(p&&p.then) p.then(res,rej); }); ab=null; return {peaks:W.peaks(buf,N),dur:buf.duration}; }
function placeholder(dur,why){ var w=240,h=135,c=document.createElement("canvas"); c.width=w; c.height=h; var g=c.getContext("2d"), bg=g.createLinearGradient(0,0,w,h); bg.addColorStop(0,"#1f1b16"); bg.addColorStop(1,"#141210"); g.fillStyle=bg; g.fillRect(0,0,w,h);
  g.strokeStyle="rgba(255,122,61,.55)"; g.setLineDash([6,5]); g.lineWidth=2; g.beginPath(); g.moveTo(14,h/2); g.lineTo(w-14,h/2); g.stroke(); g.setLineDash([]);
  g.fillStyle="#ff7a3d"; g.font="700 15px system-ui,sans-serif"; g.textAlign="center"; g.fillText("Long audio",w/2,h/2-16); g.fillStyle="#e6dfd0"; g.font="600 20px ui-monospace,monospace"; g.fillText(dur?tm(dur):"",w/2,h/2+34); g.fillStyle="#847a6b"; g.font="11px system-ui,sans-serif"; g.fillText(why||"",w/2,h-12); return c.toDataURL("image/jpeg",0.8); }
function est(it,b){ var d=+it.duration||0; return d?d*8000*2*4:0; }
async function one(it){ var b=await M.getBlob(it); if(!b) throw new Error("missing"); var r=null;
  try{ r=await wavPeaks(b); }catch(e){ r=null; }
  if(!r){ if(b.size<=DEC_MAX&&est(it,b)<=EST_MAX){ try{ r=await lowDecode(b); }catch(e){ r=null; } } }
  if(r){ it.thumb=W.draw(r.peaks); it.wf=1; } else { it.thumb=placeholder(+it.duration,b.size>DEC_MAX?"too big to draw":"waveform not available"); it.wf=2; }
  it.wfLong=1; await M.persist(it); }
function need(it){ return it&&it.type==="audio"&&!it.thumb&&it.wfTried&&!it.wfLong&&!(M.state.missing&&M.state.missing.has(it.id)); }
function run(){ if(busy||window.__amiyoLite) return; var list=M.items().filter(need); if(!list.length) return; busy=true; var made=0;
  (function next(){ var it=list.shift(); if(!it||window.__amiyoLite){ busy=false; if(made){ try{ M.render(); }catch(e){} } return; }
    one(it).then(function(){ made++; },function(){ it.wfLong=1; try{ M.persist(it); }catch(e){} }).then(function(){ setTimeout(next,80); }); })(); }
W.long=run; W.wavPeaks=wavPeaks; W.lowDecode=lowDecode; W.placeholder=placeholder;
function later(){ clearTimeout(timer); timer=setTimeout(run,2200); }
new MutationObserver(function(){ if(document.getElementById("mlibBody")) later(); }).observe(document.body,{childList:true,subtree:true}); later();
if(X&&X.add){
  X.splitParts=async function(id,mins){ var it=X.item(id); if(!it||it.type==="image"){ X.toast("Select a video or audio file"); return 0; }
    var full=+(it.srcDur||it.duration)||0, step=mins*60; if(full<step*1.2){ X.toast("This file is shorter than "+mins+" minutes ×1.2"); return 0; }
    var parts=Math.ceil(full/step), made=[], tag=Date.now().toString(36), base=String(it.name).replace(/ \[[^\]]*\]$/,"");
    for(var k=0;k<parts;k++){ var a=k*step, b=Math.min(full,(k+1)*step); if(b-a<0.5) continue;
      var n={id:"lib_"+tag+k+Math.random().toString(36).slice(2,5),fp:(it.fp||it.id)+"#part"+tag+k,blobKey:it.blobKey,name:base+" · part "+(k+1)+"/"+parts+" ["+tm(a)+"–"+tm(b)+"]",type:it.type,mime:it.mime||"",size:it.size||0,width:it.width||0,height:it.height||0,duration:b-a,srcDur:full,markIn:a,markOut:b,isSubclip:true,subOf:it.id,addedAt:Date.now()+k,lastUsed:0,imports:1,uses:0,thumb:it.thumb||null};
      if(it.bin) n.bin=it.bin; if(it.label) n.label=it.label; if(Array.isArray(it.tags)&&it.tags.length) n.tags=it.tags.slice(); M.items().push(n); made.push(n); }
    for(var j=0;j<made.length;j++) await M.persist(made[j]); try{ M.render(); }catch(e){} X.toast(made.length+" parts saved to your Library"); return made.length; };
  X.add({id:"lw_split",group:"Organize",label:"Split long file into parts…",run:function(){ var s=X.sel().filter(function(i){ return i.type!=="image"; }); if(!s.length){ X.toast("Click a video or audio file first"); return; } var it=s[0], full=+(it.srcDur||it.duration)||0;
    openModal("Split into parts",'<div style="font:13px/1.5 system-ui"><p style="margin:0 0 8px"><b>'+String(it.name).replace(/[<&]/g,"")+"</b><br>"+tm(full)+' long. Parts are sub-clips of the same file: no copying, no extra storage.</p><div class="mdetail-actions" style="display:flex;flex-wrap:wrap;gap:6px">'+[5,10,15,30,60].map(function(m){ return '<button type="button" class="chip'+(full>=m*72?"":"")+'" data-lwsp="'+m+'"'+(full<m*72?" disabled":"")+'>'+m+" min"+(full>=m*72?" · "+Math.ceil(full/(m*60))+" parts":"")+"</button>"; }).join("")+"</div></div>");
    document.querySelectorAll("#modalBackdrop [data-lwsp]").forEach(function(b){ b.onclick=function(){ closeModal(); X.splitParts(it.id,+b.dataset.lwsp); }; }); }});
}
try{ window.AMIYO_EDITOR_BUILD="libw-step10-long"; }catch(e){}
})();

;
/* ==================== Script 657 id="amiyo-libw-step11" ==================== */
/* Library Plus step 11: built-in sound effects. Lib+ > "Add sound effects…" opens a list of 24 effects made inside the editor (no downloads, no copyright):
   click, pop, ding, notification, whoosh, swoosh, riser, boom, hit, beep, error buzz, rain, wind, heartbeat, camera shutter and laser.
   Tap ▶ to hear one, tick the ones you want and press Add. They land in a "Sound effects" bin, tagged "sfx", ready to drop on the timeline. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!M||X.sfx) return;
var SR=44100;
function noise(c,dur){ var b=c.createBuffer(1,Math.ceil(SR*dur),SR), d=b.getChannelData(0); for(var i=0;i<d.length;i++) d[i]=Math.random()*2-1; var s=c.createBufferSource(); s.buffer=b; return s; }
function env(c,pts,peak){ var g=c.createGain(); g.gain.setValueAtTime(0.0001,0); pts.forEach(function(p){ if(p[2]==="lin") g.gain.linearRampToValueAtTime(Math.max(0.0001,p[1]*peak),p[0]); else g.gain.exponentialRampToValueAtTime(Math.max(0.0001,p[1]*peak),p[0]); }); return g; }
function osc(c,type,f0,f1,dur){ var o=c.createOscillator(); o.type=type; o.frequency.setValueAtTime(f0,0); if(f1&&f1!==f0) o.frequency.exponentialRampToValueAtTime(f1,dur); return o; }
function filt(c,type,f,q){ var x=c.createBiquadFilter(); x.type=type; x.frequency.value=f; if(q) x.Q.value=q; return x; }
function chain(){ for(var i=0;i<arguments.length-1;i++) arguments[i].connect(arguments[i+1]); }
function tone(c,type,f0,f1,t0,dur,peak,out){ var o=osc(c,type,f0,f1,dur+t0), g=env(c,[[t0,0.0001,"exp"],[t0+0.01,1,"exp"],[t0+dur,0.0001,"exp"]],peak); o.frequency.setValueAtTime(f0,t0); if(f1&&f1!==f0) o.frequency.exponentialRampToValueAtTime(f1,t0+dur); chain(o,g,out); o.start(t0); o.stop(t0+dur+0.05); }
var LIST=[
 {id:"click",name:"Click",dur:0.1,fn:function(c,o){ var n=noise(c,0.1), h=filt(c,"highpass",2500), g=env(c,[[0.002,1,"exp"],[0.06,0.0001,"exp"]],0.9); chain(n,h,g,o); n.start(0); }},
 {id:"pop",name:"Pop",dur:0.2,fn:function(c,o){ tone(c,"sine",700,110,0,0.18,0.9,o); }},
 {id:"ding",name:"Ding",dur:1.4,fn:function(c,o){ tone(c,"sine",1046,1046,0,1.3,0.6,o); tone(c,"sine",2093,2093,0,0.7,0.25,o); tone(c,"sine",3136,3136,0,0.4,0.1,o); }},
 {id:"notify",name:"Notification",dur:0.8,fn:function(c,o){ tone(c,"sine",880,880,0,0.35,0.6,o); tone(c,"sine",1320,1320,0.18,0.55,0.6,o); }},
 {id:"whoosh",name:"Whoosh",dur:1.2,fn:function(c,o){ var n=noise(c,1.2), f=filt(c,"bandpass",300,1.2), g=env(c,[[0.5,1,"lin"],[1.15,0.0001,"exp"]],0.9); f.frequency.setValueAtTime(300,0); f.frequency.exponentialRampToValueAtTime(3200,0.55); f.frequency.exponentialRampToValueAtTime(500,1.2); chain(n,f,g,o); n.start(0); }},
 {id:"swoosh",name:"Swoosh",dur:0.7,fn:function(c,o){ var n=noise(c,0.7), f=filt(c,"bandpass",2800,1.5), g=env(c,[[0.08,1,"lin"],[0.65,0.0001,"exp"]],0.9); f.frequency.setValueAtTime(2800,0); f.frequency.exponentialRampToValueAtTime(400,0.65); chain(n,f,g,o); n.start(0); }},
 {id:"riser",name:"Riser",dur:3.2,fn:function(c,o){ var n=noise(c,3.2), f=filt(c,"lowpass",200,2), g=env(c,[[3,1,"lin"],[3.15,0.0001,"exp"]],0.8), a=osc(c,"sawtooth",110,880,3), ag=env(c,[[3,0.5,"lin"],[3.15,0.0001,"exp"]],0.4); f.frequency.setValueAtTime(200,0); f.frequency.exponentialRampToValueAtTime(5000,3); chain(n,f,g,o); chain(a,ag,o); n.start(0); a.start(0); a.stop(3.2); }},
 {id:"boom",name:"Boom",dur:2,fn:function(c,o){ tone(c,"sine",95,32,0,1.8,1,o); var n=noise(c,1.2), f=filt(c,"lowpass",400), g=env(c,[[0.01,1,"exp"],[1.1,0.0001,"exp"]],0.7); chain(n,f,g,o); n.start(0); }},
 {id:"hit",name:"Hit",dur:0.45,fn:function(c,o){ var n=noise(c,0.4), f=filt(c,"bandpass",900,0.9), g=env(c,[[0.004,1,"exp"],[0.35,0.0001,"exp"]],0.95); chain(n,f,g,o); n.start(0); tone(c,"sine",180,60,0,0.25,0.7,o); }},
 {id:"beep",name:"Beep",dur:0.35,fn:function(c,o){ var s=osc(c,"square",1000,1000,0.3), g=env(c,[[0.01,1,"lin"],[0.26,1,"lin"],[0.3,0.0001,"lin"]],0.35); chain(s,g,o); s.start(0); s.stop(0.32); }},
 {id:"error",name:"Error buzz",dur:0.5,fn:function(c,o){ var s=osc(c,"sawtooth",120,120,0.45), g=env(c,[[0.02,1,"lin"],[0.4,1,"lin"],[0.46,0.0001,"lin"]],0.5), l=osc(c,"square",30,30,0.45), lg=c.createGain(); lg.gain.value=0.5; var m=c.createGain(); m.gain.value=0.5; chain(l,lg,m.gain); chain(s,m,g,o); s.start(0); l.start(0); s.stop(0.48); l.stop(0.48); }},
 {id:"rain",name:"Rain",dur:6,fn:function(c,o){ var n=noise(c,6), f=filt(c,"bandpass",5000,0.6), h=filt(c,"highpass",1500), g=env(c,[[0.4,1,"lin"],[5.5,1,"lin"],[5.99,0.0001,"lin"]],0.55), l=osc(c,"sine",7,7,6), lg=c.createGain(); lg.gain.value=0.12; var m=c.createGain(); m.gain.value=0.88; chain(l,lg,m.gain); chain(n,f,h,m,g,o); n.start(0); l.start(0); l.stop(6); }},
 {id:"wind",name:"Wind",dur:5,fn:function(c,o){ var n=noise(c,5), f=filt(c,"lowpass",500,1.5), g=env(c,[[0.5,1,"lin"],[4.5,1,"lin"],[4.99,0.0001,"lin"]],0.7), l=osc(c,"sine",0.5,0.5,5), lg=c.createGain(); lg.gain.value=0.45; var m=c.createGain(); m.gain.value=0.55; chain(l,lg,m.gain); chain(n,f,m,g,o); n.start(0); l.start(0); l.stop(5); }},
 {id:"heart",name:"Heartbeat",dur:2.4,fn:function(c,o){ [0,0.3,0.9,1.2,1.8,2.1].forEach(function(t,i){ tone(c,"sine",i%2?70:60,38,t,0.22,i%2?0.55:0.9,o); }); }},
 {id:"shutter",name:"Camera shutter",dur:0.3,fn:function(c,o){ [0,0.09].forEach(function(t){ var n=noise(c,0.06), h=filt(c,"highpass",1800), g=env(c,[[t+0.002,1,"exp"],[t+0.05,0.0001,"exp"]],0.8); chain(n,h,g,o); n.start(t); }); tone(c,"square",300,150,0.03,0.05,0.2,o); }},
 {id:"laser",name:"Laser",dur:0.6,fn:function(c,o){ tone(c,"sawtooth",2200,180,0,0.5,0.45,o); tone(c,"square",1100,90,0,0.5,0.15,o); }},
 {id:"applause",name:"Applause",dur:3,fn:function(c,o){ for(var k=0;k<120;k++){ var t=Math.random()*2.8, n=noise(c,0.04), h=filt(c,"highpass",1500), g=env(c,[[t+0.003,1,"exp"],[t+0.035,0.0001,"exp"]],0.12+Math.random()*0.25); chain(n,h,g,o); n.start(t); } }},
 {id:"drumroll",name:"Drum roll",dur:2,fn:function(c,o){ var t=0,v=0.2; while(t<1.8){ var n=noise(c,0.08), f=filt(c,"bandpass",1800,0.8), g=env(c,[[t+0.003,1,"exp"],[t+0.07,0.0001,"exp"]],v); chain(n,f,g,o); n.start(t); v=Math.min(0.8,v+0.03); t+=Math.max(0.035,0.11-t*0.04); } tone(c,"sine",120,45,1.85,0.15,0.9,o); }},
 {id:"cymbal",name:"Cymbal crash",dur:2.2,fn:function(c,o){ var n=noise(c,2.2), h=filt(c,"highpass",5000), g=env(c,[[0.004,1,"exp"],[2.1,0.0001,"exp"]],0.7); chain(n,h,g,o); n.start(0); }},
 {id:"thunder",name:"Thunder",dur:4,fn:function(c,o){ var n=noise(c,4), f=filt(c,"lowpass",260,1.2), g=env(c,[[0.15,1,"lin"],[3.9,0.0001,"exp"]],1); chain(n,f,g,o); n.start(0); }},
 {id:"countdown",name:"Countdown beeps",dur:3.6,fn:function(c,o){ [0,1,2].forEach(function(t){ tone(c,"sine",880,880,t,0.2,0.5,o); }); tone(c,"sine",1320,1320,3,0.9,0.55,o); }},
 {id:"phone",name:"Phone ring",dur:1.8,fn:function(c,o){ [0,0.9].forEach(function(t){ for(var k=0;k<10;k++){ tone(c,"sine",440,440,t+k*0.05,0.05,0.4,o); tone(c,"sine",480,480,t+k*0.05,0.05,0.4,o); } }); }},
 {id:"bird",name:"Birdsong",dur:3,fn:function(c,o){ for(var k=0;k<9;k++){ var t=Math.random()*2.7, f=2400+Math.random()*1800; tone(c,"sine",f,f*1.35,t,0.12,0.3,o); } }},
 {id:"sub",name:"Sub drop",dur:1.8,fn:function(c,o){ tone(c,"sine",90,24,0,1.6,1,o); }},
 {id:"zap",name:"Zap",dur:0.5,fn:function(c,o){ tone(c,"sawtooth",3000,120,0,0.4,0.4,o); }},
 {id:"powerup",name:"Power up",dur:1,fn:function(c,o){ [523,659,784,1046,1318].forEach(function(f,k){ tone(c,"square",f,f,k*0.08,0.2,0.25,o); }); }},
 {id:"gameover",name:"Game over",dur:1.4,fn:function(c,o){ [392,330,262,196].forEach(function(f,k){ tone(c,"triangle",f,f,k*0.22,0.4,0.5,o); }); }},
 {id:"boing",name:"Boing",dur:0.7,fn:function(c,o){ tone(c,"sine",150,600,0,0.6,0.7,o); }},
 {id:"glitch",name:"Glitch",dur:0.6,fn:function(c,o){ for(var k=0;k<14;k++){ var f=200+Math.random()*3000; tone(c,"square",f,f,k*0.04,0.04,0.3,o); } }},
 {id:"typewriter",name:"Typewriter",dur:1.3,fn:function(c,o){ for(var k=0;k<9;k++){ var t=k*0.13, n=noise(c,0.04), h=filt(c,"highpass",1800), g=env(c,[[t+0.003,1,"exp"],[t+0.035,0.0001,"exp"]],0.5); chain(n,h,g,o); n.start(t); } }},
 {id:"sonar",name:"Sonar ping",dur:2,fn:function(c,o){ [0,0.45,0.9].forEach(function(t,k){ tone(c,"sine",1200,1200,t,1.0,0.6/(k+1),o); }); }},
 {id:"clang",name:"Metal clang",dur:1.6,fn:function(c,o){ [523,1180,1860,2670].forEach(function(f,k){ tone(c,"sine",f,f,0,1.4/(k+1),0.5/(k+1),o); }); }},
 {id:"recordstop",name:"Record stop",dur:1,fn:function(c,o){ tone(c,"sawtooth",440,40,0,0.9,0.4,o); }},
 {id:"slot",name:"Slot machine",dur:1.9,fn:function(c,o){ for(var k=0;k<12;k++){ var f=500+Math.random()*900; tone(c,"square",f,f,k*0.08,0.08,0.2,o); } [523,659,784].forEach(function(f){ tone(c,"triangle",f,f,1.1,0.7,0.35,o); }); }},
 {id:"doorbell",name:"Doorbell",dur:1.8,fn:function(c,o){ tone(c,"sine",659,659,0,1.1,0.5,o); tone(c,"sine",523,523,0.5,1.2,0.5,o); }},
 {id:"tada",name:"Ta-da",dur:1.8,fn:function(c,o){ [523,659,784].forEach(function(f){ tone(c,"triangle",f,f,0,0.4,0.3,o); }); [1046,1318,1568].forEach(function(f){ tone(c,"triangle",f,f,0.15,1.4,0.3,o); }); }},
 {id:"bassdrop",name:"Bass drop",dur:2,fn:function(c,o){ tone(c,"sine",140,30,0,1.9,1,o); }}
];
function wav(d){ var n=d.length, b=new ArrayBuffer(44+n*2), v=new DataView(b); function s(o,t){ for(var i=0;i<t.length;i++) v.setUint8(o+i,t.charCodeAt(i)); }
  s(0,"RIFF"); v.setUint32(4,36+n*2,true); s(8,"WAVE"); s(12,"fmt "); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,1,true); v.setUint32(24,SR,true); v.setUint32(28,SR*2,true); v.setUint16(32,2,true); v.setUint16(34,16,true); s(36,"data"); v.setUint32(40,n*2,true);
  var pk=0,i; for(i=0;i<n;i++){ var a=Math.abs(d[i]); if(a>pk) pk=a; } var k=pk>0?0.708/pk:1; for(i=0;i<n;i++){ var x=Math.max(-1,Math.min(1,d[i]*k)); v.setInt16(44+i*2,x<0?x*32768:x*32767,true); }
  return new Blob([b],{type:"audio/wav"}); }
var OAC=window.OfflineAudioContext||window.webkitOfflineAudioContext, cache={};
X.sfxRender=async function(id){ if(cache[id]) return cache[id]; var e=LIST.find(function(x){ return x.id===id; }); if(!e||!OAC) return null;
  var c=new OAC(1,Math.ceil(SR*e.dur),SR), out=c.createGain(); out.gain.value=1; out.connect(c.destination); e.fn(c,out); var buf=await c.startRendering(); var blob=wav(buf.getChannelData(0)); cache[id]=blob; return blob; };
X.sfxList=LIST;
function assign(ids,bin,st){ var dead=Date.now()+60000, left=ids.slice(); (function poll(){ left=left.filter(function(id){ var a=(typeof project!=="undefined"&&project.assets)?project.assets[id]:null; if(!a) return false; var it=a.libId?M.byId(a.libId):null; if(!it) return true; it.bin=bin.id; it.tags=Array.from(new Set((it.tags||[]).concat(["sfx"]))); st.n++; X.save([it]); return false; }); if(left.length&&Date.now()<dead) setTimeout(poll,600); })(); }
X.sfxAdd=async function(ids){ if(typeof window.importFiles!=="function"){ X.toast("Import is not ready yet"); return 0; }
  var have={}; M.items().forEach(function(i){ have[String(i.name).toLowerCase()]=1; }); var todo=ids.filter(function(id){ var e=LIST.find(function(x){ return x.id===id; }); return e&&!have[("SFX "+e.name+".wav").toLowerCase()]; }), skipped=ids.length-todo.length;
  if(!todo.length){ X.toast("Those effects are already in your Library"); return 0; }
  var bins=M.state.bins, bin=bins.find(function(b){ return b.name==="Sound effects"; }); if(!bin){ bin={id:"bin_sfx"+Date.now().toString(36),name:"Sound effects"}; bins.push(bin); try{ M.saveBins(); }catch(e){} }
  var st={n:0}, done=0;
  for(var i=0;i<todo.length;i+=4){ var files=[]; for(var k=i;k<Math.min(todo.length,i+4);k++){ var e=LIST.find(function(x){ return x.id===todo[k]; }), b=await X.sfxRender(e.id); files.push(new File([b],"SFX "+e.name+".wav",{type:"audio/wav"})); }
    var seen={}; Object.keys(project.assets||{}).forEach(function(a){ seen[a]=1; }); await window.importFiles(files);
    var fresh=Object.keys(project.assets||{}).filter(function(a){ return !seen[a]&&/^asset_/.test(a); }); assign(fresh,bin,st); done+=files.length; X.toast("Adding sound effects "+done+" of "+todo.length+"…",1500); }
  X.toast(done+" sound effect"+(done===1?"":"s")+" added to the “Sound effects” bin"+(skipped?" ("+skipped+" already there)":""),3800); try{ M.render(); }catch(e){} return done; };
var preview=null;
X.sfxDialog=function(){ var rows=LIST.map(function(e){ return '<label style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #2c261d"><input type="checkbox" data-lws="'+e.id+'"><span style="flex:1">'+e.name+'<small style="opacity:.6"> · '+e.dur+' s</small></span><button type="button" class="chip" data-lwp="'+e.id+'" aria-label="Preview '+e.name+'">▶</button></label>'; }).join("");
  openModal("Sound effects",'<div style="font:13px/1.4 system-ui"><div style="max-height:46vh;overflow:auto">'+rows+'</div><div class="mdetail-actions" style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap"><button type="button" class="chip" id="lwsAll">Tick all</button><button type="button" class="chip pri" id="lwsAdd">Add ticked to Library</button></div></div>');
  var root=document.getElementById("modalBackdrop");
  root.querySelectorAll("[data-lwp]").forEach(function(b){ b.onclick=async function(ev){ ev.preventDefault(); ev.stopPropagation(); var blob=await X.sfxRender(b.dataset.lwp); if(!blob) return; if(preview){ try{ preview.pause(); URL.revokeObjectURL(preview.src); }catch(e){} } preview=new Audio(URL.createObjectURL(blob)); try{ await preview.play(); }catch(e){} }; });
  document.getElementById("lwsAll").onclick=function(){ root.querySelectorAll("[data-lws]").forEach(function(c){ c.checked=true; }); };
  document.getElementById("lwsAdd").onclick=function(){ var ids=[]; root.querySelectorAll("[data-lws]").forEach(function(c){ if(c.checked) ids.push(c.dataset.lws); }); if(!ids.length){ X.toast("Tick at least one effect"); return; } closeModal(); if(preview){ try{ preview.pause(); }catch(e){} } X.sfxAdd(ids); }; };
X.add({id:"lw_sfx",group:"Import",label:"Add sound effects…",hint:"37 built in",run:function(){ X.sfxDialog(); }});
try{ window.AMIYO_EDITOR_BUILD="libw-step11-sfx"; }catch(e){}
})();

;
/* ==================== Script 658 id="amiyo-libp-step01" ==================== */
/* Library Pro step 1: footage log (like Premiere's Log columns). Lib+ > "Log selected files…" sets Scene, Shot, Take, Comment and
   Good take on one or many files (empty box = leave as is). A small badge shows on each card. "Find in log…" selects matches. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.onRender||X.log) return;
var F=["scene","shot","take","logNote"];
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function ask(msg,def){ return Promise.resolve(window.amiyoAsk?window.amiyoAsk(msg,def||""):prompt(msg,def||"")); }
function need(){ var s=X.sel(); if(!s.length){ var a=document.activeElement, c=a&&a.closest?a.closest("#mlibBody [data-lib]"):null, it=c&&X.item(c.dataset.lib); if(it) return [it]; X.toast("Select one or more files first (Select button)"); } return s; }
function label(i){ var p=[]; if(i.scene) p.push("Sc "+i.scene); if(i.shot) p.push("Sh "+i.shot); if(i.take) p.push("T"+i.take); if(i.good) p.unshift("✔"); return p.join(" · "); }
X.log={fields:F,label:label};
var st=document.createElement("style"); st.textContent=".lpLog{display:block;margin-top:2px;font:600 10px/1.2 system-ui;color:#9fd18b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#lpLogForm label{display:block;margin:0 0 8px;font:12px system-ui;opacity:.9}#lpLogForm input[type=text]{display:block;width:100%;box-sizing:border-box;margin-top:3px;padding:8px;border-radius:6px;border:1px solid #3a3226;background:#1f1b16;color:#e6dfd0;font:14px system-ui}"; document.head.appendChild(st);
function badges(){ var all=M.items(); document.querySelectorAll("#mlibBody [data-lib]").forEach(function(c){ var it=all.find(function(i){ return i.id===c.dataset.lib; }); var t=it?label(it):"", b=c.querySelector(".lpLog");
  if(t){ if(!b){ b=document.createElement("span"); b.className="lpLog"; var m=c.querySelector(".mmeta"); if(m) m.appendChild(b); else return; } if(b.textContent!==t) b.textContent=t; } else if(b) b.remove(); }); }
X.onRender(badges); setTimeout(badges,600);
X.logApply=function(list,v){ list.forEach(function(i){ F.forEach(function(f){ if(v[f]!=null&&v[f]!==""){ i[f]=String(v[f]).slice(0,200); } }); if(v.clear){ F.forEach(function(f){ delete i[f]; }); delete i.good; } if(v.good===true) i.good=true; else if(v.good===false) delete i.good; }); X.save(list); };
X.logDialog=function(){ var s=need(); if(!s.length) return; var one=s.length===1?s[0]:null;
  var f=function(k,l,ph){ return '<label>'+l+'<input type="text" data-f="'+k+'" maxlength="200" placeholder="'+ph+'" value="'+esc(one&&one[k]||"")+'"></label>'; };
  openModal("Log "+(one?"file":s.length+" files"),'<div id="lpLogForm">'+f("scene","Scene",s.length>1?"empty = keep":"e.g. 12")+f("shot","Shot",s.length>1?"empty = keep":"e.g. 3A")+f("take","Take",s.length>1?"empty = keep":"e.g. 2")+f("logNote","Comment",s.length>1?"empty = keep":"what is in this clip")+
    '<label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="lpGood"'+(one&&one.good?" checked":"")+'> Good take</label>'+
    '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px"><button type="button" class="chip pri" id="lpLogOk">Save</button><button type="button" class="chip" id="lpLogClr">Clear log</button></div></div>');
  var root=document.getElementById("lpLogForm");
  document.getElementById("lpLogOk").onclick=function(){ var v={}; root.querySelectorAll("[data-f]").forEach(function(e){ v[e.dataset.f]=e.value.trim(); }); var g=document.getElementById("lpGood").checked; if(one||g) v.good=g; if(one){ F.forEach(function(k){ if(!v[k]) delete one[k]; }); } X.logApply(s,v); closeModal(); X.toast("Log saved for "+s.length+" file"+(s.length===1?"":"s")); };
  document.getElementById("lpLogClr").onclick=function(){ X.logApply(s,{clear:true}); closeModal(); X.toast("Log cleared"); }; };
X.logFind=function(text){ var q=String(text||"").trim().toLowerCase(); if(!q) return 0; var ids=M.items().filter(function(i){ var h=[i.scene,i.shot,i.take,i.logNote,i.good?"good":""].join(" ").toLowerCase(); return h.indexOf(q)>=0; }).map(function(i){ return i.id; }); if(ids.length&&X.selectIds) X.selectIds(ids); return ids.length; };
X.add({id:"lp_log",group:"Log",label:"Log selected files…",hint:"Scene/Shot/Take",run:function(){ X.logDialog(); }});
X.add({id:"lp_log_find",group:"Log",label:"Find in log…",run:function(){ ask("Find files whose Scene, Shot, Take or Comment has… (type good for good takes)","").then(function(v){ if(v==null) return; var n=X.logFind(v); X.toast(n?n+" file"+(n===1?"":"s")+" selected":"No log matches"); }); }});
X.add({id:"lp_log_good",group:"Log",label:"Select good takes",run:function(){ var ids=M.items().filter(function(i){ return i.good; }).map(function(i){ return i.id; }); if(!ids.length){ X.toast("No good takes marked yet"); return; } if(X.selectIds) X.selectIds(ids); X.toast(ids.length+" good take"+(ids.length===1?"":"s")+" selected"); }});
try{ window.AMIYO_EDITOR_BUILD="libp-step01-log"; }catch(e){}
})();

;
/* ==================== Script 659 id="amiyo-libp-step02" ==================== */
/* Library Pro step 2: clip markers on Library files (like Premiere's source-clip markers). Lib+ > "Clip markers…" opens a player for the
   selected file: add a marker with a note at the current time, jump to any marker, use a marker as In or Out, delete markers.
   Cards show a 📍 count. Plays straight from the stored file, so large files are not copied into memory. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.onRender||X.cm) return;
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function ask(msg,def){ return Promise.resolve(window.amiyoAsk?window.amiyoAsk(msg,def||""):prompt(msg,def||"")); }
function tc(t){ t=Math.max(0,+t||0); var m=Math.floor(t/60), s=t-m*60; return m+":"+(s<10?"0":"")+s.toFixed(1); }
function target(){ var s=X.sel(); if(s.length) return s[0]; var a=document.activeElement, c=a&&a.closest?a.closest("#mlibBody [data-lib]"):null; return c?X.item(c.dataset.lib):null; }
X.cm={list:function(i){ return Array.isArray(i.cmarks)?i.cmarks:[]; },
  add:function(i,t,text){ var l=X.cm.list(i).slice(); l.push({t:Math.round(t*100)/100,text:String(text||"").slice(0,120)}); l.sort(function(a,b){ return a.t-b.t; }); i.cmarks=l; X.save([i]); },
  del:function(i,k){ var l=X.cm.list(i).slice(); l.splice(k,1); if(l.length) i.cmarks=l; else delete i.cmarks; X.save([i]); }};
var st=document.createElement("style"); st.textContent="#lpCm video,#lpCm audio{width:100%;max-height:38vh;background:#000;border-radius:8px}#lpCm .r{display:flex;align-items:center;gap:6px;padding:6px 0;border-bottom:1px solid #2c261d;font:12.5px system-ui}#lpCm .r b{min-width:54px;color:#ffb27a;font-variant-numeric:tabular-nums}#lpCm .r span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#lpCm .r button{padding:4px 8px}";
document.head.appendChild(st);
function badges(){ var all=M.items(); document.querySelectorAll("#mlibBody [data-lib]").forEach(function(c){ var it=all.find(function(i){ return i.id===c.dataset.lib; }); var n=it?X.cm.list(it).length:0, b=c.querySelector(".lpCm");
  if(n){ if(!b){ b=document.createElement("span"); b.className="lpCm"; b.style.cssText="position:absolute;right:4px;bottom:4px;z-index:3;background:rgba(0,0,0,.72);color:#ffb27a;font:700 10px system-ui;padding:1px 5px;border-radius:8px;pointer-events:none"; var th=c.querySelector(".mthumb"); if(!th) return; th.appendChild(b); } var t="📍"+n; if(b.textContent!==t) b.textContent=t; } else if(b) b.remove(); }); }
X.onRender(badges); setTimeout(badges,600);
var urlNow=null;
function stop(){ if(urlNow){ try{ URL.revokeObjectURL(urlNow); }catch(e){} urlNow=null; } }
X.cmOpen=async function(it){ it=it||target(); if(!it){ X.toast("Click or select a file first"); return; } if(it.type==="image"){ X.toast("Markers work on videos and sounds"); return; }
  var blob=null; try{ blob=await M.getBlob(it); }catch(e){} if(!blob){ X.toast("This file is missing - use Relink first"); return; }
  stop(); urlNow=URL.createObjectURL(blob); var tag=it.type==="audio"?"audio":"video";
  openModal("Clip markers",'<div id="lpCm"><'+tag+' id="lpCmP" controls playsinline preload="metadata" src="'+urlNow+'"></'+tag+'><div style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0"><button type="button" class="chip pri" id="lpCmAdd">📍 Add marker here</button></div><div id="lpCmL"></div></div>');
  var p=document.getElementById("lpCmP"), L=document.getElementById("lpCmL");
  function draw(){ var l=X.cm.list(it); L.innerHTML=l.length?l.map(function(m,k){ return '<div class="r"><b>'+tc(m.t)+'</b><span title="'+esc(m.text)+'">'+(esc(m.text)||"<i style=opacity:.5>no note</i>")+'</span><button type="button" class="chip" data-g="'+k+'">Go</button><button type="button" class="chip" data-i="'+k+'" title="Use as In">In</button><button type="button" class="chip" data-o="'+k+'" title="Use as Out">Out</button><button type="button" class="chip danger" data-d="'+k+'" aria-label="Delete marker">✕</button></div>'; }).join(""):'<div style="font:12.5px system-ui;opacity:.7;padding:6px 0">No markers yet. Play, pause, then tap Add marker.</div>'; }
  draw();
  document.getElementById("lpCmAdd").onclick=async function(){ var t=p.currentTime||0; try{ p.pause(); }catch(e){} var txt=await ask("Marker note at "+tc(t)+" (optional)",""); if(txt===null) return; X.cm.add(it,t,String(txt).trim()); draw(); };
  L.onclick=function(e){ var b=e.target.closest("button"); if(!b) return; var l=X.cm.list(it);
    if(b.dataset.g!=null){ p.currentTime=l[+b.dataset.g].t; }
    else if(b.dataset.d!=null){ X.cm.del(it,+b.dataset.d); draw(); }
    else if(b.dataset.i!=null){ it.markIn=l[+b.dataset.i].t; if(it.markOut!=null&&it.markOut<=it.markIn) delete it.markOut; X.save([it]); X.toast("In point set to "+tc(it.markIn)); }
    else if(b.dataset.o!=null){ var o=l[+b.dataset.o].t; if(it.markIn!=null&&o<=it.markIn){ X.toast("Out must be after In"); return; } it.markOut=o; X.save([it]); X.toast("Out point set to "+tc(o)); } };
  var bd=document.getElementById("modalBackdrop"); if(bd){ new MutationObserver(function(_,ob){ if(!document.getElementById("lpCm")){ stop(); ob.disconnect(); } }).observe(bd,{childList:true,subtree:true,attributes:true}); } };
X.add({id:"lp_cm",group:"Log",label:"Clip markers…",hint:"📍 notes",run:function(){ X.cmOpen(); }});
X.add({id:"lp_cm_find",group:"Log",label:"Select files with markers",run:function(){ var ids=M.items().filter(function(i){ return X.cm.list(i).length; }).map(function(i){ return i.id; }); if(!ids.length){ X.toast("No clip markers yet"); return; } if(X.selectIds) X.selectIds(ids); X.toast(ids.length+" file"+(ids.length===1?"":"s")+" with markers"); }});
try{ window.AMIYO_EDITOR_BUILD="libp-step02-markers"; }catch(e){}
})();

;
/* ==================== Script 660 id="amiyo-libp-step03" ==================== */
/* Library Pro step 3: Automate to sequence (like Premiere's Automate To Sequence). Select files, then Lib+ > "Automate to sequence…":
   pick the order (log order, name, date, length, rating), a gap between clips, how long still pictures last, and where to start
   (end of timeline or at the playhead). Every clip is added in one go and can be undone one by one. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.onRender||X.auto) return;
function nat(a,b){ return String(a==null?"":a).localeCompare(String(b==null?"":b),undefined,{numeric:true}); }
var ORD={log:function(a,b){ return nat(a.scene,b.scene)||nat(a.shot,b.shot)||nat(a.take,b.take)||nat(a.name,b.name); },
  name:function(a,b){ return nat(a.name,b.name); },
  date:function(a,b){ return (a.addedAt||0)-(b.addedAt||0); },
  length:function(a,b){ return (+b.duration||0)-(+a.duration||0); },
  rating:function(a,b){ return (b.rating||0)-(a.rating||0)||nat(a.name,b.name); }};
X.auto={order:ORD};
function trackEnd(kind){ try{ var t=getTrack(kind), e=0; t.clips.forEach(function(c){ e=Math.max(e,c.start+c.duration); }); return e; }catch(e){ return 0; } }
X.autoRun=async function(list,o){ o=o||{}; var l=list.slice().sort(ORD[o.order]||ORD.name); var gap=Math.max(0,+o.gap||0), still=Math.max(.5,+o.still||5);
  var vt=0, at=0, n=0, miss=0;
  if(o.start==="end"){ vt=trackEnd("video"); at=trackEnd("audio"); }
  for(var k=0;k<l.length;k++){ var it=l[k]; var before=0; try{ before=typeof selectedClipId!=="undefined"?selectedClipId:null; }catch(e){}
    var c=await M.use([it.id],{timeline:true}); if(!c){ miss++; continue; }
    var f=null; try{ f=getClip(); }catch(e){} if(!f||!f.clip||f.clip.id===before){ n++; continue; }
    var clip=f.clip, kind=it.type==="audio"?"audio":"video";
    if(it.type==="image"){ clip.duration=still; clip.outPoint=still; }
    if(o.start==="end"){ var cur=kind==="audio"?at:vt; if(!f.track.clips.some(function(x){ return x!==clip&&x.start<cur+clip.duration-.001&&x.start+x.duration>cur+.001; })){ clip.start=cur; f.track.clips.sort(function(a,b){ return a.start-b.start; }); }
      if(kind==="audio") at=clip.start+clip.duration+gap; else vt=clip.start+clip.duration+gap; }
    n++; }
  try{ scheduleAutosave(); renderAll(); }catch(e){}
  return {added:n,missing:miss}; };
function openDlg(){ var s=X.sel(); if(s.length<1){ X.toast("Select the files first (Select button)"); return; }
  var hasLog=s.some(function(i){ return i.scene||i.shot||i.take; });
  var sel=function(id,opts){ return '<select id="'+id+'" style="display:block;width:100%;margin-top:3px;padding:8px;border-radius:6px;border:1px solid #3a3226;background:#1f1b16;color:#e6dfd0;font:14px system-ui">'+opts+'</select>'; };
  var num=function(id,v){ return '<input id="'+id+'" type="number" min="0" step="0.5" value="'+v+'" style="display:block;width:100%;box-sizing:border-box;margin-top:3px;padding:8px;border-radius:6px;border:1px solid #3a3226;background:#1f1b16;color:#e6dfd0;font:14px system-ui">'; };
  var lab='display:block;margin:0 0 8px;font:12px system-ui';
  openModal("Automate to sequence",'<div id="lpAuto"><label style="'+lab+'">Order'+sel("lpAo",'<option value="log"'+(hasLog?" selected":"")+'>Log order (scene, shot, take)</option><option value="name"'+(hasLog?"":" selected")+'>Name A-Z</option><option value="date">Date imported</option><option value="length">Longest first</option><option value="rating">Best rating first</option>')+'</label>'+
    '<label style="'+lab+'">Start'+sel("lpAs",'<option value="end">End of the timeline</option><option value="head">At the playhead</option>')+'</label>'+
    '<label style="'+lab+'">Gap between clips (seconds, end of timeline only)'+num("lpAg",0)+'</label>'+
    '<label style="'+lab+'">Still pictures last (seconds)'+num("lpAi",5)+'</label>'+
    '<div style="font:12px system-ui;opacity:.7;margin-bottom:8px">'+s.length+' file'+(s.length===1?"":"s")+' selected</div><button type="button" class="chip pri" id="lpAgo">Add to timeline</button></div>');
  document.getElementById("lpAgo").onclick=async function(){ var o={order:document.getElementById("lpAo").value,start:document.getElementById("lpAs").value,gap:document.getElementById("lpAg").value,still:document.getElementById("lpAi").value}; closeModal(); X.toast("Adding "+s.length+" file"+(s.length===1?"":"s")+"…");
    var r=await X.autoRun(s,o); X.toast(r.added+" clip"+(r.added===1?"":"s")+" added"+(r.missing?" · "+r.missing+" missing":"")); }; }
X.autoOpen=openDlg;
X.add({id:"lp_auto",group:"Timeline",label:"Automate to sequence…",hint:"in order",run:function(){ openDlg(); }});
try{ window.AMIYO_EDITOR_BUILD="libp-step03-automate"; }catch(e){}
})();

;
/* ==================== Script 661 id="amiyo-libp-step04" ==================== */
/* Library Pro step 4: Insert and Overwrite at the playhead (like Premiere's Insert and Overwrite buttons).
   Select one file (or click a card), then Lib+ > "Insert at playhead" (later clips move right, a clip under the playhead is split)
   or "Overwrite at playhead" (the new clip replaces what is under it). In and Out marks of the file are respected.
   Each action is one undo step. Keys while a card is focused: "," = Insert, "." = Overwrite. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.onRender||X.place) return;
function target(){ var s=X.sel(); if(s.length) return s[0]; var a=document.activeElement, c=a&&a.closest?a.closest("#mlibBody [data-lib]"):null; return c?X.item(c.dataset.lib):null; }
function cut(c,keepLeft,at){ /* shorten clip c to end at "at" (keepLeft) or to start at "at" */
  var span=(c.outPoint-c.inPoint)/(c.duration||1);
  if(keepLeft){ var nd=at-c.start; c.outPoint=c.inPoint+span*nd; c.duration=nd; }
  else { var shift=at-c.start; c.inPoint=c.inPoint+span*shift; c.duration=c.start+c.duration-at; c.start=at; } }
function clone(c){ return JSON.parse(JSON.stringify(c)); }
X.place=async function(it,mode){ if(!it){ X.toast("Click or select a file first"); return 0; }
  var before=deepClone(serializableProject()), h=project.history, idx=h?h.index:-1;
  var n=await M.use([it.id],{timeline:true}); if(!n) return 0;
  var f=getClip(); if(!f||!f.clip) return 0; var clip=f.clip, track=f.track, d=clip.duration, t=Math.max(0,currentTime), e=t+d;
  track.clips=track.clips.filter(function(c){ return c!==clip; });
  var out=[];
  track.clips.forEach(function(c){ var cs=c.start, ce=c.start+c.duration;
    if(mode==="insert"){
      if(ce<=t+.001){ out.push(c); }
      else if(cs>=t-.001){ c.start=cs+d; out.push(c); }
      else { var r=clone(c); r.id=uid("clip"); cut(c,true,t); out.push(c); cut(r,false,t); r.start=t+d; out.push(r); }
    } else {
      if(ce<=t+.001||cs>=e-.001){ out.push(c); }
      else if(cs>=t-.001&&ce<=e+.001){ /* fully covered: removed */ }
      else if(cs<t&&ce>e){ var r2=clone(c); r2.id=uid("clip"); cut(c,true,t); out.push(c); cut(r2,false,e); out.push(r2); }
      else if(cs<t){ cut(c,true,t); out.push(c); }
      else { cut(c,false,e); out.push(c); }
    } });
  clip.start=t; out.push(clip); out.sort(function(a,b){ return a.start-b.start; }); track.clips=out;
  var after=deepClone(serializableProject());
  if(h){ h.entries=h.entries.slice(0,idx+1); h.index=idx; }
  recordHistory(mode==="insert"?"Insert clip":"Overwrite clip",before,after);
  selectedClipId=clip.id; selectedTrackId=track.id; renderAll(); X.toast(mode==="insert"?"Inserted at playhead":"Overwritten at playhead"); return 1; };
X.add({id:"lp_insert",group:"Timeline",label:"Insert at playhead",hint:",",run:function(){ X.place(target(),"insert"); }});
X.add({id:"lp_overwrite",group:"Timeline",label:"Overwrite at playhead",hint:".",run:function(){ X.place(target(),"overwrite"); }});
document.addEventListener("keydown",function(e){ if(e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey) return; if(e.key!==","&&e.key!==".") return; var t=e.target; if(!t||!t.closest||!t.closest("#mlibBody [data-lib]")) return;
  if(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable) return; var it=X.item(t.closest("[data-lib]").dataset.lib); if(!it) return; e.preventDefault(); X.place(it,e.key===","?"insert":"overwrite"); });
try{ window.AMIYO_EDITOR_BUILD="libp-step04-insert-overwrite"; }catch(e){}
})();

;
/* ==================== Script 662 id="amiyo-libp-step05" ==================== */
/* Library Pro step 5: capture the screen straight into the Library (like Premiere's Capture panel).
   Lib+ > "Record screen…": choose whether to include sound, start, pick a screen/window/tab, and stop with the red bar or by ending
   the share. The recording is saved into the Library bin "Captures". Needs a browser that can share the screen (usually desktop). */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.onRender||X.cap) return;
function pad(n){ return (n<10?"0":"")+n; }
function stamp(){ var d=new Date(); return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())+" "+pad(d.getHours())+"."+pad(d.getMinutes())+"."+pad(d.getSeconds()); }
function pickMime(video){ var l=video?["video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm","video/mp4"]:["audio/webm;codecs=opus","audio/webm","audio/mp4"]; for(var i=0;i<l.length;i++){ try{ if(window.MediaRecorder&&MediaRecorder.isTypeSupported(l[i])) return l[i]; }catch(e){} } return ""; }
function ensureBin(name){ var bins=M.state.bins, b=bins.find(function(x){ return x.name===name; }); if(!b){ b={id:"bin_cap"+Date.now().toString(36),name:name}; bins.push(b); try{ M.saveBins(); }catch(e){} } return b; }
function sleep(ms){ return new Promise(function(r){ setTimeout(r,ms); }); }
X.cap={pickMime:pickMime,stamp:stamp,ensureBin:ensureBin,sleep:sleep};
X.cap.importBlob=async function(blob,name,binName){ if(typeof window.importFiles!=="function"){ X.toast("Import is not ready yet"); return null; }
  var f=new File([blob],name,{type:blob.type||"video/webm"}); await window.importFiles([f]);
  var it=null; for(var k=0;k<20&&!it;k++){ it=M.items().find(function(i){ return i.name===name; }); if(!it) await sleep(250); }
  if(it&&binName){ it.bin=ensureBin(binName).id; X.save([it]); } return it; };
var bar=null, tick=0;
function showBar(onStop){ hideBar(); bar=document.createElement("div"); bar.id="lpRecBar"; bar.setAttribute("role","status");
  bar.style.cssText="position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:99995;display:flex;align-items:center;gap:10px;background:#2a0f0f;border:1px solid #e5534b;color:#fff;border-radius:999px;padding:8px 8px 8px 14px;font:600 13px system-ui;box-shadow:0 8px 28px rgba(0,0,0,.55)";
  bar.innerHTML='<span style="width:10px;height:10px;border-radius:50%;background:#e5534b"></span><span id="lpRecT">0:00</span><button type="button" id="lpRecStop" style="background:#e5534b;color:#fff;border:0;border-radius:999px;padding:7px 14px;font:700 13px system-ui;cursor:pointer">Stop</button>';
  document.body.appendChild(bar); var t0=Date.now(); tick=setInterval(function(){ var s=Math.floor((Date.now()-t0)/1000), el=document.getElementById("lpRecT"); if(el) el.textContent=Math.floor(s/60)+":"+pad(s%60); },500);
  document.getElementById("lpRecStop").onclick=onStop; }
function hideBar(){ clearInterval(tick); if(bar){ bar.remove(); bar=null; } }
X.cap.showBar=showBar; X.cap.hideBar=hideBar;
var rec=null;
X.screenRecord=async function(withSound){ if(rec){ X.toast("A recording is already running"); return; }
  if(!navigator.mediaDevices||!navigator.mediaDevices.getDisplayMedia||!window.MediaRecorder){ X.toast("This browser cannot record the screen. Try a desktop browser."); return; }
  var stream; try{ stream=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:30},audio:!!withSound}); }catch(e){ X.toast("Screen sharing was cancelled"); return; }
  var mime=pickMime(true), chunks=[], r; try{ r=mime?new MediaRecorder(stream,{mimeType:mime}):new MediaRecorder(stream); }catch(e){ stream.getTracks().forEach(function(t){ t.stop(); }); X.toast("Could not start the recorder"); return; }
  rec=r; var done=false;
  function finish(){ if(done) return; done=true; hideBar(); stream.getTracks().forEach(function(t){ try{ t.stop(); }catch(e){} }); }
  r.ondataavailable=function(e){ if(e.data&&e.data.size) chunks.push(e.data); };
  r.onstop=async function(){ finish(); rec=null; var blob=new Blob(chunks,{type:r.mimeType||mime||"video/webm"}); if(!blob.size){ X.toast("Nothing was recorded"); return; }
    var ext=/mp4/.test(blob.type)?"mp4":"webm"; X.toast("Saving recording…"); var it=await X.cap.importBlob(blob,"Screen recording "+stamp()+"."+ext,"Captures"); X.toast(it?"Saved to Library › Captures":"Saved to the project"); };
  stream.getVideoTracks()[0].addEventListener("ended",function(){ if(r.state!=="inactive") r.stop(); });
  r.start(1000); showBar(function(){ if(r.state!=="inactive") r.stop(); }); X.toast("Recording… tap Stop when done"); };
X.add({id:"lp_screen",group:"Capture",label:"Record screen…",hint:"to Captures bin",run:function(){
  openModal("Record screen",'<div style="font:13px/1.5 system-ui"><p style="margin:0 0 10px">Pick a screen, window or tab in the next step. The recording goes into the Library bin “Captures”.</p><label style="display:flex;gap:8px;align-items:center;margin-bottom:12px"><input type="checkbox" id="lpScrSnd" checked> Include sound (tab or system audio, if the browser offers it)</label><button type="button" class="chip pri" id="lpScrGo">Start</button></div>');
  document.getElementById("lpScrGo").onclick=function(){ var s=document.getElementById("lpScrSnd").checked; closeModal(); X.screenRecord(s); }; }});
try{ window.AMIYO_EDITOR_BUILD="libp-step05-screen"; }catch(e){}
})();

;
/* ==================== Script 663 id="amiyo-libp-step06" ==================== */
/* Library Pro step 6: record from the camera and/or microphone into the Library bin "Captures".
   Lib+ > "Record camera / mic…": pick camera + mic, camera only or mic only (front or back camera on a phone). A small live picture
   shows while recording and the red bar stops it. Uses the same saving path as screen recording. */
(function(){"use strict";
var X=window.AMIYO_LIBX; if(!X||!X.cap||X.camRecord) return;
var C=X.cap, rec=null;
function pad(n){ return (n<10?"0":"")+n; }
X.camRecord=async function(mode,facing){ if(rec){ X.toast("A recording is already running"); return; }
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||!window.MediaRecorder){ X.toast("This browser cannot record from the camera or microphone"); return; }
  var wantV=mode!=="mic", wantA=mode!=="cam", stream;
  try{ stream=await navigator.mediaDevices.getUserMedia({video:wantV?{facingMode:facing||"user",width:{ideal:1280},height:{ideal:720}}:false,audio:wantA?{echoCancellation:true,noiseSuppression:true}:false}); }
  catch(e){ X.toast(/Permission|NotAllowed/i.test(String(e&&e.name))?"Allow camera / microphone access and try again":"No camera or microphone found"); return; }
  var mime=C.pickMime(wantV), chunks=[], r; try{ r=mime?new MediaRecorder(stream,{mimeType:mime}):new MediaRecorder(stream); }catch(e){ stream.getTracks().forEach(function(t){ t.stop(); }); X.toast("Could not start the recorder"); return; }
  rec=r; var pv=null;
  if(wantV){ pv=document.createElement("video"); pv.muted=true; pv.playsInline=true; pv.srcObject=stream; pv.setAttribute("aria-label","Live camera picture");
    pv.style.cssText="position:fixed;right:10px;top:calc(10px + env(safe-area-inset-top,0px));width:132px;max-height:100px;object-fit:cover;border-radius:10px;border:2px solid #e5534b;z-index:99994;background:#000"+(facing==="user"||!facing?";transform:scaleX(-1)":""); document.body.appendChild(pv); try{ pv.play(); }catch(e){} }
  function finish(){ C.hideBar(); stream.getTracks().forEach(function(t){ try{ t.stop(); }catch(e){} }); if(pv){ pv.srcObject=null; pv.remove(); pv=null; } }
  r.ondataavailable=function(e){ if(e.data&&e.data.size) chunks.push(e.data); };
  r.onstop=async function(){ finish(); rec=null; var type=r.mimeType||mime||(wantV?"video/webm":"audio/webm"); var blob=new Blob(chunks,{type:type}); if(!blob.size){ X.toast("Nothing was recorded"); return; }
    var ext=/mp4/.test(type)?(wantV?"mp4":"m4a"):"webm"; X.toast("Saving recording…"); var it=await C.importBlob(blob,(wantV?"Camera recording ":"Voice recording ")+C.stamp()+"."+ext,"Captures"); X.toast(it?"Saved to Library › Captures":"Saved to the project"); };
  r.start(1000); C.showBar(function(){ if(r.state!=="inactive") r.stop(); }); X.toast("Recording… tap Stop when done"); };
X.add({id:"lp_cam",group:"Capture",label:"Record camera / mic…",hint:"to Captures bin",run:function(){
  var s='display:block;width:100%;margin:3px 0 10px;padding:8px;border-radius:6px;border:1px solid #3a3226;background:#1f1b16;color:#e6dfd0;font:14px system-ui';
  openModal("Record camera / mic",'<div style="font:12px system-ui"><label>What to record<select id="lpCamM" style="'+s+'"><option value="both">Camera and microphone</option><option value="cam">Camera only</option><option value="mic">Microphone only (sound file)</option></select></label><label>Camera<select id="lpCamF" style="'+s+'"><option value="user">Front camera</option><option value="environment">Back camera</option></select></label><button type="button" class="chip pri" id="lpCamGo">Start</button></div>');
  document.getElementById("lpCamGo").onclick=function(){ var m=document.getElementById("lpCamM").value, f=document.getElementById("lpCamF").value; closeModal(); X.camRecord(m,f); }; }});
try{ window.AMIYO_EDITOR_BUILD="libp-step06-camera"; }catch(e){}
})();

;
/* ==================== Script 664 id="amiyo-libp-step07" ==================== */
/* Library Pro step 7: bring files in from the clipboard or from a web link.
   Paste (Ctrl/Cmd+V) while the Library is open to add a copied picture, video or sound; or Lib+ > "Paste from clipboard".
   Lib+ > "Add from link…" downloads a direct file link (the site must allow it; many do not) into the bin "Web". */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.cap||X.pasteIn) return;
var C=X.cap;
function okType(t){ return /^(image|video|audio)\//.test(t||""); }
function extOf(t){ var m=String(t||"").split("/")[1]||"bin"; m=m.split(";")[0]; return m==="jpeg"?"jpg":m==="quicktime"?"mov":m==="mpeg"?"mp3":m.replace(/[^a-z0-9]/gi,"")||"bin"; }
async function bring(files,label){ var n=0; for(var k=0;k<files.length;k++){ var f=files[k]; if(!okType(f.type)) continue;
    var name=/^(image|video|audio)\.\w+$/i.test(f.name||"")||!f.name?label+" "+C.stamp()+(files.length>1?" "+(k+1):"")+"."+extOf(f.type):f.name;
    var it=await C.importBlob(f,name,"Pasted"); if(it) n++; }
  return n; }
X.pasteIn=bring;
document.addEventListener("paste",async function(e){ var d=e.clipboardData; if(!d||!d.files||!d.files.length) return; var t=e.target;
  if(t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable)) return;
  if(!document.getElementById("mlibBody")) return; var files=[].slice.call(d.files).filter(function(f){ return okType(f.type); }); if(!files.length) return;
  e.preventDefault(); X.toast("Adding pasted file"+(files.length===1?"":"s")+"…"); var n=await bring(files,"Pasted"); X.toast(n?n+" file"+(n===1?"":"s")+" added to Library › Pasted":"Could not add that"); });
X.add({id:"lp_paste",group:"Import",label:"Paste from clipboard",hint:"Ctrl+V",run:async function(){
  if(!navigator.clipboard||!navigator.clipboard.read){ X.toast("Tap in the Library and press Ctrl/Cmd+V to paste a picture or file"); return; }
  var items; try{ items=await navigator.clipboard.read(); }catch(e){ X.toast("Allow clipboard access, or press Ctrl/Cmd+V in the Library"); return; }
  var files=[]; for(var i=0;i<items.length;i++){ var ty=items[i].types.filter(okType)[0]; if(ty){ var b=await items[i].getType(ty); files.push(new File([b],"image."+extOf(ty),{type:ty})); } }
  if(!files.length){ X.toast("The clipboard has no picture, video or sound"); return; } var n=await bring(files,"Pasted"); X.toast(n?n+" added to Library › Pasted":"Could not add that"); }});
X.add({id:"lp_link",group:"Import",label:"Add from link…",hint:"direct file URL",run:async function(){
  var u=await Promise.resolve(window.amiyoAsk?window.amiyoAsk("Paste a direct link to a video, sound or picture file (https://…)",""):prompt("Direct file link",""));
  if(u==null) return; u=String(u).trim(); if(!/^https?:\/\//i.test(u)){ X.toast("Enter a link that starts with https://"); return; }
  X.toast("Downloading…",6000); var blob; try{ var r=await fetch(u); if(!r.ok) throw new Error("http "+r.status); blob=await r.blob(); }catch(e){ X.toast("That site does not allow downloading here. Save the file and import it instead.",4800); return; }
  var type=blob.type; if(!okType(type)){ var low=u.split("?")[0].toLowerCase(), m=low.match(/\.(mp4|webm|mov|m4v|mp3|wav|m4a|ogg|png|jpe?g|gif|webp)$/); var map={mp4:"video/mp4",webm:"video/webm",mov:"video/quicktime",m4v:"video/mp4",mp3:"audio/mpeg",wav:"audio/wav",m4a:"audio/mp4",ogg:"audio/ogg",png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",gif:"image/gif",webp:"image/webp"}; type=m?map[m[1]]:""; }
  if(!okType(type)){ X.toast("That link is not a video, sound or picture file"); return; }
  var base=decodeURIComponent((u.split("?")[0].split("/").pop()||"").slice(0,80))||("Web file "+C.stamp()+"."+extOf(type));
  var it=await C.importBlob(new File([blob],base,{type:type}),base,"Web"); X.toast(it?"Added to Library › Web":"Could not add that"); }});
try{ window.AMIYO_EDITOR_BUILD="libp-step07-paste-link"; }catch(e){}
})();

;
/* ==================== Script 665 id="amiyo-libp-step08" ==================== */
/* Library Pro step 8: image sequence to clip (like Premiere's "Image Sequence" import). Select two or more pictures, then
   Lib+ > "Image sequence to video…": they are played in name order (1, 2, 10 sort correctly) at the frame rate you choose and saved
   as one video in the bin "Sequences". It is recorded in real time, so a 120-picture sequence at 24 fps takes about 5 seconds. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.cap||X.seqMake) return;
var C=X.cap, busy=false;
function nat(a,b){ return String(a).localeCompare(String(b),undefined,{numeric:true}); }
X.seqMake=async function(list,fps){ if(busy){ X.toast("A sequence is already being made"); return null; }
  var imgs=list.filter(function(i){ return i.type==="image"; }).sort(function(a,b){ return nat(a.name,b.name); });
  if(imgs.length<2){ X.toast("Select at least two pictures"); return null; } if(imgs.length>3000){ X.toast("That is too many pictures (limit 3000)"); return null; }
  if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){ X.toast("This browser cannot make a video from pictures"); return null; }
  busy=true; fps=Math.min(60,Math.max(1,+fps||24));
  try{
    var firstBlob=await M.getBlob(imgs[0]); if(!firstBlob){ X.toast("The first picture is missing - relink it first"); return null; }
    var b0=await createImageBitmap(firstBlob), W=b0.width, H=b0.height, sc=Math.min(1,1920/Math.max(W,H)); W=Math.max(2,Math.round(W*sc/2)*2); H=Math.max(2,Math.round(H*sc/2)*2); try{ b0.close(); }catch(e){}
    var cv=document.createElement("canvas"); cv.width=W; cv.height=H; var cx=cv.getContext("2d"); cx.fillStyle="#000"; cx.fillRect(0,0,W,H);
    var stream=cv.captureStream(fps), mime=C.pickMime(true), chunks=[], r=mime?new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:8e6}):new MediaRecorder(stream);
    r.ondataavailable=function(e){ if(e.data&&e.data.size) chunks.push(e.data); };
    var stopped=new Promise(function(res){ r.onstop=res; }); r.start(500);
    var t0=performance.now(), used=0;
    for(var k=0;k<imgs.length;k++){ var blob=await M.getBlob(imgs[k]); if(blob){ try{ var bm=await createImageBitmap(blob), s=Math.min(W/bm.width,H/bm.height), w=bm.width*s, h=bm.height*s; cx.fillStyle="#000"; cx.fillRect(0,0,W,H); cx.drawImage(bm,(W-w)/2,(H-h)/2,w,h); try{ bm.close(); }catch(e){} used++; }catch(e){} }
      if(k%10===0) X.toast("Making sequence "+(k+1)+" of "+imgs.length+"…",1200);
      var wait=t0+(k+1)*1000/fps-performance.now(); if(wait>0) await C.sleep(wait); else await C.sleep(0); }
    await C.sleep(1000/fps+120); try{ r.stop(); }catch(e){} await stopped; stream.getTracks().forEach(function(t){ t.stop(); });
    var out=new Blob(chunks,{type:r.mimeType||mime||"video/webm"}); if(!out.size||!used){ X.toast("Nothing could be made from those pictures"); return null; }
    var base=imgs[0].name.replace(/\.[^.]+$/,"").replace(/[\d\s_\-.]+$/,"")||"Sequence", ext=/mp4/.test(out.type)?"mp4":"webm";
    var it=await C.importBlob(out,base+" sequence "+C.stamp()+"."+ext,"Sequences"); X.toast(it?"Sequence saved to Library › Sequences":"Saved to the project"); return it;
  }catch(e){ X.toast("Could not make the sequence"); try{ window.__swl&&window.__swl(e); }catch(_){} return null; }
  finally{ busy=false; } };
X.add({id:"lp_seq",group:"Import",label:"Image sequence to video…",hint:"pictures → clip",run:function(){
  var s=X.sel().filter(function(i){ return i.type==="image"; }); if(s.length<2){ X.toast("Select two or more pictures first (Select button)"); return; }
  var st='display:block;width:100%;margin:3px 0 10px;padding:8px;border-radius:6px;border:1px solid #3a3226;background:#1f1b16;color:#e6dfd0;font:14px system-ui';
  openModal("Image sequence to video",'<div style="font:12px system-ui"><p style="margin:0 0 10px">'+s.length+' pictures, played in name order. Length: about <b id="lpSqLen"></b> s.</p><label>Frame rate<select id="lpSqF" style="'+st+'"><option>6</option><option>12</option><option selected>24</option><option>25</option><option>30</option></select></label><button type="button" class="chip pri" id="lpSqGo">Make video</button></div>');
  var f=document.getElementById("lpSqF"), l=document.getElementById("lpSqLen"); function up(){ l.textContent=(s.length/+f.value).toFixed(1); } f.onchange=up; up();
  document.getElementById("lpSqGo").onclick=function(){ var v=+f.value; closeModal(); X.seqMake(s,v); }; }});
try{ window.AMIYO_EDITOR_BUILD="libp-step08-sequence"; }catch(e){}
})();

;
/* ==================== Script 666 id="amiyo-libp-step09" ==================== */
/* Library Pro step 9: sequence match check (like Premiere's "sequence settings don't match" warning, but before you edit).
   Lib+ > "Check against sequence settings…" compares your files (selected, or all) with the project size and frame rate and lists
   files that are the wrong shape (portrait vs landscape), a different aspect ratio, much smaller (would look soft) or much bigger
   than the project. "Match project to this file" sets the project size from one file. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.onRender||X.fitCheck) return;
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function gcd(a,b){ return b?gcd(b,a%b):a; }
function S(){ try{ return project.settings||{}; }catch(e){ return {}; } }
X.fitCheck=function(list){ var s=S(), W=+s.width||1280, H=+s.height||720, pa=W/H, out=[], ok=0;
  list.forEach(function(i){ if(i.type==="audio"||!(i.width>0&&i.height>0)) return; var why=[], a=i.width/i.height;
    if((a>1.02&&pa<0.98)||(a<0.98&&pa>1.02)) why.push(a<1?"portrait file in a landscape project":"landscape file in a portrait project");
    else if(Math.abs(a-pa)/pa>0.03) why.push("aspect "+(Math.round(a*100)/100)+" vs project "+(Math.round(pa*100)/100)+" (bars or crop)");
    var side=Math.max(i.width,i.height), ps=Math.max(W,H);
    if(side<ps*0.7) why.push("smaller than the project ("+i.width+"×"+i.height+") - may look soft");
    else if(side>ps*2.05) why.push("much bigger than the project ("+i.width+"×"+i.height+") - heavy to edit");
    if(+i.fps>0&&+s.fps>0&&Math.abs(i.fps-s.fps)>1.5&&i.type==="video") why.push("frame rate "+Math.round(i.fps*100)/100+" vs project "+s.fps);
    if(why.length) out.push({it:i,why:why}); else ok++; });
  return {W:W,H:H,fps:+s.fps||30,bad:out,ok:ok}; };
X.fitMatch=function(it){ if(!(it&&it.width>0&&it.height>0)) return false; var w=Math.round(it.width/2)*2, h=Math.round(it.height/2)*2, sc=Math.min(1,1920/Math.max(w,h)); w=Math.round(w*sc/2)*2; h=Math.round(h*sc/2)*2;
  var before=deepClone(serializableProject()), g=gcd(w,h), key=(w/g)+":"+(h/g), known={"16:9":16/9,"9:16":9/16,"4:5":.8,"1:1":1,"4:3":4/3,"3:4":.75,"21:9":21/9}, best=key;
  Object.keys(known).forEach(function(k){ if(Math.abs(known[k]-w/h)/known[k]<0.01) best=k; });
  project.settings.width=w; project.settings.height=h; project.settings.aspect=best;
  recordHistory("Match project to file",before,deepClone(serializableProject())); try{ renderAll(); }catch(e){} return best; };
X.add({id:"lp_fit",group:"Info",label:"Check against sequence settings…",hint:"size & fps",run:function(){
  var l=X.sel(); if(!l.length) l=M.items(); var r=X.fitCheck(l);
  if(!l.length){ X.toast("The Library is empty"); return; }
  var rows=r.bad.slice(0,40).map(function(b,k){ return '<div style="padding:7px 0;border-bottom:1px solid #2c261d"><div style="display:flex;gap:8px;align-items:center"><b style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(b.it.name)+'</b><button type="button" class="chip" data-m="'+k+'">Match project to this file</button></div><div style="opacity:.75;margin-top:2px">'+b.why.map(esc).join("<br>")+'</div></div>'; }).join("");
  openModal("Sequence match check",'<div id="lpFit" style="font:12.5px/1.4 system-ui"><p style="margin:0 0 8px">Project: <b>'+r.W+'×'+r.H+' · '+r.fps+' fps</b><br>'+r.ok+' file'+(r.ok===1?"":"s")+' fit well · <b>'+r.bad.length+'</b> to look at</p>'+(r.bad.length?'<div style="margin-bottom:8px"><button type="button" class="chip pri" id="lpFitSel">Select these '+r.bad.length+' files</button></div><div style="max-height:46vh;overflow:auto">'+rows+(r.bad.length>40?'<div style="opacity:.6;padding:6px 0">…and '+(r.bad.length-40)+' more</div>':"")+'</div>':'<p style="color:#9fd18b;margin:0">✓ Everything matches the project.</p>')+'</div>');
  var root=document.getElementById("lpFit"); if(!root) return;
  var sb=document.getElementById("lpFitSel"); if(sb) sb.onclick=function(){ if(X.selectIds) X.selectIds(r.bad.map(function(b){ return b.it.id; })); closeModal(); };
  root.onclick=function(e){ var b=e.target.closest("[data-m]"); if(!b) return; var k=X.fitMatch(r.bad[+b.dataset.m].it); if(k){ closeModal(); X.toast("Project set to "+k+" to match the file"); } else X.toast("That file has no size information"); }; }});
try{ window.AMIYO_EDITOR_BUILD="libp-step09-fit"; }catch(e){}
})();

;
/* ==================== Script 667 id="amiyo-libp-step10" ==================== */
/* Library Pro step 10: big-file manager. Lib+ > "Big files…" shows the "edit from disk" limit (files over it are played from your disk and
   not copied into browser storage), lets you change it, lists your largest files, shows browser storage use, and can ask the browser
   to keep your data safe (persistent storage). */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.onRender||X.big) return;
var KEY="amiyo_bigfile_mb";
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function sz(b){ b=+b||0; return b<1024?b+" B":b<1048576?Math.round(b/1024)+" KB":b<1073741824?(b/1048576).toFixed(1)+" MB":(b/1073741824).toFixed(2)+" GB"; }
function limitMB(){ try{ var m=+localStorage.getItem(KEY); return m>0?m:1500; }catch(e){ return 1500; } }
X.big={limitMB:limitMB,
  list:function(){ var lim=limitMB()*1048576; return M.items().filter(function(i){ return !i.isSubclip&&(+i.size||0)>=lim; }).sort(function(a,b){ return b.size-a.size; }); },
  setLimit:function(mb){ mb=Math.round(+mb); if(!(mb>=100&&mb<=50000)) return false; try{ localStorage.setItem(KEY,String(mb)); }catch(e){ return false; } return true; }};
async function est(){ try{ if(navigator.storage&&navigator.storage.estimate){ var e=await navigator.storage.estimate(); var p=navigator.storage.persisted?await navigator.storage.persisted():null; return {use:e.usage||0,quota:e.quota||0,persisted:p}; } }catch(e){} return null; }
X.add({id:"lp_big",group:"Info",label:"Big files…",hint:"edit from disk",run:async function(){
  var lim=limitMB(), big=X.big.list(), all=M.items(), tot=all.reduce(function(a,i){ return a+(i.isSubclip?0:(+i.size||0)); },0), e=await est();
  var rows=big.slice(0,25).map(function(i){ return '<div style="display:flex;gap:8px;padding:5px 0;border-bottom:1px solid #2c261d"><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(i.name)+'</span><b>'+sz(i.size)+'</b></div>'; }).join("");
  var inp='width:90px;padding:7px;border-radius:6px;border:1px solid #3a3226;background:#1f1b16;color:#e6dfd0;font:14px system-ui';
  openModal("Big files",'<div id="lpBig" style="font:12.5px/1.45 system-ui"><p style="margin:0 0 8px">Files over <b>'+(lim>=1000?(lim/1024).toFixed(1)+" GB":lim+" MB")+'</b> are played and edited straight from your disk. They are not copied into browser storage, and tools that would read the whole file stop with a clear message.</p>'+
    '<div style="display:flex;gap:6px;align-items:center;margin-bottom:10px"><input id="lpBigMb" type="number" min="100" max="50000" step="100" value="'+lim+'" style="'+inp+'"> MB <button type="button" class="chip" id="lpBigSet">Save limit</button></div>'+
    '<p style="margin:0 0 6px">Library: <b>'+all.length+'</b> files · <b>'+sz(tot)+'</b> in total'+(e&&e.quota?'<br>Browser storage: '+sz(e.use)+' of '+sz(e.quota)+' ('+Math.round(e.use/e.quota*100)+'%)'+(e.persisted===true?" · protected":e.persisted===false?" · not protected":""):"")+'</p>'+
    (e&&e.persisted===false?'<button type="button" class="chip" id="lpBigKeep" style="margin-bottom:8px">Ask browser to keep my data safe</button>':"")+
    '<p style="margin:8px 0 4px"><b>'+big.length+'</b> file'+(big.length===1?"":"s")+' over the limit'+(big.length?' <button type="button" class="chip" id="lpBigSel" style="margin-left:6px">Select them</button>':"")+'</p><div style="max-height:30vh;overflow:auto">'+rows+(big.length>25?'<div style="opacity:.6;padding:5px 0">…and '+(big.length-25)+' more</div>':"")+'</div><p style="opacity:.65;margin:10px 0 0">A new limit applies to files you import from now on.</p></div>');
  var root=document.getElementById("lpBig"); if(!root) return;
  document.getElementById("lpBigSet").onclick=function(){ var ok=X.big.setLimit(document.getElementById("lpBigMb").value); X.toast(ok?"Limit saved":"Enter a number from 100 to 50000"); if(ok) closeModal(); };
  var k=document.getElementById("lpBigKeep"); if(k) k.onclick=async function(){ var ok=false; try{ ok=await navigator.storage.persist(); }catch(e){} X.toast(ok?"Your browser will keep this data":"The browser did not agree (it may ask after more use of the site)",3600); closeModal(); };
  var s=document.getElementById("lpBigSel"); if(s) s.onclick=function(){ if(X.selectIds) X.selectIds(big.map(function(i){ return i.id; })); closeModal(); }; }});
try{ window.AMIYO_EDITOR_BUILD="libp-step10-bigfiles"; }catch(e){}
})();

;
/* ==================== Script 668 id="amiyo-libp-step11" ==================== */
/* Library Pro step 11: sort and view memory for each bin (like Premiere remembering the view of every bin).
   Every bin remembers its own sort order, direction, list or grid view and thumbnail size, and brings them back when you open it.
   Lib+ > "Remember view per bin" turns this on or off; "Forget saved bin views" resets all bins. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.onRender||X.binView) return;
var KEY="amiyo_lp_binview", ON="amiyo_lp_binview_on", S=M.state, last=null, busy=false;
function on(){ try{ return localStorage.getItem(ON)!=="0"; }catch(e){ return true; } }
function load(){ try{ var o=JSON.parse(localStorage.getItem(KEY)||"{}"); return o&&typeof o==="object"?o:{}; }catch(e){ return {}; } }
function save(o){ try{ localStorage.setItem(KEY,JSON.stringify(o)); }catch(e){} }
function cur(){ return {sort:S.sort,desc:!!S.desc,view:S.view,size:S.size}; }
function same(a,b){ return a.sort===b.sort&&!!a.desc===!!b.desc&&a.view===b.view&&+a.size===+b.size; }
function valid(s){ return s&&typeof s.sort==="string"&&(s.view==="grid"||s.view==="list")&&s.size>=1&&s.size<=3; }
X.binView={on:on,get:function(){ return load(); }};
X.onRender(function(){ if(busy||!on()||!S.loaded) return; var b=S.bin||"all", m=load();
  if(b!==last){ last=b; var s=m[b]; if(valid(s)&&!same(s,cur())){ S.sort=s.sort; S.desc=!!s.desc; S.view=s.view; S.size=+s.size; busy=true; try{ M.render(); }catch(e){} setTimeout(function(){ busy=false; },60); return; } }
  var c=cur(); if(!m[b]||!same(m[b],c)){ m[b]=c; save(m); } });
X.add({id:"lp_binview",group:"View",label:"Remember view per bin: on/off",hint:"sort, list, size",run:function(){ var v=!on(); try{ localStorage.setItem(ON,v?"1":"0"); }catch(e){} last=null; X.toast(v?"Each bin now remembers its view":"Bins no longer remember their view"); }});
X.add({id:"lp_binview_reset",group:"View",label:"Forget saved bin views",run:function(){ try{ localStorage.removeItem(KEY); }catch(e){} X.toast("Saved bin views cleared"); }});
try{ window.AMIYO_EDITOR_BUILD="libp-step11-binview"; }catch(e){}
})();

;
/* ==================== Script 669 id="amiyo-libp-step12" ==================== */
/* Library Pro step 12: merge duplicates. Lib+ > "Merge duplicates…" finds copies (same type, size, length and picture size), keeps the
   best one of each group (most used, then best rating, then most information) and copies the tags, rating, favorite, label, notes,
   log, clip markers, bin and usage counts of the others onto it before removing them. Nothing is removed until you confirm. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.onRender||X.merge||!M.remove) return;
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function sz(b){ b=+b||0; return b<1048576?Math.round(b/1024)+" KB":b<1073741824?(b/1048576).toFixed(1)+" MB":(b/1073741824).toFixed(2)+" GB"; }
function info(i){ return (i.tags&&i.tags.length?1:0)+(i.note?1:0)+(i.rating?1:0)+(i.fav?1:0)+(i.label?1:0)+(i.bin?1:0)+(i.scene||i.shot||i.take||i.logNote?1:0)+((i.cmarks&&i.cmarks.length)?1:0); }
function groups(){ var m={}; M.items().forEach(function(i){ if(!i.size||i.isSubclip) return; var k=[i.type,i.size,Math.round((+i.duration||0)*10),i.width||0,i.height||0].join("|"); (m[k]=m[k]||[]).push(i); });
  return Object.keys(m).map(function(k){ return m[k]; }).filter(function(g){ return g.length>1; }); }
function best(g){ return g.slice().sort(function(a,b){ return (b.uses||0)-(a.uses||0)||(b.rating||0)-(a.rating||0)||info(b)-info(a)||(a.addedAt||0)-(b.addedAt||0); })[0]; }
function fold(keep,others){ others.forEach(function(o){
  var tg=(keep.tags||[]).slice(); (o.tags||[]).forEach(function(t){ if(!tg.some(function(x){ return String(x).toLowerCase()===String(t).toLowerCase(); })) tg.push(t); }); if(tg.length) keep.tags=tg;
  if((o.rating||0)>(keep.rating||0)) keep.rating=o.rating; if(o.fav) keep.fav=true; if(!keep.label&&o.label) keep.label=o.label; if(!keep.bin&&o.bin) keep.bin=o.bin;
  if(o.note&&keep.note!==o.note){ keep.note=keep.note?(keep.note.indexOf(o.note)>=0?keep.note:keep.note+"\n"+o.note):o.note; }
  ["scene","shot","take","logNote"].forEach(function(f){ if(!keep[f]&&o[f]) keep[f]=o[f]; }); if(o.good) keep.good=true;
  if(o.cmarks&&o.cmarks.length){ var cm=(keep.cmarks||[]).slice(); o.cmarks.forEach(function(m){ if(!cm.some(function(x){ return Math.abs(x.t-m.t)<.05&&x.text===m.text; })) cm.push(m); }); cm.sort(function(a,b){ return a.t-b.t; }); keep.cmarks=cm; }
  keep.uses=(keep.uses||0)+(o.uses||0); keep.imports=(keep.imports||0)+(o.imports||0); keep.lastUsed=Math.max(keep.lastUsed||0,o.lastUsed||0)||undefined; if(keep.lastUsed===undefined) delete keep.lastUsed; }); }
X.merge={groups:groups,best:best,fold:fold};
X.mergeRun=async function(gs){ var keeps=[], drop=[]; gs.forEach(function(g){ var k=best(g), o=g.filter(function(i){ return i!==k; }); fold(k,o); keeps.push(k); o.forEach(function(i){ drop.push(i.id); }); });
  X.save(keeps); await M.remove(drop); try{ M.state.sel.clear(); M.render(); }catch(e){} return drop.length; };
X.add({id:"lp_merge",group:"Clean up",label:"Merge duplicates…",hint:"keep best",run:function(){ var gs=groups(); if(!gs.length){ X.toast("No duplicates found"); return; }
  var extra=gs.reduce(function(n,g){ return n+g.length-1; },0), freed=gs.reduce(function(n,g){ return n+(g.length-1)*(+g[0].size||0); },0);
  var rows=gs.slice(0,30).map(function(g){ var k=best(g); return '<div style="padding:6px 0;border-bottom:1px solid #2c261d"><b>'+esc(k.name)+'</b> <span style="opacity:.65">· '+g.length+' copies · '+sz(k.size)+' each</span><div style="opacity:.7;font-size:11.5px">Keeps: '+esc(k.name)+'<br>Removes: '+g.filter(function(i){ return i!==k; }).map(function(i){ return esc(i.name); }).join(", ")+'</div></div>'; }).join("");
  openModal("Merge duplicates",'<div id="lpMg" style="font:12.5px/1.4 system-ui"><p style="margin:0 0 8px"><b>'+extra+'</b> extra cop'+(extra===1?"y":"ies")+' in '+gs.length+' group'+(gs.length===1?"":"s")+' · <b>'+sz(freed)+'</b> can be freed</p><div style="max-height:44vh;overflow:auto">'+rows+(gs.length>30?'<div style="opacity:.6;padding:6px 0">…and '+(gs.length-30)+' more groups</div>':"")+'</div><div style="margin-top:10px"><button type="button" class="chip pri" id="lpMgGo">Merge and remove extras</button></div></div>');
  document.getElementById("lpMgGo").onclick=async function(){ var ok=window.amiyoOk?await window.amiyoOk("Merge "+gs.length+" group"+(gs.length===1?"":"s")+" and remove "+extra+" file"+(extra===1?"":"s")+" from your Library?\nTags, ratings and notes are kept on the best copy. Anything in the open project stays there.",{okLabel:"Merge",danger:true}):confirm("Merge duplicates?"); if(!ok) return; closeModal(); var n=await X.mergeRun(gs); X.toast(n+" duplicate"+(n===1?"":"s")+" merged"); }; }});
try{ window.AMIYO_EDITOR_BUILD="libp-step12-merge"; }catch(e){}
})();

;
/* ==================== Script 670 id="amiyo-libp-step13" ==================== */
/* Library Pro step 13: Library snapshots. Lib+ > "Save snapshot…" stores a named copy of all your organization (bins, names, ratings,
   labels, tags, favorites, notes, log, clip markers, In/Out marks, pins) - not the files themselves. "Restore snapshot…" brings one
   back (a safety snapshot "Before restore" is saved first) and "Snapshot list" lets you delete old ones. Keeps the newest 8. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.onRender||X.snap) return;
var KEY="amiyo_lp_snaps", MAX=8, F=["name","rating","label","tags","fav","bin","note","scene","shot","take","logNote","good","cmarks","markIn","markOut","pin"];
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function ask(msg,def){ return Promise.resolve(window.amiyoAsk?window.amiyoAsk(msg,def||""):prompt(msg,def||"")); }
function load(){ try{ var a=JSON.parse(localStorage.getItem(KEY)||"[]"); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
function store(a){ try{ localStorage.setItem(KEY,JSON.stringify(a)); return true; }catch(e){ return false; } }
function when(t){ try{ return new Date(t).toLocaleString(); }catch(e){ return ""; } }
X.snap={list:load,
  make:function(name){ var items={}; M.items().forEach(function(i){ var o={}; F.forEach(function(f){ if(i[f]!==undefined) o[f]=i[f]; }); items[i.id]=o; });
    var s={id:"snap_"+Date.now().toString(36),name:String(name||"Snapshot").slice(0,60),at:Date.now(),bins:JSON.parse(JSON.stringify(M.state.bins||[])),items:items,n:Object.keys(items).length};
    var a=load(); a.push(s); while(a.length>MAX) a.shift(); if(!store(a)){ a.shift(); if(!store(a)){ return null; } } return s; },
  restore:function(id){ var a=load(), s=a.find(function(x){ return x.id===id; }); if(!s) return 0; X.snap.make("Before restore"); var list=[], n=0;
    M.items().forEach(function(i){ var o=s.items[i.id]; if(!o) return; F.forEach(function(f){ if(o[f]!==undefined) i[f]=JSON.parse(JSON.stringify(o[f])); else delete i[f]; }); list.push(i); n++; });
    var st=M.state; st.bins.length=0; (s.bins||[]).forEach(function(b){ st.bins.push(b); }); if(st.bin!=="all"&&!st.bins.some(function(b){ return b.id===st.bin; })) st.bin="all"; try{ M.saveBins(); }catch(e){}
    X.save(list); return n; },
  del:function(id){ store(load().filter(function(x){ return x.id!==id; })); }};
function dlg(mode){ var a=load().slice().reverse(); if(!a.length){ X.toast("No snapshots yet - use Save snapshot first"); return; }
  var rows=a.map(function(s){ return '<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid #2c261d"><div style="flex:1;min-width:0"><b style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(s.name)+'</b><span style="opacity:.65;font-size:11.5px">'+esc(when(s.at))+' · '+s.n+' files · '+(s.bins||[]).length+' bins</span></div>'+(mode==="restore"?'<button type="button" class="chip pri" data-r="'+s.id+'">Restore</button>':"")+'<button type="button" class="chip danger" data-d="'+s.id+'" aria-label="Delete snapshot">✕</button></div>'; }).join("");
  openModal(mode==="restore"?"Restore snapshot":"Snapshots",'<div id="lpSn" style="font:12.5px system-ui;max-height:56vh;overflow:auto">'+rows+'</div>');
  document.getElementById("lpSn").onclick=async function(e){ var b=e.target.closest("button"); if(!b) return;
    if(b.dataset.d){ X.snap.del(b.dataset.d); closeModal(); dlg(mode); return; }
    if(b.dataset.r){ var ok=window.amiyoOk?await window.amiyoOk("Restore this snapshot?\nYour current organization is saved first as “Before restore”.",{okLabel:"Restore"}):true; if(!ok) return; closeModal(); var n=X.snap.restore(b.dataset.r); X.toast("Restored "+n+" file"+(n===1?"":"s")); } }; }
X.add({id:"lp_snap_save",group:"Snapshots",label:"Save snapshot…",hint:"backup",run:async function(){ var def="Snapshot "+new Date().toLocaleDateString(); var n=await ask("Name this snapshot",def); if(n==null) return; var s=X.snap.make(String(n).trim()||def); X.toast(s?"Snapshot saved ("+s.n+" files)":"Not enough browser space to save a snapshot",3200); }});
X.add({id:"lp_snap_restore",group:"Snapshots",label:"Restore snapshot…",run:function(){ dlg("restore"); }});
X.add({id:"lp_snap_list",group:"Snapshots",label:"Snapshot list…",run:function(){ dlg("list"); }});
try{ window.AMIYO_EDITOR_BUILD="libp-step13-snapshots"; }catch(e){}
})();

;
/* ==================== Script 671 id="amiyo-libp-step14" ==================== */
/* Library Pro step 14: reveal in timeline. Select a file (or click its card) and choose Lib+ > "Reveal in timeline…":
   a list of every clip on the timeline that uses this file, with its track and time. Tap one to jump the playhead there and select it. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.onRender||X.reveal) return;
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function tc(t){ t=Math.max(0,+t||0); var m=Math.floor(t/60), s=t-m*60; return m+":"+(s<10?"0":"")+s.toFixed(1); }
function target(){ var s=X.sel(); if(s.length) return s[0]; var a=document.activeElement, c=a&&a.closest?a.closest("#mlibBody [data-lib]"):null; return c?X.item(c.dataset.lib):null; }
X.reveal=function(it){ var out=[]; try{ var ids={}; Object.keys(project.assets||{}).forEach(function(k){ var a=project.assets[k]; if(a&&(a.libId===it.id||(it.blobKey&&a.blobKey===it.blobKey))) ids[k]=1; });
  project.tracks.forEach(function(t,ti){ t.clips.forEach(function(c){ if(c.assetId&&ids[c.assetId]) out.push({clip:c,track:t,ti:ti}); }); }); }catch(e){}
  return out.sort(function(a,b){ return a.clip.start-b.clip.start; }); };
X.add({id:"lp_reveal",group:"Timeline",label:"Reveal in timeline…",hint:"where is it used",run:function(){ var it=target(); if(!it){ X.toast("Click or select a file first"); return; }
  var l=X.reveal(it); if(!l.length){ X.toast("This file is not on the timeline"); return; }
  var tot=l.reduce(function(n,x){ return n+x.clip.duration; },0);
  openModal("Used in timeline",'<div id="lpRv" style="font:12.5px system-ui"><p style="margin:0 0 8px"><b>'+esc(it.name)+'</b><br>'+l.length+' clip'+(l.length===1?"":"s")+' · '+tc(tot)+' on the timeline</p><div style="max-height:46vh;overflow:auto">'+l.map(function(x,k){ return '<button type="button" class="chip" data-k="'+k+'" style="display:flex;width:100%;justify-content:space-between;margin:0 0 6px;padding:9px 10px"><span>'+esc(x.track.name||("Track "+(x.ti+1)))+'</span><b>'+tc(x.clip.start)+' – '+tc(x.clip.start+x.clip.duration)+'</b></button>'; }).join("")+'</div></div>');
  document.getElementById("lpRv").onclick=function(e){ var b=e.target.closest("[data-k]"); if(!b) return; var x=l[+b.dataset.k]; closeModal(); try{ selectedClipId=x.clip.id; selectedTrackId=x.track.id; setCurrentTime(x.clip.start); renderAll(); }catch(err){ try{ setCurrentTime(x.clip.start); }catch(_){} } }; }});
try{ window.AMIYO_EDITOR_BUILD="libp-step14-reveal"; }catch(e){}
})();

;
/* ==================== Script 672 id="amiyo-libp-step15" ==================== */
/* Library Pro step 15: replace footage (like Premiere's Replace Footage). Select one file, choose Lib+ > "Replace file…" and pick the new
   file (for example a better export). The Library entry keeps its name, rating, tags, bin, notes, log and markers; size, length,
   picture size and the thumbnail are refreshed. The new file must be the same kind (video, sound or picture). */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.onRender||X.replaceFile) return;
function target(){ var s=X.sel(); if(s.length) return s[0]; var a=document.activeElement, c=a&&a.closest?a.closest("#mlibBody [data-lib]"):null; return c?X.item(c.dataset.lib):null; }
function kind(f){ var t=f.type||""; return /^video\//.test(t)?"video":/^audio\//.test(t)?"audio":/^image\//.test(t)?"image":""; }
function probe(file,k){ return new Promise(function(res){ var url=URL.createObjectURL(file), out={}, done=false;
  function fin(){ if(done) return; done=true; try{ URL.revokeObjectURL(url); }catch(e){} res(out); }
  if(k==="image"){ var im=new Image(); im.onload=function(){ out.width=im.naturalWidth; out.height=im.naturalHeight; out.thumb=thumb(im,im.naturalWidth,im.naturalHeight); fin(); }; im.onerror=fin; im.src=url; setTimeout(fin,8000); return; }
  var v=document.createElement(k==="video"?"video":"audio"); v.preload="metadata"; v.muted=true; v.playsInline=true;
  v.onloadedmetadata=function(){ out.duration=isFinite(v.duration)?v.duration:0; if(k==="video"){ out.width=v.videoWidth; out.height=v.videoHeight; try{ v.currentTime=Math.min(Math.max(.1,out.duration*.1),Math.max(.1,out.duration-.1)); }catch(e){ fin(); } } else fin(); };
  v.onseeked=function(){ try{ out.thumb=thumb(v,v.videoWidth,v.videoHeight); }catch(e){} fin(); }; v.onerror=fin; v.src=url; setTimeout(fin,10000); }); }
function thumb(el,w,h){ try{ if(!w||!h) return undefined; var s=Math.min(1,240/Math.max(w,h)), c=document.createElement("canvas"); c.width=Math.max(1,Math.round(w*s)); c.height=Math.max(1,Math.round(h*s)); c.getContext("2d").drawImage(el,0,0,c.width,c.height); return c.toDataURL("image/jpeg",.7); }catch(e){ return undefined; } }
X.replaceFile=async function(it,file){ var k=kind(file); if(!k||k!==it.type){ X.toast("Pick a "+it.type+" file to replace this one"); return false; }
  if(typeof window.amiyoPutBlob!=="function"||!it.blobKey){ X.toast("This file cannot be replaced"); return false; }
  X.toast("Replacing…",3000); var meta=await probe(file,k);
  try{ await window.amiyoPutBlob(it.blobKey,file); }catch(e){ X.toast("Could not store the new file"); return false; }
  it.size=file.size; it.mime=file.type||it.mime; if(meta.duration){ it.duration=meta.duration; if(it.srcDur) it.srcDur=meta.duration; if(it.markOut!=null&&it.markOut>meta.duration) delete it.markOut; if(it.markIn!=null&&it.markIn>=meta.duration) delete it.markIn; }
  if(meta.width){ it.width=meta.width; it.height=meta.height; } if(meta.thumb) it.thumb=meta.thumb; it.replacedAt=Date.now(); try{ M.state.missing.delete(it.id); }catch(e){}
  X.save([it]); X.toast("File replaced. Clips already on the timeline may need a reload to show it.",4200); return true; };
X.add({id:"lp_replace",group:"Repair",label:"Replace file…",hint:"keeps notes & tags",run:function(){ var it=target(); if(!it){ X.toast("Click or select one file first"); return; }
  var inp=document.createElement("input"); inp.type="file"; inp.accept=it.type==="video"?"video/*":it.type==="audio"?"audio/*":"image/*"; inp.style.display="none"; document.body.appendChild(inp);
  inp.onchange=function(){ var f=inp.files&&inp.files[0]; inp.remove(); if(f) X.replaceFile(it,f); }; inp.click(); }});
try{ window.AMIYO_EDITOR_BUILD="libp-step15-replace"; }catch(e){}
})();

;
/* ==================== Script 673 id="amiyo-libp-step16" ==================== */
/* Library Pro step 16: more thumbnail sizes. Adds a "tiny" size (4 per row) below the three the slider has, and lets you change size from
   the keyboard: + (bigger) and - (smaller) while a Library card or the Library list is focused, or Lib+ > "Thumbnails bigger/smaller/tiny".
   Hold Ctrl/Cmd + mouse wheel over the Library to zoom the thumbnails too. The choice is remembered. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.onRender||X.zoom) return;
var TK="amiyo_lp_tiny", SK="amiyo_media_size", S=M.state;
function tiny(){ try{ return localStorage.getItem(TK)==="1"; }catch(e){ return false; } }
function setTiny(v){ try{ localStorage.setItem(TK,v?"1":"0"); }catch(e){} }
function setSize(n){ S.size=n; try{ localStorage.setItem(SK,String(n)); }catch(e){} }
var st=document.createElement("style"); st.textContent="#mlibBody .mlib-grid.v-grid.lp-tiny{grid-template-columns:repeat(4,minmax(0,1fr));gap:5px}#mlibBody .mlib-grid.v-grid.lp-tiny .mthumb{height:46px}#mlibBody .mlib-grid.v-grid.lp-tiny .mmeta span,#mlibBody .mlib-grid.v-grid.lp-tiny .lpLog,#mlibBody .mlib-grid.v-grid.lp-tiny .mdot,#mlibBody .mlib-grid.v-grid.lp-tiny .mlib-add{display:none}#mlibBody .mlib-grid.v-grid.lp-tiny .mmeta b{font-size:10px}";
document.head.appendChild(st);
function apply(){ var g=document.querySelector("#mlibBody .mlib-grid"); if(g) g.classList.toggle("lp-tiny",tiny()&&S.view!=="list"); }
X.onRender(apply); setTimeout(apply,500);
X.zoom={level:function(){ return tiny()?0:S.size; },
  bigger:function(){ if(tiny()){ setTiny(false); setSize(1); } else if(S.size<3) setSize(S.size+1); else { X.toast("Biggest size"); return; } X.zoomMsg(); try{ M.render(); }catch(e){} },
  smaller:function(){ if(tiny()){ X.toast("Smallest size"); return; } if(S.size>1) setSize(S.size-1); else setTiny(true); X.zoomMsg(); try{ M.render(); }catch(e){} },
  tiny:function(){ setTiny(true); X.zoomMsg(); try{ M.render(); }catch(e){} }};
X.zoomMsg=function(){ X.toast("Thumbnails: "+["tiny","small","medium","large"][X.zoom.level()],1200); };
document.addEventListener("keydown",function(e){ if(e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey) return; var t=e.target; if(!t||!t.closest||!t.closest("#mlibBody")) return; if(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable) return;
  if(e.key==="+"||e.key==="="){ e.preventDefault(); X.zoom.bigger(); } else if(e.key==="-"||e.key==="_"){ e.preventDefault(); X.zoom.smaller(); } });
var wt=0; document.addEventListener("wheel",function(e){ if(!(e.ctrlKey||e.metaKey)) return; var t=e.target; if(!t||!t.closest||!t.closest("#mlibBody")) return; e.preventDefault(); var n=Date.now(); if(n-wt<220) return; wt=n; if(e.deltaY<0) X.zoom.bigger(); else X.zoom.smaller(); },{passive:false});
X.add({id:"lp_zoom_up",group:"View",label:"Thumbnails bigger",hint:"+",run:function(){ X.zoom.bigger(); }});
X.add({id:"lp_zoom_down",group:"View",label:"Thumbnails smaller",hint:"-",run:function(){ X.zoom.smaller(); }});
X.add({id:"lp_zoom_tiny",group:"View",label:"Thumbnails tiny (4 per row)",run:function(){ X.zoom.tiny(); }});
try{ window.AMIYO_EDITOR_BUILD="libp-step16-zoom"; }catch(e){}
})();

;
/* ==================== Script 674 id="amiyo-libp-step17" ==================== */
/* Library Pro step 17: loudness scan. Select videos or sounds, then Lib+ > "Scan loudness…". Each file's peak and average level (in dB) is
   measured from its audio and stored. The report marks files that clip (peak near 0 dB), are very quiet, or have no sound,
   and can select them. Files over 250 MB are skipped because the audio must be decoded in memory. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.onRender||X.loud) return;
var MAXB=250*1048576, busy=false;
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function db(v){ return v<=1e-6?-120:20*Math.log10(v); }
function tick(){ return new Promise(function(r){ setTimeout(r,0); }); }
function status(l){ if(!l) return ""; if(l.silent) return "silent"; if(l.peak>=-0.3) return "clipped"; if(l.rms<-32) return "quiet"; return "ok"; }
X.loud={status:status,
  measure:async function(it){ var blob=await M.getBlob(it); if(!blob) return {err:"missing"}; if(blob.size>MAXB) return {err:"big"};
    var AC=window.AudioContext||window.webkitAudioContext; if(!AC) return {err:"nosupport"}; var ctx=new AC(), buf; try{ buf=await ctx.decodeAudioData(await blob.arrayBuffer()); }catch(e){ try{ ctx.close(); }catch(_){} return {err:"nosound"}; }
    var ch=buf.numberOfChannels, n=buf.length, peak=0, sum=0, cnt=0; for(var c=0;c<ch;c++){ var d=buf.getChannelData(c); for(var i=0;i<n;i++){ var a=d[i]<0?-d[i]:d[i]; if(a>peak) peak=a; sum+=d[i]*d[i]; if((i&0x3ffff)===0x3ffff) await tick(); } cnt+=n; }
    try{ ctx.close(); }catch(e){} var rms=Math.sqrt(sum/Math.max(1,cnt)); return {peak:Math.round(db(peak)*10)/10,rms:Math.round(db(rms)*10)/10,silent:peak<1e-4,at:Date.now()}; },
  run:async function(list){ if(busy){ X.toast("A scan is already running"); return null; } busy=true; var res=[], skipped=0;
    try{ var l=list.filter(function(i){ return i.type==="audio"||i.type==="video"; }); for(var k=0;k<l.length;k++){ X.toast("Scanning "+(k+1)+" of "+l.length+"…",1500); var r=await X.loud.measure(l[k]);
        if(r.err){ if(r.err==="nosound"){ l[k].loud={silent:true,peak:-120,rms:-120,at:Date.now()}; res.push(l[k]); } else skipped++; } else { l[k].loud=r; res.push(l[k]); } }
      X.save(res); } finally{ busy=false; } return {done:res,skipped:skipped}; }};
function report(list){ var rows=list.slice().sort(function(a,b){ return (b.loud.peak)-(a.loud.peak); }).slice(0,60).map(function(i){ var s=status(i.loud), ic=s==="ok"?"✓":s==="clipped"?"⚠":s==="quiet"?"🔈":"∅", col=s==="ok"?"#9fd18b":s==="clipped"?"#ff8a7a":"#e6c84a";
    return '<div style="display:flex;gap:8px;align-items:center;padding:5px 0;border-bottom:1px solid #2c261d"><span style="color:'+col+';width:18px">'+ic+'</span><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(i.name)+'</span><span style="opacity:.8;font-variant-numeric:tabular-nums">'+(i.loud.silent?"no sound":"peak "+i.loud.peak+" · avg "+i.loud.rms)+'</span></div>'; }).join("");
  var cl=list.filter(function(i){ return status(i.loud)==="clipped"; }).length, qu=list.filter(function(i){ return status(i.loud)==="quiet"; }).length;
  openModal("Loudness (dB)",'<div id="lpLd" style="font:12.5px system-ui"><p style="margin:0 0 8px">'+list.length+' scanned · <b>'+cl+'</b> clipped · <b>'+qu+'</b> very quiet</p><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px"><button type="button" class="chip" data-s="clipped">Select clipped</button><button type="button" class="chip" data-s="quiet">Select quiet</button></div><div style="max-height:44vh;overflow:auto">'+rows+'</div></div>');
  document.getElementById("lpLd").onclick=function(e){ var b=e.target.closest("[data-s]"); if(!b) return; var ids=list.filter(function(i){ return status(i.loud)===b.dataset.s; }).map(function(i){ return i.id; }); if(!ids.length){ X.toast("None found"); return; } if(X.selectIds) X.selectIds(ids); closeModal(); }; }
X.add({id:"lp_loud",group:"Info",label:"Scan loudness…",hint:"peak / average dB",run:async function(){ var s=X.sel().filter(function(i){ return i.type!=="image"; }); if(!s.length){ X.toast("Select videos or sounds first (Select button)"); return; }
  var r=await X.loud.run(s); if(!r) return; if(!r.done.length){ X.toast(r.skipped?"Those files are too big or missing to scan":"Nothing to scan"); return; } report(r.done); if(r.skipped) X.toast(r.skipped+" skipped (too big or missing)",3200); }});
X.add({id:"lp_loud_last",group:"Info",label:"Show saved loudness results",run:function(){ var l=M.items().filter(function(i){ return i.loud; }); if(!l.length){ X.toast("No scans yet"); return; } report(l); }});
try{ window.AMIYO_EDITOR_BUILD="libp-step17-loudness"; }catch(e){}
})();

;
/* ==================== Script 675 id="amiyo-libq-step01-ctxmenu" ==================== */
/* Library Premiere step 1: full right-click menu. Right-click (or long-press) a file in the Library and the menu now also has the tools that were only in Lib+:
   Quick look, Properties, Technical info, Insert / Overwrite at the playhead, Reveal in timeline, Log, Clip markers, Tags, Pin, Replace file,
   plus one-tap star rating and colour label rows. Right-click selects the file first (like Premiere), and works on all selected files when it is one of them. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!M||X.ctxPlus) return; X.ctxPlus=1;
var last="";
function note(e){ var t=e.target, c=t&&t.closest&&t.closest(".mcard[data-lib]"); if(c) last=c.dataset.lib; }
["pointerdown","contextmenu","touchstart","focusin"].forEach(function(n){ document.addEventListener(n,note,true); });
X.css("libq-ctx-css",".mctx{max-height:min(78vh,640px);overflow-y:auto;overscroll-behavior:contain}.mctx .lq-h{padding:8px 10px 3px;font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:#847a6b;font-weight:700}.mctx .lq-row{display:flex;gap:2px;padding:2px 4px}.mctx .lq-row button{min-height:38px;flex:1;padding:4px 2px;text-align:center;font-size:13px}.mctx .lq-dot{display:inline-block;width:15px;height:15px;border-radius:50%;vertical-align:middle}.mctx .lq-hr{height:1px;background:#2e281f;margin:4px 6px}");
var HEX={red:"#e5534b",orange:"#e08a3c",yellow:"#e6c84a",green:"#4cae6a",blue:"#ef773b",purple:"#9a6ad6"};
/* [action id, label, only for one file, only for video/sound] */
var GROUPS=[
 ["Preview",[["lx_quick","Quick look",1,0],["lx_props","Properties…",0,0],["lw_tech","Technical info…",1,1]]],
 ["Timeline",[["lp_insert","Insert at playhead",1,0],["lp_overwrite","Overwrite at playhead",1,0],["lq_match","Match project to this file…",1,0],["lp_reveal","Reveal in timeline…",1,0]]],
 ["Organize",[["lp_log","Log (scene / shot / take)…",0,0],["lp_cm","Clip markers…",1,1],["lx_tag_add","Add tags…",0,0],["lw_pin","Pin to quick strip",0,0],["lp_replace","Replace file…",1,0],["lq_dup","Duplicate",0,0]]]
];
function findAct(id){ for(var i=0;i<X.items.length;i++) if(X.items[i].id===id) return X.items[i]; return null; }
function runAct(aid,ids){
  var act=findAct(aid); if(!act||!act.run){ X.toast("That tool is not available"); return; }
  var cur=M.state.sel, same=cur&&cur.size===ids.length&&ids.every(function(i){ return cur.has(i); });
  if(!same) X.selectIds(ids);
  setTimeout(function(){ try{ act.run(); }catch(err){ try{ window.__swl&&window.__swl(err); }catch(_){} X.toast("That tool could not start"); } },60);
}
function btn(k,html,title){ return '<button type="button" role="menuitem" data-lq="'+k+'"'+(title?' title="'+title+'" aria-label="'+title+'"':'')+'>'+html+'</button>'; }
function augment(m){
  if(m.classList.contains("lq-done")) return; m.classList.add("lq-done");
  var it=last&&X.item(last); if(!it) return;
  var sel=M.state.sel, ids=(sel&&sel.size&&sel.has(it.id))?Array.from(sel):[it.id], many=ids.length>1;
  var list=ids.map(function(i){ return X.item(i); }).filter(Boolean);
  var av=list.every(function(i){ return i.type!=="image"; });
  var h="";
  GROUPS.forEach(function(g){
    var rows=g[1].filter(function(a){ return !(a[2]&&many)&&!(a[3]&&!av)&&findAct(a[0]); });
    if(!rows.length) return;
    h+='<div class="lq-h">'+g[0]+'</div>'+rows.map(function(a){ return btn(a[0],a[1]); }).join("");
  });
  h+='<div class="lq-h">Rating</div><div class="lq-row">'+[1,2,3,4,5].map(function(n){ return btn("r"+n,"★"+n,"Rate "+n+" stars"); }).join("")+btn("r0","✕","Clear rating")+'</div>';
  h+='<div class="lq-h">Label</div><div class="lq-row">'+Object.keys(HEX).map(function(c){ return btn("l_"+c,'<i class="lq-dot" style="background:'+HEX[c]+'"></i>',"Label "+c); }).join("")+btn("l_","✕","Clear label")+'</div><div class="lq-hr"></div>';
  var wrap=document.createElement("div"); wrap.innerHTML=h;
  var del=m.querySelector('[data-ctx="del"]');
  var nodes=Array.prototype.slice.call(wrap.childNodes);
  nodes.forEach(function(n){ if(del) m.insertBefore(n,del); else m.appendChild(n); });
  m.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-lq]"); if(!b) return; e.stopPropagation();
    var k=b.dataset.lq; m.remove();
    if(/^r[0-5]$/.test(k)){ var n=+k[1]; list.forEach(function(i){ if(n) i.rating=n; else delete i.rating; }); X.save(list); X.toast(n?("Rated "+n+"★"):"Rating cleared"); }
    else if(k.indexOf("l_")===0){ var c=k.slice(2); X.label(list,c); X.toast(c?("Labeled "+c):"Label cleared"); }
    else runAct(k,ids);
  });
  var top=parseFloat(m.style.top); if(isFinite(top)) m.style.top=Math.max(6,Math.min(top,innerHeight-m.offsetHeight-6))+"px";
}
new MutationObserver(function(ms){ ms.forEach(function(r){ r.addedNodes.forEach(function(n){ if(n.nodeType===1&&n.classList&&n.classList.contains("mctx")) augment(n); }); }); }).observe(document.body,{childList:true});
X.add({id:"lq_ctx_info",group:"Info",label:"Right-click menu: what is in it",run:function(){ openModal("Right-click menu",'<div style="font:12.5px/1.8 system-ui">Right-click (or long-press the name) on a file:<br>• <b>Preview</b> – Quick look, Properties, Technical info<br>• <b>Timeline</b> – Insert / Overwrite at the playhead, Reveal in timeline<br>• <b>Organize</b> – Log, Clip markers, Tags, Pin, Replace file<br>• One-tap <b>star rating</b> and <b>colour label</b> rows<br>It acts on every selected file when you right-click one of them.</div>'); }});
try{ window.AMIYO_EDITOR_BUILD="libq-step01-ctxmenu"; }catch(e){}
})();

;
/* ==================== Script 676 id="amiyo-libq-step02-menusearch" ==================== */
/* Library Premiere step 2: searchable Lib+ menu. Type in the box at the top of Lib+ to find any of the ~100 tools by name or group
   (for example "rate", "relink", "export"). Enter runs the first match. The 5 tools you used last are listed under "Recent". */
(function(){"use strict";
var X=window.AMIYO_LIBX; if(!X||X.menuSearch) return; X.menuSearch=1;
var KEY="amiyo_lib_recent_tools";
function rec(){ try{ var a=JSON.parse(localStorage.getItem(KEY)||"[]"); return Array.isArray(a)?a.slice(0,5):[]; }catch(e){ return []; } }
function push(id){ try{ var a=rec().filter(function(x){ return x!==id; }); a.unshift(id); localStorage.setItem(KEY,JSON.stringify(a.slice(0,5))); }catch(e){} }
X.css("libq-msearch-css","#libxMenu .lq-sbox{position:sticky;top:-6px;z-index:2;background:#17140f;padding:6px 4px 4px;margin:-6px -6px 0}#libxMenu .lq-sbox input{width:100%;box-sizing:border-box;background:#0f0d0a;border:1px solid #3a3226;border-radius:8px;color:#e6dfd0;font:13px system-ui;padding:8px 10px;min-height:38px}#libxMenu .lq-none{padding:14px 10px;color:#847a6b;font-size:12px}");
function augment(menu){
  if(menu.dataset.lqs) return; menu.dataset.lqs="1";
  var box=document.createElement("div"); box.className="lq-sbox";
  var inp=document.createElement("input"); inp.type="search"; inp.placeholder="Search tools…"; inp.setAttribute("aria-label","Search library tools"); inp.autocomplete="off"; box.appendChild(inp);
  menu.insertBefore(box,menu.firstChild);
  var btns=Array.prototype.slice.call(menu.querySelectorAll("button[data-id]"));
  var byId={}; btns.forEach(function(b){ byId[b.dataset.id]=b; });
  var r=rec().filter(function(id){ return byId[id]; });
  var recEls=[];
  if(r.length){
    var h=document.createElement("div"); h.className="lq-rec"; h.style.cssText=btns[0]&&btns[0].previousElementSibling?btns[0].previousElementSibling.style.cssText:""; h.textContent="Recent"; recEls.push(h);
    r.forEach(function(id){ var c=byId[id].cloneNode(true); c.classList.add("lq-rec"); recEls.push(c); });
    var ref=box.nextSibling; recEls.forEach(function(e){ menu.insertBefore(e,ref); });
  }
  menu.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("button[data-id]"); if(b) push(b.dataset.id); },true);
  var none=document.createElement("div"); none.className="lq-none"; none.textContent="No tool matches that."; none.hidden=true; menu.appendChild(none);
  function filter(){
    var q=inp.value.trim().toLowerCase(), words=q.split(/\s+/).filter(Boolean), any=false;
    recEls.forEach(function(e){ e.hidden=!!q; });
    var kids=Array.prototype.slice.call(menu.children), head=null, headHas=false;
    function flush(){ if(head) head.hidden=!headHas; }
    kids.forEach(function(k){
      if(k===box||k===none||k.classList.contains("lq-rec")) return;
      if(k.tagName==="BUTTON"){ var t=(k.textContent+" "+(head?head.textContent:"")).toLowerCase(); var ok=words.every(function(w){ return t.indexOf(w)>=0; }); k.hidden=!ok; if(ok){ headHas=true; any=true; } }
      else { flush(); head=k; headHas=false; }
    });
    flush(); none.hidden=any||!q;
  }
  inp.addEventListener("input",filter);
  inp.addEventListener("keydown",function(e){
    e.stopPropagation();
    if(e.key==="Enter"){ e.preventDefault(); var f=Array.prototype.slice.call(menu.querySelectorAll("button[data-id]")).find(function(b){ return !b.hidden&&!b.disabled&&b.offsetParent!==null&&!b.classList.contains("lq-rec"); }); if(f) f.click(); }
    else if(e.key==="Escape"){ e.preventDefault(); X.close(); }
  });
  try{ if(window.matchMedia&&matchMedia("(pointer:fine)").matches) inp.focus({preventScroll:true}); }catch(e){}
}
new MutationObserver(function(ms){ ms.forEach(function(r){ r.addedNodes.forEach(function(n){ if(n.nodeType===1&&n.id==="libxMenu") augment(n); }); }); }).observe(document.body,{childList:true});
X.add({id:"lq_recent_clear",group:"Info",label:"Clear recent tools list",run:function(){ try{ localStorage.removeItem(KEY); }catch(e){} X.toast("Recent list cleared"); }});
try{ window.AMIYO_EDITOR_BUILD="libq-step02-menusearch"; }catch(e){}
})();

;
/* ==================== Script 677 id="amiyo-libq-step03-newitem" ==================== */
/* Library Premiere step 3: "New item" (like Premiere's New Item menu). Lib+ > New item makes files inside the editor and puts them in the Library
   (tagged "new item"): Black frame, Color matte (you pick the colour), Transparent frame, Bars and tone (colour bars picture + a 1 kHz test tone),
   and a 5-second Countdown video. They use the project's picture size. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!M||X.newItem) return;
function size(){ var s=(window.project&&project.settings)||{}; var w=+s.width||1280, h=+s.height||720; var k=Math.min(1,1920/Math.max(w,h)); return [Math.max(16,Math.round(w*k)),Math.max(16,Math.round(h*k))]; }
function cv(){ var d=size(), c=document.createElement("canvas"); c.width=d[0]; c.height=d[1]; return c; }
function png(c,name){ return new Promise(function(res){ c.toBlob(function(b){ res(new File([b],name,{type:"image/png"})); },"image/png"); }); }
function hexOk(h){ return /^#[0-9a-f]{6}$/i.test(h||""); }
X.niMatte=function(color,name){ var c=cv(), g=c.getContext("2d"); if(color){ g.fillStyle=color; g.fillRect(0,0,c.width,c.height); } return png(c,name); };
X.niBars=function(){ var c=cv(), g=c.getContext("2d"), W=c.width, H=c.height;
  var top=["#c0c0c0","#c0c000","#c04000","#00c000","#c000c0","#c00000","#c04000"], mid=["#c04000","#131313","#c000c0","#131313","#c04000","#131313","#c0c0c0"];
  var h1=Math.round(H*0.67), h2=Math.round(H*0.08), w=W/7;
  top.forEach(function(col,i){ g.fillStyle=col; g.fillRect(Math.round(i*w),0,Math.ceil(w),h1); });
  mid.forEach(function(col,i){ g.fillStyle=col; g.fillRect(Math.round(i*w),h1,Math.ceil(w),h2); });
  var y=h1+h2, h3=H-y, u=W/6;
  [["#4c1900",0],["#ffffff",1],["#32006a",2]].forEach(function(p){ g.fillStyle=p[0]; g.fillRect(Math.round(p[1]*u),y,Math.ceil(u),h3); });
  g.fillStyle="#131313"; g.fillRect(Math.round(3*u),y,Math.ceil(W-3*u),h3);
  [["#030303",3.0],["#131313",3.5],["#242424",4.0]].forEach(function(p){ g.fillStyle=p[0]; g.fillRect(Math.round(p[1]*u),y,Math.ceil(u*0.5),h3); });
  g.fillStyle="#fff"; g.font="700 "+Math.round(H/18)+"px system-ui,sans-serif"; g.textAlign="center"; g.fillText("AMIYO · "+c.width+"×"+c.height,W/2,h1-Math.round(H/30)); return png(c,"Bars "+c.width+"x"+c.height+".png"); };
X.niTone=function(sec,hz,db){ var sr=48000, n=sr*sec, amp=Math.pow(10,db/20)*32767, buf=new ArrayBuffer(44+n*2), v=new DataView(buf);
  function s(o,t){ for(var i=0;i<t.length;i++) v.setUint8(o+i,t.charCodeAt(i)); }
  s(0,"RIFF"); v.setUint32(4,36+n*2,true); s(8,"WAVE"); s(12,"fmt "); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,1,true); v.setUint32(24,sr,true); v.setUint32(28,sr*2,true); v.setUint16(32,2,true); v.setUint16(34,16,true); s(36,"data"); v.setUint32(40,n*2,true);
  for(var i=0;i<n;i++) v.setInt16(44+i*2,Math.round(Math.sin(2*Math.PI*hz*i/sr)*amp),true);
  return new File([buf],"Tone "+hz+" Hz "+db+" dB.wav",{type:"audio/wav"}); };
X.niCountdown=function(){ return new Promise(function(res,rej){
  if(!window.MediaRecorder){ rej(new Error("This browser cannot record video")); return; }
  var c=cv(); var k=Math.min(1,1280/c.width); c.width=Math.round(c.width*k)&~1; c.height=Math.round(c.height*k)&~1;
  var g=c.getContext("2d"), st=c.captureStream(30), types=["video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm","video/mp4"], mt=""; types.some(function(t){ if(MediaRecorder.isTypeSupported(t)){ mt=t; return true; } return false; });
  var rec=new MediaRecorder(st,mt?{mimeType:mt,videoBitsPerSecond:2500000}:undefined), parts=[]; rec.ondataavailable=function(e){ if(e.data&&e.data.size) parts.push(e.data); };
  rec.onstop=function(){ var ext=(rec.mimeType||mt).indexOf("mp4")>=0?"mp4":"webm"; res(new File([new Blob(parts,{type:rec.mimeType||mt})],"Countdown 5-1."+ext,{type:rec.mimeType||mt})); };
  rec.onerror=function(){ rej(new Error("Recording failed")); };
  var t0=0, W=c.width, H=c.height;
  function draw(ts){ if(!t0) t0=ts; var t=(ts-t0)/1000; if(t>=5){ g.fillStyle="#000"; g.fillRect(0,0,W,H); setTimeout(function(){ try{ rec.stop(); }catch(e){} },80); return; }
    var n=5-Math.floor(t), f=t-Math.floor(t); g.fillStyle="#0b0b0b"; g.fillRect(0,0,W,H);
    g.strokeStyle="#444"; g.lineWidth=Math.max(2,H/180); g.beginPath(); g.moveTo(W/2,0); g.lineTo(W/2,H); g.moveTo(0,H/2); g.lineTo(W,H/2); g.stroke();
    var r=H*0.36; g.beginPath(); g.arc(W/2,H/2,r,0,Math.PI*2); g.stroke();
    g.strokeStyle="#ff7a3d"; g.lineWidth=Math.max(4,H/60); g.beginPath(); g.arc(W/2,H/2,r,-Math.PI/2,-Math.PI/2+f*Math.PI*2); g.stroke();
    g.fillStyle="#fff"; g.font="700 "+Math.round(H*0.42)+"px system-ui,sans-serif"; g.textAlign="center"; g.textBaseline="middle"; g.fillText(String(n),W/2,H/2+H*0.02);
    requestAnimationFrame(draw); }
  rec.start(250); requestAnimationFrame(draw); }); };
X.niAdd=async function(files,label){
  if(typeof window.importFiles!=="function"){ X.toast("Import is not ready yet"); return 0; }
  var seen={}; Object.keys(project.assets||{}).forEach(function(a){ seen[a]=1; });
  await window.importFiles(files);
  var fresh=Object.keys(project.assets||{}).filter(function(a){ return !seen[a]&&/^asset_/.test(a); });
  var left=fresh.slice(), dead=Date.now()+8000;
  (function poll(){ left=left.filter(function(a){ var A=project.assets[a], it=A&&A.libId?M.byId(A.libId):null; if(!it) return true; it.tags=Array.from(new Set((it.tags||[]).concat(["new item"]))); X.save([it]); return false; }); if(left.length&&Date.now()<dead) setTimeout(poll,500); })();
  X.toast((label||"New item")+" added to your Library"); return files.length; };
function run(fn){ return function(){ Promise.resolve().then(fn).catch(function(e){ try{ window.__swl&&window.__swl(e); }catch(_){} X.toast((e&&e.message)||"Could not make that item",3200); }); }; }
X.add({id:"ni_black",group:"New item",label:"Black frame",hint:"picture",run:run(async function(){ await X.niAdd([await X.niMatte("#000000","Black frame.png")],"Black frame"); })});
X.add({id:"ni_matte",group:"New item",label:"Color matte…",hint:"pick a colour",run:function(){
  openModal("Color matte",'<label class="field">Colour</label><input id="niCol" type="color" value="#ff7a3d" style="width:100%;height:46px"><label class="field">Hex (optional)</label><input id="niHex" type="text" value="#ff7a3d" style="width:100%"><div style="margin-top:10px"><button type="button" class="chip" id="niGo" style="font-weight:700">Create matte</button></div>');
  var mb=document.getElementById("modalBody"), ci=mb.querySelector("#niCol"), hx=mb.querySelector("#niHex");
  ci.oninput=function(){ hx.value=ci.value; }; hx.oninput=function(){ if(hexOk(hx.value)) ci.value=hx.value; };
  mb.querySelector("#niGo").onclick=run(async function(){ var col=hexOk(hx.value)?hx.value:ci.value; try{ closeModal(); }catch(e){} await X.niAdd([await X.niMatte(col,"Color Matte "+col+".png")],"Color matte"); }); }});
X.add({id:"ni_transparent",group:"New item",label:"Transparent frame",hint:"picture",run:run(async function(){ await X.niAdd([await X.niMatte(null,"Transparent frame.png")],"Transparent frame"); })});
X.add({id:"ni_bars",group:"New item",label:"Bars and tone",hint:"picture + 1 kHz",run:run(async function(){ X.toast("Making bars and tone…"); await X.niAdd([await X.niBars(),X.niTone(10,1000,-20)],"Bars and tone"); })});
X.add({id:"ni_count",group:"New item",label:"Countdown 5–1",hint:"5 s video",run:run(async function(){ X.toast("Recording a 5-second countdown…",5200); var f=await X.niCountdown(); await X.niAdd([f],"Countdown"); })});
X.newItem=1;
try{ window.AMIYO_EDITOR_BUILD="libq-step03-newitem"; }catch(e){}
})();

;
/* ==================== Script 678 id="amiyo-libq-step04-freeform" ==================== */
/* Library Premiere step 4: Freeform view (like Premiere's Freeform / storyboard view). Lib+ > "Freeform view: on / off".
   In grid view, drag a file card anywhere on the canvas to lay out shots like a storyboard. Several selected cards move together.
   Positions are saved with each file. On a phone, touch and hold a card for a moment, then drag. "Freeform: tidy up" puts every card back in neat rows. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!M||!X.onRender||X.freeform) return;
var KEY="amiyo_lib_freeform", ON=false, W=150, GAP=12, SNAP=6;
try{ ON=localStorage.getItem(KEY)==="1"; }catch(e){}
X.css("libq-ff-css",".lq-ffgrid{position:relative!important;display:block!important;overflow:auto;min-height:260px;background-image:radial-gradient(#2a251e 1px,transparent 1px);background-size:18px 18px;border-radius:8px}.lq-ffgrid .mcard{position:absolute!important;margin:0!important;user-select:none;-webkit-user-select:none;cursor:grab}.lq-ffgrid .mcard.lq-ffdrag{cursor:grabbing;z-index:50;box-shadow:0 10px 26px rgba(0,0,0,.6);opacity:.92}");
function grid(){ return document.querySelector("#mlibBody .mlib-grid"); }
function isActive(g){ g=g||grid(); return !!(ON&&g&&!g.classList.contains("v-list")); }
function cards(g){ return Array.prototype.slice.call(g.querySelectorAll(".mcard[data-lib]")); }
function apply(){
  var g=grid(); if(!g) return;
  var act=isActive(g); g.classList.toggle("lq-ffgrid",act);
  if(!act){ cards(g).forEach(function(c){ c.style.left=c.style.top=c.style.width=""; }); g.style.minHeight=""; return; }
  var cs=cards(g); if(!cs.length) return;
  cs.forEach(function(c){ c.style.width=W+"px"; c.removeAttribute("draggable"); c.draggable=false; });
  var cols=Math.max(1,Math.floor((g.clientWidth+GAP)/(W+GAP))), n=0, maxB=0;
  cs.forEach(function(c){
    var it=X.item(c.dataset.lib), h=c.offsetHeight||110;
    if(it&&it.ff&&isFinite(it.ff.x)&&isFinite(it.ff.y)){ c.style.left=it.ff.x+"px"; c.style.top=it.ff.y+"px"; }
    else { var x=(n%cols)*(W+GAP)+GAP, y=Math.floor(n/cols)*(h+GAP)+GAP; c.style.left=x+"px"; c.style.top=y+"px"; n++; }
    maxB=Math.max(maxB,parseFloat(c.style.top)+h);
  });
  g.style.minHeight=Math.max(260,maxB+GAP+40)+"px";
}
X.onRender(apply);
/* ---- dragging ---- */
var drag=null, justDragged=0;
function setOf(id){ var sel=M.state.sel; return (sel&&sel.size>1&&sel.has(id))?Array.from(sel):[id]; }
function start(){
  if(!drag||drag.started) return; drag.started=true; clearTimeout(drag.timer);
  drag.moves=setOf(drag.id).map(function(id){ var el=document.querySelector('#mlibBody .mlib-grid .mcard[data-lib="'+id+'"]'); return el?{id:id,el:el,x:parseFloat(el.style.left)||0,y:parseFloat(el.style.top)||0}:null; }).filter(Boolean);
  drag.moves.forEach(function(m){ m.el.classList.add("lq-ffdrag"); });
  try{ if(navigator.vibrate&&drag.hold) navigator.vibrate(8); }catch(e){}
}
document.addEventListener("pointerdown",function(e){
  if(!ON||e.button>0) return; var g=grid(); if(!isActive(g)) return;
  var c=e.target.closest&&e.target.closest(".mcard[data-lib]"); if(!c||!g.contains(c)) return;
  if(e.target.closest("button,input,select,a,textarea")) return;
  drag={id:c.dataset.lib,x0:e.clientX,y0:e.clientY,started:false,hold:false,touch:e.pointerType!=="mouse",timer:0,g:g};
  if(drag.touch) drag.timer=setTimeout(function(){ if(drag){ drag.hold=true; start(); } },380);
},true);
document.addEventListener("pointermove",function(e){
  if(!drag) return; var dx=e.clientX-drag.x0, dy=e.clientY-drag.y0, d=Math.sqrt(dx*dx+dy*dy);
  if(!drag.started){ if(!drag.touch&&d>6) start(); else if(drag.touch&&!drag.hold&&d>10){ clearTimeout(drag.timer); drag=null; } }
  if(!drag||!drag.started) return;
  var gw=drag.g.scrollWidth;
  drag.moves.forEach(function(m){ var nx=Math.max(0,Math.round((m.x+dx)/SNAP)*SNAP), ny=Math.max(0,Math.round((m.y+dy)/SNAP)*SNAP); m.nx=nx; m.ny=ny; m.el.style.left=nx+"px"; m.el.style.top=ny+"px"; });
},true);
document.addEventListener("touchmove",function(e){ if(drag&&drag.started&&e.cancelable) e.preventDefault(); },{passive:false,capture:true});
function end(e){
  if(!drag) return; clearTimeout(drag.timer); var d=drag; drag=null; if(!d.started) return;
  justDragged=Date.now(); var list=[], bottom=0;
  d.moves.forEach(function(m){ m.el.classList.remove("lq-ffdrag"); if(m.nx==null) return; var it=X.item(m.id); if(it){ it.ff={x:m.nx,y:m.ny}; list.push(it); } });
  list.forEach(function(it){ try{ M.persist(it); }catch(e){} });
  apply();
}
document.addEventListener("pointerup",end,true); document.addEventListener("pointercancel",end,true);
document.addEventListener("click",function(e){ if(justDragged&&Date.now()-justDragged<350&&e.target.closest&&e.target.closest("#mlibBody .lq-ffgrid")){ e.stopPropagation(); e.preventDefault(); justDragged=0; } },true);
document.addEventListener("dragstart",function(e){ if(isActive()&&e.target.closest&&e.target.closest("#mlibBody .mcard")) e.preventDefault(); },true);
/* ---- Lib+ items ---- */
X.freeformSet=function(on){ ON=!!on; try{ localStorage.setItem(KEY,ON?"1":"0"); }catch(e){} try{ M.render(); }catch(e){} apply(); };
X.freeformTidy=function(){ var ids=cards(grid()||document.body).map(function(c){ return c.dataset.lib; }); var list=ids.map(function(i){ return X.item(i); }).filter(Boolean); list.forEach(function(it){ delete it.ff; try{ M.persist(it); }catch(e){} }); apply(); return list.length; };
X.add({id:"lq_ff_toggle",group:"View",label:"Freeform view: on / off",hint:"storyboard",run:function(){ X.freeformSet(!ON); X.toast(ON?"Freeform on – drag cards anywhere (touch: hold, then drag)":"Freeform off",3200); }});
X.add({id:"lq_ff_tidy",group:"View",label:"Freeform: tidy up into rows",run:function(){ if(!isActive()){ X.toast("Turn Freeform view on first (grid view only)"); return; } var n=X.freeformTidy(); X.toast(n+" cards tidied"); }});
X.freeform=1;
try{ window.AMIYO_EDITOR_BUILD="libq-step04-freeform"; }catch(e){}
apply();
})();

;
/* ==================== Script 679 id="amiyo-libq-step05-sourcemarks" ==================== */
/* Library Premiere step 5: Source-monitor marks inside Quick Look (like Premiere's Source Monitor). Open a video or sound with Space or Lib+ > Quick look, then:
   "Mark In" / "Mark Out" (keys I and O) set the part you want; the bar shows it; "Play marked" plays only that part; "Save subclip" puts the marked part into
   the Library as its own file; "＋ Timeline" already places only the marked part. Marks are the same ones the file's Details panel shows. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!M||!X.quick||X.srcMarks) return; X.srcMarks=1;
var orig=X.quick;
function fmt(t){ t=Math.max(0,+t||0); var m=Math.floor(t/60), s=(t-m*60).toFixed(1); return m+":"+(+s<10?"0":"")+s; }
function full(it){ return +(it.srcDur||it.duration)||0; }
function has(it){ return it.markIn!=null||it.markOut!=null; }
X.css("libq-mk-css","#lqMk{margin-top:10px;font:12px system-ui}#lqMk .lq-bar{position:relative;height:10px;border-radius:5px;background:#2a251e;margin:6px 0}#lqMk .lq-bar i{position:absolute;top:0;bottom:0;background:var(--accent,#ff7a3d);border-radius:5px;min-width:2px}#lqMk .lq-bar b{position:absolute;top:-3px;bottom:-3px;width:2px;background:#fff;pointer-events:none}");
X.quick=function(id){
  orig(id);
  var tries=0, iv=setInterval(function(){
    var host=document.getElementById("lxQL"); tries++;
    if(!host&&tries>60){ clearInterval(iv); return; }
    if(!host||host.dataset.lqm) return; clearInterval(iv);
    var it=X.item(id); if(!it||it.type==="image") return; host.dataset.lqm=id;
    var med=host.querySelector("video,audio"); if(!med) return;
    var box=document.createElement("div"); box.id="lqMk";
    box.innerHTML='<div id="lqTxt"></div><div class="lq-bar" id="lqBar"><i id="lqSeg"></i><b id="lqHead"></b></div><div class="mdetail-actions"><button type="button" class="chip" id="lqIn">[ Mark In (I)</button><button type="button" class="chip" id="lqOut">Mark Out (O) ]</button><button type="button" class="chip" id="lqPlay">▶ Play marked</button><button type="button" class="chip pri" id="lqSub">✂ Save subclip</button><button type="button" class="chip" id="lqClr">Clear marks</button></div>';
    host.appendChild(box);
    var txt=box.querySelector("#lqTxt"), seg=box.querySelector("#lqSeg"), head=box.querySelector("#lqHead"), bar=box.querySelector("#lqBar"), stopAt=null;
    function dur(){ return full(it)||(isFinite(med.duration)?med.duration:0)||1; }
    function paint(){ var d=dur(), i=it.markIn!=null?it.markIn:0, o=it.markOut!=null?it.markOut:d;
      seg.style.left=(has(it)?i/d*100:0)+"%"; seg.style.width=(has(it)?Math.max(0.5,(o-i)/d*100):0)+"%";
      txt.textContent=has(it)?("In "+fmt(i)+" · Out "+fmt(o)+" · Length "+fmt(Math.max(0,o-i))):"No marks – the whole file is used"; }
    function now(){ return Math.round((med.currentTime||0)*30)/30; }
    function mark(which){
      var t=now(), d=dur();
      if(which==="in"){ it.markIn=Math.min(t,Math.max(0,d-0.2)); if(it.markOut!=null&&it.markOut<=it.markIn+0.1) delete it.markOut; }
      else { it.markOut=Math.min(t,d); if(it.markIn!=null&&it.markIn>=it.markOut-0.1) delete it.markIn; }
      try{ M.persist(it); }catch(e){} paint(); try{ M.render(); }catch(e){} }
    box.querySelector("#lqIn").onclick=function(){ mark("in"); };
    box.querySelector("#lqOut").onclick=function(){ mark("out"); };
    box.querySelector("#lqClr").onclick=function(){ delete it.markIn; delete it.markOut; try{ M.persist(it); }catch(e){} paint(); try{ M.render(); }catch(e){} };
    box.querySelector("#lqPlay").onclick=function(){ if(!has(it)){ X.toast("Mark In and Out first"); return; } var d=dur(); stopAt=it.markOut!=null?it.markOut:d; try{ med.currentTime=it.markIn||0; med.play(); }catch(e){} };
    med.addEventListener("timeupdate",function(){ head.style.left=(med.currentTime/dur()*100)+"%"; if(stopAt!=null&&med.currentTime>=stopAt){ med.pause(); stopAt=null; } });
    med.addEventListener("pause",function(){ if(stopAt!=null&&med.currentTime<stopAt-0.05) stopAt=null; });
    bar.onclick=function(e){ var r=bar.getBoundingClientRect(); try{ med.currentTime=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*dur(); }catch(x){} };
    box.querySelector("#lqSub").onclick=async function(){
      if(!has(it)){ X.toast("Mark In and Out first"); return; }
      var d=dur(), i=Math.max(0,it.markIn||0), o=it.markOut!=null?Math.min(it.markOut,d):d;
      if(!(o-i>=0.2)){ X.toast("The marked part is too short"); return; }
      var n={id:"lib_"+Date.now().toString(36)+Math.random().toString(36).slice(2,7),fp:(it.fp||it.id)+"#sub"+Date.now().toString(36),blobKey:it.blobKey,name:String(it.name).replace(/ \[[^\]]*\]$/,"")+" ["+fmt(i)+"–"+fmt(o)+"]",type:it.type,mime:it.mime||"",size:it.size||0,width:it.width||0,height:it.height||0,duration:o-i,srcDur:full(it)||d,markIn:i,markOut:o,isSubclip:true,subOf:it.id,addedAt:Date.now(),lastUsed:0,imports:1,uses:0,thumb:it.thumb||null};
      if(it.bin) n.bin=it.bin; if(it.label) n.label=it.label; if(it.tags&&it.tags.length) n.tags=it.tags.slice();
      M.items().push(n); try{ await M.persist(n); }catch(e){} try{ M.render(); }catch(e){} X.toast("Subclip saved to your Library"); };
    if(it.markIn!=null) med.addEventListener("loadedmetadata",function(){ try{ med.currentTime=it.markIn; }catch(e){} },{once:true});
    paint();
  },80);
};
document.addEventListener("keydown",function(e){
  if(e.ctrlKey||e.metaKey||e.altKey) return; var k=e.key; if(k!=="i"&&k!=="I"&&k!=="o"&&k!=="O") return;
  var t=e.target; if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
  var b=document.getElementById(/i/i.test(k)?"lqIn":"lqOut"); if(!b||!document.getElementById("lxQL")) return;
  e.preventDefault(); e.stopPropagation(); b.click(); },true);
X.add({id:"lq_marks_help",group:"Info",label:"Mark In / Out in Quick look: how it works",run:function(){ openModal("Mark In / Out",'<div style="font:12.5px/1.8 system-ui">1. Click a video or sound, press <b>Space</b> (Quick look).<br>2. Play or drag to the start, press <b>I</b> (Mark In). Go to the end, press <b>O</b> (Mark Out).<br>3. <b>Play marked</b> checks it. <b>Save subclip</b> makes a new Library file from that part. <b>＋ Timeline</b> places only the marked part.</div>'); }});
try{ window.AMIYO_EDITOR_BUILD="libq-step05-sourcemarks"; }catch(e){}
})();

;
/* ==================== Script 680 id="amiyo-libq-step06-makeproxy" ==================== */
/* Library Premiere step 6: make a proxy inside the editor. The older Proxy workflow could only LINK a small copy made in another program.
   Lib+ > "Make proxy for selected videos…" now makes the small copy itself (360p, 540p or 720p), shows progress with a Cancel button,
   and links it to the project clip automatically (preview uses the proxy, export always uses your original). The copy is recorded at normal speed,
   so it takes as long as the video itself. Videos that are not in the project yet get the proxy as a new Library file tagged "proxy". */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!M||X.pxMake) return;
function fmt(t){ t=Math.max(0,Math.round(t)); return Math.floor(t/60)+":"+("0"+(t%60)).slice(-2); }
/* ---- write the length into a MediaRecorder .webm so the browser can seek in it ---- */
function vint(n){ return new Uint8Array([0x10|((n>>>24)&0x0f),(n>>>16)&255,(n>>>8)&255,n&255]); }
X.pxFixWebm=async function(blob,sec){
  try{
    var head=new Uint8Array(await blob.slice(0,4096).arrayBuffer()), p=-1;
    for(var i=0;i<head.length-4;i++){ if(head[i]===0x15&&head[i+1]===0x49&&head[i+2]===0xA9&&head[i+3]===0x66){ p=i; break; } }
    if(p<0) return blob;
    var l=head[p+4], len=0, n=1; while(n<=8&&!(l&(0x80>>(n-1)))) n++; if(n>8) return blob;
    len=l&(0xff>>n); for(var k=1;k<n;k++) len=len*256+head[p+4+k];
    var start=p+4+n, end=start+len, info=head.slice(start,end), scale=1000000;
    for(var q=0;q<info.length-4;q++){ if(info[q]===0x2A&&info[q+1]===0xD7&&info[q+2]===0xB1){ var sl=info[q+3]&0x7f, v=0; for(var z=0;z<sl;z++) v=v*256+info[q+4+z]; if(v>0) scale=v; break; } }
    for(var d=0;d<info.length-1;d++){ if(info[d]===0x44&&info[d+1]===0x89) return blob; }
    var dur=new Uint8Array(11); dur[0]=0x44; dur[1]=0x89; dur[2]=0x88; new DataView(dur.buffer).setFloat64(3,sec*1e9/scale,false);
    var ninfo=new Uint8Array(info.length+11); ninfo.set(info,0); ninfo.set(dur,info.length);
    var pre=head.slice(0,p+4), sz=vint(ninfo.length);
    return new Blob([pre,sz,ninfo,blob.slice(end)],{type:blob.type});
  }catch(e){ return blob; }
};
/* ---- record a smaller copy at normal speed ---- */
X.pxMake=function(it,h,onProg,ctl){
  return new Promise(async function(res,rej){
    try{
      if(!window.MediaRecorder){ rej(new Error("This browser cannot record video")); return; }
      var blob=await M.getBlob(it); if(!blob){ rej(new Error("The file is missing from the Library")); return; }
      var url=URL.createObjectURL(blob), v=document.createElement("video"); v.muted=true; v.playsInline=true; v.preload="auto"; v.src=url;
      function clean(){ try{ URL.revokeObjectURL(url); v.removeAttribute("src"); v.load(); }catch(e){} }
      await new Promise(function(ok,no){ v.onloadedmetadata=ok; v.onerror=function(){ no(new Error("This video cannot be read here")); }; });
      var vw=v.videoWidth||it.width||1280, vh=v.videoHeight||it.height||720, H=Math.min(h,vh), W=Math.round(vw*H/vh/2)*2; H=Math.round(H/2)*2;
      var c=document.createElement("canvas"); c.width=W; c.height=H; var g=c.getContext("2d");
      var st=c.captureStream(30), types=["video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm","video/mp4"], mt=""; types.some(function(t){ if(MediaRecorder.isTypeSupported(t)){ mt=t; return true; } return false; });
      var rec=new MediaRecorder(st,mt?{mimeType:mt,videoBitsPerSecond:Math.round(W*H*2.2)}:undefined), parts=[], dur=isFinite(v.duration)&&v.duration>0?v.duration:(+it.duration||0), stopped=false;
      rec.ondataavailable=function(e){ if(e.data&&e.data.size) parts.push(e.data); };
      rec.onstop=async function(){ clean(); if(ctl.cancel){ rej(new Error("Cancelled")); return; }
        var type=rec.mimeType||mt, out=new Blob(parts,{type:type}); if(/webm/.test(type)) out=await X.pxFixWebm(out,dur);
        var base=String(it.name).replace(/\.[A-Za-z0-9]{1,5}$/,""); res({file:new File([out],base+" proxy "+H+"p."+(/mp4/.test(type)?"mp4":"webm"),{type:type}),w:W,h:H,dur:dur}); };
      function draw(){ if(stopped) return; try{ g.drawImage(v,0,0,W,H); }catch(e){} if(onProg) onProg(v.currentTime,dur); if(ctl.cancel){ finish(); return; }
        if(v.requestVideoFrameCallback) v.requestVideoFrameCallback(draw); else requestAnimationFrame(draw); }
      function finish(){ if(stopped) return; stopped=true; try{ v.pause(); }catch(e){} setTimeout(function(){ try{ rec.stop(); }catch(e){} },120); }
      v.onended=finish; v.onerror=finish;
      rec.start(500); v.currentTime=0; await v.play(); draw();
    }catch(e){ rej(e); }
  });
};
function linkAssets(it,file){
  var n=0; Object.keys(project.assets||{}).forEach(function(id){ var a=project.assets[id]; if(a&&a.libId===it.id&&a.type==="video") n++; });
  return n;
}
X.pxLink=async function(it,file){
  var list=Object.keys(project.assets||{}).map(function(k){ return project.assets[k]; }).filter(function(a){ return a&&a.libId===it.id&&a.type==="video"; });
  if(!list.length) return 0;
  var before=null; try{ before=deepClone(serializableProject()); }catch(e){}
  for(var i=0;i<list.length;i++){ var a=list[i]; try{ await window.amiyoCachePut("proxy",a,file); }catch(e){ continue; } a.hasProxy=true; a.proxyName=file.name; }
  try{ if(before) recordHistory("Make proxy",before,serializableProject()); }catch(e){}
  try{ scheduleAutosave(); }catch(e){} try{ renderLeftPanel(); }catch(e){} try{ renderPreviewFrame(); }catch(e){}
  return list.length;
};
X.pxRun=async function(items,h){
  var ctl={cancel:false}, total=items.length, done=0, linked=0, added=0, failed=0;
  openModal("Making proxy",'<div id="lqPx" style="font:13px/1.6 system-ui"><div id="lqPxT">Starting…</div><div style="height:10px;border-radius:5px;background:#2a251e;margin:8px 0"><i id="lqPxB" style="display:block;height:100%;width:0;border-radius:5px;background:var(--accent,#ff7a3d)"></i></div><button type="button" class="chip danger" id="lqPxC">Cancel</button><p style="font-size:11px;opacity:.7">Keep this window open. The copy is made at normal speed.</p></div>');
  var T=document.getElementById("lqPxT"), B=document.getElementById("lqPxB"); document.getElementById("lqPxC").onclick=function(){ ctl.cancel=true; };
  for(var i=0;i<items.length&&!ctl.cancel;i++){
    var it=items[i];
    try{
      var r=await X.pxMake(it,h,function(t,d){ if(!document.getElementById("lqPxT")) return; T.textContent="File "+(i+1)+" of "+total+": "+it.name+" – "+fmt(t)+" / "+fmt(d); B.style.width=(((done+(d?t/d:0))/total)*100)+"%"; },ctl);
      var n=await X.pxLink(it,r.file);
      if(n) linked+=n; else { await window.importFiles([r.file]); added++; }
      done++;
    }catch(e){ if(ctl.cancel) break; failed++; try{ window.__swl&&window.__swl(e); }catch(_){} }
  }
  try{ closeModal(); }catch(e){}
  X.toast(ctl.cancel?"Cancelled":(done+" proxy"+(done===1?"":"s")+" made"+(linked?" and linked to the project":"")+(added?"; "+added+" added to the Library (tag proxy)":"")+(failed?"; "+failed+" failed":"")),4200);
};
X.add({id:"lq_px_make",group:"Proxy",label:"Make proxy for selected videos…",hint:"in the editor",run:function(){
  var s=X.sel().filter(function(i){ return i.type==="video"&&!i.isSubclip; });
  if(!s.length){ X.toast("Select one or more videos first (Select button)"); return; }
  var secs=s.reduce(function(a,i){ return a+(+i.duration||0); },0);
  openModal("Make proxy",'<div style="font:13px/1.6 system-ui"><p>'+s.length+' video'+(s.length===1?"":"s")+', about <b>'+fmt(secs)+'</b> in total. A small copy is recorded at normal speed, so it takes about that long.</p><label class="field">Size</label><select id="lqPxH" style="width:100%"><option value="360">360p – smallest, fastest editing</option><option value="540" selected>540p – balanced</option><option value="720">720p – sharper</option></select><div style="margin-top:12px"><button type="button" class="chip pri" id="lqPxGo">Start</button></div></div>');
  document.getElementById("lqPxGo").onclick=function(){ var h=+document.getElementById("lqPxH").value||540; try{ closeModal(); }catch(e){} setTimeout(function(){ X.pxRun(s,h); },60); }; }});
X.add({id:"lq_px_open",group:"Proxy",label:"Proxy workflow (on / off, link)…",run:function(){ if(window.amiyoProxyFlow&&window.amiyoProxyFlow.open) window.amiyoProxyFlow.open(); else X.toast("Open Pr tools > Proxy workflow"); }});
if(X.niCountdown&&!X.niCountdown.__fx){ var oc=X.niCountdown; X.niCountdown=function(){ return oc().then(function(f){ if(!/webm/.test(f.type)) return f; return X.pxFixWebm(f,5).then(function(b){ return new File([b],f.name,{type:f.type}); }); }); }; X.niCountdown.__fx=1; }
try{ window.AMIYO_EDITOR_BUILD="libq-step06-makeproxy"; }catch(e){}
})();

;
/* ==================== Script 681 id="amiyo-libq-step07-duplicate" ==================== */
/* Library Premiere step 7: Duplicate. Lib+ > "Duplicate selected" (or right-click > Duplicate, or Shift+D in the Library) makes a copy of a Library file
   with its rating, label, tags, notes, bin, In/Out marks, log and clip markers. The copy shares the same file, so it takes no extra storage.
   Handy for trying two different In/Out ranges or two different logs of the same footage. The copies are selected afterwards. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!M||X.dup) return;
function ext(n){ var m=/\.[A-Za-z0-9]{1,5}$/.exec(n||""); return m?m[0]:""; }
function base(n){ return String(n||"").replace(/\.[A-Za-z0-9]{1,5}$/,""); }
function clone(it){ try{ return structuredClone(it); }catch(e){ var n={}; Object.keys(it).forEach(function(k){ var v=it[k]; if(v&&typeof v==="object"){ try{ n[k]=JSON.parse(JSON.stringify(v)); }catch(_){ n[k]=v; } } else n[k]=v; }); return n; } }
function newName(it,taken){
  var b=base(it.name).replace(/ copy( \d+)?$/,""), e=ext(it.name), k=1, nm;
  do{ nm=b+" copy"+(k>1?" "+k:"")+e; k++; }while(taken[nm.toLowerCase()]);
  taken[nm.toLowerCase()]=1; return nm; }
X.duplicate=async function(list){
  list=list||X.sel(); if(!list.length){ X.toast("Select one or more files first (Select button)"); return []; }
  var taken={}; M.items().forEach(function(i){ taken[String(i.name).toLowerCase()]=1; });
  var out=[];
  for(var j=0;j<list.length;j++){
    var it=list[j], n=clone(it), stamp=Date.now().toString(36);
    n.id="lib_"+stamp+Math.random().toString(36).slice(2,7)+j; n.fp=(it.fp||it.id)+"#dup"+stamp+j;
    n.name=newName(it,taken); n.addedAt=Date.now(); n.lastUsed=0; n.uses=0; n.imports=1; delete n.pin; delete n.pinned;
    if(n.ff&&isFinite(n.ff.x)){ n.ff={x:n.ff.x+24,y:n.ff.y+24}; }
    M.items().push(n); try{ await M.persist(n); }catch(e){ try{ window.__swl&&window.__swl(e); }catch(_){} }
    out.push(n);
  }
  try{ M.render(); }catch(e){}
  if(X.selectIds) setTimeout(function(){ X.selectIds(out.map(function(i){ return i.id; })); },30);
  X.toast(out.length+" cop"+(out.length===1?"y":"ies")+" made (same file, no extra storage)",3200);
  return out; };
X.add({id:"lq_dup",group:"Organize",label:"Duplicate selected (keeps marks, tags, notes)",hint:"Shift+D",run:function(){ X.duplicate(); }});
window.addEventListener("keydown",function(e){
  if(e.ctrlKey||e.metaKey||e.altKey||!e.shiftKey||(e.key!=="d"&&e.key!=="D")) return;
  var t=e.target; if(!t||!t.closest||!t.closest("#mlibBody")) return; if(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable) return;
  var list=X.sel(); if(!list.length){ var c=t.closest("[data-lib]"); var it=c&&X.item(c.dataset.lib); if(it) list=[it]; }
  if(!list.length) return; e.preventDefault(); e.stopPropagation(); X.duplicate(list); },true);
X.dupReady=1; X.dup=1;
try{ window.AMIYO_EDITOR_BUILD="libq-step07-duplicate"; }catch(e){}
})();

;
/* ==================== Script 682 id="amiyo-libq-step08-matchproject" ==================== */
/* Library Premiere step 8: new project settings from a file (like Premiere's "New Sequence From Clip"). Right-click a video or picture > "Match project to this file…",
   or Lib+ > "Set project from selected file…". It shows the file's size and its real frame rate (measured by playing a moment of it) next to the project's,
   and sets picture size, aspect ratio and frame rate in one tap. Frame rate is rounded to the nearest 24, 25, 30, 50 or 60. It can be undone with the editor's Undo. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!M||X.matchProj) return; X.matchProj=1;
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function gcd(a,b){ return b?gcd(b,a%b):a; }
var STD=[24,25,30,50,60];
X.snapFps=function(f){ var best=0,bd=1e9; STD.forEach(function(s){ var d=Math.abs(s-f)/s; if(d<bd){ bd=d; best=s; } }); return bd<0.12?best:0; };
X.measureFps=function(it){ return new Promise(function(res){
  if(+it.fps>0&&+it.fps<241){ res(+it.fps); return; }
  if(it.type!=="video"){ res(0); return; }
  M.getBlob(it).then(function(b){
    if(!b){ res(0); return; }
    var v=document.createElement("video"), T=[], fin=false, url=URL.createObjectURL(b);
    if(!v.requestVideoFrameCallback){ URL.revokeObjectURL(url); res(0); return; }
    v.muted=true; v.playsInline=true; v.src=url;
    function done(){ if(fin) return; fin=true; clearTimeout(dead); try{ v.pause(); URL.revokeObjectURL(url); v.removeAttribute("src"); v.load(); }catch(e){}
      var ds=[]; for(var i=1;i<T.length;i++){ var d=T[i]-T[i-1]; if(d>0.001) ds.push(d); }
      if(ds.length<4){ res(0); return; } ds.sort(function(a,c){ return a-c; }); res(1/ds[Math.floor(ds.length/2)]); }
    var dead=setTimeout(done,6000);
    function cb(now,meta){ T.push(meta.mediaTime); if(T.length>=30) done(); else v.requestVideoFrameCallback(cb); }
    v.onloadedmetadata=function(){ v.requestVideoFrameCallback(cb); var p=v.play(); if(p&&p.catch) p.catch(function(){ done(); }); };
    v.onerror=done;
  }).catch(function(){ res(0); }); }); };
function dims(it){ var w=Math.round(it.width/2)*2, h=Math.round(it.height/2)*2, sc=Math.min(1,1920/Math.max(w,h)); w=Math.round(w*sc/2)*2; h=Math.round(h*sc/2)*2;
  var g=gcd(w,h), key=(w/g)+":"+(h/g), known={"16:9":16/9,"9:16":9/16,"4:5":.8,"1:1":1,"4:3":4/3,"3:4":.75,"21:9":21/9}, best=key;
  Object.keys(known).forEach(function(k){ if(Math.abs(known[k]-w/h)/known[k]<0.01) best=k; }); return {w:w,h:h,aspect:best}; }
X.matchApply=function(it,doSize,fps){
  var before=deepClone(serializableProject()), s=project.settings, d=dims(it), ch=[];
  if(doSize&&d.w>=16&&d.h>=16){ s.width=d.w; s.height=d.h; s.aspect=d.aspect; ch.push(d.w+"×"+d.h); }
  if(fps>0){ s.fps=fps; ch.push(fps+" fps"); }
  if(!ch.length) return "";
  try{ recordHistory("Match project to file",before,deepClone(serializableProject())); }catch(e){}
  try{ scheduleAutosave(); }catch(e){} try{ renderAll(); }catch(e){}
  return ch.join(" · "); };
X.matchDialog=function(it){
  if(!it){ X.toast("Select one video or picture first"); return; }
  if(it.type==="audio"){ X.toast("Sound files have no picture size"); return; }
  var s=(project&&project.settings)||{}, d=dims(it);
  openModal("Match project to file",'<div id="lqMp" style="font:13px/1.55 system-ui"><div style="opacity:.8;margin-bottom:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(it.name)+'</div>'+
   '<table style="width:100%;border-collapse:collapse"><tr style="opacity:.6"><td></td><td>Project now</td><td>This file</td></tr>'+
   '<tr><td>Size</td><td>'+(s.width||"?")+'×'+(s.height||"?")+'</td><td>'+it.width+'×'+it.height+' → <b>'+d.w+'×'+d.h+'</b> ('+d.aspect+')</td></tr>'+
   '<tr><td>Frame rate</td><td>'+(s.fps||"?")+' fps</td><td id="lqMpF">'+(it.type==="video"?"measuring…":"–")+'</td></tr></table>'+
   '<label style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" id="lqMpS" checked> Set picture size and aspect ratio</label>'+
   '<label style="display:flex;gap:8px;align-items:center;margin:6px 0 10px"><input type="checkbox" id="lqMpR" '+(it.type==="video"?"checked":"disabled")+'> Set frame rate</label>'+
   '<button type="button" class="chip pri" id="lqMpGo">Apply to project</button><p style="font-size:11px;opacity:.7;margin:8px 0 0">Clips already on the timeline keep their times. You can undo this.</p></div>');
  var fps=0, mb=document.getElementById("modalBody"), cell=mb.querySelector("#lqMpF");
  if(it.type==="video") X.measureFps(it).then(function(f){ if(!document.getElementById("lqMpF")) return; var sn=f?X.snapFps(f):0; fps=sn; cell.innerHTML=f?(Math.round(f*100)/100+' → <b>'+(sn||"?")+' fps</b>'):"could not be measured"; if(!sn){ var r=mb.querySelector("#lqMpR"); r.checked=false; r.disabled=true; } });
  mb.querySelector("#lqMpGo").onclick=function(){ var sz=mb.querySelector("#lqMpS").checked, rt=mb.querySelector("#lqMpR").checked; var m=X.matchApply(it,sz,rt?fps:0); try{ closeModal(); }catch(e){} X.toast(m?("Project set to "+m):"Nothing was changed",3200); };
};
X.add({id:"lq_match",group:"Timeline",label:"Set project from selected file…",hint:"size & fps",run:function(){ var s=X.sel(); if(s.length!==1){ X.toast("Select exactly one video or picture first"); return; } X.matchDialog(s[0]); }});
try{ window.AMIYO_EDITOR_BUILD="libq-step08-matchproject"; }catch(e){}
})();

;
/* ==================== Script 683 id="amiyo-libr-step01-subbins" ==================== */
/* Library Premiere-style step 1: sub-bins (nested bins). A bin can now live inside another bin, like Premiere's bin tree.
   Open a bin to see its sub-bins; the path row (All files > Parent > Child) jumps back up. "+ Sub-bin" makes one inside the open bin,
   "Move bin..." puts the open bin inside another bin (or back at the top). Deleting a parent bin lifts its sub-bins to the top level. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!M||!X.onRender||X.nest) return;
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function bins(){ return M.state.bins||[]; }
function byId(id){ return bins().find(function(b){ return b.id===id; }); }
function parentOf(b){ var p=b&&b.parent&&byId(b.parent); return p&&p.id!==b.id?p:null; }
function kids(id){ return bins().filter(function(b){ var p=parentOf(b); return id?(p&&p.id===id):!p; }); }
function path(id){ var a=[], seen={}, b=byId(id); while(b&&!seen[b.id]){ seen[b.id]=1; a.unshift(b); b=parentOf(b); } return a; }
function below(id){ var out=[id], q=[id], seen={}; seen[id]=1; while(q.length){ var c=q.shift(); kids(c).forEach(function(k){ if(!seen[k.id]){ seen[k.id]=1; out.push(k.id); q.push(k.id); } }); } return out; }
X.binKids=kids; X.binPath=path; X.binBelow=below; X.binParent=parentOf;
function newId(){ return "bin_"+Date.now().toString(36)+Math.random().toString(36).slice(2,5); }
function cnt(id){ var n=0; M.items().forEach(function(i){ if(i.bin===id) n++; }); return n; }
X.nest=function(){
  var row=document.querySelector("#mlibBody .mbins"); if(!row) return;
  var cur=M.state.bin, sig=cur+"|"+JSON.stringify(bins())+"|"+M.items().length+"|"+M.items().reduce(function(a,i){ return a+(i.bin?1:0); },0);
  if(row.dataset.lrSig===sig) return; row.dataset.lrSig=sig;
  var shown={}, p=path(cur), curB=byId(cur);
  if(!curB){ kids(null).forEach(function(b){ shown[b.id]=1; }); }
  else { p.forEach(function(b){ shown[b.id]=1; }); var k=kids(cur); (k.length?k:kids(curB.parent&&parentOf(curB)?parentOf(curB).id:null)).forEach(function(b){ shown[b.id]=1; }); }
  row.querySelectorAll("button[data-mbin]").forEach(function(c){
    var id=c.dataset.mbin; if(id==="all") return; var b=byId(id); if(!b) return;
    c.style.display=shown[id]?"":"none";
    var d=0, all=below(id); if(all.length>1){ all.forEach(function(x){ if(x!==id) d+=cnt(x); }); }
    var sm=c.querySelector("small"); if(sm) sm.textContent=cnt(id)+(d?" +"+d:"");
    var depth=p.indexOf(b); c.style.marginLeft=""; c.title=path(id).map(function(x){ return x.name; }).join(" / ");
    var hk=kids(id).length; if(hk&&!c.dataset.lrFold){ c.dataset.lrFold="1"; c.insertAdjacentHTML("afterbegin","<span aria-hidden='true' style='opacity:.6;margin-right:4px'>▸</span>"); }
  });
  var old=document.getElementById("lrCrumb"); if(old) old.remove();
  if(curB){ var cr=document.createElement("div"); cr.id="lrCrumb"; cr.style.cssText="font:11.5px system-ui;color:#a99f8d;margin:4px 2px;display:flex;flex-wrap:wrap;gap:4px;align-items:center";
    cr.innerHTML='<button type="button" class="chip" data-mbin="all">All files</button>'+p.map(function(b,i){ return "<span>›</span><button type='button' class='chip"+(b.id===cur?" pri":"")+"' data-mbin='"+esc(b.id)+"'>"+esc(b.name)+"</button>"; }).join("")+'<button type="button" class="chip" id="lrUp" title="Go up one bin">↑ Up</button>';
    row.parentNode.insertBefore(cr,row.nextSibling); }
  var tools=document.querySelector("#mbinRen"); tools=tools&&tools.parentNode;
  if(tools&&!tools.querySelector("#lrSub")){ tools.insertAdjacentHTML("beforeend",'<button type="button" class="chip" id="lrSub">＋ Sub-bin</button><button type="button" class="chip" id="lrMove">Move bin…</button>'); }
  if(!curB&&!document.getElementById("lrSubTop")&&row){ /* top level: "+ Bin" already exists */ }
};
X.newSub=async function(){
  var cur=M.state.bin, pb=byId(cur); if(!pb){ X.toast("Open a bin first, then add a sub-bin inside it"); return; }
  var nm=await window.amiyoAsk("New sub-bin inside “"+pb.name+"”",""); if(nm===null) return; var v=String(nm).trim().slice(0,40); if(!v) return;
  var b={id:newId(),name:v,parent:pb.id}; bins().push(b); M.state.bin=b.id; M.saveBins(); M.render(); X.toast("Sub-bin “"+v+"” made");
};
X.moveBin=async function(){
  var cur=byId(M.state.bin); if(!cur){ X.toast("Open the bin you want to move first"); return; }
  var bad={}; below(cur.id).forEach(function(i){ bad[i]=1; });
  var opts=bins().filter(function(b){ return !bad[b.id]; });
  var list=opts.map(function(b,i){ return (i+1)+". "+path(b.id).map(function(x){ return x.name; }).join(" / "); }).join("\n");
  var a=await window.amiyoAsk("Move “"+cur.name+"” into which bin?\n"+list+"\nType a number, or 0 for the top level.",""); if(a===null) return;
  var n=parseInt(String(a).trim(),10); if(!(n>=0&&n<=opts.length)){ X.toast("Type a number from the list"); return; }
  if(n===0) delete cur.parent; else cur.parent=opts[n-1].id;
  M.saveBins(); M.render(); X.toast(n===0?"Bin moved to the top level":"Bin moved into “"+opts[n-1].name+"”");
};
X.binUp=function(){ var b=byId(M.state.bin); if(!b){ X.toast("Already at All files"); return; } var p=parentOf(b); M.state.bin=p?p.id:"all"; M.state.limit=60; M.render(); };
document.addEventListener("click",function(e){ var t=e.target; if(!t||!t.closest) return;
  if(t.closest("#lrSub")){ e.preventDefault(); X.newSub(); } else if(t.closest("#lrMove")){ e.preventDefault(); X.moveBin(); } else if(t.closest("#lrUp")){ e.preventDefault(); X.binUp(); } },false);
X.css("lr-nest-css","#lrCrumb .chip{padding:3px 8px;font-size:11px}");
X.onRender(X.nest);
X.add({id:"lr_newsub",group:"Bins",label:"New sub-bin in open bin…",run:function(){ X.newSub(); }});
X.add({id:"lr_movebin",group:"Bins",label:"Move open bin into another bin…",run:function(){ X.moveBin(); }});
X.add({id:"lr_binup",group:"Bins",label:"Go up one bin",run:function(){ X.binUp(); }});
try{ window.AMIYO_EDITOR_BUILD="libr-step01-subbins"; }catch(e){}
try{ X.nest(); }catch(e){}
})();

;
/* ==================== Script 684 id="amiyo-libr-step02-bintree" ==================== */
/* Library Premiere-style step 2: bin tree manager. Lib+ > "Bin tree..." shows every bin as an indented tree with its file count
   (own files, plus files inside sub-bins). Each bin has Open, Rename, Colour, Move and Delete. Bin colours show as a coloured edge on the bin buttons. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.binKids||X.binTree) return;
var COL=["","#e5534b","#e08a3c","#e6c84a","#4cae6a","#ef773b","#9a6ae0"];
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function bins(){ return M.state.bins; }
function byId(id){ return bins().find(function(b){ return b.id===id; }); }
function own(id){ return M.items().filter(function(i){ return i.bin===id; }).length; }
function total(id){ var ids=X.binBelow(id), n=0; M.items().forEach(function(i){ if(ids.indexOf(i.bin)>=0) n++; }); return n; }
function rows(pid,depth,out){ X.binKids(pid).sort(function(a,b){ return a.name.localeCompare(b.name); }).forEach(function(b){ out.push([b,depth]); rows(b.id,depth+1,out); }); return out; }
X.binTree=function(){
  var list=rows(null,0,[]); var h='<div id="lrTree" style="font:12.5px/1.4 system-ui;max-height:56vh;overflow:auto">';
  if(!list.length) h+='<div style="padding:10px;color:#a99f8d">No bins yet. Use “＋ Bin” in the Library to make one.</div>';
  list.forEach(function(r){ var b=r[0], d=r[1], o=own(b.id), t=total(b.id);
    h+='<div style="display:flex;align-items:center;gap:6px;padding:5px 4px 5px '+(4+d*16)+'px;border-bottom:1px solid #2a241b;flex-wrap:wrap">'+
      '<span style="width:10px;height:10px;border-radius:3px;background:'+(b.color||"#5a5143")+'"></span>'+
      '<b style="flex:1;min-width:90px;word-break:break-word">'+esc(b.name)+'</b><small style="color:#a99f8d">'+o+(t>o?" (+"+(t-o)+" in sub-bins)":"")+' files</small>'+
      '<span style="display:flex;gap:4px;flex-wrap:wrap">'+["open:Open","ren:Rename","col:Colour","mov:Move","del:Delete"].map(function(x){ var p=x.split(":"); return '<button type="button" class="chip'+(p[0]==="del"?" danger":"")+'" data-bt="'+p[0]+'" data-id="'+esc(b.id)+'">'+p[1]+'</button>'; }).join("")+'</span></div>'; });
  h+='</div><div class="mdetail-actions"><button type="button" class="chip pri" id="lrTreeNew">＋ New bin</button></div>';
  openModal("Bin tree",h);
  var box=document.getElementById("lrTree"); var nb=document.getElementById("lrTreeNew");
  if(nb) nb.onclick=async function(){ closeModal(); var nm=await window.amiyoAsk("New bin name",""); if(nm===null){ return; } var v=String(nm).trim().slice(0,40); if(v){ bins().push({id:"bin_"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),name:v}); M.saveBins(); M.render(); } X.binTree(); };
  if(box) box.onclick=async function(e){ var bt=e.target.closest("button[data-bt]"); if(!bt) return; var b=byId(bt.dataset.id); if(!b) return; var k=bt.dataset.bt;
    if(k==="open"){ closeModal(); M.state.bin=b.id; M.state.limit=60; M.render(); }
    else if(k==="col"){ var i=COL.indexOf(b.color||""); b.color=COL[(i+1)%COL.length]||""; if(!b.color) delete b.color; M.saveBins(); M.render(); X.binTree(); }
    else if(k==="ren"){ closeModal(); var nm=await window.amiyoAsk("Rename bin",b.name); if(nm!==null){ var v=String(nm).trim().slice(0,40); if(v){ b.name=v; M.saveBins(); M.render(); } } X.binTree(); }
    else if(k==="mov"){ closeModal(); M.state.bin=b.id; M.render(); await X.moveBin(); X.binTree(); }
    else if(k==="del"){ closeModal(); var ok=await window.amiyoOk("Delete the bin “"+b.name+"”?\nIts files stay in your Library. Its sub-bins move up one level.",{okLabel:"Delete",danger:true});
      if(ok){ var up=b.parent&&byId(b.parent)?b.parent:null; bins().forEach(function(x){ if(x.parent===b.id){ if(up) x.parent=up; else delete x.parent; } });
        M.items().forEach(function(it){ if(it.bin===b.id){ delete it.bin; try{ M.persist(it); }catch(_){} } });
        M.state.bins=M.state.bins.filter(function(x){ return x.id!==b.id; }); if(M.state.bin===b.id) M.state.bin="all"; M.saveBins(); M.render(); X.toast("Bin deleted"); }
      X.binTree(); } };
};
function paint(){ document.querySelectorAll("#mlibBody .mbins button[data-mbin]").forEach(function(c){ var b=byId(c.dataset.mbin); if(!b) return; var col=b.color?"3px solid "+b.color:""; if(c.style.borderLeft!==col) c.style.borderLeft=col; }); }
X.onRender(paint);
X.add({id:"lr_bintree",group:"Bins",label:"Bin tree…",hint:"counts, colours",run:function(){ X.binTree(); }});
try{ window.AMIYO_EDITOR_BUILD="libr-step02-bintree"; }catch(e){}
})();

;
/* ==================== Script 685 id="amiyo-libr-step03-binhistory" ==================== */
/* Library Premiere-style step 3: bin history. Back and Forward buttons above the bins walk through the bins you opened (like a web browser),
   and a "Recent" row keeps your last 5 bins one tap away. Lib+ > "Back / Forward in bins" does the same from the menu. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.binKids||X.binBack) return;
var H=["all"], pos=0, going=false, REC=[];
try{ REC=JSON.parse(localStorage.getItem("amiyo_lr_recent")||"[]").filter(function(x){ return typeof x==="string"; }).slice(0,5); }catch(e){ REC=[]; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function exists(id){ return id==="all"||M.state.bins.some(function(b){ return b.id===id; }); }
function track(){
  var cur=M.state.bin||"all";
  if(going){ going=false; return; }
  if(H[pos]===cur) return;
  H=H.slice(0,pos+1); H.push(cur); if(H.length>40) H.shift(); pos=H.length-1;
  if(cur!=="all"){ REC=[cur].concat(REC.filter(function(x){ return x!==cur; })).slice(0,5); try{ localStorage.setItem("amiyo_lr_recent",JSON.stringify(REC)); }catch(e){} }
}
function go(d){ var p=pos; do{ p+=d; }while(p>=0&&p<H.length&&!exists(H[p])); if(p<0||p>=H.length){ X.toast(d<0?"No earlier bin":"No later bin"); return; } pos=p; going=true; M.state.bin=H[p]; M.state.limit=60; M.render(); }
X.binBack=function(){ go(-1); }; X.binForward=function(){ go(1); };
function draw(){
  track();
  var row=document.querySelector("#mlibBody .mbins"); if(!row) return;
  var rec=REC.filter(function(id){ return exists(id)&&id!==M.state.bin; });
  var sig=pos+"|"+H.length+"|"+rec.join(",")+"|"+rec.map(function(id){ return (M.state.bins.find(function(b){return b.id===id;})||{}).name; }).join(",");
  var nav=document.getElementById("lrNav");
  if(nav&&nav.dataset.sig===sig&&nav.nextElementSibling===row) return; if(nav) nav.remove();
  nav=document.createElement("div"); nav.id="lrNav"; nav.dataset.sig=sig; nav.style.cssText="display:flex;gap:4px;align-items:center;flex-wrap:wrap;margin:2px 0 4px;font:11px system-ui;color:#a99f8d";
  nav.innerHTML='<button type="button" class="chip" id="lrBack" aria-label="Back to the previous bin"'+(pos<=0?" disabled":"")+'>◀</button><button type="button" class="chip" id="lrFwd" aria-label="Forward to the next bin"'+(pos>=H.length-1?" disabled":"")+'>▶</button>'+
    (rec.length?"<span>Recent:</span>"+rec.map(function(id){ var b=M.state.bins.find(function(x){ return x.id===id; }); return '<button type="button" class="chip" data-mbin="'+esc(id)+'">'+esc(b.name)+'</button>'; }).join(""):"");
  row.parentNode.insertBefore(nav,row);
}
document.addEventListener("click",function(e){ var t=e.target; if(!t||!t.closest) return; if(t.closest("#lrBack")){ e.preventDefault(); X.binBack(); } else if(t.closest("#lrFwd")){ e.preventDefault(); X.binForward(); } },false);
X.onRender(draw);
X.add({id:"lr_back",group:"Bins",label:"Back to previous bin",run:function(){ X.binBack(); }});
X.add({id:"lr_fwd",group:"Bins",label:"Forward to next bin",run:function(){ X.binForward(); }});
try{ window.AMIYO_EDITOR_BUILD="libr-step03-binhistory"; }catch(e){}
})();

;
/* ==================== Script 686 id="amiyo-libr-step04-preview" ==================== */
/* Library Premiere-style step 4: preview area (like the strip at the top of Premiere's Project panel). Tap a file and a small player appears at the top of
   the Library: a scrub bar and play button for video and sound, the picture for images, plus its size, length, stars, label, tags and uses.
   The x button hides it; Lib+ > "Preview area: on / off" brings it back. It is remembered on this device. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.onRender||X.preview) return;
var cur=null, url=null, off=false;
try{ off=localStorage.getItem("amiyo_lr_prev_off")==="1"; }catch(e){}
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function sz(b){ b=+b||0; return b<1048576?Math.round(b/1024)+" KB":b<1073741824?(b/1048576).toFixed(1)+" MB":(b/1073741824).toFixed(2)+" GB"; }
function tm(s){ s=Math.max(0,Math.round(+s||0)); var h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60; return h?h+":"+("0"+m).slice(-2)+":"+("0"+x).slice(-2):m+":"+("0"+x).slice(-2); }
function item(){ var s=M.state; if(s.sel&&s.sel.size===1){ var id=[...s.sel][0]; var i=X.item(id); if(i) return i; } return cur?X.item(cur):null; }
function free(){ if(url){ try{ URL.revokeObjectURL(url); }catch(e){} url=null; } }
X.preview=function(){
  var body=document.getElementById("mlibBody"); var old=document.getElementById("lrPrev");
  var it=off?null:item();
  if(!body||!it){ if(old){ old.remove(); free(); } return; }
  var sig=it.id+"|"+it.name+"|"+(it.rating||0)+"|"+(it.label||"")+"|"+(it.tags||[]).join(",")+"|"+(it.uses||0)+"|"+(it.note||"");
  if(old&&old.dataset.sig===sig&&old.parentNode===body&&body.firstElementChild===old) return;
  if(old){ old.remove(); free(); }
  var d=document.createElement("div"); d.id="lrPrev"; d.dataset.sig=sig; d.dataset.id=it.id;
  d.style.cssText="display:flex;gap:10px;align-items:stretch;background:#17140f;border:1px solid #3a3226;border-radius:10px;padding:8px;margin:0 0 8px;font:12px/1.4 system-ui;color:#e6dfd0";
  var miss=M.state.missing&&M.state.missing.has(it.id);
  var stars=it.rating?"★".repeat(it.rating)+"☆".repeat(5-it.rating):"";
  var info=[it.type, it.width?it.width+"×"+it.height:"", it.duration?tm(it.duration):"", sz(it.size)].filter(Boolean).join(" · ");
  d.innerHTML='<div id="lrPrevMedia" style="flex:0 0 38%;max-width:200px;min-height:70px;background:#0e0c09;border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:30px">'+
      (it.thumb&&it.type!=="video"?'<img alt="" src="'+esc(it.thumb)+'" style="width:100%;height:100%;object-fit:contain">':it.thumb?'<img id="lrPrevImg" alt="" src="'+esc(it.thumb)+'" style="width:100%;height:100%;object-fit:contain">':(it.type==="audio"?"🎵":"🎞"))+'</div>'+
    '<div style="flex:1;min-width:0"><div style="font-weight:700;word-break:break-word">'+esc(it.name)+'</div><div style="color:#a99f8d">'+esc(info)+(miss?' · <span style="color:#e5534b">file missing</span>':"")+'</div>'+
    '<div style="color:#a99f8d">'+[stars,it.label||"",(it.tags||[]).slice(0,4).join(", "),it.uses?"used "+it.uses+"×":"not used"].filter(Boolean).map(esc).join(" · ")+'</div>'+
    (it.note?'<div style="color:#847a6b;font-style:italic">'+esc(String(it.note).slice(0,90))+'</div>':"")+
    '<div id="lrPrevCtl" style="display:flex;gap:6px;align-items:center;margin-top:6px;flex-wrap:wrap"><button type="button" class="chip pri" id="lrPrevAdd">＋ Timeline</button>'+
    ((it.type==="video"||it.type==="audio")&&!miss?'<button type="button" class="chip" id="lrPrevPlay">▶ Play</button><input type="range" id="lrPrevSeek" min="0" max="1000" value="0" aria-label="Scrub" style="flex:1;min-width:80px">':"")+
    '<button type="button" class="chip" id="lrPrevX" aria-label="Hide preview area">×</button></div></div>';
  body.insertBefore(d,body.firstChild);
  var add=d.querySelector("#lrPrevAdd"); if(add) add.onclick=function(){ try{ M.use([it.id],{timeline:true}); }catch(e){ X.toast("Could not add that file"); } };
  var x=d.querySelector("#lrPrevX"); if(x) x.onclick=function(){ off=true; try{ localStorage.setItem("amiyo_lr_prev_off","1"); }catch(e){} d.remove(); free(); };
  var pl=d.querySelector("#lrPrevPlay"), sk=d.querySelector("#lrPrevSeek"), media=d.querySelector("#lrPrevMedia"), el=null, busy=false;
  async function mk(){ if(el) return el; if(busy) return null; busy=true; var b=await M.getBlob(it); busy=false; if(!b){ X.toast("The file is missing"); return null; }
    free(); url=URL.createObjectURL(b); el=document.createElement(it.type==="audio"?"audio":"video"); el.src=url; el.preload="metadata"; el.playsInline=true;
    if(it.type==="video"){ el.style.cssText="width:100%;height:100%;object-fit:contain;background:#000"; media.innerHTML=""; media.appendChild(el); }
    el.addEventListener("timeupdate",function(){ if(el.duration&&sk&&!sk.__drag) sk.value=Math.round(el.currentTime/el.duration*1000); });
    el.addEventListener("ended",function(){ if(pl) pl.textContent="▶ Play"; }); return el; }
  if(pl) pl.onclick=async function(){ var v=await mk(); if(!v) return; if(v.paused){ try{ await v.play(); pl.textContent="❚❚ Pause"; }catch(e){ X.toast("Could not play it"); } } else { v.pause(); pl.textContent="▶ Play"; } };
  if(sk){ sk.addEventListener("pointerdown",function(){ sk.__drag=1; }); sk.addEventListener("pointerup",function(){ sk.__drag=0; });
    sk.oninput=async function(){ var v=await mk(); if(!v) return; var go=function(){ if(v.duration) try{ v.currentTime=v.duration*sk.value/1000; }catch(e){} }; if(v.readyState>=1) go(); else v.addEventListener("loadedmetadata",go,{once:true}); }; }
};
document.addEventListener("pointerdown",function(e){ var c=e.target&&e.target.closest&&e.target.closest("#mlibBody .mcard[data-lib]"); if(c){ cur=c.dataset.lib; setTimeout(X.preview,0); } },true);
X.onRender(X.preview);
X.add({id:"lr_preview",group:"View",label:"Preview area: on / off",run:function(){ off=!off; try{ localStorage.setItem("amiyo_lr_prev_off",off?"1":"0"); }catch(e){} var o=document.getElementById("lrPrev"); if(off&&o){ o.remove(); free(); } else X.preview(); X.toast(off?"Preview area hidden":"Preview area on: tap a file"); }});
try{ window.AMIYO_EDITOR_BUILD="libr-step04-preview"; }catch(e){}
})();

;
/* ==================== Script 687 id="amiyo-libr-step05-columns" ==================== */
/* Library Premiere-style step 5: column chooser for list view (like right-click > Metadata Display in Premiere's Project panel).
   In list view, a "Columns..." button (and Lib+ > "Choose list columns...") lets you tick extra details to show under each file name:
   stars, label, tags, bin path, picture size, aspect, frame count, uses, last used, scene / shot / take, note. Remembered on this device. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.onRender||X.colDefs) return;
function bn(id){ var b=X.binPath?X.binPath(id):[]; return b.map(function(x){ return x.name; }).join(" / "); }
function ago(t){ if(!t) return ""; var d=Math.round((Date.now()-t)/864e5); return d<=0?"today":d===1?"yesterday":d+"d ago"; }
var D=X.colDefs=[
  {id:"rating",label:"Stars",get:function(i){ return i.rating?"★".repeat(i.rating):""; }},
  {id:"label",label:"Label colour",get:function(i){ return i.label||""; }},
  {id:"tags",label:"Tags",get:function(i){ return (i.tags||[]).slice(0,5).join(", "); }},
  {id:"bin",label:"Bin path",get:function(i){ return i.bin?bn(i.bin):""; }},
  {id:"px",label:"Picture size",get:function(i){ return i.width&&i.height?i.width+"×"+i.height:""; }},
  {id:"aspect",label:"Aspect",get:function(i){ if(!i.width||!i.height) return ""; var r=i.width/i.height; return Math.abs(r-16/9)<.02?"16:9":Math.abs(r-9/16)<.02?"9:16":Math.abs(r-1)<.02?"1:1":Math.abs(r-4/3)<.02?"4:3":r.toFixed(2)+":1"; }},
  {id:"uses",label:"Times used",get:function(i){ return i.uses?i.uses+"×":"unused"; }},
  {id:"last",label:"Last used",get:function(i){ return ago(i.lastUsed); }},
  {id:"scene",label:"Scene / shot / take",get:function(i){ return X.log&&X.log.label?X.log.label(i):""; }},
  {id:"note",label:"Note",get:function(i){ return i.note?String(i.note).slice(0,40):""; }}
];
var on=[]; try{ on=JSON.parse(localStorage.getItem("amiyo_lr_cols")||"[]"); if(!Array.isArray(on)) on=[]; }catch(e){ on=[]; }
function save(){ try{ localStorage.setItem("amiyo_lr_cols",JSON.stringify(on)); }catch(e){} }
function paint(){
  var cards=document.querySelectorAll("#mlibBody .mcard[data-lib]"); var list=M.state.view==="list";
  var sig=on.join(",")+"|"+list; var all=M.items();
  cards.forEach(function(c){
    var old=c.querySelector(".lrCols");
    if(!list||!on.length){ if(old) old.remove(); return; }
    var it=all.find(function(i){ return i.id===c.dataset.lib; }); if(!it) return;
    var t=on.map(function(id){ var d=D.find(function(x){ return x.id===id; }); if(!d) return ""; var v=""; try{ v=d.get(it); }catch(e){} return v?(on.length>1?d.label.split(" ")[0]+": ":"")+v:""; }).filter(Boolean).join("  ·  ");
    if(!t){ if(old) old.remove(); return; }
    if(!old){ old=document.createElement("span"); old.className="lrCols"; var m=c.querySelector(".mmeta"); if(!m) return; m.appendChild(old); }
    if(old.textContent!==t) old.textContent=t;
  });
  var hdr=document.querySelector("#mlibBody .libx-cols");
  if(hdr&&!hdr.querySelector("#lrColsBtn")){ var b=document.createElement("button"); b.type="button"; b.id="lrColsBtn"; b.textContent="Columns…"; b.style.flex="0 0 auto"; hdr.appendChild(b); }
}
X.css("lr-cols-css",".lrCols{display:block;margin-top:2px;font:600 10px/1.3 system-ui;color:#c9b98a;white-space:normal;word-break:break-word}");
X.chooseCols=function(){
  var h='<div id="lrColBox" style="font:13px system-ui;display:grid;grid-template-columns:1fr 1fr;gap:6px">'+D.map(function(d){ return '<label style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-c="'+d.id+'"'+(on.indexOf(d.id)>=0?" checked":"")+'>'+d.label+'</label>'; }).join("")+'</div><div style="font:11.5px system-ui;color:#a99f8d;margin-top:8px">Shown under each file name in list view.</div><div class="mdetail-actions"><button type="button" class="chip pri" id="lrColOk">Done</button><button type="button" class="chip" id="lrColNone">Hide all</button></div>';
  openModal("List columns",h);
  var box=document.getElementById("lrColBox");
  box.onchange=function(){ on=D.map(function(d){ return d.id; }).filter(function(id){ var c=box.querySelector('[data-c="'+id+'"]'); return c&&c.checked; }); save(); M.render(); };
  document.getElementById("lrColOk").onclick=function(){ closeModal(); if(M.state.view!=="list") X.toast("Columns show in list view"); };
  document.getElementById("lrColNone").onclick=function(){ on=[]; save(); closeModal(); M.render(); };
};
document.addEventListener("click",function(e){ if(e.target&&e.target.closest&&e.target.closest("#lrColsBtn")){ e.preventDefault(); X.chooseCols(); } },false);
X.onRender(paint);
X.add({id:"lr_cols",group:"View",label:"Choose list columns…",hint:"stars, tags, bin…",run:function(){ X.chooseCols(); }});
try{ window.AMIYO_EDITOR_BUILD="libr-step05-columns"; }catch(e){}
})();

;
/* ==================== Script 688 id="amiyo-libr-step06-customfields" ==================== */
/* Library Premiere-style step 6: custom metadata fields (like Premiere's Metadata panel with your own schema). Lib+ > "Custom fields..." lets you
   make up to 6 fields of your own (for example Camera, Location, Client, Licence). "Fill custom fields for selected..." writes values into one or many files,
   "Find by custom field..." selects matches, and every field becomes a column you can show in list view (Columns...). */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.colDefs||X.fields) return;
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
var F=[]; try{ F=JSON.parse(localStorage.getItem("amiyo_lr_fields")||"[]"); if(!Array.isArray(F)) F=[]; F=F.filter(function(f){ return f&&f.id&&f.name; }).slice(0,6); }catch(e){ F=[]; }
function save(){ try{ localStorage.setItem("amiyo_lr_fields",JSON.stringify(F)); }catch(e){} syncCols(); }
function syncCols(){ var D=X.colDefs; for(var i=D.length-1;i>=0;i--) if(D[i].id.indexOf("cf_")===0) D.splice(i,1);
  F.forEach(function(f){ D.push({id:"cf_"+f.id,label:f.name,get:function(it){ return it.cf&&it.cf[f.id]?String(it.cf[f.id]):""; }}); }); }
syncCols();
X.fields={list:function(){ return F.slice(); }};
function ask(m,d){ return Promise.resolve(window.amiyoAsk?window.amiyoAsk(m,d||""):prompt(m,d||"")); }
function need(){ var s=X.sel(); if(!s.length){ var a=document.activeElement, c=a&&a.closest?a.closest("#mlibBody [data-lib]"):null, it=c&&X.item(c.dataset.lib); if(it) return [it]; X.toast("Select one or more files first (Select button)"); } return s; }
X.customFields=function(){
  var h='<div id="lrCfBox" style="font:13px system-ui">'+(F.length?F.map(function(f){ return '<div style="display:flex;gap:6px;align-items:center;padding:5px 0;border-bottom:1px solid #2a241b"><b style="flex:1">'+esc(f.name)+'</b><button type="button" class="chip" data-a="ren" data-id="'+f.id+'">Rename</button><button type="button" class="chip danger" data-a="del" data-id="'+f.id+'">Remove</button></div>'; }).join(""):'<div style="color:#a99f8d;padding:6px 0">No custom fields yet.</div>')+'</div><div class="mdetail-actions">'+(F.length<6?'<button type="button" class="chip pri" id="lrCfAdd">＋ Add field</button>':'<span style="color:#a99f8d;font:12px system-ui">6 fields is the most</span>')+'</div>';
  openModal("Custom fields",h);
  var add=document.getElementById("lrCfAdd");
  if(add) add.onclick=async function(){ closeModal(); var n=await ask("Field name (for example Camera, Location, Client)",""); if(n!==null){ n=String(n).trim().slice(0,24); if(n&&!F.some(function(f){ return f.name.toLowerCase()===n.toLowerCase(); })){ F.push({id:"f"+Date.now().toString(36).slice(-5)+F.length,name:n}); save(); X.toast("Field “"+n+"” added"); } } X.customFields(); };
  document.getElementById("lrCfBox").onclick=async function(e){ var b=e.target.closest("button[data-a]"); if(!b) return; var f=F.find(function(x){ return x.id===b.dataset.id; }); if(!f) return; closeModal();
    if(b.dataset.a==="ren"){ var n=await ask("Rename field",f.name); if(n!==null){ n=String(n).trim().slice(0,24); if(n){ f.name=n; save(); M.render(); } } }
    else { var ok=await window.amiyoOk("Remove the field “"+f.name+"”?\nIts values are deleted from every file.",{okLabel:"Remove",danger:true}); if(ok){ var ch=[]; M.items().forEach(function(i){ if(i.cf&&f.id in i.cf){ delete i.cf[f.id]; ch.push(i); } }); F=F.filter(function(x){ return x!==f; }); save(); if(ch.length) X.save(ch); else M.render(); } }
    X.customFields(); };
};
X.fillFields=function(){
  if(!F.length){ X.customFields(); return; } var s=need(); if(!s.length) return; var one=s.length===1?s[0]:null;
  var h='<div id="lrCfForm" style="font:12px system-ui">'+F.map(function(f){ return '<label style="display:block;margin:0 0 8px">'+esc(f.name)+'<input type="text" data-f="'+f.id+'" maxlength="120" value="'+esc(one&&one.cf&&one.cf[f.id]||"")+'" placeholder="'+(one?"":"leave empty to keep")+'" style="display:block;width:100%;box-sizing:border-box;margin-top:3px;padding:8px;border-radius:6px;border:1px solid #3a3226;background:#1f1b16;color:#e6dfd0;font:14px system-ui"></label>'; }).join("")+'</div><div class="mdetail-actions"><button type="button" class="chip pri" id="lrCfOk">Apply to '+s.length+(s.length===1?" file":" files")+'</button></div>';
  openModal("Custom fields",h);
  document.getElementById("lrCfOk").onclick=function(){ var n=0; F.forEach(function(f){ var inp=document.querySelector('#lrCfForm [data-f="'+f.id+'"]'); if(!inp) return; var v=inp.value.trim(); if(one||v){ s.forEach(function(i){ i.cf=i.cf||{}; if(v) i.cf[f.id]=v; else delete i.cf[f.id]; }); n++; } });
    closeModal(); X.save(s); X.toast(n?"Custom fields saved":"Nothing to change"); };
};
X.findField=function(){
  if(!F.length){ X.toast("Make a custom field first"); X.customFields(); return; }
  openModal("Find by custom field",'<label style="font:12px system-ui;display:block">Field<select id="lrFfF" style="display:block;width:100%;margin:3px 0 8px;padding:8px;background:#1f1b16;color:#e6dfd0;border:1px solid #3a3226;border-radius:6px">'+F.map(function(f){ return '<option value="'+f.id+'">'+esc(f.name)+'</option>'; }).join("")+'</select></label><label style="font:12px system-ui;display:block">Contains<input id="lrFfT" type="text" style="display:block;width:100%;box-sizing:border-box;margin-top:3px;padding:8px;border-radius:6px;border:1px solid #3a3226;background:#1f1b16;color:#e6dfd0;font:14px system-ui"></label><div class="mdetail-actions"><button type="button" class="chip pri" id="lrFfGo">Select matches</button></div>');
  document.getElementById("lrFfGo").onclick=function(){ var id=document.getElementById("lrFfF").value, t=document.getElementById("lrFfT").value.trim().toLowerCase(); var m=M.items().filter(function(i){ var v=i.cf&&i.cf[id]; return t?(v&&String(v).toLowerCase().indexOf(t)>=0):!!v; }); closeModal(); if(!m.length){ X.toast("No files match"); return; } X.selectIds(m.map(function(i){ return i.id; })); X.toast(m.length+" files selected"); };
};
X.add({id:"lr_cf",group:"Metadata",label:"Custom fields…",hint:"up to 6",run:function(){ X.customFields(); }});
X.add({id:"lr_cffill",group:"Metadata",label:"Fill custom fields for selected…",run:function(){ X.fillFields(); }});
X.add({id:"lr_cffind",group:"Metadata",label:"Find by custom field…",run:function(){ X.findField(); }});
try{ window.AMIYO_EDITOR_BUILD="libr-step06-customfields"; }catch(e){}
})();

;
/* ==================== Script 689 id="amiyo-libr-step07-smartbins" ==================== */
/* Library Premiere-style step 7: live smart bins (like Premiere's Search Bins). Every saved search now shows as a lightning chip under the bins with a live
   file count that updates as you import, rate or tag. Tap one to filter the Library, tap again to clear. Lib+ > "Smart bins..." hides or shows them;
   "Make smart bin from current find..." saves the Advanced find you have on. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.saved||!X.makePred||X.smartBins) return;
var HID={}; try{ HID=JSON.parse(localStorage.getItem("amiyo_lr_smart_hidden")||"{}")||{}; }catch(e){ HID={}; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function same(a,b){ try{ return JSON.stringify(a)===JSON.stringify(b); }catch(e){ return false; } }
function count(s){ var p; try{ p=X.makePred(s.crit); }catch(e){ return 0; } var n=0; M.items().forEach(function(i){ try{ if(p(i)) n++; }catch(e){} }); return n; }
X.smartBins=function(){
  var row=document.querySelector("#mlibBody .mbins"); if(!row) return;
  var list=X.saved().filter(function(s){ return !HID[s.id]; }); var cur=X.findCrit();
  var data=list.map(function(s){ return [s.id,s.name,count(s),same(cur,s.crit)]; });
  var sig=JSON.stringify(data); var old=document.getElementById("lrSmart");
  if(old&&old.dataset.sig===sig&&old.parentNode===row.parentNode) return; if(old) old.remove();
  if(!list.length) return;
  var d=document.createElement("div"); d.id="lrSmart"; d.dataset.sig=sig; d.className="mchips"; d.setAttribute("aria-label","Smart bins");
  d.innerHTML='<span style="font:11px system-ui;color:#a99f8d;align-self:center">Smart:</span>'+data.map(function(r){ return '<button type="button" class="mchip'+(r[3]?" on":"")+'" data-sb="'+esc(r[0])+'" title="Live search">⚡ '+esc(r[1])+'<small>'+r[2]+'</small></button>'; }).join("");
  var after=document.getElementById("lrCrumb"); var ref=after&&after.parentNode===row.parentNode?after:row; ref.parentNode.insertBefore(d,ref.nextSibling);
};
document.addEventListener("click",function(e){ var b=e.target&&e.target.closest&&e.target.closest("#lrSmart [data-sb]"); if(!b) return; e.preventDefault();
  var s=X.saved().find(function(x){ return x.id===b.dataset.sb; }); if(!s) return;
  if(same(X.findCrit(),s.crit)){ X.setFind(null); X.toast("Smart bin off"); } else { X.setFind(s.crit); X.toast("Smart bin: "+s.name); }
  setTimeout(X.smartBins,0); },false);
X.onRender(X.smartBins);
X.add({id:"lr_sb_make",group:"Saved searches",label:"Make smart bin from current find…",run:function(){
  if(!X.findCrit()){ X.toast("Use Advanced find and tap Show matches first"); X.find(); return; }
  Promise.resolve(window.amiyoAsk?window.amiyoAsk("Name this smart bin","My smart bin",{okLabel:"Save"}):prompt("Name this smart bin","My smart bin")).then(function(n){ if(n!=null&&X.saveSearch(n)){ delete HID[(X.saved().find(function(s){ return s.name.toLowerCase()===String(n).trim().toLowerCase(); })||{}).id]; X.smartBins(); } }); }});
X.add({id:"lr_sb_manage",group:"Saved searches",label:"Smart bins…",hint:"show / hide",run:function(){
  var l=X.saved(); if(!l.length){ X.toast("No saved searches yet. Use Advanced find, then Save current find as…"); return; }
  openModal("Smart bins",'<div id="lrSbBox" style="font:13px system-ui">'+l.map(function(s){ return '<label style="display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid #2a241b"><input type="checkbox" data-id="'+esc(s.id)+'"'+(HID[s.id]?"":" checked")+'><span style="flex:1">⚡ '+esc(s.name)+'</span><small style="color:#a99f8d">'+count(s)+' files</small></label>'; }).join("")+'</div>');
  document.getElementById("lrSbBox").onchange=function(e){ var c=e.target; if(!c||!c.dataset.id) return; if(c.checked) delete HID[c.dataset.id]; else HID[c.dataset.id]=1; try{ localStorage.setItem("amiyo_lr_smart_hidden",JSON.stringify(HID)); }catch(_){} X.smartBins(); }; }});
try{ window.AMIYO_EDITOR_BUILD="libr-step07-smartbins"; }catch(e){}
})();

;
/* ==================== Script 690 id="amiyo-libr-step08-importrules" ==================== */
/* Library Premiere-style step 8: import rules (auto-organise). Lib+ > "Import rules..." lets you say: when a file is a [video / sound / picture], its name has [text],
   and it is [vertical / horizontal], then put it in bin [Bin or Parent / Child], give it a label and tags. Turn "Auto" on and new files are sorted the moment
   they are imported; "Apply to files without a bin" sorts what you already have. Files you already filed by hand are never moved. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.onRender||!X.binKids||X.rules) return;
var KEY="amiyo_lr_rules", S={auto:false,since:0,rules:[]};
try{ var o=JSON.parse(localStorage.getItem(KEY)||"null"); if(o&&Array.isArray(o.rules)) S={auto:!!o.auto,since:+o.since||0,rules:o.rules.slice(0,30)}; }catch(e){}
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){} }
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
var LABS=["red","orange","yellow","green","blue","purple"];
function ensureBin(p){ var parent=null, id=null; String(p||"").split("/").map(function(x){ return x.trim().slice(0,40); }).filter(Boolean).forEach(function(seg){
    var f=M.state.bins.find(function(b){ return b.name.toLowerCase()===seg.toLowerCase()&&((b.parent&&M.state.bins.some(function(x){ return x.id===b.parent; })?b.parent:null)===parent); });
    if(!f){ f={id:"bin_"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),name:seg}; if(parent) f.parent=parent; M.state.bins.push(f); }
    parent=f.id; id=f.id; }); return id; }
function match(r,i){ var w=r.w||{}; if(w.type&&w.type!=="any"&&i.type!==w.type) return false;
  if(w.name){ var n=String(i.name||"").toLowerCase(); if(w.name.toLowerCase().split(/\s+/).filter(Boolean).some(function(t){ return n.indexOf(t)<0; })) return false; }
  if(w.orient&&w.orient!=="any"){ if(!i.width||!i.height) return false; var v=i.height>i.width; if(w.orient==="vertical"&&!v) return false; if(w.orient==="horizontal"&&v) return false; }
  return true; }
function run(items){ var n=0, chg=[], mk=false;
  items.forEach(function(it){ var did=false;
    S.rules.forEach(function(r){ if(!match(r,it)) return;
      if(r.bin&&!it.bin){ var b=ensureBin(r.bin); if(b){ it.bin=b; did=true; mk=true; } }
      if(r.label&&!it.label){ it.label=r.label; did=true; }
      if(r.tags&&r.tags.length){ var t=(it.tags||[]).slice(); r.tags.forEach(function(x){ if(t.indexOf(x)<0&&t.length<12){ t.push(x); did=true; } }); it.tags=t; } });
    if(did){ n++; chg.push(it); } it.lrR=1; if(!did) chg.push(it); });
  if(mk) M.saveBins(); if(chg.length) X.save(chg); return n; }
X.rules={state:function(){ return S; },run:run};
var busy=false;
X.onRender(function(){ if(!S.auto||busy||!S.rules.length) return; var fresh=M.items().filter(function(i){ return !i.lrR&&(+i.addedAt||0)>S.since&&!i.isSubclip; }); if(!fresh.length) return; busy=true; setTimeout(function(){ try{ var n=run(fresh); if(n) X.toast(n+(n===1?" new file sorted":" new files sorted")+" by your rules"); }catch(e){} busy=false; },200); });
function desc(r){ var w=r.w||{}, a=[]; if(w.type&&w.type!=="any") a.push(w.type); if(w.orient&&w.orient!=="any") a.push(w.orient); if(w.name) a.push("name has “"+w.name+"”"); var t=[]; if(r.bin) t.push("→ "+r.bin); if(r.label) t.push(r.label); if(r.tags&&r.tags.length) t.push("#"+r.tags.join(" #")); return (a.length?a.join(", "):"every file")+"  "+t.join("  "); }
var IN='display:block;width:100%;box-sizing:border-box;margin-top:3px;padding:7px;border-radius:6px;border:1px solid #3a3226;background:#1f1b16;color:#e6dfd0;font:13px system-ui';
function sel(id,arr){ return '<select id="'+id+'" style="'+IN+'">'+arr.map(function(a){ return '<option>'+a+'</option>'; }).join("")+'</select>'; }
X.rulesDialog=function(){
  var h='<div id="lrRuBox" style="font:12.5px system-ui"><label style="display:flex;gap:8px;align-items:center;margin-bottom:8px"><input type="checkbox" id="lrRuAuto"'+(S.auto?" checked":"")+'> Sort new files automatically</label>'+
    (S.rules.length?S.rules.map(function(r,i){ return '<div style="display:flex;gap:6px;align-items:center;padding:5px 0;border-bottom:1px solid #2a241b"><span style="flex:1;word-break:break-word"><b>'+esc(r.name)+'</b><br><small style="color:#a99f8d">'+esc(desc(r))+'</small></span><button type="button" class="chip danger" data-del="'+i+'">Remove</button></div>'; }).join(""):'<div style="color:#a99f8d;padding:4px 0 8px">No rules yet.</div>')+
    '<div style="margin-top:8px;font-weight:700">New rule</div><label>Name<input id="lrRuN" type="text" maxlength="30" style="'+IN+'" placeholder="Phone clips"></label>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px"><label>Type'+sel("lrRuT",["any","video","audio","image"])+'</label><label>Shape'+sel("lrRuO",["any","vertical","horizontal"])+'</label></div>'+
    '<label>Name has<input id="lrRuW" type="text" maxlength="40" style="'+IN+'" placeholder="IMG_ or drone"></label>'+
    '<label>Put in bin (use / for sub-bins)<input id="lrRuB" type="text" maxlength="80" style="'+IN+'" placeholder="Footage / Vertical"></label>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px"><label>Label'+sel("lrRuL",["none"].concat(LABS))+'</label><label>Tags (commas)<input id="lrRuG" type="text" style="'+IN+'"></label></div></div>'+
    '<div class="mdetail-actions"><button type="button" class="chip pri" id="lrRuAdd">Add rule</button><button type="button" class="chip" id="lrRuApply">Apply to files without a bin</button></div>';
  openModal("Import rules",h);
  var $=function(id){ return document.getElementById(id); };
  $("lrRuAuto").onchange=function(){ S.auto=this.checked; if(S.auto) S.since=Date.now(); save(); X.toast(S.auto?"New files will be sorted by your rules":"Auto-sort off"); };
  $("lrRuBox").onclick=function(e){ var d=e.target.closest("button[data-del]"); if(!d) return; S.rules.splice(+d.dataset.del,1); save(); closeModal(); X.rulesDialog(); };
  $("lrRuAdd").onclick=function(){ var r={name:$("lrRuN").value.trim()||"Rule "+(S.rules.length+1),w:{type:$("lrRuT").value,orient:$("lrRuO").value,name:$("lrRuW").value.trim()},bin:$("lrRuB").value.trim(),label:$("lrRuL").value==="none"?"":$("lrRuL").value,tags:$("lrRuG").value.split(",").map(function(x){ return x.trim().slice(0,24); }).filter(Boolean).slice(0,6)};
    if(!r.bin&&!r.label&&!r.tags.length){ X.toast("Give the rule a bin, a label or tags"); return; } if(S.rules.length>=30){ X.toast("30 rules is the most"); return; } S.rules.push(r); save(); closeModal(); X.rulesDialog(); };
  $("lrRuApply").onclick=function(){ var list=M.items().filter(function(i){ return !i.bin; }); var n=run(list); closeModal(); M.render(); X.toast(n?n+" files sorted":"No file matched a rule"); };
};
X.add({id:"lr_rules",group:"Import",label:"Import rules…",hint:"auto-sort",run:function(){ X.rulesDialog(); }});
try{ window.AMIYO_EDITOR_BUILD="libr-step08-importrules"; }catch(e){}
})();

;
/* ==================== Script 691 id="amiyo-libr-step09-subclips" ==================== */
/* Library Premiere-style step 9: subclips from clip markers (like Premiere's "Make Subclip" run on every marker). Lib+ > "Subclips from markers..." cuts each selected
   file at its clip markers: the part from one marker to the next becomes its own Library subclip named after the marker note (the last one runs to the end).
   Nothing is copied: subclips point at the same stored file. "Select subclips of selected" and "Select source of subclips" jump between parent and children. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.cm||X.subsFromMarkers) return;
function tcs(t){ t=Math.max(0,+t||0); var m=Math.floor(t/60), s=Math.floor(t-m*60); return m+":"+(s<10?"0":"")+s; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function need(){ var s=X.sel(); if(!s.length){ var a=document.activeElement, c=a&&a.closest?a.closest("#mlibBody [data-lib]"):null, it=c&&X.item(c.dataset.lib); if(it) return [it]; X.toast("Select one or more files first (Select button)"); } return s; }
function plan(it){ var out=[]; if(it.type==="image"||it.isSubclip) return out; var full=+it.duration||0; var L=X.cm.list(it); if(!L.length||!full) return out;
  for(var k=0;k<L.length;k++){ var a=L[k].t, b=k+1<L.length?L[k+1].t:full; if(b-a>=0.2) out.push({i:a,o:Math.min(b,full),text:L[k].text||""}); } return out; }
X.subsFromMarkers=function(list){
  var all=M.items(), made=0, skip=0, noM=0, chg=[];
  list.forEach(function(it){ var p=plan(it); if(!p.length){ noM++; return; }
    p.forEach(function(s){ if(all.some(function(x){ return x.subOf===it.id&&Math.abs((x.markIn||0)-s.i)<0.01&&Math.abs((x.markOut||0)-s.o)<0.01; })){ skip++; return; }
      var n={id:"lib_"+Date.now().toString(36)+Math.random().toString(36).slice(2,7),fp:(it.fp||it.id)+"#sub"+Date.now().toString(36)+Math.random().toString(36).slice(2,4),blobKey:it.blobKey,
        name:String(it.name).replace(/ \[[^\]]*\]$/,"")+" — "+(s.text||tcs(s.i)),type:it.type,mime:it.mime||"",size:it.size||0,width:it.width||0,height:it.height||0,
        duration:s.o-s.i,srcDur:it.duration,markIn:s.i,markOut:s.o,isSubclip:true,subOf:it.id,addedAt:Date.now()+made,lastUsed:0,imports:1,uses:0,thumb:it.thumb||null};
      if(it.bin) n.bin=it.bin; if(it.label) n.label=it.label; if(it.tags&&it.tags.length) n.tags=it.tags.slice();
      all.push(n); chg.push(n); made++; }); });
  if(chg.length) X.save(chg);
  X.toast(made?made+(made===1?" subclip":" subclips")+" made"+(skip?" ("+skip+" already existed)":""):(noM===list.length?"These files have no clip markers (Lib+ > Clip markers…)":"No new subclips"),3200); return made;
};
X.subsDialog=function(){
  var s=need(); if(!s.length) return; var tot=0, files=0; s.forEach(function(i){ var n=plan(i).length; if(n){ tot+=n; files++; } });
  if(!tot){ X.toast("Add clip markers first: Lib+ > Clip markers…",3200); return; }
  openModal("Subclips from markers",'<div style="font:13px/1.5 system-ui">'+files+(files===1?" file":" files")+' will give <b>'+tot+'</b> subclips, one from each marker to the next.<br><small style="color:#a99f8d">Subclips that already exist are skipped.</small></div><div class="mdetail-actions"><button type="button" class="chip pri" id="lrSubGo">Make '+tot+' subclips</button></div>');
  document.getElementById("lrSubGo").onclick=function(){ closeModal(); X.subsFromMarkers(s); };
};
X.add({id:"lr_subs",group:"Organize",label:"Subclips from markers…",hint:"one per marker",run:function(){ X.subsDialog(); }});
X.add({id:"lr_subsel",group:"Select",label:"Select subclips of selected files",run:function(){ var s=need(); if(!s.length) return; var ids={}; s.forEach(function(i){ ids[i.id]=1; }); var m=M.items().filter(function(i){ return i.subOf&&ids[i.subOf]; }); if(!m.length){ X.toast("No subclips of these files"); return; } X.selectIds(m.map(function(i){ return i.id; })); X.toast(m.length+" subclips selected"); }});
X.add({id:"lr_srcsel",group:"Select",label:"Select source files of selected subclips",run:function(){ var s=need(); if(!s.length) return; var ids={}; s.forEach(function(i){ if(i.subOf) ids[i.subOf]=1; }); var m=M.items().filter(function(i){ return ids[i.id]; }); if(!m.length){ X.toast("Select subclips first"); return; } X.selectIds(m.map(function(i){ return i.id; })); }});
try{ window.AMIYO_EDITOR_BUILD="libr-step09-subclips"; }catch(e){}
})();

;
/* ==================== Script 692 id="amiyo-libr-step10-scenes" ==================== */
/* Library Premiere-style step 10: scene detection in the Library (like Premiere's Scene Edit Detection). Lib+ > "Detect scenes..." looks through each selected video
   at small sample pictures, finds hard cuts and adds a clip marker ("Scene 1", "Scene 2"...) at every cut. Optionally it makes a subclip per scene right away.
   The video plays from its stored file, so even very large files are scanned without loading them into memory. You can cancel any time. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.cm||!X.subsFromMarkers||X.detectScenes) return;
var cancel=false, running=false;
function need(){ var s=X.sel().filter(function(i){ return i.type==="video"&&!(M.state.missing&&M.state.missing.has(i.id)); }); if(!s.length){ var a=document.activeElement, c=a&&a.closest?a.closest("#mlibBody [data-lib]"):null, it=c&&X.item(c.dataset.lib); if(it&&it.type==="video") return [it]; X.toast("Select one or more videos first (Select button)"); } return s; }
function seek(v,t){ return new Promise(function(res){ var done=false, to=setTimeout(function(){ if(!done){ done=true; v.removeEventListener("seeked",f); res(false); } },4000); function f(){ if(done) return; done=true; clearTimeout(to); v.removeEventListener("seeked",f); res(true); } v.addEventListener("seeked",f); try{ v.currentTime=t; }catch(e){ done=true; clearTimeout(to); res(false); } }); }
async function scan(it,thr,prog){
  var b=await M.getBlob(it); if(!b) return null; var url=URL.createObjectURL(b), v=document.createElement("video"); v.muted=true; v.playsInline=true; v.preload="auto"; v.src=url;
  try{ await new Promise(function(res,rej){ v.onloadedmetadata=res; v.onerror=function(){ rej(new Error("x")); }; setTimeout(function(){ rej(new Error("t")); },8000); });
    var dur=v.duration||it.duration||0; if(!(dur>1)) return []; var step=Math.max(0.4,dur/500), n=Math.min(500,Math.floor(dur/step));
    var cv=document.createElement("canvas"); cv.width=32; cv.height=18; var cx=cv.getContext("2d",{willReadFrequently:true}), prev=null, cuts=[], last=-9;
    for(var k=1;k<=n;k++){ if(cancel) return null; var t=Math.min(dur-0.05,k*step); if(!(await seek(v,t))) continue;
      cx.drawImage(v,0,0,32,18); var d=cx.getImageData(0,0,32,18).data, lum=new Float32Array(576); for(var p=0;p<576;p++) lum[p]=d[p*4]*0.3+d[p*4+1]*0.59+d[p*4+2]*0.11;
      if(prev){ var s=0; for(var q=0;q<576;q++) s+=Math.abs(lum[q]-prev[q]); s/=576; if(s>=thr&&t-last>=1){ cuts.push(Math.round((t-step/2)*10)/10); last=t; } }
      prev=lum; if(k%5===0) prog(k/n); }
    return cuts;
  } finally { try{ v.removeAttribute("src"); v.load(); }catch(e){} try{ URL.revokeObjectURL(url); }catch(e){} }
}
X.detectScenes=async function(list,thr,withSubs){
  if(running) return; running=true; cancel=false; var made=0, fails=0, subs=0;
  openModal("Detecting scenes",'<div style="font:13px/1.6 system-ui"><div id="lrScTxt">Starting…</div><div style="height:8px;background:#2a241b;border-radius:4px;margin:8px 0;overflow:hidden"><i id="lrScBar" style="display:block;height:100%;width:0;background:#ff7a3d"></i></div></div><div class="mdetail-actions"><button type="button" class="chip danger" id="lrScStop">Cancel</button></div>');
  document.getElementById("lrScStop").onclick=function(){ cancel=true; };
  for(var j=0;j<list.length;j++){ var it=list[j]; if(cancel) break;
    var tx=document.getElementById("lrScTxt"); if(tx) tx.textContent="File "+(j+1)+" of "+list.length+": "+it.name;
    var cuts=null; try{ cuts=await scan(it,thr,function(f){ var bar=document.getElementById("lrScBar"); if(bar) bar.style.width=Math.round(((j+f)/list.length)*100)+"%"; }); }catch(e){ cuts=null; }
    if(cuts===null){ if(!cancel) fails++; continue; }
    var L=X.cm.list(it).filter(function(m){ return !/^Scene \d+$/.test(m.text||""); }); var all=[{t:0,text:"Scene 1"}].concat(cuts.map(function(t,i){ return {t:t,text:"Scene "+(i+2)}; }));
    it.cmarks=L.concat(all).sort(function(a,b){ return a.t-b.t; }).slice(0,300); X.save([it]); made+=all.length;
    if(withSubs){ subs+=X.subsFromMarkers([it])||0; } }
  running=false; try{ closeModal(); }catch(e){}
  X.toast(cancel?"Cancelled":made?made+" scenes marked in "+(list.length-fails)+(list.length-fails===1?" file":" files")+(subs?", "+subs+" subclips made":"")+(fails?" ("+fails+" could not be read)":""):"No scenes found",3600);
};
X.sceneDialog=function(){
  var s=need(); if(!s.length) return;
  var IN='display:block;width:100%;margin-top:3px;padding:8px;border-radius:6px;border:1px solid #3a3226;background:#1f1b16;color:#e6dfd0;font:13px system-ui';
  openModal("Detect scenes",'<div style="font:12.5px/1.5 system-ui"><label>Sensitivity<select id="lrScSens" style="'+IN+'"><option value="40">Low: only obvious hard cuts</option><option value="28" selected>Medium</option><option value="18">High: also fast changes</option></select></label><label style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" id="lrScSub"> Also make a subclip for every scene</label><div style="color:#a99f8d;margin-top:8px">'+s.length+(s.length===1?" video":" videos")+'. Long videos take a while: keep this tab open.</div></div><div class="mdetail-actions"><button type="button" class="chip pri" id="lrScGo">Start</button></div>');
  document.getElementById("lrScGo").onclick=function(){ var t=+document.getElementById("lrScSens").value, sb=document.getElementById("lrScSub").checked; closeModal(); X.detectScenes(s,t,sb); };
};
X.add({id:"lr_scenes",group:"Analyse",label:"Detect scenes…",hint:"adds markers",run:function(){ X.sceneDialog(); }});
try{ window.AMIYO_EDITOR_BUILD="libr-step10-scenes"; }catch(e){}
})();

;
/* ==================== Script 693 id="amiyo-libr-step11-separatetracks" ==================== */
/* Library Clipchamp-style: add several videos on separate tracks. Select videos / pictures in the Library (Select button), then tap "▤ Tracks" in the bar
   (or Lib+ > "Add selected on separate tracks"). Video 1 goes on the first video track, video 2 on the next track, video 3 on the next one, and so on; new tracks are made
   for you. Choose "Stacked" (all start at the playhead, layered like Clipchamp) or "Staggered" (each starts when the one before it ends, one line per clip).
   Sounds go to the sound track. Everything is one undo step. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.onRender||X.addTracks) return;
function assetFor(it){ var a=Object.values(project.assets).find(function(x){ return x.libId===it.id; }); if(!a) a=project.assets[it.blobKey]; return a||null; }
X.addTracks=async function(ids,mode){
  var items=ids.map(function(id){ return X.item(id); }).filter(Boolean);
  if(!items.length){ X.toast("Select videos first (Select button)"); return; }
  var ok=[]; for(var k=0;k<items.length;k++){ var it=items[k]; if(M.state.missing&&M.state.missing.has(it.id)) continue; try{ await M.use([it.id],{}); }catch(e){ continue; } var a=assetFor(it); if(a) ok.push([it,a]); }
  if(!ok.length){ X.toast("Those files could not be added"); return; }
  var before=deepClone(serializableProject()), vi=0, at=currentTime, nextStart=currentTime, made=0, lastClip=null;
  function vtrack(n){ var v=project.tracks.filter(function(t){ return t.kind==="video"; }); while(v.length<=n){ var t={id:uid("track"),kind:"video",name:"Video "+(v.length+1),clips:[],muted:false,hidden:false}; project.tracks.push(t); v.push(t); made++; } return v[n]; }
  ok.forEach(function(p){ var it=p[0], a=p[1], aud=a.type==="audio"; var track=aud?getTrack("audio"):vtrack(mode==="line"?0:vi);
    var dur=Math.max(.5,a.duration||5), inP=0, outP=dur;
    if(it.isSubclip&&it.markIn!=null&&it.markOut!=null){ inP=it.markIn; outP=it.markOut; dur=Math.max(.2,outP-inP); }
    var start=(mode==="stagger"||mode==="line")?nextStart:at; if(mode==="stagger"||mode==="line") nextStart=start+dur;
    var c={id:uid("clip"),assetId:a.id,start:start,duration:dur,inPoint:inP,outPoint:outP,volume:1,opacity:1,speed:1,rotation:0,scale:1,x:.5,y:.5,trimL:0,trimR:0,fit:"contain",effects:[],keyframes:[],transitionIn:null,transitionOut:null};
    if(!aud&&a.type==="image"){ c.inPoint=0; c.outPoint=dur; }
    track.clips.push(c); track.clips.sort(function(x,y){ return x.start-y.start; }); lastClip=c; selectedTrackId=track.id; if(!aud) vi++; });
  if(lastClip) selectedClipId=lastClip.id;
  var after=serializableProject(); recordHistory("Add on separate tracks",before,after); scheduleAutosave(); renderAll();
  try{ closeSheet(); }catch(e){}
  var used=mode==="line"?1:(vi||1); X.toast(ok.length+(ok.length===1?" file":" files")+" added on "+used+(used===1?" track":" tracks")+(made?" ("+made+" new)":""),3200);
};
X.tracksDialog=function(){
  var ids=[]; if(M.state.sel&&M.state.sel.size) ids=[...M.state.sel]; else { var a=document.activeElement, c=a&&a.closest?a.closest("#mlibBody [data-lib]"):null; if(c) ids=[c.dataset.lib]; }
  if(!ids.length){ X.toast("Tap Select, choose 2 or more videos, then try again"); return; }
  var IN='display:flex;gap:8px;align-items:flex-start;margin:6px 0;font:13px/1.4 system-ui';
  openModal("Add on separate tracks",'<div style="font:12.5px/1.5 system-ui;color:#a99f8d;margin-bottom:6px">'+ids.length+(ids.length===1?" file":" files")+' selected. Choose how they are placed: each on its own track, or all on the same line.</div>'+
    '<label style="'+IN+'"><input type="radio" name="lrTkM" value="stack" checked> <span><b>Own track, stacked</b><br><small style="color:#a99f8d">Each on its own line, all start at the playhead (like picture-in-picture)</small></span></label>'+
    '<label style="'+IN+'"><input type="radio" name="lrTkM" value="stagger"> <span><b>Own track, staggered</b><br><small style="color:#a99f8d">One line each, every clip starts when the one before it ends</small></span></label>'+'<label style="'+IN+'"><input type="radio" name="lrTkM" value="line"> <span><b>Same line</b><br><small style="color:#a99f8d">All on the first video track, one after another</small></span></label>'+
    '<div class="mdetail-actions"><button type="button" class="chip pri" id="lrTkGo">Add to timeline</button></div>');
  document.getElementById("lrTkGo").onclick=function(){ var m=(document.querySelector('input[name="lrTkM"]:checked')||{}).value||"stack"; closeModal(); X.addTracks(ids,m); };
};
function bar(){ var b=document.querySelector("#mlibBody .mlib-bar"); if(!b||b.querySelector("#lrTkBtn")||!M.state.sel||M.state.sel.size<1) return;
  var x=document.createElement("button"); x.type="button"; x.id="lrTkBtn"; x.className="chip pri"; x.textContent="▤ Tracks"; x.title="Add each selected video on its own track"; b.appendChild(x); }
document.addEventListener("click",function(e){ if(e.target&&e.target.closest&&e.target.closest("#lrTkBtn")){ e.preventDefault(); X.tracksDialog(); } },false);
X.onRender(bar);
X.add({id:"lr_tracks",group:"Timeline",label:"Add selected on separate tracks…",hint:"1 per line",run:function(){ X.tracksDialog(); }});
try{ window.AMIYO_EDITOR_BUILD="libr-step12-trackoptions"; }catch(e){}
})();

;
/* ==================== Script 694 id="amiyo-libr-step13-silence" ==================== */
/* Library Premiere-style step 13: silence detection. Lib+ > "Find silences..." listens to the sound of each selected video or sound file and finds the quiet gaps.
   Choose how quiet counts as silence and how long a gap must last, then either mark every silence with a clip marker, or cut the file into its speech
   parts as subclips (the quiet gaps are left out). Files up to about 400 MB are analysed; very large files are skipped with a message. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.cm||!X.save||X.findSilence) return;
var MAXB=400*1048576, busy=false;
function need(){ var s=X.sel().filter(function(i){ return (i.type==="video"||i.type==="audio")&&!(M.state.missing&&M.state.missing.has(i.id)); }); if(!s.length){ var a=document.activeElement, c=a&&a.closest?a.closest("#mlibBody [data-lib]"):null, it=c&&X.item(c.dataset.lib); if(it&&(it.type==="video"||it.type==="audio")) return [it]; X.toast("Select one or more videos or sounds first (Select button)"); } return s; }
async function levels(it){
  var b=await M.getBlob(it); if(!b) return {err:"The file is missing"}; if(b.size>MAXB) return {err:"Too big to analyse (over 400 MB)"};
  var buf=await b.arrayBuffer(), AC=window.AudioContext||window.webkitAudioContext, ctx=new AC();
  try{ var ab=await new Promise(function(res,rej){ ctx.decodeAudioData(buf,res,rej); }); var d=ab.getChannelData(0), sr=ab.sampleRate, win=Math.floor(sr*0.05), n=Math.floor(d.length/win), out=new Float32Array(n);
    for(var k=0;k<n;k++){ var s=0, o=k*win; for(var j=0;j<win;j+=4){ var v=d[o+j]; s+=v*v; } out[k]=10*Math.log10(s/(win/4)+1e-12); }
    return {db:out,step:0.05,dur:ab.duration}; }
  catch(e){ return {err:"No sound could be read"}; } finally { try{ ctx.close(); }catch(e){} }
}
function gaps(L,thr,minLen){ var out=[], st=-1; for(var k=0;k<=L.db.length;k++){ var q=k<L.db.length&&L.db[k]<thr; if(q&&st<0) st=k; if(!q&&st>=0){ var a=st*L.step, b=k*L.step; if(b-a>=minLen) out.push([a,Math.min(b,L.dur)]); st=-1; } } return out; }
X.findSilence=async function(list,o){
  if(busy) return; busy=true; var marks=0, subs=0, skip=0, msg="";
  openModal("Finding silences",'<div id="lrSiTx" style="font:13px/1.6 system-ui">Starting…</div>');
  var all=M.items(), chg=[];
  for(var j=0;j<list.length;j++){ var it=list[j], tx=document.getElementById("lrSiTx"); if(tx) tx.textContent="File "+(j+1)+" of "+list.length+": "+it.name;
    var L=null; try{ L=await levels(it); }catch(e){ L={err:"Could not analyse"}; } if(L.err){ skip++; msg=L.err; continue; }
    var G=gaps(L,o.thr,o.min);
    if(o.mode==="mark"){ var keep=X.cm.list(it).filter(function(m){ return !/^Silence \d+$/.test(m.text||""); }); it.cmarks=keep.concat(G.map(function(g,i){ return {t:Math.round(g[0]*100)/100,text:"Silence "+(i+1)}; })).sort(function(a,b){ return a.t-b.t; }).slice(0,300); chg.push(it); marks+=G.length; }
    else { var parts=[], cur=0, pad=0.08; G.forEach(function(g){ if(g[0]-cur>=0.3) parts.push([Math.max(0,cur-pad),Math.min(L.dur,g[0]+pad)]); cur=g[1]; }); if(L.dur-cur>=0.3) parts.push([Math.max(0,cur-pad),L.dur]);
      if(it.isSubclip) { skip++; msg="Subclips cannot be cut again"; continue; }
      parts.forEach(function(p,i){ if(p[1]-p[0]<0.2) return; if(all.some(function(x){ return x.subOf===it.id&&Math.abs((x.markIn||0)-p[0])<0.05&&Math.abs((x.markOut||0)-p[1])<0.05; })) return;
        var n={id:"lib_"+Date.now().toString(36)+Math.random().toString(36).slice(2,7),fp:(it.fp||it.id)+"#sil"+Date.now().toString(36)+Math.random().toString(36).slice(2,4),blobKey:it.blobKey,name:String(it.name).replace(/ \[[^\]]*\]$/,"")+" — part "+(i+1),type:it.type,mime:it.mime||"",size:it.size||0,width:it.width||0,height:it.height||0,duration:p[1]-p[0],srcDur:it.duration,markIn:p[0],markOut:p[1],isSubclip:true,subOf:it.id,addedAt:Date.now()+subs,lastUsed:0,imports:1,uses:0,thumb:it.thumb||null};
        if(it.bin) n.bin=it.bin; if(it.label) n.label=it.label; if(it.tags&&it.tags.length) n.tags=it.tags.slice(); all.push(n); chg.push(n); subs++; }); } }
  if(chg.length) X.save(chg); busy=false; try{ closeModal(); }catch(e){}
  X.toast(o.mode==="mark"?(marks?marks+" silences marked":"No silences found"):(subs?subs+" speech parts made as subclips":"No parts made"),3000);
  if(skip) setTimeout(function(){ X.toast(skip+(skip===1?" file skipped: ":" files skipped: ")+msg,3600); },3200);
};
X.silenceDialog=function(){
  var s=need(); if(!s.length) return; var IN='display:block;width:100%;margin-top:3px;padding:8px;border-radius:6px;border:1px solid #3a3226;background:#1f1b16;color:#e6dfd0;font:13px system-ui';
  openModal("Find silences",'<div style="font:12.5px/1.5 system-ui"><label>What counts as silence<select id="lrSiT" style="'+IN+'"><option value="-50">Very quiet (−50 dB)</option><option value="-40" selected>Quiet (−40 dB)</option><option value="-30">Fairly quiet (−30 dB)</option></select></label>'+
    '<label style="display:block;margin-top:8px">At least this long<select id="lrSiM" style="'+IN+'"><option value="0.3">0.3 seconds</option><option value="0.5" selected>0.5 seconds</option><option value="1">1 second</option><option value="2">2 seconds</option></select></label>'+
    '<label style="display:block;margin-top:8px">Then<select id="lrSiMode" style="'+IN+'"><option value="mark">Mark each silence (clip marker)</option><option value="cut">Cut into speech parts (subclips)</option></select></label><div style="color:#a99f8d;margin-top:8px">'+s.length+(s.length===1?" file":" files")+'</div></div><div class="mdetail-actions"><button type="button" class="chip pri" id="lrSiGo">Start</button></div>');
  document.getElementById("lrSiGo").onclick=function(){ var o={thr:+document.getElementById("lrSiT").value,min:+document.getElementById("lrSiM").value,mode:document.getElementById("lrSiMode").value}; closeModal(); X.findSilence(s,o); };
};
X.add({id:"lr_silence",group:"Analyse",label:"Find silences…",hint:"mark or cut",run:function(){ X.silenceDialog(); }});
try{ window.AMIYO_EDITOR_BUILD="libr-step13-silence"; }catch(e){}
})();

;
/* ==================== Script 695 id="amiyo-libr-step14-mergeclips" ==================== */
/* Library Premiere-style step 14: Merge Clips (audio sync), like Premiere's "Merge Clips". Select two files: a video and the separate sound that was recorded with it
   (a mic recording, for example). Lib+ > "Merge clips (sync sound)..." listens to both, finds how far apart they start by matching their loudness pattern,
   shows the offset (you can nudge it), and adds the picture and the synced sound to the timeline together. The camera's own sound can be muted. Analyses the first 90 seconds. */
(function(){"use strict";
var X=window.AMIYO_LIBX, M=window.amiyoMediaLib; if(!X||!X.save||X.mergeClips) return;
var MAXB=400*1048576;
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
async function env(it){ var b=await M.getBlob(it); if(!b) throw new Error("The file “"+it.name+"” is missing"); if(b.size>MAXB) throw new Error("“"+it.name+"” is too big to analyse (over 400 MB)");
  var AC=window.AudioContext||window.webkitAudioContext, ctx=new AC(); 
  var buf=await b.arrayBuffer(), a; try{ a=await new Promise(function(res,rej){ ctx.decodeAudioData(buf,res,rej); }); }catch(e){ try{ ctx.close(); }catch(_){} throw new Error("No sound in “"+it.name+"”"); }
  var d=a.getChannelData(0), sr=a.sampleRate, win=Math.floor(sr*0.01), n=Math.min(Math.floor(d.length/win),9000), out=new Float32Array(n), m=0;
  for(var k=0;k<n;k++){ var s=0, o=k*win; for(var j=0;j<win;j+=2) s+=Math.abs(d[o+j]); out[k]=s/(win/2); m+=out[k]; } m/=n||1; var sd=0; for(k=0;k<n;k++){ out[k]-=m; sd+=out[k]*out[k]; } sd=Math.sqrt(sd/(n||1))||1; for(k=0;k<n;k++) out[k]/=sd;
  try{ ctx.close(); }catch(_){} return {e:out,dur:a.duration}; }
function xcorr(v,a){ var best=-1e9, lag=0, N=v.length, M2=a.length, R=3000; for(var L=-R;L<=R;L+=1){ var s=0, c=0, i0=Math.max(0,-L), i1=Math.min(N,M2-L); for(var i=i0;i<i1;i++){ s+=v[i]*a[i+L]; c++; } if(c<300) continue; s/=c; if(s>best){ best=s; lag=L; } } return {lag:lag,score:best}; }
function assetFor(it){ var a=Object.values(project.assets).find(function(x){ return x.libId===it.id; }); return a||project.assets[it.blobKey]||null; }
X.mergeClips=async function(vi,ai){
  openModal("Syncing",'<div style="font:13px/1.6 system-ui">Listening to both files…<br><small style="color:#a99f8d">Keep this tab open.</small></div>');
  var r; try{ var ev=await env(vi), ea=await env(ai); r=xcorr(ev.e,ea.e); }catch(e){ closeModal(); X.toast(e.message||"Could not sync",3600); return; }
  var off=r.lag*0.01, conf=Math.max(0,Math.min(1,r.score)), IN='display:block;width:100%;box-sizing:border-box;margin-top:3px;padding:8px;border-radius:6px;border:1px solid #3a3226;background:#1f1b16;color:#e6dfd0;font:13px system-ui';
  closeModal();
  openModal("Merge clips",'<div style="font:12.5px/1.6 system-ui"><b>'+esc(vi.name)+'</b> + <b>'+esc(ai.name)+'</b><br>Match: <b style="color:'+(conf>=.3?"#7fd18b":"#e6c84a")+'">'+Math.round(conf*100)+'%</b>'+(conf<.3?' — weak match. The files may not share the same sound; check by ear after adding.':'')+
    '<label style="display:block;margin-top:8px">Sound is early (+) or late (−) by, seconds<input id="lrMgOff" type="number" step="0.01" value="'+off.toFixed(2)+'" style="'+IN+'"></label>'+
    '<label style="display:flex;gap:8px;align-items:center;margin-top:8px"><input type="checkbox" id="lrMgMute" checked> Mute the video’s own sound</label></div><div class="mdetail-actions"><button type="button" class="chip pri" id="lrMgGo">Add to timeline synced</button></div>');
  document.getElementById("lrMgGo").onclick=async function(){ var o=+document.getElementById("lrMgOff").value||0, mute=document.getElementById("lrMgMute").checked; closeModal(); await X.mergePlace(vi,ai,o,mute); };
};
X.mergePlace=async function(vi,ai,lag,mute){
  try{ await M.use([vi.id],{}); await M.use([ai.id],{}); }catch(e){ X.toast("Could not add the files"); return; }
  var va=assetFor(vi), aa=assetFor(ai); if(!va||!aa){ X.toast("Could not add the files"); return; }
  var before=deepClone(serializableProject()), at=currentTime, vd=Math.max(.5,va.duration||vi.duration||5), ad=Math.max(.5,aa.duration||ai.duration||5);
  var vt=getTrack("video"), at2=getTrack("audio"), vStart=at, aStart=at, aIn=0;
  if(lag>0){ aIn=lag; } else if(lag<0){ aStart=at-lag; }
  var vc={id:uid("clip"),assetId:va.id,start:vStart,duration:vd,inPoint:0,outPoint:vd,volume:mute?0:1,opacity:1,speed:1,rotation:0,scale:1,x:.5,y:.5,trimL:0,trimR:0,fit:"contain",effects:[],keyframes:[],transitionIn:null,transitionOut:null};
  var len=Math.max(.5,Math.min(vd+(lag<0?0:0),ad-aIn));
  var ac={id:uid("clip"),assetId:aa.id,start:aStart,duration:len,inPoint:aIn,outPoint:aIn+len,volume:1,opacity:1,speed:1,rotation:0,scale:1,x:.5,y:.5,trimL:0,trimR:0,fit:"contain",effects:[],keyframes:[],transitionIn:null,transitionOut:null};
  vt.clips.push(vc); vt.clips.sort(function(x,y){ return x.start-y.start; }); at2.clips.push(ac); at2.clips.sort(function(x,y){ return x.start-y.start; });
  selectedClipId=vc.id; selectedTrackId=vt.id; recordHistory("Merge clips",before,serializableProject()); scheduleAutosave(); renderAll(); try{ closeSheet(); }catch(e){}
  X.toast("Video and sound added, synced"+(mute?" (video sound muted)":""),3200);
};
X.mergeDialog=function(){
  var s=X.sel(); if(s.length!==2){ X.toast("Select exactly two files: a video and its separate sound"); return; }
  var vi=s.find(function(i){ return i.type==="video"; }), ai=s.find(function(i){ return i!==vi&&(i.type==="audio"||i.type==="video"); });
  if(!vi||!ai){ X.toast("One must be a video, the other a sound or video file"); return; }
  var bad=s.find(function(i){ return M.state.missing&&M.state.missing.has(i.id); }); if(bad){ X.toast("“"+bad.name+"” is missing"); return; }
  X.mergeClips(vi,ai);
};
X.add({id:"lr_merge",group:"Timeline",label:"Merge clips (sync sound)…",hint:"video + mic",run:function(){ X.mergeDialog(); }});
try{ window.AMIYO_EDITOR_BUILD="libr-step14-mergeclips"; }catch(e){}
})();

;
/* ==================== Script 696 id="amiyo-ls-step01" ==================== */
/* Layer Studio step 1: shared layer engine + Skew.
   Every video clip (the main video or a secondary/overlay video) can carry extra look settings in clip.ls.
   Open "Layer Studio" from the PiP+ menu (or Pr tools). Skew bends the picture sideways (X) or up/down (Y), live in the preview and in exports.
   Later Layer Studio steps (3D tilt, corner pin, frames, reflection, luma key...) plug into this same engine. */
(function(){"use strict";
var X=window.AMIYO_PIPX; if(!X||window.AMIYO_LS) return;
var LS=window.AMIYO_LS={v:1,defs:{},order:[],xform:[],post:[],on:[],groups:[]};
/* params: LS.def(key,{label,min,max,step,def,unit,group}) */
LS.def=function(key,o){ o.def=o.def==null?0:o.def; o.step=o.step||1; o.unit=o.unit||""; LS.defs[key]=o; if(LS.order.indexOf(key)<0) LS.order.push(key); };
LS.get=function(c){ return c&&c.ls&&typeof c.ls==="object"?c.ls:null; };
LS.val=function(c,k){ var p=LS.get(c), d=LS.defs[k]; return p&&p[k]!=null&&isFinite(+p[k])?+p[k]:(d?d.def:0); };
LS.isOn=function(p){ if(!p) return false; for(var i=0;i<LS.on.length;i++){ try{ if(LS.on[i](p)) return true; }catch(e){} }
  for(var k in LS.defs){ if(p[k]!=null&&+p[k]!==LS.defs[k].def) return true; } return false; };
/* the paint hook: while a clip with layer settings is painted, its picture goes through LS.xform / LS.post */
var di=ctx.drawImage;
ctx.drawImage=function(){
  var s=ctx.__ls;
  if(s&&!s.used&&arguments.length===5){ s.used=true; var a=arguments, w=a[3], h=a[4], handled=false;
    for(var i=0;i<LS.xform.length;i++){ try{ var r=LS.xform[i](ctx,s.p,w,h,s.clip,a,di); if(r===true) handled=true; }catch(e){ try{ window.__swl&&window.__swl(e); }catch(_){} } }
    if(handled) return;
  }
  return di.apply(ctx,arguments);
};
var paint=window.__amiyoPaintVideoClip;
window.__amiyoPaintVideoClip=function(track,el,clip){ var p=LS.get(clip); ctx.__ls=(p&&LS.isOn(p))?{p:p,clip:clip,used:false}:null;
  try{ return paint.apply(this,arguments); } finally{ ctx.__ls=null; } };
var ns=window.amiyoNeedsStack; window.amiyoNeedsStack=function(c){ var p=LS.get(c); return !!(p&&LS.isOn(p))||(ns?ns.apply(this,arguments):false); };
/* skew: bends the picture in its own (rotated) frame */
LS.def("skewX",{label:"Skew X",min:-60,max:60,unit:"°",group:"Shape"});
LS.def("skewY",{label:"Skew Y",min:-60,max:60,unit:"°",group:"Shape"});
LS.xform.push(function(c,p){ var sx=+p.skewX||0, sy=+p.skewY||0; if(!sx&&!sy) return false;
  c.transform(1,Math.tan(sy*Math.PI/180),Math.tan(sx*Math.PI/180),1,0,0); return false; });
/* ---- the panel (live sliders, one undo step per drag) ---- */
var css=document.createElement("style"); css.id="amiyo-ls-css";
css.textContent="#lsPanel{position:fixed;right:12px;top:68px;width:300px;max-width:calc(100vw - 24px);max-height:calc(100vh - 90px);overflow:auto;z-index:345;background:#14120f;border:1px solid #302c26;border-radius:14px;padding:12px;color:#f1ece2;font:12.5px system-ui,sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.5);display:none}"+
"#lsPanel h4{margin:0;font:700 14px system-ui;color:#ffb454;display:flex;justify-content:space-between;align-items:center}#lsPanel h5{margin:10px 0 4px;font:700 10.5px system-ui;letter-spacing:.07em;text-transform:uppercase;color:#8f8777}"+
"#lsPanel .r{display:grid;grid-template-columns:78px 1fr 46px;gap:6px;align-items:center;margin:3px 0}#lsPanel .r span{color:#bdb5a5}#lsPanel .r b{font:600 11px ui-monospace,monospace;text-align:right;color:#f1ece2}"+
"#lsPanel input[type=range]{width:100%;min-height:26px}#lsPanel button{min-height:36px;border-radius:9px;border:1px solid #302c26;background:#211f1b;color:#f1ece2;font-size:12px;padding:4px 10px;cursor:pointer}#lsPanel button:hover{background:#2c2822}"+
"#lsPanel .row{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}#lsPanel .note{color:#8f8777;font-size:11px;margin:4px 0}#lsPanel .chips{display:flex;gap:5px;flex-wrap:wrap;margin:4px 0}#lsPanel .chips button.on{background:#ffb454;color:#1a1208;border-color:#ffb454}"+
"@media (max-width:700px){#lsPanel{left:8px;right:8px;top:auto;bottom:8px;width:auto;max-height:55vh}}";
document.head.appendChild(css);
var panel=null, snap=null, rowsExtra=[]; LS.openG={};
LS.sections=[]; /* later steps add sections: {id,title,render(el,clip),} */
LS.target=function(){ var s=X.sel(); return s?s.clip:null; };
LS.targetInfo=function(){ return X.sel(); };
LS.edit=function(label,fn){ var c=LS.target(); if(!c) return false; return X.change(label,function(){ if(!c.ls) c.ls={}; return fn(c,c.ls); }); };
function ensure(){ if(panel) return panel; panel=document.createElement("div"); panel.id="lsPanel"; panel.setAttribute("role","dialog"); panel.setAttribute("aria-label","Layer Studio"); document.body.appendChild(panel);
  panel.addEventListener("input",function(e){ var el=e.target; if(!el.dataset||!el.dataset.k||el.type!=="range") return; var c=LS.target(); if(!c) return;
    if(!snap) snap={before:deepClone(serializableProject())};
    if(!c.ls) c.ls={}; c.ls[el.dataset.k]=+el.value; var d=LS.defs[el.dataset.k]; var o=el.parentNode.querySelector("b"); if(o) o.textContent=fmt(+el.value,d);
    try{ renderPreviewFrame(); }catch(_){} });
  panel.addEventListener("change",function(e){ var el=e.target; if(!el.dataset||!el.dataset.k||el.type!=="range"||!snap) return; var b=snap.before; snap=null;
    try{ recordHistory("Layer Studio",b,deepClone(serializableProject())); scheduleAutosave(); renderAll(); }catch(_){} });
  panel.addEventListener("click",function(e){ var hg=e.target.closest("h5[data-g]"); if(hg){ var gn=hg.dataset.g; var cur=LS.openG[gn]; if(cur===undefined){ var c0=LS.target(); cur=!!(c0&&c0.ls&&LS.order.some(function(k){ var d=LS.defs[k]; return (d.group||"Look")===gn&&c0.ls[k]!=null&&+c0.ls[k]!==d.def; })); } LS.openG[gn]=!cur; LS.paint(); return; }
  var b=e.target.closest("button[data-a]"); if(!b) return; e.stopPropagation();
    if(b.dataset.a==="close"){ panel.style.display="none"; return; }
    if(b.dataset.a==="reset"){ var c=LS.target(); if(!c||!c.ls){ X.toast("Nothing to reset"); return; } X.change("Reset layer look",function(){ delete c.ls; }); LS.paint(); return; }
    var sec=LS.sections.find(function(s){ return s.id===b.dataset.s; }); if(sec&&sec.click) { sec.click(b.dataset.a,b,LS.target()); LS.paint(); } });
  return panel; }
function fmt(v,d){ return (Math.round(v*100)/100)+(d&&d.unit||""); }
LS.paint=function(){ if(!panel||panel.style.display==="none") return; var c=LS.target(), h='<h4>Layer Studio <button data-a="close" style="min-height:28px">✕</button></h4>';
  if(!c){ h+='<div class="note">Click a video clip on the timeline (main video or an overlay), then drag the sliders.</div>'; panel.innerHTML=h; return; }
  var a=getAsset?getAsset(c.assetId):null; h+='<div class="note">Editing: '+kitEsc((a&&a.name)||"clip")+(c.pip?" (overlay)":" (main)")+'</div>';
  var groups={}, go=[]; LS.order.forEach(function(k){ var d=LS.defs[k]; if(d.hidden) return; var g=d.group||"Look"; if(!groups[g]){ groups[g]=[]; go.push(g); } groups[g].push(k); });
  go.forEach(function(g){ var act=groups[g].some(function(k){ var d=LS.defs[k], v=c.ls&&c.ls[k]; return v!=null&&+v!==d.def; }), op=LS.openG[g]===undefined?act:LS.openG[g];
    h+='<h5 data-g="'+g+'" style="cursor:pointer;user-select:none">'+(op?"▾ ":"▸ ")+g+(act?' <span style="color:#ffb454">●</span>':"")+'</h5>';
    if(op) groups[g].forEach(function(k){ var d=LS.defs[k], v=LS.val(c,k); h+='<div class="r"><span>'+d.label+'</span><input type="range" data-k="'+k+'" min="'+d.min+'" max="'+d.max+'" step="'+d.step+'" value="'+v+'" aria-label="'+d.label+'"><b>'+fmt(v,d)+'</b></div>'; }); });
  LS.sections.forEach(function(s){ try{ h+=s.render(c); }catch(e){} });
  h+='<div class="row"><button data-a="reset">Reset layer look</button></div>'; panel.innerHTML=h; };
function kitEsc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(ch){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]; }); }
LS.esc=kitEsc;
LS.ensure=ensure;
LS.open=function(){ ensure(); panel.style.display="block"; LS.paint(); };
LS.close=function(){ if(panel) panel.style.display="none"; };
/* keep the panel in step with what is selected */
var rt=window.renderInspector; if(typeof rt==="function"&&!rt.__ls){ window.renderInspector=function(){ var r=rt.apply(this,arguments); try{ if(panel&&panel.style.display!=="none"&&!snap) LS.paint(); }catch(e){} return r; }; window.renderInspector.__ls=true; }
X.add({id:"ls_open",group:"Layer Studio",label:"Layer Studio panel…",hint:"skew, 3D, frames",needs:undefined,run:function(){ LS.open(); }});
X.add({id:"ls_skew0",group:"Layer Studio",label:"Reset skew",needs:undefined,run:function(){ var c=LS.target(); if(!c||!c.ls){ X.toast("Select a clip first"); return; } X.change("Reset skew",function(){ delete c.ls.skewX; delete c.ls.skewY; }); LS.paint(); }});
try{ if(window.amiyoKit) window.amiyoKit.menu("◩ Layer Studio",LS.open,"Layer Studio","AMIYO_LS.open()"); }catch(e){}
try{ window.AMIYO_EDITOR_BUILD="ls-step01-skew"; }catch(e){}
})();

;
/* ==================== Script 697 id="amiyo-ls-step02" ==================== */
/* Layer Studio step 2: 3D tilt and swivel (real perspective, like Premiere's Basic 3D).
   Tilt leans the top/bottom toward or away from you; Swivel turns it left/right; Perspective sets how strong the depth looks.
   Works on the main video and on overlays. An overlay's border and glow tilt with the picture. Live in preview and in exports. */
(function(){"use strict";
var LS=window.AMIYO_LS; if(!LS||LS.mesh) return;
LS.def("tiltX",{label:"Tilt",min:-75,max:75,unit:"°",group:"3D"});
LS.def("swivelY",{label:"Swivel",min:-75,max:75,unit:"°",group:"3D"});
LS.def("depth",{label:"Perspective",min:0,max:100,def:50,unit:"%",group:"3D"});
LS.mesh=true;
LS.meshTests=[function(p){ return !!(p&&(+p.tiltX||+p.swivelY)); }];
function meshOn(p){ if(!p) return false; for(var i=0;i<LS.meshTests.length;i++){ try{ if(LS.meshTests[i](p)) return true; }catch(e){} } return false; }
LS.meshOn=meshOn;
var flat=document.createElement("canvas"), off=document.createElement("canvas");
function solve(u,v,t){ /* affine from 3 points: t = a*u + c*v + e */
  var d=u[0]*(v[1]-v[2])-u[1]*(v[0]-v[2])+u[2]*(v[0]-v[1]); if(Math.abs(d)<1e-9) return null;
  var a=(t[0]*(v[1]-v[2])-t[1]*(v[0]-v[2])+t[2]*(v[0]-v[1]))/d;
  var c=(u[0]*(t[1]-t[2])-u[1]*(t[0]-t[2])+u[2]*(t[0]-t[1]))/d;
  var e=(u[0]*(v[1]*t[2]-v[2]*t[1])-u[1]*(v[0]*t[2]-v[2]*t[0])+u[2]*(v[0]*t[1]-v[1]*t[0]))/d; return [a,c,e]; }
function tri(g,img,s,d){
  var ax=solve([s[0][0],s[1][0],s[2][0]],[s[0][1],s[1][1],s[2][1]],[d[0][0],d[1][0],d[2][0]]);
  var ay=solve([s[0][0],s[1][0],s[2][0]],[s[0][1],s[1][1],s[2][1]],[d[0][1],d[1][1],d[2][1]]); if(!ax||!ay) return;
  var cx=(d[0][0]+d[1][0]+d[2][0])/3, cy=(d[0][1]+d[1][1]+d[2][1])/3;
  g.save(); g.beginPath();
  for(var i=0;i<3;i++){ var dx=d[i][0]-cx, dy=d[i][1]-cy, l=Math.hypot(dx,dy)||1, px=d[i][0]+dx/l*.7, py=d[i][1]+dy/l*.7; if(i) g.lineTo(px,py); else g.moveTo(px,py); }
  g.closePath(); g.clip(); g.transform(ax[0],ay[0],ax[1],ay[1],ax[2],ay[2]); g.drawImage(img,0,0); g.restore(); }
LS.project=function(p,dw,dh){ var th=(+p.swivelY||0)*Math.PI/180, ph=(+p.tiltX||0)*Math.PI/180, cth=Math.cos(th), sth=Math.sin(th), cph=Math.cos(ph), sph=Math.sin(ph);
  var dp=p.depth==null?50:+p.depth, D=Math.max(dw,dh)*(3.4-2.7*dp/100);
  return function(x,y){ var x1=x*cth, z1=-x*sth, y2=y*cph-z1*sph, z2=y*sph+z1*cph, s=D/Math.max(D*.12,D-z2); return [x1*s,y2*s]; }; };
LS.padFns=[]; LS.decor=[];
LS.pads=function(p,clip,dw,dh,bd){ var o={l:0,t:0,r:0,b:0};
  if(bd){ var W=(window.canvas&&canvas.width)||1920, e=Math.max(1,(bd.b>0?bd.b:1.5)*W/1000)+(bd.g||0)*W/400*1.6+2; o.l=o.t=o.r=o.b=e; }
  LS.padFns.forEach(function(f){ try{ var q=f(p,dw,dh,clip); if(q){ o.l=Math.max(o.l,q.l||0); o.t=Math.max(o.t,q.t||0); o.r=Math.max(o.r,q.r||0); o.b=Math.max(o.b,q.b||0); } }catch(e){} }); o.base={l:o.l,t:o.t,r:o.r,b:o.b}; (LS.padAdd||[]).forEach(function(f){ try{ var q=f(p,dw,dh,clip); if(q){ o.l+=q.l||0; o.t+=q.t||0; o.r+=q.r||0; o.b+=q.b||0; } }catch(e){} }); return o; };
LS.xform.push(function(c,p,dw,dh,clip,a,di){
  if(!meshOn(p)) return false; var src=a[0], iw=src.videoWidth||src.width||0, ih=src.videoHeight||src.height||0; if(!iw||!ih) return false;
  var bd=LS.cur&&LS.cur.border, pd=LS.pads(p,clip,dw,dh,bd);
  var K=Math.min(1,1600/Math.max(iw,ih)), fw=Math.max(2,Math.round(iw*K)), fh=Math.max(2,Math.round(ih*K)), s=fw/Math.max(1,dw);
  var PL=Math.round(pd.l*s), PT=Math.round(pd.t*s), PR=Math.round(pd.r*s), PB=Math.round(pd.b*s), FW=fw+PL+PR, FH=fh+PT+PB;
  if(flat.width!==FW||flat.height!==FH){ flat.width=FW; flat.height=FH; }
  var g=flat.getContext("2d"); g.setTransform(1,0,0,1,0,0); g.clearRect(0,0,FW,FH); g.drawImage(src,PL,PT,fw,fh);
  if(bd&&clip.mask&&clip.mask.enabled&&window.amiyoShapePath){ var m=clip.mask, W=(window.canvas&&canvas.width)||1920;
    g.save(); window.amiyoShapePath(g,m.shape,PL+(m.x==null?.5:m.x)*fw,PT+(m.y==null?.5:m.y)*fh,(m.w==null?1:m.w)*fw,(m.h==null?1:m.h)*fh);
    var lw=Math.max(1,(bd.b>0?bd.b:1.5)*W/1000)*s; g.lineWidth=lw; g.lineJoin="round"; g.strokeStyle=bd.color||"#ffffff";
    if(bd.style==="dashed") g.setLineDash([lw*3.2,lw*2]); else if(bd.style==="dotted"){ g.setLineDash([.01,lw*2.2]); g.lineCap="round"; }
    if(bd.g>0){ g.shadowColor=bd.color||"#ffffff"; g.shadowBlur=bd.g*W/400*s; g.stroke(); } g.stroke(); g.restore(); }
  var info={PL:PL,PT:PT,PR:PR,PB:PB,fw:fw,fh:fh,FW:FW,FH:FH,s:s,dw:dw,dh:dh,clip:clip,p:p,pd:pd};
  LS.decor.forEach(function(f){ try{ g.save(); f(g,info); g.restore(); }catch(e){ try{ window.__swl&&window.__swl(e); }catch(_){} } });
  (LS.decorLate||[]).forEach(function(f){ try{ g.save(); f(g,info); g.restore(); }catch(e){ try{ window.__swl&&window.__swl(e); }catch(_){} } });
  var warp=!!((+p.tiltX||+p.swivelY)||(LS.pinOn&&LS.pinOn(p))), N=warp?14:1, pr=LS.project(p,dw,dh), pts=[], x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  var tw=dw+pd.l+pd.r, th=dh+pd.t+pd.b;
  for(var j=0;j<=N;j++){ var row=[]; for(var i=0;i<=N;i++){ var q=pr(-dw/2-pd.l+(i/N)*tw,-dh/2-pd.t+(j/N)*th); row.push(q); x0=Math.min(x0,q[0]); y0=Math.min(y0,q[1]); x1=Math.max(x1,q[0]); y1=Math.max(y1,q[1]); } pts.push(row); }
  var bw=x1-x0, bh=y1-y0; if(!(bw>1&&bh>1)) return true; var k=Math.min(1,2400/Math.max(bw,bh)), ow=Math.ceil(bw*k)+2, oh=Math.ceil(bh*k)+2;
  if(off.width!==ow||off.height!==oh){ off.width=ow; off.height=oh; }
  var o=off.getContext("2d"); o.setTransform(1,0,0,1,0,0); o.clearRect(0,0,ow,oh); o.imageSmoothingQuality="high";
  function T(q){ return [(q[0]-x0)*k+1,(q[1]-y0)*k+1]; }
  for(j=0;j<N;j++) for(i=0;i<N;i++){ var s00=[i/N*FW,j/N*FH], s10=[(i+1)/N*FW,j/N*FH], s01=[i/N*FW,(j+1)/N*FH], s11=[(i+1)/N*FW,(j+1)/N*FH];
    var d00=T(pts[j][i]), d10=T(pts[j][i+1]), d01=T(pts[j+1][i]), d11=T(pts[j+1][i+1]);
    tri(o,flat,[s00,s10,s01],[d00,d10,d01]); tri(o,flat,[s10,s11,s01],[d10,d11,d01]); }
  di.call(c,off,x0-1/k,y0-1/k,ow/k,oh/k); return true; });
/* while a tilted overlay is painted, its normal flat border is turned off (the tilted one is drawn into the picture instead) */
var paint=window.__amiyoPaintVideoClip;
window.__amiyoPaintVideoClip=function(track,el,clip){ var p=LS.get(clip), sv=null; LS.cur=null;
  if(p&&meshOn(p)&&clip&&clip.pip&&clip.mask&&clip.mask.enabled&&(clip.pip.border>0||clip.pip.glow>0)){ sv={b:clip.pip.border,g:clip.pip.glow,color:clip.pip.color,style:clip.pip.bstyle}; LS.cur={border:sv}; clip.pip.border=0; clip.pip.glow=0; }
  try{ return paint.apply(this,arguments); } finally{ if(sv){ clip.pip.border=sv.b; clip.pip.glow=sv.g; } LS.cur=null; } };
/* quick presets */
var PRE=[["tl","Lean left",{swivelY:-35,tiltX:0}],["tr","Lean right",{swivelY:35,tiltX:0}],["tu","Tip back",{tiltX:35,swivelY:0}],["td","Tip forward",{tiltX:-35,swivelY:0}],["cm","Cinema",{swivelY:-28,tiltX:8}],["ft","Flat",{swivelY:0,tiltX:0}]];
LS.sections.push({id:"s2",render:function(c){ return '<h5>3D presets</h5><div class="chips">'+PRE.map(function(x){ return '<button data-s="s2" data-a="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</div>'; },
  click:function(a){ var x=PRE.find(function(q){ return q[0]===a; }); if(!x) return; LS.edit("3D preset",function(c,ls){ ls.swivelY=x[2].swivelY; ls.tiltX=x[2].tiltX; }); }});
window.AMIYO_PIPX.add({id:"ls_tilt0",group:"Layer Studio",label:"Reset 3D tilt",needs:undefined,run:function(){ var c=LS.target(); if(!c||!c.ls){ window.AMIYO_PIPX.toast("Select a clip first"); return; } window.AMIYO_PIPX.change("Reset 3D",function(){ delete c.ls.tiltX; delete c.ls.swivelY; delete c.ls.depth; }); LS.paint(); }});
try{ window.AMIYO_EDITOR_BUILD="ls-step02-3d"; }catch(e){}
})();

;
/* ==================== Script 698 id="amiyo-ls-step03" ==================== */
/* Layer Studio step 3: Corner Pin. Drag each of the four corners of a layer (top-left, top-right, bottom-right, bottom-left) in or out
   to fit it onto a screen, a sign or a wall in your main video. Uses true perspective. Works together with 3D tilt. Presets: Trapezoid, Screen left/right, Page curl-up. */
(function(){"use strict";
var LS=window.AMIYO_LS; if(!LS||!LS.meshTests||LS.pin) return; LS.pin=true;
var C=[["TL","Top-left"],["TR","Top-right"],["BR","Bottom-right"],["BL","Bottom-left"]];
C.forEach(function(q){ LS.def("pin"+q[0]+"x",{label:q[1]+" X",min:-50,max:50,step:.5,unit:"%",group:"Corner pin"}); LS.def("pin"+q[0]+"y",{label:q[1]+" Y",min:-50,max:50,step:.5,unit:"%",group:"Corner pin"}); });
function pinOn(p){ if(!p) return false; for(var i=0;i<C.length;i++){ if(+p["pin"+C[i][0]+"x"]||+p["pin"+C[i][0]+"y"]) return true; } return false; }
LS.pinOn=pinOn; LS.meshTests.push(pinOn);
function quadH(P){ var x0=P[0][0],y0=P[0][1],x1=P[1][0],y1=P[1][1],x2=P[2][0],y2=P[2][1],x3=P[3][0],y3=P[3][1];
  var dx1=x1-x2,dx2=x3-x2,dx3=x0-x1+x2-x3,dy1=y1-y2,dy2=y3-y2,dy3=y0-y1+y2-y3, den=dx1*dy2-dx2*dy1, g=0,h=0;
  if(Math.abs(den)>1e-9&&(dx3||dy3)){ g=(dx3*dy2-dx2*dy3)/den; h=(dx1*dy3-dx3*dy1)/den; }
  var a=x1-x0+g*x1,b=x3-x0+h*x3,d=y1-y0+g*y1,e=y3-y0+h*y3;
  return function(u,v){ var w=g*u+h*v+1; if(Math.abs(w)<1e-6) w=1e-6; return [(a*u+b*v+x0)/w,(d*u+e*v+y0)/w]; }; }
var prj=LS.project;
LS.project=function(p,dw,dh){ var f3=prj(p,dw,dh); if(!pinOn(p)) return f3;
  var v=function(k){ return (+p[k]||0)/100; };
  var P=[[-dw/2+v("pinTLx")*dw,-dh/2+v("pinTLy")*dh],[dw/2+v("pinTRx")*dw,-dh/2+v("pinTRy")*dh],[dw/2+v("pinBRx")*dw,dh/2+v("pinBRy")*dh],[-dw/2+v("pinBLx")*dw,dh/2+v("pinBLy")*dh]];
  var H=quadH(P);
  return function(x,y){ var q=H((x+dw/2)/dw,(y+dh/2)/dh); return f3(q[0],q[1]); }; };
var PRE=[["tz","Trapezoid (narrow top)",{TLx:12,TRx:-12}],["tb","Trapezoid (narrow bottom)",{BLx:12,BRx:-12}],["sl","Screen on left wall",{TLy:6,BLy:-6,TRy:-8,BRy:8,TRx:-6,BRx:-6}],["sr","Screen on right wall",{TRy:6,BRy:-6,TLy:-8,BLy:8,TLx:6,BLx:6}],["pg","Page tilt",{TRy:-10,TRx:-4,TLx:3}],["fl","Flat (reset pin)",{}]];
LS.sections.push({id:"s3",render:function(c){ return '<h5>Corner pin presets</h5><div class="chips">'+PRE.map(function(x){ return '<button data-s="s3" data-a="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</div>'; },
  click:function(a){ var x=PRE.find(function(q){ return q[0]===a; }); if(!x) return; LS.edit("Corner pin",function(c,ls){ C.forEach(function(q){ delete ls["pin"+q[0]+"x"]; delete ls["pin"+q[0]+"y"]; }); for(var k in x[2]) ls["pin"+k]=x[2][k]; }); }});
window.AMIYO_PIPX.add({id:"ls_pin0",group:"Layer Studio",label:"Reset corner pin",needs:undefined,run:function(){ var c=LS.target(); if(!c||!c.ls){ window.AMIYO_PIPX.toast("Select a clip first"); return; } window.AMIYO_PIPX.change("Reset corner pin",function(){ C.forEach(function(q){ delete c.ls["pin"+q[0]+"x"]; delete c.ls["pin"+q[0]+"y"]; }); }); LS.paint(); }});
try{ window.AMIYO_EDITOR_BUILD="ls-step03-cornerpin"; }catch(e){}
})();

;
/* ==================== Script 699 id="amiyo-ls-step04" ==================== */
/* Layer Studio step 4: Device frames. Put any layer (main video or overlay) inside a Phone, Tablet, Laptop, TV, Browser window or Polaroid.
   The frame is part of the layer, so it moves, tilts, pins and fades together with the video. Pick the frame colour and thickness in Layer Studio. */
(function(){"use strict";
var LS=window.AMIYO_LS; if(!LS||!LS.padFns||LS.frames) return;
LS.def("frameSize",{label:"Frame thickness",min:20,max:100,def:50,unit:"%",group:"Frame"});
var STY=[["phone","Phone"],["tablet","Tablet"],["laptop","Laptop"],["tv","TV / monitor"],["browser","Browser"],["polaroid","Polaroid"]];
var COL={black:["#2a2a31","#07070a","#8d8d99"],white:["#ffffff","#dcdce2","#b9b9c4"],silver:["#e6e7ec","#9a9ca6","#ffffff"],gold:["#f1d9a0","#a98643","#fff0c8"],blue:["#a7410e","#332016","#f4a37b"]};
LS.frames=STY; LS.frameColors=COL;
LS.on.push(function(p){ return !!p.frame; }); LS.meshTests.push(function(p){ return !!p.frame; });
function k(p){ return (p.frameSize==null?50:+p.frameSize)/50; }
LS.padFns.push(function(p,dw,dh){ var f=p.frame; if(!f) return null; var mn=Math.min(dw,dh), kk=k(p), bt;
  if(f==="phone"){ bt=mn*.045*kk; return {l:bt,t:bt,r:bt,b:bt}; }
  if(f==="tablet"){ bt=mn*.06*kk; return {l:bt,t:bt,r:bt,b:bt}; }
  if(f==="laptop"){ bt=mn*.03*kk; return {l:bt+dw*.05,t:bt,r:bt+dw*.05,b:bt+mn*.07*kk}; }
  if(f==="tv"){ bt=mn*.02*kk; return {l:bt,t:bt,r:bt,b:bt+mn*.11*kk}; }
  if(f==="browser"){ bt=mn*.006*kk; return {l:bt,t:mn*.08*kk,r:bt,b:bt}; }
  if(f==="polaroid"){ bt=mn*.055*kk; return {l:bt,t:bt,r:bt,b:bt*3.6}; }
  return null; });
function rr(g,x,y,w,h,r){ r=Math.max(0,Math.min(r,w/2,h/2)); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }
function lg(g,x0,y0,x1,y1,a,b){ var q=g.createLinearGradient(x0,y0,x1,y1); q.addColorStop(0,a); q.addColorStop(1,b); return q; }
LS.decor.push(function(g,i){ var p=i.p, f=p.frame; if(!f) return; var col=COL[p.frameColor]||COL.black, s=i.s, dw=i.dw, dh=i.dh, mn=Math.min(dw,dh), kk=k(p);
  var px=i.PL, py=i.PT, pw=i.fw, ph=i.fh, FW=i.FW, FH=i.FH;
  if(f==="phone"||f==="tablet"){ var bt=(f==="phone"?mn*.045:mn*.06)*kk*s, rin=(f==="phone"?mn*.07:mn*.03)*s;
    g.beginPath(); rr(g,px-bt,py-bt,pw+2*bt,ph+2*bt,rin+bt); rr(g,px,py,pw,ph,rin); g.fillStyle=lg(g,0,0,FW,FH,col[0],col[1]); g.fill("evenodd");
    g.lineWidth=Math.max(1,bt*.14); g.strokeStyle=col[2]; g.beginPath(); rr(g,px-bt+g.lineWidth/2,py-bt+g.lineWidth/2,pw+2*bt-g.lineWidth,ph+2*bt-g.lineWidth,rin+bt); g.globalAlpha=.65; g.stroke(); g.globalAlpha=1;
    if(f==="phone"){ g.fillStyle="#000"; g.beginPath(); if(ph>=pw){ rr(g,px+pw*.5-pw*.14,py+bt*.7,pw*.28,bt*1.5,bt*.75); } else { rr(g,px+bt*.7,py+ph*.5-ph*.14,bt*1.5,ph*.28,bt*.75); } g.fill(); } }
  else if(f==="laptop"){ var bt2=mn*.03*kk*s, hb=mn*.07*kk*s, ex=dw*.05*s;
    g.beginPath(); rr(g,px-bt2,py-bt2,pw+2*bt2,ph+2*bt2,bt2*1.2); rr(g,px,py,pw,ph,bt2*.4); g.fillStyle=lg(g,0,py,0,py+ph,col[0],col[1]); g.fill("evenodd");
    var by=py+ph+bt2; g.beginPath(); g.moveTo(px-bt2-ex*.3,by); g.lineTo(px+pw+bt2+ex*.3,by); g.lineTo(px+pw+bt2+ex,by+hb*.8); g.quadraticCurveTo(px+pw+bt2+ex,by+hb,px+pw+bt2+ex*.9,by+hb); g.lineTo(px-bt2-ex*.9,by+hb); g.quadraticCurveTo(px-bt2-ex,by+hb,px-bt2-ex,by+hb*.8); g.closePath();
    g.fillStyle=lg(g,0,by,0,by+hb,col[2],col[1]); g.fill(); g.fillStyle="rgba(0,0,0,.28)"; g.beginPath(); rr(g,px+pw*.5-pw*.09,by,pw*.18,hb*.32,hb*.18); g.fill(); }
  else if(f==="tv"){ var bt3=mn*.02*kk*s, hb2=mn*.11*kk*s;
    g.beginPath(); rr(g,px-bt3,py-bt3,pw+2*bt3,ph+2*bt3,bt3*1.5); rr(g,px,py,pw,ph,bt3*.4); g.fillStyle=lg(g,0,py,0,py+ph,col[0],col[1]); g.fill("evenodd");
    var by2=py+ph+bt3; g.fillStyle=lg(g,0,by2,0,by2+hb2,col[2],col[1]); g.beginPath(); g.moveTo(px+pw*.5-pw*.04,by2); g.lineTo(px+pw*.5+pw*.04,by2); g.lineTo(px+pw*.5+pw*.06,by2+hb2*.7); g.lineTo(px+pw*.5-pw*.06,by2+hb2*.7); g.closePath(); g.fill();
    g.beginPath(); rr(g,px+pw*.5-pw*.17,by2+hb2*.68,pw*.34,hb2*.32,hb2*.14); g.fillStyle=lg(g,0,by2,0,by2+hb2,col[0],col[1]); g.fill(); }
  else if(f==="browser"){ var th=mn*.08*kk*s, bt4=mn*.006*kk*s, dark=(p.frameColor==="black"||p.frameColor==="blue"), bg=dark?"#26262c":"#eceef3", fg=dark?"#8d8d99":"#8a8c99";
    g.beginPath(); rr(g,px-bt4,py-th,pw+2*bt4,ph+th+bt4,th*.28); rr(g,px,py,pw,ph,0); g.fillStyle=bg; g.fill("evenodd");
    var cy=py-th/2, r=th*.15; ["#ff5f57","#febc2e","#28c840"].forEach(function(c2,n){ g.fillStyle=c2; g.beginPath(); g.arc(px+th*.55+n*th*.42,cy,r,0,Math.PI*2); g.fill(); });
    g.fillStyle=dark?"#1b1b20":"#ffffff"; g.beginPath(); rr(g,px+th*2.1,cy-th*.28,pw-th*2.7,th*.56,th*.28); g.fill(); g.fillStyle=fg; g.beginPath(); g.arc(px+th*2.5,cy,th*.08,0,Math.PI*2); g.fill(); }
  else if(f==="polaroid"){ var bt5=mn*.055*kk*s; g.beginPath(); g.rect(px-bt5,py-bt5,pw+2*bt5,ph+bt5*4.6); g.rect(px,py,pw,ph); g.fillStyle=p.frameColor==="black"?"#17171b":(p.frameColor==="gold"?"#f5e6bf":"#faf8f1"); g.fill("evenodd");
    g.strokeStyle="rgba(0,0,0,.18)"; g.lineWidth=Math.max(1,s); g.strokeRect(px,py,pw,ph); } });
/* panel section */
LS.sections.push({id:"s4",render:function(c){ var f=(c.ls&&c.ls.frame)||"", fc=(c.ls&&c.ls.frameColor)||"black";
  return '<h5>Device frame</h5><div class="chips"><button data-s="s4" data-a="f:" class="'+(f?"":"on")+'">None</button>'+STY.map(function(x){ return '<button data-s="s4" data-a="f:'+x[0]+'" class="'+(f===x[0]?"on":"")+'">'+x[1]+'</button>'; }).join("")+'</div>'+
  '<div class="chips">'+Object.keys(COL).map(function(n){ return '<button data-s="s4" data-a="c:'+n+'" class="'+(fc===n?"on":"")+'">'+n+'</button>'; }).join("")+'</div>'; },
  click:function(a){ var t=a.split(":"); LS.edit("Device frame",function(c,ls){ if(t[0]==="f"){ if(t[1]) ls.frame=t[1]; else delete ls.frame; } else ls.frameColor=t[1]; }); }});
window.AMIYO_PIPX.add({id:"ls_frame0",group:"Layer Studio",label:"Remove device frame",needs:undefined,run:function(){ var c=LS.target(); if(!c||!c.ls||!c.ls.frame){ window.AMIYO_PIPX.toast("No frame on this clip"); return; } window.AMIYO_PIPX.change("Remove frame",function(){ delete c.ls.frame; }); LS.paint(); }});
try{ window.AMIYO_EDITOR_BUILD="ls-step04-frames"; }catch(e){}
})();
