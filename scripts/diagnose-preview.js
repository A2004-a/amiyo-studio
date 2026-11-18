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
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cdpPort = 13000 + Math.floor(Math.random() * 7000);
  const userDataDir = path.join(require('os').tmpdir(), 'chrome-diag-' + Date.now());
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
    await new Promise(r => setTimeout(r, 250));
  }

  if (!targetsRes) {
    throw new Error('Failed to connect to Chrome CDP on port ' + cdpPort);
  }

  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];

  let ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const callbacks = new Map();
  const logs = [];
  const exceptions = [];

  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      const text = data.params.args.map(a => a.value || a.description).join(' ');
      logs.push(text);
    }
    if (data.method === 'Runtime.exceptionThrown') {
      const details = data.params.exceptionDetails;
      const text = (details.exception ? (details.exception.description || details.exception.value) : details.text) || JSON.stringify(details);
      exceptions.push(text);
      logs.push('EXCEPTION: ' + text);
    }
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
  await send('Log.enable');

  // Wait for boot screen to clear or scripts to load
  for (let i = 0; i < 30; i++) {
    const bootCheck = await send('Runtime.evaluate', {
      expression: '!!window.__amiyoBooted || !!window.loadDemo',
      returnByValue: true
    });
    if (bootCheck.result && bootCheck.result.result && bootCheck.result.result.value) break;
    await new Promise(r => setTimeout(r, 400));
  }
  await send('Runtime.evaluate', { expression: 'const b = document.getElementById("amBoot"); if (b) b.remove();' });
  await new Promise(r => setTimeout(r, 600));

  async function evalCode(expression) {
    const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return res.result && res.result.result ? res.result.result.value : null;
  }

  async function takeScreenshot(filePath) {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot.result && shot.result.data) {
      fs.writeFileSync(filePath, Buffer.from(shot.result.data, 'base64'));
    }
  }

  // 1. Initial State Check
  const initCheck = await evalCode(`(() => {
    const uxQuick = document.getElementById('uxQuick');
    const v19h = document.getElementById('v19h');
    const pCanvas = document.getElementById('previewCanvas');
    const pStage = document.getElementById('previewStage');
    return {
      hasUxQuick: !!uxQuick,
      uxQuickDisplay: uxQuick ? window.getComputedStyle(uxQuick).display : 'none',
      hasV19h: !!v19h,
      v19hText: v19h ? v19h.innerText : '',
      canvasSize: pCanvas ? { w: pCanvas.clientWidth, h: pCanvas.clientHeight } : null,
      stageSize: pStage ? { w: pStage.clientWidth, h: pStage.clientHeight } : null,
      topbarButtons: Array.from(document.querySelectorAll('#topBar button, header button')).map(b => b.innerText.trim()).filter(Boolean)
    };
  })()`);

  console.log('--- Initial State Check ---');
  console.log(JSON.stringify(initCheck, null, 2));

  // 2. Load Demo Project and check preview rendering
  const demoCheck = await evalCode(`(async () => {
    try {
      if (typeof window.loadDemo === 'function') {
        window.loadDemo();
      }
      await new Promise(r => setTimeout(r, 800));
      const cvs = document.getElementById('previewCanvas');
      const ctx2 = cvs ? cvs.getContext('2d') : null;
      let centerPixel = null;
      if (ctx2) {
        const p = ctx2.getImageData(Math.round(cvs.width / 2), Math.round(cvs.height / 2), 1, 1).data;
        centerPixel = [p[0], p[1], p[2], p[3]];
      }
      return {
        success: true,
        currentTime: window.currentTime,
        projectClips: (window.project && window.project.tracks) ? window.project.tracks.map(t => ({ kind: t.kind, count: t.clips.length })) : [],
        canvasSize: { width: cvs ? cvs.width : 0, height: cvs ? cvs.height : 0 },
        centerPixel: centerPixel
      };
    } catch (e) {
      return { success: false, error: e.message, stack: e.stack };
    }
  })()`);

  console.log('--- Demo Check ---');
  console.log(JSON.stringify(demoCheck, null, 2));

  const artDir = path.resolve('C:\\Users\\amiyo garai\\.gemini\\antigravity\\brain\\ed134396-8aef-4305-bdf6-efee209c8adc');
  await takeScreenshot(path.join(artDir, 'diagnose-demo-loaded.png'));

  // 3. Test layout switching: premiere, fcp, resolve
  for (const prof of ['premiere', 'fcp', 'resolve']) {
    const profCheck = await evalCode(`(async () => {
      try {
        if (typeof window.setProfile === 'function') {
          window.setProfile('${prof}');
        } else if (typeof window.applyProfileLayout === 'function') {
          window.applyProfileLayout('${prof}');
        }
        await new Promise(r => setTimeout(r, 600));
        const cvs = document.getElementById('previewCanvas');
        const ctx2 = cvs ? cvs.getContext('2d') : null;
        let centerPixel = null;
        if (ctx2) {
          const p = ctx2.getImageData(Math.round(cvs.width / 2), Math.round(cvs.height / 2), 1, 1).data;
          centerPixel = [p[0], p[1], p[2], p[3]];
        }
        return {
          profile: '${prof}',
          bodyClasses: document.body.className,
          centerPixel
        };
      } catch (e) {
        return { profile: '${prof}', error: e.message };
      }
    })()`);
    console.log('--- Profile Check: ' + prof + ' ---');
    console.log(JSON.stringify(profCheck, null, 2));
    await takeScreenshot(path.join(artDir, `diagnose-profile-${prof}.png`));
  }

  // 4. Test UI Panels: Text, Stickers, Transitions, Filters, Audio
  const panelsCheck = await evalCode(`(async () => {
    const results = {};
    const tabs = ['text', 'stickers', 'transitions', 'filters', 'audio'];
    for (const tab of tabs) {
      try {
        if (typeof window.switchLeftTab === 'function') {
          window.switchLeftTab(tab);
        }
        await new Promise(r => setTimeout(r, 300));
        const panel = document.getElementById('leftPanel');
        results[tab] = {
          hasItems: panel ? panel.querySelectorAll('.asset, .element-item, .trans-item, button').length : 0
        };
      } catch(e) {
        results[tab] = { error: e.message };
      }
    }
    return results;
  })()`);
  console.log('--- Panels Check ---');
  console.log(JSON.stringify(panelsCheck, null, 2));

  console.log('\n--- Exceptions Count: ' + exceptions.length + ' ---');
  if (exceptions.length > 0) {
    console.log('Exceptions:\n' + exceptions.join('\n'));
  }
  console.log('\nTotal Browser Logs: ' + logs.length);

  ws.close();
  chromeProc.kill();
  server.close();
}

main().catch(err => {
  console.error('Diagnostic error:', err);
  process.exit(1);
});
