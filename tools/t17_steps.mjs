// v1.6.3 per-step softlock audit: loads every step via ?step=N, checks spawn/marker/reachability, then forces skipObjective and verifies progress
import { chromium, devices } from 'playwright';
const qual = process.argv[2] || 'low', from = +(process.argv[3] || 0), to = +(process.argv[4] || 32);
const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const ctx = await b.newContext({ ...devices['iPhone 13'] }); await ctx.addInitScript(q => localStorage.setItem('atq3.settings', JSON.stringify({ qual: q, gore: true })), qual);
let bad = 0;
for (let s = from; s <= to; s++) {
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(`http://localhost:4181/?step=${s}&god`); await p.waitForTimeout(9000);
  const r = await p.evaluate(async () => { const g = window.__atq.game, P = g.player.root.position, D = g.stepData; const W = ms => new Promise(r => setTimeout(r, ms));
    for (let k = 0; k < 40 && g.dlgCur; k++) g.skipLine();
    const res = { step: g.step, obj: document.querySelector('#objt').textContent, pos: [+P.x.toFixed(1), +P.z.toFixed(1)], wp: g.wpTarget && g.wpTarget.map(v => +v.toFixed(1)), z: g.alive().length, boss: !!g.boss, uses: (D.uses || []).length, issues: [] };
    if (g.inCol(P.x, P.z, 0)) res.issues.push('player in collider');
    const tg = []; if (g.wpTarget) tg.push([g.wpTarget[0], g.wpTarget[2]]); (D.uses || []).forEach(u => tg.push([u.x, u.z]));
    const C = .5; for (const t of tg) { const sx = Math.round(P.x / C), sz = Math.round(P.z / C), tx = Math.round(t[0] / C), tz = Math.round(t[1] / C); const seen = new Set([sx + ',' + sz]); let q = [[sx, sz]], ok = false, n = 0;
      while (q.length && !ok && n < 300000) { const nq = []; for (const [i, j] of q) { n++; if (Math.hypot(i - tx, j - tz) * C < 2.5) { ok = true; break; } for (const [a, c] of [[i+1,j],[i-1,j],[i,j+1],[i,j-1]]) { const k = a + ',' + c; if (seen.has(k) || g.inCol(a * C, c * C, .3)) continue; seen.add(k); nq.push([a, c]); } } q = nq; }
      if (!ok) res.issues.push('UNREACHABLE ' + t.map(v => v.toFixed(0))); }
    g.alive().forEach(z => { if (g.inCol(z.root.position.x, z.root.position.z, 0)) res.issues.push('zombie in wall'); });
    const s0 = g.step; for (let k = 0; k < 120 && g.step === s0; k++) { for (let j = 0; j < 40 && g.dlgCur; j++) g.skipLine(); if (!g.cut && !g.dlgCur) { g.stuckT = 999; g.skipObjective(); } await W(500);
      if (!document.querySelector('#ending').classList.contains('hidden')) { res.ending = true; break; } }
    res.ph = D.phase + '|' + g.stepData.phase + '|' + (!!g.cut) + (!!g.dlgCur) + '|' + JSON.stringify(g.save.items) + JSON.stringify(g.save.owned); res.advanced = g.step !== s0 || !!res.ending; if (!res.advanced) res.issues.push('no progress after skip'); return res; });
  if (errs.length) r.issues.push('errs ' + errs.slice(0, 2).join(' | ')); if (r.issues.length) bad++;
  console.log(JSON.stringify(r)); await p.close();
}
console.log('SUMMARY', qual, 'bad', bad); await b.close();
