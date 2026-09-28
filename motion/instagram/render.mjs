// Renders carousel.html into 6 Instagram slides (1080×1350 PNG): png/post{1,2}-slide{1,2,3}.png
// Each post is laid out as one 3240×1350 panorama and cut into three slides so elements run across the swipe.
//   node render.mjs            -> 1080×1350
//   node render.mjs --scale=2  -> 2160×2700 (@2x)
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

const MIME = { ".html": "text/html", ".woff2": "font/woff2", ".png": "image/png" };
const srv = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => srv.listen(0, "127.0.0.1", r));

const chromium = await loadPlaywright();
const browser = await chromium.launch({ args: ["--force-color-profile=srgb"] });
fs.mkdirSync(OUT, { recursive: true });
for (const post of [1, 2]) {
  const page = await browser.newPage({ viewport: { width: 3240, height: 1350 }, deviceScaleFactor: SCALE });
  page.on("pageerror", e => console.error("page error:", e.message));
  await page.goto(`http://127.0.0.1:${srv.address().port}/instagram/carousel.html?post=${post}`);
  await page.evaluate(() => window.ready);
  for (let s = 0; s < 3; s++) {
    const file = path.join(OUT, `post${post}-slide${s + 1}${SCALE > 1 ? `@${SCALE}x` : ""}.png`);
    await page.screenshot({ path: file, clip: { x: s * 1080, y: 0, width: 1080, height: 1350 } });
    console.log("wrote", path.relative(HERE, file));
  }
  await page.close();
}
await browser.close();
srv.close();
