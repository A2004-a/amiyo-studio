const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFile, spawn } = require("child_process");

const root = path.resolve(__dirname, "..");

const server = http.createServer((req, res) => {
  let reqPath = req.url.split("?")[0];
  if (reqPath === "/") reqPath = "/index.html";
  const filePath = path.join(root, decodeURIComponent(reqPath));
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml"
  };
  res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(8097, "127.0.0.1", async () => {
  console.log("Server listening on http://127.0.0.1:8097");
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const chrome = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9232",
    "--disable-gpu",
    "--no-sandbox"
  ]);

  setTimeout(async () => {
    try {
      const getJSON = (url) => new Promise((resolve, reject) => {
        http.get(url, (res) => {
          let data = "";
          res.on("data", chunk => data += chunk);
          res.on("end", () => resolve(JSON.parse(data)));
        }).on("error", reject);
      });

      const targets = await getJSON("http://127.0.0.1:9232/json");
      const target = targets.find(t => t.type === "page") || targets[0];
      const ws = new WebSocket(target.webSocketDebuggerUrl);

      let msgId = 1;
      const send = (method, params = {}) => new Promise((resolve, reject) => {
        const id = msgId++;
        const handler = (event) => {
          const resp = JSON.parse(event.data);
          if (resp.id === id) {
            ws.removeEventListener("message", handler);
            if (resp.error) reject(resp.error);
            else resolve(resp.result);
          }
        };
        ws.addEventListener("message", handler);
        ws.send(JSON.stringify({ id, method, params }));
      });

      await new Promise(r => ws.addEventListener("open", r, { once: true }));
      await send("Page.enable");
      await send("Runtime.enable");
      await send("Emulation.setDeviceMetricsOverride", {
        width: 1366,
        height: 768,
        deviceScaleFactor: 1,
        mobile: false
      });
      await send("Page.navigate", { url: "http://127.0.0.1:8097/index.html" });
      await new Promise(r => setTimeout(r, 2000));

      const evalRes = await send("Runtime.evaluate", {
        expression: `
          (function() {
            const tb = document.querySelector(".topbar");
            if (!tb) return { error: "no topbar" };
            const tbRect = tb.getBoundingClientRect();
            const children = Array.from(document.querySelectorAll(".topbar > *, .app > header *, #amiyoMain, #mbar, .mbar, [id*='top'], [id*='Export'], [id*='export'], [id*='ws']")).map(el => {
              const r = el.getBoundingClientRect();
              const s = window.getComputedStyle(el);
              return {
                id: el.id,
                tag: el.tagName,
                cls: el.className,
                text: el.textContent ? el.textContent.trim().slice(0, 30) : "",
                display: s.display,
                position: s.position,
                x: Math.round(r.x),
                y: Math.round(r.y),
                w: Math.round(r.width),
                h: Math.round(r.height),
                zIndex: s.zIndex,
                overflow: s.overflow
              };
            }).filter(c => c.display !== "none" && c.w > 0 && c.h > 0);
            return { tbRect, children };
          })()
        `,
        returnByValue: true
      });

      console.log("Topbar eval result:", JSON.stringify(evalRes.result.value, null, 2));

      // Also take a screenshot of the topbar area
      const clipRes = await send("Page.captureScreenshot", {
        format: "png",
        clip: { x: 0, y: 0, width: 1366, height: 200, scale: 1 }
      });
      fs.writeFileSync("diagnose-topbar.png", Buffer.from(clipRes.data, "base64"));
      console.log("Screenshot saved to diagnose-topbar.png");

      ws.close();
      chrome.kill();
      server.close();
      process.exit(0);
    } catch (err) {
      console.error("Diagnostic error:", err);
      chrome.kill();
      server.close();
      process.exit(1);
    }
  }, 1000);
});
