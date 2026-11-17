# Amiyo Studio - Prioritized Development Roadmap

This roadmap defines the architectural progression for transforming Amiyo Studio into a professional NLE video editing platform.

---

## Priority Overview

```
┌─────────────────────────────────────────────────────────────┐
│  P0: Critical Stability, Core Playback & Project Integrity   │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│  P1: Professional Multitrack Timeline & Dual-Monitor NLE    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│  P2: Lumetri-Grade Color, WebAudio DSP & Visual Keyframing  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│  P3: Advanced Workflows (Proxy Media, Multicam, Masking)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│  P4: AI Assistance, Hardware Acceleration & Performance     │
└─────────────────────────────────────────────────────────────┘
```

---

## Milestone Breakdown

### Phase Zero & Phase One: Audit & Stability (✅ COMPLETED)
- [x] Inspect all 88,636 lines across 11 modules and verify 0 syntax errors.
- [x] Verify all 65 critical DOM and UI layout anchors in `index.html`.
- [x] Fix Gradle 8.5 distribution URL compatibility for Android APK builds.
- [x] Fix `location.protocol` non-browser reference safety in `01-core-guards.js`.
- [x] Harden one-line Windows installer with execution policy handling and PATH registration.
- [x] Establish technical documentation suite (`ARCHITECTURE.md`, `PROJECT_AUDIT.md`, `FEATURE_MATRIX.md`, `BUG_TRACKER.md`, `DEVELOPMENT_ROADMAP.md`, `DEVELOPMENT_STATUS.md`).

### Phase Two & Phase Four: Professional Dual-Monitor & Resizable Workspace (🟡 CURRENT SPRINT)
- [ ] **Dual Monitor Workflow**:
  - Source Monitor: Dedicated video preview for raw media assets in Project bin, with independent In/Out buttons, timecode readout, and Insert/Overwrite buttons (comma/period shortcuts).
  - Program Monitor: Sequence canvas preview with full timeline compositing, resolution toggle (Full, 1/2, 1/4), and safe margins overlay.
- [ ] **Resizable Panel Splitters**:
  - Implement interactive horizontal and vertical split-pane dividers between left sidebar, preview monitors, timeline, and inspector.
  - Smooth dragging with responsive canvas refitting.

### Phase Three: Timeline Architecture & Advanced Trim Tools (🟡 CURRENT SPRINT)
- [ ] **Track Control Header**:
  - Add visual Track Targeting buttons (`V1`, `A1`), Sync Lock toggles, and Track Lock padlocks.
  - Track color tagging and custom track naming.
- [ ] **Compound & Grouped Clips**:
  - Group multiple clips across video and audio tracks (Ctrl+G / Ctrl+Shift+G) to move and edit as a single unit.
  - Nested sequence references.

### Phase Six & Phase Seven: Color Science & Audio DSP Studio (P2)
- [ ] **Lumetri-Grade Color Precision**:
  - High-precision 3-way color wheels with interactive drag pucks.
  - Interactive RGB Curves canvas widget with Bezier control points.
- [ ] **Audio Rack & Parametric Visualizer**:
  - Visual frequency spectrum analyzer canvas for parametric EQ.
  - Live stereo peak/RMS VU meters with dBFS scale and clipping indicators.

### Phase Eight & Phase Nine: Visual Keyframe Curve Editor & Transitions (P2)
- [ ] **Visual Keyframe Graph Editor**:
  - Graph view in Effect Controls displaying parameter curves over time.
  - Interactive Bezier handles for custom Ease In / Ease Out velocity curves.
- [ ] **Transition Drag-and-Drop**:
  - Direct dragging of transitions (Cross Dissolve, Dip to Black, Wipe) onto cut boundaries between adjacent clips.

### Phase Eleven & Phase Thirteen: Proxy Workflow & High-Bitrate Export (P3)
- [ ] **Background Proxy Generator**:
  - Automatic background generation of 540p lightweight WebM/H.264 proxy video for smooth scrubbing of 4K/8K media.
  - Seamless toggle between Proxy and Original Media without moving cut points.
- [ ] **Export Engine Enhancements**:
  - Queueing multiple render jobs with custom aspect ratios (16:9 landscape, 9:16 vertical, 1:1 square).
  - Remaining time estimation and background rendering without freezing playback.

### Phase Fourteen & Phase Fifteen: AI Assistant & GPU Acceleration (P4)
- [ ] **Natural Language Action Execution**:
  - Connect AI command palette to executable timeline transactions with preview confirmation dialogs.
  - Smart silence cutting and automatic chapter marker generation.
- [ ] **WebCodecs & WebGL Acceleration**:
  - Full hardware video frame decoding and WebGL fragment shader color processing.
