import * as THREE from 'three';
const $ = (s) => document.querySelector(s);
// Keyboard + mouse, touch (virtual joystick, camera drag, on-screen buttons) and gamepad.
export class Input {
  constructor(g) { this.g = g; this.keys = {}; this.move = new THREE.Vector2(); this.look = new THREE.Vector2(); this.edge = {}; this.prev = {}; this.atk = false; this.aim = false; this.run = false; this.touchRun = false; this.btn = {};
    const sens = () => (this.g.settings.sens || 1);
    addEventListener('keydown', e => { if (e.repeat) return; this.keys[e.code] = true; const m = { KeyE: 'use', KeyF: 'use', Space: 'jump', ControlLeft: 'roll', KeyQ: 'swap', KeyR: 'reload', KeyG: 'gren', KeyH: 'heal', KeyC: 'crouch', KeyV: 'view', Enter: 'skip', KeyJ: 'atk' }[e.code]; if (m) this.edge[m] = true; if (e.code === 'Enter') g.skipLine(); });
    addEventListener('keyup', e => { this.keys[e.code] = false; });
    const cv = $('#gl'); let drag = null;
    cv.addEventListener('mousedown', e => { if (g.paused) return; if (matchMedia('(pointer:fine)').matches && !document.pointerLockElement && cv.requestPointerLock) { try { cv.requestPointerLock(); } catch (x) {} }
      if (e.button === 0) { this.mAtk = true; this.edge.atk = true; } if (e.button === 2) this.mAim = true; drag = { x: e.clientX, y: e.clientY }; });
    addEventListener('mouseup', e => { if (e.button === 0) this.mAtk = false; if (e.button === 2) this.mAim = false; drag = null; });
    cv.addEventListener('contextmenu', e => e.preventDefault());
    addEventListener('mousemove', e => { if (g.paused) return; if (document.pointerLockElement === cv) { this.look.x += e.movementX * .0024 * sens(); this.look.y += e.movementY * .0024 * sens(); } else if (drag) { this.look.x += (e.clientX - drag.x) * .005 * sens(); this.look.y += (e.clientY - drag.y) * .005 * sens(); drag = { x: e.clientX, y: e.clientY }; } });
    // touch: stick
    const zone = $('#stickZone'), base = $('#stickBase'), knob = $('#stickKnob'); this.stickId = null; this.stick = new THREE.Vector2();
    zone.addEventListener('touchstart', e => { const t = e.changedTouches[0]; this.stickId = t.identifier; const r = base.getBoundingClientRect(); this.sc = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; this.stickMove(t); e.preventDefault(); }, { passive: false });
    zone.addEventListener('touchmove', e => { for (const t of e.changedTouches) if (t.identifier === this.stickId) this.stickMove(t); e.preventDefault(); }, { passive: false });
    const end = e => { for (const t of e.changedTouches) { if (t.identifier === this.stickId) { this.stickId = null; this.stick.set(0, 0); knob.style.transform = ''; } if (t.identifier === this.lookId) this.lookId = null; } };
    zone.addEventListener('touchend', end); zone.addEventListener('touchcancel', end);
    // touch: camera drag anywhere else on the canvas/stage
    const st = $('#stage');
    st.addEventListener('touchstart', e => { for (const t of e.changedTouches) { if (t.target.closest('button') || t.target.closest('#stickZone') || t.target.closest('#dlg')) continue; if (this.lookId == null) { this.lookId = t.identifier; this.lp = { x: t.clientX, y: t.clientY }; } } }, { passive: true });
    st.addEventListener('touchmove', e => { for (const t of e.changedTouches) if (t.identifier === this.lookId) { this.look.x += (t.clientX - this.lp.x) * .0065 * sens(); this.look.y += (t.clientY - this.lp.y) * .0065 * sens(); this.lp = { x: t.clientX, y: t.clientY }; } }, { passive: true });
    st.addEventListener('touchend', end); st.addEventListener('touchcancel', end);
    // buttons
    const hold = (id, k) => { const b = $(id); if (!b) return; const on = e => { e.preventDefault(); e.stopPropagation(); this.btn[k] = true; this.edge[k] = true; b.classList.add('on'); }; const off = e => { this.btn[k] = false; b.classList.remove('on'); };
      b.addEventListener('touchstart', on, { passive: false }); b.addEventListener('touchend', off); b.addEventListener('touchcancel', off); b.addEventListener('mousedown', e => { on(e); }); b.addEventListener('mouseup', off); b.addEventListener('mouseleave', off); };
    const toggle = (id, k, cb) => { const b = $(id); if (!b) return; const f = e => { e.preventDefault(); e.stopPropagation(); cb ? cb(b) : (this.edge[k] = true); }; b.addEventListener('touchstart', f, { passive: false }); b.addEventListener('click', e => { if (e.pointerType !== 'touch' && e.detail !== 0) f(e); }); };
    hold('#tAtk', 'atk'); toggle('#tRoll', 'roll'); toggle('#tJump', 'jump'); toggle('#tUse', 'use'); toggle('#tReload', 'reload');
    toggle('#tRun', 'run', b => { this.touchRun = !this.touchRun; b.classList.toggle('on', this.touchRun); }); toggle('#tCrouch', 'crouch', b => { this.edge.crouch = true; setTimeout(() => b.classList.toggle('on', g.state.crouch), 30); });
    toggle('#tAim', 'aim', b => { this.tAim = !this.tAim; b.classList.toggle('on', this.tAim); });
    toggle('#btnGren', 'gren'); toggle('#btnSwap', 'swap'); toggle('#btnView', 'view');
    $('#dlg').addEventListener('click', () => g.skipLine());
  }
  stickMove(t) { const dx = t.clientX - this.sc.x, dy = t.clientY - this.sc.y, R = 55; const l = Math.hypot(dx, dy), k = l > R ? R / l : 1; this.stick.set(dx * k / R, dy * k / R); $('#stickKnob').style.transform = `translate(${dx * k}px,${dy * k}px)`; this.touchRunAuto = l > R * 1.25; }
  pressed(k) { const v = this.edge[k]; this.edge[k] = false; return v; }
  poll(dt) { const K = this.keys; let x = (K.KeyD ? 1 : 0) - (K.KeyA ? 1 : 0), y = (K.KeyS ? 1 : 0) - (K.KeyW ? 1 : 0); if (K.ArrowRight) x = 1; if (K.ArrowLeft) x = -1; if (K.ArrowUp) y = -1; if (K.ArrowDown) y = 1;
    this.move.set(x, y); if (this.move.lengthSq() > 1) this.move.normalize(); if (this.stick.lengthSq() > .0025) this.move.copy(this.stick);
    this.run = !!(K.ShiftLeft || K.ShiftRight) || this.touchRun; this.atk = !!(this.mAtk || this.btn.atk || K.KeyJ); this.aim = !!(this.mAim || this.tAim);
    if (K.Escape || K.KeyP) { K.Escape = K.KeyP = false; this.g.onPause && this.g.onPause(); }
    const pads = navigator.getGamepads ? navigator.getGamepads() : []; const p = pads && [...pads].find(q => q && q.connected); if (p) { const ax = p.axes, B = (i) => p.buttons[i] && p.buttons[i].pressed; const dz = v => Math.abs(v) < .15 ? 0 : v;
      if (Math.abs(ax[0]) > .15 || Math.abs(ax[1]) > .15) this.move.set(dz(ax[0]), dz(ax[1])); this.look.x += dz(ax[2] || 0) * dt * 2.6 * (this.g.settings.sens || 1); this.look.y += dz(ax[3] || 0) * dt * 2.0 * (this.g.settings.sens || 1);
      const map = { 0: 'jump', 1: 'roll', 3: 'reload', 4: 'gren', 5: 'swap', 8: 'view', 11: 'crouch', 12: 'use', 2: 'atk' }; for (const i in map) { const now = B(+i); if (now && !this.prev[i]) this.edge[map[i]] = true; if (+i === 3 && now && !this.prev[i]) this.g.skipLine(); this.prev[i] = now; }
      if (B(7) || B(2)) this.atk = true; if (B(6)) this.aim = true; if (B(10)) this.run = true; const st = B(9); if (st && !this.prev.st) this.g.onPause && this.g.onPause(); this.prev.st = st; } }
}
