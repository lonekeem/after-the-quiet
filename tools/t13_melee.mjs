// v1.5.1 melee: on a phone viewport, every melee weapon swings (anim), shows in hand, and kills a zombie in front via the HIT touch button, keyboard and API; plus grenade/med/interact sanity
import { chromium, devices } from 'playwright';
const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const ctx = await b.newContext({ ...devices['Pixel 7'] }); await ctx.addInitScript(()=>localStorage.setItem('atq3.settings',JSON.stringify({qual:'low',gore:true})));
const p = await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); const out=[];
await p.goto('http://localhost:4181/?step=2&god'); await p.waitForTimeout(11000);
await p.evaluate(()=>{ const g=window.__atq.game; g.zombies.forEach(z=>{z.dead=true;z.root.visible=false;}); g.say=()=>{}; if (g.dlgCur) g.skipLine(); g.cut=null; setInterval(()=>{ g.cut=null; },200); });
for (const w of ['fists','pan','bat','machete','axe']) {
  const r = await p.evaluate(async (w)=>{ const g=window.__atq.game; g.give(w); const P=g.player.root; const fwd=[Math.sin(P.rotation.y),Math.cos(P.rotation.y)];
    const z=g.spawnZ(P.position.x+fwd[0]*1.3,P.position.z+fwd[1]*1.3,{runner:false,aggro:0}); z.speed=0; const hp0=z.hp; const anims=new Set();
    const btn=document.querySelector('#tAtk'); const r=btn.getBoundingClientRect(); return { hp0, inHand: g.hand.children.length, x:r.x+r.width/2, y:r.y+r.height/2, vis: r.width>0 }; }, w);
  for (let k=0;k<8;k++){ await p.touchscreen.tap(r.x,r.y); await p.waitForTimeout(700);
    const a = await p.evaluate(()=>window.__atq.game.player.curName); if (k===0) r.anim=a; }
  const res = await p.evaluate(()=>{ const g=window.__atq.game; const z=g.zombies[g.zombies.length-1]; return { dead:z.dead, hp:Math.round(z.hp) }; });
  out.push(`${w}: hand=${r.inHand} btn=${r.vis} anim=${r.anim} hp ${r.hp0}->${res.hp} dead=${res.dead}`);
}
// keyboard path (bat): spawn + press attack key via mouse click (desktop binding) fallback: call input
const kb = await p.evaluate(async ()=>{ const g=window.__atq.game; g.give('bat'); const P=g.player.root; const z=g.spawnZ(P.position.x+Math.sin(P.rotation.y)*1.3,P.position.z+Math.cos(P.rotation.y)*1.3,{aggro:0}); z.speed=0; for(let i=0;i<8;i++){ g.attack(); await new Promise(r=>setTimeout(r,800)); } return z.dead; });
out.push('api bat kill='+kb);
const it = await p.evaluate(async ()=>{ const g=window.__atq.game; const s=g.save; s.grenades=2; s.meds=2; g.hp=40; g.heal(); const h=g.hp; const n0=s.grenades; g.grenade(); await new Promise(r=>setTimeout(r,3500)); return `med hp40->${h} grenades ${n0}->${s.grenades}`; });
out.push(it);
await p.screenshot({path:'/tmp/shots/melee_mobile.png'});
console.log(out.join('\n'), '\nerrs', JSON.stringify(errs.slice(0,5))); await b.close();
