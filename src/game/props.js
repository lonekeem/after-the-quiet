// v1.7.1 "what they say, we see": tiny low-poly props attached to bones (shared mats, a few meshes each)
import * as THREE from 'three';
const M = (c, e) => new THREE.MeshStandardMaterial({ color: c, roughness: .8, emissive: e || '#000' });
const red = M('#c01818'), white = M('#eeeeee'), gold = M('#d4a838'), black = M('#141414'), blood = M('#5a0808'), gauze = M('#d8d0c0'), silver = M('#b8b8c0'), navy = M('#1a2238');
const mesh = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.frustumCulled = false; return o; };
export function hat(kind) { const g = new THREE.Group();
  if (kind === 'santa') { const c = mesh(new THREE.ConeGeometry(.13, .28, 8), red, 0, .2, 0); c.rotation.x = -.35; g.add(c, mesh(new THREE.TorusGeometry(.12, .035, 5, 10), white, 0, .08, 0), mesh(new THREE.SphereGeometry(.04, 6, 5), white, 0, .3, -.1)); g.children[1].rotation.x = Math.PI / 2; }
  else if (kind === 'crown') { g.add(mesh(new THREE.CylinderGeometry(.12, .11, .08, 8, 1, true), gold, 0, .14, 0)); for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28, s = mesh(new THREE.ConeGeometry(.025, .07, 4), gold, Math.sin(a) * .11, .21, Math.cos(a) * .11); g.add(s); } }
  else if (kind === 'captain') { g.add(mesh(new THREE.CylinderGeometry(.13, .13, .07, 10), white, 0, .15, 0), mesh(new THREE.CylinderGeometry(.14, .14, .015, 10), black, 0, .11, .03), mesh(new THREE.BoxGeometry(.05, .03, .01), gold, 0, .16, .13)); }
  else if (kind === 'navy') { g.add(mesh(new THREE.CylinderGeometry(.125, .12, .06, 10), navy, 0, .14, 0), mesh(new THREE.BoxGeometry(.18, .012, .08), black, 0, .11, .1), mesh(new THREE.BoxGeometry(.05, .03, .01), gold, 0, .15, .125)); }
  else if (kind === 'whistle') { g.add(mesh(new THREE.BoxGeometry(.03, .025, .05), silver, 0, -.02, .12), mesh(new THREE.TorusGeometry(.12, .006, 3, 12), red, 0, -.16, .02)); g.children[1].rotation.x = Math.PI / 2.3; }
  else if (kind === 'helm') { g.add(mesh(new THREE.CylinderGeometry(.14, .14, .26, 10), silver, 0, .1, 0), mesh(new THREE.BoxGeometry(.2, .02, .02), black, 0, .1, .14), mesh(new THREE.ConeGeometry(.04, .14, 5), red, 0, .3, 0)); }
  else if (kind === 'fire') { g.add(mesh(new THREE.SphereGeometry(.15, 10, 6, 0, 6.29, 0, 1.4), M('#b8860b'), 0, .1, 0), mesh(new THREE.CylinderGeometry(.2, .2, .015, 12), M('#b8860b'), 0, .08, -.03), mesh(new THREE.BoxGeometry(.07, .08, .01), gold, 0, .16, .15)); }
  return g; }
// v1.8 knight breastplate
export function plate() { const g = new THREE.Group(); g.add(mesh(new THREE.BoxGeometry(.4, .42, .3), silver, 0, 0, .02)); return g; }
// Big Rig Ronnie: steering wheel lodged in his gut; CB cord round his neck
export function wheelGut() { const g = new THREE.Group(); const w = mesh(new THREE.TorusGeometry(.17, .025, 5, 14), black, 0, 0, .16); g.add(w, mesh(new THREE.CylinderGeometry(.02, .02, .2, 5), black, 0, 0, .1)); g.children[1].rotation.x = Math.PI / 2; return g; }
export function cbCord() { const g = new THREE.Group(); const t = mesh(new THREE.TorusGeometry(.07, .008, 3, 12), black, 0, 0, 0); t.rotation.x = Math.PI / 2; g.add(t, mesh(new THREE.BoxGeometry(.05, .08, .025), black, .03, -.12, .08)); return g; }
// Dad's cut hand (Ch1) and the bite on his forearm (revealed Ch3) — gauze wrap with a blood stain
export function wrap(bitten) { const g = new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(.045, .045, .09, 8), gauze, 0, .12, 0)); if (bitten) g.add(mesh(new THREE.CylinderGeometry(.047, .047, .04, 8, 1, true, 0, 2.4), blood, 0, .13, 0)); return g; }
export function walkie() { const g = new THREE.Group(); g.add(mesh(new THREE.BoxGeometry(.05, .1, .03), black), mesh(new THREE.CylinderGeometry(.005, .005, .08, 4), black, .015, .09, 0), mesh(new THREE.BoxGeometry(.03, .02, .005), M('#203020', '#40ff60'), 0, .02, .016)); return g; }
export function keycard() { return mesh(new THREE.BoxGeometry(.09, .005, .055), M('#d0d8e0', '#103050')); }
export function bossProp(g, b, name) { const n = name || ''; const H = (k) => b.attach('DEF-head', hat(k));
  if (/SANTA/.test(n)) H('santa'); else if (/KING/.test(n)) H('crown'); else if (/DECKHAND/.test(n)) H('captain'); else if (/CAPTAIN/.test(n)) H('navy'); else if (/COACH/.test(n)) H('whistle'); else if (/KNIGHT/.test(n)) { H('helm'); b.attach('DEF-spine.002', plate()); } else if (/SUBJECT ONE/.test(n)) H('fire');
  else if (/RONNIE/.test(n)) { b.attach('DEF-spine.001', wheelGut()); b.attach('DEF-neck', cbCord()); } }
