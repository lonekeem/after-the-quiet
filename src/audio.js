// Procedural audio: every sound and music cue here is synthesized at runtime (no external sample files).
export class AudioSys {
  constructor(settings) { this.s = settings; this.ctx = null; this.voiceEl = null; }
  init() {
    if (this.ctx) { this.ctx.resume(); return; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    const ctx = this.ctx = new C();
    this.master = ctx.createGain(); this.master.connect(ctx.destination);
    this.music = ctx.createGain(); this.music.connect(this.master);
    this.sfx = ctx.createGain(); this.sfx.connect(this.master);
    // reverb
    const len = ctx.sampleRate * 2.5, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    this.verb = ctx.createConvolver(); this.verb.buffer = ir; const vg = ctx.createGain(); vg.gain.value = 0.35; this.verb.connect(vg); vg.connect(this.master);
    // noise buffer
    const nb = this.noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const d = nb.getChannelData(0); let last = 0;
    for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    this.white = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const wd = this.white.getChannelData(0); for (let i = 0; i < wd.length; i++) wd[i] = Math.random() * 2 - 1;
    // wind bed
    const src = ctx.createBufferSource(); src.buffer = nb; src.loop = true;
    this.windF = ctx.createBiquadFilter(); this.windF.type = 'lowpass'; this.windF.frequency.value = 400;
    this.windG = ctx.createGain(); this.windG.gain.value = 0.15;
    src.connect(this.windF); this.windF.connect(this.windG); this.windG.connect(this.music); src.start();
    this.padG = ctx.createGain(); this.padG.gain.value = 0; this.padG.connect(this.music); this.padG.connect(this.verb);
    this.mode = 'menu'; this.applyVolumes();
    this._tick = setInterval(() => this.ambientTick(), 1000);
    this.chordIdx = 0;
  }
  applyVolumes() { if (!this.ctx) return;
    if (!this.ctx) return;
    this.master.gain.value = this.s.vol; this.music.gain.value = this.s.music;
    if (this.voiceEl) this.voiceEl.volume = Math.min(1, this.s.vol * this.s.voice);
  }
  setMood(mode) { if (!this.ctx) return; this.mode = mode; if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const wind = { menu: 0.25, day: 0.07, evening: 0.14, night: 0.3, tense: 0.32, sad: 0.12 }[mode] ?? 0.15;
    this.windG.gain.setTargetAtTime(wind, t, 1.5);
    this.windF.frequency.setTargetAtTime(mode === 'day' ? 900 : 380, t, 1.5);
  }
  tone(freq, dur, type = 'sine', vol = 0.05, dest, attack = 0.8) { if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g); g.connect(dest || this.padG); o.start(t); o.stop(t + dur + 0.1); return o;
  }
  ambientTick() { if (!this.ctx) return;
    if (!this.ctx || this.ctx.state !== 'running') return;
    const m = this.mode, t = this.ctx.currentTime;
    this.padG.gain.setTargetAtTime(m === 'tense' ? 0.5 : 0.8, t, 1);
    // music pad every 6s
    if ((this._n = (this._n || 0) + 1) % 6 === 0) {
      const sets = {
        day: [[261.6, 329.6, 392, 493.9], [220, 261.6, 329.6, 392], [174.6, 220, 261.6, 329.6], [196, 246.9, 293.7, 392]],
        evening: [[220, 261.6, 329.6], [174.6, 220, 261.6], [196, 233, 293.7], [164.8, 207.7, 246.9]],
        sad: [[220, 261.6, 329.6, 440], [174.6, 220, 261.6, 349.2], [130.8, 196, 261.6, 329.6], [146.8, 174.6, 220, 293.7]],
        night: [[55, 82.4, 116.5], [51.9, 77.8, 110]], tense: [[55, 58.3, 82.4], [49, 51.9, 73.4]], menu: [[55, 82.4, 98], [49, 73.4, 92.5]]
      }[m] || [];
      if (sets.length) { const ch = sets[this.chordIdx++ % sets.length]; ch.forEach(f => this.tone(f, 7, m === 'day' || m === 'sad' ? 'triangle' : 'sawtooth', m === 'day' ? 0.018 : 0.012, null, 2)); }
    }
    if (m === 'day' && Math.random() < 0.35) this.bird();
    if ((m === 'evening' || m === 'night' || m === 'menu') && Math.random() < 0.05) this.siren(0.02);
    if ((m === 'night' || m === 'tense') && Math.random() < 0.08) this.dog();
  }
  bird() { if (!this.ctx) return; const ctx = this.ctx, t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    const f = 2500 + Math.random() * 1500; o.frequency.setValueAtTime(f, t);
    for (let i = 0; i < 3; i++) { o.frequency.linearRampToValueAtTime(f * 1.3, t + i * 0.12 + 0.05); o.frequency.linearRampToValueAtTime(f, t + i * 0.12 + 0.1); }
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.012, t + 0.02); g.gain.linearRampToValueAtTime(0, t + 0.4);
    o.connect(g); g.connect(this.music); g.connect(this.verb); o.start(); o.stop(t + 0.5); }
  siren(vol = 0.03, dur = 8) { if (!this.ctx) return; const ctx = this.ctx, t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = 'sawtooth'; f.type = 'lowpass'; f.frequency.value = 900;
    for (let i = 0; i < dur; i++) { o.frequency.setValueAtTime(650, t + i); o.frequency.linearRampToValueAtTime(950, t + i + 0.5); o.frequency.linearRampToValueAtTime(650, t + i + 1); }
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 2); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(f); f.connect(g); g.connect(this.sfx); g.connect(this.verb); o.start(); o.stop(t + dur); }
  dog() { if (!this.ctx) return; for (let i = 0; i < 3; i++) setTimeout(() => this.noise(0.15, 500, 0.02, 'bandpass'), i * 350); }
  noise(dur, freq, vol, type = 'lowpass', q = 1) { if (!this.ctx) return; const ctx = this.ctx, t = ctx.currentTime, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = this.white; f.type = type; f.frequency.value = freq; f.Q.value = q; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.sfx); g.connect(this.verb); s.start(); s.stop(t + dur + 0.05); }
  glass() { if (!this.ctx) return; for (let i = 0; i < 8; i++) setTimeout(() => { this.noise(0.3, 3000 + Math.random() * 4000, 0.25, 'bandpass', 8); this.tone(2000 + Math.random() * 3000, 0.25, 'sine', 0.04, this.sfx, 0.005); }, i * 40 + Math.random() * 60); }
  hit() { if (!this.ctx) return; this.noise(0.15, 400, 0.6); this.tone(90, 0.2, 'sine', 0.4, this.sfx, 0.005); }
  swing() { if (!this.ctx) return; this.noise(0.18, 1200, 0.15, 'bandpass', 2); }
  hurt() { if (!this.ctx) return; this.tone(120, 0.4, 'sawtooth', 0.15, this.sfx, 0.01); this.noise(0.3, 300, 0.4); }
  groan(vol = 0.1) { if (!this.ctx) return; const ctx = this.ctx, t = ctx.currentTime, o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'sawtooth'; const b = 70 + Math.random() * 50; o.frequency.setValueAtTime(b, t); o.frequency.linearRampToValueAtTime(b * 0.7, t + 1.4);
    f.type = 'bandpass'; f.frequency.value = 500 + Math.random() * 300; f.Q.value = 3;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.3); g.gain.linearRampToValueAtTime(0, t + 1.5);
    o.connect(f); f.connect(g); g.connect(this.sfx); g.connect(this.verb); o.start(); o.stop(t + 1.6); }
  thud() { if (!this.ctx) return; this.tone(55, 0.6, 'sine', 0.6, this.sfx, 0.005); this.noise(0.4, 200, 0.5); }
  crash() { if (!this.ctx) return; this.noise(1.4, 800, 0.9); this.glass(); this.thud(); }
  heartbeat() { if (!this.ctx) return; this.tone(50, 0.15, 'sine', 0.4, this.sfx, 0.01); setTimeout(() => this.tone(45, 0.15, 'sine', 0.3, this.sfx, 0.01), 250); }
  staticBurst(dur = 1.5) { if (!this.ctx) return; this.noise(dur, 2500, 0.08, 'bandpass', 0.5); }
  sting() { if (!this.ctx) return; this.tone(55, 4, 'sawtooth', 0.08, this.sfx, 0.05); [110, 164.8, 220, 329.6].forEach((f, i) => setTimeout(() => this.tone(f, 3.5, 'triangle', 0.05, this.verb, 0.4), 200 + i * 120)); this.noise(2.5, 6000, 0.05, 'highpass'); }
  radioJingle() { if (!this.ctx) return; [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone(f, 0.4, 'square', 0.02, this.sfx, 0.01), i * 160)); }
  // narration files
  playVoice(url) {
    return new Promise(res => {
      if (this.voiceEl) { this.voiceEl.pause(); }
      const a = this.voiceEl = new Audio(url); a.volume = Math.min(1, this.s.vol * this.s.voice);
      let done = false; const fin = () => { if (!done) { done = true; res(true); } };
      a.onended = fin; a.onerror = () => res(false);
      a.play().catch(() => res(false));
    });
  }
  stopVoice() { if (this.voiceEl) { this.voiceEl.pause(); this.voiceEl.onended?.(); } }
  // trailer score: deep detuned drone + slow swells
  drone(on) { if (!this.ctx) return; const ctx = this.ctx, t = ctx.currentTime;
    if (on && !this._dr) { const g = ctx.createGain(); g.gain.value = 0; g.connect(this.music); g.connect(this.verb);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260; f.connect(g);
      this._dr = { g, os: [36.7, 36.9, 55, 73.4].map(fr => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; o.connect(f); o.start(); return o; }) };
      g.gain.linearRampToValueAtTime(0.09, t + 6); }
    if (!on && this._dr) { const d = this._dr; this._dr = null; d.g.gain.setTargetAtTime(0, t, 0.05); setTimeout(() => d.os.forEach(o => o.stop()), 800); } }
  boom() { if (!this.ctx) return; this.tone(32, 3, 'sine', 0.7, this.sfx, 0.01); this.noise(2.2, 120, 0.6); this.tone(65, 4, 'triangle', 0.06, this.verb, 0.05); }
}
