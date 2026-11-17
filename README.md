<p align="center">
  <img src="assets/icons/logo.svg" width="96" height="96" alt="Amiyo Studio Logo"/>
</p>

<h1 align="center">Amiyo Studio</h1>

<p align="center">
  <strong>Private, High-Performance, In-Browser Multi-Track Video & Audio Editor</strong>
</p>

<p align="center">
  <a href="https://github.com/A2004-a/amiyo-studio/actions"><img src="https://img.shields.io/badge/build-passing-brightgreen.svg" alt="Build Status"/></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"/></a>
  <img src="https://img.shields.io/badge/PWA-offline--capable-orange.svg" alt="PWA Ready"/>
  <img src="https://img.shields.io/badge/WebCodecs-hardware--accelerated-purple.svg" alt="WebCodecs"/>
  <img src="https://img.shields.io/badge/privacy-100%25%20on--device-success.svg" alt="Privacy First"/>
</p>

---

## 🌟 Overview

**Amiyo Studio** is a full-featured, multi-track video and audio editing suite that runs **100% inside modern web browsers** and as **native desktop applications** for Windows, Linux, and macOS. Your media never leaves your device: all decoding, timeline manipulation, effects processing, audio DSP, and exporting are computed locally on your hardware.

Originally bundled into a single massive 9.2 MB file containing 93,700+ lines, this repository features a high-performance **modular architecture** that eliminates DOM churn, accelerates startup to milliseconds, and organizes code into dedicated functional modules.

---

## 📦 Downloads & Installers (All Platforms — Step-by-Step)

Choose your platform to download Amiyo Studio directly or install via a single terminal command:

### 1. 🪟 Windows (Windows 11, 10, 8.1, 7)
- **64-bit Installer (x64)**: [⬇️ **Download Amiyo-Studio-win-x64.exe**](https://github.com/A2004-a/amiyo-studio/releases/download/v0.0.1/Amiyo-Studio-win-x64.exe)
- **32-bit Installer (x86 / ia32)**: [⬇️ **Download Amiyo-Studio-win-ia32.exe**](https://github.com/A2004-a/amiyo-studio/releases/download/v0.0.1/Amiyo-Studio-win-ia32.exe)
- **Portable ZIP (Zero Installation)**: [⬇️ **Download Amiyo-Studio-Source.zip**](https://github.com/A2004-a/amiyo-studio/archive/refs/heads/main.zip) *(Extract and double-click `index.html` to run instantly!)*
- **⚡ 1-Line PowerShell Auto-Installer (Recommended)**:
  ```powershell
  irm https://raw.githubusercontent.com/A2004-a/amiyo-studio/main/install.ps1?v=0.0.1 | iex
  ```
- **💻 1-Line Command Prompt (CMD)**:
  ```cmd
  curl -fsSL https://raw.githubusercontent.com/A2004-a/amiyo-studio/main/install.cmd -o "%TEMP%\amiyo.cmd" && call "%TEMP%\amiyo.cmd"
  ```

---

### 2. 🍎 macOS (Apple Silicon M1/M2/M3 & Intel)
- **Universal Disk Image (.dmg)**: [⬇️ **Download Amiyo-Studio-mac.dmg**](https://github.com/A2004-a/amiyo-studio/releases/download/v0.0.1/Amiyo-Studio-mac.dmg)
- **⚡ 1-Line Terminal (Bash/Zsh)**:
  ```bash
  curl -fsSL https://raw.githubusercontent.com/A2004-a/amiyo-studio/main/install.sh | bash
  ```

---

### 3. 🐧 Linux (Ubuntu, Debian, Fedora, Arch, etc.)
- **Universal 64-bit (.AppImage)**: [⬇️ **Download Amiyo-Studio-linux-x86_64.AppImage**](https://github.com/A2004-a/amiyo-studio/releases/download/v0.0.1/Amiyo-Studio-linux-x86_64.AppImage)
- **⚡ 1-Line Terminal (Bash)**:
  ```bash
  curl -fsSL https://raw.githubusercontent.com/A2004-a/amiyo-studio/main/install.sh | bash
  ```

---

### 4. 📱 Android (Phones, Tablets & Foldables)
- **Direct APK Package**: [⬇️ **Download Amiyo-Studio-android.apk**](https://github.com/A2004-a/amiyo-studio/releases/download/v0.0.1/Amiyo-Studio-android.apk)
- **Automatic 1-Command Build (Cross-Platform)**:
  ```bash
  npm run build:android
  ```
- **Manual Build from Source (Requires JDK 17 & Android SDK 34)**:
  - **Windows (PowerShell / CMD)**:
    ```cmd
    cd android
    gradlew.bat assembleDebug
    ```
  - **Linux / macOS (Bash / Zsh)**:
    ```bash
    cd android
    chmod +x gradlew
    ./gradlew assembleDebug
    ```
  > [!IMPORTANT]
  > Always use **Gradle 8.5** (`gradle-8.5-bin.zip` configured in `android/gradle/wrapper/gradle-wrapper.properties`). Do NOT set Gradle to 9.x, as Android Gradle Plugin (AGP) 8.2.2 requires Gradle 8.2–8.5.

---

### 5. 🌐 Web & Browser (Instant Run — No Download Needed)
- **Run with NPX**:
  ```bash
  npx github:A2004-a/amiyo-studio
  ```
- **Open in Browser**: Open `index.html` in Chrome, Edge, Brave, or Firefox. Works 100% offline with zero dependencies!

> [!TIP]
> All current and historical versions can be viewed on the **[GitHub Releases Page](https://github.com/A2004-a/amiyo-studio/releases)**.

---

## ✨ Features

- **🎬 Non-Linear Multi-Track Timeline**
  - Unlimited video, audio, title, and overlay tracks.
  - Real-time scrubbing with frame-accurate preview canvas.
  - Snapping, magnetic timeline, and ripple editing modes.
- **✂️ Professional Cut Suite**
  - Split clips at playhead (`S`).
  - Standard delete (`Del`) and ripple delete (`Shift + Del`).
  - Slip, slide, and extend edit tools.
- **🔊 Advanced Audio Lab**
  - Real-time multi-band parametric EQ and loudness radar.
  - AI-assisted vocal subtract / vocal isolation filters.
  - Time-stretching, pitch shifting, and FL-style sound tools.
  - Built-in LAME MP3 encoder for client-side offline audio export.
- **🎨 Color Grading & Range FX**
  - 3-way color balance, LUT filters, contrast, saturation, and curves.
  - Time-sliced Range FX engine for per-segment zoom, blur, and motion.
  - Transition shaders and clip badge overlays.
- **🖥️ Dual Professional Layout Modes**
  - **DaVinci Resolve Style**: Dedicated pages for Cut, Edit, Fusion, Fairlight, and Color.
  - **Filmora Style**: Streamlined single-window layout for rapid social content creation.
- **🤖 AI Provider Hub**
  - Unified interface for local and API-driven language and image models.
  - AI Image Studio, prompt enhancers, and subtitle auto-generation hooks.
- **⚡ WebCodecs Hardware Export**
  - Direct hardware-accelerated MP4/WebM encoding with frame-accurate canvas capture.
  - Lossless audio mixing and multi-channel rendering.
- **📱 PWA & Offline Support**
  - Installable as a native desktop or mobile PWA.
  - Local auto-save using IndexedDB. Works completely offline.

---

## 📂 Project Structure

```
amiyo-studio/
├── index.html                   # Primary application entry point (GitHub Pages ready)
├── editor.html                  # Standalone video editor entry point
├── sw.js                        # Offline Service Worker cache engine
├── install.ps1                  # Windows 1-line PowerShell installer & launcher
├── install.sh                   # macOS / Linux 1-line Bash installer & launcher
├── manifest.webmanifest         # PWA Web App Manifest
├── package.json                 # Project configuration, CLI bin & scripts
├── LICENSE                      # MIT Open Source License
├── README.md                    # Project documentation
├── .gitignore                   # Standard gitignore (excludes backups & temp files)
│
├── bin/
│   └── cli.js                   # Zero-dependency CLI web server & browser launcher
│
├── .github/
│   └── workflows/
│       ├── deploy.yml           # Automatic GitHub Pages CI/CD deployment
│       └── ci.yml               # Automated syntax & integrity validation
│
├── assets/
│   └── icons/
│       ├── icon-64.png          # 64x64 favicon
│       ├── icon-180.png         # 180x180 Apple touch icon
│       └── logo.svg             # Vector brand logo
│
├── css/
│   └── app.css                  # Unified stylesheet (378 style blocks in exact cascade order)
│
├── js/
│   ├── 01-core-guards.js        # Performance guards, event throttlers & idle management
│   ├── 02-ux3-system.js         # UX3 modern UI design system & build markers
│   ├── 03-editor-core.js        # Timeline engine, preview canvas, state & media library
│   ├── 04-editor-tools.js       # Cut suite, pro editing box, inspector & multi-track tools
│   ├── 05-ai-features.js        # AI Provider Hub, image studio & prompt tooling
│   ├── 06-range-fx.js           # Range FX engine, video effects, shaders & transitions
│   ├── 07-storage-export.js     # PWA IndexedDB storage, auto-save & WebCodecs export engine
│   ├── 08-audio-lab.js          # Audio Lab, FL audio tools, MIDI, DSP filters & voice subtract
│   ├── 09-pro-davinci.js        # DaVinci pages (Cut, Edit, Fusion, Fairlight, Color), radar
│   ├── 10-filmora-opt.js        # Filmora UI layout, command palette, themes & keyframes
│   └── 11-screen-touch.js       # Responsive layout adapters, tablet/mobile touch controls
│
└── scripts/
    ├── validate.js              # Node.js syntax & integrity validation runner
    └── build.js                 # Project build runner & bundle statistics reporter
```

---

## 🚀 Terminal Commands & Windows Quick Start

### ⚡ 1-Line Setup & Smart Launcher
Run this single command in **Windows PowerShell**. It automatically detects if Amiyo Studio is already installed (desktop app or portable), sets up the global `amiyo` command across your system, and launches the app:

```powershell
irm https://raw.githubusercontent.com/A2004-a/amiyo-studio/main/install.ps1?v=0.0.1 | iex
```

> [!TIP]
> - **Already Installed?** Skips downloading and **directly opens** Amiyo Studio in under a second!
> - **New Computer?** Automatically downloads the latest `v0.0.1` release, configures the terminal command, and launches.

**Windows Command Prompt (CMD):**
```cmd
curl -fsSL https://raw.githubusercontent.com/A2004-a/amiyo-studio/main/install.cmd -o "%TEMP%\amiyo.cmd" && call "%TEMP%\amiyo.cmd"
```

**macOS / Linux (Bash):**
```bash
curl -fsSL https://raw.githubusercontent.com/A2004-a/amiyo-studio/main/install.sh | bash
```

---

### 🎬 Everyday Terminal Commands (`amiyo`)
Once set up, launch Amiyo Studio anytime from **any terminal window** (PowerShell, CMD, Git Bash):

```bash
amiyo                 # Directly open Amiyo Studio
amiyo --version       # Show installed version (outputs: Amiyo Studio v0.0.1)
amiyo --help          # View all CLI options
amiyo -p 8080         # Start local server on custom port
```

---

### 🔍 Check Version Remotely (Without Installing)
Check the latest release version and your local installation status directly:

**Windows PowerShell:**
```powershell
irm https://raw.githubusercontent.com/A2004-a/amiyo-studio/main/version.ps1?v=0.0.1 | iex
```

**Windows Command Prompt (CMD):**
```cmd
curl -fsSL https://raw.githubusercontent.com/A2004-a/amiyo-studio/main/version.cmd -o "%TEMP%\v.cmd" && call "%TEMP%\v.cmd"
```

---

### 🌐 Instant Browser Run (No Installation Required)
Launch directly from GitHub into your browser without downloading files:
```bash
npx github:A2004-a/amiyo-studio
```

---

## 🌐 Deploy to GitHub Pages

This repository is **100% GitHub Pages ready** with automated GitHub Actions included:

1. Push this repository to your GitHub account:
   ```bash
   git init -b main
   git add .
   git commit -m "feat: initial commit of Amiyo Studio modular architecture"
   git remote add origin https://github.com/YOUR_USERNAME/amiyo-studio.git
   git push -u origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** > **Pages** (`https://github.com/A2004-a/amiyo-studio/settings/pages`).
   - Under **Build and deployment** > **Source**, select **GitHub Actions** (this resolves the red cross on `github-pages` deployments).
3. Every push to `main` will automatically validate integrity and deploy your live site!

---

## ⌨️ Essential Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Space` | Play / Pause playback |
| `S` | Split clip at current playhead position |
| `Del` | Delete selected clip |
| `Shift + Del` | Ripple delete selected clip (closes the gap) |
| `Ctrl + Z` / `Ctrl + Y` | Undo / Redo |
| `Ctrl + D` | Duplicate selected clip |
| `Shift + D` | Disable / Enable selected clip |
| `\` | Fit timeline to current viewport |
| `Alt + Scroll` | Zoom timeline centered around mouse pointer |
| `=` / `-` | Zoom in / Zoom out timeline |
| `Up` / `Down` | Jump to previous / next edit point |
| `M` | Add timeline marker |
| `D` | Select clip under playhead |
| `\`` (Backtick) | Maximize panel under mouse pointer |
| `Esc` | Close active dialog / modal |

---

## 🧪 Testing & Validation

Run the built-in integrity validator to ensure all 11 modules and stylesheets are free from syntax errors:

```bash
npm run validate
```

Generate bundle statistics:

```bash
npm run build
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

