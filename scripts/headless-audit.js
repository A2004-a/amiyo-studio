const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(rootDir, reqPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

async function main() {
  await new Promise(r => server.listen(48921, '127.0.0.1', r));
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cdpPort = 9555;
  const userDataDir = path.join(require('os').tmpdir(), 'chrome-audit-' + Date.now());
  if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${userDataDir}`,
    '--window-size=1600,900',
    'http://127.0.0.1:48921/index.html'
  ]);

  let targetsRes = null;
  for (let i = 0; i < 20; i++) {
    try {
      targetsRes = await fetch(`http://127.0.0.1:${cdpPort}/json`);
      if (targetsRes.ok) break;
    } catch (_) {}
    await new Promise(r => setTimeout(r, 300));
  }
  if (!targetsRes || !targetsRes.ok) throw new Error('Chrome remote debugging did not respond');
  const targets = await targetsRes.json();
  let ws;
  try {
    const pageTarget = targets.find(t => t.type === 'page');

    ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let id = 1;
    const callbacks = new Map();
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.id && callbacks.has(data.id)) {
        callbacks.get(data.id)(data);
        callbacks.delete(data.id);
      }
    };

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const curId = id++;
        callbacks.set(curId, resolve);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    await send('Runtime.enable');
    await send('Page.enable');

    // Wait for boot to finish completely
    console.log('Waiting for boot...');
    for (let i = 0; i < 60; i++) {
      const state = await send('Runtime.evaluate', {
        expression: 'JSON.stringify({ booted: !!window.__amiyoBooted, hasBootCover: !!document.getElementById("amBoot") })',
        returnByValue: true
      });
      const val = state.result && state.result.result && JSON.parse(state.result.result.value || '{}');
      console.log(`Attempt ${i}:`, val);
      if (val && val.booted && !val.hasBootCover) {
        console.log(`Boot completed at attempt ${i}`);
        break;
      }
      await new Promise(r => setTimeout(r, 500));
    }

    async function evalCode(expression) {
      const res = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      return res.result && res.result.result ? res.result.result.value : null;
    }

    async function captureScreenshot(filepath) {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      if (res.result && res.result.data) {
        fs.writeFileSync(filepath, Buffer.from(res.result.data, 'base64'));
        console.log(`Saved screenshot to ${filepath}`);
      }
    }

    const info = await evalCode(`(() => {
      const canvas = document.getElementById('previewCanvas');
      const canvasShell = document.getElementById('canvasShell');
      const stage = document.querySelector('.preview-stage');
      const tracks = document.getElementById('tracks');
      const timelineScroll = document.getElementById('timelineScroll');
      const ruler = document.getElementById('ruler');
      const tl = document.querySelector('.timeline');
      const pw = document.querySelector('.preview-wrap');
      const center = document.querySelector('.center');
      
      const r = el => el ? {
        w: el.offsetWidth,
        h: el.offsetHeight,
        top: el.offsetTop,
        left: el.offsetLeft,
        rect: el.getBoundingClientRect(),
        display: getComputedStyle(el).display,
        visibility: getComputedStyle(el).visibility,
        opacity: getComputedStyle(el).opacity,
        overflow: getComputedStyle(el).overflow
      } : null;

      return {
        canvas: r(canvas),
        canvasShell: r(canvasShell),
        stage: r(stage),
        tracks: r(tracks),
        timelineScroll: r(timelineScroll),
        ruler: r(ruler),
        tl: r(tl),
        pw: r(pw),
        center: r(center),
        trackCount: tracks ? tracks.children.length : 0,
        tracksInnerHtmlSnippet: tracks ? tracks.innerHTML.slice(0, 300) : ''
      };
    })()`);

    console.log('Post-boot layout info:', JSON.stringify(info, null, 2));

    const artifactPath = path.join(
      'C:\\Users\\amiyo garai\\.gemini\\antigravity\\brain\\ed134396-8aef-4305-bdf6-efee209c8adc',
      'post-boot-screenshot.png'
    );
    await captureScreenshot(artifactPath);

  } catch (err) {
    console.error('Audit failed:', err);
  } finally {
    if (ws) ws.close();
    chromeProc.kill();
    server.close();
  }
}

main();
