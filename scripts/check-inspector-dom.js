const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(rootDir, reqPath);
  if (!fs.existsSync(filePath)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200); fs.createReadStream(filePath).pipe(res);
});

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const cdpPort = 16335;
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new', '--no-sandbox', '--disable-gpu',
    '--remote-debugging-port=' + cdpPort,
    'http://127.0.0.1:' + port + '/index.html'
  ]);
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:' + cdpPort + '/json');
  const targets = await res.json();
  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
  ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.method === 'Runtime.exceptionThrown') {
      console.error('JS EXCEPTION:', JSON.stringify(data.params.exceptionDetails));
    }
  };

  setTimeout(async () => {
    ws.send(JSON.stringify({
      id: 3,
      method: 'Runtime.evaluate',
      params: {
        expression: `
          (function(){
            const results = {};
            const tabs = ['pp6fx', 'pp6gfx', 'pp6lum', 'pp6lib', 'tools', 'fx'];
            tabs.forEach(t => {
              const b = document.querySelector('#ppInspTabs button[data-t="' + t + '"]');
              if (b) b.click();
              const col = document.getElementById('inspectorCol');
              const dock = document.getElementById('pp6Dock');
              const ins = document.getElementById('inspector');
              const pro = document.getElementById('amiyoProInspector');
              results[t] = {
                clicked: !!b,
                dockDisplay: dock ? getComputedStyle(dock).display : null,
                inspDisplay: ins ? getComputedStyle(ins).display : null,
                proDisplay: pro ? getComputedStyle(pro).display : null,
                colClass: col ? col.className : null
              };
            });
            return results;
          })()
        `,
        returnByValue: true
      }
    }));
  }, 2500);

  const handler = (e) => {
    const data = JSON.parse(e.data);
    if (data.id === 3) {
      console.log('Eval 3 result:', data.result.result.value);
      chrome.kill();
      server.close();
      process.exit(0);
    }
  };
  ws.addEventListener('message', handler);
});
