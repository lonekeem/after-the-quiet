import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const ctx=await b.newContext({ viewport:{width:960,height:540} }); await ctx.addInitScript(()=>localStorage.setItem('atq3.settings',JSON.stringify({qual:'low',gore:true}))); const p = await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('http://localhost:4181/?step=3&god'); await p.waitForTimeout(10000);
const r = await p.evaluate(()=>{const g=window.__atq.game; for(let i=0;i<30;i++)g.skipLine?.(); g.zombies.forEach(z=>g.damageZ(z,9999,{}));
 const P=g.player.root.position; const keys=['keem','marcus','nia','walt','ruth','dube','gus']; const out=[];
 keys.forEach((k,i)=>{const c=g.npc('L'+k,k,P.x-3+i*1.0,P.z+3,Math.PI,'Idle_Loop',k==='nia'?.62:k==='keem'?.9:.98); c.root.rotation.y=0; out.push(k+':'+(c.parts||[]).length+':'+c.root.rotation.y.toFixed(2));});
 for(let i=0;i<5;i++){const z=g.spawnZ(P.x-2.5+i*1.2,P.z+6,{idle:true}); z.st='idle'; z.rotation=0; z.root.rotation.y=Math.PI;}
 g.player.root.visible=false; g.__shotCam=[P.x,1.5,P.z-1.2,P.x,1.1,P.z+4]; return out.join(' ');});
await p.evaluate(()=>{const g=window.__atq.game; const s=g.__shotCam; const orig=g.render?.bind(g); g.cut={cam:new g.player.root.position.constructor(s[0],s[1],s[2]),look:new g.player.root.position.constructor(s[3],s[4],s[5]),anim:'Idle_Loop'};});
await p.waitForTimeout(2500); await p.screenshot({path:'/tmp/shots/cast.png',timeout:120000});
await p.evaluate(()=>{const g=window.__atq.game; const P=g.player.root.position; const n=g.npcs.Lkeem.root.position; g.cut.cam.set(n.x+0.25,1.45,n.z-0.75); g.cut.look.set(n.x,1.45,n.z);});
await p.waitForTimeout(1500); await p.screenshot({path:'/tmp/shots/keem_face.png',timeout:120000});
for (const [k,dz,nm] of [['Lkeem',0.75,'keem_front'],['Lmarcus',0.8,'dad_front'],['Lnia',0.6,'nia_front'],['Lwalt',0.8,'walt_front']]) { await p.evaluate(([k,dz])=>{const g=window.__atq.game; const n=g.npcs[k].root.position; const hy=k==='Lnia'?1.0:1.45; g.cut.cam.set(n.x+0.2,hy,n.z+dz); g.cut.look.set(n.x,hy-0.05,n.z);},[k,dz]); await p.waitForTimeout(1200); await p.screenshot({path:'/tmp/shots/'+nm+'.png',timeout:120000}); }
console.log(r, errs.slice(0,5)); await b.close();
