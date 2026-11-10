const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const androidDir = path.join(rootDir, 'android');
const distDir = path.join(rootDir, 'dist');

console.log('--- Step 1: Syncing web assets into Android project ---');
require('./sync-android.js');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 2. Ensure SDK path and local.properties
const sdkCandidates = [
  process.env.ANDROID_HOME,
  process.env.ANDROID_SDK_ROOT,
  '/usr/local/lib/android/sdk',
  '/opt/android/sdk',
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk') : null
].filter(Boolean);

let foundSdk = sdkCandidates.find(p => fs.existsSync(p));
if (!foundSdk) {
  foundSdk = process.env.ANDROID_HOME || '/usr/local/lib/android/sdk';
}
console.log('Using Android SDK path:', foundSdk);

const localPropertiesPath = path.join(androidDir, 'local.properties');
// Normalize path for Gradle (forward slashes)
const sdkDirEscaped = foundSdk.replace(/\\/g, '/');
fs.writeFileSync(localPropertiesPath, `sdk.dir=${sdkDirEscaped}\n`, { encoding: 'utf8' });
console.log(`Created local.properties with sdk.dir=${sdkDirEscaped}`);

// 3. Normalize gradlew line endings and permissions
const gradlewPath = path.join(androidDir, 'gradlew');
if (fs.existsSync(gradlewPath)) {
  const content = fs.readFileSync(gradlewPath, 'utf8').replace(/\r\n/g, '\n');
  fs.writeFileSync(gradlewPath, content, { encoding: 'utf8' });
  try {
    fs.chmodSync(gradlewPath, 0o755);
  } catch (e) {
    console.log('chmod warning:', e.message);
  }
}

console.log('--- Step 2: Running Gradle assembleDebug ---');
const isWin = process.platform === 'win32';
const gradlewCmd = isWin ? 'gradlew.bat assembleDebug --no-daemon --stacktrace' : 'bash ./gradlew assembleDebug --no-daemon --stacktrace';

console.log(`Executing: ${gradlewCmd} in ${androidDir}`);

const buildEnv = Object.assign({}, process.env, {
  ANDROID_HOME: foundSdk,
  ANDROID_SDK_ROOT: foundSdk
});

try {
  execSync(gradlewCmd, {
    cwd: androidDir,
    stdio: 'inherit',
    env: buildEnv
  });
} catch (err) {
  console.error('Gradle execution failed with error:', err.message);
  if (err.stdout) console.log(err.stdout.toString());
  if (err.stderr) console.error(err.stderr.toString());
  process.exit(1);
}

console.log('--- Step 3: Locating generated APK ---');
function findApks(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(findApks(fullPath));
    } else if (file.endsWith('.apk')) {
      results.push(fullPath);
    }
  }
  return results;
}

const apkFiles = findApks(path.join(androidDir, 'app', 'build', 'outputs', 'apk'));
console.log('Found APKs:', apkFiles);

if (apkFiles.length === 0) {
  console.error('ERROR: No APK files found in app/build/outputs/apk');
  process.exit(1);
}

const targetApk = path.join(distDir, 'Amiyo-Studio-android.apk');
fs.copyFileSync(apkFiles[0], targetApk);
const sizeMb = (fs.statSync(targetApk).size / 1024 / 1024).toFixed(2);
console.log(`SUCCESS: Copied ${apkFiles[0]} -> ${targetApk} (${sizeMb} MB)`);
