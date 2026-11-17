# Amiyo Studio - Feature Audit Matrix

This matrix classifies every NLE capability based on actual source inspection and automated verification.

| Feature Category | Specific Feature | Current Status | Findings / Assessment | Priority | Action Planned |
|---|---|---|---|---|---|
| **Media Management** | Video/Audio/Image Import | ✅ Fully Functional | HTML5 File API + Drag-and-drop handles 20+ media formats seamlessly. | P1 | Add automated duplicate detection and missing media relinking modal. |
| **Media Management** | Metadata & Thumbnails | ✅ Fully Functional | Duration, resolution, and thumbnails generated and cached in IndexedDB. | P2 | Add EXIF/codec metadata inspector column. |
| **Media Management** | Proxy Workflow | ⚠️ Partially Functional | Data structures support proxies; automatic low-res generation needs one-click hook. | P3 | Implement 540p background proxy encoder. |
| **Timeline Engine** | Multitrack Editing | ✅ Fully Functional | Unlimited scalable video, audio, text, caption, and adjustment tracks. | P0 | Maintain zero-drift timebase and sync locking. |
| **Timeline Engine** | Selection & Move | ✅ Fully Functional | Box selection, drag-and-drop movement, and cross-track dragging working. | P1 | Add multi-clip grouping / compound clip grouping. |
| **Timeline Engine** | Razor / Split Tool | ✅ Fully Functional | Cuts clips at playhead or click position (C shortcut). | P1 | Ensure audio cuts create instantaneous zero-crossing crossfades. |
| **Timeline Engine** | Ripple, Roll, Slip, Slide | ✅ Fully Functional | Complete Premiere-style trim tools (V, C, Y, U, N) implemented. | P1 | Add visual trimming preview in Program monitor during roll/slip. |
| **Timeline Engine** | Snapping | ✅ Fully Functional | Snaps to clip edges, playhead, and markers (S toggle). | P1 | Expand snapping to sequence in/out boundaries. |
| **Timeline Engine** | Undo / Redo | ✅ Fully Functional | Command-based snapshot stack preserves history without memory leaks. | P0 | Maintain deep cloning optimizations. |
| **Playback Engine** | Timeline Playback | ✅ Fully Functional | High-performance canvas compositing with requestAnimationFrame loop. | P0 | Ensure dropped-frame counter and performance metric badge. |
| **Playback Engine** | Dual Monitor Workflow | ⚠️ Partially Functional | Program monitor active; Source monitor currently shares viewport or tabs. | P1 | Implement dedicated side-by-side Source vs. Program monitor layout. |
| **Playback Engine** | J/K/L Shuttle & Stepping | ✅ Fully Functional | J (reverse), K (pause), L (forward 1x/2x/4x) and frame stepping active. | P1 | Smooth shuttle audio scrubbing pitch preservation. |
| **Editing & Transform**| Position, Scale, Rotation | ✅ Fully Functional | 2D affine matrix transformations with anchor point control. | P1 | Add on-canvas interactive transform bounding box with drag handles. |
| **Editing & Transform**| Opacity & Blend Modes | ✅ Fully Functional | Normal, multiply, screen, overlay, darken, lighten, color-dodge blend modes. | P2 | Verify blend modes in WebCodecs export output. |
| **Editing & Transform**| Speed Zones & Ramping | ✅ Fully Functional | Variable speed curve remapping with time preservation across neighbors. | P2 | Add visual speed ramping curve in clip header. |
| **Editing & Transform**| Chroma Key / Green Screen| ✅ Fully Functional | Canvas color distance keying with tolerance, softness, and despill. | P2 | Add WebGL shader acceleration for 4K real-time chroma keying. |
| **Color Correction** | Primary Color Correction | ✅ Fully Functional | Exposure, contrast, highlights, shadows, whites, blacks, temp, tint, saturation. | P1 | Maintain real-time preview and export fidelity. |
| **Color Correction** | 3-Way Color Wheels | ✅ Fully Functional | Lift (shadows), Gamma (midtones), Gain (highlights), and Offset active. | P1 | Ensure high-precision slider inputs and reset buttons. |
| **Color Correction** | Live Scopes | ✅ Fully Functional | Real-time Waveform, RGB Parade, Vectorscope, and Histogram rendering. | P2 | Optimize scope redraw to 30fps decoupled from playback thread. |
| **Color Correction** | LUT Support | ✅ Fully Functional | 3D Cube LUT parser and color mapping operational. | P2 | Add built-in LUT preview thumbnails. |
| **Audio Processing** | Multitrack Mixing | ✅ Fully Functional | WebAudio node graph with independent track and clip volume/gain controls. | P1 | Maintain perfect audio/video lipsync. |
| **Audio Processing** | Parametric EQ & Compressor| ✅ Fully Functional | Multi-band biquad filters, dynamics compressor, and limiter active. | P2 | Add interactive graphical EQ curve display. |
| **Audio Processing** | Waveform Visualization | ✅ Fully Functional | Mono downsampled audio peaks visualized on audio tracks. | P2 | Add background worker caching for long audio files. |
| **Transitions & FX** | Transitions Library | ✅ Fully Functional | Cross dissolve, dip to black/white, wipes, push, slide, zoom, and blur. | P2 | Support drag-and-drop transition placement directly onto cuts. |
| **Transitions & FX** | Video Effects Library | ✅ Fully Functional | Gaussian blur, sharpen, glow, noise, mosaic, vignette, and color looks. | P2 | Non-destructive effect stacking and reordering in Inspector. |
| **Keyframing** | Parameter Animation | ✅ Fully Functional | Keyframing for transform, opacity, volume, and effect properties. | P2 | Add visual Bezier curve graph editor in Effect Controls. |
| **Text & Graphics** | Vector Titles & Text | ✅ Fully Functional | Typography engine with font selection, weight, size, color, stroke, shadow. | P1 | Add text alignment guides and lower-third animated templates. |
| **Subtitles** | SRT/VTT Import & Export | ✅ Fully Functional | Timecoded subtitle tracks with styling and export to .srt/.vtt files. | P2 | Provide automated speech-to-text transcription via Whisper/STT. |
| **Export & Render** | WebCodecs / MediaRecorder| ✅ Fully Functional | Multi-format rendering (MP4, WebM) at customizable resolutions/bitrates. | P0 | Ensure queueing, remaining time estimation, and cancellation. |
| **AI Tools** | Natural Language Commands | ✅ Fully Functional | Natural language editing assistant executes real timeline split/fade/cuts. | P3 | Add safety confirmation before destructive multi-clip AI actions. |
| **Workspaces** | Presets & Custom Layouts | ✅ Fully Functional | Editing, Assembly, Color, Audio, Effects, Graphics presets active. | P1 | Add draggable docking splitters between main panel regions. |
