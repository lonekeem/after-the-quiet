// Asserts joystick / WASD / gamepad move Keem camera-relative (up = camera forward, right = camera right)
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const ctx = await b.newContext({ viewport:{width:915,height:412}, hasTouch:true, isMobile:true });
const p = await ctx.newPage(); const errs=[]; p.on('pageerror', e=>errs.push(e.message));
await p.addInitScript(()=>{ window.__pad=null; const o=navigator.getGamepads?.bind(navigator); navigator.getGamepads=()=>window.__pad?[window.__pad]:(o?o():[]); });
await p.goto('http://localhost:4181/?step=3&god'); await p.waitForTimeout(9000);
await p.evaluate(()=>{const g=window.__atq.game; for(let i=0;i<30;i++)g.skipLine?.(); g.zombies.forEach(z=>g.damageZ(z,9999,{})); });
const cdp = await ctx.newCDPSession(p);
const state = () => p.evaluate(()=>{const g=window.__atq.game,P=g.player.root.position,y=g.cam.yaw; return {x:P.x,z:P.z,fx:-Math.sin(y),fz:-Math.cos(y),rx:Math.cos(y),rz:-Math.sin(y)}});
const reset = () => p.evaluate(()=>{const g=window.__atq.game; g.player.root.position.set(-6.5,0,-28); g.cam.yaw=0.7;});
const zone = await p.evaluate(()=>{const r=document.querySelector('#stickBase').getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}});
const results=[]; let fail=0;
async function check(name, dir, act){ await reset(); await p.waitForTimeout(300); const a=await state(); await act(); const c=await state();
  const dx=c.x-a.x, dz=c.z-a.z, L=Math.hypot(dx,dz)||1; const fwd=(dx*a.fx+dz*a.fz)/L, rgt=(dx*a.rx+dz*a.rz)/L;
  const want={up:[1,0],down:[-1,0],left:[0,-1],right:[0,1]}[dir]; const ok=L>0.3&&fwd*want[0]+rgt*want[1]>0.8; if(!ok)fail++;
  results.push(`${ok?'PASS':'FAIL'} ${name} ${dir}: moved ${L.toFixed(2)}m fwd=${fwd.toFixed(2)} right=${rgt.toFixed(2)}`); }
const D={up:[0,-50],down:[0,50],left:[-50,0],right:[50,0]};
for (const dir of ['up','down','left','right']) {
  await check('touch',dir,async()=>{ const [ox,oy]=D[dir]; await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:zone.x,y:zone.y,id:1}]});
    for(let i=1;i<=5;i++) await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:zone.x+ox*i/5,y:zone.y+oy*i/5,id:1}]});
    await p.waitForTimeout(1500); await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}); await p.waitForTimeout(200);});
  const key={up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD'}[dir];
  await check('keyboard',dir,async()=>{ await p.keyboard.down(key); await p.waitForTimeout(1500); await p.keyboard.up(key); await p.waitForTimeout(200);});
  await check('gamepad',dir,async()=>{ const ax=[D[dir][0]/50,D[dir][1]/50,0,0]; await p.evaluate(ax=>{window.__pad={connected:true,mapping:'standard',axes:ax,buttons:Array.from({length:17},()=>({pressed:false,value:0}))}},ax); await p.waitForTimeout(1500); await p.evaluate(()=>{window.__pad=null}); await p.waitForTimeout(200);});
}
// aim: crosshair (screen centre) ray should hit a zombie placed in front of the camera
const aim = await p.evaluate(async()=>{const g=window.__atq.game; g.give?.('rifle'); g.equip?.('rifle'); g.state.aim=true; await new Promise(r=>setTimeout(r,600));
  g.camera.updateMatrixWorld(); const ray=g.aimRay(); const P=ray.origin.clone().addScaledVector(ray.direction,7); const z=g.spawnZ(P.x,P.z,{idle:true}); z.root.position.y=0; const sp=g.ws.spread; g.ws.spread=0;
  await new Promise(r=>setTimeout(r,500)); const X=document.querySelector('#xhair').getBoundingClientRect(); const hp0=z.hp; let n=0; for(let i=0;i<6&&!z.dead;i++){g.state.fireCd=0;g.state.reload=0;g.fire();n++;} g.ws.spread=sp; return {before:hp0, after:z.hp, dead:!!z.dead, shots:n, xh:[Math.round(X.left+X.width/2),Math.round(X.top+X.height/2)]};});
results.push(`aim/fire at crosshair: zombie hp ${aim.before} -> ${aim.after} dead=${aim.dead}`);
await p.screenshot({path:'/tmp/shots/v131.png'});
console.log(results.join('\n')); console.log('FAILS', fail, errs.slice(0,4)); await b.close();
