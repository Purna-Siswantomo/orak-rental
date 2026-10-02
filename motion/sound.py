"""Procedural sound design for the Otak Rental reel (stdlib only, no samples).

Every cue is synthesised and placed on the same timeline as showreel.html:
    python3 sound.py            -> out/reel-audio.wav  (48 kHz, stereo, 15 s)
"""
import math
import os
import random
import struct
import wave

SR = 48000
DUR = 15.0
N = int(SR * DUR)
L = [0.0] * N
R = [0.0] * N
rng = random.Random(7)
TAU = 2 * math.pi


def put(t0, samples, gain=1.0, pan=0.0):
    """Mix a mono buffer into the stereo bus at time t0 (pan -1..1)."""
    i0 = int(t0 * SR)
    gl, gr = gain * math.cos((pan + 1) * math.pi / 4), gain * math.sin((pan + 1) * math.pi / 4)
    for k, s in enumerate(samples):
        i = i0 + k
        if 0 <= i < N:
            L[i] += s * gl
            R[i] += s * gr


def env(n, a, d):
    """Attack/exponential-decay envelope, a and d in seconds."""
    na = max(1, int(a * SR))
    return [(k / na if k < na else math.exp(-(k - na) / (d * SR))) for k in range(n)]


def kick(f0=150, f1=42, dur=0.5, click=0.4):
    n = int(dur * SR)
    out, ph = [], 0.0
    for k in range(n):
        t = k / SR
        f = f1 + (f0 - f1) * math.exp(-t * 28)
        ph += TAU * f / SR
        s = math.sin(ph) * math.exp(-t * 7)
        if k < 240:
            s += click * (rng.random() * 2 - 1) * (1 - k / 240)
        out.append(math.tanh(s * 1.6))
    return out


def noise(dur, lp_from, lp_to, a, d, hp=0.0):
    """Filtered noise with a moving one-pole low-pass (cutoff Hz sweeps from->to)."""
    n = int(dur * SR)
    e = env(n, a, d)
    out, y, yh = [], 0.0, 0.0
    for k in range(n):
        c = lp_from + (lp_to - lp_from) * (k / n)
        al = 1 - math.exp(-TAU * c / SR)
        x = rng.random() * 2 - 1
        y += al * (x - y)
        s = y
        if hp:
            ah = 1 - math.exp(-TAU * hp / SR)
            yh += ah * (y - yh)
            s = y - yh
        out.append(s * e[k] * 2.2)
    return out


def whoosh(dur=0.5, lo=300, hi=5000, peak=0.6):
    """Swell-in / swell-out filtered noise, peak = relative position of the loudest point."""
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


def tone(freq, dur, a=0.002, d=0.2, kind="sine", bend=0.0):
    n = int(dur * SR)
    e = env(n, a, d)
    out, ph = [], 0.0
    for k in range(n):
        f = freq * (1 + bend * math.exp(-k / SR * 30))
        ph += TAU * f / SR
        s = math.sin(ph)
        if kind == "bell":
            s = 0.6 * s + 0.25 * math.sin(ph * 2.76) + 0.15 * math.sin(ph * 5.4)
        elif kind == "tri":
            s = 2 / math.pi * math.asin(math.sin(ph))
        out.append(s * e[k])
    return out


def tick(freq=2600, g=1.0):
    return [s * g for s in tone(freq, 0.03, 0.0005, 0.006, "sine")]


def riser(dur, f0, f1):
    n = int(dur * SR)
    out, ph = [], 0.0
    for k in range(n):
        p = k / n
        f = f0 * (f1 / f0) ** (p * p)
        ph += TAU * f / SR
        out.append((math.sin(ph) + 0.3 * math.sin(ph * 2.01)) * p ** 2 * 0.6)
    return out


# ---------------------------------------------------------------- bed
# soft two-note drone that swells toward the logo, keeps the reel glued together
for k in range(N):
    t = k / SR
    sw = 0.25 + 0.75 * min(1, t / 13.5)
    fade = min(1, t / 0.6) * (1 - max(0, (t - 14.4) / 0.6))
    duck = 0.25 if 11.3 < t < 12.8 else 1.0
    s = (math.sin(TAU * 73.42 * t) + 0.5 * math.sin(TAU * 110.0 * t + math.sin(t * 0.7))) * 0.035 * sw * fade * duck
    L[k] += s
    R[k] += s * 0.95

# ---------------------------------------------------------------- 01 spark
put(0.50, kick(120, 60, 0.25, 0.2), 0.35)                      # first bounce
put(0.98, kick(170, 40, 0.7, 0.5), 0.9)                        # impact / burst
put(0.98, noise(0.6, 6000, 1500, 0.001, 0.12), 0.25)
for i in range(8):                                             # dots pop out
    put(1.00 + i * 0.014, tone(1200 + i * 90, 0.08, 0.001, 0.03, "tri"), 0.07, -0.8 + i * 0.22)
put(1.35, whoosh(0.8, 200, 3500, 0.55), 0.35, -0.3)            # emblem spin
for i, ch in enumerate("> sewa otak teknis"):                  # boot typing
    put(1.30 + i * 0.03, tick(3200 + rng.random() * 600, 0.10), 1.0, 0.2)
put(2.05, riser(0.56, 180, 1400), 0.35)                        # lime iris riser
put(2.60, kick(90, 35, 0.6, 0.3), 0.6)
put(2.60, whoosh(0.5, 400, 7000, 0.15), 0.35)

# ---------------------------------------------------------------- 02 deadline
for i in range(8):                                             # letters rise
    put(2.72 + i * 0.04, tone(420 + i * 30, 0.1, 0.001, 0.04, "tri"), 0.06, -0.6 + i * 0.17)
for i in range(7):                                             # task chips land
    put(3.30 + i * 0.1, kick(260, 120, 0.12, 0.3), 0.25, [-.7, .7, -.8, .8, -.5, .5, 0][i])
# countdown ticks that accelerate with the clock
tt = 3.05
while tt < 4.32:
    p = (tt - 3.05) / 1.27
    put(tt, tick(1800 + 900 * p, 0.35), 1.0)
    tt += 0.16 * (1 - p) ** 1.4 + 0.035
put(3.70, riser(0.62, 60, 240), 0.5)                            # tension
put(4.32, noise(0.26, 900, 5000, 0.02, 0.12, 600), 0.45, 0.2)   # marker swipe
put(4.45, whoosh(0.45, 5000, 300, 0.85), 0.4)                   # suction
put(4.88, kick(140, 38, 0.8, 0.45), 0.85)                      # tagline hit
put(4.88, tone(146.8, 1.0, 0.005, 0.5, "tri"), 0.12)
for i in range(6):                                             # wipe bars
    put(5.46 + i * 0.03, whoosh(0.32, 500, 6000, 0.7), 0.12, -0.9 + i * 0.35)
for i in range(6):
    put(5.88 + i * 0.03, whoosh(0.32, 500, 6000, 0.3), 0.10, 0.9 - i * 0.35)

# ---------------------------------------------------------------- 03 formula
for i in range(5):                                             # tile flips
    put(6.40 + i * 0.1, kick(320, 160, 0.09, 0.6), 0.22, -0.8 + i * 0.4)
    put(6.25 + i * 0.1, noise(0.18, 3000, 8000, 0.01, 0.05, 1500), 0.10, -0.8 + i * 0.4)
for i in range(4):                                             # operator pops
    put(6.62 + i * 0.1, tone(880 * 2 ** (i / 12 * 4), 0.15, 0.001, 0.06, "bell"), 0.08, -0.6 + i * 0.4)
put(7.25, riser(0.7, 500, 1500), 0.15)                          # scanner sweep
for i in range(5):
    put(7.33 + i * 0.13, tone(1568, 0.12, 0.001, 0.05, "bell"), 0.07, -0.8 + i * 0.4)
put(7.95, whoosh(0.35, 300, 2500, 0.3), 0.2)
tt = 8.08                                                      # counter roll
while tt < 8.66:
    p = (tt - 8.08) / 0.6
    put(tt, tick(2400, 0.22 * (1 - p * 0.6)), 1.0)
    tt += 0.02 + 0.09 * p ** 2
put(8.66, tone(1174.7, 0.9, 0.002, 0.35, "bell"), 0.16)         # "ding" on the total
put(8.66, tone(1760.0, 0.9, 0.002, 0.3, "bell"), 0.08)

# ---------------------------------------------------------------- 04 services
put(8.62, whoosh(0.7, 200, 4200, 0.6), 0.4, -0.3)               # hero morph
for i in range(5):                                             # cards slam
    put(9.36 + i * 0.09, kick(200, 70, 0.2, 0.5), 0.35, -0.2 + i * 0.25)
for i in range(6):                                             # tag chips
    put(9.60 + i * 0.05, tick(2000 + i * 180, 0.12), 1.0, -0.5)
put(10.9, whoosh(0.5, 300, 6000, 0.8), 0.4, 0.3)                # fly out

# ---------------------------------------------------------------- 05 proof
for i in range(4):
    t0 = 11.35 + i * 0.36
    put(t0, kick(180, 45, 0.35, 0.6), 0.95)
    put(t0, noise(0.12, 7000, 3000, 0.001, 0.035, 1200), 0.35)
    put(t0 + 0.18, tick(4200, 0.18), 1.0, 0.6 if i % 2 else -0.6)
put(12.60, riser(0.46, 300, 2000), 0.3)
put(12.70, whoosh(0.4, 6000, 400, 0.9), 0.35)                   # collapse

# ---------------------------------------------------------------- 06 resolve
for i in range(8):
    put(12.98 + i * 0.015, whoosh(0.4, 400, 5000, 0.85), 0.06, -1 + i * 0.28)
put(13.20, riser(0.3, 200, 900), 0.3)
put(13.50, kick(110, 30, 1.6, 0.6), 1.0)                        # the drop
put(13.50, noise(1.2, 5000, 600, 0.001, 0.35), 0.3)
for j, f in enumerate([293.66, 369.99, 440.0, 659.25, 880.0]):  # D major add9 bloom
    put(13.52 + j * 0.03, tone(f, 1.5, 0.01, 0.8, "bell"), 0.09, -0.6 + j * 0.3)
for i in range(5):                                             # sparkles
    put(13.62 + i * 0.07, tone(2349.3 * 2 ** ((i % 3) / 12 * 5), 0.4, 0.001, 0.15, "bell"), 0.05, -0.5 + i * 0.25)
for i in range(11):                                            # wordmark letters
    put(13.88 + i * 0.035, tick(1400 + i * 60, 0.08), 1.0, -0.6 + i * 0.12)
put(14.28, kick(300, 150, 0.12, 0.3), 0.3, -0.2)                # CTA pops
put(14.38, kick(340, 170, 0.12, 0.3), 0.25, 0.2)
put(14.45, noise(0.5, 3000, 9000, 0.2, 0.1, 2500), 0.08, 0.4)   # sheen

# ---------------------------------------------------------------- master
peak = max(max(abs(x) for x in L), max(abs(x) for x in R)) or 1.0
g = 0.89 / peak
os.makedirs(os.path.join(os.path.dirname(__file__) or ".", "out"), exist_ok=True)
path = os.path.join(os.path.dirname(__file__) or ".", "out", "reel-audio.wav")
with wave.open(path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    frames = bytearray()
    for k in range(N):
        fo = min(1.0, (N - k) / (0.25 * SR))  # tail fade
        frames += struct.pack("<hh", int(math.tanh(L[k] * g) * fo * 32767), int(math.tanh(R[k] * g) * fo * 32767))
    w.writeframes(bytes(frames))
print("wrote", path)
