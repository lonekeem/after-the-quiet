import NARR_JSON from '../tools/narration.json';
export const NARR = NARR_JSON;
// Chapter 1: "The Day Before". Each segment is a checkpoint and fully sets up its own state.
export function makeChapter1(G) {
  const { W, npcs, P } = G;
  const HX = 0, HZ = -14;
  const segs = [
    // 0: morning, bedroom + kitchen
    async () => {
      G.setTOD('day'); G.placePlayer(HX - 4, HZ - 1.5, Math.PI); G.control(false);
      const k = G.kemoyModel; k.visible = true; k.position.set(HX - 4.1, 0, HZ - 2.6); k.rotation.y = 0.6;
      G.npc('marcus', HX + 5, HZ - 3.4, Math.PI); G.npc('nia', HX + 2, HZ - 0.4, Math.PI); G.npc('dana', HX + 3.9, HZ - 0.4, -Math.PI / 2);
      await G.fade(0, 1500);
      const cine = G.cine([HX - 3, 2.2, HZ + 1.5], [HX - 5.4, 0.9, HZ - 3.2], [HX - 4.2, 1.4, HZ - 1.4], 14000);
      G.chapterCard('CHAPTER ONE', 'The Day Before', 'Lone Keem, Maine · Saturday, October 24');
      await G.narrate('n_intro'); await cine; k.visible = false;
      G.placePlayer(HX - 4.6, HZ - 2.2, -0.3); G.control(true);
      await G.narrate('n_wake');
      G.objective('Grab your sketchbook from the desk');
      await G.waitInteract(W.refs.sketch, 'Take sketchbook'); W.refs.sketch.visible = false;
      await G.say([['Kemoy', 'There you are. Page forty-two. The bridge comic is almost done.']]);
      G.objective('Go to the kitchen');
      await G.waitZone(HX + 2, HZ - 2, 2.2);
      G.narrate('n_kitchen');
      await G.say([['Marcus', 'Morning, chief! Pancakes are... a little crispy. Call it Cajun style.'], ['Nia', "Kemoy! Biscuit wants a pancake too. He's a rabbit, he can't make his own."], ['Dana', "Hey, baby. I just got in. Somebody hug your tired mama before she falls asleep standing up."]]);
      G.objective('Say good morning to your family (0/3)');
      let n = 0; const left = new Set(['dana', 'marcus', 'nia']);
      const lines = { dana: [['Kemoy', 'Long night?'], ['Dana', "Long, weird night. A lot of folks with fevers from down the coast. Don't you worry about it. I'm home now."]],
        marcus: [['Kemoy', "Dad, that's not Cajun. That's charcoal."], ['Marcus', "Fixing things is just patience with a wrench, son. Pancakes too. I'm getting there."]],
        nia: [['Nia', 'Will you draw Biscuit in your comic? As a superhero?'], ['Kemoy', "...Fine. But he's the sidekick."], ['Nia', "He's the HERO. You're the sidekick."]] };
      while (left.size) {
        const target = await Promise.race([...left].map(nm => G.waitInteract(npcs[nm], 'Talk', 2.4).then(() => nm)));
        G.clearInteracts(); left.delete(target); await G.say(lines[target]); n++; G.objective(`Say good morning to your family (${n}/3)`);
      }
      G.objective('Turn on the radio');
      await G.waitInteract(W.refs.radio, 'Turn on radio'); G.audio.radioJingle();
      await G.say([['Radio (WLKM)', "Good morning, Lone Keem, Maine! It's a foggy fifty-one degrees on the harbor. The Lighthouse Diner's got pumpkin pie all weekend..."], ['Radio (WLKM)', '...and folks, the high school bake sale is at noon. Bring cash, bring appetite.']]);
      await G.say([['Marcus', "Theo's been out in the yard ten minutes throwing that football at our hedge. Go on, get out of here."]]);
    },
    // 1: yard, Theo, Walt
    async () => {
      G.setTOD('day'); G.placePlayer(HX, HZ + 3.5, Math.PI); G.control(true);
      G.npc('theo', HX + 4, HZ + 9, 0); G.npc('walt', 20, -9.4, 0); G.hideNpc('dana', 'marcus', 'nia');
      G.objective('Go outside, Theo is waiting'); W.refs.ball.visible = true;
      await G.waitZone(HX, HZ + 7, 2.5);
      G.narrate('n_yard');
      await G.say([['Theo', 'Finally! I threw it, like, a perfect spiral. Into your hedge. Can you find it? I think there are spiders.']]);
      G.objective('Find the football by the hedge');
      await G.waitInteract(W.refs.ball, 'Pick up football'); W.refs.ball.visible = false;
      G.objective('Throw it back to Theo');
      await G.waitInteract(npcs.theo, 'Throw ball', 4);
      await G.say([['Theo', 'Nice! Okay, okay. Did you hear about the flu thing? My mom says Portland is closing schools.'], ['Kemoy', "My mom said it's just people with fevers."], ['Theo', "That's how every movie starts, man. Every single one."]]);
      G.objective('Say hi to Mr. Abernathy next door');
      await G.waitInteract(npcs.walt, 'Talk to Walt', 2.6);
      G.narrate('n_walt');
      await G.say([['Walt', 'Morning, Kemoy. Tomatoes are coming in late again. Like me.'], ['Walt', "Here. My old compass. Took me home through fog thicker than this for forty years on the harbor."], ['Kemoy', "Mr. Abernathy, I can't take that."], ['Walt', 'Sure you can. So you can always find your way home. (coughs) Excuse me. Little bug going around.']]);
      G.objective('');
    },
    // 2: walk to the diner with Dad and Nia
    async () => {
      G.setTOD('day'); G.placePlayer(14, -2, -Math.PI / 2); G.control(true);
      G.npc('marcus', 12, -1); G.npc('nia', 12, -2.5); G.follow('marcus', 1); G.follow('nia', 2); G.hideNpc('theo', 'walt');
      await G.say([['Marcus', "Lighthouse Diner, my treat. Your mom needs sleep and I need coffee that isn't burnt."]]);
      G.objective('Walk to the Lighthouse Diner on Main Street');
      await G.waitZone(40, 4, 6); G.narrate('n_town');
      G.npc('ruth', 66, -15.5, 0);
      await G.waitZone(66, -12, 3);
      G.npc('marcus', 63.5, -12.4, Math.PI / 2); G.npc('nia', 64.4, -12.6, Math.PI / 2);
      await G.say([['Ruth', "Well if it isn't the Hart crew! Nia, honey, strawberry milkshake, on the house. Don't tell anybody."], ['Nia', "I'll tell EVERYBODY."], ['Ruth', 'Kemoy, still drawing those bridges? You put me in one of those comics, I want to be tall.']]);
      G.objective('Turn up the radio on the counter');
      await G.waitInteract(W.refs.dinerRadio, 'Turn up radio'); G.audio.staticBurst(1);
      await G.say([['Radio (WLKM)', '...interrupting this program. Authorities in Portland are reporting unrest at two area hospitals...'], ['Radio (WLKM)', '...residents are advised to stay indoors and avoid contact with anyone showing fever or confusion. Bangor officials have...']]);
      await G.say([['Ruth', "That's enough of that. Bad news is bad for business."]]);
      G.narrate('n_hints'); G.audio.siren(0.03, 10);
      await G.say([['Marcus', '(phone buzzing) ...Yeah. Yeah, Dana. Okay. I hear you.'], ['Marcus', "Your mom's going in early. Hospital called everybody. Let's head home so you can say bye."]]);
    },
    // 3: evening, goodbye, Walt
    async () => {
      G.setTOD('evening'); G.placePlayer(40, 0, Math.PI / 2); G.control(true);
      G.npc('marcus', 42, 0); G.npc('nia', 42, -1); G.follow('marcus', 1); G.follow('nia', 2); G.hideNpc('ruth', 'walt', 'theo');
      G.npc('dana', HX, HZ + 6.2, 0);
      G.objective('Head home before Mom leaves'); G.audio.siren(0.02, 8);
      await G.waitInteract(npcs.dana, 'Say goodbye to Mom', 2.6);
      await G.say([['Dana', "Come here. Both of you. Nia, you help Daddy make dinner. Not too crispy."], ['Dana', "Kemoy. You're the oldest. Look out for your sister tonight, okay? Lock the door."], ['Kemoy', "Mom, it's just a flu, right?"], ['Dana', "(long pause) I love you more than all the stars. Say it back, I'm late."], ['Kemoy', '...More than all the stars.']]);
      G.narrate('n_goodbye');
      await G.goTo('dana', HX - 15, 3); G.hideNpc('dana');
      G.npc('walt', 24.6, -6.6, Math.PI / 2); npcs.walt.lookAtPlayer = false;
      G.objective("Check on Mr. Abernathy. He hasn't been answering his door");
      G.npc('marcus', HX, HZ + 6.5, 0); G.npc('nia', HX + 1, HZ + 6.5, 0);
      await G.waitZone(23, -4.5, 2.6);
      await G.say([['Kemoy', 'Mr. Abernathy? ...Walt? You okay? Your tomatoes are all smashed.'], ['Kemoy', "...Mr. Abernathy?"]]);
      G.narrate('n_evening'); G.audio.siren(0.04, 10);
      await G.say([['Marcus', "Kemoy! Inside. Now. Leave him be. I'll call somebody."]]);
      G.objective('Go home and go to bed');
      G.hideNpc('marcus', 'nia');
      await G.waitInteract({ x: HX - 5.6, z: HZ - 3.2 }, 'Go to sleep', 2.4);
      G.control(false); await G.fade(1, 1500);
    },
    // 4: night, Walt in the kitchen
    async () => {
      G.setTOD('night'); G.placePlayer(HX - 5, HZ - 1.4, -Math.PI / 2); G.control(false); G.hideNpc('walt', 'nia', 'marcus');
      await G.fade(1, 10); await G.wait(800); G.audio.glass(); await G.wait(400); await G.fade(0, 1500);
      G.narrate('n_night'); G.control(true);
      G.objective('Find the flashlight on your nightstand');
      await G.waitInteract(W.refs.flashlight, 'Take flashlight'); W.refs.flashlight.visible = false; G.giveLight();
      G.npc('marcus', HX + 2.5, HZ - 3); G.audio.staticBurst(2);
      const wz = G.spawnZombie(HX + 4.3, HZ - 3, { base: { ...CASTWALT }, hp: 3, speed: 0.6, idle: true });
      await G.say([['Radio (Emergency)', 'This is the Emergency Alert System. Remain indoors. Do not approach infected persons. This is not a test.']]);
      G.objective('Check on Dad in the kitchen');
      await G.waitZone(HX - 0.4, HZ, 1.6);
      G.audio.groan(0.2);
      await G.say([['Marcus', "Walt, stop! Walt, it's me, it's Marcus! KEMOY, STAY BACK!"], ['Marcus', 'The bat! By your door! Get the bat!']]);
      G.objective('Grab your baseball bat by the bedroom door');
      await G.waitInteract({ x: HX - 1.6, z: HZ + 1.6 }, 'Take baseball bat', 2); G.giveBat();
      wz.idle = false; wz.aggro = 30;
      G.objective('Help Dad! (Swing: Click / F / X / HIT)');
      await G.waitKill([wz]);
      await G.say([['Marcus', "(breathing hard) He... he wasn't Walt anymore. You hear me? That wasn't him."], ['Marcus', "Get your sister. We're going. Right now."]]);
      G.npc('nia', HX + 5, HZ + 2); G.audio.siren(0.06, 10);
      await G.say([['Nia', "(humming, then crying) Kemoy, where's Mom? Is Mom coming?"], ['Kemoy', "Hey. Hey. Hold Biscuit. Stay right behind me, okay? Like the sidekick."]]);
      await G.fade(1, 900);
    },
    // 5: street to Theo's
    async () => {
      G.setTOD('night'); G.placePlayer(HX, HZ + 6, Math.PI / 2); G.control(true); G.giveBat(); G.giveLight();
      G.npc('marcus', HX + 1, HZ + 5); G.npc('nia', HX - 1, HZ + 5); G.follow('marcus', 1); G.follow('nia', 2); G.hideNpc('walt', 'theo');
      await G.fade(0, 1000); G.narrate('n_street');
      [[-6, 1], [-12, -2], [-16, 3], [-25, 0], [-18, 7]].forEach(([x, z]) => G.spawnZombie(x, z, { aggro: 14 }));
      G.objective("Get to Theo's house next door");
      await G.waitZone(-20, -8.5, 2.5);
      G.npc('theo', -20, -9.2, 0);
      await G.say([['Theo', "Kemoy?! Oh thank God. My mom... she went to help Mrs. Pelletier and she came back... she didn't talk. She just didn't talk."], ['Kemoy', "Come with us. Right now. Don't look back."], ['Theo', "This isn't like the movies, man. In the movies you don't know them."]]);
      G.follow('theo', 3);
      await G.say([['Marcus', "The truck is at the shop. Hart's Auto, down Front Street. Stay close and stay quiet."]]);
    },
    // 6: run to Hart's Auto, Mom
    async () => {
      G.setTOD('night'); G.placePlayer(-14, -4, -Math.PI / 2); G.control(true); G.giveBat(); G.giveLight();
      G.npc('marcus', -15, -3); G.npc('nia', -16, -3); G.npc('theo', -16, -4); G.follow('marcus', 1); G.follow('nia', 2); G.follow('theo', 3);
      G.objective("Get to Hart's Auto on Front Street");
      [[30, 2], [36, -2], [52, 1], [58, -3], [70, 2], [74, -1], [88, 3], [95, -2], [100, 1]].forEach(([x, z]) => G.spawnZombie(x, z, { aggro: 16, speed: 1 + Math.random() * 0.7 }));
      G.audio.setMood('tense');
      await G.waitZone(110, -10, 3.5);
      G.objective(''); G.control(false); G.clearZombies();
      G.npc('marcus', 109, -11, 0); G.npc('nia', 111, -11.5, 0); G.npc('theo', 112, -10.5, 0);
      G.placePlayer(110, -12.5, 0);
      const car = W.refs.momCar; car.visible = true; car.position.set(150, 0, 2); car.rotation.y = -Math.PI / 2;
      const t0 = performance.now(); await new Promise(r => { const iv = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / 2500); car.position.x = 150 - 38 * k; car.position.z = 2 - 3 * k; if (k >= 1) { clearInterval(iv); r(); } }, 16); });
      G.audio.crash(); car.rotation.y = -Math.PI / 2 + 0.5;
      await G.wait(1200);
      G.npc('dana', 110.5, -3, Math.PI);
      G.audio.setMood('sad'); G.narrate('n_garage');
      await G.goTo('dana', 110.5, -7.5);
      await G.say([['Nia', 'MOMMY!'], ['Dana', "Stop. Stop right there, baby. Don't come closer. Marcus, keep her back."], ['Marcus', 'Dana... Dana, your arm.'], ['Dana', "One of my patients. It's okay. I knew where you'd go. I just... had to see you."]]);
      G.objective('Go to Mom');
      G.control(true); G.placePlayer(110.5, -9.7, 0);
      await G.waitInteract(npcs.dana, 'Hold Mom', 2.6); G.control(false);
      await G.say([['Dana', "Kemoy. Look at me. You are braver than you know. You always were. You just never had to prove it."], ['Kemoy', "No. No, we can fix it. Dad can fix anything. Mom, please."], ['Dana', 'Some things you can only carry. Carry your sister. Carry your dad when he needs it. He will.'], ['Dana', "Nia, give Biscuit a kiss for me. He's the hero, remember?"], ['Dana', 'Marcus. Go. Get them over the bridge. I love you. I love all of you more than all the stars.'], ['Kemoy', '...More than all the stars.']]);
      await G.goTo('dana', 110.5, -4.6);
      // she pulls the door down
      const gd = W.refs.gdoor; const t1 = performance.now(); await new Promise(r => { const iv = setInterval(() => { const k = Math.min(1, (performance.now() - t1) / 2500); gd.scale.y = 0.8 + 3.6 * k; gd.position.y = 3.9 - 1.8 * k; if (k >= 1) { clearInterval(iv); r(); } }, 16); });
      G.hideNpc('dana'); G.audio.thud();
      await G.wait(1500);
      await G.say([['Nia', "(crying) Why did Mom close the door? Kemoy? Why'd she close it?"], ['Kemoy', "...Because she's a hero, Nia. Come on. Stay with me."]]);
      await G.fade(1, 1500);
    },
    // 7: bridge
    async () => {
      G.setTOD('night'); G.W.refs.momCar.visible = true; G.W.refs.momCar.position.set(112, 0, -1);
      G.W.refs.gdoor.scale.y = 4.4; G.W.refs.gdoor.position.y = 2.1;
      G.placePlayer(113, -3, -Math.PI / 2); G.control(true); G.giveBat(); G.giveLight();
      G.npc('marcus', 112, -2); G.npc('nia', 111.5, -3); G.npc('theo', 112, -4); G.follow('marcus', 1); G.follow('nia', 2); G.follow('theo', 3);
      await G.fade(0, 1200);
      await G.say([['Marcus', "Truck won't make it past the wreck. The Harbor Bridge, there's a Guard checkpoint. Run. Don't stop for anything."]]);
      G.objective('RUN to the Harbor Bridge checkpoint');
      G.audio.setMood('tense'); G.flood.forEach(f => f.sl.intensity = 60);
      for (let i = 0; i < 14; i++) G.spawnZombie(95 + Math.random() * 10, (Math.random() - 0.5) * 8, { aggro: 60, speed: 1.6 + Math.random() * 0.8 });
      [[128, 3], [134, -3], [140, 2]].forEach(([x, z]) => G.spawnZombie(x, z, { aggro: 12 }));
      await G.waitZone(152, 0, 2.5);
      G.objective(''); G.control(false); G.clearZombies();
      G.placePlayer(155, 0, Math.PI / 2);
      G.npc('marcus', 151.5, 0.2, -Math.PI / 2); G.npc('nia', 154.2, 0.8, -Math.PI / 2); G.npc('theo', 154.3, -0.9, -Math.PI / 2);
      for (let i = 0; i < 18; i++) G.spawnZombie(128 + Math.random() * 10, (Math.random() - 0.5) * 9, { idle: true });
      await G.say([['Theo', "There's nobody here. Where are the soldiers? WHERE ARE THE SOLDIERS?"], ['Marcus', "The gate's jammed open. Somebody's got to hold it while you get across."], ['Kemoy', 'Dad, no. Dad, come with us!']]);
      await G.say([['Marcus', 'Hey. Hey, chief. Look at me. Fixing things is just patience with a wrench, right? I got this.'], ['Marcus', "Walt's compass. Keep heading east. I'll be right behind you."]]);
      G.narrate('n_bridge');
      G.zombies.forEach(z => { z.idle = false; z.aggro = 80; z.speed = 0.4; });
      G.objective('Get Nia across the bridge');
      G.follow('nia', 1); G.follow('theo', 2); G.control(true); npcs.marcus.lookAtPlayer = false; npcs.marcus.rotation.y = -Math.PI / 2;
      setTimeout(() => G.audio.groan(0.25), 2000);
      await G.waitZone(185, 0, 3);
      G.flood.forEach(f => f.sl.intensity = 0); G.audio.thud(); G.setTOD('night');
      G.objective(''); G.control(false);
      await G.wait(1200); G.audio.staticBurst(3);
      await G.say([['Radio (unknown)', '...kzzt... Kemoy? ...Kemoy Hart, if you can hear this... head for the water tower... kzzt...']]);
      await G.say([['Kemoy', "...That voice. Nia. Did you hear that?"]]);
      await G.fade(1, 2000);
      await G.narrate('n_end');
      G.finishChapter();
      await G.chapterCard('END OF CHAPTER ONE', 'To Be Continued', 'Chapter Two · High Water · Coming Soon', 6000);
      G.quitToTitle();
    },
  ];
  const CASTWALT = { skin: 0xd8b398, hair: 'grey', hairColor: 0xb8b8b0, shirt: 0x6b5a43, pants: 0x4a4a42, h: 0.98 };
  return {
    cur: 0,
    async run(start, tok) {
      for (let i = start; i < segs.length; i++) { if (tok !== G.token()) return; this.cur = i; G.checkpoint(i); await segs[i](); }
    },
  };
}
