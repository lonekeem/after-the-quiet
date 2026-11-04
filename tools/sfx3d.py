# v1.4.1 extra SFX (all procedurally synthesized here = original/CC0-compatible). exec'd from make_audio.py (uses its helpers).
def env_ad(T, a, d): return np.minimum(1, T / a) * np.exp(-T * d)
for v in range(5):  # mud: wet suck + squelch
  T = t(.32); n = rng.standard_normal(len(T)); y = lp(n, .08) * env_ad(T, .01, 14) + bp(n, rng.uniform(500, 800), 3) * np.exp(-((T - .12) / .04) ** 2) * .7
  enc(f'{OUT}/step_mud{v}.mp3', y, filt='lowpass=f=2400')
for v in range(5):  # asphalt: short gritty scuff
  T = t(.2); n = rng.standard_normal(len(T)); y = (n - lp(n, .3)) * env_ad(T, .003, 30) * .6 + lp(n, .15) * env_ad(T, .002, 45)
  enc(f'{OUT}/step_asphalt{v}.mp3', y, filt='lowpass=f=5000')
for v in range(4):  # zombie shuffle: dragging scrape + soft thump
  T = t(.55); n = rng.standard_normal(len(T)); y = bp(n, rng.uniform(900, 1500), 1.5) * np.sin(np.pi * T / .55) ** 2 * .5 + lp(n, .05) * env_ad(T, .005, 20)
  enc(f'{OUT}/z_shuffle{v}.mp3', y, filt='lowpass=f=3000')
for v in range(4):  # sprint breathing: in/out pair
  T = t(.7); n = rng.standard_normal(len(T)); e = np.exp(-((T - .15) / .08) ** 2) * .7 + np.exp(-((T - .45) / .1) ** 2)
  enc(f'{OUT}/breath{v}.mp3', bp(n, rng.uniform(1100, 1600), 1.1) * e, filt='lowpass=f=4000')
for v in range(2):  # jump (cloth whoosh) / land (thud + cloth)
  T = t(.3); n = rng.standard_normal(len(T)); enc(f'{OUT}/jump{v}.mp3', bp(n, 700 + v * 300, .9) * np.sin(np.pi * T / .3) ** 2)
  T = t(.35); n = rng.standard_normal(len(T)); enc(f'{OUT}/land{v}.mp3', lp(n, .04) * env_ad(T, .002, 18) * 2 + (n - lp(n, .3)) * env_ad(T, .002, 40) * .3)
T = t(.6); n = rng.standard_normal(len(T)); enc(f'{OUT}/roll.mp3', bp(n, 500, .8) * np.sin(np.pi * T / .6) + lp(n, .03) * env_ad(T, .3, 12) * 2)
T = t(4.0); f = np.where((T * 2.5) % 1 < .5, 1400, 900); ph = np.cumsum(2 * np.pi * f / SR); enc(f'{OUT}/alarm_loop.mp3', np.sign(np.sin(ph)) * .4 + np.sin(ph * 2) * .2, filt='lowpass=f=4500')
T = t(8.0); n = rng.standard_normal(len(T)); w = lp(n, .01) * (1 + .6 * np.sin(2 * np.pi * .13 * T)) + bp(n, 400, .6) * .2 * (1 + np.sin(2 * np.pi * .21 * T))
fade = int(SR * .5); w[:fade] = w[:fade] * np.linspace(0, 1, fade) + w[-fade:] * np.linspace(1, 0, fade); enc(f'{OUT}/wind_loop.mp3', w[:-fade], q='48k')
T = t(1.5); n = rng.standard_normal(len(T)); enc(f'{OUT}/tire_loop.mp3', bp(n, 1800, 6) * (1 + .3 * np.sin(2 * np.pi * 11 * T)) + lp(n, .1) * .3)
for v in range(3):  # gore squelch
  T = t(.4); n = rng.standard_normal(len(T)); y = lp(n, .12) * env_ad(T, .004, 9) + bp(n, rng.uniform(300, 600), 4) * env_ad(T, .02, 12) * .8
  enc(f'{OUT}/squelch{v}.mp3', y, filt='lowpass=f=3000')
