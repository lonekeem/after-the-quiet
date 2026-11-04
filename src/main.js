import * as THREE from 'three';
import { AudioSys } from './audio.js';
import { Input } from './input.js';
import { buildWorld, makePerson, makeZombie, CAST, box } from './world.js';
import { NARR, makeChapter1 } from './chapter1.js';

const $ = id => document.getElementById(id);
const BASE = import.meta.env.BASE_URL;
// ---------- settings & save ----------
const DEF = { vol: 0.9, voice: 1, music: 0.7, sens: 1, subs: true, gore: true, invert: false };
const settings = Object.assign({}, DEF, JSON.parse(localStorage.getItem('atq_settings') || '{}'));
const saveSettings = () => localStorage.setItem('atq_settings', JSON.stringify(settings));
const getSave = () => JSON.parse(localStorage.getItem('atq_save') || 'null');
const setSave = s => localStorage.setItem('atq_save', JSON.stringify(s));

// ---------- renderer ----------
const canvas = $('c');
const mobile = matchMedia('(pointer: coarse)').matches;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.75));
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(72, 1, 0.05, 260);
const resize = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); };
addEventListener('resize', resize); resize();
scene.fog = new THREE.FogExp2(0xb8c4c0, 0.02);
const hemi = new THREE.HemisphereLight(0xcfe0e8, 0x3a3a30, 1); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0d8, 1.5); sun.position.set(-30, 40, 20); scene.add(sun);
const flash = new THREE.SpotLight(0xfff6e0, 0, 28, 0.45, 0.45, 1.4); camera.add(flash); flash.position.set(0.15, -0.1, 0); flash.target.position.set(0, 0, -5); camera.add(flash.target); scene.add(camera);
// held bat
const bat = new THREE.Group(); box(bat, 0, 0, 0, 0.06, 0.06, 0.9, 0x8a6a42); box(bat, 0, 0, 0.42, 0.04, 0.04, 0.2, 0x222); bat.position.set(0.32, -0.32, -0.55); bat.rotation.set(-0.5, 0.2, 0.3); bat.visible = false; camera.add(bat);

const W = buildWorld(scene);
const audio = new AudioSys(settings);
const input = new Input(canvas, settings);

// ---------- time of day ----------
const TOD = {
  day: { fog: 0xb4c2bc, dens: 0.016, hemi: 1.1, sun: 1.6, sky: 0xb4c2bc, interior: 0, street: false, mood: 'day' },
  evening: { fog: 0x6e6460, dens: 0.022, hemi: 0.55, sun: 0.45, sky: 0x6e6460, interior: 1, street: true, mood: 'evening' },
  night: { fog: 0x0b1410, dens: 0.05, hemi: 0.16, sun: 0.06, sky: 0x0b1410, interior: 0.5, street: true, mood: 'night' },
  menu: { fog: 0x14221b, dens: 0.035, hemi: 0.5, sun: 0.1, sky: 0x0c1612, interior: 0, street: true, mood: 'menu' },
};
let tod = 'day';
function setTOD(name) {
  tod = name; const t = TOD[name];
  scene.fog.color.setHex(t.fog); scene.fog.density = t.dens; scene.background = new THREE.Color(t.sky);
  hemi.intensity = t.hemi; sun.intensity = t.sun; sun.color.setHex(name === 'evening' ? 0xffb080 : name === 'day' ? 0xfff0d8 : 0x8aa0c8);
  W.lights.interior.forEach(l => l.intensity = t.interior * 7);
  W.lights.street.forEach(m => m.material = m.material.clone(), 0);
  W.lights.street.forEach(m => { m.material.emissive.setHex(t.street ? 0xffcc88 : 0); });
  W.lights.windows.forEach((m, i) => { m.material = m.material.clone(); m.material.emissive.setHex(t.street && i % 3 !== 2 ? 0x6a5530 : 0); });
  audio.setMood(t.mood);
}
setTOD('menu');

// ---------- player ----------
const P = { x: 0, z: 0, y: 1.32, yaw: 0, pitch: 0, hp: 100, lastHurt: 0, speed: 0, bob: 0, control: false, hasBat: false, light: false, hasLight: false, swingT: 0 };
const trail = [];
function placePlayer(x, z, yaw = 0) { P.x = x; P.z = z; P.yaw = yaw; P.pitch = 0; trail.length = 0; for (let i = 0; i < 30; i++) trail.push({ x, z }); }
function collide(o, r = 0.3) {
  for (const c of W.colliders) {
    if (o.x > c.minX - r && o.x < c.maxX + r && o.z > c.minZ - r && o.z < c.maxZ + r) {
      const dl = o.x - (c.minX - r), dr = (c.maxX + r) - o.x, dt = o.z - (c.minZ - r), db = (c.maxZ + r) - o.z, m = Math.min(dl, dr, dt, db);
      if (m === dl) o.x = c.minX - r; else if (m === dr) o.x = c.maxX + r; else if (m === dt) o.z = c.minZ - r; else o.z = c.maxZ + r;
    }
  }
}

// ---------- NPCs ----------
const npcs = {};
for (const k of ['marcus', 'dana', 'nia', 'theo', 'walt', 'ruth']) { const n = makePerson(CAST[k]); n.visible = false; n.mode = 'idle'; scene.add(n); npcs[k] = n; }
const kemoyModel = makePerson(CAST.kemoy); scene.add(kemoyModel); kemoyModel.visible = false;
function npc(name, x, z, face = 0) { const n = npcs[name]; n.visible = true; n.position.set(x, 0, z); n.rotation.y = face; n.mode = 'idle'; n.goal = null; return n; }
function follow(name, slot) { const n = npcs[name]; n.visible = true; n.mode = 'follow'; n.slot = slot; }
function goTo(name, x, z) { const n = npcs[name]; n.visible = true; n.mode = 'goto'; n.goal = { x, z }; return new Promise(res => n.onArrive = res); }
function hideNpc(...names) { names.forEach(n => { npcs[n].visible = false; npcs[n].mode = 'idle'; }); }
function updateNpcs(dt) {
  for (const n of Object.values(npcs)) {
    if (!n.visible) continue; let tx, tz, spd = 0;
    if (n.mode === 'follow') { const p = trail[Math.min(trail.length - 1, n.slot * 3 + 2)]; tx = p.x; tz = p.z; }
    else if (n.mode === 'goto') { tx = n.goal.x; tz = n.goal.z; }
    if (tx !== undefined) {
      const dx = tx - n.position.x, dz = tz - n.position.z, d = Math.hypot(dx, dz);
      if (d > (n.mode === 'goto' ? 0.15 : 0.6)) { spd = Math.min(d * 2, P.running && n.mode === 'follow' ? 5.6 : 3.2); n.position.x += dx / d * spd * dt; n.position.z += dz / d * spd * dt; n.rotation.y = Math.atan2(dx, dz); }
      else if (n.mode === 'goto') { n.mode = 'idle'; n.onArrive?.(); }
    }
    if (n.mode === 'idle' && n.lookAtPlayer !== false) { const a = Math.atan2(P.x - n.position.x, P.z - n.position.z); const d = Math.hypot(P.x - n.position.x, P.z - n.position.z); if (d < 5) n.rotation.y += (a - n.rotation.y + Math.PI * 3) % (Math.PI * 2) - Math.PI > 0 ? Math.min(dt * 3, ((a - n.rotation.y + Math.PI * 3) % (Math.PI * 2) - Math.PI)) : Math.max(-dt * 3, ((a - n.rotation.y + Math.PI * 3) % (Math.PI * 2) - Math.PI)); }
    n.animate(dt, spd);
  }
}

// ---------- zombies ----------
let zombies = [];
const particles = [];
function spawnZombie(x, z, opts = {}) {
  const m = makeZombie(settings.gore, opts.base); m.position.set(x, 0, z); scene.add(m);
  const zz = { m, x, z, hp: opts.hp || 3, speed: opts.speed || (0.9 + Math.random() * 0.6), stagger: 0, dead: false, deadT: 0, idle: !!opts.idle, aggro: opts.aggro || 22, atk: 0 };
  zombies.push(zz); return zz;
}
function clearZombies() { zombies.forEach(z => scene.remove(z.m)); zombies = []; }
function burst(x, y, z) {
  const color = settings.gore ? 0x6a0a0a : 0x6a6a60;
  for (let i = 0; i < 12; i++) { const p = box(scene, x, y, z, 0.06, 0.06, 0.06, color); p.v = new THREE.Vector3((Math.random() - 0.5) * 3, Math.random() * 3, (Math.random() - 0.5) * 3); p.life = 0.8; particles.push(p); }
}
function updateZombies(dt, now) {
  for (const z of zombies) {
    if (z.dead) { z.deadT += dt; z.m.rotation.x = Math.max(-Math.PI / 2, z.m.rotation.x - dt * 4); if (z.deadT > 6) { scene.remove(z.m); z.gone = true; } continue; }
    const dx = P.x - z.x, dz = P.z - z.z, d = Math.hypot(dx, dz); let spd = 0;
    if (z.stagger > 0) { z.stagger -= dt; }
    else if (!z.idle && d < z.aggro && state === 'play') {
      spd = z.speed; z.x += dx / d * spd * dt; z.z += dz / d * spd * dt; z.m.rotation.y = Math.atan2(dx, dz);
      for (const o of zombies) if (o !== z && !o.dead) { const ox = z.x - o.x, oz = z.z - o.z, od = Math.hypot(ox, oz); if (od < 0.6 && od > 0) { z.x += ox / od * (0.6 - od) * 0.5; z.z += oz / od * (0.6 - od) * 0.5; } }
      collide(z, 0.25);
      if (d < 1.15 && now - z.atk > 1100 && P.control) { z.atk = now; hurtPlayer(settings.gore ? 20 : 16); }
    } else if (z.idle) { z.m.rotation.z = Math.sin(now / 900 + z.x) * 0.06; }
    if (!z.idle && d < 14 && Math.random() < dt * 0.15) audio.groan(Math.max(0.02, 0.15 - d * 0.01));
    z.m.position.set(z.x, 0, z.z); z.m.animate(dt, spd);
  }
  zombies = zombies.filter(z => !z.gone);
  for (const p of particles) { p.life -= dt; p.v.y -= 9 * dt; p.position.addScaledVector(p.v, dt); if (p.position.y < 0.03) { p.position.y = 0.03; p.v.set(0, 0, 0); } if (p.life <= 0) scene.remove(p); }
  for (let i = particles.length - 1; i >= 0; i--) if (particles[i].life <= 0) particles.splice(i, 1);
}
function swing() {
  if (!P.hasBat || P.swingT > 0) return; P.swingT = 0.45; audio.swing();
  const fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw); let best = null, bd = 2.1;
  for (const z of zombies) { if (z.dead) continue; const dx = z.x - P.x, dz = z.z - P.z, d = Math.hypot(dx, dz); if (d < bd && (dx * fx + dz * fz) / d > 0.5) { best = z; bd = d; } }
  if (best) setTimeout(() => {
    if (best.dead) return; audio.hit(); best.hp--; best.stagger = 0.8; best.x += fx * 1.0; best.z += fz * 1.0; collide(best, 0.25); burst(best.x, 1.4, best.z);
    if (best.hp <= 0) { best.dead = true; audio.thud(); if (settings.gore) { const pool = box(scene, best.x, 0.02, best.z, 1, 0.01, 0.8, 0x3a0505); setTimeout(() => scene.remove(pool), 30000); } }
  }, 150);
}
function hurtPlayer(dmg) {
  P.hp -= dmg; P.lastHurt = performance.now(); audio.hurt(); $('damage').style.opacity = 1; setTimeout(() => $('damage').style.opacity = 0, 300);
  if (P.hp <= 0) die();
}

// ---------- UI ----------
const screens = ['warning', 'title', 'chapters', 'settings', 'controls', 'credits', 'pause', 'dead', 'loading'];
let screenStack = [];
function show(name) { screens.forEach(s => $(s).classList.toggle('hidden', s !== name)); focusIdx = 0; updateFocus(); }
function hideScreens() { screens.forEach(s => $(s).classList.add('hidden')); }
function fade(to, ms = 1200) { $('fade').style.transition = `opacity ${ms}ms`; $('fade').style.opacity = to; return wait(ms); }
let state = 'menu', runToken = 0;
const wait = ms => new Promise(r => setTimeout(r, ms));
function setObjective(t) { $('objective').textContent = t ? '◆ ' + t : ''; }
let subTimer;
function subtitle(html) { clearTimeout(subTimer); $('subs').innerHTML = settings.subs && html ? `<span>${html}</span>` : ''; }
function chapterCard(n, t, s, ms = 4500) { const c = $('chaptercard'); c.innerHTML = `<div class="n">${n}</div><div class="t">${t}</div>${s ? `<div class="s">${s}</div>` : ''}`; c.classList.remove('hidden'); return wait(ms).then(() => c.classList.add('hidden')); }

// ---------- scripting API ----------
let interacts = [];
const G = {
  THREE, W, npcs, P, settings, audio, scene, camera,
  token: () => runToken,
  alive(tok) { if (tok !== runToken) throw new Error('cancelled'); },
  wait: (ms) => { const t = runToken; return wait(ms).then(() => { if (t !== runToken) return new Promise(() => {}); }); },
  objective: setObjective, setTOD, npc, follow, goTo, hideNpc, spawnZombie, clearZombies, chapterCard, fade, placePlayer,
  get zombies() { return zombies; },
  control(on) { P.control = on; },
  giveBat() { P.hasBat = true; bat.visible = true; }, giveLight() { P.hasLight = true; P.light = true; },
  async narrate(id) {
    const t = runToken; subtitle(`<span class="nar">${NARR[id]}</span>`);
    const ok = await audio.playVoice(`${BASE}audio/narration/${id}.mp3`);
    if (!ok) await wait(Math.max(2500, NARR[id].split(' ').length * 420));
    if (t !== runToken) return new Promise(() => {});
    subtitle(''); await wait(300);
  },
  async say(lines) {
    for (const [who, text] of lines) {
      const t = runToken; subtitle(`<b class="who">${who}:</b> ${text}`);
      const dur = Math.max(1800, text.split(' ').length * 330 + 600); const start = performance.now(); input.take('use');
      while (performance.now() - start < dur) { await wait(50); if (t !== runToken) return new Promise(() => {}); if (performance.now() - start > 500 && input.take('use')) break; }
    }
    subtitle('');
  },
  waitZone(x, z, r) { const t = runToken; return new Promise(res => { const iv = setInterval(() => { if (t !== runToken) { clearInterval(iv); return; } if (Math.hypot(P.x - x, P.z - z) < r) { clearInterval(iv); res(); } }, 100); }); },
  waitInteract(target, label, r = 2.2) { const t = runToken; return new Promise(res => { const it = { target, label, r, res: () => { interacts = interacts.filter(x => x !== it); if (t === runToken) res(); } }; interacts.push(it); }); },
  clearInteracts() { interacts = []; },
  waitKill(list) { const t = runToken; return new Promise(res => { const iv = setInterval(() => { if (t !== runToken) { clearInterval(iv); return; } if (list.every(z => z.dead)) { clearInterval(iv); res(); } }, 100); }); },
  async cine(from, look, to, ms) { // camera dolly
    P.control = false; const t0 = performance.now(); cineCam = { from, look, to, ms, t0 };
    await wait(ms); cineCam = null;
  },
  checkpoint(step) { setSave({ chapter: 1, step }); },
  finishChapter() { const s = getSave() || {}; setSave({ chapter: 1, step: 0, done1: true }); localStorage.setItem('atq_ch1_done', '1'); },
  quitToTitle: () => quitToTitle(),
  kemoyModel, flood: W.refs.flood,
};
let cineCam = null;
function targetPos(t) { return t.isObject3D ? new THREE.Vector3().setFromMatrixPosition(t.matrixWorld) : new THREE.Vector3(t.x, 1, t.z); }

const chapter = makeChapter1(G);

async function startChapter(step = 0) {
  runToken++; const tok = runToken;
  hideScreens(); $('hud').classList.remove('hidden'); if (mobile) $('touch').classList.remove('hidden');
  audio.init(); clearZombies(); Object.keys(npcs).forEach(n => hideNpc(n)); kemoyModel.visible = false;
  P.hp = 100; P.hasBat = false; bat.visible = false; P.hasLight = false; P.light = false; interacts = []; cineCam = null;
  W.refs.momCar.visible = false; W.refs.gdoor.position.y = 3.9; W.refs.gdoor.scale.y = 0.8;
  W.refs.flood.forEach(f => { f.sl.intensity = 0; });
  state = 'play'; input.enabled = true; subtitle(''); setObjective('');
  try { await chapter.run(step, tok); } catch (e) { if (e.message !== 'cancelled') console.error(e); }
}
function die() { if (state !== 'play') return; state = 'dead'; P.control = false; runToken++; audio.stopVoice(); subtitle(''); document.exitPointerLock?.(); show('dead'); }
function quitToTitle() { runToken++; state = 'menu'; audio.stopVoice(); subtitle(''); setObjective(''); $('hud').classList.add('hidden'); $('touch').classList.add('hidden'); document.exitPointerLock?.(); P.control = false; menuScene(); show('title'); refreshTitle(); $('fade').style.opacity = 0; }
function menuScene() { clearZombies(); Object.keys(npcs).forEach(n => hideNpc(n)); setTOD('menu'); W.refs.flood.forEach(f => f.sl.intensity = 60); bat.visible = false;
  for (let i = 0; i < 26; i++) spawnZombie(125 + Math.random() * 20, (Math.random() - 0.5) * 12, { idle: true });
  placePlayer(158, 0.5, Math.PI / 2 - 0.05); P.pitch = -0.02; kemoyModel.visible = true; kemoyModel.position.set(150.2, 0, 1.2); kemoyModel.rotation.y = -Math.PI / 2; const nia = npc('nia', 150.3, 2, -Math.PI / 2); nia.lookAtPlayer = false; }

// ---------- menus ----------
function refreshTitle() {
  const s = getSave(); $('btnContinue').classList.toggle('hidden', !(s && s.step > 0));
  const done = localStorage.getItem('atq_ch1_done');
  const chs = [['I', 'The Day Before', 'Lone Keem, Maine'], ['II', 'High Water', 'Flooded streets'], ['III', 'The Bridge', 'Sandbags & searchlights'], ['IV', 'Atrium', 'The mall & the underground'], ['V', 'First Snow', 'A small town up north']];
  $('chapterList').innerHTML = chs.map(([n, t, s2], i) => `<div class="ch ${i ? 'locked' : ''}"><div><div class="n">CHAPTER ${n}</div><div class="t">${t}</div><div class="small">${s2}</div></div>${i ? '<div class="soon">COMING SOON</div>' : `<div style="display:flex;gap:8px;flex-wrap:wrap">${s && s.step > 0 ? '<button data-act="cont">Continue</button>' : ''}<button class="primary" data-act="new">${done ? 'Replay' : 'Play'}</button></div>`}</div>`).join('');
  $('chapterList').querySelectorAll('[data-act]').forEach(b => b.onclick = () => { const st = b.dataset.act === 'cont' ? (getSave()?.step || 0) : 0; if (!st) setSave({ chapter: 1, step: 0 }); startChapter(st); });
}
let backTo = 'title';
$('btnWarn').onclick = () => { localStorage.setItem('atq_warned', '1'); audio.init(); studioIntro(); };
async function studioIntro() {
  hideScreens(); $('fade').style.transition = 'opacity 0s'; $('fade').style.opacity = 1;
  const c = $('studio'); c.classList.remove('hidden'); c.classList.add('play'); audio.sting();
  let skip = false; const sk = () => skip = true; addEventListener('keydown', sk); addEventListener('pointerdown', sk);
  const t0 = performance.now(); while (!skip && performance.now() - t0 < 4200) { await wait(50); if (input.take('use') || input.take('pause')) skip = true; }
  removeEventListener('keydown', sk); removeEventListener('pointerdown', sk);
  c.classList.add('hidden'); c.classList.remove('play'); audio.setMood('menu'); show('title'); refreshTitle(); fade(0, 1500);
}
$('btnContinue').onclick = () => startChapter(getSave()?.step || 0);
$('btnChapters').onclick = () => { audio.init(); refreshTitle(); show('chapters'); };
$('btnSettings').onclick = () => { backTo = 'title'; loadSettingsUI(); show('settings'); };
$('btnControls').onclick = () => show('controls'); $('btnCredits').onclick = () => show('credits');
document.querySelectorAll('.back').forEach(b => b.onclick = () => { if (backTo === 'pause' && state === 'paused') { show('pause'); } else show('title'); backTo = 'title'; });
$('btnResume').onclick = resume; $('btnRestartCp').onclick = () => startChapter(getSave()?.step || 0);
$('btnPauseSettings').onclick = () => { backTo = 'pause'; loadSettingsUI(); show('settings'); };
$('btnQuit').onclick = quitToTitle; $('btnRetry').onclick = () => startChapter(getSave()?.step || 0);
function loadSettingsUI() { $('sVol').value = settings.vol; $('sVoice').value = settings.voice; $('sMusic').value = settings.music; $('sSens').value = settings.sens; $('sSubs').checked = settings.subs; $('sGore').checked = settings.gore; $('sInvert').checked = settings.invert; }
['sVol', 'sVoice', 'sMusic', 'sSens'].forEach(id => $(id).oninput = e => { settings[{ sVol: 'vol', sVoice: 'voice', sMusic: 'music', sSens: 'sens' }[id]] = +e.target.value; saveSettings(); audio.applyVolumes(); });
['sSubs', 'sGore', 'sInvert'].forEach(id => $(id).onchange = e => { settings[{ sSubs: 'subs', sGore: 'gore', sInvert: 'invert' }[id]] = e.target.checked; saveSettings(); });
let pausedAt = null;
function pause() { if (state !== 'play') return; state = 'paused'; document.exitPointerLock?.(); audio.voiceEl?.pause(); show('pause'); }
function resume() { if (state !== 'paused') return; hideScreens(); state = 'play'; audio.voiceEl && !audio.voiceEl.ended && audio.voiceEl.play().catch(() => {}); if (!mobile) canvas.requestPointerLock?.(); }
document.addEventListener('pointerlockchange', () => { if (!document.pointerLockElement && state === 'play' && P.control && !mobile && !input.padActive) pause(); });
// gamepad menu navigation
let focusIdx = 0;
function visibleButtons() { const s = screens.find(n => !$(n).classList.contains('hidden')); return s ? [...$(s).querySelectorAll('button:not(.hidden)')] : []; }
function updateFocus() { document.querySelectorAll('button.focus').forEach(b => b.classList.remove('focus')); const b = visibleButtons()[focusIdx]; if (b && input.padActive) b.classList.add('focus'); }

// ---------- main loop ----------
const clock = new THREE.Clock();
const fwd = new THREE.Vector3();
function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05), now = performance.now();
  const { lx, ly } = input.update(dt);
  if (state !== 'play') {
    const btns = visibleButtons();
    if (btns.length) { if (input.take('down')) { focusIdx = (focusIdx + 1) % btns.length; updateFocus(); } if (input.take('up')) { focusIdx = (focusIdx - 1 + btns.length) % btns.length; updateFocus(); } if (input.take('use') && input.padActive) { btns[focusIdx]?.click(); focusIdx = 0; updateFocus(); } }
    if (input.take('pause') && state === 'paused') resume();
    input.take('hit'); input.take('light');
  } else {
    if (input.take('pause')) pause();
    if (P.control) {
      P.yaw -= lx; P.pitch = Math.max(-1.3, Math.min(1.3, P.pitch - ly));
      const run = input.run, spd = run ? 5.2 : 2.9; P.running = run && (input.move.x || input.move.y);
      const sy = Math.sin(P.yaw), cy = Math.cos(P.yaw);
      const mx = input.move.x * cy + input.move.y * sy, mz = -input.move.x * sy + input.move.y * cy;
      P.x += mx * spd * dt; P.z += mz * spd * dt; collide(P);
      const mv = Math.hypot(input.move.x, input.move.y); P.bob += dt * mv * (run ? 13 : 9);
      if (Math.hypot(P.x - trail[0].x, P.z - trail[0].z) > 0.5) { trail.unshift({ x: P.x, z: P.z }); trail.length = 40; }
      if (input.take('hit')) swing(); if (input.take('light') && P.hasLight) P.light = !P.light;
    } else { input.take('hit'); input.take('light'); }
    if (now - P.lastHurt > 4000 && P.hp < 100) P.hp = Math.min(100, P.hp + dt * 12);
    // interaction
    let prompt = '';
    if (interacts.length && P.control) {
      camera.getWorldDirection(fwd); let best = null, bs = -1;
      for (const it of interacts) {
        const tp = targetPos(it.target); if (it.target.isObject3D && it.target.isGroup) tp.y += 1.2;
        const d = Math.hypot(tp.x - P.x, tp.z - P.z);
        const dir = new THREE.Vector3(tp.x - camera.position.x, tp.y - camera.position.y, tp.z - camera.position.z).normalize();
        const dot = fwd.dot(dir); if (d < it.r && (dot > 0.55 || d < 1.0) && dot > bs) { bs = dot; best = it; }
      }
      if (best) { const key = input.padActive ? 'A' : mobile ? 'USE' : 'E'; prompt = `<b>[${key}]</b> ${best.label}`; if (input.take('use')) best.res(); }
    }
    $('prompt').innerHTML = prompt;
    $('healthbar').style.width = Math.max(0, P.hp) + '%'; $('health').style.opacity = P.hp < 100 ? 1 : 0.25;
    if (P.hp < 40 && Math.random() < dt * 1.2) audio.heartbeat();
  }
  if (P.swingT > 0) { P.swingT -= dt; const k = Math.sin((0.45 - P.swingT) / 0.45 * Math.PI); bat.rotation.set(-0.5 - k * 1.2, 0.2 + k * 0.9, 0.3); } else bat.rotation.set(-0.5, 0.2, 0.3);
  flash.intensity = P.light ? 40 : 0;
  updateNpcs(dt); updateZombies(dt, now);
  if (cineCam) {
    const k = Math.min(1, (now - cineCam.t0) / cineCam.ms), e = k * k * (3 - 2 * k);
    camera.position.set(...cineCam.from.map((v, i) => v + (cineCam.to[i] - v) * e)); camera.lookAt(...cineCam.look);
  } else if (state === 'menu') {
    const t = now / 1000; camera.position.set(158 + Math.sin(t * 0.1) * 0.6, 1.5, 0.5 + Math.sin(t * 0.07) * 1.2); camera.lookAt(130, 1.2, 0);
  } else {
    camera.position.set(P.x, P.y + Math.sin(P.bob) * 0.04, P.z); camera.rotation.set(P.pitch, P.yaw, 0, 'YXZ');
  }
  renderer.render(scene, camera);
}
loop();
menuScene();
// boot
const params = new URLSearchParams(location.search);
$('fade').style.opacity = 0;
if (params.has('step')) { localStorage.setItem('atq_warned', '1'); startChapter(+params.get('step')); }
else show('warning');
window.__atq = { get state() { return state; }, get step() { return chapter.cur; }, P, startChapter, get zombies() { return zombies.length; } };
