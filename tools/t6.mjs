// taps each touch button and checks the game reacts
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const ctx = await b.newContext({ viewport:{width:915,height:412}, hasTouch:true, isMobile:true });
const p = await ctx.newPage(); await p.goto('http://localhost:4181/?step=3&god'); await p.waitForTimeout(9000);
await p.evaluate(()=>{const g=window.__atq.game; for(let i=0;i<30;i++)g.skipLine?.(); g.zombies.forEach(z=>g.damageZ(z,9999,{}));});
const cdp = await ctx.newCDPSession(p);
async function tap(id, hold=150){ const r=await p.evaluate(id=>{const e=document.querySelector(id); if(!e||e.offsetParent===null) return null; const b=e.getBoundingClientRect(); return {x:b.x+b.width/2,y:b.y+b.height/2}},id); if(!r) return false;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x,y:r.y,id:7}]}); await p.waitForTimeout(hold); await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}); await p.waitForTimeout(400); return true; }
const G = f => p.evaluate(f);
const out=[];
let a=await G(()=>window.__atq.game.save.cur); await tap('#btnSwap'); let c=await G(()=>window.__atq.game.save.cur); out.push(`swap: ${a} -> ${c}`);
await G(()=>{const g=window.__atq.game; g.equip('rifle');}); await p.waitForTimeout(1500); a=await G(()=>{const g=window.__atq.game;return g.save.mags.rifle}); await tap('#tAtk',1500); c=await G(()=>window.__atq.game.save.mags.rifle); out.push(`fire (hold): mag ${a} -> ${c}`);
await tap('#tReload'); c=await G(()=>window.__atq.game.state.reload); out.push(`reload: state.reload=${(+c).toFixed(2)}`);
await p.waitForTimeout(2500);
a=await G(()=>window.__atq.game.state.aim); await tap('#tAim'); c=await G(()=>window.__atq.game.state.aim); out.push(`aim: ${a} -> ${c}`); await tap('#tAim');
await p.waitForTimeout(600); await tap('#tCrouch'); await p.waitForTimeout(600); c=await G(()=>window.__atq.game.state.crouch); out.push(`crouch: ${c}`); await tap('#tCrouch');
let y=0; await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:0,y:0,id:9}]}).catch(()=>{}); await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
const jr=await p.evaluate(()=>{const b=document.querySelector('#tJump').getBoundingClientRect();return{x:b.x+b.width/2,y:b.y+b.height/2}}); await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:jr.x,y:jr.y,id:8}]}); await p.waitForTimeout(250); y=await G(()=>Math.max(window.__atq.game.state.y,window.__atq.game.state.vy)); await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}); out.push(`jump: y=${y.toFixed(2)}`);
await p.waitForTimeout(800); await tap('#tRoll',60); c=await G(()=>window.__atq.game.state.roll); out.push(`roll: state.roll=${(+c).toFixed(2)}`);
a=await G(()=>window.__atq.game.save.grenades); await tap('#btnGren'); c=await G(()=>window.__atq.game.save.grenades); out.push(`grenade: ${a} -> ${c}`);
a=await G(()=>window.__atq.game.cam.fp); await tap('#btnView'); c=await G(()=>window.__atq.game.cam.fp); out.push(`view: fp ${a} -> ${c}`);
await tap('#tRun'); c=await G(()=>window.__atq.game.input.touchRun); out.push(`run toggle: ${c}`);
console.log(out.join('\n')); await b.close();
