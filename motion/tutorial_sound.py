"""Sound design for tutorial-claude-code.html (stdlib only, no samples).

A soft lo-fi bed under the UI walkthrough, UI foley (clicks, menus, typing, tool checks, render
riser) on the same timeline as the animation, and the real showreel audio (out/reel-audio.wav)
dropped in where the result plays fullscreen.
    python3 tutorial_sound.py out/tutorial-claude-code.wav
"""
import math
import os
import random
import struct
import sys
import wave

SR = 48000
DUR = 59.0
N = int(SR * DUR)
L = [0.0] * N
R = [0.0] * N
rng = random.Random(11)
TAU = 2 * math.pi
HERE = os.path.dirname(os.path.abspath(__file__))


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
            s = 0.6 * s + 0.25 * math.sin(ph * 2.76) + 0.15 * math.sin(ph * 5.4)
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
        c = lo + (hi - lo) * shape
        al = 1 - math.exp(-TAU * c / SR)
        y += al * ((rng.random() * 2 - 1) - y)
        out.append(y * shape * 2.6)
    return out


def kick(f0=150, f1=42, dur=0.5):
    n = int(dur * SR)
    out, ph = [], 0.0
    for k in range(n):
        t = k / SR
        ph += TAU * (f1 + (f0 - f1) * math.exp(-t * 28)) / SR
        out.append(math.tanh(math.sin(ph) * math.exp(-t * 8) * 1.5))
    return out


def click(g=1.0):
    return [a * 0.7 + b for a, b in zip(noise(0.03, 7000, 0.0005, 0.006, 1500), tone(1900, 0.03, 0.0005, 0.008))]


def key():
    f = 2600 + rng.random() * 1400
    return [a + 0.3 * b for a, b in zip(noise(0.035, f, 0.0005, 0.008, 900), tone(f / 2, 0.035, 0.0005, 0.006))]


def pop(f=520):
    return kick(f, f / 2, 0.12)


def riser(dur, f0, f1):
    n = int(dur * SR)
    out, ph = [], 0.0
    for k in range(n):
        p = k / n
        ph += TAU * f0 * (f1 / f0) ** (p * p) / SR
        out.append((math.sin(ph) + 0.3 * math.sin(ph * 2.01)) * p ** 2 * 0.6)
    return out


# ---------------------------------------------------------------- lo-fi bed
BPM = 92
BEAT = 60 / BPM
BAR = BEAT * 4
CHORDS = [[261.63, 329.63, 392.0, 493.88], [220.0, 261.63, 329.63, 392.0],   # Cmaj7, Am7
          [174.61, 220.0, 261.63, 329.63], [196.0, 246.94, 293.66, 392.0]]   # Fmaj7, G
def bed(t0, t1, fade_in=1.0, fade_out=0.8, drums_from=None):
    n0, n1 = int(t0 * SR), int(t1 * SR)
    bar0 = t0
    b = 0
    while bar0 < t1:
        ch = CHORDS[b % 4]
        ln = int(min(BAR, t1 - bar0) * SR) + int(0.6 * SR)
        i0 = int(bar0 * SR)
        phs = [rng.random() * TAU for _ in ch]
        for k in range(ln):
            i = i0 + k
            if i >= n1 + int(0.6 * SR) or i >= N:
                break
            tt = k / SR
            a = min(1, tt / 0.35) * math.exp(-tt * 0.35)
            s = 0.0
            for j, f in enumerate(ch):
                s += math.sin(phs[j] + TAU * f * tt) + 0.25 * math.sin(phs[j] + TAU * f * 2.003 * tt)
            tg = i / SR
            g = min(1, (tg - t0) / fade_in) * max(0, min(1, (t1 - tg) / fade_out)) if tg < t1 else max(0, 1 - (tg - t1) / 0.6) * 0
            s *= a * g * 0.022
            L[i] += s
            R[i] += s * 0.94
        if drums_from is not None:
            for q in range(4):
                tb = bar0 + q * BEAT
                if drums_from <= tb < t1 - 0.2:
                    if q in (0, 2):
                        put(tb, kick(120, 45, 0.35), 0.16)
                    else:
                        put(tb, noise(0.12, 3000, 0.002, 0.05, 400), 0.05, 0.1)
                    put(tb + BEAT / 2, noise(0.05, 9000, 0.001, 0.015, 5000), 0.035, 0.35)
        bar0 += BAR
        b += 1


bed(0.0, 37.9, fade_in=1.2, fade_out=0.6, drums_from=3.4)
bed(53.25, 59.0, fade_in=0.5, fade_out=1.4, drums_from=53.9)

# ---------------------------------------------------------------- intro
put(0.12, whoosh(0.6, 300, 4000, 0.7), 0.12)
put(0.25, tone(1046.5, 1.2, 0.002, 0.5, "bell"), 0.05, -0.2)
for i in range(4):
    put(0.62 + i * 0.14, pop(420 + i * 40), 0.25, -0.3 + i * 0.2)
put(1.05, noise(0.5, 6000, 0.25, 0.12, 2000), 0.06, 0.3)             # marker swipe
put(3.0, whoosh(0.6, 400, 6000, 0.5), 0.12, -0.2)
put(3.35, whoosh(1.0, 200, 3000, 0.75), 0.16)
put(4.35, kick(90, 38, 0.6), 0.35)

# ---------------------------------------------------------------- UI foley
for c in [6.55, 7.3, 9.35, 10.4, 12.1, 18.0]:
    put(c, click(), 0.22, 0.15)
for t in [6.62, 9.42]:
    put(t, pop(700), 0.12, 0.2)
    put(t, noise(0.12, 4000, 0.005, 0.04, 800), 0.05, 0.2)
for t in [7.38, 10.55]:
    put(t, pop(560), 0.08, 0.2)
put(10.42, tone(1318.5, 0.5, 0.002, 0.18, "bell"), 0.07, 0.25)      # model selected
plen = 152
for i in range(plen):
    put(12.45 + i * 4.75 / plen + rng.random() * 0.012, key(), 0.11 + rng.random() * 0.04, -0.15 + rng.random() * 0.3)
put(18.15, whoosh(0.8, 300, 5000, 0.55), 0.14)
put(18.9, tone(784.0, 0.6, 0.002, 0.25, "bell"), 0.05)
for k in range(10):                                                  # thinking shimmer
    put(20.1 + k * 0.15, tone(2093 + 150 * math.sin(k), 0.25, 0.04, 0.08), 0.012, -0.4 + k * 0.08)
for t in [21.7, 22.3, 22.95, 23.55, 24.7, 27.6, 29.0, 30.5, 31.0]:   # items appear
    put(t, pop(900), 0.05, 0.1)
for t in [22.85, 23.35, 24.3, 27.45, 28.85, 30.3, 34.9]:              # tool checks
    put(t, tone(1568.0, 0.45, 0.001, 0.14, "bell"), 0.07, 0.2)
    put(t + 0.06, tone(2093.0, 0.4, 0.001, 0.12, "bell"), 0.04, 0.25)
for i in range(6):
    put(23.7 + i * 0.1 + 0.2, pop(600 + i * 50), 0.08, -0.5 + i * 0.2)
t = 24.85
while t < 27.4:                                                      # code being written
    put(t, key(), 0.05, 0.3)
    t += 0.045 + rng.random() * 0.05
put(27.75, riser(1.05, 300, 900), 0.05, -0.2)
for i in range(4):
    put(29.5 + i * 0.18 + 0.15, pop(800 + i * 80), 0.1, -0.45 + i * 0.3)
put(31.2, riser(3.4, 110, 440), 0.1)
for i in range(30):                                                  # frames ticking, accelerating
    tt = 31.2 + 3.4 * (i / 30) ** 0.8
    put(tt, tone(2400, 0.02, 0.0005, 0.005), 0.04, 0.3)
put(34.62, kick(160, 60, 0.4), 0.2)
put(35.25, tone(1046.5, 1.2, 0.002, 0.5, "bell"), 0.1, -0.2)          # done
put(35.37, tone(1567.98, 1.2, 0.002, 0.5, "bell"), 0.08, 0.2)
put(37.35, whoosh(0.95, 200, 7000, 0.8), 0.22)

# ---------------------------------------------------------------- the real showreel audio
with wave.open(os.path.join(HERE, "out", "reel-audio.wav")) as w:
    assert w.getframerate() == SR and w.getnchannels() == 2
    raw = w.readframes(w.getnframes())
i0 = int(38.25 * SR)
for k in range(len(raw) // 4):
    l, r = struct.unpack_from("<hh", raw, k * 4)
    i = i0 + k
    if i < N:
        L[i] += l / 32767 * 0.9
        R[i] += r / 32767 * 0.9

# ---------------------------------------------------------------- outro
put(53.25, whoosh(0.8, 300, 5000, 0.6), 0.16)
put(53.9, pop(380), 0.25)
put(54.05, pop(460), 0.25)
put(54.4, noise(0.5, 6000, 0.25, 0.12, 2000), 0.06, 0.3)
put(54.5, tone(523.25, 2.5, 0.01, 1.2, "bell"), 0.06, -0.3)
for j, f in enumerate([261.63, 392.0, 493.88, 659.25]):
    put(55.3 + j * 0.05, tone(f, 3.0, 0.01, 1.4, "bell"), 0.05, -0.5 + j * 0.3)
put(55.3, kick(110, 40, 0.8), 0.25)

# ---------------------------------------------------------------- master
peak = max(max(abs(x) for x in L), max(abs(x) for x in R)) or 1.0
g = min(1.0, 0.95 / peak)
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "out", "tutorial-claude-code.wav")
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    frames = bytearray()
    for k in range(N):
        fo = min(1.0, (N - k) / (0.6 * SR))
        tk = k / SR  # lift the UI walkthrough to sit level with the showreel audio
        lift = 1 + 1.2 * (1 - min(1, max(0, (tk - 38.05) / 0.2)) + min(1, max(0, (tk - 53.25) / 0.2)))
        L[k] *= lift
        R[k] *= lift
        frames += struct.pack("<hh", int(math.tanh(L[k] * g) * fo * 32767), int(math.tanh(R[k] * g) * fo * 32767))
    w.writeframes(bytes(frames))
print("wrote", out)
