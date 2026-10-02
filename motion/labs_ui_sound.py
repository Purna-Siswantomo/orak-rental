"""Sound for labs-ui-object.html (stdlib only): soft UI foley on the object's timeline
(morph swishes, clicks, slider ticks, toggle, typing, render riser, done chime) over a very quiet pad.
    python3 labs_ui_sound.py out/labs-ui-object.wav
"""
import math
import os
import random
import struct
import sys
import wave

SR = 48000
DUR = 16.4
N = int(SR * DUR)
L = [0.0] * N
R = [0.0] * N
rng = random.Random(5)
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


def tone(freq, dur, a=0.002, d=0.2, bell=False):
    n = int(dur * SR)
    e = env(n, a, d)
    out, ph = [], 0.0
    for k in range(n):
        ph += TAU * freq / SR
        s = math.sin(ph)
        if bell:
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


def swish(dur=0.42, lo=500, hi=4500):
    n = int(dur * SR)
    out, y = [], 0.0
    for k in range(n):
        p = k / n
        shape = math.sin(math.pi * p) ** 2
        al = 1 - math.exp(-TAU * (lo + (hi - lo) * shape) / SR)
        y += al * ((rng.random() * 2 - 1) - y)
        out.append(y * shape * 2.4)
    return out


def click():
    return [a * 0.6 + b for a, b in zip(noise(0.025, 8000, 0.0004, 0.005, 1800), tone(2100, 0.025, 0.0004, 0.006))]


def thock(f=260):
    n = int(0.12 * SR)
    out, ph = [], 0.0
    for k in range(n):
        t = k / SR
        ph += TAU * (f * 0.6 + f * 0.4 * math.exp(-t * 40)) / SR
        out.append(math.sin(ph) * math.exp(-t * 38))
    return out


def tick(f=3000):
    return tone(f, 0.02, 0.0003, 0.004)


# quiet pad (Dmaj9), fades in and out so the loop point is seamless
for f, g in [(146.83, 1.0), (220.0, .6), (277.18, .45), (329.63, .4), (440.0, .25)]:
    ph = rng.random() * TAU
    for k in range(N):
        t = k / SR
        a = min(1, t / 1.0, (DUR - t) / 1.0)
        v = math.sin(ph + TAU * f * t + 0.25 * math.sin(TAU * 0.13 * t)) * g * a * 0.012
        L[k] += v
        R[k] += v * 0.95

# morph swishes (one per state change)
for i, t in enumerate([.7, 2.5, 3.4, 4.7, 6.55, 8.3, 9.4, 10.75, 12.75, 14.1, 15.2, 15.85]):
    put(t, swish(0.46, 400, 4200 + 300 * (i % 3)), 0.07, -0.3 + 0.06 * i)
    put(t + 0.36, thock(200 + 20 * (i % 4)), 0.1)
# clicks
for c in [.6, 3.33, 4.22, 9.08, 10.08, 10.5, 13.96]:
    put(c, click(), 0.3, 0.15)
# loader ticks + success
for i in range(10):
    put(0.98 + i * 0.1, tick(2600 + 40 * i), 0.04, -0.2 + 0.04 * i)
put(2.1, tone(1318.51, 0.7, 0.002, 0.25, True), 0.09)
put(2.18, tone(1975.53, 0.7, 0.002, 0.25, True), 0.06, 0.2)
# player start
put(4.25, tone(587.33, 0.9, 0.004, 0.4, True), 0.06, -0.2)
# scrub ticks (a tick per timeline tick passed) + volume steps
for t in [5.6, 5.85, 6.1]:
    put(t, tick(2400), 0.12, 0.2)
for i in range(12):
    put(7.18 + 0.82 * (1 - (1 - i / 12) ** 2), tick(1800 + i * 90), 0.06, -0.1)
put(8.0, tone(1567.98, 0.5, 0.002, 0.18, True), 0.06)
# toggle
put(9.12, thock(320), 0.25)
put(9.2, tick(3400), 0.08)
# tabs
put(10.1, thock(380), 0.12)
put(10.52, thock(420), 0.12)
# chart: soft rising shimmer while the line draws, pop on tooltip
for i in range(8):
    put(11.15 + i * 0.085, tone(880 * 2 ** (i / 12 * 2), 0.18, 0.002, 0.06), 0.035, -0.4 + i * 0.1)
put(11.9, thock(500), 0.1)
put(12.2, tick(2800), 0.06)
# typing + enter
for i in range(4):
    put(13.28 + i * 0.11, [a + 0.3 * b for a, b in zip(noise(0.03, 3500 + 400 * i, 0.0004, 0.007, 900), tone(1700 + 100 * i, 0.03, 0.0004, 0.005))], 0.12, 0.1)
put(13.96, thock(240), 0.14)
# render riser + done
n = int(0.62 * SR)
ph = 0.0
ris = []
for k in range(n):
    p = k / n
    ph += TAU * 300 * (2.6 ** p) / SR
    ris.append(math.sin(ph) * p * p * 0.5)
put(14.55, ris, 0.12)
put(15.22, tone(1046.5, 1.0, 0.002, 0.4, True), 0.1, -0.2)
put(15.3, tone(1567.98, 0.9, 0.002, 0.35, True), 0.07, 0.2)

peak = max(max(abs(x) for x in L), max(abs(x) for x in R)) or 1.0
g = 0.85 / peak
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "out", "labs-ui-object.wav")
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    fr = bytearray()
    for k in range(N):
        fr += struct.pack("<hh", int(math.tanh(L[k] * g) * 32767), int(math.tanh(R[k] * g) * 32767))
    w.writeframes(bytes(fr))
print("wrote", out)
