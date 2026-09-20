#!/usr/bin/env python3
"""Generate an original, one-shot game-show intro for the Android build.
No external audio is downloaded; the composition is synthesized locally.
"""
import math, random, struct, wave
from pathlib import Path

SR=22050
DURATION=28.0
N=int(SR*DURATION)
out=Path(__file__).resolve().parents[1]/"app/src/main/assets/intro_full_original.wav"
buf=[0.0]*N

def env(i,length,attack=.015,release=.10):
    a=max(1,int(attack*SR)); r=max(1,int(release*SR))
    e=1.0
    if i<a:e=i/a
    if i>length-r:e=min(e,(length-i)/r)
    return max(0.0,e)

def add_tone(start,duration,freq,amp=.08,kind="sine"):
    i0=int(start*SR); ln=min(N-i0,int(duration*SR))
    if ln<=0:return
    for j in range(ln):
        t=j/SR
        if kind=="square":
            w=1.0 if math.sin(2*math.pi*freq*t)>=0 else -1.0
        elif kind=="brass":
            w=0.0
            for h in range(1,6): w+=math.sin(2*math.pi*freq*h*t)/h
            w*=2/math.pi
        else:
            w=math.sin(2*math.pi*freq*t)
        buf[i0+j]+=amp*w*env(j,ln)

def add_kick(start,amp=.20):
    i0=int(start*SR); ln=min(N-i0,int(.22*SR))
    phase=0.0
    for j in range(ln):
        t=j/SR
        f=42+95*math.exp(-13*t)
        phase+=2*math.pi*f/SR
        buf[i0+j]+=amp*math.sin(phase)*math.exp(-18*t)

def add_snare(start,amp=.09):
    rnd=random.Random(int(start*1000)+177)
    i0=int(start*SR); ln=min(N-i0,int(.15*SR))
    for j in range(ln):
        t=j/SR
        sig=.72*rnd.uniform(-1,1)+.28*math.sin(2*math.pi*185*t)
        buf[i0+j]+=amp*sig*math.exp(-22*t)

def add_hat(start,amp=.024):
    rnd=random.Random(int(start*10000)+91)
    i0=int(start*SR); ln=min(N-i0,int(.05*SR))
    for j in range(ln):
        t=j/SR
        buf[i0+j]+=amp*rnd.uniform(-1,1)*math.exp(-55*t)

# Bright original fanfare.
for st,f in [(0,523.25),(.28,659.25),(.56,783.99),(.84,1046.5),(1.30,783.99),(1.56,987.77),(1.84,1174.66),(2.18,1318.51)]:
    add_tone(st,.32,f,.10,"brass"); add_tone(st,.34,f/2,.035,"sine")
for st in [0,.56,1.12,1.84,2.42,3.0]: add_kick(st,.20)
for st in [1.12,2.42,3.36]: add_snare(st,.10)

bpm=128
beat=60/bpm
bar=beat*4
chords=[(261.63,329.63,392.0),(220.0,261.63,329.63),(174.61,220.0,261.63),(196.0,246.94,293.66)]
scale=[261.63,293.66,329.63,349.23,392.0,440.0,493.88,523.25,587.33,659.25]
degrees=[0,2,4,5,4,2,1,2,4,5,7,9,7,5,4,2]
start=4.0
for b in range(10):
    bs=start+b*bar
    chord=chords[b%4]
    for f in chord:
        add_tone(bs,bar*.93,f,.022,"brass")
    for j in range(4):
        add_tone(bs+j*beat,beat*.72,chord[0]/2,.045,"square")
        add_kick(bs+j*beat,.14 if j in (0,2) else .075)
        if j in (1,3): add_snare(bs+j*beat,.075)
        add_hat(bs+j*beat,.020); add_hat(bs+j*beat+beat/2,.015)
    for j in range(8):
        f=scale[min(degrees[(b*8+j)%len(degrees)],len(scale)-1)]
        if b>=6 and j in (0,1,4,5): f*=2
        add_tone(bs+j*beat/2,beat*.38,f,.038,"brass")

for st,f in [(24.5,659.25),(24.82,783.99),(25.14,987.77),(25.46,1046.5),(25.9,1174.66),(26.25,1318.51),(26.60,1567.98)]:
    add_tone(st,.40,f,.10,"brass"); add_tone(st,.40,f/2,.035,"sine")
for f in [261.63,329.63,392.0,523.25]: add_tone(27.0,.90,f,.055,"brass")
add_kick(27.0,.23); add_snare(27.0,.09)

# Natural final fade only at the actual end of the 28-second piece.
fade=int(.8*SR)
for i in range(fade):
    buf[N-fade+i]*=(fade-i)/fade
peak=max(max(abs(x) for x in buf),1e-9)
gain=.92/peak

out.parent.mkdir(parents=True,exist_ok=True)
with wave.open(str(out),"wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    frames=bytearray()
    for x in buf:
        v=max(-32767,min(32767,int(x*gain*32767)))
        frames+=struct.pack("<h",v)
    w.writeframes(frames)
print(f"Generated {out} ({DURATION:.1f}s, one-shot)")
