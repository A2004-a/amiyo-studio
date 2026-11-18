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
  const userDataDir = path.join(require('os').tmpdir(), 'chrome-diag-t3-' + Date.now());
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
  await new Promise(r => setTimeout(r, 2000));

  // Check state of t3Bar and nav
  const state1 = await send('Runtime.evaluate', {
    expression: `
      (function(){
        const bar = document.getElementById('t3Bar');
        const nav = document.getElementById('nav');
        const lp = document.getElementById('leftPanel');
        return {
          t3BarExists: !!bar,
          t3BarDisplay: bar ? getComputedStyle(bar).display : null,
          t3BarParent: bar ? bar.parentNode.id || bar.parentNode.className : null,
          navClasses: nav ? nav.className : null,
          navDisplay: nav ? getComputedStyle(nav).display : null,
          lpDisplay: lp ? getComputedStyle(lp).display : null,
          activePanel: window.activePanel
        };
      })()
    `,
    returnByValue: true
  });
  console.log("State before click:", state1.result.value);

  // Click stickers navbtn
  const state2 = await send('Runtime.evaluate', {
    expression: `
      (function(){
        const btn = document.querySelector('#nav .navbtn[data-panel="stickers"]');
        if (btn) btn.click();
        const nav = document.getElementById('nav');
        return {
          clicked: !!btn,
          navClasses: nav ? nav.className : null,
          navDisplay: nav ? getComputedStyle(nav).display : null,
          activePanel: window.activePanel,
          leftPanelHTML: document.getElementById('leftPanel') ? document.getElementById('leftPanel').innerHTML.slice(0, 150) : null
        };
      })()
    `,
    returnByValue: true
  });
  console.log("State after clicking stickers:", state2.result.value);

  // Now click t3Bar to open
  const state3 = await send('Runtime.evaluate', {
    expression: `
      (function(){
        const bar = document.getElementById('t3Bar');
        if (bar) bar.click();
        const nav = document.getElementById('nav');
        return {
          t3BarClicked: !!bar,
          navClasses: nav ? nav.className : null,
          navDisplay: nav ? getComputedStyle(nav).display : null
        };
      })()
    `,
    returnByValue: true
  });
  console.log("State after clicking t3Bar:", state3.result.value);

  // Take screenshot of left panel
  const ss = await send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width: 300, height: 600, scale: 1 }
  });
  fs.writeFileSync('diagnose-t3-open.png', Buffer.from(ss.data, 'base64'));
  console.log("Screenshot saved to diagnose-t3-open.png");

  // Now click another button inside nav: text
  const state4 = await send('Runtime.evaluate', {
    expression: `
      (function(){
        const btn = document.querySelector('#nav .navbtn[data-panel="text"]');
        if (btn) btn.click();
        const nav = document.getElementById('nav');
        return {
          clicked: !!btn,
          navClasses: nav ? nav.className : null,
          navDisplay: nav ? getComputedStyle(nav).display : null,
          activePanel: window.activePanel
        };
      })()
    `,
    returnByValue: true
  });
  console.log("State after clicking text while open:", state4.result.value);

  ws.close();
  chromeProc.kill();
  server.close();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
