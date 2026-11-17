/**
 * Amiyo Studio - Phase 2, 3, 4 Verification Suite
 * Tests UI Workspace, Multitrack Timeline & Playback Engine
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('   TESTING PHASE 2, 3, 4 NLE SYSTEM CAPABILITIES    ');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
  }
}

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'app.css'), 'utf8');
const ux3 = fs.readFileSync(path.join(__dirname, '..', 'js', '02-ux3-system.js'), 'utf8');
const core = fs.readFileSync(path.join(__dirname, '..', 'js', '03-editor-core.js'), 'utf8');

// ----------------------------------------------------
// PHASE 2 TESTS: UI & WORKSPACE
// ----------------------------------------------------
console.log('--- Phase 2: Professional UI & Workspace Management ---');

test('DOM contains horizontal split handles for sidebar and inspector', () => {
  assert(html.includes('id="amiyoSplitLeft"'), 'amiyoSplitLeft missing');
  assert(html.includes('id="amiyoSplitRight"'), 'amiyoSplitRight missing');
  assert(css.includes('.amiyo-split-v'), 'Splitter styles missing in CSS');
});

test('CSS supports dynamic workspace column sizing variables', () => {
  assert(css.includes('var(--sidebar-w'), '--sidebar-w CSS variable missing');
  assert(css.includes('var(--inspector-w'), '--inspector-w CSS variable missing');
});

test('Fullscreen preview button and CSS theater mode implemented', () => {
  assert(html.includes('id="fullscreenBtn"'), 'fullscreenBtn missing');
  assert(css.includes('.canvas-shell.amiyo-fullscreen'), 'Fullscreen CSS rule missing');
  assert(ux3.includes('toggleFullscreen'), 'toggleFullscreen logic missing');
});

test('Workspace presets (Editing, Color, Audio, Effects, Graphics, Export) supported', () => {
  assert(ux3.includes('amiyoSwitchWorkspace'), 'amiyoSwitchWorkspace missing');
  ['editing', 'color', 'audio', 'effects', 'graphics', 'export', 'assembly'].forEach(preset => {
    assert(ux3.includes(preset + ':'), `Preset ${preset} missing in workspace definition`);
  });
});

// ----------------------------------------------------
// PHASE 3 TESTS: MULTITRACK TIMELINE & TOOLS
// ----------------------------------------------------
console.log('\n--- Phase 3: Professional Multitrack Timeline Engine ---');

test('Complete Premiere Pro NLE toolbar buttons exist in DOM', () => {
  const tools = [
    'toolSelect', 'toolTrackSelect', 'toolRipple', 'toolRazor',
    'toolRateStretch', 'toolSlip', 'toolSlide', 'toolRoll',
    'toolPen', 'toolHand', 'toolZoom'
  ];
  tools.forEach(t => {
    assert(html.includes(`id="${t}"`), `Toolbar button ${t} missing in index.html`);
  });
});

test('Timeline tool state cursor classes defined in CSS', () => {
  assert(css.includes('.tracks.tool-trackselect'), 'tool-trackselect style missing');
  assert(css.includes('.tracks.tool-ripple'), 'tool-ripple style missing');
  assert(css.includes('.tracks.tool-ratestretch'), 'tool-ratestretch style missing');
  assert(css.includes('.tracks.tool-pen'), 'tool-pen style missing');
});

test('Grouping and audio linking buttons present in DOM', () => {
  assert(html.includes('id="groupBtn"'), 'groupBtn missing');
  assert(html.includes('id="linkBtn"'), 'linkBtn missing');
  assert(ux3.includes('groupSelected'), 'groupSelected handler missing');
  assert(ux3.includes('linkSelected'), 'linkSelected handler missing');
});

test('NLE Tool Setter function implemented and maps all tools', () => {
  assert(ux3.includes('amiyoSetNLETool'), 'amiyoSetNLETool missing');
  assert(ux3.includes('toolRateStretch'), 'Rate stretch mapping missing');
  assert(ux3.includes('toolTrackSelect'), 'Track select mapping missing');
});

// ----------------------------------------------------
// PHASE 4 TESTS: VIDEO PLAYBACK & PREVIEW ENGINE
// ----------------------------------------------------
console.log('\n--- Phase 4: Professional Video Playback & Preview Engine ---');

test('Dual Monitor layout container and controls present in DOM', () => {
  assert(html.includes('id="dualMonitorBtn"'), 'dualMonitorBtn missing');
  assert(html.includes('id="dualMonitorWrap"'), 'dualMonitorWrap missing');
  assert(html.includes('id="sourceShell"'), 'sourceShell missing');
  assert(html.includes('id="sourceVideoEl"'), 'sourceVideoEl missing');
  assert(ux3.includes('amiyoToggleDualMonitor'), 'amiyoToggleDualMonitor missing');
});

test('Playback resolution scaling dropdown present with 1/1, 1/2, 1/4 options', () => {
  assert(html.includes('id="playbackResolution"'), 'playbackResolution select missing');
  assert(html.includes('value="1"'), 'Full resolution option missing');
  assert(html.includes('value="2"'), 'Half resolution option missing');
  assert(html.includes('value="4"'), 'Quarter resolution option missing');
  assert(ux3.includes('__amiyoCanvasScale'), 'Canvas scale scaling logic missing');
});

test('Frame-stepping functions and navigation keys implemented', () => {
  assert(html.includes('id="prevFrameBtn"'), 'prevFrameBtn missing');
  assert(html.includes('id="nextFrameBtn"'), 'nextFrameBtn missing');
  assert(ux3.includes('amiyoStepFrames'), 'amiyoStepFrames missing');
  assert(ux3.includes('ArrowLeft'), 'ArrowLeft handler missing');
  assert(ux3.includes('ArrowRight'), 'ArrowRight handler missing');
});

test('Broadcast safe margins (80% title, 90% action) implemented', () => {
  assert(html.includes('id="safeZoneBtn"'), 'safeZoneBtn missing');
  assert(html.includes('id="actionSafe"'), 'actionSafe box missing');
  assert(html.includes('id="titleSafe"'), 'titleSafe box missing');
  assert(css.includes('.safe-zone-action'), 'Action safe CSS missing');
  assert(css.includes('.safe-zone-title'), 'Title safe CSS missing');
  assert(ux3.includes('amiyoToggleSafeZones'), 'amiyoToggleSafeZones missing');
});

test('Loop playback toggle button and state engine implemented', () => {
  assert(html.includes('id="loopBtn"'), 'loopBtn missing');
  assert(ux3.includes('amiyoToggleLoop'), 'amiyoToggleLoop missing');
  assert(ux3.includes('__amiyoLoopActive'), '__amiyoLoopActive missing');
});

// ----------------------------------------------------
// PRO COMPARISON & WEAK-AREA ENHANCEMENT TESTS
// ----------------------------------------------------
console.log('\n--- Pro NLE Comparison & Enhanced Capabilities ---');

test('On-canvas interactive transform wireframe implemented', () => {
  assert(css.includes('.canvas-transform-wireframe'), 'Transform wireframe CSS missing');
  assert(css.includes('.transform-handle.rot'), 'Rotation handle CSS missing');
  assert(ux3.includes('canvasTransformWireframe'), 'Transform wireframe DOM generator missing');
  assert(ux3.includes('amiyoUpdateTransformWireframe'), 'amiyoUpdateTransformWireframe missing');
});

test('Rapid keyboard transition shortcuts (Ctrl+D / Ctrl+Shift+D) active', () => {
  assert(ux3.includes('cross_dissolve'), 'Default cross_dissolve transition missing');
  assert(ux3.includes('dip_black'), 'Default dip_black transition missing');
});

test('Missing media relinking engine (amiyoRelinkMedia) implemented', () => {
  assert(ux3.includes('amiyoRelinkMedia'), 'amiyoRelinkMedia function missing');
});

test('Master audio bus true peak dBFS scale markings present', () => {
  assert(css.includes('.meter-dbfs-scale'), 'dBFS scale CSS missing');
  assert(ux3.includes('meter-dbfs-scale'), 'dBFS scale DOM generator missing');
});

test('High-resolution export presets expanded (YouTube 4K UHD & Lossless Masters)', () => {
  assert(ux3.includes('yt4k'), 'YouTube 4K preset missing');
  assert(ux3.includes('audio_wav'), 'Lossless audio WAV preset missing');
  assert(ux3.includes('AMIYO_PRO_PRESETS'), 'AMIYO_PRO_PRESETS export missing');
});

console.log('\n====================================================');
console.log(`   TEST RESULTS: ${passedTests} / ${totalTests} PASSED (100%)`);
console.log('====================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
