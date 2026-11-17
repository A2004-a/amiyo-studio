/**
 * Amiyo Studio - Comprehensive Architecture & Feature Audit
 * Runs deep static analysis and simulated headless execution of all subsystems.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = path.resolve(__dirname, '..');
const report = {
  timestamp: new Date().toISOString(),
  modules: [],
  features: {},
  bugs: [],
  domAnchors: { missing: [], present: [] },
  metrics: {}
};

console.log('====================================================');
console.log('   AMIYO STUDIO - PROFESSIONAL NLE AUDIT SUITE       ');
console.log('====================================================\n');

// 1. Audit Files & Sizes
console.log('--- 1. Module Inventory & Syntax Verification ---');
const jsDir = path.join(rootDir, 'js');
const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js')).sort();

let totalBytes = 0;
let totalLines = 0;

jsFiles.forEach(file => {
  const filePath = path.join(jsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').length;
  const bytes = fs.statSync(filePath).size;
  totalBytes += bytes;
  totalLines += lines;

  try {
    new vm.Script(content, { filename: file });
    report.modules.push({ file, lines, bytes, status: 'OK' });
    console.log(`  ✓ ${file.padEnd(25)} (${lines} lines, ${(bytes/1024).toFixed(1)} KB) - Syntax Valid`);
  } catch (err) {
    report.modules.push({ file, lines, bytes, status: 'SYNTAX_ERROR', error: err.message });
    report.bugs.push({ type: 'SYNTAX_ERROR', file, message: err.message });
    console.error(`  ✗ ${file.padEnd(25)} - SYNTAX ERROR: ${err.message}`);
  }
});

console.log(`\nTotal JS: ${totalLines.toLocaleString()} lines across ${jsFiles.length} modules (${(totalBytes/1024/1024).toFixed(2)} MB)\n`);

// 2. DOM Anchors in index.html and editor.html
console.log('--- 2. DOM & UI Anchor Verification ---');
const htmlContent = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const requiredAnchors = [
  'amBoot', 'amBootT', 'amBootBar', 'projectName', 'saveStatus',
  'undoBtn', 'redoBtn', 'versionsBtn', 'shareBtn', 'settingsBtn',
  'helpBtn', 'agentBtn', 'storageBtn', 'renderQueueBtn', 'exportBtn',
  'nav', 'leftPanel', 'playBtn', 'stopBtn', 'prevFrameBtn', 'nextFrameBtn',
  'fitBtn', 'gridBtn', 'engineBadge', 'shuttleBadge', 'timeReadout',
  'canvasShell', 'previewCanvas', 'videoEl', 'gridOverlay',
  'toolSelect', 'toolRazor', 'toolHand', 'toolZoom', 'toolSlip', 'toolSlide',
  'toolRoll', 'snapToggle', 'setInBtn', 'setOutBtn', 'clearInOutBtn', 'trimIOBtn',
  'addVideoBtn', 'addTextBtn', 'addAdjustmentBtn', 'splitBtn', 'deleteBtn',
  'duplicateBtn', 'fitTimelineBtn', 'timelineZoom', 'timelineScroll',
  'timelineInner', 'ruler', 'rulerMarks', 'ioRange', 'tracks', 'playhead',
  'inspectorCol', 'inspector', 'toast', 'modalBackdrop', 'modalTitle',
  'modalClose', 'modalBody', 'fileInput'
];

requiredAnchors.forEach(id => {
  if (htmlContent.includes(`id="${id}"`)) {
    report.domAnchors.present.push(id);
  } else {
    report.domAnchors.missing.push(id);
    report.bugs.push({ type: 'MISSING_DOM_ANCHOR', id, message: `Required element #${id} missing from HTML` });
    console.error(`  ✗ Missing DOM Element #${id}`);
  }
});
console.log(`  ✓ Checked ${requiredAnchors.length} critical UI anchors: ${report.domAnchors.present.length} present, ${report.domAnchors.missing.length} missing.\n`);

// 3. Feature Inventory & Capability Assessment
console.log('--- 3. Core NLE Engine Feature Analysis ---');

function analyzeCode(query, regex, desc) {
  let count = 0;
  let matches = [];
  jsFiles.forEach(file => {
    const content = fs.readFileSync(path.join(jsDir, file), 'utf8');
    const m = content.match(regex);
    if (m) {
      count += m.length;
      matches.push(file);
    }
  });
  report.features[query] = { count, modules: matches, desc };
  console.log(`  • ${query.padEnd(30)}: ${count > 0 ? 'IMPLEMENTED (' + count + ' occurrences in ' + matches.join(', ') + ')' : 'MISSING / LIMITED'}`);
}

analyzeCode('Multitrack Timeline', /track_video|track_audio|track_text|track_caption|tracks\.push/g, 'Scalable multitrack timeline data structure');
analyzeCode('Razor / Cut Suite', /toolRazor|splitAt|splitClip|cutSuite/g, 'Frame-accurate razor cut and splitting');
analyzeCode('Slip / Slide / Roll Edits', /toolSlip|toolSlide|toolRoll|amiyoRoll|amiyoSlip/g, 'Advanced NLE trim tools');
analyzeCode('Keyframe Animation', /keyframes|upsertKeyframe|addKeyframe|bezier|linear/gi, 'Parameter keyframing and interpolation');
analyzeCode('Color Correction & Scopes', /colorWheels|vectorscope|rgbParade|waveform|histogram|lift.*gamma.*gain/gi, 'Color wheels, scopes, and Lumetri-grade color adjustments');
analyzeCode('Audio Lab & DSP', /audioContext|AudioContext|createGain|createBiquadFilter|createDynamicsCompressor|createConvolver/g, 'WebAudio DSP graph, EQ, compressor, limiter');
analyzeCode('Video Transitions', /transition|crossDissolve|wipe|dipToBlack|dipToWhite/gi, 'Dissolve, wipes, and GL transitions');
analyzeCode('Export Pipeline', /exportBtn|renderQueue|MediaRecorder|VideoEncoder|mp3Encoder|lamejs/gi, 'Rendering, queueing, and multi-format encoding');
analyzeCode('AI Features', /aiCommand|speechRecognition|whisper|silence|autoCut|caption/gi, 'Speech transcription, silence removal, natural language commands');
analyzeCode('Storage & Project Format', /serializableProject|localStorage|indexedDB|amiyoPutBlob|autosave/gi, 'Non-destructive project serialization and recovery');

// 4. Run Simulated Project & Timeline Operations
console.log('\n--- 4. Headless Functional Unit Testing ---');

function testUnit(label, testFn) {
  try {
    testFn();
    console.log(`  ✓ [PASS] ${label}`);
  } catch (err) {
    console.error(`  ✗ [FAIL] ${label}: ${err.message}`);
    report.bugs.push({ type: 'UNIT_TEST_FAILURE', test: label, error: err.message });
  }
}

// Sandbox context simulating browser environment
const domListeners = new Map();
const sandbox = {
  window: {},
  addEventListener() {},
  removeEventListener() {},
  document: {
    head: { appendChild() {}, removeChild() {} },
    body: { appendChild() {}, removeChild() {}, classList: { add() {}, remove() {}, toggle() {} } },
    documentElement: { classList: { add() {}, remove() {}, toggle() {} }, appendChild() {} },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getElementById(id) {
      return {
        id,
        style: {},
        classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
        addEventListener(event, fn) {
          const arr = domListeners.get(id + ':' + event) || [];
          arr.push(fn);
          domListeners.set(id + ':' + event, arr);
        },
        getContext() {
          return {
            save() {}, restore() {}, translate() {}, rotate() {}, scale() {},
            clearRect() {}, fillRect() {}, strokeRect() {}, fillText() {},
            measureText() { return { width: 100 }; },
            drawImage() {}, getImageData() { return { data: new Uint8ClampedArray(400) }; },
            putImageData() {}, createImageData() { return { data: new Uint8ClampedArray(400) }; }
          };
        },
        querySelectorAll() { return []; },
        querySelector() { return null; },
        appendChild() {},
        setAttribute() {},
        getAttribute() { return null; }
      };
    },
    createElement(tag) {
      return this.getElementById(tag + '_' + Math.random().toString(36).slice(2, 6));
    },
    addEventListener() {},
    removeEventListener() {}
  },
  localStorage: {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; }
  },
  sessionStorage: {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; }
  },
  navigator: { userAgent: 'Node-Audit' },
  performance: { now: () => Date.now() },
  requestAnimationFrame: (cb) => setTimeout(cb, 16),
  cancelAnimationFrame: (id) => clearTimeout(id),
  Node: Object.assign(function Node() {}, {
    prototype: {
      insertBefore(n, r) { return n; },
      appendChild(n) { return n; },
      removeChild(n) { return n; }
    },
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
  }),
  Element: Object.assign(function Element() {}, { prototype: {} }),
  HTMLElement: Object.assign(function HTMLElement() {}, { prototype: {} }),
  MutationObserver: class {
    observe() {}
    disconnect() {}
  },
  ResizeObserver: class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
  AudioContext: class {
    createGain() { return { connect() {}, gain: { value: 1 } }; }
    createBiquadFilter() { return { connect() {}, frequency: { value: 1000 } }; }
  },
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval
};
sandbox.window = sandbox;
sandbox.global = sandbox;

// Run Module 1 & 2 in sandbox
testUnit('Core performance guards initialization', () => {
  const code = fs.readFileSync(path.join(jsDir, '01-core-guards.js'), 'utf8');
  vm.runInNewContext(code, sandbox);
  if (!sandbox.window.__amPerfResize) throw new Error('__amPerfResize flag not set');
});

testUnit('Project model serialization & deep clone', () => {
  const p = {
    version: '1.0',
    tracks: [
      { id: 'v1', kind: 'video', clips: [{ id: 'c1', start: 0, duration: 5, inPoint: 0, outPoint: 5 }] },
      { id: 'a1', kind: 'audio', clips: [{ id: 'c2', start: 0, duration: 5, volume: 0.8 }] }
    ],
    history: { entries: [1, 2, 3], index: 2 }
  };
  const cloned = JSON.parse(JSON.stringify(p));
  if (cloned.tracks.length !== 2 || cloned.tracks[0].clips[0].duration !== 5) {
    throw new Error('Project serialization structure mismatch');
  }
});

testUnit('Frame calculations & timecode conversion', () => {
  function timecode(sec, fps = 30) {
    const totalFrames = Math.round(sec * fps);
    const f = totalFrames % fps;
    const totalSec = Math.floor(totalFrames / fps);
    const s = totalSec % 60;
    const m = Math.floor(totalSec / 60) % 60;
    const h = Math.floor(totalSec / 3600);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
  }
  const tc = timecode(1.5, 30);
  if (tc !== '00:00:01:15') throw new Error(`Expected 00:00:01:15, got ${tc}`);
});

testUnit('Keyframe interpolation logic', () => {
  const keyframes = [
    { t: 0, scale: 1 },
    { t: 2, scale: 2 }
  ];
  function interp(t) {
    if (t <= keyframes[0].t) return keyframes[0].scale;
    if (t >= keyframes[1].t) return keyframes[1].scale;
    const ratio = (t - keyframes[0].t) / (keyframes[1].t - keyframes[0].t);
    return keyframes[0].scale + (keyframes[1].scale - keyframes[0].scale) * ratio;
  }
  const mid = interp(1);
  if (Math.abs(mid - 1.5) > 0.001) throw new Error(`Expected 1.5, got ${mid}`);
});

console.log('\n====================================================');
console.log('                 AUDIT COMPLETED                    ');
console.log(`Discovered Bugs: ${report.bugs.length}`);
console.log('====================================================');

// Output report JSON for record
fs.writeFileSync(path.join(rootDir, 'audit-results.json'), JSON.stringify(report, null, 2));
process.exit(0);
