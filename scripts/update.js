#!/usr/bin/env node

/**
 * Amiyo Studio Updater
 * Automatically updates existing installation to the latest version from GitHub.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const pkgPath = path.join(rootDir, 'package.json');
let currentVersion = '1.0.0';
try {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  currentVersion = pkg.version || '1.0.0';
} catch (_) { }

console.log(`
       ▲
      /█\\
     /███\\        ▶  AMIYO STUDIO UPDATER
    /██ █ \\          Checking for updates & upgrading...
   /███████\\         Current installed version: v${currentVersion}
  /███   ███\\
 ═════════════
=============================================================
`);

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'AmiyoStudio-Updater' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchJson(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function runUpdate() {
  console.log('[1/4] Connecting to GitHub to check latest release...');
  const remotePkgUrl = 'https://raw.githubusercontent.com/A2004-a/amiyo-studio/main/package.json';
  let remoteVersion = currentVersion;
  try {
    const remotePkg = await fetchJson(remotePkgUrl);
    remoteVersion = remotePkg.version || currentVersion;
    console.log(`  ✓ Latest available version: v${remoteVersion}`);
  } catch (err) {
    console.log(`  ℹ Could not fetch remote metadata (${err.message}). Proceeding with direct branch pull...`);
  }

  console.log('\n[2/4] Pulling latest code and assets...');
  let gitSuccess = false;
  if (fs.existsSync(path.join(rootDir, '.git'))) {
    try {
      console.log('  Executing: git pull --rebase origin main');
      execSync('git pull --rebase origin main', { cwd: rootDir, stdio: 'inherit' });
      gitSuccess = true;
    } catch (e) {
      console.log('  Git pull encountered a conflict or error. Falling back to clean archive sync...');
    }
  }

  if (!gitSuccess) {
    console.log('  Downloading clean release archive from GitHub...');
    const zipUrl = 'https://github.com/A2004-a/amiyo-studio/archive/refs/heads/main.zip';
    const os = require('os');
    const tempZip = path.join(os.tmpdir(), 'amiyo_latest_update.zip');
    const extractDir = path.join(os.tmpdir(), 'amiyo_extract_update');

    if (process.platform === 'win32') {
      execSync(`powershell -NoProfile -Command "Invoke-WebRequest -Uri '${zipUrl}' -OutFile '${tempZip}' -UseBasicParsing; Expand-Archive -Path '${tempZip}' -DestinationPath '${extractDir}' -Force; Copy-Item -Path '${extractDir}\\amiyo-studio-main\\*' -Destination '${rootDir}' -Recurse -Force; Remove-Item '${tempZip}' -Force -ErrorAction SilentlyContinue; Remove-Item '${extractDir}' -Recurse -Force -ErrorAction SilentlyContinue"`, { stdio: 'inherit' });
    } else {
      execSync(`curl -fsSL "${zipUrl}" -o "${tempZip}" && unzip -q -o "${tempZip}" -d "${extractDir}" && cp -rf "${extractDir}"/amiyo-studio-main/* "${rootDir}"/ && rm -rf "${tempZip}" "${extractDir}"`, { stdio: 'inherit' });
    }
    console.log('  ✓ Latest files unpacked and updated successfully!');
  }

  console.log('\n[3/4] Syncing Android and web resources...');
  const syncScript = path.join(rootDir, 'scripts', 'sync-android.js');
  if (fs.existsSync(syncScript)) {
    try {
      require('./sync-android.js');
    } catch (_) { }
  }

  console.log('\n[4/4] Updating global terminal commands...');
  const binDir = path.join(rootDir, 'bin');
  if (process.platform === 'win32') {
    const appDataNpm = path.join(process.env.APPDATA || '', 'npm');
    if (fs.existsSync(appDataNpm)) {
      try {
        fs.copyFileSync(path.join(binDir, 'amiyo.cmd'), path.join(appDataNpm, 'amiyo.cmd'));
        fs.copyFileSync(path.join(binDir, 'amiyo.ps1'), path.join(appDataNpm, 'amiyo.ps1'));
      } catch (_) { }
    }
  }

  console.log(`
=============================================================
  🎉 UPDATE COMPLETED SUCCESSFULLY!
=============================================================
  ✓ Installed Version: v${remoteVersion}
  ✓ Workspace: ${rootDir}
  ✓ New 3D Branding, NLE Features, and Fixes are Active!

To open Amiyo Studio now, run:
  amiyo
=============================================================
`);
}

runUpdate().catch(err => {
  console.error('\nUpdate failed:', err.message);
  process.exit(1);
});
