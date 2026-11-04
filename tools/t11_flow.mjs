// v1.4 start-to-bridge flow: New Game from title, then each story step up to the bridge loads and runs without page errors
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const ctx = await b.newContext({ viewport:{width:960,height:540} }); await ctx.addInitScript(()=>localStorage.setItem('atq3.settings',JSON.stringify({qual:'low',gore:true})));
const p = await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); const out=[];
await p.goto('http://localhost:4181/'); await p.waitForTimeout(5000);
await p.evaluate(()=>{ document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden')); document.querySelector('#title').classList.remove('hidden'); });
await p.click('#btnNew',{force:true}); await p.waitForTimeout(3000); await p.evaluate(()=>document.querySelector('#warning:not(.hidden) button')?.click()); await p.waitForTimeout(9000);
out.push('new:'+await p.evaluate(()=>!!window.__atq?.game?.player));
for (const s of [1,2,3,4,5]) { await p.goto(`http://localhost:4181/?step=${s}&god`); await p.waitForTimeout(9000);
  out.push(s+':'+await p.evaluate(()=>{ const g=window.__atq.game; const t0=g.t; return (g.player?'ok':'noplayer')+'/'+(document.querySelector('#obj')?.textContent||'').slice(0,40); })); }
await p.screenshot({path:'/tmp/shots/flow_bridge.png',timeout:120000});
console.log(out.join(' | '), 'errs', JSON.stringify(errs.slice(0,5))); await b.close();
