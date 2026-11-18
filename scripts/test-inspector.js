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
  const userDataDir = path.join(require('os').tmpdir(), 'chrome-diag-insp-' + Date.now());
  if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${userDataDir}`,
    '--window-size=1366,768',
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
  await new Promise(r => ws.addEventListener('open', r, { once: true }));

  let msgId = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = msgId++;
    const handler = (e) => {
      const resp = JSON.parse(e.data);
      if (resp.id === id) {
        ws.removeEventListener('message', handler);
        if (resp.error) reject(resp.error);
        else resolve(resp.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await new Promise(r => setTimeout(r, 3000));

  // Check Inspector tabs and content
  const res1 = await send('Runtime.evaluate', {
    expression: `
      (function(){
        const tabs = Array.from(document.querySelectorAll('#ppInspTabs button')).map(b => ({
          t: b.dataset.t,
          text: b.textContent.trim(),
          display: getComputedStyle(b).display,
          ariaSelected: b.getAttribute('aria-selected')
        }));
        const emptyCard = document.querySelector('.inspector-empty');
        return {
          tabs,
          emptyCardText: emptyCard ? emptyCard.textContent.trim() : null,
          dockDisplay: document.getElementById('pp6Dock') ? getComputedStyle(document.getElementById('pp6Dock')).display : null,
          inspDisplay: document.getElementById('inspector') ? getComputedStyle(document.getElementById('inspector')).display : null
        };
      })()
    `,
    returnByValue: true
  });
  console.log("Inspector initial state:", JSON.stringify(res1.result.value, null, 2));

  // Click Essential Graphics tab
  const res2 = await send('Runtime.evaluate', {
    expression: `
      (function(){
        const b = document.querySelector('#ppInspTabs button[data-t="pp6gfx"]');
        if (b) b.click();
        return {
          clicked: !!b,
          dockDisplay: document.getElementById('pp6Dock') ? getComputedStyle(document.getElementById('pp6Dock')).display : null,
          dockHTML: document.getElementById('pp6Dock') ? document.getElementById('pp6Dock').innerHTML.slice(0, 160) : null
        };
      })()
    `,
    returnByValue: true
  });
  console.log("After clicking Essential Graphics:", JSON.stringify(res2.result.value, null, 2));

  // Screenshot of inspector area
  const ss = await send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 1060, y: 48, width: 300, height: 600, scale: 1 }
  });
  fs.writeFileSync('diagnose-inspector.png', Buffer.from(ss.data, 'base64'));
  console.log("Inspector screenshot saved to diagnose-inspector.png");

  ws.close();
  chromeProc.kill();
  server.close();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
