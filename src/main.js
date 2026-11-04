import { AudioSys } from './audio.js';
import { WEAPONS, WEAPON_ORDER, UPGRADES, upCost, AMMO_SHOP, PERKS, xpFor, defaultSave, loadSave, writeSave, clearSave, stat } from './game/data.js';
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const DEF = { vol: 0.9, auto: true, music: 0.6, text: 1, subs: true, gore: true, qteEasy: false, still: false, hints: true, qual: 'auto', sens: 1, fp: false, sfxVol: 1, voiceVol: 1, voices: true };
const LS = (() => { try { const k = '__t'; localStorage.setItem(k, 1); localStorage.removeItem(k); return localStorage; } catch { const m = {}; return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; } }; } })();
let _saved = {}; try { _saved = JSON.parse(LS.getItem('atq3.settings') || '{}') || {}; } catch {}
const S = Object.assign({}, DEF, _saved); const saveS = () => LS.setItem('atq3.settings', JSON.stringify(S));
const audio = new AudioSys(S);
let save = loadSave(LS) || defaultSave(); let game = null, gamePromise = null; let state = 'boot', back = '#title';
window.__atq = { get game() { return game; }, get state() { return state; }, get save() { return save; } };

function showScreen(id) { $$('.screen').forEach(s => s.classList.add('hidden')); if (id) $(id).classList.remove('hidden'); }
function fadeIn() { $('#fade').style.opacity = 0; }
function toTitle() { state = 'title'; if (game) { game.paused = true; } $('#stage').classList.add('hidden'); $('#hud').classList.add('hidden'); $('#touch').classList.add('hidden'); audio.beat && audio.beat(0); audio.setMood('menu'); save = loadSave(LS) || save; $('#btnContinue').classList.toggle('hidden', !(loadSave(LS) && !loadSave(LS).done && loadSave(LS).step > 0)); showScreen('#title'); back = '#title'; }

async function ensureGame() { if (game) return game; if (gamePromise) return gamePromise;
  $('#loading').classList.remove('hidden'); const qs = ['Board the windows.', 'Headshots save ammo.', 'Crouch to sneak past feeders.', 'Loot cash and spend it in the Armory.', 'Roll through attacks.'];
  $('#loading .lq').textContent = 'Tip: ' + qs[(Math.random() * qs.length) | 0];
  gamePromise = (async () => { const { Game } = await import('./game/game.js'); const g = new Game({ settings: S, audio, LS, save });
    await g.load(p => { $('#loading .lb i').style.width = Math.round(p * 100) + '%'; });
    g.onDeath = () => { state = 'dead'; $('#deadMsg').textContent = ['They got you.', 'Keem didn\'t make it.', 'Torn apart in Riverside.', 'Should\'ve rolled.'][(Math.random() * 4) | 0]; showScreen('#dead'); };
    g.onPause = () => { if (state === 'play') pause(); else if (state === 'paused') resume(); };
    g.onComplete = () => { save.done = true; writeSave(LS, save); state = 'ending'; g.paused = true; $('#endStats').innerHTML = `Kills: ${save.kills} · Level ${save.level} · Cash $${save.cash} · Comic pages ${save.pages.length}/8`; showScreen('#ending'); audio.setMood('sad'); };
    game = g; $('#loading').classList.add('hidden'); return g; })();
  return gamePromise; }
async function play(step) { showScreen(null); $('#stage').classList.remove('hidden'); state = 'loading'; const g = await ensureGame(); g.save = save; g.settings = S; state = 'play'; audio.init(); $('#hud').classList.remove('hidden'); $('#touch').classList.toggle('hidden', !(matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window)); g.start(step); }
function pause() { if (state !== 'play' || !game) return; state = 'paused'; game.paused = true; if (document.pointerLockElement) document.exitPointerLock(); writeSave(LS, save); showScreen('#pause'); back = '#pause'; }
function resume() { state = 'play'; showScreen(null); if (game) { game.paused = false; game.last = performance.now(); } }
addEventListener('keydown', e => { audio.init(); if ((e.key === 'Escape' || e.key === 'p' || e.key === 'P') && state !== 'play') { if (state === 'paused') resume(); else if (['shop', 'inv', 'settings'].includes(state) && back === '#pause') { state = 'paused'; showScreen('#pause'); } }
  if ((e.key === 'i' || e.key === 'I' || e.key === 'Tab') && state === 'play') { e.preventDefault(); pause(); openInv(); } });
addEventListener('pointerdown', () => audio.init());
document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'play') pause(); });

// ---------- shop ----------
let shopTab = 'guns';
function openShop() { state = 'shop'; renderShop(); showScreen('#shop'); }
function renderShop() { $('#shopCash').textContent = `Cash: $${save.cash}  ·  Level ${save.level}`;
  const tabs = [['guns', 'Guns'], ['melee', 'Melee'], ['up', 'Upgrades'], ['sup', 'Ammo & supplies']]; $('#shopTabs').innerHTML = ''; tabs.forEach(([k, n]) => { const b = document.createElement('button'); b.textContent = n; b.className = shopTab === k ? 'on' : ''; b.onclick = () => { shopTab = k; renderShop(); }; $('#shopTabs').appendChild(b); });
  const L = $('#shopList'); L.innerHTML = ''; const card = (html, btns, eq) => { const d = document.createElement('div'); d.className = 'gi' + (eq ? ' eq' : ''); d.innerHTML = html; btns.forEach(([t, fn, dis]) => { const b = document.createElement('button'); b.textContent = t; b.disabled = !!dis; b.onclick = () => { fn(); writeSave(LS, save); audio.pickup(); renderShop(); }; d.appendChild(b); }); L.appendChild(d); };
  const buy = (n) => { if (save.cash < n) return false; save.cash -= n; return true; };
  if (shopTab === 'guns' || shopTab === 'melee') WEAPON_ORDER.filter(id => (WEAPONS[id].type === 'gun') === (shopTab === 'guns') && id !== 'fists').forEach(id => { const w = WEAPONS[id], s = stat(save, id), own = save.owned.includes(id);
    const st = w.type === 'gun' ? `DMG ${Math.round(s.dmg)}${w.pellets ? '×' + w.pellets : ''} · MAG ${s.mag} · RLD ${s.reload.toFixed(1)}s · ${w.auto ? 'auto' : 'semi'}` : `DMG ${Math.round(s.dmg)} · ${w.sever ? 'can sever limbs' : 'blunt'}${w.bonk ? ' · BONK' : ''}`;
    const btns = own ? [[save.cur === id ? 'Equipped' : 'Equip', () => { save.cur = id; if (game && state !== 'title') game.equip(id, true); }, save.cur === id]] : [[w.price ? `Buy $${w.price}` : 'Story unlock', () => { if (buy(w.price)) { save.owned.push(id); if (w.type === 'gun') save.mags[id] = s.mag; } }, !w.price || save.cash < w.price]];
    card(`<b>${w.name}</b><div class="st">${st}</div><div class="small">${w.desc || ''}</div>`, btns, save.cur === id); });
  if (shopTab === 'up') { const owned = WEAPON_ORDER.filter(id => save.owned.includes(id) && id !== 'fists'); if (!owned.length) L.innerHTML = '<p class="small">Find or buy a weapon first.</p>';
    owned.forEach(id => { const w = WEAPONS[id]; const u = save.up[id] = save.up[id] || {}; const keys = w.type === 'gun' ? ['dmg', 'mag', 'rel', 'acc'] : ['dmg'];
      card(`<b>${w.name}</b><div class="st">${keys.map(k => `${UPGRADES[k].name} ${u[k] || 0}/${UPGRADES[k].max}`).join(' · ')}</div>`, keys.map(k => { const lv = u[k] || 0, c = upCost(id, k, lv); return [lv >= UPGRADES[k].max ? `${UPGRADES[k].name} MAX` : `${UPGRADES[k].name} $${c}`, () => { if (buy(c)) { u[k] = lv + 1; if (game) game.ws = stat(save, save.cur); } }, lv >= UPGRADES[k].max || save.cash < c]; })); }); }
  if (shopTab === 'sup') Object.entries(AMMO_SHOP).forEach(([k, a]) => { const have = k === 'grenade' ? save.grenades : k === 'med' ? save.meds : save.ammo[k] || 0;
    card(`<b>${a.name}</b><div class="st">You have: ${have}</div>`, [[`Buy $${a.price}`, () => { if (buy(a.price)) { if (k === 'grenade') save.grenades += a.n; else if (k === 'med') save.meds += a.n; else save.ammo[k] = (save.ammo[k] || 0) + a.n; } }, save.cash < a.price]]); }); }
// ---------- inventory ----------
function openInv() { state = 'inv'; renderInv(); showScreen('#inv'); }
function renderInv() { const s = save; const need = xpFor(s.level);
  $('#invStats').innerHTML = `Level ${s.level} · XP ${s.xp}/${need} · Cash $${s.cash} · Kills ${s.kills} · Comic pages ${s.pages.length}/8`;
  const L = $('#invList'); L.innerHTML = ''; const add = (h, btns = [], eq) => { const d = document.createElement('div'); d.className = 'gi' + (eq ? ' eq' : ''); d.innerHTML = h; btns.forEach(([t, fn]) => { const b = document.createElement('button'); b.textContent = t; b.onclick = () => { fn(); writeSave(LS, save); renderInv(); }; d.appendChild(b); }); L.appendChild(d); };
  WEAPON_ORDER.filter(id => s.owned.includes(id)).forEach(id => { const w = WEAPONS[id]; add(`<b>${w.name}</b><div class="st">${w.type === 'gun' ? `Mag ${s.mags[id] ?? 0} · Reserve ${s.ammo[w.ammo] || 0} ${w.ammo}` : 'Melee'}</div>`, s.cur === id ? [] : [['Equip', () => { s.cur = id; if (game) game.equip(id, true); }]], s.cur === id); });
  add(`<b>Supplies</b><div class="st">Med kits ${s.meds} · Pipe grenades ${s.grenades}<br>9mm/.44 ${s.ammo.light || 0} · Shells ${s.ammo.shell || 0} · Rifle ${s.ammo.rifle || 0}</div>`, s.meds && game && back === '#pause' ? [['Use med kit (+50 HP)', () => game.heal()]] : []);
  add(`<b>Gear</b><div class="st">${s.items.includes('backpack') ? 'Backpack ✔' : 'No backpack yet'}</div>`);
  add(`<b>Perks</b><div class="st">${PERKS.map((p, i) => p ? `${s.level >= i ? '✔' : '🔒'} Lv${i} ${p.name}: ${p.desc}` : '').filter(Boolean).join('<br>')}</div>`);
  add(`<b>Collectibles</b><div class="st">${s.pages.length ? s.pages.length + ' Captain Riverside comic pages found' : 'Find the 8 Captain Riverside comic pages hidden around town.'}</div>`); }

// ---------- buttons ----------
$$('.back').forEach(b => b.onclick = () => { if (back === '#pause') { state = 'paused'; showScreen('#pause'); return; } state = 'title'; showScreen('#title'); });
$('#btnWarn').onclick = async () => { try { audio.init(); audio.sting(); } catch (e) {} showScreen(null); $('#studio').classList.remove('hidden'); fadeIn(); ensureGame().catch(e => console.error(e)); $('#loading').classList.add('hidden');
  await Promise.race([sleep(4200), new Promise(r => addEventListener('keydown', r, { once: true }))]); $('#studio').classList.add('hidden'); toTitle(); };
$('#btnNew').onclick = () => { if (loadSave(LS) && loadSave(LS).step > 0 && !confirm('Start a new game? Your current progress (level, cash, weapons) will be reset.')) return; clearSave(LS); save = defaultSave(); writeSave(LS, save); play(0); };
$('#btnContinue').onclick = () => { save = loadSave(LS) || defaultSave(); play(save.step); };
$('#btnArmory').onclick = () => { back = '#title'; openShop(); }; $('#btnInvT').onclick = () => { back = '#title'; openInv(); };
$('#btnPShop').onclick = () => { back = '#pause'; openShop(); }; $('#btnPInv').onclick = () => { back = '#pause'; openInv(); };
$('#btnSettings').onclick = () => { back = '#title'; state = 'settings'; showScreen('#settings'); }; $('#btnControls').onclick = () => showScreen('#controls'); $('#btnCredits').onclick = () => showScreen('#credits');
$('#btnPauseSettings').onclick = () => { back = '#pause'; state = 'settings'; showScreen('#settings'); };
$('#btnResume').onclick = resume; $('#btnPause').onclick = e => { e.stopPropagation(); pause(); };
$('#btnRestartCp').onclick = () => { resume(); game.loadStep(game.step); };
$('#btnQuit').onclick = () => { writeSave(LS, save); toTitle(); };
$('#btnRetry').onclick = () => { showScreen(null); state = 'play'; save = loadSave(LS) || save; game.save = save; game.paused = false; game.last = performance.now(); game.loadStep(save.step); };
$('#btnDeadQuit').onclick = toTitle; $('#btnEndTitle').onclick = toTitle;
// ---------- settings ----------
const bindS = (id, k, kind) => { const el = $(id); if (!el) return; if (kind === 'chk') { el.checked = !!S[k]; el.onchange = () => { S[k] = el.checked; saveS(); applyS(k); }; } else if (kind === 'sel') { el.value = S[k]; el.onchange = () => { S[k] = el.value; saveS(); applyS(k); }; } else { el.value = S[k]; el.oninput = () => { S[k] = +el.value; saveS(); applyS(k); }; } };
function applyS(k) { audio.applyVolumes(); document.body.classList.toggle('still', S.still); if (game && k === 'fp') game.cam.fp = S.fp; if (k === 'qual' && game) game.toast?.('Quality change applies after reloading the app', 2.5); }
bindS('#sVol', 'vol'); bindS('#sMusic', 'music'); bindS('#sSfx', 'sfxVol'); bindS('#sVoiceVol', 'voiceVol'); bindS('#sVoices', 'voices', 'chk'); bindS('#sText', 'text'); bindS('#sAuto', 'auto', 'chk'); bindS('#sGore', 'gore', 'chk'); bindS('#sQte', 'qteEasy', 'chk'); bindS('#sMotion', 'still', 'chk'); bindS('#sHints', 'hints', 'chk');
bindS('#sQual', 'qual', 'sel'); bindS('#sSens', 'sens'); bindS('#sFP', 'fp', 'chk'); applyS();
// boot
document.body.dataset.dev = 'ontouchstart' in window ? 'touch' : 'kbd'; fadeIn();
const qs = new URLSearchParams(location.search);
if (qs.has('step')) { $('#warning').classList.add('hidden'); save = defaultSave(); if (qs.has('god')) Object.assign(save, { owned: ['fists', 'bat', 'pistol', 'rifle', 'shotgun'], items: ['backpack'], ammo: { light: 99, shell: 30, rifle: 200 }, grenades: 3, cash: 2000, cur: 'rifle' }); play(+qs.get('step')); }
window.__atqBooted = true;
// (title background image removed in v1.3.1)
