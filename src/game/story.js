import * as THREE from 'three';
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const PI = Math.PI;
const dist2 = (g, x, z) => Math.hypot(g.player.root.position.x - x, g.player.root.position.z - z);
function follow(g, n, off) { n.update = (dt) => { const P = g.player.root.position, p = n.root.position; const tx = P.x + off[0], tz = P.z + off[1]; const dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz);
  if (d > 1.2) { const sp = Math.min(d, 1) * (d > 4 ? 5 : 2.8); p.x += dx / d * sp * dt; p.z += dz / d * sp * dt; n.root.rotation.y = Math.atan2(dx, dz); n.play(d > 4 ? 'Jog_Fwd_Loop' : 'Walk_Loop'); } else n.play('Idle_Loop'); }; }
function goto(g, i, xp = 100) { g.addXP(xp); g.audio.pickup(); setTimeout(() => g.loadStep(i), 50); }

// Chapter 1 — The Day Before … it ends. Opens at night in Keem's boarded-up house in Riverside, Maine.
export const STORY = [
  { id: 'house', cp: [18.1, 42.6, -PI / 2], obj: 'Wake up', hint: '', mood: 'night', beat: 0,
    enter(g) { const D = g.stepData; D.phase = 'wake';
      g.cut = { anim: 'Sitting_Idle_Loop', cam: V(15.2, 1.7, 41), look: V(18.1, 0.9, 42.6), flash: false }; g.camera.position.copy(g.cut.cam);
      // the street scene outside the boarded window
      g.victim(3.5, 43.6, 'walt', 3);
      const dube = g.npc('dube', 'dube', -4, 30, 0, 'Sprint_Loop'); D.dube = dube; D.chaser = g.spawnZ(-4, 24, { runner: true, idle: true }); D.chaser.play('Sprint_Loop');
      [0, 1.4, 3.1, 5].forEach(t => setTimeout(() => g.audio.scream(0.1 + Math.random() * .05), t * 1000)); setTimeout(() => g.audio.glass(), 2400); setTimeout(() => g.audio.dog(), 3500);
      const own = (k) => g.save.owned.includes(k);
      if (!g.save.items.includes('backpack')) g.addPickup({ kind: 'backpack', story: true, label: 'Grab your backpack', pos: [19.5, 0.85, 40.2] });
      if (!own('bat')) g.addPickup({ kind: 'weapon', item: 'bat', story: true, label: 'Take Dad\'s bat', pos: [13.0, 0.3, 44.3] });
      if (!own('pistol')) g.addPickup({ kind: 'weapon', item: 'pistol', ammo: 24, story: true, label: 'Open Dad\'s lockbox', pos: [19.55, 0.85, 39.65], onTake: (g) => g.say([['note', 'Keem — went to get Nia from the Pells\'. Stay put. If it gets bad, the 9mm is for EMERGENCIES. Code is your birthday. — Dad'], ['keem', 'Code is my birthday. Of course it is.'], ['keem', 'And "stay put" lasted about four minutes, Dad.']]) });
      g.say([['keem', '…'], ['keem', 'Is that… screaming?'], ['keem', 'Okay. Okay. The boards were Dad\'s idea. Thank you, paranoid Dad.'], ['keem', 'Window. Just look. Don\'t be the guy in the movie who just looks.'], ['keem', '…I\'m gonna look.']], () => {
        g.cut = null; g.objective('Check the boarded window', 'Walk to the window (WASD / left stick). Press E / ✋ to peek through the gaps.'); g.wpTarget = [12.6, 1.4, 42.5]; D.phase = 'walk';
        D.uses = [{ x: 12.7, z: 42.5, label: 'Peek through the boards', fn: (g) => this.peek(g) }]; }); },
    peek(g) { const D = g.stepData; D.phase = 'peek'; g.wpTarget = null; g.cut = { anim: 'Idle_Loop', cam: V(12.3, 1.5, 42.5), look: V(2.5, 0.6, 42.5), flash: false };
      g.player.root.position.set(12.8, 0, 42.5); g.player.root.rotation.y = -PI / 2; g.audio.beat(0); g.audio.sting();
      // Mr. Dube runs past and gets tackled
      const dube = D.dube, ch = D.chaser; dube.root.position.set(-3, 0, 34); ch.root.position.set(-3, 0, 28.5); ch.st = 'script'; dube.play('Sprint_Loop');
      let t = 0; dube.update = (dt) => { t += dt; if (t < 2.2) { dube.root.position.z += dt * 4.6; dube.root.position.x += dt * 1.6; dube.root.rotation.y = .33; ch.root.position.z += dt * 5.6; ch.root.position.x += dt * 1.6; ch.root.rotation.y = .33; ch.mixer.update(0); }
        else if (!dube.down) { dube.down = true; dube.play('Death01', { once: true }); g.audio.scream(.16); g.blood(dube.root.position.clone().setY(.8), V(0, 1, 0), 30, 3); g.decal(dube.root.position.x, dube.root.position.z, 2); dube.bleed = true; dube.mat.userData.u.uBlood.value = g.settings.gore ? 1 : .2;
          ch.root.position.set(dube.root.position.x - .7, 0, dube.root.position.z - .4); ch.root.rotation.y = 1; ch.st = 'eat'; ch.play('Fixing_Kneeling', { speed: 1.6 }); } };
      g.say([['keem', 'Mr. Walt…? Oh no. No no no.'], ['keem', 'They\'re… eating him. They\'re EATING Mr. Walt.'], ['dube', 'HELP! SOMEBODY HELP ME—'], ['keem', 'Mr. Dube, run! RUN!'], ['keem', '…'], ['keem', 'Okay. That\'s real. That is real life.'], ['keem', 'Dad and Nia are at the Pells\'. Two streets. I gotta get to them.'], ['keem', 'Gear up. Backpack. Bat. Dad\'s lockbox.']], () => {
        g.cut = null; D.phase = 'gear'; g.objective('Gear up: backpack, bat, Dad\'s lockbox', 'Walk over the glowing items and press E / ✋. Collect all three.'); g.audio.beat(1); });
    },
    update(g) { const D = g.stepData; if (D.phase === 'gear') { const need = []; if (!g.save.items.includes('backpack')) need.push([19.5, 1, 40.2]); if (!g.save.owned.includes('bat')) need.push([13, 1, 44.3]); if (!g.save.owned.includes('pistol')) need.push([19.55, 1, 39.65]);
        if (need.length) g.wpTarget = need[0]; else { D.phase = 'door'; g.objective('Pry the boards off the front door', 'Front door, by the living room. Swap weapons with Q / ⇄. Guns: right-click / ⌖ to aim.'); g.wpTarget = [12.7, 1.2, 36.8];
          g.say([['keem', 'Bat for the quiet ones. Pistol for the "oh no" ones.'], ['keem', 'Mom would kill me for this. If she… yeah. Later.']]);
          D.uses = [{ x: 12.8, z: 36.8, label: 'Pry the boards off the door', fn: (g) => { g.setDoor(true); g.audio.crash(); goto(g, 1); } }]; } } } },

  { id: 'street', cp: [10.6, 36.8, -PI / 2], obj: 'Get to the Pell house — Dad and Nia are there', hint: 'Follow the green marker. Melee: click / HIT (chain hits for combos). Roll: Ctrl / ROLL.', mood: 'tense', beat: 2,
    enter(g) { g.stepData.runners = .1; g.victim(3.5, 43.6, 'walt', 3); const dv = g.victim(-1.2, 40.5, 'dube', 1);
      g.horde(7, [[2, 30], [-3, 24], [4, 16], [-4, 10], [1, 4], [-8, 6]]); g.wpTarget = [-11, 1.2, 20];
      g.say([['keem', 'Front yard. Mr. Walt\'s still… moving. That\'s not Mr. Walt anymore.'], ['keem', 'Pells\' house. Blue one, other side. Go.']]); },
    update(g) { if (dist2(g, -11, 20) < 3) goto(g, 2, 120); } },

  { id: 'pell', cp: [-9.3, 20, PI / 2], obj: '', hint: '', mood: 'night', beat: 1,
    enter(g) { const D = g.stepData; const dad = g.npc('marcus', 'marcus', -11, 19.2, PI / 2, 'Idle_Talking_Loop'); dad.root.add(Object.assign(g.weaponMeshes.shotgun.clone(), { visible: false }));
      const nia = g.npc('nia', 'nia', -11.3, 21, PI / 2, 'Idle_Loop', 0.62); g.cut = { anim: 'Idle_Loop', cam: V(-7.2, 1.7, 17.6), look: V(-10.2, 1.1, 20), flash: true };
      g.say([['marcus', 'KEEM! What did I say? I said stay PUT.'], ['keem', 'You also said "emergencies." This is like… the emergency.'], ['marcus', '…Fair. You brought the bat AND the pistol? Good. Don\'t tell your mother.'],
        ['nia', 'Biscuit is in my hoodie. He\'s fine. He\'s judging you.'], ['keem', 'Biscuit is a rabbit, Nia.'], ['nia', 'A JUDGING rabbit.'],
        ['marcus', 'Listen. The Pells are gone. The truck\'s at Hank\'s Garage. Sheriff Doyle\'s cruiser is by the Market — there\'s a rifle in the rack.'], ['marcus', 'Get it. We\'ll cut through the backyards and meet you at Hank\'s. Fast and loud, son. Don\'t stop.'], ['keem', 'Fast and loud. Got it.']], () => {
        g.cut = null; dad.root.visible = false; nia.root.visible = false; g.objective('Get the rifle from the sheriff\'s cruiser by Riverside Market', 'Zombies hunt by sound. Crouch (C) to sneak past. Loot the cash & ammo on the way — spend it in the Armory (pause menu).');
        g.wpTarget = [-8.6, 1.2, -30]; g.stepData.runners = .25; g.horde(10, [[0, -4], [-4, -14], [3, -20], [-2, -24], [6, 2]]); g.victim(-12.5, -38, 'ruth', 2);
        D.uses = [{ x: -8.6, z: -30, r: 2.6, label: 'Take the rifle from the cruiser', fn: (g) => { g.give('rifle'); g.save.ammo.rifle = (g.save.ammo.rifle || 0) + 60; g.say([['keem', 'Sheriff Doyle\'s rifle. Sorry, Sheriff.'], ['keem', 'Okay. NOW I feel like a main character.']]); goto(g, 3, 150); } }]; }); } },

  { id: 'garage', cp: [-6.5, -28, PI], obj: 'Meet Dad at Hank\'s Garage', hint: 'Rifle is full-auto: hold fire. Reload R / ⟳.', mood: 'tense', beat: 2,
    enter(g) { const D = g.stepData; g.wpTarget = [11, 1.2, -46]; g.horde(4, [[2, -36], [-3, -40]]); D.runners = .2; },
    update(g, dt) { const D = g.stepData;
      if (!D.trig && dist2(g, 12, -48) < 22) { D.trig = true; D.tankerHP = 140; D.hordeAll = true; D.runners = .35; g.horde(14, [[8, -50], [6, -44], [4, -56], [12, -58], [2, -48]]); g.audio.groan(.3);
        g.say([['radio', '(Dad, on the walkie) Keem! They\'re all over the pumps! We\'re stuck in the garage!'], ['radio', 'The fuel tanker — SHOOT THE TANKER and get back!'], ['keem', 'Shoot the giant bomb. Cool. Cool cool cool.']]); g.objective('Shoot the fuel tanker!', 'Aim at the red FLAMMABLE tanker and keep firing — then get clear.'); g.wpTarget = [8, 2, -51]; }
      if (D.tankerDone && !D.after) { D.after = 3; g.say([['keem', 'WOOOO— okay that was way bigger than I thought.'], ['radio', 'Keem?! Was that you?!'], ['keem', 'Define "you."']]); g.objective('Clear the garage', 'Finish the stragglers.'); }
      if (D.after > 0) { D.after -= dt; if (D.after <= 0) { D.after = -1; } }
      if (D.after === -1 && g.alive().filter(z => dist2(g, z.root.position.x, z.root.position.z) < 30).length <= 2) { D.after = -2; goto(g, 4, 200); } } },

  { id: 'truck', cp: [14, -54, PI], obj: '', hint: '', mood: 'night', beat: 1,
    enter(g) { const D = g.stepData; const dad = g.npc('marcus', 'marcus', 20, -61, -PI / 2, 'Idle_Talking_Loop'); const nia = g.npc('nia', 'nia', 20.3, -62.6, -PI / 2, 'Idle_Loop', .62);
      g.cut = { anim: 'Idle_Loop', cam: V(15, 1.8, -58), look: V(20, 1, -61.5), flash: true };
      g.say([['marcus', 'You blew up Hank\'s.'], ['keem', 'Hank\'s was… already kinda on fire, emotionally.'], ['marcus', 'My hand\'s cut up. You drive. You\'ve played enough of those games.'], ['nia', 'He crashes in ALL of them.'], ['keem', 'That\'s called STYLE.'], ['marcus', 'Bridge. Riverside Bridge. The Guard is on the far side. GO.']], () => {
        g.cut = null; D.canDrive = true; g.objective('Get in the truck and drive to Riverside Bridge', 'E / ✋ near the truck. Steer with the stick, FIRE = gas. Ram them.'); g.wpTarget = [22, 1.4, -64];
        D.onDrive = (g) => { dad.root.visible = nia.root.visible = false; g.wpTarget = [0, 1, -96]; g.objective('Drive to Riverside Bridge', 'Plow through. Don\'t stop.'); D.hordeAll = true; D.runners = .3; g.horde(16, [[0, -66], [-2, -72], [3, -78], [-3, -84], [2, -90], [0, -80]]); g.audio.beat(2);
          g.say([['nia', 'Left! LEFT! Your OTHER left!'], ['keem', 'I KNOW WHICH LEFT!']]); }; }); },
    update(g) { const T = g.truck; if (T.driving && T.g.position.z < -91) { T.v = 0; g.shake(1); g.audio.crash(); g.exitTruck(); g.player.root.position.set(1, 0, -93.5); goto(g, 5, 150); } } },

  { id: 'boss', cp: [0.5, -93.5, PI], obj: 'Defeat Big Gus', hint: 'Roll away from his slam (red ring) and his charge. Headshots hurt him most.', mood: 'tense', beat: 2,
    enter(g) { const D = g.stepData; const dad = g.npc('marcus', 'marcus', 3.5, -92.5, PI, 'Idle_Loop'); const nia = g.npc('nia', 'nia', 4.2, -91.6, PI, 'Idle_Loop', .62);
      const b = g.spawnZ(-0.2, -103.5, { boss: true, hp: 900, scale: 1.5, runner: false }); b.speed = 1.7; b.cd = 2; b.aggro = 99; b.mat.userData.u.uShirt.value.set('#e8e2d2'); b.mat.userData.u.uBlood.value = g.settings.gore ? 1.3 : .2; g.boss = b; $q('#bossn').textContent = 'BIG GUS — the barber';
      g.horde(4, [[-4, -104], [4, -104]]); D.hordeAll = true; g.wpTarget = null;
      g.say([['keem', 'Is that… Gus? From the barbershop?'], ['marcus', 'Gus was always big. That is NOT normal big.'], ['keem', 'He gave me the worst fade of my LIFE. This is personal.']]); },
    update(g) { if (g.boss && g.boss.dead && !g.stepData.won) { g.stepData.won = true; setTimeout(() => { g.say([['keem', 'Lineup\'s crooked, Gus.'], ['nia', 'That was SO gross. Do it again.'], ['marcus', 'Bridge. Now.']]); goto(g, 6, 400); }, 1800); } } },

  { id: 'bridge', cp: [0.3, -97, PI], obj: 'Cross Riverside Bridge', hint: 'Keep Nia close. Don\'t look back.', mood: 'sad', beat: 0,
    enter(g) { const dad = g.npc('marcus', 'marcus', 2, -95.5, PI, 'Walk_Loop'); const nia = g.npc('nia', 'nia', -1.4, -95.5, PI, 'Walk_Loop', .62); follow(g, dad, [1.6, 1.2]); follow(g, nia, [-1.2, .9]); g.wpTarget = [0, 1.2, -122]; g.stepData.dad = dad;
      g.horde(6, [[0, -80], [-4, -84], [4, -86]], { runner: true, aggro: 99 }); g.stepData.runners = .6; },
    update(g) { const D = g.stepData; if (!D.end && g.player.root.position.z < -114) { D.end = true; const dad = D.dad; dad.update = null; dad.root.position.set(0.5, 0, -110); dad.root.rotation.y = 0; dad.play('Pistol_Aim_Neutral');
        g.cut = { anim: 'Idle_Loop', cam: V(-3.5, 1.8, -121), look: V(0.5, 1.2, -110), flash: true }; g.audio.setMood('sad');
        g.say([['marcus', 'Keem. Take your sister. Go.'], ['keem', 'Dad, no — come ON—'], ['marcus', 'Somebody has to hold the gate. I\'ll be right behind you.'], ['nia', 'Promise?'], ['marcus', 'Promise. Go. GO!'], ['keem', '…'], ['keem', 'He said he\'d be right behind us.']], () => { g.onComplete && g.onComplete(); }); } } },
];
const $q = (s) => document.querySelector(s);

let n = 0; const id = () => 'l' + (n++);
const pg = (x, z, text, ms = 0) => ({ id: 'pg_' + x + '_' + z, kind: 'page', manual: false, text, pos: [x, 0.9, z], minStep: ms });
export const LOOT = [
  { id: 'h_cash', kind: 'cash', n: 40, pos: [19.6, 0.85, 40.7] }, { id: 'h_pan', kind: 'weapon', item: 'pan', pos: [14.2, 0.2, 36.4], label: 'Frying pan' }, { id: 'h_med', kind: 'med', pos: [13, 0.2, 38.4] },
  pg(16.5, 44.2, 'Captain Riverside #1: "The Lobster Men Cometh"'),
  { id: 's1', kind: 'cash', n: 25, pos: [4.6, .25, 30], minStep: 1 }, { id: 's2', kind: 'ammo', item: 'light', n: 18, pos: [-5.8, .25, 26], minStep: 1 }, { id: 's3', kind: 'cash', n: 60, pos: [9, .25, 20], minStep: 1 },
  { id: 's4', kind: 'med', pos: [-6.4, .25, 12], minStep: 1 }, { id: 's5', kind: 'grenade', n: 1, pos: [5.6, .25, 8], minStep: 1 }, pg(24, 50, 'Captain Riverside #2: "Chowder of Doom"', 1), pg(-24, 34, 'Captain Riverside #3: "Moose Problems"', 1),
  { id: 'm1', kind: 'ammo', item: 'light', n: 24, pos: [-5, .25, -10], minStep: 2 }, { id: 'm2', kind: 'cash', n: 80, pos: [-12, .25, -26], minStep: 2 }, { id: 'm3', kind: 'ammo', item: 'shell', n: 10, pos: [-12.5, .25, -40], minStep: 2 },
  { id: 'm4', kind: 'grenade', n: 1, pos: [-13, .25, -50], minStep: 2 }, { id: 'm5', kind: 'med', pos: [5.8, .25, -18], minStep: 2 }, { id: 'm6', kind: 'cash', n: 120, pos: [-24, .25, -14], minStep: 2 }, pg(-30, -24, 'Captain Riverside #4: "Lighthouse of Fear"', 2), pg(30, -6, 'Captain Riverside #5: "The Fog Eats Tuesdays"', 2),
  { id: 'g1', kind: 'ammo', item: 'rifle', n: 30, pos: [5, .25, -40], minStep: 3 }, { id: 'g2', kind: 'cash', n: 90, pos: [22, .25, -46], minStep: 3 }, { id: 'g3', kind: 'med', pos: [24, .25, -56], minStep: 3 }, { id: 'g4', kind: 'grenade', n: 2, pos: [-4, .25, -60], minStep: 3 }, pg(26, -66, 'Captain Riverside #6: "Hank\'s Last Stand"', 3),
  { id: 'b1', kind: 'ammo', item: 'rifle', n: 40, pos: [-5, .25, -92], minStep: 5 }, { id: 'b2', kind: 'med', pos: [6, .25, -92], minStep: 5 }, { id: 'b3', kind: 'ammo', item: 'light', n: 30, pos: [-3, .25, -88], minStep: 5 }, pg(-9, -88, 'Captain Riverside #7: "Barber of the Damned"', 4), pg(3, -130, 'Captain Riverside #8: "Right Behind You"', 6),
];
