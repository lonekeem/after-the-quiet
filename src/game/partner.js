// v1.9.0 — Nia as a real partner: supply hand-offs, zombie spotting, vent runs.
import * as THREE from 'three';
import { WEAPONS } from './data.js';
// optional bonus vents (never required for progress → no softlocks). [dx, dz] from checkpoint, label, reward
const VENTS = {
  9: [[-20.5, -196.5, 'Send Nia through the laundromat vent', 'door', { cash: 60, meds: 1, ammo: 24 }, 'She unlocked the back room! Supplies inside.']],
  14: [[-12.5, -347, 'Send Nia through the truck stop vent', 'item', { grenades: 1, ammo: 30 }, 'Nia grabbed a stash from the locked office.']],
  23: [[5, -540, 'Send Nia through the pharmacy grate', 'item', { meds: 2, cash: 40 }, 'Nia squeezed in and grabbed meds.']],
  29: [[-16, -682, 'Send Nia through the ranger hut vent', 'door', { ammo: 30, cash: 50 }, 'Nia popped the hut door. Supplies!']],
};
function ventMesh() { const g = new THREE.Group(); const f = new THREE.Mesh(new THREE.BoxGeometry(.7, .5, .08), new THREE.MeshStandardMaterial({ color: '#555b60', metalness: .6, roughness: .5 })); g.add(f);
  for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(.6, .04, .1), new THREE.MeshStandardMaterial({ color: '#2a2d30' })); s.position.set(0, -.18 + i * .09, .02); g.add(s); }
  const glow = new THREE.Mesh(new THREE.RingGeometry(.5, .6, 24), new THREE.MeshBasicMaterial({ color: '#ff9ad5', transparent: true, opacity: .5, side: THREE.DoubleSide })); glow.rotation.x = -Math.PI / 2; glow.position.y = -.24; g.add(glow); g.glow = glow; return g; }
function marker() { const m = new THREE.Mesh(new THREE.ConeGeometry(.3, .6, 4), new THREE.MeshBasicMaterial({ color: '#ff3b6b', depthTest: false, transparent: true })); m.rotation.x = Math.PI; m.renderOrder = 999; return m; }
export function partnerEnter(g) { (g.vents || []).forEach(v => g.scene.remove(v.mesh)); (g.nMarks || []).forEach(m => m.m.parent && m.m.parent.remove(m.m)); g.vents = []; g.nMarks = [];
  g.PN = { give: 25, spot: 5, scan: 0, busy: null, seen: new WeakSet(), tok: g.stepTok };
  (VENTS[g.step] || []).forEach(([x, z, label, kind, rew, msg]) => { const [fx, fz] = g.freeNear(x, z); const mesh = ventMesh(); mesh.position.set(fx, .26, fz); g.scene.add(mesh); g.vents.push({ x: fx, z: fz, label, kind, rew, msg, mesh, done: false }); }); }
export function ventUse(g, P) { let best = null, bd = 1.9; (g.vents || []).forEach(v => { if (v.done) return; const d = Math.hypot(v.x - P.x, v.z - P.z); if (d < bd) { bd = d; best = v; } }); if (!best) return null;
  return { label: best.label, fn: (g) => sendNia(g, best) }; }
function sendNia(g, v) { const n = g.npcs.nia; if (!n || !n.root.visible) { g.toast('Nia needs to be with you'); return; } if (g.PN.busy) return; const P = g.player.root.position; if (n.root.position.distanceTo(P) > 14) { g.toast('Wait for Nia to catch up'); return; }
  v.done = true; const B = g.PN.busy = { v, t: 0, ph: 'go', n, old: n.update, stub: () => {} }; n.update = B.stub; g.audio.shout && g.audio.shout('nia_vent', true, n.root.position);
}
function finishVent(g, v) { const s = g.save, r = v.rew; if (r.cash) g.addCash(r.cash); if (r.meds) s.meds += r.meds; if (r.grenades) s.grenades += r.grenades;
  if (r.ammo) { const a = (WEAPONS[s.cur] && WEAPONS[s.cur].ammo) || 'light'; s.ammo[a] = (s.ammo[a] || 0) + r.ammo; }
  g.scene.remove(v.mesh); g.toast(v.msg, 2.6); g.floatText('Nia came through!', '#ff9ad5'); g.audio.pickup && g.audio.pickup(); g.addXP && g.addXP(60); g.checkpoint(); }
export function partnerUpdate(g, dt) { const n = g.npcs.nia, PN = g.PN; if (!PN) return;
  (g.vents || []).forEach(v => { if (!v.done) v.mesh.glow.material.opacity = .35 + Math.sin(g.t * 4) * .2; });
  for (let i = g.nMarks.length - 1; i >= 0; i--) { const m = g.nMarks[i]; m.t -= dt; m.m.position.y = 2.3 + Math.sin(g.t * 6) * .08; if (m.t <= 0 || m.z.dead) { m.m.parent && m.m.parent.remove(m.m); g.nMarks.splice(i, 1); } }
  const B = PN.busy; if (B) { B.t += dt; B.T = (B.T || 0) + dt; const v = B.v, nn = B.n, p = nn.root.position;
    if (B.ph === 'go') { const dx = v.x - p.x, dz = v.z - p.z, d = Math.hypot(dx, dz); if (d > .6 && B.t < 6) { p.x += dx / d * 3 * dt; p.z += dz / d * 3 * dt; nn.root.rotation.y = Math.atan2(dx, dz); nn.play('Walk_Loop'); } else { p.set(v.x, 0, v.z); B.ph = 'in'; B.t = 0; nn.root.visible = false; } }
    else if (B.t > 3 || B.T > 12) { nn.root.visible = true; nn.play('Idle_Loop'); PN.busy = null; if (nn.update === B.stub) nn.update = B.old; finishVent(g, v); } return; }
  if (!n || !n.root.visible || g.cut || g.dlgCur || g.dying || (g.truck && g.truck.driving)) return;
  const P = g.player.root.position, np = n.root.position; if (np.distanceTo(P) > 10) return; const s = g.save, w = WEAPONS[s.cur];
  PN.give -= dt; PN.spot -= dt;
  if (PN.give <= 0) { let what = null;
    if (g.hp < g.maxHp * .35 && s.meds < 1) { s.meds += 1; what = '+1 Med kit from Nia'; }
    else if (w && w.type === 'gun' && (s.ammo[w.ammo] || 0) + (s.mags[s.cur] || 0) < 10) { const n2 = w.ammo === 'shell' ? 8 : w.ammo === 'heavy' ? 15 : 24; s.ammo[w.ammo] = (s.ammo[w.ammo] || 0) + n2; what = `+${n2} ${w.ammo} ammo from Nia`; }
    if (what) { PN.give = 60; g.floatText(what, '#ff9ad5'); g.audio.shout && g.audio.shout('nia_give', true, np); g.audio.pickup && g.audio.pickup(); } else PN.give = 3; }
  if (PN.spot <= 0) { PN.spot = 1; let best = null, bd = 16; g.alive().forEach(z => { if (PN.seen.has(z) || z.boss) return; const d = z.root.position.distanceTo(P); if (d < bd && d > 4) { bd = d; best = z; } });
    if (best) { PN.seen.add(best); const m = marker(); best.root.add(m); m.position.set(0, 2.3, 0); g.nMarks.push({ m, z: best, t: 4 }); if (Math.random() < .6) { PN.spot = 14; g.audio.shout && g.audio.shout('nia_spot', false, np); } } } }
