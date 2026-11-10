/* Amiyo Studio - 05-ai-features.js */
/* AI provider hub, image studio and tools */
/* Scripts 400 to 549 */


;
/* ==================== Script 400 id="amiyo-pr-step05-extend-edit" ==================== */
/* Premiere step 5: Extend Edit. Select a clip, put the playhead where you want its nearest edge to be, tap Extend (or press E).
   The closest start or end of the selected clip moves to the playhead. If another clip touches that edge on the same track,
   the edit rolls: that clip gives up or takes the same amount, so no gap or overlap appears. It never goes past the end of the
   source media, and it tells you when something blocks it. One undo step. */
(function(){
  "use strict";
  var $=function(id){ return document.getElementById(id); };
  var EPS=0.004, MIN=0.1;
  function say(m){ try{ toast(m); }catch(e){} }
  function sel(){
    var out=[], seen={};
    (project.tracks||[]).forEach(function(t){ (t.clips||[]).forEach(function(c){ if((c.selected||c.id===selectedClipId)&&!seen[c.id]){ seen[c.id]=1; out.push({t:t,c:c}); } }); });
    return out;
  }
  function ratio(c){ var so=(c.outPoint!=null?c.outPoint:(c.inPoint||0)+c.duration)-(c.inPoint||0); return c.duration>0&&so>0?so/c.duration:1; }
  function limit(c){ var a=project.assets&&project.assets[c.assetId]; return (a&&(a.type==="video"||a.type==="audio")&&a.duration)?a.duration:Infinity; }
  function media(c){ return c.assetId!=null&&project.assets&&project.assets[c.assetId]&&(project.assets[c.assetId].type==="video"||project.assets[c.assetId].type==="audio"); }
  /* move the END of clip c to time p (c.start+duration becomes p). returns null on success or a reason */
  function setEnd(c,p){
    var d=p-c.start; if(d<MIN) return "too short"; var r=ratio(c), delta=d-c.duration;
    if(media(c)){ var newOut=(c.outPoint!=null?c.outPoint:(c.inPoint||0)+c.duration)+delta*r; if(newOut>limit(c)+EPS) return "no more source media after this clip"; if(newOut<=(c.inPoint||0)+EPS) return "too short"; c.outPoint=newOut; }
    else if(c.outPoint!=null) c.outPoint+=delta*r;
    c.duration=d; return null;
  }
  /* move the START of clip c to time p, keeping its end */
  function setStart(c,p){
    var end=c.start+c.duration, d=end-p; if(d<MIN) return "too short"; var r=ratio(c), delta=p-c.start;
    if(media(c)){ var ni=(c.inPoint||0)+delta*r; if(ni<-EPS) return "no more source media before this clip"; if(ni>=(c.outPoint!=null?c.outPoint:ni+1)-EPS) return "too short"; c.inPoint=Math.max(0,ni); }
    else c.inPoint=(c.inPoint||0)+delta*r;
    c.start=p; c.duration=d; return null;
  }
  function extendOne(t,c,p){
    var s=c.start, e=c.start+c.duration, useEnd=Math.abs(p-e)<=Math.abs(p-s);
    var others=t.clips.filter(function(o){ return o!==c; });
    if(useEnd){
      var nb=others.filter(function(o){ return Math.abs(o.start-e)<EPS; })[0];
      var over=others.filter(function(o){ return o.start>=e-EPS&&o.start<p-EPS&&o!==nb; })[0];
      if(p>e){
        if(over&&!nb) return "another clip is in the way";
        if(nb){ var nEnd=nb.start+nb.duration; if(p>nEnd-MIN) return "the next clip is too short to roll into"; var snap=[c.duration,c.outPoint], r1=setEnd(c,p); if(r1) return r1; var r2=setStart(nb,p); if(r2){ c.duration=snap[0]; c.outPoint=snap[1]; return r2; } return null; }
        return setEnd(c,p);
      }
      if(p<=s+MIN) return "that would make the clip too short";
      if(nb){ var sn=[nb.start,nb.duration,nb.inPoint], r3=setStart(nb,p); if(r3) return r3; var r4=setEnd(c,p); if(r4){ nb.start=sn[0]; nb.duration=sn[1]; nb.inPoint=sn[2]; return r4; } return null; }
      return setEnd(c,p);
    }
    var pb=others.filter(function(o){ return Math.abs(o.start+o.duration-s)<EPS; })[0];
    var over2=others.filter(function(o){ var oe=o.start+o.duration; return oe<=s+EPS&&oe>p+EPS&&o!==pb; })[0];
    if(p<s){
      if(over2&&!pb) return "another clip is in the way";
      if(pb){ if(p<pb.start+MIN) return "the previous clip is too short to roll into"; var sv=[c.start,c.duration,c.inPoint], q1=setStart(c,p); if(q1) return q1; var q2=setEnd(pb,p); if(q2){ c.start=sv[0]; c.duration=sv[1]; c.inPoint=sv[2]; return q2; } return null; }
      return setStart(c,p);
    }
    if(p>=e-MIN) return "that would make the clip too short";
    if(pb){ var sp=[pb.duration,pb.outPoint], z1=setEnd(pb,p); if(z1) return z1; var z2=setStart(c,p); if(z2){ pb.duration=sp[0]; pb.outPoint=sp[1]; return z2; } return null; }
    return setStart(c,p);
  }
  function extend(){
    var L=sel(); if(!L.length){ say("Select a clip first"); return; }
    var locked=L.filter(function(x){ return x.t.locked; }); L=L.filter(function(x){ return !x.t.locked; });
    if(!L.length){ say("The track is locked"); return; }
    var before=deepClone(serializableProject()), p=currentTime, done=0, why=null;
    L.forEach(function(x){ var r=extendOne(x.t,x.c,p); if(r) why=r; else done++; x.t.clips.sort(function(a,b){ return a.start-b.start; }); });
    if(!done){ say("Could not extend: "+(why||"nothing changed")); return; }
    try{ pushHistory("Extend edit",before); }catch(e){ project.history.entries.push({label:"Extend edit",before:before,after:serializableProject()}); project.history.index=project.history.entries.length-1; }
    try{ scheduleAutosave(); renderAll(); }catch(e){}
    say("Extended "+done+" edit"+(done===1?"":"s")+(why?" ("+why+" for the rest)":""));
  }
  window.amiyoExtendEdit={run:extend,_one:extendOne};
  document.addEventListener("keydown",function(e){
    var tag=document.activeElement&&document.activeElement.tagName, ed=document.activeElement&&document.activeElement.isContentEditable;
    if(tag==="INPUT"||tag==="TEXTAREA"||tag==="SELECT"||ed||e.ctrlKey||e.metaKey||e.altKey||e.shiftKey) return;
    if(e.code==="KeyE"){ e.preventDefault(); e.stopImmediatePropagation(); extend(); }
  },true);
  function addBtn(){
    var bar=document.querySelector(".timeline-toolbar"); if(!bar||$("s5Btn")) return;
    var b=document.createElement("button"); b.type="button"; b.className="toolbtn"; b.id="s5Btn"; b.textContent="\u21E5 Extend"; b.title="Extend the nearest edit of the selected clip to the playhead (E)"; b.onclick=extend;
    var a=$("s4Btn")||$("fitTimelineBtn"); if(a&&a.parentNode===bar) bar.insertBefore(b,a.nextSibling); else bar.appendChild(b);
  }
  addBtn(); setTimeout(addBtn,1000);
  try{ window.AMIYO_EDITOR_BUILD="pr-step05-extend-edit"; }catch(e){}
})();

;
/* ==================== Script 401 id="amiyo-pr-step06-match-frame" ==================== */
/* Premiere step 6: Match Frame and Reveal in Bin. Select a clip on the timeline and park the playhead on it.
   Match = open the Source monitor with that clip's media, parked on the exact frame under the playhead (press F).
   Reveal (button) = jump to the Media tab and highlight the clip's media item. */
(function(){
  "use strict";
  var $=function(id){ return document.getElementById(id); };
  function say(m){ try{ toast(m); }catch(e){} }
  function target(){
    var f=null; try{ f=getClip(); }catch(e){}
    if(f&&f.clip&&f.clip.assetId!=null) return f;
    var t=currentTime, best=null;
    (project.tracks||[]).forEach(function(tr){ (tr.clips||[]).forEach(function(c){ if(c.assetId!=null&&t>=c.start&&t<c.start+c.duration&&(tr.kind==="video"||!best)) best={track:tr,clip:c}; }); });
    return best;
  }
  function srcTime(c){
    var so=(c.outPoint!=null?c.outPoint:(c.inPoint||0)+c.duration)-(c.inPoint||0), r=c.duration>0&&so>0?so/c.duration:1;
    var local=Math.max(0,Math.min(c.duration,currentTime-c.start));
    return (c.inPoint||0)+local*r;
  }
  function match(){
    var f=target(); if(!f){ say("Select a clip with media first"); return; }
    var a=project.assets&&project.assets[f.clip.assetId]; if(!a||(a.type!=="video"&&a.type!=="audio")){ say("Match Frame works on video and audio clips"); return; }
    var sm=window.amiyoSourceMonitor; if(!sm){ say("The Source monitor is not available in this build"); return; }
    var t=srcTime(f.clip);
    sm.setSource(a.id); sm.open();
    var v=$("s2Vid"); if(!v) return;
    var go=function(){ try{ v.pause(); v.currentTime=Math.max(0,Math.min(t,(a.duration||v.duration||t))); }catch(e){} };
    if(v.readyState>=1&&v.getAttribute("data-id")===a.id) go(); else v.addEventListener("loadedmetadata",go,{once:true});
    say("Source parked at "+t.toFixed(2)+" s");
  }
  function reveal(){
    var f=target(); if(!f){ say("Select a clip with media first"); return; }
    var id=f.clip.assetId, nav=document.querySelector('.navbtn[data-panel="media"]'); if(nav) nav.click();
    setTimeout(function(){
      var el=document.querySelector('#leftPanel .asset[data-asset="'+id+'"]');
      if(!el){ say("That media is not in the bin (it may have been removed)"); return; }
      el.click();
      setTimeout(function(){
        var e2=document.querySelector('#leftPanel .asset[data-asset="'+id+'"]')||el;
        try{ e2.scrollIntoView({block:"center",behavior:"smooth"}); }catch(x){}
        e2.classList.add("pr6-flash"); setTimeout(function(){ e2.classList.remove("pr6-flash"); },2200);
      },80);
    },80);
  }
  var st=document.createElement("style"); st.id="pr6-css"; st.textContent="@keyframes pr6f{0%,100%{box-shadow:0 0 0 0 rgba(255,122,61,0)}50%{box-shadow:0 0 0 4px rgba(255,122,61,.95)}}.pr6-flash{animation:pr6f .7s ease 3;border-radius:8px}"; document.head.appendChild(st);
  window.amiyoMatchFrame={match:match,reveal:reveal,srcTime:srcTime};
  document.addEventListener("keydown",function(e){
    var tag=document.activeElement&&document.activeElement.tagName, ed=document.activeElement&&document.activeElement.isContentEditable;
    if(tag==="INPUT"||tag==="TEXTAREA"||tag==="SELECT"||ed||e.ctrlKey||e.metaKey||e.altKey) return;
    if(e.code==="KeyF"&&!e.shiftKey){ e.preventDefault(); e.stopImmediatePropagation(); match(); }
  },true);
  function addBtn(){
    var bar=document.querySelector(".timeline-toolbar"); if(!bar||$("prMatchBtn")) return;
    var a=$("s5Btn")||$("fitTimelineBtn"), mk=function(id,txt,title,fn){ var b=document.createElement("button"); b.type="button"; b.className="toolbtn"; b.id=id; b.textContent=txt; b.title=title; b.onclick=fn; return b; };
    var b1=mk("prMatchBtn","\uD83D\uDD0D Match","Match frame: open this clip's source at the playhead (F)",match), b2=mk("prRevealBtn","\uD83D\uDCC2 Reveal","Reveal this clip's media in the bin",reveal);
    if(a&&a.parentNode===bar){ bar.insertBefore(b1,a.nextSibling); bar.insertBefore(b2,b1.nextSibling); } else { bar.appendChild(b1); bar.appendChild(b2); }
  }
  addBtn(); setTimeout(addBtn,1000);
  try{ window.AMIYO_EDITOR_BUILD="pr-step06-match-frame"; }catch(e){}
})();

;
/* ==================== Script 402 id="amiyo-pr-step07-replace-clip" ==================== */
/* Premiere step 7: Replace Clip. Select a video, image or audio clip on the timeline, tap Replace and choose another item from your media.
   The clip keeps its place, length, effects, colour, keyframes, transitions and volume; only the media changes. It starts from the item's
   In mark (Source monitor) or from the beginning, and shortens itself if the new media is shorter. One undo step. */
(function(){
  "use strict";
  var $=function(id){ return document.getElementById(id); };
  var sheet=null;
  function say(m){ try{ toast(m); }catch(e){} }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function tf(t){ t=Math.max(0,+t||0); var m=Math.floor(t/60), s=t-m*60; return m+":"+(s<10?"0":"")+s.toFixed(1); }
  function cur(){ var f=null; try{ f=getClip(); }catch(e){} return f&&f.clip&&f.clip.assetId!=null?f:null; }
  function okFor(track,a){
    if(!a) return false;
    if(track.kind==="audio") return a.type==="audio";
    if(track.kind==="video") return a.type==="video"||a.type==="image";
    return false;
  }
  function replace(id){
    var f=cur(); if(!f){ say("Select a clip first"); return; }
    var a=project.assets[id], old=project.assets[f.clip.assetId]; if(!okFor(f.track,a)){ say("That media does not fit this track"); return; }
    if(f.track.locked){ say("The track is locked"); return; }
    var before=deepClone(serializableProject()), c=f.clip, dur=c.duration;
    var so=(c.outPoint!=null?c.outPoint:(c.inPoint||0)+dur)-(c.inPoint||0), r=dur>0&&so>0?so/dur:1;
    var from=0, note="";
    if(a.type==="image"){ c.inPoint=0; c.outPoint=dur; }
    else{
      from=Math.max(0,a.markIn||0); var avail=(a.duration||dur*r)-from;
      if(avail<0.2){ from=0; avail=a.duration||dur*r; }
      var need=dur*r;
      if(avail<need-0.01){ c.duration=Math.max(0.2,avail/r); note=" It is shorter than the old clip, so the clip was shortened."; }
      c.inPoint=from; c.outPoint=from+c.duration*r;
    }
    if(!c.name||(old&&c.name===old.name)) c.name=a.name||c.name;
    c.assetId=a.id; c.kind=c.kind&&c.kind!=="video"&&c.kind!=="audio"&&c.kind!=="image"?c.kind:c.kind;
    try{ pushHistory("Replace clip",before); }catch(e){ project.history.entries.push({label:"Replace clip",before:before,after:serializableProject()}); project.history.index=project.history.entries.length-1; }
    try{ scheduleAutosave(); renderAll(); }catch(e){}
    say("Clip replaced."+note); close();
  }
  function paint(){
    var f=cur(), box=$("prReplaceList"); if(!f){ box.innerHTML='<p>Select a video, image or audio clip on the timeline first.</p>'; return; }
    var L=Object.keys(project.assets||{}).map(function(k){ return project.assets[k]; }).filter(function(a){ return okFor(f.track,a)&&a.id!==f.clip.assetId; });
    if(!L.length){ box.innerHTML='<p>No other '+(f.track.kind==="audio"?"audio":"video or image")+' media in your project. Add some in the Media tab first.</p>'; return; }
    box.innerHTML=L.map(function(a){ return '<button type="button" data-id="'+esc(a.id)+'"><b>'+esc(a.name||a.id)+'</b><small>'+esc(a.type)+(a.duration?" \u00b7 "+tf(a.duration):"")+(a.markIn!=null||a.markOut!=null?" \u00b7 In mark "+tf(a.markIn||0):"")+'</small></button>'; }).join("");
  }
  function css(){
    var s=document.createElement("style"); s.id="pr7-css";
    s.textContent="#prReplaceSheet{position:fixed;inset:0;z-index:318;display:none;flex-direction:column;justify-content:flex-end;background:rgba(6,5,4,.6)}"+
    "#prReplaceSheet .box{background:#14120f;border-top:1px solid #302c26;border-radius:16px 16px 0 0;padding:14px 14px calc(14px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:10px;max-height:80vh;overflow:auto}"+
    "#prReplaceSheet h4{margin:0;font:700 15px system-ui;color:#ffb454}#prReplaceSheet p{margin:0;font-size:12.5px;line-height:1.5;color:#948a79}"+
    "#prReplaceSheet button{min-height:48px;border-radius:12px;border:1px solid #302c26;background:#211f1b;color:#f1ece2;font-size:13.5px;padding:6px 14px;text-align:left}"+
    "#prReplaceList{display:flex;flex-direction:column;gap:8px}#prReplaceSheet small{display:block;font-size:11.5px;color:#8f8777;font-weight:400}";
    document.head.appendChild(s);
  }
  function ui(){
    css(); sheet=document.createElement("div"); sheet.id="prReplaceSheet"; sheet.setAttribute("role","dialog"); sheet.setAttribute("aria-label","Replace clip");
    sheet.innerHTML='<div class="box"><div style="display:flex;justify-content:space-between;align-items:center"><h4>\uD83D\uDD01 Replace clip</h4><button type="button" id="prReplaceX" aria-label="Close" style="text-align:center">Close</button></div><p>Pick the new media. Effects, colour, keyframes and timing stay.</p><div id="prReplaceList"></div></div>';
    document.body.appendChild(sheet);
    $("prReplaceX").onclick=close;
    sheet.addEventListener("click",function(e){ if(e.target===sheet){ close(); return; } var b=e.target.closest&&e.target.closest("button[data-id]"); if(b) replace(b.getAttribute("data-id")); });
  }
  function open(){ if(!cur()){ say("Select a video, image or audio clip first"); return; } if(!sheet) ui(); paint(); sheet.style.display="flex"; }
  function close(){ if(sheet) sheet.style.display="none"; }
  window.amiyoReplaceClip={open:open,close:close,replace:replace};
  function addBtn(){
    var bar=document.querySelector(".timeline-toolbar"); if(!bar||$("prReplaceBtn")) return;
    var b=document.createElement("button"); b.type="button"; b.className="toolbtn"; b.id="prReplaceBtn"; b.textContent="\uD83D\uDD01 Replace"; b.title="Replace the selected clip's media, keeping its effects and timing"; b.onclick=open;
    var a=$("prRevealBtn")||$("fitTimelineBtn"); if(a&&a.parentNode===bar) bar.insertBefore(b,a.nextSibling); else bar.appendChild(b);
  }
  addBtn(); setTimeout(addBtn,1000);
  try{ window.AMIYO_EDITOR_BUILD="pr-step07-replace-clip"; }catch(e){}
})();

;
/* ==================== Script 403 id="amiyo-pr-step08-add-edit-all" ==================== */
/* Premiere step 8: Add Edit to All Tracks (Ctrl/Cmd+Shift+K). Cuts every unlocked track at the playhead in one go, like Premiere's
   Add Edit to All Tracks. Only clips that really cross the playhead are cut. One undo step. Button "Cut all" in the timeline toolbar. */
(function(){
  "use strict";
  var $=function(id){ return document.getElementById(id); };
  function say(m){ try{ toast(m); }catch(e){} }
  function addEditAll(){
    var t=currentTime, n=0, before=deepClone(serializableProject());
    project.tracks.forEach(function(tr){
      if(tr.locked) return;
      tr.clips.slice().forEach(function(c){
        
        if(t<=c.start+.03||t>=c.start+c.duration-.03) return;
        var r=deepClone(c); r.id=uid("clip"); r.start=t; r.duration=c.start+c.duration-t;
        var el=t-c.start, so=(c.outPoint!=null?c.outPoint:(c.inPoint||0)+c.duration)-(c.inPoint||0), ratio=c.duration?el/c.duration:0;
        r.inPoint=(c.inPoint||0)+so*ratio; c.duration=el; c.outPoint=r.inPoint;
        tr.clips.splice(tr.clips.findIndex(function(x){ return x.id===c.id; })+1,0,r); n++;
      });
    });
    if(!n){ say("Nothing crosses the playhead on an unlocked track"); return; }
    try{ pushHistory("Add edit to all tracks",before); }catch(e){ project.history.entries.push({label:"Add edit to all tracks",before:before,after:serializableProject()}); project.history.index=project.history.entries.length-1; }
    try{ scheduleAutosave(); renderAll(); }catch(e){}
    say("Cut "+n+" clip"+(n>1?"s":"")+" at the playhead");
  }
  window.amiyoAddEditAll=addEditAll;
  document.addEventListener("keydown",function(e){
    if((e.ctrlKey||e.metaKey)&&e.shiftKey&&!e.altKey&&(e.key==="k"||e.key==="K")){
      var t=e.target; if(t&&/^(input|textarea|select)$/i.test(t.tagName)||t&&t.isContentEditable) return;
      e.preventDefault(); e.stopPropagation(); addEditAll();
    }
  },true);
  function addBtn(){
    var bar=document.querySelector(".timeline-toolbar"); if(!bar||$("prCutAllBtn")) return;
    var b=document.createElement("button"); b.type="button"; b.className="toolbtn"; b.id="prCutAllBtn"; b.textContent="\u2702 Cut all"; b.title="Add edit to all tracks at the playhead (Ctrl+Shift+K)"; b.onclick=addEditAll;
    var a=$("prReplaceBtn")||$("fitTimelineBtn"); if(a&&a.parentNode===bar) bar.insertBefore(b,a.nextSibling); else bar.appendChild(b);
  }
  addBtn(); setTimeout(addBtn,1000);
  try{ window.AMIYO_EDITOR_BUILD="pr-step08-add-edit-all"; }catch(e){}
})();

;
/* ==================== Script 404 id="amiyo-pr-step09-track-select" ==================== */
/* Premiere step 9: Track Select Forward / Backward. Select a clip, then tap "Sel \u2192" (or Alt+A) to select it and every clip on every track that starts at or after it;
   "\u2190 Sel" (or Alt+Shift+A) selects everything that ends at or before its end. Locked tracks are skipped. Then move, delete or ripple them all together. */
(function(){
  "use strict";
  var $=function(id){ return document.getElementById(id); };
  function say(m){ try{ toast(m); }catch(e){} }
  function run(dir){
    var f=null; try{ f=getClip(); }catch(e){}
    if(!f){ say("Select a clip first"); return; }
    var c0=f.clip, edge=dir>0?c0.start:c0.start+c0.duration, n=0;
    try{ clearMultiSelection(); }catch(e){}
    project.tracks.forEach(function(tr){
      if(tr.locked) return;
      tr.clips.forEach(function(c){
        var ok=dir>0?c.start>=edge-.001:c.start+c.duration<=edge+.001;
        if(ok||c.id===c0.id){ c.selected=true; n++; }
      });
    });
    selectedClipId=c0.id; selectedTrackId=f.track.id;
    try{ renderAll(); }catch(e){}
    say(n+" clip"+(n===1?"":"s")+" selected "+(dir>0?"forward":"backward"));
  }
  window.amiyoTrackSelect=run;
  document.addEventListener("keydown",function(e){
    if(!e.altKey||e.ctrlKey||e.metaKey||(e.key!=="a"&&e.key!=="A"&&e.code!=="KeyA")) return;
    var t=e.target; if(t&&/^(input|textarea|select)$/i.test(t.tagName)||t&&t.isContentEditable) return;
    e.preventDefault(); e.stopPropagation(); run(e.shiftKey?-1:1);
  },true);
  function addBtn(){
    var bar=document.querySelector(".timeline-toolbar"); if(!bar||$("prSelFwdBtn")) return;
    function mk(id,txt,tip,dir){ var b=document.createElement("button"); b.type="button"; b.className="toolbtn"; b.id=id; b.textContent=txt; b.title=tip; b.onclick=function(){ run(dir); }; return b; }
    var a=$("prCutAllBtn")||$("prReplaceBtn")||$("fitTimelineBtn"), b1=mk("prSelBackBtn","\u2190 Sel","Select this clip and everything before it on all tracks (Alt+Shift+A)",-1), b2=mk("prSelFwdBtn","Sel \u2192","Select this clip and everything after it on all tracks (Alt+A)",1);
    if(a&&a.parentNode===bar){ bar.insertBefore(b1,a.nextSibling); bar.insertBefore(b2,b1.nextSibling); } else { bar.appendChild(b1); bar.appendChild(b2); }
  }
  addBtn(); setTimeout(addBtn,1000);
  try{ window.AMIYO_EDITOR_BUILD="pr-step09-track-select"; }catch(e){}
})();

;
/* ==================== Script 405 id="amiyo-pr-step10-nudge" ==================== */
/* Premiere step 10: Nudge. Move the selected clip(s) one frame left/right (Shift+Alt+\u2190 / \u2192, add Ctrl/Cmd for 5 frames) and up/down to the next track of the same kind
   (Shift+Alt+\u2191 / \u2193). Also four buttons in the timeline toolbar. A move that would overlap another clip, pass time 0 or touch a locked track is refused as a whole. One undo step. */
(function(){
  "use strict";
  var $=function(id){ return document.getElementById(id); };
  function say(m){ try{ toast(m); }catch(e){} }
  function fps(){ return (project.settings&&project.settings.fps)||30; }
  function sel(){ var L=[]; try{ L=selectedClips(); }catch(e){} return L; }
  function hits(tr,c,start,skip){ for(var i=0;i<tr.clips.length;i++){ var o=tr.clips[i]; if(skip[o.id]) continue; if(start<o.start+o.duration-.001&&start+c.duration>o.start+.001) return true; } return false; }
  function finish(label,before){
    try{ pushHistory(label,before); }catch(e){ project.history.entries.push({label:label,before:before,after:serializableProject()}); project.history.index=project.history.entries.length-1; }
    try{ scheduleAutosave(); renderAll(); }catch(e){}
  }
  function nudge(frames){
    var L=sel(); if(!L.length){ say("Select a clip first"); return; }
    var d=frames/fps(), skip={}; L.forEach(function(x){ skip[x.clip.id]=1; });
    for(var i=0;i<L.length;i++){
      var x=L[i]; if(x.track.locked){ say("A selected clip is on a locked track"); return; }
      var s=x.clip.start+d; if(s<-.0005){ say("Cannot move before time 0"); return; }
      if(hits(x.track,x.clip,s,skip)){ say("Blocked by the next clip"); return; }
    }
    var before=deepClone(serializableProject());
    L.forEach(function(x){ x.clip.start=Math.max(0,+(x.clip.start+d).toFixed(5)); });
    finish("Nudge clips",before); say((frames>0?"+":"")+frames+" frame"+(Math.abs(frames)===1?"":"s"));
  }
  function moveTrack(dir){
    var L=sel(); if(!L.length){ say("Select a clip first"); return; }
    var skip={}, plan=[]; L.forEach(function(x){ skip[x.clip.id]=1; });
    for(var i=0;i<L.length;i++){
      var x=L[i], same=project.tracks.filter(function(t){ return t.kind===x.track.kind; }), k=same.indexOf(x.track)+dir, to=same[k];
      if(!to){ say(dir<0?"Already on the top track":"Already on the bottom track"); return; }
      if(x.track.locked||to.locked){ say("A track is locked"); return; }
      if(hits(to,x.clip,x.clip.start,skip)){ say("The other track is occupied there"); return; }
      plan.push([x,to]);
    }
    var before=deepClone(serializableProject());
    plan.forEach(function(p){ var x=p[0], to=p[1]; x.track.clips.splice(x.track.clips.indexOf(x.clip),1); to.clips.push(x.clip); to.clips.sort(function(a,b){ return a.start-b.start; }); selectedTrackId=to.id; });
    finish("Move clips to another track",before); say("Moved "+(dir<0?"up":"down"));
  }
  window.amiyoNudge={nudge:nudge,moveTrack:moveTrack};
  document.addEventListener("keydown",function(e){
    if(!(e.shiftKey&&e.altKey)||!/^Arrow(Left|Right|Up|Down)$/.test(e.key)) return;
    var t=e.target; if(t&&/^(input|textarea|select)$/i.test(t.tagName)||t&&t.isContentEditable) return;
    e.preventDefault(); e.stopPropagation();
    if(e.key==="ArrowLeft") nudge(e.ctrlKey||e.metaKey?-5:-1); else if(e.key==="ArrowRight") nudge(e.ctrlKey||e.metaKey?5:1);
    else moveTrack(e.key==="ArrowUp"?-1:1);
  },true);
  function addBtn(){
    var bar=document.querySelector(".timeline-toolbar"); if(!bar||$("prNudgeL")) return;
    var defs=[["prNudgeL","\u21E0 1f","Nudge left one frame (Shift+Alt+\u2190)",function(){ nudge(-1); }],["prNudgeR","1f \u21E2","Nudge right one frame (Shift+Alt+\u2192)",function(){ nudge(1); }],
      ["prMoveUp","\u21E1 Track","Move to the track above (Shift+Alt+\u2191)",function(){ moveTrack(-1); }],["prMoveDown","\u21E3 Track","Move to the track below (Shift+Alt+\u2193)",function(){ moveTrack(1); }]];
    var a=$("prSelFwdBtn")||$("fitTimelineBtn"), at=a&&a.parentNode===bar?a.nextSibling:null;
    defs.forEach(function(d){ var b=document.createElement("button"); b.type="button"; b.className="toolbtn"; b.id=d[0]; b.textContent=d[1]; b.title=d[2]; b.onclick=d[3]; bar.insertBefore(b,at); });
  }
  addBtn(); setTimeout(addBtn,1000);
  try{ window.AMIYO_EDITOR_BUILD="pr-step10-nudge"; }catch(e){}
})();

;
/* ==================== Script 406 id="amiyo-pr-step11-mark-clip" ==================== */
/* Premiere step 11: Mark Clip (X). Sets the sequence In and Out points to exactly the selected clip (or, with several selected, from the first start to the last end).
   Nothing selected: the clip under the playhead on the target/top video track. Use it with Lift / Extract, Loop I-O and export range. Also a "Mark clip" toolbar button. */
(function(){
  "use strict";
  var $=function(id){ return document.getElementById(id); };
  function say(m){ try{ toast(m); }catch(e){} }
  function tf(t){ var m=Math.floor(t/60), s=t-m*60; return m+":"+(s<10?"0":"")+s.toFixed(2); }
  function markClip(){
    var L=[]; try{ L=selectedClips(); }catch(e){}
    if(!L.length){
      for(var i=0;i<project.tracks.length&&!L.length;i++){ var tr=project.tracks[i]; if(tr.kind!=="video") continue;
        for(var j=0;j<tr.clips.length;j++){ var c=tr.clips[j]; if(currentTime>=c.start&&currentTime<c.start+c.duration){ L=[{track:tr,clip:c}]; break; } } }
    }
    if(!L.length){ say("Select a clip, or park the playhead on one"); return; }
    var a=Infinity,b=0; L.forEach(function(x){ a=Math.min(a,x.clip.start); b=Math.max(b,x.clip.start+x.clip.duration); });
    if(typeof window.amiyoSetIO!=="function"){ say("In/Out is not available in this build"); return; }
    window.amiyoSetIO(a,b); try{ scheduleAutosave(); }catch(e){}
    say("In "+tf(a)+"  Out "+tf(b)+(L.length>1?" ("+L.length+" clips)":""));
  }
  window.amiyoMarkClip=markClip;
  document.addEventListener("keydown",function(e){
    if(e.ctrlKey||e.metaKey||e.altKey||e.shiftKey||(e.key!=="x"&&e.key!=="X")) return;
    var t=e.target; if(t&&/^(input|textarea|select)$/i.test(t.tagName)||t&&t.isContentEditable) return;
    e.preventDefault(); e.stopPropagation(); markClip();
  },true);
  function addBtn(){
    var bar=document.querySelector(".timeline-toolbar"); if(!bar||$("prMarkClipBtn")) return;
    var b=document.createElement("button"); b.type="button"; b.className="toolbtn"; b.id="prMarkClipBtn"; b.textContent="\u2194 Mark clip"; b.title="Set In and Out around the selected clip (X)"; b.onclick=markClip;
    var a=$("loopRangeBtn")||$("fitTimelineBtn"); if(a&&a.parentNode===bar) bar.insertBefore(b,a.nextSibling); else bar.appendChild(b);
  }
  addBtn(); setTimeout(addBtn,1000);
  try{ window.AMIYO_EDITOR_BUILD="pr-step11-mark-clip"; }catch(e){}
})();

;
/* ==================== Script 407 id="amiyo-pr-step12-cut-markers" ==================== */
/* Premiere step 12: Markers at every cut. One tap ("Cuts \u2192 markers") puts a marker on every cut between video clips (each video clip's start except the first at 0),
   named "Cut 1", "Cut 2" ... Cuts that already have a marker (within 0.05 s) are skipped, so it is safe to run again. One undo step. Also in the command search. */
(function(){
  "use strict";
  var $=function(id){ return document.getElementById(id); };
  function say(m){ try{ toast(m); }catch(e){} }
  function run(){
    var T=[]; project.tracks.forEach(function(tr){ if(tr.kind!=="video") return; tr.clips.forEach(function(c){ if(c.kind==="adjustment") return; if(c.start>0.04) T.push(+c.start.toFixed(3)); }); });
    T.sort(function(a,b){ return a-b; });
    var cuts=[]; T.forEach(function(t){ if(!cuts.length||t-cuts[cuts.length-1]>0.05) cuts.push(t); });
    if(!cuts.length){ say("No cuts found on the video tracks"); return; }
    project.markers=project.markers||[];
    var before=deepClone(serializableProject()), n=0;
    cuts.forEach(function(t,i){
      if(project.markers.some(function(m){ return Math.abs(m.time-t)<0.05; })) return;
      project.markers.push({id:"marker_"+Date.now().toString(36)+Math.random().toString(36).slice(2,6)+i,time:t,label:"Cut "+(i+1),color:"#ff8040"}); n++;
    });
    if(!n){ say("Every cut already has a marker"); return; }
    try{ pushHistory("Markers at cuts",before); }catch(e){ project.history.entries.push({label:"Markers at cuts",before:before,after:serializableProject()}); project.history.index=project.history.entries.length-1; }
    try{ scheduleAutosave(); renderAll(); }catch(e){}
    say(n+" marker"+(n>1?"s":"")+" added at cuts");
  }
  window.amiyoCutsToMarkers=run;
  var oc=window.commandList; if(typeof oc==="function") window.commandList=function(){ return oc.apply(this,arguments).concat([["Markers at every cut","amiyoCutsToMarkers()"]]); };
  function addBtn(){
    var bar=document.querySelector(".timeline-toolbar"); if(!bar||$("prCutsMarkBtn")) return;
    var b=document.createElement("button"); b.type="button"; b.className="toolbtn"; b.id="prCutsMarkBtn"; b.textContent="\u25C6 Cuts\u2192markers"; b.title="Put a marker on every cut between video clips"; b.onclick=run;
    var a=$("prMarkClipBtn")||$("fitTimelineBtn"); if(a&&a.parentNode===bar) bar.insertBefore(b,a.nextSibling); else bar.appendChild(b);
  }
  addBtn(); setTimeout(addBtn,1000);
  try{ window.AMIYO_EDITOR_BUILD="pr-step12-cut-markers"; }catch(e){}
})();

;
/* ==================== Script 408 id="amiyo-pr-step13-paste-insert" ==================== */
/* Premiere step 13: Paste Insert (Ctrl/Cmd+Shift+V). Pastes the copied clip(s) at the playhead and pushes everything after it on the same track(s) to the right instead of
   covering it; a clip under the playhead is split so nothing is lost. Works with the normal copy (Ctrl+C, or the clip menu). Several copied clips keep their spacing. One undo step. */
(function(){
  "use strict";
  var $=function(id){ return document.getElementById(id); };
  function say(m){ try{ toast(m); }catch(e){} }
  var buf=null;
  document.addEventListener("keydown",function(e){
    if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&!e.altKey&&(e.key==="c"||e.key==="C")){
      var t=e.target; if(t&&/^(input|textarea|select)$/i.test(t.tagName)||t&&t.isContentEditable) return;
      setTimeout(function(){ try{ var L=selectedClips(); if(L.length>1) buf=L.map(function(x){ return {trackId:x.track.id,kind:x.track.kind,clip:deepClone(x.clip)}; }); else buf=null; }catch(err){ buf=null; } },0);
    }
  },true);
  function items(){
    var one=null; try{ if(clipboardClip&&clipboardClip.clip){ var tr=project.tracks.find(function(t){ return t.id===clipboardClip.trackId; }); one=[{trackId:clipboardClip.trackId,kind:tr?tr.kind:"video",clip:deepClone(clipboardClip.clip)}]; } }catch(e){}
    if(buf&&one&&buf.some(function(b){ return b.clip.id===one[0].clip.id; })) return buf;
    return one;
  }
  function splitAt(tr,t){
    tr.clips.slice().forEach(function(c){
      if(t<=c.start+.03||t>=c.start+c.duration-.03) return;
      var r=deepClone(c); r.id=uid("clip"); r.start=t; r.duration=c.start+c.duration-t; r.selected=false;
      var el=t-c.start, so=(c.outPoint!=null?c.outPoint:(c.inPoint||0)+c.duration)-(c.inPoint||0), k=c.duration?el/c.duration:0;
      r.inPoint=(c.inPoint||0)+so*k; c.duration=el; c.outPoint=r.inPoint; tr.clips.splice(tr.clips.indexOf(c)+1,0,r);
    });
  }
  function pasteInsert(){
    var L=items(); if(!L||!L.length){ say("Nothing copied yet"); return; }
    var min=Math.min.apply(null,L.map(function(x){ return x.clip.start; })), t0=currentTime, span=0, plan=[];
    for(var i=0;i<L.length;i++){
      var x=L[i], tr=project.tracks.find(function(t){ return t.id===x.trackId; });
      if(!tr||tr.locked||tr.kind!==x.kind){ tr=project.tracks.find(function(t){ return t.kind===x.kind&&!t.locked; }); }
      if(!tr){ say("No unlocked track to paste into"); return; }
      var off=x.clip.start-min; span=Math.max(span,off+x.clip.duration); plan.push({tr:tr,clip:x.clip,off:off});
    }
    var before=deepClone(serializableProject()), done={}, made=[];
    try{ clearMultiSelection(); }catch(e){}
    plan.forEach(function(p){
      if(!done[p.tr.id]){ done[p.tr.id]=1; splitAt(p.tr,t0); p.tr.clips.forEach(function(c){ if(c.start>=t0-.001) c.start+=span; }); }
    });
    plan.forEach(function(p){
      var c=deepClone(p.clip); c.id=uid("clip"); c.start=t0+p.off; c.selected=true; c.linkId=null; c.groupId=null;
      p.tr.clips.push(c); p.tr.clips.sort(function(a,b){ return a.start-b.start; }); made.push({tr:p.tr,c:c});
    });
    var last=made[made.length-1]; selectedClipId=last.c.id; selectedTrackId=last.tr.id;
    try{ pushHistory("Paste insert",before); }catch(e){ project.history.entries.push({label:"Paste insert",before:before,after:serializableProject()}); project.history.index=project.history.entries.length-1; }
    try{ scheduleAutosave(); renderAll(); }catch(e){}
    say("Inserted "+made.length+" clip"+(made.length>1?"s":"")+"; later clips moved right");
  }
  window.amiyoPasteInsert=pasteInsert;
  document.addEventListener("keydown",function(e){
    if(!(e.ctrlKey||e.metaKey)||!e.shiftKey||e.altKey||(e.key!=="v"&&e.key!=="V")) return;
    var t=e.target; if(t&&/^(input|textarea|select)$/i.test(t.tagName)||t&&t.isContentEditable) return;
    e.preventDefault(); e.stopPropagation(); pasteInsert();
  },true);
  var oc=window.commandList; if(typeof oc==="function") window.commandList=function(){ return oc.apply(this,arguments).concat([["Paste insert (push later clips)","amiyoPasteInsert()"]]); };
  function addBtn(){
    var bar=document.querySelector(".timeline-toolbar"); if(!bar||$("prPasteInsBtn")) return;
    var b=document.createElement("button"); b.type="button"; b.className="toolbtn"; b.id="prPasteInsBtn"; b.textContent="\u2398 Paste insert"; b.title="Paste at the playhead and push later clips right (Ctrl+Shift+V)"; b.onclick=pasteInsert;
    var a=$("prCutsMarkBtn")||$("fitTimelineBtn"); if(a&&a.parentNode===bar) bar.insertBefore(b,a.nextSibling); else bar.appendChild(b);
  }
  addBtn(); setTimeout(addBtn,1000);
  try{ window.AMIYO_EDITOR_BUILD="pr-step13-paste-insert"; }catch(e){}
})();

;
/* ==================== Script 409 id="amiyo-pr-step14-timecode" ==================== */
/* Premiere step 14: Timecode display modes. A small "TC" button beside the time readout cycles Time (mm:ss.mmm) \u2192 Timecode (hh:mm:ss:ff) \u2192 Frames \u2192 Seconds.
   The mode is saved with the project. Typing a time into the readout still works the same way. */
(function(){
  "use strict";
  var $=function(id){ return document.getElementById(id); };
  var MODES=["time","tc","frames","sec"], NAMES={time:"Time",tc:"Timecode",frames:"Frames",sec:"Seconds"}, SHORT={time:"TIME",tc:"TC",frames:"FR",sec:"SEC"};
  function fps(){ return Math.max(1,Math.round((project.settings&&project.settings.fps)||30)); }
  function mode(){ var m=project.settings&&project.settings.tcMode; return MODES.indexOf(m)>=0?m:"time"; }
  function p2(n){ return (n<10?"0":"")+n; }
  function show(t){
    var m=mode(), f=fps(); t=Math.max(0,t||0);
    if(m==="sec") return t.toFixed(2)+" s";
    var fr=Math.round(t*f);
    if(m==="frames") return String(fr);
    var ff=fr%f, s=Math.floor(fr/f), h=Math.floor(s/3600), mm=Math.floor(s/60)%60, ss=s%60;
    return p2(h)+":"+p2(mm)+":"+p2(ss)+":"+p2(ff);
  }
  function paint(){
    var ro=$("timeReadout"); if(!ro) return;
    if(mode()!=="time"){ var tot; try{ tot=getProjectDuration(); }catch(e){ tot=0; } ro.textContent=show(currentTime)+" / "+show(tot); }
    var b=$("prTcBtn"); if(b){ b.textContent=SHORT[mode()]; b.title="Time display: "+NAMES[mode()]+" (tap to change)"; }
  }
  var o=window.renderTime;
  if(typeof o==="function"&&!o.__pr14){ var w=function(){ var r=o.apply(this,arguments); try{ paint(); }catch(e){} return r; }; w.__pr14=1; window.renderTime=w; }
  function cycle(){
    project.settings=project.settings||{}; var i=(MODES.indexOf(mode())+1)%MODES.length; project.settings.tcMode=MODES[i];
    try{ scheduleAutosave(); }catch(e){} try{ renderTime(); }catch(e){} paint();
    try{ toast("Time display: "+NAMES[MODES[i]]); }catch(e){}
  }
  window.amiyoCycleTimecode=cycle;
  function addBtn(){
    var ro=$("timeReadout"); if(!ro||$("prTcBtn")) return;
    var b=document.createElement("button"); b.type="button"; b.id="prTcBtn"; b.className="toolbtn"; b.style.cssText="min-width:38px;padding:2px 6px;font-size:10px;margin-left:6px";
    b.onclick=function(e){ e.stopPropagation(); cycle(); };
    ro.parentNode.insertBefore(b,ro.nextSibling); paint();
  }
  var oc=window.commandList; if(typeof oc==="function") window.commandList=function(){ return oc.apply(this,arguments).concat([["Change time display (timecode / frames)","amiyoCycleTimecode()"]]); };
  addBtn(); setTimeout(function(){ addBtn(); paint(); },1000);
  try{ window.AMIYO_EDITOR_BUILD="pr-step14-timecode"; }catch(e){}
})();

;
/* ==================== Script 410 id="amiyo-pr-step15-fade-presets" ==================== */
/* Premiere step 15: Fade presets. Select one or more clips, tap "Fades" and pick a length for the fade in, the fade out, or both ends at once (0.25, 0.5, 1, 2 s, or Off).
   Fades never get longer than half the clip. Works on audio and picture clips. One undo step. */
(function(){
  "use strict";
  var $=function(id){ return document.getElementById(id); };
  var sheet=null, VALS=[0,.25,.5,1,2];
  function say(m){ try{ toast(m); }catch(e){} }
  function sel(){ var L=[]; try{ L=selectedClips(); }catch(e){} return L.filter(function(x){ return x.clip.kind!=="adjustment"; }); }
  function apply(side,v){
    var L=sel(); if(!L.length){ say("Select a clip first"); return; }
    if(L.some(function(x){ return x.track.locked; })){ say("A selected clip is on a locked track"); return; }
    var before=deepClone(serializableProject());
    L.forEach(function(x){ var c=x.clip, mx=Math.max(0,c.duration/2), val=Math.min(v,mx);
      if(side!=="out") c.fadeIn=val; if(side!=="in") c.fadeOut=val; });
    try{ pushHistory("Fade preset",before); }catch(e){ project.history.entries.push({label:"Fade preset",before:before,after:serializableProject()}); project.history.index=project.history.entries.length-1; }
    try{ scheduleAutosave(); renderAll(); }catch(e){}
    say((v?v+" s ":"No ")+(side==="both"?"fades on both ends":side==="in"?"fade in":"fade out")+(L.length>1?" on "+L.length+" clips":""));
  }
  function row(label,side){
    return '<div class="fr"><span>'+label+'</span>'+VALS.map(function(v){ return '<button type="button" data-side="'+side+'" data-v="'+v+'">'+(v?v+" s":"Off")+'</button>'; }).join("")+'</div>';
  }
  function css(){
    var s=document.createElement("style"); s.id="pr15-css";
    s.textContent="#prFadeSheet{position:fixed;inset:0;z-index:318;display:none;flex-direction:column;justify-content:flex-end;background:rgba(6,5,4,.6)}"+
    "#prFadeSheet .box{background:#14120f;border-top:1px solid #302c26;border-radius:16px 16px 0 0;padding:14px 14px calc(14px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:10px}"+
    "#prFadeSheet h4{margin:0;font:700 15px system-ui;color:#ffb454}#prFadeSheet p{margin:0;font-size:12.5px;color:#948a79;line-height:1.5}"+
    "#prFadeSheet .fr{display:flex;flex-wrap:wrap;gap:6px;align-items:center}#prFadeSheet .fr span{width:100%;font-size:12px;color:#c9c0ad;font-weight:600}"+
    "#prFadeSheet button{min-height:44px;flex:1;min-width:54px;border-radius:11px;border:1px solid #302c26;background:#211f1b;color:#f1ece2;font-size:13px}#prFadeSheet button:active{background:#33291a}";
    document.head.appendChild(s);
  }
  function ui(){
    css(); sheet=document.createElement("div"); sheet.id="prFadeSheet"; sheet.setAttribute("role","dialog"); sheet.setAttribute("aria-label","Fade presets");
    sheet.innerHTML='<div class="box"><div style="display:flex;justify-content:space-between;align-items:center"><h4>\u25E2 Fade presets</h4><button type="button" id="prFadeX" style="flex:none;min-width:70px" aria-label="Close">Close</button></div><p id="prFadeInfo"></p>'+row("Both ends","both")+row("Fade in","in")+row("Fade out","out")+'</div>';
    document.body.appendChild(sheet); $("prFadeX").onclick=close;
    sheet.addEventListener("click",function(e){ if(e.target===sheet){ close(); return; } var b=e.target.closest&&e.target.closest("button[data-side]"); if(b){ apply(b.getAttribute("data-side"),+b.getAttribute("data-v")); } });
  }
  function open(){ if(!sel().length){ say("Select a clip first"); return; } if(!sheet) ui(); var n=sel().length; $("prFadeInfo").textContent=n+" clip"+(n>1?"s":"")+" selected. Tap a length to apply it right away."; sheet.style.display="flex"; }
  function close(){ if(sheet) sheet.style.display="none"; }
  window.amiyoFadePresets={open:open,close:close,apply:apply};
  var oc=window.commandList; if(typeof oc==="function") window.commandList=function(){ return oc.apply(this,arguments).concat([["Fade presets","amiyoFadePresets.open()"]]); };
  function addBtn(){
    var bar=document.querySelector(".timeline-toolbar"); if(!bar||$("prFadeBtn")) return;
    var b=document.createElement("button"); b.type="button"; b.className="toolbtn"; b.id="prFadeBtn"; b.textContent="\u25E2 Fades"; b.title="Fade in / out presets for the selected clips"; b.onclick=open;
    var a=$("prPasteInsBtn")||$("fitTimelineBtn"); if(a&&a.parentNode===bar) bar.insertBefore(b,a.nextSibling); else bar.appendChild(b);
  }
  addBtn(); setTimeout(addBtn,1000);
  try{ window.AMIYO_EDITOR_BUILD="pr-step15-fade-presets"; }catch(e){}
})();

;
/* ==================== Script 411 id="amiyo-pr-step16-remove-unused" ==================== */
/* Premiere step 16: Remove unused media (Project Manager style). Finds every media item in the project that no clip, background or other setting uses, tells you how many
   (and how many MB), and removes them after you confirm. Items in use are never touched. One undo step. Button "Clean media" in the timeline toolbar and in the command search. */
(function(){
  "use strict";
  var $=function(id){ return document.getElementById(id); };
  function say(m){ try{ toast(m); }catch(e){} }
  function unused(){
    var o={}; for(var k in project){ if(k!=="assets"&&k!=="history") o[k]=project[k]; }
    var blob=""; try{ blob=JSON.stringify(o); }catch(e){ return null; }
    return Object.keys(project.assets||{}).filter(function(id){ return blob.indexOf('"'+id+'"')<0; });
  }
  async function run(){
    var L=unused(); if(L==null){ say("Could not check the project"); return; }
    if(!L.length){ say("No unused media. Everything is in use."); return; }
    var mb=L.reduce(function(s,id){ return s+((project.assets[id]&&project.assets[id].size)||0); },0)/1048576;
    var msg="Remove "+L.length+" unused media item"+(L.length>1?"s":"")+(mb>=0.1?" (about "+mb.toFixed(1)+" MB)":"")+" from this project? Clips are not affected. You can undo this.";
    var ok=true;
    try{ if(window.amiyoOk) ok=await window.amiyoOk(msg,{okLabel:"Remove",danger:true}); else ok=confirm(msg); }catch(e){ ok=false; }
    if(!ok) return;
    L=unused()||[]; if(!L.length) return;
    var before=deepClone(serializableProject());
    L.forEach(function(id){ delete project.assets[id]; });
    try{ pushHistory("Remove unused media",before); }catch(e){ project.history.entries.push({label:"Remove unused media",before:before,after:serializableProject()}); project.history.index=project.history.entries.length-1; }
    try{ scheduleAutosave(); renderAll(); }catch(e){}
    say(L.length+" unused item"+(L.length>1?"s":"")+" removed");
  }
  window.amiyoRemoveUnused=run;
  var oc=window.commandList; if(typeof oc==="function") window.commandList=function(){ return oc.apply(this,arguments).concat([["Remove unused media","amiyoRemoveUnused()"]]); };
  function addBtn(){
    var bar=document.querySelector(".timeline-toolbar"); if(!bar||$("prCleanBtn")) return;
    var b=document.createElement("button"); b.type="button"; b.className="toolbtn"; b.id="prCleanBtn"; b.textContent="\uD83E\uDDF9 Clean media"; b.title="Remove media that nothing uses"; b.onclick=run;
    var a=$("prFadeBtn")||$("fitTimelineBtn"); if(a&&a.parentNode===bar) bar.insertBefore(b,a.nextSibling); else bar.appendChild(b);
  }
  addBtn(); setTimeout(addBtn,1000);
  try{ window.AMIYO_EDITOR_BUILD="pr-step16-remove-unused"; }catch(e){}
})();

;
/* ==================== Script 412 id="amiyo-pr-step17-tools-menu" ==================== */
/* Premiere step 17: "Pr tools" menu. The toolbar had grown a dozen Premiere buttons, which is too many for a phone. They now live in one menu (button "\uD83C\uDFAC Pr tools"),
   grouped as Edit, Select & move, Marks and Setup, each with its shortcut. Every shortcut still works. The menu has a switch to show the separate buttons again (saved with the project). */
(function(){
  "use strict";
  var $=function(id){ return document.getElementById(id); };
  var G=[
   ["Edit",[["prCutAllBtn","\u2702 Cut all tracks","Ctrl+Shift+K"],["prReplaceBtn","\uD83D\uDD01 Replace clip",""],["prPasteInsBtn","\u2398 Paste insert","Ctrl+Shift+V"],["prFadeBtn","\u25E2 Fade presets",""],["s5Btn","\u21E5 Extend edit","E"],["s4Btn","\u267B Remove attributes",""]]],
   ["Select & move",[["prSelFwdBtn","Select forward \u2192","Alt+A"],["prSelBackBtn","\u2190 Select backward","Alt+Shift+A"],["prNudgeL","\u21E0 Nudge 1 frame","Shift+Alt+\u2190"],["prNudgeR","Nudge 1 frame \u21E2","Shift+Alt+\u2192"],["prMoveUp","\u21E1 Track up","Shift+Alt+\u2191"],["prMoveDown","\u21E3 Track down","Shift+Alt+\u2193"]]],
   ["Marks & finding",[["prMarkClipBtn","\u2194 Mark clip","X"],["prCutsMarkBtn","\u25C6 Markers at cuts",""],["prMatchBtn","\uD83D\uDD0D Match frame","F"],["prRevealBtn","\uD83D\uDCC2 Reveal in bin",""]]],
   ["Setup",[["s1Btn","\uD83C\uDFAF Track targets",""],["s2Btn","\uD83C\uDF9E Source monitor",""],["s3Btn","\uD83D\uDCC8 Keyframe easing",""],["prCleanBtn","\uD83E\uDDF9 Clean unused media",""]]]
  ];
  var ids=[]; G.forEach(function(g){ g[1].forEach(function(x){ ids.push(x[0]); }); });
  var sheet=null, st=null;
  function showAll(){ return !!(project.settings&&project.settings.prShowBtns); }
  function css(){
    st=document.createElement("style"); st.id="pr17-css";
    st.textContent="#prToolsSheet{position:fixed;inset:0;z-index:318;display:none;flex-direction:column;justify-content:flex-end;background:rgba(6,5,4,.6)}"+
    "#prToolsSheet .box{background:#14120f;border-top:1px solid #302c26;border-radius:16px 16px 0 0;padding:14px 14px calc(14px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:8px;max-height:82vh;overflow:auto}"+
    "#prToolsSheet h4{margin:0;font:700 15px system-ui;color:#ffb454}#prToolsSheet h5{margin:6px 0 0;font:700 11px system-ui;letter-spacing:.06em;text-transform:uppercase;color:#8f8777}"+
    "#prToolsSheet .g{display:grid;grid-template-columns:1fr 1fr;gap:7px}#prToolsSheet button{min-height:46px;border-radius:11px;border:1px solid #302c26;background:#211f1b;color:#f1ece2;font-size:12.5px;padding:5px 8px;text-align:left}"+
    "#prToolsSheet button small{display:block;font-size:10px;color:#8f8777}#prToolsSheet button:active{background:#33291a}#prToolsSheet button.off{opacity:.45}"+
    "#prToolsSheet label{display:flex;gap:8px;align-items:center;font-size:12px;color:#c9c0ad;margin-top:6px}";
    document.head.appendChild(st);
  }
  function hide(){
    var s=$("pr17-hide"); if(!s){ s=document.createElement("style"); s.id="pr17-hide"; document.head.appendChild(s); }
    s.textContent=showAll()?"":ids.map(function(i){ return "#"+i; }).join(",")+"{display:none!important}";
  }
  function ui(){
    css();
    sheet=document.createElement("div"); sheet.id="prToolsSheet"; sheet.setAttribute("role","dialog"); sheet.setAttribute("aria-label","Premiere tools");
    sheet.innerHTML='<div class="box"><div style="display:flex;justify-content:space-between;align-items:center"><h4>\uD83C\uDFAC Premiere tools</h4><button type="button" id="prToolsX" style="min-width:70px;text-align:center" aria-label="Close">Close</button></div>'+
      G.map(function(g){ return '<h5>'+g[0]+'</h5><div class="g">'+g[1].map(function(x){ return '<button type="button" data-id="'+x[0]+'">'+x[1]+(x[2]?'<small>'+x[2]+'</small>':'')+'</button>'; }).join("")+'</div>'; }).join("")+
      '<label><input type="checkbox" id="prToolsAll"> Also show these as separate toolbar buttons</label></div>';
    document.body.appendChild(sheet);
    $("prToolsX").onclick=close; $("prToolsAll").onchange=function(){ project.settings=project.settings||{}; project.settings.prShowBtns=this.checked; try{ scheduleAutosave(); }catch(e){} hide(); };
    sheet.addEventListener("click",function(e){
      if(e.target===sheet){ close(); return; }
      var b=e.target.closest&&e.target.closest("button[data-id]"); if(!b) return;
      var t=$(b.getAttribute("data-id")); close();
      if(t) setTimeout(function(){ t.click(); },0); else { try{ toast("Not available in this build"); }catch(x){} }
    });
  }
  function open(){ if(!sheet) ui(); $("prToolsAll").checked=showAll();
    ids.forEach(function(i){ var b=sheet.querySelector('button[data-id="'+i+'"]'); if(b) b.classList.toggle("off",!$(i)); });
    sheet.style.display="flex"; }
  function close(){ if(sheet) sheet.style.display="none"; }
  window.amiyoPrTools={open:open,close:close};
  var oc=window.commandList; if(typeof oc==="function") window.commandList=function(){ return oc.apply(this,arguments).concat([["Premiere tools menu","amiyoPrTools.open()"]]); };
  function addBtn(){
    var bar=document.querySelector(".timeline-toolbar"); if(!bar||$("prToolsBtn")) return;
    var b=document.createElement("button"); b.type="button"; b.className="toolbtn"; b.id="prToolsBtn"; b.textContent="\uD83C\uDFAC Pr tools"; b.title="All the Premiere-style tools in one menu"; b.onclick=open;
    var a=$("fitTimelineBtn"); if(a&&a.parentNode===bar) bar.insertBefore(b,a.nextSibling); else bar.appendChild(b);
  }
  hide(); addBtn(); setTimeout(function(){ addBtn(); hide(); },1000);
  try{ window.AMIYO_EDITOR_BUILD="pr-step17-tools-menu"; }catch(e){}
})();

;
/* ==================== Script 413 id="amiyo-pr-step18-split-markers" ==================== */
/* Premiere step 18: Split at markers. Cuts every unlocked track at every marker in one go (markers on a clip edge or inside 0.03 s of one are skipped). One undo step.
   Also adds a "More" section to the Pr tools menu: later steps register their actions there with amiyoPrAdd(label, hint, fn). */
(function(){
  "use strict";
  var $=function(id){ return document.getElementById(id); };
  function say(m){ try{ toast(m); }catch(e){} }
  var more=window.__prMore=window.__prMore||[];
  window.amiyoPrAdd=function(label,hint,fn){ more.push({l:label,h:hint||"",f:fn}); };
  (function(){
    var T=window.amiyoPrTools; if(!T||T.__more) return; var o=T.open; T.__more=1;
    T.open=function(){
      o.apply(this,arguments);
      var sh=$("prToolsSheet"); if(!sh) return;
      var box=sh.querySelector(".box"), old=$("prMoreWrap"); if(old) old.remove();
      var w=document.createElement("div"); w.id="prMoreWrap";
      w.innerHTML='<h5>More</h5><div class="g">'+more.map(function(m,i){ return '<button type="button" data-more="'+i+'">'+m.l+(m.h?'<small>'+m.h+'</small>':'')+'</button>'; }).join("")+'</div>';
      var lab=box.querySelector("label"); box.insertBefore(w,lab);
      if(!sh.__moreH){ sh.__moreH=1; sh.addEventListener("click",function(e){
        var b=e.target.closest&&e.target.closest("button[data-more]"); if(!b) return;
        var m=more[+b.getAttribute("data-more")]; T.close(); if(m) setTimeout(function(){ try{ m.f(); }catch(x){ say("That action failed"); } },0);
      }); }
    };
  })();
  function splitAll(){
    var M=(project.markers||[]).map(function(m){ return m.time; }).sort(function(a,b){ return a-b; });
    if(!M.length){ say("No markers to cut at"); return; }
    var before=deepClone(serializableProject()), n=0;
    M.forEach(function(t){
      project.tracks.forEach(function(tr){
        if(tr.locked) return;
        tr.clips.slice().forEach(function(c){
          if(t<=c.start+.03||t>=c.start+c.duration-.03) return;
          var r=deepClone(c); r.id=uid("clip"); r.start=t; r.duration=c.start+c.duration-t; r.selected=false;
          var el=t-c.start, so=(c.outPoint!=null?c.outPoint:(c.inPoint||0)+c.duration)-(c.inPoint||0), k=c.duration?el/c.duration:0;
          r.inPoint=(c.inPoint||0)+so*k; c.duration=el; c.outPoint=r.inPoint; tr.clips.splice(tr.clips.indexOf(c)+1,0,r); n++;
        });
      });
    });
    if(!n){ say("Every marker is already on a cut"); return; }
    try{ pushHistory("Split at markers",before); }catch(e){ project.history.entries.push({label:"Split at markers",before:before,after:serializableProject()}); project.history.index=project.history.entries.length-1; }
    try{ scheduleAutosave(); renderAll(); }catch(e){}
    say(n+" cut"+(n>1?"s":"")+" made at markers");
  }
  window.amiyoSplitAtMarkers=splitAll;
  window.amiyoPrAdd("\u2702 Split at markers","",splitAll);
  var oc=window.commandList; if(typeof oc==="function") window.commandList=function(){ return oc.apply(this,arguments).concat([["Split at every marker","amiyoSplitAtMarkers()"]]); };
  try{ window.AMIYO_EDITOR_BUILD="pr-step18-split-markers"; }catch(e){}
})();

;
/* ==================== Script 414 id="amiyo-pr-step19-move-playhead" ==================== */
/* Premiere step 19: Move to playhead (Alt+Shift+P). Slides the selected clip(s) so the first one starts exactly at the playhead; several clips keep their spacing and tracks.
   Refused as a whole if it would overlap another clip or touch a locked track. One undo step. In the Pr tools menu under "More". */
(function(){
  "use strict";
  function say(m){ try{ toast(m); }catch(e){} }
  function run(){
    var L=[]; try{ L=selectedClips(); }catch(e){}
    if(!L.length){ say("Select a clip first"); return; }
    var min=Math.min.apply(null,L.map(function(x){ return x.clip.start; })), d=currentTime-min;
    if(Math.abs(d)<.0005){ say("Already at the playhead"); return; }
    var skip={}; L.forEach(function(x){ skip[x.clip.id]=1; });
    for(var i=0;i<L.length;i++){
      var x=L[i], s=x.clip.start+d; if(x.track.locked){ say("A selected clip is on a locked track"); return; }
      if(s<-.0005){ say("That would go before time 0"); return; }
      for(var j=0;j<x.track.clips.length;j++){ var o=x.track.clips[j]; if(skip[o.id]) continue; if(s<o.start+o.duration-.001&&s+x.clip.duration>o.start+.001){ say("Another clip is in the way"); return; } }
    }
    var before=deepClone(serializableProject());
    L.forEach(function(x){ x.clip.start=Math.max(0,+(x.clip.start+d).toFixed(5)); x.track.clips.sort(function(a,b){ return a.start-b.start; }); });
    try{ pushHistory("Move to playhead",before); }catch(e){ project.history.entries.push({label:"Move to playhead",before:before,after:serializableProject()}); project.history.index=project.history.entries.length-1; }
    try{ scheduleAutosave(); renderAll(); }catch(e){}
    say("Moved to the playhead");
  }
  window.amiyoMoveToPlayhead=run;
  document.addEventListener("keydown",function(e){
    if(!e.altKey||e.ctrlKey||e.metaKey||!e.shiftKey||e.code!=="KeyP") return;
    var t=e.target; if(t&&/^(input|textarea|select)$/i.test(t.tagName)||t&&t.isContentEditable) return;
    e.preventDefault(); e.stopImmediatePropagation(); run();
  },true);
  if(window.amiyoPrAdd) window.amiyoPrAdd("\u21E5 Move to playhead","Alt+Shift+P",run);
  var oc=window.commandList; if(typeof oc==="function") window.commandList=function(){ return oc.apply(this,arguments).concat([["Move selected clips to the playhead","amiyoMoveToPlayhead()"]]); };
  try{ window.AMIYO_EDITOR_BUILD="pr-step19-move-playhead"; }catch(e){}
})();

;
/* ==================== Script 415 id="amiyo-pr-step20-reverse-shuffle" ==================== */
/* Premiere step 20: Reverse order and Shuffle. Select two or more clips on a track (slideshows, montages), then reverse their order or shuffle it.
   The clips are laid end to end from where the first one started; gaps between them close. Each track is handled on its own, locked tracks are skipped.
   Both are in the Pr tools menu under "More" and the command search. One undo step each. */
(function(){
  "use strict";
  function say(m){ try{ toast(m); }catch(e){} }
  function run(mode){
    var L=[]; try{ L=selectedClips(); }catch(e){}
    var by={}; L.forEach(function(x){ if(x.track.locked) return; (by[x.track.id]=by[x.track.id]||{t:x.track,c:[]}).c.push(x.clip); });
    var groups=Object.keys(by).map(function(k){ return by[k]; }).filter(function(g){ return g.c.length>1; });
    if(!groups.length){ say("Select two or more clips on one track"); return; }
    var before=deepClone(serializableProject()), n=0;
    groups.forEach(function(g){
      var c=g.c.slice().sort(function(a,b){ return a.start-b.start; }), at=c[0].start;
      if(mode==="rev") c.reverse();
      else { for(var i=c.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)), t=c[i]; c[i]=c[j]; c[j]=t; } }
      c.forEach(function(x){ x.start=+at.toFixed(5); at+=x.duration; n++; });
      g.t.clips.sort(function(a,b){ return a.start-b.start; });
    });
    var lab=mode==="rev"?"Reverse clip order":"Shuffle clips";
    try{ pushHistory(lab,before); }catch(e){ project.history.entries.push({label:lab,before:before,after:serializableProject()}); project.history.index=project.history.entries.length-1; }
    try{ scheduleAutosave(); renderAll(); }catch(e){}
    say(n+" clips "+(mode==="rev"?"reversed":"shuffled"));
  }
  window.amiyoReverseOrder=function(){ run("rev"); }; window.amiyoShuffleClips=function(){ run("shuf"); };
  if(window.amiyoPrAdd){ window.amiyoPrAdd("\u21C5 Reverse order","",window.amiyoReverseOrder); window.amiyoPrAdd("\uD83D\uDD00 Shuffle clips","",window.amiyoShuffleClips); }
  var oc=window.commandList; if(typeof oc==="function") window.commandList=function(){ return oc.apply(this,arguments).concat([["Reverse order of selected clips","amiyoReverseOrder()"],["Shuffle selected clips","amiyoShuffleClips()"]]); };
  try{ window.AMIYO_EDITOR_BUILD="pr-step20-reverse-shuffle"; }catch(e){}
})();

;
/* ==================== Script 416 id="amiyo-pr-step21-selection" ==================== */
/* Premiere step 21: Selection helpers. "Select this track" picks every clip on the selected clip's track (or the target track); "Invert selection" swaps selected and unselected clips
   on unlocked tracks; "Select none" clears. Alt+Shift+I inverts. All three are in the Pr tools menu under "More" and the command search. */
(function(){
  "use strict";
  function say(m){ try{ toast(m); }catch(e){} }
  function fin(msg){ try{ renderAll(); }catch(e){} say(msg); }
  function selTrack(){
    var f=null; try{ f=getClip(); }catch(e){}
    var tr=f?f.track:project.tracks.find(function(t){ return t.id===selectedTrackId; });
    if(!tr){ say("Select a clip first"); return; }
    if(tr.locked){ say("The track is locked"); return; }
    try{ clearMultiSelection(); }catch(e){}
    tr.clips.forEach(function(c){ c.selected=true; });
    if(tr.clips.length){ selectedClipId=tr.clips[0].id; selectedTrackId=tr.id; }
    fin(tr.clips.length+" clip"+(tr.clips.length===1?"":"s")+" selected on this track");
  }
  function invert(){
    var chosen={}; try{ selectedClips().forEach(function(x){ chosen[x.clip.id]=1; }); }catch(e){}
    var n=0, last=null, lt=null;
    project.tracks.forEach(function(tr){ if(tr.locked) return; tr.clips.forEach(function(c){ var on=!chosen[c.id]; c.selected=on; if(on){ n++; last=c; lt=tr; } }); });
    if(last){ selectedClipId=last.id; selectedTrackId=lt.id; } else selectedClipId=null;
    fin(n+" clip"+(n===1?"":"s")+" selected");
  }
  function none(){ try{ clearMultiSelection(); }catch(e){} selectedClipId=null; fin("Selection cleared"); }
  window.amiyoSelectTrack=selTrack; window.amiyoInvertSelection=invert; window.amiyoSelectNone=none;
  document.addEventListener("keydown",function(e){
    if(!e.altKey||!e.shiftKey||e.ctrlKey||e.metaKey||e.code!=="KeyI") return;
    var t=e.target; if(t&&/^(input|textarea|select)$/i.test(t.tagName)||t&&t.isContentEditable) return;
    e.preventDefault(); e.stopImmediatePropagation(); invert();
  },true);
  if(window.amiyoPrAdd){ window.amiyoPrAdd("\u25A4 Select this track","",selTrack); window.amiyoPrAdd("\u21C4 Invert selection","Alt+Shift+I",invert); window.amiyoPrAdd("\u2715 Select none","",none); }
  var oc=window.commandList; if(typeof oc==="function") window.commandList=function(){ return oc.apply(this,arguments).concat([["Select this track","amiyoSelectTrack()"],["Invert selection","amiyoInvertSelection()"],["Select none","amiyoSelectNone()"]]); };
  try{ window.AMIYO_EDITOR_BUILD="pr-step21-selection"; }catch(e){}
})();

;
/* ==================== Script 417 id="amiyo-pr-step22-picture-length" ==================== */
/* Premiere step 22: Set picture length. Select pictures and titles, tap "Picture length" (Pr tools \u2192 More) and pick 1, 2, 3, 5 or 10 s (or type your own).
   Every selected picture/title gets that length and later clips on the same track move along so nothing overlaps. Video and audio clips are left alone. One undo step. */
(function(){
  "use strict";
  var $=function(id){ return document.getElementById(id); };
  var sheet=null;
  function say(m){ try{ toast(m); }catch(e){} }
  function still(x){ var c=x.clip; if(c.kind==="adjustment") return false; if(!c.assetId) return true; var a=project.assets&&project.assets[c.assetId]; return !!a&&a.type==="image"; }
  function sel(){ var L=[]; try{ L=selectedClips(); }catch(e){} return L.filter(still); }
  function apply(len){
    len=Math.max(.1,+len||0); var L=sel(); if(!L.length){ say("Select a picture or title first"); return; }
    if(L.some(function(x){ return x.track.locked; })){ say("A selected clip is on a locked track"); return; }
    var before=deepClone(serializableProject());
    L.sort(function(a,b){ return a.clip.start-b.clip.start; }).forEach(function(x){
      var c=x.clip, d=len-c.duration, end=c.start+c.duration;
      x.track.clips.forEach(function(o){ if(o!==c&&o.start>=end-.001) o.start+=d; });
      c.duration=len; if(c.outPoint!=null) c.outPoint=(c.inPoint||0)+len*(c.speed||1);
      if(c.fadeIn>len) c.fadeIn=len; if(c.fadeOut>len) c.fadeOut=len;
    });
    try{ pushHistory("Picture length",before); }catch(e){ project.history.entries.push({label:"Picture length",before:before,after:serializableProject()}); project.history.index=project.history.entries.length-1; }
    try{ scheduleAutosave(); renderAll(); }catch(e){}
    say(L.length+" clip"+(L.length>1?"s":"")+" set to "+len+" s");
  }
  function css(){
    var s=document.createElement("style"); s.id="pr22-css";
    s.textContent="#prLenSheet{position:fixed;inset:0;z-index:318;display:none;flex-direction:column;justify-content:flex-end;background:rgba(6,5,4,.6)}"+
    "#prLenSheet .box{background:#14120f;border-top:1px solid #302c26;border-radius:16px 16px 0 0;padding:14px 14px calc(14px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:10px}"+
    "#prLenSheet h4{margin:0;font:700 15px system-ui;color:#ffb454}#prLenSheet p{margin:0;font-size:12.5px;color:#948a79;line-height:1.5}#prLenSheet .r{display:flex;gap:7px;flex-wrap:wrap}"+
    "#prLenSheet button,#prLenSheet input{min-height:46px;flex:1;min-width:56px;border-radius:11px;border:1px solid #302c26;background:#211f1b;color:#f1ece2;font-size:14px;text-align:center}#prLenSheet button:active{background:#33291a}";
    document.head.appendChild(s);
  }
  function ui(){
    css(); sheet=document.createElement("div"); sheet.id="prLenSheet"; sheet.setAttribute("role","dialog"); sheet.setAttribute("aria-label","Picture length");
    sheet.innerHTML='<div class="box"><div style="display:flex;justify-content:space-between;align-items:center"><h4>\u23F1 Picture length</h4><button type="button" id="prLenX" style="flex:none;min-width:70px">Close</button></div><p id="prLenInfo"></p><div class="r">'+[1,2,3,5,10].map(function(v){ return '<button type="button" data-v="'+v+'">'+v+' s</button>'; }).join("")+'</div><div class="r"><input id="prLenIn" type="number" inputmode="decimal" min="0.1" step="0.1" placeholder="Seconds"><button type="button" id="prLenGo">Apply</button></div></div>';
    document.body.appendChild(sheet); $("prLenX").onclick=close;
    $("prLenGo").onclick=function(){ var v=parseFloat($("prLenIn").value); if(v>0){ close(); apply(v); } else say("Type a length in seconds"); };
    sheet.addEventListener("click",function(e){ if(e.target===sheet){ close(); return; } var b=e.target.closest&&e.target.closest("button[data-v]"); if(b){ close(); apply(+b.getAttribute("data-v")); } });
  }
  function open(){ var n=sel().length; if(!n){ say("Select a picture or title first"); return; } if(!sheet) ui(); $("prLenInfo").textContent=n+" picture/title clip"+(n>1?"s":"")+" selected. Later clips move along."; sheet.style.display="flex"; }
  function close(){ if(sheet) sheet.style.display="none"; }
  window.amiyoPictureLength={open:open,apply:apply};
  if(window.amiyoPrAdd) window.amiyoPrAdd("\u23F1 Picture length","",open);
  var oc=window.commandList; if(typeof oc==="function") window.commandList=function(){ return oc.apply(this,arguments).concat([["Set picture length","amiyoPictureLength.open()"]]); };
  try{ window.AMIYO_EDITOR_BUILD="pr-step22-picture-length"; }catch(e){}
})();

;
/* ==================== Script 418 id="amiyo-pr-step23-dup-track" ==================== */
/* Premiere step 23: Duplicate to track above / below. Puts a copy of each selected clip on the next track of the same kind, at the same time (handy for layering a picture over
   itself, or a backup audio track). Refused as a whole when the target track is locked or already has something there. The copies become the selection. One undo step. */
(function(){
  "use strict";
  function say(m){ try{ toast(m); }catch(e){} }
  function run(dir){
    var L=[]; try{ L=selectedClips(); }catch(e){}
    if(!L.length){ say("Select a clip first"); return; }
    var plan=[], used={};
    for(var i=0;i<L.length;i++){
      var x=L[i], same=project.tracks.filter(function(t){ return t.kind===x.track.kind; }), to=same[same.indexOf(x.track)+dir];
      if(!to){ say(dir<0?"No track above":"No track below"); return; }
      if(to.locked){ say("The other track is locked"); return; }
      var s=x.clip.start, e=s+x.clip.duration;
      if(to.clips.some(function(o){ return s<o.start+o.duration-.001&&e>o.start+.001; })||(used[to.id]||[]).some(function(r){ return s<r[1]-.001&&e>r[0]+.001; })){ say("The other track is occupied there"); return; }
      (used[to.id]=used[to.id]||[]).push([s,e]); plan.push([x,to]);
    }
    var before=deepClone(serializableProject());
    try{ clearMultiSelection(); }catch(e){}
    var last=null;
    plan.forEach(function(p){ var c=deepClone(p[0].clip); c.id=uid("clip"); c.linkId=null; c.groupId=null; c.selected=true; p[1].clips.push(c); p[1].clips.sort(function(a,b){ return a.start-b.start; }); last={c:c,t:p[1]}; });
    if(last){ selectedClipId=last.c.id; selectedTrackId=last.t.id; }
    try{ pushHistory("Duplicate to track",before); }catch(e){ project.history.entries.push({label:"Duplicate to track",before:before,after:serializableProject()}); project.history.index=project.history.entries.length-1; }
    try{ scheduleAutosave(); renderAll(); }catch(e){}
    say(plan.length+" cop"+(plan.length>1?"ies":"y")+" placed "+(dir<0?"above":"below"));
  }
  window.amiyoDupUp=function(){ run(-1); }; window.amiyoDupDown=function(){ run(1); };
  if(window.amiyoPrAdd){ window.amiyoPrAdd("\u29C9 Copy to track above","",window.amiyoDupUp); window.amiyoPrAdd("\u29C9 Copy to track below","",window.amiyoDupDown); }
  var oc=window.commandList; if(typeof oc==="function") window.commandList=function(){ return oc.apply(this,arguments).concat([["Copy clips to the track above","amiyoDupUp()"],["Copy clips to the track below","amiyoDupDown()"]]); };
  try{ window.AMIYO_EDITOR_BUILD="pr-step23-dup-track"; }catch(e){}
})();

;
/* ==================== Script 419 id="amiyo-pr-step24-shortcuts" ==================== */
/* Premiere step 24: Premiere shortcuts in the shortcut list. Every shortcut added in the Premiere steps (8 to 23) now shows up, with a plain description, in the
   searchable Keyboard Shortcuts window, so you can type "insert" or "marker" and find it. */
(function(){
  "use strict";
  var X=window.amiyoX; if(!X||typeof X.addShortcut!=="function"){ try{ window.AMIYO_EDITOR_BUILD="pr-step24-shortcuts"; }catch(e){} return; }
  [["Ctrl+Shift+K","Premiere: cut every unlocked track at the playhead"],
   ["Alt+A / Alt+Shift+A","Premiere: select this clip and everything after / before it on all tracks"],
   ["Shift+Alt+Left / Right","Premiere: nudge the selected clips one frame (add Ctrl for 5 frames)"],
   ["Shift+Alt+Up / Down","Premiere: move the selected clips to the track above / below"],
   ["X","Premiere: set In and Out around the selected clip"],
   ["Ctrl+Shift+V","Premiere: paste insert (pushes later clips to the right)"],
   ["Alt+Shift+P","Premiere: move the selected clips to the playhead"],
   ["Alt+Shift+I","Premiere: invert the selection"],
   ["Pr tools \u2192 More","Split at markers, reverse order, shuffle, select this track, picture length, copy to track above / below"]
  ].forEach(function(s){ try{ X.addShortcut(s[0],s[1]); }catch(e){} });
  try{ window.AMIYO_EDITOR_BUILD="pr-step24-shortcuts"; }catch(e){}
})();

;
/* ==================== Script 420 id="amiyo-pr-step25-marker-cleanup" ==================== */
/* Premiere step 25: Marker clean-up. "Clear markers in In/Out" removes only the markers between your In and Out points; "Clear all markers" removes every marker (after you confirm).
   Both are undoable and sit in the Pr tools menu under "More". */
(function(){
  "use strict";
  function say(m){ try{ toast(m); }catch(e){} }
  function fin(label,before,n){
    try{ pushHistory(label,before); }catch(e){ project.history.entries.push({label:label,before:before,after:serializableProject()}); project.history.index=project.history.entries.length-1; }
    try{ scheduleAutosave(); renderAll(); }catch(e){}
    say(n+" marker"+(n>1?"s":"")+" removed");
  }
  async function ask(m){ try{ if(window.amiyoOk) return await window.amiyoOk(m,{okLabel:"Remove",danger:true}); }catch(e){ return false; } return confirm(m); }
  async function clearAll(){
    var n=(project.markers||[]).length; if(!n){ say("There are no markers"); return; }
    if(!await ask("Remove all "+n+" marker"+(n>1?"s":"")+"? You can undo this.")) return;
    var before=deepClone(serializableProject()); project.markers=[]; fin("Clear all markers",before,n);
  }
  async function clearRange(){
    var io=window.amiyoGetIO?window.amiyoGetIO():{}; if(!io||io.i==null||io.o==null||io.o<=io.i){ say("Set an In and an Out point first"); return; }
    var hit=(project.markers||[]).filter(function(m){ return m.time>=io.i&&m.time<=io.o; }); if(!hit.length){ say("No markers between In and Out"); return; }
    if(!await ask("Remove "+hit.length+" marker"+(hit.length>1?"s":"")+" between In and Out? You can undo this.")) return;
    var before=deepClone(serializableProject()); project.markers=project.markers.filter(function(m){ return !(m.time>=io.i&&m.time<=io.o); }); fin("Clear markers in range",before,hit.length);
  }
  window.amiyoClearMarkers=clearAll; window.amiyoClearMarkersRange=clearRange;
  if(window.amiyoPrAdd){ window.amiyoPrAdd("\u25C7 Clear markers in In/Out","",clearRange); window.amiyoPrAdd("\u25C7 Clear all markers","",clearAll); }
  var oc=window.commandList; if(typeof oc==="function") window.commandList=function(){ return oc.apply(this,arguments).concat([["Clear all markers","amiyoClearMarkers()"],["Clear markers between In and Out","amiyoClearMarkersRange()"]]); };
  try{ window.AMIYO_EDITOR_BUILD="pr-step25-marker-cleanup"; }catch(e){}
})();

;
/* ==================== Script 421 id="amiyo-pr-step26-health-check" ==================== */
/* Premiere step 26: Project health check. Looks for clips that start before 0, clips with no length, clips whose media is missing from the project, and clips that overlap
   another clip on the same track. Shows the counts; "Select problem clips" selects them so you can look, and "Remove broken clips" deletes the empty and missing-media ones
   (after you confirm, with undo). Nothing changes unless you tap a button. In Pr tools \u2192 More. */
(function(){
  "use strict";
  var $=function(id){ return document.getElementById(id); };
  var sheet=null;
  function say(m){ try{ toast(m); }catch(e){} }
  function scan(){
    var r={neg:[],empty:[],missing:[],over:[]};
    project.tracks.forEach(function(tr){
      var cl=tr.clips.slice().sort(function(a,b){ return a.start-b.start; });
      cl.forEach(function(c,i){
        var rec={t:tr,c:c};
        if(c.start<-.001) r.neg.push(rec);
        if(!(c.duration>.001)) r.empty.push(rec);
        if(c.assetId&&!(project.assets&&project.assets[c.assetId])) r.missing.push(rec);
        var n=cl[i+1]; if(n&&n.start<c.start+c.duration-.01&&c.kind!=="adjustment"&&n.kind!=="adjustment"){ r.over.push(rec); r.over.push({t:tr,c:n}); }
      });
    });
    return r;
  }
  function uniq(L){ var s={},o=[]; L.forEach(function(x){ if(!s[x.c.id]){ s[x.c.id]=1; o.push(x); } }); return o; }
  function css(){
    var s=document.createElement("style"); s.id="pr26-css";
    s.textContent="#prHealthSheet{position:fixed;inset:0;z-index:318;display:none;flex-direction:column;justify-content:flex-end;background:rgba(6,5,4,.6)}"+
    "#prHealthSheet .box{background:#14120f;border-top:1px solid #302c26;border-radius:16px 16px 0 0;padding:14px 14px calc(14px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:10px;max-height:80vh;overflow:auto}"+
    "#prHealthSheet h4{margin:0;font:700 15px system-ui;color:#ffb454}#prHealthSheet p{margin:0;font-size:13px;line-height:1.55;color:#c9c0ad}#prHealthSheet .ok{color:#7ddc8f}"+
    "#prHealthSheet button{min-height:46px;border-radius:11px;border:1px solid #302c26;background:#211f1b;color:#f1ece2;font-size:13.5px;padding:6px 12px}#prHealthSheet button:active{background:#33291a}";
    document.head.appendChild(s);
  }
  function paint(){
    var r=scan(), box=$("prHealthBody"), tot=r.neg.length+r.empty.length+r.missing.length+uniq(r.over).length;
    var rows=[["Start before time 0",r.neg.length],["No length",r.empty.length],["Media missing from the project",r.missing.length],["Overlapping another clip",uniq(r.over).length]];
    box.innerHTML=(tot?'':'<p class="ok">\u2713 No problems found.</p>')+rows.map(function(x){ return '<p>'+(x[1]?'\u26A0 ':'\u2713 ')+x[0]+': <b>'+x[1]+'</b></p>'; }).join("")+
      (tot?'<button type="button" data-a="sel">Select problem clips</button>':'')+((r.empty.length+r.missing.length)?'<button type="button" data-a="rm">Remove broken clips ('+uniq(r.empty.concat(r.missing)).length+')</button>':'');
  }
  function selectBad(){
    var r=scan(), L=uniq(r.neg.concat(r.empty,r.missing,r.over)); if(!L.length) return;
    try{ clearMultiSelection(); }catch(e){} L.forEach(function(x){ x.c.selected=true; }); selectedClipId=L[0].c.id; selectedTrackId=L[0].t.id;
    try{ setCurrentTime(Math.max(0,L[0].c.start)); }catch(e){} try{ renderAll(); }catch(e){}
    say(L.length+" clip"+(L.length>1?"s":"")+" selected"); close();
  }
  async function removeBad(){
    var r=scan(), L=uniq(r.empty.concat(r.missing)); if(!L.length) return;
    var m="Delete "+L.length+" broken clip"+(L.length>1?"s":"")+" (no length or missing media)? You can undo this.", ok=true;
    try{ if(window.amiyoOk) ok=await window.amiyoOk(m,{okLabel:"Delete",danger:true}); else ok=confirm(m); }catch(e){ ok=false; }
    if(!ok) return;
    var ids={}; L.forEach(function(x){ ids[x.c.id]=1; }); var before=deepClone(serializableProject());
    project.tracks.forEach(function(tr){ tr.clips=tr.clips.filter(function(c){ return !ids[c.id]; }); });
    if(ids[selectedClipId]) selectedClipId=null;
    try{ pushHistory("Remove broken clips",before); }catch(e){ project.history.entries.push({label:"Remove broken clips",before:before,after:serializableProject()}); project.history.index=project.history.entries.length-1; }
    try{ scheduleAutosave(); renderAll(); }catch(e){} say(L.length+" broken clip"+(L.length>1?"s":"")+" removed"); paint();
  }
  function ui(){
    css(); sheet=document.createElement("div"); sheet.id="prHealthSheet"; sheet.setAttribute("role","dialog"); sheet.setAttribute("aria-label","Project health check");
    sheet.innerHTML='<div class="box"><div style="display:flex;justify-content:space-between;align-items:center"><h4>\uD83E\uDE7A Health check</h4><button type="button" id="prHealthX" style="min-width:70px">Close</button></div><div id="prHealthBody" style="display:flex;flex-direction:column;gap:8px"></div></div>';
    document.body.appendChild(sheet); $("prHealthX").onclick=close;
    sheet.addEventListener("click",function(e){ if(e.target===sheet){ close(); return; } var b=e.target.closest&&e.target.closest("button[data-a]"); if(!b) return; if(b.getAttribute("data-a")==="sel") selectBad(); else removeBad(); });
  }
  function open(){ if(!sheet) ui(); paint(); sheet.style.display="flex"; }
  function close(){ if(sheet) sheet.style.display="none"; }
  window.amiyoHealthCheck={open:open,scan:scan};
  if(window.amiyoPrAdd) window.amiyoPrAdd("\uD83E\uDE7A Health check","",open);
  var oc=window.commandList; if(typeof oc==="function") window.commandList=function(){ return oc.apply(this,arguments).concat([["Project health check","amiyoHealthCheck.open()"]]); };
  try{ window.AMIYO_EDITOR_BUILD="pr-step26-health-check"; }catch(e){}
})();

;
/* ==================== Script 422 id="amiyo-pr-step27-clip-labels" ==================== */
/* Premiere step 27: Clip labels. Colour-tag clips (8 label colours like Premiere) and select every clip with the same label.
   Also adds a small shared toolkit (window.amiyoKit) that the next steps use for sheets and undo. Open it from Pr tools: Clip labels. */
(function(){
  "use strict";
  var COLORS=[["Violet","#fab08b"],["Iris","#f29262"],["Cerulean","#f87838"],["Forest","#34d399"],["Rose","#fb7185"],["Mango","#fb923c"],["Lavender","#d8b4fe"],["Yellow","#facc15"]];
  var kit=window.amiyoKit=window.amiyoKit||{};
  kit.say=function(m){ try{ toast(m); }catch(e){} };
  kit.sel=function(){ var L=[]; try{ L=selectedClips(); }catch(e){} return L; };
  kit.edit=function(label,fn){
    var before=deepClone(serializableProject()), r=fn();
    if(r===false) return false;
    try{ pushHistory(label,before); }catch(e){ project.history.entries.push({label:label,before:before,after:serializableProject()}); project.history.index=project.history.entries.length-1; }
    try{ scheduleAutosave(); renderAll(); }catch(e){}
    return true;
  };
  kit.all=function(){ var o=[]; (project.tracks||[]).forEach(function(t){ (t.clips||[]).forEach(function(c){ o.push({track:t,clip:c}); }); }); return o; };
  kit.esc=function(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); };
  var cssDone=false;
  function css(){
    if(cssDone) return; cssDone=true; var st=document.createElement("style"); st.id="amiyoKitCss";
    st.textContent=".akSheet{position:fixed;inset:0;z-index:330;display:none;flex-direction:column;justify-content:flex-end;background:rgba(6,5,4,.6)}"+
    ".akSheet .box{background:#14120f;border-top:1px solid #302c26;border-radius:16px 16px 0 0;padding:14px 14px calc(14px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:8px;max-height:84vh;overflow:auto;color:#f1ece2;font:13px system-ui}"+
    ".akSheet h4{margin:0;font:700 15px system-ui;color:#ffb454}.akSheet h5{margin:6px 0 0;font:700 11px system-ui;letter-spacing:.06em;text-transform:uppercase;color:#8f8777}"+
    ".akSheet button{min-height:44px;border-radius:11px;border:1px solid #302c26;background:#211f1b;color:#f1ece2;font-size:12.5px;padding:5px 10px}.akSheet button:active{background:#33291a}"+
    ".akSheet .g{display:grid;grid-template-columns:1fr 1fr;gap:7px}.akSheet input,.akSheet select{min-height:40px;border-radius:9px;border:1px solid #302c26;background:#1b1915;color:#f1ece2;padding:4px 8px;font-size:13px;width:100%;box-sizing:border-box}"+
    ".akSheet label{display:flex;flex-direction:column;gap:3px;font-size:11px;color:#8f8777}.akSheet .note{font-size:11px;color:#8f8777}";
    document.head.appendChild(st);
  }
  var sheets={};
  kit.sheet=function(id,title,render,act){
    css(); var s=sheets[id];
    if(!s){
      var el=document.createElement("div"); el.className="akSheet"; el.id=id; el.setAttribute("role","dialog"); el.setAttribute("aria-label",title);
      el.innerHTML='<div class="box"><div style="display:flex;justify-content:space-between;align-items:center"><h4>'+title+'</h4><button type="button" data-x="1" style="min-width:70px">Close</button></div><div class="body" style="display:flex;flex-direction:column;gap:8px"></div></div>';
      document.body.appendChild(el);
      var api={el:el,body:el.querySelector(".body"),paint:function(){ api.body.innerHTML=render(); },open:function(){ api.paint(); el.style.display="flex"; },close:function(){ el.style.display="none"; }};
      el.addEventListener("click",function(e){
        if(e.target===el||(e.target.getAttribute&&e.target.getAttribute("data-x"))){ api.close(); return; }
        var b=e.target.closest&&e.target.closest("[data-k]"); if(b&&act) act(b.getAttribute("data-k"),b,api);
      });
      s=sheets[id]=api;
    }
    return s;
  };
  kit.menu=function(label,fn,cmdName,cmdCall){
    if(window.amiyoPrAdd) window.amiyoPrAdd(label,"",fn);
    if(cmdName){ var oc=window.commandList; if(typeof oc==="function"&&!oc.__k||true){ var prev=window.commandList; if(typeof prev==="function") window.commandList=function(){ return prev.apply(this,arguments).concat([[cmdName,cmdCall]]); }; } }
  };
  /* ---- labels ---- */
  function paint(){
    try{
      var els=document.querySelectorAll("#tracks .clip[data-clip]"); if(!els.length) return;
      var map={}; (project.tracks||[]).forEach(function(t){ (t.clips||[]).forEach(function(c){ if(c.labelColor) map[c.id]=c.labelColor; }); });
      for(var i=0;i<els.length;i++){ var col=map[els[i].getAttribute("data-clip")]; var want=col?"inset 0 -5px 0 0 "+col:""; if(els[i].style.boxShadow!==want&&(want||els[i].style.boxShadow)) els[i].style.boxShadow=want; }
    }catch(e){}
  }
  var rt=window.renderTimeline;
  if(typeof rt==="function"&&!rt.__s27){ window.renderTimeline=function(){ var r=rt.apply(this,arguments); paint(); return r; }; window.renderTimeline.__s27=true; }
  var sh=kit.sheet("akLabels","\uD83C\uDFF7 Clip labels",function(){
    var n=kit.sel().length;
    return '<div class="note">'+(n?n+" clip"+(n>1?"s":"")+" selected. Tap a colour to label them.":"Select clips first to label them. You can still select by label below.")+'</div>'+
    '<h5>Set label</h5><div class="g">'+COLORS.map(function(c){ return '<button type="button" data-k="set:'+c[1]+'"><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:'+c[1]+';margin-right:7px;vertical-align:-1px"></span>'+c[0]+'</button>'; }).join("")+'<button type="button" data-k="set:">No label</button></div>'+
    '<h5>Select all with label</h5><div class="g">'+COLORS.map(function(c){ var k=kit.all().filter(function(x){ return x.clip.labelColor===c[1]; }).length; return '<button type="button" data-k="pick:'+c[1]+'" '+(k?'':'style="opacity:.45"')+'>'+c[0]+' ('+k+')</button>'; }).join("")+'</div>';
  },function(k,b,api){
    var p=k.split(":"), col=p.slice(1).join(":");
    if(p[0]==="set"){
      var L=kit.sel(); if(!L.length){ kit.say("Select a clip first"); return; }
      kit.edit("Clip label",function(){ L.forEach(function(x){ if(col) x.clip.labelColor=col; else delete x.clip.labelColor; }); });
      kit.say(col?"Label set":"Label removed"); api.paint();
    } else {
      var hit=kit.all().filter(function(x){ return x.clip.labelColor===col; });
      if(!hit.length){ kit.say("No clips have that label"); return; }
      try{ clearMultiSelection(); }catch(e){}
      hit.forEach(function(x){ x.clip.selected=true; }); selectedClipId=hit[0].clip.id; selectedTrackId=hit[0].track.id;
      try{ renderAll(); }catch(e){} kit.say(hit.length+" clip"+(hit.length>1?"s":"")+" selected"); api.close();
    }
  });
  window.amiyoLabels={open:sh.open};
  kit.menu("\uD83C\uDFF7 Clip labels",sh.open,"Clip labels","amiyoLabels.open()");
  setTimeout(paint,800);
  try{ window.AMIYO_EDITOR_BUILD="pr-step27-clip-labels"; }catch(e){}
})();

;
/* ==================== Script 423 id="amiyo-pr-step28-select-tools" ==================== */
/* Premiere step 28: Select tools. Select all clips on this track, with the same media, of the same type, under the playhead, or invert the selection.
   Open it from Pr tools: Select tools. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function pick(list,api){
    if(!list.length){ kit.say("Nothing to select"); return; }
    try{ clearMultiSelection(); }catch(e){}
    list.forEach(function(x){ x.clip.selected=true; }); selectedClipId=list[0].clip.id; selectedTrackId=list[0].track.id;
    try{ renderAll(); }catch(e){} kit.say(list.length+" clip"+(list.length>1?"s":"")+" selected"); if(api) api.close();
  }
  var sh=kit.sheet("akSelect","\u25A3 Select tools",function(){
    return '<div class="note">Based on the clip you have selected (or the playhead).</div><div class="g">'+
    '<button type="button" data-k="track">All on this track</button><button type="button" data-k="media">Same media</button>'+
    '<button type="button" data-k="kind">Same type</button><button type="button" data-k="head">Under playhead</button>'+
    '<button type="button" data-k="invert">Invert selection</button><button type="button" data-k="none">Select none</button></div>';
  },function(k,b,api){
    var all=kit.all(), cur=kit.sel(), first=cur[0];
    if(k==="none"){ try{ clearMultiSelection(); }catch(e){} selectedClipId=null; try{ renderAll(); }catch(e){} api.close(); return; }
    if(k==="head"){ var t=currentTime; pick(all.filter(function(x){ return t>=x.clip.start-.001&&t<x.clip.start+x.clip.duration+.001; }),api); return; }
    if(k==="invert"){ var ids={}; cur.forEach(function(x){ ids[x.clip.id]=1; }); pick(all.filter(function(x){ return !ids[x.clip.id]; }),api); return; }
    if(!first){ kit.say("Select a clip first"); return; }
    if(k==="track") pick(all.filter(function(x){ return x.track.id===first.track.id; }),api);
    else if(k==="media"){ if(!first.clip.assetId){ kit.say("This clip has no media file"); return; } pick(all.filter(function(x){ return x.clip.assetId===first.clip.assetId; }),api); }
    else pick(all.filter(function(x){ return (x.clip.kind||x.track.kind)===(first.clip.kind||first.track.kind); }),api);
  });
  window.amiyoSelectTools={open:sh.open};
  kit.menu("\u25A3 Select tools",sh.open,"Select tools","amiyoSelectTools.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step28-select-tools"; }catch(e){}
})();

;
/* ==================== Script 424 id="amiyo-pr-step29-info" ==================== */
/* Premiere step 29: Info panel. Shows the selected clip (track, start, end, length, source in/out, speed, volume, effects, keyframes)
   and the whole sequence (length, tracks, clips, cuts, markers, media used). Read-only. Open it from Pr tools: Info. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function tc(t){ try{ return frameToTimecode(t); }catch(e){ return (Math.round(t*100)/100)+"s"; } }
  function row(a,b){ return '<div style="display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid #26231e;padding:5px 0"><span style="color:#8f8777">'+a+'</span><span style="text-align:right">'+b+'</span></div>'; }
  var sh=kit.sheet("akInfo","\u2139 Info",function(){
    var out="", L=kit.sel(), all=kit.all();
    if(L.length){
      var c=L[0].clip, t=L[0].track;
      out+='<h5>Clip'+(L.length>1?' (first of '+L.length+')':'')+'</h5>'+row("Name",kit.esc(c.name||c.text||c.assetId||"clip"))+row("Track",kit.esc(t.name||t.kind))+row("Start",tc(c.start))+row("End",tc(c.start+c.duration))+row("Length",tc(c.duration))+
        (c.inPoint!=null?row("Source in / out",tc(c.inPoint||0)+" / "+tc(c.outPoint==null?c.duration:c.outPoint)):"")+row("Speed",(c.speed||1)+"x")+row("Volume",Math.round((c.volume==null?1:c.volume)*100)+"%")+
        row("Effects",(c.effects||[]).length)+row("Keyframes",(c.keyframes||[]).length)+(c.labelColor?row("Label",'<span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:'+c.labelColor+'"></span>'):"");
    } else out+='<div class="note">Select a clip to see its details.</div>';
    var dur=0; try{ dur=getProjectDuration(); }catch(e){}
    var media={}; all.forEach(function(x){ if(x.clip.assetId) media[x.clip.assetId]=1; });
    out+='<h5>Sequence</h5>'+row("Length",tc(dur))+row("Tracks",(project.tracks||[]).length)+row("Clips",all.length)+row("Markers",(project.markers||[]).length)+row("Media used",Object.keys(media).length);
    (project.tracks||[]).forEach(function(t){ out+=row(kit.esc(t.name||t.kind),(t.clips||[]).length+" clip"+((t.clips||[]).length===1?"":"s")+(t.locked?" \uD83D\uDD12":"")); });
    return out;
  },function(){});
  window.amiyoInfo={open:sh.open};
  kit.menu("\u2139 Info",sh.open,"Clip and sequence info","amiyoInfo.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step29-info"; }catch(e){}
})();

;
/* ==================== Script 425 id="amiyo-pr-step30-ripple-trim" ==================== */
/* Premiere step 30: Ripple trim to playhead. Alt+Q removes everything from the clip's start up to the playhead and closes the gap;
   Alt+W removes everything from the playhead to the clip's end and closes the gap. It works on the selected clips' tracks,
   or on every unlocked track that has a clip under the playhead. Plain Q / W (no ripple) are unchanged. One undo step. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function run(mode){
    var t=currentTime, sel=kit.sel(), tracks=[], seen={};
    var cand=sel.length?sel.map(function(x){ return x.track; }):(project.tracks||[]).filter(function(x){ return !x.locked; });
    cand.forEach(function(tr){ if(!seen[tr.id]&&!tr.locked){ seen[tr.id]=1; tracks.push(tr); } });
    var jobs=[];
    tracks.forEach(function(tr){
      var c=(tr.clips||[]).filter(function(c){ return t>c.start+.03&&t<c.start+c.duration-.03; })[0];
      if(c) jobs.push([tr,c]);
    });
    if(!jobs.length){ kit.say("Put the playhead inside a clip"); return; }
    kit.edit(mode==="prev"?"Ripple trim previous":"Ripple trim next",function(){
      jobs.forEach(function(j){
        var tr=j[0], c=j[1], end=c.start+c.duration, srcDur=((c.outPoint==null?c.duration:c.outPoint)-(c.inPoint||0)), r=c.duration?srcDur/c.duration:1, cut;
        if(mode==="prev"){
          cut=t-c.start; c.inPoint=(c.inPoint||0)+cut*r; c.duration-=cut;
          tr.clips.forEach(function(o){ if(o!==c&&o.start>=end-.001) o.start-=cut; });
        } else {
          cut=end-t; c.duration-=cut; if(c.outPoint!=null) c.outPoint=(c.inPoint||0)+c.duration*r;
          tr.clips.forEach(function(o){ if(o!==c&&o.start>=end-.001) o.start-=cut; });
        }
      });
    });
    kit.say("Ripple trimmed "+jobs.length+" clip"+(jobs.length>1?"s":""));
  }
  window.amiyoRippleTrimPrev=function(){ run("prev"); }; window.amiyoRippleTrimNext=function(){ run("next"); };
  document.addEventListener("keydown",function(ev){
    if(!ev.altKey||ev.ctrlKey||ev.metaKey||ev.shiftKey) return;
    var a=document.activeElement; if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName||"")||(a&&a.isContentEditable)) return;
    if(ev.code==="KeyQ"){ ev.preventDefault(); ev.stopImmediatePropagation(); run("prev"); }
    else if(ev.code==="KeyW"){ ev.preventDefault(); ev.stopImmediatePropagation(); run("next"); }
  },true);
  kit.menu("\u21E4 Ripple trim to playhead (start)",window.amiyoRippleTrimPrev,"Ripple trim previous edit to playhead","amiyoRippleTrimPrev()");
  kit.menu("Ripple trim to playhead (end) \u21E5",window.amiyoRippleTrimNext,"Ripple trim next edit to playhead","amiyoRippleTrimNext()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step30-ripple-trim"; }catch(e){}
})();

;
/* ==================== Script 426 id="amiyo-pr-step31-new-item" ==================== */
/* Premiere step 31: New item generators. Black video, Colour matte, Colour bars and a 3-2-1 Countdown leader, placed at the playhead on a video track
   (a free one, or a new one if the others are busy). They are normal media in the bin, so every effect and transition works on them. One undo step.
   Open it from Pr tools: New item. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function svg(inner){ return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">'+inner+'</svg>'); }
  function solid(c){ return svg('<rect width="1280" height="720" fill="'+c+'"/>'); }
  function bars(){
    var cols=["#c0c0c0","#c0c000","#c04000","#00c000","#c000c0","#c00000","#c04000"], w=1280/7, s="";
    cols.forEach(function(c,i){ s+='<rect x="'+(i*w)+'" y="0" width="'+(w+1)+'" height="480" fill="'+c+'"/>'; });
    var low=["#c04000","#131313","#c000c0","#131313","#c04000","#131313","#c0c0c0"];
    low.forEach(function(c,i){ s+='<rect x="'+(i*w)+'" y="480" width="'+(w+1)+'" height="60" fill="'+c+'"/>'; });
    s+='<rect x="0" y="540" width="213" height="180" fill="#4c1900"/><rect x="213" y="540" width="213" height="180" fill="#fff"/><rect x="426" y="540" width="213" height="180" fill="#32006a"/><rect x="639" y="540" width="641" height="180" fill="#131313"/>';
    return svg(s);
  }
  function count(n){ return svg('<rect width="1280" height="720" fill="#111"/><circle cx="640" cy="360" r="250" fill="none" stroke="#555" stroke-width="6"/><line x1="0" y1="360" x2="1280" y2="360" stroke="#333" stroke-width="3"/><line x1="640" y1="0" x2="640" y2="720" stroke="#333" stroke-width="3"/><text x="640" y="470" text-anchor="middle" font-size="340" font-family="system-ui" font-weight="800" fill="#fff">'+n+'</text>'); }
  function freeTrack(s,e){
    var tr=(project.tracks||[]).filter(function(t){ return t.kind==="video"&&!t.locked&&!(t.clips||[]).some(function(c){ return s<c.start+c.duration-.001&&e>c.start+.001; }); })[0];
    if(tr) return tr;
    tr={id:uid("track"),name:"Video "+((project.tracks||[]).filter(function(t){ return t.kind==="video"&&t.sub!=="image"; }).length+1),kind:"video",locked:false,hidden:false,muted:false,clips:[]};
    project.tracks.push(tr); return tr;
  }
  function make(name,datas,dur){
    var t0=currentTime, total=dur*datas.length, tr=null, last=null;
    kit.edit("New "+name,function(){
      tr=freeTrack(t0,t0+total);
      datas.forEach(function(d,i){
        var a={id:uid("asset"),name:name+(datas.length>1?" "+(datas.length-i):"")+".svg",mime:"image/svg+xml",type:"image",width:1280,height:720,duration:dur,fileData:d};
        project.assets[a.id]=a; var c=makeClipFor(a,t0+i*dur,dur); tr.clips.push(c); last=c;
      });
      tr.clips.sort(function(a,b){ return a.start-b.start; });
      if(last){ selectedClipId=last.id; selectedTrackId=tr.id; }
    });
    kit.say(name+" added"+(datas.length>1?" ("+datas.length+" clips)":"")); 
  }
  var sh=kit.sheet("akGen","\u2795 New item",function(){
    return '<div class="note">Placed at the playhead.</div><label>Length (seconds)<input id="akGenDur" type="number" min="0.5" max="600" step="0.5" value="5"></label>'+
    '<label>Matte colour<input id="akGenCol" type="color" value="#ec5d15"></label><div class="g"><button type="button" data-k="black">Black video</button><button type="button" data-k="matte">Colour matte</button><button type="button" data-k="bars">Colour bars</button><button type="button" data-k="count">Countdown 3-2-1</button></div>';
  },function(k,b,api){
    var d=Math.max(.5,Math.min(600,parseFloat((api.body.querySelector("#akGenDur")||{}).value)||5)), col=(api.body.querySelector("#akGenCol")||{}).value||"#ec5d15";
    if(k==="black") make("Black video",[solid("#000000")],d);
    else if(k==="matte") make("Colour matte",[solid(col)],d);
    else if(k==="bars") make("Colour bars",[bars()],d);
    else make("Countdown",[count(3),count(2),count(1)],1);
    api.close();
  });
  window.amiyoNewItem={open:sh.open};
  kit.menu("\u2795 New item (black, matte, bars)",sh.open,"New item generators","amiyoNewItem.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step31-new-item"; }catch(e){}
})();

;
/* ==================== Script 427 id="amiyo-pr-step32-fit-fill" ==================== */
/* Premiere step 32: Scale to frame. Fit the whole picture inside the frame, or fill the frame (crops the edges), and re-centre it, for every selected picture clip
   (video, image). Rotation, crop and keyframes are left alone. One undo step. Open it from Pr tools: Fit / Fill frame. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function run(mode,cx){
    var L=kit.sel().filter(function(x){ return x.track.kind==="video"||x.clip.kind==="video"||x.clip.kind==="image"; });
    if(!L.length){ kit.say("Select a video or image clip"); return; }
    kit.edit(mode==="cover"?"Fill frame":"Fit to frame",function(){
      L.forEach(function(x){ var c=x.clip; c.fit=mode; c.scale=1; if(cx){ c.x=.5; c.y=.5; } });
    });
    kit.say((mode==="cover"?"Filled the frame: ":"Fitted to frame: ")+L.length+" clip"+(L.length>1?"s":""));
  }
  window.amiyoFitFrame=function(){ run("contain",true); }; window.amiyoFillFrame=function(){ run("cover",true); };
  kit.menu("\u25AD Fit to frame",window.amiyoFitFrame,"Fit clips to frame","amiyoFitFrame()");
  kit.menu("\u25A3 Fill frame",window.amiyoFillFrame,"Fill the frame with clips","amiyoFillFrame()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step32-fit-fill"; }catch(e){}
})();

;
/* ==================== Script 428 id="amiyo-pr-step33-all-tracks" ==================== */
/* Premiere step 33: All-track switches. Mute / unmute every track, lock / unlock every track, hide / show every video track, in one tap.
   Each is one undo step. Open it from Pr tools: All tracks. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function set(label,field,val,only){
    var n=0;
    var ok=kit.edit(label,function(){
      (project.tracks||[]).forEach(function(t){ if(only&&t.kind!==only) return; if(!!t[field]!==val){ t[field]=val; n++; } });
      if(!n) return false;
    });
    kit.say(ok?label+": "+n+" track"+(n>1?"s":""):"Nothing to change");
  }
  var sh=kit.sheet("akTracks","\u2630 All tracks",function(){
    return '<div class="note">Changes every track at once. Undo brings them back.</div><div class="g">'+
    '<button type="button" data-k="mute">Mute all</button><button type="button" data-k="unmute">Unmute all</button>'+
    '<button type="button" data-k="lock">Lock all</button><button type="button" data-k="unlock">Unlock all</button>'+
    '<button type="button" data-k="hide">Hide all video</button><button type="button" data-k="show">Show all video</button></div>';
  },function(k,b,api){
    if(k==="mute") set("Mute all tracks","muted",true);
    else if(k==="unmute") set("Unmute all tracks","muted",false);
    else if(k==="lock") set("Lock all tracks","locked",true);
    else if(k==="unlock") set("Unlock all tracks","locked",false);
    else if(k==="hide") set("Hide all video","hidden",true,"video");
    else set("Show all video","hidden",false,"video");
    api.close();
  });
  window.amiyoAllTracks={open:sh.open};
  kit.menu("\u2630 All tracks (mute / lock / hide)",sh.open,"All-track switches","amiyoAllTracks.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step33-all-tracks"; }catch(e){}
})();

;
/* ==================== Script 429 id="amiyo-pr-step34-rename" ==================== */
/* Premiere step 34: Batch rename. Rename every selected clip at once: find and replace, add a prefix or suffix, or number them in timeline order.
   Only the clip's name on the timeline changes, never the media file. One undo step. Open it from Pr tools: Rename clips. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function val(api,id){ var e=api.body.querySelector("#"+id); return e?e.value:""; }
  var sh=kit.sheet("akRename","\u270E Rename clips",function(){
    var n=kit.sel().length;
    return '<div class="note">'+(n?n+" clip"+(n>1?"s":"")+" selected.":"Select clips first.")+'</div>'+
    '<label>Find<input id="akRnF" type="text"></label><label>Replace with<input id="akRnR" type="text"></label>'+
    '<label>Prefix<input id="akRnP" type="text"></label><label>Suffix<input id="akRnS" type="text"></label>'+
    '<label>Number them (start at, blank = no numbers)<input id="akRnN" type="number" min="0" step="1" placeholder="e.g. 1"></label>'+
    '<button type="button" data-k="go">Rename</button>';
  },function(k,b,api){
    var L=kit.sel().slice().sort(function(a,b){ return a.clip.start-b.clip.start; });
    if(!L.length){ kit.say("Select clips first"); return; }
    var f=val(api,"akRnF"), r=val(api,"akRnR"), p=val(api,"akRnP"), s=val(api,"akRnS"), nn=val(api,"akRnN"), num=nn===""?null:parseInt(nn,10);
    if(!f&&!p&&!s&&num==null){ kit.say("Type something to change"); return; }
    kit.edit("Rename clips",function(){
      L.forEach(function(x,i){
        var c=x.clip, nm=String(c.name!=null?c.name:(c.text||"Clip"));
        if(f) nm=nm.split(f).join(r);
        nm=p+nm+s; if(num!=null&&!isNaN(num)) nm+=" "+(num+i);
        c.name=nm;
      });
    });
    kit.say(L.length+" clip"+(L.length>1?"s":"")+" renamed"); api.close();
  });
  window.amiyoRename={open:sh.open};
  kit.menu("\u270E Rename clips",sh.open,"Batch rename clips","amiyoRename.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step34-rename"; }catch(e){}
})();

;
/* ==================== Script 430 id="amiyo-pr-step35-time-tools" ==================== */
/* Premiere step 35: Insert and remove time at the playhead. "Insert time" opens a gap of N seconds on every unlocked track (clips under the playhead are cut in two
   and the right half moves). "Remove time" deletes N seconds after the playhead on every unlocked track and closes the gap. Locked tracks stay as they are.
   One undo step. Open it from Pr tools: Insert / remove time. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function seg(c,a,b,keep){
    var end=c.start+c.duration, r=c.duration?(((c.outPoint==null?c.duration:c.outPoint)-(c.inPoint||0))/c.duration):1, n=keep?c:deepClone(c);
    if(!keep){ n.id=uid("clip"); n.selected=false; }
    n.inPoint=(c.inPoint||0)+(a-c.start)*r; n.start=a; n.duration=b-a; if(c.outPoint!=null) n.outPoint=n.inPoint+(b-a)*r;
    return n;
  }
  function go(mode,X){
    var t=currentTime, EPS=.001;
    kit.edit(mode==="ins"?"Insert time":"Remove time",function(){
      (project.tracks||[]).forEach(function(tr){
        if(tr.locked) return;
        var out=[];
        (tr.clips||[]).forEach(function(c){
          var s=c.start, e=s+c.duration;
          if(mode==="ins"){
            if(e<=t+EPS) out.push(c);
            else if(s>=t-EPS){ c.start=s+X; out.push(c); }
            else { var R=seg(c,t,e,false); R.start=t+X; var L=seg(c,s,t,true); out.push(L,R); }
          } else {
            var d=t+X;
            if(e<=t+EPS) out.push(c);
            else if(s>=d-EPS){ c.start=s-X; out.push(c); }
            else if(s>=t-EPS&&e<=d+EPS){ /* removed */ }
            else if(s<t&&e<=d+EPS){ out.push(seg(c,s,t,true)); }
            else if(s>=t-EPS&&e>d){ var K=seg(c,d,e,true); K.start=t; out.push(K); }
            else { var Rr=seg(c,d,e,false); Rr.start=t; out.push(seg(c,s,t,true),Rr); }
          }
        });
        out.sort(function(a,b){ return a.start-b.start; }); tr.clips=out;
      });
      if(!(project.tracks||[]).some(function(tr){ return !tr.locked; })) return false;
    });
    kit.say((mode==="ins"?"Inserted ":"Removed ")+X+" s at the playhead");
  }
  var sh=kit.sheet("akTime","\u29D6 Insert / remove time",function(){
    return '<div class="note">Works at the playhead on every unlocked track.</div><label>Seconds<input id="akTimeX" type="number" min="0.1" max="600" step="0.1" value="2"></label>'+
    '<div class="g"><button type="button" data-k="ins">Insert time</button><button type="button" data-k="rem">Remove time</button></div>';
  },function(k,b,api){
    var X=parseFloat((api.body.querySelector("#akTimeX")||{}).value); if(!(X>0)){ kit.say("Type the seconds"); return; }
    go(k,Math.min(600,X)); api.close();
  });
  window.amiyoTimeTools={open:sh.open};
  kit.menu("\u29D6 Insert / remove time",sh.open,"Insert or remove time at playhead","amiyoTimeTools.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step35-time-tools"; }catch(e){}
})();

;
/* ==================== Script 431 id="amiyo-pr-step36-align" ==================== */
/* Premiere step 36: Align and pack. For the selected clips: start them all at the playhead, line up their starts or ends, or pack them one after another
   on each track with no gap or a gap you choose. Refused (nothing changes) if a clip would land on top of one that is not selected. One undo step.
   Open it from Pr tools: Align / pack. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function plan(mode,gap){
    var L=kit.sel(); if(L.length<1) return null;
    var P=[], t=currentTime;
    var minS=Math.min.apply(null,L.map(function(x){ return x.clip.start; })), maxE=Math.max.apply(null,L.map(function(x){ return x.clip.start+x.clip.duration; }));
    if(mode==="head") L.forEach(function(x){ P.push([x,t]); });
    else if(mode==="first") L.forEach(function(x){ P.push([x,minS]); });
    else if(mode==="end") L.forEach(function(x){ P.push([x,maxE-x.clip.duration]); });
    else {
      var by={}; L.forEach(function(x){ (by[x.track.id]=by[x.track.id]||[]).push(x); });
      Object.keys(by).forEach(function(id){
        var a=by[id].sort(function(p,q){ return p.clip.start-q.clip.start; }), at=a[0].clip.start;
        a.forEach(function(x){ P.push([x,at]); at+=x.clip.duration+gap; });
      });
    }
    return P;
  }
  function valid(P){
    var moved={}, by={};
    P.forEach(function(p){ moved[p[0].clip.id]=p[1]; if(p[1]<-.0001) moved.__neg=1; });
    if(moved.__neg) return false;
    kit.all().forEach(function(x){ var s=moved[x.clip.id]!=null?moved[x.clip.id]:x.clip.start; (by[x.track.id]=by[x.track.id]||[]).push([s,s+x.clip.duration]); });
    return Object.keys(by).every(function(id){ var a=by[id].sort(function(p,q){ return p[0]-q[0]; }); for(var i=1;i<a.length;i++) if(a[i][0]<a[i-1][1]-.001) return false; return true; });
  }
  function go(mode,gap){
    var P=plan(mode,gap); if(!P){ kit.say("Select clips first"); return; }
    if(P.some(function(p){ return p[0].track.locked; })){ kit.say("A selected clip is on a locked track"); return; }
    if(!valid(P)){ kit.say("Not done: clips would overlap"); return; }
    kit.edit("Align clips",function(){ P.forEach(function(p){ p[0].clip.start=Math.max(0,p[1]); }); P.forEach(function(p){ p[0].track.clips.sort(function(a,b){ return a.start-b.start; }); }); });
    kit.say("Aligned "+P.length+" clip"+(P.length>1?"s":""));
  }
  var sh=kit.sheet("akAlign","\u21C6 Align / pack",function(){
    return '<div class="note">Uses the selected clips. Nothing moves if clips would overlap.</div><div class="g"><button type="button" data-k="head">Start at playhead</button><button type="button" data-k="first">Align starts</button><button type="button" data-k="end">Align ends</button><button type="button" data-k="pack">Pack, no gap</button></div>'+
    '<label>Pack with a gap of (seconds)<input id="akAlGap" type="number" min="0" max="60" step="0.1" value="0.5"></label><button type="button" data-k="gap">Pack with this gap</button>';
  },function(k,b,api){
    var g=parseFloat((api.body.querySelector("#akAlGap")||{}).value); if(!(g>=0)) g=0;
    go(k==="gap"?"pack":k,k==="gap"?g:0); api.close();
  });
  window.amiyoAlign={open:sh.open};
  kit.menu("\u21C6 Align / pack clips",sh.open,"Align or pack selected clips","amiyoAlign.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step36-align"; }catch(e){}
})();

;
/* ==================== Script 432 id="amiyo-pr-step37-compare" ==================== */
/* Premiere step 37: Compare view. Grabs the frame now showing in the preview as a reference, then lays it over the preview with a slider, so you can wipe between
   "before" and the live picture while you change colour or effects. Buttons: New ref (grab again), Close. Nothing is saved in the project. Open it from Pr tools: Compare view. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  var img=null, bar=null, timer=0, pos=50;
  function cv(){ return document.getElementById("previewCanvas"); }
  function place(){
    var c=cv(); if(!c||!img) return; var r=c.getBoundingClientRect();
    img.style.cssText="position:fixed;z-index:200;pointer-events:none;left:"+r.left+"px;top:"+r.top+"px;width:"+r.width+"px;height:"+r.height+"px;object-fit:fill;clip-path:inset(0 "+(100-pos)+"% 0 0);border-right:2px solid #ffb454;box-sizing:border-box";
  }
  function grab(){
    var c=cv(); if(!c){ kit.say("Preview not found"); return false; }
    try{ img.src=c.toDataURL("image/jpeg",.88); return true; }catch(e){ kit.say("Could not grab this frame"); return false; }
  }
  function close(){ if(timer){ clearInterval(timer); timer=0; } if(img){ img.remove(); img=null; } if(bar){ bar.remove(); bar=null; } }
  function open(){
    if(img){ close(); return; }
    img=document.createElement("img"); img.alt="Reference frame"; document.body.appendChild(img);
    if(!grab()){ close(); return; }
    bar=document.createElement("div"); bar.id="akCompareBar";
    bar.style.cssText="position:fixed;z-index:331;left:8px;right:8px;bottom:calc(10px + env(safe-area-inset-bottom,0px));display:flex;gap:8px;align-items:center;background:#14120f;border:1px solid #302c26;border-radius:12px;padding:8px 10px;color:#f1ece2;font:12px system-ui";
    bar.innerHTML='<span>Ref</span><input type="range" min="0" max="100" value="50" aria-label="Compare wipe" style="flex:1"><span>Live</span><button type="button" data-a="new" style="min-height:40px;border-radius:9px;border:1px solid #302c26;background:#211f1b;color:#f1ece2;padding:0 10px">New ref</button><button type="button" data-a="x" style="min-height:40px;border-radius:9px;border:1px solid #302c26;background:#211f1b;color:#f1ece2;padding:0 10px">Close</button>';
    document.body.appendChild(bar); pos=50;
    bar.querySelector("input").oninput=function(){ pos=+this.value; place(); };
    bar.addEventListener("click",function(e){ var a=e.target.getAttribute&&e.target.getAttribute("data-a"); if(a==="x") close(); else if(a==="new"){ grab(); kit.say("New reference frame"); } });
    place(); timer=setInterval(place,300); window.addEventListener("resize",place);
  }
  window.amiyoCompare={open:open,close:close};
  kit.menu("\uD83E\uDE9E Compare view (ref frame)",open,"Compare view","amiyoCompare.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step37-compare"; }catch(e){}
})();

;
/* ==================== Script 433 id="amiyo-pr-step38-automate" ==================== */
/* Premiere step 38: Automate to sequence. Tick media in the bin and place them on the timeline in one go: back to back from the playhead, or one at each marker
   (Premiere's Automate to Sequence). Stills get the length you type; video and audio keep their own length. One undo step. Open it from Pr tools: Automate to sequence. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function assets(){ var o=[]; try{ Object.keys(project.assets||{}).forEach(function(id){ var a=project.assets[id]; if(a&&(a.type==="video"||a.type==="image"||a.type==="audio")) o.push(a); }); }catch(e){} return o; }
  function trackFor(kind,s,e){
    var tr=(project.tracks||[]).filter(function(t){ return t.kind===kind&&!t.locked&&!(t.clips||[]).some(function(c){ return s<c.start+c.duration-.001&&e>c.start+.001; }); })[0];
    if(tr) return tr;
    tr={id:uid("track"),name:(kind==="audio"?"Audio ":"Video ")+((project.tracks||[]).filter(function(t){ return t.kind===kind; }).length+1),kind:kind,locked:false,hidden:false,muted:false,clips:[]};
    project.tracks.push(tr); return tr;
  }
  var sh=kit.sheet("akAuto","\u25A6 Automate to sequence",function(){
    var A=assets();
    if(!A.length) return '<div class="note">The bin is empty. Import media first.</div>';
    return '<div class="note">Tick the media to place.</div><div style="display:flex;flex-direction:column;gap:2px;max-height:34vh;overflow:auto">'+
      A.map(function(a){ return '<label style="flex-direction:row;align-items:center;gap:8px;font-size:12.5px;color:#f1ece2"><input type="checkbox" data-id="'+kit.esc(a.id)+'" style="width:auto;min-height:0">'+kit.esc(a.name||a.id)+' <span style="color:#8f8777">'+a.type+'</span></label>'; }).join("")+'</div>'+
      '<label>Still image length (seconds)<input id="akAuD" type="number" min="0.5" max="120" step="0.5" value="3"></label>'+
      '<label>Placement<select id="akAuM"><option value="seq">Back to back from the playhead</option><option value="mk">One at each marker</option></select></label>'+
      '<button type="button" data-k="go">Place on timeline</button>';
  },function(k,b,api){
    var ids=[].slice.call(api.body.querySelectorAll("input[data-id]:checked")).map(function(e){ return e.getAttribute("data-id"); });
    if(!ids.length){ kit.say("Tick some media first"); return; }
    var still=Math.max(.5,parseFloat(api.body.querySelector("#akAuD").value)||3), mode=api.body.querySelector("#akAuM").value, t=currentTime, mk=[];
    if(mode==="mk"){ mk=(project.markers||[]).filter(function(m){ return m.time>=t-.001&&!m.beat; }).map(function(m){ return m.time; }).sort(function(a,b){ return a-b; }); if(!mk.length){ kit.say("No markers after the playhead"); return; } }
    var n=0;
    kit.edit("Automate to sequence",function(){
      var at=t;
      ids.forEach(function(id,i){
        var a=project.assets[id]; if(!a) return;
        var kind=a.type==="audio"?"audio":"video", d=a.type==="image"?still:Math.max(.5,a.duration||5);
        if(mode==="mk"){ if(i>=mk.length) return; at=mk[i]; }
        var tr=trackFor(kind,at,at+d), c=makeClipFor(a,at,d); tr.clips.push(c); tr.clips.sort(function(x,y){ return x.start-y.start; }); n++;
        if(mode!=="mk") at+=d;
      });
      if(!n) return false;
    });
    kit.say(n?n+" clip"+(n>1?"s":"")+" placed":"Nothing placed"); api.close();
  });
  window.amiyoAutomate={open:sh.open};
  kit.menu("\u25A6 Automate to sequence",sh.open,"Automate to sequence","amiyoAutomate.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step38-automate"; }catch(e){}
})();

;
/* ==================== Script 434 id="amiyo-pr-step39-volume" ==================== */
/* Premiere step 39: Volume nudge. Lower or raise the selected clips' volume in decibel steps (the editor's volume tops out at 100%, so raising only works after lowering).
   Alt+[ is -1 dB, Alt+] is +1 dB. The menu also has -3 dB, set 100%, set 50% and mute. One undo step each. Open it from Pr tools: Volume. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function nudge(db){
    var L=kit.sel().filter(function(x){ return x.track.kind!=="text"&&x.clip.kind!=="text"; });
    if(!L.length){ kit.say("Select a clip first"); return; }
    var changed=0;
    kit.edit("Volume "+(db>0?"+":"")+db+" dB",function(){
      L.forEach(function(x){ var v=x.clip.volume==null?1:x.clip.volume, n=Math.max(0,Math.min(1,v*Math.pow(10,db/20))); if(Math.abs(n-v)>.0005){ x.clip.volume=Math.round(n*1000)/1000; changed++; } });
      if(!changed) return false;
    });
    kit.say(changed?"Volume "+(db>0?"+":"")+db+" dB on "+changed+" clip"+(changed>1?"s":""):"Already at the limit");
  }
  function setv(v,label){
    var L=kit.sel().filter(function(x){ return x.track.kind!=="text"&&x.clip.kind!=="text"; });
    if(!L.length){ kit.say("Select a clip first"); return; }
    kit.edit(label,function(){ L.forEach(function(x){ x.clip.volume=v; }); }); kit.say(label);
  }
  window.amiyoVolDown=function(){ nudge(-1); }; window.amiyoVolUp=function(){ nudge(1); };
  document.addEventListener("keydown",function(ev){
    if(!ev.altKey||ev.ctrlKey||ev.metaKey||ev.shiftKey) return;
    var a=document.activeElement; if(a&&(/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName||"")||a.isContentEditable)) return;
    if(ev.code==="BracketLeft"){ ev.preventDefault(); nudge(-1); } else if(ev.code==="BracketRight"){ ev.preventDefault(); nudge(1); }
  },true);
  var sh=kit.sheet("akVol","\uD83D\uDD0A Volume",function(){
    return '<div class="note">Applies to the selected clips. Volume cannot go above 100%.</div><div class="g"><button type="button" data-k="d1">-1 dB (Alt+[)</button><button type="button" data-k="u1">+1 dB (Alt+])</button><button type="button" data-k="d3">-3 dB</button><button type="button" data-k="u3">+3 dB</button><button type="button" data-k="full">Set 100%</button><button type="button" data-k="half">Set 50%</button><button type="button" data-k="mute">Mute clip</button></div>';
  },function(k,b,api){
    if(k==="d1") nudge(-1); else if(k==="u1") nudge(1); else if(k==="d3") nudge(-3); else if(k==="u3") nudge(3);
    else if(k==="full") setv(1,"Volume 100%"); else if(k==="half") setv(.5,"Volume 50%"); else setv(0,"Mute clip");
    api.close();
  });
  window.amiyoVolume={open:sh.open};
  kit.menu("\uD83D\uDD0A Volume nudge",sh.open,"Volume nudge","amiyoVolume.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step39-volume"; }catch(e){}
})();

;
/* ==================== Script 435 id="amiyo-pr-step40-cut-transitions" ==================== */
/* Premiere step 40: Default transition on cuts. Puts a transition (Fade, Wipe or Zoom) on every cut between touching clips on the video tracks, or only on the selected clips' cuts.
   The length is capped at half of the shorter clip. "Clear" removes the incoming transition from the same cuts. One undo step. Open it from Pr tools: Transition on all cuts. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function cuts(onlySel){
    var ids={}; if(onlySel) kit.sel().forEach(function(x){ ids[x.clip.id]=1; });
    var out=[];
    (project.tracks||[]).forEach(function(tr){
      if(tr.kind!=="video"||tr.locked) return;
      var a=(tr.clips||[]).slice().sort(function(p,q){ return p.start-q.start; });
      for(var i=1;i<a.length;i++){
        var p=a[i-1], n=a[i];
        if(Math.abs(n.start-(p.start+p.duration))<=.05&&(!onlySel||ids[n.id]||ids[p.id])) out.push([p,n]);
      }
    });
    return out;
  }
  function go(name,dur,onlySel,clear){
    var C=cuts(onlySel); if(!C.length){ kit.say(onlySel?"No cuts at the selected clips":"No touching clips found"); return; }
    kit.edit(clear?"Clear transitions on cuts":"Transition on cuts",function(){
      C.forEach(function(c){ if(clear) c[1].transitionIn=null; else c[1].transitionIn={name:name,duration:Math.max(.1,Math.min(dur,Math.min(c[0].duration,c[1].duration)/2))}; });
    });
    kit.say((clear?"Cleared ":"Added to ")+C.length+" cut"+(C.length>1?"s":""));
  }
  var sh=kit.sheet("akTrans","\u29C9 Transition on cuts",function(){
    return '<label>Transition<select id="akTrN"><option value="fade">Fade</option><option value="wipe">Wipe</option><option value="zoom">Zoom</option></select></label>'+
    '<label>Length (seconds)<input id="akTrD" type="number" min="0.1" max="5" step="0.1" value="0.5"></label>'+
    '<label>Where<select id="akTrS"><option value="all">Every cut on video tracks</option><option value="sel">Only cuts at selected clips</option></select></label>'+
    '<div class="g"><button type="button" data-k="add">Add</button><button type="button" data-k="clear">Clear</button></div>';
  },function(k,b,api){
    var q=function(id){ return api.body.querySelector("#"+id); };
    go(q("akTrN").value,parseFloat(q("akTrD").value)||.5,q("akTrS").value==="sel",k==="clear"); api.close();
  });
  window.amiyoCutTrans={open:sh.open};
  kit.menu("\u29C9 Transition on all cuts",sh.open,"Transition on all cuts","amiyoCutTrans.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step40-cut-transitions"; }catch(e){}
})();

;
/* ==================== Script 436 id="amiyo-pr-step41-paste-attributes" ==================== */
/* Premiere step 41: Paste attributes. Copy a clip's look (motion, effects, colour, keying and masks, audio, transitions), then paste only the parts you tick onto other clips
   (Premiere's Paste Attributes). Timing, speed and the media itself are never touched. The copy is kept until you close the editor. One undo step.
   Open it from Pr tools: Copy / paste attributes. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  var CATS=[
    ["motion","Motion and position",["x","y","scale","rotation","opacity","fit","crop"]],
    ["fx","Effects and looks",["effects","filter","filterAmt","look","cgLook","lut","stab","blendMode","graphicStyle"]],
    ["color","Colour",["colorWheels","lumWheels","colorPreset"]],
    ["key","Keying and masks",["chromaKey","*mask"]],
    ["audio","Audio",["volume","fadeIn","fadeOut","eqFx"]],
    ["trans","Transitions",["transitionIn","transitionOut"]]
  ];
  var clip=null, from="";
  function keysOf(c,cat){
    var out=[]; cat[2].forEach(function(k){ if(k==="*mask"){ Object.keys(c).forEach(function(x){ if(/mask/i.test(x)) out.push(x); }); } else out.push(k); }); return out;
  }
  function copy(){
    var L=kit.sel(); if(!L.length){ kit.say("Select a clip to copy from"); return; }
    clip=deepClone(L[0].clip); from=String(L[0].clip.name||L[0].clip.text||"clip"); kit.say("Attributes copied"); sh.paint();
  }
  function paste(api){
    if(!clip){ kit.say("Copy a clip first"); return; }
    var chosen=CATS.filter(function(c){ var e=api.body.querySelector('input[data-c="'+c[0]+'"]'); return e&&e.checked; });
    if(!chosen.length){ kit.say("Tick what to paste"); return; }
    var L=kit.sel().filter(function(x){ return !x.track.locked&&x.clip.id!==clip.id; });
    if(!L.length){ kit.say("Select the clips to paste onto"); return; }
    kit.edit("Paste attributes",function(){
      L.forEach(function(x){
        chosen.forEach(function(cat){
          var ks=keysOf(clip,cat); Object.keys(x.clip).forEach(function(k){ if(cat[2].indexOf("*mask")>=0&&/mask/i.test(k)&&ks.indexOf(k)<0) ks.push(k); });
          ks.forEach(function(k){
            if(clip[k]===undefined) delete x.clip[k];
            else { var v=deepClone(clip[k]); if(k==="effects"&&Array.isArray(v)) v.forEach(function(e){ if(e&&e.id) e.id=uid("fx"); }); x.clip[k]=v; }
          });
        });
      });
    });
    kit.say("Pasted onto "+L.length+" clip"+(L.length>1?"s":"")); api.close();
  }
  var sh=kit.sheet("akPaste","\u2398 Paste attributes",function(){
    return '<div class="note">'+(clip?'Copied from: '+kit.esc(from):'Nothing copied yet.')+'</div><button type="button" data-k="copy">Copy from selected clip</button>'+
    '<h5>Paste these parts</h5>'+CATS.map(function(c,i){ return '<label style="flex-direction:row;align-items:center;gap:8px;font-size:12.5px;color:#f1ece2"><input type="checkbox" data-c="'+c[0]+'" '+(i<3?'checked':'')+' style="width:auto;min-height:0">'+c[1]+'</label>'; }).join("")+
    '<button type="button" data-k="paste">Paste onto selected clips</button>';
  },function(k,b,api){
    var keep={}; CATS.forEach(function(c){ var e=api.body.querySelector('input[data-c="'+c[0]+'"]'); keep[c[0]]=e?e.checked:false; });
    if(k==="copy"){ copy(); CATS.forEach(function(c){ var e=api.body.querySelector('input[data-c="'+c[0]+'"]'); if(e) e.checked=keep[c[0]]; }); }
    else paste(api);
  });
  window.amiyoPasteAttr={open:sh.open};
  kit.menu("\u2398 Copy / paste attributes",sh.open,"Paste attributes","amiyoPasteAttr.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step41-paste-attributes"; }catch(e){}
})();

;
/* ==================== Script 437 id="amiyo-pr-step42-marker-list" ==================== */
/* Premiere step 42: Marker list. Every marker in one list: tap the time to jump there, rename it, cycle its colour, or delete it.
   "Chapters text" builds a mm:ss list (copy it into a video description). Beat markers are left out of the list. One undo step per change.
   Open it from Pr tools: Marker list. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  var COL=["#ff8040","#ffb454","#34d399","#fb7185","#fab08b","#facc15"], chap="";
  function tc(t){ var s=Math.max(0,Math.round(t)), h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60; return (h?h+":"+(m<10?"0":""):"")+m+":"+(x<10?"0":"")+x; }
  function list(){ return (project.markers||[]).filter(function(m){ return !m.beat; }).slice().sort(function(a,b){ return a.time-b.time; }); }
  var sh=kit.sheet("akMarkers","\u25C6 Marker list",function(){
    var M=list(); if(!M.length) return '<div class="note">No markers yet. Add one at the playhead with the marker button.</div>';
    return M.map(function(m){
      return '<div style="display:flex;gap:6px;align-items:center"><button type="button" data-k="go:'+m.id+'" style="min-width:64px">'+tc(m.time)+'</button>'+
      '<button type="button" data-k="col:'+m.id+'" aria-label="Change colour" style="min-width:38px"><span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:'+(m.color||"#ff8040")+'"></span></button>'+
      '<button type="button" data-k="ren:'+m.id+'" style="flex:1;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+kit.esc(m.label||"Marker")+'</button>'+
      '<button type="button" data-k="del:'+m.id+'" aria-label="Delete marker" style="min-width:42px">\u2715</button></div>';
    }).join("")+'<button type="button" data-k="chap">Chapters text (copy)</button>'+(chap?'<textarea readonly rows="6" style="width:100%;box-sizing:border-box;background:#1b1915;color:#f1ece2;border:1px solid #302c26;border-radius:9px;padding:8px;font:12px system-ui">'+kit.esc(chap)+'</textarea>':"");
  },function(k,b,api){
    var p=k.split(":"), id=p.slice(1).join(":"), m=(project.markers||[]).filter(function(x){ return x.id===id; })[0];
    if(p[0]==="chap"){
      var M=list(); chap=M.map(function(x){ return tc(x.time)+" "+(x.label||"Chapter"); }).join("\n");
      if(M.length&&M[0].time>1) chap="0:00 Start\n"+chap;
      try{ navigator.clipboard.writeText(chap); kit.say("Chapters copied"); }catch(e){ kit.say("Select the text below to copy"); }
      api.paint(); return;
    }
    if(!m) return;
    if(p[0]==="go"){ try{ setCurrentTime(m.time); }catch(e){} api.close(); }
    else if(p[0]==="col"){ kit.edit("Marker colour",function(){ var i=COL.indexOf(m.color); m.color=COL[(i+1)%COL.length]; }); api.paint(); }
    else if(p[0]==="ren"){ var v=window.prompt("Marker name",m.label||""); if(v==null) return; kit.edit("Rename marker",function(){ m.label=v.slice(0,60); }); api.paint(); }
    else if(p[0]==="del"){ kit.edit("Delete marker",function(){ project.markers=project.markers.filter(function(x){ return x.id!==id; }); }); api.paint(); }
  });
  window.amiyoMarkerList={open:sh.open};
  kit.menu("\u25C6 Marker list",sh.open,"Marker list","amiyoMarkerList.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step42-marker-list"; }catch(e){}
})();

;
/* ==================== Script 438 id="amiyo-pr-step43-keyframe-tools" ==================== */
/* Premiere step 43: Keyframe copy / paste / reverse. Copy the motion keyframes (and volume keyframes) from one clip and paste them onto other clips (they replace the target's keyframes,
   and stretch to each clip's length), or reverse the keyframes of the selected clips so the move plays backwards. One undo step.
   Open it from Pr tools: Keyframe tools. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  var buf=null;
  function nKeys(c){ return ((c.keyframes||[]).length)+((c.volumeKeyframes||[]).length); }
  var sh=kit.sheet("akKeys","\uD83D\uDD11 Keyframe tools",function(){
    var L=kit.sel(), n=L.length?nKeys(L[0].clip):0;
    return '<div class="note">'+(buf?"Copied: "+buf.k.length+" motion + "+buf.v.length+" volume keyframes. ":"Nothing copied yet. ")+(L.length?"Selected clip has "+n+" keyframes.":"Select a clip.")+'</div>'+
    '<div class="g"><button type="button" data-k="copy">Copy keyframes</button><button type="button" data-k="paste">Paste onto selected</button><button type="button" data-k="rev">Reverse keyframes</button><button type="button" data-k="clear">Clear keyframes</button></div>';
  },function(k,b,api){
    var L=kit.sel().filter(function(x){ return !x.track.locked; });
    if(k==="copy"){
      var f=kit.sel()[0]; if(!f){ kit.say("Select a clip first"); return; }
      if(!nKeys(f.clip)){ kit.say("This clip has no keyframes"); return; }
      buf={k:deepClone(f.clip.keyframes||[]),v:deepClone(f.clip.volumeKeyframes||[]),id:f.clip.id}; kit.say("Keyframes copied"); api.paint(); return;
    }
    if(!L.length){ kit.say("Select a clip first"); return; }
    if(k==="paste"){
      if(!buf){ kit.say("Copy keyframes first"); return; }
      var T=L.filter(function(x){ return x.clip.id!==buf.id; }); if(!T.length){ kit.say("Select a different clip to paste onto"); return; }
      kit.edit("Paste keyframes",function(){ T.forEach(function(x){ x.clip.keyframes=deepClone(buf.k); if(buf.v.length) x.clip.volumeKeyframes=deepClone(buf.v); }); });
      kit.say("Pasted onto "+T.length+" clip"+(T.length>1?"s":"")); api.close();
    } else if(k==="rev"){
      var R=L.filter(function(x){ return (x.clip.keyframes||[]).length>1; }); if(!R.length){ kit.say("Need a clip with 2 or more keyframes"); return; }
      kit.edit("Reverse keyframes",function(){ R.forEach(function(x){ var a=x.clip.keyframes.map(function(q){ var n=deepClone(q); if(typeof n.t==="number") n.t=Math.round((1-n.t)*10000)/10000; return n; }); a.sort(function(p,q){ return (p.t||0)-(q.t||0); }); x.clip.keyframes=a; }); });
      kit.say("Reversed "+R.length+" clip"+(R.length>1?"s":"")); api.close();
    } else {
      var C=L.filter(function(x){ return nKeys(x.clip)>0; }); if(!C.length){ kit.say("No keyframes to clear"); return; }
      kit.edit("Clear keyframes",function(){ C.forEach(function(x){ x.clip.keyframes=[]; delete x.clip.volumeKeyframes; }); });
      kit.say("Cleared"); api.close();
    }
  });
  window.amiyoKeyTools={open:sh.open};
  kit.menu("\uD83D\uDD11 Keyframe tools",sh.open,"Keyframe copy, paste, reverse","amiyoKeyTools.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step43-keyframe-tools"; }catch(e){}
})();

;
/* ==================== Script 439 id="amiyo-pr-step44-track-manager" ==================== */
/* Premiere step 44: Track manager. Add a video or audio track, rename a track, move it up or down (which changes layering), delete an empty one,
   or remove all empty tracks at once. The last track of each kind is always kept. One undo step per change. Open it from Pr tools: Track manager. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function count(kind){ return (project.tracks||[]).filter(function(t){ return t.kind===kind; }).length; }
  function find(id){ return (project.tracks||[]).filter(function(t){ return t.id===id; })[0]; }
  var sh=kit.sheet("akTrackMgr","\u2630 Track manager",function(){
    return '<div style="display:flex;gap:7px"><button type="button" data-k="addv" style="flex:1">+ Video track</button><button type="button" data-k="adda" style="flex:1">+ Audio track</button></div>'+
    (project.tracks||[]).map(function(t,i){
      return '<div style="display:flex;gap:5px;align-items:center"><button type="button" data-k="up:'+t.id+'" aria-label="Move up" style="min-width:40px">\u2191</button><button type="button" data-k="dn:'+t.id+'" aria-label="Move down" style="min-width:40px">\u2193</button>'+
      '<button type="button" data-k="ren:'+t.id+'" style="flex:1;text-align:left;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">'+kit.esc(t.name||t.kind)+' <span style="color:#8f8777">'+t.kind+' \u00B7 '+(t.clips||[]).length+'</span></button>'+
      '<button type="button" data-k="del:'+t.id+'" aria-label="Delete track" style="min-width:42px">\u2715</button></div>';
    }).join("")+'<button type="button" data-k="empty">Remove all empty tracks</button>';
  },function(k,b,api){
    var p=k.split(":"), id=p.slice(1).join(":"), T=project.tracks||[], t=find(id), i=T.indexOf(t);
    if(k==="addv"||k==="adda"){
      var kind=k==="addv"?"video":"audio";
      kit.edit("Add track",function(){ T.push({id:uid("track"),name:(kind==="video"?"Video ":"Audio ")+(count(kind)+1),kind:kind,locked:false,hidden:false,muted:false,clips:[]}); }); api.paint(); return;
    }
    if(k==="empty"){
      var del=T.filter(function(x){ return !(x.clips||[]).length&&count(x.kind)>1; }), keepKind={};
      var gone=[]; T.forEach(function(x){ if(!(x.clips||[]).length&&(count(x.kind)-(gone.filter(function(g){ return g.kind===x.kind; }).length))>1) gone.push(x); });
      if(!gone.length){ kit.say("No empty tracks to remove"); return; }
      kit.edit("Remove empty tracks",function(){ project.tracks=T.filter(function(x){ return gone.indexOf(x)<0; }); }); kit.say(gone.length+" track"+(gone.length>1?"s":"")+" removed"); api.paint(); return;
    }
    if(!t) return;
    if(p[0]==="up"||p[0]==="dn"){
      var j=i+(p[0]==="up"?-1:1); if(j<0||j>=T.length){ kit.say("Already at the end"); return; }
      kit.edit("Move track",function(){ var x=T[i]; T[i]=T[j]; T[j]=x; }); api.paint();
    } else if(p[0]==="ren"){
      var v=window.prompt("Track name",t.name||""); if(v==null||!v.trim()) return;
      kit.edit("Rename track",function(){ t.name=v.trim().slice(0,30); }); api.paint();
    } else if(p[0]==="del"){
      if((t.clips||[]).length){ kit.say("Track has clips. Remove them first"); return; }
      if(count(t.kind)<=1){ kit.say("Keep at least one "+t.kind+" track"); return; }
      kit.edit("Delete track",function(){ project.tracks=T.filter(function(x){ return x!==t; }); }); api.paint();
    }
  });
  window.amiyoTrackMgr={open:sh.open};
  kit.menu("\u2630 Track manager",sh.open,"Track manager","amiyoTrackMgr.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step44-track-manager"; }catch(e){}
})();

;
/* ==================== Script 440 id="amiyo-pr-step45-shortcuts" ==================== */
/* Premiere step 45: Shortcut list for steps 27 to 44. The new shortcuts and tools show up in the searchable Keyboard Shortcuts window. */
(function(){
  "use strict";
  var X=window.amiyoX; if(!X||typeof X.addShortcut!=="function"){ try{ window.AMIYO_EDITOR_BUILD="pr-step45-shortcuts"; }catch(e){} return; }
  [["Alt+Q","Premiere: ripple trim the clip start up to the playhead and close the gap"],
   ["Alt+W","Premiere: ripple trim the clip end back to the playhead and close the gap"],
   ["Alt+[ / Alt+]","Premiere: volume -1 dB / +1 dB on the selected clips"],
   ["Pr tools \u2192 Clip labels","Colour-tag clips and select by label"],
   ["Pr tools \u2192 Select tools","Select all on track, same media, same type, under playhead, invert"],
   ["Pr tools \u2192 Info","Details of the selected clip and the sequence"],
   ["Pr tools \u2192 New item","Black video, colour matte, colour bars, countdown"],
   ["Pr tools \u2192 Fit / Fill frame","Scale selected clips to the frame"],
   ["Pr tools \u2192 All tracks","Mute, lock or hide every track"],
   ["Pr tools \u2192 Rename clips","Batch rename with find, prefix, suffix, numbering"],
   ["Pr tools \u2192 Insert / remove time","Open or close time at the playhead on all tracks"],
   ["Pr tools \u2192 Align / pack","Align starts or ends, pack clips with a gap"],
   ["Pr tools \u2192 Compare view","Wipe between a reference frame and the live preview"],
   ["Pr tools \u2192 Automate to sequence","Place bin media back to back or at markers"],
   ["Pr tools \u2192 Transition on all cuts","Fade, wipe or zoom on every cut"],
   ["Pr tools \u2192 Copy / paste attributes","Copy a clip's look and paste chosen parts"],
   ["Pr tools \u2192 Marker list","Jump, rename, recolour, delete markers; chapters text"],
   ["Pr tools \u2192 Keyframe tools","Copy, paste, reverse, clear keyframes"],
   ["Pr tools \u2192 Track manager","Add, rename, reorder, delete tracks"]
  ].forEach(function(s){ try{ X.addShortcut(s[0],s[1]); }catch(e){} });
  try{ window.AMIYO_EDITOR_BUILD="pr-step45-shortcuts"; }catch(e){}
})();

;
/* ==================== Script 441 id="amiyo-pr-step46-final" ==================== */
/* Premiere step 46: Final pass. (1) Escape closes any open Pr sheet and the compare view. (2) "Repair project" in Pr tools fixes what the new tools could leave behind:
   clips with a negative start, missing or non-number length, duplicate clip ids, clips out of order, and tracks missing a clip list. It reports overlaps but does not move them. One undo step. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  document.addEventListener("keydown",function(ev){
    if(ev.key!=="Escape") return;
    var open=[].slice.call(document.querySelectorAll(".akSheet")).filter(function(e){ return e.style.display==="flex"; });
    if(open.length){ open.forEach(function(e){ e.style.display="none"; }); ev.stopImmediatePropagation(); return; }
    if(window.amiyoCompare&&document.getElementById("akCompareBar")){ window.amiyoCompare.close(); }
  },true);
  function repair(){
    var fixed=0, over=0, seen={};
    var ok=kit.edit("Repair project",function(){
      (project.tracks||[]).forEach(function(t){
        if(!Array.isArray(t.clips)){ t.clips=[]; fixed++; }
        t.clips.forEach(function(c){
          if(!(typeof c.start==="number")||isNaN(c.start)||c.start<0){ c.start=0; fixed++; }
          if(!(typeof c.duration==="number")||isNaN(c.duration)||c.duration<.03){ c.duration=Math.max(.5,1); fixed++; }
          if(seen[c.id]){ c.id=uid("clip"); fixed++; } seen[c.id]=1;
        });
        var s=t.clips.slice().sort(function(a,b){ return a.start-b.start; });
        if(s.some(function(c,i){ return c!==t.clips[i]; })){ t.clips=s; fixed++; }
        for(var i=1;i<s.length;i++) if(s[i].start<s[i-1].start+s[i-1].duration-.001) over++;
      });
      if(!fixed) return false;
    });
    kit.say(ok?"Repaired "+fixed+" problem"+(fixed>1?"s":"")+(over?" ("+over+" overlaps left as they are)":""):(over?"Nothing to repair. "+over+" overlaps found, left as they are":"Project looks healthy"));
  }
  window.amiyoRepair=repair;
  kit.menu("\uD83D\uDEE0 Repair project",repair,"Repair project","amiyoRepair()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step46-final"; }catch(e){}
})();

;
/* ==================== Script 442 id="amiyo-pr-step48-label-speed" ==================== */
/* Step 47: Compatibility fix. Several editor helpers (selectedClips, clearMultiSelection, makeClipFor, pushHistory) live inside the editor's own closures, so the Premiere tools
   (steps 23 and 27-46) could not see them and stopped with "Select a clip first" or did nothing. This step puts safe copies on window, only where the name is not already visible.
   Nothing that already works is replaced. */
(function(){
  "use strict";
  function missing(n){ try{ return (0,eval)("typeof "+n)==="undefined"; }catch(e){ return true; } }
  function def(n,f){ if(missing(n)){ try{ window[n]=f; }catch(e){} } }
  def("selectedClips",function(){
    var out=[]; (project.tracks||[]).forEach(function(t){ (t.clips||[]).forEach(function(c){ if(c.id===selectedClipId||c.selected) out.push({track:t,clip:c}); }); }); return out;
  });
  def("clearMultiSelection",function(){ (project.tracks||[]).forEach(function(t){ (t.clips||[]).forEach(function(c){ c.selected=false; }); }); });
  def("makeClipFor",function(a,start,duration){
    return {id:uid("clip"),assetId:a.id,start:start,duration:duration,inPoint:0,outPoint:duration,volume:1,opacity:1,speed:1,rotation:0,scale:1,x:.5,y:.5,trimL:0,trimR:0,fit:"contain",effects:[],keyframes:[],transitionIn:null,transitionOut:null};
  });
  def("pushHistory",function(label,before){
    var h=project.history; h.entries=h.entries.slice(0,h.index+1); h.entries.push({label:label,before:before,after:serializableProject()}); h.index=h.entries.length-1;
  });
  try{ window.AMIYO_EDITOR_BUILD="pr-step48-label-speed"; }catch(e){}
})();

;
/* ==================== Script 443 id="amiyo-pr-step50-guides" ==================== */
/* PR Step 2: monitor guides (Premiere "Safe Margins" + overlays). Button cycles Off > Safe margins > Thirds > Safe+Thirds > Center cross.
   Action-safe 90%, title-safe 80%. Overlay never blocks touches and is never rendered into exports. */
(function(){
  if(window.__prStep50) return; window.__prStep50=1;
  var cv=document.getElementById("previewCanvas"); if(!cv) return;
  var modes=["off","safe","thirds","safe+thirds","center"], names={off:"Guides off",safe:"Safe margins",thirds:"Rule of thirds","safe+thirds":"Safe margins + thirds",center:"Center cross"};
  var mode="off"; try{ mode=localStorage.getItem("amiyo.pr.guides")||"off"; }catch(e){} if(modes.indexOf(mode)<0) mode="off";
  var ov=document.createElement("div"); ov.id="prGuides"; ov.style.cssText="position:fixed;pointer-events:none;z-index:8;display:none";
  document.body.appendChild(ov);
  function rect(x,y,w,h,c,dash){ return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="none" stroke="'+c+'" stroke-width="1.2" vector-effect="non-scaling-stroke"'+(dash?' stroke-dasharray="5 4"':'')+'/>'; }
  function line(x1,y1,x2,y2,c){ return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+c+'" stroke-width="1" vector-effect="non-scaling-stroke"/>'; }
  /* hide the overlay while a sheet, menu or dialog covers the preview */
  function clear(r){ var st=cv.closest(".preview-stage")||cv.parentNode, x=r.left+r.width/2, y=r.top+r.height/2; if(x<0||y<0||x>innerWidth||y>innerHeight) return false; var el=document.elementFromPoint(x,y); return !!el&&st.contains(el); }
  function scopesOpen(){ var p=document.getElementById("scopesPanel"); return !!p&&p.style.display!=="none"&&p.offsetParent!==null; }   /* the scopes panel and guide lines would fight over the same pixels */
  function draw(){
    var r=cv.getBoundingClientRect();
    if(mode==="off"||r.width<20||r.height<20||cv.offsetParent===null||!clear(r)||scopesOpen()){ ov.style.display="none"; return; }
    ov.style.display="block"; ov.style.left=r.left+"px"; ov.style.top=r.top+"px"; ov.style.width=r.width+"px"; ov.style.height=r.height+"px";
    var s="", g="rgba(255,255,255,.75)", a="rgba(255,190,60,.9)";
    if(mode.indexOf("safe")>=0){ s+=rect(5,5,90,90,a,0)+rect(10,10,80,80,g,1); }
    if(mode.indexOf("thirds")>=0){ s+=line(33.333,0,33.333,100,g)+line(66.667,0,66.667,100,g)+line(0,33.333,100,33.333,g)+line(0,66.667,100,66.667,g); }
    if(mode==="center"){ s+=line(50,0,50,100,g)+line(0,50,100,50,g)+rect(45,45,10,10,g,0); }
    var key=ov.getAttribute("data-k"), k=mode+"|"+r.width+"|"+r.height;
    if(key!==k){ ov.setAttribute("data-k",k); ov.innerHTML='<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:100%;display:block">'+s+'</svg>'; }
  }
  window.prSetGuides=function(m){ mode=m; try{ localStorage.setItem("amiyo.pr.guides",m); }catch(e){} ov.removeAttribute("data-k"); draw(); sync(); };
  var btn;
  function sync(){ if(btn){ btn.textContent=mode==="off"?"Guides":"Guides ✓"; btn.title=names[mode]+" — tap to change"; } }
  function add(){
    var ref=document.getElementById("gridBtn"); if(!ref||!ref.parentNode) return false;
    if(document.getElementById("prGuidesBtn")) return true;
    btn=ref.cloneNode(false); btn.id="prGuidesBtn";
    btn.onclick=function(e){ e.stopPropagation(); var m=modes[(modes.indexOf(mode)+1)%modes.length]; window.prSetGuides(m); toast(names[m]); };
    ref.parentNode.insertBefore(btn,ref.nextSibling); sync(); return true;
  }
  var n=0, iv=setInterval(function(){ if(add()||++n>40) clearInterval(iv); },500);
  window.addEventListener("resize",draw); window.addEventListener("scroll",draw,true);
  try{ new ResizeObserver(draw).observe(cv); }catch(e){}
  setInterval(draw,700); draw();
  try{ window.AMIYO_EDITOR_BUILD="pr-step50-guides"; }catch(e){}
})();

;
/* ==================== Script 444 id="amiyo-pr-step51-meters" ==================== */
/* PR Step 3: always-visible master level meter (Premiere "Audio Meters"). Stereo L/R bars on the right edge of the preview, -60..0 dBFS,
   peak-hold ticks, red clip lamp (tap the meter to reset). Listens to every playing audio clip; adds no sound and does not change exports. */
(function(){
  if(window.__prStep51) return; window.__prStep51=1;
  var cv=document.getElementById("previewCanvas"); if(!cv) return;
  var ctx=null, mix=null, sp=null, an=[null,null], buf=[null,null], seen=new WeakSet(), lv=[0,0], pk=[0,0], pkAt=[0,0], clip=[0,0], raf=0;
  var box=document.createElement("div"); box.id="prMeter"; box.title="Master level (tap to reset peaks)";
  box.style.cssText="position:fixed;z-index:8;display:none;width:22px;pointer-events:auto;touch-action:manipulation;background:rgba(8,10,14,.72);border-radius:6px;padding:3px";
  var c=document.createElement("canvas"); c.width=44; c.height=240; c.style.cssText="width:100%;height:100%;display:block"; box.appendChild(c); document.body.appendChild(box);
  var g2=c.getContext("2d");
  box.addEventListener("click",function(e){ e.stopPropagation(); clip=[0,0]; pk=[0,0]; draw(); });
  function db(v){ return v>1e-5?20*Math.log10(v):-120; }
  function pos(d,h){ return h-Math.max(0,Math.min(1,(d+60)/60))*h; }
  function init(){
    if(mix||typeof audioContext==="undefined"||!audioContext) return !!mix;
    ctx=audioContext; mix=ctx.createGain(); mix.channelCount=2; mix.channelCountMode="explicit"; mix.channelInterpretation="speakers"; sp=ctx.createChannelSplitter(2);
    mix.connect(sp);
    for(var i=0;i<2;i++){ an[i]=ctx.createAnalyser(); an[i].fftSize=1024; an[i].smoothingTimeConstant=0; buf[i]=new Float32Array(1024); sp.connect(an[i],i);
      var z=ctx.createGain(); z.gain.value=0; an[i].connect(z); z.connect(ctx.destination); }
    return true;
  }
  function scan(){
    if(!init()) return;
    try{ audioNodes.forEach(function(src){ try{ src.connect(mix); }catch(e){} }); }catch(e){}   /* connect() is idempotent, so re-asserting every pass also survives mixer chain rebuilds */
    try{ if(window.__amiyoLiveSrc) window.__amiyoLiveSrc.forEach(function(src){ try{ src.connect(mix); }catch(e){} }); }catch(e){}   /* step 124-07: sound of clips on the video track */
  }
  /* hide the meter while a sheet, menu or dialog covers the preview */
  function clear(r){ var st=cv.closest(".preview-stage")||cv.parentNode, x=r.left+r.width/2, y=r.top+r.height/2; if(x<0||y<0||x>innerWidth||y>innerHeight) return false; var el=document.elementFromPoint(x,y); return !!el&&st.contains(el); }
  function scopesOver(r){ var p=document.getElementById("scopesPanel"); if(!p||p.style.display==="none"||p.offsetParent===null) return false; var q=p.getBoundingClientRect(); return q.right>r.right-30&&q.left<r.right&&q.bottom>r.top&&q.top<r.bottom; }
  function place(){
    var r=cv.getBoundingClientRect();
    if(r.width<20||cv.offsetParent===null||!clear(r)||scopesOver(r)){ box.style.display="none"; return; }
    box.style.display="block"; box.style.left=(r.right-26)+"px"; box.style.top=(r.top+6)+"px"; box.style.height=Math.max(60,r.height-12)+"px";
  }
  function draw(){
    var W=c.width,H=c.height; g2.clearRect(0,0,W,H);
    var bw=14, gap=4, x0=4, i, now=performance.now();
    for(i=0;i<2;i++){
      var x=x0+i*(bw+gap), h=pos(db(lv[i]),H);
      var grd=g2.createLinearGradient(0,H,0,0); grd.addColorStop(0,"#2fd46b"); grd.addColorStop(.7,"#2fd46b"); grd.addColorStop(.85,"#f5c542"); grd.addColorStop(1,"#ff4040");
      g2.fillStyle="rgba(255,255,255,.08)"; g2.fillRect(x,0,bw,H);
      g2.fillStyle=grd; g2.fillRect(x,h,bw,H-h);
      var ph=pos(db(pk[i]),H); g2.fillStyle="#fff"; g2.fillRect(x,Math.max(0,ph-1),bw,2);
      g2.fillStyle=clip[i]?"#ff2d2d":"rgba(255,255,255,.12)"; g2.fillRect(x,0,bw,6);
    }
    g2.fillStyle="rgba(255,255,255,.55)"; g2.font="9px sans-serif"; g2.textAlign="center";
    [-6,-18,-30,-48].forEach(function(d){ var y=pos(d,H); g2.fillRect(0,y,3,1); g2.fillRect(W-3,y,3,1); });
  }
  function level(a,b){ an[a].getFloatTimeDomainData(b); var m=0; for(var i=0;i<b.length;i++){ var v=Math.abs(b[i]); if(v>m)m=v; } return m; }
  var fr=0, silentDrawn=false;
  function tick(){
    raf=0; if(++fr%20===0) scan();
    var quiet=true;
    if(mix){
      var now=performance.now(), idle=true;
      for(var i=0;i<2;i++){
        var m=level(i,buf[i]); lv[i]=m>lv[i]?m:lv[i]*.86; if(lv[i]<1e-4) lv[i]=0; else idle=false;
        if(m>=pk[i]){ pk[i]=m; pkAt[i]=now; } else if(now-pkAt[i]>1500){ pk[i]*=.94; if(pk[i]<1e-4) pk[i]=0; }
        if(m>=.995) clip[i]=1;
      }
      quiet=idle&&pk[0]===0&&pk[1]===0;
      if(!(quiet&&silentDrawn)){ draw(); silentDrawn=quiet; }   /* step 60: no redraw of an unchanged silent meter */
    }
    if(isPlaying||!quiet) raf=requestAnimationFrame(tick); else setTimeout(function(){ raf=requestAnimationFrame(tick); },200);
  }
  setInterval(function(){ scan(); place(); },500);
  window.addEventListener("resize",place); try{ new ResizeObserver(place).observe(cv); }catch(e){}
  window.prMeterLevel=function(){ return {l:lv[0],r:lv[1],peakL:pk[0],peakR:pk[1],hooked:!!mix}; };
  draw(); place(); raf=requestAnimationFrame(tick);
  try{ window.AMIYO_EDITOR_BUILD="pr-step51-meters"; }catch(e){}
})();

;
/* ==================== Script 445 id="amiyo-pr-step53-histogram" ==================== */
/* PR Step 5: Histogram scope. Adds a third monitor to the existing Scopes panel (Premiere "Histogram"): red, green, blue and luma
   distributions of the current frame, 0-255, with shadow/highlight clipping marks. Follows the panel's size, on/off and corner; skipped while exporting. */
(function(){
  if(window.__prStep53) return; window.__prStep53=1;
  var hc=null, hctx=null, small=null, sctx=null, last=0, lab=null, W=128, H=78;
  function ensure(){
    if(hc) return true;
    var wc=document.getElementById("waveScope"); if(!wc||!wc.parentNode||!wc.parentNode.parentNode) return false;
    var body=wc.parentNode.parentNode, box=document.createElement("div"); box.style.cssText="text-align:center";
    hc=document.createElement("canvas"); hc.id="histScope"; hc.width=192; hc.height=128; hc.style.cssText="background:#000;border-radius:4px;display:block";
    lab=document.createElement("div"); lab.textContent="Histogram"; lab.style.cssText="font-size:10px;color:var(--muted);margin-top:2px";
    box.appendChild(hc); box.appendChild(lab); body.appendChild(box); hctx=hc.getContext("2d"); return true;
  }
  function draw(){
    var panel=document.getElementById("scopesPanel");
    if(!panel||panel.style.display==="none"||window.__amiyoExporting) return;
    if(!ensure()) return;
    var wc=document.getElementById("waveScope"); if(wc) { hc.style.width=wc.style.width; hc.style.height=wc.style.height; }
    var src=document.getElementById("previewCanvas"); if(!src||!src.width) return;
    var sw=96, sh=Math.max(8,Math.round(sw*src.height/src.width));
    if(!small){ small=document.createElement("canvas"); small.width=sw; sctx=small.getContext("2d",{willReadFrequently:true}); }
    if(small.height!==sh) small.height=sh;
    var d; try{ sctx.drawImage(src,0,0,sw,sh); d=sctx.getImageData(0,0,sw,sh).data; }catch(e){ return; }
    var h=[new Uint32Array(256),new Uint32Array(256),new Uint32Array(256),new Uint32Array(256)], n=sw*sh, lo=0, hi=0;
    for(var i=0;i<d.length;i+=4){ var r=d[i],g=d[i+1],b=d[i+2], y=(r*54+g*183+b*19)>>8; h[0][r]++; h[1][g]++; h[2][b]++; h[3][y]++; if(y<=4) lo++; if(y>=251) hi++; }
    var mx=1; for(var k=0;k<4;k++) for(var j=2;j<254;j++) if(h[k][j]>mx) mx=h[k][j];   /* ignore the 0/255 spikes so the body of the curve stays readable */
    var cw=hc.width, ch=hc.height, g2=hctx; g2.clearRect(0,0,cw,ch);
    g2.strokeStyle="rgba(255,255,255,.12)"; g2.lineWidth=1; for(var q=1;q<4;q++){ var x=Math.round(cw*q/4)+.5; g2.beginPath(); g2.moveTo(x,0); g2.lineTo(x,ch); g2.stroke(); }
    var cols=["rgba(255,70,70,.55)","rgba(60,220,110,.55)","rgba(255,138,80,.55)","rgba(255,255,255,.75)"];
    g2.globalCompositeOperation="lighter";
    for(var c=0;c<4;c++){
      g2.beginPath(); g2.moveTo(0,ch);
      for(var p=0;p<256;p++){ var v=Math.min(1,h[c][p]/mx); g2.lineTo(p/255*cw, ch-v*(ch-4)); }
      g2.lineTo(cw,ch); g2.closePath();
      if(c<3){ g2.fillStyle=cols[c]; g2.fill(); } else { g2.globalCompositeOperation="source-over"; g2.strokeStyle=cols[3]; g2.lineWidth=1.2; g2.stroke(); }
    }
    g2.globalCompositeOperation="source-over";
    g2.fillStyle=lo/n>.02?"#ff5d6c":"rgba(255,255,255,.25)"; g2.fillRect(0,0,6,4);
    g2.fillStyle=hi/n>.02?"#ff5d6c":"rgba(255,255,255,.25)"; g2.fillRect(cw-6,0,6,4);
    
    window.prHistLast={lo:lo/n,hi:hi/n,max:mx};
  }
  setInterval(function(){ var t=performance.now(); if(t-last>180){ last=t; try{ draw(); }catch(e){ window.__swl&&window.__swl(e); } } },200);
  try{ window.AMIYO_EDITOR_BUILD="pr-step53-histogram"; }catch(e){}
})();

;
/* ==================== Script 446 id="amiyo-pr-step54-subclips" ==================== */
/* PR Step 6: Subclips (Premiere "Make Subclip"). In the Source monitor, mark In/Out, then tap "Make subclip": the marked part becomes its
   own item in the Media bin. It shares the original file (no copy, no extra storage), carries its own marks, and drops onto the timeline
   already trimmed. Insert/Overwrite use it like any other media. */
(function(){
  if(window.__prStep54) return; window.__prStep54=1;
  function isSub(a){ return a&&a.subOf&&project.assets[a.subOf]; }
  function root(a){ var n=0; while(a&&a.subOf&&project.assets[a.subOf]&&n++<10) a=project.assets[a.subOf]; return a; }
  /* subclips borrow the file of the clip they came from */
  var oUrl=window.assetUrl; if(typeof oUrl==="function") window.assetUrl=function(id){
    var a=project&&project.assets&&project.assets[id]; if(a&&a.subOf){ var r=root(a); if(r&&r.id!==id) return oUrl(r.id); }
    return oUrl.apply(this,arguments);
  };
  var oMiss=window.amiyoAssetMissing; if(typeof oMiss==="function") window.amiyoAssetMissing=function(id){
    var a=project&&project.assets&&project.assets[id]; if(a&&a.subOf){ var r=root(a); if(r&&r.id!==id) return oMiss(r.id); }
    return oMiss.apply(this,arguments);
  };
  /* tapping a subclip in the bin / Add to timeline: place only the marked part */
  var oAdd=window.addAssetToTimeline; if(typeof oAdd==="function") window.addAssetToTimeline=function(assetId){
    var a=project.assets[assetId], r=oAdd.apply(this,arguments);
    try{
      if(isSub(a)&&a.markIn!=null&&a.markOut!=null&&selectedClipId){
        var f=getClip(); if(f&&f.clip.assetId===assetId){
          var c=f.clip, len=Math.max(.2,a.markOut-a.markIn);
          c.inPoint=a.markIn; c.outPoint=a.markOut; c.duration=len;
          var h=project.history; if(h&&h.entries[h.index]) h.entries[h.index].after=JSON.parse(JSON.stringify(serializableProject()));
          try{ renderAll(); }catch(e){}
        }
      }
    }catch(e){ window.__swl&&window.__swl(e); }
    return r;
  };
  function tf(s){ s=Math.max(0,s); var m=Math.floor(s/60), x=(s-m*60).toFixed(1); return m+":"+(x<10?"0":"")+x; }
  window.prMakeSubclip=function(assetId){
    var a=project.assets[assetId]; if(!a||(a.type!=="video"&&a.type!=="audio")){ toast("Pick a video or audio file first"); return null; }
    var full=a.duration||0, i=a.markIn!=null?a.markIn:0, o=a.markOut!=null?a.markOut:full;
    if(a.markIn==null&&a.markOut==null){ toast("Mark In and Out first"); return null; }
    if(!(o-i>=0.2)){ toast("The marked part is too short"); return null; }
    var before=JSON.parse(JSON.stringify(serializableProject()));
    var n=a.type==="video"||a.type==="audio"?1:0, id=uid("asset"), b=JSON.parse(JSON.stringify(a));
    delete b.runtimeUrl; delete b.fileData; delete b.fileObject; delete b.blob; delete b.thumb2;
    b.id=id; b.subOf=root(a).id; b.name=(a.name||"Clip")+" ["+tf(i)+"–"+tf(o)+"]"; b.markIn=i; b.markOut=o; b.isSubclip=true;
    if(a.subOf){ /* a subclip of a subclip: marks are already relative to the same file */ }
    project.assets[id]=b;
    if(window.pushHistory) window.pushHistory("Make subclip",before);
    try{ scheduleAutosave(); renderAll(); }catch(e){}
    toast("Subclip added to the Media bin"); return id;
  };
  function addBtn(){
    var s=document.getElementById("s2Sheet"), c=document.getElementById("s2C"); if(!s||!c||document.getElementById("prSubBtn")) return;
    var b=document.createElement("button"); b.type="button"; b.id="prSubBtn"; b.textContent="✂ Make subclip";
    b.onclick=function(){ var sel=document.getElementById("s2Sel"); window.prMakeSubclip(sel&&sel.value); };
    c.parentNode.appendChild(b);
  }
  setInterval(addBtn,800);
  try{ window.AMIYO_EDITOR_BUILD="pr-step54-subclips"; }catch(e){}
})();

;
/* ==================== Script 447 id="amiyo-pr-step55-sequences" ==================== */
/* PR Step 7: real sequences. Before this, "New sequence" reused the same tracks, so every sequence showed the same clips.
   Now each sequence owns its own timeline: New sequence starts empty, switching swaps the tracks in and out, and the switch is one Undo step.
   Only the sequences you are NOT editing keep their tracks stored on them, so the project does not carry two live copies. */
(function(){
  if(window.__prStep55) return; window.__prStep55=1;
  function J(o){ return JSON.parse(JSON.stringify(o)); }
  function snap(){ return J(serializableProject()); }
  function active(){ return project.sequences.find(function(s){ return s.id===project.activeSequenceId; })||project.sequences[0]; }
  function fresh(){ return J(defaultProject().tracks); }
  function hist(label,before){ if(window.pushHistory) window.pushHistory(label,before); }
  function after(){ try{ scheduleAutosave(); }catch(e){} try{ renderAll(); }catch(e){} }
  function leave(){ var cur=active(); if(cur){ cur.tracks=J(project.tracks); cur.trackIds=project.tracks.map(function(t){return t.id;}); } return cur; }
  function enter(s){
    project.tracks=(s.tracks&&s.tracks.length)?s.tracks:fresh(); delete s.tracks;
    project.activeSequenceId=s.id; if(s.settings) project.settings=Object.assign({},project.settings,J(s.settings));
    selectedClipId=null; try{ currentTime=0; }catch(e){}
  }
  window.createSequence=function(){
    var before=snap(), cur=leave(), id="seq_"+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    var s={id:id,name:"Sequence "+(project.sequences.length+1),settings:J((cur&&cur.settings)||project.settings),trackIds:[]};
    project.sequences.push(s); enter(s); s.trackIds=project.tracks.map(function(t){return t.id;});
    hist("New sequence",before); after(); toast("New empty sequence: "+s.name);
  };
  window.switchSequence=function(id){
    var t=project.sequences.find(function(x){ return x.id===id; }); if(!t||t.id===project.activeSequenceId) return;
    var before=snap(); leave(); enter(t); hist("Switch sequence",before); after(); toast("Sequence: "+t.name);
  };
  window.deleteSequence=async function(id){
    if(project.sequences.length<=1){ toast("A project must keep one sequence"); return; }
    var ok=true; try{ ok=await amiyoOk("Delete this sequence?",{okLabel:"Delete",danger:true}); }catch(e){}
    if(!ok) return;
    var before=snap();
    if(id===project.activeSequenceId){ var other=project.sequences.find(function(x){ return x.id!==id; }); leave(); enter(other); }
    project.sequences=project.sequences.filter(function(x){ return x.id!==id; });
    hist("Delete sequence",before); after(); toast("Sequence deleted");
  };
  try{ window.AMIYO_EDITOR_BUILD="pr-step55-sequences"; }catch(e){}
})();

;
/* ==================== Script 448 id="amiyo-pr-step57-build" ==================== */
(function(){ try{ window.AMIYO_EDITOR_BUILD="pr-step57-safe-start"; }catch(e){} })();

;
/* ==================== Script 449 id="amiyo-pr-step58-ask-ai-dock" ==================== */
/* Step 58: the floating "Ask AI" button used to sit on top of the timeline, the clip status bar and the inspector (on a phone it hid
   "Add video / audio"). It now docks in the top-left corner of the preview. Phones show just the sparkle icon. Tap behaviour is unchanged. */
(function(){
  var css=document.createElement("style"); css.id="pr58-css";
  css.textContent="#aiCmdBtn.pr58{position:absolute!important;left:8px!important;top:8px!important;right:auto!important;bottom:auto!important;z-index:30!important;min-height:40px!important;padding:0 14px!important}"+
    "@media(max-width:700px){#aiCmdBtn.pr58{width:44px;min-height:44px!important;padding:0!important;font-size:0!important;border-radius:50%!important;display:grid;place-items:center}#aiCmdBtn.pr58::before{content:\"\\2728\";font-size:19px;line-height:1}}";
  document.head.appendChild(css);
  var tries=0;
  function dock(){
    var b=document.getElementById("aiCmdBtn"), st=document.querySelector(".preview-stage");
    if(b&&st){ if(b.parentNode!==st) st.appendChild(b); b.classList.add("pr58"); return; }
    if(++tries<20) setTimeout(dock,300);
  }
  dock();
  try{ window.AMIYO_EDITOR_BUILD="pr-step58-ask-ai-dock"; }catch(e){}
})();

;
/* ==================== Script 450 id="amiyo-pr-step59-boot-bar" ==================== */
/* Step 59: on a slow phone the editor stays busy for a few seconds while it starts. A thin orange bar at the top shows "starting" only if start-up takes
   longer than about half a second (fast devices never see it), then disappears. It never blocks taps. window.__amiyoStartMs holds the measured start-up time. */
(function(){
  function done(){
    try{ window.__amiyoStartMs=Math.round(performance.now()); }catch(e){}
    var el=document.getElementById("pr59-boot"); if(el) setTimeout(function(){ try{ el.remove(); }catch(e){} },350);
  }
  function go(){ requestAnimationFrame(function(){ requestAnimationFrame(done); }); }
  if(document.readyState==="complete") go(); else window.addEventListener("load",go,{once:true});
  try{ window.AMIYO_EDITOR_BUILD="pr-step59-boot-bar"; }catch(e){}
})();

;
/* ==================== Script 451 id="amiyo-pr-step60-build" ==================== */
(function(){ try{ window.AMIYO_EDITOR_BUILD="pr-step60-idle-budget"; }catch(e){} })();

;
/* ==================== Script 452 id="amiyo-pr-step61-nest-tools" ==================== */
/* Premiere step 61: Sequences and nesting tools. A live "nested sequence" clip is not possible in this editor (the preview and export draw one video at a time),
   so this does the two jobs people use nesting for, with real clips: (1) Move the selected clips into a NEW sequence (one undo step), and (2) Insert any
   sequence into the one you are editing at the playhead. Inserted clips are grouped so they move together. Clips that would land on top of existing clips go on an
   extra track instead, so nothing is overwritten. Also: open, rename and delete sequences. Open it from Pr tools: Sequences. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function J(o){ return JSON.parse(JSON.stringify(o)); }
  function activeId(){ return project.activeSequenceId; }
  function tracksOf(s){ return s.id===activeId()?(project.tracks||[]):(s.tracks||[]); }
  function clipCount(s){ var n=0; tracksOf(s).forEach(function(t){ n+=(t.clips||[]).length; }); return n; }
  function dur(s){ var m=0; tracksOf(s).forEach(function(t){ (t.clips||[]).forEach(function(c){ m=Math.max(m,(c.start||0)+(c.duration||0)); }); }); return m; }
  function kindIndex(T,t){ var n=0; for(var i=0;i<T.length;i++){ if(T[i]===t) return n; if(T[i].kind===t.kind) n++; } return 0; }
  function nthOfKind(T,kind,n){ var k=0; for(var i=0;i<T.length;i++){ if(T[i].kind===kind){ if(k===n) return T[i]; k++; } } return null; }
  function mkTrack(T,kind){ var c=T.filter(function(x){ return x.kind===kind; }).length+1; return {id:uid("track"),name:kind.charAt(0).toUpperCase()+kind.slice(1)+" "+c,kind:kind,locked:false,hidden:false,muted:false,clips:[]}; }
  function clash(t,a,b){ return (t.clips||[]).some(function(c){ return (c.start||0)<b-1e-6&&(c.start||0)+(c.duration||0)>a+1e-6; }); }
  function remap(){ var m={}; return function(v){ if(!v) return v; if(!m[v]) m[v]=uid("link"); return m[v]; }; }
  function fmt(s){ s=Math.max(0,s||0); var m=Math.floor(s/60); return m+":"+(s-m*60<10?"0":"")+(s-m*60).toFixed(1); }

  function moveSelection(){
    var L=kit.sel(); if(!L.length){ kit.say("Select the clips to move first"); return false; }
    var T=project.tracks||[], t0=Math.min.apply(null,L.map(function(x){ return x.clip.start||0; }));
    var newTracks=[], need={video:1,audio:1}, i;
    L.forEach(function(x){ var k=x.track.kind, n=kindIndex(T,x.track)+1; if(n>(need[k]||0)) need[k]=n; });
    Object.keys(need).forEach(function(k){ for(i=0;i<need[k];i++) newTracks.push(mkTrack(newTracks,k)); });
    var lk=remap(), gp=remap(), ids={}; L.forEach(function(x){ ids[x.clip.id]=1; });
    var ok=kit.edit("Move clips to new sequence",function(){
      L.forEach(function(x){
        var dest=nthOfKind(newTracks,x.track.kind,kindIndex(T,x.track)); if(!dest) dest=newTracks[0];
        var c=J(x.clip); c.id=uid("clip"); c.start=Math.max(0,(c.start||0)-t0); c.selected=false; c.linkId=lk(c.linkId); c.groupId=gp(c.groupId);
        dest.clips.push(c);
      });
      T.forEach(function(t){ t.clips=(t.clips||[]).filter(function(c){ return !ids[c.id]; }); });
      var cur=project.sequences.find(function(s){ return s.id===activeId(); });
      var s={id:"seq_"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),name:"Moved clips "+(project.sequences.length),settings:J((cur&&cur.settings)||project.settings),tracks:newTracks,trackIds:newTracks.map(function(t){ return t.id; })};
      project.sequences.push(s);
      selectedClipId=null; try{ clearMultiSelection(); }catch(e){}
    });
    if(ok!==false) kit.say(L.length+" clip"+(L.length>1?"s":"")+" moved to a new sequence");
    return ok;
  }

  function insertSequence(id){
    var s=project.sequences.find(function(x){ return x.id===id; });
    if(!s||s.id===activeId()){ kit.say("Pick a different sequence to insert"); return false; }
    var src=s.tracks||[], total=clipCount(s); if(!total){ kit.say("That sequence has no clips"); return false; }
    var T=project.tracks, at=Math.max(0,currentTime||0), made=0, extra=0, first=null;
    var lk=remap(), gid=uid("group"), added=[];
    var ok=kit.edit("Insert sequence",function(){
      src.forEach(function(st){
        var cs=(st.clips||[]); if(!cs.length) return;
        var lo=Math.min.apply(null,cs.map(function(c){ return c.start||0; })), hi=Math.max.apply(null,cs.map(function(c){ return (c.start||0)+(c.duration||0); }));
        var n=kindIndex(src,st), dest=nthOfKind(T,st.kind,n);
        if(!dest){ dest=mkTrack(T,st.kind); T.push(dest); }
        var a=at, b=at+(hi-0);
        if(dest.locked||clash(dest,a,b)){
          var alt=T.filter(function(x){ return x.kind===st.kind&&!x.locked&&x!==dest&&!clash(x,a,b); })[0];
          if(!alt){ alt=mkTrack(T,st.kind); T.push(alt); extra++; }
          dest=alt;
        }
        cs.forEach(function(c){ var k=J(c); k.id=uid("clip"); k.start=at+(c.start||0); k.selected=false; k.linkId=lk(k.linkId); k.groupId=gid; dest.clips.push(k); added.push({clip:k,track:dest}); made++; });
      });
      try{ clearMultiSelection(); }catch(e){}
      added.forEach(function(x){ x.clip.selected=true; }); if(added.length){ selectedClipId=added[0].clip.id; selectedTrackId=added[0].track.id; }
    });
    if(ok!==false) kit.say(made+" clip"+(made>1?"s":"")+" inserted at the playhead"+(extra?" ("+extra+" extra track"+(extra>1?"s":"")+" added)":""));
    return ok;
  }

  var sh=kit.sheet("akNest","\u25A4 Sequences",function(){
    var S=project.sequences||[], n=kit.sel().length;
    var h='<div class="note">Sequences are separate timelines. <b>Insert</b> copies a sequence\u2019s clips (grouped) into the one you are editing at the playhead. A live nested clip is not supported, so inserted clips are real, editable clips.</div>'+
      '<button type="button" data-k="move" style="'+(n?'':'opacity:.5')+'">Move '+(n?n+' selected clip'+(n>1?'s':''):'selected clips')+' to a new sequence</button>'+
      '<button type="button" data-k="new">+ New empty sequence</button><h5>Your sequences</h5>';
    S.forEach(function(s){
      var act=s.id===activeId();
      h+='<div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap;border:1px solid #302c26;border-radius:11px;padding:6px 8px"><div style="flex:1;min-width:110px"><div style="font-size:13px;color:#f1ece2">'+kit.esc(s.name||"Sequence")+(act?' <span style="color:#ffb454;font-size:11px">\u2022 editing</span>':'')+'</div><div class="note">'+clipCount(s)+' clips \u00b7 '+fmt(dur(s))+'</div></div>'+
        (act?'':'<button type="button" data-k="open:'+s.id+'">Open</button><button type="button" data-k="ins:'+s.id+'">Insert</button>')+
        '<button type="button" data-k="ren:'+s.id+'" aria-label="Rename" style="min-width:42px">\u270E</button>'+
        (S.length>1?'<button type="button" data-k="del:'+s.id+'" aria-label="Delete sequence" style="min-width:42px">\u2715</button>':'')+'</div>';
    });
    return h;
  },function(k,b,api){
    var p=k.split(":"), id=p.slice(1).join(":");
    if(k==="move"){ if(moveSelection()!==false) api.paint(); }
    else if(k==="new"){ try{ createSequence(); }catch(e){} api.paint(); }
    else if(p[0]==="open"){ try{ switchSequence(id); }catch(e){} api.close(); }
    else if(p[0]==="ins"){ if(insertSequence(id)!==false) api.close(); }
    else if(p[0]==="ren"){ var s=project.sequences.find(function(x){ return x.id===id; }); if(!s) return; var v=window.prompt("Sequence name",s.name||""); if(v==null||!v.trim()) return; kit.edit("Rename sequence",function(){ s.name=v.trim().slice(0,40); }); api.paint(); }
    else if(p[0]==="del"){ Promise.resolve(window.deleteSequence(id)).then(function(){ api.paint(); }); }
  });
  window.amiyoNest={open:sh.open,moveSelection:moveSelection,insertSequence:insertSequence};
  kit.menu("\u25A4 Sequences",sh.open,"Sequences","amiyoNest.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step61-nest-tools"; }catch(e){}
})();

;
/* ==================== Script 453 id="amiyo-pr-step62-play-around" ==================== */
/* Premiere step 62: Play around edit. Plays a short stretch before and after the playhead (or the nearest cut), then puts the playhead back where it was,
   so you can judge an edit without losing your place. Shortcut: Shift+K. Pre-roll and post-roll are set in Pr tools: Play around edit (saved with the project). */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function S(){ project.settings=project.settings||{}; return project.settings; }
  function pre(){ var v=S().prPre; return typeof v==="number"?v:2; }
  function post(){ var v=S().prPost; return typeof v==="number"?v:2; }
  var timer=0, back=null;
  function stop(ret){
    clearInterval(timer); timer=0;
    try{ if(isPlaying) pause(); }catch(e){}
    if(ret&&back!=null){ try{ setCurrentTime(back); }catch(e){} }
    back=null;
  }
  function around(t){
    if(timer) stop(true);
    var a=Math.max(0,t-pre()), b=Math.min(projectEnd(),t+post());
    if(b<=a+0.05){ kit.say("Nothing to play here"); return false; }
    back=t;
    try{ if(isPlaying) pause(); setCurrentTime(a); play(); }catch(e){ back=null; return false; }
    timer=setInterval(function(){ if(!isPlaying||currentTime>=b) stop(true); },40);
    return true;
  }
  function nearestEdit(t){
    var best=null, d=1e9;
    kit.all().forEach(function(x){
      [x.clip.start||0,(x.clip.start||0)+(x.clip.duration||0)].forEach(function(p){ var k=Math.abs(p-t); if(k<d){ d=k; best=p; } });
    });
    return best;
  }
  function aroundCut(){
    var p=nearestEdit(currentTime||0);
    if(p==null){ kit.say("Add a clip first"); return false; }
    return around(p);
  }
  function aroundHead(){ return around(currentTime||0); }
  function setv(key,v){ S()[key]=Math.max(0,Math.min(10,Math.round(v*2)/2)); try{ scheduleAutosave(); }catch(e){} }
  var sh=kit.sheet("akAround","\u25B6 Play around edit",function(){
    return '<div class="note">Plays a little before and after, then jumps back to where you were. Shortcut: Shift+K.</div>'+
      '<div class="g"><button type="button" data-k="head">Around playhead</button><button type="button" data-k="cut">Around nearest cut</button></div>'+
      '<h5>Pre-roll: '+pre()+' s</h5><div class="g"><button type="button" data-k="pre-">\u2212 0.5 s</button><button type="button" data-k="pre+">+ 0.5 s</button></div>'+
      '<h5>Post-roll: '+post()+' s</h5><div class="g"><button type="button" data-k="post-">\u2212 0.5 s</button><button type="button" data-k="post+">+ 0.5 s</button></div>';
  },function(k,b,api){
    if(k==="head"){ api.close(); aroundHead(); }
    else if(k==="cut"){ api.close(); aroundCut(); }
    else { var key=k.indexOf("pre")===0?"prPre":"prPost", d=k.slice(-1)==="+"?0.5:-0.5; setv(key,(key==="prPre"?pre():post())+d); api.paint(); }
  });
  document.addEventListener("keydown",function(e){
    if(!e.shiftKey||e.ctrlKey||e.metaKey||e.altKey||(e.key!=="K"&&e.key!=="k")) return;
    var t=e.target&&e.target.tagName; if(t==="INPUT"||t==="TEXTAREA"||t==="SELECT"||(e.target&&e.target.isContentEditable)) return;
    e.preventDefault(); e.stopImmediatePropagation(); aroundHead();
  },true);
  window.amiyoAround={open:sh.open,head:aroundHead,cut:aroundCut,stop:function(){ stop(true); }};
  kit.menu("\u25B6 Play around edit",sh.open,"Play around edit","amiyoAround.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step62-play-around"; }catch(e){}
})();

;
/* ==================== Script 454 id="amiyo-pr-step63-ken-burns" ==================== */
/* Premiere step 63: Ken Burns. One tap adds a slow zoom or pan to the selected clips (photos or video) by writing two keyframes, a start and an end.
   Strength is Gentle, Medium or Strong. Existing keyframes on those clips are replaced (one undo step). "Clear motion" removes them. Open it from Pr tools: Ken Burns. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  var strength=1.2;
  var P={
    zin:function(s){ return [{x:.5,y:.5,scale:1},{x:.5,y:.5,scale:s}]; },
    zout:function(s){ return [{x:.5,y:.5,scale:s},{x:.5,y:.5,scale:1}]; },
    pl:function(s){ var o=(s-1)/2*.9; return [{x:.5+o,y:.5,scale:s},{x:.5-o,y:.5,scale:s}]; },
    pr:function(s){ var o=(s-1)/2*.9; return [{x:.5-o,y:.5,scale:s},{x:.5+o,y:.5,scale:s}]; },
    pu:function(s){ var o=(s-1)/2*.9; return [{x:.5,y:.5+o,scale:s},{x:.5,y:.5-o,scale:s}]; },
    drift:function(s){ var o=(s-1)/2*.6; return [{x:.5+o,y:.5+o,scale:1+(s-1)*.4},{x:.5-o,y:.5-o,scale:s}]; }
  };
  var NAMES={zin:"Slow zoom in",zout:"Slow zoom out",pl:"Pan right to left",pr:"Pan left to right",pu:"Tilt up",drift:"Drift"};
  function ok(x){ var c=x.clip; return c.kind!=="text"&&c.kind!=="audio"&&x.track.kind!=="audio"; }
  function apply(key){
    var L=kit.sel().filter(ok); if(!L.length){ kit.say("Select a photo or video clip first"); return false; }
    var f=P[key](strength);
    return kit.edit("Ken Burns",function(){
      L.forEach(function(x){
        var c=x.clip, d=Math.max(.1,c.duration||1);
        c.keyframes=[
          {t:0,x:f[0].x,y:f[0].y,scale:f[0].scale,rotation:c.rotation||0,opacity:c.opacity==null?1:c.opacity,easing:"linear"},
          {t:d,x:f[1].x,y:f[1].y,scale:f[1].scale,rotation:c.rotation||0,opacity:c.opacity==null?1:c.opacity,easing:"linear"}
        ];
      });
    });
  }
  function clear(){
    var L=kit.sel().filter(ok); if(!L.length){ kit.say("Select a clip first"); return false; }
    return kit.edit("Clear motion",function(){ L.forEach(function(x){ x.clip.keyframes=[]; x.clip.scale=1; x.clip.x=.5; x.clip.y=.5; }); });
  }
  var sh=kit.sheet("akKen","\uD83C\uDFA5 Ken Burns",function(){
    var n=kit.sel().filter(ok).length;
    var h='<div class="note">'+(n?n+" clip"+(n>1?"s":"")+" selected. Tap a move to add it.":"Select photo or video clips first.")+' This replaces motion keyframes on them.</div><h5>Strength</h5><div class="g">';
    [["Gentle",1.1],["Medium",1.2],["Strong",1.35]].forEach(function(s){ h+='<button type="button" data-k="s:'+s[1]+'" style="'+(strength===s[1]?"border-color:#ffb454;color:#ffb454":"")+'">'+s[0]+'</button>'; });
    h+='</div><h5>Move</h5><div class="g">';
    Object.keys(NAMES).forEach(function(k){ h+='<button type="button" data-k="m:'+k+'">'+NAMES[k]+'</button>'; });
    return h+'</div><button type="button" data-k="clr">Clear motion</button>';
  },function(k,b,api){
    var p=k.split(":");
    if(p[0]==="s"){ strength=parseFloat(p[1]); api.paint(); }
    else if(p[0]==="m"){ if(apply(p[1])!==false){ kit.say(NAMES[p[1]]+" added"); api.close(); } }
    else if(k==="clr"){ if(clear()!==false){ kit.say("Motion cleared"); api.close(); } }
  });
  window.amiyoKen={open:sh.open,apply:apply,clear:clear};
  kit.menu("\uD83C\uDFA5 Ken Burns",sh.open,"Ken Burns","amiyoKen.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step63-ken-burns"; }catch(e){}
})();

;
/* ==================== Script 455 id="amiyo-pr-step64-split-screen" ==================== */
/* Premiere step 64: Split-screen layouts. Select 2 to 4 video clips (usually on different tracks, overlapping in time) and pick a layout:
   side by side, stacked, 3 across, 2x2 grid or picture-in-picture. Each clip is scaled and moved into its cell (one undo step). The first selected track is used as
   the first cell. "Reset layout" puts clips back to full frame. Open it from Pr tools: Split screen. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  var LAY={
    side:{n:2,name:"Side by side",c:[[.25,.5,.5],[.75,.5,.5]]},
    stack:{n:2,name:"Stacked",c:[[.5,.25,.5],[.5,.75,.5]]},
    three:{n:3,name:"3 across",c:[[1/6,.5,1/3],[.5,.5,1/3],[5/6,.5,1/3]]},
    grid:{n:4,name:"2 x 2 grid",c:[[.25,.25,.5],[.75,.25,.5],[.25,.75,.5],[.75,.75,.5]]},
    pip:{n:2,name:"Picture in picture",c:[[.5,.5,1],[.8,.78,.3]]}
  };
  function vids(){ return kit.sel().filter(function(x){ var c=x.clip; return x.track.kind!=="audio"&&c.kind!=="audio"; }); }
  function ordered(L){
    var T=project.tracks||[];
    return L.slice().sort(function(a,b){ var d=T.indexOf(a.track)-T.indexOf(b.track); return d||((a.clip.start||0)-(b.clip.start||0)); });
  }
  function apply(key){
    var lay=LAY[key], L=ordered(vids());
    if(L.length<2){ kit.say("Select at least 2 video clips"); return false; }
    if(L.length>lay.n){ kit.say(lay.name+" fits "+lay.n+" clips; using the first "+lay.n); L=L.slice(0,lay.n); }
    return kit.edit("Split screen",function(){
      L.forEach(function(x,i){ var c=x.clip, s=lay.c[i]; c.x=s[0]; c.y=s[1]; c.scale=s[2]; c.keyframes=[]; });
    });
  }
  function reset(){
    var L=vids(); if(!L.length){ kit.say("Select clips first"); return false; }
    return kit.edit("Reset layout",function(){ L.forEach(function(x){ x.clip.x=.5; x.clip.y=.5; x.clip.scale=1; }); });
  }
  var sh=kit.sheet("akSplit","\u25A6 Split screen",function(){
    var n=vids().length;
    var h='<div class="note">'+(n>=2?n+" clips selected. Pick a layout.":"Select 2 to 4 video clips first (tap one, then add the others to the selection).")+' Clips on lower tracks fill the first cells; stack them so they overlap in time.</div><div class="g">';
    Object.keys(LAY).forEach(function(k){ h+='<button type="button" data-k="l:'+k+'">'+LAY[k].name+'<small style="display:block;font-size:10px;color:#8f8777">'+LAY[k].n+' clips</small></button>'; });
    return h+'</div><button type="button" data-k="rst">Reset layout (full frame)</button>';
  },function(k,b,api){
    if(k==="rst"){ if(reset()!==false){ kit.say("Layout reset"); api.close(); } }
    else if(k.indexOf("l:")===0){ if(apply(k.slice(2))!==false){ kit.say(LAY[k.slice(2)].name+" applied"); api.close(); } }
  });
  window.amiyoSplit={open:sh.open,apply:apply,reset:reset};
  kit.menu("\u25A6 Split screen",sh.open,"Split screen","amiyoSplit.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step64-split-screen"; }catch(e){}
})();

;
/* ==================== Script 456 id="amiyo-pr-step65-smooth-audio" ==================== */
/* Premiere step 65: Smooth audio cuts. Where two audio clips touch on the same track, a hard cut can click or pop. This adds a short fade out on the clip before
   the cut and a short fade in on the clip after it (10 ms to 1 s). It works on the selected audio clips, or on every audio track if none are selected.
   Note: the editor does not let clips overlap on one track, so this is a quick dip at the cut, not an overlapping crossfade. One undo step. Open it from Pr tools: Smooth audio cuts. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function scope(){
    var L=kit.sel().filter(function(x){ return x.track.kind==="audio"; });
    if(L.length) return {tracks:null,ids:L.reduce(function(m,x){ m[x.clip.id]=1; return m; },{}),label:L.length+" selected audio clip"+(L.length>1?"s":"")};
    return {tracks:(project.tracks||[]).filter(function(t){ return t.kind==="audio"; }),ids:null,label:"all audio tracks"};
  }
  function pairs(sc){
    var out=[], T=sc.tracks||(project.tracks||[]).filter(function(t){ return t.kind==="audio"; });
    T.forEach(function(t){
      var cs=(t.clips||[]).slice().sort(function(a,b){ return (a.start||0)-(b.start||0); });
      for(var i=0;i<cs.length-1;i++){
        var a=cs[i], b=cs[i+1], gap=(b.start||0)-((a.start||0)+(a.duration||0));
        if(gap>-0.001&&gap<=0.15){
          if(sc.ids&&!(sc.ids[a.id]||sc.ids[b.id])) continue;
          out.push([a,b]);
        }
      }
    });
    return out;
  }
  function apply(sec){
    var sc=scope(), P=pairs(sc);
    if(!P.length){ kit.say("No touching audio clips found in "+sc.label); return false; }
    return kit.edit("Smooth audio cuts",function(){
      P.forEach(function(p){
        p[0].fadeOut=Math.min(sec,(p[0].duration||0)*.45);
        p[1].fadeIn=Math.min(sec,(p[1].duration||0)*.45);
      });
    })&&P.length;
  }
  function remove(){
    var sc=scope(), P=pairs(sc);
    if(!P.length){ kit.say("No touching audio clips found"); return false; }
    return kit.edit("Remove cut fades",function(){ P.forEach(function(p){ p[0].fadeOut=0; p[1].fadeIn=0; }); })&&P.length;
  }
  var OPT=[["10 ms (click fix)",.01],["30 ms",.03],["100 ms",.1],["250 ms",.25],["500 ms",.5],["1 s",1]];
  var sh=kit.sheet("akSmooth","\uD83C\uDF9A Smooth audio cuts",function(){
    var sc=scope(), n=pairs(sc).length;
    var h='<div class="note">Works on '+sc.label+': '+n+' cut'+(n===1?"":"s")+' found. Short fades remove clicks; longer ones make a soft dip.</div><div class="g">';
    OPT.forEach(function(o){ h+='<button type="button" data-k="f:'+o[1]+'" style="'+(n?"":"opacity:.5")+'">'+o[0]+'</button>'; });
    return h+'</div><button type="button" data-k="rm">Remove these fades</button>';
  },function(k,b,api){
    if(k==="rm"){ var r=remove(); if(r){ kit.say("Fades removed at "+r+" cut"+(r>1?"s":"")); api.close(); } }
    else if(k.indexOf("f:")===0){ var n=apply(parseFloat(k.slice(2))); if(n){ kit.say("Fades added at "+n+" cut"+(n>1?"s":"")); api.close(); } }
  });
  window.amiyoSmooth={open:sh.open,apply:apply,remove:remove};
  kit.menu("\uD83C\uDF9A Smooth audio cuts",sh.open,"Smooth audio cuts","amiyoSmooth.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step65-smooth-audio"; }catch(e){}
})();

;
/* ==================== Script 457 id="amiyo-pr-step66-seq-settings" ==================== */
/* Premiere step 66: Sequence settings. One sheet to set the picture size and frame rate of the sequence you are editing, like New Sequence presets in Premiere:
   YouTube 1080p, 4K UHD, 720p, Shorts / Reels / TikTok vertical, Instagram square and portrait, Cinema 2.39:1. Frame rate: 24, 25, 30, 50, 60.
   Clips use relative positions, so they follow the new size. One undo step. Open it from Pr tools: Sequence settings. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  var SIZES=[
    ["YouTube 1080p",1920,1080,"16:9"],["4K UHD",3840,2160,"16:9"],["HD 720p",1280,720,"16:9"],
    ["Vertical 1080 x 1920",1080,1920,"9:16"],["Square 1080",1080,1080,"1:1"],["Portrait 4:5",1080,1350,"4:5"],
    ["Cinema 2.39:1",1920,804,"custom"],["Classic 4:3",1440,1080,"custom"]
  ];
  var FPS=[24,25,30,50,60];
  function S(){ return project.settings||(project.settings={}); }
  function seq(){ try{ return (project.sequences||[]).find(function(s){ return s.id===project.activeSequenceId; }); }catch(e){ return null; } }
  function set(patch){
    return kit.edit("Sequence settings",function(){
      var s=S(), q=seq();
      Object.keys(patch).forEach(function(k){ s[k]=patch[k]; if(q&&q.settings&&q.settings!==s) q.settings[k]=patch[k]; });
    });
  }
  function warn(w,h){
    var px=w*h; return px>2073600*1.01?"Large sizes need a lot of memory in the browser; export may be slow on a phone.":"";
  }
  var sh=kit.sheet("akSeqSet","\u2699 Sequence settings",function(){
    var s=S(), q=seq(), w=s.width||1280, h=s.height||720, f=s.fps||30;
    var out='<div class="note">Editing "'+kit.esc((q&&q.name)||"Sequence")+'". Now: <b>'+w+" x "+h+"</b> at <b>"+f+' fps</b>.</div><h5>Picture size</h5><div class="g">';
    SIZES.forEach(function(z,i){
      var on=z[1]===w&&z[2]===h;
      out+='<button type="button" data-k="z:'+i+'" style="'+(on?"border-color:#ffb454;color:#ffb454":"")+'">'+z[0]+'<small style="display:block;font-size:10px;color:#8f8777">'+z[1]+" x "+z[2]+'</small></button>';
    });
    out+='</div><h5>Frame rate</h5><div class="g" style="grid-template-columns:repeat(5,1fr)">';
    FPS.forEach(function(v){ out+='<button type="button" data-k="f:'+v+'" style="padding:5px 2px;'+(v===f?"border-color:#ffb454;color:#ffb454":"")+'">'+v+'</button>'; });
    var wn=warn(w,h);
    return out+'</div>'+(wn?'<div class="note" style="color:#ffb454">'+wn+'</div>':'');
  },function(k,b,api){
    var p=k.split(":");
    if(p[0]==="z"){ var z=SIZES[+p[1]]; if(z&&set({width:z[1],height:z[2],aspect:z[3]})!==false){ kit.say(z[0]+" set"); api.paint(); } }
    else if(p[0]==="f"){ if(set({fps:+p[1]})!==false){ kit.say(p[1]+" fps set"); api.paint(); } }
  });
  window.amiyoSeqSettings={open:sh.open};
  kit.menu("\u2699 Sequence settings",sh.open,"Sequence settings","amiyoSeqSettings.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step66-seq-settings"; }catch(e){}
})();

;
/* ==================== Script 458 id="amiyo-pr-step67-burn-in" ==================== */
/* Premiere step 67: Timecode burn-in. Draws the running timecode (HH:MM:SS:FF) on the picture, like the burn-in effect used for review copies.
   Choose Off, Preview only (for checking while you edit) or Preview and export (the timecode is in the exported video). Corner and size are adjustable.
   Saved with the project. Open it from Pr tools: Timecode burn-in. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function B(){ var s=project.settings=project.settings||{}; return s.prBurn=s.prBurn||{mode:"off",pos:"tl",size:4}; }
  function tc(t){
    var fps=Math.max(1,Math.round((project.settings&&project.settings.fps)||30)), f=Math.floor(Math.max(0,t)*fps+1e-6);
    var fr=f%fps, s=Math.floor(f/fps), p=function(n){ return (n<10?"0":"")+n; };
    return p(Math.floor(s/3600))+":"+p(Math.floor(s/60)%60)+":"+p(s%60)+":"+p(fr);
  }
  var prev=window.drawOverlays;
  window.drawOverlays=function(){
    if(prev) prev.apply(this,arguments);
    try{
      var b=B(); if(b.mode==="off") return;
      if(b.mode==="preview"&&window.__amiyoExporting) return;
      var W=canvas.width, H=canvas.height, fs=Math.max(10,Math.round(H*(b.size||4)/100)), txt=tc(currentTime||0);
      ctx.save(); ctx.globalAlpha=1; ctx.globalCompositeOperation="source-over"; ctx.filter="none"; ctx.shadowColor="transparent"; ctx.shadowBlur=0;
      ctx.font="700 "+fs+"px ui-monospace,Menlo,Consolas,monospace"; ctx.textBaseline="middle";
      var pad=fs*.45, w=ctx.measureText(txt).width+pad*2, h=fs+pad, m=W*.025, x=m, y=m;
      if(b.pos==="tr") x=W-w-m; else if(b.pos==="bl") y=H-h-m; else if(b.pos==="br"){ x=W-w-m; y=H-h-m; } else if(b.pos==="bc"){ x=(W-w)/2; y=H-h-m; } else if(b.pos==="tc") x=(W-w)/2;
      ctx.fillStyle="rgba(0,0,0,.62)"; ctx.fillRect(x,y,w,h);
      ctx.fillStyle="#ffffff"; ctx.fillText(txt,x+pad,y+h/2+fs*.04);
      ctx.restore();
    }catch(e){ try{ ctx.restore(); }catch(x){} }
  };
  function save(fn,label){
    kit.edit(label||"Timecode burn-in",function(){ fn(B()); });
  }
  var POS=[["tl","Top left"],["tc","Top centre"],["tr","Top right"],["bl","Bottom left"],["bc","Bottom centre"],["br","Bottom right"]];
  function on(c){ return c?"border-color:#ffb454;color:#ffb454":""; }
  var sh=kit.sheet("akBurn","\u23F1 Timecode burn-in",function(){
    var b=B(), h='<div class="note">Shows the timecode on the picture ('+tc(currentTime||0)+' now). "Preview and export" puts it in the exported video too.</div><h5>Show</h5><div class="g" style="grid-template-columns:repeat(3,1fr)">';
    [["off","Off"],["preview","Preview only"],["both","Preview and export"]].forEach(function(m){ h+='<button type="button" data-k="m:'+m[0]+'" style="padding:5px 3px;'+on(b.mode===m[0])+'">'+m[1]+'</button>'; });
    h+='</div><h5>Corner</h5><div class="g" style="grid-template-columns:repeat(3,1fr)">';
    POS.forEach(function(p){ h+='<button type="button" data-k="p:'+p[0]+'" style="padding:5px 3px;'+on(b.pos===p[0])+'">'+p[1]+'</button>'; });
    h+='</div><h5>Size</h5><div class="g" style="grid-template-columns:repeat(3,1fr)">';
    [["Small",3],["Medium",4.5],["Large",7]].forEach(function(s){ h+='<button type="button" data-k="s:'+s[1]+'" style="'+on(b.size===s[1])+'">'+s[0]+'</button>'; });
    return h+'</div>';
  },function(k,b,api){
    var p=k.split(":"), v=p.slice(1).join(":");
    save(function(o){ if(p[0]==="m") o.mode=v; else if(p[0]==="p") o.pos=v; else if(p[0]==="s") o.size=parseFloat(v); });
    try{ renderPreviewFrame(); }catch(e){}
    api.paint();
  });
  window.amiyoBurn={open:sh.open,tc:tc};
  kit.menu("\u23F1 Timecode burn-in",sh.open,"Timecode burn-in","amiyoBurn.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step67-burn-in"; }catch(e){}
})();

;
/* ==================== Script 459 id="amiyo-pr-step68-transitions" ==================== */
/* Premiere step 68: five more transitions: Film dissolve (soft, with a slight brightness lift in the middle), Flash (quick white flash), Dip to grey, Whip zoom (fast zoom
   with blur) and Star wipe. They appear in the Transitions panel with the others and work with Apply to all cuts. They are registered into the existing transition table. */
(function(){
  "use strict";
  var T=window.AMIYO_TRANSITIONS, BY=window.__amiyoTrBY;
  if(!T||!BY||!T.list){ return; }
  function cl(n,a,b){ return Math.min(b,Math.max(a,n)); }
  function ez(p){ return p*p*(3-2*p); }
  function dip(color,pw){
    return function(g,o,p,W,H){
      g.save();
      if(p<.5){ g.globalAlpha=1; g.drawImage(o,0,0,W,H); g.globalAlpha=cl(Math.pow(p*2,pw),0,1); } else g.globalAlpha=cl(Math.pow((1-p)*2,pw),0,1);
      g.fillStyle=color; g.fillRect(0,0,W,H); g.restore();
    };
  }
  function star(g,cx,cy,R){
    var n=5, r=R*.42, i, a;
    g.moveTo(cx,cy-R);
    for(i=1;i<n*2;i++){ a=-Math.PI/2+i*Math.PI/n; var rr=i%2?r:R; g.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr); }
    g.closePath();
  }
  var NEW=[
    {id:"film-dissolve",name:"Film dissolve",cat:"Dissolve",icon:"\u25D2",draw:function(g,o,p,W,H){
      g.save(); g.globalAlpha=1-ez(p); g.drawImage(o,0,0,W,H);
      g.globalAlpha=Math.sin(Math.PI*p)*.14; g.globalCompositeOperation="lighter"; g.fillStyle="#ffffff"; g.fillRect(0,0,W,H); g.restore();
    }},
    {id:"flash",name:"Flash",cat:"Dissolve",icon:"\u26A1",draw:function(g,o,p,W,H){
      g.save(); if(p<.35){ g.globalAlpha=1; g.drawImage(o,0,0,W,H); }
      var a=p<.35?p/.35:1-(p-.35)/.65; g.globalAlpha=cl(a,0,1); g.fillStyle="#ffffff"; g.fillRect(0,0,W,H); g.restore();
    }},
    {id:"dip-grey",name:"Dip to grey",cat:"Dissolve",icon:"\u25CC",draw:dip("#808080",1)},
    {id:"whip-zoom",name:"Whip zoom",cat:"Move",icon:"\u2735",draw:function(g,o,p,W,H){
      var e=ez(p), s=1+e*.6; g.save(); g.filter="blur("+(Math.sin(Math.PI*p)*14).toFixed(1)+"px)"; g.globalAlpha=1-e;
      g.translate(W/2,H/2); g.scale(s,s); g.drawImage(o,-W/2,-H/2,W,H); g.restore();
    }},
    {id:"star",name:"Star wipe",cat:"Style",icon:"\u2605",draw:function(g,o,p,W,H){
      var R=Math.hypot(W,H)*.62*ez(p)+.01; g.save(); g.beginPath(); g.rect(0,0,W,H); star(g,W/2,H/2,R); g.clip("evenodd"); g.drawImage(o,0,0,W,H); g.restore();
    }}
  ];
  NEW.forEach(function(d){ if(!BY[d.id]){ BY[d.id]=d; T.list.push(d); } });
  try{ if(typeof renderLeftPanel==="function") renderLeftPanel(); }catch(e){}
  window.AMIYO_EDITOR_BUILD="pr-step68-transitions";
})();

;
/* ==================== Script 460 id="amiyo-pr-step69-position" ==================== */
/* Premiere step 69: Screen position presets. Snap the selected clips (video, photo, text or graphic) to the centre, the rule-of-thirds points, the edges or the corners
   with one tap, and nudge size. Existing keyframes are left alone (if a clip has motion keyframes, the preset moves the base position only).
   One undo step. Open it from Pr tools: Screen position. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  var G=[["Top left",1/3,1/3],["Top centre",.5,1/3],["Top right",2/3,1/3],["Middle left",1/3,.5],["Centre",.5,.5],["Middle right",2/3,.5],["Bottom left",1/3,2/3],["Bottom centre",.5,2/3],["Bottom right",2/3,2/3]];
  function vis(){ return kit.sel().filter(function(x){ return x.track.kind!=="audio"&&x.clip.kind!=="audio"; }); }
  function pos(i,mode){
    var g=G[i], L=vis(); if(!L.length){ kit.say("Select a clip first"); return false; }
    return kit.edit("Screen position",function(){
      L.forEach(function(x){
        var c=x.clip, s=c.scale==null?1:c.scale, ex=Math.max(0,(1-s)/2);
        if(mode==="edge"){ c.x=g[1]===.5?.5:(g[1]<.5?ex+s/2:1-ex-s/2); c.y=g[2]===.5?.5:(g[2]<.5?ex+s/2:1-ex-s/2); }
        else { c.x=g[1]; c.y=g[2]; }
        if(i===4){ c.x=.5; c.y=.5; }
      });
    });
  }
  function size(f){
    var L=vis(); if(!L.length){ kit.say("Select a clip first"); return false; }
    return kit.edit("Clip size",function(){ L.forEach(function(x){ var c=x.clip; c.scale=f===1?1:Math.max(.05,Math.min(4,(c.scale==null?1:c.scale)*f)); }); });
  }
  var mode="third";
  var sh=kit.sheet("akPos","\u2316 Screen position",function(){
    var n=vis().length, h='<div class="note">'+(n?n+" clip"+(n>1?"s":"")+" selected.":"Select clips first.")+' Pick where they sit on screen.</div><div class="g" style="grid-template-columns:1fr 1fr">';
    h+='<button type="button" data-k="md:third" style="'+(mode==="third"?"border-color:#ffb454;color:#ffb454":"")+'">Thirds points</button><button type="button" data-k="md:edge" style="'+(mode==="edge"?"border-color:#ffb454;color:#ffb454":"")+'">Touch the edges</button></div>';
    h+='<div class="g" style="grid-template-columns:repeat(3,1fr)">';
    G.forEach(function(g,i){ h+='<button type="button" data-k="p:'+i+'" style="padding:5px 2px;font-size:11.5px">'+g[0]+'</button>'; });
    return h+'</div><h5>Size</h5><div class="g" style="grid-template-columns:repeat(3,1fr)"><button type="button" data-k="z:.9">Smaller</button><button type="button" data-k="z:1">Reset</button><button type="button" data-k="z:1.1">Bigger</button></div>';
  },function(k,b,api){
    var p=k.split(":");
    if(p[0]==="md"){ mode=p[1]; api.paint(); }
    else if(p[0]==="p"){ if(pos(+p[1],mode)!==false) kit.say("Position set"); }
    else if(p[0]==="z"){ if(size(parseFloat(p[1]))!==false) kit.say("Size changed"); }
  });
  window.amiyoPos={open:sh.open};
  kit.menu("\u2316 Screen position",sh.open,"Screen position","amiyoPos.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step69-position"; }catch(e){}
})();

;
/* ==================== Script 461 id="amiyo-pr-step70-find" ==================== */
/* Premiere step 70 (replaces "maintain pitch": browsers already keep pitch on preview playback): Find in timeline. Type part of a clip name, media file name or title text
   and get a list of matching clips with their times. Tap one to jump the playhead there and select it. "Select all matches" selects them together.
   Open it from Pr tools: Find in timeline. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  var q="", box=null;
  function label(x){
    var c=x.clip, a=null; try{ a=c.assetId?getAsset(c.assetId):null; }catch(e){}
    return (c.name||(a&&a.name)||c.text||(c.kind||x.track.kind)||"Clip");
  }
  function hay(x){ var c=x.clip, a=null; try{ a=c.assetId?getAsset(c.assetId):null; }catch(e){} return [c.name,a&&a.name,c.text,c.kind,x.track.name].join(" ").toLowerCase(); }
  function hits(){ var s=q.trim().toLowerCase(); if(!s) return []; return kit.all().filter(function(x){ return hay(x).indexOf(s)>=0; }).sort(function(a,b){ return (a.clip.start||0)-(b.clip.start||0); }); }
  function fmt(s){ s=Math.max(0,s||0); var m=Math.floor(s/60); return m+":"+(s-m*60<10?"0":"")+(s-m*60).toFixed(1); }
  function list(){
    var H=hits(), h='<input type="search" id="akFindIn" placeholder="Search clips, files, titles" value="'+kit.esc(q)+'" autocomplete="off">';
    h+='<div class="note">'+(q.trim()?H.length+" match"+(H.length===1?"":"es"):"Type to search all tracks.")+'</div>';
    H.slice(0,60).forEach(function(x,i){ h+='<button type="button" data-k="go:'+i+'" style="text-align:left">'+kit.esc(label(x))+'<small style="display:block;font-size:10px;color:#8f8777">'+kit.esc(x.track.name||x.track.kind)+" \u00B7 "+fmt(x.clip.start)+'</small></button>'; });
    if(H.length>1) h+='<button type="button" data-k="all">Select all '+H.length+' matches</button>';
    return h;
  }
  var sh=kit.sheet("akFind","\uD83D\uDD0E Find in timeline",list,function(k,b,api){
    var H=hits();
    if(k==="all"){ if(!H.length) return; try{ clearMultiSelection(); }catch(e){} H.forEach(function(x){ x.clip.selected=true; }); selectedClipId=H[0].clip.id; selectedTrackId=H[0].track.id; try{ setCurrentTime(H[0].clip.start); renderAll(); }catch(e){} kit.say(H.length+" clips selected"); api.close(); }
    else if(k.indexOf("go:")===0){ var x=H[+k.slice(3)]; if(!x) return; try{ clearMultiSelection(); }catch(e){} selectedClipId=x.clip.id; selectedTrackId=x.track.id; try{ setCurrentTime(x.clip.start); renderAll(); }catch(e){} api.close(); }
  });
  sh.el.addEventListener("input",function(e){
    if(!e.target||e.target.id!=="akFindIn"||e.__done) return; e.__done=1; q=e.target.value; var pos=q.length; sh.paint(); var n=document.getElementById("akFindIn"); if(n){ n.focus(); try{ n.setSelectionRange(pos,pos); }catch(x){} }
  });
  window.amiyoFind={open:function(){ sh.open(); }};
  kit.menu("\uD83D\uDD0E Find in timeline",window.amiyoFind.open,"Find in timeline","amiyoFind.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step70-find"; }catch(e){}
})();

;
/* ==================== Script 462 id="amiyo-pr-step71-chapters" ==================== */
/* Premiere step 71: YouTube chapters from markers. Turns your markers into a ready-to-paste chapter list ("0:00 Intro", "1:25 Setup" ...). Markers marked as chapters are used;
   if none are, every normal marker is used (beat markers are skipped). It adds a 0:00 line if needed and warns about YouTube's rules (3 or more chapters, each at least 10 seconds).
   Copy it or download it as a text file. Open it from Pr tools: YouTube chapters. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function tc(t){ t=Math.max(0,Math.floor(t+1e-6)); var h=Math.floor(t/3600), m=Math.floor(t/60)%60, s=t%60, p=function(n){ return (n<10?"0":"")+n; }; return h?h+":"+p(m)+":"+p(s):m+":"+p(s); }
  function rows(){
    var pe=0; try{ pe=projectEnd(); }catch(e){}
    var M=(project.markers||[]).filter(function(m){ return typeof m.time==="number"&&isFinite(m.time)&&m.time>=0&&!m.beat&&!m.bar&&(!pe||m.time<pe-.04); });
    var ch=M.filter(function(m){ return m.chapter; }); if(ch.length) M=ch;
    M=M.slice().sort(function(a,b){ return a.time-b.time; });
    var out=M.map(function(m){ return {t:m.time,l:(m.label||"Chapter").trim()||"Chapter"}; });
    if(!out.length||out[0].t>0.5) out.unshift({t:0,l:"Intro"}); else out[0].t=0;
    return out;
  }
  function text(R){ return R.map(function(r){ return tc(r.t)+" "+r.l; }).join("\n"); }
  function problems(R){
    var p=[]; if(R.length<3) p.push("YouTube needs at least 3 chapters (add markers).");
    for(var i=0;i<R.length;i++){ var end=i+1<R.length?R[i+1].t:projectEnd(); if(end-R[i].t<10){ p.push("\""+R[i].l+"\" is shorter than 10 s."); break; } }
    return p;
  }
  var sh=kit.sheet("akChap","\uD83D\uDCD1 YouTube chapters",function(){
    var R=rows(), P=problems(R);
    var h='<div class="note">Made from your markers ('+(project.markers||[]).length+' in the project). Add or rename markers in Marker list, then reopen this.</div>';
    h+='<pre style="margin:0;white-space:pre-wrap;font:12px/1.5 ui-monospace,monospace;color:#f1ece2;background:#1b1915;border:1px solid #302c26;border-radius:9px;padding:9px;max-height:34vh;overflow:auto">'+kit.esc(text(R))+'</pre>';
    P.forEach(function(x){ h+='<div class="note" style="color:#ffb454">\u26A0 '+kit.esc(x)+'</div>'; });
    return h+'<div class="g"><button type="button" data-k="copy">Copy</button><button type="button" data-k="dl">Download .txt</button></div>';
  },function(k,b,api){
    var t=text(rows());
    if(k==="copy"){
      var done=function(){ kit.say("Chapters copied"); };
      if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done,function(){ kit.say("Copy blocked: use Download instead"); });
      else kit.say("Copy not available: use Download instead");
    } else if(k==="dl"){
      var a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([t+"\n"],{type:"text/plain"})); a.download=(window.amiyoSafeFileName?window.amiyoSafeFileName((project.metadata&&project.metadata.name)||"amiyo-edit"):"amiyo-edit")+"-chapters.txt"; document.body.appendChild(a); a.click();
      setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },1500); kit.say("Chapters saved as a text file");
    }
  });
  window.amiyoChapters={open:sh.open,text:function(){ return text(rows()); }};
  kit.menu("\uD83D\uDCD1 YouTube chapters",sh.open,"YouTube chapters","amiyoChapters.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step71-chapters"; }catch(e){}
})();

;
/* ==================== Script 463 id="amiyo-export9-step12-helpers" ==================== */
/* Export plan step 12 (markers, chapters, shot list, cut list): one set of helpers for every list the editor saves, so they all agree.
   Timecode follows the project rate (29.97 and 59.94 use drop-frame, 23.976 counts 24), CSV files carry a byte-order mark so Excel reads Bengali, Hindi, Arabic and accents,
   file names go through amiyoSafeFileName like the video export, and beat and bar markers (made by the beat tools) stay out of the lists. */
(function(){try{
  if(window.amiyoExportLists) return;
  function rate(){ var f=+(project.settings&&project.settings.fps); return f>0&&isFinite(f)?f:30; }
  function nominal(){ return Math.max(1,Math.round(rate())); }
  function drop(){ var f=rate(); return Math.abs(f-29.97)<.02||Math.abs(f-59.94)<.02; }
  function frames(t){ t=+t; if(!isFinite(t)||t<0) t=0; return Math.round(t*rate()+1e-6); }
  function p2(n){ return (n<10?"0":"")+n; }
  function tc(t){
    var f=frames(t), N=nominal(), d=0;
    if(drop()){ d=Math.round(N*.066666); var per10=N*600-d*9, per1=N*60-d, D=Math.floor(f/per10), M=f%per10; f+=d*9*D+(M>=d?d*Math.floor((M-d)/per1):0); }
    return p2(Math.floor(f/(N*3600)))+":"+p2(Math.floor(f/(N*60))%60)+":"+p2(Math.floor(f/N)%60)+(d?";":":")+p2(f%N);
  }
  function hms(t){ t=Math.max(0,Math.floor((+t||0)+1e-6)); var h=Math.floor(t/3600), m=Math.floor(t%3600/60), s=t%60; return h?h+":"+p2(m)+":"+p2(s):m+":"+p2(s); }
  function cell(v){ v=String(v==null?"":v); if(/^[=+\-@\t\r]/.test(v)) v="'"+v; return /[",\r\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; }
  function base(){ return window.amiyoSafeFileName?window.amiyoSafeFileName((project.metadata&&project.metadata.name)||"amiyo-edit"):"amiyo-edit"; }
  function end(){ var e=0; try{ e=window.amiyoContentEnd?window.amiyoContentEnd():getProjectDuration(); }catch(x){ try{ e=getProjectDuration(); }catch(y){} } return +e>0?+e:0; }
  function markers(){ return (project.markers||[]).filter(function(m){ return m&&typeof m.time==="number"&&isFinite(m.time)&&m.time>=0&&!m.beat&&!m.bar; }).sort(function(a,b){ return a.time-b.time; }); }
  function beats(){ return (project.markers||[]).filter(function(m){ return m&&(m.beat||m.bar); }).length; }
  function oneLine(v,d){ v=String(v==null?"":v).replace(/\s*[\r\n]+\s*/g," ").trim(); return v||d||""; }
  function save(name,text,mime){
    var bom=/csv/.test(mime)?"\uFEFF":"", a=document.createElement("a"), u=URL.createObjectURL(new Blob([bom+text],{type:mime+";charset=utf-8"}));
    a.href=u; a.download=name; a.setAttribute("data-no-lang","1"); document.body.appendChild(a); a.click(); setTimeout(function(){ try{ URL.revokeObjectURL(u); }catch(e){} a.remove(); },4000); return name;
  }
  window.amiyoExportLists={rate:rate,nominal:nominal,drop:drop,frames:frames,tc:tc,hms:hms,cell:cell,base:base,end:end,markers:markers,beats:beats,oneLine:oneLine,save:save};
}catch(e){ try{ window.__swl&&window.__swl(e); }catch(x){} }})();

;
/* ==================== Script 464 id="amiyo-pr-step72-cut-list" ==================== */
/* Premiere step 72: Cut list export. Download your edit as a CSV cut list (every clip: track, name, start, end, duration, source in/out, speed) or as a CMX3600 EDL
   (video clips, in timeline order) that other editors can read. Times use the project frame rate. Open it from Pr tools: Export cut list. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  var X=window.amiyoExportLists;
  function fps(){ return Math.max(1,Math.round((project.settings&&project.settings.fps)||30)); }
  function rateText(){ var f=+(project.settings&&project.settings.fps)||30; return String(Math.round(f*1000)/1000); }
  function tc(t){ return X.tc(t); }
  function srcName(x){ var c=x.clip, a=null; try{ a=c.assetId?getAsset(c.assetId):null; }catch(e){} return (a&&a.name)||""; }
  function srcOut(c){ var si=c.inPoint||0, sp=c.speed||1; return (typeof c.outPoint==="number"&&isFinite(c.outPoint))?c.outPoint:si+(c.duration||0)*sp; }
  function nm(x){ var c=x.clip, a=null; try{ a=c.assetId?getAsset(c.assetId):null; }catch(e){} return c.name||(a&&a.name)||c.text||"Clip"; }
  function all(){ return kit.all().sort(function(a,b){ return (a.clip.start||0)-(b.clip.start||0); }); }
  function q(s){ return X.cell(s); }
  function base(){ return X.base(); }
  function state(x){ return x.track.hidden?"hidden":(x.track.muted?"muted":""); }
  function csv(){
    var r=[["Track","Kind","Name","Start","End","Duration","Source in","Source out","Speed","Start TC","End TC","Track state","Source file"]];
    all().forEach(function(x){ var c=x.clip, s=c.start||0, d=c.duration||0, sp=c.speed||1;
      r.push([x.track.name||x.track.kind,(c.kind==="adjustment"?"adjustment":x.track.kind),nm(x),s.toFixed(3),(s+d).toFixed(3),d.toFixed(3),(c.inPoint||0).toFixed(3),(c.outPoint==null?"":(+c.outPoint).toFixed(3)),sp,tc(s),tc(s+d),state(x),srcName(x)]); });
    return r.map(function(a){ return a.map(q).join(","); }).join("\r\n")+"\r\n";
  }
  /* video tracks that show in the picture (a hidden track is not part of the edit), in track order */
  function isFootage(c){ return c.kind!=="text"&&c.kind!=="adjustment"&&!c.off; }
  function vtracks(){ return (project.tracks||[]).filter(function(t){ return t.kind==="video"&&!t.hidden&&t.clips.some(isFootage); }); }
  /* CMX3600 holds ONE video channel per file, so each visible video track is its own EDL (events of different tracks overlap in time, which importers reject).
     edl(trackId) lists that track; edl() with no id lists every visible video track one after the other (for checking). */
  function edl(tid){
    var F=fps(), out=["TITLE: "+String((project.metadata&&project.metadata.name)||"AMIYO EDIT").replace(/[\r\n]/g," "),"FCM: "+(X.drop()?"DROP FRAME":"NON-DROP FRAME"),""], n=0, tr=vtracks();
    if(tid) tr=tr.filter(function(t){ return t.id===tid; });
    tr.forEach(function(t){
      if(tr.length>1) out.push("* TRACK: "+String(t.name||t.id).replace(/[\r\n]/g," "));
      t.clips.filter(isFootage).sort(function(a,b){ return (a.start||0)-(b.start||0); }).forEach(function(c){
        var s=c.start||0, d=c.duration||0, sp=c.speed||1, si=c.inPoint||0, so=srcOut(c); n++; if(c.freeze){ so=si; sp=0; }
        var x={clip:c,track:t};
        out.push(("000000"+n).slice(-3)+"  AX       V     C        "+tc(si)+" "+tc(so)+" "+tc(s)+" "+tc(s+d));
        var sf=srcName(x), cn=nm(x).replace(/[\r\n\t]/g," ");
        out.push("* FROM CLIP NAME: "+(sf||cn).replace(/[\r\n\t]/g," "));
        if(sf&&sf!==cn) out.push("* COMMENT: CLIP NAME "+cn);
        if(Math.abs(sp-1)>.001||c.freeze){ var fr=sp*X.rate(); out.push("M2   AX       "+("000"+(Math.abs(fr-Math.round(fr))<.05?fr.toFixed(1):fr.toFixed(2))).slice(-(Math.abs(fr-Math.round(fr))<.05?5:6))+"                "+tc(si)); }
      });
    });
    return {text:out.join("\r\n")+"\r\n",n:n};
  }
  function dl(name,txt,type){ X.save(name,txt,type); }
  function safe(n){ return window.amiyoSafeFileName?window.amiyoSafeFileName(n):String(n); }
  var sh=kit.sheet("akCut","\u21E9 Export cut list",function(){
    var n=kit.all().length, vt=vtracks(), hid=kit.all().filter(function(x){ return x.track.hidden; }).length;
    var btns='<button type="button" data-k="csv">Download CSV</button>';
    if(vt.length<2) btns+='<button type="button" data-k="edl">Download EDL</button>';
    else btns+=vt.map(function(t){ return '<button type="button" data-k="edl:'+String(t.id).replace(/"/g,"")+'">EDL \u00B7 '+String(t.name||t.id).replace(/[<>&"]/g,"")+'</button>'; }).join("");
    return '<div class="note">'+n+' clip'+(n===1?"":"s")+' in this sequence at '+rateText()+' fps'+(X.drop()?' (drop-frame timecode)':'')+'. CSV opens in Excel or Sheets and lists every clip'+(hid?' ('+hid+' on a hidden track, marked "hidden")':'')+'. An EDL holds one video track, so '+(vt.length>1?'there is one button for each visible video track':'it lists the video clips')+'; hidden tracks, text, adjustment layers and audio are not in it.</div><div class="g">'+btns+'</div>';
  },function(k,b,api){
    if(!kit.all().length){ kit.say("Nothing to export yet"); return; }
    if(k==="csv"){ dl(base()+"-cut-list.csv",csv(),"text/csv"); kit.say(base()+"-cut-list.csv saved"); }
    else if(k.indexOf("edl")===0){ var tid=k.length>3?k.slice(4):null; var e=edl(tid); if(!e.n){ kit.say("No visible video clips to put in an EDL"); return; }
      var tn=""; if(tid){ var t=(project.tracks||[]).filter(function(t){ return t.id===tid; })[0]; tn="-"+safe((t&&t.name)||"track"); }
      var f=base()+tn+".edl"; dl(f,e.text,"text/plain"); kit.say(f+" saved ("+e.n+" events)"); }
  });
  window.amiyoCutList={open:sh.open,csv:csv,edl:function(id){ return edl(id).text; },tracks:function(){ return vtracks().map(function(t){ return t.id; }); }};
  kit.menu("\u21E9 Export cut list",sh.open,"Export cut list","amiyoCutList.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step72-cut-list"; }catch(e){}
})();

;
/* ==================== Script 465 id="amiyo-pr-step73-default-transition" ==================== */
/* Premiere step 73: Default transition (Ctrl+D). Pick one transition and a length as your default. Ctrl+D (or the button) then adds it at the start of the selected video clip,
   or, if nothing is selected, at the cut closest to the playhead. The choice is saved with the project. Open it from Pr tools: Default transition. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function S(){ var s=project.settings=project.settings||{}; return s.prDefTr=s.prDefTr||{id:"dissolve",dur:.75}; }
  function T(){ return (window.AMIYO_TRANSITIONS&&window.AMIYO_TRANSITIONS.list)||[]; }
  function nameOf(id){ var l=T().filter(function(d){ return d.id===id; })[0]; return l?l.name:id; }
  function target(){
    var L=kit.sel().filter(function(x){ return x.track.kind==="video"; });
    if(L.length) return L[0];
    var best=null, d=0.6, t=currentTime||0;
    (project.tracks||[]).forEach(function(tr){
      if(tr.kind!=="video") return;
      var cs=(tr.clips||[]).slice().sort(function(a,b){ return a.start-b.start; });
      for(var i=1;i<cs.length;i++){ var k=Math.abs(cs[i].start-t); if(k<d){ d=k; best={track:tr,clip:cs[i]}; } }
    });
    return best;
  }
  function apply(){
    var x=target(); if(!x){ kit.say("Select a video clip, or move the playhead to a cut"); return false; }
    if(typeof window.applyTransition!=="function"){ kit.say("Transitions are not available"); return false; }
    selectedClipId=x.clip.id; selectedTrackId=x.track.id;
    var d=S(), r=window.applyTransition(d.id,d.dur);
    return r!==false;
  }
  var sh=kit.sheet("akDefTr","\u29C9 Default transition",function(){
    var d=S(), h='<div class="note">Now: <b>'+kit.esc(nameOf(d.id))+"</b>, "+d.dur+' s. Ctrl+D adds it to the selected clip or the nearest cut.</div><button type="button" data-k="go" style="border-color:#ffb454;color:#ffb454">Apply now</button><h5>Length</h5><div class="g" style="grid-template-columns:repeat(4,1fr)">';
    [.25,.5,1,1.5].forEach(function(v){ h+='<button type="button" data-k="d:'+v+'" style="padding:5px 2px;'+(d.dur===v?"border-color:#ffb454;color:#ffb454":"")+'">'+v+' s</button>'; });
    h+='</div><h5>Type</h5><div class="g">';
    T().forEach(function(t){ h+='<button type="button" data-k="t:'+kit.esc(t.id)+'" style="font-size:12px;'+(d.id===t.id?"border-color:#ffb454;color:#ffb454":"")+'">'+kit.esc((t.icon||"")+" "+t.name)+'</button>'; });
    return h+'</div>';
  },function(k,b,api){
    var p=k.split(":"), v=p.slice(1).join(":");
    if(k==="go"){ if(apply()) api.close(); return; }
    kit.edit("Default transition",function(){ var d=S(); if(p[0]==="d") d.dur=parseFloat(v); else if(p[0]==="t") d.id=v; });
    api.paint();
  });
  document.addEventListener("keydown",function(e){
    if(!(e.ctrlKey||e.metaKey)||e.shiftKey||e.altKey||(e.key!=="d"&&e.key!=="D")) return;
    var t=e.target&&e.target.tagName; if(t==="INPUT"||t==="TEXTAREA"||t==="SELECT"||(e.target&&e.target.isContentEditable)) return;
    e.preventDefault(); e.stopImmediatePropagation(); apply();
  },true);
  window.amiyoDefTr={open:sh.open,apply:apply};
  kit.menu("\u29C9 Default transition (Ctrl+D)",sh.open,"Default transition","amiyoDefTr.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step73-default-transition"; }catch(e){}
})();

;
/* ==================== Script 466 id="amiyo-pr-step74-rate-stretch" ==================== */
/* Premiere step 74: Rate stretch. Changes a clip's speed so it fills exactly the space you choose, without cutting any of its footage: "to next clip" closes the gap after it,
   "to playhead" stretches or shrinks its end to the playhead. Speed must stay between 0.1x and 8x. Works on the selected video clips (linked audio is not changed, so
   stretch it too if you need to). One undo step. Open it from Pr tools: Rate stretch. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function vids(){ return kit.sel().filter(function(x){ return x.track.kind==="video"&&x.clip.kind!=="text"&&!x.track.locked; }); }
  function span(c){ var s=(c.outPoint==null?c.duration:c.outPoint)-(c.inPoint||0); return s>0.01?s:(c.duration||0)*(c.speed||1); }
  function nextStart(x){
    var e=(x.clip.start||0)+(x.clip.duration||0), n=null;
    (x.track.clips||[]).forEach(function(c){ if(c!==x.clip&&(c.start||0)>=e-0.001&&(n==null||c.start<n)) n=c.start; });
    return n;
  }
  function run(mode){
    var L=vids(); if(!L.length){ kit.say("Select a video clip first"); return false; }
    var plan=[], bad=0;
    L.forEach(function(x){
      var c=x.clip, end=mode==="next"?nextStart(x):(currentTime||0), D=end==null?null:end-(c.start||0);
      if(D==null||D<0.2){ bad++; return; }
      var sp=span(c)/D; if(sp<0.1||sp>8){ bad++; return; }
      plan.push([c,D,sp]);
    });
    if(!plan.length){ kit.say(mode==="next"?"No later clip to stretch to, or speed would be out of range":"Move the playhead after the clip start (speed 0.1x to 8x)"); return false; }
    var ok=kit.edit("Rate stretch",function(){
      plan.forEach(function(p){ var c=p[0]; if(c.outPoint==null) c.outPoint=(c.inPoint||0)+span(c); c.duration=p[1]; c.speed=Math.round(p[2]*10000)/10000; });
    });
    if(ok!==false) kit.say(plan.length+" clip"+(plan.length>1?"s":"")+" stretched"+(bad?" ("+bad+" skipped)":""));
    return ok;
  }
  var sh=kit.sheet("akStretch","\u21C6 Rate stretch",function(){
    var n=vids().length;
    return '<div class="note">'+(n?n+" video clip"+(n>1?"s":"")+" selected.":"Select video clips first.")+' The clip speeds up or slows down so all its footage fits the new length.</div><button type="button" data-k="next">Stretch to next clip (close the gap)</button><button type="button" data-k="head">Stretch end to playhead</button>';
  },function(k,b,api){ if(run(k)!==false) api.close(); });
  window.amiyoStretch={open:sh.open,run:run};
  kit.menu("\u21C6 Rate stretch",sh.open,"Rate stretch","amiyoStretch.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step74-rate-stretch"; }catch(e){}
})();

;
/* ==================== Script 467 id="amiyo-pr-step75-gaps" ==================== */
/* Premiere step 75: Gap finder. Finds the empty stretches of the timeline (where no video clip is playing, so the preview goes black). Buttons jump the playhead to the
   previous or next gap, and "Close this gap" slides everything after it left on all tracks so nothing else moves out of sync (one undo step).
   Shortcut: Alt+Shift+G jumps to the next gap. Open it from Pr tools: Gaps. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function gaps(){
    var iv=[]; (project.tracks||[]).forEach(function(t){ if(t.kind!=="video") return; (t.clips||[]).forEach(function(c){ iv.push([c.start||0,(c.start||0)+(c.duration||0)]); }); });
    iv.sort(function(a,b){ return a[0]-b[0]; });
    var out=[], reach=0, end=0;
    iv.forEach(function(r){ if(r[0]>reach+0.05) out.push([reach,r[0]]); reach=Math.max(reach,r[1]); end=Math.max(end,r[1]); });
    return out;
  }
  function fmt(s){ var m=Math.floor(s/60); return m+":"+(s-m*60<10?"0":"")+(s-m*60).toFixed(1); }
  function go(dir){
    var G=gaps(), t=currentTime||0, g=null;
    if(!G.length){ kit.say("No gaps in the video tracks"); return false; }
    if(dir>0){ g=G.filter(function(x){ return x[0]>t+0.02; })[0]; } else { G.forEach(function(x){ if(x[0]<t-0.02) g=x; }); }
    if(!g){ kit.say(dir>0?"No gap after the playhead":"No gap before the playhead"); return false; }
    try{ setCurrentTime(g[0]); }catch(e){}
    kit.say("Gap "+fmt(g[0])+" to "+fmt(g[1]));
    return true;
  }
  function close(){
    var t=currentTime||0, g=gaps().filter(function(x){ return t>=x[0]-0.02&&t<=x[1]+0.02; })[0];
    if(!g){ kit.say("Put the playhead inside a gap first"); return false; }
    var d=g[1]-g[0];
    return kit.edit("Close gap",function(){
      (project.tracks||[]).forEach(function(tr){ if(tr.locked) return; (tr.clips||[]).forEach(function(c){ if((c.start||0)>=g[1]-0.001) c.start=Math.max(0,c.start-d); }); });
      try{ setCurrentTime(g[0]); }catch(e){}
    });
  }
  var sh=kit.sheet("akGaps","\u2B1C Gaps",function(){
    var G=gaps(), h='<div class="note">'+(G.length?G.length+" gap"+(G.length>1?"s":"")+" found. Shortcut: Alt+Shift+G = next gap.":"No gaps: the video tracks are continuous.")+'</div><div class="g"><button type="button" data-k="prev">\u2190 Previous gap</button><button type="button" data-k="next">Next gap \u2192</button></div><button type="button" data-k="close">Close this gap (playhead must be inside it)</button>';
    G.slice(0,30).forEach(function(x,i){ h+='<button type="button" data-k="at:'+i+'" style="text-align:left">'+fmt(x[0])+" to "+fmt(x[1])+' <small style="color:#8f8777">('+(x[1]-x[0]).toFixed(1)+' s)</small></button>'; });
    return h;
  },function(k,b,api){
    if(k==="prev") go(-1); else if(k==="next") go(1);
    else if(k==="close"){ if(close()!==false){ kit.say("Gap closed"); api.paint(); } return; }
    else if(k.indexOf("at:")===0){ var g=gaps()[+k.slice(3)]; if(g){ try{ setCurrentTime(g[0]+0.01); }catch(e){} } }
    api.paint();
  });
  document.addEventListener("keydown",function(e){
    if(!e.altKey||!e.shiftKey||e.ctrlKey||e.metaKey||(e.key!=="G"&&e.key!=="g")) return;
    var t=e.target&&e.target.tagName; if(t==="INPUT"||t==="TEXTAREA"||t==="SELECT"||(e.target&&e.target.isContentEditable)) return;
    e.preventDefault(); e.stopImmediatePropagation(); go(1);
  },true);
  window.amiyoGaps={open:sh.open,next:function(){ return go(1); },prev:function(){ return go(-1); },close:close};
  kit.menu("\u2B1C Gaps",sh.open,"Gaps","amiyoGaps.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step75-gaps"; }catch(e){}
})();

;
/* ==================== Script 468 id="amiyo-pr-step76-saved-selections" ==================== */
/* Premiere step 76: Saved selections. Select some clips, give the selection a name, and bring it back with one tap later (for example "all B-roll" or "intro clips").
   Clips that were deleted since are skipped. Saved with the project. Open it from Pr tools: Saved selections. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function L(){ var s=project.settings=project.settings||{}; return s.prSelSets=s.prSelSets||[]; }
  function live(ids){ var m={}; ids.forEach(function(i){ m[i]=1; }); return kit.all().filter(function(x){ return m[x.clip.id]; }); }
  function save(){
    var S=kit.sel(); if(!S.length){ kit.say("Select some clips first"); return false; }
    var n=window.prompt("Name this selection",("Selection "+(L().length+1))); if(n==null||!n.trim()) return false;
    return kit.edit("Save selection",function(){ L().push({id:"ss_"+Date.now().toString(36),name:n.trim().slice(0,30),ids:S.map(function(x){ return x.clip.id; })}); });
  }
  function recall(id){
    var s=L().filter(function(x){ return x.id===id; })[0]; if(!s) return false;
    var H=live(s.ids); if(!H.length){ kit.say("Those clips no longer exist"); return false; }
    try{ clearMultiSelection(); }catch(e){}
    H.forEach(function(x){ x.clip.selected=true; }); selectedClipId=H[0].clip.id; selectedTrackId=H[0].track.id;
    try{ renderAll(); }catch(e){}
    kit.say(H.length+" clip"+(H.length>1?"s":"")+" selected"+(H.length<s.ids.length?" ("+(s.ids.length-H.length)+" missing)":""));
    return true;
  }
  var sh=kit.sheet("akSelSets","\u2610 Saved selections",function(){
    var n=kit.sel().length, h='<button type="button" data-k="save" style="'+(n?"":"opacity:.5")+'">+ Save current selection'+(n?" ("+n+" clip"+(n>1?"s":"")+")":"")+'</button>';
    if(!L().length) return h+'<div class="note">Nothing saved yet.</div>';
    L().forEach(function(s){ var k=live(s.ids).length; h+='<div style="display:flex;gap:6px"><button type="button" data-k="use:'+s.id+'" style="flex:1;text-align:left">'+kit.esc(s.name)+' <small style="color:#8f8777">'+k+' clip'+(k===1?"":"s")+'</small></button><button type="button" data-k="del:'+s.id+'" aria-label="Delete" style="min-width:46px">\u2715</button></div>'; });
    return h;
  },function(k,b,api){
    var p=k.split(":"), id=p.slice(1).join(":");
    if(k==="save"){ if(save()!==false) api.paint(); }
    else if(p[0]==="use"){ if(recall(id)) api.close(); }
    else if(p[0]==="del"){ kit.edit("Delete saved selection",function(){ var a=L(); var i=a.findIndex(function(x){ return x.id===id; }); if(i>=0) a.splice(i,1); }); api.paint(); }
  });
  window.amiyoSelSets={open:sh.open};
  kit.menu("\u2610 Saved selections",sh.open,"Saved selections","amiyoSelSets.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step76-saved-selections"; }catch(e){}
})();

;
/* ==================== Script 469 id="amiyo-pr-step77-todo" ==================== */
/* Premiere step 77: Edit to-do list. Leave yourself notes at a time in the timeline ("fix audio here", "replace this shot"), tick them off when done, and tap one to jump
   the playhead to it. Open notes first, finished notes below. Saved with the project and undoable. Open it from Pr tools: To-do notes. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function L(){ var s=project.settings=project.settings||{}; return s.prTodos=s.prTodos||[]; }
  function fmt(s){ s=Math.max(0,s||0); var m=Math.floor(s/60); return m+":"+(s-m*60<10?"0":"")+(s-m*60).toFixed(1); }
  function add(){
    var t=currentTime||0, v=window.prompt("Note at "+fmt(t),""); if(v==null||!v.trim()) return false;
    return kit.edit("Add to-do note",function(){ L().push({id:"td_"+Date.now().toString(36)+Math.random().toString(36).slice(2,4),t:t,text:v.trim().slice(0,120),done:false}); });
  }
  function find(id){ return L().filter(function(x){ return x.id===id; })[0]; }
  var sh=kit.sheet("akTodo","\u2611 To-do notes",function(){
    var A=L().slice().sort(function(a,b){ return (a.done-b.done)||(a.t-b.t); }), open=A.filter(function(x){ return !x.done; }).length;
    var h='<button type="button" data-k="add">+ Add note at playhead ('+fmt(currentTime||0)+')</button><div class="note">'+(A.length?open+" open, "+(A.length-open)+" done":"No notes yet.")+'</div>';
    A.forEach(function(n){
      h+='<div style="display:flex;gap:6px;align-items:stretch"><button type="button" data-k="tick:'+n.id+'" aria-label="Toggle done" style="min-width:46px">'+(n.done?"\u2611":"\u2610")+'</button><button type="button" data-k="go:'+n.id+'" style="flex:1;text-align:left;'+(n.done?"opacity:.55;text-decoration:line-through":"")+'">'+kit.esc(n.text)+'<small style="display:block;font-size:10px;color:#8f8777">'+fmt(n.t)+'</small></button><button type="button" data-k="del:'+n.id+'" aria-label="Delete" style="min-width:46px">\u2715</button></div>';
    });
    return h;
  },function(k,b,api){
    var p=k.split(":"), id=p.slice(1).join(":"), n=find(id);
    if(k==="add"){ if(add()!==false) api.paint(); }
    else if(p[0]==="tick"&&n){ kit.edit("To-do note",function(){ n.done=!n.done; }); api.paint(); }
    else if(p[0]==="go"&&n){ try{ setCurrentTime(n.t); }catch(e){} api.close(); }
    else if(p[0]==="del"&&n){ kit.edit("Delete to-do note",function(){ var a=L(); a.splice(a.indexOf(n),1); }); api.paint(); }
  });
  window.amiyoTodo={open:sh.open,add:add};
  kit.menu("\u2611 To-do notes",sh.open,"To-do notes","amiyoTodo.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step77-todo"; }catch(e){}
})();

;
/* ==================== Script 470 id="amiyo-pr-step78" ==================== */
/* Premiere step 78: Phone welcome panel fix. On a phone the empty-state panel ("Bring in your video") ran underneath the level meters on the right edge and its text was cut off
   ("...on thi"). The panel now keeps clear of the meters and the Ask AI button, wraps its text, and the hint line stays hidden so the buttons are never pushed off screen. */
(function(){
  "use strict";
  if(document.getElementById("amiyoPr78css")) return;
  var st=document.createElement("style"); st.id="amiyoPr78css";
  st.textContent="@media (max-width:1024px){"+
    ".welcome-overlay{box-sizing:border-box;padding:48px 46px 8px 10px!important;align-items:stretch}"+
    ".welcome-dropzone{box-sizing:border-box;width:100%!important;max-width:100%!important;min-width:0}"+
    ".welcome-overlay p,.welcome-overlay h2{overflow-wrap:anywhere;word-break:normal;min-width:0}"+
    ".welcome-cta.alt{white-space:normal;line-height:1.15}}"+
    "@media (max-width:1024px) and (min-width:560px){.welcome-overlay{padding:10px 56px 8px 56px!important;align-items:center}}";
  document.head.appendChild(st);
  try{ window.AMIYO_EDITOR_BUILD="pr-step78-phone-welcome"; }catch(e){}
})();

;
/* ==================== Script 471 id="amiyo-pr-step79" ==================== */
/* Premiere step 79: Bug fix found in the audit. "YouTube chapters" and "Play around edit" both call projectEnd(), which only existed inside another script, so opening Chapters
   threw "projectEnd is not defined". projectEnd() is now a shared helper (end of the last clip on any track), so both tools open and work. */
(function(){
  "use strict";
  if(typeof window.projectEnd!=="function"){
    window.projectEnd=function(){ var e=0; try{ (project.tracks||[]).forEach(function(t){ (t.clips||[]).forEach(function(c){ e=Math.max(e,(c.start||0)+(c.duration||0)); }); }); }catch(x){} return e; };
  }
  try{ window.AMIYO_EDITOR_BUILD="pr-step79-projectend-fix"; }catch(e){}
})();

;
/* ==================== Script 472 id="amiyo-pr-step80" ==================== */
/* Premiere step 80: Trim by frames. Precise slip / slide / roll for phones where dragging a handle is hard. Choose 1, 5 or 10 frames and tap a direction.
   Slip = change which part of the source plays (clip stays put). Slide = move the clip and let its neighbours absorb the change. Roll = move the cut between this clip and the next.
   Each tap is one undo step. Open it from Pr tools: Trim by frames. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  var N=1;
  function fps(){ return (project.settings&&project.settings.fps)||30; }
  function sp(c){ return c.speed||1; }
  function out(c){ return c.outPoint==null?(c.inPoint||0)+c.duration*sp(c):c.outPoint; }
  function srcLen(c){ var a=(project.assets||{})[c.assetId]; return a&&a.duration?a.duration:Infinity; }
  function pair(f){
    var cl=(f.track.clips||[]).slice().sort(function(a,b){ return a.start-b.start; }), i=cl.indexOf(f.clip);
    var prev=cl[i-1], next=cl[i+1], e=.05;
    return {prev:prev&&Math.abs(prev.start+prev.duration-f.clip.start)<e?prev:null,next:next&&Math.abs(f.clip.start+f.clip.duration-next.start)<e?next:null};
  }
  function run(mode,dir){
    var S=kit.sel(); if(!S.length){ kit.say("Select a clip first"); return false; }
    var f=S[0], c=f.clip, d=dir*N/fps(), MIN=1/fps(), P=pair(f), ok=true, msg="";
    if(f.track.locked){ kit.say("Track is locked"); return false; }
    var r=kit.edit("Trim "+mode+" "+(dir>0?"+":"-")+N+"f",function(){
      if(mode==="slip"){
        var ni=(c.inPoint||0)+d*sp(c), no=out(c)+d*sp(c);
        if(ni<0||no>srcLen(c)+1e-6){ msg="No more source to slip into"; return false; }
        c.inPoint=ni; c.outPoint=no;
      } else if(mode==="slide"){
        if(!P.prev||!P.next){ msg="Slide needs a clip on each side with no gap"; return false; }
        if(c.start+d<P.prev.start+MIN||P.next.duration-d<MIN||P.prev.duration+d<MIN){ msg="Neighbour is too short"; return false; }
        var pn=P.next, pp=P.prev;
        if((pn.inPoint||0)+d*sp(pn)<0||out(pp)+d*sp(pp)>srcLen(pp)+1e-6){ msg="Neighbour has no spare footage"; return false; }
        c.start+=d; pp.duration+=d; pp.outPoint=out(pp)+d*sp(pp);
        pn.start+=d; pn.duration-=d; pn.inPoint=(pn.inPoint||0)+d*sp(pn);
      } else if(mode==="roll"){
        if(!P.next){ msg="Roll needs a following clip with no gap"; return false; }
        var nx=P.next;
        if(c.duration+d<MIN||nx.duration-d<MIN){ msg="Clip would become too short"; return false; }
        if(out(c)+d*sp(c)>srcLen(c)+1e-6||(nx.inPoint||0)+d*sp(nx)<0){ msg="No spare footage at the cut"; return false; }
        c.duration+=d; c.outPoint=out(c)+d*sp(c);
        nx.start+=d; nx.duration-=d; nx.inPoint=(nx.inPoint||0)+d*sp(nx);
      } else if(mode==="out"){
        if(c.duration+d<MIN||out(c)+d*sp(c)>srcLen(c)+1e-6){ msg="Cannot trim there"; return false; }
        c.duration+=d; c.outPoint=out(c)+d*sp(c);
      } else if(mode==="in"){
        var nd=c.duration-d; if(nd<MIN||(c.inPoint||0)+d*sp(c)<0){ msg="Cannot trim there"; return false; }
        c.start+=d; c.duration=nd; c.inPoint=(c.inPoint||0)+d*sp(c);
      }
    });
    if(r===false){ kit.say(msg||"Not possible"); return false; }
    return true;
  }
  var sh=kit.sheet("akFrameTrim","↔ Trim by frames",function(){
    var S=kit.sel(), h='<div class="note">'+(S.length?"Selected: "+kit.esc(S[0].clip.name||"clip"):"Select a clip first.")+'</div><h5>Step size</h5><div class="g" style="grid-template-columns:repeat(3,1fr)">';
    [1,5,10].forEach(function(n){ h+='<button type="button" data-k="n:'+n+'" style="'+(N===n?"border-color:#ff7a3d;color:#ffb454":"")+'">'+n+' frame'+(n>1?"s":"")+'</button>'; });
    h+='</div>';
    [["slip","Slip (change source, clip stays)"],["slide","Slide (move clip between neighbours)"],["roll","Roll (move cut to next clip)"],["in","Trim start (ripple in)"],["out","Trim end"]].forEach(function(m){
      h+='<h5>'+m[1]+'</h5><div class="g"><button type="button" data-k="'+m[0]+':-1">← '+N+'f earlier</button><button type="button" data-k="'+m[0]+':1">'+N+'f later →</button></div>';
    });
    return h;
  },function(k,b,api){
    var p=k.split(":");
    if(p[0]==="n"){ N=+p[1]; api.paint(); return; }
    if(run(p[0],+p[1])) api.paint();
  });
  window.amiyoFrameTrim={open:sh.open,run:run,setStep:function(n){ N=n; }};
  kit.menu("↔ Trim by frames",sh.open,"Trim by frames","amiyoFrameTrim.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step80-trim-frames"; }catch(e){}
})();

;
/* ==================== Script 473 id="amiyo-pr-step81" ==================== */
/* Premiere step 81: Export frame (and a fix: timecode display was silently falling back to seconds in Info and other tools). Saves the picture currently showing in the preview (the frame under the playhead) as a PNG or JPG file, named with its timecode.
   Premiere's "Export Frame" button. Good for thumbnails and posters. Open it from Pr tools: Export frame. Shortcut: Ctrl+Shift+E. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  var last=null;
  /* frameToTimecode lived inside another script, so Info, Pr tools and others silently fell back to plain seconds. Now shared. */
  if(typeof window.frameToTimecode!=="function"){
    window.frameToTimecode=function(sec){
      var fps=(project.settings&&project.settings.fps)||30, tot=Math.max(0,Math.floor((sec||0)*fps+1e-6)), p=function(n){ return String(n).padStart(2,"0"); };
      return p(Math.floor(tot/fps/3600))+":"+p(Math.floor(tot/fps/60)%60)+":"+p(Math.floor(tot/fps)%60)+":"+p(tot%fps);
    };
  }
  function name(ext){
    if(window.amiyoFrameFileName) return window.amiyoFrameFileName(ext,currentTime);
    var tc="frame"; try{ tc=frameToTimecode(currentTime).replace(/:/g,"-"); }catch(e){}
    var p=(project&&project.metadata&&project.metadata.name)||"video"; return String(p).replace(/[^\w\-]+/g,"_").slice(0,40)+"_"+tc+"."+ext;
  }
  function save(type){
    var cv=document.getElementById("previewCanvas"); if(!cv){ kit.say("No preview to save"); return false; }
    if(window.amiyoSomethingAtPlayhead&&!window.amiyoSomethingAtPlayhead()){ kit.say("Nothing is showing at the playhead (a gap or past the end). Move it onto a clip first."); return false; }
    var ext=type==="jpg"?"jpg":"png", mime=type==="jpg"?"image/jpeg":"image/png";
    function go(){
      try{
        cv.toBlob(function(bl){
          if(!bl){ kit.say("Could not read the frame"); return; }
          var a=document.createElement("a"), u=URL.createObjectURL(bl); a.href=u; a.download=name(ext); document.body.appendChild(a); a.click();
          setTimeout(function(){ URL.revokeObjectURL(u); a.remove(); },1500);
          last={name:a.download,size:bl.size,type:mime};
          kit.say("Saved "+a.download+" ("+Math.round(bl.size/1024)+" KB)");
        },mime,.92);
      }catch(e){ kit.say("Could not save the frame"); }
    }
    var p; try{ p=(window.__amiyoExactFrame||renderPreviewFrame)(); }catch(e){}   /* export step 9: full quality and the exact video picture */
    if(p&&p.then) p.then(go,go); else go();
    return true;
  }
  var sh=kit.sheet("akFrame","🖼 Export frame",function(){
    var cv=document.getElementById("previewCanvas"), t="";
    try{ t=frameToTimecode(currentTime); }catch(e){}
    return '<div class="note">Saves what the preview shows now ('+t+')'+(cv?", "+cv.width+" x "+cv.height+" px":"")+'.</div><div class="g"><button type="button" data-k="png">Save PNG (best quality)</button><button type="button" data-k="jpg">Save JPG (smaller)</button></div>'+
      (last?'<div class="note">Last saved: '+kit.esc(last.name)+'</div>':"");
  },function(k,b,api){ save(k); setTimeout(api.paint,400); });
  document.addEventListener("keydown",function(e){
    if(!(e.ctrlKey||e.metaKey)||!e.shiftKey||(e.key!=="E"&&e.key!=="e")) return;
    var t=e.target&&e.target.tagName; if(t==="INPUT"||t==="TEXTAREA"||t==="SELECT"||(e.target&&e.target.isContentEditable)) return;
    e.preventDefault(); e.stopImmediatePropagation(); if(typeof window.amiyoSaveFrame==="function") window.amiyoSaveFrame(); else save("png");   /* Step 4: use the format chosen in Export (PNG / JPEG / WebP) */
  },true);
  window.amiyoExportFrame={open:sh.open,save:save};
  kit.menu("🖼 Export frame",sh.open,"Export frame","amiyoExportFrame.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step81-export-frame"; }catch(e){}
})();

;
/* ==================== Script 474 id="amiyo-pr-step82" ==================== */
/* Premiere step 82: Replace footage. Swap the media behind clips without rebuilding the edit. Select a clip, pick another file from the project, and choose to replace
   just the selected clips or every clip that uses the same media. In/out, effects, speed and keyframes are kept; if the new file is shorter, the clip is trimmed to fit.
   One undo step. Open it from Pr tools: Replace footage. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function nm(a){ return (a&&(a.name||a.filename||a.id))||"media"; }
  function compat(k,a){ var t=(a.type||a.kind||"").split("/")[0]; var want=k==="audio"?"audio":(k==="image"?"image":"video"); return !t||t===want||(want==="video"&&t==="image")||(want==="image"&&t==="video"); }
  function run(fromId,toId,scope){
    var A=project.assets||{}, to=A[toId]; if(!to||!A[fromId]||fromId===toId){ kit.say("Pick a different file"); return false; }
    var hit=scope==="all"?kit.all().filter(function(x){ return x.clip.assetId===fromId; }):kit.sel().filter(function(x){ return x.clip.assetId===fromId; });
    if(!hit.length){ kit.say("No matching clips"); return false; }
    var trimmed=0;
    var r=kit.edit("Replace footage",function(){
      hit.forEach(function(x){
        var c=x.clip; c.assetId=toId; if(c.name&&c.name===nm(A[fromId])) c.name=nm(to);
        var L=to.duration; if(L&&isFinite(L)){
          var ip=Math.min(c.inPoint||0,Math.max(0,L-.1)), sp=c.speed||1, avail=(L-ip)/sp;
          c.inPoint=ip; if(c.duration>avail+1e-6){ c.duration=Math.max(.1,avail); trimmed++; }
          c.outPoint=ip+c.duration*sp;
        }
      });
    });
    if(r!==false) kit.say("Replaced "+hit.length+" clip"+(hit.length>1?"s":"")+(trimmed?" ("+trimmed+" trimmed to fit)":""));
    return r;
  }
  var from=null;
  var sh=kit.sheet("akReplace","⇄ Replace footage",function(){
    var S=kit.sel(), A=project.assets||{}; from=S.length&&S[0].clip.assetId&&A[S[0].clip.assetId]?S[0].clip.assetId:null;
    if(!from) return '<div class="note">Select a clip that uses a media file first.</div>';
    var n=kit.all().filter(function(x){ return x.clip.assetId===from; }).length, k=S[0].clip.kind||S[0].track.kind;
    var h='<div class="note">Current: <b>'+kit.esc(nm(A[from]))+'</b> ('+n+' clip'+(n>1?"s":"")+' use it). Tap the new file, then choose how many clips to change.</div>';
    Object.keys(A).filter(function(id){ return id!==from&&compat(k,A[id]); }).forEach(function(id){
      var d=A[id].duration; h+='<div style="display:flex;gap:6px"><button type="button" data-k="one:'+id+'" style="flex:1;text-align:left">'+kit.esc(nm(A[id]))+(d?' <small style="color:#8f8777">'+d.toFixed(1)+' s</small>':'')+'<small style="display:block;font-size:10px;color:#8f8777">selected clips only</small></button><button type="button" data-k="all:'+id+'" style="min-width:92px">All '+n+'</button></div>';
    });
    if(Object.keys(A).length<2) h+='<div class="note">Import another file first.</div>';
    return h;
  },function(k,b,api){
    var p=k.split(":"), id=p.slice(1).join(":");
    if(run(from,id,p[0])!==false) api.close();
  });
  window.amiyoReplace={open:sh.open,run:run};
  kit.menu("⇄ Replace footage",sh.open,"Replace footage","amiyoReplace.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step82-replace-footage"; }catch(e){}
})();

;
/* ==================== Script 475 id="amiyo-pr-step83" ==================== */
/* Premiere step 83: Wide timeline on phones. On a 390 px phone the track header column took 200 px, leaving only about 190 px for the clips (labels showed "D..."). The slim header mode
   shrinks it to 100 px (buttons stay 36 px with a bigger invisible tap area) so the timeline gets about 290 px, 50% more room. It is on by default on narrow phones and can be switched in
   Pr tools: Wide timeline. Large 44 px buttons are still available by switching it off. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  var KEY="amiyoSlimTrk", root=document.documentElement;
  function narrow(){ try{ return window.matchMedia("(max-width:560px)").matches; }catch(e){ return false; } }
  function get(){ var v=null; try{ v=localStorage.getItem(KEY); }catch(e){} return v==null?narrow():v==="1"; }
  function put(v){ try{ localStorage.setItem(KEY,v?"1":"0"); }catch(e){} }
  var st=document.createElement("style"); st.id="amiyoPr83css";
  st.textContent="html.amiyo-slimtrk{--label-w:100px!important}"+
    "html.amiyo-slimtrk body .track-row{height:112px!important}"+
    "html.amiyo-slimtrk body .track-label{flex-wrap:wrap!important;align-content:flex-start!important;overflow:hidden}"+
    "html.amiyo-slimtrk body .track-label{column-gap:3px!important;row-gap:3px!important;padding-left:4px!important;padding-right:3px!important}"+
    "html.amiyo-slimtrk body .track-label>span:not(.type){flex:1 1 calc(100% - 38px)!important;max-width:calc(100% - 38px);min-width:0;font-size:11px!important;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"+
    "html.amiyo-slimtrk body .track-hbtns{display:grid!important;grid-template-columns:1fr 1fr!important;gap:3px!important;width:100%!important;flex:1 1 100%!important}"+
    "html.amiyo-slimtrk body .thtn{width:100%!important;min-width:0!important;height:30px!important;font-size:12px}"+
    "html.amiyo-slimtrk body .thtn::after{inset:-3px!important}"+
    "html.amiyo-slimtrk body .trk-dots{width:30px!important;height:28px!important;font-size:16px}"+
    "html.amiyo-slimtrk body .trk-dots::after{inset:-4px!important}";
  document.head.appendChild(st);
  function apply(on){
    root.classList.toggle("amiyo-slimtrk",!!on);
    try{ renderAll(); }catch(e){}
  }
  if(get()) root.classList.add("amiyo-slimtrk");
  var sh=kit.sheet("akSlim","↔ Wide timeline",function(){
    var on=root.classList.contains("amiyo-slimtrk");
    return '<div class="note">Slim track headers give the clips more room on a phone. Currently <b>'+(on?"ON":"OFF")+'</b> (header '+Math.round(parseFloat(getComputedStyle(root).getPropertyValue("--label-w"))||0)+' px).</div>'+
      '<button type="button" data-k="'+(on?"off":"on")+'">'+(on?"Switch off (large 44 px buttons)":"Switch on (wide timeline)")+'</button>';
  },function(k,b,api){ put(k==="on"); apply(k==="on"); api.paint(); });
  window.amiyoSlimTracks={open:sh.open,set:function(v){ put(!!v); apply(!!v); }};
  kit.menu("↔ Wide timeline",sh.open,"Wide timeline","amiyoSlimTracks.open()");
  if(root.classList.contains("amiyo-slimtrk")) setTimeout(function(){ try{ renderAll(); }catch(e){} },300);
  try{ window.AMIYO_EDITOR_BUILD="pr-step83-wide-timeline"; }catch(e){}
})();

;
/* ==================== Script 476 id="amiyo-pr-step84" ==================== */
/* Premiere step 84: Search and recents in the Pr tools menu. The "More" list in Pr tools had grown past 40 buttons with no order. It now has a search box (type "gap", "speed", "marker"...)
   and a "Recent" row with the five tools you used last, remembered on this device. Open it from the Pr tools button. */
(function(){
  "use strict";
  var KEY="amiyoPrRecent", T=window.amiyoPrTools; if(!T||T.__s84) return; T.__s84=1;
  function $(id){ return document.getElementById(id); }
  function rd(){ try{ var a=JSON.parse(localStorage.getItem(KEY)||"[]"); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
  function wr(a){ try{ localStorage.setItem(KEY,JSON.stringify(a.slice(0,5))); }catch(e){} }
  function plain(s){ return String(s||"").replace(/^[^\w]+/,"").trim(); }
  var o=T.open;
  T.open=function(){
    o.apply(this,arguments);
    var sh=$("prToolsSheet"), wrap=$("prMoreWrap"); if(!sh||!wrap) return;
    var g=wrap.querySelector(".g"); if(!g) return;
    var btns=[].slice.call(g.querySelectorAll("button[data-more]"));
    var old=$("prSearchWrap"); if(old) old.remove();
    var rec=rd().map(function(l){ return btns.filter(function(b){ return b.firstChild&&b.firstChild.textContent===l; })[0]; }).filter(Boolean);
    var d=document.createElement("div"); d.id="prSearchWrap";
    d.innerHTML='<input id="prSearchIn" type="search" placeholder="Search '+btns.length+' tools (gap, speed, marker...)" aria-label="Search tools" style="margin:4px 0 6px"><div id="prSearchNone" class="note" style="display:none">No tool matches.</div>'+
      (rec.length?'<h5>Recent</h5><div class="g" id="prRecentG"></div>':'');
    wrap.insertBefore(d,g);
    var rg=$("prRecentG"); if(rg) rec.forEach(function(b){ rg.appendChild(b.cloneNode(true)); });
    var inp=$("prSearchIn");
    inp.oninput=function(){
      var q=plain(inp.value).toLowerCase(), n=0;
      btns.forEach(function(b){ var hit=!q||b.textContent.toLowerCase().indexOf(q)>=0; b.style.display=hit?"":"none"; if(hit) n++; });
      var none=$("prSearchNone"); if(none) none.style.display=n?"none":"block";
      if(rg){ rg.style.display=q?"none":""; var h=rg.previousElementSibling; if(h) h.style.display=q?"none":""; }
    };
  };
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("#prToolsSheet button[data-more]"); if(!b||!b.firstChild) return;
    var l=b.firstChild.textContent; if(!l) return;
    var a=rd().filter(function(x){ return x!==l; }); a.unshift(l); wr(a);
  },true);
  window.amiyoPrRecent={get:rd,clear:function(){ wr([]); }};
  try{ window.AMIYO_EDITOR_BUILD="pr-step84-tool-search"; }catch(e){}
})();

;
/* ==================== Script 477 id="amiyo-pr-step85" ==================== */
/* Premiere step 85: Batch properties. Set the same opacity, scale, rotation, volume or speed on every selected clip at once, with typed numbers instead of sliders. Leave a box empty to keep
   that property as it is. Speed changes the clip length to match (the source part stays the same). One undo step. Open it from Pr tools: Batch properties. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  var FIELDS=[["opacity","Opacity %",0,100,100],["scale","Scale %",1,500,100],["rotation","Rotation °",-360,360,0],["volume","Volume %",0,300,100],["speed","Speed x",.1,8,1]];
  function apply(v){
    var S=kit.sel(); if(!S.length){ kit.say("Select clips first"); return false; }
    var any=Object.keys(v).some(function(k){ return v[k]!=null; }); if(!any){ kit.say("Type a value in at least one box"); return false; }
    var n=0;
    var r=kit.edit("Batch properties",function(){
      S.forEach(function(x){
        var c=x.clip; if(x.track.locked) return; n++;
        if(v.opacity!=null) c.opacity=v.opacity/100;
        if(v.scale!=null) c.scale=v.scale/100;
        if(v.rotation!=null) c.rotation=v.rotation;
        if(v.volume!=null) c.volume=v.volume/100;
        if(v.speed!=null&&(x.track.kind==="video"||x.track.kind==="audio")){
          var old=c.speed||1, src=c.duration*old; c.speed=v.speed; c.duration=Math.max(.1,src/v.speed);
          if(c.outPoint!=null&&c.inPoint!=null) c.outPoint=c.inPoint+src;
        }
      });
      if(!n) return false;
    });
    if(r!==false) kit.say("Updated "+n+" clip"+(n>1?"s":""));
    return r;
  }
  function read(){
    var v={}; FIELDS.forEach(function(f){ var el=document.getElementById("akBp_"+f[0]); if(!el||el.value==="") return; var n=parseFloat(el.value); if(isFinite(n)) v[f[0]]=Math.min(f[3],Math.max(f[2],n)); });
    return v;
  }
  var sh=kit.sheet("akBatch","☰ Batch properties",function(){
    var n=kit.sel().length, h='<div class="note">'+(n?n+" clip"+(n>1?"s":"")+" selected. Empty boxes are left unchanged.":"Select one or more clips first.")+'</div>';
    FIELDS.forEach(function(f){ h+='<label>'+f[1]+' (default '+f[4]+')<input id="akBp_'+f[0]+'" type="number" inputmode="decimal" min="'+f[2]+'" max="'+f[3]+'" step="any" placeholder="unchanged"></label>'; });
    return h+'<button type="button" data-k="go" style="background:#ff7a3d;color:#14120f;font-weight:700">Apply to '+(n||"selected")+' clip'+(n===1?"":"s")+'</button>';
  },function(k,b,api){ if(k==="go"&&apply(read())!==false) api.close(); });
  window.amiyoBatchProps={open:sh.open,apply:apply};
  kit.menu("☰ Batch properties",sh.open,"Batch properties","amiyoBatchProps.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step85-batch-properties"; }catch(e){}
})();

;
/* ==================== Script 478 id="amiyo-pr-step86" ==================== */
/* Premiere step 86: Clips by length. Find clips that are too short (accidental slivers left after cutting) or too long. Type a length in seconds, then select every clip shorter or longer than it,
   or delete the short ones and close the gaps (ripple) in one undo step. Open it from Pr tools: Clips by length. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  var LEN=0.5;
  function list(mode){ return kit.all().filter(function(x){ return !x.track.locked&&(mode==="short"?x.clip.duration<LEN-1e-6:x.clip.duration>LEN+1e-6); }); }
  function select(mode){
    var L=list(mode); if(!L.length){ kit.say("No clips "+(mode==="short"?"shorter":"longer")+" than "+LEN+" s"); return false; }
    try{ clearMultiSelection(); }catch(e){}
    L.forEach(function(x){ x.clip.selected=true; }); selectedClipId=L[0].clip.id; selectedTrackId=L[0].track.id;
    try{ renderAll(); }catch(e){} kit.say(L.length+" clip"+(L.length>1?"s":"")+" selected"); return true;
  }
  function removeShort(){
    var L=list("short"); if(!L.length){ kit.say("No clips shorter than "+LEN+" s"); return false; }
    var ids={}; L.forEach(function(x){ ids[x.clip.id]=1; });
    var r=kit.edit("Delete short clips",function(){
      (project.tracks||[]).forEach(function(t){
        if(t.locked) return;
        var cl=(t.clips||[]).slice().sort(function(a,b){ return a.start-b.start; }), shift=0, keep=[];
        cl.forEach(function(c){
          if(ids[c.id]){ shift+=c.duration; return; }
          c.start=Math.max(0,c.start-shift); keep.push(c);
        });
        t.clips=keep;
      });
      try{ selectedClipId=null; }catch(e){}
    });
    if(r!==false) kit.say("Deleted "+L.length+" short clip"+(L.length>1?"s":"")+" and closed the gaps");
    return r;
  }
  var sh=kit.sheet("akLen","⏱ Clips by length",function(){
    var s=list("short").length, l=list("long").length, A=kit.all();
    var lens=A.map(function(x){ return x.clip.duration; }).sort(function(a,b){ return a-b; });
    return '<div class="note">'+A.length+' clips. Shortest '+(lens.length?lens[0].toFixed(2):"-")+' s, longest '+(lens.length?lens[lens.length-1].toFixed(1):"-")+' s.</div>'+
      '<label>Length limit (seconds)<input id="akLenIn" type="number" inputmode="decimal" min="0.05" step="0.05" value="'+LEN+'"></label>'+
      '<div class="g"><button type="button" data-k="selS">Select shorter ('+s+')</button><button type="button" data-k="selL">Select longer ('+l+')</button></div>'+
      '<button type="button" data-k="del" style="'+(s?"":"opacity:.5")+'">Delete the '+s+' short clip'+(s===1?"":"s")+' and close gaps</button>'+
      '<div class="note">Clips on locked tracks are never touched.</div>';
  },function(k,b,api){
    var el=document.getElementById("akLenIn"), v=el?parseFloat(el.value):LEN; if(isFinite(v)&&v>0) LEN=v;
    if(k==="selS"){ if(select("short")) api.close(); else api.paint(); }
    else if(k==="selL"){ if(select("long")) api.close(); else api.paint(); }
    else if(k==="del"){ removeShort(); api.paint(); }
  });
  window.amiyoClipLen={open:sh.open,setLimit:function(v){ LEN=v; },select:select,removeShort:removeShort};
  kit.menu("⏱ Clips by length",sh.open,"Clips by length","amiyoClipLen.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step86-clips-by-length"; }catch(e){}
})();

;
/* ==================== Script 479 id="amiyo-pr-step87" ==================== */
/* Premiere step 87: Repeat and divide clips. "Repeat" lays the selected clip end to end N more times (loop a background, a beat, a logo sting); everything after it on the same track moves right to make room.
   "Divide" cuts the selected clip into N equal pieces (good for a quick montage or a slideshow rhythm). Both are one undo step. Open it from Pr tools: Repeat / divide clip. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  var N=2;
  function copy(c,start){ var r=deepClone(c); r.id=uid("clip"); r.start=start; r.selected=false; delete r.linkId; return r; }
  function sortedAfter(t,end,except){ return (t.clips||[]).filter(function(c){ return c!==except&&c.start>=end-.001; }); }
  function repeat(n){
    var S=kit.sel(); if(!S.length){ kit.say("Select a clip first"); return false; }
    var f=S[0], c=f.clip, t=f.track; if(t.locked){ kit.say("Track is locked"); return false; }
    var d=c.duration, end=c.start+d;
    var r=kit.edit("Repeat clip x"+n,function(){
      sortedAfter(t,end,c).forEach(function(x){ x.start+=d*n; });
      for(var i=1;i<=n;i++) t.clips.push(copy(c,c.start+d*i));
    });
    if(r!==false) kit.say("Added "+n+" copies");
    return r;
  }
  function divide(n){
    var S=kit.sel(); if(!S.length){ kit.say("Select a clip first"); return false; }
    var f=S[0], c=f.clip, t=f.track; if(t.locked){ kit.say("Track is locked"); return false; }
    if(n<2||c.duration/n<.1){ kit.say("Pieces would be shorter than 0.1 s"); return false; }
    var sp=c.speed||1, ip=c.inPoint||0, piece=c.duration/n, srcPiece=piece*sp, first=c.start;
    var r=kit.edit("Divide clip into "+n,function(){
      c.duration=piece; c.outPoint=ip+srcPiece;
      var idx=t.clips.indexOf(c);
      for(var i=1;i<n;i++){ var p=copy(c,first+piece*i); p.inPoint=ip+srcPiece*i; p.outPoint=ip+srcPiece*(i+1); delete p.transitionIn; t.clips.splice(idx+i,0,p); }
      delete c.transitionOut;
    });
    if(r!==false) kit.say("Divided into "+n+" pieces");
    return r;
  }
  var sh=kit.sheet("akRepeat","⧉ Repeat / divide clip",function(){
    var S=kit.sel(), c=S[0]&&S[0].clip;
    return '<div class="note">'+(c?"Selected: "+kit.esc(c.name||"clip")+", "+c.duration.toFixed(2)+" s":"Select a clip first.")+'</div>'+
      '<label>How many (2 to 50)<input id="akRepN" type="number" inputmode="numeric" min="2" max="50" value="'+N+'"></label>'+
      '<div class="g"><button type="button" data-k="rep">Repeat N more times</button><button type="button" data-k="div">Divide into N equal pieces</button></div>';
  },function(k,b,api){
    var el=document.getElementById("akRepN"), v=Math.round(parseFloat(el&&el.value)); if(isFinite(v)) N=Math.max(2,Math.min(50,v));
    var ok=k==="rep"?repeat(N):divide(N); if(ok!==false) api.close();
  });
  window.amiyoRepeat={open:sh.open,repeat:repeat,divide:divide};
  kit.menu("⧉ Repeat / divide clip",sh.open,"Repeat or divide clip","amiyoRepeat.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step87-repeat-divide"; }catch(e){}
})();

;
/* ==================== Script 480 id="amiyo-pr-step88" ==================== */
/* Premiere step 88: Clip outline. A scrolling list of every clip in the project in time order (start time, track, name, length). Tap one to jump the playhead to it and select it, which is much quicker
   than swiping along a long timeline on a phone. A filter box narrows the list by name or track. Open it from Pr tools: Clip outline. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  var Q="";
  function tc(t){ try{ return frameToTimecode(t); }catch(e){ return t.toFixed(1)+"s"; } }
  function nameOf(x){ var c=x.clip, a=(project.assets||{})[c.assetId]; return c.name||c.text||(a&&(a.name||a.filename))||c.kind||x.track.kind||"clip"; }
  function rows(){
    var q=Q.trim().toLowerCase();
    return kit.all().map(function(x){ x.n=String(nameOf(x)); return x; }).filter(function(x){ return !q||(x.n+" "+(x.track.name||x.track.kind)).toLowerCase().indexOf(q)>=0; })
      .sort(function(a,b){ return a.clip.start-b.clip.start||0; });
  }
  function jump(id){
    var hit=kit.all().filter(function(x){ return x.clip.id===id; })[0]; if(!hit) return false;
    try{ clearMultiSelection(); }catch(e){}
    hit.clip.selected=true; selectedClipId=hit.clip.id; selectedTrackId=hit.track.id;
    try{ setCurrentTime(hit.clip.start); }catch(e){}
    try{ renderAll(); }catch(e){}
    try{ if(window.amiyoX&&window.amiyoX.zoomToClip) window.amiyoX.zoomToClip(); }catch(e){}
    return true;
  }
  var sh=kit.sheet("akOutline","☰ Clip outline",function(){
    var R=rows(), all=kit.all().length;
    var h='<input id="akOutQ" type="search" placeholder="Filter by name or track" value="'+kit.esc(Q)+'" aria-label="Filter clips"><div class="note">'+R.length+' of '+all+' clips'+(R.length>120?" (showing first 120)":"")+'</div>';
    R.slice(0,120).forEach(function(x){
      var c=x.clip;
      h+='<button type="button" data-k="go:'+c.id+'" style="text-align:left;display:flex;gap:8px;align-items:center'+(c.selected?";border-color:#ff7a3d":"")+'"><span style="font:11px ui-monospace,monospace;color:#ffb454;flex:none">'+tc(c.start)+'</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+kit.esc(x.n)+'</span><small style="flex:none;color:#8f8777">'+kit.esc(x.track.name||x.track.kind)+' · '+c.duration.toFixed(1)+'s</small></button>';
    });
    return h;
  },function(k,b,api){
    if(k.indexOf("go:")===0){ if(jump(k.slice(3))) api.close(); }
  });
  document.addEventListener("input",function(e){
    if(!e.target||e.target.id!=="akOutQ") return;
    Q=e.target.value; var pos=e.target.selectionStart, s=sh; s.paint(); var el=document.getElementById("akOutQ"); if(el){ el.focus(); try{ el.setSelectionRange(pos,pos); }catch(x){} }
  });
  window.amiyoOutline={open:function(){ Q=""; sh.open(); },jump:jump,rows:rows};
  kit.menu("☰ Clip outline",window.amiyoOutline.open,"Clip outline","amiyoOutline.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step88-clip-outline"; }catch(e){}
})();

;
/* ==================== Script 481 id="amiyo-pr-step89" ==================== */
/* Premiere step 89: Pace analyzer. Looks at the video clips and reports how the edit "feels": number of cuts, average shot length, cuts per minute, the shortest and longest shot, and a bar chart of shot
   lengths. A plain-language verdict says whether it is fast, steady or slow, with a tip. Buttons jump to the longest shot or select all shots over 8 seconds. Read-only. Open it from Pr tools: Pace analyzer. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function shots(){
    var v=kit.all().filter(function(x){ return x.track.kind==="video"&&x.clip.kind!=="adjustment"&&x.clip.kind!=="text"; });
    return v.sort(function(a,b){ return a.clip.start-b.clip.start; });
  }
  function stats(){
    var S=shots(); if(!S.length) return null;
    var d=S.map(function(x){ return x.clip.duration; }), sum=d.reduce(function(a,b){ return a+b; },0), avg=sum/d.length;
    var min=Math.min.apply(null,d), max=Math.max.apply(null,d), end=0; S.forEach(function(x){ end=Math.max(end,x.clip.start+x.clip.duration); });
    var cpm=end>0?(S.length-1)/(end/60):0;
    var B=[[0,1,"< 1 s"],[1,2,"1-2 s"],[2,4,"2-4 s"],[4,8,"4-8 s"],[8,15,"8-15 s"],[15,1e9,"15 s +"]].map(function(b){ return {l:b[2],n:d.filter(function(x){ return x>=b[0]&&x<b[1]; }).length}; });
    var verdict, tip;
    if(avg<2){ verdict="Very fast (music-video / trailer pace)"; tip="Great for energy. Make sure key moments get a longer shot so viewers can follow."; }
    else if(avg<4){ verdict="Fast (social video pace)"; tip="Good for Reels and Shorts. Add a slightly longer shot every few cuts to let it breathe."; }
    else if(avg<8){ verdict="Steady (typical vlog / documentary)"; tip="Comfortable pace. Trim the longest shots by a second to tighten it."; }
    else { verdict="Slow (calm / cinematic)"; tip="Works for scenic or interview content. For short-form, consider cutting long shots or adding B-roll."; }
    return {S:S,n:S.length,avg:avg,min:min,max:max,total:end,cpm:cpm,B:B,verdict:verdict,tip:tip};
  }
  function jumpLongest(){
    var s=stats(); if(!s){ kit.say("No video clips"); return false; }
    var L=s.S.slice().sort(function(a,b){ return b.clip.duration-a.clip.duration; })[0];
    try{ clearMultiSelection(); }catch(e){} L.clip.selected=true; selectedClipId=L.clip.id; selectedTrackId=L.track.id;
    try{ setCurrentTime(L.clip.start); renderAll(); }catch(e){} kit.say("Longest shot: "+L.clip.duration.toFixed(1)+" s"); return true;
  }
  function selectLong(limit){
    var s=stats(); if(!s) return false; var L=s.S.filter(function(x){ return x.clip.duration>limit; });
    if(!L.length){ kit.say("No shots longer than "+limit+" s"); return false; }
    try{ clearMultiSelection(); }catch(e){} L.forEach(function(x){ x.clip.selected=true; }); selectedClipId=L[0].clip.id; selectedTrackId=L[0].track.id;
    try{ renderAll(); }catch(e){} kit.say(L.length+" long shot"+(L.length>1?"s":"")+" selected"); return true;
  }
  function row(a,b){ return '<div style="display:flex;justify-content:space-between;border-bottom:1px solid #26231e;padding:5px 0"><span style="color:#8f8777">'+a+'</span><b>'+b+'</b></div>'; }
  var sh=kit.sheet("akPace","⏱ Pace analyzer",function(){
    var s=stats(); if(!s) return '<div class="note">No video clips yet.</div>';
    var mx=Math.max.apply(null,s.B.map(function(b){ return b.n; }))||1, h='<div style="font-size:14px;font-weight:700;color:#ffb454">'+s.verdict+'</div><div class="note">'+s.tip+'</div>';
    h+=row("Shots",s.n)+row("Average shot",s.avg.toFixed(1)+" s")+row("Cuts per minute",s.cpm.toFixed(1))+row("Shortest / longest",s.min.toFixed(1)+" s / "+s.max.toFixed(1)+" s")+row("Video length",s.total.toFixed(1)+" s");
    h+='<h5>Shot lengths</h5>';
    s.B.forEach(function(b){ h+='<div style="display:flex;align-items:center;gap:8px;font-size:11px"><span style="width:52px;color:#8f8777">'+b.l+'</span><span style="height:12px;border-radius:3px;background:#ff7a3d;width:'+Math.round(b.n/mx*100)*0.62+'%;min-width:'+(b.n?3:0)+'px"></span><span>'+b.n+'</span></div>'; });
    return h+'<div class="g" style="margin-top:6px"><button type="button" data-k="long">Jump to longest shot</button><button type="button" data-k="over8">Select shots over 8 s</button></div>';
  },function(k,b,api){ if(k==="long"){ if(jumpLongest()) api.close(); } else if(k==="over8"){ if(selectLong(8)) api.close(); } });
  window.amiyoPace={open:sh.open,stats:stats,jumpLongest:jumpLongest,selectLong:selectLong};
  kit.menu("⏱ Pace analyzer",sh.open,"Pace analyzer","amiyoPace.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step89-pace-analyzer"; }catch(e){}
})();

;
/* ==================== Script 482 id="amiyo-pr-step90" ==================== */
/* Premiere step 90: Export markers. Saves every marker as a CSV file (opens in Excel / Sheets: name, time in seconds, timecode, colour, length of a range marker, chapter yes/no) or an SRT subtitle-style file, or copies a plain
   "0:00 Intro" list to the clipboard. Handy for hand-offs and for pasting into a video description. Open it from Pr tools: Export markers.
   Export plan step 12: timecode follows the project rate (drop-frame at 29.97), the list writes 1:01:40 (not 61:40) after an hour, markers after the end of the edit stay out of the SRT and the list,
   a range marker keeps its own length in the SRT, beat markers are left out, CSV has a byte-order mark, and the file name is the project name like every other export. */
(function(){
  "use strict";
  var kit=window.amiyoKit, X=window.amiyoExportLists; if(!kit||!X) return;
  function M(){ return X.markers(); }
  function inside(){ var e=X.end(); return M().filter(function(m){ return !e||m.time<e-.04; }); }
  function srtT(t){ var ms=Math.round(Math.max(0,t)*1000), p=function(n,l){ return String(n).padStart(l||2,"0"); }; return p(Math.floor(ms/3600000))+":"+p(Math.floor(ms/60000)%60)+":"+p(Math.floor(ms/1000)%60)+","+p(ms%1000,3); }
  function csv(){ var r=["name,seconds,timecode,color,duration_seconds,chapter"]; M().forEach(function(m){ r.push([X.cell(X.oneLine(m.label,"Marker")),(+m.time).toFixed(3),X.tc(m.time),X.cell(m.color||""),(m.dur>0?(+m.dur).toFixed(3):""),m.chapter?"yes":""].join(",")); }); return r.join("\r\n")+"\r\n"; }
  function srt(){ var L=inside(), end=X.end(), out=[];
    L.forEach(function(m,i){ var e=(m.dur>0)?m.time+m.dur:(i+1<L.length?L[i+1].time:Math.max(m.time+2,end)); if(end) e=Math.min(e,end); e=Math.max(e,m.time+.5); out.push(m,e); });
    var rows=[]; for(var i=0;i<out.length;i+=2) rows.push((i/2+1)+"\r\n"+srtT(out[i].time)+" --> "+srtT(out[i+1])+"\r\n"+X.oneLine(out[i].label,"Marker")+"\r\n");
    return rows.join("\r\n"); }
  function list(){ return inside().map(function(m){ return X.hms(m.time)+" "+X.oneLine(m.label,"Marker"); }).join("\n"); }
  function save(text,ext,mime){ var name=X.base()+"-markers."+ext; X.save(name,text,mime); kit.say("Saved "+name); return name; }
  function run(k){
    if(!M().length){ kit.say("No markers yet. Add some first."); return false; }
    if(k==="csv") return save(csv(),"csv","text/csv");
    if(k==="srt"){ if(!inside().length){ kit.say("All markers are after the end of the edit, so there is nothing to put in an SRT."); return false; } return save(srt(),"srt","text/plain"); }
    if(k==="copy"){
      var t=list(); if(!t){ kit.say("All markers are after the end of the edit, so there is nothing to copy."); return false; }
      try{ navigator.clipboard.writeText(t).then(function(){ kit.say("Copied "+inside().length+" lines"); },function(){ kit.say("Copy blocked, use Save instead"); }); }catch(e){ kit.say("Copy not available"); }
      return t;
    }
  }
  var sh=kit.sheet("akMkExp","⇩ Export markers",function(){
    var n=M().length, b=X.beats(), late=n-inside().length;
    return '<div class="note">'+(n?n+" marker"+(n>1?"s":"")+" in the project."+(b?" "+b+" beat marker"+(b>1?"s are":" is")+" left out.":"")+(late?" "+late+" "+(late>1?"are":"is")+" after the end of the edit (CSV keeps "+(late>1?"them":"it")+"; SRT and the list do not).":""):"No markers yet. Press M in the timeline (or use Markers) to add some.")+'</div><button type="button" data-k="csv">Save as CSV (spreadsheet)</button><button type="button" data-k="srt">Save as SRT (subtitle-style)</button><button type="button" data-k="copy">Copy list "0:00 Name"</button>';
  },function(k){ run(k); });
  window.amiyoMarkerExport={open:sh.open,run:run,csv:csv,srt:srt,list:list};
  kit.menu("⇩ Export markers",sh.open,"Export markers","amiyoMarkerExport.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step90-export-markers"; }catch(e){}
})();

;
/* ==================== Script 483 id="amiyo-pr-step91" ==================== */
/* Premiere step 91: My shortcuts. Give any Pr tool your own keyboard shortcut (computer keyboards). Pick a tool, tap "Record", press a combination that includes Ctrl or Alt (so typing is never
   hijacked), and it runs that tool from then on. Shortcuts are saved on this device, a tool can have one key, and a key already used by one of your own shortcuts is refused. Remove any time. Open it from Pr tools: My shortcuts. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  var KEY="amiyoPrKeys", rec=null;
  function more(){ return window.__prMore||[]; }
  function rd(){ try{ var o=JSON.parse(localStorage.getItem(KEY)||"{}"); return o&&typeof o==="object"?o:{}; }catch(e){ return {}; } }
  function wr(o){ try{ localStorage.setItem(KEY,JSON.stringify(o)); }catch(e){} }
  function combo(e){
    var k=e.key; if(!k||["Control","Alt","Shift","Meta"].indexOf(k)>=0) return null;
    if(!(e.ctrlKey||e.metaKey||e.altKey)) return null;
    var p=[]; if(e.ctrlKey||e.metaKey) p.push("Ctrl"); if(e.altKey) p.push("Alt"); if(e.shiftKey) p.push("Shift");
    p.push(k.length===1?k.toUpperCase():k); return p.join("+");
  }
  function assign(label,c){
    var m=rd(), owner=Object.keys(m).filter(function(l){ return m[l]===c&&l!==label; })[0];
    if(owner){ kit.say(c+" is already used by "+owner); return false; }
    m[label]=c; wr(m); return true;
  }
  function remove(label){ var m=rd(); delete m[label]; wr(m); }
  var sh=kit.sheet("akMyKeys","⌨ My shortcuts",function(){
    var m=rd(), h='<div class="note">'+(rec?'Press the keys for <b>'+kit.esc(rec)+'</b> now (must include Ctrl or Alt). Esc cancels.':"Tap a tool, then press your keys. Computer keyboards only.")+'</div>';
    more().forEach(function(t,i){
      var c=m[t.l];
      h+='<div style="display:flex;gap:6px"><button type="button" data-k="rec:'+i+'" style="flex:1;text-align:left'+(rec===t.l?";border-color:#ff7a3d":"")+'">'+kit.esc(t.l)+'<small style="float:right;color:'+(c?"#ffb454":"#8f8777")+'">'+(rec===t.l?"press keys…":(c||"none"))+'</small></button>'+(c?'<button type="button" data-k="del:'+i+'" aria-label="Remove shortcut" style="min-width:46px">✕</button>':"")+'</div>';
    });
    return h;
  },function(k,b,api){
    var p=k.split(":"), t=more()[+p[1]]; if(!t) return;
    if(p[0]==="rec"){ rec=t.l; api.paint(); }
    else if(p[0]==="del"){ remove(t.l); api.paint(); }
  });
  document.addEventListener("keydown",function(e){
    var open=document.getElementById("akMyKeys"), recording=rec&&open&&open.style.display==="flex";
    if(recording){
      if(e.key==="Escape"){ e.preventDefault(); e.stopImmediatePropagation(); rec=null; sh.paint(); return; }
      var c=combo(e); if(!c) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if(assign(rec,c)) kit.say(rec+": "+c);
      rec=null; sh.paint(); return;
    }
    var c2=combo(e); if(!c2) return;
    var t=e.target&&e.target.tagName; if(t==="INPUT"||t==="TEXTAREA"||t==="SELECT"||(e.target&&e.target.isContentEditable)) return;
    var m=rd(), label=Object.keys(m).filter(function(l){ return m[l]===c2; })[0]; if(!label) return;
    var tool=more().filter(function(x){ return x.l===label; })[0]; if(!tool) return;
    e.preventDefault(); e.stopImmediatePropagation(); try{ tool.f(); }catch(x){ kit.say("That action failed"); }
  },true);
  window.amiyoKeys={open:function(){ rec=null; sh.open(); },get:rd,assign:assign,remove:remove,combo:combo};
  kit.menu("⌨ My shortcuts",window.amiyoKeys.open,"My shortcuts","amiyoKeys.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step91-my-shortcuts"; }catch(e){}
})();

;
/* ==================== Script 484 id="amiyo-pr-step92" ==================== */
/* Premiere step 92: Fill gaps by extending. Instead of sliding everything left (Close gap), this stretches the clip before each gap so it reaches the next clip, which keeps the rest of the edit
   exactly where it is (music and voice-over stay in sync). Works on the selected clips' tracks, or every unlocked video track. A clip can only extend as far as its source file allows (stills can
   extend forever); gaps that cannot be filled are skipped and counted. One undo step. Open it from Pr tools: Fill gaps. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function room(c){
    var a=(project.assets||{})[c.assetId], sp=c.speed||1;
    if(!a||!a.duration||!isFinite(a.duration)||a.type==="image"||c.kind==="text"||c.kind==="shape") return Infinity;
    var out=c.outPoint!=null?c.outPoint:(c.inPoint||0)+c.duration*sp; return Math.max(0,(a.duration-out)/sp);
  }
  function plan(scope){
    var tracks=(project.tracks||[]).filter(function(t){ return !t.locked&&t.kind==="video"; });
    if(scope==="sel"){ var ids={}; kit.sel().forEach(function(x){ ids[x.track.id]=1; }); tracks=tracks.filter(function(t){ return ids[t.id]; }); }
    var P=[], skipped=0, tiny=0.04;
    tracks.forEach(function(t){
      var cl=(t.clips||[]).slice().sort(function(a,b){ return a.start-b.start; });
      for(var i=0;i<cl.length-1;i++){
        var c=cl[i], n=cl[i+1], gap=n.start-(c.start+c.duration);
        if(gap<=tiny) continue;
        var r=room(c); if(r<gap-1e-6){ skipped++; if(r<=tiny) continue; P.push({c:c,add:r,partial:true}); continue; }
        P.push({c:c,add:gap});
      }
    });
    return {P:P,skipped:skipped};
  }
  function run(scope){
    var pl=plan(scope); if(!pl.P.length){ kit.say(scope==="sel"&&!kit.sel().length?"Select a clip first":"No gaps that can be filled"); return false; }
    var r=kit.edit("Fill gaps by extending",function(){
      pl.P.forEach(function(p){ var c=p.c, sp=c.speed||1; c.duration+=p.add; if(c.outPoint!=null) c.outPoint+=p.add*sp; });
    });
    if(r!==false) kit.say("Extended "+pl.P.length+" clip"+(pl.P.length>1?"s":"")+(pl.skipped?" ("+pl.skipped+" gap"+(pl.skipped>1?"s":"")+" only partly filled: not enough source)":""));
    return r;
  }
  var sh=kit.sheet("akFill","⬜ Fill gaps",function(){
    var a=plan("all"), s=plan("sel");
    return '<div class="note">Stretches the clip before a gap so it meets the next clip. Nothing else moves.</div>'+
      '<button type="button" data-k="all">All video tracks ('+a.P.length+' gap'+(a.P.length===1?"":"s")+')</button>'+
      '<button type="button" data-k="sel" style="'+(kit.sel().length?"":"opacity:.5")+'">Only tracks of selected clips ('+s.P.length+')</button>'+
      (a.skipped?'<div class="note">'+a.skipped+' gap'+(a.skipped>1?"s":"")+' cannot be fully filled (clip has no spare footage).</div>':"");
  },function(k,b,api){ if(run(k)!==false) api.close(); });
  window.amiyoFillGaps={open:sh.open,run:run,plan:plan};
  kit.menu("⬜ Fill gaps by extending",sh.open,"Fill gaps","amiyoFillGaps.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step92-fill-gaps"; }catch(e){}
})();

;
/* ==================== Script 485 id="amiyo-pr-step93" ==================== */
/* Premiere step 93: Send to track. Move or copy the selected clips to another track of the same kind, keeping their times exactly. If the target track already has a clip in the way, nothing is
   changed and you are told which track is busy. Locked tracks are not offered. One undo step. Open it from Pr tools: Send to track. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function overlaps(t,list,ignore){
    return list.some(function(c){ return (t.clips||[]).some(function(o){ return !ignore[o.id]&&c.start<o.start+o.duration-.001&&c.start+c.duration>o.start+.001; }); });
  }
  function run(trackId,copy){
    var S=kit.sel(); if(!S.length){ kit.say("Select clips first"); return false; }
    var T=(project.tracks||[]).filter(function(t){ return t.id===trackId; })[0]; if(!T||T.locked){ kit.say("That track is not available"); return false; }
    var kinds={}; S.forEach(function(x){ kinds[x.track.kind]=1; });
    if(Object.keys(kinds).length>1||!kinds[T.kind]){ kit.say("Pick a "+Object.keys(kinds)[0]+" track"); return false; }
    var mv=S.filter(function(x){ return x.track.id!==T.id; }); if(!mv.length){ kit.say("Already on that track"); return false; }
    var ignore={}; if(!copy) mv.forEach(function(x){ ignore[x.clip.id]=1; });
    if(overlaps(T,mv.map(function(x){ return x.clip; }),ignore)){ kit.say("Not enough free space on "+(T.name||T.kind)); return false; }
    if(!copy&&mv.some(function(x){ return x.track.locked; })){ kit.say("A source track is locked"); return false; }
    var r=kit.edit((copy?"Copy":"Move")+" to track",function(){
      mv.forEach(function(x){
        if(copy){ var r=deepClone(x.clip); r.id=uid("clip"); r.selected=false; delete r.linkId; T.clips.push(r); }
        else { x.track.clips.splice(x.track.clips.indexOf(x.clip),1); T.clips.push(x.clip); }
      });
    });
    if(r!==false) kit.say((copy?"Copied ":"Moved ")+mv.length+" clip"+(mv.length>1?"s":"")+" to "+(T.name||T.kind));
    return r;
  }
  var mode="move";
  var sh=kit.sheet("akSend","⇅ Send to track",function(){
    var S=kit.sel(), k=S[0]&&S[0].track.kind;
    var h='<div class="note">'+(S.length?S.length+" "+k+" clip"+(S.length>1?"s":"")+" selected.":"Select clips first.")+'</div>'+
      '<div class="g"><button type="button" data-k="m:move" style="'+(mode==="move"?"border-color:#ff7a3d;color:#ffb454":"")+'">Move</button><button type="button" data-k="m:copy" style="'+(mode==="copy"?"border-color:#ff7a3d;color:#ffb454":"")+'">Copy</button></div>';
    (project.tracks||[]).filter(function(t){ return S.length&&t.kind===k&&!t.locked; }).forEach(function(t){
      var here=S.every(function(x){ return x.track.id===t.id; });
      h+='<button type="button" data-k="to:'+t.id+'" style="text-align:left;'+(here?"opacity:.45":"")+'">'+kit.esc(t.name||t.kind)+' <small style="color:#8f8777">'+(t.clips||[]).length+' clips'+(here?" · current":"")+'</small></button>';
    });
    return h;
  },function(k,b,api){
    var p=k.split(":"), id=p.slice(1).join(":");
    if(p[0]==="m"){ mode=p[1]; api.paint(); } else if(p[0]==="to"){ if(run(id,mode==="copy")!==false) api.close(); }
  });
  window.amiyoSendTrack={open:sh.open,run:run};
  kit.menu("⇅ Send to track",sh.open,"Send to track","amiyoSendTrack.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step93-send-to-track"; }catch(e){}
})();

;
/* ==================== Script 486 id="amiyo-pr-step94" ==================== */
/* Premiere step 94: Swap neighbours. Select a clip and swap it with the clip before or after it on the same track (the order of two shots changes, the gap between them and everything else stays
   put, even if the clips are different lengths). Also works when you select exactly two neighbouring clips. Linked picture/sound pairs are not touched. One undo step.
   Open it from Pr tools: Swap neighbours. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function neighbour(f,dir){
    var cl=(f.track.clips||[]).slice().sort(function(a,b){ return a.start-b.start; }), i=cl.indexOf(f.clip), n=cl[i+dir];
    return n||null;
  }
  function swap(a,b){
    var first=a.start<=b.start?a:b, second=first===a?b:a, gap=second.start-(first.start+first.duration);
    var s0=first.start; second.start=s0; first.start=s0+second.duration+Math.max(0,gap);
    try{ delete first.transitionIn; delete first.transitionOut; delete second.transitionIn; delete second.transitionOut; }catch(e){}
  }
  function run(dir){
    var S=kit.sel(); if(!S.length){ kit.say("Select a clip first"); return false; }
    var f=S[0], other;
    if(S.length===2&&S[0].track.id===S[1].track.id){ other=S[1].clip; f={track:S[0].track,clip:S[0].clip}; }
    else other=neighbour(f,dir);
    if(!other){ kit.say(dir<0?"No clip before this one":"No clip after this one"); return false; }
    if(f.track.locked){ kit.say("Track is locked"); return false; }
    var cl=f.track.clips, lo=Math.min(f.clip.start,other.start), hi=Math.max(f.clip.start+f.clip.duration,other.start+other.duration);
    var between=cl.filter(function(c){ return c!==f.clip&&c!==other&&c.start<hi-.001&&c.start+c.duration>lo+.001; });
    if(between.length){ kit.say("Other clips sit between them. Pick neighbours."); return false; }
    var r=kit.edit("Swap clips",function(){ swap(f.clip,other); });
    if(r!==false) kit.say("Swapped"); return r;
  }
  var sh=kit.sheet("akSwap","⇄ Swap neighbours",function(){
    var S=kit.sel();
    return '<div class="note">'+(S.length?"Swap the selected clip with its neighbour. The gap between them is kept.":"Select a clip first.")+'</div><div class="g"><button type="button" data-k="-1">← Swap with previous</button><button type="button" data-k="1">Swap with next →</button></div>';
  },function(k,b,api){ if(run(+k)!==false) api.paint(); });
  window.amiyoSwap={open:sh.open,run:run};
  kit.menu("⇄ Swap neighbours",sh.open,"Swap neighbours","amiyoSwap.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step94-swap-neighbours"; }catch(e){}
})();

;
/* ==================== Script 487 id="amiyo-pr-step95" ==================== */
/* Premiere step 95: Guide to the new tools. One page in Pr tools ("Guide: new tools") explains each tool added in this round in a sentence and has an Open button next to it, so nothing is hidden
   in the long list. Shows which tools are in this build. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  var G=[
    ["Wide timeline","amiyoSlimTracks","Slim track headers so the clips get 50% more room on a phone."],
    ["Trim by frames","amiyoFrameTrim","Slip, slide, roll or trim by 1, 5 or 10 frames with buttons."],
    ["Replace footage","amiyoReplace","Swap the media behind clips and keep the edit."],
    ["Export frame","amiyoExportFrame","Save the current picture as PNG or JPG (Ctrl+Shift+E)."],
    ["Batch properties","amiyoBatchProps","Type opacity, scale, rotation, volume or speed for all selected clips."],
    ["Clips by length","amiyoClipLen","Select or delete clips shorter or longer than a limit."],
    ["Repeat / divide clip","amiyoRepeat","Loop a clip N times or cut it into N equal pieces."],
    ["Clip outline","amiyoOutline","Searchable list of every clip; tap to jump."],
    ["Pace analyzer","amiyoPace","Average shot length, cuts per minute and a pacing tip."],
    ["Export markers","amiyoMarkerExport","Markers as CSV, SRT or a pasted chapter list."],
    ["My shortcuts","amiyoMyKeys","Give any Pr tool your own Ctrl/Alt key (computer)."],
    ["Fill gaps","amiyoFillGaps","Extend clips to meet the next one without moving anything."],
    ["Send to track","amiyoSendTrack","Move or copy selected clips to another track."],
    ["Swap neighbours","amiyoSwap","Swap two neighbouring shots and keep the gap."]
  ];
  function api(n){ return n==="amiyoMyKeys"?window.amiyoKeys:window[n]; }
  var sh=kit.sheet("akGuide","❓ Guide: new tools",function(){
    var h='<div class="note">Tools added in the Premiere-style rounds 78 to 95. Tap Open to try one. Search for them in Pr tools.</div>';
    G.forEach(function(g,i){ var ok=!!(api(g[1])&&api(g[1]).open);
      h+='<div style="display:flex;gap:8px;align-items:center;border-bottom:1px solid #26231e;padding:6px 0"><div style="flex:1"><b>'+g[0]+'</b><div class="note">'+g[2]+'</div></div><button type="button" data-k="'+i+'" style="min-width:70px;'+(ok?"":"opacity:.4")+'">Open</button></div>'; });
    return h;
  },function(k,b,api2){ var g=G[+k], a=g&&api(g[1]); if(a&&a.open){ api2.close(); setTimeout(function(){ try{ a.open(); }catch(e){ kit.say("Could not open"); } },30); } });
  window.amiyoGuide95={open:sh.open,count:G.length};
  kit.menu("❓ Guide: new tools",sh.open,"Guide new tools","amiyoGuide95.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step95-guide"; }catch(e){}
})();

;
/* ==================== Script 488 id="amiyo-pr-step96-tools-search" ==================== */
/* Premiere step 96: Pr tools search + bigger touch targets.
   Audit found: 65 tools in one long list with no search, track header buttons (M/S/lock/eye, dots) and the AI gear under 44px.
   Adds a search box to the Premiere tools sheet and widens hit areas without moving anything. */
(function(){
  "use strict";
  var st=document.createElement("style"); st.id="amiyoStep96Css";
  st.textContent=".thtn,.trk-dots,#aiHubBtn{position:relative}.thtn::after,.trk-dots::after{content:'';position:absolute;inset:-5px}#aiHubBtn::after{content:'';position:absolute;inset:-12px}"+
  "#prToolsSheet .prSearch{min-height:44px;border-radius:11px;border:1px solid #302c26;background:#1b1915;color:#f1ece2;padding:4px 12px;font-size:14px;width:100%;box-sizing:border-box}"+
  "#prToolsSheet .prNone{font-size:12px;color:#8f8777;padding:6px 2px;display:none}";
  document.head.appendChild(st);
  function filter(box,q){
    q=(q||"").trim().toLowerCase(); var any=false;
    var btns=box.querySelectorAll("button[data-id],button[data-more]");
    for(var i=0;i<btns.length;i++){ var ok=!q||btns[i].textContent.toLowerCase().indexOf(q)>=0; btns[i].style.display=ok?"":"none"; if(ok) any=true; }
    var grids=box.querySelectorAll(".g");
    for(var j=0;j<grids.length;j++){
      var vis=!q||[].some.call(grids[j].querySelectorAll("button"),function(b){ return b.style.display!=="none"; });
      grids[j].style.display=vis?"":"none";
      var h=grids[j].previousElementSibling; if(h&&h.tagName==="H5") h.style.display=vis?"":"none";
    }
    var none=box.querySelector(".prNone"); if(none) none.style.display=(q&&!any)?"block":"none";
  }
  var T=window.amiyoPrTools; if(!T||T.__s96) return; T.__s96=1;
  var o=T.open;
  T.open=function(){
    var r=o.apply(this,arguments);
    var sh=document.getElementById("prToolsSheet"); if(!sh) return r;
    var box=sh.querySelector(".box"); if(!box) return r;
    var inp=box.querySelector(".prSearch");
    if(!inp){
      inp=document.createElement("input"); inp.type="search"; inp.className="prSearch"; inp.placeholder="Search tools (slip, marker, gap...)"; inp.setAttribute("aria-label","Search Premiere tools");
      var none=document.createElement("div"); none.className="prNone"; none.textContent="No tool matches. Try a shorter word.";
      var head=box.firstElementChild; box.insertBefore(inp,head?head.nextSibling:box.firstChild); box.insertBefore(none,inp.nextSibling);
      inp.addEventListener("input",function(){ filter(box,inp.value); });
    }
    inp.value=""; filter(box,"");
    return r;
  };
  try{ window.AMIYO_EDITOR_BUILD="pr-step96-tools-search"; }catch(e){}
})();

;
/* ==================== Script 489 id="amiyo-pr-step97-slip" ==================== */
/* Premiere step 97: Slip edit. Shift what a clip shows from its source without moving it or changing its length (Premiere Slip tool, Y).
   Linked clips slip together. Open from Pr tools: Slip edit. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function fps(){ var f=+((project.settings||{}).fps); return f>0?f:30; }
  function targets(){
    var sel=kit.sel(), out=[], seen={};
    sel.forEach(function(x){
      var parts=[x]; var c0=x.clip;
      if(c0.linkId) kit.all().forEach(function(y){ if(y.clip!==c0&&y.clip.linkId===c0.linkId) parts.push(y); });
      parts.forEach(function(p){ if(!seen[p.clip.id]){ seen[p.clip.id]=1; out.push(p); } });
    });
    return out;
  }
  function room(x){
    var c=x.clip, a=c.assetId&&project.assets&&project.assets[c.assetId];
    if(!a||!(a.duration>0)||c.kind==="text") return null;
    var inP=c.inPoint||0, len=(c.outPoint!=null?c.outPoint:inP+c.duration*(c.speed||1))-inP;
    return {head:inP, tail:Math.max(0,a.duration-inP-len), len:len, a:a};
  }
  function slip(sec){
    var L=targets().filter(function(x){ return room(x); });
    if(!L.length){ kit.say("Select a clip with source media"); return false; }
    var d=sec, lim=[]; 
    L.forEach(function(x){ var r=room(x); lim.push(d<0?-Math.min(-d,r.head):Math.min(d,r.tail)); });
    var use=d<0?Math.max.apply(null,lim):Math.min.apply(null,lim);
    if(Math.abs(use)<1e-6){ kit.say(d<0?"No more footage before this shot":"No more footage after this shot"); return false; }
    kit.edit("Slip edit",function(){
      L.forEach(function(x){ var c=x.clip, r=room(x); c.inPoint=(c.inPoint||0)+use; c.outPoint=c.inPoint+r.len; });
    });
    kit.say("Slipped "+(use>0?"+":"")+use.toFixed(2)+"s");
    return true;
  }
  function f2(n){ return n.toFixed(2)+"s"; }
  var sh=kit.sheet("akSlip","\u21C4 Slip edit",function(){
    var L=targets(), r=L.length&&room(L[0]);
    if(!L.length) return '<div class="note">Select a clip on the timeline first.</div>';
    if(!r) return '<div class="note">This clip has no source footage to slip (text, titles and colour clips cannot slip).</div>';
    var F=fps();
    return '<div class="note">'+kit.esc(L[0].clip.name||r.a.name||"Clip")+(L.length>1?" + "+(L.length-1)+" linked":"")+'. The clip stays in place and keeps its length. Only the part of the source it shows changes.</div>'+
    '<div class="note">Footage available: <b>'+f2(r.head)+'</b> before, <b>'+f2(r.tail)+'</b> after.</div>'+
    '<h5>Slip earlier / later</h5><div class="g">'+
    [[-1,"\u25C0\u25C0 1 s"],[1,"1 s \u25B6\u25B6"],[-10/F,"\u25C0 10 f"],[10/F,"10 f \u25B6"],[-1/F,"\u25C0 1 f"],[1/F,"1 f \u25B6"]].map(function(b){
      return '<button type="button" data-k="s:'+b[0]+'">'+b[1]+'</button>'; }).join("")+'</div>'+
    '<label>Slip by frames (negative = earlier)<input id="akSlipN" type="number" value="0" step="1" inputmode="numeric"></label>'+
    '<div class="g"><button type="button" data-k="n">Apply</button><button type="button" data-k="z">Back to start of source</button></div>';
  },function(k,b,api){
    var p=k.split(":");
    if(p[0]==="s") slip(+p[1]);
    else if(p[0]==="n"){ var v=+(api.el.querySelector("#akSlipN").value||0); if(v) slip(v/fps()); }
    else if(p[0]==="z"){ var L=targets().filter(function(x){ return room(x); }); if(L.length){ kit.edit("Slip to source start",function(){ L.forEach(function(x){ var c=x.clip,r=room(x); c.inPoint=0; c.outPoint=r.len; }); }); kit.say("Back to start of source"); } else kit.say("Select a clip with source media"); }
    api.paint();
  });
  window.amiyoSlip={open:sh.open,slip:slip};
  kit.menu("\u21C4 Slip edit",sh.open,"Slip edit","amiyoSlip.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step97-slip"; }catch(e){}
})();

;
/* ==================== Script 490 id="amiyo-pr-step98-slide" ==================== */
/* Premiere step 98: Slide edit. Move a clip along the timeline while the clip before it grows or shrinks and the clip after it
   trims to match, so the sequence length does not change (Premiere Slide tool, U). Open from Pr tools: Slide edit. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  var MIN=0.1, TOL=0.03;
  function fps(){ var f=+((project.settings||{}).fps); return f>0?f:30; }
  function spd(c){ return c.speed||1; }
  function srcLen(c){ var a=c.assetId&&project.assets&&project.assets[c.assetId]; return a&&a.duration>0&&c.kind!=="text"?a.duration:null; }
  kit.neighbours=function(x){
    var tr=x.track, c=x.clip, end=c.start+c.duration, prev=null, next=null;
    (tr.clips||[]).forEach(function(o){
      if(o===c) return;
      if(Math.abs(o.start+o.duration-c.start)<=TOL) prev=o;
      if(Math.abs(o.start-end)<=TOL) next=o;
    });
    return {prev:prev,next:next};
  };
  /* how far (timeline seconds) the tail of `p` may be extended, and how far its head may be trimmed, etc. */
  function tailRoom(p){ var L=srcLen(p); if(L==null) return 1e6; return Math.max(0,(L-(p.outPoint!=null?p.outPoint:(p.inPoint||0)+p.duration*spd(p)))/spd(p)); }
  function headRoom(n){ if(n.inPoint==null) return 1e6; return Math.max(0,(n.inPoint||0)/spd(n)); }
  function range(x){
    var nb=kit.neighbours(x), lo=-1e6, hi=1e6, c=x.clip;
    if(!nb.prev&&!nb.next) return null;
    if(nb.prev){ lo=Math.max(lo,-(nb.prev.duration-MIN)); hi=Math.min(hi,tailRoom(nb.prev)); }
    else lo=Math.max(lo,-c.start);
    if(nb.next){ hi=Math.min(hi,nb.next.duration-MIN); lo=Math.max(lo,-headRoom(nb.next)); }
    return {lo:lo,hi:hi,nb:nb};
  }
  function slide(sec){
    var L=kit.sel(); if(L.length!==1){ kit.say("Select one clip to slide"); return false; }
    var x=L[0]; if(x.track.locked){ kit.say("Unlock the track first"); return false; }
    var r=range(x); if(!r){ kit.say("Needs a clip right before or after it"); return false; }
    var d=Math.max(r.lo,Math.min(r.hi,sec));
    if(Math.abs(d)<1e-6){ kit.say(sec<0?"Cannot slide earlier":"Cannot slide later"); return false; }
    var c=x.clip, p=r.nb.prev, n=r.nb.next;
    kit.edit("Slide edit",function(){
      c.start+=d;
      if(p){ p.duration+=d; if(p.outPoint!=null) p.outPoint+=d*spd(p); }
      if(n){ n.start+=d; n.duration-=d; if(n.inPoint!=null) n.inPoint+=d*spd(n); }
    });
    kit.say("Slid "+(d>0?"+":"")+d.toFixed(2)+"s");
    return true;
  }
  var sh=kit.sheet("akSlide","\u21C6 Slide edit",function(){
    var L=kit.sel(); if(L.length!==1) return '<div class="note">Select one clip that sits next to another clip.</div>';
    var r=range(L[0]); if(!r) return '<div class="note">This clip has no neighbour touching it. Slide needs a clip right before or after it.</div>';
    var F=fps(), nb=r.nb;
    return '<div class="note">'+kit.esc(L[0].clip.name||"Clip")+' moves; '+(nb.prev?"the clip before gets longer or shorter":"")+(nb.prev&&nb.next?", ":"")+(nb.next?"the clip after trims to match":"")+'. Total length stays the same.</div>'+
    '<div class="note">Room: <b>'+(r.lo<-1e5?"free":(-r.lo).toFixed(2)+"s")+'</b> earlier, <b>'+(r.hi>1e5?"free":r.hi.toFixed(2)+"s")+'</b> later.</div>'+
    '<h5>Slide earlier / later</h5><div class="g">'+
    [[-1,"\u25C0\u25C0 1 s"],[1,"1 s \u25B6\u25B6"],[-10/F,"\u25C0 10 f"],[10/F,"10 f \u25B6"],[-1/F,"\u25C0 1 f"],[1/F,"1 f \u25B6"]].map(function(b){ return '<button type="button" data-k="s:'+b[0]+'">'+b[1]+'</button>'; }).join("")+'</div>'+
    '<label>Slide by frames (negative = earlier)<input id="akSlideN" type="number" value="0" step="1" inputmode="numeric"></label><button type="button" data-k="n">Apply</button>';
  },function(k,b,api){
    var p=k.split(":");
    if(p[0]==="s") slide(+p[1]); else if(p[0]==="n"){ var v=+(api.el.querySelector("#akSlideN").value||0); if(v) slide(v/fps()); }
    api.paint();
  });
  window.amiyoSlide={open:sh.open,slide:slide};
  kit.menu("\u21C6 Slide edit",sh.open,"Slide edit","amiyoSlide.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step98-slide"; }catch(e){}
})();

;
/* ==================== Script 491 id="amiyo-pr-step99-rolling" ==================== */
/* Premiere step 99: Rolling edit. Move the cut between two touching clips earlier or later. One clip gets longer, the other shorter,
   and nothing else moves (Premiere Rolling Edit tool, N). Open from Pr tools: Rolling edit. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit||!kit.neighbours) return;
  var MIN=0.1, side="end";
  function fps(){ var f=+((project.settings||{}).fps); return f>0?f:30; }
  function spd(c){ return c.speed||1; }
  function srcLen(c){ var a=c.assetId&&project.assets&&project.assets[c.assetId]; return a&&a.duration>0&&c.kind!=="text"?a.duration:null; }
  function tailRoom(p){ var L=srcLen(p); if(L==null) return 1e6; return Math.max(0,(L-(p.outPoint!=null?p.outPoint:(p.inPoint||0)+p.duration*spd(p)))/spd(p)); }
  function headRoom(n){ if(n.inPoint==null) return 1e6; return Math.max(0,(n.inPoint||0)/spd(n)); }
  function pair(){
    var L=kit.sel(); if(L.length!==1) return null;
    var x=L[0], nb=kit.neighbours(x), a,b;
    if(side==="end"&&nb.next){ a=x.clip; b=nb.next; }
    else if(side==="start"&&nb.prev){ a=nb.prev; b=x.clip; }
    else if(nb.next){ a=x.clip; b=nb.next; side="end"; }
    else if(nb.prev){ a=nb.prev; b=x.clip; side="start"; }
    else return null;
    return {x:x,a:a,b:b};
  }
  function range(p){ return {lo:Math.max(-(p.a.duration-MIN),-headRoom(p.b)), hi:Math.min(p.b.duration-MIN,tailRoom(p.a))}; }
  function roll(sec){
    var p=pair(); if(!p){ kit.say("Select a clip that touches another clip"); return false; }
    if(p.x.track.locked){ kit.say("Unlock the track first"); return false; }
    var r=range(p), d=Math.max(r.lo,Math.min(r.hi,sec));
    if(Math.abs(d)<1e-6){ kit.say(sec<0?"No more footage to roll earlier":"No more footage to roll later"); return false; }
    kit.edit("Rolling edit",function(){
      var a=p.a,b=p.b;
      a.duration+=d; if(a.outPoint!=null) a.outPoint+=d*spd(a);
      b.start+=d; b.duration-=d; if(b.inPoint!=null) b.inPoint+=d*spd(b);
    });
    try{ if(typeof setCurrentTime==="function") setCurrentTime(p.a.start+p.a.duration); }catch(e){}
    kit.say("Cut moved "+(d>0?"+":"")+d.toFixed(2)+"s");
    return true;
  }
  var sh=kit.sheet("akRoll","\u21D4 Rolling edit",function(){
    var p=pair(); if(!p) return '<div class="note">Select a clip that touches another clip. A rolling edit moves the cut between them.</div>';
    var F=fps(), r=range(p), nb=kit.neighbours(p.x);
    return '<div class="note">Cut between <b>'+kit.esc(p.a.name||"clip")+'</b> and <b>'+kit.esc(p.b.name||"clip")+'</b>. Neither the start of the first nor the end of the second changes.</div>'+
    '<div class="note">Room: <b>'+(-r.lo).toFixed(2)+'s</b> earlier, <b>'+r.hi.toFixed(2)+'s</b> later.</div>'+
    ((nb.prev&&nb.next)?'<div class="g"><button type="button" data-k="b:start" '+(side==="start"?'style="border-color:#ffb454"':'')+'>Cut at start</button><button type="button" data-k="b:end" '+(side==="end"?'style="border-color:#ffb454"':'')+'>Cut at end</button></div>':'')+
    '<h5>Roll cut earlier / later</h5><div class="g">'+
    [[-1,"\u25C0\u25C0 1 s"],[1,"1 s \u25B6\u25B6"],[-10/F,"\u25C0 10 f"],[10/F,"10 f \u25B6"],[-1/F,"\u25C0 1 f"],[1/F,"1 f \u25B6"]].map(function(b){ return '<button type="button" data-k="s:'+b[0]+'">'+b[1]+'</button>'; }).join("")+'</div>'+
    '<label>Roll by frames (negative = earlier)<input id="akRollN" type="number" value="0" step="1" inputmode="numeric"></label><button type="button" data-k="n">Apply</button>';
  },function(k,b,api){
    var p=k.split(":");
    if(p[0]==="b") side=p[1]; else if(p[0]==="s") roll(+p[1]); else if(p[0]==="n"){ var v=+(api.el.querySelector("#akRollN").value||0); if(v) roll(v/fps()); }
    api.paint();
  });
  window.amiyoRoll={open:sh.open,roll:roll};
  kit.menu("\u21D4 Rolling edit",sh.open,"Rolling edit","amiyoRoll.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step99-rolling"; }catch(e){}
})();

;
/* ==================== Script 492 id="amiyo-pr-step100-disable" ==================== */
/* Premiere step 100: Disable / enable clips (Shift+E). A disabled clip stays on the timeline but shows nothing and plays no sound,
   in the preview and in the export. Turn it back on and it returns exactly as it was. Open from Pr tools: Disable clips. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function isOff(c){ return !!c.disabled; }
  function off(c){ if(c.disabled) return; c._dis={opacity:c.opacity==null?1:c.opacity,volume:c.volume==null?1:c.volume}; c.opacity=0; c.volume=0; c.disabled=true; }
  function on(c){ if(!c.disabled) return; var d=c._dis||{opacity:1,volume:1}; c.opacity=d.opacity; c.volume=d.volume; delete c.disabled; delete c._dis; }
  function count(){ return kit.all().filter(function(x){ return isOff(x.clip); }).length; }
  function toggle(){
    var L=kit.sel(); if(!L.length){ kit.say("Select a clip first"); return false; }
    var allOff=L.every(function(x){ return isOff(x.clip); });
    kit.edit(allOff?"Enable clip":"Disable clip",function(){ L.forEach(function(x){ allOff?on(x.clip):off(x.clip); }); });
    kit.say(allOff?"Clip enabled":"Clip disabled"); return true;
  }
  function setAll(list,want){
    var c=list.filter(function(x){ return isOff(x.clip)!==want; });
    if(!c.length){ kit.say(want?"Nothing to disable":"Nothing is disabled"); return; }
    kit.edit(want?"Disable clips":"Enable clips",function(){ c.forEach(function(x){ want?off(x.clip):on(x.clip); }); });
    kit.say((want?"Disabled ":"Enabled ")+c.length+" clip"+(c.length>1?"s":""));
  }
  function paint(){
    try{
      var els=document.querySelectorAll("#tracks .clip[data-clip]"); if(!els.length) return;
      var map={}; kit.all().forEach(function(x){ if(x.clip.disabled) map[x.clip.id]=1; });
      for(var i=0;i<els.length;i++){
        var d=!!map[els[i].getAttribute("data-clip")], has=els[i].classList.contains("akDis");
        if(d&&!has){ els[i].classList.add("akDis"); } else if(!d&&has){ els[i].classList.remove("akDis"); }
      }
    }catch(e){}
  }
  var st=document.createElement("style"); st.textContent=".akDis{opacity:.4!important;background-image:repeating-linear-gradient(135deg,rgba(0,0,0,.35) 0 6px,transparent 6px 12px)!important}"; document.head.appendChild(st);
  var rt=window.renderTimeline;
  if(typeof rt==="function"&&!rt.__s100){ window.renderTimeline=function(){ var r=rt.apply(this,arguments); paint(); return r; }; window.renderTimeline.__s100=true; }
  document.addEventListener("keydown",function(e){
    if(e.shiftKey&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&(e.key==="E"||e.key==="e")){
      var t=e.target&&e.target.tagName; if(t==="INPUT"||t==="TEXTAREA"||t==="SELECT"||(e.target&&e.target.isContentEditable)) return;
      e.preventDefault(); toggle();
    }
  });
  var sh=kit.sheet("akDisable","\u2298 Disable clips",function(){
    var n=kit.sel().length;
    return '<div class="note">A disabled clip stays where it is but is hidden and silent in the preview and export. Shortcut: Shift+E (computer).</div>'+
    '<div class="note">'+(n?n+" selected. ":"No clip selected. ")+count()+" disabled in the project.</div>"+
    '<div class="g"><button type="button" data-k="t">Disable / enable selected</button><button type="button" data-k="trk">Disable whole track</button>'+
    '<button type="button" data-k="allon">Enable all</button><button type="button" data-k="sel">Select disabled clips</button></div>';
  },function(k,b,api){
    if(k==="t") toggle();
    else if(k==="trk"){ var s=kit.sel(); if(!s.length){ kit.say("Select a clip on the track first"); } else setAll(kit.all().filter(function(x){ return x.track===s[0].track; }),true); }
    else if(k==="allon") setAll(kit.all(),false);
    else if(k==="sel"){
      var hit=kit.all().filter(function(x){ return isOff(x.clip); }); if(!hit.length){ kit.say("No disabled clips"); }
      else{ try{ clearMultiSelection(); }catch(e){} hit.forEach(function(x){ x.clip.selected=true; }); selectedClipId=hit[0].clip.id; selectedTrackId=hit[0].track.id; try{ renderAll(); }catch(e){} kit.say(hit.length+" selected"); api.close(); return; }
    }
    api.paint();
  });
  window.amiyoDisable={open:sh.open,toggle:toggle};
  kit.menu("\u2298 Disable clips (Shift+E)",sh.open,"Disable clips","amiyoDisable.open()");
  setTimeout(paint,800);
  try{ window.AMIYO_EDITOR_BUILD="pr-step100-disable"; }catch(e){}
})();

;
/* ==================== Script 493 id="amiyo-pr-step101-track-heights" ==================== */
/* Premiere step 101: Track heights. Make tracks smaller to see more of the timeline or larger to see clips and waveforms better,
   for all tracks, one kind of track or only the selected track. Saved with the project. Open from Pr tools: Track heights. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  var SIZES={s:72,m:0,l:168};
  function rows(){ return [].slice.call(document.querySelectorAll("#tracks .track-row")); }
  function paint(){
    try{
      var R=rows(), T=project.tracks||[]; if(!R.length||R.length!==T.length) return;
      for(var i=0;i<R.length;i++){
        var h=T[i].rowH, cur=R[i].getAttribute("data-akh")||"";
        var want=h?String(h):"";
        if(cur===want) continue;
        if(h){ R[i].style.setProperty("height",h+"px","important"); R[i].setAttribute("data-akh",want); }
        else{ R[i].style.removeProperty("height"); R[i].removeAttribute("data-akh"); }
      }
    }catch(e){}
  }
  var rt=window.renderTimeline;
  if(typeof rt==="function"&&!rt.__s101){ window.renderTimeline=function(){ var r=rt.apply(this,arguments); paint(); return r; }; window.renderTimeline.__s101=true; }
  function apply(pred,size,label){
    var L=(project.tracks||[]).filter(pred); if(!L.length){ kit.say("No tracks match"); return; }
    kit.edit("Track height: "+label,function(){ L.forEach(function(t){ if(SIZES[size]) t.rowH=SIZES[size]; else delete t.rowH; }); });
    kit.say(L.length+" track"+(L.length>1?"s":"")+": "+label); setTimeout(paint,30);
  }
  function selTrack(){ var s=kit.sel(); return s.length?s[0].track:null; }
  var KINDS=[["video","Video"],["audio","Audio"],["text","Text"],["caption","Captions"]];
  var sh=kit.sheet("akTrackH","\u2195 Track heights",function(){
    var t=selTrack();
    var h='<div class="note">Taller tracks show more of each clip. Small tracks fit more on screen but hide the lock and eye buttons (use Track manager for those). Saved with the project.</div><h5>All tracks</h5><div class="g"><button type="button" data-k="a:s">Small</button><button type="button" data-k="a:m">Normal</button><button type="button" data-k="a:l">Large</button></div>';
    h+='<h5>One kind of track</h5>'+KINDS.map(function(k){ return '<div class="g" style="grid-template-columns:1fr 1fr 1fr 1fr;align-items:center"><span class="note">'+k[1]+'</span><button type="button" data-k="k:'+k[0]+':s">S</button><button type="button" data-k="k:'+k[0]+':m">M</button><button type="button" data-k="k:'+k[0]+':l">L</button></div>'; }).join("");
    h+='<h5>Selected track'+(t?" ("+kit.esc(t.name||t.kind)+")":"")+'</h5><div class="g"'+(t?'':' style="opacity:.45"')+'><button type="button" data-k="t:s">Small</button><button type="button" data-k="t:m">Normal</button><button type="button" data-k="t:l">Large</button></div>';
    return h;
  },function(k,b,api){
    var p=k.split(":"), nm={s:"small",m:"normal",l:"large"};
    if(p[0]==="a") apply(function(){ return true; },p[1],"all "+nm[p[1]]);
    else if(p[0]==="k") apply(function(t){ return (t.kind||t.type)===p[1]; },p[2],p[1]+" "+nm[p[2]]);
    else if(p[0]==="t"){ var t=selTrack(); if(!t){ kit.say("Select a clip on that track first"); return; } apply(function(x){ return x===t; },p[1],nm[p[1]]); }
  });
  window.amiyoTrackH={open:sh.open,apply:apply};
  kit.menu("\u2195 Track heights",sh.open,"Track heights","amiyoTrackH.open()");
  setTimeout(paint,800);
  try{ window.AMIYO_EDITOR_BUILD="pr-step101-track-heights"; }catch(e){}
})();

;
/* ==================== Script 494 id="amiyo-pr-step102-report" ==================== */
/* Premiere step 102: Project report. One screen with the numbers an editor checks before delivery: length, clips per track, media used and unused,
   missing media, average shot length, markers, disabled clips. Copy it as text. Open from Pr tools: Project report. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function tc(s){ s=Math.max(0,s||0); var m=Math.floor(s/60), r=s-m*60; return (m<10?"0":"")+m+":"+(r<10?"0":"")+r.toFixed(1); }
  function stats(){
    var all=kit.all(), S=project.settings||{}, assets=project.assets||{}, used={}, end=0, vids=[], byKind={}, fx=0, txt=0, off=0;
    all.forEach(function(x){
      var c=x.clip, k=x.track.kind||x.track.type||"track"; byKind[k]=(byKind[k]||0)+1;
      end=Math.max(end,c.start+c.duration);
      if(c.assetId) used[c.assetId]=(used[c.assetId]||0)+1;
      if(c.kind==="text"||k==="text") txt++;
      if(c.disabled) off++;
      if((c.effects||[]).length) fx++;
      if(k==="video"&&c.kind!=="text") vids.push(c.duration);
    });
    var ids=Object.keys(assets), miss=ids.filter(function(id){ var a=assets[id]; return a&&a.type!=="text"&&!(a.runtimeUrl||a.blob||a.fileObject||a.url); });
    var unused=ids.filter(function(id){ return !used[id]; });
    var avg=vids.length?vids.reduce(function(a,b){ return a+b; },0)/vids.length:0;
    return {w:S.width,h:S.height,fps:S.fps,end:end,clips:all.length,byKind:byKind,media:ids.length,unused:unused.map(function(i){ return assets[i].name||i; }),missing:miss.map(function(i){ return assets[i].name||i; }),
      avg:avg,longest:vids.length?Math.max.apply(null,vids):0,shortest:vids.length?Math.min.apply(null,vids):0,markers:(project.markers||[]).length,fx:fx,txt:txt,off:off,tracks:(project.tracks||[]).length};
  }
  function lines(s){
    var L=[];
    L.push("Project: "+(project.name||document.title||"Untitled"));
    L.push("Format: "+(s.w||"?")+" x "+(s.h||"?")+" at "+(s.fps||"?")+" fps");
    L.push("Length: "+tc(s.end)+" ("+s.end.toFixed(1)+" s)");
    L.push("Tracks: "+s.tracks+", clips: "+s.clips+" ("+Object.keys(s.byKind).map(function(k){ return s.byKind[k]+" "+k; }).join(", ")+")");
    L.push("Media: "+s.media+" files, "+s.unused.length+" unused"+(s.unused.length?": "+s.unused.slice(0,6).join(", ")+(s.unused.length>6?" ...":""):""));
    L.push("Missing media: "+(s.missing.length?s.missing.join(", "):"none"));
    L.push("Video shots: average "+s.avg.toFixed(1)+" s, longest "+s.longest.toFixed(1)+" s, shortest "+s.shortest.toFixed(1)+" s");
    L.push("Clips with effects: "+s.fx+", text clips: "+s.txt+", markers: "+s.markers+", disabled clips: "+s.off);
    return L;
  }
  var sh=kit.sheet("akReport","\uD83D\uDCCA Project report",function(){
    var s=stats(), L=lines(s);
    var warn=[]; if(s.missing.length) warn.push("\u26A0 "+s.missing.length+" missing media file"+(s.missing.length>1?"s":"")+". Relink before exporting."); if(s.off) warn.push("\u2298 "+s.off+" disabled clip"+(s.off>1?"s":"")+" will not appear in the export."); if(!s.clips) warn.push("The timeline is empty.");
    return (warn.length?'<div style="background:#2a1d12;border:1px solid #6b4a1e;border-radius:10px;padding:8px;color:#ffcf8a;font-size:12px">'+warn.join("<br>")+'</div>':'<div class="note">No problems found.</div>')+
      '<div style="font:12.5px/1.65 system-ui;color:#f1ece2">'+L.map(function(l){ var i=l.indexOf(":"); return '<div><b style="color:#ffb454">'+kit.esc(l.slice(0,i))+'</b>'+kit.esc(l.slice(i))+'</div>'; }).join("")+'</div>'+
      '<div class="g"><button type="button" data-k="copy">Copy report</button><button type="button" data-k="ref">Refresh</button></div>';
  },function(k,b,api){
    if(k==="copy"){
      var t=lines(stats()).join("\n");
      try{ navigator.clipboard.writeText(t).then(function(){ kit.say("Report copied"); },function(){ kit.say("Could not copy"); }); }catch(e){ kit.say("Could not copy"); }
    } else api.paint();
  });
  window.amiyoReport={open:sh.open,stats:stats};
  kit.menu("\uD83D\uDCCA Project report",sh.open,"Project report","amiyoReport.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step102-report"; }catch(e){}
})();

;
/* ==================== Script 495 id="amiyo-pr-step103-jump" ==================== */
/* Premiere step 103: Jump to edit points. Go to the previous or next cut on any track, the previous or next marker, the start or end of the
   selected clip, or the start or end of the sequence (Premiere Up / Down arrows). Computer shortcut: Alt+Up / Alt+Down for cuts.
   Open from Pr tools: Jump to edit. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  var E=0.01;
  function cuts(skipHidden){
    var t=[0], seen={};
    kit.all().forEach(function(x){
      if(skipHidden&&(x.track.hidden)) return;
      [x.clip.start,x.clip.start+x.clip.duration].forEach(function(v){ var k=Math.round(v*1000); if(!seen[k]){ seen[k]=1; t.push(v); } });
    });
    return t.sort(function(a,b){ return a-b; });
  }
  function marks(){ return (project.markers||[]).map(function(m){ return m.time; }).sort(function(a,b){ return a-b; }); }
  function go(t,label){ try{ setCurrentTime(Math.max(0,t)); }catch(e){} kit.say(label+" "+Math.max(0,t).toFixed(2)+"s"); }
  function step(list,dir,label){
    var cur=(typeof currentTime==="number")?currentTime:0, hit=null, i;
    if(dir>0){ for(i=0;i<list.length;i++) if(list[i]>cur+E){ hit=list[i]; break; } }
    else { for(i=list.length-1;i>=0;i--) if(list[i]<cur-E){ hit=list[i]; break; } }
    if(hit==null){ kit.say(dir>0?"No later "+label:"No earlier "+label); return false; }
    go(hit,label+" at"); return true;
  }
  function end(){ var m=0; kit.all().forEach(function(x){ m=Math.max(m,x.clip.start+x.clip.duration); }); return m; }
  var api={
    nextCut:function(){ return step(cuts(true),1,"cut"); }, prevCut:function(){ return step(cuts(true),-1,"cut"); },
    nextMarker:function(){ return step(marks(),1,"marker"); }, prevMarker:function(){ return step(marks(),-1,"marker"); },
    clipStart:function(){ var s=kit.sel(); if(!s.length){ kit.say("Select a clip first"); return; } go(s[0].clip.start,"Clip start"); },
    clipEnd:function(){ var s=kit.sel(); if(!s.length){ kit.say("Select a clip first"); return; } go(s[0].clip.start+s[0].clip.duration,"Clip end"); },
    seqStart:function(){ go(0,"Start"); }, seqEnd:function(){ go(end(),"End"); }
  };
  document.addEventListener("keydown",function(e){
    if(!e.altKey||e.ctrlKey||e.metaKey||e.shiftKey) return;
    if(e.key!=="ArrowUp"&&e.key!=="ArrowDown") return;
    var t=e.target&&e.target.tagName; if(t==="INPUT"||t==="TEXTAREA"||t==="SELECT"||(e.target&&e.target.isContentEditable)) return;
    e.preventDefault(); if(e.key==="ArrowDown") api.nextCut(); else api.prevCut();
  });
  var sh=kit.sheet("akJump","\u21E5 Jump to edit",function(){
    var c=(typeof currentTime==="number")?currentTime:0;
    return '<div class="note">Playhead at '+c.toFixed(2)+' s. Tap a button to jump. Shortcut on a computer: Alt+Up / Alt+Down for cuts.</div>'+
    '<h5>Cuts (any track)</h5><div class="g"><button type="button" data-k="prevCut">\u25C0 Previous cut</button><button type="button" data-k="nextCut">Next cut \u25B6</button></div>'+
    '<h5>Markers</h5><div class="g"><button type="button" data-k="prevMarker">\u25C0 Previous marker</button><button type="button" data-k="nextMarker">Next marker \u25B6</button></div>'+
    '<h5>Selected clip</h5><div class="g"><button type="button" data-k="clipStart">Clip start</button><button type="button" data-k="clipEnd">Clip end</button></div>'+
    '<h5>Sequence</h5><div class="g"><button type="button" data-k="seqStart">Start</button><button type="button" data-k="seqEnd">End</button></div>';
  },function(k,b,a){ if(api[k]) api[k](); a.paint(); });
  window.amiyoJump={open:sh.open,api:api};
  kit.menu("\u21E5 Jump to edit (Alt+\u2191/\u2193)",sh.open,"Jump to edit","amiyoJump.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step103-jump"; }catch(e){}
})();

;
/* ==================== Script 496 id="amiyo-pr-step104-time-display" ==================== */
/* Premiere step 104: Time display. Show the playhead time as timecode (HH:MM:SS:FF), frames, or seconds, like Premiere's display format.
   Changes the playhead badge and the time readout. Remembered on this device. Open from Pr tools: Time display. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  var mode="default", KEY="amiyoTimeMode";
  try{ mode=localStorage.getItem(KEY)||"default"; }catch(e){}
  function fps(){ var f=+((project.settings||{}).fps); return f>0?f:30; }
  function p2(n){ return (n<10?"0":"")+n; }
  function fmt(s){
    s=Math.max(0,s||0); var F=Math.round(fps()), fr=Math.round(s*F);
    if(mode==="tc"){ var f=fr%F, t=Math.floor(fr/F), ss=t%60, mm=Math.floor(t/60)%60, hh=Math.floor(t/3600); return p2(hh)+":"+p2(mm)+":"+p2(ss)+":"+p2(f); }
    if(mode==="frames") return String(fr)+" f";
    if(mode==="sec") return s.toFixed(2)+" s";
    return null;
  }
  function parse(t){ var m=/^(\d+):(\d+(?:\.\d+)?)$/.exec(t.trim()); return m?(+m[1])*60+(+m[2]):null; }
  var busy=false, lastTot=null;
  function paint(){
    if(mode==="default"||busy) return; busy=true;
    try{
      var ph=document.querySelector(".v12f"); if(ph&&typeof currentTime==="number"){ var a=fmt(currentTime); if(ph.textContent!==a) ph.textContent=a; }
      var r=document.getElementById("timeReadout");
      if(r){ var parts=r.textContent.split("/"); if(parts.length===2||lastTot!=null){ if(parts.length!==2) parts=[parts[0],"x"]; var c=typeof currentTime==="number"?currentTime:parse(parts[0]); var tot=parse(parts[1]); if(tot!=null) lastTot=tot; else tot=lastTot; var out=fmt(c)+(tot!=null?" / "+fmt(tot):""); if(r.textContent!==out) r.textContent=out; } }
    }catch(e){}
    busy=false;
  }
  var mo=new MutationObserver(function(){ paint(); });
  function watch(){ mo.disconnect(); [document.querySelector(".v12f"),document.getElementById("timeReadout")].forEach(function(n){ if(n) mo.observe(n,{childList:true,characterData:true,subtree:true}); }); }
  var sct=window.setCurrentTime;
  if(typeof sct==="function"&&!sct.__s104){ window.setCurrentTime=function(){ var r=sct.apply(this,arguments); paint(); return r; }; window.setCurrentTime.__s104=true; }
  setInterval(function(){ if(mode!=="default"){ watch(); paint(); } },500);
  function setMode(m){
    mode=m; try{ localStorage.setItem(KEY,m); }catch(e){}
    if(m==="default"){ try{ setCurrentTime(currentTime); renderAll(); }catch(e){} } else { watch(); paint(); }
    kit.say("Time display: "+({"default":"minutes","tc":"timecode","frames":"frames","sec":"seconds"})[m]);
  }
  var sh=kit.sheet("akTimeDisp","\u23F1 Time display",function(){
    var cur=typeof currentTime==="number"?currentTime:0, M=[["default","Minutes (default)","00:05.00"],["tc","Timecode","HH:MM:SS:FF"],["frames","Frames","123 f"],["sec","Seconds","5.00 s"]];
    return '<div class="note">Choose how the playhead time is shown. The project runs at '+Math.round(fps())+' fps. The playhead is at '+(fmt.call(null,cur)||cur.toFixed(2))+'.</div><div class="g">'+
    M.map(function(m){ return '<button type="button" data-k="'+m[0]+'" '+(mode===m[0]?'style="border-color:#ffb454"':'')+'>'+m[1]+'<br><small class="note">'+m[2]+'</small></button>'; }).join("")+'</div>';
  },function(k,b,api){ setMode(k); api.paint(); });
  window.amiyoTimeDisplay={open:sh.open,set:setMode,fmt:fmt};
  kit.menu("\u23F1 Time display",sh.open,"Time display","amiyoTimeDisplay.open()");
  if(mode!=="default") setTimeout(function(){ watch(); paint(); },600);
  try{ window.AMIYO_EDITOR_BUILD="pr-step104-time-display"; }catch(e){}
})();

;
/* ==================== Script 497 id="amiyo-pr-step105-targeting" ==================== */
/* Premiere step 105: Track targeting. Choose which video track and which audio track receive new clips (Insert / Overwrite at the playhead),
   like Premiere's V1 / A1 target buttons. Saved with the project. Open from Pr tools: Track targeting. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function tgt(){ project.targets=project.targets||{}; return project.targets; }
  function find(id){ var r=null; (project.tracks||[]).forEach(function(t){ if(t.id===id) r=t; }); return r; }
  var og=window.getTrack;
  if(typeof og==="function"&&!og.__s105){
    window.getTrack=function(kind){
      try{ var id=(project.targets||{})[kind], t=id&&find(id); if(t&&(t.kind||t.type)===kind&&!t.locked) return t; }catch(e){}
      return og.apply(this,arguments);
    };
    window.getTrack.__s105=true;
  }
  function label(t,i){ return (t.name||(t.kind+" "+(i+1)))+" ("+(t.clips||[]).length+" clips"+(t.locked?", locked":"")+")"; }
  var sh=kit.sheet("akTarget","\u25CE Track targeting",function(){
    var h='<div class="note">New clips from Insert and Overwrite go to the targeted track. If the target is locked or removed, the editor uses its normal track.</div>';
    ["video","audio"].forEach(function(k){
      var list=(project.tracks||[]).map(function(t,i){ return {t:t,i:i}; }).filter(function(x){ return (x.t.kind||x.t.type)===k; });
      var cur=(project.targets||{})[k];
      h+='<h5>'+(k==="video"?"Video target":"Audio target")+'</h5>';
      if(!list.length){ h+='<div class="note">No '+k+' tracks.</div>'; return; }
      h+=list.map(function(x){ var on=cur?cur===x.t.id:(x.t===list[0].t); return '<button type="button" data-k="'+k+':'+x.t.id+'" '+(on?'style="border-color:#ffb454;color:#ffb454"':'')+'>'+(on?"\u25CF ":"\u25CB ")+kit.esc(label(x.t,x.i))+'</button>'; }).join("");
    });
    h+='<button type="button" data-k="add:video">+ New video track</button><button type="button" data-k="add:audio">+ New audio track</button>';
    return h;
  },function(k,b,api){
    var p=k.split(":");
    if(p[0]==="add"){
      kit.edit("Add "+p[1]+" track",function(){ var n=project.tracks.filter(function(t){ return (t.kind||t.type)===p[1]; }).length+1; var t={id:(typeof mkid==="function"?mkid("track"):"track_"+Date.now()),kind:p[1],name:(p[1]==="video"?"Video ":"Audio ")+n,clips:[],muted:false,hidden:false}; project.tracks.push(t); tgt()[p[1]]=t.id; });
      kit.say("Added and targeted");
    } else { kit.edit("Track target",function(){ tgt()[p[0]]=p[1]; }); kit.say("Target set"); }
    api.paint();
  });
  window.amiyoTarget={open:sh.open};
  kit.menu("\u25CE Track targeting",sh.open,"Track targeting","amiyoTarget.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step105-targeting"; }catch(e){}
})();

;
/* ==================== Script 498 id="amiyo-pr-step106-duplicates" ==================== */
/* Premiere step 106: Duplicate finder. Finds clips that show the same part of the same media, so repeated shots are easy to spot.
   Select the extras, or remove them (the first of each group stays). Open from Pr tools: Duplicate finder. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function r2(n){ return Math.round((n||0)*20)/20; }
  function groups(){
    var m={};
    kit.all().forEach(function(x){
      var c=x.clip; if(!c.assetId) return;
      var key=c.assetId+"|"+r2(c.inPoint)+"|"+r2(c.outPoint!=null?c.outPoint:(c.inPoint||0)+c.duration)+"|"+(x.track.kind||"");
      (m[key]=m[key]||[]).push(x);
    });
    return Object.keys(m).map(function(k){ var g=m[k].sort(function(a,b){ return a.clip.start-b.clip.start; }); return g; }).filter(function(g){ return g.length>1; });
  }
  function extras(){ var o=[]; groups().forEach(function(g){ g.slice(1).forEach(function(x){ o.push(x); }); }); return o; }
  function nm(x){ var a=project.assets&&project.assets[x.clip.assetId]; return x.clip.name||(a&&a.name)||"Clip"; }
  var sh=kit.sheet("akDupes","\u29C9 Duplicate finder",function(){
    var G=groups();
    if(!G.length) return '<div class="note">No duplicates found. A duplicate is a clip that shows the same part of the same media on the same kind of track.</div>';
    var ex=extras().length;
    return '<div class="note">'+G.length+' repeated shot'+(G.length>1?"s":"")+', '+ex+' extra clip'+(ex>1?"s":"")+'. The first one of each group is kept.</div>'+
    G.slice(0,12).map(function(g,i){ return '<div class="note"><b style="color:#ffb454">'+kit.esc(nm(g[0]))+'</b> x'+g.length+' at '+g.map(function(x){ return x.clip.start.toFixed(1)+"s"; }).join(", ")+'</div><button type="button" data-k="go:'+i+'">Jump to first</button>'; }).join("")+(G.length>12?'<div class="note">And '+(G.length-12)+' more groups.</div>':'')+
    '<div class="g"><button type="button" data-k="sel">Select extras</button><button type="button" data-k="del">Remove extras</button></div>';
  },function(k,b,api){
    var E=extras();
    if(k==="sel"){ if(!E.length) return; try{ clearMultiSelection(); }catch(e){} E.forEach(function(x){ x.clip.selected=true; }); selectedClipId=E[0].clip.id; selectedTrackId=E[0].track.id; try{ renderAll(); }catch(e){} kit.say(E.length+" extras selected"); api.close(); return; }
    if(k==="del"){
      if(!E.length) return;
      kit.edit("Remove duplicates",function(){ E.forEach(function(x){ x.track.clips=x.track.clips.filter(function(c){ return c!==x.clip; }); }); selectedClipId=null; });
      kit.say("Removed "+E.length+" duplicate"+(E.length>1?"s":"")); api.paint(); return;
    }
    if(k.indexOf("go:")===0){ var g=groups()[+k.slice(3)]; if(g){ try{ setCurrentTime(g[0].clip.start); }catch(e){} selectedClipId=g[0].clip.id; selectedTrackId=g[0].track.id; try{ renderAll(); }catch(e){} api.close(); } }
  });
  window.amiyoDupes={open:sh.open,groups:groups};
  kit.menu("\u29C9 Duplicate finder",sh.open,"Duplicate finder","amiyoDupes.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step106-duplicates"; }catch(e){}
})();

;
/* ==================== Script 499 id="amiyo-pr-step107-zoom-presets" ==================== */
/* Premiere step 107: Zoom presets. Zoom the timeline so the screen shows a set length of time (1 s, 5 s, 10 s, 30 s, 1 min, 5 min) around the playhead,
   or the whole sequence. Open from Pr tools: Zoom presets. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  var P=[[1,"1 second"],[5,"5 seconds"],[10,"10 seconds"],[30,"30 seconds"],[60,"1 minute"],[300,"5 minutes"]];
  function seqEnd(){ var m=0; kit.all().forEach(function(x){ m=Math.max(m,x.clip.start+x.clip.duration); }); return m; }
  function showSeconds(dur,center){
    var ts=document.getElementById("timelineScroll"); if(!ts){ kit.say("Timeline not ready"); return false; }
    var lw=parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--label-w"))||100;
    var avail=Math.max(200,ts.clientWidth-lw-40), z=avail/Math.max(.05,dur)/6.4*100;
    if(typeof window.amiyoZoomTo==="function"){ window.amiyoZoomTo(z,lw+(ts.clientWidth-lw)/2,center,true); }
    else{ try{ setZoomVal(z); renderTimeline(); ts.scrollLeft=Math.max(0,timeToPx(center)-(ts.clientWidth-lw)/2); }catch(e){ return false; } }
    return true;
  }
  var sh=kit.sheet("akZoomP","\uD83D\uDD0D Zoom presets",function(){
    return '<div class="note">Zoom so the screen shows this much time, centred on the playhead.</div><div class="g">'+
      P.map(function(p){ return '<button type="button" data-k="p:'+p[0]+'">'+p[1]+'</button>'; }).join("")+
      '</div><button type="button" data-k="all">Whole sequence ('+seqEnd().toFixed(1)+' s)</button>';
  },function(k,b,api){
    var c=typeof currentTime==="number"?currentTime:0;
    if(k==="all"){ var e=seqEnd(); if(e<=0){ kit.say("Timeline is empty"); return; } if(showSeconds(e*1.04,e/2)) kit.say("Whole sequence"); }
    else { var d=+k.slice(2); if(showSeconds(d,c)) kit.say("Showing "+d+" s"); }
    api.close();
  });
  window.amiyoZoomPresets={open:sh.open,show:showSeconds};
  kit.menu("\uD83D\uDD0D Zoom presets",sh.open,"Zoom presets","amiyoZoomPresets.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step107-zoom-presets"; }catch(e){}
})();

;
/* ==================== Script 500 id="amiyo-pr-step108-badges" ==================== */
/* Premiere step 108: Clip badges. Small tags on each timeline clip showing what is applied: speed (2x), reversed (R), effects (fx), transitions (T),
   keyframes (K), silent clip (mute), linked (L). Turn on or off, and choose which tags to show. Open from Pr tools: Clip badges. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  var KEY="amiyoBadges", ALL=[["speed","Speed"],["rev","Reversed"],["fx","Effects"],["tr","Transitions"],["kf","Keyframes"],["mute","Silent"],["link","Linked"]];
  var cfg={on:true,show:{speed:1,rev:1,fx:1,tr:1,kf:1,mute:1,link:0}};
  try{ var s=JSON.parse(localStorage.getItem(KEY)||"null"); if(s&&s.show) cfg=s; }catch(e){}
  function save(){ try{ localStorage.setItem(KEY,JSON.stringify(cfg)); }catch(e){} }
  function tags(c){
    var t=[], S=cfg.show;
    if(S.speed&&c.speed&&Math.abs(c.speed-1)>.01) t.push((Math.round(c.speed*100)/100)+"x");
    if(S.rev&&c.reverse) t.push("R");
    if(S.fx&&(c.effects||[]).length) t.push("fx");
    if(S.tr&&(c.transitionIn||c.transitionOut)) t.push("T");
    if(S.kf&&(c.keyframes||[]).length) t.push("K");
    if(S.mute&&!c.disabled&&c.volume===0) t.push("mute");
    if(S.link&&c.linkId) t.push("L");
    return t.join(" ");
  }
  var st=document.createElement("style"); st.textContent=".akBdg{position:absolute;right:3px;bottom:2px;max-width:70%;overflow:hidden;white-space:nowrap;font:700 9px system-ui;letter-spacing:.02em;color:#1a0c03;background:rgba(255,196,110,.92);border-radius:4px;padding:1px 4px;pointer-events:none;z-index:3}"; document.head.appendChild(st);
  function paint(){
    try{
      var els=document.querySelectorAll("#tracks .clip[data-clip]"); if(!els.length) return;
      var map={}; kit.all().forEach(function(x){ map[x.clip.id]=x.clip; });
      for(var i=0;i<els.length;i++){
        var el=els[i], c=map[el.getAttribute("data-clip")], b=el.querySelector(".akBdg"), t=(cfg.on&&c)?tags(c):"";
        if(!t){ if(b) b.remove(); continue; }
        if(!b){ b=document.createElement("span"); b.className="akBdg"; el.appendChild(b); }
        if(b.textContent!==t) b.textContent=t;
      }
    }catch(e){}
  }
  var rt=window.renderTimeline;
  if(typeof rt==="function"&&!rt.__s108){ window.renderTimeline=function(){ var r=rt.apply(this,arguments); paint(); return r; }; window.renderTimeline.__s108=true; }
  var sh=kit.sheet("akBadges","\uD83C\uDFF7 Clip badges",function(){
    return '<div class="note">Small tags in the corner of each timeline clip show what is applied to it.</div>'+
    '<button type="button" data-k="on" style="border-color:'+(cfg.on?"#ffb454":"#302c26")+'">Badges: '+(cfg.on?"On":"Off")+'</button><h5>Show these</h5><div class="g">'+
    ALL.map(function(a){ var on=!!cfg.show[a[0]]; return '<button type="button" data-k="t:'+a[0]+'" style="border-color:'+(on?"#ffb454":"#302c26")+'">'+(on?"\u2713 ":"")+a[1]+'</button>'; }).join("")+'</div>';
  },function(k,b,api){
    if(k==="on") cfg.on=!cfg.on; else cfg.show[k.slice(2)]=cfg.show[k.slice(2)]?0:1;
    save(); try{ renderTimeline(); }catch(e){ paint(); } api.paint();
  });
  window.amiyoBadges={open:sh.open,tags:tags};
  kit.menu("\uD83C\uDFF7 Clip badges",sh.open,"Clip badges","amiyoBadges.open()");
  setTimeout(paint,800);
  try{ window.AMIYO_EDITOR_BUILD="pr-step108-badges"; }catch(e){}
})();

;
/* ==================== Script 501 id="amiyo-pr-step109-viewpoints" ==================== */
/* Premiere step 109: Viewpoints. Save the current zoom, scroll position and playhead under a name, and jump back to it later with one tap.
   Handy for flipping between the start, a detail you are fine-tuning, and the whole sequence. Saved with the project. Open from Pr tools: Viewpoints. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function lw(){ return parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--label-w"))||100; }
  function list(){ project.viewpoints=project.viewpoints||[]; return project.viewpoints; }
  function capture(){
    var ts=document.getElementById("timelineScroll"); if(!ts) return null;
    var z=timelineZoom, px=6.4*z/100, center=(ts.scrollLeft+(ts.clientWidth-lw())/2)/px;
    return {zoom:Math.round(z),center:Math.max(0,Math.round(center*100)/100),time:Math.round((typeof currentTime==="number"?currentTime:0)*100)/100};
  }
  function recall(v){
    var ts=document.getElementById("timelineScroll"); if(!ts) return false;
    if(typeof window.amiyoZoomTo==="function") window.amiyoZoomTo(v.zoom,lw()+(ts.clientWidth-lw())/2,v.center,true);
    else{ try{ setZoomVal(v.zoom); renderTimeline(); ts.scrollLeft=Math.max(0,timeToPx(v.center)-(ts.clientWidth-lw())/2); }catch(e){ return false; } }
    try{ setCurrentTime(v.time); }catch(e){}
    return true;
  }
  function add(name){
    var v=capture(); if(!v){ kit.say("Timeline not ready"); return false; }
    var L=list(); if(L.length>=12){ kit.say("12 viewpoints is the limit. Delete one first."); return false; }
    v.name=(name||"").trim()||("View "+(L.length+1)); v.id="vp"+Date.now().toString(36)+L.length;
    kit.edit("Save viewpoint",function(){ list().push(v); }); kit.say("Saved: "+v.name); return true;
  }
  var sh=kit.sheet("akViews","\uD83D\uDC41 Viewpoints",function(){
    var L=list(), cur=capture();
    return '<div class="note">Save where you are looking (zoom, position and playhead) and jump back any time. Now: zoom '+(cur?cur.zoom:"?")+'%.</div>'+
    '<label>Name<input id="akVpName" type="text" placeholder="e.g. Intro detail" maxlength="24"></label><button type="button" data-k="add">Save current view</button>'+
    (L.length?'<h5>Saved views</h5>'+L.map(function(v,i){ return '<div class="g" style="grid-template-columns:1fr 70px"><button type="button" data-k="go:'+i+'">'+kit.esc(v.name)+' <small class="note">'+v.zoom+'% at '+v.center.toFixed(1)+'s</small></button><button type="button" data-k="del:'+i+'" aria-label="Delete '+kit.esc(v.name)+'">Delete</button></div>'; }).join(""):'<div class="note">No saved views yet.</div>');
  },function(k,b,api){
    if(k==="add"){ add(api.el.querySelector("#akVpName").value); }
    else if(k.indexOf("go:")===0){ var v=list()[+k.slice(3)]; if(v&&recall(v)){ kit.say("View: "+v.name); api.close(); return; } }
    else if(k.indexOf("del:")===0){ var i=+k.slice(4); kit.edit("Delete viewpoint",function(){ list().splice(i,1); }); }
    api.paint();
  });
  window.amiyoViews={open:sh.open,add:add,recall:recall,list:list};
  kit.menu("\uD83D\uDC41 Viewpoints",sh.open,"Viewpoints","amiyoViews.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step109-viewpoints"; }catch(e){}
})();

;
/* ==================== Script 502 id="amiyo-pr-step110-favorites" ==================== */
/* Premiere step 110: Favorites and recent tools. The Premiere tools list now starts with your starred favorites and the tools you used last,
   so the 70+ tools stay quick to reach. Open Pr tools, then tap "Edit favorites". Remembered on this device. */
(function(){
  "use strict";
  var kit=window.amiyoKit, T=window.amiyoPrTools; if(!kit||!T||T.__s110) return; T.__s110=1;
  var KEY="amiyoPrFav", st={fav:[],recent:[]}, keys=[];
  try{ var s=JSON.parse(localStorage.getItem(KEY)||"null"); if(s&&s.fav) st=s; }catch(e){}
  function save(){ try{ localStorage.setItem(KEY,JSON.stringify(st)); }catch(e){} }
  function keyOf(b){ var c=b.cloneNode(true), sm=c.querySelectorAll("small"); for(var i=0;i<sm.length;i++) sm[i].remove(); return c.textContent.replace(/\s+/g," ").trim(); }
  function origs(box){ return [].slice.call(box.querySelectorAll("button[data-id],button[data-more]")); }
  function findBtn(box,key){ var L=origs(box); for(var i=0;i<L.length;i++) if(keyOf(L[i])===key) return L[i]; return null; }
  function proxies(box,list){
    var h=""; list.forEach(function(k,i){ if(findBtn(box,k)) h+='<button type="button" data-fk="'+kit.esc(k)+'">'+kit.esc(k)+'</button>'; });
    return h;
  }
  var st0=document.createElement("style"); st0.textContent="#prFavWrap .g{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:6px}#prFavWrap h5{margin:6px 0 4px;font:700 11px system-ui;letter-spacing:.06em;text-transform:uppercase;color:#8f8777}#prFavWrap button{min-height:44px;border-radius:11px;border:1px solid #302c26;background:#211f1b;color:#f1ece2;font-size:12.5px;padding:5px 10px}"; document.head.appendChild(st0);
  var favSheet=kit.sheet("akFav","\u2605 Edit favorites",function(){
    return '<div class="note">Tap a tool to star it. Starred tools appear at the top of Premiere tools (up to 8).</div>'+
      '<div class="g">'+keys.map(function(k){ var on=st.fav.indexOf(k)>=0; return '<button type="button" data-k="'+kit.esc(k)+'" style="'+(on?"border-color:#ffb454;color:#ffb454":"")+'">'+(on?"\u2605 ":"\u2606 ")+kit.esc(k)+'</button>'; }).join("")+'</div>';
  },function(k,b,api){
    var i=st.fav.indexOf(k);
    if(i>=0) st.fav.splice(i,1); else { if(st.fav.length>=8){ kit.say("8 favorites is the limit"); return; } st.fav.push(k); }
    save(); api.paint();
  });
  var o=T.open;
  T.open=function(){
    var r=o.apply(this,arguments);
    var sh=document.getElementById("prToolsSheet"); if(!sh) return r; var box=sh.querySelector(".box"); if(!box) return r;
    keys=origs(box).map(keyOf).filter(function(k,i,a){ return k&&a.indexOf(k)===i; });
    var old=document.getElementById("prFavWrap"); if(old) old.remove();
    var w=document.createElement("div"); w.id="prFavWrap";
    var fav=proxies(box,st.fav), rec=proxies(box,st.recent.filter(function(k){ return st.fav.indexOf(k)<0; }).slice(0,6));
    w.innerHTML=(fav?'<h5>\u2605 Favorites</h5><div class="g">'+fav+'</div>':'')+(rec?'<h5>Recent</h5><div class="g">'+rec+'</div>':'')+'<button type="button" data-fedit="1" style="width:100%;margin-bottom:6px">\u2605 Edit favorites</button>';
    var anchor=box.querySelector(".prNone")||box.querySelector(".prSearch")||box.firstElementChild;
    box.insertBefore(w,anchor?anchor.nextSibling:box.firstChild);
    var inp=box.querySelector(".prSearch"); if(inp&&!inp.__s110){ inp.__s110=1; inp.addEventListener("input",function(){ w.style.display=inp.value.trim()?"none":""; }); }
    if(!sh.__s110){
      sh.__s110=1;
      sh.addEventListener("click",function(e){
        var b=e.target.closest&&e.target.closest("button"); if(!b) return;
        if(b.getAttribute("data-fedit")){ T.close(); setTimeout(favSheet.open,30); return; }
        var fk=b.getAttribute("data-fk");
        if(fk){ var ob=findBtn(sh.querySelector(".box"),fk); if(ob){ e.stopPropagation(); ob.click(); } return; }
        if(b.hasAttribute("data-id")||b.hasAttribute("data-more")){ var k=keyOf(b); st.recent=[k].concat(st.recent.filter(function(x){ return x!==k; })).slice(0,10); save(); }
      },true);
    }
    return r;
  };
  window.amiyoPrFav={state:function(){ return st; },edit:favSheet.open};
  try{ window.AMIYO_EDITOR_BUILD="pr-step110-favorites"; }catch(e){}
})();

;
/* ==================== Script 503 id="amiyo-pr-step111-stagger" ==================== */
/* Premiere step 111: Stagger clips. Select several clips, then either start each one a set time after the previous start (cascade),
   or chain them one after another with a set gap (a negative gap overlaps them). Open from Pr tools: Stagger clips. */
(function(){
  "use strict";
  var kit=window.amiyoKit; if(!kit) return;
  function sorted(){ return kit.sel().filter(function(x){ return !x.track.locked; }).sort(function(a,b){ return a.clip.start-b.clip.start; }); }
  function run(mode,val){
    var L=sorted(); if(L.length<2){ kit.say("Select two or more clips (on unlocked tracks)"); return false; }
    if(!isFinite(val)){ kit.say("Enter a number of seconds"); return false; }
    kit.edit(mode==="stagger"?"Stagger clips":"Chain clips",function(){
      var t=L[0].clip.start;
      L.forEach(function(x,i){
        if(i===0){ t=x.clip.start; return; }
        var prev=L[i-1].clip;
        t=mode==="stagger"?L[0].clip.start+i*val:prev.start+prev.duration+val;
        x.clip.start=Math.max(0,Math.round(t*1000)/1000);
      });
    });
    kit.say((mode==="stagger"?"Staggered ":"Chained ")+L.length+" clips"); return true;
  }
  var sh=kit.sheet("akStagger","\u2630 Stagger clips",function(){
    var n=kit.sel().length;
    return '<div class="note">'+(n>=2?n+" clips selected. The earliest stays where it is.":"Select two or more clips first.")+'</div>'+
    '<label>Seconds<input id="akStagN" type="number" value="1" step="0.1" inputmode="decimal"></label>'+
    '<button type="button" data-k="stagger">Cascade: each clip starts this long after the previous start</button>'+
    '<button type="button" data-k="chain">Chain: each clip starts this long after the previous clip ends (negative = overlap)</button>';
  },function(k,b,api){ var v=parseFloat(api.el.querySelector("#akStagN").value); if(run(k,v)) api.paint(); });
  window.amiyoStagger={open:sh.open,run:run};
  kit.menu("\u2630 Stagger clips",sh.open,"Stagger clips","amiyoStagger.open()");
  try{ window.AMIYO_EDITOR_BUILD="pr-step111-stagger"; }catch(e){}
})();

;
/* ==================== Script 504 id="amiyo-vs-step01-lufs" ==================== */
/* Video Studio step 1 (Premiere Loudness Radar style): real LUFS loudness meter.
   Open Pr tools > "Loudness (LUFS)". Measures the whole timeline the way it plays (clip volume, track fader, mute/solo, speed, master)
   with ITU-R BS.1770 K-weighting and gating: integrated LUFS, loudest 400 ms moment, sample peak. "Set master to target" lowers the
   master fader to hit -14 (web), -16 (podcast) or -23 (broadcast); it is one undo step and also applies to export. Offline, nothing uploaded. */
(function(){
"use strict";
var kit=window.amiyoKit; if(!kit||window.amiyoLufs) return;
var SR=32000, MAXS=900, target=-14, res=null, busy=false;
function kw(fs){
  var f0=1681.974450955533,G=3.999843853973347,Q=0.7071752369554196,K=Math.tan(Math.PI*f0/fs),Vh=Math.pow(10,G/20),Vb=Math.pow(Vh,0.4996667741545416),a0=1+K/Q+K*K;
  var s={b:[(Vh+Vb*K/Q+K*K)/a0,2*(K*K-Vh)/a0,(Vh-Vb*K/Q+K*K)/a0],a:[1,2*(K*K-1)/a0,(1-K/Q+K*K)/a0]};
  var f1=38.13547087602444,Q1=0.5003270373238773,K1=Math.tan(Math.PI*f1/fs),a1=1+K1/Q1+K1*K1;
  return [s,{b:[1,-2,1],a:[1,2*(K1*K1-1)/a1,(1-K1/Q1+K1*K1)/a1]}];
}
function bq(x,c){ var y=new Float32Array(x.length),x1=0,x2=0,y1=0,y2=0,b=c.b,a=c.a; for(var i=0;i<x.length;i++){ var v=x[i],o=b[0]*v+b[1]*x1+b[2]*x2-a[1]*y1-a[2]*y2; y[i]=o; x2=x1; x1=v; y2=y1; y1=o; } return y; }
function L(e){ return -0.691+10*Math.log10(e); }
function avg(a){ var t=0; for(var i=0;i<a.length;i++) t+=a[i]; return t/a.length; }
function analyse(x,fs){
  var f=kw(fs), y=bq(bq(x,f[0]),f[1]), blk=Math.min(Math.round(.4*fs),y.length), hop=Math.max(1,Math.round(.1*fs)), cs=new Float64Array(y.length+1), E=[], peak=0, i;
  for(i=0;i<y.length;i++){ cs[i+1]=cs[i]+y[i]*y[i]; var ax=Math.abs(x[i]); if(ax>peak) peak=ax; }
  for(var s=0;s+blk<=y.length;s+=hop) E.push((cs[s+blk]-cs[s])/blk);
  var ab=E.filter(function(e){ return e>0&&L(e)>-70; });
  if(!ab.length) return {lufs:-Infinity,peak:peak,max:-Infinity};
  var rel=ab.filter(function(e){ return L(e)>L(avg(ab))-10; }), mx=-Infinity;
  ab.forEach(function(e){ if(L(e)>mx) mx=L(e); });
  return {lufs:L(avg(rel.length?rel:ab)),peak:peak,max:mx};
}
function master(){ var v=project.settings&&project.settings.masterVolume; return typeof v==="number"?Math.max(0,Math.min(1,v)):1; }
async function measure(){
  var tr=project.tracks||[], solo=tr.some(function(t){ return t.solo; }), list=[], end=0;
  tr.forEach(function(t){ if(t.muted||(solo&&!t.solo)) return; (t.clips||[]).forEach(function(c){
    var a=window.getAsset?getAsset(c.assetId):null; if(!a||a.type==="image"||c.mute) return; list.push({t:t,c:c,a:a}); end=Math.max(end,c.start+c.duration); }); });
  if(!list.length) return {empty:true};
  var secs=Math.min(MAXS,Math.ceil(end)), OAC=window.OfflineAudioContext||window.webkitOfflineAudioContext, ctx=new OAC(1,Math.max(SR,secs*SR),SR), n=0;
  for(var k=0;k<list.length;k++){ var it=list[k], buf=null;
    try{ buf=await getAudioBufferForAsset(it.a); }catch(e){}
    if(!buf) continue; var sp=Math.max(.1,it.c.speed||1), src=ctx.createBufferSource(), g=ctx.createGain();
    src.buffer=buf; src.playbackRate.value=sp;
    g.gain.value=(typeof it.c.volume==="number"?it.c.volume:1)*(typeof it.t.volume==="number"?it.t.volume:1)*master();
    src.connect(g); g.connect(ctx.destination);
    try{ src.start(it.c.start,it.c.inPoint||0,it.c.duration*sp); src.stop(it.c.start+it.c.duration); n++; }catch(e){}
  }
  if(!n) return {empty:true};
  var out=await ctx.startRendering(), r=analyse(out.getChannelData(0),SR); r.clips=n; r.secs=secs; r.capped=end>MAXS; return r;
}
function fmt(v){ return isFinite(v)?v.toFixed(1)+" LUFS":"silence"; }
function body(){
  var h='<div class="note">Measures the timeline as it plays, including the master fader. K-weighted per ITU-R BS.1770 (mono mix, so treat it as a close estimate).</div>';
  if(busy) h+='<div class="note">Measuring\u2026</div>';
  else if(res&&res.empty) h+='<div class="note">No clips with sound on the timeline.</div>';
  else if(res){
    h+='<h5>Result</h5><div class="g"><div>Integrated<br><b style="font-size:20px;color:#ffb454">'+fmt(res.lufs)+'</b></div><div>Loudest moment<br><b>'+fmt(res.max)+'</b></div>'+
       '<div>Sample peak<br><b>'+(res.peak>0?(20*Math.log10(res.peak)).toFixed(1)+" dBFS":"\u2212\u221e")+'</b></div><div>Master fader<br><b>'+Math.round(master()*100)+'%</b></div></div>';
    if(res.capped) h+='<div class="note">Only the first 15 minutes were measured.</div>';
  }
  h+='<h5>Target</h5><div class="g">'+[[-14,"-14 Web"],[-16,"-16 Podcast"],[-23,"-23 Broadcast"]].map(function(t){ return '<button type="button" data-k="t'+(-t[0])+'" style="'+(target===t[0]?"border-color:#ffb454;color:#ffb454":"")+'">'+t[1]+'</button>'; }).join("")+'</div>';
  h+='<button type="button" data-k="measure">Measure timeline</button><button type="button" data-k="norm">Set master to target ('+target+' LUFS)</button>';
  return h;
}
var sh=kit.sheet("akLufs","\ud83d\udd0a Loudness (LUFS)",body,async function(k,b,api){
  if(k.charAt(0)==="t"&&k!=="t"){ target=-parseInt(k.slice(1),10); api.paint(); return; }
  if(k==="measure"){ busy=true; api.paint(); try{ res=await measure(); }catch(e){ res={empty:true}; } busy=false; api.paint(); return; }
  if(k==="norm"){
    if(!res||res.empty||!isFinite(res.lufs)){ kit.say("Measure the timeline first"); return; }
    var d=target-res.lufs, m=master(), nm=Math.max(.01,Math.min(1,m*Math.pow(10,d/20)));
    if(d>0&&m>=.999){ kit.say("Already quieter than "+target+" LUFS. Raise clip volumes (Match Loudness) first"); return; }
    kit.edit("Normalize loudness",function(){ project.settings=project.settings||{}; project.settings.masterVolume=nm; });
    try{ updateAudioPlayback(); }catch(e){}
    kit.say("Master set to "+Math.round(nm*100)+"%"); res=null; api.paint();
  }
});
window.amiyoLufs={open:sh.open,measure:measure,analyse:analyse};
kit.menu("\ud83d\udd0a Loudness (LUFS)",sh.open,"Loudness (LUFS)","amiyoLufs.open()");
try{ window.AMIYO_EDITOR_BUILD="vs-step01-lufs"; }catch(e){}
})();

;
/* ==================== Script 505 id="amiyo-vs-step02-room" ==================== */
/* Video Studio step 2 (Premiere Reverb / Delay): reverb and echo per audio clip. Open Pr tools > "Reverb & echo", pick a preset
   (Echo, Slapback, Room, Hall, Cave) and nudge Less wet / More wet. Works live, so it is in the video export, and in the WAV export.
   The effect is added alongside the clip's sound (dry sound is untouched), so Voice enhance and EQ keep working. One undo step each.
   Note: in the WAV export the tail stops at the end of each clip. */
(function(){
"use strict";
var kit=window.amiyoKit; if(!kit||window.amiyoRoom) return;
var P={echo:{n:"Echo",d:.32,fb:.38,mix:.35},slap:{n:"Slapback",d:.11,fb:.1,mix:.3},room:{n:"Room",r:.7,mix:.22},hall:{n:"Hall",r:2.2,mix:.3},cave:{n:"Cave",r:4.5,mix:.35}};
function ir(ctx,sec){
  var sr=ctx.sampleRate,n=Math.max(1,Math.floor(sec*sr)),b=ctx.createBuffer(2,n,sr),s=12345,at=Math.floor(sr*.004);
  for(var c=0;c<2;c++){ var d=b.getChannelData(c); for(var i=0;i<n;i++){ s=(Math.imul(s,1664525)+1013904223)>>>0; d[i]=((s/4294967296)*2-1)*Math.pow(1-i/n,3.5)*(i<at?i/at:1); } }
  return b;
}
function mixOf(c){ var d=P[c.p]; return Math.max(.05,Math.min(.8,typeof c.mix==="number"?c.mix:(d?d.mix:.3))); }
function build(ctx,cfg){
  var d=P[cfg.p]||P.room, wet=ctx.createGain(), n=[wet], inp=ctx.createGain(); n.push(inp);
  wet.gain.value=mixOf(cfg);
  if(d.r){ var cv=ctx.createConvolver(); cv.buffer=ir(ctx,d.r); inp.connect(cv); cv.connect(wet); n.push(cv); }
  else{
    var dl=ctx.createDelay(1.5), fb=ctx.createGain(), lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=4200;
    dl.delayTime.value=d.d; fb.gain.value=d.fb; inp.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(wet); n.push(dl,fb,lp);
  }
  return {input:inp,output:wet,nodes:n};
}
function send(ctx,cfg,from,to){ var ch=build(ctx,cfg); from.connect(ch.input); ch.output.connect(to); return ch; }
function dests(ac,node){ node.connect(ac.destination); try{ if(typeof audioDestination!=="undefined"&&audioDestination) node.connect(audioDestination); }catch(e){} }
var live=new Map();
function drop(r){ try{ r.chain.nodes.forEach(function(n){ try{ n.disconnect(); }catch(e){} }); }catch(e){} }
function one(c){
  var p=(typeof trackPanners!=="undefined")?trackPanners.get(c.id):null; if(!p) return;
  var r=live.get(c.id), cfg=c.roomFx;
  if(!cfg){ if(r){ drop(r); live.delete(c.id); } return; }
  var sig=cfg.p+"|"+mixOf(cfg);
  if(r&&r.sig===sig&&r.p===p){ try{ p.connect(r.chain.input); }catch(e){} return; }
  if(r) drop(r);
  var ch=build(p.context,cfg); p.connect(ch.input); dests(p.context,ch.output); live.set(c.id,{sig:sig,chain:ch,p:p});
}
function clips(){ var o=[]; (project.tracks||[]).forEach(function(t){ if(t.kind==="audio") (t.clips||[]).forEach(function(c){ o.push(c); }); }); return o; }
function sync(){ try{ var seen={}; clips().forEach(function(c){ if(c.roomFx||live.has(c.id)){ seen[c.id]=1; try{ one(c); }catch(e){ console.warn("room sync",e); } } }); live.forEach(function(r,id){ if(!seen[id]){ drop(r); live.delete(id); } }); }catch(e){} }
var pe=window.ensureAudioElement; if(typeof pe==="function") window.ensureAudioElement=async function(clip){ var el=await pe.apply(this,arguments); if(el&&clip&&clip.roomFx) one(clip); return el; };
var pu=window.updateAudioPlayback; if(typeof pu==="function") window.updateAudioPlayback=async function(){ var r=await pu.apply(this,arguments); sync(); return r; };
var qf=0, pr=window.renderAll; if(typeof pr==="function") window.renderAll=function(){ var r=pr.apply(this,arguments); if(!qf) qf=requestAnimationFrame(function(){ qf=0; sync(); }); return r; };
function targets(){ return kit.sel().filter(function(x){ return x.track.kind==="audio"; }).map(function(x){ return x.clip.id; }); }
function apply(fn,label){
  var ids=targets(); if(!ids.length){ kit.say("Select an audio clip first"); return false; }
  kit.edit(label,function(){ clips().forEach(function(c){ if(ids.indexOf(c.id)>=0) fn(c); }); }); sync(); return ids.length;
}
function body(){
  var ids=targets(), first=ids.length?clips().filter(function(c){ return c.id===ids[0]; })[0]:null, cur=first&&first.roomFx;
  var h='<div class="note">'+(ids.length?ids.length+" audio clip"+(ids.length>1?"s":"")+" selected."+(cur?" Now: "+P[cur.p].n+", "+Math.round(mixOf(cur)*100)+"% wet.":" No reverb yet."):"Select an audio clip first.")+'</div><div class="g">';
  Object.keys(P).forEach(function(k){ h+='<button type="button" data-k="'+k+'" style="'+(cur&&cur.p===k?"border-color:#ffb454;color:#ffb454":"")+'">'+P[k].n+'</button>'; });
  return h+'<button type="button" data-k="off">Off</button></div><div class="g"><button type="button" data-k="less">Less wet</button><button type="button" data-k="more">More wet</button></div>';
}
var sh=kit.sheet("akRoom","\ud83c\udfdb Reverb & echo",body,function(k,b,api){
  if(P[k]) apply(function(c){ c.roomFx={p:k}; },"Reverb: "+P[k].n);
  else if(k==="off") apply(function(c){ delete c.roomFx; },"Reverb off");
  else if(k==="less"||k==="more") apply(function(c){ if(c.roomFx) c.roomFx={p:c.roomFx.p,mix:Math.max(.05,Math.min(.8,mixOf(c.roomFx)+(k==="more"?.1:-.1)))}; },"Reverb amount");
  api.paint();
});
window.amiyoRoom={open:sh.open,build:build,send:send,sync:sync,live:live};
kit.menu("\ud83c\udfdb Reverb & echo",sh.open,"Reverb & echo","amiyoRoom.open()");
try{ window.AMIYO_EDITOR_BUILD="vs-step02-room"; }catch(e){}
})();

;
/* ==================== Script 506 id="amiyo-vs-step03-deess" ==================== */
/* Video Studio step 3 (Premiere DeEsser + Limiter): per-clip de-esser and one-tap master peak limiter.
   Open Pr tools > "De-esser & limiter". De-esser: select audio clips, pick Light / Normal / Strong and a voice type. It splits the sound at the
   sibilance frequency (Linkwitz-Riley crossover, so nothing else changes) and compresses only the "s / sh / t" band. Live, in video export and WAV export.
   Limiter: Mixer's master limiter with quick ceilings (-1, -2, -3 dB). One undo step each. */
(function(){
"use strict";
var kit=window.amiyoKit; if(!kit||window.amiyoDeess) return;
var P={light:{n:"Light",t:-32,r:3},normal:{n:"Normal",t:-36,r:5},strong:{n:"Strong",t:-40,r:8}};
var V={deep:{n:"Deep voice",f:5500},mid:{n:"Neutral",f:6500},bright:{n:"Bright voice",f:7500}};
function fOf(c){ return Math.max(3000,Math.min(10000,typeof c.f==="number"?c.f:6500)); }
function makeup(T,R){ return Math.pow(1/Math.pow(10,(T+(-T)/R)/20),.6); }
function build(ctx,cfg){
  var d=P[cfg.l]||P.normal, f=fOf(cfg), inp=ctx.createGain(), out=ctx.createGain(), n=[inp,out];
  function bq(type){ var b=ctx.createBiquadFilter(); b.type=type; b.frequency.value=f; b.Q.value=.7071; n.push(b); return b; }
  var l1=bq("lowpass"), l2=bq("lowpass"), h1=bq("highpass"), h2=bq("highpass");
  var dl=ctx.createDelay(.05); dl.delayTime.value=.006; /* matches the compressor's own look-ahead so both bands stay in phase */
  var cp=ctx.createDynamicsCompressor(); cp.threshold.value=d.t; cp.knee.value=6; cp.ratio.value=d.r; cp.attack.value=.001; cp.release.value=.08;
  var post=ctx.createGain(); post.gain.value=1/makeup(d.t-3,d.r); n.push(dl,cp,post);
  inp.connect(l1); l1.connect(l2); l2.connect(dl); dl.connect(out);
  inp.connect(h1); h1.connect(h2); h2.connect(cp); cp.connect(post); post.connect(out);
  return {input:inp,output:out,nodes:n};
}
var live=new Map();
function dest(p){ return p.context.destination; }
function drop(r,restore){
  try{ r.chain.nodes.forEach(function(n){ try{ n.disconnect(); }catch(e){} }); }catch(e){}
  if(restore&&r.p){ try{ r.p.connect(dest(r.p)); }catch(e){} }
}
function one(c){
  var p=(typeof trackPanners!=="undefined")?trackPanners.get(c.id):null; if(!p) return;
  var r=live.get(c.id), cfg=c.deessFx;
  if(!cfg){ if(r){ drop(r,true); live.delete(c.id); } return; }
  var sig=cfg.l+"|"+fOf(cfg);
  if(r&&r.sig===sig&&r.p===p){ try{ p.disconnect(dest(p)); }catch(e){} return; }
  if(r) drop(r,false);
  var ch=build(p.context,cfg);
  try{ p.disconnect(dest(p)); }catch(e){}
  p.connect(ch.input); ch.output.connect(dest(p));
  live.set(c.id,{sig:sig,chain:ch,p:p});
}
function clips(){ var o=[]; (project.tracks||[]).forEach(function(t){ if(t.kind==="audio") (t.clips||[]).forEach(function(c){ o.push(c); }); }); return o; }
function sync(){ try{ var seen={}; clips().forEach(function(c){ if(c.deessFx||live.has(c.id)){ seen[c.id]=1; try{ one(c); }catch(e){ console.warn("deess sync",e); } } }); live.forEach(function(r,id){ if(!seen[id]){ drop(r,true); live.delete(id); } }); }catch(e){} }
var pe=window.ensureAudioElement; if(typeof pe==="function") window.ensureAudioElement=async function(clip){ var el=await pe.apply(this,arguments); if(el&&clip&&clip.deessFx) one(clip); return el; };
var pu=window.updateAudioPlayback; if(typeof pu==="function") window.updateAudioPlayback=async function(){ var r=await pu.apply(this,arguments); sync(); return r; };
var qf=0, pr=window.renderAll; if(typeof pr==="function") window.renderAll=function(){ var r=pr.apply(this,arguments); if(!qf) qf=requestAnimationFrame(function(){ qf=0; sync(); }); return r; };
function targets(){ return kit.sel().filter(function(x){ return x.track.kind==="audio"; }).map(function(x){ return x.clip.id; }); }
function apply(fn,label){
  var ids=targets(); if(!ids.length){ kit.say("Select an audio clip first"); return false; }
  kit.edit(label,function(){ clips().forEach(function(c){ if(ids.indexOf(c.id)>=0) fn(c); }); }); sync(); return ids.length;
}
function lim(){ var s=project.settings||{}, l=s.limiter; return (l&&typeof l==="object")?{on:!!l.on,ceiling:typeof l.ceiling==="number"?l.ceiling:-1}:{on:false,ceiling:-1}; }
function setLim(on,ceil){
  kit.edit("Master limiter",function(){ project.settings=project.settings||{}; project.settings.limiter={on:on,ceiling:ceil}; });
  try{ updateAudioPlayback(); }catch(e){}
}
function btn(k,t,on){ return '<button type="button" data-k="'+k+'" style="'+(on?"border-color:#ffb454;color:#ffb454":"")+'">'+t+'</button>'; }
function body(){
  var ids=targets(), first=ids.length?clips().filter(function(c){ return c.id===ids[0]; })[0]:null, cur=first&&first.deessFx, L=lim();
  var h='<h5>De-esser</h5><div class="note">'+(ids.length?ids.length+" audio clip"+(ids.length>1?"s":"")+" selected."+(cur?" Now: "+(P[cur.l]||P.normal).n+" at "+(fOf(cur)/1000).toFixed(1)+" kHz.":" No de-esser yet."):"Select an audio clip first.")+'</div><div class="g">';
  Object.keys(P).forEach(function(k){ h+=btn("d"+k,P[k].n,cur&&cur.l===k); });
  h+=btn("doff","Off",false)+'</div><div class="note">Voice type (where the harsh \u201cs\u201d sits)</div><div class="g">';
  Object.keys(V).forEach(function(k){ h+=btn("v"+k,V[k].n,cur&&fOf(cur)===V[k].f); });
  h+='</div><h5>Peak limiter (master)</h5><div class="note">'+(L.on?"On, ceiling "+L.ceiling+" dB. Peaks stay under it in preview and export.":"Off. Turn on to keep the loudest peaks from clipping.")+'</div><div class="g">';
  [-1,-2,-3].forEach(function(c){ h+=btn("l"+(-c),c+" dB",L.on&&L.ceiling===c); });
  return h+btn("loff","Off",!L.on)+'</div>';
}
var sh=kit.sheet("akDeess","\ud83c\udf99 De-esser & limiter",body,function(k,b,api){
  var c=k.charAt(0), v=k.slice(1);
  if(c==="d"&&P[v]) apply(function(x){ x.deessFx={l:v,f:fOf(x.deessFx||{})}; },"De-esser: "+P[v].n);
  else if(k==="doff") apply(function(x){ delete x.deessFx; },"De-esser off");
  else if(c==="v"&&V[v]) apply(function(x){ x.deessFx={l:(x.deessFx&&x.deessFx.l)||"normal",f:V[v].f}; },"De-esser voice: "+V[v].n);
  else if(c==="l"&&k!=="loff") setLim(true,-parseInt(v,10));
  else if(k==="loff") setLim(false,lim().ceiling);
  api.paint();
});
window.amiyoDeess={open:sh.open,build:build,sync:sync,live:live};
kit.menu("\ud83c\udf99 De-esser & limiter",sh.open,"De-esser & limiter","amiyoDeess.open()");
try{ window.AMIYO_EDITOR_BUILD="vs-step03-deess"; }catch(e){}
})();

;
/* ==================== Script 507 id="amiyo-vs-step04-fades" ==================== */
/* Video Studio step 4 (Premiere fade shapes): audio and video fades with curve shapes.
   Open Pr tools > "Fade shapes". Select clips, pick a fade length for In / Out and a shape: Linear, Fast, Slow, S-curve or Equal power.
   The shape is used live, in the video export and in the WAV export. "Smooth cuts" gives both sides of a cut a short fade with the chosen shape
   (clips cannot overlap on one track, so this is a quick dip, not a true overlapping crossfade). One undo step each. */
(function(){
"use strict";
var kit=window.amiyoKit; if(!kit||window.amiyoFadeShapes) return;
var S={lin:{n:"Linear",f:function(x){ return x; }},fast:{n:"Fast",f:function(x){ return 1-(1-x)*(1-x); }},slow:{n:"Slow",f:function(x){ return x*x; }},
  s:{n:"S-curve",f:function(x){ return x*x*(3-2*x); }},eq:{n:"Equal power",f:function(x){ return Math.sin(x*Math.PI/2); }}};
var LEN=[0,.25,.5,1,2], shape="eq";
window.amiyoFS=function(c,x){ var s=S[c&&c.fadeShape]; x=x<0?0:(x>1?1:x); return s?s.f(x):x; };
function sel(){ return kit.sel(); }
function curve(k){ var p=[]; for(var i=0;i<=20;i++) p.push((i*4)+","+(40-S[k].f(i/20)*38).toFixed(1)); return '<svg viewBox="0 0 80 42" width="64" height="34" style="display:block;margin:2px auto"><polyline fill="none" stroke="#ffb454" stroke-width="2" points="'+p.join(" ")+'"/></svg>'; }
function btn(k,t,on){ return '<button type="button" data-k="'+k+'" style="'+(on?"border-color:#ffb454;color:#ffb454":"")+'">'+t+'</button>'; }
function body(){
  var L=sel(), f=L.length?L[0].clip:null, h='<div class="note">'+(L.length?L.length+" clip"+(L.length>1?"s":"")+" selected. Now: in "+((f.fadeIn||0).toFixed(2))+" s, out "+((f.fadeOut||0).toFixed(2))+" s, "+(S[f.fadeShape]||S.lin).n+".":"Select a clip first.")+'</div>';
  var cur=f&&f.fadeShape||"lin";
  h+='<h5>Fade in (s)</h5><div class="g">'+LEN.map(function(v){ return btn("i"+v,v?String(v):"Off",f&&Math.abs((f.fadeIn||0)-v)<.01); }).join("")+'</div>';
  h+='<h5>Fade out (s)</h5><div class="g">'+LEN.map(function(v){ return btn("o"+v,v?String(v):"Off",f&&Math.abs((f.fadeOut||0)-v)<.01); }).join("")+'</div>';
  h+='<h5>Shape</h5><div class="g">'+Object.keys(S).map(function(k){ return '<button type="button" data-k="s'+k+'" style="'+(cur===k?"border-color:#ffb454;color:#ffb454":"")+'">'+curve(k)+S[k].n+'</button>'; }).join("")+'</div>';
  return h+'<h5>Cuts</h5><button type="button" data-k="cuts">Smooth cuts (0.15 s, chosen shape)</button><button type="button" data-k="rst">Remove fades on selected</button>';
}
function each(fn,label){
  var L=sel(); if(!L.length){ kit.say("Select a clip first"); return false; }
  kit.edit(label,function(){ L.forEach(function(x){ fn(x.clip); }); });
  try{ updateAudioPlayback(); }catch(e){} try{ renderAll(); }catch(e){} return true;
}
function cap(c,v){ return Math.max(0,Math.min(v,(c.duration||0)*.45)); }
var sh=kit.sheet("akFade","\u25d0 Fade shapes",body,function(k,b,api){
  var c=k.charAt(0), v=k.slice(1);
  if(c==="i"&&!isNaN(parseFloat(v))) each(function(x){ x.fadeIn=cap(x,parseFloat(v)); },"Fade in");
  else if(c==="o"&&!isNaN(parseFloat(v))) each(function(x){ x.fadeOut=cap(x,parseFloat(v)); },"Fade out");
  else if(c==="s"&&S[v]){ shape=v; each(function(x){ if(v==="lin") delete x.fadeShape; else x.fadeShape=v; },"Fade shape: "+S[v].n); }
  else if(k==="rst") each(function(x){ x.fadeIn=0; x.fadeOut=0; delete x.fadeShape; },"Remove fades");
  else if(k==="cuts"){
    var L=sel(), n=0; if(!L.length){ kit.say("Select clips first"); return; }
    kit.edit("Smooth cuts",function(){ L.forEach(function(a){ var tr=a.track, e=a.clip.start+a.clip.duration;
      (tr.clips||[]).forEach(function(b){ if(b!==a.clip&&Math.abs(b.start-e)<.03){
        a.clip.fadeOut=cap(a.clip,.15); b.fadeIn=cap(b,.15); if(shape!=="lin"){ a.clip.fadeShape=shape; b.fadeShape=shape; } n++; } }); }); });
    try{ updateAudioPlayback(); }catch(e){} kit.say(n?n+" cut"+(n>1?"s":"")+" smoothed":"No touching clips in the selection");
  }
  api.paint();
});
window.amiyoFadeShapes={open:sh.open,shapes:S};
kit.menu("\u25d0 Fade shapes",sh.open,"Fade shapes","amiyoFadeShapes.open()");
try{ window.AMIYO_EDITOR_BUILD="vs-step04-fades"; }catch(e){}
})();

;
/* ==================== Script 508 id="amiyo-vs-step05-clean" ==================== */
/* Video Studio step 5 (Premiere "Enhance speech" style): one-tap voice clean-up for audio clips.
   Open Pr tools > "Voice clean-up", select audio clips, tap Light / Normal / Strong. One chain does it all:
   low-cut (80 Hz) > mud cut (250 Hz) > noise gate > presence + air EQ > compressor > make-up gain.
   The gate sits before the compressor so the compressor never lifts background noise. Live, in the video export and in the WAV export.
   If the browser cannot run audio worklets, the gate is skipped and the rest still works. One undo step each. Runs after the De-esser. */
(function(){
"use strict";
var kit=window.amiyoKit; if(!kit||window.amiyoClean) return;
var P={light:{n:"Light",g:-58,r:2.5,pres:1.5},normal:{n:"Normal",g:-50,r:3.5,pres:2.5},strong:{n:"Strong",g:-44,r:4.5,pres:3.5}};
var CODE="class G extends AudioWorkletProcessor{static get parameterDescriptors(){return [{name:'thr',defaultValue:.003,minValue:0,maxValue:1,automationRate:'k-rate'}];}"+
"constructor(){super();this.e=0;this.g=1;this.h=0;this.a=1-Math.exp(-1/(.004*sampleRate));this.d=1-Math.exp(-1/(.09*sampleRate));this.hold=Math.floor(.15*sampleRate);}"+
"process(i,o,p){var a=i[0],b=o[0];if(!a||!a.length||!b||!b.length)return true;var n=a[0].length,t=p.thr[0],cc=Math.min(a.length,b.length);"+
"for(var s=0;s<n;s++){var m=0;for(var c=0;c<cc;c++){var v=a[c][s];if(v<0)v=-v;if(v>m)m=v;}this.e=m>this.e?m:this.e*.9995;"+
"var open=this.e>t;if(open)this.h=this.hold;else if(this.h>0)this.h--;var tg=(open||this.h>0)?1:.06;this.g+=(tg-this.g)*(tg>this.g?this.a:this.d);"+
"for(var c2=0;c2<cc;c2++)b[c2][s]=a[c2][s]*this.g;}return true;}}registerProcessor('amiyo-gate',G);";
var url=null, ready=new WeakMap();
function prep(ctx){
  if(ready.has(ctx)) return ready.get(ctx);
  var pr; try{
    if(!ctx.audioWorklet) pr=Promise.resolve(false);
    else{ if(!url) url=URL.createObjectURL(new Blob([CODE],{type:"application/javascript"})); pr=ctx.audioWorklet.addModule(url).then(function(){ return true; },function(){ return false; }); }
  }catch(e){ pr=Promise.resolve(false); }
  ready.set(ctx,pr); pr.then(function(ok){ try{ ctx.__amiyoGateOk=ok; }catch(e){} }); return pr;
}
function makeup(T,R){ return Math.pow(1/Math.pow(10,(T+(-T)/R)/20),.6); }
function build(ctx,cfg){
  var d=P[cfg.l]||P.normal, n=[];
  function bq(type,f,q,g){ var b=ctx.createBiquadFilter(); b.type=type; b.frequency.value=f; if(q!=null) b.Q.value=q; if(g!=null) b.gain.value=g; n.push(b); return b; }
  var hp=bq("highpass",80,.7), mud=bq("peaking",250,1,-2), pres=bq("peaking",3200,.9,d.pres), air=bq("highshelf",10000,null,1.5);
  var cp=ctx.createDynamicsCompressor(); cp.threshold.value=-24; cp.knee.value=8; cp.ratio.value=d.r; cp.attack.value=.006; cp.release.value=.18;
  var post=ctx.createGain(); post.gain.value=1.26/makeup(-24,d.r); n.push(cp,post);
  var last=hp; hp.connect(mud); last=mud;
  if(ctx.__amiyoGateOk){ try{ var g=new AudioWorkletNode(ctx,"amiyo-gate"); g.parameters.get("thr").value=Math.pow(10,d.g/20); last.connect(g); last=g; n.push(g); }catch(e){} }
  last.connect(pres); pres.connect(air); air.connect(cp); cp.connect(post);
  return {input:hp,output:post,nodes:n};
}
var live=new Map();
function dl(){ return (window.amiyoDeess&&window.amiyoDeess.live)||new Map(); }
function tailOf(c,p){ var r=dl().get(c.id); return (r&&r.p===p&&r.chain)?r.chain.output:p; }
function unwire(r){ try{ r.chain.nodes.forEach(function(x){ try{ x.disconnect(); }catch(e){} }); }catch(e){} try{ r.tail.disconnect(r.chain.input); }catch(e){} }
function one(c){
  var p=(typeof trackPanners!=="undefined")?trackPanners.get(c.id):null; if(!p) return;
  var r=live.get(c.id), cfg=c.cleanFx, ctx=p.context;
  if(!cfg){ if(r){ unwire(r); try{ r.tail.connect(ctx.destination); }catch(e){} live.delete(c.id); } return; }
  if(!ready.has(ctx)){ prep(ctx).then(function(){ sync(); }); return; }
  if(!ctx.__amiyoGateOk&&ready.get(ctx)&&!r){ /* gate unavailable: continue without it */ }
  var tail=tailOf(c,p), sig=cfg.l+"|"+(ctx.__amiyoGateOk?1:0);
  if(r&&r.sig===sig&&r.tail===tail&&r.p===p){ try{ tail.disconnect(ctx.destination); }catch(e){} return; }
  if(r) unwire(r);
  var ch=build(ctx,cfg);
  try{ tail.disconnect(ctx.destination); }catch(e){}
  tail.connect(ch.input); ch.output.connect(ctx.destination); live.set(c.id,{sig:sig,chain:ch,p:p,tail:tail});
}
function clips(){ var o=[]; (project.tracks||[]).forEach(function(t){ if(t.kind==="audio") (t.clips||[]).forEach(function(c){ o.push(c); }); }); return o; }
function sync(){ try{ var seen={}; clips().forEach(function(c){ if(c.cleanFx||live.has(c.id)){ seen[c.id]=1; try{ one(c); }catch(e){ console.warn("clean sync",e); } } });
  live.forEach(function(r,id){ if(!seen[id]){ unwire(r); try{ r.tail.connect(r.p.context.destination); }catch(e){} live.delete(id); } }); }catch(e){} }
var pe=window.ensureAudioElement; if(typeof pe==="function") window.ensureAudioElement=async function(clip){ var el=await pe.apply(this,arguments); if(el&&clip&&clip.cleanFx) one(clip); return el; };
var pu=window.updateAudioPlayback; if(typeof pu==="function") window.updateAudioPlayback=async function(){ var r=await pu.apply(this,arguments); sync(); return r; };
var qf=0, pr=window.renderAll; if(typeof pr==="function") window.renderAll=function(){ var r=pr.apply(this,arguments); if(!qf) qf=requestAnimationFrame(function(){ qf=0; sync(); }); return r; };
function targets(){ return kit.sel().filter(function(x){ return x.track.kind==="audio"; }).map(function(x){ return x.clip.id; }); }
function apply(fn,label){
  var ids=targets(); if(!ids.length){ kit.say("Select an audio clip first"); return false; }
  kit.edit(label,function(){ clips().forEach(function(c){ if(ids.indexOf(c.id)>=0) fn(c); }); }); sync(); return ids.length;
}
function body(){
  var ids=targets(), f=ids.length?clips().filter(function(c){ return c.id===ids[0]; })[0]:null, cur=f&&f.cleanFx;
  var h='<div class="note">'+(ids.length?ids.length+" audio clip"+(ids.length>1?"s":"")+" selected."+(cur?" Now: "+(P[cur.l]||P.normal).n+".":" Not cleaned yet."):"Select an audio clip first.")+'</div><div class="g">';
  Object.keys(P).forEach(function(k){ h+='<button type="button" data-k="'+k+'" style="'+(cur&&cur.l===k?"border-color:#ffb454;color:#ffb454":"")+'">'+P[k].n+'</button>'; });
  return h+'<button type="button" data-k="off">Off</button></div><div class="note">Low-cut, mud cut, noise gate, presence and air EQ, compressor and make-up gain in one tap. Light keeps room tone, Strong removes more noise.</div>';
}
var sh=kit.sheet("akClean","\ud83c\udf99 Voice clean-up",body,function(k,b,api){
  if(P[k]) apply(function(c){ c.cleanFx={l:k}; },"Voice clean-up: "+P[k].n);
  else if(k==="off") apply(function(c){ delete c.cleanFx; },"Voice clean-up off");
  api.paint();
});
window.amiyoClean={open:sh.open,build:build,prep:prep,sync:sync,live:live};
kit.menu("\ud83c\udf99 Voice clean-up",sh.open,"Voice clean-up","amiyoClean.open()");
try{ window.AMIYO_EDITOR_BUILD="vs-step05-clean"; }catch(e){}
})();

;
/* ==================== Script 509 id="amiyo-vs-step06-adjlook" ==================== */
/* Video Studio step 6 (Premiere adjustment layers + shared look): put one grade over many shots and keep it in sync.
   Open Pr tools > "Adjustment looks".
   - "Add over selected clips": an adjustment layer that exactly covers the selected shots (start of the first to end of the last).
   - Shared looks: save an adjustment layer's effects as a named look, link other adjustment layers to it, then "Update look from selected layer"
     to push your edits to every linked layer at once. "Unlink" makes a layer independent again. One undo step each. Looks are saved in the project. */
(function(){
"use strict";
var kit=window.amiyoKit; if(!kit||window.amiyoAdjLook) return;
function looks(){ project.settings=project.settings||{}; if(!Array.isArray(project.settings.sharedLooks)) project.settings.sharedLooks=[]; return project.settings.sharedLooks; }
function newId(p){ try{ return uid(p); }catch(e){ return p+"_"+Math.random().toString(36).slice(2,9); } }
function advs(){ return kit.sel().filter(function(x){ return x.clip.kind==="adjustment"; }); }
function allAdj(){ var o=[]; (project.tracks||[]).forEach(function(t){ (t.clips||[]).forEach(function(c){ if(c.kind==="adjustment") o.push(c); }); }); return o; }
function cloneFx(fx){ return (fx||[]).map(function(x){ var n=JSON.parse(JSON.stringify(x)); n.id=newId("fx"); return n; }); }
function linked(id){ return allAdj().filter(function(c){ return c.sharedLook===id; }); }
function refresh(){ try{ renderAll(); }catch(e){} try{ if(window.renderPreviewFrame) renderPreviewFrame(); }catch(e){} }
function addOver(){
  var L=kit.sel().filter(function(x){ return x.clip.kind!=="adjustment"&&x.track.kind!=="audio"; });
  if(!L.length){ kit.say("Select the video clips to cover first"); return; }
  var a=Infinity,b=0; L.forEach(function(x){ a=Math.min(a,x.clip.start); b=Math.max(b,x.clip.start+x.clip.duration); });
  kit.edit("Adjustment over selection",function(){
    var n=project.tracks.filter(function(t){ return t.isAdjustmentTrack; }).length+1, idx=project.tracks.map(function(t){ return t.kind; }).lastIndexOf("video");
    var tr={id:newId("track"),name:"Adjustment "+n,kind:"video",locked:false,hidden:false,muted:false,clips:[],isAdjustmentTrack:true};
    project.tracks.splice(idx+1,0,tr);
    var c={id:newId("clip"),kind:"adjustment",name:"Adjustment Layer",start:a,duration:Math.max(.1,b-a),opacity:1,effects:[]};
    tr.clips.push(c); try{ selectedClipId=c.id; selectedTrackId=tr.id; }catch(e){}
  });
  refresh(); kit.say("Adjustment layer added over "+L.length+" clip"+(L.length>1?"s":""));
}
function body(){
  var S=advs(), LS=looks(), h='<h5>Cover shots</h5><button type="button" data-k="over">Add adjustment over selected clips</button><button type="button" data-k="add">Add adjustment at playhead</button>';
  h+='<h5>Shared looks</h5><div class="note">'+(S.length?S.length+" adjustment layer"+(S.length>1?"s":"")+" selected.":"Select an adjustment layer to save, link or update a look.")+'</div>';
  if(LS.length){ h+='<div class="g">'; LS.forEach(function(l,i){ var on=S.length&&S.every(function(x){ return x.clip.sharedLook===l.id; }); h+='<button type="button" data-k="L'+i+'" style="'+(on?"border-color:#ffb454;color:#ffb454":"")+'">'+String(l.name).replace(/</g,"&lt;")+" ("+linked(l.id).length+")</button>"; }); h+='</div><div class="note">Tap a look to link the selected layers to it.</div>'; }
  else h+='<div class="note">No looks yet.</div>';
  return h+'<button type="button" data-k="save">New look from selected layer</button><button type="button" data-k="upd">Update look from selected layer (push to all linked)</button><button type="button" data-k="unl">Unlink selected layers</button><button type="button" data-k="del">Delete look of selected layer</button>';
}
var sh=kit.sheet("akAdjLook","\u25d0 Adjustment looks",body,function(k,b,api){
  var S=advs(), LS=looks();
  if(k==="over") addOver();
  else if(k==="add"){ try{ window.addAdjustmentLayer(); }catch(e){} }
  else if(k==="save"){
    if(!S.length){ kit.say("Select an adjustment layer first"); return; }
    var nm="Look "+(LS.length+1); try{ nm=(window.prompt("Name this look",nm)||nm).slice(0,30); }catch(e){}
    var c=S[0].clip, id=newId("look");
    kit.edit("Save shared look",function(){ looks().push({id:id,name:nm,fx:cloneFx(c.effects),op:c.opacity==null?1:c.opacity}); c.sharedLook=id; });
    kit.say("Look \u201c"+nm+"\u201d saved and linked");
  }
  else if(k.charAt(0)==="L"&&LS[+k.slice(1)]){
    if(!S.length){ kit.say("Select an adjustment layer first"); return; }
    var l=LS[+k.slice(1)];
    kit.edit("Link shared look",function(){ S.forEach(function(x){ x.clip.effects=cloneFx(l.fx); x.clip.opacity=l.op; x.clip.sharedLook=l.id; }); }); refresh();
    kit.say("Linked to \u201c"+l.name+"\u201d");
  }
  else if(k==="upd"){
    var sc=S.length?S[0].clip:null, lk=sc&&LS.filter(function(x){ return x.id===sc.sharedLook; })[0];
    if(!lk){ kit.say("Select a layer that is linked to a look"); return; }
    var n=0;
    kit.edit("Update shared look",function(){ lk.fx=cloneFx(sc.effects); lk.op=sc.opacity==null?1:sc.opacity;
      allAdj().forEach(function(c){ if(c.sharedLook===lk.id&&c!==sc){ c.effects=cloneFx(lk.fx); c.opacity=lk.op; n++; } }); });
    refresh(); kit.say("Look updated on "+n+" other layer"+(n===1?"":"s"));
  }
  else if(k==="unl"){ if(!S.length){ kit.say("Select an adjustment layer first"); return; } kit.edit("Unlink look",function(){ S.forEach(function(x){ delete x.clip.sharedLook; }); }); }
  else if(k==="del"){
    var d=S.length&&S[0].clip.sharedLook; if(!d){ kit.say("Select a layer that is linked to a look"); return; }
    kit.edit("Delete shared look",function(){ project.settings.sharedLooks=looks().filter(function(x){ return x.id!==d; }); allAdj().forEach(function(c){ if(c.sharedLook===d) delete c.sharedLook; }); });
  }
  api.paint();
});
window.amiyoAdjLook={open:sh.open,addOver:addOver};
kit.menu("\u25d0 Adjustment looks",sh.open,"Adjustment looks","amiyoAdjLook.open()");
try{ window.AMIYO_EDITOR_BUILD="vs-step06-adjlook"; }catch(e){}
})();

;
/* ==================== Script 510 id="amiyo-vs-step07-wheels" ==================== */
/* Video Studio step 7 (Premiere Lumetri colour wheels): four wheels + saturation, on clips AND adjustment layers.
   Open Pr tools > "Color wheels", select a video clip or an adjustment layer. Wheels: Shadows, Midtones, Highlights and Master (whole picture).
   Drag a puck toward a colour to tint that range; the slider under each wheel lifts or lowers its brightness; double-tap a wheel to reset it.
   Saturation slider (0 to 200%) and one-tap looks (Teal & orange, Warm film, Cool night, Bleach). Every change is one undo step.
   On an adjustment layer the grade covers everything beneath it. Works in preview and export. Stored on the clip as lumWheels (separate from the older wheels). */
(function(){
"use strict";
var kit=window.amiyoKit; if(!kit||window.amiyoWheels) return;
var KEYS=[["shadows","Shadows"],["midtones","Midtones"],["highlights","Highlights"],["master","Master"]], SZ=72;
var PRE={tealorange:{n:"Teal & orange",shadows:{x:-.55,y:.35,l:-4},midtones:{x:0,y:0,l:0},highlights:{x:.6,y:-.3,l:3},master:{x:0,y:0,l:0},sat:112},
  warm:{n:"Warm film",shadows:{x:.1,y:.15,l:-3},midtones:{x:.25,y:-.15,l:0},highlights:{x:.35,y:-.25,l:2},master:{x:.1,y:-.05,l:0},sat:96},
  cool:{n:"Cool night",shadows:{x:-.4,y:.5,l:-6},midtones:{x:-.3,y:.3,l:-2},highlights:{x:-.2,y:.2,l:0},master:{x:0,y:0,l:-2},sat:90},
  bleach:{n:"Bleach",shadows:{x:0,y:0,l:-6},midtones:{x:0,y:0,l:0},highlights:{x:0,y:0,l:6},master:{x:0,y:0,l:0},sat:55}};
function def(){ return {shadows:{x:0,y:0,l:0},midtones:{x:0,y:0,l:0},highlights:{x:0,y:0,l:0},master:{x:0,y:0,l:0},sat:100}; }
function norm(w){ var d=def(); if(!w) return d; KEYS.forEach(function(k){ var v=w[k[0]]||{}; d[k[0]]={x:+v.x||0,y:+v.y||0,l:+v.l||0}; }); d.sat=typeof w.sat==="number"?w.sat:100; return d; }
function active(w){ if(!w) return false; if(Math.abs((typeof w.sat==="number"?w.sat:100)-100)>.5) return true; return KEYS.some(function(k){ var v=w[k[0]]; return v&&(Math.abs(v.x||0)>.02||Math.abs(v.y||0)>.02||Math.abs(v.l||0)>.5); }); }
function hsv(h,s){ var c=s,x=c*(1-Math.abs((h/60)%2-1)),r,g,b; if(h<60){r=c;g=x;b=0;}else if(h<120){r=x;g=c;b=0;}else if(h<180){r=0;g=c;b=x;}else if(h<240){r=0;g=x;b=c;}else if(h<300){r=x;g=0;b=c;}else{r=c;g=0;b=x;} var m=1-c; return [r+m,g+m,b+m]; }
function tint(w,max){ var d=Math.min(1,Math.sqrt(w.x*w.x+w.y*w.y)); if(d<.01) return [0,0,0]; var a=((Math.atan2(w.y,w.x)*180/Math.PI)+360)%360, c=hsv(a,1); return [(c[0]-.5)*2*d*max,(c[1]-.5)*2*d*max,(c[2]-.5)*2*d*max]; }
function pass(d,w){
  var s=tint(w.shadows,40),m=tint(w.midtones,40),h=tint(w.highlights,40),g=tint(w.master,40), sl=w.shadows.l,ml=w.midtones.l,hl=w.highlights.l,gl=w.master.l, sat=Math.max(0,w.sat/100);
  for(var i=0;i<d.length;i+=4){
    var r=d[i],gg=d[i+1],b=d[i+2], l=(.299*r+.587*gg+.114*b)/255, t=Math.min(1,l/.55), u=Math.max(0,Math.min(1,(l-.45)/.55)),
        ws=(1-t)*(1-t), wh=u*u, wm=Math.max(0,1-ws-wh), add=sl*ws+ml*wm+hl*wh+gl;
    r+=s[0]*ws+m[0]*wm+h[0]*wh+g[0]+add; gg+=s[1]*ws+m[1]*wm+h[1]*wh+g[1]+add; b+=s[2]*ws+m[2]*wm+h[2]*wh+g[2]+add;
    if(sat!==1){ var y=.299*r+.587*gg+.114*b; r=y+(r-y)*sat; gg=y+(gg-y)*sat; b=y+(b-y)*sat; }
    d[i]=r<0?0:(r>255?255:r); d[i+1]=gg<0?0:(gg>255?255:gg); d[i+2]=b<0?0:(b>255?255:b);
  }
}
function listFor(vc){
  var o=[]; if(vc&&vc.clip&&active(vc.clip.lumWheels)) o.push(norm(vc.clip.lumWheels));
  try{ (project.tracks||[]).forEach(function(t){ if(t.kind!=="video"||t.hidden) return; (t.clips||[]).forEach(function(c){
    if(!c.off&&c.kind==="adjustment"&&active(c.lumWheels)&&currentTime>=c.start&&currentTime<c.start+c.duration) o.push(norm(c.lumWheels)); }); }); }catch(e){}
  return o;
}
if(typeof window.amiyoAfterFrame==="function") window.amiyoAfterFrame(function(vc){
  var L=listFor(vc); if(!L.length) return;
  var W=canvas.width,H=canvas.height,img; try{ img=ctx.getImageData(0,0,W,H); }catch(e){ return; }
  L.forEach(function(w){ pass(img.data,w); }); ctx.putImageData(img,0,0);
});
/* ---------- UI ---------- */
function target(){ try{ var f=getClip(); if(f&&f.clip&&(f.clip.kind==="adjustment"||f.track.kind==="video")&&f.clip.kind!=="text") return f.clip; }catch(e){} return null; }
var bg=null;
function wheelBg(){ if(bg) return bg; var c=document.createElement("canvas"); c.width=c.height=SZ; var x=c.getContext("2d"),im=x.createImageData(SZ,SZ),r=SZ/2-2,cx=SZ/2;
  for(var py=0;py<SZ;py++) for(var px=0;px<SZ;px++){ var dx=px-cx,dy=py-cx,d=Math.sqrt(dx*dx+dy*dy)/r,i=(py*SZ+px)*4; if(d>1){ im.data[i+3]=0; continue; } var a=((Math.atan2(dy,dx)*180/Math.PI)+360)%360,q=hsv(a,d); im.data[i]=q[0]*255; im.data[i+1]=q[1]*255; im.data[i+2]=q[2]*255; im.data[i+3]=255; }
  x.putImageData(im,0,0); bg=c; return c; }
function draw(cv,v){ var x=cv.getContext("2d"),r=SZ/2-2,cx=SZ/2; x.clearRect(0,0,SZ,SZ); x.drawImage(wheelBg(),0,0); x.beginPath(); x.arc(cx+v.x*r,cx+v.y*r,5,0,6.2832); x.fillStyle="#fff"; x.fill(); x.lineWidth=1.5; x.strokeStyle="#111"; x.stroke(); }
function body(){
  var c=target(); if(!c) return '<div class="note">Select a video clip or an adjustment layer first.</div>';
  var w=norm(c.lumWheels), h='<div class="note">'+(c.kind==="adjustment"?"Adjustment layer: grades everything beneath it.":"Grades this clip.")+' Double-tap a wheel to reset it.</div><div class="g">';
  KEYS.forEach(function(k){ h+='<div style="text-align:center"><canvas class="lwc" data-w="'+k[0]+'" width="'+SZ+'" height="'+SZ+'" style="border-radius:50%;touch-action:none;cursor:crosshair"></canvas><div class="note">'+k[1]+'</div><input class="lws" data-w="'+k[0]+'" type="range" min="-50" max="50" step="1" value="'+w[k[0]].l+'" style="width:100%"></div>'; });
  h+='</div><label>Saturation <span id="lwSatV">'+Math.round(w.sat)+'%</span><input id="lwSat" type="range" min="0" max="200" step="1" value="'+w.sat+'"></label><h5>One-tap looks</h5><div class="g">';
  Object.keys(PRE).forEach(function(k){ h+='<button type="button" data-k="p'+k+'">'+PRE[k].n+'</button>'; });
  return h+'</div><button type="button" data-k="reset">Reset all wheels</button>';
}
var gest=null;
function begin(){ if(!gest) gest=deepClone(serializableProject()); }
function commit(label){ if(!gest) return; var b=gest; gest=null; try{ if(JSON.stringify(b)===JSON.stringify(serializableProject())) return; }catch(e){}
  try{ pushHistory(label,b); }catch(e){ try{ project.history.entries.push({label:label,before:b,after:serializableProject()}); project.history.index=project.history.entries.length-1; }catch(x){} } try{ scheduleAutosave(); }catch(e){} }
function redraw(){ try{ renderPreviewFrame(); }catch(e){} }
function setup(){
  var root=document.querySelector("#akWheels .body"), c=target(); if(!root||!c) return;
  c.lumWheels=norm(c.lumWheels);
  root.querySelectorAll(".lwc").forEach(function(cv){
    var key=cv.getAttribute("data-w"), last=0; draw(cv,c.lumWheels[key]);
    function at(e){ var r=cv.getBoundingClientRect(), x=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1)), y=Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1)), d=Math.min(1,Math.sqrt(x*x+y*y)), a=Math.atan2(y,x);
      c.lumWheels[key].x=Math.cos(a)*d; c.lumWheels[key].y=Math.sin(a)*d; draw(cv,c.lumWheels[key]); redraw(); }
    cv.addEventListener("pointerdown",function(e){
      e.preventDefault(); begin(); var now=Date.now();
      if(now-last<320){ c.lumWheels[key]={x:0,y:0,l:0}; draw(cv,c.lumWheels[key]); var sl=root.querySelector('.lws[data-w="'+key+'"]'); if(sl) sl.value=0; redraw(); commit("Reset wheel"); last=0; return; }
      last=now; at(e);
      var mv=function(ev){ at(ev); }, up=function(){ document.removeEventListener("pointermove",mv); document.removeEventListener("pointerup",up); commit("Color wheel"); };
      document.addEventListener("pointermove",mv); document.addEventListener("pointerup",up);
    });
  });
  root.querySelectorAll(".lws").forEach(function(sl){ var key=sl.getAttribute("data-w");
    sl.addEventListener("input",function(){ begin(); c.lumWheels[key].l=+sl.value; redraw(); }); sl.addEventListener("change",function(){ commit("Wheel brightness"); }); });
  var s=root.querySelector("#lwSat"); if(s){ s.addEventListener("input",function(){ begin(); c.lumWheels.sat=+s.value; var v=root.querySelector("#lwSatV"); if(v) v.textContent=Math.round(+s.value)+"%"; redraw(); }); s.addEventListener("change",function(){ commit("Saturation"); }); }
}
var sh=kit.sheet("akWheels","\ud83c\udfa8 Color wheels",body,function(k,b,api){
  var c=target(); if(!c){ kit.say("Select a video clip or adjustment layer first"); return; }
  if(k.charAt(0)==="p"&&PRE[k.slice(1)]){ var p=PRE[k.slice(1)]; kit.edit("Color look: "+p.n,function(){ c.lumWheels=norm(JSON.parse(JSON.stringify(p))); }); }
  else if(k==="reset") kit.edit("Reset wheels",function(){ c.lumWheels=def(); });
  api.paint(); setup(); redraw();
});
function openIt(){ sh.open(); setup(); }
window.amiyoWheels={open:openIt,pass:pass,norm:norm};
kit.menu("\ud83c\udfa8 Color wheels",openIt,"Color wheels","amiyoWheels.open()");
try{ window.AMIYO_EDITOR_BUILD="vs-step07-wheels"; }catch(e){}
})();

;
/* ==================== Script 511 id="amiyo-vs-step08-curves" ==================== */
/* Video Studio step 8 (Premiere keyframe graph editor): volume keyframes now have real curves.
   Open Pr tools > "Volume curves", select an audio clip. You see the whole volume line. Tap a dot to pick the segment after it, drag dots to
   change time and level. For that segment choose Linear, Ease in/out, Hold or drag the two bezier handles (presets: Smooth, Fast start, Slow start, Snap).
   The curve is used live, in the video export and in the WAV export. One undo step per change. */
(function(){
"use strict";
var kit=window.amiyoKit; if(!kit||window.amiyoCurves) return;
var sel=0, drag=null, gest=null;
var EZ=[["linear","Linear"],["ease-in","Ease in"],["ease-out","Ease out"],["ease-in-out","Ease in-out"],["hold","Hold"]];
var PR={Smooth:[.42,0,.58,1],"Fast start":[0,.6,.3,1],"Slow start":[.7,0,1,.4],Snap:[.9,0,.1,1]};
function ease(k,p){ if(!k||!k.easing||k.easing==="linear"||!window.__amiyoEase) return p; return window.__amiyoEase(k.easing,p,k); }
function clipOf(){ try{ var f=getClip(); if(f&&f.clip&&f.track.kind==="audio") return f.clip; }catch(e){} return null; }
function K(c){ c.volumeKeyframes=c.volumeKeyframes||[]; c.volumeKeyframes.sort(function(a,b){ return a.t-b.t; }); return c.volumeKeyframes; }
function vAt(c,t){ var k=K(c); if(!k.length) return Math.max(0,Math.min(1,c.volume==null?1:c.volume)); if(t<=k[0].t) return k[0].v; if(t>=k[k.length-1].t) return k[k.length-1].v;
  for(var i=0;i<k.length-1;i++) if(t>=k[i].t&&t<=k[i+1].t){ var p=(t-k[i].t)/Math.max(1e-4,k[i+1].t-k[i].t), e=ease(k[i],p); return Math.max(0,Math.min(1,k[i].v+(k[i+1].v-k[i].v)*e)); } return 1; }
function envSvg(c){
  var k=K(c), d=Math.max(.1,c.duration), pts=[], i, h='';
  for(i=0;i<=100;i++) pts.push((5+i/100*290).toFixed(1)+","+(75-vAt(c,i/100*d)*70).toFixed(1));
  h='<svg viewBox="0 0 300 80" style="width:100%;touch-action:none;background:#0c0b09;border-radius:8px"><polyline fill="none" stroke="#ffb454" stroke-width="2" points="'+pts.join(" ")+'"/>';
  k.forEach(function(q,j){ h+='<circle data-kf="'+j+'" cx="'+(5+q.t/d*290).toFixed(1)+'" cy="'+(75-q.v*70).toFixed(1)+'" r="'+(j===sel?7:5)+'" fill="'+(j===sel?"#ffb454":"#f1ece2")+'" stroke="#111" stroke-width="1.5"/>'; });
  return h+'</svg>';
}
function segSvg(c){
  var k=K(c), a=k[sel]; if(!a||!k[sel+1]) return '';
  var h='<svg viewBox="0 0 200 150" style="width:100%;max-width:260px;touch-action:none;background:#0c0b09;border-radius:8px;display:block;margin:0 auto"><rect x="20" y="25" width="160" height="90" fill="none" stroke="#302c26"/>', pts=[], i;
  for(i=0;i<=40;i++) pts.push((20+i/40*160).toFixed(1)+","+(115-ease(a,i/40)*90).toFixed(1));
  h+='<polyline fill="none" stroke="#ffb454" stroke-width="2" points="'+pts.join(" ")+'"/>';
  if(a.easing==="bezier"&&a.bez){ var b=a.bez, x1=20+b[0]*160,y1=115-b[1]*90,x2=20+b[2]*160,y2=115-b[3]*90;
    h+='<line x1="20" y1="115" x2="'+x1+'" y2="'+y1+'" stroke="#8f8777"/><line x1="180" y1="25" x2="'+x2+'" y2="'+y2+'" stroke="#8f8777"/><circle data-h="0" cx="'+x1+'" cy="'+y1+'" r="8" fill="#ffb454" stroke="#111" stroke-width="1.5"/><circle data-h="1" cx="'+x2+'" cy="'+y2+'" r="8" fill="#ffb454" stroke="#111" stroke-width="1.5"/>'; }
  return h+'</svg>';
}
function btn(k,t,on){ return '<button type="button" data-k="'+k+'" style="'+(on?"border-color:#ffb454;color:#ffb454":"")+'">'+t+'</button>'; }
function body(){
  var c=clipOf(); if(!c) return '<div class="note">Select an audio clip first.</div>';
  var k=K(c); if(k.length<2) return '<div class="note">This clip has no volume curve yet.</div><button type="button" data-k="init">Add start and end keyframes</button>';
  if(sel>k.length-2) sel=k.length-2; if(sel<0) sel=0;
  var a=k[sel], b=k[sel+1], h='<div class="note">Tap a dot to pick its segment. Drag dots to move them.</div><div id="vcEnv">'+envSvg(c)+'</div>';
  h+='<div class="note">Segment '+(sel+1)+' of '+(k.length-1)+': '+a.t.toFixed(1)+' s ('+Math.round(a.v*100)+'%) to '+b.t.toFixed(1)+' s ('+Math.round(b.v*100)+'%)</div><div class="g">';
  EZ.forEach(function(e){ h+=btn("e:"+e[0],e[1],(a.easing||"linear")===e[0]); }); h+=btn("e:bezier","Bezier",a.easing==="bezier")+'</div>';
  h+='<div id="vcSeg">'+segSvg(c)+'</div>';
  if(a.easing==="bezier"){ h+='<div class="g">'; Object.keys(PR).forEach(function(n){ h+=btn("b:"+n,n,false); }); h+='</div>'; }
  return h+'<div class="g"><button type="button" data-k="addp">Add keyframe at playhead</button><button type="button" data-k="del">Delete this keyframe</button></div>';
}
function begin(){ if(!gest) gest=deepClone(serializableProject()); }
function commit(label){ if(!gest) return; var b=gest; gest=null; try{ if(JSON.stringify(b)===JSON.stringify(serializableProject())) return; }catch(e){}
  try{ pushHistory(label,b); }catch(e){ try{ project.history.entries.push({label:label,before:b,after:serializableProject()}); project.history.index=project.history.entries.length-1; }catch(x){} } try{ scheduleAutosave(); renderTracks(); }catch(e){} }
function setup(){
  var root=document.querySelector("#akCurves .body"); if(!root||root.__vc) return; root.__vc=1;
  root.addEventListener("pointerdown",function(e){
    var c=clipOf(); if(!c) return; var t=e.target.closest&&e.target.closest("circle"); if(!t) return;
    e.preventDefault(); begin();
    if(t.hasAttribute("data-kf")){ sel=+t.getAttribute("data-kf"); drag={type:"kf",i:sel,key:K(c)[sel]}; var s=root.querySelector("#vcSeg"); if(s) s.innerHTML=segSvg(c); }
    else drag={type:"h",h:+t.getAttribute("data-h")};
    var mv=function(ev){ move(ev,c,root); }, up=function(){ document.removeEventListener("pointermove",mv); document.removeEventListener("pointerup",up); drag=null; commit("Volume curve"); try{ api0.paint(); }catch(x){} };
    document.addEventListener("pointermove",mv); document.addEventListener("pointerup",up);
  });
}
var api0=null;
function move(ev,c,root){
  if(!drag) return; var k=K(c), d=Math.max(.1,c.duration);
  if(drag.type==="kf"){ var svg=root.querySelector("#vcEnv svg"); if(!svg) return; var r=svg.getBoundingClientRect(), x=(ev.clientX-r.left)/r.width*300, y=(ev.clientY-r.top)/r.height*80, q=drag.key, i=k.indexOf(q);
    var lo=i>0?k[i-1].t+.02:0, hi=i<k.length-1?k[i+1].t-.02:d; if(i===0) hi=lo=0+0; if(i===0){ lo=0; hi=Math.min(k[1].t-.02,d); }
    q.t=Math.max(lo,Math.min(hi,(x-5)/290*d)); q.v=Math.max(0,Math.min(1,(75-y)/70)); if(i===0) q.t=Math.max(0,Math.min(hi,q.t));
    root.querySelector("#vcEnv").innerHTML=envSvg(c); var s=root.querySelector("#vcSeg"); if(s) s.innerHTML=segSvg(c); }
  else{ var sv=root.querySelector("#vcSeg svg"); if(!sv) return; var r2=sv.getBoundingClientRect(), a=k[sel]; if(!a||a.easing!=="bezier") return;
    var px=Math.max(0,Math.min(1,((ev.clientX-r2.left)/r2.width*200-20)/160)), py=Math.max(-.3,Math.min(1.3,(115-(ev.clientY-r2.top)/r2.height*150)/90)), b=(a.bez||[.42,0,.58,1]).slice();
    b[drag.h*2]=+px.toFixed(3); b[drag.h*2+1]=+py.toFixed(3); a.bez=b; root.querySelector("#vcSeg").innerHTML=segSvg(c); root.querySelector("#vcEnv").innerHTML=envSvg(c); }
}
var sh=kit.sheet("akCurves","\ud83d\udcc8 Volume curves",body,function(k,b,api){
  api0=api; var c=clipOf(); if(!c){ kit.say("Select an audio clip first"); return; }
  if(k==="init") kit.edit("Add volume keyframes",function(){ var v=Math.max(0,Math.min(1,c.volume==null?1:c.volume)); c.volumeKeyframes=[{t:0,v:v},{t:c.duration,v:v}]; });
  else if(k==="addp") kit.edit("Add volume keyframe",function(){ var t=currentTime-c.start; if(t<=.02||t>=c.duration-.02){ kit.say("Move the playhead inside the clip"); return false; } var kk=K(c); var v=vAt(c,t); kk.push({t:t,v:v}); K(c); for(var i=0;i<kk.length;i++) if(Math.abs(kk[i].t-t)<1e-6) sel=Math.max(0,i-1); });
  else if(k==="del") kit.edit("Delete volume keyframe",function(){ var kk=K(c); if(kk.length<=2){ kit.say("A curve needs at least 2 keyframes"); return false; } kk.splice(Math.min(sel,kk.length-1),1); });
  else if(k.slice(0,2)==="e:") kit.edit("Volume easing",function(){ var a=K(c)[sel]; if(!a) return false; a.easing=k.slice(2); if(a.easing==="bezier"&&!a.bez) a.bez=[.42,0,.58,1]; });
  else if(k.slice(0,2)==="b:"&&PR[k.slice(2)]) kit.edit("Volume curve preset",function(){ var a=K(c)[sel]; if(!a) return false; a.easing="bezier"; a.bez=PR[k.slice(2)].slice(); });
  api.paint(); setup();
});
function openIt(){ sh.open(); setup(); }
window.amiyoCurves={open:openIt,volumeAt:vAt};
kit.menu("\ud83d\udcc8 Volume curves",openIt,"Volume curves","amiyoCurves.open()");
try{ window.AMIYO_EDITOR_BUILD="vs-step08-curves"; }catch(e){}
})();

;
/* ==================== Script 512 id="amiyo-vs-step09-textfx" ==================== */
/* Video Studio step 9 (Premiere text animation presets): per-letter, per-word and per-line text animations that move in and out.
   Open Pr tools > "Text animation", select a title clip. Pick how the text comes in and goes out (Rise, Drop, Scale, Blur, Fade, Flip, Slide, Typewriter),
   whether letters, words or lines move one after another, and how fast. One-tap styles: Cinematic, Pop words, Typewriter, Drop letters.
   Works with the clip's normal position / scale / opacity keyframes and the Animations panel, in preview and export. One undo step each. */
(function(){
"use strict";
var kit=window.amiyoKit; if(!kit||window.amiyoTextFx) return;
var FX=[["none","None"],["fade","Fade"],["rise","Rise"],["drop","Drop"],["scale","Scale"],["blur","Blur"],["flip","Flip"],["slide","Slide"],["type","Typewriter"]];
var UN=[["letter","Letters"],["word","Words"],["line","Lines"]], SP=[["slow",1.4],["normal",.9],["fast",.5]];
var STY={cin:{n:"Cinematic",i:"blur",o:"fade",u:"letter",ti:1.2,to:.6},pop:{n:"Pop words",i:"scale",o:"scale",u:"word",ti:.9,to:.5},type:{n:"Typewriter",i:"type",o:"none",u:"letter",ti:1.2,to:.4},drop:{n:"Drop letters",i:"drop",o:"rise",u:"letter",ti:.9,to:.6}};
function ez(x){ x=x<0?0:(x>1?1:x); return 1-Math.pow(1-x,3); }
function norm(f){ return {i:f.i||"none",o:f.o||"none",u:f.u||"letter",ti:+f.ti||.9,to:+f.to||.5}; }
function isText(t,c){ return t.kind==="text"||t.kind==="caption"||c.kind==="text"; }
function interp(c,local){
  var x=c.x==null?.5:c.x,y=c.y==null?.5:c.y,sc=c.scale==null?1:c.scale,op=c.opacity==null?1:c.opacity, k=(c.keyframes||[]).slice().sort(function(a,b){ return a.t-b.t; });
  if(k.length){ var a=k[0],b=k[k.length-1],p=0;
    if(local<=k[0].t) b=a; else if(local>=b.t) a=b; else{ for(var i=0;i<k.length-1;i++) if(local>=k[i].t&&local<=k[i+1].t){ a=k[i]; b=k[i+1]; break; } p=Math.max(0,Math.min(1,(local-a.t)/Math.max(1e-4,b.t-a.t))); if(window.__amiyoEase) p=window.__amiyoEase(a.easing,p,a); }
    function m(u,v){ return u+(v-u)*p; } x=m(a.x==null?x:a.x,b.x==null?(a.x==null?x:a.x):b.x); y=m(a.y==null?y:a.y,b.y==null?(a.y==null?y:a.y):b.y);
    sc=m(a.scale==null?sc:a.scale,b.scale==null?(a.scale==null?sc:a.scale):b.scale); op=m(a.opacity==null?op:a.opacity,b.opacity==null?(a.opacity==null?op:a.opacity):b.opacity); }
  return {x:x,y:y,scale:sc,opacity:op};
}
function mod(mode,e,size){
  var r={a:1,dx:0,dy:0,sx:1,sy:1,bl:0}; if(mode==="none") return r; r.a=e;
  if(mode==="rise") r.dy=(1-e)*size*.6; else if(mode==="drop") r.dy=-(1-e)*size*.6; else if(mode==="scale"){ r.sx=r.sy=Math.max(.001,e); }
  else if(mode==="blur") r.bl=(1-e)*10; else if(mode==="flip") r.sy=Math.max(.001,e); else if(mode==="slide") r.dx=-(1-e)*size*.8; else if(mode==="type") r.a=e>0?1:0;
  return r;
}
function units(line,u){ if(u==="line") return [line]; if(u==="word") return line.split(/(\s+)/).filter(function(s){ return s!==""; }); return Array.from(line); }
function drawFx(c){
  var W=canvas.width,H=canvas.height,fx=norm(c.textFx),local=currentTime-c.start,dur=c.duration,s=c.textStyle||{},v=interp(c,local);
  var size=(s.fontSize||64)*v.scale*(s.scale==null?1:s.scale), lines=String(c.text||"").split("\n"), lh=size*1.2, y0=-(lines.length-1)*lh/2, base=Math.max(0,Math.min(1,v.opacity));
  ctx.save(); ctx.translate(v.x*W,v.y*H); ctx.rotate((c.rotation||0)*Math.PI/180); ctx.font=(s.weight||800)+" "+size+"px "+(s.fontFamily||"system-ui"); ctx.textAlign="left"; ctx.textBaseline="middle";
  var list=[],n=0,maxW=0,al=s.align||"center";
  lines.forEach(function(line,li){ var tot=ctx.measureText(line).width, x0=al==="left"?0:(al==="right"?-tot:-tot/2); maxW=Math.max(maxW,tot); var pre="";
    units(line,fx.u).forEach(function(str){ var px=ctx.measureText(pre).width, w=ctx.measureText(str).width, sp=!str.trim(); pre+=str; list.push({str:str,x:x0+px,w:w,y:y0+li*lh,idx:sp?-1:n,sp:sp}); if(!sp) n++; }); });
  var tin=Math.min(fx.ti,dur*.45),tout=Math.min(fx.to,dur*.45), ud=n>1?tin*.55:tin, st=n>1?(tin-ud)/(n-1):0, od=n>1?tout*.55:tout, os=n>1?(tout-od)/(n-1):0, inPhase=local<dur/2, maxA=0;
  list.forEach(function(u){ if(u.sp){ u.m=mod("none",1,size); return; } var e,mode;
    if(inPhase){ mode=fx.i; e=mode==="none"?1:ez((local-u.idx*st)/Math.max(1e-3,ud)); } else{ mode=fx.o; e=mode==="none"?1:1-ez((local-(dur-tout)-u.idx*os)/Math.max(1e-3,od)); }
    u.m=mod(mode,e,size); if(u.m.a>maxA) maxA=u.m.a; });
  if(s.bg){ var padX=s.bgPadX==null?20:s.bgPadX,padY=s.bgPadY==null?12:s.bgPadY,bw=maxW+padX*2,bh=lh*lines.length+padY*2-(lh-size*1.15),bx=al==="left"?-padX:(al==="right"?-bw+padX:-bw/2);
    ctx.save(); ctx.globalAlpha=base*(s.bgOpacity==null?.85:s.bgOpacity)*maxA; ctx.fillStyle=s.bgColor||"#000"; ctx.fillRect(bx,-bh/2+y0*0,bw,bh); ctx.restore(); }
  list.forEach(function(u){ if(u.sp||u.m.a<=.003) return; ctx.save(); ctx.globalAlpha=base*u.m.a; ctx.translate(u.x+u.w/2+u.m.dx,u.y+u.m.dy); ctx.scale(u.m.sx,u.m.sy);
    if(u.m.bl>.2) try{ ctx.filter="blur("+u.m.bl.toFixed(1)+"px)"; }catch(e){}
    if(s.shadow){ ctx.shadowColor=s.shadowColor||"rgba(0,0,0,.55)"; ctx.shadowBlur=s.shadowBlur||18; ctx.shadowOffsetY=s.shadowOffsetY||5; }
    if(s.stroke){ ctx.lineWidth=s.strokeWidth||6; ctx.strokeStyle=s.strokeColor||"#000"; ctx.strokeText(u.str,-u.w/2,0); }
    ctx.fillStyle=s.color||"#fff"; ctx.fillText(u.str,-u.w/2,0); ctx.restore(); });
  ctx.restore();
}
var prev=window.drawOverlays;
if(typeof prev==="function") window.drawOverlays=function(){
  var held=[];
  try{ (project.tracks||[]).forEach(function(t){ if(t.hidden) return; (t.clips||[]).forEach(function(c){ if(c.textFx&&!c.off&&isText(t,c)&&currentTime>=c.start&&currentTime<c.start+c.duration){ held.push([c,c.off]); c.off=true; } }); }); }catch(e){}
  try{ prev.apply(this,arguments); } finally{ held.forEach(function(h){ if(h[1]===undefined) delete h[0].off; else h[0].off=h[1]; }); }
  held.forEach(function(h){ try{ drawFx(h[0]); }catch(e){ console.warn("text fx",e); } });
};
function target(){ try{ var f=getClip(); if(f&&f.clip&&isText(f.track,f.clip)) return f.clip; }catch(e){} return null; }
function btn(k,t,on){ return '<button type="button" data-k="'+k+'" style="'+(on?"border-color:#ffb454;color:#ffb454":"")+'">'+t+'</button>'; }
function body(){
  var c=target(); if(!c) return '<div class="note">Select a title or caption clip first.</div>';
  var f=c.textFx?norm(c.textFx):null, h='<h5>One-tap styles</h5><div class="g">';
  Object.keys(STY).forEach(function(k){ h+=btn("s:"+k,STY[k].n,false); });
  h+='</div><h5>In</h5><div class="g">'+FX.map(function(e){ return btn("i:"+e[0],e[1],f&&f.i===e[0]); }).join("")+'</div><h5>Out</h5><div class="g">'+FX.map(function(e){ return btn("o:"+e[0],e[1],f&&f.o===e[0]); }).join("")+'</div>';
  h+='<h5>Moves by</h5><div class="g">'+UN.map(function(e){ return btn("u:"+e[0],e[1],f&&f.u===e[0]); }).join("")+'</div><h5>Speed</h5><div class="g">'+SP.map(function(e){ return btn("t:"+e[0],e[0].charAt(0).toUpperCase()+e[0].slice(1),f&&Math.abs(f.ti-e[1])<.31); }).join("")+'</div>';
  return h+'<button type="button" data-k="clear">Remove text animation</button>';
}
function setFx(fn,label){
  var c=target(); if(!c){ kit.say("Select a title clip first"); return; }
  kit.edit(label,function(){ var f=norm(c.textFx||{}); fn(f); if(f.i==="none"&&f.o==="none") delete c.textFx; else c.textFx=f; });
  try{ renderPreviewFrame(); }catch(e){}
}
var sh=kit.sheet("akTextFx","\u2728 Text animation",body,function(k,b,api){
  var p=k.slice(0,2), v=k.slice(2);
  if(p==="s:"&&STY[v]) setFx(function(f){ var s=STY[v]; f.i=s.i; f.o=s.o; f.u=s.u; f.ti=s.ti; f.to=s.to; },"Text animation: "+STY[v].n);
  else if(p==="i:") setFx(function(f){ f.i=v; },"Text in");
  else if(p==="o:") setFx(function(f){ f.o=v; },"Text out");
  else if(p==="u:") setFx(function(f){ f.u=v; },"Text moves by");
  else if(p==="t:"){ var sp=SP.filter(function(e){ return e[0]===v; })[0]; if(sp) setFx(function(f){ f.ti=sp[1]; f.to=sp[1]*.6; },"Text speed"); }
  else if(k==="clear"){ var c=target(); if(c) kit.edit("Remove text animation",function(){ delete c.textFx; }); try{ renderPreviewFrame(); }catch(e){} }
  api.paint();
});
window.amiyoTextFx={open:sh.open,draw:drawFx};
kit.menu("\u2728 Text animation",sh.open,"Text animation","amiyoTextFx.open()");
try{ window.AMIYO_EDITOR_BUILD="vs-step09-textfx"; }catch(e){}
})();

;
/* ==================== Script 513 id="amiyo-vs-step10-subfix" ==================== */
/* Video Studio step 10 (Premiere captions: SRT polish and export). The editor already imports and exports SRT / VTT and checks overlaps,
   so this step adds what subtitle files still need before delivery. Open Pr tools > "Subtitle polish".
   Report: lines that are too long, cues read too fast (over 17 characters per second), too short or too long cues, cues that touch or overlap.
   Fixes (each one undo step; they work on the selected captions, or on all captions when none is selected):
   - Wrap & split: re-wraps cues into balanced lines of at most 32 / 42 / 50 characters, and splits cues that need more than two lines.
   - Gaps & frames: snaps cue times to the project frame rate and keeps a two-frame gap between cues.
   - Reading speed: lengthens fast cues into the free time after them (up to 7 s).
   - Fix everything: all three in order.
   Export: all captions as SRT with a UTF-8 byte-order mark (opens correctly in Windows players), or only the selected captions re-timed to start at 0:00. */
(function(){
"use strict";
var kit=window.amiyoKit; if(!kit||window.amiyoSubFix) return;
var maxLen=42, CPS=17, MAXD=7;
function fps(){ try{ return project.settings.fps||30; }catch(e){ return 30; } }
function rows(){ var r=[]; (project.tracks||[]).forEach(function(t){ if(t.kind==="caption") (t.clips||[]).forEach(function(c){ r.push({t:t,c:c}); }); }); r.sort(function(a,b){ return a.c.start-b.c.start; }); return r; }
function targets(){ var s=kit.sel().filter(function(x){ return x.track.kind==="caption"; }); return s.length?s.map(function(x){ return {t:x.track,c:x.clip}; }):rows(); }
function plain(t){ return String(t||"").replace(/\s+/g," ").trim(); }
function wrap(text,max){
  var t=plain(text); if(t.length<=max) return t; var w=t.split(" "), best=null, bs=1e9;
  for(var i=1;i<w.length;i++){ var a=w.slice(0,i).join(" "), b=w.slice(i).join(" "); if(a.length<=max&&b.length<=max){ var s=Math.max(a.length,b.length)-Math.min(a.length,b.length)*.2; if(s<bs){ bs=s; best=a+"\n"+b; } } }
  return best;
}
function chunk(text,max){
  var w=plain(text).split(" "), out=[], cur=[], lim=max*2, len=0;
  w.forEach(function(x,i){ var add=(cur.length?1:0)+x.length;
    if(cur.length&&len+add>lim){ out.push(cur.join(" ")); cur=[]; len=0; add=x.length; }
    cur.push(x); len+=add;
    if(/[.!?\u2026]$/.test(x)&&len>max*.7&&i<w.length-1){ out.push(cur.join(" ")); cur=[]; len=0; } });
  if(cur.length) out.push(cur.join(" ")); return out;
}
function cpsOf(c){ var n=plain(c.text).length; return c.duration>0?n/c.duration:0; }
function longLine(c){ return String(c.text||"").split("\n").some(function(l){ return l.trim().length>maxLen; }); }
function report(){
  var R=rows(), g=2/fps(), r={n:R.length,long:0,fast:0,short:0,slow:0,gap:0}, by={};
  R.forEach(function(x){ var c=x.c; if(!plain(c.text)) return; if(longLine(c)) r.long++; if(cpsOf(c)>CPS+.01) r.fast++; if(c.duration<1) r.short++; if(c.duration>MAXD) r.slow++; (by[x.t.id]=by[x.t.id]||[]).push(c); });
  Object.keys(by).forEach(function(k){ var a=by[k]; for(var i=0;i<a.length-1;i++) if(a[i+1].start-(a[i].start+a[i].duration)<g-1e-4) r.gap++; });
  return r;
}
function doWrap(list){
  var n=0;
  list.forEach(function(x){ var c=x.c, t=plain(c.text); if(!t) return;
    var w=wrap(t,maxLen); if(w!==null){ if(w!==c.text){ c.text=w; n++; } return; }
    var ch=chunk(t,maxLen); if(ch.length<2){ return; }
    var tot=ch.reduce(function(s,q){ return s+q.length; },0), at=c.start, d0=c.duration, base=JSON.parse(JSON.stringify(c));
    ch.forEach(function(q,i){ var d=d0*q.length/tot, tgt=i===0?c:Object.assign(JSON.parse(JSON.stringify(base)),{id:uid("clip")}); tgt.text=wrap(q,maxLen)||q; tgt.start=at; tgt.duration=d; at+=d; if(i>0) x.t.clips.push(tgt); });
    n++; });
  rows().forEach(function(x){}); (project.tracks||[]).forEach(function(t){ if(t.kind==="caption") t.clips.sort(function(a,b){ return a.start-b.start; }); });
  return n;
}
function byTrack(list){ var m={}; list.forEach(function(x){ (m[x.t.id]=m[x.t.id]||[]).push(x.c); }); Object.keys(m).forEach(function(k){ m[k].sort(function(a,b){ return a.start-b.start; }); }); return m; }
function doGaps(list){
  var f=fps(), g=2/f, n=0;
  list.forEach(function(x){ var c=x.c, s=Math.round(c.start*f)/f, e=Math.round((c.start+c.duration)*f)/f; if(e<=s) e=s+1/f; if(Math.abs(s-c.start)>1e-6||Math.abs(e-s-c.duration)>1e-6){ c.start=s; c.duration=e-s; n++; } });
  var m=byTrack(rows().filter(function(x){ return list.some(function(y){ return y.c===x.c; }); }));
  Object.keys(m).forEach(function(k){ var a=m[k]; for(var i=0;i<a.length-1;i++){ var end=a[i].start+a[i].duration, lim=a[i+1].start-g; if(end>lim+1e-6&&lim-a[i].start>=.3){ a[i].duration=lim-a[i].start; n++; } } });
  return n;
}
function doSpeed(list){
  var f=fps(), g=2/f, n=0, all=byTrack(rows()), ids={}; list.forEach(function(x){ ids[x.c.id]=1; });
  Object.keys(all).forEach(function(k){ var a=all[k]; a.forEach(function(c,i){ if(!ids[c.id]||!plain(c.text)||cpsOf(c)<=CPS+.01) return;
    var need=plain(c.text).length/CPS, cap=Math.min(c.start+MAXD,i<a.length-1?a[i+1].start-g:c.start+MAXD), nd=Math.min(need,cap-c.start); nd=Math.floor(nd*f)/f;
    if(nd>c.duration+1e-6){ c.duration=nd; n++; } }); });
  return n;
}
function run(label,fn,msg){
  var L=targets(); if(!L.length){ kit.say("There are no captions yet"); return; }
  var res=null; kit.edit(label,function(){ res=fn(L); });
  try{ if(window.AMIYO_CAPS&&window.AMIYO_CAPS.render) window.AMIYO_CAPS.render(); }catch(e){} try{ renderPreviewFrame(); }catch(e){}
  kit.say(msg(res));
}
function ts(t){ t=Math.max(0,t); var h=Math.floor(t/3600), m=Math.floor(t%3600/60), s=Math.floor(t%60), ms=Math.round((t-Math.floor(t))*1000); if(ms>=1000){ ms=999; } function p(n,l){ return String(n).padStart(l,"0"); } return p(h,2)+":"+p(m,2)+":"+p(s,2)+","+p(ms,3); }
function srt(list,zero){ var a=list.map(function(x){ return x.c; }).filter(function(c){ return plain(c.text); }).sort(function(p,q){ return p.start-q.start; }), o=zero&&a.length?a[0].start:0;
  return a.map(function(c,i){ return (i+1)+"\n"+ts(c.start-o)+" --> "+ts(c.start+c.duration-o)+"\n"+String(c.text).trim()+"\n"; }).join("\n"); }
function save(text,name){ var b=new Blob(["\ufeff"+text],{type:"application/x-subrip;charset=utf-8"}), u=URL.createObjectURL(b), a=document.createElement("a"); a.href=u; a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(u); },1500); }
function name(){ try{ return (project.metadata.name||"subtitles").replace(/[^\w\-]+/g,"_"); }catch(e){ return "subtitles"; } }
function btn(k,t,on){ return '<button type="button" data-k="'+k+'" style="'+(on?"border-color:#ffb454;color:#ffb454":"")+'">'+t+'</button>'; }
function body(){
  var r=report(); if(!r.n) return '<div class="note">No captions yet. Add or import captions first (Captions tab).</div>';
  var sel=kit.sel().some(function(x){ return x.track.kind==="caption"; });
  function row(n,t){ return '<div style="display:flex;justify-content:space-between;font-size:12px;'+(n?"color:#ffb454":"color:#8f8777")+'"><span>'+t+'</span><b>'+n+'</b></div>'; }
  var h='<div class="note">'+r.n+' captions. Fixes apply to '+(sel?"the selected captions":"all captions")+'.</div>'+
    row(r.long,"Lines over "+maxLen+" characters")+row(r.fast,"Read too fast (over "+CPS+" characters per second)")+row(r.short,"Shorter than 1 s")+row(r.slow,"Longer than "+MAXD+" s")+row(r.gap,"Touching or overlapping cues (under 2 frames apart)");
  h+='<h5>Longest line</h5><div class="g">'+[32,42,50].map(function(m){ return btn("m"+m,m+" chars",maxLen===m); }).join("")+'</div>';
  h+='<button type="button" data-k="all">Fix everything</button><div class="g">'+btn("wrap","Wrap & split")+btn("gaps","Gaps & frames")+'</div>'+btn("speed","Fix reading speed");
  return h+'<h5>Export</h5><div class="g">'+btn("exall","All, with UTF-8 BOM")+btn("exsel","Selected, from 0:00")+'</div>';
}
var sh=kit.sheet("akSubFix","\ud83d\udcac Subtitle polish",body,function(k,b,api){
  if(k.charAt(0)==="m"&&!isNaN(+k.slice(1))) maxLen=+k.slice(1);
  else if(k==="wrap") run("Wrap subtitles",doWrap,function(n){ return n?n+" cue"+(n>1?"s":"")+" re-wrapped or split":"All lines already fit"; });
  else if(k==="gaps") run("Subtitle gaps and frames",doGaps,function(n){ return n?n+" cue"+(n>1?"s":"")+" adjusted":"Timing was already clean"; });
  else if(k==="speed") run("Subtitle reading speed",doSpeed,function(n){ var r=report(); return n?n+" cue"+(n>1?"s":"")+" lengthened"+(r.fast?" ("+r.fast+" still too fast: no free time)":""):(r.fast?"No free time after the fast cues":"Reading speed is fine"); });
  else if(k==="all") run("Fix subtitles",function(L){ var a=doWrap(L); var L2=targets(); var c=doSpeed(L2); var d=doGaps(L2); return a+c+d; },function(n){ return n?"Subtitles polished ("+n+" changes)":"Nothing to fix"; });
  else if(k==="exall"){ var L=rows(); if(!L.length){ kit.say("There are no captions yet"); return; } save(srt(L,false),name()+".srt"); kit.say("SRT saved ("+L.length+" cues)"); }
  else if(k==="exsel"){ var S=kit.sel().filter(function(x){ return x.track.kind==="caption"; }).map(function(x){ return {t:x.track,c:x.clip}; }); if(!S.length){ kit.say("Select some captions first"); return; } save(srt(S,true),name()+"_selection.srt"); kit.say("SRT saved ("+S.length+" cues)"); }
  api.paint();
});
window.amiyoSubFix={open:sh.open,wrap:wrap,chunk:chunk,report:report,srt:srt,ts:ts};
kit.menu("\ud83d\udcac Subtitle polish",sh.open,"Subtitle polish","amiyoSubFix.open()");
try{ window.AMIYO_EDITOR_BUILD="vs-step10-subfix"; }catch(e){}
})();

;
/* ==================== Script 514 id="amiyo-vs-step11-proxyflow" ==================== */
/* Video Studio step 11 (Premiere "Toggle Proxies" style): Proxy workflow.
   Open Pr tools > "Proxy workflow". Finds heavy clips (4K / 2.7K, or files over 300 MB), shows which already have a proxy,
   lets you switch proxies on or off for the whole project in one tap, link or remove a proxy per clip, and copy a ready-made
   FFmpeg command that makes a small same-length copy. Preview uses the proxy, export always uses the original. */
(function(){
"use strict";
var kit=window.amiyoKit; if(!kit||window.amiyoProxyFlow) return;
var KEY="amiyo_editor_use_proxy";
function isOn(){ try{ return localStorage.getItem(KEY)!=="0"; }catch(e){ return true; } }
function vids(){ return Object.values(project.assets||{}).filter(function(a){ return a.type==="video"; }); }
function heavy(a){ var w=Math.max(a.width||0,a.height||0), s=Math.min(a.width||9e9,a.height||9e9); return w>=2560||s>=1440||(a.size||0)>300*1048576; }
function used(a){ var u=false; (project.tracks||[]).forEach(function(t){ (t.clips||[]).forEach(function(c){ if(c.assetId===a.id) u=true; }); }); return u; }
function mb(n){ return n?(n/1048576).toFixed(n>1e9?0:1)+" MB":"?"; }
function ensurePanel(){
  try{ if(activePanel!=="media"){ activePanel="media"; } renderLeftPanel(); }catch(e){}
  return document.getElementById("leftPanel");
}
function cmd(a){
  var base=String(a.name||"clip").replace(/\.[^.]+$/,"");
  return 'ffmpeg -i "'+a.name+'" -vf scale=-2:540 -c:v libx264 -preset veryfast -crf 28 -an "'+base+'_proxy.mp4"';
}
function row(a){
  var h=heavy(a), st=a.hasProxy?'<span style="color:#9af0b8">Proxy linked</span>':(h?'<span style="color:#ffb454">Heavy, no proxy</span>':'<span>Light</span>');
  return '<div style="border:1px solid #302c26;border-radius:10px;padding:8px;display:flex;flex-direction:column;gap:6px">'+
    '<div style="display:flex;justify-content:space-between;gap:8px"><b style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+kit.esc(a.name)+'</b>'+st+'</div>'+
    '<div class="note">'+(a.width||"?")+'\u00d7'+(a.height||"?")+' \u00b7 '+mb(a.size)+' \u00b7 '+Math.round(a.duration||0)+' s'+(used(a)?' \u00b7 on timeline':'')+'</div>'+
    '<div class="g"><button type="button" data-k="px:'+a.id+'">'+(a.hasProxy?'Remove proxy':'Link proxy')+'</button><button type="button" data-k="cmd:'+a.id+'">Copy FFmpeg command</button></div></div>';
}
function body(){
  var V=vids(), H=V.filter(heavy), miss=H.filter(function(a){ return !a.hasProxy; }), linked=V.filter(function(a){ return a.hasProxy; }), on=isOn();
  if(!V.length) return '<div class="note">Import a video first. Heavy clips will be listed here.</div>';
  var h='<div class="g"><div>Heavy clips<br><b style="font-size:20px;color:#ffb454">'+H.length+'</b></div><div>Proxies linked<br><b style="font-size:20px">'+linked.length+'</b></div></div>';
  h+='<button type="button" data-k="sw" style="'+(on?"border-color:#9af0b8;color:#9af0b8":"")+'">Use proxies: '+(on?"ON (preview uses proxy)":"OFF (preview uses original)")+'</button>';
  if(!linked.length) h+='<div class="note">The switch has no effect until at least one proxy is linked.</div>';
  if(miss.length) h+='<div class="note">'+miss.length+' heavy clip'+(miss.length>1?'s have':' has')+' no proxy. Make a small copy with the FFmpeg command, then tap Link proxy.</div>';
  h+='<h5>Clips</h5>'+V.slice().sort(function(a,b){ return (heavy(b)?1:0)-(heavy(a)?1:0); }).map(row).join("");
  h+='<div class="note">A proxy must have the same length and shape as the original. Export always renders from the original file.</div>';
  return h;
}
var sh=kit.sheet("akProxy","\u26a1 Proxy workflow",body,function(k,b,api){
  var p=k.split(":"), id=p.slice(1).join(":");
  if(k==="sw"){
    var lp=ensurePanel(), t=lp&&lp.querySelector("#pxToggle");
    if(t){ t.click(); }
    else { kit.say("Link a proxy first, then the switch works"); }
    api.paint(); return;
  }
  var a=project.assets[id]; if(!a) return;
  if(p[0]==="cmd"){
    var c=cmd(a);
    try{ navigator.clipboard.writeText(c).then(function(){ kit.say("FFmpeg command copied"); },function(){ kit.say(c,6000); }); }catch(e){ kit.say(c,6000); }
    return;
  }
  if(p[0]==="px"){
    var lp2=ensurePanel(), btn=lp2&&lp2.querySelector('.asset[data-asset="'+id+'"] .px-btn');
    if(btn){ api.close(); btn.click(); }
    else kit.say("Open the Media tab and tap the \u26a1 on the clip");
  }
});
window.amiyoProxyFlow={open:sh.open,heavy:function(){ return vids().filter(heavy); }};
kit.menu("\u26a1 Proxy workflow",sh.open,"Proxy workflow","amiyoProxyFlow.open()");
try{ window.AMIYO_EDITOR_BUILD="vs-step11-proxyflow"; }catch(e){}
})();

;
/* ==================== Script 515 id="amiyo-vs-step12-queue" ==================== */
/* Video Studio step 12, rebuilt in export plan 2026-11 step 10: Export queue (Premiere / Media Encoder "Queue" style).
   Open the top bar "Queue" button or Pr tools > "Export queue". Add jobs (quick jobs, your My presets, or a custom size), put them in order with the arrows, then Start queue.
   Every job runs through the normal Export dialog (MP4 / WebM, fast export, burned-in timecode, file info, name template, Include switches), so the file is the same one the dialog would make.
   Each job always exports the whole edit. The canvas shape is switched per job and put back when the queue ends (or with one tap after a reload).
   The list is kept in this browser: after a reload or a crash a job that was running shows "interrupted" and Start queue carries on with it and the ones after it. */
(function(){
"use strict";
var kit=window.amiyoKit; if(!kit||window.amiyoQueue) return;
var KEY="amiyo_export_queue_v2", MAXJOBS=60, STATES=["waiting","running","done","failed","cancelled","interrupted"];
var Q=[], running=false, stopReq=false, keepCanvas=null, form={name:"",h:"1080",aspect:"",mbps:"",parts:"0"};
var QUICK=[
  {n:"-youtube",h:1080,aspect:"16:9",mbps:12,label:"YouTube 1080p"},
  {n:"-vertical",h:1080,aspect:"9:16",mbps:10,label:"Vertical 1080p"},
  {n:"-square",h:1080,aspect:"1:1",mbps:8,label:"Square 1080p"},
  {n:"-draft",h:480,aspect:"",mbps:2,label:"Small draft"}
];
function $(id){ return document.getElementById(id); }
function sleep(ms){ return new Promise(function(r){ setTimeout(r,ms); }); }
async function waitFor(fn,ms){ var t=Date.now(); while(Date.now()-t<ms){ var v=fn(); if(v) return v; await sleep(150); } return null; }
function baseName(){ return String((project.metadata&&project.metadata.name)||"amiyo-edit"); }
function num(v,lo,hi,d){ v=Number(v); return isFinite(v)?Math.max(lo,Math.min(hi,v)):d; }
function strip(j){ return {id:j.id,name:j.name,h:j.h,aspect:j.aspect,mbps:j.mbps,parts:j.parts,s:j.s||null,mine:j.mine||"",status:j.status,err:j.err||"",files:j.files||0}; }
function save(){ try{ localStorage.setItem(KEY,JSON.stringify({jobs:Q.map(strip),keep:keepCanvas})); }catch(e){ window.__swl&&window.__swl(e); } }
function fix(j){
  if(!j||typeof j!=="object") return null;
  var name=String(j.name==null?"":j.name).replace(/[\u0000-\u001f<>{}]/g,"").trim().slice(0,120); if(!name) return null;
  var st=STATES.indexOf(j.status)>=0?j.status:"waiting", err=String(j.err||"").slice(0,200);
  if(st==="running"){ st="interrupted"; err="The page was closed or reloaded while this was exporting."; }
  return {id:String(j.id||("q"+Date.now().toString(36)+Math.random().toString(36).slice(2,5))).slice(0,40),name:name,h:num(j.h,0,4320,0),aspect:/^\d{1,2}:\d{1,2}$/.test(j.aspect||"")?j.aspect:"",
    mbps:num(j.mbps,0,60,0),parts:num(j.parts,0,7200,0),s:(j.s&&typeof j.s==="object")?j.s:null,mine:String(j.mine||"").slice(0,40),status:st,err:err,files:num(j.files,0,999,0)};
}
function load(){
  try{ var d=JSON.parse(localStorage.getItem(KEY)||"null"); if(!d||!Array.isArray(d.jobs)) return;
    Q=d.jobs.slice(0,MAXJOBS).map(fix).filter(Boolean);
    keepCanvas=(d.keep&&+d.keep.width>0&&+d.keep.height>0)?{width:+d.keep.width,height:+d.keep.height,aspect:String(d.keep.aspect||"")}:null;
    if(Q.some(function(x){ return x.status==="interrupted"; })) save();
  }catch(e){ Q=[]; }
}
load();
function add(j){
  if(Q.length>=MAXJOBS){ kit.say("The queue is full ("+MAXJOBS+" jobs). Remove some first."); return null; }
  j=fix(Object.assign({},j,{status:"waiting",err:"",files:0,id:""})); if(!j) return null; Q.push(j); save(); return j;
}
function label(j){ return kit.esc(j.name)+" \u00b7 "+(j.mine?("My preset: "+kit.esc(j.mine)):((j.h?j.h+"p":"project size")+(j.aspect?" \u00b7 "+j.aspect:"")+(j.mbps?" \u00b7 "+j.mbps+" Mbps":"")+(j.parts?" \u00b7 "+(j.parts/60)+" min parts":""))); }
function col(s){ return s==="done"?"#9af0b8":s==="running"?"#ffb454":(s==="failed")?"#ff7b7b":(s==="interrupted"||s==="cancelled")?"#e8c46a":"#8f8777"; }
function canvasDiffers(){ try{ var s=project.settings; return !!(keepCanvas&&(s.width!==keepCanvas.width||s.height!==keepCanvas.height)); }catch(e){ return false; } }
function counts(){ var c={done:0,failed:0,cancelled:0,interrupted:0,waiting:0,running:0}; Q.forEach(function(x){ c[x.status]=(c[x.status]||0)+1; }); return c; }
function body(){
  var c=counts(), h='<div class="note">Jobs export one after another through the normal Export dialog, whole edit each. Keep this screen on and the app open.</div>';
  if(!running&&keepCanvas&&canvasDiffers()) h+='<div class="note" style="color:#ffb454">The canvas is still set to a queue job\u2019s shape ('+project.settings.width+'\u00d7'+project.settings.height+'). <button type="button" data-k="canvas" style="min-height:36px">Put it back to '+keepCanvas.width+'\u00d7'+keepCanvas.height+'</button></div>';
  h+='<h5>Queue ('+Q.length+')'+(Q.length?' \u00b7 '+c.done+' done'+(c.failed?', '+c.failed+' failed':'')+(c.cancelled?', '+c.cancelled+' cancelled':'')+(c.interrupted?', '+c.interrupted+' interrupted':''):'')+'</h5>';
  if(!Q.length) h+='<div class="note">Empty. Add a job below or tap a quick job.</div>';
  Q.forEach(function(j,i){
    var run=j.status==="running", bad=j.status==="failed"||j.status==="interrupted"||j.status==="cancelled";
    var info=j.status+(j.err?" \u00b7 "+kit.esc(j.err):"")+(j.status==="done"&&j.files?" \u00b7 "+j.files+" file"+(j.files>1?"s":"")+" saved":"");
    h+='<div style="border:1px solid #302c26;border-radius:10px;padding:7px 9px;display:flex;flex-direction:column;gap:6px"><div style="min-width:0"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(i+1)+'. '+label(j)+'</div><div class="note" style="color:'+col(j.status)+'">'+info+'</div></div><div class="g">'+
      (run?'<button type="button" data-k="cancel:'+j.id+'" style="min-height:36px">Cancel this job</button>':
        '<button type="button" data-k="up:'+j.id+'" aria-label="Move job '+(i+1)+' up" style="min-height:36px"'+(i===0?' disabled':'')+'>\u25b2</button><button type="button" data-k="down:'+j.id+'" aria-label="Move job '+(i+1)+' down" style="min-height:36px"'+(i===Q.length-1?' disabled':'')+'>\u25bc</button>'+
        '<button type="button" data-k="dup:'+j.id+'" style="min-height:36px">Copy</button>'+(bad?'<button type="button" data-k="retry:'+j.id+'" style="min-height:36px">Retry</button>':'')+'<button type="button" data-k="rm:'+j.id+'" style="min-height:36px">Remove</button>')+'</div></div>';
  });
  var resumable=Q.some(function(x){ return x.status==="interrupted"; });
  h+= running?'<button type="button" data-k="stop">Stop queue</button>':'<div class="g"><button type="button" data-k="start" '+(Q.some(function(x){ return x.status==="waiting"||x.status==="interrupted"; })?'':'style="opacity:.45"')+'>'+(resumable?'Resume queue':'Start queue')+'</button><button type="button" data-k="clearfin">Clear finished</button><button type="button" data-k="clear">Clear all</button></div>';
  var mine=[]; try{ mine=window.amiyoMineList?window.amiyoMineList():[]; }catch(e){ mine=[]; }
  if(mine.length) h+='<h5>My presets</h5><div class="g">'+mine.map(function(m,i){ return '<button type="button" data-k="m:'+i+'">+ '+kit.esc(m.name)+'</button>'; }).join("")+'</div>';
  h+='<h5>Quick jobs</h5><div class="g">'+QUICK.map(function(q,i){ return '<button type="button" data-k="q:'+i+'">+ '+q.label+'</button>'; }).join("")+'</div>';
  h+='<h5>Custom job</h5><label>File name<input id="aqName" value="'+kit.esc(form.name||baseName())+'"></label>'+
    '<div class="g"><label>Size<select id="aqH">'+[[0,"Project size"],[480,"480p"],[720,"720p"],[1080,"1080p"]].map(function(o){ return '<option value="'+o[0]+'"'+(String(o[0])===form.h?" selected":"")+'>'+o[1]+'</option>'; }).join("")+'</select></label>'+
    '<label>Canvas shape<select id="aqA">'+[["","Keep"],["16:9","16:9"],["9:16","9:16"],["1:1","1:1"],["4:5","4:5"]].map(function(o){ return '<option value="'+o[0]+'"'+(o[0]===form.aspect?" selected":"")+'>'+o[1]+'</option>'; }).join("")+'</select></label>'+
    '<label>Bitrate (Mbps, blank = auto)<input id="aqB" type="number" min="1" max="60" value="'+kit.esc(form.mbps)+'"></label>'+
    '<label>Split<select id="aqP">'+[[0,"One file"],[600,"10 min"],[1200,"20 min"]].map(function(o){ return '<option value="'+o[0]+'"'+(String(o[0])===form.parts?" selected":"")+'>'+o[1]+'</option>'; }).join("")+'</select></label></div>'+
    '<button type="button" data-k="addc">Add custom job</button>';
  return h;
}
function readForm(){ var g=function(i){ var e=$(i); return e?e.value:""; }; if($("aqName")){ form={name:g("aqName"),h:g("aqH"),aspect:g("aqA"),mbps:g("aqB"),parts:g("aqP")}; } }
function curAspect(){ var s=project.settings; return {width:s.width,height:s.height,aspect:s.aspect}; }
function setAspect(a){
  if(!a) return;
  var s=project.settings, r=s.width/s.height, p=a.split(":"), want=(+p[0])/(+p[1]);
  if(Math.abs(r-want)<.02) return;
  if(typeof window.setSequenceAspect==="function"){ window.setSequenceAspect(a); }
  else { var sh=Math.min(s.width,s.height)||720; if(want>=1){ s.height=sh; s.width=Math.round(sh*want/2)*2; } else { s.width=sh; s.height=Math.round(sh/want/2)*2; } s.aspect=a; }
  try{ renderAll(); }catch(e){}
}
function putCanvasBack(){
  if(!keepCanvas) return; var s=project.settings; s.width=keepCanvas.width; s.height=keepCanvas.height; if(keepCanvas.aspect) s.aspect=keepCanvas.aspect;
  try{ renderAll(); scheduleAutosave(); }catch(e){} keepCanvas=null; save();
}
function closeDlg(){ try{ if(typeof closeModal==="function") closeModal(); }catch(e){} }
async function runJob(j,api){
  var s=null;
  if(j.s){ var sp=window.amiyoSanitizePreset&&window.amiyoSanitizePreset({name:"x",s:j.s}); s=sp&&sp.s; if(!s) throw new Error("This preset could not be read any more. Remove the job and add it again."); }
  if(typeof window.exportProject!=="function") throw new Error("Export is not available");
  if(window.__amiyoExporting) throw new Error("Another export is already running");
  setAspect(j.aspect);
  var oldTpl=null, got=[], orig=window.amiyoOnExport, hook=function(b,f){ got.push(f); return orig&&orig.apply(this,arguments); };
  window.amiyoOnExport=hook; window.__amiyoUserStop=false; window.__amiyoCancel=false;
  try{
    var pr=window.exportProject();
    var go=await waitFor(function(){ return $("expGo"); },6000);
    if(!go) throw new Error("The export dialog did not open (is the timeline empty?)");
    await sleep(200);
    var all=$("expRangeRow")&&$("expRangeRow").querySelector('[data-r="all"]'); if(all) all.click();
    if(s){ var miss=(window.amiyoMineApply?window.amiyoMineApply(s):[])||[]; var hard=miss.filter(function(m){ return !/^format/.test(m); }); if(hard.length){ closeDlg(); throw new Error("Not available here: "+hard.join(", ")); } }
    else {
      var c=$("expSizes")&&$("expSizes").querySelector('[data-h="'+(j.h||0)+'"]'); if(!c){ closeDlg(); throw new Error((j.h||0)+"p is not an available size"); } c.click();
      var pc=$("expParts")&&$("expParts").querySelector('[data-s="'+(j.parts||0)+'"]'); if(!pc){ closeDlg(); throw new Error("A split of "+((j.parts||0)/60)+" min is not available"); } pc.click();
      window.__amiyoPresetBps=j.mbps?Math.round(j.mbps*1e6):0;
    }
    await sleep(700);   /* the name template re-fills the name when Start is pressed, so the job's name is put in as the template (literal text), then the saved template is put back */
    var tpl=$("expTpl"); if(tpl&&!(s&&s.tpl)){ oldTpl=tpl.value; tpl.value=j.name; tpl.dispatchEvent(new Event("input",{bubbles:true})); await sleep(450); }
    else { var nm=$("expName"); if(nm) nm.value=j.name; }
    go.click();
    var started=await waitFor(function(){ return window.__amiyoExporting||window.__amiyoExportPart; },45000);
    if(!started){ closeDlg(); throw new Error("The export did not start. Close any message on screen and press Retry."); }
    var finished=false, thenable=pr&&typeof pr.then==="function"; if(thenable) pr.then(function(){ finished=true; },function(){ finished=true; });
    while(thenable?!finished:(window.__amiyoExporting||window.__amiyoExportPart)){
      if(stopReq||j.cancel){ window.__amiyoUserStop=true; window.__amiyoCancel=true; }
      j.files=got.length; await sleep(300);
    }
    while(window.__amiyoExporting){ await sleep(200); }
    await sleep(1200);
    var rd=$("rdClose"); if(rd) rd.click();
    j.files=got.length;
    if(stopReq){ var e1=new Error("Stopped by you"); e1.cancelled=true; throw e1; }
    if(j.cancel||window.__amiyoUserStop){ var e2=new Error(got.length?"Cancelled after "+got.length+" file"+(got.length>1?"s":""):"Cancelled, nothing saved"); e2.cancelled=true; throw e2; }
    if(!got.length) throw new Error("No file was saved. Open Recent exports in the Export dialog to see why.");
  } finally {
    if(window.amiyoOnExport===hook) window.amiyoOnExport=orig;
    if(oldTpl!==null){ try{ localStorage.setItem("amiyo_editor_name_template",oldTpl); }catch(e){ window.__swl&&window.__swl(e); } }
    window.__amiyoUserStop=false;
  }
}
async function runAll(api){
  running=true; stopReq=false; keepCanvas=curAspect(); save();
  var lock=null; try{ if(navigator.wakeLock) lock=await navigator.wakeLock.request("screen"); }catch(e){}
  Q.forEach(function(x){ if(x.status==="interrupted"){ x.status="waiting"; x.err=""; } });
  api.paint();
  var guard=0;
  while(!stopReq&&guard++<500){
    var j=Q.filter(function(x){ return x.status==="waiting"; })[0]; if(!j) break;
    j.status="running"; j.err=""; j.cancel=false; j.files=0; save(); api.paint();
    try{ await runJob(j,api); j.status="done"; j.err=""; }
    catch(e){ j.status=(e&&e.cancelled)?"cancelled":"failed"; j.err=String((e&&e.message)||e||"The job failed").slice(0,160); if(!(e&&e.cancelled)) kit.say("Queue: \u201c"+j.name+"\u201d failed. "+j.err,4800); closeDlg(); }
    j.cancel=false; save(); api.paint(); await sleep(600);
  }
  var s=project.settings; if(keepCanvas&&(s.width!==keepCanvas.width||s.height!==keepCanvas.height)) putCanvasBack(); else { keepCanvas=null; save(); }
  try{ if(lock) lock.release(); }catch(e){}
  running=false; var c=counts();
  kit.say((stopReq?"Queue stopped. ":"Queue finished: ")+c.done+" exported"+(c.failed?", "+c.failed+" failed":"")+(c.cancelled?", "+c.cancelled+" cancelled":"")+(c.waiting?", "+c.waiting+" still waiting":""),5500); api.paint();
}
function byId(id){ for(var i=0;i<Q.length;i++) if(Q[i].id===id) return i; return -1; }
var sh=kit.sheet("akQueue","\ud83d\udce4 Export queue",body,function(k,b,api){
  readForm(); var p=k.split(":"), id=p.slice(1).join(":"), i=byId(id);
  if(k==="addc"){ var n=(form.name||baseName()).trim()||baseName(); if(add({name:n,h:+form.h||0,aspect:form.aspect,mbps:+form.mbps||0,parts:+form.parts||0})) kit.say("Job added"); api.paint(); }
  else if(p[0]==="q"){ var q=QUICK[+id]; if(q) add({name:baseName()+q.n,h:q.h,aspect:q.aspect,mbps:q.mbps,parts:0}); api.paint(); }
  else if(p[0]==="m"){ var ml=[]; try{ ml=window.amiyoMineList?window.amiyoMineList():[]; }catch(e){} var m=ml[+id]; if(m){ add({name:baseName()+"-"+m.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),s:m.s,mine:m.name,aspect:""}); kit.say("Added "+m.name); } api.paint(); }
  else if(p[0]==="rm"){ if(i>=0&&Q[i].status!=="running"){ Q.splice(i,1); save(); } api.paint(); }
  else if(p[0]==="up"||p[0]==="down"){ var t=p[0]==="up"?i-1:i+1; if(i>=0&&t>=0&&t<Q.length&&Q[i].status!=="running"&&Q[t].status!=="running"){ var x=Q[i]; Q[i]=Q[t]; Q[t]=x; save(); } api.paint(); }
  else if(p[0]==="dup"){ if(i>=0){ var cp=add(Object.assign({},Q[i])); if(cp){ Q.pop(); Q.splice(i+1,0,cp); save(); } } api.paint(); }
  else if(p[0]==="retry"){ if(i>=0&&Q[i].status!=="running"){ Q[i].status="waiting"; Q[i].err=""; Q[i].files=0; save(); if(!running) kit.say("Back in the queue. Tap Start queue."); } api.paint(); }
  else if(p[0]==="cancel"){ if(i>=0&&Q[i].status==="running"){ Q[i].cancel=true; kit.say("Cancelling this job\u2026"); } }
  else if(k==="canvas"){ putCanvasBack(); api.paint(); }
  else if(k==="clearfin"){ Q=Q.filter(function(x){ return x.status==="waiting"||x.status==="running"||x.status==="interrupted"; }); save(); api.paint(); }
  else if(k==="clear"){ if(running){ kit.say("Stop the queue first"); return; } Q=[]; save(); api.paint(); }
  else if(k==="stop"){ stopReq=true; kit.say("Stopping after the current frame\u2026"); }
  else if(k==="start"){ if(running) return; if(!Q.some(function(x){ return x.status==="waiting"||x.status==="interrupted"; })){ kit.say(Q.length?"Nothing is waiting. Use Retry on a job first.":"Add a job first"); return; } if(window.__amiyoExporting){ kit.say("An export is already running"); return; } runAll(api); }
});
window.amiyoQueue={open:sh.open,add:add,jobs:function(){ return Q.slice(); }};
kit.menu("\ud83d\udce4 Export queue",sh.open,"Export queue","amiyoQueue.open()");
try{ var tb=$("renderQueueBtn"); if(tb){ tb.onclick=sh.open; tb.title="Export queue: several exports one after another, saved through the normal Export dialog"; } }catch(e){ window.__swl&&window.__swl(e); }
try{ window.AMIYO_EDITOR_BUILD="vs-step12-queue"; }catch(e){}
})();

;
/* ==================== Script 516 id="amiyo-vs-step13-presets" ==================== */
/* Video Studio step 13 (Premiere "Export Settings presets" style): Social export presets.
   Open Pr tools > "Export presets". One tap sets canvas shape, size and bitrate for YouTube, Shorts, Reels, TikTok, X and GIF.
   "Export now" adds the job to the export queue and starts it; "Add to queue" only adds it. GIF opens the GIF maker with the
   preset's width and speed already chosen and starts it. The preset you used last is remembered. */
(function(){
"use strict";
var kit=window.amiyoKit; if(!kit||window.amiyoExportPresets||!window.amiyoQueue) return;
var LAST="amiyo_vs_last_export_preset";
var P=[
  {id:"yt",   t:"YouTube 1080p",     n:"-youtube", h:1080,aspect:"16:9",mbps:12,note:"Landscape, high quality for YouTube and TVs."},
  {id:"shorts",t:"YouTube Shorts",   n:"-shorts",  h:1080,aspect:"9:16",mbps:10,note:"Portrait. Shorts must be under 3 minutes."},
  {id:"reels",t:"Instagram Reels",   n:"-reels",   h:1080,aspect:"9:16",mbps:10,note:"Portrait 1080. Reels can be up to 3 minutes."},
  {id:"tiktok",t:"TikTok",           n:"-tiktok",  h:1080,aspect:"9:16",mbps:8, note:"Portrait 1080 with a lighter bitrate for fast upload."},
  {id:"x",    t:"X (Twitter) 720p",  n:"-x",       h:720, aspect:"16:9",mbps:5, note:"Smaller landscape file that uploads quickly."},
  {id:"gif",  t:"GIF (480 wide)",    gif:true, width:480, fps:12, note:"Looping animated GIF, no sound. Keep clips short."}
];
function base(){ return String((project.metadata&&project.metadata.name)||"amiyo-edit"); }
function last(){ try{ return localStorage.getItem(LAST)||""; }catch(e){ return ""; } }
function mark(id){ try{ localStorage.setItem(LAST,id); }catch(e){} }
function mins(){ try{ var e=window.amiyoContentEnd?window.amiyoContentEnd():0; return e; }catch(e2){ return 0; } }
function body(){
  var l=last(), end=mins(), h='<div class="note">Pick a preset. The canvas shape changes for the export and is put back afterwards.</div>';
  P.forEach(function(p){
    var warn=(p.id==="shorts"||p.id==="reels")&&end>180?'<div class="note" style="color:#ffb454">Your edit is '+Math.round(end/60*10)/10+' min, longer than 3 min.</div>':'';
    h+='<div style="border:1px solid '+(l===p.id?"#ffb454":"#302c26")+';border-radius:10px;padding:8px;display:flex;flex-direction:column;gap:6px">'+
      '<b>'+p.t+(l===p.id?' <span class="note">(last used)</span>':'')+'</b><div class="note">'+p.note+'</div>'+warn+
      (p.gif?'<button type="button" data-k="gif">Make GIF now</button>':'<div class="g"><button type="button" data-k="now:'+p.id+'">Export now</button><button type="button" data-k="add:'+p.id+'">Add to queue</button></div>')+'</div>';
  });
  h+='<button type="button" data-k="all">Add all video presets to queue</button><button type="button" data-k="q">Open export queue</button>';
  return h;
}
function job(p){ return {name:base()+p.n,h:p.h,aspect:p.aspect,mbps:p.mbps,parts:0}; }
function find(id){ return P.filter(function(x){ return x.id===id; })[0]; }
function sleep(ms){ return new Promise(function(r){ setTimeout(r,ms); }); }
async function gif(){
  if(!window.amiyoX||!window.amiyoX.exportGif){ kit.say("GIF maker is not available"); return; }
  var p=find("gif"); mark("gif"); window.amiyoX.exportGif();
  await sleep(400);
  [["gw",p.width],["gf",p.fps],["gl",0]].forEach(function(a){ var b=document.querySelector("[data-"+a[0]+'="'+a[1]+'"]'); if(b) b.click(); });
  var go=document.getElementById("gifGo"); if(go) go.click();
}
var sh=kit.sheet("akExpPresets","\ud83c\udfaf Export presets",body,function(k,b,api){
  var q=window.amiyoQueue, pr=k.split(":"), id=pr.slice(1).join(":");
  if(k==="gif"){ api.close(); gif(); return; }
  if(k==="q"){ api.close(); q.open(); return; }
  if(k==="all"){ P.filter(function(x){ return !x.gif; }).forEach(function(x){ q.add(job(x)); }); kit.say("Added to the queue"); return; }
  var p=find(id); if(!p) return; mark(id);
  q.add(job(p));
  if(pr[0]==="add"){ kit.say(p.t+" added to the queue"); api.paint(); return; }
  api.close(); q.open();
  var go=document.querySelector('#akQueue [data-k="start"]'); if(go) go.click();
});
window.amiyoExportPresets={open:sh.open,presets:P};
kit.menu("\ud83c\udfaf Export presets",sh.open,"Export presets","amiyoExportPresets.open()");
try{ window.AMIYO_EDITOR_BUILD="vs-step13-presets"; }catch(e){}
})();

;
/* ==================== Script 517 id="amiyo-vs-step14-region" ==================== */
/* Video Studio step 14 (Premiere "Render In to Out" style): Render region and cached preview.
   Open Pr tools > "Render region". Uses the In and Out marks you set on the timeline.
   Export In to Out: exports only that part. Render cached preview: records the region once at small size (nothing is downloaded);
   Play cached preview then plays it smoothly, even when the edit is heavy. The cache is marked out of date when the project changes. */
(function(){
"use strict";
var kit=window.amiyoKit; if(!kit||window.amiyoRegion) return;
var cache=null, override=null, swallow=false, busy=false;
function $(id){ return document.getElementById(id); }
function sleep(ms){ return new Promise(function(r){ setTimeout(r,ms); }); }
async function waitFor(fn,ms){ var t=Date.now(); while(Date.now()-t<ms){ var v=fn(); if(v) return v; await sleep(150); } return null; }
function end(){ try{ return Math.max(0,window.amiyoContentEnd?window.amiyoContentEnd():getProjectDuration()); }catch(e){ return 0; } }
function region(){
  var io=window.amiyoGetIO?window.amiyoGetIO():{}, e=end(), i=io.i==null?0:io.i, o=io.o==null?e:Math.min(io.o,e);
  return {i:Math.max(0,i),o:o,set:io.i!=null||io.o!=null,ok:o-i>=.5};
}
function tc(s){ s=Math.max(0,s); var m=Math.floor(s/60); return m+":"+(s%60).toFixed(1).padStart(4,"0"); }
function sig(){ var s=""; try{ s=JSON.stringify(serializableProject()); }catch(e){} var h=5381; for(var k=0;k<s.length;k++){ h=((h<<5)+h+s.charCodeAt(k))|0; } return s.length+":"+h; }
/* the export reads window.__amiyoExportRange when it starts: serve our region while armed */
var stored=window.__amiyoExportRange||null;
try{ Object.defineProperty(window,"__amiyoExportRange",{configurable:true,get:function(){ return override||stored; },set:function(v){ stored=v; }}); }catch(e){}
var oc=HTMLAnchorElement.prototype.click;
HTMLAnchorElement.prototype.click=function(){ if(swallow&&this.download&&/^blob:/.test(this.href||"")) return; return oc.apply(this,arguments); };
var prevOn=window.amiyoOnExport, pending=null;
window.amiyoOnExport=function(blob,fname){
  try{ if(pending){ var p=pending; pending=null; if(cache&&cache.url) URL.revokeObjectURL(cache.url); cache={url:URL.createObjectURL(blob),sig:p.sig,i:p.i,o:p.o,size:blob.size}; return; } }catch(e){}
  if(typeof prevOn==="function") return prevOn.apply(this,arguments);
};
async function drive(opts){
  if(window.__amiyoExporting){ kit.say("An export is already running"); return false; }
  window.exportProject();
  var go=await waitFor(function(){ return $("expGo"); },6000);
  if(!go){ return false; }
  if(opts.name&&$("expName")) $("expName").value=opts.name;
  var c=$("expSizes")&&$("expSizes").querySelector('[data-h="'+opts.h+'"]'); if(c) c.click();
  var pc=$("expParts")&&$("expParts").querySelector('[data-s="0"]'); if(pc) pc.click();
  window.__amiyoPresetBps=opts.bps||0; go.click();
  var st=await waitFor(function(){ return window.__amiyoExporting; },15000);
  if(!st) return false;
  while(window.__amiyoExporting) await sleep(400);
  await sleep(1500); var rd=$("rdClose"); if(rd) rd.click();
  return true;
}
async function exportRegion(api){
  var r=region(); if(!r.ok){ kit.say("Set an In and an Out mark at least half a second apart"); return; }
  busy=true; override={t0:r.i,t1:r.o}; api.close();
  try{ await drive({name:String((project.metadata&&project.metadata.name)||"amiyo-edit")+"-region",h:0,bps:0}); }finally{ override=null; busy=false; }
}
async function renderCache(api){
  var r=region(); if(!r.ok){ kit.say("Set an In and an Out mark at least half a second apart"); return; }
  busy=true; api.close(); override={t0:r.i,t1:r.o}; swallow=true; pending={sig:sig(),i:r.i,o:r.o};
  kit.say("Rendering cached preview in real time ("+Math.round(r.o-r.i)+" s)",4000);
  var ok=false; try{ ok=await drive({name:"cached-preview",h:480,bps:2e6}); }finally{ override=null; swallow=false; busy=false; if(!ok) pending=null; }
  kit.say(ok&&cache?"Cached preview ready":"Cached preview was not made",3500); sh.open();
}
function play(){
  if(!cache){ kit.say("Render a cached preview first"); return; }
  var stale=cache.sig!==sig();
  openModal("Cached preview "+tc(cache.i)+" to "+tc(cache.o),(stale?'<p style="margin:0 0 8px;color:#ffb454">The project changed since this was rendered. Render again for an exact preview.</p>':"")+'<video controls playsinline autoplay src="'+cache.url+'" style="width:100%;max-height:60vh;background:#000;border-radius:8px"></video>');
}
function body(){
  var r=region(), h='<div class="g"><div>In<br><b style="font-size:18px;color:#ffb454">'+tc(r.i)+'</b></div><div>Out<br><b style="font-size:18px;color:#ffb454">'+tc(r.o)+'</b></div></div>';
  h+='<div class="note">'+(r.set?"Length "+(r.o-r.i).toFixed(1)+" s. Change the marks with I and O on the timeline.":"No In/Out marks set, so the whole project is used.")+'</div>';
  var c='None yet'; if(cache) c=(cache.sig===sig()?'<span style="color:#9af0b8">Up to date</span>':'<span style="color:#ffb454">Out of date (project changed)</span>')+" \u00b7 "+tc(cache.i)+" to "+tc(cache.o)+" \u00b7 "+(cache.size/1048576).toFixed(1)+" MB";
  h+='<h5>Cached preview</h5><div class="note">'+c+'</div><div class="g"><button type="button" data-k="rc">'+(cache?"Render again":"Render cached preview")+'</button><button type="button" data-k="pl" '+(cache?"":'style="opacity:.45"')+'>Play cached preview</button></div>';
  h+='<h5>Export</h5><button type="button" data-k="ex">Export In to Out</button><div class="note">Exports at project size through the normal export checks. The cached preview is only for watching, never used for the final file.</div>';
  return h;
}
var sh=kit.sheet("akRegion","\ud83c\udfac Render region",body,function(k,b,api){
  if(busy){ kit.say("Wait for the current render"); return; }
  if(k==="rc") renderCache(api); else if(k==="pl"){ api.close(); play(); } else if(k==="ex") exportRegion(api);
});
window.amiyoRegion={open:sh.open,region:region,play:play};
kit.menu("\ud83c\udfac Render region",sh.open,"Render region","amiyoRegion.open()");
try{ window.AMIYO_EDITOR_BUILD="vs-step14-region"; }catch(e){}
})();

;
/* ==================== Script 518 id="amiyo-vs-step15-bins" ==================== */
/* Video Studio step 15 (Premiere Project panel style): Nested bin folders, search and tags.
   Open Pr tools > "Project bins". Make folders inside folders, rename or delete them, search every asset by name, tag or folder,
   filter by tag, and file or tag the selected asset. Everything is one undo step and is saved with the project.
   Existing bins keep working: folders are the same bins with an optional parent. */
(function(){
"use strict";
var kit=window.amiyoKit; if(!kit||window.amiyoBins) return;
var cur=null, q="", tagF="", selId=null, nameIn="", tagIn="";
function bins(){ project.bins=project.bins||[]; return project.bins; }
function assets(){ return Object.values(project.assets||{}); }
function binById(id){ return bins().filter(function(b){ return b.id===id; })[0]; }
function kids(id){ return bins().filter(function(b){ return (b.parent||null)===(id||null); }); }
function path(id){ var p=[], g=0; while(id&&g++<20){ var b=binById(id); if(!b) break; p.unshift(b.name); id=b.parent||null; } return p.join(" / "); }
function descendants(id){ var out=[id]; kids(id).forEach(function(k){ out=out.concat(descendants(k.id)); }); return out; }
function inFolder(a,id){ return (a.binId||null)===(id||null); }
function tags(a){ return (a.tags||[]).filter(function(t){ return typeof t==="string"&&t; }); }
function icon(t){ return t==="video"?"\ud83c\udfac":t==="audio"?"\ud83c\udfb5":t==="image"?"\ud83d\uddbc":"\ud83d\udcc4"; }
function searching(){ return !!(q.trim()||tagF); }
function matches(a){
  var hay=((a.name||"")+" "+tags(a).join(" ")+" "+path(a.binId)).toLowerCase(), ok=true;
  q.trim().toLowerCase().split(/\s+/).filter(Boolean).forEach(function(w){ if(hay.indexOf(w)<0) ok=false; });
  if(tagF&&tags(a).indexOf(tagF)<0) ok=false; return ok;
}
function row(a){
  var s=a.id===selId;
  return '<button type="button" data-k="sel:'+a.id+'" style="text-align:left;display:flex;gap:8px;justify-content:space-between;'+(s?"border-color:#ffb454;color:#ffb454":"")+'"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+icon(a.type)+" "+kit.esc(a.name)+'</span><span class="note">'+(a.binId?kit.esc(path(a.binId)):"No bin")+'</span></button>';
}
function body(){
  if(cur&&!binById(cur)) cur=null;
  var all=assets(), h='<input id="pbQ" placeholder="Search name, tag or folder" value="'+kit.esc(q)+'">';
  var counts={}; all.forEach(function(a){ tags(a).forEach(function(t){ counts[t]=(counts[t]||0)+1; }); });
  var tl=Object.keys(counts).sort();
  if(tl.length) h+='<div style="display:flex;flex-wrap:wrap;gap:6px">'+tl.map(function(t){ return '<button type="button" data-k="tag:'+kit.esc(t)+'" style="min-height:32px;'+(tagF===t?"border-color:#ffb454;color:#ffb454":"")+'">#'+kit.esc(t)+' '+counts[t]+'</button>'; }).join("")+'</div>';
  if(searching()){
    var r=all.filter(matches); h+='<h5>Results ('+r.length+')</h5>'+(r.length?r.map(row).join(""):'<div class="note">Nothing matches.</div>')+'<button type="button" data-k="clr">Clear search</button>';
  } else {
    h+='<h5>'+(cur?kit.esc(path(cur)):"Project")+'</h5>';
    if(cur) h+='<button type="button" data-k="up">\u2190 Up one level</button>';
    kids(cur).forEach(function(b){ var n=assets().filter(function(a){ return a.binId===b.id; }).length; h+='<div style="display:flex;gap:6px"><button type="button" data-k="open:'+b.id+'" style="flex:1;text-align:left">\ud83d\udcc1 '+kit.esc(b.name)+' <span class="note">'+n+' items</span></button><button type="button" data-k="ren:'+b.id+'" style="min-width:64px">Rename</button><button type="button" data-k="del:'+b.id+'" style="min-width:56px">Delete</button></div>'; });
    h+='<div style="display:flex;gap:6px"><input id="pbN" placeholder="New folder name" value="'+kit.esc(nameIn)+'"><button type="button" data-k="mk" style="min-width:84px">Add folder</button></div>';
    var here=all.filter(function(a){ return inFolder(a,cur); });
    h+='<h5>Media here ('+here.length+')</h5>'+(here.length?here.map(row).join(""):'<div class="note">Empty.</div>');
  }
  var a=selId&&project.assets[selId];
  if(a){
    h+='<h5>Selected</h5><b>'+kit.esc(a.name)+'</b><label>Move to<select id="pbM"><option value="">No bin</option>'+bins().map(function(b){ return '<option value="'+b.id+'"'+(a.binId===b.id?" selected":"")+'>'+kit.esc(path(b.id))+'</option>'; }).join("")+'</select></label>';
    h+='<div style="display:flex;flex-wrap:wrap;gap:6px">'+tags(a).map(function(t){ return '<button type="button" data-k="rt:'+kit.esc(t)+'" style="min-height:32px">#'+kit.esc(t)+' \u2715</button>'; }).join("")+'</div>';
    h+='<div style="display:flex;gap:6px"><input id="pbT" placeholder="Add tag" value="'+kit.esc(tagIn)+'"><button type="button" data-k="at" style="min-width:70px">Add</button></div>';
  }
  return h;
}
function clean(s){ return String(s||"").trim().replace(/\s+/g," ").slice(0,40); }
function ask(msg,def){ var v=window.prompt(msg,def||""); return v==null?null:clean(v); }
var sh=kit.sheet("akBins","\ud83d\udcc1 Project bins",body,function(k,b,api){
  var p=k.split(":"), id=p.slice(1).join(":");
  if(p[0]==="sel"){ selId=(selId===id?null:id); api.paint(); }
  else if(p[0]==="open"){ cur=id; api.paint(); }
  else if(k==="up"){ var b0=binById(cur); cur=b0?(b0.parent||null):null; api.paint(); }
  else if(p[0]==="tag"){ tagF=(tagF===id?"":id); api.paint(); }
  else if(k==="clr"){ q=""; tagF=""; api.paint(); }
  else if(k==="mk"){ var n=clean(nameIn)||"Folder "+(bins().length+1); kit.edit("New bin",function(){ bins().push({id:uid("bin"),name:n,parent:cur||null}); }); nameIn=""; api.paint(); }
  else if(p[0]==="ren"){ var bb=binById(id), nn=bb&&ask("Folder name",bb.name); if(nn){ kit.edit("Rename bin",function(){ bb.name=nn; }); api.paint(); } }
  else if(p[0]==="del"){
    var d=binById(id); if(!d) return;
    Promise.resolve(window.amiyoOk?window.amiyoOk("Delete folder \u201c"+d.name+"\u201d? Media and sub-folders move up one level; nothing is removed from the project.",{okLabel:"Delete",danger:true}):true).then(function(y){ if(!y) return;
      kit.edit("Delete bin",function(){ var up=d.parent||null; bins().forEach(function(x){ if(x.parent===d.id) x.parent=up; }); assets().forEach(function(a){ if(a.binId===d.id) a.binId=up; }); project.bins=bins().filter(function(x){ return x.id!==d.id; }); if(cur===d.id) cur=up; });
      api.paint(); });
  }
  else if(k==="at"){ var a=project.assets[selId], t=clean(tagIn).toLowerCase(); if(!a||!t){ kit.say("Type a tag first"); return; } kit.edit("Add tag",function(){ a.tags=tags(a); if(a.tags.indexOf(t)<0) a.tags.push(t); }); tagIn=""; api.paint(); }
  else if(p[0]==="rt"){ var a2=project.assets[selId]; if(a2){ kit.edit("Remove tag",function(){ a2.tags=tags(a2).filter(function(t){ return t!==id; }); }); api.paint(); } }
});
sh.el.addEventListener("input",function(e){
  var t=e.target.id;
  if(t==="pbQ"){ q=e.target.value; clearTimeout(sh.__t); sh.__t=setTimeout(function(){ var pos=e.target.selectionStart; sh.paint(); var el=document.getElementById("pbQ"); if(el){ el.focus(); try{ el.setSelectionRange(pos,pos); }catch(x){} } },250); }
  else if(t==="pbN") nameIn=e.target.value; else if(t==="pbT") tagIn=e.target.value;
});
sh.el.addEventListener("change",function(e){
  if(e.target.id==="pbM"){ var a=project.assets[selId]; if(!a) return; var v=e.target.value||null; kit.edit("Move to bin",function(){ a.binId=v; }); try{ renderLeftPanel(); }catch(x){} sh.paint(); }
});
window.amiyoBins={open:sh.open,path:path,descendants:descendants};
kit.menu("\ud83d\udcc1 Project bins",sh.open,"Project bins","amiyoBins.open()");
try{ window.AMIYO_EDITOR_BUILD="vs-step15-bins"; }catch(e){}
})();

;
/* ==================== Script 519 id="amiyo-vs-step16-versions" ==================== */
/* Video Studio step 16 (Premiere "Save As / Snapshots" style): Timeline versions.
   Open Pr tools > "Timeline versions". Save named snapshots of the whole timeline (tracks, clips, markers, settings) and restore one
   later. Restoring first saves an automatic "Before restoring" version, and is one undo step. Media files are not copied, so a
   version stays small; if a version uses media you have since removed, you are warned first. Versions are kept in this browser
   next to the project (up to 30). */
(function(){
"use strict";
var kit=window.amiyoKit; if(!kit||window.amiyoVersions) return;
var SKIP={assets:1,history:1,versions:1,metadata:1,ai:1,bins:1}, MAX=30, V=[], loadedFor=null, nameIn="", noteIn="", ok=true;
function key(){ return "tlver:"+((project.metadata&&project.metadata.createdAt)||"project"); }
function load(){
  var k=key(); if(loadedFor===k) return Promise.resolve(); loadedFor=k;
  try{ return Promise.resolve(idbGet("snapshots",k)).then(function(v){ V=Array.isArray(v)?v:[]; try{ sh.paint(); }catch(e){} },function(){ V=[]; ok=false; }); }catch(e){ ok=false; return Promise.resolve(); }
}
function persist(){ try{ if(window.__amiyoIdbOpenFailed){ ok=false; return; } Promise.resolve(idbPut("snapshots",key(),V)).catch(function(){ ok=false; }); }catch(e){ ok=false; } }
function dur(o){ var d=0; (o.tracks||[]).forEach(function(t){ (t.clips||[]).forEach(function(c){ d=Math.max(d,(c.start||0)+(c.duration||0)); }); }); return d; }
function clips(o){ var n=0; (o.tracks||[]).forEach(function(t){ n+=(t.clips||[]).length; }); return n; }
function grab(){ var o={}; Object.keys(project).forEach(function(k){ if(!SKIP[k]) o[k]=project[k]; }); return JSON.parse(JSON.stringify(o)); }
function missing(o){ var ids={}; (o.tracks||[]).forEach(function(t){ (t.clips||[]).forEach(function(c){ if(c.assetId&&!(project.assets||{})[c.assetId]) ids[c.assetId]=1; }); }); return Object.keys(ids).length; }
function fmt(s){ s=Math.round(s); return Math.floor(s/60)+":"+String(s%60).padStart(2,"0"); }
function ago(t){ var m=Math.round((Date.now()-t)/60000); return m<1?"just now":m<60?m+" min ago":m<1440?Math.round(m/60)+" h ago":new Date(t).toLocaleDateString(); }
function save(name,note,auto){
  var o=grab(); V.unshift({id:"v"+Date.now().toString(36),name:name||("Version "+(V.length+1)),note:note||"",at:Date.now(),auto:!!auto,data:o,clips:clips(o),dur:dur(o)});
  if(V.length>MAX){ var i=V.map(function(v){ return v.auto; }).lastIndexOf(true); V.splice(i>=0?i:V.length-1,1); }
  persist();
}
function body(){
  var cd=clips(project), h='<div class="note">Now: '+cd+' clip'+(cd===1?"":"s")+', '+fmt(dur(project))+' long. Saves the timeline only, not the media files.</div>';
  if(!ok) h+='<div class="note" style="color:#ffb454">Browser storage is not available: versions last only until you close the page.</div>';
  h+='<label>Name<input id="tvN" placeholder="e.g. Rough cut, Client v2" value="'+kit.esc(nameIn)+'"></label><label>Note (optional)<input id="tvT" value="'+kit.esc(noteIn)+'"></label><button type="button" data-k="save">Save version</button>';
  h+='<h5>Saved versions ('+V.length+')</h5>'; if(!V.length) h+='<div class="note">None yet.</div>';
  V.forEach(function(v){
    var dc=v.clips-cd, dd=v.dur-dur(project), cmp=(dc?(dc>0?"+":"")+dc+" clips":"same clip count")+", "+(Math.abs(dd)<.5?"same length":(dd>0?"+":"\u2212")+fmt(Math.abs(dd)))+" vs now";
    h+='<div style="border:1px solid #302c26;border-radius:10px;padding:8px;display:flex;flex-direction:column;gap:6px"><div style="display:flex;justify-content:space-between;gap:8px"><b>'+kit.esc(v.name)+(v.auto?' <span class="note">(auto)</span>':"")+'</b><span class="note">'+ago(v.at)+'</span></div>'+
      (v.note?'<div class="note">'+kit.esc(v.note)+'</div>':"")+'<div class="note">'+v.clips+' clips \u00b7 '+fmt(v.dur)+' \u00b7 '+cmp+'</div>'+
      '<div class="g"><button type="button" data-k="rs:'+v.id+'">Restore</button><button type="button" data-k="dl:'+v.id+'">Delete</button></div></div>';
  });
  return h;
}
function restore(v,api){
  var m=missing(v.data), msg="Restore \u201c"+v.name+"\u201d? Your current timeline is saved first as a version, and Ctrl+Z also undoes it."+(m?" Warning: "+m+" media file"+(m>1?"s":"")+" used by this version "+(m>1?"are":"is")+" no longer in the project, so those clips will show as missing.":"");
  Promise.resolve(window.amiyoOk?window.amiyoOk(msg,{okLabel:"Restore"}):true).then(function(y){ if(!y) return;
    save("Before restoring "+v.name,"",true);
    kit.edit("Restore timeline version",function(){ var d=JSON.parse(JSON.stringify(v.data)); Object.keys(d).forEach(function(k){ project[k]=d[k]; }); try{ selectedClipId=null; selectedTrackId=null; clearMultiSelection(); }catch(e){} });
    kit.say("Restored \u201c"+v.name+"\u201d"); api.paint(); });
}
var sh=kit.sheet("akVersions","\ud83d\udd53 Timeline versions",body,function(k,b,api){
  var p=k.split(":"), id=p.slice(1).join(":"), v=V.filter(function(x){ return x.id===id; })[0];
  if(k==="save"){ var n=nameIn.trim().slice(0,50), t=noteIn.trim().slice(0,120); save(n,t,false); nameIn=""; noteIn=""; kit.say("Version saved"); api.paint(); }
  else if(p[0]==="rs"&&v) restore(v,api);
  else if(p[0]==="dl"&&v){ Promise.resolve(window.amiyoOk?window.amiyoOk("Delete version \u201c"+v.name+"\u201d?",{okLabel:"Delete",danger:true}):true).then(function(y){ if(y){ V=V.filter(function(x){ return x.id!==id; }); persist(); api.paint(); } }); }
});
sh.el.addEventListener("input",function(e){ if(e.target.id==="tvN") nameIn=e.target.value; else if(e.target.id==="tvT") noteIn=e.target.value; });
var open0=sh.open; sh.open=function(){ load().then(function(){ open0(); }); };
window.amiyoVersions={open:sh.open,save:function(n){ save(n,"",false); },list:function(){ return V.slice(); }};
kit.menu("\ud83d\udd53 Timeline versions",sh.open,"Timeline versions","amiyoVersions.open()");
load();
try{ window.AMIYO_EDITOR_BUILD="vs-step16-versions"; }catch(e){}
})();

;
/* ==================== Script 520 id="amiyo-vs-step17-chapters" ==================== */
/* Video Studio step 17: Markers to chapter export.
   Open Pr tools > "Chapter export". Turns your timeline markers into chapters and saves them as: a YouTube description list,
   WebVTT chapters (web players), FFmpeg chapter metadata (embeds real chapters into an MP4 or MKV: the sheet gives the command),
   Podcasting 2.0 chapters.json, or CSV. Uses starred (chapter) markers; if none are starred, every marker is used.
   Can add a 0:00 Intro chapter so YouTube accepts the list. Nothing is changed in your project. */
(function(){
"use strict";
var kit=window.amiyoKit; if(!kit||window.amiyoChapterExport) return;
/* Export plan step 12: this sheet (WebVTT, FFmpeg, Podcast JSON, CSV) never opened: the YouTube chapters sheet had already taken the name amiyoChapters, so this script stopped at its first line. It has its own name now. */
var addIntro=true, srcAll=false;
function endT(){ try{ return Math.max(1,window.amiyoContentEnd?window.amiyoContentEnd():getProjectDuration()); }catch(e){ return 1; } }
function mk(){ return (project.markers||[]).filter(function(m){ return typeof m.time==="number"&&isFinite(m.time)&&m.time>=0&&!m.beat&&!m.bar; }).sort(function(a,b){ return a.time-b.time; }); }
function list(){
  var m=mk(), star=m.filter(function(x){ return x.chapter; }), use=(star.length&&!srcAll)?star:m, out=[], last=-9, e=endT();
  use.forEach(function(x){ if(x.time>=e) return; if(x.time-last<.5&&out.length) return; last=x.time; out.push({t:x.time,title:String(x.label||"").trim()||"Chapter "+(out.length+1)}); });
  if(addIntro&&(!out.length||out[0].t>=1)) out.unshift({t:0,title:"Intro"});
  out.forEach(function(c,i){ c.end=i<out.length-1?out[i+1].t:e; });
  return {items:out,usedStar:!!star.length&&!srcAll,total:m.length};
}
function p2(n){ return String(n).padStart(2,"0"); }
function yt(t){ t=Math.floor(t); var h=Math.floor(t/3600), m=Math.floor(t%3600/60), s=t%60; return h?h+":"+p2(m)+":"+p2(s):m+":"+p2(s); }
function vt(t){ var ms=Math.round(t*1000), h=Math.floor(ms/3600000), m=Math.floor(ms%3600000/60000), s=Math.floor(ms%60000/1000); return p2(h)+":"+p2(m)+":"+p2(s)+"."+String(ms%1000).padStart(3,"0"); }
function fm(s){ return String(s).replace(/([=;#\\])/g,"\\$1").replace(/\n/g," "); }
function csvq(s){ return window.amiyoExportLists?window.amiyoExportLists.cell(s):'"'+String(s).replace(/"/g,'""')+'"'; }
function name(){ return window.amiyoExportLists?window.amiyoExportLists.base():String((project.metadata&&project.metadata.name)||"amiyo-edit").replace(/[\\/:*?"<>|]+/g,"-"); }
function warns(L){
  var w=[], it=L.items;
  if(!it.length) return ["No markers yet. Add markers on the timeline first."];
  if(it.length<3) w.push("YouTube needs at least 3 chapters (you have "+it.length+").");
  if(it.some(function(c){ return c.end-c.t<10; })) w.push("YouTube wants each chapter to be at least 10 seconds.");
  if(it.some(function(c){ return /^Chapter \d+$/.test(c.title); })) w.push("Some chapters still have a default title.");
  return w;
}
function make(kind,L){
  var it=L.items;
  if(kind==="yt") return {n:name()+"-chapters.txt",t:"text/plain",s:it.map(function(c){ return yt(c.t)+" "+c.title; }).join("\n")+"\n"};
  if(kind==="vtt") return {n:name()+"-chapters.vtt",t:"text/vtt",s:"WEBVTT\n\n"+it.map(function(c,i){ return (i+1)+"\n"+vt(c.t)+" --> "+vt(c.end)+"\n"+c.title.replace(/-->/g,"->")+"\n"; }).join("\n")};
  if(kind==="ff") return {n:name()+"-chapters.txt",t:"text/plain",s:";FFMETADATA1\n"+it.map(function(c){ return "[CHAPTER]\nTIMEBASE=1/1000\nSTART="+Math.round(c.t*1000)+"\nEND="+Math.max(Math.round(c.t*1000)+1,Math.round(c.end*1000)-1)+"\ntitle="+fm(c.title)+"\n"; }).join("\n")};
  if(kind==="json") return {n:name()+"-chapters.json",t:"application/json",s:JSON.stringify({version:"1.2.0",chapters:it.map(function(c){ return {startTime:Math.round(c.t*1000)/1000,title:c.title}; })},null,2)};
  if(kind==="csv") return {n:name()+"-chapters.csv",t:"text/csv",s:"number,start_seconds,end_seconds,start_timecode,title\n"+it.map(function(c,i){ return [i+1,c.t.toFixed(3),c.end.toFixed(3),yt(c.t),csvq(c.title)].join(","); }).join("\n")+"\n"};
}
function save(f){ if(window.amiyoExportLists){ window.amiyoExportLists.save(f.n,f.s,f.t); return; } var u=URL.createObjectURL(new Blob([f.s],{type:f.t+";charset=utf-8"})), a=document.createElement("a"); a.href=u; a.download=f.n; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(u); },8000); }
function body(){
  var L=list(), w=warns(L), h='<div class="note">'+(L.usedStar?"Using starred chapter markers.":(L.total?"No starred markers, so all "+L.total+" markers are used.":"No markers on the timeline."))+'</div>';
  h+='<div class="g"><button type="button" data-k="intro" style="'+(addIntro?"border-color:#9af0b8;color:#9af0b8":"")+'">0:00 Intro: '+(addIntro?"on":"off")+'</button><button type="button" data-k="src" style="'+(srcAll?"border-color:#9af0b8;color:#9af0b8":"")+'">Use all markers: '+(srcAll?"on":"off")+'</button></div>';
  h+='<h5>Chapters ('+L.items.length+')</h5>'+L.items.map(function(c){ return '<div style="display:flex;gap:10px"><b style="min-width:54px;color:#ffb454">'+yt(c.t)+'</b><span>'+kit.esc(c.title)+'</span></div>'; }).join("");
  w.forEach(function(x){ h+='<div class="note" style="color:#ffb454">'+x+'</div>'; });
  if(L.items.length) h+='<h5>Export</h5><div class="g"><button type="button" data-k="c:yt">Copy YouTube list</button><button type="button" data-k="s:yt">Save .txt</button><button type="button" data-k="s:vtt">WebVTT (.vtt)</button><button type="button" data-k="s:json">Podcast JSON</button><button type="button" data-k="s:csv">CSV</button><button type="button" data-k="s:ff">FFmpeg metadata</button></div><button type="button" data-k="cmd">Copy FFmpeg command to embed chapters</button><div class="note">Embedding adds real chapters to an exported MP4 or MKV without re-encoding it.</div>';
  return h;
}
var sh=kit.sheet("akChapters","\ud83d\udd16 Chapter export",body,function(k,b,api){
  var L=list(), p=k.split(":");
  if(k==="intro"){ addIntro=!addIntro; api.paint(); return; }
  if(k==="src"){ srcAll=!srcAll; api.paint(); return; }
  if(!L.items.length){ kit.say("Add markers first"); return; }
  if(k==="cmd"){ var c='ffmpeg -i "'+name()+'.mp4" -i "'+name()+'-chapters.txt" -map_metadata 1 -codec copy "'+name()+'-chapters.mp4"'; try{ navigator.clipboard.writeText(c).then(function(){ kit.say("Command copied. Save the FFmpeg metadata first."); },function(){ kit.say(c,7000); }); }catch(e){ kit.say(c,7000); } return; }
  if(p[0]==="c"){ var f=make("yt",L); try{ navigator.clipboard.writeText(f.s).then(function(){ kit.say("Chapters copied"); },function(){ save(f); }); }catch(e){ save(f); } return; }
  if(p[0]==="s"){ var g=make(p[1],L); save(g); kit.say("Saved "+g.n); }
});
window.amiyoChapterExport={open:sh.open,list:list,make:make};
kit.menu("\ud83d\udd16 Chapter export",sh.open,"Chapter export","amiyoChapterExport.open()");
try{ window.AMIYO_EDITOR_BUILD="vs-step17-chapters"; }catch(e){}
})();

;
/* ==================== Script 521 id="amiyo-vs-step18-guides" ==================== */
/* Video Studio step 18: Safe zones and aspect-ratio guides for social formats.
   Open Pr tools > "Social guides". Pick a platform (YouTube, Shorts, Reels, TikTok, broadcast) to shade the parts of the frame its
   buttons, captions and profile bar usually cover; add crop guides for 16:9, 9:16, 1:1, 4:5, 3:4 (Instagram grid) or 4:3, plus thirds
   and centre lines. Guides show only on the preview and are never exported. Margins are close estimates: apps change their layout. */
(function(){
"use strict";
var kit=window.amiyoKit; if(!kit||window.amiyoGuides) return;
/* margins are percent of the frame: top, bottom, left, right; labels name what usually sits there */
var PLAT={
  yt:{n:"YouTube",m:[5,5,5,5],lab:{b:"Progress bar"},note:"Keeps text clear of the player bar and cropped edges."},
  shorts:{n:"Shorts",m:[8,22,6,14],lab:{t:"Search / camera",b:"Title and channel",r:"Like, share"},note:"For 9:16."},
  reels:{n:"Reels",m:[13,22,6,12],lab:{t:"Reels header",b:"Caption and audio",r:"Like, comment"},note:"For 9:16."},
  tiktok:{n:"TikTok",m:[7,25,6,14],lab:{t:"Following / For You",b:"Caption and sound",r:"Buttons"},note:"For 9:16."},
  bc:{n:"Broadcast",m:[3.5,3.5,3.5,3.5],m2:[5,5,5,5],lab:{},note:"Action safe 93%, title safe 90%."}
};
var ASP=[["16:9",16/9],["9:16",9/16],["1:1",1],["4:5",4/5],["3:4",3/4],["4:3",4/3]];
function g(){ var s=project.settings=project.settings||{}; s.vsGuides=s.vsGuides||{plat:"",asp:[],thirds:false,center:false}; return s.vsGuides; }
function css(c){ return "position:absolute;pointer-events:none;"+c; }
function build(){
  var G=g(), W=project.settings.width||1280, H=project.settings.height||720, fr=W/H, h="";
  var P=PLAT[G.plat];
  if(P){
    var m=P.m, shade="background:rgba(255,80,80,.22);", ln="border:1px dashed rgba(255,255,255,.75);";
    h+='<div style="'+css("left:0;right:0;top:0;height:"+m[0]+"%;"+shade)+'"></div><div style="'+css("left:0;right:0;bottom:0;height:"+m[1]+"%;"+shade)+'"></div>'+
       '<div style="'+css("left:0;top:"+m[0]+"%;bottom:"+m[1]+"%;width:"+m[2]+"%;"+shade)+'"></div><div style="'+css("right:0;top:"+m[0]+"%;bottom:"+m[1]+"%;width:"+m[3]+"%;"+shade)+'"></div>'+
       '<div style="'+css("left:"+m[2]+"%;right:"+m[3]+"%;top:"+m[0]+"%;bottom:"+m[1]+"%;"+ln)+'"></div>';
    var L=P.lab||{}, lb="font:600 10px system-ui;color:#fff;text-shadow:0 1px 2px #000;text-align:center;";
    if(L.t) h+='<div style="'+css("left:0;right:0;top:0;height:"+m[0]+"%;display:flex;align-items:center;justify-content:center;"+lb)+'">'+L.t+'</div>';
    if(L.b) h+='<div style="'+css("left:0;right:0;bottom:0;height:"+m[1]+"%;display:flex;align-items:center;justify-content:center;"+lb)+'">'+L.b+'</div>';
    if(L.r) h+='<div style="'+css("right:0;top:"+m[0]+"%;bottom:"+m[1]+"%;width:"+m[3]+"%;display:flex;align-items:center;justify-content:center;"+lb+"writing-mode:vertical-rl;")+'">'+L.r+'</div>';
    if(P.m2){ var q=P.m2; h+='<div style="'+css("left:"+q[2]+"%;right:"+q[3]+"%;top:"+q[0]+"%;bottom:"+q[1]+"%;border:1px solid rgba(255,128,64,.8);")+'"></div>'; }
  }
  ASP.forEach(function(a){
    if(G.asp.indexOf(a[0])<0) return;
    var w,hh; if(a[1]>=fr){ w=100; hh=100*fr/a[1]; } else { hh=100; w=100*a[1]/fr; }
    var l=(100-w)/2, t=(100-hh)/2;
    h+='<div style="'+css("left:"+l+"%;top:"+t+"%;width:"+w+"%;height:"+hh+"%;border:2px solid rgba(255,200,87,.9);box-shadow:0 0 0 999px rgba(0,0,0,.35);box-sizing:border-box;")+'"><span style="position:absolute;left:4px;top:2px;font:700 10px system-ui;color:#ffc857;text-shadow:0 1px 2px #000">'+a[0]+'</span></div>';
  });
  if(G.thirds) h+=[33.333,66.667].map(function(p){ return '<div style="'+css("left:"+p+"%;top:0;bottom:0;border-left:1px solid rgba(255,255,255,.45);")+'"></div><div style="'+css("top:"+p+"%;left:0;right:0;border-top:1px solid rgba(255,255,255,.45);")+'"></div>'; }).join("");
  if(G.center) h+='<div style="'+css("left:50%;top:0;bottom:0;border-left:1px solid rgba(255,128,64,.8);")+'"></div><div style="'+css("top:50%;left:0;right:0;border-top:1px solid rgba(255,128,64,.8);")+'"></div>';
  return h;
}
var lastSig="";
function draw(force){
  var host=document.getElementById("canvasShell"); if(!host) return;
  var G=g(), s=project.settings, sig=JSON.stringify([G,s.width,s.height]), el=document.getElementById("vsGuides");
  if(!force&&el&&el.parentNode===host&&sig===lastSig) return;
  if(!el||el.parentNode!==host){ if(el&&el.parentNode) el.parentNode.removeChild(el); el=document.createElement("div"); el.id="vsGuides"; el.style.cssText="position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:6"; host.appendChild(el); }
  lastSig=sig; el.innerHTML=(G.plat||G.asp.length||G.thirds||G.center)?build():"";
}
function change(fn){ var G=g(); fn(G); try{ scheduleAutosave(); }catch(e){} draw(true); }
function body(){
  var G=g(), W=project.settings.width||1280, H=project.settings.height||720, tall=H>W;
  var h='<div class="note">Canvas is '+W+'\u00d7'+H+' ('+(tall?"vertical":W===H?"square":"landscape")+'). Guides show in the preview only.</div><h5>Platform safe zone</h5><div class="g">';
  h+='<button type="button" data-k="p:" style="'+(!G.plat?"border-color:#ffb454;color:#ffb454":"")+'">Off</button>';
  Object.keys(PLAT).forEach(function(k){ h+='<button type="button" data-k="p:'+k+'" style="'+(G.plat===k?"border-color:#ffb454;color:#ffb454":"")+'">'+PLAT[k].n+'</button>'; });
  h+='</div>'; if(PLAT[G.plat]) h+='<div class="note">'+PLAT[G.plat].note+(PLAT[G.plat].n!=="YouTube"&&PLAT[G.plat].n!=="Broadcast"&&!tall?" Your canvas is not vertical: switch it to 9:16 for a true fit.":"")+'</div>';
  h+='<h5>Crop guides</h5><div class="g">'+ASP.map(function(a){ var on=G.asp.indexOf(a[0])>=0; return '<button type="button" data-k="a:'+a[0]+'" style="'+(on?"border-color:#ffc857;color:#ffc857":"")+'">'+a[0]+'</button>'; }).join("")+'</div>';
  h+='<h5>Composition</h5><div class="g"><button type="button" data-k="th" style="'+(G.thirds?"border-color:#9af0b8;color:#9af0b8":"")+'">Rule of thirds</button><button type="button" data-k="ce" style="'+(G.center?"border-color:#9af0b8;color:#9af0b8":"")+'">Centre lines</button></div><button type="button" data-k="off">Hide all guides</button>';
  return h;
}
var sh=kit.sheet("akGuides","\ud83d\udcd0 Social guides",body,function(k,b,api){
  var p=k.split(":"), id=p.slice(1).join(":");
  if(p[0]==="p") change(function(G){ G.plat=id; });
  else if(p[0]==="a") change(function(G){ var i=G.asp.indexOf(id); if(i>=0) G.asp.splice(i,1); else G.asp.push(id); });
  else if(k==="th") change(function(G){ G.thirds=!G.thirds; });
  else if(k==="ce") change(function(G){ G.center=!G.center; });
  else if(k==="off") change(function(G){ G.plat=""; G.asp=[]; G.thirds=false; G.center=false; });
  api.paint();
});
var rt=window.renderTimeline;
if(typeof rt==="function"&&!rt.__vsg){ window.renderTimeline=function(){ var r=rt.apply(this,arguments); try{ draw(false); }catch(e){} return r; }; window.renderTimeline.__vsg=true; }
window.amiyoGuides={open:sh.open,draw:function(){ draw(true); }};
kit.menu("\ud83d\udcd0 Social guides",sh.open,"Social guides","amiyoGuides.open()");
setTimeout(function(){ try{ draw(true); }catch(e){} },900);
try{ window.AMIYO_EDITOR_BUILD="vs-step18-guides"; }catch(e){}
})();

;
/* ==================== Script 522 id="amiyo-vs-step19-shortcuts" ==================== */
/* Video Studio step 19 (Premiere "Keyboard Shortcuts" editor style): Shortcut editor.
   Open Pr tools > "Shortcut editor". Pick any command from the palette list, press the key you want, and it is bound. Your keys win over
   built-in ones (the editor tells you what a key replaces), you can free a built-in key by binding it to "Do nothing", and you can
   export, import or reset the whole set. Bindings are kept in this browser. Keys are ignored while you type in a text field. */
(function(){
"use strict";
var kit=window.amiyoKit; if(!kit||window.amiyoShortcutEditor) return;
var KEY="amiyo_vs_shortcuts", B=[], rec=null, filter="", note="";
var NOTHING="Do nothing (free this key)";
function load(){ try{ var a=JSON.parse(localStorage.getItem(KEY)||"[]"); B=Array.isArray(a)?a.filter(function(x){ return x&&typeof x.combo==="string"&&typeof x.cmd==="string"; }):[]; }catch(e){ B=[]; } }
function store(){ try{ localStorage.setItem(KEY,JSON.stringify(B)); }catch(e){} }
var NAMES={" ":"Space",ArrowLeft:"Left",ArrowRight:"Right",ArrowUp:"Up",ArrowDown:"Down",Escape:"Esc",Delete:"Del",Backspace:"Backspace",Enter:"Enter",Tab:"Tab",Home:"Home",End:"End",PageUp:"PageUp",PageDown:"PageDown"};
function combo(e){
  var k=e.key; if(!k||k==="Control"||k==="Shift"||k==="Alt"||k==="Meta"||k==="Dead"||k==="Unidentified") return "";
  var n=NAMES[k]||(k.length===1?k.toUpperCase():k), m=[]; if(e.ctrlKey||e.metaKey) m.push("Ctrl"); if(e.altKey) m.push("Alt"); if(e.shiftKey&&!(k.length===1&&!/[a-z0-9]/i.test(k))) m.push("Shift");
  return m.concat(n).join("+");
}
function typing(t){ var n=t&&t.tagName; return n==="INPUT"||n==="TEXTAREA"||n==="SELECT"||(t&&t.isContentEditable); }
function cmds(){ var l=[]; try{ l=(window.commandList?window.commandList():[]).filter(function(c){ return c&&c[0]&&c[1]; }); }catch(e){} var seen={}; return l.filter(function(c){ if(seen[c[0]]) return false; seen[c[0]]=1; return true; }); }
function callFor(name){ var c=cmds().filter(function(x){ return x[0]===name; })[0]; return c?c[1]:""; }
function run(call){ try{ (0,eval)(call); }catch(e){ try{ new Function(call)(); }catch(e2){ kit.say("That command could not run",3000); } } }
function norm(s){ return String(s).toLowerCase().replace(/\s+/g,"").replace(/cmd|command|meta|control/g,"ctrl"); }
function defaults(){ var out=[]; try{ if(window.AMIYO_SHORTCUTS&&window.AMIYO_SHORTCUTS.build) window.AMIYO_SHORTCUTS.build().forEach(function(r){ String(r.k).split(/\s*(?:\/|,|\bor\b)\s*/).forEach(function(k){ if(k) out.push({k:norm(k),d:r.d}); }); }); }catch(e){} return out; }
function conflict(c){ var n=norm(c), d=defaults().filter(function(x){ return x.k===n; })[0]; return d?d.d:""; }
/* run our keys before anything else sees them */
window.addEventListener("keydown",function(e){
  if(rec){ return; }
  if(typing(e.target)||e.isComposing) return;
  var c=combo(e); if(!c) return;
  var b=B.filter(function(x){ return x.combo===c; })[0]; if(!b) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if(b.cmd===NOTHING) return;
  var call=callFor(b.cmd)||b.call; if(call) run(call);
},true);
function recorder(e){
  if(!rec) return;
  var c=combo(e); if(!c&&(e.key==="Control"||e.key==="Shift"||e.key==="Alt"||e.key==="Meta")) { return; }
  e.preventDefault(); e.stopImmediatePropagation();
  var r=rec; rec=null; window.removeEventListener("keydown",recorder,true);
  if(c==="Esc"){ note="Cancelled."; sh.paint(); return; }
  var was=conflict(c), clash=B.filter(function(x){ return x.combo===c&&x.id!==r.replace; })[0];
  B=B.filter(function(x){ return x.combo!==c&&x.id!==r.replace; });
  B.push({id:"s"+Date.now().toString(36),combo:c,cmd:r.cmd,call:callFor(r.cmd)}); store();
  note=c+" now runs \u201c"+r.cmd+"\u201d."+(clash?" It replaced your earlier binding \u201c"+clash.cmd+"\u201d.":"")+(was&&r.cmd!==NOTHING?" It also replaces the built-in: "+was+".":"")+(was&&r.cmd===NOTHING?" Built-in \u201c"+was+"\u201d is now off.":"");
  sh.paint();
}
function arm(cmd,replace){ rec={cmd:cmd,replace:replace||null}; window.addEventListener("keydown",recorder,true); note="Press the key combination now (Esc cancels)\u2026"; sh.paint(); }
function body(){
  var h='<div class="note">'+kit.esc(note||"Choose a command, then press the keys you want for it.")+'</div>';
  if(rec) return h+'<div style="padding:18px;text-align:center;border:1px dashed #ffb454;border-radius:12px;color:#ffb454;font-weight:700">Waiting for a key\u2026<br><span class="note">for \u201c'+kit.esc(rec.cmd)+'\u201d</span></div><button type="button" data-k="cancel">Cancel</button>';
  h+='<h5>My shortcuts ('+B.length+')</h5>'+(B.length?"":'<div class="note">None yet.</div>');
  B.slice().sort(function(a,b){ return a.cmd<b.cmd?-1:1; }).forEach(function(b){
    var c=conflict(b.combo);
    h+='<div style="border:1px solid #302c26;border-radius:10px;padding:7px 9px;display:flex;flex-direction:column;gap:5px"><div style="display:flex;justify-content:space-between;gap:8px"><b style="color:#ffb454">'+kit.esc(b.combo)+'</b><span>'+kit.esc(b.cmd)+'</span></div>'+(c?'<div class="note">Replaces built-in: '+kit.esc(c)+'</div>':"")+'<div class="g"><button type="button" data-k="chg:'+b.id+'" style="min-height:36px">Change key</button><button type="button" data-k="rm:'+b.id+'" style="min-height:36px">Remove</button></div></div>';
  });
  var all=cmds(), f=filter.trim().toLowerCase(), list=all.filter(function(c){ return !f||c[0].toLowerCase().indexOf(f)>=0; }).slice(0,10);
  h+='<h5>Add a shortcut</h5><input id="seQ" placeholder="Search '+all.length+' commands" value="'+kit.esc(filter)+'">';
  h+='<button type="button" data-k="add:'+kit.esc(NOTHING)+'" style="text-align:left">\u2205 '+NOTHING+'</button>';
  list.forEach(function(c){ h+='<button type="button" data-k="add:'+kit.esc(c[0])+'" style="text-align:left">'+kit.esc(c[0])+'</button>'; });
  if(all.length>list.length) h+='<div class="note">Showing '+list.length+'. Type to narrow the list.</div>';
  h+='<h5>Share</h5><div class="g"><button type="button" data-k="exp">Export (.json)</button><button type="button" data-k="imp">Import</button></div><button type="button" data-k="reset">Reset all</button>';
  return h;
}
var sh=kit.sheet("akShortcuts","\u2328 Shortcut editor",body,function(k,b,api){
  var p=k.split(":"), id=p.slice(1).join(":");
  if(p[0]==="add") arm(id);
  else if(p[0]==="chg"){ var x=B.filter(function(y){ return y.id===id; })[0]; if(x) arm(x.cmd,x.id); }
  else if(p[0]==="rm"){ B=B.filter(function(y){ return y.id!==id; }); store(); note="Removed."; api.paint(); }
  else if(k==="cancel"){ rec=null; window.removeEventListener("keydown",recorder,true); note=""; api.paint(); }
  else if(k==="exp"){ var u=URL.createObjectURL(new Blob([JSON.stringify({app:"amiyo-video-studio",shortcuts:B.map(function(x){ return {combo:x.combo,cmd:x.cmd}; })},null,2)],{type:"application/json"})), a=document.createElement("a"); a.href=u; a.download="video-studio-shortcuts.json"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(u); },6000); }
  else if(k==="imp"){ var i=document.createElement("input"); i.type="file"; i.accept=".json,application/json"; i.onchange=function(){ var f=i.files&&i.files[0]; if(!f) return; f.text().then(function(t){ var d=JSON.parse(t), n=0; (d.shortcuts||[]).forEach(function(s){ if(s&&typeof s.combo==="string"&&typeof s.cmd==="string"){ B=B.filter(function(y){ return y.combo!==s.combo; }); B.push({id:"s"+Date.now().toString(36)+n,combo:s.combo,cmd:s.cmd,call:callFor(s.cmd)}); n++; } }); store(); note="Imported "+n+" shortcut"+(n===1?"":"s")+"."; api.paint(); }).catch(function(){ note="That file could not be read."; api.paint(); }); }; i.click(); }
  else if(k==="reset"){ Promise.resolve(window.amiyoOk?window.amiyoOk("Remove all your custom shortcuts? Built-in keys come back.",{okLabel:"Reset",danger:true}):true).then(function(y){ if(y){ B=[]; store(); note="All custom shortcuts removed."; api.paint(); } }); }
});
sh.el.addEventListener("input",function(e){ if(e.target.id==="seQ"){ filter=e.target.value; clearTimeout(sh.__t); sh.__t=setTimeout(function(){ var el0=e.target, pos=el0.selectionStart; sh.paint(); var el=document.getElementById("seQ"); if(el){ el.focus(); try{ el.setSelectionRange(pos,pos); }catch(x){} } },200); } });
load();
window.amiyoShortcutEditor={open:sh.open,bindings:function(){ return B.slice(); },combo:combo};
kit.menu("\u2328 Shortcut editor",sh.open,"Shortcut editor","amiyoShortcutEditor.open()");
try{ window.AMIYO_EDITOR_BUILD="vs-step19-shortcuts"; }catch(e){}
})();

;
/* ==================== Script 523 id="amiyo-vs-step20-release" ==================== */
/* Video Studio step 20: Release check.
   Open Pr tools > "Release check". Shows every Video Studio feature (steps 1 to 19) with a green tick when it loaded in this
   browser, tests the browser features export needs (MediaRecorder, canvas capture, audio analysis, storage), lists how many
   saved versions, queue jobs and custom shortcuts you have, and lets you copy a plain-text report to send with a bug report. */
(function(){
"use strict";
var kit=window.amiyoKit; if(!kit||window.amiyoRelease) return;
var F=[
 ["1 Loudness (LUFS)","amiyoLufs"],["2 Reverb and echo","amiyoRoom"],["3 De-esser and limiter","amiyoDeess"],["4 Fades and crossfades","amiyoFade"],
 ["5 Voice clean-up","amiyoClean"],["6 Adjustment layers","amiyoAdjLook"],["7 Colour wheels","amiyoWheels"],["8 Keyframe curves","amiyoCurves"],
 ["9 Text animations","amiyoTextFx"],["10 Subtitle polish and SRT","amiyoSubFix"],["11 Proxy workflow","amiyoProxyFlow"],["12 Export queue","amiyoQueue"],
 ["13 Export presets","amiyoExportPresets"],["14 Render region","amiyoRegion"],["15 Project bins","amiyoBins"],["16 Timeline versions","amiyoVersions"],
 ["17 Chapter export","amiyoChapterExport"],["18 Social guides","amiyoGuides"],["19 Shortcut editor","amiyoShortcutEditor"]
];
function has(n){ return !!window[n]; }
function env(){
  var o=[];
  o.push(["Video recording (MediaRecorder)",typeof MediaRecorder!=="undefined"]);
  try{ o.push(["Canvas capture",!!(document.createElement("canvas").captureStream)]); }catch(e){ o.push(["Canvas capture",false]); }
  o.push(["Audio analysis (OfflineAudioContext)",!!(window.OfflineAudioContext||window.webkitOfflineAudioContext)]);
  var ls=false; try{ localStorage.setItem("vs_t","1"); ls=localStorage.getItem("vs_t")==="1"; localStorage.removeItem("vs_t"); }catch(e){}
  o.push(["Saved settings (localStorage)",ls]);
  o.push(["Project database (IndexedDB)",!!window.indexedDB&&!window.__amiyoIdbOpenFailed]);
  o.push(["Keep screen on during export",!!(navigator.wakeLock)]);
  o.push(["Copy to clipboard",!!(navigator.clipboard&&navigator.clipboard.writeText)]);
  return o;
}
function stats(){
  var s=[]; try{ s.push(["Clips on timeline",kit.all().length]); s.push(["Media files",Object.keys(project.assets||{}).length]); s.push(["Markers",(project.markers||[]).length]);
    s.push(["Queue jobs",window.amiyoQueue?window.amiyoQueue.jobs().length:0]); s.push(["Saved timeline versions",window.amiyoVersions?window.amiyoVersions.list().length:0]); s.push(["Custom shortcuts",window.amiyoShortcutEditor?window.amiyoShortcutEditor.bindings().length:0]); }catch(e){}
  return s;
}
function report(){
  var L=["Video Studio release check","Build: "+(window.AMIYO_EDITOR_BUILD||"?"),"Browser: "+navigator.userAgent,""];
  L.push("Features"); F.forEach(function(f){ L.push((has(f[1])?"[ok]  ":"[MISSING]  ")+f[0]); });
  L.push("","Browser support"); env().forEach(function(e){ L.push((e[1]?"[ok]  ":"[no]  ")+e[0]); });
  L.push("","Project"); stats().forEach(function(s){ L.push(s[0]+": "+s[1]); });
  try{ if(window.__swlLog&&window.__swlLog.length) L.push("","Recent silent errors: "+window.__swlLog.length); }catch(e){}
  return L.join("\n");
}
function body(){
  var miss=F.filter(function(f){ return !has(f[1]); }).length, h='<div class="note">Build <b>'+kit.esc(window.AMIYO_EDITOR_BUILD||"?")+'</b></div>';
  h+='<div class="g"><div>Features loaded<br><b style="font-size:20px;color:'+(miss?"#ffb454":"#9af0b8")+'">'+(F.length-miss)+' / '+F.length+'</b></div><div>Browser checks<br><b style="font-size:20px">'+env().filter(function(e){ return e[1]; }).length+' / '+env().length+'</b></div></div>';
  h+='<h5>Features</h5>'+F.map(function(f){ var ok=has(f[1]); return '<div style="display:flex;justify-content:space-between"><span>'+f[0]+'</span><b style="color:'+(ok?"#9af0b8":"#ff7b7b")+'">'+(ok?"\u2713":"missing")+'</b></div>'; }).join("");
  h+='<h5>This browser</h5>'+env().map(function(e){ return '<div style="display:flex;justify-content:space-between"><span>'+e[0]+'</span><b style="color:'+(e[1]?"#9af0b8":"#ffb454")+'">'+(e[1]?"\u2713":"no")+'</b></div>'; }).join("");
  h+='<h5>Project</h5>'+stats().map(function(s){ return '<div style="display:flex;justify-content:space-between"><span>'+s[0]+'</span><b>'+s[1]+'</b></div>'; }).join("");
  h+='<button type="button" data-k="copy">Copy report</button>';
  return h;
}
var sh=kit.sheet("akRelease","\u2705 Release check",body,function(k,b,api){
  if(k==="copy"){ var t=report(); try{ navigator.clipboard.writeText(t).then(function(){ kit.say("Report copied"); },function(){ kit.say("Could not copy"); }); }catch(e){ kit.say("Could not copy"); } }
});
window.amiyoRelease={open:sh.open,report:report};
kit.menu("\u2705 Release check",sh.open,"Release check","amiyoRelease.open()");
try{ window.AMIYO_EDITOR_BUILD="vs-release-1.0"; }catch(e){}
})();

;
/* ==================== Script 524 id="amiyo-lib-step01-core" ==================== */
/* Libraries step 1 (Premiere Pro "Libraries" panel style): library core.
   Open Pr tools > "Libraries". Reusable items live in libraries that are saved in this browser and shared by every project you open
   (they are not stored inside the project file). Make several libraries, search them, filter by type, favourite, rename or delete items.
   Later steps add the item types (colours, text styles, titles, looks, snippets...) through window.amiyoLib.type(). */
(function(){
"use strict";
var kit=window.amiyoKit; if(!kit||window.amiyoLib) return;
var lastVis=[], H={tools:[],card:[],act:[],filter:[]}, UI={view:"list",sort:"new"}; try{ var _u=JSON.parse(localStorage.getItem("amiyo_vslib_ui")||"{}"); if(_u.view==="grid"||_u.view==="list") UI.view=_u.view; if(_u.sort) UI.sort=_u.sort; }catch(e){}
function saveUI(){ try{ localStorage.setItem("amiyo_vslib_ui",JSON.stringify(UI)); }catch(e){} }
var PAGE=60, lim=PAGE, limKey=""; var DBK="vslib:v1", LSK="amiyo_vslib", S={libs:[],cur:null}, T={}, order=[], q="", tf="", ready=false, saveT=0, store="memory", subs=[];
function nid(p){ return p+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
function norm(){ if(!S||!Array.isArray(S.libs)) S={libs:[],cur:null}; if(!S.libs.length) S.libs.push({id:nid("lib"),name:"My Library",items:[]}); if(!S.libs.some(function(l){ return l.id===S.cur; })) S.cur=S.libs[0].id; }
var idbOK=!!window.indexedDB, idbP=null, savedAt=0, saveErr="";
function vsDb(){
  if(idbP) return idbP;
  idbP=new Promise(function(res){ try{ var r=indexedDB.open("amiyo_vslib",1); r.onupgradeneeded=function(){ try{ r.result.createObjectStore("kv"); }catch(e){} }; r.onsuccess=function(){ res(r.result); }; r.onerror=function(){ idbOK=false; res(null); }; r.onblocked=function(){ idbOK=false; res(null); }; }catch(e){ idbOK=false; res(null); } });
  return idbP;
}
function vsGet(){ if(!idbOK) return Promise.resolve(null); return vsDb().then(function(db){ if(!db) return null; return new Promise(function(res){ try{ var q=db.transaction("kv","readonly").objectStore("kv").get("state"); q.onsuccess=function(){ res(q.result||null); }; q.onerror=function(){ res(null); }; }catch(e){ res(null); } }); }); }
function vsPut(v){ if(!idbOK) return Promise.resolve(false); return vsDb().then(function(db){ if(!db) return false; return new Promise(function(res){ try{ var tx=db.transaction("kv","readwrite"); tx.objectStore("kv").put(v,"state"); tx.oncomplete=function(){ res(true); }; tx.onerror=function(){ res(false); }; tx.onabort=function(){ res(false); }; }catch(e){ res(false); } }); }); }
function load(){
  var done=function(v){ if(v&&Array.isArray(v.libs)) S=v; norm(); ready=true; try{ sh.paint(); }catch(e){} fire(); };
  var ls=function(){ try{ return JSON.parse(localStorage.getItem(LSK)||"null"); }catch(e){ return null; } };
  return vsGet().then(function(v){
    if(v&&Array.isArray(v.libs)){ store="browser"; return done(v); }
    var l=ls();
    if(l&&Array.isArray(l.libs)){ store="local"; done(l); vsPut(l).then(function(ok){ if(ok){ store="browser"; try{ localStorage.removeItem(LSK); }catch(e){} } }); return; }
    store=idbOK?"browser":"local"; done(null);
  },function(){ var l=ls(); store="local"; done(l); });
}
function persist(){
  clearTimeout(saveT); saveT=setTimeout(function(){
    vsPut(S).then(function(ok){
      if(ok){ store="browser"; saveErr=""; savedAt=Date.now(); try{ localStorage.removeItem(LSK); }catch(e){} }
      else { try{ localStorage.setItem(LSK,JSON.stringify(S)); store="local"; saveErr=""; savedAt=Date.now(); }catch(e){ store="memory"; saveErr="Browser storage is full or blocked"; } }
      try{ window.dispatchEvent(new CustomEvent("amiyolibsave")); }catch(e){}
    });
  },250);
}
function fire(){ subs.forEach(function(f){ try{ f(); }catch(e){} }); }
function lib(){ norm(); return S.libs.filter(function(l){ return l.id===S.cur; })[0]; }
function find(id){ var r=null; S.libs.forEach(function(l){ l.items.forEach(function(i){ if(i.id===id) r=i; }); }); return r; }
function add(type,name,data,extra){ var it={id:nid("it"),type:type,name:String(name||"Untitled").slice(0,60),data:data,tags:[],fav:false,uses:0,at:Date.now()}; if(extra) Object.keys(extra).forEach(function(k){ it[k]=extra[k]; }); lib().items.unshift(it); persist(); fire(); return it; }
function toTrash(i,l){ S.trash=S.trash||[]; S.trash.unshift({item:i,lib:l.id,libName:l.name,at:Date.now()}); if(S.trash.length>300) S.trash.length=300; }
function remove(id){ S.libs.forEach(function(l){ l.items=l.items.filter(function(i){ if(i.id===id){ toTrash(i,l); return false; } return true; }); }); persist(); fire(); }
function update(id,patch){ var it=find(id); if(!it) return null; Object.keys(patch).forEach(function(k){ it[k]=patch[k]; }); persist(); fire(); return it; }
function type(id,def){ if(!T[id]) order.push(id); T[id]=def; try{ sh.paint(); }catch(e){} }
function apply(id){
  var it=find(id), d=it&&T[it.type]; if(!it||!d||!d.apply){ kit.say("This item cannot be applied here"); return; }
  var msg; try{ msg=d.apply(it); }catch(e){ kit.say("Could not apply: "+(e&&e.message||e),4000); return; }
  if(msg===false) return; it.uses++; it.last=Date.now(); persist(); if(msg) kit.say(msg);
}
function ask(msg,def){ var v=window.prompt(msg,def||""); return v==null?null:String(v).trim().slice(0,60); }
function cardHTML(i,grid){
  var d=T[i.type]||{}, pv=d.preview?d.preview(i):"", ex="", ic='<span style="font-size:20px">'+(d.icon||"\u25a0")+'</span>';
  H.card.forEach(function(f){ try{ ex+=f(i)||""; }catch(e){} });
  var nm='<b style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+kit.esc(i.name)+'</b><span class="note">'+kit.esc(d.label||i.type)+(i.uses?" \u00b7 used "+i.uses+"\u00d7":"")+'</span>';
  var head=grid?'<div style="display:flex;justify-content:center;align-items:center;min-height:46px;overflow:hidden">'+(pv||ic)+'</div><div style="min-width:0;text-align:center">'+nm+'</div>':'<div style="display:flex;gap:8px;align-items:center">'+(pv||ic)+'<div style="min-width:0;flex:1">'+nm+'</div></div>';
  var bs='min-height:38px', fv='<button type="button" data-k="fv:'+i.id+'" aria-label="Favourite" style="'+bs+';'+(i.fav?"color:#ffb454":"")+'">'+(i.fav?"\u2605":"\u2606")+'</button>', rn='<button type="button" data-k="rn:'+i.id+'" style="'+bs+'">Name</button>', dx='<button type="button" data-k="dx:'+i.id+'" aria-label="Delete" style="'+bs+'">\u2715</button>', ap='<button type="button" data-k="ap:'+i.id+'" style="'+bs+'">Apply</button>';
  var btn=grid?'<div style="display:grid;grid-template-columns:1fr;gap:6px">'+ap+'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">'+fv+rn+dx+'</div></div>':'<div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:6px">'+ap+fv+rn+dx+'</div>';
  return '<div data-it="'+i.id+'" style="border:1px solid #302c26;border-radius:10px;padding:8px;display:flex;flex-direction:column;gap:6px;min-width:0">'+head+ex+btn+'</div>';
}
function body(){
  if(!ready) return '<div class="note">Loading libraries\u2026</div>';
  var L=lib(), h='<select id="lbSel">'+S.libs.map(function(l){ return '<option value="'+l.id+'"'+(l.id===S.cur?" selected":"")+'>'+kit.esc(l.name)+' ('+l.items.length+')</option>'; }).join("")+'</select>';
  h+='<div class="g"><button type="button" data-k="nl" style="min-height:36px">New library</button><button type="button" data-k="rl" style="min-height:36px">Rename</button></div>';
  if(S.libs.length>1) h+='<button type="button" data-k="dl" style="min-height:36px">Delete this library</button>';
  if(store==="memory") h+='<div class="note" style="color:#ffb454">Browser storage is unavailable: libraries last only until you close this page.</div>';
  var caps=order.filter(function(t){ return T[t].capture; });
  if(caps.length) h+='<h5>Save from your selection</h5><div class="g">'+caps.map(function(t){ return '<button type="button" data-k="cap:'+t+'">\uff0b '+kit.esc(T[t].label||t)+'</button>'; }).join("")+'</div>';
  h+='<h5>Items</h5><input id="lbQ" placeholder="Search this library" value="'+kit.esc(q)+'">';
  var cnt={}; L.items.forEach(function(i){ cnt[i.type]=(cnt[i.type]||0)+1; }); var favN=L.items.filter(function(i){ return i.fav; }).length;
  function chip(k,label,on){ return '<button type="button" data-k="'+k+'" style="min-height:32px;'+(on?"border-color:#ffb454;color:#ffb454":"")+'">'+label+'</button>'; }
  if(L.items.length){
    h+='<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">'+chip("tf:","All "+L.items.length,!tf)+order.filter(function(t){ return cnt[t]; }).map(function(t){ return chip("tf:"+t,kit.esc(T[t].label||t)+" "+cnt[t],tf===t); }).join("")+(favN||tf==="*fav"?chip("tf:*fav","\u2605 "+favN,tf==="*fav"):"")+'</div>';
    var so=[["new","Newest first"],["old","Oldest first"],["name","Name A\u2013Z"],["used","Most used"],["recent","Recently used"],["type","By type"],["manual","My order"]];
    h+='<div style="display:grid;grid-template-columns:1fr auto auto;gap:6px;margin-top:8px;align-items:center"><select id="lbSort" aria-label="Sort items">'+so.map(function(o){ return '<option value="'+o[0]+'"'+(UI.sort===o[0]?" selected":"")+'>'+o[1]+'</option>'; }).join("")+'</select>'+chip("vw:list","\u2630",UI.view==="list")+chip("vw:grid","\u25a6",UI.view==="grid")+'</div>';
  }
  H.tools.forEach(function(f){ try{ h+=f(L)||""; }catch(e){} });
  var ws=(window.amiyoLibQ?window.amiyoLibQ.words(q):q.trim().toLowerCase().split(/\s+/)).filter(Boolean);
  var list=L.items.filter(function(i){ if(tf==="*fav"&&!i.fav) return false; if(tf&&tf!=="*fav"&&i.type!==tf) return false; for(var x=0;x<H.filter.length;x++){ try{ if(H.filter[x](i)===false) return false; }catch(e){} } var hay=(i.name+" "+(i.tags||[]).join(" ")+" "+((T[i.type]&&T[i.type].label)||i.type)+" "+(i.note||"")+" "+(i.folder||"")).toLowerCase(); return ws.every(function(w){ return hay.indexOf(w)>=0; }); });
  var cmp={manual:function(a,b){ return (a.ord==null?-1:a.ord)-(b.ord==null?-1:b.ord)||(b.at||0)-(a.at||0); },new:function(a,b){ return (b.at||0)-(a.at||0); },old:function(a,b){ return (a.at||0)-(b.at||0); },name:function(a,b){ return String(a.name).localeCompare(String(b.name),undefined,{numeric:true,sensitivity:"base"}); },used:function(a,b){ return (b.uses||0)-(a.uses||0)||(b.at||0)-(a.at||0); },recent:function(a,b){ return (b.last||0)-(a.last||0)||(b.at||0)-(a.at||0); },type:function(a,b){ return order.indexOf(a.type)-order.indexOf(b.type)||String(a.name).localeCompare(String(b.name),undefined,{numeric:true}); }}[UI.sort]||function(a,b){ return (b.at||0)-(a.at||0); };
  list=list.slice().sort(function(a,b){ return (b.pin?1:0)-(a.pin?1:0)||cmp(a,b); }); lastVis=list.map(function(i){ return i.id; });
  if(L.items.length) h+='<div class="note" style="margin-top:6px">'+(list.length===L.items.length?L.items.length+" item"+(L.items.length===1?"":"s"):list.length+" of "+L.items.length+" shown")+'</div>';
  if(!list.length) h+='<div class="note">'+(L.items.length?"Nothing matches.":"Empty. Select something in the timeline and use \u201cSave from your selection\u201d.")+'</div>';
  var grid=UI.view==="grid";
  if(grid) h+='<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">';
  var lkey=S.cur+"|"+q+"|"+tf+"|"+UI.sort; if(lkey!==limKey){ limKey=lkey; lim=PAGE; }
  var shown=list.slice(0,lim);
  shown.forEach(function(i){ h+=cardHTML(i,grid); });
  if(grid) h+='</div>';
  if(list.length>shown.length) h+='<button type="button" data-k="more" style="min-height:44px">Show '+Math.min(PAGE,list.length-shown.length)+' more ('+(list.length-shown.length)+' hidden)</button>';
  return h;
}
var sh=kit.sheet("akLib","\ud83d\udcda Libraries",body,function(k,b,api){
  var p=k.split(":"), id=p.slice(1).join(":");
  for(var hi=0;hi<H.act.length;hi++){ try{ if(H.act[hi](k,api)) return; }catch(e){} }
  if(k==="more"){ lim+=PAGE; api.paint(); return; }
  if(p[0]==="vw"){ UI.view=id==="grid"?"grid":"list"; saveUI(); api.paint(); return; }
  if(k==="nl"){ var n=ask("Library name","Library "+(S.libs.length+1)); if(n){ var l={id:nid("lib"),name:n,items:[]}; S.libs.push(l); S.cur=l.id; persist(); api.paint(); } }
  else if(k==="rl"){ var n2=ask("Library name",lib().name); if(n2){ lib().name=n2; persist(); api.paint(); } }
  else if(k==="dl"){ Promise.resolve(window.amiyoOk?window.amiyoOk("Delete the library \u201c"+lib().name+"\u201d and its "+lib().items.length+" items? This cannot be undone.",{okLabel:"Delete",danger:true}):true).then(function(y){ if(!y) return; var _dl=lib(); _dl.items.forEach(function(i){ toTrash(i,_dl); }); S.libs=S.libs.filter(function(l){ return l.id!==S.cur; }); norm(); persist(); fire(); api.paint(); }); }
  else if(p[0]==="cap"){ var d=T[id]; if(!d||!d.capture) return; var c; try{ c=d.capture(); }catch(e){ kit.say("Could not save: "+(e&&e.message||e),4000); return; } if(!c) return; add(id,c.name||d.label,c.data,c.extra); kit.say("Saved to \u201c"+lib().name+"\u201d"); api.paint(); }
  else if(p[0]==="tf"){ tf=id; api.paint(); }
  else if(p[0]==="ap") apply(id);
  else if(p[0]==="fv"){ var it=find(id); if(it){ update(id,{fav:!it.fav}); api.paint(); } }
  else if(p[0]==="rn"){ var it2=find(id), nn=it2&&ask("Item name",it2.name); if(nn){ update(id,{name:nn}); api.paint(); } }
  else if(p[0]==="dx"){ var it3=find(id); if(it3) Promise.resolve(window.amiyoOk?window.amiyoOk("Delete \u201c"+it3.name+"\u201d from the library?",{okLabel:"Delete",danger:true}):true).then(function(y){ if(y){ remove(id); kit.say("Deleted. You can restore it from Recently deleted"); api.paint(); } }); }
});
sh.el.addEventListener("input",function(e){ if(e.target.id==="lbQ"){ q=e.target.value; clearTimeout(sh.__t); var t=e.target; sh.__t=setTimeout(function(){ var pos=t.selectionStart; sh.paint(); var el=document.getElementById("lbQ"); if(el){ el.focus(); try{ el.setSelectionRange(pos,pos); }catch(x){} } },200); } });
sh.el.addEventListener("change",function(e){ if(e.target.id==="lbSel"){ S.cur=e.target.value; tf=""; persist(); sh.paint(); } else if(e.target.id==="lbSort"){ UI.sort=e.target.value; saveUI(); sh.paint(); } });
type("note",{label:"Note",icon:"\ud83d\udcdd",capture:function(){ var t=ask("Note text to keep (for example a hashtag set or a credit line)",""); if(!t) return null; return {name:t.slice(0,30),data:{text:t}}; },apply:function(it){ try{ navigator.clipboard.writeText(it.data.text); return "Copied to the clipboard"; }catch(e){ return "Could not copy"; } },preview:function(){ return ""; }});
window.amiyoLib={visible:function(){ return lastVis.slice(); },hook:function(n,f){ if(H[n]) H[n].push(f); },ui:UI,paint:function(){ try{ sh.paint(); }catch(e){} },save:persist,open:function(){ load().then(sh.open); },type:type,add:add,find:find,remove:remove,update:update,apply:apply,lib:lib,onChange:function(f){ subs.push(f); },ready:function(){ return ready; },nid:nid,ask:ask,all:function(){ return S; },set:function(s){ S=s; norm(); persist(); fire(); try{ sh.paint(); }catch(e){} },types:function(){ return T; }};
window.amiyoLib.storage=function(){ return {kind:store,at:savedAt,err:saveErr}; }; window.amiyoLibStore={get:vsGet,put:vsPut};
kit.menu("\ud83d\udcda Libraries",window.amiyoLib.open,"Libraries","amiyoLib.open()");
load();
try{ window.AMIYO_EDITOR_BUILD="vs-lib-step01-core"; }catch(e){}
})();

;
/* ==================== Script 525 id="amiyo-lib-step02-colors" ==================== */
/* Libraries step 2: Colour swatches.
   In Libraries, "+ Colour" saves the colour of the selected text clip (or opens a colour picker if none is selected).
   "+ Project palette" saves every distinct text colour and the background in one go. Apply sets the colour of the selected text
   or caption clips, or the project background when nothing is selected. One undo step. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__color) return; L.__color=true;
function hex(s){ s=String(s||"").trim().toLowerCase(); if(/^#[0-9a-f]{3}$/.test(s)) s="#"+s[1]+s[1]+s[2]+s[2]+s[3]+s[3]; return /^#[0-9a-f]{6}$/.test(s)?s:null; }
function txt(){ return kit.sel().filter(function(x){ return x.clip.textStyle; }); }
function picker(cb,start){
  var i=document.createElement("input"); i.type="color"; i.value=start||"#ffb454"; i.style.cssText="position:fixed;left:-99px;top:0;opacity:0"; document.body.appendChild(i);
  var done=false; function fin(){ if(done) return; done=true; var v=hex(i.value); i.remove(); if(v) cb(v); }
  i.addEventListener("change",fin); i.addEventListener("blur",function(){ setTimeout(fin,300); }); try{ i.click(); }catch(e){ fin(); }
}
function exists(h){ return L.lib().items.some(function(i){ return i.type==="color"&&i.data.hex===h; }); }
function lum(h){ var n=parseInt(h.slice(1),16),r=n>>16,g=(n>>8)&255,b=n&255; return (0.299*r+0.587*g+0.114*b)/255; }
L.type("color",{label:"Colour",icon:"\ud83c\udfa8",
  preview:function(i){ var h=i.data.hex; return '<span style="width:38px;height:38px;border-radius:9px;flex:none;background:'+h+';border:1px solid #302c26;display:flex;align-items:center;justify-content:center;font:700 9px system-ui;color:'+(lum(h)>.55?"#111":"#fff")+'">'+h.slice(1)+'</span>'; },
  capture:function(){
    var t=txt();
    if(t.length){ var h=hex(t[0].clip.textStyle.color); if(h){ if(exists(h)){ kit.say("That colour is already saved"); return null; } return {name:h,data:{hex:h}}; } }
    picker(function(h){ if(exists(h)){ kit.say("That colour is already saved"); return; } L.add("color",h,{hex:h}); kit.say("Colour saved"); L.open(); },hex(project.settings&&project.settings.background)||"#ffb454");
    return null;
  },
  apply:function(it){
    var h=it.data.hex, t=txt();
    if(t.length){ kit.edit("Apply colour",function(){ t.forEach(function(x){ x.clip.textStyle.color=h; }); }); return "Colour applied to "+t.length+" text clip"+(t.length>1?"s":""); }
    if(kit.sel().length){ kit.say("Select a text clip, or deselect everything to set the background"); return false; }
    kit.edit("Background colour",function(){ project.settings.background=h; project.settings.bgGradient=null; }); return "Background set to "+h;
  }});
L.type("palette",{label:"Project palette",icon:"\ud83c\udfa8",capture:function(){
  var seen={}, n=0, add=function(h){ h=hex(h); if(!h||seen[h]||exists(h)) return; seen[h]=1; L.add("color",h,{hex:h}); n++; };
  add(project.settings&&project.settings.background);
  kit.all().forEach(function(x){ if(x.clip.textStyle){ add(x.clip.textStyle.color); add(x.clip.textStyle.strokeColor); add(x.clip.textStyle.bg); } });
  kit.say(n?n+" colour"+(n>1?"s":"")+" saved":"No new colours in this project"); L.open(); return null; }});
try{ window.AMIYO_EDITOR_BUILD="vs-lib-step02-colors"; }catch(e){}
})();

;
/* ==================== Script 526 id="amiyo-lib-step03-textstyles" ==================== */
/* Libraries step 3: Text styles.
   "+ Text style" saves the font, size, weight, colour, alignment, shadow and every other style setting of the selected text clip.
   Apply copies that style onto all selected text or caption clips (their words, position and timing are not touched). One undo step. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__tstyle) return; L.__tstyle=true;
function txt(){ return kit.sel().filter(function(x){ return x.clip.textStyle; }); }
function lum(h){ var m=/^#([0-9a-f]{6})$/i.exec(h||""); if(!m) return .5; var n=parseInt(m[1],16); return (0.299*(n>>16)+0.587*((n>>8)&255)+0.114*(n&255))/255; }
function clone(o){ return JSON.parse(JSON.stringify(o)); }
L.type("textstyle",{label:"Text style",icon:"Aa",
  preview:function(i){ var s=i.data.style||{}, c=s.color||"#fff", bg=lum(c)>.7?"#1b1915":"#d9d4c8";
    return '<span style="width:44px;height:38px;border-radius:9px;flex:none;background:'+bg+';display:flex;align-items:center;justify-content:center;overflow:hidden;font-family:'+(String(s.fontFamily||"system-ui").replace(/[<>"]/g,""))+';font-weight:'+(s.weight||700)+';font-style:'+(s.italic?"italic":"normal")+';font-size:20px;color:'+c+';'+(s.shadow?"text-shadow:1px 1px 2px rgba(0,0,0,.7);":"")+'">Aa</span>'; },
  capture:function(){
    var t=txt(); if(!t.length){ kit.say("Select a text clip first"); return null; }
    var s=clone(t[0].clip.textStyle), nm=(String(s.fontFamily||"System").split(",")[0].replace(/["']/g,"")+" "+(s.fontSize||"")).trim();
    return {name:nm,data:{style:s}};
  },
  apply:function(it){
    var t=txt(); if(!t.length){ kit.say("Select one or more text clips first"); return false; }
    kit.edit("Apply text style",function(){ t.forEach(function(x){ x.clip.textStyle=Object.assign({},x.clip.textStyle,clone(it.data.style)); }); });
    return "Style applied to "+t.length+" clip"+(t.length>1?"s":"");
  }});
try{ window.AMIYO_EDITOR_BUILD="vs-lib-step03-textstyles"; }catch(e){}
})();

;
/* ==================== Script 527 id="amiyo-lib-step04-titles" ==================== */
/* Libraries step 4: Titles and graphics.
   "+ Title" saves the selected text clips (one title or a whole lower-third made of several) with their text, style, position, animation,
   keyframes and relative timing. Apply drops a fresh copy at the playhead on the text track and selects it. One undo step. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__title) return; L.__title=true;
var DROP=["id","selected","groupId","linkId","linked","sharedLook"];
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function picked(){ return kit.sel().filter(function(x){ return x.clip.kind==="text"&&!x.clip.assetId; }); }
function lum(h){ var m=/^#([0-9a-f]{6})$/i.exec(h||""); if(!m) return .5; var n=parseInt(m[1],16); return (0.299*(n>>16)+0.587*((n>>8)&255)+0.114*(n&255))/255; }
L.type("title",{label:"Title",icon:"T",
  preview:function(i){ var c=i.data.clips[0]||{}, s=c.textStyle||{}, col=s.color||"#fff";
    return '<span style="width:64px;height:38px;border-radius:9px;flex:none;background:'+(lum(col)>.7?"#1b1915":"#d9d4c8")+';display:flex;align-items:center;justify-content:center;overflow:hidden;font-family:'+String(s.fontFamily||"system-ui").replace(/[<>"]/g,"")+';font-weight:'+(s.weight||700)+';font-size:12px;color:'+col+';white-space:nowrap">'+kit.esc(String(c.text||"Title").slice(0,10))+'</span>'; },
  capture:function(){
    var P=picked(); if(!P.length){ kit.say("Select one or more text clips first"); return null; }
    var t0=Math.min.apply(null,P.map(function(x){ return x.clip.start; })), n=P.length;
    var clips=P.map(function(x){ var c=clone(x.clip); DROP.forEach(function(k){ delete c[k]; }); c.offset=Math.max(0,x.clip.start-t0); delete c.start; c.trackKind=x.track.kind||"text"; return c; });
    var first=String(P[0].clip.text||P[0].clip.name||"Title").replace(/\s+/g," ").slice(0,24);
    return {name:first+(n>1?" +"+(n-1):""),data:{clips:clips,duration:Math.max.apply(null,clips.map(function(c){ return c.offset+(c.duration||0); }))}};
  },
  apply:function(it){
    var made=[], at=typeof currentTime==="number"?currentTime:0;
    kit.edit("Add title from library",function(){
      it.data.clips.forEach(function(src){
        var c=clone(src); c.id=uid("clip"); c.start=at+(c.offset||0); delete c.offset; delete c.trackKind;
        var tr=getTrack("text"); tr.clips.push(c); tr.clips.sort(function(a,b){ return a.start-b.start; }); made.push({c:c,t:tr});
      });
      try{ clearMultiSelection(); }catch(e){}
      made.forEach(function(m){ m.c.selected=true; }); selectedClipId=made[0].c.id; selectedTrackId=made[0].t.id;
    });
    return "Title added at the playhead";
  }});
try{ window.AMIYO_EDITOR_BUILD="vs-lib-step04-titles"; }catch(e){}
})();

;
/* ==================== Script 528 id="amiyo-lib-step05-looks" ==================== */
/* Libraries step 5: Looks.
   "+ Look" saves the look of the selected clip: its effects stack, filter and strength, LUT, colour wheels, colour preset and blend mode.
   Apply replaces the look of every selected visual clip (video, image or adjustment layer) with the saved one; sound, trim, position and
   text are not touched. One undo step. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__look) return; L.__look=true;
var KEYS=["effects","filter","filterAmt","lut","lutAmt","colorWheels","colorPreset","blendMode"];
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function vis(){ return kit.sel().filter(function(x){ return !x.clip.textStyle&&x.track.kind!=="audio"&&x.track.kind!=="caption"; }); }
function has(c,k){ var v=c[k]; if(v==null||v===""||v===false) return false; if(Array.isArray(v)) return v.length>0; if(k==="filter") return v!=="none"; if(k==="blendMode") return v!=="normal"; return true; }
function fresh(fx){ return (fx||[]).map(function(x){ var n=clone(x); if(n&&typeof n==="object") n.id=uid("fx"); return n; }); }
L.type("look",{label:"Look",icon:"\u2728",
  preview:function(i){ var d=i.data, bits=[]; if(d.effects&&d.effects.length) bits.push("FX "+d.effects.length); if(d.lut) bits.push("LUT"); if(d.colorWheels) bits.push("Wheels"); if(d.filter&&d.filter!=="none") bits.push(String(d.filter).slice(0,7));
    return '<span style="min-width:54px;height:38px;border-radius:9px;flex:none;background:linear-gradient(135deg,#3b2a14,#3b2114);display:flex;align-items:center;justify-content:center;padding:0 6px;font:700 10px system-ui;color:#ffd9a0;text-align:center">'+kit.esc(bits.slice(0,2).join(" \u00b7 ")||"Look")+'</span>'; },
  capture:function(){
    var V=vis(); if(!V.length){ kit.say("Select a video, image or adjustment clip first"); return null; }
    var c=V[0].clip, d={}, n=0; KEYS.forEach(function(k){ if(has(c,k)){ d[k]=clone(c[k]); n++; } });
    if(!n){ kit.say("That clip has no effects, filter, LUT or colour grade to save"); return null; }
    var nm=(c.name||"Look").replace(/\.[a-z0-9]{2,4}$/i,"").slice(0,22)+" look";
    return {name:nm,data:d};
  },
  apply:function(it){
    var V=vis(); if(!V.length){ kit.say("Select one or more video, image or adjustment clips first"); return false; }
    kit.edit("Apply look",function(){ V.forEach(function(x){ KEYS.forEach(function(k){ delete x.clip[k]; }); var d=clone(it.data); if(d.effects) d.effects=fresh(d.effects); Object.keys(d).forEach(function(k){ x.clip[k]=d[k]; }); if(!x.clip.effects) x.clip.effects=[]; }); });
    return "Look applied to "+V.length+" clip"+(V.length>1?"s":"");
  }});
try{ window.AMIYO_EDITOR_BUILD="vs-lib-step05-looks"; }catch(e){}
})();

;
/* ==================== Script 529 id="amiyo-lib-step06-ui" ==================== */
try{ window.AMIYO_EDITOR_BUILD="vs-lib-step06-ui"; }catch(e){}

;
/* ==================== Script 530 id="amiyo-lib-step07-tags" ==================== */
/* Libraries step 7: Tags.
   Every item can carry up to 12 tags. "＋ Tag" / "Edit tags" on a card opens the full tag list for that item (separate with commas).
   Tag chips above the list filter the current library; tap several to narrow down (items must have all of them). Search also finds tags. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__tags) return; L.__tags=true;
var F=[];
function norm(list){ var out=[]; (Array.isArray(list)?list:String(list||"").split(/[,\n]/)).forEach(function(t){ t=String(t).replace(/^#+/,"").trim().toLowerCase().replace(/\s+/g," ").slice(0,24); if(t&&out.indexOf(t)<0&&out.length<12) out.push(t); }); return out; }
function counts(){ var c={}; L.lib().items.forEach(function(i){ (i.tags||[]).forEach(function(t){ c[t]=(c[t]||0)+1; }); }); return c; }
var PILL="min-height:30px;padding:0 10px;border-radius:99px;font-size:11px;";
L.hook("filter",function(i){ return F.every(function(t){ return (i.tags||[]).indexOf(t)>=0; }); });
L.hook("tools",function(){
  var c=counts(), names=Object.keys(c).sort(function(a,b){ return c[b]-c[a]||a.localeCompare(b); });
  F=F.filter(function(t){ return c[t]; });
  if(!names.length) return "";
  return '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;align-items:center"><span class="note">Tags</span>'+names.slice(0,24).map(function(t){ var on=F.indexOf(t)>=0; return '<button type="button" data-k="tgf:'+kit.esc(t)+'" style="'+PILL+(on?"border-color:#ffb454;color:#ffb454":"")+'">#'+kit.esc(t)+" "+c[t]+'</button>'; }).join("")+(F.length?'<button type="button" data-k="tgc" style="'+PILL+'">Clear</button>':"")+'</div>';
});
L.hook("card",function(i){
  var t=i.tags||[];
  return '<div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center">'+t.map(function(x){ return '<button type="button" data-k="tgf:'+kit.esc(x)+'" style="min-height:26px;padding:0 8px;font-size:10.5px;border-radius:99px;'+(F.indexOf(x)>=0?"border-color:#ffb454;color:#ffb454":"")+'">#'+kit.esc(x)+'</button>'; }).join("")+'<button type="button" data-k="te:'+i.id+'" style="min-height:26px;padding:0 8px;font-size:10.5px;border-radius:99px">'+(t.length?"Edit tags":"\uff0b Tag")+'</button></div>';
});
L.hook("act",function(k,api){
  if(k.indexOf("tgf:")===0){ var t=k.slice(4), x=F.indexOf(t); if(x>=0) F.splice(x,1); else F.push(t); api.paint(); return true; }
  if(k==="tgc"){ F=[]; api.paint(); return true; }
  if(k.indexOf("te:")===0){ var it=L.find(k.slice(3)); if(!it) return true; var v=window.prompt("Tags for \u201c"+it.name+"\u201d (separate with commas)",(it.tags||[]).join(", ")); if(v===null) return true; L.update(it.id,{tags:norm(v)}); api.paint(); return true; }
  return false;
});
L.tags={norm:norm,counts:counts,filter:function(){ return F.slice(); }};
})();

try{ window.AMIYO_EDITOR_BUILD="vs-lib-step07-tags"; }catch(e){}

;
/* ==================== Script 531 id="amiyo-lib-step08-bulk" ==================== */
/* Libraries step 8: Bulk select.
   "Select" turns on selection mode: tap items to pick them, "All" picks everything that is currently shown (after search / filters),
   then Tag (add tags, or remove one by starting it with -), Favourite or Delete the whole selection in one go. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__bulk) return; L.__bulk=true;
var on=false, SEL={};
function ids(){ return Object.keys(SEL).filter(function(id){ return SEL[id]&&L.find(id); }); }
function btn(k,t,x){ return '<button type="button" data-k="'+k+'" style="min-height:34px;padding:0 12px;'+(x||"")+'">'+t+'</button>'; }
L.hook("tools",function(){
  var n=ids().length;
  if(!L.lib().items.length) return "";
  if(!on) return '<div style="margin-top:8px">'+btn("sm","\u2611 Select")+'</div>';
  return '<div style="margin-top:8px;display:flex;flex-direction:column;gap:6px"><div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center">'+btn("sm","Done","border-color:#ffb454;color:#ffb454")+btn("sa","All shown")+btn("sn","None")+'<span class="note">'+n+' selected</span></div>'+
    (n?'<div style="display:flex;flex-wrap:wrap;gap:6px">'+btn("bt","\ud83c\udff7 Tags")+btn("bf","\u2605 Favourite")+btn("bd","\u2715 Delete")+'</div>':"")+'</div>';
});
L.hook("card",function(i){ if(!on) return ""; var s=!!SEL[i.id]; return '<button type="button" data-k="sx:'+i.id+'" aria-pressed="'+s+'" style="min-height:34px;'+(s?"border-color:#ffb454;color:#ffb454":"")+'">'+(s?"\u2611 Selected":"\u2610 Select")+'</button>'; });
L.hook("act",function(k,api){
  if(k==="sm"){ on=!on; SEL={}; api.paint(); return true; }
  if(k.indexOf("sx:")===0){ var id=k.slice(3); SEL[id]=!SEL[id]; api.paint(); return true; }
  if(k==="sa"){ L.visible().forEach(function(id){ SEL[id]=true; }); api.paint(); return true; }
  if(k==="sn"){ SEL={}; api.paint(); return true; }
  var sel=ids();
  if(k==="bt"){ if(!sel.length) return true; var v=window.prompt("Add tags to "+sel.length+" item"+(sel.length>1?"s":"")+" (separate with commas; start a tag with - to remove it)",""); if(v===null) return true;
    var add=[], del=[]; String(v).split(/[,\n]/).forEach(function(t){ t=t.trim(); if(!t) return; if(t.charAt(0)==="-") del.push(L.tags.norm(t.slice(1))[0]); else add.push(t); });
    add=L.tags?L.tags.norm(add):add;
    sel.forEach(function(id){ var it=L.find(id), t=(it.tags||[]).filter(function(x){ return del.indexOf(x)<0; }); L.update(id,{tags:L.tags.norm(t.concat(add))}); }); kit.say("Tags updated on "+sel.length+" item"+(sel.length>1?"s":"")); api.paint(); return true; }
  if(k==="bf"){ if(!sel.length) return true; var all=sel.every(function(id){ return L.find(id).fav; }); sel.forEach(function(id){ L.update(id,{fav:!all}); }); kit.say(all?"Removed from favourites":"Added to favourites"); api.paint(); return true; }
  if(k==="bd"){ if(!sel.length) return true; Promise.resolve(window.amiyoOk?window.amiyoOk("Delete "+sel.length+" selected item"+(sel.length>1?"s":"")+" from the library?",{okLabel:"Delete",danger:true}):true).then(function(y){ if(!y) return; sel.forEach(function(id){ L.remove(id); }); SEL={}; kit.say(sel.length+" item"+(sel.length>1?"s":"")+" deleted"); api.paint(); }); return true; }
  return false;
});
L.bulk={ids:ids,active:function(){ return on; },clear:function(){ SEL={}; }};
})();

try{ window.AMIYO_EDITOR_BUILD="vs-lib-step08-bulk"; }catch(e){}

;
/* ==================== Script 532 id="amiyo-lib-step09-xfer" ==================== */
/* Libraries step 9: Duplicate, copy and move.
   Each item gets "Duplicate", "Copy to\u2026" and "Move to\u2026". Pick the target library from the list that appears (or make a new one on the spot).
   In selection mode the same Copy / Move buttons work on everything you picked. Moving keeps tags, favourites and use counts; copying starts a fresh use count. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__xfer) return; L.__xfer=true;
var pick=null;
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function btn(k,t,x){ return '<button type="button" data-k="'+k+'" style="min-height:34px;padding:0 12px;'+(x||"")+'">'+t+'</button>'; }
function pill(k,t){ return '<button type="button" data-k="'+k+'" style="min-height:26px;padding:0 8px;font-size:10.5px;border-radius:99px">'+t+'</button>'; }
function others(){ var S=L.all(); return S.libs.filter(function(l){ return l.id!==S.cur; }); }
function dupe(id){ var it=L.find(id); if(!it) return null; var n=clone(it); n.id=L.nid("it"); n.name=(it.name+" copy").slice(0,60); n.uses=0; n.fav=false; n.at=Date.now(); delete n.last; var S=L.all(), items=L.lib().items, ix=items.indexOf(it); items.splice(ix+1,0,n); L.set(S); return n; }
function transfer(ids,mode,targetId){
  var S=L.all(), src=L.lib(), tl=S.libs.filter(function(l){ return l.id===targetId; })[0]; if(!tl||tl===src) return 0; var n=0;
  ids.forEach(function(id){ var it=L.find(id); if(!it) return;
    if(mode==="mv"){ src.items=src.items.filter(function(x){ return x.id!==id; }); tl.items.unshift(it); }
    else { var c=clone(it); c.id=L.nid("it"); c.uses=0; delete c.last; tl.items.unshift(c); }
    n++; });
  L.set(S); return n;
}
L.hook("tools",function(){
  var h="";
  if(L.bulk&&L.bulk.active()&&L.bulk.ids().length&&!pick) h+='<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">'+btn("cps","Copy to\u2026")+btn("mvs","Move to\u2026")+'</div>';
  if(pick){
    var n=pick.ids.length;
    h+='<div style="margin-top:8px;border:1px solid #ffb454;border-radius:10px;padding:8px;display:flex;flex-direction:column;gap:6px"><b>'+(pick.mode==="mv"?"Move ":"Copy ")+n+" item"+(n>1?"s":"")+' to\u2026</b>'+others().map(function(l){ return btn("pt:"+l.id,kit.esc(l.name)+" ("+l.items.length+")"); }).join("")+btn("pt:*new","\uff0b New library")+btn("pc","Cancel")+'</div>';
  }
  return h;
});
L.hook("card",function(i){
  if(L.bulk&&L.bulk.active()) return "";
  return '<div style="display:flex;flex-wrap:wrap;gap:4px">'+pill("dp:"+i.id,"Duplicate")+pill("cp:"+i.id,"Copy to\u2026")+pill("mv:"+i.id,"Move to\u2026")+'</div>';
});
L.hook("act",function(k,api){
  var p=k.split(":"), id=p.slice(1).join(":");
  if(p[0]==="dp"){ var n=dupe(id); if(n) kit.say("Duplicated"); api.paint(); return true; }
  if(p[0]==="cp"||p[0]==="mv"){ pick={mode:p[0],ids:[id]}; api.paint(); return true; }
  if(k==="cps"||k==="mvs"){ pick={mode:k==="cps"?"cp":"mv",ids:L.bulk.ids()}; api.paint(); return true; }
  if(k==="pc"){ pick=null; api.paint(); return true; }
  if(p[0]==="pt"&&pick){
    var tgt=id;
    if(tgt==="*new"){ var nm=window.prompt("New library name","Library "+(L.all().libs.length+1)); if(nm===null||!nm.trim()) return true; var S=L.all(), nl={id:L.nid("lib"),name:nm.trim().slice(0,60),items:[]}; S.libs.push(nl); tgt=nl.id; }
    var name=(L.all().libs.filter(function(l){ return l.id===tgt; })[0]||{}).name, mode=pick.mode, n2=transfer(pick.ids,mode,tgt);
    pick=null; if(L.bulk) L.bulk.clear();
    kit.say(n2?(mode==="mv"?"Moved ":"Copied ")+n2+" item"+(n2>1?"s":"")+" to \u201c"+name+"\u201d":"Nothing to do"); api.paint(); return true;
  }
  return false;
});
L.xfer={dupe:dupe,transfer:transfer};
})();

try{ window.AMIYO_EDITOR_BUILD="vs-lib-step09-xfer"; }catch(e){}

;
/* ==================== Script 533 id="amiyo-lib-step10-trash" ==================== */
/* Libraries step 10: Recently deleted.
   Deleting an item (or a whole library) no longer loses it: it moves to "Recently deleted" for 30 days. Open that list to restore items
   to the library they came from (the library is re-created if it was deleted too), delete them for good, or empty the list. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__trash) return; L.__trash=true;
var open=false, DAYS=30;
function btn(k,t,x){ return '<button type="button" data-k="'+k+'" style="min-height:32px;padding:0 10px;'+(x||"")+'">'+t+'</button>'; }
function list(){ var S=L.all(); S.trash=S.trash||[]; var now=Date.now(), keep=S.trash.filter(function(t){ return t&&t.item&&now-t.at<DAYS*864e5; }); if(keep.length!==S.trash.length){ S.trash=keep; L.save(); } return S.trash; }
function ago(t){ var m=Math.floor((Date.now()-t)/6e4); if(m<1) return "just now"; if(m<60) return m+" min ago"; var h=Math.floor(m/60); if(h<24) return h+" h ago"; var d=Math.floor(h/24); return d+" day"+(d>1?"s":"")+" ago"; }
function restore(id){
  var S=L.all(), T=list(), ix=-1; T.forEach(function(t,i){ if(t.item.id===id) ix=i; }); if(ix<0) return null; var t=T[ix];
  var lib=S.libs.filter(function(l){ return l.id===t.lib; })[0]||S.libs.filter(function(l){ return l.name===t.libName; })[0];
  if(!lib){ lib={id:t.lib||L.nid("lib"),name:t.libName||"Restored",items:[]}; S.libs.push(lib); }
  lib.items.unshift(t.item); T.splice(ix,1); L.set(S); return lib;
}
L.hook("tools",function(){
  var T=list(); if(!T.length) { open=false; return ""; }
  var h='<div style="margin-top:8px">'+btn("trv","\ud83d\uddd1 Recently deleted ("+T.length+")",open?"border-color:#ffb454;color:#ffb454":"")+'</div>';
  if(open){
    h+='<div style="margin-top:6px;border:1px solid #302c26;border-radius:10px;padding:8px;display:flex;flex-direction:column;gap:6px"><span class="note">Kept for '+DAYS+' days, then removed for good.</span>'+
      T.slice(0,40).map(function(t){ var d=(L.types()[t.item.type]||{}); return '<div style="display:flex;gap:6px;align-items:center"><div style="min-width:0;flex:1"><b style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+kit.esc(t.item.name)+'</b><span class="note">'+kit.esc(d.label||t.item.type)+" \u00b7 "+kit.esc(t.libName||"")+" \u00b7 "+ago(t.at)+'</span></div>'+btn("trr:"+t.item.id,"Restore")+btn("trx:"+t.item.id,"\u2715")+'</div>'; }).join("")+(T.length>40?'<span class="note">+ '+(T.length-40)+' older items</span>':"")+btn("tre","Empty recently deleted")+'</div>';
  }
  return h;
});
L.hook("act",function(k,api){
  var p=k.split(":"), id=p.slice(1).join(":");
  if(k==="trv"){ open=!open; api.paint(); return true; }
  if(p[0]==="trr"){ var lib=restore(id); if(lib) kit.say("Restored to \u201c"+lib.name+"\u201d"); api.paint(); return true; }
  if(p[0]==="trx"){ var S=L.all(); S.trash=(S.trash||[]).filter(function(t){ return t.item.id!==id; }); L.save(); api.paint(); return true; }
  if(k==="tre"){ Promise.resolve(window.amiyoOk?window.amiyoOk("Permanently delete everything in Recently deleted? This cannot be undone.",{okLabel:"Empty",danger:true}):true).then(function(y){ if(!y) return; L.all().trash=[]; L.save(); open=false; api.paint(); }); return true; }
  return false;
});
L.trash={list:list,restore:restore};
})();

try{ window.AMIYO_EDITOR_BUILD="vs-lib-step10-trash"; }catch(e){}

;
/* ==================== Script 534 id="amiyo-lib-step11-io" ==================== */
/* Libraries step 11: Export and import.
   "Export library" saves the open library as a .vslib file, "Export all" saves every library in one file. "Import\u2026" reads a .vslib file
   (or the same JSON), adds its libraries (a library with the same name is merged), and skips items you already have. Use it to back up,
   move to another device, or share a brand kit with a teammate. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__io) return; L.__io=true;
var MAXB=25*1024*1024, MAXI=5000;
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function key(i){ return i.type+"|"+JSON.stringify(i.data); }
function btn(k,t){ return '<button type="button" data-k="'+k+'" style="min-height:34px;padding:0 12px">'+t+'</button>'; }
function pack(libs){ return {format:"vslib",version:1,app:"Amiyo Editor",exported:new Date().toISOString(),libs:libs.map(function(l){ return {name:l.name,items:l.items.map(function(i){ var c=clone(i); delete c.id; delete c.last; return c; })}; })}; }
function exportData(all){ var S=L.all(); return pack(all?S.libs:[L.lib()]); }
function download(name,obj){
  var blob=new Blob([JSON.stringify(obj)],{type:"application/json"}), a=document.createElement("a");
  a.href=URL.createObjectURL(blob); a.download=name; a.style.display="none"; document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },1500);
}
function importData(o){
  if(!o||o.format!=="vslib"||!Array.isArray(o.libs)) throw new Error("This is not a library file");
  var S=L.all(), T=L.types(), added=0, dup=0, bad=0, libsMade=0, total=0;
  o.libs.forEach(function(src){ if(!src||!Array.isArray(src.items)) return;
    var nm=String(src.name||"Imported").slice(0,60), lib=S.libs.filter(function(l){ return l.name===nm; })[0];
    if(!lib){ lib={id:L.nid("lib"),name:nm,items:[]}; S.libs.push(lib); libsMade++; }
    var have={}; lib.items.forEach(function(i){ have[key(i)]=1; });
    src.items.forEach(function(i){ total++; if(total>MAXI){ bad++; return; }
      if(!i||typeof i.type!=="string"||!T[i.type]||i.data==null||typeof i.data!=="object"){ bad++; return; }
      var c={id:L.nid("it"),type:i.type,name:String(i.name||"Untitled").slice(0,60),data:clone(i.data),tags:L.tags?L.tags.norm(i.tags||[]):[],fav:!!i.fav,uses:0,at:Date.now()};
      if(i.extra&&typeof i.extra==="object") c.extra=clone(i.extra);
      var k=key(c); if(have[k]){ dup++; return; } have[k]=1; lib.items.push(c); added++; });
  });
  L.set(S); return {added:added,dup:dup,bad:bad,libs:libsMade};
}
function pickFile(done){
  var f=document.createElement("input"); f.type="file"; f.accept=".vslib,.json,application/json"; f.style.cssText="position:fixed;left:-99px;top:0;opacity:0"; document.body.appendChild(f);
  f.addEventListener("change",function(){ var file=f.files&&f.files[0]; f.remove(); if(!file) return;
    if(file.size>MAXB){ kit.say("That file is too large (over 25 MB)",4000); return; }
    var r=new FileReader(); r.onerror=function(){ kit.say("Could not read that file",4000); };
    r.onload=function(){ try{ done(JSON.parse(String(r.result))); }catch(e){ kit.say("Import failed: "+(e&&e.message||"not a valid library file"),4500); } };
    r.readAsText(file); });
  f.click();
}
L.hook("tools",function(){ return '<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;align-items:center"><span class="note">Backup</span>'+btn("xo","\u2913 Export library")+btn("xa","Export all")+btn("xi","\u2912 Import\u2026")+'</div>'; });
L.hook("act",function(k,api){
  if(k==="xo"||k==="xa"){ var all=k==="xa", o=exportData(all), n=o.libs.reduce(function(s,l){ return s+l.items.length; },0);
    if(!n){ kit.say("Nothing to export yet"); return true; }
    download((all?"video-studio-libraries":String(L.lib().name).replace(/[^\w\- ]+/g,"").trim().replace(/\s+/g,"-")||"library")+".vslib",o); kit.say("Exported "+n+" item"+(n>1?"s":"")); return true; }
  if(k==="xi"){ pickFile(function(o){ var r=importData(o); kit.say(r.added+" imported"+(r.dup?" \u00b7 "+r.dup+" already there":"")+(r.bad?" \u00b7 "+r.bad+" skipped":""),4500); api.paint(); }); return true; }
  return false;
});
L.io={exportData:exportData,importData:importData};
})();

try{ window.AMIYO_EDITOR_BUILD="vs-lib-step11-io"; }catch(e){}

;
/* ==================== Script 535 id="amiyo-lib-step12-motion" ==================== */
/* Libraries step 12: Motion presets.
   "+ Motion" saves the movement of the selected clip: its keyframes (position, size, opacity, rotation), the in / out / loop animation
   from the Animations panel, and its pose. Key times are stored as a share of the clip length, so a preset made on a 3 s clip also fits a 10 s clip.
   Apply copies it to every selected picture, video, text or adjustment clip. One undo step. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__motion) return; L.__motion=true;
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function targets(){ return kit.sel().filter(function(x){ return x.track.kind!=="audio"&&x.track.kind!=="caption"; }); }
function pose(c){ return {x:c.x==null?.5:c.x,y:c.y==null?.5:c.y,scale:c.scale||1,opacity:c.opacity==null?1:c.opacity,rotation:c.rotation||0}; }
function isDefault(p){ return p.x===.5&&p.y===.5&&p.scale===1&&p.opacity===1&&p.rotation===0; }
var NAMES={in:"In",out:"Out",loop:"Loop"};
L.type("motion",{label:"Motion",icon:"\u27a4",
  preview:function(i){ var d=i.data, bits=[]; if(d.anim){ if(d.anim.in) bits.push("In "+d.anim.in); if(d.anim.out) bits.push("Out "+d.anim.out); if(d.anim.loop&&d.anim.loop!=="none") bits.push(d.anim.loop); } if(d.kf&&d.kf.length) bits.push(d.kf.length+" key"+(d.kf.length>1?"s":"")); if(!bits.length) bits.push("Pose");
    return '<span style="min-width:54px;max-width:110px;height:38px;border-radius:9px;flex:none;background:linear-gradient(135deg,#3b2114,#2a1d3b);display:flex;align-items:center;justify-content:center;padding:0 6px;font:700 10px system-ui;color:#ffd4bf;text-align:center;overflow:hidden">'+kit.esc(bits.slice(0,2).join(" \u00b7 "))+'</span>'; },
  capture:function(){
    var T=targets(); if(!T.length){ kit.say("Select a clip first"); return null; }
    var c=T[0].clip, dur=Math.max(.1,c.duration||1), kf=[];
    (c.keyframes||[]).forEach(function(k){ if(k.auto) return; var n=clone(k); n.f=Math.max(0,Math.min(1,(k.t||0)/dur)); delete n.t; kf.push(n); });
    var anim=c.anim&&(c.anim.in||c.anim.out||(c.anim.loop&&c.anim.loop!=="none"))?clone(c.anim):null, p=pose(c);
    if(!kf.length&&!anim&&isDefault(p)){ kit.say("That clip has no movement or position changes to save"); return null; }
    var nm=anim?[anim.in&&("In "+anim.in),anim.out&&("Out "+anim.out),anim.loop&&anim.loop!=="none"&&anim.loop].filter(Boolean).join(" + "):(kf.length?kf.length+"-key motion":"Pose");
    return {name:nm.slice(0,30),data:{kf:kf,anim:anim,pose:p}};
  },
  apply:function(it){
    var T=targets(); if(!T.length){ kit.say("Select one or more clips first"); return false; }
    var d=it.data;
    kit.edit("Apply motion",function(){ T.forEach(function(x){ var c=x.clip, dur=Math.max(.1,c.duration||1);
      Object.keys(d.pose||{}).forEach(function(k){ if(k==="rotation"&&c.kind==="text"&&!d.pose[k]) return; c[k]=d.pose[k]; });
      var keys=(d.kf||[]).map(function(k){ var n=clone(k), f=n.f; delete n.f; n.t=Math.round(f*dur*1000)/1000; return n; });
      c.anim=d.anim?clone(d.anim):null;
      if(c.anim&&window.AMIYO_ANIMATE&&window.AMIYO_ANIMATE.build){ try{ keys=keys.concat(window.AMIYO_ANIMATE.build(c)); }catch(e){} }
      keys.sort(function(a,b){ return a.t-b.t; }); c.keyframes=keys; });
    });
    return "Motion applied to "+T.length+" clip"+(T.length>1?"s":"");
  }});
})();

try{ window.AMIYO_EDITOR_BUILD="vs-lib-step12-motion"; }catch(e){}

;
/* ==================== Script 536 id="amiyo-lib-step13-transitions" ==================== */
/* Libraries step 13: Transition presets.
   "+ Transition" saves the fade-in / transition-in and the fade-out / transition-out of the selected clip (type, length and any extra settings).
   Apply sets them on every selected picture, video or text clip. A transition is never longer than half of its clip. One undo step. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__trans) return; L.__trans=true;
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function targets(){ return kit.sel().filter(function(x){ return x.track.kind!=="audio"&&x.track.kind!=="caption"; }); }
function ok(t){ return t&&typeof t==="object"&&t.name; }
function secs(t){ return (Math.round((t.duration||0)*100)/100)+"s"; }
L.type("transition",{label:"Transition",icon:"\u25d0",
  preview:function(i){ var d=i.data, a=[]; if(d.in) a.push("\u2192 "+d.in.name+" "+secs(d.in)); if(d.out) a.push(d.out.name+" "+secs(d.out)+" \u2192");
    return '<span style="min-width:64px;max-width:130px;height:38px;border-radius:9px;flex:none;background:linear-gradient(90deg,#1c1410,#3b2a14 50%,#1c1410);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 6px;font:700 9.5px system-ui;color:#ffd9a0;text-align:center;line-height:1.25;overflow:hidden">'+a.map(kit.esc).join("<br>")+'</span>'; },
  capture:function(){
    var T=targets(); if(!T.length){ kit.say("Select a clip first"); return null; }
    var c=T[0].clip, d={}; if(ok(c.transitionIn)) d.in=clone(c.transitionIn); if(ok(c.transitionOut)) d.out=clone(c.transitionOut);
    if(!d.in&&!d.out){ kit.say("That clip has no transition or fade to save"); return null; }
    var nm=[d.in&&(d.in.name+" in"),d.out&&(d.out.name+" out")].filter(Boolean).join(" + ");
    return {name:nm.charAt(0).toUpperCase()+nm.slice(1),data:d};
  },
  apply:function(it){
    var T=targets(); if(!T.length){ kit.say("Select one or more clips first"); return false; }
    var d=it.data;
    kit.edit("Apply transition",function(){ T.forEach(function(x){ var c=x.clip, cap=Math.max(.05,(c.duration||1)/2);
      if(d.in){ c.transitionIn=clone(d.in); c.transitionIn.duration=Math.min(cap,d.in.duration||.5); }
      if(d.out){ c.transitionOut=clone(d.out); c.transitionOut.duration=Math.min(cap,d.out.duration||.5); } }); });
    return "Transition applied to "+T.length+" clip"+(T.length>1?"s":"");
  }});
})();

try{ window.AMIYO_EDITOR_BUILD="vs-lib-step13-transitions"; }catch(e){}

;
/* ==================== Script 537 id="amiyo-lib-step14-sound" ==================== */
/* Libraries step 14: Audio presets.
   "+ Sound" saves the sound settings of the selected clip: volume, fade in / out and fade shape, voice enhance, equalizer, de-esser,
   clean-up, room effect, the sound category and volume keyframes (key times are stored as a share of the clip length).
   Apply replaces the sound settings of every selected clip that has sound. Picture, text and trim are not touched. One undo step. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__sound) return; L.__sound=true;
var KEYS=["fadeIn","fadeOut","fadeShape","voiceFx","eqFx","deessFx","cleanFx","roomFx","soundCategory"];
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function targets(){ return kit.sel().filter(function(x){ return !x.clip.textStyle&&x.track.kind!=="caption"&&x.clip.kind!=="adjustment"; }); }
function has(v){ return v!=null&&v!==""&&v!==false&&!(Array.isArray(v)&&!v.length)&&!(v&&typeof v==="object"&&!Array.isArray(v)&&!Object.keys(v).length); }
L.type("sound",{label:"Sound",icon:"\u266a",
  preview:function(i){ var d=i.data, b=[]; b.push("Vol "+Math.round((d.volume==null?1:d.volume)*100)+"%"); if(d.fadeIn>0||d.fadeOut>0) b.push("Fade"); if(d.eqFx) b.push("EQ"); if(d.voiceFx) b.push("Voice"); if(d.cleanFx) b.push("Clean"); if(d.roomFx) b.push("Room"); if(d.vk&&d.vk.length) b.push("Keys");
    return '<span style="min-width:54px;max-width:120px;height:38px;border-radius:9px;flex:none;background:linear-gradient(135deg,#14301f,#2b1c14);display:flex;align-items:center;justify-content:center;padding:0 6px;font:700 10px system-ui;color:#b8f0cf;text-align:center;overflow:hidden">'+kit.esc(b.slice(0,3).join(" \u00b7 "))+'</span>'; },
  capture:function(){
    var T=targets(); if(!T.length){ kit.say("Select a clip with sound first"); return null; }
    var c=T[0].clip, d={volume:c.volume==null?1:c.volume}, n=0, dur=Math.max(.1,c.duration||1);
    KEYS.forEach(function(k){ if(has(c[k])&&!((k==="fadeIn"||k==="fadeOut")&&!(c[k]>0))){ d[k]=clone(c[k]); n++; } });
    if(c.volumeKeyframes&&c.volumeKeyframes.length){ d.vk=c.volumeKeyframes.map(function(k){ return {f:Math.max(0,Math.min(1,(k.t||0)/dur)),v:k.v}; }); n++; }
    if(d.volume!==1) n++;
    if(!n){ kit.say("That clip has no sound settings to save (volume, fades, effects)"); return null; }
    var cat=d.soundCategory?String(d.soundCategory):"", nm=(cat?cat.charAt(0).toUpperCase()+cat.slice(1)+" ":"Sound ")+Math.round(d.volume*100)+"%";
    return {name:nm,data:d};
  },
  apply:function(it){
    var T=targets(); if(!T.length){ kit.say("Select one or more clips with sound first"); return false; }
    var d=it.data;
    kit.edit("Apply sound preset",function(){ T.forEach(function(x){ var c=x.clip, dur=Math.max(.1,c.duration||1), cap=dur/2;
      KEYS.forEach(function(k){ delete c[k]; if(d[k]!=null) c[k]=clone(d[k]); });
      if(c.fadeIn>cap) c.fadeIn=cap; if(c.fadeOut>cap) c.fadeOut=cap;
      c.volume=d.volume==null?1:d.volume;
      if(d.vk&&d.vk.length) c.volumeKeyframes=d.vk.map(function(k){ return {t:Math.round(k.f*dur*1000)/1000,v:k.v}; }); else delete c.volumeKeyframes; }); });
    return "Sound applied to "+T.length+" clip"+(T.length>1?"s":"");
  }});
})();

try{ window.AMIYO_EDITOR_BUILD="vs-lib-step14-sound"; }catch(e){}

;
/* ==================== Script 538 id="amiyo-lib-step15-capstyle" ==================== */
/* Libraries step 15: Caption styles.
   "+ Caption style" saves the look of the selected caption clip: font, size, colours, outline, shadow, the caption style preset and its
   effect, position and opacity. Apply restyles every selected caption; with no caption selected it restyles all captions in the project.
   Words and timing are never touched. One undo step. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__cap) return; L.__cap=true;
var KEYS=["textStyle","capStyle","capFx","x","y","opacity"];
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function isCap(x){ return x.clip.kind==="caption"||x.track.kind==="caption"; }
function lum(h){ var m=/^#([0-9a-f]{6})$/i.exec(h||""); if(!m) return .5; var n=parseInt(m[1],16); return (0.299*(n>>16)+0.587*((n>>8)&255)+0.114*(n&255))/255; }
L.type("capstyle",{label:"Caption style",icon:"CC",
  preview:function(i){ var s=i.data.textStyle||{}, c=s.color||"#fff";
    return '<span style="width:64px;height:38px;border-radius:9px;flex:none;background:'+(lum(c)>.7?"#1b1915":"#d9d4c8")+';display:flex;align-items:center;justify-content:center;overflow:hidden;font-family:'+String(s.fontFamily||"system-ui").replace(/[<>"]/g,"")+';font-weight:'+(s.weight||700)+';font-size:13px;color:'+c+';'+(s.shadow?"text-shadow:1px 1px 2px rgba(0,0,0,.7);":"")+'">Caption</span>'; },
  capture:function(){
    var C=kit.sel().filter(isCap); if(!C.length){ kit.say("Select a caption clip first"); return null; }
    var c=C[0].clip, d={}; KEYS.forEach(function(k){ if(c[k]!=null) d[k]=clone(c[k]); });
    if(!d.textStyle||!Object.keys(d.textStyle).length){ kit.say("That caption has no style to save yet"); return null; }
    var s=d.textStyle, nm=(d.capStyle?String(d.capStyle).replace(/[-_]/g," "):String(s.fontFamily||"Caption").split(",")[0].replace(/["']/g,""))+" "+(s.fontSize||"");
    return {name:nm.trim().slice(0,30),data:d};
  },
  apply:function(it){
    var C=kit.sel().filter(isCap), all=false;
    if(!C.length){ C=kit.all().filter(isCap); all=true; }
    if(!C.length){ kit.say("There are no captions in this project"); return false; }
    var d=it.data;
    kit.edit("Apply caption style",function(){ C.forEach(function(x){ var c=x.clip; KEYS.forEach(function(k){ if(k==="textStyle") c.textStyle=Object.assign({},c.textStyle,clone(d.textStyle)); else if(d[k]!=null) c[k]=clone(d[k]); else if(k==="capStyle"||k==="capFx") delete c[k]; }); }); });
    return "Style applied to "+(all?"all ":"")+C.length+" caption"+(C.length>1?"s":"");
  }});
})();

try{ window.AMIYO_EDITOR_BUILD="vs-lib-step15-capstyle"; }catch(e){}

;
/* ==================== Script 539 id="amiyo-lib-step16-media" ==================== */
/* Libraries step 16: Media items.
   "+ Media" saves the picture, video or sound behind each selected clip into the library. The file itself is kept once in the Media Library
   (your all-projects store); the library item is a small card with its thumbnail. Apply puts the file on the timeline at the playhead,
   in any project. If the file was removed from the Media Library the card says so. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__media) return; L.__media=true;
function M(){ return window.amiyoMediaLib; }
function dur(s){ s=Math.max(0,Math.round(+s||0)); var m=Math.floor(s/60),x=s%60; return m+":"+(x<10?"0":"")+x; }
L.type("media",{label:"Media",icon:"\ud83c\udf9e",
  preview:function(i){ var m=M()&&M().byId(i.data.mid), ic={video:"\ud83c\udf9e",image:"\ud83d\uddbc",audio:"\ud83c\udfb5"}[i.data.kind]||"\ud83d\udcc4";
    if(m&&m.thumb) return '<span style="width:64px;height:38px;border-radius:9px;flex:none;overflow:hidden;position:relative;background:#000"><img src="'+m.thumb+'" alt="" style="width:100%;height:100%;object-fit:cover">'+(i.data.dur?'<span style="position:absolute;right:3px;bottom:2px;font:600 9px system-ui;color:#fff;background:rgba(0,0,0,.7);padding:1px 4px;border-radius:4px">'+dur(i.data.dur)+'</span>':"")+'</span>';
    return '<span style="width:64px;height:38px;border-radius:9px;flex:none;background:#1b1915;display:flex;align-items:center;justify-content:center;font-size:18px;'+(m?"":"opacity:.5")+'">'+ic+(m?"":'<small style="font-size:9px;color:#ffb454;margin-left:3px">missing</small>')+'</span>'; },
  capture:function(){
    if(!M()){ kit.say("The Media Library is not available"); return null; }
    var sel=kit.sel().filter(function(x){ return x.clip.assetId&&project.assets[x.clip.assetId]&&!/^demo\d+$/.test(x.clip.assetId); });
    if(!sel.length){ kit.say("Select a clip that uses your own video, picture or sound first"); return null; }
    var seen={}, ids=[]; sel.forEach(function(x){ if(!seen[x.clip.assetId]){ seen[x.clip.assetId]=1; ids.push(x.clip.assetId); } });
    (async function(){ var n=0, dup=0, miss=0;
      for(var k=0;k<ids.length;k++){ var a=project.assets[ids[k]];
        try{ await M().register(ids[k],{quiet:true}); }catch(e){}
        var mid=a&&a.libId; if(!mid||!M().byId(mid)){ miss++; continue; }
        if(L.lib().items.some(function(i){ return i.type==="media"&&i.data.mid===mid; })){ dup++; continue; }
        var m=M().byId(mid); L.add("media",m.name||a.name||"Media",{mid:mid,kind:m.type,dur:m.duration||0,w:m.width||0,h:m.height||0,size:m.size||0}); n++; }
      kit.say(n?n+" media item"+(n>1?"s":"")+" saved":(dup?"Already in this library":"Could not store that file")); L.paint(); })();
    return null;
  },
  apply:function(it){
    var m=M()&&M().byId(it.data.mid); if(!m){ kit.say("This file is no longer in your Media Library"); return false; }
    M().use([it.data.mid],{timeline:true}).then(function(n){ if(n) kit.say("Added to the timeline"); });
    return "";
  }});
})();

try{ window.AMIYO_EDITOR_BUILD="vs-lib-step16-media"; }catch(e){}

;
/* ==================== Script 540 id="amiyo-lib-step17-snippets" ==================== */
/* Libraries step 17: Clip snippets.
   "+ Snippet" saves every selected clip (any track: video, picture, sound, text, captions) with its settings, track lane and
   timing relative to the first clip. Pictures, videos and sounds are kept in the Media Library so the snippet works in any project.
   Apply drops the whole group at the playhead on matching tracks, keeping links between clips. One undo step. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__snip) return; L.__snip=true;
var DROP=["id","selected","groupId","linkId","linked","sharedLook"];
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function M(){ return window.amiyoMediaLib; }
function demo(id){ return /^demo\d+$/.test(String(id)); }
function lane(t){ return project.tracks.filter(function(x){ return x.kind===t.kind; }).indexOf(t); }
function trackFor(kind,ln){ var T=project.tracks.filter(function(t){ return t.kind===kind; });
  if(!T.length){ var t={id:uid("track"),name:kind.charAt(0).toUpperCase()+kind.slice(1),kind:kind,locked:false,hidden:false,muted:false,clips:[]}; project.tracks.push(t); return t; }
  return T[Math.min(ln||0,T.length-1)]; }
L.type("snippet",{label:"Snippet",icon:"\u29c9",
  preview:function(i){ var d=i.data, kinds={}; d.clips.forEach(function(c){ kinds[c.trackKind]=1; });
    return '<span style="min-width:54px;max-width:130px;height:38px;border-radius:9px;flex:none;background:linear-gradient(135deg,#2b1d3b,#3b2114);display:flex;align-items:center;justify-content:center;padding:0 6px;font:700 10px system-ui;color:#e3cfff;text-align:center;overflow:hidden">'+d.clips.length+" clip"+(d.clips.length>1?"s":"")+" \u00b7 "+(Math.round(d.duration*10)/10)+"s</span>"; },
  capture:function(){
    var S=kit.sel(); if(!S.length){ kit.say("Select one or more clips first"); return null; }
    (async function(){
      var t0=Math.min.apply(null,S.map(function(x){ return x.clip.start; })), clips=[], skipped=0, regd={};
      for(var k=0;k<S.length;k++){ var x=S[k], c=clone(x.clip); DROP.forEach(function(p){ delete c[p]; });
        c.offset=Math.max(0,x.clip.start-t0); delete c.start; c.trackKind=x.track.kind||"video"; c.lane=Math.max(0,lane(x.track));
        var aid=x.clip.assetId;
        if(aid&&!demo(aid)){ var a=project.assets[aid];
          if(!M()||!a){ skipped++; continue; }
          if(!regd[aid]){ try{ await M().register(aid,{quiet:true}); }catch(e){} regd[aid]=1; }
          if(!a.libId||!M().byId(a.libId)){ skipped++; continue; }
          c.mid=a.libId; delete c.assetId; }
        if(x.clip.link||x.clip.linkId) c.lk=String(x.clip.linkId||x.clip.link);
        if(x.clip.groupId) c.gk=String(x.clip.groupId);
        clips.push(c); }
      if(!clips.length){ kit.say("None of those clips could be saved"); return; }
      var first=String(clips[0].text||clips[0].name||"Snippet").replace(/\s+/g," ").slice(0,22), dur=Math.max.apply(null,clips.map(function(c){ return c.offset+(c.duration||0); }));
      L.add("snippet",first+(clips.length>1?" +"+(clips.length-1):""),{clips:clips,duration:dur});
      kit.say("Snippet saved"+(skipped?" ("+skipped+" clip"+(skipped>1?"s":"")+" skipped: file not stored)":"")); L.paint();
    })();
    return null;
  },
  apply:function(it){
    var d=it.data, at=typeof currentTime==="number"?currentTime:0;
    (async function(){
      var mids={}; d.clips.forEach(function(c){ if(c.mid) mids[c.mid]=1; });
      var map={}, miss=0;
      for(var mid in mids){ if(!M()||!M().byId(mid)){ miss++; continue; } await M().use([mid],{timeline:false}); var a=Object.values(project.assets).filter(function(x){ return x.libId===mid; })[0]; if(a) map[mid]=a.id; else miss++; }
      var made=[], lm={}, gm={}, n=0;
      kit.edit("Add snippet from library",function(){
        d.clips.forEach(function(src){
          if(src.mid&&!map[src.mid]) return;
          var c=clone(src); c.id=uid("clip"); c.start=at+(c.offset||0); if(src.mid) c.assetId=map[src.mid];
          var kind=c.trackKind, ln=c.lane; ["offset","trackKind","lane","mid","lk","gk"].forEach(function(p){ delete c[p]; });
          if(src.lk){ lm[src.lk]=lm[src.lk]||uid("link"); c.linkId=lm[src.lk]; }
          if(src.gk){ gm[src.gk]=gm[src.gk]||uid("group"); c.groupId=gm[src.gk]; }
          var tr=trackFor(kind,ln); tr.clips.push(c); tr.clips.sort(function(a,b){ return a.start-b.start; }); made.push({c:c,t:tr}); n++; });
        try{ clearMultiSelection(); }catch(e){}
        if(made.length){ made.forEach(function(m){ m.c.selected=true; }); selectedClipId=made[0].c.id; selectedTrackId=made[0].t.id; }
      });
      kit.say(n?"Snippet added at the playhead"+(miss?" ("+miss+" file"+(miss>1?"s":"")+" missing)":""):"The files for this snippet are no longer stored");
    })();
    return "";
  }});
})();

try{ window.AMIYO_EDITOR_BUILD="vs-lib-step17-snippets"; }catch(e){}

;
/* ==================== Script 541 id="amiyo-lib-step18-graphics" ==================== */
/* Libraries step 18: Shapes and graphics.
   "+ Graphic" saves the selected shape, sticker or lower-third graphic clips (a whole group of them keeps its layout and relative timing)
   with their colours, outline, size, position and animation. Apply drops a fresh copy at the playhead and selects it. One undo step. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__graphic) return; L.__graphic=true;
var DROP=["id","selected","groupId","linkId","linked","sharedLook"];
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function picked(){ return kit.sel().filter(function(x){ return x.clip.kind==="graphic"; }); }
function lane(t){ return Math.max(0,project.tracks.filter(function(x){ return x.kind===t.kind; }).indexOf(t)); }
function trackFor(kind,ln){ var T=project.tracks.filter(function(t){ return t.kind===kind; });
  if(!T.length){ var t={id:uid("track"),name:kind.charAt(0).toUpperCase()+kind.slice(1),kind:kind,locked:false,hidden:false,muted:false,clips:[]}; project.tracks.push(t); return t; }
  return T[Math.min(ln||0,T.length-1)]; }
function glyph(c){ try{ var d=getDef(c.shape); return d&&d.glyph?d.glyph:""; }catch(e){ return ""; } }
L.type("graphic",{label:"Graphic",icon:"\u25c6",
  preview:function(i){ var c=i.data.clips[0]||{}, s=c.graphicStyle||{}, col=s.fill||s.color||"#ffb454", g=glyph(c);
    return '<span style="width:44px;height:38px;border-radius:9px;flex:none;background:#1b1915;display:flex;align-items:center;justify-content:center;font-size:20px;color:'+(/^#[0-9a-f]{3,8}$/i.test(col)?col:"#ffb454")+'">'+(g?kit.esc(g):"\u25c6")+'</span>'; },
  capture:function(){
    var P=picked(); if(!P.length){ kit.say("Select a shape, sticker or graphic clip first"); return null; }
    var t0=Math.min.apply(null,P.map(function(x){ return x.clip.start; }));
    var clips=P.map(function(x){ var c=clone(x.clip); DROP.forEach(function(k){ delete c[k]; }); c.offset=Math.max(0,x.clip.start-t0); delete c.start; c.trackKind=x.track.kind; c.lane=lane(x.track); return c; });
    var nm=String(clips[0].name||clips[0].shape||"Graphic").slice(0,24);
    return {name:nm+(clips.length>1?" +"+(clips.length-1):""),data:{clips:clips,duration:Math.max.apply(null,clips.map(function(c){ return c.offset+(c.duration||0); }))}};
  },
  apply:function(it){
    var made=[], at=typeof currentTime==="number"?currentTime:0;
    kit.edit("Add graphic from library",function(){
      it.data.clips.forEach(function(src){ var c=clone(src); c.id=uid("clip"); c.start=at+(c.offset||0); var kind=c.trackKind||"video", ln=c.lane; ["offset","trackKind","lane"].forEach(function(k){ delete c[k]; });
        var tr=trackFor(kind,ln); tr.clips.push(c); tr.clips.sort(function(a,b){ return a.start-b.start; }); made.push({c:c,t:tr}); });
      try{ clearMultiSelection(); }catch(e){}
      made.forEach(function(m){ m.c.selected=true; }); selectedClipId=made[0].c.id; selectedTrackId=made[0].t.id;
    });
    return "Graphic added at the playhead";
  }});
})();

try{ window.AMIYO_EDITOR_BUILD="vs-lib-step18-graphics"; }catch(e){}

;
/* ==================== Script 542 id="amiyo-lib-step19-paging" ==================== */
/* Libraries step 19: Paged lists (speed). The panel now draws 60 items at a time with a "Show more" button, so a library with
   hundreds of items opens instantly on a phone. Search, filters, sort and select-all still work on the whole library. */
try{ window.AMIYO_EDITOR_BUILD="vs-lib-step19-paging"; }catch(e){}

;
/* ==================== Script 543 id="amiyo-lib-step20-sync" ==================== */
/* Libraries step 20: Two-tab sync and safe saving.
   Libraries are shared by every project, so two editor tabs (or a PWA window plus a tab) used to overwrite each other: the tab that saved last
   won and the other tab's new items were lost. Now every change pings the other tabs, which merge the saved copy into theirs (items added
   anywhere are kept, edits from the tab that just saved win, deleted items stay deleted). Changes are also flushed the moment the page is
   hidden or closed, so a quick swipe away from the browser no longer loses the last edit. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__sync) return; L.__sync=true;
var DEF="My Library", TAB=L.nid("tab"), remote=false, bc=null, sendT=0, pullT=0, lastLocal=0, applied=0, stats={merged:0,pings:0};
try{ bc=new BroadcastChannel("amiyo_vslib_sync"); }catch(e){}
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function ping(){ var m={tab:TAB,at:Date.now()}; stats.pings++; try{ if(bc) bc.postMessage(m); }catch(e){} try{ localStorage.setItem("amiyo_vslib_ping",JSON.stringify(m)); }catch(e){} }
function readStore(){
  return new Promise(function(res){
    var ls=function(){ try{ return JSON.parse(localStorage.getItem("amiyo_vslib")||"null"); }catch(e){ return null; } };
    try{ if(window.amiyoLibStore){ window.amiyoLibStore.get().then(function(v){ res(v||ls()); },function(){ res(ls()); }); return; } }catch(e){}
    res(ls());
  });
}
/* merge the other tab's saved copy (r) into this tab's state (S); returns true when this tab holds items the other copy lacks */
function mergeInto(S,r){
  var gone={}, localOnly=false;
  S.trash=S.trash||[]; (r.trash||[]).forEach(function(t){ if(t&&t.item&&t.item.id&&!S.trash.some(function(x){ return x&&x.item&&x.item.id===t.item.id; })) S.trash.push(clone(t)); });
  S.trash.sort(function(a,b){ return (b.at||0)-(a.at||0); }); if(S.trash.length>300) S.trash.length=300;
  S.trash.forEach(function(t){ if(t&&t.item) gone[t.item.id]=1; });
  r.libs.forEach(function(rl){
    if(!rl||!rl.id||!Array.isArray(rl.items)) return;
    var ll=S.libs.filter(function(l){ return l.id===rl.id; })[0], byId=!!ll;
    if(!ll&&rl.name===DEF) ll=S.libs.filter(function(l){ return l.name===DEF; })[0];
    if(!ll){ ll={id:rl.id,name:rl.name,items:[]}; S.libs.push(ll); }
    if(byId) ll.name=rl.name||ll.name;
    if(Array.isArray(rl.folders)){ ll.folders=ll.folders||[]; rl.folders.forEach(function(f){ if(ll.folders.indexOf(f)<0) ll.folders.push(f); }); }
    rl.items.forEach(function(ri){
      if(!ri||!ri.id||gone[ri.id]) return;
      var k=-1; ll.items.forEach(function(x,n){ if(x.id===ri.id) k=n; });
      if(k>=0){ if(JSON.stringify(ll.items[k])!==JSON.stringify(ri)) ll.items[k]=clone(ri); } else ll.items.push(clone(ri));
    });
  });
  S.libs.forEach(function(l){
    l.items=l.items.filter(function(i){ return !gone[i.id]; });
    var rl=r.libs.filter(function(x){ return x.id===l.id; })[0]||(l.name===DEF?r.libs.filter(function(x){ return x.name===DEF; })[0]:null);
    if(!rl) { if(l.items.length) localOnly=true; return; }
    l.items.forEach(function(i){ if(!rl.items.some(function(x){ return x.id===i.id; })) localOnly=true; });
    var order={}; rl.items.forEach(function(x,n){ order[x.id]=n; });
    l.items.sort(function(a,b){ return (order[a.id]==null?-1:order[a.id])-(order[b.id]==null?-1:order[b.id]); });
  });
  return localOnly;
}
function pull(){
  readStore().then(function(r){
    if(!r||!Array.isArray(r.libs)||!L.ready()) return;
    var S=L.all(), before=JSON.stringify(S), only=mergeInto(S,r);
    if(JSON.stringify(S)===before) return;
    stats.merged++; remote=true; try{ L.set(S); }finally{ remote=false; }
    if(only){ clearTimeout(sendT); sendT=setTimeout(ping,500); }
  });
}
function onRemote(m){ if(!m||m.tab===TAB||!(m.at>applied)) return; applied=m.at; clearTimeout(pullT); pullT=setTimeout(pull,300); }
if(bc) bc.onmessage=function(e){ onRemote(e.data); };
window.addEventListener("storage",function(e){ if(e.key==="amiyo_vslib_ping"&&e.newValue){ try{ onRemote(JSON.parse(e.newValue)); }catch(x){} } });
L.onChange(function(){ if(remote) return; lastLocal=Date.now(); clearTimeout(sendT); sendT=setTimeout(ping,500); });
function flush(){
  if(Date.now()-lastLocal>2000||!L.ready()) return;
  try{ if(window.amiyoLibStore) window.amiyoLibStore.put(L.all()); }catch(e){}
  try{ if(!L.storage||L.storage().kind!=="browser") localStorage.setItem("amiyo_vslib",JSON.stringify(L.all())); }catch(e){}
  ping();
}
window.addEventListener("pagehide",flush);
document.addEventListener("visibilitychange",function(){ if(document.visibilityState==="hidden") flush(); });
L.sync={stats:function(){ return {merged:stats.merged,pings:stats.pings,tab:TAB}; },pull:pull,merge:mergeInto};
try{ window.AMIYO_EDITOR_BUILD="vs-lib-step20-sync"; }catch(e){}
})();

;
/* ==================== Script 544 id="amiyo-lib-step21-storage" ==================== */
/* Libraries step 21: Safe storage.
   Libraries were kept only in the browser's small localStorage (about 5 MB, and a full store silently dropped saves). They now live in their own
   browser database (IndexedDB) with no practical size limit; old libraries are moved over automatically the first time. The panel shows where
   your libraries are saved, how big they are and when they were last saved, asks the browser to keep the data permanently, and warns in orange
   when saving fails. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__store) return; L.__store=true;
var est=null, perm=null, estAt=0;
function kb(n){ return n<1024?n+" B":n<1048576?Math.round(n/102.4)/10+" KB":Math.round(n/104857.6)/10+" MB"; }
function ago(t){ if(!t) return "not yet this visit"; var s=Math.round((Date.now()-t)/1000); return s<5?"just now":s<60?s+" s ago":Math.round(s/60)+" min ago"; }
function refresh(){
  try{ if(navigator.storage&&navigator.storage.estimate) navigator.storage.estimate().then(function(e){ est=e; estAt=Date.now(); L.paint(); }); }catch(e){}
  try{ if(navigator.storage&&navigator.storage.persisted) navigator.storage.persisted().then(function(p){ perm=p; }); }catch(e){}
}
function ask(){ try{ if(navigator.storage&&navigator.storage.persist) navigator.storage.persist().then(function(p){ perm=p; kit.say(p?"Libraries are now kept permanently":"The browser did not grant permanent storage"); L.paint(); }); }catch(e){} }
function size(){ try{ return JSON.stringify(L.all()).length; }catch(e){ return 0; } }
L.hook("tools",function(){
  var s=L.storage(), bad=s.kind==="memory"||!!s.err, name={browser:"browser database",local:"browser storage (small)",memory:"memory only"}[s.kind]||s.kind;
  if(!est||Date.now()-estAt>60000) refresh();
  var q=est&&est.quota?" · "+kb(est.quota-est.usage)+" free on this device":"";
  return '<div style="margin-top:8px;border:1px solid '+(bad?"#ffb454":"#302c26")+';border-radius:10px;padding:7px 9px;display:flex;flex-direction:column;gap:5px">'+
    '<div class="note" style="'+(bad?"color:#ffb454":"")+'">'+(bad?"\u26a0 ":"\ud83d\udcbe ")+'Saved in '+name+' · '+kb(size())+' · '+ago(s.at)+q+(s.err?' · '+kit.esc(s.err):"")+'</div>'+
    (perm===false?'<button type="button" data-k="stp" style="min-height:30px;font-size:11px">Keep my libraries permanently</button>':"")+'</div>';
});
L.hook("act",function(k){ if(k==="stp"){ ask(); return true; } return false; });
window.addEventListener("amiyolibsave",function(){ try{ if(document.getElementById("akLib").style.display==="flex") L.paint(); }catch(e){} });
L.onChange(function(){});
setTimeout(function(){ refresh(); },1500);
try{ window.AMIYO_EDITOR_BUILD="vs-lib-step21-storage"; }catch(e){}
})();

;
/* ==================== Script 545 id="amiyo-lib-step22-cleanup" ==================== */
/* Libraries step 22: Storage clean-up.
   "Clean up storage" opens a size report for all your libraries: how much each item type takes, the 8 heaviest items (with a Delete button
   each), and how much the Recently deleted list is holding (with a one-tap "Free it"). Use it before a big import or when the storage line
   shows orange. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__clean) return; L.__clean=true;
var open=false;
function kb(n){ return n<1024?n+" B":n<1048576?Math.round(n/102.4)/10+" KB":Math.round(n/104857.6)/10+" MB"; }
function sz(o){ try{ return JSON.stringify(o).length; }catch(e){ return 0; } }
function report(){
  var S=L.all(), types=L.types(), rows=[], byType={}, total=0;
  S.libs.forEach(function(l){ l.items.forEach(function(i){ var n=sz(i); total+=n; rows.push({id:i.id,name:i.name,type:i.type,lib:l.name,n:n}); byType[i.type]=(byType[i.type]||0)+n; }); });
  var trashN=sz(S.trash||[]); total+=trashN;
  rows.sort(function(a,b){ return b.n-a.n; });
  return {rows:rows,byType:byType,trash:trashN,trashCount:(S.trash||[]).length,total:total,types:types};
}
function bar(p,col){ return '<div style="height:6px;border-radius:3px;background:#26231e;overflow:hidden"><div style="height:100%;width:'+Math.max(2,Math.round(p*100))+'%;background:'+(col||"#ffb454")+'"></div></div>'; }
L.hook("tools",function(){
  var b='<button type="button" data-k="cl" style="min-height:34px;margin-top:8px;'+(open?"border-color:#ffb454;color:#ffb454":"")+'">\ud83e\uddf9 Clean up storage</button>';
  if(!open) return b;
  var r=report(), max=r.rows.length?r.rows[0].n:1, h=b+'<div style="border:1px solid #302c26;border-radius:10px;padding:8px;display:flex;flex-direction:column;gap:7px;margin-top:6px">';
  h+='<div class="note">Total '+kb(r.total)+' in '+r.rows.length+' items</div>';
  Object.keys(r.byType).sort(function(a,b){ return r.byType[b]-r.byType[a]; }).forEach(function(t){
    h+='<div><div class="note" style="display:flex;justify-content:space-between"><span>'+kit.esc((r.types[t]&&r.types[t].label)||t)+'</span><span>'+kb(r.byType[t])+'</span></div>'+bar(r.byType[t]/Math.max(1,r.total))+'</div>';
  });
  if(r.trashCount) h+='<div><div class="note" style="display:flex;justify-content:space-between"><span>Recently deleted ('+r.trashCount+')</span><span>'+kb(r.trash)+'</span></div>'+bar(r.trash/Math.max(1,r.total),"#fb7185")+'<button type="button" data-k="clt" style="min-height:32px;margin-top:5px;font-size:11px">Free the Recently deleted list</button></div>';
  if(r.rows.length){ h+='<h5>Heaviest items</h5>'; r.rows.slice(0,8).forEach(function(x){
    h+='<div style="display:grid;grid-template-columns:1fr auto auto;gap:6px;align-items:center"><div style="min-width:0"><b style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px">'+kit.esc(x.name)+'</b><span class="note">'+kit.esc(x.lib)+' \u00b7 '+kit.esc((r.types[x.type]&&r.types[x.type].label)||x.type)+'</span></div><span class="note">'+kb(x.n)+'</span><button type="button" data-k="cld:'+x.id+'" aria-label="Delete" style="min-height:32px;min-width:38px">\u2715</button></div>'+bar(x.n/max,"#f29262");
  }); }
  return h+'</div>';
});
L.hook("act",function(k,api){
  if(k==="cl"){ open=!open; api.paint(); return true; }
  if(k==="clt"){ Promise.resolve(window.amiyoOk?window.amiyoOk("Permanently delete everything in Recently deleted? This cannot be undone.",{okLabel:"Free it",danger:true}):true).then(function(y){ if(!y) return; var S=L.all(), n=(S.trash||[]).length; S.trash=[]; L.save(); kit.say(n+" item"+(n===1?"":"s")+" removed for good"); api.paint(); }); return true; }
  if(k.indexOf("cld:")===0){ var it=L.find(k.slice(4)); if(!it) return true; Promise.resolve(window.amiyoOk?window.amiyoOk("Delete \u201c"+it.name+"\u201d from the library?",{okLabel:"Delete",danger:true}):true).then(function(y){ if(!y) return; L.remove(it.id); kit.say("Deleted. You can restore it from Recently deleted"); api.paint(); }); return true; }
  return false;
});
L.cleanup={report:report};
try{ window.AMIYO_EDITOR_BUILD="vs-lib-step22-cleanup"; }catch(e){}
})();

;
/* ==================== Script 546 id="amiyo-lib-step23-undo" ==================== */
/* Libraries step 23: Undo and redo for library changes.
   Anything you change in Libraries (add, rename, tag, favourite, move, delete, import...) can now be undone from the "Undo" button at the top of the list,
   and redone with "Redo". Quick bursts of changes (for example a bulk tag) count as one step. Keeps the last 20 steps while the page is open. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__undo) return; L.__undo=true;
var U=[], R=[], last=null, lastN=0, lastAt=0, internal=false, MAXS=20, MAXC=24e6;
function cnt(S){ var n=0; S.libs.forEach(function(l){ n+=l.items.length; }); return n; }
function snap(){ try{ return JSON.stringify(L.all()); }catch(e){ return null; } }
function trim(a){ var tot=0; for(var i=a.length-1;i>=0;i--){ tot+=a[i].s.length; if(tot>MAXC||a.length-i>MAXS){ a.splice(0,i+1); break; } } }
function label(n0,n1){ return n1>n0?"added "+(n1-n0)+" item"+(n1-n0>1?"s":""):n1<n0?"deleted "+(n0-n1)+" item"+(n0-n1>1?"s":""):"edit"; }
function init(){ if(last==null&&L.ready()){ last=snap(); lastN=cnt(L.all()); } }
L.onChange(function(){
  if(internal) return; init(); if(last==null) return;
  var now=snap(); if(now==null||now===last) return;
  var n1=cnt(L.all()), t=Date.now();
  if(U.length&&t-lastAt<700){ /* same burst: keep the oldest snapshot, update the label */ U[U.length-1].l=label(U[U.length-1].n,n1); }
  else { U.push({s:last,n:lastN,l:label(lastN,n1)}); trim(U); }
  R=[]; last=now; lastN=n1; lastAt=t;
  try{ if(document.getElementById("akLib").style.display==="flex") clearTimeout(L.__ut),L.__ut=setTimeout(L.paint,150); }catch(e){}
});
function swap(from,to,verb){
  var e=from.pop(); if(!e) return; var cur=snap(), n=cnt(L.all());
  to.push({s:cur,n:n,l:e.l}); trim(to);
  var S; try{ S=JSON.parse(e.s); }catch(x){ kit.say("Could not "+verb); return; }
  internal=true; try{ L.set(S); } finally{ internal=false; }
  last=e.s; lastN=cnt(S); lastAt=0; kit.say(verb[0].toUpperCase()+verb.slice(1)+": "+e.l); L.paint();
}
L.hook("tools",function(){
  init(); if(!U.length&&!R.length) return "";
  var b=function(k,t,on){ return '<button type="button" data-k="'+k+'" '+(on?"":"disabled ")+'style="min-height:34px;padding:0 12px;'+(on?"":"opacity:.4")+'">'+t+'</button>'; };
  return '<div style="display:flex;gap:6px;margin-top:8px">'+b("ud","\u21b6 Undo"+(U.length?" "+U[U.length-1].l:""),U.length)+b("rd","\u21b7 Redo",R.length)+'</div>';
});
L.hook("act",function(k){
  if(k==="ud"){ swap(U,R,"undo"); return true; }
  if(k==="rd"){ swap(R,U,"redo"); return true; }
  return false;
});
var _set=L.set; L.set=function(s){ var was=internal; try{ _set(s); } finally{ if(!was){ last=null; U=[]; R=[]; init(); } } };
L.history={undo:function(){ swap(U,R,"undo"); },redo:function(){ swap(R,U,"redo"); },depth:function(){ return {undo:U.length,redo:R.length}; }};
try{ window.AMIYO_EDITOR_BUILD="vs-lib-step23-undo"; }catch(e){}
})();

;
/* ==================== Script 547 id="amiyo-lib-step24-folders" ==================== */
/* Libraries step 24: Folders.
   Group the items of a library into folders (like the folders of the Premiere Pro Libraries panel). "＋ Folder" makes one, the chips above the list switch between
   All, Unfiled and each folder, and every item has a "Folder" button to move it (type a new name to make a new folder, leave it empty to unfile it).
   In Select mode a "Move to folder" button moves everything you picked. Items you save while a folder is open go into that folder. Deleting a folder only unfiles its items. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__folders) return; L.__folders=true;
var cur="", curLib="", PILL="min-height:30px;padding:0 10px;border-radius:99px;font-size:11px;";
function clean(n){ return String(n==null?"":n).trim().replace(/\s+/g," ").slice(0,30); }
function names(l){ l=l||L.lib(); var o=(l.folders||[]).slice(); l.items.forEach(function(i){ if(i.folder&&o.indexOf(i.folder)<0) o.push(i.folder); }); return o.sort(function(a,b){ return a.localeCompare(b,undefined,{numeric:true,sensitivity:"base"}); }); }
function sync(){ var l=L.lib(); if(l.id!==curLib){ curLib=l.id; cur=""; } if(cur&&cur!=="*none"&&names(l).indexOf(cur)<0) cur=""; return l; }
function ensure(l,n){ l.folders=l.folders||[]; if(l.folders.indexOf(n)<0) l.folders.push(n); }
function moveTo(ids,n){ n=clean(n); var l=L.lib(); if(n) ensure(l,n); ids.forEach(function(id){ var it=L.find(id); if(!it) return; L.update(id,{folder:n||undefined}); }); if(!n||true) L.save(); }
L.hook("filter",function(i){ if(!cur) return true; if(cur==="*none") return !i.folder; return i.folder===cur; });
L.hook("tools",function(){
  var l=sync(), fs=names(l), un=l.items.filter(function(i){ return !i.folder; }).length;
  var chip=function(k,t,on){ return '<button type="button" data-k="'+k+'" style="'+PILL+(on?"border-color:#ffb454;color:#ffb454":"")+'">'+t+'</button>'; };
  var h='<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;align-items:center"><span class="note">Folders</span>'+chip("fo:","All",!cur);
  if(fs.length){ h+=chip("fo:*none","Unfiled "+un,cur==="*none"); fs.forEach(function(f){ var n=l.items.filter(function(i){ return i.folder===f; }).length; h+=chip("fo:"+kit.esc(f),"\ud83d\udcc1 "+kit.esc(f)+" "+n,cur===f); }); }
  h+=chip("fn","\uff0b Folder",false)+'</div>';
  if(cur&&cur!=="*none") h+='<div style="display:flex;gap:6px;margin-top:6px">'+chip("fr","Rename folder",false)+chip("fd","Delete folder",false)+'</div>';
  if(L.bulk&&L.bulk.active()&&L.bulk.ids().length) h+='<div style="margin-top:6px">'+chip("fb","\ud83d\udcc1 Move "+L.bulk.ids().length+" to folder\u2026",false)+'</div>';
  return h;
});
L.hook("card",function(i){ return '<button type="button" data-k="fm:'+i.id+'" style="min-height:30px;font-size:11px;text-align:left">\ud83d\udcc1 '+(i.folder?kit.esc(i.folder):"No folder")+' \u00b7 change</button>'; });
function pick(def){ var l=L.lib(), v=window.prompt("Folder name (empty = no folder)\nExisting: "+(names(l).join(", ")||"none yet"),def||""); return v===null?null:clean(v); }
L.hook("act",function(k,api){
  if(k.indexOf("fo:")===0){ cur=k.slice(3); api.paint(); return true; }
  if(k==="fn"){ var v=window.prompt("New folder name",""); if(v===null) return true; v=clean(v); if(!v) return true; ensure(L.lib(),v); L.save(); cur=v; api.paint(); return true; }
  if(k==="fr"){ var o=cur, v2=window.prompt("Rename folder",o); if(v2===null) return true; v2=clean(v2); if(!v2||v2===o) return true; var l=L.lib(); l.folders=(l.folders||[]).filter(function(x){ return x!==o; }); ensure(l,v2); l.items.forEach(function(i){ if(i.folder===o) i.folder=v2; }); cur=v2; L.save(); L.update(l.items[0]?l.items[0].id:"",{}); api.paint(); return true; }
  if(k==="fd"){ var o2=cur, l2=L.lib(), n=l2.items.filter(function(i){ return i.folder===o2; }).length;
    Promise.resolve(window.amiyoOk?window.amiyoOk("Delete the folder \u201c"+o2+"\u201d? Its "+n+" item"+(n===1?"":"s")+" stay in the library, unfiled.",{okLabel:"Delete folder",danger:true}):true).then(function(y){ if(!y) return; l2.folders=(l2.folders||[]).filter(function(x){ return x!==o2; }); l2.items.forEach(function(i){ if(i.folder===o2) delete i.folder; }); cur=""; L.save(); L.update(l2.items[0]?l2.items[0].id:"",{}); api.paint(); }); return true; }
  if(k.indexOf("fm:")===0){ var it=L.find(k.slice(3)); if(!it) return true; var n3=pick(it.folder||""); if(n3===null) return true; moveTo([it.id],n3); api.paint(); return true; }
  if(k==="fb"){ var ids=L.bulk.ids(); if(!ids.length) return true; var n4=pick(""); if(n4===null) return true; moveTo(ids,n4); kit.say(ids.length+" item"+(ids.length>1?"s":"")+(n4?" moved to \u201c"+n4+"\u201d":" unfiled")); api.paint(); return true; }
  return false;
});
/* items saved while a folder is open land in that folder */
var known=null, skip=false;
function seen(){ known={}; L.all().libs.forEach(function(l){ l.items.forEach(function(i){ known[i.id]=1; }); }); }
L.onChange(function(){
  if(!L.ready()||skip) return; if(!known){ seen(); return; }
  var l=L.lib(), ch=false;
  if(cur&&cur!=="*none") l.items.forEach(function(i){ if(!known[i.id]&&i.folder==null){ i.folder=cur; ch=true; } });
  if(ch){ ensure(l,cur); L.save(); }
  seen();
});
var _set=L.set; L.set=function(s){ skip=true; try{ _set(s); } finally{ skip=false; seen(); } };
L.folders={names:names,current:function(){ return cur; },move:moveTo};
try{ window.AMIYO_EDITOR_BUILD="vs-lib-step24-folders"; }catch(e){}
})();

;
/* ==================== Script 548 id="amiyo-lib-step25-notes" ==================== */
/* Libraries step 25: Notes and details.
   Every item can carry a note (up to 300 characters: where it is used, a licence, a reminder). The note shows under the item and is found by search
   (search also finds folder names now). "Details" opens a small info block on the card: type, folder, when it was saved, when it was last used,
   how many times, and its size. */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__notes) return; L.__notes=true;
var open={};
function kb(n){ return n<1024?n+" B":Math.round(n/102.4)/10+" KB"; }
function when(t){ if(!t) return "never"; var d=new Date(t); return d.toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"})+" "+d.toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"}); }
function row(a,b){ return '<div style="display:flex;justify-content:space-between;gap:8px"><span class="note">'+a+'</span><span style="font-size:11px;text-align:right">'+b+'</span></div>'; }
L.hook("card",function(i){
  var t=L.types()[i.type]||{}, h="";
  if(i.note) h+='<div class="note" style="white-space:pre-wrap;word-break:break-word;color:#c9c2b3">\ud83d\udcdd '+kit.esc(i.note)+'</div>';
  h+='<div style="display:flex;gap:6px"><button type="button" data-k="nt:'+i.id+'" style="flex:1;min-height:30px;font-size:11px">'+(i.note?"Edit note":"\uff0b Note")+'</button><button type="button" data-k="dt:'+i.id+'" aria-expanded="'+!!open[i.id]+'" style="flex:1;min-height:30px;font-size:11px">'+(open[i.id]?"Hide details":"Details")+'</button></div>';
  if(open[i.id]){
    var sz=0; try{ sz=JSON.stringify(i).length; }catch(e){}
    h+='<div style="border-top:1px solid #26231e;padding-top:5px;display:flex;flex-direction:column;gap:3px">'+row("Type",kit.esc(t.label||i.type))+row("Folder",i.folder?kit.esc(i.folder):"None")+row("Saved",when(i.at))+row("Last used",when(i.last))+row("Used",(i.uses||0)+" time"+(i.uses===1?"":"s"))+row("Size",kb(sz))+(i.tags&&i.tags.length?row("Tags",kit.esc(i.tags.join(", "))):"")+'</div>';
  }
  return h;
});
L.hook("act",function(k,api){
  if(k.indexOf("nt:")===0){ var it=L.find(k.slice(3)); if(!it) return true; var v=window.prompt("Note for \u201c"+it.name+"\u201d (empty removes it)",it.note||""); if(v===null) return true; v=String(v).trim().slice(0,300); L.update(it.id,{note:v||undefined}); if(!v){ delete it.note; L.save(); } api.paint(); return true; }
  if(k.indexOf("dt:")===0){ var id=k.slice(3); open[id]=!open[id]; api.paint(); return true; }
  return false;
});
try{ window.AMIYO_EDITOR_BUILD="vs-lib-step25-notes"; }catch(e){}
})();

;
/* ==================== Script 549 id="amiyo-lib-step26-order" ==================== */
/* Libraries step 26: Pin and your own order.
   "Pin" keeps an item at the top of its list whatever the sort. A new sort option, "My order", lets you arrange items yourself: every item gets
   \u25b2 / \u25bc / Top buttons that move it past the next item that is shown (works with search and folder filters too). */
(function(){
"use strict";
var kit=window.amiyoKit, L=window.amiyoLib; if(!kit||!L||L.__order) return; L.__order=true;
function sorted(){ return L.lib().items.slice().sort(function(a,b){ return (a.ord==null?-1:a.ord)-(b.ord==null?-1:b.ord)||(b.at||0)-(a.at||0); }); }
function number(){ sorted().forEach(function(i,n){ i.ord=n; }); }
function swap(id,dir){
  var vis=L.visible().filter(function(x){ var it=L.find(x); return it&&!!it.pin===!!L.find(id).pin; }), n=vis.indexOf(id), m=n+dir;
  if(n<0||m<0||m>=vis.length) return;
  number(); var a=L.find(vis[n]), b=L.find(vis[m]), t=a.ord; a.ord=b.ord; b.ord=t; L.save(); L.update(a.id,{});
}
function top(id){ number(); var it=L.find(id), min=Math.min.apply(null,L.lib().items.map(function(i){ return i.ord; })); it.ord=min-1; L.save(); L.update(id,{}); }
L.hook("card",function(i){
  var h='<button type="button" data-k="pn:'+i.id+'" aria-pressed="'+!!i.pin+'" style="min-height:30px;font-size:11px;'+(i.pin?"border-color:#ffb454;color:#ffb454":"")+'">\ud83d\udccc '+(i.pin?"Pinned":"Pin")+'</button>';
  if(L.ui.sort==="manual") return '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px">'+h+'<button type="button" data-k="mu:'+i.id+'" aria-label="Move up" style="min-height:30px">\u25b2</button><button type="button" data-k="md:'+i.id+'" aria-label="Move down" style="min-height:30px">\u25bc</button><button type="button" data-k="mt:'+i.id+'" style="min-height:30px;font-size:11px">Top</button></div>';
  return h;
});
L.hook("act",function(k,api){
  if(k.indexOf("pn:")===0){ var it=L.find(k.slice(3)); if(it){ L.update(it.id,{pin:it.pin?undefined:true}); if(!it.pin){ delete it.pin; L.save(); } api.paint(); } return true; }
  if(k.indexOf("mu:")===0){ swap(k.slice(3),-1); api.paint(); return true; }
  if(k.indexOf("md:")===0){ swap(k.slice(3),1); api.paint(); return true; }
  if(k.indexOf("mt:")===0){ top(k.slice(3)); api.paint(); return true; }
  return false;
});
try{ window.AMIYO_EDITOR_BUILD="vs-lib-step26-order"; }catch(e){}
})();
