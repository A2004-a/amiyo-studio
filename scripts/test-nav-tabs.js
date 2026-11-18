const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png'
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
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cdpPort = 16000 + Math.floor(Math.random() * 3000);
  const userDataDir = path.join(require('os').tmpdir(), 'chrome-diag-nav-' + Date.now());
  if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${userDataDir}`,
    '--window-size=1200,700',
    `http://127.0.0.1:${port}/index.html`
  ]);

  let targetsRes = null;
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${cdpPort}/json`);
      if (res.ok) { targetsRes = res; break; }
    } catch (_) {}
    await new Promise(r => setTimeout(r, 200));
  }
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];

  let ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

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
  await new Promise(r => setTimeout(r, 1200));
  await send('Runtime.evaluate', { expression: 'const b = document.getElementById("amBoot"); if (b) b.remove();' });

  async function evalCode(expression) {
    const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return res.result && res.result.result ? res.result.result.value : null;
  }

  const panels = [
    'media', 'text', 'stickers', 'audio', 'captions', 'transitions',
    'filters', 'color', 'effects', 'animations', 'brand', 'record',
    'ai', 'stock', 'elements', 'templates', 'multicam'
  ];

  const results = {};
  for (const p of panels) {
    const res = await evalCode(`(async () => {
      const btn = document.querySelector('.navbtn[data-panel="${p}"]');
      if (btn) btn.click();
      await new Promise(r => setTimeout(r, 250));
      const lp = document.getElementById('leftPanel');
      const nav = document.getElementById('nav');
      return {
        clicked: !!btn,
        activePanel: window.activePanel,
        navHasOpen: nav ? nav.classList.contains('t3-open') : false,
        childCount: lp ? lp.children.length : 0,
        textSnippet: lp ? lp.innerText.slice(0, 100).replace(/\\n/g, ' ') : ''
      };
    })()`);
    results[p] = res;
  }

  console.log('Panels test results:\n', JSON.stringify(results, null, 2));

  // Take screenshot of Text panel
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const artDir = path.resolve('C:\\Users\\amiyo garai\\.gemini\\antigravity\\brain\\ed134396-8aef-4305-bdf6-efee209c8adc');
  fs.writeFileSync(path.join(artDir, 'diagnose-text-panel.png'), Buffer.from(shot.result.data, 'base64'));

  ws.close();
  chromeProc.kill();
  server.close();
}

main().catch(console.error);
