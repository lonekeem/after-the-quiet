import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
const OUT = process.env.SHOTS || '/workspace/after-the-quiet-shots'; fs.mkdirSync(OUT, { recursive: true });
const srv = spawn('npx', ['vite', 'preview', '--port', '4179', '--strictPort'], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 2500));
const URL = 'http://localhost:4179/';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required', '--enable-unsafe-swiftshader'] });
const errors = []; let ok = true;
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
try {
  await page.goto(URL); await page.waitForSelector('#btnWarn', { state: 'visible' });
  await page.screenshot({ path: `${OUT}/01-content-warning.png` });
  await page.click('#btnWarn'); await page.waitForTimeout(1500); await page.screenshot({ path: `${OUT}/02-studio-intro.png` });
  await page.waitForSelector('#title:not(.hidden)', { timeout: 10000 }); await page.waitForTimeout(1800);
  await page.screenshot({ path: `${OUT}/03-title.png` });
  await page.click('#btnChapters'); await page.waitForTimeout(400); await page.screenshot({ path: `${OUT}/04-chapter-select.png` });
  await page.click('[data-act=new]'); await page.waitForTimeout(6000);
  const st = await page.evaluate(() => ({ state: window.__atq.state, step: window.__atq.step }));
  console.log('after start:', st); if (st.state !== 'play') ok = false;
  await page.screenshot({ path: `${OUT}/05-ch1-opening.png` });
  for (const [step, name, ms] of [[1, '06-yard-day', 4000], [2, '07-main-street', 4000], [3, '08-evening', 3000], [5, '09-night-street', 7000], [7, '10-bridge-run', 6000]]) {
    const p2 = await browser.newPage({ viewport: { width: 1280, height: 720 } }); p2.on('pageerror', e => errors.push(e.message));
    await p2.goto(URL + '?step=' + step); await p2.waitForTimeout(ms); await p2.screenshot({ path: `${OUT}/${name}.png` }); await p2.close();
  }
} catch (e) { ok = false; console.error(e); }
console.log('errors:', errors); await browser.close(); srv.kill();
process.exit(ok && !errors.length ? 0 : 1);
