# Contributing to Amiyo Studio

Thank you for your interest in contributing to Amiyo Studio! We welcome improvements, bug reports, and pull requests.

## Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/amiyogarai/amiyo-studio.git
   cd amiyo-studio
   ```

2. **Start a local development server:**
   ```bash
   npm start
   # or
   npx serve -l 3000 .
   ```
   Open `http://localhost:3000` in your web browser.

3. **Validate changes:**
   ```bash
   npm run validate
   ```

## Architecture & Code Organization

The application is structured for high browser performance and rapid loading:
- `index.html`: The HTML shell containing UI layout and data payloads.
- `css/app.css`: Unified stylesheet.
- `js/`: Modular JavaScript files split by functional area:
  - `01-core-guards.js`: Core performance guards, resize throttlers, and idle handlers.
  - `02-ux3-system.js`: Modern UI system and build markers.
  - `03-editor-core.js`: Timeline engine, preview canvas, state management, media library.
  - `04-editor-tools.js`: Razor, slip, slide, ripple delete, inspector.
  - `05-ai-features.js`: AI Provider Hub and generative tooling.
  - `06-range-fx.js`: Range FX engine, shaders, transitions, and clip badges.
  - `07-storage-export.js`: PWA IndexedDB storage, auto-save, WebCodecs export engine.
  - `08-audio-lab.js`: Audio lab, multi-band EQ, vocal isolation, DSP effects.
  - `09-pro-davinci.js`: DaVinci Resolve layout pages, loudness radar, speed zones.
  - `10-filmora-opt.js`: Filmora UI mode, command palette, theme customizer.
  - `11-screen-touch.js`: Responsive layout adapters and touch gestures.

## Submitting Pull Requests

1. Fork the repo and create your feature branch: `git checkout -b feature/my-feature`.
2. Ensure `npm run validate` passes with zero errors.
3. Commit your changes with clear, descriptive commit messages.
4. Push to your branch and open a Pull Request.

