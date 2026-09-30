"""Original 120 BPM track for reel30.html (30 s), synthesised with the stdlib only.

Arrangement follows the picture: hook slams (0-2), groove (2-14), liquid breakdown (14-18),
drop (18-24), glitch stutter + tape stop (24-26), outro chord (26-30).
    python3 reel30_sound.py [out.wav]      (default: out/motion-reel-30s.wav)
"""
import math
import os
import random
import struct
import sys
import wave

SR, DUR, BEAT = 48000, 30.0, 0.5
N = int(SR * DUR)
L, R = [0.0] * N, [0.0] * N
rng = random.Random(30)
TAU = 2 * math.pi


def put(t0, s, g=1.0, pan=0.0):
    i0 = int(t0 * SR)
    gl, gr = g * math.cos((pan + 1) * math.pi / 4), g * math.sin((pan + 1) * math.pi / 4)
    for k, v in enumerate(s):
        i = i0 + k
        if 0 <= i < N:
            L[i] += v * gl
            R[i] += v * gr


def env_ad(n, a, d):
    na = max(1, int(a * SR))
    return [(k / na if k < na else math.exp(-(k - na) / (d * SR))) for k in range(n)]


def kick(f0=160, f1=45, dur=0.4, click=0.5, drive=1.8):
    out, ph = [], 0.0
    for k in range(int(dur * SR)):
        t = k / SR
        ph += TAU * (f1 + (f0 - f1) * math.exp(-t * 32)) / SR
        v = math.sin(ph) * math.exp(-t * 8)
        if k < 220:
            v += click * (rng.random() * 2 - 1) * (1 - k / 220)
        out.append(math.tanh(v * drive))
    return out


def noise(dur, lp, hp, a, d):
    n, e = int(dur * SR), env_ad(int(dur * SR), a, d)
    out, y, yh = [], 0.0, 0.0
    al, ah = 1 - math.exp(-TAU * lp / SR), 1 - math.exp(-TAU * hp / SR)
    for k in range(n):
        y += al * ((rng.random() * 2 - 1) - y)
        yh += ah * (y - yh)
        out.append((y - yh) * e[k] * 2.5)
    return out


def clap():
    s = [0.0] * int(0.3 * SR)
    for off in (0, 0.011, 0.022):
        for k, v in enumerate(noise(0.25, 5000, 900, 0.001, 0.05 if off < 0.02 else 0.12)):
            i = int(off * SR) + k
            if i < len(s):
                s[i] += v * 0.6
    return s


def synth(f, dur, a=0.005, d=0.3, kind="saw", cutoff=3000, glide=1.0):
    n, e = int(dur * SR), env_ad(int(dur * SR), a, d)
    out, ph, y = [], 0.0, 0.0
    al = 1 - math.exp(-TAU * cutoff / SR)
    for k in range(n):
        ph += f * (glide ** (k / n)) / SR
        p = ph % 1.0
        if kind == "saw":
            v = 2 * p - 1
        elif kind == "sq":
            v = 1 if p < 0.5 else -1
        elif kind == "tri":
            v = 4 * abs(p - 0.5) - 1
        else:
            v = math.sin(TAU * p)
        y += al * (v - y)
        out.append(y * e[k])
    return out


def whoosh(dur, lo, hi, peak):
    n, out, y = int(dur * SR), [], 0.0
    for k in range(n):
        p = k / n
        sh = (p / peak) ** 2 if p < peak else ((1 - p) / (1 - peak)) ** 1.5
        y += (1 - math.exp(-TAU * (lo + (hi - lo) * sh) / SR)) * ((rng.random() * 2 - 1) - y)
        out.append(y * sh * 2.4)
    return out


def riser(dur, f0, f1):
    n, out, ph = int(dur * SR), [], 0.0
    for k in range(n):
        p = k / n
        ph += TAU * f0 * (f1 / f0) ** (p * p) / SR
        out.append((math.sin(ph) + 0.35 * math.sin(ph * 2.01) + 0.2 * (rng.random() * 2 - 1) * p) * p ** 2 * 0.5)
    return out


# A minor: Am - F - C - G, one chord per bar (2 s)
ROOTS = [55.0, 43.65, 65.41, 49.0]
CHORDS = [[220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [261.63, 329.63, 392.0], [196.0, 246.94, 293.66]]
ARP = [440.0, 523.25, 659.25, 783.99, 659.25, 523.25, 587.33, 659.25]
bar = lambda t: int(t // 2) % 4

# ---------- 0-2 · hook slams ----------
for i in range(4):
    t = i * BEAT
    put(t, kick(200, 38, 0.45, 0.8, 2.4), 0.9)
    put(t, noise(0.3, 9000, 300, 0.001, 0.08), 0.35)
    for f in CHORDS[0]:
        put(t, synth(f * (1 + i * 0.0), 0.35, 0.002, 0.12, "saw", 5000), 0.05, (i - 1.5) * 0.3)
put(1.2, riser(0.8, 200, 1800), 0.3)

# ---------- groove 2-14 & drop 18-24 ----------
t = 2.0
while t < 24.0 - 1e-9:
    step = round((t - 2.0) / (BEAT / 4))  # 16th index
    in_break = 14.0 <= t < 18.0
    drop = t >= 18.0
    beat_on = step % 4 == 0
    if beat_on and not in_break:
        put(t, kick(170, 44, 0.38, 0.5, 2.0), 0.8 if not drop else 0.9)
    if step % 8 == 4 and not in_break:
        put(t, clap(), 0.35 if not drop else 0.42)
    if not in_break and (step % 4 == 2 or (drop and step % 2 == 1)):
        put(t, noise(0.05, 12000, 7000, 0.001, 0.015), 0.16 if step % 4 == 2 else 0.08, 0.3)
    # bass: offbeat 8ths, pumping against the kick
    if not in_break and step % 2 == 1:
        put(t, synth(ROOTS[bar(t)], 0.2, 0.004, 0.09, "saw", 700 if not drop else 1100), 0.32)
    if drop and step % 4 == 0:
        put(t, synth(ROOTS[bar(t)] * 2, 0.18, 0.002, 0.07, "sq", 1500), 0.1)
    # arp from the shape chapter on
    if 6.0 <= t < 14.0 or drop:
        f = ARP[step % 8] * (0.5 if bar(t) in (1, 3) else 1.0)
        put(t, synth(f, 0.14, 0.002, 0.06, "tri", 4000), 0.07, 0.4 if step % 2 else -0.4)
    if drop and step % 16 == 0:
        for f in CHORDS[bar(t)]:
            put(t, synth(f, 0.3, 0.003, 0.14, "saw", 3500), 0.05)
    t += BEAT / 4

# ---------- 14-18 · liquid breakdown: pad + bubbles + riser ----------
for k in range(int(14 * SR), int(18 * SR)):
    tt = k / SR
    amp = 0.035 * min(1, (tt - 14) / 0.6) * min(1, (18 - tt) / 0.3)
    ch = CHORDS[bar(tt)]
    v = sum(math.sin(TAU * f * tt + j) for j, f in enumerate(ch)) * amp
    L[k] += v
    R[k] += v * 0.95
for j in range(22):
    tt = 14.1 + rng.random() * 3.6
    put(tt, synth(600 + rng.random() * 900, 0.12, 0.002, 0.04, "sine", 8000, 1.8), 0.08, rng.random() * 1.6 - 0.8)
put(16.5, riser(1.5, 150, 2400), 0.35)
put(17.5, noise(0.5, 9000, 2000, 0.45, 0.02), 0.2)

# ---------- 24-26 · glitch stutter + tape stop ----------
for i in range(24):
    tt = 24.0 + i * BEAT / 4
    if tt >= 25.62:
        break
    if i % 4 == 0 or rng.random() > 0.45:
        put(tt, kick(180, 50, 0.1, 0.8, 3), 0.6)
    crushed = [round(v * 4) / 4 for v in noise(0.1, 6000, 500, 0.001, 0.04)]
    put(tt, crushed, 0.25, rng.random() * 1.2 - 0.6)
put(25.62, synth(ROOTS[0] * 4, 0.3, 0.001, 0.2, "saw", 2000, 0.12), 0.3)  # tape stop
put(25.7, noise(0.3, 3000, 200, 0.01, 0.1), 0.2)

# ---------- scene transitions ----------
for tt in (6.0, 10.0, 14.0, 18.0, 22.0):
    put(tt - 0.35, whoosh(0.6, 400, 7000, 0.6), 0.22)
    put(tt, kick(120, 40, 0.5, 0.3, 1.6), 0.35)

# ---------- 26-30 · outro ----------
put(26.0, kick(110, 30, 1.8, 0.8, 2.2), 1.0)
put(26.0, noise(1.5, 6000, 100, 0.001, 0.5), 0.3)
for j, f in enumerate([110.0, 220.0, 261.63, 329.63, 493.88]):   # Am(add9)
    put(26.02 + j * 0.02, synth(f, 3.9, 0.02, 1.8, "saw", 1800), 0.05, -0.5 + j * 0.25)
for i in range(8):
    put(26.5 + i * BEAT, synth(ARP[i % len(ARP)], 0.4, 0.002, 0.18, "tri", 5000), 0.07, 0.3 if i % 2 else -0.3)
for i in range(3):
    put(27.4 + i * 0.25, synth(1318.5 + i * 220, 0.5, 0.001, 0.2, "sine"), 0.05)
put(28.0, kick(130, 40, 0.6, 0.4, 1.8), 0.4)

# ---------- master: gentle bus glue + fades ----------
peak = max(max(abs(x) for x in L), max(abs(x) for x in R)) or 1.0
g = 1.1 / peak
here = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, "out", "motion-reel-30s.wav")
os.makedirs(os.path.dirname(path), exist_ok=True)
with wave.open(path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    fr = bytearray()
    for k in range(N):
        fo = min(1.0, (N - k) / (0.8 * SR))
        fr += struct.pack("<hh", int(math.tanh(L[k] * g) * 0.92 * fo * 32767), int(math.tanh(R[k] * g) * 0.92 * fo * 32767))
    w.writeframes(bytes(fr))
print("wrote", path)
