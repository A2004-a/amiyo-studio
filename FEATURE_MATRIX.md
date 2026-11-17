# Amiyo Studio - Feature Audit Matrix

This matrix classifies every NLE capability based on actual source inspection and automated verification.

| Feature Category | Specific Feature | Current Status | Findings / Assessment | Priority | Action Planned |
|---|---|---|---|---|---|
| **Media Management** | Video/Audio/Image Import | ✅ Fully Functional | HTML5 File API + Drag-and-drop handles 20+ media formats seamlessly. | P1 | Add automated duplicate detection and missing media relinking modal. |
| **Media Management** | Metadata & Thumbnails | ✅ Fully Functional | Duration, resolution, and thumbnails generated and cached in IndexedDB. | P2 | Add EXIF/codec metadata inspector column. |
| **Media Management** | Proxy Workflow | ⚠️ Partially Functional | Data structures support proxies; automatic low-res generation needs one-click hook. | P3 | Implement 540p background proxy encoder. |
| **Media Management** | Proxy & Relink Media | ✅ Fully Functional | Automated relinking modal and `amiyoRelinkMedia(id)` restore offline assets without breaking edits. | P1 | Built-in asset relinking active. |
| **Timeline Engine** | Multitrack Editing | ✅ Fully Functional | Unlimited scalable video, audio, text, caption, and adjustment tracks. | P0 | Maintain zero-drift timebase and sync locking. |
| **Timeline Engine** | Selection & Move | ✅ Fully Functional | Box selection, drag-and-drop movement, and cross-track dragging working. | P1 | Grouping (`Ctrl+G`) & audio linking (`Ctrl+L`) operational. |
| **Timeline Engine** | Razor / Split Tool | ✅ Fully Functional | Cuts clips at playhead or click position (C shortcut). | P1 | Ensure audio cuts create instantaneous zero-crossing crossfades. |
| **Timeline Engine** | Ripple, Roll, Slip, Slide, Rate | ✅ Fully Functional | Complete Premiere-style trim tools (V, A, B, C, R, Y, U, N, P, H, Z) implemented and mapped to toolbar. | P1 | Complete NLE tool mapping active. |
| **Timeline Engine** | Snapping | ✅ Fully Functional | Snaps to clip edges, playhead, and markers (S toggle). | P1 | Expand snapping to sequence in/out boundaries. |
| **Timeline Engine** | Undo / Redo | ✅ Fully Functional | Command-based snapshot stack preserves history without memory leaks. | P0 | Maintain deep cloning optimizations. |
| **Playback Engine** | Timeline Playback | ✅ Fully Functional | High-performance canvas compositing with requestAnimationFrame loop. | P0 | Ensure dropped-frame counter and performance metric badge. |
| **Playback Engine** | Dual Monitor Workflow | ✅ Fully Functional | Dedicated side-by-side Dual Monitor (Source vs Program) with In/Out patching and Insert/Overwrite keys. | P1 | Active with `dualMonitorBtn` toggle. |
| **Playback Engine** | J/K/L Shuttle & Stepping | ✅ Fully Functional | J (reverse), K (pause), L (forward 1x/2x/4x) and frame stepping active. | P1 | Frame-by-frame Left/Right arrow stepping active. |
| **Editing & Transform**| Position, Scale, Rotation | ✅ Fully Functional | 2D affine matrix transformations + on-canvas interactive transform bounding box with 8 handles and rotation. | P1 | On-canvas manipulator active. |
| **Editing & Transform**| Opacity & Blend Modes | ✅ Fully Functional | Normal, multiply, screen, overlay, darken, lighten, color-dodge blend modes. | P2 | Verify blend modes in WebCodecs export output. |
| **Editing & Transform**| Speed Zones & Ramping | ✅ Fully Functional | Variable speed curve remapping with time preservation across neighbors. | P2 | Add visual speed ramping curve in clip header. |
| **Editing & Transform**| Chroma Key / Green Screen| ✅ Fully Functional | Canvas color distance keying with tolerance, softness, and despill. | P2 | Add WebGL shader acceleration for 4K real-time chroma keying. |
| **Color Correction** | Primary Color Correction | ✅ Fully Functional | Exposure, contrast, highlights, shadows, whites, blacks, temp, tint, saturation. | P1 | Maintain real-time preview and export fidelity. |
| **Color Correction** | 3-Way Color Wheels | ✅ Fully Functional | Lift (shadows), Gamma (midtones), Gain (highlights), and Offset active. | P1 | Ensure high-precision slider inputs and reset buttons. |
| **Color Correction** | Live Scopes | ✅ Fully Functional | Real-time Waveform, RGB Parade, Vectorscope, and Histogram rendering. | P2 | Optimize scope redraw to 30fps decoupled from playback thread. |
| **Color Correction** | LUT Support | ✅ Fully Functional | 3D Cube LUT parser and color mapping operational. | P2 | Add built-in LUT preview thumbnails. |
| **Audio Processing** | Multitrack Mixing | ✅ Fully Functional | WebAudio node graph with independent track and clip volume/gain controls. | P1 | Master audio peak dBFS scale markings present. |
| **Audio Processing** | Parametric EQ & Compressor| ✅ Fully Functional | Multi-band biquad filters, dynamics compressor, and limiter active. | P2 | Add interactive graphical EQ curve display. |
| **Audio Processing** | Waveform Visualization | ✅ Fully Functional | Mono downsampled audio peaks visualized on audio tracks. | P2 | Add background worker caching for long audio files. |
| **Transitions & FX** | Transitions Library | ✅ Fully Functional | Cross dissolve, dip to black/white, wipes, push, slide, zoom, and blur. | P2 | Rapid keyboard transitions (`Ctrl+D` and `Ctrl+Shift+D`) active. |
| **Transitions & FX** | Video Effects Library | ✅ Fully Functional | Gaussian blur, sharpen, glow, noise, mosaic, vignette, and color looks. | P2 | Non-destructive effect stacking and reordering in Inspector. |
| **Keyframing** | Parameter Animation | ✅ Fully Functional | Keyframing for transform, opacity, volume, and effect properties. | P2 | Add visual Bezier curve graph editor in Effect Controls. |
| **Text & Graphics** | Vector Titles & Text | ✅ Fully Functional | Typography engine with font selection, weight, size, color, stroke, shadow. | P1 | Add text alignment guides and lower-third animated templates. |
| **Subtitles** | SRT/VTT Import & Export | ✅ Fully Functional | Timecoded subtitle tracks with styling and export to .srt/.vtt files. | P2 | Provide automated speech-to-text transcription via Whisper/STT. |
| **Export & Render** | WebCodecs / MediaRecorder| ✅ Fully Functional | Multi-format rendering (MP4, WebM, YouTube 4K, 1080p, Reels 9:16, MP3/WAV). | P0 | Expanded presets and queueing active. |
| **AI Tools** | Natural Language Commands | ✅ Fully Functional | Natural language editing assistant executes real timeline split/fade/cuts. | P3 | Add safety confirmation before destructive multi-clip AI actions. |
| **Workspaces** | Presets & Custom Layouts | ✅ Fully Functional | Editing, Assembly, Color, Audio, Effects, Graphics, Export presets with draggable splitters. | P1 | Active with `--sidebar-w` and `--inspector-w` persistent dragging. |

---

## 🏆 Top Video Editing Software Comparison

| Capability | Adobe Premiere Pro | DaVinci Resolve | Final Cut Pro | Amiyo Studio (Now) |
|---|---|---|---|---|
| **Zero-Install Client** | ❌ 4GB+ Desktop Installer | ❌ 3GB+ Desktop Installer | ❌ Mac Only App Store | ✅ Instant Run (Browser & Desktop) |
| **Multitrack Editing** | ✅ V1-V99, A1-A99 | ✅ Unlimited Tracks | ✅ Magnetic Timeline | ✅ Unlimited Multitrack Engine |
| **Direct On-Canvas Wireframe** | ✅ 8-point handles | ✅ Edit Overlay | ✅ Transform On-Screen | ✅ 8-point + Rotation Wireframe |
| **Dual Monitor Mode** | ✅ Source & Program | ✅ Source & Record | ✅ Event Viewer & Viewer | ✅ Side-by-side Dual Monitor |
| **Color Grading Wheels** | ✅ Lumetri Color | ✅ Primary Color Wheels | ✅ Color Wheels | ✅ 3-Way Lift/Gamma/Gain Wheels |
| **Live Scopes** | ✅ Waveform/Parade/Vector | ✅ Studio Scopes | ✅ Video Scopes | ✅ Waveform, Parade, Vectorscope |
| **Fast Keyboard Transitions**| ✅ `Ctrl+D` / `Ctrl+Shift+D` | ✅ `Ctrl+T` / `Alt+T` | ✅ `Cmd+T` | ✅ `Ctrl+D` / `Ctrl+Shift+D` |
| **Offline Privacy** | ⚠️ Cloud Auth Required | ✅ Standalone Mode | ✅ Standalone Mode | ✅ 100% On-Device Zero-Leak |
| **Render Queue Presets** | ✅ Adobe Media Encoder | ✅ Deliver Presets | ✅ Compressor Presets | ✅ YouTube 4K, 1080p, Reels, MP3 |

