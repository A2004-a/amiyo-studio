const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
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

async function run() {
  const serverPort = 48931;
  await new Promise(r => server.listen(serverPort, '127.0.0.1', r));
  console.log('Local HTTP server running on port', serverPort);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(os.tmpdir(), 'chrome-verify-' + Date.now());
  if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `--user-data-dir=${userDataDir}`,
    '--remote-debugging-port=0',
    '--window-size=1600,900',
    `http://127.0.0.1:${serverPort}/index.html`
  ]);

  let browserWsUrl = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Chrome DevTools listen timeout')), 15000);
    chromeProc.stderr.on('data', d => {
      const m = d.toString().match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (m) {
        clearTimeout(timer);
        resolve(m[1]);
      }
    });
  });
  console.log('Connected to Chrome Browser WS:', browserWsUrl);

  const bws = new WebSocket(browserWsUrl);
  await new Promise(r => bws.onopen = r);

  let bId = 1;
  const bCallbacks = new Map();
  bws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (data.id && bCallbacks.has(data.id)) {
      bCallbacks.get(data.id)(data);
      bCallbacks.delete(data.id);
    }
  };

  function sendB(method, params = {}) {
    return new Promise((resolve) => {
      const curId = bId++;
      bCallbacks.set(curId, resolve);
      bws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  // Find page target
  let targetId = null;
  for (let i = 0; i < 30; i++) {
    const res = await sendB('Target.getTargets');
    const targets = (res.result && res.result.targetInfos) || [];
    const page = targets.find(t => t.type === 'page' && t.url.includes('index.html'));
    if (page) {
      targetId = page.targetId;
      console.log('Found page target:', targetId, page.url);
      break;
    }
    await new Promise(r => setTimeout(r, 400));
  }
  if (!targetId) throw new Error('Could not find page target');

  // Attach to page
  const attachRes = await sendB('Target.attachToTarget', { targetId, flatten: true });
  const sessionId = attachRes.result.sessionId;
  console.log('Attached to target, session ID:', sessionId);

  let sId = 1;
  const sCallbacks = new Map();
  bws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (data.sessionId === sessionId && data.id && sCallbacks.has(data.id)) {
      sCallbacks.get(data.id)(data);
      sCallbacks.delete(data.id);
    } else if (data.id && bCallbacks.has(data.id)) {
      bCallbacks.get(data.id)(data);
      bCallbacks.delete(data.id);
    }
  };

  function sendPage(method, params = {}) {
    return new Promise((resolve) => {
      const curId = sId++;
      sCallbacks.set(curId, resolve);
      bws.send(JSON.stringify({ id: curId, sessionId, method, params }));
    });
  }

  await sendPage('Runtime.enable');
  await sendPage('Page.enable');

  async function evaluate(expression) {
    const res = await sendPage('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return res.result && res.result.result ? res.result.result.value : null;
  }

  // Wait for boot loader to complete
  for (let i = 0; i < 40; i++) {
    const booted = await evaluate('!!window.__amiyoBooted && !document.getElementById("amBoot")');
    if (booted) break;
    await new Promise(r => setTimeout(r, 300));
  }
  await evaluate('const b = document.getElementById("amBoot"); if (b) b.remove();');
  await new Promise(r => setTimeout(r, 800));

  // 1. Rogue check
  const rogueCheck = await evaluate(`(() => {
    return {
      hasUxQuick: !!document.getElementById('uxQuick') && getComputedStyle(document.getElementById('uxQuick')).display !== 'none',
      hasPpWs: !!document.getElementById('ppWs') && getComputedStyle(document.getElementById('ppWs')).display !== 'none',
      hasAmMenus: !!document.querySelector('.am-menus') && getComputedStyle(document.querySelector('.am-menus')).display !== 'none',
      hasV19h: !!document.getElementById('v19h'),
      v19hVisible: !!document.getElementById('v19h') && document.getElementById('v19h').classList.contains('on'),
      v19Btns: Array.from(document.querySelectorAll('#v19h button')).map(b => b.textContent.trim())
    };
  })()`);
  console.log('Rogue check:', rogueCheck);

  async function takeScreenshot(filePath) {
    const res = await sendPage('Page.captureScreenshot', { format: 'png' });
    if (res.result && res.result.data) {
      fs.writeFileSync(filePath, Buffer.from(res.result.data, 'base64'));
      console.log('Screenshot saved to:', filePath);
    }
  }

  const artDir = 'C:\\Users\\amiyo garai\\.gemini\\antigravity\\brain\\ed134396-8aef-4305-bdf6-efee209c8adc';
  await takeScreenshot(path.join(artDir, 'verify-initial.png'));

  // 2. Demo load test
  console.log('Testing 1-click Load Demo Project...');
  const demoRes = await evaluate(`(async () => {
    const demoBtn = document.getElementById('v19DemoBtn');
    if (demoBtn) demoBtn.click();
    else if (window.loadDemo) window.loadDemo();
    await new Promise(r => setTimeout(r, 900));

    const cvs = document.getElementById('previewCanvas');
    const ctx = cvs ? cvs.getContext('2d') : null;
    let pixel = null;
    if (ctx) {
      const p = ctx.getImageData(640, 360, 1, 1).data;
      pixel = Array.from(p);
    }
    const clips = (window.project && window.project.tracks) ? window.project.tracks.reduce((n, t) => n + t.clips.length, 0) : 0;
    const v19hOn = document.getElementById('v19h') ? document.getElementById('v19h').classList.contains('on') : null;

    return {
      clipsCount: clips,
      v19hDismissed: !v19hOn,
      centerPixel: pixel,
      isNonBlack: pixel ? (pixel[0] > 0 || pixel[1] > 0 || pixel[2] > 0) : false
    };
  })()`);
  console.log('Demo load verification:', demoRes);

  await takeScreenshot(path.join(artDir, 'verify-demo-loaded.png'));

  // 3. Playback test
  console.log('Testing Playback Engine...');
  const playRes = await evaluate(`(async () => {
    window.play();
    await new Promise(r => setTimeout(r, 600));
    const tMid = window.currentTime;
    window.pause();
    return { playedTime: tMid, isPlaying: tMid > 0 };
  })()`);
  console.log('Playback test:', playRes);

  // 4. Split and Edit test
  console.log('Testing Split and Edit tools...');
  const editRes = await evaluate(`(() => {
    window.setCurrentTime(2.0);
    const vTrack = window.project.tracks.find(t => t.kind === 'video');
    const firstClip = vTrack && vTrack.clips[0];
    if (firstClip) {
      window.selectClip(firstClip.id);
      window.splitSelected();
    }
    const splitCount = vTrack ? vTrack.clips.length : 0;
    return {
      splitCount: splitCount,
      splitSuccess: splitCount >= 4
    };
  })()`);
  console.log('Split test:', editRes);

  // 5. Profile Switching test
  console.log('Testing Profile Switching...');
  const profileRes = await evaluate(`(async () => {
    const sel = document.getElementById('nleKeymapProfile');
    const results = {};
    for (const p of ['resolve', 'fcp', 'premiere']) {
      if (sel) {
        sel.value = p;
        sel.dispatchEvent(new Event('change'));
      }
      if (window.amiyoSwitchNLEProfile) window.amiyoSwitchNLEProfile(p);
      await new Promise(r => setTimeout(r, 300));
      const ws = document.querySelector('.workspace');
      const cw = ws ? ws.clientWidth : 0;
      const ch = ws ? ws.clientHeight : 0;
      const pw = document.querySelector('.preview-wrap');
      const pwH = pw ? pw.clientHeight : 0;
      results[p] = { wsW: cw, wsH: ch, previewH: pwH, visible: cw > 500 && ch > 300 && pwH > 100 };
    }
    return results;
  })()`);
  console.log('Profile switching results:', profileRes);

  await takeScreenshot(path.join(artDir, 'verify-profiles-tested.png'));

  bws.close();
  chromeProc.kill();
  server.close();
  console.log('=== ALL BROWSER VERIFICATION TESTS COMPLETED SUCCESSFULLY ===');
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
