# Builds every audio file the game uses (run: /workspace/piperenv/bin/python tools/make_audio.py).
#  - Voices: Kokoro-82M TTS (Apache-2.0) stock voices, pitch-tuned. Original synthetic voices, not cloned from anyone.
#  - SFX: Kenney "Impact Sounds" + "RPG Audio" (CC0) from /tmp/kenney, plus procedurally synthesized sounds (numpy).
import json, os, re, subprocess, glob, random, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
OUT = 'public/sfx'; os.makedirs(OUT + '/v', exist_ok=True); SR = 44100; rng = np.random.default_rng(7)
def enc(path, a, sr=SR, filt=None, q='56k'):
  tmp = '/tmp/_a.wav'; a = np.asarray(a, dtype=np.float32); m = np.max(np.abs(a)) or 1; sf.write(tmp, a / m * 0.89, sr)
  cmd = ['ffmpeg', '-loglevel', 'error', '-y', '-i', tmp] + (['-af', filt] if filt else []) + ['-ac', '1', '-ar', '44100', '-b:a', q, path]; subprocess.run(cmd, check=True)
def kenney(name, src, filt=None):
  f = glob.glob(f'/tmp/kenney/**/{src}', recursive=True)[0]; subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f] + (['-af', filt] if filt else []) + ['-ac', '1', '-b:a', '64k', f'{OUT}/{name}.mp3'], check=True)
t = lambda d: np.arange(int(SR * d)) / SR
def lp(x, a):  # one-pole lowpass, a in (0,1)
  y = np.empty_like(x); s = 0.0
  for i in range(len(x)): s += a * (x[i] - s); y[i] = s
  return y
def brown(n): w = rng.standard_normal(n); b = np.cumsum(w); b -= lp(b, 0.002); return b / (np.max(np.abs(b)) + 1e-9)
def bp(x, f, q=4):  # biquad bandpass via ffmpeg-free simple implementation
  w0 = 2*np.pi*f/SR; al = np.sin(w0)/(2*q); b0, b2 = al, -al; a0, a1, a2 = 1+al, -2*np.cos(w0), 1-al
  y = np.zeros_like(x); x1=x2=y1=y2=0.0
  for i in range(len(x)): v = (b0*x[i]+b2*x2-a1*y1-a2*y2)/a0; x2=x1; x1=x[i]; y2=y1; y1=v; y[i]=v
  return y
# ---------- guns ----------
for kind, dur, body, bright in [('pistol', .32, 70, .35), ('rifle', .26, 85, .5), ('shotgun', .7, 55, .25), ('revolver', .55, 60, .3), ('smg', .2, 95, .55), ('sniper', .9, 50, .3)]:
  for v in range(3):
    T = t(dur); n = rng.standard_normal(len(T)); env = np.exp(-T * (14 / dur)); crack = lp(n, bright) * env
    thump = np.sin(2*np.pi*body*T*(1 - .4*T/dur)) * np.exp(-T*(9/dur)) * 1.4
    click = np.zeros_like(T); click[:60] = rng.standard_normal(60) * 1.5
    tail = lp(rng.standard_normal(len(T)), .08) * np.exp(-T * (4 / dur)) * .35
    enc(f'{OUT}/gun_{kind}{v}.mp3', crack + thump + click + tail, filt='aecho=0.6:0.4:60|140:0.25|0.12')
# ---------- explosion / thunder / rain / truck ----------
T = t(3.0); b = brown(len(T)); n = rng.standard_normal(len(T)); env = np.minimum(1, T*60) * np.exp(-T*1.6)
crackle = (rng.random(len(T)) > .997) * rng.standard_normal(len(T)) * np.exp(-T*1.2) * 3
enc(f'{OUT}/explosion.mp3', b*env*1.5 + lp(n, .25)*np.exp(-T*5) + crackle + np.sin(2*np.pi*38*T)*np.exp(-T*2.5), filt='aecho=0.7:0.5:90|220:0.3|0.2')
for v in range(3):
  T = t(5.5); b = brown(len(T)); rolls = np.zeros_like(T)
  for k in range(rng.integers(3, 6)): c = rng.uniform(.1, 3.5); rolls += np.exp(-((T - c) / rng.uniform(.15, .6))**2) * rng.uniform(.4, 1)
  first = np.exp(-T*3) * (lp(rng.standard_normal(len(T)), .3)) * (1.2 if v != 1 else .3)
  enc(f'{OUT}/thunder{v}.mp3', b*(rolls*np.exp(-T*.35)) + first, filt='lowpass=f=900,aecho=0.6:0.5:300:0.3')
T = t(8.0); n = rng.standard_normal(len(T)); rain = n - lp(n, .25); rain = lp(rain, .6) * .5
drops = (rng.random(len(T)) > .9985) * rng.uniform(.3, 1, len(T)); dr = np.convolve(drops, np.exp(-t(.01)*700) * np.sin(2*np.pi*3000*t(.01)), 'same')
x = rain + dr*.6; fade = int(SR*.5); x[:fade] = x[:fade]*np.linspace(0,1,fade) + x[-fade:]*np.linspace(1,0,fade); x = x[:-fade]
enc(f'{OUT}/rain_loop.mp3', x, q='64k')
T = t(2.0); f0 = 40.0; eng = sum(np.sin(2*np.pi*f0*h*T + rng.uniform(0, 6)) / h**.8 for h in range(1, 14)); eng *= 1 + .25*np.sin(2*np.pi*f0/4*T)
eng += lp(rng.standard_normal(len(T)), .2) * .4; enc(f'{OUT}/truck_loop.mp3', eng, filt='lowpass=f=1400')
# ---------- zombies (procedural voices: saw + formants + roughness) ----------
def zvoice(dur, f_start, f_end, formants, rough=.6, seed=0):
  T = t(dur); f = np.linspace(f_start, f_end, len(T)) * (1 + .06*np.sin(2*np.pi*rng.uniform(3, 7)*T)) * (1 + .03*lp(rng.standard_normal(len(T)), .01)*20)
  ph = np.cumsum(f) / SR; saw = 2*(ph % 1) - 1; saw *= 1 + rough*lp(rng.standard_normal(len(T)), .05)*6
  breath = rng.standard_normal(len(T)) * .25; src = saw + breath; y = sum(bp(src, fr, 5)*g for fr, g in formants)
  env = np.minimum(1, T/.12) * np.minimum(1, (dur - T)/.25) * (0.7 + .3*np.sin(2*np.pi*rng.uniform(1, 3)*T)**2); return y*env
for v in range(6): enc(f'{OUT}/z_growl{v}.mp3', zvoice(rng.uniform(.8, 1.5), rng.uniform(85, 120), rng.uniform(60, 80), [(rng.uniform(450, 650), 1), (rng.uniform(1000, 1400), .6), (2500, .2)], rough=.9), filt='aecho=0.5:0.3:40:0.2')
for v in range(4): enc(f'{OUT}/z_moan{v}.mp3', zvoice(rng.uniform(2, 3), rng.uniform(95, 130), rng.uniform(70, 90), [(rng.uniform(350, 500), 1), (rng.uniform(800, 1000), .7)], rough=.4), filt='aecho=0.5:0.4:60:0.25')
for v in range(3): enc(f'{OUT}/z_attack{v}.mp3', zvoice(.6, rng.uniform(160, 210), 90, [(700, 1), (1500, .7), (2800, .3)], rough=1.2))
enc(f'{OUT}/boss_roar.mp3', zvoice(2.2, 90, 45, [(400, 1), (900, .8), (2000, .3)], rough=1.4), filt='asetrate=44100*0.8,aresample=44100,aecho=0.7:0.6:120|260:0.4|0.25')
# eating: wet squelches + crunch + gnaw groans
for v in range(3):
  T = t(2.6); y = np.zeros_like(T)
  for k in range(9): c = int(rng.uniform(0, 2.4)*SR); L = int(rng.uniform(.06, .2)*SR); burst = lp(rng.standard_normal(L), rng.uniform(.05, .2)) * np.hanning(L) * rng.uniform(.5, 1); y[c:c+L] += burst[:len(y[c:c+L])]
  for k in range(4): c = int(rng.uniform(0, 2.4)*SR); L = int(.04*SR); y[c:c+L] += rng.standard_normal(L)*np.exp(-np.arange(L)/300)*.6
  y += zvoice(2.6, 75, 70, [(350, 1), (800, .5)], rough=.7) * .35; enc(f'{OUT}/z_eat{v}.mp3', y, filt='lowpass=f=3500')
# v1.4 feeding: wet chewing (short squelch bursts + low gnaw) and flesh tearing (rip noise sweep)
for v in range(4):
  T = t(1.1); y = np.zeros_like(T)
  for k in range(5): c = int(rng.uniform(0, .95)*SR); L = int(rng.uniform(.05, .13)*SR); y[c:c+L] += (lp(rng.standard_normal(L), rng.uniform(.06, .25)) * np.hanning(L) * rng.uniform(.6, 1))[:len(y[c:c+L])]
  y += zvoice(1.1, 70, 62, [(300, 1), (700, .4)], rough=.8) * .25; enc(f'{OUT}/z_chew{v}.mp3', y, filt='lowpass=f=3200')
for v in range(3):
  T = t(.55); n = rng.standard_normal(len(T)); f = np.linspace(rng.uniform(1800, 2600), 500, len(T)); y = np.zeros_like(T)
  for i0 in range(0, len(T) - 2048, 1024): seg = n[i0:i0+2048] * np.hanning(2048); y[i0:i0+2048] += bp(seg, f[i0], 3) * (1 + (rng.random() < .3) * 2)
  y *= np.minimum(1, T/.02) * np.exp(-T*3.5); y += lp(rng.standard_normal(len(T)), .15) * np.exp(-T*9) * .6; enc(f'{OUT}/z_tear{v}.mp3', y)
# human screams (procedural, formant "ah" with pitch rise and vibrato) — NPC victims
def scream(dur, f0, f1, female):
  T = t(dur); f = np.interp(T, [0, dur*.2, dur], [f0*.8, f1, f0]) * (1 + .03*np.sin(2*np.pi*6.5*T)) * (1 + .02*lp(rng.standard_normal(len(T)), .01)*20)
  ph = np.cumsum(f)/SR; src = (2*(ph % 1)-1)*.7 + np.sin(2*np.pi*ph)*.5 + rng.standard_normal(len(T))*.12
  F = [(900, 1), (1350, .8), (2900, .35)] if female else [(750, 1), (1200, .7), (2600, .3)]; y = sum(bp(src, a, 6)*g for a, g in F)
  return y * np.minimum(1, T/.05) * np.minimum(1, (dur-T)/.3)
for v in range(4): enc(f'{OUT}/scream{v}.mp3', scream(rng.uniform(1.1, 1.8), rng.uniform(330, 420) if v % 2 else rng.uniform(220, 280), rng.uniform(600, 800) if v % 2 else rng.uniform(420, 520), v % 2 == 1), filt='aecho=0.6:0.5:80|180:0.3|0.15')
# ---------- Kenney CC0 ----------
K = {'reload_out': 'metalLatch.ogg', 'reload_in': 'metalClick.ogg', 'cloth0': 'cloth1.ogg', 'cloth1': 'cloth2.ogg', 'door_open': 'doorOpen_1.ogg', 'creak': 'creak1.ogg', 'knife': 'knifeSlice.ogg', 'coins': 'handleCoins.ogg', 'chop': 'chop.ogg'}
for k, s in K.items(): kenney(k, s)
for i in range(5):
  for surf in ['concrete', 'grass', 'wood']: kenney(f'step_{surf}{i}', f'footstep_{surf}_00{i}.ogg')
  kenney(f'punch{i}', f'impactPunch_heavy_00{i}.ogg'); kenney(f'bat{i}', f'impactWood_heavy_00{i}.ogg'); kenney(f'flesh{i}', f'impactSoft_heavy_00{i}.ogg')
  kenney(f'metal{i}', f'impactMetal_heavy_00{i}.ogg'); kenney(f'shell{i}', f'impactMetal_light_00{i}.ogg', 'asetrate=44100*1.6,aresample=44100,volume=0.6'); kenney(f'plank{i}', f'impactPlank_medium_00{i}.ogg')
  kenney(f'glass{i}', f'impactGlass_heavy_00{i}.ogg')
# ---------- voices (Kokoro TTS, warm stock voices) ----------
KO = Kokoro('/workspace/kokoro/kokoro.onnx', '/workspace/kokoro/voices.bin')
P = lambda r: f'asetrate=24000*{r},aresample=24000,atempo={1/r:.3f}'
V = {  # who: voice, speed, filter
 'keem': ('am_puck', 1.05, P(1.13) + ',loudnorm=I=-17'), 'marcus': ('am_michael', .95, P(.97) + ',loudnorm=I=-17'), 'nia': ('af_sky', 1.02, P(1.16) + ',loudnorm=I=-17'),
 'dube': ('bm_george', .9, 'loudnorm=I=-17'), 'walt': ('am_adam', .9, 'loudnorm=I=-17'), 'ruth': ('af_bella', 1.0, 'loudnorm=I=-17'), 'gus': ('am_onyx', .9, P(.9) + ',loudnorm=I=-17'),
 'radio': ('am_michael', 1.0, P(.97) + ',highpass=f=350,lowpass=f=3400,acrusher=bits=10:mix=0.2,loudnorm=I=-18'),
 'npcf': ('af_nicole', 1.1, 'loudnorm=I=-16'), 'npcm': ('am_eric', 1.1, 'loudnorm=I=-16')}
def say(who, text, path):
  if os.path.exists(path): return
  clean = re.sub(r'\([^)]*\)', '', text).replace('…', ', ').replace('—', ', ').strip(' ,')
  if not re.search(r'[A-Za-z]', clean): return
  voice, speed, filt = V[who]; a, sr = KO.create(clean, voice=voice, speed=speed, lang='en-us' if voice[0] == 'a' else 'en-gb')
  a = np.concatenate([np.zeros(int(sr*.05), np.float32), a, np.zeros(int(sr*.1), np.float32)]); sf.write('/tmp/_v.wav', a, sr)
  subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', '/tmp/_v.wav', '-af', filt, '-ac', '1', '-b:a', '48k', path], check=True)
for who, text, h in json.load(open('/tmp/lines.json')): say(who, text, f'{OUT}/v/{h}.mp3')
BARKS = {
 'keem_reload': ('keem', ['Reloading!', 'Cover me, nobody!', 'Reloading, reloading!']), 'keem_hurt': ('keem', ['Ow!', 'Agh!', 'Get off me!', 'Ugh!']),
 'keem_kill': ('keem', ['Stay down!', 'Nope!', 'Headshot!', 'Yeah!', 'Not today!', 'Sorry, mister!']), 'keem_pickup': ('keem', ['Ooh, nice.', 'Mine now.', 'Got it.']),
 'keem_empty': ('keem', ['Out of ammo!', 'Empty! Come on!']), 'keem_boss': ('keem', ['That is a big dude!', 'Nope nope nope!']),
 'marcus_shout': ('marcus', ['Keem! Over here!', 'Behind you, son!', 'Keep moving!', 'Good shot!']), 'nia_shout': ('nia', ['Keem, hurry!', 'Biscuit, hold on!', 'Behind you!']),
 'keem_kill_x': ('keem', ['Stay the fuck down!', 'Eat shit!', 'Hell yeah!', 'Fuck off!', 'Not today, motherfucker!']), 'keem_hurt_x': ('keem', ['Shit!', 'Ah, fuck!', 'Get the fuck off me!']),
 'keem_empty_x': ('keem', ['Empty! Shit!', 'Out of ammo, dammit!']), 'keem_boss_x': ('keem', ['That is one big motherfucker!', 'Oh, hell no!']), 'keem_reload_x': ('keem', ['Reloading, shit, shit!', 'Come on, damn it!']),
 'marcus_shout_x': ('marcus', ['Behind you, damn it!', 'Move your ass, son!', 'Hell of a shot!']), 'npcm_help_x': ('npcm', ['Holy shit, run!', 'Get the fuck away from me!']),
 'npcf_help': ('npcf', ['Help! Somebody help me!', 'No! Get off me!', 'Please! Help!']), 'npcm_help': ('npcm', ['Run! Just run!', 'Help! Help!', 'Get away from me!']),
}
manifest = {}
for key, (who, lines) in BARKS.items():
  manifest[key] = len(lines)
  for i, l in enumerate(lines): say(who, l, f'{OUT}/v/{key}{i}.mp3')
json.dump({'barks': manifest, 'voiced': sorted(os.path.basename(p)[:-4] for p in glob.glob(OUT + '/v/*.mp3'))}, open(OUT + '/manifest.json', 'w'))
print('done', len(glob.glob(OUT + '/*.mp3')), 'sfx', len(glob.glob(OUT + '/v/*.mp3')), 'voice')
