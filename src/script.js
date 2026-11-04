// After the Quiet — Chapter 1 "The Day Before". Cinematic script.
// Beat types: {n} narration, {s:[who,text]} line, {choice:[{t,flag,r:[[who,text]]}]},
// {hot:[{x,y,l,look?,item?,talk?}],need}, {qte:{type,time,count?}}, {item}, {wait}, {sfx}, {ifFlag,then}
export const CAST = {
  kemoy: { name: 'Kemoy', color: '#9ee6b0', img: 'char_kemoy' },
  marcus: { name: 'Dad', color: '#f0c27a', img: 'char_marcus' },
  dana: { name: 'Mom', color: '#f2a6b8', img: 'char_dana' },
  nia: { name: 'Nia', color: '#ffd9f0', img: 'char_nia' },
  theo: { name: 'Theo', color: '#9fd0ff', img: 'char_theo' },
  walt: { name: 'Walt', color: '#d6c49a', img: 'char_walt' },
  ruth: { name: 'Ruth', color: '#ffb487', img: 'char_ruth' },
  pell: { name: 'Mrs. Pell', color: '#e8b0a0' },
  mailman: { name: 'Dale the mailman', color: '#a8c0e8' },
  fisher: { name: 'Fisherman', color: '#c8d8a0' },
  regular: { name: 'Regular', color: '#d8c8a8' },
  gus: { name: 'Gus', color: '#c0a888' },
  barber: { name: 'Barber', color: '#b8d0c0' },
  radio: { name: 'Radio', color: '#b8c8b8' },
  tv: { name: 'News', color: '#b8c8e8' },
};
export const ITEMS = {
  compass: { name: "Walt's compass", desc: 'Brass, dented, still points true. "So you can always find your way home."' },
  sketchbook: { name: 'Sketchbook', desc: 'Half full of comics. The hero is a kid who builds bridges.' },
  flashlight: { name: 'Flashlight', desc: 'Heavy, black, fresh batteries. Dad keeps it in the junk drawer.' },
  bat: { name: 'Baseball bat', desc: 'Ash wood, taped grip. Little League, 2nd place.' },
};
export const SCENES = [
 { id: 'trailer', trailer: true, img: 'p01_city', kb: 'in', fx: ['embers'], mood: 'menu', act: 'Prologue', beats: [
   { shot: 'p01_city', kb: 'in', fx: ['embers'], n: 'Everybody remembers where they were, the day the world ended.' },
   { shot: 'p02_highway', kb: 'right', fx: ['dust'], n: 'The highways came first. Everyone running somewhere, and nowhere left to run.' },
   { shot: 'p08_suburb', kb: 'out', fx: ['fog', 'embers'], n: 'Then the towns. One by one, the lights went out.' },
   { shot: 'p03_bridge_horde', kb: 'left', fx: ['fog'], n: 'We called them the Quiet. Because they stopped talking first.' },
   { shot: 'p04_flood', kb: 'in', fx: ['rain'], n: 'The water rose. Nobody came to stop it.' },
   { shot: 'p05_mall', kb: 'out', fx: ['dust'], n: 'We hid in the places we used to spend our Saturdays.' },
   { shot: 'p06_subway', kb: 'in', fx: ['flicker'], n: 'And under the ground, the dark was full.' },
   { shot: 'p07_snow_town', kb: 'right', fx: ['snow'], n: 'I am an old man now. I have had a long time to remember.' },
   { shot: 's01_town', kb: 'out', fx: ['fog'], n: 'But I do not remember the end, so much. I remember the day before.' },
   { black: 'The day before...' },
   { shot: 's01_town', kb: 'in', fx: ['fog'], n: 'It was the best day I ever had. In Lone Keem, Maine.' },
   { card: ['CHAPTER ONE', 'The Day Before'] } ] },
 { id: 'bedroom', goal: 'Get ready. Grab your sketchbook.', img: 's02_bedroom', kb: 'in', fx: ['dust'], mood: 'day', cp: true, act: 'Act I · An Ordinary Saturday', beats: [
   { n: 'I was thirteen. The fog came in off the harbor every morning, like it was checking on us.' },
   { n: 'That Saturday, nothing in the world was wrong yet.' },
   { obj: 'Get ready. Grab your sketchbook.' },
   { hot: [
     { x: 30, y: 62, l: 'Sketchbook', item: 'sketchbook', look: 'My comic. Captain Rivet, the kid who builds bridges.' },
     { x: 72, y: 38, l: 'Window', look: 'Fog over the harbor. The bridge lights still on from the night.' },
     { x: 52, y: 30, l: 'Poster', look: 'Golden Gate blueprint poster. Someday.' } ], need: ['sketchbook'] },
   { s: ['marcus', 'Kemoy! Pancakes! Well. Pancake-shaped objects!'] } ] },
 { id: 'kitchen', goal: 'Breakfast with Dad and Nia', img: 's03_kitchen', kb: 'left', mood: 'day', beats: [
   { n: 'My father could fix any engine in the county. But he could not make a pancake, to save his life.' },
   { s: ['marcus', 'Morning, chief. Chef recommends the dark ones. Extra crunch.'] },
   { s: ['nia', 'Biscuit wants a pancake too. A not-burnt one.'] },
   { choice: [
     { t: '"Dad, these are charcoal."', flag: 'teased', r: [['marcus', 'Charcoal is just a pancake with experience.']] },
     { t: 'Give Biscuit your pancake.', flag: 'kind', r: [['nia', 'Biscuit says you are the best brother. Today.']] },
     { t: '"Is Mom home yet?"', r: [['marcus', 'Any minute. Long night at County.']] } ] },
   { hot: [
     { x: 18, y: 40, l: 'Radio', look: 'WLKM, Lone Keem Morning. Tide report and a bake sale.' },
     { x: 60, y: 55, l: 'Dad', talk: [['marcus', 'Fixing things is just patience with a wrench. Pancakes too. Mostly.']] },
     { x: 80, y: 60, l: 'Nia', talk: [['nia', 'Why is fog? Where does it go at night?'], ['kemoy', 'Back to the ocean. It has a curfew.']] } ], optional: true } ] },
 { id: 'mom', img: 's04_mom_home', kb: 'in', mood: 'day', beats: [
   { n: 'My mother came home from her night shift, smelling of hospital soap.' },
   { s: ['dana', 'Something smells... structurally unsound.'] },
   { s: ['marcus', 'It is called flavor, nurse Hart.'] },
   { s: ['dana', 'Long night. Lot of folks down from the coast with a fever. Wash your hands today, okay? Both of you.'] },
   { n: 'We laughed a lot in that kitchen.' } ] },
 { id: 'yard', goal: 'Head outside', img: 's05_yard', kb: 'right', fx: ['dust'], mood: 'day', beats: [
   { n: 'Theo Lindqvist lived next door. He knew every horror movie ever made.' },
   { n: 'Turns out, that does not help you one bit.' },
   { s: ['theo', 'Go long! No, longer! Okay, that was way too long.'] },
   { s: ['kemoy', 'You threw it into Walt\'s hedge. Again.'] },
   { obj: 'Find the football in the hedge.' } ] },
 { id: 'hedge', img: 's06_hedge', kb: 'in', mood: 'day', beats: [
   { hot: [
     { x: 25, y: 55, l: 'Branches', look: 'Just sticks and a very angry spider.' },
     { x: 66, y: 64, l: 'Football', item: '_ball', look: 'Got it. Muddy but alive.' },
     { x: 48, y: 30, l: 'Tomatoes', look: 'Walt\'s tomatoes. Still green. In October.' } ], need: ['_ball'] },
   { s: ['theo', 'Did you know in every zombie movie, the first guy is always a neighbor? Always.'] },
   { choice: [
     { t: '"Walt is not a zombie, Theo."', r: [['theo', 'That is exactly what the second guy says.']] },
     { t: '"Then you go get the ball next time."', flag: 'theoBold', r: [['theo', 'Fine. I will. Probably. In daylight.']] } ] } ] },
 { id: 'walt', goal: 'Visit Walt next door', img: 's07_walt_porch', kb: 'left', mood: 'day', cp: true, beats: [
   { n: 'Walt Abernathy was seventy four. And he still grew tomatoes too late in the year.' },
   { s: ['walt', 'That ball has been in my hedge more than my cat ever was.'] },
   { s: ['walt', 'Come here, son. I want you to have something.'] },
   { s: ['walt', 'Forty years on the harbor, this never lied to me once. So you can always find your way home.'] },
   { item: 'compass' } ] },
 { id: 'compass', img: 's08_compass', kb: 'in', mood: 'day', beats: [
   { n: 'He gave me his old compass that morning. I have it still.' },
   { s: ['walt', 'Pardon me. Bad flu going down the coast. They say Portland is full up with it.'] },
   { choice: [
     { t: '"Thank you, Walt. I will keep it safe."', flag: 'thanked', r: [['walt', 'I know you will.']] },
     { t: '"You should see my mom. She is a nurse."', flag: 'warnedWalt', r: [['walt', 'Your mother has enough on her plate. I am tough as old rope.']] } ] } ] },
 { id: 'streetlife', goal: 'Say hi to the neighbors (optional)', img: 's42_street_life', kb: 'right', fx: ['dust'], mood: 'day', beats: [
   { n: 'Saturday on Birch Street. Everybody was out, doing the small things that made a life.' },
   { n: 'Mrs. Pell, fighting the same leaves she fought every October. Dale, with the mail. Theo, showing off.' },
   { s: ['theo', 'Kemoy! Watch this. Watch. Are you watching?'] },
   { s: ['pell', 'Theodore Lindqvist, if you land in my leaves, you are raking them.'] },
   { hot: [
     { x: 12, y: 55, l: 'Mrs. Pell', talk: [['pell', 'Forty years I have raked this yard. The tree wins every year.'], ['kemoy', 'Want help?'], ['pell', 'You are a good boy. Your mother raised you right.']] },
     { x: 58, y: 48, l: 'Dale', talk: [['mailman', 'Morning, Kemoy. Nothing for you but a catalog. Lucky you.']] },
     { x: 80, y: 72, l: 'Dog', look: 'Sunny, the Morrisons\' retriever. She has never once met a stranger.' },
     { x: 77, y: 40, l: 'Porch', look: 'The Morrisons, coffee in hand, arguing about the Red Sox. Like always.' },
     { x: 47, y: 62, l: 'Theo', talk: [['theo', 'Kickflip. Almost. That counts.'], ['kemoy', 'It does not count.']] } ], optional: true },
   { n: 'I did not know I was memorizing it.' } ] },
 { id: 'main', goal: 'Walk into town', img: 's09_mainstreet', kb: 'right', mood: 'day', beats: [
   { n: 'Lone Keem had one bridge, one diner, and four thousand people who all knew your business.' },
   { n: 'I thought it would always be there.' },
   { hot: [
     { x: 20, y: 45, l: 'Town sign', look: 'Welcome to Lone Keem, Maine. Est. 1791.' },
     { x: 70, y: 48, l: 'Lighthouse Diner', look: 'Best fries in Hancock County. Ruth says so on the menu.' } ], optional: true } ] },
 { id: 'mainbusy', goal: 'Look around Main Street (optional)', img: 's47_main_busy', kb: 'left', fx: ['dust'], mood: 'day', beats: [
   { n: 'By noon, the whole town was on Main Street. Pumpkins at the market. Old couples on the benches.' },
   { n: 'Officer Kowalski, talking fishing with whoever would listen.' },
   { hot: [
     { x: 88, y: 58, l: 'Barber', talk: [['barber', 'Your dad is overdue for a trim. Tell him I said so. Twice.']] },
     { x: 12, y: 62, l: 'Market', look: 'Maine pumpkins, three dollars a pound. Nia wants the biggest one ever grown.' },
     { x: 62, y: 50, l: 'Officer', look: 'Kowalski. He waves. He always waves.' },
     { x: 76, y: 60, l: 'Bench', look: 'The Abbotts. Married sixty-one years. They still hold hands.' } ], optional: true } ] },
 { id: 'diner', goal: 'Lunch at Ruth’s diner', img: 's10_diner', kb: 'in', mood: 'day', beats: [
   { s: ['ruth', 'Well, if it is not the Hart gang. Usual, Marcus? Burnt, I hear.'] },
   { s: ['marcus', 'News travels fast.'] },
   { s: ['ruth', 'Honey, in this town news travels before it happens. Strawberry milkshake for the princess. On the house.'] },
   { s: ['nia', 'Biscuit says thank you.'] } ] },
 { id: 'dinerbusy', goal: 'Talk to the regulars (optional)', img: 's44_diner_busy', kb: 'in', mood: 'day', beats: [
   { n: 'Ruth knew everyone\'s order before they sat down.' },
   { s: ['ruth', 'Coffee, black, and your opinion on the weather, which nobody asked for.'] },
   { s: ['regular', 'Fog is thick out on the point today, Ruth. Thicker than your pie crust.'] },
   { s: ['ruth', 'Keep talking, Earl, and you will be wearing that coffee.'] },
   { hot: [
     { x: 14, y: 60, l: 'Earl', talk: [['regular', 'Heard the radio out of Bangor. Some kind of flu. Folks acting strange.'], ['ruth', 'Folks in Bangor always act strange.']] },
     { x: 70, y: 35, l: 'Waitress', look: 'Molly. Saving for nursing school, like Mom.' },
     { x: 50, y: 40, l: 'Ruth', talk: [['ruth', 'You tell your mama I have a slice of blueberry with her name on it.']] } ], optional: true } ] },
 { id: 'comics', img: 's40_comics', kb: 'left', fx: ['dust'], mood: 'day', beats: [
   { n: 'After lunch, Theo and I sat on his porch steps, and drew until our hands hurt.' },
   { s: ['theo', 'Okay, Captain Rivet needs a sidekick. Someone brave. Handsome. Named Theo.'] },
   { s: ['kemoy', 'Captain Rivet works alone.'] },
   { s: ['theo', 'Everybody says that. Then issue two comes out, and boom. Sidekick.'] },
   { choice: [
     { t: 'Draw Theo in as the sidekick.', flag: 'sidekick', r: [['theo', 'Is that me? Why is my cape so small?'], ['kemoy', 'It is a starter cape. You earn the big one.']] },
     { t: 'Draw Theo as the villain.', r: [['theo', 'Doctor Lindqvist. Okay. Okay, honestly? I love it.']] } ] },
   { n: 'I wish I still had those pages. I would give a lot, to see his little cape again.' } ] },
 { id: 'dock', goal: 'Go down to the dock', img: 's39_dock', kb: 'right', mood: 'day', beats: [
   { n: 'Later, my father took me down to the town dock. We never caught anything. That was never the point.' },
   { s: ['marcus', 'You know why I like fishing, chief?'] },
   { s: ['kemoy', 'Because you are bad at it, and fish cannot laugh at you?'] },
   { s: ['marcus', 'Because for one hour, nothing needs fixing. Just you, me, and a whole lot of patient water.'] },
   { choice: [
     { t: '"Can we do this every Saturday?"', flag: 'everySat', r: [['marcus', 'Every Saturday. That is a promise. Write it in your comic.']] },
     { t: '"Dad, are you worried about the flu thing?"', r: [['marcus', 'Your mom is on it. And if your mom is on it, it is handled.']] } ] },
   { n: 'The gulls were loud, and the water was gold. I remember thinking, this is what normal feels like.' },
   { n: 'You never know, you are in the last of something.' } ] },
 { id: 'harbor', goal: 'Watch the boats come in (optional)', img: 's43_harbor_life', kb: 'right', fx: ['fog'], mood: 'day', beats: [
   { n: 'Down at the harbor, the boats came in heavy. Gulls screaming. Diesel and salt.' },
   { s: ['fisher', 'Good haul, boys! Lobster for the whole county!'] },
   { hot: [
     { x: 85, y: 78, l: 'Old man', talk: [['fisher', 'Forty years mending nets. Sea gives, sea takes.']] },
     { x: 53, y: 55, l: 'Kid', look: 'Somebody\'s little brother, feeding the gulls french fries. They will follow him home.' },
     { x: 30, y: 45, l: 'Boat', look: 'The Mary Ellen. Paint peeling. Still the fastest boat in the harbor.' } ], optional: true } ] },
 { id: 'piggy', img: 's41_piggyback', kb: 'out', fx: ['dust'], mood: 'day', beats: [
   { s: ['nia', 'Faster, horsey! Biscuit wants to see the lighthouse!'] },
   { s: ['kemoy', 'This horsey charges by the minute.'] },
   { s: ['nia', 'I will pay you one hug. And half a milkshake.'] },
   { n: 'Nia weighed about as much as a bag of groceries. I carried her the whole way home, and complained the whole way.' },
   { n: 'I would carry her a lot farther, before that week was over.' } ] },
 { id: 'shopday', goal: 'Hang out at Hart’s Auto', img: 's45_shop_day', kb: 'left', mood: 'day', beats: [
   { n: 'That afternoon, I sat in Dad\'s shop and drew while he worked.' },
   { s: ['marcus', 'Gus. Nine-sixteenths. No. The other nine-sixteenths.'] },
   { s: ['gus', 'There is only one nine-sixteenths, Marcus.'] },
   { s: ['marcus', 'Then it is hiding.'] },
   { hot: [
     { x: 42, y: 20, l: 'Old radio', look: 'WLKM again. Between songs, the DJ mentions roadblocks near Portland. Then plays more Fleetwood Mac.' },
     { x: 26, y: 40, l: 'Customer', look: 'Mr. Dunn, waiting on his truck. He coughs a lot. Says it is allergies.' },
     { x: 60, y: 82, l: 'Dad', talk: [['marcus', 'One day this shop is yours, if you want it. If you want bridges instead, that is fine too.']] } ], optional: true } ] },
{ id: 'momlunch', img: 's46_mom_lunch', kb: 'in', fx: ['dust'], mood: 'day', beats: [
   { n: 'Mom picked up an extra shift. County was short. More fevers.' },
   { s: ['nia', 'Biscuit is having tea. You are not invited, Mom, because you are leaving.'] },
   { s: ['dana', 'I will be back before Biscuit finishes her second cup. Promise.'] },
   { n: 'She looked worried. I did not ask why. I wish I had asked why.' } ] },
 { id: 'tv', goal: 'Something is wrong. Watch the news.', img: 's11_diner_tv', kb: 'in', fx: ['flicker'], mood: 'evening', act: 'Act II · Creeping Hints', cp: true, beats: [
   { s: ['tv', 'Breaking tonight. Reports of unrest in Portland. Residents are advised to stay indoors and avoid—'] },
   { s: ['ruth', 'That is enough of that.'] },
   { n: 'The radio said Portland. Then it said Bangor.' },
   { n: 'Grown ups have a way of turning off a radio, that tells a child everything.' } ] },
 { id: 'heli', img: 's12_helicopter', kb: 'out', mood: 'evening', beats: [
   { sfx: 'siren' },
   { s: ['theo', 'That is a military helicopter. That is a very bad movie sign.'] },
   { s: ['marcus', 'It is probably a drill, Theo. Kemoy, your mom is calling.'] } ] },
 { id: 'goodbye', img: 's13_goodbye', kb: 'in', mood: 'sad', beats: [
   { s: ['dana', 'They need everybody at County. I will be back by breakfast.'] },
   { choice: [
     { t: 'Hug her.', flag: 'hugged', r: [['dana', 'Hey. You are braver than you know. Look after your sister.']] },
     { t: '"You just got home."', r: [['dana', 'I know, baby. I know. Breakfast. I promise.']] } ] },
   { n: 'She hugged me at the door longer than usual. I pretended I did not notice.' },
   { n: 'I wish I had held on.' } ] },
 { id: 'waltdoor', img: 's38_walt_door', kb: 'left', mood: 'evening', fx: ['fog'], beats: [
   { n: 'By evening the sirens had stopped sounding far away.' },
   { obj: 'Check on Walt.' },
   { hot: [
     { x: 32, y: 38, l: 'Knock', look: 'Nothing. Not even the TV.' },
     { x: 33, y: 88, l: 'Newspaper', look: 'This morning\'s paper. He always reads it by seven.' } ], need: ['Knock'] } ] },
 { id: 'waltwall', img: 's14_walt_wall', kb: 'in', fx: ['fog'], mood: 'tense', beats: [
   { n: 'Mister Abernathy was standing in his yard, facing the wall.' },
   { s: ['kemoy', 'Walt? Mister Abernathy?'] },
   { n: 'He did not answer, when I called his name.' },
   { choice: [
     { t: 'Step closer.', flag: 'closer', r: [['kemoy', 'Walt... are you okay?']] },
     { t: 'Back away. Go home.', r: [] } ] },
   { sfx: 'groan' } ] },
 { id: 'dinner', img: 's15_dinner', kb: 'right', mood: 'evening', fx: ['flicker'], beats: [
   { s: ['nia', 'Is Mom okay?'] },
   { s: ['marcus', 'Mom is the most okay person I know. Eat your peas.'] },
   { choice: [
     { t: 'Draw Nia a comic.', flag: 'comic', r: [['nia', 'Biscuit is a superhero? With a cape?'], ['kemoy', 'Captain Biscuit. Fears nothing. Except baths.']] },
     { t: '"She will be home by breakfast."', r: [['nia', 'Promise?'], ['kemoy', 'Promise.']] } ] } ] },
 { id: 'hallway', goal: 'Find out what the noise is', img: 's16_hallway', kb: 'in', fx: ['flicker'], mood: 'night', act: 'Act III · The Night It Changes', cp: true, beats: [
   { n: 'At two in the morning, I heard glass break downstairs.' },
   { sfx: 'glass' },
   { n: 'That was the end of the quiet. And the beginning, of the other kind.' },
   { s: ['marcus', 'Stay with your sister. I mean it.'] } ] },
 { id: 'alert', img: 's17_tv_alert', kb: 'in', fx: ['flicker'], mood: 'tense', beats: [
   { s: ['radio', 'This is the Emergency Alert System. Residents of Hancock County, remain indoors. Do not approach anyone showing signs of illness.'] },
   { obj: 'Find the flashlight.' } ] },
 { id: 'drawer', goal: 'Get the flashlight', img: 's37_drawer', kb: 'in', mood: 'tense', beats: [
   { hot: [
     { x: 44, y: 60, l: 'Flashlight', item: 'flashlight', look: 'Got it. Heavy. Good.' },
     { x: 12, y: 60, l: 'Bat', item: 'bat', look: 'Little League bat. It will have to do.' },
     { x: 74, y: 22, l: 'Radio', look: 'Same message. Over and over.' } ], need: ['flashlight', 'bat'] } ] },
 { id: 'waltin', img: 's18_walt_infected', kb: 'in', gore: true, mood: 'tense', fx: ['flicker'], beats: [
   { n: 'Walt was in our kitchen. He was not Walt anymore.' },
   { s: ['kemoy', 'Walt, it is me. It is Kemoy—'] },
   { qte: { type: 'press', time: 1.6, label: 'DODGE' } } ] },
 { id: 'dadfight', goal: 'Help Dad!', img: 's19_dad_fight', kb: 'in', gore: true, mood: 'tense', fx: ['flicker'], beats: [
   { s: ['marcus', 'Kemoy, get BACK!'] },
   { qte: { type: 'mash', time: 3.2, count: 12, label: 'HELP DAD' } },
   { s: ['marcus', 'Garage. Now. Grab your sister. Go, go!'] } ] },
 { id: 'garage', img: 's20_garage', kb: 'right', mood: 'night', beats: [
   { s: ['nia', 'Is that Mister Walt? Why is he making that noise?'] },
   { choice: [
     { t: '"Don\'t look. Hold my hand."', flag: 'heldHand', r: [['nia', 'Okay. Biscuit is holding your other hand.']] },
     { t: '"He is sick. We have to go."', r: [['nia', 'Like Mom said? The fever?']] } ] } ] },
 { id: 'street', goal: 'Get to Theo’s house', img: 's21_street_night', kb: 'left', fx: ['fog', 'embers'], mood: 'night', cp: true, beats: [
   { n: 'The town I knew was gone in a single night.' },
   { n: 'The fog was full of people, who were not people anymore. They did not speak.' },
   { n: 'That is why we called it, the Quiet.' },
   { s: ['marcus', 'Theo\'s house first. Stay low. Light off unless you need it.'] } ] },
 { id: 'falls', goal: 'RUN. Stay with Dad.', img: 'h01_town_falls', kb: 'in', gore: true, fx: ['fog', 'embers', 'flicker'], mood: 'tense', beats: [
   { sfx: 'siren' },
   { n: 'Main Street was burning. Kowalski\'s cruiser sat crashed against the hydrant, lights still turning.' },
   { n: 'People ran in their pajamas. Some of them were carrying children. Some of them were not running away. They were hunting.' },
   { sfx: 'groan' },
   { s: ['marcus', 'Do not look. Kemoy. Do not look at them. Run!'] },
   { qte: { type: 'mash', time: 4, count: 14, label: 'RUN' } } ] },
 { id: 'lunge', img: 's22_infected_lunge', kb: 'in', gore: true, mood: 'tense', fx: ['fog'], beats: [
   { sfx: 'groan' },
   { qte: { type: 'timing', time: 2.6, label: 'SWING' } },
   { s: ['kemoy', 'I... I hit him. Dad, I hit him.'] },
   { s: ['marcus', 'You did what you had to. Keep moving.'] } ] },
 { id: 'pell', goal: 'Mrs. Pell needs help. Decide.', img: 'h04_mrs_pell', kb: 'in', gore: true, fx: ['fog'], mood: 'tense', cp: true, beats: [
   { s: ['pell', 'Kemoy! Marcus! Please! Please, they are on the steps!'] },
   { n: 'Mrs. Pell. Still holding her rake.' },
   { s: ['marcus', 'There are too many. If we go up there, we do not come back down.'] },
   { choice: [
     { t: 'Charge the porch with the bat.', flag: 'savedPell', r: [['kemoy', 'Get away from her!']] },
     { t: 'Keep running. Do not look back.', flag: 'leftPell', r: [['pell', 'Kemoy! Kemoy, please!']] } ] },
   { ifFlag: 'savedPell', then: [['marcus', 'Kemoy, NO!']] },
   { ifFlag: 'leftPell', then: [['narrator', 'I heard her calling my name for a long time. I still hear it.']] } ] },
{ id: 'pellfight', img: 'h04_mrs_pell', kb: 'in', gore: true, fx: ['fog', 'flicker'], mood: 'tense', ifFlag: 'savedPell', beats: [
   { qte: { type: 'timing', time: 2.2, label: 'SWING' } },
   { qte: { type: 'press', time: 1.3, label: 'SHOVE' } },
   { s: ['pell', 'Go. Go, boy. Get your family out.'] },
   { n: 'She pushed us off the porch, and she closed the door, and she stayed. She was already bitten. She knew.' } ] },
{ id: 'undercar', goal: 'Hide. Do not make a sound.', img: 'h02_under_car', kb: 'in', gore: true, fx: ['fog'], mood: 'tense', cp: true, beats: [
   { n: 'We got separated. I rolled under the Morrisons\' car and put my hand over my mouth.' },
   { sfx: 'groan' },
   { n: 'Feet. Bare feet. Close enough to touch.' },
   { qte: { type: 'still', time: 7, label: 'HOLD YOUR BREATH' } },
   { n: 'They moved on. I breathed again. I did not know I could be that quiet.' } ] },
{ id: 'theodad', goal: 'Find Theo', img: 'h06_theo_dad', kb: 'in', fx: ['flicker'], gore: true, mood: 'tense', beats: [
   { n: 'Theo\'s house was dark. The family pictures were crooked on the wall.' },
   { n: 'Mr. Lindqvist was standing at the end of the hall. Just standing.' },
   { s: ['kemoy', 'Mr. Lindqvist? It is Kemoy. Are you... okay?'] },
   { n: 'He tilted his head. Like he was listening for my heartbeat.' },
   { scare: 'h03_window_scare' },
   { qte: { type: 'press', time: 1.1, label: 'DODGE' } },
   { s: ['marcus', 'Kitchen! Go, go, go!'] } ] },
 { id: 'theo', goal: 'Find Theo', img: 's23_theo_hiding', kb: 'in', mood: 'tense', beats: [
   { s: ['theo', 'Kemoy? Oh thank God. My parents went to check on the Hendersons. They did not come back.'] },
   { choice: [
     { t: '"You are coming with us."', flag: 'theoJoins', r: [['theo', 'Yes. Yes. Absolutely. Never splitting up. Rule one.']] },
     { t: '"Theo, they might come back—"', r: [['theo', 'They would have come back by now. I am coming.']] } ] },
   { s: ['marcus', 'Shop. We take the truck.'] } ] },
 { id: 'woods', img: 's24_woods_run', kb: 'right', fx: ['fog'], mood: 'tense', beats: [
   { s: ['theo', 'Behind us! Lots of them behind us!'] },
   { qte: { type: 'mash', time: 3.6, count: 14, label: 'RUN' } } ] },
 { id: 'horde', img: 's25_horde', kb: 'out', gore: true, fx: ['fog', 'embers'], mood: 'tense', beats: [
   { qte: { type: 'press', time: 1.4, label: 'JUMP THE FENCE' } } ] },
 { id: 'church', goal: 'Get to the shop while the bell draws them away', img: 'h05_church_horde', kb: 'out', fx: ['fog', 'embers'], gore: true, mood: 'tense', beats: [
   { sfx: 'bell' },
   { n: 'Someone was ringing the church bell. Calling for help, I think.' },
   { n: 'The whole town answered. Everyone we had ever known, walking toward the sound.' },
   { s: ['theo', 'Those are... that is Mrs. Abbott. That is the barber. That is everybody.'] },
   { s: ['marcus', 'It is buying us time. Do not waste it.'] } ] },
 { id: 'shop', goal: 'Get to Hart’s Auto. Take the truck.', img: 's26_harts_auto', kb: 'in', mood: 'night', cp: true, beats: [
   { s: ['marcus', 'Keys, keys, keys. Kemoy, the hook by the door.'] },
   { hot: [
     { x: 18, y: 45, l: 'Key hook', item: '_keys', look: 'Truck keys. The ones with the bottle opener.' },
     { x: 62, y: 52, l: 'Workbench', look: 'Dad\'s wrenches, lined up by size. Patience with a wrench.' } ], need: ['_keys'] },
   { sfx: 'crash' } ] },
 { id: 'crash', img: 's27_mom_crash', kb: 'in', gore: true, mood: 'sad', beats: [
   { n: 'There are moments that split your life in two. Before, and after.' },
   { n: 'This is mine.' },
   { s: ['marcus', 'Dana! Dana, no, no—'] },
   { s: ['dana', 'I had to find you. I had to.'] } ] },
 { id: 'momgoodbye', img: 's28_mom_goodbye', kb: 'in', mood: 'sad', beats: [
   { s: ['dana', 'Do not come closer, baby. It bit me. At County. I know what happens next.'] },
   { ifFlag: 'hugged', then: [['dana', 'You hugged me this morning. Like you knew. Hold on to that.']] },
   { s: ['dana', 'Kemoy. You are braver than you know. You hear me?'] },
   { choice: [
     { t: '"I love you, Mom."', flag: 'saidLove', r: [['dana', 'I love you more. Always have. That is the rules.']] },
     { t: '"Come with us. Please."', r: [['dana', 'I cannot. But you can. You go.']] } ] } ] },
 { id: 'rabbit', img: 's29_rabbit', kb: 'in', mood: 'sad', beats: [
   { s: ['dana', 'Biscuit fell out in the car. He was looking for you.'] },
   { s: ['nia', 'Mommy, why are you crying?'] },
   { s: ['dana', 'Marcus. Take them. Go. Please.'] } ] },
 { id: 'door', img: 's30_door_closes', kb: 'out', mood: 'sad', beats: [
   { n: 'She closed the garage door herself.' },
   { sfx: 'thud' },
   { n: 'That was the last time I saw my mother.' } ] },
 { id: 'drive', goal: 'Get to the bridge', img: 's31_truck_drive', kb: 'right', fx: ['rain'], mood: 'tense', act: 'Act IV · The Bridge', cp: true, beats: [
   { s: ['marcus', 'Harbor Bridge. The army is holding it. We get across, we are safe.'] },
   { s: ['theo', 'In the movies, that is always where it goes wrong.'] },
   { choice: [
     { t: '"Theo. Not now."', r: [['theo', 'Right. Sorry. Shutting up.']] },
     { t: 'Squeeze the compass. Say nothing.', flag: 'compassHeld', r: [] } ] } ] },
 { id: 'gate', goal: 'Get through the bridge gate', img: 's32_bridge_gate', kb: 'in', fx: ['rain'], mood: 'tense', beats: [
   { s: ['marcus', 'Truck will not fit. Out, everybody out. On foot!'] },
   { qte: { type: 'timing', time: 2.4, label: 'SLIP THROUGH' } } ] },
 { id: 'hold', goal: 'Survive', img: 's33_dad_holds', kb: 'in', fx: ['rain', 'embers'], gore: true, mood: 'tense', beats: [
   { s: ['marcus', 'They are too close. I have to hold the gate.'] },
   { n: 'My father said, get your sister across.' },
   { s: ['marcus', 'Get your sister across. I will be right behind you.'] },
   { choice: [
     { t: '"Dad, no!"', r: [['marcus', 'Patience with a wrench, chief. Go!']] },
     { t: 'Take Nia\'s hand and run.', flag: 'ran', r: [['marcus', 'That is my boy.']] } ] },
   { qte: { type: 'mash', time: 3.4, count: 14, label: 'RUN' } } ] },
 { id: 'across', img: 's34_across', kb: 'out', fx: ['rain'], mood: 'sad', beats: [
   { n: 'Across the bridge, the lights died. One by one.' } ] },
 { id: 'radio', img: 's35_radio', kb: 'in', fx: ['flicker'], mood: 'night', beats: [
   { sfx: 'static' },
   { s: ['radio', '...anyone on this channel... Kemoy... Kemoy Hart, if you can hear me...'] },
   { s: ['kemoy', 'Dad?'] } ] },
 { id: 'end', goal: 'Remember', img: 's36_old_kemoy', kb: 'in', fx: ['embers'], mood: 'sad', beats: [
   { n: 'He was right behind us. That is what I told myself, for a long, long time.' },
   { card: ['END OF CHAPTER ONE', 'Chapter Two · High Water · coming soon'] } ] },
];
export const CHAPTER_STARTS = SCENES.map((s, i) => [s.act, i]).filter(x => x[0]);
export function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
export function allLines() {
  const out = [];
  for (const sc of SCENES) for (const b of sc.beats) {
    if (b.n) out.push(['narrator', b.n]);
    if (b.s) out.push(b.s);
    if (b.choice) b.choice.forEach(c => (c.r || []).forEach(l => out.push(l)));
    if (b.hot) b.hot.forEach(h => (h.talk || []).forEach(l => out.push(l)));
    if (b.then) b.then.forEach(l => out.push(l));
  }
  return out;
}
