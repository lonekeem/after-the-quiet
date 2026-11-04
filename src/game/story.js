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
      [0, 1.4, 3.1, 5].forEach((t, i) => setTimeout(() => (i === 1 && g.audio.victimScream ? g.audio.victimScream(.12) : g.audio.scream(0.1 + Math.random() * .05)), t * 1000)); setTimeout(() => g.audio.glass(), 2400); setTimeout(() => g.audio.dog(), 3500);
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
      g.say([['keem', 'Mr. Walt…? Oh {shit|no}. No no no.'], ['keem', 'They\'re… eating him. They\'re {fucking |}EATING Mr. Walt.'], ['dube', 'HELP! SOMEBODY HELP ME—'], ['keem', 'Mr. Dube, run! RUN!'], ['keem', '…'], ['keem', 'Okay. That\'s real. That is {fucking |}real life.'], ['keem', 'Dad and Nia are at the Pells\'. Two streets. I gotta get to them.'], ['keem', 'Gear up. Backpack. Bat. Dad\'s lockbox.']], () => {
        g.cut = null; D.phase = 'gear'; g.objective('Gear up: backpack, bat, Dad\'s lockbox', 'Walk over the glowing items and press E / ✋. Collect all three.'); g.audio.beat(1); });
    },
    update(g) { const D = g.stepData; if (D.phase === 'gear') { const need = []; if (!g.save.items.includes('backpack')) need.push([19.5, 1, 40.2]); if (!g.save.owned.includes('bat')) need.push([13, 1, 44.3]); if (!g.save.owned.includes('pistol')) need.push([19.55, 1, 39.65]);
        if (need.length) g.wpTarget = need[0]; else { D.phase = 'door'; g.objective('Pry the boards off the front door', 'Front door, by the living room. Swap weapons with Q / ⇄. Guns: right-click / ⌖ to aim.'); g.wpTarget = [12.7, 1.2, 36.8];
          g.say([['keem', 'Bat for the quiet ones. Pistol for the "oh {shit|no}" ones.'], ['keem', 'Mom would {kick my ass|kill me} for this. If she… yeah. Later.']]);
          D.uses = [{ x: 12.8, z: 36.8, label: 'Pry the boards off the door', fn: (g) => { g.setDoor(true); g.audio.crash(); goto(g, 1); } }]; } } } },

  { id: 'street', cp: [10.6, 36.8, -PI / 2], obj: 'Get to the Pell house — Dad and Nia are there', hint: 'Follow the green marker. Melee: click / HIT (chain hits for combos). Roll: Ctrl / ROLL.', mood: 'tense', beat: 2,
    enter(g) { g.stepData.runners = .1; g.victim(3.5, 43.6, 'walt', 3); const dv = g.victim(-1.2, 40.5, 'dube', 1);
      g.horde(7, [[2, 30], [-3, 24], [4, 16], [-4, 10], [1, 4], [-8, 6]]); g.wpTarget = [-11, 1.2, 20];
      g.say([['keem', 'Front yard. Mr. Walt\'s still… moving. That\'s not Mr. Walt anymore.'], ['keem', 'Pells\' house. Blue one, other side. Go.']]); },
    update(g) { if (dist2(g, -11, 20) < 3) goto(g, 2, 120); } },

  { id: 'pell', cp: [-9.3, 20, PI / 2], obj: '', hint: '', mood: 'night', beat: 1,
    enter(g) { const D = g.stepData; const dad = g.npc('marcus', 'marcus', -11, 19.2, PI / 2, 'Idle_Talking_Loop'); dad.root.add(Object.assign(g.weaponMeshes.shotgun.clone(), { visible: false }));
      const nia = g.npc('nia', 'nia', -11.3, 21, PI / 2, 'Idle_Loop', 0.62); g.cut = { anim: 'Idle_Loop', cam: V(-7.2, 1.7, 17.6), look: V(-10.2, 1.1, 20), flash: true };
      g.say([['marcus', 'KEEM! What the {hell|heck} did I say? I said stay PUT.'], ['keem', 'You also said "emergencies." This is like… the emergency.'], ['marcus', '…Fair. You brought the bat AND the pistol? Good. Don\'t tell your mother.'],
        ['nia', 'Biscuit is in my hoodie. He\'s fine. He\'s judging you.'], ['keem', 'Biscuit is a rabbit, Nia.'], ['nia', 'A JUDGING rabbit.'],
        ['marcus', 'Listen. The Pells are gone. The truck\'s at Hank\'s Garage. Sheriff Doyle\'s cruiser is by the Market — there\'s a rifle in the rack.'], ['marcus', 'Get it. We\'ll cut through the backyards and meet you at Hank\'s. Fast and loud, son. Don\'t stop.'], ['keem', 'Fast and loud. Got it.']], () => {
        g.cut = null; dad.root.visible = false; nia.root.visible = false; g.objective('Get the rifle from the sheriff\'s cruiser by Riverside Market', 'Zombies hunt by sound. Crouch (C) to sneak past. Loot the cash & ammo on the way — spend it in the Armory (pause menu).');
        g.wpTarget = [-8.6, 1.2, -30]; g.stepData.runners = .25; g.horde(10, [[0, -4], [-4, -14], [3, -20], [-2, -24], [6, 2]]); g.victim(-12.5, -38, 'ruth', 2);
        D.uses = [{ x: -8.6, z: -30, r: 2.6, label: 'Take the rifle from the cruiser', fn: (g) => { g.give('rifle'); g.save.ammo.rifle = (g.save.ammo.rifle || 0) + 60; g.say([['keem', 'Sheriff Doyle\'s rifle. Sorry, Sheriff.'], ['keem', 'Okay. NOW I feel like a {damn |}main character.']]); goto(g, 3, 150); } }]; }); } },

  { id: 'garage', cp: [-6.5, -28, PI], obj: 'Meet Dad at Hank\'s Garage', hint: 'Rifle is full-auto: hold fire. Reload R / ⟳.', mood: 'tense', beat: 2,
    enter(g) { const D = g.stepData; g.wpTarget = [11, 1.2, -46]; g.horde(4, [[2, -36], [-3, -40]]); D.runners = .2; },
    update(g, dt) { const D = g.stepData;
      if (!D.trig && dist2(g, 12, -48) < 22) { D.trig = true; D.tankerHP = 140; D.hordeAll = true; D.runners = .35; g.horde(14, [[8, -50], [6, -44], [4, -56], [12, -58], [2, -48]]); g.audio.groan(.3);
        g.say([['radio', '(Dad, on the walkie) Keem! They\'re all over the {damn |}pumps! We\'re stuck in the garage!'], ['radio', 'The fuel tanker — SHOOT THE TANKER and get back!'], ['keem', 'Shoot the giant {fucking |}bomb. Cool. Cool cool cool.']]); g.objective('Shoot the fuel tanker!', 'Aim at the red FLAMMABLE tanker and keep firing — then get clear.'); g.wpTarget = [8, 2, -51]; }
      if (D.tankerDone && !D.after) { D.after = 3; g.say([['keem', 'WOOOO— {holy shit|holy crap}, that was way bigger than I thought.'], ['radio', 'Keem?! Was that you?!'], ['keem', 'Define "you."']]); g.objective('Clear the garage', 'Finish the stragglers.'); }
      if (D.after > 0) { D.after -= dt; if (D.after <= 0) { D.after = -1; } }
      if (D.after === -1 && g.alive().filter(z => dist2(g, z.root.position.x, z.root.position.z) < 30).length <= 2) { D.after = -2; goto(g, 4, 200); } } },

  { id: 'truck', cp: [14, -54, PI], obj: '', hint: '', mood: 'night', beat: 1,
    enter(g) { const D = g.stepData; const dad = g.npc('marcus', 'marcus', 20, -61, -PI / 2, 'Idle_Talking_Loop'); const nia = g.npc('nia', 'nia', 20.3, -62.6, -PI / 2, 'Idle_Loop', .62);
      g.cut = { anim: 'Idle_Loop', cam: V(15, 1.8, -58), look: V(20, 1, -61.5), flash: true };
      g.say([['marcus', 'You blew the {hell|heck} out of Hank\'s.'], ['keem', 'Hank\'s was… already kinda on fire, emotionally.'], ['marcus', 'My hand\'s cut up. You drive. You\'ve played enough of those games.'], ['nia', 'He crashes in ALL of them.'], ['keem', 'That\'s called STYLE.'], ['marcus', 'Bridge. Riverside Bridge. The Guard is on the far side. GO.']], () => {
        g.cut = null; D.canDrive = true; g.objective('Get in the truck and drive to Riverside Bridge', 'E / ✋ near the truck. GAS/BRAKE + ◀ ▶ (W/S A/D, pad RT/LT). Ram them.'); g.wpTarget = [22, 1.4, -64];
        D.onDrive = (g) => { dad.root.visible = nia.root.visible = false; g.wpTarget = [0, 1, -96]; g.objective('Drive to Riverside Bridge', 'Plow through. Don\'t stop.'); D.hordeAll = true; D.runners = .3; g.horde(16, [[0, -66], [-2, -72], [3, -78], [-3, -84], [2, -90], [0, -80]]); g.audio.beat(2);
          g.say([['nia', 'Left! LEFT! Your OTHER left!'], ['keem', 'I KNOW WHICH {damn |}LEFT!']]); }; }); },
    update(g) { const T = g.truck; if (T.driving && T.g.position.z < -91) { T.v = 0; g.shake(1); g.audio.crash(); g.exitTruck(); g.player.root.position.set(1, 0, -93.5); goto(g, 5, 150); } } },

  { id: 'boss', cp: [0.5, -93.5, PI], obj: 'Defeat Big Gus', hint: 'Roll away from his slam (red ring) and his charge. Headshots hurt him most.', mood: 'tense', beat: 2,
    enter(g) { const D = g.stepData; const dad = g.npc('marcus', 'marcus', 3.5, -92.5, PI, 'Idle_Loop'); const nia = g.npc('nia', 'nia', 4.2, -91.6, PI, 'Idle_Loop', .62);
      const b = g.spawnZ(-0.2, -103.5, { boss: true, hp: 900, scale: 1.5, runner: false }); b.speed = 1.7; b.cd = 2; g.audio.roar && setTimeout(() => { g.audio.roar(); g.audio.shout('keem_boss', true); }, 1200); b.aggro = 99; b.mat.userData.u.uShirt.value.set('#e8e2d2'); b.mat.userData.u.uBlood.value = g.settings.gore ? 1.3 : .2; g.boss = b; $q('#bossn').textContent = 'BIG GUS — the barber';
      g.horde(4, [[-4, -104], [4, -104]]); D.hordeAll = true; g.wpTarget = null;
      g.say([['keem', 'Is that… Gus? From the barbershop?'], ['marcus', 'Gus was always big. That is NOT {fuckin\' |}normal big.'], ['keem', 'He gave me the worst {damn |}fade of my LIFE. This is personal.']]); },
    update(g) { if (g.boss && g.boss.dead && !g.stepData.won) { g.stepData.won = true; setTimeout(() => { g.say([['keem', 'Lineup\'s crooked, Gus{, you ugly bastard|}.'], ['nia', 'That was SO gross. Do it again.'], ['marcus', 'Bridge. Now. {Move your ass|Move it}!']]); goto(g, 6, 400); }, 1800); } } },

  { id: 'bridge', cp: [0.3, -97, PI], obj: 'Cross Riverside Bridge', hint: 'Keep Nia close. Don\'t look back.', mood: 'sad', beat: 0,
    enter(g) { const dad = g.npc('marcus', 'marcus', 2, -95.5, PI, 'Walk_Loop'); const nia = g.npc('nia', 'nia', -1.4, -95.5, PI, 'Walk_Loop', .62); follow(g, dad, [1.6, 1.2]); follow(g, nia, [-1.2, .9]); g.wpTarget = [0, 1.2, -122]; g.stepData.dad = dad;
      g.horde(6, [[0, -80], [-4, -84], [4, -86]], { runner: true, aggro: 99 }); g.stepData.runners = .6; },
    update(g) { const D = g.stepData; if (!D.end && g.player.root.position.z < -114) { D.end = true; const dad = D.dad; dad.update = null; dad.root.position.set(0.5, 0, -110); dad.root.rotation.y = 0; dad.play('Pistol_Aim_Neutral');
        g.cut = { anim: 'Idle_Loop', cam: V(-3.5, 1.8, -121), look: V(0.5, 1.2, -110), flash: true }; g.audio.setMood('sad');
        g.say([['marcus', 'Keem. Take your sister. Go.'], ['keem', 'Dad, no — {goddammit, |}come ON—'], ['marcus', 'Somebody has to hold the gate. I\'ll be right behind you.'], ['nia', 'Promise?'], ['marcus', 'Promise. Go. GO!'], ['keem', '…'], ['keem', 'He said he\'d be right behind us.']], () => { g.onComplete && g.onComplete(1); }); } } },

  // ===================== CHAPTER 2 — HIGH WATER =====================
  // Picks up seconds after the bridge. Haverford, the next town south, is flooded, overrun, and very much not the "safe zone" the radio promised.
  { id: 'c2_shore', ch: 2, cp: [0.3, -136, PI], obj: 'Reach the National Guard checkpoint', hint: 'The radio said Haverford was a safe zone. Follow the road south.', mood: 'tense', beat: 1,
    enter(g) { const D = g.stepData; g.ch2Reset(g, 7); if (!g.save.owned.includes('pistol')) { g.give('pistol'); g.save.ammo.light = (g.save.ammo.light || 0) + 48; }
      const nia = g.npc('nia', 'nia', -1.2, -134.5, PI, 'Walk_Loop', .62); follow(g, nia, [-1.2, .9]); D.nia = nia; g.wpTarget = [0, 1.2, -156];
      g.horde(5, [[-6, -146], [6, -150], [0, -170]], { aggro: 14 });
      g.say([['nia', "He's coming, right? Dad's coming."], ['keem', "Dad's coming. He said right behind us."], ['nia', "He also said the Patriots would win the Super Bowl."], ['keem', "That was one time. And the refs were {fuckin' |}blind."], ['radio', 'This is the National Guard. Haverford is a designated safe zone. Proceed to the checkpoint.'], ['nia', "See? Safe zone. Snacks. Maybe a cot."]]); },
    update(g) { if (dist2(g, 0, -156) < 6 && !g.stepData.go) { g.stepData.go = true; goto(g, 8, 150); } } },

  { id: 'c2_checkpoint', ch: 2, cp: [0.3, -153, PI], obj: 'Clear the checkpoint', hint: 'The soldiers are… busy. Being eaten.', mood: 'tense', beat: 2,
    enter(g) { const D = g.stepData; g.ch2Reset(g, 8); const nia = g.npc('nia', 'nia', -1.4, -152, PI, 'Idle_Loop', .62); follow(g, nia, [-1.2, 1]); D.nia = nia;
      g.victim(-6, -161, null, 3); g.victim(7, -162, null, 2); g.victim(-14, -158, null, 2);
      g.horde(9, [[-8, -166], [8, -168], [0, -175], [-16, -160], [16, -162]], { aggro: 30 }); D.hordeAll = true; g.wpTarget = null; g.audio.beat(2);
      g.say([['nia', 'Oh. Oh no. The safe zone is eating the safe zone.'], ['keem', "That soldier's getting his whole {damn |}spine slurped like a noodle."], ['nia', "I'm never eating ramen again."], ['keem', 'Stay behind me!']]); },
    update(g) { const D = g.stepData; if (!D.clear && g.alive().length === 0) { D.clear = true; g.objective('Search the command tent', 'The big tent on the right. Look for the radio.'); g.wpTarget = [12.5, 1, -154];
        g.say([['keem', 'Clear. Nia, you good?'], ['nia', "I stepped in a guy. Like, IN him."]]);
        D.uses = [{ x: 12, z: -154, label: 'Search the command tent', fn: (g) => { D.uses = []; g.save.ammo.rifle = (g.save.ammo.rifle || 0) + 90; g.save.cash += 250; g.toast && g.toast('+90 rifle ammo · +$250 · Guard SAW unlocked in the Armory');
          g.cut = { anim: 'Idle_Loop', cam: V(9, 1.7, -151), look: V(14, 1.1, -155) };
          g.say([['sgt', "…if anybody's hearing this… it's Sergeant Okafor… Haverford's gone. Last evac bird lifts from the high school stadium at oh-six-hundred."], ['sgt', "Gate's on a backup panel. Needs fuses. Hardware store, the doughnut place, the laundromat… I really wanted a doughnut. Okafor out."], ['keem', 'Fuses. Doughnuts. Helicopter. Okay. I can do three things.'], ['nia', "You can't even do two. You burned cereal once."]], () => { g.cut = null; goto(g, 9, 200); }); } }]; } } },

  { id: 'c2_town', ch: 2, cp: [0, -168, PI], obj: 'Find 3 fuses for the school gate (0/3)', hint: 'Hardware store, Doughnut Depot, Suds-n-Duds laundromat. Loot everything.', mood: 'night', beat: 1,
    enter(g) { const D = g.stepData; g.ch2Reset(g, 9); D.fuses = 0; const nia = g.npc('nia', 'nia', -1.4, -166, PI, 'Idle_Loop', .62); follow(g, nia, [-1.2, 1]); D.nia = nia; g.wpTarget = null;
      g.horde(10, [[-12, -182], [12, -196], [-24, -198], [22, -214], [-6, -226], [28, -190]], { aggro: 16 }); D.runners = .25;
      const got = (msg) => { D.fuses++; g.audio.pickup(); g.objective('Find 3 fuses for the school gate (' + D.fuses + '/3)', 'Hardware store, Doughnut Depot, Suds-n-Duds laundromat.'); g.say(msg);
        if (D.fuses === 3) { g.objective('Get to the Haverford High gate', 'South end of Main. Follow the marker.'); g.wpTarget = [0, 1.2, -253]; g.horde(6, [[-8, -240], [8, -244]], { runner: true, aggro: 40 }); } };
      D.uses = [
        { x: -10, z: -188, label: 'Grab fuse (Haverford Hardware)', fn: () => { D.uses = D.uses.filter(u => u.x !== -10); got([['keem', "Fuse one. And a nail gun I can't use. Story of my life."], ['nia', 'There is a guy in the paint aisle eating another guy. Like a burrito.']]); g.horde(4, [[-16, -184], [-8, -194]], { aggro: 30 }); } },
        { x: 9.6, z: -214, label: 'Grab fuse (Doughnut Depot)', fn: () => { D.uses = D.uses.filter(u => u.x !== 9.6); got([['nia', 'They have BOSTON CREAM. The apocalypse can wait.'], ['keem', "Nia, that zombie has sprinkles on his face. Do NOT eat that {shit|stuff}."]]); g.horde(4, [[14, -222], [6, -208]], { aggro: 30 }); } },
        { x: -25.6, z: -190, label: 'Grab fuse (Suds-n-Duds)', fn: () => { D.uses = D.uses.filter(u => u.x !== -25.6); got([['keem', 'Fuse three. Somebody got eaten in the spin cycle. Pink suds. Pink.'], ['nia', 'I am gonna need SO much therapy.']]); g.horde(4, [[-30, -200], [-20, -186]], { aggro: 30 }); } }]; },
    update(g) { const D = g.stepData; if (D.fuses === 3 && !D.go && dist2(g, 0, -253) < 4) { D.go = true; goto(g, 10, 300); } } },

  { id: 'c2_gate', ch: 2, cp: [0, -252, 0], obj: 'Hold the gate while Nia wires the panel', hint: 'Waves come up Main Street. Grenades help. Don\'t let them reach Nia.', mood: 'tense', beat: 3,
    enter(g) { const D = g.stepData; g.ch2Reset(g, 10); D.t = 0; D.wave = 0; D.len = 60; const nia = g.npc('nia', 'nia', 3.4, -255.2, PI, 'Idle_Loop', .62); D.nia = nia; g.wpTarget = null; D.hordeAll = true; D.runners = .35;
      g.say([['nia', "Okay. Red wire, blue wire… they're both brown. Why are they both BROWN?"], ['keem', 'Just make it beep, Nia!'], ['nia', 'Give me one minute and stop yelling at me!']]); },
    update(g, dt) { const D = g.stepData; if (D.done) return; D.t += dt; const left = Math.max(0, Math.ceil(D.len - D.t)); if (left !== D.lastL) { D.lastL = left; g.objective('Hold the gate: ' + left + 's', 'Waves come up Main Street. Protect Nia.'); }
      if (D.t > D.wave * 9 && D.wave < 6) { D.wave++; const n = g.alive().length < 22 ? 5 + D.wave : 2; g.horde(n, [[-6, -222], [6, -226], [-20, -232], [18, -230], [0, -214]], { runner: D.wave > 2, aggro: 99 }); g.audio.roar && D.wave % 2 && g.audio.roar(); }
      if (D.t > 28 && !D.dad) { D.dad = g.npc('marcus', 'marcus', 0, -212, PI, 'Jog_Fwd_Loop'); D.dad.update = (dt) => { const p = D.dad.root.position; if (p.z > -246) { p.z -= 5 * dt; D.dad.play('Jog_Fwd_Loop'); } else D.dad.play('Pistol_Aim_Neutral'); };
        g.say([['marcus', 'KEEM! NIA! Told you. Right behind you!'], ['keem', 'Right behind us? That was like two HOURS, Dad!'], ['marcus', 'I stopped for gas. And a doughnut. Shut up and shoot, son.'], ['nia', 'DAD! You got Boston cream without me?!']]); }
      if (D.dad && (D.dcd = (D.dcd || 0) - dt) < 0) { D.dcd = .8; const dp = D.dad.root.position; let best = null, bd = 18; g.alive().forEach(z => { const d = z.root.position.distanceTo(dp); if (d < bd) { bd = d; best = z; } }); if (best) { const dir = best.root.position.clone().sub(dp).normalize(); D.dad.root.rotation.y = Math.atan2(dir.x, dir.z); g.damageZ(best, 70, dir, { head: Math.random() < .4 }); g.audio.shot('shotgun'); } }
      if (D.t >= D.len) { D.done = true; g.world.ch2.panel.material.emissive.set('#2f2'); g.openGate(true); g.audio.play && g.audio.play('reload_in', { vol: .8, flat: true });
        g.say([['nia', 'BEEP! It beeped! I am a genius!'], ['keem', 'Gate is open — GO, go, go!']], () => goto(g, 11, 500)); } } },

  { id: 'c2_boss', ch: 2, cp: [0, -260, PI], obj: 'Defeat Coach Brickman', hint: 'He charges like a linebacker. Sidestep, then unload. Headshots.', mood: 'tense', beat: 2,
    enter(g) { const D = g.stepData; g.ch2Reset(g, 11); g.npc('marcus', 'marcus', 2, -257.5, PI, 'Pistol_Aim_Neutral'); g.npc('nia', 'nia', -2, -257.5, PI, 'Idle_Loop', .62);
      const b = g.spawnZ(0, -284, { boss: true, hp: 1500, scale: 1.75, runner: false }); b.speed = 2.0; b.cd = 2; b.aggro = 99; b.mat.userData.u.uShirt.value.set('#b8202a'); b.mat.userData.u.uBlood.value = g.settings.gore ? 1.4 : .2; g.boss = b; $q('#bossn').textContent = 'COACH BRICKMAN — 31 years, 0 playoff wins';
      g.horde(5, [[-10, -282], [10, -282]], { aggro: 99 }); D.hordeAll = true; g.wpTarget = null; g.audio.roar && setTimeout(() => g.audio.roar(), 900);
      g.say([['brick', 'BEAVERS! ON THE LINE! RAAAGH!'], ['keem', 'Is that Coach Brickman? He failed me in GYM. In GYM, Dad!'], ['marcus', "Then go get your {damn |}grade back, son."], ['nia', 'He is eating a whistle. Like, the whole whistle.']]); },
    update(g) { if (g.boss && g.boss.dead && !g.stepData.won) { g.stepData.won = true; setTimeout(() => { g.say([['keem', 'Give me my A, Coach{, you sweaty bastard|}.'], ['marcus', "That's my boy. Ugly as hell, but that's my boy."], ['nia', 'Helicopter! Where is the helicopter?']]); goto(g, 12, 600); }, 1800); } } },

  { id: 'c2_end', ch: 2, cp: [0, -272, PI], obj: 'Find the evac helicopter', hint: 'Check the scoreboard.', mood: 'sad', beat: 0,
    enter(g) { const D = g.stepData; g.ch2Reset(g, 12); const dad = g.npc('marcus', 'marcus', 1.6, -270, PI, 'Walk_Loop'); const nia = g.npc('nia', 'nia', -1.4, -270, PI, 'Walk_Loop', .62); follow(g, dad, [1.6, 1.2]); follow(g, nia, [-1.2, .9]); D.dad = dad; g.wpTarget = [0, 1.2, -293];
      D.uses = [{ x: 0, z: -293.2, label: 'Read the scoreboard', fn: (g) => { D.uses = []; dad.update = nia.update = null; dad.root.position.set(1.6, 0, -291); nia.root.position.set(-1.4, 0, -291.4); dad.root.rotation.y = nia.root.rotation.y = PI; dad.play('Idle_Loop'); nia.play('Idle_Loop');
        g.world.ch2.board.material.map = g.world.signTex ? g.world.signTex(['EVAC LEFT EARLY. SORRY.', 'GO TO PORTLAND · FORT WILLIAMS', '— PFC DANNY, I AM SO SORRY'], '#101010') : g.world.ch2.board.material.map; g.world.ch2.board.material.needsUpdate = true;
        g.cut = { anim: 'Idle_Loop', cam: V(-3, 1.7, -287), look: V(0, 3.6, -296) }; g.audio.setMood('sad');
        g.say([['keem', '"Evac left early. Sorry. Go to Portland." They left EARLY? Who leaves EARLY?'], ['nia', 'Danny did. Danny is SO sorry.'], ['marcus', "Portland, then. Sixty miles. We've got a truck and half a doughnut."], ['nia', 'Dad… why is your sleeve wet?'], ['marcus', "It's nothing, baby. Glass. From the gate."], ['keem', '…Dad. Let me see your arm.'], ['marcus', "Keem. I said it's nothing. Get in the truck."]], () => { g.cut = { anim: 'Idle_Loop', cam: V(3, 1.5, -289), look: V(1.6, 1.2, -291) }; setTimeout(() => g.onComplete && g.onComplete(2), 1800); }); } }];
      g.say([['marcus', 'Stadium lights still on. Somebody was here.'], ['keem', 'Scoreboard says something. Come on.']]); } },

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
  // Chapter 2 loot
  { id: 'c2a', kind: 'ammo', item: 'light', n: 30, pos: [-4, .25, -146], minStep: 7 }, { id: 'c2b', kind: 'med', pos: [-15, .25, -149], minStep: 8 }, { id: 'c2c', kind: 'grenade', n: 2, pos: [16, .25, -150], minStep: 8 }, { id: 'c2d', kind: 'ammo', item: 'shell', n: 16, pos: [-9, .25, -168], minStep: 8 },
  { id: 'c2e', kind: 'cash', n: 150, pos: [-9.4, .25, -184], minStep: 9 }, { id: 'c2f', kind: 'ammo', item: 'rifle', n: 60, pos: [5.5, .25, -209], minStep: 9 }, { id: 'c2g', kind: 'med', pos: [-22, .25, -194], minStep: 9 }, { id: 'c2h', kind: 'cash', n: 200, pos: [24, .25, -206], minStep: 9 }, { id: 'c2i', kind: 'grenade', n: 2, pos: [-5, .25, -232], minStep: 9 }, { id: 'c2j', kind: 'weapon', item: 'axe', pos: [-24, .25, -214], label: 'Fire axe', minStep: 9 },
  { id: 'c2k', kind: 'ammo', item: 'rifle', n: 60, pos: [5, .25, -250], minStep: 10 }, { id: 'c2l', kind: 'med', pos: [-5, .25, -250], minStep: 10 }, { id: 'c2m', kind: 'cash', n: 300, pos: [10, .25, -290], minStep: 12 },
  pg(-16, -160, 'Captain Riverside #9: "Safe Zone (Not Safe)"', 7), pg(-30, -186, 'Captain Riverside #10: "Spin Cycle Massacre"', 9), pg(18, -217, 'Captain Riverside #11: "Boston Cream Catastrophe"', 9), pg(32, -214, 'Captain Riverside #12: "The Flood Remembers"', 9), pg(-34, -260, 'Captain Riverside #13: "Fourth and Doom"', 10), pg(-12, -294, 'Captain Riverside #14: "Portland or Bust"', 12),
];
