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
  const userDataDir = path.join(require('os').tmpdir(), 'chrome-diag-audit-' + Date.now());
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
  await new Promise(r => setTimeout(r, 2500));

  // Check full layout across workspace
  const layoutAudit = await send('Runtime.evaluate', {
    expression: `
      (function(){
        const app = document.querySelector('.app');
        const topbar = document.querySelector('.topbar');
        const main = document.getElementById('amiyoMain');
        const sidebar = document.querySelector('.sidebar');
        const center = document.querySelector('.center');
        const inspectorCol = document.getElementById('inspectorCol');
        const timeline = document.querySelector('.timeline');
        const previewWrap = document.querySelector('.preview-wrap');
        const canvas = document.getElementById('previewCanvas');
        
        function box(el) {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          const s = getComputedStyle(el);
          return {
            x: Math.round(r.x),
            y: Math.round(r.y),
            w: Math.round(r.width),
            h: Math.round(r.height),
            display: s.display,
            visibility: s.visibility,
            opacity: s.opacity
          };
        }

        // Topbar buttons
        const topButtons = Array.from(topbar ? topbar.children : []).filter(el => {
          const s = getComputedStyle(el);
          return s.display !== 'none' && el.offsetWidth > 0;
        }).map(el => {
          const r = el.getBoundingClientRect();
          return { id: el.id, text: el.textContent.trim().slice(0, 15), x: Math.round(r.x), w: Math.round(r.width) };
        });

        // Inspector tabs
        const inspTabs = Array.from(document.querySelectorAll('#ppInspTabs > button, #ppInspTabs > *')).map(el => {
          const r = el.getBoundingClientRect();
          const s = getComputedStyle(el);
          return { text: el.textContent.trim(), display: s.display, x: Math.round(r.x), w: Math.round(r.width) };
        });

        return {
          window: { w: window.innerWidth, h: window.innerHeight },
          app: box(app),
          topbar: box(topbar),
          main: box(main),
          sidebar: box(sidebar),
          center: box(center),
          inspectorCol: box(inspectorCol),
          timeline: box(timeline),
          previewWrap: box(previewWrap),
          canvas: box(canvas),
          topButtons,
          inspTabs
        };
      })()
    `,
    returnByValue: true
  });

  console.log("Full Layout Audit:", JSON.stringify(layoutAudit.result.value, null, 2));

  // Take full screenshot
  const ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('diagnose-full-audit.png', Buffer.from(ss.data, 'base64'));
  console.log("Full audit screenshot saved to diagnose-full-audit.png");

  ws.close();
  chromeProc.kill();
  server.close();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
