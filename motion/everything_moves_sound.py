"""Original score for everything-moves.html (30 s, 120 BPM), stdlib only.

0-5 heartbeat + air, the line's shimmer and a wobbling sine as it vibrates; 5-10 drone and a
slow pluck arpeggio as the ridgelines rise; 10-15 synthwave pulse under the sun, riser into it;
15-20 tunnel: driving hats, word hits, snare roll; 20 DROP (bloom); 25 reverse suck to silence;
26-30 title chord and bell.
    python3 everything_moves_sound.py [out.wav]   (default: out/everything-moves.wav)
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
rng = random.Random(7)
TAU = 2 * math.pi


def put(t0, s, g=1.0, pan=0.0):
    i0 = int(t0 * SR)
    gl, gr = g * math.cos((pan + 1) * math.pi / 4), g * math.sin((pan + 1) * math.pi / 4)
    for k, v in enumerate(s):
        i = i0 + k
        if 0 <= i < N:
            L[i] += v * gl
            R[i] += v * gr


def env(n, a, d):
    na = max(1, int(a * SR))
    return [(k / na if k < na else math.exp(-(k - na) / (d * SR))) for k in range(n)]


def kick(f0=160, f1=42, dur=0.45, click=0.4, drive=2.0):
    out, ph = [], 0.0
    for k in range(int(dur * SR)):
        t = k / SR
        ph += TAU * (f1 + (f0 - f1) * math.exp(-t * 30)) / SR
        v = math.sin(ph) * math.exp(-t * 7)
        if k < 200:
            v += click * (rng.random() * 2 - 1) * (1 - k / 200)
        out.append(math.tanh(v * drive))
    return out


def noise(dur, lp, hp, a, d):
    n = int(dur * SR)
    e = env(n, a, d)
    out, y, yh = [], 0.0, 0.0
    al, ah = 1 - math.exp(-TAU * lp / SR), 1 - math.exp(-TAU * hp / SR)
    for k in range(n):
        y += al * ((rng.random() * 2 - 1) - y)
        yh += ah * (y - yh)
        out.append((y - yh) * e[k] * 2.5)
    return out


def tone(f, dur, a=0.005, d=0.3, kind="sine", cutoff=4000, glide=1.0):
    n = int(dur * SR)
    e = env(n, a, d)
    out, ph, y = [], 0.0, 0.0
    al = 1 - math.exp(-TAU * cutoff / SR)
    for k in range(n):
        ph += f * (glide ** (k / n)) / SR
        p = ph % 1.0
        v = {"saw": 2 * p - 1, "sq": 1 if p < .5 else -1, "tri": 4 * abs(p - .5) - 1}.get(kind, math.sin(TAU * p))
        if kind == "bell":
            v = .6 * math.sin(TAU * p) + .25 * math.sin(TAU * p * 2.76) + .15 * math.sin(TAU * p * 5.4)
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


def riser(dur, f0, f1, noisy=0.25):
    n, out, ph = int(dur * SR), [], 0.0
    for k in range(n):
        p = k / n
        ph += TAU * f0 * (f1 / f0) ** (p * p) / SR
        out.append((math.sin(ph) + .35 * math.sin(ph * 2.01) + noisy * (rng.random() * 2 - 1) * p) * p ** 2 * .5)
    return out


# D minor world: Dm - Bb - F - C
CH = [[146.83, 174.61, 220.0], [116.54, 146.83, 174.61], [174.61, 220.0, 261.63], [130.81, 164.81, 196.0]]
ROOT = [73.42, 58.27, 87.31, 65.41]
ARP = [587.33, 698.46, 880.0, 698.46, 783.99, 659.25, 587.33, 523.25]
bar = lambda t: int(t // 2) % 4

# ---------- continuous beds (sample loops) ----------
for k in range(N):
    t = k / SR
    v = 0.0
    # air/drone: 0-20, swells with the terrain
    if t < 20.0:
        amp = .022 * min(1, t / 1.5) * (1 + 1.2 * min(1, max(0, t - 5) / 5)) * (1 - max(0, (t - 19.4) / .6))
        c = CH[bar(t)] if t > 5 else [146.83, 220.0]
        v += sum(math.sin(TAU * f * t + i * 1.3) * (1 - i * .2) for i, f in enumerate(c)) * amp
    # vibrating line (act 1): sine with wobble
    if 3.8 < t < 5.6:
        e = min(1, (t - 3.8) / .8) * min(1, (5.6 - t) / .5)
        v += math.sin(TAU * 110 * t + 3 * math.sin(TAU * 7 * t)) * .05 * e
    # title pad
    if t > 26.0:
        e = min(1, (t - 26.0) / .8) * min(1, (30 - t) / 1.4)
        v += sum(math.sin(TAU * f * t + i) for i, f in enumerate([146.83, 220.0, 261.63, 329.63, 440.0])) * .02 * e
    L[k] += v
    R[k] += v * .96

# ---------- act 1: heartbeat, line birth ----------
for bt in (.6, .85, 1.5, 1.75):
    put(bt, kick(70, 38, .5, .05, 1.4), .75)
put(2.0, whoosh(1.0, 300, 9000, .35), .3)
put(2.0, tone(880, 1.4, .01, .7, "bell"), .07)
put(2.05, tone(1318.5, 1.2, .01, .6, "bell"), .05, .4)

# ---------- act 2: plucks as ridges rise ----------
for i in range(20):
    tt = 5.0 + i * BEAT
    if tt >= 10:
        break
    put(tt, tone(ARP[i % 8] / 2, .5, .002, .22, "tri", 3000), .08, .35 if i % 2 else -.35)
put(7.5, kick(90, 40, .5, .1, 1.5), .4)
put(8.5, kick(90, 40, .5, .1, 1.5), .4)
put(9.5, kick(90, 40, .5, .1, 1.5), .45)

# ---------- act 3: pulse under the sun ----------
t = 10.0
i = 0
while t < 15.0 - 1e-9:
    if i % 4 == 0:
        put(t, kick(150, 42, .4, .4, 2.0), .75)
    if i % 4 == 2:
        put(t, noise(.05, 12000, 6500, .001, .015), .12, .3)
    if i % 2 == 1:
        put(t, tone(ROOT[bar(t)], .2, .004, .1, "saw", 800), .3)
    if i % 8 == 4:
        put(t, noise(.2, 5000, 900, .001, .08), .22)
    put(t, tone(ARP[i % 8], .12, .002, .05, "sq", 3000), .035, .4 if i % 2 else -.4)
    t += BEAT / 4
    i += 1
put(10.6, tone(220, 3.0, 1.0, 1.5, "saw", 1200), .05)  # sun swell
put(13.4, riser(1.6, 180, 2600), .38)
put(14.6, noise(.5, 12000, 3000, .45, .02), .25)

# ---------- act 4: tunnel ----------
put(15.0, kick(200, 35, 1.0, .8, 2.4), .95)
put(15.0, noise(.8, 8000, 150, .001, .3), .35)
t = 15.0
i = 0
while t < 19.5 - 1e-9:
    if i % 4 == 0:
        put(t, kick(160, 44, .35, .5, 2.2), .7)
    put(t, noise(.035, 13000, 7500, .001, .01), .09 if i % 2 else .14, .25)
    if i % 2 == 1:
        put(t, tone(ROOT[bar(t)] * 2, .12, .002, .06, "saw", 1400), .18)
    t += BEAT / 4
    i += 1
for bt in (16.0, 17.0, 18.0, 19.0):   # word hits
    put(bt, noise(.35, 9000, 1500, .001, .1), .3)
    put(bt, tone(ROOT[bar(bt)] * 4, .5, .002, .2, "saw", 3000), .09)
roll, tt, step = [], 18.5, .12
while tt < 19.95:
    put(tt, noise(.08, 7000, 900, .001, .03), .1 + .25 * (tt - 18.5) / 1.5)
    step = max(.03, step * .9)
    tt += step
put(18.4, riser(1.6, 150, 3200, .4), .45)

# ---------- act 5: DROP ----------
put(20.0, kick(220, 30, 1.4, 1.0, 2.8), 1.0)
put(20.0, noise(1.2, 10000, 80, .001, .45), .45)
t = 20.0
i = 0
while t < 25.0 - 1e-9:
    if i % 4 == 0:
        put(t, kick(170, 42, .42, .6, 2.4), .85)
    if i % 8 == 4:
        put(t, noise(.25, 6000, 900, .001, .09), .32)
    if i % 2 == 1:
        put(t, noise(.04, 13000, 8000, .001, .012), .12, .3)
    if i % 2 == 1:
        put(t, tone(ROOT[bar(t)], .22, .004, .1, "saw", 1300), .34)
    if i % 8 == 0:
        for f in CH[bar(t)]:
            put(t, tone(f * 2, .35, .004, .16, "saw", 4200), .045)
    put(t, tone(ARP[(i * 3) % 8] * 2, .1, .001, .04, "tri", 6000), .03, .5 if i % 2 else -.5)
    t += BEAT / 4
    i += 1
# reverse suck into the point
n = int(.9 * SR)
rev = list(reversed(noise(.9, 9000, 300, .001, .4)))
put(24.35, rev, .45)
put(25.2, tone(1760, .35, .001, .18, "bell"), .08)

# ---------- act 6: title ----------
put(26.0, kick(90, 30, 2.0, .1, 1.6), .7)
for j, f in enumerate([587.33, 880.0, 1174.66]):
    put(26.0 + j * .12, tone(f, 2.2, .005, 1.1, "bell"), .07, -.3 + j * .3)
put(26.7, whoosh(.6, 300, 3000, .5), .12)
put(27.2, tone(1318.5, 1.6, .01, .8, "bell"), .05, .2)
put(29.0, tone(880, 1.0, .01, .5, "bell"), .04)

peak = max(max(abs(x) for x in L), max(abs(x) for x in R)) or 1.0
g = 1.05 / peak
here = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, "out", "everything-moves.wav")
os.makedirs(os.path.dirname(path), exist_ok=True)
with wave.open(path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    fr = bytearray()
    for k in range(N):
        fo = min(1.0, (N - k) / (.6 * SR)) * min(1.0, k / (.05 * SR))
        fr += struct.pack("<hh", int(math.tanh(L[k] * g) * .92 * fo * 32767), int(math.tanh(R[k] * g) * .92 * fo * 32767))
    w.writeframes(bytes(fr))
print("wrote", path)
