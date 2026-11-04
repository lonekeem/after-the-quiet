// v1.3.2 audio check: samples load, voices play for dialogue, settings toggles exist, no page errors
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage(); const errs=[]; p.on('pageerror', e=>errs.push(e.message)); const bad=[]; p.on('response', r=>{ if(r.url().includes('/sfx/') && r.status()>=400) bad.push(r.url()); });
await p.goto('http://localhost:4181/?step=0&god'); await p.waitForTimeout(12000);
const r = await p.evaluate(async()=>{ const g=window.__atq.game, a=g.audio; a.init(); await new Promise(r=>setTimeout(r,6000));
  const out={bufs:Object.keys(a.bufs).length, dlg:!!g.dlgCur, who:g.dlgCur?.who};
  const d = await a.voice('keem','Is that… screaming?'); out.voiceDur=d; a.shout('keem_reload',true); a.reload(); a.shot('rifle'); a.groan(.1); a.eat(.3); a.step('grass'); a.thunder(); a.rain(true); a.engine(true,.5); a.engine(false); a.victimScream(.12); a.roar(); a.explode();
  await new Promise(r=>setTimeout(r,2500)); out.bufs2=Object.keys(a.bufs).length; out.rain=!!a.rainSrc;
  out.ui=['#sSfx','#sVoiceVol','#sVoices'].map(s=>!!document.querySelector(s)); return out; });
console.log(JSON.stringify(r), 'bad', bad, 'errs', errs.slice(0,4)); await b.close();
