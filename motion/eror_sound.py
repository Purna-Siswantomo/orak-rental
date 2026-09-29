"""Sound for konsultasi-eror.html (7 s): glitch bursts, error pings, a cascade of pops, the click,
a loading whirr, a success chime and a soft landing for the tagline. Stdlib only.

    python3 eror_sound.py [out.wav]      (default: out/otak-rental-konsultasi-eror.wav)
"""
import math
import os
import random
import struct
import sys
import wave

SR, DUR = 48000, 7.0
N = int(SR * DUR)
L, R = [0.0] * N, [0.0] * N
rng = random.Random(21)
TAU = 2 * math.pi


def put(t0, samples, gain=1.0, pan=0.0):
    i0 = int(t0 * SR)
    gl, gr = gain * math.cos((pan + 1) * math.pi / 4), gain * math.sin((pan + 1) * math.pi / 4)
    for k, s in enumerate(samples):
        if 0 <= i0 + k < N:
            L[i0 + k] += s * gl
            R[i0 + k] += s * gr


def tone(f, dur, a, d, kind="sine", glide=1.0):
    n, out, ph = int(dur * SR), [], 0.0
    na = max(1, int(a * SR))
    for k in range(n):
        ph += TAU * f * (glide ** (k / n)) / SR
        s = math.sin(ph)
        if kind == "bell":
            s = 0.6 * s + 0.25 * math.sin(ph * 2.76) + 0.15 * math.sin(ph * 5.4)
        elif kind == "square":
            s = 0.6 if s > 0 else -0.6
        e = k / na if k < na else math.exp(-(k - na) / (d * SR))
        out.append(s * e)
    return out


def glitch(dur, g=1.0):
    """Bit-crushed, sample-held noise with random pitch steps."""
    n, out, hold, v = int(dur * SR), [], 1, 0.0
    for k in range(n):
        if k % hold == 0:
            v = round((rng.random() * 2 - 1) * 4) / 4
            hold = rng.choice([8, 16, 40, 90])
        out.append(v * g * (1 - k / n) ** 0.5)
    return out


def kick(f0, f1, dur, click=0.3):
    n, out, ph = int(dur * SR), [], 0.0
    for k in range(n):
        t = k / SR
        ph += TAU * (f1 + (f0 - f1) * math.exp(-t * 30)) / SR
        s = math.sin(ph) * math.exp(-t * 9)
        if k < 200:
            s += click * (rng.random() * 2 - 1) * (1 - k / 200)
        out.append(math.tanh(s * 1.5))
    return out


def whoosh(dur, lo, hi, peak):
    n, out, y = int(dur * SR), [], 0.0
    for k in range(n):
        p = k / n
        sh = (p / peak) ** 2 if p < peak else ((1 - p) / (1 - peak)) ** 1.5
        y += (1 - math.exp(-TAU * (lo + (hi - lo) * sh) / SR)) * ((rng.random() * 2 - 1) - y)
        out.append(y * sh * 2.4)
    return out


# soft low hum under everything (the "brain")
for k in range(N):
    t = k / SR
    amp = 0.03 * min(1, t / 0.4) * (1.0 if t < 3.6 else 0.5) * min(1, (DUR - t) / 0.8)
    wob = 1 + (0.02 * math.sin(t * 13) if t < 3.6 else 0)
    s = (math.sin(TAU * 55 * wob * t) + 0.4 * math.sin(TAU * 110 * wob * t)) * amp
    L[k] += s
    R[k] += s

put(0.08, kick(300, 150, 0.1), 0.25)                                 # chip pop
for i in range(10):                                                  # letters
    put(0.12 + i * 0.035, tone(500 + i * 35, 0.06, 0.001, 0.02, "sine"), 0.05, -0.4 + i * 0.08)
put(0.62, glitch(0.3, 0.5), 0.6, 0.2)                               # eror? glitches in
put(1.62, glitch(0.22, 0.45), 0.5, -0.2)
put(2.38, glitch(0.16, 0.4), 0.5, 0.3)
put(3.2, glitch(0.3, 0.25), 0.4, 0.1)
put(1.2, tone(880, 0.18, 0.002, 0.08, "square"), 0.08)              # error ping (two tones)
put(1.34, tone(660, 0.3, 0.002, 0.14, "square"), 0.08)
for i in range(3):                                                   # cascade
    put(1.95 + i * 0.2, tone(880 - i * 60, 0.14, 0.002, 0.06, "square"), 0.06, 0.2 * i)
    put(1.95 + i * 0.2, kick(260, 140, 0.1), 0.18)
put(2.7, whoosh(0.7, 300, 2200, 0.7), 0.12, 0.5)                     # cursor glides in
put(3.55, kick(1800, 900, 0.03, 0.8), 0.5)                           # click
put(3.58, tone(2400, 0.05, 0.0005, 0.01), 0.15)
n = int(1.1 * SR)                                                    # loading whirr
whirr = [math.sin(TAU * (300 + 500 * (k / n)) * (k / SR)) * 0.5 * min(1, k / (0.1 * SR)) * min(1, (n - k) / (0.1 * SR)) for k in range(n)]
put(3.7, whirr, 0.07)
for i in range(8):
    put(3.75 + i * 0.12, tone(1400 + i * 90, 0.04, 0.0005, 0.01), 0.07)
for j, f in enumerate([523.25, 659.25, 783.99, 1046.5]):             # success chime
    put(4.78 + j * 0.06, tone(f, 0.9, 0.002, 0.35, "bell"), 0.1, -0.3 + j * 0.2)
put(5.0, whoosh(0.45, 400, 4000, 0.4), 0.15)                         # tagline
put(5.55, whoosh(0.35, 800, 5000, 0.3), 0.1, 0.3)                    # lime marker
put(5.2, kick(120, 45, 0.5, 0.2), 0.3)

peak = max(max(abs(x) for x in L), max(abs(x) for x in R)) or 1.0
g = 0.85 / peak
here = os.path.dirname(os.path.abspath(__file__))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, "out", "otak-rental-konsultasi-eror.wav")
os.makedirs(os.path.dirname(path), exist_ok=True)
with wave.open(path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    fr = bytearray()
    for k in range(N):
        fo = min(1.0, (N - k) / (0.3 * SR))
        fr += struct.pack("<hh", int(math.tanh(L[k] * g) * fo * 32767), int(math.tanh(R[k] * g) * fo * 32767))
    w.writeframes(bytes(fr))
print("wrote", path)
