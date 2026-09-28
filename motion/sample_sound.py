"""Procedural sound design for the 15 s Instagram sample (sample.html), stdlib only.

    python3 sample_sound.py [out.wav]      (default: out/otak-rental-sample-15s.wav)

Cues follow sample.html's timeline: a light ad-style groove under the client promo, plus foley
(ice clinks, pour, splash, stamp) and hits on every cut.
"""
import math
import os
import random
import struct
import sys
import wave

SR = 48000
DUR = 15.0
N = int(SR * DUR)
L = [0.0] * N
R = [0.0] * N
rng = random.Random(11)
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


def kick(f0=150, f1=42, dur=0.5, click=0.4):
    n, out, ph = int(dur * SR), [], 0.0
    for k in range(n):
        t = k / SR
        ph += TAU * (f1 + (f0 - f1) * math.exp(-t * 28)) / SR
        s = math.sin(ph) * math.exp(-t * 7)
        if k < 240:
            s += click * (rng.random() * 2 - 1) * (1 - k / 240)
        out.append(math.tanh(s * 1.6))
    return out


def noise(dur, lp_from, lp_to, a, d, hp=0.0):
    n, e = int(dur * SR), env(int(dur * SR), a, d)
    out, y, yh = [], 0.0, 0.0
    for k in range(n):
        c = lp_from + (lp_to - lp_from) * (k / n)
        y += (1 - math.exp(-TAU * c / SR)) * ((rng.random() * 2 - 1) - y)
        s = y
        if hp:
            yh += (1 - math.exp(-TAU * hp / SR)) * (y - yh)
            s = y - yh
        out.append(s * e[k] * 2.2)
    return out


def whoosh(dur=0.5, lo=300, hi=5000, peak=0.6):
    n, out, y = int(dur * SR), [], 0.0
    for k in range(n):
        p = k / n
        shape = (p / peak) ** 2 if p < peak else ((1 - p) / (1 - peak)) ** 1.5
        y += (1 - math.exp(-TAU * (lo + (hi - lo) * shape) / SR)) * ((rng.random() * 2 - 1) - y)
        out.append(y * shape * 2.6)
    return out


def tone(freq, dur, a=0.002, d=0.2, kind="sine", glide=1.0):
    n, e = int(dur * SR), env(int(dur * SR), a, d)
    out, ph = [], 0.0
    for k in range(n):
        f = freq * (glide ** (k / n))
        ph += TAU * f / SR
        s = math.sin(ph)
        if kind == "bell":
            s = 0.6 * s + 0.25 * math.sin(ph * 2.76) + 0.15 * math.sin(ph * 5.4)
        elif kind == "tri":
            s = 2 / math.pi * math.asin(math.sin(ph))
        elif kind == "pluck":
            s = 0.7 * s + 0.3 * math.sin(ph * 2) * math.exp(-k / SR * 12)
        out.append(s * e[k])
    return out


def tick(freq=2600, g=1.0):
    return [s * g for s in tone(freq, 0.03, 0.0005, 0.006)]


def riser(dur, f0, f1):
    n, out, ph = int(dur * SR), [], 0.0
    for k in range(n):
        p = k / n
        ph += TAU * f0 * (f1 / f0) ** (p * p) / SR
        out.append((math.sin(ph) + 0.3 * math.sin(ph * 2.01)) * p ** 2 * 0.6)
    return out


def clink(f=3100):
    """Ice against glass: two inharmonic bell partials, very short."""
    a, b = tone(f, 0.35, 0.0005, 0.07, "bell"), tone(f * 1.47, 0.25, 0.0005, 0.04)
    return [x + 0.5 * y for x, y in zip(a, b + [0.0] * (len(a) - len(b)))]


# ------------------------------------------------------------------ groove (client promo bed)
BPM = 112
beat = 60 / BPM
bass = [65.41, 65.41, 87.31, 98.0]  # C2 C2 F2 G2, one note per bar
t = 1.02
i = 0
while t < 13.3:
    duck = 0.35 if 6.5 < t < 7.05 else 1.0
    if i % 2 == 0:
        put(t, kick(110, 45, 0.3, 0.2), 0.32 * duck)
    put(t + beat / 2, noise(0.05, 9000, 7000, 0.001, 0.012, 5000), 0.10 * duck, 0.25)
    put(t, tone(bass[(i // 4) % 4], beat * 0.9, 0.004, 0.18, "pluck"), 0.22 * duck)
    if i % 4 == 2:
        put(t, noise(0.12, 6000, 3000, 0.001, 0.05, 1200), 0.14 * duck)  # snare-ish
    t += beat
    i += 1

# ------------------------------------------------------------------ A · intro
put(0.40, kick(130, 60, 0.22, 0.2), 0.35)
put(0.60, riser(0.5, 200, 900), 0.25)
put(0.80, whoosh(0.35, 300, 5000, 0.8), 0.35)

# ------------------------------------------------------------------ B · hook
put(1.02, kick(150, 38, 0.8, 0.5), 0.95)
put(1.02, noise(0.4, 7000, 1500, 0.001, 0.1), 0.35)
for k in range(6):
    put(1.32 + k * 0.04, tone(500 + k * 40, 0.08, 0.001, 0.03, "tri"), 0.07, -0.5 + k * 0.2)
for k in range(24):
    put(1.75 + k * 0.025, tick(3000 + rng.random() * 500, 0.1), 1.0, 0.2)
put(2.00, tone(440, 0.08, 0.002, 0.03), 0.08)
put(2.12, tone(330, 0.12, 0.002, 0.05), 0.08)
put(2.55, tone(1400, 0.4, 0.02, 0.4, "sine", 0.35), 0.10)          # falling drop
put(2.95, kick(90, 40, 0.5, 0.3), 0.7)
put(2.95, noise(0.5, 5000, 1200, 0.001, 0.12, 400), 0.45)           # splash
for k in range(6):
    put(2.97 + k * 0.03, tone(1800 + rng.random() * 1400, 0.1, 0.001, 0.03, "bell"), 0.05, rng.random() * 1.6 - 0.8)
put(3.00, whoosh(0.45, 500, 6000, 0.35), 0.3)

# ------------------------------------------------------------------ C · product build
put(3.25, whoosh(0.5, 300, 2500, 0.5), 0.15, -0.3)
# pour: gurgling filtered noise with a wobble
n = int(0.9 * SR)
pour, y = [], 0.0
for k in range(n):
    tt = k / SR
    c = 900 + 500 * math.sin(tt * 38) + 300 * math.sin(tt * 91)
    y += (1 - math.exp(-TAU * c / SR)) * ((rng.random() * 2 - 1) - y)
    pour.append(y * 2.2 * min(1, tt / 0.1) * min(1, (0.9 - tt) / 0.2))
put(3.62, pour, 0.35)
put(4.02, noise(0.6, 2500, 1800, 0.05, 0.3, 700), 0.18, 0.1)       # espresso stream
for k, tt in enumerate([4.53, 4.63, 4.73]):                          # ice drops + clinks
    put(tt, clink(2800 + k * 350), 0.22, [-.4, .4, 0][k])
    put(tt + 0.09, clink(3300 + k * 300), 0.08, [-.4, .4, 0][k])
put(4.85, whoosh(0.3, 800, 6000, 0.7), 0.18, 0.4)                   # straw
put(5.12, tone(700, 0.12, 0.002, 0.04, "tri"), 0.1, 0.4)
put(5.00, noise(1.4, 9000, 9000, 0.3, 0.6, 4000), 0.05)             # fizz / condensation
for k in range(3):
    put(5.2 + k * 0.18, tone(1320 * 2 ** (k * 4 / 12), 0.18, 0.001, 0.07, "bell"), 0.09, [-.6, .6, .6][k])
put(6.50, riser(0.5, 250, 2200), 0.35)                              # zoom into the cup

# ------------------------------------------------------------------ D · beats
put(7.00, kick(170, 40, 0.6, 0.6), 0.9)
for k, f in enumerate([2349, 2793, 3136]):
    put(7.02 + k * 0.04, tone(f, 0.6, 0.001, 0.25, "bell"), 0.05, -0.4 + k * 0.4)  # icy shimmer
put(7.72, whoosh(0.3, 400, 6000, 0.7), 0.3)
put(7.92, kick(160, 42, 0.5, 0.5), 0.8)
for k in range(10):
    put(8.05 + k * 0.045, tick(1800 + k * 60, 0.15), 1.0)            # sugar slider
put(8.57, whoosh(0.3, 400, 6000, 0.7), 0.3)
put(8.77, kick(160, 42, 0.5, 0.5), 0.8)
put(8.80, noise(0.25, 8000, 3000, 0.001, 0.05, 2000), 0.2)           # bolt zap
put(9.05, kick(120, 32, 0.8, 0.7), 1.0)                              # stamp slam
put(9.05, noise(0.3, 3000, 600, 0.001, 0.08), 0.45)
put(9.42, whoosh(0.35, 5000, 400, 0.4), 0.3)

# ------------------------------------------------------------------ E · promo
put(9.62, tone(880, 0.15, 0.001, 0.05, "tri"), 0.12)
put(9.95, noise(0.25, 1500, 7000, 0.02, 0.1, 800), 0.3, -0.2)        # strike swipe
tt = 10.15
while tt < 10.72:                                                    # counter roll
    p = (tt - 10.15) / 0.57
    put(tt, tick(2200, 0.22 * (1 - 0.6 * p)), 1.0)
    tt += 0.02 + 0.08 * p * p
put(10.72, tone(1568, 0.8, 0.002, 0.3, "bell"), 0.14)                # "ka-ching"
put(10.78, tone(2093, 0.8, 0.002, 0.3, "bell"), 0.1)
put(10.35, kick(260, 130, 0.12, 0.3), 0.35, 0.5)                     # badge pop
for k in range(len("CUMA MINGGU INI · SELAMA STOK ADA")):
    if k % 2 == 0:
        put(10.5 + k * 0.014, tick(3200, 0.08), 1.0, -0.1)
for k in range(3):
    put(10.7 + k * 0.08, kick(300, 160, 0.1, 0.3), 0.25, -0.5 + k * 0.5)
put(11.42, whoosh(0.4, 5000, 500, 0.3), 0.3)

# ------------------------------------------------------------------ F · brand
put(11.72, tone(1100, 0.36, 0.02, 0.4, "sine", 0.4), 0.08)           # bean falls
put(12.08, kick(120, 35, 0.9, 0.5), 0.9)
for j, f in enumerate([174.61, 220.0, 261.63, 329.63, 392.0]):       # F maj9 bloom
    put(12.1 + j * 0.03, tone(f, 1.3, 0.01, 0.7, "bell"), 0.08, -0.6 + j * 0.3)
for k in range(10):
    put(12.1 + k * 0.035, tick(1300 + k * 70, 0.07), 1.0, -0.5 + k * 0.1)
put(12.70, kick(300, 150, 0.12, 0.3), 0.3)

# ------------------------------------------------------------------ G · portfolio zoom-out
put(13.30, whoosh(0.7, 4000, 300, 0.45), 0.4)
put(13.90, kick(320, 170, 0.1, 0.3), 0.25, -0.4)
put(14.20, noise(0.25, 1200, 6000, 0.02, 0.08, 800), 0.18)           # lime marker
for j, f in enumerate([523.25, 659.25, 783.99, 1046.5]):             # Otak Rental ding
    put(14.3 + j * 0.04, tone(f, 0.7, 0.002, 0.35, "bell"), 0.09, -0.3 + j * 0.2)

# ------------------------------------------------------------------ master
peak = max(max(abs(x) for x in L), max(abs(x) for x in R)) or 1.0
g = 0.89 / peak
here = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, "out", "otak-rental-sample-15s.wav")
os.makedirs(os.path.dirname(path), exist_ok=True)
with wave.open(path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    frames = bytearray()
    for k in range(N):
        fo = min(1.0, (N - k) / (0.3 * SR))
        frames += struct.pack("<hh", int(math.tanh(L[k] * g) * fo * 32767), int(math.tanh(R[k] * g) * fo * 32767))
    w.writeframes(bytes(frames))
print("wrote", path)
