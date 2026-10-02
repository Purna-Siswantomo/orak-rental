# Otak Rental: 15-second motion reel

A 15-second, 1080p60 brand reel for Otak Rental, built from the site's own design system: the
cream canvas, forest ink `#05100E`, the lime accent `#D4E751`, Geist, Geist Mono, Instrument Serif
italic, the eight-petal emblem and the brain logo.

- **`otak-rental-reel.mp4`**: the rendered video (H.264, 1920×1080, 60 fps, AAC audio)
- **`poster.png`**: the end-card frame
- **`showreel.html`**: the animation source. Open it through any static server (for example
  `npx serve motion`) and it plays live in the browser. Space pauses it, and ←/→ step one frame
  (hold Shift to step one second).

## Storyboard

| Time | Scene | What happens |
| --- | --- | --- |
| 0.0–2.6 s | **01 Spark** | A lime drop falls and squashes as it bounces. On the second impact it releases a shockwave and bursts into the eight-petal emblem. An orbit draws around the emblem and it spins. A boot line types out, then a lime iris wipes the frame. |
| 2.6–5.9 s | **02 Deadline** | "Deadline" rises letter by letter while task chips (Tubes, Laporan Magang, Bot Telegram…) crash in. A countdown pill races from 72:00:00 and turns red as the camera shakes. A lime marker strikes the word out, the chips are pulled into the centre, and the tagline *Sewa otak teknis, sebelum deadline mencekik.* lands. Staggered ink bars wipe to the next scene. |
| 5.9–8.9 s | **03 Formula** | The pricing formula builds itself: tiles flip in 3D while their digits spin like a slot machine, and the operators spin in. A scanner lights each factor, connector lines converge, and the total rolls up to Rp 1.100.000 (marked as an example). |
| 8.9–11.35 s | **04 Layanan** | Match cut: the total card morphs into the *Development Project* card. The camera then tilts into a 3D bento of services, with live code typing, charts, a milestone track and a turnaround clock. |
| 11.35–12.85 s | **05 Bukti** | Four rapid beats: 420+, 100%, 0%, 4,9/5. |
| 12.85–15.0 s | **06 Otak Rental** | The last panel collapses into a lime core and the emblem dots converge and implode. The brain logo pops out with a shockwave, an orbit and sparkles. The wordmark, tagline and WhatsApp CTA follow, and a lime sheen crosses the wordmark at the end. |

Motion blur is real. Each output frame is the average of 6 sub-frame samples taken across a
180° shutter.

## Re-rendering

```bash
cd motion
python3 sound.py            # procedural sound design → out/reel-audio.wav (stdlib only)
node render.mjs --stills 3.4,8.2,15   # quick PNG previews → out/still-*.png
node render.mjs             # full render → out/otak-rental-reel.mp4
```

Rendering needs Playwright's Chromium and `ffmpeg` on `PATH` (or set `FFMPEG=/path/to/ffmpeg`).
Options: `--fps 60`, `--sub 6` (motion-blur samples), `--shutter 0.5`, `--workers 4`.

The audio is synthesised procedurally from sine, noise and bell tones in `sound.py`, with every
cue timed to the animation. It uses no samples or licensed music.
