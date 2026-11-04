import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
for (const [vw,vh,tag] of [[390,844,'p'],[844,390,'l']]) {
const ctx = await b.newContext({ viewport:{width:vw,height:vh}, isMobile:true, hasTouch:true, deviceScaleFactor:1 }); await ctx.addInitScript(()=>localStorage.setItem('atq3.settings',JSON.stringify({qual:'low',gore:true})));
const p = await ctx.newPage(); p.on('pageerror',e=>console.log('ERR',e.message)); await p.goto('http://localhost:4181/?step=1&god'); await p.waitForTimeout(10000);
await p.evaluate(()=>{const g=window.__atq.game; const P=g.player.root.position; const V=P.constructor; for(const [k,x] of [['keem',-1.5],['nia',0],['marcus',3]]){const c=g.npc('L'+k,k,P.x+x,P.z+4,0,'Idle_Loop',k==='nia'?.62:k==='keem'?.9:.98); c.root.rotation.y=0; c.update=null;} g.zombies.forEach(z=>{z.root.position.y=-50; z.hp=0;}); setInterval(()=>{for(const k of ['Lkeem','Lnia','Lmarcus']){const n=g.npcs[k]; if(n){n.root.rotation.y=0; if(n.head) n.head.rotation.set(0,0,0);}}},16); g.cut={cam:new V(),look:new V(),anim:'Idle_Loop'};});
const fwd = async (k,d,hy,ly,nm)=>{ await p.evaluate(([k,d,hy,ly])=>{const g=window.__atq.game; const c=g.npcs[k]; const n=c.root.position, r=0; g.cut.cam.set(n.x+Math.sin(r)*d,hy,n.z+Math.cos(r)*d); g.cut.look.set(n.x,ly,n.z);},[k,d,hy,ly]); await p.waitForTimeout(2500); await p.screenshot({path:`/tmp/shots/${nm}_${tag}.png`}); };
await fwd('Lkeem',2.2,1.2,0.95,'keem_body'); await fwd('Lkeem',0.6,1.45,1.42,'keem_face');
await fwd('Lnia',0.45,1.02,1.0,'nia_face'); await fwd('Lmarcus',0.6,1.58,1.55,'dad_face'); await fwd('Lmarcus',2.2,1.2,0.95,'dad_body');
await ctx.close(); }
await b.close();
