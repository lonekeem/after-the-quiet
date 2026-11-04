import { chromium } from 'playwright';
const [,, port='4181', q='low', steps='0,5,10,16,22,28,34,40,45,48,50,53'] = process.argv;
const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
const out = {};
for (const s of steps.split(',')) {
  const ctx = await b.newContext({ viewport: {width:915,height:412}, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  await ctx.addInitScript(q => localStorage.setItem('atq3.settings', JSON.stringify({ qual: q, gore: true })), q); const p = await ctx.newPage();
  await p.goto(`http://localhost:${port}/?step=${s}&god`, { waitUntil: 'load' }); await p.waitForTimeout(9000);
  const f = []; for (let i = 0; i < 6; i++) { await p.waitForTimeout(1000); f.push(await p.evaluate(() => window.__atq.game ? window.__atq.game.fps : 0)); }
  out[s] = +(f.reduce((a, c) => a + c, 0) / f.length).toFixed(1); await ctx.close();
}
const v = Object.values(out); console.log(JSON.stringify({ port, q, out, avg: +(v.reduce((a, c) => a + c, 0) / v.length).toFixed(1) }));
await b.close();
