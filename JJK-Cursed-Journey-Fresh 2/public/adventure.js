'use strict';
/* JJK Pixel Cursed Clash V22 — walkable quest story. Gameplay is fully client-side;
   the existing WebSocket multiplayer arena remains separate at /arena. */
(() => {
const $=id=>document.getElementById(id);
const canvas=$('gameCanvas'),ctx=canvas.getContext('2d',{alpha:false});ctx.imageSmoothingEnabled=false;
const W=960,H=540,WORLD={w:1800,h:1000},KEY='jjk-v19-story-progress';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const rng=(n)=>{let x=Math.sin(n*72.912+121.44)*43758.5453;return x-Math.floor(x)};
const regions={
 school:{label:'TOKYO JUJUTSU HIGH',ground:'#3c5349',path:'#74846a',accent:'#e6ad70',sky:'#2b484b',map:'school'},
 station:{label:'CURSED STATION',ground:'#3e4b60',path:'#5d637a',accent:'#aacce2',sky:'#263047',map:'station'},
 alley:{label:'BACKSTREETS',ground:'#3e3d53',path:'#69718d',accent:'#ffad7b',sky:'#252d46',map:'alley'},
 shibuya:{label:'SHIBUYA CROSSING',ground:'#393f5c',path:'#666684',accent:'#e84e98',sky:'#2f244d',map:'shibuya'},
 sewers:{label:'UNDERGROUND TUNNELS',ground:'#34464d',path:'#5a656b',accent:'#a7b1c2',sky:'#21323f',map:'sewer'},
 ruins:{label:'CULLING GAME COLONY',ground:'#5a514b',path:'#95816c',accent:'#f0c0aa',sky:'#46333d',map:'ruins'},
 shrine:{label:'ANCIENT CURSED SHRINE',ground:'#443844',path:'#805766',accent:'#e66a6a',sky:'#371c2a',map:'shrine'}
};
const portraits={yuji:'Yuji Itadori',gojo:'Gojo Satoru',megumi:'Megumi Fushiguro',todo:'Aoi Todo',nanami:'Kento Nanami',nobara:'Nobara Kugisaki',maki:'Maki Zenin',yuta:'Yuta Okkotsu',hakari:'Kinji Hakari',kashimo:'Hajime Kashimo',choso:'Choso',yuki:'Yuki Tsukumo',higuruma:'Hiromi Higuruma',toji:'Toji Fushiguro',mahito:'Mahito',jogo:'Jogo',hanami:'Hanami',mahoraga:'Mahoraga',heian:'Heian Sukuna',finger:'Finger Bearer',curse:'Low Grade Curse',kenjaku:'Kenjaku'};
const playable=['yuji','megumi','todo','nanami','nobara','gojo','maki','yuta','hakari','kashimo','choso','higuruma','toji','yuki'];
const quests=[
 {title:'A NEW STUDENT',area:'school',arc:'BEGINNING',desc:'Meet Gojo at Jujutsu High and learn about curses.',steps:[{type:'talk',id:'gojo',text:'Welcome to Tokyo Jujutsu High, Yuji! Look around, then head out for your first training mission.'}],xp:60},
 {title:'FIRST EXORCISM',area:'school',arc:'BEGINNING',desc:'Find the training curse and learn to fight.',steps:[{type:'fight',id:'curse',text:'Defeat the training curse using Punch, Block and your cursed technique.'}],xp:100},
 {title:'CURSED RESIDUE',area:'school',arc:'CURSED OBJECTS',desc:'Gather three residual-energy seals on the school grounds.',steps:[{type:'collect',count:3,text:'Pick up 3 cursed residue seals scattered in the courtyard.'}],xp:125,unlock:'megumi'},
 {title:'FEARSOME WOMB',area:'station',arc:'CURSED WOMB',desc:'Investigate an abandoned station with Megumi.',steps:[{type:'talk',id:'megumi',text:'Follow the residual cursed energy. Stay alert.'},{type:'fight',id:'finger',text:'Exorcise the Finger Bearer.'}],xp:150},
 {title:'A DARK ALLEY',area:'alley',arc:'VS. MAHITO',desc:'Help Nanami investigate a suspicious curse.',steps:[{type:'talk',id:'nanami',text:'Keep your distance from the transfigured humans. The source is further ahead.'},{type:'fight',id:'mahito',text:'Battle Mahito, the stitched curse.'}],xp:180,unlock:'nanami'},
 {title:'KYOTO EXCHANGE',area:'school',arc:'GOODWILL EVENT',desc:'Meet Todo and hold back Hanami.',steps:[{type:'talk',id:'todo',text:'Brother! Show me how strong your spirit is!'},{type:'fight',id:'hanami',text:'Defeat the forest curse Hanami.'}],xp:210,unlock:'todo'},
 {title:'SHIBUYA SIGNALS',area:'shibuya',arc:'SHIBUYA INCIDENT',desc:'Gather intelligence before entering the barriers.',steps:[{type:'collect',count:2,text:'Find 2 signal notes around Shibuya.'},{type:'fight',id:'jogo',text:'Fight Jogo, the volcanic curse.'}],xp:230,unlock:'nobara',rewardSkin:'yuji_shibuya'},
 {title:'SOULS IN THE TUNNEL',area:'sewers',arc:'SHIBUYA INCIDENT',desc:'Face Mahito again beneath the city.',steps:[{type:'fight',id:'mahito',text:'Defeat Mahito in the tunnels.'},{type:'talk',id:'todo',text:'You stood firm. Take that strength with you, brother!'}],xp:250},
 {title:'THE STRONGEST',area:'school',arc:'HIDDEN INVENTORY',desc:'A Gojo flashback mission: survive the assassin.',steps:[{type:'talk',id:'gojo',text:'This next lesson comes from my past. Think carefully before every attack.'},{type:'fight',id:'toji',text:'Defeat the relentless assassin Toji.'}],xp:280,unlock:'gojo'},
 {title:'BROTHERS IN BLOOD',area:'ruins',arc:'AFTER SHIBUYA',desc:'Meet Choso and survive a dangerous confrontation.',steps:[{type:'fight',id:'choso',text:'Dodge piercing blood attacks.'},{type:'talk',id:'choso',text:'I have decided to stand beside my brother.'}],xp:290,unlock:'choso'},
 {title:'HIGH STAKES',area:'ruins',arc:'CULLING GAME',desc:'Find Hakari and challenge the lightning sorcerer.',steps:[{type:'talk',id:'hakari',text:'If you want my help, bring the fever!'},{type:'fight',id:'kashimo',text:'Win the clash against Kashimo.'}],xp:320,unlock:'hakari',rewardSkin:'hakari_jackpot'},
 {title:'EIGHT-HANDLED WHEEL',area:'shrine',arc:'TEN SHADOWS',desc:'Face the impossible adaptation shikigami.',steps:[{type:'fight',id:'mahoraga',text:'Watch Mahoraga’s adaptation wheel; parry his heavy strikes.'}],xp:370,unlock:'maki',rewardSkin:'megumi_shadow'},
 {title:'THE CULLING BARRIER',area:'shibuya',arc:'CULLING GAME',desc:'Unravel the sorcerer behind the barriers.',steps:[{type:'collect',count:2,text:'Collect two barrier traces.'},{type:'fight',id:'kenjaku',text:'Overcome Kenjaku’s cursed techniques.'}],xp:390,unlock:'yuta',rewardSkin:'maki_battle'},
 {title:'THE FINAL BATTLE',area:'shrine',arc:'SHINJUKU SHOWDOWN',desc:'Yuji faces four-armed Heian-era Sukuna in three phases.',steps:[{type:'talk',id:'gojo',text:'Use everything you have learned. Protect the people standing behind you.'},{type:'fight',id:'heian',text:'Beat all three phases of the King of Curses.'}],xp:500,unlock:'kashimo',rewardSkin:'gojo_final'}
];
const SKIN_CATALOG={yuji:[['default','YUJI CLASSIC'],['yuji_shibuya','SHIBUYA UNIFORM']],megumi:[['default','MEGUMI CLASSIC'],['megumi_shadow','SHADOW CLOAK']],hakari:[['default','HAKARI CLASSIC'],['hakari_jackpot','JACKPOT GEAR']],maki:[['default','MAKI CLASSIC'],['maki_battle','BATTLE GEAR']],gojo:[['default','GOJO CLASSIC'],['gojo_final','FINAL BATTLE GOJO']]};
const bossArt=new Image();bossArt.src='/sprites/mahoraga_boss.png?v=22';
const img={};for(const id of new Set([...Object.keys(portraits),'gojo_final','yuji_shibuya','megumi_shadow','hakari_jackpot','maki_battle'])){const i=new Image();i.src='/sprites/'+id+'.png?v=26';img[id]=i;}
const starting={quest:0,step:0,collected:0,xp:0,level:1,hero:'yuji',skin:'default',skinByHero:{},unlocks:['yuji'],skins:[],wins:0};
function load(){try{const raw=JSON.parse(localStorage.getItem(KEY));if(!raw||!Number.isInteger(raw.quest)||raw.quest<0||raw.quest>quests.length)return structuredClone(starting);return {...starting,...raw,unlocks:Array.isArray(raw.unlocks)?raw.unlocks:['yuji'],skins:Array.isArray(raw.skins)?raw.skins:[],skinByHero:raw.skinByHero&&typeof raw.skinByHero==='object'?raw.skinByHero:{}};}catch{return {...starting,unlocks:['yuji'],skins:[]};}}
let save=load();
function persist(){try{localStorage.setItem(KEY,JSON.stringify(save));$('saveStatus').textContent='Saved ✓';}catch{$('saveStatus').textContent='Save blocked: browser privacy settings';}}
let mode='explore',region=quests[Math.min(save.quest,quests.length-1)].area,player={x:210,y:510,face:1,vx:0,vy:0,anim:0},camera={x:0,y:0},sceneTime=0,last=0,battle=null,dialogue=null,toastUntil=0,pressed={};
let started=false,modalOpen=false,fx=[],attackTime=0,lastBlockPressed=-99;
// Six readable, individually warned Mahoraga boss techniques.
const MAHORAGA_MOVES=[
 {id:'sword',name:'SWORD OF EXTERMINATION',wind:.82,range:195,damage:20,pose:3},
 {id:'wheel',name:'ADAPTATION WHEEL',wind:1.15,range:0,damage:0,pose:4},
 {id:'slam',name:'GROUND-SHATTERING SLAM',wind:1.12,range:235,damage:24,pose:5},
 {id:'backhand',name:'HEAVY BACKHAND',wind:.66,range:135,damage:17,pose:6},
 {id:'rush',name:'ADAPTIVE RUSH',wind:.82,range:165,damage:23,pose:7},
 {id:'wave',name:'FLYING SLASH',wind:1.16,range:990,damage:27,pose:8}
];

const touched=matchMedia('(pointer:coarse)').matches || navigator.maxTouchPoints>0;
if(touched)document.body.classList.add('touch-device');
function idName(id){return portraits[id]||id.toUpperCase();}
function requiredXP(lv){return 75+lv*55;}
function xpProgress(){let left=save.xp,lv=1;while(left>=requiredXP(lv)&&lv<99){left-=requiredXP(lv++);}save.level=lv;return {lv,left,need:requiredXP(lv)};}
function updateHud(){const {lv,left,need}=xpProgress(),q=quests[save.quest]||null;
 $('playerName').textContent=idName(save.hero).toUpperCase();$('heroPortrait').textContent=save.hero.toUpperCase().slice(0,5);$('levelText').textContent=`LV. ${lv} · ${left}/${need} XP`; $('xpFill').style.width=(left/need*100)+'%';
 $('questIndex').textContent=q?`${q.arc} · ${String(save.quest+1).padStart(2,'0')}/14`:'CAMPAIGN COMPLETE';
 $('questTitle').textContent=q?q.title:'ALL MISSIONS CLEARED';$('questObjective').textContent=q?objectiveText():'Explore, replay bosses, and collect skins';$('regionLabel').textContent=regions[region].label;
}
function objectiveText(){let q=quests[save.quest];if(!q)return 'Explore anywhere';let st=q.steps[save.step];if(!st)return q.desc;return st.type==='collect'?`${st.text} (${save.collected||0}/${st.count})`:st.text;}
function toast(text,ms=2500){$('messageToast').textContent=text;$('messageToast').classList.add('visible');toastUntil=performance.now()+ms;}
function target(){const q=quests[save.quest];if(!q||q.area!==region)return null;const step=q.steps[save.step];if(!step)return null;
 if(step.type==='collect'){let k=save.collected||0;return {x:480+k*250,y:410+(k%2)*175,name:'CURSED RESIDUE',id:'seal',type:'collect'};}
 const c={gojo:[560,430],megumi:[560,430],nanami:[615,430],todo:[600,430],hakari:[590,440],choso:[550,440],curse:[650,470],finger:[660,470],mahito:[660,470],hanami:[660,470],jogo:[660,470],toji:[660,470],kashimo:[660,470],mahoraga:[710,470],kenjaku:[660,470],heian:[710,470]};const p=c[step.id]||[620,465];return {x:p[0],y:p[1],id:step.id,name:idName(step.id).toUpperCase(),type:step.type};}
function nudgeToRegion(){region=(quests[save.quest]||quests[0]).area;player.x=210;player.y=510;camera.x=0;camera.y=0;updateHud();}
function advanceStep(){save.step++;save.collected=0;let q=quests[save.quest];if(!q)return;if(save.step<q.steps.length){persist();updateHud();toast('QUEST UPDATED: '+objectiveText(),3000);return;}
 const oldLv=save.level;save.xp+=q.xp;xpProgress();if(save.level>oldLv)toast('LEVEL UP! NOW LEVEL '+save.level+' ★',3500);
 if(q.unlock&&!save.unlocks.includes(q.unlock)){save.unlocks.push(q.unlock);toast(idName(q.unlock).toUpperCase()+' UNLOCKED! ★',4200);}
 if(q.rewardSkin&&!save.skins.includes(q.rewardSkin)){save.skins.push(q.rewardSkin);toast((q.rewardSkin==='gojo_final'?'FINAL BATTLE GOJO':q.rewardSkin.toUpperCase().replace('_',' '))+' SKIN UNLOCKED! ★',5000);}
 // Bonus fighters earned at milestones, never put curse bosses in the hero roster.
 for(const [index,id] of [[3,'megumi'],[7,'nobara'],[9,'toji'],[10,'higuruma'],[11,'yuki'],[12,'maki'],[13,'yuta']]){if(save.quest>=index&&!save.unlocks.includes(id))save.unlocks.push(id);}
 save.quest++;save.step=0;save.collected=0;persist();nudgeToRegion();
 if(save.quest>=quests.length){toast('STORY CLEARED! GOJO FINAL BATTLE SKIN EARNED!',6000);openModal('roster');}
 else toast(`QUEST ${save.quest} COMPLETE! NEXT: ${quests[save.quest].title}`,4200);
}
function interact(){if(!started||modalOpen)return;if(dialogue){continueDialogue();return;}if(battle)return;
 const t=target();if(!t){toast('All quests clear! Explore or choose a fighter.');return;}
 if(dist(player,t)>100){toast(`GET CLOSER TO ${t.name}`,1400);return;}
 if(t.type==='talk'){openDialogue(t.name,quests[save.quest].steps[save.step].text,()=>advanceStep());return;}
 if(t.type==='collect'){fx.push({x:t.x,y:t.y,t:0,type:'spark'});toast('CURSED TRACE FOUND! ✦');save.collected=(save.collected||0)+1;if(save.collected>=quests[save.quest].steps[save.step].count)advanceStep();else{persist();updateHud();}return;}
 if(t.type==='fight'){beginFight(t.id);return;}
}
function openDialogue(name,body,after){dialogue={after};document.body.classList.add('dialogue-open');$('speakerName').textContent=name;$('dialogueBody').textContent=body;$('dialoguePanel').hidden=false;}
function continueDialogue(){if(!dialogue)return;const after=dialogue.after;dialogue=null;document.body.classList.remove('dialogue-open');$('dialoguePanel').hidden=true;if(after)after();}
function beginFight(id){mode='fight';const q=quests[save.quest];const base={curse:95,finger:155,mahito:200,jogo:260,hanami:280,toji:230,choso:220,kashimo:290,mahoraga:490,kenjaku:360,heian:780}[id]||160;
 battle={id,x:670,px:205,pxdir:1,vy:0,hp:Math.round(150+save.level*13),maxHP:Math.round(150+save.level*13),enemyHP:base,enemyMax:base,enemyX:675,enemyDir:-1,hitCooldown:0,attackCooldown:0,skillCooldown:0,guard:false,guardStart:0,enemyAttackTimer:1.5,warn:0,phase:1,stun:0,playerStun:0,invincible:0,energy:100,moveIndex:-1,move:null,windMax:0,attackPose:0,poseUntil:0,armorUntil:0,adaptStacks:0};fx=[];updateHud();$('battleHud').hidden=false;$('bossLabel').textContent=idName(id).toUpperCase();$('touchInteract').textContent='DODGE';toast('BOSS FIGHT: '+idName(id).toUpperCase(),2200);}
function returnExplore(victory){const id=battle?.id;mode='explore';battle=null;$('battleHud').hidden=true;$('touchInteract').textContent='TALK';if(victory){save.wins++;persist();advanceStep();toast('CURSE EXORCISED! + QUEST PROGRESS',2300);}else{toast('DEFEATED — RETRY THE ENCOUNTER',2800);player.x=470;player.y=510;}}
function attack(skill=0){if(!battle||battle.playerStun>0||battle.hitCooldown>0)return;const b=battle;const dmg=skill?Math.round(21+save.level*3+skill*7):Math.round(11+save.level*2);if(skill&&b.energy<13+skill*9){toast('NEED CURSED ENERGY',1000);return;}if(skill){b.energy-=13+skill*9;b.skillCooldown=.24;}
 b.hitCooldown=skill?.44:.23;attackTime=.18;const diff=Math.abs(b.enemyX-b.px);const reach=skill?340:120;
 if(diff<reach){if(b.id==='mahoraga'&&sceneTime<b.armorUntil){dmg=Math.max(1,Math.round(dmg*(skill?.66:.84)));} b.enemyHP-=dmg; b.stun=.14+(skill*.07);fx.push({x:(b.enemyX+b.px)/2,y:344,t:0,type:skill?'energy':'hit',color:save.hero==='gojo'?'#8adbff':'#f46b8e'});toast(skill?`CURSED TECHNIQUE ${skill} — ${dmg} DMG`:`${dmg} DAMAGE`,680);if(b.enemyHP<=0){returnExplore(true);return;}}
 else if(skill){fx.push({x:b.px+120,y:350,t:0,type:'energy'});toast('ATTACK MISSED',650);}
}
function guardDown(){if(!battle)return;battle.guard=true;battle.guardStart=sceneTime;lastBlockPressed=sceneTime;}
function guardUp(){if(battle)battle.guard=false;}
function dodge(){if(battle){if(battle.energy<14)return;battle.energy-=14;battle.px=clamp(battle.px+(battle.enemyX>battle.px?-105:105),70,875);battle.invincible=.35;fx.push({x:battle.px,y:350,t:0,type:'dash'});}else{player.x=clamp(player.x+player.face*50,70,WORLD.w-60);}}

function resolveMahoragaMove(b){
 const m=b.move;if(!m)return;
 b.attackPose=m.pose;b.poseUntil=sceneTime+.5;
 if(m.id==='wheel'){
   b.adaptStacks=Math.min(3,b.adaptStacks+1);b.armorUntil=sceneTime+4.2;
   const heal=Math.min(b.enemyMax-b.enemyHP,9+b.adaptStacks*7);
   b.enemyHP+=heal;
   fx.push({x:b.enemyX,y:180,t:0,type:'wheel'});
   toast('ADAPTATION: DAMAGE RESISTANCE + '+Math.round(heal)+' HP',1700);
   return;
 }
 if(m.id==='rush'){
   const direction=Math.sign(b.px-b.enemyX)||1;
   b.enemyX=clamp(b.enemyX+direction*190,70,890);
   fx.push({x:b.enemyX,y:335,t:0,type:'rush'});
 }
 if(m.id==='slam')fx.push({x:b.enemyX,y:406,t:0,type:'slam'});
 if(m.id==='wave')fx.push({x:b.enemyX,y:305,t:0,type:'wave'});
 const d=Math.abs(b.enemyX-b.px);
 if(d>m.range||b.invincible>0){if(d>m.range)toast('DODGED '+m.name+'!',600);return;}
 if(b.guard){
   if(sceneTime-b.guardStart<.34){
     b.stun=1.04;b.enemyHP-=28+save.level*2;b.armorUntil=0;
     toast('PERFECT PARRY! WHEEL INTERRUPTED',1250);
     fx.push({x:b.px,y:300,t:0,type:'parry'});
     if(b.enemyHP<=0)returnExplore(true);
   }else{b.hp-=Math.max(1,Math.round(m.damage*.17));toast('BLOCKED '+m.name,720);}
 }else{
   const base=(m.damage+Math.floor(save.quest*.35))*(b.phase===2?1.18:1);
   b.hp-=Math.round(base);b.playerStun=.22;
   toast('HIT BY '+m.name,1120);
 }
 if(battle===b&&b.hp<=0)returnExplore(false);
}
function updateFight(dt){const b=battle;if(!b)return;
 b.hitCooldown=Math.max(0,b.hitCooldown-dt);b.attackCooldown=Math.max(0,b.attackCooldown-dt);b.skillCooldown=Math.max(0,b.skillCooldown-dt);b.stun=Math.max(0,b.stun-dt);b.playerStun=Math.max(0,b.playerStun-dt);b.invincible=Math.max(0,b.invincible-dt);b.energy=clamp(b.energy+dt*7,0,100);
 const speed=200*dt;
 if(pressed.left||pressed.right)b.px+= (pressed.right?speed:0)-(pressed.left?speed:0);
 b.px=clamp(b.px,55,890);b.pxdir=b.enemyX>b.px?1:-1;
 if(pressed.guard&&!b.guard)guardDown();if(!pressed.guard&&b.guard)guardUp();
 if(b.stun<=0){const distance=Math.abs(b.enemyX-b.px);const enemySpeed=(b.id==='mahoraga'?93:b.id==='heian'?135:105)*dt;
 if(distance>112){b.enemyX+= b.px>b.enemyX?enemySpeed:-enemySpeed;}else if(distance<74)b.enemyX+=b.px>b.enemyX?-enemySpeed:enemySpeed;}
 b.enemyX=clamp(b.enemyX,70,890);b.enemyDir=b.px<b.enemyX?-1:1;
 // Heavy curse attacks show a visible warning, so block/parry has a real timing window.
 if(b.warn>0){b.warn-=dt;
   if(b.warn<=0){
     if(b.id==='mahoraga'){resolveMahoragaMove(b);if(battle!==b)return;}
     else{
       const d=Math.abs(b.enemyX-b.px);
       if(d<(b.id==='heian'?380:170)&&b.invincible<=0){
         if(b.guard){const perfect=sceneTime-b.guardStart<.34;
           if(perfect){b.stun=1.05;b.enemyHP-=30+save.level*2;toast('PERFECT PARRY! + COUNTER',1250);fx.push({x:b.px,y:300,t:0,type:'parry'});if(b.enemyHP<=0){returnExplore(true);return;}}
           else{b.hp-=Math.round(5+save.quest*.5);toast('BLOCKED',700);}}
         else{b.hp-=Math.round((b.id==='heian'?30:16)+save.quest*.65);b.playerStun=.22;toast('HIT! HOLD BLOCK BEFORE THE SLASH',1250);}
         if(b.hp<=0){returnExplore(false);return;}
       }
     }
   }
 }
 if(b.warn<=0&&b.stun<=0){b.enemyAttackTimer-=dt;
   if(b.enemyAttackTimer<=0){
     if(b.id==='mahoraga'){
       b.moveIndex=(b.moveIndex+1)%MAHORAGA_MOVES.length;
       b.move=MAHORAGA_MOVES[b.moveIndex];b.warn=b.move.wind*(b.phase===2?.85:1);
       b.windMax=b.warn;b.enemyAttackTimer=(b.phase===2?2.1:2.7);
       toast('MAHORAGA: '+b.move.name,Math.ceil(b.warn*1000));
     }else{b.warn=b.id==='heian'?.95:.68;b.enemyAttackTimer=b.id==='heian'?2.2:2.45;}
   }
 }
 if(b.id==='heian'&&b.phase===1&&b.enemyHP<b.enemyMax*.67){b.phase=2;b.enemyAttackTimer=.4;toast('PHASE 2 — MALEVOLENT SHRINE',2900);}
 if(b.id==='heian'&&b.phase===2&&b.enemyHP<b.enemyMax*.33){b.phase=3;b.enemyAttackTimer=.3;toast('PHASE 3 — WORLD-CUTTING SLASH!',2900);}
 if(b.id==='mahoraga'&&b.enemyHP<b.enemyMax*.48&&b.phase===1){b.phase=2;toast('MAHORAGA HAS ADAPTED! THE ATTACKS ARE FASTER',2500);b.enemyAttackTimer=.8;}
 $('bossHPFill').style.width=clamp(b.enemyHP/b.enemyMax*100,0,100)+'%';$('fightProgress').textContent=`YOUR HP ${Math.ceil(b.hp)}/${b.maxHP}  •  CE ${Math.floor(b.energy)}%  •  ${b.id==='heian'?'PHASE '+b.phase+'/3':b.id==='mahoraga'?'ADAPTATION '+b.phase+'/2':''}`;
}
function begin(){started=true;$('startShade').hidden=true;nudgeToRegion();toast('FOLLOW THE GOLD QUEST MARKER • TALK WITH E',3700);canvas.focus({preventScroll:true});}
function openModal(type){modalOpen=true;pressed={};$('modalShade').hidden=false;const c=$('modalContent');c.innerHTML='';$('modalTitle').textContent=({roster:'SORCERER ROSTER & SKINS',quests:'QUEST JOURNAL',map:'TRAVEL MAP'})[type]||'ADVENTURE';
 if(type==='quests'){c.innerHTML=quests.map((q,i)=>`<div class="quest-card ${i<save.quest?'complete':i===save.quest?'current':''}"><strong>${i<save.quest?'★':i===save.quest?'◆':'🔒'} ${String(i+1).padStart(2,'0')} · ${q.title}</strong><span>${q.arc} — ${q.desc}</span><small>${i<save.quest?'COMPLETED':i===save.quest?objectiveText():'LOCKED'} · +${q.xp} XP</small></div>`).join('');}
 if(type==='roster'){
  c.innerHTML='<p>Unlock sorcerers by finishing quests. Curse bosses are never playable characters.</p><div class="modal-grid" id="rosterGrid"></div><div class="skin-options" id="skinOptions"></div>';
  const r=$('rosterGrid');r.innerHTML=playable.map(id=>`<button class="roster-card ${save.hero===id?'active':''} ${save.unlocks.includes(id)?'':'locked'}" data-choose="${id}"><img src="/sprites/${id}.png" alt="${idName(id)} pixel sprite"/><strong>${idName(id)}</strong><small>${save.unlocks.includes(id)?(save.hero===id?'SELECTED':'TAP TO PLAY'):'🔒 FINISH QUESTS TO UNLOCK'}</small></button>`).join('');
  r.querySelectorAll('[data-choose]').forEach(b=>b.addEventListener('click',()=>{if(!save.unlocks.includes(b.dataset.choose)){toast('THIS SORCERER IS STILL LOCKED',1500);return;}save.hero=b.dataset.choose;save.skin=save.skinByHero[save.hero]||'default';persist();updateHud();openModal('roster');}));
  const choices=SKIN_CATALOG[save.hero];
  if(choices){$('skinOptions').innerHTML=choices.map(([sid,label])=>`<button class="${(save.skinByHero[save.hero]||'default')===sid?'selected':''}" data-skin="${sid}">${sid==='default'||save.skins.includes(sid)?label:'🔒 '+label+' — BEAT QUESTS'}</button>`).join('');
   document.querySelectorAll('[data-skin]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.skin!=='default'&&!save.skins.includes(b.dataset.skin)){toast('FINISH STORY QUESTS TO UNLOCK',1800);return;}
    save.skinByHero[save.hero]=b.dataset.skin;save.skin=b.dataset.skin;persist();openModal('roster');}));}

 }
 if(type==='map'){const unlocked=new Set(quests.slice(0,Math.min(save.quest+1,quests.length)).map(q=>q.area));c.innerHTML='<p>Travel to locations you have reached in the story. Your next quest will always have a golden marker.</p><div class="modal-grid" id="mapGrid"></div>';$('mapGrid').innerHTML=Object.entries(regions).map(([id,r])=>`<button class="region-card" data-travel="${id}" ${!unlocked.has(id)?'disabled':''}><strong>${r.label}</strong><span>${unlocked.has(id)?'TRAVEL HERE':'🔒 LOCKED — PROGRESS STORY'}</span></button>`).join('');document.querySelectorAll('[data-travel]').forEach(b=>b.addEventListener('click',()=>{region=b.dataset.travel;player.x=210;player.y=510;closeModal();updateHud();toast('TRAVELED TO '+regions[region].label); }));}
}
function closeModal(){$('modalShade').hidden=true;modalOpen=false;canvas.focus({preventScroll:true});}
$('closeModal').addEventListener('click',closeModal);$('modalShade').addEventListener('click',e=>{if(e.target.id==='modalShade')closeModal();});document.querySelectorAll('[data-modal]').forEach(b=>b.addEventListener('click',()=>openModal(b.dataset.modal)));
$('startButton').addEventListener('click',begin);$('resetButton').addEventListener('click',()=>{if(confirm('Delete all quest, XP, sorcerer and skin unlock progress on this device?')){save={...starting,unlocks:['yuji'],skins:[]};persist();nudgeToRegion();toast('SAVE RESET');}});$('dialogueContinue').addEventListener('click',continueDialogue);
function drawRect(x,y,w,h,col){ctx.fillStyle=col;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function label(text,x,y,color='#fff',size=13,align='center'){ctx.font=`900 ${size}px monospace`;ctx.textAlign=align;ctx.lineWidth=3;ctx.strokeStyle='#050b17';ctx.strokeText(text,Math.round(x),Math.round(y));ctx.fillStyle=color;ctx.fillText(text,Math.round(x),Math.round(y));}
function sprite(id,frame,x,y,w=72,h=86,flip=false){if(id===save.hero&&save.skinByHero[id]&&save.skinByHero[id]!=='default')id=save.skinByHero[id];const i=img[id]||img.curse;ctx.save();if(flip){ctx.translate(x+w,0);ctx.scale(-1,1);x=0;}
 if(id==='mahoraga'&&bossArt.complete&&bossArt.naturalWidth){const f=Math.round(clamp(frame,0,8));ctx.drawImage(bossArt,(f%3)*256,Math.floor(f/3)*256,256,256,x,y,w,h);}
 else if(i&&i.complete&&i.naturalWidth){const f=clamp(frame,0,29);ctx.drawImage(i,(f%6)*116,Math.floor(f/6)*128,116,128,x,y,w,h);}
 else{drawRect(x+w*.27,y+10,w*.46,h-10,'#293753');drawRect(x+w*.33,y,w*.34,h*.28,'#d7a3a0');}ctx.restore();}
function cameraUpdate(){camera.x=clamp(player.x-W/2,0,WORLD.w-W);camera.y=clamp(player.y-H/2,0,WORLD.h-H);}
function worldDeco(){const r=regions[region];drawRect(0,0,W,H,r.ground);
 ctx.save();ctx.translate(-Math.round(camera.x),-Math.round(camera.y));
 const tx=Math.floor(camera.x/64)*64,ty=Math.floor(camera.y/64)*64;
 for(let y=ty;y<camera.y+H+64;y+=64)for(let x=tx;x<camera.x+W+64;x+=64){let k=rng(x/64*43+y/64*11);drawRect(x,y,63,63,k<.2?'#00000009':k>.82?'#ffffff08':'#00000002');drawRect(x+7+(k*19|0),y+9+(k*34|0),5,3,k>.55?'#96a89c55':'#0f1e2255');}
 // Walkways are always clear; decorations are drawn in the distance.
 for(let x=0;x<WORLD.w;x+=56){drawRect(x,437,54,146,r.path);drawRect(x,442,54,2,'#ffffff14');}
 if(region==='school'){
  drawRect(185,70,1050,244,'#122b35');drawRect(174,60,1070,35,'#253e50');for(let x=240;x<1200;x+=137){drawRect(x,120,65,92,'#35576a');drawRect(x+8,126,49,69,'#9dbfc5');drawRect(x+23,124,3,82,'#314d62');}drawRect(650,193,142,121,'#854f3e');drawRect(710,193,12,121,'#d2b08e');
  for(let x=100;x<1700;x+=265)drawTree(x,750,'#345d45');label('TOKYO JUJUTSU HIGH',715,95,'#f8d8b2',22);
 }else if(region==='shibuya'){
  for(let x=50;x<1700;x+=225){drawRect(x,52,179,285,'#1c233d');for(let wx=x+18;wx<x+174;wx+=31)for(let wy=72;wy<309;wy+=34){drawRect(wx,wy,16,18,rng(wx*2+wy)>.35?'#df9ed2':'#39577d');}drawRect(x+8,290,150,24,x%2?'#8055aa':'#b8489a');}
  for(let x=80;x<1650;x+=120){drawRect(x,445,55,132,'#f9f1dbb0');}label('SHIBUYA',880,106,'#f9afdf',28);
 }else if(region==='station'||region==='sewers'){
  drawRect(0,160,WORLD.w,156,region==='station'?'#30485d':'#263a42');for(let x=65;x<1700;x+=225){drawRect(x,120,30,195,'#607d86');drawRect(x+42,180,110,64,'#233047');drawRect(x+54,190,80,38,'#82a1b2');}for(let x=40;x<1800;x+=180){drawRect(x,619,123,11,'#37434a');}
  label(region==='station'?'CURSED PLATFORM':'UNDERGROUND',800,140,'#dae1ed',24);
 }else if(region==='shrine'){
  for(let x=80;x<1700;x+=280){drawTree(x,130,'#4e2c48');}drawRect(675,116,180,270,'#2c1b27');drawRect(650,104,230,46,'#7e293a');drawRect(630,90,270,24,'#af4850');drawRect(735,200,62,180,'#141721');for(let x=0;x<1750;x+=80)drawRect(x,700,48,5,'#bf8b8b77');label('CURSED SHRINE',750,85,'#f0a0a5',27);
 }else{
  for(let x=70;x<1750;x+=290){if(region==='ruins'){drawRect(x,80,170,260,'#4f4444');drawRect(x+12,75,130,9,'#9d9289');}else if(region==='alley'){drawRect(x,70,190,240,'#282e49');drawRect(x+24,110,37,56,'#7c698c');drawRect(x+110,140,40,55,'#55486e');}}for(let x=90;x<1700;x+=270){if(region==='alley')drawRect(x,720,42,56,'#7c5b6b');else drawTree(x,790,'#536559');}
 }
 // Rare shining particles over the arena, stable deterministic placement.
 for(let i=0;i<28;i++){const x=60+rng(i*33)*1650,y=385+rng(i*97)*580;const a=.25+Math.sin(sceneTime*2+i)*.2;ctx.fillStyle=`rgba(242,207,135,${a})`;ctx.fillRect(x,y,2,2);}
 const t=target();if(t){
  const glowing=(Math.sin(sceneTime*5)+1)/2;ctx.fillStyle=`rgba(255,212,125,${.15+glowing*.12})`;ctx.beginPath();ctx.ellipse(t.x,t.y+4,48,17,0,0,Math.PI*2);ctx.fill();
  if(t.type==='collect'){drawRect(t.x-10,t.y-30,20,29,'#704c94');drawRect(t.x-7,t.y-27,14,22,'#c7b8fc');drawRect(t.x-4,t.y-20,8,8,'#fff2bd');}
  else sprite(t.id,Math.floor(sceneTime*2)%2,t.x-36,t.y-91,t.id==='mahoraga'?135:76,t.id==='mahoraga'?140:90);
  label('▼',t.x,t.y-113+(glowing*6),'#ffdc7f',24);label(t.name,t.x,t.y-125,'#f3d4a0',14);
 }
 const ambient=region==='school'?[['gojo',1060,520],['todo',1270,540],['nanami',900,770]]:region==='shibuya'?[['nobara',1130,650],['megumi',1300,760]]:region==='ruins'?[['choso',1240,640],['hakari',1510,820]]:region==='shrine'?[['gojo',1350,720]]:[];
 for(const [id,x,y]of ambient){if(t&&t.id===id&&Math.hypot(t.x-x,t.y-y)<100)continue;sprite(id,0,x-31,y-72,63,70);label(idName(id).toUpperCase(),x,y-79,'#ccd9ec',11);}
 // Shadow and walk frames of the selected hero.
 ctx.fillStyle='#03081377';ctx.beginPath();ctx.ellipse(player.x,player.y+3,27,9,0,0,Math.PI*2);ctx.fill();const id=save.skinByHero[save.hero]&&save.skinByHero[save.hero]!=='default'?save.skinByHero[save.hero]:save.hero;
 const moving=Boolean(pressed.left||pressed.right||pressed.up||pressed.down);sprite(id,moving?(Math.floor(sceneTime*9)%6):0,player.x-43,player.y-86,86,88,player.face<0);
 label('YOU · '+idName(save.hero).toUpperCase(),player.x,player.y-97,'#a5e9ff',12);
 ctx.restore();
 if(t){const d=dist(player,t);if(d<107)label('PRESS E / TALK TO '+t.name,480,510,'#fff0b6',15);else if(d>110){const angle=Math.atan2(t.y-player.y,t.x-player.x);const x=clamp(480+Math.cos(angle)*250,55,900),y=clamp(270+Math.sin(angle)*150,65,470);label('◆',x,y,'#ffce79',24);}}
}
function drawTree(x,y,col){drawRect(x+24,y+46,15,70,'#4e3939');for(let i=0;i<4;i++){ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x+27+i*10,y+22+i*7,34,28,0,0,Math.PI*2);ctx.fill();}}
function drawBattle(){const b=battle;if(!b)return;const id=b.id;
 drawRect(0,0,W,H,id==='heian'?'#2b1828':id==='mahoraga'?'#25313f':'#17253b');
 for(let i=0;i<18;i++){let x=i*69+Math.sin(i*5)*11,ht=155+(i*19%120);drawRect(x,H-ht-74,65,ht,id==='heian'?'#3b2837':'#25354a');for(let y=H-ht-54;y<H-105;y+=28)drawRect(x+10,y,9,8,id==='heian'?'#c84c5c66':'#a9b9e644');}
 drawRect(0,412,W,128,id==='heian'?'#543446':'#424c5f');for(let x=0;x<W;x+=45){drawRect(x,413,42,3,'#acabc177');drawRect(x,451,42,2,'#070d1777');}
 // Boss-specific atmosphere, each boss uses its own distinct sprite (never Todo).
 if(id==='mahoraga'){ctx.strokeStyle='#ffdfad';ctx.lineWidth=4;ctx.beginPath();ctx.arc(b.enemyX,180,52,sceneTime*(b.phase===2?2.8:1.5),sceneTime*(b.phase===2?2.8:1.5)+Math.PI*1.8);ctx.stroke();for(let a=0;a<8;a++){let t=sceneTime*2+a*Math.PI/4;drawRect(b.enemyX+Math.cos(t)*58,180+Math.sin(t)*58,9,8,'#ffd58c');}}
 if(id==='jogo'){for(let i=0;i<12;i++){let x=530+(i*49%420),y=410-rng(i*3)*260;drawRect(x,y+Math.sin(sceneTime*3+i)*27,6,16,i%2?'#ffb34b':'#f5684f');}}
 if(id==='hanami'){for(let i=0;i<8;i++){ctx.strokeStyle='#739870';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(520+i*53,420);ctx.quadraticCurveTo(480+i*53,360,545+i*50,280);ctx.stroke();}}
 if(id==='mahito'){for(let i=0;i<9;i++)drawRect(600+i*36,160+Math.sin(i+sceneTime)*32,2,20,'#92bfd2aa');}
 if(id==='heian'){for(let i=0;i<24;i++)drawRect((i*53+sceneTime*17)%W,60+rng(i*38)*340,2,4,'#ed6b76');}
 if(b.warn>0){
   const threat=id==='mahoraga'&&b.move?b.move.name:id==='heian'&&b.phase===3?'WORLD-CUTTING SLASH!':'PARRY OR DODGE!';
   const width=id==='mahoraga'&&b.move?.id==='wave'?W-60:id==='mahoraga'&&b.move?.id==='slam'?460:260;
   drawRect(b.enemyX-width/2,380,width,35,'#ff4b5577');
   label(threat,W/2,116,'#ffe9bb',id==='mahoraga'?20:24);
   label('BLOCK (F) / PERFECT PARRY / SPACE DASH',W/2,145,'#e6edff',14);
 }
 // Player and enemy animate separate frames.
 const moving=pressed.left||pressed.right;const fid=save.skinByHero[save.hero]&&save.skinByHero[save.hero]!=='default'?save.skinByHero[save.hero]:save.hero;
 sprite(fid,attackTime>0?12:moving?6+Math.floor(sceneTime*6)%6:Math.floor(sceneTime*2)%2,b.px-83,266,166,154,b.pxdir<0);
 let scale=id==='mahoraga'?1.56:id==='heian'?1.18:1;
 const bossFrame=id==='mahoraga'
   ?(b.warn>0&&b.move?b.move.pose:(sceneTime<b.poseUntil?b.attackPose:Math.abs(b.enemyX-b.px)>128?Math.floor(sceneTime*5)%2+1:0))
   :(b.warn>0?14:Math.floor(sceneTime*2)%2);
 const bossWidth=170*scale,bossHeight=160*scale;
 sprite(id,bossFrame,b.enemyX-bossWidth/2,412-bossHeight,bossWidth,bossHeight,b.enemyDir<0);
 // Guard indicator and character identity labels.
 if(b.guard){ctx.strokeStyle=sceneTime-b.guardStart<.34?'#fff2a5':'#69c1fb';ctx.lineWidth=7;ctx.beginPath();ctx.arc(b.px,337,79,-.9,1.85);ctx.stroke();}
 label(idName(save.hero).toUpperCase(),b.px,256,'#a4edff',14);label(idName(id).toUpperCase(),b.enemyX,248,'#ffa5a5',15);
 drawRect(25,24,280,25,'#0c132b');drawRect(28,27,274*(b.hp/b.maxHP),19,'#48c591');label('HP '+Math.ceil(b.hp)+' / '+b.maxHP,164,43,'#fff',13);
 drawRect(25,54,182,12,'#1d243d');drawRect(25,54,182*(b.energy/100),12,'#79d0f5');label('CE',224,65,'#c6e8ff',11,'left');
 for(const f of fx){if(['wheel','slam','rush','wave'].includes(f.type)){
   const alpha=clamp(1-f.t/.7,0,1);ctx.save();ctx.globalAlpha=alpha;
   ctx.strokeStyle=f.type==='wheel'?'#ffe087':f.type==='slam'?'#b6a7ee':'#c785ff';
   ctx.lineWidth=f.type==='wave'?13:7;
   if(f.type==='wave'){ctx.beginPath();ctx.moveTo(f.x,310);ctx.lineTo(b.px,310);ctx.stroke();}
   else{ctx.beginPath();ctx.ellipse(f.x,f.y,25+f.t*(f.type==='slam'?320:135),10+f.t*100,0,0,Math.PI*2);ctx.stroke();}
   ctx.restore();
 }else if(f.type==='energy'){ctx.globalAlpha=clamp(1-f.t/.65,0,1);ctx.strokeStyle='#a19bff';ctx.lineWidth=7;ctx.beginPath();ctx.arc(f.x,f.y,30+f.t*120,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
 else if(f.type==='parry'){ctx.globalAlpha=clamp(1-f.t/.7,0,1);ctx.strokeStyle='#d8ffff';ctx.lineWidth=7;ctx.beginPath();ctx.arc(f.x,f.y,25+f.t*130,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
 else{drawRect(f.x-12,f.y-12,24,24,'#ffb4ab');}}
 label('J: PUNCH    1–4: CURSED TECHNIQUE    F: BLOCK / PERFECT PARRY    SPACE: DASH',480,523,'#e6ecff',13);
}
function draw(){ctx.imageSmoothingEnabled=false;if(!started){drawRect(0,0,W,H,'#0a1020');return;}if(mode==='explore')worldDeco();else drawBattle();}
function update(dt){sceneTime+=dt;attackTime=Math.max(0,attackTime-dt);if(toastUntil&&performance.now()>toastUntil){$('messageToast').classList.remove('visible');toastUntil=0;}
 if(!started||modalOpen||dialogue)return;
 if(mode==='explore'){
  const vx=(pressed.right?1:0)-(pressed.left?1:0),vy=(pressed.down?1:0)-(pressed.up?1:0),v=Math.hypot(vx,vy)||1;
  player.x=clamp(player.x+vx/v*240*dt,45,WORLD.w-45);player.y=clamp(player.y+vy/v*240*dt,350,WORLD.h-80);if(vx)player.face=vx>0?1:-1;cameraUpdate();
 }else updateFight(dt);
 for(const f of fx)f.t+=dt;fx=fx.filter(f=>f.t<.7);
}
function loop(now){const dt=clamp((now-last)/1000||0,0,.04);last=now;update(dt);draw();requestAnimationFrame(loop);}
const holdKeys={a:'left',arrowleft:'left',d:'right',arrowright:'right',w:'up',arrowup:'up',s:'down',arrowdown:'down',f:'guard'};
window.addEventListener('keydown',e=>{
 if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
 const k=e.key.toLowerCase();if(holdKeys[k]){pressed[holdKeys[k]]=true;e.preventDefault();}if(e.repeat)return;
 if(k==='escape'){if(modalOpen)closeModal();else if(dialogue)continueDialogue();return;}
 if(modalOpen||!started)return;
 if(k==='e'){interact();e.preventDefault();}else if(k==='j'){attack();e.preventDefault();}else if(['1','2','3','4'].includes(k)){attack(Number(k));e.preventDefault();}else if(k===' '){dodge();e.preventDefault();}else if(k==='m'){openModal('map');}else if(k==='r'){openModal('roster');}else if(k==='q'){if(mode==='fight')attack(1);else openModal('quests');}
});
window.addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(holdKeys[k])pressed[holdKeys[k]]=false;});
window.addEventListener('blur',()=>{pressed={};guardUp();});document.addEventListener('visibilitychange',()=>{if(document.hidden){pressed={};guardUp();}});
canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&mode==='fight'&&started&&!modalOpen)attack();});
function action(name){if(name==='interact'){if(mode==='fight')dodge();else interact();}else if(name==='attack')attack();else if(name.startsWith('skill'))attack(Number(name.slice(5))||1);else if(name==='dash')dodge();}
// iPad and iPhone: bind every contact separately so holding movement and pressing Punch works at once.
const controls=$('touchControls');controls.addEventListener('contextmenu',e=>e.preventDefault());controls.addEventListener('selectstart',e=>e.preventDefault());controls.addEventListener('dragstart',e=>e.preventDefault());
controls.addEventListener('touchstart',e=>e.preventDefault(),{passive:false});controls.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});controls.addEventListener('touchend',e=>e.preventDefault(),{passive:false});
for(const b of controls.querySelectorAll('button')){
 b.addEventListener('pointerdown',e=>{e.preventDefault();b.classList.add('pressed');try{b.setPointerCapture(e.pointerId);}catch{}if(b.dataset.hold){pressed[b.dataset.hold]=true;if(b.dataset.hold==='guard')guardDown();}else action(b.dataset.action);});
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,e=>{e.preventDefault();b.classList.remove('pressed');if(b.dataset.hold){pressed[b.dataset.hold]=false;if(b.dataset.hold==='guard')guardUp();}});
}
// Avoid double-tap zoom/long-press selection within the game area only; menus remain accessible.
for(const ev of ['contextmenu','selectstart','dragstart'])$('viewport').addEventListener(ev,e=>e.preventDefault());
$('gameArea').addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
// Test and accessibility helpers (no gameplay progress granted here).
window.__JJK_DEBUG={getState:()=>({started,mode,region,quest:save.quest,step:save.step,hero:save.hero,level:save.level,unlocks:[...save.unlocks],skins:[...save.skins],player:{...player},battle:battle?{id:battle.id,enemyHP:battle.enemyHP,hp:battle.hp,phase:battle.phase,move:battle.move?.id,pose:battle.attackPose}:null}),move:(x,y)=>{player.x=x;player.y=y;cameraUpdate();},interact,openModal};
updateHud();requestAnimationFrame(loop);
})();
