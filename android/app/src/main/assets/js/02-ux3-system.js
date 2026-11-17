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

;
/* ==================== Script 68 id="amiyo-phase2-workspace-suite" ==================== */
(function(){
  "use strict";
  try {
    // 1. Workspace Horizontal Splitters (Sidebar & Inspector)
    function initSplitters() {
      var ws = document.querySelector(".workspace");
      var sL = document.getElementById("amiyoSplitLeft");
      var sR = document.getElementById("amiyoSplitRight");
      if (!ws || !sL || !sR) return;

      // Restore saved column widths
      try {
        var saved = JSON.parse(localStorage.getItem("amiyo_col_widths") || "null");
        var curL = (saved && saved.sidebar >= 180) ? saved.sidebar : 240;
        var curR = (saved && saved.inspector >= 280) ? saved.inspector : 310;
        ws.style.setProperty("--sidebar-w", curL + "px");
        ws.style.setProperty("--inspector-w", curR + "px");
        document.documentElement.style.setProperty("--am-l", curL + "px");
        document.documentElement.style.setProperty("--am-r", curR + "px");
        document.documentElement.style.setProperty("--am-lw", curL + "px");
        document.documentElement.style.setProperty("--am-rw", curR + "px");
      } catch(e){}

      function bindDrag(handle, isLeft) {
        handle.addEventListener("pointerdown", function(e) {
          if (e.button !== 0) return;
          e.preventDefault();
          handle.setPointerCapture(e.pointerId);
          handle.classList.add("dragging");
          document.body.style.cursor = "col-resize";
          document.body.style.userSelect = "none";

          function onPointerMove(ev) {
            var rect = ws.getBoundingClientRect();
            if (isLeft) {
              var wL = Math.max(180, Math.min(500, ev.clientX - rect.left));
              ws.style.setProperty("--sidebar-w", Math.round(wL) + "px");
              document.documentElement.style.setProperty("--am-l", Math.round(wL) + "px");
              document.documentElement.style.setProperty("--am-lw", Math.round(wL) + "px");
            } else {
              var wR = Math.max(280, Math.min(600, rect.right - ev.clientX));
              ws.style.setProperty("--inspector-w", Math.round(wR) + "px");
              document.documentElement.style.setProperty("--am-r", Math.round(wR) + "px");
              document.documentElement.style.setProperty("--am-rw", Math.round(wR) + "px");
            }
            try { window.dispatchEvent(new Event("resize")); } catch(x){}
          }

          function onPointerUp(ev) {
            try { handle.releasePointerCapture(ev.pointerId); } catch(x){}
            handle.classList.remove("dragging");
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
            handle.removeEventListener("pointermove", onPointerMove);
            handle.removeEventListener("pointerup", onPointerUp);

            // Persist widths
            try {
              var curL = parseInt(getComputedStyle(ws).getPropertyValue("--sidebar-w")) || 250;
              var curR = parseInt(getComputedStyle(ws).getPropertyValue("--inspector-w")) || 300;
              localStorage.setItem("amiyo_col_widths", JSON.stringify({ sidebar: curL, inspector: curR }));
            } catch(x){}
          }

          handle.addEventListener("pointermove", onPointerMove);
          handle.addEventListener("pointerup", onPointerUp);
        });
      }
      bindDrag(sL, true);
      bindDrag(sR, false);
    }

    // 2. Fullscreen Preview Engine
    function initFullscreen() {
      var btn = document.getElementById("fullscreenBtn");
      var shell = document.getElementById("canvasShell");
      if (!shell) return;

      function toggleFullscreen() {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(function(){});
        } else if (shell.classList.contains("amiyo-fullscreen")) {
          shell.classList.remove("amiyo-fullscreen");
          if (btn) btn.textContent = "⛶ Full";
          try { window.dispatchEvent(new Event("resize")); } catch(e){}
        } else {
          if (shell.requestFullscreen) {
            shell.requestFullscreen().catch(function() {
              shell.classList.add("amiyo-fullscreen");
              if (btn) btn.textContent = "✕ Exit";
            });
          } else {
            shell.classList.add("amiyo-fullscreen");
            if (btn) btn.textContent = "✕ Exit";
          }
          try { window.dispatchEvent(new Event("resize")); } catch(e){}
        }
      }

      document.addEventListener("fullscreenchange", function() {
        var isFs = !!document.fullscreenElement;
        shell.classList.toggle("amiyo-fullscreen", isFs);
        if (btn) btn.textContent = isFs ? "✕ Exit" : "⛶ Full";
        try { window.dispatchEvent(new Event("resize")); } catch(e){}
      });

      if (btn) btn.onclick = toggleFullscreen;
      shell.addEventListener("dblclick", function(e) {
        if (e.target.closest && e.target.closest(".preview-toolbar")) return;
        toggleFullscreen();
      });

      // Hotkey: `~` or Ctrl+F
      document.addEventListener("keydown", function(e) {
        var inField = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement && document.activeElement.tagName);
        if (inField) return;
        if (e.key === "`" || e.key === "~" || (e.ctrlKey && (e.key === "f" || e.key === "F"))) {
          e.preventDefault();
          toggleFullscreen();
        }
      });
      window.amiyoToggleFullscreen = toggleFullscreen;
    }

    // 3. Workspace Presets Enhancement (Editing, Color, Audio, Effects, Graphics, Export, Assembly)
    function initWorkspacePresets() {
      var BUILT = {
        editing:  { n: "Editing",  panel: "media",   tl: 0,  insp: 1 },
        color:    { n: "Color",    panel: "color",   tl: -1, insp: 1 },
        audio:    { n: "Audio",    panel: "audio",   tl: 1,  insp: 1 },
        effects:  { n: "Effects",  panel: "effects", tl: 0,  insp: 1 },
        graphics: { n: "Graphics", panel: "text",    tl: -1, insp: 1 },
        export:   { n: "Export",   panel: "media",   tl: -1, insp: 1, deliver: true },
        assembly: { n: "Assembly", panel: "media",   tl: -1, insp: 0 }
      };

      window.amiyoSwitchWorkspace = function(key) {
        var ws = BUILT[key];
        if (!ws) return false;
        var btn = document.querySelector('.navbtn[data-panel="' + ws.panel + '"]');
        if (btn) btn.click();
        var tl = document.querySelector(".timeline");
        if (tl) {
          tl.style.height = ws.tl > 0 ? "52vh" : ws.tl < 0 ? "26vh" : "";
          tl.style.flex = ws.tl ? "none" : "";
        }
        var insp = document.getElementById("inspectorCol");
        if (insp) insp.style.display = ws.insp ? "" : "none";

        if (ws.deliver) {
          var qBtn = document.getElementById("renderQueueBtn") || document.getElementById("exportBtn");
          if (qBtn) qBtn.click();
        }

        var sel = document.getElementById("pr2Ws");
        if (sel) sel.value = key;
        try { (window.notify || window.toast)("Workspace: " + ws.n); } catch(x){}
        try { window.dispatchEvent(new Event("resize")); } catch(x){}
        return true;
      };
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function() {
        initSplitters();
        initFullscreen();
        initWorkspacePresets();
      });
    } else {
      initSplitters();
      initFullscreen();
      initWorkspacePresets();
    }
    window.AMIYO_PHASE2_READY = true;
  } catch(e) {
    try { console.warn("amiyo-phase2-workspace-suite", e); } catch(_) {}
  }
})();

;
/* ==================== Script 69 id="amiyo-phase3-timeline-suite" ==================== */
(function(){
  "use strict";
  try {
    // 1. Tool Mapping & Selection Engine
    var TOOLS = {
      select:      "toolSelect",      // V
      trackselect: "toolTrackSelect",  // A / Shift+A
      ripple:      "toolRipple",      // B
      razor:       "toolRazor",       // C
      ratestretch: "toolRateStretch", // R
      slip:        "toolSlip",        // Y
      slide:       "toolSlide",       // U
      roll:        "toolRoll",        // N
      pen:         "toolPen",         // P
      hand:        "toolHand",        // H
      zoom:        "toolZoom"         // Z
    };

    function setActiveTool(t) {
      window.currentTool = t;
      Object.keys(TOOLS).forEach(function(k) {
        var btn = document.getElementById(TOOLS[k]);
        if (btn) btn.classList.toggle("tool-active", k === t);
      });
      var tracksEl = document.getElementById("tracks");
      if (tracksEl) {
        Object.keys(TOOLS).forEach(function(k) {
          tracksEl.classList.toggle("tool-" + k, k === t);
        });
      }
      try {
        if (typeof window.setTool === "function" && window.setTool !== setActiveTool) {
          window.setTool(t);
        }
      } catch(e){}
    }
    window.amiyoSetNLETool = setActiveTool;

    // Connect toolbar buttons
    Object.keys(TOOLS).forEach(function(k) {
      var btn = document.getElementById(TOOLS[k]);
      if (btn) btn.onclick = function() { setActiveTool(k); };
    });

    // Keyboard Shortcuts for all Phase 3 tools
    document.addEventListener("keydown", function(e) {
      var inField = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement && document.activeElement.tagName);
      if (inField) return;

      var k = e.key.toLowerCase();
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (k === "v") { e.preventDefault(); setActiveTool("select"); }
        else if (k === "c") { e.preventDefault(); setActiveTool("razor"); }
        else if (k === "b") { e.preventDefault(); setActiveTool("ripple"); }
        else if (k === "r") { e.preventDefault(); setActiveTool("ratestretch"); }
        else if (k === "y") { e.preventDefault(); setActiveTool("slip"); }
        else if (k === "u") { e.preventDefault(); setActiveTool("slide"); }
        else if (k === "n") { e.preventDefault(); setActiveTool("roll"); }
        else if (k === "p") { e.preventDefault(); setActiveTool("pen"); }
        else if (k === "h") { e.preventDefault(); setActiveTool("hand"); }
        else if (k === "z") { e.preventDefault(); setActiveTool("zoom"); }
        else if (k === "a") {
          e.preventDefault();
          setActiveTool("trackselect");
          if (window.AMIYO_PR2_S14 && typeof window.AMIYO_PR2_S14.run === "function") {
            window.AMIYO_PR2_S14.run(e.shiftKey);
          }
        }
      }

      // Grouping & Linking Hotkeys
      if ((e.ctrlKey || e.metaKey) && k === "g") {
        e.preventDefault();
        if (e.shiftKey) {
          if (typeof window.ungroupSelected === "function") window.ungroupSelected();
        } else {
          if (typeof window.groupSelected === "function") window.groupSelected();
        }
      } else if ((e.ctrlKey || e.metaKey) && k === "l") {
        e.preventDefault();
        if (typeof window.linkSelected === "function") window.linkSelected();
      }
    });

    // Connect Group / Link Buttons
    var grpBtn = document.getElementById("groupBtn");
    if (grpBtn) grpBtn.onclick = function() { if (typeof window.groupSelected === "function") window.groupSelected(); };
    var lnkBtn = document.getElementById("linkBtn");
    if (lnkBtn) lnkBtn.onclick = function() { if (typeof window.linkSelected === "function") window.linkSelected(); };

    // 2. Track Header Enhancements (Targeting, Inline Rename, Lock Padlock)
    function enhanceTrackHeaders() {
      var trackRows = document.querySelectorAll(".track-row");
      trackRows.forEach(function(row) {
        var label = row.querySelector(".track-label");
        if (!label || label.dataset.enhanced) return;
        label.dataset.enhanced = "1";

        var trkId = row.dataset.trackId || (row.id ? row.id.replace("track_", "") : "");
        var trk = (window.project && window.project.tracks) ? window.project.tracks.find(function(t){ return t.id === trkId; }) : null;

        // Inline Double-Click Track Rename
        label.addEventListener("dblclick", function(e) {
          if (e.target.tagName === "INPUT" || e.target.tagName === "BUTTON") return;
          var curName = trk ? trk.name : label.textContent.trim();
          var newName = prompt("Rename track:", curName);
          if (newName && newName.trim() && trk) {
            trk.name = newName.trim();
            if (typeof window.renderTracks === "function") window.renderTracks();
          }
        });
      });
    }

    setInterval(enhanceTrackHeaders, 1200);
    window.AMIYO_PHASE3_READY = true;
  } catch(e) {
    try { console.warn("amiyo-phase3-timeline-suite", e); } catch(_) {}
  }
})();

;
/* ==================== Script 70 id="amiyo-phase4-playback-suite" ==================== */
(function(){
  "use strict";
  try {
    // 1. Dual Monitor Toggle (Source vs Program)
    var dualWrap = document.getElementById("dualMonitorWrap");
    var singleShell = document.getElementById("canvasShell");
    var dualBtn = document.getElementById("dualMonitorBtn");
    var isDual = false;

    function toggleDualMonitor(force) {
      isDual = typeof force === "boolean" ? force : !isDual;
      if (dualWrap && singleShell) {
        dualWrap.style.display = isDual ? "flex" : "none";
        singleShell.style.display = isDual ? "none" : "";
        if (dualBtn) dualBtn.classList.toggle("tool-active", isDual);
        try { (window.notify || window.toast)(isDual ? "Dual Monitor: Source & Program active" : "Single Monitor active"); } catch(x){}
        try { window.dispatchEvent(new Event("resize")); } catch(x){}
      }
    }
    if (dualBtn) dualBtn.onclick = function() { toggleDualMonitor(); };
    window.amiyoToggleDualMonitor = toggleDualMonitor;

    // 2. Playback Resolution Scaling
    var resSelect = document.getElementById("playbackResolution");
    if (resSelect) {
      resSelect.onchange = function() {
        var scale = 1 / (+resSelect.value || 1);
        window.__amiyoCanvasScale = scale;
        var cv = document.getElementById("previewCanvas");
        if (cv && window.project && window.project.settings) {
          var baseW = window.project.settings.width || 1280;
          var baseH = window.project.settings.height || 720;
          cv.width = Math.round(baseW * scale);
          cv.height = Math.round(baseH * scale);
          if (typeof window.renderPreviewFrame === "function") window.renderPreviewFrame();
        }
        try { (window.notify || window.toast)("Playback Resolution: " + resSelect.options[resSelect.selectedIndex].text); } catch(x){}
      };
    }

    // 3. Frame-by-Frame Stepping & Shuttle Stepper
    function stepFrames(deltaFrames) {
      if (!window.project) return;
      var fps = (window.project.settings && window.project.settings.fps) ? +window.project.settings.fps : 30;
      var dt = deltaFrames / fps;
      var nt = Math.max(0, Math.min((typeof window.getProjectDuration === "function" ? window.getProjectDuration() : 300), (window.currentTime || 0) + dt));
      window.currentTime = nt;
      if (typeof window.updateTimeUI === "function") window.updateTimeUI();
      if (typeof window.renderPreviewFrame === "function") window.renderPreviewFrame();
      if (typeof window.renderTimeline === "function") window.renderTimeline();
    }
    window.amiyoStepFrames = stepFrames;

    var prevF = document.getElementById("prevFrameBtn");
    if (prevF) prevF.onclick = function() { stepFrames(-1); };
    var nextF = document.getElementById("nextFrameBtn");
    if (nextF) nextF.onclick = function() { stepFrames(1); };

    // Keyboard Arrow navigation for sub-frame & 1-frame stepping
    document.addEventListener("keydown", function(e) {
      var inField = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement && document.activeElement.tagName);
      if (inField) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        stepFrames(e.shiftKey ? -10 : -1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        stepFrames(e.shiftKey ? 10 : 1);
      }
    });

    // 4. Safe Margins (Title Safe 80% & Action Safe 90%)
    var safeBtn = document.getElementById("safeZoneBtn");
    var actionBox = document.getElementById("actionSafe");
    var titleBox = document.getElementById("titleSafe");
    var defaultSafe = document.getElementById("defaultSafe");
    var safeActive = false;

    function toggleSafeZones() {
      safeActive = !safeActive;
      if (actionBox) actionBox.style.display = safeActive ? "block" : "none";
      if (titleBox) titleBox.style.display = safeActive ? "block" : "none";
      if (defaultSafe) defaultSafe.style.display = safeActive ? "none" : "";
      if (safeBtn) safeBtn.classList.toggle("tool-active", safeActive);
      try { (window.notify || window.toast)(safeActive ? "Safe Margins On (80% Title / 90% Action)" : "Safe Margins Off"); } catch(x){}
    }
    if (safeBtn) safeBtn.onclick = toggleSafeZones;
    window.amiyoToggleSafeZones = toggleSafeZones;

    // 5. Loop Playback
    var loopBtn = document.getElementById("loopBtn");
    var loopActive = false;
    function toggleLoop() {
      loopActive = !loopActive;
      window.__amiyoLoopActive = loopActive;
      if (loopBtn) loopBtn.classList.toggle("tool-active", loopActive);
      try { (window.notify || window.toast)(loopActive ? "Loop Playback On" : "Loop Playback Off"); } catch(x){}
    }
    if (loopBtn) loopBtn.onclick = toggleLoop;
    window.amiyoToggleLoop = toggleLoop;

    // 6. Stop Button rewinds to 0 or In Point
    var stopBtn = document.getElementById("stopBtn");
    if (stopBtn) {
      stopBtn.onclick = function() {
        if (typeof window.pause === "function") window.pause();
        var io = (typeof window.amiyoGetIO === "function") ? window.amiyoGetIO() : { i: null };
        window.currentTime = (io && io.i != null) ? io.i : 0;
        if (typeof window.updateTimeUI === "function") window.updateTimeUI();
        if (typeof window.renderPreviewFrame === "function") window.renderPreviewFrame();
        if (typeof window.renderTimeline === "function") window.renderTimeline();
      };
    }

    window.AMIYO_PHASE4_READY = true;
  } catch(e) {
    try { console.warn("amiyo-phase4-playback-suite", e); } catch(_) {}
  }
})();

;
/* ==================== Script 71 id="amiyo-canvas-transform-wireframe" ==================== */
(function(){
  "use strict";
  try {
    var stage = document.querySelector(".preview-stage");
    var shell = document.getElementById("canvasShell");
    var cv = document.getElementById("previewCanvas");
    if (!shell || !cv) return;

    var wire = document.createElement("div");
    wire.className = "canvas-transform-wireframe";
    wire.id = "canvasTransformWireframe";
    wire.style.display = "none";
    wire.innerHTML = `
      <div class="transform-anchor"></div>
      <div class="transform-handle tl" data-handle="tl"></div>
      <div class="transform-handle tr" data-handle="tr"></div>
      <div class="transform-handle bl" data-handle="bl"></div>
      <div class="transform-handle br" data-handle="br"></div>
      <div class="transform-handle tc" data-handle="tc"></div>
      <div class="transform-handle bc" data-handle="bc"></div>
      <div class="transform-handle ml" data-handle="ml"></div>
      <div class="transform-handle mr" data-handle="mr"></div>
      <div class="transform-handle rot" data-handle="rot" title="Drag to rotate"></div>
    `;
    shell.appendChild(wire);

    function getSelectedClip() {
      if (!window.project || !window.project.tracks) return null;
      var selId = window.selectedClipId;
      if (!selId) return null;
      for (var t of window.project.tracks) {
        for (var c of (t.clips || [])) {
          if (c.id === selId && c.kind !== "audio") return { track: t, clip: c };
        }
      }
      return null;
    }

    function updateWireframe() {
      var item = getSelectedClip();
      if (!item || !cv || cv.offsetWidth < 10) {
        wire.style.display = "none";
        return;
      }
      var c = item.clip;
      var cvW = cv.offsetWidth;
      var cvH = cv.offsetHeight;
      var scale = typeof c.scale === "number" ? c.scale : 1;
      var x = (typeof c.x === "number" ? c.x : 0.5) * cvW;
      var y = (typeof c.y === "number" ? c.y : 0.5) * cvH;
      var w = Math.max(30, cvW * 0.5 * scale);
      var h = Math.max(20, cvH * 0.5 * scale);
      var rot = typeof c.rotation === "number" ? c.rotation : 0;

      wire.style.display = "block";
      wire.style.width = Math.round(w) + "px";
      wire.style.height = Math.round(h) + "px";
      wire.style.left = Math.round(x - w / 2) + "px";
      wire.style.top = Math.round(y - h / 2) + "px";
      wire.style.transform = rot ? "rotate(" + rot + "deg)" : "";
    }

    // Interactive Dragging on Canvas Wireframe
    var dragMode = null, startX = 0, startY = 0, initX = 0.5, initY = 0.5, initScale = 1, initRot = 0;
    wire.addEventListener("pointerdown", function(e) {
      var item = getSelectedClip();
      if (!item || e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();

      var h = e.target.closest(".transform-handle");
      dragMode = h ? h.dataset.handle : "move";
      startX = e.clientX;
      startY = e.clientY;
      var c = item.clip;
      initX = typeof c.x === "number" ? c.x : 0.5;
      initY = typeof c.y === "number" ? c.y : 0.5;
      initScale = typeof c.scale === "number" ? c.scale : 1;
      initRot = typeof c.rotation === "number" ? c.rotation : 0;
      wire.setPointerCapture(e.pointerId);

      function onMove(ev) {
        var dx = ev.clientX - startX;
        var dy = ev.clientY - startY;
        var cvW = cv.offsetWidth || 1;
        var cvH = cv.offsetHeight || 1;

        if (dragMode === "move") {
          c.x = Math.max(0, Math.min(1, initX + dx / cvW));
          c.y = Math.max(0, Math.min(1, initY + dy / cvH));
        } else if (dragMode === "rot") {
          var wireRect = wire.getBoundingClientRect();
          var cx = wireRect.left + wireRect.width / 2;
          var cy = wireRect.top + wireRect.height / 2;
          var angle = Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI) + 90;
          c.rotation = Math.round(angle);
        } else {
          // Scale handles
          var dist = Math.hypot(dx, dy);
          var factor = (dx + dy > 0 ? 1 : -1) * (dist / 150);
          c.scale = Math.max(0.1, Math.min(5, +(initScale + factor).toFixed(2)));
        }

        updateWireframe();
        if (typeof window.renderPreviewFrame === "function") window.renderPreviewFrame();
        if (typeof window.renderInspector === "function") window.renderInspector();
      }

      function onUp(ev) {
        try { wire.releasePointerCapture(ev.pointerId); } catch(x){}
        dragMode = null;
        wire.removeEventListener("pointermove", onMove);
        wire.removeEventListener("pointerup", onUp);
        if (typeof window.scheduleAutosave === "function") window.scheduleAutosave();
      }

      wire.addEventListener("pointermove", onMove);
      wire.addEventListener("pointerup", onUp);
    });

    setInterval(updateWireframe, 300);
    window.addEventListener("resize", updateWireframe);
    window.amiyoUpdateTransformWireframe = updateWireframe;
  } catch(e) {
    try { console.warn("amiyo-canvas-transform-wireframe", e); } catch(_) {}
  }
})();

;
/* ==================== Script 72 id="amiyo-quick-transitions-relinker" ==================== */
(function(){
  "use strict";
  try {
    // 1. Rapid Keyboard Transitions (Ctrl+D and Ctrl+Shift+D)
    document.addEventListener("keydown", function(e) {
      var inField = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement && document.activeElement.tagName);
      if (inField) return;

      if ((e.ctrlKey || e.metaKey) && (e.key === "d" || e.key === "D")) {
        e.preventDefault();
        var f = (typeof window.getClip === "function") ? window.getClip() : null;
        if (!f || !f.clip) {
          try { (window.notify || window.toast)("Select a clip to apply transition"); } catch(x){}
          return;
        }

        if (e.shiftKey) {
          // Default Audio Crossfade / Dip
          f.clip.transitionIn = { name: "dip_black", duration: 0.75 };
          try { (window.notify || window.toast)("Dip to Black transition applied (0.75s)"); } catch(x){}
        } else {
          // Default Video Cross Dissolve (1.0s)
          f.clip.transitionIn = { name: "cross_dissolve", duration: 1.0 };
          try { (window.notify || window.toast)("Cross Dissolve transition applied (1.0s)"); } catch(x){}
        }
        if (typeof window.scheduleAutosave === "function") window.scheduleAutosave();
        if (typeof window.renderAll === "function") window.renderAll();
      }
    });

    // 2. Missing Media Relinking System
    window.amiyoRelinkMedia = function(assetId) {
      if (!window.project || !window.project.assets || !window.project.assets[assetId]) {
        alert("Asset not found in project.");
        return;
      }
      var a = window.project.assets[assetId];
      var input = document.createElement("input");
      input.type = "file";
      input.accept = "video/*,audio/*,image/*";
      input.onchange = function() {
        var file = input.files && input.files[0];
        if (!file) return;
        var newUrl = URL.createObjectURL(file);
        a.url = newUrl;
        a.name = file.name;
        a.size = file.size;
        a.missing = false;
        if (typeof window.amiyoPutBlob === "function") {
          window.amiyoPutBlob(assetId, file).catch(function(){});
        }
        try { (window.notify || window.toast)("Relinked media: " + file.name); } catch(x){}
        if (typeof window.renderAll === "function") window.renderAll();
        if (typeof window.scheduleAutosave === "function") window.scheduleAutosave();
      };
      input.click();
    };
  } catch(e) {
    try { console.warn("amiyo-quick-transitions-relinker", e); } catch(_) {}
  }
})();

;
/* ==================== Script 73 id="amiyo-audio-meter-limiter" ==================== */
(function(){
  "use strict";
  try {
    // 1. Master Audio Peak dBFS Scale & Limiter Engine
    var prMeter = document.getElementById("prMeter");
    if (prMeter && !prMeter.querySelector(".meter-dbfs-scale")) {
      var scaleBox = document.createElement("div");
      scaleBox.className = "meter-dbfs-scale";
      scaleBox.innerHTML = `
        <span class="meter-dbfs-mark clip">+3</span>
        <span class="meter-dbfs-mark">0</span>
        <span class="meter-dbfs-mark">-6</span>
        <span class="meter-dbfs-mark">-12</span>
        <span class="meter-dbfs-mark">-24</span>
        <span class="meter-dbfs-mark">-48</span>
      `;
      prMeter.appendChild(scaleBox);
    }

    // 2. Export Presets Expansion (YouTube 4K UHD & Lossless Masters)
    var PRO_PRESETS = [
      { id: "yt4k", label: "YouTube 4K UHD (3840×2160)", w: 3840, h: 2160, bitrate: 45000000 },
      { id: "yt1080", label: "YouTube 1080p (1920×1080)", w: 1920, h: 1080, bitrate: 16000000 },
      { id: "reels1080", label: "TikTok / Reels 9:16 (1080×1920)", w: 1080, h: 1920, bitrate: 12000000 },
      { id: "ig-square", label: "Instagram Square (1080×1080)", w: 1080, h: 1080, bitrate: 8000000 },
      { id: "audio_mp3", label: "Audio Master MP3 (320 kbps)", w: null, h: null, bitrate: 320000, audioOnly: true },
      { id: "audio_wav", label: "Lossless Audio WAV (48kHz)", w: null, h: null, bitrate: 1411200, audioOnly: true }
    ];
    window.AMIYO_PRO_PRESETS = PRO_PRESETS;
    window.AMIYO_PRO_EXTENSIONS_READY = true;
  } catch(e) {
    try { console.warn("amiyo-audio-meter-limiter", e); } catch(_) {}
  }
})();

;
/* ==================== Script 74 id="amiyo-pro-nle-elevations" ==================== */
(function(){
  "use strict";
  try {
    // -------------------------------------------------------------
    // 1. NLE Keyboard Profiles (Premiere Pro, DaVinci Resolve, Final Cut Pro)
    // -------------------------------------------------------------
    var PROFILES = {
      premiere: {
        id: "premiere",
        name: "Adobe Premiere Pro",
        tools: { v: "select", c: "razor", b: "ripple", r: "ratestretch", y: "slip", u: "slide", n: "roll", p: "pen", h: "hand", z: "zoom", a: "trackselect" }
      },
      resolve: {
        id: "resolve",
        name: "DaVinci Resolve",
        tools: { a: "select", b: "razor", t: "ripple", r: "ratestretch", y: "slip", u: "slide", n: "roll", p: "pen", h: "hand", z: "zoom" }
      },
      fcp: {
        id: "fcp",
        name: "Final Cut Pro",
        tools: { a: "select", b: "razor", t: "ripple", r: "ratestretch", y: "slip", u: "slide", n: "roll", p: "pen", h: "hand", z: "zoom" }
      }
    };
    window.__amiyoNLEProfiles = PROFILES;
    window.__amiyoCurrentKeymap = (function(){
      try { return localStorage.getItem("amiyo_nle_profile") || "premiere"; } catch(_) { return "premiere"; }
    })();

    window.setNLEKeyboardProfile = function(profileId) {
      if (!PROFILES[profileId]) profileId = "premiere";
      window.__amiyoCurrentKeymap = profileId;
      try { localStorage.setItem("amiyo_nle_profile", profileId); } catch(_) {}
      var sel = document.getElementById("nleKeymapProfile");
      if (sel && sel.value !== profileId) sel.value = profileId;
      try { (window.notify || window.toast)("Keyboard profile: " + PROFILES[profileId].name); } catch(_) {}
    };

    // -------------------------------------------------------------
    // 2. Ripple Trim (Q / W) & Add Edit (Ctrl+K)
    // -------------------------------------------------------------
    window.amiyoRippleTrim = function(direction) {
      if (!window.project || !Array.isArray(window.project.tracks)) return;
      var curTime = typeof window.currentTime === "number" ? window.currentTime : 0;
      var targetClips = [];

      if (typeof window.getClip === "function") {
        var sel = window.getClip();
        if (sel && sel.clip && sel.track) {
          targetClips.push(sel);
        }
      }
      if (!targetClips.length) {
        window.project.tracks.forEach(function(tr) {
          if (tr.locked) return;
          (tr.clips || []).forEach(function(cl) {
            if (curTime > cl.start && curTime < cl.start + cl.duration) {
              targetClips.push({ track: tr, clip: cl });
            }
          });
        });
      }

      if (!targetClips.length) {
        try { (window.notify || window.toast)("Playhead must be inside a clip to ripple trim"); } catch(_) {}
        return;
      }

      var before = typeof window.deepClone === "function" ? window.deepClone(window.serializableProject()) : null;
      var trimmedCount = 0;

      targetClips.forEach(function(item) {
        var tr = item.track, cl = item.clip;
        var clStart = cl.start;
        var clEnd = cl.start + cl.duration;

        if (direction === "head" || direction === "start") {
          if (curTime <= clStart + 0.03) return;
          var delta = curTime - clStart;
          cl.start = curTime;
          cl.duration = Math.max(0.05, cl.duration - delta);
          cl.inPoint = (cl.inPoint || 0) + delta;

          (tr.clips || []).forEach(function(other) {
            if (other.id !== cl.id && other.start >= clStart) {
              other.start = Math.max(0, other.start - delta);
            }
          });
          cl.start = Math.max(0, cl.start - delta);
          trimmedCount++;
        } else {
          if (curTime >= clEnd - 0.03) return;
          var delta = clEnd - curTime;
          cl.duration = Math.max(0.05, curTime - clStart);
          cl.outPoint = (cl.inPoint || 0) + cl.duration;

          (tr.clips || []).forEach(function(other) {
            if (other.id !== cl.id && other.start >= clEnd - 0.001) {
              other.start = Math.max(0, other.start - delta);
            }
          });
          trimmedCount++;
        }
      });

      if (trimmedCount > 0) {
        if (before && window.project && window.project.history) {
          var after = typeof window.serializableProject === "function" ? window.serializableProject() : null;
          window.project.history.entries = window.project.history.entries.slice(0, window.project.history.index + 1);
          window.project.history.entries.push({ label: "Ripple trim " + direction, before: before, after: after });
          window.project.history.index++;
        }
        if (typeof window.scheduleAutosave === "function") window.scheduleAutosave();
        if (typeof window.renderAll === "function") window.renderAll();
        try { (window.notify || window.toast)(direction === "head" ? "Ripple trimmed head (Q)" : "Ripple trimmed tail (W)"); } catch(_) {}
      }
    };

    window.amiyoAddEdit = function() {
      if (!window.project || !Array.isArray(window.project.tracks)) return;
      var curTime = typeof window.currentTime === "number" ? window.currentTime : 0;
      var cutAny = false;

      window.project.tracks.forEach(function(tr) {
        if (tr.locked) return;
        (tr.clips || []).slice().forEach(function(cl) {
          if (curTime > cl.start + 0.05 && curTime < cl.start + cl.duration - 0.05) {
            if (typeof window.splitClipAt === "function") {
              window.splitClipAt(tr.id, cl.id, curTime);
              cutAny = true;
            }
          }
        });
      });

      if (!cutAny && typeof window.splitSelected === "function") {
        window.splitSelected();
      }
    };

    // -------------------------------------------------------------
    // 3. One-Click Proxy Mode Engine (50% Downscaled Smooth Scrubbing)
    // -------------------------------------------------------------
    window.__amiyoProxyModeActive = (function(){
      try { return localStorage.getItem("amiyo_proxy_mode") === "1"; } catch(_) { return false; }
    })();

    window.toggleProxyMode = function(forceVal) {
      if (typeof forceVal === "boolean") {
        window.__amiyoProxyModeActive = forceVal;
      } else {
        window.__amiyoProxyModeActive = !window.__amiyoProxyModeActive;
      }
      try { localStorage.setItem("amiyo_proxy_mode", window.__amiyoProxyModeActive ? "1" : "0"); } catch(_) {}

      var btn = document.getElementById("proxyToggleBtn");
      if (btn) {
        if (window.__amiyoProxyModeActive) {
          btn.classList.add("tool-active");
          btn.style.color = "#ff7a3d";
          btn.style.borderColor = "#ff7a3d";
        } else {
          btn.classList.remove("tool-active");
          btn.style.color = "";
          btn.style.borderColor = "";
        }
      }

      var badge = document.getElementById("proxyBadge");
      if (badge) {
        badge.style.display = window.__amiyoProxyModeActive ? "inline-block" : "none";
        badge.textContent = "PROXIES 50%";
      }

      window.__amiyoCanvasScale = window.__amiyoProxyModeActive ? 0.5 : 1.0;
      try { (window.notify || window.toast)(window.__amiyoProxyModeActive ? "Proxy Mode: ON (High-Speed 50% Canvas)" : "Proxy Mode: OFF (Full Resolution)"); } catch(_) {}
      if (typeof window.renderPreviewFrame === "function") window.renderPreviewFrame();
    };

    // -------------------------------------------------------------
    // 4. Smart Timeline Render Cache (Pre-Render In-to-Out Range)
    // -------------------------------------------------------------
    window.amiyoRenderCache = {
      frames: new Map(),
      cachedRange: null,
      isRendering: false,
      preRenderRange: async function(inTime, outTime, fps) {
        if (this.isRendering) return;
        fps = fps || 24;
        var pDur = typeof window.getProjectDuration === "function" ? window.getProjectDuration() : 30;
        var start = Math.max(0, typeof inTime === "number" ? inTime : 0);
        var end = Math.min(pDur, typeof outTime === "number" ? outTime : pDur);
        if (end <= start) end = pDur;

        this.isRendering = true;
        this.frames.clear();
        this.cachedRange = { inTime: start, outTime: end, fps: fps };

        try { (window.notify || window.toast)("Pre-rendering cache [" + start.toFixed(1) + "s - " + end.toFixed(1) + "s]..."); } catch(_) {}
        var step = 1 / fps;
        var canvas = document.getElementById("previewCanvas");
        if (!canvas) { this.isRendering = false; return; }

        var prevTime = window.currentTime;
        for (var t = start; t <= end; t += step) {
          window.currentTime = t;
          if (typeof window.renderPreviewFrame === "function") {
            try { await window.renderPreviewFrame(); } catch(_) {}
          }
          try {
            if (typeof createImageBitmap === "function") {
              var bmp = await createImageBitmap(canvas);
              this.frames.set(Math.round(t * 100) / 100, bmp);
            } else {
              var ctx = canvas.getContext("2d");
              if (ctx) {
                this.frames.set(Math.round(t * 100) / 100, ctx.getImageData(0, 0, canvas.width, canvas.height));
              }
            }
          } catch(err) {
            var ctx2 = canvas.getContext("2d");
            if (ctx2) {
              this.frames.set(Math.round(t * 100) / 100, ctx2.getImageData(0, 0, canvas.width, canvas.height));
            }
          }
        }

        window.currentTime = prevTime;
        if (typeof window.renderPreviewFrame === "function") {
          try { await window.renderPreviewFrame(); } catch(_) {}
        }
        this.isRendering = false;
        try { (window.notify || window.toast)("Render cache ready: " + this.frames.size + " frames (60fps playback)"); } catch(_) {}
      },
      getCachedFrame: function(time) {
        if (!this.cachedRange || this.frames.size === 0) return null;
        var key = Math.round(time * 100) / 100;
        return this.frames.get(key) || null;
      },
      clearCache: function() {
        this.frames.clear();
        this.cachedRange = null;
      }
    };

    // -------------------------------------------------------------
    // 5. Global Hotkey Interceptor for Dynamic Profiles & Trims
    // -------------------------------------------------------------
    document.addEventListener("keydown", function(e) {
      var inField = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement && document.activeElement.tagName);
      if (inField) return;

      var k = e.key.toLowerCase();
      var activeKeymap = window.__amiyoCurrentKeymap || "premiere";
      var profile = PROFILES[activeKeymap] || PROFILES.premiere;

      // Enter key: Render timeline cache
      if (e.key === "Enter" && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        var inPt = (window.project && window.project.inPoint) || 0;
        var outPt = (window.project && window.project.outPoint) || 0;
        window.amiyoRenderCache.preRenderRange(inPt, outPt);
        return;
      }

      // Q / W: Ripple Trim Head / Tail
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (k === "q") {
          e.preventDefault();
          window.amiyoRippleTrim("head");
          return;
        } else if (k === "w") {
          e.preventDefault();
          window.amiyoRippleTrim("tail");
          return;
        }
      }

      // Ctrl+K: Add Edit (Split all tracks at playhead)
      if ((e.ctrlKey || e.metaKey) && k === "k") {
        e.preventDefault();
        window.amiyoAddEdit();
        return;
      }

      // Map tool keys based on active profile
      if (!e.ctrlKey && !e.metaKey && !e.altKey && profile && profile.tools && profile.tools[k]) {
        var targetTool = profile.tools[k];
        if (typeof window.setActiveTool === "function") {
          e.preventDefault();
          window.setActiveTool(targetTool);
        }
      }
    });

    // Initialize UI bindings
    var proxyBtn = document.getElementById("proxyToggleBtn");
    if (proxyBtn) proxyBtn.onclick = function() { window.toggleProxyMode(); };
    var renderBtn = document.getElementById("renderRangeBtn");
    if (renderBtn) renderBtn.onclick = function() {
      var inPt = (window.project && window.project.inPoint) || 0;
      var outPt = (window.project && window.project.outPoint) || 0;
      window.amiyoRenderCache.preRenderRange(inPt, outPt);
    };
    var keymapSel = document.getElementById("nleKeymapProfile");
    if (keymapSel) {
      keymapSel.value = window.__amiyoCurrentKeymap;
      keymapSel.onchange = function() { window.setNLEKeyboardProfile(this.value); };
    }
  } catch(e) {
    try { console.warn("amiyo-pro-nle-elevations", e); } catch(_) {}
  }
})();

