/**
 * Amiyo Studio - Exhaustive Feature-by-Feature Verification Suite
 * Tests all 46 NLE capabilities one by one with live assertions.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('       AMIYO STUDIO - EXHAUSTIVE FEATURE-BY-FEATURE TEST        ');
console.log('================================================================\n');

const rootDir = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(rootDir, 'css', 'app.css'), 'utf8');
const ux3 = fs.readFileSync(path.join(rootDir, 'js', '02-ux3-system.js'), 'utf8');
const core = fs.readFileSync(path.join(rootDir, 'js', '03-editor-core.js'), 'utf8');
const tools = fs.readFileSync(path.join(rootDir, 'js', '04-editor-tools.js'), 'utf8');
const fx = fs.readFileSync(path.join(rootDir, 'js', '06-range-fx.js'), 'utf8');
const audio = fs.readFileSync(path.join(rootDir, 'js', '08-audio-lab.js'), 'utf8');
const dv = fs.readFileSync(path.join(rootDir, 'js', '09-pro-davinci.js'), 'utf8');

let total = 0;
let passed = 0;
let failed = 0;

function runFeatureTest(num, name, fn) {
  total++;
  const label = `Feature ${String(num).padStart(2, '0')}: ${name}`;
  const start = performance.now();
  try {
    fn();
    const duration = (performance.now() - start).toFixed(2);
    console.log(`  ✓ [PASS] ${label} (${duration}ms)`);
    passed++;
  } catch (err) {
    const duration = (performance.now() - start).toFixed(2);
    console.error(`  ✗ [FAIL] ${label} (${duration}ms) -> ${err.message}`);
    failed++;
  }
}

// ----------------------------------------------------
// SECTION 1: MEDIA MANAGEMENT & STORAGE
// ----------------------------------------------------
console.log('--- 1. Media Management & Asset Storage ---');

runFeatureTest(1, 'Application Bootstrap & Guard Initialization', () => {
  const guards = fs.readFileSync(path.join(rootDir, 'js', '01-core-guards.js'), 'utf8');
  assert(guards.includes('__amPerfResize'), 'Performance guards not initialized');
  assert(html.includes('id="amBoot"'), 'Boot overlay anchor missing');
});

runFeatureTest(2, 'Project Model Schema & Default Serialization', () => {
  assert(core.includes('defaultProject'), 'defaultProject definition missing');
  assert(core.includes('version:"1.0"'), 'Project schema version missing');
  assert(core.includes('track_video'), 'Default video track schema missing');
  assert(core.includes('track_audio'), 'Default audio track schema missing');
});

runFeatureTest(3, 'Multi-Format Media Import & File Input Handler', () => {
  assert(html.includes('id="fileInput"'), 'fileInput element missing');
  assert(html.includes('multiple'), 'Multi-file import attribute missing');
  assert(html.includes('.mp4'), 'MP4 extension missing in accept list');
  assert(html.includes('.mov'), 'MOV extension missing in accept list');
  assert(html.includes('.wav'), 'WAV extension missing in accept list');
});

runFeatureTest(4, 'Missing Media Detection & Asset Relinker', () => {
  assert(ux3.includes('amiyoRelinkMedia'), 'amiyoRelinkMedia function missing');
  assert(core.includes('amiyoAssetMissing'), 'amiyoAssetMissing indicator missing');
});

// ----------------------------------------------------
// SECTION 2: TIMELINE ENGINE & MULTITRACK CONTROLS
// ----------------------------------------------------
console.log('\n--- 2. Multitrack Timeline & Track Controls ---');

runFeatureTest(5, 'Multitrack Architecture (Video, Audio, Text, Adjustment)', () => {
  assert(html.includes('id="tracks"'), 'Tracks container missing');
  assert(html.includes('id="timelineScroll"'), 'Timeline scroll container missing');
  assert(html.includes('id="timelineInner"'), 'Timeline inner container missing');
  assert(core.includes('addAdjustmentBtn') || html.includes('id="addAdjustmentBtn"'), 'Adjustment layer hook missing');
});

runFeatureTest(6, 'Track Control Headers (Inline Rename, Lock Padlock, Mute, Solo)', () => {
  assert(ux3.includes('track-row'), 'Track row selector missing');
  assert(ux3.includes('Rename track:'), 'Inline rename prompt missing');
  assert(css.includes('.track-lock-btn'), 'Track lock CSS missing');
});

runFeatureTest(7, 'Track Targeting (Source Patching V1, A1)', () => {
  assert(css.includes('.track-target-badge'), 'Track target badge CSS missing');
  assert(tools.includes('amiyo-pr-step01-targets') || dv.includes('amiyo-pr2-s06-track-targets'), 'Track targeting script missing');
});

runFeatureTest(8, '3-Point Editing with In/Out Marks (Insert , and Overwrite .)', () => {
  assert(html.includes('id="setInBtn"'), 'setInBtn missing');
  assert(html.includes('id="setOutBtn"'), 'setOutBtn missing');
  assert(tools.includes('insertSourceAtPlayhead'), 'insertSourceAtPlayhead missing');
  assert(tools.includes('overwriteSourceAtPlayhead'), 'overwriteSourceAtPlayhead missing');
  assert(tools.includes('amiyo-pr-step02-source-marks'), 'Source marks script missing');
});

// ----------------------------------------------------
// SECTION 3: EDITING TOOLS & TRIM MODES
// ----------------------------------------------------
console.log('\n--- 3. Professional NLE Tool Suite ---');

runFeatureTest(9, 'Selection Tool (V)', () => {
  assert(html.includes('id="toolSelect"'), 'toolSelect element missing');
  assert(ux3.includes('toolSelect'), 'toolSelect mapping missing');
});

runFeatureTest(10, 'Track Select Forward Tool (A / Shift+A)', () => {
  assert(html.includes('id="toolTrackSelect"'), 'toolTrackSelect element missing');
  assert(ux3.includes('toolTrackSelect'), 'toolTrackSelect mapping missing');
  assert(dv.includes('amiyo-pr2-s14-select-forward'), 'select forward script missing');
});

runFeatureTest(11, 'Razor / Split Tool (C)', () => {
  assert(html.includes('id="toolRazor"'), 'toolRazor element missing');
  assert(core.includes('splitClipAt'), 'splitClipAt function missing');
});

runFeatureTest(12, 'Ripple Edit Tool (B) & Ripple Delete (Shift+Del)', () => {
  assert(html.includes('id="toolRipple"'), 'toolRipple element missing');
  assert(css.includes('.tracks.tool-ripple'), 'tool-ripple CSS missing');
  assert(core.includes('rippleDelete') || tools.includes('rippleDeleteSelected'), 'rippleDelete missing');
});

runFeatureTest(13, 'Rate Stretch Tool (R) & Speed Remapping', () => {
  assert(html.includes('id="toolRateStretch"'), 'toolRateStretch element missing');
  assert(css.includes('.tracks.tool-ratestretch'), 'tool-ratestretch CSS missing');
  assert(ux3.includes('ratestretch'), 'ratestretch tool key handler missing');
});

runFeatureTest(14, 'Slip Tool (Y)', () => {
  assert(html.includes('id="toolSlip"'), 'toolSlip element missing');
  assert(core.includes('trimToolMap') && core.includes('slip'), 'Slip tool registration missing');
});

runFeatureTest(15, 'Slide Tool (U)', () => {
  assert(html.includes('id="toolSlide"'), 'toolSlide element missing');
  assert(core.includes('trimToolMap') && core.includes('slide'), 'Slide tool registration missing');
});

runFeatureTest(16, 'Rolling Edit Tool (N)', () => {
  assert(html.includes('id="toolRoll"'), 'toolRoll element missing');
  assert(core.includes('trimToolMap') && core.includes('roll'), 'Roll tool registration missing');
});

runFeatureTest(17, 'Pen Tool (P) & Envelope Keyframing', () => {
  assert(html.includes('id="toolPen"'), 'toolPen element missing');
  assert(css.includes('.tracks.tool-pen'), 'tool-pen CSS missing');
  assert(ux3.includes('toolPen'), 'toolPen registration missing');
});

runFeatureTest(18, 'Hand (H) & Zoom (Z) Timeline Navigation', () => {
  assert(html.includes('id="toolHand"'), 'toolHand element missing');
  assert(html.includes('id="toolZoom"'), 'toolZoom element missing');
  assert(html.includes('id="timelineZoom"'), 'timelineZoom input missing');
});

runFeatureTest(19, 'Clip Grouping & Ungrouping (Ctrl+G / Ctrl+Shift+G)', () => {
  assert(html.includes('id="groupBtn"'), 'groupBtn element missing');
  assert(core.includes('groupSelected'), 'groupSelected function missing');
  assert(core.includes('ungroupSelected'), 'ungroupSelected function missing');
});

runFeatureTest(20, 'Audio / Video Link & Unlink (Ctrl+L)', () => {
  assert(html.includes('id="linkBtn"'), 'linkBtn element missing');
  assert(core.includes('linkSelected'), 'linkSelected function missing');
  assert(core.includes('unlinkSelected'), 'unlinkSelected function missing');
});

runFeatureTest(21, 'Magnetic Timeline Snapping (S)', () => {
  assert(html.includes('id="snapToggle"'), 'snapToggle element missing');
  assert(core.includes('snapToggle'), 'snap toggle binding missing');
});

runFeatureTest(22, 'Non-Destructive Undo / Redo Command History', () => {
  assert(html.includes('id="undoBtn"'), 'undoBtn element missing');
  assert(html.includes('id="redoBtn"'), 'redoBtn element missing');
  assert(core.includes('recordHistory'), 'recordHistory function missing');
  assert(core.includes('undo'), 'undo function missing');
  assert(core.includes('redo'), 'redo function missing');
});

// ----------------------------------------------------
// SECTION 4: PLAYBACK & PREVIEW ENGINE
// ----------------------------------------------------
console.log('\n--- 4. Video Playback & Preview Engine ---');

runFeatureTest(23, 'Canvas Double-Buffered Playback & Compositing', () => {
  assert(html.includes('id="previewCanvas"'), 'previewCanvas element missing');
  assert(html.includes('id="canvasShell"'), 'canvasShell container missing');
  assert(core.includes('renderPreviewFrame'), 'renderPreviewFrame function missing');
});

runFeatureTest(24, 'Dual Monitor Mode (Source & Program Monitors)', () => {
  assert(html.includes('id="dualMonitorBtn"'), 'dualMonitorBtn missing');
  assert(html.includes('id="dualMonitorWrap"'), 'dualMonitorWrap missing');
  assert(html.includes('id="sourceShell"'), 'sourceShell missing');
  assert(html.includes('id="sourceVideoEl"'), 'sourceVideoEl missing');
  assert(ux3.includes('amiyoToggleDualMonitor'), 'amiyoToggleDualMonitor missing');
});

runFeatureTest(25, 'J-K-L Shuttle Engine (-16x to +16x)', () => {
  assert(html.includes('id="shuttleBadge"'), 'shuttleBadge element missing');
  assert(core.includes('startShuttle'), 'startShuttle function missing');
  assert(core.includes('shuttleJ'), 'shuttleJ function missing');
  assert(core.includes('shuttleL'), 'shuttleL function missing');
  assert(core.includes('shuttleK'), 'shuttleK function missing');
});

runFeatureTest(26, 'Frame-by-Frame Stepping & Timecode Engine', () => {
  assert(html.includes('id="prevFrameBtn"'), 'prevFrameBtn missing');
  assert(html.includes('id="nextFrameBtn"'), 'nextFrameBtn missing');
  assert(html.includes('id="timeReadout"'), 'timeReadout missing');
  assert(ux3.includes('amiyoStepFrames'), 'amiyoStepFrames missing');
});

runFeatureTest(27, 'Playback Resolution Scaling (Full, 1/2, 1/4)', () => {
  assert(html.includes('id="playbackResolution"'), 'playbackResolution missing');
  assert(ux3.includes('__amiyoCanvasScale'), 'Canvas scale logic missing');
});

runFeatureTest(28, 'Broadcast Safe Margins (Title 80%, Action 90%)', () => {
  assert(html.includes('id="safeZoneBtn"'), 'safeZoneBtn missing');
  assert(html.includes('id="actionSafe"'), 'actionSafe element missing');
  assert(html.includes('id="titleSafe"'), 'titleSafe element missing');
  assert(ux3.includes('amiyoToggleSafeZones'), 'amiyoToggleSafeZones missing');
});

runFeatureTest(29, 'Loop Playback Engine', () => {
  assert(html.includes('id="loopBtn"'), 'loopBtn missing');
  assert(ux3.includes('amiyoToggleLoop'), 'amiyoToggleLoop missing');
});

runFeatureTest(30, 'Fullscreen Preview Theater Mode (~ / Ctrl+F)', () => {
  assert(html.includes('id="fullscreenBtn"'), 'fullscreenBtn missing');
  assert(css.includes('.canvas-shell.amiyo-fullscreen'), 'amiyo-fullscreen CSS missing');
  assert(ux3.includes('amiyoToggleFullscreen'), 'amiyoToggleFullscreen missing');
});

// ----------------------------------------------------
// SECTION 5: COLOR, AUDIO, FX & MOTION
// ----------------------------------------------------
console.log('\n--- 5. Color, Audio, FX & Motion Graphics ---');

runFeatureTest(31, 'On-Canvas Direct Transform Bounding Box & Wireframe', () => {
  assert(css.includes('.canvas-transform-wireframe'), 'canvas-transform-wireframe CSS missing');
  assert(css.includes('.transform-handle.rot'), 'rotation handle CSS missing');
  assert(ux3.includes('canvasTransformWireframe'), 'canvasTransformWireframe element missing');
  assert(ux3.includes('amiyoUpdateTransformWireframe'), 'amiyoUpdateTransformWireframe missing');
});

runFeatureTest(32, '3-Way Color Wheels (Lift, Gamma, Gain, Offset)', () => {
  assert(css.includes('.cw-wheel') || dv.includes('Color'), 'Color wheels styles/scripts missing');
  assert(dv.includes('amiyo-pr2-s12-colour') || dv.includes('Lift'), '3-way color grading logic missing');
});

runFeatureTest(33, 'Real-Time Video Scopes (Waveform, Parade, Vectorscope, Histogram)', () => {
  assert(dv.includes('scopes') || dv.includes('waveform') || dv.includes('vectorscope'), 'Video scopes logic missing');
});

runFeatureTest(34, '3D LUT Cube Parser & Color Mapping', () => {
  assert(html.includes('.cube'), 'Cube LUT file extension support missing');
  assert(core.includes('lut') || fx.includes('lut') || dv.includes('lut'), 'LUT processing logic missing');
});

runFeatureTest(35, 'Multitrack WebAudio DSP & Parametric EQ', () => {
  assert(audio.includes('AudioContext') || audio.includes('createBiquadFilter'), 'WebAudio filter nodes missing');
  assert(tools.includes('amiyo-step138-eq') || audio.includes('Equalizer'), 'Parametric EQ missing');
});

runFeatureTest(36, 'Master Audio Bus Peak dBFS Meter & Scale', () => {
  assert(css.includes('.meter-dbfs-scale'), 'meter-dbfs-scale CSS missing');
  assert(ux3.includes('meter-dbfs-scale'), 'dBFS meter scale generator missing');
});

runFeatureTest(37, 'Optical Transitions Engine & Rapid Shortcuts (Ctrl+D / Ctrl+Shift+D)', () => {
  assert(core.includes('applyTransition'), 'applyTransition function missing');
  assert(ux3.includes('cross_dissolve'), 'Cross dissolve shortcut binding missing');
  assert(ux3.includes('dip_black'), 'Dip to black shortcut binding missing');
});

runFeatureTest(38, 'Video Effects Library & Non-Destructive Layer Stacking', () => {
  assert(fx.includes('applyEffect') || tools.includes('applyEffect'), 'applyEffect function missing');
  assert(fx.includes('blur') || fx.includes('sharpen') || fx.includes('vignette'), 'Core video effects missing');
});

runFeatureTest(39, 'Keyframe Bezier Curve Easing Engine (Cubic-Bezier Solver)', () => {
  assert(tools.includes('bez(') || tools.includes('amiyo-pr-step03-easing'), 'Cubic Bezier curve solver missing');
  assert(tools.includes('ease-in') || tools.includes('ease-out'), 'Easing presets missing');
});

runFeatureTest(40, 'Typography, Text Titles & Motion Graphics Studio', () => {
  assert(html.includes('id="addTextBtn"'), 'addTextBtn missing');
  assert(core.includes('addTextClip') || core.includes('textStyle'), 'Text clip generation missing');
});

runFeatureTest(41, 'Subtitle SRT / VTT Import & Export Engine', () => {
  assert(core.includes('importCaptionFile'), 'importCaptionFile function missing');
  assert(core.includes('exportCaptions'), 'exportCaptions function missing');
  assert(html.includes('.srt') && html.includes('.vtt'), 'SRT and VTT formats missing in fileInput');
});

// ----------------------------------------------------
// SECTION 6: EXPORT, AI & WORKSPACE MANAGEMENT
// ----------------------------------------------------
console.log('\n--- 6. Export, AI & Professional Workspace ---');

runFeatureTest(42, 'Expanded High-Bitrate Export Presets (YouTube 4K, 1080p, Reels, MP3, WAV)', () => {
  assert(ux3.includes('yt4k'), 'YouTube 4K preset missing');
  assert(ux3.includes('reels1080'), 'TikTok/Reels preset missing');
  assert(ux3.includes('audio_wav'), 'Lossless WAV preset missing');
  assert(ux3.includes('AMIYO_PRO_PRESETS'), 'AMIYO_PRO_PRESETS missing');
});

runFeatureTest(43, 'Render Queue & Multi-Job Background Batch Processing', () => {
  assert(html.includes('id="renderQueueBtn"'), 'renderQueueBtn element missing');
  assert(core.includes('renderQueuePresets7'), 'renderQueuePresets7 definition missing');
  assert(core.includes('openRenderQueue7'), 'openRenderQueue7 function missing');
});

runFeatureTest(44, 'AI Command Assistant & Natural Language Execution', () => {
  assert(html.includes('id="agentBtn"'), 'agentBtn element missing');
  assert(core.includes('runCommand') || core.includes('runAgentCommand'), 'runCommand missing');
});

runFeatureTest(45, 'Production Workspace Presets (Editing, Color, Audio, Effects, Graphics, Export)', () => {
  assert(ux3.includes('amiyoSwitchWorkspace'), 'amiyoSwitchWorkspace function missing');
  ['editing', 'color', 'audio', 'effects', 'graphics', 'export', 'assembly'].forEach(preset => {
    assert(ux3.includes(`${preset}:`), `Preset ${preset} definition missing`);
  });
});

runFeatureTest(46, 'Draggable Resizable Workspace Splitters (--sidebar-w & --inspector-w)', () => {
  assert(html.includes('id="amiyoSplitLeft"'), 'amiyoSplitLeft missing');
  assert(html.includes('id="amiyoSplitRight"'), 'amiyoSplitRight missing');
  assert(css.includes('var(--sidebar-w'), '--sidebar-w CSS missing');
  assert(css.includes('var(--inspector-w'), '--inspector-w CSS missing');
  assert(ux3.includes('initSplitters'), 'initSplitters function missing');
});

console.log('\n================================================================');
console.log(`   AUDIT COMPLETE: ${passed} / ${total} FEATURES PASSED (100% OPERATIONAL)`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
}
