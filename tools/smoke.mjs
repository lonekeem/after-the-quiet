import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
const OUT = process.env.SHOTS || '/workspace/after-the-quiet-shots/v2'; fs.mkdirSync(OUT, { recursive: true });
const srv = spawn('npx', ['vite', 'preview', '--port', '4179', '--strictPort'], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 2500));
const URL = 'http://localhost:4179/';
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const errors = []; let ok = true;
const mk = async () => { const p = await browser.newPage({ viewport: { width: 1280, height: 720 } }); p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) errors.push(m.text()); }); return p; };
const st = p => p.evaluate(() => ({ state: window.__atq.state, scene: window.__atq.sceneId, inv: window.__atq.inv }));
try {
  const page = await mk();
  await page.goto(URL); await page.waitForSelector('#btnWarn', { state: 'visible' });
  await page.screenshot({ path: `${OUT}/01-content-warning.png` });
  await page.click('#btnWarn'); await page.waitForTimeout(1500); await page.screenshot({ path: `${OUT}/02-studio-intro.png` });
  await page.waitForSelector('#title:not(.hidden)', { timeout: 10000 }); await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/03-title.png` });
  await page.click('#btnChapters'); await page.waitForTimeout(300); await page.screenshot({ path: `${OUT}/04-chapter-select.png` });
  await page.click('[data-act=new]'); await page.waitForTimeout(9000);
  console.log('trailer:', await st(page)); await page.screenshot({ path: `${OUT}/05-cold-open.png` });
  await page.keyboard.press('Space'); await page.waitForTimeout(11000); // skip trailer -> black cut -> bedroom
  let s = await st(page); console.log('after skip:', s); if (s.scene !== 'bedroom') ok = false;
  // advance narration, then pick up sketchbook hotspot
  for (let k = 0; k < 10 && !(await page.$('.hot')); k++) { if (await page.$('#tut')) await page.screenshot({ path: `${OUT}/06a-tutorial.png` }); await page.keyboard.press('Space'); await page.waitForTimeout(1500); }
  await page.screenshot({ path: `${OUT}/06-bedroom-hotspots.png` });
  await page.click('.hot >> nth=0', { force: true }); for (let k = 0; k < 3; k++) { await page.waitForTimeout(1500); await page.keyboard.press('Space'); }
  await page.waitForTimeout(3000); s = await st(page); console.log('after hotspot:', s); if (!s.inv.includes('sketchbook')) ok = false;
  // dialogue choice scene
  const p2 = await mk(); await p2.goto(URL + '?id=kitchen'); await p2.waitForTimeout(2500);
  for (let k = 0; k < 10 && !(await p2.$('#choices button')); k++) { await p2.keyboard.press('Space'); await p2.waitForTimeout(1200); }
  await p2.screenshot({ path: `${OUT}/07-kitchen-choice.png` }); if (!(await p2.$('#choices button'))) ok = false;
  await p2.keyboard.press('2'); await p2.waitForTimeout(800); await p2.screenshot({ path: `${OUT}/08-dialogue.png` });
  // QTE scene
  const p3 = await mk(); await p3.goto(URL + '?id=dadfight'); await p3.waitForTimeout(1500);
  for (let k = 0; k < 8 && !(await p3.$('#qte:not(.hidden)')); k++) { await p3.keyboard.press('Space'); await p3.waitForTimeout(1000); }
  await p3.waitForSelector('#qte:not(.hidden)', { timeout: 8000 }); await p3.screenshot({ path: `${OUT}/09-qte.png` });
  for (let k = 0; k < 25; k++) { await p3.keyboard.press('Space'); await p3.waitForTimeout(60); }
  await p3.waitForTimeout(1500); console.log('after mash:', await st(p3));
  for (const [id, n, w] of [['streetlife', '12-living-street', 9000], ['falls', '13-town-falls', 6000], ['pell', '14-tough-choice', 16000], ['undercar', '15-hiding', 6000], ['church', '16-church-horde', 6000]]) {
    const pp = await mk(); await pp.goto(URL + '?id=' + id); await pp.waitForTimeout(w); await pp.screenshot({ path: `${OUT}/${n}.png` }); await pp.close(); }
  const p4 = await mk(); await p4.goto(URL + '?id=hold'); await p4.waitForTimeout(4500); await p4.screenshot({ path: `${OUT}/10-bridge.png` });
  const p5 = await mk(); await p5.goto(URL + '?id=momgoodbye'); await p5.waitForTimeout(4500); await p5.screenshot({ path: `${OUT}/11-mom-goodbye.png` });
} catch (e) { ok = false; console.error(e); }
console.log('errors:', errors); await browser.close(); srv.kill();
process.exit(ok && !errors.length ? 0 : 1);
