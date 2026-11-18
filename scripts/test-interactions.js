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
  const port = 48924;
  await new Promise(r => server.listen(port, '127.0.0.1', r));
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cdpPort = 9558;
  const userDataDir = path.join(require('os').tmpdir(), 'chrome-interact-' + Date.now());
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
        break;
      }
      await new Promise(r => setTimeout(r, 500));
    }
    await send('Runtime.evaluate', { expression: 'const b = document.getElementById("amBoot"); if (b) b.remove();' });
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

    console.log('--- 1. Testing Load Demo ---');
    const demoRes = await evalCode(`(() => {
      if (typeof window.loadDemo === 'function') {
        window.loadDemo();
      } else {
        const dBtn = document.getElementById('demoBtn');
        if (dBtn) dBtn.click();
      }
      return {
        tracksCount: project.tracks.length,
        totalClips: project.tracks.reduce((sum, t) => sum + (t.clips ? t.clips.length : 0), 0)
      };
    })()`);
    console.log('Demo loaded:', demoRes);

    await new Promise(r => setTimeout(r, 600));
    const demoPic = path.join(
      'C:\\Users\\amiyo garai\\.gemini\\antigravity\\brain\\ed134396-8aef-4305-bdf6-efee209c8adc',
      'demo-loaded-interact.png'
    );
    await captureScreenshot(demoPic);

    console.log('--- 2. Testing Add Text Title ---');
    const textRes = await evalCode(`(() => {
      const navBtn = document.querySelector('#nav .navbtn[data-panel="text"]');
      if (navBtn) navBtn.click();
      const card = document.querySelector('[data-preset-text="0"]');
      if (card) card.click();
      const tt = project.tracks.find(t => t.kind === 'text' || t.kind === 'caption');
      return {
        hasTextTrack: !!tt,
        textClips: tt ? tt.clips.length : 0,
        addedName: tt && tt.clips.length ? tt.clips[tt.clips.length - 1].name : null
      };
    })()`);
    console.log('Text result:', textRes);

    console.log('--- 3. Testing Add Sound Effect ---');
    const audioRes = await evalCode(`(() => {
      const navBtn = document.querySelector('#nav .navbtn[data-panel="audio"]');
      if (navBtn) navBtn.click();
      const addBtn = document.querySelector('[data-sfx-add="whoosh"]');
      if (addBtn) addBtn.click();
      const at = project.tracks.find(t => t.kind === 'audio');
      return {
        hasAudioTrack: !!at,
        audioClips: at ? at.clips.length : 0,
        addedName: at && at.clips.length ? at.clips[at.clips.length - 1].name : null
      };
    })()`);
    console.log('Audio SFX result:', audioRes);

    console.log('--- 4. Testing Add Sticker ---');
    const stickerRes = await evalCode(`(() => {
      const navBtn = document.querySelector('#nav .navbtn[data-panel="stickers"]');
      if (navBtn) navBtn.click();
      const stkBtn = document.querySelector('[data-sticker-glyph="🔥"]');
      if (stkBtn) stkBtn.click();
      const tt = project.tracks.find(t => t.kind === 'text' || t.kind === 'graphic');
      return {
        hasTrack: !!tt,
        clipsCount: tt ? tt.clips.length : 0,
        addedName: tt && tt.clips.length ? tt.clips[tt.clips.length - 1].name : null
      };
    })()`);
    console.log('Sticker result:', stickerRes);

    console.log('--- 5. Testing Playback Engine ---');
    const playRes = await evalCode(`(() => {
      const pBtn = document.getElementById('playBtn');
      const t0 = currentTime;
      if (typeof window.play === 'function') window.play();
      else if (pBtn) pBtn.click();
      return { isPlaying: isPlaying, t0: t0 };
    })()`);
    console.log('Playback started:', playRes);

    // Let it play for 500ms
    await new Promise(r => setTimeout(r, 600));

    const playAdvRes = await evalCode(`(() => {
      const t1 = currentTime;
      if (typeof window.pause === 'function') window.pause();
      return { t1: t1, advanced: t1 > 0 };
    })()`);
    console.log('Playback advanced:', playAdvRes);

    const postInteractPic = path.join(
      'C:\\Users\\amiyo garai\\.gemini\\antigravity\\brain\\ed134396-8aef-4305-bdf6-efee209c8adc',
      'demo-post-interact.png'
    );
    await captureScreenshot(postInteractPic);

  } catch (err) {
    console.error('Audit failed:', err);
  } finally {
    if (ws) ws.close();
    chromeProc.kill();
    server.close();
  }
}

main();
