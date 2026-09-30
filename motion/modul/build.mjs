// Builds an A4 module page into a PDF named by <html data-pdf="…">
//   node build.mjs                                  -> modul.html → Motion-Tanpa-After-Effects.pdf
//   node build.mjs claude-design.html               -> Motion-Pakai-Claude-Design.pdf
//   node build.mjs <file> --previews                -> also preview/<file>/page-XX.png (for checking layout)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(HERE); // motion/ (fonts + assets live there)
const PREVIEWS = process.argv.includes("--previews");
const SRC = process.argv.slice(2).find(a => a.endsWith(".html")) || "modul.html";

async function loadPlaywright() {
  for (const id of ["playwright", "@playwright/test"]) { try { return (await import(id)).chromium; } catch {} }
  const globalRoot = spawnSync("npm", ["root", "-g"], { encoding: "utf8" }).stdout.trim();
  return createRequire(import.meta.url)(path.join(globalRoot, "playwright")).chromium;
}

const MIME = { ".html": "text/html", ".woff2": "font/woff2", ".png": "image/png", ".jpg": "image/jpeg", ".css": "text/css" };
const srv = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => srv.listen(0, "127.0.0.1", r));

const chromium = await loadPlaywright();
const browser = await chromium.launch({ args: ["--force-color-profile=srgb"] });
const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
await page.goto(`http://127.0.0.1:${srv.address().port}/modul/${SRC}`, { waitUntil: "networkidle" });
await page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
});

if (PREVIEWS) {
  const dir = path.join(HERE, "preview", path.basename(SRC, ".html"));
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const pages = await page.$$(".page");
  for (const [i, el] of pages.entries())
    await el.screenshot({ path: path.join(dir, `page-${String(i + 1).padStart(2, "0")}.png`) });
  // report pages whose content runs past the bottom margin
  const over = await page.$$eval(".page", ps => ps.map((p, i) => {
    const pad = p.querySelector(".pad") || p, lim = p.getBoundingClientRect().bottom - 60;
    const worst = Math.max(...[...pad.querySelectorAll("*")].filter(e => !e.closest(".ft")).map(e => e.getBoundingClientRect().bottom));
    return worst > lim ? `page ${i + 1}: +${Math.round(worst - lim)}px` : null;
  }).filter(Boolean));
  console.log(over.length ? "overflow:\n" + over.join("\n") : "no overflow");
}

const pdf = await page.getAttribute("html", "data-pdf");
await page.pdf({ path: path.join(HERE, pdf), printBackground: true, preferCSSPageSize: true });
await browser.close();
srv.close();
console.log(pdf);
