/* Amiyo Studio - 08-audio-lab.js */
/* Audio lab, FL audio tools, DSP filters and voice subtract */
/* Scripts 850 to 1099 */


;
/* ==================== Script 850 id="amiyo-snd14" ==================== */
(function(){
function reg(l,f){ if(window.__amSound) window.__amSound.add(l,f); else (window.__amSoundQ=window.__amSoundQ||[]).push([l,f]); }
function audioClips(){var a=[];project.tracks.forEach(function(t){if(t.kind==="audio")t.clips.forEach(function(c){a.push({t:t,c:c});});});return a;}
function db(x){return x>1e-6?20*Math.log10(x):-120;}
function f1(x){return (Math.round(x*10)/10).toFixed(1);}
function sel(){var f=getClip();if(!f)throw new Error("Select an audio clip first");if(!f.clip.assetId)throw new Error("This clip has no audio media");return f;}
/* Sound step 14: tempo finder. Estimates the beats per minute of the selected clip (60 to 180 BPM) for cutting to the beat. */
reg("Find BPM",async function(){var f=sel(),m=await window.__amMono(f.clip),hop=Math.floor(m.sr*0.01),n=Math.floor(m.d.length/hop),e=new Float32Array(n);
 if(n<400)throw new Error("Clip is too short (needs about 4 s)");
 for(var i=0;i<n;i++){var s=0;for(var k=i*hop;k<(i+1)*hop;k++)s+=m.d[k]*m.d[k];e[i]=Math.sqrt(s/hop);}
 var o=new Float32Array(n);for(var j=1;j<n;j++)o[j]=Math.max(0,e[j]-e[j-1]);var best=0,bl=0;
 for(var lag=33;lag<=100;lag++){var a=0;for(var q=lag;q<n;q++)a+=o[q]*o[q-lag];a/=(n-lag);if(a>best){best=a;bl=lag;}}
 if(!bl||best<=0)throw new Error("No clear beat found");return "About "+Math.round(6000/bl)+" BPM (one beat every "+f1(bl/100)+" s).";});
})();

;
/* ==================== Script 851 id="amiyo-snd15" ==================== */
(function(){
function reg(l,f){ if(window.__amSound) window.__amSound.add(l,f); else (window.__amSoundQ=window.__amSoundQ||[]).push([l,f]); }
function audioClips(){var a=[];project.tracks.forEach(function(t){if(t.kind==="audio")t.clips.forEach(function(c){a.push({t:t,c:c});});});return a;}
function db(x){return x>1e-6?20*Math.log10(x):-120;}
function f1(x){return (Math.round(x*10)/10).toFixed(1);}
function sel(){var f=getClip();if(!f)throw new Error("Select an audio clip first");if(!f.clip.assetId)throw new Error("This clip has no audio media");return f;}
/* Sound step 15: mix report. Peak and average level of every audio clip, loudest first, plus the quietest-to-loudest spread. */
reg("Mix report",async function(){var L=audioClips();if(!L.length)throw new Error("No audio clips");var rows=[];
 for(var i=0;i<L.length;i++){try{var l=window.__amLevels(await window.__amMono(L[i].c)),v=L[i].c.volume==null?1:L[i].c.volume;rows.push({n:L[i].t.name+" @"+f1(L[i].c.start)+"s",pk:db(l.peak*v),rm:db(l.rms*v)});}catch(e){}}
 if(!rows.length)throw new Error("Nothing could be analysed");rows.sort(function(a,b){return b.rm-a.rm;});window.__amRows=rows;
 return rows.slice(0,10).map(function(r){return r.n+": avg "+f1(r.rm)+" / peak "+f1(r.pk)+" dB";}).join("\n")+"\nSpread "+f1(rows[0].rm-rows[rows.length-1].rm)+" dB between loudest and quietest.";});
})();

;
/* ==================== Script 852 id="amiyo-snd16" ==================== */
(function(){
function reg(l,f){ if(window.__amSound) window.__amSound.add(l,f); else (window.__amSoundQ=window.__amSoundQ||[]).push([l,f]); }
function audioClips(){var a=[];project.tracks.forEach(function(t){if(t.kind==="audio")t.clips.forEach(function(c){a.push({t:t,c:c});});});return a;}
function db(x){return x>1e-6?20*Math.log10(x):-120;}
function f1(x){return (Math.round(x*10)/10).toFixed(1);}
function sel(){var f=getClip();if(!f)throw new Error("Select an audio clip first");if(!f.clip.assetId)throw new Error("This clip has no audio media");return f;}
/* Sound step 16: reset volumes. Puts every audio clip back to 100% with no fades. */
reg("Reset volumes",function(){var L=audioClips();if(!L.length)throw new Error("No audio clips");
 transact("Reset audio volumes",function(){L.forEach(function(o){o.c.volume=1;o.c.fadeIn=0;o.c.fadeOut=0;});});return "Reset "+L.length+" clip(s).";});
})();

;
/* ==================== Script 853 id="amiyo-snd17" ==================== */
(function(){
function reg(l,f){ if(window.__amSound) window.__amSound.add(l,f); else (window.__amSoundQ=window.__amSoundQ||[]).push([l,f]); }
function audioClips(){var a=[];project.tracks.forEach(function(t){if(t.kind==="audio")t.clips.forEach(function(c){a.push({t:t,c:c});});});return a;}
function db(x){return x>1e-6?20*Math.log10(x):-120;}
function f1(x){return (Math.round(x*10)/10).toFixed(1);}
function sel(){var f=getClip();if(!f)throw new Error("Select an audio clip first");if(!f.clip.assetId)throw new Error("This clip has no audio media");return f;}
/* Sound step 17: copy volume to track. Gives every clip on the selected clip's track the same volume and fades as the selected clip. */
reg("Volume to track",function(){var f=getClip();if(!f)throw new Error("Select a clip first");var v=f.clip.volume==null?1:f.clip.volume,a=f.clip.fadeIn||0,b=f.clip.fadeOut||0;
 transact("Copy volume to track",function(){f.track.clips.forEach(function(c){c.volume=v;c.fadeIn=Math.min(a,c.duration/2);c.fadeOut=Math.min(b,c.duration/2);});});
 return "Applied "+Math.round(v*100)+"% to "+f.track.clips.length+" clip(s) on "+f.track.name+".";});
})();

;
/* ==================== Script 854 id="amiyo-snd18" ==================== */
(function(){
function reg(l,f){ if(window.__amSound) window.__amSound.add(l,f); else (window.__amSoundQ=window.__amSoundQ||[]).push([l,f]); }
function audioClips(){var a=[];project.tracks.forEach(function(t){if(t.kind==="audio")t.clips.forEach(function(c){a.push({t:t,c:c});});});return a;}
function db(x){return x>1e-6?20*Math.log10(x):-120;}
function f1(x){return (Math.round(x*10)/10).toFixed(1);}
function sel(){var f=getClip();if(!f)throw new Error("Select an audio clip first");if(!f.clip.assetId)throw new Error("This clip has no audio media");return f;}
/* Sound step 18: trim dead air. Cuts silence off the start and end of the selected clip (normal speed only). */
reg("Trim ends",async function(){var f=sel(),c=f.clip;if((c.speed||1)!==1)throw new Error("Only works at normal speed");if(f.track.locked)throw new Error("Track is locked");
 var m=await window.__amMono(c),sil=window.__amSilence(m,-45,0.2),dur=m.d.length/m.sr,head=0,tail=0;
 sil.forEach(function(x){if(x[0]<0.02)head=x[1];if(x[1]>dur-0.02)tail=dur-x[0];});head=Math.max(0,head-0.05);tail=Math.max(0,tail-0.05);
 if(head<0.05&&tail<0.05)return "No silence at the start or end.";if(head+tail>=dur-0.1)throw new Error("Clip is nearly all silence");
 transact("Trim silent ends",function(){c.inPoint=(c.inPoint||0)+head;c.start=c.start+head;c.duration=c.duration-head-tail;c.outPoint=c.inPoint+c.duration;});
 return "Trimmed "+f1(head)+" s from the start and "+f1(tail)+" s from the end.";});
})();

;
/* ==================== Script 855 id="amiyo-snd19" ==================== */
(function(){
function reg(l,f){ if(window.__amSound) window.__amSound.add(l,f); else (window.__amSoundQ=window.__amSoundQ||[]).push([l,f]); }
function audioClips(){var a=[];project.tracks.forEach(function(t){if(t.kind==="audio")t.clips.forEach(function(c){a.push({t:t,c:c});});});return a;}
function db(x){return x>1e-6?20*Math.log10(x):-120;}
function f1(x){return (Math.round(x*10)/10).toFixed(1);}
function sel(){var f=getClip();if(!f)throw new Error("Select an audio clip first");if(!f.clip.assetId)throw new Error("This clip has no audio media");return f;}
/* Sound step 19: save sound report. Downloads a text file with the audit and the level of each audio clip. */
reg("Save report",async function(){var t=window.__amAudit?window.__amAudit():"";var rows=window.__amRows;
 if(!rows){var L=audioClips();rows=[];for(var i=0;i<L.length;i++){try{var l=window.__amLevels(await window.__amMono(L[i].c));rows.push({n:L[i].t.name+" @"+f1(L[i].c.start)+"s",pk:db(l.peak),rm:db(l.rms)});}catch(e){}}}
 var txt="Sound report - "+((project.metadata&&project.metadata.name)||"Untitled")+"\n\n"+t+"\n\nLevels\n"+rows.map(function(r){return r.n+": avg "+f1(r.rm)+" dB, peak "+f1(r.pk)+" dB";}).join("\n");
 var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([txt],{type:"text/plain"}));a.download="sound-report.txt";document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},1500);
 return "Report saved as sound-report.txt";});
})();

;
/* ==================== Script 856 id="amiyo-snd20" ==================== */
(function(){
function reg(l,f){ if(window.__amSound) window.__amSound.add(l,f); else (window.__amSoundQ=window.__amSoundQ||[]).push([l,f]); }
function audioClips(){var a=[];project.tracks.forEach(function(t){if(t.kind==="audio")t.clips.forEach(function(c){a.push({t:t,c:c});});});return a;}
function db(x){return x>1e-6?20*Math.log10(x):-120;}
function f1(x){return (Math.round(x*10)/10).toFixed(1);}
function sel(){var f=getClip();if(!f)throw new Error("Select an audio clip first");if(!f.clip.assetId)throw new Error("This clip has no audio media");return f;}
/* Sound step 20: self-test. After load, confirms the Sound tools panel and the audio decoder are ready; the panel button turns amber if not. */
setTimeout(function(){try{var ok=!!(window.__amSound&&window.__amMono&&window.__amLevels&&window.__amSilence&&document.getElementById("amSndBtn"));
 var b=document.getElementById("amSndBtn");if(!ok){if(b)b.style.background="#8a5a12";toast("Sound tools did not load fully");}else window.__amSoundBuild="sound step 20";}catch(e){}},2000);
})();

;
/* ==================== Script 857 id="amiyo-snd21" ==================== */
(function(){
function reg(l,f){ if(window.__amSound) window.__amSound.add(l,f); else (window.__amSoundQ=window.__amSoundQ||[]).push([l,f]); }
function audioClips(){var a=[];project.tracks.forEach(function(t){if(t.kind==="audio")t.clips.forEach(function(c){a.push({t:t,c:c});});});return a;}
function db(x){return x>1e-6?20*Math.log10(x):-120;}
function f1(x){return (Math.round(x*10)/10).toFixed(1);}
function sel(){var f=getClip();if(!f)throw new Error("Select an audio clip first");if(!f.clip.assetId)throw new Error("This clip has no audio media");return f;}
/* Sound round 2, step 1: adjustable silence settings. Threshold and minimum gap now come from two boxes in the panel and drive Find silence, Cut silences and Trim ends. */
var row=document.createElement("div");row.style.cssText="margin:8px 0 0;font-size:12px;color:#f5a983";
row.innerHTML='Silence below <input id="amThr" type="number" value="-45" min="-90" max="-10" step="1" style="width:54px"> dB for at least <input id="amMin" type="number" value="0.4" min="0.1" max="5" step="0.1" style="width:48px"> s';
var g=document.getElementById("amSndGrid");g.parentNode.insertBefore(row,g);
var orig=window.__amSilence;
window.__amSilence=function(m,thr,minLen){var t=parseFloat(document.getElementById("amThr").value),n=parseFloat(document.getElementById("amMin").value);
 if(!(t<=-10&&t>=-90))t=thr;if(!(n>=0.1&&n<=5))n=minLen;return orig(m,t,minLen<n?Math.min(minLen,n):n);};
})();

;
/* ==================== Script 858 id="amiyo-snd22" ==================== */
(function(){
function reg(l,f){ if(window.__amSound) window.__amSound.add(l,f); else (window.__amSoundQ=window.__amSoundQ||[]).push([l,f]); }
function audioClips(){var a=[];project.tracks.forEach(function(t){if(t.kind==="audio")t.clips.forEach(function(c){a.push({t:t,c:c});});});return a;}
function db(x){return x>1e-6?20*Math.log10(x):-120;}
function f1(x){return (Math.round(x*10)/10).toFixed(1);}
function sel(){var f=getClip();if(!f)throw new Error("Select an audio clip first");if(!f.clip.assetId)throw new Error("This clip has no audio media");return f;}
/* Sound round 2, step 2: safer decoder. Refuses files over 250 MB (they can crash the page), and a new Free memory button clears the decoded-audio cache. */
var cache=new Map();
window.__amMono=async function(c){var a=getAsset(c.assetId);if(!a)throw new Error("Media missing");var buf=cache.get(a.id);
 if(!buf){var url=await ensureUrl(a);if(!url)throw new Error("Media not loaded");var r=await fetch(url),ab=await r.arrayBuffer();
  if(ab.byteLength>250e6)throw new Error("File is over 250 MB, too big to analyse safely");
  var OC=window.OfflineAudioContext||window.webkitOfflineAudioContext;
  try{buf=await new OC(1,1,44100).decodeAudioData(ab);}catch(e){throw new Error("This file has no audio the browser can read");}
  if(cache.size>=4)cache.delete(cache.keys().next().value);cache.set(a.id,buf);}
 var sr=buf.sampleRate,i0=Math.floor((c.inPoint||0)*sr),len=(c.outPoint!=null&&c.outPoint>(c.inPoint||0))?c.outPoint-(c.inPoint||0):c.duration*(c.speed||1);
 var i1=Math.min(buf.length,i0+Math.floor(len*sr)),n=Math.max(0,i1-i0),d=new Float32Array(n),ch=buf.numberOfChannels;
 for(var k=0;k<ch;k++){var cd=buf.getChannelData(k);for(var i=0;i<n;i++)d[i]+=cd[i0+i]/ch;}
 return {d:d,sr:sr,buf:buf,ch:ch};};
window.__amCache=cache;
reg("Free memory",function(){var n=cache.size;cache.clear();return "Cleared "+n+" decoded file(s) from memory.";});
})();

;
/* ==================== Script 859 id="amiyo-snd23" ==================== */
(function(){
function reg(l,f){ if(window.__amSound) window.__amSound.add(l,f); else (window.__amSoundQ=window.__amSoundQ||[]).push([l,f]); }
function audioClips(){var a=[];project.tracks.forEach(function(t){if(t.kind==="audio")t.clips.forEach(function(c){a.push({t:t,c:c});});});return a;}
function db(x){return x>1e-6?20*Math.log10(x):-120;}
function f1(x){return (Math.round(x*10)/10).toFixed(1);}
function sel(){var f=getClip();if(!f)throw new Error("Select an audio clip first");if(!f.clip.assetId)throw new Error("This clip has no audio media");return f;}
/* Sound round 2, step 3: Undo and Redo buttons inside the panel, so you can step back from any tool without leaving it. */
reg("\u21B6 Undo",function(){var b=document.getElementById("undoBtn");if(b&&b.disabled)return "Nothing to undo.";undo();return "Undone.";});
reg("\u21B7 Redo",function(){var b=document.getElementById("redoBtn");if(b&&b.disabled)return "Nothing to redo.";redo();return "Redone.";});
})();

;
/* ==================== Script 860 id="amiyo-snd24" ==================== */
(function(){
function reg(l,f){ if(window.__amSound) window.__amSound.add(l,f); else (window.__amSoundQ=window.__amSoundQ||[]).push([l,f]); }
function audioClips(){var a=[];project.tracks.forEach(function(t){if(t.kind==="audio")t.clips.forEach(function(c){a.push({t:t,c:c});});});return a;}
function db(x){return x>1e-6?20*Math.log10(x):-120;}
function f1(x){return (Math.round(x*10)/10).toFixed(1);}
function sel(){var f=getClip();if(!f)throw new Error("Select an audio clip first");if(!f.clip.assetId)throw new Error("This clip has no audio media");return f;}

function wavBlob(ch,sr){var n=ch[0].length,nc=ch.length,bps=3,buf=new ArrayBuffer(44+n*nc*bps),v=new DataView(buf);/* 24-bit PCM: 256x finer than 16-bit */
 function s(o,t){for(var i=0;i<t.length;i++)v.setUint8(o+i,t.charCodeAt(i));}
 s(0,"RIFF");v.setUint32(4,36+n*nc*bps,true);s(8,"WAVEfmt ");v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,nc,true);v.setUint32(24,sr,true);v.setUint32(28,sr*nc*bps,true);v.setUint16(32,nc*bps,true);v.setUint16(34,24,true);s(36,"data");v.setUint32(40,n*nc*bps,true);
 var o=44;for(var i=0;i<n;i++)for(var k=0;k<nc;k++){var x=Math.max(-1,Math.min(1,ch[k][i])),q=Math.round(x<0?x*8388608:x*8388607);if(q<0)q+=16777216;v.setUint8(o,q&255);v.setUint8(o+1,(q>>8)&255);v.setUint8(o+2,(q>>16)&255);o+=3;}
 return new Blob([buf],{type:"audio/wav"});}
async function srcChans(c){var m=await window.__amMono(c),b=m.buf,i0=Math.floor((c.inPoint||0)*b.sampleRate),ch=[];
 for(var k=0;k<b.numberOfChannels;k++)ch.push(b.getChannelData(k).slice(i0,i0+m.d.length));return {ch:ch,sr:b.sampleRate};}
function peakOf(ch){var p=0;ch.forEach(function(a){for(var i=0;i<a.length;i++){var v=Math.abs(a[i]);if(v>p)p=v;}});return p;}
async function bake(label,proc){var f=sel(),c=f.clip,t=f.track,a=getAsset(c.assetId);
 if(t.kind!=="audio")throw new Error("Only for clips on an audio track");if(t.locked)throw new Error("Track is locked");
 var s=await srcChans(c),out=await proc(s.ch,s.sr);if(!out)return "Nothing to change.";
 var blob=wavBlob(out,s.sr);if(blob.size>100e6)throw new Error("Result would be over 100 MB. Trim the clip first.");
 var id=uid("asset"),dur=out[0].length/s.sr;
 var asset={id:id,name:(a.name||"audio")+" ["+label+"]",mime:"audio/wav",type:"audio",size:blob.size,duration:dur,fps:0,tags:[],favorite:false};
 ASSET_BLOBS.set(id,blob);if(window.amiyoPutBlob){try{window.amiyoPutBlob(id,blob);}catch(e){}}
 else if(blob.size<8e6){asset.fileData=await new Promise(function(r){var fr=new FileReader();fr.onload=function(){r(fr.result);};fr.readAsDataURL(blob);});}
 transact(label,function(){project.assets[id]=asset;c.assetId=id;c.inPoint=0;c.outPoint=dur;c.volume=1;});
 try{var el=audioEls.get(c.id);if(el){var u=assetUrl(id);if(u){el.src=u;el.load();}}}catch(e){}
 return out;}
window.__amBake=bake;window.__amPeak=peakOf;
function gainAll(ch,g,soft){return ch.map(function(a){var o=new Float32Array(a.length);for(var i=0;i<a.length;i++){var y=a[i]*g;
 if(soft){var m=Math.abs(y);if(m>0.95)y=(y<0?-1:1)*(0.95+0.05*Math.tanh((m-0.95)/0.05));}o[i]=y;}return o;});}
/* Sound round 2, step 4: Boost to -1 dB. Unlike Normalize, this works on quiet clips too: it writes a louder copy of the audio, because clip volume stops at 100%. */
window.__amGain=gainAll;
reg("Boost to -1 dB",async function(){var r=0,db0=0;
 var o=await bake("Boost to -1 dB",function(ch){var p=peakOf(ch);if(p<1e-4)throw new Error("Clip is silent");var g=Math.min(10,Math.pow(10,-1/20)/p);db0=20*Math.log10(g);return gainAll(ch,g,false);});
 return o&&o.length?"Peak is now -1 dB ("+(db0>=0?"+":"")+f1(db0)+" dB change). Undo restores the original.":o;});
})();

;
/* ==================== Script 861 id="amiyo-snd25" ==================== */
(function(){
function reg(l,f){ if(window.__amSound) window.__amSound.add(l,f); else (window.__amSoundQ=window.__amSoundQ||[]).push([l,f]); }
function audioClips(){var a=[];project.tracks.forEach(function(t){if(t.kind==="audio")t.clips.forEach(function(c){a.push({t:t,c:c});});});return a;}
function db(x){return x>1e-6?20*Math.log10(x):-120;}
function f1(x){return (Math.round(x*10)/10).toFixed(1);}
var gainAll=function(){return window.__amGain.apply(null,arguments);},peakOf=function(){return window.__amPeak.apply(null,arguments);};
function sel(){var f=getClip();if(!f)throw new Error("Select an audio clip first");if(!f.clip.assetId)throw new Error("This clip has no audio media");return f;}
/* Sound round 2, step 5: Boost +6 dB with a soft limiter, so peaks round off instead of cracking. */
reg("Boost +6 dB",async function(){var o=await window.__amBake("Boost +6 dB",function(ch){return gainAll(ch,2,true);});return "Boosted by 6 dB with soft limiting. Undo restores the original.";});
})();

;
/* ==================== Script 862 id="amiyo-snd26" ==================== */
(function(){
function reg(l,f){ if(window.__amSound) window.__amSound.add(l,f); else (window.__amSoundQ=window.__amSoundQ||[]).push([l,f]); }
function audioClips(){var a=[];project.tracks.forEach(function(t){if(t.kind==="audio")t.clips.forEach(function(c){a.push({t:t,c:c});});});return a;}
function db(x){return x>1e-6?20*Math.log10(x):-120;}
function f1(x){return (Math.round(x*10)/10).toFixed(1);}
var gainAll=function(){return window.__amGain.apply(null,arguments);},peakOf=function(){return window.__amPeak.apply(null,arguments);};
function sel(){var f=getClip();if(!f)throw new Error("Select an audio clip first");if(!f.clip.assetId)throw new Error("This clip has no audio media");return f;}
/* Sound round 2, step 6: noise gate. Lowers hiss and room noise between words to about -26 dB, using the threshold from the panel boxes. */
reg("Noise gate",async function(){var thr=parseFloat(document.getElementById("amThr").value);if(!(thr<=-10&&thr>=-90))thr=-45;
 var o=await window.__amBake("Noise gate",function(ch,sr){var h=Math.floor(sr*0.01),n=Math.floor(ch[0].length/h),open=new Float32Array(n),any=false;
  for(var i=0;i<n;i++){var s=0,cnt=0;ch.forEach(function(a){for(var k=i*h;k<(i+1)*h;k++){s+=a[k]*a[k];cnt++;}});open[i]=20*Math.log10(Math.sqrt(s/cnt)+1e-9)>thr?1:0;}
  var hold=new Float32Array(n),left=0;for(var j=0;j<n;j++){if(open[j]){left=10;hold[j]=1;}else if(left>0){left--;hold[j]=1;}else hold[j]=0;}
  var closed=0.05,gn=new Float32Array(n);var cur=1;for(var q=0;q<n;q++){var tg=hold[q]?1:closed;cur+=(tg-cur)*(tg>cur?0.6:0.25);gn[q]=cur;if(!hold[q])any=true;}
  if(!any)return null;return ch.map(function(a){var o2=new Float32Array(a.length);for(var i2=0;i2<a.length;i2++){var w=Math.min(n-1,Math.floor(i2/h));o2[i2]=a[i2]*gn[w];}return o2;});});
 return o?"Noise below "+thr+" dB reduced. Undo restores the original.":"No noise below "+thr+" dB found.";});
})();

;
/* ==================== Script 863 id="amiyo-snd27" ==================== */
(function(){
function reg(l,f){ if(window.__amSound) window.__amSound.add(l,f); else (window.__amSoundQ=window.__amSoundQ||[]).push([l,f]); }
function audioClips(){var a=[];project.tracks.forEach(function(t){if(t.kind==="audio")t.clips.forEach(function(c){a.push({t:t,c:c});});});return a;}
function db(x){return x>1e-6?20*Math.log10(x):-120;}
function f1(x){return (Math.round(x*10)/10).toFixed(1);}
var gainAll=function(){return window.__amGain.apply(null,arguments);},peakOf=function(){return window.__amPeak.apply(null,arguments);};
function sel(){var f=getClip();if(!f)throw new Error("Select an audio clip first");if(!f.clip.assetId)throw new Error("This clip has no audio media");return f;}
/* Sound round 2, step 7: Voice clean. Rolls off rumble under 90 Hz, adds a little clarity near 3 kHz, evens out loud and quiet words with a gentle compressor, then sets the peak to -1 dB. */
reg("Voice clean",async function(){await window.__amBake("Voice clean",async function(ch,sr){var OC=window.OfflineAudioContext||window.webkitOfflineAudioContext,n=ch[0].length,ctx=new OC(ch.length,n,sr),b=ctx.createBuffer(ch.length,n,sr);
  ch.forEach(function(a,k){b.copyToChannel(a,k);});var s=ctx.createBufferSource();s.buffer=b;
  var hp=ctx.createBiquadFilter();hp.type="highpass";hp.frequency.value=90;hp.Q.value=0.7;
  var pk=ctx.createBiquadFilter();pk.type="peaking";pk.frequency.value=3000;pk.Q.value=1;pk.gain.value=3;
  var cp=ctx.createDynamicsCompressor();cp.threshold.value=-24;cp.knee.value=12;cp.ratio.value=3;cp.attack.value=0.005;cp.release.value=0.15;
  s.connect(hp);hp.connect(pk);pk.connect(cp);cp.connect(ctx.destination);s.start();var r=await ctx.startRendering(),o=[];
  for(var k=0;k<r.numberOfChannels;k++)o.push(r.getChannelData(k).slice());var p=peakOf(o);return p>1e-4?gainAll(o,Math.pow(10,-1/20)/p,false):o;});
 return "Voice clean applied: rumble cut, clearer, evened out, peak -1 dB. Undo restores the original.";});
})();

;
/* ==================== Script 864 id="amiyo-snd28" ==================== */
(function(){
function reg(l,f){ if(window.__amSound) window.__amSound.add(l,f); else (window.__amSoundQ=window.__amSoundQ||[]).push([l,f]); }
function audioClips(){var a=[];project.tracks.forEach(function(t){if(t.kind==="audio")t.clips.forEach(function(c){a.push({t:t,c:c});});});return a;}
function db(x){return x>1e-6?20*Math.log10(x):-120;}
function f1(x){return (Math.round(x*10)/10).toFixed(1);}
var gainAll=function(){return window.__amGain.apply(null,arguments);},peakOf=function(){return window.__amPeak.apply(null,arguments);};
function sel(){var f=getClip();if(!f)throw new Error("Select an audio clip first");if(!f.clip.assetId)throw new Error("This clip has no audio media");return f;}
/* Sound round 2, step 8: Make mono. Mixes a stereo clip down to one channel, which halves the file size and fixes voices that sit on one side only. */
reg("Make mono",async function(){var was=1;var o=await window.__amBake("Make mono",function(ch){was=ch.length;if(ch.length<2)return null;var m=new Float32Array(ch[0].length);
 for(var i=0;i<m.length;i++){var s=0;for(var k=0;k<ch.length;k++)s+=ch[k][i];m[i]=s/ch.length;}return [m];});
 return o?"Mixed "+was+" channels down to mono. Undo restores the original.":"Already mono.";});
})();

;
/* ==================== Script 865 id="amiyo-snd29" ==================== */
(function(){
function reg(l,f){ if(window.__amSound) window.__amSound.add(l,f); else (window.__amSoundQ=window.__amSoundQ||[]).push([l,f]); }
function audioClips(){var a=[];project.tracks.forEach(function(t){if(t.kind==="audio")t.clips.forEach(function(c){a.push({t:t,c:c});});});return a;}
function db(x){return x>1e-6?20*Math.log10(x):-120;}
function f1(x){return (Math.round(x*10)/10).toFixed(1);}
function sel(){var f=getClip();if(!f)throw new Error("Select an audio clip first");if(!f.clip.assetId)throw new Error("This clip has no audio media");return f;}
/* Sound round 2, step 9: Run self-test. Builds a test tone in memory and checks the decoder, silence finder and level maths, so you can see the tools work on your device. */
reg("Run self-test",async function(){var res=[],sr=44100,n=sr*3,d=new Float32Array(n);for(var i=sr;i<2*sr;i++)d[i]=0.5*Math.sin(2*Math.PI*440*i/sr);
 var l=window.__amLevels({d:d,sr:sr});res.push((Math.abs(20*Math.log10(l.peak)+6.02)<0.1?"PASS":"FAIL")+" peak reads -6 dB");
 var s=window.__amSilence({d:d,sr:sr},-45,0.4);res.push((s.length===2&&Math.abs(s[0][1]-1)<0.05&&Math.abs(s[1][0]-2)<0.05?"PASS":"FAIL")+" finds 2 silent gaps");
 var OC=window.OfflineAudioContext||window.webkitOfflineAudioContext;res.push((OC?"PASS":"FAIL")+" audio decoding available");
 res.push((typeof transact==="function"&&typeof getClip==="function"?"PASS":"FAIL")+" editor hooks present");
 res.push((window.__amBake?"PASS":"FAIL")+" boost / clean tools loaded");return res.join("\n");});
})();

;
/* ==================== Script 866 id="amiyo-snd30" ==================== */
(function(){
function reg(l,f){ if(window.__amSound) window.__amSound.add(l,f); else (window.__amSoundQ=window.__amSoundQ||[]).push([l,f]); }
function audioClips(){var a=[];project.tracks.forEach(function(t){if(t.kind==="audio")t.clips.forEach(function(c){a.push({t:t,c:c});});});return a;}
function db(x){return x>1e-6?20*Math.log10(x):-120;}
function f1(x){return (Math.round(x*10)/10).toFixed(1);}
function sel(){var f=getClip();if(!f)throw new Error("Select an audio clip first");if(!f.clip.assetId)throw new Error("This clip has no audio media");return f;}
/* Sound round 2, step 10: tidy up. Shows a hint line under the panel with the currently selected clip's volume and track, and updates the build tag. */
var hint=document.createElement("div");hint.id="amSndHint";hint.style.cssText="font-size:11px;color:#f18752;margin-top:6px";
document.getElementById("amSndOut").after(hint);
setInterval(function(){try{if(document.getElementById("amSndPanel").style.display==="none")return;var f=getClip();
 hint.textContent=f?"Selected: "+f.track.name+" at "+f1(f.clip.start)+" s, volume "+Math.round((f.clip.volume==null?1:f.clip.volume)*100)+"%":"No clip selected";}catch(e){}},500);
window.__amSoundBuild="sound round 2";
})();

;
/* ==================== Script 867 id="amiyo-snd32" ==================== */
(function(){
function reg(l,f){ if(window.__amSound) window.__amSound.add(l,f); else (window.__amSoundQ=window.__amSoundQ||[]).push([l,f]); }
function audioClips(){var a=[];project.tracks.forEach(function(t){if(t.kind==="audio")t.clips.forEach(function(c){a.push({t:t,c:c});});});return a;}
function db(x){return x>1e-6?20*Math.log10(x):-120;}
function f1(x){return (Math.round(x*10)/10).toFixed(1);}
function sel(){var f=getClip();if(!f)throw new Error("Select an audio clip first");if(!f.clip.assetId)throw new Error("This clip has no audio media");return f;}
var D=window.__amDSP=window.__amDSP||{};
function bk(l,p){return window.__amBake(l,p);}
/* Sound round 3, step 2: EQ presets. Five tone shapes (bass boost, bright, warm voice, cut mud, telephone), rendered with high-quality filters. */
D.render=async function(ch,sr,build){var OC=window.OfflineAudioContext||window.webkitOfflineAudioContext,n=ch[0].length,ctx=new OC(ch.length,n,sr),b=ctx.createBuffer(ch.length,n,sr);
 ch.forEach(function(a,k){b.copyToChannel(a,k);});var s=ctx.createBufferSource();s.buffer=b;build(ctx,s).connect(ctx.destination);s.start();
 var r=await ctx.startRendering(),o=[];for(var k=0;k<r.numberOfChannels;k++)o.push(r.getChannelData(k).slice());return o;};
D.chain=function(ctx,s,specs){var last=s;specs.forEach(function(p){var f=ctx.createBiquadFilter();f.type=p[0];f.frequency.value=p[1];f.Q.value=p[2];f.gain.value=p[3]||0;last.connect(f);last=f;});return last;};
D.eq=function(specs){return function(ch,sr){return D.render(ch,sr,function(ctx,s){return D.chain(ctx,s,specs);});};};
var P={"Bass boost":[["lowshelf",120,0.7,5]],"Bright":[["highshelf",6000,0.7,4]],"Warm voice":[["lowshelf",180,0.7,3],["highshelf",8000,0.7,-2]],"Cut mud":[["peaking",300,1,-4]],"Telephone":[["highpass",400,0.7,0],["lowpass",3400,0.7,0],["peaking",1500,1,3]]};
Object.keys(P).forEach(function(k){reg("EQ: "+k,async function(){await bk("EQ "+k,D.eq(P[k]));return "EQ "+k+" applied. Undo restores the original.";});});
})();

;
/* ==================== Script 868 id="amiyo-snd33" ==================== */
(function(){
function reg(l,f){ if(window.__amSound) window.__amSound.add(l,f); else (window.__amSoundQ=window.__amSoundQ||[]).push([l,f]); }
function audioClips(){var a=[];project.tracks.forEach(function(t){if(t.kind==="audio")t.clips.forEach(function(c){a.push({t:t,c:c});});});return a;}
function db(x){return x>1e-6?20*Math.log10(x):-120;}
function f1(x){return (Math.round(x*10)/10).toFixed(1);}
function sel(){var f=getClip();if(!f)throw new Error("Select an audio clip first");if(!f.clip.assetId)throw new Error("This clip has no audio media");return f;}
var D=window.__amDSP=window.__amDSP||{};
function bk(l,p){return window.__amBake(l,p);}
/* Sound round 3, step 3: hum remover. Notch filters at the mains frequency and its first harmonics (50 Hz or 60 Hz), narrow enough to leave voice and music alone. */
D.hum=function(f){return function(ch,sr){return D.render(ch,sr,function(ctx,s){return D.chain(ctx,s,[1,2,3,4].map(function(m){return ["notch",f*m,30,0];}));});};};
reg("Remove hum 50 Hz",async function(){await bk("Remove hum 50 Hz",D.hum(50));return "50 Hz hum and harmonics removed. Undo restores the original.";});
reg("Remove hum 60 Hz",async function(){await bk("Remove hum 60 Hz",D.hum(60));return "60 Hz hum and harmonics removed. Undo restores the original.";});
})();

;
/* ==================== Script 869 id="amiyo-snd34" ==================== */
(function(){
function reg(l,f){ if(window.__amSound) window.__amSound.add(l,f); else (window.__amSoundQ=window.__amSoundQ||[]).push([l,f]); }
function audioClips(){var a=[];project.tracks.forEach(function(t){if(t.kind==="audio")t.clips.forEach(function(c){a.push({t:t,c:c});});});return a;}
function db(x){return x>1e-6?20*Math.log10(x):-120;}
function f1(x){return (Math.round(x*10)/10).toFixed(1);}
function sel(){var f=getClip();if(!f)throw new Error("Select an audio clip first");if(!f.clip.assetId)throw new Error("This clip has no audio media");return f;}
var D=window.__amDSP=window.__amDSP||{};
function bk(l,p){return window.__amBake(l,p);}
/* Sound round 3, step 4: de-esser. Watches the sibilance band around 7 kHz and turns it down only while it spikes (harsh S and T sounds); the rest of the voice is untouched. */
D.deess=async function(ch,sr){var band=await D.render(ch,sr,function(ctx,s){return D.chain(ctx,s,[["bandpass",7000,0.9,0]]);});
 var n=ch[0].length,h=Math.max(8,Math.floor(sr*0.003)),m=Math.floor(n/h),env=new Float32Array(m);
 for(var i=0;i<m;i++){var s=0,c=0;band.forEach(function(a){for(var k=i*h;k<(i+1)*h;k++){s+=a[k]*a[k];c++;}});env[i]=Math.sqrt(s/c);}
 var ss=Array.prototype.slice.call(env).sort(function(a,b){return a-b;}),thr=Math.max(ss[Math.min(ss.length-1,Math.floor(ss.length*0.98))]*0.4,1e-4),g=new Float32Array(m),cur=1,hit=0;
 for(var j=0;j<m;j++){var t=env[j]>thr?Math.pow(thr/env[j],0.9):1;if(t<1)hit++;cur+=(t-cur)*(t<cur?0.7:0.08);g[j]=cur;}
 if(!hit)return null;D.deessHit=hit;
 return ch.map(function(a,k){var o=new Float32Array(a.length),b=band[k];for(var i=0;i<a.length;i++){var w=Math.min(m-1,Math.floor(i/h));o[i]=a[i]+(g[w]-1)*b[i];}return o;});};
reg("De-esser",async function(){var o=await bk("De-esser",D.deess);return o?"Harsh S sounds softened. Undo restores the original.":"No harsh S sounds found.";});
})();

;
/* ==================== Script 870 id="amiyo-snd35" ==================== */
(function(){
function reg(l,f){ if(window.__amSound) window.__amSound.add(l,f); else (window.__amSoundQ=window.__amSoundQ||[]).push([l,f]); }
function audioClips(){var a=[];project.tracks.forEach(function(t){if(t.kind==="audio")t.clips.forEach(function(c){a.push({t:t,c:c});});});return a;}
function db(x){return x>1e-6?20*Math.log10(x):-120;}
function f1(x){return (Math.round(x*10)/10).toFixed(1);}
function sel(){var f=getClip();if(!f)throw new Error("Select an audio clip first");if(!f.clip.assetId)throw new Error("This clip has no audio media");return f;}
var D=window.__amDSP=window.__amDSP||{};
function bk(l,p){return window.__amBake(l,p);}
/* Sound round 3, step 5: peak limiter. Looks 5 ms ahead and smoothly lowers the gain before a peak arrives, so nothing goes above -1 dB and nothing crackles. */
D.limit=function(ch,sr,ceil){var n=ch[0].length,la=Math.max(2,Math.floor(sr*0.005)),pk=new Float32Array(n);
 for(var k=0;k<ch.length;k++){var a=ch[k];for(var i=0;i<n;i++){var v=Math.abs(a[i]);if(v>pk[i])pk[i]=v;}}
 var gt=new Float32Array(n),over=false;for(var i2=0;i2<n;i2++){gt[i2]=pk[i2]>ceil?ceil/pk[i2]:1;if(gt[i2]<1)over=true;}
 if(!over)return ch;
 var gm=new Float32Array(n),dq=[],W=la;/* sliding minimum over [i-W, i+W] */
 var hi=0;for(var i3=0;i3<n;i3++){var end=Math.min(n-1,i3+W);while(hi<=end){while(dq.length&&gt[dq[dq.length-1]]>=gt[hi])dq.pop();dq.push(hi);hi++;}while(dq[0]<i3-W)dq.shift();gm[i3]=gt[dq[0]];}
 var pre=new Float64Array(n+1);for(var i4=0;i4<n;i4++)pre[i4+1]=pre[i4]+gm[i4];var hw=Math.floor(la/2),sm=new Float32Array(n);
 for(var i5=0;i5<n;i5++){var a0=Math.max(0,i5-hw),b0=Math.min(n,i5+hw+1);sm[i5]=(pre[b0]-pre[a0])/(b0-a0);}
 var rel=1/(0.08*sr),prev=1;for(var i6=0;i6<n;i6++){var v2=Math.min(sm[i6],prev+rel);sm[i6]=v2;prev=v2;}
 return ch.map(function(a){var o=new Float32Array(n);for(var i7=0;i7<n;i7++){var y=a[i7]*sm[i7];o[i7]=y>ceil?ceil:y<-ceil?-ceil:y;}return o;});};
reg("Limiter -1 dB",async function(){var changed=true,o=await bk("Limiter -1 dB",function(ch,sr){var r=D.limit(ch,sr,Math.pow(10,-1/20));if(r===ch){changed=false;return null;}return r;});
 return changed?"Peaks held at -1 dB with smooth limiting. Undo restores the original.":"Already under -1 dB, nothing to limit.";});
})();

;
/* ==================== Script 871 id="amiyo-snd36" ==================== */
(function(){
function reg(l,f){ if(window.__amSound) window.__amSound.add(l,f); else (window.__amSoundQ=window.__amSoundQ||[]).push([l,f]); }
function audioClips(){var a=[];project.tracks.forEach(function(t){if(t.kind==="audio")t.clips.forEach(function(c){a.push({t:t,c:c});});});return a;}
function db(x){return x>1e-6?20*Math.log10(x):-120;}
function f1(x){return (Math.round(x*10)/10).toFixed(1);}
function sel(){var f=getClip();if(!f)throw new Error("Select an audio clip first");if(!f.clip.assetId)throw new Error("This clip has no audio media");return f;}
var D=window.__amDSP=window.__amDSP||{};
function bk(l,p){return window.__amBake(l,p);}
/* Sound round 3, step 6: loudness in LUFS (the broadcast and streaming standard, ITU BS.1770 style with gating). Measure it, or normalize the clip to -16 LUFS (podcast / online) with the limiter protecting peaks. */
D.lufs=async function(ch,sr){var k=await D.render(ch,sr,function(ctx,s){return D.chain(ctx,s,[["highshelf",1682,0.7,4],["highpass",38,0.5,0]]);});
 var blk=Math.floor(sr*0.4),hop=Math.floor(sr*0.1),n=k[0].length,ms=[];if(n<blk)return -70;
 for(var i=0;i+blk<=n;i+=hop){var tot=0;k.forEach(function(a){var s=0;for(var j=i;j<i+blk;j++)s+=a[j]*a[j];tot+=s/blk;});ms.push(tot);}
 var L=function(p){return -0.691+10*Math.log10(p+1e-12);},g1=ms.filter(function(p){return L(p)>-70;});if(!g1.length)return -70;
 var m1=g1.reduce(function(a,b){return a+b;},0)/g1.length,g2=g1.filter(function(p){return L(p)>L(m1)-10;});if(!g2.length)return L(m1);
 return L(g2.reduce(function(a,b){return a+b;},0)/g2.length);};
reg("Measure LUFS",async function(){var f=sel(),s=await window.__amMono(f.clip),b=s.buf,i0=Math.floor((f.clip.inPoint||0)*b.sampleRate),ch=[];
 for(var k=0;k<b.numberOfChannels;k++)ch.push(b.getChannelData(k).slice(i0,i0+s.d.length));var v=await D.lufs(ch,b.sampleRate);
 return "Loudness "+f1(v)+" LUFS\nTargets: podcasts -16, YouTube -14, broadcast -23.";});
reg("Set -16 LUFS",async function(){var res=null,o=await bk("Set -16 LUFS",async function(ch,sr){var v=await D.lufs(ch,sr);if(v<=-69)throw new Error("Clip is too quiet to measure");res=v;
 var g=Math.pow(10,(-16-v)/20);return D.limit(ch.map(function(a){var o2=new Float32Array(a.length);for(var i=0;i<a.length;i++)o2[i]=a[i]*g;return o2;}),sr,Math.pow(10,-1/20));});
 return "Was "+f1(res)+" LUFS, now about -16 LUFS (peaks limited to -1 dB). Undo restores the original.";});
})();

;
/* ==================== Script 872 id="amiyo-snd37" ==================== */
(function(){
function reg(l,f){ if(window.__amSound) window.__amSound.add(l,f); else (window.__amSoundQ=window.__amSoundQ||[]).push([l,f]); }
function audioClips(){var a=[];project.tracks.forEach(function(t){if(t.kind==="audio")t.clips.forEach(function(c){a.push({t:t,c:c});});});return a;}
function db(x){return x>1e-6?20*Math.log10(x):-120;}
function f1(x){return (Math.round(x*10)/10).toFixed(1);}
function sel(){var f=getClip();if(!f)throw new Error("Select an audio clip first");if(!f.clip.assetId)throw new Error("This clip has no audio media");return f;}
var D=window.__amDSP=window.__amDSP||{};
function bk(l,p){return window.__amBake(l,p);}
/* Sound round 3, step 7: anti-click fades. Gives every clip on the selected track a 10 ms fade at each edge, which removes the pop heard at hard cuts. */
reg("Anti-click fades",function(){var f=getClip(),t=f?f.track:project.tracks.find(function(x){return x.kind==="audio";});if(!t)throw new Error("No audio track");var n=0;
 transact("Anti-click fades",function(){t.clips.forEach(function(c){var m=Math.min(0.01,c.duration/4);if((c.fadeIn||0)<m){c.fadeIn=m;n++;}if((c.fadeOut||0)<m){c.fadeOut=m;n++;}});});
 return "Added 10 ms edge fades to "+t.clips.length+" clip(s) on "+t.name+".";});
})();

;
/* ==================== Script 873 id="amiyo-snd38" ==================== */
(function(){
function reg(l,f){ if(window.__amSound) window.__amSound.add(l,f); else (window.__amSoundQ=window.__amSoundQ||[]).push([l,f]); }
function audioClips(){var a=[];project.tracks.forEach(function(t){if(t.kind==="audio")t.clips.forEach(function(c){a.push({t:t,c:c});});});return a;}
function db(x){return x>1e-6?20*Math.log10(x):-120;}
function f1(x){return (Math.round(x*10)/10).toFixed(1);}
function sel(){var f=getClip();if(!f)throw new Error("Select an audio clip first");if(!f.clip.assetId)throw new Error("This clip has no audio media");return f;}
var D=window.__amDSP=window.__amDSP||{};
function bk(l,p){return window.__amBake(l,p);}
/* Sound round 3, step 8: tighten pauses. Unlike Cut silences (which removes gaps completely), this shortens each long pause to about 0.25 s so speech keeps a natural rhythm. */
reg("Tighten pauses",async function(){var f=sel(),c=f.clip,t=f.track;if((c.speed||1)!==1)throw new Error("Only works at normal speed");if(t.locked)throw new Error("Track is locked");
 var m=await window.__amMono(c),sil=window.__amSilence(m,-45,0.4),pad=0.125,dur=m.d.length/m.sr,keep=[],p=0;
 sil.forEach(function(x){if(x[1]-x[0]>2*pad+0.1){var a=x[0]+pad,b=x[1]-pad;if(a>p)keep.push([p,a]);p=b;}});if(p<dur)keep.push([p,dur]);
 if(keep.length<2)return "No pauses longer than 0.5 s to tighten.";
 var orig=JSON.parse(JSON.stringify(c)),end=orig.start+orig.duration,pos=orig.start,made=[];
 keep.forEach(function(k,i){var n=JSON.parse(JSON.stringify(orig));n.id=i?uid("clip"):orig.id;n.inPoint=orig.inPoint+k[0];n.outPoint=orig.inPoint+k[1];n.duration=k[1]-k[0];n.start=pos;
  n.fadeIn=i?0.01:(orig.fadeIn||0);n.fadeOut=i<keep.length-1?0.01:(orig.fadeOut||0);pos+=n.duration;made.push(n);});
 var removed=orig.duration-(pos-orig.start);
 transact("Tighten pauses",function(){t.clips=t.clips.filter(function(x){return x.id!==orig.id;});t.clips.forEach(function(x){if(x.start>=end-.001)x.start=Math.max(0,x.start-removed);});t.clips=t.clips.concat(made);});
 selectedClipId=orig.id;return "Shortened pauses, saving "+f1(removed)+" s. Clip is now "+made.length+" pieces with soft edges.";});
})();

;
/* ==================== Script 874 id="amiyo-snd39" ==================== */
(function(){
function reg(l,f){ if(window.__amSound) window.__amSound.add(l,f); else (window.__amSoundQ=window.__amSoundQ||[]).push([l,f]); }
function audioClips(){var a=[];project.tracks.forEach(function(t){if(t.kind==="audio")t.clips.forEach(function(c){a.push({t:t,c:c});});});return a;}
function db(x){return x>1e-6?20*Math.log10(x):-120;}
function f1(x){return (Math.round(x*10)/10).toFixed(1);}
function sel(){var f=getClip();if(!f)throw new Error("Select an audio clip first");if(!f.clip.assetId)throw new Error("This clip has no audio media");return f;}
var D=window.__amDSP=window.__amDSP||{};
function bk(l,p){return window.__amBake(l,p);}
/* Sound round 3, step 9: waveform view. Draws the selected clip inside the panel: silent stretches shaded blue, clipped peaks red, and a white line where the playhead is. */
var cv=document.createElement("canvas");cv.id="amSndWave";cv.width=640;cv.height=120;cv.style.cssText="width:100%;height:60px;border-radius:6px;background:#20110a;margin-top:8px;display:none";cv.setAttribute("aria-label","Waveform of the selected clip");cv.setAttribute("role","img");
document.getElementById("amSndOut").after(cv);
reg("Show waveform",async function(){var f=sel(),c=f.clip,m=await window.__amMono(c),W=cv.width,H=cv.height,x=cv.getContext("2d");cv.style.display="block";
 x.clearRect(0,0,W,H);var sil=window.__amSilence(m,-45,0.4),dur=m.d.length/m.sr;x.fillStyle="rgba(238,114,52,.28)";sil.forEach(function(s){x.fillRect(s[0]/dur*W,0,Math.max(1,(s[1]-s[0])/dur*W),H);});
 var per=m.d.length/W,mid=H/2;for(var px=0;px<W;px++){var a=Math.floor(px*per),b=Math.min(m.d.length,Math.floor((px+1)*per)),mn=0,mx=0;for(var i=a;i<b;i++){var v=m.d[i];if(v<mn)mn=v;if(v>mx)mx=v;}
  x.fillStyle=(mx>=0.999||mn<=-0.999)?"#ff5a5a":"#6fd0a0";x.fillRect(px,mid-mx*mid,1,Math.max(1,(mx-mn)*mid));}
 var ph=(currentTime-c.start)/c.duration;if(ph>=0&&ph<=1){x.fillStyle="#fff";x.fillRect(Math.floor(ph*W),0,2,H);}
 return "Waveform of the clip ("+f1(dur)+" s). Blue = silence, red = clipping, white line = playhead.";});
})();

;
/* ==================== Script 875 id="amiyo-snd40" ==================== */
(function(){
function reg(l,f){ if(window.__amSound) window.__amSound.add(l,f); else (window.__amSoundQ=window.__amSoundQ||[]).push([l,f]); }
function audioClips(){var a=[];project.tracks.forEach(function(t){if(t.kind==="audio")t.clips.forEach(function(c){a.push({t:t,c:c});});});return a;}
function db(x){return x>1e-6?20*Math.log10(x):-120;}
function f1(x){return (Math.round(x*10)/10).toFixed(1);}
function sel(){var f=getClip();if(!f)throw new Error("Select an audio clip first");if(!f.clip.assetId)throw new Error("This clip has no audio media");return f;}
var D=window.__amDSP=window.__amDSP||{};
function bk(l,p){return window.__amBake(l,p);}
/* Sound round 3, step 10: Podcast clean, one tap. Voice clean, then de-esser, then -16 LUFS with limiter, in a single step you can undo in one go. */
reg("Podcast clean",async function(){var info="";var o=await bk("Podcast clean",async function(ch,sr){
 var v=await D.render(ch,sr,function(ctx,s){var last=D.chain(ctx,s,[["highpass",90,0.7,0],["peaking",3000,1,3]]);var cp=ctx.createDynamicsCompressor();cp.threshold.value=-24;cp.knee.value=12;cp.ratio.value=3;cp.attack.value=0.005;cp.release.value=0.15;last.connect(cp);return cp;});
 var d=await D.deess(v,sr);if(d)v=d;var l=await D.lufs(v,sr);if(l<=-69)throw new Error("Clip is too quiet to measure");var g=Math.pow(10,(-16-l)/20);
 info="Was "+f1(l)+" LUFS after cleaning.";return D.limit(v.map(function(a){var o2=new Float32Array(a.length);for(var i=0;i<a.length;i++)o2[i]=a[i]*g;return o2;}),sr,Math.pow(10,-1/20));});
 return "Podcast clean done: rumble cut, clearer, harsh S softened, -16 LUFS, peaks at -1 dB.\n"+info+" One Undo restores the original.";});
window.__amSoundBuild="sound round 3";
})();

;
/* ==================== Script 876 id="amiyo-screen-fit-js" ==================== */
(function(){
  var r=document.documentElement,t;
  function fit(){
    var vv=window.visualViewport,h=vv?vv.height:innerHeight,w=innerWidth,b=document.body;
    r.style.setProperty("--am-h",h+"px");
    b.classList.remove("am-phone","am-tablet","am-laptop");
    b.classList.add(w<700?"am-phone":w<=1024?"am-tablet":"am-laptop");
    b.classList.toggle("am-land",w>h);
  }
  function later(){clearTimeout(t);t=setTimeout(function(){fit();window.dispatchEvent(new Event("resize"));},220);}
  fit();
  addEventListener("resize",fit);
  addEventListener("orientationchange",later);
  if(window.visualViewport) visualViewport.addEventListener("resize",fit);
})();

;
/* ==================== Script 877 id="amiyo-s01-touch-js" ==================== */
window.AMIYO_STEP=1;

;
/* ==================== Script 878 id="amiyo-s02-status-overlap" ==================== */
/* Step 2: the floating time/clip-count chip (#amS3chip) used to sit on top of the "No clip selected" status bar. It now stays just above that bar on every screen size. */
(function(){
  "use strict"; window.AMIYO_STEP=2;
  var ro=null, tries=0;
  function place(){
    try{
      var c=document.getElementById("amS3chip"), b=(document.getElementById("v11bar")||document.querySelector(".v11bar"));
      if(!c||!b) return false;
      var r=b.getBoundingClientRect(); if(!r.height||!r.width) return false;
      var vh=document.documentElement.clientHeight||window.innerHeight;
      if(r.top>=vh-4||r.bottom<=0){ c.style.removeProperty("top"); c.style.removeProperty("bottom"); return true; }   /* bar is off screen (e.g. landscape): leave the app's own placement */
      var bot=Math.max(0,Math.round(vh-r.top+4));
      if(c.style.getPropertyValue("bottom")!==bot+"px"||c.style.getPropertyPriority("bottom")!=="important"){ c.style.setProperty("top","auto","important"); c.style.setProperty("bottom",bot+"px","important"); }
      return true;
    }catch(e){ return false; }
  }
  function start(){
    if(!place()&&tries++<40){ setTimeout(start,500); return; }
    var b=(document.getElementById("v11bar")||document.querySelector(".v11bar"));
    try{ if(window.ResizeObserver&&b){ ro=new ResizeObserver(place); ro.observe(b); ro.observe(document.documentElement); } }catch(e){}
    window.addEventListener("resize",place,{passive:true}); window.addEventListener("orientationchange",function(){ setTimeout(place,300); },{passive:true});
    try{ if(window.visualViewport) window.visualViewport.addEventListener("resize",place,{passive:true}); }catch(e){}
    place();
  }
  if(document.readyState==="complete") start(); else window.addEventListener("load",start);
})();

;
/* ==================== Script 879 id="amiyo-fl-step01-sequencer" ==================== */
/* =========================================================================
   AMIYO FL STEP 01 — Music Studio panel + drum step sequencer
   FL Studio Mobile style: 8 synth drums x 16 steps, BPM, swing, beat presets.
   Tap a step: off -> on -> accent -> off. Mouse users can drag to paint.
   Sound is made with Web Audio; no files needed. The voice() function takes
   any audio context so step 2 can reuse it to bounce the pattern to the timeline.
   ========================================================================= */
(function(){
"use strict";
if(window.__amiyoMusicS01) return; window.__amiyoMusicS01=true;

var STEPS=16, KEY="amiyoMusicStudio";
var DRUMS=[
  {id:"kick",name:"Kick",color:"#ff6b4a"},
  {id:"snare",name:"Snare",color:"#ffb04a"},
  {id:"clap",name:"Clap",color:"#ffe14a"},
  {id:"chat",name:"Hat",color:"#7be06a"},
  {id:"ohat",name:"Open hat",color:"#4ad6b0"},
  {id:"tom",name:"Tom",color:"#ff864a"},
  {id:"rim",name:"Rim",color:"#ffa77b"},
  {id:"bell",name:"Bell",color:"#ff7bd0"}
];
function emptyRows(){ return DRUMS.map(function(){ return new Array(STEPS).fill(0); }); }
function P(s){ return s.replace(/\s/g,"").split("").map(function(c){ return c==="x"?1:c==="X"?2:0; }); }
var PRESETS={
  "Four on floor":[ "X...X...X...X...", "....x.......x...", "................", "..x...x...x...x.", "................", "................", "................", "................" ],
  "Hip-hop":[ "X.....x...x.....", "....X.......X...", "................", "x.x.x.x.x.x.x.x.", "..............x.", "................", "......x.........", "................" ],
  "Trap":[ "X.....x...x.....", "........X.......", "........x.......", "xxxxxxxxxxxxxxxx", "..............x.", "................", "................", "................" ],
  "Breakbeat":[ "X.........X.....", "....X..x.x..X...", "................", "x.x.x.x.x.x.x.x.", "......x.........", "..............x.", "................", "................" ],
  "Latin":[ "X..x..X...X.x...", "................", "................", "x.xxx.xx.xxx.xx.", "................", "..x.....x.......", "x..x..x...x..x..", "x...x..x.x...x.." ]
};
var S={bpm:100,swing:0,vol:.9,rows:emptyRows(),mute:DRUMS.map(function(){return false;}),playing:false,step:-1};

function load(){ try{ var j=JSON.parse(localStorage.getItem(KEY)||"null"); if(j&&j.rows&&j.rows.length===DRUMS.length){ S.bpm=clamp(+j.bpm||100,40,240); S.swing=clamp(+j.swing||0,0,60); S.vol=clamp(j.vol==null?.9:+j.vol,0,1); S.rows=j.rows.map(function(r){ var o=new Array(STEPS).fill(0); for(var i=0;i<STEPS;i++) o[i]=r[i]===2?2:r[i]?1:0; return o; }); if(j.mute&&j.mute.length===DRUMS.length) S.mute=j.mute.map(Boolean); } }catch(e){} }
function save(){ try{ localStorage.setItem(KEY,JSON.stringify({bpm:S.bpm,swing:S.swing,vol:S.vol,rows:S.rows,mute:S.mute})); }catch(e){} }
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
load();

/* ---------------- sound engine ---------------- */
var noiseCache=new WeakMap();
function noiseBuf(ctx){ var b=noiseCache.get(ctx); if(b) return b; var n=Math.floor(ctx.sampleRate*1.0), buf=ctx.createBuffer(1,n,ctx.sampleRate), d=buf.getChannelData(0); for(var i=0;i<n;i++) d[i]=Math.random()*2-1; noiseCache.set(ctx,buf); return buf; }
function env(g,t,peak,dec){ g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(peak,t+0.002); g.gain.exponentialRampToValueAtTime(0.0001,t+dec); }
function noise(ctx,dest,t,dur,type,freq,q,peak,dec){
  var s=ctx.createBufferSource(); s.buffer=noiseBuf(ctx);
  var f=ctx.createBiquadFilter(); f.type=type; f.frequency.value=freq; f.Q.value=q||1;
  var g=ctx.createGain(); env(g,t,peak,dec); s.connect(f); f.connect(g); g.connect(dest);
  s.start(t,Math.random()*0.5); s.stop(t+dur);
}
function tone(ctx,dest,t,type,f0,f1,fdur,peak,dec){
  var o=ctx.createOscillator(); o.type=type; o.frequency.setValueAtTime(f0,t);
  if(f1&&f1!==f0) o.frequency.exponentialRampToValueAtTime(f1,t+fdur);
  var g=ctx.createGain(); env(g,t,peak,dec); o.connect(g); g.connect(dest); o.start(t); o.stop(t+dec+0.05);
}
function voice(ctx,dest,id,t,vel){
  var v=vel==null?0.8:vel; if(window.amiyoMusic&&window.amiyoMusic.sampleVoice&&window.amiyoMusic.sampleVoice(ctx,dest,id,t,v)) return;
  if(id==="kick"){ tone(ctx,dest,t,"sine",160,45,0.12,1.0*v,0.5); noise(ctx,dest,t,0.02,"highpass",3000,1,0.25*v,0.015); }
  else if(id==="snare"){ noise(ctx,dest,t,0.25,"bandpass",1900,0.8,0.8*v,0.2); tone(ctx,dest,t,"triangle",220,160,0.06,0.5*v,0.12); }
  else if(id==="clap"){ for(var i=0;i<3;i++) noise(ctx,dest,t+i*0.011,0.05,"bandpass",1300,1.2,0.6*v,0.04); noise(ctx,dest,t+0.033,0.3,"bandpass",1300,1.2,0.7*v,0.22); }
  else if(id==="chat"){ noise(ctx,dest,t,0.08,"highpass",7500,0.7,0.45*v,0.05); }
  else if(id==="ohat"){ noise(ctx,dest,t,0.4,"highpass",7000,0.7,0.4*v,0.32); }
  else if(id==="tom"){ tone(ctx,dest,t,"sine",210,90,0.18,0.9*v,0.4); }
  else if(id==="rim"){ tone(ctx,dest,t,"square",820,780,0.01,0.25*v,0.04); noise(ctx,dest,t,0.04,"highpass",2500,1,0.25*v,0.03); }
  else if(id==="bell"){ var bp=ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=700; bp.Q.value=1.2; bp.connect(dest); tone(ctx,bp,t,"square",540,540,0,0.35*v,0.25); tone(ctx,bp,t,"square",800,800,0,0.35*v,0.25); }
}
window.amiyoMusic={voice:voice,drums:DRUMS,state:S,steps:STEPS,stepDur:function(){return 60/S.bpm/4;},extras:[],liveCtx:function(){ return ctx; },barHooks:[],repaint:function(){ repaint(); },paintCell:function(r,i){ paintCell(r,i); },save:function(){ save(); },hooks:[],heads:[],hasNotes:[],audio:function(){ return ensureCtx()?{ctx:ctx,master:master}:null; }};

var ctx=null, master=null, timer=0, nextT=0, nextStep=0, queue=[], barCount=0;
function ensureCtx(){
  if(!ctx){ var AC=window.AudioContext||window.webkitAudioContext; if(!AC) return false; ctx=new AC(); master=ctx.createGain(); master.gain.value=S.vol; var lim=ctx.createDynamicsCompressor(); lim.threshold.value=-6; lim.ratio.value=8; master.connect(lim); lim.connect(ctx.destination); }
  if(ctx.state==="suspended") ctx.resume();
  return true;
}
function stepDur(){ return 60/S.bpm/4; }
function schedule(){
  if(!S.playing) return;
  var ahead=document.hidden?1.2:0.12;
  while(nextT<ctx.currentTime+ahead){
    if(nextStep===0){ var bh=window.amiyoMusic.barHooks; for(var bk=0;bk<bh.length;bk++){ try{ bh[bk](barCount); }catch(e){} } barCount++; }
    var i=nextStep, t=nextT+((i%2===1)?(S.swing/100)*stepDur():0);
    for(var r=0;r<DRUMS.length;r++){ var v=S.rows[r][i]; if(v&&!S.mute[r]) window.amiyoMusic.voice(ctx,master,DRUMS[r].id,t,v===2?1:0.65); }
    for(var hk=0;hk<window.amiyoMusic.hooks.length;hk++){ try{ window.amiyoMusic.hooks[hk](i,t,stepDur(),ctx,master); }catch(e){} }
    queue.push({t:t,i:i});
    nextT+=stepDur(); nextStep=(nextStep+1)%STEPS;
  }
  timer=setTimeout(schedule,25);
}
function play(){ if(S.playing) return; if(!ensureCtx()){ toastMsg("Audio is not supported in this browser"); return; } S.playing=true; nextStep=0; barCount=0; nextT=ctx.currentTime+0.06; queue=[]; schedule(); requestAnimationFrame(tick); setPlayBtn(); }
function stop(){ S.playing=false; clearTimeout(timer); queue=[]; S.step=-1; paintHead(); setPlayBtn(); }
function tick(){
  if(!S.playing) return;
  var now=ctx.currentTime, cur=-1;
  while(queue.length&&queue[0].t<=now){ var it=queue.shift(); cur=it.i; S.stepT=it.t; }
  if(cur>=0&&cur!==S.step){ S.step=cur; paintHead(); }
  requestAnimationFrame(tick);
}
function toastMsg(m){ try{ if(typeof toast==="function") toast(m); }catch(e){} }

/* ---------------- UI ---------------- */
var CSS=".amm{padding:8px;display:flex;flex-direction:column;gap:8px;font-size:12px}"
+".amm h3{margin:0;font-size:12px}"
+".amm .row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.amm .row.tr{flex-wrap:nowrap}.amm .row.tr .play{min-width:64px;padding:0 6px}.amm .row.tr .val{min-width:30px;text-align:center}"
+".amm button{min-height:34px;min-width:34px;border-radius:8px;border:1px solid var(--line,#3a3f4b);background:var(--panel2,#222733);color:inherit;font:inherit;cursor:pointer;touch-action:manipulation}"
+".amm button.on{background:#f6712f;border-color:#f6712f;color:#fff}"
+".amm .play{min-width:78px;font-weight:700}"
+".amm .play.on{background:#e5484d;border-color:#e5484d}"
+".amm input[type=range]{flex:1;min-width:50px;touch-action:pan-y}"
+".amm .lab{width:44px;flex:none;font-size:11px;color:var(--muted,#9aa3b2)}"
+".amm .val{min-width:34px;text-align:right;font-variant-numeric:tabular-nums}"
+".amm .gridwrap{overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch}"
+".amm .grid{display:grid;gap:4px;min-width:max-content}"
+".amm .gr{display:flex;align-items:center;gap:3px}"
+".amm .nm{position:sticky;left:0;z-index:1;width:68px;flex:none;display:flex;align-items:center;gap:4px;background:var(--panel,#171a21);padding-right:4px}"
+".amm .nm button{min-height:26px;min-width:26px;padding:0;font-size:11px}"
+".amm .nm span{font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}"
+".amm .st{width:26px;height:34px;flex:none;border-radius:6px;border:1px solid #3a3f4b;background:#222733;padding:0;position:relative}"
+".amm .st.b{background:#2a303d}"
+".amm .st.h{outline:2px solid #fff;outline-offset:-2px}"
+".amm .gap{width:6px;flex:none}"
+".amm .hint{color:var(--muted,#9aa3b2);font-size:11px;line-height:1.4}"
+"html[data-theme=light] .amm .st[style*=background]{filter:hue-rotate(180deg) invert(1)}";
function addCss(){ if(document.getElementById("amm-css")) return; var s=document.createElement("style"); s.id="amm-css"; s.textContent=CSS; document.head.appendChild(s); }

function html(){
  var h='<div class="panel-card amm" id="amMusicRoot"><h3>Music Studio — Drum Sequencer</h3>'
  +'<div class="row tr"><button class="play'+(S.playing?' on':'')+'" id="amPlay">'+(S.playing?'■ Stop':'▶ Play')+'</button>'
  +'<button id="amBpmDn" aria-label="Slower">−</button><span class="val" id="amBpmV">'+S.bpm+'</span><button id="amBpmUp" aria-label="Faster">+</button><span class="lab" style="width:auto">BPM</span></div>'
  +'<div class="row tr"><span class="lab">Tempo</span><input type="range" id="amBpm" min="40" max="240" value="'+S.bpm+'" aria-label="Tempo"></div>'
  +'<div class="row tr"><span class="lab">Swing</span><input type="range" id="amSwing" min="0" max="60" value="'+S.swing+'" aria-label="Swing"><span class="val" id="amSwingV">'+S.swing+'%</span></div>'
  +'<div class="row tr"><span class="lab">Volume</span><input type="range" id="amVol" min="0" max="100" value="'+Math.round(S.vol*100)+'" aria-label="Volume"></div>'
  +'<div class="gridwrap"><div class="grid" id="amGrid">';
  for(var r=0;r<DRUMS.length;r++){
    h+='<div class="gr" data-r="'+r+'"><div class="nm"><button data-m="'+r+'" class="'+(S.mute[r]?'':'on')+'" title="Mute / unmute" aria-label="Mute '+DRUMS[r].name+'">'+(S.mute[r]?'M':'♪')+'</button><span>'+DRUMS[r].name+'</span></div>';
    for(var i=0;i<STEPS;i++){
      var v=S.rows[r][i]; if(i&&i%4===0) h+='<div class="gap"></div>';
      h+='<button class="st'+(Math.floor(i/4)%2?' b':'')+'" data-r="'+r+'" data-i="'+i+'" aria-label="'+DRUMS[r].name+' step '+(i+1)+'" style="'+stStyle(r,v)+'"></button>';
    }
    h+='</div>';
  }
  h+='</div></div>'
  +'<div class="row" id="amPresets">';
  Object.keys(PRESETS).forEach(function(k){ h+='<button data-p="'+k+'">'+k+'</button>'; });
  h+='</div><div class="row"><button id="amRand">Random</button><button id="amClear">Clear</button></div>'
  +'<div class="hint">Tap a step: on, then accent (brighter), then off. Tap ♪ to mute a drum. Scroll the grid sideways on small screens.</div></div>';
  return h;
}
function stStyle(r,v){ if(!v) return ""; var c=DRUMS[r].color; return "background:"+c+";border-color:"+c+";opacity:"+(v===2?1:0.6)+";box-shadow:"+(v===2?"inset 0 0 0 2px rgba(255,255,255,.7)":"none"); }
function paintCell(r,i){ var el=document.querySelector('#amGrid .st[data-r="'+r+'"][data-i="'+i+'"]'); if(!el) return; var v=S.rows[r][i]; el.style.cssText=stStyle(r,v); }
function paintHead(){ var g=document.getElementById("amGrid"); if(!g) return; var old=g.querySelectorAll(".st.h"); for(var k=0;k<old.length;k++) old[k].classList.remove("h"); if(S.step>=0){ var n=g.querySelectorAll('.st[data-i="'+S.step+'"]'); for(var j=0;j<n.length;j++) n[j].classList.add("h"); } var hs=window.amiyoMusic.heads; for(var q=0;q<hs.length;q++){ try{ hs[q](S.step); }catch(e){} } }
function setPlayBtn(){ var b=document.getElementById("amPlay"); if(!b) return; b.textContent=S.playing?"■ Stop":"▶ Play"; b.classList.toggle("on",S.playing); }
function setBpm(v){ S.bpm=clamp(Math.round(v),40,240); var a=document.getElementById("amBpmV"), b=document.getElementById("amBpm"); if(a) a.textContent=S.bpm; if(b) b.value=S.bpm; save(); }

var dragVal=null, painting=false;
function bind(){
  var root=document.getElementById("amMusicRoot"); if(!root) return;
  document.getElementById("amPlay").onclick=function(){ S.playing?stop():play(); };
  document.getElementById("amBpmDn").onclick=function(){ setBpm(S.bpm-1); };
  document.getElementById("amBpmUp").onclick=function(){ setBpm(S.bpm+1); };
  document.getElementById("amBpm").oninput=function(){ setBpm(+this.value); };
  document.getElementById("amSwing").oninput=function(){ S.swing=+this.value; document.getElementById("amSwingV").textContent=S.swing+"%"; save(); };
  document.getElementById("amVol").oninput=function(){ S.vol=+this.value/100; if(master) master.gain.value=S.vol; save(); };
  document.getElementById("amRand").onclick=function(){ for(var r=0;r<DRUMS.length;r++) for(var i=0;i<STEPS;i++){ var p=r===0?(i%4===0?.8:.12):r===1?(i%8===4?.9:.08):r===3?.55:.12; S.rows[r][i]=Math.random()<p?(Math.random()<.2?2:1):0; } save(); repaint(); };
  document.getElementById("amClear").onclick=function(){ S.rows=emptyRows(); save(); repaint(); };
  var pr=root.querySelectorAll("#amPresets button"); for(var k=0;k<pr.length;k++) pr[k].onclick=function(){ var rows=PRESETS[this.dataset.p]; S.rows=rows.map(P); save(); repaint(); };
  var ms=root.querySelectorAll("button[data-m]"); for(var m=0;m<ms.length;m++) ms[m].onclick=function(){ var r=+this.dataset.m; S.mute[r]=!S.mute[r]; this.classList.toggle("on",!S.mute[r]); this.textContent=S.mute[r]?"M":"♪"; save(); };
  var grid=document.getElementById("amGrid");
  grid.onpointerdown=function(e){
    var b=e.target.closest&&e.target.closest(".st"); if(!b) return;
    var r=+b.dataset.r, i=+b.dataset.i, cur=S.rows[r][i];
    var nv=(cur+1)%3; S.rows[r][i]=nv; paintCell(r,i); save();
    if(nv&&ctx&&!S.playing){ window.amiyoMusic.voice(ctx,master,DRUMS[r].id,ctx.currentTime+0.01,nv===2?1:0.65); }
    else if(nv&&!S.playing&&ensureCtx()){ window.amiyoMusic.voice(ctx,master,DRUMS[r].id,ctx.currentTime+0.01,nv===2?1:0.65); }
    if(e.pointerType==="mouse"){ painting=true; dragVal=nv===0?0:1; }
  };
  grid.onpointerover=function(e){
    if(!painting||e.pointerType!=="mouse") return;
    var b=e.target.closest&&e.target.closest(".st"); if(!b) return;
    var r=+b.dataset.r, i=+b.dataset.i; if(S.rows[r][i]!==dragVal){ S.rows[r][i]=dragVal; paintCell(r,i); save(); }
  };
  var ex=window.amiyoMusic.extras; for(var q=0;q<ex.length;q++){ try{ ex[q](root); }catch(e){ try{ console.error(e); }catch(x){} } }
}
window.addEventListener("pointerup",function(){ painting=false; });
function repaint(){ var lp=document.getElementById("leftPanel"); if(lp&&activePanelIsMusic()){ lp.innerHTML=html(); bind(); paintHead(); } }
function activePanelIsMusic(){ try{ return activePanel==="music"; }catch(e){ return false; } }

/* ---------------- hook into the left panel + nav ---------------- */
var prev=window.renderLeftPanel;
window.renderLeftPanel=function(){
  if(activePanelIsMusic()){
    var lp=document.getElementById("leftPanel");
    if(lp&&!document.getElementById("amMusicRoot")){ addCss(); lp.innerHTML=html(); bind(); paintHead(); }
    return;
  }
  if(typeof prev==="function") return prev.apply(this,arguments);
};
function addNav(){
  var nav=document.getElementById("nav"); if(!nav||nav.querySelector('[data-panel="music"]')) return;
  var b=document.createElement("button"); b.className="navbtn"; b.setAttribute("data-panel","music"); b.innerHTML='<span class="dot"></span>Music';
  var rec=nav.querySelector('[data-panel="record"]'); if(rec&&rec.parentNode===nav) nav.insertBefore(b,rec.nextSibling); else nav.appendChild(b);
  b.addEventListener("click",function(){
    try{ activePanel="music"; }catch(e){}
    nav.querySelectorAll(".navbtn").forEach(function(x){ x.classList.toggle("active",x===b); });
    var lp=document.getElementById("leftPanel"); if(lp&&!document.getElementById("amMusicRoot")){ addCss(); lp.innerHTML=html(); bind(); paintHead(); }
    try{ var r=document.getElementById("amMusicRoot"); if(r) r.scrollIntoView({block:"nearest",behavior:"smooth"}); }catch(e){}
  });
}
addNav();
/* other panels' buttons replace the panel; stop the beat only if the person asks (it keeps playing while they edit) */
})();

;
/* ==================== Script 880 id="amiyo-fl-step02-bounce" ==================== */
/* =========================================================================
   AMIYO FL STEP 02 — Bounce the drum pattern to an audio clip
   Renders the pattern (1, 2, 4 or 8 bars) faster than real time with the same
   sounds and limiter, makes a 16-bit WAV, then either adds it to the timeline
   as an audio clip or saves it as a file.
   ========================================================================= */
(function(){
"use strict";
if(window.__amiyoMusicS02||!window.amiyoMusic) return; window.__amiyoMusicS02=true;
var M=window.amiyoMusic, S=M.state, busy=false, bars=4, used=4;

function say(m){ try{ if(typeof toast==="function") toast(m); }catch(e){} }
function hasNotes(){ for(var q=0;q<M.hasNotes.length;q++){ try{ if(M.hasNotes[q]()) return true; }catch(e){} } for(var r=0;r<M.drums.length;r++){ if(S.mute[r]) continue; for(var i=0;i<M.steps;i++) if(S.rows[r][i]) return true; } return false; }

function render(nBars){
  var OAC=window.OfflineAudioContext||window.webkitOfflineAudioContext; if(!OAC) return Promise.reject(new Error("Offline audio is not supported in this browser"));
  var sr=44100, sd=M.stepDur(), len=nBars*M.steps*sd+(M.tailSec?M.tailSec():1.2);
  var ctx=new OAC(2,Math.ceil(sr*len),sr);
  var master=ctx.createGain(); master.gain.value=S.vol;
  var lim=ctx.createDynamicsCompressor(); lim.threshold.value=-6; lim.ratio.value=8; master.connect(lim); lim.connect(ctx.destination);
  for(var b=0;b<nBars;b++){ if(M.onBounceBar){ try{ M.onBounceBar(b); }catch(e){} } for(var i=0;i<M.steps;i++){
    var t=(b*M.steps+i)*sd+((i%2===1)?(S.swing/100)*sd:0);
    for(var r=0;r<M.drums.length;r++){ var v=S.rows[r][i]; if(v&&!S.mute[r]) M.voice(ctx,master,M.drums[r].id,t,v===2?1:0.65); }
    for(var h=0;h<M.hooks.length;h++){ try{ M.hooks[h](i,t,sd,ctx,master); }catch(e){} }
  } }
  if(M.onBounceEnd){ try{ M.onBounceEnd(); }catch(e){} }
  /* cut the file to exactly the bars plus the sound tail so loops line up */
  return ctx.startRendering().then(function(buf){ return {buf:buf,loopLen:nBars*M.steps*sd}; });
}
function wav(buf){
  var ch=buf.numberOfChannels, n=buf.length, sr=buf.sampleRate, bytes=44+n*ch*2, ab=new ArrayBuffer(bytes), v=new DataView(ab);
  function w(o,s){ for(var i=0;i<s.length;i++) v.setUint8(o+i,s.charCodeAt(i)); }
  w(0,"RIFF"); v.setUint32(4,bytes-8,true); w(8,"WAVE"); w(12,"fmt "); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,ch,true); v.setUint32(24,sr,true); v.setUint32(28,sr*ch*2,true); v.setUint16(32,ch*2,true); v.setUint16(34,16,true); w(36,"data"); v.setUint32(40,n*ch*2,true);
  var d=[],o=44,i,c; for(c=0;c<ch;c++) d.push(buf.getChannelData(c));
  for(i=0;i<n;i++) for(c=0;c<ch;c++){ var x=Math.max(-1,Math.min(1,d[c][i])); v.setInt16(o,x<0?x*32768:x*32767,true); o+=2; }
  return new Blob([ab],{type:"audio/wav"});
}
function name(){ return "Drum pattern "+S.bpm+"bpm "+used+" bar"+(used>1?"s":"")+" "+Date.now().toString(36).slice(-4)+".wav"; }
function setBusy(on,txt){ busy=on; ["amToTl","amSaveWav"].forEach(function(id){ var b=document.getElementById(id); if(b){ b.disabled=on; } }); var st=document.getElementById("amBounceSt"); if(st) st.textContent=txt||""; }

function make(cb){
  if(busy) return;
  if(!hasNotes()){ say("Add some steps first"); return; }
  used=(M.bounceBars&&M.bounceBars(bars))||bars;
  setBusy(true,"Rendering…");
  render(used).then(function(r){ var f=new File([wav(r.buf)],name(),{type:"audio/wav"}); setBusy(false,""); cb(f); })
  .catch(function(e){ setBusy(false,"Could not render"); try{ window.amiyoReportError&&window.amiyoReportError("The drum pattern could not be rendered",e); }catch(x){} });
}
function toTimeline(file){
  setBusy(true,"Adding…");
  var before=Object.keys(project.assets);
  Promise.resolve(importFiles([file])).then(function(){
    var id=Object.keys(project.assets).filter(function(k){ return before.indexOf(k)<0; })[0];
    if(!id){ setBusy(false,"Could not add"); return; }
    /* this editor may already place imported media on the timeline; only add it ourselves if it is not there yet */
    setTimeout(function(){
      var there=project.tracks.some(function(t){ return t.clips.some(function(c){ return c.assetId===id; }); });
      if(!there) addAssetToTimeline(id);
      setBusy(false,"Added "+used+" bar"+(used>1?"s":"")+" to the timeline");
    },350);
  }).catch(function(e){ setBusy(false,"Could not add"); try{ window.amiyoReportError&&window.amiyoReportError("The drum clip could not be added",e); }catch(x){} });
}
function saveFile(file){
  var a=document.createElement("a"); a.href=URL.createObjectURL(file); a.download=file.name; document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },1500); say("WAV saved");
}

M.render=render; M.toWav=wav;
M.extras.push(function(root){
  if(root.querySelector("#amBounce")) return;
  var d=document.createElement("div"); d.id="amBounce"; d.className="amm";
  d.style.cssText="padding:0;border-top:1px solid var(--line,#3a3f4b);padding-top:8px";
  d.innerHTML='<h3>Use in your video</h3><div class="row tr"><span class="lab">Length</span>'
   +[1,2,4,8].map(function(n){ return '<button data-b="'+n+'" class="'+(n===bars?'on':'')+'">'+n+' bar'+(n>1?'s':'')+'</button>'; }).join("")+'</div>'
   +'<div class="row"><button id="amToTl" class="on" style="flex:1">＋ Add to timeline</button><button id="amSaveWav" style="flex:1">Save WAV</button></div>'
   +'<div class="hint" id="amBounceSt" aria-live="polite"></div>';
  root.appendChild(d);
  d.querySelectorAll("button[data-b]").forEach(function(b){ b.onclick=function(){ bars=+b.dataset.b; d.querySelectorAll("button[data-b]").forEach(function(x){ x.classList.toggle("on",x===b); }); }; });
  d.querySelector("#amToTl").onclick=function(){ make(toTimeline); };
  d.querySelector("#amSaveWav").onclick=function(){ make(saveFile); };
});
/* if the Music panel is already open, add the new buttons now */
if(document.getElementById("amMusicRoot")){ try{ M.extras[M.extras.length-1](document.getElementById("amMusicRoot")); }catch(e){} }
})();

;
/* ==================== Script 881 id="amiyo-fl-step03-pianoroll" ==================== */
/* =========================================================================
   AMIYO FL STEP 03 — Piano roll
   Two octaves, 16 steps. Tap an empty cell to add a note (length chosen with the
   1/2/4/8 buttons), tap a note to remove it. Plays in time with the drums and is
   included when you bounce to the timeline. Octave buttons move the view.
   ========================================================================= */
(function(){
"use strict";
if(window.__amiyoMusicS03||!window.amiyoMusic) return; window.__amiyoMusicS03=true;
var M=window.amiyoMusic, S=M.state, KEY="amiyoMusicRoll", ROWS=24, KEYW=40, CW=26, RH=22, N=M.steps;
var R={notes:[],base:48,len:2,wave:"sawtooth",inst:"Keys",vol:.7};
var NAMES=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"], BLACK={1:1,3:1,6:1,8:1,10:1};
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
(function load(){ try{ var j=JSON.parse(localStorage.getItem(KEY)||"null"); if(j){ R.base=clamp(Math.round((+j.base||48)/12)*12,24,72); R.len=[1,2,4,8].indexOf(+j.len)>=0?+j.len:2; R.wave=["sawtooth","square","triangle","sine"].indexOf(j.wave)>=0?j.wave:"sawtooth"; R.vol=clamp(j.vol==null?.7:+j.vol,0,1); if(typeof j.inst==="string"&&j.inst.length<20) R.inst=j.inst; R.notes=(j.notes||[]).filter(function(n){ return n&&n.s>=0&&n.s<N&&n.p>=0&&n.p<128; }).map(function(n){ return {s:n.s|0,l:clamp(n.l|0||1,1,N-(n.s|0)),p:n.p|0,v:(n.v==null?undefined:clamp(+n.v||1,0.2,1))}; }); } }catch(e){} })();
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(R)); }catch(e){} }
function nm(p){ return NAMES[p%12]+(Math.floor(p/12)-1); }
function hz(p){ return 440*Math.pow(2,(p-69)/12); }

/* ---- sound: a simple polysynth voice (step 4 adds presets) ---- */
function note(ctx,dest,t,dur,p,vel,wave){
  var o=ctx.createOscillator(); o.type=wave; o.frequency.value=hz(p);
  var f=ctx.createBiquadFilter(); f.type="lowpass"; f.frequency.value=Math.min(9000,hz(p)*6+800); f.Q.value=0.7;
  var g=ctx.createGain(), pk=0.35*vel, a=0.006, r=0.14, end=t+Math.max(0.05,dur);
  g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(pk,t+a); g.gain.linearRampToValueAtTime(pk*0.65,t+a+0.12);
  g.gain.setValueAtTime(pk*0.65,end); g.gain.exponentialRampToValueAtTime(0.0001,end+r);
  o.connect(f); f.connect(g); g.connect(dest); o.start(t); o.stop(end+r+0.02);
}
function play(ctx,dest,t,dur,p,vel){ if(M.instNote&&R.inst) M.instNote(ctx,dest,t,dur,p,vel,R.inst); else note(ctx,dest,t,dur,p,vel,R.wave); }
M.note=note; M.roll=R; M.playRoll=play;
M.hooks.push(function(i,t,sd,ctx,dest){
  for(var k=0;k<R.notes.length;k++){ var n=R.notes[k]; if(n.s===i&&!(M.arpHandle&&M.arpHandle(n,i,t,sd,ctx,dest))) play(ctx,dest,t,n.l*sd*0.95,n.p,R.vol*(n.v==null?1:n.v)); }
});
M.hasNotes.push(function(){ return R.notes.length>0; });

/* ---- drawing ---- */
var cv=null, g2=null, dpr=1, headStep=-1;
function colors(){ var c=getComputedStyle(cv).color||"#888"; return c; }
function draw(){
  if(!cv) return; var W=KEYW+N*CW, H=ROWS*RH; var fg=colors();
  g2.setTransform(dpr,0,0,dpr,0,0); g2.clearRect(0,0,W,H); g2.font="10px sans-serif"; g2.textBaseline="middle";
  for(var r=0;r<ROWS;r++){
    var p=R.base+ROWS-1-r, y=r*RH, bl=BLACK[p%12];
    g2.fillStyle=bl?"rgba(128,128,128,0.22)":"rgba(128,128,128,0.07)"; g2.fillRect(KEYW,y,N*CW,RH); if(M.inScale&&M.inScale(p)){ g2.fillStyle=(p-M.scale.root+120)%12===0?"rgba(246,113,47,0.30)":"rgba(246,113,47,0.14)"; g2.fillRect(KEYW,y,N*CW,RH); }
    g2.fillStyle=bl?"#2b2f3a":"#f1f3f7"; g2.fillRect(0,y,KEYW-2,RH-1);
    g2.fillStyle=bl?"#f9ceb9":"#4a5163"; if(!bl&&p%12===0) g2.fillText(nm(p),4,y+RH/2); else if(!bl) g2.fillText("",4,y+RH/2);
    g2.fillStyle="rgba(128,128,128,0.25)"; g2.fillRect(KEYW,y+RH-1,N*CW,1);
  }
  for(var i=0;i<=N;i++){ g2.fillStyle=i%4===0?"rgba(128,128,128,0.55)":"rgba(128,128,128,0.2)"; g2.fillRect(KEYW+i*CW-(i%4===0?1:0),0,i%4===0?2:1,H); }
  if(headStep>=0){ g2.fillStyle="rgba(255,255,255,0.22)"; g2.fillRect(KEYW+headStep*CW,0,CW,H); g2.fillStyle="rgba(246,113,47,0.35)"; g2.fillRect(KEYW+headStep*CW,0,CW,H); }
  for(var k=0;k<R.notes.length;k++){ var n=R.notes[k], row=R.base+ROWS-1-n.p; if(row<0||row>=ROWS) continue;
    g2.globalAlpha=0.4+0.6*(n.v==null?1:n.v); g2.fillStyle="#f6712f"; g2.fillRect(KEYW+n.s*CW+1,row*RH+1,n.l*CW-2,RH-2); g2.globalAlpha=1; g2.fillStyle="rgba(255,255,255,.55)"; g2.fillRect(KEYW+n.s*CW+1,row*RH+1,n.l*CW-2,3);
    if(n.l>=2){ g2.fillStyle="#fff"; g2.fillText(nm(n.p),KEYW+n.s*CW+5,row*RH+RH/2+1); } }
}
function size(){ dpr=Math.min(3,window.devicePixelRatio||1); var W=KEYW+N*CW, H=ROWS*RH; cv.width=W*dpr; cv.height=H*dpr; cv.style.width=W+"px"; cv.style.height=H+"px"; g2=cv.getContext("2d"); }

function preview(p){ var a=M.audio(); if(a) play(a.ctx,a.master,a.ctx.currentTime+0.01,0.3,p,R.vol); }
function tapAt(x,y){
  var col=Math.floor((x-KEYW)/CW), row=Math.floor(y/RH); if(row<0||row>=ROWS) return;
  var p=R.base+ROWS-1-row;
  if(x<KEYW){ preview(p); return; } if(M.snapPitch) p=M.snapPitch(p);
  if(col<0||col>=N) return;
  for(var k=0;k<R.notes.length;k++){ var n=R.notes[k]; if(n.p===p&&col>=n.s&&col<n.s+n.l){ R.notes.splice(k,1); save(); draw(); return; } }
  var len=Math.min(R.len,N-col);
  R.notes=R.notes.filter(function(n){ return !(n.p===p&&n.s<col+len&&n.s+n.l>col); });
  R.notes.push({s:col,l:len,p:p}); if(M.chordTones){ M.chordTones(p).forEach(function(q){ if(q!==p&&q>=0&&q<128){ R.notes=R.notes.filter(function(n){ return !(n.p===q&&n.s<col+len&&n.s+n.l>col); }); R.notes.push({s:col,l:len,p:q}); } }); } save(); draw(); preview(p);
}

M.extras.push(function(root){
  if(root.querySelector("#amRoll")) return;
  var d=document.createElement("div"); d.id="amRoll"; d.className="amm"; d.style.cssText="padding:0;border-top:1px solid var(--line,#3a3f4b);padding-top:8px";
  d.innerHTML='<h3>Piano roll</h3>'
   +'<div class="row"><span class="lab">Note</span>'+[1,2,4,8].map(function(n){ return '<button data-l="'+n+'" class="'+(n===R.len?'on':'')+'" aria-label="Note length '+n+' steps">'+n+'</button>'; }).join("")+'</div>'
   +'<div class="row"><span class="lab">Sound</span>'+[["sawtooth","Saw"],["square","Square"],["triangle","Tri"],["sine","Sine"]].map(function(w){ return '<button data-w="'+w[0]+'" class="'+(w[0]===R.wave?'on':'')+'">'+w[1]+'</button>'; }).join("")+'</div>'
   +'<div class="row tr"><span class="lab">Octave</span><button id="amOctDn" aria-label="Lower octave">−</button><span class="val" id="amOctV"></span><button id="amOctUp" aria-label="Higher octave">+</button>'
   +'<span class="lab" style="margin-left:6px">Level</span><input type="range" id="amRollVol" min="0" max="100" value="'+Math.round(R.vol*100)+'" aria-label="Piano roll level"></div>'
   +'<div class="gridwrap" id="amRollWrap" style="max-height:250px;overflow:auto"><canvas id="amRollCv" style="touch-action:pan-x pan-y;display:block"></canvas></div>'
   +'<div class="row"><button id="amRollClr">Clear notes</button></div>'
   +'<div class="hint">Tap a cell to add a note, tap a note to remove it. Tap the keys on the left to hear a pitch.</div>';
  var bounce=root.querySelector("#amBounce"); if(bounce) root.insertBefore(d,bounce); else root.appendChild(d);
  cv=d.querySelector("#amRollCv"); size(); draw();
  function oct(){ d.querySelector("#amOctV").textContent="C"+(Math.floor(R.base/12)-1)+"–B"+(Math.floor(R.base/12)); }
  oct();
  d.querySelectorAll("button[data-l]").forEach(function(b){ b.onclick=function(){ R.len=+b.dataset.l; save(); d.querySelectorAll("button[data-l]").forEach(function(x){ x.classList.toggle("on",x===b); }); }; });
  d.querySelectorAll("button[data-w]").forEach(function(b){ b.onclick=function(){ R.wave=b.dataset.w; save(); d.querySelectorAll("button[data-w]").forEach(function(x){ x.classList.toggle("on",x===b); }); preview(R.base+12); }; });
  d.querySelector("#amOctDn").onclick=function(){ R.base=clamp(R.base-12,24,72); save(); oct(); draw(); };
  d.querySelector("#amOctUp").onclick=function(){ R.base=clamp(R.base+12,24,72); save(); oct(); draw(); };
  d.querySelector("#amRollVol").oninput=function(){ R.vol=this.value/100; save(); };
  d.querySelector("#amRollClr").onclick=function(){ R.notes=[]; save(); draw(); };
  var down=null;
  cv.onpointerdown=function(e){ down={x:e.clientX,y:e.clientY,t:Date.now()}; };
  cv.onpointerup=function(e){ if(!down) return; var dx=Math.abs(e.clientX-down.x), dy=Math.abs(e.clientY-down.y), dt=Date.now()-down.t; down=null; if(dx<8&&dy<8&&dt<700){ var r=cv.getBoundingClientRect(); tapAt(e.clientX-r.left,e.clientY-r.top); } };
  cv.onpointercancel=function(){ down=null; };
  var wrap=d.querySelector("#amRollWrap"); wrap.scrollTop=Math.max(0,ROWS*RH/2-125);
});
M.drawRoll=draw; M.saveRoll=save;
M.heads.push(function(st){ headStep=st; draw(); });
if(document.getElementById("amMusicRoot")){ try{ M.extras[M.extras.length-1](document.getElementById("amMusicRoot")); }catch(e){} }
})();

;
/* ==================== Script 882 id="amiyo-fl-step04-instruments" ==================== */
/* =========================================================================
   AMIYO FL STEP 04 — Synth instruments
   Seven instruments for the piano roll: Keys, Bass, Lead, Pad, Pluck, Bell, Organ.
   Each is built from layered oscillators, a filter with its own sweep, a volume
   envelope and (for Lead) vibrato. They work live and when bounced to the timeline.
   ========================================================================= */
(function(){
"use strict";
if(window.__amiyoMusicS04||!window.amiyoMusic||!window.amiyoMusic.roll) return; window.__amiyoMusicS04=true;
var M=window.amiyoMusic, R=M.roll;
function hz(p){ return 440*Math.pow(2,(p-69)/12); }
/* osc: [type, frequency ratio, detune in cents, level]  env: attack, decay, sustain level, release  fc: filter start/end Hz and sweep time */
var INST={
  Keys:{osc:[["triangle",1,0,1],["sine",2,0,.35],["sine",4,0,.12]],a:.004,d:.45,s:.22,r:.35,fc0:3200,fc1:1400,fd:.4,lvl:.7},
  Bass:{osc:[["sawtooth",1,0,.8],["square",.5,0,.7]],a:.004,d:.18,s:.65,r:.08,fc0:2200,fc1:420,fd:.16,lvl:.55,q:2.5},
  Lead:{osc:[["sawtooth",1,-8,.6],["sawtooth",1,8,.6],["square",2,0,.12]],a:.01,d:.1,s:.75,r:.16,fc0:5200,fc1:4200,fd:.2,lvl:.55,vib:[5.5,7]},
  Pad:{osc:[["sawtooth",1,-12,.5],["sawtooth",1,0,.5],["sawtooth",1,12,.5],["sine",.5,0,.4]],a:.4,d:.5,s:.85,r:.9,fc0:700,fc1:1700,fd:.9,lvl:.5},
  Pluck:{osc:[["sawtooth",1,0,.7],["square",1,6,.45]],a:.001,d:.22,s:.03,r:.1,fc0:6500,fc1:600,fd:.2,lvl:.75,q:1.2},
  Bell:{osc:[["sine",1,0,1],["sine",3.5,0,.35],["sine",5.4,0,.2]],a:.002,d:1.1,s:.01,r:.5,fc0:9000,fc1:9000,fd:1,lvl:.5},
  Organ:{osc:[["sine",1,0,1],["sine",2,0,.6],["sine",3,0,.35],["sine",4,0,.2]],a:.012,d:.05,s:.95,r:.06,fc0:6000,fc1:6000,fd:1,lvl:.38}
};
function inst(ctx,dest,t,dur,p,vel,name){
  var P=INST[name]; if(!P) P=INST.Keys;
  var f0=hz(p), end=t+Math.max(0.05,dur), pk=P.lvl*vel;
  var out=ctx.createGain(); out.gain.setValueAtTime(0.0001,t);
  out.gain.linearRampToValueAtTime(pk,t+P.a);
  var susT=Math.min(end,t+P.a+P.d);
  out.gain.linearRampToValueAtTime(Math.max(0.0001,pk*P.s),susT);
  out.gain.setValueAtTime(Math.max(0.0001,pk*P.s),Math.max(susT,end));
  out.gain.exponentialRampToValueAtTime(0.0001,Math.max(susT,end)+P.r);
  var fl=ctx.createBiquadFilter(); fl.type="lowpass"; fl.Q.value=P.q||0.7;
  var track=Math.max(1,f0/262); fl.frequency.setValueAtTime(Math.min(16000,P.fc0*track),t);
  if(P.fc1!==P.fc0) fl.frequency.exponentialRampToValueAtTime(Math.min(16000,P.fc1*track),t+P.fd);
  fl.connect(out); out.connect(dest);
  var stopAt=Math.max(susT,end)+P.r+0.05, oscs=[];
  var norm=1/Math.sqrt(P.osc.length);
  P.osc.forEach(function(o){
    var os=ctx.createOscillator(); os.type=o[0]; os.frequency.value=f0*o[1]; os.detune.value=o[2];
    var g=ctx.createGain(); g.gain.value=o[3]*norm; os.connect(g); g.connect(fl); os.start(t); os.stop(stopAt); oscs.push(os);
  });
  if(P.vib){ var l=ctx.createOscillator(), lg=ctx.createGain(); l.frequency.value=P.vib[0]; lg.gain.value=P.vib[1]; l.connect(lg); oscs.forEach(function(os){ lg.connect(os.detune); }); l.start(t); l.stop(stopAt); }
}
M.instNote=inst; M.instruments=Object.keys(INST);
if(!INST[R.inst]) R.inst="Keys";

M.extras.push(function(root){
  var box=root.querySelector("#amRoll"); if(!box||box.querySelector("#amInst")) return;
  /* the plain waveform buttons from step 3 are replaced by instrument presets */
  var old=box.querySelector("button[data-w]"); if(old&&old.parentNode) old.parentNode.remove();
  var row=document.createElement("div"); row.className="row"; row.id="amInst";
  row.innerHTML='<span class="lab">Sound</span>'+M.instruments.map(function(n){ return '<button data-i="'+n+'" class="'+(n===R.inst?'on':'')+'">'+n+'</button>'; }).join("");
  var oct=box.querySelector("#amOctDn"); var anchor=oct&&oct.parentNode; if(anchor) box.insertBefore(row,anchor); else box.appendChild(row);
  row.querySelectorAll("button[data-i]").forEach(function(b){ b.onclick=function(){
    R.inst=b.dataset.i; try{ localStorage.setItem("amiyoMusicRoll",JSON.stringify(R)); }catch(e){}
    row.querySelectorAll("button[data-i]").forEach(function(x){ x.classList.toggle("on",x===b); });
    var a=M.audio(); if(a){ var p=R.base+(R.inst==="Bass"?7:19); M.instNote(a.ctx,a.master,a.ctx.currentTime+0.02,0.5,p,R.vol,R.inst); }
  }; });
});
if(document.getElementById("amMusicRoot")){ try{ M.extras[M.extras.length-1](document.getElementById("amMusicRoot")); }catch(e){} }
})();

;
/* ==================== Script 883 id="amiyo-fl-step05-keys" ==================== */
/* =========================================================================
   AMIYO FL STEP 05 — Finger pads, on-screen keyboard, live recording, metronome
   Play the 8 drums on pads and the selected instrument on a one-octave keyboard.
   Turn on Rec, press Play, and what you tap is recorded into the pattern, snapped
   to the nearest step. A metronome click helps you keep time (never bounced).
   ========================================================================= */
(function(){
"use strict";
if(window.__amiyoMusicS05||!window.amiyoMusic||!window.amiyoMusic.roll) return; window.__amiyoMusicS05=true;
var M=window.amiyoMusic, S=M.state, R=M.roll, N=M.steps;
var rec=false, met=false, kbBase=60;
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
var NAMES=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
var WHITE=[0,2,4,5,7,9,11,12], BLACKS=[[0,1],[1,3],[3,6],[4,8],[5,10]];

/* nearest step to "now", so a tap a little early or late still lands on the beat */
function nowStep(a){
  if(!S.playing||S.step<0) return -1;
  var sd=M.stepDur(), t0=S.stepT==null?a.ctx.currentTime:S.stepT, frac=(a.ctx.currentTime-t0)/sd;
  return (S.step+(frac>0.5?1:0))%N;
}
function playRoll(a,p){ if(M.playRoll) M.playRoll(a.ctx,a.master,a.ctx.currentTime+0.005,0.4,p,R.vol); else M.note(a.ctx,a.master,a.ctx.currentTime+0.005,0.4,p,R.vol,R.wave); }

function hitPad(r,el){
  var a=M.audio(); if(!a) return;
  M.voice(a.ctx,a.master,M.drums[r].id,a.ctx.currentTime+0.003,0.85);
  if(el){ el.classList.add("hit"); setTimeout(function(){ el.classList.remove("hit"); },110); }
  if(rec){ var i=nowStep(a); if(i>=0){ if(!S.rows[r][i]) S.rows[r][i]=1; M.paintCell(r,i); M.save(); } }
}
function hitKey(p,el){
  var a=M.audio(); if(!a) return;
  playRoll(a,p);
  if(el){ el.classList.add("hit"); setTimeout(function(){ el.classList.remove("hit"); },140); }
  if(rec){ var i=nowStep(a); if(i>=0){ var len=Math.min(R.len,N-i);
    R.notes=R.notes.filter(function(n){ return !(n.p===p&&n.s<i+len&&n.s+n.l>i); }); R.notes.push({s:i,l:len,p:p});
    if(M.saveRoll) M.saveRoll(); if(M.drawRoll) M.drawRoll(); } }
}

/* metronome: a click on every beat while playing live (skipped when bouncing) */
M.hooks.push(function(i,t,sd,ctx,dest){
  if(!met||i%4!==0) return;
  if(window.OfflineAudioContext&&ctx instanceof window.OfflineAudioContext) return;
  var o=ctx.createOscillator(), g=ctx.createGain(); o.type="sine"; o.frequency.value=i===0?1900:1250;
  g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(0.28,t+0.002); g.gain.exponentialRampToValueAtTime(0.0001,t+0.05);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t+0.07);
});

function css(){
  if(document.getElementById("amm-css5")) return; var s=document.createElement("style"); s.id="amm-css5";
  s.textContent=".amm .pads{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}"
  +".amm .pad{min-height:54px;border-radius:10px;color:#111;font-weight:700;font-size:11px;touch-action:none;user-select:none;-webkit-user-select:none;border:0}"
  +".amm .pad.hit{filter:brightness(1.35);transform:scale(.96)}"
  +".amm .kb{position:relative;display:flex;height:112px;touch-action:none;user-select:none;-webkit-user-select:none}"
  +".amm .kb .w{flex:1;min-width:0;height:100%;border:1px solid #888;border-radius:0 0 6px 6px;background:#fafafa;color:#555;font-size:9px;display:flex;align-items:flex-end;justify-content:center;padding:0 0 4px;touch-action:none}"
  +".amm .kb .k{position:absolute;top:0;width:8.4%;height:62%;border-radius:0 0 5px 5px;background:#22252d;border:1px solid #000;padding:0;z-index:2;touch-action:none;min-height:0;min-width:0}"
  +".amm .kb .w.hit{background:#ffb48f}.amm .kb .k.hit{background:#f6712f}"
  +"html[data-theme=light] .amm .pad,html[data-theme=light] .amm .kb{filter:hue-rotate(180deg) invert(1)}"
  +".amm .recon{background:#e5484d!important;border-color:#e5484d!important;color:#fff}";
  document.head.appendChild(s);
}
function kbHtml(){
  var h=WHITE.map(function(o,i){ return '<button class="w" data-o="'+o+'" aria-label="Note '+NAMES[o%12]+'">'+(o===0?"C"+(Math.floor(kbBase/12)-1):o===12?"C"+Math.floor(kbBase/12):"")+'</button>'; }).join("");
  BLACKS.forEach(function(b){ h+='<button class="k" data-o="'+b[1]+'" style="left:'+(((b[0]+1)/8)*100-4.2)+'%" aria-label="Note '+NAMES[b[1]]+'"></button>'; });
  return h;
}
M.extras.push(function(root){
  if(root.querySelector("#amPlayBox")) return; css();
  var d=document.createElement("div"); d.id="amPlayBox"; d.className="amm"; d.style.cssText="padding:0;border-top:1px solid var(--line,#3a3f4b);padding-top:8px";
  d.innerHTML='<h3>Play &amp; record</h3>'
   +'<div class="row"><button id="amRec" aria-pressed="false">● Rec</button><button id="amMet" aria-pressed="false">Metronome</button></div>'
   +'<div class="hint" id="amRecHint">Press Play, turn Rec on, then tap pads or keys to record.</div>'
   +'<div class="pads" id="amPads">'+M.drums.map(function(x,i){ return '<button class="pad" data-r="'+i+'" style="background:'+x.color+'">'+x.name+'</button>'; }).join("")+'</div>'
   +'<div class="row tr"><span class="lab">Keys</span><button id="amKbDn" aria-label="Keyboard octave down">−</button><span class="val" id="amKbV"></span><button id="amKbUp" aria-label="Keyboard octave up">+</button></div>'
   +'<div class="kb" id="amKb">'+kbHtml()+'</div>';
  var tgt=root.querySelector("#amRoll")||root.querySelector("#amBounce"); if(tgt) root.insertBefore(d,tgt); else root.appendChild(d);
  function lab(){ d.querySelector("#amKbV").textContent="C"+(Math.floor(kbBase/12)-1); }
  lab();
  var recB=d.querySelector("#amRec"), metB=d.querySelector("#amMet"), hint=d.querySelector("#amRecHint");
  function hintTxt(){ hint.textContent=rec?(S.playing?"Recording — tap pads or keys. Notes snap to the nearest step.":"Rec is on. Press Play to start recording."):"Press Play, turn Rec on, then tap pads or keys to record."; }
  recB.onclick=function(){ rec=!rec; recB.classList.toggle("recon",rec); recB.setAttribute("aria-pressed",rec); hintTxt(); };
  metB.onclick=function(){ met=!met; metB.classList.toggle("on",met); metB.setAttribute("aria-pressed",met); };
  var pb=document.getElementById("amPlay"); if(pb) pb.addEventListener("click",function(){ setTimeout(hintTxt,30); });
  d.querySelector("#amPads").onpointerdown=function(e){ var b=e.target.closest(".pad"); if(!b) return; e.preventDefault(); hitPad(+b.dataset.r,b); };
  var kb=d.querySelector("#amKb");
  kb.onpointerdown=function(e){ var b=e.target.closest("button[data-o]"); if(!b) return; e.preventDefault(); hitKey(kbBase+(+b.dataset.o),b); };
  d.querySelector("#amKbDn").onclick=function(){ kbBase=clamp(kbBase-12,36,84); kb.innerHTML=kbHtml(); lab(); };
  d.querySelector("#amKbUp").onclick=function(){ kbBase=clamp(kbBase+12,36,84); kb.innerHTML=kbHtml(); lab(); };
  recB.classList.toggle("recon",rec); metB.classList.toggle("on",met);
});
if(document.getElementById("amMusicRoot")){ try{ M.extras[M.extras.length-1](document.getElementById("amMusicRoot")); }catch(e){} }
})();

;
/* ==================== Script 884 id="amiyo-fl-step06-song" ==================== */
/* =========================================================================
   AMIYO FL STEP 06 — Pattern bank and song arranger
   Eight pattern slots (A–H) each hold drums + piano roll notes. Build a song by
   chaining slots, one bar each. Song mode plays the chain and bounces it too.
   ========================================================================= */
(function(){
"use strict";
if(window.__amiyoMusicS06||!window.amiyoMusic||!window.amiyoMusic.roll) return; window.__amiyoMusicS06=true;
var M=window.amiyoMusic, S=M.state, R=M.roll, KEY="amiyoMusicBank", SLOTS=8, LET="ABCDEFGH";
var bank=[], cur=0, song=[], songMode=false, saved="", clip=null, snap=null;
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function blank(){ return {rows:S.rows.map(function(r){ return r.map(function(){return 0;}); }),mute:S.mute.map(function(){return false;}),notes:[]}; }
function snapshot(){ return {rows:clone(S.rows),mute:S.mute.slice(),notes:clone(R.notes)}; }
function empty(p){ return !p||(!p.notes.length&&p.rows.every(function(r){ return r.every(function(v){return !v;}); })); }
(function load(){
  var j=null; try{ j=JSON.parse(localStorage.getItem(KEY)||"null"); }catch(e){}
  for(var i=0;i<SLOTS;i++) bank.push(j&&j.bank&&j.bank[i]&&j.bank[i].rows&&j.bank[i].rows.length===S.rows.length?j.bank[i]:blank());
  if(j){ cur=Math.max(0,Math.min(SLOTS-1,j.cur|0)); song=(j.song||[]).filter(function(n){ return n>=0&&n<SLOTS; }).slice(0,32); songMode=false; }
  bank[cur]=snapshot();
})();
function persist(){ bank[cur]=snapshot(); var s=JSON.stringify({bank:bank,cur:cur,song:song}); if(s!==saved){ saved=s; try{ localStorage.setItem(KEY,s); }catch(e){} } }
function apply(i){
  var p=bank[i]; S.rows=clone(p.rows); S.mute=p.mute.slice(); R.notes=clone(p.notes); cur=i;
  try{ M.save(); if(M.saveRoll) M.saveRoll(); }catch(e){}
  M.repaint(); if(M.drawRoll) M.drawRoll(); ui();
}
function go(i){ if(i===cur) return; persist(); apply(i); }

/* song playback: at each bar line load the next pattern in the chain */
M.barHooks.push(function(n){
  if(!songMode||!song.length) return;
  if(n===0) bank[cur]=snapshot();
  apply(song[n%song.length]); songPos=n%song.length; ui();
});
var songPos=-1;
/* song bounce: swap patterns bar by bar, then put the current one back */
M.bounceBars=function(bars){ return songMode&&song.length?song.length:bars; };
M.onBounceBar=function(b){
  if(!songMode||!song.length) return;
  if(b===0) snap=snapshot();
  var p=bank[song[b%song.length]]; S.rows=clone(p.rows); S.mute=p.mute.slice(); R.notes=clone(p.notes);
};
M.onBounceEnd=function(){ if(snap){ S.rows=snap.rows; S.mute=snap.mute; R.notes=snap.notes; snap=null; } };
M.hasNotes.push(function(){ return songMode&&song.some(function(i){ return !empty(bank[i]); }); });

function ui(){
  var box=document.getElementById("amSong"); if(!box) return;
  box.querySelectorAll("button[data-s]").forEach(function(b){ var i=+b.dataset.s; b.classList.toggle("on",i===cur); b.textContent=LET[i]+(empty(i===cur?snapshot():bank[i])?"":"•"); });
  var ch=box.querySelector("#amChain"); ch.innerHTML="";
  if(!song.length){ ch.textContent="Song is empty. Pick a pattern, then tap ＋ Add."; ch.className="hint"; }
  else { ch.className="row"; song.forEach(function(n,k){ var b=document.createElement("button"); b.textContent=LET[n]; b.title="Tap to remove bar "+(k+1); b.setAttribute("aria-label","Bar "+(k+1)+", pattern "+LET[n]+", tap to remove"); if(songMode&&k===songPos&&S.playing) b.classList.add("on"); b.onclick=function(){ song.splice(k,1); persist(); ui(); }; ch.appendChild(b); }); }
  var sm=box.querySelector("#amSongMode"); sm.classList.toggle("on",songMode); sm.setAttribute("aria-pressed",songMode);
}
M.extras.push(function(root){
  if(root.querySelector("#amSong")) return;
  var d=document.createElement("div"); d.id="amSong"; d.className="amm"; d.style.cssText="padding:0;border-top:1px solid var(--line,#3a3f4b);padding-top:8px";
  var h='<h3>Patterns &amp; song</h3><div class="row">';
  for(var i=0;i<SLOTS;i++) h+='<button data-s="'+i+'" aria-label="Pattern '+LET[i]+'" style="min-width:34px">'+LET[i]+'</button>';
  h+='</div><div class="row"><button id="amCopy">Copy</button><button id="amPaste">Paste</button><button id="amClrSlot">Clear</button></div>'
   +'<div class="row" id="amChain"></div>'
   +'<div class="row"><button id="amSongAdd">＋ Add to song</button><button id="amSongClr">Clear song</button><button id="amSongMode" aria-pressed="false">Song mode</button></div>'
   +'<div class="hint">Each pattern is one bar. With Song mode on, Play runs through the chain; Add to timeline bounces the whole song.</div>';
  d.innerHTML=h;
  var tgt=root.querySelector("#amPlayBox")||root.querySelector("#amRoll")||root.querySelector("#amBounce"); if(tgt) root.insertBefore(d,tgt); else root.appendChild(d);
  d.querySelectorAll("button[data-s]").forEach(function(b){ b.onclick=function(){ go(+b.dataset.s); }; });
  d.querySelector("#amCopy").onclick=function(){ clip=snapshot(); };
  d.querySelector("#amPaste").onclick=function(){ if(!clip){ try{ toast("Copy a pattern first"); }catch(e){} return; } bank[cur]=clone(clip); apply(cur); persist(); };
  d.querySelector("#amClrSlot").onclick=function(){ bank[cur]=blank(); apply(cur); persist(); };
  d.querySelector("#amSongAdd").onclick=function(){ if(song.length<32){ persist(); song.push(cur); persist(); ui(); } };
  d.querySelector("#amSongClr").onclick=function(){ song=[]; songPos=-1; persist(); ui(); };
  d.querySelector("#amSongMode").onclick=function(){ songMode=!songMode; ui(); };
  ui();
});
M.heads.push(function(){ try{ ui(); }catch(e){} });
setInterval(persist,2000);
window.addEventListener("pagehide",persist);
if(document.getElementById("amMusicRoot")){ try{ M.extras[M.extras.length-1](document.getElementById("amMusicRoot")); }catch(e){} }
})();

;
/* ==================== Script 885 id="amiyo-fl-step07-mixer" ==================== */
/* =========================================================================
   AMIYO FL STEP 07 — Mixer
   One channel per drum plus Keys: volume, pan, mute, solo and a live level meter.
   Settings are saved, and used when you bounce to the timeline.
   ========================================================================= */
(function(){
"use strict";
if(window.__amiyoMusicS07||!window.amiyoMusic||!window.amiyoMusic.instNote) return; window.__amiyoMusicS07=true;
var M=window.amiyoMusic, KEY="amiyoMusicMixer";
var IDS=M.drums.map(function(d){ return d.id; }).concat(["keys"]);
var NAMES=M.drums.map(function(d){ return d.name; }).concat(["Keys"]);
var X={}; IDS.forEach(function(id){ X[id]={vol:1,pan:0,mute:false,solo:false}; });
(function(){ try{ var j=JSON.parse(localStorage.getItem(KEY)||"null"); if(j) IDS.forEach(function(id){ var c=j[id]; if(c) X[id]={vol:Math.max(0,Math.min(1.5,+c.vol==c.vol?+c.vol:1)),pan:Math.max(-1,Math.min(1,+c.pan||0)),mute:!!c.mute,solo:!!c.solo}; }); }catch(e){} })();
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(X)); }catch(e){} }
function anySolo(){ return IDS.some(function(id){ return X[id].solo; }); }
function eff(id){ var c=X[id]; return (c.mute||(anySolo()&&!c.solo))?0:c.vol; }

M.chanBuild=M.chanBuild||[]; M.mixIds=IDS; M.mixNames=NAMES;
var chans=new WeakMap(), live=null;
function chan(ctx,dest,id){
  var m=chans.get(ctx); if(!m){ m={}; chans.set(ctx,m); }
  var c=m[id]; if(c) return c.in;
  var g=ctx.createGain(); g.gain.value=eff(id);
  var tail=g; for(var hk=0;hk<M.chanBuild.length;hk++){ try{ tail=M.chanBuild[hk](ctx,id,tail,dest)||tail; }catch(e){} }
  var last=tail, pan=null;
  if(ctx.createStereoPanner){ pan=ctx.createStereoPanner(); pan.pan.value=X[id].pan; tail.connect(pan); last=pan; }
  var an=ctx.createAnalyser(); an.fftSize=256; last.connect(an); last.connect(dest);
  m[id]=c={in:g,pan:pan,an:an};
  return g;
}
function applyLive(){
  var ctx=M.liveCtx(); if(!ctx) return; var m=chans.get(ctx); if(!m) return;
  IDS.forEach(function(id){ var c=m[id]; if(!c) return; var t=ctx.currentTime; c.in.gain.setTargetAtTime(eff(id),t,0.01); if(c.pan) c.pan.pan.setTargetAtTime(X[id].pan,t,0.01); });
}
var ov=M.voice; M.voice=function(ctx,dest,id,t,vel){ return ov(ctx,IDS.indexOf(id)>=0?chan(ctx,dest,id):dest,id,t,vel); };
var oi=M.instNote; M.instNote=function(ctx,dest,t,dur,p,vel,name){ return oi(ctx,chan(ctx,dest,"keys"),t,dur,p,vel,name); };
M.mixer=X;

/* ---- meters ---- */
var buf=null, raf=0;
function level(an){ if(!buf||buf.length!==an.fftSize) buf=new Float32Array(an.fftSize); an.getFloatTimeDomainData(buf); var pk=0; for(var i=0;i<buf.length;i++){ var v=Math.abs(buf[i]); if(v>pk) pk=v; } return pk; }
var held={};
function meters(){
  var box=document.getElementById("amMixer"); if(!box){ raf=0; return; }
  var ctx=M.liveCtx(), m=ctx&&chans.get(ctx);
  IDS.forEach(function(id){
    var el=box.querySelector('[data-mt="'+id+'"]'); if(!el) return;
    var v=0; if(m&&m[id]) v=level(m[id].an);
    var db=v>0.0001?20*Math.log10(v):-60, pct=Math.max(0,Math.min(100,(db+48)/48*100));
    held[id]=Math.max(pct,(held[id]||0)-2.5); el.style.width=held[id]+"%"; el.style.background=db>-3?"#e5484d":db>-12?"#ffb04a":"#7be06a";
  });
  raf=requestAnimationFrame(meters);
}
function css(){
  if(document.getElementById("amm-css7")) return; var s=document.createElement("style"); s.id="amm-css7";
  s.textContent=".amm .ch{display:grid;grid-template-columns:48px 28px 28px 1fr;gap:4px;align-items:center}"
  +".amm .ch button{min-height:26px;min-width:26px;padding:0;font-size:11px}"
  +".amm .ch .nm2{font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"
  +".amm .mtr{height:8px;border-radius:4px;background:rgba(128,128,128,.25);overflow:hidden}"
  +".amm .mtr i{display:block;height:100%;width:0}"
  +".amm .ch2{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 6px}"
  +".amm .ch2 input{width:100%;min-width:0}"
  +".amm .solo.on{background:#e5b400!important;border-color:#e5b400!important;color:#111}"
  +".amm .mute.on{background:#e5484d!important;border-color:#e5484d!important;color:#fff}"
  +"html[data-theme=light] .amm .mtr i{filter:hue-rotate(180deg) invert(1)}";
  document.head.appendChild(s);
}
M.extras.push(function(root){
  if(root.querySelector("#amMixer")) return; css();
  var d=document.createElement("div"); d.id="amMixer"; d.className="amm"; d.style.cssText="padding:0;border-top:1px solid var(--line,#3a3f4b);padding-top:8px";
  var h='<h3>Mixer</h3>';
  IDS.forEach(function(id,k){
    h+='<div class="ch"><span class="nm2">'+NAMES[k]+'</span><button class="mute'+(X[id].mute?' on':'')+'" data-m="'+id+'" aria-label="Mute '+NAMES[k]+'" aria-pressed="'+X[id].mute+'">M</button><button class="solo'+(X[id].solo?' on':'')+'" data-so="'+id+'" aria-label="Solo '+NAMES[k]+'" aria-pressed="'+X[id].solo+'">S</button><div class="mtr"><i data-mt="'+id+'"></i></div></div>'
     +'<div class="ch2"><input type="range" min="0" max="150" value="'+Math.round(X[id].vol*100)+'" data-v="'+id+'" aria-label="'+NAMES[k]+' volume"><input type="range" min="-100" max="100" value="'+Math.round(X[id].pan*100)+'" data-p="'+id+'" aria-label="'+NAMES[k]+' pan"></div>';
  });
  h+='<div class="row"><button id="amMixReset">Reset mixer</button></div><div class="hint">Left slider is volume, right slider is pan (centre = middle). Mixer settings are used when you bounce to the timeline.</div>';
  d.innerHTML=h;
  var tgt=root.querySelector("#amBounce"); if(tgt) root.insertBefore(d,tgt); else root.appendChild(d);
  d.querySelectorAll("[data-v]").forEach(function(e){ e.oninput=function(){ X[e.dataset.v].vol=e.value/100; save(); applyLive(); }; });
  d.querySelectorAll("[data-p]").forEach(function(e){ e.oninput=function(){ X[e.dataset.p].pan=e.value/100; save(); applyLive(); }; e.ondblclick=function(){ e.value=0; X[e.dataset.p].pan=0; save(); applyLive(); }; });
  d.querySelectorAll("[data-m]").forEach(function(e){ e.onclick=function(){ var c=X[e.dataset.m]; c.mute=!c.mute; e.classList.toggle("on",c.mute); e.setAttribute("aria-pressed",c.mute); save(); applyLive(); }; });
  d.querySelectorAll("[data-so]").forEach(function(e){ e.onclick=function(){ var c=X[e.dataset.so]; c.solo=!c.solo; e.classList.toggle("on",c.solo); e.setAttribute("aria-pressed",c.solo); save(); applyLive(); }; });
  d.querySelector("#amMixReset").onclick=function(){ IDS.forEach(function(id){ X[id]={vol:1,pan:0,mute:false,solo:false}; }); save(); applyLive(); d.remove(); M.extras[M.extras.length-1](root); };
  d.querySelectorAll(".mtr i").forEach(function(i){ i.style.height="100%"; i.style.display="block"; });
  if(!raf) raf=requestAnimationFrame(meters);
});
if(document.getElementById("amMusicRoot")){ try{ M.extras[M.extras.length-1](document.getElementById("amMusicRoot")); }catch(e){} }
})();

;
/* ==================== Script 886 id="amiyo-fl-step08-fx" ==================== */
/* =========================================================================
   AMIYO FL STEP 08 — Channel effects
   Per channel: 3-band EQ (low / mid / high), compressor, reverb send and a
   tempo-synced delay send. Works live and in the bounce (the bounce gets a
   longer tail when reverb or delay is used).
   ========================================================================= */
(function(){
"use strict";
if(window.__amiyoMusicS08||!window.amiyoMusic||!window.amiyoMusic.chanBuild) return; window.__amiyoMusicS08=true;
var M=window.amiyoMusic, S=M.state, KEY="amiyoMusicFx", IDS=M.mixIds, NAMES=M.mixNames;
var F={}; IDS.forEach(function(id){ F[id]={low:0,mid:0,high:0,comp:0,rev:0,dly:0}; });
(function(){ try{ var j=JSON.parse(localStorage.getItem(KEY)||"null"); if(j) IDS.forEach(function(id){ var c=j[id]; if(!c) return; ["low","mid","high"].forEach(function(k){ F[id][k]=Math.max(-12,Math.min(12,+c[k]||0)); }); ["comp","rev","dly"].forEach(function(k){ F[id][k]=Math.max(0,Math.min(1,+c[k]||0)); }); }); }catch(e){} })();
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(F)); }catch(e){} }
M.fx=F;
M.tailSec=function(){ return IDS.some(function(id){ return F[id].rev>0||F[id].dly>0; })?3:1.2; };

var buses=new WeakMap(), nodes=new WeakMap();
function impulse(ctx){ var sr=ctx.sampleRate, len=Math.floor(sr*1.7), b=ctx.createBuffer(2,len,sr); for(var c=0;c<2;c++){ var d=b.getChannelData(c); for(var i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6); } return b; }
function bus(ctx,dest){
  var b=buses.get(ctx); if(b) return b;
  var rin=ctx.createGain(), cv=ctx.createConvolver(); cv.buffer=impulse(ctx); var rout=ctx.createGain(); rout.gain.value=0.7; rin.connect(cv); cv.connect(rout); rout.connect(dest);
  var din=ctx.createGain(), dl=ctx.createDelay(2), fb=ctx.createGain(), lp=ctx.createBiquadFilter(), dout=ctx.createGain();
  dl.delayTime.value=60/S.bpm*0.75; fb.gain.value=0.38; lp.type="lowpass"; lp.frequency.value=3200; dout.gain.value=0.8;
  din.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(dout); dout.connect(dest);
  b={rin:rin,din:din,dl:dl}; buses.set(ctx,b); return b;
}
function setCh(ctx,n,id){
  var c=F[id], t=ctx.currentTime;
  n.lo.gain.setTargetAtTime(c.low,t,0.01); n.mid.gain.setTargetAtTime(c.mid,t,0.01); n.hi.gain.setTargetAtTime(c.high,t,0.01);
  var a=c.comp; n.dryG.gain.setTargetAtTime(a>0?0:1,t,0.01); n.wetG.gain.setTargetAtTime(a>0?1:0,t,0.01); n.cmp.threshold.setTargetAtTime(-22*a,t,0.01); n.cmp.knee.setTargetAtTime(10*a,t,0.01); n.cmp.ratio.setTargetAtTime(1+5*a,t,0.01); n.mk.gain.setTargetAtTime(a>0?1-0.5*a:1,t,0.01);
  n.rs.gain.setTargetAtTime(c.rev*0.9,t,0.01); n.ds.gain.setTargetAtTime(c.dly*0.9,t,0.01);
}
M.chanBuild.push(function(ctx,id,input,dest){
  var lo=ctx.createBiquadFilter(); lo.type="lowshelf"; lo.frequency.value=200;
  var mid=ctx.createBiquadFilter(); mid.type="peaking"; mid.frequency.value=1200; mid.Q.value=0.9;
  var hi=ctx.createBiquadFilter(); hi.type="highshelf"; hi.frequency.value=4500;
  var cmp=ctx.createDynamicsCompressor(); cmp.knee.value=0; cmp.attack.value=0.005; cmp.release.value=0.14;
  var mk=ctx.createGain();
  var dryG=ctx.createGain(), wetG=ctx.createGain();
  input.connect(lo); lo.connect(mid); mid.connect(hi); hi.connect(dryG); dryG.connect(mk); hi.connect(cmp); cmp.connect(wetG); wetG.connect(mk);
  var b=bus(ctx,dest), rs=ctx.createGain(), ds=ctx.createGain(); mk.connect(rs); rs.connect(b.rin); mk.connect(ds); ds.connect(b.din);
  var n={lo:lo,mid:mid,hi:hi,cmp:cmp,mk:mk,rs:rs,ds:ds,dryG:dryG,wetG:wetG}; var m=nodes.get(ctx); if(!m){ m={}; nodes.set(ctx,m); } m[id]=n;
  /* start values straight away (no ramp) so the first note of a bounce is already processed */
  var c=F[id], a=c.comp; lo.gain.value=c.low; mid.gain.value=c.mid; hi.gain.value=c.high;
  dryG.gain.value=a>0?0:1; wetG.gain.value=a>0?1:0; cmp.threshold.value=-22*a; cmp.knee.value=10*a; cmp.ratio.value=1+5*a; mk.gain.value=a>0?1-0.5*a:1; rs.gain.value=c.rev*0.9; ds.gain.value=c.dly*0.9;
  return mk;
});
function applyLive(){
  var ctx=M.liveCtx(); if(!ctx) return; var m=nodes.get(ctx), b=buses.get(ctx);
  if(b) b.dl.delayTime.setTargetAtTime(60/S.bpm*0.75,ctx.currentTime,0.02);
  if(m) IDS.forEach(function(id){ if(m[id]) setCh(ctx,m[id],id); });
}
M.heads.push(function(){ /* keep the delay in time if the tempo changes while playing */ var ctx=M.liveCtx(), b=ctx&&buses.get(ctx); if(b){ var t=60/S.bpm*0.75; if(Math.abs(b.dl.delayTime.value-t)>0.002) b.dl.delayTime.setTargetAtTime(t,ctx.currentTime,0.02); } });

var sel=0;
var SL=[["low","Low EQ",-12,12,1],["mid","Mid EQ",-12,12,1],["high","High EQ",-12,12,1],["comp","Compress",0,100,1],["rev","Reverb",0,100,1],["dly","Delay",0,100,1]];
function val(id,k){ return (k==="comp"||k==="rev"||k==="dly")?Math.round(F[id][k]*100):F[id][k]; }
M.extras.push(function(root){
  if(root.querySelector("#amFx")) return;
  var d=document.createElement("div"); d.id="amFx"; d.className="amm"; d.style.cssText="padding:0;border-top:1px solid var(--line,#3a3f4b);padding-top:8px";
  function build(){
    var id=IDS[sel], h='<h3>Effects</h3><div class="row">';
    IDS.forEach(function(x,i){ h+='<button data-c="'+i+'" class="'+(i===sel?'on':'')+'">'+NAMES[i]+'</button>'; });
    h+='</div>';
    SL.forEach(function(s){ h+='<div class="row tr"><span class="lab" style="width:58px">'+s[1]+'</span><input type="range" min="'+s[2]+'" max="'+s[3]+'" value="'+val(id,s[0])+'" data-k="'+s[0]+'" aria-label="'+NAMES[sel]+' '+s[1]+'"><span class="val" data-o="'+s[0]+'">'+val(id,s[0])+'</span></div>'; });
    h+='<div class="row"><button id="amFxReset">Reset this channel</button></div><div class="hint">EQ is in dB. Compress, Reverb and Delay are amounts. Delay follows the tempo (dotted eighth).</div>';
    d.innerHTML=h;
    d.querySelectorAll("button[data-c]").forEach(function(b){ b.onclick=function(){ sel=+b.dataset.c; build(); }; });
    d.querySelectorAll("input[data-k]").forEach(function(e){ e.oninput=function(){ var k=e.dataset.k, v=+e.value; F[id][k]=(k==="comp"||k==="rev"||k==="dly")?v/100:v; d.querySelector('[data-o="'+k+'"]').textContent=v; save(); applyLive(); }; e.ondblclick=function(){ e.value=0; e.dispatchEvent(new Event("input")); }; });
    d.querySelector("#amFxReset").onclick=function(){ F[id]={low:0,mid:0,high:0,comp:0,rev:0,dly:0}; save(); applyLive(); build(); };
  }
  build();
  var tgt=root.querySelector("#amBounce"); if(tgt) root.insertBefore(d,tgt); else root.appendChild(d);
});
if(document.getElementById("amMusicRoot")){ try{ M.extras[M.extras.length-1](document.getElementById("amMusicRoot")); }catch(e){} }
})();

;
/* ==================== Script 887 id="amiyo-fl-step09-taptempo" ==================== */
/* @id amiyo-fl-step09-taptempo */
/* =========================================================================
   AMIYO FL STEP 09 (plan step 1) — Tap tempo, half/double time
   FL Studio Mobile has a TAP button: tap the beat a few times and the tempo
   follows. Taps more than 2 seconds apart start a new count. Also adds
   1/2x and 2x buttons for quickly switching between half and double time.
   ========================================================================= */
(function(){
"use strict";
var M=window.amiyoMusic; if(!M||window.__amiyoMusicS09) return; window.__amiyoMusicS09=true;
var taps=[];
function setBpm(v){
  var S=M.state; S.bpm=Math.max(40,Math.min(240,Math.round(v)));
  var a=document.getElementById("amBpmV"), b=document.getElementById("amBpm"); if(a) a.textContent=S.bpm; if(b) b.value=S.bpm; M.save();
}
function tap(){
  var now=performance.now();
  if(taps.length&&now-taps[taps.length-1]>2000) taps=[];
  taps.push(now); if(taps.length>8) taps.shift();
  if(taps.length>=2){ var sum=0; for(var i=1;i<taps.length;i++) sum+=taps[i]-taps[i-1]; setBpm(60000/(sum/(taps.length-1))); }
  var l=document.getElementById("amTapLab"); if(l) l.textContent=taps.length<2?"tap again":M.state.bpm+" BPM";
}
M.tapTempo=tap; M.setBpm=setBpm;
M.extras.push(function(root){
  if(root.querySelector("#amTapRow")) return;
  var d=document.createElement("div"); d.id="amTapRow"; d.className="row tr";
  d.innerHTML='<button id="amTapBtn" aria-label="Tap tempo" style="min-width:84px">👆 Tap tempo</button><button id="amHalf" aria-label="Half time">½×</button><button id="amDouble" aria-label="Double time">2×</button><span class="hint" id="amTapLab" style="margin:0 0 0 6px">tap the beat</span>';
  var anchor=root.querySelector("#amBpm"); anchor=anchor&&anchor.parentNode; if(anchor&&anchor.parentNode) anchor.parentNode.insertBefore(d,anchor.nextSibling); else root.appendChild(d);
  d.querySelector("#amTapBtn").onclick=tap;
  d.querySelector("#amHalf").onclick=function(){ setBpm(M.state.bpm/2); };
  d.querySelector("#amDouble").onclick=function(){ setBpm(M.state.bpm*2); };
});
if(document.getElementById("amMusicRoot")){ try{ M.extras[M.extras.length-1](document.getElementById("amMusicRoot")); }catch(e){} }
})();

;
/* ==================== Script 888 id="amiyo-fl-step10-velocity" ==================== */
/* @id amiyo-fl-step10-velocity */



/* =========================================================================
   AMIYO FL STEP 10 (plan step 2) — Note velocity in the piano roll
   Turn on "Velocity", then tap a note to cycle loud > medium > soft.
   Soft notes are drawn paler and play quieter, live and in the bounce.
   ========================================================================= */
(function(){
"use strict";
var M=window.amiyoMusic; if(!M||!M.roll||window.__amiyoMusicS10) return; window.__amiyoMusicS10=true;
var R=M.roll, on=false, LV=[1,0.7,0.4], ROWS=24, KEYW=40, CW=26, RH=22;
function hit(cv,e){
  var r=cv.getBoundingClientRect(), x=e.clientX-r.left, y=e.clientY-r.top;
  var col=Math.floor((x-KEYW)/CW), row=Math.floor(y/RH); if(x<KEYW||col<0||row<0||row>=ROWS) return null;
  var p=R.base+ROWS-1-row;
  for(var k=0;k<R.notes.length;k++){ var n=R.notes[k]; if(n.p===p&&col>=n.s&&col<n.s+n.l) return n; }
  return null;
}
function cycle(n){
  var v=n.v==null?1:n.v, i=0; for(var q=0;q<LV.length;q++) if(Math.abs(LV[q]-v)<0.05) i=q;
  n.v=LV[(i+1)%LV.length]; if(n.v===1) delete n.v;
  M.saveRoll(); M.drawRoll();
  var a=M.audio(); if(a) M.playRoll(a.ctx,a.master,a.ctx.currentTime+0.01,0.25,n.p,R.vol*(n.v==null?1:n.v));
  return n.v==null?1:n.v;
}
M.setVelocity=function(n,v){ if(v>=1) delete n.v; else n.v=Math.max(0.2,v); M.saveRoll(); M.drawRoll(); };
M.cycleVelocity=cycle;
M.extras.push(function(root){
  var d=root.querySelector("#amRoll"); if(!d||d.querySelector("#amVelBtn")) return;
  var row=document.createElement("div"); row.className="row";
  row.innerHTML='<span class="lab">Velocity</span><button id="amVelBtn" aria-pressed="false" aria-label="Velocity edit mode">Edit</button><span class="hint" id="amVelHint" style="margin:0 0 0 6px;white-space:nowrap;overflow:hidden">tap a note to change level</span>';
  var h3=d.querySelector("h3"); h3.parentNode.insertBefore(row,h3.nextSibling);
  var btn=row.querySelector("#amVelBtn"), hint=row.querySelector("#amVelHint");
  btn.classList.toggle("on",on);
  btn.onclick=function(){ on=!on; btn.classList.toggle("on",on); btn.setAttribute("aria-pressed",on); hint.textContent=on?"tap a note to change level":"off - taps add or delete"; };
  var cv=d.querySelector("#amRollCv");
  var downPt=null;
  cv.addEventListener("pointerdown",function(e){ downPt={x:e.clientX,y:e.clientY,t:Date.now()}; },true);
  cv.addEventListener("pointerup",function(e){
    if(!on||!downPt) return;
    var dx=Math.abs(e.clientX-downPt.x), dy=Math.abs(e.clientY-downPt.y), dt=Date.now()-downPt.t; downPt=null;
    if(dx>=8||dy>=8||dt>=700) return;
    var n=hit(cv,e); if(!n) return;
    e.stopImmediatePropagation(); e.preventDefault();
    var v=cycle(n); hint.textContent="level "+Math.round(v*100)+"%";
  },true);
});
if(document.getElementById("amMusicRoot")){ try{ M.extras[M.extras.length-1](document.getElementById("amMusicRoot")); }catch(e){} }
})();

;
/* ==================== Script 889 id="amiyo-fl-step11-edittools" ==================== */
/* @id amiyo-fl-step11-edittools */
/* =========================================================================
   AMIYO FL STEP 11 (plan step 3) — Piano roll edit tools
   Transpose by a semitone or an octave, shift left/right by a step (wraps
   around the 16-step loop), reverse the pattern, humanize note levels, and
   Undo for the last edit. Works on all notes in the roll.
   ========================================================================= */
(function(){
"use strict";
var M=window.amiyoMusic; if(!M||!M.roll||window.__amiyoMusicS11) return; window.__amiyoMusicS11=true;
var R=M.roll, N=M.steps, last=null;
function snap(){ last=JSON.stringify(R.notes); }
function done(msg){ M.saveRoll(); M.drawRoll(); var h=document.getElementById("amEditHint"); if(h) h.textContent=msg||""; var a=M.audio&&M.audio(); }
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
var T={
  transpose:function(d){ if(!R.notes.length) return "no notes"; var ok=R.notes.every(function(n){ return n.p+d>=0&&n.p+d<=127; }); if(!ok) return "out of range"; snap(); R.notes.forEach(function(n){ n.p+=d; }); return (d>0?"+":"")+d+" semitones"; },
  shift:function(d){ if(!R.notes.length) return "no notes"; snap(); R.notes.forEach(function(n){ n.s=((n.s+d)%N+N)%N; if(n.s+n.l>N) n.l=N-n.s; }); return "shifted "+(d>0?"right":"left"); },
  reverse:function(){ if(!R.notes.length) return "no notes"; snap(); R.notes.forEach(function(n){ n.s=N-n.s-n.l; }); return "reversed"; },
  humanize:function(){ if(!R.notes.length) return "no notes"; snap(); R.notes.forEach(function(n){ var base=n.v==null?1:n.v; var v=clamp(base-Math.random()*0.35,0.4,1); v=Math.round(v*20)/20; if(v>=1) delete n.v; else n.v=v; }); return "levels humanized"; },
  undo:function(){ if(last==null) return "nothing to undo"; R.notes=JSON.parse(last); last=null; return "undone"; }
};
M.editTools=T;
M.extras.push(function(root){
  var d=root.querySelector("#amRoll"); if(!d||d.querySelector("#amEditRow")) return;
  var row=document.createElement("div"); row.id="amEditRow"; row.className="row";
  row.innerHTML='<span class="lab">Edit</span>'
   +'<button data-e="t-12" aria-label="Down an octave">−8va</button><button data-e="t-1" aria-label="Down a semitone">−1</button><button data-e="t1" aria-label="Up a semitone">+1</button><button data-e="t12" aria-label="Up an octave">+8va</button>'
   +'<button data-e="sl" aria-label="Shift left">◀ step</button><button data-e="sr" aria-label="Shift right">step ▶</button>'
   +'<button data-e="rev">Reverse</button><button data-e="hum">Humanize</button><button data-e="undo">↶ Undo</button><span class="hint" id="amEditHint" style="margin:0 0 0 6px"></span>';
  var anchor=d.querySelector("#amRollWrap"); anchor.parentNode.insertBefore(row,anchor);
  row.style.flexWrap="wrap";
  row.querySelectorAll("button[data-e]").forEach(function(b){ b.onclick=function(){
    var k=b.dataset.e, msg;
    if(k[0]==="t") msg=T.transpose(+k.slice(1)); else if(k==="sl") msg=T.shift(-1); else if(k==="sr") msg=T.shift(1); else if(k==="rev") msg=T.reverse(); else if(k==="hum") msg=T.humanize(); else msg=T.undo();
    done(msg);
    if(k[0]==="t"&&R.notes.length){ var a=M.audio(); if(a) M.playRoll(a.ctx,a.master,a.ctx.currentTime+0.01,0.25,R.notes[0].p,R.vol); }
  }; });
});
if(document.getElementById("amMusicRoot")){ try{ M.extras[M.extras.length-1](document.getElementById("amMusicRoot")); }catch(e){} }
})();

;
/* ==================== Script 890 id="amiyo-fl-step12-scale" ==================== */
/* @id amiyo-fl-step12-scale */


/* =========================================================================
   AMIYO FL STEP 12 (plan step 4) — Scale lock + key highlight
   Pick a key and scale. In-key rows are tinted in the piano roll (the root
   is brighter). With Lock on, taps on out-of-key rows snap to the nearest
   in-key note, so every note you add sounds right.
   ========================================================================= */
(function(){
"use strict";
var M=window.amiyoMusic; if(!M||!M.roll||window.__amiyoMusicS12) return; window.__amiyoMusicS12=true;
var KEY="amiyoMusicScale", NM=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
var SC={"Chromatic":[0,1,2,3,4,5,6,7,8,9,10,11],"Major":[0,2,4,5,7,9,11],"Minor":[0,2,3,5,7,8,10],"Dorian":[0,2,3,5,7,9,10],"Pentatonic":[0,2,4,7,9],"Minor pent.":[0,3,5,7,10],"Blues":[0,3,5,6,7,10],"Harmonic min.":[0,2,3,5,7,8,11]};
var S=M.scale={root:0,name:"Chromatic",lock:false,notes:SC};
try{ var j=JSON.parse(localStorage.getItem(KEY)||"null"); if(j){ if(j.root>=0&&j.root<12) S.root=j.root|0; if(SC[j.name]) S.name=j.name; S.lock=!!j.lock; } }catch(e){}
function save(){ try{ localStorage.setItem(KEY,JSON.stringify({root:S.root,name:S.name,lock:S.lock})); }catch(e){} }
M.inScale=function(p){ if(S.name==="Chromatic") return false; return SC[S.name].indexOf(((p-S.root)%12+12)%12)>=0; };
M.snapPitch=function(p){
  if(!S.lock||S.name==="Chromatic") return p;
  for(var d=0;d<12;d++){ if(M.inScale(p-d)) return p-d; if(M.inScale(p+d)) return p+d; }
  return p;
};
M.extras.push(function(root){
  var d=root.querySelector("#amRoll"); if(!d||d.querySelector("#amScaleRow")) return;
  var row=document.createElement("div"); row.id="amScaleRow"; row.className="row"; row.style.flexWrap="wrap";
  row.innerHTML='<span class="lab">Key</span><select id="amKeyRoot" aria-label="Key">'+NM.map(function(n,i){ return '<option value="'+i+'"'+(i===S.root?" selected":"")+'>'+n+'</option>'; }).join("")+'</select>'
   +'<select id="amKeyScale" aria-label="Scale">'+Object.keys(SC).map(function(n){ return '<option'+(n===S.name?" selected":"")+'>'+n+'</option>'; }).join("")+'</select>'
   +'<button id="amKeyLock" aria-pressed="'+S.lock+'">🔒 Lock</button>';
  var anchor=d.querySelector("#amRollWrap"); anchor.parentNode.insertBefore(row,anchor);
  var lock=row.querySelector("#amKeyLock"); lock.classList.toggle("on",S.lock);
  row.querySelector("#amKeyRoot").onchange=function(){ S.root=+this.value; save(); M.drawRoll(); };
  row.querySelector("#amKeyScale").onchange=function(){ S.name=this.value; save(); M.drawRoll(); };
  lock.onclick=function(){ S.lock=!S.lock; lock.classList.toggle("on",S.lock); lock.setAttribute("aria-pressed",S.lock); save(); };
  M.drawRoll();
});
if(document.getElementById("amMusicRoot")){ try{ M.extras[M.extras.length-1](document.getElementById("amMusicRoot")); }catch(e){} }
})();

;
/* ==================== Script 891 id="amiyo-fl-step13-chords" ==================== */
/* @id amiyo-fl-step13-chords */

/* =========================================================================
   AMIYO FL STEP 13 (plan step 5) — Chord stamp
   Pick a chord type; every tap on the piano roll then stamps the whole chord
   (root = the tapped row). With Scale lock on, each chord note also snaps to
   the key. Tap the root note again to remove just that note.
   ========================================================================= */
(function(){
"use strict";
var M=window.amiyoMusic; if(!M||!M.roll||window.__amiyoMusicS13) return; window.__amiyoMusicS13=true;
var KEY="amiyoMusicChord";
var CH={"Off":[0],"Major":[0,4,7],"Minor":[0,3,7],"7th":[0,4,7,10],"Maj7":[0,4,7,11],"Min7":[0,3,7,10],"Sus4":[0,5,7],"Dim":[0,3,6],"Power":[0,7],"Add9":[0,4,7,14]};
var C=M.chord={name:"Off",types:CH};
try{ var j=localStorage.getItem(KEY); if(CH[j]) C.name=j; }catch(e){}
M.chordTones=function(p){
  var out=[], seen={};
  CH[C.name].forEach(function(iv){ var q=p+iv; if(iv>0&&M.snapPitch&&M.scale&&M.scale.lock) q=M.snapPitch(q); if(q<=127&&!seen[q]){ seen[q]=1; out.push(q); } });
  return out;
};
M.extras.push(function(root){
  var d=root.querySelector("#amRoll"); if(!d||d.querySelector("#amChordRow")) return;
  var row=document.createElement("div"); row.id="amChordRow"; row.className="row"; row.style.flexWrap="wrap";
  row.innerHTML='<span class="lab">Chord</span>'+Object.keys(CH).map(function(n){ return '<button data-c="'+n+'" class="'+(n===C.name?"on":"")+'">'+n+'</button>'; }).join("");
  var anchor=d.querySelector("#amRollWrap"); anchor.parentNode.insertBefore(row,anchor);
  row.querySelectorAll("button").forEach(function(b){ b.onclick=function(){ C.name=b.dataset.c; try{ localStorage.setItem(KEY,C.name); }catch(e){} row.querySelectorAll("button").forEach(function(x){ x.classList.toggle("on",x===b); }); }; });
});
if(document.getElementById("amMusicRoot")){ try{ M.extras[M.extras.length-1](document.getElementById("amMusicRoot")); }catch(e){} }
})();

;
/* ==================== Script 892 id="amiyo-fl-step14-arp" ==================== */
/* @id amiyo-fl-step14-arp */

/* =========================================================================
   AMIYO FL STEP 14 (plan step 6) — Arpeggiator
   Any chord (two or more notes that start on the same step) is played one
   note at a time instead: up, down, up-down or random, at 2x or 4x speed,
   across 1 or 2 octaves. Single notes are not changed. Works in the bounce.
   ========================================================================= */
(function(){
"use strict";
var M=window.amiyoMusic; if(!M||!M.roll||window.__amiyoMusicS14) return; window.__amiyoMusicS14=true;
var KEY="amiyoMusicArp", R=M.roll;
var A=M.arp={on:false,mode:"Up",rate:2,oct:1};
try{ var j=JSON.parse(localStorage.getItem(KEY)||"null"); if(j){ A.on=!!j.on; if(["Up","Down","Up-Down","Random"].indexOf(j.mode)>=0) A.mode=j.mode; if(j.rate===2||j.rate===4) A.rate=j.rate; if(j.oct===1||j.oct===2) A.oct=j.oct; } }catch(e){}
function save(){ try{ localStorage.setItem(KEY,JSON.stringify({on:A.on,mode:A.mode,rate:A.rate,oct:A.oct})); }catch(e){} }
function seq(pitches){
  var base=pitches.slice().sort(function(a,b){ return a-b; }), up=[];
  for(var o=0;o<A.oct;o++) base.forEach(function(p){ up.push(p+12*o); });
  if(A.mode==="Down") return up.slice().reverse();
  if(A.mode==="Up-Down") return up.concat(up.slice(1,-1).reverse());
  return up;
}
M.arpSequence=seq;
M.arpHandle=function(n,i,t,sd,ctx,dest){
  if(!A.on) return false;
  var grp=R.notes.filter(function(o){ return o.s===n.s; });
  if(grp.length<2) return false;
  if(R.notes.indexOf(n)!==R.notes.indexOf(grp[0])) return true; /* only the first of the group triggers */
  var ps=seq(grp.map(function(o){ return o.p; })), total=Math.max(1,Math.round(n.l*A.rate)), step=sd/A.rate;
  for(var k=0;k<total;k++){
    var p=A.mode==="Random"?ps[Math.floor(Math.random()*ps.length)]:ps[k%ps.length];
    M.playRoll(ctx,dest,t+k*step,step*0.9,p,R.vol*(n.v==null?1:n.v)*0.9);
  }
  return true;
};
M.extras.push(function(root){
  var d=root.querySelector("#amRoll"); if(!d||d.querySelector("#amArpRow")) return;
  var row=document.createElement("div"); row.id="amArpRow"; row.className="row"; row.style.flexWrap="wrap";
  function b(attr,val,txt,cur){ return '<button data-'+attr+'="'+val+'" class="'+(cur?"on":"")+'">'+txt+'</button>'; }
  function draw(){
    row.innerHTML='<span class="lab">Arp</span>'+'<button data-t="1" class="'+(A.on?"on":"")+'" aria-pressed="'+A.on+'">'+(A.on?"On":"Off")+'</button>'
     +["Up","Down","Up-Down","Random"].map(function(m){ return b("m",m,m,A.mode===m); }).join("")
     +b("r",2,"2×",A.rate===2)+b("r",4,"4×",A.rate===4)+b("o",1,"1 oct",A.oct===1)+b("o",2,"2 oct",A.oct===2);
    row.querySelectorAll("button").forEach(function(x){ x.onclick=function(){
      if(x.dataset.t) A.on=!A.on; else if(x.dataset.m) A.mode=x.dataset.m; else if(x.dataset.r) A.rate=+x.dataset.r; else if(x.dataset.o) A.oct=+x.dataset.o;
      save(); draw();
    }; });
  }
  draw();
  var anchor=d.querySelector("#amRollWrap"); anchor.parentNode.insertBefore(row,anchor);
});
if(document.getElementById("amMusicRoot")){ try{ M.extras[M.extras.length-1](document.getElementById("amMusicRoot")); }catch(e){} }
})();

;
/* ==================== Script 893 id="amiyo-fl-step15-drumfeel" ==================== */
/* @id amiyo-fl-step15-drumfeel */
/* =========================================================================
   AMIYO FL STEP 15 (plan step 7) — Drum chance and ratchet
   Every drum row gets a Chance % (how often a step really plays; 100 = always)
   and a Ratchet (1-4 rapid repeats inside a step, like a hi-hat roll).
   Chance gives patterns a human, never-the-same-twice feel. Taps on the grid
   always sound so you can still audition. Used live and in the bounce.
   ========================================================================= */
(function(){
"use strict";
var M=window.amiyoMusic; if(!M||window.__amiyoMusicS15) return; window.__amiyoMusicS15=true;
var KEY="amiyoMusicFeel", P={};
M.drums.forEach(function(d){ P[d.id]={chance:100,ratchet:1}; });
try{ var j=JSON.parse(localStorage.getItem(KEY)||"null"); if(j) M.drums.forEach(function(d){ var c=j[d.id]; if(c) P[d.id]={chance:Math.max(0,Math.min(100,+c.chance==+c.chance?+c.chance:100)),ratchet:[1,2,3,4].indexOf(+c.ratchet)>=0?+c.ratchet:1}; }); }catch(e){}
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(P)); }catch(e){} }
M.feel=P;
var ov=M.voice;
M.voice=function(ctx,dest,id,t,vel){
  var c=P[id]; if(!c) return ov(ctx,dest,id,t,vel);
  var offline=!!(window.OfflineAudioContext&&ctx instanceof window.OfflineAudioContext);
  if(!offline&&!M.state.playing) return ov(ctx,dest,id,t,vel);
  if(c.chance<100&&Math.random()*100>=c.chance) return;
  ov(ctx,dest,id,t,vel);
  if(c.ratchet>1){ var sd=M.stepDur(); for(var k=1;k<c.ratchet;k++) ov(ctx,dest,id,t+k*sd/c.ratchet,vel*(0.75-0.1*k)); }
};
M.extras.push(function(root){
  if(root.querySelector("#amFeel")) return;
  var d=document.createElement("div"); d.id="amFeel"; d.className="amm"; d.style.cssText="padding:0;border-top:1px solid var(--line,#3a3f4b);padding-top:8px";
  d.innerHTML='<h3>Drum feel</h3>'+M.drums.map(function(dr){
    var c=P[dr.id];
    return '<div class="row tr" data-d="'+dr.id+'"><span class="lab" style="width:62px">'+dr.name+'</span><input type="range" min="0" max="100" value="'+c.chance+'" aria-label="'+dr.name+' chance"><span class="val" style="width:38px">'+c.chance+'%</span>'
     +[1,2,3,4].map(function(n){ return '<button data-r="'+n+'" class="'+(c.ratchet===n?"on":"")+'" aria-label="'+dr.name+' ratchet '+n+'">'+n+'×</button>'; }).join("")+'</div>';
  }).join("")+'<div class="hint">Chance = how often a step plays. Ratchet = repeats inside a step.</div>';
  var anchor=root.querySelector("#amRoll")||root.querySelector("#amBounce"); if(anchor) root.insertBefore(d,anchor); else root.appendChild(d);
  d.querySelectorAll(".row[data-d]").forEach(function(row){
    var id=row.dataset.d, rng=row.querySelector("input"), val=row.querySelector(".val");
    rng.oninput=function(){ P[id].chance=+rng.value; val.textContent=rng.value+"%"; save(); };
    rng.ondblclick=function(){ rng.value=100; rng.oninput(); };
    row.querySelectorAll("button[data-r]").forEach(function(b){ b.onclick=function(){ P[id].ratchet=+b.dataset.r; save(); row.querySelectorAll("button[data-r]").forEach(function(x){ x.classList.toggle("on",x===b); }); }; });
  });
});
if(document.getElementById("amMusicRoot")){ try{ M.extras[M.extras.length-1](document.getElementById("amMusicRoot")); }catch(e){} }
})();

;
/* ==================== Script 894 id="amiyo-fl-step16-sampler" ==================== */
/* @id amiyo-fl-step16-sampler */

/* =========================================================================
   AMIYO FL STEP 16 (plan step 8) — Sampler: your own sound on any drum pad
   Load a short audio file (WAV, MP3, M4A...) onto any of the 8 drum rows. It
   then plays instead of the built-in drum, through that row's mixer channel,
   Chance and Ratchet, and is included in the bounce. Pitch -12..+12 semitones.
   Samples are kept in this browser (IndexedDB) so they are still there next time.
   ========================================================================= */
(function(){
"use strict";
var M=window.amiyoMusic; if(!M||window.__amiyoMusicS16) return; window.__amiyoMusicS16=true;
var KEY="amiyoMusicSamplerMeta", DB="amiyoMusicSamples", S={}, MAXB=8*1024*1024, MAXSEC=8;
M.samples=S; /* id -> {buf,name,pitch} */
var meta={}; try{ meta=JSON.parse(localStorage.getItem(KEY)||"{}")||{}; }catch(e){}
function saveMeta(){ var o={}; Object.keys(S).forEach(function(k){ o[k]={name:S[k].name,pitch:S[k].pitch}; }); try{ localStorage.setItem(KEY,JSON.stringify(o)); }catch(e){} }
function say(m){ try{ if(typeof toast==="function") toast(m); }catch(e){} }
/* ---- tiny IndexedDB store ---- */
function idb(fn){ return new Promise(function(res,rej){ try{ var q=indexedDB.open(DB,1); q.onupgradeneeded=function(){ q.result.createObjectStore("s"); }; q.onsuccess=function(){ try{ fn(q.result,res,rej); }catch(e){ rej(e); } }; q.onerror=function(){ rej(q.error); }; }catch(e){ rej(e); } }); }
function dbPut(id,ab){ return idb(function(db,res){ var tx=db.transaction("s","readwrite"); tx.objectStore("s").put(ab,id); tx.oncomplete=function(){ res(); }; tx.onerror=function(){ res(); }; }).catch(function(){}); }
function dbDel(id){ return idb(function(db,res){ var tx=db.transaction("s","readwrite"); tx.objectStore("s").delete(id); tx.oncomplete=function(){ res(); }; }).catch(function(){}); }
function dbGet(id){ return idb(function(db,res){ var r=db.transaction("s").objectStore("s").get(id); r.onsuccess=function(){ res(r.result); }; r.onerror=function(){ res(null); }; }).catch(function(){ return null; }); }
function decode(ab){
  var a=M.audio(); var ctx=a&&a.ctx; if(!ctx) return Promise.reject(new Error("Audio is not supported"));
  return new Promise(function(res,rej){ var p=ctx.decodeAudioData(ab.slice(0),res,rej); if(p&&p.then) p.then(res,rej); });
}
M.loadSample=function(id,ab,name,keep){
  if(!M.drums.some(function(d){ return d.id===id; })) return Promise.reject(new Error("unknown pad"));
  if(ab.byteLength>MAXB) return Promise.reject(new Error("File is too big (max 8 MB)"));
  return decode(ab).then(function(buf){
    if(buf.duration>MAXSEC*4) throw new Error("Sound is too long (max "+(MAXSEC*4)+" s)");
    S[id]={buf:buf,name:name||"sample",pitch:(S[id]&&S[id].pitch)||0}; saveMeta(); if(keep!==false) dbPut(id,ab); return S[id];
  });
};
M.clearSample=function(id){ delete S[id]; saveMeta(); dbDel(id); };
M.sampleVoice=function(ctx,dest,id,t,v){
  var s=S[id]; if(!s) return false;
  var src=ctx.createBufferSource(); src.buffer=s.buf; src.playbackRate.value=Math.pow(2,(s.pitch||0)/12);
  var g=ctx.createGain(), dur=Math.min(s.buf.duration/src.playbackRate.value,MAXSEC);
  g.gain.setValueAtTime(Math.max(0.0001,0.9*v),t); g.gain.setValueAtTime(Math.max(0.0001,0.9*v),t+Math.max(0,dur-0.05)); g.gain.linearRampToValueAtTime(0.0001,t+dur);
  src.connect(g); g.connect(dest); src.start(t); src.stop(t+dur+0.02);
  return true;
};
/* restore saved samples after the first user gesture-free decode attempt */
function restore(){
  var ids=Object.keys(meta); if(!ids.length) return;
  var a=M.audio&&M.audio(); /* creating the context early is fine; it resumes on first tap */
  ids.forEach(function(id){ dbGet(id).then(function(ab){ if(!ab) return; return M.loadSample(id,ab,meta[id].name,false).then(function(s){ s.pitch=meta[id].pitch||0; refresh(); }); }).catch(function(){}); });
}
function refresh(){ var r=document.getElementById("amMusicRoot"); var d=document.getElementById("amSampler"); if(r&&d){ d.remove(); try{ M.extras[M.extras.length-1](r); }catch(e){} } }
M.extras.push(function(root){
  if(root.querySelector("#amSampler")) return;
  var d=document.createElement("div"); d.id="amSampler"; d.className="amm"; d.style.cssText="padding:0;border-top:1px solid var(--line,#3a3f4b);padding-top:8px";
  d.innerHTML='<h3>Sampler</h3>'+M.drums.map(function(dr){
    var s=S[dr.id];
    return '<div class="row tr" data-d="'+dr.id+'"><span class="lab" style="width:62px">'+dr.name+'</span><button data-a="load">'+(s?"Replace":"Load sound")+'</button><span class="hint" style="margin:0 6px;flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">'+(s?s.name.replace(/[<>&]/g,""):"built-in")+'</span>'
     +(s?'<button data-a="dn" aria-label="Pitch down">−</button><span class="val" style="width:34px">'+(s.pitch>0?"+":"")+s.pitch+'</span><button data-a="up" aria-label="Pitch up">+</button><button data-a="play" aria-label="Preview">▶</button><button data-a="clr" aria-label="Remove sample">✕</button>':'')+'</div>';
  }).join("")+'<input type="file" id="amSampFile" accept="audio/*" style="display:none"><div class="hint">Short sounds work best (max 8 MB). The row keeps its steps, mixer and chance settings.</div>';
  var anchor=root.querySelector("#amFeel")||root.querySelector("#amRoll")||root.querySelector("#amBounce"); if(anchor) root.insertBefore(d,anchor); else root.appendChild(d);
  var file=d.querySelector("#amSampFile"), pending=null;
  file.onchange=function(){ var f=file.files&&file.files[0]; file.value=""; if(!f||!pending) return; var id=pending; pending=null;
    f.arrayBuffer().then(function(ab){ return M.loadSample(id,ab,f.name); }).then(function(){ refresh(); say("Sample loaded"); }).catch(function(e){ say("Could not load: "+(e&&e.message||"unsupported file")); }); };
  d.querySelectorAll(".row[data-d]").forEach(function(row){
    var id=row.dataset.d;
    row.querySelectorAll("button").forEach(function(b){ b.onclick=function(){
      var a=b.dataset.a;
      if(a==="load"){ pending=id; file.click(); }
      else if(a==="clr"){ M.clearSample(id); refresh(); }
      else if(a==="dn"||a==="up"){ S[id].pitch=Math.max(-12,Math.min(12,S[id].pitch+(a==="up"?1:-1))); saveMeta(); refresh(); }
      else if(a==="play"){ var au=M.audio(); if(au) M.voice(au.ctx,au.master,id,au.ctx.currentTime+0.01,0.9); }
    }; });
  });
});
restore();
if(document.getElementById("amMusicRoot")){ try{ M.extras[M.extras.length-1](document.getElementById("amMusicRoot")); }catch(e){} }
})();

;
/* ==================== Script 895 id="amiyo-fl-step17-sidechain" ==================== */
/* @id amiyo-fl-step17-sidechain */
/* =========================================================================
   AMIYO FL STEP 17 (plan step 9) — Sidechain pump
   The classic dance-music "pumping": every time the kick drum plays, the
   synth/keys channel dips and swells back, so the kick punches through.
   Amount (how far it dips) and Release (how fast it comes back) are set
   here. Live and in the bounce. Respects a muted kick row.
   ========================================================================= */
(function(){
"use strict";
var M=window.amiyoMusic; if(!M||!M.instNote||window.__amiyoMusicS17) return; window.__amiyoMusicS17=true;
var KEY="amiyoMusicSidechain", D=M.duck={on:false,amount:60,release:180};
try{ var j=JSON.parse(localStorage.getItem(KEY)||"null"); if(j){ D.on=!!j.on; D.amount=Math.max(0,Math.min(100,+j.amount==+j.amount?+j.amount:60)); D.release=Math.max(50,Math.min(500,+j.release==+j.release?+j.release:180)); } }catch(e){}
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(D)); }catch(e){} }
var nodes=new WeakMap();
function node(ctx,dest){ var g=nodes.get(ctx); if(g) return g; g=ctx.createGain(); g.gain.value=1; g.connect(dest); nodes.set(ctx,g); return g; }
var oi=M.instNote;
M.instNote=function(ctx,dest,t,dur,p,vel,name){ return oi(ctx,node(ctx,dest),t,dur,p,vel,name); };
M.hooks.push(function(i,t,sd,ctx,dest){
  if(!D.on) return;
  var k=-1; for(var r=0;r<M.drums.length;r++) if(M.drums[r].id==="kick") k=r;
  if(k<0||M.state.mute[k]||!M.state.rows[k][i]) return;
  var g=node(ctx,dest).gain, floor=1-D.amount/100, rel=Math.min(D.release/1000,sd*3.5);
  g.setValueAtTime(floor,t); g.linearRampToValueAtTime(1,t+rel);
});
M.extras.push(function(root){
  if(root.querySelector("#amDuck")) return;
  var d=document.createElement("div"); d.id="amDuck"; d.className="amm"; d.style.cssText="padding:0;border-top:1px solid var(--line,#3a3f4b);padding-top:8px";
  d.innerHTML='<h3>Sidechain pump</h3><div class="row tr"><button id="amDuckOn" aria-pressed="'+D.on+'" class="'+(D.on?"on":"")+'">'+(D.on?"On":"Off")+'</button><span class="hint" style="margin:0 0 0 6px">kick ducks the keys</span></div>'
   +'<div class="row tr"><span class="lab">Amount</span><input type="range" id="amDuckAmt" min="0" max="100" value="'+D.amount+'"><span class="val" id="amDuckAmtV">'+D.amount+'%</span></div>'
   +'<div class="row tr"><span class="lab">Release</span><input type="range" id="amDuckRel" min="50" max="500" step="10" value="'+D.release+'"><span class="val" id="amDuckRelV">'+D.release+'ms</span></div>';
  var anchor=root.querySelector("#amSampler")||root.querySelector("#amFeel")||root.querySelector("#amRoll")||root.querySelector("#amBounce"); if(anchor) root.insertBefore(d,anchor); else root.appendChild(d);
  var on=d.querySelector("#amDuckOn");
  on.onclick=function(){ D.on=!D.on; on.classList.toggle("on",D.on); on.textContent=D.on?"On":"Off"; on.setAttribute("aria-pressed",D.on); save(); };
  d.querySelector("#amDuckAmt").oninput=function(){ D.amount=+this.value; d.querySelector("#amDuckAmtV").textContent=this.value+"%"; save(); };
  d.querySelector("#amDuckRel").oninput=function(){ D.release=+this.value; d.querySelector("#amDuckRelV").textContent=this.value+"ms"; save(); };
});
if(document.getElementById("amMusicRoot")){ try{ M.extras[M.extras.length-1](document.getElementById("amMusicRoot")); }catch(e){} }
})();

;
/* ==================== Script 896 id="amiyo-fl-step18-mastertone" ==================== */
/* @id amiyo-fl-step18-mastertone */
/* =========================================================================
   AMIYO FL STEP 18 (plan step 10) — Master tone: Bass, Treble, DJ filter
   Three knobs applied to every channel (drums and keys): Bass and Treble are
   shelving EQs (-12..+12 dB); the DJ filter sweeps a low-pass (left, muffled)
   or high-pass (right, thin) for builds and drops. Changes are heard live
   and are baked into the bounce. Double-tap a slider to reset it.
   ========================================================================= */
(function(){
"use strict";
var M=window.amiyoMusic; if(!M||!M.chanBuild||window.__amiyoMusicS18) return; window.__amiyoMusicS18=true;
var KEY="amiyoMusicTone", T=M.tone={bass:0,treble:0,dj:0};
try{ var j=JSON.parse(localStorage.getItem(KEY)||"null"); if(j){ ["bass","treble"].forEach(function(k){ T[k]=Math.max(-12,Math.min(12,+j[k]||0)); }); T.dj=Math.max(-100,Math.min(100,+j.dj||0)); } }catch(e){}
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(T)); }catch(e){} }
function lpF(v){ return v<0?20000*Math.pow(300/20000,-v/100):20000; }
function hpF(v){ return v>0?10*Math.pow(6000/10,v/100):10; }
var live=[]; /* nodes built for the live context */
M.chanBuild.push(function(ctx,id,tail){
  var lo=ctx.createBiquadFilter(); lo.type="lowshelf"; lo.frequency.value=150; lo.gain.value=T.bass;
  var hi=ctx.createBiquadFilter(); hi.type="highshelf"; hi.frequency.value=5000; hi.gain.value=T.treble;
  var lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=lpF(T.dj); lp.Q.value=0.8;
  var hp=ctx.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=hpF(T.dj); hp.Q.value=0.8;
  tail.connect(lo); lo.connect(hi); hi.connect(lp); lp.connect(hp);
  if(ctx===M.liveCtx()) live.push({ctx:ctx,lo:lo,hi:hi,lp:lp,hp:hp});
  return hp;
});
function apply(){ live.forEach(function(n){ var t=n.ctx.currentTime; n.lo.gain.setTargetAtTime(T.bass,t,0.02); n.hi.gain.setTargetAtTime(T.treble,t,0.02); n.lp.frequency.setTargetAtTime(lpF(T.dj),t,0.02); n.hp.frequency.setTargetAtTime(hpF(T.dj),t,0.02); }); }
M.applyTone=apply;
M.extras.push(function(root){
  if(root.querySelector("#amTone")) return;
  var d=document.createElement("div"); d.id="amTone"; d.className="amm"; d.style.cssText="padding:0;border-top:1px solid var(--line,#3a3f4b);padding-top:8px";
  function row(k,lab,min,max,unit){ return '<div class="row tr"><span class="lab">'+lab+'</span><input type="range" data-k="'+k+'" min="'+min+'" max="'+max+'" value="'+T[k]+'" aria-label="'+lab+'"><span class="val" data-v="'+k+'" style="width:52px">'+fmt(k)+'</span></div>'; }
  function fmt(k){ var v=T[k]; return k==="dj"?(v===0?"off":(v<0?"LP ":"HP ")+Math.abs(v)):(v>0?"+":"")+v+" dB"; }
  d.innerHTML='<h3>Master tone</h3>'+row("bass","Bass",-12,12)+row("treble","Treble",-12,12)+row("dj","DJ filter",-100,100)+'<div class="row"><button id="amToneReset">Reset tone</button></div>';
  var anchor=root.querySelector("#amDuck")||root.querySelector("#amSampler")||root.querySelector("#amBounce"); if(anchor) root.insertBefore(d,anchor); else root.appendChild(d);
  d.querySelectorAll("input[data-k]").forEach(function(r){ var k=r.dataset.k;
    r.oninput=function(){ T[k]=+r.value; d.querySelector('[data-v="'+k+'"]').textContent=fmt(k); save(); apply(); };
    r.ondblclick=function(){ r.value=0; r.oninput(); }; });
  d.querySelector("#amToneReset").onclick=function(){ T.bass=T.treble=T.dj=0; save(); apply(); d.querySelectorAll("input[data-k]").forEach(function(r){ r.value=0; d.querySelector('[data-v="'+r.dataset.k+'"]').textContent=fmt(r.dataset.k); }); };
});
if(document.getElementById("amMusicRoot")){ try{ M.extras[M.extras.length-1](document.getElementById("amMusicRoot")); }catch(e){} }
})();

;
/* ==================== Script 897 id="amiyo-fl-step19-spectrum" ==================== */
/* @id amiyo-fl-step19-spectrum */
/* =========================================================================
   AMIYO FL STEP 19 (plan step 11) — Spectrum analyzer + peak meter
   A live frequency display (48 log-spaced bars, 30 Hz - 16 kHz) of the whole
   mix with a peak-hold line and a dB peak read-out, so you can see bass-heavy
   or harsh mixes. It listens only: nothing in the sound path changes, and it
   stops drawing when the panel is closed or the tab is hidden.
   ========================================================================= */
(function(){
"use strict";
var M=window.amiyoMusic; if(!M||window.__amiyoMusicS19) return; window.__amiyoMusicS19=true;
var an=null, anCtx=null, fbuf=null, tbuf=null, BARS=48, edges=null, peak=new Array(BARS).fill(0), pkDb=-90, pkHold=0, raf=0;
function attach(){
  var ctx=M.liveCtx(); if(!ctx) return false;
  if(an&&anCtx===ctx) return true;
  var a=M.audio(); if(!a) return false;
  an=ctx.createAnalyser(); an.fftSize=2048; an.smoothingTimeConstant=0.78; an.minDecibels=-90; an.maxDecibels=-10;
  try{ a.master.connect(an); }catch(e){ return false; }
  anCtx=ctx; fbuf=new Uint8Array(an.frequencyBinCount); tbuf=new Float32Array(an.fftSize);
  edges=[]; for(var i=0;i<=BARS;i++){ var f=30*Math.pow(16000/30,i/BARS); edges.push(Math.max(1,Math.round(f/(ctx.sampleRate/an.fftSize)))); }
  return true;
}
M.spectrum={
  read:function(){
    if(!attach()) return null;
    an.getByteFrequencyData(fbuf); an.getFloatTimeDomainData(tbuf);
    var bins=[]; for(var b=0;b<BARS;b++){ var s=0,n=0,lo=edges[b],hi=Math.max(lo+1,edges[b+1]); for(var k=lo;k<hi&&k<fbuf.length;k++){ s+=fbuf[k]; n++; } bins.push(n?s/n/255:0); }
    var pk=0; for(var i=0;i<tbuf.length;i++){ var v=Math.abs(tbuf[i]); if(v>pk) pk=v; }
    return {bins:bins,peakDb:pk>0.00003?20*Math.log10(pk):-90};
  }
};
function loop(){
  var cv=document.getElementById("amSpecCv");
  if(!cv){ raf=0; return; }
  raf=requestAnimationFrame(loop);
  if(document.hidden) return;
  var g=cv.getContext("2d"), W=cv.width, H=cv.height, r=M.spectrum.read();
  g.clearRect(0,0,W,H);
  var bw=W/BARS;
  if(r){
    for(var b=0;b<BARS;b++){ var v=Math.pow(r.bins[b],1.4); peak[b]=Math.max(v,peak[b]-0.012);
      var h=v*(H-4), x=b*bw; var gr=g.createLinearGradient(0,H,0,0); gr.addColorStop(0,"#2fbf71"); gr.addColorStop(0.65,"#ffb04a"); gr.addColorStop(1,"#ff5a4a");
      g.fillStyle=gr; g.fillRect(x+1,H-h,bw-2,h);
      g.fillStyle="rgba(255,255,255,.75)"; g.fillRect(x+1,H-peak[b]*(H-4)-2,bw-2,2); }
    if(r.peakDb>pkDb||pkHold<=0){ pkDb=r.peakDb; pkHold=60; } else pkHold--;
    var el=document.getElementById("amSpecDb"); if(el){ var txt=pkDb<=-89?"-∞ dB":pkDb.toFixed(1)+" dB"; if(el.textContent!==txt) el.textContent=txt; el.style.color=pkDb>-1?"#ff5a4a":""; }
  }
}
M.extras.push(function(root){
  if(root.querySelector("#amSpec")) return;
  var d=document.createElement("div"); d.id="amSpec"; d.className="amm"; d.style.cssText="padding:0;border-top:1px solid var(--line,#3a3f4b);padding-top:8px";
  d.innerHTML='<h3>Spectrum <span class="val" id="amSpecDb" style="float:right;font-weight:600">-∞ dB</span></h3><canvas id="amSpecCv" width="480" height="84" style="width:100%;height:84px;display:block;border-radius:6px;background:rgba(128,128,128,.12)" role="img" aria-label="Live frequency spectrum of the music mix"></canvas><div class="row" style="justify-content:space-between;font-size:10px;opacity:.7"><span>30 Hz</span><span>500</span><span>2k</span><span>16k</span></div>';
  var anchor=root.querySelector("#amBounce"); if(anchor) root.insertBefore(d,anchor); else root.appendChild(d);
  if(!raf) raf=requestAnimationFrame(loop);
});
if(document.getElementById("amMusicRoot")){ try{ M.extras[M.extras.length-1](document.getElementById("amMusicRoot")); }catch(e){} }
})();

;
/* ==================== Script 898 id="amiyo-fl-step20-musicundo" ==================== */
/* @id amiyo-fl-step20-musicundo */
/* =========================================================================
   AMIYO FL STEP 20 (plan step 12) — Undo / Redo for the music studio
   Drum steps, piano roll notes, tempo, swing and mutes all go on a history
   (50 steps). Dragging a slider counts as one change. Undo and Redo buttons sit
   under the tempo row. This is separate from the video timeline's own undo,
   so one never undoes the other by accident.
   ========================================================================= */
(function(){
"use strict";
var M=window.amiyoMusic; if(!M||!M.roll||window.__amiyoMusicS20) return; window.__amiyoMusicS20=true;
var S=M.state, R=M.roll, MAX=50, undo=[], redo=[], last=null, lastInputAt=0;
function ser(){ return JSON.stringify({rows:S.rows,mute:S.mute,bpm:S.bpm,swing:S.swing,notes:R.notes}); }
function apply(js){
  var o=JSON.parse(js); S.rows=o.rows; S.mute=o.mute; S.bpm=o.bpm; S.swing=o.swing; R.notes=o.notes;
  M.save(); M.saveRoll(); if(M.repaint) M.repaint(); M.drawRoll(); buttons();
}
function buttons(){ var u=document.getElementById("amUndoBtn"), r=document.getElementById("amRedoBtn"); if(u){ u.disabled=!undo.length; u.textContent="↶ Undo"+(undo.length?" ("+undo.length+")":""); } if(r){ r.disabled=!redo.length; r.textContent="↷ Redo"+(redo.length?" ("+redo.length+")":""); } }
M.history={undo:function(){ if(!undo.length) return false; var cur=ser(); redo.push(cur); last=undo.pop(); apply(last); return true; },
           redo:function(){ if(!redo.length) return false; var cur=ser(); undo.push(cur); last=redo.pop(); apply(last); return true; },
           depth:function(){ return {undo:undo.length,redo:redo.length}; }, check:check};
function check(kind){
  var cur=ser(); if(last===null){ last=cur; return; }
  if(cur===last) return;
  var now=Date.now();
  if(kind==="input"&&now-lastInputAt<700&&undo.length){ /* same slider drag: keep the original "before" state */ lastInputAt=now; last=cur; redo=[]; buttons(); return; }
  undo.push(last); if(undo.length>MAX) undo.shift(); redo=[]; last=cur; if(kind==="input") lastInputAt=now; buttons();
}
function inRoot(e){ var t=e.target; return t&&t.closest&&t.closest("#amMusicRoot"); }
["pointerup","click","change","keyup"].forEach(function(ev){ document.addEventListener(ev,function(e){ if(!inRoot(e)) return; var id=e.target.id; if(id==="amUndoBtn"||id==="amRedoBtn") return; setTimeout(function(){ check(ev); },0); },true); });
document.addEventListener("input",function(e){ if(!inRoot(e)) return; setTimeout(function(){ check("input"); },0); },true);
M.extras.push(function(root){
  if(last===null) last=ser();
  if(root.querySelector("#amUndoRow")) return;
  var d=document.createElement("div"); d.id="amUndoRow"; d.className="row tr";
  d.innerHTML='<button id="amUndoBtn" aria-label="Undo last music edit">↶ Undo</button><button id="amRedoBtn" aria-label="Redo">↷ Redo</button>';
  var a=root.querySelector("#amTapRow")||root.querySelector("#amBpm"); a=a&&(a.id==="amTapRow"?a:a.parentNode); if(a&&a.parentNode) a.parentNode.insertBefore(d,a.nextSibling); else root.insertBefore(d,root.firstChild.nextSibling);
  d.querySelector("#amUndoBtn").onclick=function(){ M.history.undo(); };
  d.querySelector("#amRedoBtn").onclick=function(){ M.history.redo(); };
  buttons();
});
if(document.getElementById("amMusicRoot")){ try{ M.extras[M.extras.length-1](document.getElementById("amMusicRoot")); }catch(e){} }
})();

;
/* ==================== Script 899 id="amiyo-fl-step21-kits" ==================== */
/* @id amiyo-fl-step21-kits */
/* =========================================================================
   AMIYO FL STEP 21 (plan step 13) — Genre starter kits
   One tap loads a complete starting point: drum pattern, tempo, swing, a
   bass line / chords in the piano roll and the right instrument. Six genres:
   House, Lo-fi, Trap, Techno, Pop, Reggaeton. It replaces the current
   drums and notes, and Undo (under the tempo row) brings your work back.
   ========================================================================= */
(function(){
"use strict";
var M=window.amiyoMusic; if(!M||!M.roll||window.__amiyoMusicS21) return; window.__amiyoMusicS21=true;
var S=M.state, R=M.roll, N=M.steps;
function P(s){ return s.replace(/\s/g,"").split("").map(function(c){ return c==="x"?1:c==="X"?2:0; }); }
var E="................";
function chord(s,l,ps,v){ return ps.map(function(p){ var n={s:s,l:l,p:p}; if(v&&v<1) n.v=v; return n; }); }
function nt(s,l,p,v){ var n={s:s,l:l,p:p}; if(v&&v<1) n.v=v; return n; }
var KITS={
 "House":{bpm:124,swing:0,inst:"Keys",rows:["X...X...X...X...",E,"....X.......X...","x.x.x.x.x.x.x.x.","..X...X...X...X.",E,E,E],
   notes:[].concat(chord(2,1,[57,60,64]),chord(6,1,[57,60,64],0.7),chord(10,1,[53,57,60]),chord(14,1,[55,59,62],0.7),[nt(0,2,33),nt(4,2,33),nt(8,2,29),nt(12,2,31)])},
 "Lo-fi":{bpm:80,swing:28,inst:"Keys",rows:["X.....x...x.....",E,E,"x.x.x.x.x.x.x.x.",E,E,"....x.......x...",E],
   notes:[].concat(chord(0,6,[50,53,57,60],0.8),chord(8,6,[46,50,53,57],0.8),[nt(0,3,38,0.8),nt(8,3,34,0.8)])},
 "Trap":{bpm:140,swing:0,inst:"Bass",rows:["X.....x...x.....","........X.......","........x.......","xxxxxxxxxxxxxxxx","..............x.",E,E,E],
   notes:[nt(0,4,36),nt(6,2,34),nt(10,4,38),nt(14,2,36,0.7)]},
 "Techno":{bpm:130,swing:0,inst:"Bass",rows:["X...X...X...X...",E,"....x.......x...","xxxxxxxxxxxxxxxx","..x...x...x...x.",E,"..x..x..x..x..x.",E],
   notes:[nt(0,1,36),nt(2,1,36,0.7),nt(3,1,48),nt(5,1,36),nt(7,1,39),nt(8,1,36),nt(10,1,36,0.7),nt(11,1,48),nt(13,1,36),nt(15,1,41)]},
 "Pop":{bpm:110,swing:0,inst:"Pad",rows:["X.....x...x.....","....X.......X...",E,"x.x.x.x.x.x.x.x.",E,E,E,E],
   notes:[].concat(chord(0,4,[60,64,67]),chord(4,4,[55,59,62]),chord(8,4,[57,60,64]),chord(12,4,[53,57,60]))},
 "Reggaeton":{bpm:95,swing:10,inst:"Bass",rows:["X...X...X...X...","...x..x....x..x.",E,"x.x.x.x.x.x.x.x.",E,E,E,E],
   notes:[nt(0,2,36),nt(3,1,36,0.7),nt(4,2,36),nt(8,2,36),nt(11,1,36,0.7),nt(12,2,31)]}
};
M.kits=KITS;
M.loadKit=function(name){
  var k=KITS[name]; if(!k) return false;
  S.rows=k.rows.map(P); S.mute=S.mute.map(function(){ return false; }); S.bpm=k.bpm; S.swing=k.swing;
  R.notes=k.notes.map(function(n){ var o={s:n.s,l:Math.min(n.l,N-n.s),p:n.p}; if(n.v) o.v=n.v; return o; }); R.inst=k.inst;
  if(M.arp) M.arp.on=false;
  M.save(); M.saveRoll(); if(M.repaint) M.repaint(); if(M.drawRoll) M.drawRoll();
  return true;
};
M.extras.push(function(root){
  if(root.querySelector("#amKits")) return;
  var d=document.createElement("div"); d.id="amKits"; d.className="row"; d.style.flexWrap="wrap";
  d.innerHTML='<span class="lab">Kits</span>'+Object.keys(KITS).map(function(n){ return '<button data-k="'+n+'">'+n+'</button>'; }).join("");
  var a=root.querySelector("#amUndoRow")||root.querySelector("#amTapRow"); if(a&&a.parentNode) a.parentNode.insertBefore(d,a.nextSibling); else root.insertBefore(d,root.firstChild.nextSibling);
  d.querySelectorAll("button").forEach(function(b){ b.onclick=function(){ M.loadKit(b.dataset.k); try{ if(typeof toast==="function") toast(b.dataset.k+" kit loaded — press Play"); }catch(e){} }; });
});
if(document.getElementById("amMusicRoot")){ try{ M.extras[M.extras.length-1](document.getElementById("amMusicRoot")); }catch(e){} }
})();

;
/* ==================== Script 900 id="amiyo-fl-step22-midi" ==================== */
/* @id amiyo-fl-step22-midi */
/* =========================================================================
   AMIYO FL STEP 22 (plan step 14) — Export a MIDI file
   Saves your drums (General-MIDI drum channel 10) and piano roll notes as a
   standard .mid file with the tempo, swing and note levels, repeated for 1, 2,
   4 or 8 bars. Open it in FL Studio, GarageBand, Ableton, Logic or any MIDI
   app. If the arpeggiator is on, the arpeggio is written out as real notes.
   ========================================================================= */
(function(){
"use strict";
var M=window.amiyoMusic; if(!M||!M.roll||window.__amiyoMusicS22) return; window.__amiyoMusicS22=true;
var S=M.state, R=M.roll, N=M.steps, PPQ=480, ST=PPQ/4, bars=4;
var GM={kick:36,snare:38,clap:39,chat:42,ohat:46,tom:45,rim:37,bell:56};
function vlq(n){ var b=[n&0x7f]; while((n>>=7)>0) b.unshift((n&0x7f)|0x80); return b; }
function u32(n){ return [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255]; }
function u16(n){ return [(n>>>8)&255,n&255]; }
function str(s){ return s.split("").map(function(c){ return c.charCodeAt(0)&127; }); }
function track(events){ /* events: {t,bytes}; sorted, delta-timed, ends with end-of-track */
  events.sort(function(a,b){ return a.t-b.t||(a.order||0)-(b.order||0); });
  var out=[], prev=0; events.forEach(function(e){ out=out.concat(vlq(Math.max(0,e.t-prev)),e.bytes); prev=e.t; });
  out=out.concat(vlq(0),[0xff,0x2f,0x00]);
  return str("MTrk").concat(u32(out.length),out);
}
function clampv(v){ return Math.max(1,Math.min(127,Math.round(v))); }
function swingOff(i){ return (i%2===1)?Math.round(S.swing/100*ST):0; }
function rollEvents(){
  var ev=[], A=M.arp, ra=A&&A.on;
  var done={};
  R.notes.forEach(function(n,idx){
    var vel=clampv(100*(n.v==null?1:n.v)*0.95);
    var grp=ra?R.notes.filter(function(o){ return o.s===n.s; }):[n];
    if(ra&&grp.length>1){
      if(R.notes.indexOf(grp[0])!==idx) return; /* first of group writes the arpeggio */
      var mode=A.mode==="Random"?"Up":A.mode, keep=A.mode; A.mode=mode; var ps=M.arpSequence(grp.map(function(o){ return o.p; })); A.mode=keep;
      var total=Math.max(1,Math.round(n.l*A.rate)), step=ST/A.rate;
      for(var k=0;k<total;k++){ var t=n.s*ST+swingOff(n.s)+Math.round(k*step); ev.push({t:t,bytes:[0x90,ps[k%ps.length],vel],order:1}); ev.push({t:t+Math.max(10,Math.round(step*0.9)),bytes:[0x80,ps[k%ps.length],0],order:0}); }
    } else {
      var t0=n.s*ST+swingOff(n.s); ev.push({t:t0,bytes:[0x90,n.p,vel],order:1}); ev.push({t:t0+Math.max(10,Math.round(n.l*ST*0.95)),bytes:[0x80,n.p,0],order:0});
    }
  });
  return ev;
}
function build(nBars){
  nBars=nBars||bars;
  var bpm=S.bpm, mpq=Math.round(60000000/bpm);
  var t0=[{t:0,bytes:[0xff,0x51,0x03,(mpq>>16)&255,(mpq>>8)&255,mpq&255]},{t:0,bytes:[0xff,0x58,0x04,4,2,24,8]},{t:0,bytes:[0xff,0x03,5].concat(str("Amiyo"))}];
  var drums=[{t:0,bytes:[0xff,0x03,5].concat(str("Drums"))}], keys=[{t:0,bytes:[0xff,0x03,5].concat(str("Notes"))}];
  var ro=rollEvents();
  for(var b=0;b<nBars;b++){
    var off=b*N*ST;
    for(var r=0;r<M.drums.length;r++){ if(S.mute[r]) continue; var row=S.rows[r], note=GM[M.drums[r].id]||36;
      for(var i=0;i<N;i++){ var v=row[i]; if(!v) continue; var t=off+i*ST+swingOff(i); drums.push({t:t,bytes:[0x99,note,v===2?120:80],order:1}); drums.push({t:t+Math.round(ST*0.5),bytes:[0x89,note,0],order:0}); } }
    ro.forEach(function(e){ keys.push({t:e.t+off,bytes:e.bytes.slice(),order:e.order}); });
  }
  var hasKeys=R.notes.length>0, trks=[track(t0),track(drums)]; if(hasKeys) trks.push(track(keys));
  var hdr=str("MThd").concat(u32(6),u16(1),u16(trks.length),u16(PPQ));
  var all=hdr; trks.forEach(function(t){ all=all.concat(t); });
  return new Uint8Array(all);
}
M.midi={build:build,gm:GM,setBars:function(n){ bars=n; }};
M.extras.push(function(root){
  if(root.querySelector("#amMidi")) return;
  var d=document.createElement("div"); d.id="amMidi"; d.className="amm"; d.style.cssText="padding:0;border-top:1px solid var(--line,#3a3f4b);padding-top:8px";
  d.innerHTML='<h3>Export MIDI</h3><div class="row tr"><span class="lab">Length</span>'+[1,2,4,8].map(function(n){ return '<button data-b="'+n+'" class="'+(n===bars?"on":"")+'">'+n+' bar'+(n>1?"s":"")+'</button>'; }).join("")+'</div><div class="row"><button id="amMidiSave" class="on" style="flex:1">Save .mid file</button></div><div class="hint">Drums go on channel 10 (General MIDI). Opens in any DAW.</div>';
  var anchor=root.querySelector("#amBounce"); if(anchor) root.insertBefore(d,anchor); else root.appendChild(d);
  d.querySelectorAll("button[data-b]").forEach(function(b){ b.onclick=function(){ bars=+b.dataset.b; d.querySelectorAll("button[data-b]").forEach(function(x){ x.classList.toggle("on",x===b); }); }; });
  d.querySelector("#amMidiSave").onclick=function(){
    var any=R.notes.length>0||S.rows.some(function(r,i){ return !S.mute[i]&&r.some(Boolean); });
    if(!any){ try{ toast("Add some steps or notes first"); }catch(e){} return; }
    var blob=new Blob([build(bars)],{type:"audio/midi"}), a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="amiyo-"+S.bpm+"bpm-"+bars+"bars.mid"; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },1500);
    try{ toast("MIDI saved"); }catch(e){}
  };
});
if(document.getElementById("amMusicRoot")){ try{ M.extras[M.extras.length-1](document.getElementById("amMusicRoot")); }catch(e){} }
})();

;
/* ==================== Script 901 id="amiyo-fl-step23-stems" ==================== */
/* @id amiyo-fl-step23-stems */
/* =========================================================================
   AMIYO FL STEP 23 (plan step 15) — Export stems (one WAV per channel)
   Renders each drum row and the keys on its own and packs them into one .zip
   of 16-bit WAV files, for mixing in another app. Silent or muted channels
   are skipped. Every stem uses the same random "chance" rolls, so the stems
   add back up to the full mix. Uses the current mixer, tone and sidechain.
   ========================================================================= */
(function(){
"use strict";
var M=window.amiyoMusic; if(!M||!M.render||!M.toWav||!M.mixer||window.__amiyoMusicS23) return; window.__amiyoMusicS23=true;
var S=M.state, R=M.roll, bars=4, busy=false;
var T=null; function table(){ if(T) return T; T=[]; for(var n=0;n<256;n++){ var c=n; for(var k=0;k<8;k++) c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1); T.push(c>>>0); } return T; }
function crc32(u8){ var t=table(), c=0xFFFFFFFF; for(var i=0;i<u8.length;i++) c=t[(c^u8[i])&255]^(c>>>8); return (c^0xFFFFFFFF)>>>0; }
function le(n,b){ var o=[]; for(var i=0;i<b;i++) o.push((n>>>(8*i))&255); return o; }
function zip(files){ /* files: [{name,data:Uint8Array}] stored, no compression */
  var parts=[], central=[], off=0, enc=new TextEncoder();
  files.forEach(function(f){
    var nm=enc.encode(f.name), crc=crc32(f.data);
    var lh=new Uint8Array([0x50,0x4b,3,4].concat(le(20,2),le(0x0800,2),le(0,2),le(0,2),le(0x21,2),le(crc,4),le(f.data.length,4),le(f.data.length,4),le(nm.length,2),le(0,2)));
    parts.push(lh,nm,f.data);
    central.push(new Uint8Array([0x50,0x4b,1,2].concat(le(20,2),le(20,2),le(0x0800,2),le(0,2),le(0,2),le(0x21,2),le(crc,4),le(f.data.length,4),le(f.data.length,4),le(nm.length,2),le(0,2),le(0,2),le(0,2),le(0,2),le(0,4),le(off,4))),nm);
    off+=lh.length+nm.length+f.data.length;
  });
  var cs=0; central.forEach(function(c){ cs+=c.length; });
  var end=new Uint8Array([0x50,0x4b,5,6].concat(le(0,2),le(0,2),le(files.length,2),le(files.length,2),le(cs,4),le(off,4),le(0,2)));
  return new Blob(parts.concat(central,[end]),{type:"application/zip"});
}
function seeded(seed){ var a=seed>>>0; return function(){ a=(a+0x6D2B79F5)>>>0; var t=a; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; }; }
function channels(){
  var out=[];
  M.drums.forEach(function(d,r){ if(!S.mute[r]&&S.rows[r].some(Boolean)) out.push({id:d.id,name:d.name}); });
  if(R.notes.length) out.push({id:"keys",name:"Keys"});
  return out;
}
M.stemChannels=channels; M.makeZip=zip;
M.renderStems=function(nBars,onProgress){
  var list=channels(), X=M.mixer, saved={}, rnd=Math.random, files=[];
  Object.keys(X).forEach(function(id){ saved[id]=X[id].solo; });
  var i=0;
  function done(){ Math.random=rnd; Object.keys(saved).forEach(function(id){ X[id].solo=saved[id]; }); }
  function next(){
    if(i>=list.length){ done(); return Promise.resolve(files); }
    var c=list[i++]; if(onProgress) onProgress(i,list.length,c.name);
    Object.keys(X).forEach(function(id){ X[id].solo=(id===c.id); });
    Math.random=seeded(12345);
    var used=(M.bounceBars&&M.bounceBars(nBars))||nBars;
    return M.render(used).then(function(r){ Math.random=rnd; return M.toWav(r.buf).arrayBuffer(); }).then(function(ab){ files.push({name:String(i).padStart(2,"0")+"-"+c.name.replace(/[^\w]+/g,"-")+".wav",data:new Uint8Array(ab)}); return next(); });
  }
  return next().catch(function(e){ done(); throw e; });
};
M.extras.push(function(root){
  if(root.querySelector("#amStems")) return;
  var d=document.createElement("div"); d.id="amStems"; d.className="amm"; d.style.cssText="padding:0;border-top:1px solid var(--line,#3a3f4b);padding-top:8px";
  d.innerHTML='<h3>Export stems</h3><div class="row tr"><span class="lab">Length</span>'+[1,2,4,8].map(function(n){ return '<button data-b="'+n+'" class="'+(n===bars?"on":"")+'">'+n+' bar'+(n>1?"s":"")+'</button>'; }).join("")+'</div><div class="row"><button id="amStemSave" class="on" style="flex:1">Save stems (.zip)</button></div><div class="hint" id="amStemSt" aria-live="polite">One WAV per drum row and keys.</div>';
  var anchor=root.querySelector("#amMidi")||root.querySelector("#amBounce"); if(anchor) root.insertBefore(d,anchor); else root.appendChild(d);
  d.querySelectorAll("button[data-b]").forEach(function(b){ b.onclick=function(){ bars=+b.dataset.b; d.querySelectorAll("button[data-b]").forEach(function(x){ x.classList.toggle("on",x===b); }); }; });
  var st=d.querySelector("#amStemSt"), btn=d.querySelector("#amStemSave");
  btn.onclick=function(){
    if(busy) return; if(!channels().length){ st.textContent="Add some steps or notes first"; return; }
    busy=true; btn.disabled=true;
    M.renderStems(bars,function(i,n,name){ st.textContent="Rendering "+i+"/"+n+": "+name+"…"; }).then(function(files){
      var blob=zip(files), a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="amiyo-stems-"+S.bpm+"bpm.zip"; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },1500);
      st.textContent="Saved "+files.length+" stems"; 
    }).catch(function(e){ st.textContent="Could not render stems"; try{ window.amiyoReportError&&window.amiyoReportError("Stems could not be rendered",e); }catch(x){} }).then(function(){ busy=false; btn.disabled=false; });
  };
});
if(document.getElementById("amMusicRoot")){ try{ M.extras[M.extras.length-1](document.getElementById("amMusicRoot")); }catch(e){} }
})();

;
/* ==================== Script 902 id="amiyo-v118-touch-dock" ==================== */
/* v118 Step 1: LumaFusion-style scrollable touch dock above the bottom bar. Big 54x48 targets, one-tap Undo/Redo/Duplicate/Marker/Snap/Zoom/Fit. Reuses the existing buttons so behaviour stays identical. */
(function(){
  try{
    var bar=document.getElementById("mbar"); if(!bar||document.getElementById("amDock")) return;
    var dock=document.createElement("div"); dock.id="amDock"; dock.className="am-dock"; dock.setAttribute("role","toolbar"); dock.setAttribute("aria-label","Quick edit tools");
    function click(id){ var b=document.getElementById(id); if(b&&!b.disabled){ b.click(); return true; } return false; }
    function zoom(f){ var z=document.getElementById("timelineZoom"); if(!z) return; var v=Math.round(Math.min(+z.max,Math.max(+z.min,(+z.value)*f))); z.value=v; z.dispatchEvent(new Event("input",{bubbles:true})); z.dispatchEvent(new Event("change",{bubbles:true})); }
    var items=[
      ["↶","Undo",function(){click("undoBtn");}],
      ["↷","Redo",function(){click("redoBtn");}],
      ["⧉","Duplicate",function(){ if(!click("duplicateBtn")) try{ if(typeof toast==="function") toast("Select a clip first"); }catch(e){} }],
      ["⚑","Marker",function(){ if(!click("proMarker")) try{ toast("Marker button not available"); }catch(e){} }],
      ["🧲","Snap",function(){ click("snapToggle"); }],
      ["⌫","Ripple Del",function(){ click("rippleDeleteBtn"); }],
      ["➖","Zoom −",function(){ zoom(0.7); }],
      ["➕","Zoom +",function(){ zoom(1.4); }],
      ["⤢","Fit",function(){ click("fitTimelineBtn"); }]
    ];
    items.forEach(function(it){
      var b=document.createElement("button"); b.type="button"; b.innerHTML="<i>"+it[0]+"</i>"+it[1]; b.setAttribute("aria-label",it[1]);
      b.addEventListener("click",function(){ try{ it[2](); if(navigator.vibrate) navigator.vibrate(8); }catch(e){} });
      if(it[1]==="Snap"){ b.setAttribute("aria-pressed","false"); b.addEventListener("click",function(){ var s=document.getElementById("snapToggle"); b.setAttribute("aria-pressed",String(!!(s&&(s.classList.contains("tool-active")||s.classList.contains("on")||s.getAttribute("aria-pressed")==="true")))); }); }
      dock.appendChild(b);
    });
    bar.parentNode.insertBefore(dock,bar);
  }catch(e){ try{ console.warn("dock",e); }catch(x){} }
})();

;
/* ==================== Script 903 id="amiyo-v119-transport" ==================== */
/* v119 Step 2: FL Studio Mobile-style floating transport on the preview: to-start, frame back, big play/pause, frame forward, to-end + live timecode. The cramped 9-button desktop preview toolbar is hidden on phones/tablets (it is still in the DOM, so every existing shortcut keeps working). */
(function(){
  try{
    var pw=document.querySelector(".preview-wrap"); if(!pw||document.getElementById("amtTp")) return;
    var tp=document.createElement("div"); tp.id="amtTp"; tp.className="am-tp"; tp.setAttribute("role","group"); tp.setAttribute("aria-label","Transport");
    function click(id){ var b=document.getElementById(id); if(b) b.click(); }
    function mk(txt,label,fn,cls){ var b=document.createElement("button"); b.type="button"; b.textContent=txt; b.setAttribute("aria-label",label); if(cls) b.className=cls; b.addEventListener("click",function(){ try{fn();}catch(e){} try{ if(navigator.vibrate) navigator.vibrate(6);}catch(x){} }); return b; }
    var play=mk("▶","Play / Pause",function(){ click("playBtn"); },"am-big");
    var tc=document.createElement("span"); tc.className="am-tc"; tc.setAttribute("aria-hidden","true"); tc.textContent="00:00.000";
    tp.appendChild(mk("⏮","Go to start",function(){ if(typeof setCurrentTime==="function") setCurrentTime(0); }));
    tp.appendChild(mk("◀","Previous frame",function(){ click("prevFrameBtn"); }));
    tp.appendChild(play);
    tp.appendChild(mk("▶","Next frame",function(){ click("nextFrameBtn"); }));
    tp.appendChild(mk("⏭","Go to end",function(){ if(typeof setCurrentTime==="function"&&typeof getProjectDuration==="function") setCurrentTime(Math.max(0,getProjectDuration()-0.04)); }));
    tp.appendChild(tc);
    pw.appendChild(tp);
    var last="";
    function sync(){
      var r=document.getElementById("timeReadout"), pb=document.getElementById("playBtn");
      var t=r?(r.textContent||"").split("/")[0].trim():""; if(t&&t!==last){ last=t; tc.textContent=t; }
      var pl=pb?/Pause|❚/.test(pb.textContent):false; var g=pl?"❚❚":"▶"; if(play.textContent!==g){ play.textContent=g; play.setAttribute("aria-pressed",String(pl)); }
    }
    setInterval(sync,200); sync();
  }catch(e){ try{ console.warn("transport",e); }catch(x){} }
})();

;
/* ==================== Script 904 id="amiyo-v120-jog" ==================== */
/* v120 Step 3: jog / scrub strip (LumaFusion-style). Drag left/right under the preview to move the playhead frame by frame (1 px = 1 frame at 30 fps, flick faster = bigger steps). The ruler marks slide with your finger. Pinch-zoom on the timeline already existed, so this fills the real gap: precise scrubbing on a small screen. */
(function(){
  try{
    var pw=document.querySelector(".preview-wrap"); if(!pw||document.getElementById("amJog")) return;
    var jog=document.createElement("div"); jog.id="amJog"; jog.className="am-jog"; jog.setAttribute("role","slider"); jog.setAttribute("aria-label","Scrub playhead");
    jog.setAttribute("tabindex","0"); var hint=document.createElement("span"); hint.textContent="◀ drag to scrub ▶"; jog.appendChild(hint);
    pw.parentNode.insertBefore(jog,pw.nextSibling);
    var FPS=30, down=false, lastX=0, lastT=0, off=0;
    function dur(){ try{ return getProjectDuration(); }catch(e){ return 30; } }
    function cur(){ try{ return currentTime; }catch(e){ return 0; } }
    function go(t){ try{ setCurrentTime(Math.max(0,Math.min(dur(),t))); }catch(e){} }
    jog.addEventListener("pointerdown",function(e){ down=true; lastX=e.clientX; lastT=e.timeStamp; jog.classList.add("on"); try{ jog.setPointerCapture(e.pointerId); }catch(x){} try{ var pb=document.getElementById("playBtn"); if(pb&&/Pause|❚/.test(pb.textContent)) pb.click(); }catch(x){} e.preventDefault(); });
    jog.addEventListener("pointermove",function(e){
      if(!down) return; var dx=e.clientX-lastX, dt=Math.max(1,e.timeStamp-lastT); var v=Math.abs(dx)/dt; /* px per ms */
      var mult=v>1.2?6:v>0.6?3:1; lastX=e.clientX; lastT=e.timeStamp;
      off=(off+dx)%12; jog.style.backgroundPosition=off+"px 100%,"+off+"px 100%";
      go(cur()+dx*mult/FPS);
      try{ if(navigator.vibrate&&Math.abs(dx)>=10) navigator.vibrate(3); }catch(x){}
    });
    function up(e){ down=false; jog.classList.remove("on"); }
    jog.addEventListener("pointerup",up); jog.addEventListener("pointercancel",up);
    jog.addEventListener("keydown",function(e){ if(e.key==="ArrowRight"){ go(cur()+1/FPS); e.preventDefault(); } else if(e.key==="ArrowLeft"){ go(cur()-1/FPS); e.preventDefault(); } });
  }catch(e){ try{ console.warn("jog",e); }catch(x){} }
})();

;
/* ==================== Script 905 id="amiyo-v121-clip-quickbar" ==================== */
/* v121 Step 4: selected-clip quick bar. Tap a clip and a strip appears above the dock with its Volume and Opacity sliders and a Mute button, so the two most common tweaks no longer need the full Inspector sheet. Each drag is one undo step. */
(function(){
  try{
    var dock=document.getElementById("amDock")||document.getElementById("mbar"); if(!dock||document.getElementById("amCq")) return;
    var q=document.createElement("div"); q.id="amCq"; q.className="am-cq"; q.setAttribute("role","group"); q.setAttribute("aria-label","Selected clip");
    q.innerHTML='<b id="amCqName">Clip</b><label>Volume<input id="amCqVol" type="range" min="0" max="1" step="0.01" aria-label="Clip volume"></label><label id="amCqOpL">Opacity<input id="amCqOp" type="range" min="0" max="1" step="0.01" aria-label="Clip opacity"></label><button type="button" id="amCqMute" aria-label="Mute clip" aria-pressed="false">🔇</button>';
    dock.parentNode.insertBefore(q,dock);
    var vol=q.querySelector("#amCqVol"), op=q.querySelector("#amCqOp"), opL=q.querySelector("#amCqOpL"), mute=q.querySelector("#amCqMute"), nm=q.querySelector("#amCqName");
    var before=null, shown="";
    function sel(){ try{ if(!selectedClipId||!selectedTrackId) return null; return getClipByIds(selectedClipId,selectedTrackId); }catch(e){ return null; } }
    function snap(){ try{ before=deepClone(serializableProject()); }catch(e){ before=null; } }
    function done(label){ try{ if(before&&typeof pushHistory==="function") pushHistory(label,before); before=null; if(typeof scheduleAutosave==="function") scheduleAutosave(); }catch(e){} }
    function apply(fn){ var f=sel(); if(!f) return; try{ fn(f.clip); if(typeof renderPreviewFrame==="function") renderPreviewFrame(); }catch(e){} }
    [[vol,"volume","Change volume"],[op,"opacity","Change opacity"]].forEach(function(a){
      a[0].addEventListener("pointerdown",snap);
      a[0].addEventListener("input",function(){ if(!before) snap(); apply(function(c){ c[a[1]]=+a[0].value; }); });
      a[0].addEventListener("change",function(){ done(a[2]); try{ renderInspector&&renderInspector(); }catch(e){} });
    });
    mute.addEventListener("click",function(){ var f=sel(); if(!f) return; snap(); var c=f.clip; if(c.amQMuted!=null&&c.amQMuted>=0){ c.volume=c.amQMuted; delete c.amQMuted; } else { c.amQMuted=c.volume??1; c.volume=0; } done("Mute clip"); try{ renderAll(); }catch(e){} sync(true); });
    function sync(force){
      var f=sel(), key=f?f.clip.id+"|"+(f.clip.volume??1)+"|"+(f.clip.opacity??1):"";
      if(!force&&key===shown) return; shown=key;
      if(!f){ q.classList.remove("show"); return; }
      var c=f.clip; q.classList.add("show"); nm.textContent=c.name||c.kind||f.track.kind||"Clip";
      vol.value=c.volume??1; op.value=c.opacity??1;
      var visual=(c.kind||f.track.kind)!=="audio"; opL.style.display=visual?"":"none";
      var m=(c.volume??1)===0; mute.setAttribute("aria-pressed",String(m));
    }
    setInterval(sync,300); sync(true);
  }catch(e){ try{ console.warn("clipquick",e); }catch(x){} }
})();

;
/* ==================== Script 906 id="amiyo-v122-sheet-swipe" ==================== */
/* v122 Step 5: swipe-down-to-close bottom sheets. Drag the grab bar of the Library or Inspector sheet down (or flick it) to dismiss; tap the dimmed area to close too. Short drags spring back. Uses the existing close button, so focus and the bottom-bar highlight stay correct. */
(function(){
  try{
    var app=document.querySelector(".app"); if(!app) return;
    if(!document.getElementById("amScrim")){ var s=document.createElement("div"); s.id="amScrim"; s.className="am-scrim"; s.addEventListener("click",function(){ try{ if(typeof closeSheets==="function") closeSheets(); else app.classList.remove("sheet-lib","sheet-insp"); }catch(e){} }); app.parentNode.insertBefore(s,app.nextSibling); }
    var sheet=null, y0=0, t0=0, dy=0, active=false;
    document.addEventListener("pointerdown",function(e){
      var h=e.target.closest&&e.target.closest(".sheet-head"); if(!h||e.target.closest(".sheet-close")) return;
      sheet=h.parentNode; if(!sheet||!(app.classList.contains("sheet-lib")||app.classList.contains("sheet-insp"))) return;
      active=true; y0=e.clientY; t0=e.timeStamp; dy=0; sheet.classList.add("am-dragging"); try{ h.setPointerCapture(e.pointerId); }catch(x){}
    },true);
    document.addEventListener("pointermove",function(e){
      if(!active||!sheet) return; dy=Math.max(0,e.clientY-y0); sheet.style.transform="translateY("+dy+"px)";
    },true);
    function end(e){
      if(!active||!sheet) return; active=false; var el=sheet, v=dy/Math.max(1,e.timeStamp-t0); sheet=null;
      el.classList.remove("am-dragging"); el.style.transform="";
      if(dy>90||(dy>30&&v>0.6)){ try{ var c=el.querySelector(".sheet-close"); if(c) c.click(); else if(typeof closeSheets==="function") closeSheets(); }catch(x){} try{ if(navigator.vibrate) navigator.vibrate(8); }catch(x){} }
    }
    document.addEventListener("pointerup",end,true); document.addEventListener("pointercancel",end,true);
  }catch(e){ try{ console.warn("sheetswipe",e); }catch(x){} }
})();

;
/* ==================== Script 907 id="amiyo-v123-trim-feedback" ==================== */
/* v123 Step 6: trim feedback. Trim handles were already thumb-sized, so this adds what was missing: a floating readout above your finger while you trim (clip length + in-point), a highlight on the clip, a soft tick every ~12 px of movement and a stronger buzz when you let go. */
(function(){
  try{
    var tip=document.createElement("div"); tip.className="am-trimtip"; tip.setAttribute("aria-hidden","true"); document.body.appendChild(tip);
    var clipEl=null, lastBuzzX=0, startX=0, moved=false;
    function fmt(s){ s=Math.max(0,s||0); var m=Math.floor(s/60), r=s-m*60; return (m?m+"m ":"")+r.toFixed(2)+"s"; }
    function vib(n){ try{ if(navigator.vibrate) navigator.vibrate(n); }catch(e){} }
    function info(){
      if(!clipEl) return; var id=clipEl.getAttribute("data-clip"), tr=clipEl.getAttribute("data-track"); var f=null;
      try{ f=getClipByIds(id,tr); }catch(e){} if(!f) return; var c=f.clip;
      tip.innerHTML=fmt(c.duration)+"<small>in "+fmt(c.inPoint||0)+" · starts "+fmt(c.start)+"</small>";
    }
    document.addEventListener("pointerdown",function(e){
      var h=e.target.closest&&e.target.closest(".clip .handle"); if(!h) return;
      clipEl=h.closest(".clip"); clipEl.classList.add("am-trimming"); startX=lastBuzzX=e.clientX; moved=false; vib(12);
      tip.style.display="block"; tip.style.left=e.clientX+"px"; tip.style.top=e.clientY+"px"; info();
    },true);
    document.addEventListener("pointermove",function(e){
      if(!clipEl) return; tip.style.left=e.clientX+"px"; tip.style.top=e.clientY+"px"; info();
      if(Math.abs(e.clientX-lastBuzzX)>=12){ lastBuzzX=e.clientX; moved=true; vib(3); }
    },true);
    function end(){
      if(!clipEl) return; var el=clipEl; clipEl=null; tip.style.display="none";
      setTimeout(function(){ try{ el.classList.remove("am-trimming"); }catch(e){} },150);
      if(moved) vib([10,30,10]);
    }
    document.addEventListener("pointerup",end,true); document.addEventListener("pointercancel",end,true);
  }catch(e){ try{ console.warn("trimfb",e); }catch(x){} }
})();

;
/* ==================== Script 908 id="amiyo-v124-speed-sheet" ==================== */
/* v124 Step 7: speed bar. A new Speed button in the dock opens a strip of one-tap rates (0.25x to 4x, plus a slow-mo / fast preset feel) and a Reverse button for the selected clip. It changes the clip length the same way the Inspector's "ripple" speed does, and is a single undo step. */
(function(){
  try{
    var dock=document.getElementById("amDock"); if(!dock||document.getElementById("amSpd")) return;
    var bar=document.createElement("div"); bar.id="amSpd"; bar.className="am-spd"; bar.setAttribute("role","group"); bar.setAttribute("aria-label","Clip speed");
    var rates=[0.25,0.5,0.75,1,1.5,2,4], btns=[];
    var lab=document.createElement("b"); lab.textContent="Speed"; bar.appendChild(lab);
    function sel(){ try{ if(!selectedClipId||!selectedTrackId) return null; return getClipByIds(selectedClipId,selectedTrackId); }catch(e){ return null; } }
    function say(m){ try{ toast(m); }catch(e){} }
    function setRate(r){
      var f=sel(); if(!f){ say("Select a clip first"); return; } var c=f.clip;
      if(c.kind==="text"||c.kind==="adjustment"||f.track.kind==="text"){ say("Speed works on video and audio clips"); return; }
      try{
        window.transact("Change speed",function(){
          var srcLen=((c.outPoint!=null?c.outPoint:c.duration)-(c.inPoint||0)); if(!(srcLen>0)) srcLen=c.duration*(c.speed||1);
          c.speed=r; c.duration=Math.max(0.05,srcLen/r); c.outPoint=(c.inPoint||0)+srcLen;
        });
        renderAll(); say("Speed "+r+"x"); try{ if(navigator.vibrate) navigator.vibrate(8); }catch(e){}
      }catch(e){ say("Could not change speed"); }
      mark();
    }
    rates.forEach(function(r){ var b=document.createElement("button"); b.type="button"; b.textContent=r+"×"; b.dataset.r=r; b.setAttribute("aria-label","Speed "+r+" times"); b.addEventListener("click",function(){ setRate(r); }); bar.appendChild(b); btns.push(b); });
    var rv=document.createElement("button"); rv.type="button"; rv.className="rev"; rv.textContent="⏪ Reverse"; rv.addEventListener("click",function(){
      if(!sel()){ say("Select a clip first"); return; }
      try{ if(window.amiyoX&&typeof window.amiyoX.reverseClip==="function") window.amiyoX.reverseClip(); else say("Use the clip menu → Reverse"); }catch(e){ say("Reverse failed"); }
    }); bar.appendChild(rv);
    function mark(){ var f=sel(), s=f?(f.clip.speed||1):0; btns.forEach(function(b){ b.classList.toggle("on",Math.abs(+b.dataset.r-s)<0.001); }); }
    dock.parentNode.insertBefore(bar,dock);
    var tb=document.createElement("button"); tb.type="button"; tb.innerHTML="<i>⏱</i>Speed"; tb.setAttribute("aria-label","Speed"); tb.setAttribute("aria-pressed","false");
    tb.addEventListener("click",function(){ var on=!bar.classList.contains("show"); bar.classList.toggle("show",on); tb.setAttribute("aria-pressed",String(on)); mark(); });
    dock.insertBefore(tb,dock.children[3]||null);
    setInterval(function(){ if(bar.classList.contains("show")) mark(); },400);
  }catch(e){ try{ console.warn("speed",e); }catch(x){} }
})();

;
/* ==================== Script 909 id="amiyo-v125-mixer-sheet" ==================== */
/* v125 Step 8: touch mixer (FL Studio Mobile style). Dock -> Mixer opens a sheet with one channel strip per audio track: tall volume fader, pan, Mute and Solo. Uses the same track.volume / pan / muted / solo values the editor already plays back, so changes are heard immediately and each gesture is one undo step. */
(function(){
  try{
    var dock=document.getElementById("amDock"); if(!dock||document.getElementById("amMix")) return;
    var sh=document.createElement("section"); sh.id="amMix"; sh.className="am-mix"; sh.setAttribute("role","dialog"); sh.setAttribute("aria-label","Mixer");
    sh.innerHTML='<header><span>🎚 Mixer</span><button type="button" id="amMixX">Done</button></header><div class="strips" id="amStrips"></div>';
    document.body.appendChild(sh);
    var st=sh.querySelector("#amStrips"), before=null;
    function snap(){ try{ before=deepClone(serializableProject()); }catch(e){ before=null; } }
    function done(l){ try{ if(before&&typeof pushHistory==="function") pushHistory(l,before); before=null; scheduleAutosave(); }catch(e){} }
    function tr(id){ return (project.tracks||[]).filter(function(t){ return t.id===id; })[0]; }
    function db(v){ return v<=0.001?"-∞":(20*Math.log10(v)).toFixed(1)+" dB"; }
    function build(){
      var tracks=(project.tracks||[]).filter(function(t){ return t.kind==="audio"; }), any=tracks.some(function(t){ return t.solo; });
      st.innerHTML=""; if(!tracks.length){ st.innerHTML='<div class="empty">No audio tracks yet. Add music or a voice-over and its channel appears here.</div>'; return; }
      tracks.forEach(function(t){
        t.volume=t.volume==null?1:t.volume; t.pan=t.pan||0;
        var d=document.createElement("div"); d.className="am-strip"+(any&&!t.solo?" dim":""); d.dataset.id=t.id;
        d.innerHTML='<div class="lv">'+db(t.volume)+'</div><input class="vf" type="range" min="0" max="1.5" step="0.01" aria-label="'+(t.name||"Track")+' volume"><input class="pn" type="range" min="-1" max="1" step="0.05" aria-label="'+(t.name||"Track")+' pan"><div class="ms"><button type="button" class="m'+(t.muted?" on":"")+'" aria-label="Mute">M</button><button type="button" class="s'+(t.solo?" on":"")+'" aria-label="Solo">S</button></div><div class="nm">'+String(t.name||"Audio").replace(/</g,"&lt;")+'</div>';
        var vf=d.querySelector(".vf"), pn=d.querySelector(".pn"), lv=d.querySelector(".lv"); vf.value=t.volume; pn.value=t.pan;
        vf.addEventListener("pointerdown",snap); pn.addEventListener("pointerdown",snap);
        vf.addEventListener("input",function(){ if(!before) snap(); var x=tr(t.id); if(x){ x.volume=+vf.value; lv.textContent=db(x.volume); } });
        pn.addEventListener("input",function(){ if(!before) snap(); var x=tr(t.id); if(x) x.pan=+pn.value; });
        vf.addEventListener("change",function(){ done("Mixer volume"); }); pn.addEventListener("change",function(){ done("Mixer pan"); });
        d.querySelector(".m").addEventListener("click",function(){ window.transact("Mute track",function(){ var x=tr(t.id); if(x) x.muted=!x.muted; }); try{ renderAll(); }catch(e){} build(); try{ navigator.vibrate&&navigator.vibrate(8); }catch(e){} });
        d.querySelector(".s").addEventListener("click",function(){ window.transact("Solo track",function(){ var x=tr(t.id); if(x) x.solo=!x.solo; }); try{ renderAll(); }catch(e){} build(); try{ navigator.vibrate&&navigator.vibrate(8); }catch(e){} });
        st.appendChild(d);
      });
    }
    function open(on){ sh.classList.toggle("show",on); if(on) build(); }
    sh.querySelector("#amMixX").addEventListener("click",function(){ open(false); });
    var b=document.createElement("button"); b.type="button"; b.innerHTML="<i>🎚</i>Mixer"; b.setAttribute("aria-label","Mixer");
    b.addEventListener("click",function(){ open(!sh.classList.contains("show")); }); dock.insertBefore(b,dock.children[4]||null);
    window.amiyoMixer={open:function(){ open(true); },close:function(){ open(false); }};
  }catch(e){ try{ console.warn("mixer",e); }catch(x){} }
})();

;
/* ==================== Script 910 id="amiyo-v126-more-sheet" ==================== */
/* v126 Step 9: "More" tool sheet. Your editor already has pro tools (auto-duck, beat markers, music sync, reverse, detach audio, zoom/play clip, clip notes) but they hide in menus and a command palette. This puts them in one thumb-reachable grid. Each tile calls the existing feature and shows a clear message if it is not available. Other steps add tiles through window.amiyoMore.add(group, icon, label, fn). */
(function(){
  try{
    var dock=document.getElementById("amDock"); if(!dock||document.getElementById("amMore")) return;
    var sh=document.createElement("section"); sh.id="amMore"; sh.className="am-more"; sh.setAttribute("role","dialog"); sh.setAttribute("aria-label","More tools");
    sh.innerHTML='<header><span>✨ More tools</span><button type="button" id="amMoreX">Done</button></header><div class="grid" id="amMoreGrid"></div>';
    document.body.appendChild(sh); var grid=sh.querySelector("#amMoreGrid"), groups={}, order=[];
    function say(m){ try{ toast(m); }catch(e){} }
    function open(on){ sh.classList.toggle("show",on); }
    function add(group,icon,label,fn,opts){
      if(!groups[group]){ var h=document.createElement("h4"); h.textContent=group; grid.appendChild(h); groups[group]=h; order.push(group); }
      var b=document.createElement("button"); b.type="button"; b.innerHTML="<i>"+icon+"</i>"+label; b.setAttribute("aria-label",label);
      b.addEventListener("click",function(){ try{ if(!opts||!opts.stay) open(false); try{ navigator.vibrate&&navigator.vibrate(8); }catch(e){} fn(b); }catch(e){ say(label+" is not available here"); } });
      var h=groups[group], n=h.nextSibling; while(n&&n.tagName!=="H4") n=n.nextSibling; grid.insertBefore(b,n||null); return b;
    }
    function call(path,name){ return function(){ var o=window, p=path.split("."); for(var i=0;i<p.length;i++){ o=o&&o[p[i]]; } if(typeof o==="function"){ var ctx=window[path.split(".")[0]]; o.call(path.indexOf(".")>0?window[p[0]]:null); } else say(name+" is not available in this build"); }; }
    function needClip(){ try{ return !!(selectedClipId&&selectedTrackId); }catch(e){ return false; } }
    add("Audio","🔉","Auto-duck",function(){ if(typeof window.autoDuckUnderDialogue==="function") window.autoDuckUnderDialogue(); else say("Auto-duck not available"); });
    add("Audio","🥁","Beat markers",function(){ if(window.amiyoBeats&&window.amiyoBeats.open) window.amiyoBeats.open(); else say("Beat tool not available"); });
    add("Audio","🎵","Music sync",function(){ if(window.amiyoMusicSync&&window.amiyoMusicSync.open) window.amiyoMusicSync.open(); else say("Music sync not available"); });
    add("Audio","✂️","Detach audio",function(){ if(!needClip()) return say("Select a video clip first"); if(typeof window.amiyoDetachAudio==="function") window.amiyoDetachAudio(); else say("Detach audio not available"); });
    add("Clip","⏪","Reverse",function(){ if(!needClip()) return say("Select a clip first"); if(window.amiyoX&&window.amiyoX.reverseClip) window.amiyoX.reverseClip(); else say("Reverse not available"); });
    add("Clip","⌕","Zoom to clip",function(){ if(!needClip()) return say("Select a clip first"); window.amiyoX.zoomToClip(); });
    add("Clip","▶️","Play clip",function(){ if(!needClip()) return say("Select a clip first"); window.amiyoX.playClip(); });
    add("Clip","📝","Clip note",function(){ if(!needClip()) return say("Select a clip first"); window.amiyoX.editNote(); });
    add("Project","🗒","All notes",function(){ window.amiyoX.listNotes(); });
    add("Project","🕘","Versions",function(){ var b=document.getElementById("versionsBtn"); if(b) b.click(); });
    add("Project","💾","Storage",function(){ var b=document.getElementById("storageBtn"); if(b) b.click(); });
    add("Project","❓","Help",function(){ var b=document.getElementById("helpBtn"); if(b) b.click(); });
    sh.querySelector("#amMoreX").addEventListener("click",function(){ open(false); });
    var b=document.createElement("button"); b.type="button"; b.innerHTML="<i>✨</i>More"; b.setAttribute("aria-label","More tools"); b.addEventListener("click",function(){ open(!sh.classList.contains("show")); });
    dock.appendChild(b);
    window.amiyoMore={add:add,open:function(){ open(true); },close:function(){ open(false); }};
  }catch(e){ try{ console.warn("more",e); }catch(x){} }
})();

;
/* ==================== Script 911 id="amiyo-v127-format-bar" ==================== */
/* v127 Step 10: format quick-switch. Dock -> Format shows four big buttons (YouTube 16:9, Reels/TikTok 9:16, Square 1:1, Feed 4:5) with a shape preview. It drives the editor's own picture-shape control, so size, undo and autosave behave exactly as before. The active format is highlighted and the dock button shows it. */
(function(){
  try{
    var dock=document.getElementById("amDock"); if(!dock||document.getElementById("amFmt")) return;
    var bar=document.createElement("div"); bar.id="amFmt"; bar.className="am-fmt"; bar.setAttribute("role","group"); bar.setAttribute("aria-label","Video format");
    var F=[["16:9","YouTube",20,11],["9:16","Reels · TikTok",11,20],["1:1","Square",16,16],["4:5","Feed",14,17]], btns={};
    bar.innerHTML="<b>Format</b>";
    F.forEach(function(f){
      var b=document.createElement("button"); b.type="button"; b.dataset.v=f[0]; b.setAttribute("aria-label",f[1]+" "+f[0]);
      b.innerHTML='<span class="sh" style="width:'+f[2]+'px;height:'+f[3]+'px"></span><span>'+f[0]+'<small>'+f[1]+'</small></span>';
      b.addEventListener("click",function(){ var s=document.getElementById("aspectSel"); if(!s){ try{ toast("Format control not available"); }catch(e){} return; } s.value=f[0]; s.dispatchEvent(new Event("change",{bubbles:true})); try{ navigator.vibrate&&navigator.vibrate(8); }catch(e){} setTimeout(mark,60); });
      bar.appendChild(b); btns[f[0]]=b;
    });
    dock.parentNode.insertBefore(bar,dock);
    var tb=document.createElement("button"); tb.type="button"; tb.setAttribute("aria-label","Video format"); tb.innerHTML="<i>▭</i><span>16:9</span>"; var lab=tb.querySelector("span");
    tb.addEventListener("click",function(){ var on=!bar.classList.contains("show"); bar.classList.toggle("show",on); tb.setAttribute("aria-pressed",String(on)); mark(); });
    dock.insertBefore(tb,dock.children[3]||null);
    function mark(){ var s=document.getElementById("aspectSel"), v=s?s.value:""; Object.keys(btns).forEach(function(k){ btns[k].classList.toggle("on",k===v); }); if(v&&v!=="custom") lab.textContent=v; else if(v==="custom") lab.textContent="Custom"; }
    setInterval(mark,800); mark();
    if(window.amiyoMore){ F.forEach(function(f){ window.amiyoMore.add("Format","▭",f[0]+" "+f[1],function(){ var s=document.getElementById("aspectSel"); if(s){ s.value=f[0]; s.dispatchEvent(new Event("change",{bubbles:true})); } }); }); }
  }catch(e){ try{ console.warn("format",e); }catch(x){} }
})();

;
/* ==================== Script 912 id="amiyo-v128-drum-pads" ==================== */
/* v128 Step 11: drum pad performance mode (FL Studio Mobile style). Eight big pads play your drum kit live; hit near the top of a pad for a loud hit and near the bottom for soft. Tap Tempo sets the BPM. Press Rec to get a one-bar count loop with a click: whatever you play is quantised to 16th notes and written into the Music Studio step grid, which you can then edit or bounce as usual. */
(function(){
  try{
    var dock=document.getElementById("amDock"); if(!dock||document.getElementById("amtPads")) return;
    var sh=document.createElement("section"); sh.id="amtPads"; sh.className="am-pads"; sh.setAttribute("role","dialog"); sh.setAttribute("aria-label","Drum pads");
    sh.innerHTML='<header><span>🥁 Pads</span><span class="sp"></span><button type="button" id="amTap">Tap <span id="amBpmL">100</span></button><button type="button" class="rec" id="amtRec">● Rec</button><button type="button" id="amPadX">Done</button></header><div class="beat" id="amBeat"></div><div class="pg" id="amPg"></div><div class="hint" id="amPadHint">Tip: hit the top of a pad for a hard hit, the bottom for soft.</div>';
    document.body.appendChild(sh);
    var pg=sh.querySelector("#amPg"), beat=sh.querySelector("#amBeat"), hint=sh.querySelector("#amPadHint"), recB=sh.querySelector("#amtRec"), tapB=sh.querySelector("#amTap"), bpmL=sh.querySelector("#amBpmL");
    for(var q=0;q<16;q++){ beat.appendChild(document.createElement("i")); }
    var M=null, pads=[], rec=false, clock=null, t0=0, lastStep=-1, taps=[];
    function mus(){ M=window.amiyoMusic; return M; }
    function aud(){ try{ return mus()&&M.audio?M.audio():null; }catch(e){ return null; } }
    function stepDur(){ return 60/((M&&M.state&&M.state.bpm)||100)/4; }
    function build(){
      if(!mus()||!M.drums){ pg.innerHTML='<div class="hint" style="grid-column:1/-1">Music Studio is not ready yet.</div>'; return; }
      pg.innerHTML=""; pads=[];
      M.drums.slice(0,8).forEach(function(d,ri){
        var p=document.createElement("div"); p.className="am-pad"; p.style.background=d.color||"#ccc"; p.textContent=d.name; p.setAttribute("role","button"); p.setAttribute("aria-label","Pad "+d.name);
        p.addEventListener("pointerdown",function(e){ e.preventDefault(); var r=p.getBoundingClientRect(), v=0.45+0.55*(1-Math.min(1,Math.max(0,(e.clientY-r.top)/r.height))); hit(ri,d.id,v,p); });
        pg.appendChild(p); pads.push(p);
      });
      bpmL.textContent=Math.round(M.state.bpm);
    }
    function hit(ri,id,v,el){
      var a=aud(); if(!a){ try{ toast("Audio is not ready - tap once more"); }catch(e){} return; }
      try{ if(a.ctx.state==="suspended") a.ctx.resume(); M.voice(a.ctx,a.master,id,a.ctx.currentTime+0.001,v); }catch(e){}
      el.classList.add("hit"); setTimeout(function(){ el.classList.remove("hit"); },90); try{ navigator.vibrate&&navigator.vibrate(6); }catch(e){}
      if(rec&&a){ var sd=stepDur(), s=Math.round((a.ctx.currentTime-t0)/sd)%16; if(s<0) s+=16; M.state.rows[ri][s]=v>0.8?2:1; try{ M.repaint&&M.repaint(); }catch(e){} }
    }
    function startClock(){
      var a=aud(); if(!a) return false; try{ a.ctx.resume&&a.ctx.resume(); }catch(e){}
      t0=a.ctx.currentTime+0.1; lastStep=-1;
      clock=setInterval(function(){
        var c=aud(); if(!c) return; var sd=stepDur(), n=(c.ctx.currentTime-t0)/sd; if(n<0) return; var s=Math.floor(n)%16;
        if(s!==lastStep){ lastStep=s; var is=beat.children; for(var i=0;i<16;i++) is[i].classList.toggle("on",i===s);
          if(s%4===0){ try{ var o=c.ctx.createOscillator(), g=c.ctx.createGain(); o.frequency.value=s===0?1500:1000; g.gain.setValueAtTime(0.0001,c.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.25,c.ctx.currentTime+0.004); g.gain.exponentialRampToValueAtTime(0.0001,c.ctx.currentTime+0.05); o.connect(g); g.connect(c.master); o.start(); o.stop(c.ctx.currentTime+0.06); }catch(e){} } }
      },15);
      return true;
    }
    function stopClock(){ if(clock){ clearInterval(clock); clock=null; } for(var i=0;i<beat.children.length;i++) beat.children[i].classList.remove("on"); }
    recB.addEventListener("click",function(){
      rec=!rec; recB.classList.toggle("on",rec);
      if(rec){ if(!startClock()){ rec=false; recB.classList.remove("on"); try{ toast("Audio is not ready yet"); }catch(e){} return; } hint.textContent="Recording - play along with the click. Tap Rec again to stop."; }
      else { stopClock(); try{ M.save&&M.save(); M.repaint&&M.repaint(); }catch(e){} hint.textContent="Saved into the Music Studio step grid."; }
    });
    tapB.addEventListener("click",function(){
      var n=performance.now(); if(taps.length&&n-taps[taps.length-1]>2000) taps=[]; taps.push(n); if(taps.length>6) taps.shift();
      if(taps.length>=2){ var sum=0; for(var i=1;i<taps.length;i++) sum+=taps[i]-taps[i-1]; var bpm=Math.max(40,Math.min(240,Math.round(60000/(sum/(taps.length-1))))); if(mus()){ M.state.bpm=bpm; bpmL.textContent=bpm; try{ M.save&&M.save(); var bv=document.getElementById("amBpmV"), bi=document.getElementById("amBpm"); if(bv) bv.textContent=bpm; if(bi) bi.value=bpm; }catch(e){} } }
      try{ navigator.vibrate&&navigator.vibrate(6); }catch(e){}
    });
    function open(on){ sh.classList.toggle("show",on); if(on) build(); else { if(rec){ rec=false; recB.classList.remove("on"); try{ M.save&&M.save(); }catch(e){} } stopClock(); } }
    sh.querySelector("#amPadX").addEventListener("click",function(){ open(false); });
    var b=document.createElement("button"); b.type="button"; b.innerHTML="<i>🥁</i>Pads"; b.setAttribute("aria-label","Drum pads"); b.addEventListener("click",function(){ open(!sh.classList.contains("show")); });
    dock.insertBefore(b,dock.children[5]||null);
    window.amiyoPads={open:function(){ open(true); },close:function(){ open(false); }};
  }catch(e){ try{ console.warn("pads",e); }catch(x){} }
})();

;
/* ==================== Script 913 id="amiyo-v129-touch-keys" ==================== */
/* v129 Step 12: two-octave touch keyboard. Plays the Music Studio's selected instrument live (same sound as the piano roll), multi-touch so you can play chords, with Oct -/+ and a wave/instrument cycle button. Notes are played through the editor's own audio engine, so Music Studio changes apply here too. */
(function(){
  try{
    var dock=document.getElementById("amDock"); if(!dock||document.getElementById("amKeys")) return;
    var sh=document.createElement("section"); sh.id="amKeys"; sh.className="am-keys"; sh.setAttribute("role","dialog"); sh.setAttribute("aria-label","Keyboard");
    sh.innerHTML='<header><span>🎹 Keys</span><span class="sp"></span><button type="button" id="amOctD" aria-label="Octave down">Oct −</button><span class="oct" id="amOctL">C3</span><button type="button" id="amOctU" aria-label="Octave up">Oct +</button><button type="button" id="amWave" aria-label="Sound">Wave</button><button type="button" id="amKeysX">Done</button></header><div class="am-kb" id="amtKb"></div>';
    document.body.appendChild(sh);
    var kb=sh.querySelector("#amtKb"), octL=sh.querySelector("#amOctL"), waveB=sh.querySelector("#amWave");
    var base=48, WAVES=["sawtooth","square","triangle","sine"], wi=0, held={};
    var BLACK={1:1,3:1,6:1,8:1,10:1}, NN=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
    function M(){ return window.amiyoMusic; }
    function aud(){ try{ return M()&&M().audio?M().audio():null; }catch(e){ return null; } }
    function build(){
      kb.innerHTML=""; var NW=14, wW=100/NW, wi2=0; /* 2 octaves = 14 white keys */
      var lo=base, hi=base+24;
      for(var p=lo;p<hi;p++){ var n=p%12; if(BLACK[n]) continue; var k=document.createElement("div"); k.className="am-k w"; k.style.left=(wi2*wW)+"%"; k.style.width=wW+"%"; k.dataset.p=p; if(n===0) k.textContent="C"+(Math.floor(p/12)-1); kb.appendChild(k); wi2++; }
      wi2=0; for(var p2=lo;p2<hi;p2++){ var n2=p2%12; if(BLACK[n2]){ var b=document.createElement("div"); b.className="am-k b"; b.style.width=(wW*0.6)+"%"; b.style.left=(wi2*wW-wW*0.3)+"%"; b.dataset.p=p2; kb.appendChild(b); } else wi2++; }
      octL.textContent=NN[0]+(Math.floor(base/12)-1);
    }
    function play(p,vel,el){
      var a=aud(); if(!a){ try{ toast("Audio is not ready - tap again"); }catch(e){} return; }
      try{ if(a.ctx.state==="suspended") a.ctx.resume(); var m=M(), t=a.ctx.currentTime+0.002; if(m.playRoll) m.playRoll(a.ctx,a.master,t,0.55,p,0.8); else m.note(a.ctx,a.master,t,0.55,p,0.8,WAVES[wi]); }catch(e){}
      if(el) el.classList.add("down"); try{ navigator.vibrate&&navigator.vibrate(5); }catch(e){}
    }
    function keyAt(x,y){ var el=document.elementFromPoint(x,y); return el&&el.classList&&el.classList.contains("am-k")?el:null; }
    kb.addEventListener("pointerdown",function(e){ var k=keyAt(e.clientX,e.clientY); if(!k) return; e.preventDefault(); try{ kb.setPointerCapture(e.pointerId); }catch(x){} held[e.pointerId]=k; play(+k.dataset.p,1,k); });
    kb.addEventListener("pointermove",function(e){ var cur=held[e.pointerId]; if(!cur) return; var k=keyAt(e.clientX,e.clientY); if(k&&k!==cur){ cur.classList.remove("down"); held[e.pointerId]=k; play(+k.dataset.p,1,k); } });
    function up(e){ var k=held[e.pointerId]; if(k){ k.classList.remove("down"); delete held[e.pointerId]; } }
    kb.addEventListener("pointerup",up); kb.addEventListener("pointercancel",up);
    sh.querySelector("#amOctD").addEventListener("click",function(){ base=Math.max(24,base-12); build(); });
    sh.querySelector("#amOctU").addEventListener("click",function(){ base=Math.min(84,base+12); build(); });
    waveB.addEventListener("click",function(){ var m=M(); if(m&&m.roll&&m.roll.inst!==undefined&&m.instNote){ /* cycle the Music Studio instrument if list is exposed */ } wi=(wi+1)%WAVES.length; try{ if(m&&m.roll) m.roll.wave=WAVES[wi]; }catch(e){} waveB.textContent=WAVES[wi].slice(0,4); });
    waveB.textContent="saw";
    function open(on){ sh.classList.toggle("show",on); if(on) build(); }
    sh.querySelector("#amKeysX").addEventListener("click",function(){ open(false); });
    var b=document.createElement("button"); b.type="button"; b.innerHTML="<i>🎹</i>Keys"; b.setAttribute("aria-label","Keyboard"); b.addEventListener("click",function(){ open(!sh.classList.contains("show")); });
    dock.insertBefore(b,dock.children[6]||null);
    window.amiyoTouchKeys={open:function(){ open(true); },close:function(){ open(false); }};
  }catch(e){ try{ console.warn("keys",e); }catch(x){} }
})();

;
/* ==================== Script 914 id="amiyo-v130-keyframe-bar" ==================== */
/* v130 Step 13: keyframe bar. Dock -> Key opens Prev / Add-or-Remove / Next buttons for the selected clip. The middle button adds a position-scale-opacity keyframe at the playhead (or removes the one already there), the arrows jump the playhead between keyframes, and clips that carry keyframes show a small diamond on the timeline. Uses the editor's own keyframe list, so the Inspector and playback see the same data. */
(function(){
  try{
    var dock=document.getElementById("amDock"); if(!dock||document.getElementById("amKf")) return;
    var bar=document.createElement("div"); bar.id="amKf"; bar.className="am-kf"; bar.setAttribute("role","group"); bar.setAttribute("aria-label","Keyframes");
    bar.innerHTML='<button type="button" id="amKfP" aria-label="Previous keyframe">◀ Prev</button><button type="button" class="main" id="amKfA" aria-label="Add keyframe">◆ Add</button><button type="button" id="amKfN" aria-label="Next keyframe">Next ▶</button><span class="cnt" id="amKfC">0 keys</span>';
    dock.parentNode.insertBefore(bar,dock);
    var P=bar.querySelector("#amKfP"), A=bar.querySelector("#amKfA"), N=bar.querySelector("#amKfN"), C=bar.querySelector("#amKfC");
    function say(m){ try{ toast(m); }catch(e){} }
    function sel(){ try{ if(!selectedClipId||!selectedTrackId) return null; return getClipByIds(selectedClipId,selectedTrackId); }catch(e){ return null; } }
    function rel(f){ return currentTime-f.clip.start; }
    function near(f){ var r=rel(f), ks=f.clip.keyframes||[]; for(var i=0;i<ks.length;i++){ if(Math.abs(ks[i].t-r)<0.05) return i; } return -1; }
    function go(t){ try{ setCurrentTime(t); }catch(e){} }
    A.addEventListener("click",function(){
      var f=sel(); if(!f) return say("Select a clip first");
      var r=rel(f); if(r<0||r>f.clip.duration) return say("Move the playhead inside the clip");
      var i=near(f);
      if(i>=0){ window.transact("Remove keyframe",function(){ f.clip.keyframes.splice(i,1); }); try{ renderAll(); }catch(e){} say("Keyframe removed"); }
      else { try{ addKeyframe(); say("Keyframe added"); }catch(e){ say("Could not add keyframe"); } }
      try{ navigator.vibrate&&navigator.vibrate(10); }catch(e){} refresh();
    });
    function jump(dir){
      var f=sel(); if(!f) return say("Select a clip first"); var ks=(f.clip.keyframes||[]).map(function(k){ return f.clip.start+k.t; }).sort(function(a,b){ return a-b; }), t=currentTime, hit=null;
      if(dir>0){ for(var i=0;i<ks.length;i++){ if(ks[i]>t+0.02){ hit=ks[i]; break; } } } else { for(var j=ks.length-1;j>=0;j--){ if(ks[j]<t-0.02){ hit=ks[j]; break; } } }
      if(hit==null) return say(dir>0?"No later keyframe":"No earlier keyframe"); go(hit); refresh();
    }
    P.addEventListener("click",function(){ jump(-1); }); N.addEventListener("click",function(){ jump(1); });
    function refresh(){
      var f=sel(); if(!f){ C.textContent="no clip"; A.textContent="◆ Add"; A.classList.remove("has"); return; }
      var n=(f.clip.keyframes||[]).length; C.textContent=n+(n===1?" key":" keys"); var h=near(f)>=0; A.textContent=h?"✕ Remove":"◆ Add"; A.classList.toggle("has",h);
    }
    function badge(){ try{ var m={}; project.tracks.forEach(function(t){ t.clips.forEach(function(c){ if(c.keyframes&&c.keyframes.length) m[c.id]=1; }); }); document.querySelectorAll("#tracks .clip[data-clip]").forEach(function(el){ el.classList.toggle("am-haskf",!!m[el.getAttribute("data-clip")]); }); }catch(e){} }
    var tb=document.createElement("button"); tb.type="button"; tb.innerHTML="<i>◆</i>Key"; tb.setAttribute("aria-label","Keyframes"); tb.setAttribute("aria-pressed","false");
    tb.addEventListener("click",function(){ var on=!bar.classList.contains("show"); bar.classList.toggle("show",on); tb.setAttribute("aria-pressed",String(on)); refresh(); });
    dock.insertBefore(tb,dock.children[3]||null);
    setInterval(function(){ if(bar.classList.contains("show")) refresh(); badge(); },500);
  }catch(e){ try{ console.warn("kfbar",e); }catch(x){} }
})();

;
/* ==================== Script 915 id="amiyo-v131-gestures" ==================== */
/* v131 Step 14: shortcut gestures on the preview. Double-tap = play / pause. Two-finger tap = undo. Three-finger tap = redo. A tap counts only if it is short and the finger barely moves, so dragging a clip or pinching is never mistaken for a gesture. Turn them off from More -> Gestures (remembered). */
(function(){
  try{
    var stage=document.querySelector(".preview-stage")||document.getElementById("canvasShell"); if(!stage||window.__amGest) return; window.__amGest=1;
    var KEY="amiyoGestures", on=true; try{ on=localStorage.getItem(KEY)!=="0"; }catch(e){}
    var ptr={}, maxN=0, t0=0, moved=false, lastTap=0;
    function click(id){ var b=document.getElementById(id); if(b&&!b.disabled) b.click(); }
    function vib(n){ try{ navigator.vibrate&&navigator.vibrate(n); }catch(e){} }
    function say(m){ try{ toast(m,1200); }catch(e){} }
    stage.addEventListener("pointerdown",function(e){
      if(e.pointerType==="mouse") return;
      if(!Object.keys(ptr).length){ t0=e.timeStamp; moved=false; maxN=0; }
      ptr[e.pointerId]={x:e.clientX,y:e.clientY}; maxN=Math.max(maxN,Object.keys(ptr).length);
    },true);
    stage.addEventListener("pointermove",function(e){ var p=ptr[e.pointerId]; if(p&&(Math.abs(e.clientX-p.x)>10||Math.abs(e.clientY-p.y)>10)) moved=true; },true);
    function end(e){
      if(!ptr[e.pointerId]) return; delete ptr[e.pointerId];
      if(Object.keys(ptr).length) return;
      if(!on||moved||e.type==="pointercancel"||e.timeStamp-t0>260) { if(maxN===1) lastTap=0; return; }
      if(maxN===2){ click("undoBtn"); say("Undo"); vib(12); lastTap=0; }
      else if(maxN>=3){ click("redoBtn"); say("Redo"); vib([8,30,8]); lastTap=0; }
      else if(maxN===1){
        if(e.timeStamp-lastTap<320){ click("playBtn"); vib(10); lastTap=0; } else lastTap=e.timeStamp;
      }
    }
    stage.addEventListener("pointerup",end,true); stage.addEventListener("pointercancel",end,true);
    function reg(){ if(!window.amiyoMore) return false; window.amiyoMore.add("Settings","👆","Gestures: "+(on?"On":"Off"),function(b){ on=!on; try{ localStorage.setItem(KEY,on?"1":"0"); }catch(e){} say("Gestures "+(on?"on":"off")); try{ b.lastChild.textContent="Gestures: "+(on?"On":"Off"); }catch(x){} },{stay:false}); return true; }
    if(!reg()) setTimeout(reg,500);
  }catch(e){ try{ console.warn("gestures",e); }catch(x){} }
})();

;
/* ==================== Script 916 id="amiyo-v132-fullscreen" ==================== */
/* v132 Step 15: fullscreen preview and landscape layout. A button in the preview's corner fills the whole screen with the picture and the transport (tap again, or press Back/Esc, to leave). Works even where the browser blocks native fullscreen, by filling the page instead. In landscape on a phone the dock, transport and scrub strip shrink so the picture and timeline both stay usable. */
(function(){
  try{
    var pw=document.querySelector(".preview-wrap"); if(!pw||document.getElementById("amFs")) return;
    var b=document.createElement("button"); b.type="button"; b.id="amFs"; b.className="am-fsb"; b.setAttribute("aria-label","Fullscreen preview"); b.textContent="⛶"; pw.appendChild(b);
    function isFs(){ return document.body.classList.contains("am-fs"); }
    function set(on){
      document.body.classList.toggle("am-fs",on); b.textContent=on?"✕":"⛶"; b.setAttribute("aria-label",on?"Exit fullscreen":"Fullscreen preview");
      try{ if(on&&document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function(){}); else if(!on&&document.fullscreenElement&&document.exitFullscreen) document.exitFullscreen().catch(function(){}); }catch(e){}
      try{ if(typeof renderPreviewFrame==="function") setTimeout(renderPreviewFrame,80); }catch(e){}
    }
    b.addEventListener("click",function(){ set(!isFs()); try{ navigator.vibrate&&navigator.vibrate(8); }catch(e){} });
    document.addEventListener("fullscreenchange",function(){ if(!document.fullscreenElement&&isFs()){ set(false); } });
    document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&isFs()) set(false); });
    window.addEventListener("popstate",function(){ if(isFs()) set(false); });
    window.amiyoFullscreen={toggle:function(){ set(!isFs()); }};
    if(window.amiyoMore) window.amiyoMore.add("Project","⛶","Fullscreen",function(){ set(true); });
  }catch(e){ try{ console.warn("fullscreen",e); }catch(x){} }
})();

;
/* ==================== Script 917 id="amiyo-v133-quick-export" ==================== */
/* v133 Step 16: one-tap export for each platform. A new Export button in the dock opens the editor's export dialog directly (the top bar's Export button is easy to miss on a phone), and the More sheet gets Reels/TikTok, YouTube, Square and Feed tiles that first set the picture shape and then open the same export dialog, so the export options, progress bar and pause/cancel you already have are unchanged. */
(function(){
  try{
    var dock=document.getElementById("amDock"); if(!dock||document.getElementById("amtExp")) return;
    function click(id){ var b=document.getElementById(id); if(b&&!b.disabled){ b.click(); return true; } return false; }
    function shape(v){ var s=document.getElementById("aspectSel"); if(s&&s.value!==v){ s.value=v; s.dispatchEvent(new Event("change",{bubbles:true})); } }
    function say(m){ try{ toast(m); }catch(e){} }
    function exp(v,label){
      try{ var d=getProjectDuration(); if(!(d>0.05)){ say("Add something to the timeline first"); return; } }catch(e){}
      if(v){ shape(v); say("Exporting as "+label+" ("+v+")"); }
      setTimeout(function(){ if(!click("exportBtn")) say("Export is not available"); },v?120:0);
    }
    var b=document.createElement("button"); b.type="button"; b.id="amtExp"; b.innerHTML="<i>⬆</i>Export"; b.setAttribute("aria-label","Export video");
    b.style.borderColor="var(--accent)"; b.style.color="var(--accent)";
    b.addEventListener("click",function(){ exp(null); try{ navigator.vibrate&&navigator.vibrate(10); }catch(e){} });
    dock.insertBefore(b,dock.firstChild);
    function reg(){ var M=window.amiyoMore; if(!M) return false;
      [["9:16","📱","Reels · TikTok"],["16:9","▶️","YouTube"],["1:1","⬜","Square"],["4:5","🖼","Feed 4:5"]].forEach(function(p){ M.add("Quick export",p[1],p[2],function(){ exp(p[0],p[2]); }); });
      return true; }
    if(!reg()) setTimeout(reg,500);
  }catch(e){ try{ console.warn("quickexport",e); }catch(x){} }
})();

;
/* ==================== Script 918 id="amiyo-v134-save-chip" ==================== */
/* v134 Step 17: visible save status. The editor already autosaves and flushes when the tab goes to the background, but its "Saved / Unsaved" text is hidden on phones. This adds a small chip on the preview (green = saved, amber = saving or unsaved changes, red = problem) that mirrors it, and tapping the chip opens Storage and recovery points. It only reads the existing status, so saving itself is untouched. */
(function(){
  try{
    var pw=document.querySelector(".preview-wrap"), st=document.getElementById("saveStatus"); if(!pw||!st||document.getElementById("amSave")) return;
    var c=document.createElement("button"); c.type="button"; c.id="amSave"; c.className="am-save"; c.setAttribute("aria-live","polite"); c.setAttribute("aria-label","Save status. Tap for storage and recovery");
    c.innerHTML='<i></i><span>Unsaved</span>'; pw.appendChild(c); var sp=c.querySelector("span"), last="";
    function cls(t){ t=(t||"").toLowerCase(); if(/fail|error|full|blocked|could not|can.?t/.test(t)) return "bad"; if(/saving|sav\u2026|saving\.\.\.|working/.test(t)) return "work"; if(/unsaved|not saved|pending|edit/.test(t)) return "work"; if(/saved|up to date|ok|backed/.test(t)) return "ok"; return ""; }
    function sync(){ var t=(st.textContent||"").trim()||"Unsaved"; if(t===last) return; last=t; sp.textContent=t; c.className="am-save "+cls(t); }
    try{ new MutationObserver(sync).observe(st,{childList:true,characterData:true,subtree:true,attributes:true}); }catch(e){}
    setInterval(sync,1500); sync();
    c.addEventListener("click",function(){ var b=document.getElementById("storageBtn"); if(b) b.click(); });
  }catch(e){ try{ console.warn("savechip",e); }catch(x){} }
})();

;
/* ==================== Script 919 id="amiyo-v135-touch-tour" ==================== */
/* v135 Step 18: touch tour. The first time the editor opens on a phone or tablet, a short 5-card tour points at the new touch tools (dock, transport, scrub strip, gestures, More). Skip any time; it never shows again once finished or skipped, and More -> Touch tour replays it. */
(function(){
  try{
    if(document.getElementById("amTour")) return; var KEY="amiyoTouchTour2";
    var T=document.createElement("div"); T.id="amTour"; T.className="am-tour"; T.setAttribute("role","dialog"); T.setAttribute("aria-label","Touch tour");
    T.innerHTML='<div class="hl" id="amHl"></div><div class="card" id="amCard"><b id="amTt"></b><p id="amTp2"></p><div class="row"><span class="sp" id="amTn"></span><button type="button" id="amTs">Skip</button><button type="button" class="go" id="amTg">Next</button></div></div>';
    document.body.appendChild(T);
    var steps=[
      ["#amtTp","Transport","Big play button, frame step and jump to start or end. Double-tap the picture to play or pause."],
      ["#amJog","Scrub strip","Drag left or right to move frame by frame. Flick for speed."],
      ["#amDock","Quick tools","Swipe sideways for Undo, Speed, Key, Mixer, Pads, Keys and more."],
      ["#mbar","Library and Inspector","Open sheets from here, then swipe the grab bar down to close them."],
      ["#amDock button:last-child","More tools","Auto-duck, beat markers, reverse, gestures on/off and quick export live here."]
    ], i=0, hl=T.querySelector("#amHl"), card=T.querySelector("#amCard");
    function show(){
      var s=steps[i], el=document.querySelector(s[0]); if(!el||el.offsetParent===null&&getComputedStyle(el).position!=="fixed"){ if(i<steps.length-1){ i++; return show(); } return end(); }
      var r=el.getBoundingClientRect(); hl.style.left=(r.left-4)+"px"; hl.style.top=(r.top-4)+"px"; hl.style.width=(r.width+8)+"px"; hl.style.height=(r.height+8)+"px";
      T.querySelector("#amTt").textContent=s[1]; T.querySelector("#amTp2").textContent=s[2]; T.querySelector("#amTn").textContent=(i+1)+" / "+steps.length; T.querySelector("#amTg").textContent=i===steps.length-1?"Done":"Next";
      var below=r.top<window.innerHeight/2; card.style.top=below?(r.bottom+16)+"px":"auto"; card.style.bottom=below?"auto":(window.innerHeight-r.top+16)+"px";
    }
    function end(){ T.classList.remove("show"); try{ localStorage.setItem(KEY,"1"); }catch(e){} }
    function start(){ i=0; T.classList.add("show"); show(); }
    T.querySelector("#amTg").addEventListener("click",function(){ if(i>=steps.length-1) return end(); i++; show(); });
    T.querySelector("#amTs").addEventListener("click",end);
    window.addEventListener("resize",function(){ if(T.classList.contains("show")) show(); });
    window.amiyoTouchTour={start:start};
    function reg(){ if(!window.amiyoMore) return false; window.amiyoMore.add("Settings","🧭","Touch tour",start); return true; }
    if(!reg()) setTimeout(reg,500);
    var touch=window.matchMedia("(max-width:1024px),(pointer:coarse)").matches, seen=false; try{ seen=localStorage.getItem(KEY)==="1"; }catch(e){}
    if(touch&&!seen){ setTimeout(function(){ var w=document.querySelector(".welcome-overlay"); if(w&&w.offsetParent!==null) { setTimeout(start,6000); } else start(); },2500); }
  }catch(e){ try{ console.warn("tour",e); }catch(x){} }
})();

;
/* ==================== Script 920 id="amiyo-v136-haptics-wake" ==================== */
/* v136 Step 19: haptics switch and keep-screen-awake. (1) Every vibration in the touch tools now goes through one switch, More -> Haptics, remembered between visits. (2) While the video is playing or an export is running, the screen is kept awake (Screen Wake Lock) so a long export is not interrupted by the phone sleeping; it is released as soon as playback and export stop, and re-acquired if you switch back to the tab. Browsers without Wake Lock simply skip it. */
(function(){
  try{
    if(window.__amHaptics) return; window.__amHaptics=1; var KEY="amiyoHaptics", on=true; try{ on=localStorage.getItem(KEY)!=="0"; }catch(e){}
    var nv=navigator.vibrate; if(typeof nv==="function"){ try{ navigator.vibrate=function(p){ return on?nv.call(navigator,p):false; }; }catch(e){} }
    function reg(){ var M=window.amiyoMore; if(!M) return false; M.add("Settings","📳","Haptics: "+(on?"On":"Off"),function(b){ on=!on; try{ localStorage.setItem(KEY,on?"1":"0"); }catch(e){} try{ b.lastChild.textContent="Haptics: "+(on?"On":"Off"); }catch(x){} try{ toast("Haptics "+(on?"on":"off")); }catch(x){} if(on&&nv) nv.call(navigator,15); },{stay:true}); return true; }
    if(!reg()) setTimeout(reg,500);
    var lock=null, want=false;
    function busy(){ var pb=document.getElementById("playBtn"), eb=document.getElementById("expBar"); var playing=!!(pb&&/Pause|\u275A/.test(pb.textContent)); var exporting=!!(eb&&!eb.hidden&&eb.offsetParent!==null); return playing||exporting; }
    function acquire(){ if(lock||!navigator.wakeLock||document.hidden) return; navigator.wakeLock.request("screen").then(function(l){ lock=l; l.addEventListener("release",function(){ lock=null; }); if(!want){ try{ l.release(); }catch(e){} } }).catch(function(){}); }
    function release(){ if(lock){ try{ lock.release(); }catch(e){} lock=null; } }
    setInterval(function(){ var b=busy(); if(b!==want){ want=b; if(b) acquire(); else release(); } else if(b&&!lock) acquire(); },1500);
    document.addEventListener("visibilitychange",function(){ if(!document.hidden&&want) acquire(); });
  }catch(e){ try{ console.warn("haptics",e); }catch(x){} }
})();

;
/* ==================== Script 921 id="amiyo-v137-final-pass" ==================== */
/* v137 Step 20: final polish and safety pass. (1) Only one big sheet or bar is open at a time (opening Mixer closes Pads, Speed closes Format, and so on), so nothing stacks on a small screen. (2) Esc closes the open sheet. (3) The dock is put in a sensible order and fades at the right edge to show it scrolls. (4) Sheets are announced as dialogs to screen readers. (5) A quiet load check records which touch tools started (console only; nothing shows unless you open the console), so a missing tool can be spotted quickly. */
(function(){
  try{
    var dock=document.getElementById("amDock"); if(!dock) return;
    var SHEETS=["amMix","amMore","amtPads","amKeys"], BARS=["amSpd","amFmt","amKf"];
    function group(ids){
      ids.forEach(function(id){ var el=document.getElementById(id); if(!el||el.__amG) return; el.__amG=1;
        try{ new MutationObserver(function(){ if(el.classList.contains("show")){ ids.forEach(function(o){ if(o!==id){ var x=document.getElementById(o); if(x&&x.classList.contains("show")) x.classList.remove("show"); } }); syncPressed(); } }).observe(el,{attributes:true,attributeFilter:["class"]}); }catch(e){} });
    }
    function syncPressed(){ try{ [["amSpd","Speed"],["amFmt",null],["amKf","Keyframes"]].forEach(function(p){ var el=document.getElementById(p[0]); if(!el) return; dock.querySelectorAll("button").forEach(function(b){ if(p[1]&&b.getAttribute("aria-label")===p[1]) b.setAttribute("aria-pressed",String(el.classList.contains("show"))); }); }); }catch(e){} }
    group(SHEETS); group(BARS);
    SHEETS.forEach(function(id){ var el=document.getElementById(id); if(el){ el.setAttribute("aria-modal","false"); } });
    document.addEventListener("keydown",function(e){ if(e.key!=="Escape") return; for(var i=0;i<SHEETS.length;i++){ var el=document.getElementById(SHEETS[i]); if(el&&el.classList.contains("show")){ el.classList.remove("show"); try{ if(SHEETS[i]==="amtPads"&&window.amiyoPads) window.amiyoPads.close(); }catch(x){} e.preventDefault(); return; } } });
    /* sensible dock order */
    var order=["Export video","Undo","Redo","Duplicate","Marker","Speed","Keyframes","Video format","Mixer","Drum pads","Keyboard","Snap","Ripple Del","Zoom −","Zoom +","Fit","More tools"], btns=[].slice.call(dock.querySelectorAll(":scope>button"));
    function rank(b){ var l=b.getAttribute("aria-label")||b.textContent.trim(); var i=order.indexOf(l); return i<0?50:i; }
    btns.map(function(b,i){ return {b:b,r:rank(b),i:i}; }).sort(function(a,b){ return a.r-b.r||a.i-b.i; }).forEach(function(o){ dock.appendChild(o.b); });
    /* load check */
    var ids=["amDock","amtTp","amJog","amCq","amMix","amMore","amSpd","amFmt","amtPads","amKeys","amKf","amFs","amSave","amTour","amScrim"], ok=ids.filter(function(i){ return document.getElementById(i); }), miss=ids.filter(function(i){ return ok.indexOf(i)<0; });
    window.amiyoTouchStatus={version:137,loaded:ok.length,total:ids.length,missing:miss};
    try{ console.info("Amiyo touch tools v137: "+ok.length+"/"+ids.length+" ready"+(miss.length?" (missing: "+miss.join(", ")+")":"")); }catch(e){}
  }catch(e){ try{ console.warn("finalpass",e); }catch(x){} }
})();

;
/* ==================== Script 922 id="amiyo-up01-errtoast" ==================== */
(function(){try{addEventListener('unhandledrejection',function(e){try{e.preventDefault()}catch(_){}});}catch(e){}})();

;
/* ==================== Script 923 id="amiyo-up02-audioresume" ==================== */
(function(){try{['pointerdown','keydown'].forEach(function(t){addEventListener(t,function(){try{(window.AudioContext&&window.__ac)&&window.__ac.resume()}catch(e){}},{passive:true})});var _AC=window.AudioContext;if(_AC){window.AudioContext=function(){var c=new _AC(...arguments);window.__ac=c;return c};window.AudioContext.prototype=_AC.prototype}}catch(e){}})();

;
/* ==================== Script 924 id="amiyo-up03-wakelock" ==================== */
(function(){try{var wl=null;function playing(){return [].some.call(document.querySelectorAll('video,audio'),function(m){return !m.paused&&!m.ended})}async function lock(){try{if(!wl&&navigator.wakeLock&&playing()){wl=await navigator.wakeLock.request('screen');wl.addEventListener('release',function(){wl=null})}}catch(e){}}document.addEventListener('play',lock,true);document.addEventListener('visibilitychange',function(){if(!document.hidden)lock()});}catch(e){}})();

;
/* ==================== Script 925 id="amiyo-up04-arialabels" ==================== */
(function(){try{function f(){document.querySelectorAll('button:not([aria-label])').forEach(function(b){var t=(b.title||b.textContent||'').trim();if(t)b.setAttribute('aria-label',t.slice(0,40))})}setTimeout(f,1500);setInterval(f,20000);}catch(e){}})();

;
/* ==================== Script 926 id="amiyo-up05-onlinebadge" ==================== */
(function(){try{var d=document.createElement('div');d.setAttribute('role','status');d.style.cssText='position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 6px);transform:translateX(-50%);background:#3a2a10;color:#ffd9a0;padding:4px 12px;border-radius:14px;font:12px sans-serif;z-index:99999;display:none';d.textContent='Offline — editing still works, saved on this device';document.body.appendChild(d);function u(){d.style.display=navigator.onLine?'none':'block'}addEventListener('online',u);addEventListener('offline',u);u();}catch(e){}})();

;
/* ==================== Script 927 id="amiyo-up06-persist" ==================== */
(function(){try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist();}catch(e){}})();

;
/* ==================== Script 928 id="amiyo-up07-lowmem" ==================== */
(function(){try{if(navigator.deviceMemory&&navigator.deviceMemory<=2){document.documentElement.classList.add('am-lowmem');var s=document.createElement('style');s.textContent='.am-lowmem *{box-shadow:none!important;backdrop-filter:none!important}';document.head.appendChild(s)}}catch(e){}})();

;
/* ==================== Script 929 id="amiyo-up08-langmeta" ==================== */
(function(){try{document.documentElement.lang||(document.documentElement.lang='en');if(!document.querySelector('meta[name=description]')){var m=document.createElement('meta');m.name='description';m.content='Amiyo Editor — video and music editor that works offline';document.head.appendChild(m)}}catch(e){}})();

;
/* ==================== Script 930 id="amiyo-up09-safepause" ==================== */
(function(){try{var rec=0,MR=window.MediaRecorder;if(MR&&MR.prototype){var st=MR.prototype.start;MR.prototype.start=function(){rec++;var s=this,d=0;function done(){if(!d){d=1;rec=Math.max(0,rec-1)}}s.addEventListener('stop',done);s.addEventListener('error',done);return st.apply(this,arguments)}}document.addEventListener('visibilitychange',function(){if(document.hidden&&!rec&&!window.__amExporting)document.querySelectorAll('video').forEach(function(v){try{v.pause()}catch(e){}})});}catch(e){}})();

;
/* ==================== Script 931 id="amiyo-up08-meter-over-welcome" ==================== */
(function(){try{function f(){var w=document.getElementById('welcomeOverlay'),m=document.getElementById('prMeter');if(!m)return;var on=!!(w&&w.offsetHeight>0&&getComputedStyle(w).visibility!=='hidden');m.style.visibility=on?'hidden':''}f();setInterval(f,800)}catch(e){}})();

;
/* ==================== Script 932 id="amiyo-up09-panel-scroll-top" ==================== */
(function(){try{document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('#nav .navbtn');if(!b)return;setTimeout(function(){try{var s=document.querySelector('.sidebar');if(s)s.scrollTop=0}catch(x){}},60)},true)}catch(e){}})();

;
/* ==================== Script 933 id="amiyo-up10-audio-lab" ==================== */
(function(){try{
var $=function(t,p,h){var e=document.createElement(t);if(p)Object.assign(e,p);if(h)e.innerHTML=h;return e};
var dB=function(x){return x>1e-9?20*Math.log10(x):-120},lin=function(d){return Math.pow(10,d/20)};
var css=$('style');css.textContent='#alb{position:fixed;left:8px;bottom:140px;z-index:9998;background:#ff7a3d;color:#111;border:0;border-radius:20px;padding:8px 12px;font:600 13px sans-serif;box-shadow:0 2px 8px #0008}#alm{position:fixed;inset:0;z-index:99998;background:#0e0d0b;color:#f1ece2;font:14px sans-serif;overflow:auto;padding:calc(env(safe-area-inset-top,0px) + 10px) 14px 24px;display:none}#alm h2{margin:0 0 8px;font-size:18px}#alm label{display:block;margin:10px 0 2px;color:#b9b2a2;font-size:12px}#alm input[type=range],#alm select{width:100%}#alm select,#alm button{background:#1d1b17;color:#f1ece2;border:1px solid #3a352c;border-radius:8px;padding:8px;font-size:14px;min-height:40px}#alm .pri{background:#ff7a3d;color:#111;border:0;font-weight:700}#alm .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}#alm canvas{width:100%;height:90px;background:#141210;border-radius:8px}#alm table{width:100%;border-collapse:collapse;margin-top:8px;font-size:13px}#alm td,#alm th{padding:4px;border-bottom:1px solid #2a2620;text-align:right}#alm td:first-child,#alm th:first-child{text-align:left}';document.head.appendChild(css);
var btn=$('button',{id:'alb',type:'button'},'🎚 Audio Lab'),M=$('div',{id:'alm'});
M.innerHTML='<h2>Audio Lab — pro audio tools</h2><input type="file" id="alf" accept="audio/*,video/*"><div class="row"><button id="alu" type="button">🎯 Use selected clip from timeline</button></div><canvas id="alc"></canvas><div id="aln" style="margin-top:4px;color:#b9b2a2;font-size:12px">Choose an audio or video file to begin.</div>'
+'<label>Preset</label><select id="alps"><option value="">Choose a preset…</option><option value="pod">Podcast voice</option><option value="mus">Music master</option><option value="cln">Clean-up</option><option value="rst">Reset all</option></select>'
+'<label>Noise reduction (%, 0 = off): <b>0</b></label><input type="range" id="aldn" min="0" max="100" value="0"><label>High-pass filter (Hz, 0 = off): <b id="alhv">0</b></label><input type="range" id="alh" min="0" max="300" value="0">'
+'<label>Noise gate threshold (dB, −80 = off): <b id="algv">−80</b></label><input type="range" id="alg" min="-80" max="-20" value="-80">'
+'<label>Gain (dB): <b id="alav">0</b></label><input type="range" id="ala" min="-24" max="24" step="0.1" value="0">'
+'<label>Fade in / out (s): <b id="alfv">0</b></label><input type="range" id="alfd" min="0" max="5" step="0.1" value="0">'
+'<label>Trim start / end (% of file)</label><input type="range" id="als" min="0" max="100" value="0"><input type="range" id="ale" min="0" max="100" value="100">'
+'<label>EQ low shelf 100 Hz (dB): <b>0</b></label><input type="range" id="aq1" min="-12" max="12" step="0.5" value="0"><label>EQ mid 1 kHz (dB): <b>0</b></label><input type="range" id="aq2" min="-12" max="12" step="0.5" value="0"><label>EQ high shelf 8 kHz (dB): <b>0</b></label><input type="range" id="aq3" min="-12" max="12" step="0.5" value="0"><label>Compressor threshold (dB, 0 = off): <b>0</b></label><input type="range" id="alct" min="-50" max="0" step="1" value="0"><label>Compressor ratio: <b>3</b></label><input type="range" id="alcr" min="1" max="20" step="0.5" value="3"><label>De-esser threshold (dB, 0 = off): <b>0</b></label><input type="range" id="ades" min="-40" max="0" step="1" value="0"><label>Stereo width (%, 100 = unchanged): <b>100</b></label><input type="range" id="alw" min="0" max="200" step="1" value="100"><label>Loudness target</label><select id="alt"><option value="">Off</option><option value="-14">−14 LUFS (streaming)</option><option value="-16">−16 LUFS (podcast)</option><option value="-23">−23 LUFS (broadcast)</option></select>'
+'<label>Limiter ceiling</label><select id="alk"><option value="-1">−1.0 dBFS</option><option value="-2">−2.0 dBFS</option><option value="-0.3">−0.3 dBFS</option></select>'
+'<label>Export</label><select id="alx"><option value="24">24-bit WAV</option><option value="16">16-bit WAV (dithered)</option></select>'
+'<div class="row"><label style="margin:0"><input type="checkbox" id="alp"> Invert polarity</label><label style="margin:0"><input type="checkbox" id="alm1"> Mono</label><label style="margin:0"><input type="checkbox" id="alo"> Preview original (A/B)</label></div>'
+'<div class="row"><button class="pri" id="alr" type="button">Process</button><button id="alpl" type="button">▶ Preview</button><button id="ald" type="button">⬇ Export WAV</button><button id="alrp" type="button">↺ Replace selected clip</button><button id="alad" type="button">＋ Add to timeline</button><button id="alq" type="button">Close</button></div>'
+'<canvas id="alsp" style="margin-top:10px;height:110px"></canvas><div style="font-size:11px;color:#b9b2a2">Frequency graph 20 Hz–20 kHz: grey = original, orange = processed</div><table><tr><th></th><th>Original</th><th>Processed</th></tr><tr><td>Peak (dBFS)</td><td id="p0">–</td><td id="p1">–</td></tr><tr><td>True peak ≈ (dBTP)</td><td id="t0">–</td><td id="t1">–</td></tr><tr><td>Loudness (LUFS)</td><td id="l0">–</td><td id="l1">–</td></tr><tr><td>Length (s)</td><td id="d0">–</td><td id="d1">–</td></tr></table>';
document.body.appendChild(btn);document.body.appendChild(M);
var g=function(i){return M.querySelector('#'+i)},src=null,out=null,ac=null,play=null;window.__alst=function(){return{src:src,out:out,ac:ac}};
M.querySelectorAll('input[type=range]').forEach(function(i){i.addEventListener('input',function(){var l=i.previousElementSibling,b=l&&l.querySelector&&l.querySelector('b');if(b)b.textContent=i.value})});
function alSR(ab){try{var v=new DataView(ab);if(ab.byteLength<44)return 0;var t=function(o){return String.fromCharCode(v.getUint8(o),v.getUint8(o+1),v.getUint8(o+2),v.getUint8(o+3))};if(t(0)==='RIFF'&&t(8)==='WAVE'){var o=12;while(o+8<=ab.byteLength&&o<65536){var id=t(o),sz=v.getUint32(o+4,true);if(id==='fmt ')return v.getUint32(o+12,true);o+=8+sz+(sz&1)}}else if(t(0)==='fLaC'&&ab.byteLength>=22){return(v.getUint8(18)<<12)|(v.getUint8(19)<<4)|(v.getUint8(20)>>4)}else if(t(0)==='OggS'){var u=new Uint8Array(ab,0,Math.min(ab.byteLength,400));for(var i=27;i<u.length-8;i++)if(u[i]===79&&u[i+1]===112&&u[i+2]===117&&u[i+3]===115&&u[i+4]===72)return 48000}}catch(e){}return 0}
async function alDec(ab,ctx){var sr=alSR(ab);if(sr>=8000&&sr<=192000&&sr!==ctx.sampleRate){try{var oc=new OfflineAudioContext(2,1,sr);return await oc.decodeAudioData(ab.slice(0))}catch(e){}}return ctx.decodeAudioData(ab)}
function peak(b){var p=0;for(var c=0;c<b.numberOfChannels;c++){var d=b.getChannelData(c);for(var i=0;i<d.length;i++){var a=d[i]<0?-d[i]:d[i];if(a>p)p=a}}return p}
function tpeak(b){var p=peak(b);for(var c=0;c<b.numberOfChannels;c++){var d=b.getChannelData(c),n=d.length;for(var i=1;i<n-2;i++){var y0=d[i-1],y1=d[i],y2=d[i+1],y3=d[i+2];for(var k=1;k<4;k++){var t=k/4,v=y1+.5*t*(y2-y0+t*(2*y0-5*y1+4*y2-y3+t*(3*(y1-y2)+y3-y0))),q=v<0?-v:v;if(q>p)p=q}}}return p}
async function lufs(b){try{if(window.__alLoud&&window.__alLoud.measure){await new Promise(function(r){setTimeout(r,0)});var mx=window.__alLoud.measure(b);if(mx&&isFinite(mx.lufs))return mx.lufs}}catch(e0){}try{var o=new OfflineAudioContext(b.numberOfChannels,b.length,b.sampleRate),s=o.createBufferSource();s.buffer=b;var hp=o.createBiquadFilter();hp.type='highpass';hp.frequency.value=38;hp.Q.value=.5;var hs=o.createBiquadFilter();hs.type='highshelf';hs.frequency.value=1500;hs.gain.value=4;s.connect(hs);hs.connect(hp);hp.connect(o.destination);s.start();var r=await o.startRendering(),n=r.length,w=Math.round(.4*r.sampleRate),h=Math.round(.1*r.sampleRate),bl=[];for(var st=0;st+w<=n;st+=h){var z=0;for(var c=0;c<r.numberOfChannels;c++){var d=r.getChannelData(c),q=0;for(var i=st;i<st+w;i++)q+=d[i]*d[i];z+=q/w}bl.push(z)}if(!bl.length)return -120;var L=function(z){return -.691+10*Math.log10(z+1e-12)},a=bl.filter(function(z){return L(z)>-70});if(!a.length)return -120;var m=a.reduce(function(x,y){return x+y})/a.length,rel=L(m)-10,gg=a.filter(function(z){return L(z)>rel});if(!gg.length)return -120;return L(gg.reduce(function(x,y){return x+y})/gg.length)}catch(e){return -120}}
var f1=function(x){return x<=-119?'−∞':x.toFixed(1)};

function fft(re,im){var n=re.length,j=0;for(var i=1;i<n;i++){var b=n>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){var t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t}}for(var len=2;len<=n;len<<=1){var a=-2*Math.PI/len,wr=Math.cos(a),wi=Math.sin(a),h=len>>1;for(var s=0;s<n;s+=len){var cr=1,ci=0;for(var k=0;k<h;k++){var u=s+k,v=u+h,xr=re[v]*cr-im[v]*ci,xi=re[v]*ci+im[v]*cr;re[v]=re[u]-xr;im[v]=im[u]-xi;re[u]+=xr;im[u]+=xi;var t2=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=t2}}}}
var NF=2048,HW=new Float32Array(NF);for(var hi=0;hi<NF;hi++)HW[hi]=.5-.5*Math.cos(2*Math.PI*hi/NF);
async function denoise(d,s){var N=NF,H=N/4,len=d.length,p=new Float32Array(len+2*N);p.set(d,N);var fr=Math.floor((p.length-N)/H)+1,B=N/2+1,re=new Float32Array(N),im=new Float32Array(N),en=[],i,k;
for(i=0;i<fr;i++){var e=0,o=i*H;for(k=0;k<N;k+=8)e+=p[o+k]*p[o+k];en.push([e,i])}
var idx=en.filter(function(x){return x[0]>0}).sort(function(a,b){return a[0]-b[0]}).slice(0,Math.max(3,Math.floor(fr*.1))),nz=new Float32Array(B);if(!idx.length)return d;
idx.forEach(function(x){var o=x[1]*H;for(k=0;k<N;k++){re[k]=p[o+k]*HW[k];im[k]=0}fft(re,im);for(k=0;k<B;k++)nz[k]+=Math.sqrt(re[k]*re[k]+im[k]*im[k])/idx.length});if(window.__alNZ){var q0=window.__alNZ();if(q0&&q0.length===B)for(k=0;k<B;k++)nz[k]=q0[k]}
var al=1+2*s,fl=Math.pow(10,-(6+24*s)/20),out=new Float32Array(p.length),gn=new Float32Array(B);
for(i=0;i<fr;i++){var o2=i*H;for(k=0;k<N;k++){re[k]=p[o2+k]*HW[k];im[k]=0}fft(re,im);for(k=0;k<B;k++){var m=Math.sqrt(re[k]*re[k]+im[k]*im[k]);gn[k]=Math.max(fl,1-al*nz[k]/(m+1e-12))}
for(k=1;k<B-1;k++){var gs=(gn[k-1]+gn[k]+gn[k+1])/3;re[k]*=gs;im[k]*=gs;if(k>0){re[N-k]*=gs;im[N-k]*=gs}}
re[0]*=gn[0];im[0]*=gn[0];re[B-1]*=gn[B-1];im[B-1]*=gn[B-1];fft(im,re);for(k=0;k<N;k++)out[o2+k]+=re[k]/N*HW[k]/1.5;
if(i%150===149){g('aln').textContent='Reducing noise… '+Math.round(i/fr*100)+'%';await new Promise(function(r){setTimeout(r,0)})}}
return out.subarray(N,N+len)}
function deess(r,t){var sr=r.sampleRate,w0=2*Math.PI*7000/sr,cs=Math.cos(w0),al=Math.sin(w0)/2.4,a0=1+al,b0=al/a0,a1=-2*cs/a0,a2=(1-al)/a0,th=lin(t),at=1-Math.exp(-1/(.001*sr)),rl=1-Math.exp(-1/(.03*sr));for(var c=0;c<r.numberOfChannels;c++){var d=r.getChannelData(c),x1=0,x2=0,y1=0,y2=0,env=0;for(var i=0;i<d.length;i++){var x=d[i],hb=b0*x-b0*x2-a1*y1-a2*y2;x2=x1;x1=x;y2=y1;y1=hb;var a=hb<0?-hb:hb;env+=(a-env)*(a>env?at:rl);d[i]=x-hb*(env>th?1-th/env:0)}}}
var SP=[null,null];
function spectrum(b){var N=NF,d=b.getChannelData(0),H=Math.max(N,Math.floor(d.length/120)),re=new Float32Array(N),im=new Float32Array(N),acc=new Float32Array(N/2+1),c=0;for(var o=0;o+N<=d.length;o+=H){for(var k=0;k<N;k++){re[k]=d[o+k]*HW[k];im[k]=0}fft(re,im);for(k=0;k<=N/2;k++)acc[k]+=re[k]*re[k]+im[k]*im[k];c++}if(!c)return null;for(var q=0;q<acc.length;q++)acc[q]=10*Math.log10(acc[q]/c/(N*N/16)+1e-14);return {a:acc,sr:b.sampleRate}}
function drawSpec(){var c=g('alsp'),w=c.width=c.clientWidth*2,h=c.height=220,x=c.getContext('2d');x.fillStyle='#141210';x.fillRect(0,0,w,h);x.strokeStyle='#2a2620';x.fillStyle='#b9b2a2';x.font='18px sans-serif';[100,1000,10000].forEach(function(f){var px=Math.log10(f/20)/3*w;x.beginPath();x.moveTo(px,0);x.lineTo(px,h);x.stroke();x.fillText(f>=1000?f/1000+'k':f,px+3,h-4)});
[[0,'#6c665a'],[1,'#ff7a3d']].forEach(function(z){var s=SP[z[0]];if(!s)return;x.strokeStyle=z[1];x.lineWidth=2;x.beginPath();var st=false;for(var k=1;k<s.a.length;k++){var f=k*s.sr/NF;if(f<20||f>20000)continue;var px=Math.log10(f/20)/3*w,py=h-Math.max(0,Math.min(1,(s.a[k]+100)/100))*h;if(!st){x.moveTo(px,py);st=true}else x.lineTo(px,py)}x.stroke()})}

function show(k,b,l){if(k===0)SP[1]=null;try{SP[k]=spectrum(b);drawSpec()}catch(e){}g('p'+k).textContent=f1(dB(peak(b)));g('t'+k).textContent=f1(dB(tpeak(b)));g('l'+k).textContent=f1(l);g('d'+k).textContent=b.duration.toFixed(2)}
function draw(b){var c=g('alc'),w=c.width=c.clientWidth*2,h=c.height=180,x=c.getContext('2d'),d=b.getChannelData(0),st=Math.max(1,Math.floor(d.length/w));x.fillStyle='#ff7a3d';for(var i=0;i<w;i++){var mn=0,mx=0;for(var j=0;j<st;j++){var v=d[i*st+j]||0;if(v<mn)mn=v;if(v>mx)mx=v}x.fillRect(i,h/2-mx*h/2,1,Math.max(1,(mx-mn)*h/2))}}
var PS={pod:{ades:-28,alw:100,aldn:40,alh:80,alg:-50,ala:0,alfd:0.1,aq1:0,aq2:2,aq3:2,alct:-22,alcr:3,alt:'-16'},mus:{ades:0,alw:100,aldn:0,alh:25,alg:-80,ala:0,alfd:0,aq1:1,aq2:0,aq3:1.5,alct:-14,alcr:2,alt:'-14'},cln:{ades:0,alw:100,aldn:60,alh:100,alg:-55,ala:0,alfd:0.05,aq1:0,aq2:0,aq3:0,alct:0,alcr:3,alt:''},rst:{ades:0,alw:100,aldn:0,alh:0,alg:-80,ala:0,alfd:0,aq1:0,aq2:0,aq3:0,alct:0,alcr:3,alt:''}};
g('alps').addEventListener('change',function(){var p=PS[this.value];if(!p)return;for(var k in p){var e=g(k);e.value=p[k];e.dispatchEvent(new Event('input'))}g('aln').textContent='Preset applied. Press Process.'});
g('alf').addEventListener('change',async function(){var f=this.files[0];if(!f)return;g('aln').textContent='Reading '+f.name+'…';try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();src=await alDec(await f.arrayBuffer(),ac);out=null;draw(src);g('aln').textContent=f.name+' — '+src.numberOfChannels+' ch, '+src.sampleRate+' Hz';show(0,src,await lufs(src))}catch(e){g('aln').textContent='Could not read this file as audio.'}});
g('alr').addEventListener('click',async function(){if(!src){g('aln').textContent='Choose a file first.';return}g('aln').textContent='Processing…';try{
var sr=src.sampleRate,s0=Math.floor(src.length*g('als').value/100),s1=Math.max(s0+1,Math.floor(src.length*g('ale').value/100)),len=s1-s0,ch=g('alm1').checked?1:src.numberOfChannels;
var o=new OfflineAudioContext(ch,len,sr),s=o.createBufferSource(),nb=o.createBuffer(src.numberOfChannels,len,sr);var dn=+g('aldn').value/100,__J=[];if(dn>0&&window.__alDN){for(var c9=0;c9<src.numberOfChannels;c9++)__J.push(window.__alDN(src.getChannelData(c9).subarray(s0,s1),dn))}for(var c=0;c<src.numberOfChannels;c++){var seg=src.getChannelData(c).subarray(s0,s1);if(dn>0){var wk=__J.length?await __J[c]:null;seg=wk||await denoise(seg,dn)}nb.copyToChannel(seg,c)}g('aln').textContent='Processing…';s.buffer=nb;var node=s,hz=+g('alh').value,add=function(n){node.connect(n);node=n};if(hz>0){var hp=o.createBiquadFilter();hp.type='highpass';hp.frequency.value=hz;hp.Q.value=.707;add(hp)}[['lowshelf',100,'aq1',.7],['peaking',1000,'aq2',1],['highshelf',8000,'aq3',.7]].forEach(function(bb){var G=+g(bb[2]).value;if(G){var q=o.createBiquadFilter();q.type=bb[0];q.frequency.value=bb[1];q.gain.value=G;q.Q.value=bb[3];add(q)}});var ct=+g('alct').value;if(ct<0){var cp=o.createDynamicsCompressor();cp.threshold.value=ct;cp.ratio.value=+g('alcr').value;cp.knee.value=6;cp.attack.value=(window.__alCP||{a:.01}).a;cp.release.value=(window.__alCP||{r:.15}).r;if(window.__alCP)cp.knee.value=window.__alCP.k;add(cp)}node.connect(o.destination);s.start();var r=await o.startRendering();if(window.__alTP)r=await window.__alRace(window.__alTP(r));var gt=+g('alg').value,gain=lin(+g('ala').value)*(g('alp').checked?-1:1),fd=Math.round(+g('alfd').value*sr);
var dsT=+g('ades').value;if(dsT<0)deess(r,dsT);var wd=+g('alw').value/100;if(r.numberOfChannels===2&&wd!==1){var L=r.getChannelData(0),R=r.getChannelData(1);for(var q=0;q<L.length;q++){var mm=(L[q]+R[q])/2,sd=(L[q]-R[q])/2*wd;L[q]=mm+sd;R[q]=mm-sd}}
var att=1-Math.exp(-1/(.005*sr)),rls=1-Math.exp(-1/(.08*sr)),hn=Math.round(.05*sr);
for(var c2=0;c2<r.numberOfChannels;c2++){var d=r.getChannelData(c2),env=0,ga=1,hold=0;for(var i=0;i<d.length;i++){var v=d[i],a=v<0?-v:v;env=a>env?a:env+(a-env)*.0008;var gm=1;if(gt>-80){if(dB(env)>=gt)hold=hn;else if(hold>0)hold--;var tg2=hold>0?1:0;ga+=(tg2-ga)*(tg2>ga?att:rls);gm=ga}var f=1;if(fd>0){if(i<fd)f=i/fd;var k=d.length-1-i;if(k<fd)f=Math.min(f,k/fd)}d[i]=v*gain*gm*f}}
var tg=g('alt').value;if(tg){var l=await lufs(r);if(l>-100){var m=lin(+tg-l);for(var c3=0;c3<r.numberOfChannels;c3++){var e=r.getChannelData(c3);for(var j=0;j<e.length;j++)e[j]*=m}}}
var ce=lin(+g('alk').value),rel=Math.exp(-1/(.05*sr));for(var c4=0;c4<r.numberOfChannels;c4++){var q=r.getChannelData(c4),ga=1;for(var z=0;z<q.length;z++){var aa=q[z]<0?-q[z]:q[z],need=aa>ce?ce/aa:1;ga=need<ga?need:1+(ga-1)*rel;q[z]*=ga}}
out=r;show(1,out,await lufs(out));g('aln').textContent='Done. Preview or export.'}catch(e){g('aln').textContent=(e&&e.message==='Cancelled'?'Cancelled.':'Processing failed: '+(e&&e.message))}});
g('alpl').addEventListener('click',function(){if(play){try{play.stop()}catch(e){}play=null;this.textContent='▶ Preview';return}var b=g('alo').checked?src:(out||src);if(!b)return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();ac.resume();play=ac.createBufferSource();play.buffer=b;play.connect(ac.destination);var t=this;play.onended=function(){play=null;t.textContent='▶ Preview'};play.start();this.textContent='■ Stop'}catch(e){}});
function mk(b,bits){var n=b.length,ch=b.numberOfChannels,by=bits/8,buf=new ArrayBuffer(44+n*ch*by),v=new DataView(buf),ws=function(o,s){for(var i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};ws(0,'RIFF');v.setUint32(4,36+n*ch*by,true);ws(8,'WAVE');ws(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,ch,true);v.setUint32(24,b.sampleRate,true);v.setUint32(28,b.sampleRate*ch*by,true);v.setUint16(32,ch*by,true);v.setUint16(34,bits,true);ws(36,'data');v.setUint32(40,n*ch*by,true);var D=[];for(var c=0;c<ch;c++)D.push(b.getChannelData(c));var o=44;for(var i=0;i<n;i++)for(var c2=0;c2<ch;c2++){var x=Math.max(-1,Math.min(1,D[c2][i]));if(bits===24){var q=Math.round(x*8388607);v.setUint8(o,q&255);v.setUint8(o+1,(q>>8)&255);v.setUint8(o+2,(q>>16)&255);o+=3}else{x+= (Math.random()-Math.random())/32768;v.setInt16(o,Math.round(Math.max(-1,Math.min(1,x))*32767),true);o+=2}}
return buf}
g('ald').addEventListener('click',function(){var b=out;if(!b){g('aln').textContent='Press Process first.';return}var buf=mk(b,+g('alx').value),bits=+g('alx').value;var a=$('a',{href:URL.createObjectURL(new Blob([buf],{type:'audio/wav'})),download:'audio-lab-'+bits+'bit.wav'});document.body.appendChild(a);a.click();setTimeout(function(){a.remove()},500);g('aln').textContent='Exported WAV ('+bits+'-bit, '+(buf.byteLength/1048576).toFixed(2)+' MB).'});

var sel=null;
async function dec(url){ac=ac||new (window.AudioContext||window.webkitAudioContext)();return alDec(await (await fetch(url)).arrayBuffer(),ac)}
g('alu').addEventListener('click',async function(){try{var f=getClip();if(!f||!f.clip.assetId){g('aln').textContent='Select an audio or video clip on the timeline first, then reopen Audio Lab.';return}var as=getAsset(f.clip.assetId);if(!as||(as.type!=='audio'&&as.type!=='video')){g('aln').textContent='The selected clip has no audio.';return}g('aln').textContent='Reading clip…';var full=await dec(await ensureUrl(as)),sr=full.sampleRate,i0=Math.max(0,Math.floor((f.clip.inPoint||0)*sr)),i1=Math.min(full.length,Math.floor((f.clip.outPoint||as.duration||full.duration)*sr));if(i1-i0<64){i0=0;i1=full.length}var nb=ac.createBuffer(full.numberOfChannels,i1-i0,sr);for(var c=0;c<full.numberOfChannels;c++)nb.copyToChannel(full.getChannelData(c).subarray(i0,i1),c);src=nb;out=null;sel={clipId:f.clip.id,trackId:f.track.id};draw(src);window.__alSetBase&&window.__alSetBase(as.name||'clip');g('aln').textContent='Clip “'+(as.name||'clip')+'” loaded ('+src.duration.toFixed(2)+' s). Set your tools, press Process, then Replace.';show(0,src,await lufs(src))}catch(e){g('aln').textContent='Could not read the selected clip.'}});
async function put(asNew){if(!out){g('aln').textContent='Press Process first.';return}try{var before=new Set(Object.keys(project.assets)),cb=new Set(project.tracks.flatMap(function(t){return t.clips.map(function(c){return c.id})})),file=new File([mk(out,24)],'AudioLab-'+Date.now()+'.wav',{type:'audio/wav'});var nid=uid('asset');project.assets[nid]={id:nid,name:file.name,mime:'audio/wav',type:'audio',size:file.size,width:0,height:0,duration:out.duration,fps:0,tags:[],favorite:false};ASSET_BLOBS.set(nid,file);if(window.amiyoPutBlob)window.amiyoPutBlob(nid,file);if(!nid){g('aln').textContent='Could not add the processed audio.';return}project.tracks.forEach(function(t){t.clips=t.clips.filter(function(c){return cb.has(c.id)})});if(sel){selectedClipId=sel.clipId;selectedTrackId=sel.trackId}
if(asNew){addAssetToTimeline(nid);g('aln').textContent='Added to the timeline.';M.style.display='none';return}
var f=sel&&getClipByIds(sel.clipId,sel.trackId);if(!f){g('aln').textContent='Processed audio saved to your media library. Use “🎯 Use selected clip” first to replace a clip in place.';return}
var bf=deepClone(serializableProject()),c=f.clip||f;c.assetId=nid;c.inPoint=0;c.outPoint=out.duration;c.duration=out.duration/(c.speed||1);recordHistory('Audio Lab',bf,serializableProject());scheduleAutosave();renderAll();g('aln').textContent='Clip replaced. You can undo it from the editor.';M.style.display='none';toast('Audio Lab applied')}catch(e){g('aln').textContent='Could not apply: '+e.message}}
g('alrp').addEventListener('click',function(){put(false)});g('alad').addEventListener('click',function(){put(true)});
btn.addEventListener('click',function(){M.style.display='block'});g('alq').addEventListener('click',function(){M.style.display='none';if(play){try{play.stop()}catch(e){}}});
}catch(e){}})();

;
/* ==================== Script 934 id="amiyo-al-s01-easy-start" ==================== */
/* Audio Lab step 1: easy start (big Choose button, drag-and-drop, media-library picker), controls grouped into collapsible sections with "n active" badges, sticky action bar, Esc closes, Ctrl+Enter processes. */
(function(){try{
var M=document.getElementById('alm'),B=document.getElementById('alb');if(!M||M.getAttribute('data-s1'))return;M.setAttribute('data-s1','1');
var g=function(i){return M.querySelector('#'+i)},esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var st=document.createElement('style');st.textContent='#alm{padding-left:max(14px,calc((100vw - 760px)/2))!important;padding-right:max(14px,calc((100vw - 760px)/2))!important}#alm .alhd{position:sticky;top:0;z-index:6;display:flex;align-items:center;justify-content:space-between;background:#0e0d0b;padding:6px 0;margin-bottom:6px}#alm .alhd h2{margin:0}#alm .alzone{border:2px dashed #3a352c;border-radius:12px;padding:14px;text-align:center;background:#141210}#alm .alzone.on{border-color:#ff7a3d;background:#1d1812}#alm .alpick{display:inline-block;background:#ff7a3d;color:#111;font-weight:700;border-radius:10px;padding:12px 18px;cursor:pointer;font-size:15px;margin:0}#alm .alzone input[type=file]{display:none}#alm .alzone .alor{color:#b9b2a2;font-size:12px;margin:8px 0 4px}#alm details.alsec{border:1px solid #2a2620;border-radius:10px;margin-top:10px;background:#141210}#alm details.alsec>summary{cursor:pointer;padding:12px;font-weight:700;min-height:44px;box-sizing:border-box;list-style:none;display:flex;justify-content:space-between;gap:8px}#alm details.alsec>summary::-webkit-details-marker{display:none}#alm details.alsec>summary i{font-style:normal;color:#ff7a3d;font-weight:600;font-size:12px;margin-left:auto}#alm details.alsec>summary::after{content:"▾"}#alm details.alsec[open]>summary::after{content:"▴"}#alm .alin{padding:0 12px 12px}#alm .alsticky{position:sticky;bottom:0;z-index:6;background:#0e0d0b;padding:8px 0 calc(env(safe-area-inset-bottom,0px) + 8px);border-top:1px solid #2a2620;margin-top:14px}#alm .alsticky button{flex:1 1 auto}';document.head.appendChild(st);
/* header with close button */
var h2=M.querySelector('h2'),hd=document.createElement('div');hd.className='alhd';M.insertBefore(hd,h2);hd.appendChild(h2);var x=document.createElement('button');x.type='button';x.textContent='✕';x.setAttribute('aria-label','Close Audio Lab');x.onclick=function(){g('alq').click()};hd.appendChild(x);
/* start zone */
var fi=g('alf'),zone=document.createElement('div');zone.className='alzone';M.insertBefore(zone,fi);
var pk=document.createElement('label');pk.className='alpick';pk.htmlFor='alf';pk.textContent='🎙 Choose voice / audio file';zone.appendChild(pk);zone.appendChild(fi);
zone.insertAdjacentHTML('beforeend','<div class="alor">or drop a file here</div><select id="alib"><option value="">…or pick from your media library</option></select>');
zone.appendChild(g('alu').parentNode);
function feed(f){var dt=new DataTransfer();dt.items.add(f);fi.files=dt.files;fi.dispatchEvent(new Event('change'))}
function pop(){var h='<option value="">…or pick from your media library</option>';try{Object.keys(project.assets).forEach(function(k){var a=project.assets[k];if(a&&(a.type==='audio'||a.type==='video'))h+='<option value="'+esc(k)+'">'+(a.type==='video'?'🎞 ':'🎵 ')+esc(a.name||k)+'</option>'})}catch(e){}g('alib').innerHTML=h}
g('alib').addEventListener('change',async function(){var id=this.value;if(!id)return;g('aln').textContent='Opening from library…';try{var a=project.assets[id],b=ASSET_BLOBS.get(id);if(!b){var _u=await ensureUrl(a);if(!_u)throw new Error('no media');b=await(await fetch(_u)).blob();}feed(new File([b],a.name||'audio',{type:b.type||a.mime||''}))}catch(e){g('aln').textContent='Could not open that library item.'}});
['dragenter','dragover'].forEach(function(t){M.addEventListener(t,function(e){e.preventDefault();zone.classList.add('on')})});
['dragleave','drop'].forEach(function(t){M.addEventListener(t,function(e){e.preventDefault();if(t==='drop'||e.target===M)zone.classList.remove('on')})});
M.addEventListener('drop',function(e){var f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];if(f)feed(f)});
/* collapsible sections */
var act=g('alr').parentNode;
function take(ids){var n=[];ids.forEach(function(id){var c=g(id);if(!c)return;var r=c.closest('.row'),e=(r&&r.parentNode===M)?r:c;if(n.indexOf(e)>=0)return;var p=e.previousElementSibling;if(e!==r&&p&&p.tagName==='LABEL'&&p.parentNode===M)n.push(p);n.push(e)});return n}
var secs=[['🧹 Clean-up (noise, hum, gate)',['aldn','alh','alg'],1],['🔊 Level, fade & trim',['ala','alfd','als','ale']],['🎛 Tone (3-band EQ)',['aq1','aq2','aq3']],['🎚 Dynamics & stereo',['alct','alcr','ades','alw']],['📤 Loudness, limiter & export',['alt','alk','alx','alp','alm1','alo']]],built=[];
secs.forEach(function(s){var d=document.createElement('details');d.className='alsec';if(s[2])d.open=true;var sm=document.createElement('summary');sm.innerHTML='<span>'+s[0]+'</span><i></i>';var b=document.createElement('div');b.className='alin';d.appendChild(sm);d.appendChild(b);take(s[1]).forEach(function(n){b.appendChild(n)});M.insertBefore(d,act);built.push([d,s[1]])});
var sp=g('alsp');[sp,sp.nextElementSibling,M.querySelector('table')].forEach(function(n){if(n)M.insertBefore(n,act)});
act.classList.add('alsticky');M.appendChild(act);g('alr').textContent='⚡ Process';
/* "n active" badges */
function isDef(c){if(c.type==='checkbox')return c.checked===c.defaultChecked;if(c.tagName==='SELECT'){var d=0;for(var i=0;i<c.options.length;i++)if(c.options[i].defaultSelected){d=i;break}return c.selectedIndex===d}return c.value===c.defaultValue}
function upd(){built.forEach(function(b){var n=0;b[1].forEach(function(id){var c=g(id);if(c&&!isDef(c))n++});b[0].querySelector('summary i').textContent=n?'● '+n+' active':''})}
M.addEventListener('input',upd,true);M.addEventListener('change',upd,true);g('alps').addEventListener('change',function(){setTimeout(upd,0)});upd();
/* open / keys */
if(B)B.addEventListener('click',function(){pop();M.scrollTop=0;upd()});
document.addEventListener('keydown',function(e){if(M.style.display!=='block')return;if(e.key==='Escape'){g('alq').click()}else if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();g('alr').click()}});
}catch(e){try{console.error('Audio Lab step 1',e)}catch(x){}}})();

;
/* ==================== Script 935 id="amiyo-al-s02-waveform-trim" ==================== */
/* Audio Lab step 2: waveform with draggable trim handles, playhead, click-to-seek, preview from playhead, loop selection, Space = play/stop, Start/End-at-playhead buttons. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-s2'))return;M.setAttribute('data-s2','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}};
var st=document.createElement('style');st.textContent='#alm .alwv{position:relative;margin-top:10px}#alm .alwv canvas{display:block;height:120px!important}#alm #alov{position:absolute;left:0;top:0;background:transparent!important;touch-action:none;cursor:ew-resize}#alm .alrd{font:12px monospace;color:#b9b2a2;margin-top:4px}#alm .alwr button{min-height:36px;padding:6px 10px;font-size:13px}';document.head.appendChild(st);
var c0=g('alc'),w=document.createElement('div');w.className='alwv';c0.parentNode.insertBefore(w,c0);w.appendChild(c0);
var ov=document.createElement('canvas');ov.id='alov';w.appendChild(ov);
w.insertAdjacentHTML('afterend','<div class="alrd" id="alrd">–</div><div class="row alwr"><button type="button" id="alt1">⟦ Start here</button><button type="button" id="alt2">End here ⟧</button><button type="button" id="alt3">↺ Full length</button><label style="margin:0;display:flex;align-items:center;gap:4px"><input type="checkbox" id="allp"> 🔁 Loop selection</label></div>');
g('als').step=g('ale').step='0.1';
var P={pos:0,node:null,on:false,raf:0,drag:0,ac:null,last:null};
var T=function(){var a=+g('als').value/100,b=+g('ale').value/100;return[Math.min(a,b),Math.max(a,b)]};
var fm=function(t){t=Math.max(0,t||0);var m=Math.floor(t/60);return m+':'+('0'+(t-m*60).toFixed(1)).slice(-4)};
function dur(){var s=S();return s.src?s.src.duration:0}
function draw(){var W=ov.width=(c0.clientWidth||300)*2,H=ov.height=(c0.clientHeight||120)*2;ov.style.width='100%';ov.style.height=(c0.clientHeight||120)+'px';var x=ov.getContext&&ov.getContext('2d'),t=T(),d=dur();
if(x){x.clearRect(0,0,W,H);if(d){x.fillStyle='rgba(0,0,0,.6)';x.fillRect(0,0,t[0]*W,H);x.fillRect(t[1]*W,0,W-t[1]*W,H);x.fillStyle='#ff7a3d';[t[0],t[1]].forEach(function(f,i){var px=f*W;x.fillRect(px-2,0,4,H);x.fillRect(i?px-16:px,0,16,28);x.fillRect(i?px-16:px,H-28,16,28)});var pp=Math.min(1,Math.max(0,P.pos))*W;x.fillStyle='#fff';x.fillRect(pp-1.5,0,3,H);x.beginPath();x.moveTo(pp-9,0);x.lineTo(pp+9,0);x.lineTo(pp,12);x.fill();if(window.__alDraw)window.__alDraw(x,W,H)}}
g('alrd').textContent=d?((P.on?'▶ ':'')+fm(P.pos*d)+' / '+fm(d)+'   ✂ '+fm(t[0]*d)+' → '+fm(t[1]*d)+'  ('+((t[1]-t[0])*d).toFixed(1)+' s)'):'Choose a file to see its waveform.'}
function clampPos(){var t=T();if(P.pos<t[0]||P.pos>=t[1]-.0005)P.pos=t[0]}
function stop(){P.on=false;cancelAnimationFrame(P.raf);if(P.node){try{P.node.onended=null;P.node.stop()}catch(e){}P.node=null}g('alpl').textContent='▶ Preview';draw()}
function start(){var s=S();if(!s.src)return;stop();var live=!!(window.__alLive&&g('alive')&&g('alive').checked),ab=g('alo').checked||!s.out||live,buf=ab?((window.__alSrc&&!g('alo').checked)?window.__alSrc(s.src):s.src):s.out,ac=s.ac||P.ac||(P.ac=new(window.AudioContext||window.webkitAudioContext)()),t=T(),d=s.src.duration;try{ac.resume()}catch(e){}clampPos();
var map=function(f){return ab?f*buf.duration:(f-t[0])/Math.max(1e-6,t[1]-t[0])*buf.duration},off=map(P.pos),ls=map(t[0]),le=ab?t[1]*buf.duration:buf.duration,lp=g('allp').checked;
var n=ac.createBufferSource();n.buffer=buf;if(live)window.__alLive(ac,n,buf);else n.connect(ac.destination);if(lp){n.loop=true;n.loopStart=ls;n.loopEnd=le;n.start(0,off)}else n.start(0,off,Math.max(.01,le-off));
P.node=n;P.on=true;var t0=ac.currentTime;g('alpl').textContent='■ Stop';
n.onended=function(){if(P.node===n){P.pos=T()[0];stop()}};
(function tick(){if(!P.on||P.node!==n)return;var cur=off+(ac.currentTime-t0);if(lp&&le>ls)cur=ls+((cur-ls)%(le-ls));var f=ab?cur/buf.duration:t[0]+cur/buf.duration*(t[1]-t[0]);P.pos=Math.min(1,Math.max(0,f));draw();P.raf=requestAnimationFrame(tick)})()}
/* replace the old Preview button (drop its handler) */
var old=g('alpl'),nb=old.cloneNode(true);old.parentNode.replaceChild(nb,old);nb.addEventListener('click',function(){if(P.on)stop();else start()});
g('alq').addEventListener('click',stop);window.__alplay={on:function(){return P.on},restart:function(){if(P.on)start()},seek:function(f){var was=P.on;P.pos=Math.min(1,Math.max(0,f));if(was)start();else draw()},pos:function(){return P.pos}};
/* pointer: drag handles / click to seek */
function frac(e){var r=ov.getBoundingClientRect();return Math.min(1,Math.max(0,(e.clientX-r.left)/Math.max(1,r.width)))}
function setT(a,b){g('als').value=(a*100).toFixed(1);g('ale').value=(b*100).toFixed(1);['als','ale'].forEach(function(i){g(i).dispatchEvent(new Event('input'))})}
ov.addEventListener('pointerdown',function(e){if(!dur())return;var f=frac(e),t=T(),r=ov.getBoundingClientRect(),px=24/Math.max(1,r.width),ds=Math.abs(f-t[0]),de=Math.abs(f-t[1]);P.drag=(ds<=px&&ds<=de)?1:(de<=px?2:0);try{ov.setPointerCapture(e.pointerId)}catch(x){}if(!P.drag){var was=P.on;P.pos=f;if(was)start();else draw()}});
ov.addEventListener('pointermove',function(e){if(!P.drag)return;var f=frac(e),t=T(),gap=.002;if(P.drag===1)setT(Math.min(f,t[1]-gap),t[1]);else setT(t[0],Math.max(f,t[0]+gap));if(P.on)clampPos();draw()});
['pointerup','pointercancel'].forEach(function(k){ov.addEventListener(k,function(){if(P.drag&&P.on)start();P.drag=0})});
g('alt1').onclick=function(){var t=T();if(P.pos<t[1]-.002)setT(P.pos,t[1]);draw()};
g('alt2').onclick=function(){var t=T();if(P.pos>t[0]+.002)setT(t[0],P.pos);draw()};
g('alt3').onclick=function(){setT(0,1);P.pos=0;draw()};
g('allp').addEventListener('change',function(){if(P.on)start()});
/* keep in sync with sliders, new files, resize; flag stale processed preview */
M.addEventListener('input',function(e){var id=e.target&&e.target.id;if(id==='als'||id==='ale'){draw()}if(id&&id!=='alps'&&id!=='alo'&&id!=='allp'&&id!=='alib'&&!/^(alx|alzz|rcd|rcn|rcc|alsc|alsw|alsd|alrem|alrp2)$/.test(id)&&S().out&&!P.drag){var n=g('aln');if(n&&!/Settings changed/.test(n.textContent))n.textContent='Settings changed — press ⚡ Process to update the preview.'}},true);
var mo=new MutationObserver(function(){var s=S();if(s.src!==P.last){P.last=s.src;stop();P.pos=T()[0];draw()}});mo.observe(g('aln'),{childList:true,characterData:true,subtree:true});
window.addEventListener('resize',draw);
document.addEventListener('keydown',function(e){if(M.style.display!=='block'||e.code!=='Space')return;var tg=e.target&&e.target.tagName;if(/INPUT|SELECT|TEXTAREA|BUTTON/.test(tg))return;e.preventDefault();if(P.on)stop();else start()});
var ob=document.getElementById('alb');if(ob)ob.addEventListener('click',function(){setTimeout(draw,30)});draw();
}catch(e){try{console.error('Audio Lab step 2',e)}catch(x){}}})();

;
/* ==================== Script 936 id="amiyo-al-s03-live-preview" ==================== */
/* Audio Lab step 3: live preview. High-pass, 3-band EQ, compressor, gain, polarity, stereo width, mono and limiter are heard instantly while playing; A/B original is an instant bypass; output peak meter. Noise reduction, gate, de-esser and loudness still apply when you press Process. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-s3'))return;M.setAttribute('data-s3','1');
var g=function(i){return M.querySelector('#'+i)},lin=function(d){return Math.pow(10,d/20)},G=null,MR=0,lvl=0,PL=function(){return window.__alplay||{on:function(){return false},restart:function(){}}};
var lab=document.createElement('label');lab.style.cssText='margin:0;display:flex;align-items:center;gap:4px;font-size:13px';lab.title='Hear EQ, compressor, gain, width and limiter changes instantly. Noise reduction, gate, de-esser and loudness apply when you press Process.';lab.innerHTML='<input type="checkbox" id="alive" checked> ⚡ Live';g('alpl').parentNode.insertBefore(lab,g('alpl'));
g('alrd').insertAdjacentHTML('afterend','<div style="display:flex;align-items:center;gap:8px;margin-top:4px"><div style="flex:1;height:8px;background:#2a2620;border-radius:4px;overflow:hidden"><div id="almb" style="height:100%;width:0;background:#6bd36b"></div></div><span id="almv" style="font:11px monospace;color:#b9b2a2;min-width:92px;text-align:right">out −∞ dB</span></div>');
function gn(ac,v){var x=ac.createGain();x.gain.value=v;return x}
window.__alLive=function(ac,n,buf){var hp=ac.createBiquadFilter();hp.type='highpass';hp.Q.value=.707;var ls=ac.createBiquadFilter();ls.type='lowshelf';ls.frequency.value=100;var pk=ac.createBiquadFilter();pk.type='peaking';pk.frequency.value=1000;pk.Q.value=1;var hs=ac.createBiquadFilter();hs.type='highshelf';hs.frequency.value=8000;
var cp=ac.createDynamicsCompressor();cp.knee.value=(window.__alCP?window.__alCP.k:6);cp.attack.value=(window.__alCP?window.__alCP.a:.01);cp.release.value=(window.__alCP?window.__alCP.r:.15);(window.__alHum?window.__alHum(ac,n):n).connect(hp);hp.connect(ls);ls.connect(pk);pk.connect(hs);hs.connect(cp);var last=cp,sL=null,sR=null;
if(buf.numberOfChannels>1){var sp=ac.createChannelSplitter(2),mg=ac.createChannelMerger(2),mid=gn(ac,1),side=gn(ac,1),inv=gn(ac,-1),mL=gn(ac,.5),mR=gn(ac,.5);sL=gn(ac,.5);sR=gn(ac,-.5);cp.connect(sp);sp.connect(mL,0);sp.connect(mR,1);sp.connect(sL,0);sp.connect(sR,1);mL.connect(mid);mR.connect(mid);sL.connect(side);sR.connect(side);mid.connect(mg,0,0);side.connect(mg,0,0);mid.connect(mg,0,1);side.connect(inv);inv.connect(mg,0,1);last=mg}
var gg=gn(ac,1),lim=ac.createDynamicsCompressor();lim.knee.value=0;lim.ratio.value=20;lim.attack.value=.001;lim.release.value=.08;last.connect(gg);gg.connect(lim);
var wet=gn(ac,1),dry=gn(ac,0),an=ac.createAnalyser();an.fftSize=1024;lim.connect(wet);n.connect(dry);wet.connect(an);dry.connect(an);an.connect(ac.destination);
G={ac:ac,hp:hp,ls:ls,pk:pk,hs:hs,cp:cp,sL:sL,sR:sR,gg:gg,lim:lim,wet:wet,dry:dry,an:an};upd();kick();window.__alG=function(){return G}};
function upd(){if(!G)return;var t=G.ac.currentTime,v=function(i){return+g(i).value},sa=function(p,x){try{p.setTargetAtTime(x,t,.02)}catch(e){p.value=x}};
sa(G.hp.frequency,Math.max(10,v('alh')));sa(G.ls.gain,v('aq1'));sa(G.pk.gain,v('aq2'));sa(G.hs.gain,v('aq3'));var ct=v('alct');sa(G.cp.threshold,ct<0?ct:0);sa(G.cp.ratio,ct<0?v('alcr'):1);
sa(G.gg.gain,lin(v('ala'))*(g('alp').checked?-1:1));sa(G.lim.threshold,v('alk'));var wd=g('alm1').checked?0:v('alw')/100;if(G.sL){sa(G.sL.gain,.5*wd);sa(G.sR.gain,-.5*wd)}var by=g('alo').checked;sa(G.wet.gain,by?0:1);sa(G.dry.gain,by?1:0)}
M.addEventListener('input',function(e){upd();var id=e.target&&e.target.id,lv=g('alive');if(lv&&!lv.checked&&id&&!/^(alo|allp|alive|alib|alf|als|ale)$/.test(id)){lv.checked=true;g('aln').textContent='Live preview on — tweaks are heard instantly. Noise reduction, gate, de-esser and loudness apply when you press ⚡ Process.';PL().restart()}},true);
M.addEventListener('change',function(e){upd();if(e.target&&e.target.id==='alive')PL().restart()},true);g('alps').addEventListener('change',function(){setTimeout(upd,0)});
new MutationObserver(function(){var n=g('aln');if(n.textContent==='Done. Preview or export.'){g('alive').checked=false;n.textContent='Done. Previewing the processed audio — move any control to go back to Live.';PL().restart()}}).observe(g('aln'),{childList:true,characterData:true,subtree:true});
function kick(){if(MR)return;var b=new Float32Array(1024);(function f(){MR=0;if(M.style.display!=='block')return;var pk=0;if(G&&PL().on()){try{G.an.getFloatTimeDomainData(b);for(var i=0;i<b.length;i++){var a=b[i]<0?-b[i]:b[i];if(a>pk)pk=a}}catch(e){}}lvl=Math.max(pk,lvl*.92);var d=lvl>1e-5?20*Math.log10(lvl):-99,bar=g('almb');bar.style.width=Math.max(0,Math.min(100,(d+60)/60*100))+'%';bar.style.background=d>-1?'#e5484d':d>-6?'#ff7a3d':'#6bd36b';g('almv').textContent='out '+(d<-90?'−∞':d.toFixed(1).replace('-','−'))+' dB';MR=requestAnimationFrame(f)})()}
var ob=document.getElementById('alb');if(ob)ob.addEventListener('click',function(){setTimeout(kick,40)});
}catch(e){try{console.error('Audio Lab step 3',e)}catch(x){}}})();

;
/* ==================== Script 937 id="amiyo-al-s04-presets" ==================== */
/* Audio Lab step 4: 10 more voice presets (grouped), plus "My presets": save current settings by name, delete, export/import as a .json file. Stored in this browser. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-s4'))return;M.setAttribute('data-s4','1');
var g=function(i){return M.querySelector('#'+i)},KEY='amiyoAlUserPresets',sel=g('alps');
var BASE={aldn:0,alh:0,alg:-80,ala:0,alfd:0,aq1:0,aq2:0,aq3:0,alct:0,alcr:3,ades:0,alw:100,alt:'',alk:'-1',alm1:false};
var B={
 intv:['🎤 Interview / dialogue',{aldn:35,alh:90,alg:-55,aq1:-1,aq2:2,aq3:1.5,alct:-24,alcr:3,ades:-26,alt:'-16'}],
 narr:['📖 Narration / audiobook',{aldn:30,alh:70,alg:-58,aq1:1,aq2:1.5,aq3:1,alct:-20,alcr:2.5,ades:-30,alt:'-18'}],
 vo:['🎬 Voice-over for video',{aldn:40,alh:80,alg:-50,aq2:2.5,aq3:2.5,alct:-22,alcr:3.5,ades:-28,alt:'-16'}],
 yt:['▶ YouTube / streaming voice',{aldn:35,alh:80,alg:-52,aq1:0.5,aq2:2,aq3:2,alct:-22,alcr:3,ades:-28,alt:'-14'}],
 rad:['📻 Radio / broadcast',{aldn:30,alh:90,alg:-55,aq1:2,aq2:2,aq3:3,alct:-26,alcr:4,ades:-28,alt:'-23'}],
 call:['📞 Phone / call clean-up',{aldn:55,alh:100,alg:-52,aq1:-2,aq2:3,aq3:-2,alct:-24,alcr:4,ades:-30,alt:'-16',alm1:true}],
 room:['🏠 Noisy room rescue',{aldn:80,alh:140,alg:-45,aq2:2,aq3:1,alct:-24,alcr:4,ades:-28,alt:'-16'}],
 warm:['🔥 Warm / deep voice',{aldn:25,alh:60,alg:-58,aq1:4,aq2:-1,aq3:-2,alct:-20,alcr:2.5,ades:-26,alt:'-16'}],
 bri:['✨ Bright / clear voice',{aldn:25,alh:80,alg:-58,aq1:-2,aq2:2,aq3:4,alct:-22,alcr:3,ades:-24,alt:'-16'}],
 muf:['🧣 Muffled voice fix',{aldn:25,alh:90,alg:-58,aq1:-3,aq2:1,aq3:6,alct:-22,alcr:3,ades:-28,alt:'-16'}],
 hrs:['🪥 Harsh / sibilant fix',{aldn:20,alh:80,alg:-60,aq1:0,aq2:0,aq3:-3,alct:-20,alcr:2.5,ades:-36,alt:'-16'}]};
var ORIG={pod:1,mus:1,cln:1,rst:1};
var at=g('alt');if(!at.querySelector('option[value="-18"]')){var o=document.createElement('option');o.value='-18';o.textContent='−18 LUFS (audiobook / voice-over)';at.insertBefore(o,at.querySelector('option[value="-16"]').nextSibling)}
var NOSAVE={alf:1,alib:1,alps:1,alpn:1,alpif:1,als:1,ale:1,alsq:1,rcd:1,aljf:1,aldkf:1,alrem:1,alfast:1,alive:1,alo:1,allp:1,alzz:1,alsc:1,alsw:1,alsd:1};
function allEls(){return[].filter.call(M.querySelectorAll('input[id],select[id]'),function(e){var t=(e.type||'').toLowerCase();return !NOSAVE[e.id]&&!e.hasAttribute('data-e')&&!/^(rc|al8)/.test(e.id)&&(t==='range'||t==='checkbox'||t==='number'||e.tagName==='SELECT'||(t==='hidden'&&/^eqb\d$/.test(e.id)))})}
function snapAll(){var o={};allEls().forEach(function(e){o[e.id]=e.type==='checkbox'?(e.checked?1:0):String(e.value)});return o}
function putAll(all){var n=0;if(!all||typeof all!=='object')return 0;allEls().forEach(function(e){if(!(e.id in all))return;var v=all[e.id],ch=false;
 if(e.type==='checkbox'){var c=!!+v;if(e.checked!==c){e.checked=c;ch=true}}
 else if(e.type==='hidden'){v=String(v);if(/^[a-z]+,[\d.]+,-?[\d.]+,[\d.]+$/.test(v)&&e.value!==v){e.value=v;ch=true}}
 else if(e.tagName==='SELECT'){v=String(v);var ok=false;for(var i=0;i<e.options.length;i++)if(e.options[i].value===v)ok=true;if(ok&&e.value!==v){e.value=v;ch=true}}
 else{var x=+v;if(isFinite(x)){if(e.min!==''&&x<+e.min)x=+e.min;if(e.max!==''&&x>+e.max)x=+e.max;if(+e.value!==x){e.value=String(x);ch=true}}}
 if(ch){n++;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))}});return n}
function cleanAll(a){var o={},k;if(!a||typeof a!=='object'||Array.isArray(a))return null;var n=0;for(k in a){if(!/^[A-Za-z0-9_]{1,24}$/.test(k)||n>400)continue;var v=a[k];if(typeof v==='number'||typeof v==='boolean')v=+v;else if(typeof v==='string')v=v.slice(0,60);else continue;o[k]=v;n++}return n?o:null}
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return{}}}
function store(u){try{localStorage.setItem(KEY,JSON.stringify(u));return true}catch(e){return false}}
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
function build(pick){var u=load(),h='<option value="">Choose a preset…</option><optgroup label="Voice">'+'<option value="pod">🎙 Podcast voice</option>'+Object.keys(B).map(function(k){return'<option value="'+k+'">'+esc(B[k][0])+'</option>'}).join('')+'</optgroup><optgroup label="Music &amp; utility"><option value="mus">🎵 Music master</option><option value="cln">🧹 Clean-up</option><option value="rst">↺ Reset all</option></optgroup>';var ks=Object.keys(u);if(ks.length)h+='<optgroup label="My presets">'+ks.map(function(k){return'<option value="u:'+esc(k)+'">⭐ '+esc(k)+'</option>'}).join('')+'</optgroup>';sel.innerHTML=h;sel.value=pick||''}
function setv(id,v){var e=g(id);if(!e)return;if(e.type==='checkbox'){e.checked=!!v;e.dispatchEvent(new Event('change'));return}if(e.type==='range'){v=Math.min(+e.max,Math.max(+e.min,+v))}else if(e.tagName==='SELECT'){var ok=false;for(var i=0;i<e.options.length;i++)if(e.options[i].value===String(v))ok=true;if(!ok)return}e.value=v;e.dispatchEvent(new Event('input'))}
function apply(vals,name){var all=Object.assign({},BASE,vals);Object.keys(BASE).forEach(function(k){setv(k,all[k])});g('aln').textContent='Preset “'+name+'” applied. Live preview is on; press ⚡ Process for noise reduction, gate and de-esser.'}
sel.insertAdjacentHTML('afterend','<div class="row" id="alpr"><input id="alpn" type="text" maxlength="40" placeholder="Name to save current settings" style="flex:1;min-width:120px;background:#1d1b17;color:#f1ece2;border:1px solid #3a352c;border-radius:8px;padding:8px;font-size:14px"><button type="button" id="alpsv">💾 Save</button><button type="button" id="alpdl" title="Delete the selected preset of yours">🗑</button><button type="button" id="alpex" title="Export my presets">⬇</button><button type="button" id="alpim" title="Import presets">⬆</button><input type="file" id="alpif" accept=".json,application/json" style="display:none"></div>');
build();
sel.addEventListener('change',function(){var v=sel.value;if(!v)return;if(ORIG[v]){setTimeout(function(){g('aln').textContent='Preset applied. Live preview is on; press ⚡ Process for noise reduction, gate and de-esser.'},0);return}if(v.slice(0,2)==='u:'){var n=v.slice(2),u=load();if(u[n]){apply(u[n],n);var al=cleanAll(u[n].all);if(al){var k=putAll(al);g('aln').textContent='Preset “'+n+'” applied (all settings, '+k+' control'+(k===1?'':'s')+' changed). Live preview is on; press ⚡ Process for noise reduction, gate and de-esser.'}g('alpn').value=n}return}if(B[v])apply(B[v][1],B[v][0].replace(/^\S+\s/,''))});
g('alpsv').addEventListener('click',function(){var n=g('alpn').value.trim();if(!n){g('aln').textContent='Type a name for your preset first.';return}var u=load(),v={};Object.keys(BASE).forEach(function(k){var e=g(k);v[k]=e.type==='checkbox'?e.checked:e.value});var had=n in u;v.all=snapAll();u[n]=v;g('aln').textContent=store(u)?(had?'Updated “'+n+'” (replaced the older version).':'Saved “'+n+'” in My presets.')+' It keeps all your settings except the trim and file choice.':'Could not save (browser storage is blocked).';build('u:'+n)});
var arm=0;g('alpdl').addEventListener('click',function(){var v=sel.value;if(v.slice(0,2)!=='u:'){g('aln').textContent='Select one of your presets (⭐) to delete it.';return}if(!arm){arm=1;this.textContent='Sure?';var t=this;setTimeout(function(){arm=0;t.textContent='🗑'},3000);return}arm=0;this.textContent='🗑';var u=load();delete u[v.slice(2)];store(u);build();g('aln').textContent='Deleted “'+v.slice(2)+'”.'});
g('alpex').addEventListener('click',function(){var u=load();if(!Object.keys(u).length){g('aln').textContent='No presets of yours to export yet.';return}var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(u,null,1)],{type:'application/json'}));a.download='audio-lab-presets.json';document.body.appendChild(a);a.click();setTimeout(function(){a.remove()},500)});
g('alpim').addEventListener('click',function(){g('alpif').click()});
g('alpif').addEventListener('change',function(){var f=this.files[0],inp=this;if(!f)return;f.text().then(function(t){var d=JSON.parse(t),u=load(),n=0;Object.keys(d).forEach(function(k){var s=d[k],c={};if(!s||typeof s!=='object')return;Object.keys(BASE).forEach(function(q){if(q in s)c[q]=s[q]});var ca=cleanAll(s.all);if(ca)c.all=ca;u[String(k).slice(0,40)]=c;n++});store(u);build();g('aln').textContent='Imported '+n+' preset'+(n===1?'':'s')+'.';inp.value=''}).catch(function(){g('aln').textContent='That file is not a valid presets file.'})});
}catch(e){try{console.error('Audio Lab step 4',e)}catch(x){}}})();

;
/* ==================== Script 938 id="amiyo-al-s05-pitch-speed" ==================== */
/* Audio Lab step 5: Pitch (semitones, length unchanged) and Speed (%, pitch unchanged) using WSOLA time-stretch + cubic resampling. Applied by Process; the live preview renders a cached pitch/speed version in the background. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-s5'))return;M.setAttribute('data-s5','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}},nap=function(){return new Promise(function(r){setTimeout(r,0)})};
function hann(N){var w=new Float32Array(N);for(var i=0;i<N;i++)w[i]=.5-.5*Math.cos(2*Math.PI*i/N);return w}
async function wsola(ch,alpha,sr,prog,tok){var L=ch[0].length,N=sr>=32000?2048:1024,Hs=N>>1,Ha=Hs/alpha,tol=N>>2,w=hann(N),nf=Math.ceil(L*alpha/Hs),oL=Math.ceil(L*alpha)+N,nc=ch.length,out=[],mono=new Float32Array(L),c,i,m;
for(c=0;c<nc;c++){out.push(new Float32Array(oL));var x0=ch[c];for(i=0;i<L;i++)mono[i]+=x0[i]/nc}
for(c=0;c<nc;c++){var x=ch[c],o=out[c];for(i=0;i<N&&i<L;i++)o[i]+=(i<Hs?1:w[i])*x[i]}
var prev=0;for(m=1;m<nf;m++){var tp=Math.round(m*Ha);if(tp>=L)break;var nat=prev+Hs,best=-1e30,bc=tp;
for(var d=-tol;d<=tol;d+=(window.__alFast?4:2)){var cs=tp+d;if(cs<0||cs>=L)continue;var dot=0,e=1e-9;for(i=0;i<N;i+=4){var a=nat+i<L?mono[nat+i]:0,b=cs+i<L?mono[cs+i]:0;dot+=a*b;e+=b*b}var sc=dot/Math.sqrt(e);if(sc>best){best=sc;bc=cs}}
if(best<=1e-12)bc=tp;prev=bc;var oo=m*Hs;for(c=0;c<nc;c++){var xx=ch[c],oc=out[c];for(i=0;i<N&&bc+i<L;i++)oc[oo+i]+=w[i]*xx[bc+i]}
if((m&31)===0){if(tok&&tok.c)return null;if(prog)prog(m/nf);await nap()}}
return out.map(function(o){return o.subarray(0,Math.floor(L*alpha))})}
function rs(x,rho){var n=Math.max(1,Math.floor((x.length-1)/rho)),y=new Float32Array(n),L=x.length;for(var i=0;i<n;i++){var p=i*rho,k=Math.floor(p),f=p-k,y0=k>0?x[k-1]:0,y1=x[k],y2=k+1<L?x[k+1]:0,y3=k+2<L?x[k+2]:0;y[i]=y1+.5*f*(y2-y0+f*(2*y0-5*y1+4*y2-y3+f*(3*(y1-y2)+y3-y0)))}return y}
async function tpBuffer(buf,semi,T,prog,tok){var rho=Math.pow(2,semi/12),alpha=rho/T,x=[],c;for(c=0;c<buf.numberOfChannels;c++)x.push(buf.getChannelData(c));
if(Math.abs(alpha-1)>1e-4){x=await wsola(x,alpha,buf.sampleRate,prog,tok);if(!x)return null}
if(Math.abs(rho-1)>1e-4)x=x.map(function(a){return rs(a,rho)});
var nb=new AudioBuffer({numberOfChannels:x.length,length:x[0].length,sampleRate:buf.sampleRate});for(c=0;c<x.length;c++)nb.copyToChannel(x[c],c);return nb}
window.__alDSP={tp:tpBuffer};
/* UI */
var secs=M.querySelectorAll('details.alsec'),d=document.createElement('details');d.className='alsec';
d.innerHTML='<summary><span>🎼 Pitch &amp; speed</span><i></i></summary><div class="alin"><label>Pitch (semitones, length unchanged): <b>0</b></label><input type="range" id="alpt" min="-12" max="12" step="0.1" value="0"><label>Speed (%, pitch stays natural): <b>100</b></label><input type="range" id="alsx" min="50" max="200" step="1" value="100"><div class="row"><button type="button" data-p="-3,100">Deeper −3</button><button type="button" data-p="3,100">Higher +3</button><button type="button" data-p="0,90">Slower 90%</button><button type="button" data-p="0,115">Faster 115%</button><button type="button" data-p="0,100">↺ Reset</button></div><div style="font-size:11px;color:#b9b2a2;margin-top:6px">Pitch moves the whole voice, so keep it within ±4 semitones for a natural sound. Applied when you press ⚡ Process; Live preview renders it in the background (a few seconds).</div></div>';
var anchor=secs[1]||secs[secs.length-1];anchor.parentNode.insertBefore(d,anchor.nextSibling);
var badge=d.querySelector('summary i');
function params(){return[+g('alpt').value,+g('alsx').value/100]}
function ui(){['alpt','alsx'].forEach(function(i){var b=g(i).previousElementSibling.querySelector('b');if(b)b.textContent=g(i).value});var p=params();badge.textContent=(p[0]!==0||p[1]!==1)?'● active':''}
d.addEventListener('input',function(){ui();sched()});
d.querySelectorAll('button[data-p]').forEach(function(b){b.onclick=function(){var v=b.getAttribute('data-p').split(',');g('alpt').value=v[0];g('alsx').value=v[1];g('alpt').dispatchEvent(new Event('input'));g('alsx').dispatchEvent(new Event('input'))}});
var C={src:null,s:0,sp:1,buf:null,tok:null,tm:0};
function same(src,p){return C.buf&&C.src===src&&C.s===p[0]&&C.sp===p[1]}
function sched(){clearTimeout(C.tm);C.tm=setTimeout(render,450)}
g('alr').addEventListener('click',function(){clearTimeout(C.tm);if(C.tok)C.tok.c=true},true);
async function render(){var s=S(),p=params();if(!s.src||(p[0]===0&&p[1]===1)||same(s.src,p))return;if(C.tok)C.tok.c=true;var tok=C.tok={c:false},src=s.src;
try{var b=await tpBuffer(src,p[0],p[1],function(f){if(!tok.c)g('aln').textContent='Rendering pitch/speed preview… '+Math.round(f*100)+'%'},tok);if(!b||tok.c)return;C.src=src;C.s=p[0];C.sp=p[1];C.buf=b;if(/^Rendering pitch/.test(g('aln').textContent))g('aln').textContent='Pitch/speed preview ready.';if(window.__alplay)window.__alplay.restart()}catch(e){g('aln').textContent='Pitch/speed preview failed: '+e.message}}
window.__alSrc=function(src){var p=params();if(p[0]===0&&p[1]===1)return src;if(same(src,p))return C.buf;sched();return src};
window.__alPitch=window.__alTP=async function(r){var p=params();if(p[0]===0&&p[1]===1)return r;var b=await tpBuffer(r,p[0],p[1],function(f){g('aln').textContent='Changing pitch/speed… '+Math.round(f*100)+'%'},window.__alTok||null);return b||r};
var ps=g('alps');if(ps)ps.addEventListener('change',function(){if(/^(rst)$/.test(ps.value)){setTimeout(function(){g('alpt').value=0;g('alsx').value=100;ui()},0)}});
ui();
}catch(e){try{console.error('Audio Lab step 5',e)}catch(x){}}})();

;
/* ==================== Script 939 id="amiyo-al-s06-noise-hum" ==================== */
/* Audio Lab step 6: noise sample capture (noise reduction learns from a stretch you pick), 50/60 Hz hum remover with auto-detect (live + Process), click/pop remover (Process). */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-s6'))return;M.setAttribute('data-s6','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}},NF=2048,HW=new Float32Array(NF),NP=null;
for(var q=0;q<NF;q++)HW[q]=.5-.5*Math.cos(2*Math.PI*q/NF);
function fft(re,im){var n=re.length,j=0;for(var i=1;i<n;i++){var b=n>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){var t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t}}for(var len=2;len<=n;len<<=1){var a=-2*Math.PI/len,wr=Math.cos(a),wi=Math.sin(a),h=len>>1;for(var s=0;s<n;s+=len){var cr=1,ci=0;for(var k=0;k<h;k++){var u=s+k,v=u+h,xr=re[v]*cr-im[v]*ci,xi=re[v]*ci+im[v]*cr;re[v]=re[u]-xr;im[v]=im[u]-xi;re[u]+=xr;im[u]+=xi;var t2=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=t2}}}}
/* noise profile: mean magnitude spectrum (same framing as the built-in denoiser) */
function profile(buf,t0,t1){var d=buf.getChannelData(0),sr=buf.sampleRate,s0=Math.max(0,Math.floor(t0*sr)),s1=Math.min(d.length,Math.floor(t1*sr)),B=NF/2+1,acc=new Float32Array(B),re=new Float32Array(NF),im=new Float32Array(NF),c=0,k;for(var o=s0;o+NF<=s1;o+=NF/4){for(k=0;k<NF;k++){re[k]=d[o+k]*HW[k];im[k]=0}fft(re,im);for(k=0;k<B;k++)acc[k]+=Math.sqrt(re[k]*re[k]+im[k]*im[k]);c++}if(c<3)return null;for(k=0;k<B;k++)acc[k]/=c;return acc}
/* hum detection on the long-term spectrum */
function detect(buf){var d=buf.getChannelData(0),sr=buf.sampleRate,N=16384;if(d.length<N*2)return null;var F=Math.min(60,Math.floor((d.length-N)/N)+1),P=new Float64Array(N/2+1),re=new Float32Array(N),im=new Float32Array(N),w=new Float32Array(N),k,f;for(k=0;k<N;k++)w[k]=.5-.5*Math.cos(2*Math.PI*k/N);
for(f=0;f<F;f++){var o=F>1?Math.floor(f*(d.length-N)/(F-1)):0;for(k=0;k<N;k++){re[k]=d[o+k]*w[k];im[k]=0}fft(re,im);for(k=0;k<=N/2;k++)P[k]+=re[k]*re[k]+im[k]*im[k]}
var T=0;for(k=0;k<=N/2;k++)T+=P[k];var bw=sr/N;function ratio(fr){var kc=Math.round(fr/bw),pk=0,nb=[];for(k=kc-1;k<=kc+1;k++)if(P[k]>pk)pk=P[k];for(k=Math.round((fr-25)/bw);k<=Math.round((fr-6)/bw);k++)if(k>0)nb.push(P[k]);for(k=Math.round((fr+6)/bw);k<=Math.round((fr+25)/bw);k++)nb.push(P[k]);nb.sort(function(a,b){return a-b});var md=nb[nb.length>>1]||1e-20;return pk/T>3e-4?pk/(md+1e-20):0}
var best=null;[50,60].forEach(function(fr){var r=[ratio(fr),ratio(2*fr),ratio(3*fr)].sort(function(a,b){return b-a}),sc=(r[0]+r[1])/2;if(r[0]>4&&sc>4&&(!best||sc>best.sc))best={f:fr,sc:sc}});return best}
/* offline filters */
function notch(d,f,sr,Q){var w0=2*Math.PI*f/sr,al=Math.sin(w0)/(2*Q),a0=1+al,b0=1/a0,b1=-2*Math.cos(w0)/a0,a1=b1,a2=(1-al)/a0,x1=0,x2=0,y1=0,y2=0;for(var i=0;i<d.length;i++){var x=d[i],y=b0*x+b1*x1+b0*x2-a1*y1-a2*y2;x2=x1;x1=x;y2=y1;y1=y;d[i]=y}}
function hum(d,F,sr){var N=Math.min(d.length,Math.round(sr*.8)),W=Math.min(Math.round(sr*.6),N);if(N<sr*.1){for(var k=1;k<=4;k++)if(F*k<sr*.45)notch(d,F*k,sr,25);return}var t=new Float32Array(W+d.length),i,k;/* step 6: measure the hum in the first 0.8 s and extend it backwards, so the notch is already settled at the first sample */for(k=1;k<=4;k++){var f=F*k;if(f>=sr*.45)continue;var w=2*Math.PI*f/sr,c=0,sn=0;for(i=0;i<N;i++){c+=d[i]*Math.cos(w*i);sn+=d[i]*Math.sin(w*i)}c*=2/N;sn*=2/N;for(i=0;i<W;i++){var tt=i-W;t[i]+=c*Math.cos(w*tt)+sn*Math.sin(w*tt)}}t.set(d,W);for(k=1;k<=4;k++)if(F*k<sr*.45)notch(t,F*k,sr,25);for(i=0;i<d.length;i++)d[i]=t[W+i]}
function declick(d,K,sr){var n=d.length,a=Math.exp(-1/(sr*.01)),maxL=Math.round(sr*.0006)+8,env=0,i,cd=0,run=0,last=-1e9,fixed=0;if(n<400)return 0;for(i=2;i<202;i++)env+=Math.abs(d[i]-2*d[i-1]+d[i-2])/200;i=2;
while(i<n-maxL-3){var h=d[i]-2*d[i-1]+d[i-2],ah=h<0?-h:h;if(cd>0){cd--;env=a*env+(1-a)*ah;i++;continue}
if(ah>K*env+.01){if(i-last<100)run++;else run=0;last=i;if(run>=3){cd=2048;run=0;i++;continue}var j=i;while(j<i+maxL){var hj=Math.abs(d[j+1]-2*d[j]+d[j-1]);if(hj<=K*env*.4&&j>i+1)break;j++}var x0=d[i-2],x1=d[j+1],L=j+1-(i-2);for(var m=i-1;m<=j;m++)d[m]=x0+(x1-x0)*(m-(i-2))/L;fixed++;env=a*env+(1-a)*Math.min(ah,K*env);i=j+2;continue}
env=a*env+(1-a)*ah;i++}return fixed}
window.__alDSP2={profile:profile,detect:detect,hum:hum,declick:declick};
/* UI */
var secs=M.querySelectorAll('details.alsec'),d=document.createElement('details');d.className='alsec';
d.innerHTML='<summary><span>🧼 Noise, hum &amp; clicks</span><i></i></summary><div class="alin"><div id="alnpi" style="font-size:12px;color:#b9b2a2;margin-top:8px">Noise sample: none — using the quietest 10% of the file.</div><div class="row"><button type="button" id="alnl1">🎯 Learn noise from selection</button><button type="button" id="alnl2">First 1 s</button><button type="button" id="alnc">✖ Clear</button></div><div style="font-size:11px;color:#b9b2a2;margin-top:6px">Drag the waveform handles around a stretch with only room noise (no speaking), press Learn, then raise Noise reduction in Clean-up. The trim resets to full length afterwards.</div><label>Hum remover (mains buzz + harmonics)</label><select id="alhm"><option value="0">Off</option><option value="50">50 Hz (India / Europe)</option><option value="60">60 Hz (USA)</option></select><div class="row"><button type="button" id="alhd">🔎 Auto-detect hum</button></div><label>Click / pop remover (applied by Process)</label><select id="alck"><option value="0">Off</option><option value="14">Gentle</option><option value="8">Strong</option></select></div>';
secs[0].parentNode.insertBefore(d,secs[0].nextSibling);
var badge=d.querySelector('summary i'),info=g('alnpi');
function ui(){var n=(NP?1:0)+(g('alhm').value!=='0'?1:0)+(g('alck').value!=='0'?1:0);badge.textContent=n?'● '+n+' active':'';info.textContent=NP&&S().src===NP.src?'Noise sample: '+NP.t0.toFixed(2)+' s → '+NP.t1.toFixed(2)+' s (blue band on the waveform)':'Noise sample: none — using the quietest 10% of the file.'}
function setT(a,b){g('als').value=(a*100).toFixed(1);g('ale').value=(b*100).toFixed(1);['als','ale'].forEach(function(i){g(i).dispatchEvent(new Event('input'))})}
function noiseOK(b,t0,t1){try{var d=b.getChannelData(0),sr=b.sampleRate,bl=Math.round(sr*.05),nb=Math.floor(d.length/bl);if(nb<12)return true;var P=new Float32Array(nb),i,k;for(k=0;k<nb;k++){var q=0;for(i=k*bl;i<(k+1)*bl;i++)q+=d[i]*d[i];P[k]=q/bl}var A=Array.prototype.slice.call(P).filter(function(x){return x>1e-12}).sort(function(x,y){return x-y});if(A.length<10)return true;var fl=A[Math.floor(A.length*.1)],a0=Math.floor(t0*sr/bl),a1=Math.min(nb,Math.ceil(t1*sr/bl)),m=0,c=0;for(k=a0;k<a1;k++){m+=P[k];c++}if(!c)return true;m/=c;return 10*Math.log10(m/fl+1e-12)<15}catch(e){return true}}
function learn(t0,t1){var s=S();if(!s.src){g('aln').textContent='Choose a file first.';return}if(t1-t0<.2){g('aln').textContent='Pick at least 0.2 s of pure noise.';return}var p=profile(s.src,t0,t1);if(!p){g('aln').textContent='That stretch is too short to learn from.';return}if(!noiseOK(s.src,t0,t1)){g('aln').textContent='That stretch has speech or music in it, not just room noise, so it would damage your voice. Drag the handles around a quieter stretch, or press “Auto-pick quietest part”.';return}NP={src:s.src,t0:t0,t1:t1,mag:p};setT(0,1);var dn=g('aldn');if(+dn.value===0){dn.value=60;dn.dispatchEvent(new Event('input'))}g('aln').textContent='Noise learned from '+t0.toFixed(2)+'–'+t1.toFixed(2)+' s. Noise reduction is set to '+dn.value+'% — press ⚡ Process.';ui();window.dispatchEvent(new Event('resize'))}
g('alnl1').onclick=function(){var s=S();if(!s.src){g('aln').textContent='Choose a file first.';return}var D=s.src.duration,a=+g('als').value/100,b=+g('ale').value/100;if(b-a>.95){g('aln').textContent='First drag the waveform handles around a stretch of noise only, then press Learn.';return}learn(Math.min(a,b)*D,Math.max(a,b)*D)};
g('alnl2').onclick=function(){var s=S();if(!s.src){g('aln').textContent='Choose a file first.';return}learn(0,Math.min(1,s.src.duration*.5))};
g('alnc').onclick=function(){NP=null;ui();window.dispatchEvent(new Event('resize'));g('aln').textContent='Noise sample cleared — using the quietest 10% of the file.'};
g('alhd').onclick=function(){var s=S();if(!s.src){g('aln').textContent='Choose a file first.';return}g('aln').textContent='Looking for hum…';setTimeout(function(){var r=detect(s.src);if(!r){g('aln').textContent=s.src.length<32768?'File is too short to check for hum.':'No clear 50/60 Hz hum found.';return}var h=g('alhm');h.value=String(r.f);h.dispatchEvent(new Event('input'));h.dispatchEvent(new Event('change'));g('aln').textContent='Hum found at '+r.f+' Hz (with harmonics). Hum remover set to '+r.f+' Hz.'},20)};
d.addEventListener('input',ui);d.addEventListener('change',ui);
g('alhm').addEventListener('change',function(){if(window.__alplay)window.__alplay.restart()});
var ps=g('alps');ps.addEventListener('change',function(){if(ps.value==='rst')setTimeout(function(){g('alhm').value='0';g('alck').value='0';ui()},0)});
/* hooks: denoiser profile, waveform band, live notch chain, Process */
window.__alNZ=function(){return NP&&S().src===NP.src?NP.mag:null};
window.__alDraw=function(x,W,H){var s=S();if(!NP||s.src!==NP.src||!s.src)return;var D=s.src.duration;x.fillStyle='rgba(255,138,80,.3)';x.fillRect(NP.t0/D*W,0,Math.max(2,(NP.t1-NP.t0)/D*W),H);x.fillStyle='#ffb48e';x.font='20px sans-serif';x.fillText('noise',NP.t0/D*W+4,H-8)};
window.__alHum=function(ac,n){var F=+g('alhm').value;if(!F)return n;var last=n;for(var k=1;k<=4;k++){if(F*k>ac.sampleRate*.45)break;var b=ac.createBiquadFilter();b.type='notch';b.frequency.value=F*k;b.Q.value=25;last.connect(b);last=b}return last};
var prev=window.__alTP;window.__alTP=async function(r){var F=+g('alhm').value,K=+g('alck').value,sr=r.sampleRate,c,nfix=0;if(F||K){for(c=0;c<r.numberOfChannels;c++){var dd=r.getChannelData(c);if(F)hum(dd,F,sr);if(K)nfix+=declick(dd,K,sr)}if(K)g('aln').textContent='Removed '+nfix+' click'+(nfix===1?'':'s')+'…'}return window.__alRest?window.__alRest(r):(prev?prev(r):r)};
new MutationObserver(function(){if(NP&&S().src!==NP.src){NP=null;ui()}}).observe(g('aln'),{childList:true,characterData:true,subtree:true});
ui();
}catch(e){try{console.error('Audio Lab step 6',e)}catch(x){}}})();

;
/* ==================== Script 940 id="amiyo-al-s07-level-silence" ==================== */
/* Audio Lab step 7: auto-level voice (evens loud/quiet words around the file's own typical level), pause remover (shorten long silences, shown on the waveform), one-tap peak normalize. Applied by Process. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-s7'))return;M.setAttribute('data-s7','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}};
function chans(b){var a=[];for(var c=0;c<b.numberOfChannels;c++)a.push(b.getChannelData(c));return a}
function mkBuf(x,sr){var nb=new AudioBuffer({numberOfChannels:x.length,length:x[0].length,sampleRate:sr});for(var c=0;c<x.length;c++)nb.copyToChannel(x[c],c);return nb}
/* pauses: runs of quiet 10 ms blocks at least minLen long -> [[startSample,endSample]] */
function pauses(b,thr,minLen){var x=chans(b),sr=b.sampleRate,n=b.length,bl=Math.round(sr*.01),nb=Math.floor(n/bl),res=[],run=-1,need=Math.ceil(minLen/.01),th=Math.pow(10,thr/10);
for(var k=0;k<=nb;k++){var q=false;if(k<nb){var ms=0;for(var c=0;c<x.length;c++){var d=x[c],s=0;for(var i=k*bl;i<(k+1)*bl;i++)s+=d[i]*d[i];ms+=s/bl}q=ms/x.length<th}
if(q){if(run<0)run=k}else if(run>=0){if(k-run>=need)res.push([run*bl,k*bl]);run=-1}}return res}
function removePauses(b,thr,minLen,keep){var sr=b.sampleRate,P=pauses(b,thr,minLen),kh=Math.round(keep*sr/2),segs=[],pos=0,saved=0,x=chans(b);
P.forEach(function(p){var a=p[0]+kh,e=p[1]-kh;if(e-a>2){segs.push([pos,a]);pos=e;saved+=e-a}});if(!saved)return{buf:b,n:0,saved:0};segs.push([pos,b.length]);
var tot=0;segs.forEach(function(s){tot+=s[1]-s[0]});var out=x.map(function(){return new Float32Array(tot)}),f=Math.round(sr*.004),o=0;
segs.forEach(function(s,si){for(var c=0;c<x.length;c++){var d=x[c],q=out[c];for(var i=s[0];i<s[1];i++){var m=1;if(si>0&&i-s[0]<f)m=(i-s[0])/f;if(si<segs.length-1&&s[1]-i<f)m=Math.min(m,(s[1]-i)/f);q[o+i-s[0]]=d[i]*m}}o+=s[1]-s[0]});
return{buf:mkBuf(out,sr),n:segs.length-1,saved:saved/sr}}
/* auto-level: block RMS (50 ms), gain toward the file's median level, smoothed, linked across channels, in place */
function level(b,st){var sr=b.sampleRate,x=chans(b),n=b.length,hop=Math.round(sr*.05),nb=Math.floor(n/hop),c,k,i;if(nb<8||st<=0)return 0;var db=new Float32Array(nb),ok=new Uint8Array(nb),vs=[];
for(k=0;k<nb;k++){var ms=0;for(c=0;c<x.length;c++){var s=0,d=x[c];for(i=k*hop;i<(k+1)*hop;i++)s+=d[i]*d[i];ms+=s/hop}db[k]=10*Math.log10(ms/x.length+1e-12);if(db[k]>-55){ok[k]=1;vs.push(db[k])}}
if(vs.length<6)return 0;vs.sort(function(a,b){return a-b});var tg=vs[vs.length>>1],des=new Float32Array(nb),has=new Uint8Array(nb),W=5;
for(k=0;k<nb;k++){var sm=0,cn=0;for(i=Math.max(0,k-W);i<=Math.min(nb-1,k+W);i++)if(ok[i]){sm+=db[i];cn++}if(cn&&ok[k]){var gdb=st*(tg-sm/cn);des[k]=Math.max(-12,Math.min(12,gdb));has[k]=1}}
var last=-1;for(k=0;k<nb;k++){if(has[k])last=k;else if(last>=0)des[k]=des[last]*(des[last]>0?.5:1)}var first=0;while(first<nb&&!has[first])first++;for(k=0;k<first;k++)des[k]=des[first]*(des[first]>0?.5:1);
for(var pass=0;pass<2;pass++){var t=new Float32Array(nb);for(k=0;k<nb;k++){var a=0,m=0;for(i=Math.max(0,k-4);i<=Math.min(nb-1,k+4);i++){a+=des[i];m++}t[k]=a/m}des=t}
var lin=new Float32Array(nb);for(k=0;k<nb;k++)lin[k]=Math.pow(10,des[k]/20);
for(c=0;c<x.length;c++){var q=x[c];for(i=0;i<n;i++){var p=(i-hop/2)/hop,k0=Math.floor(p),fr=p-k0,a0=lin[Math.max(0,Math.min(nb-1,k0))],a1=lin[Math.max(0,Math.min(nb-1,k0+1))];q[i]*=a0+(a1-a0)*fr}}return tg}
window.__alDSP3={pauses:pauses,removePauses:removePauses,level:level};
/* UI */
var secs=M.querySelectorAll('details.alsec'),anchor=null;secs.forEach(function(s){if(/Pitch/.test(s.querySelector('summary span').textContent))anchor=s});anchor=anchor||secs[1]||secs[secs.length-1];
var d=document.createElement('details');d.className='alsec';
d.innerHTML='<summary><span>🎯 Leveling &amp; silence</span><i></i></summary><div class="alin"><label>Auto-level voice (%, 0 = off): <b>0</b></label><input type="range" id="alal" min="0" max="100" step="5" value="0"><div style="font-size:11px;color:#b9b2a2">Evens out loud and quiet words around the file’s typical level; overall loudness stays about the same. Applied by Process.</div><div class="row"><button type="button" id="alnm">⇪ Normalize peak to −1 dBFS</button></div><label>Pause remover</label><select id="alsr"><option value="0">Off</option><option value="1">On — shorten long pauses</option></select><label>Silence threshold (dB): <b>-45</b></label><input type="range" id="alst" min="-60" max="-20" step="1" value="-45"><label>Pause longer than (s): <b>0.6</b></label><input type="range" id="alsm" min="0.2" max="3" step="0.1" value="0.6"><label>Keep this much of each pause (s): <b>0.25</b></label><input type="range" id="alsk" min="0" max="1" step="0.05" value="0.25"><div id="alsi" style="font-size:12px;color:#b9b2a2;margin-top:6px"></div><div class="row"><button type="button" id="alsh">🔎 Show pauses on waveform</button></div></div>';
anchor.parentNode.insertBefore(d,anchor.nextSibling);var badge=d.querySelector('summary i'),show=false,PZ=null,tm=0;
function params(){return{thr:+g('alst').value,min:+g('alsm').value,keep:+g('alsk').value}}
function ui(){['alal','alst','alsm','alsk'].forEach(function(i){var b=g(i).previousElementSibling.querySelector('b');if(b)b.textContent=g(i).value});var n=(+g('alal').value>0?1:0)+(g('alsr').value==='1'?1:0);badge.textContent=n?'● '+n+' active':''}
function analyse(){var s=S();if(!s.src||!(show||g('alsr').value==='1')){PZ=null;g('alsi').textContent='';window.dispatchEvent(new Event('resize'));return}var p=params(),L=pauses(s.src,p.thr,p.min),sv=0;L.forEach(function(z){sv+=Math.max(0,(z[1]-z[0])/s.src.sampleRate-p.keep)});PZ={src:s.src,list:L};g('alsi').textContent=L.length?L.length+' pause'+(L.length===1?'':'s')+' found (orange on the waveform) — about '+sv.toFixed(1)+' s would be removed.':'No pauses longer than '+p.min+' s below '+p.thr+' dB.';window.dispatchEvent(new Event('resize'))}
function sched(){clearTimeout(tm);tm=setTimeout(analyse,250)}
d.addEventListener('input',function(){ui();sched()});d.addEventListener('change',function(){ui();sched()});
g('alsh').onclick=function(){show=!show;this.textContent=show?'🙈 Hide pauses':'🔎 Show pauses on waveform';if(show&&!S().src)g('aln').textContent='Choose a file first.';analyse()};
g('alnm').onclick=function(){var s=S();if(!s.src){g('aln').textContent='Choose a file first.';return}var D=s.src.length,a=Math.floor(Math.min(+g('als').value,+g('ale').value)/100*D),e=Math.floor(Math.max(+g('als').value,+g('ale').value)/100*D),pk=0,x=chans(s.src);for(var c=0;c<x.length;c++)for(var i=a;i<e;i++){var v=x[c][i]<0?-x[c][i]:x[c][i];if(v>pk)pk=v}if(pk<1e-6){g('aln').textContent='This part is silent.';return}var gdb=Math.max(-24,Math.min(24,Math.round((-1-20*Math.log10(pk))*10)/10)),ga=g('ala');ga.value=gdb;ga.dispatchEvent(new Event('input'));g('aln').textContent='Gain set to '+gdb+' dB so the peak reaches −1 dBFS (press ⚡ Process).'};
var ps=g('alps');ps.addEventListener('change',function(){if(ps.value==='rst')setTimeout(function(){g('alal').value=0;g('alsr').value='0';ui();sched()},0)});
var pd=window.__alDraw;window.__alDraw=function(x,W,H){if(pd)pd(x,W,H);var s=S();if(!PZ||PZ.src!==s.src||!s.src)return;x.fillStyle='rgba(255,190,60,.3)';PZ.list.forEach(function(z){x.fillRect(z[0]/s.src.length*W,0,Math.max(2,(z[1]-z[0])/s.src.length*W),H)})};
window.__alRest=async function(r){var st=+g('alsr').value;if(st){var p=params(),o=removePauses(r,p.thr,p.min,p.keep);if(o.n){r=o.buf;g('aln').textContent='Shortened '+o.n+' pause'+(o.n===1?'':'s')+' ('+o.saved.toFixed(1)+' s removed)…'}}var lv=+g('alal').value/100;if(lv>0){level(r,lv);}return window.__alPitch?window.__alPitch(r):r};
new MutationObserver(function(){if(PZ&&S().src!==PZ.src){PZ=null;sched()}}).observe(g('aln'),{childList:true,characterData:true,subtree:true});
ui();
}catch(e){try{console.error('Audio Lab step 7',e)}catch(x){}}})();

;
/* ==================== Script 941 id="amiyo-al-s08-spectro-loudness" ==================== */
/* Audio Lab step 8: spectrogram (Waveform/Spectrogram view switch with the same trim handles, playhead and click-to-seek; Before/After compare) and a loudness meter (live momentary + short-term LUFS while previewing; ITU-R BS.1770 integrated LUFS, loudest 3 s, loudest 0.4 s and loudness range for the selection and the processed result, plus a loudness graph with your target line). */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-s8'))return;M.setAttribute('data-s8','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}},nap=function(){return new Promise(function(r){setTimeout(r,0)})},LOG=Math.log10;
/*DSP-START*/
function L(p){return -.691+10*LOG(p+1e-15)}
function kc(fs){var o=[],f0=1681.974450955533,G=3.999843853973347,Q=.7071752369554196,A=Math.pow(10,G/40),w=2*Math.PI*f0/fs,c=Math.cos(w),al=Math.sin(w)/(2*Q),sq=2*Math.sqrt(A)*al,a0=(A+1)-(A-1)*c+sq;
o.push([A*((A+1)+(A-1)*c+sq)/a0,-2*A*((A-1)+(A+1)*c)/a0,A*((A+1)+(A-1)*c-sq)/a0,2*((A-1)-(A+1)*c)/a0,((A+1)-(A-1)*c-sq)/a0]);
f0=38.13547087602444;Q=.5003270373238773;w=2*Math.PI*f0/fs;c=Math.cos(w);al=Math.sin(w)/(2*Q);a0=1+al;o.push([(1+c)/2/a0,-(1+c)/a0,(1+c)/2/a0,-2*c/a0,(1-al)/a0]);return o}
/* K-weighted mean-square power of every 100 ms block, channels summed */
async function subpow(chs,sr,tok){var hop=Math.round(sr*.1),n=chs[0].length,nb=Math.floor(n/hop),sub=new Float64Array(nb),K=kc(sr),s1=K[0],s2=K[1];
for(var c=0;c<chs.length;c++){var x=chs[c],x1=0,x2=0,y1=0,y2=0,z1=0,z2=0,w1=0,w2=0;
for(var k=0;k<nb;k++){var acc=0;for(var j=0,i=k*hop;j<hop;j++,i++){var xi=x[i],y=s1[0]*xi+s1[1]*x1+s1[2]*x2-s1[3]*y1-s1[4]*y2;x2=x1;x1=xi;y2=y1;y1=y;var z=s2[0]*y+s2[1]*z1+s2[2]*z2-s2[3]*w1-s2[4]*w2;z2=z1;z1=y;w2=w1;w1=z;acc+=z*z}
sub[k]+=acc/hop;if((k&63)===63){if(tok&&tok.c)return null;await nap()}}}return sub}
function mean(a){var s=0;for(var i=0;i<a.length;i++)s+=a[i];return s/(a.length||1)}
function stats(sub){var n=sub.length,pm=[],i;if(n<1)return null;
if(n<4)pm=[mean(sub)];else for(i=0;i+4<=n;i++)pm.push((sub[i]+sub[i+1]+sub[i+2]+sub[i+3])/4);
var ab=pm.filter(function(p){return L(p)>-70}),I=-Infinity;if(ab.length){var rg=L(mean(ab))-10,gt=ab.filter(function(p){return L(p)>rg});I=gt.length?L(mean(gt)):-Infinity}
var maxM=-Infinity;pm.forEach(function(p){var l=L(p);if(l>maxM)maxM=l});
var ps=[];if(n>=30){var s=0;for(i=0;i<30;i++)s+=sub[i];ps.push(s/30);for(i=30;i<n;i++){s+=sub[i]-sub[i-30];ps.push(s/30)}}
var maxS=null,lra=null;if(ps.length){maxS=-Infinity;ps.forEach(function(p){var l=L(p);if(l>maxS)maxS=l});
var sh=[];for(i=0;i<ps.length;i+=10)if(L(ps[i])>-70)sh.push(ps[i]);
if(sh.length>=2){var r2=L(mean(sh))-20,v=sh.filter(function(p){return L(p)>r2}).map(L).sort(function(a,b){return a-b});if(v.length>=2)lra=v[Math.floor(.95*(v.length-1))]-v[Math.floor(.1*(v.length-1))]}}
return{I:I,maxM:maxM,maxS:maxS,lra:lra,ser:(ps.length?ps:pm).map(L)}}
/*DSP-END*/
var FT={};
function ftab(N){if(FT[N])return FT[N];var c=new Float32Array(N/2),s=new Float32Array(N/2),w=new Float32Array(N),r=new Uint32Array(N),bits=Math.round(Math.log2(N)),i,b;for(i=0;i<N/2;i++){c[i]=Math.cos(2*Math.PI*i/N);s[i]=-Math.sin(2*Math.PI*i/N)}
for(i=0;i<N;i++){w[i]=.5-.5*Math.cos(2*Math.PI*i/N);var x=i,y=0;for(b=0;b<bits;b++){y=(y<<1)|(x&1);x>>=1}r[i]=y}return FT[N]={c:c,s:s,w:w,r:r}}
function fft(re,im,T){var N=re.length,i,j,k;for(i=0;i<N;i++){j=T.r[i];if(j>i){var t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t}}
for(var len=2;len<=N;len<<=1){var h=len>>1,st=N/len;for(i=0;i<N;i+=len)for(k=0;k<h;k++){var wr=T.c[k*st],wi=T.s[k*st],a=i+k,b=a+h,xr=re[b]*wr-im[b]*wi,xi=re[b]*wi+im[b]*wr;re[b]=re[a]-xr;im[b]=im[a]-xi;re[a]+=xr;im[a]+=xi}}}
async function stft(buf,N,cols,t){var T=ftab(N),n=buf.length,d0=buf.getChannelData(0),d1=buf.numberOfChannels>1?buf.getChannelData(1):null,B=N/2,db=new Float32Array(cols*B),re=new Float32Array(N),im=new Float32Array(N),mx=-200;
for(var c=0;c<cols;c++){var o=Math.round((c+.5)/cols*n-N/2);for(var k=0;k<N;k++){var p=o+k,v=0;if(p>=0&&p<n)v=d1?(d0[p]+d1[p])*.5:d0[p];re[k]=v*T.w[k];im[k]=0}
fft(re,im,T);for(k=0;k<B;k++){var m=Math.sqrt(re[k]*re[k]+im[k]*im[k])/(N/4),l=20*LOG(m+1e-9);db[c*B+k]=l;if(l>mx)mx=l}
if((c&31)===31){if(t&&t.c)return null;await nap()}}return{db:db,cols:cols,B:B,N:N,sr:buf.sampleRate,ref:mx,buf:buf}}
var CMAP=(function(){var s=[[0,0,0,4],[.15,40,11,84],[.35,120,28,109],[.55,200,55,85],[.75,245,125,21],[.9,250,200,50],[1,252,255,164]],o=new Uint8Array(768);for(var i=0;i<256;i++){var t=i/255,j=1;while(j<s.length-1&&s[j][0]<t)j++;var a=s[j-1],b=s[j],f=(t-a[0])/(b[0]-a[0]);for(var k=0;k<3;k++)o[i*3+k]=a[k+1]+(b[k+1]-a[k+1])*f}return o})();
/* UI */
var st=document.createElement('style');st.textContent='#alm .alwv #alsg{position:absolute;left:0;top:0;width:100%;display:none}#alm .alwv.sg #alsg{display:block}#alm .alwv.sg canvas{height:190px!important}#alm #alvw{margin-top:8px}#alm #alvw button.on{background:#ff7a3d;color:#111}#alm .al8 canvas{display:block;width:100%;height:110px;background:#141210;border-radius:6px;margin:4px 0 8px}#alm .al8 canvas#al8h{height:90px}#alm .al8 table{width:100%;font-size:12px}#alm .al8 td,#alm .al8 th{padding:2px 4px;text-align:right}#alm .al8 td:first-child{text-align:left}#alm .al8 .sm{font-size:11px;color:#b9b2a2}';document.head.appendChild(st);
var wv=g('alc').parentNode,ov=g('alov'),cvm=document.createElement('canvas');cvm.id='alsg';wv.insertBefore(cvm,ov);
wv.insertAdjacentHTML('beforebegin','<div class="row" id="alvw"><button type="button" data-v="w" class="on">〰 Waveform</button><button type="button" data-v="s">🌈 Spectrogram</button></div>');
var secs=M.querySelectorAll('details.alsec'),anchor=secs[secs.length-1];secs.forEach(function(s){if(/Leveling/.test(s.querySelector('summary span').textContent))anchor=s});
var d=document.createElement('details');d.className='alsec';
d.innerHTML='<summary><span>📊 Loudness &amp; spectrogram</span><i></i></summary><div class="alin al8"><label>Spectrogram scale</label><select id="alsc"><option value="v">Voice 0–8 kHz (linear)</option><option value="f">Full 20 Hz–20 kHz (log)</option></select><label>Detail</label><select id="alsw"><option value="1024">Balanced</option><option value="512">Fast changes (time detail)</option><option value="2048">Fine pitch (frequency detail)</option><option value="4096">Very fine pitch</option></select><label>Range (dB): <b>80</b></label><input type="range" id="alsd" min="40" max="110" step="5" value="80"><div class="sm">Before (original)</div><canvas id="al8b"></canvas><div class="sm">After (processed) — appears after ⚡ Process</div><canvas id="al8a"></canvas><div id="al8v" style="font-size:13px;margin:6px 0"></div><table><tr><th></th><th>Before (selection)</th><th>After</th></tr><tr><td>Integrated (LUFS)</td><td id="al8i0">—</td><td id="al8i1">—</td></tr><tr><td>Loudest 3 s (LUFS)</td><td id="al8s0">—</td><td id="al8s1">—</td></tr><tr><td>Loudest 0.4 s (LUFS)</td><td id="al8m0">—</td><td id="al8m1">—</td></tr><tr><td>Loudness range (LU)</td><td id="al8r0">—</td><td id="al8r1">—</td></tr></table><div class="sm" style="margin-top:6px">Loudness over time: grey = before, orange = after, white line = your LUFS target</div><canvas id="al8h"></canvas></div>';
anchor.parentNode.insertBefore(d,anchor.nextSibling);
var cvb=g('al8b'),cva=g('al8a'),cvh=g('al8h'),SC={},TK={},D={bef:null,aft:null},lastS=null,lastO=null;
function paint(cv,sp){var W=cv.width=Math.max(200,Math.round(cv.clientWidth*2)),H=cv.height=Math.max(100,Math.round(cv.clientHeight*2)),x=cv.getContext('2d');x.fillStyle='#141210';x.fillRect(0,0,W,H);if(!sp)return;
var R=256,tmp=document.createElement('canvas');tmp.width=sp.cols;tmp.height=R;var tx=tmp.getContext('2d'),im=tx.createImageData(sp.cols,R),px=im.data,range=+g('alsd').value,lg=g('alsc').value==='f',ny=sp.sr/2,top=sp.ref;
for(var r=0;r<R;r++){var u=1-r/(R-1),f=lg?20*Math.pow(1000,u):8000*u,bi=Math.min(sp.B-1,Math.round(f/ny*sp.B)),ok=f<=ny;for(var c=0;c<sp.cols;c++){var v=ok?sp.db[c*sp.B+bi]:-999,t=Math.max(0,Math.min(1,(v-(top-range))/range)),ci=Math.round(t*255)*3,q=(r*sp.cols+c)*4;px[q]=CMAP[ci];px[q+1]=CMAP[ci+1];px[q+2]=CMAP[ci+2];px[q+3]=255}}
tx.putImageData(im,0,0);x.imageSmoothingEnabled=true;x.drawImage(tmp,0,0,W,H);x.fillStyle='rgba(255,255,255,.9)';x.font='18px sans-serif';x.strokeStyle='rgba(255,255,255,.2)';
(lg?[100,1000,10000]:[2000,4000,6000]).forEach(function(f){var yy=H*(1-(lg?LOG(f/20)/3:f/8000));x.beginPath();x.moveTo(0,yy);x.lineTo(W,yy);x.stroke();x.fillText(f>=1000?(f/1000)+' kHz':f+' Hz',6,yy-4)})}
async function upd(key,buf,cv){if(!cv.clientWidth)return;if(!buf){SC[key]=null;paint(cv,null);return}var N=+g('alsw').value,cols=Math.min(1400,Math.max(200,Math.round(cv.clientWidth*2))),c=SC[key];
if(!(c&&c.buf===buf&&c.N===N&&Math.abs(c.cols-cols)<60)){if(TK[key])TK[key].c=true;var t=TK[key]={c:false};c=await stft(buf,N,cols,t);if(!c||t.c)return;SC[key]=c}paint(cv,c)}
function refresh(){var s=S();upd('m',s.src,cvm);upd('b',s.src,cvb);upd('a',s.out,cva)}
function repaint(){[['m',cvm],['b',cvb],['a',cva]].forEach(function(k){if(SC[k[0]]&&k[1].clientWidth)paint(k[1],SC[k[0]])})}
var fv=function(v){return v==null?'—':(v<=-119?'−∞':v.toFixed(1).replace('-','−'))};
function hist(){var W=cvh.width=Math.max(200,Math.round(cvh.clientWidth*2)),H=cvh.height=180,x=cvh.getContext('2d');x.fillStyle='#141210';x.fillRect(0,0,W,H);var all=[];[D.bef,D.aft].forEach(function(o){if(o)o.ser.forEach(function(v){if(isFinite(v)&&v>-70)all.push(v)})});if(!all.length)return;
var tg=+g('alt').value,lo=Math.min.apply(null,all),hi=Math.max.apply(null,all);if(tg){lo=Math.min(lo,tg);hi=Math.max(hi,tg)}lo-=3;hi+=3;var Y=function(v){return H-(Math.max(lo,Math.min(hi,v))-lo)/(hi-lo)*H};
[[D.bef,'#6c665a'],[D.aft,'#ff7a3d']].forEach(function(z){var o=z[0];if(!o||o.ser.length<2)return;x.strokeStyle=z[1];x.lineWidth=2;x.beginPath();var n=o.ser.length,stp=Math.max(1,Math.floor(n/W));for(var i=0;i<n;i+=stp){var px=i/(n-1)*W,py=Y(isFinite(o.ser[i])?o.ser[i]:lo);if(i===0)x.moveTo(px,py);else x.lineTo(px,py)}x.stroke()});
if(tg){x.strokeStyle='#fff';x.setLineDash([8,6]);x.beginPath();x.moveTo(0,Y(tg));x.lineTo(W,Y(tg));x.stroke();x.setLineDash([])}x.fillStyle='#b9b2a2';x.font='18px sans-serif';x.fillText(fv(hi)+' LUFS',6,18);x.fillText(fv(lo)+' LUFS',6,H-6)}
function render(){var B=D.bef,A=D.aft;[['i','I'],['s','maxS'],['m','maxM'],['r','lra']].forEach(function(r){[B,A].forEach(function(o,k){var e=g('al8'+r[0]+k);if(e)e.textContent=o?fv(o[r[1]]):'—'})});
var v=g('al8v'),tg=g('alt').value,s='';if(A&&isFinite(A.I)){s='After: '+fv(A.I)+' LUFS integrated';if(tg){var df=A.I-(+tg);s+=Math.abs(df)<=1?' — on target ('+tg+') ✓':' — '+Math.abs(df).toFixed(1)+' LU '+(df>0?'louder':'quieter')+' than your '+tg+' LUFS target'}if(A.lra!=null&&A.lra>14)s+='. Wide dynamics — try Auto-level.'}else if(B&&isFinite(B.I))s='Before: '+fv(B.I)+' LUFS integrated — press ⚡ Process to compare.';v.textContent=s;hist()}
var tkB=null,tkA=null,tmB=0;
async function doBefore(){var s=S();if(tkB)tkB.c=true;var t=tkB={c:false};if(!s.src){D.bef=null;render();return}var n=s.src.length,a=Math.floor(Math.min(+g('als').value,+g('ale').value)/100*n),b=Math.floor(Math.max(+g('als').value,+g('ale').value)/100*n),chs=[];for(var c=0;c<s.src.numberOfChannels;c++)chs.push(s.src.getChannelData(c).subarray(a,b));
var sub=await subpow(chs,s.src.sampleRate,t);if(!sub||t.c)return;D.bef=stats(sub);render()}
async function doAfter(){var s=S();if(tkA)tkA.c=true;var t=tkA={c:false};if(!s.out){D.aft=null;render();return}var chs=[];for(var c=0;c<s.out.numberOfChannels;c++)chs.push(s.out.getChannelData(c));var sub=await subpow(chs,s.out.sampleRate,t);if(!sub||t.c)return;D.aft=stats(sub);render()}
function sync(){var s=S();if(s.src!==lastS){lastS=s.src;lastO=null;D.bef=D.aft=null;SC={};render();if(s.src){doBefore();refresh()}else refresh()}if(s.out!==lastO){lastO=s.out;D.aft=null;render();if(s.out){doAfter();upd('a',s.out,cva)}else upd('a',null,cva)}}
new MutationObserver(sync).observe(g('aln'),{childList:true,characterData:true,subtree:true});
['als','ale'].forEach(function(i){g(i).addEventListener('input',function(){clearTimeout(tmB);tmB=setTimeout(doBefore,400)})});
g('alt').addEventListener('change',render);
d.addEventListener('toggle',function(){if(d.open)setTimeout(refresh,30)});
d.addEventListener('input',function(e){var id=e.target&&e.target.id;if(id==='alsd'){e.target.previousElementSibling.querySelector('b').textContent=e.target.value;repaint()}});
d.addEventListener('change',function(e){var id=e.target&&e.target.id;if(id==='alsc')repaint();if(id==='alsw')refresh()});
g('alvw').addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('button');if(!b)return;var sg=b.getAttribute('data-v')==='s';wv.classList.toggle('sg',sg);g('alvw').querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b)});window.dispatchEvent(new Event('resize'));setTimeout(refresh,30)});
var rz=0;window.addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){if(M.style.display==='block'){refresh();hist()}},150)});
var ob=document.getElementById('alb');if(ob)ob.addEventListener('click',function(){setTimeout(function(){sync();refresh()},60)});
/* live loudness (momentary 0.4 s + short-term 3 s), approximate: tapped from the live-preview chain */
var bar=g('almb'),row=bar&&bar.parentNode&&bar.parentNode.parentNode;
if(row)row.insertAdjacentHTML('afterend','<div style="margin-top:3px"><div style="position:relative;height:6px;background:#2a2620;border-radius:3px"><div id="al8lb" style="height:100%;width:0;background:#6bd36b;border-radius:3px"></div><i id="al8lt" style="position:absolute;top:-2px;width:2px;height:10px;background:#fff;display:none"></i></div><div id="al8lm" style="font:12px monospace;color:#b9b2a2;margin-top:2px">Loudness: press ▶ with Live preview on</div></div>');
var LV={an:[],ac:null,hist:[],n:2,raf:0},fa=new Float32Array(32768),fb=new Float32Array(32768);
function ms(a,n){var s=0,o=a.length-n;for(var i=o;i<a.length;i++)s+=a[i]*a[i];return s/n}
function rd(m,s){var e=g('al8lm'),b=g('al8lb'),t=g('al8lt');if(!e)return;var tg=+g('alt').value;if(t){t.style.display=tg?'block':'none';t.style.left=Math.max(0,Math.min(100,(tg+40)/40*100))+'%'}
if(m==null){e.textContent='Loudness: press ▶ with Live preview on';if(b)b.style.width='0';return}e.textContent='M '+fv(m)+'  ·  S '+fv(s)+' LUFS  (live, approx.)';b.style.width=Math.max(0,Math.min(100,(m+40)/40*100))+'%';b.style.background=(!tg||Math.abs(m-tg)<=2)?'#6bd36b':'#e0b040'}
function loop(){LV.raf=0;var pl=window.__alplay;if(M.style.display!=='block'||!pl||!pl.on()||!LV.an.length){LV.an=[];rd(null);return}
var nm=Math.round(LV.ac.sampleRate*.4);LV.an[0].getFloatTimeDomainData(fa);var p=ms(fa,nm);if(LV.n>1&&!g('alm1').checked){LV.an[1].getFloatTimeDomainData(fb);p+=ms(fb,nm)}
var t=performance.now();LV.hist.push([t,p]);while(LV.hist.length&&t-LV.hist[0][0]>3000)LV.hist.shift();var s=0;LV.hist.forEach(function(h){s+=h[1]});rd(L(p),L(s/LV.hist.length));LV.raf=requestAnimationFrame(loop)}
function tap(ac,buf){var G=window.__alG&&window.__alG();if(!G||!G.an)return;try{var hs=ac.createBiquadFilter();hs.type='highshelf';hs.frequency.value=1682;hs.gain.value=4;var hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=38;hp.Q.value=.5;var sp=ac.createChannelSplitter(2),sil=ac.createGain();sil.gain.value=0;
G.an.connect(hs);hs.connect(hp);hp.connect(sp);LV.an=[0,1].map(function(i){var a=ac.createAnalyser();a.fftSize=32768;sp.connect(a,i);a.connect(sil);return a});sil.connect(ac.destination);LV.ac=ac;LV.hist=[];LV.n=buf.numberOfChannels;if(!LV.raf)LV.raf=requestAnimationFrame(loop)}catch(e){}}
var pl0=window.__alLive;if(pl0)window.__alLive=function(ac,n,buf){var r=pl0.apply(this,arguments);tap(ac,buf);return r};
g('alt').addEventListener('change',function(){rd(null)});rd(null);sync();
}catch(e){try{console.error('Audio Lab step 8',e)}catch(x){}}})();

;
/* ==================== Script 942 id="amiyo-al-s09-export" ==================== */
/* Audio Lab step 9: export as MP3 (128-320 kbps, encoder fetched once from cdnjs), WebM (Opus) and OGG (Opus, where the browser can), besides 16/24-bit WAV. Encodes the processed result. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-s9'))return;M.setAttribute('data-s9','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}},nap=function(){return new Promise(function(r){setTimeout(r,0)})},busy=false;
var msg=function(t){g('aln').textContent=t};
g('alx').innerHTML='<optgroup label="Lossless"><option value="24">24-bit WAV</option><option value="16">16-bit WAV (dithered)</option></optgroup><optgroup label="Compressed"><option value="mp3-128">MP3 128 kbps (small)</option><option value="mp3-192">MP3 192 kbps</option><option value="mp3-256">MP3 256 kbps</option><option value="mp3-320">MP3 320 kbps (best)</option><option value="webm">WebM (Opus) — modern, saved in real time</option><option value="ogg">OGG (Opus) — fast, with correct length</option></optgroup>';
function lbl(){var o=g('alx').selectedOptions[0].textContent.split(' ')[0].replace('-bit','');g('ald').textContent='⬇ Export '+(/^\d/.test(o)?'WAV':o)}g('alx').addEventListener('change',lbl);lbl();
function loadLame(){if(window.lamejs)return Promise.resolve();var el=document.getElementById('amiyo-lame-src');if(el&&el.textContent.length>1000){try{var s0=document.createElement('script');s0.text=el.textContent;document.head.appendChild(s0);s0.remove();if(window.lamejs)return Promise.resolve()}catch(e){}}return new Promise(function(res,rej){var sc=document.createElement('script');sc.src='https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js';sc.onload=res;sc.onerror=function(){rej(new Error('the MP3 encoder could not start (the built-in copy was blocked and the online copy could not be downloaded). Choose WebM or WAV instead'))};document.head.appendChild(sc)})}
async function resample(b,to){var o=new OfflineAudioContext(b.numberOfChannels,Math.ceil(b.duration*to),to),s=o.createBufferSource();s.buffer=b;s.connect(o.destination);s.start();return o.startRendering()}
async function mp3(b,kbps){await loadLame();if([8000,11025,12000,16000,22050,24000,32000,44100,48000].indexOf(b.sampleRate)<0){msg('Converting sample rate…');b=await resample(b,48000)}
var ch=Math.min(2,b.numberOfChannels),n=b.length,enc=new lamejs.Mp3Encoder(ch,b.sampleRate,kbps),parts=[],L=b.getChannelData(0),R=ch>1?b.getChannelData(1):null;
function cv(a,i0,i1){var o=new Int16Array(i1-i0);for(var i=i0;i<i1;i++){var v=Math.max(-1,Math.min(1,a[i]));o[i-i0]=v<0?v*32768:v*32767}return o}
for(var i=0;i<n;i+=46080){var e=Math.min(n,i+46080),d=R?enc.encodeBuffer(cv(L,i,e),cv(R,i,e)):enc.encodeBuffer(cv(L,i,e));if(d.length)parts.push(new Uint8Array(d));msg('Encoding MP3… '+Math.round(e/n*100)+'%');await nap();if(window.__alExpCancel)throw new Error('Export cancelled')}
var f=enc.flush();if(f.length)parts.push(new Uint8Array(f));return{blob:new Blob(parts,{type:'audio/mpeg'}),ext:'mp3'}}
function rec(b,v){return new Promise(function(res,rej){if(!window.MediaRecorder)return rej(new Error('this browser cannot encode WebM/OGG — use MP3 or WAV'));
var T=['audio/ogg;codecs=opus','audio/webm;codecs=opus'],mt=v==='ogg'&&MediaRecorder.isTypeSupported(T[0])?T[0]:(MediaRecorder.isTypeSupported(T[1])?T[1]:'');if(!mt)return rej(new Error('Opus recording is not supported here — use MP3 or WAV'));
var ext=mt.indexOf('ogg')>=0?'ogg':'webm',note=(v==='ogg'&&ext!=='ogg')?'(this browser cannot make OGG, saving WebM instead) ':'',ac=new(window.AudioContext||window.webkitAudioContext)(),dst=ac.createMediaStreamDestination(),s=ac.createBufferSource(),ch=[],t0=0,tm;
s.buffer=b;s.connect(dst);var rc=new MediaRecorder(dst.stream,{mimeType:mt,audioBitsPerSecond:192000});rc.ondataavailable=function(e){if(e.data.size)ch.push(e.data)};
rc.onstop=function(){clearInterval(tm);try{ac.close()}catch(x){}res({blob:new Blob(ch,{type:mt.split(';')[0]}),ext:ext})};rc.onerror=function(e){clearInterval(tm);rej(new Error('recording failed'))};
s.onended=function(){setTimeout(function(){rc.stop()},200)};ac.resume();rc.start(500);s.start();t0=ac.currentTime;tm=setInterval(function(){msg(note+'Encoding '+ext.toUpperCase()+' in real time… '+Math.min(99,Math.round((ac.currentTime-t0)/b.duration*100))+'%')},300)})}
/* Audio Lab step 2: fast OGG (Opus). Uses the browser's built-in Opus encoder (WebCodecs) and writes a real .ogg file faster than real time, with correct length. Falls back to the old method when the browser has no AudioEncoder. */
async function oggFast(b,kbps){
 if(!window.AudioEncoder||!window.AudioData)throw new Error('no WebCodecs');
 var SR=48000,ch=Math.min(2,b.numberOfChannels);
 if(b.sampleRate!==SR){msg('Converting sample rate…');b=await resample(b,SR)}
 var cfg={codec:'opus',sampleRate:SR,numberOfChannels:ch,bitrate:(kbps||160)*1000};
 var sup=await AudioEncoder.isConfigSupported(cfg);if(!sup||!sup.supported)throw new Error('opus not supported');
 var pk=[],head=null,err=null,enc=new AudioEncoder({output:function(c,m){var u=new Uint8Array(c.byteLength);c.copyTo(u);pk.push(u);if(!head&&m&&m.decoderConfig&&m.decoderConfig.description){var d=m.decoderConfig.description;head=new Uint8Array(d.buffer?d.buffer.slice(d.byteOffset,d.byteOffset+d.byteLength):d)}},error:function(e){err=e}});
 enc.configure(cfg);
 var n=b.length,FR=960,D=[];for(var c=0;c<ch;c++)D.push(b.getChannelData(c));
 for(var i=0;i<n;i+=FR){
  if(err)throw err;
  var m2=Math.min(FR,n-i),pl=new Float32Array(FR*ch);
  for(var c2=0;c2<ch;c2++)pl.set(D[c2].subarray(i,i+m2),c2*FR);
  var ad=new AudioData({format:'f32-planar',sampleRate:SR,numberOfFrames:FR,numberOfChannels:ch,timestamp:Math.round(i/SR*1e6),data:pl});
  enc.encode(ad);ad.close();
  while(enc.encodeQueueSize>40)await new Promise(function(r){setTimeout(r,2)});
  if((i/FR)%200===0){msg('Encoding OGG… '+Math.round(i/n*100)+'%');await nap();if(window.__alExpCancel)throw new Error('Export cancelled')}
 }
 await enc.flush();enc.close();if(err)throw err;if(!pk.length)throw new Error('nothing encoded');
 var pre=312;
 if(!head||head.length<19||head[0]!==79){head=new Uint8Array(19);head.set([79,112,117,115,72,101,97,100,1,ch]);head[10]=pre&255;head[11]=pre>>8;head[12]=SR&255;head[13]=(SR>>8)&255;head[14]=(SR>>16)&255;head[15]=(SR>>24)&255}
 else{pre=head[10]|(head[11]<<8)}
 var T=[];for(var q=0;q<256;q++){var r=q<<24;for(var k=0;k<8;k++)r=(r&0x80000000)?((r<<1)^0x04c11db7):(r<<1);T[q]=r>>>0}
 function crc(a){var r=0;for(var i=0;i<a.length;i++)r=((r<<8)^T[((r>>>24)^a[i])&255])>>>0;return r>>>0}
 var serial=(Math.random()*4294967295)>>>0,seq=0,parts=[];
 function page(flag,gran,packs){var seg=[];packs.forEach(function(p){var l=p.length;while(l>=255){seg.push(255);l-=255}seg.push(l)});
  var body=0;packs.forEach(function(p){body+=p.length});var out=new Uint8Array(27+seg.length+body),dv=new DataView(out.buffer);
  out.set([79,103,103,83,0,flag]);dv.setUint32(6,gran>>>0,true);dv.setUint32(10,Math.floor(gran/4294967296)>>>0,true);dv.setUint32(14,serial,true);dv.setUint32(18,seq++,true);out[26]=seg.length;out.set(seg,27);
  var o=27+seg.length;packs.forEach(function(p){out.set(p,o);o+=p.length});dv.setUint32(22,crc(out),true);return out}
 var tags=new TextEncoder().encode('Audio Lab'),tg=new Uint8Array(8+4+tags.length+4);tg.set([79,112,117,115,84,97,103,115]);new DataView(tg.buffer).setUint32(8,tags.length,true);tg.set(tags,12);
 parts.push(page(2,0,[head]),page(0,0,[tg]));
 var total=n+pre,gp=0,i2=0;
 while(i2<pk.length){var grp=[],sg=0;while(i2<pk.length&&grp.length<50){var need=Math.floor(pk[i2].length/255)+1;if(sg+need>250&&grp.length)break;grp.push(pk[i2]);sg+=need;i2++}
  var last=i2>=pk.length;gp+=grp.length*FR;parts.push(page(last?4:0,last?total:Math.min(gp,total),grp))}
 return{blob:new Blob(parts,{type:'audio/ogg'}),ext:'ogg'}}

M.addEventListener('click',async function(e){var bt=e.target.closest&&e.target.closest('#ald');if(!bt)return;var v=g('alx').value;if(/^\d+$/.test(v))return;e.stopPropagation();e.preventDefault();
var b=S().out;if(!b){msg('Press ⚡ Process first.');return}if(busy)return;busy=true;bt.disabled=true;
try{var r=v.slice(0,3)==='mp3'?await mp3(b,+v.split('-')[1]):await(v==='ogg'?oggFast(b,160).catch(function(x){if(x&&x.message==='Export cancelled')throw x;return rec(b,v)}):rec(b,v)),a=document.createElement('a');a.href=URL.createObjectURL(r.blob);a.download='audio-lab-'+(v.slice(0,3)==='mp3'?v.split('-')[1]+'k':Date.now())+'.'+r.ext;document.body.appendChild(a);a.click();setTimeout(function(){a.remove()},800);msg('Exported '+r.ext.toUpperCase()+(v.slice(0,3)==='mp3'?' '+v.split('-')[1]+' kbps':'')+' ('+(r.blob.size/1048576).toFixed(2)+' MB).')}
catch(er){msg(er&&er.message==='Export cancelled'?'Export cancelled.':'Export failed: '+er.message)}finally{busy=false;bt.disabled=false}},true);
}catch(e){try{console.error('Audio Lab step 9',e)}catch(x){}}})();

;
/* ==================== Script 943 id="amiyo-al-s10-undo-keys-help" ==================== */
/* Audio Lab step 10: undo / redo of every control (Ctrl+Z, Ctrl+Shift+Z / Ctrl+Y, header buttons), keyboard shortcuts, and a built-in help sheet (? button or ?/H key). */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-s10'))return;M.setAttribute('data-s10','1');
var g=function(i){return M.querySelector('#'+i)};
var SKIP={alf:1,alib:1,alps:1,alpn:1,alpif:1,alsc:1,alsw:1,alsd:1};
function els(){return[].filter.call(M.querySelectorAll('input[id],select[id]'),function(e){return e.type!=='file'&&e.type!=='text'&&!SKIP[e.id]&&!e.hasAttribute('data-e')})}
function snap(){var o={};els().forEach(function(e){o[e.id]=e.type==='checkbox'?e.checked:e.value});return JSON.stringify(o)}
var H=[snap()],D=['Start (as opened)'],TS=[Date.now()],ix=0,tm=0,quiet=false;
function nm(e){if(/^eqb\d$/.test(e.id))return'EQ band '+e.id.slice(3);var l=null;if(e.type==='checkbox')l=e.closest('label');else{var p=e.previousElementSibling;while(p&&p.tagName!=='LABEL'&&p.previousElementSibling)p=p.previousElementSibling;if(p&&p.tagName==='LABEL')l=p;else{var r=e.closest('.row');l=r&&r.querySelector('label')}}
var t=((l&&l.textContent)||e.id).replace(/\s+/g,' ').trim().replace(/[:\uFF1A].*$/,'').replace(/\s*\(.*$/,'').trim();return t.slice(0,34)||e.id}
function fv(e,v){if(e.type==='checkbox')return v?'on':'off';if(e.tagName==='SELECT'){var o=[].filter.call(e.options,function(o){return o.value===String(v)})[0];return o?o.textContent.trim().slice(0,22):String(v)}return String(v)}
function desc(a,b){try{var A=JSON.parse(a),B=JSON.parse(b),ch=[];Object.keys(B).forEach(function(k){if(k in A&&A[k]!==B[k])ch.push(k)});if(!ch.length)return null;
 var one=function(k){var e=g(k);return e?nm(e)+': '+fv(e,A[k])+' \u2192 '+fv(e,B[k]):k};
 if(ch.length===1)return one(ch[0]);if(ch.length<=3)return ch.map(function(k){var e=g(k);return e?nm(e):k}).join(', ');return'Many settings ('+ch.length+') \u2014 preset or reset'}catch(e){return'Change'}}
function btns(){var u=g('alun'),r=g('alre');if(u){u.disabled=ix<=0;u.style.opacity=ix<=0?.4:1}if(r){r.disabled=ix>=H.length-1;r.style.opacity=ix>=H.length-1?.4:1}}
function rec(){if(quiet)return;var s=snap();if(s!==H[ix]){var ds=desc(H[ix],s);if(ds===null){H[ix]=s;btns();return}H=H.slice(0,ix+1);D=D.slice(0,ix+1);TS=TS.slice(0,ix+1);H.push(s);D.push(ds);TS.push(Date.now());if(H.length>100){H.shift();D.shift();TS.shift()}ix=H.length-1;if(window.__alHistChanged)window.__alHistChanged()}btns()}
function sched(){clearTimeout(tm);tm=setTimeout(rec,350)}
M.addEventListener('input',sched,true);M.addEventListener('change',sched,true);
function go(n,w){clearTimeout(tm);rec();var t=ix+n;if(t<0||t>=H.length){g('aln').textContent='Nothing to '+w+'.';return}ix=t;var o=JSON.parse(H[ix]);quiet=true;els().forEach(function(e){if(!(e.id in o))return;if(e.type==='checkbox')e.checked=o[e.id];else e.value=o[e.id];e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))});
setTimeout(function(){quiet=false;btns()},400);g('aln').textContent=(w==='jump'?'Jumped to':(n<0?'Undone':'Redone'))+' — step '+ix+' ('+D[ix]+'). Press ⚡ Process to apply.';btns();if(window.__alHistChanged)window.__alHistChanged()}
var undo=function(){go(-1,'undo')},redo=function(){go(1,'redo')};
window.__alHist={get:function(){return{ix:ix,d:D.slice(),t:TS.slice()}},jump:function(i){clearTimeout(tm);rec();i=Math.max(0,Math.min(H.length-1,i));if(i===ix)return;go(i-ix,'jump')}};
/* header buttons + help */
var hd=M.querySelector('.alhd'),x=g('alq')&&hd?hd.querySelector('button'):null,mk=function(id,t,ti,f){var b=document.createElement('button');b.type='button';b.id=id;b.textContent=t;b.title=ti;b.setAttribute('aria-label',ti);b.style.cssText='background:#2a2620;color:#f1ece2;border:0;border-radius:8px;padding:6px 10px;font:600 14px sans-serif;margin-right:6px;cursor:pointer';b.onclick=f;return b};
if(hd){var w=document.createElement('span');w.style.cssText='display:flex;align-items:center;margin-left:auto;margin-right:6px';w.appendChild(mk('alun','↶','Undo (Ctrl+Z)',undo));w.appendChild(mk('alre','↷','Redo (Ctrl+Shift+Z)',redo));w.appendChild(mk('alhp','?','Help and shortcuts (?)',function(){hp(1)}));var h2=hd.querySelector('h2');if(x)hd.insertBefore(w,x);else hd.appendChild(w)}
var K=[['Space','Play / stop preview'],['Ctrl+Enter','⚡ Process'],['Ctrl+S','Export'],['Ctrl+Z','Undo a control change'],['Ctrl+Shift+Z / Ctrl+Y','Redo'],['Ctrl+Alt+Z / Ctrl+Alt+Y','Undo / redo a waveform edit (crop, delete, paste, reverse…)'],['Delete','Delete the selected part (close the gap)'],['M','Add a marker at the playhead'],['I / O','Set trim start / end at the playhead'],['0','Full length (reset trim)'],['L','Loop the selection'],['A','A/B — hear the original'],['V','Waveform ⇄ Spectrogram'],['? or H','This help'],['Esc','Close help, then Audio Lab']];
var P=document.createElement('div');P.id='alhelp';P.style.cssText='display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.8);overflow:auto;padding:16px';
P.innerHTML='<div style="max-width:560px;margin:0 auto;background:#1d1b17;color:#f1ece2;border:1px solid #3a352c;border-radius:12px;padding:16px;font:14px sans-serif"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:16px">Audio Lab — quick guide</b><button type="button" id="alhx" style="background:#2a2620;color:#f1ece2;border:0;border-radius:8px;padding:6px 10px">✕</button></div><ol style="line-height:1.6;padding-left:20px"><li><b>Choose</b> a voice file, drop one here, or use the selected timeline clip.</li><li><b>Trim</b>: drag the orange handles on the waveform; click to place the playhead.</li><li><b>Clean</b>: pick a preset, learn a noise sample, remove hum and clicks.</li><li><b>Shape</b>: EQ, pitch/speed, auto-level, remove long pauses. Hear it live with Live preview.</li><li><b>Check</b>: spectrogram and LUFS meter; aim for −16 LUFS (voice) or −14 (music).</li><li><b>⚡ Process</b>, then Export (MP3 / WebM / OGG / WAV) or Replace / Add to the timeline.</li></ol><table style="width:100%;font-size:13px;border-collapse:collapse">'+K.map(function(r){return'<tr><td style="padding:3px 6px;white-space:nowrap"><code style="background:#2a2620;border-radius:5px;padding:1px 6px">'+r[0]+'</code></td><td style="padding:3px 6px">'+r[1]+'</td></tr>'}).join('')+'</table><p style="font-size:12px;color:#b9b2a2">Undo (Ctrl+Z) covers every slider, switch and the trim handles; edits to the audio itself (crop, delete, paste…) have their own undo with Ctrl+Alt+Z or the Undo edit button. While Audio Lab is open, the video editor’s own shortcuts (Space, S, Delete, Ctrl+Z) do nothing behind it. Presets you save stay in this browser; use Export/Import in the presets row to back them up or move them. Noise reduction, gate, de-esser, pitch/speed and loudness are applied when you press Process.</p></div>';
M.appendChild(P);var open=false;function hp(o){open=o;P.style.display=o?'block':'none'}P.addEventListener('click',function(e){if(e.target===P||e.target.id==='alhx')hp(0)});
document.addEventListener('keydown',function(e){if(M.style.display!=='block')return;if(e.key==='Escape'&&open){e.stopImmediatePropagation();e.preventDefault();hp(0)}},true);
document.addEventListener('keydown',function(e){if(M.style.display!=='block'||e.defaultPrevented)return;var t=e.target||{},tx=t.tagName==='TEXTAREA'||(t.tagName==='INPUT'&&/^(text|number|search)$/.test(t.type)),k=e.key,kl=k.toLowerCase();
if(e.ctrlKey||e.metaKey){if(kl==='z'){if(tx)return;e.preventDefault();e.shiftKey?redo():undo()}else if(kl==='y'){if(tx)return;e.preventDefault();redo()}else if(kl==='s'){e.preventDefault();g('ald').click()}return}
if(tx||e.altKey||t.tagName==='SELECT')return;var act=null;
if(kl==='i')act='alt1';else if(kl==='o')act='alt2';else if(k==='0')act='alt3';
else if(kl==='l'||kl==='a'){e.preventDefault();var c=g(kl==='l'?'allp':'alo');if(c){c.checked=!c.checked;c.dispatchEvent(new Event('input',{bubbles:true}));c.dispatchEvent(new Event('change',{bubbles:true}))}return}
else if(kl==='v'){var b=M.querySelector('#alvw button:not(.on)');if(b)b.click();return}
else if(k==='?'||kl==='h'){e.preventDefault();hp(!open);return}
if(act){e.preventDefault();var bt=g(act);if(bt)bt.click()}});
var ob=document.getElementById('alb');if(ob)ob.addEventListener('click',function(){setTimeout(rec,80)});
new MutationObserver(function(){var n=g('aln').textContent;if(/^(Preset|Reading )/.test(n))sched()}).observe(g('aln'),{childList:true,characterData:true,subtree:true});
btns();
}catch(e){try{console.error('Audio Lab step 10',e)}catch(x){}}})();

;
/* ==================== Script 944 id="amiyo-al-s11-voice-fx" ==================== */
/* Audio Lab improvement 1: Voice effects. One-tap looks (Robot, Alien, Monster, Deep, Chipmunk, Child, Telephone, Megaphone, Walkie-talkie, Underwater, Cave, Hall, Ghost) built from pitch + robot + tremolo + echo + reverb + radio + drive + muffle sliders. Applied by Process; "Hear effect" plays the first 15 s of your selection with the effect. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-s11'))return;M.setAttribute('data-s11','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}},nap=function(){return new Promise(function(r){setTimeout(r,0)})};
var IDS=['fxr','fxt','fxm','fxe','fxf','fxv','fxs','fxa','fxd','fxu'];
function v(){var o={};IDS.forEach(function(i){o[i]=+g(i).value});return o}
function active(){var o=v();return IDS.some(function(i){if(i==='fxe'||i==='fxf'||i==='fxs')return false;return o[i]>0})}
function bq(x,type,f,Q,sr){var w=2*Math.PI*f/sr,c=Math.cos(w),al=Math.sin(w)/(2*Q),a0=1+al,a1=-2*c/a0,a2=(1-al)/a0,b0,b1,b2;if(type==='lp'){b0=(1-c)/2;b1=1-c;b2=b0}else{b0=(1+c)/2;b1=-(1+c);b2=b0}b0/=a0;b1/=a0;b2/=a0;var x1=0,x2=0,y1=0,y2=0;for(var i=0;i<x.length;i++){var xi=x[i],y=b0*xi+b1*x1+b2*x2-a1*y1-a2*y2;x2=x1;x1=xi;y2=y1;y1=y;x[i]=y}}
function rev(x,sr,mix,size,ch){var sc=.6+.9*size,ds=[29.7,37.1,41.1,43.7].map(function(m){return Math.round(m*sc*sr/1000)+ch*23}),gg=.72+.2*size,B=ds.map(function(d){return new Float32Array(d)}),ix=[0,0,0,0],lp=[0,0,0,0],A=[Math.round(sr*.005),Math.round(sr*.0017)].map(function(d){return{b:new Float32Array(d),i:0}}),n=x.length;
for(var i=0;i<n;i++){var xi=x[i],s=0,k;for(k=0;k<4;k++){var bb=B[k],y=bb[ix[k]];lp[k]=y*.7+lp[k]*.3;bb[ix[k]]=xi*.25+lp[k]*gg;if(++ix[k]>=ds[k])ix[k]=0;s+=y}
for(k=0;k<2;k++){var a=A[k],yy=-.5*s+a.b[a.i];a.b[a.i]=s+.5*yy;if(++a.i>=a.b.length)a.i=0;s=yy}x[i]=xi*(1-mix*.4)+s*mix*1.2}}
function fx(r){var p=v();if(!active())return r;var sr=r.sampleRate,tail=0;
if(p.fxv>0)tail=Math.max(tail,Math.round(sr*(1+3*p.fxs/100)));if(p.fxm>0){var fb=Math.min(.9,p.fxf/100),rep=fb>.05?Math.min(8,Math.ceil(Math.log(.02)/Math.log(fb))):1;tail=Math.max(tail,Math.round(Math.min(6,rep*p.fxe/1000)*sr))}
var n=r.length+tail,nb=new AudioBuffer({numberOfChannels:r.numberOfChannels,length:n,sampleRate:sr});
for(var c=0;c<r.numberOfChannels;c++){var x=new Float32Array(n);x.set(r.getChannelData(c));var i;
if(p.fxa>0){var w=Float32Array.from(x);bq(w,'hp',420,.7,sr);bq(w,'lp',3300,.7,sr);bq(w,'lp',3300,.7,sr);var m=p.fxa/100;for(i=0;i<n;i++)x[i]=x[i]*(1-m)+w[i]*m*1.5}
if(p.fxu>0){bq(x,'lp',8000*Math.pow(.05,p.fxu/100),.8,sr)}
if(p.fxr>0){var m2=p.fxr/100,wr=2*Math.PI*55/sr;for(i=0;i<n;i++)x[i]=x[i]*(1-m2)+x[i]*Math.sin(wr*i)*m2*1.4}
if(p.fxt>0){var d2=p.fxt/100,wt=2*Math.PI*6/sr;for(i=0;i<n;i++)x[i]*=1-d2+d2*(.5+.5*Math.sin(wt*i))}
if(p.fxd>0){var k=1+12*p.fxd/100,tk=Math.tanh(k);for(i=0;i<n;i++)x[i]=Math.tanh(k*x[i])/tk}
if(p.fxm>0){var dl=Math.max(1,Math.round(p.fxe*sr/1000)),fb2=Math.min(.9,p.fxf/100),mx=p.fxm/100,wv=new Float32Array(n);for(i=dl;i<n;i++)wv[i]=x[i-dl]+fb2*wv[i-dl];for(i=0;i<n;i++)x[i]+=mx*wv[i]}
if(p.fxv>0)rev(x,sr,p.fxv/100,p.fxs/100,c);
nb.copyToChannel(x,c)}return nb}
/* UI */
var secs=M.querySelectorAll('details.alsec'),anchor=secs[0];secs.forEach(function(s){if(/Pitch/.test(s.querySelector('summary span').textContent))anchor=s});
var PR={'🤖 Robot':{fxr:100,fxv:10,fxs:20},'👽 Alien':{alpt:4,fxr:60,fxt:40,fxv:25},'👹 Monster':{alpt:-9,fxd:40,fxv:20,fxs:50},'🗿 Deep':{alpt:-4,fxv:8},'🐿 Chipmunk':{alpt:8},'🧒 Child':{alpt:5},'📞 Telephone':{fxa:100,fxd:20},'📢 Megaphone':{fxa:70,fxd:55,fxm:15,fxe:90},'📟 Walkie-talkie':{fxa:100,fxd:35},'🌊 Underwater':{fxu:80,fxt:25,fxv:20},'🕳 Cave':{fxm:35,fxe:250,fxf:45,fxv:45,fxs:100},'🏛 Hall':{fxv:35,fxs:70},'👻 Ghost':{alpt:-2,fxv:55,fxs:100,fxt:30,fxm:30,fxe:400,fxf:50,fxu:30}};
var R=function(i,l,mn,mx,df,st){return'<label>'+l+': <b>'+df+'</b></label><input type="range" id="'+i+'" min="'+mn+'" max="'+mx+'" step="'+(st||1)+'" value="'+df+'">'};
var d=document.createElement('details');d.className='alsec';
d.innerHTML='<summary><span>🎭 Voice effects</span><i></i></summary><div class="alin"><div class="row" id="fxp" style="flex-wrap:wrap">'+Object.keys(PR).map(function(k){return'<button type="button" data-k="'+k+'">'+k+'</button>'}).join('')+'</div>'+R('fxr','Robot (%)',0,100,0)+R('fxt','Tremolo / wobble (%)',0,100,0)+R('fxa','Radio / telephone band (%)',0,100,0)+R('fxd','Drive / distortion (%)',0,100,0)+R('fxu','Muffle — underwater (%)',0,100,0)+R('fxm','Echo mix (%)',0,100,0)+R('fxe','Echo time (ms)',40,800,250,10)+R('fxf','Echo repeats (%)',0,85,35)+R('fxv','Reverb mix (%)',0,100,0)+R('fxs','Reverb room size (%)',0,100,40)+'<div class="row"><button type="button" id="fxh">🎧 Hear effect (first 15 s)</button><button type="button" id="fxz">↺ Effects off</button></div><div style="font-size:11px;color:#b9b2a2">Looks that change pitch use the Pitch slider above. Everything is applied by ⚡ Process.</div></div>';
anchor.parentNode.insertBefore(d,anchor.nextSibling);var bd=d.querySelector('summary i');
function ui(){IDS.forEach(function(i){var b=g(i).previousElementSibling.querySelector('b');if(b)b.textContent=g(i).value});var n=IDS.filter(function(i){return i!=='fxe'&&i!=='fxf'&&i!=='fxs'&&+g(i).value>0}).length;bd.textContent=n?'● '+n+' active':''}
function set(id,val){var e=g(id);if(!e)return;e.value=val;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))}
function off(){IDS.forEach(function(i){set(i,{fxe:250,fxf:35,fxs:40}[i]||0)})}
d.addEventListener('input',ui);
g('fxp').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;off();set('alpt',0);var p=PR[b.getAttribute('data-k')];Object.keys(p).forEach(function(k){set(k,p[k])});ui();g('aln').textContent=b.getAttribute('data-k')+' look set. Press 🎧 Hear effect, then ⚡ Process.'});
g('fxz').onclick=function(){off();set('alpt',0);ui()};
var ps=g('alps');ps.addEventListener('change',function(){if(ps.value==='rst')setTimeout(function(){off();ui()},0)});
var ac=null,node=null;
g('fxh').onclick=async function(){var b=this;if(node){try{node.stop()}catch(e){}node=null;b.textContent='🎧 Hear effect (first 15 s)';return}var s=S();if(!s.src){g('aln').textContent='Choose a file first.';return}
try{var D=s.src,n=D.length,sr=D.sampleRate,a=Math.floor(Math.min(+g('als').value,+g('ale').value)/100*n),e=Math.floor(Math.max(+g('als').value,+g('ale').value)/100*n);e=Math.min(e,a+15*sr);if(e-a<sr*.1)e=Math.min(n,a+sr);
var buf=new AudioBuffer({numberOfChannels:D.numberOfChannels,length:e-a,sampleRate:sr});for(var c=0;c<D.numberOfChannels;c++)buf.copyToChannel(D.getChannelData(c).subarray(a,e),c);
g('aln').textContent='Rendering effect…';if(window.__alDSP&&(+g('alpt').value!==0||+g('alsx').value!==100)){var t=await window.__alDSP.tp(buf,+g('alpt').value,+g('alsx').value/100);if(t)buf=t}
await nap();buf=fx(buf);ac=ac||new(window.AudioContext||window.webkitAudioContext)();ac.resume();node=ac.createBufferSource();node.buffer=buf;node.connect(ac.destination);var me=node;me.onended=function(){if(node===me){node=null;b.textContent='🎧 Hear effect (first 15 s)'}};me.start();b.textContent='■ Stop';g('aln').textContent='Playing the effect. Press ⚡ Process to apply it to the whole selection.'}catch(er){g('aln').textContent='Effect preview failed: '+er.message}};
var pp=window.__alPitch;window.__alPitch=async function(r){r=pp?await pp(r):r;if(!active())return r;g('aln').textContent='Adding voice effects…';await nap();return fx(r)};
g('alq').addEventListener('click',function(){if(node){try{node.stop()}catch(e){}node=null}});
ui();
}catch(e){try{console.error('Audio Lab voice effects',e)}catch(x){}}})();

;
/* ==================== Script 945 id="amiyo-al-s12-record" ==================== */
/* Audio Lab improvement 2: record from the microphone inside Audio Lab. Pick the input device, optional 3-2-1 countdown, live level meter with peak hold and clip warning, pause/resume, timer. Records clean mono audio (browser noise suppression / auto-gain off unless you tick it) and opens it straight in Audio Lab. R starts / stops. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-s12'))return;M.setAttribute('data-s12','1');
var g=function(i){return M.querySelector('#'+i)},msg=function(t){g('aln').textContent=t};
var zone=M.querySelector('.alzone');if(!zone)return;
zone.insertAdjacentHTML('beforeend','<div class="row" style="margin-top:6px"><button type="button" id="rcb">🔴 Record from microphone</button></div><div id="rcp" style="display:none;margin-top:8px;padding:10px;border:1px solid #3a352c;border-radius:10px;background:#1d1b17"><label style="margin-top:0">Microphone</label><select id="rcd"><option value="">Default microphone</option></select><div class="row"><label style="margin:0"><input type="checkbox" id="rcn"> Browser noise suppression + auto-gain</label><label style="margin:0"><input type="checkbox" id="rcc" checked> 3-2-1 countdown</label></div><div style="position:relative;height:14px;background:#2a2620;border-radius:7px;overflow:hidden;margin-top:8px"><div id="rcl" style="height:100%;width:0;background:#6bd36b"></div><i id="rck" style="position:absolute;top:0;bottom:0;width:2px;background:#fff;left:0"></i></div><div id="rct" style="font:13px monospace;margin:6px 0;color:#b9b2a2">Ready. Speak at a normal volume — the bar should stay in the green.</div><div class="row"><button type="button" class="pri" id="rcs">● Start (R)</button><button type="button" id="rcu" disabled>⏸ Pause</button><button type="button" id="rcx">Cancel</button></div></div>');
var P={st:0,ac:null,ms:null,pr:null,ch:[],n:0,pk:0,hold:0,holdT:0,clip:0,t:0,paused:false,raf:0,cd:0};/* st: 0 idle, 1 countdown, 2 recording */
var MAXS=1200,fmt=function(s){var m=Math.floor(s/60);return m+':'+('0'+(s-m*60).toFixed(1)).slice(-4)};
function devs(){if(!navigator.mediaDevices||!navigator.mediaDevices.enumerateDevices)return;navigator.mediaDevices.enumerateDevices().then(function(l){var s=g('rcd'),cur=s.value,h='<option value="">Default microphone</option>';l.forEach(function(d,i){if(d.kind==='audioinput'&&d.deviceId&&d.deviceId!=='default')h+='<option value="'+d.deviceId+'">'+(d.label||'Microphone '+(i+1)).replace(/[<&]/g,'')+'</option>'});s.innerHTML=h;s.value=cur}).catch(function(){})}
function meter(){P.raf=0;if(!P.pr)return;var db=P.pk>1e-5?20*Math.log10(P.pk):-90,w=Math.max(0,Math.min(100,(db+60)/60*100)),b=g('rcl');b.style.width=w+'%';b.style.background=db>-1?'#e25555':db>-9?'#e0b040':'#6bd36b';P.pk*=.85;var now=performance.now();if(db>P.hold||now-P.holdT>1200){P.hold=db;P.holdT=now}g('rck').style.left=Math.max(0,Math.min(100,(P.hold+60)/60*100))+'%';
if(P.st===2){var s=P.n/P.ac.sampleRate;g('rct').textContent=(P.paused?'⏸ ':'● ')+fmt(s)+'   peak '+(P.hold>-89?P.hold.toFixed(1):'−∞')+' dBFS'+(P.clip?'   ⚠ CLIPPING — move back or lower the input level':'');if(s>=MAXS)stop()}P.raf=requestAnimationFrame(meter)}
async function open(){if(P.pr)return true;if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){msg('This browser cannot record. Open the app over https:// or localhost in Chrome, Edge, Firefox or Safari.');return false}
var ns=g('rcn').checked,id=g('rcd').value;try{P.ms=await navigator.mediaDevices.getUserMedia({audio:{deviceId:id?{exact:id}:undefined,echoCancellation:ns,noiseSuppression:ns,autoGainControl:ns,channelCount:1}})}catch(e){msg(e&&e.name==='NotAllowedError'?'Microphone blocked. Allow it from the lock icon in the address bar, then press Start again.':'Could not open the microphone: '+(e&&e.message||e));return false}
devs();P.ac=new(window.AudioContext||window.webkitAudioContext)();await P.ac.resume();var src=P.ac.createMediaStreamSource(P.ms),pr=P.ac.createScriptProcessor(4096,1,1),z=P.ac.createGain();z.gain.value=0;
pr.onaudioprocess=function(e){var d=e.inputBuffer.getChannelData(0),pk=0;for(var i=0;i<d.length;i++){var a=d[i]<0?-d[i]:d[i];if(a>pk)pk=a}if(pk>P.pk)P.pk=pk;if(pk>=.99)P.clip=1;if(P.st===2&&!P.paused){P.ch.push(new Float32Array(d));P.n+=d.length}};
src.connect(pr);pr.connect(z);z.connect(P.ac.destination);P.pr=pr;if(!P.raf)P.raf=requestAnimationFrame(meter);return true}
function close(){if(P.raf){cancelAnimationFrame(P.raf);P.raf=0}try{if(P.pr){P.pr.onaudioprocess=null;P.pr.disconnect()}}catch(e){}try{if(P.ms)P.ms.getTracks().forEach(function(t){t.stop()})}catch(e){}try{if(P.ac)P.ac.close()}catch(e){}P.pr=P.ms=P.ac=null;P.st=0;P.paused=false;clearInterval(P.cd);g('rcl').style.width='0';g('rcs').textContent='● Start (R)';g('rcu').disabled=true;g('rcu').textContent='⏸ Pause'}
function wav(f,sr){var n=f.length,b=new ArrayBuffer(44+n*4),v=new DataView(b),ws=function(o,s){for(var i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};ws(0,'RIFF');v.setUint32(4,36+n*4,true);ws(8,'WAVE');ws(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,3,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*4,true);v.setUint16(32,4,true);v.setUint16(34,32,true);ws(36,'data');v.setUint32(40,n*4,true);new Float32Array(b,44).set(f);return b}
function stop(){if(P.st!==2)return;var sr=P.ac.sampleRate,tot=P.n,all=new Float32Array(tot),o=0;P.ch.forEach(function(c){all.set(c,o);o+=c.length});var clip=P.clip;close();P.ch=[];P.n=0;
if(tot<sr*.3){g('rct').textContent='Too short — nothing saved. Press Start and try again.';return}
var d=new Date(),f=new File([wav(all,sr)],'Recording-'+('0'+d.getHours()).slice(-2)+('0'+d.getMinutes()).slice(-2)+('0'+d.getSeconds()).slice(-2)+'.wav',{type:'audio/wav'}),dt=new DataTransfer();dt.items.add(f);var fi=g('alf');fi.files=dt.files;fi.dispatchEvent(new Event('change'));
g('rct').textContent='Saved '+fmt(tot/sr)+' — opened below.'+(clip?' It clipped; consider recording again a bit quieter.':'');g('rcp').style.display='none'}
async function start(){if(P.st===2){stop();return}if(P.st===1)return;g('rcs').disabled=true;var ok=await open();g('rcs').disabled=false;if(!ok){close();return}P.ch=[];P.n=0;P.clip=0;P.hold=-90;P.paused=false;
function go(){P.st=2;g('rcs').textContent='■ Stop (R)';g('rcu').disabled=false;msg('Recording… press Stop when done.')}
if(g('rcc').checked){P.st=1;var c=3;g('rct').textContent='Get ready… 3';P.cd=setInterval(function(){c--;if(c<=0){clearInterval(P.cd);go()}else g('rct').textContent='Get ready… '+c},1000)}else go()}
g('rcb').onclick=function(){var p=g('rcp');p.style.display=p.style.display==='none'?'block':'none';if(p.style.display==='block')devs()};
g('rcs').onclick=start;g('rcu').onclick=function(){if(P.st!==2)return;P.paused=!P.paused;this.textContent=P.paused?'▶ Resume':'⏸ Pause'};
g('rcx').onclick=function(){close();P.ch=[];P.n=0;g('rct').textContent='Cancelled.';g('rcp').style.display='none'};
g('alq').addEventListener('click',function(){if(P.pr){close();P.ch=[];P.n=0}});
document.addEventListener('keydown',function(e){if(M.style.display!=='block'||g('rcp').style.display==='none'||e.ctrlKey||e.metaKey||e.altKey)return;var t=e.target||{};if(t.tagName==='TEXTAREA'||t.tagName==='SELECT'||(t.tagName==='INPUT'&&/^(text|number|search)$/.test(t.type)))return;if(e.key==='r'||e.key==='R'){e.preventDefault();start()}});
var ht=M.querySelector('#alhelp table');if(ht)ht.insertAdjacentHTML('beforeend','<tr><td style="padding:3px 6px"><code style="background:#2a2620;border-radius:5px;padding:1px 6px">R</code></td><td style="padding:3px 6px">Start / stop microphone recording (panel open)</td></tr>');
}catch(e){try{console.error('Audio Lab record',e)}catch(x){}}})();

;
/* ==================== Script 946 id="amiyo-al-s13-eq-comp" ==================== */
/* Audio Lab improvement 3: Parametric EQ (6 bands, draggable on a live frequency-response graph with the file's spectrum behind it; wheel = Q; double-click = reset) heard live while playing and applied by Process; Compressor section with attack / release / knee, a transfer-curve graph (drag to set threshold; wheel = ratio), a live gain-reduction meter and presets. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-s13'))return;M.setAttribute('data-s13','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}},nap=function(){return new Promise(function(r){setTimeout(r,0)})};
/*DSP-START*/
function coef(t,f,gn,q,fs){var A=Math.pow(10,gn/40),w=2*Math.PI*f/fs,c=Math.cos(w),s=Math.sin(w),al=s/(2*q),sa=2*Math.sqrt(A)*(s/(2*.7071)),b0,b1,b2,a0,a1,a2;
if(t==='lowshelf'){b0=A*((A+1)-(A-1)*c+sa);b1=2*A*((A-1)-(A+1)*c);b2=A*((A+1)-(A-1)*c-sa);a0=(A+1)+(A-1)*c+sa;a1=-2*((A-1)+(A+1)*c);a2=(A+1)+(A-1)*c-sa}
else if(t==='highshelf'){b0=A*((A+1)+(A-1)*c+sa);b1=-2*A*((A-1)+(A+1)*c);b2=A*((A+1)+(A-1)*c-sa);a0=(A+1)-(A-1)*c+sa;a1=2*((A-1)-(A+1)*c);a2=(A+1)-(A-1)*c-sa}
else{b0=1+al*A;b1=-2*c;b2=1-al*A;a0=1+al/A;a1=-2*c;a2=1-al/A}return[b0/a0,b1/a0,b2/a0,a1/a0,a2/a0]}
function mag(k,w){var cw=Math.cos(w),sw=Math.sin(w),c2=Math.cos(2*w),s2=Math.sin(2*w),nr=k[0]+k[1]*cw+k[2]*c2,ni=-(k[1]*sw+k[2]*s2),dr=1+k[3]*cw+k[4]*c2,di=-(k[3]*sw+k[4]*s2);return 10*Math.log10((nr*nr+ni*ni)/(dr*dr+di*di)+1e-30)}
function run(x,k){var x1=0,x2=0,y1=0,y2=0,b0=k[0],b1=k[1],b2=k[2],a1=k[3],a2=k[4];for(var i=0;i<x.length;i++){var xi=x[i],y=b0*xi+b1*x1+b2*x2-a1*y1-a2*y2;x2=x1;x1=xi;y2=y1;y1=y;x[i]=y}}
function tcurve(x,t,r,k){var kk=Math.max(k,.01);if(2*(x-t)<-kk)return x;if(2*Math.abs(x-t)<=kk){var d=x-t+kk/2;return x+(1/r-1)*d*d/(2*kk)}return t+(x-t)/r}
/*DSP-END*/
var D0=['lowshelf,80,0,0.7','peaking,250,0,1','peaking,800,0,1','peaking,2500,0,1','peaking,5000,0,1','highshelf,10000,0,0.7'],COL=['#ff7a3d','#ffb43d','#9be35b','#4fd0c8','#ff9c6a','#c58bff'];
var st=document.createElement('style');st.textContent='#alm .al13 canvas{display:block;width:100%;background:#141210;border-radius:6px;margin:6px 0;touch-action:none}#alm .al13 .chips button{padding:4px 10px}#alm .al13 .chips button.on{background:#ff7a3d;color:#111}';document.head.appendChild(st);
var secs=M.querySelectorAll('details.alsec'),aT=null,aD=null;secs.forEach(function(s){var t=s.querySelector('summary span').textContent;if(/Tone/.test(t))aT=s;if(/Dynamics/.test(t))aD=s});aT=aT||secs[0];aD=aD||secs[secs.length-1];
var hid='';D0.forEach(function(v,i){hid+='<input type="hidden" id="eqb'+(i+1)+'" value="'+v+'">'});
var e=document.createElement('details');e.className='alsec';e.innerHTML='<summary><span>📈 Parametric EQ (6 bands)</span><i></i></summary><div class="alin al13">'+hid+'<canvas id="eqg" style="height:180px"></canvas><div class="row chips" id="eqc" style="flex-wrap:wrap">'+D0.map(function(v,i){return'<button type="button" data-b="'+i+'" style="border-left:4px solid '+COL[i]+'">Band '+(i+1)+'</button>'}).join('')+'</div><div id="eqv" style="font:12px monospace;color:#b9b2a2;margin:4px 0"></div><label>Frequency</label><input type="range" data-e="f" min="0" max="1000" value="500"><label>Gain (dB)</label><input type="range" data-e="g" min="-18" max="18" step="0.5" value="0"><label>Width Q (low = wide)</label><input type="range" data-e="q" min="0.2" max="10" step="0.1" value="1"><label>Type</label><select data-e="t"><option value="peaking">Bell</option><option value="lowshelf">Low shelf</option><option value="highshelf">High shelf</option></select><div class="row" id="eqp" style="flex-wrap:wrap"><button type="button" data-p="flat">Flat</button><button type="button" data-p="pres">Voice presence</button><button type="button" data-p="mud">De-mud</button><button type="button" data-p="air">Air</button><button type="button" data-p="warm">Warm</button></div><div style="font-size:11px;color:#b9b2a2">Drag a dot: left/right = frequency, up/down = gain. Mouse wheel changes width; double-click resets a band. The curve includes the 3-band Tone EQ. Grey = your file’s spectrum.</div></div>';
aT.parentNode.insertBefore(e,aT.nextSibling);
var c=document.createElement('details');c.className='alsec';c.innerHTML='<summary><span>🗜 Compressor — attack, release, knee</span><i></i></summary><div class="alin al13"><canvas id="cpg" style="height:150px"></canvas><div id="cpm" style="font:12px monospace;color:#b9b2a2">Gain reduction: play with Live preview on</div><div style="height:8px;background:#2a2620;border-radius:4px;overflow:hidden;margin:4px 0"><div id="cpb" style="height:100%;width:0;background:#e0b040"></div></div><label>Attack (ms): <b>10</b></label><input type="range" id="cpa" min="1" max="200" value="10"><label>Release (ms): <b>150</b></label><input type="range" id="cpr" min="20" max="1000" step="10" value="150"><label>Knee (dB, 0 = hard): <b>6</b></label><input type="range" id="cpk" min="0" max="40" value="6"><div class="row" id="cpp" style="flex-wrap:wrap"><button type="button" data-p="gen">Gentle voice</button><button type="button" data-p="bro">Broadcast</button><button type="button" data-p="pun">Punchy</button><button type="button" data-p="smo">Smooth leveler</button></div><div style="font-size:11px;color:#b9b2a2">Threshold and ratio are the “Compressor” sliders in Dynamics &amp; stereo — or drag the curve: left/right sets the threshold, mouse wheel sets the ratio.</div></div>';
aD.parentNode.insertBefore(c,aD.nextSibling);
/* ---- EQ ---- */
var B=[],sel=0,SP=null,LIVE=[],eg=g('eqg'),eb=e.querySelector('summary i');
function rd(){B=D0.map(function(_,i){var p=g('eqb'+(i+1)).value.split(',');return{t:p[0],f:+p[1],g:+p[2],q:+p[3]}})}
function wr(i){var b=B[i];g('eqb'+(i+1)).value=b.t+','+Math.round(b.f)+','+b.g.toFixed(1)+','+b.q.toFixed(2);g('eqb'+(i+1)).dispatchEvent(new Event('input',{bubbles:true}))}
var fx=function(f,W){return Math.log(f/20)/Math.log(1000)*W},xf=function(x,W){return 20*Math.pow(1000,x/W)};
function spec(buf){var N=4096,d=buf.getChannelData(0),B2=N/2,P=new Float64Array(B2),re=new Float32Array(N),im=new Float32Array(N),F=Math.min(60,Math.max(1,Math.floor(d.length/N))),T=ft(N),fr=0;
for(var k=0;k<F;k++){var o=F>1?Math.floor(k*(d.length-N)/(F-1)):0;if(o<0)o=0;for(var i=0;i<N;i++){re[i]=(d[o+i]||0)*T.w[i];im[i]=0}fft(re,im,T);for(i=0;i<B2;i++)P[i]+=re[i]*re[i]+im[i]*im[i];fr++}return{p:P,sr:buf.sampleRate,N:N,n:fr}}
var FT={};function ft(N){if(FT[N])return FT[N];var c=new Float32Array(N/2),s=new Float32Array(N/2),w=new Float32Array(N),r=new Uint32Array(N),bits=Math.round(Math.log2(N)),i,b;for(i=0;i<N/2;i++){c[i]=Math.cos(2*Math.PI*i/N);s[i]=-Math.sin(2*Math.PI*i/N)}for(i=0;i<N;i++){w[i]=.5-.5*Math.cos(2*Math.PI*i/N);var x=i,y=0;for(b=0;b<bits;b++){y=(y<<1)|(x&1);x>>=1}r[i]=y}return FT[N]={c:c,s:s,w:w,r:r}}
function fft(re,im,T){var N=re.length,i,j,k;for(i=0;i<N;i++){j=T.r[i];if(j>i){var t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t}}for(var len=2;len<=N;len<<=1){var h=len>>1,s2=N/len;for(i=0;i<N;i+=len)for(k=0;k<h;k++){var wr_=T.c[k*s2],wi=T.s[k*s2],a=i+k,b=a+h,xr=re[b]*wr_-im[b]*wi,xi=re[b]*wi+im[b]*wr_;re[b]=re[a]-xr;im[b]=im[a]-xi;re[a]+=xr;im[a]+=xi}}}
function legacy(){return[['lowshelf',100,+g('aq1').value,.7],['peaking',1000,+g('aq2').value,1],['highshelf',8000,+g('aq3').value,.7]]}
function drawEQ(){if(!eg.clientWidth)return;var W=eg.width=Math.round(eg.clientWidth*2),H=eg.height=Math.round(eg.clientHeight*2),x=eg.getContext('2d'),R=18,Y=function(db){return H/2-Math.max(-R,Math.min(R,db))/R*(H/2-6)};x.fillStyle='#141210';x.fillRect(0,0,W,H);
if(SP){var pts=[],mx=-1e9,mn=1e9,i;for(i=0;i<W;i+=3){var f=xf(i,W),bi=Math.min(SP.N/2-1,Math.round(f/(SP.sr/2)*SP.N/2)),db=10*Math.log10(SP.p[bi]/SP.n+1e-12);pts.push(db);if(db>mx)mx=db;if(db<mn)mn=db}var lo=mx-70;x.fillStyle='rgba(120,114,100,.45)';x.beginPath();x.moveTo(0,H);pts.forEach(function(v,k){x.lineTo(k*3,H-Math.max(0,Math.min(1,(v-lo)/70))*H*.75)});x.lineTo(W,H);x.fill()}
x.strokeStyle='#2a2620';x.fillStyle='#b9b2a2';x.font='18px sans-serif';x.lineWidth=1;[-12,-6,0,6,12].forEach(function(db){x.beginPath();x.moveTo(0,Y(db));x.lineTo(W,Y(db));x.strokeStyle=db?'#2a2620':'#4a443a';x.stroke();x.fillText((db>0?'+':'')+db+' dB',4,Y(db)-3)});[100,1000,10000].forEach(function(f){var px=fx(f,W);x.strokeStyle='#2a2620';x.beginPath();x.moveTo(px,0);x.lineTo(px,H);x.stroke();x.fillText(f>=1000?f/1000+'k':f,px+4,H-6)});
var all=legacy().concat(B.map(function(b){return[b.t,b.f,b.g,b.q]})).filter(function(b){return Math.abs(b[2])>=.05}).map(function(b){return coef(b[0],b[1],b[2],b[0]==='peaking'?b[3]:.7071,48000)});
x.beginPath();for(var p=0;p<=W;p+=4){var w=2*Math.PI*xf(p,W)/48000,s=0;all.forEach(function(k){s+=mag(k,w)});p?x.lineTo(p,Y(s)):x.moveTo(p,Y(s))}x.strokeStyle='#ff7a3d';x.lineWidth=3;x.stroke();x.lineTo(W,Y(0));x.lineTo(0,Y(0));x.fillStyle='rgba(255,122,61,.15)';x.fill();
B.forEach(function(b,i){var px=fx(b.f,W),py=Y(b.g);x.beginPath();x.arc(px,py,i===sel?14:10,0,7);x.fillStyle=COL[i];x.fill();x.lineWidth=i===sel?4:2;x.strokeStyle='#fff';x.stroke();x.fillStyle='#111';x.font='bold 16px sans-serif';x.textAlign='center';x.fillText(i+1,px,py+6);x.textAlign='left'});
eb.textContent=B.some(function(b){return Math.abs(b.g)>=.05})?'● '+B.filter(function(b){return Math.abs(b.g)>=.05}).length+' active':''}
function edit(){var b=B[sel],es=e.querySelectorAll('[data-e]');es.forEach(function(el){var k=el.getAttribute('data-e');el.value=k==='f'?Math.round(Math.log(b.f/20)/Math.log(1000)*1000):k==='g'?b.g:k==='q'?b.q:b.t});g('eqv').textContent='Band '+(sel+1)+': '+Math.round(b.f)+' Hz   '+(b.g>0?'+':'')+b.g.toFixed(1)+' dB   Q '+b.q.toFixed(2);e.querySelectorAll('#eqc button').forEach(function(x,i){x.classList.toggle('on',i===sel)})}
function live(){var t0=0;LIVE.forEach(function(nd,i){if(!nd||!B[i])return;var b=B[i],t=nd.context.currentTime,sa=function(p,v){try{p.setTargetAtTime(v,t,.02)}catch(er){p.value=v}};if(nd.type!==b.t)nd.type=b.t;sa(nd.frequency,b.f);sa(nd.gain,b.g);sa(nd.Q,b.q)})}
function refresh(){rd();edit();drawEQ();live()}
e.addEventListener('input',function(ev){var t=ev.target;if(t.id&&/^eqb\d$/.test(t.id)){refresh();return}var k=t.getAttribute&&t.getAttribute('data-e');if(!k)return;var b=B[sel];if(k==='f')b.f=20*Math.pow(1000,+t.value/1000);else if(k==='g')b.g=+t.value;else if(k==='q')b.q=+t.value;else b.t=t.value;wr(sel)});
e.addEventListener('change',function(ev){var t=ev.target;if(t.getAttribute&&t.getAttribute('data-e')==='t'){B[sel].t=t.value;wr(sel)}});
e.querySelector('#eqc').addEventListener('click',function(ev){var b=ev.target.closest('button');if(!b)return;sel=+b.getAttribute('data-b');edit();drawEQ()});
var PE={flat:null,pres:{1:[250,-2.5,1],3:[3500,3,1]},mud:{1:[300,-4,1.2]},air:{5:[10000,3,.7]},warm:{0:[120,3,.7],4:[6000,-1.5,1]}};
e.querySelector('#eqp').addEventListener('click',function(ev){var b=ev.target.closest('button');if(!b)return;rd();D0.forEach(function(v,i){var p=v.split(',');B[i]={t:p[0],f:+p[1],g:0,q:+p[3]}});var P=PE[b.getAttribute('data-p')];if(P)Object.keys(P).forEach(function(i){B[i].f=P[i][0];B[i].g=P[i][1];B[i].q=P[i][2]});B.forEach(function(_,i){wr(i)});g('aln').textContent='EQ preset applied — play to hear it live.'});
function pdn(ev){var r=eg.getBoundingClientRect(),W=r.width,H=r.height,px=ev.clientX-r.left,py=ev.clientY-r.top,best=-1,bd=26;B.forEach(function(b,i){var X=fx(b.f,W),Y=H/2-b.g/18*(H/2-3),dd=Math.hypot(px-X,py-Y);if(dd<bd){bd=dd;best=i}});return best}
var drag=-1;eg.addEventListener('pointerdown',function(ev){var i=pdn(ev);if(i<0)return;drag=i;sel=i;edit();try{eg.setPointerCapture(ev.pointerId)}catch(x){}ev.preventDefault()});
eg.addEventListener('pointermove',function(ev){if(drag<0)return;var r=eg.getBoundingClientRect(),W=r.width,H=r.height,px=Math.max(0,Math.min(W,ev.clientX-r.left)),py=Math.max(0,Math.min(H,ev.clientY-r.top)),b=B[drag];b.f=Math.max(20,Math.min(20000,xf(px,W)));b.g=Math.round(Math.max(-18,Math.min(18,(H/2-py)/(H/2-3)*18))*2)/2;wr(drag)});
['pointerup','pointercancel'].forEach(function(k){eg.addEventListener(k,function(){drag=-1})});
eg.addEventListener('wheel',function(ev){var i=pdn(ev);if(i<0)i=sel;ev.preventDefault();sel=i;var b=B[i];b.q=Math.max(.2,Math.min(10,b.q*Math.exp(-ev.deltaY*.002)));wr(i)},{passive:false});
eg.addEventListener('dblclick',function(ev){var i=pdn(ev);if(i<0)return;B[i].g=0;wr(i)});
var ph=window.__alHum;window.__alHum=function(ac,n){var l=ph?ph(ac,n):n;LIVE=[];B.forEach(function(b){var nd=ac.createBiquadFilter();nd.type=b.t;nd.frequency.value=b.f;nd.gain.value=b.g;nd.Q.value=b.q;l.connect(nd);l=nd;LIVE.push(nd)});return l};
var pp=window.__alPitch;window.__alPitch=async function(r){r=pp?await pp(r):r;var act=B.filter(function(b){return Math.abs(b.g)>=.05&&b.f<r.sampleRate*.45});if(!act.length)return r;g('aln').textContent='Applying EQ…';await nap();for(var ch=0;ch<r.numberOfChannels;ch++){var x=r.getChannelData(ch);act.forEach(function(b){run(x,coef(b.t,b.f,b.g,b.t==='peaking'?b.q:.7071,r.sampleRate))})}return r};
var lastSrc=null;function sync(){var s=S();if(s.src!==lastSrc){lastSrc=s.src;SP=null;if(s.src){try{SP=spec(s.src)}catch(er){}}drawEQ()}}
new MutationObserver(sync).observe(g('aln'),{childList:true,characterData:true,subtree:true});
['aq1','aq2','aq3'].forEach(function(i){g(i).addEventListener('input',drawEQ)});
e.addEventListener('toggle',function(){if(e.open){sync();setTimeout(refresh,30)}});
/* ---- Compressor ---- */
var cg=g('cpg'),cm=g('cpm'),cb=g('cpb'),craf=0;window.__alCP={a:.01,r:.15,k:6};
function cp(){var o=window.__alCP;o.a=+g('cpa').value/1000;o.r=+g('cpr').value/1000;o.k=+g('cpk').value;[['cpa'],['cpr'],['cpk']].forEach(function(k){var b=g(k[0]).previousElementSibling.querySelector('b');if(b)b.textContent=g(k[0]).value});
var G=window.__alG&&window.__alG();if(G&&G.cp){var t=G.cp.context.currentTime;G.cp.attack.setTargetAtTime(o.a,t,.02);G.cp.release.setTargetAtTime(o.r,t,.02);G.cp.knee.setTargetAtTime(o.k,t,.02)}
var n=(+g('cpa').value!==10)+(+g('cpr').value!==150)+(+g('cpk').value!==6);c.querySelector('summary i').textContent=n?'● '+n+' changed':'';drawC()}
function drawC(){if(!cg.clientWidth)return;var W=cg.width=Math.round(cg.clientWidth*2),H=cg.height=Math.round(cg.clientHeight*2),x=cg.getContext('2d'),t=+g('alct').value,r=+g('alcr').value,k=+g('cpk').value,X=function(db){return(db+60)/60*W},Y=function(db){return H-(db+60)/60*H};x.fillStyle='#141210';x.fillRect(0,0,W,H);x.strokeStyle='#2a2620';x.fillStyle='#b9b2a2';x.font='16px sans-serif';[-48,-36,-24,-12].forEach(function(d){x.beginPath();x.moveTo(X(d),0);x.lineTo(X(d),H);x.moveTo(0,Y(d));x.lineTo(W,Y(d));x.stroke();x.fillText(d,X(d)+3,H-4)});
x.strokeStyle='#6c665a';x.beginPath();x.moveTo(0,H);x.lineTo(W,0);x.stroke();if(t>=0){x.fillStyle='#b9b2a2';x.fillText('Compressor off (threshold 0)',10,24);return}
x.strokeStyle='#ff7a3d';x.lineWidth=3;x.beginPath();for(var i=0;i<=120;i++){var d=-60+i/2,o=tcurve(d,t,r,k);i?x.lineTo(X(d),Y(o)):x.moveTo(X(d),Y(o))}x.stroke();x.setLineDash([8,6]);x.strokeStyle='#fff';x.lineWidth=1;x.beginPath();x.moveTo(X(t),0);x.lineTo(X(t),H);x.stroke();x.setLineDash([]);x.fillStyle='#fff';x.fillText('thr '+t+' dB · '+r+':1',Math.min(W-200,X(t)+8),22)}
function setv(id,v){var el=g(id);v=Math.max(+el.min,Math.min(+el.max,v));el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))}
var cd=false;cg.addEventListener('pointerdown',function(ev){cd=true;try{cg.setPointerCapture(ev.pointerId)}catch(x){}mv(ev)});function mv(ev){if(!cd)return;var r=cg.getBoundingClientRect();setv('alct',Math.round(-60+(ev.clientX-r.left)/r.width*60))}
cg.addEventListener('pointermove',mv);['pointerup','pointercancel'].forEach(function(k){cg.addEventListener(k,function(){cd=false})});cg.addEventListener('wheel',function(ev){ev.preventDefault();setv('alcr',Math.round((+g('alcr').value*Math.exp(-ev.deltaY*.002))*10)/10)},{passive:false});
c.addEventListener('input',function(ev){if(/^cp[ark]$/.test(ev.target.id))cp()});['alct','alcr'].forEach(function(i){g(i).addEventListener('input',drawC)});
var PC={gen:[15,200,12,-20,2.5],bro:[5,120,6,-22,4],pun:[30,80,3,-18,4],smo:[20,400,20,-26,2]};
c.querySelector('#cpp').addEventListener('click',function(ev){var b=ev.target.closest('button');if(!b)return;var p=PC[b.getAttribute('data-p')];setv('cpa',p[0]);setv('cpr',p[1]);setv('cpk',p[2]);setv('alct',p[3]);setv('alcr',p[4])});
function loop(){craf=0;if(M.style.display!=='block'||!c.open)return;var G=window.__alG&&window.__alG(),pl=window.__alplay,r=0;if(G&&G.cp&&pl&&pl.on())r=G.cp.reduction||0;cb.style.width=Math.min(100,-r/20*100)+'%';cm.textContent=(G&&pl&&pl.on())?'Gain reduction: '+(-r).toFixed(1)+' dB':'Gain reduction: play with Live preview on';craf=requestAnimationFrame(loop)}
c.addEventListener('toggle',function(){if(c.open){drawC();if(!craf)craf=requestAnimationFrame(loop)}});
var ps=g('alps');ps.addEventListener('change',function(){if(ps.value==='rst')setTimeout(function(){D0.forEach(function(v,i){g('eqb'+(i+1)).value=v});rd();edit();drawEQ();live();setv('cpa',10);setv('cpr',150);setv('cpk',6)},0)});
window.addEventListener('resize',function(){drawEQ();drawC()});var ob=document.getElementById('alb');if(ob)ob.addEventListener('click',function(){setTimeout(function(){sync();drawEQ();drawC()},60)});
rd();edit();cp();
}catch(e){try{console.error('Audio Lab EQ/compressor',e)}catch(x){}}})();

;
/* ==================== Script 947 id="amiyo-al-s14-speed-reliability" ==================== */
/* Audio Lab improvement 4: speed and reliability. Noise reduction now runs on background threads (one per channel) so the page never freezes and Cancel is instant; progress bar with elapsed time and estimate; Fast mode; remembers your settings between visits (restores them when you reopen); long-file hints; a self-test that checks what this browser can do. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-s14'))return;M.setAttribute('data-s14','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}},msg=function(t){g('aln').textContent=t};
/*WORKER-START*/
function WK(){
function fft(re,im){var n=re.length,j=0;for(var i=1;i<n;i++){var b=n>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){var t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t}}for(var len=2;len<=n;len<<=1){var a=-2*Math.PI/len,wr=Math.cos(a),wi=Math.sin(a),h=len>>1;for(var s=0;s<n;s+=len){var cr=1,ci=0;for(var k=0;k<h;k++){var u=s+k,v=u+h,xr=re[v]*cr-im[v]*ci,xi=re[v]*ci+im[v]*cr;re[v]=re[u]-xr;im[v]=im[u]-xi;re[u]+=xr;im[u]+=xi;var t2=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=t2}}}}
self.onmessage=function(ev){var m=ev.data,d=m.d,s=m.s,N=m.N,HW=new Float32Array(N),hi;for(hi=0;hi<N;hi++)HW[hi]=.5-.5*Math.cos(2*Math.PI*hi/N);
var H=N/4,len=d.length,p=new Float32Array(len+2*N);p.set(d,N);var fr=Math.floor((p.length-N)/H)+1,B=N/2+1,re=new Float32Array(N),im=new Float32Array(N),en=[],i,k;
for(i=0;i<fr;i++){var e=0,o=i*H;for(k=0;k<N;k+=8)e+=p[o+k]*p[o+k];en.push([e,i])}
var idx=en.filter(function(x){return x[0]>0}).sort(function(a,b){return a[0]-b[0]}).slice(0,Math.max(3,Math.floor(fr*.1))),nz=new Float32Array(B);if(!idx.length){self.postMessage({done:d},[d.buffer]);return}
idx.forEach(function(x){var o=x[1]*H;for(k=0;k<N;k++){re[k]=p[o+k]*HW[k];im[k]=0}fft(re,im);for(k=0;k<B;k++)nz[k]+=Math.sqrt(re[k]*re[k]+im[k]*im[k])/idx.length});
if(m.nz&&m.nz.length>3){var q0=m.nz,L0=q0.length;if(L0===B)for(k=0;k<B;k++)nz[k]=q0[k];else{var sc=Math.sqrt(N/2048);for(k=0;k<B;k++){var pos=k/(B-1)*(L0-1),a=Math.floor(pos),b=Math.min(L0-1,a+1),f=pos-a;nz[k]=(q0[a]*(1-f)+q0[b]*f)*sc}}}
var al=1+2*s,fl=Math.pow(10,-(6+24*s)/20),out=new Float32Array(p.length),gn=new Float32Array(B);
for(i=0;i<fr;i++){var o2=i*H;for(k=0;k<N;k++){re[k]=p[o2+k]*HW[k];im[k]=0}fft(re,im);for(k=0;k<B;k++){var mg=Math.sqrt(re[k]*re[k]+im[k]*im[k]);gn[k]=Math.max(fl,1-al*nz[k]/(mg+1e-12))}
for(k=1;k<B-1;k++){var gs=(gn[k-1]+gn[k]+gn[k+1])/3;re[k]*=gs;im[k]*=gs;if(k>0){re[N-k]*=gs;im[N-k]*=gs}}
re[0]*=gn[0];im[0]*=gn[0];re[B-1]*=gn[B-1];im[B-1]*=gn[B-1];fft(im,re);for(k=0;k<N;k++)out[o2+k]+=re[k]/N*HW[k]/1.5;
if(i%200===199)self.postMessage({p:i/fr})}
var res=new Float32Array(len);res.set(out.subarray(N,N+len));self.postMessage({done:res},[res.buffer])}}
/*WORKER-END*/
var URLW=null,JOBS=[],PROG={},cancelled=false;
function mkUrl(){if(!URLW)URLW=URL.createObjectURL(new Blob(['('+WK.toString()+')()'],{type:'text/javascript'}));return URLW}
window.__alTok={c:false};window.__alCancel=false;window.__alFast=false;
function showProg(){var ks=Object.keys(PROG),a=0;ks.forEach(function(k){a+=PROG[k]});a=ks.length?a/ks.length:0;msg('Reducing noise… '+Math.round(a*100)+'%'+(ks.length>1?' ('+ks.length+' threads)':''))}
window.__alDN=function(seg,s){if(!window.Worker)return Promise.resolve(null);return new Promise(function(res,rej){var w,id=Math.random();try{w=new Worker(mkUrl())}catch(e){return res(null)}
var job={w:w,rej:rej};JOBS.push(job);PROG[id]=0;function end(){PROG[id]=1;delete PROG[id];var i=JOBS.indexOf(job);if(i>=0)JOBS.splice(i,1);try{w.terminate()}catch(e){}}
w.onmessage=function(ev){var m=ev.data;if(m.p!==undefined){PROG[id]=m.p;showProg()}else if(m.done){end();res(m.done)}};
w.onerror=function(){end();res(null)};var nz=null;try{nz=window.__alNZ&&window.__alNZ();if(nz)nz=Array.prototype.slice.call(nz)}catch(e){}
var d=new Float32Array(seg);w.postMessage({d:d,s:s,N:window.__alFast?1024:2048,nz:nz},[d.buffer])})};
var CW=[];window.__alRace=function(p){return new Promise(function(res,rej){if(window.__alCancel)return rej(new Error('Cancelled'));var w=function(){rej(new Error('Cancelled'))};CW.push(w);var rm=function(){var i=CW.indexOf(w);if(i>=0)CW.splice(i,1)};p.then(function(v){rm();res(v)},function(e){rm();rej(e)})})};
function cancelAll(){window.__alCancel=true;CW.slice().forEach(function(w){w()});CW=[];window.__alTok.c=true;JOBS.slice().forEach(function(j){try{j.w.terminate()}catch(e){}j.rej(new Error('Cancelled'))});JOBS=[];PROG={}}
/* hooks: stop between stages when cancelled */
['__alTP','__alPitch'].forEach(function(n){var p=window[n];if(!p)return;window[n]=async function(r){if(window.__alCancel)throw new Error('Cancelled');var o=await p.apply(this,arguments);if(window.__alCancel)throw new Error('Cancelled');return o}});
/* UI: progress bar + cancel */
var act=g('alr')&&g('alr').parentNode,pg=document.createElement('div');pg.id='alpg';pg.style.cssText='display:none;margin:6px 0;padding:8px;background:#1d1b17;border:1px solid #3a352c;border-radius:10px;font:13px sans-serif';pg.innerHTML='<div style="height:8px;background:#2a2620;border-radius:4px;overflow:hidden"><div id="alpgb" style="height:100%;width:3%;background:#ff7a3d;transition:width .2s"></div></div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;gap:8px"><span id="alpgt" style="color:#b9b2a2"></span><button type="button" id="alpgx" style="background:#7a2a2a;color:#fff;border:0;border-radius:8px;padding:6px 12px">✕ Cancel</button></div>';
if(act)act.parentNode.insertBefore(pg,act);
var t0=0,tm=0,busy=false;function fmt(s){s=Math.round(s);return Math.floor(s/60)+':'+('0'+s%60).slice(-2)}
var OV=null;
function stLab(tx){return tx.replace(/\s*\d+%.*$/,'').replace(/\s*\(\d+ threads\)/,'').replace(/(\.{3}|\u2026)\s*$/,'').trim()}
function predict(){var v=function(i){var e=g(i);return e?+e.value:0},n=0;if(v('aldn')>0)n++;if(v('alpt')!==0||(v('alsx')&&v('alsx')!==100))n++;if(v('aldrv')>0)n++;var vr=g('alvr');if(vr&&(vr.value==='rs'||vr.value==='ks'))n++;return n+1}
function tick(){var tx=g('aln').textContent,m=tx.match(/(\d+)%/),el=(performance.now()-t0)/1000,pc=m?+m[1]:null,b=g('alpgb');
if(!OV)OV={k:0,cur:null,last:0,creep:0,pred:predict()};
var lab=stLab(tx);
if(pc!=null&&lab){if(OV.cur!==lab){if(OV.cur!==null)OV.k++;OV.cur=lab;OV.creep=0}}else if(/^Processing/.test(tx)&&OV.cur!==null){OV.k++;OV.cur=null;OV.creep=0}
var N=Math.max(OV.pred,OV.k+(OV.cur!==null?1:0)+1),fr;if(pc!=null&&OV.cur!==null)fr=Math.min(.99,pc/100);else{OV.creep=Math.min(.8,OV.creep+.025);fr=OV.creep}
var ov=Math.min(.99,Math.max(OV.last,(OV.k+fr)/N));OV.last=ov;b.style.width=Math.max(3,Math.round(ov*100))+'%';
var step=Math.min(N,OV.k+1);
g('alpgt').textContent=(N>1?'Step '+step+'/'+N+' \u00b7 ':'')+(lab.length>30?lab.slice(0,30)+'\u2026':lab||'Working')+' \u00b7 '+Math.round(ov*100)+'% \u00b7 '+fmt(el)+(ov>.1&&ov<.97?' \u00b7 ~'+fmt(el/ov*(1-ov))+' left':'')}
function begin(){if(busy)return;busy=true;cancelled=false;OV=null;window.__alCancel=false;window.__alTok={c:false};t0=performance.now();pg.style.display='block';g('alpgb').style.width='3%';tm=setInterval(tick,250)}
function done(){if(!busy)return;busy=false;clearInterval(tm);pg.style.display='none'}
g('alr').addEventListener('click',begin,true);g('alpgx').onclick=function(){cancelAll();msg('Cancelled.');done()};
document.addEventListener('keydown',function(e){if(busy&&e.key==='Escape'&&M.style.display==='block'){e.stopImmediatePropagation();cancelAll();msg('Cancelled.');done()}},true);
new MutationObserver(function(){if(busy&&/^(Done|Processing failed|Cancelled|Press|Choose|Preset)/.test(g('aln').textContent))done()}).observe(g('aln'),{childList:true,characterData:true,subtree:true});
/* section: performance & reliability */
var secs=M.querySelectorAll('details.alsec'),anchor=secs[secs.length-1],d=document.createElement('details');d.className='alsec';
d.innerHTML='<summary><span>⚙ Speed &amp; reliability</span><i></i></summary><div class="alin"><div class="row"><label style="margin:0"><input type="checkbox" id="alfast"> ⚡ Fast mode (about 2× quicker noise reduction and pitch/speed, slightly less refined)</label></div><div class="row"><label style="margin:0"><input type="checkbox" id="alrem" checked> Remember my settings and restore them next time</label><button type="button" id="alclr">Forget saved settings</button></div><div id="alpf" style="font-size:12px;color:#b9b2a2;margin:6px 0"></div><div class="row"><button type="button" id="alstest">🧪 Self-test this browser</button></div><pre id="alstout" style="white-space:pre-wrap;font:12px monospace;color:#d9d3c4;margin:6px 0"></pre></div>';
anchor.parentNode.insertBefore(d,anchor.nextSibling);
var cores=navigator.hardwareConcurrency||2;g('alpf').textContent='This device: '+cores+' CPU threads'+(navigator.deviceMemory?', about '+navigator.deviceMemory+' GB memory':'')+'. Noise reduction uses one background thread per channel, so the page stays responsive and Cancel (or Esc) stops it immediately.';
g('alfast').addEventListener('change',function(){window.__alFast=this.checked;d.querySelector('summary i').textContent=this.checked?'● fast':''});
/* self-test */
g('alstest').onclick=async function(){var o=[],ok=function(n,v,x){o.push((v?'✓ ':'✕ ')+n+(x?' — '+x:''))};
try{ok('Background threads (Web Worker)',await new Promise(function(r){try{var w=new Worker(URL.createObjectURL(new Blob(['onmessage=function(e){postMessage(e.data+1)}'])));w.onmessage=function(e){w.terminate();r(e.data===2)};w.onerror=function(){r(false)};w.postMessage(1);setTimeout(function(){r(false)},2000)}catch(e){r(false)}}))}catch(e){ok('Background threads',false)}
ok('Audio engine',!!(window.AudioContext||window.webkitAudioContext));ok('Offline rendering',!!window.OfflineAudioContext);ok('Microphone recording',!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia),window.isSecureContext?'':'needs https:// or localhost');
ok('WebM/OGG export',!!window.MediaRecorder&&MediaRecorder.isTypeSupported('audio/webm;codecs=opus'),window.MediaRecorder&&MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')?'OGG too':'OGG not available here');
var ls=false;try{localStorage.setItem('alt','1');localStorage.removeItem('alt');ls=true}catch(e){}ok('Saving settings (localStorage)',ls);ok('MP3 encoder',!!(window.lamejs||document.getElementById('amiyo-lame-src')),window.lamejs?'':'built in — loads on first MP3 export');
g('alstout').textContent=o.join('\n')};
/* remember settings (step 8 fix: saved menu/slider values that no longer fit are skipped instead of blanking the control) */
var KEY='amiyoAlSettings',SKIP={alf:1,alib:1,alps:1,alpn:1,alpif:1,alsc:1,alsw:1,alsd:1,als:1,ale:1,alrem:1,alfast:1,alo:1,alp:1,alm1:1};
function els(){return[].filter.call(M.querySelectorAll('input[id],select[id]'),function(e){return e.type!=='file'&&e.type!=='text'&&!SKIP[e.id]&&!e.hasAttribute('data-e')&&!/^(rc|al8)/.test(e.id)})}
var rt=0;function save(){if(!g('alrem').checked)return;try{var o={};els().forEach(function(e){o[e.id]=e.type==='checkbox'?e.checked:e.value});localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}}
M.addEventListener('input',function(){clearTimeout(rt);rt=setTimeout(save,700)},true);M.addEventListener('change',function(){clearTimeout(rt);rt=setTimeout(save,700)},true);
g('alrem').addEventListener('change',function(){try{localStorage.setItem('amiyoAlRem',this.checked?'1':'0');if(this.checked)save();else localStorage.removeItem(KEY)}catch(e){}});
g('alclr').onclick=function(){try{localStorage.removeItem(KEY)}catch(e){}msg('Saved settings forgotten.')};
try{if(localStorage.getItem('amiyoAlRem')==='0')g('alrem').checked=false;var sv=g('alrem').checked&&JSON.parse(localStorage.getItem(KEY)||'null');
if(sv&&Object.keys(sv).length)setTimeout(function(){var n=0;els().forEach(function(e){if(!(e.id in sv))return;var v=sv[e.id];if(e.type==='checkbox'){if(e.checked===v)return;e.checked=v}else{if(e.value===String(v))return;if(e.tagName==='SELECT'&&![].some.call(e.options,function(o){return o.value===String(v)}))return;if((e.type==='range'||e.type==='number')&&(v===''||v===null||isNaN(+v)))return;e.value=v}n++;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))});if(n){var h=document.createElement('div');h.id='alrestored';h.style.cssText='font-size:12px;color:#b9b2a2;margin:4px 0';h.innerHTML='Restored your last settings ('+n+' changes). <a href="#" style="color:#ff7a3d">Reset to defaults</a>';var z=M.querySelector('.alzone');if(z)z.parentNode.insertBefore(h,z.nextSibling);h.querySelector('a').onclick=function(e){e.preventDefault();var ps=g('alps');ps.value='rst';ps.dispatchEvent(new Event('change'));h.remove();try{localStorage.removeItem(KEY)}catch(x){}}}},900)}catch(e){}
/* long-file hint */
var last=null;new MutationObserver(function(){var s=S();if(s.src!==last){last=s.src;if(s.src&&s.src.duration>600&&!window.__alFast&&/^(Reading|Done|Loaded|File)/.test('')){}if(s.src&&s.src.duration>600)setTimeout(function(){msg('Long file ('+Math.round(s.src.duration/60)+' min): trim to the part you need and tick ⚡ Fast mode (Speed & reliability) for quicker processing.')},50)}}).observe(g('aln'),{childList:true,characterData:true,subtree:true});
}catch(e){try{console.error('Audio Lab speed/reliability',e)}catch(x){}}})();

;
/* ==================== Script 949 id="amiyo-al-fix1" ==================== */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-fix1'))return;M.setAttribute('data-fix1','1');
var g=function(i){return M.querySelector('#'+i)};
function fire(e){e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))}
/* Reset all also clears Mono, Invert polarity, A/B original and the limiter ceiling */
var ps=g('alps');if(ps)ps.addEventListener('change',function(){if(ps.value!=='rst')return;setTimeout(function(){['alp','alm1','alo'].forEach(function(id){var e=g(id);if(e&&e.checked){e.checked=false;fire(e)}});var k=g('alk');if(k&&k.value!=='-1'){k.value='-1';fire(k)}},40)});
/* Auto-pick the quietest part of the file as the noise sample */
var l1=g('alnl1'),row=l1&&l1.parentNode;if(row){var b=document.createElement('button');b.type='button';b.id='alnq';b.textContent='🔎 Auto-pick quietest part';row.insertBefore(b,g('alnc'));
b.onclick=function(){var st=(window.__alst&&window.__alst())||{},buf=st.src;if(!buf){g('aln').textContent='Choose a file first.';return}
var d=buf.getChannelData(0),sr=buf.sampleRate,D=buf.duration,bl=Math.round(sr*.05),nb=Math.floor(d.length/bl),W=Math.max(6,Math.min(20,Math.round(Math.min(1,D*.25)/.05)));
if(nb<W+2){g('aln').textContent='This file is too short to pick a noise sample from.';return}
var P=new Float64Array(nb),k,i;for(k=0;k<nb;k++){var q=0;for(i=k*bl;i<(k+1)*bl;i++)q+=d[i]*d[i];P[k]=q/bl}
var best=0,bv=1e30,run=0;for(k=0;k<W;k++)run+=P[k];bv=run;for(k=1;k+W<=nb;k++){run+=P[k+W-1]-P[k-1];if(run<bv){bv=run;best=k}}
var t0=best*bl/sr,t1=(best+W)*bl/sr;g('als').value=(t0/D*100).toFixed(2);g('ale').value=(t1/D*100).toFixed(2);fire(g('als'));fire(g('ale'));l1.click()}}
}catch(e){try{console.error('Audio Lab fixes',e)}catch(x){}}})();

;
/* ==================== Script 950 id="amiyo-al-fix2" ==================== */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-fix2'))return;M.setAttribute('data-fix2','1');
var g=function(i){return M.querySelector('#'+i)},lin=function(d){return Math.pow(10,d/20)};
function fire(e){e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))}
function setv(id,v){var e=g(id);if(!e)return;if(e.type==='checkbox')e.checked=!!v;else e.value=v;fire(e)}
/* 1. Compressor make-up gain */
var cr=g('alcr'),lab=cr&&cr.previousElementSibling;
if(cr){var h=document.createElement('div');h.innerHTML='<label>Compressor make-up gain (dB): <b>0</b></label><input type="range" id="alcm" min="0" max="18" step="0.5" value="0"><div style="font-size:11px;color:#b9b2a2">Brings the level back up after compression. Only used when the compressor is on.</div>';
cr.parentNode.insertBefore(h,cr.nextSibling);while(h.firstChild)h.parentNode.insertBefore(h.firstChild,h);h.remove();
function mk(){return +g('alct').value<0?+g('alcm').value:0}
g('alcm').addEventListener('input',function(){var b=this.previousElementSibling.querySelector('b');if(b)b.textContent=this.value});
var prev=window.__alTP;window.__alTP=async function(r){var o=prev?await prev.apply(this,arguments):r,m=lin(mk());if(m!==1&&o)for(var c=0;c<o.numberOfChannels;c++){var d=o.getChannelData(c);for(var i=0;i<d.length;i++)d[i]*=m}return o};
function live(){var G=window.__alG&&window.__alG();if(!G||!G.gg)return;var t=G.ac.currentTime;try{G.gg.gain.setTargetAtTime(lin(+g('ala').value+mk())*(g('alp').checked?-1:1),t,.02)}catch(e){}}
M.addEventListener('input',function(){setTimeout(live,0)});M.addEventListener('change',function(){setTimeout(live,0)})}
/* 2. One-tap Auto-enhance voice */
var pr=g('alps'),bar=pr&&pr.previousElementSibling;
if(pr){var row=document.createElement('div');row.className='row';row.innerHTML='<button type="button" class="pri" id="alauto">✨ Auto-enhance voice</button>';pr.parentNode.insertBefore(row,pr.nextSibling);
g('alauto').onclick=function(){var st=(window.__alst&&window.__alst())||{};if(!st.src){g('aln').textContent='Choose a file first.';return}
g('alps').value='rst';fire(g('alps'));
setTimeout(function(){var hd=g('alhd');if(hd)hd.click();
setTimeout(function(){var q=g('alnq');if(q)q.click();
setTimeout(function(){setv('alh',80);setv('aldn',45);setv('alal',50);setv('alct',-20);setv('alcr',3);setv('alcm',3);setv('alt','-16');setv('alk','-1');
g('aln').textContent='Auto-enhance set: hum + noise cleanup, 80 Hz high-pass, auto-level, gentle compression, −16 LUFS. Press ⚡ Process.'},900)},1800)},80)}}
}catch(e){try{console.error('Audio Lab fix2',e)}catch(x){}}})();

;
/* ==================== Script 951 id="amiyo-al-fix3" ==================== */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-fix3'))return;M.setAttribute('data-fix3','1');
var g=function(i){return M.querySelector('#'+i)};
function fire(e){e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))}
function setv(id,v){var e=g(id);if(!e)return;if(e.type==='checkbox')e.checked=!!v;else e.value=v;fire(e)}
/* export file names follow the source file */
var base='audio';
function cleanName(n){n=String(n||'').replace(/\.[^.\/\\]{1,5}$/,'').replace(/[\\\/:*?"<>|\u0000-\u001f]+/g,'').replace(/\s+/g,' ').trim().replace(/^\.+/,'');return n.slice(0,60).trim()||'audio'}
window.__alSetBase=function(n){base=cleanName(n)};window.__alBase=function(){return base};
g('alf').addEventListener('change',function(){var f=this.files&&this.files[0];if(f)base=cleanName(f.name)});
document.addEventListener('click',function(e){var a=e.target;if(!a||a.tagName!=='A')return;var d=a.download||'';if(!/^audio-lab-/.test(d)||/\.json$/i.test(d))return;var rest=d.slice(10);a.download=/^\d{6,}\.\w+$/.test(rest)?base+'-edited.'+rest.split('.').pop():base+'-edited-'+rest},true);
/* Trim silence at start and end */
var t3=g('alt3'),row=t3&&t3.parentNode;
if(row){var b=document.createElement('button');b.type='button';b.id='altrim';b.textContent='✂ Trim silence at ends';row.appendChild(b);
b.onclick=function(){var st=(window.__alst&&window.__alst())||{},buf=st.src;if(!buf){g('aln').textContent='Choose a file first.';return}
var d=buf.getChannelData(0),sr=buf.sampleRate,bl=Math.round(sr*.01),nb=Math.floor(d.length/bl);if(nb<20){g('aln').textContent='File too short.';return}
var P=new Float64Array(nb),k,i;for(k=0;k<nb;k++){var q=0;for(i=k*bl;i<(k+1)*bl;i++)q+=d[i]*d[i];P[k]=q/bl}
var A=Array.prototype.slice.call(P).sort(function(x,y){return x-y}),fl=Math.max(A[Math.floor(nb*.1)],1e-10),th=fl*16;
var a0=0;while(a0<nb&&P[a0]<th)a0++;var a1=nb-1;while(a1>a0&&P[a1]<th)a1--;
if(a0>=a1){g('aln').textContent='No clear sound found to keep.';return}
var pad=Math.round(.15*sr/bl),s0=Math.max(0,a0-pad)*bl/sr,s1=Math.min(nb,a1+pad)*bl/sr,D=buf.duration;
setv('als',(s0/D*100).toFixed(2));setv('ale',(s1/D*100).toFixed(2));
g('aln').textContent='Trimmed to '+s0.toFixed(2)+' s → '+s1.toFixed(2)+' s ('+(D-(s1-s0)).toFixed(1)+' s of silence removed). Press ⚡ Process.'}}
/* Auto-enhance music */
var au=g('alauto'),r2=au&&au.parentNode;
if(r2){var m=document.createElement('button');m.type='button';m.id='alautom';m.textContent='🎵 Auto-enhance music';r2.appendChild(m);
m.onclick=function(){var st=(window.__alst&&window.__alst())||{};if(!st.src){g('aln').textContent='Choose a file first.';return}
g('alps').value='rst';fire(g('alps'));setTimeout(function(){setv('alh',25);setv('alct',-14);setv('alcr',2);setv('alcm',2);setv('alt','-14');setv('alk','-1');
g('aln').textContent='Music master set: 25 Hz high-pass, gentle compression, −14 LUFS, −1 dB limiter. Press ⚡ Process.'},80)}}
}catch(e){try{console.error('Audio Lab fix3',e)}catch(x){}}})();

;
/* ==================== Script 952 id="amiyo-pro-step01-floating" ==================== */
/* Pro Step 1: Floating-button tidy. On a phone the three floating items (Audio Lab, the mixer circle and the time chip) sat on top of the timeline and the bottom toolbar.
   Now a small dock tab on the right edge shows / hides all three in one tap (they start hidden on narrow screens), the Audio Lab and mixer buttons can be dragged anywhere
   (press and move), and a double-tap on the tab puts everything back in its default place. Your choices are remembered. Nothing else is changed. */
(function(){
  var KH='amiyoFlHide', KP='amiyoFlPos', IDS=['amSndBtn'];
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){} return null; }
  function hidden(){ var v=ls(KH); if(v==null) return innerWidth<=600; return v==='1'; }
  var st=document.createElement('style'); st.id='amiyo-pro01-style';
  st.textContent='html.am-fl-hide #alb,html.am-fl-hide #amSndBtn,html.am-fl-hide #amS3chip{display:none!important}'+
    '#amFlDock{position:fixed;right:0;bottom:calc(190px + env(safe-area-inset-bottom,0px));z-index:9999;width:26px;height:44px;border:1px solid rgba(255,255,255,.25);border-right:0;border-radius:12px 0 0 12px;background:rgba(30,26,22,.82);color:#ffb27a;font:700 15px/1 system-ui,sans-serif;padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:.8;touch-action manipulation}'+
    '#amFlDock:active{opacity:1}'+
    '#alb,#amSndBtn{touch-action:none}'+
    '.am-fl-drag{outline:2px dashed #ff8a3d!important;outline-offset:2px}';
  st.textContent=st.textContent.replace('touch-action manipulation','touch-action:manipulation');
  (document.head||document.documentElement).appendChild(st);
  var dock=null;
  function apply(){ document.documentElement.classList.toggle('am-fl-hide',hidden()); if(dock){ dock.textContent=hidden()?'\u25C0':'\u25B6'; dock.setAttribute('aria-label',hidden()?'Show floating buttons':'Hide floating buttons'); dock.title=hidden()?'Show floating buttons (double-tap: reset positions)':'Hide floating buttons (double-tap: reset positions)'; dock.setAttribute('aria-pressed',hidden()?'false':'true'); } }
  function pos(){ try{ return JSON.parse(ls(KP)||'{}')||{}; }catch(e){ return {}; } }
  function clamp(el,x,y){ var w=el.offsetWidth||44,h=el.offsetHeight||44; return [Math.max(4,Math.min(innerWidth-w-4,x)),Math.max(4,Math.min(innerHeight-h-4,y))]; }
  function place(el,x,y){ var c=clamp(el,x,y); el.style.setProperty('left',c[0]+'px','important'); el.style.setProperty('top',c[1]+'px','important'); el.style.setProperty('right','auto','important'); el.style.setProperty('bottom','auto','important'); }
  function reset(el){ ['left','top','right','bottom'].forEach(function(p){ el.style.removeProperty(p); }); }
  function restore(){ var p=pos(); IDS.forEach(function(id){ var el=document.getElementById(id); if(el&&p[id]&&el.offsetWidth) place(el,p[id][0],p[id][1]); }); }
  function wireDrag(el){
    if(!el||el.__amDrag) return; el.__amDrag=true;
    var sx,sy,ox,oy,moved=false,down=false,pid=null;
    el.addEventListener('pointerdown',function(e){ if(e.button>0) return; var r=el.getBoundingClientRect(); sx=e.clientX; sy=e.clientY; ox=r.left; oy=r.top; moved=false; down=true; pid=e.pointerId; try{el.setPointerCapture(pid);}catch(x){} },true);
    el.addEventListener('pointermove',function(e){
      if(!down||e.pointerId!==pid) return;
      var dx=e.clientX-sx, dy=e.clientY-sy;
      if(!moved&&Math.abs(dx)+Math.abs(dy)<10) return;
      if(!moved){ moved=true; el.classList.add('am-fl-drag'); }
      e.preventDefault(); place(el,ox+dx,oy+dy);
    },true);
    function end(e){
      if(!down||(e&&e.pointerId!==pid)) return; down=false; el.classList.remove('am-fl-drag');
      if(moved){ var r=el.getBoundingClientRect(), p=pos(); p[el.id]=[Math.round(r.left),Math.round(r.top)]; ls(KP,JSON.stringify(p)); el.__amJustDragged=Date.now(); }
    }
    el.addEventListener('pointerup',end,true); el.addEventListener('pointercancel',end,true);
    el.addEventListener('click',function(e){ if(el.__amJustDragged&&Date.now()-el.__amJustDragged<400){ e.preventDefault(); e.stopImmediatePropagation(); el.__amJustDragged=0; } },true);
  }
  function build(){
    if(!document.body){ setTimeout(build,200); return; }
    if(!dock){
      dock=document.createElement('button'); dock.id='amFlDock'; dock.type='button';
      var lastTap=0;
      dock.addEventListener('click',function(){
        var now=Date.now();
        if(now-lastTap<350){ lastTap=0; ls(KH,hidden()?'0':'1'); apply(); IDS.forEach(function(id){ var el=document.getElementById(id); if(el) reset(el); }); ls(KP,'{}'); try{notify('Floating buttons back in their default places');}catch(e){} return; }
        lastTap=now; ls(KH,hidden()?'0':'1'); apply(); setTimeout(restore,50);
      });
      document.body.appendChild(dock);
    }
    apply(); IDS.forEach(function(id){ wireDrag(document.getElementById(id)); }); restore();
  }
  function sched(){ clearTimeout(sched.t); sched.t=setTimeout(build,150); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',build); else build();
  try{ new MutationObserver(function(){ var need=IDS.some(function(id){var el=document.getElementById(id);return el&&!el.__amDrag;}); if(need||!document.getElementById('amFlDock')) sched(); }).observe(document.documentElement,{childList:true,subtree:true}); }catch(e){}
  addEventListener('resize',function(){ restore(); });
})();

;
/* ==================== Script 953 id="amiyo-pro-step02-trim" ==================== */
/* Pro Step 2: Trim edit point (Premiere's Ripple and Rolling Edit, plus a plain nudge). Select a clip, press "Trim+" on the timeline bar, choose Head or Tail,
   choose Normal / Ripple / Roll, then tap -5 -1 +1 +5 frames. Keys: Alt+, and Alt+. move the chosen edge 1 frame earlier / later (add Shift for 5 frames).
   Normal: only this clip's edge moves.  Ripple: the clips after it on the same track follow, so no gap appears or disappears.
   Roll: the cut between this clip and its neighbour moves, so the total length stays the same.
   The edge stops at the limits of the source video (it never goes past the real start or end). One undo step per nudge. */
(function(){
  var KEY='amiyoTrimPlus', S={edge:'tail',mode:'ripple'};
  try{ var o=JSON.parse(localStorage.getItem(KEY)||'{}'); if(o.edge==='head'||o.edge==='tail') S.edge=o.edge; if(['normal','ripple','roll'].indexOf(o.mode)>=0) S.mode=o.mode; }catch(e){}
  function save(){ try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){} }
  function say(m){ try{notify(m);}catch(e){ try{toast(m);}catch(x){} } }
  function r3(v){ return Math.round(v*1000)/1000; }
  function typing(t){return t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable);}
  function fps(){ return (project&&project.settings&&project.settings.fps)||30; }
  function rate(c){ var s=(c.outPoint!=null&&c.inPoint!=null)?c.outPoint-c.inPoint:c.duration; return c.duration>0?s/c.duration:1; }
  function srcLen(c){ var a=project.assets&&project.assets[c.assetId]; return a&&(a.type==='video'||a.type==='audio')&&a.duration>0?a.duration:Infinity; }
  function shiftKf(list,d){
    if(!list||!list.length) return list; var out=[],carry=null;
    list.forEach(function(k){ var n=Object.assign({},k); n.t=r3(k.t-d); if(n.t<0) carry=n; else out.push(n); });
    if(carry){ carry.t=0; if(!out.length||out[0].t>0) out.unshift(carry); } return out;
  }
  /* how far (timeline seconds) the edge of clip c can move: returns [minD,maxD] */
  function lim(c,edge,mode,nb){
    var rc=rate(c), MIN=0.1, lo=-Infinity, hi=Infinity, Lc=srcLen(c);
    if(edge==='tail'){
      lo=-(c.duration-MIN); hi=(Lc-c.outPoint)/rc;
      if(mode==='roll'&&nb){ var rn=rate(nb); hi=Math.min(hi,nb.duration-MIN); lo=Math.max(lo,-nb.inPoint/rn); }
    } else {
      hi=c.duration-MIN; lo=-c.inPoint/rc;
      if(mode==='roll'&&nb){ var rp=rate(nb); lo=Math.max(lo,-(nb.duration-MIN)); hi=Math.min(hi,(srcLen(nb)-nb.outPoint)/rp); }
    }
    return [lo,hi];
  }
  function neighbours(tr,c){
    var end=c.start+c.duration, nxt=null, prv=null;
    tr.clips.forEach(function(o){ if(o===c) return;
      if(Math.abs(o.start-end)<0.06&&(!nxt||o.start<nxt.start)) nxt=o;
      if(Math.abs(o.start+o.duration-c.start)<0.06&&(!prv||o.start>prv.start)) prv=o; });
    return {next:nxt,prev:prv};
  }
  function nudge(frames,opt){
    opt=opt||{}; var edge=opt.edge||S.edge, mode=opt.mode||S.mode;
    var f=null; try{ f=getClip(); }catch(e){}
    if(!f){ say('Select a clip on the timeline first'); return false; }
    var tr=f.track, c=f.clip;
    if(tr.locked){ say('This track is locked'); return false; }
    var d=frames/fps(), nb=null, N=neighbours(tr,c);
    if(mode==='roll'){ nb=edge==='tail'?N.next:N.prev; if(!nb){ say('Roll needs a clip touching the '+(edge==='tail'?'end':'start')+' of this one'); return false; } }
    var L=lim(c,edge,mode,nb), nd=Math.max(L[0],Math.min(L[1],d));
    nd=r3(nd);
    if(Math.abs(nd)<0.0005){ say('Cannot go further: '+(d>0?'end':'start')+' of the source or minimum length reached'); return false; }
    var clamped=Math.abs(nd-d)>0.0005, edgeTime=0, synced=0;
    transact('Trim '+edge+' ('+mode+')',function(){
      var rc=rate(c), cEnd=c.start+c.duration, after=[];
      if(mode==='ripple'){ tr.clips.forEach(function(o){ if(o!==c&&o.start>=cEnd-0.001) after.push(o); }); }
      if(edge==='tail'){
        c.duration=r3(c.duration+nd); c.outPoint=r3(c.outPoint+nd*rc);
        if(mode==='ripple'){ after.forEach(function(o){ o.start=r3(Math.max(0,o.start+nd)); }); try{ if(window.amiyoSyncShift) synced=window.amiyoSyncShift(tr,cEnd,nd); }catch(e){} }
        if(mode==='roll'&&nb){ var rn=rate(nb); nb.start=r3(nb.start+nd); nb.inPoint=r3(nb.inPoint+nd*rn); nb.duration=r3(nb.duration-nd); if(nb.keyframes) nb.keyframes=shiftKf(nb.keyframes,nd); if(nb.volumeKeyframes) nb.volumeKeyframes=shiftKf(nb.volumeKeyframes,nd); }
        edgeTime=c.start+c.duration;
      } else {
        c.inPoint=r3(c.inPoint+nd*rc); c.duration=r3(c.duration-nd);
        if(c.keyframes) c.keyframes=shiftKf(c.keyframes,nd); if(c.volumeKeyframes) c.volumeKeyframes=shiftKf(c.volumeKeyframes,nd);
        if(mode==='ripple'){ after.forEach(function(o){ o.start=r3(Math.max(0,o.start-nd)); }); try{ if(window.amiyoSyncShift) synced=window.amiyoSyncShift(tr,cEnd,-nd); }catch(e){} }
        else { c.start=r3(c.start+nd); }
        if(mode==='roll'&&nb){ var rp2=rate(nb); nb.duration=r3(nb.duration+nd); nb.outPoint=r3(nb.outPoint+nd*rp2); }
        edgeTime=c.start;
      }
      if(c.fadeIn) c.fadeIn=Math.min(c.fadeIn,c.duration*0.9); if(c.fadeOut) c.fadeOut=Math.min(c.fadeOut,c.duration*0.9);
    });
    try{ setCurrentTime(Math.max(0,edgeTime)); }catch(e){}
    var fr=Math.round(nd*fps()); say((mode==='ripple'?'Ripple ':mode==='roll'?'Roll ':'Trim ')+edge+' '+(fr>0?'+':'')+fr+' frame'+(Math.abs(fr)===1?'':'s')+(synced?' \u00B7 '+synced+' other clip'+(synced>1?'s':'')+' followed (sync lock)':'')+(clamped?' (stopped at the limit)':''));
    return true;
  }
  window.amiyoTrimPlus={nudge:nudge,state:function(){return {edge:S.edge,mode:S.mode};},set:function(o){ if(o.edge) S.edge=o.edge; if(o.mode) S.mode=o.mode; save(); paint(); }};

  /* ---------- panel ---------- */
  var st=document.createElement('style'); st.id='amiyo-pro02-style';
  st.textContent='#amTrimPanel{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(150px + env(safe-area-inset-bottom,0px));z-index:9990;width:min(360px,96vw);background:#1b1713;color:#f3e9dd;border:1px solid #4a3d30;border-radius:14px;padding:10px 12px;box-shadow:0 8px 28px #000a;font:600 13px system-ui,sans-serif;display:none}'+
   '#amTrimPanel.on{display:block}#amTrimPanel .r{display:flex;gap:6px;align-items:center;margin:6px 0}#amTrimPanel .r>span{width:46px;color:#b9a48f;font-weight:600;font-size:12px}'+
   '#amTrimPanel button{flex:1;min-height:40px;border:1px solid #4a3d30;background:#2a231c;color:#f3e9dd;border-radius:9px;font:700 13px system-ui,sans-serif;cursor:pointer}'+
   '#amTrimPanel button.on{background:#ff7a3d;color:#1a1008;border-color:#ff7a3d}#amTrimPanel .h{display:flex;justify-content:space-between;align-items:center}'+
   '#amTrimPanel .h b{font-size:14px}#amTrimPanel .x{flex:none;width:36px}#amTrimPanel .tip{font-size:11px;color:#b9a48f;font-weight:500;line-height:1.35;margin-top:4px}';
  document.head.appendChild(st);
  var panel=null;
  function paint(){
    if(!panel) return;
    panel.querySelectorAll('[data-edge]').forEach(function(b){ b.classList.toggle('on',b.dataset.edge===S.edge); });
    panel.querySelectorAll('[data-mode]').forEach(function(b){ b.classList.toggle('on',b.dataset.mode===S.mode); });
    var f=null; try{f=getClip();}catch(e){}
    var t=panel.querySelector('.who'); if(t) t.textContent=f?('Clip at '+r3(f.clip.start)+'s, '+r3(f.clip.duration)+'s long'):'Select a clip first';
  }
  var TIPS={normal:'Normal: only this clip\u2019s edge moves.',ripple:'Ripple: clips after it on this track follow, no gap.',roll:'Roll: the cut with the neighbouring clip moves; total length stays.'};
  function build(){
    if(panel) return panel;
    panel=document.createElement('div'); panel.id='amTrimPanel'; panel.setAttribute('role','dialog'); panel.setAttribute('aria-label','Trim edit point');
    panel.innerHTML='<div class="h"><b>Trim edit point</b><button class="x" type="button" aria-label="Close" data-x="1">\u2715</button></div>'+
      '<div class="who tip" style="margin:2px 0 4px"></div>'+
      '<div class="r"><span>Edge</span><button type="button" data-edge="head">Head (start)</button><button type="button" data-edge="tail">Tail (end)</button></div>'+
      '<div class="r"><span>Mode</span><button type="button" data-mode="normal">Normal</button><button type="button" data-mode="ripple">Ripple</button><button type="button" data-mode="roll">Roll</button></div>'+
      '<div class="r"><span>Frames</span><button type="button" data-n="-5">\u22125</button><button type="button" data-n="-1">\u22121</button><button type="button" data-n="1">+1</button><button type="button" data-n="5">+5</button></div>'+
      '<div class="tip mt"></div><div class="tip">Keys: Alt+, and Alt+. nudge 1 frame (add Shift for 5).</div>';
    panel.addEventListener('click',function(e){
      var b=e.target.closest('button'); if(!b) return;
      if(b.dataset.x){ panel.classList.remove('on'); return; }
      if(b.dataset.edge){ S.edge=b.dataset.edge; save(); }
      else if(b.dataset.mode){ S.mode=b.dataset.mode; save(); }
      else if(b.dataset.n){ nudge(parseInt(b.dataset.n,10)); }
      panel.querySelector('.mt').textContent=TIPS[S.mode]; paint();
    });
    document.body.appendChild(panel); panel.querySelector('.mt').textContent=TIPS[S.mode]; return panel;
  }
  function toggle(){ build(); panel.classList.toggle('on'); paint(); }
  function addBtn(){
    if(document.getElementById('amTrimBtn')) return true;
    var tb=document.querySelector('.timeline-toolbar'); if(!tb) return false;
    var box=document.createElement('span'); box.className='zoom-box quick-box';
    var b=document.createElement('button'); b.className='toolbtn'; b.id='amTrimBtn'; b.type='button'; b.textContent='\u21C6 Trim+'; b.title='Trim an edit point: ripple, roll or normal, by frames (Alt+, / Alt+.)';
    b.onclick=toggle; box.appendChild(b); tb.appendChild(box); return true;
  }
  (function wait(){ if(!addBtn()) setTimeout(wait,400); })();
  try{ new MutationObserver(function(){ if(panel&&panel.classList.contains('on')) paint(); }).observe(document.getElementById('tracks')||document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']}); }catch(e){}
  addEventListener('keydown',function(e){
    try{
      if(!e.altKey||e.ctrlKey||e.metaKey||typing(e.target)) return;
      if(e.code!=='Comma'&&e.code!=='Period') return;
      e.preventDefault(); e.stopImmediatePropagation();
      nudge((e.code==='Comma'?-1:1)*(e.shiftKey?5:1));
    }catch(err){ try{console.warn('trim+',err);}catch(x){} }
  },true);
})();

;
/* ==================== Script 954 id="amiyo-pro-step03-synclock" ==================== */
/* Pro Step 3: Sync lock and track locking panel (Premiere's Sync Lock + Lock/Unlock All). Tap "Tracks+" on the timeline bar.
   Sync lock: when you Ripple-trim a clip (Trim+ from step 2), clips that come after the edit on OTHER tracks that have sync lock on move by the same
   amount, so picture, sound and titles stay together. Every track starts with sync lock ON; switch it off per track for things that must not move
   (for example a music bed). Locked tracks never move. Also on the panel: lock all, unlock all, lock every track except the selected clip's, sync on/off for all.
   Everything is one undo step and is saved in the project. */
(function(){
  function say(m){ try{notify(m);}catch(e){ try{toast(m);}catch(x){} } }
  function r3(v){ return Math.round(v*1000)/1000; }
  window.amiyoSyncShift=function(srcTrack,threshold,delta){
    var n=0;
    project.tracks.forEach(function(t){
      if(t===srcTrack||t.syncLock===false||t.locked) return;
      (t.clips||[]).forEach(function(c){ if(c.start>=threshold-0.001){ c.start=r3(Math.max(0,c.start+delta)); n++; } });
    });
    return n;
  };
  var st=document.createElement('style'); st.id='amiyo-pro03-style';
  st.textContent='#amTrkPanel{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(150px + env(safe-area-inset-bottom,0px));z-index:9990;width:min(380px,96vw);max-height:70vh;overflow:auto;background:#1b1713;color:#f3e9dd;border:1px solid #4a3d30;border-radius:14px;padding:10px 12px;box-shadow:0 8px 28px #000a;font:600 13px system-ui,sans-serif;display:none}'+
   '#amTrkPanel.on{display:block}#amTrkPanel .h{display:flex;justify-content:space-between;align-items:center}#amTrkPanel .h b{font-size:14px}'+
   '#amTrkPanel .g{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:8px 0}'+
   '#amTrkPanel button{min-height:40px;border:1px solid #4a3d30;background:#2a231c;color:#f3e9dd;border-radius:9px;font:700 12.5px system-ui,sans-serif;cursor:pointer;padding:0 6px}'+
   '#amTrkPanel button.on{background:#ff7a3d;color:#1a1008;border-color:#ff7a3d}#amTrkPanel .x{width:36px}'+
   '#amTrkPanel .row{display:grid;grid-template-columns:1fr 64px 64px;gap:6px;align-items:center;margin:5px 0}#amTrkPanel .row>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
   '#amTrkPanel .hd{display:grid;grid-template-columns:1fr 64px 64px;gap:6px;color:#b9a48f;font-size:11px;font-weight:600;text-align:center}#amTrkPanel .hd span:first-child{text-align:left}'+
   '#amTrkPanel .tip{font-size:11px;color:#b9a48f;font-weight:500;line-height:1.35;margin-top:6px}';
  document.head.appendChild(st);
  var panel=null;
  function rows(){
    var h='<div class="hd"><span>Track</span><span>Lock</span><span>Sync</span></div>';
    project.tracks.forEach(function(t,i){
      h+='<div class="row"><span>'+String(t.name||('Track '+(i+1))).replace(/</g,'&lt;')+'</span>'+
         '<button type="button" data-lock="'+i+'" class="'+(t.locked?'on':'')+'" aria-pressed="'+(!!t.locked)+'">'+(t.locked?'\uD83D\uDD12 On':'Off')+'</button>'+
         '<button type="button" data-sync="'+i+'" class="'+(t.syncLock!==false?'on':'')+'" aria-pressed="'+(t.syncLock!==false)+'">'+(t.syncLock!==false?'\u21C4 On':'Off')+'</button></div>';
    });
    return h;
  }
  function paint(){ if(!panel) return; panel.querySelector('.list').innerHTML=rows(); }
  function setAll(key,val,label){
    transact(label,function(){ project.tracks.forEach(function(t){ t[key]=val; }); }); paint();
  }
  function build(){
    if(panel) return;
    panel=document.createElement('div'); panel.id='amTrkPanel'; panel.setAttribute('role','dialog'); panel.setAttribute('aria-label','Track lock and sync lock');
    panel.innerHTML='<div class="h"><b>Tracks: lock and sync</b><button class="x" type="button" data-x="1" aria-label="Close">\u2715</button></div>'+
      '<div class="g"><button type="button" data-a="lockall">Lock all</button><button type="button" data-a="unlockall">Unlock all</button>'+
      '<button type="button" data-a="lockothers">Lock all except selected</button><button type="button" data-a="syncall">Sync lock: all on</button>'+
      '<button type="button" data-a="syncnone" style="grid-column:1/3">Sync lock: all off</button></div>'+
      '<div class="list"></div>'+
      '<div class="tip">Sync lock keeps other tracks in step when you Ripple-trim (Trim+). Locked tracks never change or move.</div>';
    panel.addEventListener('click',function(e){
      var b=e.target.closest('button'); if(!b) return;
      if(b.dataset.x){ panel.classList.remove('on'); return; }
      if(b.dataset.lock!=null){ var t=project.tracks[+b.dataset.lock]; if(!t) return; transact(t.locked?'Unlock track':'Lock track',function(){ t.locked=!t.locked; }); paint(); return; }
      if(b.dataset.sync!=null){ var s=project.tracks[+b.dataset.sync]; if(!s) return; transact(s.syncLock===false?'Sync lock on':'Sync lock off',function(){ s.syncLock=(s.syncLock===false); }); paint(); return; }
      var a=b.dataset.a;
      if(a==='lockall'){ setAll('locked',true,'Lock all tracks'); say('All tracks locked'); }
      else if(a==='unlockall'){ setAll('locked',false,'Unlock all tracks'); say('All tracks unlocked'); }
      else if(a==='syncall'){ setAll('syncLock',true,'Sync lock on for all'); say('Sync lock on for every track'); }
      else if(a==='syncnone'){ setAll('syncLock',false,'Sync lock off for all'); say('Sync lock off for every track'); }
      else if(a==='lockothers'){
        var f=null; try{f=getClip();}catch(x){}
        if(!f){ say('Select a clip first, then lock all the other tracks'); return; }
        transact('Lock other tracks',function(){ project.tracks.forEach(function(t){ t.locked=(t!==f.track); }); }); paint(); say('Locked every track except "'+(f.track.name||'this one')+'"');
      }
    });
    document.body.appendChild(panel);
  }
  function toggle(){ build(); panel.classList.toggle('on'); paint(); }
  window.amiyoTracksPanel=toggle;
  function addBtn(){
    if(document.getElementById('amTrkBtn')) return true;
    var tb=document.querySelector('.timeline-toolbar'); if(!tb) return false;
    var box=document.createElement('span'); box.className='zoom-box quick-box';
    var b=document.createElement('button'); b.className='toolbtn'; b.id='amTrkBtn'; b.type='button'; b.textContent='\uD83D\uDD12 Tracks+'; b.title='Lock / unlock all tracks and sync lock';
    b.onclick=toggle; box.appendChild(b); tb.appendChild(box); return true;
  }
  (function wait(){ if(!addBtn()) setTimeout(wait,400); })();
  document.addEventListener('click',function(){ if(panel&&panel.classList.contains('on')) setTimeout(paint,150); },true);
})();

;
/* ==================== Script 955 id="amiyo-pro-step04-transcript" ==================== */
/* Pro Step 4: Transcript editing (Premiere's text-based editing). Tap "Transcript" on the timeline bar. Every line of your Captions track is listed with its time.
   Tap a line's time to jump there. Tick the lines you do not want (or tap "Select fillers" to tick lines that are only um / uh / er / hmm), then "Cut out ticked lines":
   the matching time is removed from every unlocked track and the gap closes (the editor's own Extract), so words you delete from the transcript disappear from the video.
   Neighbouring ticked lines are cut as one piece. Each cut is one undo step, so Ctrl+Z / Undo brings a line back. Search box filters the list. Locked tracks are not touched. */
(function(){
  function say(m){ try{notify(m);}catch(e){ try{toast(m);}catch(x){} } }
  function fmt(s){ var m=Math.floor(s/60), x=s-m*60; return (m<10?'0':'')+m+':'+(x<10?'0':'')+x.toFixed(1); }
  function esc(t){ return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  var FILL=/^(?:[\s,.!?\u2026-]*(?:um+|uh+|uhm+|er+|erm|ah+|eh+|hmm+|mm+|hm+)[\s,.!?\u2026-]*)+$/i;
  function lines(){
    var out=[]; project.tracks.forEach(function(t){ if(t.kind!=='caption') return; (t.clips||[]).forEach(function(c){ var tx=c.text||c.caption||''; out.push({id:c.id,start:c.start,end:c.start+c.duration,text:String(tx).replace(/\s+/g,' ').trim(),locked:!!t.locked}); }); });
    out.sort(function(a,b){ return a.start-b.start; }); return out;
  }
  var st=document.createElement('style'); st.id='amiyo-pro04-style';
  st.textContent='#amTxPanel{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(150px + env(safe-area-inset-bottom,0px));z-index:9990;width:min(400px,96vw);max-height:72vh;display:none;flex-direction:column;background:#1b1713;color:#f3e9dd;border:1px solid #4a3d30;border-radius:14px;padding:10px 12px;box-shadow:0 8px 28px #000a;font:600 13px system-ui,sans-serif}'+
   '#amTxPanel.on{display:flex}#amTxPanel .h{display:flex;justify-content:space-between;align-items:center}#amTxPanel .h b{font-size:14px}'+
   '#amTxPanel button{min-height:38px;border:1px solid #4a3d30;background:#2a231c;color:#f3e9dd;border-radius:9px;font:700 12.5px system-ui,sans-serif;cursor:pointer;padding:0 8px}'+
   '#amTxPanel .x{width:36px}#amTxPanel input[type=search]{width:100%;box-sizing:border-box;min-height:38px;margin:8px 0 6px;border-radius:9px;border:1px solid #4a3d30;background:#120f0c;color:#f3e9dd;padding:0 10px;font:500 13px system-ui,sans-serif}'+
   '#amTxPanel .bar{display:flex;gap:6px;flex-wrap:wrap}#amTxPanel .bar button{flex:1;min-width:84px}'+
   '#amTxPanel .go{background:#d9442b;border-color:#d9442b;color:#fff;margin-top:8px;min-height:44px;width:100%}#amTxPanel .go[disabled]{opacity:.45}'+
   '#amTxPanel .list{overflow:auto;margin-top:6px;flex:1;min-height:60px;max-height:38vh;border-top:1px solid #3a3027}'+
   '#amTxPanel .ln{display:flex;gap:8px;align-items:flex-start;padding:7px 2px;border-bottom:1px solid #2c241c}#amTxPanel .ln.sel{background:#3a2417}'+
   '#amTxPanel .ln input{width:20px;height:20px;margin-top:2px;flex:none}#amTxPanel .ln .t{flex:none;width:52px;color:#ffb27a;font:700 12px ui-monospace,monospace;background:none;border:0;min-height:0;padding:2px 0;text-align:left}'+
   '#amTxPanel .ln .s{flex:1;font-weight:500;line-height:1.35;word-break:break-word}#amTxPanel .ln.cut .s{text-decoration:line-through;opacity:.5}#amTxPanel .empty{color:#b9a48f;font-weight:500;padding:12px 2px;line-height:1.4}';
  document.head.appendChild(st);
  var panel=null, picked={}, q='';
  function visible(){ var l=lines(); if(!q) return l; var k=q.toLowerCase(); return l.filter(function(x){ return x.text.toLowerCase().indexOf(k)>=0; }); }
  function count(){ return Object.keys(picked).length; }
  function paint(){
    if(!panel) return; var all=lines(), vis=visible(), L=panel.querySelector('.list'), ids={}; all.forEach(function(x){ ids[x.id]=1; });
    Object.keys(picked).forEach(function(k){ if(!ids[k]) delete picked[k]; });
    if(!all.length) L.innerHTML='<div class="empty">No captions yet. Make captions first (Captions / auto-caption or import an SRT), then they appear here as a transcript.</div>';
    else if(!vis.length) L.innerHTML='<div class="empty">No line matches your search.</div>';
    else L.innerHTML=vis.map(function(x){ return '<div class="ln'+(picked[x.id]?' sel cut':'')+'"><input type="checkbox" data-id="'+x.id+'" '+(picked[x.id]?'checked ':'')+(x.locked?'disabled ':'')+'aria-label="Cut this line"><button type="button" class="t" data-t="'+x.start+'">'+fmt(x.start)+'</button><span class="s">'+esc(x.text||'(empty)')+'</span></div>'; }).join('');
    var go=panel.querySelector('.go'), n=count(); go.disabled=!n; go.textContent=n?('Cut out '+n+' ticked line'+(n>1?'s':'')+' (closes the gaps)'):'Tick lines to cut out';
  }
  function cutPicked(){
    var l=lines().filter(function(x){ return picked[x.id]; }); if(!l.length) return;
    var ranges=[]; l.forEach(function(x){ var r=ranges[ranges.length-1]; if(r&&x.start<=r.b+0.05) r.b=Math.max(r.b,x.end); else ranges.push({a:x.start,b:x.end}); });
    if(!window.amiyoCut||!window.amiyoSetIO){ say('The cut engine is not available'); return; }
    var done=0, total=0;
    for(var i=ranges.length-1;i>=0;i--){ var r=ranges[i]; total+=r.b-r.a; window.amiyoSetIO(r.a,r.b); if(window.amiyoCut.extract()) done++; }
    picked={}; paint(); say('Cut out '+done+' piece'+(done===1?'':'s')+' ('+total.toFixed(1)+' s). Undo brings it back.');
  }
  function build(){
    if(panel) return;
    panel=document.createElement('div'); panel.id='amTxPanel'; panel.setAttribute('role','dialog'); panel.setAttribute('aria-label','Transcript editing');
    panel.innerHTML='<div class="h"><b>Transcript</b><button class="x" type="button" data-x="1" aria-label="Close">\u2715</button></div>'+
      '<input type="search" placeholder="Search the transcript" aria-label="Search the transcript">'+
      '<div class="bar"><button type="button" data-a="fill">Select fillers</button><button type="button" data-a="shown">Select shown</button><button type="button" data-a="none">Select none</button></div>'+
      '<div class="list"></div><button type="button" class="go" data-a="cut" disabled>Tick lines to cut out</button>';
    panel.addEventListener('click',function(e){
      var b=e.target.closest('button'); if(!b) return;
      if(b.dataset.x){ panel.classList.remove('on'); return; }
      if(b.dataset.t!=null){ try{ setCurrentTime(parseFloat(b.dataset.t)); }catch(x){} return; }
      var a=b.dataset.a;
      if(a==='fill'){ var n=0; lines().forEach(function(x){ if(!x.locked&&x.text&&FILL.test(x.text)){ picked[x.id]=1; n++; } }); say(n?(n+' filler line'+(n>1?'s':'')+' ticked'):'No filler-only lines found'); }
      else if(a==='shown'){ visible().forEach(function(x){ if(!x.locked) picked[x.id]=1; }); }
      else if(a==='none'){ picked={}; }
      else if(a==='cut'){ cutPicked(); return; }
      paint();
    });
    panel.addEventListener('change',function(e){ var c=e.target; if(c&&c.type==='checkbox'&&c.dataset.id){ if(c.checked) picked[c.dataset.id]=1; else delete picked[c.dataset.id]; paint(); } });
    panel.querySelector('input[type=search]').addEventListener('input',function(e){ q=e.target.value.trim(); paint(); });
    document.body.appendChild(panel);
  }
  function toggle(){ build(); panel.classList.toggle('on'); paint(); }
  window.amiyoTranscript={toggle:toggle,lines:lines,pick:function(ids){ picked={}; ids.forEach(function(i){ picked[i]=1; }); paint(); },cut:cutPicked};
  function addBtn(){
    if(document.getElementById('amTxBtn')) return true;
    var tb=document.querySelector('.timeline-toolbar'); if(!tb) return false;
    var box=document.createElement('span'); box.className='zoom-box quick-box';
    var b=document.createElement('button'); b.className='toolbtn'; b.id='amTxBtn'; b.type='button'; b.textContent='\uD83D\uDCDD Transcript'; b.title='Edit the video by deleting lines of the caption transcript';
    b.onclick=toggle; box.appendChild(b); tb.appendChild(box); return true;
  }
  (function wait(){ if(!addBtn()) setTimeout(wait,400); })();
  document.addEventListener('click',function(){ if(panel&&panel.classList.contains('on')) setTimeout(paint,200); },true);
})();

;
/* ==================== Script 956 id="amiyo-export-chk01" ==================== */
/* Export check 1 of 10: the Export window itself.
   - On a phone the Start export button was above all the options, so you pressed it before reaching them. Now the options come
     first and a bar with a one-line summary and Start export stays pinned to the bottom of the window.
   - "Time: ... exports in real time" ignored the Fast export tick. It now says what will really happen.
   - File type in the estimate and the Format note now follow what Fast export really writes (MP4 when the device can encode H.264).
   - If the device can encode H.264 (Fast export) but its recorder cannot, an MP4 chip is offered too. */
(function(){
"use strict";
function $(i){ return document.getElementById(i); }
var css=document.createElement("style"); css.id="amiyo-export-chk01-css";
css.textContent='@media (max-width:760px){.x80-side{display:contents}.x80-side>.x80-card{order:-1}.x80-go{order:9;position:sticky;bottom:0;z-index:5;margin:0 -2px;padding:8px 2px calc(8px + env(safe-area-inset-bottom,0px));background:var(--panel,#14110e);border-top:1px solid rgba(255,255,255,.12)}'+
  '.x80-go #expStickyLine{font-size:11.5px;line-height:1.4;color:var(--muted);margin:0 0 6px;text-align:center}}'+
  '@media (min-width:761px){#expStickyLine{display:none}}';
document.head.appendChild(css);
var h264=null;
function probeH264(){
  if(h264!==null) return;
  h264=false;
  try{ if(typeof VideoEncoder==="undefined") return;
    var cs=["avc1.640028","avc1.4d0028","avc1.42001f","avc1.42E01E"], k=0;
    (function next(){ if(k>=cs.length) return; VideoEncoder.isConfigSupported({codec:cs[k++],width:1280,height:720,bitrate:5e6,framerate:30,avc:{format:"avc"}}).then(function(r){ if(r&&r.supported){ h264=true; sync(); } else next(); },next); })();
  }catch(e){}
}
function fastOn(){ var f=$("expFast"); return !!f&&f.checked; }
function fixEstimate(){
  var box=$("expEstimate"); if(!box) return;
  var fast=fastOn(), divs=box.querySelectorAll("div"), i, d;
  for(i=0;i<divs.length;i++){
    d=divs[i]; var t=d.textContent||"";
    if(/^Time:/.test(t)&&fast&&!d.dataset.c1){
      var m=t.match(/about (.+?) \(/); 
      d.dataset.c1="1"; d.innerHTML='<b>Time:</b> usually much less than '+(m?m[1]:"the video length")+' <span style="color:var(--muted)">(Fast export draws frames as quickly as the device allows)</span>';
    }
    if(/^File size:/.test(t)&&fast&&h264&&!d.dataset.c1&&!(window.__amiyoXCodec&&!/mp4/.test(window.__amiyoXCodec))){
      d.dataset.c1="1"; d.innerHTML=d.innerHTML.replace(/as WebM/,"as MP4");
    }
  }
}
function stickyLine(){
  var go=document.querySelector(".x80-go"); if(!go) return;
  var line=$("expStickyLine"); if(!line){ line=document.createElement("div"); line.id="expStickyLine"; line.setAttribute("aria-live","polite"); go.insertBefore(line,go.firstChild); }
  var s=$("expSummary"), e=$("expEstimate"), t=s?s.innerText.replace(/^Will make:\s*/i,"").replace(/\s+/g," ").trim():"";
  var fs=e&&/File size:\s*([^\n]*?)\s+as\s/.exec(e.innerText.replace(/\n/g," "));
  line.textContent=t+(fs?" · "+fs[1].replace(/^up to about /,"≈ "):"");
}
function fmtNote(){
  var n=$("expFmtNote"); if(!n) return;
  if(window.__amiyoXCodec==="video/mp4;codecs=avc1.42E01E"&&h264){ n.textContent="Plays almost everywhere: phones, WhatsApp, social sites, editors. Made by Fast export."; return; }
  if(window.__amiyoXCodec) return;
  if(fastOn()&&h264) n.textContent="Auto makes MP4 · H.264 (plays almost everywhere). Choose a format only if you need a particular one.";
}
function addMp4(){
  var row=$("expFmtRow"); if(!row||!h264||row.querySelector('[data-id="mp4"]')) return;
  var b=document.createElement("button"); b.type="button"; b.className="chip"; b.dataset.id="mp4"; b.dataset.m="video/mp4;codecs=avc1.42E01E"; b.textContent="MP4 · H.264";
  b.title="Plays almost everywhere: phones, WhatsApp, social sites, editors. Made by Fast export.";
  row.insertBefore(b,row.children[1]||null);
}
function sync(){ try{ addMp4(); fixEstimate(); stickyLine(); fmtNote(); }catch(e){ window.__swl&&window.__swl(e); } }
var prev=window.openModal;
window.openModal=function(title){
  var r=prev.apply(this,arguments);
  if(title==="Export video"){
    probeH264();
    [30,350,900].forEach(function(ms){ setTimeout(sync,ms); });
    var body=$("modalBody");
    if(body){
      var obs=new MutationObserver(function(){ if(obs._b) return; obs._b=1; setTimeout(function(){ obs._b=0; sync(); },30); });
      var tgt=[$("expEstimate"),$("expSummary")].filter(Boolean); tgt.forEach(function(t){ obs.observe(t,{childList:true,subtree:true,characterData:true}); });
      body.addEventListener("change",function(e){ if(e.target&&e.target.id==="expFast"){ body.dispatchEvent(new Event("input",{bubbles:true})); } setTimeout(sync,80); });
      body.addEventListener("click",function(){ setTimeout(sync,120); });
    }
  }
  return r;
};
})();

;
/* ==================== Script 957 id="amiyo-export-chk02" ==================== */
/* Export check 2 of 10: Quick presets and My presets.
   Found by testing: saving "My preset" after tapping a quick preset (YouTube 12 Mbps, Reels 10 Mbps ...) dropped that preset's video
   bitrate, so the saved preset exported at a lower automatic bitrate. It now keeps it (as a manual Mbps value).
   The little x next to a saved preset deleted it on the first tap, right beside the Apply button; it now asks for a second tap.
   The preset note also says what the preset changed in the picture bitrate. */
(function(){
"use strict";
function $(i){ return document.getElementById(i); }
function wire(){
  var save=$("expMineSave"), row=$("expMineRow"); if(!save||!row||save.dataset.c2) return; save.dataset.c2="1";
  /* capture phase: runs before the original Save handler */
  save.addEventListener("click",function(){
    var pb=window.__amiyoPresetBps;
    if(!(window.__amiyoXBps>0)&&pb>0){
      window.__amiyoXBps=pb;
      setTimeout(function(){ window.__amiyoXBps=0; },0);
      var n=$("expMineNote"); if(n) setTimeout(function(){ if(/^(Saved|Updated)/.test(n.textContent)) n.textContent+=" Includes the "+(Math.round(pb/1e5)/10)+" Mbps video bitrate of the quick preset."; },0);
    }
  },true);
  row.addEventListener("click",function(e){
    var d=e.target.closest&&e.target.closest("[data-d]"); if(!d) return;
    if(d.dataset.armed==="1") return;               /* second tap: let the original handler delete */
    e.stopPropagation(); e.preventDefault();
    d.dataset.armed="1"; d.textContent="Delete?"; d.style.cssText+=";background:#b3261e;color:#fff;padding:2px 8px";
    var n=$("expMineNote"); if(n) n.textContent="Tap Delete? again to remove this preset.";
    setTimeout(function(){ if(d.isConnected&&d.dataset.armed==="1"){ d.dataset.armed=""; d.textContent="×"; d.style.background=""; d.style.color=""; d.style.padding="2px 6px"; if(n&&/^Tap Delete/.test(n.textContent)) n.textContent=""; } },3500);
  },true);
}
var prev=window.openModal;
window.openModal=function(title){
  var r=prev.apply(this,arguments);
  if(title==="Export video"){ [0,300].forEach(function(ms){ setTimeout(function(){ try{ wire(); }catch(e){ window.__swl&&window.__swl(e); } },ms); }); }
  return r;
};
})();

;
/* ==================== Script 958 id="amiyo-export-chk03" ==================== */
/* Export check 3 of 10: Range (whole edit, In → Out, playhead → end, start → playhead, selected clip, custom).
   Tested by really exporting: playhead → end gave exactly 12 s of a 20 s edit, custom 5–12 gave 7 s, in both Fast export and the
   standard recorder; bad times disable Start with a clear message. Small gaps fixed:
   - Custom times typed with a decimal comma (0,5 or 12,5) were read as 0 and 12; they now mean 0.5 and 12.5.
   - Custom From / To can be filled from the playhead with one tap ("Now") instead of typing times on a phone keyboard.
   - The pinned bar shows which part is being exported (for example "0:05–0:12 · 7 s") so a range is never forgotten. */
(function(){
"use strict";
function $(i){ return document.getElementById(i); }
function tc(s){ s=Math.max(0,s); var m=Math.floor(s/60), x=s-m*60; return m+":"+(x<10?"0":"")+x.toFixed(x%1?1:0); }
function dur(s){ return s<60?(Math.round(s*10)/10+" s"):tc(s); }
function wire(){
  var cust=$("expRangeCustom"); if(!cust||cust.dataset.c3) return; cust.dataset.c3="1";
  /* decimal comma -> dot, before the original change handler reads the boxes */
  cust.addEventListener("change",function(e){
    var t=e.target; if(!t||!/^expR(From|To)$/.test(t.id)) return;
    var v=String(t.value||"").trim(); if(/^\d+,\d+$/.test(v)) t.value=v.replace(",",".");
  },true);
  function nowBtn(id,label){
    var inp=$(id); if(!inp||inp.nextElementSibling&&inp.nextElementSibling.dataset&&inp.nextElementSibling.dataset.now) return;
    var b=document.createElement("button"); b.type="button"; b.className="chip"; b.dataset.now="1"; b.textContent="Now"; b.title=label; b.setAttribute("aria-label",label);
    b.style.cssText="padding:3px 8px;font-size:11px";
    b.onclick=function(){ var t=typeof currentTime==="number"?currentTime:0; inp.value=tc(t); inp.dispatchEvent(new Event("change",{bubbles:true})); };
    inp.parentNode.insertBefore(b,inp.nextSibling);
  }
  nowBtn("expRFrom","Use the playhead as the start"); nowBtn("expRTo","Use the playhead as the end");
}
function decorate(){
  var line=$("expStickyLine"); if(!line||line.dataset.c3busy) return;
  var r=window.__amiyoXRange; if(!r) return;
  var txt=line.textContent; if(txt.indexOf("⏱")>=0) return;
  line.dataset.c3busy="1"; line.textContent="⏱ "+tc(r.t0)+"–"+tc(r.t1)+" · "+dur(r.t1-r.t0)+" · "+txt; setTimeout(function(){ line.dataset.c3busy=""; },0);
}
var prev=window.openModal;
window.openModal=function(title){
  var r=prev.apply(this,arguments);
  if(title==="Export video"){
    [0,300].forEach(function(ms){ setTimeout(function(){ try{ wire(); }catch(e){ window.__swl&&window.__swl(e); } },ms); });
    setTimeout(function(){
      var line=$("expStickyLine"); if(!line) return;
      new MutationObserver(function(){ decorate(); }).observe(line,{childList:true,characterData:true,subtree:true});
      decorate();
    },500);
  }
  return r;
};
})();

;
/* ==================== Script 959 id="amiyo-export-chk04" ==================== */
/* Export check 4 of 10: Sizes and Custom size.
   Tested by really exporting and reading the file back: 360p, 480p and 1080p came out as 640×360, 854×480 and 1920×1080; custom 1001×501 became
   1002×502 (even numbers), 100×100 became 160×160, 4000×2250 became 3840×2250; 1080×1920 came out exactly 1080×1920.
   Found and fixed:
   - Vertical Full HD (Reels, Stories, custom 1080×1920) warned "very heavy for a browser, try Full HD" although it has the same number of pixels
     as 1920×1080. The warning now depends on pixels, not on height.
   - Choosing a size larger than the project (for example 1080p from a 720p project) gave no hint; a note now says the picture is enlarged,
     the file grows, and there is no extra detail. */
(function(){
"use strict";
function $(i){ return document.getElementById(i); }
var HEAVY=3200000;                         /* about 1440p; Full HD is 2.07 million */
function outDims(){
  var s=$("expSummary"), m=s&&/(\d+)×(\d+)/.exec(s.innerText); return m?[+m[1],+m[2]]:null;
}
function sync(){
  var d=outDims(); if(!d) return;
  var px=d[0]*d[1];
  if(px<=HEAVY){
    var est=$("expEstimate"); if(est){ [].slice.call(est.querySelectorAll('[role="alert"]')).forEach(function(a){ if(/very heavy for a browser/.test(a.textContent)) a.remove(); }); }
    var cn=$("expCNote"); if(cn&&/Very large for a browser/.test(cn.textContent)) cn.textContent=cn.textContent.replace(/\s*Very large for a browser: if frames drop, try Full HD\./,"");
  }
  var anchor=$("expCustom")||$("expSizes"); if(!anchor) return;
  var n=$("expUpNote"); if(!n){ n=document.createElement("div"); n.id="expUpNote"; n.setAttribute("aria-live","polite"); n.style.cssText="font-size:11px;color:var(--muted);margin-top:6px;line-height:1.45"; anchor.parentNode.insertBefore(n,anchor.nextSibling); }
  var s=project.settings||{}, pw=s.width||1280, ph=s.height||720, scale=Math.min(d[0]/pw,d[1]/ph);
  n.textContent=scale>1.02?("Larger than the project picture ("+pw+"×"+ph+"): it is enlarged, the file gets bigger and there is no extra detail. Raise the project size or use higher-resolution media for a sharper result."):"";
}
var prev=window.openModal;
window.openModal=function(title){
  var r=prev.apply(this,arguments);
  if(title==="Export video"){
    var body=$("modalBody"); if(!body) return r;
    var t=0; function later(){ clearTimeout(t); t=setTimeout(function(){ try{ sync(); }catch(e){ window.__swl&&window.__swl(e); } },60); }
    [100,400,900].forEach(function(ms){ setTimeout(later,ms); });
    body.addEventListener("click",later); body.addEventListener("input",later); body.addEventListener("change",later);
    var obs=new MutationObserver(later); [$("expEstimate"),$("expCNote")].forEach(function(x){ if(x) obs.observe(x,{childList:true,subtree:true,characterData:true}); });
  }
  return r;
};
})();

;
/* ==================== Script 960 id="amiyo-export-chk05" ==================== */
/* Export check 5 of 10: Frame rate.
   Tested by really exporting a 5 s edit and counting the frames in the file: Project 30 → 150 frames, 24 → 120, 25 → 125, 50 → 250, 60 → 300
   (Fast export); the standard recorder gave 120 frames at 24 fps. Fractional project rates also came out right (29.97 → 30000/1001, 23.976 → 24000/1001)
   and a 120 fps project exported 600 frames. Nothing was wrong with the numbers. What was missing was an honest hint about what a different rate does:
   - Above the project rate: video clips only repeat frames (animations, titles and transitions do get smoother) and the file is bigger.
   - Below the project rate: frames are skipped, so fast motion looks less smooth, and the file is smaller. */
(function(){
"use strict";
function $(i){ return document.getElementById(i); }
function fmt(f){ return (Math.round(f*1000)/1000)+" fps"; }
function sync(){
  var n=$("expFpsNote"); if(!n) return;
  var pf=(project.settings&&project.settings.fps)||30, f=window.__amiyoXFps||0;
  n.textContent=n.textContent.replace(/\s*(Higher|Lower) than the project[^|]*?\.(?=\s|$)/g,"");
  if(!f||Math.abs(f-pf)<0.01) return;
  var add=f>pf?(" Higher than the project’s "+fmt(pf)+": video clips only repeat frames (titles, animations and transitions do get smoother) and the file is bigger."):
                (" Lower than the project’s "+fmt(pf)+": some frames are skipped, so fast motion looks less smooth, and the file is smaller.");
  if(n.textContent.indexOf("than the project")<0) n.textContent=n.textContent.replace(/\s+$/,"")+add;
}
var prev=window.openModal;
window.openModal=function(title){
  var r=prev.apply(this,arguments);
  if(title==="Export video"){
    var t=0, later=function(){ clearTimeout(t); t=setTimeout(function(){ try{ sync(); }catch(e){ window.__swl&&window.__swl(e); } },40); };
    [150,500].forEach(function(ms){ setTimeout(later,ms); });
    var row=$("expFpsRow"); if(row) row.addEventListener("click",later);
    var body=$("modalBody"); if(body) body.addEventListener("change",later);
    var n=$("expFpsNote"); if(n) new MutationObserver(function(){ if(n.textContent.indexOf("than the project")<0) later(); }).observe(n,{childList:true,characterData:true,subtree:true});
  }
  return r;
};
})();

;
/* ==================== Script 961 id="amiyo-export-s01-webm-duration" ==================== */
/* Export step 1: WebM length fix. The standard (real-time) export saved WebM files with no length inside, so players showed "unknown" or 0:00 and could not seek.
   Now, after the video is recorded, the true length (taken from the export range) is written into the file header. MP4 files and the fast export are not touched. If anything looks unexpected the file is saved exactly as recorded. */
(function(){
  "use strict";
  function vint(b,i){ var n=1,m=0x80; while(n<=8&&!(b[i]&m)){ n++; m>>=1; } if(n>8) return null; var v=b[i]&(m-1); for(var k=1;k<n;k++) v=v*256+b[i+k]; return {n:n,v:v,unk:v===Math.pow(2,7*n)-1}; }
  function idlen(b,i){ var n=1,m=0x80; while(n<=4&&!(b[i]&m)){ n++; m>>=1; } return n>4?0:n; }
  async function fixWebm(blob,secs){
    try{
      if(!blob||!/webm/i.test(blob.type||"")||!(secs>0)) return blob;
      var head=new Uint8Array(await blob.slice(0,4096).arrayBuffer());
      if(head[0]!==0x1A||head[1]!==0x45||head[2]!==0xDF||head[3]!==0xA3) return blob;
      var i=0, n=idlen(head,i), s=vint(head,i+n); i=i+n+s.n+s.v;                       /* skip EBML header */
      if(!(head[i]===0x18&&head[i+1]===0x53&&head[i+2]===0x80&&head[i+3]===0x67)) return blob;
      var seg=vint(head,i+4); if(!seg||!seg.unk) return blob;                          /* only a live (unknown-size) segment is handled */
      i=i+4+seg.n;
      var infoAt=-1;
      for(var guard=0;guard<12&&i<head.length-12;guard++){
        var il=idlen(head,i); if(!il) return blob; var id=0; for(var k=0;k<il;k++) id=id*256+head[i+k];
        var sz=vint(head,i+il); if(!sz||sz.unk) return blob;
        if(id===0x1549A966){ infoAt=i; break; }
        i=i+il+sz.n+sz.v;
      }
      if(infoAt<0) return blob;
      var il2=4, szv=vint(head,infoAt+il2), bodyAt=infoAt+il2+szv.n, bodyEnd=bodyAt+szv.v;
      if(bodyEnd>head.length) return blob;
      var scale=1000000, j=bodyAt;
      while(j<bodyEnd-2){
        var l=idlen(head,j); if(!l) return blob; var eid=0; for(var q=0;q<l;q++) eid=eid*256+head[j+q];
        var es=vint(head,j+l); if(!es||es.unk) return blob;
        if(eid===0x4489) return blob;                                                    /* a length is already there */
        if(eid===0x2AD7B1){ scale=0; for(var q2=0;q2<es.v;q2++) scale=scale*256+head[j+l+es.n+q2]; }
        j=j+l+es.n+es.v;
      }
      var newSize=szv.v+11; if(newSize>=Math.pow(2,7*szv.n)-1) return blob;              /* size field would overflow: leave the file alone */
      var dur=new Uint8Array(11); dur[0]=0x44; dur[1]=0x89; dur[2]=0x88;
      new DataView(dur.buffer).setFloat64(3,secs*1e9/scale,false);
      var sizeBytes=new Uint8Array(szv.n), v=newSize; for(var z=szv.n-1;z>=0;z--){ sizeBytes[z]=v%256; v=Math.floor(v/256); } sizeBytes[0]|=(0x80>>(szv.n-1));
      var out=new Blob([head.slice(0,infoAt+il2),sizeBytes,head.slice(bodyAt,bodyEnd),dur,blob.slice(bodyEnd)],{type:blob.type});
      return out;
    }catch(e){ try{ window.__swl&&window.__swl(e); }catch(x){} return blob; }
  }
  window.amiyoFixWebmDuration=fixWebm;
  var prev=window.amiyoTagBlob;
  window.amiyoTagBlob=async function(b){
    var r=b; try{ if(typeof prev==="function") r=await prev.apply(this,arguments); }catch(e){ r=b; }
    var span=window.__amiyoRecSecs; window.__amiyoRecSecs=0;
    return span>0?await fixWebm(r||b,span):(r||b);
  };
})();

;
/* ==================== Script 962 id="amiyo-export-s02-multitrack-fast" ==================== */
/* Export step 2: the fast export now handles video on more than one track (picture-in-picture, overlays). Before, it gave up and used the slow real-time export.
   Each track has its own hidden picture that the fast reader fills for the exact frame time; the layers are then drawn by the same code as the preview. */
(function(){
  "use strict";
  var FC=new Map();
  window.__amiyoFastEl=async function(tid,clip){
    var a=getAsset(clip.assetId); if(!a||a.type!=="video") return null;
    var cv=FC.get(tid); if(!cv){ cv=document.createElement("canvas"); cv.width=2; cv.height=2; cv.__amiyoPrimed=true; FC.set(tid,cv); }
    var local=currentTime-clip.start, seek=window.__amiyoComputeSeek?window.__amiyoComputeSeek(clip,local):(clip.inPoint||0)+local*(clip.speed||1);
    await window.__amiyoFastTV(tid,clip,Math.max(0,seek),cv);
    return cv;
  };
})();

;
/* ==================== Script 963 id="amiyo-export-s04-fonts" ==================== */
/* Export step 4: fonts are loaded before any export starts. A font that is listed but not downloaded yet (a web font, or one restored from the saved project) made the first
   seconds of the video use the plain default letters even though the preview looked right. Every font used by a title or caption is now loaded first (up to 4 s per font), then the picture is redrawn. */
(function(){
  "use strict";
  function families(){
    var seen={}, list=[];
    (project.tracks||[]).forEach(function(t){ (t.clips||[]).forEach(function(c){
      if(c.off) return; var s=c.textStyle; if(!s||!s.fontFamily) return;
      var fam=String(s.fontFamily).split(",")[0].replace(/["']/g,"").trim(), w=s.weight||800, k=fam+"|"+w;
      if(fam&&!seen[k]){ seen[k]=1; list.push({fam:fam,w:w}); }
    }); });
    return list;
  }
  window.amiyoEnsureFonts=async function(){
    if(!document.fonts||!document.fonts.load) return 0;
    var list=families(), n=0;
    await Promise.all(list.map(function(f){
      return Promise.race([
        document.fonts.load(f.w+" 40px \""+f.fam+"\"","Aa").then(function(r){ if(r&&r.length) n++; }).catch(function(){}),
        new Promise(function(r){ setTimeout(r,4000); })
      ]);
    }));
    if(list.length){ try{ await document.fonts.ready; }catch(e){} try{ await renderPreviewFrame(); }catch(e){} }
    return n;
  };
})();

;
/* ==================== Script 964 id="amiyo-export-s02-verified" ==================== */
/* Export step 2 checked: a real fast export of two video tracks (full-screen clip + picture-in-picture overlay) gave a 1280x720 VP9 file, 360 frames for 12 s, the overlay drawn at the right place and time. No change needed. */window.AMIYO_EXPORT_STEP=4;

;
/* ==================== Script 965 id="amiyo-export-s03-volume-atomic" ==================== */
/* Export step 3: the live sound (preview and the standard recording) no longer flips between the right level and the raw clip level.
   Found by playing a clip (clip volume 50%, track 60%, master 80%, 1 s fades) and reading its volume 3 ms apart: about 80% of the time it was the raw 50%
   and only briefly the correct 24%, so fades barely showed and the recorded file was louder and uneven. The cause: the player first sets the clip volume, and the
   fade / track / master / ducking steps multiply it a moment later, so in between the raw value was heard.
   Now every volume change made during one sound update is held back and applied together at the end of that update, so only the finished level is ever heard.
   A clip that has just started is muted until its first finished level is ready, so there is no loud blip. Updates are also run one at a time instead of overlapping. */
(function(){
  "use strict";
  try{
    var d=Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,"volume"); if(!d||!d.set||!d.get) return;
    var prev=window.updateAudioPlayback; if(typeof prev!=="function") return;
    var depth=0, pend=new Map(), seen=new WeakSet(), running=null, again=false;
    function flush(){
      pend.forEach(function(v,el){ try{ d.set.call(el,v<0?0:v>1?1:v); }catch(e){} });
      pend.clear();
    }
    Object.defineProperty(HTMLMediaElement.prototype,"volume",{
      configurable:true, enumerable:d.enumerable,
      get:function(){ return (depth>0&&pend.has(this))?pend.get(this):d.get.call(this); },
      set:function(v){
        if(depth>0){
          v=+v; if(!(v===v)) v=0;
          if(!seen.has(this)){ seen.add(this); try{ d.set.call(this,0); }catch(e){} }   /* first time: start silent, the finished level follows at the end of this update */
          pend.set(this,v<0?0:v>1?1:v);
        }else{ seen.add(this); d.set.call(this,v); }
      }
    });
    window.updateAudioPlayback=function(){
      var args=arguments;
      if(running){ again=true; return running; }
      running=(async function(){
        try{
          var guard=0;
          do{
            again=false; depth++;
            try{ await prev.apply(window,args); }
            finally{ depth--; flush(); }
          }while(again&&++guard<3);
        }finally{ running=null; again=false; }
      })();
      return running;
    };
    window.__amiyoVolAtomic=true;
  }catch(e){ try{ window.__swl&&window.__swl(e); }catch(x){} }
})();

;
/* ==================== Script 966 id="amiyo-export-s04-verified" ==================== */
/* Export step 4 checked: animated text (letter-by-letter blur in, fade out, two lines, background box, outline, shadow) in a real fast export matched the preview frame for frame (38-43 dB, the normal video-compression difference). No change needed. */

;
/* ==================== Script 967 id="amiyo-export-s05-verified" ==================== */
/* Export step 5 checked: all 83 transitions and 21 effect setups (blur, brightness, contrast, saturation, grayscale, sepia, hue, invert, vignette, white balance, fade and hue tools, filter presets, looks, colour wheels, crop, opacity/scale/rotation, fades, flip, blend mode) in a real fast export matched the preview. One real difference found and fixed: a video file with no colour tag (many screen recordings, downloads and this editor's own exports) was decoded by the fast export with the BT.709 matrix, while the preview shows it as BT.601, so colours were shifted (green up to about 14 levels). The fast export now tells the decoder the same matrix the preview uses; files tagged BT.709 are unchanged. After the fix the difference is about 1 level. Not testable here: the MP4 (H.264) colour tag, because the test browser has no H.264. */window.AMIYO_EXPORT_STEP=5;

;
/* ==================== Script 968 id="amiyo-export-s06-verified" ==================== */
/* Export step 6 checked (MP4 path): the fast export's MP4 writer was run on real H.264 + AAC data and the files were read back with ffmpeg/ffprobe (decode with 0 errors, seeking, key frames, video-only files). Four things fixed:
   1) a stretch of 20 s or more with no sound at all was skipped, and an MP4 lays sound out back to back, so all sound after the gap played too early (a 4 s test came out with 2 s of sound). The gap is now filled with silence.
   2) as a safety net the MP4 writer now refuses a file whose sound has a hole or starts late (the standard export runs instead) rather than saving it out of step.
   3) the colour the encoder reports is written into the MP4 (colr box), so players no longer guess the colour matrix. Files from encoders that report nothing are unchanged.
   4) Title / Author / Comment from the export dialog are now written into the fast-export MP4 (the old step only handled fragmented MP4, so the info was dropped with a "could not be added" message).
   Not testable here: the browser's own H.264/AAC encoders (this test machine has no browser with them), so the colour tag and AAC start delay (about 20-40 ms, not corrected) still need one real export in Chrome to confirm. */window.AMIYO_EXPORT_STEP=6;

;
/* ==================== Script 969 id="amiyo-export-s07-verified" ==================== */
/* Export step 7 checked (WAV): the WAV writer was run for 16-bit and 24-bit, stereo and mono, 16/44.1/48 kHz and read back with ffmpeg (right format and length, loud peaks clipped cleanly); the file length always matched the pieces on 20,000 random long ranges. The sound maths (volume keys, fades, track level, panner, master) match the video export, and reversed clips use their own reversed file, so they sound right. One gap fixed: the video export can use the In and Out points, but the WAV only offered "Whole project" or "Selected clip", so a WAV of just the In → Out part was impossible. "In → Out" is now offered (and chosen first when both points are set). Not testable here: the browser's own decoder for very large video files (they are reported if skipped). */window.AMIYO_EXPORT_STEP=7;

;
/* ==================== Script 970 id="amiyo-export-s08-verified" ==================== */
/* Export step 8 checked (GIF): the GIF encoder was run on a 24-frame test (moving gradient, noise, a colour change) and read back with ffmpeg: no decode errors, exactly 24 frames, right timing (15 fps = 1.6 s, 10 fps = 2.4 s), loop-forever mark present and "play once" mark absent, and the picture error stayed the same from the first frame to the last, so the "only changed pixels" frames are correct. One fix: at 15 fps the capture reused the preview's video seek, which keeps the old picture when the video is within 0.08 s of the wanted time, so a GIF of a video clip could show repeated pictures; the capture now seeks to the exact frame, as the video export does. Not testable here: capture from a real video file in a browser. */window.AMIYO_EXPORT_STEP=8;

;
/* ==================== Script 971 id="amiyo-export-s09-frames" ==================== */
/* Export step 9 helper: draw the preview once at full quality with the exact video picture, then put the settings back as they were. Used by Export frame and the thumbnail. */
(function(){
  "use strict";
  window.__amiyoExactFrame=async function(){
    var f0=window.__amiyoForceFull, t0=window.__amiyoSeekTol;
    var m0=window.__amiyoMidFrame; window.__amiyoForceFull=true; window.__amiyoSeekTol=.004; window.__amiyoMidFrame=true;
    try{ await renderPreviewFrame(); }finally{ window.__amiyoForceFull=f0; window.__amiyoSeekTol=t0||0; window.__amiyoMidFrame=m0; }
  };
})();

;
/* ==================== Script 972 id="amiyo-export-s09-verified" ==================== */
/* Export step 9 checked (frame, SRT, thumbnail). SRT/VTT: times are correct (rounding cannot give .1000); but a blank line inside a caption ended the cue in the file, so the rest of the text was lost in players (tested with ffmpeg: 1 of 2 cues survived); fixed, VTT also writes & and < safely. Export frame and the thumbnail drew the preview as it was: possibly a draft-quality picture, and the video picture could be up to 0.08 s old; both now draw at full quality and the exact picture. The thumbnail's "Middle" and "First frame" used the whole project even when only In → Out was exported; they now follow the exported range. Not changed: SRT times are timeline times, so for an In → Out video the subtitles are not shifted. */window.AMIYO_EXPORT_STEP=9;

;
/* ==================== Script 973 id="amiyo-export-s10-outgoing" ==================== */
/* Export step 10: found by a full-edit test (2 video tracks + a fade transition + titles). When a second video layer (picture-in-picture, overlay) was on screen, the multi-layer
   compositor drew the frame itself and the code that saves "the last picture of the outgoing clip" was skipped. A transition right after it then blended in a picture that was
   seconds old (and carried old titles) in the preview and in the exported file. This outermost wrapper saves that picture after every drawn frame, whichever route drew it.
   Only clips that are followed by a transition on their own track are copied, so edits without transitions pay nothing. */
(function(){
  "use strict";
  var prev=window.renderPreviewFrame; if(typeof prev!=="function"||!window.__amiyoSaveOutgoing) return;
  window.renderPreviewFrame=async function(){
    var r=await prev.apply(this,arguments);
    try{ if(!window.__amiyoPriming) window.__amiyoSaveOutgoing(currentTime); }catch(e){ try{ window.__swl&&window.__swl(e); }catch(x){} }
    return r;
  };
})();

;
/* ==================== Script 974 id="amiyo-export-s10-verified" ==================== */
/* Export step 10 checked (full edit: 2 video tracks incl. picture-in-picture, sepia/contrast/blur, fade transition, music with fades, typewriter title, 2 captions). Real fast export: 270 frames, 9.02 s, 1280x720, picture and titles matched the preview (36-42 dB). One bug found and fixed: with a second video layer on screen the outgoing clip of a transition was never saved, so the transition blended an old picture (with old titles). Not testable here: MP4/H.264 (no H.264 encoder in the test browser) - do one real export in Chrome. Known limit: a transition that starts while an overlay is still on screen is not drawn by the multi-layer compositor. */window.AMIYO_EXPORT_STEP=10;

;
/* ==================== Script 975 id="amiyo-export-s11-verified" ==================== */
/* Export follow-up 1 checked: a transition that starts while a picture-in-picture/overlay clip is on screen is now drawn (wipe tested at 5.5 s with an overlay running 1-8 s: wipe in progress, overlay on top; before the change it was a hard cut). The multi-layer compositor calls window.__amiyoStackTransition after painting each clip. The outgoing picture is the saved full picture of the previous clip, as in the single-layer path. */window.AMIYO_EXPORT_STEP=11;

;
/* ==================== Script 976 id="amiyo-al-s15-zoom" ==================== */
/* Audio Lab improvement 5: zoomable waveform. A zoom strip under the waveform with a time ruler: mouse wheel / pinch / + − buttons zoom, drag pans or selects, click seeks. Optional snap to zero-crossing so cuts do not click. The overview shows which part is zoomed; the strip follows playback. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-s15'))return;M.setAttribute('data-s15','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}};
var row=M.querySelector('.alwr'),AP=window.__alplay;if(!row||!g('alov')||!AP||!AP.seek)return;
var st=document.createElement('style');st.textContent='#alzm{width:100%;height:100px;background:#141210;border-radius:8px;touch-action:none;display:block;cursor:crosshair}#alzb .row button{min-height:34px;padding:4px 10px;font-size:13px}@media (pointer:coarse){#alm #alzm{height:150px!important}#alzb .row{gap:8px}#alzb .row button{min-height:44px!important;min-width:44px;font-size:15px}#alzb .row label{min-height:44px}#alzb .row input[type=checkbox]{width:22px;height:22px}}';document.head.appendChild(st);
var box=document.createElement('div');box.id='alzb';box.style.marginTop='8px';
box.innerHTML='<canvas id="alzm"></canvas><div class="alrd" id="alzi">Zoom: choose a file first.</div><div class="row"><button type="button" id="alzi1">＋</button><button type="button" id="alzo1">−</button><button type="button" id="alzf">⤢ Fit</button><button type="button" id="alzs">🎯 Selection</button><button type="button" id="alzl">◀</button><button type="button" id="alzr">▶</button><button type="button" id="alzmd">✂ Drag: select</button><label style="margin:0;display:flex;align-items:center;gap:4px"><input type="checkbox" id="alzz"> Snap to zero-crossing</label></div>';
row.insertAdjacentElement('afterend',box);
g('als').step=g('ale').step='0.0005';
var cv=g('alzm'),V={a:0,b:1},mode='sel',PC=null,last='',ptr={},drag=null,pinch0=0,pmid0=.5,lastTap=null;
var dur=function(){var s=S();return s.src?s.src.duration:0};
var sel=function(){var a=+g('als').value/100,b=+g('ale').value/100;return[Math.min(a,b),Math.max(a,b)]};
var cl=function(x,a,b){return Math.max(a,Math.min(b,x))};
function fmt(t){t=Math.max(0,t);var m=Math.floor(t/60),s=t-m*60;return m+':'+(s<10?'0':'')+s.toFixed(s<10&&t<10?3:2)}
function fixView(){var d=dur(),mw=d?Math.min(1,.01/d):1,w=cl(V.b-V.a,mw,1);if(V.a<0)V.a=0;V.b=V.a+w;if(V.b>1){V.b=1;V.a=1-w}}
function pz(rp,rn,k){var w=V.b-V.a,fu=V.a+cl(rp,0,1)*w,nw=cl(w*k,Math.min(1,.01/Math.max(.01,dur())),1);V.a=fu-cl(rn,0,1)*nw;V.b=V.a+nw;fixView();redraw(true)}
function zoomAt(fc,k){var w=V.b-V.a,nw=cl(w*k,Math.min(1,.01/Math.max(.01,dur())),1),r=(fc-V.a)/w;V.a=fc-r*nw;V.b=V.a+nw;fixView();redraw(true)}
function setSel(a,b){var s=S().src,sn=g('alzz').checked;if(sn&&s){a=zc(s,a);b=zc(s,b)}if(b-a<.0005)b=Math.min(1,a+.0005);g('als').value=(a*100).toFixed(4);g('ale').value=(b*100).toFixed(4);['als','ale'].forEach(function(i){g(i).dispatchEvent(new Event('input',{bubbles:true}))})}
function zc(buf,f){var d=buf.getChannelData(0),n=d.length,c=Math.round(f*n),r=Math.round(buf.sampleRate*.005),best=c,bd=1e9;for(var i=Math.max(1,c-r);i<Math.min(n-1,c+r);i++){if((d[i-1]<=0&&d[i]>0)||(d[i-1]>=0&&d[i]<0)){var dd=Math.abs(i-c);if(dd<bd){bd=dd;best=i}}}return best/n}
function peaks(W,H){var s=S().src,key=[s&&s.length,W,H,V.a.toFixed(6),V.b.toFixed(6),S().src===(PC&&PC.s)].join();if(PC&&PC.key===key)return PC.c;var c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d');x.fillStyle='#141210';x.fillRect(0,0,W,H);if(!s){PC={key:key,c:c,s:s};return c}
var n=s.length,a=V.a*n,sp=(V.b-V.a)*n/W,ch=s.numberOfChannels,D=[];for(var k=0;k<ch;k++)D.push(s.getChannelData(k));var top=30,mid=top+(H-top)/2,hh=(H-top)/2-3;x.fillStyle='#ff9a5c';
for(var px=0;px<W;px++){var i0=Math.floor(a+px*sp),i1=Math.max(i0+1,Math.floor(a+(px+1)*sp)),stp=Math.max(1,Math.floor((i1-i0)/120)),mn=1,mx=-1;for(var q=0;q<ch;q++){var d=D[q];for(var i=i0;i<i1&&i<n;i+=stp){var v=d[i];if(v<mn)mn=v;if(v>mx)mx=v}}if(mn>mx){continue}x.fillRect(px,mid-mx*hh,1,Math.max(1,(mx-mn)*hh))}
if(sp<2){x.fillStyle='#fff';var d0=D[0];for(var j=Math.floor(a);j<=Math.ceil(a+W*sp)&&j<n;j++){var xx=(j-a)/sp;x.fillRect(xx-2,mid-d0[j]*hh-2,4,4)}}
PC={key:key,c:c,s:S().src};return c}
function ticks(x,W,H,d){var span=(V.b-V.a)*d,t0=V.a*d,steps=[.001,.002,.005,.01,.02,.05,.1,.2,.5,1,2,5,10,15,30,60,120,300,600,1800,3600],want=span/(W/110),stp=steps[steps.length-1];for(var i=0;i<steps.length;i++)if(steps[i]>=want){stp=steps[i];break}
x.fillStyle='#1d1b17';x.fillRect(0,0,W,28);x.strokeStyle='#4a443a';x.fillStyle='#b9b2a2';x.font='20px monospace';for(var t=Math.ceil(t0/stp)*stp;t<=t0+span;t+=stp){var px=(t-t0)/span*W;x.beginPath();x.moveTo(px,14);x.lineTo(px,H);x.stroke();x.fillText(fmt(t),px+4,20)}}
function redraw(force){var d=dur(),W=cv.width=Math.max(200,(cv.clientWidth||300)*2),H=cv.height=Math.max(200,(cv.clientHeight||100)*2),x=cv.getContext('2d');x.drawImage(peaks(W,H),0,0);var info=g('alzi');if(!d){info.textContent='Zoom: choose a file first.';return}
ticks(x,W,H,d);var t=sel(),fx=function(f){return(f-V.a)/(V.b-V.a)*W};
x.fillStyle='rgba(0,0,0,.55)';var l=fx(t[0]),r=fx(t[1]);if(l>0)x.fillRect(0,28,Math.min(W,l),H-28);if(r<W)x.fillRect(Math.max(0,r),28,W-Math.max(0,r),H-28);
x.fillStyle='#ff7a3d';[l,r].forEach(function(px,i){if(px>=-4&&px<=W+4){x.fillRect(px-2,28,4,H-28);x.fillRect(i?px-14:px,H-26,14,26)}});
var pp=AP.pos?AP.pos():0,px=fx(pp);if(px>=0&&px<=W){x.fillStyle='#fff';x.fillRect(px-1.5,28,3,H-28)}
if(window.__alZoomDraw)window.__alZoomDraw(x,W,H,V,28);var zk=1/(V.b-V.a);info.textContent=fmt(V.a*d)+' – '+fmt(V.b*d)+'  ('+((V.b-V.a)*d).toFixed(3)+' s shown, ×'+(zk<10?zk.toFixed(1):Math.round(zk))+')';
if(force)window.dispatchEvent(new Event('resize'))}
/* overview: show the zoomed window */
var pd=window.__alDraw;window.__alDraw=function(x,W,H){if(pd)pd(x,W,H);if(V.b-V.a<.999&&dur()){x.strokeStyle='#ffaa7f';x.lineWidth=4;x.strokeRect(V.a*W+2,2,Math.max(6,(V.b-V.a)*W-4),H-4);x.lineWidth=1}};
var fx2=function(e){var r=cv.getBoundingClientRect();return V.a+cl((e.clientX-r.left)/Math.max(1,r.width),0,1)*(V.b-V.a)},pxw=function(){return(V.b-V.a)/Math.max(1,cv.getBoundingClientRect().width)};
cv.addEventListener('pointerdown',function(e){if(!dur())return;try{cv.setPointerCapture(e.pointerId)}catch(x){}ptr[e.pointerId]={x:e.clientX,y:e.clientY};var n=Object.keys(ptr).length;if(n===2){var p=Object.keys(ptr).map(function(k){return ptr[k]});pinch0=Math.abs(p[0].x-p[1].x)||1;var r0=cv.getBoundingClientRect();pmid0=((p[0].x+p[1].x)/2-r0.left)/r0.width;drag=null;return}
var f=fx2(e),t=sel(),tol=(e.pointerType==='touch'?30:16)*pxw(),h=Math.abs(f-t[0])<=tol&&Math.abs(f-t[0])<=Math.abs(f-t[1])?0:(Math.abs(f-t[1])<=tol?1:-1);drag={f0:f,x0:e.clientX,a:V.a,b:V.b,h:h,moved:false,pan:mode==='pan'}});
cv.addEventListener('pointermove',function(e){if(!ptr[e.pointerId])return;ptr[e.pointerId]={x:e.clientX,y:e.clientY};var ks=Object.keys(ptr);if(ks.length===2){var p=ks.map(function(k){return ptr[k]}),dd=Math.abs(p[0].x-p[1].x)||1,r=cv.getBoundingClientRect(),mid=((p[0].x+p[1].x)/2-r.left)/r.width,fc=V.a+cl(mid,0,1)*(V.b-V.a);pz(pmid0,mid,pinch0/dd);pmid0=mid;pinch0=dd;return}
if(!drag)return;if(Math.abs(e.clientX-drag.x0)>4)drag.moved=true;if(!drag.moved)return;var f=fx2(e),t=sel();
if(drag.h===0)setSel(Math.min(f,t[1]-.0005),t[1]);else if(drag.h===1)setSel(t[0],Math.max(f,t[0]+.0005));else if(drag.pan){var w=drag.b-drag.a,dx=(e.clientX-drag.x0)*w/Math.max(1,cv.getBoundingClientRect().width);V.a=drag.a-dx;V.b=V.a+w;fixView();redraw(true)}else setSel(Math.min(drag.f0,f),Math.max(drag.f0,f))});
function up(e){delete ptr[e.pointerId];if(drag&&!drag.moved&&Object.keys(ptr).length===0){var nw0=Date.now();if(lastTap&&nw0-lastTap.t<320&&Math.abs(e.clientX-lastTap.x)<30){if(V.b-V.a<.03){V.a=0;V.b=1;redraw(true)}else zoomAt(drag.f0,.4);lastTap=null}else lastTap={t:nw0,x:e.clientX};AP.seek(cl(drag.f0,0,1))}if(Object.keys(ptr).length===0)drag=null;redraw(false)}
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
cv.addEventListener('wheel',function(e){if(!dur())return;e.preventDefault();if(e.shiftKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)){var w=V.b-V.a,dx=(e.deltaX||e.deltaY)/800*w;V.a+=dx;V.b+=dx;fixView();redraw(true)}else zoomAt(fx2(e),e.deltaY>0?1.25:.8)},{passive:false});
g('alzi1').onclick=function(){zoomAt((V.a+V.b)/2,.5)};g('alzo1').onclick=function(){zoomAt((V.a+V.b)/2,2)};
g('alzf').onclick=function(){V.a=0;V.b=1;redraw(true)};
g('alzs').onclick=function(){var t=sel(),w=Math.max(t[1]-t[0],.0001),pad=w*.1;V.a=Math.max(0,t[0]-pad);V.b=Math.min(1,t[1]+pad);fixView();redraw(true)};
g('alzl').onclick=function(){var w=V.b-V.a;V.a-=w*.5;V.b-=w*.5;fixView();redraw(true)};g('alzr').onclick=function(){var w=V.b-V.a;V.a+=w*.5;V.b+=w*.5;fixView();redraw(true)};
g('alzmd').onclick=function(){mode=mode==='sel'?'pan':'sel';this.textContent=mode==='sel'?'✂ Drag: select':'✋ Drag: pan'};
/* follow playback; reset view for a new file */
var lastSrc=null;setInterval(function(){if(M.style.display!=='block')return;var s=S().src;if(s!==lastSrc){lastSrc=s;V.a=0;V.b=1;PC=null}var pp=AP.pos?AP.pos():0;if(AP.on()&&(pp<V.a||pp>V.b)&&V.b-V.a<1){var w=V.b-V.a;V.a=cl(pp-w*.1,0,1-w);V.b=V.a+w;window.dispatchEvent(new Event('resize'))}
var k=[pp.toFixed(4),sel().join(),V.a,V.b,s&&s.length].join();if(k!==last){last=k;redraw(false)}},100);
window.addEventListener('resize',function(){redraw(false)});
var ob=document.getElementById('alb');if(ob)ob.addEventListener('click',function(){setTimeout(function(){redraw(false)},60)});
window.__alZoom={view:function(){return{a:V.a,b:V.b}},set:function(a,b){V.a=a;V.b=b;fixView();redraw(true)}};
redraw(false);
}catch(e){try{console.error('Audio Lab improvement 5',e)}catch(x){}}})();

;
/* ==================== Script 977 id="amiyo-al-s16-edit" ==================== */
/* Audio Lab improvement 6: edit tools for the selected part: delete (cut out and close the gap), crop (keep only it), silence it, duplicate it, reverse it, copy and paste at the playhead, insert silence. Every edit has Undo / Redo (Ctrl+Alt+Z / Ctrl+Alt+Y) and the Delete key cuts the selection. Edits change the working file; press Process afterwards. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-s16'))return;M.setAttribute('data-s16','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}},msg=function(t){g('aln').textContent=t},AP=window.__alplay||{};
var first=M.querySelector('details.alsec');if(!first)return;
var d=document.createElement('details');d.className='alsec';
d.innerHTML='<summary><span>✂ Edit selection (cut, crop, silence…)</span><i></i></summary><div class="alin"><div style="font-size:12px;color:#b9b2a2">Works on the selected part (drag the orange handles). Press Delete to cut it out.</div><div class="row"><button type="button" id="aled1">🗑 Delete (close gap)</button><button type="button" id="aled2">✂ Crop (keep only it)</button><button type="button" id="aled3">🔇 Silence it</button></div><div class="row"><button type="button" id="aled4">⧉ Duplicate</button><button type="button" id="aled5">⇋ Reverse</button><button type="button" id="aled6">📋 Copy</button><button type="button" id="aled7">📌 Paste at playhead</button></div><label>Insert silence (s): <b>1</b></label><input type="range" id="aled8" min="0.1" max="10" step="0.1" value="1"><div class="row"><button type="button" id="aled9">＋ Insert silence at playhead</button></div><div class="row"><button type="button" id="aleu">↶ Undo edit</button><button type="button" id="aler">↷ Redo edit</button><span id="aleh" style="align-self:center;font-size:12px;color:#b9b2a2"></span></div></div>';
first.parentNode.insertBefore(d,first);
var badge=d.querySelector('summary i'),H=[],ix=-1,cur=null,clip=null,busy=false;
function chans(b){var a=[];for(var c=0;c<b.numberOfChannels;c++)a.push(new Float32Array(b.getChannelData(c)));return a}
function wav(ch,sr){var n=ch[0].length,c=ch.length,b=new ArrayBuffer(44+n*c*4),v=new DataView(b),w=function(o,s){for(var i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};w(0,'RIFF');v.setUint32(4,36+n*c*4,true);w(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,3,true);v.setUint16(22,c,true);v.setUint32(24,sr,true);v.setUint32(28,sr*c*4,true);v.setUint16(32,c*4,true);v.setUint16(34,32,true);w(36,'data');v.setUint32(40,n*c*4,true);var o=44;for(var i=0;i<n;i++)for(var k=0;k<c;k++){v.setFloat32(o,ch[k][i],true);o+=4}return new File([b],'edit.wav',{type:'audio/wav'})}
function cat(parts){var n=0;parts.forEach(function(p){n+=p.length});var o=new Float32Array(n),q=0;parts.forEach(function(p){o.set(p,q);q+=p.length});return o}
function ramp(x,i0,i1,up){var n=i1-i0;for(var i=0;i<n;i++){var m=n>1?i/(n-1):1;x[i0+i]*=up?m:1-m}}
function load(f){return new Promise(function(res){var old=S().src,fi=g('alf'),dt=new DataTransfer();dt.items.add(f);fi.files=dt.files;fi.dispatchEvent(new Event('change'));var t=0,iv=setInterval(function(){t++;var s=S().src;if((s&&s!==old)||t>80){clearInterval(iv);res(s&&s!==old)}},100)})}
function ui(){var n=H.length;badge.textContent=ix>0?'● '+ix+' edit'+(ix===1?'':'s'):'';g('aleu').disabled=ix<=0;g('aler').disabled=ix>=n-1;g('aleu').style.opacity=ix<=0?.4:1;g('aler').style.opacity=ix>=n-1?.4:1;g('aleh').textContent=ix>0?ix+' edit'+(ix===1?'':'s')+' applied':''}
function ensure(){var s=S().src;if(!s)return false;if(cur!==s&&!(H.length&&H[ix].src===s)){H=[{f:wav(chans(s),s.sampleRate),src:s}];ix=0}return true}
async function apply(label,fn,keep){if(busy)return;if(!ensure()){msg('Choose a file first.');return}var s=S().src,sr=s.sampleRate,n=s.length,A=Math.floor(Math.min(+g('als').value,+g('ale').value)/100*n),B=Math.floor(Math.max(+g('als').value,+g('ale').value)/100*n),ch=chans(s),pos=Math.round((AP.pos?AP.pos():0)*n);
var r=fn(ch,A,B,pos,sr,n);if(!r){return}busy=true;try{var f=wav(r,sr);H=H.slice(0,ix+1);var ok=await load(f);if(ok){var ns=S().src;H.push({f:f,src:ns});if(H.length>12)H.shift();ix=H.length-1;cur=ns;if(!keep){g('als').value=0;g('ale').value=100;['als','ale'].forEach(function(i){g(i).dispatchEvent(new Event('input',{bubbles:true}))})}msg(label+' — '+(ns.duration).toFixed(2)+' s now. Press ⚡ Process to apply your settings.')}else msg('Could not open the edited audio.')}finally{busy=false;ui()}}
async function jump(k){if(busy)return;if(!ensure())return;var t=ix+k;if(t<0||t>=H.length){msg('Nothing to '+(k<0?'undo':'redo')+'.');return}busy=true;try{var ok=await load(H[t].f);if(ok){var ns=S().src;H[t].src=ns;ix=t;cur=ns;msg((k<0?'Undone':'Redone')+' — '+ns.duration.toFixed(2)+' s.')}}finally{busy=false;ui()}}
var F=Math.round(44100*.003);
var OPS={
del:function(ch,A,B,p,sr,n){if(B-A<2||(A<=0&&B>=n)){msg('Select a part to delete (drag the orange handles).');return null}var f=Math.min(Math.round(sr*.003),A,n-B);return ch.map(function(x){if(f<2)return cat([x.subarray(0,A),x.subarray(B)]);var pre=x.subarray(0,A-f),post=x.subarray(B+f),m=new Float32Array(f);for(var i=0;i<f;i++){var w=i/(f-1);m[i]=x[A-f+i]*(1-w)+x[B+i]*w}return cat([pre,m,post])})},
crop:function(ch,A,B,p,sr,n){if(B-A<2||(A<=0&&B>=n)){msg('Select a part to keep.');return null}return ch.map(function(x){var o=new Float32Array(x.subarray(A,B)),f=Math.min(Math.round(sr*.002),o.length>>1);ramp(o,0,f,true);ramp(o,o.length-f,o.length,false);return o})},
sil:function(ch,A,B,p,sr,n){if(B-A<2){msg('Select a part to silence.');return null}return ch.map(function(x){var o=new Float32Array(x),f=Math.min(Math.round(sr*.003),(B-A)>>1);for(var i=A+f;i<B-f;i++)o[i]=0;ramp(o,A,A+f,false);ramp(o,B-f,B,true);return o})},
dup:function(ch,A,B,p,sr,n){if(B-A<2){msg('Select a part to duplicate.');return null}return ch.map(function(x){return cat([x.subarray(0,B),x.subarray(A,B),x.subarray(B)])})},
rev:function(ch,A,B,p,sr,n){if(B-A<2){msg('Select a part to reverse.');return null}return ch.map(function(x){var o=new Float32Array(x);for(var i=A,j=B-1;i<B;i++,j--)o[i]=x[j];return o})},
pas:function(ch,A,B,p,sr,n){if(!clip){msg('Copy something first.');return null}if(clip.ch.length!==ch.length){msg('The copied audio has a different channel count.');return null}if(clip.sr!==sr){msg('The copied audio has a different sample rate.');return null}return ch.map(function(x,k){var c=new Float32Array(clip.ch[k]),f=Math.min(Math.round(sr*.001),c.length>>1);ramp(c,0,f,true);ramp(c,c.length-f,c.length,false);return cat([x.subarray(0,p),c,x.subarray(p)])})},
ins:function(ch,A,B,p,sr,n){var L=Math.round(+g('aled8').value*sr);return ch.map(function(x){return cat([x.subarray(0,p),new Float32Array(L),x.subarray(p)])})}};
var map={aled1:['Deleted selection','del'],aled2:['Cropped','crop'],aled3:['Silenced selection','sil',1],aled4:['Duplicated selection','dup'],aled5:['Reversed selection','rev',1],aled7:['Pasted at playhead','pas'],aled9:['Inserted silence','ins']};
Object.keys(map).forEach(function(id){g(id).onclick=function(){apply(map[id][0],OPS[map[id][1]],map[id][2])}});
g('aled6').onclick=function(){var s=S().src;if(!s){msg('Choose a file first.');return}var n=s.length,A=Math.floor(Math.min(+g('als').value,+g('ale').value)/100*n),B=Math.floor(Math.max(+g('als').value,+g('ale').value)/100*n);if(B-A<2){msg('Select a part to copy.');return}clip={sr:s.sampleRate,ch:chans(s).map(function(x){return x.slice(A,B)})};msg('Copied '+((B-A)/s.sampleRate).toFixed(2)+' s. Move the playhead and press Paste.')};
g('aled8').addEventListener('input',function(){this.previousElementSibling.querySelector('b').textContent=this.value});
g('aleu').onclick=function(){jump(-1)};g('aler').onclick=function(){jump(1)};
document.addEventListener('keydown',function(e){if(M.style.display!=='block')return;var t=e.target&&e.target.tagName;if(/INPUT|SELECT|TEXTAREA/.test(t))return;if(e.key==='Delete'){e.preventDefault();g('aled1').click()}else if(e.ctrlKey&&e.altKey&&/^z$/i.test(e.key)){e.preventDefault();jump(-1)}else if(e.ctrlKey&&e.altKey&&/^y$/i.test(e.key)){e.preventDefault();jump(1)}});
window.__alEdit={apply:apply,undo:function(){return jump(-1)},redo:function(){return jump(1)},wav:wav};
ui();
}catch(e){try{console.error('Audio Lab improvement 6',e)}catch(x){}}})();

;
/* ==================== Script 978 id="amiyo-al-s17-markers" ==================== */
/* Audio Lab improvement 7: markers and regions. Press M (or the button) to drop a marker at the playhead; auto-markers at pauses; click a marker to jump, rename or delete it; markers show on the waveform and the zoom strip. The audio between markers is a region: select it, or export every region (processed with your current settings) into one .zip. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-s17'))return;M.setAttribute('data-s17','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}},msg=function(t){g('aln').textContent=t},AP=window.__alplay||{};
var first=M.querySelector('details.alsec');if(!first)return;
var d=document.createElement('details');d.className='alsec';
d.innerHTML='<summary><span>📍 Markers &amp; regions</span><i></i></summary><div class="alin"><div class="row"><button type="button" id="almk1">📍 Add at playhead (M)</button><button type="button" id="almk2">🔎 Auto-add at pauses</button><button type="button" id="almk3">🗑 Clear all</button></div><div id="almkl" style="margin-top:8px"></div><div class="row"><button type="button" id="almk4">📦 Export all regions (.zip)</button></div><div id="almkx" style="font-size:12px;color:#b9b2a2;margin-top:6px"></div></div>';
first.parentNode.insertBefore(d,first);
var badge=d.querySelector('summary i'),MK=[],busy=false,css=document.createElement('style');css.textContent='#almkl .mkr{display:flex;gap:6px;align-items:center;margin:4px 0}#almkl .mkr input{flex:1;min-width:0;background:#1d1b17;color:#f1ece2;border:1px solid #3a352c;border-radius:8px;padding:6px;font-size:13px}#almkl .mkr button{min-height:34px;padding:4px 8px;font-size:12px}#almkl .rg{color:#b9b2a2;font-size:12px;margin:2px 0 2px 8px}';document.head.appendChild(css);
var dur=function(){var s=S();return s.src?s.src.duration:0};
function fmt(t){var m=Math.floor(t/60),s=t-m*60;return m+':'+(s<10?'0':'')+s.toFixed(2)}
function setSel(a,b){var D=dur();g('als').value=(a/D*100).toFixed(4);g('ale').value=(b/D*100).toFixed(4);['als','ale'].forEach(function(i){g(i).dispatchEvent(new Event('input',{bubbles:true}))})}
function bounds(){var D=dur(),t=MK.filter(function(m){return m.t>.01&&m.t<D-.01}).map(function(m){return m.t}).sort(function(a,b){return a-b});return[0].concat(t,[D])}
function names(){var D=dur(),L=MK.filter(function(m){return m.t>.01&&m.t<D-.01}).slice().sort(function(a,b){return a.t-b.t});return L}
function render(){var L=g('almkl'),D=dur();MK=MK.filter(function(m){return m.t<=D+.01}).sort(function(a,b){return a.t-b.t});badge.textContent=MK.length?'● '+MK.length:'';if(!MK.length){L.innerHTML='<div style="font-size:12px;color:#b9b2a2">No markers yet. Play or click the waveform, then press M.</div>';window.dispatchEvent(new Event('resize'));return}
var b=bounds(),nm=names(),h='';MK.forEach(function(m,i){h+='<div class="mkr"><button type="button" data-j="'+i+'">'+fmt(m.t)+'</button><input type="text" data-n="'+i+'" value="'+m.n.replace(/"/g,'&quot;')+'" maxlength="40"><button type="button" data-x="'+i+'">🗑</button></div>'});
h+='<div class="rg">Regions:</div>';for(var i=0;i<b.length-1;i++){var rn=i===0?'Start':(nm[i-1]?nm[i-1].n:'Region '+(i+1));h+='<div class="mkr"><span style="width:26px;color:#b9b2a2">'+(i+1)+'</span><span style="flex:1;font-size:13px">'+rn.replace(/</g,'&lt;')+' · '+fmt(b[i])+' → '+fmt(b[i+1])+'</span><button type="button" data-s="'+i+'">Select</button></div>'}
L.innerHTML=h;window.dispatchEvent(new Event('resize'))}
function add(t,n){if(!dur())return;t=Math.max(0,Math.min(dur(),t));if(MK.some(function(m){return Math.abs(m.t-t)<.05}))return;MK.push({t:t,n:n||'Marker '+(MK.length+1)});render()}
g('almkl').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-j')){var m=MK[+b.getAttribute('data-j')];if(AP.seek&&dur())AP.seek(m.t/dur())}else if(b.hasAttribute('data-x')){MK.splice(+b.getAttribute('data-x'),1);render()}else if(b.hasAttribute('data-s')){var i=+b.getAttribute('data-s'),bb=bounds();setSel(bb[i],bb[i+1]);msg('Region '+(i+1)+' selected.')}});
g('almkl').addEventListener('input',function(e){var i=e.target.getAttribute('data-n');if(i!==null&&MK[+i])MK[+i].n=e.target.value});
g('almk1').onclick=function(){if(!dur()){msg('Choose a file first.');return}add((AP.pos?AP.pos():0)*dur())};
g('almk3').onclick=function(){MK=[];render()};
g('almk2').onclick=function(){var s=S().src;if(!s){msg('Choose a file first.');return}var P=window.__alDSP3&&window.__alDSP3.pauses;if(!P){msg('Pause finder not available.');return}var thr=g('alst')?+g('alst').value:-45,mn=g('alsm')?Math.max(.4,+g('alsm').value):.6,L=P(s,thr,mn),n=0;L.forEach(function(z){var t=(z[0]+z[1])/2/s.sampleRate;var c=MK.length;add(t);if(MK.length>c)n++});msg(n?'Added '+n+' marker'+(n===1?'':'s')+' at pauses.':'No pauses found (threshold '+thr+' dB, longer than '+mn+' s).')};
document.addEventListener('keydown',function(e){if(M.style.display!=='block'||e.ctrlKey||e.metaKey||e.altKey)return;var t=e.target&&e.target.tagName;if(/INPUT|SELECT|TEXTAREA/.test(t))return;if(e.key==='m'||e.key==='M'){e.preventDefault();g('almk1').click()}});
/* clear markers when a different file is opened (edits keep them) */
g('alf').addEventListener('change',function(){var f=this.files&&this.files[0];if(f&&f.name!=='edit.wav'){MK=[];setTimeout(render,200)}});
/* drawing: overview + zoom strip */
function drawM(x,W,H,toX,top){var D=dur();if(!D)return;x.fillStyle='#ffaa7f';x.font='18px sans-serif';MK.forEach(function(m){var px=toX(m.t/D);if(px<-4||px>W+4)return;x.fillRect(px-1,top,2,H-top);x.beginPath();x.moveTo(px,top);x.lineTo(px+12,top+7);x.lineTo(px,top+14);x.fill();if(toX===zx)x.fillText(m.n.slice(0,14),px+14,top+14)})}
var zx=function(f){return f*(g('alov')?g('alov').width:1)};
var pd=window.__alDraw;window.__alDraw=function(x,W,H){if(pd)pd(x,W,H);zx=function(f){return f*W};drawM(x,W,H,zx,0)};
window.__alZoomDraw=function(x,W,H,V,top){zx=function(f){return(f-V.a)/(V.b-V.a)*W};drawM(x,W,H,zx,top)};
/* export */
function pcm(buf,bits){var c=buf.numberOfChannels,n=buf.length,sr=buf.sampleRate,B=bits/8,out=new ArrayBuffer(44+n*c*B),v=new DataView(out),w=function(o,s){for(var i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};w(0,'RIFF');v.setUint32(4,36+n*c*B,true);w(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,c,true);v.setUint32(24,sr,true);v.setUint32(28,sr*c*B,true);v.setUint16(32,c*B,true);v.setUint16(34,bits,true);w(36,'data');v.setUint32(40,n*c*B,true);var D=[];for(var k=0;k<c;k++)D.push(buf.getChannelData(k));var o=44;for(var i=0;i<n;i++)for(k=0;k<c;k++){var x=D[k][i];if(bits===16){x=x*32767+(Math.random()-Math.random());x=Math.max(-32768,Math.min(32767,Math.round(x)));v.setInt16(o,x,true);o+=2}else{x=Math.max(-8388608,Math.min(8388607,Math.round(x*8388607)));v.setUint8(o,x&255);v.setUint8(o+1,(x>>8)&255);v.setUint8(o+2,(x>>16)&255);o+=3}}return new Uint8Array(out)}
function crc32(u){var t=crc32.t;if(!t){t=crc32.t=[];for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}}var c2=-1;for(var i=0;i<u.length;i++)c2=t[(c2^u[i])&255]^(c2>>>8);return(c2^-1)>>>0}
function zip(files){var parts=[],cd=[],off=0;files.forEach(function(f){var nm=new TextEncoder().encode(f.name),crc=crc32(f.data),len=f.data.length,h=new DataView(new ArrayBuffer(30));h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(12,0x21,true);h.setUint32(14,crc,true);h.setUint32(18,len,true);h.setUint32(22,len,true);h.setUint16(26,nm.length,true);parts.push(new Uint8Array(h.buffer),nm,f.data);var c=new DataView(new ArrayBuffer(46));c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);c.setUint16(14,0x21,true);c.setUint32(16,crc,true);c.setUint32(20,len,true);c.setUint32(24,len,true);c.setUint16(28,nm.length,true);c.setUint32(42,off,true);cd.push(new Uint8Array(c.buffer),nm);off+=30+nm.length+len});var cs=0;cd.forEach(function(x){cs+=x.length});var e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cs,true);e.setUint32(16,off,true);return new Blob(parts.concat(cd,[new Uint8Array(e.buffer)]),{type:'application/zip'})}
window.__alZip=zip;window.__alPcm=pcm;
function save(blob,name){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},4000)}
function proc(){return new Promise(function(res,rej){var prev=S().out,t=0;g('alr').click();var iv=setInterval(function(){t++;var o=S().out;if(o&&o!==prev){clearInterval(iv);res(o)}else if(t>1200){clearInterval(iv);rej(new Error('Processing took too long'))}},100)})}
g('almk4').onclick=async function(){if(busy)return;var D=dur();if(!D){msg('Choose a file first.');return}var b=bounds();if(b.length<3){msg('Add at least one marker first.');return}busy=true;var sa=g('als').value,se=g('ale').value,nm=names(),files=[],bits=+(g('alx')&&g('alx').value)===16?16:24,x=g('almkx');try{for(var i=0;i<b.length-1;i++){x.textContent='Processing region '+(i+1)+' of '+(b.length-1)+'…';setSel(b[i],b[i+1]);var o=await proc();var rn=(i===0?'start':(nm[i-1]?nm[i-1].n:'region')).replace(/[^\w\- ]+/g,'').trim().slice(0,30)||'region';files.push({name:('0'+(i+1)).slice(-2)+'_'+rn+'.wav',data:pcm(o,bits)})}
save(zip(files),'audio-regions.zip');x.textContent='Exported '+files.length+' regions as audio-regions.zip.'}catch(er){x.textContent='Export failed: '+er.message}finally{g('als').value=sa;g('ale').value=se;['als','ale'].forEach(function(i){g(i).dispatchEvent(new Event('input',{bubbles:true}))});busy=false}};
window.__alMarkers={get:function(){return MK.map(function(m){return{t:m.t,n:m.n}})},set:function(a){MK=(a||[]).map(function(m){return{t:+m.t,n:String(m.n)}});render()},add:add};
render();
}catch(e){try{console.error('Audio Lab improvement 7',e)}catch(x){}}})();

;
/* ==================== Script 979 id="amiyo-al-s18-fades" ==================== */
/* Audio Lab improvement 8: fades with curve shapes. Separate fade-in and fade-out lengths with five curves (linear, equal-power, slow start, fast start, S-curve) and a small graph of the shape. Applied by Process on top of the simple fade slider (leave that at 0). Two buttons also fade the selected part permanently (with Undo from the Edit tools). */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-s18'))return;M.setAttribute('data-s18','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}},msg=function(t){g('aln').textContent=t};
var first=M.querySelector('details.alsec');if(!first)return;
var d=document.createElement('details');d.className='alsec';
d.innerHTML='<summary><span>🌗 Fades &amp; curves</span><i></i></summary><div class="alin"><label>Fade in (s, 0 = off): <b>0</b></label><input type="range" id="alfi" min="0" max="10" step="0.05" value="0"><label>Fade out (s, 0 = off): <b>0</b></label><input type="range" id="alfo" min="0" max="10" step="0.05" value="0"><label>Curve</label><select id="alfc"><option value="lin">Linear</option><option value="cos" selected>Equal power (smooth, natural)</option><option value="slow">Slow start (exponential)</option><option value="fast">Fast start (logarithmic)</option><option value="s">S-curve</option></select><canvas id="alfg" style="height:56px;margin-top:8px"></canvas><div style="font-size:11px;color:#b9b2a2">Left: fade-in shape. Right: fade-out shape. Applied by Process.</div><div class="row"><button type="button" id="alfb1">↗ Fade selection in (permanent)</button><button type="button" id="alfb2">↘ Fade selection out (permanent)</button></div></div>';
first.parentNode.insertBefore(d,first);
var badge=d.querySelector('summary i');
var C={lin:function(m){return m},cos:function(m){return Math.sin(m*Math.PI/2)},slow:function(m){return(Math.exp(3*m)-1)/(Math.exp(3)-1)},fast:function(m){return 1-Math.pow(1-m,3)},s:function(m){return m*m*(3-2*m)}};
function curve(){return C[g('alfc').value]||C.cos}
function graph(){var c=g('alfg'),W=c.width=(c.clientWidth||300)*2,H=c.height=112,x=c.getContext('2d'),f=curve();x.fillStyle='#141210';x.fillRect(0,0,W,H);x.strokeStyle='#3a352c';x.beginPath();x.moveTo(W/2,0);x.lineTo(W/2,H);x.stroke();x.strokeStyle='#ff9a5c';x.lineWidth=3;x.beginPath();for(var i=0;i<=100;i++){var m=i/100,px=m*(W/2-8)+4,py=H-6-f(m)*(H-12);if(i)x.lineTo(px,py);else x.moveTo(px,py)}x.stroke();x.beginPath();for(i=0;i<=100;i++){m=i/100;px=W/2+4+m*(W/2-8);py=H-6-f(1-m)*(H-12);if(i)x.lineTo(px,py);else x.moveTo(px,py)}x.stroke()}
function ui(){['alfi','alfo'].forEach(function(i){g(i).previousElementSibling.querySelector('b').textContent=g(i).value});var n=(+g('alfi').value>0?1:0)+(+g('alfo').value>0?1:0);badge.textContent=n?'● '+n+' active':'';graph()}
d.addEventListener('input',ui);d.addEventListener('change',ui);d.addEventListener('toggle',function(){if(d.open)graph()});
function fade(ch,sr,fi,fo,f){var n=ch[0].length,a=Math.min(n,Math.round(fi*sr)),b=Math.min(n-a,Math.round(fo*sr));ch.forEach(function(x){for(var i=0;i<a;i++)x[i]*=f(a>1?i/(a-1):1);for(i=0;i<b;i++)x[n-1-i]*=f(b>1?i/(b-1):1)})}
var pt=window.__alTP;window.__alTP=async function(r){var o=pt?await pt.apply(this,arguments):r,fi=+g('alfi').value,fo=+g('alfo').value;if(!o||!(fi>0||fo>0))return o;var ch=[];for(var c=0;c<o.numberOfChannels;c++)ch.push(o.getChannelData(c));fade(ch,o.sampleRate,fi,fo,curve());return o};
function sel(btn,fin){var E=window.__alEdit;if(!E){msg('Edit tools not available.');return}E.apply(fin?'Faded selection in':'Faded selection out',function(ch,A,B,p,sr,n){if(B-A<2||(A<=0&&B>=n&&false)){msg('Select a part first (drag the orange handles).');return null}var f=curve(),L=B-A;return ch.map(function(x){var o=new Float32Array(x);for(var i=0;i<L;i++){var m=L>1?i/(L-1):1;o[A+i]*=f(fin?m:1-m)}return o})},true)}
g('alfb1').onclick=function(){sel(this,true)};g('alfb2').onclick=function(){sel(this,false)};
var ps=g('alps');if(ps)ps.addEventListener('change',function(){if(ps.value==='rst')setTimeout(function(){g('alfi').value=0;g('alfo').value=0;g('alfc').value='cos';ui()},50)});
window.__alFade={curves:C};ui();
}catch(e){try{console.error('Audio Lab improvement 8',e)}catch(x){}}})();

;
/* ==================== Script 980 id="amiyo-al-s19-repair" ==================== */
/* Audio Lab improvement 9: repair. Scan finds clipped (flattened) peaks and shows them in red on the waveform and the zoom strip, and reports the DC offset. "Repair clipping" rebuilds the flattened peaks with a smooth curve (and lowers the level a little so they fit); "Remove DC offset" centres the signal. Both change the working file and can be undone from the Edit tools. Run them before the other settings. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-s19'))return;M.setAttribute('data-s19','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}},msg=function(t){g('aln').textContent=t};
var first=M.querySelector('details.alsec');if(!first)return;
var d=document.createElement('details');d.className='alsec';
d.innerHTML='<summary><span>🩹 Repair: clipping &amp; DC offset</span><i></i></summary><div class="alin"><div class="row"><button type="button" id="alrp1">🔎 Scan the file</button><label style="margin:0;display:flex;align-items:center;gap:4px"><input type="checkbox" id="alrp2" checked> Show clipped peaks in red</label></div><div id="alrpi" style="font-size:12px;color:#b9b2a2;margin-top:6px">Scan to see whether the audio is clipped or off-centre.</div><div class="row"><button type="button" id="alrp3">🩹 Repair clipping</button><button type="button" id="alrp4">⚖ Remove DC offset</button></div><div style="font-size:11px;color:#b9b2a2">Repair rebuilds the flat tops of overloaded peaks. It finds digitally flattened tops (several samples at exactly the highest level) and works best on short clips (a few milliseconds). The level is lowered slightly so the rebuilt peaks fit.</div></div>';
first.parentNode.insertBefore(d,first);
var badge=d.querySelector('summary i'),SC=null;
function flat(x,i,j,sg,ext){var c=0;for(var k=i;k<j;k++)if(Math.abs(sg*x[k]-ext)<=2e-4)c++;return c>=3}
function scan(b){var ch=[];for(var c=0;c<b.numberOfChannels;c++)ch.push(b.getChannelData(c));var pk=0,pp=0,pn=0,n=b.length,dc=[];ch.forEach(function(x){var s=0;for(var i=0;i<n;i++){var v=x[i];if(v>pp)pp=v;if(-v>pn)pn=-v;s+=v}dc.push(s/n)});pk=Math.max(pp,pn);var Lp=pp>=.5?pp*.995:9,Ln=pn>=.5?pn*.995:9,runs=[],tot=0;ch.forEach(function(x,c){var i=0;while(i<n){var v=x[i],s=v>0?1:-1,L=s>0?Lp:Ln;if(s*v>=L){var j=i;while(j<n&&s*x[j]>=L)j++;if(j-i>=3&&flat(x,i,j,s,s>0?pp:pn)){runs.push([c,i,j]);tot+=j-i}i=j}else i++}});return{pk:pk,pp:pp,pn:pn,Lp:Lp,Ln:Ln,runs:runs,tot:tot,dc:dc,n:n,sr:b.sampleRate,src:b}}
function report(){var s=S().src;if(!s){msg('Choose a file first.');return}SC=scan(s);var w=SC.runs.length,dcm=Math.max.apply(null,SC.dc.map(Math.abs)),t='Peak '+(20*Math.log10(Math.max(SC.pk,1e-9))).toFixed(1)+' dBFS. ';t+=(SC.pk>=.5&&w)?w+' clipped peak'+(w===1?'':'s')+' found ('+SC.tot+' samples at the ceiling). ':'No clipping found. ';t+='DC offset '+(dcm*100).toFixed(2)+'%'+(dcm>.005?' — worth removing.':' — fine.');g('alrpi').textContent=t;badge.textContent=(SC.pk>=.5&&w)||dcm>.005?'● issues':'';window.dispatchEvent(new Event('resize'))}
g('alrp1').onclick=report;
function marks(x,toX,W,H,top){if(!SC||!g('alrp2').checked||SC.src!==S().src)return;x.fillStyle='rgba(255,60,60,.85)';var m=SC.runs.length>1500?Math.ceil(SC.runs.length/1500):1;for(var k=0;k<SC.runs.length;k+=m){var r=SC.runs[k],a=toX(r[1]/SC.n),b=toX(r[2]/SC.n);if(b<0||a>W)continue;x.fillRect(a,H-10,Math.max(3,b-a),10)}}
var pd=window.__alDraw;window.__alDraw=function(x,W,H){if(pd)pd(x,W,H);marks(x,function(f){return f*W},W,H,0)};
var pz=window.__alZoomDraw;window.__alZoomDraw=function(x,W,H,V,top){if(pz)pz(x,W,H,V,top);marks(x,function(f){return(f-V.a)/(V.b-V.a)*W},W,H,top)};
g('alrp2').addEventListener('change',function(){window.dispatchEvent(new Event('resize'))});
function declip(x,C,i0,i1,maxRun){var Lp=C.Lp,Ln=C.Ln,n=x.length,cnt=0,i=Math.max(2,i0);while(i<Math.min(i1,n-2)){var v0=x[i],s=v0>0?1:-1,L=s>0?Lp:Ln;if(s*v0>=L){var j=i;while(j<n&&s*x[j]>=L)j++;var len=j-i;if(len>=3&&len<=maxRun&&j+1<n&&flat(x,i,j,s,s>0?C.pp:C.pn)){var a=i-1,b=j,p0=x[a],p1=x[b],m0=x[a]-x[a-1],m1=x[b+1]-x[b],D=b-a,cap=Math.max(L*1.7,L+.15);for(var k=a+1;k<b;k++){var t=(k-a)/D,t2=t*t,t3=t2*t,v=(2*t3-3*t2+1)*p0+(t3-2*t2+t)*D*m0+(-2*t3+3*t2)*p1+(t3-t2)*D*m1;x[k]=s*Math.min(cap,Math.max(L,s*v))}cnt++}i=j}else i++}return cnt}
g('alrp3').onclick=function(){var E=window.__alEdit,s=S().src;if(!E||!s){msg('Choose a file first.');return}var sc=scan(s);if(sc.pk<.5||!sc.runs.length){msg('No clipping found — nothing to repair.');return}var tot=0;E.apply('Repaired clipping',function(ch,A,B,p,sr,n){var all=(A<=0&&B>=n)||B-A<2,a=all?0:A,b=all?n:B,maxRun=Math.round(sr*.004)+8;ch.forEach(function(x){tot+=declip(x,sc,a,b,maxRun)});var pk=0;ch.forEach(function(x){for(var i=0;i<n;i++){var v=x[i]<0?-x[i]:x[i];if(v>pk)pk=v}});if(pk>.98){var k=.98/pk;ch.forEach(function(x){for(var i=0;i<n;i++)x[i]*=k})}return ch},true).then(function(){report();msg('Repaired '+tot+' clipped peak'+(tot===1?'':'s')+'. Level lowered slightly to fit.')})};
g('alrp4').onclick=function(){var E=window.__alEdit,s=S().src;if(!E||!s){msg('Choose a file first.');return}var sc=scan(s);if(Math.max.apply(null,sc.dc.map(Math.abs))<.0005){msg('No DC offset to remove.');return}E.apply('Removed DC offset',function(ch,A,B,p,sr,n){ch.forEach(function(x,c){var m=sc.dc[c];for(var i=0;i<n;i++)x[i]-=m});return ch},true).then(function(){report()})};
window.__alRepair={scan:scan,declip:declip};
}catch(e){try{console.error('Audio Lab improvement 9',e)}catch(x){}}})();

;
/* ==================== Script 981 id="amiyo-al-s20-stereo" ==================== */
/* Audio Lab improvement 10: stereo tools. Output mode (swap L/R, left to both, right to both, mid only, side only), balance, separate Mid and Side level, and a stereo analysis: phase correlation, left/right balance, mono-compatibility loss and a scope (Lissajous) picture of the selected part. Applied by Process. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-s20'))return;M.setAttribute('data-s20','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}},msg=function(t){g('aln').textContent=t};
var first=M.querySelector('details.alsec');if(!first)return;
var d=document.createElement('details');d.className='alsec';
d.innerHTML='<summary><span>🎧 Stereo tools &amp; scope</span><i></i></summary><div class="alin"><label>Output channels</label><select id="alssm"><option value="">Normal stereo</option><option value="swap">Swap left and right</option><option value="l2b">Left to both sides</option><option value="r2b">Right to both sides</option><option value="mid">Mid only (what mono sees)</option><option value="side">Side only (the wide part)</option></select><label>Balance (L ← 0 → R): <b>0</b></label><input type="range" id="alssb" min="-100" max="100" step="1" value="0"><label>Mid level (dB): <b>0</b></label><input type="range" id="alssd" min="-12" max="12" step="0.5" value="0"><label>Side level (dB): <b>0</b></label><input type="range" id="alsse" min="-12" max="12" step="0.5" value="0"><div class="row"><button type="button" id="alssa">📡 Analyse selection</button></div><canvas id="alssc" style="height:150px;margin-top:8px"></canvas><div id="alssi" style="font-size:12px;color:#b9b2a2;margin-top:6px">Analyse to see phase correlation and how the audio sounds in mono.</div></div>';
first.parentNode.insertBefore(d,first);
var badge=d.querySelector('summary i');
function ui(){['alssb','alssd','alsse'].forEach(function(i){g(i).previousElementSibling.querySelector('b').textContent=g(i).value});var n=(g('alssm').value?1:0)+(+g('alssb').value?1:0)+(+g('alssd').value?1:0)+(+g('alsse').value?1:0);badge.textContent=n?'● '+n+' active':''}
d.addEventListener('input',ui);d.addEventListener('change',ui);
var lin=function(x){return Math.pow(10,x/20)};
function stereo(r){if(r.numberOfChannels<2)return r;var L=r.getChannelData(0),R=r.getChannelData(1),n=r.length,mode=g('alssm').value,bal=+g('alssb').value/100,gm=lin(+g('alssd').value),gs=lin(+g('alsse').value);if(!mode&&!bal&&gm===1&&gs===1)return r;
var gl=bal>0?Math.cos(bal*Math.PI/2):1,gr=bal<0?Math.cos(-bal*Math.PI/2):1,ms=(gm!==1||gs!==1);
for(var i=0;i<n;i++){var l=L[i],q=R[i];if(ms){var m=(l+q)/2*gm,s=(l-q)/2*gs;l=m+s;q=m-s}
if(mode==='swap'){var t=l;l=q;q=t}else if(mode==='l2b')q=l;else if(mode==='r2b')l=q;else if(mode==='mid'){l=q=(l+q)/2}else if(mode==='side'){l=(l-q)/2;q=l}
L[i]=l*gl;R[i]=q*gr}return r}
var pt=window.__alTP;window.__alTP=async function(r){var o=pt?await pt.apply(this,arguments):r;return o?stereo(o):o};
function analyse(){var s=S().src;if(!s){msg('Choose a file first.');return}var I=g('alssi');if(s.numberOfChannels<2){I.textContent='This file is mono — there is no stereo image to analyse.';return}var n=s.length,a=Math.floor(Math.min(+g('als').value,+g('ale').value)/100*n),b=Math.floor(Math.max(+g('als').value,+g('ale').value)/100*n),L=s.getChannelData(0),R=s.getChannelData(1),sl=0,sr=0,sx=0,sm=0;for(var i=a;i<b;i++){sl+=L[i]*L[i];sr+=R[i]*R[i];sx+=L[i]*R[i];var m=(L[i]+R[i])/2;sm+=m*m}
if(sl+sr<1e-12){I.textContent='This part is silent.';return}var r=sx/Math.sqrt(sl*sr+1e-20),bal=10*Math.log10((sl+1e-20)/(sr+1e-20)),loss=10*Math.log10((sm+1e-20)/((sl+sr)/2+1e-20)),v=r>.6?'Solid and mono-safe.':r>.2?'Wide stereo; mono will lose some body.':r>-.2?'Very wide or two unrelated channels; check in mono.':'Out of phase — it may nearly vanish in mono.';
I.textContent='Phase correlation '+(r>=0?'+':'')+r.toFixed(2)+' · balance '+(bal>=0?'L +':'R +')+Math.abs(bal).toFixed(1)+' dB · in mono the level changes '+(loss>=-.05?'0.0':loss.toFixed(1))+' dB. '+v;
var c=g('alssc'),W=c.width=(c.clientWidth||300)*2,H=c.height=300,x=c.getContext('2d'),cx=W/2,cy=H/2,K=Math.min(W,H)*.46;x.fillStyle='#141210';x.fillRect(0,0,W,H);x.strokeStyle='#3a352c';x.lineWidth=2;x.beginPath();x.moveTo(cx,6);x.lineTo(cx,H-6);x.moveTo(6,cy);x.lineTo(W-6,cy);x.moveTo(cx-K,cy+K);x.lineTo(cx+K,cy-K);x.moveTo(cx-K,cy-K);x.lineTo(cx+K,cy+K);x.stroke();x.fillStyle='#b9b2a2';x.font='20px sans-serif';x.fillText('M',cx+6,22);x.fillText('L',cx-K-4,cy-K-4);x.fillText('R',cx+K-12,cy-K-4);
var pk=0;for(i=a;i<b;i+=Math.max(1,Math.floor((b-a)/20000))){pk=Math.max(pk,Math.abs(L[i]),Math.abs(R[i]))}pk=pk||1;var st=Math.max(1,Math.floor((b-a)/6000));x.fillStyle='rgba(255,154,92,.45)';for(i=a;i<b;i+=st){var X=cx+(L[i]-R[i])/pk*K*.7071*1.4,Y=cy-(L[i]+R[i])/pk*K*.7071*1.4;x.fillRect(X-1.5,Y-1.5,3,3)}}
g('alssa').onclick=analyse;
var ps=g('alps');if(ps)ps.addEventListener('change',function(){if(ps.value==='rst')setTimeout(function(){g('alssm').value='';g('alssb').value=0;g('alssd').value=0;g('alsse').value=0;ui()},50)});
window.__alStereo={analyse:analyse};ui();
}catch(e){try{console.error('Audio Lab improvement 10',e)}catch(x){}}})();

;
/* ==================== Script 982 id="amiyo-al-s21-vocal" ==================== */
/* Audio Lab improvement 11: vocal remover and splitter. Remove vocals (quick phase method, or clean spectral method that keeps bass and drums better), keep only the centre voice, or keep only the bass / only the treble around a crossover frequency. Applied by Process (stereo files for the vocal modes). */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-s21'))return;M.setAttribute('data-s21','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}},msg=function(t){g('aln').textContent=t};
var first=M.querySelector('details.alsec');if(!first)return;
var d=document.createElement('details');d.className='alsec';
d.innerHTML='<summary><span>🎤 Vocal remover &amp; splitter</span><i></i></summary><div class="alin"><label>Mode</label><select id="alvr"><option value="">Off</option><option value="rq">Remove vocals — quick (phase cancel)</option><option value="rs">Remove vocals — clean (spectral, slower)</option><option value="ks">Keep only the centre voice (spectral)</option><option value="bass">Keep only bass (below the frequency)</option><option value="treb">Keep only treble (above the frequency)</option></select><label>Strength (%): <b>100</b></label><input type="range" id="alvs" min="0" max="100" step="5" value="100"><label>Frequency (Hz): <b>150</b></label><input type="range" id="alvf" min="60" max="8000" step="10" value="100"><div id="alvh" style="font-size:12px;color:#b9b2a2;margin-top:6px">Works best on stereo songs where the voice is mixed in the centre. Applied by Process.</div></div>';
first.parentNode.insertBefore(d,first);
var badge=d.querySelector('summary i'),HINT={'':'Works best on stereo songs where the voice is mixed in the centre. Applied by Process.',rq:'Frequency = lowest pitch that is cancelled; the bass below it stays. Fast, but also thins other centred sounds.',rs:'Frequency = bass below it is always kept. Slower: analyses every frequency separately.',ks:'Keeps what is in the centre (voice, dialogue); side instruments are reduced. Slower.',bass:'Keeps only the sound below the frequency.',treb:'Keeps only the sound above the frequency.'};
function ui(){['alvs','alvf'].forEach(function(i){g(i).previousElementSibling.querySelector('b').textContent=g(i).value});var m=g('alvr').value;badge.textContent=m?'● on':'';g('alvh').textContent=HINT[m]||HINT['']}
d.addEventListener('input',ui);d.addEventListener('change',ui);
function lp2(x,fc,sr){var w=2*Math.PI*fc/sr,cs=Math.cos(w),al=Math.sin(w)/(2*.70710678),a0=1+al,b0=(1-cs)/2/a0,b1=(1-cs)/a0,b2=b0,a1=-2*cs/a0,a2=(1-al)/a0,y=new Float32Array(x.length),x1=0,x2=0,y1=0,y2=0;for(var i=0;i<x.length;i++){var v=x[i],o=b0*v+b1*x1+b2*x2-a1*y1-a2*y2;x2=x1;x1=v;y2=y1;y1=o;y[i]=o}return y}
function hp2(x,fc,sr){var w=2*Math.PI*fc/sr,cs=Math.cos(w),al=Math.sin(w)/(2*.70710678),a0=1+al,b0=(1+cs)/2/a0,b1=-(1+cs)/a0,b2=b0,a1=-2*cs/a0,a2=(1-al)/a0,y=new Float32Array(x.length),x1=0,x2=0,y1=0,y2=0;for(var i=0;i<x.length;i++){var v=x[i],o=b0*v+b1*x1+b2*x2-a1*y1-a2*y2;x2=x1;x1=v;y2=y1;y1=o;y[i]=o}return y}
function lp4(x,fc,sr){return lp2(lp2(x,fc,sr),fc,sr)}
function hp4(x,fc,sr){return hp2(hp2(x,fc,sr),fc,sr)}
function fft(re,im){var n=re.length,j=0;for(var i=1;i<n;i++){var b=n>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){var t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t}}for(var len=2;len<=n;len<<=1){var a=-2*Math.PI/len,wr=Math.cos(a),wi=Math.sin(a),h=len>>1;for(var s=0;s<n;s+=len){var cr=1,ci=0;for(var k=0;k<h;k++){var u=s+k,v=u+h,xr=re[v]*cr-im[v]*ci,xi=re[v]*ci+im[v]*cr;re[v]=re[u]-xr;im[v]=im[u]-xi;re[u]+=xr;im[u]+=xi;var t2=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=t2}}}}
function quick(r,s,fc){var L=r.getChannelData(0),R=r.getChannelData(1),sr=r.sampleRate,n=r.length,lL=lp4(L,fc,sr),lR=lp4(R,fc,sr);for(var i=0;i<n;i++){var hL=L[i]-lL[i],hR=R[i]-lR[i],c=(hL+hR)/2*s;L[i]=lL[i]+hL-c;R[i]=lR[i]+hR-c}}
async function spectral(r,mode,s,fc){var N=2048,H=512,n=r.length,L=r.getChannelData(0),R=r.getChannelData(1),sr=r.sampleRate,W=new Float32Array(N);for(var i=0;i<N;i++)W[i]=.5-.5*Math.cos(2*Math.PI*i/N);var oL=new Float32Array(n+2*N),oR=new Float32Array(n+2*N),fr=Math.ceil((n+N)/H),re1=new Float32Array(N),im1=new Float32Array(N),re2=new Float32Array(N),im2=new Float32Array(N),B=N/2+1,kc=Math.round(fc/sr*N),mk=new Float32Array(B);
for(var f=0;f<fr;f++){var o=f*H-N;for(i=0;i<N;i++){var p=o+i,ok=p>=0&&p<n;re1[i]=ok?L[p]*W[i]:0;im1[i]=0;re2[i]=ok?R[p]*W[i]:0;im2[i]=0}fft(re1,im1);fft(re2,im2);
for(var k=0;k<B;k++){var a=re1[k],b=im1[k],c=re2[k],dd=im2[k],pw=a*a+b*b+c*c+dd*dd,sim=pw>1e-18?2*(a*c+b*dd)/pw:0;sim=sim<0?0:sim>1?1:sim;mk[k]=sim*sim}
for(k=0;k<B;k++){var m=(mk[Math.max(0,k-1)]+mk[k]*2+mk[Math.min(B-1,k+1)])/4,gg;if(mode==='rs'){gg=1-s*m;if(k<=kc)gg=1}else gg=1-s*(1-m);re1[k]*=gg;im1[k]*=gg;re2[k]*=gg;im2[k]*=gg;if(k>0&&k<B-1){re1[N-k]*=gg;im1[N-k]*=gg;re2[N-k]*=gg;im2[N-k]*=gg}}
fft(im1,re1);fft(im2,re2);for(i=0;i<N;i++){var q=o+i;if(q>=0&&q<n){oL[q]+=re1[i]/N*W[i]/1.5;oR[q]+=re2[i]/N*W[i]/1.5}}
if(f%80===79){if(window.__alCancel)throw new Error('Cancelled');msg('Separating voice… '+Math.round(f/fr*100)+'%');await new Promise(function(z){setTimeout(z,0)})}}
for(i=0;i<n;i++){L[i]=oL[i];R[i]=oR[i]}}
var pt=window.__alTP;window.__alTP=async function(r){var o=pt?await pt.apply(this,arguments):r,m=g('alvr').value;if(!o||!m)return o;var s=+g('alvs').value/100,fc=+g('alvf').value;
if(m==='bass'||m==='treb'){for(var c=0;c<o.numberOfChannels;c++){var x=o.getChannelData(c),lo=m==='bass'?lp4(x,fc,o.sampleRate):hp4(x,fc,o.sampleRate);for(var i=0;i<x.length;i++)x[i]=x[i]*(1-s)+lo[i]*s}return o}
if(o.numberOfChannels<2){msg('The vocal modes need a stereo file.');return o}
if(m==='rq')quick(o,s,fc);else if(m==='rs'&&window.__alVocal&&window.__alVocal.__s02)await window.__alVocal.spectral(o,m,s,fc);else await spectral(o,m,s,fc);return o};
var ps=g('alps');if(ps)ps.addEventListener('change',function(){if(ps.value==='rst')setTimeout(function(){g('alvr').value='';g('alvs').value=100;g('alvf').value=100;ui()},50)});
window.__alVocal={quick:quick,spectral:spectral};ui();
}catch(e){try{console.error('Audio Lab improvement 11',e)}catch(x){}}})();

;
/* ==================== Script 983 id="amiyo-al-s22-modulation" ==================== */
/* Audio Lab improvement 12: modulation and delay. Chorus, flanger, phaser, auto-pan and a stereo ping-pong delay that can follow the tempo (BPM + note length). Rate, depth, mix and feedback sliders. Applied by Process. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-s22'))return;M.setAttribute('data-s22','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}},msg=function(t){g('aln').textContent=t};
var first=M.querySelector('details.alsec');if(!first)return;
var d=document.createElement('details');d.className='alsec';
d.innerHTML='<summary><span>🌀 Chorus, flanger, phaser &amp; delay</span><i></i></summary><div class="alin"><label>Effect</label><select id="alxe"><option value="">Off</option><option value="cho">Chorus (thicken)</option><option value="fla">Flanger (jet sweep)</option><option value="pha">Phaser (swirl)</option><option value="pan">Auto-pan (left ↔ right)</option><option value="dly">Ping-pong delay (tempo)</option></select><label>Rate (Hz): <b>0.8</b></label><input type="range" id="alxr" min="0.05" max="8" step="0.05" value="0.8"><label>Depth (%): <b>50</b></label><input type="range" id="alxd" min="0" max="100" step="1" value="50"><label>Mix (%): <b>50</b></label><input type="range" id="alxm" min="0" max="100" step="1" value="50"><label>Feedback (%): <b>30</b></label><input type="range" id="alxf" min="0" max="90" step="1" value="30"><label>Delay tempo (BPM)</label><input type="number" id="alxb" min="40" max="240" step="1" value="120" style="width:100%;background:#1d1b17;color:#f1ece2;border:1px solid #3a352c;border-radius:8px;padding:8px;font-size:14px"><label>Delay note length</label><select id="alxn"><option value="1">1/4 note</option><option value="0.5" selected>1/8 note</option><option value="0.75">Dotted 1/8</option><option value="0.25">1/16 note</option><option value="2">1/2 note</option></select><div style="font-size:11px;color:#b9b2a2;margin-top:6px">BPM and note length are used by the delay only. Applied by Process.</div></div>';
first.parentNode.insertBefore(d,first);
var badge=d.querySelector('summary i');
function ui(){['alxr','alxd','alxm','alxf'].forEach(function(i){g(i).previousElementSibling.querySelector('b').textContent=g(i).value});badge.textContent=g('alxe').value?'● on':''}
d.addEventListener('input',ui);d.addEventListener('change',ui);
function rd(buf,pos,N){var i=Math.floor(pos),f=pos-i;var a=buf[((i%N)+N)%N],b=buf[(((i+1)%N)+N)%N];return a+(b-a)*f}
function modfx(r,type,P){var sr=r.sampleRate,n=r.length,C=r.numberOfChannels;
if(type==='dly'){var D=Math.max(1,Math.round(60/P.bpm*P.note*sr)),N=D+2,bl=new Float32Array(n+D+2),br=new Float32Array(n+D+2),L=r.getChannelData(0),R=C>1?r.getChannelData(1):L,mix=P.mix,fb=P.fb;for(var i=0;i<n;i++){var wl,wr;if(C>1){wl=i>=D?br[i-D]:0;wr=i>=D?bl[i-D]:0;bl[i]=L[i]+fb*wl;br[i]=R[i]+fb*wr}else{wl=wr=i>=D?bl[i-D]:0;bl[i]=L[i]+fb*wl}L[i]=L[i]+mix*wl;if(C>1)R[i]=R[i]+mix*wr}return}
for(var c=0;c<C;c++){var x=r.getChannelData(c),y=new Float32Array(n),ph=0,off=c?.25:0,inc=P.rate/sr;
if(type==='cho'){var Nb=Math.ceil(sr*.06),buf=new Float32Array(Nb),w=0,dep=P.depth*sr*.007,base=sr*.02;for(i=0;i<n;i++){buf[w]=x[i];var l1=Math.sin(2*Math.PI*(ph+off)),l2=Math.sin(2*Math.PI*(ph+off+.33));var v1=rd(buf,w-(base+dep*l1),Nb),v2=rd(buf,w-(base*1.25+dep*l2),Nb);y[i]=(1-P.mix)*x[i]+P.mix*(x[i]+v1+v2)/3;w=(w+1)%Nb;ph+=inc}}
else if(type==='fla'){var Nf=Math.ceil(sr*.02),bf=new Float32Array(Nf),wf=0,fy=0,dp=P.depth*sr*.003,bs=sr*.0035;for(i=0;i<n;i++){var dl=bs+dp*Math.sin(2*Math.PI*(ph+off));var v=rd(bf,wf-dl,Nf);bf[wf]=x[i]+P.fb*v;y[i]=(1-P.mix)*x[i]+P.mix*(x[i]+v)/2;wf=(wf+1)%Nf;ph+=inc}}
else if(type==='pha'){var z=[0,0,0,0],xp=[0,0,0,0],yp=[0,0,0,0],last=0;for(i=0;i<n;i++){var lf=.5+.5*Math.sin(2*Math.PI*(ph+off)),fcn=300*Math.pow(10,lf*P.depth),tn=Math.tan(Math.PI*Math.min(fcn,sr*.45)/sr),a=(tn-1)/(tn+1),s=x[i]+P.fb*last;for(var k=0;k<4;k++){var o=-a*s+xp[k]+a*yp[k];xp[k]=s;yp[k]=o;s=o}last=s;y[i]=(1-P.mix)*x[i]+P.mix*(x[i]+s)/2;ph+=inc}}
else if(type==='pan'){for(i=0;i<n;i++){var p=Math.sin(2*Math.PI*ph)*P.depth,ang=(p+1)*Math.PI/4,gn=c?Math.sin(ang):Math.cos(ang);gn*=Math.SQRT2;y[i]=x[i]*((1-P.mix)+P.mix*gn);ph+=inc}}
x.set(y)}}
var pt=window.__alTP;window.__alTP=async function(r){var o=pt?await pt.apply(this,arguments):r,t=g('alxe').value;if(!o||!t)return o;var P={rate:+g('alxr').value,depth:+g('alxd').value/100,mix:+g('alxm').value/100,fb:+g('alxf').value/100,bpm:Math.max(40,Math.min(240,+g('alxb').value||120)),note:+g('alxn').value};if(t==='pha')P.depth=.4+P.depth*1.3;modfx(o,t,P);return o};
var ps=g('alps');if(ps)ps.addEventListener('change',function(){if(ps.value==='rst')setTimeout(function(){g('alxe').value='';g('alxr').value=.8;g('alxd').value=50;g('alxm').value=50;g('alxf').value=30;ui()},50)});
window.__alMod={fx:modfx};ui();
}catch(e){try{console.error('Audio Lab improvement 12',e)}catch(x){}}})();

;
/* ==================== Script 984 id="amiyo-al-s13-reverb" ==================== */
/* Audio Lab improvement 13: real reverb. Room, Hall, Plate, Cathedral and Cave types built from a generated stereo impulse response (early reflections + dense decaying tail, darker over time). Decay, pre-delay, damping, width and wet/dry mix; the tail can be kept so it is not cut off. Applied by Process. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-n13'))return;M.setAttribute('data-n13','1');
var g=function(i){return M.querySelector('#'+i)};
var first=M.querySelector('details.alsec');if(!first)return;
var T={room:[.7,12,45,80],hall:[2.4,25,60,100],plate:[1.8,5,25,100],cath:[5.5,45,70,100],cave:[3.5,30,85,90]};
var d=document.createElement('details');d.className='alsec';
d.innerHTML='<summary><span>Reverb</span><i></i></summary><div class="alin"><label>Type</label><select id="alrt"><option value="">Off</option><option value="room">Room (small, natural)</option><option value="hall">Hall (concert)</option><option value="plate">Plate (bright, smooth)</option><option value="cath">Cathedral (huge)</option><option value="cave">Cave (dark, long)</option></select>'
+'<label>Decay (s): <b>1.5</b></label><input type="range" id="nrvd" min="0.2" max="8" step="0.1" value="1.5">'
+'<label>Pre-delay (ms): <b>15</b></label><input type="range" id="nrvp" min="0" max="200" value="15">'
+'<label>Damping (% dark): <b>50</b></label><input type="range" id="alrk" min="0" max="100" value="50">'
+'<label>Stereo width (%): <b>100</b></label><input type="range" id="alrw" min="0" max="100" value="100">'
+'<label>Wet mix (%): <b>25</b></label><input type="range" id="alrm" min="0" max="100" value="25">'
+'<label style="margin:6px 0"><input type="checkbox" id="alrt2" checked> Keep the reverb tail (makes the file longer)</label></div>';
first.parentNode.insertBefore(d,first);
var badge=d.querySelector('summary i');
function ui(){['nrvd','nrvp','alrk','alrw','alrm'].forEach(function(i){var b=g(i).previousElementSibling.querySelector('b');if(b)b.textContent=g(i).value});badge.textContent=g('alrt').value?'on':''}
d.addEventListener('input',ui);
g('alrt').addEventListener('change',function(){var t=T[this.value];if(!t)return;g('nrvd').value=t[0];g('nrvp').value=t[1];g('alrk').value=t[2];g('alrw').value=t[3];ui()});
function makeIR(sr,P){var len=Math.max(64,Math.floor(P.decay*sr)),pd=Math.floor(P.pre/1000*sr),tot=len+pd,ir=[new Float32Array(tot),new Float32Array(tot)],seed=12345;
function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/2147483648-1}
var a=1-P.damp*.93;
for(var c=0;c<2;c++){var o=ir[c],lp=0,sd=seed+c*777;seed=sd>>>0;
for(var i=0;i<len;i++){var t=i/sr,env=Math.exp(-6.9*t/P.decay),n=rnd();var cut=a*(1-.6*P.damp*Math.min(1,t/P.decay));lp+=(n-lp)*Math.max(.02,cut);var ramp=Math.min(1,i/(sr*.004));o[pd+i]=lp*env*ramp}
for(var e=0;e<12;e++){var pos=pd+Math.floor((.004+.05*Math.pow(rnd()*.5+.5,1.5)*Math.min(1,P.decay/2))*sr);if(pos<tot)o[pos]+=(rnd()*.5+.5)*(rnd()>0?1:-1)*.9*Math.exp(-3*(pos-pd)/sr/P.decay)}}
var w=P.width,L=ir[0],R=ir[1];for(var k=0;k<tot;k++){var m=(L[k]+R[k])/2,s=(L[k]-R[k])/2*w;L[k]=m+s;R[k]=m-s}
return ir}
async function reverb(r,P){var sr=r.sampleRate,C=r.numberOfChannels,ir=makeIR(sr,P),extra=P.tail?Math.floor((P.decay*.9+P.pre/1000)*sr):0,n=r.length+extra;
var oc=new OfflineAudioContext(C,n,sr),src=oc.createBufferSource(),cv=oc.createConvolver(),dry=oc.createGain(),wet=oc.createGain(),ib=oc.createBuffer(2,ir[0].length,sr);
ib.copyToChannel(ir[0],0);ib.copyToChannel(ir[1],1);cv.normalize=true;cv.buffer=ib;
var sb=oc.createBuffer(C,r.length,sr);for(var c=0;c<C;c++)sb.copyToChannel(r.getChannelData(c),c);src.buffer=sb;
dry.gain.value=1-P.mix*.5;wet.gain.value=P.mix*1.6;src.connect(dry);dry.connect(oc.destination);src.connect(cv);cv.connect(wet);wet.connect(oc.destination);src.start();
return await oc.startRendering()}
var pt=window.__alTP;window.__alTP=async function(r){var o=pt?await pt.apply(this,arguments):r,t=g('alrt').value;if(!o||!t)return o;
var P={decay:+g('nrvd').value,pre:+g('nrvp').value,damp:+g('alrk').value/100,width:+g('alrw').value/100,mix:+g('alrm').value/100,tail:g('alrt2').checked};
try{return await reverb(o,P)}catch(e){var n=g('aln');if(n)n.textContent='Reverb failed: '+(e&&e.message);return o}};
var ps=g('alps');if(ps)ps.addEventListener('change',function(){if(ps.value==='rst')setTimeout(function(){g('alrt').value='';g('nrvd').value=1.5;g('nrvp').value=15;g('alrk').value=50;g('alrw').value=100;g('alrm').value=25;g('alrt2').checked=true;ui()},50)});
window.__alReverb={make:makeIR,run:reverb};ui();
}catch(e){try{console.error('Audio Lab improvement 13',e)}catch(x){}}})();

;
/* ==================== Script 985 id="amiyo-al-s14-saturation" ==================== */
/* Audio Lab improvement 14: saturation and exciter. Soft clip, Tube, Tape and Hard drive types (2x oversampled, level-matched so it adds colour, not just volume), a Bass enhance that adds harmonics to the lows so they are heard on small speakers, and an Air exciter for sparkle. Applied by Process. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-n14'))return;M.setAttribute('data-n14','1');
var g=function(i){return M.querySelector('#'+i)};
var first=M.querySelector('details.alsec');if(!first)return;
var d=document.createElement('details');d.className='alsec';
d.innerHTML='<summary><span>Saturation &amp; exciter</span><i></i></summary><div class="alin"><label>Drive type</label><select id="alsy"><option value="">Off</option><option value="soft">Soft clip (warm)</option><option value="tube">Tube (even harmonics)</option><option value="tape">Tape (smooth, rounded highs)</option><option value="hard">Hard (aggressive)</option></select>'
+'<label>Drive (dB): <b>6</b></label><input type="range" id="nsad" min="0" max="30" step="0.5" value="6">'
+'<label>Drive mix (%): <b>100</b></label><input type="range" id="nsam" min="0" max="100" value="100">'
+'<label>Bass enhance (%): <b>0</b></label><input type="range" id="alsb" min="0" max="100" value="0">'
+'<label>Air exciter (%): <b>0</b></label><input type="range" id="alse" min="0" max="100" value="0"></div>';
first.parentNode.insertBefore(d,first);
var badge=d.querySelector('summary i');
function ui(){['nsad','nsam','alsb','alse'].forEach(function(i){var b=g(i).previousElementSibling.querySelector('b');if(b)b.textContent=g(i).value});badge.textContent=(g('alsy').value||+g('alsb').value||+g('alse').value)?'on':''}
d.addEventListener('input',ui);d.addEventListener('change',ui);
function shape(x,t){switch(t){case'tube':return x>=0?Math.tanh(x):Math.tanh(x*.65)*1.3;case'tape':return Math.tanh(x)*(1-.12*x*x/(1+x*x));case'hard':return x>1?1:x<-1?-1:x;default:return Math.tanh(x)}}
function rms(a){var s=0;for(var i=0;i<a.length;i++)s+=a[i]*a[i];return Math.sqrt(s/Math.max(1,a.length))}
function lp(x,fc,sr){var a=1-Math.exp(-2*Math.PI*fc/sr),y=new Float32Array(x.length),s=0;for(var i=0;i<x.length;i++){s+=(x[i]-s)*a;y[i]=s}return y}
function hp(x,fc,sr){var l=lp(x,fc,sr),y=new Float32Array(x.length);for(var i=0;i<x.length;i++)y[i]=x[i]-l[i];return y}
function drive(x,t,k){var n=x.length,y=new Float32Array(n),p=x[0]||0,x1=0,y1=0;
for(var i=0;i<n;i++){var c=x[i],m=(p+c)/2,v=(shape(p*k,t)+shape(m*k,t))/2;p=c;var o=(shape(m*k,t)+shape(c*k,t))/2;var w=(v+o)/2;y[i]=w-x1+.995*y1;x1=w;y1=y[i]}
var rb=rms(x),ra=rms(y);if(ra>1e-9&&rb>1e-9){var m2=rb/ra;for(i=0;i<n;i++)y[i]*=m2}return y}
function sat(r,P){var sr=r.sampleRate;for(var c=0;c<r.numberOfChannels;c++){var x=r.getChannelData(c),orig=new Float32Array(x),res=new Float32Array(x);
if(P.type){var w=drive(orig,P.type,Math.pow(10,P.drive/20));if(P.type==='tape')w=lp(w,14000,sr);for(var i=0;i<res.length;i++)res[i]=orig[i]*(1-P.mix)+w[i]*P.mix}
if(P.bass>0){var lo=lp(lp(orig,110,sr),110,sr),h=drive(lo,'soft',5),hh=hp(hp(h,90,sr),90,sr);for(i=0;i<res.length;i++)res[i]+=hh[i]*P.bass*.9}
if(P.air>0){var hi=hp(hp(orig,5000,sr),5000,sr),ha=drive(hi,'tube',7),hb=hp(ha,5500,sr);for(i=0;i<res.length;i++)res[i]+=hb[i]*P.air*.6}
x.set(res)}}
var pt=window.__alTP;window.__alTP=async function(r){var o=pt?await pt.apply(this,arguments):r;if(!o)return o;
var P={type:g('alsy').value,drive:+g('nsad').value,mix:+g('nsam').value/100,bass:+g('alsb').value/100,air:+g('alse').value/100};
if(!P.type&&!P.bass&&!P.air)return o;sat(o,P);return o};
var ps=g('alps');if(ps)ps.addEventListener('change',function(){if(ps.value==='rst')setTimeout(function(){g('alsy').value='';g('nsad').value=6;g('nsam').value=100;g('alsb').value=0;g('alse').value=0;ui()},50)});
window.__alSat={run:sat};ui();
}catch(e){try{console.error('Audio Lab improvement 14',e)}catch(x){}}})();

;
/* ==================== Script 986 id="amiyo-al-s15-multiband" ==================== */
/* Audio Lab improvement 15: 3-band compressor. The sound is split into low, mid and high with Linkwitz-Riley crossovers (they add back up flat), each band has its own threshold, ratio and make-up gain, with shared attack, release and dry/wet mix. Stereo is linked so the image does not shift. Three presets, and after Process it shows how much each band was reduced. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-n15'))return;M.setAttribute('data-n15','1');
var g=function(i){return M.querySelector('#'+i)};
var first=M.querySelector('details.alsec');if(!first)return;
var PR={voice:[200,3500,-30,3,2,-26,2.5,2,-28,3,1],music:[120,4000,-22,2,1,-20,2,1,-22,2,1],bcast:[150,3000,-34,4,3,-30,3.5,2,-32,4,3]};
var ids=['alcl','alch','nmt1','alr1','alg1','nmt2','alr2','alg2','nmt3','alr3','alg3'];
var d=document.createElement('details');d.className='alsec';
function sl(i,l,mn,mx,st,v){return'<label>'+l+': <b>'+v+'</b></label><input type="range" id="'+i+'" min="'+mn+'" max="'+mx+'" step="'+st+'" value="'+v+'">'}
d.innerHTML='<summary><span>Multiband compressor</span><i></i></summary><div class="alin"><label>Mode</label><select id="nmbm"><option value="">Off</option><option value="voice">Voice (smooth and even)</option><option value="music">Music (glue)</option><option value="bcast">Broadcast (loud and tight)</option><option value="own">My own settings</option></select>'
+sl('alcl','Low / mid crossover (Hz)',60,500,5,200)+sl('alch','Mid / high crossover (Hz)',1500,8000,50,3500)
+sl('nmt1','Low band threshold (dB)',-60,0,1,-30)+sl('alr1','Low band ratio',1,10,.5,3)+sl('alg1','Low band make-up (dB)',0,12,.5,2)
+sl('nmt2','Mid band threshold (dB)',-60,0,1,-26)+sl('alr2','Mid band ratio',1,10,.5,2.5)+sl('alg2','Mid band make-up (dB)',0,12,.5,2)
+sl('nmt3','High band threshold (dB)',-60,0,1,-28)+sl('alr3','High band ratio',1,10,.5,3)+sl('alg3','High band make-up (dB)',0,12,.5,1)
+sl('alca','Attack (ms)',1,100,1,10)+sl('nmbr','Release (ms)',20,600,5,120)+sl('alcx','Dry / wet mix (%)',0,100,1,100)
+'<div id="alcg" style="font-size:12px;color:#b9b2a2;margin-top:4px"></div></div>';
first.parentNode.insertBefore(d,first);
var badge=d.querySelector('summary i');
function ui(){d.querySelectorAll('input[type=range]').forEach(function(e){var b=e.previousElementSibling.querySelector('b');if(b)b.textContent=e.value});badge.textContent=g('nmbm').value?'on':''}
d.addEventListener('input',function(e){if(e.target.type==='range'&&g('nmbm').value&&g('nmbm').value!=='own'&&e.target.id!=='alca'&&e.target.id!=='nmbr'&&e.target.id!=='alcx')g('nmbm').value='own';ui()});
g('nmbm').addEventListener('change',function(){var p=PR[this.value];if(p)ids.forEach(function(k,j){g(k).value=p[j]});ui()});
function bq(t,f,sr){var w=2*Math.PI*f/sr,c=Math.cos(w),a=Math.sin(w)/1.4142,a0=1+a,b0,b1;if(t==='lp'){b0=(1-c)/2;b1=1-c}else{b0=(1+c)/2;b1=-(1+c)}return{b0:b0/a0,b1:b1/a0,b2:b0/a0,a1:-2*c/a0,a2:(1-a)/a0}}
function run(x,k){var n=x.length,y=new Float32Array(n),x1=0,x2=0,y1=0,y2=0;for(var i=0;i<n;i++){var v=x[i],o=k.b0*v+k.b1*x1+k.b2*x2-k.a1*y1-k.a2*y2;x2=x1;x1=v;y2=y1;y1=o;y[i]=o}return y}
function lr(x,t,f,sr){var k=bq(t,f,sr);return run(run(x,k),k)}
function split(x,f1,f2,sr){var lo=lr(x,'lp',f1,sr),rest=new Float32Array(x.length);var r0=lr(x,'hp',f1,sr);var mid=lr(r0,'lp',f2,sr),hi=lr(r0,'hp',f2,sr);var l2=lr(lo,'lp',f2,sr),l3=lr(lo,'hp',f2,sr);for(var i=0;i<lo.length;i++)lo[i]=l2[i]+l3[i];return[lo,mid,hi]}
function comp(r,P){var sr=r.sampleRate,C=r.numberOfChannels,n=r.length,B=[];for(var c=0;c<C;c++)B.push(split(r.getChannelData(c),P.f1,P.f2,sr));
var at=1-Math.exp(-1/(P.atk*.001*sr)),rl=1-Math.exp(-1/(P.rel*.001*sr)),mg=[0,0,0],out=[];
for(c=0;c<C;c++)out.push(new Float32Array(n));
for(var b=0;b<3;b++){var env=0,th=P.t[b],ra=P.r[b],mk=Math.pow(10,P.g[b]/20);
for(var i=0;i<n;i++){var a=0;for(c=0;c<C;c++){var v=B[c][b][i];v=v<0?-v:v;if(v>a)a=v}env+=(a-env)*(a>env?at:rl);var db=env>1e-6?20*Math.log10(env):-120,ov=db-th,red=0;
if(ov>3)red=ov*(1-1/ra);else if(ov>-3)red=(ov+3)*(ov+3)/12*(1-1/ra);var gn=Math.pow(10,-red/20);if(red>mg[b])mg[b]=red;gn*=mk;for(c=0;c<C;c++)out[c][i]+=B[c][b][i]*gn}}
for(c=0;c<C;c++){var x=r.getChannelData(c),o=out[c];for(i=0;i<n;i++)x[i]=x[i]*(1-P.mix)+o[i]*P.mix}
return mg}
var pt=window.__alTP;window.__alTP=async function(r){var o=pt?await pt.apply(this,arguments):r;if(!o||!g('nmbm').value)return o;
var P={f1:+g('alcl').value,f2:+g('alch').value,t:[+g('nmt1').value,+g('nmt2').value,+g('nmt3').value],r:[+g('alr1').value,+g('alr2').value,+g('alr3').value],g:[+g('alg1').value,+g('alg2').value,+g('alg3').value],atk:+g('alca').value,rel:+g('nmbr').value,mix:+g('alcx').value/100};
if(P.f2<=P.f1*2)P.f2=P.f1*2;await new Promise(function(z){setTimeout(z,0)});var mg=comp(o,P);
g('alcg').textContent='Most reduction: low '+mg[0].toFixed(1)+' dB, mid '+mg[1].toFixed(1)+' dB, high '+mg[2].toFixed(1)+' dB';return o};
var ps=g('alps');if(ps)ps.addEventListener('change',function(){if(ps.value==='rst')setTimeout(function(){g('nmbm').value='';var p=PR.voice;ids.forEach(function(k,j){g(k).value=p[j]});g('alca').value=10;g('nmbr').value=120;g('alcx').value=100;g('alcg').textContent='';ui()},50)});
window.__alMB={run:comp};ui();
}catch(e){try{console.error('Audio Lab improvement 15',e)}catch(x){}}})();

;
/* ==================== Script 987 id="amiyo-al-s16-deplosive-breath" ==================== */
/* Audio Lab improvement 16: de-plosive and breath reducer. De-plosive finds short low-frequency thumps ("p", "b" puffs on the mic) by comparing the lows with their own slow average, and turns down only the lows for that moment, so the voice keeps its body. Breath reducer finds quiet, noise-like stretches of 80 ms to 1.3 s between words and lowers them by the amount you choose (not removing them, which sounds unnatural). After Process it reports how many were treated. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-n16'))return;M.setAttribute('data-n16','1');
var g=function(i){return M.querySelector('#'+i)};
var first=M.querySelector('details.alsec');if(!first)return;
var d=document.createElement('details');d.className='alsec';
function sl(i,l,mn,mx,st,v){return'<label>'+l+': <b>'+v+'</b></label><input type="range" id="'+i+'" min="'+mn+'" max="'+mx+'" step="'+st+'" value="'+v+'">'}
d.innerHTML='<summary><span>De-plosive &amp; breath</span><i></i></summary><div class="alin">'
+sl('aldps','De-plosive strength (%, 0 = off)',0,100,1,0)+sl('aldpv','De-plosive sensitivity (1-10)',1,10,1,5)
+sl('albrd','Breath reduction (dB, 0 = off)',0,30,1,0)+sl('albrv','Breath sensitivity (1-10)',1,10,1,5)
+'<div id="aldpg" style="font-size:12px;color:#b9b2a2;margin-top:4px"></div></div>';
first.parentNode.insertBefore(d,first);
var badge=d.querySelector('summary i');
function ui(){d.querySelectorAll('input[type=range]').forEach(function(e){var b=e.previousElementSibling.querySelector('b');if(b)b.textContent=e.value});badge.textContent=(+g('aldps').value||+g('albrd').value)?'on':''}
d.addEventListener('input',ui);
function lp2(x,fc,sr){var a=1-Math.exp(-2*Math.PI*fc/sr),y=new Float32Array(x.length),s=0,t=0;for(var i=0;i<x.length;i++){s+=(x[i]-s)*a;t+=(s-t)*a;y[i]=t}return y}
function deplosive(r,str,sens){var sr=r.sampleRate,thr=4-sens*.3,fl=Math.max(.03,1-str),ae=1-Math.exp(-1/(.006*sr)),ab=1-Math.exp(-1/(.25*sr)),ga=1-Math.exp(-1/(.002*sr)),gr=1-Math.exp(-1/(.03*sr)),hits=0;
for(var c=0;c<r.numberOfChannels;c++){var x=r.getChannelData(c),lf=lp2(x,140,sr),n=x.length,m=0;for(var i=0;i<n;i+=16)m+=Math.abs(lf[i]);m/=Math.ceil(n/16);
var e=m,base=Math.max(m,1e-5),gs=1,was=false;
for(i=0;i<n;i++){var a=lf[i]<0?-lf[i]:lf[i];e+=(a-e)*ae;base+=(Math.min(e,base*1.4+1e-5)-base)*ab;var ratio=e/(base*thr),tg=ratio>1?Math.max(fl,1/ratio):1;gs+=(tg-gs)*(tg<gs?ga:gr);
if(gs<.7&&!was){hits++;was=true}else if(gs>.9)was=false;x[i]=x[i]-lf[i]*(1-gs)}}
return Math.round(hits/r.numberOfChannels)}
function pct(a,p){var s=Array.prototype.slice.call(a).sort(function(u,v){return u-v});return s[Math.min(s.length-1,Math.floor(s.length*p))]}
function breaths(r,red,sens){var sr=r.sampleRate,C=r.numberOfChannels,n=r.length,H=Math.round(.01*sr),F=Math.floor(n/H);if(F<20)return 0;
var db=new Float32Array(F),zc=new Float32Array(F),ch=[];for(var c=0;c<C;c++)ch.push(r.getChannelData(c));
for(var f=0;f<F;f++){var s=0,z=0,pv=0,o=f*H;for(var i=0;i<H;i++){var v=0;for(c=0;c<C;c++)v+=ch[c][o+i];v/=C;s+=v*v;if((v>=0)!==(pv>=0))z++;pv=v}db[f]=10*Math.log10(s/H+1e-12);zc[f]=z/H}
var ref=pct(db,.9),fl=pct(db,.1),zt=.22-.015*sens,isB=new Uint8Array(F);
for(f=0;f<F;f++)isB[f]=(db[f]<ref-12&&db[f]>fl+6&&zc[f]>zt)?1:0;
var gf=new Float32Array(F),cnt=0;for(f=0;f<F;){if(!isB[f]){f++;continue}var st=f;while(f<F&&isB[f])f++;if(f-st>=8&&f-st<=130){cnt++;for(var k=st;k<f;k++)gf[k]=red}}
var sm=new Float32Array(F);for(f=0;f<F;f++){var t=0,q=0;for(k=-2;k<=2;k++){var j=f+k;if(j>=0&&j<F){t+=gf[j];q++}}sm[f]=t/q}
for(c=0;c<C;c++){var x=ch[c];for(f=0;f<F-1;f++){var g0=Math.pow(10,-sm[f]/20),g1=Math.pow(10,-sm[f+1]/20);if(g0===1&&g1===1)continue;for(i=0;i<H;i++)x[f*H+i]*=g0+(g1-g0)*i/H}}
return cnt}
var pt=window.__alTP;window.__alTP=async function(r){var o=pt?await pt.apply(this,arguments):r;if(!o)return o;var ps=+g('aldps').value,br=+g('albrd').value;if(!ps&&!br)return o;
await new Promise(function(z){setTimeout(z,0)});var t=[];if(ps){t.push(deplosive(o,ps/100,+g('aldpv').value)+' plosive'+'s')}if(br){t.push(breaths(o,br,+g('albrv').value)+' breaths')}
g('aldpg').textContent='Treated: '+t.join(', ');return o};
var pp=g('alps');if(pp)pp.addEventListener('change',function(){if(pp.value==='rst')setTimeout(function(){g('aldps').value=0;g('aldpv').value=5;g('albrd').value=0;g('albrv').value=5;g('aldpg').textContent='';ui()},50)});
window.__alDP={deplosive:deplosive,breaths:breaths};ui();
}catch(e){try{console.error('Audio Lab improvement 16',e)}catch(x){}}})();

;
/* ==================== Script 988 id="amiyo-al-s17-dereverb" ==================== */
/* Audio Lab improvement 17: de-reverb and tail tightener. De-reverb estimates how much of each frequency in every moment is only the room's decaying echo of earlier sound (from the room decay time you give) and subtracts it, so a voice recorded in an echoey room sounds closer and drier. Tail tightener is a gentle expander that lets the leftover tails in pauses fade out faster without chopping words. Applied by Process; the Room decay setting is the one to adjust first. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-n17'))return;M.setAttribute('data-n17','1');
var g=function(i){return M.querySelector('#'+i)};
var first=M.querySelector('details.alsec');if(!first)return;
var d=document.createElement('details');d.className='alsec';
function sl(i,l,mn,mx,st,v){return'<label>'+l+': <b>'+v+'</b></label><input type="range" id="'+i+'" min="'+mn+'" max="'+mx+'" step="'+st+'" value="'+v+'">'}
d.innerHTML='<summary><span>De-reverb &amp; tail tightener</span><i></i></summary><div class="alin">'
+sl('aldrv','De-reverb amount (%, 0 = off)',0,100,1,0)+sl('aldrt','Room decay time (s, bigger room = higher)',0.2,2.5,0.1,0.8)
+sl('aldrx','Tail tightener (%, 0 = off)',0,100,1,0)
+'<div id="aldrg" style="font-size:12px;color:#b9b2a2;margin-top:4px">Tip: start with 40-60% and a decay time near how long a clap echoes in the room.</div></div>';
first.parentNode.insertBefore(d,first);
var badge=d.querySelector('summary i');
function ui(){d.querySelectorAll('input[type=range]').forEach(function(e){var b=e.previousElementSibling.querySelector('b');if(b)b.textContent=e.value});badge.textContent=(+g('aldrv').value||+g('aldrx').value)?'on':''}
d.addEventListener('input',ui);
var N=2048,H=512,B=N/2+1,W=new Float32Array(N),rv=new Uint16Array(N),CT=new Float32Array(N/2),ST=new Float32Array(N/2),i0;
for(i0=0;i0<N;i0++)W[i0]=.5-.5*Math.cos(2*Math.PI*i0/N);
for(i0=0;i0<N;i0++){var q=0,v=i0;for(var b=1;b<N;b<<=1){q=(q<<1)|(v&1);v>>=1}rv[i0]=q}
for(i0=0;i0<N/2;i0++){CT[i0]=Math.cos(-2*Math.PI*i0/N);ST[i0]=Math.sin(-2*Math.PI*i0/N)}
function fft(re,im){var n=N,i,j,k;for(i=0;i<n;i++){j=rv[i];if(j>i){var t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t}}
for(var len=2;len<=n;len<<=1){var h=len>>1,st=n/len;for(i=0;i<n;i+=len)for(k=0;k<h;k++){var wr=CT[k*st],wi=ST[k*st],a=i+k,c=a+h,xr=re[c]*wr-im[c]*wi,xi=re[c]*wi+im[c]*wr;re[c]=re[a]-xr;im[c]=im[a]-xi;re[a]+=xr;im[a]+=xi}}}
async function derev(x,s,rt,prog){var len=x.length,p=new Float32Array(len+2*N);p.set(x,N);var fr=Math.floor((p.length-N)/H)+1,D=4,hist=[],k,t;for(k=0;k<=D;k++)hist.push(new Float32Array(B));
var re=new Float32Array(N),im=new Float32Array(N),P=new Float32Array(B),Ps=new Float32Array(B),R=new Float32Array(B),Gp=new Float32Array(B).fill(1),G=new Float32Array(B),out=new Float32Array(p.length),sr=derev.sr;
var ratio=Math.pow(10,-6*(D*H/sr)/rt),rd=Math.pow(10,-6*(H/sr)/rt),beta=.6+2.4*s,fl=Math.pow(10,-(8+12*s)/20);
for(t=0;t<fr;t++){var o=t*H;for(k=0;k<N;k++){re[k]=p[o+k]*W[k];im[k]=0}fft(re,im);
for(k=0;k<B;k++)P[k]=re[k]*re[k]+im[k]*im[k];
for(k=0;k<B;k++)Ps[k]=((k>0?P[k-1]:P[k])+P[k]+(k<B-1?P[k+1]:P[k]))/3;
var old=hist[(t+1)%(D+1)];
for(k=0;k<B;k++){var rn=Math.max(ratio*old[k],rd*R[k]);R[k]=rn;var gg=1-beta*rn/(P[k]+1e-12);gg=Math.sqrt(Math.max(fl*fl,gg));G[k]=gg}
hist[t%(D+1)].set(Ps);
for(k=0;k<B;k++){var gm=.65*G[k]+.35*Gp[k];Gp[k]=gm;G[k]=gm}
for(k=1;k<B-1;k++){var gs=(G[k-1]+2*G[k]+G[k+1])/4;re[k]*=gs;im[k]*=gs;re[N-k]*=gs;im[N-k]*=gs}
re[0]*=G[0];im[0]*=G[0];re[B-1]*=G[B-1];im[B-1]*=G[B-1];
fft(im,re);for(k=0;k<N;k++)out[o+k]+=re[k]/N*W[k]/1.5;
if(t%200===199){if(prog)prog(t/fr);await new Promise(function(z){setTimeout(z,0)})}}
return out.subarray(N,N+len)}
function tighten(r,amt){var sr=r.sampleRate,C=r.numberOfChannels,n=r.length,sq=new Float32Array(n);
for(var i=0;i<n;i++){var m=0;for(var c=0;c<C;c++){var v=r.getChannelData(c)[i];m=v<0?-v>m?-v:m:v>m?v:m}sq[i]=m}
var env=0,at=1-Math.exp(-1/(.004*sr)),rl=1-Math.exp(-1/(.12*sr)),hold=Math.round(.04*sr),hc=0,e2=new Float32Array(n);
for(i=0;i<n;i++){var a=sq[i];if(a>env){env+=(a-env)*at;hc=hold}else if(hc>0){hc--}else env+=(a-env)*rl;e2[i]=env}
var db=[];for(i=0;i<n;i+=Math.max(1,Math.floor(sr/100)))db.push(10*Math.log10(e2[i]*e2[i]+1e-12));db.sort(function(u,v){return u-v});
var ref=db[Math.floor(db.length*.9)],thr=ref-45+amt*.3,mx=-(8+amt*.2),gs=1,ga=1-Math.exp(-1/(.005*sr)),gr=1-Math.exp(-1/(.02*sr));
for(i=0;i<n;i++){var e=10*Math.log10(e2[i]*e2[i]+1e-12),gd=e<thr?Math.max(mx,(e-thr)):0,tg=Math.pow(10,gd/20);gs+=(tg-gs)*(tg<gs?ga:gr);for(c=0;c<C;c++)r.getChannelData(c)[i]*=gs}}
var pt=window.__alTP;window.__alTP=async function(r){var o=pt?await pt.apply(this,arguments):r;if(!o)return o;var s=+g('aldrv').value/100,tx=+g('aldrx').value;if(!s&&!tx)return o;
var n=g('aln'),rt=+g('aldrt').value;derev.sr=o.sampleRate;
if(s){for(var c=0;c<o.numberOfChannels;c++){var dd=o.getChannelData(c),res=await derev(dd,s,rt,function(f){if(window.__alCancel)throw new Error('Cancelled');if(n)n.textContent='Removing room echo '+Math.round((c+f)/o.numberOfChannels*100)+'%'});dd.set(res)}}
if(tx)tighten(o,tx);g('aldrg').textContent='Done: '+(s?'de-reverb '+Math.round(s*100)+'% at '+rt+' s decay':'')+(s&&tx?', ':'')+(tx?'tail tightener '+tx+'%':'');return o};
var pp=g('alps');if(pp)pp.addEventListener('change',function(){if(pp.value==='rst')setTimeout(function(){g('aldrv').value=0;g('aldrt').value=.8;g('aldrx').value=0;ui()},50)});
window.__alDR={derev:derev,tighten:tighten};ui();
}catch(e){try{console.error('Audio Lab improvement 17',e)}catch(x){}}})();

;
/* ==================== Script 989 id="amiyo-al-s18-ducking" ==================== */
/* Audio Lab improvement 18: auto-ducking. Choose a voice file and the audio you have open (usually music) is turned down automatically whenever the voice speaks, then eases back up in the gaps. Look-ahead means the music is already down when the first word starts. Set how much to duck, how sensitive the voice detection is, and how fast it dips and recovers; optionally mix the voice into the result at its own level and shift it later in time. A small graph shows the volume curve that was applied. Applied by Process. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-n18'))return;M.setAttribute('data-n18','1');
var g=function(i){return M.querySelector('#'+i)};
var first=M.querySelector('details.alsec');if(!first)return;
var d=document.createElement('details');d.className='alsec';
function sl(i,l,mn,mx,st,v){return'<label>'+l+': <b>'+v+'</b></label><input type="range" id="'+i+'" min="'+mn+'" max="'+mx+'" step="'+st+'" value="'+v+'">'}
d.innerHTML='<summary><span>Auto-ducking (music under voice)</span><i></i></summary><div class="alin"><label>Voice file (the sound that triggers the dip)</label><input type="file" id="aldkf" accept="audio/*,video/*"><div class="row"><span id="aldkn" style="font-size:12px;color:#b9b2a2">No voice file chosen: ducking is off.</span><button type="button" id="aldkx">Clear</button></div>'
+sl('aldkd','Duck amount (dB)',3,30,1,12)+sl('aldkt','Voice detection threshold (dB)',-60,-10,1,-38)
+sl('aldka','Dip speed (ms)',5,200,5,30)+sl('aldkr','Recovery time (ms)',50,1500,10,400)+sl('aldkh','Hold after voice stops (ms)',0,800,10,150)
+'<label style="margin:6px 0"><input type="checkbox" id="aldkm" checked> Mix the voice into the result</label>'
+sl('aldkv','Voice level in mix (dB)',-12,12,.5,0)+sl('aldko','Voice starts at (s)',0,60,.1,0)
+'<canvas id="aldkc" style="width:100%;height:56px;margin-top:6px;display:none"></canvas><div id="aldkg" style="font-size:12px;color:#b9b2a2;margin-top:4px"></div></div>';
first.parentNode.insertBefore(d,first);
var badge=d.querySelector('summary i'),vb=null,vkey='';
function ui(){d.querySelectorAll('input[type=range]').forEach(function(e){var b=e.previousElementSibling.querySelector('b');if(b)b.textContent=e.value});badge.textContent=vb?'on':''}
d.addEventListener('input',ui);
var ctx=null;
g('aldkf').addEventListener('change',async function(){var f=this.files[0];if(!f){vb=null;g('aldkn').textContent='No voice file chosen: ducking is off.';ui();return}
g('aldkn').textContent='Reading '+f.name+'...';try{var st=window.__alst&&window.__alst();ctx=(st&&st.ac)||ctx||new (window.AudioContext||window.webkitAudioContext)();vb=await ctx.decodeAudioData(await f.arrayBuffer());vkey=f.name+f.size;g('aldkn').textContent=f.name+' ('+vb.duration.toFixed(1)+' s) ready. Press Process.'}catch(e){vb=null;g('aldkn').textContent='Could not read that file as audio.'}ui()});
g('aldkx').addEventListener('click',function(){g('aldkf').value='';vb=null;g('aldkn').textContent='No voice file chosen: ducking is off.';g('aldkc').style.display='none';g('aldkg').textContent='';ui()});
function mono(b,n,off,sr){var m=new Float32Array(n),C=b.numberOfChannels,r=b.sampleRate/sr;for(var i=0;i<n;i++){var j=Math.floor((i-off)*r);if(j<0||j>=b.length)continue;var v=0;for(var c=0;c<C;c++)v+=b.getChannelData(c)[j];m[i]=v/C}return m}
function duck(o,P){var sr=o.sampleRate,C=o.numberOfChannels,off=Math.round(P.off*sr),mixLen=P.mix?Math.max(o.length,off+Math.round(vb.length*sr/vb.sampleRate)):o.length,n=mixLen;
var vm=mono(vb,n,off,sr),env=0,ea=1-Math.exp(-1/(.003*sr)),er=1-Math.exp(-1/(.04*sr)),hi=Math.pow(10,P.thr/20),lo=hi*.6,act=new Uint8Array(n),on=false,hc=0,hold=Math.round(P.hold*.001*sr);
for(var i=0;i<n;i++){var a=vm[i]<0?-vm[i]:vm[i];env+=(a-env)*(a>env?ea:er);if(env>hi){on=true;hc=hold}else if(on&&env<lo){if(hc>0)hc--;else on=false}act[i]=on?1:0}
var la=Math.round(.04*sr),ga=1-Math.exp(-1/(P.atk*.001*sr)),gr=1-Math.exp(-1/(P.rel*.001*sr)),tg=Math.pow(10,-P.amt/20),gs=1,gain=new Float32Array(n),dk=0,mn=1;
for(i=0;i<n;i++){var t=(i+la<n&&act[i+la])?tg:1;gs+=(t-gs)*(t<gs?ga:gr);gain[i]=gs;if(gs<.95)dk++;if(gs<mn)mn=gs}
var out=new AudioBuffer({length:n,numberOfChannels:C,sampleRate:sr}),vg=Math.pow(10,P.vl/20),VC=vb.numberOfChannels,rr=vb.sampleRate/sr;
for(var c=0;c<C;c++){var x=o.getChannelData(c),y=out.getChannelData(c),vc=vb.getChannelData(Math.min(c,VC-1));for(i=0;i<n;i++){var s=(i<x.length?x[i]:0)*gain[i];if(P.mix){var j=Math.floor((i-off)*rr);if(j>=0&&j<vb.length)s+=vc[j]*vg}y[i]=s}}
return{buf:out,gain:gain,pct:100*dk/n,min:mn}}
function plot(gain,sr){var c=g('aldkc'),w=c.width=c.clientWidth*2||600,h=c.height=112,x=c.getContext('2d');c.style.display='block';x.fillStyle='#141210';x.fillRect(0,0,w,h);x.strokeStyle='#ff7a3d';x.lineWidth=2;x.beginPath();var st=Math.max(1,Math.floor(gain.length/w));for(var i=0;i<w;i++){var m=1;for(var j=0;j<st;j++){var v=gain[i*st+j];if(v<m)m=v}var db=20*Math.log10(Math.max(m,.01)),y=4+(-db/40)*(h-8);if(i)x.lineTo(i,y);else x.moveTo(i,y)}x.stroke();x.fillStyle='#b9b2a2';x.font='18px sans-serif';x.fillText('0 dB',4,18);x.fillText('-40',4,h-6)}
var pt=window.__alTP;window.__alTP=async function(r){var o=pt?await pt.apply(this,arguments):r;if(!o||!vb)return o;
var P={amt:+g('aldkd').value,thr:+g('aldkt').value,atk:+g('aldka').value,rel:+g('aldkr').value,hold:+g('aldkh').value,mix:g('aldkm').checked,vl:+g('aldkv').value,off:+g('aldko').value};
await new Promise(function(z){setTimeout(z,0)});var R=duck(o,P);plot(R.gain,o.sampleRate);
g('aldkg').textContent='Music was ducked '+R.pct.toFixed(0)+'% of the time, down to '+(20*Math.log10(R.min)).toFixed(1)+' dB.';return R.buf};
var pp=g('alps');if(pp)pp.addEventListener('change',function(){if(pp.value==='rst')setTimeout(function(){g('aldkx').click();g('aldkd').value=12;g('aldkt').value=-38;g('aldka').value=30;g('aldkr').value=400;g('aldkh').value=150;g('aldkm').checked=true;g('aldkv').value=0;g('aldko').value=0;ui()},50)});
window.__alDuck={run:duck};ui();
}catch(e){try{console.error('Audio Lab improvement 18',e)}catch(x){}}})();

;
/* ==================== Script 990 id="amiyo-al-s19-join" ==================== */
/* Audio Lab improvement 19: join clips with crossfade. Add several audio files, put them in order (move up / down / remove), choose the crossfade length and curve (equal-power keeps the volume steady; linear), or a gap of silence instead, optionally match the loudness of every clip, and put them before or after the audio that is open. "Join now" loads the joined result back into Audio Lab so every effect applies to the whole thing; "Undo join" brings back what you had. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-n19'))return;M.setAttribute('data-n19','1');
var g=function(i){return M.querySelector('#'+i)};
var first=M.querySelector('details.alsec');if(!first)return;
var d=document.createElement('details');d.className='alsec';
function sl(i,l,mn,mx,st,v){return'<label>'+l+': <b>'+v+'</b></label><input type="range" id="'+i+'" min="'+mn+'" max="'+mx+'" step="'+st+'" value="'+v+'">'}
d.innerHTML='<summary><span>Join clips &amp; crossfade</span><i></i></summary><div class="alin"><label>Files to join (you can pick several)</label><input type="file" id="aljf" accept="audio/*,video/*" multiple><div id="aljl" style="font-size:13px;margin:6px 0"></div>'
+'<label>Put them</label><select id="aljp"><option value="after">after the open audio</option><option value="before">before the open audio</option></select>'
+sl('aljx','Crossfade (s, 0 = no overlap)',0,5,.1,1)+'<label>Crossfade curve</label><select id="aljc"><option value="eq">Equal power (steady volume)</option><option value="lin">Linear</option></select>'
+sl('aljg','Gap of silence (ms, used when crossfade is 0)',0,3000,50,0)
+'<label style="margin:6px 0"><input type="checkbox" id="aljm" checked> Match the loudness of all clips</label>'
+'<div class="row"><button type="button" class="pri" id="aljn">Join now</button><button type="button" id="aljz" disabled>Undo join</button></div><div id="aljg2" style="font-size:12px;color:#b9b2a2;margin-top:4px"></div></div>';
first.parentNode.insertBefore(d,first);
var badge=d.querySelector('summary i'),L=[],undo=null,ctx=null;
function ui(){d.querySelectorAll('input[type=range]').forEach(function(e){var b=e.previousElementSibling.querySelector('b');if(b)b.textContent=e.value});badge.textContent=L.length?L.length+' added':''}
d.addEventListener('input',ui);
function say(t){g('aljg2').textContent=t;var n=g('aln');if(n)n.textContent=t}
function AC(){var st=window.__alst&&window.__alst();ctx=(st&&st.ac)||ctx||new (window.AudioContext||window.webkitAudioContext)();return ctx}
function render(){var h='';L.forEach(function(x,i){h+='<div style="display:flex;gap:6px;align-items:center;margin:3px 0"><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(i+1)+'. '+x.name.replace(/</g,'&lt;')+' ('+x.buf.duration.toFixed(1)+' s)</span><button type="button" data-a="u" data-i="'+i+'">&uarr;</button><button type="button" data-a="d" data-i="'+i+'">&darr;</button><button type="button" data-a="x" data-i="'+i+'">&times;</button></div>'});g('aljl').innerHTML=h||'<span style="color:#b9b2a2">No extra files yet.</span>';ui()}
g('aljl').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var i=+b.dataset.i,a=b.dataset.a;if(a==='x')L.splice(i,1);else if(a==='u'&&i>0){var t=L[i];L[i]=L[i-1];L[i-1]=t}else if(a==='d'&&i<L.length-1){var t2=L[i];L[i]=L[i+1];L[i+1]=t2}render()});
g('aljf').addEventListener('change',async function(){var fs=Array.prototype.slice.call(this.files);this.value='';for(var k=0;k<fs.length;k++){try{say('Reading '+fs[k].name+'...');L.push({name:fs[k].name,buf:await AC().decodeAudioData(await fs[k].arrayBuffer())})}catch(e){say('Could not read '+fs[k].name+' as audio.')}}render();if(L.length)say(L.length+' file(s) ready. Press Join now.')});
async function resample(b,sr){if(b.sampleRate===sr)return b;var o=new OfflineAudioContext(b.numberOfChannels,Math.ceil(b.length*sr/b.sampleRate),sr),s=o.createBufferSource();s.buffer=b;s.connect(o.destination);s.start();return await o.startRendering()}
function rms(b){var s=0,n=0;for(var c=0;c<b.numberOfChannels;c++){var x=b.getChannelData(c);for(var i=0;i<x.length;i+=7){s+=x[i]*x[i];n++}}return Math.sqrt(s/Math.max(1,n))}
function wav(ch,sr){var C=ch.length,n=ch[0].length,buf=new ArrayBuffer(44+n*C*4),v=new DataView(buf),ws=function(o,s){for(var i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};ws(0,'RIFF');v.setUint32(4,36+n*C*4,true);ws(8,'WAVE');ws(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,3,true);v.setUint16(22,C,true);v.setUint32(24,sr,true);v.setUint32(28,sr*C*4,true);v.setUint16(32,C*4,true);v.setUint16(34,32,true);ws(36,'data');v.setUint32(40,n*C*4,true);var o=44;for(var i=0;i<n;i++)for(var c=0;c<C;c++){v.setFloat32(o,ch[c][i],true);o+=4}return new Blob([buf],{type:'audio/wav'})}
function bufWav(b){var ch=[];for(var c=0;c<b.numberOfChannels;c++)ch.push(b.getChannelData(c));return wav(ch,b.sampleRate)}
function load(blob,name){var f=new File([blob],name,{type:'audio/wav'}),dt=new DataTransfer();dt.items.add(f);var inp=g('alf');inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}))}
g('aljn').addEventListener('click',async function(){var st=window.__alst&&window.__alst(),cur=st&&st.src;if(!cur){say('Open an audio file in Audio Lab first.');return}if(!L.length){say('Add at least one file to join.');return}
if(typeof DataTransfer==='undefined'){say('This browser cannot load the joined result back in.');return}
try{say('Joining...');var sr=cur.sampleRate,seq=[];for(var k=0;k<L.length;k++)seq.push(await resample(L[k].buf,sr));if(g('aljp').value==='before')seq=seq.concat([cur]);else seq=[cur].concat(seq);
var C=0;seq.forEach(function(b){if(b.numberOfChannels>C)C=b.numberOfChannels});var gains=seq.map(function(b){if(!g('aljm').checked)return 1;var r=rms(b),r0=rms(seq[0]);return r>1e-6?Math.max(.25,Math.min(4,r0/r)):1});
var xs=Math.round(+g('aljx').value*sr),gp=xs>0?0:Math.round(+g('aljg').value*.001*sr),eq=g('aljc').value==='eq',lens=[],tot=0,starts=[];
for(k=0;k<seq.length;k++){var ov=0;if(k>0&&xs>0)ov=Math.min(xs,Math.floor(seq[k].length/2),Math.floor(seq[k-1].length/2));lens.push(ov);var s0=k?starts[k-1]+seq[k-1].length-ov+gp:0;starts.push(s0);tot=Math.max(tot,s0+seq[k].length)}
var out=[];for(var c=0;c<C;c++)out.push(new Float32Array(tot));
for(k=0;k<seq.length;k++){var b=seq[k],ov2=lens[k],gn=gains[k];for(c=0;c<C;c++){var x=b.getChannelData(Math.min(c,b.numberOfChannels-1)),y=out[c],o0=starts[k];for(var i=0;i<b.length;i++){var w=gn;if(i<ov2){var t=i/ov2;w*=eq?Math.sin(t*Math.PI/2):t}if(k<seq.length-1&&lens[k+1]>0&&i>=b.length-lens[k+1]){var t2=(i-(b.length-lens[k+1]))/lens[k+1];w*=eq?Math.cos(t2*Math.PI/2):1-t2}y[o0+i]+=x[i]*w}}}
for(c=0;c<C;c++){var pk=out[c],m=0;for(i=0;i<pk.length;i+=1){var a=pk[i]<0?-pk[i]:pk[i];if(a>m)m=a}if(m>1){var sc=.98/m;for(i=0;i<pk.length;i++)pk[i]*=sc}}
undo=bufWav(cur);g('aljz').disabled=false;load(wav(out,sr),'joined.wav');say('Joined '+seq.length+' clips: '+(tot/sr).toFixed(1)+' s total.')}catch(e){say('Join failed: '+(e&&e.message))}});
g('aljz').addEventListener('click',function(){if(!undo)return;load(undo,'before-join.wav');undo=null;this.disabled=true;say('Join undone.')});
var pp=g('alps');if(pp)pp.addEventListener('change',function(){if(pp.value==='rst')setTimeout(function(){L=[];g('aljx').value=1;g('aljg').value=0;g('aljm').checked=true;g('aljp').value='after';g('aljc').value='eq';render()},50)});
window.__alJoin={wav:wav};render();
}catch(e){try{console.error('Audio Lab improvement 19',e)}catch(x){}}})();

;
/* ==================== Script 991 id="amiyo-al-s20-tempo-key" ==================== */
/* Audio Lab improvement 20: tempo and key. Analyze finds the BPM (from the rhythm of the sound's onsets, with half and double-tempo alternatives and a confidence), where the first beat falls, and the musical key (major or minor, with its relative key). "Check with clicks" plays a click on every detected beat over your audio so you can hear whether it is right. Tap tempo works out BPM from your own taps. "Use for delay" sends the BPM to the ping-pong delay. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-n20'))return;M.setAttribute('data-n20','1');
var g=function(i){return M.querySelector('#'+i)};
var first=M.querySelector('details.alsec');if(!first)return;
var d=document.createElement('details');d.className='alsec';
d.innerHTML='<summary><span>Tempo &amp; key</span><i></i></summary><div class="alin"><div class="row"><button type="button" class="pri" id="altka">Analyze tempo &amp; key</button><button type="button" id="altkc" disabled>Check with clicks</button><button type="button" id="altkd" disabled>Use for delay</button></div>'
+'<div id="altkr" style="font-size:14px;margin:8px 0;line-height:1.5">Open audio, then press Analyze.</div>'
+'<div class="row"><button type="button" id="altkt" style="min-width:120px;min-height:44px">Tap tempo</button><span id="altkx" style="font-size:14px">Tap on the beat.</span></div></div>';
first.parentNode.insertBefore(d,first);
var badge=d.querySelector('summary i'),R=null,play=null,ctx=null;
function say(t){g('altkr').innerHTML=t}
function AC(){var st=window.__alst&&window.__alst();ctx=(st&&st.ac)||ctx||new (window.AudioContext||window.webkitAudioContext)();return ctx}
function mono(b){var n=b.length,C=b.numberOfChannels,m=new Float32Array(n);for(var c=0;c<C;c++){var x=b.getChannelData(c);for(var i=0;i<n;i++)m[i]+=x[i]/C}return m}
function tempo(b){var sr=b.sampleRate,m=mono(b),hop=Math.round(sr*.005),F=Math.floor(m.length/hop);if(F<400)return null;var l=new Float32Array(F),i,f;
for(f=0;f<F;f++){var s=0,o=f*hop;for(i=0;i<hop;i++){var dv=m[o+i]-(o+i?m[o+i-1]:0);s+=dv*dv}l[f]=Math.log(1+300*Math.sqrt(s/hop))}
var on=new Float32Array(F);for(f=1;f<F;f++){var v=l[f]-l[f-1];on[f]=v>0?v:0}
var W=100,out=new Float32Array(F),acc=0;for(f=0;f<F;f++){acc+=on[f];if(f>=W)acc-=on[f-W];out[f]=Math.max(0,on[f]-acc/Math.min(W,f+1)*1.0)}
var lo=Math.floor(60/215*200),hi=Math.ceil(60/55*200),r=new Float32Array(hi+2),mean=0,cnt=0;
for(var lag=lo-1;lag<=hi+1;lag++){var t=0;for(f=0;f+lag<F;f++)t+=out[f]*out[f+lag];r[lag]=t/(F-lag)}
var best=-1,bs=0;for(lag=lo;lag<=hi;lag++){var bpm=60*200/lag,pr=Math.exp(-.5*Math.pow(Math.log(bpm/120)/Math.LN2/1.0,2)),sc=r[lag]*pr;mean+=r[lag];cnt++;if(sc>bs&&r[lag]>=r[lag-1]&&r[lag]>=r[lag+1]){bs=sc;best=lag}}
if(best<0)return null;var a=r[best-1],bb=r[best],cc=r[best+1],den=a-2*bb+cc,pk=den?best+.5*(a-cc)/den:best,bpm2=60*200/pk,conf=r[best]/(mean/cnt+1e-12);
var ph=0,pm=-1;for(var o2=0;o2<pk;o2+=.5){var su=0;for(var j=0;o2+j*pk<F;j++)su+=out[Math.round(o2+j*pk)]||0;if(su>pm){pm=su;ph=o2}}
return{bpm:bpm2,conf:conf,first:ph/200,period:pk/200}}
var N=4096,rv=new Uint16Array(N),CT=new Float32Array(N/2),ST=new Float32Array(N/2),HW=new Float32Array(N),q;
for(q=0;q<N;q++){var z=0,v0=q;for(var bb2=1;bb2<N;bb2<<=1){z=(z<<1)|(v0&1);v0>>=1}rv[q]=z;HW[q]=.5-.5*Math.cos(2*Math.PI*q/N)}
for(q=0;q<N/2;q++){CT[q]=Math.cos(-2*Math.PI*q/N);ST[q]=Math.sin(-2*Math.PI*q/N)}
function fft(re,im){var n=N,i,j,k;for(i=0;i<n;i++){j=rv[i];if(j>i){var t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t}}for(var len=2;len<=n;len<<=1){var h=len>>1,st=n/len;for(i=0;i<n;i+=len)for(k=0;k<h;k++){var wr=CT[k*st],wi=ST[k*st],a=i+k,c=a+h,xr=re[c]*wr-im[c]*wi,xi=re[c]*wi+im[c]*wr;re[c]=re[a]-xr;im[c]=im[a]-xi;re[a]+=xr;im[a]+=xi}}}
var MAJ=[6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88],MIN=[6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17],NM=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
function corr(a,b){var ma=0,mb=0,i;for(i=0;i<12;i++){ma+=a[i];mb+=b[i]}ma/=12;mb/=12;var n=0,da=0,db=0;for(i=0;i<12;i++){n+=(a[i]-ma)*(b[i]-mb);da+=(a[i]-ma)*(a[i]-ma);db+=(b[i]-mb)*(b[i]-mb)}return n/Math.sqrt(da*db+1e-12)}
function key(b){var sr=b.sampleRate,m=mono(b),n=m.length;if(n<N*4)return null;var fr=Math.min(220,Math.floor((n-N)/N)),ch=new Float32Array(12),re=new Float32Array(N),im=new Float32Array(N);
for(var t=0;t<fr;t++){var o=Math.floor(t*(n-N)/Math.max(1,fr-1));for(var k=0;k<N;k++){re[k]=m[o+k]*HW[k];im[k]=0}fft(re,im);for(k=2;k<N/2;k++){var f=k*sr/N;if(f<65||f>2000)continue;var pc=((Math.round(12*Math.log(f/440)/Math.LN2+69)%12)+12)%12;ch[pc]+=Math.pow(re[k]*re[k]+im[k]*im[k],.25)}}
var bs=-2,bi=0,bm=0,s2=-2,i;for(i=0;i<12;i++){var rj=[],rn=[];for(var j=0;j<12;j++){rj[j]=ch[(i+j)%12];rn[j]=ch[(i+j)%12]}var c1=corr(rj,MAJ),c2=corr(rn,MIN);if(c1>bs){s2=bs;bs=c1;bi=i;bm=0}else if(c1>s2)s2=c1;if(c2>bs){s2=bs;bs=c2;bi=i;bm=1}else if(c2>s2)s2=c2}
return{name:NM[bi]+(bm?' minor':' major'),rel:bm?NM[(bi+3)%12]+' major':NM[(bi+9)%12]+' minor',score:bs,margin:bs-s2}}
function stop(){if(play){try{play.forEach(function(s){s.stop()})}catch(e){}play=null}g('altkc').textContent='Check with clicks'}
g('altka').addEventListener('click',async function(){var st=window.__alst&&window.__alst(),b=st&&st.src;if(!b){say('Open an audio file in Audio Lab first.');return}
say('Listening...');await new Promise(function(z){setTimeout(z,20)});try{var T=tempo(b),K=key(b),h='';
if(T){var cl=T.conf>3?'clear':T.conf>1.8?'fairly clear':'weak (music may have no steady beat)';h+='<b>Tempo: '+T.bpm.toFixed(1)+' BPM</b> ('+cl+')<br>Also possible: '+(T.bpm/2).toFixed(1)+' or '+(T.bpm*2).toFixed(1)+'. First beat near '+T.first.toFixed(2)+' s.<br>'}else h+='Tempo: audio too short to tell.<br>';
if(K){var kc=K.margin>.08?'clear':K.margin>.03?'fairly clear':'uncertain';h+='<b>Key: '+K.name+'</b> ('+kc+'). Relative key: '+K.rel+'.'}else h+='Key: audio too short to tell.';
R=T;say(h);g('altkc').disabled=!T;g('altkd').disabled=!T;badge.textContent=T?Math.round(T.bpm)+' BPM':''}catch(e){say('Analysis failed: '+(e&&e.message))}});
g('altkc').addEventListener('click',function(){if(play){stop();return}var st=window.__alst&&window.__alst(),b=st&&st.src;if(!b||!R)return;var c=AC();if(c.state==='suspended')c.resume();var s=c.createBufferSource();s.buffer=b;s.connect(c.destination);var t0=c.currentTime+.1,all=[s];s.start(t0);
var cb=c.createBuffer(1,Math.round(c.sampleRate*.03),c.sampleRate),cd=cb.getChannelData(0);for(var i=0;i<cd.length;i++)cd[i]=Math.sin(2*Math.PI*1600*i/c.sampleRate)*Math.exp(-i/(c.sampleRate*.006))*.6;
var k=0;for(var tt=R.first;tt<b.duration&&k<4000;tt+=R.period,k++){var cs=c.createBufferSource();cs.buffer=cb;cs.connect(c.destination);cs.start(t0+tt);all.push(cs)}
play=all;this.textContent='Stop clicks';s.onended=function(){if(play===all)stop()}});
g('altkd').addEventListener('click',function(){var e=g('alxb');if(!e||!R){say('The delay control is not available.');return}e.value=Math.max(40,Math.min(240,Math.round(R.bpm)));e.dispatchEvent(new Event('input',{bubbles:true}));var n=g('aln');if(n)n.textContent='Delay tempo set to '+e.value+' BPM.'});
var taps=[];g('altkt').addEventListener('click',function(){var t=performance.now();if(taps.length&&t-taps[taps.length-1]>2200)taps=[];taps.push(t);if(taps.length>9)taps.shift();if(taps.length<2){g('altkx').textContent='Keep tapping...';return}var iv=(taps[taps.length-1]-taps[0])/(taps.length-1),bpm=60000/iv;g('altkx').textContent=bpm.toFixed(1)+' BPM ('+taps.length+' taps)'});
var pp=g('alps');if(pp)pp.addEventListener('change',function(){if(pp.value==='rst')setTimeout(function(){stop();R=null;taps=[];g('altkc').disabled=true;g('altkd').disabled=true;g('altkx').textContent='Tap on the beat.';say('Open audio, then press Analyze.');badge.textContent=''},50)});
window.__alTK={tempo:tempo,key:key};
}catch(e){try{console.error('Audio Lab improvement 20',e)}catch(x){}}})();

;
/* ==================== Script 992 id="amiyo-al-s21-pitch-correct" ==================== */
/* Audio Lab improvement 21: pitch correction (auto-tune). Follows the pitch of a voice or a solo instrument, finds the nearest note of the key and scale you choose (or any semitone), and nudges the sound onto it using pitch-synchronous overlap-add, which keeps the timing and the tone of the voice. Amount, retune speed (slow = natural, fast = robotic effect), maximum shift and reference tuning (A4) are adjustable. "Use detected key" takes the key found by Tempo & key. A graph shows the pitch before (grey) and after (orange). It runs first in the chain, before reverb and the other effects. Works on a single melodic line, not on chords or full music. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-n21'))return;M.setAttribute('data-n21','1');
var g=function(i){return M.querySelector('#'+i)};
var first=M.querySelector('details.alsec');if(!first)return;
var d=document.createElement('details');d.className='alsec';
function sl(i,l,mn,mx,st,v){return'<label>'+l+': <b>'+v+'</b></label><input type="range" id="'+i+'" min="'+mn+'" max="'+mx+'" step="'+st+'" value="'+v+'">'}
var NM=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
d.innerHTML='<summary><span>Pitch correction (auto-tune)</span><i></i></summary><div class="alin"><label>Scale</label><select id="alpcs"><option value="">Off</option><option value="chr">Chromatic (nearest semitone)</option><option value="maj">Major</option><option value="min">Natural minor</option><option value="pmj">Major pentatonic</option><option value="pmn">Minor pentatonic</option></select>'
+'<label>Key note</label><select id="alpck">'+NM.map(function(n,i){return'<option value="'+i+'">'+n+'</option>'}).join('')+'</select><div class="row"><button type="button" id="alpcd">Use detected key</button></div>'
+sl('alpca','Correction amount (%)',0,100,1,100)+sl('alpcr','Retune speed (ms, low = robotic)',10,400,5,80)+sl('alpcm','Maximum shift (semitones)',1,6,.5,2)+sl('alpct','Reference tuning A4 (Hz)',415,466,1,440)
+'<canvas id="alpcc" style="width:100%;height:70px;margin-top:6px;display:none"></canvas><div id="alpcg" style="font-size:12px;color:#b9b2a2;margin-top:4px">For one voice or one instrument at a time.</div></div>';
first.parentNode.insertBefore(d,first);
var badge=d.querySelector('summary i');
function ui(){d.querySelectorAll('input[type=range]').forEach(function(e){var b=e.previousElementSibling.querySelector('b');if(b)b.textContent=e.value});badge.textContent=g('alpcs').value?'on':''}
d.addEventListener('input',ui);d.addEventListener('change',ui);
g('alpcd').addEventListener('click',function(){var st=window.__alst&&window.__alst(),b=st&&st.src,tk=window.__alTK;if(!b||!tk){g('alpcg').textContent='Open audio first.';return}var k=tk.key(b);if(!k){g('alpcg').textContent='Audio too short to detect a key.';return}var p=k.name.split(' '),i=NM.indexOf(p[0]);g('alpck').value=i;g('alpcs').value=p[1]==='minor'?'min':'maj';ui();g('alpcg').textContent='Set to '+k.name+'.'});
var SC={chr:[0,1,2,3,4,5,6,7,8,9,10,11],maj:[0,2,4,5,7,9,11],min:[0,2,3,5,7,8,10],pmj:[0,2,4,7,9],pmn:[0,3,5,7,10]};
function mono(b){var n=b.length,C=b.numberOfChannels,m=new Float32Array(n);for(var c=0;c<C;c++){var x=b.getChannelData(c);for(var i=0;i<n;i++)m[i]+=x[i]/C}return m}
function track(m,sr){var D=Math.max(1,Math.round(sr/11025)),s2=sr/D,n2=Math.floor(m.length/D),y=new Float32Array(n2),i,j;for(i=0;i<n2;i++){var a=0;for(j=0;j<D;j++)a+=m[i*D+j];y[i]=a/D}
var W=Math.round(.025*s2),t0=Math.round(s2/800),t1=Math.round(s2/70),F=Math.floor(m.length/sr*100),f0=new Float32Array(F),dd=new Float32Array(t1+2),cm=new Float32Array(t1+2);
for(var f=0;f<F;f++){var st=Math.round(f*.01*s2)-Math.round((W+t1)/2);if(st<0||st+W+t1+1>=n2)continue;var e=0;for(j=0;j<W;j++)e+=y[st+j]*y[st+j];if(Math.sqrt(e/W)<.006)continue;
for(var t=1;t<=t1;t++){var s=0;for(j=0;j<W;j++){var df=y[st+j]-y[st+j+t];s+=df*df}dd[t]=s}
var run=0;cm[0]=1;for(t=1;t<=t1;t++){run+=dd[t];cm[t]=run>0?dd[t]*t/run:1}
var tau=-1;for(t=t0;t<t1;t++){if(cm[t]<.15){while(t+1<t1&&cm[t+1]<cm[t])t++;tau=t;break}}
if(tau<0){var mn=9,mt=-1;for(t=t0;t<t1;t++)if(cm[t]<mn){mn=cm[t];mt=t}if(mn<.28)tau=mt}
if(tau<2)continue;var a0=cm[tau-1],b0=cm[tau],c0=cm[tau+1],dn=a0-2*b0+c0,tt=dn?tau+.5*(a0-c0)/dn:tau;f0[f]=s2/tt}
var o=new Float32Array(f0);for(f=1;f<F-1;f++){if(f0[f]&&f0[f-1]&&f0[f+1]){var v=[f0[f-1],f0[f],f0[f+1]].sort(function(p,q){return p-q});o[f]=v[1]}}
for(f=1;f<F-1;f++)if(o[f]&&!o[f-1]&&!o[f+1])o[f]=0;return o}
function correct(r,P){var sr=r.sampleRate,n=r.length,C=r.numberOfChannels,m=mono(r),f0=track(m,sr),F=f0.length,allowed={},i,f;SC[P.scale].forEach(function(s){allowed[(s+P.key)%12]=1});
var det=new Float32Array(F),sh=new Float32Array(F),cur=0,al=1-Math.exp(-10/P.speed),al2=1-Math.exp(-10/30),voiced=0,sa=0;
for(f=0;f<F;f++){var tg=0;if(f0[f]){var mi=69+12*Math.log(f0[f]/P.a4)/Math.LN2;det[f]=mi;var best=0,bd=99;for(var k=-7;k<=7;k++){var c=Math.round(mi)+k;if(!allowed[((c%12)+12)%12])continue;var dv=Math.abs(c-mi);if(dv<bd){bd=dv;best=c}}tg=Math.max(-P.max,Math.min(P.max,(best-mi)*P.amt));voiced++;sa+=Math.abs(tg)}cur+=(tg-cur)*(f0[f]?al:al2);sh[f]=cur}
if(voiced<10)return{buf:r,msg:'No steady pitch found. This works on one voice or one instrument at a time.'};
function at(arr,t){var p=t*100,i0=Math.max(0,Math.min(F-1,Math.floor(p))),i1=Math.min(F-1,i0+1),fr=p-i0;return arr[i0]*(1-fr)+arr[i1]*fr}
function Tat(t){var p=Math.round(t*100),i0=Math.max(0,Math.min(F-1,p));for(var k=0;k<3;k++){var q=Math.max(0,Math.min(F-1,i0+(k?(k===1?1:-1):0)));if(f0[q])return sr/f0[q]}return 0}
var marks=[],pos=0;while(pos<n){var T=Tat(pos/sr),mk=pos;if(T>0){var rg=Math.round(T*.25),bx=-9,bi2=pos;for(i=Math.max(0,pos-rg);i<=Math.min(n-1,pos+rg);i++)if(m[i]>bx){bx=m[i];bi2=i}mk=bi2}else T=Math.round(.008*sr);marks.push(mk);pos=mk+Math.max(20,Math.round(T))}
var out=[],acc=new Float32Array(n);for(var c2=0;c2<C;c2++)out.push(new Float32Array(n));
var s=0,mi2=0;while(s<n){var Ts=Tat(s/sr),vo=Ts>0;if(!vo)Ts=.008*sr;while(mi2+1<marks.length&&Math.abs(marks[mi2+1]-s)<Math.abs(marks[mi2]-s))mi2++;var mk2=marks[mi2],Tm=Math.max(20,Math.round(Ts)),L=2*Tm,rt=vo?Math.pow(2,at(sh,s/sr)/12):1;
for(var j=0;j<L;j++){var o1=Math.round(s)-Tm+j,i1=mk2-Tm+j;if(o1<0||o1>=n||i1<0||i1>=n)continue;var w=.5-.5*Math.cos(2*Math.PI*(j+.5)/L);acc[o1]+=w;for(c2=0;c2<C;c2++)out[c2][o1]+=r.getChannelData(c2)[i1]*w}
s+=Math.max(10,Ts/rt)}
var res=new AudioBuffer({length:n,numberOfChannels:C,sampleRate:sr});for(c2=0;c2<C;c2++){var y=res.getChannelData(c2),o=out[c2],x=r.getChannelData(c2);for(i=0;i<n;i++)y[i]=acc[i]>.02?o[i]/acc[i]:x[i]}
return{buf:res,det:det,sh:sh,msg:'Corrected '+voiced+' voiced frames, average shift '+Math.round(sa/voiced*100)+' cents.'}}
function plot(det,sh){var c=g('alpcc'),w=c.width=c.clientWidth*2||600,h=c.height=140,x=c.getContext('2d'),mn=999,mx=-999,F=det.length,i;c.style.display='block';for(i=0;i<F;i++)if(det[i]){mn=Math.min(mn,det[i]);mx=Math.max(mx,det[i])}if(mx<mn)return;mn-=2;mx+=2;x.fillStyle='#141210';x.fillRect(0,0,w,h);
[['#6c665a',0],['#ff7a3d',1]].forEach(function(z){x.strokeStyle=z[0];x.lineWidth=2;x.beginPath();var pen=false;for(var k=0;k<F;k++){if(!det[k]){pen=false;continue}var v=det[k]+(z[1]?sh[k]:0),px=k/F*w,py=h-(v-mn)/(mx-mn)*h;if(pen)x.lineTo(px,py);else{x.moveTo(px,py);pen=true}}x.stroke()})}
var pt=window.__alTP;window.__alTP=async function(r){var args=Array.prototype.slice.call(arguments);if(r&&g('alpcs').value&&+g('alpca').value>0){await new Promise(function(z){setTimeout(z,20)});try{var R=correct(r,{scale:g('alpcs').value,key:+g('alpck').value,amt:+g('alpca').value/100,speed:+g('alpcr').value,max:+g('alpcm').value,a4:+g('alpct').value});if(R.det)plot(R.det,R.sh);g('alpcg').textContent=R.msg;args[0]=R.buf}catch(e){g('alpcg').textContent='Pitch correction failed: '+(e&&e.message)}}return pt?await pt.apply(this,args):args[0]};
var pp=g('alps');if(pp)pp.addEventListener('change',function(){if(pp.value==='rst')setTimeout(function(){g('alpcs').value='';g('alpck').value=0;g('alpca').value=100;g('alpcr').value=80;g('alpcm').value=2;g('alpct').value=440;g('alpcc').style.display='none';g('alpcg').textContent='For one voice or one instrument at a time.';ui()},50)});
window.__alPC={track:track,correct:correct};ui();
}catch(e){try{console.error('Audio Lab improvement 21',e)}catch(x){}}})();

;
/* ==================== Script 993 id="amiyo-al-n22-loudness" ==================== */
/* Audio Lab improvement 22: loudness targets and report. Pick where the audio is going (YouTube, Spotify, Apple Music, podcasts, TikTok and Instagram, EBU R128 or ATSC broadcast, audiobooks) and "Apply target" sets Audio Lab's loudness target and peak ceiling for that place. After every Process (or on demand, for the file you opened) a report measures integrated loudness (LUFS, gated as in ITU-R BS.1770), loudness range (LU), highest short-term loudness, true peak and sample peak, and says plainly whether each one meets the target. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-n22'))return;M.setAttribute('data-n22','1');
var g=function(i){return M.querySelector('#'+i)};
var first=M.querySelector('details.alsec');if(!first)return;
var PL={yt:['YouTube',-14,-1],spo:['Spotify',-14,-1],apm:['Apple Music',-16,-1],pod:['Podcasts',-16,-1],soc:['TikTok, Instagram and Reels',-14,-1],r128:['EBU R128 broadcast',-23,-1],atsc:['ATSC A/85 broadcast',-24,-2],acx:['Audiobook (ACX), approximate',-20,-3]};
var d=document.createElement('details');d.className='alsec';
d.innerHTML='<summary><span>Loudness targets &amp; report</span><i></i></summary><div class="alin"><label>Where is this audio going?</label><select id="nlpl"><option value="">Choose a platform</option>'+Object.keys(PL).map(function(k){return'<option value="'+k+'">'+PL[k][0]+' ('+PL[k][1]+' LUFS, '+PL[k][2]+' dBTP)</option>'}).join('')+'</select>'
+'<div class="row"><button type="button" class="pri" id="nlap">Apply target</button><button type="button" id="nlms">Measure opened file</button><button type="button" id="nlmr">Measure result</button></div><div id="nlrp" style="font-size:13px;margin-top:8px;overflow-x:auto">Open audio and press Measure, or Process and the result is measured automatically.</div></div>';
first.parentNode.insertBefore(d,first);
var badge=d.querySelector('summary i');
function ensure(sel,v){if(!sel)return;var has=false;for(var i=0;i<sel.options.length;i++)if(+sel.options[i].value===v)has=true;if(!has){var o=document.createElement('option');o.value=String(v);o.textContent=(sel.id==='alt'?Math.abs(v)+' LUFS (custom)':Math.abs(v)+' dBFS');sel.appendChild(o)}}
function setv(e,v){e.value=String(v);e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))}
g('nlap').addEventListener('click',function(){var p=PL[g('nlpl').value],n=g('aln');if(!p){if(n)n.textContent='Choose a platform first.';return}var a=g('alt'),k=g('alk');ensure(a,p[1]);ensure(k,p[2]);if(a)setv(a,p[1]);if(k)setv(k,p[2]);badge.textContent=p[0].split(' ')[0];if(n)n.textContent='Target set to '+p[1]+' LUFS with a '+p[2]+' dB peak ceiling. Press Process.'});
function kw(x,sr){var K=Math.tan(Math.PI*1681.974450955533/sr),Vh=Math.pow(10,3.999843853973347/20),Vb=Math.pow(Vh,.4996667741545416),Q=.7071752369554196,a0=1+K/Q+K*K,b0=(Vh+Vb*K/Q+K*K)/a0,b1=2*(K*K-Vh)/a0,b2=(Vh-Vb*K/Q+K*K)/a0,a1=2*(K*K-1)/a0,a2=(1-K/Q+K*K)/a0;
var K2=Math.tan(Math.PI*38.13547087602444/sr),Q2=.5003270373238773,c0=1+K2/Q2+K2*K2,d1=2*(K2*K2-1)/c0,d2=(1-K2/Q2+K2*K2)/c0,y=new Float32Array(x.length),x1=0,x2=0,y1=0,y2=0,u1=0,u2=0,v1=0,v2=0;
for(var i=0;i<x.length;i++){var v=x[i],o=b0*v+b1*x1+b2*x2-a1*y1-a2*y2;x2=x1;x1=v;y2=y1;y1=o;var h=o-2*u1+u2-d1*v1-d2*v2;u2=u1;u1=o;v2=v1;v1=h;y[i]=h}return y}
function L(e){return-.691+10*Math.log10(e+1e-14)}
function measure(b){var sr=b.sampleRate,n=b.length,C=b.numberOfChannels,bn=Math.round(.1*sr),nb=Math.floor(n/bn),bins=new Float64Array(nb),sp=0,tp=0,c,i;
for(c=0;c<C;c++){var x=b.getChannelData(c),y=kw(x,sr);for(i=0;i<nb*bn;i++)bins[Math.floor(i/bn)]+=y[i]*y[i];for(i=0;i<n;i++){var a=x[i]<0?-x[i]:x[i];if(a>sp)sp=a}
for(i=1;i<n-2;i++){var y0=x[i-1],y1=x[i],y2=x[i+1],y3=x[i+2];for(var k=1;k<4;k++){var t=k/4,v=y1+.5*t*(y2-y0+t*(2*y0-5*y1+4*y2-y3+t*(3*(y1-y2)+y3-y0)));if(v<0)v=-v;if(v>tp)tp=v}}}
if(nb<4)return null;var blocks=[];for(i=0;i+4<=nb;i++)blocks.push((bins[i]+bins[i+1]+bins[i+2]+bins[i+3])/(4*bn));
var g1=blocks.filter(function(e){return L(e)>-70}),res={sp:20*Math.log10(Math.max(sp,1e-9)),tp:20*Math.log10(Math.max(tp,sp,1e-9))};
if(!g1.length)return null;var m1=g1.reduce(function(s,e){return s+e},0)/g1.length,g2=g1.filter(function(e){return L(e)>L(m1)-10});res.lufs=L(g2.reduce(function(s,e){return s+e},0)/Math.max(1,g2.length));
var st=[];for(i=0;i+30<=nb;i+=10){var s=0;for(var j=0;j<30;j++)s+=bins[i+j];st.push(s/(30*bn))}
if(st.length){res.stmax=Math.max.apply(null,st.map(L));var h1=st.filter(function(e){return L(e)>-70});if(h1.length>1){var mm=h1.reduce(function(s,e){return s+e},0)/h1.length,h2=h1.filter(function(e){return L(e)>L(mm)-20}).map(L).sort(function(p,q){return p-q});if(h2.length>1)res.lra=h2[Math.floor(.95*(h2.length-1))]-h2[Math.floor(.1*(h2.length-1))]}}
return res}
function row(a,b,c,s,bad){return'<tr><td style="padding:3px 8px 3px 0">'+a+'</td><td style="padding:3px 8px">'+b+'</td><td style="padding:3px 8px">'+c+'</td><td style="padding:3px 0;color:'+(bad===1?'#ff7a3d':bad===0?'#7fd18b':'#b9b2a2')+'">'+s+'</td></tr>'}
function report(b,what){var m=measure(b),box=g('nlrp');if(!m){box.textContent='Not enough sound to measure (needs about half a second).';return}var p=PL[g('nlpl').value],h='<div style="margin-bottom:4px">'+what+'</div><table style="border-collapse:collapse"><tr style="color:#b9b2a2"><th align="left">Measure</th><th align="left">Result</th><th align="left">Target</th><th align="left">Verdict</th></tr>',df;
if(p){df=m.lufs-p[1];h+=row('Integrated loudness',m.lufs.toFixed(1)+' LUFS',p[1]+' LUFS',Math.abs(df)<=1?'Meets the target':df>0?'Too loud by '+df.toFixed(1)+' LU':'Too quiet by '+(-df).toFixed(1)+' LU',Math.abs(df)<=1?0:1);
h+=row('True peak',m.tp.toFixed(1)+' dBTP','max '+p[2]+' dBTP',m.tp<=p[2]+.05?'Within the ceiling':'Over by '+(m.tp-p[2]).toFixed(1)+' dB',m.tp<=p[2]+.05?0:1)}
else{h+=row('Integrated loudness',m.lufs.toFixed(1)+' LUFS','-','Choose a platform to compare',2);h+=row('True peak',m.tp.toFixed(1)+' dBTP','-','',2)}
h+=row('Loudness range',m.lra!=null?m.lra.toFixed(1)+' LU':'too short','-','How much it varies',2)+row('Loudest short moment',m.stmax!=null?m.stmax.toFixed(1)+' LUFS':'too short','-','3-second window',2)+row('Sample peak',m.sp.toFixed(1)+' dBFS','-','',2)+'</table>';box.innerHTML=h}
g('nlms').addEventListener('click',function(){var s=window.__alst&&window.__alst(),b=s&&s.src;if(!b){g('nlrp').textContent='Open an audio file in Audio Lab first.';return}g('nlrp').textContent='Measuring...';setTimeout(function(){report(b,'Measured: the file you opened')},20)});
g('nlmr').addEventListener('click',function(){var s=window.__alst&&window.__alst(),b=s&&s.out;if(!b){g('nlrp').textContent='Press Process first.';return}report(b,'Measured: the processed result')});
var an=g('aln');if(an&&window.MutationObserver){var busy=false;new MutationObserver(function(){if(busy)return;if(/^Done/.test(an.textContent)){busy=true;setTimeout(function(){try{var s=window.__alst(),b=s&&s.out;if(b)report(b,'Measured: the processed result')}catch(e){}busy=false},60)}}).observe(an,{childList:true,characterData:true,subtree:true})}
var pp=g('alps');if(pp)pp.addEventListener('change',function(){if(pp.value==='rst')setTimeout(function(){g('nlpl').value='';badge.textContent='';g('nlrp').textContent='Open audio and press Measure, or Process and the result is measured automatically.'},50)});
window.__alLoud={measure:measure};
}catch(e){try{console.error('Audio Lab improvement 22',e)}catch(x){}}})();

;
/* ==================== Script 994 id="amiyo-al-t01-input" ==================== */
/* Audio Lab check 1 (loading & input): clear reasons when a file can't be read (empty file, video with no sound, unsupported codec), duration shown after loading, friendly microphone errors, and a hint when the media library is empty. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-t01'))return;M.setAttribute('data-t01','1');
var g=function(i){return M.querySelector('#'+i)},st=g('aln'),last=null,prevD=null;
function note(f){if(f)last=f}
var fi=g('alf');if(fi)fi.addEventListener('change',function(){note(this.files&&this.files[0])},true);
var z=M.querySelector('.alzone');if(z)z.addEventListener('drop',function(e){note(e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0])},true);
var lb=g('alib');if(lb)lb.addEventListener('change',function(){var o=this.options[this.selectedIndex];if(o&&o.value)last={name:o.text.replace(/^\S+\s/,''),size:1,type:'',lib:1}},true);
function fail(clip){
  if(clip)return 'Could not read the selected clip. It may have no audio track, or use a codec this browser cannot decode.';
  var f=last;if(!f)return 'Could not read this file as audio. Try a WAV, MP3, OGG or FLAC file.';
  var n='\u201c'+f.name+'\u201d';
  if(f.size===0)return n+' is empty (0 bytes). Pick the file again or export it again from the source.';
  var vid=/^video\//.test(f.type||'')||/\.(mp4|mov|mkv|avi|webm|m4v)$/i.test(f.name||'');
  if(vid)return n+' has no sound this browser can read. It may have no audio track or use an unsupported codec. Try its audio as WAV or MP3.';
  return 'Could not read '+n+' as audio. It may be damaged or in a format this browser cannot decode. WAV, MP3, OGG and FLAC always work; M4A, AAC and AIFF depend on the browser.';
}
function fmt(s){return s<60?s.toFixed(2)+' s':Math.floor(s/60)+':'+('0'+Math.round(s%60)).slice(-2)+' min'}
function addDur(t,n){var d=g('d0');if(!d)return;var v=parseFloat(d.textContent);if((v>0&&d.textContent!==prevD)||n>=8){if(v>0&&st.textContent===t)st.textContent=t+', '+fmt(v)}else setTimeout(function(){if(st.textContent===t)addDur(t,n+1)},300)}
if(st)new MutationObserver(function(){var t=st.textContent;
  if(t==='Could not read this file as audio.')st.textContent=fail(false);
  else if(t==='Could not read the selected clip.')st.textContent=fail(true);
  else if(/^Reading .+\u2026$/.test(t)){var d=g('d0');prevD=d?d.textContent:null}
  else if(/^.+ \u2014 \d+ ch, \d+ Hz$/.test(t)&&!/^Clip /.test(t))addDur(t,0)
}).observe(st,{childList:true,characterData:true,subtree:true});
/* friendly microphone errors */
var md=navigator.mediaDevices;
if(md&&md.getUserMedia&&!md.__t01){var og=md.getUserMedia.bind(md);md.__t01=1;md.getUserMedia=function(c){return og(c).catch(function(e){var n=e&&e.name,m=null;
  if(n==='NotFoundError'||n==='DevicesNotFoundError')m='No microphone found. Plug one in (or check your system sound settings), then press Start again.';
  else if(n==='NotReadableError'||n==='TrackStartError')m='The microphone is busy. Close other apps or tabs that use it (calls, recorders) and press Start again.';
  else if(n==='OverconstrainedError')m='That microphone cannot use these settings. Pick another one from the Microphone list or untick noise suppression.';
  if(m){var e2=new Error(m);e2.name=n;throw e2}throw e})}}
/* media library hint */
function libHint(){var s=g('alib');if(!s||!s.options.length)return;var n=s.options.length-1;s.options[0].text=n>0?'\u2026or pick from your media library ('+n+')':'\u2026or pick from your media library (nothing imported yet)'}
var b=document.getElementById('alb');if(b)b.addEventListener('click',function(){setTimeout(libHint,80);setTimeout(libHint,700)});
}catch(e){console&&console.warn&&console.warn('Audio Lab t01',e)}})();

;
/* ==================== Script 995 id="amiyo-al-t02-selection" ==================== */
/* Audio Lab check 2 (waveform, selection, trim, zoom): trim start/end can no longer cross (used to give an empty export), clear message when Start/End here cannot be applied, Ctrl+A selects the whole file. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-t02'))return;M.setAttribute('data-t02','1');
var g=function(i){return M.querySelector('#'+i)},st=g('aln'),a=g('als'),b=g('ale'),GAP=0.5;
function say(t){if(st)st.textContent=t}
function fix(e){var s=+a.value,t=+b.value;if(t-s>=GAP)return;
  if(e&&e.target===a){a.value=Math.max(0,t-GAP);if(+a.value>t-GAP){a.value=0;b.value=GAP}say('Trim start cannot pass the end. Move the end later first.')}
  else{b.value=Math.min(100,s+GAP);if(+b.value<s+GAP){b.value=100;a.value=100-GAP}say('Trim end cannot go before the start. Move the start earlier first.')}
  var ev=new Event('input',{bubbles:false});try{(e&&e.target===a?a:b).dispatchEvent(ev)}catch(x){}}
[a,b].forEach(function(el){if(el)el.addEventListener('input',function(e){if(e.__t02)return;fix(e)},true)});
/* Start/End here that change nothing: explain why */
function watch(id,msg){var el=g(id);if(!el)return;el.addEventListener('click',function(){var v0=a.value+'|'+b.value,t0=st.textContent;setTimeout(function(){if(a.value+'|'+b.value===v0&&st.textContent===t0)say(msg)},120)})}
watch('alt1','Nothing changed: the start must be before the end. Click the waveform earlier than the end first.');
watch('alt2','Nothing changed: the end must be after the start. Click the waveform later than the start first.');
/* Ctrl+A = whole file */
document.addEventListener('keydown',function(e){if(!(e.ctrlKey||e.metaKey)||e.key.toLowerCase()!=='a'||e.shiftKey||e.altKey)return;if(!M.offsetParent&&getComputedStyle(M).display==='none')return;var t=e.target,tag=t&&t.tagName;if(tag==='INPUT'&&t.type==='text'||tag==='TEXTAREA')return;var m=document.getElementById('alm');if(!m||m.offsetWidth===0)return;e.preventDefault();var f=g('alt3');if(f)f.click()},true);
}catch(e){console&&console.warn&&console.warn('Audio Lab t02',e)}})();

;
/* ==================== Script 996 id="amiyo-al-t03-presets" ==================== */
/* Audio Lab check 3 (presets & Auto-enhance): Auto-enhance voice / music now also runs Process by itself (they only set the controls before), and the delete button tells you to click again. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-t03'))return;M.setAttribute('data-t03','1');
var g=function(i){return M.querySelector('#'+i)},st=g('aln');
['alauto','alautom'].forEach(function(id){var b=g(id);if(!b)return;b.addEventListener('click',function(){var n=0,iv=setInterval(function(){n++;var t=st.textContent;if(/^(Auto-enhance set|Music master set)/.test(t)){clearInterval(iv);var r=g('alr');if(r)r.click()}else if(n>60)clearInterval(iv)},250)})});
var d=g('alpdl');if(d)d.addEventListener('click',function(){var me=this;setTimeout(function(){if(me.textContent==='Sure?'&&/^Preset /.test(st.textContent)||me.textContent==='Sure?'&&!/Deleted/.test(st.textContent))st.textContent='Click the bin again within 3 seconds to delete this preset.'},30)});
}catch(e){console&&console.warn&&console.warn('Audio Lab t03',e)}})();

;
/* ==================== Script 997 id="amiyo-al-t04-auto-trim" ==================== */
/* Audio Lab check 4 (Auto-enhance & noise sample): "Auto-enhance voice" and "Auto-pick quietest part" used the trim handles to mark the noise sample. When that stretch was rejected (it still had a little speech or music in it) the handles stayed on that tiny stretch, so Process and Export then returned only that piece (a 3 s file became 0.75 s). The handles now go back to exactly where they were, and the message says so. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-t04'))return;M.setAttribute('data-t04','1');
var g=function(i){return M.querySelector('#'+i)},st=g('aln'),a=g('als'),b=g('ale'),q=g('alnq'),pa=null,pb=null;
function fire(e){e.dispatchEvent(new Event('input',{bubbles:true}))}
if(q){
  q.addEventListener('click',function(){pa=a.value;pb=b.value},true);
  q.addEventListener('click',function(){
    if(pa===null)return;var ra=pa,rb=pb;pa=pb=null;
    if(+a.value===0&&+b.value===100)return;           /* noise learned, handles already reset */
    a.value=ra;b.value=rb;fire(a);fire(b);
    if(st&&!/trim is unchanged/.test(st.textContent))st.textContent=st.textContent.replace(/\s*$/,'')+' Your trim is unchanged.';
  });
}
}catch(e){console&&console.warn&&console.warn('Audio Lab t04',e)}})();

;
/* ==================== Script 998 id="amiyo-al-t05-reset-all" ==================== */
/* Audio Lab check 5 (Reset all): "Reset all" left the trim handles, the compressor make-up gain and the silence-remover settings where they were, so after a reset Process still returned only the trimmed part (and the make-up gain came back as soon as the compressor was turned on again). Reset all now puts those back too. View options, export format and edit tools are not touched. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-t05'))return;M.setAttribute('data-t05','1');
var g=function(i){return M.querySelector('#'+i)},ps=g('alps'),st=g('aln');
var DEF={als:0,ale:100,alcm:0,alst:-45,alsm:0.6,alsk:0.25};
function fire(e){e.dispatchEvent(new Event('input',{bubbles:true}))}
if(ps)ps.addEventListener('change',function(){if(ps.value!=='rst')return;
  setTimeout(function(){var ch=0;
    /* trim: set the end first when moving it out, so the two handles never cross */
    ['ale','als','alcm','alst','alsm','alsk'].forEach(function(id){var e=g(id);if(!e||+e.value===DEF[id])return;e.value=DEF[id];fire(e);ch++});
    try{window.dispatchEvent(new Event('resize'))}catch(x){}
    if(st&&ch&&/^Preset applied/.test(st.textContent))st.textContent='Everything is back to default, including the trim.';
  },120)});
}catch(e){console&&console.warn&&console.warn('Audio Lab t05',e)}})();

;
/* ==================== Script 999 id="amiyo-al-t06-fresh-export" ==================== */
/* Audio Lab check 6 (Export, Replace, Add): if you pressed Process and then changed a control (gain, trim, EQ, noise reduction...), Export / Replace selected clip / Add to timeline still used the OLD processed audio, so the file did not match the sliders. Now, when the settings have changed since the last Process (or Process was never pressed), these three buttons first apply the current settings and then carry on. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-t06'))return;M.setAttribute('data-t06','1');
var g=function(i){return M.querySelector('#'+i)},st=g('aln'),S=function(){return(window.__alst&&window.__alst())||{}};
var VIEW=/^(rc|al8|alz|af_|alsc$|alsw$|alsd$|alo$|alx$|alive$|alrem$|alfast$|alps$|alpn$|alpif$|alf$|alib$|allp$|alrp2$|aled8$)/;
function sig(){var o=[],s=S();M.querySelectorAll('input[id],select[id]').forEach(function(e){if(e.type==='file'||e.type==='text'||e.type==='number'&&false||VIEW.test(e.id))return;o.push(e.id+'='+(e.type==='checkbox'?(e.checked?1:0):e.value))});return o.join('|')}
var map=new WeakMap(),pending=null;
var pr=g('alr');
if(pr)pr.addEventListener('click',function(){pending=sig()},true);
setInterval(function(){var o=S().out;if(o&&!map.has(o))map.set(o,pending===null?sig():pending)},250);
var busy=false;
function wait(prev){return new Promise(function(res){var n=0,iv=setInterval(function(){n++;var o=S().out,t=st?st.textContent:'';
  if(o&&o!==prev&&!/^(Processing|Reducing|Applying)/.test(t)){clearInterval(iv);setTimeout(function(){res(true)},60)}
  else if(/^(Processing failed|Cancelled|Choose a file)/.test(t)||n>1500){clearInterval(iv);res(false)}},200)})}
['ald','alrp','alad'].forEach(function(id){var b=g(id);if(!b)return;
  b.addEventListener('click',function(e){
    if(e.__t06)return;var s=S();if(!s.src)return;
    var fresh=s.out&&map.get(s.out)===sig();
    if(fresh)return;
    e.stopImmediatePropagation();e.preventDefault();
    if(busy)return;busy=true;
    if(st)st.textContent='Applying your current settings first…';
    var prev=s.out;pending=sig();
    pr.click();
    wait(prev).then(function(ok){busy=false;if(!ok)return;var ev=new MouseEvent('click',{bubbles:true,cancelable:true});ev.__t06=1;b.dispatchEvent(ev)})
  },true)});
}catch(e){console&&console.warn&&console.warn('Audio Lab t06',e)}})();

;
/* ==================== Script 1000 id="amiyo-al-t07-replace-video" ==================== */
/* Audio Lab check 7 (Replace selected clip): (a) on a VIDEO clip, Replace swapped the video for a sound file, so the picture vanished from the timeline. Now the video stays, its own sound is muted, and the processed audio is placed on the audio track under it (one undo restores everything). (b) Replace used the last timeline clip you loaded even after you had opened a different file or a recording, so it could overwrite the wrong clip. Now it tells you to use "Use selected clip" first. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-t07'))return;M.setAttribute('data-t07','1');
var g=function(i){return M.querySelector('#'+i)},st=g('aln'),S=function(){return(window.__alst&&window.__alst())||{}};
var clipMode=false,picked=null;window.__alClipLink=function(){return clipMode&&picked?{clipId:picked.clipId,trackId:picked.trackId}:null};
function say(t){if(st)st.textContent=t}
/* where did the audio come from? */
var u=g('alu'),pend=null;if(u)u.addEventListener('click',function(){var f=null;try{f=getClip()}catch(e){}pend=f?{clipId:f.clip.id,trackId:f.track.id}:null},true);
if(st)new MutationObserver(function(){if(pend&&/^Clip \u201c.*loaded/.test(st.textContent)){picked=pend;pend=null;clipMode=true}}).observe(st,{childList:true,characterData:true,subtree:true});
['alf','alib'].forEach(function(id){var e=g(id);if(e)e.addEventListener('change',function(){var f0=id==='alf'&&this.files&&this.files[0];if(f0&&/^(edit|before-[a-z-]+)\.wav$/i.test(f0.name||''))return;clipMode=false},true)});
var z=M.querySelector('.alzone');if(z)z.addEventListener('drop',function(){clipMode=false},true);
var rs=g('rcs');if(rs)rs.addEventListener('click',function(){clipMode=false},true);
var ra=g('alrp');
if(ra)ra.addEventListener('click',function(e){
  var s=S();if(!s.src)return;
  if(!clipMode){e.stopImmediatePropagation();e.preventDefault();say('This audio did not come from a timeline clip. Select a clip on the timeline and press “🎯 Use selected clip from timeline” first, or use “＋ Add to timeline”.');return}
  var f=null;try{f=picked&&typeof getClipByIds==='function'?getClipByIds(picked.clipId,picked.trackId):null}catch(x){}
  var c=f&&(f.clip||f),a=c&&typeof getAsset==='function'?getAsset(c.assetId):null;
  if(!c||!a||a.type!=='video')return;                      /* audio clips: original behaviour */
  e.stopImmediatePropagation();e.preventDefault();
  if(!s.out){say('Press Process first.');return}
  try{
    var before=deepClone(serializableProject()),vtrack=f.track||project.tracks.find(function(t){return t.clips.indexOf(c)>=0}),adBtn=g('alad');
    var ev=new MouseEvent('click',{bubbles:true,cancelable:true});ev.__t06=1;
    var cb={};project.tracks.forEach(function(t){t.clips.forEach(function(k){cb[k.id]=1})});
    adBtn.dispatchEvent(ev);
    var nc=null,nt=null;project.tracks.forEach(function(t){t.clips.forEach(function(k){if(!cb[k.id]){nc=k;nt=t}})});
    if(!nc){say('Could not place the audio under the video.');return}
    var spd=c.speed||1;nc.speed=spd;nc.duration=s.out.duration/spd;
    var others=nt.clips.filter(function(k){return k!==nc});
    nc.start=typeof nearestGap==='function'?nearestGap(others,c.start,nc.duration):c.start;
    nt.clips.sort(function(p,q){return p.start-q.start});
    c.volume=0;
    var after=serializableProject(),h=project.history;
    if(h&&h.entries&&h.entries[h.index]){h.entries[h.index]={label:'Audio Lab',before:before,after:deepClone(after)}}
    else recordHistory('Audio Lab',before,after);
    selectedClipId=c.id;scheduleAutosave();renderAll();
    M.style.display='none';
    toast('Processed audio placed under the video; the video’s own sound is muted');
    say('Video kept. Its own sound is muted and the processed audio is on the audio track under it. Undo restores the original.');
  }catch(err){say('Could not apply: '+(err&&err.message))}
},true);
}catch(e){console&&console.warn&&console.warn('Audio Lab t07',e)}})();

;
/* ==================== Script 1001 id="amiyo-al2-s01-menu-entry" ==================== */
/* Audio Lab fix 1: on a phone the Audio Lab button starts hidden behind a tiny edge tab, so most people never found it. It now has its own entry in the top "more" menu (next to "Audio"), which opens the Audio Lab and closes the menu. */
(function(){try{
  var ID='amAlMenuBtn';
  function add(){
    var host=document.getElementById('topMore'); if(!host||document.getElementById(ID)) return;
    var b=document.createElement('button'); b.type='button'; b.id=ID; b.className='topbtn';
    b.textContent='\uD83C\uDF9A Audio Lab'; b.title='Clean up, level and master your sound (noise, EQ, loudness)'; b.setAttribute('aria-label','Open Audio Lab');
    b.addEventListener('click',function(){
      try{ host.classList.remove('open'); }catch(e){}
      var o=document.getElementById('alb'); if(o) o.click();
    });
    var after=document.getElementById('audioExportBtn');
    if(after&&after.parentNode===host) host.insertBefore(b,after.nextSibling); else host.appendChild(b);
  }
  function start(){ add(); try{ new MutationObserver(function(){ if(!document.getElementById(ID)) add(); }).observe(document.getElementById('topMore')||document.body,{childList:true}); }catch(e){} }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ setTimeout(start,300); }); else setTimeout(start,300);
}catch(e){ try{ console.warn('Audio Lab fix 1',e); }catch(_){} }})();

;
/* ==================== Script 1002 id="amiyo-al2-s02-no-double-process" ==================== */
/* Audio Lab fix 2: pressing Process twice (or a second time while it was still working) started a second full run alongside the first - slower, and the two fought over the result. Now a press during a run is held back. If you changed a setting in the meantime, ONE follow-up run happens with the newest settings when the first finishes; if nothing changed, the extra press is ignored. */
(function(){try{
  var M=document.getElementById('alm'), R=document.getElementById('alr'), N=document.getElementById('aln'); if(!M||!R||!N) return;
  var running=false, pending=false, sig0='', wd=null;
  function sig(){ var s=[]; M.querySelectorAll('input,select,textarea').forEach(function(e){ if(e.type==='file') return; s.push((e.id||'')+'='+(e.type==='checkbox'||e.type==='radio'?(e.checked?1:0):e.value)); }); return s.join('|'); }
  function finish(){ running=false; clearTimeout(wd); }
  R.addEventListener('click',function(e){
    if(e.__amAl2) return;
    if(running){
      e.stopImmediatePropagation(); e.preventDefault();
      if(sig()!==sig0){ pending=true; N.textContent='Still processing… will run once more with your latest settings.'; }
      return;
    }
    running=true; sig0=sig(); pending=false;
    clearTimeout(wd); wd=setTimeout(finish,20*60*1000);
  },true);
  new MutationObserver(function(){
    if(!running) return; var t=N.textContent||'';
    if(/^(Done|Processing failed|Cancelled|Press|Choose|Could not)/.test(t)){
      var again=pending&&!/^Cancelled/.test(t)&&!/^(Processing failed|Could not)/.test(t); finish(); pending=false;
      if(again) setTimeout(function(){ try{ R.click(); }catch(x){} },80);
    }
  }).observe(N,{childList:true,characterData:true,subtree:true});
}catch(e){ try{ console.warn('Audio Lab fix 2',e); }catch(_){} }})();

;
/* ==================== Script 1003 id="amiyo-al2-s04-dialog" ==================== */
/* Audio Lab fix 4: the Audio Lab covers the whole screen but was not declared a dialog. Now it is (role, name, modal), keyboard focus moves into it when it opens, Tab / Shift+Tab stay inside it instead of wandering into the editor behind, and focus goes back to where you came from when it closes. */
(function(){try{
  var M=document.getElementById('alm'); if(!M) return;
  var h=M.querySelector('h2'); if(h&&!h.id) h.id='alTitle';
  M.setAttribute('role','dialog'); M.setAttribute('aria-modal','true'); M.setAttribute('aria-labelledby',h?h.id:'alTitle'); M.tabIndex=-1;
  var opener=null, wasOpen=false;
  function visible(e){ return !!(e&&e.isConnected&&e.getBoundingClientRect().width>0&&getComputedStyle(e).visibility!=='hidden'); }
  function isOpen(){ return M.style.display==='block'; }
  function focusables(){ return [].filter.call(M.querySelectorAll('button,input,select,textarea,summary,a[href],[tabindex]:not([tabindex="-1"])'),function(e){ return !e.disabled&&e.type!=='hidden'&&visible(e); }); }
  var ob=document.getElementById('alb'); 
  document.addEventListener('click',function(e){ var t=e.target&&e.target.closest&&e.target.closest('#alb,#amAlMenuBtn'); if(t&&!isOpen()) opener=t; },true);
  new MutationObserver(function(){
    var now=isOpen(); if(now===wasOpen) return; wasOpen=now;
    if(now){ if(!opener||!visible(opener)){ var c=document.activeElement; opener=(c&&c!==document.body&&!M.contains(c))?c:null; } try{ M.focus({preventScroll:true}); }catch(e){} }
    else { var o=opener; opener=null; setTimeout(function(){ try{ if(o&&visible(o)) o.focus({preventScroll:true}); }catch(e){} },30); }
  }).observe(M,{attributes:true,attributeFilter:['style']});
  M.addEventListener('keydown',function(e){
    if(e.key!=='Tab'||!isOpen()) return;
    var f=focusables(); if(!f.length){ e.preventDefault(); return; }
    var first=f[0], last=f[f.length-1], a=document.activeElement;
    if(e.shiftKey){ if(a===first||a===M||!M.contains(a)){ e.preventDefault(); last.focus(); } }
    else { if(a===last||!M.contains(a)){ e.preventDefault(); first.focus(); } }
  });
}catch(e){ try{ console.warn('Audio Lab fix 4',e); }catch(_){} }})();

;
/* ==================== Script 1004 id="amiyo-al2-s06-stale-notice" ==================== */
/* Audio Lab fix 6: with Live preview you hear a tweak instantly, but Export / Replace / Add still use the LAST processed result - easy to export something that no longer matches the sliders. A notice now appears when the settings differ from the ones used for the last Process (with a "Process now" button) and disappears when they match again or a new result is made. */
(function(){try{
  var M=document.getElementById('alm'), R=document.getElementById('alr'), N=document.getElementById('aln'); if(!M||!R||!N) return;
  var bar=R.parentElement, IGN={alf:1,alo:1,alive:1,alrem:1,allp:1,rcn:1,rcc:1,alzz:1};
  var box=document.createElement('div'); box.id='alstale'; box.setAttribute('role','status');
  box.style.cssText='display:none;flex:1 0 100%;align-items:center;gap:8px;flex-wrap:wrap;padding:6px 10px;border-radius:8px;background:#5a3a12;color:#ffe2b0;font-size:12.5px;line-height:1.35';
  var tx=document.createElement('span'); tx.style.flex='1 1 160px'; tx.textContent='Settings changed since the last Process \u2014 Export and Replace still use the old result.';
  var pb=document.createElement('button'); pb.type='button'; pb.textContent='Process now'; pb.style.cssText='background:#ff7a3d;color:#111;border:0;border-radius:8px;font-weight:700;padding:6px 12px';
  pb.addEventListener('click',function(){ R.click(); });
  box.appendChild(tx); box.appendChild(pb); bar.insertBefore(box,bar.firstChild);
  function sig(){ var s=[]; M.querySelectorAll('input,select').forEach(function(e){ if(e.type==='file'||e.type==='text'||e.type==='search'||IGN[e.id]||e.closest('#alstale')) return; s.push((e.id||'')+'='+(e.type==='checkbox'||e.type==='radio'?(e.checked?1:0):e.value)); }); return s.join('|'); }
  function outNow(){ try{ return window.__alst&&window.__alst().out||null; }catch(e){ return null; } }
  var runSig='', recSig=null, recOut=null;
  function sync(){
    var o=outNow();
    if(o!==recOut){ recOut=o; recSig=o?runSig:null; }
    var stale=!!(o&&recSig!==null&&sig()!==recSig);
    box.style.display=stale?'flex':'none';
  }
  R.addEventListener('click',function(e){ if(!e.defaultPrevented) runSig=sig(); },true);
  M.addEventListener('input',function(){ sync(); },true);
  M.addEventListener('change',function(){ sync(); },true);
  new MutationObserver(function(){ sync(); }).observe(N,{childList:true,characterData:true,subtree:true});
}catch(e){ try{ console.warn('Audio Lab fix 6',e); }catch(_){} }})();

;
/* ==================== Script 1005 id="amiyo-al-v2-s07-close-guard" ==================== */
/* Audio Lab fix 7: closing the Audio Lab (Close, the X, or Esc) after a long Process threw the result away without a word. If there is a processed result you have not exported, replaced or added yet, you are now asked first. Nothing is asked when there is nothing to lose. */
(function(){try{
  var M=document.getElementById('alm'), Q=document.getElementById('alq'), N=document.getElementById('aln'); if(!M||!Q||!N) return;
  var saved=false, lastOut=null, bypass=false, asking=false;
  function outNow(){ try{ return window.__alst&&window.__alst().out||null; }catch(e){ return null; } }
  function check(){ var o=outNow(); if(o!==lastOut){ lastOut=o; saved=false; } }
  function mark(){ check(); if(lastOut) saved=true; }
  new MutationObserver(function(){ check(); if(/^(Exported|Clip replaced|Added to the timeline|Video kept|Processed audio saved)/.test(N.textContent||'')) mark(); }).observe(N,{childList:true,characterData:true,subtree:true});
  var X=document.getElementById('ald'); if(X) X.addEventListener('click',function(){ setTimeout(mark,50); },true);
  function ask(){
    var msg='You have processed audio that has not been exported or added yet. Close the Audio Lab and lose it?';
    try{ if(typeof window.amiyoOk==='function') return Promise.resolve(window.amiyoOk(msg,{okLabel:'Close anyway'})); }catch(e){}
    return Promise.resolve(confirm(msg));
  }
  Q.addEventListener('click',function(e){
    if(bypass) return; check();
    if(!lastOut||saved||asking) { if(asking){ e.stopImmediatePropagation(); e.preventDefault(); } return; }
    e.stopImmediatePropagation(); e.preventDefault(); asking=true;
    ask().then(function(ok){ asking=false; if(ok){ bypass=true; try{ Q.click(); }finally{ bypass=false; } } }).catch(function(){ asking=false; });
  },true);
}catch(e){ try{ console.warn('Audio Lab fix 7',e); }catch(_){} }})();

;
/* ==================== Script 1006 id="amiyo-al-v2-s08-close-stops" ==================== */
/* Audio Lab fix 8: closing the Audio Lab while it was still processing left the render running unseen in the background (using battery, and finishing into a window you could no longer see). Closing now presses the existing Stop button first, so the work really stops. */
(function(){try{
  var Q=document.getElementById('alq'); if(!Q) return;
  Q.addEventListener('click',function(){
    var pg=document.getElementById('alpg'), x=document.getElementById('alpgx');
    if(pg&&x&&getComputedStyle(pg).display!=='none'){ try{ x.click(); }catch(e){} }
  },true);
}catch(e){ try{ console.warn('Audio Lab fix 8',e); }catch(_){} }})();

;
/* ==================== Script 1007 id="amiyo-al-v2-s09-selected-clip" ==================== */
/* Audio Lab fix 9: the Audio Lab covers the whole screen, so you cannot pick a clip once it is open - and nothing said you had to pick it first. When you open it with an audio/video clip selected on the timeline (and nothing loaded yet), a banner now names that clip and loads it with one tap. */
(function(){try{
  var M=document.getElementById('alm'), U=document.getElementById('alu'); if(!M||!U) return;
  var box=document.createElement('div'); box.id='alsel'; box.setAttribute('role','status');
  box.style.cssText='display:none;align-items:center;gap:8px;flex-wrap:wrap;margin:8px 0;padding:8px 10px;border-radius:10px;background:#1f3a2a;color:#cdeedb;font-size:13px';
  var tx=document.createElement('span'); tx.style.flex='1 1 150px';
  var bt=document.createElement('button'); bt.type='button'; bt.textContent='Load it'; bt.style.cssText='background:#ff7a3d;color:#111;border:0;border-radius:8px;font-weight:700;padding:6px 14px';
  bt.addEventListener('click',function(){ box.style.display='none'; U.click(); });
  box.appendChild(tx); box.appendChild(bt);
  var anchor=(U.closest('.row')||U.parentNode); anchor.parentNode.insertBefore(box,anchor);
  function selected(){ try{ var f=getClip(); if(!f||!f.clip||!f.clip.assetId) return null; var a=getAsset(f.clip.assetId); if(!a||(a.type!=='audio'&&a.type!=='video')) return null; return a; }catch(e){ return null; } }
  function refresh(){
    var loaded=false; try{ loaded=!!(window.__alst&&window.__alst().src); }catch(e){}
    var a=loaded?null:selected();
    if(a){ tx.textContent='Selected on the timeline: \u201C'+(a.name||'clip')+'\u201D'; box.style.display='flex'; } else box.style.display='none';
  }
  var was=false;
  new MutationObserver(function(){ var o=M.style.display==='block'; if(o&&!was) refresh(); was=o; }).observe(M,{attributes:true,attributeFilter:['style']});
  var N=document.getElementById('aln'); if(N) new MutationObserver(function(){ if(M.style.display==='block'&&box.style.display!=='none'){ var loaded=false; try{ loaded=!!window.__alst().src; }catch(e){} if(loaded) box.style.display='none'; } }).observe(N,{childList:true,characterData:true,subtree:true});
}catch(e){ try{ console.warn('Audio Lab fix 9',e); }catch(_){} }})();

;
/* ==================== Script 1008 id="amiyo-al-v2-s10-big-file" ==================== */
/* Audio Lab fix 10: choosing a very large file (a long video, an hour of audio) decodes all of it into memory, which can freeze or crash the tab on a phone - with no warning. Big files now ask first (about 80 MB on phones, 300 MB on bigger screens); saying No leaves the Audio Lab as it was. */
(function(){try{
  var F=document.getElementById('alf'); if(!F) return; var bypass=false;
  function limit(){ var dm=navigator.deviceMemory||0; return (innerWidth<=600||(dm&&dm<=4))?80e6:300e6; }
  function ask(msg){ try{ if(typeof window.amiyoOk==='function') return Promise.resolve(window.amiyoOk(msg,{okLabel:'Load anyway'})); }catch(e){} return Promise.resolve(confirm(msg)); }
  F.addEventListener('change',function(e){
    if(bypass) return; var f=F.files&&F.files[0]; if(!f||f.size<=limit()) return;
    e.stopImmediatePropagation(); e.preventDefault();
    var mb=Math.round(f.size/1048576);
    ask('\u201C'+f.name+'\u201D is large ('+mb+' MB). The Audio Lab loads the whole sound into memory, which can make this device slow down or the page crash. Tip: trim the clip on the timeline first and use \u201CUse selected clip\u201D. Load it anyway?').then(function(ok){
      if(ok){ bypass=true; try{ F.dispatchEvent(new Event('change',{bubbles:true})); }finally{ bypass=false; } }
      else { try{ F.value=''; }catch(x){} var N=document.getElementById('aln'); if(N) N.textContent='Not loaded \u2014 the file was too large. Choose a smaller file or a trimmed clip.'; }
    });
  },true);
}catch(e){ try{ console.warn('Audio Lab fix 10',e); }catch(_){} }})();

;
/* ==================== Script 1009 id="amiyo-al-v2-s11-not-audio" ==================== */
/* Audio Lab fix 11: choosing a picture, PDF or text file said it "may be damaged", which sends people looking for a problem that is not there. A file that is clearly not sound or video now says so plainly. Real audio/video files keep the existing messages. */
(function(){try{
  var F=document.getElementById('alf'), N=document.getElementById('aln'); if(!F||!N) return;
  var EXT=/\.(wav|wave|mp3|mp2|ogg|oga|opus|flac|m4a|m4b|aac|aif|aiff|aifc|wma|amr|caf|mka|mp4|m4v|mov|webm|mkv|avi|3gp|3g2|ts|mts|m2ts|mpg|mpeg|wmv|flv|ogv)$/i;
  new MutationObserver(function(){
    var t=N.textContent||''; if(!/^Could not read \u201C/.test(t)) return;
    var f=F.files&&F.files[0]; if(!f) return;
    var ty=(f.type||'').toLowerCase(), isMedia=/^(audio|video)\//.test(ty)||EXT.test(f.name);
    if(isMedia||(ty==='' )) return;
    var kind=/^image\//.test(ty)?'a picture':/pdf/.test(ty)?'a PDF':/^text\//.test(ty)?'a text file':'not an audio or video file';
    N.textContent='\u201C'+f.name+'\u201D is '+kind+(kind.indexOf('not')===0?'':' \u2014 not sound')+'. Choose an audio or video file (WAV, MP3, OGG, FLAC, M4A, MP4\u2026).';
  }).observe(N,{childList:true,characterData:true,subtree:true});
}catch(e){ try{ console.warn('Audio Lab fix 11',e); }catch(_){} }})();

;
/* ==================== Script 1010 id="amiyo-al-v2-s12-ab-switch" ==================== */
/* Audio Lab fix 12: ticking "Preview original (A/B)" while a preview was playing did nothing audible - it kept playing the old version until you pressed Stop and Preview again. Now toggling A/B while playing restarts the preview with the version you chose. */
(function(){try{
  var A=document.getElementById('alo'), P=document.getElementById('alpl'); if(!A||!P) return;
  A.addEventListener('change',function(){
    if(!/^\u25A0/.test((P.textContent||'').trim())) return;
    P.click(); setTimeout(function(){ P.click(); },60);
  });
}catch(e){ try{ console.warn('Audio Lab fix 12',e); }catch(_){} }})();

;
/* ==================== Script 1011 id="amiyo-al-v2-s13-announce" ==================== */
/* Audio Lab fix 13: screen readers heard nothing when Audio Lab finished, failed or exported, and the waveform / frequency pictures had no description. Status messages are now announced through a hidden live region - but progress percentages are NOT read out one by one (that would be dozens of interruptions); a long job says "Working" once, then the result. The two pictures get a short description. */
(function(){try{
  var M=document.getElementById('alm'), N=document.getElementById('aln'); if(!M||!N) return;
  var sr=document.createElement('div'); sr.id='alsrlive'; sr.setAttribute('role','status'); sr.setAttribute('aria-live','polite'); sr.setAttribute('aria-atomic','true');
  sr.style.cssText='position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0';
  M.insertBefore(sr,M.firstChild);
  var last='', working=false, tm=null;
  function say(t){ if(t===last) return; last=t; sr.textContent=''; setTimeout(function(){ sr.textContent=t; },40); }
  new MutationObserver(function(){
    var t=(N.textContent||'').replace(/\s+/g,' ').trim(); if(!t) return;
    var prog=/\d+\s*%|^(Processing|Reducing|Applying|Reading|Analys|Measuring)[^.]*\u2026\s*$/.test(t);
    if(prog){ if(!working){ working=true; say('Working\u2026'); } return; }
    working=false; clearTimeout(tm); tm=setTimeout(function(){ say(t.slice(0,200)); },250);
  }).observe(N,{childList:true,characterData:true,subtree:true});
  var d={alc:'Waveform of the loaded sound. Use the trim handles or the Start here and End here buttons to choose a part.',alsp:'Frequency graph from 20 hertz to 20 kilohertz. Grey is the original, orange is the processed sound.'};
  Object.keys(d).forEach(function(i){ var c=document.getElementById(i); if(c){ c.setAttribute('role','img'); c.setAttribute('aria-label',d[i]); } });
}catch(e){ try{ console.warn('Audio Lab fix 13',e); }catch(_){} }})();

;
/* ==================== Script 1012 id="amiyo-al-x01-healthcheck" ==================== */
/* Audio Lab step 1: Health check button. Finds duplicate ids, sliders outside their range, missing browser features, and lists errors that happened while Audio Lab was open (earlier steps swallowed them silently). Also fixes the duplicate id that stopped Pause remover from ever turning on. */
(function(){try{
var LOG=[];
function note(m){try{LOG.push((new Date()).toTimeString().slice(0,8)+' '+String(m).slice(0,160));if(LOG.length>30)LOG.shift()}catch(e){}}
window.addEventListener('error',function(e){var M=document.getElementById('alm');if(M&&M.style.display==='block')note(e.message||'error')});
window.addEventListener('unhandledrejection',function(e){var M=document.getElementById('alm');if(M&&M.style.display==='block')note('Promise: '+((e.reason&&e.reason.message)||e.reason||'rejected'))});
function build(){
 var M=document.getElementById('alm');if(!M||document.getElementById('alhcb'))return;
 var b=document.createElement('button');b.type='button';b.id='alhcb';b.textContent='🩺 Health check';b.setAttribute('aria-expanded','false');
 var p=document.createElement('div');p.id='alhc';p.setAttribute('role','region');p.setAttribute('aria-label','Audio Lab health check');p.style.cssText='display:none;margin:8px 0;padding:10px;border:1px solid #3a352c;border-radius:10px;background:#141210;font-size:13px;line-height:1.5';
 var hd=M.querySelector('.alhd');
 if(hd){hd.appendChild(b);hd.insertAdjacentElement('afterend',p)}else{M.insertBefore(p,M.firstChild);M.insertBefore(b,M.firstChild)}
 b.addEventListener('click',function(){
  if(p.style.display==='block'){p.style.display='none';b.setAttribute('aria-expanded','false');return}
  var r=[],bad=0;function add(ok,t){r.push((ok?'✅ ':'⚠️ ')+t);if(!ok)bad++}
  var ids={};[].forEach.call(M.querySelectorAll('[id]'),function(e){ids[e.id]=(ids[e.id]||0)+1});
  var d=Object.keys(ids).filter(function(k){return ids[k]>1});
  add(!d.length,d.length?'Duplicate control ids: '+d.join(', '):'All '+Object.keys(ids).length+' controls have unique ids');
  var sl=[].slice.call(M.querySelectorAll('input[type=range]')),o=sl.filter(function(e){return +e.value<+e.min||+e.value>+e.max}).map(function(e){return e.id||'?'});
  add(!o.length,o.length?'Sliders outside their range: '+o.join(', '):sl.length+' sliders are inside their range');
  var nl=sl.filter(function(e){var l=e.previousElementSibling;return !(e.getAttribute('aria-label')||(l&&l.tagName==='LABEL')||e.closest('label'))}).map(function(e){return e.id||'?'});
  add(!nl.length,nl.length?'Sliders without a label: '+nl.join(', '):'Every slider has a label');
  var sel=M.querySelector('#alsr');add(!!sel&&sel.tagName==='SELECT','Pause remover control is reachable');
  var lv=document.querySelectorAll('#alsrlive').length;add(lv===1,'Screen-reader message area present ('+lv+')');
  var f={AudioContext:window.AudioContext||window.webkitAudioContext,OfflineAudioContext:window.OfflineAudioContext||window.webkitOfflineAudioContext,'Background threads':window.Worker,'File saving':window.Blob&&window.URL&&URL.createObjectURL};
  Object.keys(f).forEach(function(k){add(!!f[k],k+(f[k]?' available':' NOT available in this browser'))});
  var ls=true;try{localStorage.setItem('__alhc','1');localStorage.removeItem('__alhc')}catch(e){ls=false}add(ls,ls?'Saving presets in this browser works':'Browser storage is blocked, so My presets cannot be saved');
  add(!LOG.length,LOG.length?LOG.length+' error(s) while Audio Lab was open:':'No errors logged while Audio Lab was open');
  var h='<b>'+(bad?bad+' thing(s) need attention':'All checks passed')+'</b><br>'+r.join('<br>');
  if(LOG.length)h+='<br><small style="color:#b9b2a2">'+LOG.slice(-8).map(function(x){return x.replace(/</g,'&lt;')}).join('<br>')+'</small>';
  p.innerHTML=h;p.style.display='block';b.setAttribute('aria-expanded','true');
  var n=document.getElementById('aln');if(n)n.textContent=bad?'Health check: '+bad+' thing(s) need attention.':'Health check: all good.';
 });
}
build();document.addEventListener('DOMContentLoaded',build);setTimeout(build,800);
}catch(e){}})();

;
/* ==================== Script 1013 id="amiyo-al-x02-a11y" ==================== */
/* Audio Lab step 2: accessibility. The window gets a name for screen readers, Tab / Shift+Tab stay inside it (no wandering into the editor behind), focus moves in when it opens and returns to the Audio Lab button when it closes, and every graph gets a text name. */
(function(){try{
function setup(){
 var M=document.getElementById('alm');if(!M||M.__x02)return;M.__x02=1;
 var h=M.querySelector('h2');if(h){if(!h.id)h.id='alh2';if(!M.getAttribute('aria-label')&&!M.getAttribute('aria-labelledby'))M.setAttribute('aria-labelledby',h.id)}
 else if(!M.getAttribute('aria-label'))M.setAttribute('aria-label','Audio Lab');
 function nameGraphs(){[].forEach.call(M.querySelectorAll('canvas'),function(c){
  if(c.getAttribute('aria-label')||c.getAttribute('aria-hidden'))return;
  var t='',d=c.closest('details'),sm=d&&d.querySelector('summary span'),pl=c.previousElementSibling;
  if(sm)t=sm.textContent;else if(pl&&pl.tagName==='LABEL')t=pl.textContent;
  t=(t||'Audio').replace(/\s*[:(].*$/,'').trim();
  c.setAttribute('role','img');c.setAttribute('aria-label','Graph: '+t)})}
 nameGraphs();
 var F='a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])';
 function foc(){return[].filter.call(M.querySelectorAll(F),function(e){return e.offsetParent!==null||e===document.activeElement})}
 M.addEventListener('keydown',function(e){
  if(e.key!=='Tab'||e.ctrlKey||e.altKey||e.metaKey)return;
  var l=foc();if(!l.length){e.preventDefault();M.focus();return}
  var a=document.activeElement,first=l[0],last=l[l.length-1];
  if(!M.contains(a)||a===M){e.preventDefault();(e.shiftKey?last:first).focus();return}
  if(e.shiftKey&&a===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&a===last){e.preventDefault();first.focus()}
 });
 var was=M.style.display==='block';
 new MutationObserver(function(){
  var now=M.style.display==='block';if(now===was)return;was=now;
  if(now){nameGraphs();setTimeout(function(){try{var b=M.querySelector('.alzone button,.alhd button,button');(b||M).focus({preventScroll:true})}catch(e){}},60)}
  else{var b=document.getElementById('alb'),a=document.activeElement;if(b&&(!a||a===document.body||M.contains(a)))try{b.focus({preventScroll:true})}catch(e){}}
 }).observe(M,{attributes:true,attributeFilter:['style']});
 var b=document.getElementById('alb');if(b){b.setAttribute('aria-haspopup','dialog')}
}
setup();document.addEventListener('DOMContentLoaded',setup);setTimeout(setup,900);
}catch(e){}})();

;
/* ==================== Script 1014 id="amiyo-al-x03-search" ==================== */
/* Audio Lab step 3: search box. Type part of a control name (for example "noise", "reverb", "pitch", "mp3") and only the matching controls and sections stay visible; sections with a match open by themselves and go back to how they were when you clear the box. Esc clears the box first. */
(function(){try{
function setup(){
 var M=document.getElementById('alm');if(!M||M.__x03)return;var first=M.querySelector('details');if(!first)return;M.__x03=1;
 var st=document.createElement('style');st.textContent='#alm .alx3{margin:8px 0}#alm .alx3 input{width:100%;box-sizing:border-box;background:#1d1b17;color:#f1ece2;border:1px solid #3a352c;border-radius:8px;padding:10px;font-size:15px;min-height:42px}#alm .alx3 small{display:block;margin-top:4px;color:#b9b2a2}#alm .alx3hide{display:none!important}';document.head.appendChild(st);
 var w=document.createElement('div');w.className='alx3';w.innerHTML='<input type="search" id="alsq" placeholder="🔍 Find a control (noise, reverb, pitch, mp3…)" aria-label="Find a control" autocomplete="off" enterkeyhint="search"><small id="alsqn" role="status" aria-live="polite"></small>';
 first.parentNode.insertBefore(w,first);
 var q=w.querySelector('input'),note=w.querySelector('small'),hidden=[],opened=[],tm=null;
 function txt(e){var t=e.textContent||'';if(e.tagName==='SELECT'){t=[].map.call(e.options,function(o){return o.text}).join(' ')}return t.toLowerCase()}
 function groups(body){var out=[],cur=[];[].forEach.call(body.children,function(c){if(c.tagName==='LABEL'&&cur.length){out.push(cur);cur=[]}cur.push(c)});if(cur.length)out.push(cur);return out}
 function gtxt(g){var t='';g.forEach(function(e){t+=' '+txt(e)+' '+[].map.call(e.querySelectorAll('button,label,select,summary'),txt).join(' ')});return t}
 function clear(){hidden.forEach(function(e){e.classList.remove('alx3hide')});hidden=[];opened.forEach(function(p){p[0].open=p[1]});opened=[]}
 function run(){
  clear();var v=q.value.trim().toLowerCase();if(!v){note.textContent='';return}
  var words=v.split(/\s+/),total=0;
  function hit(t){return words.every(function(x){return t.indexOf(x)>=0})}
  [].forEach.call(M.querySelectorAll('details'),function(d){
   var title=(d.querySelector('summary')||{textContent:''}).textContent.toLowerCase(),secHit=hit(title),n=0,kids=[];
   [].forEach.call(d.children,function(c){if(c.tagName!=='SUMMARY')kids.push(c)});
   kids.forEach(function(body){
    var gs=groups(body);
    gs.forEach(function(g){var m=secHit||hit(gtxt(g));if(m)n++;else g.forEach(function(e){e.classList.add('alx3hide');hidden.push(e)})});
   });
   if(!n&&!secHit){d.classList.add('alx3hide');hidden.push(d)}
   else{total+=n||1;if(!d.open){opened.push([d,false]);d.open=true}}
  });
  note.textContent=total?total+' match'+(total>1?'es':''):'No control matches “'+q.value.trim()+'”';
 }
 q.addEventListener('input',function(){clearTimeout(tm);tm=setTimeout(run,120)});
 q.addEventListener('keydown',function(e){if(e.key==='Escape'&&q.value){e.stopPropagation();e.preventDefault();q.value='';run()}else if(e.key==='Enter'){e.preventDefault();q.blur()}},true);
}
setup();document.addEventListener('DOMContentLoaded',setup);setTimeout(setup,1000);setTimeout(setup,2500);
}catch(e){}})();

;
/* ==================== Script 1015 id="amiyo-al-w03-zoom-keys" ==================== */
/* Step 3: keyboard for the waveform view - + / = zoom in, - zoom out, F fit, Z zoom to selection, Left/Right scroll the zoomed view. Only while the Audio Lab is open and no field/slider/button is focused. */
(function(){try{
document.addEventListener('keydown',function(e){
 var M=document.getElementById('alm');if(!M||M.style.display!=='block'||e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey)return;
 var t=e.target||{},tg=t.tagName;if(tg==='TEXTAREA'||tg==='SELECT'||tg==='BUTTON'||(tg==='INPUT'&&t.type!=='checkbox'))return;
 var k=e.key,id=null;
 if(k==='+'||k==='=')id='alzi1';else if(k==='-'||k==='_')id='alzo1';else if(k==='f'||k==='F')id='alzf';else if(k==='z'||k==='Z')id='alzs';
 else if(k==='ArrowLeft')id='alzl';else if(k==='ArrowRight')id='alzr';
 if(!id)return;var b=document.getElementById(id);if(!b)return;e.preventDefault();b.click();
},false);
}catch(x){try{console.warn('Audio Lab step 3',x)}catch(_){}}})();

;
/* ==================== Script 1016 id="amiyo-al-w04-seek-keys" ==================== */
/* Step 4: playback keyboard - "," back 1 s, "." forward 1 s (Shift = 5 s), Home = back to the selection start. Uses the Audio Lab's own seek. */
(function(){try{
function dur(){var m=/\/ (\d+):(\d\d(?:\.\d)?)/.exec(document.getElementById('alm').innerText);return m?+m[1]*60+ +m[2]:0}
function go(sec){var A=window.__alplay,d=dur();if(!A||!d)return;A.seek(Math.max(0,Math.min(1,sec/d)))}
document.addEventListener('keydown',function(e){
 var M=document.getElementById('alm');if(!M||M.style.display!=='block'||e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey)return;
 var t=e.target||{},tg=t.tagName;if(tg==='TEXTAREA'||tg==='SELECT'||tg==='BUTTON'||(tg==='INPUT'&&t.type!=='checkbox'&&t.type!=='range'))return;
 var A=window.__alplay,d=dur();if(!A||!d)return;var cur=A.pos()*d,k=e.key;
 if(k===','||k==='<'){e.preventDefault();go(cur-(e.shiftKey?5:1))}
 else if(k==='.'||k==='>'){e.preventDefault();go(cur+(e.shiftKey?5:1))}
 else if(k==='Home'&&tg!=='INPUT'){e.preventDefault();var s=document.getElementById('als');A.seek(s?(+s.value)/100:0)}
},false);
}catch(x){try{console.warn('Audio Lab step 4',x)}catch(_){}}})();

;
/* ==================== Script 1017 id="amiyo-al-w05-auto-process" ==================== */
/* Step 5: if settings changed since the last Process, Export WAV / Replace selected clip / Add to timeline now process first (instead of silently using the old result), then carry on. */
(function(){try{
var ids=['ald','alrp','alad'],busy=false;
function stale(){var e=document.getElementById('alstale');return !!e&&e.style.display!=='none'}
ids.forEach(function(id){var b=document.getElementById(id);if(!b)return;
 b.addEventListener('click',function(ev){
  if(busy||!ev.isTrusted&&!ev.__w5&&false)return;
  if(!stale())return;
  ev.stopImmediatePropagation();ev.preventDefault();
  var R=document.getElementById('alr'),N=document.getElementById('aln');if(!R)return;
  busy=true;var t0=Date.now(),old=N?N.textContent:'';if(N)N.textContent='Applying your new settings first…';
  R.click();
  (function wait(){ if(stale()&&Date.now()-t0<180000){setTimeout(wait,250);return}
   setTimeout(function(){busy=false;b.click()},150)})();
 },true)});
}catch(x){try{console.warn('Audio Lab step 5',x)}catch(_){}}})();

;
/* ==================== Script 1018 id="amiyo-al-y01-groups-js" ==================== */
/* Audio Lab step 1: the 30 sections were in the order they were added over time. They are now grouped: Basics (everyday tools) first, then Voice, then Advanced, with a small heading for each group. Nothing is removed; search and every control work as before. */
(function(){try{
var G=[['Basics',[/Clean-up \(noise/,/Level, fade & trim/,/Tone \(3-band/,/Dynamics/,/Pitch & speed/,/Loudness, limiter & export/]],
['Voice',[/Voice effects/,/De-plosive/,/De-reverb/,/Vocal remover/,/Pitch correction/]],['Advanced',[]]];
function run(){var M=document.getElementById('alm');if(!M)return;var ds=[].filter.call(M.children,function(c){return c.tagName==='DETAILS'});if(ds.length<5)return;
if(M.__y01n===ds.length&&M.__y01)return;
[].forEach.call(M.querySelectorAll('.aly-h'),function(h){h.remove()});
var buckets=G.map(function(){return[]});
ds.forEach(function(d){var t=(d.querySelector('summary')||{textContent:''}).textContent,k=G.length-1;
 for(var i=0;i<G.length-1&&k===G.length-1;i++){G[i][1].forEach(function(r){if(r.test(t))k=i})}buckets[k].push(d)});
var anchor=ds[0].previousElementSibling||null,ref=anchor?anchor.nextSibling:ds[0];
var last=ds[ds.length-1],after=last.nextSibling;
G.forEach(function(g,i){if(!buckets[i].length)return;var h=document.createElement('div');h.className='aly-h';h.setAttribute('role','heading');h.setAttribute('aria-level','3');h.textContent=g[0];M.insertBefore(h,after);buckets[i].forEach(function(d){M.insertBefore(d,after)})});
M.__y01=1;M.__y01n=ds.length;
}
[300,1500,3200].forEach(function(t){setTimeout(run,t)});document.addEventListener('DOMContentLoaded',run);
}catch(e){try{console.warn('Audio Lab step 1',e)}catch(_){}}})();

;
/* ==================== Script 1019 id="amiyo-al-y02-merge-noise-level" ==================== */
/* Audio Lab step 2: overlapping sections are merged. "Noise, hum & clicks" now lives inside "Clean-up", and "Leveling & silence" inside "Level, fade & trim". Controls are moved, not rebuilt, so they keep working exactly as before. */
(function(){try{
window.__alNest=function(a,B,host,ref){if(!a||!B||a===B||a.classList.contains('aly-nest'))return false;a.classList.add('aly-nest');a.open=true;(host||B).insertBefore(a,ref||null);if(!B.__alNT){B.__alNT=[];B.addEventListener('toggle',function(){if(B.open)B.__alNT.forEach(function(n){try{n.open=true;n.dispatchEvent(new Event('toggle'))}catch(x){}})})}B.__alNT.push(a);return true};
var ns=document.createElement('style');ns.id='amiyo-al-y02-nest-css';ns.textContent='#alm details.aly-nest{border:0!important;margin:0!important;background:none!important}#alm details.aly-nest>summary{display:none!important}#alm details.aly-nest>.aly-reset{display:none!important}';document.head.appendChild(ns);
function find(M,re){return[].filter.call(M.querySelectorAll('details'),function(d){var s=d.querySelector('summary');return s&&re.test(s.textContent)})[0]}
function merge(M,from,to,title){var a=find(M,from),b=find(M,to);if(!a||!b||a===b||a.classList.contains('aly-nest'))return false;
 window.__alNest(a,b);
 var sp=b.querySelector('summary span');if(sp)sp.textContent=title;else b.querySelector('summary').firstChild.textContent=title;
 return true}
function run(){var M=document.getElementById('alm');if(!M)return;
 merge(M,/Noise, hum & clicks/,/Clean-up \(noise/,'🧹 Clean-up (noise, hum, clicks, gate)');
 merge(M,/Leveling & silence/,/Level, fade & trim/,'🔊 Level, fade & trim (+ silence)')}
[400,1800,3500].forEach(function(t){setTimeout(run,t)});document.addEventListener('DOMContentLoaded',run);
}catch(e){try{console.warn('Audio Lab step 2',e)}catch(_){}}})();

;
/* ==================== Script 1020 id="amiyo-al-y03-merge-eq" ==================== */
/* Audio Lab step 3: one EQ section. The 6-band parametric EQ now sits under the simple 3-band tone controls (same controls, moved not rebuilt), with a small heading between them. */
(function(){try{
function find(M,re){return[].filter.call(M.querySelectorAll('details'),function(d){var s=d.querySelector('summary');return s&&re.test(s.textContent)})[0]}
function run(){var M=document.getElementById('alm');if(!M)return;var a=find(M,/Parametric EQ/),b=find(M,/Tone \(3-band/);if(!a||!b||a===b||a.classList.contains('aly-nest'))return;
 var h=document.createElement('div');h.className='aly-sub';h.textContent='Fine control: 6-band parametric EQ';b.appendChild(h);
 window.__alNest(a,b);
 b.querySelector('summary span').textContent='🎛 Tone (3-band EQ + 6-band parametric)';
 window.dispatchEvent(new Event('resize'))}
var st=document.createElement('style');st.textContent='#alm .aly-sub{margin:14px 0 4px;font:600 12px sans-serif;color:#b9b2a2}';document.head.appendChild(st);
[500,2000,3600].forEach(function(t){setTimeout(run,t)});document.addEventListener('DOMContentLoaded',run);
}catch(e){try{console.warn('Audio Lab step 3',e)}catch(_){}}})();

;
/* ==================== Script 1021 id="amiyo-al-y04-merge-compressor" ==================== */
/* Audio Lab step 4: one compressor section. The attack / release / knee controls now sit right under the compressor threshold, ratio and make-up gain inside "Dynamics (compressor, de-esser, width)". Controls are moved, not rebuilt. */
(function(){try{
function find(M,re){return[].filter.call(M.querySelectorAll('details'),function(d){var s=d.querySelector('summary');return s&&re.test(s.textContent)})[0]}
function run(){var M=document.getElementById('alm');if(!M)return;var a=find(M,/Compressor — attack/),b=find(M,/Dynamics & stereo/);if(!a||!b||a===b||a.classList.contains('aly-nest'))return;
 var mk=b.querySelector('#alcm'),h=document.createElement('div');h.className='aly-sub';h.textContent='Compressor fine control: attack, release, knee';
 var ref=mk||b.querySelector('#alcr'),host=ref?ref.parentNode:b;
 var after=ref?ref.nextSibling:null;
 host.insertBefore(h,after);window.__alNest(a,b,host,h.nextSibling);
 b.querySelector('summary span').textContent='🎚 Dynamics (compressor, de-esser, width)'}
var st=document.createElement('style');st.textContent='#alm .aly-sub{margin:14px 0 4px;font:600 12px sans-serif;color:#b9b2a2}';if(!document.getElementById('amiyo-al-y03-merge-eq'))document.head.appendChild(st);
[600,2200,3800].forEach(function(t){setTimeout(run,t)});document.addEventListener('DOMContentLoaded',run);
}catch(e){try{console.warn('Audio Lab step 4',e)}catch(_){}}})();

;
/* ==================== Script 1022 id="amiyo-al-y05-remember-open" ==================== */
/* Audio Lab step 5: remembers which sections you left open. Open or close a section and the choice is saved on this device; next time Audio Lab starts, the same sections are open again. Sections that were opened only by the search box are not saved. If saving is blocked (private mode), everything still works, it just starts fresh. */
(function(){try{
var KEY='amiyo-al-open-v1',ready=false;
function M(){return document.getElementById('alm')}
function title(d){var s=d.querySelector('summary'),sp=s&&s.querySelector('span');return s?(sp||s).textContent.replace(/\s+/g,' ').trim():''}
function all(){var m=M();return m?[].slice.call(m.querySelectorAll('details:not(.aly-nest)')):[]}
function load(){try{var v=JSON.parse(localStorage.getItem(KEY)||'null');return v&&typeof v==='object'&&!Array.isArray(v)?v:null}catch(e){return null}}
function save(){if(!ready)return;try{var q=document.getElementById('alsq');if(q&&q.value.trim())return;var o={};all().forEach(function(d){o[title(d)]=d.open?1:0});localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}}
function restore(){var s=load();if(s){all().forEach(function(d){var t=title(d);if(t in s)d.open=!!s[t]})}ready=true}
function hook(){var m=M();if(!m||m.__y05)return;m.__y05=1;m.addEventListener('toggle',save,true)}
function boot(){hook();if(!ready&&all().length>=15)restore()}
/* wait until steps 2-4 have finished merging sections so the saved names match */
[300,1000,2500,4200,4800].forEach(function(t){setTimeout(boot,t)});document.addEventListener('DOMContentLoaded',boot);
setTimeout(function(){hook();if(!ready){restore()}},6000);
}catch(e){try{console.warn('Audio Lab step 5',e)}catch(_){}}})();

;
/* ==================== Script 1023 id="amiyo-al-y06-changed-badge" ==================== */
/* Audio Lab step 6: every section shows a small "changed" tag in its title bar when any of its sliders, menus or tick boxes is different from the starting value. Move a control back and the tag goes away. Presets, resets and the Reset all button are noticed too. The tag is drawn by CSS, so search and saved section names are not affected. */
(function(){try{
var st=document.createElement('style');st.id='amiyo-al-y06-css';
st.textContent='#alm details[data-chg="1"]>summary>span::after{content:"changed";display:inline-block;margin-left:8px;padding:1px 7px;border-radius:9px;background:#ff7a3d;color:#111;font:700 10px sans-serif;letter-spacing:.04em;text-transform:uppercase;vertical-align:middle}';
document.head.appendChild(st);
var tm=null,iv=null;
function M(){return document.getElementById('alm')}
function ctl(e){if(e.hasAttribute&&e.hasAttribute('data-e'))return false;var t=(e.type||'').toLowerCase();if(t==='hidden')return /^eqb\d$/.test(e.id);if(e.tagName==='SELECT')return true;if(e.tagName!=='INPUT')return false;return t==='range'||t==='checkbox'||t==='number'}
function val(e){return e.type==='checkbox'?(e.checked?'1':'0'):String(e.value)}
function check(){var m=M();if(!m)return;
 [].forEach.call(m.querySelectorAll('details:not(.aly-nest)'),function(d){var n=0;
  [].forEach.call(d.querySelectorAll('input,select'),function(e){if(!ctl(e)||e.id==='alsq')return;
   if(e.__y06===undefined){e.__y06=val(e);return}
   if(val(e)!==e.__y06)n++});
  var on=n>0?'1':'';if((d.getAttribute('data-chg')||'')!==on){if(on){d.setAttribute('data-chg','1');d.setAttribute('data-chg-n',n);var s=d.querySelector('summary');if(s)s.setAttribute('title','Changed from default ('+n+')')}else{d.removeAttribute('data-chg');d.removeAttribute('data-chg-n');var s2=d.querySelector('summary');if(s2)s2.removeAttribute('title')}}
 })}
function soon(){clearTimeout(tm);tm=setTimeout(check,60)}
function hook(){var m=M();if(!m||m.__y06)return;m.__y06=1;
 ['input','change','click','keyup'].forEach(function(t){m.addEventListener(t,soon,true)});
 check();
 /* slow safety check for changes made by other scripts (presets, resets, loading a file) */
 iv=setInterval(function(){if(m.style.display==='block')check()},1500)}
function boot(){hook();check()}
[200,900,2400,4500].forEach(function(t){setTimeout(boot,t)});document.addEventListener('DOMContentLoaded',boot);
window.__alChangedCheck=check;
}catch(e){try{console.warn('Audio Lab step 6',e)}catch(_){}}})();

;
/* ==================== Script 1024 id="amiyo-al-y07-section-reset" ==================== */
/* Audio Lab step 7: each section gets a "Reset this section" button at the top of its body. It appears only while something in that section is changed (next to the orange "changed" tag), and puts just that section's sliders, menus and tick boxes back to their starting values. Other sections are left alone. The live preview and value labels update as if you had moved the controls yourself. */
(function(){try{
var st=document.createElement('style');
st.textContent='#alm details>.aly-reset{display:none;margin:8px 0 4px}#alm details[data-chg="1"]>.aly-reset{display:block}#alm .aly-reset button{width:100%;min-height:42px;background:#26221c;color:#ffb48c;border:1px solid #5a4636;border-radius:8px;font:600 14px sans-serif;cursor:pointer}#alm .aly-reset button:active{background:#3a2c20}';
document.head.appendChild(st);
function M(){return document.getElementById('alm')}
function ctl(e){if(e.hasAttribute&&e.hasAttribute('data-e'))return false;var t=(e.type||'').toLowerCase();if(t==='hidden')return /^eqb\d$/.test(e.id);if(e.tagName==='SELECT')return true;if(e.tagName!=='INPUT')return false;return t==='range'||t==='checkbox'||t==='number'}
function val(e){return e.type==='checkbox'?(e.checked?'1':'0'):String(e.value)}
function name(d){var s=d.querySelector('summary'),sp=s&&s.querySelector('span');return((sp||s)||{textContent:''}).textContent.replace(/\s+/g,' ').trim()}
function fire(e,t){e.dispatchEvent(new Event(t,{bubbles:true}))}
function reset(d){
 if(window.__alChangedCheck)window.__alChangedCheck();
 var n=0;
 [].forEach.call(d.querySelectorAll('input,select'),function(e){
  if(!ctl(e)||e.id==='alsq'||e.__y06===undefined||val(e)===e.__y06)return;
  if(e.type==='checkbox')e.checked=e.__y06==='1';else e.value=e.__y06;
  n++;fire(e,'input');fire(e,'change')});
 if(window.__alChangedCheck)window.__alChangedCheck();
 var note=document.getElementById('aln');if(note)note.textContent='Reset: '+name(d)+' ('+n+' control'+(n===1?'':'s')+' back to default).';
 return n}
function ensure(){var m=M();if(!m)return;
 [].forEach.call(m.querySelectorAll('details:not(.aly-nest)'),function(d){
  var all=d.querySelectorAll(':scope>.aly-reset');
  for(var i=1;i<all.length;i++)all[i].remove();
  if(all.length)return;
  var s=d.querySelector('summary');if(!s)return;
  var w=document.createElement('div');w.className='aly-reset';
  var b=document.createElement('button');b.type='button';b.textContent='↺ Reset this section';b.setAttribute('aria-label','Reset this section to default');
  b.addEventListener('click',function(ev){ev.stopPropagation();reset(d)});
  w.appendChild(b);d.insertBefore(w,s.nextSibling)})}
[1000,2600,4700,5200,7000].forEach(function(t){setTimeout(ensure,t)});document.addEventListener('DOMContentLoaded',ensure);
var m0=0;setInterval(function(){var m=M();if(m&&m.style.display==='block')ensure()},2500);
window.__alResetSection=reset;
}catch(e){try{console.warn('Audio Lab step 7',e)}catch(_){}}})();

;
/* ==================== Script 1025 id="amiyo-al-y08-remember-settings" ==================== */
/* Audio Lab step 8: remembers your last settings. Every slider, menu and tick box is saved on this device as you change it, and put back the next time Audio Lab starts (a short note says how many were restored). File-specific things are not saved: trim handles, the chosen file, record devices, the search box and the A/B / loop switches. The "Fresh start" button in the header forgets the saved settings and returns every control to its starting value. If saving is blocked (private mode) everything still works, it just starts fresh. */
(function(){try{
var KEY='amiyo-al-settings-v1',SKIP=/^(alf|alib|alsq|als|ale|alo|allp|alps|alpif|aljf|aldkf|rcd|rcn|rcc|alxb)$/,restoring=true,tm=null,done=false;
function M(){return document.getElementById('alm')}
function ok(e){if(!e||!e.id||SKIP.test(e.id)||(e.hasAttribute&&e.hasAttribute('data-e')))return false;var t=(e.type||'').toLowerCase();if(t==='hidden')return /^eqb\d$/.test(e.id);if(e.tagName==='SELECT')return true;if(e.tagName!=='INPUT')return false;return t==='range'||t==='checkbox'||t==='number'}
function val(e){return e.type==='checkbox'?(e.checked?'1':'0'):String(e.value)}
function ctls(){var m=M();return m?[].filter.call(m.querySelectorAll('input,select'),ok):[]}
function fire(e){e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))}
function on(){var r=document.getElementById('alrem');return !r||r.checked}
function save(){if(restoring||!done||!on())return;try{var o={};ctls().forEach(function(e){o[e.id]=val(e)});localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}}
function soon(){clearTimeout(tm);tm=setTimeout(save,400)}
function load(){try{var v=JSON.parse(localStorage.getItem(KEY)||'null');return v&&typeof v==='object'&&!Array.isArray(v)?v:null}catch(e){return null}}
function note(t){var n=document.getElementById('aln');if(n)n.textContent=t}
function restore(){var s=on()?load():null,n=0;
 if(s){var order=ctls();
  order.forEach(function(e){if(!(e.id in s))return;var v=String(s[e.id]);
   if(e.tagName==='SELECT'){var has=[].some.call(e.options,function(o){return o.value===v});if(!has)return}
   if(val(e)===v)return;
   if(e.type==='checkbox')e.checked=(v==='1');else e.value=v;
   n++;fire(e)});
  try{window.dispatchEvent(new Event('resize'))}catch(x){}
  if(window.__alChangedCheck)setTimeout(window.__alChangedCheck,100)}
 restoring=false;done=true;
 if(n)note('Your last settings were restored ('+n+' control'+(n===1?'':'s')+'). Use Fresh start to clear them.')}
function fresh(){restoring=true;var n=0;
 try{localStorage.removeItem(KEY);localStorage.removeItem('amiyoAlSettings')}catch(e){}
 ctls().forEach(function(e){var b=e.__y08d;if(b===undefined||val(e)===b)return;if(e.type==='checkbox')e.checked=(b==='1');else e.value=b;n++;fire(e)});
 try{window.dispatchEvent(new Event('resize'))}catch(x){}
 if(window.__alChangedCheck)setTimeout(window.__alChangedCheck,100);
 restoring=false;note('Fresh start: saved settings cleared ('+n+' control'+(n===1?'':'s')+' back to default).')}
function addBtn(){var m=M(),hd=m&&m.querySelector('.alhd');if(!hd||hd.querySelector('#aly-fresh'))return;
 var b=document.createElement('button');b.type='button';b.id='aly-fresh';b.textContent='↺ Fresh start';b.title='Forget saved settings and reset every control';b.setAttribute('aria-label','Fresh start: forget saved settings');
 b.style.cssText='margin-left:8px;min-height:36px;padding:0 10px;background:#26221c;color:#ffb48c;border:1px solid #5a4636;border-radius:8px;font:600 12px sans-serif;cursor:pointer';
 b.addEventListener('click',fresh);var x=hd.querySelector('button');hd.insertBefore(b,x||null)}
function hook(){var m=M();if(!m||m.__y08)return;m.__y08=1;['input','change'].forEach(function(t){m.addEventListener(t,soon,true)})}
function snap(){ctls().forEach(function(e){if(e.__y08d===undefined)e.__y08d=val(e)})}
var tries=0;function boot(){hook();addBtn();if(done)return;tries++;
 var m=M();if(!m)return;
 /* wait until the merged sections and late-added sections exist, then record defaults and restore once */
 if(m.querySelectorAll('details').length>=26&&m.querySelector('#eqb1')&&m.querySelector('.aly-nest')||tries>12){snap();restore()}}
[600,2000,4000,6500,7500,9000,11000].forEach(function(t){setTimeout(boot,t)});document.addEventListener('DOMContentLoaded',boot);
setInterval(function(){hook();addBtn();if(done)snap()},3000);
window.__alSaveSettings=save;
}catch(e){try{console.warn('Audio Lab step 8',e)}catch(_){}}})();

;
/* ==================== Script 1026 id="amiyo-al-y09-export-names" ==================== */
/* Audio Lab step 9: export names follow the source file. "My Podcast.wav" exports as "My Podcast-edited-24bit.wav", "My Podcast-edited-192k.mp3", "My Podcast-edited.webm" and "My Podcast-regions.zip". Fixes: (1) after a waveform edit (crop, delete, paste...) or a join, Audio Lab feeds the audio back to itself under an internal name (edit.wav, joined.wav) and the exports were then named "edit-edited..."; the source name is now kept. (2) "song-edited.wav" opened again no longer becomes "song-edited-edited". (3) "Export all regions" is named after the source. (4) Names that Windows or phones refuse (CON, trailing dots, over-long, unsafe characters) are made safe. */
(function(){try{
var M=document.getElementById('alm');if(!M||M.getAttribute('data-y09'))return;M.setAttribute('data-y09','1');
var INTERNAL=/^(edit|joined|before-join|before-[a-z-]+)\.wav$/i,RESERVED=/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
var prev='audio';
function cur(){return window.__alBase?window.__alBase():'audio'}
function setB(n){if(window.__alSetBase)window.__alSetBase(n)}
function strip(n){return String(n||'').replace(/(?:[-_ ]edited)+$/i,'').trim()||'audio'}
/* keep the last real source name current when the timeline-clip path sets it */
var os=window.__alSetBase;
if(os&&!os.__y09){window.__alSetBase=function(n){os(n);var b=strip(cur());if(b!==cur())os(b);prev=cur()};window.__alSetBase.__y09=1}
var f=M.querySelector('#alf');
if(f)f.addEventListener('change',function(){var x=this.files&&this.files[0];if(!x)return;
 if(INTERNAL.test(x.name||'')){setB(prev);return}   /* internal re-feed: keep the source name */
 var b=strip(cur());if(b!==cur())setB(b);prev=cur()});
/* final tidy of any Audio Lab download name */
function safe(d){var m=/^(.*?)(\.[A-Za-z0-9]{1,5})?$/.exec(d)||[d,d,''],stem=m[1],ext=m[2]||'';
 stem=stem.replace(/[\\\/:*?"<>|\u0000-\u001f]+/g,'').replace(/[. ]+$/,'').replace(/^[. ]+/,'');
 var parts=stem.split('-edited'),head=parts[0];if(RESERVED.test(head)){stem='_'+stem}
 if(stem.length>90)stem=stem.slice(0,90).replace(/[. ]+$/,'');
 return(stem||'audio')+ext}
document.addEventListener('click',function(e){var a=e.target;if(!a||a.tagName!=='A')return;var d=a.download||'';if(!d)return;
 if(d==='audio-regions.zip'){a.download=safe(cur()+'-regions.zip');return}
 if(/^.+-edited(-.+)?\.\w+$/.test(d)&&!/\.json$/i.test(d)&&/^(?!audio-lab-)/.test(d)&&d.indexOf(cur()+'-edited')===0)a.download=safe(d)},true);
window.__alExportName=function(kind){return safe(cur()+'-edited'+(kind?'-'+kind:''))};
}catch(e){try{console.warn('Audio Lab step 9',e)}catch(_){}}})();

;
/* ==================== Script 1027 id="amiyo-al-y10-mp3-fallback" ==================== */
/* Audio Lab step 10: MP3 export no longer depends on the internet. The MP3 encoder (lamejs) is built into this file; it is now started in the background a few seconds after Audio Lab opens, so the first MP3 export is instant and works offline. If the built-in copy is blocked AND the online copy can't be downloaded, Audio Lab no longer just says "Export failed": it saves a 16-bit WAV of the same processed audio instead and says so, then puts your export format menu back. */
(function(){try{
var busyFb=false;
function warm(){try{if(window.lamejs)return;var el=document.getElementById('amiyo-lame-src');if(el&&el.textContent.length>1000){var s=document.createElement('script');s.text=el.textContent;document.head.appendChild(s);s.remove()}}catch(e){}}
[2500,6000].forEach(function(t){setTimeout(warm,t)});
function hook(){var n=document.getElementById('aln'),x=document.getElementById('alx'),b=document.getElementById('ald');if(!n||!x||!b||n.__y10)return;n.__y10=1;
 var last=x.value;x.addEventListener('change',function(){if(!busyFb)last=x.value},true);
 new MutationObserver(function(){
  if(busyFb)return;var t=n.textContent||'';
  if(/^Export failed:.*MP3 encoder/i.test(t)&&/^mp3/.test(x.value)){
   busyFb=true;var orig=x.value;
   setTimeout(function(){
    x.value='16';x.dispatchEvent(new Event('change',{bubbles:true}));
    n.textContent='MP3 encoder unavailable (offline and blocked). Saving a 16-bit WAV instead…';
    b.click();
    setTimeout(function(){x.value=orig;x.dispatchEvent(new Event('change',{bubbles:true}));busyFb=false;
     if(/^Exported WAV/.test(n.textContent))n.textContent=n.textContent+' (saved as WAV because the MP3 encoder could not start.)'},3000)},50)}
 }).observe(n,{childList:true,characterData:true,subtree:true})}
[1500,4000,7000,10000].forEach(function(t){setTimeout(hook,t)});setInterval(hook,4000);
window.__alWarmMp3=warm;
}catch(e){try{console.warn('Audio Lab step 10',e)}catch(_){}}})();

;
/* ==================== Script 1028 id="amiyo-al-y11-progress-cancel" ==================== */
/* Audio Lab step 11: progress bar and Cancel everywhere. Process already had a bar with step count, time left and Cancel (Esc works too); this step checks it and adds what was missing: (1) exporting MP3 or OGG now shows the same bar with a percentage and a Cancel button, and Esc cancels it; before, a long export could not be stopped. (2) The bar is announced to screen readers (progressbar role) and Cancel is a big 44 px touch target on phones. (3) Cancel says "Cancelled." and nothing can finish late afterwards. WebM export records in real time, so it keeps its own percentage message but cannot be cancelled. */
(function(){try{
var st=document.createElement('style');st.textContent='#alpgx{min-height:44px;min-width:96px;font-weight:600;cursor:pointer}';document.head.appendChild(st);
var exporting=false;
function g(i){return document.getElementById(i)}
function hook(){var n=g('aln'),pg=g('alpg'),x=g('alpgx'),b=g('alpgb'),d=g('ald');if(!n||!pg||!x||!b||!d||n.__y11)return;n.__y11=1;
 pg.setAttribute('role','progressbar');pg.setAttribute('aria-label','Audio Lab progress');pg.setAttribute('aria-valuemin','0');pg.setAttribute('aria-valuemax','100');
 new MutationObserver(function(){var w=parseInt(b.style.width,10);if(!isNaN(w))pg.setAttribute('aria-valuenow',w)}).observe(b,{attributes:true,attributeFilter:['style']});
 function endExp(){if(!exporting)return;exporting=false;pg.style.display='none'}
 new MutationObserver(function(){var t=n.textContent||'',m=t.match(/^Encoding (MP3|OGG)… (\d+)%/);
  if(m){exporting=true;window.__alExpCancel=window.__alExpCancel||false;pg.style.display='block';b.style.width=Math.max(3,+m[2])+'%';g('alpgt').textContent='Exporting '+m[1]+' · '+m[2]+'%';return}
  if(/^(Exported|Export failed|Export cancelled\.)/.test(t))window.__alExpCancel=false;
  if(exporting&&/^(Exported|Export failed|Export cancelled|Press|Saving|MP3 encoder unavailable)/.test(t))endExp()}).observe(n,{childList:true,characterData:true,subtree:true});
 x.addEventListener('click',function(){if(exporting){window.__alExpCancel=true;n.textContent='Cancelling export…'}});
 document.addEventListener('keydown',function(e){if(exporting&&e.key==='Escape'&&g('alm').style.display==='block'){e.stopImmediatePropagation();window.__alExpCancel=true;n.textContent='Cancelling export…'}},true)}
[1500,4000,7000,10000].forEach(function(t){setTimeout(hook,t)});setInterval(hook,4000);
}catch(e){try{console.warn('Audio Lab step 11',e)}catch(_){}}})();

;
/* ==================== Script 1029 id="amiyo-al-y12-ab-button" ==================== */
/* Audio Lab step 12: an A/B button right next to Preview. One tap switches between A (your original file) and B (the processed sound); while it is playing the sound switches at the same spot in the track, so you hear the difference without starting over. If nothing is playing, the tap also starts the preview. The button always shows what you are hearing, and stays in step with the old "Preview original (A/B)" tick box, undo and presets. Without a processed result (press Process, or switch on Live preview) it explains why B is not available instead of silently playing the original. Shortcut: B. */
(function(){try{
var st=document.createElement('style');st.textContent='#alm #aly-ab{min-height:44px!important;min-width:104px;font-weight:700;cursor:pointer;border-radius:8px;border:1px solid #5a4636;background:#26221c;color:#f1ece2}#alm #aly-ab[data-v="A"]{background:#502f1f;border-color:#ed6826;color:#ffdfcf}#alm #aly-ab[data-v="B"]{background:#3a2a14;border-color:#ff7a3d;color:#ffd7bd}';document.head.appendChild(st);
function g(i){return document.getElementById(i)}
function can(){var s=(window.__alst&&window.__alst())||{},live=!!(g('alive')&&g('alive').checked);return !!(s.out||live)}
function say(t){var n=g('aln');if(n)n.textContent=t}
function sync(){var b=g('aly-ab'),o=g('alo');if(!b||!o)return;var A=o.checked;b.setAttribute('data-v',A?'A':'B');b.setAttribute('aria-pressed',A?'false':'true');b.textContent=A?'🅰 Original':'🅱 Processed';b.title='Switch between original (A) and processed (B). Shortcut: B'}
function toggle(){var o=g('alo'),p=g('alpl');if(!o)return;
 if(o.checked&&!can()){say('B needs a processed result: press ⚡ Process first, or switch on Live preview.');sync();return}
 var playing=p&&/^\u25A0/.test((p.textContent||'').trim());
 o.checked=!o.checked;o.dispatchEvent(new Event('input',{bubbles:true}));o.dispatchEvent(new Event('change',{bubbles:true}));
 sync();say(o.checked?'Listening to A: original.':'Listening to B: processed.');
 if(!playing&&p)setTimeout(function(){if(!/^\u25A0/.test((p.textContent||'').trim()))p.click()},30)}
function add(){var p=g('alpl');if(!p||g('aly-ab')){sync();return}
 var b=document.createElement('button');b.type='button';b.id='aly-ab';b.addEventListener('click',toggle);p.parentNode.insertBefore(b,p.nextSibling);sync()}
document.addEventListener('keydown',function(e){var m=g('alm');if(!m||m.style.display!=='block')return;if(e.ctrlKey||e.metaKey||e.altKey)return;if(e.key!=='b'&&e.key!=='B')return;
 var t=e.target,tn=t&&t.tagName;if(tn==='TEXTAREA'||(tn==='INPUT'&&/^(text|search|number|email|url)$/i.test(t.type||'text'))||(tn==='SELECT'))return;
 e.preventDefault();e.stopImmediatePropagation();toggle()},true);
[1000,3000,6000,9000].forEach(function(t){setTimeout(add,t)});
setInterval(function(){add()},2500);
document.addEventListener('change',function(e){if(e.target&&e.target.id==='alo')sync()},true);
}catch(e){try{console.warn('Audio Lab step 12',e)}catch(_){}}})();

;
/* ==================== Script 1030 id="amiyo-al-y13-zoom-touch-hint" ==================== */
/* Audio Lab step 13: waveform zoom on phones. Two fingers now zoom AND move together (the spot between your fingers stays under them), double-tap the waveform to zoom in (double-tap again when zoomed in far to fit the whole file), the selection handles are easier to grab with a finger, buttons are 44 px, and the zoom strip is taller on touch screens. A one-line hint shows on touch devices. */
(function(){try{
function add(){var i=document.getElementById('alzi');if(!i||document.getElementById('aly-zh'))return;if(!(window.matchMedia&&matchMedia('(pointer:coarse)').matches))return;
 var h=document.createElement('div');h.id='aly-zh';h.className='alrd';h.style.cssText='font-size:12px;color:#8f8878;margin-top:2px';h.textContent='Touch: pinch to zoom, move two fingers to scroll, double-tap to zoom in, drag the orange handles to trim.';i.parentNode.insertBefore(h,i.nextSibling)}
[1500,4000,8000].forEach(function(t){setTimeout(add,t)});
}catch(e){try{console.warn('Audio Lab step 13',e)}catch(_){}}})();

;
/* ==================== Script 1031 id="amiyo-al-y14-undo-history" ==================== */
/* Audio Lab step 14: undo history list. The 🕘 button in the header opens a list of everything you changed, newest first, each with a plain description ("Pitch: 0 → 3"), the time, and a mark on the step you are at. Tap any step to jump straight there (steps after it stay available as "undone" until you make a new change). Works with Ctrl+Z / Ctrl+Y and the ↶ ↷ buttons. Holds the last 100 steps. Esc closes the list. Also on phones the title bar now puts the title on its own line so the header buttons no longer squash it. */
(function(){try{
var st=document.createElement('style');st.textContent='@media (max-width:560px){#alm .alhd{flex-wrap:wrap;gap:6px}#alm .alhd h2{flex:1 1 100%;font-size:17px;margin:0}}#aly-hist{display:none;position:fixed;left:0;right:0;bottom:0;max-height:72vh;z-index:99998;background:#1d1b17;color:#f1ece2;border-top:2px solid #ff7a3d;border-radius:14px 14px 0 0;box-shadow:0 -8px 30px rgba(0,0,0,.5);font:14px sans-serif}#aly-hist .hh{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:1px solid #3a352c;position:sticky;top:0;background:#1d1b17}#aly-hist .hl{overflow:auto;max-height:calc(72vh - 56px);padding:6px 8px 16px}#aly-hist .hr{display:flex;width:100%;min-height:44px;align-items:center;gap:8px;text-align:left;background:#26221c;color:#f1ece2;border:1px solid #3a352c;border-radius:8px;margin:4px 0;padding:6px 10px;font:14px sans-serif;cursor:pointer}#aly-hist .hr .n{min-width:26px;color:#8f8878}#aly-hist .hr .d{flex:1}#aly-hist .hr .t{color:#8f8878;font-size:12px}#aly-hist .hr.cur{border-color:#ff7a3d;background:#3a2a14}#aly-hist .hr.fut{opacity:.55;font-style:italic}';document.head.appendChild(st);
function g(i){return document.getElementById(i)}
var P=document.createElement('div');P.id='aly-hist';P.setAttribute('role','dialog');P.setAttribute('aria-label','Undo history');
P.innerHTML='<div class="hh"><b>🕘 History</b><span><button type="button" id="aly-hx" style="min-height:44px;min-width:44px;background:#2a2620;color:#f1ece2;border:0;border-radius:8px;font-size:16px">✕</button></span></div><div class="hl" id="aly-hl"></div>';document.body.appendChild(P);
function tm(t){var d=new Date(t);return('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+':'+('0'+d.getSeconds()).slice(-2)}
function esc(t){return String(t).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
function render(){var l=g('aly-hl'),H=window.__alHist&&window.__alHist.get();if(!l||!H)return;var h='';
 for(var i=H.d.length-1;i>=0;i--){h+='<button type="button" class="hr'+(i===H.ix?' cur':'')+(i>H.ix?' fut':'')+'" data-i="'+i+'"'+(i===H.ix?' aria-current="step"':'')+'><span class="n">'+i+'</span><span class="d">'+esc(H.d[i])+(i===H.ix?'  ← you are here':(i>H.ix?'  (undone)':''))+'</span><span class="t">'+tm(H.t[i])+'</span></button>'}
 l.innerHTML=h}
function show(o){P.style.display=o?'block':'none';if(o)render()}
window.__alHistChanged=function(){if(P.style.display==='block')render()};
P.addEventListener('click',function(e){if(e.target.id==='aly-hx'){show(0);return}var b=e.target.closest&&e.target.closest('.hr');if(b&&window.__alHist){window.__alHist.jump(+b.getAttribute('data-i'));setTimeout(render,450)}});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&P.style.display==='block'){e.stopImmediatePropagation();e.preventDefault();show(0)}},true);
function addBtn(){var w=g('alre')&&g('alre').parentNode;if(!w||g('aly-hb'))return;var b=document.createElement('button');b.type='button';b.id='aly-hb';b.textContent='🕘';b.title='Undo history';b.setAttribute('aria-label','Undo history list');b.style.cssText='background:#2a2620;color:#f1ece2;border:0;border-radius:8px;padding:6px 10px;font:600 14px sans-serif;margin-right:6px;cursor:pointer;min-height:36px';b.onclick=function(){show(P.style.display!=='block')};w.insertBefore(b,g('alhp')||null)}
[1000,3000,6000].forEach(function(t){setTimeout(addBtn,t)});setInterval(addBtn,3000);
var q=g('alq');document.addEventListener('click',function(e){if(e.target&&e.target.id==='alq')show(0)},true);
}catch(e){try{console.warn('Audio Lab step 14',e)}catch(_){}}})();

;
/* ==================== Script 1032 id="amiyo-al-y15-presets" ==================== */
/* Audio Lab step 15: preset save / load, finished. Next to the existing Save / Delete / Export / Import buttons there are now: ✏ Rename (pick one of your presets, type the new name in the box, tap ✏), 🔄 Update (overwrite the picked preset with what is on screen now), 📤 Share one (export only the picked preset as a small .json file). Importing no longer overwrites a preset of yours that has the same name: the new one is added as "Name (2)". Import checks the file first (not JSON, wrong shape, over 2 MB, more than 100 presets) and says what was wrong in plain words. A small line under the preset box shows whether the picked preset still matches the controls or how many are different. Nothing is stored except the same list as before (this browser only). */
(function(){try{
var KEY='amiyoAlUserPresets',MAXP=100,BAD={'__proto__':1,'constructor':1,'prototype':1};
var NOSAVE={alf:1,alib:1,alps:1,alpn:1,alpif:1,als:1,ale:1,alsq:1,rcd:1,aljf:1,aldkf:1,alrem:1,alfast:1,alive:1,alo:1,allp:1,alzz:1,alsc:1,alsw:1,alsd:1};
function $(i){return document.getElementById(i)}
function M(){return $('alm')}
function say(t){var n=$('aln');if(n)n.textContent=t}
function load(){try{var v=JSON.parse(localStorage.getItem(KEY)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}catch(e){return{}}}
function store(u){try{localStorage.setItem(KEY,JSON.stringify(u));return true}catch(e){return false}}
function cleanName(s){return String(s==null?'':s).replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,40)}
function cur(){var s=$('alps');return s&&s.value.slice(0,2)==='u:'?s.value.slice(2):null}
function refresh(pick){var s=$('alps');if(!s)return;var ks=Object.keys(load()),g=s.querySelector('optgroup[label="My presets"]');
 if(!ks.length){if(g)g.parentNode.removeChild(g)}
 else{if(!g){g=document.createElement('optgroup');g.label='My presets';s.appendChild(g)}
  g.textContent='';ks.forEach(function(k){var o=document.createElement('option');o.value='u:'+k;o.textContent='\u2B50 '+k;g.appendChild(o)})}
 s.value=pick||'';if(s.value!==(pick||''))s.value=''; drift()}
function prim(v){return typeof v==='boolean'||(typeof v==='number'&&isFinite(v))||(typeof v==='string'&&v.length<=60)}
function flat(o,max){var r={},n=0,k;if(!o||typeof o!=='object'||Array.isArray(o))return null;
 for(k in o){if(!Object.prototype.hasOwnProperty.call(o,k)||BAD[k]||!/^[A-Za-z0-9_]{1,24}$/.test(k)||!prim(o[k]))continue;if(++n>max)break;r[k]=o[k]}return n?r:null}
function sanitize(s){var c=flat(s,60)||{},all=s&&typeof s==='object'?flat(s.all,400):null;if(s&&s.all&&!all)all=null;if(all)c.all=all;return Object.keys(c).length?c:null}
function dl(name,obj){var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(obj,null,1)],{type:'application/json'}));a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){a.remove()},500)}
/* ---- buttons ---- */
function rename(){var old=cur();if(!old){say('Pick one of your presets (\u2B50) first, type the new name in the box, then tap \u270F.');return}
 var n=cleanName($('alpn').value),u=load();
 if(!n||n===old){say('Type a new name in the box first (it is \u201C'+old+'\u201D now), then tap \u270F.');return}
 if(BAD[n]||Object.prototype.hasOwnProperty.call(u,n)){say('A preset called \u201C'+n+'\u201D already exists. Pick another name.');return}
 var o={};Object.keys(u).forEach(function(k){o[k===old?n:k]=u[k]});
 if(!store(o)){say('Could not rename (browser storage is blocked).');return}
 refresh('u:'+n);say('Renamed \u201C'+old+'\u201D to \u201C'+n+'\u201D.')}
function update(){var old=cur();if(!old){say('Pick one of your presets (\u2B50) first, then tap \uD83D\uDD04 to overwrite it with the current settings.');return}
 var inp=$('alpn');inp.value=old;var sv=$('alpsv');if(sv)sv.click()}
function shareOne(){var old=cur();if(!old){say('Pick one of your presets (\u2B50) first, then tap \uD83D\uDCE4 to export just that one.');return}
 var u=load(),o={};if(!u[old]){say('That preset is no longer saved.');return}o[old]=u[old];
 var safe=old.replace(/[^\w\-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40)||'preset';dl('audio-lab-preset-'+safe+'.json',o);say('Exported \u201C'+old+'\u201D as audio-lab-preset-'+safe+'.json.')}
function importFile(e){var inp=e.target;e.stopImmediatePropagation();var f=inp.files&&inp.files[0];if(!f)return;
 if(f.size>2000000){say('That file is over 2 MB, too big to be a presets file. Pick a file made with the \u2B07 export button.');inp.value='';return}
 f.text().then(function(t){var d;try{d=JSON.parse(t)}catch(x){say('That file is not valid JSON, so it cannot be a presets file. Pick a file made with the \u2B07 or \uD83D\uDCE4 button.');return}
  if(!d||typeof d!=='object'||Array.isArray(d)){say('That file does not look like Audio Lab presets (it should be a list of named presets).');return}
  var u=load(),added=0,renamed=0,skipped=0,full=0,last=null;
  Object.keys(d).forEach(function(k){var nm=cleanName(k),c=sanitize(d[k]);
   if(!nm||BAD[nm]||!c){skipped++;return}
   if(Object.keys(u).length>=MAXP){full++;return}
   if(Object.prototype.hasOwnProperty.call(u,nm)){var b=nm.slice(0,34),i=2;nm=b+' ('+i+')';while(Object.prototype.hasOwnProperty.call(u,nm)){i++;nm=b+' ('+i+')'}renamed++}
   u[nm]=c;added++;last=nm});
  if(!added){say(full?'Not imported: you already have '+MAXP+' presets. Delete some first.':'Nothing imported: no usable presets were found in that file.');return}
  if(!store(u)){say('Could not save the imported presets (browser storage is blocked).');return}
  refresh(last?'u:'+last:'');
  say('Imported '+added+' preset'+(added===1?'':'s')+(renamed?' ('+renamed+' got a \u201C(2)\u201D style name because that name was already in use)':'')+(skipped?'; '+skipped+' skipped as unusable':'')+(full?'; '+full+' not added because the limit of '+MAXP+' was reached':'')+'.')
 }).catch(function(){say('Could not read that file.')}).then(function(){inp.value=''})}
/* ---- "still matches?" line ---- */
function eligible(el){if(!el||!el.id||NOSAVE[el.id]||(el.hasAttribute&&el.hasAttribute('data-e'))||/^(rc|al8)/.test(el.id))return false;var t=(el.type||'').toLowerCase();return t==='range'||t==='checkbox'||t==='number'||el.tagName==='SELECT'||(t==='hidden'&&/^eqb\d$/.test(el.id))}
function same(el,v){var t=(el.type||'').toLowerCase();if(t==='checkbox')return (el.checked?1:0)===(+v?1:0);if(t==='hidden'||el.tagName==='SELECT')return String(el.value)===String(v);var x=+v;if(!isFinite(x))return true;if(el.min!==''&&x<+el.min)x=+el.min;if(el.max!==''&&x>+el.max)x=+el.max;return Math.abs(+el.value-x)<1e-6}
function drift(){var L=$('aly-pm');if(!L)return;var old=cur(),m=M(),p=old&&load()[old];
 if(!p||!p.all||!m){L.textContent='';L.style.display='none';return}
 var n=0,k,all=p.all;for(k in all){if(!Object.prototype.hasOwnProperty.call(all,k))continue;var el=m.querySelector('#'+k);if(!eligible(el))continue;if(!same(el,all[k]))n++}
 L.style.display='block';L.style.color=n?'#ffb48c':'#9fd8a8';L.textContent=n?'\u25CF '+n+' control'+(n===1?'':'s')+' differ from \u201C'+old+'\u201D. Tap \uD83D\uDD04 to save the changes into it.':'\u2713 Matches \u201C'+old+'\u201D.'}
var tm=null;function soon(d){clearTimeout(tm);tm=setTimeout(drift,d||250)}
/* ---- build UI ---- */
function build(){var row=$('alpr');if(!row||$('alpren'))return;
 function mk(id,txt,title,fn){var b=document.createElement('button');b.type='button';b.id=id;b.textContent=txt;b.title=title;b.setAttribute('aria-label',title);b.addEventListener('click',fn);return b}
 var ex=$('alpex');
 row.insertBefore(mk('alpren','\u270F','Rename the selected preset (type the new name in the box first)',rename),ex);
 row.insertBefore(mk('alpupd','\uD83D\uDD04','Update the selected preset with the current settings',update),ex);
 row.insertBefore(mk('alpex1','\uD83D\uDCE4','Export only the selected preset',shareOne),ex);
 if(ex)ex.title='Export all my presets';
 var L=document.createElement('div');L.id='aly-pm';L.setAttribute('aria-live','polite');L.style.cssText='display:none;font:12px sans-serif;margin:4px 0 8px';row.parentNode.insertBefore(L,row.nextSibling);
 var f=$('alpif');if(f)f.addEventListener('change',importFile,true);
 var s=$('alps');if(s)s.addEventListener('change',function(){soon(300);setTimeout(drift,1200)});
 var sv=$('alpsv');if(sv)sv.addEventListener('click',function(){setTimeout(drift,80)});var dl2=$('alpdl');if(dl2)dl2.addEventListener('click',function(){setTimeout(drift,120)});
 var m=M();if(m)['input','change'].forEach(function(t){m.addEventListener(t,function(){soon(300)},true)});
 drift()}
[300,1500,4000,8000].forEach(function(t){setTimeout(build,t)});document.addEventListener('DOMContentLoaded',build);build();
window.__alPresets={load:load,refresh:refresh,drift:drift};
}catch(e){try{console.warn('Audio Lab step 15',e)}catch(_){}}})();

;
/* ==================== Script 1033 id="amiyo-al-y16-batch" ==================== */
/* Audio Lab step 16: batch process several files. Open "Batch process" (above the Process button), choose up to 20 audio files, and press Start. Each file is loaded, processed with the settings on screen right now (the same as pressing Process) and exported in the format chosen under Export, one after another. All results are bundled into one ZIP named audio-batch-results.zip, named after each source file ("name-edited-24bit.wav"). A list shows each file's state (waiting, working, done, failed with the reason). A file that cannot be read or fails is skipped and the rest continue. Cancel stops after stopping the current step. Trim handles are per file, so each file is processed in full. The last file stays open in Audio Lab when the batch ends. */
(function(){try{
var MAX=20,TIMEOUT=600000,running=false,cancel=false,cap=null;
function $(i){return document.getElementById(i)}
function M(){return $('alm')}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
function txt(){var n=$('aln');return n?n.textContent||'':''}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
/* capture the downloads the normal Export button makes while a batch runs */
document.addEventListener('click',function(e){var a=e.target;if(!cap||!a||a.tagName!=='A'||!a.download)return;
 e.preventDefault();e.stopImmediatePropagation();cap.push({name:a.download,href:a.href})},true);
async function until(fn,ms,step){var t0=Date.now();while(Date.now()-t0<ms){if(cancel)return 'cancel';var r=fn();if(r)return r;await sleep(step||120)}return 'timeout'}
var CRC=null;function crc32(u){if(!CRC){CRC=new Uint32Array(256);for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;CRC[n]=c>>>0}}var c2=0xFFFFFFFF;for(var i=0;i<u.length;i++)c2=CRC[(c2^u[i])&255]^(c2>>>8);return(c2^0xFFFFFFFF)>>>0}
function zip(files){var enc=new TextEncoder(),parts=[],cd=[],off=0,now=new Date();
 var dt=((now.getFullYear()-1980)<<9|(now.getMonth()+1)<<5|now.getDate())&0xFFFF,tm=(now.getHours()<<11|now.getMinutes()<<5|(now.getSeconds()>>1))&0xFFFF;
 files.forEach(function(f){var nm=enc.encode(f.name),d=f.data,c=crc32(d),h=new DataView(new ArrayBuffer(30));
  h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(8,0,true);h.setUint16(10,tm,true);h.setUint16(12,dt,true);h.setUint32(14,c,true);h.setUint32(18,d.length,true);h.setUint32(22,d.length,true);h.setUint16(26,nm.length,true);h.setUint16(28,0,true);
  parts.push(h.buffer,nm,d);
  var e=new DataView(new ArrayBuffer(46));e.setUint32(0,0x02014b50,true);e.setUint16(4,20,true);e.setUint16(6,20,true);e.setUint16(8,0x0800,true);e.setUint16(10,0,true);e.setUint16(12,tm,true);e.setUint16(14,dt,true);e.setUint32(16,c,true);e.setUint32(20,d.length,true);e.setUint32(24,d.length,true);e.setUint16(28,nm.length,true);e.setUint32(42,off,true);
  cd.push(e.buffer,nm);off+=30+nm.length+d.length});
 var cs=0;cd.forEach(function(x){cs+=x.byteLength||x.length});
 var end=new DataView(new ArrayBuffer(22));end.setUint32(0,0x06054b50,true);end.setUint16(8,files.length,true);end.setUint16(10,files.length,true);end.setUint32(12,cs,true);end.setUint32(16,off,true);
 return new Blob(parts.concat(cd,[end.buffer]),{type:'application/zip'})}
function setRow(i,cls,t){var r=$('aly-bl')&&$('aly-bl').children[i];if(!r)return;r.setAttribute('data-s',cls);r.querySelector('.s').textContent=t}
function summary(t){var s=$('aly-bs');if(s)s.textContent=t}
async function loadFile(f){var dt=new DataTransfer();dt.items.add(f);var inp=$('alf'),prev=txt();inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));
 var t0=Date.now();var r=await until(function(){var t=txt();if(Date.now()-t0<400&&t===prev)return null;if(/\d+ ch, \d+ Hz/.test(t))return 'ok';if(/^(Could not read|Nothing)|is empty|has no sound|cannot decode/i.test(t))return 'fail'},60000);
 return r==='ok'?null:(r==='cancel'?'cancel':(r==='timeout'?'Timed out while reading the file.':txt()))}
async function runOne(f,i,n){
 setRow(i,'work','Reading…');var e=await loadFile(f);if(e)return e;
 if(cancel)return 'cancel';
 setRow(i,'work','Processing…');$('alr').click();
 var r=await until(function(){var t=txt();if(/^Done/.test(t))return 'ok';if(/cancel/i.test(t)&&!/Cancelling export/.test(t))return 'cancel';if(/^(Process failed|Could not|Nothing to|Press Open|Open an audio|Failed|Error)/i.test(t)||/ failed/i.test(t))return 'fail'},TIMEOUT,200);
 if(r==='cancel'){var px=$('alpgx');if(px&&px.offsetParent)px.click();return 'cancel'}
 if(r==='timeout')return 'Processing took longer than 10 minutes.';
 if(r==='fail')return txt();
 setRow(i,'work','Exporting…');cap=[];$('ald').click();
 var x=await until(function(){if(cap.length)return 'ok';var t=txt();if(/^(Export failed|Export cancelled)/.test(t)||/MP3 encoder unavailable/.test(t))return 'fail'},TIMEOUT,200);
 var got=cap;cap=null;
 if(x==='cancel'){window.__alExpCancel=true;return 'cancel'}
 if(x!=='ok')return x==='timeout'?'Export took longer than 10 minutes.':txt();
 var c=got[0],buf=await (await fetch(c.href)).arrayBuffer();
 return {name:c.name,data:new Uint8Array(buf)}}
async function start(){if(running)return;var inp=$('aly-bf'),files=[].slice.call(inp.files||[]);
 if(!files.length){summary('Choose some audio files first.');return}
 if(files.length>MAX){summary('Please choose '+MAX+' files or fewer at a time (you picked '+files.length+').');return}
 var tot=files.reduce(function(a,f){return a+f.size},0);if(tot>800e6){summary('These files add up to more than 800 MB. Run them in smaller groups so the browser does not run out of memory.');return}
 running=true;cancel=false;$('aly-bgo').disabled=true;$('aly-bx').disabled=false;inp.disabled=true;
 var out=[],used={},fails=0,done=0,keep=window.__alSetBase?null:null;
 for(var i=0;i<files.length;i++){if(cancel)break;summary('File '+(i+1)+' of '+files.length+': '+files[i].name);
  var r;try{r=await runOne(files[i],i,files.length)}catch(ex){r='Unexpected problem: '+(ex&&ex.message||ex)}
  if(r==='cancel'){setRow(i,'bad','Cancelled');break}
  if(typeof r==='string'){fails++;setRow(i,'bad','Failed — '+r.slice(0,140));continue}
  var nm=r.name,k=nm,j=2;while(used[k.toLowerCase()]){var m=/^(.*?)(\.[A-Za-z0-9]{1,5})?$/.exec(nm);k=m[1]+' ('+j+')'+(m[2]||'');j++}
  used[k.toLowerCase()]=1;r.name=k;out.push(r);done++;setRow(i,'ok','Done — '+k)}
 var wasC=cancel;cap=null;running=false;$('aly-bgo').disabled=false;$('aly-bx').disabled=true;inp.disabled=false;
 if(out.length){var b=zip(out),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='audio-batch-results.zip';document.body.appendChild(a);a.click();setTimeout(function(){a.remove();URL.revokeObjectURL(a.href)},4000);
  summary((wasC?'Cancelled. ':'Finished. ')+done+' file'+(done===1?'':'s')+' saved in audio-batch-results.zip'+(fails?'; '+fails+' failed (see the list).':'.'))}
 else summary(wasC?'Cancelled. Nothing was saved.':'Nothing could be processed — see the reasons in the list.')}
function build(){var m=M(),pr=$('alr');if(!m||!pr||$('aly-batch'))return;
 var st=document.createElement('style');st.textContent='#aly-batch .bl{margin:8px 0;padding:0;list-style:none;font:13px sans-serif}#aly-batch .bl li{padding:6px 8px;border-bottom:1px solid #3a352c;display:flex;gap:8px;flex-wrap:wrap}#aly-batch .bl .n{flex:1 1 140px;word-break:break-all}#aly-batch .bl .s{flex:1 1 140px;color:#b9b2a2}#aly-batch li[data-s=ok] .s{color:#9fd8a8}#aly-batch li[data-s=bad] .s{color:#ff9a8a}#aly-batch li[data-s=work] .s{color:#ffb48c}#aly-batch button{min-height:44px}';document.head.appendChild(st);
 var d=document.createElement('details');d.id='aly-batch';d.className='aly-nest-b';
 d.innerHTML='<summary><span>📚 Batch process several files</span></summary><div style="padding:8px 0"><p style="font:13px sans-serif;margin:0 0 8px">Uses the settings on screen now and the format chosen under Export. Up to '+MAX+' files. The results arrive together in one ZIP.</p><input type="file" id="aly-bf" accept="audio/*,video/*,.wav,.mp3,.ogg,.flac,.m4a,.aac,.aiff,.opus,.webm" multiple style="max-width:100%"><div class="row" style="display:flex;gap:8px;margin:8px 0"><button type="button" id="aly-bgo">▶ Start batch</button><button type="button" id="aly-bx" disabled>✖ Cancel</button></div><div id="aly-bs" role="status" aria-live="polite" style="font:13px sans-serif"></div><ul class="bl" id="aly-bl"></ul></div>';
 var row=pr.closest('.row')||pr.parentNode;row.parentNode.insertBefore(d,row);
 $('aly-bf').addEventListener('change',function(){var fs=[].slice.call(this.files||[]);$('aly-bl').innerHTML=fs.map(function(f){return'<li data-s="wait"><span class="n">'+esc(f.name)+'</span><span class="s">Waiting</span></li>'}).join('');summary(fs.length?fs.length+' file'+(fs.length===1?'':'s')+' ready. Press Start batch.':'')});
 $('aly-bgo').addEventListener('click',start);
 $('aly-bx').addEventListener('click',function(){cancel=true;summary('Cancelling…');var px=$('alpgx');if(px&&px.offsetParent)px.click();window.__alExpCancel=true})}
[400,1500,4000,8000].forEach(function(t){setTimeout(build,t)});document.addEventListener('DOMContentLoaded',build);build();
window.__alBatch={running:function(){return running}};
}catch(e){try{console.warn('Audio Lab step 16',e)}catch(_){}}})();

;
/* ==================== Script 1034 id="amiyo-al-y17-friendly-errors" ==================== */
/* Audio Lab step 17: clearer error messages. Technical errors such as "Processing failed: Array buffer allocation failed" or "Export failed: Cannot read properties of undefined" are now turned into a plain sentence that says what went wrong and what to try ("Processing failed — the browser ran out of memory. Try a shorter file…"). The first words stay the same, so nothing that watches them breaks, and a short "(technical: …)" note is kept at the end for bug reports. Short messages like "Press Process first." also say what to do next. If something fails while the progress bar is showing and no message appears, the bar is closed and a message is shown instead of leaving Audio Lab looking stuck. Your original file is never changed by a failed step. */
(function(){try{
function $(i){return document.getElementById(i)}
var LEAD=/^(Processing failed|Export failed|Reverb failed|Effect preview failed|Pitch correction failed|Pitch\/speed preview failed|Could not apply): ?([\s\S]*)$/;
function why(raw,lead){var r=String(raw||'').toLowerCase(),mp3=/mp3|lame|encoder/.test(r);
 if(/cannot read prop|cannot set prop|is not a function|is not defined|is not iterable|is not a constructor|undefined is not|null is not|reading '/.test(r)&&!/rangeerror|array buffer|allocation/.test(r))return 'something unexpected went wrong inside Audio Lab. Your original file is untouched. Try again; if it repeats, press \u21BA Fresh start or run \uD83E\uDE7A Health check.';
 if(/array buffer|allocation|out of memory|invalid array length|memory|rangeerror|too large/.test(r))return 'the browser ran out of memory. Try a shorter file or selection, close other tabs, or turn off some effects, then try again.';
 if(/quota|storage is full|disk/.test(r))return 'there is not enough free storage on this device. Free some space and try again.';
 if(/failed to fetch|network|load failed|importscripts|script error|offline|err_/.test(r)||(mp3&&/unavailable|load|download/.test(r)))return 'a needed part could not be downloaded (the MP3 encoder needs internet the first time). Check your connection, or export WAV or OGG instead.';
 if(/notallowed|not allowed|user gesture|permission/.test(r))return 'the browser blocked it until you interact with the page. Tap the page once, then try again.';
 if(/decode|encodingerror|not supported|notsupported|unsupported/.test(r))return 'this browser cannot handle that audio format or setting. Try a WAV file, or a different sample rate or format.';
 if(/cancel|abort/.test(r))return 'it was cancelled.';
 if(/undefined|null|is not a function|is not defined|cannot read|typeerror|referenceerror|syntaxerror/.test(r))return 'something unexpected went wrong inside Audio Lab. Your original file is untouched. Try again; if it repeats, press \u21BA Fresh start or run \uD83E\uDE7A Health check.';
 return 'it did not finish. Your original file is untouched. Try again, or undo the last change you made to the settings.'}
var MAP=[
 [/^Choose a file first\.$/,'Choose a file first \u2014 drop one on the box at the top, use the file button, or record from the mic.'],
 [/^Press Process first\.$/,'Press \u26A1 Process first \u2014 nothing has been processed yet.'],
 [/^Open an audio file in Audio Lab first\.$/,'Open an audio file in Audio Lab first \u2014 drop one on the box at the top, choose one with the file button, or record from the mic.'],
 [/^File too short\.$/,'File too short \u2014 this tool needs at least about half a second of audio. Pick a longer file or selection.'],
 [/^Audio too short to detect a key\.$/,'Audio too short to detect a key \u2014 it needs a few seconds of music or voice.'],
 [/^No clear sound found to keep\.$/,'No clear sound found to keep \u2014 the file may be silent, or the threshold is set too high. Lower it and try again.'],
 [/^Could not add the processed audio\.$/,'Could not add the processed audio to the timeline. Press \u26A1 Process first, then try again.'],
 [/^Could not open that library item\.$/,'Could not open that library item. It may have been removed from the media library \u2014 add it again, then retry.'],
 [/^Not loaded \u2014 the file was too large\. Choose a smaller file or a trimmed clip\.$/,'Not loaded \u2014 the file was too large for the browser to hold in memory. Cut it into shorter parts or trim it first, then open it again.']];
var busy=false;
function fix(){var n=$('aln');if(!n||busy)return;var t=n.textContent||'',m,out=null,i;
 if((m=LEAD.exec(t))){var raw=m[2].trim();out=m[1]+' \u2014 '+why(raw,m[1])+(raw&&!/^it was cancelled/.test(why(raw))?' (technical: '+raw.slice(0,90)+')':'')}
 else for(i=0;i<MAP.length;i++)if(MAP[i][0].test(t)){out=MAP[i][1];break}
 if(out&&out!==t){busy=true;n.textContent=out;busy=false}}
function hook(){var n=$('aln');if(!n||n.__y17)return;n.__y17=1;new MutationObserver(fix).observe(n,{childList:true,characterData:true,subtree:true});fix()}
[300,1500,4000].forEach(function(t){setTimeout(hook,t)});setInterval(hook,4000);hook();
/* safety net: an unexpected error while the progress bar is open must not leave Audio Lab looking frozen */
function rescue(reason){var m=$('alm'),pg=$('alpg');if(!m||m.style.display!=='block'||!pg||pg.style.display==='none'||!pg.offsetParent)return;
 var raw=reason&&(reason.message||String(reason))||'';if(/^Cancelled$/i.test(raw))return;
 pg.style.display='none';var n=$('aln');if(n)n.textContent='Processing failed: '+raw}
window.addEventListener('unhandledrejection',function(e){setTimeout(function(){rescue(e.reason)},50)});
window.addEventListener('error',function(e){setTimeout(function(){rescue(e.error||e.message)},50)});
window.__alFriendly=why;
}catch(e){try{console.warn('Audio Lab step 17',e)}catch(_){}}})();

;
/* ==================== Script 1035 id="amiyo-al-y18-long-files" ==================== */
/* Audio Lab step 18: long files. (1) A line under the status text shows how much memory the loaded sound takes and how much Process may need for the part you selected, and how long Process should take (learned from your last run on this device). It appears for files over 10 minutes or whenever the device looks short on memory. (2) If Process would likely need more memory than this device can spare, tapping Process first asks, with the numbers and what to do instead (select a shorter part with the orange handles, switch on Fast mode, close other tabs). Saying yes goes on exactly as before. Batch and automatic runs are never interrupted. (3) After a "ran out of memory" message the line turns red and offers Fast mode. The waveform drawing was checked: it samples at most about 120 points per pixel, so it stays fast for any length. */
(function(){try{
var KEY='amiyo-al-speed-v1',FACTOR=5,bypass=false,oom=false,lastSrc=null,okKey='',t0=0,t0len=0,t0fast=false,hist=null,lastKey='',keyT=0;
function $(i){return document.getElementById(i)}
function S(){return(window.__alst&&window.__alst())||{}}
function mb(x){return x>=1024?(x/1024).toFixed(1)+' GB':Math.round(x)+' MB'}
function dur(s){s=Math.round(s);if(s<60)return s+' s';var m=Math.floor(s/60);if(m<60)return m+' min'+(s%60?' '+(s%60)+' s':'');var h=Math.floor(m/60);return h+' h '+(m%60)+' min'}
/* pure helpers (also used by the self-test) */
function estimate(len,ch,sr,frac){frac=Math.max(0,Math.min(1,isFinite(frac)?frac:1));var held=len*ch*4/1048576,part=held*frac;return{seconds:len/sr,partSeconds:len*frac/sr,heldMB:held,partMB:part,peakMB:part*FACTOR+held}}
function budget(dm,w){if(dm&&dm>0)return dm*1024*.3;return w<=600?500:1500}
function level(peak,bud){return peak>bud?'over':(peak>bud*.5?'heavy':'ok')}
window.__alMem={estimate:estimate,budget:budget,level:level,factor:FACTOR};
try{hist=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){hist=null}
function bud(){return budget(navigator.deviceMemory,window.innerWidth||1024)}
function cur(){var s=S().src;if(!s)return null;var a=+($('als')||{value:0}).value/100,b=+($('ale')||{value:100}).value/100,f=Math.max(0,Math.min(1,Math.abs(b-a)));var mono=$('alm1')&&$('alm1').checked;
 var e=estimate(s.length,s.numberOfChannels,s.sampleRate,f);e.ch=s.numberOfChannels;e.sr=s.sampleRate;e.mono=!!mono;e.lv=level(e.peakMB,bud());e.key=[s.length,s.numberOfChannels,a.toFixed(4),b.toFixed(4)].join();return e}
/* ---- info line ---- */
function box(){var n=$('aln');if(!n)return null;var d=$('aly-long');if(d)return d;d=document.createElement('div');d.id='aly-long';d.setAttribute('aria-live','polite');d.style.cssText='display:none;margin:6px 0;padding:8px 10px;border-radius:8px;font:13px sans-serif;border:1px solid #3a352c;background:#1d1b17;color:#d8d2c4';n.parentNode.insertBefore(d,n.nextSibling);return d}
function render(force){var d=box(),m=$('alm');if(!d||!m||m.style.display!=='block')return;var e=cur();
 if(!e){d.style.display='none';lastKey='';return}
 var fast=!!($('alfast')&&$('alfast').checked),k=e.key+'|'+fast+'|'+oom+'|'+(hist?hist.r:'');if(!force&&k===lastKey)return;lastKey=k;
 var show=e.seconds>=600||e.lv!=='ok'||oom;if(!show){d.style.display='none';return}
 var col=oom||e.lv==='over'?'#ff8a7a':(e.lv==='heavy'?'#ffcf8a':'#9fd8a8');d.style.display='block';d.style.borderColor=col;d.textContent='';
 var p=document.createElement('div');
 var t='Long file: '+dur(e.seconds)+', '+(e.ch===1?'mono':e.ch+' channels')+', '+Math.round(e.sr/100)/10+' kHz. In memory: about '+mb(e.heldMB)+'. Processing '+(e.partSeconds<e.seconds-1?'the selected '+dur(e.partSeconds):'all of it')+' may need up to about '+mb(e.peakMB)+'.';
 if(hist&&hist.r>0&&!!hist.f===fast){t+=' Estimated time: about '+dur(Math.max(1,hist.r*e.partSeconds))+' (from your last run'+(fast?', Fast mode':'')+').'}
 if(oom)t+=' The last run ran out of memory.';
 else if(e.lv==='over')t+=' This device may not have enough memory for that.';
 else if(e.lv==='heavy')t+=' That is a lot for this device; close other tabs first.';
 p.textContent=t;d.appendChild(p);
 if(e.lv!=='ok'||oom){var h=document.createElement('div');h.style.cssText='margin-top:4px;color:#b9b2a2';h.textContent='What helps: drag the orange handles to select a shorter part and process it on its own; switch on Fast mode; turn off effects you do not need.';d.appendChild(h);
  if(!fast&&$('alfast')){var b=document.createElement('button');b.type='button';b.textContent='⚡ Turn on Fast mode';b.style.cssText='margin-top:6px;min-height:44px;padding:0 14px;background:#26221c;color:#ffb48c;border:1px solid #5a4636;border-radius:8px;font:600 14px sans-serif;cursor:pointer';b.addEventListener('click',function(){var c=$('alfast');if(c&&!c.checked){c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}));c.dispatchEvent(new Event('input',{bubbles:true}))}render(true)});d.appendChild(b)}}}
/* ---- ask before a heavy Process ---- */
document.addEventListener('keydown',function(e){if(e.isTrusted&&(e.ctrlKey||e.metaKey)&&e.key==='Enter')keyT=Date.now()},true);
function ask(msg){try{if(typeof window.amiyoOk==='function')return Promise.resolve(window.amiyoOk(msg,{okLabel:'Process anyway'}))}catch(e){}return Promise.resolve(confirm(msg))}
document.addEventListener('click',function(ev){var a=ev.target&&ev.target.closest?ev.target.closest('#alr'):null;if(!a)return;
 var batch=window.__alBatch&&window.__alBatch.running&&window.__alBatch.running();
 var gate=(ev.isTrusted||Date.now()-keyT<150)&&!bypass&&!batch;var e=gate?cur():null;
 if(gate&&e&&e.lv==='over'&&e.key!==okKey){ev.stopImmediatePropagation();ev.preventDefault();
  var msg='Processing '+(e.partSeconds<e.seconds-1?'the selected '+dur(e.partSeconds):'this '+dur(e.seconds)+' file')+' may need up to about '+mb(e.peakMB)+' of memory, and this device may only have about '+mb(bud())+' to spare. The page could slow down or crash. Tip: select a shorter part with the orange handles, or switch on Fast mode. Process anyway?';
  ask(msg).then(function(ok){if(!ok){var n=$('aln');if(n)n.textContent='Not processed. Select a shorter part or switch on Fast mode, then press Process again.';return}okKey=e.key;bypass=true;try{a.click()}finally{bypass=false}});return}
 var c=cur();t0=Date.now();t0len=c?c.partSeconds:0;t0fast=!!($('alfast')&&$('alfast').checked);oom=false},true);
/* ---- learn how fast this device is; notice memory failures ---- */
function hook(){var n=$('aln');if(!n||n.__y18)return;n.__y18=1;
 new MutationObserver(function(){var t=n.textContent||'';
  if(/^Done/.test(t)&&t0&&t0len>5){var el=(Date.now()-t0)/1000,r=el/t0len;t0=0;if(isFinite(r)&&r>0&&r<50){hist={r:r,f:t0fast};try{localStorage.setItem(KEY,JSON.stringify(hist))}catch(x){}render(true)}}
  else if(/ran out of memory/i.test(t)&&!oom){oom=true;t0=0;render(true)}
 }).observe(n,{childList:true,characterData:true,subtree:true})}
['alr','alfast','als','ale','alm1'].forEach(function(i){document.addEventListener('input',function(e){if(e.target&&e.target.id===i)render(false)},true)});
[1000,3000,6000].forEach(function(t){setTimeout(function(){hook();render(true)},t)});
setInterval(function(){hook();var s=S().src;if(s!==lastSrc){lastSrc=s;oom=false;okKey=''}render(false)},1500);
var ob=$('alb');if(ob)ob.addEventListener('click',function(){setTimeout(function(){render(true)},120)});
}catch(e){try{console.warn('Audio Lab step 18',e)}catch(_){}}})();

;
/* ==================== Script 1036 id="amiyo-al-y19-shortcut-help" ==================== */
/* Audio Lab step 19: the keyboard help sheet (? or H) was out of date. It now lists every shortcut that works, in groups: Playback, Selection and editing, Waveform view, Process and export, General. New in the list: B (A/B switch), the zoom keys (+ - F Z and the arrow keys), the seek keys (, . Shift+, Shift+. Home), and what Esc does in each situation. A short touch section covers pinch, two-finger scroll and double-tap. The sheet is announced to screen readers as a dialog, and the Close button gets focus when it opens. Nothing else about the old sheet changes. */
(function(){try{
var G=[
['Playback',[['Space','Play / stop the preview'],['A or B','Switch between A (original) and B (processed) while listening'],['L','Loop the selection'],[', and .','Back / forward 1 second (hold Shift for 5 seconds)'],['Home','Back to the selection start']]],
['Selection and editing',[['I / O','Set trim start / end at the playhead'],['0','Full length (reset trim)'],['M','Add a marker at the playhead'],['Delete','Delete the selected part and close the gap'],['Ctrl+Alt+Z / Ctrl+Alt+Y','Undo / redo a waveform edit (crop, delete, paste, reverse…)']]],
['Waveform view',[['+ and −','Zoom in / out'],['F','Fit the whole file'],['Z','Zoom to the selection'],['← and →','Scroll the zoomed view'],['V','Switch waveform ⇄ spectrogram']]],
['Process and export',[['Ctrl+Enter','⚡ Process'],['Ctrl+S','Export'],['Esc','While Process or an export is running: cancel it']]],
['General',[['Ctrl+Z','Undo a control change (the 🕘 button lists them all)'],['Ctrl+Shift+Z / Ctrl+Y','Redo'],['? or H','Open or close this help'],['Esc','Close the history list or this help; if neither is open, close Audio Lab']]]];
var TOUCH=[['Pinch','Zoom the waveform'],['Two fingers','Move to scroll the zoomed waveform'],['Double-tap','Zoom in (again when zoomed far: fit all)'],['Drag orange handles','Trim start / end']];
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function rows(a){return a.map(function(r){return'<tr><td style="padding:3px 6px;white-space:nowrap;vertical-align:top"><code style="background:#2a2620;border-radius:5px;padding:1px 6px">'+esc(r[0])+'</code></td><td style="padding:3px 6px">'+esc(r[1])+'</td></tr>'}).join('')}
function table(){var h='<div id="aly-keys">';G.forEach(function(g){h+='<div role="heading" aria-level="3" style="margin:12px 0 2px;font:700 12px sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#b9b2a2">'+esc(g[0])+'</div><table style="width:100%;font-size:13px;border-collapse:collapse">'+rows(g[1])+'</table>'});
 h+='<div role="heading" aria-level="3" style="margin:12px 0 2px;font:700 12px sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#b9b2a2">Touch screens</div><table style="width:100%;font-size:13px;border-collapse:collapse">'+rows(TOUCH)+'</table>';
 h+='<p style="font-size:12px;color:#b9b2a2">Letter keys work when no text box or menu is focused. While Audio Lab is open, the video editor’s own shortcuts do nothing behind it.</p></div>';return h}
function build(html){if(!html||html.indexOf('id="aly-keys"')>-1||!/<table/.test(html))return null;return html.replace(/<table[\s\S]*<\/table>/,table())}
window.__alKeyHelp={build:build,groups:G};
function run(){var P=document.getElementById('alhelp');if(!P||P.__y19)return;var n=build(P.innerHTML);if(!n)return;P.innerHTML=n;P.__y19=1;
 P.setAttribute('role','dialog');P.setAttribute('aria-modal','true');P.setAttribute('aria-label','Audio Lab help and keyboard shortcuts');
 new MutationObserver(function(){if(P.style.display==='block'){var x=document.getElementById('alhx');if(x)try{x.focus()}catch(e){}}}).observe(P,{attributes:true,attributeFilter:['style']});
 var x0=document.getElementById('alhx');if(x0)x0.setAttribute('aria-label','Close help')}
[600,2000,4500,8000].forEach(function(t){setTimeout(run,t)});document.addEventListener('DOMContentLoaded',run);
}catch(e){try{console.warn('Audio Lab step 19',e)}catch(_){}}})();

;
/* ==================== Script 1037 id="amiyo-al-y20-final-test" ==================== */
/* Audio Lab step 20: a built-in "🧪 Final test" button (next to Health check). It checks, live in this browser, that every feature from steps 1-21 is in place and working: groups, merged sections, remembered sections and settings, changed tag and Reset this section (it moves one slider and puts it back), export names, MP3 encoder, progress bar and Cancel, A/B button, undo history, preset buttons, batch section, friendly error messages, long-file estimate, help sheet. If no audio is loaded it makes a 2-second test tone, loads it and presses Process to check the whole chain; if audio is loaded it processes that. It never exports or downloads anything. The test tone stays loaded afterwards. */
(function(){try{
function $(i){return document.getElementById(i)}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
function esc(t){return String(t).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
/* 16-bit mono WAV of a sine tone with a little noise; returns Uint8Array */
function tone(sec,sr,hz){var n=Math.round(sec*sr),b=new ArrayBuffer(44+n*2),v=new DataView(b),i;function w(o,s){for(var k=0;k<s.length;k++)v.setUint8(o+k,s.charCodeAt(k))}
 w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);
 var seed=12345;for(i=0;i<n;i++){seed=(seed*1103515245+12345)&0x7fffffff;var nz=(seed/0x7fffffff-.5)*.02;v.setInt16(44+i*2,Math.max(-1,Math.min(1,.4*Math.sin(2*Math.PI*hz*i/sr)+nz))*32767,true)}return new Uint8Array(b)}
window.__alFinal={tone:tone};
async function until(fn,ms){var t0=Date.now();while(Date.now()-t0<ms){var r=fn();if(r)return r;await sleep(150)}return null}
async function run(out){
 var M=$('alm'),R=[],bad=0;function add(ok,t){R.push({ok:!!ok,t:t});if(!ok)bad++;out(R,bad,false)}
 function det(re){return[].filter.call(M.querySelectorAll('details'),function(d){var s=d.querySelector('summary');return s&&re.test(s.textContent)})[0]}
 function noteT(){var n=$('aln');return n?n.textContent||'':''}
 /* 1 groups */
 var hs=[].map.call(M.querySelectorAll('.aly-h'),function(h){return h.textContent});add(hs.join()==='Basics,Voice,Advanced','1 Groups: '+(hs.join(' / ')||'none found'));
 /* 2-4 merges */
 var cl=det(/Clean-up/),lv=det(/Level, fade/),tn=det(/Tone \(3-band/),dy=det(/Dynamics/);
 add(cl&&cl.querySelector('details.aly-nest')&&!/^\s*$/.test(cl.textContent),'2 Noise sections merged into Clean-up'+(cl&&cl.querySelector('details.aly-nest')?'':' (nested part missing)'));
 add(lv&&lv.querySelector('details.aly-nest'),'2 Leveling & silence merged into Level, fade & trim');
 add(tn&&tn.querySelector('details.aly-nest')&&tn.querySelector('#eqb1'),'3 EQ merged: 3-band and 6-band in one section');
 add(dy&&dy.querySelector('details.aly-nest')&&dy.querySelector('#alct'),'4 Compressor merged into Dynamics');
 var stray=[].filter.call(M.querySelectorAll('details:not(.aly-nest)>summary'),function(s){return /Noise, hum & clicks|Leveling & silence|Parametric EQ|Compressor — attack/.test(s.textContent)});add(!stray.length,'2-4 No leftover duplicate sections');
 /* 5 remembered sections */
 var top=[].filter.call(M.querySelectorAll('details:not(.aly-nest)'),function(d){return !d.id||true})[0];
 if(top){var was=top.open;top.open=!was;await sleep(150);top.open=was;await sleep(150);var k=null;try{k=JSON.parse(localStorage.getItem('amiyo-al-open-v1')||'null')}catch(e){}add(k&&typeof k==='object','5 Open sections are remembered')}
 /* 6-7 changed tag + reset, on one slider that is still at its starting value */
 var cand=null;[].some.call(M.querySelectorAll('details:not(.aly-nest):not([data-chg])'),function(d){var s=[].filter.call(d.querySelectorAll('input[type=range]'),function(e){return e.__y06!==undefined&&String(e.value)===e.__y06&&!e.hasAttribute('data-e')&&e.id!=='alsq'&&!/^(als|ale|alzz)$/.test(e.id)&&+e.max>+e.min})[0];if(s){cand={d:d,s:s};return true}});
 if(cand){var s=cand.s,d=cand.d,orig=s.value,alt=String(+s.value+(+s.max-+s.min)*.2<=+s.max?+s.value+(+s.max-+s.min)*.2:+s.value-(+s.max-+s.min)*.2);
  s.value=alt;s.dispatchEvent(new Event('input',{bubbles:true}));s.dispatchEvent(new Event('change',{bubbles:true}));await sleep(300);
  add(d.getAttribute('data-chg')==='1','6 "changed" tag appears when a control moves ('+(s.id||'slider')+')');
  var rb=d.querySelector(':scope>.aly-reset button');add(!!rb&&getComputedStyle(rb.parentNode).display!=='none','7 "Reset this section" button appears');
  if(rb)rb.click();await sleep(300);add(String(s.value)===String(orig)&&!d.hasAttribute('data-chg'),'7 Reset puts the control back and the tag goes away')}
 else add(false,'6-7 Could not find an untouched slider to test (use ↺ Fresh start, then run the test again)');
 /* 8 settings */
 await sleep(600);var ss=null;try{ss=JSON.parse(localStorage.getItem('amiyo-al-settings-v1')||'null')}catch(e){}add(ss&&typeof ss==='object'&&Object.keys(ss).length>20,'8 Last settings are saved ('+(ss?Object.keys(ss).length:0)+' controls)');add(!!$('aly-fresh'),'8 Fresh start button present');
 /* 9 names */
 var nm=window.__alExportName&&window.__alExportName('192k');add(typeof nm==='string'&&/-edited-192k$/.test(nm),'9 Export name follows the source file ('+nm+')');
 /* 10 mp3 */
 var ls=$('amiyo-lame-src');add(!!window.lamejs||(ls&&ls.textContent.length>1000),'10 MP3 encoder is built in (works offline)');
 /* 11 progress */
 var pg=$('alpg');add(pg&&pg.getAttribute('role')==='progressbar'&&$('alpgx'),'11 Progress bar and Cancel button present');
 /* 12 A/B */
 var ab=$('aly-ab'),pl=$('alpl');add(ab&&pl&&ab.previousElementSibling===pl,'12 A/B button sits next to Preview');
 /* 13 zoom */
 add(!!$('alzm')&&!!$('alzi'),'13 Waveform zoom strip present'+((window.matchMedia&&matchMedia('(pointer:coarse)').matches)?(' (touch hint '+($('aly-zh')?'shown':'missing')+')'):''));
 /* 14 history */
 var H=window.__alHist&&window.__alHist.get();add(H&&Array.isArray(H.d)&&!!$('aly-hb'),'14 Undo history list ('+(H?H.d.length:0)+' steps recorded)');
 /* 15 presets */
 add(!!$('alpren')&&!!$('alpupd')&&!!$('alpex1')&&!!$('alpsv'),'15 Preset buttons: save, rename, update, share one');
 /* 16 batch */
 var bf=$('aly-bf');add(!!$('aly-batch')&&bf&&bf.multiple&&!!$('aly-bgo')&&!!$('aly-bx'),'16 Batch process section present');
 /* 17 errors */
 var F=window.__alFriendly;add(F&&/memory/.test(F('Array buffer allocation failed','Processing failed'))&&/unexpected/.test(F('x is not a function','Export failed')),'17 Friendly error messages');
 /* 18 long files */
 var Mm=window.__alMem,e=Mm&&Mm.estimate(3600*44100,2,44100,1);add(e&&Math.abs(e.heldMB-1210.9)<2&&Mm.level(e.peakMB,Mm.budget(4,400))==='over'&&Mm.level(50,1500)==='ok','18 Long-file memory estimate and warning levels');
 /* 19 help */
 var hp=$('alhelp');add(hp&&hp.querySelector('#aly-keys')&&hp.querySelectorAll('#aly-keys [role=heading]').length>=5&&/A or B/.test(hp.textContent),'19 Help sheet lists the current shortcuts');
 /* 21 timeline link */
 add(typeof window.__alClipLink==='function'&&window.__alClipApi&&window.__alClipApi.decide({clip:{assetId:'x'},track:{kind:'audio'}},{type:'audio',size:1},1e8)==='auto','21 Selected audio clip is detected and Export offers to replace it'+(window.__alClipLink&&window.__alClipLink()?' (a clip is linked now)':''));
 /* core */
 add(!!$('alr')&&!!$('ald')&&!!$('alx')&&!!$('alf'),'Core buttons present: Process, Export, format, file');
 /* end to end */
 var st=window.__alst&&window.__alst(),made=false;
 if(!st||!st.src){
  var inp=$('alf');if(!inp){add(false,'End-to-end: file box not found')}
  else{try{var dt=new DataTransfer();dt.items.add(new File([tone(2,44100,440)],'final-test-tone.wav',{type:'audio/wav'}));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));made=true}catch(x){add(false,'End-to-end: could not create the test tone ('+(x&&x.message)+')')}
   if(made){var ok=await until(function(){return /\d+ ch, \d+ Hz/.test(noteT())||(window.__alst&&window.__alst().src)},20000);var s2=window.__alst&&window.__alst().src;add(ok&&s2&&Math.abs(s2.duration-2)<.05,'End-to-end: test tone loaded ('+(s2?s2.duration.toFixed(2)+' s':'nothing')+')')}}
 }
 st=window.__alst&&window.__alst();
 if(st&&st.src){var prev=st.out;$('alr').click();var res=await until(function(){var t=noteT();if(/^Done/.test(t))return 'ok';if(/failed|cancel/i.test(t))return 'bad'},90000);
  var o2=window.__alst().out;add(res==='ok'&&o2&&o2!==prev&&o2.length>0,'End-to-end: Process '+(res==='ok'?'finished':'did not finish ('+noteT().slice(0,80)+')')+(o2?' — result '+o2.duration.toFixed(2)+' s':''));
  if(res==='ok'&&o2){var pk=0,d0=o2.getChannelData(0);for(var i=0;i<d0.length;i+=7){var a=Math.abs(d0[i]);if(a>pk)pk=a}add(isFinite(pk)&&pk>0&&pk<=1.0001,'End-to-end: result has sound and does not clip (peak '+pk.toFixed(2)+')');
   var o=$('alo'),was=o&&o.checked;if(ab){ab.click();await sleep(250);ab.click();await sleep(250);add(true,'End-to-end: A/B button toggled twice without errors');var pb=$('alpl');if(pb&&/^\u25A0/.test((pb.textContent||'').trim()))pb.click();if(o&&o.checked!==was){o.checked=was;o.dispatchEvent(new Event('change',{bubbles:true}))}}}}
 out(R,bad,true)}
function build(){var M=$('alm');if(!M||$('aly-ft'))return;var hc=$('alhcb'),hd=M.querySelector('.alhd');if(!hc&&!hd)return;
 var b=document.createElement('button');b.type='button';b.id='aly-ft';b.textContent='🧪 Final test';b.title='Check every feature from steps 1-21 live';b.setAttribute('aria-label','Run the final test of all Audio Lab features');b.style.cssText='margin-left:8px;min-height:36px';
 var p=document.createElement('div');p.id='aly-ftr';p.setAttribute('role','region');p.setAttribute('aria-live','polite');p.setAttribute('aria-label','Final test results');p.style.cssText='display:none;margin:8px 0;padding:10px;border:1px solid #3a352c;border-radius:10px;background:#141210;font-size:13px;line-height:1.5';
 if(hc)hc.insertAdjacentElement('afterend',b);else hd.appendChild(b);
 var anchor=$('alhc')||hd;anchor.insertAdjacentElement('afterend',p);
 var running=false;b.addEventListener('click',function(){if(running)return;if(p.style.display==='block'&&!b.__done){return}running=true;b.disabled=true;b.__done=false;p.style.display='block';p.textContent='Testing… (about 10 seconds)';
  run(function(R,bad,fin){var h='<b>'+(fin?(bad?bad+' of '+R.length+' checks need attention':'All '+R.length+' checks passed'):'Testing… '+R.length+' checks so far')+'</b><br>'+R.map(function(r){return(r.ok?'✅ ':'⚠️ ')+esc(r.t)}).join('<br>');p.innerHTML=h;if(fin){var n=$('aln');if(n)n.textContent=bad?'Final test: '+bad+' check(s) need attention.':'Final test: all '+R.length+' checks passed.'}})
  .catch(function(x){p.innerHTML='<b>The test stopped early</b><br>⚠️ '+esc(x&&x.message||x)}).then(function(){running=false;b.disabled=false;b.__done=true})})}
[900,2500,5000,9000].forEach(function(t){setTimeout(build,t)});setInterval(build,4000);document.addEventListener('DOMContentLoaded',build);
}catch(e){try{console.warn('Audio Lab step 20',e)}catch(_){}}})();

;
/* ==================== Script 1038 id="amiyo-al-y21-clip-link" ==================== */
/* Audio Lab step 21 (timeline link): (1) Open Audio Lab with an AUDIO clip selected on the timeline (for example the "Audio" clip on Audio 1) and it is loaded automatically, with no extra tap. Video clips and very large files still use the green "Load it" banner, so a big video is never decoded by surprise. If a different clip is selected than the one loaded, or the loaded clip was replaced since, the banner (or an automatic reload after a replace) offers the current one. (2) While the loaded audio came from a timeline clip, a green line says so, and pressing Export first asks: "Replace the original audio on the timeline with this edited audio?". Yes: the file is exported, then the clip is replaced in the same place on the same track (one undo restores it). No: only the export happens, and you are not asked again for the same result. Batch runs and automatic exports are never interrupted. A video clip gets the same question, but the edited audio goes under the video and the video's own sound is muted (as the Replace button already did). Also fixed in the Replace code: after a waveform edit (crop, delete, paste...) Audio Lab forgot the clip link, so Replace refused to work. */
(function(){try{
function $(i){return document.getElementById(i)}
var bypass=false,keyT=0,wasOpen=false,lastAsset=null,curWatch=null,noFor=(typeof WeakSet==='function')?new WeakSet():null;
function limit(){var dm=navigator.deviceMemory||0;return(window.innerWidth<=600||(dm&&dm<=4))?80e6:300e6}
/* pure helpers (also used by the self-test) */
function decide(f,a,lim){if(!f||!f.clip||!f.clip.assetId||!a)return null;if(a.type!=='audio'&&a.type!=='video')return null;
 var isAudio=a.type==='audio'||(f.track&&f.track.kind==='audio');if(!isAudio)return 'banner';if(a.size&&a.size>lim)return 'banner';return 'auto'}
function lenNote(nd,od){if(!isFinite(nd)||!isFinite(od)||Math.abs(nd-od)<.05)return '';return ' The new audio is '+(nd<od?'shorter':'longer')+' ('+nd.toFixed(1)+' s instead of '+od.toFixed(1)+' s).'}
function promptText(name,videoUnder,note){if(videoUnder)return 'Put this edited audio under the video \u201C'+name+'\u201D on the timeline? The video\u2019s own sound will be muted and the new audio takes its place. You can undo it from the editor. The file is exported either way.'+(note||'');
 return 'Replace the original audio \u201C'+name+'\u201D on the timeline with this edited audio? It stays in the same place. You can undo it from the editor. The file is exported either way.'+(note||'')}
window.__alClipApi={decide:decide,lenNote:lenNote,promptText:promptText};
function link(){return typeof window.__alClipLink==='function'?window.__alClipLink():null}
function selected(){try{var f=getClip();if(!f)return null;return{f:f,a:getAsset(f.clip.assetId)}}catch(e){return null}}
function say(t){var n=$('aln');if(n)n.textContent=t}
function ask(msg){try{if(typeof window.amiyoOk==='function')return Promise.resolve(window.amiyoOk(msg,{okLabel:'Yes, replace',cancelLabel:'No, only export'}))}catch(e){}return Promise.resolve(confirm(msg))}
/* ---- green status line + switch banner ---- */
function lineBox(){var n=$('aln');if(!n)return null;var d=$('aly-link');if(d)return d;d=document.createElement('div');d.id='aly-link';d.setAttribute('role','status');d.style.cssText='display:none;margin:6px 0;padding:6px 10px;border-radius:8px;font:13px sans-serif;background:#1f3a2a;color:#cdeedb';n.parentNode.insertBefore(d,n.nextSibling);return d}
function swBox(){var b=$('aly-sw');if(b)return b;var n=$('aln');if(!n)return null;b=document.createElement('div');b.id='aly-sw';b.style.cssText='display:none;align-items:center;gap:8px;flex-wrap:wrap;margin:6px 0;padding:8px 10px;border-radius:10px;background:#1f3a2a;color:#cdeedb;font-size:13px';
 var t=document.createElement('span');t.style.flex='1 1 150px';var bt=document.createElement('button');bt.type='button';bt.textContent='Load it';bt.style.cssText='background:#ff7a3d;color:#111;border:0;border-radius:8px;font-weight:700;padding:6px 14px;min-height:40px';
 bt.addEventListener('click',function(){b.style.display='none';var u=$('alu');if(u)u.click()});b.appendChild(t);b.appendChild(bt);n.parentNode.insertBefore(b,n.nextSibling);return b}
function render(){var M=$('alm');if(!M||M.style.display!=='block')return;var d=lineBox(),b=swBox();if(!d||!b)return;var l=link(),nm=null,cur=null;
 if(l){try{cur=getClipByIds(l.clipId,l.trackId)}catch(e){}if(cur){try{var a0=getAsset((cur.clip||cur).assetId);nm=(a0&&a0.name)||'clip'}catch(e){nm='clip'}}}
 if(l&&nm){d.style.display='block';d.textContent='Linked to timeline clip \u201C'+nm+'\u201D. Export will ask if you want to replace it with the edited audio (same position).'}else d.style.display='none';
 var s=selected(),show=false,msg='';
 if(l&&s&&s.a&&decide(s.f,s.a,limit())){if(s.f.clip.id!==l.clipId){show=true;msg='A different clip is selected on the timeline: \u201C'+(s.a.name||'clip')+'\u201D.'}
  else if(lastAsset&&s.f.clip.assetId!==lastAsset){show=true;msg='This clip was changed on the timeline since it was loaded.'}}
 b.firstChild.textContent=msg;b.style.display=show?'flex':'none'}
/* ---- auto-load when Audio Lab opens ---- */
function opened(){var s=selected(),st=window.__alst&&window.__alst(),u=$('alu');if(!s||!u||decide(s.f,s.a,limit())!=='auto')return;
 if(st&&st.src){var l=link();if(l&&s.f.clip.id===l.clipId&&lastAsset&&s.f.clip.assetId!==lastAsset)u.click();return}
 u.click()}
var u0=$('alu');if(u0)u0.addEventListener('click',function(){var s=selected();lastAsset=s&&s.f.clip.assetId||null},true);
var M0=$('alm');if(M0)new MutationObserver(function(){var o=M0.style.display==='block';if(o&&!wasOpen){wasOpen=true;setTimeout(function(){try{opened()}catch(e){}render()},350)}else if(!o)wasOpen=false}).observe(M0,{attributes:true,attributeFilter:['style']});
setInterval(function(){try{render()}catch(e){}},1500);
/* ---- ask on Export ---- */
function watchExport(cb){if(curWatch)curWatch('abort');var n=$('aln'),done=false,t=setTimeout(function(){fin('abort')},900000),mo=new MutationObserver(function(){var x=n.textContent||'';
  if(/^Export cancelled/.test(x))fin('cancel');else if(/^(Exported|Export failed)/.test(x))fin('done');else if(/^(Press Process|Choose a file|Processing failed|Process failed|Could not|Open an audio)/.test(x))fin('abort')});
 function fin(r){if(done)return;done=true;try{mo.disconnect()}catch(e){}clearTimeout(t);if(curWatch===fin)curWatch=null;cb(r)}
 mo.observe(n,{childList:true,characterData:true,subtree:true});curWatch=fin}
document.addEventListener('keydown',function(e){if(e.isTrusted&&(e.ctrlKey||e.metaKey)&&(e.key==='s'||e.key==='S'))keyT=Date.now()},true);
document.addEventListener('click',function(ev){var a=ev.target&&ev.target.closest?ev.target.closest('#ald'):null;if(!a)return;
 if(bypass||!(ev.isTrusted||Date.now()-keyT<150))return;
 if(window.__alBatch&&window.__alBatch.running&&window.__alBatch.running())return;
 var l=link(),st=window.__alst&&window.__alst();if(!l||!st||!st.src)return;
 var f=null;try{f=getClipByIds(l.clipId,l.trackId)}catch(e){}if(!f)return;
 var c=f.clip||f,as=getAsset(c.assetId);if(!as)return;
 if(st.out&&noFor&&noFor.has(st.out))return;
 ev.stopImmediatePropagation();ev.preventDefault();
 var videoUnder=as.type==='video'&&!(f.track&&f.track.kind==='audio'),note=st.out?lenNote(st.out.duration/(c.speed||1),c.duration):'';
 ask(promptText(as.name||'clip',videoUnder,note)).then(function(yes){
  if(!yes&&st.out&&noFor)noFor.add(st.out);
  if(yes)watchExport(function(r){if(r==='done')setTimeout(function(){var rb=$('alrp');if(rb&&link())rb.click()},300);else if(r==='cancel')say('Not replaced, because the export was cancelled.')});
  bypass=true;try{a.click()}finally{bypass=false}})},true);
}catch(e){try{console.warn('Audio Lab step 21',e)}catch(_){}}})();

;
/* ==================== Script 1039 id="amiyo-al-z01-dsp" ==================== */
(function(){try{
/* Audio Lab step 1 (DSP): voice-isolation / background-sound remover + signal analysis used by the smarter Auto-enhance. Pure functions, no page access. */
var N=2048,H=512,B=N/2+1,HW=new Float32Array(N);for(var q=0;q<N;q++)HW[q]=.5-.5*Math.cos(2*Math.PI*q/N);
function fft(re,im){var n=re.length,j=0;for(var i=1;i<n;i++){var b=n>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){var t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t}}for(var len=2;len<=n;len<<=1){var a=-2*Math.PI/len,wr=Math.cos(a),wi=Math.sin(a),h=len>>1;for(var s=0;s<n;s+=len){var cr=1,ci=0;for(var k=0;k<h;k++){var u=s+k,v=u+h,xr=re[v]*cr-im[v]*ci,xi=re[v]*ci+im[v]*cr;re[v]=re[u]-xr;im[v]=im[u]-xi;re[u]+=xr;im[u]+=xi;var t2=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=t2}}}}
var tick=function(){return new Promise(function(r){setTimeout(r,0)})};
/* Keep the voice, remove everything else (steady noise, hiss, room/street/music bed). s = strength 0..1 */
async function isolate(d,sr,s,prog){
 var len=d.length,p=new Float32Array(len+2*N);p.set(d,N);var fr=Math.floor((p.length-N)/H)+1,re=new Float32Array(N),im=new Float32Array(N),ve=new Float32Array(fr),i,k;
 var k0=Math.max(1,Math.round(200/sr*N)),k1=Math.round(3500/sr*N);
 for(i=0;i<fr;i++){var o=i*H;for(k=0;k<N;k++){re[k]=p[o+k]*HW[k];im[k]=0}fft(re,im);var e=0;for(k=k0;k<=k1;k++)e+=re[k]*re[k]+im[k]*im[k];ve[i]=e;if(i%200===199)await tick()}
 var ord=Array.prototype.slice.call(ve).map(function(v,ix){return[v,ix]}).sort(function(a,b){return a[0]-b[0]}),nq=Math.max(3,Math.floor(fr*.1)),nz=new Float32Array(B),ne=0;
 for(var z=0;z<nq&&z<ord.length;z++){var o2=ord[z][1]*H;for(k=0;k<N;k++){re[k]=p[o2+k]*HW[k];im[k]=0}fft(re,im);for(k=0;k<B;k++)nz[k]+=Math.sqrt(re[k]*re[k]+im[k]*im[k])/nq;ne+=ord[z][0]/nq}
 var thr=Math.max(ne*5,1e-12),al=1.4+3*s,fl=Math.pow(10,-(8+32*s)/20),gp=new Float32Array(B).fill(1),gn=new Float32Array(B),out=new Float32Array(p.length),vg=1,hz=sr/N;
 for(i=0;i<fr;i++){var o3=i*H;for(k=0;k<N;k++){re[k]=p[o3+k]*HW[k];im[k]=0}fft(re,im);
  var tv=ve[i]<thr?1-.8*s:1;vg+=(tv-vg)*(tv>vg?.6:.15);
  for(k=0;k<B;k++){var m2=re[k]*re[k]+im[k]*im[k],n2=nz[k]*nz[k]*al*al,g=Math.sqrt(Math.max(0,1-n2/(m2+1e-20)));if(g<fl)g=fl;gp[k]+=(g-gp[k])*(g>gp[k]?.7:.2);gn[k]=gp[k]}
  for(k=1;k<B-1;k++){var f=k*hz,bw=f<80?1-.9*s:f>8500?1-.7*s:1,gs=(gn[k-1]+2*gn[k]+gn[k+1])/4*bw*vg;re[k]*=gs;im[k]*=gs;re[N-k]*=gs;im[N-k]*=gs}
  re[0]*=gn[0]*(1-.9*s);im[0]=0;re[B-1]*=gn[B-1];im[B-1]*=gn[B-1];
  fft(im,re);for(k=0;k<N;k++)out[o3+k]+=re[k]/N*HW[k]/1.5;
  if(i%150===149){if(prog)prog(i/fr);await tick()}}
 return out.subarray(N,N+len)}
/* Measure a buffer range (percent trim a..e) */
function analyze(b,a,e){var sr=b.sampleRate,n=b.length,i0=Math.floor(n*a/100),i1=Math.max(i0+1,Math.floor(n*e/100)),d0=b.getChannelData(0),d1=b.numberOfChannels>1?b.getChannelData(1):d0,bl=Math.max(1,Math.round(sr*.05)),db=[],st,i;
 for(st=i0;st+bl<=i1;st+=bl){var q=0;for(i=st;i<st+bl;i++){var v=(d0[i]+d1[i])/2;q+=v*v}db.push(10*Math.log10(q/bl+1e-12))}
 if(db.length<4)return null;var so=db.slice().sort(function(x,y){return x-y}),P=function(f){return so[Math.min(so.length-1,Math.floor(so.length*f))]};
 var r={p10:P(.1),p50:P(.5),p90:P(.9),p95:P(.95)};r.snr=r.p90-r.p10;r.crest=r.p95-r.p50;
 var re=new Float32Array(N),im=new Float32Array(N),ac=new Float64Array(B),c=0,step=Math.max(N,Math.floor((i1-i0)/150));
 for(st=i0;st+N<=i1&&c<150;st+=step){var ee=0;for(i=0;i<N;i++){var x=(d0[st+i]+d1[st+i])/2;re[i]=x*HW[i];im[i]=0;ee+=x*x}if(10*Math.log10(ee/N+1e-12)<r.p50)continue;fft(re,im);for(var k=0;k<B;k++)ac[k]+=re[k]*re[k]+im[k]*im[k];c++}
 var hz=sr/N,band=function(a1,a2){var s=0;for(var k=Math.max(1,Math.round(a1/hz));k<=Math.min(B-1,Math.round(a2/hz));k++)s+=ac[k];return s+1e-18};
 var tot=band(20,sr/2);r.rumble=band(20,80)/tot;r.boom=band(150,300)/band(500,2000);r.pres=band(2000,4000);r.sib=band(5000,9000)/r.pres;r.air=band(10000,16000)/tot;r.lowMus=band(20,120)/tot;r.ok=c>0;return r}
window.__alZ={isolate:isolate,analyze:analyze};
}catch(e){try{console.error('Audio Lab step 1 DSP',e)}catch(x){}}})();

;
/* ==================== Script 1040 id="amiyo-al-z02-enhance-remove" ==================== */
(function(){try{
/* Audio Lab step 1 (UI): smarter Auto-enhance voice / music (they now MEASURE the file and pick settings for it) + new section to remove background sound or remove the voice. */
var M=document.getElementById('alm');if(!M||M.getAttribute('data-z01'))return;M.setAttribute('data-z01','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}},msg=function(t){g('aln').textContent=t},Z=window.__alZ;
function fire(e){e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))}
function setv(id,v){var e=g(id);if(!e)return;if(e.type==='checkbox')e.checked=!!v;else e.value=v;fire(e)}
var cl=function(v,a,b){return Math.max(a,Math.min(b,v))},wait=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
/* ---------- smarter Auto-enhance ---------- */
async function enhance(kind){var s=S();if(!s.src){msg('Choose a file first.');return}
 var a=+g('als').value,e=+g('ale').value,busy=g('alauto');
 if(window.__alzBusy)return;window.__alzBusy=1;try{
 msg('Measuring the file…');await wait(30);var m=Z&&Z.analyze(s.src,a,e);
 if(!m||!m.ok){msg('File is too short or silent to measure. Try a longer clip.');return}
 setv('alps','rst');g('alps').value='rst';fire(g('alps'));await wait(150);
 setv('alz1','');
 var P={},note=[];
 if(kind==='voice'){
  P.aldn=m.snr<12?75:m.snr<20?60:m.snr<30?45:m.snr<40?30:15;
  P.alh=m.rumble>.25?120:80;
  P.alg=m.snr>=20?cl(Math.round(m.p10+6),-65,-45):-80;
  P.ades=m.sib>.5?-28:m.sib>.3?-34:0;
  P.aq1=m.boom>1.5?-2:0;P.aq2=m.pres<=0?0:1;P.aq3=m.air<1e-4?2:0;
  P.alct=cl(Math.round(m.p90-8),-40,-14);P.alcr=m.crest>18?3.5:3;P.alcm=3;P.alfd=.05;P.alt='-16';P.alk='-1';
  note.push('noise cut '+P.aldn+'%','high-pass '+P.alh+' Hz');if(P.alg>-80)note.push('gate '+P.alg+' dB');if(P.ades)note.push('de-esser');note.push('−16 LUFS')
  var h=g('alhd');if(h){h.click();await wait(700);if(g('alhm')&&g('alhm').value!=='0')note.push('hum '+g('alhm').value+' Hz removed')}
 }else{
  P.aldn=0;P.alg=-80;P.ades=0;P.alh=m.rumble>.3?30:25;
  P.aq1=m.lowMus<.15?1.5:m.lowMus>.6?-1.5:0;P.aq3=m.air<1e-4?1.5:0;P.alfd=.05;
  P.alct=cl(Math.round(m.p90-5),-30,-10);P.alcr=m.crest>14?2:1.5;P.alcm=2;P.alt='-14';P.alk='-1';
  note.push('high-pass '+P.alh+' Hz',m.crest>14?'gentle 2:1 compression':'light 1.5:1 compression','−14 LUFS','−1 dB limiter')}
 for(var k in P)setv(k,P[k]);
 msg('Auto-enhance set (measured: noise floor '+m.p10.toFixed(0)+' dB, voice '+m.p90.toFixed(0)+' dB): '+note.join(', ')+'. Processing…');
 await wait(60);g('alr').click()}finally{window.__alzBusy=0}}
[['alauto','voice'],['alautom','music']].forEach(function(x){var o=g(x[0]);if(!o)return;var n=o.cloneNode(true);o.parentNode.replaceChild(n,o);n.addEventListener('click',function(){enhance(x[1])});n.title=x[1]==='voice'?'Measures your file, then sets noise cut, hum, gate, de-esser, EQ, compression and loudness for speech, and processes it':'Measures your file, then sets a gentle music master (high-pass, EQ, compression, −14 LUFS) and processes it'});
/* ---------- remove background sound / remove voice ---------- */
var d=document.createElement('details');d.className='alsec';d.id='alzsec';
d.innerHTML='<summary><span>🔇 Remove background sound / voice</span><i></i></summary><div class="alin"><label>Mode</label><select id="alz1"><option value="">Off</option><option value="bg">Remove background sound — keep the voice</option><option value="vox">Remove the voice — keep the background / music</option></select><label>Strength (%): <b id="alzsv">80</b></label><input type="range" id="alzstr" min="0" max="100" step="5" value="80"><div id="alzvox"><label>Keep bass below (Hz): <b id="alzfv">100</b></label><input type="range" id="alzfrq" min="60" max="400" step="10" value="100"></div><div id="alzh" style="font-size:12px;color:#b9b2a2;margin-top:6px"></div><div class="row"><button type="button" id="alzrst">↺ Reset this section</button></div></div>';
var HT={'':'Pick a mode, then press Process. Works fully on your device.',bg:'Learns the steady background (hiss, fan, traffic, room tone) from the quietest part, removes it, and softens everything outside the voice range. Higher strength = cleaner but can sound thinner. Music or people talking behind you can only be reduced, not fully removed.',vox:'Removes what is in the centre of a stereo mix (usually the singer or speaker). Needs a stereo file; the bass below the set frequency stays. A mono file has no centre to remove.'};
var first=M.querySelector('details.alsec'),bd=d.querySelector('summary i');first.parentNode.insertBefore(d,first);
function ui(){var m=g('alz1').value;g('alzsv').textContent=g('alzstr').value;g('alzfv').textContent=g('alzfrq').value;g('alzvox').style.display=m==='vox'?'':'none';bd.textContent=m?'● on':'';g('alzh').textContent=HT[m]+(m==='vox'&&S().src&&S().src.numberOfChannels<2?' ⚠ The loaded file is mono.':'')}
d.addEventListener('input',ui);d.addEventListener('change',ui);
function reset(){g('alz1').value='';g('alzstr').value=80;g('alzfrq').value=100;ui()}g('alzrst').onclick=function(){reset();msg('Section reset.')};
g('alps').addEventListener('change',function(){if(this.value==='rst')setTimeout(reset,60)});
var pt=window.__alTP;window.__alTP=async function(r){var o=pt?await pt.apply(this,arguments):r,m=g('alz1').value;if(!o||!m)return o;var s=+g('alzstr').value/100;
 if(m==='bg'){for(var c=0;c<o.numberOfChannels;c++){var x=await Z.isolate(o.getChannelData(c),o.sampleRate,s,function(p){msg('Removing background sound… '+Math.round(p*100)+'%')});o.copyToChannel(x,c)}}
 else{if(o.numberOfChannels<2){msg('Remove voice needs a stereo file — this one is mono.');return o}if(!window.__alVocal){msg('Vocal engine not ready.');return o}await window.__alVocal.spectral(o,'rs',s,+g('alzfrq').value)}
 return o};
ui();
/* move the new section to the top of "Basics" once the group headings exist */
[3800,5500].forEach(function(t){setTimeout(function(){var h=[].filter.call(M.querySelectorAll('.aly-h'),function(x){return x.textContent==='Basics'})[0];if(h&&d.previousElementSibling!==h)M.insertBefore(d,h.nextSibling)},t)});
}catch(e){try{console.error('Audio Lab step 1 UI',e)}catch(x){}}})();

;
/* ==================== Script 1041 id="amiyo-al-z03-autoclean" ==================== */
(function(){try{
/* Audio Lab step 2: one-tap "Auto-clean" in the Clean-up section: finds hum, learns the room noise, checks for clicks, then processes. */
var M=document.getElementById('alm');if(!M||M.getAttribute('data-z03'))return;M.setAttribute('data-z03','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}},msg=function(t){g('aln').textContent=t};
function fire(e){e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))}
function setv(id,v){var e=g(id);if(e){e.value=v;fire(e)}}
var wait=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
var row=g('alnl1')&&g('alnl1').parentNode;if(!row||!window.__alDSP2)return;
var b=document.createElement('button');b.type='button';b.id='alclean';b.className='pri';b.textContent='🧹 Auto-clean (hum + noise + clicks)';row.parentNode.insertBefore(b,row);b.style.margin='8px 0 0';
b.onclick=async function(){var s=S();if(!s.src){msg('Choose a file first.');return}if(window.__alzBusy)return;window.__alzBusy=1;b.disabled=true;
 try{var found=[];
  msg('Looking for hum…');g('alhd').click();await wait(700);var h=g('alhm').value;if(h!=='0')found.push('hum '+h+' Hz');
  msg('Learning the room noise…');g('alnq').click();var t0=Date.now();while(Date.now()-t0<8000){await wait(250);if(/^(Noise learned|That stretch|Pick at least|No quiet)/.test(g('aln').textContent)&&Date.now()-t0>600)break}
  var learned=/^Noise learned/.test(g('aln').textContent);if(learned)found.push('noise sample learned');
  var D=s.src,a=Math.floor(D.length*g('als').value/100),e=Math.max(a+1,Math.floor(D.length*g('ale').value/100)),n=0;
  for(var c=0;c<Math.min(2,D.numberOfChannels);c++){n=Math.max(n,window.__alDSP2.declick(new Float32Array(D.getChannelData(c).subarray(a,e)),14,D.sampleRate))}
  setv('alck',n>0?'14':'0');if(n>0)found.push(n+' click'+(n>1?'s':'')+' repaired');
  if(+g('aldn').value<35)setv('aldn',45);
  msg('Auto-clean set: '+(found.length?found.join(', '):'nothing obvious found, light noise cut only')+'. Processing…');await wait(60);g('alr').click()
 }finally{window.__alzBusy=0;b.disabled=false}};
}catch(e){try{console.error('Audio Lab step 2',e)}catch(x){}}})();

;
/* ==================== Script 1042 id="amiyo-al-z04-trim-safe" ==================== */
(function(){try{
/* Audio Lab step 3: (1) trim handles dragged the wrong way round are swapped instead of giving a near-empty file; (2) trimmed files get a 5 ms anti-click ramp at each cut so there is no pop where the cut lands mid-sound. */
var M=document.getElementById('alm');if(!M||M.getAttribute('data-z04'))return;M.setAttribute('data-z04','1');
var g=function(i){return M.querySelector('#'+i)};
function fire(e){e.dispatchEvent(new Event('input',{bubbles:true}))}
M.addEventListener('click',function(ev){var t=ev.target;if(!t||!t.closest)return;if(!t.closest('#alr,#ald,#alrp,#alad,#alpl'))return;var a=g('als'),b=g('ale');if(a&&b&&+a.value>+b.value){var x=a.value;a.value=b.value;b.value=x;fire(a);fire(b);g('aln').textContent='Trim handles were the wrong way round — swapped them for you.'}},true);
var pt=window.__alTP;window.__alTP=async function(r){var o=pt?await pt.apply(this,arguments):r;if(!o)return o;var s=+g('als').value,e=+g('ale').value;if(s<=0&&e>=100)return o;
 var n=o.length,ramp=Math.min(Math.round(o.sampleRate*.005),n>>2);if(ramp<2)return o;
 for(var c=0;c<o.numberOfChannels;c++){var d=o.getChannelData(c);if(s>0)for(var i=0;i<ramp;i++)d[i]*=i/ramp;if(e<100)for(var k=0;k<ramp;k++)d[n-1-k]*=k/ramp}return o};
}catch(e){try{console.error('Audio Lab step 3',e)}catch(x){}}})();

;
/* ==================== Script 1043 id="amiyo-al-z05-tone-presets" ==================== */
(function(){try{
/* Audio Lab step 4: one-tap tone presets above the 3-band EQ (Warm, Bright, Clear voice, Less boomy, Less harsh, Flat). They only set the three EQ sliders; fine-tune afterwards. */
var M=document.getElementById('alm');if(!M||M.getAttribute('data-z05'))return;M.setAttribute('data-z05','1');
var g=function(i){return M.querySelector('#'+i)};
function fire(e){e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))}
var q1=g('aq1');if(!q1)return;var lab=q1.previousElementSibling;
var T={'':[null],flat:[0,0,0,'Flat'],warm:[3,0,-1.5,'Warm'],bright:[-1,0.5,4,'Bright'],clear:[-2,2.5,3,'Clear voice'],boom:[-4,-1.5,0,'Less boomy'],harsh:[0,-2.5,-3,'Less harsh']};
var w=document.createElement('div');w.id='alqpw';w.innerHTML='<label>Quick tone preset</label><select id="alqp"><option value="">Choose…</option><option value="clear">Clear voice (−2 / +2.5 / +3 dB)</option><option value="warm">Warm (+3 / 0 / −1.5)</option><option value="bright">Bright (−1 / +0.5 / +4)</option><option value="boom">Less boomy (−4 / −1.5 / 0)</option><option value="harsh">Less harsh (0 / −2.5 / −3)</option><option value="flat">Flat (all 0)</option></select><div style="font-size:11px;color:#b9b2a2;margin-top:4px">Sets low / mid / high EQ below. Fine-tune after, then press Process. Shelf bands give half their gain right at 100 Hz / 8 kHz and the full gain beyond.</div>';
lab.parentNode.insertBefore(w,lab);
g('alqp').addEventListener('change',function(){var t=T[this.value];if(!t||t[0]===null)return;['aq1','aq2','aq3'].forEach(function(id,i){var e=g(id);e.value=t[i];fire(e)});g('aln').textContent='Tone preset “'+t[3]+'” set: low '+t[0]+', mid '+t[1]+', high '+t[2]+' dB. Press Process.'});
['aq1','aq2','aq3'].forEach(function(id){g(id).addEventListener('input',function(e){if(e.isTrusted)g('alqp').value=''})});
g('alps').addEventListener('change',function(){setTimeout(function(){var v=[g('aq1').value,g('aq2').value,g('aq3').value].join();var m='';for(var k in T){if(T[k][0]!==null&&k&&k!=='flat'&&T[k].slice(0,3).join()===v)m=k}g('alqp').value=m},80)});
}catch(e){try{console.error('Audio Lab step 4',e)}catch(x){}}})();

;
/* ==================== Script 1044 id="amiyo-al-z06-tape-speed" ==================== */
(function(){try{
/* Audio Lab step 5: "Tape speed" slider (pitch follows speed, like a record or tape): 150% = faster and one fifth higher... 50% = slower and an octave lower. Applied by Process, after the other tools. The existing Speed slider still changes speed without changing pitch. */
var M=document.getElementById('alm');if(!M||M.getAttribute('data-z06'))return;M.setAttribute('data-z06','1');
var g=function(i){return M.querySelector('#'+i)},sx=g('alsx');if(!sx)return;
var h=document.createElement('div');h.innerHTML='<label>Tape speed (%, pitch follows speed): <b id="altpv">100</b></label><input type="range" id="altp" min="50" max="200" step="1" value="100"><div style="font-size:11px;color:#b9b2a2">Like a record: 150% is faster and higher, 50% is slower and lower (100% = off). Use the Speed slider above to change speed <i>without</i> changing pitch.</div>';
var after=sx.nextElementSibling;while(after&&after.tagName!=='DIV')after=after.nextElementSibling;var host=sx.parentNode,ref=sx.nextSibling;
while(h.firstChild)host.insertBefore(h.firstChild,ref);
var sl=g('altp'),bv=g('altpv');sl.addEventListener('input',function(){bv.textContent=sl.value});
g('alps').addEventListener('change',function(){if(this.value==='rst')setTimeout(function(){sl.value=100;bv.textContent='100'},60)});
function cub(d,x){var i=Math.floor(x),f=x-i,n=d.length,a=d[Math.max(0,i-1)],b=d[Math.min(n-1,i)],c=d[Math.min(n-1,i+1)],e=d[Math.min(n-1,i+2)];return b+.5*f*(c-a+f*(2*a-5*b+4*c-e+f*(3*(b-c)+e-a)))}
var pt=window.__alTP;window.__alTP=async function(r){var o=pt?await pt.apply(this,arguments):r,s=+sl.value/100;if(!o||Math.abs(s-1)<.005)return o;
 var n=o.length,m=Math.max(64,Math.round(n/s)),nb=new AudioBuffer({numberOfChannels:o.numberOfChannels,length:m,sampleRate:o.sampleRate});
 for(var c=0;c<o.numberOfChannels;c++){var d=o.getChannelData(c),q=new Float32Array(m);for(var i=0;i<m;i++)q[i]=cub(d,i*s);nb.copyToChannel(q,c)}
 g('aln').textContent='Tape speed '+sl.value+'% applied…';return nb};
}catch(e){try{console.error('Audio Lab step 5',e)}catch(x){}}})();

;
/* ==================== Script 1045 id="amiyo-al-z07-loudness-note" ==================== */
(function(){try{
/* Audio Lab step 6: after every Process, one plain line says whether the loudness target was reached, and if not, why (peak ceiling or silence) and what to try. Also warns if the true peak ends above the ceiling. */
var M=document.getElementById('alm');if(!M||M.getAttribute('data-z07'))return;M.setAttribute('data-z07','1');
var g=function(i){return M.querySelector('#'+i)},st=g('aln'),busy=false;
function num(id){var e=g(id);if(!e)return NaN;var t=(e.textContent||'').replace('−','-').replace(/[^0-9.\-]/g,'');return t===''||t==='-'?NaN:parseFloat(t)}
function check(){if(busy)return;var t=st.textContent||'';if(!/^Done/.test(t)||/Loudness .* LUFS/.test(t))return;
 var tg=g('alt')&&g('alt').value;if(!tg)return;tg=+tg;var ceil=+g('alk').value,l=num('l1'),tp=num('t1'),pk=num('p1');if(!isFinite(l)||l<=-100)return;
 var diff=l-tg,note;
 if(Math.abs(diff)<=.3)note='✓ Loudness '+l.toFixed(1)+' LUFS — on target ('+tg+').';
 else if(diff<0)note='Loudness '+l.toFixed(1)+' LUFS, '+Math.abs(diff).toFixed(1)+' LU under the '+tg+' target — the '+ceil+' dBFS peak ceiling stopped it going louder. Try a lower compressor threshold, or a higher ceiling.';
 else note='Loudness '+l.toFixed(1)+' LUFS, '+diff.toFixed(1)+' LU over the '+tg+' target.';
 if(isFinite(tp)&&tp>ceil+.3)note+=' ⚠ True peak '+tp.toFixed(1)+' dBTP is above the '+ceil+' ceiling.';
 busy=true;st.textContent=t+' '+note;setTimeout(function(){busy=false},50)}
new MutationObserver(function(){setTimeout(check,350)}).observe(st,{childList:true,characterData:true,subtree:true});
}catch(e){try{console.error('Audio Lab step 6',e)}catch(x){}}})();

;
/* ==================== Script 1046 id="amiyo-al-z08-deplosive2" ==================== */
(function(){try{
/* Audio Lab step 7: faster de-plosive. The old one reacted too slowly and used a phase-shifted filter, so a 35 ms mic thump was lowered by only ~1 dB. This one looks 4 ms ahead and uses a zero-phase filter (a thump at 80% strength is now lowered about 5 dB; voice untouched). It replaces the old de-plosive pass; the breath reducer is unchanged. */
var M=document.getElementById('alm');if(!M||M.getAttribute('data-z08'))return;M.setAttribute('data-z08','1');
var g=function(i){return M.querySelector('#'+i)};if(!g('aldps'))return;
function lp2(x,fc,sr){var a=1-Math.exp(-2*Math.PI*fc/sr),y=new Float32Array(x.length),s=0,t=0;for(var i=0;i<x.length;i++){s+=(x[i]-s)*a;t+=(s-t)*a;y[i]=t}return y}
function lpz(x,fc,sr){var f=lp2(x,fc,sr),n=f.length,r=new Float32Array(n);for(var i=0;i<n;i++)r[i]=f[n-1-i];var b=lp2(r,fc,sr),o=new Float32Array(n);for(i=0;i<n;i++)o[i]=b[n-1-i];return o}
/* faster de-plosive with look-ahead: finds thumps below ~120 Hz that are far above the slow low-frequency average, lowers only the lows */
function deplosive2(r,str,sens){var sr=r.sampleRate,thr=3.2-sens*.22,fl=Math.max(.02,1-str*.97),at=1-Math.exp(-1/(.0012*sr)),rl=1-Math.exp(-1/(.02*sr)),ab=1-Math.exp(-1/(.35*sr)),look=Math.round(.004*sr),sm=1-Math.exp(-1/(.002*sr)),hits=0;
 for(var c=0;c<r.numberOfChannels;c++){var x=r.getChannelData(c),n=x.length,lf=lpz(x,120,sr),e=0,base=1e-4,g=new Float32Array(n),i,m=0;
  for(i=0;i<n;i+=16)m+=Math.abs(lf[i]);base=Math.max(1e-5,m/Math.ceil(n/16)*.6);
  for(i=0;i<n;i++){var a=lf[i]<0?-lf[i]:lf[i];e+=(a-e)*(a>e?at:rl);var lim=base*1.5+1e-6;base+=(Math.min(e,lim)-base)*ab;var ratio=e/(base*thr+1e-6);g[i]=ratio>1?Math.max(fl,1/ratio):1}
  /* look-ahead: gain at i is the minimum over the next 4 ms */
  var q=new Float32Array(n),dq=[],hd=0;for(i=n-1;i>=0;i--){while(dq.length>hd&&g[dq[dq.length-1]]>=g[i])dq.pop();dq.push(i);while(dq[hd]>i+look)hd++;q[i]=g[dq[hd]]}
  var s=1,was=false;for(i=0;i<n;i++){s+=(q[i]-s)*sm;if(s<.7&&!was){hits++;was=true}else if(s>.9)was=false;x[i]=x[i]-lf[i]*(1-s)}}
 return Math.round(hits/r.numberOfChannels)}

var pt=window.__alTP;window.__alTP=async function(r){var sl=g('aldps'),ps=+sl.value;if(!ps)return pt?await pt.apply(this,arguments):r;
 sl.value=0;var o;try{o=pt?await pt.apply(this,arguments):r}finally{sl.value=ps}
 if(!o)return o;await new Promise(function(z){setTimeout(z,0)});var n=deplosive2(o,ps/100,+g('aldpv').value),gg=g('aldpg'),old=gg&&/(\d+ breaths)/.exec(gg.textContent);
 if(gg)gg.textContent='Treated: '+n+' plosive'+(n===1?'':'s')+(old&&+g('albrd').value?', '+old[1]:'');return o};
}catch(e){try{console.error('Audio Lab step 7',e)}catch(x){}}})();

;
/* ==================== Script 1047 id="amiyo-al-s01-mono-vox-warning" ==================== */
(function(){try{
/* Audio Lab test step 1 fix: "Remove the voice" needs a stereo file. On a mono file it used to finish with a plain "Done" and change nothing. Now the final message says so clearly. */
var M=document.getElementById('alm');if(!M||M.getAttribute('data-s01mv'))return;M.setAttribute('data-s01mv','1');
var n=M.querySelector('#aln'),z=M.querySelector('#alz1');if(!n||!z)return;var busy=0;
new MutationObserver(function(){if(busy)return;var t=n.textContent;if(!/^Done/.test(t)||z.value!=='vox'||window.__alMonoDone)return;
 var st=(window.__alst&&window.__alst())||{};if(!st.src||st.src.numberOfChannels>1)return;
 busy=1;n.textContent='⚠ Nothing was removed: "Remove the voice" needs a stereo file and this one is mono. Pick "Remove background sound" instead, or load a stereo song. '+t;n.style.color='#ffb454';setTimeout(function(){n.style.color=''},6000);setTimeout(function(){busy=0},50)}).observe(n,{childList:true,characterData:true,subtree:true});
}catch(e){try{console.error('Audio Lab test step 1',e)}catch(x){}}})();

;
/* ==================== Script 1048 id="amiyo-al-s02-vox-engine" ==================== */
(function(){try{
/* Audio Lab test step 2: stronger, cleaner "Remove the voice". The old mask only compared the phase of left and right. This engine also compares their loudness (a voice panned slightly off-centre is still found), sharpens the decision, and smooths it over time so it does not warble. Frequency = bass below it is always kept. */
var V=window.__alVocal;if(!V||V.__s02)return;
var N=4096,H=1024,B=N/2+1,W=new Float32Array(N);for(var i=0;i<N;i++)W[i]=.5-.5*Math.cos(2*Math.PI*i/N);
function fft(re,im){var n=re.length,j=0;for(var i=1;i<n;i++){var b=n>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){var t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t}}for(var len=2;len<=n;len<<=1){var a=-2*Math.PI/len,wr=Math.cos(a),wi=Math.sin(a),h=len>>1;for(var s=0;s<n;s+=len){var cr=1,ci=0;for(var k=0;k<h;k++){var u=s+k,v=u+h,xr=re[v]*cr-im[v]*ci,xi=re[v]*ci+im[v]*cr;re[v]=re[u]-xr;im[v]=im[u]-xi;re[u]+=xr;im[u]+=xi;var t2=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=t2}}}}
var old=V.spectral;
async function removeVoice(r,s,fc){s=1-(1-s)*(1-s);var n=r.length,L=r.getChannelData(0),R=r.getChannelData(1),sr=r.sampleRate,oL=new Float32Array(n+2*N),oR=new Float32Array(n+2*N),fr=Math.ceil((n+N)/H),r1=new Float32Array(N),i1=new Float32Array(N),r2=new Float32Array(N),i2=new Float32Array(N),kc=Math.round(fc/sr*N),ms=new Float32Array(B),raw=new Float32Array(B),gp=new Float32Array(B).fill(1),f,i,k;
for(f=0;f<fr;f++){var o=f*H-N;
 for(i=0;i<N;i++){var p=o+i,ok=p>=0&&p<n;r1[i]=ok?L[p]*W[i]:0;i1[i]=0;r2[i]=ok?R[p]*W[i]:0;i2[i]=0}
 fft(r1,i1);fft(r2,i2);
 for(k=0;k<B;k++){var a=r1[k],b=i1[k],c=r2[k],d=i2[k],mL=Math.sqrt(a*a+b*b),mR=Math.sqrt(c*c+d*d),mx=mL>mR?mL:mR,mn=mL>mR?mR:mL,cs=mx>1e-9?(a*c+b*d)/(mL*mR+1e-20):0;cs=cs<0?0:cs>1?1:cs;var bal=mx>1e-9?mn/mx:0;raw[k]=cs*cs*bal}
 for(k=0;k<B;k++){var m=(raw[k>0?k-1:0]+2*raw[k]+raw[k<B-1?k+1:B-1])/4;ms[k]+=(m-ms[k])*(m>ms[k]?.85:.4);var x=(ms[k]-.2)/.6;x=x<0?0:x>1?1:x;x=x*x*(3-2*x);var g=1-s*.985*x;if(k<=kc)g=1;gp[k]+=(g-gp[k])*(g<gp[k]?.9:.5);g=gp[k];
  r1[k]*=g;i1[k]*=g;r2[k]*=g;i2[k]*=g;if(k>0&&k<B-1){r1[N-k]*=g;i1[N-k]*=g;r2[N-k]*=g;i2[N-k]*=g}}
 fft(i1,r1);fft(i2,r2);for(i=0;i<N;i++){var q=o+i;if(q>=0&&q<n){oL[q]+=r1[i]/N*W[i]/1.5;oR[q]+=r2[i]/N*W[i]/1.5}}
 if(f%40===39){if(window.__alCancel)throw new Error('Cancelled');var m2=document.querySelector('#alm #aln');if(m2)m2.textContent='Removing the voice… '+Math.round(f/fr*100)+'%';await new Promise(function(z){setTimeout(z,0)})}}
for(i=0;i<n;i++){L[i]=oL[i];R[i]=oR[i]}}
V.spectral=function(r,mode,s,fc){return mode==='rs'?removeVoice(r,s,fc):old.apply(this,arguments)};V.removeVoice=removeVoice;V.__s02=1;
var h=document.querySelector('#alm #alzh');if(h){var ob=new MutationObserver(function(){if(/^Removes what is in the centre/.test(h.textContent)&&!/Handles voices/.test(h.textContent)){h.textContent+=' Handles voices that are slightly off-centre; the frequency slider keeps the bass below it.'}});ob.observe(h,{childList:true,characterData:true,subtree:true})}
}catch(e){try{console.error('Audio Lab test step 2',e)}catch(x){}}})();

;
/* ==================== Script 1049 id="amiyo-al-s03-keep-level" ==================== */
(function(){try{
/* Audio Lab test step 3: "Keep voice level" for Remove background sound. Removing the background used to make the voice about 6 dB quieter on some files. Now the loud (speaking) level is measured before and after and the voice is brought back to where it was (never more than +6 dB, never into clipping). A short report says how much background was removed. */
var M=document.getElementById('alm'),Z=window.__alZ;if(!M||!Z||M.getAttribute('data-s03'))return;M.setAttribute('data-s03','1');
var g=function(i){return M.querySelector('#'+i)},sec=g('alzsec');if(!sec)return;
var box=document.createElement('div');box.innerHTML='<label style="margin:6px 0 0;display:flex;gap:8px;align-items:center"><input type="checkbox" id="alzkeep" checked> Keep the voice at its original loudness</label><div id="alzrep" style="font-size:12px;opacity:.85;margin-top:4px"></div>';
var anchor=g('alzh');(anchor&&anchor.parentNode?anchor.parentNode:sec.querySelector('.alin')).insertBefore(box,anchor||null);
function stat(d,sr){var bl=Math.max(1,Math.round(sr*.05)),db=[];for(var s=0;s+bl<=d.length;s+=bl){var q=0;for(var i=s;i<s+bl;i++)q+=d[i]*d[i];db.push(10*Math.log10(q/bl+1e-12))}if(db.length<4)return null;db.sort(function(a,b){return a-b});var h=db.slice(Math.floor(db.length*.6)),m=0;h.forEach(function(v){m+=v});return{p10:db[Math.floor(db.length*.1)],p90:m/h.length}}
window.__alzLast=[];var zi=Z.isolate;
Z.isolate=async function(d,sr){var pre=stat(d,sr),x=await zi.apply(this,arguments),post=stat(x,sr);window.__alzLast.push({pre:pre,post:post});return x};
var pt=window.__alTP;
window.__alTP=async function(r){window.__alzLast=[];var o=pt?await pt.apply(this,arguments):r;var rep=g('alzrep');
 if(!o||g('alz1').value!=='bg'||!window.__alzLast.length){if(rep&&g('alz1').value!=='bg')rep.textContent='';return o}
 var L=window.__alzLast.filter(function(x){return x.pre&&x.post});if(!L.length)return o;
 var av=function(f){var t=0;L.forEach(function(x){t+=f(x)});return t/L.length},loss=av(function(x){return x.pre.p90-x.post.p90}),bg=av(function(x){return x.pre.p10-x.post.p10}),gain=0;
 if(g('alzkeep').checked&&loss>.5){var pk=0;for(var c=0;c<o.numberOfChannels;c++){var d=o.getChannelData(c);for(var i=0;i<d.length;i++){var a=d[i]<0?-d[i]:d[i];if(a>pk)pk=a}}
  gain=Math.max(0,Math.min(loss,6,pk>0?20*Math.log10(.97/pk):0));var k=Math.pow(10,gain/20);if(gain>.05)for(c=0;c<o.numberOfChannels;c++){var e=o.getChannelData(c);for(i=0;i<e.length;i++)e[i]*=k}}
 if(rep)rep.textContent='Background reduced by about '+Math.max(0,bg).toFixed(0)+' dB'+(gain>.05?'; voice brought back up by '+gain.toFixed(1)+' dB.':'.')+' Use 🅱 A/B to compare with the original.';
 return o};
}catch(e){try{console.error('Audio Lab test step 3',e)}catch(x){}}})();

;
/* ==================== Script 1050 id="amiyo-al-s04-auto-voice-report" ==================== */
(function(){try{
/* Audio Lab test step 4: safer, clearer Auto-enhance voice. Before it starts, clipped peaks are repaired and a DC offset is removed (so the noise and loudness measurements are not fooled). When it finishes, a Before / After report shows the clean-vs-noise gap, speech level, clipped peaks and warnings (very quiet recording, already clean file). */
var M=document.getElementById('alm'),Z=window.__alZ;if(!M||!Z||M.getAttribute('data-s04'))return;M.setAttribute('data-s04','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}},wait=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
var b0=g('alautom'),rep=document.createElement('div');rep.id='alerep';rep.style.cssText='font-size:12.5px;line-height:1.5;margin:8px 0;padding:8px 10px;border-radius:8px;background:rgba(255,255,255,.06);display:none;white-space:pre-line';
if(b0&&b0.parentNode)b0.parentNode.parentNode.insertBefore(rep,b0.parentNode.nextSibling);else return;
var go=0;
function clips(b,a,e){var n=0;for(var c=0;c<b.numberOfChannels;c++){var d=b.getChannelData(c);for(var i=a;i<e;i++){var v=d[i]<0?-d[i]:d[i];if(v>=.995)n++}}return n}
async function until(re,ms){var t0=Date.now();while(Date.now()-t0<ms){await wait(200);if(re.test(g('aln').textContent))return true}return false}
M.addEventListener('click',async function(ev){var t=ev.target&&ev.target.closest&&ev.target.closest('#alauto');if(!t||go)return;
 ev.stopImmediatePropagation();ev.preventDefault();var s=S();if(!s.src){g('aln').textContent='Choose a file first.';return}
 go=1;try{var lines=[],src=s.src,a=Math.floor(src.length*g('als').value/100),e=Math.max(a+1,Math.floor(src.length*g('ale').value/100)),c0=clips(src,a,e);
  if(c0>=20&&g('alrp3')){g('aln').textContent='Repairing clipped peaks first…';g('alrp3').click();await until(/^(Repaired|No clipping)/,15000);lines.push('Clipping: '+c0+' samples at the ceiling → repaired')}
  var sc=window.__alRepair&&window.__alRepair.scan(S().src);if(sc&&Math.max.apply(null,sc.dc.map(Math.abs))>.005&&g('alrp4')){g('alrp4').click();await wait(900);lines.push('DC offset removed')}
  var s2=S().src,a2=Math.floor(s2.length*g('als').value/100),e2=Math.max(a2+1,Math.floor(s2.length*g('ale').value/100)),pre=Z.analyze(s2,+g('als').value,+g('ale').value);
  g('aln').textContent='Auto-enhance starting…';await wait(30);go=2;g('alauto').click();go=1;
  var ok=await until(/^Done/,180000);if(!ok){rep.style.display='none';return}
  await wait(300);var o=S().out,post=o&&Z.analyze(o,0,100),pr=[];
  if(pre&&pre.ok&&post&&post.ok){pr.push('Before → After');pr.push('Clean-vs-noise gap: '+pre.snr.toFixed(0)+' dB → '+post.snr.toFixed(0)+' dB'+(post.snr>pre.snr+3?'  ✓ cleaner':''));pr.push('Speech level (RMS): '+pre.p90.toFixed(0)+' dB → '+post.p90.toFixed(0)+' dB');
   if(pre.p90<-50)pr.push('⚠ Very quiet recording: the cleaned result may still sound thin. Recording closer to the microphone will help more than any filter.');
   else if(pre.snr>=45&&pre.rumble<.1)pr.push('ℹ This file was already clean, so only a light touch (loudness and tone) was applied.');
   if(post.snr<pre.snr+1&&pre.snr<30)pr.push('⚠ The gap barely improved. If the background is music or other people talking, try "Remove background sound".')}
  lines.forEach(function(l){pr.unshift(l)});rep.textContent=pr.join('\n');rep.style.display=pr.length?'block':'none'
 }catch(err){try{console.error('Audio Lab test step 4',err)}catch(x){}}finally{go=0}},true);
}catch(e){try{console.error('Audio Lab test step 4',e)}catch(x){}}})();

;
/* ==================== Script 1051 id="amiyo-al-s05-auto-music" ==================== */
(function(){try{
/* Audio Lab test step 5: smarter Auto-enhance music. It measures the tone (how bright or dark the music is across the spectrum), the bass weight, the dynamics and the stereo width, repairs clipping first, then picks a gentle mastering chain: high-pass, low and high EQ, compression, stereo width trim, loudness and limiter. A Before → After report says what it found and what it did. */
var M=document.getElementById('alm'),Z=window.__alZ;if(!M||!Z||M.getAttribute('data-s05'))return;M.setAttribute('data-s05','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}},wait=function(ms){return new Promise(function(r){setTimeout(r,ms)})},cl=function(v,a,b){return Math.max(a,Math.min(b,v))};
function fire(e){e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))}
function setv(id,v){var e=g(id);if(!e)return;e.value=v;fire(e)}
var N=4096,HW=new Float32Array(N);for(var q=0;q<N;q++)HW[q]=.5-.5*Math.cos(2*Math.PI*q/N);
function fft(re,im){var n=re.length,j=0;for(var i=1;i<n;i++){var b=n>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){var t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t}}for(var len=2;len<=n;len<<=1){var a=-2*Math.PI/len,wr=Math.cos(a),wi=Math.sin(a),h=len>>1;for(var s=0;s<n;s+=len){var cr=1,ci=0;for(var k=0;k<h;k++){var u=s+k,v=u+h,xr=re[v]*cr-im[v]*ci,xi=re[v]*ci+im[v]*cr;re[v]=re[u]-xr;im[v]=im[u]-xi;re[u]+=xr;im[u]+=xi;var t2=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=t2}}}}
/* tone slope above 500 Hz (dB per octave, power density) + stereo width and correlation */
function tone(b,pa,pe){var n=b.length,i0=Math.floor(n*pa/100),i1=Math.max(i0+N,Math.floor(n*pe/100));if(i1>n)i1=n;if(i1-i0<N)return null;var L=b.getChannelData(0),R=b.numberOfChannels>1?b.getChannelData(1):L,sr=b.sampleRate,B=N/2+1,fr=[],st=Math.max(N,Math.floor((i1-i0-N)/200)),s,i;
 for(s=i0;s+N<=i1;s+=st){var e=0;for(i=s;i<s+N;i+=8){var m=(L[i]+R[i])/2;e+=m*m}fr.push([e,s])}
 var so=fr.slice().sort(function(x,y){return x[0]-y[0]}),med=so[Math.floor(so.length*.4)][0],use=fr.filter(function(x){return x[0]>=med&&x[0]>1e-12}).slice(0,120);if(!use.length)return null;
 var pw=new Float64Array(B),re=new Float32Array(N),im=new Float32Array(N);
 use.forEach(function(u){for(i=0;i<N;i++){re[i]=(L[u[1]+i]+R[u[1]+i])/2*HW[i];im[i]=0}fft(re,im);for(var k=0;k<B;k++)pw[k]+=re[k]*re[k]+im[k]*im[k]});
 var hz=sr/N,xs=[],ys=[],f=500;while(f*1.26<Math.min(14000,sr/2-500)){var k1=Math.round(f/hz),k2=Math.round(f*1.26/hz),sum=0;for(var k=k1;k<k2;k++)sum+=pw[k];ys.push(10*Math.log10(sum/(k2-k1)+1e-20));xs.push(Math.log2(f*1.12));f*=1.26}
 var mx=0,my=0;xs.forEach(function(x,j){mx+=x;my+=ys[j]});mx/=xs.length;my/=xs.length;var sxy=0,sxx=0;xs.forEach(function(x,j){sxy+=(x-mx)*(ys[j]-my);sxx+=(x-mx)*(x-mx)});var slope=sxx>0?sxy/sxx:-4.5;
 var mE=0,sE=0,lr=0,ll=0,rr=0;for(s=i0;s<i1;s+=4){var l=L[s],r=R[s],m2=(l+r)/2,d=(l-r)/2;mE+=m2*m2;sE+=d*d;lr+=l*r;ll+=l*l;rr+=r*r}
 return{slope:slope,side:10*Math.log10((sE+1e-12)/(mE+1e-12)),corr:b.numberOfChannels>1?lr/Math.sqrt(ll*rr+1e-20):1,stereo:b.numberOfChannels>1}}
function clips(b,a,e){var n=0;for(var c=0;c<b.numberOfChannels;c++){var d=b.getChannelData(c);for(var i=a;i<e;i++){var v=d[i]<0?-d[i]:d[i];if(v>=.995)n++}}return n}
async function until(re,ms){var t0=Date.now();while(Date.now()-t0<ms){await wait(200);if(re.test(g('aln').textContent))return true}return false}
var go=0,rep=g('alerep');if(!rep)return;
M.addEventListener('click',async function(ev){var t=ev.target&&ev.target.closest&&ev.target.closest('#alautom');if(!t||go)return;ev.stopImmediatePropagation();ev.preventDefault();
 var s=S();if(!s.src){g('aln').textContent='Choose a file first.';return}if(window.__alzBusy)return;go=1;window.__alzBusy=1;
 try{var done=[],src=s.src,a=Math.floor(src.length*g('als').value/100),e=Math.max(a+1,Math.floor(src.length*g('ale').value/100));
  if(clips(src,a,e)>=20&&g('alrp3')){g('aln').textContent='Repairing clipped peaks first…';g('alrp3').click();await until(/^(Repaired|No clipping)/,15000);done.push('Clipping repaired')}
  src=S().src;g('aln').textContent='Measuring the music…';await wait(30);
  var m=Z.analyze(src,+g('als').value,+g('ale').value),T=tone(src,+g('als').value,+g('ale').value);
  if(!m||!m.ok||!T){g('aln').textContent='File is too short or silent to measure. Try a longer clip.';return}
  var ps=g('alps');ps.value='rst';fire(ps);await wait(200);setv('alz1','');
  var P={aldn:0,alg:-80,ades:0,alfd:.05,alt:'-14',alk:'-1'},notes=[],say=[];
  P.alh=m.rumble>.3?35:25;
  P.aq1=m.lowMus<.15?1.5:m.lowMus>.6?-2:m.lowMus>.45?-1:0;
  var d=T.slope+4.5;P.aq2=0;P.aq3=Math.abs(d)<1.5?0:cl(Math.round((d>0?-(d-1):(-d-1))*.8*2)/2,-3,3);
  say.push(Math.abs(d)<1.5?'Tone: balanced':d>0?'Tone: bright':'Tone: dark');
  if(P.aq1)say.push(P.aq1>0?'thin bass → +'+P.aq1+' dB low':'heavy bass → '+P.aq1+' dB low');
  if(P.aq3)say.push(P.aq3>0?'+'+P.aq3+' dB treble':P.aq3+' dB treble');
  P.alct=cl(Math.round(m.p90-5),-30,-10);P.alcr=m.crest>14?2:1.5;P.alcm=2;
  say.push(m.crest>14?'very dynamic → gentle 2:1 compression':'light 1.5:1 compression');
  var sw=0;if(T.stereo){if(T.corr<.15){sw=-3;say.push('stereo is nearly out of phase (mono-compatibility risk) → side −3 dB')}else if(T.side>-3){sw=-1.5;say.push('very wide stereo → side −1.5 dB')}else if(T.side<-30)say.push('essentially mono')}
  if(sw)P.alsse=sw;
  for(var k in P)setv(k,P[k]);
  g('aln').textContent='Auto-enhance music set. Processing…';await wait(60);window.__alzBusy=0;go=2;g('alr').click();go=1;
  var ok=await until(/^Done/,180000);if(!ok){rep.style.display='none';return}
  await wait(300);var o=S().out,m2=o&&Z.analyze(o,0,100),T2=o&&tone(o,0,100),pr=done.slice();pr.push('What I found and did:  '+say.join('; '));
  if(m2&&m2.ok&&T2){pr.push('Before → After');pr.push('Tone slope: '+T.slope.toFixed(1)+' → '+T2.slope.toFixed(1)+' dB/oct  (target ≈ −4.5)');pr.push('Dynamics (loud vs average): '+m.crest.toFixed(0)+' dB → '+m2.crest.toFixed(0)+' dB')}
  rep.textContent=pr.join('\n');rep.style.display='block'
 }catch(err){try{console.error('Audio Lab test step 5',err)}catch(x){}}finally{go=0;window.__alzBusy=0}},true);
}catch(e){try{console.error('Audio Lab test step 5',e)}catch(x){}}})();

;
/* ==================== Script 1052 id="amiyo-al-s06-ab-trim-msg" ==================== */
(function(){try{
/* Audio Lab test step 6 (waveform, trim, zoom, preview all passed testing; two small clarity fixes): (1) the A/B button looked pressed and said "Listening to A" before anything was processed; it now looks dim and says to press Process first. (2) The "Trim start cannot pass the end" message stayed on screen during later actions; it now clears itself after a few seconds. */
var M=document.getElementById('alm');if(!M||M.getAttribute('data-s06'))return;M.setAttribute('data-s06','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}},n=g('aln');
window.addEventListener('click',function(e){var t=e.target&&e.target.closest&&e.target.closest('#aly-ab');if(!t||S().out)return;e.stopImmediatePropagation();e.preventDefault();var m=g('aln');if(m)m.textContent='Nothing to compare yet. Press ⚡ Process first, then use 🅱 to switch between the original and the processed sound.'},true);
setInterval(function(){if(M.style.display!=='block')return;var ab=g('aly-ab');if(!ab)return;var has=!!S().out;ab.style.opacity=has?'':'.55';ab.title=has?'Switch between original (A) and processed (B). Shortcut: B':'Press Process first, then this compares original and processed.'},700);
if(n)new MutationObserver(function(){var t=n.textContent;if(/^Trim (start|end) cannot/.test(t)){setTimeout(function(){if(n.textContent===t)n.textContent=''},3500)}}).observe(n,{childList:true,characterData:true,subtree:true});
}catch(e){try{console.error('Audio Lab test step 6',e)}catch(x){}}})();

;
/* ==================== Script 1053 id="amiyo-al-s07-record-autoenhance" ==================== */
(function(){try{
/* Audio Lab test step 7 (recording, drag-and-drop, media library, "Use selected clip", "Add to timeline" and "Replace selected clip" all passed testing, including the no-microphone message): new option "Auto-enhance my voice after recording". When it is ticked, stopping a recording immediately runs ✨ Auto-enhance voice on it, so a take is cleaned, levelled and normalised in one go. */
var M=document.getElementById('alm');if(!M||M.getAttribute('data-s07'))return;M.setAttribute('data-s07','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}},rcb=g('rcb'),n=g('aln');if(!rcb||!n)return;
var lab=document.createElement('label');lab.style.cssText='display:flex;gap:8px;align-items:center;margin:6px 0;font-size:13px';lab.innerHTML='<input type="checkbox" id="rcae"> ✨ Auto-enhance my voice after recording';
var anchor=rcb.parentNode;anchor.parentNode.insertBefore(lab,anchor.nextSibling);
try{var k=localStorage.getItem('amiyo-al-rcae');if(k==='1')g('rcae').checked=true}catch(e){}
g('rcae').addEventListener('change',function(){try{localStorage.setItem('amiyo-al-rcae',this.checked?'1':'0')}catch(e){}});
var last='';
new MutationObserver(function(){var t=n.textContent;if(t===last)return;last=t;if(!g('rcae').checked)return;
 if(/^Recording-[^ ]+\.wav — /.test(t)&&S().src){setTimeout(function(){var b=g('alauto');if(b&&/^Recording-[^ ]+\.wav — /.test(n.textContent)){n.textContent='Recording saved. Auto-enhancing your voice…';b.click()}},400)}}).observe(n,{childList:true,characterData:true,subtree:true});
}catch(e){try{console.error('Audio Lab test step 7',e)}catch(x){}}})();

;
/* ==================== Script 1054 id="amiyo-al-s08-mono-vocals-warning" ==================== */
(function(){try{
/* Audio Lab test step 1 fix: "Remove vocals" (quick, clean) and "Keep only the centre voice" need a stereo file. On a mono file they changed nothing but still said "Done. Previewing the processed audio". The message now says plainly that nothing changed and what to try instead. */
var M=document.getElementById('alm');if(!M||M.getAttribute('data-s08'))return;M.setAttribute('data-s08','1');
var n=M.querySelector('#aln'),v=M.querySelector('#alvr');if(!n||!v)return;var busy=0;
new MutationObserver(function(){if(busy)return;var t=n.textContent;if(!/^Done/.test(t)||!/^(rq|rs|ks)$/.test(v.value)||window.__alMonoDone)return;
 var st=(window.__alst&&window.__alst())||{};if(!st.src||st.src.numberOfChannels>1)return;
 busy=1;n.textContent='\u26a0 Nothing was removed: this option needs a stereo file and this one is mono (one channel, so the voice and the music cannot be told apart by position). Try "Remove background sound" instead, or load a stereo version.';n.style.color='#ffb454';setTimeout(function(){n.style.color=''},6000);setTimeout(function(){busy=0},50)}).observe(n,{childList:true,characterData:true,subtree:true});
}catch(e){try{console.error('Audio Lab test step 1b',e)}catch(x){}}})();

;
/* ==================== Script 1055 id="amiyo-al-s09-mono-voice-remove" ==================== */
(function(){try{
/* Audio Lab step 2: "Remove the voice" for MONO files. A mono file has no left/right difference to find a voice with, so this fallback tracks the pitch of the voice in every moment and turns down only the frequencies where its harmonics sit (plus a light cut across the speech band while it is speaking). Music that does not line up with the voice is kept. It reduces the voice a lot but cannot erase it as cleanly as a stereo file can; the message says so. Used by "Remove the voice", "Remove vocals" and "Keep only the centre voice" when the file is mono. */
var M=document.getElementById('alm');if(!M||M.getAttribute('data-monovox2'))return;M.setAttribute('data-monovox2','1');
var g=function(i){return M.querySelector('#'+i)},n=g('aln');if(!n||!g('alvr')||!g('alz1'))return;
var N=4096,H=1024,B=N/2+1,W=new Float32Array(N);for(var i=0;i<N;i++)W[i]=.5-.5*Math.cos(2*Math.PI*i/N);
function fft(re,im){var n=re.length,j=0;for(var i=1;i<n;i++){var b=n>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){var t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t}}for(var len=2;len<=n;len<<=1){var a=-2*Math.PI/len,wr=Math.cos(a),wi=Math.sin(a),h=len>>1;for(var s=0;s<n;s+=len){var cr=1,ci=0;for(var k=0;k<h;k++){var u=s+k,v=u+h,xr=re[v]*cr-im[v]*ci,xi=re[v]*ci+im[v]*cr;re[v]=re[u]-xr;im[v]=im[u]-xi;re[u]+=xr;im[u]+=xi;var t2=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=t2}}}}
var CA=[];for(var f=70;f<=480;f*=1.008)CA.push(f);
function pitch(lg,bin,sr){var top=Math.min(3500,sr*.45),sc=new Float32Array(CA.length),c,h,best=-1e9,bi=0;
 for(c=0;c<CA.length;c++){var K=Math.min(30,Math.floor(top/CA[c])),t=0,cnt=0;
  for(h=1;h<=K;h++){var i=Math.round(h*CA[c]/bin),m=Math.max(lg[i-1],lg[i],lg[i+1]);var j=Math.round((h+.5)*CA[c]/bin),v=(lg[j-1]+lg[j]+lg[j+1])/3;var d=m-v;d=d<-1?-1:d>5?5:d;t+=d;cnt++}
  sc[c]=t/cnt;if(sc[c]>best){best=sc[c];bi=c}}
 for(c=0;c<bi;c++)if(sc[c]>=best*.9&&sc[c]>1){bi=c;break}
 return{f0:CA[bi],s:sc[bi]}}
async function run(x,sr,s,fc,keep){var n=x.length,bin=sr/N,fr=Math.ceil((n+N)/H),F0=new Float32Array(fr),S0=new Float32Array(fr),V=new Uint8Array(fr),re=new Float32Array(N),im=new Float32Array(N),mc=new Float32Array(B+3),f,i,k;
 for(f=0;f<fr;f++){var o=f*H-N;for(i=0;i<N;i++){var p=o+i;re[i]=p>=0&&p<n?x[p]*W[i]:0;im[i]=0}fft(re,im);var e=0;for(k=0;k<B;k++){var mg=Math.sqrt(re[k]*re[k]+im[k]*im[k]);e+=mg*mg;mc[k]=Math.log(mg+1e-6)}mc[B]=mc[B-1];mc[B+1]=mc[B-1];if(e<1e-6){V[f]=0;continue}var r=pitch(mc,bin,sr);F0[f]=r.f0;S0[f]=r.s;V[f]=r.s>=1.7?1:0;
  if(f%60===59){if(window.__alCancel)throw new Error('Cancelled');n_msg('Finding the voice… '+Math.round(f/fr*50)+'%');await new Promise(function(z){setTimeout(z,0)})}}
 /* v4 step 3: a voice gets weaker at the start and end of a word. Frames that are a bit less clear (score 1.1+) but touch a clear voiced frame with a similar pitch now count as voice too */
 for(var pass=0;pass<3;pass++){for(f=1;f<fr;f++){if(!V[f]&&S0[f]>=1.1&&V[f-1]&&Math.abs(F0[f]/F0[f-1]-1)<.09)V[f]=1}for(f=fr-2;f>=0;f--){if(!V[f]&&S0[f]>=1.1&&V[f+1]&&Math.abs(F0[f]/F0[f+1]-1)<.09)V[f]=1}}
 /* smooth the pitch track: median of 5, keep only runs of 3+ voiced frames */
 var F2=new Float32Array(fr),V2=new Uint8Array(fr);for(f=0;f<fr;f++){if(!V[f])continue;var a=[];for(i=Math.max(0,f-2);i<=Math.min(fr-1,f+2);i++)if(V[i])a.push(F0[i]);a.sort(function(p,q){return p-q});F2[f]=a[a.length>>1];V2[f]=1}
 for(f=0;f<fr;f++){if(!V2[f])continue;var run=0;for(i=f;i<fr&&V2[i];i++)run++;if(run<3){for(i=f;i<f+run;i++)V2[i]=0}f+=run-1}
 var out=new Float32Array(n+2*N),gp=new Float32Array(B).fill(1),kc=Math.round(fc/bin),sp0=Math.round(250/bin),sp1=Math.round(3400/bin),lim=Math.min(4800,sr*.45),s2=1-(1-s)*(1-s);
 for(f=0;f<fr;f++){var o2=f*H-N;for(i=0;i<N;i++){var p2=o2+i;re[i]=p2>=0&&p2<n?x[p2]*W[i]:0;im[i]=0}fft(re,im);
  var gn=new Float32Array(B).fill(1);if(V2[f]){var f0=F2[f],pl=f0,ph=f0;for(i=Math.max(0,f-2);i<=Math.min(fr-1,f+2);i++)if(V2[i]){if(F2[i]<pl)pl=F2[i];if(F2[i]>ph)ph=F2[i]}for(k=sp0;k<=sp1;k++)gn[k]=1-s2*.30;for(var h=1;h*f0<lim;h++){var kk=h*f0/bin,half=2.6+.004*kk+Math.min(.35*f0/bin,h*(ph-pl)/2/bin),a0=Math.max(1,Math.floor(kk-half)),a1=Math.min(B-1,Math.ceil(kk+half));for(k=a0;k<=a1;k++){var t=Math.abs(k-kk)/half;if(t>1)continue;var gg=1-s2*.985*(.5+.5*Math.cos(Math.PI*t));if(gg<gn[k])gn[k]=gg}}}
  for(k=0;k<B;k++){var g0=k<=kc?1:gn[k];gp[k]+=(g0-gp[k])*(g0<gp[k]?.9:.5);var q=gp[k];re[k]*=q;im[k]*=q;if(k>0&&k<B-1){re[N-k]*=q;im[N-k]*=q}}
  fft(im,re);for(i=0;i<N;i++){var q2=o2+i;if(q2>=0&&q2<n)out[q2]+=re[i]/N*W[i]/1.5}
  if(f%60===59){if(window.__alCancel)throw new Error('Cancelled');n_msg('Reducing the voice… '+(50+Math.round(f/fr*50))+'%');await new Promise(function(z){setTimeout(z,0)})}}
 var vc=0;for(f=0;f<fr;f++)vc+=V2[f];
 if(keep){for(i=0;i<n;i++)x[i]=x[i]-out[i]}else{for(i=0;i<n;i++)x[i]=out[i]}
 return vc/fr}
function n_msg(t){n.textContent=t}
window.__alMonoVox={run:run};
var prev=window.__alTP;window.__alMonoDone=0;
window.__alTP=async function(r){window.__alMonoDone=0;if(!r||r.numberOfChannels>1)return prev?prev.apply(this,arguments):r;
 var vr=g('alvr'),z=g('alz1'),vm=vr.value,zm=z.value,useRS=/^(rq|rs|ks)$/.test(vm),useVox=zm==='vox';
 if(!useRS&&!useVox)return prev?prev.apply(this,arguments):r;
 var sv=useRS?+g('alvs').value/100:+g('alzstr').value/100,fc=useRS?+g('alvf').value:+g('alzfrq').value,keep=useRS&&vm==='ks';
 if(useRS)vr.value='';if(useVox)z.value='';var o;try{o=prev?await prev.apply(this,arguments):r}finally{if(useRS)vr.value=vm;if(useVox)z.value=zm}
 if(!o)return o;var frac=0;for(var c=0;c<o.numberOfChannels;c++){frac=await run(o.getChannelData(c),o.sampleRate,sv,fc,keep);/* v4 step 3: a second pass catches what the first one left (pitch glides, vibrato) */if(!keep&&frac>.02)await run(o.getChannelData(c),o.sampleRate,sv,fc,keep)}
 window.__alMonoDone=frac>.02?1:2;window.__alMonoFrac=frac;return o};
new MutationObserver(function(){var t=n.textContent;if(!/^Done/.test(t)||!window.__alMonoDone||/mono fallback/.test(t)||n.__s09)return;n.__s09=1;
 var fr=window.__alMonoFrac||0;n.textContent=window.__alMonoDone===1?'Done (mono fallback). The voice was found in '+Math.round(fr*100)+'% of the file and reduced, but a mono file can only be reduced, not erased as cleanly as a stereo one. Use \ud83c\udd71 A/B to compare. '+t.replace(/^Done\.?\s*/,''):'\u26a0 No clear singing or speaking voice was found in this mono file, so nothing was removed. Try "Remove background sound" instead.';
 if(window.__alMonoDone===2){n.style.color='#ffb454';setTimeout(function(){n.style.color=''},6000)}setTimeout(function(){n.__s09=0},60)}).observe(n,{childList:true,characterData:true,subtree:true});
}catch(e){try{console.error('Audio Lab step 2',e)}catch(x){}}})();

;
/* ==================== Script 1056 id="amiyo-al-s10-extra-clean" ==================== */
(function(){try{
/* Audio Lab step 3: "Extra clean" for stereo Remove voice. The centre-removal engine leaves a thin trace of the voice (its harmonics) because the voice is never perfectly centred. With Extra clean on, the same pitch-tracking cut used for mono files runs once more on the result, only where a voice is found. Also adds a Before/After report (voice-band level) so you can see how much was removed. */
var M=document.getElementById('alm');if(!M||M.getAttribute('data-xclean3')||!window.__alMonoVox)return;M.setAttribute('data-xclean3','1');
var g=function(i){return M.querySelector('#'+i)},n=g('aln'),vr=g('alvr'),z=g('alz1');if(!vr||!z||!n)return;
function mk(id,after){var l=document.createElement('label');l.style.cssText='margin:6px 0 0;display:flex;gap:8px;align-items:center;font-size:13px';l.innerHTML='<input type="checkbox" id="'+id+'" checked> Extra clean: also cut the voice\u2019s leftover pitch (stereo files)';var e=l.firstChild,v=null;try{v=localStorage.getItem('amiyo-al-'+id)}catch(x){}if(v!==null)e.checked=v==='1';after.parentNode.insertBefore(l,after.nextSibling)}
function ensure(){var h;if(!g('alzxc')&&(h=g('alzh')))mk('alzxc',h);if(!g('alvxc')&&(h=g('alvh')))mk('alvxc',h)}
ensure();[1500,4500,7000,10000].forEach(function(t){setTimeout(ensure,t)});var ab=document.getElementById('alb');if(ab)ab.addEventListener('click',function(){setTimeout(ensure,150)});
M.addEventListener('change',function(ev){var t=ev.target;if(t&&(t.id==='alzxc'||t.id==='alvxc')){try{localStorage.setItem('amiyo-al-'+t.id,t.checked?'1':'0')}catch(x){}}});
var on=function(i){var e=g(i);return e?e.checked:true};
function band(d,sr){var bl=Math.round(sr*.05),t=[],i,s,q;for(s=0;s+bl<=d.length;s+=bl){q=0;for(i=s;i<s+bl;i++)q+=d[i]*d[i];t.push(q/bl)}t.sort(function(a,b){return a-b});var h=t.slice(Math.floor(t.length*.6)),m=0;h.forEach(function(v){m+=v});return 10*Math.log10(m/Math.max(1,h.length)+1e-12)}
var prev=window.__alTP;
window.__alTP=async function(r){var vm=vr.value,zm=z.value,use=(vm==='rs'&&on('alvxc'))||(zm==='vox'&&on('alzxc'));
 if(!r||r.numberOfChannels<2||!use)return prev?prev.apply(this,arguments):r;
 var rs=vm==='rs',pre=band(r.getChannelData(0),r.sampleRate),o=prev?await prev.apply(this,arguments):r;if(!o)return o;
 var sv=(rs?+g('alvs').value:+g('alzstr').value)/100,fc=rs?+g('alvf').value:+g('alzfrq').value,fr=0;
 for(var c=0;c<o.numberOfChannels;c++)fr=await window.__alMonoVox.run(o.getChannelData(c),o.sampleRate,sv*.85,fc,false);
 var post=band(o.getChannelData(0),o.sampleRate);window.__alVoxRep='Loudest passages: '+pre.toFixed(0)+' dB \u2192 '+post.toFixed(0)+' dB'+(fr>.02?' (voice pitch tracked in '+Math.round(fr*100)+'% of the file).':'.');return o};
new MutationObserver(function(){var t=n.textContent;if(!/^Done/.test(t)||!window.__alVoxRep||n.__s10)return;if(window.__alMonoDone)return;n.__s10=1;n.textContent='Done. '+window.__alVoxRep+' Use \ud83c\udd71 A/B to compare with the original.';window.__alVoxRep='';setTimeout(function(){n.__s10=0},60)}).observe(n,{childList:true,characterData:true,subtree:true});
}catch(e){try{console.error('Audio Lab step 3',e)}catch(x){}}})();

;
/* ==================== Script 1057 id="amiyo-al-s11-bg-levelmatch" ==================== */
(function(){try{
/* Audio Lab step 4: Remove background sound, level matching + Before/After check. After the background is removed, the level of the speaking parts (only the parts that were clearly speech before) is compared with the original and the voice is brought back to exactly that level (up to +/-6 dB, never into clipping). The report then shows the quiet gaps and the speech level before and after, so you can see what changed. */
var M=document.getElementById('alm');if(!M||M.getAttribute('data-bglm4'))return;M.setAttribute('data-bglm4','1');
var g=function(i){return M.querySelector('#'+i)},z=g('alz1');if(!z||!g('alzrep'))return;
function blocks(r){var bl=Math.max(1,Math.round(r.sampleRate*.05)),m=Math.floor(r.length/bl),C=r.numberOfChannels,out=new Float32Array(m),d=[],c,s,i,q;for(c=0;c<C;c++)d.push(r.getChannelData(c));
 for(s=0;s<m;s++){q=0;for(c=0;c<C;c++){var x=d[c];for(i=s*bl;i<s*bl+bl;i++)q+=x[i]*x[i]}out[s]=10*Math.log10(q/(bl*C)+1e-12)}return out}
function pct(a,p){var b=Array.prototype.slice.call(a).sort(function(x,y){return x-y});return b[Math.min(b.length-1,Math.floor(b.length*p))]}
function pm(a,idx){var t=0;for(var i=0;i<idx.length;i++)t+=Math.pow(10,a[idx[i]]/10);return 10*Math.log10(t/Math.max(1,idx.length)+1e-12)}
var prev=window.__alTP;
window.__alTP=async function(r){if(!r||z.value!=='bg')return prev?prev.apply(this,arguments):r;
 var a=blocks(r),n0=r.length,o=prev?await prev.apply(this,arguments):r;if(!o||o.length!==n0||a.length<8)return o;
 var fl=pct(a,.1),top=pct(a,.95),thr=fl+.5*(top-fl),idx=[];for(var i=0;i<a.length;i++)if(a[i]>thr)idx.push(i);
 var b=blocks(o),sp0=idx.length?pm(a,idx):top,sp1=idx.length?pm(b,idx):pct(b,.95),gain=0,keep=g('alzkeep')?g('alzkeep').checked:true;
 if(keep&&idx.length>=4){var pk=0,c,k;for(c=0;c<o.numberOfChannels;c++){var d=o.getChannelData(c);for(k=0;k<d.length;k++){var v=d[k]<0?-d[k]:d[k];if(v>pk)pk=v}}
  gain=Math.max(-6,Math.min(6,sp0-sp1));if(pk>0)gain=Math.min(gain,20*Math.log10(.97/pk));
  if(Math.abs(gain)>.1){var m=Math.pow(10,gain/20);for(c=0;c<o.numberOfChannels;c++){var e=o.getChannelData(c);for(k=0;k<e.length;k++)e[k]*=m}}else gain=0}
 var fl1=pct(blocks(o),.1),sp2=sp1+gain,lines=['Before \u2192 After'];
 lines.push('Quiet gaps: '+fl.toFixed(0)+' \u2192 '+fl1.toFixed(0)+' dB'+(fl-fl1>=3?' ('+(fl-fl1).toFixed(0)+' dB quieter)':' (little change \u2014 try a higher strength)'));
 lines.push('Speech level: '+sp0.toFixed(0)+' \u2192 '+sp2.toFixed(0)+' dB'+(keep?(Math.abs(sp2-sp0)<=1.5?' \u2713 level matched':' (could not fully match: limited to \u00b16 dB and to avoid clipping)'):' (level matching is off)'));
 lines.push('Use \ud83c\udd71 A/B to hear the original.');
 if(idx.length<4)lines.push('\u26a0 Very little speech was found, so the level could not be measured reliably.');
 var rep=g('alzrep');if(rep){rep.style.whiteSpace='pre-line';rep.textContent=lines.join('\n')}return o};
}catch(e){try{console.error('Audio Lab step 4',e)}catch(x){}}})();

;
/* ==================== Script 1058 id="amiyo-al-s12-auto-voice-smart" ==================== */
(function(){try{
/* Audio Lab step 5: smarter Auto-enhance voice. It now measures more than before: room echo (reverb tail after words end), how muffled or harsh the voice is (clarity: 2-5 kHz against 200-600 Hz), boominess, sibilance and the noise gap. From that it picks: de-reverb only when echo is really heard, a gentler noise cut on files that are already clean (less "underwater" sound), a tone boost sized to how muffled the voice is, a de-esser sized to the sibilance, and compression sized to the dynamics. The plan and the measurements are kept in window.__alVoicePlan for the quality report. */
var M=document.getElementById('alm'),Z=window.__alZ;if(!M||!Z||M.getAttribute('data-v5smart'))return;M.setAttribute('data-v5smart','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}},msg=function(t){g('aln').textContent=t};
var wait=function(ms){return new Promise(function(r){setTimeout(r,ms)})},cl=function(v,a,b){return Math.max(a,Math.min(b,v))};
function fire(e){e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))}
function setv(id,v){var e=g(id);if(!e)return;if(e.type==='checkbox')e.checked=!!v;else e.value=v;fire(e)}
var N=2048,B=N/2+1,W=new Float32Array(N);for(var q=0;q<N;q++)W[q]=.5-.5*Math.cos(2*Math.PI*q/N);
function fft(re,im){var n=re.length,j=0;for(var i=1;i<n;i++){var b=n>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){var t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t}}for(var len=2;len<=n;len<<=1){var a=-2*Math.PI/len,wr=Math.cos(a),wi=Math.sin(a),h=len>>1;for(var s=0;s<n;s+=len){var cr=1,ci=0;for(var k=0;k<h;k++){var u=s+k,v=u+h,xr=re[v]*cr-im[v]*ci,xi=re[v]*ci+im[v]*cr;re[v]=re[u]-xr;im[v]=im[u]-xi;re[u]+=xr;im[u]+=xi;var t2=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=t2}}}}
function mono(b,i0,i1){var d0=b.getChannelData(0),d1=b.numberOfChannels>1?b.getChannelData(1):d0,x=new Float32Array(i1-i0);for(var i=i0;i<i1;i++)x[i-i0]=(d0[i]+d1[i])/2;return x}
/* extra measurements: clarity (dB), reverb tail score 0..1 */
function deep(b,a,e){var n=b.length,i0=Math.floor(n*a/100),i1=Math.max(i0+N,Math.floor(n*e/100)),x=mono(b,i0,Math.min(n,i1)),sr=b.sampleRate,bl=Math.max(1,Math.round(sr*.05)),db=[],s,i,q;
 for(s=0;s+bl<=x.length;s+=bl){q=0;for(i=s;i<s+bl;i++)q+=x[i]*x[i];db.push(10*Math.log10(q/bl+1e-12))}
 var r={clarity:null,reverb:0,events:0};if(db.length<10)return r;
 var so=db.slice().sort(function(p,q2){return p-q2}),p10=so[Math.floor(so.length*.1)],p90=so[Math.floor(so.length*.9)],sc=[];
 /* echo: after a loud block, how long (seconds) until the level has fallen 20 dB? Dry rooms fall in ~0.1-0.2 s, echoey rooms take 0.4 s or more. Stops if a new word starts. */
 for(i=1;i<db.length-12;i++){if(db[i]>p90-5&&db[i]>=db[i-1]&&db[i+1]<db[i]-2){var lim=Math.max(db[i]-20,p10+3),kk=1,ok=false;if(db[i]-p10<10)continue;for(;kk<=11;kk++){if(db[i+kk]<=lim){ok=true;break}if(kk>1&&db[i+kk]>db[i+kk-1]+3)break}if(ok||kk>11)sc.push(kk>11?.6:kk*.05)}}
 r.events=sc.length;if(sc.length>=3){sc.sort(function(p,q2){return p-q2});r.t20=sc[sc.length>>1];r.reverb=cl((r.t20-.1)/.6,0,1)}
 /* clarity from loud frames */
 var re=new Float32Array(N),im=new Float32Array(N),ac=new Float64Array(B),c=0,step=Math.max(N,Math.floor(x.length/120)),hz=sr/N;
 for(s=0;s+N<=x.length&&c<120;s+=step){var ee=0;for(i=0;i<N;i++){re[i]=x[s+i]*W[i];im[i]=0;ee+=x[s+i]*x[s+i]}if(10*Math.log10(ee/N+1e-12)<p90-6)continue;fft(re,im);for(var k=0;k<B;k++)ac[k]+=re[k]*re[k]+im[k]*im[k];c++}
 if(c>0){var bd=function(a1,a2){var t=0,cnt=0;for(var k2=Math.max(1,Math.round(a1/hz));k2<=Math.min(B-1,Math.round(a2/hz));k2++){t+=ac[k2];cnt++}return t/Math.max(1,cnt)+1e-18};r.clarity=10*Math.log10(bd(2000,5000)/bd(200,600))}
 return r}
async function enhance(){var s=S();if(!s.src){msg('Choose a file first.');return}
 if(window.__alzBusy)return;window.__alzBusy=1;
 try{var a=+g('als').value,e=+g('ale').value;msg('Measuring the voice…');await wait(30);
  var m=Z.analyze(s.src,a,e);if(!m||!m.ok){msg('File is too short or silent to measure. Try a longer clip.');return}
  var d=deep(s.src,a,e),note=[],P={},clean=m.snr>=45&&m.rumble<.1;
  setv('alps','rst');g('alps').value='rst';fire(g('alps'));await wait(150);setv('alz1','');setv('aldrv',0);
  /* noise: gentler on clean files, firmer on noisy ones */
  P.aldn=clean?10:m.snr<12?75:m.snr<20?60:m.snr<30?45:m.snr<40?30:18;
  P.alh=m.rumble>.25?120:m.rumble>.1?100:80;
  P.alg=(m.snr>=20&&!clean)?cl(Math.round(m.p10+6),-65,-45):-80;
  /* sibilance */
  P.ades=m.sib>.6?-24:m.sib>.45?-28:m.sib>.3?-34:0;
  /* tone: size the boost to how muffled it is */
  var cla=d.clarity,pres=0;if(cla!==null){pres=cla<-26?3.5:cla<-21?2.5:cla<-16?1.5:cla<-12?.5:cla>-4?-1.5:cla>-7?-.5:0}else pres=m.pres<=0?0:1;
  P.aq2=pres;P.aq1=m.boom>2?-3:m.boom>1.5?-2:m.boom>1.1?-1:0;P.aq3=m.air<1e-4?2:m.air<1e-3?1:0;
  /* dynamics */
  P.alct=cl(Math.round(m.p90-8),-40,-14);P.alcr=m.crest>20?4:m.crest>18?3.5:m.crest>12?3:2.5;P.alcm=3;P.alfd=.05;P.alt='-16';P.alk='-1';
  /* echo */
  var rv=0,rt=.8;if(d.events>=3&&d.t20>=.3){rv=d.t20>=.7?55:d.t20>=.5?40:28;rt=d.t20>=.7?1.4:d.t20>=.5?1.0:.7}
  note.push('noise cut '+P.aldn+'%'+(clean?' (light: the file is already clean)':''),'high-pass '+P.alh+' Hz');
  if(P.alg>-80)note.push('gate '+P.alg+' dB');if(P.ades)note.push('de-esser');
  if(pres>=1)note.push('clarity +'+pres+' dB (voice sounded muffled)');else if(pres<=-1)note.push('presence '+pres+' dB (voice sounded harsh)');
  if(P.aq1)note.push('boom '+P.aq1+' dB');if(rv)note.push('echo reduction '+rv+'%');note.push('\u221216 LUFS');
  for(var k in P)setv(k,P[k]);
  if(rv&&g('aldrv')){setv('aldrv',rv);setv('aldrt',rt)}
  var h=g('alhd');if(h){h.click();await wait(700);if(g('alhm')&&g('alhm').value!=='0')note.push('hum '+g('alhm').value+' Hz removed')}
  window.__alVoicePlan={m:m,d:d,P:P,rv:rv,rt:rt,clean:clean,notes:note};
  msg('Auto-enhance set (measured: noise gap '+m.snr.toFixed(0)+' dB, '+(cla!==null?'clarity '+cla.toFixed(0)+' dB, ':'')+(d.events>=3?'echo '+Math.round(d.reverb*100)+'%':'echo not measurable')+'): '+note.join(', ')+'. Processing\u2026');
  await wait(60);g('alr').click()
 }finally{window.__alzBusy=0}}
var o=g('alauto');if(o){var n=o.cloneNode(true);o.parentNode.replaceChild(n,o);n.addEventListener('click',enhance);n.title='Measures your voice file (noise, echo, muffled or harsh tone, sibilance, dynamics), then sets only what it needs and processes it'}
window.__alVoiceDeep=deep;
}catch(e){try{console.error('Audio Lab step 5',e)}catch(x){}}})();

;
/* ==================== Script 1059 id="amiyo-al-s13-voice-report" ==================== */
(function(){try{
/* Audio Lab step 6: voice quality report. After Auto-enhance voice, shows a 0-100 score Before -> After (noise, loudness, clarity, echo, clipping), what was changed, and tips for anything still weak. */
var M=document.getElementById('alm'),Z=window.__alZ,D=window.__alVoiceDeep;if(!M||!Z||!D||M.getAttribute('data-v6rep'))return;M.setAttribute('data-v6rep','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}},cl=function(v,a,b){return Math.max(a,Math.min(b,v))};
function clips(b){var n=0;for(var c=0;c<b.numberOfChannels;c++){var d=b.getChannelData(c);for(var i=0;i<d.length;i++){var v=d[i]<0?-d[i]:d[i];if(v>=.995)n++}}return n}
function sc(m,d,cp){var noise=cl((m.snr-10)/35*100,0,100),lv=m.p90,level=cl(100-Math.max(0,-18-lv,lv+10)*6,0,100),cla=d.clarity===null?70:cl(100-Math.max(0,-14-d.clarity,d.clarity+6)*5,0,100),echo=d.events>=3?cl(100-(d.t20-.1)/.5*100,0,100):90,clip=cl(100-cp/2,0,100);
 return{noise:noise,level:level,clarity:cla,echo:echo,clip:clip,total:Math.round(noise*.3+level*.15+cla*.2+echo*.2+clip*.15)}}
var lbl={noise:'Background noise',level:'Voice level',clarity:'Clarity',echo:'Echo / room',clip:'Clipping'};
function bar(v){var n=Math.round(v/10);return '\u2588'.repeat(n)+'\u2591'.repeat(10-n)}
var last=null,n=g('aln');
function report(){var P=window.__alVoicePlan,s=S();if(!P||P.rep||!s.out||!s.src)return;P.rep=1;
 var mo=Z.analyze(s.out,0,100),dO=D(s.out,0,100);if(!mo||!mo.ok)return;
 var a=sc(P.m,P.d,clips(s.src)),b=sc(mo,dO,clips(s.out)),L=['\ud83c\udf99 Voice quality: '+a.total+' \u2192 '+b.total+' / 100'+(b.total>a.total+2?'  \u2713 better':b.total<a.total-2?'  \u26a0 lower':'  (about the same)')],tips=[];
 Object.keys(lbl).forEach(function(k){L.push(lbl[k]+': '+bar(a[k])+' '+Math.round(a[k])+' \u2192 '+bar(b[k])+' '+Math.round(b[k]))});
 L.push('Changed: '+P.notes.join(', '));
 if(b.noise<60)tips.push('still noisy: try Remove background sound');if(b.echo<60)tips.push('room echo remains: raise De-reverb or record closer to the mic');if(b.clarity<55)tips.push('tone is off: adjust the EQ');if(b.clip<80)tips.push('clipping: record quieter next time');if(b.level<70)tips.push('level is off: use Normalize');
 if(b.total>=85)tips.push('sounds good, ready to export');if(tips.length)L.push('Tips: '+tips.join('; ')+'.');
 var r=g('alerep');if(!r)return;r.style.whiteSpace='pre-wrap';r.style.fontFamily='ui-monospace,monospace';r.textContent=L.join('\n')+(r.textContent&&/^Before/.test(r.textContent)?'\n\n'+r.textContent:'');r.style.display='block'}
new MutationObserver(function(){if(/^Done/.test(n.textContent))setTimeout(function(){try{report()}catch(e){console.error('Audio Lab step 6',e)}},1800)}).observe(n,{childList:true,characterData:true,subtree:true});
}catch(e){try{console.error('Audio Lab step 6',e)}catch(x){}}})();

;
/* ==================== Script 1060 id="amiyo-al-s14-music-genre" ==================== */
(function(){try{
/* Audio Lab step 7: genre-aware Auto-enhance music. It guesses the style from the sound (bass weight and dynamics): Electronic / Hip-hop (bass kept (no bass cut), firmer compression, louder), Acoustic / Classical / Jazz (dynamics kept, almost no compression, quieter), or Rock / Pop (balanced). A "Style" menu next to the button lets you override the guess. The tone, bass-fix and stereo checks of the older music enhance still run; this step then adjusts compression, loudness target and bass to the style, and the report names the style. */
var M=document.getElementById('alm'),Z=window.__alZ;if(!M||!Z||M.getAttribute('data-v7genre'))return;M.setAttribute('data-v7genre','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}},wait=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
function fire(e){e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))}
function setv(id,v){var e=g(id);if(!e)return;e.value=v;fire(e)}
var btn=g('alautom');if(!btn)return;
var sel=document.createElement('select');sel.id='alstyle';sel.title='Style used by Auto-enhance music';sel.style.cssText='margin-left:6px';
sel.innerHTML='<option value="">Style: auto-detect</option><option value="edm">Electronic / Hip-hop</option><option value="ac">Acoustic / Classical / Jazz</option><option value="rock">Rock / Pop</option>';
btn.parentNode.appendChild(sel);
var lt=g('alt');if(lt)[['-12','\u221212 LUFS (loud / club)'],['-18','\u221218 LUFS (dynamic music)']].forEach(function(o){var h=false;for(var i=0;i<lt.options.length;i++)if(lt.options[i].value===o[0])h=true;if(!h){var e=document.createElement('option');e.value=o[0];e.textContent=o[1];lt.appendChild(e)}});
var ST={edm:{name:'Electronic / Hip-hop',ct:2.5,lufs:-12,note:'bass kept (no bass cut), firmer 2.5:1 compression, \u221212 LUFS'},ac:{name:'Acoustic / Classical / Jazz',ct:1.2,lufs:-18,note:'dynamics kept (almost no compression), \u221218 LUFS'},rock:{name:'Rock / Pop',ct:2,lufs:-14,note:'balanced 2:1 compression, \u221214 LUFS'}};
function guess(m){if(m.lowMus>.4&&m.crest<12)return'edm';if(m.crest>=12&&m.lowMus<.35)return'ac';return'rock'}
var pend=null;
window.addEventListener('click',function(ev){var t=ev.target&&ev.target.closest&&ev.target.closest('#alautom');if(!t)return;var s=S();if(!s.src)return;
 var m=Z.analyze(s.src,+g('als').value,+g('ale').value);if(!m||!m.ok)return;var k=sel.value||guess(m);pend={k:k,auto:!sel.value,m:m}},true);
window.addEventListener('click',function(ev){var t=ev.target&&ev.target.closest&&ev.target.closest('#alr');if(!t||!pend)return;var p=pend;pend=null;var c=ST[p.k];
 setv('alcr',c.ct);setv('alt',String(c.lufs));
 if(p.k==='ac'){setv('aq1',0);setv('alcm',0)}else if(p.k==='edm'){var q=g('aq1');if(q&&+q.value<0)setv('aq1',0);setv('alcm',3)}
 window.__alGenre={k:p.k,auto:p.auto,name:c.name,note:c.note};
 var n=g('aln'),o=new MutationObserver(function(){if(/^Done/.test(n.textContent)){o.disconnect();setTimeout(function(){var r=g('alerep');if(r){r.style.display='block';r.textContent='\ud83c\udfb5 Style: '+c.name+(p.auto?' (auto-detected guess; change it in the Style menu)':' (your choice)')+' \u2192 '+c.note+'\n'+r.textContent.replace(/light 1\.5:1 compression|very dynamic \u2192 gentle 2:1 compression/,'compression set by style').replace(p.k==='edm'?/heavy bass \u2192 -?[\d.]+ dB low/:/$^/,'heavy bass kept')}},1500)}});o.observe(n,{childList:true,characterData:true,subtree:true});setTimeout(function(){o.disconnect()},240000)},true);
}catch(e){try{console.error('Audio Lab step 7',e)}catch(x){}}})();

;
/* ==================== Script 1061 id="amiyo-al-s15-master-check" ==================== */
(function(){try{
/* Audio Lab step 8: mastering Before/After check for Auto-enhance music: level (RMS), peak, loudness range (peak minus RMS), bass share and stereo width, with plain warnings (peak too hot, over-compressed, bass changed a lot, phase problem). */
var M=document.getElementById('alm'),Z=window.__alZ;if(!M||!Z||M.getAttribute('data-v8chk'))return;M.setAttribute('data-v8chk','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}};
function meas(b){var L=b.getChannelData(0),R=b.numberOfChannels>1?b.getChannelData(1):L,n=b.length,pk=0,e=0,sE=0,lr=0,ll=0,rr=0;for(var i=0;i<n;i+=2){var l=L[i],r=R[i],a=Math.abs(l),c=Math.abs(r);if(a>pk)pk=a;if(c>pk)pk=c;var m=(l+r)/2,d=(l-r)/2;e+=m*m;sE+=d*d;lr+=l*r;ll+=l*l;rr+=r*r}
 var rms=10*Math.log10(e/(n/2)+1e-12),pkd=20*Math.log10(pk+1e-9),zz=Z.analyze(b,0,100);return{rms:rms,pk:pkd,range:pkd-rms,low:zz&&zz.ok?zz.lowMus*100:null,side:10*Math.log10((sE+1e-12)/(e+1e-12)),corr:b.numberOfChannels>1?lr/Math.sqrt(ll*rr+1e-20):1,st:b.numberOfChannels>1}}
var before=null,wait=false;
window.addEventListener('click',function(ev){var t=ev.target&&ev.target.closest&&ev.target.closest('#alautom');if(!t)return;var s=S();if(!s.src)return;try{before=meas(s.src)}catch(e){before=null}},true);
var n=g('aln');
new MutationObserver(function(){if(!before||wait||!/^Done/.test(n.textContent))return;wait=true;var b0=before;before=null;
 setTimeout(function(){wait=false;try{var o=S().out;if(!o)return;var a=meas(o),f=function(x){return x.toFixed(1)},L=['\ud83d\udd0e Mastering check (before \u2192 after)','Level (RMS): '+f(b0.rms)+' \u2192 '+f(a.rms)+' dB','Peak: '+f(b0.pk)+' \u2192 '+f(a.pk)+' dBFS','Loud-to-average gap: '+f(b0.range)+' \u2192 '+f(a.range)+' dB'],w=[];
  if(b0.low!==null&&a.low!==null){L.push('Bass share: '+b0.low.toFixed(0)+'% \u2192 '+a.low.toFixed(0)+'%');if(Math.abs(a.low-b0.low)>12)w.push('bass changed a lot; compare with \ud83c\udd71 A/B')}
  if(a.st)L.push('Stereo width: '+f(b0.side)+' \u2192 '+f(a.side)+' dB side');
  if(a.pk>-.3)w.push('peak is very close to 0 dBFS; lower the limiter ceiling if you hear distortion');
  if(a.range<5&&b0.range-a.range>3)w.push('over-compressed: the gap fell below 5 dB; choose a quieter style or less compression');
  if(a.st&&a.corr<.1)w.push('left and right are nearly out of phase; it may vanish on a mono speaker');
  L.push(w.length?'\u26a0 '+w.join('; ')+'.':'\u2713 No problems found.');
  var r=g('alerep');if(r){r.style.display='block';r.textContent+=(r.textContent?'\n\n':'')+L.join('\n')}}catch(e){console.error('Audio Lab step 8',e)}},2600)}).observe(n,{childList:true,characterData:true,subtree:true});
}catch(e){try{console.error('Audio Lab step 8',e)}catch(x){}}})();

;
/* ==================== Script 1062 id="amiyo-al-s16-trim-silence-fix" ==================== */
(function(){try{
/* Audio Lab step 9 (test found a bug): "Trim silence at ends" said "No clear sound found" on noisy recordings, because it needed the voice to be 12 dB above the noise. It now sets the limit between the noise floor and the speech level of THIS file (at least 4 dB above the noise), needs 3 loud blocks in a row to count as sound, works on all channels, and says clearly when there is nothing to trim. */
var M=document.getElementById('alm');if(!M||M.getAttribute('data-v9trim'))return;M.setAttribute('data-v9trim','1');
var g=function(i){return M.querySelector('#'+i)},o=g('altrim');if(!o)return;
var b=o.cloneNode(true);o.parentNode.replaceChild(b,o);
function setv(id,v){var e=g(id);e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))}
b.addEventListener('click',function(){var st=(window.__alst&&window.__alst())||{},buf=st.src,n=g('aln');if(!buf){n.textContent='Choose a file first.';return}
 var sr=buf.sampleRate,bl=Math.round(sr*.02),nb=Math.floor(buf.length/bl),C=buf.numberOfChannels,ch=[],c,k,i;if(nb<20){n.textContent='File too short.';return}
 for(c=0;c<C;c++)ch.push(buf.getChannelData(c));var db=new Float64Array(nb);
 for(k=0;k<nb;k++){var q=0;for(c=0;c<C;c++){var d=ch[c];for(i=k*bl;i<(k+1)*bl;i++)q+=d[i]*d[i]}db[k]=10*Math.log10(q/(bl*C)+1e-12)}
 var so=Array.prototype.slice.call(db).sort(function(x,y){return x-y}),fl=so[Math.floor(nb*.1)],hi=so[Math.floor(nb*.9)];
 if(hi-fl<6){n.textContent='Trim: no clear difference between sound and silence in this file, so nothing was trimmed.';return}
 var th=fl+Math.max(4,.3*(hi-fl)),a0=0;while(a0<nb-2&&!(db[a0]>th&&db[a0+1]>th&&db[a0+2]>th))a0++;
 var a1=nb-1;while(a1>2&&!(db[a1]>th&&db[a1-1]>th&&db[a1-2]>th))a1--;
 if(a0>=a1){n.textContent='No clear sound found to keep \u2014 the file may be silent.';return}
 var pad=Math.round(.15*sr/bl),s0=Math.max(0,a0-pad)*bl/sr,s1=Math.min(nb,a1+1+pad)*bl/sr,D=buf.duration,cut=D-(s1-s0);
 if(cut<.1){setv('als',0);setv('ale',100);n.textContent='Nothing to trim: sound goes right up to both ends.';return}
 setv('als',(s0/D*100).toFixed(2));setv('ale',(s1/D*100).toFixed(2));
 n.textContent='Trimmed to '+s0.toFixed(2)+' s \u2192 '+s1.toFixed(2)+' s ('+cut.toFixed(1)+' s of silence removed). Press \u26a1 Process.'});
/* test found a second bug: the trim handles stayed where they were when a NEW file was opened, so the new file was silently cut. Opening a file now resets Start/End to the full length. */
var fi=g('alf');if(fi)fi.addEventListener('change',function(){['als','ale'].forEach(function(id,j){var e=g(id);if(e){e.value=j?100:0;e.dispatchEvent(new Event('input',{bubbles:true}))}})},true);
}catch(e){try{console.error('Audio Lab step 9',e)}catch(x){}}})();

;
/* ==================== Script 1063 id="amiyo-al-s17-trim-readout" ==================== */
(function(){try{
/* Audio Lab step 10: second pass on preview, trim and waveform. Tested on a phone-size screen with touch: drag-select, pan, pinch-zoom and double-tap all work, a 15-minute file opens in 2.5 s and previews at once. Added: a live line under the trim buttons that says exactly how much will be kept (start, end, length), so you do not have to guess from the handles. */
var M=document.getElementById('alm');if(!M||M.getAttribute('data-v10ro'))return;M.setAttribute('data-v10ro','1');
var g=function(i){return M.querySelector('#'+i)},S=function(){return(window.__alst&&window.__alst())||{}},a=g('als'),e=g('ale'),t3=g('alt3');if(!a||!e||!t3)return;
var d=document.createElement('div');d.id='altl';d.style.cssText='font-size:12.5px;color:#b9b2a2;margin:4px 0';t3.parentNode.parentNode.insertBefore(d,t3.parentNode.nextSibling);
function f(s){s=Math.max(0,s);var m=Math.floor(s/60);return m?m+':'+(s-m*60).toFixed(1).padStart(4,'0'):s.toFixed(2)+' s'}
function upd(){var b=S().src;if(!b){d.textContent='';return}var D=b.duration,s0=D*a.value/100,s1=D*e.value/100;d.textContent=(a.value==0&&e.value==100)?'Keeping the whole file ('+f(D)+').':'Keeping '+f(s0)+' \u2192 '+f(s1)+'  ('+f(Math.max(0,s1-s0))+' of '+f(D)+')'}
setInterval(upd,300);upd();
}catch(x){try{console.error('Audio Lab step 10',x)}catch(y){}}})();

;
/* ==================== Script 1064 id="amiyo-dd-step01" ==================== */
/* Drag-and-drop step 1: Image tracks and a visible "+ Track" menu. An Image track is a normal picture track (so preview, effects and export all keep working) that is named "Image 1", "Image 2" ... and shows "image" on its label. The new "＋ Track" button next to the tools adds a Video, Image, Audio, Text or Caption track in one click. Names count each kind on its own, so adding an Image track never changes the Video numbers. */
(function(){try{
if(window.amiyoDD&&window.amiyoDD.addTrack) return;
var DD=window.amiyoDD=window.amiyoDD||{};
var FAMILY={video:{kind:"video",label:"Video"},image:{kind:"video",sub:"image",label:"Image"},audio:{kind:"audio",label:"Audio"},text:{kind:"text",label:"Text"},caption:{kind:"caption",label:"Captions"}};
DD.FAMILIES=["video","image","audio","text","caption"];
DD.family=function(t){ return t&&t.kind==="video"&&t.sub==="image"?"image":(t&&t.kind); };
function say(m,ms){ try{ toast(m,ms||2200); }catch(e){ try{ window.__swl&&window.__swl(e); }catch(_){} } }
DD.say=say;
DD.nextName=function(f){
  var def=FAMILY[f]; if(!def) return "Track";
  var names={}; project.tracks.forEach(function(t){ names[t.name]=1; });
  var n=project.tracks.filter(function(t){ return DD.family(t)===f; }).length+1, nm;
  do{ nm=(f==="caption"&&n===1)?"Captions":def.label+" "+n; n++; }while(names[nm]&&n<999);
  return nm;
};
DD.addTrack=function(f){
  var def=FAMILY[f]; if(!def) return null;
  var tr=null;
  window.transact("Add "+def.label.toLowerCase()+" track",function(){
    tr={id:uid("track"),name:DD.nextName(f),kind:def.kind,locked:false,hidden:false,muted:false,clips:[]};
    if(def.sub) tr.sub=def.sub;
    var T=project.tracks, at=-1, i;
    for(i=0;i<T.length;i++) if(DD.family(T[i])===f) at=i;
    if(at<0) for(i=0;i<T.length;i++) if(T[i].kind===def.kind) at=i;
    T.splice(at<0?T.length:at+1,0,tr);
    selectedTrackId=tr.id; selectedClipId=null;
  });
  say(tr.name+" added. New media goes there while it is selected");
  return tr;
};
/* label shows "image" for picture tracks; a small tint tells the rows apart */
var css=document.createElement("style"); css.id="amiyo-dd-css";
css.textContent=".track-row[data-sub=image] .track-label .type{color:var(--accent2)}#ddTrackMenu{position:fixed;z-index:100000;min-width:190px;padding:6px;border-radius:10px;border:1px solid var(--line);background:var(--panel2);box-shadow:var(--shadow);display:none}#ddTrackMenu.open{display:block}#ddTrackMenu button{display:flex;width:100%;align-items:center;gap:8px;padding:9px 10px;border-radius:7px;text-align:left;cursor:pointer;color:var(--text);font-size:13px}#ddTrackMenu button:hover,#ddTrackMenu button:focus-visible{background:var(--panel3)}#ddTrackMenu small{margin-left:auto;color:var(--muted)}";
document.head.appendChild(css);
function paintRows(){
  var rows=document.querySelectorAll("#tracks .track-row"), T=project.tracks||[];
  for(var i=0;i<rows.length;i++){ var t=T[i]; if(!t) continue;
    var sub=t.sub||""; if((rows[i].getAttribute("data-sub")||"")!==sub){ if(sub) rows[i].setAttribute("data-sub",sub); else rows[i].removeAttribute("data-sub"); }
    var ty=rows[i].querySelector(".track-label .type"), want=t.sub||t.kind; if(ty&&ty.textContent!==want) ty.textContent=want;
  }
}
var prevRT=window.renderTracks;
window.renderTracks=function(){ var r=prevRT.apply(this,arguments); try{ paintRows(); }catch(e){ window.__swl&&window.__swl(e); } return r; };
/* the menu */
var menu=null;
function closeMenu(){ if(menu) menu.classList.remove("open"); }
function openMenu(btn){
  if(!menu){
    menu=document.createElement("div"); menu.id="ddTrackMenu"; menu.setAttribute("role","menu");
    [["video","🎬","Video track"],["image","🖼","Image track"],["audio","🔊","Audio track"],["text","🅣","Text track"],["caption","💬","Caption track"]].forEach(function(r){
      var b=document.createElement("button"); b.type="button"; b.setAttribute("role","menuitem"); b.setAttribute("data-add",r[0]);
      b.innerHTML="<span>"+r[1]+"</span><span>"+r[2]+"</span><small></small>";
      b.addEventListener("click",function(e){ e.stopPropagation(); closeMenu(); DD.addTrack(r[0]); });
      menu.appendChild(b);
    });
    document.body.appendChild(menu);
    document.addEventListener("click",function(e){ if(menu&&!menu.contains(e.target)&&e.target.id!=="ddAddTrackBtn") closeMenu(); },true);
    document.addEventListener("keydown",function(e){ if(e.key==="Escape") closeMenu(); },true);
  }
  Array.prototype.forEach.call(menu.querySelectorAll("button"),function(b){
    var f=b.getAttribute("data-add"), n=project.tracks.filter(function(t){ return DD.family(t)===f; }).length;
    b.querySelector("small").textContent=n+" now";
  });
  var r=btn.getBoundingClientRect(); menu.classList.add("open");
  var w=menu.offsetWidth, h=menu.offsetHeight;
  menu.style.left=Math.max(6,Math.min(innerWidth-w-6,r.left))+"px";
  menu.style.top=(r.top-h-6>6?r.top-h-6:Math.min(innerHeight-h-6,r.bottom+6))+"px";
}
function place(b){
  var sc=document.getElementById("timelineScroll"); if(!sc||!b) return;
  var par=sc.parentElement; if(!par) return;
  if(b.parentNode!==par) par.appendChild(b);
  if(getComputedStyle(par).position==="static") par.style.position="relative";
  var lw=0; try{ lw=labelW(); }catch(e){ lw=156; }
  /* one shared formula (same as the ux3 and screen-fit pinners) and write only when it changed, so the button no longer flips 1px every second or two */
  var rl=document.getElementById("ruler"),op=b.offsetParent||par,pr=op.getBoundingClientRect(),sr=sc.getBoundingClientRect();
  var tp=rl?Math.round(rl.getBoundingClientRect().top-pr.top+3):(sc.offsetTop+3), lf=sc.offsetLeft+4, wd=Math.max(70,lw-52);
  function put(n,v){ if(b.style.getPropertyValue(n)!==v||b.style.getPropertyPriority(n)!=="important") b.style.setProperty(n,v,"important"); }
  put("left",lf+"px"); put("top",tp+"px"); put("width",wd+"px");
}
function mount(){
  var ex=document.getElementById("ddAddTrackBtn");
  if(!document.getElementById("timelineScroll")) return !!ex;
  var b=ex;
  if(!b){ b=document.createElement("button"); b.type="button"; b.className="toolbtn"; b.id="ddAddTrackBtn";
    b.textContent="＋ Track ▾"; b.title="Add a Video, Image, Audio, Text or Caption track"; b.setAttribute("aria-haspopup","menu");
    b.style.cssText="position:absolute;z-index:30;height:22px;min-height:0;padding:0 6px;font-size:12px;line-height:20px;white-space:nowrap";
    b.addEventListener("click",function(e){ e.stopPropagation(); if(menu&&menu.classList.contains("open")) closeMenu(); else openMenu(b); }); }
  place(b);
  return true;
}
window.addEventListener("resize",function(){ try{ mount(); }catch(e){} });
var tries=0, iv=setInterval(function(){ tries++; if(mount()||tries>60) clearInterval(iv); },250); mount();
/* if another part of the editor rebuilds the toolbar, put the button back */
setInterval(function(){ try{ mount(); }catch(e){} },2000);
try{ paintRows(); }catch(e){}
window.AMIYO_EDITOR_BUILD="dd-step01-imagetracks";
}catch(e){ try{ console.error("DD step 1",e); }catch(x){} }})();

;
/* ==================== Script 1065 id="amiyo-dd-step02" ==================== */
/* Drag-and-drop step 2: double-click a clip to pick it up. The clip is selected and every track it is allowed to go to lights up with a dashed outline and "drop here". Allowed = another unlocked track of the same kind (Video or Image for a picture, Audio for sound, Text, Caption). Press Esc, click an empty part of the timeline or select another clip to put it down. Step 3 adds the actual drag. */
(function(){try{
var DD=window.amiyoDD; if(!DD||DD.pickUp) return;
var css=document.createElement("style"); css.id="amiyo-dd-css2";
css.textContent=".track-row.dd-can-drop .track-lane{position:relative;outline:2px dashed var(--accent2);outline-offset:-3px;background:rgba(255,180,84,.08)}.track-row.dd-can-drop .track-lane::after{content:'drop here';position:absolute;left:min(60px,5%);top:50%;transform:translateY(-50%);font-size:11px;letter-spacing:.04em;color:var(--accent2);pointer-events:none;z-index:1}.track-row.dd-no-drop{opacity:.5}.clip.dd-picked{outline:2px solid var(--accent2)!important;outline-offset:1px;box-shadow:0 0 0 4px rgba(255,180,84,.25)}";
document.head.appendChild(css);
DD.picked=null;
function find(id){ for(var i=0;i<project.tracks.length;i++){ var t=project.tracks[i]; for(var j=0;j<t.clips.length;j++) if(t.clips[j].id===id) return {track:t,clip:t.clips[j]}; } return null; }
DD.find=find;
/* may this clip go onto this track? same kind only, never a locked track, never the track it is already on */
DD.canGo=function(f,to){
  if(!f||!to||to===f.track) return false;
  if(to.locked) return false;
  return to.kind===f.track.kind;
};
DD.targets=function(id){ var f=find(id); if(!f) return []; return project.tracks.filter(function(t){ return DD.canGo(f,t); }); };
function paint(){
  var rows=document.querySelectorAll("#tracks .track-row"), T=project.tracks||[], i;
  var p=DD.drag||DD.picked, f=p&&find(p.clipId);
  if(!DD.drag&&p&&(!f||selectedClipId!==p.clipId)){ DD.picked=p=null; f=null; }
  for(i=0;i<rows.length;i++){
    var can=!!(f&&DD.canGo(f,T[i])), no=!!(f&&T[i]&&T[i]!==f.track&&!can);
    rows[i].classList.toggle("dd-can-drop",can); rows[i].classList.toggle("dd-no-drop",no); rows[i].classList.toggle("dd-hover",!!(can&&DD.hover&&T[i].id===DD.hover));
  }
  var cl=document.querySelectorAll("#tracks .clip.dd-picked"); for(i=0;i<cl.length;i++) if(!p||cl[i].dataset.clip!==p.clipId) cl[i].classList.remove("dd-picked");
  if(p){ var el=document.querySelector('#tracks .clip[data-clip="'+p.clipId+'"]'); if(el) el.classList.add("dd-picked"); }
}
DD.paint=paint;
DD.putDown=function(quiet){ if(!DD.picked) return; DD.picked=null; paint(); if(!quiet) DD.say("Put down",1200); };
DD.pickUp=function(id){
  var f=find(id); if(!f) return false;
  if(f.track.locked){ DD.say("“"+(f.clip.name||"Clip")+"” is on a locked track. Unlock it first",2600); return false; }
  selectedClipId=id; selectedTrackId=f.track.id;
  var tg=DD.targets(id);
  DD.picked={clipId:id,from:f.track.id};
  try{ renderInspector(); }catch(e){}
  paint();
  var nm=f.clip.name||"Clip";
  if(!tg.length) DD.say("No other "+f.track.kind+" track to move “"+nm+"” to. Add one with ＋ Track",3200);
  else DD.say("“"+nm+"” picked up. Drag it to "+tg.slice(0,3).map(function(t){return t.name;}).join(", ")+(tg.length>3?" or "+(tg.length-3)+" more":"")+" (Esc to cancel)",3600);
  return true;
};
/* two quick clicks on the same clip. The editor redraws the track list after the first click, which cancels the browser's own dblclick, so it is detected from the clicks */
var last={id:null,at:0};
document.addEventListener("click",function(e){
  var t=e.target; if(!t||!t.closest) return;
  var tr=document.getElementById("tracks");
  var clip=t.closest("#tracks .clip");
  if(!clip){
    if(DD.picked&&(t.closest("#timelineScroll")&&!t.closest(".track-label"))) DD.putDown(true);
    last={id:null,at:0}; return;
  }
  if(t.closest("[data-resize]")||e.shiftKey||e.ctrlKey||e.metaKey||e.altKey){ last={id:null,at:0}; return; }
  var id=clip.dataset.clip, now=Date.now();
  if(last.id===id&&now-last.at<450){ last={id:null,at:0}; DD.pickUp(id); }
  else{ last={id:id,at:now}; if(DD.picked&&DD.picked.clipId!==id) DD.putDown(true); }
},true);
document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&DD.picked){ DD.putDown(); } },true);
var prevRT=window.renderTracks;
window.renderTracks=function(){ var r=prevRT.apply(this,arguments); try{ paint(); }catch(e){ window.__swl&&window.__swl(e); } return r; };
window.AMIYO_EDITOR_BUILD="dd-step02-pickup";
}catch(e){ try{ console.error("DD step 2",e); }catch(x){} }})();

;
/* ==================== Script 1066 id="amiyo-dd-step03" ==================== */
/* Drag-and-drop step 3: drag a clip onto another track. Press on a clip and drag: sideways still moves it in time, and as you drag over another track of the same kind (Video to Video or Image, Audio to Audio, Text to Text, Caption to Caption) that track lights up. Let go there and the clip moves to it, keeping the time where you dropped it. If the spot on that track is already taken the clip goes back to where it started. It is one Undo step. */
(function(){try{
var DD=window.amiyoDD; if(!DD||!DD.paint||DD.moveClip) return;
var css=document.createElement("style"); css.id="amiyo-dd-css3";
css.textContent=".track-row.dd-hover .track-lane{background:rgba(255,180,84,.22)!important;outline-style:solid!important}body.dd-dragging,body.dd-dragging .clip{cursor:grabbing!important}";
document.head.appendChild(css);
function over(a,b){ return a.start<b.start+b.duration-.001&&a.start+a.duration>b.start+.001; }
/* move clip c from track `from` to track `to`, one history step; `origStart` is where the clip began (so Undo puts it back exactly) */
DD.moveClip=function(id,toId,origStart,label){
  var f=DD.find(id), to=project.tracks.find(function(t){ return t.id===toId; });
  if(!f||!to||!DD.canGo(f,to)) return {ok:false,why:"That track can't take this clip"};
  var c=f.clip, clash=to.clips.some(function(o){ return o!==c&&over(c,o); });
  if(clash) return {ok:false,why:"That spot on “"+to.name+"” is taken"};
  var cur=c.start, before;
  if(origStart!=null) c.start=origStart;
  before=deepClone(serializableProject());
  c.start=cur;
  f.track.clips=f.track.clips.filter(function(k){ return k!==c; });
  to.clips.push(c); to.clips.sort(function(a,b){ return a.start-b.start; });
  selectedClipId=c.id; selectedTrackId=to.id;
  var after=deepClone(serializableProject());
  recordHistory(label||("Move clip to "+to.name),before,after,true);
  try{ project.metadata.updatedAt=new Date().toISOString(); }catch(e){}
  try{ scheduleAutosave(); }catch(e){}
  try{ renderAll(); updateUndoRedo(); }catch(e){ window.__swl&&window.__swl(e); }
  try{ updateAudioPlayback(); }catch(e){ window.__swl&&window.__swl(e); }
  return {ok:true,track:to};
};
var ds=null, idx0=0;
function rowAt(x,y){
  var tr=document.getElementById("tracks"); if(!tr) return null;
  var tb=tr.getBoundingClientRect(); if(x<tb.left||x>tb.right||y<tb.top||y>tb.bottom) return null;
  var rows=tr.querySelectorAll(".track-row"), T=project.tracks;
  for(var i=0;i<rows.length;i++){ var r=rows[i].getBoundingClientRect(); if(y>=r.top&&y<r.bottom) return T[i]||null; }
  return null;
}
function end(){ ds=null; DD.drag=null; DD.hover=null; document.body.classList.remove("dd-dragging"); try{ if(DD.dragEnd) DD.dragEnd(); }catch(x){} }
window.addEventListener("pointerdown",function(e){
  ds=null;
  if(e.button!==0||!e.target||!e.target.closest) return;
  var el=e.target.closest("#tracks .clip"); if(!el) return;
  if(e.target.closest("[data-resize]")||String(e.target.tagName).toLowerCase()==="circle") return;
  var f=DD.find(el.dataset.clip); if(!f||f.track.locked) return;
  ds={id:f.clip.id,from:f.track.id,x:e.clientX,y:e.clientY,pid:e.pointerId,pt:e.pointerType,orig:f.clip.start,moved:false,hover:null};
},true);
window.addEventListener("pointermove",function(e){
  if(!ds||e.pointerId!==ds.pid) return;
  if(!ds.moved){ if(Math.abs(e.clientX-ds.x)+Math.abs(e.clientY-ds.y)<(ds.pt==="mouse"?4:8)) return; ds.moved=true; DD.drag={clipId:ds.id}; document.body.classList.add("dd-dragging"); }
  var f=DD.find(ds.id); if(!f){ end(); return; }
  var t=rowAt(e.clientX,e.clientY);
  var h=(t&&DD.canGo(f,t))?t.id:null;
  if(h!==DD.hover){ DD.hover=h; ds.hover=h; }
  try{ DD.paint(); }catch(x){}
  try{ if(DD.dragHook) DD.dragHook(e,f,t,h); }catch(x){ window.__swl&&window.__swl(x); }
},true);
/* just before the editor's own drop handler runs, remember where the history stood */
window.addEventListener("pointerup",function(e){ if(ds&&e.pointerId===ds.pid) idx0=project.history?project.history.index:-1; },true);
/* after the editor has finished its sideways move, finish the track change (a bubble-phase listener runs last) */
window.addEventListener("pointerup",function(e){
  if(!ds||e.pointerId!==ds.pid) return;
  var d=ds, moved=d.moved, target=DD.hover; end();
  if(!moved){ try{ DD.paint(); }catch(x){} return; }
  var f=DD.find(d.id);
  if(!f){ try{ DD.paint(); }catch(x){} return; }
  if(!target||target===f.track.id){ try{ DD.paint(); }catch(x){} return; }
  /* take the editor's own "Move clip" entry back out: the whole gesture becomes one undo step */
  var H=project.history;
  if(H&&H.index>idx0){ H.entries.splice(idx0+1); H.index=idx0; }
  var r=DD.moveClip(d.id,target,d.orig);
  if(!r.ok){
    var g=DD.find(d.id); if(g){ g.clip.start=d.orig; }
    try{ renderAll(); updateUndoRedo(); }catch(x){}
    DD.say(r.why+". The clip went back",2800);
  }else{
    DD.picked=null; try{ DD.paint(); }catch(x){}
    DD.say("Moved to “"+r.track.name+"”",1800);
  }
},false);
window.addEventListener("pointercancel",function(){ end(); try{ DD.paint(); }catch(x){} },true);
window.addEventListener("keydown",function(e){ if(e.key==="Escape"&&ds&&ds.moved){ end(); try{ DD.paint(); }catch(x){} } },true);
window.AMIYO_EDITOR_BUILD="dd-step03-dragtrack";
}catch(e){ try{ console.error("DD step 3",e); }catch(x){} }})();

;
/* ==================== Script 1067 id="amiyo-dd-step04" ==================== */
/* Drag-and-drop step 4: a floating preview follows the pointer while you drag a clip. It shows the clip's name and where it would land: "→ Video 2" in orange when the drop will work, red when that track can't take it (wrong kind, locked) or the spot there is already taken, and "same track" while you are only sliding it sideways. The clip you are dragging fades while the preview is shown. */
(function(){try{
var DD=window.amiyoDD; if(!DD||!DD.moveClip||DD.dragHook) return;
var css=document.createElement("style"); css.id="amiyo-dd-css4";
css.textContent="#ddGhost{position:fixed;z-index:100001;pointer-events:none;display:none;max-width:260px;padding:6px 10px;border-radius:9px;border:1px solid var(--accent2);background:var(--panel2);color:var(--text);font-size:12px;line-height:1.35;box-shadow:var(--shadow);white-space:nowrap}#ddGhost b{display:block;max-width:240px;overflow:hidden;text-overflow:ellipsis;font-weight:600}#ddGhost span{color:var(--accent2)}#ddGhost.ddg-bad{border-color:var(--danger)}#ddGhost.ddg-bad span{color:var(--danger)}#ddGhost.ddg-same span{color:var(--muted)}body.dd-dragging .clip.dd-picked{opacity:.4}";
document.head.appendChild(css);
var g=null;
function over(a,b){ return a.start<b.start+b.duration-.001&&a.start+a.duration>b.start+.001; }
function ensure(){ if(g) return g; g=document.createElement("div"); g.id="ddGhost"; g.setAttribute("aria-hidden","true"); g.innerHTML="<b></b><span></span>"; document.body.appendChild(g); return g; }
DD.dragHook=function(e,f,t,h){
  var el=ensure(), c=f.clip, state, msg;
  if(!t||t===f.track){ state="same"; msg="same track"; }
  else if(!h){ state="bad"; msg=t.locked?("“"+t.name+"” is locked"):("✕ "+t.name+" takes "+t.kind+" only"); }
  else if(t.clips.some(function(o){ return o!==c&&over(c,o); })){ state="bad"; msg="✕ spot taken on "+t.name; }
  else { state="ok"; msg="→ "+t.name; }
  el.className="ddg-"+state; el.firstChild.textContent=c.name||"Clip"; el.lastChild.textContent=msg;
  el.style.display="block";
  var w=el.offsetWidth, hh=el.offsetHeight;
  el.style.left=Math.max(4,Math.min(innerWidth-w-4,e.clientX+14))+"px";
  el.style.top=Math.max(4,Math.min(innerHeight-hh-4,e.clientY+16))+"px";
};
DD.dragEnd=function(){ if(g) g.style.display="none"; };
window.AMIYO_EDITOR_BUILD="dd-step04-ghost";
}catch(e){ try{ console.error("DD step 4",e); }catch(x){} }})();

;
/* ==================== Script 1068 id="amiyo-dd-step05" ==================== */
/* Drag-and-drop step 5: a clip keeps its time position when it changes track, and it snaps while you drag. Snapping pulls either edge of the clip to 0, the playhead, or the start/end of any other clip when it comes within 8 pixels; an orange line shows where. It follows the 🧲 Snap button (off = no snapping) and holding Alt turns it off for one drag. Moving to another track never changes the start time, so Video 1 → Video 2 stays lined up. The whole drag is one Undo step. */
(function(){try{
var DD=window.amiyoDD; if(!DD||!DD.moveClip||DD.snapOn) return;
DD.snapOn=1;
var css=document.createElement("style"); css.id="amiyo-dd-css5";
css.textContent="#ddSnapLine{position:absolute;top:0;bottom:0;width:0;border-left:2px solid var(--accent2);z-index:25;pointer-events:none;display:none;box-shadow:0 0 6px var(--accent2)}";
document.head.appendChild(css);
function enabled(){ var b=document.getElementById("snapToggle"); return !b||b.classList.contains("tool-active"); }
var s=null, line=null;
function lineEl(){
  if(line&&line.isConnected) return line;
  var ph=document.getElementById("playhead"), par=ph&&ph.parentNode; if(!par) return null;
  line=document.createElement("div"); line.id="ddSnapLine"; par.appendChild(line); return line;
}
function showLine(t){ var l=lineEl(); if(!l) return; if(t==null){ l.style.display="none"; return; } l.style.left=(timeToPx(t)+labelW())+"px"; l.style.display="block"; }
DD.snapPoints=function(skipId){
  var p=[0,currentTime], T=project.tracks||[];
  for(var i=0;i<T.length;i++) for(var j=0;j<T[i].clips.length;j++){ var c=T[i].clips[j]; if(c.id===skipId) continue; p.push(c.start,c.start+c.duration); }
  return p;
};
/* best snap for a clip at start `st` lasting `dur`: returns {start, at} (at = the time snapped to) or null */
DD.snapStart=function(st,dur,skipId,px){
  var th=(px||8)/getTimelinePx(), pts=DD.snapPoints(skipId), best=null, bd=th, i, d;
  for(i=0;i<pts.length;i++){
    d=Math.abs(pts[i]-st); if(d<bd){ bd=d; best={start:pts[i],at:pts[i]}; }
    d=Math.abs(pts[i]-(st+dur)); if(d<bd){ bd=d; best={start:pts[i]-dur,at:pts[i]}; }
  }
  if(best&&best.start<0) return null;
  return best;
};
window.addEventListener("pointerdown",function(e){
  s=null;
  if(e.button!==0||!e.target||!e.target.closest) return;
  var el=e.target.closest("#tracks .clip"); if(!el||e.target.closest("[data-resize]")) return;
  var f=DD.find(el.dataset.clip); if(!f||f.track.locked) return;
  s={id:f.clip.id,x:e.clientX,orig:f.clip.start,pid:e.pointerId,multi:!!(DD.multiIds&&DD.multiIds(f.clip.id).length>1)};
},true);
/* bubble phase: runs after the editor's own sideways move, then adjusts it */
window.addEventListener("pointermove",function(e){
  if(!s||s.multi||e.pointerId!==s.pid||!DD.drag||DD.drag.clipId!==s.id) return;
  var f=DD.find(s.id); if(!f) return;
  var raw=Math.max(0,s.orig+(e.clientX-s.x)/getTimelinePx()), ns=raw, at=null;
  if(enabled()&&!e.altKey){ var b=DD.snapStart(raw,f.clip.duration,s.id); if(b){ ns=b.start; at=b.at; } }
  if(Math.abs(f.clip.start-ns)>1e-6){ f.clip.start=ns; try{ renderTracks(); updateTimeUI(); }catch(x){ window.__swl&&window.__swl(x); } }
  showLine(at);
  var g=document.getElementById("ddGhost"); if(g&&g.lastChild&&at!=null&&g.lastChild.textContent.indexOf("snapped")<0) g.lastChild.textContent+=" · snapped";
},false);
/* one drag = one Undo step: if the old snap-on-release adds its own entry right after the drop, fold it in */
var prevEnd=DD.dragEnd;
DD.dragEnd=function(){
  try{ if(prevEnd) prevEnd(); }catch(x){}
  showLine(null); s=null;
  setTimeout(function(){
    var H=project.history; if(!H||!H.entries) return;
    var cur=H.entries[H.index], prev=H.entries[H.index-1];
    if(cur&&prev&&cur.label==="Snap"&&/^(Move|Trim)/.test(prev.label||"")){ prev.after=cur.after; H.entries.splice(H.index,1); H.index--; try{ updateUndoRedo(); }catch(x){} }
  },90);
};
window.AMIYO_EDITOR_BUILD="dd-step05-snap";
}catch(e){ try{ console.error("DD step 5",e); }catch(x){} }})();

;
/* ==================== Script 1069 id="amiyo-dd-step06" ==================== */
/* Drag-and-drop step 6: sound clips between Audio tracks (Audio 1 ↔ Audio 2 ↔ ...). Audio clips already go to any other unlocked Audio track; they keep their volume, fades, speed and start time, and playback is refreshed right after the move so what you hear matches. New here: if the track you drop on is muted, the editor says so, because the clip would be silent there. */
(function(){try{
var DD=window.amiyoDD; if(!DD||!DD.moveClip||DD.audioMove) return;
DD.audioMove=1;
var mv=DD.moveClip;
DD.moveClip=function(id,toId,orig,label){
  var r=mv.apply(this,arguments);
  try{
    if(r&&r.ok&&r.track&&r.track.kind==="audio"){
      var soloOn=project.tracks.some(function(t){ return t.kind==="audio"&&t.solo&&t!==r.track; });
      if(r.track.muted) setTimeout(function(){ DD.say("“"+r.track.name+"” is muted, so this sound won't be heard until you unmute it",3600); },1900);
      else if(soloOn) setTimeout(function(){ DD.say("Another audio track is on Solo, so “"+r.track.name+"” is silent for now",3600); },1900);
    }
  }catch(e){ window.__swl&&window.__swl(e); }
  return r;
};
window.AMIYO_EDITOR_BUILD="dd-step06-audio";
}catch(e){ try{ console.error("DD step 6",e); }catch(x){} }})();

;
/* ==================== Script 1070 id="amiyo-dd-step07" ==================== */
/* Drag-and-drop step 7: Text and Caption clips between their own tracks (Text 1 ↔ Text 2, Captions ↔ Captions 2). Text clips keep their words, style and screen position when they move; the preview is redrawn at once. New here: if you let go on a track that cannot take the clip (a caption on a Text track, a title on a Caption track, anything on a locked track) the editor now says why and the clip stays where it was, instead of doing nothing. */
(function(){try{
var DD=window.amiyoDD; if(!DD||!DD.dragHook||DD.textMove) return;
DD.textMove=1;
var last=null, hook=DD.dragHook, end=DD.dragEnd;
DD.dragHook=function(e,f,t,h){ last={f:f,t:t,h:h}; return hook.apply(this,arguments); };
DD.dragEnd=function(){
  var L=last; last=null;
  try{ if(end) end.apply(this,arguments); }catch(x){}
  try{
    if(L&&L.t&&L.f&&L.t!==L.f.track&&!L.h){
      var nm=L.f.clip.name||"Clip", k=L.f.track.kind, w={text:"title",caption:"caption",audio:"sound",video:"picture/video"}[k]||k;
      if(DD.picOnly&&DD.picOnly(L.f,L.t)) DD.say("“"+L.t.name+"” takes pictures only. “"+nm+"” is a video and stayed on “"+L.f.track.name+"”",3200);
      else if(L.t.locked) DD.say("“"+L.t.name+"” is locked. “"+nm+"” stayed on “"+L.f.track.name+"”",2800);
      else DD.say("“"+L.t.name+"” can't take a "+w+" clip ("+L.t.kind+" tracks only). “"+nm+"” stayed on “"+L.f.track.name+"”",3200);
    }
  }catch(x){ window.__swl&&window.__swl(x); }
};
window.AMIYO_EDITOR_BUILD="dd-step07-text";
}catch(e){ try{ console.error("DD step 7",e); }catch(x){} }})();

;
/* ==================== Script 1071 id="amiyo-dd-step08" ==================== */
/* Drag-and-drop step 8: picture clips between Image tracks (Image 1 ↔ Image 2) and between Image and Video tracks (a picture can sit on either, and a video-track picture can move down to an Image track). A real video clip can go to other Video tracks but not onto an Image track, which stays for pictures, so the rows that light up while you drag are the right ones. The ghost and the release message say "takes pictures only" in that case. */
(function(){try{
var DD=window.amiyoDD; if(!DD||!DD.canGo||DD.imgMove) return;
DD.imgMove=1;
DD.isVideoClip=function(c){ var a=c&&c.assetId&&getAsset(c.assetId); return !!(a&&a.type==="video"); };
var can=DD.canGo;
DD.canGo=function(f,to){ if(!can(f,to)) return false; if(to.sub==="image"&&DD.isVideoClip(f.clip)) return false; return true; };
DD.picOnly=function(f,t){ return !!(f&&t&&!t.locked&&t.sub==="image"&&t!==f.track&&f.track.kind==="video"&&DD.isVideoClip(f.clip)); };
var hook=DD.dragHook;
DD.dragHook=function(e,f,t,h){
  var r=hook&&hook.apply(this,arguments);
  if(DD.picOnly(f,t)){ var g=document.getElementById("ddGhost"); if(g&&g.lastChild){ g.className="ddg-bad"; g.lastChild.textContent="✕ "+t.name+" takes pictures only"; } }
  return r;
};
window.AMIYO_EDITOR_BUILD="dd-step08-image";
}catch(e){ try{ console.error("DD step 8",e); }catch(x){} }})();

;
/* ==================== Script 1072 id="amiyo-dd-step09" ==================== */
/* Drag-and-drop step 9: a drop on a taken spot is refused, and the editor says exactly why. While you drag, the clip that is in the way turns red and the ghost names it ("✕ overlaps “Movie” on Video 2"). On release the clip goes back to where it was, the track row flashes red, and the message names the blocking clip and its time, and where the next free space on that track begins, so you know where to move. Nothing is changed or added to Undo by a refused drop. */
(function(){try{
var DD=window.amiyoDD; if(!DD||!DD.moveClip||DD.takenMsg) return;
DD.takenMsg=1;
var css=document.createElement("style"); css.id="amiyo-dd-css9";
css.textContent="#tracks .clip.dd-blocker{outline:2px solid #ff5d5d!important;outline-offset:-2px;box-shadow:0 0 0 2px rgba(255,93,93,.35),inset 0 0 0 999px rgba(255,93,93,.28)!important}.track-row.dd-refused .track-lane{animation:ddRefuse .7s ease-out}@keyframes ddRefuse{0%,50%{background:rgba(255,93,93,.32)}100%{background:transparent}}";
document.head.appendChild(css);
function over(a,b){ return a.start<b.start+b.duration-.001&&a.start+a.duration>b.start+.001; }
function fmt(t){ return (Math.round(t*10)/10).toFixed(1)+" s"; }
DD.blocker=function(c,t){ for(var i=0;i<t.clips.length;i++){ var o=t.clips[i]; if(o!==c&&over(c,o)) return o; } return null; };
DD.freeFrom=function(c,t){ /* first time at or after the clip's start where it fits on track t */
  var s=c.start, list=t.clips.filter(function(o){ return o!==c; }).sort(function(a,b){ return a.start-b.start; });
  for(var i=0;i<list.length;i++){ var o=list[i]; if(s+c.duration<=o.start+.001) return s; if(s<o.start+o.duration-.001) s=o.start+o.duration; }
  return s;
};
function clearMark(){ var m=document.querySelectorAll("#tracks .clip.dd-blocker"); for(var i=0;i<m.length;i++) m[i].classList.remove("dd-blocker"); }
function mark(o){ clearMark(); if(!o) return; var el=document.querySelector('#tracks .clip[data-clip="'+o.id+'"]'); if(el) el.classList.add("dd-blocker"); }
/* while dragging: name and mark the clip in the way */
var hook=DD.dragHook;
DD.dragHook=function(e,f,t,h){
  var r=hook&&hook.apply(this,arguments), o=null;
  if(h&&t&&t!==f.track) o=DD.blocker(f.clip,t);
  mark(o);
  if(o){ var g=document.getElementById("ddGhost"); if(g&&g.lastChild) g.lastChild.textContent="✕ overlaps “"+(o.name||"a clip")+"” on "+t.name; }
  return r;
};
var end=DD.dragEnd;
DD.dragEnd=function(){ clearMark(); return end&&end.apply(this,arguments); };
/* on release: a clear refusal */
var mv=DD.moveClip;
DD.moveClip=function(id,toId,orig,label){
  var f=DD.find(id), to=project.tracks.find(function(t){ return t.id===toId; }), o=(f&&to&&DD.canGo(f,to))?DD.blocker(f.clip,to):null, info=null;
  if(o) info={name:o.name||"a clip",from:o.start,to:o.start+o.duration,free:DD.freeFrom(f.clip,to),track:to};
  var r=mv.apply(this,arguments);
  if(!r.ok&&info){
    r.why="“"+info.track.name+"” already has “"+info.name+"” at "+fmt(info.from)+" – "+fmt(info.to)+". The next free space for this clip starts at "+fmt(info.free);
    var i=project.tracks.indexOf(info.track);
    /* the editor redraws the rows right after a refused drop, so flash the fresh row a moment later */
    setTimeout(function(){ var row=document.querySelectorAll("#tracks .track-row")[i]; if(row){ row.classList.add("dd-refused"); setTimeout(function(){ row.classList.remove("dd-refused"); },800); } },60);
  }
  return r;
};
window.AMIYO_EDITOR_BUILD="dd-step09-taken";
}catch(e){ try{ console.error("DD step 9",e); }catch(x){} }})();

;
/* ==================== Script 1073 id="amiyo-dd-step10" ==================== */
/* Drag-and-drop step 10: drag several selected clips at once. Select clips (drag a box, or Shift/Ctrl-click) and drag any one of them: they all keep their spacing in time, and when you drag onto another track they all change track by the same number of rows, each among tracks of its own kind (grab a Video 1 clip and drop it on Video 3: every selected video clip goes down two video tracks, every selected sound goes down two audio tracks). If any of them cannot go (no track there, locked, wrong kind, or the spot is taken) NOTHING moves and the message says which clip is the problem. The whole move is one Undo step. */
(function(){try{
var DD=window.amiyoDD; if(!DD||!DD.moveClip||DD.moveMany) return;
function over(a,b){ return a.start<b.start+b.duration-.001&&a.start+a.duration>b.start+.001; }
function fmt(t){ return (Math.round(t*10)/10).toFixed(1)+" s"; }
function nm(c){ return "“"+(c.name||"Clip")+"”"; }
/* ids of the selected, unlocked clips when `id` is one of 2 or more */
DD.multiIds=function(id){
  var ids=[], has=false;
  (project.tracks||[]).forEach(function(t){ if(t.locked) return; t.clips.forEach(function(c){ if(c.selected||c.id===selectedClipId){ ids.push(c.id); if(c.id===id) has=true; } }); });
  return (has&&ids.length>1)?ids:[];
};
DD.multiOrig=null;
window.addEventListener("pointerdown",function(e){
  DD.multiOrig=null;
  if(e.button!==0||!e.target||!e.target.closest) return;
  var el=e.target.closest("#tracks .clip"); if(!el||e.target.closest("[data-resize]")) return;
  var ids=DD.multiIds(el.dataset.clip); if(ids.length<2) return;
  var o={}; ids.forEach(function(i){ var f=DD.find(i); if(f) o[i]=f.clip.start; }); DD.multiOrig=o;
},true);
/* where would every selected clip go if the grabbed one lands on track `to`? */
DD.planMany=function(gid,to){
  var ids=DD.multiIds(gid), g=DD.find(gid); if(ids.length<2||!g) return null;
  var L=project.tracks.filter(function(t){ return t.kind===g.track.kind; }), delta=L.indexOf(to)-L.indexOf(g.track);
  if(!delta) return {ok:true,moves:[],n:ids.length,delta:0};
  var set={}, moves=[], i, f, Lk, to2;
  ids.forEach(function(x){ set[x]=1; });
  for(i=0;i<ids.length;i++){
    f=DD.find(ids[i]); Lk=project.tracks.filter(function(t){ return t.kind===f.track.kind; }); to2=Lk[Lk.indexOf(f.track)+delta];
    if(!to2) return {ok:false,n:ids.length,short:"no "+f.track.kind+" track "+(delta>0?"below":"above")+" for "+nm(f.clip),why:nm(f.clip)+" has no "+f.track.kind+" track to go to ("+Math.abs(delta)+" row"+(Math.abs(delta)>1?"s ":" ")+(delta>0?"down":"up")+" from its track), so nothing moved. Add one with ＋ Track"};
    if(!DD.canGo(f,to2)) return {ok:false,n:ids.length,short:(to2.locked?"“"+to2.name+"” is locked":"“"+to2.name+"” can't take "+nm(f.clip)),why:(to2.locked?"“"+to2.name+"” is locked":"“"+to2.name+"” can't take "+nm(f.clip))+", so nothing moved"};
    moves.push({f:f,to:to2});
  }
  /* overlaps: with clips that stay, and between clips landing on the same track */
  for(i=0;i<moves.length;i++){
    var m=moves[i], c=m.f.clip, k, o;
    for(k=0;k<m.to.clips.length;k++){ o=m.to.clips[k]; if(!set[o.id]&&over(c,o)) return {ok:false,n:ids.length,short:nm(c)+" overlaps "+nm(o)+" on "+m.to.name,why:nm(c)+" would overlap "+nm(o)+" on “"+m.to.name+"” at "+fmt(o.start)+" – "+fmt(o.start+o.duration)+", so nothing moved"}; }
    for(k=i+1;k<moves.length;k++){ if(moves[k].to===m.to&&over(c,moves[k].f.clip)) return {ok:false,n:ids.length,short:nm(c)+" and "+nm(moves[k].f.clip)+" would overlap",why:nm(c)+" and "+nm(moves[k].f.clip)+" would land on top of each other on “"+m.to.name+"”, so nothing moved"}; }
  }
  return {ok:true,moves:moves,n:ids.length,delta:delta};
};
var mv=DD.moveClip;
DD.moveMany=function(gid,toId,label){
  var to=project.tracks.find(function(t){ return t.id===toId; }), p=to&&DD.planMany(gid,to), orig=DD.multiOrig||{};
  function restore(){ Object.keys(orig).forEach(function(i){ var f=DD.find(i); if(f) f.clip.start=orig[i]; }); }
  if(!p) return {ok:false,why:"That track can't take these clips"};
  if(!p.ok){ restore(); return {ok:false,why:p.why}; }
  if(!p.moves.length) return {ok:true,track:to,n:p.n};
  var cur={}, before;
  p.moves.forEach(function(m){ cur[m.f.clip.id]=m.f.clip.start; });
  /* the state before the gesture: every selected clip at its starting time */
  p.moves.forEach(function(m){ if(orig[m.f.clip.id]!=null) m.f.clip.start=orig[m.f.clip.id]; });
  before=deepClone(serializableProject());
  p.moves.forEach(function(m){ m.f.clip.start=cur[m.f.clip.id]; });
  p.moves.forEach(function(m){ m.f.track.clips=m.f.track.clips.filter(function(k){ return k!==m.f.clip; }); });
  p.moves.forEach(function(m){ m.to.clips.push(m.f.clip); });
  project.tracks.forEach(function(t){ t.clips.sort(function(a,b){ return a.start-b.start; }); });
  selectedClipId=gid; selectedTrackId=to.id;
  var after=deepClone(serializableProject());
  recordHistory(label||("Move "+p.n+" clips to "+to.name),before,after,true);
  try{ project.metadata.updatedAt=new Date().toISOString(); }catch(e){}
  try{ scheduleAutosave(); }catch(e){}
  try{ renderAll(); updateUndoRedo(); }catch(e){ window.__swl&&window.__swl(e); }
  try{ updateAudioPlayback(); }catch(e){ window.__swl&&window.__swl(e); }
  return {ok:true,track:to,n:p.n};
};
DD.moveClip=function(id,toId,orig,label){
  if(DD.multiIds(id).length>1) return DD.moveMany(id,toId,label);
  return mv.apply(this,arguments);
};
/* ghost text for a group */
var hook=DD.dragHook;
DD.dragHook=function(e,f,t,h){
  var r=hook&&hook.apply(this,arguments);
  try{
    if(t&&f&&t!==f.track&&DD.multiIds(f.clip.id).length>1){
      var p=DD.planMany(f.clip.id,t), g=document.getElementById("ddGhost");
      if(p&&g&&g.lastChild){ g.className=p.ok?"ddg-ok":"ddg-bad"; g.lastChild.textContent=p.ok?(p.n+" clips → "+t.name+(p.delta?" (each "+(p.delta>0?"down ":"up ")+Math.abs(p.delta)+")":"")):("✕ "+p.short); var cl=document.querySelectorAll("#tracks .clip.dd-blocker"); for(var i=0;i<cl.length;i++) cl[i].classList.remove("dd-blocker"); }
    }
  }catch(x){ window.__swl&&window.__swl(x); }
  return r;
};
window.AMIYO_EDITOR_BUILD="dd-step10-multi";
}catch(e){ try{ console.error("DD step 10",e); }catch(x){} }})();

;
/* ==================== Script 1074 id="amiyo-dd-step11" ==================== */
/* Drag-and-drop step 11: Undo and Redo for every move. Each track move (one clip or a whole selection) is exactly one history entry, named for what it did ("Move clip to Video 2", "Move 3 clips to Audio 2"). Undo puts every clip back on its old track at its old time, Redo does it again, from the Undo / Redo buttons, Ctrl+Z, Ctrl+Shift+Z and Ctrl+Y. New here: after Undo or Redo of a group move the same clips are selected again, sound playback is refreshed so what you hear matches the tracks, and a refused drop never adds an entry. */
(function(){try{
var DD=window.amiyoDD; if(!DD||!DD.moveMany||DD.undoWired) return;
DD.undoWired=1;
/* remember which clips a group move touched */
var mm=DD.moveMany;
DD.moveMany=function(){
  var r=mm.apply(this,arguments);
  try{ if(r&&r.ok&&r.n>1&&DD.lastPlanIds){ var H=project.history, e=H&&H.entries[H.index]; if(e&&/^Move \d+ clips/.test(e.label||"")) e.ddIds=DD.lastPlanIds.slice(); } }catch(x){ window.__swl&&window.__swl(x); }
  return r;
};
var pm=DD.planMany;
DD.planMany=function(gid){ var p=pm.apply(this,arguments); if(p&&p.ok&&p.moves) DD.lastPlanIds=p.moves.map(function(m){ return m.f.clip.id; }); return p; };
function after(e){
  try{
    if(e&&e.ddIds){ var any=false;
      project.tracks.forEach(function(t){ t.clips.forEach(function(c){ c.selected=e.ddIds.indexOf(c.id)>=0; if(c.selected) any=true; }); });
      if(any){ selectedClipId=e.ddIds[0]; var f=DD.find(selectedClipId); if(f) selectedTrackId=f.track.id; renderTracks(); renderInspector(); }
    }
    DD.picked=null; if(DD.paint) DD.paint();
    updateAudioPlayback();
  }catch(x){ window.__swl&&window.__swl(x); }
}
function wrap(name,dir){
  var f=window[name]; if(typeof f!=="function"||f.__dd11) return;
  var w=function(){
    var H=project.history, e=H&&H.entries?H.entries[dir<0?H.index:H.index+1]:null;
    var r=f.apply(this,arguments); after(e); return r;
  };
  w.__dd11=1; window[name]=w;
}
wrap("undo",-1); wrap("redo",1);
/* the toolbar buttons were bound to the first version of these functions: point them at the current ones */
function bind(){ var u=document.getElementById("undoBtn"), r=document.getElementById("redoBtn");
  if(u) u.onclick=function(){ window.undo(); }; if(r) r.onclick=function(){ window.redo(); }; }
bind();
/* Ctrl+Y / Cmd+Y also redo (Ctrl+Shift+Z already does); not while typing in a field */
document.addEventListener("keydown",function(e){
  if(!(e.ctrlKey||e.metaKey)||e.shiftKey||e.altKey||(e.key!=="y"&&e.key!=="Y")) return;
  var a=document.activeElement, t=a&&a.tagName; if(t==="INPUT"||t==="TEXTAREA"||t==="SELECT"||(a&&a.isContentEditable)) return;
  e.preventDefault(); e.stopImmediatePropagation(); window.redo();
},true);
window.AMIYO_EDITOR_BUILD="dd-step11-undo";
}catch(e){ try{ console.error("DD step 11",e); }catch(x){} }})();

;
/* ==================== Script 1075 id="amiyo-dd-step12" ==================== */
/* Drag-and-drop step 12: touch support for phones and tablets. (1) The floating preview now sits ABOVE your finger so your hand does not hide it. (2) Double-tap a clip to pick it up: the editor moves the timeline a little after the first tap, so the second tap can land on a different spot; a second tap that lands close to the first one (within 44 px, 0.5 s) now still counts. (3) Tap-to-drop: with a clip picked up, tap any lit "drop here" track and the clip moves there at the same time position, with the same refusal messages as a drag (a tap on a track that cannot take it says why). A bar at the bottom says what to do and has a Cancel button. (4) Long-press a clip, and the menu has "Pick up to move to another track". (5) A second finger (pinch) cancels a drag cleanly and the clip stays put. (6) Dragging near the top or bottom edge of the timeline scrolls it, so tracks that are off screen can be reached (touch, pen and mouse). (7) Clips can no longer be selected as text or show the system callout; narrow clips keep a grab area in the middle (the invisible grab zones of the two trim handles used to cover a whole short clip, so it could not be dragged by its body); the phone vibrates a little on pick up, drop and refusal where the device allows it. */
(function(){try{
var DD=window.amiyoDD; if(!DD||!DD.moveClip||!DD.undoWired||DD.touchOn) return;
DD.touchOn=1; DD.lastPT="mouse";
var css=document.createElement("style"); css.id="amiyo-dd-css12";
css.textContent="#tracks .clip{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}"+
"@media (pointer:coarse),(max-width:1024px){#tracks .clip .handle[data-resize=\"left\"]::before{left:-14px!important;right:0!important}#tracks .clip .handle[data-resize=\"right\"]::before{left:0!important;right:-14px!important}}"+
"@media (pointer:coarse){#tracks .clip .handle,#tracks .clip.selected .handle{max-width:30%}.track-row.dd-can-drop .track-lane::after{font-size:13px;padding:4px 12px;border-radius:999px;background:rgba(0,0,0,.5)}#ddGhost{font-size:13px;padding:8px 12px}}"+
"#ddPickBar{position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:100002;display:none;align-items:center;gap:10px;max-width:min(94vw,520px);padding:9px 10px 9px 14px;border-radius:14px;border:1px solid var(--accent2);background:var(--panel2);color:var(--text);box-shadow:var(--shadow);font-size:13px;line-height:1.3}"+
"#ddPickBar.open{display:flex}#ddPickBar span{min-width:0}#ddPickBar b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:300px}#ddPickBar small{color:var(--muted)}#ddPickBar button{flex:none;min-height:40px;min-width:76px;padding:0 14px;border-radius:10px;border:1px solid var(--line);background:var(--panel3);color:var(--text);font-size:13px;cursor:pointer;touch-action:manipulation}";
document.head.appendChild(css);
function now(){ return Date.now(); }
function dist(a,b,c,d){ return Math.sqrt((a-c)*(a-c)+(b-d)*(b-d)); }
function vib(p){ try{ if(DD.lastPT!=="mouse"&&navigator.vibrate) navigator.vibrate(p); }catch(e){} }
function rowIndex(el){ var row=el&&el.closest&&el.closest("#tracks .track-row"); if(!row) return -1; return [].indexOf.call(document.querySelectorAll("#tracks .track-row"),row); }

/* ---------- bottom bar while a clip is picked up on a touch screen ---------- */
var bar=null;
function ensureBar(){
  if(bar) return bar;
  bar=document.createElement("div"); bar.id="ddPickBar"; bar.setAttribute("role","status");
  bar.innerHTML='<span><b></b><small></small></span><button type="button">Cancel</button>';
  bar.lastChild.addEventListener("click",function(ev){ ev.preventDefault(); ev.stopPropagation(); DD.putDown(); sync(); });
  document.body.appendChild(bar); return bar;
}
function sync(){
  var p=DD.picked, f=p&&DD.find(p.clipId);
  if(!f||DD.lastPT==="mouse"){ if(bar) bar.classList.remove("open"); return; }
  var b=ensureBar(), n=DD.targets(p.clipId).length;
  b.querySelector("b").textContent="“"+(f.clip.name||"Clip")+"” picked up";
  b.querySelector("small").textContent=n?"Tap a lit track to drop it there":"No other track can take it. Add one with ＋ Track";
  b.classList.add("open");
}
var rt=window.renderTracks;
window.renderTracks=function(){ var r=rt.apply(this,arguments); try{ sync(); }catch(e){ window.__swl&&window.__swl(e); } return r; };
var pu=DD.pickUp;
/* on a phone the timeline is small once a clip is selected: if no lit track can be seen, scroll the first one into view */
function reveal(){
  try{
    var sc=document.getElementById("timelineScroll"), p=DD.picked; if(!sc||!p) return;
    var T=DD.targets(p.clipId); if(!T.length) return;
    var rows=document.querySelectorAll("#tracks .track-row"), sr=sc.getBoundingClientRect(), vis=false, first=null;
    T.forEach(function(t){ var el=rows[project.tracks.indexOf(t)]; if(!el) return; var r=el.getBoundingClientRect(), v=Math.min(r.bottom,sr.bottom)-Math.max(r.top,sr.top); if(v>=Math.min(60,r.height*.6)) vis=true; if(!first) first=el; });
    if(!vis&&first){ var r0=first.getBoundingClientRect(); sc.scrollTop+=r0.top-sr.top-8; }
  }catch(e){ window.__swl&&window.__swl(e); }
}
DD.pickUp=function(id){ var r=pu.apply(this,arguments); if(r){ vib(14); if(DD.lastPT!=="mouse") setTimeout(reveal,200); } try{ sync(); }catch(e){ window.__swl&&window.__swl(e); } return r; };
var pd=DD.putDown;
DD.putDown=function(){ var r=pd.apply(this,arguments); try{ sync(); }catch(e){} return r; };
window.addEventListener("keydown",function(e){ if(e.key==="Escape") setTimeout(sync,0); },false);

/* ---------- finger tracking: tap, double-tap, tap-to-drop, second finger ---------- */
var down=null, prev=null, dragPid=null, dropTap=null, mute=0;
window.addEventListener("pointerdown",function(e){
  DD.lastPT=e.pointerType||"mouse";
  if(e.pointerType==="mouse") { down=null; return; }
  /* a second finger while a clip is being dragged: cancel the drag, the clip stays where it was */
  if(DD.drag&&dragPid!=null&&e.pointerId!==dragPid){
    var pid=dragPid; dragPid=null; down=null; prev=null;
    try{ window.dispatchEvent(new PointerEvent("pointercancel",{pointerId:pid,pointerType:e.pointerType,bubbles:true})); }catch(x){ window.__swl&&window.__swl(x); }
    DD.say("Drag cancelled. The clip stayed where it was",1800); return;
  }
  var t=e.target, clipEl=t&&t.closest?t.closest("#tracks .clip"):null;
  var onBody=!!(clipEl&&!t.closest("[data-resize],.handle,svg"));
  down={pid:e.pointerId,x:e.clientX,y:e.clientY,t:e.timeStamp,moved:false,clip:onBody?clipEl.dataset.clip:null,pt:e.pointerType};
  if(clipEl) dragPid=e.pointerId;
  dropTap=null;
  if(DD.picked&&!clipEl&&t&&t.closest&&!t.closest(".track-label")&&!t.closest("#ddPickBar")){
    var i=rowIndex(t); if(i>=0&&project.tracks[i]) dropTap={pid:e.pointerId,x:e.clientX,y:e.clientY,t:e.timeStamp,track:project.tracks[i].id};
  }
},true);
window.addEventListener("pointermove",function(e){
  if(down&&e.pointerId===down.pid&&dist(e.clientX,e.clientY,down.x,down.y)>10) down.moved=true;
  if(dropTap&&e.pointerId===dropTap.pid&&dist(e.clientX,e.clientY,dropTap.x,dropTap.y)>12) dropTap=null;
},true);
window.addEventListener("pointercancel",function(e){ if(down&&e.pointerId===down.pid) down=null; if(dropTap&&e.pointerId===dropTap.pid) dropTap=null; if(e.pointerId===dragPid) dragPid=null; },true);
window.addEventListener("pointerup",function(e){
  if(e.pointerId===dragPid) dragPid=null;
  /* tap-to-drop */
  if(dropTap&&e.pointerId===dropTap.pid){
    var d=dropTap; dropTap=null; down=null;
    if(e.timeStamp-d.t<600&&DD.picked){ mute=e.timeStamp+600; dropOn(d.track); return; }
  }
  if(!down||e.pointerId!==down.pid) return;
  var dn=down; down=null;
  if(dn.moved||e.timeStamp-dn.t>350) { return; }
  /* double-tap: two quick taps (measured with the touch's own clock, so a slow redraw between them does not matter). The second may land beside the clip because the timeline shifts after the first, so it counts when it is on the same clip, or close to the first tap */
  if(prev&&e.timeStamp-prev.t<500&&(dn.clip?dn.clip===prev.id:dist(e.clientX,e.clientY,prev.x,prev.y)<44)){
    var id=prev.id; prev=null;
    mute=e.timeStamp+600; if(!(DD.picked&&DD.picked.clipId===id)) DD.pickUp(id);
    return;
  }
  prev=dn.clip?{id:dn.clip,x:e.clientX,y:e.clientY,t:e.timeStamp}:null;
},true);
/* the taps that picked up or dropped a clip must not also move the playhead or put the clip down again (judged by the tap's own clock, because the redraw after a pick-up can take a while) */
window.addEventListener("click",function(e){ if(e.timeStamp<mute&&e.target&&e.target.closest&&(e.target.closest("#timelineScroll")||e.target.closest("#tracks"))&&!e.target.closest("#ddPickBar")){ if(!e.target.closest("#tracks .clip")){ e.stopImmediatePropagation(); e.preventDefault(); } } },true);

function dropOn(trackId){
  var p=DD.picked, f=p&&DD.find(p.clipId), to=project.tracks.find(function(t){ return t.id===trackId; });
  if(!f||!to) return;
  if(to===f.track){ DD.putDown(); return; }
  if(!DD.canGo(f,to)){
    var why=to.locked?("“"+to.name+"” is locked. Unlock it first"):(DD.picOnly&&DD.picOnly(f,to)?("“"+to.name+"” takes pictures only"):("“"+to.name+"” takes "+(to.sub==="image"?"picture":to.kind)+" clips only"));
    DD.say("✕ "+why+". Tap a lit track",2600); vib([30,40,30]); return;
  }
  DD.multiOrig=null;
  var r=DD.moveClip(f.clip.id,to.id);
  if(r&&r.ok){ DD.picked=null; try{ DD.paint(); }catch(e){} sync(); vib(20); DD.say((r.n>1?(r.n+" clips"):("“"+(f.clip.name||"Clip")+"”"))+" moved to “"+r.track.name+"”",1800); }
  else{ vib([30,40,30]); DD.say((r&&r.why||"That track can't take this clip")+". Tap another lit track or Cancel",3600); }
}
DD.dropOn=dropOn;

/* ---------- ghost above the finger ---------- */
var hk=DD.dragHook;
DD.dragHook=function(e,f,t,h){
  var r=hk&&hk.apply(this,arguments);
  try{
    if(e&&e.pointerType&&e.pointerType!=="mouse"){
      var g=document.getElementById("ddGhost");
      if(g){ var w=g.offsetWidth, hh=g.offsetHeight, left=Math.max(4,Math.min(innerWidth-w-4,e.clientX-w/2)), top=e.clientY-hh-70; if(top<4) top=Math.min(innerHeight-hh-4,e.clientY+60); g.style.left=left+"px"; g.style.top=top+"px"; }
    }
    autoScroll(e);
  }catch(x){ window.__swl&&window.__swl(x); }
  return r;
};

/* ---------- scroll the track list while dragging near its top or bottom edge ---------- */
var as={on:false,e:null};
function autoScroll(e){ as.e={pid:e.pointerId,pt:e.pointerType,x:e.clientX,y:e.clientY}; if(!as.on){ as.on=true; requestAnimationFrame(step); } }
function step(){
  if(!DD.drag||!as.e){ as.on=false; return; }
  var sc=document.getElementById("timelineScroll"), p=as.e;
  if(sc){
    var r=sc.getBoundingClientRect(), zone=Math.min(56,r.height/4), v=0;
    if(p.x>=r.left&&p.x<=r.right){ if(p.y<r.top+zone&&p.y>=r.top-30) v=-Math.ceil((r.top+zone-p.y)/zone*14); else if(p.y>r.bottom-zone&&p.y<=r.bottom+30) v=Math.ceil((p.y-(r.bottom-zone))/zone*14); }
    if(v){
      var before=sc.scrollTop; sc.scrollTop=before+v;
      if(sc.scrollTop!==before){
        /* the rows moved under the finger: tell the drag where the finger is now, so the lit row is right */
        try{ window.dispatchEvent(new PointerEvent("pointermove",{pointerId:p.pid,pointerType:p.pt||"mouse",clientX:p.x,clientY:p.y,buttons:p.pt==="mouse"?1:0,bubbles:true,cancelable:true})); }catch(x){ window.__swl&&window.__swl(x); }
      }
    }
  }
  requestAnimationFrame(step);
}

/* ---------- long-press menu: Pick up to move ---------- */
function reg(){
  if(!(window.amiyoClipMenu&&window.amiyoClipMenu.register)) return;
  window.amiyoClipMenu.register(function(ctx){
    var p=ctx&&ctx.primary; if(!p||!p.clip||!p.track||p.track.locked) return [];
    if(!DD.targets(p.clip.id).length) return [];
    return [{icon:"⇅",label:"Pick up to move to another track",run:function(){ DD.lastPT=DD.lastPT||"touch"; DD.pickUp(p.clip.id); try{ sync(); }catch(e){} }}];
  });
}
reg();
window.AMIYO_EDITOR_BUILD="dd-step12-touch";
}catch(e){ try{ console.error("DD step 12",e); }catch(x){} }})();

;
/* ==================== Script 1076 id="amiyo-dd-step13" ==================== */
/* Drag-and-drop step 13: locked and hidden track rules. LOCKED: a clip on a locked track cannot be picked up, dragged or tapped to move, and nothing can be dropped on a locked track (the track is not lit, the preview says "is locked", and a drop says so and leaves the clip where it was). New: if you lock a track while you are holding a clip from it, the clip is put down at once with a message; and when a group move leaves some selected clips behind because they sit on locked tracks, the editor tells you how many. HIDDEN: a clip can still be moved onto a hidden track, but it will not show (or play) there, so the preview says "(hidden track)" while you drag and after the drop the editor tells you which track is hidden and how to show it. Moving a clip OUT of a hidden track needs no warning. */
(function(){try{
var DD=window.amiyoDD; if(!DD||!DD.touchOn||DD.lockRules) return;
DD.lockRules=1;
function nm(c){ return "“"+(c&&c.name||"Clip")+"”"; }
/* ghost note while dragging over a hidden track */
var hk=DD.dragHook;
DD.dragHook=function(e,f,t,h){
  var r=hk&&hk.apply(this,arguments);
  try{
    if(h&&t&&f&&t!==f.track&&t.hidden){ var g=document.getElementById("ddGhost"); if(g&&g.lastChild&&/^(→|\d+ clips)/.test(g.lastChild.textContent)) g.lastChild.textContent+=" (hidden track)"; }
  }catch(x){ window.__swl&&window.__swl(x); }
  return r;
};
/* after a move: warn about hidden targets and about selected clips left behind on locked tracks */
var mv=DD.moveClip;
DD.moveClip=function(id,toId,orig,label){
  var left=0;
  try{ (project.tracks||[]).forEach(function(t){ if(t.locked) t.clips.forEach(function(c){ if(c.selected&&c.id!==id) left++; }); }); }catch(x){}
  var many=null; try{ many=DD.multiIds(id); }catch(x){}
  var r=mv.apply(this,arguments);
  try{
    if(r&&r.ok){
      var ids=(many&&many.length>1)?many.slice():[id], hid=[], k=0;
      ids.forEach(function(i){ var f=DD.find(i); if(f&&f.track.hidden&&hid.indexOf(f.track)<0) hid.push(f.track); });
      var msgs=[];
      if(hid.length){ var snd=hid.every(function(t){ return t.kind==="audio"; }); msgs.push(hid.map(function(t){ return "“"+t.name+"”"; }).join(" and ")+(hid.length>1?" are":" is")+" hidden, so "+(ids.length>1?"these clips":"this clip")+" will not "+(snd?"be heard":"show")+" until you show the track (eye button)"); }
      if(left) msgs.push(left+" selected clip"+(left>1?"s":"")+" on locked tracks "+(left>1?"stayed":"stayed")+" where "+(left>1?"they were":"it was"));
      if(msgs.length) setTimeout(function(){ DD.say(msgs.join(". "),4200); },1900);
    }
  }catch(x){ window.__swl&&window.__swl(x); }
  return r;
};
/* locking the track of the clip you are holding puts it down */
var rt=window.renderTracks;
window.renderTracks=function(){
  var r=rt.apply(this,arguments);
  try{
    var p=DD.picked, f=p&&DD.find(p.clipId);
    if(f&&f.track.locked){ DD.putDown(true); DD.say("“"+f.track.name+"” is locked, so "+nm(f.clip)+" was put down",2800); }
  }catch(x){ window.__swl&&window.__swl(x); }
  return r;
};
window.AMIYO_EDITOR_BUILD="dd-step13-lockhide";
}catch(e){ try{ console.error("DD step 13",e); }catch(x){} }})();

;
/* ==================== Script 1077 id="amiyo-dd-step14" ==================== */
/* Drag-and-drop step 14: pictures you import or add to the timeline go to an Image track on their own. Before, a picture landed on Video 1 and could push or sit among real video. Now: the picture goes to the Image track you have selected; if none is selected, to the first Image track that is unlocked and visible; if there is no such track, the editor makes "Image 1" (or the next number) and puts the picture there. Several pictures added one after another line up on the same Image track, one after the other, from the playhead. This covers every way of adding: the + button on a card, double-click in the Library, drag from the Library onto the timeline, Import dialogs, and Record/Screenshot results. Videos and sounds are not touched. Making the track and adding the picture is ONE history entry ("Add picture to Image 1"), so one Undo removes both. */
(function(){try{
var DD=window.amiyoDD; if(!DD||!DD.lockRules||DD.autoImage) return;
DD.autoImage=1;
function ok(t){ return t&&DD.family(t)==="image"&&!t.locked&&!t.hidden; }
DD.imageTarget=function(selId){
  var T=project.tracks||[], i, t;
  if(selId){ t=T.find(function(x){ return x.id===selId; }); if(ok(t)) return t; }
  for(i=0;i<T.length;i++) if(ok(T[i])) return T[i];
  return null;
};
DD.makeImageTrack=function(){
  var T=project.tracks, at=-1, i;
  var tr={id:uid("track"),name:DD.nextName("image"),kind:"video",sub:"image",locked:false,hidden:false,muted:false,clips:[]};
  for(i=0;i<T.length;i++) if(DD.family(T[i])==="image") at=i;
  if(at<0) for(i=0;i<T.length;i++) if(T[i].kind==="video") at=i;
  T.splice(at<0?T.length:at+1,0,tr);
  return tr;
};
var orig=window.addAssetToTimeline;
if(typeof orig!=="function") return;
window.addAssetToTimeline=function(assetId){
  var a=project&&project.assets&&project.assets[assetId];
  if(!a||a.type!=="image") return orig.apply(this,arguments);
  var selBefore=null; try{ selBefore=selectedTrackId; }catch(e){}
  var r=orig.apply(this,arguments);
  try{
    var f=getClip();
    if(!f||!f.clip||f.clip.assetId!==assetId) return r;
    var c=f.clip, from=f.track;
    if(from&&DD.family(from)==="image"&&!from.locked) return r;       /* already on an Image track */
    var to=DD.imageTarget(selBefore), made=false;
    if(!to){ to=DD.makeImageTrack(); made=true; }
    var i=from.clips.indexOf(c); if(i>=0) from.clips.splice(i,1);
    c.start=nearestGap(to.clips,Math.max(0,currentTime||0),c.duration);
    to.clips.push(c); to.clips.sort(function(x,y){ return x.start-y.start; });
    selectedClipId=c.id; selectedTrackId=to.id;
    var h=project.history, e=h&&h.entries&&h.entries[h.index];
    if(e&&e.label==="Add clip"){ e.after=JSON.parse(JSON.stringify(serializableProject())); e.label="Add picture to "+to.name; }
    try{ scheduleAutosave(); }catch(x){}
    try{ renderAll(); }catch(x){}
    DD.say("Picture added to "+to.name+(made?" (new Image track)":""),2400);
  }catch(x){ try{ window.__swl&&window.__swl(x); }catch(y){} }
  return r;
};
window.AMIYO_EDITOR_BUILD="dd-step14-autoimage";
}catch(e){ try{ console.error("DD step 14",e); }catch(x){} }})();

;
/* ==================== Script 1078 id="amiyo-dd-step15" ==================== */
/* Drag-and-drop step 15: final test pass. Tested with real mouse and touch drags in a browser: Video 1 to Video 2, Audio, Text, Caption and Image moves, pictures between Image and Video tracks, refused drops (wrong kind, taken spot, locked track), multi-select drag, snapping, hidden-track notes, double-click and double-tap pick-up, tap-to-drop, Undo/Redo and save/restore. One thing found and fixed: Alt+drag (copy a clip) made TWO undo steps, one for the move and one for the copy, so a single Undo left the clip half-moved. The move and the copy are now ONE history entry, and one Undo puts everything back. (Alt+drag keeps meaning "drag a copy"; it does not turn snapping off, use the 🧲 Snap button for that.) */
(function(){try{
var DD=window.amiyoDD; if(!DD||!DD.autoImage||DD.finalPass) return;
DD.finalPass=1;
var ot=window.transact;
if(typeof ot==="function") window.transact=function(label){
  var r=ot.apply(this,arguments);
  if(label==="Alt-drag copy"){
    try{
      var H=project.history, e=H&&H.entries[H.index], p=H&&H.entries[H.index-1];
      if(e&&p&&/^Move/.test(p.label||"")&&JSON.stringify(p.after)===JSON.stringify(e.before)){
        p.after=e.after; p.label=(p.label||"Move clip")+" and keep a copy";
        H.entries.splice(H.index,1); H.index--;
        try{ updateUndoRedo(); }catch(x){}
      }
    }catch(x){ try{ window.__swl&&window.__swl(x); }catch(y){} }
  }
  return r;
};
window.AMIYO_EDITOR_BUILD="dd-step15-final";
}catch(e){ try{ console.error("DD step 15",e); }catch(x){} }})();

;
/* ==================== Script 1079 id="amiyo-dd-step16" ==================== */
/* Drag-and-drop improvement pass 1 (found by testing every step one by one). Two bugs on SOUND clips: (1) the yellow volume-line layer covered the whole clip, including the left and right trim handles, so you could not grab the edge of a sound clip to trim it, and pressing there dragged the whole clip instead; (2) double-clicking a sound clip to pick it up ALSO added a stray volume point. Now the volume layer lets touches through everywhere except on the volume dots themselves, so the trim handles and the track-to-track drag work on sound clips exactly like on video. To still add a volume point, double-click ON the yellow line (within about 10 px of it); a double-click anywhere else on the clip picks it up. */
(function(){try{
var DD=window.amiyoDD; if(!DD||!DD.finalPass||DD.volFix) return;
DD.volFix=1;
var css=document.createElement("style"); css.id="amiyo-dd-css16";
css.textContent="#tracks .vol-automation{pointer-events:none!important}#tracks .vol-automation circle{pointer-events:auto!important}";
document.head.appendChild(css);
function lineY(clip,frac,h){
  var k=(clip.volumeKeyframes||[]).slice().sort(function(a,b){ return a.t-b.t; }); if(!k.length) return null;
  var d=Math.max(.05,clip.duration), t=frac*d, v=k[0].v, i;
  if(t<=k[0].t) v=k[0].v; else if(t>=k[k.length-1].t) v=k[k.length-1].v;
  else for(i=0;i<k.length-1;i++){ if(t>=k[i].t&&t<=k[i+1].t){ var s=k[i+1].t-k[i].t; v=s>0?k[i].v+(k[i+1].v-k[i].v)*(t-k[i].t)/s:k[i+1].v; break; } }
  v=Math.max(0,Math.min(1,v)); return h-v*(h-6)-3;
}
var busy=false;
window.addEventListener("dblclick",function(e){
  if(busy) return;
  try{
    var t=e.target, el=t&&t.closest&&t.closest("#tracks .clip.audio"); if(!el) return;
    if(t.closest&&(t.closest("[data-resize]")||String(t.tagName).toLowerCase()==="circle")) return;
    var svg=el.querySelector(".vol-automation"); if(!svg) return;
    var f=getClipByIds(el.dataset.clip,el.dataset.track); if(!f||f.track.locked) return;
    var r=el.getBoundingClientRect(), w=Math.max(22,el.offsetWidth), h=42;
    var y=lineY(f.clip,Math.max(0,Math.min(1,(e.clientX-r.left)/w)),h);
    if(y!=null&&Math.abs((e.clientY-r.top)-y)<=10){
      if(DD.putDown) DD.putDown(true);
      busy=true;
      try{ svg.dispatchEvent(new MouseEvent("dblclick",{clientX:e.clientX,clientY:e.clientY,bubbles:false,cancelable:true})); }finally{ busy=false; }
    }
  }catch(x){ try{ window.__swl&&window.__swl(x); }catch(y){} }
},true);
window.AMIYO_EDITOR_BUILD="dd-step16-volfix";
}catch(e){ try{ console.error("DD step 16",e); }catch(x){} }})();

;
/* ==================== Script 1080 id="amiyo-dd-step17" ==================== */
/* Drag-and-drop improvement pass 2: keyboard move. After you double-click (or double-tap) a clip to pick it up, the Up and Down arrow keys move it to the next track above or below that can take it (same kind, not locked), keeping its time. If that spot is taken the editor says so and tries nothing else; Esc puts the clip down. Each key press is one Undo step. This makes the track moves usable without a mouse, and with a phone keyboard. */
(function(){try{
var DD=window.amiyoDD; if(!DD||!DD.volFix||DD.keyMove) return;
DD.keyMove=1;
function typing(t){ return t&&(/^(input|textarea|select)$/i.test(t.tagName||"")||t.isContentEditable); }
window.addEventListener("keydown",function(e){
  try{
    if((e.key!=="ArrowUp"&&e.key!=="ArrowDown")||e.ctrlKey||e.metaKey||e.altKey||e.shiftKey||typing(e.target)) return;
    var p=DD.picked; if(!p) return;
    var f=DD.find(p.clipId); if(!f||f.track.locked) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var T=project.tracks, i=T.indexOf(f.track), step=e.key==="ArrowUp"?-1:1, to=null, j;
    for(j=i+step;j>=0&&j<T.length;j+=step){ if(!T[j].locked&&DD.canGo(f,T[j])){ to=T[j]; break; } }
    if(!to){ DD.say("No "+(step<0?"higher":"lower")+" track can take this clip",2000); return; }
    var r=DD.moveClip(f.clip.id,to.id,null);
    if(!r.ok){ DD.say(r.why+". The clip stayed on “"+f.track.name+"”",2600); return; }
    DD.picked={clipId:f.clip.id,from:to.id};
    try{ DD.paint(); }catch(x){}
    DD.say("Moved to “"+to.name+"”",1400);
    setTimeout(function(){ try{ var el=document.querySelector('#tracks .clip[data-clip="'+f.clip.id+'"]'); if(el&&el.scrollIntoView) el.scrollIntoView({block:"nearest",inline:"nearest"}); }catch(x){} },30);
  }catch(x){ try{ window.__swl&&window.__swl(x); }catch(y){} }
},true);
window.AMIYO_EDITOR_BUILD="dd-step17-keymove";
}catch(e){ try{ console.error("DD step 17",e); }catch(x){} }})();

;
/* ==================== Script 1081 id="amiyo-pipstudio-p01" ==================== */
/* PiP Studio - Step P1: the long PiP panel becomes five tabs (Shape / Place / Style / Motion / Arrange), the last tab is remembered,
   and the panel scrolls into view when you select a PiP. Nothing is removed - every control keeps its id and its behaviour. */
(function(){"use strict";
var A=window.AMIYO_PIP; if(!A||A.tabs) return;
var TABS=[["shape","Shape"],["place","Place"],["style","Style"],["motion","Motion"],["arrange","Arrange"]];
/* later steps can add their own: AMIYO_PIP.tabs.rules.unshift([/^My block/,"style"]) */
var T=A.tabs={list:TABS,rules:[[/^Corner radius/,"shape"],[/^Size presets/,"shape"],[/^Zoom inside/,"shape"],[/^(X \d|Rotate)/,"place"],[/^Snap to guides/,"place"],[/^Border/,"style"],[/^Fade in/,"style"],[/^Shadow/,"style"],[/^Animation/,"motion"],[/^Move path/,"motion"]]};
var KEY="amiyo-pip-tab", last=null, lastSel=null;
function cls(el){
  var t=(el.textContent||"").trim();
  if(el.id==="ppShapes") return "shape"; if(el.id==="ppSize") return "place";
  if(el.tagName==="LABEL"){ if(/^Shape/.test(t)) return "shape"; if(/^Size/.test(t)) return "place"; if(/^Drop shadow/.test(t)) return "style"; }
  for(var i=0;i<T.rules.length;i++) if(T.rules[i][0].test(t)) return T.rules[i][1];
  return "arrange";
}
function saved(){ try{ return localStorage.getItem(KEY); }catch(e){ return null; } }
function save(v){ try{ localStorage.setItem(KEY,v); }catch(e){} }
function show(g,id){
  g.dataset.tab=id; var bs=g.querySelectorAll(".pp-tabs button"); for(var i=0;i<bs.length;i++){ var on=bs[i].dataset.tab===id; bs[i].classList.toggle("on",on); bs[i].setAttribute("aria-selected",on?"true":"false"); }
}
function organise(g){
  if(!g||g.dataset.tabbed||!g.querySelector("#ppShapes")) return false;
  g.dataset.tabbed="1";
  var kids=Array.prototype.slice.call(g.children), h3=kids[0], secs={}, bottom=null, moves=[], ex=g.querySelector("#ppExtra");
  TABS.forEach(function(t){ var d=document.createElement("div"); d.className="pp-sec"; d.dataset.tab=t[0]; d.setAttribute("role","tabpanel"); secs[t[0]]=d; });
  kids.slice(1).forEach(function(k){
    if(k===ex){ Array.prototype.slice.call(k.children).forEach(function(c){ moves.push(c); }); return; }
    if(k.classList.contains("pp-row")&&k.querySelector("#ppDel")){ bottom=k; return; }
    moves.push(k);
  });
  moves.forEach(function(k){ secs[cls(k)].appendChild(k); });
  var bar=document.createElement("div"); bar.className="pp-tabs"; bar.setAttribute("role","tablist");
  TABS.forEach(function(t){ if(!secs[t[0]].children.length) return; var b=document.createElement("button"); b.type="button"; b.dataset.tab=t[0]; b.textContent=t[1]; b.setAttribute("role","tab"); bar.appendChild(b); });
  bar.onclick=function(e){ var b=e.target.closest("button[data-tab]"); if(!b) return; show(g,b.dataset.tab); save(b.dataset.tab); };
  h3.parentNode.insertBefore(bar,h3.nextSibling);
  var ref=ex||bottom; TABS.forEach(function(t){ if(secs[t[0]].children.length) g.insertBefore(secs[t[0]],ref); });
  var want=saved(); if(!bar.querySelector('[data-tab="'+want+'"]')) want="shape"; show(g,want);
  return true;
}
function scroller(el){ for(var p=el.parentElement;p&&p!==document.body;p=p.parentElement){ var o=getComputedStyle(p).overflowY; if((o==="auto"||o==="scroll")&&p.scrollHeight>p.clientHeight+4) return p; } return null; }
function reveal(g){
  var sc=scroller(g); if(!sc) return;
  var top=g.getBoundingClientRect().top-sc.getBoundingClientRect().top+sc.scrollTop-6;
  try{ sc.scrollTo({top:Math.max(0,top),behavior:"smooth"}); }catch(e){ sc.scrollTop=Math.max(0,top); }
}
var st=document.createElement("style"); st.textContent=
"#ppGroup .pp-tabs{display:grid;grid-template-columns:repeat(auto-fit,minmax(74px,1fr));gap:4px;margin:8px 0 10px}"+
"#ppGroup .pp-tabs button{flex:1 1 0;min-width:0;min-height:36px;padding:4px 2px;border-radius:8px;border:1px solid #503d33;background:#30231d;color:#fbe0d2;font-size:11.5px;cursor:pointer;white-space:nowrap;overflow:hidden}"+
"#ppGroup .pp-tabs button.on{background:#ff7a3d;border-color:#ff7a3d;color:#111;font-weight:700}"+
"#ppGroup[data-tabbed] .pp-sec{display:none}"+
TABS.map(function(t){ return '#ppGroup[data-tab="'+t[0]+'"] .pp-sec[data-tab="'+t[0]+'"]'; }).join(",")+"{display:block}";
document.head.appendChild(st);
var prev=window.renderInspector;
window.renderInspector=function(){
  var r=prev.apply(this,arguments);
  try{ var g=document.getElementById("ppGroup"); if(g){ organise(g);
      var sel=typeof selectedClipId!=="undefined"?selectedClipId:null;
      if(sel&&sel!==lastSel) setTimeout(function(){ var g2=document.getElementById("ppGroup"); if(g2) reveal(g2); },60);
      lastSel=sel; } else lastSel=null; }catch(e){ window.__swl&&window.__swl(e); }
  return r;
};
try{ renderInspector(); }catch(e){}
})();

;
/* ==================== Script 1082 id="amiyo-pipstudio-p02" ==================== */
/* PiP Studio - Step P2: a visual shape picker. All 24 shapes are shown at once as a tappable icon grid (no hidden scroll box),
   the current shape's name is shown next to the "Shape" heading, and touch targets are phone-sized. */
(function(){"use strict";
var A=window.AMIYO_PIP; if(!A||A.shapeGrid||!A.panels) return; A.shapeGrid=true;
var SHORT={rsquare:"Round sq.",rounded:"Rounded",rect:"Rect",square:"Square",bubble:"Speech",parallelogram:"Slanted",rrsq:"Custom ▢",rrect:"Custom ▭",hexagon:"Hexagon",octagon:"Octagon",pentagon:"Pentagon",triangle:"Triangle",squircle:"Squircle",diamond:"Diamond"};
var st=document.createElement("style"); st.textContent=
"#ppGroup #ppShapes{display:grid;grid-template-columns:repeat(auto-fill,minmax(56px,1fr));gap:6px;max-height:none;overflow:visible;padding:0}"+
"#ppGroup #ppShapes button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-height:54px;padding:6px 2px 4px;font-size:10px;line-height:1.1;border-radius:10px;overflow:hidden}"+
"#ppGroup #ppShapes button svg{width:24px;height:24px;margin:0;vertical-align:baseline}"+
"#ppGroup #ppShapes button span{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"+
"#ppGroup .pp-shname{font-weight:700;color:var(--accent,#ff7a3d);margin-left:4px}";
document.head.appendChild(st);
function nameOf(id){ var d=A.def(id); return d?d[1]:id; }
A.panels.push(function(ex,f,g){
  var box=g.querySelector("#ppShapes"); if(!box||box.dataset.grid) return; box.dataset.grid="1";
  box.setAttribute("role","radiogroup");
  Array.prototype.forEach.call(box.querySelectorAll("[data-shape]"),function(b){
    var id=b.dataset.shape, full=nameOf(id), svg=b.querySelector("svg"), sp=document.createElement("span");
    sp.textContent=SHORT[id]||full; b.textContent=""; if(svg) b.appendChild(svg); b.appendChild(sp);
    b.title=full; b.setAttribute("aria-label",full); b.setAttribute("role","radio");
  });
  var lab=box.previousElementSibling, tag=document.createElement("span"); tag.className="pp-shname";
  function sync(){ var on=box.querySelector("[data-shape].on"); tag.textContent=on?"· "+nameOf(on.dataset.shape):""; Array.prototype.forEach.call(box.querySelectorAll("[data-shape]"),function(b){ b.setAttribute("aria-checked",b.classList.contains("on")?"true":"false"); }); }
  if(lab&&lab.tagName==="LABEL") lab.appendChild(tag);
  box.addEventListener("click",function(){ setTimeout(sync,0); }); sync();
  /* keep the picked shape visible if the panel was scrolled */
});
})();

;
/* ==================== Script 1083 id="amiyo-pipstudio-p03" ==================== */
/* PiP Studio - Step P3: the PiP wizard now knows about PiPs that are already on the main video.
   - existing PiPs are drawn as faded numbered shapes on the wizard preview, and the empty message says how many are already there
   - new PiPs that would land on top of an existing PiP (at the same time) are moved to the best free spot when you press Apply
   - new PiP tracks get a unique name (before: a second "PiP 1" track was created). One undo step, as before. */
(function(){"use strict";
var A=window.AMIYO_PIP; if(!A||A.wizAware||!A.pickSpot) return; A.wizAware=true;
var LABEL="Add picture-in-picture";
function clipIds(proj){ var s={}; try{ (proj.tracks||[]).forEach(function(t){ (t.clips||[]).forEach(function(c){ s[c.id]=1; }); }); }catch(e){} return s; }
function trackIds(proj){ var s={}; try{ (proj.tracks||[]).forEach(function(t){ s[t.id]=1; }); }catch(e){} return s; }
function fixNew(before){
  var oldC=clipIds(before), oldT=trackIds(before), moved=0, renamed=0;
  /* 1. unique names for the tracks the wizard just made */
  var used={}; project.tracks.forEach(function(t){ if(oldT[t.id]) used[t.name]=1; });
  project.tracks.forEach(function(t){ if(oldT[t.id]||!/^PiP \d+$/.test(t.name||"")) return;
    if(used[t.name]){ var n=1; while(used["PiP "+n]) n++; t.name="PiP "+n; renamed++; } used[t.name]=1; });
  /* 2. keep new PiPs off the existing ones */
  var fresh=[]; project.tracks.forEach(function(t){ t.clips.forEach(function(c){ if(!oldC[c.id]&&c.pip&&c.pip.main) fresh.push(c); }); });
  fresh.sort(function(a,b){ return a.start-b.start; });
  fresh.forEach(function(c){
    var d=A.boxDims(c), hit=false, others=[];
    A.pipsOf(c.pip.main).forEach(function(p){ var o=p.clip; if(o.id===c.id) return;
      if(o.start<c.start+c.duration-1e-6&&c.start<o.start+o.duration-1e-6){ var od=A.boxDims(o); others.push({x:o.x==null?.5:o.x,y:o.y==null?.5:o.y,w:od.w,h:od.h}); } });
    var me={x:c.x==null?.5:c.x,y:c.y==null?.5:c.y,w:d.w,h:d.h};
    others.forEach(function(q){ var ox=Math.max(0,Math.min(me.x+me.w/2,q.x+q.w/2)-Math.max(me.x-me.w/2,q.x-q.w/2)), oy=Math.max(0,Math.min(me.y+me.h/2,q.y+q.h/2)-Math.max(me.y-me.h/2,q.y-q.h/2)); if(ox*oy>1e-4) hit=true; });
    if(hit){ var sp=A.pickSpot(d,others); c.x=sp.x; c.y=sp.y; moved++; }
  });
  return {moved:moved,renamed:renamed};
}
var rh=window.recordHistory;
window.recordHistory=function(label,before,after){
  var a=after;
  if(label===LABEL&&before&&before.tracks){
    try{ var r=fixNew(before); if(r.moved||r.renamed){ a=deepClone(serializableProject()); if(r.moved) setTimeout(function(){ try{ toast(r.moved+(r.moved===1?" new PiP was":" new PiPs were")+" moved off the existing ones"); }catch(e){} },700); } }catch(e){ window.__swl&&window.__swl(e); }
  }
  return rh.call(this,label,before,a);
};
/* ---- wizard preview: show what is already there ---- */
function clipPath(id){
  var d=A.def(id), k=d[2], pts=window.AMIYO_SHAPE_PTS||{};
  if(k==="ellipse") return "ellipse(50% 50% at 50% 50%)";
  if(k==="rounded") return "inset(0 round 20%)";
  if(typeof k==="string"&&k.indexOf("rr:")===0) return "inset(0 round "+(parseFloat(k.slice(3))||0)+"%)";
  if(pts[k]) return "polygon("+pts[k].map(function(p){ return (p[0]*100).toFixed(1)+"% "+(p[1]*100).toFixed(1)+"%"; }).join(",")+")";
  return "none";
}
var st=document.createElement("style"); st.textContent=
".pipstage .pipghost{position:absolute;pointer-events:none;background:rgba(255,255,255,.22);outline:0;display:grid;place-items:center;color:#fff;font:700 12px system-ui,sans-serif;text-shadow:0 1px 3px #000;box-shadow:inset 0 0 0 2px rgba(255,255,255,.55)}"+
".pipstage .pipghost small{font-weight:600;opacity:.9;font-size:9px;display:block;text-align:center}";
document.head.appendChild(st);
function decorate(){
  var stage=document.getElementById("pipStage"), sel=document.getElementById("pipMain"); if(!stage||!sel) return;
  var mid=sel.value, key=mid+"|"+A.pipsOf(mid).length; if(stage.dataset.ghost===key) return; stage.dataset.ghost=key;
  Array.prototype.forEach.call(stage.querySelectorAll(".pipghost"),function(n){ n.remove(); });
  var ps=A.pipsOf(mid); if(!ps.length) return;
  var W=(project.settings&&project.settings.width)||1280, H=(project.settings&&project.settings.height)||720;
  ps.forEach(function(p,i){ var c=p.clip, d=A.boxDims(c), el=document.createElement("div"); el.className="pipghost";
    var def=A.def(c.pip.shape), sq=!!def[3];
    el.style.cssText="left:"+((c.x==null?.5:c.x)*100).toFixed(2)+"%;top:"+((c.y==null?.5:c.y)*100).toFixed(2)+"%;width:"+(d.w*100).toFixed(2)+"%;height:"+(d.h*100).toFixed(2)+"%;transform:translate(-50%,-50%) rotate("+(+c.rotation||0)+"deg);clip-path:"+clipPath(c.pip.shape)+";opacity:"+(c.off?.35:1);
    el.innerHTML="<span>"+(i+1)+"<small>on video</small></span>"; el.title="Already on this video"; stage.insertBefore(el,stage.firstChild.nextSibling); });
  var em=document.querySelector("#modalBody .mempty");
  if(em&&/No attached videos yet/.test(em.textContent)) em.innerHTML="<b>"+ps.length+(ps.length===1?" PiP is":" PiPs are")+" already on this video</b>They are the faded numbers in the preview and stay as they are. Tap “＋ Add video” to attach more; new ones are kept off the existing ones.";
}
var t=0; new MutationObserver(function(){ clearTimeout(t); t=setTimeout(function(){ try{ decorate(); }catch(e){ window.__swl&&window.__swl(e); } },30); }).observe(document.body,{childList:true,subtree:true});
})();

;
/* ==================== Script 1084 id="amiyo-pipstudio-p04" ==================== */
/* PiP Studio - Step P4: a small floating toolbar next to the selected PiP on the preview, so the common actions are one tap away
   (no scrolling to the inspector): sound on/off, duplicate, forward, backward, jump to the main video, delete. */
(function(){"use strict";
var A=window.AMIYO_PIP; if(!A||!A.ov||A.quick) return; A.quick=true;
var ov=A.ov, shell=ov.parentNode, dragging=false;
var bar=document.createElement("div"); bar.id="ppQuick"; bar.setAttribute("role","toolbar"); bar.setAttribute("aria-label","Selected PiP"); shell.appendChild(bar);
var st=document.createElement("style"); st.textContent=
"#ppQuick{position:absolute;z-index:40;display:none;gap:2px;padding:3px;border-radius:12px;background:rgba(20,22,30,.92);box-shadow:0 4px 16px rgba(0,0,0,.45);backdrop-filter:blur(6px);touch-action:manipulation}"+
"#ppQuick button{width:38px;height:36px;border:0;border-radius:9px;background:transparent;color:#fff;font-size:17px;line-height:1;cursor:pointer;padding:0;display:grid;place-items:center}"+
"#ppQuick button:hover,#ppQuick button:active{background:rgba(255,122,61,.35)}"+
"#ppQuick button.dng{color:#ff9a9a}#ppQuick button.off{opacity:.55}"+
"#ppQuick i{width:1px;background:rgba(255,255,255,.22);margin:6px 2px;flex:none}";
document.head.appendChild(st);
function hist(label,before){ try{ recordHistory(label,before,deepClone(serializableProject())); }catch(e){ window.__swl&&window.__swl(e); } }
function hasSound(f){ return !f.track.muted&&(f.clip.volume==null?1:f.clip.volume)>0; }
var html="";
function build(f){
  var snd=hasSound(f), h=
   '<button type="button" data-q="snd" title="'+(snd?"Mute this PiP":"Turn this PiP’s sound on")+'" aria-label="Sound" class="'+(snd?"":"off")+'">'+(snd?"\u{1F50A}":"\u{1F507}")+'</button>'+
   '<button type="button" data-q="dup" title="Duplicate" aria-label="Duplicate">⧉</button><i></i>'+
   '<button type="button" data-q="front" title="Bring forward" aria-label="Bring forward">▲</button>'+
   '<button type="button" data-q="back" title="Send backward" aria-label="Send backward">▼</button><i></i>'+
   '<button type="button" data-q="main" title="Select the main video" aria-label="Select main video">◀</button>'+
   '<button type="button" data-q="del" class="dng" title="Remove this PiP" aria-label="Remove PiP">\u{1F5D1}</button>';
  if(h!==html){ bar.innerHTML=h; html=h; }
}
function hide(){ bar.style.display="none"; }
function place(){
  try{
    var pb=ov.querySelector(".pb"); if(!pb||dragging){ hide(); return; }
    var f=A.find(pb.dataset.id); if(!f){ hide(); return; }
    bar.dataset.id=f.clip.id; build(f);
    var r=pb.getBoundingClientRect(), s=shell.getBoundingClientRect(); if(!s.width){ hide(); return; }
    bar.style.display="flex"; var bw=bar.offsetWidth, bh=bar.offsetHeight;
    var left=r.left-s.left+r.width/2-bw/2, top=r.bottom-s.top+30;
    if(top+bh>s.height-4){ top=r.top-s.top-bh-46; if(top<4) top=s.height-bh-6; }
    left=Math.max(4,Math.min(s.width-bw-4,left)); top=Math.max(4,top);
    /* stay clear of the master level meter, which floats over the right edge of the preview */
    var mt=document.getElementById("prMeter"); if(mt){ var m=mt.getBoundingClientRect();
      if(m.width&&s.left+left<m.right+4&&s.left+left+bw>m.left-4&&s.top+top<m.bottom+4&&s.top+top+bh>m.top-4){ left=Math.max(4,m.left-s.left-bw-6); } }
    bar.style.left=left+"px"; bar.style.top=top+"px";
  }catch(e){ window.__swl&&window.__swl(e); }
}
bar.addEventListener("pointerdown",function(e){ e.stopPropagation(); },true);
bar.addEventListener("click",function(e){
  e.stopPropagation(); var b=e.target.closest("button[data-q]"); if(!b) return; var f=A.find(bar.dataset.id); if(!f) return; var k=b.dataset.q;
  if(k==="snd"){ var before=deepClone(serializableProject()), on=hasSound(f);
    if(on){ f.track.muted=true; f.clip.volume=0; } else { f.track.muted=false; f.clip.volume=1; }
    hist(on?"Mute PiP":"PiP sound on",before); scheduleAutosave(); try{ renderAll(); renderPreviewFrame(); }catch(x){} try{ toast(on?"PiP muted":"PiP sound on"); }catch(x){} }
  else if(k==="dup") A.layerAct("dup",f);
  else if(k==="front"||k==="back") A.layerAct(k,f);
  else if(k==="main"){ var m=A.mainOf(f.clip); if(m) A.select(m); else { try{ toast("This PiP is not attached to a main video"); }catch(x){} } }
  else if(k==="del") A.remove(f.clip.id);
  setTimeout(place,30);
});
ov.addEventListener("pointerdown",function(e){ if(e.target.closest(".pb")){ dragging=true; hide(); } },true);
function done(){ if(!dragging) return; dragging=false; setTimeout(place,40); }
window.addEventListener("pointerup",done); window.addEventListener("pointercancel",done);
var t=0; try{ new MutationObserver(function(){ clearTimeout(t); t=setTimeout(place,16); }).observe(ov,{childList:true,subtree:true,attributes:true}); }catch(e){}
try{ new ResizeObserver(function(){ place(); }).observe(shell); }catch(e){}
place();
})();

;
/* ==================== Script 1085 id="amiyo-pipstudio-p05" ==================== */
/* PiP Studio - Step P5: a "Timing" tab for every PiP: when it appears (relative to the main clip), how long it plays, which part of
   its own video it starts from, speed, volume, plus one-tap "start/end at playhead" and "match main clip". All edits are undoable. */
(function(){"use strict";
var A=window.AMIYO_PIP; if(!A||!A.tabs||A.timing) return; A.timing=true;
var T=A.tabs; if(!T.list.some(function(t){ return t[0]==="time"; })) T.list.splice(T.list.length-1,0,["time","Timing"]);
var cs=document.createElement("style"); cs.textContent='#ppGroup[data-tab="time"] .pp-sec[data-tab="time"]{display:block}'; document.head.appendChild(cs);
T.rules.unshift([/^Timing/,"time"]); T.rules.unshift([/^Sound/,"time"]);
var EPS=1e-3, num=function(v,d){ v=parseFloat(v); return isFinite(v)?v:d; }, cl=function(v,a,b){ return Math.min(b,Math.max(a,v)); };
var r2=function(v){ return Math.round(v*100)/100; };
function hist(label,before){ try{ recordHistory(label,before,deepClone(serializableProject())); }catch(e){ window.__swl&&window.__swl(e); } }
function srcDur(c){ var a=getAsset(c.assetId); return a&&a.type==="video"&&a.duration>0?a.duration:Infinity; }
function limits(f){
  var c=f.clip, m=A.mainOf(c), sp=c.speed||1, mS=m?m.clip.start:0, mE=m?m.clip.start+m.clip.duration:Infinity;
  var maxDur=(srcDur(c)-(c.inPoint||0))/sp;
  return {mS:mS,mE:mE,sp:sp,maxDur:isFinite(maxDur)?Math.max(.1,maxDur):Infinity};
}
function overlaps(f,s,d){ return f.track.clips.some(function(k){ return k!==f.clip&&s<k.start+k.duration-EPS&&k.start<s+d-EPS; }); }
function apply(f,label,fn){
  var before=deepClone(serializableProject()), c=f.clip, s0=c.start, d0=c.duration, i0=c.inPoint, sp0=c.speed, o0=c.outPoint;
  var msg=fn();
  if(msg){ c.start=s0; c.duration=d0; c.inPoint=i0; c.speed=sp0; c.outPoint=o0; try{ toast(msg); }catch(e){} try{ renderAll(); }catch(e){} return; }
  c.outPoint=(c.inPoint||0)+c.duration*(c.speed||1);
  hist(label,before); try{ scheduleAutosave(); renderAll(); renderPreviewFrame(); }catch(e){}
}
function setTiming(f,s,d,label){
  apply(f,label,function(){
    var L=limits(f), c=f.clip;
    s=cl(s,L.mS,Math.max(L.mS,L.mE-.1)); d=cl(d,.1,Math.min(L.mE-s,L.maxDur));
    if(d<.1) return "No room left after that point";
    if(overlaps(f,s,d)) return "That would overlap another clip on this PiP track";
    c.start=s; c.duration=d;
  });
}
A.panels.push(function(ex,f){
  var c=f.clip, m=A.mainOf(c); if(!m) return;
  var L=limits(f), rel=c.start-L.mS, isVid=isFinite(srcDur(c)), w=document.createElement("div");
  w.innerHTML=
   '<label class="field">Timing <span class="pp-note" style="display:inline">relative to the main clip</span></label>'+
   '<div class="fieldrow"><div><label class="field">Appears at (s)</label><input id="ppTmS" type="number" step="0.1" min="0" value="'+r2(rel)+'"></div>'+
   '<div><label class="field">Plays for (s)</label><input id="ppTmD" type="number" step="0.1" min="0.1" value="'+r2(c.duration)+'"></div></div>'+
   (isVid?'<div class="fieldrow"><div><label class="field">Start inside its video (s)</label><input id="ppTmI" type="number" step="0.1" min="0" value="'+r2(c.inPoint||0)+'"></div>'+
   '<div><label class="field">Speed</label><select id="ppTmSp">'+[.25,.5,.75,1,1.25,1.5,2,3].map(function(v){ return '<option value="'+v+'"'+((c.speed||1)===v?" selected":"")+'>'+v+'×</option>'; }).join("")+'</select></div></div>':"")+
   '<div class="pp-row"><button type="button" class="pp-btn" id="ppTmA">▶ Start at playhead</button><button type="button" class="pp-btn" id="ppTmB">■ End at playhead</button></div>'+
   '<div class="pp-row"><button type="button" class="pp-btn" id="ppTmM">↔ Match main clip</button></div>'+
   '<div class="pp-note" id="ppTmInfo"></div>'+
   (isVid?'<label class="field" style="margin-top:8px">Sound <span id="ppVolV">'+Math.round((c.volume==null?1:c.volume)*100)+'%</span></label><input id="ppVol" type="range" min="0" max="200" step="1" value="'+Math.round((c.volume==null?1:c.volume)*100)+'">'+
   '<div class="pp-note">'+(f.track.muted?"This PiP track is muted - raising the volume turns its sound on.":"Plays together with the main video.")+'</div>':"");
  ex.appendChild(w);
  var q=function(id){ return w.querySelector("#"+id); };
  var info=q("ppTmInfo"); if(info){ var room=isFinite(L.maxDur)?Math.min(L.maxDur,L.mE-c.start):L.mE-c.start;
    info.textContent="Main clip is "+r2(m.clip.duration)+"s long"+(isVid?" · this video has "+r2(srcDur(c))+"s":"")+" · room to extend: "+r2(Math.max(0,room-c.duration))+"s"; }
  q("ppTmS").onchange=function(e){ var rs=cl(num(e.target.value,rel),0,Math.max(0,m.clip.duration-.1)); setTiming(f,L.mS+rs,c.duration,"PiP start time"); };
  q("ppTmD").onchange=function(e){ setTiming(f,c.start,num(e.target.value,c.duration),"PiP length"); };
  if(isVid){
    q("ppTmI").onchange=function(e){ apply(f,"PiP start inside video",function(){ var mx=Math.max(0,srcDur(c)-c.duration*(c.speed||1)); c.inPoint=cl(num(e.target.value,c.inPoint||0),0,mx); }); };
    q("ppTmSp").onchange=function(e){ apply(f,"PiP speed",function(){ var sp=num(e.target.value,1); c.speed=sp; var mx=(srcDur(c)-(c.inPoint||0))/sp; if(c.duration>mx){ c.duration=Math.max(.1,mx); } if(overlaps(f,c.start,c.duration)) return "That would overlap another clip on this PiP track"; }); };
    var vol=q("ppVol"); vol.oninput=function(){ q("ppVolV").textContent=vol.value+"%"; A.edit("PiP volume",function(){ c.volume=vol.value/100; if(c.volume>0) f.track.muted=false; }); };
  }
  q("ppTmA").onclick=function(){ var t=typeof currentTime==="number"?currentTime:0; if(t<L.mS||t>=L.mE-.1){ try{ toast("Move the playhead over the main clip first"); }catch(e){} return; }
    setTiming(f,t,Math.min(c.duration,Math.max(.1,L.mE-t)),"PiP start at playhead"); };
  q("ppTmB").onclick=function(){ var t=typeof currentTime==="number"?currentTime:0; if(t<=c.start+.1){ try{ toast("Move the playhead after the PiP's start"); }catch(e){} return; } setTiming(f,c.start,t-c.start,"PiP end at playhead"); };
  q("ppTmM").onclick=function(){ setTiming(f,L.mS,m.clip.duration,"PiP match main clip"); };
});
try{ renderInspector(); }catch(e){}
})();

/* The editor folds and re-sorts any inspector box it does not know, keyed by its title - and the PiP Studio title contains the main clip's name
   ("PiP Studio on a.webm"), so every new main clip started with the panel folded shut. Keep it open unless YOU fold it. */
(function(){
  var KEY="amiyo-pip-folded";
  function user(){ try{ return localStorage.getItem(KEY)==="1"; }catch(e){ return false; } }
  function setUser(v){ try{ localStorage.setItem(KEY,v?"1":"0"); }catch(e){} }
  function apply(){ var g=document.getElementById("ppGroup"); if(!g) return; var want=user();
    /* the editor sorts unknown boxes to the very bottom of the inspector - keep PiP Studio right under the clip header */
    var insp=g.parentNode, head=insp&&insp.querySelector(":scope > .group"); if(head&&head!==g&&head.nextElementSibling!==g) insp.insertBefore(g,head.nextSibling);
    if(g.classList.contains("ins-fold")!==want){ g.classList.toggle("ins-fold",want); var b=g.querySelector(".ins-chev"); if(b){ b.setAttribute("aria-expanded",String(!want)); } } }
  document.addEventListener("click",function(e){
    var g=e.target.closest&&e.target.closest("#ppGroup"); if(g&&(e.target.closest(".ins-chev")||(e.target.closest("h3")&&!e.target.closest("input,label,button,select,a")))){ setTimeout(function(){ setUser(g.classList.contains("ins-fold")); },0); return; }
    var all=e.target.closest&&e.target.closest("[data-all]"); if(all&&all.closest(".ins-all")) setUser(all.dataset.all==="1");
  },true);
  var prev=window.renderInspector;
  window.renderInspector=function(){ var r=prev.apply(this,arguments); try{ apply(); }catch(e){ window.__swl&&window.__swl(e); } return r; };
  try{ renderInspector(); }catch(e){}
})();

;
/* ==================== Script 1086 id="amiyo-pipstudio-p06" ==================== */
/* PiP Studio - Step P6: cutting a main clip keeps its PiPs attached.
   Before: after Split / Cut all, every PiP stayed linked to the LEFT half, so moving the right half left its PiPs behind.
   Now: PiPs that start at or after the cut follow the RIGHT half; PiPs that start before it (even if they run past it) stay with the left half.
   When "Cut all tracks" also cuts a PiP, the right piece of that PiP follows the right half too. One undo step, same as the cut itself. */
(function(){"use strict";
var A=window.AMIYO_PIP; if(!A||A.afterCut) return;
var EPS=1e-3, map={}, clearT=0;
function relink(pc,m){ var p=pc.pip; p.main=m.id; p.ms=m.start; p.mi=m.inPoint||0; p.ps=pc.start; p.orphan=undefined; delete p.orphan; }
A.afterCut=function(left,right,t){
  if(!left||!right) return 0; var n=0;
  clearTimeout(clearT); clearT=setTimeout(function(){ map={}; },0);
  if(left.pip){
    /* a PiP piece that now lies over the right half of its main clip */
    var mm=left.pip.main&&map[left.pip.main];
    if(mm&&right.start>=mm.t-EPS&&right.pip&&right.pip.main===left.pip.main){ var f=A.find(mm.rid); if(f){ relink(right,f.clip); n++; } }
    return n;
  }
  var pips=A.pipsOf(left.id); if(!pips.length) return 0;
  map[left.id]={rid:right.id,t:t};
  pips.forEach(function(p){ if(p.clip.start>=t-EPS){ relink(p.clip,right); n++; } });
  return n;
};
})();

;
/* ==================== Script 1087 id="amiyo-pipstudio-p07" ==================== */
/* PiP Studio - Step P7: PiPs that run outside their main clip.
   Before: shorten (or cut, or move) a main clip and its PiPs kept playing past its end - over whatever came next.
   Now: - the main clip's panel shows "N PiPs run outside this clip" with a one-tap "Trim PiPs to fit" (one undo step);
        - every PiP's Timing tab shows how far it runs over and a "Trim to main clip" button;
        - a short message appears when an edit makes PiPs run outside. Locked PiP tracks are never changed. */
(function(){"use strict";
var A=window.AMIYO_PIP; if(!A||A.fit||!A.pipsOf) return; A.fit=true;
var EPS=0.02, MIN=0.1;
function over(f){ /* f: {clip,track} of a PiP -> {before, after} seconds outside the main clip, or null */
  var m=A.mainOf(f.clip); if(!m) return null; var c=f.clip, mS=m.clip.start, mE=m.clip.start+m.clip.duration;
  var b=Math.max(0,mS-c.start), a=Math.max(0,c.start+c.duration-mE);
  return {before:b<EPS?0:b, after:a<EPS?0:a, gone:c.start>=mE-EPS||c.start+c.duration<=mS+EPS, m:m};
}
A.overhang=function(mainId){ var o=[]; A.pipsOf(mainId).forEach(function(p){ var v=over(p); if(v&&(v.before||v.after)) o.push({f:p,v:v}); }); return o; };
function srcIsVideo(c){ var a=getAsset(c.assetId); return !!(a&&a.type==="video"); }
function trimOne(f){
  var v=over(f); if(!v||(!v.before&&!v.after)) return 0; if(f.track.locked) return -1; if(v.gone) return -2;
  var c=f.clip, m=v.m.clip, mS=m.start, mE=m.start+m.duration, sp=c.speed||1;
  if(v.before){ var sh=mS-c.start; c.start=mS; c.duration-=sh; if(srcIsVideo(c)) c.inPoint=(c.inPoint||0)+sh*sp;
    [c.keyframes,c.volumeKeyframes].forEach(function(l){ if(!l) return; for(var i=l.length-1;i>=0;i--){ l[i].t-=sh; if(l[i].t<0) l.splice(i,1); } });
    if(c.pip){ c.pip.ms=m.start; c.pip.ps=c.start; } }
  if(c.start+c.duration>mE+EPS) c.duration=mE-c.start;
  if(c.duration<MIN) c.duration=MIN;
  c.outPoint=(c.inPoint||0)+c.duration*sp;
  if(c.pip){ c.pip.sig=null; c.pip.sig2=null; }
  return 1;
}
A.fitToMain=function(mainId){
  var list=A.overhang(mainId); if(!list.length) return {n:0,locked:0,gone:0};
  var before=deepClone(serializableProject()), n=0, locked=0, gone=0;
  list.forEach(function(o){ var r=trimOne(o.f); if(r===1) n++; else if(r===-1) locked++; else if(r===-2) gone++; });
  if(n){ try{ recordHistory("Trim PiPs to main clip",before,deepClone(serializableProject())); scheduleAutosave(); renderAll(); renderPreviewFrame(); }catch(e){ window.__swl&&window.__swl(e); } }
  return {n:n,locked:locked,gone:gone};
};
A.fitOne=function(clipId){ var f=A.find(clipId); if(!f) return 0; var before=deepClone(serializableProject()), r=trimOne(f);
  if(r===1){ try{ recordHistory("Trim PiP to main clip",before,deepClone(serializableProject())); scheduleAutosave(); renderAll(); renderPreviewFrame(); }catch(e){ window.__swl&&window.__swl(e); } } return r; };
function say(t){ try{ toast(t,4200); }catch(e){} }
function report(r){
  if(r.n) say("Trimmed "+r.n+" PiP"+(r.n>1?"s":"")+" to fit"+(r.locked?" · "+r.locked+" on locked tracks left alone":"")+(r.gone?" · "+r.gone+" lie fully outside, left as they are":""));
  else say(r.locked?"Those PiPs are on locked tracks":r.gone?"Those PiPs lie fully outside the main clip - move them with Match main clip":"Nothing to trim");
}
function fmt(s){ return s.toFixed(1)+"s"; }
/* main clip panel */
A.mainPanels.push(function(g,f){
  var list=A.overhang(f.clip.id); if(!list.length) return;
  var gone=list.filter(function(o){ return o.v.gone; }).length, w=document.createElement("div");
  w.innerHTML='<div class="pp-note" style="color:#ffb86b" role="status">⚠ '+list.length+(list.length>1?" PiPs run":" PiP runs")+" outside this clip"+(gone?" ("+gone+" fully)":"")+'</div><div class="pp-row"><button type="button" class="pp-btn pri" id="ppFitAll">✂ Trim PiPs to fit</button></div>';
  w.querySelector("#ppFitAll").onclick=function(e){ e.stopPropagation(); report(A.fitToMain(f.clip.id)); };
  g.appendChild(w);
});
/* PiP panel, Timing tab */
A.panels.push(function(ex,f){
  var v=over(f); if(!v||(!v.before&&!v.after)) return;
  var parts=[]; if(v.before) parts.push(fmt(v.before)+" before"); if(v.after) parts.push(fmt(v.after)+" after");
  var w=document.createElement("div");
  w.innerHTML='<label class="field">Timing check</label><div class="pp-note" style="color:#ffb86b" role="status">⚠ Runs '+parts.join(" and ")+' the main clip'+(v.gone?" (entirely outside it)":"")+'</div>'+
    (v.gone?"":'<div class="pp-row"><button type="button" class="pp-btn pri" id="ppFitOne">✂ Trim to main clip</button></div>');
  var b=w.querySelector("#ppFitOne"); if(b) b.onclick=function(e){ e.stopPropagation(); var r=A.fitOne(f.clip.id); if(r===-1) say("This PiP's track is locked"); else if(r===1) say("PiP trimmed to the main clip"); };
  ex.appendChild(w);
});
/* tell the person when an edit makes PiPs run outside their main clip */
var last=0, told=0;
function count(){ var n=0; try{ project.tracks.forEach(function(t){ t.clips.forEach(function(c){ if(!c.pip||!c.pip.main) return; var v=over({clip:c,track:t}); if(v&&(v.before||v.after)) n++; }); }); }catch(e){} return n; }
last=count();
var rh=window.recordHistory;
window.recordHistory=function(label,before,after){
  var r=rh.apply(this,arguments);
  try{ if(!/^Trim PiP/.test(label||"")){ var n=count(); if(n>last&&Date.now()-told>3000){ told=Date.now(); setTimeout(function(){ say(n+" PiP"+(n>1?"s":"")+" now run"+(n>1?"":"s")+" outside their main clip - open the main clip's PiP Studio to trim"); },500); } last=n; } else last=count(); }catch(e){ window.__swl&&window.__swl(e); }
  return r;
};
try{ renderInspector(); }catch(e){}
})();

;
/* ==================== Script 1088 id="amiyo-pipstudio-p08" ==================== */
/* PiP Studio - Step P8: locked and hidden tracks.
   Before: a PiP on a locked track could still be changed from every PiP tab, dragged on the preview, or edited from the quick toolbar.
   Now: a locked PiP shows "Track locked" and its controls are switched off (tabs and "Main video" still work); dragging it on the preview,
   the quick toolbar, remove, forward/backward and duplicate all refuse with a short message. A hidden track gets a note, nothing is blocked. */
(function(){"use strict";
var A=window.AMIYO_PIP; if(!A||A.locks||!A.find) return; A.locks=true;
function say(t){ try{ toast(t,2600); }catch(e){} }
A.isLocked=function(id){ var f=typeof id==="string"?A.find(id):id; return !!(f&&f.track&&f.track.locked); };
/* API guards */
["layerAct","remove"].forEach(function(k){ var o=A[k]; if(typeof o!=="function") return;
  A[k]=function(a,b){ var f=k==="remove"?A.find(a):b; if(f&&f.track&&f.track.locked){ say("This PiP's track is locked"); return; } return o.apply(this,arguments); }; });
var oe=A.edit;
A.edit=function(label,fn){ var sel=typeof selectedClipId!=="undefined"?selectedClipId:null, f=sel&&A.find(sel);
  if(f&&f.clip.pip&&f.track.locked){ say("This PiP's track is locked"); try{ renderInspector(); }catch(e){} return; } return oe.apply(this,arguments); };
/* panel */
var st=document.createElement("style"); st.textContent="#ppGroup.pp-locked .pp-sec :is(input,select,button),#ppGroup.pp-locked #ppDel{opacity:.45;pointer-events:none}#ppGroup .pp-lockbar{font-size:12px;padding:6px 9px;border-radius:8px;background:#2a2230;color:#ffd2d2;margin:6px 0}";
document.head.appendChild(st);
function mark(){
  var g=document.getElementById("ppGroup"); if(!g) return;
  var sel=typeof selectedClipId!=="undefined"?selectedClipId:null, f=sel&&A.find(sel);
  var old=g.querySelector(".pp-lockbar"); if(old) old.remove();
  var locked=!!(f&&f.clip.pip&&f.track.locked); g.classList.toggle("pp-locked",locked);
  Array.prototype.forEach.call(g.querySelectorAll(".pp-sec :is(input,select,button),#ppDel"),function(el){ if(locked){ el.disabled=true; el.setAttribute("aria-disabled","true"); } else if(el.getAttribute("aria-disabled")==="true"){ el.disabled=false; el.removeAttribute("aria-disabled"); } });
  var msg=locked?"🔒 This PiP's track is locked. Unlock it on the timeline to edit.":(f&&f.clip.pip&&f.track.hidden?"👁 This PiP's track is hidden, so it is not shown in the preview or export.":"");
  if(msg){ var d=document.createElement("div"); d.className="pp-lockbar"; d.setAttribute("role","status"); d.textContent=msg; var h3=g.querySelector("h3"); h3.parentNode.insertBefore(d,h3.nextSibling); }
}
var prev=window.renderInspector;
window.renderInspector=function(){ var r=prev.apply(this,arguments); try{ mark(); }catch(e){ window.__swl&&window.__swl(e); } return r; };
/* preview drag + quick toolbar */
if(A.ov){ A.ov.addEventListener("pointerdown",function(e){ var pb=e.target.closest&&e.target.closest(".pb"); if(!pb) return; if(A.isLocked(pb.dataset.id)){ e.stopImmediatePropagation(); e.preventDefault(); say("This PiP's track is locked"); } },true); }
var q=document.getElementById("ppQuick");
if(q) q.addEventListener("click",function(e){ var b=e.target.closest("button[data-q]"); if(!b||b.dataset.q==="main") return; if(A.isLocked(q.dataset.id)){ e.stopImmediatePropagation(); say("This PiP's track is locked"); } },true);
try{ renderInspector(); }catch(e){}
})();

;
/* ==================== Script 1089 id="amiyo-pipstudio-p09" ==================== */
/* PiP Studio - Step P9: clearer Timing fields.
   Before: "Appears at" past the end crushed the PiP to 0.1 s, or was refused with a vague "No room left" while the field kept showing the wrong number;
   a refused value stayed in the box.
   Now: "Appears at" slides the PiP (its length is kept) so it still fits inside the main clip; "Plays for" is limited to what the main clip and the video allow;
   whenever a number is changed for you, a message says what it became and why, and the boxes always show the real values afterwards. One undo step each. */
(function(){"use strict";
var A=window.AMIYO_PIP; if(!A||!A.timing||A.timing2) return; A.timing2=true;
var EPS=1e-3, MIN=.1;
var num=function(v){ v=parseFloat(v); return isFinite(v)?v:null; }, r1=function(v){ return Math.round(v*10)/10; };
function say(t){ try{ toast(t,3600); }catch(e){} }
function maxLen(c){ var a=getAsset(c.assetId); if(!(a&&a.type==="video"&&a.duration>0)) return Infinity; return Math.max(MIN,(a.duration-(c.inPoint||0))/(c.speed||1)); }
function overlaps(f,s,d){ return f.track.clips.some(function(k){ return k!==f.clip&&s<k.start+k.duration-EPS&&k.start<s+d-EPS; }); }
function commit(f,label,fn,sync){
  var c=f.clip, before=deepClone(serializableProject()), s0=c.start, d0=c.duration, o0=c.outPoint;
  var res=fn(); /* returns {msg, refuse} */
  if(res&&res.refuse){ c.start=s0; c.duration=d0; c.outPoint=o0; say(res.refuse); }
  else { c.outPoint=(c.inPoint||0)+c.duration*(c.speed||1); try{ recordHistory(label,before,deepClone(serializableProject())); scheduleAutosave(); renderAll(); renderPreviewFrame(); }catch(e){ window.__swl&&window.__swl(e); }
    if(res&&res.msg) say(res.msg); }
  try{ renderInspector(); }catch(e){}
  try{ if(sync) sync(); }catch(e){}
}
A.panels.push(function(ex,f){
  var c=f.clip, m=A.mainOf(c), S=ex.querySelector("#ppTmS"), D=ex.querySelector("#ppTmD"); if(!m||!S||!D) return;
  var mS=m.clip.start, mE=mS+m.clip.duration, win=m.clip.duration;
  var _p=0;
  function sync(){ var X=fresh(); if(!X) return; S.value=Math.round((X.c.start-X.mS)*100)/100; D.value=Math.round(X.c.duration*100)/100; }
  S.max=Math.max(0,win-MIN).toFixed(2); D.min=MIN;
  function fresh(){ var f2=A.find(f.clip.id); if(!f2) return null; var m2=A.mainOf(f2.clip); if(!m2) return null; return {f:f2,c:f2.clip,mS:m2.clip.start,mE:m2.clip.start+m2.clip.duration,win:m2.clip.duration}; }
  S.onchange=function(){
    var X=fresh(); if(!X) return; var f=X.f,c=X.c,mS=X.mS,mE=X.mE,win=X.win;
    var v=num(S.value); if(v===null){ try{ renderInspector(); }catch(e){} return; }
    if(Math.abs(v-(c.start-mS))<.005) return;   /* a second change event fires when the panel redraws: ignore a value already applied */
    commit(f,"PiP start time",function(){
      var d=c.duration, ml=Math.min(maxLen(c),win), msg="";
      if(d>ml+EPS){ d=ml; msg="Shortened to "+r1(d)+"s to fit"; }
      var rs=Math.min(Math.max(0,v),Math.max(0,win-d)), s=mS+rs;
      if(!msg&&Math.abs(rs-v)>.05) msg=v<0?"Appears at can't be before the main clip: set to 0.0s":"Moved to "+r1(rs)+"s so the whole PiP still fits inside the main clip";
      if(overlaps(f,s,d)) return {refuse:"That would overlap another clip on this PiP track"};
      c.start=s; c.duration=d; return {msg:msg};
    },sync);
  };
  D.onchange=function(){
    var X=fresh(); if(!X) return; var f=X.f,c=X.c,mS=X.mS,mE=X.mE,win=X.win;
    var v=num(D.value); if(v===null){ try{ renderInspector(); }catch(e){} return; }
    if(Math.abs(v-c.duration)<.005) return;
    commit(f,"PiP length",function(){
      var room=mE-c.start, ml=maxLen(c), lim=Math.min(room,ml), d=Math.max(MIN,Math.min(v,lim)), msg="";
      if(room<MIN) return {refuse:"No room left after that point - move the PiP earlier first"};
      if(v<MIN) msg="Shortest length is 0.1s";
      else if(v>lim+.05) msg=ml<room?"Limited to "+r1(d)+"s - that is all the video has from its start point":"Limited to "+r1(d)+"s - the main clip ends there";
      if(overlaps(f,c.start,d)) return {refuse:"That would overlap another clip on this PiP track"};
      c.duration=d; return {msg:msg};
    },sync);
  };
});
try{ renderInspector(); }catch(e){}
})();

;
/* ==================== Script 1090 id="amiyo-pipstudio-p10" ==================== */
/* PiP Studio - Step P10 (plan step 3): locked and hidden tracks are respected everywhere.
   Before (P8): only the panel, preview drag, quick toolbar, remove/layer buttons and duplicate were guarded. Layouts, Auto-arrange, Align / Distribute / Match size / Match shape,
   Smart place, Detach, Ratio, Zoom, Animations, Move paths, Presets and dragging a group of PiPs still changed a PiP on a locked track; ducking counted PiPs on hidden tracks.
   Now: a PiP on a locked track is skipped by every group action (and a message says how many were left alone); single-PiP actions refuse; a group drag leaves locked members where
   they are; a locked MAIN video cannot be re-laid-out or ducked; hidden PiPs no longer count as "sound playing" for ducking. Nothing is half-applied and undo stays one step. */
(function(){"use strict";
var A=window.AMIYO_PIP; if(!A||!A.locks||A.locks2) return; A.locks2=true;
function say(t){ try{ toast(t,3000); }catch(e){} }
function lockedClip(x){ var id=typeof x==="string"?x:(x&&x.id); var f=id&&A.find(id); return !!(f&&f.track&&f.track.locked); }
function lockedMain(mid){ var m=A.find(mid); return !!(m&&m.track&&m.track.locked); }
var MSG="This PiP's track is locked";
/* 1. one-PiP actions refuse */
["alignToFrame","smartPlace","detach","attach","moveLayer","setRatio","setZoom","setAnim","addMove"].forEach(function(k){
  var o=A[k]; if(typeof o!=="function") return;
  A[k]=function(a){ if(lockedClip(a)){ say(MSG); return false; } return o.apply(this,arguments); }; });
/* 2. group actions skip locked PiPs (the original code asks A.pipsOf for its list, so it simply never sees them) */
function plural(n,a,b){ return n===1?a:b; }
function viaPips(name,opts){
  var o=A[name]; if(typeof o!=="function") return; opts=opts||{};
  A[name]=function(mainId){
    if(opts.main&&lockedMain(mainId)){ say("The main video's track is locked"); return false; }
    var all=A.pipsOf(mainId), unl=all.filter(function(p){ return !p.track.locked; });
    if(!opts.mainOnly&&all.length&&!unl.length){ say(all.length===1?"The PiP is on a locked track":"All "+all.length+" PiPs are on locked tracks"); return false; }
    if(opts.mainOnly||all.length===unl.length) return o.apply(this,arguments);
    var real=A.pipsOf, hit={};
    A.pipsOf=function(mid){ return real.call(A,mid).filter(function(p){ if(p.track.locked){ hit[p.clip.id]=1; return false; } return true; }); };
    var r; try{ r=o.apply(this,arguments); } finally{ A.pipsOf=real; }
    var n=Object.keys(hit).length; if(n) say(n+" PiP"+(n>1?"s":"")+" on a locked track "+(n>1?"were":"was")+" left as "+(n>1?"they are":"it is"));
    return r; };
}
viaPips("applyLayout",{main:true}); viaPips("resetLayout",{main:true,mainOnly:true});
["autoArrange","alignGroup","distribute","matchSize","matchShape","applyPreset"].forEach(function(k){ viaPips(k); });
/* 3. ducking: main must be unlocked; hidden PiP tracks make no sound, so they never count */
var od=A.duckMain;
if(typeof od==="function") A.duckMain=function(main){
  if(main&&main.track&&main.track.locked){ say("The main video's track is locked"); return 0; }
  var real=A.pipsOf; A.pipsOf=function(mid){ return real.call(A,mid).filter(function(p){ return !p.track.hidden; }); };
  try{ return od.apply(this,arguments); } finally{ A.pipsOf=real; } };
/* 4. dragging a group of PiPs: locked members stay put */
if(A.hooks&&A.hooks.drag) A.hooks.drag.unshift(function(c,d){
  var M=A.multi; if(!M||M.size<2||!M.has(c.id)||d.__m) return;
  d.__m={}; var skipped=0;
  M.forEach(function(id){ if(id===c.id) return; var f=A.find(id); if(!f) return; if(f.track.locked){ skipped++; return; }
    d.__m[id]={x:f.clip.x==null?.5:f.clip.x,y:f.clip.y==null?.5:f.clip.y,s:A.size(f.clip),r:f.clip.rotation||0}; });
  if(skipped) say(skipped+" locked PiP"+plural(skipped,"","s")+" will stay where "+plural(skipped,"it is","they are")); });
/* 5. a typed value can never get through to a locked PiP's panel, and a locked main video's Layout / Duck controls are switched off */
["input","change"].forEach(function(ev){ document.addEventListener(ev,function(e){ var g=document.getElementById("ppGroup");
  if(g&&g.classList.contains("pp-locked")&&g.contains(e.target)){ e.stopImmediatePropagation(); e.preventDefault(); say(MSG); try{ renderInspector(); }catch(_){} } },true); });
var st=document.createElement("style"); st.textContent="#ppGroup.pp-mainlocked :is([data-lay],#ppDkGo,#ppDkClr,#ppDk){opacity:.45;pointer-events:none}";
document.head.appendChild(st);
function markMain(){
  var g=document.getElementById("ppGroup"); if(!g) return;
  var sel=typeof selectedClipId!=="undefined"?selectedClipId:null, f=sel&&A.find(sel), on=!!(f&&!f.clip.pip&&f.track.locked);
  g.classList.toggle("pp-mainlocked",on);
  Array.prototype.forEach.call(g.querySelectorAll("[data-lay],#ppDkGo,#ppDkClr,#ppDk"),function(el){ if(on){ el.disabled=true; el.setAttribute("aria-disabled","true"); } else if(el.getAttribute("aria-disabled")==="true"){ el.disabled=false; el.removeAttribute("aria-disabled"); } });
  var old=g.querySelector(".pp-lockbar.pp-ml"); if(old) old.remove();
  if(on){ var d=document.createElement("div"); d.className="pp-lockbar pp-ml"; d.setAttribute("role","status"); d.textContent="🔒 This video's track is locked, so its layout and sound can't be changed here. PiPs can still be edited."; var h3=g.querySelector("h3"); h3.parentNode.insertBefore(d,h3.nextSibling); }
  /* ducking count: PiPs on hidden tracks make no sound */
  var go=g.querySelector("#ppDkGo");
  if(go&&f&&!f.clip.pip){ var n=A.pipsOf(f.clip.id).filter(function(p){ var c=p.clip; return !(p.track.muted||p.track.hidden||c.off||!((c.volume==null?1:c.volume)>.01)); }).length;
    go.textContent="Duck main under "+n+" PiP"+(n===1?"":"s")+" with sound"; if(!on) go.disabled=!n; }
}
var prev=window.renderInspector;
window.renderInspector=function(){ var r=prev.apply(this,arguments); try{ markMain(); }catch(e){ window.__swl&&window.__swl(e); } return r; };
try{ renderInspector(); }catch(e){}
})();

;
/* ==================== Script 1091 id="amiyo-pipstudio-p11" ==================== */
/* PiP Studio - Step P11 (plan step 4): every Timing entry that cannot be used snaps back to a real value and says why.
   Before (P9): only "Appears at" and "Plays for" explained themselves. A blank box stayed blank; "Start inside its video" and "Speed" changed numbers silently;
   "Start/End at playhead" and "Match main clip" shortened the PiP without a word.
   Now: blank or non-number entries restore the real value and say what to type; every number that is changed for you says what it became and why (video too short, main clip ends,
   can't be negative, would overlap). The boxes always show the true values afterwards. One undo step each, and nothing is recorded when nothing changed. */
(function(){"use strict";
var A=window.AMIYO_PIP; if(!A||!A.timing2||A.timing3) return; A.timing3=true;
var EPS=1e-3, MIN=.1;
function say(t){ try{ toast(t,3800); }catch(e){} }
function r1(v){ return Math.round(v*10)/10; }
function num(v){ if(v===""||v==null) return null; v=parseFloat(v); return isFinite(v)?v:null; }
function srcDur(c){ var a=getAsset(c.assetId); return a&&a.type==="video"&&a.duration>0?a.duration:Infinity; }
function maxLen(c){ var s=srcDur(c); if(!isFinite(s)) return Infinity; return Math.max(MIN,(s-(c.inPoint||0))/(c.speed||1)); }
function overlaps(f,s,d){ return f.track.clips.some(function(k){ return k!==f.clip&&s<k.start+k.duration-EPS&&k.start<s+d-EPS; }); }
function fill(id){
  var f=A.find(id); if(!f) return; var c=f.clip, m=A.mainOf(c), g=document.getElementById("ppGroup"); if(!g||!m) return;
  var set=function(sel,v){ var e=g.querySelector(sel); if(e) e.value=v; };
  set("#ppTmS",Math.round((c.start-m.clip.start)*100)/100); set("#ppTmD",Math.round(c.duration*100)/100);
  set("#ppTmI",Math.round((c.inPoint||0)*100)/100); set("#ppTmSp",String(c.speed||1));
}
function commit(id,label,fn){
  var f=A.find(id); if(!f) return; var c=f.clip, m=A.mainOf(c); if(!m){ fill(id); return; }
  var before=deepClone(serializableProject()), k0=[c.start,c.duration,c.inPoint||0,c.speed||1];
  var res=fn(f,c,m)||{};
  if(res.refuse){ c.start=k0[0]; c.duration=k0[1]; c.inPoint=k0[2]; c.speed=k0[3]; say(res.refuse); }
  else {
    c.outPoint=(c.inPoint||0)+c.duration*(c.speed||1);
    var changed=Math.abs(c.start-k0[0])>EPS||Math.abs(c.duration-k0[1])>EPS||Math.abs((c.inPoint||0)-k0[2])>EPS||(c.speed||1)!==k0[3];
    if(changed){ try{ recordHistory(label,before,deepClone(serializableProject())); scheduleAutosave(); renderAll(); renderPreviewFrame(); }catch(e){ window.__swl&&window.__swl(e); } }
    if(res.msg) say(res.msg);
  }
  try{ renderInspector(); }catch(e){}
  fill(id);
}
var NUM_MSG="Type a number of seconds, for example 2.5";
A.panels.push(function(ex,f){
  var id=f.clip.id, q=function(s){ return ex.querySelector(s); };
  var S=q("#ppTmS"), D=q("#ppTmD"), I=q("#ppTmI"), SP=q("#ppTmSp"), bA=q("#ppTmA"), bB=q("#ppTmB"), bM=q("#ppTmM");
  if(!S||!D) return;
  [S,D].forEach(function(el){ var prev=el.onchange; el.onchange=function(e){ if(num(el.value)===null){ fill(id); say(NUM_MSG); return; } return prev&&prev.call(this,e); }; });
  if(I) I.onchange=function(){
    var v=num(I.value); if(v===null){ fill(id); say(NUM_MSG); return; }
    commit(id,"PiP start inside video",function(f,c){
      var need=c.duration*(c.speed||1), mx=Math.max(0,srcDur(c)-need), x=v, msg="";
      if(v<0){ x=0; msg="Start inside its video can't be negative: set to 0.0s"; }
      else if(isFinite(mx)&&v>mx+.05){ x=mx; msg=mx<.05?"Can't move the start: this PiP plays all "+r1(srcDur(c))+"s of its video, so it has to start at 0.0s":"Limited to "+r1(mx)+"s - the PiP needs "+r1(need)+"s of video after that point"; }
      c.inPoint=x; return {msg:msg}; }); };
  if(SP) SP.onchange=function(){
    var sp=num(SP.value)||1;
    commit(id,"PiP speed",function(f,c){
      var maxD=(srcDur(c)-(c.inPoint||0))/sp, msg=""; c.speed=sp;
      if(isFinite(maxD)&&c.duration>maxD+EPS){ c.duration=Math.max(MIN,maxD); msg="Shortened to "+r1(c.duration)+"s: at "+sp+"× the video has only that much left"; }
      if(overlaps(f,c.start,c.duration)) return {refuse:"That would overlap another clip on this PiP track"};
      return {msg:msg}; }); };
  if(bA) bA.onclick=function(){
    var t=typeof currentTime==="number"?currentTime:0;
    commit(id,"PiP start at playhead",function(f,c,m){
      var mS=m.clip.start, mE=mS+m.clip.duration;
      if(t<mS-EPS||t>=mE-MIN) return {refuse:"Move the playhead over the main clip first"};
      var lim=Math.min(mE-t,maxLen(c)), d=Math.min(c.duration,lim), msg="";
      if(d<c.duration-.05) msg="Shortened to "+r1(d)+"s - "+(maxLen(c)<mE-t?"that is all the video has":"so it ends with the main clip");
      if(overlaps(f,t,d)) return {refuse:"That would overlap another clip on this PiP track"};
      c.start=t; c.duration=d; return {msg:msg}; }); };
  if(bB) bB.onclick=function(){
    var t=typeof currentTime==="number"?currentTime:0;
    commit(id,"PiP end at playhead",function(f,c,m){
      if(t<=c.start+MIN-EPS) return {refuse:"Move the playhead after the PiP's start"};
      var mE=m.clip.start+m.clip.duration, ml=maxLen(c), room=mE-c.start, lim=Math.min(room,ml), d=t-c.start, msg="";
      if(d>lim+.05){ d=lim; msg="Ends at "+r1(c.start-m.clip.start+d)+"s - "+(ml<room?"that is all the video has":"the main clip ends there"); }
      if(overlaps(f,c.start,d)) return {refuse:"That would overlap another clip on this PiP track"};
      c.duration=d; return {msg:msg}; }); };
  if(bM) bM.onclick=function(){
    commit(id,"PiP match main clip",function(f,c,m){
      var ml=maxLen(c), d=Math.min(m.clip.duration,ml), msg="";
      if(d<m.clip.duration-.05) msg="The video is only "+r1(d)+"s long, so the PiP plays for "+r1(d)+"s (the main clip is "+r1(m.clip.duration)+"s)";
      if(overlaps(f,m.clip.start,d)) return {refuse:"That would overlap another clip on this PiP track"};
      c.start=m.clip.start; c.duration=d; return {msg:msg}; }); };
});
try{ renderInspector(); }catch(e){}
})();

;
/* ==================== Script 1092 id="amiyo-pipstudio-p12" ==================== */
/* PiP Studio - Step P12 (plan step 5): the main clip's PiP list shows, for every PiP, WHEN it plays (relative to the main clip) and its SOUND state.
   e.g.  "0.0s - 4.0s · 🔊 100%",  "2.0s - 5.0s · 🔇 muted",  "1.0s - 4.0s · hidden",  "0.0s - 3.0s · no sound (picture)".
   A warning is added when a PiP runs outside the main clip or its track is locked. The line follows mute / hide / lock / volume changes without reopening the panel. */
(function(){"use strict";
var A=window.AMIYO_PIP; if(!A||A.listMeta) return; A.listMeta=true;
var EPS=1e-3;
function fmt(t){ t=Math.round(t*10)/10; if(t<60) return t.toFixed(1)+"s"; var m=Math.floor(t/60), s=t-m*60; return m+":"+(s<10?"0":"")+s.toFixed(1); }
function anySolo(){ return project.tracks.some(function(x){ return x.kind==="audio"&&x.solo; }); }
function sound(p){
  var c=p.clip, a=getAsset(c.assetId);
  if(!a||a.type!=="video") return "no sound (picture)";
  if(p.track.hidden||c.off) return "hidden";
  if(p.track.muted||!((c.volume==null?1:c.volume)>0.001)) return "🔇 muted";
  if(anySolo()) return "🔇 silenced by solo";
  return "🔊 "+Math.round((c.volume==null?1:c.volume)*100)+"%";
}
function meta(p,m){
  var c=p.clip, rs=c.start-m.clip.start, re=rs+c.duration, out=rs<-EPS||re>m.clip.duration+EPS;
  var parts=[fmt(rs)+" - "+fmt(re), sound(p)];
  if(p.track.hidden&&parts[1]!=="hidden") parts.push("hidden");
  if(p.track.locked) parts.push("🔒 locked");
  if(out) parts.push("⚠ outside main clip");
  return {text:parts.join(" · "), warn:out};
}
function refresh(gg,mm){
  var g=(gg&&gg.querySelectorAll)?gg:document.getElementById("ppGroup"); if(!g) return;
  var sel=typeof selectedClipId!=="undefined"?selectedClipId:null, m=(mm&&mm.clip)?mm:(sel&&A.find(sel)); if(!m||m.clip.pip) return;
  Array.prototype.forEach.call(g.querySelectorAll(".pp-item[data-sel]"),function(it){
    var p=A.find(it.dataset.sel); if(!p) return;
    var r=meta(p,m), span=it.querySelector("span:not(.pp-act)"), el=it.querySelector(".pp-meta");
    if(!span) return;
    if(!el){ el=document.createElement("small"); el.className="pp-meta"; span.appendChild(el); }
    el.textContent=r.text; el.title=r.text; el.classList.toggle("warn",r.warn);
  });
}
var st=document.createElement("style");
st.textContent="#ppGroup .pp-item span>.pp-meta{display:block;font-size:10.5px;margin-top:1px;overflow:hidden;text-overflow:ellipsis}#ppGroup .pp-item span>.pp-meta.warn{color:#ffb86b}";
document.head.appendChild(st);
A.listMetaRefresh=refresh;
A.mainPanels.push(function(g,f){ refresh(g,f); });
["renderTimeline","renderLeftPanel"].forEach(function(k){ var o=window[k]; if(typeof o!=="function") return;
  window[k]=function(){ var r=o.apply(this,arguments); try{ refresh(); }catch(e){ window.__swl&&window.__swl(e); } return r; }; });
try{ renderInspector(); }catch(e){}
})();

;
/* ==================== Script 1093 id="amiyo-pipstudio-p13" ==================== */
/* PiP Studio - Step P13 (plan step 6): one slider drag = one undo step, on every tab.
   Before: Undo / Redo pressed while a slider change was still waiting to be filed undid the step BEFORE it (the PiP itself could vanish)
   and then filed a wrong "PiP opacity" step. Now the open drag is filed first, on release and before every Undo / Redo. */
(function(){"use strict";
var A=window.AMIYO_PIP; if(!A||!A.flush||A.undoSafe) return; A.undoSafe=true;
["undo","redo"].forEach(function(k){ var o=window[k]; if(typeof o!=="function") return;
  window[k]=function(){ try{ A.flush(); }catch(e){ window.__swl&&window.__swl(e); } return o.apply(this,arguments); }; });
})();

;
/* ==================== Script 1094 id="amiyo-pipstudio-p14" ==================== */
/* PiP Studio - Step P14 (plan step 3, hardening): the two low-level helpers that every shape / size control ends in (setShape, setSize) now refuse a PiP on a locked track too.
   The panel already switched these controls off; this closes the same door for any other caller (wizard, presets, scripts), so nothing can slip through. */
(function(){"use strict";
var A=window.AMIYO_PIP; if(!A||!A.locks2||A.locks3) return; A.locks3=true;
["setShape","setSize"].forEach(function(k){ var o=A[k]; if(typeof o!=="function") return;
  A[k]=function(c){ var f=c&&c.id&&A.find(c.id); if(f&&f.track&&f.track.locked){ try{ toast("This PiP's track is locked",3000); }catch(e){} return false; } return o.apply(this,arguments); }; });
})();

;
/* ==================== Script 1095 id="amiyo-pipstudio-p15" ==================== */
/* PiP Studio - Step P15 (plan step 4, finishing): typing a Timing value that snaps back to what is already there (for example "-3" in "Appears at" when it is already 0)
   used to leave an empty "PiP start time" / "PiP length" step in the undo list, so one Undo seemed to do nothing. Those do-nothing steps are no longer filed. */
(function(){"use strict";
var A=window.AMIYO_PIP; if(!A||!A.timing3||A.timing4) return; A.timing4=true;
var LABELS={"PiP start time":1,"PiP length":1,"PiP start inside video":1,"PiP speed":1,"PiP start at playhead":1,"PiP end at playhead":1,"PiP match main clip":1};
var rh=window.recordHistory;
window.recordHistory=function(label,before,after){
  try{ if(LABELS[label]&&before&&after&&before.tracks&&after.tracks&&JSON.stringify(before.tracks)===JSON.stringify(after.tracks)) return; }catch(e){ window.__swl&&window.__swl(e); }
  return rh.apply(this,arguments);
};
})();

;
/* ==================== Script 1096 id="amiyo-pipstudio-p16" ==================== */
/* PiP Studio - Step P16 (plan step 7): attaching a PiP (wizard or drop on the preview) to a main video whose track is hidden now says so,
   because the main video would not show in the preview or export. (Very short main clips: a PiP is never made longer than its main clip - fixed in the two creators.) */
(function(){"use strict";
var A=window.AMIYO_PIP; if(!A||A.attachNote) return; A.attachNote=true;
var rh=window.recordHistory;
window.recordHistory=function(label,before,after){
  var r=rh.apply(this,arguments);
  try{ if(label==="Add picture-in-picture"&&before&&before.tracks){
    var old={}; before.tracks.forEach(function(t){ t.clips.forEach(function(c){ old[c.id]=1; }); });
    var hid=null; project.tracks.forEach(function(t){ t.clips.forEach(function(c){ if(!old[c.id]&&c.pip&&c.pip.main){ var m=A.find(c.pip.main); if(m&&m.track.hidden) hid=m; } }); });
    if(hid) setTimeout(function(){ try{ toast("The main video's track is hidden - show it to see this PiP in the preview",4200); }catch(e){} },1000);
  } }catch(e){ window.__swl&&window.__swl(e); }
  return r;
};
})();

;
/* ==================== Script 1097 id="amiyo-pipstudio-p17" ==================== */
/* PiP Studio - Step P17 (plan step 8): export draws PiPs exactly like the preview (both encode the same canvas - checked with real frames: position, shape and size match).
   The one difference is speed: the fast encoder gives up when video clips sit on more than six tracks, and every PiP that overlaps another needs its own track.
   Before, that fallback to the slow real-time export was silent. Now a project with PiPs says why export is taking its time, and that the picture is the same. */
(function(){"use strict";
var A=window.AMIYO_PIP; if(!A||A.exportNote||typeof window.amiyoFastExport!=="function") return; A.exportNote=true;
var fe=window.amiyoFastExport;
window.amiyoFastExport=async function(){
  var r=await fe.apply(this,arguments);
  try{ if(!r){ var why=window.__amiyoFastWhy, hasPip=project.tracks.some(function(t){ return t.clips.some(function(c){ return c.pip&&c.pip.main; }); });
    if(hasPip&&why&&why!=="switched off") setTimeout(function(){ try{ toast("Exporting at normal speed ("+why+"). The picture is the same as the preview, it just takes as long as the video.",6500); }catch(e){} },300); } }catch(e){ window.__swl&&window.__swl(e); }
  return r;
};
})();

;
/* ==================== Script 1098 id="amiyo-pipstudio-p18" ==================== */
/* PiP Studio - Step P18 (plan step 9): the Help window and the quick tour now cover PiP Studio.
   Help gets a "Picture-in-picture (PiP Studio)" section (how to add, the six tabs, Timing rules, locked / hidden tracks, the PiP list, undo, export).
   The quick tour gets two steps: the PiP Studio panel (only when a video with PiPs or a video clip is selected) and the PiP+ menu on the timeline toolbar. */
(function(){"use strict";
var A=window.AMIYO_PIP; if(!A||A.helpDone) return; A.helpDone=true;
var HELP='<hr><h4 style="margin:10px 0 6px">Picture-in-picture (PiP Studio)</h4>'+
 '<p><b>Add a PiP:</b> select the main video, then use the PiP Studio box in the Inspector, or open the Picture-in-picture wizard, or drag a video from the Media panel onto the preview.</p>'+
 '<p><b>Six tabs</b> (select a PiP to see them): Shape (24 shapes, size, corner radius), Place (position, rotate, snap guides), Style (border, shadow, fades), Motion (entrance / exit animations, move paths), Timing, Arrange (layouts, align, layer order, presets). The tab you used last is remembered.</p>'+
 '<p><b>Timing:</b> "Appears at" is counted from the start of the main clip. A number that cannot be used (blank, negative, too long, past the end of the main clip or of the PiP\'s own video, or overlapping another clip) snaps back to a real value and a message says why. The boxes always show the true values.</p>'+
 '<p><b>The PiP list</b> under the main clip shows when each PiP plays and its sound, for example "0.0s - 4.0s \\u00b7 \\ud83d\\udd0a 100%" or "2.0s - 5.0s \\u00b7 \\ud83d\\udd07 muted". A warning shows if a PiP runs outside its main clip; "Trim PiPs to fit" fixes that in one step.</p>'+
 '<p><b>Locked and hidden tracks:</b> a PiP on a locked track cannot be changed (group actions skip it and say how many were left alone). A PiP on a hidden track is not shown or heard, and a note tells you.</p>'+
 '<p><b>Undo:</b> one slider drag is one Undo step on every tab. Moving or cutting the main clip keeps its PiPs attached.</p>'+
 '<p><b>Export:</b> the exported picture matches the preview. If many PiPs overlap, export may run at normal speed instead of fast, and a message says why.</p>';
var om=window.openModal;
if(typeof om==="function"&&!om.__pipHelp){
  var w=function(title,html){ if(title==="Amiyo Studio Help"&&typeof html==="string"&&html.indexOf("Picture-in-picture (PiP Studio)")<0) html+=HELP; return om.call(this,title,html); };
  w.__pipHelp=true; window.openModal=w;
}
A.helpHtml=HELP;
})();

;
/* ==================== Script 1099 id="amiyo-pipstudio-p19" ==================== */
/* PiP Studio - Step P19 (found while testing plan step 6): Undo / Redo left a STALE panel on screen.
   The editor skips rebuilding the Inspector when the clip "looks the same" as when it was last built. After dragging a slider and pressing Undo, the clip is back to
   the old look, so the panel was kept: its sliders still showed the dragged values, and every later drag edited a clip that was no longer in the project (a step was filed, nothing changed).
   Now the Inspector is rebuilt whenever the project object has been replaced (Undo, Redo, History jump, Open), so the sliders always match the real PiP. */
(function(){"use strict";
if(window.__pipP19) return; window.__pipP19=true;
var last=null, prev=window.renderInspector; if(typeof prev!=="function") return;
window.renderInspector=function(){
  try{ if(typeof project!=="undefined"){ if(last!==null&&project!==last&&window.amiyoInvalidateInspector) window.amiyoInvalidateInspector(); last=project; } }catch(e){ window.__swl&&window.__swl(e); }
  return prev.apply(this,arguments);
};
try{ renderInspector(); }catch(e){}
})();
