# Amiyo Studio - Bug Tracker & Remediation Log

This document tracks all identified bugs, root causes, applied remediations, and verification tests.

---

### Bug #001: Android Gradle Wrapper HTTP 404 & Malformed Distribution URL
- **Severity**: P0 (Build Blocker for Android APK)
- **Component**: `android/gradle/wrapper/gradle-wrapper.properties`
- **Root Cause**: `distributionUrl` had been modified to point to `gradle-9.7.1-bin.zip`. Gradle 9.7 does not exist on `services.gradle.org`, triggering an immediate 404 failure during `./gradlew assembleDebug` and causing editor squiggly errors. Furthermore, Android Gradle Plugin `8.2.2` requires Gradle `8.2` through `8.5`.
- **Fix Applied**: Reverted `distributionUrl` to `https\://services.gradle.org/distributions/gradle-8.5-bin.zip` and restored clean Gradle 8.5 wrapper binaries.
- **Verification**: `npm test` runs automated check in `scripts/validate.js` verifying compatibility with AGP 8.2.2.
- **Status**: ✅ **VERIFIED & FIXED** (Commit `b66481c`).

---

### Bug #002: Headless & Non-Browser `location` ReferenceError in Core Performance Guards
- **Severity**: P1 (Node / Test Runner Crash)
- **Component**: `js/01-core-guards.js` (Line 1054)
- **Root Cause**: Script 36 (`amiyo-pwa-head`) evaluated bare `location.protocol` without verifying if `location` exists in the evaluation context. When loaded in non-browser or worker contexts (e.g., automated unit test runners, build pipelines), this threw `ReferenceError: location is not defined`.
- **Fix Applied**: Guarded check with `typeof location === "undefined" || !/^https?:$/.test(location.protocol)`.
- **Verification**: Headless execution in `scripts/comprehensive-audit.js` now evaluates `01-core-guards.js` with zero errors.
- **Status**: ✅ **VERIFIED & FIXED** (Commit `5136e6c`).

---

### Bug #003: PowerShell Restricted Execution Policy on Clean Windows Systems
- **Severity**: P1 (CLI Startup Issue on Fresh Laptops)
- **Component**: `install.ps1`, `bin/amiyo.ps1`
- **Root Cause**: On newly initialized Windows 10/11 machines (such as the `asus` laptop tested by user), the system default PowerShell `ExecutionPolicy` is `Restricted`, which blocks execution of `.ps1` files.
- **Fix Applied**:
  1. Automatically runs `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` in `install.ps1` (non-elevated).
  2. Wraps the global session function and profile launchers in `powershell.exe -NoProfile -ExecutionPolicy Bypass -File`.
  3. Provides fallthrough to `amiyo.cmd` batch script, which is immune to PowerShell execution policies.
- **Verification**: Verified via `scripts/verify-scripts.js` and AST parser across CMD and PowerShell environments.
- **Status**: ✅ **VERIFIED & FIXED** (Commit `906fe1b`).

---

### Bug #004: Command Prompt Missing PATH Registration in Environments Without NPM
- **Severity**: P1 (CMD Terminal Availability)
- **Component**: `install.cmd`
- **Root Cause**: `install.cmd` initially copied `amiyo.cmd` only into `%APPDATA%\npm` and `%LOCALAPPDATA%\Microsoft\WindowsApps`. If Node/npm was not installed, neither directory was in `%PATH%`, preventing `amiyo` from running in CMD.
- **Fix Applied**: Added `%USERPROFILE%\bin` directory creation and registered it directly into the Windows User `Path` registry environment (`HKCU\Environment\Path`).
- **Verification**: Tested in CMD subshell; `amiyo --version` prints `Amiyo Studio v0.0.1`.
- **Status**: ✅ **VERIFIED & FIXED** (Commit `b66481c`).

---

### Bug #005: Fastly CDN Stale Cache on GitHub Raw Installation URLs
- **Severity**: P2 (Deployment Staleness)
- **Component**: `README.md`, `version.ps1`
- **Root Cause**: Fastly edge cache on `raw.githubusercontent.com` caches raw files for up to 300 seconds. Users running the one-line installer immediately after a commit received cached, older scripts.
- **Fix Applied**: Appended query string version tag `?v=0.0.1` to all one-line installer URLs in `README.md` and `version.ps1` to force immediate cache bypass.
- **Verification**: HTTP requests with query strings confirmed to return fresh commit content.
- **Status**: ✅ **VERIFIED & FIXED** (Commit `906fe1b`).
