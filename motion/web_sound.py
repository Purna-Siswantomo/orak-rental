"""Soft sound bed for web-examples.html (8 s): a warm pad, a pluck motif and gentle UI cues.

    python3 web_sound.py [out.wav]      (default: out/otak-rental-web-examples.wav)
"""
import math
import os
import random
import struct
import sys
import wave

SR, DUR = 48000, 8.0
N = int(SR * DUR)
L, R = [0.0] * N, [0.0] * N
rng = random.Random(3)
TAU = 2 * math.pi


def put(t0, samples, gain=1.0, pan=0.0):
    i0 = int(t0 * SR)
    gl, gr = gain * math.cos((pan + 1) * math.pi / 4), gain * math.sin((pan + 1) * math.pi / 4)
    for k, s in enumerate(samples):
        if 0 <= i0 + k < N:
            L[i0 + k] += s * gl
            R[i0 + k] += s * gr


def tone(f, dur, a, d, kind="sine"):
    n, out, ph = int(dur * SR), [], 0.0
    na = max(1, int(a * SR))
    for k in range(n):
        ph += TAU * f / SR
        s = math.sin(ph)
        if kind == "bell":
            s = 0.6 * s + 0.25 * math.sin(ph * 2.76) + 0.15 * math.sin(ph * 5.4)
        e = k / na if k < na else math.exp(-(k - na) / (d * SR))
        out.append(s * e)
    return out


def whoosh(dur, lo, hi, peak):
    n, out, y = int(dur * SR), [], 0.0
    for k in range(n):
        p = k / n
        sh = (p / peak) ** 2 if p < peak else ((1 - p) / (1 - peak)) ** 1.5
        y += (1 - math.exp(-TAU * (lo + (hi - lo) * sh) / SR)) * ((rng.random() * 2 - 1) - y)
        out.append(y * sh * 2.4)
    return out


# warm pad: Cmaj9 → Am9, slow swell
for k in range(N):
    t = k / SR
    chord = [130.81, 164.81, 196.0, 246.94, 293.66] if t < 4.2 else [110.0, 164.81, 196.0, 246.94, 261.63]
    amp = min(1, t / 1.2) * min(1, (DUR - t) / 1.0) * 0.022
    s = sum(math.sin(TAU * f * t + i) * (1 - i * .12) for i, f in enumerate(chord)) * amp
    L[k] += s * (1 + 0.1 * math.sin(t * 0.7))
    R[k] += s * (1 - 0.1 * math.sin(t * 0.7))

# pluck motif (pentatonic), one note per half-beat at 96 BPM
notes = [523.25, 659.25, 783.99, 659.25, 880.0, 783.99, 659.25, 587.33]
t = 0.9
i = 0
while t < 7.2:
    put(t, tone(notes[i % len(notes)], 0.5, 0.003, 0.18, "bell"), 0.06, -0.3 if i % 2 else 0.3)
    t += 60 / 96 / 2 * 2
    i += 1

put(0.05, whoosh(0.8, 300, 3500, 0.5), 0.22, -0.2)   # frame A settles
put(0.17, whoosh(0.8, 300, 3500, 0.5), 0.2, 0.2)     # frame B settles
put(1.0, tone(1046.5, 0.6, 0.002, 0.25, "bell"), 0.05)  # mascot pop
put(3.0, whoosh(2.4, 200, 1400, 0.5), 0.10)          # the scroll
for k, tt in enumerate([3.9, 4.02, 4.14, 4.3]):      # cards / sections land
    put(tt, tone(1568 + k * 110, 0.12, 0.001, 0.04), 0.05, -0.4 + k * 0.25)

peak = max(max(abs(x) for x in L), max(abs(x) for x in R)) or 1.0
g = 0.8 / peak
here = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, "out", "otak-rental-web-examples.wav")
os.makedirs(os.path.dirname(path), exist_ok=True)
with wave.open(path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    fr = bytearray()
    for k in range(N):
        fo = min(1.0, (N - k) / (0.4 * SR))
        fr += struct.pack("<hh", int(math.tanh(L[k] * g) * fo * 32767), int(math.tanh(R[k] * g) * fo * 32767))
    w.writeframes(bytes(fr))
print("wrote", path)
