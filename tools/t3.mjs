import { chromium } from 'playwright';
const [,, step='0', name='s0', mode='land', waitMs='9000', extra=''] = process.argv;
const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
const vp = mode==='desk'?{width:1280,height:720}:mode==='port'?{width:412,height:915}:{width:915,height:412};
const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 1, hasTouch: mode!=='desk', isMobile: mode!=='desk' });
const p = await ctx.newPage(); const errs=[]; p.on('pageerror', e=>errs.push(e.message)); p.on('console', m=>{ if(m.type()==='error') errs.push(m.text()); });
await p.goto(`http://localhost:4181/?step=${step}${extra}`, { waitUntil: 'load' });
await p.waitForTimeout(+waitMs);
if (process.env.JS) { await p.evaluate(process.env.JS); await p.waitForTimeout(+(process.env.W2||2500)); }
await p.screenshot({ path: `/tmp/shots/${name}.png` });
console.log(JSON.stringify(await p.evaluate(()=>{const g=window.__atq.game; return g?{step:g.step,hp:g.hp,fps:g.fps,q:g.Q.name,z:g.zombies.length,pos:g.player.root.position.toArray().map(v=>+v.toFixed(1)),cut:!!g.cut}:null})), errs.slice(0,6));
await b.close();
