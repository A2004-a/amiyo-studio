#!/usr/bin/env node

/**
 * Amiyo Studio CLI
 * Zero-dependency local web server & browser launcher.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const pkgPath = path.join(rootDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// Parse CLI flags
const args = process.argv.slice(2);
let port = 3000;
let autoOpen = true;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '-p' || arg === '--port') {
    port = parseInt(args[++i], 10) || 3000;
  } else if (arg === '--no-open') {
    autoOpen = false;
  } else if (arg === '-v' || arg === '--version') {
    console.log(`v${pkg.version}`);
    process.exit(0);
  } else if (arg === '-h' || arg === '--help') {
    console.log(`
🎬 Amiyo Studio CLI v${pkg.version}

Usage:
  npx github:A2004-a/amiyo-studio [options]
  amiyo-studio [options]
  npm start

Options:
  -p, --port <number>   Port to listen on (default: 3000)
  --no-open             Do not automatically open the browser
  -v, --version         Show version
  -h, --help            Show this help message
`);
    process.exit(0);
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.wasm': 'application/wasm'
};

function getNetworkAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

function openBrowser(url) {
  const platform = process.platform;
  let cmd;
  if (platform === 'win32') {
    cmd = `start "" "${url}"`;
  } else if (platform === 'darwin') {
    cmd = `open "${url}"`;
  } else {
    cmd = `xdg-open "${url}"`;
  }
  exec(cmd, () => {});
}

function startServer(initialPort) {
  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/') {
      reqPath = '/index.html';
    }

    const safePath = path.normalize(path.join(rootDir, reqPath));
    if (!safePath.startsWith(rootDir)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      return res.end('403 Forbidden');
    }

    fs.stat(safePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404 Not Found');
      }

      const ext = path.extname(safePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stats.size,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      });

      const stream = fs.createReadStream(safePath);
      stream.pipe(res);
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${initialPort} is in use, trying ${initialPort + 1}...`);
      startServer(initialPort + 1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  server.listen(initialPort, () => {
    const netAddr = getNetworkAddress();
    const localUrl = `http://localhost:${initialPort}`;
    const networkUrl = netAddr ? `http://${netAddr}:${initialPort}` : null;

    console.log(`
=============================================================
             🎬 Amiyo Studio - In-Browser Video Editor
=============================================================
  ✓ Local:   ${localUrl}
  ${networkUrl ? `✓ Network: ${networkUrl}\n` : ''}  ✓ Editor:  ${localUrl}/editor.html

  Press Ctrl+C to stop the server
=============================================================
`);

    if (autoOpen) {
      openBrowser(localUrl);
    }
  });
}

startServer(port);

