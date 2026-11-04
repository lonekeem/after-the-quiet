import { chromium, devices } from 'playwright';
const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const ctx = await b.newContext({ ...devices['Pixel 7'] }); await ctx.addInitScript(()=>localStorage.setItem('atq3.settings',JSON.stringify({qual:'low',gore:true})));
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:4181/?step=13&god'); await p.waitForTimeout(12000); console.log('boot errs', JSON.stringify(errs));
const shots = { 13: 'ch3_route1', 16: 'ch3_boss', 18: 'ch4_tollplaza', 21: 'ch4_deacon', 23: 'ch5_mall', 26: 'ch5_santa', 28: 'ch6_fort', 30: 'ch6_tollking', 32: 'ch6_end' };
for (let i = 13; i <= 32; i++) {
  await p.evaluate(i => { const g = window.__atq.game; g.loadStep(i); }, i); await p.waitForTimeout(2500);
  const r = await p.evaluate(() => { const g = window.__atq.game; const st = g.step ?? g.stepI; return { obj: document.querySelector('#objt').textContent, z: g.alive().length, boss: !!g.boss, uses: (g.stepData.uses || []).length, zone: Object.keys(g.world.zones).filter(k => g.world.zones[k].visible) }; });
  // kill everything to exercise transitions
  await p.evaluate(() => { const g = window.__atq.game; g.alive().forEach(z => g.damageZ(z, 99999, z.root.position.clone().normalize(), {})); });
  console.log(i, JSON.stringify(r));
  if (shots[i]) { await p.evaluate(() => { const f = document.querySelector('#flash'); if (f) f.style.display = 'none'; }); await p.waitForTimeout(800); await p.screenshot({ path: '/tmp/shots/' + shots[i] + '.png' }); }
}
await p.waitForTimeout(9000); await p.evaluate(() => { const g = window.__atq.game; for (let k = 0; k < 12; k++) g.dlgCur && g.skipLine(); }); await p.waitForTimeout(4000);
console.log('end', await p.evaluate(() => document.querySelector('#endH').textContent + ' | ' + document.querySelector('#endNext').textContent + ' | ending visible ' + !document.querySelector('#ending').classList.contains('hidden')));
await p.screenshot({ path: '/tmp/shots/ch6_tbc_card.png' });
console.log('errs', JSON.stringify(errs.slice(0, 5))); await b.close();
