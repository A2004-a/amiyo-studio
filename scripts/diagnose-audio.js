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
  const cdpPort = 14000 + Math.floor(Math.random() * 5000);
  const userDataDir = path.join(require('os').tmpdir(), 'chrome-diag-audio-' + Date.now());
  if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${userDataDir}`,
    '--window-size=1600,900',
    `http://127.0.0.1:${port}/index.html`
  ]);

  let targetsRes = null;
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${cdpPort}/json`);
      if (res.ok) {
        targetsRes = res;
        break;
      }
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

  await new Promise(r => setTimeout(r, 1500));
  await send('Runtime.evaluate', { expression: 'const b = document.getElementById("amBoot"); if (b) b.remove();' });

  async function evalCode(expression) {
    const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return res.result && res.result.result ? res.result.result.value : null;
  }

  // Click Audio tab
  const audioInfo = await evalCode(`(async () => {
    const audioBtn = document.querySelector('.navbtn[data-panel="audio"]');
    if (audioBtn) audioBtn.click();
    await new Promise(r => setTimeout(r, 500));
    const lp = document.getElementById('leftPanel');
    const nrRoot = document.getElementById('nrRoot');
    const auList = document.getElementById('auList');
    
    // Check computed styles and bounding rects
    const nrRect = nrRoot ? nrRoot.getBoundingClientRect() : null;
    const auRect = auList ? auList.getBoundingClientRect() : null;
    const lpRect = lp ? lp.getBoundingClientRect() : null;

    return {
      activePanel: window.activePanel,
      lpHTML: lp ? lp.innerHTML.slice(0, 500) : null,
      children: lp ? Array.from(lp.children).map(c => ({
        id: c.id,
        className: c.className,
        tag: c.tagName,
        rect: { top: c.offsetTop, height: c.offsetHeight },
        position: window.getComputedStyle(c).position
      })) : [],
      nrRect,
      auRect,
      lpRect
    };
  })()`);

  console.log('Audio Info:', JSON.stringify(audioInfo, null, 2));

  // Take screenshot of audio panel
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const artDir = path.resolve('C:\\Users\\amiyo garai\\.gemini\\antigravity\\brain\\ed134396-8aef-4305-bdf6-efee209c8adc');
  fs.writeFileSync(path.join(artDir, 'diagnose-audio-panel.png'), Buffer.from(shot.result.data, 'base64'));

  ws.close();
  chromeProc.kill();
  server.close();
}

main().catch(console.error);
