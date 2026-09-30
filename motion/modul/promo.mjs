// Renders promo.html: every .art[data-out] → png/<data-out>.png (Instagram 1080×1350, Lynk.id 1080×1080)
//   node promo.mjs            -> 1×
//   node promo.mjs --scale=2  -> @2x
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(HERE); // motion/ (fonts + assets live there)
const OUT = path.join(HERE, "png");
const SCALE = +(process.argv.find(a => a.startsWith("--scale="))?.split("=")[1] || 1);

async function loadPlaywright() {
  for (const id of ["playwright", "@playwright/test"]) { try { return (await import(id)).chromium; } catch {} }
  const globalRoot = spawnSync("npm", ["root", "-g"], { encoding: "utf8" }).stdout.trim();
  return createRequire(import.meta.url)(path.join(globalRoot, "playwright")).chromium;
}

const MIME = { ".html": "text/html", ".woff2": "font/woff2", ".png": "image/png", ".jpg": "image/jpeg" };
const srv = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => srv.listen(0, "127.0.0.1", r));

const chromium = await loadPlaywright();
const browser = await chromium.launch({ args: ["--force-color-profile=srgb"] });
const page = await browser.newPage({ viewport: { width: 1200, height: 1400 }, deviceScaleFactor: SCALE });
await page.goto(`http://127.0.0.1:${srv.address().port}/modul/promo.html`, { waitUntil: "networkidle" });
await page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
});
fs.mkdirSync(OUT, { recursive: true });
for (const el of await page.$$(".art[data-out]")) {
  const name = await el.getAttribute("data-out");
  await el.screenshot({ path: path.join(OUT, `${name}.png`) });
  console.log(name);
}
await browser.close();
srv.close();
