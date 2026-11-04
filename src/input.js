// Unified input: keyboard+mouse (pointer lock), touch (virtual stick + look drag + buttons), Gamepad API.
export class Input {
  constructor(canvas, settings) {
    this.s = settings; this.canvas = canvas;
    this.keys = {}; this.move = { x: 0, y: 0 }; this.look = { x: 0, y: 0 };
    this.pressed = new Set(); // edge-triggered actions: use, hit, light, pause
    this.run = false; this.touchRun = false; this.enabled = false;
    this.isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    this.lastPad = {}; this.padActive = false;
    addEventListener('keydown', e => {
      if (e.repeat) return; this.keys[e.code] = true;
      const map = { KeyE: 'use', Space: 'use', Enter: 'use', KeyF: 'hit', KeyL: 'light', Escape: 'pause', KeyP: 'pause' };
      if (map[e.code]) this.pressed.add(map[e.code]);
    });
    addEventListener('keyup', e => { this.keys[e.code] = false; });
    canvas.addEventListener('mousedown', e => {
      if (!this.enabled || this.isTouch) return;
      if (document.pointerLockElement !== canvas) { canvas.requestPointerLock?.(); return; }
      if (e.button === 0) this.pressed.add('hit');
      if (e.button === 2) this.pressed.add('use');
    });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    addEventListener('mousemove', e => {
      if (document.pointerLockElement === canvas) { this.look.x += e.movementX * 0.0022; this.look.y += e.movementY * 0.0022; }
    });
    this.setupTouch();
  }
  setupTouch() {
    const stick = document.getElementById('stick'), knob = document.getElementById('knob');
    let sid = null, sc = null; this.stickV = { x: 0, y: 0 };
    stick.addEventListener('touchstart', e => { const t = e.changedTouches[0]; sid = t.identifier; const r = stick.getBoundingClientRect(); sc = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; e.preventDefault(); }, { passive: false });
    const lookIds = new Map();
    addEventListener('touchmove', e => {
      for (const t of e.changedTouches) {
        if (t.identifier === sid) {
          let dx = t.clientX - sc.x, dy = t.clientY - sc.y; const l = Math.hypot(dx, dy), m = 55;
          if (l > m) { dx *= m / l; dy *= m / l; }
          this.stickV = { x: dx / m, y: dy / m }; knob.style.transform = `translate(${dx}px,${dy}px)`;
        } else if (lookIds.has(t.identifier)) {
          const p = lookIds.get(t.identifier); this.look.x += (t.clientX - p.x) * 0.006; this.look.y += (t.clientY - p.y) * 0.006;
          lookIds.set(t.identifier, { x: t.clientX, y: t.clientY });
        }
      }
    }, { passive: false });
    const end = e => { for (const t of e.changedTouches) { if (t.identifier === sid) { sid = null; this.stickV = { x: 0, y: 0 }; knob.style.transform = ''; } lookIds.delete(t.identifier); } };
    addEventListener('touchend', end); addEventListener('touchcancel', end);
    this.canvas.addEventListener('touchstart', e => { for (const t of e.changedTouches) if (t.clientX > innerWidth * 0.35) lookIds.set(t.identifier, { x: t.clientX, y: t.clientY }); }, { passive: true });
    document.querySelectorAll('#touch [data-b]').forEach(b => {
      b.addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); const k = b.dataset.b;
        if (k === 'run') { this.touchRun = !this.touchRun; b.classList.toggle('on', this.touchRun); } else this.pressed.add(k); }, { passive: false });
      b.addEventListener('click', () => { const k = b.dataset.b; if (k !== 'run') this.pressed.add(k); });
    });
  }
  pollPad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : []; let p = null;
    for (const g of pads) if (g && g.connected) { p = g; break; }
    this.pad = p; if (!p) return;
    const dz = v => Math.abs(v) < 0.15 ? 0 : v;
    const b = i => !!(p.buttons[i] && (p.buttons[i].pressed || p.buttons[i].value > 0.5));
    const edge = (i, name) => { const v = b(i); if (v && !this.lastPad[i]) { this.pressed.add(name); this.padActive = true; } this.lastPad[i] = v; };
    edge(0, 'use'); edge(2, 'hit'); edge(7, 'hit'); edge(3, 'light'); edge(9, 'pause'); edge(1, 'back');
    edge(12, 'up'); edge(13, 'down');
    this.padMove = { x: dz(p.axes[0] || 0), y: dz(p.axes[1] || 0) };
    this.padLook = { x: dz(p.axes[2] || 0), y: dz(p.axes[3] || 0) };
    this.padRun = b(4) || b(10);
    if (Math.abs(this.padMove.x) + Math.abs(this.padMove.y) > 0.3) this.padActive = true;
  }
  update(dt) {
    this.pollPad();
    let x = 0, y = 0; const k = this.keys;
    if (k.KeyW || k.ArrowUp) y -= 1; if (k.KeyS || k.ArrowDown) y += 1; if (k.KeyA || k.ArrowLeft) x -= 1; if (k.KeyD || k.ArrowRight) x += 1;
    x += this.stickV.x; y += this.stickV.y;
    if (this.padMove) { x += this.padMove.x; y += this.padMove.y; }
    const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; }
    this.move = { x, y };
    this.run = k.ShiftLeft || k.ShiftRight || this.touchRun || this.padRun;
    const sens = this.s.sens, inv = this.s.invert ? -1 : 1;
    let lx = this.look.x * sens, ly = this.look.y * sens * inv;
    if (this.padLook) { lx += this.padLook.x * 2.6 * dt * sens; ly += this.padLook.y * 2.0 * dt * sens * inv; }
    this.look = { x: 0, y: 0 };
    return { lx, ly };
  }
  take(name) { const h = this.pressed.has(name); this.pressed.delete(name); return h; }
  clear() { this.pressed.clear(); }
}
