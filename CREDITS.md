# Credits & Licenses — After the Quiet (v1.2, cinematic edition)
Lone Keem Studios · created by Keem

| Asset | Source | License |
|---|---|---|
| Cinematic stills (57 images, `public/img/`) | Original AI-generated images made for this game, using in-house character reference portraits for consistency | © Lone Keem Studios |
| Voices (narrator, Marcus, Dana, Walt, Ruth, news, radio) | Synthesized locally with **Kokoro-82M** (Apache-2.0) through `kokoro-onnx` (MIT), using its stock voices (am_michael, am_fenrir, af_heart, bm_george, af_bella, af_sarah, bm_lewis), then slowed, padded and EQ'd with FFmpeg. Original synthetic voices, not cloned from or imitating any real person. Kids' lines (Kemoy, Nia, Theo) are subtitle-only. | Apache-2.0 / MIT, commercial use permitted |
| Sound effects, ambience, trailer score | Synthesized at runtime with the Web Audio API (`src/audio.js`) | © Lone Keem Studios |
| Build tools | Vite (MIT), Capacitor (MIT) | MIT |
| Fonts | System fonts | not bundled |

Render voices again with: `python tools/render_voices.py lines.json` (see the script header).
