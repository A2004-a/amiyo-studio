#!/usr/bin/env node

/**
 * Validation script for Amiyo Studio
 * Verifies that all CSS, JS modules, HTML files, and assets are present and syntactically valid.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = path.resolve(__dirname, '..');
let hasErrors = false;

function check(label, fn) {
  try {
    const result = fn();
    if (result === false) {
      console.error(`  ✗ [FAIL] ${label}`);
      hasErrors = true;
    } else {
      console.log(`  ✓ [PASS] ${label}`);
    }
  } catch (err) {
    console.error(`  ✗ [FAIL] ${label}: ${err.message}`);
    hasErrors = true;
  }
}

console.log('========================================');
console.log('   Amiyo Studio - Integrity Validator   ');
console.log('========================================\n');

console.log('1. Checking core files...');
check('index.html exists and is non-empty', () => {
  const p = path.join(rootDir, 'index.html');
  return fs.existsSync(p) && fs.statSync(p).size > 1000;
});

check('editor.html exists and is non-empty', () => {
  const p = path.join(rootDir, 'editor.html');
  return fs.existsSync(p) && fs.statSync(p).size > 1000;
});

check('css/app.css exists and is non-empty', () => {
  const p = path.join(rootDir, 'css', 'app.css');
  return fs.existsSync(p) && fs.statSync(p).size > 100000;
});

check('manifest.webmanifest exists and is valid JSON', () => {
  const p = path.join(rootDir, 'manifest.webmanifest');
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  return data.name && data.icons && data.icons.length > 0;
});

check('assets/icons/icon-64.png and icon-180.png exist', () => {
  return fs.existsSync(path.join(rootDir, 'assets', 'icons', 'icon-64.png')) &&
         fs.existsSync(path.join(rootDir, 'assets', 'icons', 'icon-180.png'));
});

check('sw.js exists and is syntactically valid', () => {
  const p = path.join(rootDir, 'sw.js');
  if (!fs.existsSync(p)) return false;
  const code = fs.readFileSync(p, 'utf8');
  new vm.Script(code);
  return true;
});

check('bin/cli.js exists and is syntactically valid', () => {
  const p = path.join(rootDir, 'bin', 'cli.js');
  if (!fs.existsSync(p)) return false;
  const code = fs.readFileSync(p, 'utf8');
  new vm.Script(code);
  return true;
});

check('Terminal installers (install.ps1, install.sh) exist', () => {
  return fs.existsSync(path.join(rootDir, 'install.ps1')) &&
         fs.existsSync(path.join(rootDir, 'install.sh'));
});

console.log('\n2. Verifying JavaScript modules...');
const jsDir = path.join(rootDir, 'js');
const expectedModules = [
  '01-core-guards.js',
  '02-ux3-system.js',
  '03-editor-core.js',
  '04-editor-tools.js',
  '05-ai-features.js',
  '06-range-fx.js',
  '07-storage-export.js',
  '08-audio-lab.js',
  '09-pro-davinci.js',
  '10-filmora-opt.js',
  '11-screen-touch.js'
];

expectedModules.forEach(mod => {
  check(`Module js/${mod} syntax verification`, () => {
    const p = path.join(jsDir, mod);
    if (!fs.existsSync(p)) throw new Error(`File not found: ${p}`);
    const code = fs.readFileSync(p, 'utf8');
    new vm.Script(code, { filename: mod });
    return true;
  });
});

console.log('\n3. Verifying HTML script and style links...');
check('index.html references all required modules and stylesheets', () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  if (!html.includes('css/app.css')) throw new Error('Missing link to css/app.css');
  expectedModules.forEach(mod => {
    if (!html.includes(`js/${mod}`)) throw new Error(`Missing script tag for js/${mod}`);
  });
  if (!html.includes('id="amiyo-setup-stub-src"')) throw new Error('Missing amiyo-setup-stub-src payload');
  if (!html.includes('id="amiyo-lame-src"')) throw new Error('Missing amiyo-lame-src payload');
  return true;
});

console.log('\n========================================');
if (hasErrors) {
  console.error('Validation FAILED. Please review the errors above.');
  process.exit(1);
} else {
  console.log('All integrity checks PASSED successfully!');
  console.log('========================================');
  process.exit(0);
}

