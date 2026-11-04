// truck escape drivability test: autopilot with on-screen GAS / ◀ ▶ buttons state
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const ctx=await b.newContext({ viewport:{width:915,height:412}, hasTouch:true, isMobile:true }); await ctx.addInitScript(()=>localStorage.setItem('atq3.settings',JSON.stringify({qual:'low',gore:true})));
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:4181/?step=4&god'); await p.waitForTimeout(9000);
await p.evaluate(async()=>{const g=window.__atq.game; for(let k=0;k<20&&!g.stepData.canDrive;k++){for(let i=0;i<30;i++)g.skipLine?.(); g.cut=null; await new Promise(r=>setTimeout(r,500));} g.player.root.position.set(20,0,-64); g.enterTruck();});
await p.waitForTimeout(1500); await p.screenshot({path:'/tmp/shots/drive_hud.png',timeout:120000});
const tap=async(id,ms)=>{const r=await p.evaluate(id=>{const b=document.querySelector(id).getBoundingClientRect();return{x:b.x+b.width/2,y:b.y+b.height/2}},id); await p.touchscreen.tap(r.x,r.y);};
const res=await p.evaluate(async()=>{const g=window.__atq.game, T=g.truck; const log=[]; const t0=performance.now(); let gt=0, hits=0; const tgt=[[8,-72],[0,-90]]; let wi=0;
 while(performance.now()-t0<150000){ const P=T.g.position; const w=tgt[wi]; if(Math.hypot(w[0]-P.x,w[1]-P.z)<5&&wi<tgt.length-1)wi++; const want=Math.atan2(w[0]-P.x,w[1]-P.z); let d=((want-T.head+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;
  g.drv={gas:true, l:d>0.08, r:d<-0.08}; await new Promise(r=>setTimeout(r,100)); if(P.z<-88){break;} if(Math.abs(T.v)<1&&performance.now()-t0>8000)hits++; }
 return {z:T.g.position.z.toFixed(1),x:T.g.position.x.toFixed(1),v:T.v.toFixed(1),secs:((performance.now()-t0)/1000).toFixed(0),stuckTicks:hits,obj:document.querySelector('#obj')?.textContent?.slice(0,60)};});
await p.screenshot({path:'/tmp/shots/drive_end.png',timeout:120000});
console.log(JSON.stringify(res), errs.slice(0,3)); await b.close();
