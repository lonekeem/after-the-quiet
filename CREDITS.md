# Credits & Licenses — After the Quiet v1.8.2 (Story Mode)
Lone Keem Studios · created by Keem

| Asset | Source | License |
|---|---|---|
| Rigged humanoid + animations (`public/models/`) | Quaternius — Universal Animation Library (quaternius.com) | CC0 |
| Vehicles: truck, sedan, SUV, police, ambulance, debris (`public/models/cars/`) | Kenney — Car Kit (kenney.nl) | CC0 (see `KENNEY_LICENSE.txt`) |
| PBR textures (asphalt, mud, forest ground, bark, rust, planks) and HDRI sky (`public/tex/`) | Poly Haven (polyhaven.com) | CC0 |
| Character portraits, title art | Removed in v1.3.1 (no photos ship with the game) | — |
| Footsteps, melee impacts, reload clicks/latches, shell casings, glass, metal, wood, door, cloth, coins (`public/sfx/step_*`, `punch*`, `bat*`, `flesh*`, `metal*`, `shell*`, `glass*`, `plank*`, `reload_*`, `cloth*`, `door_open`, `creak`, `knife`, `chop`, `coins`) | Kenney — Impact Sounds & RPG Audio (kenney.nl), converted to mp3 | CC0 (see `public/sfx/KENNEY_LICENSE.txt`) |
| Gunshots, explosion, thunder, rain loop, truck engine, zombie growls/moans/attacks/eating, boss roar, NPC screams (`public/sfx/gun_*`, `explosion`, `thunder*`, `rain_loop`, `truck_loop`, `z_*`, `boss_roar`, `scream*`) | Procedurally synthesized by `tools/make_audio.py` (numpy + ffmpeg) | © Lone Keem Studios |
| Music, wind, UI tones, synth fallbacks | Synthesized at runtime with Web Audio (`src/audio.js`) | © Lone Keem Studios |
| Engine / tools | three.js (MIT), Vite (MIT), Capacitor (MIT) | MIT |
| Voiced dialogue & shouts (`public/sfx/v/`) | Text-to-speech with Kokoro-82M (hexgrad, Apache-2.0) stock synthetic voices, rendered offline by `tools/make_audio.py` (lightly pitch-tuned). No real person's voice was cloned or imitated. Subtitles stay on; voices can be turned off in Settings. | Model: Apache-2.0 · Audio: © Lone Keem Studios |

## v1.8.0 audio additions
- New/rewritten lines for Ch10–11 and the dialogue pass, Kokoro stock voices (Dr. Vance: af_nicole).

## v1.7.1 audio additions
- Procedural SFX (footsteps mud/asphalt, zombie shuffles, breathing, jump/land, roll, squelches, car alarm, wind, tires) synthesized in-repo by `tools/sfx3d.py` — original, CC0.
- All voices: Kokoro-82M stock voices (Apache-2.0), rendered locally with free tools; no voice cloning, no paid TTS. All voice lines are subtitled.
