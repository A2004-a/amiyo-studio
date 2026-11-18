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
  const cdpPort = 15000 + Math.floor(Math.random() * 4000);
  const userDataDir = path.join(require('os').tmpdir(), 'chrome-diag-css-' + Date.now());
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

  // Set Premiere layout and open Audio panel
  const info = await evalCode(`(async () => {
    if (typeof window.setProfile === 'function') window.setProfile('premiere');
    const audioBtn = document.querySelector('.navbtn[data-panel="audio"]');
    if (audioBtn) audioBtn.click();
    await new Promise(r => setTimeout(r, 600));

    const lp = document.getElementById('leftPanel');
    const nr = document.getElementById('nrRoot');
    const au = document.getElementById('auList');
    
    function getStyles(el) {
      if (!el) return null;
      const s = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName,
        id: el.id,
        className: el.className,
        position: s.position,
        top: s.top,
        height: s.height,
        display: s.display,
        flex: s.flex,
        overflow: s.overflow,
        zIndex: s.zIndex,
        rect: { x: r.x, y: r.y, width: r.width, height: r.height }
      };
    }

    const firstRow = au ? au.querySelector('.au-row') : null;

    return {
      lp: getStyles(lp),
      nr: getStyles(nr),
      au: getStyles(au),
      firstRow: getStyles(firstRow)
    };
  })()`);

  console.log('Premiere Audio Styles:', JSON.stringify(info, null, 2));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const artDir = path.resolve('C:\\Users\\amiyo garai\\.gemini\\antigravity\\brain\\ed134396-8aef-4305-bdf6-efee209c8adc');
  fs.writeFileSync(path.join(artDir, 'diagnose-premiere-audio.png'), Buffer.from(shot.result.data, 'base64'));

  ws.close();
  chromeProc.kill();
  server.close();
}

main().catch(console.error);
