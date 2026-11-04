import * as THREE from 'three';
// All geometry is procedural and original (low-poly primitives).
const matCache = new Map();
export function mat(color, emissive) {
  const k = color + '_' + (emissive || '');
  if (!matCache.has(k)) matCache.set(k, new THREE.MeshLambertMaterial({ color, emissive: emissive || 0x000000 }));
  return matCache.get(k);
}
const boxG = new THREE.BoxGeometry(1, 1, 1);
export function box(parent, x, y, z, w, h, d, color, emissive) {
  const m = new THREE.Mesh(boxG, mat(color, emissive)); m.position.set(x, y, z); m.scale.set(w, h, d); parent.add(m); return m;
}
export function textTex(lines, { w = 512, h = 256, bg = '#e8e2d0', fg = '#203024', font = 'bold 60px Georgia', border = null } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, w, h); if (border) { g.strokeStyle = border; g.lineWidth = 12; g.strokeRect(10, 10, w - 20, h - 20); }
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((l, i) => { const [t, f] = Array.isArray(l) ? l : [l, font]; g.font = f; g.fillText(t, w / 2, h * (i + 1) / (lines.length + 1)); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export function sign(parent, x, y, z, w, h, lines, opts = {}, rotY = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: textTex(lines, opts), side: THREE.DoubleSide, emissive: opts.glow ? 0x223322 : 0, emissiveMap: opts.glow ? undefined : null }));
  m.position.set(x, y, z); m.rotation.y = rotY; parent.add(m); return m;
}

// ---------- People ----------
export function makePerson(o) {
  const { skin = 0x8d5a3b, shirt = 0x446655, pants = 0x2a2f38, hair = 'short', hairColor = 0x1a1410, h = 1.0, zombie = false, extra } = o;
  const g = new THREE.Group(); const body = new THREE.Group(); g.add(body); body.scale.setScalar(h);
  const limb = (x, y, w, len, color) => { const p = new THREE.Group(); p.position.set(x, y, 0); const m = box(p, 0, -len / 2, 0, w, len, w, color); body.add(p); return p; };
  g.legL = limb(-0.11, 0.85, 0.16, 0.85, pants); g.legR = limb(0.11, 0.85, 0.16, 0.85, pants);
  box(g.legL, 0, -0.84, 0.04, 0.17, 0.08, 0.26, 0x1b1b1b); box(g.legR, 0, -0.84, 0.04, 0.17, 0.08, 0.26, 0x1b1b1b);
  g.torso = new THREE.Group(); g.torso.position.y = 0.85; body.add(g.torso);
  box(g.torso, 0, 0.32, 0, 0.42, 0.62, 0.24, shirt);
  g.armL = new THREE.Group(); g.armL.position.set(-0.27, 0.6, 0); g.torso.add(g.armL); box(g.armL, 0, -0.28, 0, 0.12, 0.56, 0.13, shirt); box(g.armL, 0, -0.6, 0, 0.1, 0.12, 0.1, skin);
  g.armR = new THREE.Group(); g.armR.position.set(0.27, 0.6, 0); g.torso.add(g.armR); box(g.armR, 0, -0.28, 0, 0.12, 0.56, 0.13, shirt); box(g.armR, 0, -0.6, 0, 0.1, 0.12, 0.1, skin);
  g.head = new THREE.Group(); g.head.position.y = 0.66; g.torso.add(g.head);
  box(g.head, 0, 0.04, 0, 0.1, 0.08, 0.1, skin); // neck
  box(g.head, 0, 0.2, 0, 0.26, 0.28, 0.26, skin);
  const eye = zombie ? 0xb8c2a0 : 0x111111; box(g.head, -0.06, 0.23, 0.131, 0.045, 0.035, 0.01, eye); box(g.head, 0.06, 0.23, 0.131, 0.045, 0.035, 0.01, eye);
  box(g.head, 0, 0.15, 0.131, 0.08, 0.015, 0.01, zombie ? 0x3a1010 : 0x3b2420);
  const hm = mat(hairColor);
  const sph = new THREE.SphereGeometry(1, 6, 5);
  const blob = (x, y, z, r) => { const m = new THREE.Mesh(sph, hm); m.position.set(x, y, z); m.scale.setScalar(r); g.head.add(m); };
  if (hair === 'coils') { // short twists / coils
    box(g.head, 0, 0.35, -0.01, 0.27, 0.05, 0.27, hairColor);
    for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) blob(i * 0.055, 0.38 + Math.random() * 0.02, j * 0.055 - 0.01, 0.036);
    for (let i = -2; i <= 2; i++) { blob(-0.135, 0.3, i * 0.055, 0.03); blob(0.135, 0.3, i * 0.055, 0.03); blob(i * 0.055, 0.3, -0.135, 0.03); }
  } else if (hair === 'puffs') { box(g.head, 0, 0.35, -0.01, 0.27, 0.05, 0.27, hairColor); blob(-0.15, 0.38, -0.02, 0.09); blob(0.15, 0.38, -0.02, 0.09); }
  else if (hair === 'fade') { box(g.head, 0, 0.345, 0, 0.27, 0.04, 0.27, hairColor); box(g.head, 0, 0.25, -0.12, 0.27, 0.16, 0.04, hairColor); }
  else if (hair === 'long') { box(g.head, 0, 0.34, -0.01, 0.28, 0.07, 0.28, hairColor); box(g.head, 0, 0.12, -0.13, 0.28, 0.4, 0.06, hairColor); }
  else if (hair === 'wrap') { box(g.head, 0, 0.37, -0.02, 0.3, 0.12, 0.3, hairColor); blob(0, 0.45, -0.06, 0.1); }
  else if (hair === 'grey') { box(g.head, 0, 0.33, -0.03, 0.27, 0.03, 0.22, hairColor); box(g.head, 0, 0.22, -0.13, 0.27, 0.12, 0.03, hairColor); }
  else if (hair === 'blond') { box(g.head, 0, 0.35, 0, 0.28, 0.07, 0.28, hairColor); box(g.head, 0, 0.32, 0.12, 0.28, 0.06, 0.05, hairColor); }
  else { box(g.head, 0, 0.345, -0.01, 0.27, 0.06, 0.27, hairColor); }
  if (extra) extra(g, body);
  if (zombie) { g.armL.rotation.x = -1.3; g.armR.rotation.x = -1.1; g.head.rotation.z = 0.25; g.torso.rotation.x = 0.15; }
  g.walkPhase = Math.random() * 6; g.zombie = zombie;
  g.animate = (dt, speed) => {
    g.walkPhase += dt * speed * 3.2; const s = Math.sin(g.walkPhase) * Math.min(1, speed) * 0.6;
    g.legL.rotation.x = s; g.legR.rotation.x = -s;
    if (!zombie) { g.armL.rotation.x = -s * 0.8; g.armR.rotation.x = s * 0.8; }
    else { g.armL.rotation.x = -1.3 + s * 0.2; g.armR.rotation.x = -1.1 - s * 0.2; g.torso.rotation.z = Math.sin(g.walkPhase * 0.5) * 0.1; }
  };
  return g;
}

export const CAST = {
  kemoy: { skin: 0x5e3a26, hair: 'coils', hairColor: 0x120c09, shirt: 0x2f7d4a, pants: 0x2b3446, h: 0.86 },
  marcus: { skin: 0x4f3020, hair: 'fade', hairColor: 0x0e0a08, shirt: 0x5b6470, pants: 0x30343c, h: 1.05, extra: (g) => box(g.head, 0, 0.1, 0.1, 0.24, 0.1, 0.08, 0x0e0a08) },
  dana: { skin: 0x6b4430, hair: 'long', hairColor: 0x1b120d, shirt: 0x4f8f8a, pants: 0x4f8f8a, h: 0.98 },
  nia: { skin: 0x63402c, hair: 'puffs', hairColor: 0x140d0a, shirt: 0xc77ea0, pants: 0x5a4a7a, h: 0.66 },
  theo: { skin: 0xe6c3a5, hair: 'blond', hairColor: 0xc9a65a, shirt: 0x8a3b32, pants: 0x3a4250, h: 0.87 },
  walt: { skin: 0xd8b398, hair: 'grey', hairColor: 0xb8b8b0, shirt: 0x6b5a43, pants: 0x4a4a42, h: 0.98 },
  ruth: { skin: 0x452a1c, hair: 'wrap', hairColor: 0x2f7d4a, shirt: 0xd9d2c0, pants: 0x3a3a3a, h: 0.97 },
};
const ZSKINS = [0x7d8576, 0x8a8a7a, 0x6e7468, 0x5a4a3e, 0x9a9384, 0x4a3a30];
const ZCLOTH = [0x3a3f3a, 0x4a3a32, 0x2e3440, 0x5a5048, 0x3c4a3c, 0x55453a];
export function makeZombie(gore, base) {
  const r = a => a[Math.floor(Math.random() * a.length)];
  const o = base ? { ...base, zombie: true } : { skin: r(ZSKINS), shirt: r(ZCLOTH), pants: r(ZCLOTH), hair: r(['short', 'long', 'grey', 'fade']), hairColor: r([0x1a1410, 0x4a3a2a, 0x888880]), h: 0.92 + Math.random() * 0.15, zombie: true };
  if (base) { o.skin = 0x8a8f80; }
  const z = makePerson(o);
  if (gore) { box(z.torso, 0.08, 0.35, 0.125, 0.16, 0.2, 0.01, 0x5a0d0d); box(z.head, -0.05, 0.12, 0.132, 0.08, 0.1, 0.01, 0x4a0808); }
  return z;
}

// ---------- World ----------
export function buildWorld(scene) {
  const W = { colliders: [], interactables: {}, lights: { interior: [], street: [], windows: [] }, refs: {} };
  const col = (x, z, w, d) => W.colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
  const solid = (x, y, z, w, h, d, c, e) => { const m = box(scene, x, y, z, w, h, d, c, e); col(x, z, w, d); return m; };
  // ground
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 120), mat(0x3d4a35)); ground.rotation.x = -Math.PI / 2; ground.position.set(60, 0, -20); scene.add(ground);
  box(scene, 70, 0.01, 0, 160, 0.02, 7, 0x2a2c2e); // road
  for (let x = -10; x < 148; x += 6) box(scene, x, 0.025, 0, 2.5, 0.01, 0.15, 0x9a9470);
  box(scene, 70, 0.06, -5, 160, 0.12, 3, 0x6a6a66); box(scene, 70, 0.06, 5, 160, 0.12, 3, 0x6a6a66);
  // water + bridge
  const water = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), mat(0x18242a)); water.rotation.x = -Math.PI / 2; water.position.set(300, -2, 0); scene.add(water);
  box(scene, 147, -1, 0, 4, 2.2, 200, 0x3d4a35); // shore edge
  box(scene, 195, -0.25, 0, 100, 0.5, 8, 0x55585a); // deck
  for (let x = 147; x < 245; x += 4) { box(scene, x, 0.6, -4, 0.2, 1.2, 0.2, 0x7a7d80); box(scene, x, 0.6, 4, 0.2, 1.2, 0.2, 0x7a7d80); }
  box(scene, 195, 1.15, -4, 100, 0.12, 0.15, 0x8a8d90); box(scene, 195, 1.15, 4, 100, 0.12, 0.15, 0x8a8d90);
  col(195, -4.2, 100, 0.4); col(195, 4.2, 100, 0.4);
  for (let x = 160; x < 240; x += 25) { box(scene, x, -6, -3, 1.5, 12, 1.5, 0x4a4d50); box(scene, x, -6, 3, 1.5, 12, 1.5, 0x4a4d50); box(scene, x, 5, 0, 1, 1, 8, 0x4a4d50); box(scene, x, 2.5, -3.6, 0.8, 5, 0.8, 0x4a4d50); box(scene, x, 2.5, 3.6, 0.8, 5, 0.8, 0x4a4d50); }
  // sandbag checkpoint
  for (let row = 0; row < 3; row++) for (let i = -3.6; i <= 3.6; i += 0.6) { if (Math.abs(i) < 1.2 && row < 3) continue; box(scene, 152 + (row % 2) * 0.05, 0.15 + row * 0.27, i + (row % 2) * 0.3, 0.55, 0.28, 0.55, 0x8a7d5a); }
  col(152, -2.6, 0.8, 2.8); col(152, 2.6, 0.8, 2.8);
  box(scene, 156, 1, 2.5, 4, 2, 2.2, 0x3e4a32); box(scene, 154, 0.8, 2.5, 1.2, 1.6, 2.2, 0x35402a); col(156, 2.5, 5, 2.4);
  sign(scene, 151.4, 1.3, -2.6, 1.6, 0.6, ['CHECKPOINT', ['STATE OF EMERGENCY', 'bold 34px sans-serif']], { bg: '#d8c23a', fg: '#111', font: 'bold 54px sans-serif' }, -Math.PI / 2);
  const flood = []; for (const z of [-3.4, 3.4]) { const p = new THREE.Group(); p.position.set(153, 0, z); scene.add(p); box(p, 0, 1.2, 0, 0.1, 2.4, 0.1, 0x333); const lamp = box(p, 0, 2.5, 0, 0.5, 0.4, 0.3, 0xffffff, 0xffffff); const sl = new THREE.SpotLight(0xe8f0ff, 0, 40, 0.5, 0.5, 1.2); sl.position.set(153, 2.5, z); sl.target.position.set(140, 0, 0); scene.add(sl, sl.target); flood.push({ sl, lamp }); }
  W.refs.flood = flood;
  // ---- Hart house (enterable) ----
  const HX = 0, HZ = -14, wc = 0xd9d2c2, wall = (x, z, w, d) => solid(x, 1.4, z, w, 2.8, d, wc);
  box(scene, HX, 0.05, HZ, 14, 0.1, 10, 0x6b5440);
  wall(HX, HZ - 5, 14, 0.2); wall(HX - 7, HZ, 0.2, 10); wall(HX + 7, HZ, 0.2, 10);
  wall(HX - 4.25, HZ + 5, 5.5, 0.2); wall(HX + 4.25, HZ + 5, 5.5, 0.2); box(scene, HX, 2.5, HZ + 5, 3, 0.6, 0.2, wc);
  wall(HX - 1, HZ - 3.5, 0.2, 3); wall(HX - 1, HZ + 3.5, 0.2, 3); box(scene, HX - 1, 2.5, HZ, 0.2, 0.6, 4, wc);
  box(scene, HX, 2.85, HZ, 14.4, 0.1, 10.4, 0x5a5048);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(10.5, 2.6, 4, 1), mat(0x3a3330)); roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 0.72); roof.position.set(HX, 4.2, HZ); scene.add(roof);
  // ext siding colour
  box(scene, HX, 1.4, HZ - 5.12, 14.2, 2.8, 0.05, 0x6a7a74); box(scene, HX - 7.12, 1.4, HZ, 0.05, 2.8, 10.2, 0x6a7a74); box(scene, HX + 7.12, 1.4, HZ, 0.05, 2.8, 10.2, 0x6a7a74);
  box(scene, HX - 4.25, 1.4, HZ + 5.12, 5.5, 2.8, 0.05, 0x6a7a74); box(scene, HX + 4.25, 1.4, HZ + 5.12, 5.5, 2.8, 0.05, 0x6a7a74);
  W.lights.windows.push(box(scene, HX - 4, 1.6, HZ + 5.16, 1.4, 1, 0.04, 0x223038), box(scene, HX + 4, 1.6, HZ + 5.16, 1.4, 1, 0.04, 0x223038));
  sign(scene, HX + 1.9, 2.1, HZ + 5.2, 0.8, 0.3, ['THE HARTS'], { bg: '#2f4a3a', fg: '#e8e2d0', font: 'bold 70px Georgia' });
  // bedroom
  solid(HX - 5.6, 0.3, HZ - 3.2, 2.2, 0.6, 3, 0x7a5c44); box(scene, HX - 5.6, 0.62, HZ - 3.2, 2, 0.12, 2.8, 0x2f7d4a); box(scene, HX - 5.6, 0.7, HZ - 4.3, 1.4, 0.15, 0.5, 0xe8e2d0);
  solid(HX - 2.2, 0.4, HZ - 4.4, 1.6, 0.8, 0.8, 0x6a5038);
  const sketch = box(scene, HX - 2.3, 0.83, HZ - 4.3, 0.4, 0.04, 0.3, 0x3dff7a); W.refs.sketch = sketch;
  solid(HX - 6.4, 0.3, HZ - 0.6, 0.6, 0.6, 0.6, 0x6a5038); W.refs.flashlight = box(scene, HX - 6.4, 0.65, HZ - 0.6, 0.25, 0.08, 0.08, 0x222222);
  sign(scene, HX - 6.88, 1.7, HZ - 2, 1.2, 1.6, ['BRIDGES', ['of the', 'italic 40px Georgia'], 'WORLD'], { bg: '#20352a', fg: '#9fe8b4', w: 256, h: 340, font: 'bold 46px Georgia' }, Math.PI / 2);
  const bedLight = new THREE.PointLight(0xffd9a8, 6, 9, 1.6); bedLight.position.set(HX - 4, 2.4, HZ - 1); scene.add(bedLight);
  // kitchen
  solid(HX + 3, 0.4, HZ - 1.5, 2.4, 0.08, 1.4, 0x7a5c44); box(scene, HX + 3, 0.2, HZ - 1.5, 2.2, 0.4, 1.2, 0x5a4434);
  solid(HX + 4.5, 0.45, HZ - 4.4, 4.5, 0.9, 0.8, 0xc8c0b0); box(scene, HX + 6.4, 1, HZ - 4.4, 0.8, 2, 0.8, 0xdcdcd8);
  const radio = box(scene, HX + 3.4, 1, HZ - 4.5, 0.45, 0.25, 0.18, 0x5a3a2a); W.refs.radio = radio;
  box(scene, HX + 5.2, 0.92, HZ - 4.4, 0.7, 0.04, 0.6, 0x222);
  const kitLight = new THREE.PointLight(0xffd9a8, 7, 10, 1.6); kitLight.position.set(HX + 3, 2.4, HZ - 2); scene.add(kitLight);
  W.lights.interior.push(bedLight, kitLight);
  W.refs.ball = box(scene, HX + 6.2, 0.15, HZ + 7.2, 0.28, 0.18, 0.18, 0x7a4a2a);
  // hedges/fences
  for (let x = -30; x < 40; x += 1.2) if (Math.abs(x) > 2) box(scene, x, 0.5, -7.2, 1.15, 1, 0.6, 0x2c4a2a);
  // ---- simple houses ----
  const house = (x, z, color, roofC, name) => {
    solid(x, 1.4, z, 10, 2.8, 8, color); const r = new THREE.Mesh(new THREE.ConeGeometry(7.6, 2.4, 4), mat(roofC)); r.rotation.y = Math.PI / 4; r.scale.set(1, 1, 0.8); r.position.set(x, 4, z); scene.add(r);
    box(scene, x, 1, z + 4.02, 1, 2, 0.05, 0x4a3a2a); W.lights.windows.push(box(scene, x - 3, 1.6, z + 4.02, 1.3, 1, 0.04, 0x223038), box(scene, x + 3, 1.6, z + 4.02, 1.3, 1, 0.04, 0x223038));
    box(scene, x, 0.15, z + 5, 4, 0.3, 2, 0x6a5a48);
  };
  house(20, -14, 0x8a8470, 0x433a34); house(-20, -14, 0x7a8a90, 0x3a3a40); house(-20, 16, 0x9a8a78, 0x403530); house(20, 16, 0x707a68, 0x3a3330); house(0, 16, 0x8a7a6a, 0x3a3330);
  for (let i = 0; i < 4; i++) box(scene, 15 + i * 0.6, 0.5, -8, 0.15, 1, 0.15, 0x3a5a2a);
  for (let i = 0; i < 4; i++) box(scene, 15 + i * 0.6, 0.9, -8, 0.12, 0.12, 0.12, 0xa83a2a);
  // ---- Main street ----
  sign(scene, 40, 1.8, 7.5, 3.6, 1.6, [['Welcome to', 'italic 40px Georgia'], 'LONE KEEM', ['MAINE · EST. 1791', 'bold 34px Georgia']], { bg: '#203a2a', fg: '#e8e2d0', border: '#c9b98a' }, -0.3);
  box(scene, 38.6, 0.6, 7.9, 0.12, 1.2, 0.12, 0x4a3a2a); box(scene, 41.4, 0.6, 7.1, 0.12, 1.2, 0.12, 0x4a3a2a);
  const shops = [[52, 'HARBOR HARDWARE', 0x6a5a4a], [80, 'PINE PHARMACY', 0x5a6a62], [93, 'POST OFFICE', 0x7a6a5a], [126, 'BAIT & TACKLE', 0x5a5248]];
  shops.forEach(([x, n, c]) => { solid(x, 2, -13, 10, 4, 8, c); sign(scene, x, 3.2, -8.94, 6, 0.8, [n], { bg: '#1c2a22', fg: '#d8e8d0', w: 768, h: 128, font: 'bold 64px Georgia' }); W.lights.windows.push(box(scene, x, 1.3, -8.97, 6, 1.6, 0.04, 0x223038)); });
  [[55, 0x5a5a5a], [72, 0x6a5040], [90, 0x4a5a5a], [108, 0x605548], [125, 0x4a4a52]].forEach(([x, c]) => solid(x, 2.5, 13, 10, 5, 8, c));
  // diner (enterable)
  const DX = 66, DZ = -14, dc = 0xb8b0a0;
  solid(DX, 1.5, DZ - 4, 10, 3, 0.2, dc); solid(DX - 5, 1.5, DZ, 0.2, 3, 8, dc); solid(DX + 5, 1.5, DZ, 0.2, 3, 8, dc);
  solid(DX - 3.25, 1.5, DZ + 4, 3.5, 3, 0.2, dc); solid(DX + 3.25, 1.5, DZ + 4, 3.5, 3, 0.2, dc); box(scene, DX, 2.6, DZ + 4, 3, 0.8, 0.2, dc);
  box(scene, DX, 3.05, DZ, 10.4, 0.1, 8.4, 0x4a4a48); box(scene, DX, 0.03, DZ, 10, 0.06, 8, 0x8a3a3a);
  sign(scene, DX, 3.6, DZ + 4.15, 7, 1, ['LIGHTHOUSE DINER'], { bg: '#102018', fg: '#3dff7a', w: 1024, h: 140, font: 'bold 92px Georgia' });
  solid(DX, 0.55, DZ - 2, 7, 1.1, 0.7, 0x6a3a2a); for (let i = -3; i <= 3; i += 1.2) box(scene, DX + i, 0.4, DZ - 1.2, 0.4, 0.8, 0.4, 0x3dff7a);
  W.refs.dinerRadio = box(scene, DX + 3, 1.25, DZ - 2, 0.4, 0.25, 0.18, 0x3a3a3a);
  solid(DX - 3.5, 0.4, DZ + 2, 1.4, 0.8, 1, 0x6a3a2a); solid(DX + 3.5, 0.4, DZ + 2, 1.4, 0.8, 1, 0x6a3a2a);
  const dl = new THREE.PointLight(0xffe0b0, 7, 12, 1.5); dl.position.set(DX, 2.6, DZ); scene.add(dl); W.lights.interior.push(dl);
  // Hart's Auto
  const AX = 110, AZ = -14;
  solid(AX, 2.2, AZ - 5, 12, 4.4, 0.2, 0x6a6a68); solid(AX - 6, 2.2, AZ, 0.2, 4.4, 10, 0x6a6a68); solid(AX + 6, 2.2, AZ, 0.2, 4.4, 10, 0x6a6a68);
  box(scene, AX, 4.45, AZ, 12.4, 0.1, 10.4, 0x3a3a3a); solid(AX - 5, 2.2, AZ + 5, 2, 4.4, 0.2, 0x6a6a68); solid(AX + 5, 2.2, AZ + 5, 2, 4.4, 0.2, 0x6a6a68);
  sign(scene, AX, 3.8, AZ + 5.15, 7, 1, ["HART'S AUTO"], { bg: '#e8e2d0', fg: '#1f6a3a', w: 1024, h: 140, font: 'bold 100px Georgia' });
  const gdoor = box(scene, AX, 3.9, AZ + 5, 8, 0.8, 0.1, 0x8a8a88); W.refs.gdoor = gdoor;
  const truck = new THREE.Group(); truck.position.set(AX - 1.5, 0, AZ - 1); scene.add(truck);
  box(truck, 0, 0.8, 0, 2, 1, 4.5, 0x2f5a3a); box(truck, 0, 1.6, -0.6, 1.9, 0.8, 1.8, 0x2f5a3a); box(truck, 0, 1.6, 0.31, 1.8, 0.6, 0.02, 0x223038);
  [[-1, 1.4], [1, 1.4], [-1, -1.4], [1, -1.4]].forEach(([x, z]) => box(truck, x, 0.35, z, 0.3, 0.7, 0.7, 0x111111));
  col(AX - 1.5, AZ - 1, 2.2, 4.7);
  const gl = new THREE.PointLight(0xc8d8ff, 4, 12, 1.5); gl.position.set(AX, 3.8, AZ); scene.add(gl); W.lights.interior.push(gl);
  // mom's car
  const car = new THREE.Group(); scene.add(car); car.visible = false; W.refs.momCar = car;
  box(car, 0, 0.6, 0, 1.8, 0.7, 4, 0x8a9aa8); box(car, 0, 1.15, -0.2, 1.6, 0.5, 2, 0x8a9aa8); box(car, 0, 1.15, 0.81, 1.5, 0.45, 0.02, 0x223038);
  const hl = new THREE.SpotLight(0xfff4d0, 30, 30, 0.6, 0.5, 1.5); hl.position.set(0, 0.7, 2); hl.target.position.set(0, 0, 10); car.add(hl, hl.target);
  box(car, -0.6, 0.6, 2.01, 0.3, 0.15, 0.02, 0xffffff, 0xffffff); box(car, 0.6, 0.6, 2.01, 0.3, 0.15, 0.02, 0xffffff, 0xffffff);
  // parked cars + streetlights
  const cc = [0x5a2a2a, 0x2a3a5a, 0x4a4a4a, 0x6a6a5a, 0x2a4a3a];
  [[30, 2.5], [58, -2.6], [75, 2.5], [98, -2.6], [118, 2.5], [-12, 2.5], [135, -2.6]].forEach(([x, z], i) => { box(scene, x, 0.6, z, 4, 0.8, 1.8, cc[i % 5]); box(scene, x - 0.2, 1.2, z, 2, 0.5, 1.6, cc[i % 5]); col(x, z, 4, 1.8); });
  for (let x = -20; x < 150; x += 22) { box(scene, x, 2.2, 6.2, 0.12, 4.4, 0.12, 0x2a2a2a); box(scene, x, 4.4, 5.6, 0.12, 0.12, 1.2, 0x2a2a2a); W.lights.street.push(box(scene, x, 4.3, 5.1, 0.4, 0.12, 0.3, 0x555555)); }
  // trees (instanced)
  const trunks = [], tops = [];
  const rnd = (a, b) => a + Math.random() * (b - a);
  for (let i = 0; i < 160; i++) { const x = rnd(-60, 145), z = Math.random() < 0.5 ? rnd(-55, -22) : rnd(22, 60); trunks.push([x, z]); }
  for (let i = 0; i < 20; i++) trunks.push([rnd(-50, -30), rnd(-20, 20)]);
  const tg = new THREE.CylinderGeometry(0.15, 0.25, 2, 5), cg = new THREE.ConeGeometry(1.6, 5, 6);
  const ti = new THREE.InstancedMesh(tg, mat(0x3a2a20), trunks.length), ci = new THREE.InstancedMesh(cg, mat(0x1f3a2a), trunks.length);
  const m4 = new THREE.Matrix4(); trunks.forEach(([x, z], i) => { const s = rnd(0.8, 1.6); m4.makeScale(s, s, s).setPosition(x, s, z); ti.setMatrixAt(i, m4); m4.makeScale(s, s, s).setPosition(x, 2 + 2.5 * s, z); ci.setMatrixAt(i, m4); });
  scene.add(ti, ci);
  // world bounds
  col(60, -24, 260, 1); col(60, 21, 260, 1); col(-32, 0, 1, 50); col(246, 0, 1, 10);
  col(147, -13, 2, 18); col(147, 13, 2, 18);
  return W;
}
