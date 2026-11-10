const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const destDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(child => {
      copyRecursive(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Sync core entry files
['index.html', 'editor.html', 'manifest.webmanifest', 'sw.js'].forEach(file => {
  const src = path.join(rootDir, file);
  const dest = path.join(destDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Synced ${file} -> Android assets`);
  }
});

// Sync directories
['css', 'js', 'assets'].forEach(dir => {
  const src = path.join(rootDir, dir);
  const dest = path.join(destDir, dir);
  copyRecursive(src, dest);
  console.log(`Synced ${dir}/ -> Android assets`);
});

console.log('Successfully synced all modular web assets to Android app!');
