import { chromium, devices } from 'playwright';
const qual = process.argv[2] || 'low';
const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const ctx = await b.newContext({ ...devices['iPhone 13'] }); await ctx.addInitScript(q=>localStorage.setItem('atq3.settings',JSON.stringify({qual:q,gore:true})), qual);
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:4181/?step=12&god'); await p.waitForTimeout(12000);
await p.evaluate(() => { const g = window.__atq.game; g.player.root.position.set(0,0,-292); });
await p.waitForTimeout(500);
await p.evaluate(() => { const g = window.__atq.game; g.stepData.uses[0].fn(g); });
for (let k=0;k<20;k++){ await p.waitForTimeout(600); await p.evaluate(() => { const g = window.__atq.game; g.dlgCur && g.skipLine(); }); }
await p.waitForTimeout(3000);
console.log('ending', await p.evaluate(()=>!document.querySelector('#ending').classList.contains('hidden')));
await p.evaluate(()=>document.querySelector('#btnEndNext').click()); await p.waitForTimeout(5000);
const r = await p.evaluate(() => { const g = window.__atq.game; const P=g.player.root.position; return { step:g.step, pos:[P.x,P.z], wp:g.wpTarget, zones:Object.keys(g.world.zones).filter(k=>g.world.zones[k].visible), z:g.alive().length, obj:document.querySelector('#objt').textContent, wpTxt:document.querySelector('#wp')?.textContent, fog:g.scene.fog.density, paused:g.paused }; });
console.log(JSON.stringify(r)); await p.screenshot({path:'/tmp/shots/nat_c3_'+qual+'.png'}); console.log('errs', JSON.stringify(errs.slice(0,5))); await b.close();
