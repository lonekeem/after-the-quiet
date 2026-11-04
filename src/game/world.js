import * as THREE from 'three';
import { signTex, grassBladeTex, rnd, canvasTex } from './util.js';

// Riverside, Maine — procedural night town built from CC0 Poly Haven PBR textures.
export function buildWorld(scene, Q, texLoader, base, CM = {}) {
  const colliders = [], walls = [], updaters = [], lights = [];
  const T = (n, rep = 1, srgb = true) => { const t = texLoader.load(base + 'tex/' + n + '.jpg'); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = Q.aniso; return t; };
  const pbr = (n, rep, o = {}) => { const m = new THREE.MeshStandardMaterial(Object.assign({ map: T(n + '_diff', rep), roughness: 1 }, o));
    if (Q.normals) { m.normalMap = T(n + '_nor_gl', rep, false); m.normalScale = new THREE.Vector2(o.ns || 1, o.ns || 1); }
    if (o.rough) m.roughnessMap = T(n + '_rough', rep, false); return m; };
  const box = (x0, x1, z0, z1) => colliders.push({ x0, x1, z0, z1 });

  // ground
  const groundMat = pbr('forrest_ground_01', 70, { color: '#9aa58e' });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(420, 420), groundMat); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const mudMat = pbr('brown_mud_02', 4, { color: '#8a8070', transparent: true, alphaMap: canvasTex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 10, 64, 64, 64); gr.addColorStop(0, '#fff'); gr.addColorStop(1, '#000'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, false), depthWrite: false, roughness: .55 });
  const mud = []; for (let i = 0; i < 26; i++) { const s = rnd(5, 14); const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), mudMat); m.rotation.x = -Math.PI / 2; m.rotation.z = rnd(0, 6); m.position.set(rnd(-8, 8) + (Math.random() < .5 ? -12 : 12), 0.012, rnd(-140, 60)); m.receiveShadow = true; scene.add(m); mud.push([m.position.x, m.position.z, (s * .4) ** 2]); }

  // roads (wet asphalt)
  const roadMat = (rx, rz) => { const m = pbr('asphalt_02', 1, { rough: true, color: '#6c6f6c', roughness: 0.55, envMapIntensity: 1.4 }); m.map.repeat.set(rx, rz); if (m.normalMap) m.normalMap.repeat.set(rx, rz); m.roughnessMap.repeat.set(rx, rz); return m; };
  const road = (cx, cz, w, d) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), roadMat(w / 6, d / 6)); m.rotation.x = -Math.PI / 2; m.position.set(cx, 0.02, cz); m.receiveShadow = true; scene.add(m); };
  road(0, -45, 11, 220); road(0, 4, 90, 9);
  const lineMat = new THREE.MeshBasicMaterial({ color: '#a89a52', transparent: true, opacity: .55 });
  for (let z = 60; z > -150; z -= 6) { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 2.6), lineMat); l.rotation.x = -Math.PI / 2; l.position.set(0, 0.025, z); scene.add(l); }
  // sidewalks
  const swMat = new THREE.MeshStandardMaterial({ color: '#4d4f4b', roughness: .8 });
  [-6.6, 6.6].forEach(x => { const s = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 200), swMat); s.position.set(x, 0.06, -42); s.receiveShadow = true; scene.add(s); });
  // puddles
  const pudMat = new THREE.MeshStandardMaterial({ color: '#0b0d0c', roughness: 0.04, metalness: 0.2, envMapIntensity: 2.2 });
  for (let i = 0; i < 30; i++) { const p = new THREE.Mesh(new THREE.CircleGeometry(rnd(0.6, 2.2), 20), pudMat); p.scale.y = rnd(0.5, 1); p.rotation.x = -Math.PI / 2; p.position.set(rnd(-5, 5), 0.03, rnd(-140, 55)); scene.add(p); }

  // houses
  const sidingCols = ['#b8b5a8', '#8c9aa0', '#9b8a76', '#7d8a77', '#a49c8e', '#6e6a68'];
  const plankMat = (c) => pbr('weathered_planks', 1, { color: c, roughness: .9 });
  const roofMat = pbr('asphalt_02', 3, { color: '#3a3532', roughness: .9 });
  const boardMat = pbr('weathered_planks', 1, { color: '#7a6248' });
  const winDark = new THREE.MeshStandardMaterial({ color: '#0a0c0c', roughness: .1, metalness: .4, envMapIntensity: 1.2 });
  const winLit = new THREE.MeshStandardMaterial({ color: '#221a10', emissive: '#ff9a40', emissiveIntensity: .7 });
  const wallBox = (w, h, d, mat, x, y, z, solid = true) => { const geo = new THREE.BoxGeometry(w, h, d); const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * Math.max(w, d) / 2.5, uv.getY(i) * h / 2.5);
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; scene.add(m); if (solid) { box(x - w / 2, x + w / 2, z - d / 2, z + d / 2); walls.push(m); } return m; };
  const gable = (cx, cz, w, d, y, alongZ, mat) => { const s = new THREE.Shape(); const span = alongZ ? w : d; s.moveTo(-span / 2 - .4, 0); s.lineTo(span / 2 + .4, 0); s.lineTo(0, span * .42); s.lineTo(-span / 2 - .4, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: (alongZ ? d : w) + .6, bevelEnabled: false }); g.translate(0, 0, -((alongZ ? d : w) + .6) / 2); const m = new THREE.Mesh(g, mat); m.position.set(cx, y, cz); if (!alongZ) m.rotation.y = Math.PI / 2; m.castShadow = true; m.receiveShadow = true; scene.add(m); return m; };
  const boards = (x, y, z, along, n = 4, wid = 1.6) => { for (let i = 0; i < n; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(along === 'z' ? 0.06 : wid, 0.16, along === 'z' ? wid : 0.06), boardMat); b.position.set(x, y - 0.45 + i * 0.3, z); b.rotation[along === 'z' ? 'x' : 'z'] = rnd(-.15, .15); b.castShadow = true; scene.add(b); } };
  // generic house: face = direction of front door (+1 = facing +x, -1 = facing -x)
  function house(cx, cz, w, d, face, col, lit = false, board = true) {
    const h = 3.0, mat = plankMat(col); wallBox(w, h, d, mat, cx, h / 2, cz); gable(cx, cz, w, d, h, false, roofMat);
    const fx = cx + face * (w / 2 + 0.03);
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.1, 1.1), new THREE.MeshStandardMaterial({ color: '#3a2c22', roughness: .8 })); door.position.set(fx, 1.05, cz); scene.add(door);
    [-1, 1].forEach(s => { const wz = cz + s * d * 0.3; const wm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.1, 1.3), lit && s > 0 ? winLit : winDark); wm.position.set(fx, 1.6, wz); scene.add(wm); if (board && Math.random() < .7) boards(fx + face * 0.05, 1.6, wz, 'z', 3, 1.5); });
    // porch
    const porch = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.25, d * 0.7), plankMat('#5c5048')); porch.position.set(fx + face * 0.9, 0.12, cz); porch.receiveShadow = true; scene.add(porch);
  }
  // --- Keem's house (enterable): center 16,40 · w 8 (x 12..20) · d 10 (z 35..45), front wall faces -x
  const KH = { x0: 12, x1: 20, z0: 35, z1: 45 }, kmat = plankMat('#9aa49c'), imat = plankMat('#b9ab92'), H = 2.9;
  wallBox(8, H, 0.2, kmat, 16, H / 2, 35); wallBox(8, H, 0.2, kmat, 16, H / 2, 45); wallBox(0.2, H, 10, kmat, 20, H / 2, 40);
  // west front wall with door gap z 36.2..37.4 and window gap z 41.8..43.2 (y .9..2)
  wallBox(0.2, H, 1.2, kmat, 12, H / 2, 35.6); wallBox(0.2, H, 4.4, kmat, 12, H / 2, 39.6); wallBox(0.2, H, 1.8, kmat, 12, H / 2, 44.1);
  wallBox(0.2, 0.8, 1.4, kmat, 12, 0.4, 42.5); wallBox(0.2, 0.9, 1.4, kmat, 12, 2.45, 42.5, false); wallBox(0.2, 0.8, 1.2, kmat, 12, 2.5, 36.8, false);
  boards(11.86, 1.45, 42.5, 'z', 4, 1.7); // boarded bedroom window (gaps to peek through)
  // interior partition z=39 with doorway x 15.6..16.6
  wallBox(3.6, H, 0.15, imat, 13.8, H / 2, 39); wallBox(3.4, H, 0.15, imat, 18.3, H / 2, 39);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(8, 10), new THREE.MeshStandardMaterial({ color: '#2a2622', side: THREE.DoubleSide })); ceil.rotation.x = Math.PI / 2; ceil.position.set(16, H, 40); scene.add(ceil);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 10), pbr('weathered_planks', 3, { color: '#6a5442' })); floor.rotation.x = -Math.PI / 2; floor.position.set(16, 0.03, 40); floor.receiveShadow = true; scene.add(floor);
  gable(16, 40, 8, 10, H, false, roofMat).position.y = H + 0.01;
  const frontDoor = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.1, 1.2), new THREE.MeshStandardMaterial({ color: '#3a2c22', roughness: .8 })); frontDoor.geometry.translate(0, 0, 0.6); frontDoor.position.set(12, 1.05, 36.2); scene.add(frontDoor);
  const doorCol = { x0: 11.9, x1: 12.1, z0: 36.2, z1: 37.4 }; colliders.push(doorCol); walls.push(frontDoor);
  boards(11.8, 1.3, 36.8, 'z', 2, 1.4); // plank across door (removed when opened)
  const doorBoards = scene.children.slice(-2);
  // furniture
  const bed = new THREE.Group(); const fr = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 2.1), new THREE.MeshStandardMaterial({ color: '#4a3526' })); fr.position.y = 0.22; bed.add(fr);
  const mat2 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.18, 2.0), new THREE.MeshStandardMaterial({ color: '#2d3d55', roughness: 1 })); mat2.position.y = 0.52; bed.add(mat2);
  const pil = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.35), new THREE.MeshStandardMaterial({ color: '#c8c2b5' })); pil.position.set(0, 0.66, 0.78); bed.add(pil);
  bed.position.set(18.9, 0, 42.6); bed.traverse(o => { o.castShadow = o.receiveShadow = !!o.isMesh; }); scene.add(bed); box(18.3, 19.5, 41.55, 43.65);
  const desk = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.75, 1.2), new THREE.MeshStandardMaterial({ color: '#5a4030' })); desk.position.set(19.6, 0.37, 40); desk.castShadow = true; scene.add(desk); box(19.3, 19.9, 39.4, 40.6);
  const lamp = new THREE.PointLight('#ffb070', 1.4, 7, 2); lamp.position.set(19.5, 1.2, 40.2); scene.add(lamp); lights.push(lamp);
  const lampM = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffc080' })); lampM.position.copy(lamp.position); scene.add(lampM);
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.1), new THREE.MeshStandardMaterial({ map: signTex(['ZOMBIE', 'KING III', 'in theaters'], '#2a0a0a', '#e44', 256, 352) })); poster.position.set(19.88, 1.6, 43.5); poster.rotation.y = -Math.PI / 2; scene.add(poster);
  updaters.push((dt, t) => { lamp.intensity = 1.2 + Math.sin(t * 13) * 0.05 + (Math.random() < .02 ? -0.8 : 0); });

  // neighborhood houses
  const hs = [[16, 20], [16, 0 + 12], [16, -12], [16, 56], [-16, 40], [-16, 20], [-16, -12], [-16, 56], [-30, 40], [30, 26], [30, -14], [-30, -14], [-30, 20]];
  hs.forEach(([x, z], i) => house(x, z, 8, 9, x > 0 ? -1 : 1, sidingCols[i % sidingCols.length], i % 4 === 1, i % 3 !== 0));
  // Pell house is (-16,20) facing +x
  // market
  const mk = { x: -19, z: -32 }; wallBox(12, 4, 14, plankMat('#8a7f70'), mk.x, 2, mk.z); const mroof = new THREE.Mesh(new THREE.BoxGeometry(12.6, .3, 14.6), roofMat); mroof.position.set(mk.x, 4.1, mk.z); scene.add(mroof);
  const shop = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.2, 8), winLit.clone()); shop.material.emissiveIntensity = .25; shop.position.set(mk.x + 6.04, 1.4, mk.z); scene.add(shop);
  sign(['RIVERSIDE MARKET', 'Groceries · Bait · Coffee'], mk.x + 6.1, 3.3, mk.z, Math.PI / 2, 5, 1.2);
  // police station
  wallBox(10, 3.6, 10, plankMat('#6b7078'), -19, 1.8, -54); sign(['RIVERSIDE PD'], -13.9, 3, -54, Math.PI / 2, 4, 0.9, '#13233a');
  // gas station (Hank's)
  const gs = { x: 17, z: -52 }; wallBox(9, 3.4, 8, plankMat('#a39a86'), gs.x + 5, 1.7, gs.z - 6); sign(['HANK\'S GAS & GARAGE'], gs.x + 0.4, 3, gs.z - 6, -Math.PI / 2, 5, 0.9, '#5a1a12');
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(8, 0.4, 10), new THREE.MeshStandardMaterial({ color: '#c9c2b0', roughness: .7 })); canopy.position.set(gs.x - 2, 4.4, gs.z + 4); canopy.castShadow = true; scene.add(canopy);
  [[-5.5, 0], [1.5, 0], [-5.5, 8], [1.5, 8]].forEach(([dx, dz]) => { const p = new THREE.Mesh(new THREE.BoxGeometry(.3, 4.4, .3), swMat); p.position.set(gs.x + dx + 0.5, 2.2, gs.z + dz); scene.add(p); box(gs.x + dx + .35, gs.x + dx + .65, gs.z + dz - .15, gs.z + dz + .15); });
  [0, 4].forEach(dz => { const pm = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.5, 0.9), new THREE.MeshStandardMaterial({ color: '#8a2a20' })); pm.position.set(gs.x - 2, 0.75, gs.z + 2 + dz); pm.castShadow = true; scene.add(pm); box(gs.x - 2.3, gs.x - 1.7, gs.z + 1.55 + dz, gs.z + 2.45 + dz); });
  const canLight = new THREE.PointLight('#e8f0ff', 6, 18, 2); canLight.position.set(gs.x - 2, 4, gs.z + 4); scene.add(canLight); lights.push(canLight);
  updaters.push((dt, t) => { canLight.intensity = Math.random() < 0.04 ? 0.5 : 6; });
  // fuel tanker
  const tanker = new THREE.Group(); const tk = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 7, 18), pbr('rust_coarse_01', 2, { color: '#d8d0c4', metalness: .6, roughness: .5 })); tk.rotation.x = Math.PI / 2; tk.position.y = 1.9; tanker.add(tk);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 2.2), new THREE.MeshStandardMaterial({ color: '#7a1d16', metalness: .4, roughness: .5 })); cab.position.set(0, 1.5, 4.7); tanker.add(cab);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1), new THREE.MeshStandardMaterial({ map: signTex(['FLAMMABLE', '1203'], '#b01810', '#fff', 256, 96), emissiveMap: null })); fl.position.set(1.22, 1.9, 0); fl.rotation.y = Math.PI / 2; tanker.add(fl);
  tanker.position.set(gs.x - 9, 0, gs.z + 1); tanker.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(tanker); const tankCol = { x0: gs.x - 10.2, x1: gs.x - 7.8, z0: gs.z - 2.5, z1: gs.z + 7 }; colliders.push(tankCol);

  // cars
  const rust = pbr('rust_coarse_01', 1, { roughness: .8, metalness: .5 });
  // v1.4: real CC0 Kenney Car Kit models (tinted, rusted, burnt or wrecked variants); boxes only as a fallback
  const KINDS = ['sedan', 'suv', 'truck', 'police', 'van', 'taxi', 'hatchback-sports', 'suv-luxury', 'ambulance']; let kn = 0; const mcache = {};
  const lenOf = {}; const tmpB = new THREE.Box3();
  function carMat(src, key, f) { const k = src.uuid + key; if (!mcache[k]) { const m = src.clone(); f(m); mcache[k] = m; } return mcache[k]; }
  function car(x, z, rot, col, opt = {}) { const kind = opt.kind || (opt.truck ? 'truck' : KINDS[kn++ % KINDS.length]); const src = CM[kind]; if (!src) return boxCar(x, z, rot, col, opt);
    const g = new THREE.Group(); const m = src.clone(true); if (!lenOf[kind]) { tmpB.setFromObject(src); lenOf[kind] = tmpB.max.z - tmpB.min.z; }
    const L = opt.truck ? 5.2 : kind === 'van' || kind === 'ambulance' ? 5 : kind === 'hatchback-sports' ? 4 : 4.5; m.scale.set(1.27, 1.27, L / lenOf[kind]); g.add(m);
    const v = opt.burnt ? 'burnt' : opt.rust ? 'rust' : 'ok'; const tint = new THREE.Color(col).lerp(new THREE.Color('#ffffff'), .35);
    m.traverse(o => { if (!o.isMesh) return; o.castShadow = true; o.receiveShadow = true;
      o.material = carMat(o.material, v + (kind === 'police' || kind === 'taxi' || kind === 'ambulance' ? '' : col), mm => { mm.roughness = .5; mm.metalness = .25;
        if (kind !== 'police' && kind !== 'taxi' && kind !== 'ambulance') mm.color.copy(tint); if (v === 'burnt') { mm.color.set('#2c2824'); mm.roughness = 1; mm.metalness = 0; }
        if (v === 'rust') { mm.color.lerp(new THREE.Color('#7a4a2a'), .45); mm.roughness = .9; } if (opt.dirt) mm.color.multiplyScalar(.75); }); });
    if (opt.wreck || opt.burnt) { const wn = ['wheel-front-left', 'wheel-back-right'][(x * 7 + z) & 1]; const w = m.getObjectByName(wn); if (w) w.visible = false; g.rotation.z = (wn.includes('left') ? 1 : -1) * .07; g.rotation.x = .03;
      if (CM['debris-tire']) { const t = CM['debris-tire'].clone(true); t.scale.setScalar(1.27); t.position.set(1.6, .2, (z % 2) - .5); t.rotation.set(0, .8, 1.4); g.add(t); }
      if (opt.wreck && CM['debris-door']) { const d = CM['debris-door'].clone(true); d.scale.setScalar(1.27); d.position.set(-1.5, 0, .4); d.rotation.set(0, .4, -1.45); g.add(d); }
      if (opt.wreck && CM['debris-bumper']) { const d = CM['debris-bumper'].clone(true); d.scale.setScalar(1.27); d.position.set(.2, 0, L / 2 + .7); d.rotation.y = .5; g.add(d); } }
    // head + tail lights (lit only on the truck / a running car)
    const hl = new THREE.MeshStandardMaterial({ color: '#555', emissive: opt.lights ? '#fff3d0' : '#000', emissiveIntensity: 2.2 }), tl = new THREE.MeshStandardMaterial({ color: '#3a0808', emissive: opt.lights ? '#ff2010' : '#200000', emissiveIntensity: 1.2 });
    [-.6, .6].forEach(hx => { const h = new THREE.Mesh(new THREE.BoxGeometry(.3, .13, .04), hl); h.position.set(hx, .78, L / 2 + .02); g.add(h); const t = new THREE.Mesh(new THREE.BoxGeometry(.28, .1, .04), tl); t.position.set(hx, .85, -L / 2 - .02); g.add(t); });
    g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
    if (!opt.nocol) { const along = Math.abs(Math.sin(rot)) > .7; const hw = along ? L / 2 : 1, hd = along ? 1 : L / 2; const cc = { x0: x - hw, x1: x + hw, z0: z - hd, z1: z + hd, car: g }; colliders.push(cc); g.userData.col = cc; }
    if (opt.burnt) fire(x, 1.3, z, 0.8);
    return g; }
  function boxCar(x, z, rot, col, opt = {}) { const g = new THREE.Group(); const paint = new THREE.MeshStandardMaterial({ color: col, metalness: .5, roughness: opt.burnt ? 1 : .45, map: rust.map, normalMap: rust.normalMap });
    if (opt.burnt) paint.color.set('#2a2622');
    const L = opt.truck ? 5.4 : 4.4; const b = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.75, L), paint); b.position.y = 0.75; g.add(b);
    const c = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.65, opt.truck ? 1.9 : 2.2), new THREE.MeshStandardMaterial({ color: opt.burnt ? '#151312' : '#0e1214', metalness: .6, roughness: .15, envMapIntensity: 1.5 })); c.position.set(0, 1.45, opt.truck ? 0.9 : -0.1); g.add(c);
    if (opt.truck) { const bed = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.5, 2.4), paint); bed.position.set(0, 1.35, -1.4); g.add(bed); }
    const wm = new THREE.MeshStandardMaterial({ color: '#111', roughness: .9 }); [[-.95, 1.4], [.95, 1.4], [-.95, -1.4], [.95, -1.4]].forEach(([wx, wz]) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(.38, .38, .3, 14), wm); w.rotation.z = Math.PI / 2; w.position.set(wx, .38, wz * L / 4.4); g.add(w); });
    const hl = new THREE.MeshStandardMaterial({ color: '#333', emissive: opt.lights ? '#fff3d0' : '#000', emissiveIntensity: 2 }); [-.6, .6].forEach(hx => { const h = new THREE.Mesh(new THREE.BoxGeometry(.3, .15, .05), hl); h.position.set(hx, .85, L / 2 + .01); g.add(h); });
    g.position.set(x, 0, z); g.rotation.y = rot; g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); scene.add(g);
    if (!opt.nocol) { const along = Math.abs(Math.sin(rot)) > .7; const hw = along ? L / 2 : 1, hd = along ? 1 : L / 2; const cc = { x0: x - hw, x1: x + hw, z0: z - hd, z1: z + hd, car: g }; colliders.push(cc); g.userData.col = cc; }
    if (opt.burnt) fire(x, 1.3, z, 0.8);
    return g; }
  const cars = [[-4.2, 28, .1, '#5a6a72'], [4.4, 12, 3.1, '#7a6a4a'], [-3, -8, 1.4, '#3d4a3a', { burnt: 1 }], [4, -22, 3.3, '#6a2a22'], [-4.5, -44, .05, '#8a8a82', { wreck: 1, kind: 'police' }], [2, -72, 2.2, '#445566', { burnt: 1 }], [-3.5, -84, .4, '#5a5048', { rust: 1, wreck: 1 }], [24, 50, 0, '#384a3a', { rust: 1 }], [-24, 30, 1.57, '#6a6458', { dirt: 1 }], [9, 33, 1.57, '#2c3a4a'], [-9, -30, 0, '#d8d8d0', { lights: 1, kind: 'sedan' }],
    [5, 52, 2.9, '#c8c0a8', { kind: 'van', dirt: 1 }], [-4.6, 60, .2, '#2a4a8a', { kind: 'hatchback-sports', wreck: 1 }], [4.6, -56, 3.0, '#e8e8e0', { kind: 'ambulance', wreck: 1 }], [-5, -64, -.3, '#3a3a3a', { kind: 'suv-luxury', rust: 1 }]];
  cars.forEach(c => car(c[0], c[1], c[2], c[3], c[4] || {}));
  // barricade before the bridge
  const jb = new THREE.MeshStandardMaterial({ color: '#8c8a82', roughness: .9 });
  for (let x = -9; x <= 9; x += 2.2) { if (Math.abs(x) < 1.5) continue; const j = new THREE.Mesh(new THREE.BoxGeometry(2, 1, .6), jb); j.position.set(x, .5, -100); j.castShadow = true; scene.add(j); box(x - 1, x + 1, -100.3, -99.7); }
  car(-7, -97, 1.3, '#25303a', { nocol: 0 }); car(8, -96, 1.9, '#6a5a3a', { burnt: 1 });
  sign(['RIVERSIDE BRIDGE', 'Kennebec Crossing'], 7.5, 2.4, -105, 0, 3.6, 1);

  // river + bridge
  const water = new THREE.Mesh(new THREE.PlaneGeometry(420, 22), new THREE.MeshStandardMaterial({ color: '#10181a', roughness: .06, metalness: .3, envMapIntensity: 2 })); water.rotation.x = -Math.PI / 2; water.position.set(0, -0.6, -120); scene.add(water);
  const bank = new THREE.Mesh(new THREE.PlaneGeometry(420, 26), new THREE.MeshStandardMaterial({ color: '#000' })); bank.rotation.x = -Math.PI / 2; bank.position.set(0, -1.6, -120); scene.add(bank);
  ground.geometry.dispose(); ground.geometry = new THREE.PlaneGeometry(420, 420); // ground is hidden under the river by the water plane being lit; mask with river cut
  const cut = new THREE.Mesh(new THREE.BoxGeometry(420, 1.2, 21.5), new THREE.MeshStandardMaterial({ color: '#0c1210' })); cut.position.set(0, -0.62, -120); scene.add(cut); water.position.y = 0.02; cut.visible = false;
  box(-300, -5.4, -131, -109); box(5.4, 300, -131, -109);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(10, 0.5, 26), pbr('asphalt_02', 3, { color: '#555', roughness: .6 })); deck.position.set(0, 0.0, -120); deck.receiveShadow = true; deck.castShadow = true; scene.add(deck);
  for (let z = -132; z <= -108; z += 2) [-5, 5].forEach(x => { const p = new THREE.Mesh(new THREE.BoxGeometry(.15, 1.1, .15), rust); p.position.set(x, .8, z); scene.add(p); });
  [-5, 5].forEach(x => { const r = new THREE.Mesh(new THREE.BoxGeometry(.12, .12, 26), rust); r.position.set(x, 1.35, -120); scene.add(r); });
  road(0, -150, 11, 40);

  // signs
  function sign(lines, x, y, z, rot, w = 3, h = 1, bg) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: signTex(lines, bg), roughness: .8 })); m.position.set(x, y, z); m.rotation.y = rot; scene.add(m); return m; }
  const welcome = sign(['WELCOME TO RIVERSIDE', 'MAINE · Est. 1871', 'Pop. 4,012'], -8.5, 2.2, 58, Math.PI * 0.85, 3.6, 1.6);
  [[-8.6, 57.6], [-7.4, 58.2]].forEach(([x, z]) => { const p = new THREE.Mesh(new THREE.BoxGeometry(.12, 2.2, .12), new THREE.MeshStandardMaterial({ color: '#3a2a1a' })); p.position.set(x, 1.1, z); scene.add(p); });
  sign(['MAIN ST'], 7.4, 2.8, 8.4, -Math.PI / 2, 1.6, .4, '#1d4a2a'); sign(['BIRCH ST'], 7.4, 2.4, 8.4, 0, 1.6, .4, '#1d4a2a');
  const pp = new THREE.Mesh(new THREE.BoxGeometry(.1, 3, .1), swMat); pp.position.set(7.4, 1.5, 8.4); scene.add(pp);
  sign(['STAY INSIDE', 'BY ORDER OF RIVERSIDE PD'], -6.4, 1.3, 14, Math.PI / 2, 2.4, 1, '#3a1010');

  // street lamps
  const lampHead = new THREE.MeshStandardMaterial({ color: '#222', emissive: '#ffd59a', emissiveIntensity: 3 });
  const lampPos = [[-7.5, 46], [7.5, 26], [-7.5, 2], [7.5, -26], [-7.5, -48], [7.5, -76], [-7.5, -94]];
  lampPos.forEach(([x, z], i) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(.07, .1, 5.5, 8), swMat); p.position.set(x, 2.75, z); p.castShadow = true; scene.add(p);
    const h = new THREE.Mesh(new THREE.BoxGeometry(.5, .15, .3), lampHead); h.position.set(x + (x < 0 ? .4 : -.4), 5.5, z); scene.add(h);
    if (i < Q.lamps) { const L = new THREE.PointLight('#ffc98a', 9, 20, 2); L.position.set(h.position.x, 5.2, z); scene.add(L); lights.push(L); if (i === 3) updaters.push(() => { L.intensity = Math.random() < .08 ? 0 : 9; }); } });

  // fires
  function fire(x, y, z, s = 1) { const L = new THREE.PointLight('#ff7a2a', 7 * s, 14, 2); L.position.set(x, y + .8, z); scene.add(L); lights.push(L);
    const fm = new THREE.MeshBasicMaterial({ color: '#ff8a30', transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false });
    const fl = []; for (let i = 0; i < 5; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(.35 * s, 1.4 * s, 7), fm); c.position.set(x + rnd(-.6, .6) * s, y + .5, z + rnd(-.9, .9) * s); scene.add(c); fl.push(c); }
    updaters.push((dt, t) => { L.intensity = (6 + Math.sin(t * 17) * 1.5 + Math.random() * 2) * s; fl.forEach((c, i) => { c.scale.y = 0.7 + 0.4 * Math.abs(Math.sin(t * 6 + i)); c.scale.x = c.scale.z = 0.8 + 0.3 * Math.sin(t * 9 + i * 2); }); });
    return L; }

  // pines (instanced)
  const bark = pbr('bark_brown_02', 1, { color: '#8a7a6a' }); bark.map.repeat.set(1, 4);
  const trunkG = new THREE.CylinderGeometry(0.12, 0.28, 1, 7); trunkG.translate(0, 0.5, 0);
  const coneG = new THREE.ConeGeometry(1, 1, 9, 3, true); coneG.translate(0, 0.5, 0); { const p = coneG.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y < 0.9) { p.setX(i, p.getX(i) * rnd(.8, 1.15)); p.setZ(i, p.getZ(i) * rnd(.8, 1.15)); p.setY(i, y + rnd(-.08, .08)); } } coneG.computeVertexNormals(); }
  const needle = new THREE.MeshStandardMaterial({ color: '#1f2e22', roughness: 1, side: THREE.DoubleSide });
  // ===== CHAPTER 2 · HAVERFORD (south bank) =====
  const gS = new THREE.Mesh(new THREE.PlaneGeometry(420, 130), groundMat); gS.rotation.x = -Math.PI / 2; gS.position.set(0, -0.005, -270); gS.receiveShadow = true; scene.add(gS);
  road(0, -228, 11, 100); road(0, -200, 96, 9);
  // National Guard checkpoint
  const sand = new THREE.MeshStandardMaterial({ color: '#6e6450', roughness: 1 }), olive = new THREE.MeshStandardMaterial({ color: '#4a5236', roughness: .9 });
  [[-11, -3.2], [3.2, 11]].forEach(([a, b]) => wallBox(b - a, 1.1, 1, sand, (a + b) / 2, .55, -158));
  [[-15, -152, 6, 5], [15, -154, 6, 6]].forEach(([x, z, w, d]) => { wallBox(w, 2.2, d, olive, x, 1.1, z); gable(x, z, w, d, 2.2, false, olive); });
  car(-9, -164, 1.6, '#4a5a3a', { truck: 1, rust: 1 }); car(9, -166, -1.2, '#4a5a3a', { kind: 'suv', wreck: 1 });
  sign(['NATIONAL GUARD CHECKPOINT', 'HAVERFORD · CIVILIANS STOP HERE'], 6, 2.2, -157.4, 0, 3.6, 1, '#2a3a1a');
  sign(['WELCOME TO HAVERFORD', '"The Friendliest Little Town on the Kennebec"'], -8.5, 2.2, -140, 0, 3.8, 1.3);
  const flood = new THREE.PointLight('#e8f0ff', 14, 30, 2); flood.position.set(-12, 5, -160); if (Q.lamps > 3) { scene.add(flood); lights.push(flood); }
  fire(13, 0, -163, .8);
  // town
  const town = [[-14, -176, 7, 8, 1, '#7a6a5a'], [14, -178, 7, 9, -1, '#5a6a7a'], [-14, -188, 8, 8, 1, '#8a4a3a'], [14, -214, 8, 9, -1, '#c8a060'], [-14, -216, 7, 8, 1, '#6a7a5a'], [14, -230, 7, 8, -1, '#7a5a6a'], [-14, -232, 7, 9, 1, '#5a5a5a'], [-30, -190, 8, 8, 1, '#4a5a6a'], [30, -192, 8, 8, -1, '#7a7060'], [-30, -210, 8, 7, 1, '#6a5040'], [30, -210, 8, 8, -1, '#8a8a7a']];
  town.forEach(t => house(t[0], t[1], t[2], t[3], t[4], t[5], Math.random() < .3));
  sign(['HAVERFORD HARDWARE'], -10.3, 2.6, -188, Math.PI / 2, 3.2, .6, '#6a1a10');
  sign(['DOUGHNUT DEPOT', 'open 24/7 (lol)'], 9.9, 2.6, -214, -Math.PI / 2, 3.2, .8, '#c84a8a');
  sign(['SUDS-N-DUDS LAUNDROMAT'], -25.9, 2.6, -190, Math.PI / 2, 3.2, .6, '#1a4a6a');
  sign(['WATER ST'], 6, 2.6, -195.4, 0, 1.6, .4, '#1d4a2a');
  // high water: flooded cross street
  const fw = new THREE.MeshStandardMaterial({ color: '#16211f', roughness: .05, metalness: .4, transparent: true, opacity: .85 });
  [[-34, -200, 22, 10], [34, -201, 20, 10], [-8, -244, 10, 7]].forEach(([x, z, w, d]) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), fw); p.rotation.x = -Math.PI / 2; p.position.set(x, .06, z); scene.add(p); });
  [[-6, -186, .4, '#7a2a2a', { wreck: 1 }], [5, -205, 2.8, '#2a2a2a', { kind: 'police', wreck: 1 }], [-4.5, -222, -.2, '#d8d0c0', { kind: 'van', dirt: 1 }], [24, -200, 1.4, '#3a5a8a', { burnt: 1 }]].forEach(c => car(...c));
  fire(-24, 0, -203, .9);
  // Haverford High: fence + gate + stadium
  const fenceM = new THREE.MeshStandardMaterial({ color: '#7a7f84', metalness: .6, roughness: .5, transparent: true, opacity: .55 });
  wallBox(36, 2.6, .12, fenceM, -21, 1.3, -256); wallBox(36, 2.6, .12, fenceM, 21, 1.3, -256);
  wallBox(.12, 2.6, 44, fenceM, -39, 1.3, -278); wallBox(.12, 2.6, 44, fenceM, 39, 1.3, -278); wallBox(78, 2.6, .12, fenceM, 0, 1.3, -298);
  const gateMesh = new THREE.Mesh(new THREE.BoxGeometry(6, 2.8, .2), new THREE.MeshStandardMaterial({ color: '#3a4048', metalness: .7, roughness: .4 })); gateMesh.position.set(0, 1.4, -256); scene.add(gateMesh);
  const gateCol = { x0: -3, x1: 3, z0: -256.3, z1: -255.7 }; colliders.push(gateCol);
  const panel = new THREE.Mesh(new THREE.BoxGeometry(.6, .8, .2), new THREE.MeshStandardMaterial({ color: '#888', emissive: '#f22', emissiveIntensity: .6 })); panel.position.set(4, 1.2, -255.7); scene.add(panel);
  sign(['HAVERFORD HIGH', 'HOME OF THE FIGHTING BEAVERS'], -7, 3.1, -255.8, 0, 4, 1.1, '#5a1a1a');
  const turf = new THREE.Mesh(new THREE.PlaneGeometry(50, 30), new THREE.MeshStandardMaterial({ color: '#3a5a2a', roughness: 1 })); turf.rotation.x = -Math.PI / 2; turf.position.set(0, .04, -278); turf.receiveShadow = true; scene.add(turf);
  const lineM = new THREE.MeshBasicMaterial({ color: '#c8c8b8' }); for (let x = -20; x <= 20; x += 5) { const l = new THREE.Mesh(new THREE.PlaneGeometry(.15, 28), lineM); l.rotation.x = -Math.PI / 2; l.position.set(x, .05, -278); scene.add(l); }
  const blM = new THREE.MeshStandardMaterial({ color: '#8a8d90', metalness: .5, roughness: .5 });
  for (let i = 0; i < 4; i++) { wallBox(26, .5, 1.2, blM, -2, .3 + i * .6, -294 + i * 1.2, i === 0); }
  wallBox(8, 3, .4, new THREE.MeshStandardMaterial({ color: '#111' }), 0, 5, -297, false);
  const board = sign(['HOME 0 · GUESTS 66', 'EVAC 0600 →'], 0, 5, -296.7, 0, 7.6, 2.6, '#101010');
  wallBox(30, 6, 10, plankMat('#8a5a4a'), -24, 3, -268);
  [[-26, -264], [26, -292]].forEach(([x, z]) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(.15, .2, 12, 8), swMat); p.position.set(x, 6, z); scene.add(p); const h = new THREE.Mesh(new THREE.BoxGeometry(2, 1, .3), new THREE.MeshStandardMaterial({ color: '#222', emissive: '#fff', emissiveIntensity: 2 })); h.position.set(x, 12, z); scene.add(h); });
  const sl = new THREE.PointLight('#dfe8ff', 20, 50, 1.6); sl.position.set(0, 11, -278); if (Q.lamps > 3) { scene.add(sl); lights.push(sl); }
  const ch2 = { gateMesh, gateCol, panel, board };
  // ===== CHAPTERS 3–6 · zones south of Haverford (each zone is a Group shown only during its chapter) =====
  const zones = {}; const _add = scene.add.bind(scene);
  const zone = (ch, fn) => { const zg = new THREE.Group(); scene.add = (...o) => { zg.add(...o); return scene; }; try { fn(); } finally { scene.add = _add; } zg.visible = false; _add(zg); zones[ch] = zg; };
  const gL = new THREE.Mesh(new THREE.PlaneGeometry(420, 480), groundMat); gL.rotation.x = -Math.PI / 2; gL.position.set(0, -0.006, -540); gL.receiveShadow = true; scene.add(gL);
  box(-300, -48, -900, -299); box(48, 300, -900, -299); box(-300, 300, -1000, -770);
  const Z_jer = new THREE.MeshStandardMaterial({ color: '#8c8a82', roughness: .9 });
  const Z_barrier = (z) => { box(-300, 300, z - .4, z + .4); const m = new THREE.Mesh(new THREE.BoxGeometry(96, 1.1, .7), Z_jer); m.position.set(0, .55, z); scene.add(m); };
  [-416, -526, -636].forEach(Z_barrier);
  const Z_rustM = new THREE.MeshStandardMaterial({ color: '#6a4a3a', roughness: .9, metalness: .3 }), Z_white = new THREE.MeshStandardMaterial({ color: '#d8d4c8', roughness: .7 }), Z_red = new THREE.MeshStandardMaterial({ color: '#8a1a14', roughness: .7 });
  const Z_lamp = (x, z, c = '#ffc98a', on = true) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(.08, .1, 6, 6), swMat); p.position.set(x, 3, z); scene.add(p); const h = new THREE.Mesh(new THREE.BoxGeometry(.6, .15, .3), new THREE.MeshStandardMaterial({ color: '#222', emissive: c, emissiveIntensity: on ? 3 : 0 })); h.position.set(x, 6, z); scene.add(h); };
  const Z_pl = (x, y, z, c, i, r) => { if (Q.lamps <= 3 && i < 12) return; const L = new THREE.PointLight(c, i, r, 2); L.position.set(x, y, z); scene.add(L); lights.push(L); return L; };
  // CH3 — Route 1, Big Moose Truck Stop + Pine Tree Motel (z -305..-415)
  zone(3, () => {
    road(0, -360, 12, 110); road(-22, -350, 30, 26);
    sign(['ROUTE 1 SOUTH', 'PORTLAND 58'], 7.5, 2.6, -312, 0, 3, 1, '#1d4a2a');
    wallBox(16, 4, 10, plankMat('#b8a070'), -26, 2, -334); sign(['BIG MOOSE TRUCK STOP', 'DIESEL · DINER · JERKY'], -26, 4.8, -328.9, 0, 6, 1.6, '#6a2a10');
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(18, .5, 9), Z_white); canopy.position.set(-22, 4.6, -350); scene.add(canopy);
    [-28, -22, -16].forEach(x => { wallBox(.5, 4.4, .5, Z_red, x, 2.2, -350); wallBox(.8, 1.4, .6, Z_white, x, .7, -347); });
    Z_pl(-22, 4, -350, '#e8f0ff', 10, 22);
    [[-34, -362, .1], [-12, -366, -.2], [16, -340, 1.5], [18, -380, 1.6]].forEach(([x, z, r]) => car(x, z, r, '#7a2a1a', { truck: 1, rust: 1 }));
    [[-5, -330, .3], [5, -348, 2.6], [-4.5, -372, .1], [4.8, -392, 3.1]].forEach(([x, z, r], i) => car(x, z, r, ['#2a3a5a', '#5a5a5a', '#7a6a3a', '#3a3a3a'][i], { wreck: i % 2 }));
    for (let i = 0; i < 5; i++) wallBox(5.6, 3, 7, plankMat(i % 2 ? '#a07060' : '#8a6050'), 30, 1.5, -398 + i * 6);
    sign(['PINE TREE MOTEL', 'VACANCY · CABLE TV'], 26.8, 3.4, -386, -Math.PI / 2, 4, 1.2, '#1a3a5a');
    fire(-10, 0, -356, 1); fire(12, 0, -402, .8);
    [-7, 7].forEach(x => [-320, -350, -380, -405].forEach(z => Z_lamp(x, z)));
  });
  // CH4 — Maine Turnpike toll plaza, Tollmen raider camp (z -420..-525)
  zone(4, () => {
    road(0, -470, 40, 100);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(44, .6, 8), new THREE.MeshStandardMaterial({ color: '#2a4a6a', roughness: .6 })); roof.position.set(0, 5.4, -470); scene.add(roof);
    sign(['MAINE TURNPIKE · TOLL', 'NOW UNDER NEW MANAGEMENT · PAY OR DIE'], 0, 4.4, -465.9, 0, 9, 1.4, '#3a1010');
    for (let x = -18; x <= 18; x += 6) { wallBox(2, 2.6, 3.2, Z_white, x, 1.3, -470); const g = new THREE.Mesh(new THREE.BoxGeometry(3.6, .12, .12), Z_red); g.position.set(x + 2.8, 1.1, -468); scene.add(g); }
    for (let i = 0; i < 8; i++) car(-34 + (i % 2) * 2, -432 - i * 11, i * .7, '#4a3a2a', { burnt: i % 2, rust: 1 });
    for (let i = 0; i < 6; i++) car(34 - (i % 2) * 2, -440 - i * 12, -i * .6, '#3a3a3a', { wreck: 1 });
    [[-22, -495], [-8, -502], [8, -500], [22, -494]].forEach(([x, z]) => { wallBox(5, 2.4, 5, new THREE.MeshStandardMaterial({ color: '#5a5040' }), x, 1.2, z); gable(x, z, 5, 5, 2.4, false, Z_rustM); });
    const cage = new THREE.MeshStandardMaterial({ color: '#555', metalness: .7, roughness: .5, transparent: true, opacity: .6 });
    wallBox(6, 2.6, .1, cage, 0, 1.3, -515); wallBox(.1, 2.6, 4, cage, -3, 1.3, -513); wallBox(.1, 2.6, 4, cage, 3, 1.3, -513);
    sign(['TOLLMEN', 'EVERYBODY PAYS'], 0, 3, -519.5, 0, 4, 1, '#101010');
    fire(-14, 0, -484, 1.1); fire(14, 0, -486, 1.1); fire(0, 0, -508, .9); Z_pl(0, 5, -470, '#ffe0b0', 12, 30);
  });
  // CH5 — Maine Mall, South Portland (z -530..-635)
  zone(5, () => {
    road(0, -575, 70, 70);
    wallBox(70, 9, 18, new THREE.MeshStandardMaterial({ color: '#b8b0a0', roughness: .8 }), 0, 4.5, -622);
    sign(['THE MAINE MALL'], 0, 7.4, -612.9, 0, 12, 2, '#1a2a4a');
    sign(['FOOD COURT ↓', 'SANTA IS HERE! (DO NOT APPROACH SANTA)'], 12, 3, -612.9, 0, 5, 1.4, '#8a1010');
    const door = new THREE.Mesh(new THREE.BoxGeometry(8, 3.4, .2), new THREE.MeshStandardMaterial({ color: '#203040', metalness: .6, roughness: .2, emissive: '#102030' })); door.position.set(0, 1.7, -612.8); scene.add(door);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) if ((r + c) % 3) car(-28 + c * 11, -548 - r * 14, (r % 2) * Math.PI + .1, ['#4a5a7a', '#7a2a2a', '#d8d8d0', '#2a2a2a', '#5a6a3a'][(r * 6 + c) % 5], { wreck: (r + c) % 4 === 0, dirt: 1 });
    [-24, 0, 24].forEach(x => [-555, -590].forEach(z => Z_lamp(x, z, '#e8f0ff', (x + z) % 2 === 0)));
    const tree = new THREE.Mesh(new THREE.ConeGeometry(2.2, 7, 8), new THREE.MeshStandardMaterial({ color: '#1a4a2a', emissive: '#103010' })); tree.position.set(-12, 3.5, -607); scene.add(tree);
    fire(-20, 0, -570, 1); fire(18, 0, -600, .9); Z_pl(0, 6, -595, '#ffd0a0', 12, 34);
  });
  // CH6 — Fort Williams Park + Portland Head Light, Cape Elizabeth (z -640..-770)
  zone(6, () => {
    road(0, -680, 10, 70); road(0, -720, 60, 20);
    const Z_sea = new THREE.Mesh(new THREE.PlaneGeometry(420, 140), new THREE.MeshStandardMaterial({ color: '#0e1a22', roughness: .05, metalness: .4 })); Z_sea.rotation.x = -Math.PI / 2; Z_sea.position.set(0, -.4, -820); scene.add(Z_sea);
    const Z_rock = new THREE.MeshStandardMaterial({ color: '#4a4844', roughness: 1 });
    for (let i = 0; i < 14; i++) { const r = new THREE.Mesh(new THREE.DodecahedronGeometry(rnd(1.5, 3.5)), Z_rock); r.position.set(-45 + i * 7, .2, -752 + rnd(-3, 3)); scene.add(r); }
    const Z_stone = new THREE.MeshStandardMaterial({ color: '#7a7060', roughness: 1 });
    [[-26, -672, 14, 1.2], [-26, -684, 14, 1.2], [-33, -678, 1.2, 12], [26, -690, 12, 1.2], [32, -696, 1.2, 12]].forEach(([x, z, w, d]) => wallBox(w, 3.2, d, Z_stone, x, 1.6, z));
    sign(['FORT WILLIAMS PARK', 'PORTLAND HEAD LIGHT · EST. 1791'], 7, 2.2, -648, 0, 4, 1.2, '#1d3a2a');
    const tw = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.4, 18, 14), Z_white); tw.position.set(12, 9, -738); scene.add(tw); box(10, 14, -740, -736);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 2, 12), new THREE.MeshStandardMaterial({ color: '#202020', emissive: '#ffe8a0', emissiveIntensity: 2 })); top.position.set(12, 19, -738); scene.add(top);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(1.7, 1.6, 12), Z_red); cap.position.set(12, 20.8, -738); scene.add(cap);
    wallBox(8, 3.4, 6, Z_white, 4, 1.7, -735); gable(4, -735, 8, 6, 3.4, false, Z_red);
    const beam = new THREE.SpotLight('#fff2c0', 40, 120, .12, .4, 1); beam.position.set(12, 19, -738); scene.add(beam, beam.target); updaters.push((dt, t) => { beam.target.position.set(12 + Math.sin(t * .6) * 60, 0, -738 + Math.cos(t * .6) * 60); });
    zones._ship = new THREE.PointLight('#ff4040', 0, 80, 1); zones._ship.position.set(-30, 3, -840); scene.add(zones._ship);
    fire(-24, 0, -690, 1); fire(20, 0, -712, .9);
  });
  const treeSpots = []; let tries = 0;
  while (treeSpots.length < Q.trees * 2 && tries++ < 20000) { const x = rnd(-90, 90), z = rnd(-760, 90); if (Math.abs(x) < 10 && z > -150) continue; if (z < -134 && Math.abs(x) < 44) continue; if (z < -106 && z > -134) continue;
    if (colliders.some(c => x > c.x0 - 2 && x < c.x1 + 2 && z > c.z0 - 2 && z < c.z1 + 2)) continue; if (Math.abs(z - 4) < 7 && Math.abs(x) < 46) continue; if (x > 4 && x < 34 && z > -66 && z < -36) continue; treeSpots.push([x, z, rnd(9, 18)]); }
  const trunks = new THREE.InstancedMesh(trunkG, bark, treeSpots.length), layers = 4, cones = new THREE.InstancedMesh(coneG, needle, treeSpots.length * layers);
  const M = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), ps = new THREE.Vector3(); const col = new THREE.Color();
  treeSpots.forEach(([x, z, h], i) => { M.compose(ps.set(x, 0, z), q.identity(), sc.set(1 + h / 20, h * .6, 1 + h / 20)); trunks.setMatrixAt(i, M);
    for (let k = 0; k < layers; k++) { const f = k / layers, r = (1 - f) * h * 0.24 + .5; q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd(0, 6)); M.compose(ps.set(x, h * (0.22 + f * 0.62), z), q, sc.set(r, h * 0.36, r)); cones.setMatrixAt(i * layers + k, M); cones.setColorAt(i * layers + k, col.setHSL(.36, .2 + rnd(0, .1), .12 + rnd(0, .07))); }
    if (Math.abs(x) < 50 && z > -150) box(x - .3, x + .3, z - .3, z + .3); });
  trunks.castShadow = cones.castShadow = Q.shadows; cones.receiveShadow = true; scene.add(trunks, cones);

  // tall grass (instanced crossed quads with wind)
  const bladeT = grassBladeTex(); const gg = new THREE.PlaneGeometry(1, 1); gg.translate(0, .5, 0); const g2 = gg.clone(); g2.rotateY(Math.PI / 2);
  const grassGeo = mergeTwo(gg, g2);
  const grassMat = new THREE.MeshStandardMaterial({ map: bladeT, alphaTest: .45, side: THREE.DoubleSide, roughness: 1, color: '#8a9a72' });
  const wind = { value: 0 }; grassMat.onBeforeCompile = (s) => { s.uniforms.uT = wind; s.vertexShader = 'uniform float uT;\n' + s.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
    vec4 wp = instanceMatrix * vec4(0.,0.,0.,1.); float sw = sin(uT*1.7 + wp.x*.3 + wp.z*.2) * .18 * position.y; transformed.x += sw; transformed.z += sw*.6;`); };
  const grass = new THREE.InstancedMesh(grassGeo, grassMat, Q.grass); let gi = 0; tries = 0;
  while (gi < Q.grass && tries++ < Q.grass * 6) { const x = rnd(-46, 46), z = rnd(-104, 64); if (Math.abs(x) < 7.8) continue; if (x > KH.x0 - .5 && x < KH.x1 + .5 && z > KH.z0 - .5 && z < KH.z1 + .5) continue; if (Math.abs(z - 4) < 5 && Math.abs(x) < 45) continue; if (colliders.some(c => !c.car && x > c.x0 - .3 && x < c.x1 + .3 && z > c.z0 - .3 && z < c.z1 + .3)) continue;
    const s = rnd(.5, 1.25); M.compose(ps.set(x, 0, z), q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd(0, 3)), sc.set(s * 1.1, s * rnd(.7, 1.3), s * 1.1)); grass.setMatrixAt(gi, M); grass.setColorAt(gi, col.setHSL(.2 + rnd(0, .07), .25, .3 + rnd(0, .15))); gi++; }
  grass.count = gi; grass.receiveShadow = true; scene.add(grass); updaters.push((dt, t) => { wind.value = t; });

  // rain
  let rain = null; if (Q.rain) { const N = Q.rain, pos = new Float32Array(N * 6); for (let i = 0; i < N; i++) { const x = rnd(-25, 25), y = rnd(0, 20), z = rnd(-25, 25); pos.set([x, y, z, x + .03, y - .5, z], i * 6); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); rain = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#9fb0b0', transparent: true, opacity: .32 })); rain.frustumCulled = false; scene.add(rain);
    updaters.push((dt, t, cam) => { rain.visible = !(cam.x > KH.x0 && cam.x < KH.x1 && cam.z > KH.z0 && cam.z < KH.z1); const p = g.attributes.position.array; for (let i = 0; i < N; i++) { const k = i * 6; let y = p[k + 1] - dt * 22; if (y < 0) { y = 20; p[k] = cam.x + rnd(-25, 25); p[k + 2] = cam.z + rnd(-25, 25); }
      p[k + 1] = y; p[k + 3] = p[k] + .03; p[k + 4] = y - .5; p[k + 5] = p[k + 2]; } g.attributes.position.needsUpdate = true; }); }

  // bounds
  box(-300, -48, -300, 300); box(48, 300, -300, 300); box(-300, 300, 66, 300); box(-300, 300, -400, -299);

  return { ch2, zones, signTex, colliders, walls, updaters, lights, fire, car, sign, frontDoor, doorCol, doorBoards, tanker, tankCol, KH, mud, update(dt, t, cam) { updaters.forEach(u => u(dt, t, cam)); } };
}
function mergeTwo(a, b) { const g = new THREE.BufferGeometry(); ['position', 'normal', 'uv'].forEach(k => { const A = a.attributes[k].array, B = b.attributes[k].array, o = new Float32Array(A.length + B.length); o.set(A); o.set(B, A.length); g.setAttribute(k, new THREE.BufferAttribute(o, a.attributes[k].itemSize)); });
  const ia = a.index.array, ib = b.index.array, n = a.attributes.position.count, idx = new Uint16Array(ia.length + ib.length); idx.set(ia); for (let i = 0; i < ib.length; i++) idx[ia.length + i] = ib[i] + n; g.setIndex(new THREE.BufferAttribute(idx, 1)); return g; }
