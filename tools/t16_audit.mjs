// v1.6.3 softlock audit: natural progression through every step (fresh save / Continue / Chapter Select), low|high quality
import { chromium, devices } from 'playwright';
const qual = process.argv[2] || 'low', mode = process.argv[3] || 'fresh', from = +(process.argv[4] || 0), to = +(process.argv[5] || 32);
const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const ctx = await b.newContext({ ...devices['iPhone 13'] });
await ctx.addInitScript(([q, m, f]) => { localStorage.setItem('atq3.settings', JSON.stringify({ qual: q, gore: true, hints: true })); if (m !== 'fresh' && !sessionStorage.x) { sessionStorage.x = 1; localStorage.setItem('atq3.save.seed', JSON.stringify({ m, f })); } }, [qual, mode, from]);
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
await p.goto('http://localhost:4181/?god'); await p.waitForTimeout(4000); await p.click('#btnWarn').catch(()=>{}); await p.waitForTimeout(800);
if (mode === 'fresh') await p.click('#btnNew',{timeout:40000});
else { // build a save at step `from` the way the game writes it, then use Continue or Chapter Select
  await p.click('#btnNew',{timeout:40000}); await p.waitForTimeout(12000);
  await p.evaluate(f => { const g = window.__atq.game; g.save.step = f; g.save.ch = 6; g.save.maxCh = 6; g.save.done = g.save.done2 = true; g.checkpoint(); }, from);
  await p.reload(); await p.waitForTimeout(4000); await p.click('#btnWarn').catch(()=>{});
  if (mode === 'continue') await p.click('#btnContinue',{timeout:40000}); else { await p.click('#btnChapters',{timeout:40000}); await p.waitForTimeout(500); const CH = { 13: 3, 18: 4, 23: 5, 28: 6, 7: 2 }; await p.click('#btnCh' + (CH[from] || 1)); }
}
await p.waitForTimeout(12000);
const rep = []; let last = -1, guard = 0;
while (guard++ < 900) {
  const st = await p.evaluate(() => { const g = window.__atq.game; return { step: g.step, end: !document.querySelector('#ending').classList.contains('hidden') }; });
  if (st.end) { if (st.step >= 32) break; await p.click('#btnEndNext').catch(() => {}); await p.waitForTimeout(6000); continue; }
  if (st.step !== last) { await p.waitForTimeout(1800);
    const r = await p.evaluate(() => { const g = window.__atq.game, S = window.__atqStory, P = g.player.root.position; const st = g.stepData; const cp = (g._cp || null);
      const inCol = (x, z) => g.inCol(x, z, 0); const res = { step: g.step, obj: document.querySelector('#objt').textContent, pos: [+P.x.toFixed(1), +P.z.toFixed(1)], zones: Object.keys(g.world.zones).filter(k => g.world.zones[k].visible && g.world.zones[k].isObject3D), wp: g.wpTarget, z: g.alive().length, boss: !!g.boss, uses: (st.uses || []).map(u => [u.x, u.z]) , issues: [] };
      // reachability BFS on 0.5 m grid from player to wp + uses
      const tg = []; if (g.wpTarget) tg.push([g.wpTarget[0], g.wpTarget[2]]); (st.uses || []).forEach(u => tg.push([u.x, u.z])); g.pickups.filter(q => q.l.story).forEach(q => tg.push([q.mesh.position.x, q.mesh.position.z]));
      if (inCol(P.x, P.z)) res.issues.push('player inside collider');
      const C = 0.5, key = (i, j) => i * 100000 + j; for (const t of tg) { if (g.inCol(t[0], t[1], .3) && !g.inCol(t[0], t[1], 0) === false) {} const sx = Math.round(P.x / C), sz = Math.round(P.z / C), tx = Math.round(t[0] / C), tz = Math.round(t[1] / C);
        const seen = new Set([key(sx, sz)]); let q = [[sx, sz]], ok = false, n = 0; while (q.length && n < 400000) { const nq = []; for (const [i, j] of q) { n++; if (Math.hypot(i - tx, j - tz) * C < 2.2) { ok = true; break; } for (const [di, dj] of [[1,0],[-1,0],[0,1],[0,-1]]) { const a = i + di, c = j + dj, k = key(a, c); if (seen.has(k) || Math.abs(a * C - P.x) > 200 || Math.abs(c * C - P.z) > 200) continue; seen.add(k); if (!g.inCol(a * C, c * C, .3)) nq.push([a, c]); } } if (ok) break; q = nq; }
        if (!ok) res.issues.push('UNREACHABLE target ' + t.map(v => v.toFixed(1))); }
      g.alive().forEach(z => { if (g.inCol(z.root.position.x, z.root.position.z, 0)) res.issues.push('zombie in wall'); });
      return res; });
    rep.push(r); console.log(JSON.stringify(r)); last = st.step; if (last > to) break; }
  await p.evaluate(() => { const g = window.__atq.game; g.dlgCur && g.skipLine(); if (!g.cut && !g.dlgCur) { g.stuckT = 999; g.skipObjective(); } });
  await p.waitForTimeout(1200);
}
const steps = [...new Set(rep.map(r => r.step))]; console.log('SUMMARY', qual, mode, 'steps', steps.join(','), 'issues', rep.filter(r => r.issues.length).length, 'errs', JSON.stringify(errs.slice(0, 5)));
await b.close();
