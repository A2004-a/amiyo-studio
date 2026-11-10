/* Amiyo Studio - 11-screen-touch.js */
/* Responsive layouts, mobile touch and screen optimizations */
/* Scripts 1600 to 1678 */


;
/* ==================== Script 1600 id="amiyo-sl2-s30" ==================== */
/* Studio Lab 2, step 10 (30): GRID MARKERS (beat-grid style, DaVinci Resolve / After Effects).
   Drop a marker every N seconds across the whole timeline, or only inside the range if one is set. Handy for a metronome-style edit, chapter slots, or cutting to a regular beat.
   Give a label prefix (markers become "Beat 1", "Beat 2", ...) and pick a colour. Markers that already exist at the same time are not doubled. At most 500 at once. One undo step. */
(function(){"use strict";
var SL=window.AMIYO_SL; if(!SL||SL.gridMarkers) return;
function $(i){return document.getElementById(i)}
var v={every:2,label:"Beat",color:"#4da3ff",inRange:false};
function newId(){ try{ return uid("marker"); }catch(e){ return "mk"+Math.random().toString(36).slice(2,9); } }
function gridMarkers(every,label,color,useRange){ every=+every; if(!(every>=0.1)){ SL.say("Use an interval of at least 0.1 seconds"); return 0; }
  var a=0,b=0; try{ b=getProjectDuration(); }catch(e){} if(useRange&&SL.range&&SL.range.a!=null&&SL.range.b!=null){ a=SL.range.a; b=SL.range.b; } if(b-a<every){ SL.say("There is no room for a marker at that interval"); return 0; }
  var made=0; SL.H("Grid markers",function(){ project.markers=project.markers||[]; var have=project.markers.map(function(m){return m.time}), i=0;
    for(var t=a;t<=b+0.001&&made<500;t+=every){ i++; if(have.some(function(h){return Math.abs(h-t)<0.01})) continue; project.markers.push({id:newId(),time:Math.round(t*1000)/1000,label:(label||"Beat")+" "+i,color:color||"#4da3ff"}); made++; } });
  SL.say(made?("Added "+made+" marker"+(made>1?"s":"")):"Those spots already have markers"); return made; }
function render(){ var hasR=SL.range&&SL.range.a!=null&&SL.range.b!=null;
  return '<div style="display:grid;grid-template-columns:1fr 1fr auto;gap:6px;align-items:end;margin-bottom:6px"><label style="font-size:11px">Every (s)<input id="slGe" type="number" min="0.1" step="0.1" value="'+v.every+'" style="width:100%"></label><label style="font-size:11px">Label<input id="slGl" type="text" maxlength="20" value="'+SL.esc(v.label)+'" style="width:100%"></label><input id="slGc" type="color" value="'+v.color+'" style="width:34px;height:34px;padding:0"></div>'
   +'<label style="display:flex;gap:6px;align-items:center;font-size:12px;margin-bottom:6px"><input type="checkbox" id="slGr"'+(v.inRange?" checked":"")+(hasR?"":" disabled")+'> Only inside the range'+(hasR?"":" (set one first)")+'</label><button class="toolbtn slbtn" type="button" id="slGg" style="width:100%">Add markers</button>'; }
function wire(){ var e=$("slGe"),l=$("slGl"),c=$("slGc"),r=$("slGr"),g=$("slGg");
  if(g) g.onclick=function(){ v.every=parseFloat(e.value)||v.every; v.label=l.value; v.color=c.value; v.inRange=!!(r&&r.checked); gridMarkers(v.every,v.label,v.color,v.inRange); SL.repaint(); }; }
SL.addSection("grid","Grid markers",render,wire,109);
SL.gridMarkers=gridMarkers; SL.step=30;
try{ window.AMIYO_EDITOR_BUILD="studio2-step10-grid-markers"; }catch(e){}
})();

;
/* ==================== Script 1601 id="amiyo-sl2-s31" ==================== */
/* Studio Lab 2, step 11 (31): MARKER CLEAN-UP. Remove markers you do not need, safely: all markers inside the range, all of one colour, duplicates (same time and same label), or every marker already ticked done in Marker review.
   Each button shows how many markers it would remove, and asks before deleting. One undo step. */
(function(){"use strict";
var SL=window.AMIYO_SL; if(!SL||SL.cleanMarkers) return;
function $(i){return document.getElementById(i)}
var colour="";
function marks(){ try{ return project.markers||[]; }catch(e){ return []; } }
function pickSet(kind,col){ var m=marks(), r=SL.range||{};
  if(kind==="range") return (r.a!=null&&r.b!=null)?m.filter(function(x){return x.time>=r.a-0.001&&x.time<=r.b+0.001}):[];
  if(kind==="color") return col?m.filter(function(x){return (x.color||"")===col}):[];
  if(kind==="done") return m.filter(function(x){return x.done});
  if(kind==="dupes"){ var seen={}, out=[]; m.slice().sort(function(a,b){return a.time-b.time}).forEach(function(x){ var k=Math.round(x.time*20)+"|"+(x.label||""); if(seen[k]) out.push(x); else seen[k]=1; }); return out; } return []; }
function cleanMarkers(kind,col,skipConfirm){ var set=pickSet(kind,col); if(!set.length){ SL.say("No markers to remove"); return 0; }
  var ok=true; if(!skipConfirm){ try{ ok=window.confirm("Remove "+set.length+" marker"+(set.length>1?"s":"")+"? Ctrl+Z undoes it."); }catch(e){} } if(!ok) return 0;
  var ids={}; set.forEach(function(x){ ids[x.id]=1; }); SL.H("Clean markers",function(){ project.markers=(project.markers||[]).filter(function(x){return !ids[x.id]}); }); SL.say("Removed "+set.length+" marker"+(set.length>1?"s":"")); SL.repaint(); return set.length; }
function render(){ var m=marks(); if(!m.length) return '<div class="note" style="opacity:.75;font-size:12px">No markers in the project.</div>';
  var cols=[]; m.forEach(function(x){ var c=x.color||""; if(c&&cols.indexOf(c)<0) cols.push(c); }); if(colour&&cols.indexOf(colour)<0) colour=""; if(!colour&&cols.length) colour=cols[0];
  function b(id,t,n){ return '<button class="toolbtn slbtn" type="button" id="'+id+'"'+(n?"":" disabled")+'>'+t+' ('+n+')</button>'; }
  return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">'+b("slKr","Inside range",pickSet("range").length)+b("slKd","Duplicates",pickSet("dupes").length)+b("slKn","Marked done",pickSet("done").length)+'</div>'
   +(cols.length?'<div style="display:grid;grid-template-columns:1fr auto;gap:6px;margin-top:6px"><select id="slKc">'+cols.map(function(c){return '<option value="'+SL.esc(c)+'"'+(c===colour?" selected":"")+'>'+SL.esc(c)+'</option>'}).join("")+'</select>'+b("slKk","Remove colour",pickSet("color",colour).length)+'</div>':''); }
function wire(){ function w(id,fn){ var e=$(id); if(e) e.onclick=fn; } w("slKr",function(){cleanMarkers("range")}); w("slKd",function(){cleanMarkers("dupes")}); w("slKn",function(){cleanMarkers("done")}); w("slKk",function(){cleanMarkers("color",colour)});
  var c=$("slKc"); if(c) c.onchange=function(){ colour=c.value; SL.paintOne("mclean"); }; }
SL.addSection("mclean","Marker clean-up",render,wire,110);
SL.cleanMarkers=cleanMarkers; SL.markerSet=pickSet; SL.step=31;
try{ window.AMIYO_EDITOR_BUILD="studio2-step11-marker-cleanup"; }catch(e){}
})();

;
/* ==================== Script 1602 id="amiyo-sl2-s32" ==================== */
/* Studio Lab 2, step 12 (32): REPEAT SELECTION (After Effects loop / Final Cut "duplicate").
   Select clips, choose how many extra copies (1 to 20) and an optional gap, press Repeat. The copies are laid right after the selection, one after another, with their keyframes.
   "Close up the timeline" first slides everything after the selection (on all unlocked tracks, and the markers) out of the way so nothing is overwritten. One undo step. */
(function(){"use strict";
var SL=window.AMIYO_SL; if(!SL||SL.repeatSelection) return;
function $(i){return document.getElementById(i)}
var v={n:1,gap:0,ripple:true};
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function newId(){ try{ return uid("clip"); }catch(e){ return "clip_"+Math.random().toString(36).slice(2,10); } }
function repeatSelection(n,gap,ripple){ n=Math.max(1,Math.min(20,parseInt(n,10)||1)); gap=Math.max(0,+gap||0);
  var l=SL.sel().filter(function(x){return !x.track.locked}); if(!l.length){ SL.say("Select one or more clips first"); return 0; }
  var a=Math.min.apply(null,l.map(function(x){return x.clip.start})), b=Math.max.apply(null,l.map(function(x){return x.clip.start+x.clip.duration})), span=b-a, step=span+gap, shift=step*n, made=0;
  SL.H("Repeat selection",function(){
    if(ripple){ SL.tracks().forEach(function(t){ if(t.locked) return; (t.clips||[]).forEach(function(c){ if(c.start>=b-0.001&&!l.some(function(x){return x.clip===c})) c.start+=shift; }); }); try{ (project.markers||[]).forEach(function(m){ if(m.time>=b-0.001) m.time+=shift; }); }catch(e){} }
    l.forEach(function(x){ for(var i=1;i<=n;i++){ var c=clone(x.clip); c.id=newId(); c.selected=false; c.start=x.clip.start+step*i; x.track.clips.push(c); made++; } });
    SL.tracks().forEach(function(t){ (t.clips||[]).sort(function(p,q){return p.start-q.start}); }); });
  SL.say("Added "+made+" cop"+(made===1?"y":"ies")); return made; }
function render(){ return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px"><label style="font-size:11px">Extra copies<input id="slPn" type="number" min="1" max="20" step="1" value="'+v.n+'" style="width:100%"></label><label style="font-size:11px">Gap (s)<input id="slPg" type="number" min="0" step="0.1" value="'+v.gap+'" style="width:100%"></label></div><label style="display:flex;gap:6px;align-items:center;font-size:12px;margin-bottom:6px"><input type="checkbox" id="slPr"'+(v.ripple?" checked":"")+'> Close up the timeline (ripple)</label><button class="toolbtn slbtn" type="button" id="slPgo" style="width:100%">Repeat selection</button>'; }
function wire(){ var n=$("slPn"),g=$("slPg"),r=$("slPr"),b=$("slPgo"); if(b) b.onclick=function(){ v.n=parseInt(n.value,10)||1; v.gap=parseFloat(g.value)||0; v.ripple=!!r.checked; repeatSelection(v.n,v.gap,v.ripple); SL.repaint(); }; }
SL.addSection("repeat","Repeat selection",render,wire,111);
SL.repeatSelection=repeatSelection; SL.step=32;
try{ window.AMIYO_EDITOR_BUILD="studio2-step12-repeat"; }catch(e){}
})();

;
/* ==================== Script 1603 id="amiyo-sl2-s33" ==================== */
/* Studio Lab 2, step 13 (33): TRACK CONTROL (DaVinci Resolve track header buttons, Final Cut roles on/off).
   One list of all tracks with Hide, Mute and Lock tick boxes, plus quick buttons: "Solo" a track (hides or mutes every other track of its kind), "Show and unmute all", "Lock all" and "Unlock all".
   One undo step per change. */
(function(){"use strict";
var SL=window.AMIYO_SL; if(!SL||SL.soloTrack) return;
function $(i){return document.getElementById(i)}
function setFlag(id,flag,val){ var t=SL.tracks().filter(function(x){return x.id===id})[0]; if(!t) return false; SL.H("Track "+flag,function(){ t[flag]=!!val; }); return true; }
function soloTrack(id){ var tr=SL.tracks(), t=tr.filter(function(x){return x.id===id})[0]; if(!t) return false; var audio=(t.kind||"video")==="audio";
  SL.H("Solo track",function(){ tr.forEach(function(o){ var oa=(o.kind||"video")==="audio"; if(oa!==audio) return; if(oa) o.muted=(o!==t); else o.hidden=(o!==t); }); if(audio) t.muted=false; else t.hidden=false; });
  SL.say("Solo: "+t.name); return true; }
function allSet(flag,val){ var tr=SL.tracks(); if(!tr.length) return 0; SL.H("Tracks "+flag,function(){ tr.forEach(function(t){ t[flag]=!!val; }); }); return tr.length; }
function showAll(){ var tr=SL.tracks(); SL.H("Show and unmute all",function(){ tr.forEach(function(t){ t.hidden=false; t.muted=false; }); }); SL.say("All tracks shown and unmuted"); return tr.length; }
function render(){ var tr=SL.tracks(); if(!tr.length) return '<div class="note" style="opacity:.75;font-size:12px">No tracks.</div>';
  var h='<div style="display:grid;grid-template-columns:1fr repeat(3,42px) 52px;gap:4px 6px;align-items:center;font-size:11px"><span></span><span style="text-align:center;opacity:.65">Hide</span><span style="text-align:center;opacity:.65">Mute</span><span style="text-align:center;opacity:.65">Lock</span><span></span>';
  tr.forEach(function(t){ function cb(f){ return '<span style="text-align:center"><input type="checkbox" data-tf="'+f+'" data-tid="'+SL.esc(t.id)+'"'+(t[f]?" checked":"")+'></span>'; }
    h+='<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+SL.esc(t.name)+' <small style="opacity:.55">'+(t.kind||"video")+'</small></span>'+cb("hidden")+cb("muted")+cb("locked")+'<button class="toolbtn slbtn" type="button" data-solo="'+SL.esc(t.id)+'">Solo</button>'; });
  return h+'</div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:8px"><button class="toolbtn slbtn" type="button" id="slTsa">Show all</button><button class="toolbtn slbtn" type="button" id="slTla">Lock all</button><button class="toolbtn slbtn" type="button" id="slTua">Unlock all</button></div>'; }
function wire(){ Array.prototype.forEach.call(document.querySelectorAll("[data-tf]"),function(e){ e.onchange=function(){ setFlag(e.getAttribute("data-tid"),e.getAttribute("data-tf"),e.checked); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-solo]"),function(e){ e.onclick=function(){ soloTrack(e.getAttribute("data-solo")); SL.paintOne("tracks"); }; });
  function w(id,fn){ var e=$(id); if(e) e.onclick=function(){ fn(); SL.paintOne("tracks"); }; } w("slTsa",showAll); w("slTla",function(){ allSet("locked",true); }); w("slTua",function(){ allSet("locked",false); }); }
SL.addSection("tracks","Track control",render,wire,112);
SL.soloTrack=soloTrack; SL.setTrackFlag=setFlag; SL.step=33;
try{ window.AMIYO_EDITOR_BUILD="studio2-step13-track-control"; }catch(e){}
})();

;
/* ==================== Script 1604 id="amiyo-sl2-s34" ==================== */
/* Studio Lab 2, step 14 (34): SELECT AT PLAYHEAD (Final Cut / Resolve "select clips under playhead").
   "At playhead" selects every clip the playhead is on, across all tracks. "Everything before" selects every clip that ends before the playhead, "Everything after" every clip that starts after it.
   Choose "all tracks" or only video, audio or text. Locked tracks are never included. Then move, delete, recolour or retime the selection together. */
(function(){"use strict";
var SL=window.AMIYO_SL; if(!SL||SL.selectAt) return;
function $(i){return document.getElementById(i)}
var kind="all";
function pickSet(mode,k){ var t=Number(currentTime)||0, out=[]; SL.allClips().forEach(function(x){ if(x.track.locked) return; if(k&&k!=="all"&&(x.track.kind||"video")!==k) return; var s=x.clip.start||0, e=s+(x.clip.duration||0);
  if(mode==="at"&&s<=t+0.001&&e>t+0.001) out.push(x); else if(mode==="before"&&e<=t+0.001) out.push(x); else if(mode==="after"&&s>=t-0.001) out.push(x); }); return out; }
function selectAt(mode,k){ var m=pickSet(mode,k||kind); if(!m.length){ SL.say("No clips there"); return 0; }
  try{ clearMultiSelection(); m.forEach(function(x){ x.clip.selected=true; }); selectedClipId=m[0].clip.id; selectedTrackId=m[0].track.id; renderAll(); }catch(e){ return 0; }
  SL.say(m.length+" clip"+(m.length>1?"s":"")+" selected"); return m.length; }
function render(){ function b(id,t,n){ return '<button class="toolbtn slbtn" type="button" id="'+id+'">'+t+' ('+n+')</button>'; }
  return '<select id="slAk" style="width:100%;margin-bottom:6px">'+[["all","All tracks"],["video","Video tracks"],["audio","Audio tracks"],["text","Text tracks"]].map(function(o){return '<option value="'+o[0]+'"'+(kind===o[0]?" selected":"")+'>'+o[1]+'</option>'}).join("")+'</select><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">'
   +b("slAa","At playhead",pickSet("at",kind).length)+b("slAb","Before",pickSet("before",kind).length)+b("slAf","After",pickSet("after",kind).length)+'</div>'; }
function wire(){ var k=$("slAk"); if(k) k.onchange=function(){ kind=k.value; SL.paintOne("selectat"); }; function w(id,m){ var e=$(id); if(e) e.onclick=function(){ selectAt(m); }; } w("slAa","at"); w("slAb","before"); w("slAf","after"); }
SL.addSection("selectat","Select at playhead",render,wire,113);
SL.selectAt=selectAt; SL.selectAtSet=pickSet; SL.step=34;
try{ window.AMIYO_EDITOR_BUILD="studio2-step14-select-at"; }catch(e){}
})();

;
/* ==================== Script 1605 id="amiyo-sl2-s35" ==================== */
/* Studio Lab 2, step 15 (35): NOTES BOARD (DaVinci Resolve clip notes / Final Cut notes).
   Write timecoded notes for yourself or a client ("Fix colour here", "Music too loud"). "Add note at playhead" stamps the current time. Click a note to jump there, delete the ones you have dealt with,
   or copy them all as a list to paste into an email. Notes are saved with the project; they are not markers and never appear in exports. */
(function(){"use strict";
var SL=window.AMIYO_SL; if(!SL||SL.notes) return;
function $(i){return document.getElementById(i)}
function list(){ try{ project.slNotes=Array.isArray(project.slNotes)?project.slNotes:[]; return project.slNotes; }catch(e){ return []; } }
function addNote(text){ text=(text||"").trim(); if(!text){ SL.say("Type a note first"); return null; } var n={id:"note_"+Math.random().toString(36).slice(2,9),time:Math.round((Number(currentTime)||0)*1000)/1000,text:text.slice(0,300)};
  list().push(n); list().sort(function(a,b){return a.time-b.time}); try{ scheduleAutosave(); }catch(e){} SL.say("Note added at "+SL.tcs(n.time)); SL.repaint(); return n; }
function delNote(id){ var l=list(), i=l.findIndex(function(x){return x.id===id}); if(i<0) return false; l.splice(i,1); try{ scheduleAutosave(); }catch(e){} SL.repaint(); return true; }
function asText(){ return list().map(function(n){ return SL.tcs(n.time)+"  "+n.text; }).join("\n"); }
function render(){ var l=list(), h='<textarea id="slNt" rows="2" maxlength="300" placeholder="Write a note for the current time..." style="width:100%;margin-bottom:6px"></textarea><button class="toolbtn slbtn" type="button" id="slNa" style="width:100%;margin-bottom:6px">Add note at playhead</button>';
  if(!l.length) return h+'<div class="note" style="opacity:.75;font-size:12px">No notes yet.</div>';
  h+='<div style="max-height:150px;overflow:auto">'; l.forEach(function(n){ h+='<div class="slrow" data-nt="'+n.time+'"><b>'+SL.tcs(n.time)+'</b><span class="n" style="white-space:normal">'+SL.esc(n.text)+'</span><button class="toolbtn slbtn" type="button" data-nd="'+n.id+'">\u2715</button></div>'; });
  return h+'</div><button class="toolbtn slbtn" type="button" id="slNc" style="width:100%;margin-top:6px">Copy all notes</button>'; }
function wire(){ var t=$("slNt"),a=$("slNa"),c=$("slNc"); if(a) a.onclick=function(){ addNote(t&&t.value); };
  if(c) c.onclick=function(){ try{ navigator.clipboard.writeText(asText()).then(function(){ SL.say("Copied "+list().length+" notes"); },function(){ SL.say("Could not copy"); }); }catch(e){ SL.say("Could not copy"); } };
  Array.prototype.forEach.call(document.querySelectorAll("[data-nd]"),function(e){ e.onclick=function(ev){ ev.stopPropagation(); delNote(e.getAttribute("data-nd")); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-nt]"),function(e){ e.onclick=function(){ SL.goTo(parseFloat(e.getAttribute("data-nt"))); }; }); }
SL.addSection("notes","Notes board",render,wire,114);
SL.notes=list; SL.addNote=addNote; SL.deleteNote=delNote; SL.notesText=asText; SL.step=35;
try{ window.AMIYO_EDITOR_BUILD="studio2-step15-notes"; }catch(e){}
})();

;
/* ==================== Script 1606 id="amiyo-sl2-s36" ==================== */
/* Studio Lab 2, step 16 (36): TARGET RUNTIME (After Effects / Resolve delivery length check).
   Type the length you need (for example 60, 1:30 or 2:15.5). The panel shows your current length, how many seconds you are over or under, the percentage, and a plain suggestion
   such as "cut about 4 average shots". "Go to target" moves the playhead there and "Marker at target" drops a marker, so you can see where the cut-off falls. Nothing in your edit is changed. */
(function(){"use strict";
var SL=window.AMIYO_SL; if(!SL||SL.runtimeInfo) return;
function $(i){return document.getElementById(i)}
var tgt="60";
function parse(s){ s=String(s||"").trim(); if(!s) return null; var p=s.split(":").map(function(x){return parseFloat(x)}); if(p.some(function(x){return !isFinite(x)||x<0})) return null; var t=0; p.forEach(function(x){ t=t*60+x; }); return p.length>3?null:t; }
function runtimeInfo(target){ var T=parse(target); if(T==null||T<=0) return null; var cur=0; try{ cur=getProjectDuration(); }catch(e){} var st=SL.stats?SL.stats():{avg:0};
  var diff=cur-T, avg=st.avg||0; return {target:T,current:cur,diff:diff,pct:T>0?cur/T*100:0,shots:avg>0?Math.round(Math.abs(diff)/avg*10)/10:0,avg:avg}; }
function addMarkerAt(t){ SL.H("Marker at target",function(){ project.markers=project.markers||[]; project.markers.push({id:(function(){ try{ return uid("marker"); }catch(e){ return "mk"+Math.random().toString(36).slice(2,9); } })(),time:t,label:"Target length",color:"#ffb454"}); }); SL.say("Marker added at "+SL.tcs(t)); SL.repaint(); }
function render(){ var i=runtimeInfo(tgt), h='<input id="slRt" type="text" value="'+SL.esc(tgt)+'" placeholder="60 or 1:30" style="width:100%;margin-bottom:6px">';
  if(!i) return h+'<div class="note" style="font-size:12px;opacity:.75">Type a length in seconds or m:ss.</div>';
  var over=i.diff>0.05, under=i.diff<-0.05, msg=over?('<b style="color:#ff8a7a">'+i.diff.toFixed(1)+'s over</b>'+(i.avg?' \u2014 cut about '+i.shots+' average shot'+(i.shots===1?"":"s"):"")):under?('<b style="color:#7ad08a">'+(-i.diff).toFixed(1)+'s under</b>'+(i.avg?' \u2014 room for about '+i.shots+' average shot'+(i.shots===1?"":"s"):"")):'<b style="color:#7ad08a">On target</b>';
  return h+'<div style="font-size:12px;margin-bottom:6px">Current '+i.current.toFixed(1)+'s of '+i.target.toFixed(1)+'s ('+i.pct.toFixed(0)+'%): '+msg+'</div><div style="background:#1d1b17;border-radius:5px;height:8px;margin-bottom:6px"><div style="height:8px;border-radius:5px;background:'+(over?"#ff8a7a":"#7ad08a")+';width:'+Math.min(100,i.pct)+'%"></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px"><button class="toolbtn slbtn" type="button" id="slRg">Go to target</button><button class="toolbtn slbtn" type="button" id="slRm">Marker at target</button></div>'; }
function wire(){ var t=$("slRt"); if(t) t.onchange=function(){ tgt=t.value; SL.paintOne("runtime"); };
  var g=$("slRg"),m=$("slRm"); if(g) g.onclick=function(){ var i=runtimeInfo(tgt); if(i) SL.goTo(i.target); }; if(m) m.onclick=function(){ var i=runtimeInfo(tgt); if(i) addMarkerAt(i.target); }; }
SL.addSection("runtime","Target runtime",render,wire,115);
SL.runtimeInfo=runtimeInfo; SL.parseTime=parse; SL.step=36;
try{ window.AMIYO_EDITOR_BUILD="studio2-step16-runtime"; }catch(e){}
})();

;
/* ==================== Script 1607 id="amiyo-sl2-s37" ==================== */
/* Studio Lab 2, step 17 (37): MARKERS EXPORT. "Download CSV" saves every marker (number, timecode, seconds, label, colour, done) as a spreadsheet file.
   "Copy as chapters" puts a YouTube-style chapter list on the clipboard (00:00 Label, one per line; YouTube needs the first one at 00:00, so one is added if missing). Nothing in the project changes. */
(function(){"use strict";
var SL=window.AMIYO_SL; if(!SL||SL.markersCsv) return;
function $(i){return document.getElementById(i)}
function marks(){ var m=[]; try{ m=(project.markers||[]).filter(function(x){return isFinite(x.time)}); }catch(e){} return m.slice().sort(function(a,b){return a.time-b.time}); }
function fps(){ var f=30; try{ f=project.settings.fps||30; }catch(e){} return f>0?Math.round(f):30; }
function tc(t){ var f=fps(), total=Math.round(Math.max(0,t)*f), ff=total%f, s=Math.floor(total/f), h=Math.floor(s/3600), m=Math.floor((s%3600)/60), ss=s%60; function p(n){return (n<10?"0":"")+n} return p(h)+":"+p(m)+":"+p(ss)+":"+p(ff); }
function q(v){ v=String(v==null?"":v); return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; }
function markersCsv(){ var rows=[["#","Timecode","Seconds","Label","Color","Done","Chapter"]].concat(marks().map(function(m,i){ return [i+1,tc(m.time),(+m.time).toFixed(3),m.label||"",m.color||"",m.done?"yes":"no",m.chapter?"yes":"no"]; })); return rows.map(function(r){return r.map(q).join(",")}).join("\r\n"); }
function chapters(){ try{ var mp=window.amiyoMarkers&&window.amiyoMarkers.chapters&&window.amiyoMarkers.chapters(); if(mp&&mp.list&&mp.list.length){ var tx=mp.text; if(Math.floor(mp.list[0].time)!==0) tx="0:00 Start\n"+tx; return tx; } }catch(e){ window.__swl&&window.__swl(e); } var m=marks(), out=[]; function ts(t){ var s=Math.floor(t), h=Math.floor(s/3600), mm=Math.floor((s%3600)/60), ss=s%60; function p(n){return (n<10?"0":"")+n} return (h?h+":"+p(mm):mm)+":"+p(ss); }
  if(!m.length||m[0].time>0.5) out.push("0:00 Start"); m.forEach(function(x){ out.push(ts(x.time)+" "+(x.label||"Chapter")); }); return out.join("\n"); }
function download(){ var n=marks().length; if(!n){ SL.say("There are no markers to export"); return false; }
  try{ var blob=new Blob(["\uFEFF"+markersCsv()],{type:"text/csv;charset=utf-8"}), a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=(window.amiyoSafeFileName?window.amiyoSafeFileName((project.metadata&&project.metadata.name)||"amiyo-edit"):"amiyo-edit")+"-markers.csv"; document.body.appendChild(a); a.click(); setTimeout(function(){ try{ URL.revokeObjectURL(a.href); a.remove(); }catch(e){} },1500); SL.say("Saved "+n+" markers"); return true; }catch(e){ SL.say("Could not save the file"); return false; } }
function copyChapters(){ if(!marks().length){ SL.say("There are no markers to export"); return false; } try{ navigator.clipboard.writeText(chapters()).then(function(){ SL.say("Chapter list copied"); },function(){ SL.say("Could not copy"); }); }catch(e){ SL.say("Could not copy"); return false; } return true; }
function render(){ var n=marks().length; return '<div class="note" style="font-size:12px;margin-bottom:6px">'+n+' marker'+(n===1?"":"s")+'.</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px"><button class="toolbtn slbtn" type="button" id="slEd">Download CSV</button><button class="toolbtn slbtn" type="button" id="slEc">Copy as chapters</button></div>'; }
function wire(){ var d=$("slEd"),c=$("slEc"); if(d) d.onclick=download; if(c) c.onclick=copyChapters; }
SL.addSection("mexport","Markers export",render,wire,116);
SL.markersCsv=markersCsv; SL.chaptersText=chapters; SL.step=37;
try{ window.AMIYO_EDITOR_BUILD="studio2-step17-markers-export"; }catch(e){}
})();

;
/* ==================== Script 1608 id="amiyo-sl2-s38" ==================== */
/* Studio Lab 2, step 18 (38): CLIP INFO CARD (DaVinci Resolve clip attributes / Final Cut info inspector).
   Select one clip to see everything about it on one card: name, track, source file, timecode in and out, length, source in and out, speed, opacity, volume,
   how many keyframes, effects and audition takes it has. "Copy details" puts the card on the clipboard as text. Nothing is changed. */
(function(){"use strict";
var SL=window.AMIYO_SL; if(!SL||SL.clipInfo) return;
function $(i){return document.getElementById(i)}
function fps(){ var f=30; try{ f=project.settings.fps||30; }catch(e){} return f>0?Math.round(f):30; }
function tc(t){ var f=fps(), total=Math.round(Math.max(0,t)*f), ff=total%f, s=Math.floor(total/f), h=Math.floor(s/3600), m=Math.floor((s%3600)/60), ss=s%60; function p(n){return (n<10?"0":"")+n} return p(h)+":"+p(m)+":"+p(ss)+":"+p(ff); }
function clipInfo(x){ var c=x.clip, a=null; try{ a=c.assetId?getAsset(c.assetId):null; }catch(e){} var d=c.duration||0;
  return [["Name",SL.clipName(c)],["Track",x.track.name+" ("+(x.track.kind||"video")+")"],["Source file",(a&&a.name)||"none"],["TC in",tc(c.start||0)],["TC out",tc((c.start||0)+d)],["Length",d.toFixed(2)+"s ("+Math.round(d*fps())+" frames)"],
    ["Source in",c.inPoint==null?"-":(+c.inPoint).toFixed(2)+"s"],["Source out",c.outPoint==null?"-":(+c.outPoint).toFixed(2)+"s"],["Speed",((c.speed||1)*100).toFixed(0)+"%"],["Opacity",c.opacity==null?"100%":Math.round(c.opacity*100)+"%"],["Volume",c.volume==null?"100%":Math.round(c.volume*100)+"%"],
    ["Keyframes",(c.keyframes||[]).length],["Effects",(c.effects||[]).length],["Audition takes",c.audition&&c.audition.list?c.audition.list.length:0]]; }
function render(){ var l=SL.sel(); if(l.length!==1) return '<div class="note" style="opacity:.75;font-size:12px">Select exactly one clip to see its card.</div>';
  var rows=clipInfo(l[0]), h='<div style="font-size:12px">'; rows.forEach(function(r){ h+='<div style="display:flex;justify-content:space-between;gap:10px;padding:3px 0;border-bottom:1px solid #26231e"><span style="opacity:.65">'+r[0]+'</span><span style="text-align:right;overflow:hidden;text-overflow:ellipsis">'+SL.esc(r[1])+'</span></div>'; });
  return h+'</div><button class="toolbtn slbtn" type="button" id="slIc" style="width:100%;margin-top:6px">Copy details</button>'; }
function wire(){ var b=$("slIc"); if(b) b.onclick=function(){ var l=SL.sel(); if(l.length!==1) return; var t=clipInfo(l[0]).map(function(r){return r[0]+": "+r[1]}).join("\n"); try{ navigator.clipboard.writeText(t).then(function(){ SL.say("Copied"); },function(){ SL.say("Could not copy"); }); }catch(e){ SL.say("Could not copy"); } }; }
SL.addSection("info","Clip info card",render,wire,117);
SL.clipInfo=clipInfo; SL.step=38;
try{ window.AMIYO_EDITOR_BUILD="studio2-step18-clip-info"; }catch(e){}
})();

;
/* ==================== Script 1609 id="amiyo-sl2-s39" ==================== */
/* Studio Lab 2, step 19 (39): HELP GUIDE 2. A one-line explanation of every tool added in this second round of Studio Lab, at the bottom of the panel. Tap a name to open that section. */
(function(){"use strict";
var SL=window.AMIYO_SL; if(!SL||SL.help2) return;
var TOOLS=[
 ["snaps","Snapshots","Save named copies of the whole edit. Up to 30 are kept inside the project."],
 ["compare","Compare and restore","See what changed since a snapshot (added, removed, moved, trimmed) and go back to it. A back-up snapshot is taken first."],
 ["pacing","Pacing strip","One coloured bar showing the rhythm of your shots. Click it to jump."],
 ["alerts","Pacing alerts","Find shots that are too long or too short and select them together."],
 ["btrim","Batch trim","Trim the same amount off the start and end of all selected clips."],
 ["bdur","Batch set duration","Give every selected clip the same length, with optional ripple."],
 ["brename","Batch rename","Rename selected clips with a pattern like Shot {nnn}."],
 ["blevels","Batch opacity and volume","Set opacity and volume on all selected clips at once."],
 ["fit","Fit selection to range","Stretch or trim selected clips on one track so they exactly fill the range."],
 ["grid","Grid markers","Add a marker every N seconds, across the timeline or inside the range."],
 ["mclean","Marker clean-up","Remove markers in the range, of one colour, duplicates, or already done."],
 ["repeat","Repeat selection","Copy the selected clips one or more times right after themselves."],
 ["tracks","Track control","Hide, mute and lock tracks from one list, plus Solo."],
 ["selectat","Select at playhead","Select the clips under, before or after the playhead across tracks."],
 ["notes","Notes board","Timecoded notes. Click to jump, copy them all."],
 ["runtime","Target runtime","How far over or under your required length you are."],
 ["mexport","Markers export","Markers as CSV, or a YouTube chapter list."],
 ["info","Clip info card","Everything about the selected clip on one card."]];
function render(){ var h='<div class="note" style="font-size:12px;opacity:.8;margin-bottom:6px">Round 2 tools in one line each. Tap a name to open it. Ctrl+Z undoes any change.</div>';
  TOOLS.forEach(function(t){ h+='<div style="margin:5px 0;font-size:12px"><a href="#" data-help2="'+t[0]+'" style="color:#ffb454;font-weight:700;text-decoration:none">'+SL.esc(t[1])+'</a><div style="opacity:.8">'+SL.esc(t[2])+'</div></div>'; }); return h; }
function wire(){ Array.prototype.forEach.call(document.querySelectorAll("[data-help2]"),function(a){ a.onclick=function(ev){ ev.preventDefault(); var d=document.querySelector('#slBody details[data-sec="'+a.getAttribute("data-help2")+'"]'); if(d){ d.open=true; try{ d.scrollIntoView({block:"start"}); }catch(e){} } }; }); }
SL.addSection("help2","Help guide 2",render,wire,198);
SL.help2=TOOLS; SL.step=39;
try{ window.AMIYO_EDITOR_BUILD="studio2-step19-help"; }catch(e){}
})();

;
/* ==================== Script 1610 id="amiyo-sl2-s40" ==================== */
/* Studio Lab 2, step 20 (40): FINAL SELF-TEST 2. "Run self-test 2" checks the round 2 tools that can be checked without changing anything (snapshot compare, pacing, alerts, marker sets, select at playhead,
   notes, target runtime, markers export, clip info) on a small made-up timeline. Your real tracks, markers, snapshots and notes are put back exactly as they were and nothing is added to Undo. */
(function(){"use strict";
var SL=window.AMIYO_SL; if(!SL||SL.selftest2) return;
function $(i){return document.getElementById(i)}
function selftest2(){ var res=[], sv={tracks:project.tracks,markers:project.markers,assets:project.assets,notes:project.slNotes,limL:SL.limits.long,limS:SL.limits.short,range:{a:SL.range.a,b:SL.range.b},t:currentTime};
  function T(name,fn){ var ok=false,msg=""; try{ ok=!!fn(); }catch(e){ msg=String(e&&e.message||e); } res.push({name:name,ok:ok,msg:msg}); }
  function mk(){ return [{id:"t1",name:"V1",kind:"video",clips:[{id:"a",assetId:"x",start:0,duration:4,inPoint:0,outPoint:4,keyframes:[]},{id:"b",assetId:"x",start:5,duration:0.4,inPoint:4,outPoint:4.4,keyframes:[]},{id:"c",assetId:"x",start:6,duration:10,inPoint:0,outPoint:10,keyframes:[]}]},{id:"t2",name:"A1",kind:"audio",clips:[{id:"d",assetId:"y",start:0,duration:16,inPoint:0,outPoint:16,keyframes:[]}]}]; }
  try{ project.tracks=mk(); project.markers=[{id:"m1",time:3,label:"Hook",color:"#f00"},{id:"m2",time:3,label:"Hook",color:"#f00"},{id:"m3",time:9,label:"Out",color:"#0f0",done:true}]; project.assets={x:{id:"x",name:"X.mp4",type:"video",duration:30},y:{id:"y",name:"Y.mp3",type:"audio",duration:30}}; project.slNotes=[];
    T("Snapshot diff finds changes",function(){ var snap={tracks:JSON.parse(JSON.stringify(project.tracks)),markers:JSON.parse(JSON.stringify(project.markers))}; project.tracks[0].clips[0].start=1; project.tracks[0].clips[1].duration=0.2; project.tracks[0].clips.pop(); var d=SL.diffSnapshot(snap); project.tracks=mk(); return d.moved.length===1&&d.trimmed.length===1&&d.removed.length===1&&d.added.length===0; });
    T("Pacing strip counts",function(){ var p=SL.pacing(); return p.shots.length===3&&p.counts[0]===1&&p.counts[3]===1&&p.counts[4]===1&&p.total===16; });
    T("Pacing alerts",function(){ var a=SL.pacingAlerts(8,0.5); return a.length===2&&a[0].kind==="short"&&a[1].kind==="long"; });
    T("Marker sets",function(){ return SL.markerSet("dupes").length===1&&SL.markerSet("done").length===1&&SL.markerSet("color","#f00").length===2; });
    T("Select at playhead sets",function(){ currentTime=6.5; var a=SL.selectAtSet("at","all").map(function(x){return x.clip.id}).sort().join(""), b=SL.selectAtSet("before","video").length, f=SL.selectAtSet("after","video").length; return a==="cd"&&b===2&&f===0; });
    T("Notes round trip",function(){ currentTime=2; SL.addNote("Check audio"); var t=SL.notesText(); var ok=t.indexOf("Check audio")>0&&SL.notes().length===1; return ok; });
    T("Target runtime maths",function(){ var i=SL.runtimeInfo("1:00"); return i&&i.target===60&&i.current===16&&i.diff===-44&&SL.parseTime("bad")===null; });
    T("Markers CSV and chapters",function(){ var l=SL.markersCsv().split("\r\n"); return l.length===4&&l[0].indexOf("Timecode")>0&&SL.chaptersText().split("\n")[0]==="0:00 Start"; });
    T("Clip info card",function(){ var r=SL.clipInfo({clip:project.tracks[0].clips[0],track:project.tracks[0]}); return r.length===14&&r[0][1]==="X.mp4"&&r[5][1].indexOf("4.00s")===0; });
    T("Every round 2 tool has a section",function(){ var need=["snaps","compare","pacing","alerts","btrim","bdur","brename","blevels","fit","grid","mclean","repeat","tracks","selectat","notes","runtime","mexport","info","help2"], have=SL.sectionIds(); return need.every(function(i){return have.indexOf(i)>=0}); });
    T("Edit functions are present",function(){ return ["batchTrim","batchDuration","renameBatch","batchLevels","fitToRange","gridMarkers","cleanMarkers","repeatSelection","soloTrack","restoreSnapshot","takeSnapshot"].every(function(n){return typeof SL[n]==="function"}); });
  }finally{ project.tracks=sv.tracks; project.markers=sv.markers; project.assets=sv.assets; if(sv.notes===undefined) delete project.slNotes; else project.slNotes=sv.notes; SL.limits.long=sv.limL; SL.limits.short=sv.limS; SL.range.a=sv.range.a; SL.range.b=sv.range.b; currentTime=sv.t; }
  return res; }
function render(){ return '<button class="toolbtn slbtn" type="button" id="slSt2" style="width:100%">Run self-test 2</button><div id="slSt2Out" style="margin-top:6px;font-size:12px"></div>'; }
function wire(){ var b=$("slSt2"); if(b) b.onclick=function(){ var r=selftest2(), o=$("slSt2Out"), bad=r.filter(function(x){return !x.ok}).length;
  if(o) o.innerHTML='<div style="font-weight:700;margin-bottom:4px;color:'+(bad?"#ff8a7a":"#7ad08a")+'">'+(bad?bad+" check"+(bad>1?"s":"")+" FAILED":"All "+r.length+" checks passed")+'</div>'+r.map(function(x){ return '<div>'+(x.ok?'<span style="color:#7ad08a">OK</span>':'<span style="color:#ff8a7a">FAILED</span>')+' '+SL.esc(x.name)+(x.msg?' <small style="opacity:.6">'+SL.esc(x.msg)+'</small>':'')+'</div>'; }).join(""); }; }
SL.addSection("selftest2","Self-test 2",render,wire,199);
SL.selftest2=selftest2; SL.step=40;
try{ window.AMIYO_EDITOR_BUILD="studio2-step20-final"; }catch(e){}
})();

;
/* ==================== Script 1611 id="amiyo-sl3-s41" ==================== */
/* Studio Lab 3, step 1 (41): TRACK TOOLS (DaVinci Resolve / After Effects layer tools).
   Pick a track, then: Duplicate (a full copy with all its clips, placed under it), Rename, Move up or down in the stack, or Clear (remove every clip on it, after you confirm).
   One undo step each. Locked tracks cannot be cleared or moved. */
(function(){"use strict";
var SL=window.AMIYO_SL; if(!SL||SL.duplicateTrack) return;
function $(i){return document.getElementById(i)}
var cur="";
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function rid(p){ try{ return uid(p); }catch(e){ return p+"_"+Math.random().toString(36).slice(2,9); } }
function find(id){ return SL.tracks().filter(function(t){return t.id===id})[0]; }
function duplicateTrack(id){ var t=find(id); if(!t){ SL.say("Pick a track first"); return null; } var c=clone(t); c.id=rid("track"); c.name=(t.name+" copy").slice(0,40); c.locked=false; (c.clips||[]).forEach(function(k){ k.id=rid("clip"); k.selected=false; });
  SL.H("Duplicate track",function(){ var a=project.tracks, i=a.indexOf(t); a.splice(i+1,0,c); }); SL.say("Duplicated "+t.name); return c; }
function renameTrack(id,name){ var t=find(id); name=(name||"").trim(); if(!t||!name) return false; SL.H("Rename track",function(){ t.name=name.slice(0,40); }); return true; }
function moveTrack(id,dir){ var t=find(id); if(!t) return false; if(t.locked){ SL.say("That track is locked"); return false; } var a=project.tracks, i=a.indexOf(t), j=i+dir; if(j<0||j>=a.length){ SL.say(dir<0?"Already at the top":"Already at the bottom"); return false; }
  SL.H("Move track",function(){ a.splice(i,1); a.splice(j,0,t); }); return true; }
function clearTrack(id,skip){ var t=find(id); if(!t) return 0; if(t.locked){ SL.say("That track is locked"); return 0; } var n=(t.clips||[]).length; if(!n){ SL.say("That track is already empty"); return 0; }
  var ok=true; if(!skip){ try{ ok=window.confirm("Remove all "+n+" clip"+(n>1?"s":"")+" from "+t.name+"? Ctrl+Z undoes it."); }catch(e){} } if(!ok) return 0; SL.H("Clear track",function(){ t.clips=[]; }); SL.say("Cleared "+t.name); return n; }
function render(){ var tr=SL.tracks(); if(!tr.length) return '<div class="note" style="opacity:.75;font-size:12px">No tracks.</div>'; if(!find(cur)) cur=tr[0].id;
  function b(id,t){ return '<button class="toolbtn slbtn" type="button" id="'+id+'">'+t+'</button>'; }
  return '<select id="slTk" style="width:100%;margin-bottom:6px">'+tr.map(function(t){return '<option value="'+SL.esc(t.id)+'"'+(t.id===cur?" selected":"")+'>'+SL.esc(t.name)+' ('+(t.clips||[]).length+')</option>'}).join("")+'</select><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">'+b("slTkd","Duplicate")+b("slTkr","Rename")+b("slTku","Move up")+b("slTkn","Move down")+'</div><button class="toolbtn slbtn" type="button" id="slTkc" style="width:100%;margin-top:6px">Clear track</button>'; }
function wire(){ var s=$("slTk"); if(s) s.onchange=function(){ cur=s.value; }; function w(id,fn){ var e=$(id); if(e) e.onclick=function(){ fn(); SL.paintOne("trackops"); }; }
  w("slTkd",function(){ var c=duplicateTrack(cur); if(c) cur=c.id; }); w("slTku",function(){ moveTrack(cur,-1); }); w("slTkn",function(){ moveTrack(cur,1); }); w("slTkc",function(){ clearTrack(cur); });
  w("slTkr",function(){ var t=find(cur), v=null; try{ v=window.prompt("Track name",t&&t.name); }catch(e){} if(v) renameTrack(cur,v); }); }
SL.addSection("trackops","Track tools",render,wire,120);
SL.duplicateTrack=duplicateTrack; SL.renameTrack=renameTrack; SL.moveTrack=moveTrack; SL.clearTrack=clearTrack; SL.step=41;
try{ window.AMIYO_EDITOR_BUILD="studio3-step01-track-tools"; }catch(e){}
})();

;
/* ==================== Script 1612 id="amiyo-sl3-s42" ==================== */
/* Studio Lab 3, step 2 (42): BATCH SPEED (DaVinci Resolve / Final Cut retime). Set the same speed on every selected clip: 25%, 50%, 100%, 200%, 400% buttons or any value from 10% to 800%.
   The clip plays the same piece of media, so a faster clip gets shorter and a slower one gets longer. Tick "Close up the timeline" to slide the clips after each one so no gaps or overlaps appear on that track.
   One undo step. */
(function(){"use strict";
var SL=window.AMIYO_SL; if(!SL||SL.batchSpeed) return;
function $(i){return document.getElementById(i)}
var v={pct:200,ripple:true};
function batchSpeed(pct,ripple){ pct=+pct; if(!(pct>=10&&pct<=800)){ SL.say("Use a speed between 10% and 800%"); return 0; } var sp=pct/100;
  var l=SL.sel().filter(function(x){return !x.track.locked}); if(!l.length){ SL.say("Select one or more clips first"); return 0; }
  var ids={}, tracks={}; l.forEach(function(x){ ids[x.clip.id]=1; tracks[x.track.id]=x.track; }); var n=0;
  SL.H("Batch speed",function(){ Object.keys(tracks).forEach(function(k){ var cs=(tracks[k].clips||[]).slice().sort(function(a,b){return a.start-b.start}), shift=0;
    cs.forEach(function(c){ c.start=(c.start||0)+(ripple?shift:0); if(!ids[c.id]) return; var old=c.speed||1, srcSpan=c.duration*old, nd=srcSpan/sp, delta=nd-c.duration;
      c.speed=sp; c.duration=nd; c.inPoint=c.inPoint||0; c.outPoint=c.inPoint+srcSpan; c.keyframes=(c.keyframes||[]).map(function(k2){ var m=JSON.parse(JSON.stringify(k2)); m.t=k2.t*(old/sp); return m; }); n++; if(ripple) shift+=delta; }); }); });
  SL.say("Set "+n+" clip"+(n===1?"":"s")+" to "+pct+"% speed"); return n; }
function render(){ var pre=[25,50,100,200,400];
  return '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px">'+pre.map(function(p){return '<button class="toolbtn slbtn" type="button" data-sp="'+p+'">'+p+'%</button>'}).join("")+'</div><div style="display:grid;grid-template-columns:1fr auto;gap:6px;align-items:end;margin-bottom:6px"><label style="font-size:11px">Speed %<input id="slSv" type="number" min="10" max="800" step="5" value="'+v.pct+'" style="width:100%"></label><button class="toolbtn slbtn" type="button" id="slSg">Apply</button></div><label style="display:flex;gap:6px;align-items:center;font-size:12px"><input type="checkbox" id="slSr"'+(v.ripple?" checked":"")+'> Close up the timeline (ripple)</label>'; }
function wire(){ var i=$("slSv"),r=$("slSr"),g=$("slSg"); Array.prototype.forEach.call(document.querySelectorAll("[data-sp]"),function(e){ e.onclick=function(){ if(i) i.value=e.getAttribute("data-sp"); }; });
  if(g) g.onclick=function(){ v.pct=parseFloat(i.value)||v.pct; v.ripple=!!(r&&r.checked); batchSpeed(v.pct,v.ripple); SL.repaint(); }; }
SL.addSection("bspeed","Batch speed",render,wire,121);
SL.batchSpeed=batchSpeed; SL.step=42;
try{ window.AMIYO_EDITOR_BUILD="studio3-step02-batch-speed"; }catch(e){}
})();

;
/* ==================== Script 1613 id="amiyo-sl3-s43" ==================== */
/* Studio Lab 3, step 3 (43): SPLIT INTO EQUAL PARTS (Final Cut / Resolve blade at intervals).
   Select clips, choose how many equal parts (2 to 20), press Split. Each selected clip is cut into that many pieces of the same length, on the same track, with the same effects.
   Keyframes stay with the piece they belong to. The next step splits at a fixed time interval instead. One undo step. */
(function(){"use strict";
var SL=window.AMIYO_SL; if(!SL||SL.splitEqual) return;
function $(i){return document.getElementById(i)}
var parts=2;
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function rid(){ try{ return uid("clip"); }catch(e){ return "clip_"+Math.random().toString(36).slice(2,10); } }
/* cut one clip at the given absolute times; returns how many pieces it became (1 = unchanged) */
function splitClip(track,clip,times){ var s=clip.start||0, d=clip.duration||0, e=s+d, rate=d?((clip.outPoint==null?d:clip.outPoint)-(clip.inPoint||0))/d:1, inP=clip.inPoint||0, out=clip.outPoint, kfs=clip.keyframes||[];
  var cuts=times.filter(function(t){return t>s+0.05&&t<e-0.05}).sort(function(a,b){return a-b}); if(!cuts.length) return 1; var b=[s].concat(cuts,[e]), made=[];
  for(var i=0;i<b.length-1;i++){ var c=i===0?clip:clone(clip); if(i>0){ c.id=rid(); c.selected=false; } var off=b[i]-s; c.start=b[i]; c.duration=b[i+1]-b[i]; c.inPoint=inP+rate*off; c.outPoint=(i===b.length-2&&out!=null)?out:c.inPoint+rate*c.duration;
    c.keyframes=kfs.map(function(k){ var m=clone(k); m.t=k.t-off; return m; }).filter(function(k){ return k.t>=-0.001&&k.t<=c.duration+0.001; }); made.push(c); }
  made.slice(1).forEach(function(c){ track.clips.push(c); }); track.clips.sort(function(p,q){return p.start-q.start}); return made.length; }
function splitEqual(n){ n=Math.max(2,Math.min(20,parseInt(n,10)||2)); var l=SL.sel().filter(function(x){return !x.track.locked}); if(!l.length){ SL.say("Select one or more clips first"); return 0; } var total=0;
  SL.H("Split into equal parts",function(){ l.forEach(function(x){ var s=x.clip.start, d=x.clip.duration, t=[]; for(var i=1;i<n;i++) t.push(s+d*i/n); total+=splitClip(x.track,x.clip,t)-1; }); });
  SL.say(total?("Made "+total+" new piece"+(total>1?"s":"")):"Nothing was split"); return total; }
function render(){ return '<div style="display:grid;grid-template-columns:1fr auto;gap:6px;align-items:end"><label style="font-size:11px">Equal parts (2-20)<input id="slSn" type="number" min="2" max="20" step="1" value="'+parts+'" style="width:100%"></label><button class="toolbtn slbtn" type="button" id="slSg2">Split</button></div>'; }
function wire(){ var n=$("slSn"),g=$("slSg2"); if(g) g.onclick=function(){ parts=parseInt(n.value,10)||2; splitEqual(parts); SL.repaint(); }; }
SL.addSection("splitn","Split into equal parts",render,wire,122);
SL.splitClip=splitClip; SL.splitEqual=splitEqual; SL.step=43;
try{ window.AMIYO_EDITOR_BUILD="studio3-step03-split-equal"; }catch(e){}
})();

;
/* ==================== Script 1614 id="amiyo-sl3-s44" ==================== */
/* Studio Lab 3, step 4 (44): SPLIT EVERY N SECONDS (Resolve / Final Cut blade at intervals, handy for long recordings and music).
   Select clips, type a time in seconds and press Split. Each clip is cut every N seconds counted from its own start, or, if you tick "On the timeline grid", at multiples of N on the timeline (2s, 4s, 6s...).
   Pieces shorter than 0.05s are never made. Up to 200 pieces per clip. One undo step. */
(function(){"use strict";
var SL=window.AMIYO_SL; if(!SL||!SL.splitClip||SL.splitEvery) return;
function $(i){return document.getElementById(i)}
var v={n:5,grid:false};
function splitEvery(n,grid){ n=+n; if(!(n>=0.1)){ SL.say("Use an interval of at least 0.1 seconds"); return 0; } var l=SL.sel().filter(function(x){return !x.track.locked}); if(!l.length){ SL.say("Select one or more clips first"); return 0; } var total=0;
  SL.H("Split every N seconds",function(){ l.forEach(function(x){ var s=x.clip.start, e=s+x.clip.duration, t=[], k, cap=0;
    if(grid){ for(k=Math.floor(s/n)+1;k*n<e&&cap<200;k++,cap++) t.push(Math.round(k*n*1000)/1000); } else { for(k=1;s+k*n<e&&cap<200;k++,cap++) t.push(s+k*n); }
    total+=SL.splitClip(x.track,x.clip,t)-1; }); });
  SL.say(total?("Made "+total+" new piece"+(total>1?"s":"")):"Nothing was split"); return total; }
function render(){ return '<div style="display:grid;grid-template-columns:1fr auto;gap:6px;align-items:end;margin-bottom:6px"><label style="font-size:11px">Every (s)<input id="slEn" type="number" min="0.1" step="0.5" value="'+v.n+'" style="width:100%"></label><button class="toolbtn slbtn" type="button" id="slEg">Split</button></div><label style="display:flex;gap:6px;align-items:center;font-size:12px"><input type="checkbox" id="slEc2"'+(v.grid?" checked":"")+'> On the timeline grid</label>'; }
function wire(){ var n=$("slEn"),c=$("slEc2"),g=$("slEg"); if(g) g.onclick=function(){ v.n=parseFloat(n.value)||v.n; v.grid=!!(c&&c.checked); splitEvery(v.n,v.grid); SL.repaint(); }; }
SL.addSection("splite","Split every N seconds",render,wire,123);
SL.splitEvery=splitEvery; SL.step=44;
try{ window.AMIYO_EDITOR_BUILD="studio3-step04-split-every"; }catch(e){}
})();

;
/* ==================== Script 1615 id="amiyo-sl3-s45" ==================== */
/* Studio Lab 3, step 5 (45): JOIN THROUGH EDITS (Final Cut "Join Clips", Resolve "Join clips").
   Glue back together neighbouring clips that were only split: same media, touching on the timeline, continuing the same piece of the source, at the same speed.
   "Join selected" works on the selected clips; "Join all" checks every unlocked track. Clips that do not match perfectly are left alone, so a real cut is never removed.
   Keyframes of the joined clip are kept. One undo step. */
(function(){"use strict";
var SL=window.AMIYO_SL; if(!SL||SL.joinThrough) return;
function $(i){return document.getElementById(i)}
function sameRun(a,b){ if(!a.assetId||a.assetId!==b.assetId) return false; if(Math.abs((a.speed||1)-(b.speed||1))>0.001) return false; if(Math.abs((a.start+a.duration)-b.start)>0.02) return false;
  var aOut=a.outPoint==null?(a.inPoint||0)+a.duration*(a.speed||1):a.outPoint; return Math.abs(aOut-(b.inPoint||0))<0.05; }
function joinTrack(t,only){ var cs=(t.clips||[]).slice().sort(function(p,q){return p.start-q.start}), keep=[], n=0;
  cs.forEach(function(c){ var p=keep[keep.length-1]; if(p&&(!only||(only[p.id]&&only[c.id]))&&sameRun(p,c)){ var off=p.duration; p.keyframes=(p.keyframes||[]).concat((c.keyframes||[]).map(function(k){ var m=JSON.parse(JSON.stringify(k)); m.t=k.t+off; return m; })); p.duration+=c.duration; p.outPoint=c.outPoint==null?(p.inPoint||0)+p.duration*(p.speed||1):c.outPoint; n++; } else keep.push(c); });
  if(n) t.clips=keep; return n; }
function joinThrough(all){ var tr=SL.tracks().filter(function(t){return !t.locked}), only=null;
  if(!all){ var l=SL.sel(); if(l.length<2){ SL.say("Select two or more touching clips"); return 0; } only={}; l.forEach(function(x){ only[x.clip.id]=1; }); var ids={}; l.forEach(function(x){ ids[x.track.id]=1; }); tr=tr.filter(function(t){return ids[t.id]}); }
  var n=0; SL.H("Join through edits",function(){ tr.forEach(function(t){ n+=joinTrack(t,only); }); }); SL.say(n?("Joined "+n+" cut"+(n>1?"s":"")):"No through edits to join"); return n; }
function render(){ return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px"><button class="toolbtn slbtn" type="button" id="slJs">Join selected</button><button class="toolbtn slbtn" type="button" id="slJa">Join all</button></div>'; }
function wire(){ var s=$("slJs"),a=$("slJa"); if(s) s.onclick=function(){ joinThrough(false); SL.repaint(); }; if(a) a.onclick=function(){ joinThrough(true); SL.repaint(); }; }
SL.addSection("join","Join through edits",render,wire,124);
SL.joinThrough=joinThrough; SL.joinTrack=joinTrack; SL.step=45;
try{ window.AMIYO_EDITOR_BUILD="studio3-step05-join"; }catch(e){}
})();

;
/* ==================== Script 1616 id="amiyo-sl3-s46" ==================== */
/* Studio Lab 3, step 6 (46): SHUFFLE ORDER (random montage order).
   Select two or more clips on a track and press Shuffle: they are put in a random order inside the same stretch of timeline, keeping the first start and the gaps (in shuffled positions), so the total length does not change.
   Press again for a new order, Ctrl+Z to go back. Locked tracks are skipped. */
(function(){"use strict";
var SL=window.AMIYO_SL; if(!SL||SL.shuffleSelected) return;
function $(i){return document.getElementById(i)}
function shuffle(a,rnd){ for(var i=a.length-1;i>0;i--){ var j=Math.floor(rnd()*(i+1)), t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function shuffleSelected(rnd){ rnd=rnd||Math.random; var l=SL.sel().filter(function(x){return !x.track.locked}), m={}; l.forEach(function(x){ (m[x.track.id]=m[x.track.id]||{t:x.track,items:[]}).items.push(x.clip); });
  var groups=Object.keys(m).map(function(k){ m[k].items.sort(function(a,b){return a.start-b.start}); return m[k]; }).filter(function(g){return g.items.length>1}); if(!groups.length){ SL.say("Select two or more clips on one track"); return 0; }
  SL.H("Shuffle clips",function(){ groups.forEach(function(g){ var it=g.items, gaps=[]; for(var i=0;i<it.length-1;i++) gaps.push(Math.max(0,it[i+1].start-(it[i].start+it[i].duration)));
    var at=it[0].start, order=shuffle(it.slice(),rnd), t=at; order.forEach(function(c,i){ c.start=t; t+=c.duration+(gaps[i]||0); }); g.t.clips.sort(function(p,q){return p.start-q.start}); }); });
  SL.say("Shuffled "+groups.reduce(function(n,g){return n+g.items.length},0)+" clips"); return groups.length; }
function render(){ return '<div class="note" style="font-size:12px;opacity:.8;margin-bottom:6px">Select two or more clips on a track first.</div><button class="toolbtn slbtn" type="button" id="slHs" style="width:100%">Shuffle selected clips</button>'; }
function wire(){ var b=$("slHs"); if(b) b.onclick=function(){ shuffleSelected(); SL.repaint(); }; }
SL.addSection("shuffle","Shuffle order",render,wire,125);
SL.shuffleSelected=shuffleSelected; SL.step=46;
try{ window.AMIYO_EDITOR_BUILD="studio3-step06-shuffle"; }catch(e){}
})();

;
/* ==================== Script 1617 id="amiyo-sl3-s47" ==================== */
/* Studio Lab 3, step 7 (47): MOVE SELECTION TO PLAYHEAD (Resolve "snap to playhead", Final Cut "move to playhead").
   Select clips, park the playhead where you want them and press "Start at playhead": the whole selection moves, keeping the distances between its clips, so the earliest clip starts exactly at the playhead.
   "End at playhead" lines up the latest end instead. If the move would land on top of other clips on the same track, nothing moves and you are told why. One undo step. */
(function(){"use strict";
var SL=window.AMIYO_SL; if(!SL||SL.moveToPlayhead) return;
function $(i){return document.getElementById(i)}
function moveToPlayhead(mode){ var l=SL.sel().filter(function(x){return !x.track.locked}); if(!l.length){ SL.say("Select one or more clips first"); return false; }
  var a=Math.min.apply(null,l.map(function(x){return x.clip.start})), b=Math.max.apply(null,l.map(function(x){return x.clip.start+x.clip.duration})), t=Number(currentTime)||0, delta=(mode==="end")?(t-b):(t-a);
  if(a+delta<-0.001){ SL.say("That would move the clips before the start of the timeline"); return false; } if(Math.abs(delta)<0.001){ SL.say("Already there"); return false; }
  var ids={}; l.forEach(function(x){ ids[x.clip.id]=1; });
  var clash=l.some(function(x){ return (x.track.clips||[]).some(function(o){ if(ids[o.id]) return false; var s=x.clip.start+delta, e=s+x.clip.duration; return o.start<e-0.001&&o.start+o.duration>s+0.001; }); });
  if(clash){ SL.say("That spot is taken by other clips on the same track"); return false; }
  SL.H("Move to playhead",function(){ l.forEach(function(x){ x.clip.start=Math.max(0,x.clip.start+delta); x.track.clips.sort(function(p,q){return p.start-q.start}); }); }); SL.say("Moved "+l.length+" clip"+(l.length>1?"s":"")+" ("+(delta>0?"+":"")+delta.toFixed(2)+"s)"); return true; }
function render(){ return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px"><button class="toolbtn slbtn" type="button" id="slMs">Start at playhead</button><button class="toolbtn slbtn" type="button" id="slMe">End at playhead</button></div>'; }
function wire(){ var s=$("slMs"),e=$("slMe"); if(s) s.onclick=function(){ moveToPlayhead("start"); SL.repaint(); }; if(e) e.onclick=function(){ moveToPlayhead("end"); SL.repaint(); }; }
SL.addSection("tohead","Move selection to playhead",render,wire,126);
SL.moveToPlayhead=moveToPlayhead; SL.step=47;
try{ window.AMIYO_EDITOR_BUILD="studio3-step07-move-playhead"; }catch(e){}
})();

;
/* ==================== Script 1618 id="amiyo-sl3-s48" ==================== */
/* Studio Lab 3, step 8 (48): EXACT NUDGE (Resolve / Final Cut nudge, with a number you choose).
   Move the selected clips earlier or later by an exact amount: type a number and pick frames or seconds, then press the arrow buttons. The whole selection moves together.
   A nudge that would push a clip before the start of the timeline, or on top of other clips on the same track, is refused with a message. One undo step per nudge. */
(function(){"use strict";
var SL=window.AMIYO_SL; if(!SL||SL.nudgeExact) return;
function $(i){return document.getElementById(i)}
var v={amt:1,unit:"frames"};
function fps(){ var f=30; try{ f=project.settings.fps||30; }catch(e){} return f>0?f:30; }
function canMove(list,delta){ if(list.some(function(x){return x.clip.start+delta<-0.001})) return "That would go before the start of the timeline";
  var ids={}; list.forEach(function(x){ ids[x.clip.id]=1; });
  var clash=list.some(function(x){ return (x.track.clips||[]).some(function(o){ if(ids[o.id]) return false; var s=x.clip.start+delta, e=s+x.clip.duration; return o.start<e-0.001&&o.start+o.duration>s+0.001; }); });
  return clash?"That spot is taken by other clips on the same track":""; }
function nudgeExact(amount,unit,dir){ amount=+amount; if(!(amount>0)){ SL.say("Enter an amount above zero"); return false; } var sec=unit==="seconds"?amount:amount/fps(), delta=sec*(dir<0?-1:1);
  var l=SL.sel().filter(function(x){return !x.track.locked}); if(!l.length){ SL.say("Select one or more clips first"); return false; } var why=canMove(l,delta); if(why){ SL.say(why); return false; }
  SL.H("Nudge clips",function(){ l.forEach(function(x){ x.clip.start=Math.max(0,x.clip.start+delta); }); l.forEach(function(x){ x.track.clips.sort(function(p,q){return p.start-q.start}); }); }); return true; }
function render(){ return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px"><input id="slNa2" type="number" min="0" step="1" value="'+v.amt+'"><select id="slNu"><option value="frames"'+(v.unit==="frames"?" selected":"")+'>frames</option><option value="seconds"'+(v.unit==="seconds"?" selected":"")+'>seconds</option></select></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px"><button class="toolbtn slbtn" type="button" id="slNl">\u25C0 Earlier</button><button class="toolbtn slbtn" type="button" id="slNr">Later \u25B6</button></div>'; }
function wire(){ var a=$("slNa2"),u=$("slNu"); function go(d){ v.amt=parseFloat(a.value)||v.amt; v.unit=u.value; nudgeExact(v.amt,v.unit,d); } var l=$("slNl"),r=$("slNr"); if(l) l.onclick=function(){ go(-1); }; if(r) r.onclick=function(){ go(1); }; }
SL.addSection("nudge","Exact nudge",render,wire,127);
SL.nudgeExact=nudgeExact; SL.canMove=canMove; SL.step=48;
try{ window.AMIYO_EDITOR_BUILD="studio3-step08-nudge"; }catch(e){}
})();

;
/* ==================== Script 1619 id="amiyo-sl3-s49" ==================== */
/* Studio Lab 3, step 9 (49): HELP GUIDE 3. One line for each tool added in round 3 of Studio Lab. Tap a name to open that section. */
(function(){"use strict";
var SL=window.AMIYO_SL; if(!SL||SL.help3) return;
var TOOLS=[
 ["trackops","Track tools","Duplicate, rename, move up or down, or clear a whole track."],
 ["bspeed","Batch speed","Set 25% to 800% on all selected clips, with optional ripple."],
 ["splitn","Split into equal parts","Cut each selected clip into 2 to 20 equal pieces."],
 ["splite","Split every N seconds","Cut at a fixed interval, from each clip's start or on the timeline grid."],
 ["join","Join through edits","Glue back split clips that continue the same media; real cuts are left alone."],
 ["shuffle","Shuffle order","Random order for a montage, same total length."],
 ["tohead","Move selection to playhead","Start or end the selection exactly at the playhead; refuses if it would overlap."],
 ["nudge","Exact nudge","Move the selection by a number of frames or seconds."]];
function render(){ var h='<div class="note" style="font-size:12px;opacity:.8;margin-bottom:6px">Round 3 tools. Tap a name to open it. Ctrl+Z undoes any change.</div>';
  TOOLS.forEach(function(t){ h+='<div style="margin:5px 0;font-size:12px"><a href="#" data-help3="'+t[0]+'" style="color:#ffb454;font-weight:700;text-decoration:none">'+SL.esc(t[1])+'</a><div style="opacity:.8">'+SL.esc(t[2])+'</div></div>'; }); return h; }
function wire(){ Array.prototype.forEach.call(document.querySelectorAll("[data-help3]"),function(a){ a.onclick=function(ev){ ev.preventDefault(); var d=document.querySelector('#slBody details[data-sec="'+a.getAttribute("data-help3")+'"]'); if(d){ d.open=true; try{ d.scrollIntoView({block:"start"}); }catch(e){} } }; }); }
SL.addSection("help3","Help guide 3",render,wire,298);
SL.help3=TOOLS; SL.step=49;
try{ window.AMIYO_EDITOR_BUILD="studio3-step09-help"; }catch(e){}
})();

;
/* ==================== Script 1620 id="amiyo-sl3-s50" ==================== */
/* Studio Lab 3, step 10 (50): FINAL SELF-TEST 3. "Run self-test 3" checks the round 3 tools on a small made-up timeline (splitting, joining, nudge safety, tool sections),
   working on throw-away copies so your real project is untouched and nothing is added to Undo. */
(function(){"use strict";
var SL=window.AMIYO_SL; if(!SL||SL.selftest3) return;
function $(i){return document.getElementById(i)}
function selftest3(){ var res=[];
  function T(name,fn){ var ok=false,msg=""; try{ ok=!!fn(); }catch(e){ msg=String(e&&e.message||e); } res.push({name:name,ok:ok,msg:msg}); }
  function mkTrack(){ return {id:"t",name:"V",kind:"video",clips:[{id:"a",assetId:"x",start:0,duration:6,inPoint:0,outPoint:6,keyframes:[{t:0,scale:1},{t:5,scale:2}]},{id:"z",assetId:"x",start:10,duration:2,inPoint:0,outPoint:2,keyframes:[]}]}; }
  T("Split keeps media continuous",function(){ var t=mkTrack(); var n=SL.splitClip(t,t.clips[0],[2,4]); var c=t.clips; return n===3&&c.length===4&&c[0].duration===2&&c[1].inPoint===2&&c[2].inPoint===4&&c[2].outPoint===6; });
  T("Split moves keyframes with the piece",function(){ var t=mkTrack(); SL.splitClip(t,t.clips[0],[3]); var c=t.clips; return c[0].keyframes.length===1&&c[1].keyframes.length===1&&Math.abs(c[1].keyframes[0].t-2)<1e-6; });
  T("Tiny pieces are not made",function(){ var t=mkTrack(); return SL.splitClip(t,t.clips[0],[0.01,5.99])===1; });
  T("Join glues a split back",function(){ var t=mkTrack(); SL.splitClip(t,t.clips[0],[2,4]); var n=SL.joinTrack(t,null); return n===2&&t.clips.length===2&&t.clips[0].duration===6&&t.clips[0].keyframes.length===2; });
  T("Join leaves a real cut alone",function(){ var t=mkTrack(); t.clips[1].start=6; return SL.joinTrack(t,null)===0&&t.clips.length===2; });
  T("Nudge refuses an overlap",function(){ var t=mkTrack(); return SL.canMove([{clip:t.clips[0],track:t}],5)!==""&&SL.canMove([{clip:t.clips[0],track:t}],2)===""; });
  T("Nudge refuses going before zero",function(){ var t=mkTrack(); return SL.canMove([{clip:t.clips[0],track:t}],-1)!==""; });
  T("Every round 3 tool has a section",function(){ var need=["trackops","bspeed","splitn","splite","join","shuffle","tohead","nudge","help3"], have=SL.sectionIds(); return need.every(function(i){return have.indexOf(i)>=0}); });
  T("Edit functions are present",function(){ return ["duplicateTrack","moveTrack","clearTrack","batchSpeed","splitEqual","splitEvery","joinThrough","shuffleSelected","moveToPlayhead","nudgeExact"].every(function(n){return typeof SL[n]==="function"}); });
  return res; }
function render(){ return '<button class="toolbtn slbtn" type="button" id="slSt3" style="width:100%">Run self-test 3</button><div id="slSt3Out" style="margin-top:6px;font-size:12px"></div>'; }
function wire(){ var b=$("slSt3"); if(b) b.onclick=function(){ var r=selftest3(), o=$("slSt3Out"), bad=r.filter(function(x){return !x.ok}).length;
  if(o) o.innerHTML='<div style="font-weight:700;margin-bottom:4px;color:'+(bad?"#ff8a7a":"#7ad08a")+'">'+(bad?bad+" check"+(bad>1?"s":"")+" FAILED":"All "+r.length+" checks passed")+'</div>'+r.map(function(x){ return '<div>'+(x.ok?'<span style="color:#7ad08a">OK</span>':'<span style="color:#ff8a7a">FAILED</span>')+' '+SL.esc(x.name)+(x.msg?' <small style="opacity:.6">'+SL.esc(x.msg)+'</small>':'')+'</div>'; }).join(""); }; }
SL.addSection("selftest3","Self-test 3",render,wire,299);
SL.selftest3=selftest3; SL.step=50;
try{ window.AMIYO_EDITOR_BUILD="studio3-step10-final"; }catch(e){}
})();

;
/* ==================== Script 1621 id="amiyo-export8-step05-gif-fit" ==================== */
/* Export plan 2026-11b, step 5 of 20 (GIF), part 2. Checked with real GIFs (headless Chrome) read back with Pillow and compared with the live preview: 150-frame whole project, play once / loop forever, 6-25 fps, 240-1280 wide, sharp and smooth, In-Out range, selected clip, cancel, closing the dialog mid-capture, a second GIF after a cancel. Preview vs GIF: 0.2-0.4 levels off (palette only), also during transitions and with text; playhead, undo list and the hidden editor all came back after every run.
   Faults found and fixed: (1) a range that is not a whole number of pictures came out up to one picture too long (4.5 s In-Out gave 4.53 s): the last picture now closes the range exactly. (2) a long range at a big size was cut short with only a warning (25 fps at 320 wide kept 12 s of 15; project size kept 4.5 s): the warning now has a \"Fit the whole range\" button that lowers the frame rate first (not below 8 fps until the width is at its smallest), then the width, and shows the new choice in the chips.
   Not tested here: very long GIFs near the 300-picture limit on a phone, a vertical 9:16 project (step 9), photographic video content (the test scenes are flat colours). */window.AMIYO_EXPORT8_STEP=5;

;
/* ==================== Script 1622 id="amiyo-export8-step06-verified" ==================== */
/* Export plan 2026-11b, step 6 of 20 (still frame and thumbnail), checked with real saved files (headless Chrome) and a 300-frame test video whose picture colour encodes its frame number (decoded back from the saved PNG / JPEG).
   Checked and right: Save frame (Export dialog, Ctrl+Shift+E, the Frame button / Ctrl+Shift+S, Pr tools > Export frame) as PNG, JPEG and WebP: PNG identical to the preview (0.00), JPEG/WebP 0.1-0.4 levels off, at project size, half and double; stills of the video clip were the right frame 420 of 420 times (sequential and jumping), 15 of 15 through the Frame button and 4 of 4 through Pr tools. Thumbnail: 4 sizes (video size, 1280x720, square 1080, vertical 1080x1920), 4 frame choices (playhead, middle, first frame), right frame every time, 6-12 KB, playhead put back.
   Faults found and fixed: (1) the three ways of saving a frame named files three ways (name-frame-00-05-250.png, name-frame-00-00-05-f08.png, Name_00-00-05-08.png) and two of them turned a project name in Bengali, Hindi, Arabic... into underscores: all use name-frame-HH-MM-SS-fNN now and keep the letters of the name. (2) a frame saved with the playhead past the end or in a gap was a black picture saved without a word: it now says "Nothing is showing at the playhead" (Save frame, Copy frame, Pr tools). (3) a thumbnail set to "At playhead" with the playhead in a gap was black: the middle of the exported range is used and the note says so. (4) a thumbnail title longer than two lines was cut without a sign: it now ends in an ellipsis. (5) the Frame button's window says what to do when a very large size cannot be made.
   Not tested here: Copy frame to the clipboard (this test browser has no clipboard permission), the 2 MB thumbnail limit on a very noisy 4K frame (checked in an earlier round), thumbnail text in right-to-left scripts. */window.AMIYO_EXPORT8_STEP=6;

;
/* ==================== Script 1623 id="amiyo-export8-step05-build" ==================== */
try{ window.AMIYO_EDITOR_BUILD="export8-step06-still"; }catch(e){}

;
/* ==================== Script 1624 id="amiyo-export8-step07-verified" ==================== */
/* Export plan 2026-11b, step 7 of 20 (image sequence), checked with real ZIP files (headless Chrome) and a 150-frame test video whose picture colour encodes its frame number (decoded back from every saved picture).
   Checked and right: whole project, selected clip and In-Out range; PNG and JPEG; every frame, 12, 5 and 1 per second; widths 1280 (project), 640 and 320; numbering from 0 and from 1; every picture was the right frame (150 of 150, no offsets); ZIP files open cleanly; large jobs split into several ZIPs with no missing or repeated picture; Cancel and closing the dialog mid-run stop at once, keep ZIPs already saved, put the playhead back and allow a new run; the project (playhead, undo list) is unchanged afterwards; empty gaps come out as the dark editor background, not transparent.
   Fault found and fixed: numbers were always 5 digits, so a sequence of more than 99,999 pictures (about 1 hour at 30 per second) got names that sort wrongly in a folder; the number now widens (000001...) when needed.
   Not tested here: a 100,000-picture run (too long); the fix is one line and was checked on normal runs. */window.AMIYO_EXPORT8_STEP=7;

;
/* ==================== Script 1625 id="amiyo-export8-step07-build" ==================== */
try{ window.AMIYO_EDITOR_BUILD="export8-step07-sequence"; }catch(e){}

;
/* ==================== Script 1626 id="amiyo-export8-step08-mask-fix" ==================== */
/* Export plan 2026-11b, step 8 fix: a Mask (Inspector > Mask / shape) on a plain video clip did nothing in the preview or the export, because only clips with a look, LUT, key or blend mode were sent through the path that applies masks. A mask that is switched on now sends the clip there too. */
(function(){try{ var ns=window.amiyoNeedsStack; window.amiyoNeedsStack=function(c){ return !!(c&&c.mask&&c.mask.enabled)||(ns?ns.apply(this,arguments):false); }; }catch(e){ window.__swl&&window.__swl(e); }})();

;
/* ==================== Script 1627 id="amiyo-export8-step08-verified" ==================== */
/* Export plan 2026-11b, step 8 of 20 (keyframes, crop and masks), checked with real WebM (VP9) and MP4 (H.264) exports (headless Chrome) of a gradient test video and a gradient test picture, each exported frame compared with the live preview at five times.
   Checked and right: position, scale and rotation keyframes (three keys, rotation 0 > 30 > -20 degrees), crop on all four sides, an oval mask rotating and moving with the keyframes, video clips and picture clips: shapes, turns and edges in the exported frames match the preview; the project background colour reaches the file in both formats.
   Fault found and fixed: a Mask on a plain video clip (no look, LUT, key or blend mode) did nothing, in the preview or in the export. A mask that is switched on now takes effect.
   Not tested here: mask feather and invert in the export (preview only checked for invert), mask on clips that also use Chroma Key, keyframe easing curves. */window.AMIYO_EXPORT8_STEP=8;

;
/* ==================== Script 1628 id="amiyo-export8-step08-build" ==================== */
try{ window.AMIYO_EDITOR_BUILD="export8-step08-keyframes-masks"; }catch(e){}

;
/* ==================== Script 1629 id="amiyo-export8-step09-verified" ==================== */
/* Export plan 2026-11b, step 9 of 20 (odd sizes and frame rates), checked with real MP4 (H.264) and WebM (VP9) exports (headless Chrome), each file read back with ffprobe (size, frame rate, number of frames, length).
   Checked and right: 24, 25, 30 and 60 fps (120 / 125 / 150 / 300 frames in 5 s, exact length); project rates 29.97 and 23.976 (30000/1001 and 24000/1001, 150 and 120 frames); 16:9, 9:16 (720x1280), 1:1 (1080x1080) and 4:5 (864x1080); Draft 480p and Tiny 360p of each shape (480x854, 480x600, 360x360, 360x450, always even numbers); a vertical export matches the preview (same geometry, not stretched).
   Fault found and fixed: with an odd project size (for example 853 x 479) the file is made one pixel bigger on each side (854 x 480, a video needs even numbers) but the "Will make" line still said 853x479. The line now shows the size the file really gets.
   Seen, left for step 10: after the size or quality changes the "Will make" line can list two "up to ... MB" figures, and a quality preset chosen earlier is remembered and named in the line. Not tested here: 120 fps, custom export size with odd numbers typed in. */window.AMIYO_EXPORT8_STEP=9;

;
/* ==================== Script 1630 id="amiyo-export8-step09-build" ==================== */
try{ window.AMIYO_EDITOR_BUILD="export8-step09-sizes-rates"; }catch(e){}

;
/* ==================== Script 1631 id="amiyo-export8-step10-verified" ==================== */
/* Export plan 2026-11b, step 10 of 20 (bitrate and quality settings against the "Will make" size), checked with real WebM (VP9) and MP4 (H.264) exports (headless Chrome) of a plain test video with sound, a flat colour clip and a very noisy clip, each file read back with ffprobe and its size compared with the figure the Export window showed just before Start.
   Checked and right: the Quality chips (Smaller file / Balanced / Best quality) change the real bitrate in the right order in both formats; Manual 1 to 40 Mbps; sound on/off and the audio bitrate chips; presets; sizes (Tiny, Draft, Standard, Full HD); 30 and 60 fps; parts.
   Faults found and fixed: (1) the fast export made 360p and 480p at about 4 Mbps (its own rule: at least 4 Mbps, any size) while the window promised 1.5 and 1.7 Mbps, so those files came out about 3 times the size shown (3.1 MB and 3.3 MB against "up to 1.1 MB" and "up to 1.2 MB"); the exporter now uses the rule the window shows (5 Mbps from 720p up, 1.5 Mbps below, never more than 20). Standard 720p is now 5.0 Mbps (was 4.0), as the window already said. (2) A hand-typed Manual bitrate was not kept: 8 Mbps gave 10.3 Mbps, and 1 Mbps in MP4 gave 1.9 Mbps on a busy picture. Manual now asks the encoder for a constant rate: WebM 1 / 3 / 8 / 20 Mbps gave 1.04 / 3.01 / 8.03 / 20.1 Mbps, MP4 8 and 20 Mbps within 2%. (3) Five places showed the file size (Will make, the About line, the Estimate box, the phone summary line, the size-limit advice) and could disagree: the About line ignored "No sound" and the sound bitrate chip, and the limit advice ("fits your 25 MB limit") judged the plain size row, not a chosen preset, custom size or Manual bitrate (it said 5.5 MB while the file would be 9.5 MB). They now all read one shared calculation (window.amiyoExportNow). (4) The "Auto picks about X Mbps" note ignored the quality chip and presets. (5) The sound rate in the estimate was 192 kbps but the fast export uses 128 kbps (192 only in the live recorder). (6) "Up to" is now a real ceiling: a variable-rate encoder ran up to 30% over its target on a very busy picture, so the ceiling adds 35% to the picture rate for Auto and 20% for Manual. After an export the message says what the real file weighed against that figure, and if it came out bigger it says why and what helps.
   Not fixed, kept honest: H.264 at 1 Mbps on a very busy 720p picture still gave 1.9 Mbps (the software encoder cannot go lower), so a file can pass the Manual figure; the after-export message says so. A plain picture comes out at 40 to 75% of the ceiling, and a flat one at almost nothing: the ceiling is an upper figure, as the window says.
   Seen, left for later: the figure is written "13 MB" in one line and "12.7 MB" in another (rounding only). While three exports ran at once on a slow machine, one export of a very busy clip kept only 2 frames (it ran fine alone; left for the stress step, 17). Not tested here: hardware encoders, AV1, 120 fps. */window.AMIYO_EXPORT8_STEP=10;

;
/* ==================== Script 1632 id="amiyo-export8-step10-build" ==================== */
try{ window.AMIYO_EDITOR_BUILD="export8-step10-bitrate-size"; }catch(e){}

;
/* ==================== Script 1633 id="amiyo-export9-step11" ==================== */
/* Export plan step 11: save the project file and open it again (round-trip).
   Found by testing: (1) the In/Out range was not stored, so it came back empty; (2) a media file that was no longer on the device was saved
   silently without its data and the project then opened with a blank picture and no warning; (3) every problem said just "Invalid .amiyovideo file";
   (4) the file name used the raw project name (a / or : in it gave a different name from the export); (5) opening a project while an export ran
   could replace the project under the recorder; (6) a failed open could leave the old selection and playhead pointing at nothing.
   Now: the file stores the In/Out range, a short note says which media is missing, each problem has a plain message, a bad file leaves the open project untouched,
   and the project you replace is kept as a recovery point first. */
(function(){try{
  if(window.__x9s11) return; window.__x9s11=1;
  var SCHEMA_MAX=2;
  function say(t,ms){ try{ toast(t,ms||5000); }catch(e){ window.__swl&&window.__swl(e); } }
  function names(list){ var n=list.slice(0,3).join(", "); return n+(list.length>3?" and "+(list.length-3)+" more":""); }
  function missingNames(p){ var out=[]; Object.keys((p&&p.assets)||{}).forEach(function(k){ var a=p.assets[k]; if(!a) return; if(typeof amiyoAssetMissing==="function"? amiyoAssetMissing(a.id||k) : false) out.push(a.name||a.id||k); }); return out; }
  var old=window.saveProjectFile;
  window.saveProjectFile=async function(){
    try{
      var total=Object.values(project.assets||{}).reduce(function(n,a){ return n+(a.size||0); },0);
      if(total>400*1048576&&!await amiyoOk("This project holds about "+Math.round(total/1048576)+" MB of media. Saving it as one file may fail or freeze the browser. Continue?",{okLabel:"Save anyway"})) return false;
      say("Preparing project file\u2026",8000);
      var p=serializableProject(), lost=[];
      for(var a of Object.values(p.assets||{})){
        var b=ASSET_BLOBS.get(a.id);
        if(b) a.fileData=await readFileAsDataURL(b);
        else if(!(typeof a.fileData==="string"&&a.fileData.indexOf("data:")===0)) lost.push(a.name||a.id);
      }
      try{ var io=window.amiyoGetIO&&window.amiyoGetIO(); if(io&&(io.i!=null||io.o!=null)) p.io={i:io.i,o:io.o}; else delete p.io; }catch(e){ window.__swl&&window.__swl(e); }
      p.savedWith=window.AMIYO_EDITOR_BUILD||"";
      var blob=new Blob([JSON.stringify(p)],{type:"application/json"});
      var fname=(window.amiyoSafeFileName?window.amiyoSafeFileName(project.metadata&&project.metadata.name||"amiyo-edit"):(project.metadata.name||"amiyo-edit"))+".amiyovideo";
      var url=URL.createObjectURL(blob), el=document.createElement("a"); el.href=url; el.download=fname; document.body.appendChild(el); el.click(); el.remove(); setTimeout(function(){ URL.revokeObjectURL(url); },8000);
      window.__amiyoLastProjectFile={name:fname,bytes:blob.size,missing:lost.slice()};
      if(lost.length) say("Saved \u201c"+fname+"\u201d, but "+lost.length+" media file"+(lost.length>1?"s are":" is")+" no longer on this device ("+names(lost)+"). The project will open with that media missing; import it again to relink.",9000);
      return true;
    }catch(e){
      say("Could not save the project file ("+((e&&e.message)||"out of memory")+"). Try removing large media first.",7000);
      return false;
    }
  };
  window.loadProjectFile=function(file){
    return new Promise(function(done){
      if(window.__amiyoExporting){ say("An export is running. Open the project when it has finished."); return done(false); }
      if(!file){ return done(false); }
      var fr=new FileReader();
      fr.onerror=function(){ say("Could not read \u201c"+(file.name||"that file")+"\u201d. Check that it is still on this device and try again.",6000); done(false); };
      fr.onload=async function(){
        var p;
        try{ p=JSON.parse(fr.result); }
        catch(e){ say("\u201c"+(file.name||"That file")+"\u201d is not a project file (it cannot be read). Choose a .amiyovideo file saved from Amiyo Studio.",7000); return done(false); }
        if(!p||typeof p!=="object"||Array.isArray(p)||!Array.isArray(p.tracks)){ say("\u201c"+(file.name||"That file")+"\u201d is not an Amiyo project (it has no timeline). Choose a .amiyovideo file saved from Amiyo Studio.",7000); return done(false); }
        var newer=(Number(p.schemaVersion)||0)>SCHEMA_MAX;
        try{
          var io=p.io; delete p.io; delete p.savedWith;
          if(window.AMIYO_STUDIO_CORE&&window.AMIYO_STUDIO_CORE.normalizeProject) p=window.AMIYO_STUDIO_CORE.normalizeProject(p);
          await window.amiyoAdoptAssets(p);
          try{ if(window.amiyoSnapNow) window.amiyoSnapNow("before opening a project",true); }catch(e){ window.__swl&&window.__swl(e); }
          try{ if(typeof pause==="function") pause(); }catch(e){ window.__swl&&window.__swl(e); }
          restoreSerializable(p);
          try{ currentTime=0; }catch(e){ window.__swl&&window.__swl(e); }
          try{ window.amiyoSetIO(null,null); if(io&&(io.i!=null||io.o!=null)){ var d=getProjectDuration(); window.amiyoSetIO(io.i==null?null:Math.max(0,Math.min(d,+io.i)), io.o==null?null:Math.max(0,Math.min(d,+io.o))); } }catch(e){ window.__swl&&window.__swl(e); }
          try{ renderAll(); }catch(e){ window.__swl&&window.__swl(e); }
          scheduleAutosave();
          var miss=missingNames(project), nm=(project.metadata&&project.metadata.name)||"project";
          var clips=project.tracks.reduce(function(n,t){ return n+t.clips.length; },0);
          say("Opened \u201c"+nm+"\u201d: "+clips+" clip"+(clips===1?"":"s")+(miss.length?". Missing media: "+names(miss)+". Import again to relink.":"")+(newer?". It was made with a newer version, so some settings may be ignored.":""),miss.length||newer?9000:4000);
          done(true);
        }catch(e){
          window.__swl&&window.__swl(e);
          say("The project could not be opened ("+((e&&e.message)||"unknown problem")+"). The project you had open was not changed.",8000); done(false);
        }
      };
      fr.readAsText(file);
    });
  };
}catch(e){ try{ window.__swl&&window.__swl(e); }catch(x){} }})();

;
/* ==================== Script 1634 id="amiyo-export9-step11-build" ==================== */
try{ window.AMIYO_EDITOR_BUILD="export9-step11-project-roundtrip"; window.AMIYO_EXPORT9_STEP=11; }catch(e){}

;
/* ==================== Script 1635 id="amiyo-export9-step12-shotlist" ==================== */
/* Export plan step 12: shot list. Pr tools > "Export shot list" saves every picture clip of the edit (video and image clips on visible tracks; not text, adjustment layers, audio, hidden tracks or switched-off clips)
   in timeline order as a CSV (Excel / Sheets) or a printable page (.html): shot number, the chapter or marker it sits in, name, source file, type, track, start / end timecode, length, source in / out, speed and the markers that fall inside it. */
(function(){try{
  var kit=window.amiyoKit, X=window.amiyoExportLists; if(!kit||!X||window.amiyoShotList) return;
  function assetOf(c){ try{ return c.assetId?getAsset(c.assetId):null; }catch(e){ return null; } }
  function nm(c){ var a=assetOf(c); return c.name||(a&&a.name)||"Clip"; }
  function srcOut(c){ var si=c.inPoint||0; return (typeof c.outPoint==="number"&&isFinite(c.outPoint))?c.outPoint:si+(c.duration||0)*(c.speed||1); }
  function shots(){
    var tr=project.tracks||[], rows=[], mk=X.markers(), star=mk.filter(function(m){ return m.chapter; }), scenes=star.length?star:mk;
    tr.forEach(function(t,ti){ if(t.kind!=="video"||t.hidden||t.isAdjustmentTrack) return;
      (t.clips||[]).forEach(function(c){ if(c.off||c.kind==="text"||c.kind==="adjustment"||c.kind==="caption") return; rows.push({c:c,t:t,ti:ti}); }); });
    rows.sort(function(a,b){ return ((a.c.start||0)-(b.c.start||0))||(a.ti-b.ti); });
    return rows.map(function(r,i){
      var c=r.c, s=c.start||0, d=c.duration||0, e=s+d, a=assetOf(c), sc="", notes=[];
      scenes.forEach(function(m){ if(m.time<=s+.001) sc=X.oneLine(m.label,"Chapter"); });
      mk.forEach(function(m){ if(m.time>=s-.001&&m.time<e-.001) notes.push(X.tc(m.time)+" "+X.oneLine(m.label,"Marker")); });
      var sp=c.speed||1, si=c.inPoint||0;
      return {n:i+1,scene:sc,name:nm(c),file:(a&&a.name)||"",type:c.kind||(a&&a.type)||r.t.kind,track:r.t.name||r.t.id,start:s,end:e,dur:d,
        startTC:X.tc(s),endTC:X.tc(e),durTC:X.tc(d),inTC:X.tc(si),outTC:X.tc(c.freeze?si:srcOut(c)),speed:c.freeze?0:sp,notes:notes.join("; ")};
    });
  }
  var H=["Shot","Scene","Name","Source file","Type","Track","Start TC","End TC","Duration (s)","Duration TC","Source in TC","Source out TC","Speed","Markers inside"];
  function cells(r){ return [r.n,r.scene,r.name,r.file,r.type,r.track,r.startTC,r.endTC,r.dur.toFixed(3),r.durTC,r.inTC,r.outTC,r.speed,r.notes]; }
  function csv(){ var L=shots(); return [H.map(X.cell).join(",")].concat(L.map(function(r){ return cells(r).map(X.cell).join(","); })).join("\r\n")+"\r\n"; }
  function esc(v){ return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function html(){
    var L=shots(), title=String((project.metadata&&project.metadata.name)||"Amiyo edit"), tot=L.reduce(function(a,r){ return a+r.dur; },0);
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title)+' - shot list</title>'+
      '<style>body{font:14px/1.45 system-ui,sans-serif;margin:18px;color:#111;background:#fff}h1{font-size:20px;margin:0 0 4px}p{margin:0 0 12px;color:#555}.w{overflow-x:auto}table{border-collapse:collapse;width:100%;min-width:720px}th,td{border:1px solid #ccc;padding:5px 7px;text-align:left;vertical-align:top}th{background:#f1f1f1;font-size:12px}td.n{white-space:nowrap}@media print{.w{overflow:visible}body{margin:8mm}table{min-width:0;font-size:11px}tr{break-inside:avoid}}</style></head><body><h1>'+esc(title)+' - shot list</h1><p>'+
      L.length+' shot'+(L.length===1?"":"s")+', '+X.tc(tot)+' of picture at '+(Math.round(X.rate()*1000)/1000)+' fps'+(X.drop()?' (drop-frame)':'')+'.</p><div class="w"><table><thead><tr>'+H.map(function(h){ return '<th>'+esc(h)+'</th>'; }).join("")+'</tr></thead><tbody>'+
      L.map(function(r){ return '<tr>'+cells(r).map(function(v,i){ return '<td'+(i===0||(i>=6&&i<=11)?' class="n"':'')+'>'+esc(v)+'</td>'; }).join("")+'</tr>'; }).join("")+'</tbody></table></div></body></html>';
  }
  var sh=kit.sheet("akShotList","\uD83C\uDFAC Export shot list",function(){
    var L=shots(), tot=L.reduce(function(a,r){ return a+r.dur; },0);
    return '<div class="note">'+(L.length?L.length+" shot"+(L.length===1?"":"s")+", "+X.tc(tot)+" of picture. Every picture clip on a visible video track, in timeline order. Text, adjustment layers, audio, hidden tracks and switched-off clips are not listed.":"No picture clips on a visible video track yet.")+'</div>'+
      (L.length?'<div class="g"><button type="button" data-k="csv">Save as CSV (spreadsheet)</button><button type="button" data-k="html">Save as printable page (.html)</button></div>':"");
  },function(k){
    var L=shots(); if(!L.length){ kit.say("No picture clips to list yet"); return; }
    if(k==="csv"){ var n=X.base()+"-shot-list.csv"; X.save(n,csv(),"text/csv"); kit.say(n+" saved ("+L.length+" shots)"); }
    else if(k==="html"){ var m=X.base()+"-shot-list.html"; X.save(m,html(),"text/html"); kit.say(m+" saved ("+L.length+" shots)"); }
  });
  window.amiyoShotList={open:sh.open,shots:shots,csv:csv,html:html};
  kit.menu("\uD83C\uDFAC Export shot list",sh.open,"Export shot list","amiyoShotList.open()");
}catch(e){ try{ window.__swl&&window.__swl(e); }catch(x){} }})();

;
/* ==================== Script 1636 id="amiyo-export9-step12-verified" ==================== */
/* Export plan step 12 of 20 (markers, chapters, shot list and cut list), checked in headless Chrome by saving every file through its own button and reading it back; cut list EDL and CSV were also imported again (Import EDL, Import cut list) at 25, 29.97 and 30 fps and the clips came back with the same start, length, source in/out and speed.
   Checked and right: marker CSV / SRT / list, YouTube chapters (txt), Markers panel list, WebVTT, FFmpeg metadata, Podcast JSON, chapter CSV, cut list CSV, EDL; names with commas, quotes, Bengali and accents; empty project; image clips; hidden tracks; project rates 25, 29.97, 30.
   Faults found and fixed: (1) the Chapter export sheet (WebVTT, FFmpeg, Podcast JSON, CSV) never opened: the YouTube chapters sheet had already taken its name (amiyoChapters), so it stopped at its first line; it is amiyoChapterExport now. (2) Marker CSV timecode at 29.97 fps was garbage (00:00:09:29.27000000000001); all lists share one timecode that follows the project rate (drop-frame at 29.97 / 59.94, 24-count at 23.976). (3) The marker list wrote 61:40 after an hour (YouTube needs 1:01:40). (4) Marker SRT and list kept markers after the end of the edit (one cue ran 16 s to 1:39); a range marker now keeps its own length; YouTube chapters sheet drops markers after the end. (5) Beat markers were in the marker files; they are left out now. (6) The EDL listed an adjustment layer as a video clip. (7) CSV files without a byte-order mark (marker, chapter) showed Bengali, Hindi and accents wrongly in Excel; a name that starts with = + - @ is kept as text. (8) File names: the marker files turned non-Latin letters into underscores and used a different pattern; all lists use the project name like the video export. (9) Any .srt / .vtt was renamed "name.en.srt" with the caption language, also marker SRT and chapter VTT (a Bengali caption setting would have made "chapters.bn.vtt"); only real captions get the language now. (10) A renamed clip could not be matched again when its cut list was imported: the CSV has a "Source file" column and the EDL writes the source file as the clip name (the clip name goes in a comment); Import cut list skips adjustment rows. (11) EDL speed line used 30 not the real rate (60.0 for 2x at 29.97); freeze frames now write speed 0.
   New: Pr tools > Export shot list (CSV or printable page): every picture clip on a visible track in timeline order with shot number, chapter, name, source file, timecodes, length, source in/out, speed and the markers inside.
   Not tested here: a thumbnail column in the shot list (not made), real NLE import of the EDL (Premiere, Resolve), 23.976 / 59.94 drop-frame files in another editor, a very long project (step 17). */window.AMIYO_EXPORT9_STEP=12;

;
/* ==================== Script 1637 id="amiyo-export9-step12-build" ==================== */
try{ window.AMIYO_EDITOR_BUILD="export9-step12-lists"; window.AMIYO_EXPORT9_STEP=12; }catch(e){}

;
/* ==================== Script 1638 id="amiyo-export16-keep-state" ==================== */
/* Export plan step 16 of 20 (export does not change the project: undo, playhead, autosave).
   Checked in headless Chrome with real exports (fast and live recorder, WAV, GIF, image sequence, still frame, cancel, pause/resume) by comparing
   the whole project, the undo list and redo steps, playhead, selection, In/Out, autosave and the saved copy before and after each one.
   Right already: project, undo list (and the redo steps), In/Out, selection, saved copy and autosave stayed the same after every export type.
   Faults found and fixed: (1) keys still edited the project during an export (Delete, Ctrl+Z, Ctrl+D, M, I, O, S, Space) - now locked, see the first
   script in the head (11 keys re-tested: none change anything; Esc still asks "Stop the export?" and a second Esc keeps exporting); (2) if the preview was playing when Start was pressed, playback kept running while the export set up and the playhead
   came back to a random place: playback is now stopped at the moment of Start, so the playhead comes back to exactly where Start was pressed (8.862 s in, 8.862 s out), and a safety net puts playhead and selection back after the export; (3) the Background blur panel's Darken slider and its two buttons never worked (a stray id). */
(function(){try{
  if(window.__x16keep) return; window.__x16keep=1;
  var keep=null, seen=false, falseSince=0, armedAt=0;
  var STARTS="#expGo,#gifGo,#seqGo,#wvGo,#rqStartBtn";
  function exporting(){ try{ return !!(window.__amiyoExporting||window.__amExporting); }catch(e){ return false; } }
  function clipExists(id){ try{ return project.tracks.some(function(t){ return t.clips.some(function(c){ return c.id===id; }); }); }catch(e){ return false; } }
  document.addEventListener("click",function(e){
    var b=e.target&&e.target.closest&&e.target.closest(STARTS); if(!b) return;
    try{ if(typeof isPlaying!=="undefined"&&isPlaying&&typeof pause==="function") pause(); }catch(x){ window.__swl&&window.__swl(x); }
    if(b.id==="expGo"){ try{ keep={t:currentTime,sel:selectedClipId,selT:selectedTrackId}; seen=false; falseSince=0; armedAt=Date.now(); }catch(x){ keep=null; } }
  },true);
  setInterval(function(){
    if(!keep) return;
    if(exporting()){ seen=true; falseSince=0; return; }
    if(!seen){ if(Date.now()-armedAt>45000) keep=null; return; }   /* the export never started (a check stopped it) */
    if(!falseSince){ falseSince=Date.now(); return; }
    if(Date.now()-falseSince<450) return;                           /* let the exporter finish its own clean-up first */
    var k=keep; keep=null; seen=false;
    try{
      var changed=false;
      if(Math.abs(currentTime-k.t)>0.0005){ currentTime=k.t; changed=true; }
      if(k.sel&&selectedClipId!==k.sel&&clipExists(k.sel)){ selectedClipId=k.sel; selectedTrackId=k.selT; changed=true; }
      if(changed){ try{ if(typeof updateTimeUI==="function") updateTimeUI(); }catch(x){} try{ renderAll(); }catch(x){ window.__swl&&window.__swl(x); } }
    }catch(x){ window.__swl&&window.__swl(x); }
  },500);
}catch(e){ try{ window.__swl&&window.__swl(e); }catch(x){} }})();

;
/* ==================== Script 1639 id="amiyo-export16-build" ==================== */
try{ window.AMIYO_EDITOR_BUILD="export16-step16-keep-state"; window.AMIYO_EXPORT_PLAN_STEP=16; }catch(e){}

;
/* ==================== Script 1640 id="amiyo-export17-verified" ==================== */
/* Export plan step 17 of 20 (long edits and many clips), checked with real exports (headless Chrome, VP9) read back with ffprobe/ffmpeg.
   Right already: 120 clips of 0.25 s (all 120 cuts show the right colour); 600 clips of 0.1 s with fade transitions, brightness effects, 200 picture-in-picture clips, 120 text clips and 13 audio clips over 60 s (540 checked base clips and all 200 overlays right, audio continuous, length 60.02 s); a 9 s range deep inside a 60-minute, 1200-clip edit (blue, red, green at the right times); 1000 clips with 130 edits kept memory low (the undo list is limited by a memory budget on purpose).
   Fault found and fixed: two overlay helpers (the keyframe path drawing and the ruler-mark hiding) kept measuring the page while an export ran, about 10 to 13 % of export time; both now do nothing during an export.
   Not tested here: a full-length 30+ minute export (too slow in this sandbox), storage-full autosave on a very large project. */window.AMIYO_EXPORT_PLAN_STEP=17;

;
/* ==================== Script 1641 id="amiyo-export17-build" ==================== */
try{ window.AMIYO_EDITOR_BUILD="export17-step17-many-clips"; }catch(e){}

;
/* ==================== Script 1642 id="amiyo-export18-verified" ==================== */
/* Export plan step 18 of 20 (queue, cancel, pause and resume, re-checked), checked with real exports and real queue runs (headless Chrome), files read back with ffprobe.
   Right: Pause stops the picture and the progress (6 % stayed 6 % for 4 s, playhead did not move) and Resume carries on to a full 10.02 s file; the project, playhead and undo list were the same afterwards. Cancel asks "Stop the export?", Stop export saves nothing, clears every export flag, shows "Export cancelled", and a new export started right after finished normally. Export queue (Queue button): 3 jobs named j1, j2, j3, cancelling the running job 2 gave "Cancelled, nothing saved" and the queue carried on to job 3 (files j1.webm and j3.webm); Pause works inside a queue job; Stop queue ends the running job ("Stopped by you") and leaves the rest waiting with nothing downloaded; Cancel on the progress card cancels only that job and the next one runs; Retry then Start queue finishes the cancelled job (m1.webm).
   No fault found in this step, so nothing was changed. */window.AMIYO_EXPORT_PLAN_STEP=18;

;
/* ==================== Script 1643 id="amiyo-export18-build" ==================== */
try{ window.AMIYO_EDITOR_BUILD="export18-step18-queue-checked"; }catch(e){}

;
/* ==================== Script 1644 id="amiyo-export19-verified" ==================== */
/* Export plan step 19 of 20 (dialog wording and the ready screen), checked by reading every line of the Export dialog, the progress card and the ready screen in headless Chrome after real exports.
   Faults found and fixed (wording only): (1) the Format area said the same thing twice when this browser cannot make MP4 with sound ("Auto makes WebM..." and "Auto will save a WebM here...") - the second line now only adds what is new (a WebM plays in browsers and VLC; for an MP4 with sound use Chrome, Edge or Safari); (2) the size was written twice with different words ("Up to about 722 KB (one file) - the most it should weigh..." and "File size: up to about 722 KB as WebM; often smaller") - the first line is now short; (3) Loudness "Off" said "Sound is exported as mixed." - now "Sound is exported exactly as it is mixed.".
   Right already: the ready screen (file name, size, "saved to your Downloads folder", Save again, Done, and the plain reason when Auto saved a WebM), the progress card (percent, time left, Pause, Cancel), the "Will make" line and the size lines agree after a change of size or preset.
   Seen, left: with a preset chosen the bitrate stays the preset's (for example Tiny 1.0 Mbps) when the size chip is changed to Full HD, as the dialog says ("Use the Quality chips to go smaller or larger"). */window.AMIYO_EXPORT_PLAN_STEP=19;

;
/* ==================== Script 1645 id="amiyo-export19-build" ==================== */
try{ window.AMIYO_EDITOR_BUILD="export19-step19-wording"; }catch(e){}

;
/* ==================== Script 1646 id="amiyo-export-r2-step02-verified" ==================== */
/* Export plan round 2, step 2 of 20 (multi-layer: picture-in-picture, blend modes, transitions), checked with real exports through the Export dialog (640x360, 30 fps MP4) and measured from the saved frames. Picture-in-picture (scale 0.4, top right): position and edges exact, nothing outside the box. All 16 blend modes over a red base with a green overlay matched the browser's own compositing within 6 levels. All 83 transitions (red clip into blue clip, 1 s): every one starts pure red, ends pure blue, and shows a real change in the middle. No change was needed. */try{window.AMIYO_EDITOR_BUILD="export-r2-step02-multilayer";}catch(e){}

;
/* ==================== Script 1647 id="amiyo-export-r2-step03-verified" ==================== */
/* Export plan round 2, step 3 of 20 (text and captions: burned in versus SRT/VTT), checked with real exports and real SRT/VTT downloads. Burned in: a title shows only for its own time, captions switch on time, Hindi, accents and emoji draw correctly, a line break typed in a caption is kept. Fixed: a very long caption took most of the picture, so it now shrinks until it uses at most half of the height (preview and export alike). Fixed: SRT now writes a literal --> inside caption text as -> so players do not read it as a timing line (VTT already escaped it). SRT and VTT files: correct times, blank lines inside a caption removed, & and < escaped in VTT, UTF-8 intact. */try{window.AMIYO_EDITOR_BUILD="export-r2-step03-captions";}catch(e){}

;
/* ==================== Script 1648 id="amiyo-export-r2-step04-verified" ==================== */
/* Export plan round 2, step 4 of 20 (audio: mix, fades, pan, loudness, audio-only WAV/MP3), checked with real renders of a 440 Hz and an 880 Hz tone and measured from the saved sound. Fades are exactly linear (fade-in levels matched the ideal ramp), clip and track volumes add up correctly, hard-left and hard-right pan put the whole sound in one ear at the right level, the 16 LUFS target landed on -16.0 LUFS, WAV in mono or stereo at 16/24/32 bit and 44.1/48 kHz has the right size and length, MP3 (192 kbps) decodes to the same levels and pan, and the same edit inside a real video export gave the same fades, pan and levels. No change was needed. */try{window.AMIYO_EDITOR_BUILD="export-r2-step04-audio";}catch(e){}

;
/* ==================== Script 1649 id="amiyo-perf-state" ==================== */
/* Speed: the page used to ask the browser to work out ":has(...)" rules again after almost every change (about half of all style work while playing).
   These small classes carry the same state (welcome screen showing, a dialog open, media bin empty ...) and are updated only when the page structure changes. Same looks, same behaviour. */
(function(){try{
  if(window.__pfState) return; window.__pfState=1;
  var T=0;
  function tg(e,c,on){ if(e&&e.classList.contains(c)!==!!on) e.classList.toggle(c,!!on); }
  function sync(){ T=0; try{
    var b=document.body; if(!b) return;
    var mb=document.getElementById("modalBackdrop"), modal=!!(mb&&/grid/.test(mb.getAttribute("style")||""));
    tg(b,"pf-modal",modal); tg(b,"pf-modal-ml",modal&&!!mb.querySelector("#mlBody")); tg(b,"pf-modal-sl",modal&&!!mb.querySelector("#slBody"));
    var wo=document.querySelector(".welcome-overlay:not(.hide)"); tg(b,"pf-welcome",!!wo);
    var pw=document.querySelectorAll(".preview-wrap"); for(var i=0;i<pw.length;i++) tg(pw[i],"pf-welcome",!!pw[i].querySelector(".welcome-overlay:not(.hide)"));
    var mbody=document.getElementById("modalBody"); if(mbody){ tg(mbody,"pf-seq",!!mbody.querySelector("#seqInfo")); tg(mbody,"pf-gif",!!mbody.querySelector("#gifInfo")); }
    var lp=document.getElementById("leftPanel");
    if(lp){
      var grids=lp.querySelectorAll(".asset-grid"), hasAsset=false;
      for(var g=0;g<grids.length&&!hasAsset;g++) if(grids[g].querySelector(".asset")) hasAsset=true;
      tg(lp,"pf-has-grid",grids.length>0); tg(lp,"pf-has-asset",hasAsset);
      var rows=lp.querySelectorAll(".mini-row"); for(var r=0;r<rows.length;r++){ tg(rows[r],"pf-mr-bin",!!rows[r].querySelector("#newBinBtn")); tg(rows[r],"pf-mr-sel",!!rows[r].querySelector("select")); }
      var ib=document.getElementById("importBtn"); if(ib&&lp.contains(ib)&&ib.parentElement) tg(ib.parentElement,"pf-imp",/^(DIV|SECTION)$/.test(ib.parentElement.tagName));
    }
  }catch(e){ window.__swl&&window.__swl(e); } }
  function soon(){ if(!T) T=setTimeout(sync,40); }
  var watched=new WeakSet();
  function watch(){ try{
    var a=[document.getElementById("modalBackdrop")]; [].forEach.call(document.querySelectorAll(".welcome-overlay"),function(e){a.push(e);});
    a.forEach(function(e){ if(!e||watched.has(e)) return; watched.add(e); new MutationObserver(soon).observe(e,{attributes:true,attributeFilter:["style","class"]}); });
  }catch(e){} }
  new MutationObserver(function(){ watch(); soon(); }).observe(document.documentElement,{childList:true,subtree:true});
  watch(); sync();
  document.addEventListener("DOMContentLoaded",function(){ watch(); sync(); });
  window.addEventListener("load",function(){ watch(); sync(); setTimeout(sync,600); });
}catch(e){}})();

;
/* ==================== Script 1650 id="amiyo-pv1-stable-preview" ==================== */
/* Preview step 1 of 5: the preview no longer changes size by itself.
   Cause: on phones the timeline height was a share of the screen height (dvh). The phone's address bar and keyboard bar slide in and out, the screen
   height changes by a few pixels, and the picture jumped bigger and smaller each time (and the picture was re-fitted every time).
   Now: after the page settles, the timeline height is measured once and held as a fixed number of pixels. A change of screen height only (address bar)
   is ignored. Turning the phone, or a real change of width, measures again. The picture keeps one size until the user changes it. */
(function(){"use strict";
if(window.AMIYO_PV1) return;
var root=document.documentElement, ctr=null, tl=null, lastW=0, fixed=0, timer=0;
function find(){ ctr=document.querySelector("#amiyoMain .center")||document.querySelector(".center"); tl=ctr&&ctr.querySelector(":scope>.timeline"); return !!(ctr&&tl); }
function small(){ try{ return matchMedia("(max-width:1024px)").matches; }catch(e){ return innerWidth<=1024; } }
function isColumn(){ var cs=getComputedStyle(ctr); return small()&&cs.display==="flex"&&cs.flexDirection==="column"; }
function limits(){ var H=ctr.getBoundingClientRect().height; return [Math.min(120,H*.25),Math.max(140,H-150)]; }
function clampPx(px){ var b=limits(); return Math.round(Math.max(b[0],Math.min(b[1],px))); }
function release(){ root.style.removeProperty("--pv-tl"); if(ctr) ctr.classList.remove("pv-col"); fixed=0; }
function measureAndHold(){
  if(!find()) return;
  if(!isColumn()){ release(); lastW=innerWidth; return; }
  root.style.removeProperty("--pv-tl"); ctr.classList.remove("pv-col");   /* let the normal rules give their natural height once */
  var natural=tl.getBoundingClientRect().height;
  if(!(natural>60)){ lastW=innerWidth; return; }
  fixed=clampPx(natural); root.style.setProperty("--pv-tl",fixed+"px"); ctr.classList.add("pv-col"); lastW=innerWidth;
}
function onResize(){
  clearTimeout(timer);
  timer=setTimeout(function(){
    if(!find()) return;
    if(Math.abs(innerWidth-lastW)>=2||!fixed||(small()&&!ctr.classList.contains("pv-col"))) { measureAndHold(); return; }   /* turned the phone, or a real width change */
    var c=clampPx(fixed); if(c!==fixed){ fixed=c; root.style.setProperty("--pv-tl",fixed+"px"); }   /* height only: keep the size, just never let it exceed the room */
  },220);
}
addEventListener("resize",onResize);
try{ addEventListener("orientationchange",function(){ setTimeout(measureAndHold,350); }); }catch(e){}
[1400,3200].forEach(function(d){ setTimeout(function(){ if(!fixed) measureAndHold(); },d); });
window.AMIYO_PV1={hold:measureAndHold,release:release,get:function(){ return fixed; },set:function(px,quiet){ if(!find()||!isColumn()) return 0; fixed=clampPx(px); root.style.setProperty("--pv-tl",fixed+"px"); ctr.classList.add("pv-col"); if(!quiet) window.dispatchEvent(new Event("resize")); return fixed; }};
try{ window.AMIYO_EDITOR_BUILD="pv-step01-stable-preview"; }catch(e){}
})();

;
/* ==================== Script 1651 id="amiyo-pv2-handle" ==================== */
/* Preview step 2 of 5: a drag handle between the preview and the timeline. Drag it up and the timeline grows (the preview gets smaller); drag it down
   and the preview gets bigger. It is 24 px tall so a thumb can hold it. In phone landscape (preview on the left, timeline on the right) it sits between
   them and works sideways. Arrow keys also move it when it has focus. On a big screen the existing splitter above the timeline is used instead. */
(function(){"use strict";
if(window.AMIYO_PV2) return;
var ctr=null,tl=null,pw=null,h=null,mode="",raf=0,pend=null,g=null,root=document.documentElement;
function find(){ ctr=document.querySelector("#amiyoMain .center")||document.querySelector(".center"); tl=ctr&&ctr.querySelector(":scope>.timeline"); pw=ctr&&ctr.querySelector(":scope>.preview-wrap"); return !!(ctr&&tl&&pw); }
function small(){ try{ return matchMedia("(max-width:1024px)").matches; }catch(e){ return innerWidth<=1024; } }
function build(){
  if(h||!find()) return;
  h=document.createElement("div"); h.id="pvHandle"; h.setAttribute("role","separator"); h.tabIndex=0;
  h.setAttribute("aria-label","Resize preview. Drag, or use the arrow keys"); h.title="Drag to make the preview bigger or smaller";
  ctr.insertBefore(h,tl);
  h.addEventListener("pointerdown",down); h.addEventListener("keydown",key);
}
function detect(){
  if(!find()) return; build();
  var cs=getComputedStyle(ctr), m="";
  if(small()&&cs.display==="flex") m=cs.flexDirection==="row"?"row":"col";
  if(m===mode&&h.parentNode===ctr) { return; }
  mode=m;
  ctr.classList.toggle("pv-row",m==="row"); ctr.classList.toggle("pv-col",m==="col"&&!!window.AMIYO_PV1&&window.AMIYO_PV1.get()>0||ctr.classList.contains("pv-col")&&m==="col");
  h.classList.toggle("pv-v",m==="row");
  h.setAttribute("aria-orientation",m==="row"?"vertical":"horizontal");
  if(m==="row"){ var w=pw.getBoundingClientRect().width; setW(w); } else { root.style.removeProperty("--pv-pw"); }
  if(m==="col"&&window.AMIYO_PV1&&!window.AMIYO_PV1.get()) window.AMIYO_PV1.hold();
}
function setW(px,quiet){ var W=ctr.getBoundingClientRect().width; px=Math.round(Math.max(140,Math.min(W-200,px))); root.style.setProperty("--pv-pw",px+"px"); if(!quiet) window.dispatchEvent(new Event("resize")); return px; }
function apply(v){
  if(mode==="col"&&window.AMIYO_PV1) window.AMIYO_PV1.set(v,true);
  else if(mode==="row") setW(v,true);
}
function down(e){
  if(!mode||(e.button!=null&&e.button>0)) return; e.preventDefault();
  var v=mode==="row", start=v?pw.getBoundingClientRect().width:tl.getBoundingClientRect().height;
  g={id:e.pointerId,p0:v?e.clientX:e.clientY,s0:start,v:v};
  try{ h.setPointerCapture(e.pointerId); }catch(x){}
  h.classList.add("drag"); document.body.classList.add("pv-dragging"); if(v) document.body.classList.add("pv-dragging-v");
  h.addEventListener("pointermove",move); h.addEventListener("pointerup",up); h.addEventListener("pointercancel",up);
}
function move(e){
  if(!g||e.pointerId!==g.id) return;
  pend=g.v?g.s0+(e.clientX-g.p0):g.s0+(g.p0-e.clientY);   /* row: preview width grows to the right; column: timeline grows upward */
  if(!raf) raf=requestAnimationFrame(function(){ raf=0; if(pend!=null){ apply(pend); pend=null; } });
}
function up(e){
  if(!g) return; if(raf){ cancelAnimationFrame(raf); raf=0; } if(pend!=null){ apply(pend); pend=null; }
  h.classList.remove("drag"); document.body.classList.remove("pv-dragging","pv-dragging-v");
  h.removeEventListener("pointermove",move); h.removeEventListener("pointerup",up); h.removeEventListener("pointercancel",up);
  try{ h.releasePointerCapture(g.id); }catch(x){} g=null;
  window.dispatchEvent(new Event("resize"));   /* one refit of the picture when the finger lifts */
}
function key(e){
  if(!mode) return; var k=e.key, d=0, v=mode==="row";
  if(v){ if(k==="ArrowRight") d=24; else if(k==="ArrowLeft") d=-24; }
  else { if(k==="ArrowUp") d=24; else if(k==="ArrowDown") d=-24; }   /* column: up = bigger timeline */
  if(!d) return; e.preventDefault();
  var cur=v?pw.getBoundingClientRect().width:tl.getBoundingClientRect().height; apply(cur+d); window.dispatchEvent(new Event("resize"));
}
var t=0; addEventListener("resize",function(){ clearTimeout(t); t=setTimeout(detect,260); });
try{ addEventListener("orientationchange",function(){ setTimeout(detect,450); }); }catch(e){}
[1800,3600,6000].forEach(function(d){ setTimeout(detect,d); });
window.AMIYO_PV2={detect:detect,mode:function(){ return mode; }};
try{ window.AMIYO_EDITOR_BUILD="pv-step02-handle"; }catch(e){}
})();

;
/* ==================== Script 1652 id="amiyo-pv3-remember" ==================== */
/* Preview step 3 of 5: the handle remembers your size, and a double-tap on it resets the size.
   Saved as a share of the screen (not pixels), separately for portrait (timeline height) and landscape (preview width), so it still fits after turning the phone.
   Double-tap (or double-click, or press Home / Enter on the focused handle) = back to the normal size and the saved size is cleared. */
(function(){"use strict";
if(window.AMIYO_PV3) return;
var KEY="amiyo_pv_size_v1", root=document.documentElement, ctr=null, tl=null, pw=null, h=null, lastKey="", tapT=0, tapX=0, tapY=0, d0=null, saveT=0, toastT=0, toast=null;
function find(){ ctr=document.querySelector("#amiyoMain .center")||document.querySelector(".center"); tl=ctr&&ctr.querySelector(":scope>.timeline"); pw=ctr&&ctr.querySelector(":scope>.preview-wrap"); h=document.getElementById("pvHandle"); return !!(ctr&&tl&&pw&&h); }
function mode(){ try{ return window.AMIYO_PV2?window.AMIYO_PV2.mode():""; }catch(e){ return ""; } }
function load(){ try{ var o=JSON.parse(localStorage.getItem(KEY)||"{}"); return o&&typeof o==="object"?o:{}; }catch(e){ return {}; } }
function store(o){ try{ localStorage.setItem(KEY,JSON.stringify(o)); }catch(e){ try{ window.__swl&&window.__swl(e); }catch(x){} } }
function say(t){
  if(!toast){ toast=document.createElement("div"); toast.id="pvToast"; toast.setAttribute("role","status");
    toast.style.cssText="position:fixed;left:50%;bottom:calc(76px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:2147483000;padding:8px 14px;border-radius:999px;background:#201d1a;color:#f3ede6;border:1px solid #ff7a30;font:600 13px system-ui,sans-serif;pointer-events:none;opacity:0;transition:opacity .15s";
    document.body.appendChild(toast); }
  toast.textContent=t; toast.style.opacity="1"; clearTimeout(toastT); toastT=setTimeout(function(){ toast.style.opacity="0"; },1300);
}
function save(){
  if(!find()) return; var m=mode(); if(!m) return; var o=load(), c=ctr.getBoundingClientRect(), f;
  if(m==="col") f=tl.getBoundingClientRect().height/c.height; else f=pw.getBoundingClientRect().width/c.width;
  if(!(f>0.05&&f<0.95)) return; o[m]=Math.round(f*10000)/10000; store(o);
}
function applySaved(){
  if(!find()) return false; var m=mode(); if(!m) return false; var f=load()[m]; if(!(f>0.05&&f<0.95)) return false; var c=ctr.getBoundingClientRect();
  if(m==="col"){ if(!window.AMIYO_PV1) return false; window.AMIYO_PV1.set(f*c.height,true); }
  else { var px=Math.round(Math.max(140,Math.min(c.width-200,f*c.width))); root.style.setProperty("--pv-pw",px+"px"); }
  window.dispatchEvent(new Event("resize")); return true;
}
function reset(){
  if(!find()) return; var m=mode(); if(!m) return; var o=load(); delete o[m]; store(o);
  if(m==="col"){ if(window.AMIYO_PV1) window.AMIYO_PV1.hold(); }
  else { ctr.classList.remove("pv-row"); root.style.removeProperty("--pv-pw"); var w=pw.getBoundingClientRect().width, W=ctr.getBoundingClientRect().width;
    ctr.classList.add("pv-row"); root.style.setProperty("--pv-pw",Math.round(Math.max(140,Math.min(W-200,w)))+"px"); }
  window.dispatchEvent(new Event("resize")); say("Preview size reset");
}
function later(){ clearTimeout(saveT); saveT=setTimeout(save,90); }   /* after step 2 has applied the final size */
function wire(){
  if(!find()||h.__pv3) return; h.__pv3=1;
  h.addEventListener("pointerdown",function(e){ d0={x:e.clientX,y:e.clientY,t:Date.now()}; });
  h.addEventListener("pointerup",function(e){
    if(!d0) return; var now=Date.now(), tap=Math.abs(e.clientX-d0.x)<8&&Math.abs(e.clientY-d0.y)<8&&now-d0.t<350; d0=null;
    if(!tap){ tapT=0; later(); return; }
    if(now-tapT<400&&Math.abs(e.clientX-tapX)<32&&Math.abs(e.clientY-tapY)<32){ tapT=0; reset(); }
    else { tapT=now; tapX=e.clientX; tapY=e.clientY; }
  });
  h.addEventListener("pointercancel",function(){ d0=null; later(); });
  h.addEventListener("keydown",function(e){ var k=e.key; if(k==="Home"||k==="Enter"){ e.preventDefault(); reset(); } else if(/^Arrow/.test(k)) later(); });
}
function maybeApply(){
  if(!find()) return; wire(); var m=mode(); if(!m||document.body.classList.contains("pv-dragging")) return;
  var key=m+":"+innerWidth; if(key===lastKey) return; lastKey=key; applySaved();   /* only when the mode or width really changed, not for the address bar */
}
var rt=0; addEventListener("resize",function(){ clearTimeout(rt); rt=setTimeout(maybeApply,700); });
try{ addEventListener("orientationchange",function(){ setTimeout(maybeApply,900); }); }catch(e){}
[2200,3900,6300].forEach(function(d){ setTimeout(maybeApply,d); });
window.AMIYO_PV3={wire:wire,save:save,apply:applySaved,reset:reset,get:load};
try{ window.AMIYO_EDITOR_BUILD="pv-step03-remember"; }catch(e){}
})();

;
/* ==================== Script 1653 id="amiyo-pv4-size-buttons" ==================== */
/* Preview step 4 of 5: quick size buttons on the picture (S, M, L, Full). One tap sets the preview to a share of the screen:
   S = 28%, M = 42%, L = 58%, Full = as big as it can get (the timeline shrinks to its smallest). The size is remembered like a drag (step 3).
   Shown on phones and tablets in portrait and landscape, where the drag handle is. The active size lights up. */
(function(){"use strict";
if(window.AMIYO_PV4) return;
var P={S:.28,M:.42,L:.58,F:1}, NAMES={S:"Small",M:"Medium",L:"Large",F:"Full"}, root=document.documentElement, ctr=null, tl=null, pw=null, bar=null, rt=0;
function find(){ ctr=document.querySelector("#amiyoMain .center")||document.querySelector(".center"); tl=ctr&&ctr.querySelector(":scope>.timeline"); pw=ctr&&ctr.querySelector(":scope>.preview-wrap"); return !!(ctr&&tl&&pw); }
function mode(){ try{ return window.AMIYO_PV2?window.AMIYO_PV2.mode():""; }catch(e){ return ""; } }
function share(){ var c=ctr.getBoundingClientRect(), m=mode(); if(m==="col") return 1-tl.getBoundingClientRect().height/c.height; if(m==="row") return pw.getBoundingClientRect().width/c.width; return -1; }
function mark(){
  if(!bar||!find()) return; var s=share(), best="", bd=9;
  if(s>0){ if(s>=.8) best="F"; else Object.keys(P).forEach(function(k){ if(k==="F") return; var d=Math.abs(P[k]-s); if(d<bd&&d<.05){ bd=d; best=k; } }); }
  Array.prototype.forEach.call(bar.children,function(b){ var on=b.dataset.k===best; b.classList.toggle("on",on); b.setAttribute("aria-pressed",on?"true":"false"); });
}
function setSize(k){
  if(!find()) return; var m=mode(), c=ctr.getBoundingClientRect(), p=P[k]; if(!m) return;
  if(m==="col"){ if(!window.AMIYO_PV1) return; window.AMIYO_PV1.set(k==="F"?0:Math.round(c.height*(1-p)),true); }
  else { root.style.setProperty("--pv-pw",Math.round(Math.max(140,Math.min(c.width-200,c.width*p)))+"px"); }
  window.dispatchEvent(new Event("resize"));
  setTimeout(function(){ try{ window.AMIYO_PV3&&window.AMIYO_PV3.save(); }catch(e){} mark(); },140);
}
function build(){
  if(bar||!find()) return; var st=pw.querySelector(".preview-stage")||pw;
  bar=document.createElement("div"); bar.className="pv-sizes"; bar.id="pvSizes"; bar.setAttribute("role","group"); bar.setAttribute("aria-label","Preview size");
  [["S","S"],["M","M"],["L","L"],["F","Full"]].forEach(function(a){
    var b=document.createElement("button"); b.type="button"; b.dataset.k=a[0]; b.textContent=a[1]; b.title=NAMES[a[0]]+" preview"; b.setAttribute("aria-label",NAMES[a[0]]+" preview");
    b.addEventListener("click",function(e){ e.stopPropagation(); setSize(a[0]); });
    bar.appendChild(b);
  });
  ["pointerdown","touchstart","dblclick"].forEach(function(t){ bar.addEventListener(t,function(e){ e.stopPropagation(); },{passive:true}); });
  st.appendChild(bar); mark();
}
function later(){ clearTimeout(rt); rt=setTimeout(function(){ build(); mark(); },400); }
addEventListener("resize",later); try{ addEventListener("orientationchange",function(){ setTimeout(mark,1000); }); }catch(e){}
document.addEventListener("pointerup",function(e){ if(e.target&&e.target.id==="pvHandle") setTimeout(mark,200); },true);
document.addEventListener("keyup",function(e){ if(e.target&&e.target.id==="pvHandle") setTimeout(mark,200); },true);
[1000,2400,4200,6600].forEach(function(d){ setTimeout(function(){ build(); mark(); },d); });
window.AMIYO_PV4={set:setSize,mark:mark};
try{ window.AMIYO_EDITOR_BUILD="pv-step04-size-buttons"; }catch(e){}
})();

;
/* ==================== Script 1654 id="am-pv-engine" ==================== */
/* Step 1: stop the automatic resizing. Auto-grow (more tracks), layout presets, the 44% start height and the vh/dvh clamp()
   rules all fought over the same space. Now only this engine decides: AMPV.set(0.12 .. 0.9) = share of the column used by the preview. */
(function(){"use strict";
if(window.AMPV) return;
try{ localStorage.setItem("amiyo.autogrow","0"); }catch(e){}
try{ window.AMIYO_AUTOGROW&&window.AMIYO_AUTOGROW.set(false); }catch(e){}
var SIDE=matchMedia("(max-width:1024px) and (max-height:520px) and (orientation:landscape)");
var PHONE=matchMedia("(max-width:1024px)");
var DEF={stack:.52,phone:.42,side:.46}, MIN=.12, MAX=.9, f=.5, ev={}, raf=0;
function mode(){ return SIDE.matches?"side":"stack"; }
function key(){ return SIDE.matches?"side":(PHONE.matches?"phone":"stack"); }
function def(){ return DEF[key()]; }
function clamp(v){ v=+v; if(!(v===v)) v=def(); return Math.min(MAX,Math.max(MIN,v)); }
function emit(n,a){ (ev[n]||[]).slice().forEach(function(fn){ try{ fn(a); }catch(e){ try{console.warn("AMPV",e);}catch(x){} } }); }
var lt=0;
function refit(live){
  if(live){ if(lt) return; lt=setTimeout(function(){ lt=0; try{ window.dispatchEvent(new Event("resize")); }catch(e){} },220); return; }   /* while dragging: only a rare, light refit */
  if(lt){ clearTimeout(lt); lt=0; }
  if(raf) return; raf=requestAnimationFrame(function(){ raf=0;
  try{ window.dispatchEvent(new Event("resize")); }catch(e){}
  try{ if(typeof window.renderAll==="function") window.renderAll(); }catch(e){} }); }
function set(v,o){ o=o||{}; f=clamp(v); document.documentElement.style.setProperty("--am-f",f.toFixed(4)); refit(!!o.live); emit("change",{f:f,user:!!o.user,final:!!o.final,key:key()}); return f; }
function onMode(){ set(def()); emit("mode",{key:key(),mode:mode()}); }
function on(n,fn){ (ev[n]=ev[n]||[]).push(fn); }
function stop(){ try{ var c=document.querySelector(".center"); if(c&&c.style.gridTemplateRows) c.style.gridTemplateRows=""; }catch(e){} }
window.AMPV={set:set,get:function(){return f;},def:def,key:key,mode:mode,on:on,MIN:MIN,MAX:MAX,reset:function(o){ return set(def(),o); }};
[SIDE,PHONE].forEach(function(m){ (m.addEventListener?m.addEventListener("change",onMode):m.addListener(onMode)); });
set(def()); stop(); setTimeout(stop,1200); setTimeout(stop,4000);
try{ window.AMIYO_EDITOR_BUILD="preview-size-step1-no-auto-resize"; }catch(e){}
})();

;
/* ==================== Script 1655 id="am-pv-handle" ==================== */
/* Step 2: a drag handle between the preview and the timeline. 36 px thick (finger-sized), works with touch, pen and mouse, and with arrow keys. */
(function(){"use strict";
if(window.AMPV_HANDLE) return;
function init(){
  var A=window.AMPV, c=document.querySelector(".center"), tl=c&&c.querySelector(":scope>.timeline"), pw=c&&c.querySelector(":scope>.preview-wrap");
  if(!A||!c||!tl||!pw){ return setTimeout(init,300); }
  var h=document.createElement("div"); h.id="amPvHandle"; h.className="am-pvh"; h.tabIndex=0; h.setAttribute("role","separator");
  h.setAttribute("aria-label","Resize preview and timeline (drag, or use arrow keys)"); h.title="Drag to make the preview bigger or smaller";
  var g=document.createElement("div"); g.className="am-pvg"; h.appendChild(g);
  c.insertBefore(h,tl);
  function side(){ return A.mode()==="side"; }
  function aria(){ h.setAttribute("aria-orientation",side()?"vertical":"horizontal"); h.setAttribute("aria-valuemin","12"); h.setAttribute("aria-valuemax","90"); h.setAttribute("aria-valuenow",String(Math.round(A.get()*100))); }
  A.on("change",aria); A.on("mode",aria); aria();
  h.addEventListener("pointerdown",function(e){
    if(e.target.closest&&e.target.closest(".am-pvq")) return;
    if(e.pointerType==="mouse"&&e.button!==0) return;
    e.preventDefault();
    var s=side(), rp=pw.getBoundingClientRect(), rt=tl.getBoundingClientRect();
    var total=s?(rp.width+rt.width):(rp.height+rt.height); if(total<50) return;
    var p0=s?e.clientX:e.clientY, f0=A.get(), id=e.pointerId, moved=false;
    try{ h.setPointerCapture(id); }catch(x){}
    h.classList.add("drag"); document.body.classList.add("am-pv-drag");
    function pos(ev){ return s?ev.clientX:ev.clientY; }
    function mv(ev){ if(ev.pointerId!==id) return; ev.preventDefault(); if(Math.abs(pos(ev)-p0)>2) moved=true; A.set(f0+(pos(ev)-p0)/total,{user:true,live:true}); }
    function up(ev){ if(ev.pointerId!==id) return;
      h.removeEventListener("pointermove",mv); h.removeEventListener("pointerup",up); h.removeEventListener("pointercancel",up); h.removeEventListener("lostpointercapture",up);
      h.classList.remove("drag"); document.body.classList.remove("am-pv-drag"); try{ h.releasePointerCapture(id); }catch(x){}
      if(moved) A.set(A.get(),{user:true,final:true});   /* one full redraw at the end */ }   /* a plain tap changes nothing, so nothing is saved */
    h.addEventListener("pointermove",mv); h.addEventListener("pointerup",up); h.addEventListener("pointercancel",up); h.addEventListener("lostpointercapture",up);
  });
  h.addEventListener("keydown",function(e){
    var st=e.shiftKey?.1:.03, k=e.key, d=0, s=side();
    if(k===(s?"ArrowLeft":"ArrowUp")) d=-st; else if(k===(s?"ArrowRight":"ArrowDown")) d=st;
    else if(k==="Home") { e.preventDefault(); A.set(A.MIN,{user:true,final:true}); return; } else if(k==="End"){ e.preventDefault(); A.set(A.MAX,{user:true,final:true}); return; } else return;
    e.preventDefault(); A.set(A.get()+d,{user:true,final:true});
  });
  /* other scripts add panels into .center: keep the handle right before the timeline */
  var busy=false; try{ new MutationObserver(function(){ if(busy) return; var t=c.querySelector(":scope>.timeline"); if(t&&h.nextElementSibling!==t){ busy=true; c.insertBefore(h,t); busy=false; } }).observe(c,{childList:true}); }catch(e){}
  window.AMPV_HANDLE=h;
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
})();

;
/* ==================== Script 1656 id="am-pv-remember" ==================== */
/* Step 3: remembers your size (separately for desktop, phone-portrait and phone-landscape) and double-tap / double-click on the handle resets it. */
(function(){"use strict";
var A=window.AMPV; if(!A||window.AMPV_STORE) return;
var SK="amiyo.preview.size.v1";
function read(){ try{ var o=JSON.parse(localStorage.getItem(SK)||"{}"); return (o&&typeof o==="object")?o:{}; }catch(e){ return {}; } }
function write(o){ try{ localStorage.setItem(SK,JSON.stringify(o)); }catch(e){} }
function say(m){ try{ if(typeof window.toast==="function") window.toast(m); }catch(e){} }
function load(){ var v=read()[A.key()]; if(typeof v==="number"&&v>=A.MIN&&v<=A.MAX) A.set(v); }
A.on("change",function(a){ if(a&&a.user&&a.final){ var o=read(); o[a.key]=+a.f.toFixed(4); write(o); } });
A.on("mode",load); load();
function reset(){ var o=read(); delete o[A.key()]; write(o); A.reset(); say("Preview size reset"); }
function wire(){ var h=window.AMPV_HANDLE; if(!h) return setTimeout(wire,300);
  var last=0,lx=0,ly=0,sx=0,sy=0;
  h.addEventListener("pointerdown",function(e){ if(e.target.closest&&e.target.closest(".am-pvq")) return; sx=e.clientX; sy=e.clientY; });
  h.addEventListener("pointerup",function(e){ if(e.target.closest&&e.target.closest(".am-pvq")) return;
    if(Math.abs(e.clientX-sx)>10||Math.abs(e.clientY-sy)>10){ last=0; return; }   /* it was a drag, not a tap */
    var t=Date.now();
    if(t-last<380&&Math.abs(e.clientX-lx)<32&&Math.abs(e.clientY-ly)<32){ last=0; reset(); } else { last=t; lx=e.clientX; ly=e.clientY; }
  });
  h.addEventListener("dblclick",function(e){ if(e.target.closest&&e.target.closest(".am-pvq")) return; e.preventDefault(); reset(); });
  h.title="Drag to resize · double-tap to reset";
}
wire(); window.AMPV_STORE={reset:reset};
})();

;
/* ==================== Script 1657 id="am-pv-quick" ==================== */
/* Step 4: quick size buttons - Small, Medium, Large, Full. Full keeps a thin timeline strip so you can always drag back. */
(function(){"use strict";
var A=window.AMPV; if(!A||window.AMPV_QUICK) return;
var P=[["Small","S",.25],["Medium","M",.45],["Large","L",.65],["Full","Full",.9]];
function init(){ var h=window.AMPV_HANDLE; if(!h) return setTimeout(init,300);
  var q=document.createElement("div"); q.className="am-pvq"; q.setAttribute("role","group"); q.setAttribute("aria-label","Preview size");
  var bs=P.map(function(p){ var b=document.createElement("button"); b.type="button"; b.textContent=p[1]; b.title=p[0]+" preview"; b.setAttribute("aria-label",p[0]+" preview");
    b.addEventListener("click",function(e){ e.stopPropagation(); A.set(p[2],{user:true,final:true}); });
    b.addEventListener("pointerdown",function(e){ e.stopPropagation(); });
    q.appendChild(b); return b; });
  h.appendChild(q);
  function mark(){ var v=A.get(), hit=-1, best=.04; P.forEach(function(p,i){ var d=Math.abs(p[2]-v); if(d<best){ best=d; hit=i; } });
    bs.forEach(function(b,i){ b.classList.toggle("on",i===hit); b.setAttribute("aria-pressed",String(i===hit)); }); }
  A.on("change",mark); A.on("mode",mark); mark(); window.AMPV_QUICK=q;
}
init();
})();

;
/* ==================== Script 1658 id="am-lag-meter" ==================== */
/* Lag step 1: built-in performance meter (off by default, zero cost while hidden). Show/hide: tap the "Canvas Preview" badge 5 times, or Alt+Shift+P.
   Shows FPS, the longest freeze in the last 5 s, and how many background timers the governors skipped. Use it to see exactly when lag happens. */
(function(){"use strict";
if(window.AMPERF) return;
var box=null, on=false, frames=[], raf=0, long=[], po=null;
function build(){ box=document.createElement("div"); box.id="amPerfBox";
  box.style.cssText="position:fixed;left:6px;top:calc(env(safe-area-inset-top,0px) + 6px);z-index:2147483000;padding:5px 8px;border-radius:8px;background:rgba(0,0,0,.78);color:#9fffb0;font:600 11px/1.35 ui-monospace,Menlo,monospace;pointer-events:none;white-space:pre"; document.body.appendChild(box); }
function bootLine(){ var f=window.AM_FASTBOOT, r=f&&f.timing; if(!r) return ""; var s="\nReady at "+r.readyAtMs+" ms (scripts "+r.scriptsMs+" ms)"; r.top.slice(0,3).forEach(function(x){ s+="\n  "+x[0].slice(0,26)+" "+x[1]+" ms"; }); return s; }
function loop(t){ if(!on) return; frames.push(t); while(frames.length&&t-frames[0]>1000) frames.shift();
  var now=performance.now(); long=long.filter(function(x){return now-x.t<5000;});
  var worst=long.reduce(function(m,x){return Math.max(m,x.d);},0), g=window.__amiyoGov||{};
  if(box) box.textContent="FPS "+frames.length+"   freeze "+Math.round(worst)+" ms\ntimers skipped "+(g.skipped||0)+"  DOM batches "+(g.moBatches||0)+(document.documentElement.classList.contains("am-lite")?"\nSmooth mode ON":"")+bootLine();
  raf=requestAnimationFrame(loop); }
function show(v){ on=(v===undefined)?!on:!!v;
  if(on){ if(!box) build(); box.style.display=""; frames=[]; try{ po=new PerformanceObserver(function(l){ l.getEntries().forEach(function(e){ long.push({t:e.startTime,d:e.duration}); }); }); po.observe({entryTypes:["longtask"]}); }catch(e){}
    raf=requestAnimationFrame(loop); }
  else{ if(box) box.style.display="none"; try{ po&&po.disconnect(); }catch(e){} po=null; cancelAnimationFrame(raf); } return on; }
window.AMPERF={show:show};
addEventListener("keydown",function(e){ if(e.altKey&&e.shiftKey&&e.code==="KeyP"){ e.preventDefault(); show(); } });
var taps=[]; document.addEventListener("click",function(e){ var b=e.target&&e.target.closest&&e.target.closest("#engineBadge"); if(!b) return; var t=Date.now(); taps=taps.filter(function(x){return t-x<2000;}); taps.push(t); if(taps.length>=5){ taps=[]; show(); } },true);
})();

;
/* ==================== Script 1659 id="am-lag-render" ==================== */
/* Lag step 2: renderAll() is called from 340+ places and often several times in one tap. The first call still runs at once; any further
   calls in the same frame are merged into ONE redraw on the next frame. Exports and calls that pass arguments are never touched. */
(function(){"use strict";
function wrap(){
  var orig=window.renderAll; if(typeof orig!=="function"||orig.__amCo) return false;
  var last=0, pend=0, count={merged:0};
  var w=function(){
    if(window.__amiyoExporting||arguments.length) return orig.apply(this,arguments);
    var now=performance.now(), self=this;
    if(!pend && now-last>=16){ last=now; return orig.apply(this,arguments); }
    count.merged++;
    if(!pend) pend=requestAnimationFrame(function(){ pend=0; last=performance.now(); try{ orig.call(self); }catch(e){ try{console.error(e);}catch(x){} } });
  };
  w.__amCo=count; window.renderAll=w; window.AMIYO_RENDER_MERGED=count; return true;
}
var n=0, iv=setInterval(function(){ if(wrap()||++n>40) clearInterval(iv); },500); wrap();
})();

;
/* ==================== Script 1660 id="am-lag-img" ==================== */
/* Lag step 6: pictures in the media library and panels load lazily and decode off the main thread, so opening a big library no longer freezes the screen.
   The preview and timeline pictures are left exactly as they were. */
(function(){"use strict";
function fix(img){ try{ if(!img||img.tagName!=="IMG"||img.__amImg) return; img.__amImg=1;
  if(img.closest&&img.closest(".preview-wrap,#canvasShell,.timeline,.am-fsb,#pr59-boot")) return;
  if(!img.hasAttribute("decoding")) img.decoding="async"; if(!img.hasAttribute("loading")&&!img.complete) img.loading="lazy"; }catch(e){} }
function scan(root){ try{ (root||document).querySelectorAll("img").forEach(fix); }catch(e){} }
function init(){ scan(); var tgt=[document.getElementById("leftPanel"),document.querySelector(".inspector-col"),document.querySelector(".inspector"),document.body].filter(Boolean);
  var seen=new Set(); tgt.slice(0,3).forEach(function(t){ if(seen.has(t)) return; seen.add(t);
    try{ new MutationObserver(function(recs){ for(var i=0;i<recs.length;i++){ var a=recs[i].addedNodes; for(var j=0;j<a.length;j++){ var n=a[j]; if(n.nodeType!==1) continue; if(n.tagName==="IMG") fix(n); else if(n.querySelectorAll) scan(n); } } }).observe(t,{childList:true,subtree:true}); }catch(e){} }); }
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
})();

;
/* ==================== Script 1661 id="am-lag-hidden" ==================== */
/* Lag step 7: when the editor tab is in the background, every CSS animation is paused too (the app already pauses its timers). */
(function(){"use strict";
var st=document.createElement("style"); st.id="am-lag-hidden-css"; st.textContent="html.am-hidden *,html.am-hidden *::before,html.am-hidden *::after{animation-play-state:paused!important}"; (document.head||document.documentElement).appendChild(st);
function sync(){ document.documentElement.classList.toggle("am-hidden",!!document.hidden); }
document.addEventListener("visibilitychange",sync); sync();
})();

;
/* ==================== Script 1662 id="am-lag-lite" ==================== */
(function(){"use strict";
var K="amiyo.lite", H=document.documentElement;
function pref(){ try{ return localStorage.getItem(K)||"auto"; }catch(e){ return "auto"; } }
function setPref(v){ try{ localStorage.setItem(K,v); }catch(e){} }
function say(m){ try{ if(typeof window.toast==="function") window.toast(m); }catch(e){} }
function apply(on){ H.classList.toggle("am-lite",!!on); }
var p=pref(); if(p==="1") apply(true);
var active=0, frames=[], running=false, bad=0;
function bump(){ active=performance.now(); if(!running&&!H.classList.contains("am-lite")&&pref()==="auto"&&!document.hidden){ running=true; frames=[]; requestAnimationFrame(tick); } }
function tick(t){
  if(!running) return;
  if(performance.now()-active>1500||document.hidden){ running=false; bad=0; return; }       /* only measure while you are touching/scrolling */
  if(frames.length){ var d=t-frames[frames.length-1]; if(d<500) frames.push(t); else frames=[t]; } else frames.push(t);
  if(frames.length>=30){ var span=frames[frames.length-1]-frames[0], avg=span/(frames.length-1);
    if(avg>50){ if(++bad>=2){ apply(true); running=false; say("Smooth mode on - shadows and fades simplified"); return; } } else bad=0; frames=[]; }
  requestAnimationFrame(tick);
}
["pointerdown","pointermove","touchmove","wheel","scroll"].forEach(function(ev){ addEventListener(ev,bump,{capture:true,passive:true}); });
window.AMPERF=window.AMPERF||{};
window.AMPERF.lite=function(v){ if(v===undefined) return H.classList.contains("am-lite"); setPref(v===true?"1":v===false?"0":"auto"); apply(v===true); return v; };
})();

;
/* ==================== Script 1663 id="am-pro-ui" ==================== */
/* Amiyo Studio Pro interface - steps 1..20 */
(function(){"use strict";
/* PRO 01 - core helpers + professional theme layer */
var P=window.AMPRO=window.AMPRO||{};
P.$=function(s,r){return (r||document).querySelector(s)};
P.$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
P.get=function(k,d){try{var v=localStorage.getItem('ampro.'+k);return v==null?d:JSON.parse(v)}catch(e){return d}};
P.set=function(k,v){try{localStorage.setItem('ampro.'+k,JSON.stringify(v))}catch(e){}};
P.css=function(id,t){var o=document.getElementById('ampro-css-'+id);if(o)o.remove();var s=document.createElement('style');s.id='ampro-css-'+id;s.textContent=t;document.head.appendChild(s)};
P.click=function(id){var e=document.getElementById(id);if(e){e.click();return true}return false};
P.el=function(h){var d=document.createElement('div');d.innerHTML=h.trim();return d.firstChild};
P.toast=function(m){var t=P.$('#ampro-toast');if(!t){t=document.createElement('div');t.id='ampro-toast';document.body.appendChild(t)}t.textContent=m;t.classList.add('on');clearTimeout(P._tt);P._tt=setTimeout(function(){t.classList.remove('on')},1700)};
P.desktop=function(){return window.innerWidth>1024};
P.mods=P.mods||[];
P.reg=function(n,name,fn){var M={n:n,name:name,ok:null};P.mods.push(M);var run=function(){try{fn();M.ok=true}catch(e){M.ok=false;console.error('AMPRO '+n,e)}};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run()};
P.reg(1,'Pro theme',function(){
P.css('theme',
'*{scrollbar-width:thin;scrollbar-color:#3b362d transparent}'+
'::-webkit-scrollbar{width:9px;height:9px}::-webkit-scrollbar-thumb{background:#3b362d;border-radius:6px;border:2px solid transparent;background-clip:content-box}::-webkit-scrollbar-thumb:hover{background:#5a5245;background-clip:content-box}'+
':focus-visible{outline:2px solid var(--accent2);outline-offset:1px;border-radius:4px}'+
'.topbtn,.toolbtn,.navbtn{transition:background .12s,border-color .12s,color .12s,transform .06s}.topbtn:active,.toolbtn:active{transform:translateY(1px)}'+
'.topbar{background:linear-gradient(#15130f,#0c0b09)!important;box-shadow:0 1px 0 #000,0 6px 18px rgba(0,0,0,.35)}'+
'.preview-toolbar,.timeline-toolbar{background:linear-gradient(#15130f,#100f0c)!important}'+
'.section-title{letter-spacing:.14em;text-transform:uppercase;font-size:10px;color:#7d7464}'+
'.navbtn.active{box-shadow:inset 3px 0 0 var(--accent);background:linear-gradient(90deg,rgba(255,122,61,.14),transparent)!important}'+
'.tool-active{box-shadow:0 0 0 1px var(--accent) inset,0 0 10px rgba(255,122,61,.35)!important}'+
'.project-name{border-radius:6px;transition:background .15s,box-shadow .15s}.project-name:focus{background:#1c1a15;box-shadow:0 0 0 1px var(--accent)}'+
'#ampro-toast{position:fixed;left:50%;bottom:48px;transform:translate(-50%,12px);background:#1d1b16;color:var(--text);border:1px solid var(--accent-dim);padding:8px 14px;border-radius:8px;font:600 12px var(--font-body);z-index:2147483000;opacity:0;pointer-events:none;transition:.18s;box-shadow:var(--shadow)}#ampro-toast.on{opacity:1;transform:translate(-50%,0)}'+
'.ampro-badge{font:700 9px var(--font-mono);letter-spacing:.1em;color:#1a1008;background:linear-gradient(135deg,var(--accent2),var(--accent));padding:2px 6px;border-radius:5px;margin-left:6px;vertical-align:middle}');
var b=P.$('.brand b');if(b&&!P.$('.ampro-badge')){var s=document.createElement('span');s.className='ampro-badge';s.textContent='PRO';b.appendChild(s)}
});

/* PRO 02 - workspace presets */
P.reg(2,'Workspaces',function(){
P.css('ws','@media (min-width:1025px){.workspace{grid-template-columns:var(--am-l,250px) minmax(0,1fr) var(--am-r,300px)!important}.center{grid-template-rows:minmax(0,1fr) var(--am-tl,250px)!important}'+
'html[data-am-ws=review] .sidebar,html[data-am-ws=review] .inspector-col{visibility:hidden;overflow:hidden;border:0}}'+
'.am-ws{display:inline-flex;background:#0a0908;border:1px solid var(--line);border-radius:8px;padding:2px;gap:2px;margin-left:8px;flex:none}.am-ws button{background:none;border:0;color:var(--muted);font:600 11px var(--font-body);padding:4px 9px;border-radius:6px;cursor:pointer}.am-ws button:hover{color:var(--text)}.am-ws button.on{background:var(--accent);color:#1a1008}');
P.layout=function(l,r,t,save){var h=document.documentElement.style;if(l!=null)h.setProperty('--am-l',l+'px');if(r!=null)h.setProperty('--am-r',r+'px');if(t!=null)h.setProperty('--am-tl',t+'px');if(save!==false)P.set('layout',{l:P.cur('--am-l',250),r:P.cur('--am-r',300),t:P.cur('--am-tl',250)});document.dispatchEvent(new CustomEvent('ampro:layout'));window.dispatchEvent(new Event('resize'))};
P.cur=function(v,d){var x=parseFloat(getComputedStyle(document.documentElement).getPropertyValue(v));return isNaN(x)?d:x};
var W={edit:{l:250,r:300,t:250,nav:'media'},color:{l:250,r:360,t:190,nav:'color'},audio:{l:250,r:300,t:380,nav:'audio'},review:{l:0,r:0,t:170}};
P.workspace=function(n){var w=W[n];if(!w)return;document.documentElement.setAttribute('data-am-ws',n);P.layout(w.l,w.r,w.t,false);if(w.nav){var nb=P.$('.navbtn[data-panel="'+w.nav+'"]');if(nb)nb.click()}P.set('ws',n);P.$$('.am-ws button').forEach(function(b){b.classList.toggle('on',b.dataset.ws===n)});P.toast('Workspace: '+n[0].toUpperCase()+n.slice(1))};
var host=P.$('#saveStatus');if(host&&!P.$('.am-ws')){var d=P.el('<div class="am-ws" role="tablist" aria-label="Workspace">'+Object.keys(W).map(function(k){return '<button data-ws="'+k+'" role="tab">'+k[0].toUpperCase()+k.slice(1)+'</button>'}).join('')+'</div>');host.after(d);d.addEventListener('click',function(e){var b=e.target.closest('button');if(b)P.workspace(b.dataset.ws)})}
var s=P.get('ws','edit');document.documentElement.setAttribute('data-am-ws',s);P.$$('.am-ws button').forEach(function(b){b.classList.toggle('on',b.dataset.ws===s)});
document.addEventListener('keydown',function(e){if(e.altKey&&!e.ctrlKey&&/^[1-4]$/.test(e.key)){P.workspace(['edit','color','audio','review'][+e.key-1]);e.preventDefault()}});
});

/* PRO 03 - draggable panel resizers (persisted) */
P.reg(3,'Resizers',function(){
P.css('rs','.am-rs{position:absolute;z-index:8;background:transparent;transition:background .12s}.am-rs:hover,.am-rs.on{background:var(--accent)}.am-rs.v{width:5px;cursor:col-resize;top:0;bottom:0}.am-rs.h{height:5px;cursor:row-resize;left:0;right:0}@media (max-width:1024px){.am-rs{display:none}}');
var ws=P.$('.workspace');if(!ws)return;if(getComputedStyle(ws).position==='static')ws.style.position='relative';
var sv=P.get('layout');if(sv&&P.desktop())P.layout(sv.l,sv.r,sv.t,false);
var hs={l:P.el('<div class="am-rs v" title="Drag to resize · double-click to reset"></div>'),r:P.el('<div class="am-rs v" title="Drag to resize · double-click to reset"></div>'),t:P.el('<div class="am-rs h" title="Drag to resize timeline · double-click to reset"></div>')};
Object.keys(hs).forEach(function(k){ws.appendChild(hs[k])});
function pos(){if(!P.desktop())return;var w=ws.getBoundingClientRect(),sb=P.$('.sidebar').getBoundingClientRect(),ic=P.$('.inspector-col').getBoundingClientRect(),tl=P.$('.timeline');
hs.l.style.left=(sb.right-w.left-2)+'px';hs.r.style.left=(ic.left-w.left-3)+'px';if(tl){var tr=tl.getBoundingClientRect();hs.t.style.top=(tr.top-w.top-2)+'px';hs.t.style.left=(sb.right-w.left)+'px';hs.t.style.right=(w.right-ic.left)+'px'}}
var D={l:250,r:300,t:250};
Object.keys(hs).forEach(function(k){var h=hs[k];
h.addEventListener('pointerdown',function(e){e.preventDefault();h.setPointerCapture(e.pointerId);h.classList.add('on');var sx=e.clientX,sy=e.clientY,l=P.cur('--am-l',250),r=P.cur('--am-r',300),t=P.cur('--am-tl',250);
function mv(ev){if(k==='l')P.layout(Math.max(0,Math.min(520,l+ev.clientX-sx)),null,null,false);else if(k==='r')P.layout(null,Math.max(0,Math.min(620,r-(ev.clientX-sx))),null,false);else P.layout(null,null,Math.max(120,Math.min(innerHeight-260,t-(ev.clientY-sy))),false);pos()}
function up(){h.classList.remove('on');h.removeEventListener('pointermove',mv);h.removeEventListener('pointerup',up);P.layout(P.cur('--am-l',250),P.cur('--am-r',300),P.cur('--am-tl',250),true)}
h.addEventListener('pointermove',mv);h.addEventListener('pointerup',up)});
h.addEventListener('dblclick',function(){P.layout(k==='l'?D.l:null,k==='r'?D.r:null,k==='t'?D.t:null);pos()})});
P.resetLayout=function(){P.layout(D.l,D.r,D.t);document.documentElement.setAttribute('data-am-ws','edit');P.set('ws','edit');pos()};
document.addEventListener('ampro:layout',pos);addEventListener('resize',pos);setTimeout(pos,300);setTimeout(pos,1500);
});

/* PRO 04 - command palette (Ctrl/Cmd+K) */
P.reg(4,'Command palette',function(){
P.css('cp','#am-cp{position:fixed;inset:0;z-index:2147482000;background:rgba(0,0,0,.55);display:none;align-items:flex-start;justify-content:center;padding-top:12vh}#am-cp.on{display:flex}#am-cp .bx{width:min(560px,92vw);background:var(--panel2);border:1px solid var(--line);border-radius:12px;box-shadow:var(--shadow);overflow:hidden}#am-cp input{width:100%;box-sizing:border-box;background:#0c0b09;border:0;border-bottom:1px solid var(--line);color:var(--text);font:500 15px var(--font-body);padding:14px 16px;outline:0}#am-cp ul{list-style:none;margin:0;padding:6px;max-height:50vh;overflow:auto}#am-cp li{padding:8px 10px;border-radius:7px;font:500 13px var(--font-body);color:var(--text);cursor:pointer;display:flex;justify-content:space-between;gap:10px}#am-cp li small{color:var(--muted);font-family:var(--font-mono);font-size:10px}#am-cp li.on{background:var(--accent-dim)}');
var box=P.el('<div id="am-cp" role="dialog" aria-label="Command palette"><div class="bx"><input placeholder="Type a command…  (Ctrl+K)" aria-label="Command"><ul></ul></div></div>');document.body.appendChild(box);
var inp=P.$('input',box),ul=P.$('ul',box),items=[],sel=0;
P.cmds=P.cmds||[];P.cmd=function(name,fn,hint){P.cmds.push({n:name,f:fn,h:hint||''})};
function build(){var a=P.cmds.slice();P.$$('.topbtn,.toolbtn,.navbtn,.mbar button').forEach(function(b){var n=(b.getAttribute('title')||b.textContent||'').replace(/\s+/g,' ').trim();if(n&&n.length<70&&!b.closest('#am-cp'))a.push({n:(b.classList.contains('navbtn')?'Open panel: ':'')+n,f:function(){b.click()},h:''})});var seen={};return a.filter(function(c){if(seen[c.n])return false;seen[c.n]=1;return true})}
function draw(){var q=inp.value.toLowerCase().trim();items=build().filter(function(c){return !q||c.n.toLowerCase().indexOf(q)>-1}).slice(0,60);sel=Math.min(sel,Math.max(0,items.length-1));ul.innerHTML=items.map(function(c,i){return '<li class="'+(i===sel?'on':'')+'" data-i="'+i+'"><span>'+c.n.replace(/</g,'&lt;')+'</span><small>'+c.h+'</small></li>'}).join('')||'<li>No match</li>'}
function open(){box.classList.add('on');inp.value='';sel=0;draw();inp.focus()}function close(){box.classList.remove('on')}
P.palette=open;
document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();box.classList.contains('on')?close():open()}else if(box.classList.contains('on')){if(e.key==='Escape')close();else if(e.key==='ArrowDown'){sel=Math.min(items.length-1,sel+1);draw();e.preventDefault()}else if(e.key==='ArrowUp'){sel=Math.max(0,sel-1);draw();e.preventDefault()}else if(e.key==='Enter'&&items[sel]){var f=items[sel].f;close();setTimeout(f,10)}}},true);
inp.addEventListener('input',function(){sel=0;draw()});
ul.addEventListener('click',function(e){var li=e.target.closest('li[data-i]');if(li){var f=items[+li.dataset.i].f;close();setTimeout(f,10)}});box.addEventListener('mousedown',function(e){if(e.target===box)close()});
['edit','color','audio','review'].forEach(function(w,i){P.cmd('Workspace: '+w,function(){P.workspace&&P.workspace(w)},'Alt+'+(i+1))});
P.cmd('Reset layout',function(){P.resetLayout&&P.resetLayout()});
var tb=P.$('.topbtn#helpBtn');if(tb&&!P.$('#amCmdBtn')){var b=P.el('<button class="topbtn" id="amCmdBtn" title="Command palette (Ctrl+K)">⌘ Commands</button>');tb.before(b);b.onclick=open}
});

/* PRO 05 - timecode go-to + calibrated seek API */
P.reg(5,'Timecode',function(){
P.time=function(){var r=P.$('#timeReadout');if(!r)return {t:0,d:0};var m=r.textContent.match(/(\d+):(\d+(?:\.\d+)?)\s*\/\s*(\d+):(\d+(?:\.\d+)?)/);return m?{t:+m[1]*60+ +m[2],d:+m[3]*60+ +m[4]}:{t:0,d:0}};
function fire(el,x,y){['pointerdown','mousedown','pointerup','mouseup','click'].forEach(function(t){var C=t.indexOf('pointer')===0&&window.PointerEvent?PointerEvent:MouseEvent;el.dispatchEvent(new C(t,{bubbles:true,cancelable:true,clientX:x,clientY:y,button:0,buttons:t.indexOf('up')>-1||t==='click'?0:1,pointerId:1,isPrimary:true}))})}
P.cal=null;
P.calibrate=function(){var ru=P.$('#ruler'),sc=P.$('#timelineScroll');if(!ru||!sc)return null;var r=ru.getBoundingClientRect(),v=sc.getBoundingClientRect(),a=Math.max(r.left,v.left)+80,b=Math.min(r.right,v.right)-40;if(b-a<120)return null;var y=r.top+r.height/2;fire(ru,a,y);var ta=P.time().t;fire(ru,b,y);var tb=P.time().t;if(tb-ta<=0)return null;var pps=(b-a)/(tb-ta);P.cal={pps:pps,x0:a-ta*pps-r.left,z:(P.$('#timelineZoom')||{}).value};return P.cal};
P.px=function(t){var z=(P.$('#timelineZoom')||{}).value;if(!P.cal||P.cal.z!==z)P.calibrate();return P.cal?P.cal.x0+t*P.cal.pps:null};
P.seek=function(t){var ru=P.$('#ruler'),sc=P.$('#timelineScroll');if(!ru)return false;var x=P.px(t);if(x==null)return false;var r=ru.getBoundingClientRect(),v=sc.getBoundingClientRect(),cx=r.left+x;if(cx<v.left+60||cx>v.right-30){sc.scrollLeft+=cx-(v.left+v.width/2);r=ru.getBoundingClientRect();cx=r.left+x}fire(ru,cx,r.top+r.height/2);return true};
function parse(s){s=s.trim();if(!s)return null;if(/^\d+f$/i.test(s))return parseInt(s)/30;var p=s.split(':').map(parseFloat);if(p.some(isNaN))return null;return p.reduce(function(a,v){return a*60+v},0)}
var r=P.$('#timeReadout');if(r){r.style.cursor='text';r.title='Click to jump to a time (e.g. 12.5, 1:05, 90f)';r.addEventListener('click',function(){var v=prompt('Jump to time  (seconds, m:ss, or frames like 90f)',P.time().t.toFixed(2));var t=parse(v||'');if(t!=null){P.seek(Math.max(0,Math.min(P.time().d||1e9,t)))||P.toast('Zoom the timeline in view first')}})}
P.cmd&&P.cmd('Go to time…',function(){r&&r.click()});
});

/* PRO 06 - timeline zoom controls */
P.reg(6,'Zoom controls',function(){
var z=P.$('#timelineZoom');if(!z)return;
P.zoom=function(f,abs){var min=+z.min,max=+z.max,v=abs!=null?abs:Math.round(+z.value*f);v=Math.max(min,Math.min(max,v));z.value=v;['input','change'].forEach(function(t){z.dispatchEvent(new Event(t,{bubbles:true}))});upd()};
function upd(){var l=P.$('#amZoomLbl');if(l)l.textContent=Math.round(z.value)+' px/s'}
var lab=z.closest('label');if(lab&&!P.$('#amZoomOut')){var o=P.el('<button class="toolbtn" id="amZoomOut" title="Zoom out (Ctrl+−)">−</button>'),i=P.el('<button class="toolbtn" id="amZoomIn" title="Zoom in (Ctrl+=)">+</button>'),l=P.el('<span id="amZoomLbl" style="color:#7f8998;font:10px var(--font-mono);min-width:56px"></span>');lab.before(o);lab.after(i);i.after(l);o.onclick=function(){P.zoom(.7)};i.onclick=function(){P.zoom(1.4)};z.addEventListener('input',upd);upd()}
var sc=P.$('#timelineScroll');sc&&sc.addEventListener('wheel',function(e){if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();var ru=P.$('#ruler').getBoundingClientRect(),t=null;P.zoom(e.deltaY<0?1.18:.85)},{passive:false});
document.addEventListener('keydown',function(e){if(!(e.ctrlKey||e.metaKey)||/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName))return;if(e.key==='='||e.key==='+'){P.zoom(1.4);e.preventDefault()}else if(e.key==='-'){P.zoom(.7);e.preventDefault()}else if(e.key==='0'){P.click('fitTimelineBtn');e.preventDefault()}});
P.cmd&&(P.cmd('Timeline: zoom in',function(){P.zoom(1.4)},'Ctrl+='),P.cmd('Timeline: zoom out',function(){P.zoom(.7)},'Ctrl+−'),P.cmd('Timeline: fit all',function(){P.click('fitTimelineBtn')},'Ctrl+0'));
});

/* PRO 07 - timeline markers (M) */
P.reg(7,'Markers',function(){
var COL=['#ff7a3d','#5fd88a','#4aa8ff','#ffc857','#d97bff','#ff5c6c'],key=function(){return 'mk_'+((P.$('#projectName')||{}).value||'p')};
P.markers=P.get(key(),[]);
P.css('mk','.am-mk{position:absolute;top:0;bottom:0;width:0;z-index:5;cursor:pointer}.am-mk i{position:absolute;top:1px;left:-5px;width:10px;height:14px;clip-path:polygon(0 0,100% 0,100% 65%,50% 100%,0 65%);background:var(--c)}.am-mk b{position:absolute;top:2px;left:7px;font:600 9px var(--font-body);color:#fff;white-space:nowrap;text-shadow:0 1px 2px #000;opacity:.9}#am-mkl{position:fixed;right:16px;bottom:44px;width:260px;max-height:50vh;overflow:auto;background:var(--panel2);border:1px solid var(--line);border-radius:10px;z-index:2147481000;display:none;box-shadow:var(--shadow);padding:6px}#am-mkl.on{display:block}#am-mkl div{display:flex;gap:6px;align-items:center;padding:6px 8px;border-radius:6px;font:12px var(--font-body);cursor:pointer}#am-mkl div:hover{background:var(--panel3)}#am-mkl s{width:9px;height:9px;border-radius:50%;flex:none}#am-mkl em{margin-left:auto;font:10px var(--font-mono);color:var(--muted);font-style:normal}');
var list=P.el('<div id="am-mkl" role="dialog" aria-label="Markers"></div>');document.body.appendChild(list);
P.renderMarkers=function(){var ru=P.$('#ruler');if(!ru)return;P.$$('.am-mk',ru).forEach(function(n){n.remove()});if(getComputedStyle(ru).position==='static')ru.style.position='relative';P.markers.forEach(function(m){var x=P.px(m.t);if(x==null)return;var d=P.el('<div class="am-mk" style="left:'+x+'px;--c:'+m.c+'" title="'+m.n+' — click to jump"><i></i><b>'+m.n+'</b></div>');d.addEventListener('pointerdown',function(e){e.stopPropagation()});d.addEventListener('click',function(e){e.stopPropagation();P.seek(m.t)});ru.appendChild(d)})};
function save(){P.set(key(),P.markers);P.renderMarkers();drawList()}
P.addMarker=function(){var t=P.time().t,n=P.markers.length+1;P.markers.push({t:t,n:'M'+n,c:COL[(n-1)%COL.length]});P.markers.sort(function(a,b){return a.t-b.t});save();P.toast('Marker added at '+t.toFixed(2)+'s')};
function drawList(){list.innerHTML=P.markers.length?P.markers.map(function(m,i){return '<div data-i="'+i+'"><s style="background:'+m.c+'"></s>'+m.n+'<em>'+m.t.toFixed(2)+'s</em><button class="toolbtn" data-del="'+i+'" title="Delete">✕</button></div>'}).join(''):'<div style="color:var(--muted)">No markers yet — press M to drop one at the playhead.</div>'}
list.addEventListener('click',function(e){var d=e.target.closest('[data-del]');if(d){P.markers.splice(+d.dataset.del,1);save();return}var r=e.target.closest('[data-i]');if(r)P.seek(P.markers[+r.dataset.i].t)});
var tb=P.$('#toolSelect');var host=P.$('#addAdjustmentBtn');if(host&&!P.$('#amMkBtn')){var b=P.el('<button class="toolbtn" id="amMkBtn" title="Add marker (M) · Shift+click for list">⚑ Marker</button>');host.after(b);b.addEventListener('click',function(e){if(e.shiftKey){drawList();list.classList.toggle('on')}else P.addMarker()})}
document.addEventListener('keydown',function(e){if(e.key.toLowerCase()==='m'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||'')){P.addMarker()}});
var z=P.$('#timelineZoom');z&&z.addEventListener('input',function(){setTimeout(P.renderMarkers,60)});setTimeout(P.renderMarkers,800);
P.cmd&&(P.cmd('Add marker at playhead',P.addMarker,'M'),P.cmd('Show marker list',function(){drawList();list.classList.add('on')}));
});

/* PRO 08 - preview toolbar: start/end, loop, safe zones, fullscreen */
P.reg(8,'Preview tools',function(){
var tb=P.$('.preview-toolbar'),shell=P.$('#canvasShell'),ov=P.$('.preview-overlay');if(!tb||!shell)return;
P.css('pv','.am-safe{position:absolute;inset:0;pointer-events:none;display:none}.am-safe.on{display:block}.am-safe i{position:absolute;border:1px dashed rgba(255,200,87,.75)}.am-safe i:nth-child(1){inset:5%}.am-safe i:nth-child(2){inset:10%;border-color:rgba(95,216,138,.7)}.am-safe:after{content:"ACTION 90% · TITLE 80%";position:absolute;left:12%;top:10.4%;font:600 8px var(--font-mono);color:rgba(255,255,255,.55)}.toolbtn.on{background:var(--accent-dim)!important;border-color:var(--accent)!important}');
var safe=P.el('<div class="am-safe"><i></i><i></i></div>');(ov||shell).appendChild(safe);
var loop=false;
function mk(id,t,title,f){if(P.$('#'+id))return null;var b=P.el('<button class="toolbtn" id="'+id+'" title="'+title+'">'+t+'</button>');b.onclick=function(){f(b)};return b}
var play=P.$('#playBtn'),bs=[mk('amStart','⏮ Start','Go to start (Home)',function(){P.seek(0)}),mk('amEnd','End ⏭','Go to end (End)',function(){P.seek(Math.max(0,P.time().d-.04))}),mk('amLoop','⟲ Loop','Loop playback',function(b){loop=!loop;b.classList.toggle('on',loop);P.toast('Loop '+(loop?'on':'off'))}),mk('amSafe','▣ Safe','Title/action safe zones',function(b){safe.classList.toggle('on');b.classList.toggle('on')}),mk('amFull','⛶ Full','Fullscreen preview',function(){var f=shell.requestFullscreen||shell.webkitRequestFullscreen;f&&f.call(shell)})];
var ref=P.$('#nextFrameBtn');bs.forEach(function(b){b&&ref.after(b);ref=b||ref});
setInterval(function(){if(!loop||!play)return;var t=P.time();if(t.d&&t.t>=t.d-.06&&!/play/i.test(play.textContent)){P.seek(0);setTimeout(function(){if(/play/i.test(play.textContent))play.click()},120)}},250);
document.addEventListener('keydown',function(e){if(/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||'')||e.ctrlKey||e.metaKey)return;if(e.key==='Home'){P.seek(0);e.preventDefault()}else if(e.key==='End'){P.$('#amEnd').click();e.preventDefault()}});
P.cmd&&(P.cmd('Preview: loop on/off',function(){P.$('#amLoop').click()}),P.cmd('Preview: safe zones',function(){P.$('#amSafe').click()}),P.cmd('Preview: fullscreen',function(){P.$('#amFull').click()}),P.cmd('Go to start',function(){P.seek(0)},'Home'));
});

/* PRO 09 - playhead cap, hover time tooltip, follow-playhead */
P.reg(9,'Playhead & scrub',function(){
P.css('ph','.playhead::before{content:"";position:absolute;top:0;left:-6px;width:13px;height:11px;background:var(--accent);clip-path:polygon(0 0,100% 0,100% 55%,50% 100%,0 55%)}#am-tip{position:fixed;z-index:2147481500;pointer-events:none;background:#1d1b16;border:1px solid var(--accent-dim);color:var(--text);font:600 10px var(--font-mono);padding:3px 7px;border-radius:5px;display:none}.toolbtn.am-follow.on{background:var(--accent-dim);border-color:var(--accent)}');
var tip=P.el('<div id="am-tip"></div>');document.body.appendChild(tip);
var ru=P.$('#ruler');
function fmt(t){var m=Math.floor(t/60),s=t-m*60;return (m<10?'0':'')+m+':'+(s<10?'0':'')+s.toFixed(2)}
ru&&ru.addEventListener('mousemove',function(e){if(!P.cal)return;var r=ru.getBoundingClientRect(),t=(e.clientX-r.left-P.cal.x0)/P.cal.pps;if(t<0)return;tip.textContent=fmt(t);tip.style.left=(e.clientX+12)+'px';tip.style.top=(r.top-24)+'px';tip.style.display='block'});
ru&&ru.addEventListener('mouseleave',function(){tip.style.display='none'});
var follow=true,ph=P.$('#playhead'),sc=P.$('#timelineScroll'),host=P.$('#fitTimelineBtn');
if(host&&!P.$('#amFollow')){var b=P.el('<button class="toolbtn am-follow on" id="amFollow" title="Auto-scroll timeline to follow the playhead">⇥ Follow</button>');host.after(b);b.onclick=function(){follow=!follow;b.classList.toggle('on',follow)}}
setInterval(function(){if(!follow||!ph||!sc)return;var p=ph.getBoundingClientRect(),v=sc.getBoundingClientRect();if(p.width===0&&p.left===0)return;if(p.left>v.right-30)sc.scrollLeft+=p.left-v.left-80;else if(p.left<v.left-4&&p.left>0)sc.scrollLeft-=v.left-p.left+80},180);
});

/* PRO 10 - keyboard shortcuts overlay (?) */
P.reg(10,'Shortcuts',function(){
P.css('sk','#am-sk{position:fixed;inset:0;z-index:2147482000;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center}#am-sk.on{display:flex}#am-sk .bx{width:min(720px,94vw);max-height:80vh;overflow:auto;background:var(--panel2);border:1px solid var(--line);border-radius:14px;padding:18px 22px;box-shadow:var(--shadow)}#am-sk h2{margin:0 0 4px;font:700 16px var(--font-display)}#am-sk .g{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:4px 22px;margin-top:10px}#am-sk .r{display:flex;justify-content:space-between;gap:8px;font:12px var(--font-body);padding:4px 0;border-bottom:1px solid var(--line-soft)}#am-sk kbd{font:600 10px var(--font-mono);background:#0c0b09;border:1px solid var(--line);border-radius:4px;padding:1px 6px;color:var(--accent2)}#am-sk h4{margin:14px 0 0;font:700 10px var(--font-body);letter-spacing:.14em;color:var(--muted);text-transform:uppercase}');
var box=P.el('<div id="am-sk" role="dialog" aria-label="Keyboard shortcuts"><div class="bx"></div></div>');document.body.appendChild(box);
var PRO=[['Command palette','Ctrl+K'],['Workspaces Edit/Color/Audio/Review','Alt+1…4'],['Add marker','M'],['Go to start / end','Home / End'],['Zoom in / out / fit','Ctrl+= / − / 0'],['Ctrl+wheel on timeline','Zoom'],['Focus mode','Ctrl+Shift+F'],['Maximize timeline','Ctrl+\\'],['This help','?']];
function build(){var sh=[];P.$$('.toolbtn[title],.topbtn[title]').forEach(function(b){var m=b.title.match(/^(.*?)\s*[\(—-]\s*([A-Za-z0-9+\/ ]{1,14})\)?\s*$/);var m2=b.title.match(/^(.*?)\s*\(([^)]{1,18})\)/);var x=m2||m;if(x&&x[2]&&x[1])sh.push([x[1].trim(),x[2].trim()])});var seen={};sh=sh.filter(function(s){var k=s[0]+s[1];if(seen[k])return false;seen[k]=1;return true});
var row=function(a){return '<div class="r"><span>'+a[0].replace(/</g,'&lt;')+'</span><kbd>'+a[1]+'</kbd></div>'};
P.$('.bx',box).innerHTML='<h2>Keyboard shortcuts</h2><div style="color:var(--muted);font-size:12px">Press ? or Esc to close.</div><h4>Pro interface</h4><div class="g">'+PRO.map(row).join('')+'</div><h4>Editing tools</h4><div class="g">'+sh.map(row).join('')+'</div>'}
function toggle(){if(!box.classList.contains('on'))build();box.classList.toggle('on')}
P.shortcuts=toggle;
document.addEventListener('keydown',function(e){if(e.key==='Escape')box.classList.remove('on');else if(e.key==='?'&&!/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||'')){toggle();e.preventDefault()}});
box.addEventListener('mousedown',function(e){if(e.target===box)box.classList.remove('on')});
P.cmd&&P.cmd('Show keyboard shortcuts',toggle,'?');
});

/* PRO 11 - timeline right-click context menu */
P.reg(11,'Context menu',function(){
P.css('cm','#am-cm{position:fixed;z-index:2147482500;min-width:190px;background:var(--panel2);border:1px solid var(--line);border-radius:10px;box-shadow:var(--shadow);padding:5px;display:none}#am-cm.on{display:block}#am-cm button{display:flex;width:100%;justify-content:space-between;gap:16px;background:none;border:0;color:var(--text);font:500 12px var(--font-body);padding:7px 10px;border-radius:6px;cursor:pointer;text-align:left}#am-cm button:hover{background:var(--accent-dim)}#am-cm small{color:var(--muted);font:10px var(--font-mono)}#am-cm hr{border:0;border-top:1px solid var(--line);margin:4px 2px}');
var m=P.el('<div id="am-cm" role="menu"></div>');document.body.appendChild(m);
var A=[['Split at playhead','splitBtn','S'],['Duplicate','duplicateBtn',''],['Delete','deleteBtn','Del'],0,['Set In point','setInBtn','I'],['Set Out point','setOutBtn','O'],['Trim to In/Out','trimIOBtn'],0,['Add marker',function(){P.addMarker&&P.addMarker()},'M'],['Fit timeline','fitTimelineBtn','']];
function hide(){m.classList.remove('on')}
m.innerHTML=A.map(function(a,i){return a?'<button role="menuitem" data-i="'+i+'">'+a[0]+'<small>'+(a[2]||'')+'</small></button>':'<hr>'}).join('');
m.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var a=A[+b.dataset.i];hide();setTimeout(function(){typeof a[1]==='function'?a[1]():P.click(a[1])},10)});
var tl=P.$('.timeline');tl&&tl.addEventListener('contextmenu',function(e){if(e.defaultPrevented)return;var c=e.target.closest('.clip');if(!c)return;e.preventDefault();if(!c.classList.contains('selected')){['pointerdown','mousedown','pointerup','mouseup','click'].forEach(function(t){c.dispatchEvent(new MouseEvent(t,{bubbles:true,clientX:e.clientX,clientY:e.clientY,button:0}))})}
m.style.left=Math.min(e.clientX,innerWidth-210)+'px';m.style.top=Math.min(e.clientY,innerHeight-280)+'px';m.classList.add('on')});
['click','scroll','blur'].forEach(function(t){addEventListener(t,function(e){var tg=e.target;if(!(tg&&tg.nodeType)||!m.contains(tg))hide()},true)});document.addEventListener('keydown',function(e){e.key==='Escape'&&hide()});
});

/* PRO 12 - maximize timeline / preview */
P.reg(12,'Maximize panels',function(){
P.css('mx','@media (min-width:1025px){html[data-am-max=tl] .center{grid-template-rows:0 minmax(0,1fr)!important}html[data-am-max=tl] .preview-wrap{visibility:hidden;overflow:hidden}html[data-am-max=pv] .center{grid-template-rows:minmax(0,1fr) 0!important}html[data-am-max=pv] .timeline{visibility:hidden;overflow:hidden}}');
var H=document.documentElement;
P.maximize=function(w){var c=H.getAttribute('data-am-max');if(c===w||!w)H.removeAttribute('data-am-max');else H.setAttribute('data-am-max',w);window.dispatchEvent(new Event('resize'));document.dispatchEvent(new CustomEvent('ampro:layout'));P.toast(H.getAttribute('data-am-max')?'Maximized '+(w==='tl'?'timeline':'preview'):'Restored layout')};
var tb=P.$('.timeline-toolbar'),pt=P.$('.preview-toolbar');
if(tb&&!P.$('#amMaxTl')){var a=P.el('<button class="toolbtn" id="amMaxTl" title="Maximize timeline (Ctrl+\\)">⤢ Timeline</button>');P.$('#fitTimelineBtn').after(a);a.onclick=function(){P.maximize('tl')}}
if(pt&&!P.$('#amMaxPv')){var b=P.el('<button class="toolbtn" id="amMaxPv" title="Maximize preview (Ctrl+Shift+\\)">⤢ Preview</button>');P.$('#fitBtn').after(b);b.onclick=function(){P.maximize('pv')}}
document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&(e.key==='\\'||e.key==='|')){P.maximize(e.shiftKey?'pv':'tl');e.preventDefault()}});
P.cmd&&(P.cmd('Maximize timeline',function(){P.maximize('tl')},'Ctrl+\\'),P.cmd('Maximize preview',function(){P.maximize('pv')}));
});

/* PRO 13 - clip polish: selection glow + hover info card */
P.reg(13,'Clip polish',function(){
P.css('cl','.clip.selected{border-color:var(--accent2)!important;box-shadow:0 0 0 1px var(--accent2),0 0 14px rgba(255,180,84,.45),0 2px 8px rgba(0,0,0,.5)!important;z-index:3}.clip{transition:box-shadow .12s,filter .12s}#am-ci{position:fixed;z-index:2147481500;pointer-events:none;background:#1d1b16;border:1px solid var(--line);border-radius:8px;padding:6px 9px;font:11px var(--font-body);color:var(--text);max-width:240px;display:none;box-shadow:var(--shadow)}#am-ci b{display:block;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#am-ci span{color:var(--muted);font:10px var(--font-mono)}');
var c=P.el('<div id="am-ci"></div>');document.body.appendChild(c);var tm;
var tl=P.$('.timeline');if(!tl)return;
tl.addEventListener('mouseover',function(e){var k=e.target.closest&&e.target.closest('.clip');clearTimeout(tm);if(!k){c.style.display='none';return}tm=setTimeout(function(){var w=k.getBoundingClientRect().width,d=P.cal&&P.cal.pps?(w/P.cal.pps).toFixed(2)+'s':'',n=(k.getAttribute('data-name')||k.textContent||'Clip').replace(/\s+/g,' ').trim().slice(0,60);c.innerHTML='<b>'+n.replace(/</g,'&lt;')+'</b><span>'+d+(k.classList.contains('selected')?' · selected':'')+'</span>';var r=k.getBoundingClientRect();c.style.left=Math.min(r.left,innerWidth-250)+'px';c.style.top=(r.top-46)+'px';c.style.display='block'},350)});
tl.addEventListener('mouseleave',function(){clearTimeout(tm);c.style.display='none'});tl.addEventListener('pointerdown',function(){c.style.display='none'},true);
});

/* PRO 14 - grouped, labelled timeline toolbar */
P.reg(14,'Toolbar groups',function(){
P.css('tg','.am-grp{font:700 8px var(--font-body);letter-spacing:.14em;color:#6f6759;text-transform:uppercase;align-self:center;margin:0 2px 0 4px}.timeline-toolbar{column-gap:5px}');
[['toolSelect','Tools'],['setInBtn','Range'],['addVideoBtn','Add'],['splitBtn','Edit']].forEach(function(g){var b=P.$('#'+g[0]);if(b&&!(b.previousElementSibling&&b.previousElementSibling.classList.contains('am-grp'))){var s=document.createElement('span');s.className='am-grp';s.textContent=g[1];b.before(s)}});
['toolSelect','toolRazor','toolHand','toolZoom','toolSlip','toolSlide','toolRoll'].forEach(function(id){var b=P.$('#'+id);b&&b.addEventListener('click',function(){var t=(b.title||'').split(' — ')[0].replace(/\s*\(.*\)/,'');P.toast('Tool: '+t);P.tool=t})});
P.tool='Selection tool';
});

/* PRO 15 - status bar */
P.reg(15,'Status bar',function(){
P.css('sb','@media (min-width:1025px) and (min-height:500px){html{--am-sb:24px}.app{height:calc(100% - var(--am-sb))!important}}#am-sb{position:fixed;left:0;right:0;bottom:0;height:24px;background:#0c0b09;border-top:1px solid var(--line);display:flex;align-items:center;gap:16px;padding:0 12px;font:600 10px var(--font-mono);color:var(--muted);z-index:60}#am-sb b{color:var(--text);font-weight:600}#am-sb .sp{flex:1}#am-sb i{width:7px;height:7px;border-radius:50%;background:var(--ok);display:inline-block;margin-right:5px}@media (max-width:1024px){#am-sb{display:none}}');
var s=P.el('<div id="am-sb" role="status"><span>Tool <b id="sbT">Selection</b></span><span>Zoom <b id="sbZ"></b></span><span>Clips <b id="sbC">0</b></span><span>Playhead <b id="sbP">00:00.000</b></span><span>Markers <b id="sbM">0</b></span><span class="sp"></span><span id="sbW">Edit</span><span><b id="sbF">--</b> fps UI</span><span id="sbS"></span></div>');document.body.appendChild(s);
var f=0,fr=0,last=performance.now();(function t(n){f++;if(n-last>1000){fr=f;f=0;last=n}requestAnimationFrame(t)})(last);
var __sbKey='';function __sbW(id,t){var e=P.$(id);t=String(t);if(e&&e.textContent!==t)e.textContent=t}setInterval(function(){var z=P.$('#timelineZoom');__sbW('#sbT',(P.tool||'Selection').replace(/ tool/i,''));var zt=z?z.value+' px/s':'';try{if(typeof getTimelinePx==='function'){var pv=getTimelinePx();zt=(pv>=100?Math.round(pv):Math.round(pv*10)/10)+' px/s'}}catch(e){}__sbW('#sbZ',zt);__sbW('#sbC',P.$$('.clip').length+' ('+P.$$('.clip.selected').length+' sel)');var r=P.$('#timeReadout');__sbW('#sbP',r?r.textContent:'');__sbW('#sbM',(P.markers||[]).length);__sbW('#sbW','Workspace: '+(document.documentElement.getAttribute('data-am-ws')||'edit'));__sbW('#sbF',fr);var st=P.$('#saveStatus'),sk=(st&&/unsaved/i.test(st.textContent)?'w':'o')+'|'+(st?st.textContent:'');if(sk!==__sbKey){__sbKey=sk;P.$('#sbS').innerHTML='<i style="background:'+(st&&/unsaved/i.test(st.textContent)?'var(--warn)':'var(--ok)')+'"></i>'+(st?st.textContent:'')}},400);
});

/* PRO 16 - inspector width presets */
P.reg(16,'Inspector presets',function(){
P.css('ip','.am-ipbar{display:flex;gap:4px;padding:6px 10px;border-bottom:1px solid var(--line);background:#100f0c;position:sticky;top:0;z-index:5;align-items:center}.am-ipbar span{font:700 9px var(--font-body);letter-spacing:.12em;color:var(--muted);text-transform:uppercase;margin-right:auto}.am-ipbar button{background:var(--panel3);border:1px solid var(--line);color:var(--text);border-radius:5px;font:600 10px var(--font-body);padding:2px 7px;cursor:pointer}.am-ipbar button:hover{border-color:var(--accent)}@media (max-width:1024px){.am-ipbar{display:none}}');
var col=P.$('#inspectorCol');if(!col||P.$('.am-ipbar'))return;
var bar=P.el('<div class="am-ipbar"><span>Inspector</span><button data-w="240">S</button><button data-w="300">M</button><button data-w="420">L</button><button data-t="1" title="Scroll to top">↑</button></div>');col.insertBefore(bar,col.firstChild);
bar.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.dataset.t){col.scrollTo({top:0,behavior:'smooth'});return}P.layout(null,+b.dataset.w,null);document.dispatchEvent(new CustomEvent('ampro:layout'))});
P.cmd&&[['Inspector: narrow',240],['Inspector: normal',300],['Inspector: wide',420]].forEach(function(x){P.cmd(x[0],function(){P.layout(null,x[1],null)})});
});

/* PRO 17 - library search + density */
P.reg(17,'Library search',function(){
P.css('ls','.am-ls{position:sticky;top:0;z-index:4;background:var(--panel);padding:8px 10px;display:flex;gap:6px;border-bottom:1px solid var(--line)}.am-ls input{flex:1;min-width:0;background:#0c0b09;border:1px solid var(--line);border-radius:7px;color:var(--text);font:12px var(--font-body);padding:6px 9px;outline:0}.am-ls input:focus{border-color:var(--accent)}.am-ls button{background:var(--panel3);border:1px solid var(--line);color:var(--text);border-radius:7px;padding:0 8px;cursor:pointer;font:600 11px var(--font-body)}.am-compact .card,.am-compact [class*=thumb]{transform:scale(.94)}.am-compact{font-size:11px}');
var lp=P.$('#leftPanel');if(!lp)return;var q='';
function apply(){var s=P.$('.am-ls input',lp);q=s?s.value.toLowerCase().trim():q;P.$$('.card,[class*=item],[class*=tile],button.tpl,.tpl',lp).forEach(function(n){if(n.closest('.am-ls')||n.querySelector('.card'))return;n.style.display=!q||(n.textContent||'').toLowerCase().indexOf(q)>-1||(n.title||'').toLowerCase().indexOf(q)>-1?'':'none'})}
function ensure(){if(P.$('.am-ls',lp))return;var d=P.el('<div class="am-ls"><input type="search" placeholder="Search this panel…" aria-label="Search library"><button title="Compact density">▦</button></div>');lp.insertBefore(d,lp.firstChild);P.$('input',d).addEventListener('input',apply);P.$('button',d).onclick=function(){lp.classList.toggle('am-compact');P.set('compact',lp.classList.contains('am-compact'))};if(P.get('compact',false))lp.classList.add('am-compact')}
var busy=false;new MutationObserver(function(){if(busy)return;busy=true;setTimeout(function(){ensure();if(q)apply();busy=false},80)}).observe(lp,{childList:true});ensure();
P.cmd&&P.cmd('Search library panel',function(){var i=P.$('.am-ls input',lp);i&&i.focus()});
});

/* PRO 18 - save guard, session timer, Ctrl+S feedback */
P.reg(18,'Save guard',function(){
var st=P.$('#saveStatus'),t0=Date.now(),lastSave=null;if(!st)return;
P.css('sg','#amSess{font:600 10px var(--font-mono);color:var(--muted);margin-left:8px;white-space:nowrap}');
var s=P.el('<span id="amSess" title="Time in this editing session"></span>');st.after(s);
function dirty(){return /unsaved|saving|\*/i.test(st.textContent||'')}
new MutationObserver(function(){if(/saved/i.test(st.textContent)&&!dirty())lastSave=Date.now()}).observe(st,{childList:true,characterData:true,subtree:true});
setInterval(function(){var m=Math.floor((Date.now()-t0)/60000),h=Math.floor(m/60);s.textContent='⏱ '+(h?h+'h ':'')+(m%60)+'m'+(lastSave?' · saved '+Math.max(0,Math.round((Date.now()-lastSave)/60000))+'m ago':'')},5000);
addEventListener('beforeunload',function(e){if(dirty()&&P.$$('.clip').length){e.preventDefault();e.returnValue=''}});
document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){setTimeout(function(){P.toast(dirty()?'Saving…':'Project saved')},250)}},true);
P.cmd&&P.cmd('Rename project',function(){var p=P.$('#projectName');p&&(p.focus(),p.select())});
});

/* PRO 19 - focus mode */
P.reg(19,'Focus mode',function(){
P.css('fm','@media (min-width:1025px){html[data-am-focus] .topbar{display:none}html[data-am-focus] .app{grid-template-rows:0 1fr!important}html[data-am-focus] .sidebar,html[data-am-focus] .inspector-col{display:none}html[data-am-focus] .workspace{grid-template-columns:0 minmax(0,1fr) 0!important}html[data-am-focus] #am-sb{opacity:.35}}#amFocusX{position:fixed;top:8px;right:12px;z-index:2147481000;display:none}html[data-am-focus] #amFocusX{display:block}');
var H=document.documentElement,x=P.el('<button class="topbtn" id="amFocusX" title="Exit focus mode (Ctrl+Shift+F)">✕ Exit focus</button>');document.body.appendChild(x);
P.focus=function(){var on=!H.hasAttribute('data-am-focus');on?H.setAttribute('data-am-focus',''):H.removeAttribute('data-am-focus');P.toast(on?'Focus mode on':'Focus mode off');window.dispatchEvent(new Event('resize'));document.dispatchEvent(new CustomEvent('ampro:layout'))};
x.onclick=P.focus;
var tb=P.$('#amCmdBtn')||P.$('#helpBtn');if(tb&&!P.$('#amFocusBtn')){var b=P.el('<button class="topbtn" id="amFocusBtn" title="Focus mode (Ctrl+Shift+F)">◐ Focus</button>');tb.before(b);b.onclick=P.focus}
document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='f'){P.focus();e.preventDefault()}});
P.cmd&&P.cmd('Toggle focus mode',P.focus,'Ctrl+Shift+F');
});

/* PRO 20 - self-test, reset layout, about */
P.reg(20,'QA & about',function(){
P.css('qa','#am-qa{position:fixed;inset:0;z-index:2147482600;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center}#am-qa.on{display:flex}#am-qa .bx{width:min(520px,94vw);max-height:80vh;overflow:auto;background:var(--panel2);border:1px solid var(--line);border-radius:14px;padding:18px 22px;box-shadow:var(--shadow)}#am-qa h2{margin:0 0 10px;font:700 16px var(--font-display)}#am-qa .r{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--line-soft);font:12px var(--font-body)}.ok{color:var(--ok)}.bad{color:var(--danger)}#am-qa .ft{display:flex;gap:8px;margin-top:14px}');
var box=P.el('<div id="am-qa" role="dialog" aria-label="Pro self-test"><div class="bx"></div></div>');document.body.appendChild(box);
P.selftest=function(){var need=['undoBtn','exportBtn','previewCanvas','timelineScroll','ruler','tracks','playhead','timelineZoom','splitBtn','timeReadout','leftPanel','inspector'],rows=[];
P.mods.forEach(function(m){rows.push([m.n+'. '+m.name,m.ok])});need.forEach(function(id){rows.push(['Core element #'+id,!!document.getElementById(id)])});
rows.push(['Calibrated seek',!!(P.calibrate&&P.calibrate())]);rows.push(['Saved layout readable',P.get('layout',{})!==null]);
var okc=rows.filter(function(r){return r[1]}).length;
P.$('.bx',box).innerHTML='<h2>Pro self-test — '+okc+'/'+rows.length+' passed</h2>'+rows.map(function(r){return '<div class="r"><span>'+r[0]+'</span><b class="'+(r[1]?'ok':'bad')+'">'+(r[1]?'PASS':'FAIL')+'</b></div>'}).join('')+'<div class="ft"><button class="topbtn" id="qaClose">Close</button><button class="topbtn" id="qaReset">Reset layout</button><button class="topbtn" id="qaKeys">Shortcuts</button></div><div style="margin-top:10px;color:var(--muted);font:11px var(--font-body)">Amiyo Studio Pro interface · 20-step upgrade complete</div>';
box.classList.add('on');P.$('#qaClose').onclick=function(){box.classList.remove('on')};P.$('#qaReset').onclick=function(){P.resetLayout&&P.resetLayout();P.toast('Layout reset')};P.$('#qaKeys').onclick=function(){box.classList.remove('on');P.shortcuts&&P.shortcuts()};return okc===rows.length};
box.addEventListener('mousedown',function(e){if(e.target===box)box.classList.remove('on')});
document.addEventListener('keydown',function(e){e.key==='Escape'&&box.classList.remove('on')});
var h=P.$('#helpBtn');if(h&&!P.$('#amQaBtn')){var b=P.el('<button class="topbtn" id="amQaBtn" title="Run interface self-test">✔ Test</button>');h.after(b);b.onclick=P.selftest}
P.cmd&&(P.cmd('Run interface self-test',P.selftest),P.cmd('About this version',P.selftest));
});

})();

;
/* ==================== Script 1664 id="am-filmora-ui" ==================== */
/* Amiyo Studio Filmora-style interface - steps F01..F20 */
(function(){"use strict";var P=window.AMPRO;
P.reg(21,'F01 Accent themes',function(){
P.themes={Orange:['#ff7a3d','#ffb454','#7a3d1f'],Filmora:['#00d1b2','#5df2d6','#0b5a4e'],Blue:['#4aa8ff','#8cc8ff','#1f4f7a'],Violet:['#a78bfa','#c9b8ff','#43366f'],Rose:['#ff5c8a','#ff9ab8','#7a2340']};
P.theme=function(n){var t=P.themes[n];if(!t)return;var s=document.documentElement.style;s.setProperty('--accent',t[0]);s.setProperty('--accent2',t[1]);s.setProperty('--accent-dim',t[2]);P.set('theme',n);P.toast('Theme: '+n)};
var cur=P.get('theme','Orange');if(cur!=='Orange')P.theme(cur);
P.cmd&&Object.keys(P.themes).forEach(function(n){P.cmd('Theme: '+n,function(){P.theme(n)})});
});

P.reg(22,'F02 Menu bar',function(){
P.css('mn','.am-menus{display:flex;gap:2px;margin-left:10px;flex:none}.am-menus>button{background:none;border:0;color:var(--muted);font:600 12px var(--font-body);padding:6px 9px;border-radius:6px;cursor:pointer}.am-menus>button:hover,.am-menus>button.on{background:var(--panel3);color:var(--text)}#am-dd{position:fixed;z-index:2147482400;min-width:210px;background:var(--panel2);border:1px solid var(--line);border-radius:10px;box-shadow:var(--shadow);padding:5px;display:none}#am-dd.on{display:block}#am-dd button{display:flex;justify-content:space-between;gap:18px;width:100%;background:none;border:0;color:var(--text);font:500 12px var(--font-body);padding:7px 10px;border-radius:6px;cursor:pointer;text-align:left}#am-dd button:hover{background:var(--accent-dim)}#am-dd small{color:var(--muted);font:10px var(--font-mono)}#am-dd hr{border:0;border-top:1px solid var(--line);margin:4px 2px}@media (max-width:1200px){.am-menus{display:none}}');
var M=P.menus={File:[['Rename project',function(){var p=P.$('#projectName');p.focus();p.select()},'F2'],['Versions',function(){P.click('versionsBtn')}],['Storage',function(){P.click('storageBtn')}],0,['Export…',function(){P.click('exportBtn')}],['Render queue',function(){P.click('renderQueueBtn')}]],
Edit:[['Undo',function(){P.click('undoBtn')},'Ctrl+Z'],['Redo',function(){P.click('redoBtn')},'Ctrl+Shift+Z'],0,['Split at playhead',function(){P.click('splitBtn')}],['Duplicate',function(){P.click('duplicateBtn')}],['Delete',function(){P.click('deleteBtn')}],0,['Set In',function(){P.click('setInBtn')},'I'],['Set Out',function(){P.click('setOutBtn')},'O'],['Add marker',function(){P.addMarker()},'M']],
View:[['Workspace: Edit',function(){P.workspace('edit')},'Alt+1'],['Workspace: Color',function(){P.workspace('color')},'Alt+2'],['Workspace: Audio',function(){P.workspace('audio')},'Alt+3'],['Workspace: Review',function(){P.workspace('review')},'Alt+4'],0,['Focus mode',function(){P.focus()},'Ctrl+Shift+F'],['Maximize timeline',function(){P.maximize('tl')},'Ctrl+\\'],['Reset layout',function(){P.resetLayout()}],0].concat(Object.keys(P.themes).map(function(n){return ['Theme: '+n,function(){P.theme(n)}]})),
Tools:[['Command palette',function(){P.palette()},'Ctrl+K'],['Self-test',function(){P.selftest()}]],
Help:[['Keyboard shortcuts',function(){P.shortcuts()},'?'],['Help',function(){P.click('helpBtn')}]]};
P.menuAdd=function(m,label,fn,hint){(M[m]=M[m]||[]).push([label,fn,hint||''])};
var dd=P.el('<div id="am-dd" role="menu"></div>');document.body.appendChild(dd);var bar=P.el('<div class="am-menus"></div>'),cur=null;
var host=P.$('#projectName');host&&host.before(bar);
function show(k,b){if(cur===k){hide();return}cur=k;P.$$('.am-menus>button').forEach(function(x){x.classList.toggle('on',x===b)});dd.innerHTML=M[k].map(function(it,i){return it?'<button data-i="'+i+'">'+it[0]+'<small>'+(it[2]||'')+'</small></button>':'<hr>'}).join('');var r=b.getBoundingClientRect();dd.style.left=r.left+'px';dd.style.top=(r.bottom+4)+'px';dd.classList.add('on')}
function hide(){cur=null;dd.classList.remove('on');P.$$('.am-menus>button').forEach(function(x){x.classList.remove('on')})}
['File','Edit','View','Tools','Help'].forEach(function(k){var b=document.createElement('button');b.textContent=k;b.onclick=function(e){e.stopPropagation();show(k,b)};b.onmouseenter=function(){if(cur&&cur!==k)show(k,b)};bar.appendChild(b)});
dd.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var it=M[cur][+b.dataset.i];hide();setTimeout(it[1],10)});
document.addEventListener('click',hide);document.addEventListener('keydown',function(e){e.key==='Escape'&&hide()});
});

P.reg(23,'F03 Icon toolbar',function(){
P.css('ic','.am-ico .timeline-toolbar .toolbtn[data-ico]{font-size:0;padding:5px 9px}.am-ico .timeline-toolbar .toolbtn[data-ico]::before{content:attr(data-ico);font-size:15px;line-height:1}');
var I={splitBtn:'✂',deleteBtn:'🗑',duplicateBtn:'⧉',addVideoBtn:'🎞',addTextBtn:'T',addAdjustmentBtn:'◐',fitTimelineBtn:'⤢',setInBtn:'⇤',setOutBtn:'⇥',clearInOutBtn:'⇹',trimIOBtn:'⟷',amMkBtn:'⚑'};
Object.keys(I).forEach(function(id){var b=P.$('#'+id);if(b){b.dataset.ico=I[id];if(!b.title)b.title=b.textContent.trim()}});
P.icons=function(on){var h=document.documentElement;on===undefined&&(on=!h.classList.contains('am-ico'));h.classList.toggle('am-ico',on);P.set('ico',on);P.toast(on?'Icon toolbar':'Text toolbar')};
if(P.get('ico',false))P.icons(true);
P.menuAdd&&P.menuAdd('View','Icon-only toolbar',function(){P.icons()});P.cmd&&P.cmd('Toggle icon-only toolbar',function(){P.icons()});
});

P.reg(24,'F04 Render bar',function(){
P.css('rb','.am-rb{position:absolute;left:0;right:0;bottom:0;height:4px;pointer-events:none;z-index:3}.am-rb i{position:absolute;top:0;bottom:0;background:var(--accent);opacity:.85;border-radius:1px}');
var ru=P.$('#ruler');if(!ru)return;if(getComputedStyle(ru).position==='static')ru.style.position='relative';
var rb=P.el('<div class="am-rb"></div>');ru.appendChild(rb);
function draw(){var r=ru.getBoundingClientRect(),segs=P.$$('.clip').map(function(c){var b=c.getBoundingClientRect();return [b.left-r.left,b.right-r.left]}).sort(function(a,b){return a[0]-b[0]}),m=[];segs.forEach(function(s){var l=m[m.length-1];if(l&&s[0]<=l[1]+1)l[1]=Math.max(l[1],s[1]);else m.push(s.slice())});rb.innerHTML=m.map(function(s){return '<i style="left:'+s[0]+'px;width:'+Math.max(1,s[1]-s[0])+'px"></i>'}).join('')}
setInterval(draw,900);var z=P.$('#timelineZoom');z&&z.addEventListener('input',function(){setTimeout(draw,80)});setTimeout(draw,600);
});

P.reg(25,'F05 Track locks',function(){
P.css('lk','.am-lkb{margin-left:auto;background:none;border:0;color:var(--muted);cursor:pointer;font-size:12px;padding:2px 4px;border-radius:4px}.am-lkb:hover{color:var(--text)}.am-lkb.on{color:var(--warn)}.am-locked{pointer-events:none;opacity:.55;background-image:repeating-linear-gradient(135deg,transparent 0 6px,rgba(255,255,255,.04) 6px 12px)}');
var tr=P.$('#tracks');if(!tr)return;var L=P.get('locks',{});
function lane(l){var p=l.parentElement;return P.$('.track-lane',p)||l.nextElementSibling}
function key(l,i){return (l.textContent||'').trim().slice(0,12)+'#'+i}
function apply(){P.$$('.track-label',tr).forEach(function(l,i){var k=key(l,i),ln=lane(l);if(!ln)return;if(!l.querySelector('.am-lkb')){var b=document.createElement('button');b.className='am-lkb';b.title='Lock track (prevents edits)';b.textContent='🔓';b.onclick=function(e){e.stopPropagation();L[k]=!L[k];P.set('locks',L);apply();P.toast(L[k]?'Track locked':'Track unlocked')};l.appendChild(b)}var bt=l.querySelector('.am-lkb');bt.textContent=L[k]?'🔒':'🔓';bt.classList.toggle('on',!!L[k]);ln.classList.toggle('am-locked',!!L[k])})}
var busy=false;new MutationObserver(function(){if(busy)return;busy=true;setTimeout(function(){apply();busy=false},120)}).observe(tr,{childList:true,subtree:true});apply();
});

P.reg(26,'F06 Scrub slider',function(){
P.css('sl','.am-scrub{position:absolute;left:10px;right:10px;bottom:6px;z-index:6;display:flex;gap:8px;align-items:center;opacity:.9}.am-scrub input{flex:1;accent-color:var(--accent);height:4px}.am-scrub span{font:600 10px var(--font-mono);color:var(--muted)}');
var st=P.$('.preview-stage');if(!st)return;if(getComputedStyle(st).position==='static')st.style.position='relative';
var d=P.el('<div class="am-scrub"><input type="range" min="0" max="1000" value="0" aria-label="Seek"><span>0:00</span></div>');st.appendChild(d);var s=P.$('input',d),l=P.$('span',d),drag=false,lastT=0;
s.addEventListener('pointerdown',function(){drag=true});s.addEventListener('pointerup',function(){drag=false});
s.addEventListener('input',function(){var t=P.time();if(!t.d)return;var now=Date.now();if(now-lastT<90)return;lastT=now;P.seek(+s.value/1000*t.d)});
setInterval(function(){if(drag)return;var t=P.time();if(t.d){s.value=Math.round(t.t/t.d*1000);var m=Math.floor(t.t/60);l.textContent=m+':'+('0'+Math.floor(t.t%60)).slice(-2)}},200);
});

P.reg(27,'F07 Aspect guides',function(){
P.css('ag','.am-ag{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none}.am-ag i{border:2px dashed var(--accent2);box-shadow:0 0 0 9999px rgba(0,0,0,.45);display:none}.am-ag em{position:absolute;top:6px;right:8px;font:700 9px var(--font-mono);color:var(--accent2);font-style:normal}');
var ov=P.$('.preview-overlay');if(!ov)return;var g=P.el('<div class="am-ag"><i></i><em></em></div>');ov.appendChild(g);var box=P.$('i',g),lab=P.$('em',g);
var R={'Off':0,'9:16':[9,16],'1:1':[1,1],'4:5':[4,5],'21:9':[21,9]};
P.guide=function(k){var r=R[k];if(!r){box.style.display='none';lab.textContent='';return}box.style.display='block';var cw=ov.clientWidth,ch=ov.clientHeight,w=Math.min(cw,ch*r[0]/r[1]),h=w*r[1]/r[0];box.style.width=w+'px';box.style.height=h+'px';lab.textContent='GUIDE '+k;P.set('guide',k)};
var pt=P.$('.preview-toolbar'),sel=document.createElement('select');sel.className='toolbtn';sel.title='Aspect-ratio crop guide (preview only)';sel.innerHTML=Object.keys(R).map(function(k){return '<option>'+(k==='Off'?'Guide: Off':k)+'</option>'}).join('');sel.onchange=function(){P.guide(sel.value.replace('Guide: ',''))};
var ref=P.$('#amFull')||P.$('#fitBtn');ref&&ref.after(sel);
P.cmd&&Object.keys(R).forEach(function(k){P.cmd('Aspect guide: '+k,function(){P.guide(k);sel.value=k==='Off'?'Guide: Off':k})});
});

P.reg(28,'F08 View zoom',function(){
var sh=P.$('#canvasShell'),pt=P.$('.preview-toolbar');if(!sh||!pt)return;
var sel=document.createElement('select');sel.className='toolbtn';sel.title='Preview view zoom';sel.innerHTML='<option value="1">View: Fit</option><option value=".5">50%</option><option value=".75">75%</option><option value="1.25">125%</option><option value="1.5">150%</option>';
sel.onchange=function(){sh.style.transform=+sel.value===1?'':'scale('+sel.value+')';sh.style.transformOrigin='center center'};
var ref=P.$('#fitBtn');ref&&ref.after(sel);var f=P.$('#fitBtn');f&&f.addEventListener('click',function(){sel.value='1';sh.style.transform=''});
});

P.reg(29,'F09 Timecode HUD',function(){
P.css('hd','.am-hud{position:absolute;left:10px;top:10px;z-index:6;background:rgba(0,0,0,.55);color:#fff;font:700 13px var(--font-mono);padding:4px 9px;border-radius:6px;pointer-events:none;display:none}.am-hud.on{display:block}');
var st=P.$('.preview-stage');if(!st)return;var h=P.el('<div class="am-hud"></div>');st.appendChild(h);
setInterval(function(){if(h.classList.contains('on')){var r=P.$('#timeReadout');h.textContent=r?r.textContent.split('/')[0].trim():''}},100);
P.hud=function(){var on=h.classList.toggle('on');P.toast(on?'Timecode HUD on':'Timecode HUD off')};
P.menuAdd&&P.menuAdd('View','Timecode HUD on preview',P.hud);P.cmd&&P.cmd('Toggle timecode HUD',P.hud);
});

P.reg(30,'F10 Minimap',function(){
P.css('mm','.am-mm{position:absolute;left:0;right:0;bottom:0;height:12px;background:rgba(10,9,8,.85);border-top:1px solid var(--line);z-index:7;cursor:pointer}.am-mm i{position:absolute;top:3px;bottom:3px;background:var(--accent-dim);border-radius:1px}.am-mm b{position:absolute;top:0;bottom:0;border:1px solid var(--accent);background:rgba(255,255,255,.08)}');
var tl=P.$('.timeline'),sc=P.$('#timelineScroll');if(!tl||!sc)return;if(getComputedStyle(tl).position==='static')tl.style.position='relative';
var m=P.el('<div class="am-mm" title="Timeline overview — click to jump"></div>');tl.appendChild(m);
function draw(){var W=sc.scrollWidth||1,w=m.clientWidth,s=w/W,r0=P.$('#timelineInner').getBoundingClientRect();m.innerHTML=P.$$('.clip').map(function(c){var b=c.getBoundingClientRect();return '<i style="left:'+((b.left-r0.left)*s)+'px;width:'+Math.max(1,b.width*s)+'px"></i>'}).join('')+'<b style="left:'+(sc.scrollLeft*s)+'px;width:'+Math.max(6,sc.clientWidth*s)+'px"></b>'}
m.addEventListener('click',function(e){var r=m.getBoundingClientRect();sc.scrollLeft=(e.clientX-r.left)/r.width*sc.scrollWidth-sc.clientWidth/2});
sc.addEventListener('scroll',draw,{passive:true});setInterval(draw,900);setTimeout(draw,600);
});

P.reg(31,'F11 Clip labels',function(){
var C={Red:'#ff5c6c',Orange:'#ff9a3d',Yellow:'#ffc857',Green:'#5fd88a',Blue:'#4aa8ff',Violet:'#a78bfa',None:''},LB=P.get('labels',{});
P.css('lb','#am-cm .am-lbls{display:flex;gap:6px;padding:6px 10px 4px}#am-cm .am-lbls s{width:14px;height:14px;border-radius:50%;cursor:pointer;border:1px solid rgba(255,255,255,.25)}');
function paint(){var t='';Object.keys(LB).forEach(function(id){if(LB[id])t+='.clip[data-clip="'+id+'"]{border-top:4px solid '+LB[id]+'!important}'});P.css('lbl',t)}
P.label=function(name){var c=P.$$('.clip.selected');if(!c.length){P.toast('Select a clip first');return}c.forEach(function(e){var id=e.getAttribute('data-clip');if(id){if(C[name])LB[id]=C[name];else delete LB[id]}});P.set('labels',LB);paint();P.toast('Label: '+name)};
var m=P.$('#am-cm');if(m&&!P.$('.am-lbls',m)){var d=P.el('<div class="am-lbls" title="Clip colour label"></div>');d.innerHTML=Object.keys(C).map(function(k){return '<s data-l="'+k+'" title="'+k+'" style="background:'+(C[k]||'transparent')+'"></s>'}).join('');m.appendChild(d);d.addEventListener('click',function(e){var s=e.target.closest('s');if(s){m.classList.remove('on');P.label(s.dataset.l)}})}
paint();P.cmd&&Object.keys(C).forEach(function(k){P.cmd('Label selected clip: '+k,function(){P.label(k)})});
});

P.reg(32,'F12 Project info',function(){
P.css('pi','#am-pi{position:fixed;left:12px;bottom:32px;width:250px;background:var(--panel2);border:1px solid var(--line);border-radius:10px;box-shadow:var(--shadow);padding:10px 12px;font:12px var(--font-body);z-index:2147481000;display:none}#am-pi.on{display:block}#am-pi div{display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--line-soft)}#am-pi b{font-family:var(--font-mono);font-weight:600}');
var p=P.el('<div id="am-pi" role="dialog" aria-label="Project info"></div>');document.body.appendChild(p);
P.info=function(){var cv=P.$('#previewCanvas'),t=P.time();var rows=[['Project',(P.$('#projectName')||{}).value||''],['Resolution',cv?cv.width+'×'+cv.height:'-'],['Duration',t.d?t.d.toFixed(2)+' s':'-'],['Tracks',P.$$('.track-label').length],['Clips',P.$$('.clip').length],['Markers',(P.markers||[]).length],['Workspace',document.documentElement.getAttribute('data-am-ws')||'edit']];p.innerHTML='<b style="font-family:var(--font-display)">Project info</b>'+rows.map(function(r){return '<div><span>'+r[0]+'</span><b>'+String(r[1]).replace(/</g,'&lt;')+'</b></div>'}).join('');p.classList.toggle('on')};
var sb=P.$('#am-sb');sb&&(sb.style.cursor='pointer',sb.title='Click for project info',sb.addEventListener('click',P.info));
document.addEventListener('mousedown',function(e){if(p.classList.contains('on')&&!p.contains(e.target)&&!(sb&&sb.contains(e.target)))p.classList.remove('on')});
P.menuAdd&&P.menuAdd('File','Project info',P.info);P.cmd&&P.cmd('Project info',P.info);
});

P.reg(33,'F13 Tab grid nav',function(){
P.css('tgn','.am-tabs #nav{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;padding:6px}.am-tabs .navbtn{font-size:10.5px;padding:7px 4px;justify-content:center;flex-direction:column;gap:3px;text-align:center}.am-tabs .navbtn .dot{margin:0}');
P.tabs=function(on){var h=document.documentElement;on===undefined&&(on=!h.classList.contains('am-tabs'));h.classList.toggle('am-tabs',on);P.set('tabs',on);P.toast(on?'Tab-grid library nav':'List library nav')};
if(P.get('tabs',false))P.tabs(true);
P.menuAdd&&P.menuAdd('View','Compact tab-grid library',function(){P.tabs()});P.cmd&&P.cmd('Toggle compact library tabs',function(){P.tabs()});
});

P.reg(34,'F14 Playhead bubble',function(){
P.css('pb','.am-pb{position:absolute;top:14px;left:9px;background:var(--accent);color:#1a1008;font:700 9px var(--font-mono);padding:1px 5px;border-radius:4px;white-space:nowrap;pointer-events:none}');
var ph=P.$('#playhead');if(!ph)return;var b=P.el('<span class="am-pb"></span>');ph.appendChild(b);
setInterval(function(){var t=P.time().t,m=Math.floor(t/60);b.textContent=m+':'+('0'+(t%60).toFixed(1)).slice(-4)},120);
});

P.reg(35,'F15 Empty hint',function(){
P.css('eh','.am-eh{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;color:var(--muted);font:600 13px var(--font-body);pointer-events:none;z-index:2;display:none;border:2px dashed var(--line);border-radius:12px;padding:18px 28px;background:rgba(10,9,8,.6)}.am-eh.on{display:block}.am-eh small{display:block;font-weight:400;margin-top:4px}');
var sc=P.$('#timelineScroll');if(!sc)return;var h=P.el('<div class="am-eh">Your timeline is empty<small>Press <b>＋ Video/Audio</b> or drag media from the library</small></div>');(sc.parentElement||sc).appendChild(h);
var host=sc.parentElement;if(getComputedStyle(host).position==='static')host.style.position='relative';
setInterval(function(){h.classList.toggle('on',P.$$('.clip').length===0)},700);
});

P.reg(36,'F16 Snapshot',function(){
P.snapshot=function(){var c=P.$('#previewCanvas');if(!c){return}try{c.toBlob(function(b){if(!b){P.toast('Snapshot failed');return}var a=document.createElement('a'),n=((P.$('#projectName')||{}).value||'frame').replace(/[^\w-]+/g,'_');a.href=URL.createObjectURL(b);a.download=n+'_'+P.time().t.toFixed(2)+'s.png';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500);P.toast('Snapshot saved')},'image/png')}catch(e){P.toast('Snapshot blocked by cross-origin media')}};
var ref=P.$('#amFull');if(ref&&!P.$('#amSnap')){var b=P.el('<button class="toolbtn" id="amSnap" title="Save current frame as PNG (Ctrl+Shift+S)">📷 Snap</button>');ref.after(b);b.onclick=P.snapshot}
document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='s'){P.snapshot();e.preventDefault()}});
P.menuAdd&&P.menuAdd('Tools','Snapshot current frame',P.snapshot,'Ctrl+Shift+S');P.cmd&&P.cmd('Snapshot current frame',P.snapshot,'Ctrl+Shift+S');
});

P.reg(37,'F17 Zoom presets',function(){
var z=P.$('#timelineZoom'),sc=P.$('#timelineScroll');if(!z||!P.zoom)return;
var s=document.createElement('select');s.className='toolbtn';s.id='amZoomPre';s.title='Visible time window';s.innerHTML='<option value="">Window…</option><option value="1">1 s</option><option value="5">5 s</option><option value="10">10 s</option><option value="30">30 s</option><option value="60">1 min</option><option value="fit">Fit all</option>';
s.onchange=function(){var v=s.value;if(!v)return;if(v==='fit')P.click('fitTimelineBtn');else P.zoom(null,Math.round((sc.clientWidth-120)/+v));s.value=''};
var l=P.$('#amZoomLbl');l&&l.after(s);
P.cmd&&[1,5,10,30,60].forEach(function(n){P.cmd('Timeline window: '+n+'s',function(){P.zoom(null,Math.round((sc.clientWidth-120)/n))})});
});

P.reg(38,'F18 Edit-point nav',function(){
function pts(){var ru=P.$('#ruler').getBoundingClientRect();if(!P.cal)P.calibrate();if(!P.cal)return[];var a=[];P.$$('.clip').forEach(function(c){var b=c.getBoundingClientRect();[b.left,b.right].forEach(function(x){a.push((x-ru.left-P.cal.x0)/P.cal.pps)})});return a.filter(function(t){return t>=-.01}).sort(function(x,y){return x-y})}
P.editPoint=function(dir){var t=P.time().t,a=pts(),n=dir>0?a.filter(function(x){return x>t+.03})[0]:a.filter(function(x){return x<t-.03}).pop();if(n==null){P.toast('No more edit points');return}P.seek(Math.max(0,n));P.toast('Edit point '+n.toFixed(2)+'s')};
P.nudge=function(dir,n){var id=dir>0?'nextFrameBtn':'prevFrameBtn';for(var i=0;i<n;i++)P.click(id)};
document.addEventListener('keydown',function(e){if(/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||'')||e.ctrlKey||e.metaKey)return;if(e.altKey&&e.key==='ArrowUp'){P.editPoint(-1);e.preventDefault()}else if(e.altKey&&e.key==='ArrowDown'){P.editPoint(1);e.preventDefault()}else if(e.shiftKey&&!e.altKey&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){P.nudge(e.key==='ArrowRight'?1:-1,10);e.preventDefault()}});
P.cmd&&(P.cmd('Previous edit point',function(){P.editPoint(-1)},'Alt+↑'),P.cmd('Next edit point',function(){P.editPoint(1)},'Alt+↓'),P.cmd('Nudge +10 frames',function(){P.nudge(1,10)},'Shift+→'),P.cmd('Nudge −10 frames',function(){P.nudge(-1,10)},'Shift+←'));
P.menuAdd&&(P.menuAdd('Edit','Next edit point',function(){P.editPoint(1)},'Alt+↓'),P.menuAdd('Edit','Previous edit point',function(){P.editPoint(-1)},'Alt+↑'));
});

P.reg(39,'F19 Contrast & density',function(){
P.css('hc','html.am-hc{--line:#6b6354;--muted:#cfc6b4;--line-soft:#443e33}html.am-hc .clip{border-color:rgba(255,255,255,.6)}html.am-dense .toolbtn,html.am-dense .topbtn{padding-top:3px;padding-bottom:3px;font-size:11px}html.am-dense .navbtn{padding-top:5px;padding-bottom:5px}');
var H=document.documentElement;P.flag=function(c,l){var on=H.classList.toggle(c);P.set(c,on);P.toast(l+(on?' on':' off'))};
['am-hc','am-dense'].forEach(function(c){if(P.get(c,false))H.classList.add(c)});
P.menuAdd&&(P.menuAdd('View','High contrast',function(){P.flag('am-hc','High contrast')}),P.menuAdd('View','Compact density',function(){P.flag('am-dense','Compact density')}));
P.cmd&&(P.cmd('Toggle high contrast',function(){P.flag('am-hc','High contrast')}),P.cmd('Toggle compact density',function(){P.flag('am-dense','Compact density')}));
});

P.reg(40,'F20 Tour & final QA',function(){
P.css('tr','#am-tr{position:fixed;inset:0;z-index:2147482700;display:none}#am-tr.on{display:block}#am-tr .hl{position:fixed;border:2px solid var(--accent2);border-radius:10px;box-shadow:0 0 0 9999px rgba(0,0,0,.62);transition:.25s}#am-tr .tip{position:fixed;width:min(300px,90vw);background:var(--panel2);border:1px solid var(--accent);border-radius:12px;padding:12px 14px;font:13px var(--font-body);color:var(--text);box-shadow:var(--shadow)}#am-tr .tip b{display:block;font:700 14px var(--font-display);margin-bottom:4px}#am-tr .tip div{display:flex;gap:8px;margin-top:10px}');
var S=[['.topbar','Menus & commands','File/Edit/View/Tools/Help menus, workspaces, and Ctrl+K for everything.'],['.sidebar','Library','Search your assets and switch panels. View ▸ Compact tab-grid for a tighter layout.'],['.preview-wrap','Preview','Scrub, loop, safe zones, aspect guides, snapshot and view zoom.'],['.timeline','Timeline','Markers (M), edit-point jump (Alt+↑/↓), zoom window, minimap and track locks.'],['.inspector-col','Inspector','Properties for the selected clip. Resize any panel by dragging its edge.']];
var o=P.el('<div id="am-tr"><div class="hl"></div><div class="tip"></div></div>');document.body.appendChild(o);var i=0,hl=P.$('.hl',o),tip=P.$('.tip',o);
function go(n){i=n;if(i>=S.length){o.classList.remove('on');P.set('toured',true);return}var s=S[i],e=P.$(s[0]),r=e?e.getBoundingClientRect():{left:60,top:60,width:300,height:100,bottom:160};hl.style.cssText='left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px';tip.innerHTML='<b>'+s[1]+'</b>'+s[2]+'<div><button class="topbtn" data-a="skip">Skip</button><button class="topbtn primary" data-a="next">'+(i===S.length-1?'Done':'Next')+'</button></div>';tip.style.left=Math.min(innerWidth-320,Math.max(10,r.left+20))+'px';tip.style.top=Math.min(innerHeight-170,Math.max(10,r.top+Math.min(r.height-10,60)))+'px'}
tip.addEventListener('click',function(e){var a=e.target.dataset&&e.target.dataset.a;if(a==='next')go(i+1);else if(a==='skip')go(99)});
P.tour=function(){o.classList.add('on');go(0)};
P.menuAdd&&P.menuAdd('Help','Interface tour',P.tour);P.cmd&&P.cmd('Interface tour',P.tour);
var old=P.selftest;P.selftest=function(){var ok=old?old():false;P.toast('Self-test: '+(ok?'all passed':'see list'));return ok};
if(!P.get('toured',false)&&P.desktop())setTimeout(function(){if(!P.$('#amBoot')||P.$('#amBoot').style.display==='none'||!document.body.contains(P.$('#amBoot')))P.tour()},2500);
});

})();

;
/* ==================== Script 1665 id="amiyo-wa5-steps" ==================== */
try{
/* WA0005 step 2 - Cutting: S / Ctrl+K now splits EVERY selected clip the playhead crosses (one undo), and when nothing is selected it cuts all clips under the playhead on unlocked tracks. */
(function(){"use strict";
var C=window.AMIYO_STUDIO_CORE, orig=window.splitSelected; if(!C||typeof orig!=="function"||orig.__wa5) return;
function say(m){ try{ (window.toast||window.notify)(m); }catch(e){} }
function hist(){ return project.history; }
function under(){ var t=currentTime, out=[]; project.tracks.forEach(function(tr){ if(tr.locked) return; tr.clips.forEach(function(c){ if(t>c.start+.05&&t<c.start+c.duration-.05) out.push({tr:tr,c:c}); }); }); return out; }
function splitMany(list,label){
  var h=hist(), startIdx=h.entries.length, n=0, keep=list.map(function(x){return [x.c.id,x.tr.id];});
  keep.forEach(function(k){ var tr=project.tracks.find(function(t){return t.id===k[1];}); var c=tr&&tr.clips.find(function(x){return x.id===k[0];}); if(!c) return;
    if(!(currentTime>c.start+.05&&currentTime<c.start+c.duration-.05)) return;
    C.selectClip(k[0],k[1]); var before=h.entries.length; orig(); if(project.history.entries.length>before) n++; });
  h=hist(); var added=h.entries.splice(startIdx);
  if(added.length){ h.entries.push({label:label+" ("+n+")",before:added[0].before,after:added[added.length-1].after}); h.index=h.entries.length-1; try{updateUndoRedo();}catch(e){} }
  try{ renderAll(); }catch(e){}
  say(n?("Split "+n+" clip"+(n>1?"s":"")+" at playhead"):"Playhead must be inside a clip");
  return n;
}
var w=function(){
  var sel=C.selectedClips().filter(function(x){return !x.track.locked;});
  var cross=sel.filter(function(x){return currentTime>x.clip.start+.05&&currentTime<x.clip.start+x.clip.duration-.05;});
  if(sel.length>1) return splitMany(cross.map(function(x){return {tr:x.track,c:x.clip};}),"Split clips");
  if(sel.length===1) return orig.apply(this,arguments);
  var u=under(); if(!u.length){ return orig.apply(this,arguments); }
  return splitMany(u,"Split at playhead");
};
w.__wa5=1; window.splitSelected=w;
try{ window.AMIYO_WA5_STEP=2; }catch(e){}
})();

}catch(e){try{console.error("wa5 step 2",e)}catch(_){}}

try{
/* WA0005 step 3 - Delete: Shift+Delete now ripple-deletes the selected clip(s) even when the playhead sits in a gap, and removes all selected clips in one undo. */
(function(){"use strict";
var C=window.AMIYO_STUDIO_CORE; if(!C||window.__wa5s3) return; window.__wa5s3=1;
function say(m){ try{ (window.toast||window.notify)(m); }catch(e){} }
function rippleMany(){
  var sel=C.selectedClips().filter(function(x){return !x.track.locked;}); if(!sel.length) return false;
  var before=JSON.parse(JSON.stringify(serializableProject()));
  sel.sort(function(a,b){return b.clip.start-a.clip.start;});
  var ids={}; sel.forEach(function(x){ids[x.clip.id]=1;});
  sel.forEach(function(x){ var S=x.clip.start, D=x.clip.duration;
    x.track.clips=x.track.clips.filter(function(c){return c.id!==x.clip.id;});
    project.tracks.forEach(function(t){ if(t.locked) return; t.clips.forEach(function(c){ if(!ids[c.id]&&c.start>=S-0.0005) c.start=Math.max(0,c.start-D); }); });
  });
  try{ selectedClipId=null; }catch(e){}
  project.tracks.forEach(function(t){ t.clips.forEach(function(c){ c.selected=false; }); });
  var after=JSON.parse(JSON.stringify(serializableProject())), h=project.history;
  h.entries=h.entries.slice(0,h.index+1); h.entries.push({label:"Ripple delete"+(sel.length>1?" ("+sel.length+" clips)":""),before:before,after:after}); h.index=h.entries.length-1;
  try{updateUndoRedo();}catch(e){} try{scheduleAutosave();}catch(e){} try{renderAll();}catch(e){}
  say("Ripple deleted "+sel.length+" clip"+(sel.length>1?"s":"")+" - gap closed"); return true;
}
document.addEventListener("keydown",function(e){
  if(!e.shiftKey||e.ctrlKey||e.metaKey||e.altKey) return; if(e.key!=="Delete"&&e.key!=="Backspace") return;
  var a=document.activeElement; if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName||"")||(a&&a.isContentEditable)) return;
  if(!C.selectedClips().length) return; e.preventDefault(); e.stopImmediatePropagation(); rippleMany();
},true);
window.amiyoRippleDeleteMany=rippleMany;
try{ window.AMIYO_WA5_STEP=3; }catch(e){}
})();

}catch(e){try{console.error("wa5 step 3",e)}catch(_){}}

try{
/* WA0005 step 4 - Move/zoom precision: the three zoom readouts said "250 px/s" while the timeline really drew 16 px/s (they showed the zoom setting, not pixels per second). They now show the true pixels per second, so dragging, snapping and nudging precision can be judged at a glance. Move, snap, overlap-protection, cross-track move and Shift+Alt+Arrow nudge were tested and already work. */
(function(){"use strict";
if(window.__wa5s4) return; window.__wa5s4=1;
var IDS=["amZoomLbl","ui20Zoom","sbZ"];
function fmt(v){ return (v>=100?Math.round(v):Math.round(v*10)/10)+" px/s"; }
function sync(){
  try{ if(typeof getTimelinePx!=="function") return; var t=fmt(getTimelinePx());
    IDS.forEach(function(id){ var el=document.getElementById(id); if(el&&el.textContent!==t) el.textContent=t; });
    var s=document.getElementById("timelineZoom"); if(s&&s.title.indexOf("px/s")<0) s.title+=" - label shows real pixels per second";
  }catch(e){}
}
var obs=null;
function watch(){ try{ IDS.forEach(function(id){ var el=document.getElementById(id); if(!el||el.__wa5w) return; el.__wa5w=1;
  new MutationObserver(function(){ sync(); }).observe(el,{childList:true,characterData:true,subtree:true}); }); }catch(e){} }
setInterval(function(){ watch(); sync(); },300); watch(); sync();
try{ window.AMIYO_WA5_STEP=4; }catch(e){}
})();

}catch(e){try{console.error("wa5 step 4",e)}catch(_){}}

try{
/* WA0005 step 5 - Trim tools: Rolling edit and Slide edit refused to move a cut on still images ("No more footage") because a still was treated like a 5 s video. Stills have no source limit, so the tools now work on them (and still stop at real video footage limits). */
(function(){"use strict";
if(window.__wa5s5) return; window.__wa5s5=1;
function wrap(obj,name){
  var f=obj&&obj[name]; if(typeof f!=="function"||f.__wa5) return;
  var w=function(){
    var saved=[]; try{ Object.keys(project.assets||{}).forEach(function(k){ var a=project.assets[k]; if(a&&a.type==="image"&&a.duration>0){ saved.push([a,a.duration]); a.duration=36000; } }); }catch(e){}
    try{ return f.apply(this,arguments); } finally{ saved.forEach(function(x){ x[0].duration=x[1]; }); }
  };
  w.__wa5=1; obj[name]=w;
}
wrap(window.amiyoRoll,"roll"); wrap(window.amiyoSlide,"slide");
try{ window.AMIYO_WA5_STEP=5; }catch(e){}
})();

}catch(e){try{console.error("wa5 step 5",e)}catch(_){}}

;
/* ==================== Script 1666 id="amso-js-s01" ==================== */
/* Screen optimisation, step 1 of 10: one place that knows what kind of screen this is.
   Sets on <html>: data-amso-dev (phone | tablet | laptop | desktop | wide), data-amso-orient (portrait | landscape), data-amso-touch (1 | 0),
   data-amso-kb (1 while the on-screen keyboard is open) and the CSS variables --amso-vw, --amso-vh (real visible height, keyboard and browser bars
   taken out), --amso-kb. Later steps read these instead of guessing from separate media queries. Updates are batched into one frame and only
   applied when something really changed, so rotating, split screen or dragging a desktop window does not cause a burst of work.
   Nothing is removed. Safe off switch: add ?noamso to the address, or run localStorage.setItem("amiyo.noamso","1") and reload. */
(function(){"use strict";
var W=window,D=document,H=D.documentElement;
try{ if(W.__amso) return; if(/[?&]noamso\b/.test(location.search)||localStorage.getItem("amiyo.noamso")==="1") return; }catch(e){}
var A=W.__amso={version:1,state:{}};
var raf=W.requestAnimationFrame||function(f){return setTimeout(f,16)}, pend=0;
function mm(q){ try{ return W.matchMedia(q).matches; }catch(e){ return false; } }
function measure(){
  var vv=W.visualViewport, iw=Math.round(vv&&vv.width||W.innerWidth||H.clientWidth), ih=Math.round(W.innerHeight||H.clientHeight);
  var vh=Math.round(vv?vv.height:ih), touch=mm("(pointer:coarse)")||mm("(hover:none)"), land=iw>ih;
  /* keyboard: the visual viewport shrinks much more than the layout viewport (only when something typed-into is focused) */
  var ae=D.activeElement, typing=!!(ae&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)||ae&&ae.isContentEditable);
  var kb=(vv&&touch&&typing&&ih-vh>120)?(ih-vh):0;
  /* layout size used for the class: the layout viewport (innerWidth), so browser zoom behaves like a smaller or larger screen, as it should */
  var w=W.innerWidth||iw, h=ih, shortSide=Math.min(w,h), dev;
  if(w<=600||(touch&&land&&h<=500&&w<=960)) dev="phone";
  else if(w<=1024||(touch&&shortSide<=820)) dev="tablet";
  else if(w<1600) dev="laptop";
  else if(w<2200) dev="desktop";
  else dev="wide";
  return {dev:dev,orient:land?"landscape":"portrait",touch:touch?"1":"0",kb:kb?"1":"0",kbPx:kb,vw:w,vh:kb?ih:vh,ih:ih,dpr:W.devicePixelRatio||1,short:shortSide};
}
function apply(){
  pend=0; var s=measure(), o=A.state, ch=false;
  for(var k in s) if(o[k]!==s[k]){ ch=true; break; }
  if(!ch) return;
  var devCh=o.dev!==s.dev||o.orient!==s.orient||o.touch!==s.touch;
  A.state=s;
  H.setAttribute("data-amso-dev",s.dev); H.setAttribute("data-amso-orient",s.orient); H.setAttribute("data-amso-touch",s.touch); H.setAttribute("data-amso-kb",s.kb);
  var st=H.style; st.setProperty("--amso-vw",s.vw+"px"); st.setProperty("--amso-vh",s.vh+"px"); st.setProperty("--amso-kb",s.kbPx+"px");
  try{ W.dispatchEvent(new CustomEvent("amso:change",{detail:{state:s,classChanged:devCh}})); }catch(e){}
}
function schedule(){ if(pend) return; pend=1; raf(apply); }
A.refresh=function(){ apply(); return A.state; };
A.is=function(d){ return A.state.dev===d; };
W.addEventListener("resize",schedule,{passive:true});
W.addEventListener("orientationchange",function(){ schedule(); setTimeout(schedule,250); setTimeout(schedule,700); },{passive:true});
try{ if(W.visualViewport){ W.visualViewport.addEventListener("resize",schedule,{passive:true}); } }catch(e){}
D.addEventListener("focusin",schedule,true); D.addEventListener("focusout",function(){ setTimeout(schedule,60); },true);
apply();
try{ W.AMIYO_EDITOR_BUILD="screen-opt-step01-device-class"; W.AMIYO_SCREENOPT_STEP=1; }catch(e){}
})();

;
/* ==================== Script 1667 id="amso-js-s02" ==================== */
/* Screen optimisation, step 2 of 10: phone portrait (also used by portrait tablets).
   1) The preview now starts at the right height for the screen: the picture fills the width at the project's own shape (16:9, 9:16, square ...)
      and the timeline keeps at least 38% of the height. Before, the picture got a fixed 42% of the column minus all the bars around it, so on a
      phone it was a small letterbox (about 150 px high on an 844 px screen). If you ever dragged the handle (or used S / M / L) your size is kept:
      this only sets the starting size, and double-tap on the handle goes back to it.
   2) The timeline tool strip no longer starts scrolled halfway through its 100+ buttons (it was opening on "...ction V" with Selection cut off). */
(function(){"use strict";
var W=window,D=document,A=W.__amso; if(!A||W.__amso2) return; W.__amso2=1;
var SK="amiyo.preview.size.v1", timer=0, userSet=false;
function saved(key){ try{ var o=JSON.parse(localStorage.getItem(SK)||"{}"); var v=o&&o[key]; return typeof v==="number"?v:null; }catch(e){ return null; } }
function aspect(){
  try{ var c=D.querySelector("#canvasShell canvas")||D.querySelector(".preview-stage canvas"); if(c&&c.width>0&&c.height>0){ var a=c.width/c.height; return Math.min(2.4,Math.max(0.5,a)); } }catch(e){}
  return 16/9;
}
function fit(force){
  var P=W.AMPV; if(!P||!A.state) return;
  var st=A.state; if(st.orient!=="portrait"||(st.dev!=="phone"&&st.dev!=="tablet")) return;
  if(P.mode&&P.mode()!=="stack") return;
  if(!force&&saved(P.key())!==null) return;                       /* the person's own size always wins */
  var c=D.querySelector(".center"), pw=c&&c.querySelector(":scope>.preview-wrap"), stg=pw&&pw.querySelector(".preview-stage"), tl=c&&c.querySelector(":scope>.timeline"), hd=D.getElementById("amPvHandle");
  if(!c||!pw||!stg||!tl) return;
  var H=c.clientHeight, w=stg.clientWidth; if(H<300||w<150) return;
  var hh=hd?hd.offsetHeight:0, chrome=pw.offsetHeight-stg.offsetHeight; if(chrome<0||chrome>H*0.6) return;
  var want=Math.min(w/aspect(), H*0.46);                           /* picture height that fits the width, never more than 46% of the column */
  var wrap=chrome+Math.max(want,110), avail=H-hh;
  var f=wrap/avail; f=Math.max(Math.min(f,1-0.38*H/avail*1.0), 0.28);   /* timeline keeps at least ~38% of the column */
  f=Math.min(f,P.MAX); if(Math.abs(f-P.get())<0.01) return;
  P.set(f);
}
function soon(force){ clearTimeout(timer); timer=setTimeout(function(){ fit(force); },force?0:250); }
function resetStrips(){
  try{ D.querySelectorAll(".timeline-toolbar,.preview-toolbar").forEach(function(e){ if(e.scrollLeft>0&&!e.__amsoTouched) e.scrollLeft=0; }); }catch(x){}
}
D.addEventListener("pointerdown",function(e){ try{ var t=e.target.closest&&e.target.closest(".timeline-toolbar,.preview-toolbar"); if(t) t.__amsoTouched=1; }catch(x){} },true);
W.addEventListener("amso:change",function(e){ soon(false); setTimeout(resetStrips,400); });
function boot(){ if(!W.AMPV||!D.querySelector(".center>.timeline")||!W.__amiyoBooted){ return setTimeout(boot,300); }
  fit(false); resetStrips(); setTimeout(function(){ fit(false); resetStrips(); },1500); setTimeout(resetStrips,4000); }
if(W.AMPV&&W.AMPV.on) try{ W.AMPV.on("mode",function(){ soon(false); }); W.AMPV.on("change",function(a){ if(a&&a.user) userSet=true; }); }catch(e){}
boot();
try{ W.AMIYO_SCREENOPT_STEP=2; }catch(e){}
})();

;
/* ==================== Script 1668 id="amso-js-s03" ==================== */
/* Screen optimisation, step 3 of 10: phone landscape. See the CSS block for the layout part.
   Here: the timeline used to open already scrolled 127 px to the right (so the track names were off screen); it now opens at the start when
   you have not scrolled it yourself, and the track-name column keeps itself on screen. */
(function(){"use strict";
var W=window,D=document; if(!W.__amso||W.__amso3) return; W.__amso3=1;
function rewind(){ try{ var s=D.getElementById("timelineScroll"); if(s&&s.scrollLeft>0&&!s.__amsoTouched&&!(W.__amiyoExporting)){ s.scrollLeft=0; } }catch(e){} }
D.addEventListener("pointerdown",function(e){ try{ if(e.target.closest&&e.target.closest("#timelineScroll")) { var s=D.getElementById("timelineScroll"); if(s) s.__amsoTouched=1; } }catch(x){} },true);
D.addEventListener("wheel",function(e){ try{ var s=D.getElementById("timelineScroll"); if(s&&e.target.closest&&e.target.closest("#timelineScroll")) s.__amsoTouched=1; }catch(x){} },{capture:true,passive:true});
function boot(){ if(!W.__amiyoBooted||!D.getElementById("timelineScroll")) return setTimeout(boot,300); [200,1200,3000,5000].forEach(function(t){ setTimeout(rewind,t); }); }
W.addEventListener("amso:change",function(e){ if(e&&e.detail&&e.detail.classChanged){ var s=D.getElementById("timelineScroll"); if(s) s.__amsoTouched=0; setTimeout(rewind,300); } });
boot();
try{ W.AMIYO_SCREENOPT_STEP=3; }catch(e){}
})();

;
/* ==================== Script 1669 id="amso-js-s04" ==================== */
/* Screen optimisation, step 4 of 10: tablet portrait (the same logic is shared with phone portrait).
   1) Tablets keep the preview to about 38% of the column (phones 46%). A tablet is wide, so the old "fill the width" rule made the picture
      410 px high and left only five half-visible tracks. Your own S / M / L / dragged size still wins, as before.
   2) Messages (toasts) are lifted to sit just above the bottom bars on every portrait screen. Before, on a tablet they covered the action bar
      (Undo, Redo, Duplicate ...). The place is measured, not guessed, so it follows the real bar heights. */
(function(){"use strict";
var W=window,D=document,A=W.__amso; if(!A||W.__amso4) return; W.__amso4=1;
var SK="amiyo.preview.size.v1", t1=0, t2=0;
function saved(key){ try{ var o=JSON.parse(localStorage.getItem(SK)||"{}"); var v=o&&o[key]; return typeof v==="number"?v:null; }catch(e){ return null; } }
function aspect(){ try{ var c=D.querySelector("#canvasShell canvas")||D.querySelector(".preview-stage canvas"); if(c&&c.width>0&&c.height>0) return Math.min(2.4,Math.max(0.5,c.width/c.height)); }catch(e){} return 16/9; }
/* tablets: smaller share than step 2 gave them */
function tabletFit(){
  var P=W.AMPV, st=A.state; if(!P||!st||st.dev!=="tablet"||st.orient!=="portrait"||(P.mode&&P.mode()!=="stack")) return;
  if(saved(P.key())!==null) return;
  var c=D.querySelector(".center"), pw=c&&c.querySelector(":scope>.preview-wrap"), stg=pw&&pw.querySelector(".preview-stage"), hd=D.getElementById("amPvHandle");
  if(!c||!pw||!stg) return;
  var H=c.clientHeight, w=stg.clientWidth; if(H<400||w<300) return;
  var chrome=pw.offsetHeight-stg.offsetHeight, avail=H-(hd?hd.offsetHeight:0); if(chrome<0||chrome>H*0.5) return;
  var want=Math.min(w/aspect(), H*0.38);
  var f=Math.max(0.3,Math.min((chrome+want)/avail,0.56)); if(Math.abs(f-P.get())<0.01) return;
  P.set(f);
}
function toastSpot(){
  try{ var tl=D.querySelector(".center>.timeline"); if(!tl) return; var r=tl.getBoundingClientRect(); if(!r.height) return;
    var b=Math.max(60,Math.round((A.state.vh||W.innerHeight)-r.bottom+8)); D.documentElement.style.setProperty("--amso-toast-b",b+"px"); }catch(e){}
}
function soon(){ clearTimeout(t1); t1=setTimeout(function(){ tabletFit(); toastSpot(); },320); }
W.addEventListener("amso:change",soon);
try{ if(W.AMPV&&W.AMPV.on) W.AMPV.on("change",function(){ clearTimeout(t2); t2=setTimeout(toastSpot,200); }); }catch(e){}
function boot(){ if(!W.__amiyoBooted||!W.AMPV||!D.querySelector(".center>.timeline")) return setTimeout(boot,300);
  [1700,2600,5000].forEach(function(t){ setTimeout(function(){ tabletFit(); toastSpot(); },t); }); toastSpot(); }
boot();
try{ W.AMIYO_SCREENOPT_STEP=4; }catch(e){}
})();

;
/* ==================== Script 1670 id="amso-js-s05" ==================== */
/* Screen optimisation, step 5 of 10: tablet landscape and small laptops. See the CSS block for the layout rules.
   The script measures where the first track lane really starts (track names + the tool rail on the left) and publishes it as --amso-empty-left,
   so the "Your timeline is empty" card never overlaps the track names, whatever the screen, label width or rail. */
(function(){"use strict";
var W=window,D=document,A=W.__amso; if(!A||W.__amso5) return; W.__amso5=1;
var t=0;
function measure(){
  try{ var inner=D.getElementById("timelineInner"), card=D.getElementById("v19h"); if(!inner||!card) return;
    var lane=inner.querySelector(".track-lane"); if(!lane) return;
    var op=card.offsetParent||card.parentElement, base=op.getBoundingClientRect().left, x=lane.getBoundingClientRect().left;
    if(!(x>0)) return; var left=Math.round(x-base+8); if(left<40||left>600) return;
    var cur=D.documentElement.style.getPropertyValue("--amso-empty-left"); if(cur!==left+"px") D.documentElement.style.setProperty("--amso-empty-left",left+"px"); }catch(e){}
}
function soon(){ clearTimeout(t); t=setTimeout(measure,150); }
W.addEventListener("amso:change",soon); W.addEventListener("resize",soon,{passive:true});
try{ if(W.AMPV&&W.AMPV.on){ W.AMPV.on("change",soon); W.AMPV.on("mode",soon); } }catch(e){}
function boot(){ if(!W.__amiyoBooted||!D.getElementById("timelineInner")) return setTimeout(boot,300); [200,1200,3000,6000].forEach(function(x){ setTimeout(measure,x); }); }
boot();
try{ W.AMIYO_SCREENOPT_STEP=5; }catch(e){}
})();

;
/* ==================== Script 1671 ==================== */
try{window.AMIYO_SCREENOPT2_STEP=1;}catch(e){}

;
/* ==================== Script 1672 ==================== */
try{window.AMIYO_SO3_STEP=2;}catch(e){}

;
/* ==================== Script 1673 ==================== */
try{window.AMIYO_SO3_STEP=3;}catch(e){}

;
/* ==================== Script 1674 id="amiyo-so3-s04-js" ==================== */
(function(){"use strict";
function bar(){return document.getElementById('ppInspTabs')}
function fade(){var b=bar();if(!b)return;var max=b.scrollWidth-b.clientWidth;b.classList.toggle('am-fl',b.scrollLeft>2);b.classList.toggle('am-fr',max>2&&b.scrollLeft<max-2)}
function reveal(){var b=bar();if(!b)return;var a=b.querySelector('[aria-selected="true"],.on,.active,.sel');if(!a)return;
 var l=a.offsetLeft-b.offsetLeft,r=l+a.offsetWidth;if(l<b.scrollLeft+8)b.scrollLeft=Math.max(0,l-8);else if(r>b.scrollLeft+b.clientWidth-8)b.scrollLeft=r-b.clientWidth+8;fade()}
var tm=0;function later(){clearTimeout(tm);tm=setTimeout(function(){reveal();fade()},80)}
function wire(){var b=bar();if(!b||b.__amS4)return;b.__amS4=1;
 b.addEventListener('wheel',function(e){if(Math.abs(e.deltaY)>Math.abs(e.deltaX)&&b.scrollWidth>b.clientWidth){b.scrollLeft+=e.deltaY;e.preventDefault()}},{passive:false});
 b.addEventListener('scroll',fade,{passive:true});b.addEventListener('click',later,true);
 if(window.MutationObserver)new MutationObserver(later).observe(b,{attributes:true,subtree:true,attributeFilter:['aria-selected','class']});
 later()}
var n=0,iv=setInterval(function(){wire();if(bar()&&bar().__amS4||++n>40)clearInterval(iv)},500);
window.addEventListener('resize',later,{passive:true});
})();
window.AMIYO_SO3_STEP=4;

;
/* ==================== Script 1675 ==================== */
window.AMIYO_SO3_STEP=5;

;
/* ==================== Script 1676 id="amiyo-so3-s05-menufit" ==================== */
(function(){"use strict";
function fit(m){if(!m||!m.classList.contains("open"))return;m.style.maxHeight=Math.max(160,Math.min(innerHeight*0.7,innerHeight-16))+"px";
 var h=m.offsetHeight,t=parseFloat(m.style.top)||0;if(t+h>innerHeight-8)m.style.top=Math.max(8,innerHeight-h-8)+"px";
 var w=m.offsetWidth,l=parseFloat(m.style.left)||0;if(l+w>innerWidth-8)m.style.left=Math.max(8,innerWidth-w-8)+"px"}
function wire(m){if(m.__amFit)return;m.__amFit=1;if(window.MutationObserver)new MutationObserver(function(){fit(m)}).observe(m,{attributes:true,attributeFilter:["class"]})}
function scan(){[].forEach.call(document.querySelectorAll(".ovf-menu"),wire)}
scan();if(window.MutationObserver)new MutationObserver(scan).observe(document.body,{childList:true});
window.addEventListener("resize",function(){[].forEach.call(document.querySelectorAll(".ovf-menu.open"),fit)},{passive:true});
})();

;
/* ==================== Script 1677 id="amiyo-so3-s05-quickreserve" ==================== */
/* The header reserves room for the fixed top-right quick menu (#uxQuick) through --ux4-q, but that value was only measured at 0/0.8/2.5 s.
   #uxQuick is built later than that on slower loads, so the header ran underneath it. Measure whenever it appears or changes size. */
(function(){"use strict";
function q(){try{var u=document.getElementById("uxQuick"),w=0;if(u){var r=u.getBoundingClientRect();w=(r.width>0&&getComputedStyle(u).display!=="none")?Math.round(r.width):0}document.documentElement.style.setProperty("--ux4-q",w+"px")}catch(e){}}
var n=0,iv=setInterval(function(){var u=document.getElementById("uxQuick");if(u&&!u.__amq){u.__amq=1;if(window.ResizeObserver){try{new ResizeObserver(q).observe(u)}catch(e){}}q()}if(++n>80)clearInterval(iv)},400);
window.addEventListener("resize",function(){clearTimeout(q.t);q.t=setTimeout(q,150)},{passive:true});
})();

;
/* ==================== Script 1678 id="am-fix-size-logo-js" ==================== */
(function(){"use strict";
/* keeps overflow clipped only while the timeline is squeezed thin, so nothing spills over the bottom bar */
function upd(){ try{ var t=document.querySelector(".app .center>.timeline"); if(!t) return; document.body.classList.toggle("am-pv-thin", t.getBoundingClientRect().height<150); }catch(e){} }
function init(){ var t=document.querySelector(".app .center>.timeline"); if(!t||!window.AMPV) return setTimeout(init,400);
  try{ new ResizeObserver(upd).observe(t); }catch(e){ window.addEventListener("resize",upd); }
  window.AMPV.on("change",function(){ setTimeout(upd,60); }); upd(); }
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
})();
