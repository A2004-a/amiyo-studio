/* Amiyo Studio - 02-ux3-system.js */
/* UX3 system and build steps */
/* Scripts 39 to 67 */


;
/* ==================== Script 39 id="ux3-s01-js" ==================== */
(function(){try{
document.documentElement.classList.add('ux3');
}catch(e){try{console.warn("ux3-s01",e)}catch(_){}}})();

;
/* ==================== Script 40 id="ux3-build-01" ==================== */
try{window.AMIYO_UX3_STEP=1;window.AMIYO_EDITOR_BUILD="ux3-s01";}catch(e){}

;
/* ==================== Script 41 id="ux3-build-02" ==================== */
try{window.AMIYO_UX3_STEP=2;window.AMIYO_EDITOR_BUILD="ux3-s02";}catch(e){}

;
/* ==================== Script 42 id="ux3-build-03" ==================== */
try{window.AMIYO_UX3_STEP=3;window.AMIYO_EDITOR_BUILD="ux3-s03";}catch(e){}

;
/* ==================== Script 43 id="ux3-build-04" ==================== */
try{window.AMIYO_UX3_STEP=4;window.AMIYO_EDITOR_BUILD="ux3-s04";}catch(e){}

;
/* ==================== Script 44 id="ux3-build-05" ==================== */
try{window.AMIYO_UX3_STEP=5;window.AMIYO_EDITOR_BUILD="ux3-s05";}catch(e){}

;
/* ==================== Script 45 id="ux3-build-06" ==================== */
try{window.AMIYO_UX3_STEP=6;window.AMIYO_EDITOR_BUILD="ux3-s06";}catch(e){}

;
/* ==================== Script 46 id="ux3-build-07" ==================== */
try{window.AMIYO_UX3_STEP=7;window.AMIYO_EDITOR_BUILD="ux3-s07";}catch(e){}

;
/* ==================== Script 47 id="ux3-build-08" ==================== */
try{window.AMIYO_UX3_STEP=8;window.AMIYO_EDITOR_BUILD="ux3-s08";}catch(e){}

;
/* ==================== Script 48 id="ux3-s09-js" ==================== */
(function(){try{

var names={amSndBtn:'Sound tools',smartBtn:'Smart tools',alb:'Audio Lab'};
function tag(){Object.keys(names).forEach(function(id){var e=document.getElementById(id);if(e&&!e.getAttribute('title')){e.setAttribute('title',names[id]);if(!e.getAttribute('aria-label'))e.setAttribute('aria-label',names[id]);}});}
tag(); setTimeout(tag,3000); setTimeout(tag,9000);

}catch(e){try{console.warn("ux3-s09",e)}catch(_){}}})();

;
/* ==================== Script 49 id="ux3-build-09" ==================== */
try{window.AMIYO_UX3_STEP=9;window.AMIYO_EDITOR_BUILD="ux3-s09";}catch(e){}

;
/* ==================== Script 50 id="ux3-s10-js" ==================== */
(function(){try{

var n=document.getElementById('dvPages'); if(!n) return;
function show(){var a=n.querySelector('.on,[aria-selected="true"],[aria-current]'); if(a&&a.scrollIntoView) try{a.scrollIntoView({inline:'center',block:'nearest'})}catch(e){}}
n.addEventListener('click',function(){setTimeout(show,60)}); setTimeout(show,2500);

}catch(e){try{console.warn("ux3-s10",e)}catch(_){}}})();

;
/* ==================== Script 51 id="ux3-build-10" ==================== */
try{window.AMIYO_UX3_STEP=10;window.AMIYO_EDITOR_BUILD="ux3-s10";}catch(e){}

;
/* ==================== Script 52 id="ux3-build-11" ==================== */
try{window.AMIYO_UX3_STEP=11;window.AMIYO_EDITOR_BUILD="ux3-s11";}catch(e){}

;
/* ==================== Script 53 id="ux3-s12-js" ==================== */
(function(){try{

if(!matchMedia('(max-width:760px)').matches) return;
var t=document.querySelector('.preview-toolbar'); if(t) t.scrollLeft=0;

}catch(e){try{console.warn("ux3-s12",e)}catch(_){}}})();

;
/* ==================== Script 54 id="ux3-build-12" ==================== */
try{window.AMIYO_UX3_STEP=12;window.AMIYO_EDITOR_BUILD="ux3-s12";}catch(e){}

;
/* ==================== Script 55 id="ux3-build-13" ==================== */
try{window.AMIYO_UX3_STEP=13;window.AMIYO_EDITOR_BUILD="ux3-s13";}catch(e){}

;
/* ==================== Script 56 id="ux3-build-14" ==================== */
try{window.AMIYO_UX3_STEP=14;window.AMIYO_EDITOR_BUILD="ux3-s14";}catch(e){}

;
/* ==================== Script 57 id="ux3-build-15" ==================== */
try{window.AMIYO_UX3_STEP=15;window.AMIYO_EDITOR_BUILD="ux3-s15";}catch(e){}

;
/* ==================== Script 58 id="ux3-s16-js" ==================== */
(function(){try{

document.addEventListener('keydown',function(e){
 if(e.key!=='Escape'||e.defaultPrevented) return;
 var t=e.target; if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
 var m=document.getElementById('ddTrackMenu'); if(m&&m.classList.contains('open')) m.classList.remove('open');
},false);

}catch(e){try{console.warn("ux3-s16",e)}catch(_){}}})();

;
/* ==================== Script 59 id="ux3-build-16" ==================== */
try{window.AMIYO_UX3_STEP=16;window.AMIYO_EDITOR_BUILD="ux3-s16";}catch(e){}

;
/* ==================== Script 60 id="ux3-build-17" ==================== */
try{window.AMIYO_UX3_STEP=17;window.AMIYO_EDITOR_BUILD="ux3-s17";}catch(e){}

;
/* ==================== Script 61 id="ux3-s18-js" ==================== */
(function(){try{
function go(){

var rows=[['Split at playhead','S'],['Delete clip','Del'],['Ripple delete','Shift + Del'],['Duplicate','Ctrl + D'],['Undo','Ctrl + Z'],['Redo','Ctrl + Shift + Z'],['Search tools','/'],['Close menus and this sheet','Esc'],['Show this sheet','?']];
var el=document.createElement('div'); el.id='ux3Keys'; el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true'); el.setAttribute('aria-label','Keyboard shortcuts');
el.innerHTML='<div class="box"><h2>Keyboard shortcuts<button type="button" aria-label="Close">\u2715</button></h2>'+rows.map(function(r){return '<div class="r"><span>'+r[0]+'</span><span>'+r[1].split(' + ').map(function(k){return '<kbd>'+k+'</kbd>'}).join(' + ')+'</span></div>'}).join('')+'<p>On Mac use Cmd instead of Ctrl.</p></div>';
document.body.appendChild(el);
var last=null;
function open(){last=document.activeElement;el.classList.add('open');el.querySelector('button').focus();}
function close(){el.classList.remove('open');if(last&&last.focus)try{last.focus()}catch(e){}}
el.addEventListener('click',function(e){if(e.target===el||e.target.closest('h2 button'))close();});
window.addEventListener('keyup',function(e){
 if(e.key==='Escape'&&el.classList.contains('open')){close();return;}
 if(e.key!=='?'||e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey) return;
 var t=e.target; if(t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable)) return;
 el.classList.contains('open')?close():open();
},true);
window.ux3ShowKeys=open;

}
if(document.body) go(); else document.addEventListener("DOMContentLoaded",go);
}catch(e){try{console.warn("ux3-s18",e)}catch(_){}}})();

;
/* ==================== Script 62 id="ux3-build-18" ==================== */
try{window.AMIYO_UX3_STEP=18;window.AMIYO_EDITOR_BUILD="ux3-s18";}catch(e){}

;
/* ==================== Script 63 id="ux3-build-19" ==================== */
try{window.AMIYO_UX3_STEP=19;window.AMIYO_EDITOR_BUILD="ux3-s19";}catch(e){}

;
/* ==================== Script 64 id="ux3-s20-js" ==================== */
(function(){try{

function vis(e){var r=e.getBoundingClientRect();if(r.width<2||r.height<2)return false;var s=getComputedStyle(e);return s.visibility!=='hidden'&&s.display!=='none'&&s.opacity!=='0'}
function check(){
 var touch=matchMedia('(pointer:coarse)').matches, min=touch?40:24, small=[],noname=0,btns=document.querySelectorAll('button,[role=button]'),n=0;
 btns.forEach(function(b){if(!vis(b))return;n++;var r=b.getBoundingClientRect();if(r.height<min||r.width<min)small.push((b.id||b.textContent||'?').trim().slice(0,18));
  if(!(b.textContent||'').trim()&&!b.getAttribute('aria-label')&&!b.getAttribute('title')&&!b.querySelector('img[alt]'))noname++;});
 var de=document.documentElement, over=de.scrollWidth>de.clientWidth+2;
 var res={buttonsChecked:n,smallTargets:small.length,unnamedButtons:noname,pageSidewaysScroll:over,sample:small.slice(0,6)};
 try{console.table&&console.log('UX3 check',res)}catch(e){}
 return res;
}
window.ux3Check=check;
function wire(){
 var box=document.querySelector('#ux3Keys .box'); if(!box){setTimeout(wire,500);return;}
 if(box.querySelector('.chk')) return;
 var d=document.createElement('div'); d.className='chk'; d.innerHTML='<button type="button">Run UI check</button><output aria-live="polite"></output>';
 box.appendChild(d); var o=d.querySelector('output');
 d.querySelector('button').addEventListener('click',function(){var r=check();o.textContent=r.buttonsChecked+' buttons: '+r.smallTargets+' small, '+r.unnamedButtons+' unnamed'+(r.pageSidewaysScroll?', page scrolls sideways':', no sideways scroll');});
}
if(document.body) wire(); else document.addEventListener('DOMContentLoaded',wire);
window.AMIYO_UX3_DONE=true;

}catch(e){try{console.warn("ux3-s20",e)}catch(_){}}})();

;
/* ==================== Script 65 id="ux3-build-20" ==================== */
try{window.AMIYO_UX3_STEP=20;window.AMIYO_EDITOR_BUILD="ux3-s20";}catch(e){}

;
/* ==================== Script 66 id="ux3-s21-js" ==================== */
(function(){try{
function fix(){
 var b=document.getElementById('ddAddTrackBtn'),r=document.getElementById('ruler'); if(!b||!r) return;
 var p=b.offsetParent; if(!p) return; var t=Math.round(r.getBoundingClientRect().top-p.getBoundingClientRect().top+3);
 if(b.style.top!==t+'px') b.style.setProperty('top',t+'px','important');
}
fix(); setInterval(fix,1200); addEventListener('resize',fix);
}catch(e){}})();

;
/* ==================== Script 67 id="ux3-build-21" ==================== */
try{window.AMIYO_UX3_STEP=21;window.AMIYO_EDITOR_BUILD="ux3-s21";}catch(e){}
