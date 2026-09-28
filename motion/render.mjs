// Renders showreel.html to video, frame by frame, with real sub-frame motion blur.
//
//   node render.mjs                         -> out/otak-rental-reel.mp4 (1080p60, with sound.py audio)
//   node render.mjs --stills 0.5,3.2,7.9    -> out/still-*.png (quick previews)
//   options: --fps 60  --sub 3 (motion-blur samples)  --shutter 0.5  --workers 4
//
// Needs Playwright (Chromium) and ffmpeg on PATH (or FFMPEG=/path/to/ffmpeg).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, "out");
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) =>
  a.startsWith("--") ? [...acc, [a.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : true]] : acc, []));
const FPS = +(args.fps || 60), SUB = +(args.sub || 3), SHUTTER = +(args.shutter || 0.5);
const WORKERS = +(args.workers || Math.max(1, Math.min(4, os.cpus().length)));
const FFMPEG = process.env.FFMPEG || "ffmpeg";

async function loadPlaywright() {
  for (const id of ["playwright", "@playwright/test"]) {
    try { return (await import(id)).chromium; } catch {}
  }
  const req = createRequire(import.meta.url);
  const globalRoot = spawnSync("npm", ["root", "-g"], { encoding: "utf8" }).stdout.trim();
  return req(path.join(globalRoot, "playwright")).chromium;
}

const MIME = { ".html": "text/html", ".woff2": "font/woff2", ".png": "image/png", ".js": "text/javascript" };
function serve() {
  const srv = http.createServer((req, res) => {
    const p = path.join(DIR, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (!p.startsWith(DIR) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" });
    fs.createReadStream(p).pipe(res);
  });
  return new Promise(r => srv.listen(0, "127.0.0.1", () => r(srv)));
}

async function openPage(browser, port) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on("pageerror", e => console.error("page error:", e.message));
  await page.goto(`http://127.0.0.1:${port}/showreel.html?capture`);
  await page.evaluate(() => window.reelReady);
  return page;
}

const chromium = await loadPlaywright();
const srv = await serve();
const port = srv.address().port;
const browser = await chromium.launch({ args: ["--force-color-profile=srgb", "--disable-lcd-text"] });
fs.mkdirSync(OUT, { recursive: true });

if (args.stills) {
  const page = await openPage(browser, port);
  for (const s of String(args.stills).split(",")) {
    await page.evaluate(t => window.renderAt(t), +s);
    await page.screenshot({ path: path.join(OUT, `still-${(+s).toFixed(2)}.png`) });
  }
  console.log("stills written to", OUT);
} else {
  const dur = await (await openPage(browser, port)).evaluate(() => window.DURATION);
  const frames = Math.round(dur * FPS);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "reel-"));
  const jobs = [];
  for (let f = 0; f < frames; f++) for (let s = 0; s < SUB; s++) jobs.push({ i: f * SUB + s, t: (f + (SUB > 1 ? s / SUB * SHUTTER - SHUTTER / 2 : 0)) / FPS });
  let done = 0; const t0 = Date.now();
  await Promise.all([...Array(WORKERS)].map(async (_, w) => {
    const page = await openPage(browser, port);
    for (let j = w; j < jobs.length; j += WORKERS) {
      await page.evaluate(t => window.renderAt(Math.max(0, t)), jobs[j].t);
      await page.screenshot({ path: path.join(tmp, `f${String(jobs[j].i).padStart(6, "0")}.png`) });
      if (++done % 200 === 0) process.stdout.write(`\r${done}/${jobs.length} samples  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
  }));
  console.log(`\ncaptured ${jobs.length} samples; encoding…`);
  // average each group of SUB samples into one frame (= motion blur), then encode H.264
  const blur = SUB > 1 ? `tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/${FPS}/TB,` : "";
  const mp4 = path.join(OUT, "otak-rental-reel.mp4");
  // sound design (python3 sound.py) is muxed in when present
  const wav = path.join(OUT, "reel-audio.wav");
  if (!fs.existsSync(wav)) spawnSync("python3", [path.join(DIR, "sound.py")], { stdio: "inherit" });
  const audio = fs.existsSync(wav) ? ["-i", wav, "-c:a", "aac", "-b:a", "256k", "-shortest"] : [];
  const r = spawnSync(FFMPEG, ["-y", "-loglevel", "error", "-framerate", String(FPS * SUB), "-i", path.join(tmp, "f%06d.png"), ...audio.slice(0, 2),
    "-vf", `${blur}format=yuv420p`, "-r", String(FPS), "-c:v", "libx264", "-preset", "slow", "-crf", "16",
    "-profile:v", "high", ...audio.slice(2), "-movflags", "+faststart", mp4], { stdio: "inherit" });
  if (r.status !== 0) process.exitCode = 1; else console.log("wrote", mp4);
  fs.rmSync(tmp, { recursive: true, force: true });
}
await browser.close();
srv.close();
