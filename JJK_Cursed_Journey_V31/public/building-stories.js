/* Original interactive interiors for the V29 Living World update.
   Every generated building has dialogue, a world clue, and a replay-proof secret.
   Safe in the browser and directly testable with Node. */
(function(root,make){const value=make();if(typeof module==='object'&&module.exports)module.exports=value;else root.JJKBuildings=value;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const profiles={
 'JUJUTSU HIGH':{
  npc:'ACADEMY MENTOR',sprite:'gojo',color:'#95dbef',object:'CLASS NOTES',secret:'SEALED DESK',
  line:'Training is not just about power. The strongest sorcerer notices the details everyone else misses.',
  rumor:'The classroom clock runs backwards every time a cursed spirit passes the campus gate.',
  clue:'A training sheet reads: NOTICE FIRST, FIGHT SECOND. Something taps three times inside the locked desk.',
  question:'The academy teaches which skill before attacking?',answers:['Observation','Sleeping through class','Making a louder explosion'],correct:0,
  reveal:'A harmless paper shikigami jumps from the desk and bows. It was waiting for someone observant.'},
 'TRAINING DOJO':{
  npc:'SPARRING CAPTAIN',sprite:'maki',color:'#c4acff',object:'WORN PUNCHING BAG',secret:'CHALLENGE BELL',
  line:'People who chase big attacks forget the basics. The proper stance saves you from one extra hit.',
  rumor:'A mysterious challenger visits this dojo when the lamps blink three times.',
  clue:'Painted on the bag: GUARD · DASH · STRIKE. The bell is marked with the first move of that combination.',
  question:'Which move begins the training combo?',answers:['Strike','Guard','Dash'],correct:1,
  reveal:'The bell rings twice. A secret sparring record falls from the rafters.'},
 'DORMITORY':{
  npc:'SLEEPY STUDENT',sprite:'yuji',color:'#ffd58f',object:'ROOMMATE NOTICEBOARD',secret:'LOCKED SUITCASE',
  line:'There are six rooms and somehow seven sets of footsteps every night. I am not investigating that.',
  rumor:'Someone leaves instant noodles by the empty room. By morning, the bowl is always clean.',
  clue:'A sticky note says: ROOM 7 DOES NOT EXIST. The suitcase uses the number of real dorm rooms.',
  question:'How many real dorm rooms are there?',answers:['7','5','6'],correct:2,
  reveal:'Inside are perfectly arranged instant noodles and a little note: THANKS FOR THE SNACKS.'},
 'CURSED ARCHIVE':{
  npc:'ARCHIVE KEEPER',sprite:'yuta',color:'#bbf0c7',object:'MOVING BOOKSHELF',secret:'FORBIDDEN PAGE',
  line:'These shelves contain records of things that were never supposed to happen. Please do not read out loud.',
  rumor:'One book checks itself out every night, then returns with a different ending.',
  clue:'A bookmark whispers: KNOWLEDGE BEFORE POWER. A glowing page waits in the lower drawer.',
  question:'What protects a careful researcher?',answers:['Reading the clues','Ignoring the warnings','Breaking every shelf'],correct:0,
  reveal:'The page displays your name for one second before turning completely blank.'},
 'MEDICAL WING':{
  npc:'FIELD MEDIC',sprite:'maki',color:'#a6e6e1',object:'PATIENT CHART',secret:'EMERGENCY CABINET',
  line:'Even powerful sorcerers need recovery time. Sit still before you tear another bandage.',
  rumor:'The last patient signed out before they were admitted. Nobody knows how.',
  clue:'A chart reads: REST, THEN HEAL. The emergency cabinet asks what comes first.',
  question:'What should a hurt sorcerer do first?',answers:['Fight again','Rest and recover','Sprint into curses'],correct:1,
  reveal:'The cabinet opens. A small paper crane flutters around the lamp and vanishes.'},
 'SORCERER SHOP':{
  npc:'CHARM MERCHANT',sprite:'nanami',color:'#ffe4a3',object:'BARGAIN SHELF',secret:'LUCKY VENDING BOX',
  line:'No refunds on cursed charms. Regular candy, however, is always safe.',
  rumor:'A golden coin appears under the counter whenever somebody helps a stranger.',
  clue:'The receipt says: THE BEST BARGAIN IS FREE KINDNESS. Three slots are labeled GREED, LUCK, and KINDNESS.',
  question:'Which coin slot opens the lucky box?',answers:['Greed','Kindness','Luck'],correct:1,
  reveal:'The machine dispenses a single shiny button labeled WORLD\'S LUCKIEST SORCERER.'},
 'ANCIENT SHRINE':{
  npc:'SHRINE CARETAKER',sprite:'megumi',color:'#dfb2ff',object:'WEATHERED OFFERING',secret:'WHISPERING LANTERN',
  line:'Respect the old paths. If a lantern lights by itself, do not follow it into the trees.',
  rumor:'The shrine bell has not been touched for a century, but people still hear it at sunset.',
  clue:'A carving reads: A QUIET HEART IS STRONGER THAN A LOUD CURSE. The lantern asks for that quality.',
  question:'What does the shrine ask you to bring?',answers:['Patience','A loud argument','A stolen charm'],correct:0,
  reveal:'The lantern glows blue for an instant. A tiny fox silhouette runs across the wall.'},
 'SHOP':{
  npc:'STREET VENDOR',sprite:'yuji',color:'#f5c78c',object:'CURSED RECEIPT',secret:'CASH REGISTER',
  line:'People buy umbrellas when the sky is clear. That is how we know a curse is coming.',
  rumor:'This shop sold one umbrella to someone with no reflection.',
  clue:'The receipt says: NO REFLECTION, NO CHANGE. The register has three symbols.',
  question:'Which customer sounds suspicious?',answers:['One with no reflection','One carrying groceries','One who paid in coins'],correct:0,
  reveal:'The cash register plays a tiny victory tune and prints a receipt from tomorrow.'},
 'APARTMENTS':{
  npc:'APARTMENT NEIGHBOR',sprite:'nobara',color:'#f2a5c0',object:'TENANT POSTER',secret:'STRANGE DOORBELL',
  line:'The upstairs apartment keeps playing footsteps, but nobody has rented it for months.',
  rumor:'The building directory sometimes lists a resident named NOBODY.',
  clue:'A scratched message says: THE EMPTY FLOOR IS NOT THE TOP FLOOR.',
  question:'Who lives in the empty apartment?',answers:['The landlord','Nobody','A delivery rider'],correct:1,
  reveal:'The bell answers in your own voice: NOBODY HOME.'},
 'WAREHOUSE':{
  npc:'NIGHT GUARD',sprite:'todo',color:'#b4d7fb',object:'SHIPPING CRATE',secret:'FROZEN LOCK',
  line:'I was hired to guard ordinary boxes. None of the ordinary boxes should be breathing.',
  rumor:'The last manifest listed one more crate than the truck could carry.',
  clue:'The manifest has 4 crates, but the security camera shows 5 shadows.',
  question:'How many shadows appeared on camera?',answers:['4','6','5'],correct:2,
  reveal:'One crate sneezes out a puff of harmless purple mist.'},
 '109 BUILDING':{
  npc:'FASHION SCOUT',sprite:'nobara',color:'#ffbbd2',object:'ILLUMINATED MANNEQUIN',secret:'MIRROR ROOM',
  line:'Something in the dressing room copies the last person who walked by. It gets the hairstyle wrong.',
  rumor:'All the mannequins point toward the basement at midnight.',
  clue:'Written on the mirror: LOOK AT WHAT MOVES WHEN YOU STAND STILL.',
  question:'What gives away the fake reflection?',answers:['It moves on its own','It wears a coat','It has a hairstyle'],correct:0,
  reveal:'Your reflection winks a full second before you do.'},
 'NEON MALL':{
  npc:'MALL JANITOR',sprite:'nanami',color:'#f5dd92',object:'BROKEN DIRECTORY',secret:'AFTER-HOURS ELEVATOR',
  line:'This mall closes at nine. The elevator keeps going to a floor that is not on the directory.',
  rumor:'Every vending machine stocks one drink with an impossible flavor.',
  clue:'The directory lists floors 1, 2 and 4. A floor appears to be missing.',
  question:'Which floor is missing from the directory?',answers:['5','3','1'],correct:1,
  reveal:'The elevator dings on a nonexistent third floor, then shuts before anyone steps inside.'},
 'ARCADE':{
  npc:'ARCADE CHAMPION',sprite:'hakari',color:'#a0d6ff',object:'HIGH SCORE MACHINE',secret:'GLITCHED CABINET',
  line:'I beat the top score yesterday. This morning the machine says a ghost beat me by one point.',
  rumor:'The high-score name reads CURSE, even when the arcade is unplugged.',
  clue:'The cabinet flashes: PRESS START, NOT RESET. The secret key is the first button.',
  question:'How do you wake up a sleeping arcade game?',answers:['Reset','Start','Unplug it'],correct:1,
  reveal:'The screen displays YOU WIN against an opponent named ??? and spits out a paper ticket.'},
 'HOTEL':{
  npc:'HOTEL CONCIERGE',sprite:'choso',color:'#d6c9f8',object:'GUEST REGISTER',secret:'ROOM 13',
  line:'Nobody ever books the thirteenth room. The elevator still stops there every night.',
  rumor:'Guests hear a bell ring from an empty reception desk at 3 AM.',
  clue:'The room key shows 13. The guest register insists the number is unlucky, but important.',
  question:'Which room is missing from the floor plan?',answers:['12','14','13'],correct:2,
  reveal:'The door opens onto a miniature hotel lobby, exactly like this one.'},
 'OFFICE':{
  npc:'EXHAUSTED CLERK',sprite:'higuruma',color:'#aecfda',object:'UNSENT EMAIL',secret:'EMPTY MEETING ROOM',
  line:'My manager keeps scheduling meetings with people who disappeared years ago.',
  rumor:'The printer works only when nobody is watching it.',
  clue:'The meeting invite says: ATTENDEE COUNT ZERO. The empty room has one chair.',
  question:'How many people accepted the mysterious meeting?',answers:['One','Zero','Three'],correct:1,
  reveal:'The chair swivels toward the doorway. A meeting note says: ADJOURNED.'},
 'TICKET GATES':{
  npc:'STATION ATTENDANT',sprite:'nanami',color:'#95e9ed',object:'STRANGE TIMETABLE',secret:'LOST-AND-FOUND BOX',
  line:'The trains have been stopped for hours, but the departure board still changes.',
  rumor:'A train with no passengers arrives once after the final service.',
  clue:'The station clock is stuck on the word LAST. The box wants the final stop.',
  question:'Which service is the mysterious train?',answers:['The first train','The final train','A sightseeing train'],correct:1,
  reveal:'The lost-and-found box contains a ticket stamped RETURN TO THE SURFACE.'},
 'MALEVOLENT SHRINE':{
  npc:'WHISPERING ECHO',sprite:'sukuna',color:'#f49aab',object:'ANCIENT TABLET',secret:'CURSED SEAL',
  line:'You hear four footsteps behind you, but the dust shows only your own.',
  rumor:'The throne room remembers every sorcerer who ever entered.',
  clue:'The tablet says: A SEAL IS OPENED BY KNOWING WHEN NOT TO FIGHT.',
  question:'What is sometimes stronger than reckless power?',answers:['Restraint','A louder threat','Breaking the tablet'],correct:0,
  reveal:'The seal opens just enough to show an ancient eye, then closes with a laugh.'},
 'RUINED TOWER':{
  npc:'SCAVENGER',sprite:'yuta',color:'#b8bbc9',object:'OLD RADIO',secret:'COLLAPSED SAFE',
  line:'I keep collecting pieces of an old city. Some of these ruins remember when they were whole.',
  rumor:'A radio transmits the same three words every time a storm begins.',
  clue:'The radio repeats: FIND THE LIGHT. The safe has three marked buttons.',
  question:'What does the signal say to find?',answers:['Darkness','The light','The exit'],correct:1,
  reveal:'The radio briefly plays a cheerful weather forecast from ten years ago.'},
 'RANGER CABIN':{
  npc:'FOREST RANGER',sprite:'maki',color:'#9de3a7',object:'TRACKING MAP',secret:'MOSSY SUPPLY BOX',
  line:'The forest keeps changing trails when nobody is looking. Follow the flowers instead of the footprints.',
  rumor:'One ancient tree whispers the same name every spring.',
  clue:'The map marks a FLOWER TRAIL with a star beside the supply box.',
  question:'What should a careful traveler follow?',answers:['The flowers','A random shadow','The darkest trail'],correct:0,
  reveal:'A tiny green spirit peeks out of the box, leaves a leaf, and scurries away.'},
 'HERBALIST HUT':{
  npc:'FOREST HERBALIST',sprite:'yuki',color:'#c6efc2',object:'DRIED HERBS',secret:'GLOWING ROOT',
  line:'Some plants heal. Others mimic the smell of dinner to lure in hungry sorcerers.',
  rumor:'A glowing mushroom appears only when nobody is chasing it.',
  clue:'The recipe says: DRY BEFORE MIXING. Three ingredient jars sit under the root.',
  question:'What should you do before mixing the herbs?',answers:['Burn them','Dry them','Throw them away'],correct:1,
  reveal:'The root grows a tiny flower and releases a sparkling, harmless puff.'}
};
const fallback={npc:'LOCAL WANDERER',sprite:'yuji',color:'#acdbf2',object:'DUSTY NOTE',secret:'HIDDEN CACHE',line:'The world feels different in every building. Keep your eyes open.',rumor:'Someone left a secret for the first person curious enough to search.',clue:'A letter says: THE ANSWER IS PATIENCE.',question:'What helps uncover a secret?',answers:['Rushing','Patience','Giving up'],correct:1,reveal:'A secret compartment clicks open. The mystery is solved.'};
function info(building,zone){const key=profiles[building.name]||fallback;const id=`${zone}:${building.x}:${building.y}`;const variant=(building.x*17+building.y*7+zone*11)%5;return {...key,id,zone,name:building.name||'MYSTERIOUS BUILDING',label:building.art?'CAMPUS DISCOVERY':zone===2?'CITY SECRET':zone===4?'FOREST SECRET':'HIDDEN STORY',variant,bonusCoins:45+zone*28+variant*9,bonusXP:35+zone*18+variant*6};}
function choose(profile,selection){return Number(selection)===profile.correct;}
return {profiles,info,choose};
});
