import * as THREE from 'three';
import { bodyLook, dressChar } from './looks.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

// Body material: one CC0 Quaternius mannequin, "dressed" in the shader by bind-pose regions
// (skin / shirt / sleeves / pants / shoes / hair), with procedural grime and blood.
export function bodyMat(o) {
  const m = new THREE.MeshStandardMaterial({ roughness: 0.78, metalness: 0 });
  const U = m.userData.u = {
    uSkin: { value: new THREE.Color(o.skin) }, uShirt: { value: new THREE.Color(o.shirt) }, uPants: { value: new THREE.Color(o.pants) },
    uShoes: { value: new THREE.Color(o.shoes || '#1b1b1b') }, uHair: { value: new THREE.Color(o.hair || '#0d0a08') },
    uSleeve: { value: o.sleeve ?? 0.62 }, uJk: { value: o.jk || 0 }, uJacket: { value: new THREE.Color(o.jacket || o.shirt) }, uJSleeve: { value: new THREE.Color(o.jsleeve || o.jacket || o.shirt) }, uLong: { value: o.long || 0 }, uCamo: { value: o.camo || 0 }, uBoots: { value: o.boots || 0 }, uGlove: { value: o.gloves || 0 }, uPlaid: { value: o.plaid || 0 }, uStripe: { value: o.stripe || 0 }, uGloss: { value: o.gloss || 0 }, uPuff: { value: o.puff || 0 }, uNoHead: { value: o.nohead ? 1 : 0 }, uGrime: { value: o.grime || 0 }, uBlood: { value: o.blood || 0 }, uZed: { value: o.zed ? 1 : 0 }, uSeed: { value: Math.random() * 10 },
  };
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = 'varying vec3 vBP;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvBP = position; { float sy = smoothstep(1.22,1.36,position.y)*(1.0-smoothstep(1.47,1.53,position.y)); float sx = 1.0-smoothstep(0.30,0.40,abs(position.x)); float k = sy*sx*0.45; transformed.z = mix(transformed.z, -0.015, k*0.6); transformed.x *= 1.0 - k*0.16*smoothstep(0.1,0.22,abs(position.x)); float t = smoothstep(1.0,1.2,position.y)*(1.0-smoothstep(1.45,1.5,position.y))*(1.0-smoothstep(0.2,0.3,abs(position.x))); transformed.z = mix(transformed.z, -0.015, t*0.12); }');
    sh.fragmentShader = 'varying vec3 vBP;\nuniform vec3 uSkin,uShirt,uPants,uShoes,uHair;uniform vec3 uJacket,uJSleeve;uniform float uNoHead,uJk,uLong,uCamo,uBoots,uGlove,uPlaid,uStripe,uGloss,uPuff;uniform float uSleeve,uGrime,uBlood,uZed,uSeed;\n' +
      sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      float h = vBP.y / 1.83; float ax = abs(vBP.x); if (uNoHead > 0.5 && vBP.y > 1.47 && ax < 0.13) discard;
      vec3 c = uPants; float jk = 0.0; float cl = 1.0;
      if (h > 0.575) c = uShirt;
      if (uJk > 0.5 && h > 0.575) { bool open = uJk < 1.5 && ax < 0.05 && vBP.z > 0.0 && h < 0.8; if (!open) { c = (ax > 0.17) ? uJSleeve : uJacket; jk = 1.0; } }
      if (uJk > 2.5) { c = uJacket; jk = 1.0; }
      if (uLong > 0.0 && h <= 0.575 && h > 0.575 - uLong * 0.28 && !(uJk < 1.5 && vBP.z > 0.03 && ax < 0.06)) { c = uJacket; jk = 1.0; }
      if (ax > uSleeve && !(uJk > 0.5 && ax < 0.62)) { c = uSkin; cl = 0.0; }
      if (uGlove > 0.5 && ax > 0.62) { c = vec3(0.06); cl = 0.0; }
      if (h > 0.82 && ax < 0.16) { c = uSkin; cl = 0.0; }
      if (h < 0.055 + uBoots * 0.07) { c = uShoes; cl = 0.0; }
      if (uJk < 2.5 && h > 0.548 && h < 0.578 && ax < 0.2 && jk < 0.5) c = uShoes * 1.4 + 0.02; // belt
      if (uCamo > 0.5 && cl > 0.5 && jk < 0.5 || (uCamo > 0.5 && uJk > 1.5 && jk > 0.5)) { float q = sin(vBP.x*17.+sin(vBP.y*13.)*2.)+sin(vBP.y*19.+vBP.z*15.)+sin(vBP.z*21.+vBP.x*9.);
        c = q > 1.0 ? c*0.45 : q > 0.1 ? c*vec3(0.85,0.75,0.55) : q < -1.2 ? c*vec3(1.25,1.2,0.95) : c; }
      if (uPlaid > 0.5 && jk > 0.5) { float a = step(0.7, fract(vBP.y*22.)) + step(0.7, fract((vBP.x+vBP.z)*22.)); c *= 1.0 - 0.35*min(a,1.0) - 0.25*step(1.5,a); }
      if (uStripe > 0.5 && cl > 0.5 && ((h < 0.575 && h > 0.06 && ax > 0.12) || (fract(h*6.0) < 0.06 && uJk > 0.5 && jk > 0.5 && h < 0.7))) c = vec3(0.85,0.85,0.7);
      if (uPuff > 0.5 && jk > 0.5) c *= 0.85 + 0.15*step(0.5, fract(vBP.y*14.));
      float n1 = sin(vBP.x*31.+uSeed)*sin(vBP.y*23.+uSeed*2.)*sin(vBP.z*37.+1.3);
      float n2 = sin(vBP.x*9.+uSeed*3.)*sin(vBP.y*7.)*sin(vBP.z*11.+uSeed);
      c *= mix(1.0, 0.55 + 0.6*(0.5+0.5*n1), uGrime);
      c = mix(c, c * vec3(0.55,0.62,0.45), uGrime * smoothstep(0.0,0.6,n2) * 0.8);
      float bl = smoothstep(0.25, 0.55, n2 + n1*0.3) * uBlood;
      float mouth = uZed * smoothstep(0.86,0.9,h) * step(h,0.93) * step(0.02, vBP.z) * step(ax,0.12);
      bl = max(bl, mouth); bl = max(bl, uZed * step(0.62, h) * step(h, 0.8) * step(0.03, vBP.z) * smoothstep(0.3,0.7,n1) * 0.9);
      c = mix(c, vec3(0.22,0.0,0.0), clamp(bl,0.,1.));
      diffuseColor.rgb = c;`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.32, uGloss * step(0.52, vBP.y/1.83) * step(0.0, uJk - 0.5));\nroughnessFactor = mix(roughnessFactor, 0.25, step(0.5, diffuseColor.r - diffuseColor.g) * uBlood);');
  };
  m.customProgramCacheKey = () => 'body';
  return m;
}

export class CharLib {
  constructor(gltf) { this.gltf = gltf; this.clips = {}; gltf.animations.forEach(a => { this.clips[a.name] = a; });
    // strip root translation from in-place clips (keep feet planted), skip _RM
    for (const k in this.clips) { const c = this.clips[k]; c.tracks = c.tracks.filter(t => !(t.name.startsWith('root.') && t.name.endsWith('.position'))); }
  }
  make(look) { const obj = SkeletonUtils.clone(this.gltf.scene); const mat = bodyMat(look.hair ? Object.assign(bodyLook(look), { grime: Math.max(look.grime || 0, bodyLook(look).grime), blood: look.blood, zed: look.zed, nohead: 1 }) : look); const bones = {};
    obj.traverse(o => { if (o.isSkinnedMesh) { o.material = mat; o.castShadow = true; o.receiveShadow = false; o.frustumCulled = false; } if (o.isBone) { bones[o.name] = o; bones[o.name.replace(/[.]/g, '')] = o; } });
    return { obj, mat, bones };
  }
}

export class Char {
  constructor(lib, look, scale = 1) {
    const { obj, mat, bones } = lib.make(look); this.lib = lib; this.mat = mat; this.bones = bones; this.look = look;
    this.root = new THREE.Group(); this.root.add(obj); obj.scale.setScalar(scale); this.scale = scale; this.model = obj;
    if (look.hair) dressChar(this, look);
    this.mixer = new THREE.AnimationMixer(obj); this.actions = {}; this.cur = null; this.curName = ''; this.oneShot = null;
    this.mixer.addEventListener('finished', (e) => { if (this.oneShot && e.action === this.oneShot.a) { const cb = this.oneShot.cb; this.oneShot = null; cb && cb(); } });
  }
  act(name) { let a = this.actions[name]; if (!a) { const c = this.lib.clips[name]; if (!c) return null; a = this.actions[name] = this.mixer.clipAction(c); } return a; }
  play(name, { fade = 0.18, speed = 1, once = false, cb, force = false } = {}) {
    if (!force && this.curName === name && !once) { if (this.cur) this.cur.timeScale = speed; return; }
    const a = this.act(name); if (!a) return; a.reset(); a.timeScale = speed; a.enabled = true;
    if (once) { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; this.oneShot = { a, cb }; } else a.setLoop(THREE.LoopRepeat);
    if (this.cur && this.cur !== a) a.crossFadeFrom(this.cur, fade, false); a.play(); this.cur = a; this.curName = name;
  }
  bone(n) { return this.bones[n] || this.bones[n.replace(/[.]/g, '')]; }
  attach(boneName, mesh) { const b = this.bone(boneName); if (b) b.add(mesh); return mesh; }
  worldOf(boneName, out) { const b = this.bone(boneName); return b ? b.getWorldPosition(out) : this.root.getWorldPosition(out); }
}

// Simple props built from primitives
export function backpack() { const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: '#2e3a2a', roughness: .9 });
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.42, 0.18), m); g.add(b); const p = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.08), new THREE.MeshStandardMaterial({ color: '#3a4632', roughness: .9 })); p.position.set(0, -0.08, -0.12); g.add(p);
  const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.36, 10), new THREE.MeshStandardMaterial({ color: '#2b4a7a', roughness: .8 })); roll.rotation.z = Math.PI / 2; roll.position.set(0, -0.26, 0); g.add(roll);
  const rope = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.025, 6, 14), new THREE.MeshStandardMaterial({ color: '#b89a3a', roughness: .9 })); rope.position.set(0.17, 0, -0.02); rope.rotation.y = Math.PI / 2; g.add(rope);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g; }

export function weaponMesh(id) {
  const g = new THREE.Group(); const dark = new THREE.MeshStandardMaterial({ color: '#1c1c1e', metalness: .7, roughness: .4 });
  const wood = new THREE.MeshStandardMaterial({ color: '#6b4a2b', roughness: .7 }); const steel = new THREE.MeshStandardMaterial({ color: '#9aa0a6', metalness: .9, roughness: .3 });
  const add = (geo, mat, x, y, z, rx = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.x = rx; m.castShadow = true; g.add(m); return m; };
  // local frame: grip at origin, barrel/blade along +Z
  if (id === 'bat') { add(new THREE.CylinderGeometry(0.03, 0.055, 0.85, 10), wood, 0, 0, 0.38, Math.PI / 2); }
  else if (id === 'pan') { add(new THREE.CylinderGeometry(0.018, 0.018, 0.3, 8), dark, 0, 0, 0.12, Math.PI / 2); const p = add(new THREE.CylinderGeometry(0.15, 0.12, 0.05, 18), dark, 0, 0, 0.4); }
  else if (id === 'machete') { add(new THREE.BoxGeometry(0.035, 0.03, 0.14), dark, 0, 0, 0.02); add(new THREE.BoxGeometry(0.06, 0.006, 0.5), steel, 0, 0, 0.33); }
  else if (id === 'axe') { add(new THREE.CylinderGeometry(0.022, 0.022, 0.8, 8), wood, 0, 0, 0.33, Math.PI / 2); add(new THREE.BoxGeometry(0.2, 0.02, 0.14), new THREE.MeshStandardMaterial({ color: '#8a1414', metalness: .5, roughness: .5 }), 0.08, 0, 0.66); }
  else if (id === 'chainsaw') { add(new THREE.BoxGeometry(0.12, 0.16, 0.3), new THREE.MeshStandardMaterial({ color: '#d86a10', roughness: .6 }), 0, 0, 0.1); add(new THREE.BoxGeometry(0.03, 0.08, 0.55), steel, 0, 0, 0.5); }
  else if (id === 'katana') { add(new THREE.BoxGeometry(0.04, 0.04, 0.22), dark, 0, 0, 0.06); add(new THREE.BoxGeometry(0.02, 0.006, 0.75), steel, 0, 0, 0.55); }
  else if (id === 'fists') { }
  else { const L = { pistol: .2, revolver: .26, smg: .36, shotgun: .75, rifle: .7, sniper: .95, saw: .85, lever: .8, auto12: .6, handcannon: .3, harpoon: .9, minigun: .8 }[id] || .3;
    add(new THREE.BoxGeometry(0.035, 0.11, 0.05), dark, 0, -0.05, 0); add(new THREE.BoxGeometry(0.045, 0.05, L), id === 'shotgun' ? wood : dark, 0, 0.02, L / 2 - 0.05);
    if (L > 0.3) { add(new THREE.BoxGeometry(0.04, 0.06, 0.22), id === 'sniper' || id === 'shotgun' ? wood : dark, 0, 0.0, -0.15); add(new THREE.BoxGeometry(0.03, 0.1, 0.04), dark, 0, -0.06, L * 0.4); }
    if (id === 'sniper' || id === 'rifle' || id === 'saw') add(new THREE.CylinderGeometry(0.022, 0.022, 0.18, 10), dark, 0, 0.075, L * 0.3, Math.PI / 2);
    if (id === 'saw') { add(new THREE.BoxGeometry(0.09, 0.09, 0.12), new THREE.MeshStandardMaterial({ color: '#3d4630', roughness: .8 }), 0.05, -0.05, 0.12); add(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 6), dark, 0.03, -0.12, L * 0.8); add(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 6), dark, -0.03, -0.12, L * 0.8); }
    const mz = new THREE.Object3D(); mz.position.set(0, 0.02, L - 0.03); mz.name = 'muzzle'; g.add(mz); }
  return g;
}

// Procedural dog (Pickles) — legs animate in code
export function makeDog() { const g = new THREE.Group(); const fur = new THREE.MeshStandardMaterial({ color: '#8a6a44', roughness: 1 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.36, 4, 10), fur); body.rotation.x = Math.PI / 2; body.position.y = 0.35; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), fur); head.position.set(0, 0.5, 0.3); g.add(head);
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.12), fur); snout.position.set(0, 0.47, 0.42); g.add(snout);
  [-1, 1].forEach(s => { const e = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 6), fur); e.position.set(s * 0.07, 0.62, 0.28); g.add(e); });
  g.legs = []; [[-.08, .2], [.08, .2], [-.08, -.18], [.08, -.18]].forEach(([x, z]) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.26, 6), fur); l.geometry.translate(0, -0.13, 0); l.position.set(x, 0.3, z); g.add(l); g.legs.push(l); });
  const t = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.025, 0.2, 6), fur); t.position.set(0, 0.45, -0.3); t.rotation.x = -0.8; g.add(t); g.tail = t;
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g; }
// Biscuit: Nia's rabbit, peeking from her hoodie pocket (~7 meshes, shared mats)
export function makeRabbit() { const g = new THREE.Group(); const fur = new THREE.MeshStandardMaterial({ color: '#c8a27a', roughness: 1 }), pink = new THREE.MeshStandardMaterial({ color: '#e7a0a8', roughness: 1 }), eye = new THREE.MeshBasicMaterial({ color: '#0a0604' });
  const head = new THREE.Group(); g.add(head); const h = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), fur); h.scale.set(1, .9, 1.1); head.add(h);
  const sn = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 5), pink); sn.position.set(0, -0.005, 0.06); head.add(sn);
  [-1, 1].forEach(s => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.009, 6, 5), eye); e.position.set(s * 0.028, 0.014, 0.045); head.add(e);
    const ear = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.06, 3, 6), fur); ear.geometry.translate(0, 0.045, 0); ear.position.set(s * 0.022, 0.04, -0.01); ear.rotation.z = -s * .25; head.add(ear); (g.ears = g.ears || []).push(ear); });
  const paws = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.02, 0.03), fur); paws.position.set(0, -0.05, 0.04); g.add(paws);
  g.head = head; g.traverse(o => { if (o.isMesh) o.frustumCulled = false; }); return g; }
