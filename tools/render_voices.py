# Renders all voiced lines with Kokoro-82M (Apache-2.0) via kokoro-onnx. Original synthetic voices, not cloned from anyone.
import json, re, subprocess, sys, os, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
K = Kokoro('/workspace/kokoro/kokoro.onnx', '/workspace/kokoro/voices.bin')
V = {  # who: (voice, speed, ffmpeg filter)
 'narrator': ('am_michael', 0.80, 'asetrate=24000*0.93,aresample=24000,atempo=1.0,bass=g=4:f=110,treble=g=-2,aecho=0.8:0.5:60|110:0.18|0.10,loudnorm=I=-17'),
 'marcus': ('am_fenrir', 0.95, 'asetrate=24000*0.96,aresample=24000,loudnorm=I=-18'),
 'dana': ('af_heart', 0.93, 'loudnorm=I=-18'),
 'walt': ('bm_george', 0.82, 'asetrate=24000*0.9,aresample=24000,atempo=1.04,loudnorm=I=-18'),
 'ruth': ('af_bella', 1.0, 'loudnorm=I=-18'),
 'pell': ('af_nicole', 0.92, 'asetrate=24000*0.95,aresample=24000,loudnorm=I=-18'),
 'mailman': ('am_eric', 1.0, 'loudnorm=I=-18'),
 'fisher': ('am_adam', 0.95, 'loudnorm=I=-18'),
 'regular': ('am_liam', 0.92, 'asetrate=24000*0.94,aresample=24000,loudnorm=I=-18'),
 'gus': ('am_puck', 1.0, 'loudnorm=I=-18'),
 'barber': ('bm_daniel', 1.0, 'loudnorm=I=-18'),
 'tv': ('af_sarah', 1.0, 'highpass=f=250,lowpass=f=5000,loudnorm=I=-20'),
 'radio': ('bm_lewis', 0.95, 'highpass=f=400,lowpass=f=3200,acrusher=bits=10:mix=0.25,loudnorm=I=-20'),
}
out = 'public/audio/v'; os.makedirs(out, exist_ok=True)
lines = json.load(open(sys.argv[1]))
for who, text, h in lines:
  if who not in V: continue
  f = f'{out}/{h}.mp3'
  if os.path.exists(f): continue
  voice, speed, filt = V[who]
  parts = [p for p in re.split(r'(?<=[.,?!—])\s+', text) if p.strip()] if who == 'narrator' else [text]
  sr = 24000; chunks = [np.zeros(int(sr * (0.7 if who == 'narrator' else 0.1)), dtype=np.float32)]
  for p in parts:
    a, sr = K.create(p, voice=voice, speed=speed, lang='en-us' if voice[0] == 'a' else 'en-gb')
    chunks.append(a.astype(np.float32))
    chunks.append(np.zeros(int(sr * (0.55 if p.endswith(',') else 1.15 if who == 'narrator' else 0.15)), dtype=np.float32))
  sf.write('/tmp/v.wav', np.concatenate(chunks), sr)
  subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', '/tmp/v.wav', '-af', filt, '-ac', '1', '-ar', '24000', '-b:a', '56k', f], check=True)
  print(who, h, flush=True)
