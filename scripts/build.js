#!/usr/bin/env node

/**
 * Build and statistics script for Amiyo Studio
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');

console.log('Building and verifying Amiyo Studio...\n');

// 1. Run validator
try {
  execSync(`node "${path.join(__dirname, 'validate.js')}"`, { stdio: 'inherit' });
} catch (e) {
  console.error('Build aborted due to validation failure.');
  process.exit(1);
}

// 2. Compute project statistics
console.log('\nProject Statistics:');
const htmlSize = fs.statSync(path.join(rootDir, 'index.html')).size;
const cssSize = fs.statSync(path.join(rootDir, 'css', 'app.css')).size;

let jsTotal = 0;
const jsFiles = fs.readdirSync(path.join(rootDir, 'js')).filter(f => f.endsWith('.js'));
jsFiles.forEach(f => {
  jsTotal += fs.statSync(path.join(rootDir, 'js', f)).size;
});

console.log(`- HTML Entry (index.html): ${(htmlSize / 1024).toFixed(1)} KB`);
console.log(`- Stylesheet (css/app.css): ${(cssSize / 1024).toFixed(1)} KB`);
console.log(`- JavaScript Modules (${jsFiles.length} files): ${(jsTotal / 1024 / 1024).toFixed(2)} MB`);
console.log(`- Total App Bundle Size: ${((htmlSize + cssSize + jsTotal) / 1024 / 1024).toFixed(2)} MB`);
console.log('\n✓ Ready for GitHub and GitHub Pages deployment!');
