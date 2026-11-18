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
  const port = 48922;
  await new Promise(r => server.listen(port, '127.0.0.1', r));
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cdpPort = 9556;
  const userDataDir = path.join(require('os').tmpdir(), 'chrome-panels-' + Date.now());
  if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${userDataDir}`,
    '--window-size=1600,900',
    `http://127.0.0.1:${port}/index.html`
  ]);

  let targetsRes = null;
  for (let i = 0; i < 20; i++) {
    try {
      targetsRes = await fetch(`http://127.0.0.1:${cdpPort}/json`);
      if (targetsRes.ok) break;
    } catch (_) {}
    await new Promise(r => setTimeout(r, 300));
  }
  if (!targetsRes || !targetsRes.ok) throw new Error('Chrome did not respond');
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page');

  let ws;
  try {
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

    console.log('Waiting for boot...');
    for (let i = 0; i < 60; i++) {
      const state = await send('Runtime.evaluate', {
        expression: '!!window.__amiyoBooted && !document.getElementById("amBoot")',
        returnByValue: true
      });
      if (state.result && state.result.result && state.result.result.value) {
        console.log(`Boot finished at attempt ${i}`);
        break;
      }
      await new Promise(r => setTimeout(r, 500));
    }
    // Also explicitly ensure amBoot is removed if still lingering
    await evalCode('const b = document.getElementById("amBoot"); if (b) b.remove();');
    await new Promise(r => setTimeout(r, 1000));

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

    const panels = [
      'media', 'templates', 'audio', 'text', 'captions', 'stickers',
      'graphics', 'transitions', 'filters', 'color', 'effects',
      'animations', 'brand', 'record', 'ai', 'stock', 'elements', 'multicam'
    ];

    console.log('--- Testing All 18 Left Panels ---');
    const results = {};
    for (const p of panels) {
      const res = await evalCode(`(() => {
        const btn = document.querySelector(\`#nav .navbtn[data-panel="\${'${p}'}"]\`) ||
                    Array.from(document.querySelectorAll('#nav .navbtn')).find(b => b.textContent.toLowerCase().includes('${p}'));
        if (btn) btn.click();
        const lp = document.getElementById('leftPanel');
        const heading = document.getElementById('panelHeading');
        const nav = document.getElementById('nav');
        return {
          foundBtn: !!btn,
          panelHtmlLength: lp ? lp.innerHTML.length : 0,
          headingText: heading ? heading.textContent : '',
          navHasOpenClass: nav ? nav.classList.contains('t3-open') : false,
          childrenCount: lp ? lp.children.length : 0,
          firstFewChars: lp ? lp.innerText.slice(0, 100).replace(/\\s+/g, ' ') : ''
        };
      })()`);

      results[p] = res;
      console.log('Panel [' + p + ']: ' + JSON.stringify(res));
    }

    // Save screenshots for critical panels
    for (const p of ['stickers', 'text', 'audio', 'filters', 'transitions']) {
      await evalCode("(() => {" +
        "const btn = document.querySelector('#nav .navbtn[data-panel=\"" + p + "\"]') || " +
        "Array.from(document.querySelectorAll('#nav .navbtn')).find(b => b.textContent.toLowerCase().includes('" + p + "'));" +
        "if (btn) btn.click();" +
      "})()");
      await new Promise(r => setTimeout(r, 200));
      const artifactPath = path.join(
        'C:\\Users\\amiyo garai\\.gemini\\antigravity\\brain\\ed134396-8aef-4305-bdf6-efee209c8adc',
        'panel-' + p + '.png'
      );
      await captureScreenshot(artifactPath);
    }

  } catch (err) {
    console.error('Audit failed:', err);
  } finally {
    if (ws) ws.close();
    chromeProc.kill();
    server.close();
  }
}

main();
