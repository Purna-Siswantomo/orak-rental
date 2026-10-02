"""Sound design for labs-reel.html (stdlib only, no samples): a quiet, clean bed in D major,
glassy UI cues on every cut, and a soft pulse under the works index.
    python3 labs_sound.py out/labs-reel.wav
"""
import math
import os
import random
import struct
import sys
import wave

SR = 48000
DUR = 30.0
N = int(SR * DUR)
L = [0.0] * N
R = [0.0] * N
rng = random.Random(23)
TAU = 2 * math.pi


def put(t0, samples, gain=1.0, pan=0.0):
    i0 = int(t0 * SR)
    gl, gr = gain * math.cos((pan + 1) * math.pi / 4), gain * math.sin((pan + 1) * math.pi / 4)
    for k, s in enumerate(samples):
        i = i0 + k
        if 0 <= i < N:
            L[i] += s * gl
            R[i] += s * gr


def env(n, a, d):
    na = max(1, int(a * SR))
    return [(k / na if k < na else math.exp(-(k - na) / (d * SR))) for k in range(n)]


def tone(freq, dur, a=0.002, d=0.2, kind="sine"):
    n = int(dur * SR)
    e = env(n, a, d)
    out, ph = [], 0.0
    for k in range(n):
        ph += TAU * freq / SR
        s = math.sin(ph)
        if kind == "bell":
            s = 0.62 * s + 0.24 * math.sin(ph * 2.76) + 0.14 * math.sin(ph * 5.4)
        out.append(s * e[k])
    return out


def noise(dur, lp, a, d, hp=0.0):
    n = int(dur * SR)
    e = env(n, a, d)
    out, y, yh = [], 0.0, 0.0
    al = 1 - math.exp(-TAU * lp / SR)
    ah = 1 - math.exp(-TAU * hp / SR) if hp else 0
    for k in range(n):
        y += al * ((rng.random() * 2 - 1) - y)
        s = y
        if hp:
            yh += ah * (y - yh)
            s = y - yh
        out.append(s * e[k] * 2.2)
    return out


def whoosh(dur=0.5, lo=300, hi=5000, peak=0.6):
    n = int(dur * SR)
    out, y = [], 0.0
    for k in range(n):
        p = k / n
        shape = (p / peak) ** 2 if p < peak else ((1 - p) / (1 - peak)) ** 1.5
        al = 1 - math.exp(-TAU * (lo + (hi - lo) * shape) / SR)
        y += al * ((rng.random() * 2 - 1) - y)
        out.append(y * shape * 2.6)
    return out


def thump(f0=110, f1=38, dur=0.7):
    n = int(dur * SR)
    out, ph = [], 0.0
    for k in range(n):
        t = k / SR
        ph += TAU * (f1 + (f0 - f1) * math.exp(-t * 26)) / SR
        out.append(math.tanh(math.sin(ph) * math.exp(-t * 6) * 1.4))
    return out


def tick(f=3200, g=1.0):
    return [s * g for s in tone(f, 0.025, 0.0004, 0.005)]


# ---------------------------------------------------------------- bed: Dmaj9 <-> Bm9, 4 s each
CH = [[146.83, 220.0, 277.18, 329.63, 440.0], [123.47, 185.0, 220.0, 293.66, 369.99]]
for b in range(8):
    t0 = b * 4.0
    ch = CH[b % 2]
    n = int(4.8 * SR)
    i0 = int(t0 * SR)
    phs = [rng.random() * TAU for _ in ch]
    for k in range(n):
        i = i0 + k
        if i >= N:
            break
        tt = k / SR
        a = min(1, tt / 1.2) * (1 if tt < 4.0 else max(0, 1 - (tt - 4.0) / 0.8))
        s = 0.0
        for j, f in enumerate(ch):
            s += math.sin(phs[j] + TAU * f * tt + 0.3 * math.sin(TAU * 0.2 * tt + j)) * (0.8 if j == 0 else 0.5)
        tg = i / SR
        g = min(1, tg / 2.5) * (0.55 if 9.4 < tg < 23.0 else 1.0) * max(0, min(1, (30 - tg) / 1.2))
        v = s * a * g * 0.028
        L[i] += v
        R[i] += v * (0.92 + 0.08 * math.sin(tg))

# ---------------------------------------------------------------- 00 intro: the sphere draws itself
put(0.15, noise(2.6, 7000, 1.6, 0.6, 2500), 0.05, 0.0)
for i in range(22):
    tt = 0.3 + 2.3 * (i / 22) ** 1.2
    put(tt, tick(2600 + 90 * (i % 7), 0.06), 1.0, -0.7 + (i % 9) * 0.17)
put(1.5, tone(1174.66, 1.6, 0.01, 0.6, "bell"), 0.04, 0.3)
for i, t in enumerate([2.5, 2.65, 2.8]):
    put(t, tone(1567.98 + i * 220, 0.5, 0.001, 0.14, "bell"), 0.06, -0.4 + i * 0.4)

# ---------------------------------------------------------------- 01 the sphere becomes the period
put(4.25, whoosh(1.1, 200, 4500, 0.7), 0.16, 0.2)
for i in range(4):
    put(4.62 + i * 0.07, tick(1800 - i * 120, 0.12), 1.0, -0.3 + i * 0.2)
put(5.33, thump(120, 40, 0.9), 0.5)
put(5.34, tone(587.33, 2.2, 0.002, 0.9, "bell"), 0.08)
put(5.36, tone(880.0, 2.0, 0.002, 0.8, "bell"), 0.05, 0.3)
put(5.5, noise(0.8, 9000, 0.3, 0.25, 4000), 0.03, -0.3)

# ---------------------------------------------------------------- 02 manifesto
put(6.85, whoosh(0.7, 300, 5000, 0.5), 0.1, -0.2)
put(7.2, thump(160, 70, 0.3), 0.18)
put(7.4, thump(180, 80, 0.3), 0.15)
put(8.75, whoosh(0.7, 300, 5000, 0.5), 0.1, 0.2)

# ---------------------------------------------------------------- 03 works index
put(9.0, whoosh(0.8, 200, 6000, 0.75), 0.14)
put(9.7, tick(2200, 0.2))
T0, STEP, TR = 9.6, 1.68, 0.55
for i in range(8):
    tin = T0 + i * STEP
    if i:
        put(tin - TR, whoosh(0.5, 400, 7000, 0.45), 0.08, 0.4)
        put(tin - 0.05, tick(2400 + i * 60, 0.16), 1.0, 0.3)
    put(tin, tone(1318.51 if i % 2 else 1174.66, 0.6, 0.001, 0.2, "bell"), 0.035, -0.3)
beat = 9.6
while beat < 22.8:                       # soft pulse, one hit per half work
    put(beat, thump(90, 42, 0.45), 0.2)
    put(beat + 0.42, noise(0.06, 9000, 0.001, 0.018, 6000), 0.03, 0.35)
    beat += 0.84
put(22.85, whoosh(0.6, 5000, 300, 0.3), 0.1)

# ---------------------------------------------------------------- 04 numbers
for a, v in [(23.45, 7), (23.62, 3), (23.79, 12)]:
    for k in range(v):
        put(a + 0.05 + 0.95 * (1 - (1 - (k + 1) / v) ** 3), tick(2800, 0.08), 1.0, 0.2)
    put(a + 0.6, thump(150, 60, 0.35), 0.18)
put(24.5, tone(659.25, 1.8, 0.01, 0.8, "bell"), 0.04, 0.4)
put(25.95, whoosh(0.6, 300, 5000, 0.5), 0.09)

# ---------------------------------------------------------------- 05 outro lock-up
put(26.35, noise(1.4, 7000, 0.9, 0.4, 2500), 0.05)
for i in range(12):
    put(26.4 + 1.2 * (i / 12) ** 1.2, tick(2600 + 80 * (i % 5), 0.05), 1.0, -0.6 + (i % 7) * 0.2)
put(27.55, whoosh(1.0, 200, 4500, 0.75), 0.14, -0.2)
for i in range(4):
    put(27.52 + i * 0.07, tick(1800 - i * 120, 0.1), 1.0, -0.3 + i * 0.2)
put(28.48, thump(120, 38, 1.2), 0.55)
for j, f in enumerate([293.66, 440.0, 554.37, 659.25, 880.0]):
    put(28.5 + j * 0.03, tone(f, 1.6, 0.003, 0.9, "bell"), 0.06, -0.6 + j * 0.3)

# ---------------------------------------------------------------- master
peak = max(max(abs(x) for x in L), max(abs(x) for x in R)) or 1.0
g = 0.9 / peak
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "out", "labs-reel.wav")
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    frames = bytearray()
    for k in range(N):
        fo = min(1.0, (N - k) / (0.4 * SR))
        frames += struct.pack("<hh", int(math.tanh(L[k] * g) * fo * 32767), int(math.tanh(R[k] * g) * fo * 32767))
    w.writeframes(bytes(frames))
print("wrote", out)
