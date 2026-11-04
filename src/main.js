import { AudioSys } from './audio.js';
import { SCENES, CAST, ITEMS, CHAPTER_STARTS, hash } from './script.js';
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const DEF = { vol: 0.9, auto: false, music: 0.6, text: 1, subs: true, gore: true, qteEasy: false, still: false, hints: true };
// localStorage can throw (Safari private mode, blocked storage): fall back to memory
const LS = (() => { try { const k = '__t'; localStorage.setItem(k, 1); localStorage.removeItem(k); return localStorage; } catch { const m = {}; return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; } }; } })();
let _saved = {}; try { _saved = JSON.parse(LS.getItem('atq2.settings') || '{}') || {}; } catch {}
const S = Object.assign({}, DEF, _saved);
const saveS = () => LS.setItem('atq2.settings', JSON.stringify(S));
const audio = new AudioSys(S);
const G = window.__atq = { state: 'boot', scene: -1, inv: [], flags: {}, device: 'kbd' };
// ---------- input ----------
let listeners = [];
function emit(a, key) { listeners.slice().forEach(l => l(a, key)); }
function on(fn) { listeners.push(fn); return () => listeners = listeners.filter(x => x !== fn); }
function waitFor(acts) { let off; const p = new Promise(r => off = on((a, k) => { if (G.state === 'play' && acts.includes(a)) { off(); r(a); } })); p.cancel = () => off(); return p; }
function setDevice(d) { if (G.device !== d) { G.device = d; document.body.dataset.dev = d; refreshPrompts(); } }
const KEYMAP = { ' ': 'ok', Enter: 'ok', e: 'ok', E: 'ok', ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', Tab: 'next', Escape: 'pause', p: 'pause', i: 'inv', c: 'cont', '1': 'c1', '2': 'c2', '3': 'c3' };
addEventListener('keydown', e => { setDevice('kbd'); audio.init(); const k = e.key.length === 1 ? e.key.toUpperCase() : e.key.toUpperCase();
  if (e.key === 'Tab') e.preventDefault(); emit('key', k === ' ' ? 'SPACE' : k); const a = KEYMAP[e.key]; if (a) emit(a); else if (G.state === 'play') emit('any'); });
addEventListener('pointerdown', e => { setDevice(e.pointerType === 'touch' ? 'touch' : 'kbd'); audio.init(); });
const PADMAP = { 0: 'A', 1: 'B', 2: 'X', 3: 'Y', 9: 'START', 12: 'up', 13: 'down', 14: 'left', 15: 'right' };
let padPrev = {};
function pollPad() { const pads = navigator.getGamepads ? navigator.getGamepads() : []; for (const p of pads) { if (!p) continue;
  p.buttons.forEach((b, i) => { const was = padPrev[i]; padPrev[i] = b.pressed; if (b.pressed && !was && PADMAP[i]) { setDevice('pad'); audio.init(); const n = PADMAP[i];
    emit('key', n); if (n === 'A') emit('ok'); else if (n === 'B') emit('cont'); else if (n === 'Y') emit('inv'); else if (n === 'START') emit('pause'); else emit(n); } });
  const ax = p.axes[1] || 0; if (Math.abs(ax) > .6 && !padPrev.ax) { padPrev.ax = 1; setDevice('pad'); emit(ax > 0 ? 'down' : 'up'); } else if (Math.abs(ax) < .3) padPrev.ax = 0; break; } }
const glyph = { ok: { kbd: 'SPACE', pad: 'Ⓐ', touch: 'TAP' }, cont: { kbd: 'C', pad: 'Ⓑ', touch: 'TAP' } };
function refreshPrompts() { const c = $('#cont'); if (c.dataset.mode) c.textContent = c.dataset.mode === 'skip' ? `${glyph.ok[G.device]} skip intro` : c.dataset.mode === 'cont' ? `${glyph.cont[G.device]}  Continue ▸` : `${glyph.ok[G.device]} ▸`; }
// ---------- visuals ----------
let layerIdx = 0, curImg = '';
const imgURL = n => `./img/${n}.webp`;
function preload(n) { const i = new Image(); i.src = imgURL(n); return i.decode?.().catch(() => {}) || Promise.resolve(); }
async function showShot(img, kb = 'in', fx = [], gore = false) {
  await Promise.race([preload(img), sleep(2500)]);
  const L = [$('#L0'), $('#L1')]; const next = L[layerIdx ^ 1], cur = L[layerIdx];
  if (img !== curImg) { next.style.backgroundImage = `url(${imgURL(img)})`; next.className = 'layer'; void next.offsetWidth; next.className = `layer on kb-${kb}`; cur.classList.remove('on'); layerIdx ^= 1; curImg = img; }
  L[layerIdx].classList.toggle('gore-soft', gore && !S.gore);
  setFx(fx);
}
let fxSet = [];
function setFx(fx) { fxSet = fx; $('#fog').classList.toggle('on', fx.includes('fog')); $('#flash').classList.toggle('flicker', fx.includes('flicker')); initParticles(); }
const wc = $('#weather'), wx = wc.getContext('2d'); let parts = [];
function initParticles() { parts = []; const n = fxSet.includes('rain') ? 260 : fxSet.includes('snow') ? 160 : 0; for (let i = 0; i < n; i++) parts.push({ t: fxSet.includes('rain') ? 'r' : 's', x: Math.random(), y: Math.random(), v: .5 + Math.random() });
  if (fxSet.includes('embers')) for (let i = 0; i < 60; i++) parts.push({ t: 'e', x: Math.random(), y: Math.random(), v: .3 + Math.random() });
  if (fxSet.includes('dust')) for (let i = 0; i < 50; i++) parts.push({ t: 'd', x: Math.random(), y: Math.random(), v: .2 + Math.random() * .4 }); }
const gc = $('#grain'), gx = gc.getContext('2d'); gc.width = 192; gc.height = 108; const gimg = gx.createImageData(192, 108);
let lastT = 0;
function frame(t) { const dt = Math.min(.05, (t - lastT) / 1000); lastT = t; pollPad();
  if (wc.width !== innerWidth) { wc.width = innerWidth; wc.height = innerHeight; }
  const W = wc.width, H = wc.height; wx.clearRect(0, 0, W, H);
  for (const p of parts) {
    if (p.t === 'r') { p.y += dt * 1.8 * p.v; p.x -= dt * .15; wx.strokeStyle = 'rgba(190,210,220,.35)'; wx.lineWidth = 1; wx.beginPath(); wx.moveTo(p.x * W, p.y * H); wx.lineTo(p.x * W - 4, p.y * H + 18 * p.v); wx.stroke(); }
    else if (p.t === 's') { p.y += dt * .08 * p.v; p.x += Math.sin(t / 900 + p.v * 9) * dt * .02; wx.fillStyle = 'rgba(240,245,255,.7)'; wx.beginPath(); wx.arc(p.x * W, p.y * H, 1.2 + p.v * 1.5, 0, 7); wx.fill(); }
    else if (p.t === 'e') { p.y -= dt * .06 * p.v; p.x += Math.sin(t / 700 + p.v * 20) * dt * .02; wx.fillStyle = `rgba(255,${120 + p.v * 60 | 0},40,${.4 + .5 * Math.abs(Math.sin(t / 300 + p.v * 9))})`; wx.fillRect(p.x * W, p.y * H, 2.2, 2.2); }
    else { p.y += Math.sin(t / 2000 + p.v * 30) * dt * .01; p.x += dt * .01 * p.v; wx.fillStyle = 'rgba(255,240,210,.25)'; wx.fillRect(p.x * W, p.y * H, 1.5, 1.5); }
    if (p.y > 1.05) { p.y = -.05; p.x = Math.random() * 1.1; } if (p.y < -.05) { p.y = 1.05; p.x = Math.random(); } if (p.x > 1.05) p.x = -.05; if (p.x < -.05) p.x = 1.05;
  }
  const d = gimg.data; for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } gx.putImageData(gimg, 0, 0);
  requestAnimationFrame(frame); }
requestAnimationFrame(frame);
let px = 0, py = 0; const applyPar = () => { if (!S.still) $('#par').style.transform = `translate(${px * -1.4}%,${py * -1.4}%)`; };
addEventListener('pointermove', e => { px = e.clientX / innerWidth - .5; py = e.clientY / innerHeight - .5; applyPar(); });
addEventListener('deviceorientation', e => { if (e.gamma == null) return; px = Math.max(-.5, Math.min(.5, e.gamma / 60)); py = Math.max(-.5, Math.min(.5, (e.beta - 45) / 60)); applyPar(); });
// ---------- ui helpers ----------
function toast(html, ms = 2200) { const t = $('#toast'); t.innerHTML = html; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), ms); }
let goal = '';
function setGoal(t) { goal = t || ''; obj(goal); }
const hglyph = (k) => G.device === 'touch' ? 'Tap' : G.device === 'pad' ? ({ ok: 'Ⓐ', cont: 'Ⓨ', move: 'D-pad' })[k] : ({ ok: 'Enter / Click', cont: 'C', move: 'Arrow keys' })[k];
async function tutorial(kind) {
  if (!S.hints || LS.getItem('atq2.tut.' + kind)) return; LS.setItem('atq2.tut.' + kind, 1);
  const msg = kind === 'hot' ? `<b>Look around</b><br>Glowing circles are things you can interact with.<br>${G.device === 'touch' ? 'Tap one' : G.device === 'pad' ? 'D-pad to select · Ⓐ to use' : 'Click one, or Arrow keys + Enter'}.<br><small>The line at the top-left always tells you what to do.</small>`
    : `<b>Quick-time events</b><br>When the red button appears, ${G.device === 'touch' ? 'tap it' : 'press the key shown'}.<br>MASH = press fast · WAIT FOR IT = press when the marker is in the green<br>DON'T MOVE = press nothing. The ring shows time left.<br><small>Fail? You retry from the checkpoint. Easier QTEs in Settings.</small>`;
  const t = document.createElement('div'); t.id = 'tut'; t.innerHTML = msg + `<div class="tk">${G.device === 'touch' ? 'Tap' : G.device === 'pad' ? 'Ⓐ' : 'Enter'} to continue</div>`; document.body.appendChild(t);
  await Promise.race([waitFor(['ok', 'next', 'cont']), new Promise(r => t.onpointerdown = r), sleep(15000)]); t.remove();
}
function obj(text) { text = text || goal; const o = $('#obj'); o.textContent = text ? '◆ ' + text : ''; o.classList.toggle('on', !!text); }
function cont(mode) { const c = $('#cont'); c.dataset.mode = mode || ''; c.classList.toggle('hidden', !mode); refreshPrompts(); }
$('#cont').onclick = () => emit($('#cont').dataset.mode === 'cont' ? 'cont' : 'ok');
$('#stage').addEventListener('click', e => { if (e.target.closest('button,.hot,#qbtn')) return; emit('ok'); });
let abortScene = null; // set to reject current scene on retry/quit
class Abort extends Error {}
let abortRes = null, abortP = new Promise(r => abortRes = r);
function setAbort(w) { abortScene = w; abortRes(); abortP = new Promise(r => abortRes = r); emit('tick'); }
function guard() { if (abortScene) throw new Abort(); }
async function say(who, text, { auto = false } = {}) {
  guard(); const sub = $('#subs'), c = CAST[who], line = $('#line'), narr = who === 'narrator';
  $('#who').textContent = narr ? '' : c?.name || who; $('#who').style.color = c?.color || ''; sub.classList.toggle('narr', narr);
  const pt = $('#portrait'); if (c?.img) { pt.style.backgroundImage = `url(${imgURL(c.img)})`; pt.style.display = ''; } else { pt.style.display = 'none'; }
  line.textContent = ''; const chars = [...text].map(ch => { const e = document.createElement('span'); e.className = 'ch'; e.textContent = ch; line.appendChild(e); return e; });
  sub.classList.add('on'); cont(auto ? null : 'next');
  const skip = Promise.race([waitFor(['ok']), abortP]).then(() => 'ok');
  // typewriter fade: reveal letter by letter, tap completes the line
  const per = (narr ? 34 : 24) / S.text; let done = false; const tapEarly = skip.then(() => { done = true; });
  for (let i = 0; i < chars.length && !done && !abortScene; i++) { chars[i].classList.add('in'); if (per > 1) await Promise.race([sleep(per * (/[.,!?—]/.test(chars[i].textContent) ? 6 : 1)), tapEarly]); }
  chars.forEach(e => e.classList.add('in')); guard();
  if (auto || S.auto) await Promise.race([sleep(Math.max(1800, text.length * 45) / S.text), waitFor(['ok']), abortP]);
  else await Promise.race([waitFor(['ok']), abortP]);
  sub.classList.remove('on'); cont(null); await sleep(450); guard();
}
async function choice(opts) {
  guard(); const box = $('#choices'); box.innerHTML = ''; let sel = 0;
  const btns = opts.map((o, i) => { const b = document.createElement('button'); b.innerHTML = `<b>${G.device === 'pad' ? '' : i + 1}</b>${o.t}`; box.appendChild(b); return b; });
  const mark = () => btns.forEach((b, i) => b.classList.toggle('sel', i === sel && G.device !== 'touch')); mark();
  const pick = await new Promise(res => { btns.forEach((b, i) => b.onclick = e => { e.stopPropagation(); res(i); });
    const off = on(a => { if (G.state !== 'play' && !abortScene) return; if (a === 'up') sel = (sel + opts.length - 1) % opts.length; if (a === 'down') sel = (sel + 1) % opts.length; mark();
      if (a === 'ok') res(sel); const m = /^c(\d)$/.exec(a); if (m && +m[1] <= opts.length) res(+m[1] - 1); if (abortScene) res(-1); });
    btns._off = off; });
  btns._off(); box.innerHTML = ''; guard(); const o = opts[pick]; if (o.flag) G.flags[o.flag] = true;
  for (const [w, t] of o.r || []) await say(w, t);
}
async function hotspots(list, need, optional) {
  guard(); await tutorial('hot'); const box = $('#hots'); box.innerHTML = '';
  if (!goal) obj(need ? 'Find: ' + list.filter(h => need.includes(h.item) || need.includes(h.l)).map(h => h.l).join(', ') : 'Look around, or continue'); const got = new Set(); let sel = -1;
  const els = list.map(h => { const b = document.createElement('button'); b.className = 'hot'; b.style.left = h.x + '%'; b.style.top = h.y + '%'; b.innerHTML = `<span>${h.l}</span>`; box.appendChild(b); return b; });
  const done = () => need ? need.every(n => got.has(n)) : false;
  if (optional) cont('cont');
  await new Promise(res => {
    let busy = false, idle = null;
    const poke = () => { clearTimeout(idle); if (!S.hints) return; idle = setTimeout(() => { const i = list.findIndex((h, k) => !els[k].classList.contains('done') && (!need || need.includes(h.item) || need.includes(h.l))); const j = i >= 0 ? i : 0;
      els[j]?.classList.add('hint'); toast(`<b style="color:#7fd49a">Hint</b><br>${hglyph("ok")} the glowing <b>${list[j].l}</b>${optional ? ` · or ${hglyph("cont")} to move on` : ''}`); poke(); }, 20000); };
    poke();
    const act = async i => { if (busy) return; busy = true; poke(); els[i].classList.remove('hint'); const h = list[i]; els[i].classList.add('done'); box.style.pointerEvents = 'none';
      if (h.look) await say('kemoy', h.look).catch(() => {}); if (h.talk) for (const [w, t] of h.talk) await say(w, t).catch(() => {});
      if (h.item) { got.add(h.item); if (!h.item.startsWith('_')) giveItem(h.item); } got.add(h.l);
      box.style.pointerEvents = ''; busy = false; if (optional) cont('cont'); if (done() || abortScene) { clearTimeout(idle); off(); res(); } };
    els.forEach((b, i) => b.onclick = e => { e.stopPropagation(); act(i); });
    const mark = () => els.forEach((b, i) => b.classList.toggle('sel', i === sel));
    const off = on(a => { if (busy || (G.state !== 'play' && !abortScene)) return; if (['next', 'right', 'down'].includes(a)) { sel = (sel + 1) % els.length; mark(); } if (['left', 'up'].includes(a)) { sel = (sel + els.length - 1) % els.length; mark(); }
      if (a === 'ok' && sel >= 0) act(sel); if (a === 'cont' && optional) { off(); res(); } if (abortScene) { off(); res(); } });
    $('#cont').onclick = () => { if (optional && !busy) { off(); res(); } };
  });
  $('#cont').onclick = () => emit($('#cont').dataset.mode === 'cont' ? 'cont' : 'ok');
  box.innerHTML = ''; cont(null); obj(goal); guard();
}
function giveItem(id) { if (!G.inv.includes(id)) G.inv.push(id); audio.radioJingle?.(); toast(`<b style="color:#7fd49a">Picked up</b><br>${ITEMS[id].name}`); }
async function qte(q) {
  guard(); await tutorial('qte'); const easy = S.qteEasy, time = q.time * (q.type === 'still' ? 1 : easy ? 1.8 : 1.3) * 1000, need = Math.ceil((q.count || 1) * (easy ? .55 : .8));
  const keys = { kbd: q.type === 'press' ? ['E', 'Q', 'F', 'SPACE'][Math.random() * 4 | 0] : 'SPACE', pad: q.type === 'press' ? ['A', 'B', 'X', 'Y'][Math.random() * 4 | 0] : 'A' };
  const label = () => G.device === 'touch' ? 'TAP' : G.device === 'pad' ? { A: 'Ⓐ', B: 'Ⓑ', X: 'Ⓧ', Y: 'Ⓨ' }[keys.pad] : keys.kbd;
  const el = $('#qte'); el.classList.remove('hidden'); $('#qlabel').textContent = q.label + (q.type === 'still' ? ' · DON\'T MOVE' : q.type === 'mash' ? ' · MASH' : q.type === 'timing' ? ' · WAIT FOR IT' : '');
  $('#qbtn').textContent = q.type === 'still' ? '…' : label(); $('#qbar').style.display = q.type === 'timing' ? 'block' : 'none'; audio.heartbeat();
  const t0 = performance.now(); let hits = 0, result = null; const zone = [.55, .85]; $('#qzone').style.left = '55%'; $('#qzone').style.width = '30%';
  const pos = () => { const u = ((performance.now() - t0) / time) * 2; return u <= 1 ? u : 2 - u; };
  const press = k => { if (result) return; if (q.type === 'still') { result = 'fail'; return; } const want = G.device === 'pad' ? keys.pad : keys.kbd; if (k !== 'TAP' && k !== want && !(want === 'SPACE' && k === 'ENTER')) { if (q.type === 'press' && ['E', 'Q', 'F', 'SPACE', 'A', 'B', 'X', 'Y'].includes(k)) result = 'fail'; return; }
    $('#qbtn').classList.add('hitk'); setTimeout(() => $('#qbtn').classList.remove('hitk'), 80); audio.swing();
    if (q.type === 'press') result = 'ok'; else if (q.type === 'mash') { hits++; if (hits >= need) result = 'ok'; } else { const p = pos(); result = p >= zone[0] - (easy ? .05 : 0) && p <= zone[1] + (easy ? .05 : 0) ? 'ok' : 'fail'; } };
  const off = on((a, k) => { if (a === 'key' && G.state === 'play') press(k); });
  $('#qbtn').onpointerdown = e => { e.stopPropagation(); press('TAP'); };
  while (!result) { const el2 = performance.now() - t0; if (el2 > time) result = q.type === 'still' ? 'ok' : 'fail'; if (abortScene) result = 'abort';
    $('#qtime i').style.width = (100 - el2 / time * 100) + '%'; $('#qbtn').style.setProperty('--t', (1 - el2 / time) * 360 + 'deg'); $('#qmark').style.left = (pos() * 100) + '%'; $('#qbtn').textContent = q.type === 'still' ? '…' : label(); if (q.type === 'still' && Math.random() < .004) audio.groan(.12); await sleep(16); }
  off(); el.classList.add('hidden'); guard();
  if (result === 'ok') { audio.hit(); $('#flash').classList.remove('hit'); void $('#flash').offsetWidth; return; }
  audio.hurt(); $('#flash').classList.add('hit'); await sleep(600); throw new Abort('dead');
}
async function card(a, b, ms = 4200) { const c = $('#card'); c.querySelector('.c1').textContent = a; c.querySelector('.c2').textContent = b || ''; c.classList.remove('hidden'); audio.sting(); await Promise.race([sleep(ms), waitFor(['ok']), abortP]); c.classList.add('hidden'); guard(); }
async function blackCut(text) { const f = $('#fade'); f.style.transition = 'none'; f.style.opacity = 1; audio.drone(false); audio.boom(); f.innerHTML = `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:italic clamp(22px,3.4vw,40px) Georgia;color:#dfe;letter-spacing:.1em;opacity:0;transition:opacity 2s" id="dtext">${text}</div>`;
  await sleep(1400); $('#dtext').style.opacity = 1; await sleep(3400); $('#dtext').style.opacity = 0; await sleep(1600); f.innerHTML = ''; f.style.transition = ''; audio.setMood('day'); }
// ---------- scene runner ----------
function save(i) { LS.setItem('atq2.save', JSON.stringify({ scene: i, inv: G.inv, flags: G.flags, t: Date.now() })); }
function load() { try { return JSON.parse(LS.getItem('atq2.save')); } catch { return null; } }
let cpScene = 0, cpInv = [], cpFlags = {};
async function runScene(i) {
  const sc = SCENES[i]; if (sc.ifFlag && !G.flags[sc.ifFlag]) return; G.scene = i; setGoal(sc.goal || (sc.trailer ? '' : 'Watch. Listen.')); G.sceneId = sc.id; G.state = 'play';
  if (sc.cp || i === 0) { cpScene = i; cpInv = [...G.inv]; cpFlags = { ...G.flags }; }
  save(i); audio.setMood(sc.mood || 'day'); if (sc.trailer) audio.drone(true);
  if (SCENES[i + 1]) preload(SCENES[i + 1].img);
  await showShot(sc.img, sc.kb, sc.fx || [], sc.gore);
  await Promise.race([sleep(sc.trailer ? 1500 : 2200), abortP]);
  $('#hudr').classList.toggle('hidden', !!sc.trailer);
  for (const b of sc.beats) { guard();
    if (b.shot) { await showShot(b.shot, b.kb, b.fx || [], false); await Promise.race([sleep(1600), abortP]); guard(); const nx = sc.beats[sc.beats.indexOf(b) + 1]; if (nx?.shot) preload(nx.shot); }
    if (b.n) { await say('narrator', b.n, { auto: !!sc.trailer }); if (sc.trailer) { await Promise.race([sleep(2400), abortP]); guard(); } }
    if (b.s) await say(b.s[0], b.s[1]);
    if (b.obj) setGoal(b.obj);
    if (b.choice) await choice(b.choice);
    if (b.hot) await hotspots(b.hot, b.need, b.optional);
    if (b.item) giveItem(b.item);
    if (b.qte) await qte(b.qte);
    if (b.scare) { audio.glass(); audio.sting(); audio.groan(.3); $('#flash').classList.remove('hit'); void $('#flash').offsetWidth; $('#flash').classList.add('hit'); document.body.classList.add('snap'); await showShot(b.scare, 'in', ['flicker'], true); setTimeout(() => document.body.classList.remove('snap'), 400); navigator.vibrate?.(300); await Promise.race([sleep(700), abortP]); }
    if (b.sfx) ({ siren: () => audio.siren(.04, 10), glass: () => audio.glass(), groan: () => audio.groan(.15), crash: () => audio.crash(), thud: () => audio.thud(), static: () => audio.staticBurst(2.5), bell: () => [0, 2.4, 4.8, 7.2].forEach(d => setTimeout(() => audio.tone?.(196, 3, 'sine', .09, audio.verb, .01), d * 1000)) })[b.sfx]?.();
    if (b.ifFlag && G.flags[b.ifFlag]) for (const [w, t] of b.then) await say(w, t);
    if (b.black) await blackCut(b.black);
    if (b.card) await card(...b.card);
  }
  if (sc.trailer) audio.drone(false);
}
async function play(from) {
  showScreen(null); fadeIn(); G.state = 'play';
  for (let i = from; i < SCENES.length; i++) {
    abortScene = null; let skipOff = null;
    if (SCENES[i].trailer) { cont('skip'); skipOff = on(a => { if (a === 'ok' || a === 'cont' || a === 'pause') setAbort('skip'); }); }
    try { await runScene(i); } catch (e) {
      skipOff?.(); cont(null); $('#subs').classList.remove('on'); $('#hots').innerHTML = ''; $('#choices').innerHTML = ''; $('#qte').classList.add('hidden'); obj('');
      if (!(e instanceof Abort)) { console.error(e); }
      const why = abortScene || e.message; abortScene = null;
      if (why === 'skip') { audio.drone(false); await blackCut('The day before...'); continue; }
      if (why === 'quit') return;
      if (why === 'dead') { G.state = 'dead'; showScreen('#dead'); await waitClick('#btnRetry'); showScreen(null); }
      G.inv = [...cpInv]; G.flags = { ...cpFlags }; i = cpScene - 1; continue;
    }
    skipOff?.(); cont(null);
  }
  LS.removeItem('atq2.save'); LS.setItem('atq2.done', '1'); G.state = 'title'; toTitle();
}
// ---------- menus ----------
function showScreen(id) { $$('.screen').forEach(s => s.classList.add('hidden')); if (id) $(id).classList.remove('hidden'); menuNav(id); }
function fadeIn() { $('#fade').style.opacity = 0; }
function waitClick(sel) { return new Promise(r => { const b = $(sel); const h = () => { b.removeEventListener('click', h); r(); }; b.addEventListener('click', h); }); }
let navOff = null;
function menuNav(id) { navOff?.(); navOff = null; if (!id) return; const root = $(id); let i = 0;
  const btns = () => [...root.querySelectorAll('button:not(.hidden),input')].filter(b => b.offsetParent);
  const mark = () => btns().forEach((b, j) => b.classList.toggle('sel', j === i && G.device !== 'touch'));
  mark(); navOff = on(a => { const B = btns(); if (!B.length) return; if (a === 'down' || a === 'next') i = (i + 1) % B.length; if (a === 'up') i = (i + B.length - 1) % B.length;
    const el = B[i]; if (el?.type === 'range' && (a === 'left' || a === 'right')) { el.value = +el.value + (a === 'right' ? 1 : -1) * +el.step; el.dispatchEvent(new Event('input')); }
    if (a === 'ok' && el) el.click(); if ((a === 'cont') && root.querySelector('.back')) root.querySelector('.back').click(); mark(); }); }
let back = '#title';
function toTitle() { G.state = 'title'; audio.setMood('menu'); $('#btnContinue').classList.toggle('hidden', !load()); showScreen('#title'); back = '#title'; }
$$('.back').forEach(b => b.onclick = () => { if (G.state === 'pausedSettings') { G.state = 'paused'; showScreen('#pause'); return; } if (G.state === 'inv') { G.state = 'play'; showScreen(null); return; } showScreen(back); });
$('#btnWarn').onclick = async () => { try { audio.init(); audio.sting(); } catch (e) { console.warn('audio', e); } showScreen(null); $('#studio').classList.remove('hidden'); fadeIn();
  await Promise.race([sleep(4200), waitFor(['ok', 'any'])]); $('#studio').classList.add('hidden'); toTitle(); };
$('#btnNew').onclick = () => { G.inv = []; G.flags = {}; play(0); };
$('#btnContinue').onclick = () => { const s = load(); if (!s) return; G.inv = s.inv || []; G.flags = s.flags || {}; play(s.scene); };
$('#btnChapters').onclick = () => { const L = $('#chapterList'); L.innerHTML = '';
  const row = (t, sub, idx) => { const d = document.createElement('div'); d.className = 'chap' + (idx == null ? ' locked' : ''); d.innerHTML = `<div><b>${t}</b><div class="small">${sub}</div></div>`;
    if (idx != null) { const b = document.createElement('button'); b.textContent = 'Play'; b.dataset.act = idx === 0 ? 'new' : 'act' + idx; b.onclick = () => { G.inv = []; SCENES.slice(0, idx).forEach(sc => sc.beats.forEach(b => { if (b.item) G.inv.push(b.item); (b.hot || []).forEach(h => { if (h.item && !h.item.startsWith('_') && (b.need || []).includes(h.item)) G.inv.push(h.item); }); })); G.flags = {}; play(idx); }; d.appendChild(b); } L.appendChild(d); };
  row('Chapter 1 · The Day Before', 'Lone Keem, Maine · the full chapter', 0);
  CHAPTER_STARTS.slice(1).forEach(([n, i]) => row('— ' + n, 'Chapter 1', i));
  [['Chapter 2 · High Water', 'Coming soon'], ['Chapter 3 · The Bridge', 'Coming soon'], ['Chapter 4 · Atrium', 'Coming soon'], ['Chapter 5 · First Snow', 'Coming soon']].forEach(([a, b]) => row(a, b));
  showScreen('#chapters'); };
const bindS = (id, k, chk) => { const el = $(id); if (chk) { el.checked = S[k]; el.onchange = () => { S[k] = el.checked; saveS(); applyS(); }; } else { el.value = S[k]; el.oninput = () => { S[k] = +el.value; saveS(); applyS(); }; } };
function applyS() { audio.applyVolumes(); document.body.classList.toggle('still', S.still); if (!S.still) applyPar(); else $('#par').style.transform = '';
  const sc = SCENES[G.scene]; if (sc) $$('.layer.on').forEach(l => l.classList.toggle('gore-soft', !!sc.gore && !S.gore)); }
bindS('#sVol', 'vol'); bindS('#sMusic', 'music'); bindS('#sText', 'text'); bindS('#sAuto', 'auto', 1); bindS('#sGore', 'gore', 1); bindS('#sQte', 'qteEasy', 1); bindS('#sMotion', 'still', 1); bindS('#sHints', 'hints', 1); applyS();
$('#btnSettings').onclick = () => showScreen('#settings'); $('#btnControls').onclick = () => showScreen('#controls'); $('#btnCredits').onclick = () => showScreen('#credits');
function pause() { if (G.state !== 'play' || SCENES[G.scene]?.trailer) return; G.state = 'paused'; $$('.layer').forEach(l => l.style.animationPlayState = 'paused'); showScreen('#pause'); }
function resume() { G.state = 'play'; showScreen(null); $$('.layer').forEach(l => l.style.animationPlayState = ''); }
$('#btnPause').onclick = e => { e.stopPropagation(); pause(); };
$('#btnInv').onclick = e => { e.stopPropagation(); openInv(); };
function openInv() { if (G.state !== 'play') return; G.state = 'inv'; $('#invList').innerHTML = G.inv.length ? G.inv.map(i => `<div class="invi"><b>${ITEMS[i].name}</b><br>${ITEMS[i].desc}</div>`).join('') : '<p class="small">Empty pockets.</p>'; showScreen('#inv'); }
on(a => { if (a === 'pause') { if (G.state === 'play') pause(); else if (G.state === 'paused') resume(); else if (G.state === 'inv') { G.state = 'play'; showScreen(null); } } if (a === 'inv') { if (G.state === 'play') openInv(); else if (G.state === 'inv') { G.state = 'play'; showScreen(null); } } });
$('#btnResume').onclick = resume;
$('#btnRestartCp').onclick = () => { resume(); setAbort('retry'); };
$('#btnQuit').onclick = () => { resume(); setAbort('quit'); setTimeout(toTitle, 50); };
$('#btnPauseSettings').onclick = () => { G.state = 'pausedSettings'; showScreen('#settings'); };
// listeners that pause the story while a menu is open: block story input
const _emit = emit;
// boot
document.body.dataset.dev = 'kbd';
if ('ontouchstart' in window) setDevice('touch');
const qs = new URLSearchParams(location.search);
if (qs.has('scene') || qs.has('id')) { $('#warning').classList.add('hidden'); const i = qs.get('id') ? SCENES.findIndex(s => s.id === qs.get('id')) : +qs.get('scene'); G.inv = ['compass', 'sketchbook', 'flashlight', 'bat']; play(i); }
else { fadeIn(); }
window.__atqBooted = true;
window.__atq.go = i => { setAbort('quit'); setTimeout(() => play(i), 100); };
document.querySelector('#title .tbg').style.backgroundImage = "url(./img/title_bg.webp)";
