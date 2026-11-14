'use strict';
/* JJK Pixel Quest RPG V23 — solo world exploration / repeatable quests / arena bosses.
   Multiplayer remains on /arena. All progression is stored only in this browser. */
(() => {
const C=window.CursedRPG, Z=C.ZONES, $=id=>document.getElementById(id);
const cv=$('canvas'),g=cv.getContext('2d',{alpha:false}),SW=1024,SH=576,T=32,MW=80,MH=56,MAXX=MW*T,MAXY=MH*T;
g.imageSmoothingEnabled=false;
const clamp=(a,min,max)=>Math.max(min,Math.min(max,a)),hypot=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const imgs={}, IDs=['yuji','megumi','todo','gojo','maki','yuta','hakari','nanami','mahito','jogo','hanami','finger','geto','kenjaku','dagon','curse','heian','gojo_final','yuji_shibuya','megumi_shadow','maki_battle','hakari_jackpot'];
for(const name of IDs){imgs[name]=new Image();imgs[name].src=(window.__SPRITES?.[name]||'/sprites/'+name+'.png?v=26');}
const maho=new Image();maho.src=(window.__SPRITES?.mahoraga_boss||'/sprites/mahoraga_boss.png?v=23');
/* V24 environmental art only. Character sprites, fighting moves and saved progression are unchanged. */
const tilesArt=new Image();tilesArt.src='/world24/world_tiles.png?v=24';
const cityArt={};for(const name of ['neon','kado','arcade','hotel','office']){cityArt[name]=new Image();cityArt[name].src=window.__WORLD_ASSETS?.['city_'+name]||'/world24/city_'+name+'.png?v=24';}
const buildingArt={},decoArt={};
for(const name of ['academy','dojo','dorm','library','medic','shop','shrine']){buildingArt[name]=new Image();buildingArt[name].src=window.__WORLD_ASSETS?.['building_'+name]||'/world24/building_'+name+'.png?v=24';}
for(const name of ['pine','sakura','lantern','torii','bench','bush','chest','stone','shrinegate','vending','pond','flowerbed']){decoArt[name]=new Image();decoArt[name].src=window.__WORLD_ASSETS?.['deco_'+name]||'/world24/deco_'+name+'.png?v=24';}
const SCHOOL_SECRET=[
 {id:'forest-cache',x:7,y:42,coins:175,label:'WOODLAND RELIC CACHE'},
 {id:'ancient-offering',x:44,y:52,coins:260,label:'FORGOTTEN SHRINE OFFERING'},
 {id:'archive-cache',x:74,y:46,coins:350,label:'CURSED ARCHIVE STASH'}
];
let interior=null;

let state;try{state=C.sanitize(JSON.parse(localStorage.getItem('jjk-cursed-grind-v23')||'null'));}catch{state=C.initial();}
const portraitURL=id=>(window.__SPRITES?.[id]||'/sprites/'+id+'.png');
const controls={left:false,right:false,up:false,down:false,guard:false};
let started=false,modal=false,mode='world',battle=null,world=null,mobs=[],fx=[],now=0,last=0,cooldown=0,spellCD=0,globalInvul=0,face=1,attackFlash=0,toastTimer=0,coinTimer=0;
const P={x:(state.x+.5)*T,y:(state.y+.5)*T,hp:100,ce:100,face:1};
if(!Array.isArray(state.worldFinds))state.worldFinds=[];
if(!Array.isArray(state.worldSeen))state.worldSeen=[];
const NPCS={
 school:{x:9,y:18,id:'gojo',label:'GOJO · QUEST GIVER'},
 streets:{x:17,y:18,id:'nanami',label:'NANAMI · MISSIONS'},
 shibuya:{x:20,y:18,id:'todo',label:'TODO · SHIBUYA QUESTS'},
 subway:{x:12,y:19,id:'nanami',label:'NANAMI · SUBWAY QUESTS'},
 forest:{x:17,y:24,id:'maki',label:'MAKI · FOREST QUESTS'},
 ruins:{x:20,y:18,id:'yuta',label:'YUTA · SHINJUKU QUESTS'},
 shrine:{x:13,y:20,id:'gojo',label:'GOJO · FINAL TRAINING'}
};
const BOSS_POS={school:[52,31],streets:[59,20],shibuya:[54,38],subway:[57,17],forest:[57,36],ruins:[61,35],shrine:[58,33]};
const STAGE_NAMES=['THE AWAKENING','CURSED INVESTIGATION','SHIBUYA INCIDENT','BELOW SHIBUYA','FOREST OF CURSES','THE FINAL BARRIER','KING OF CURSES'];
const NPC_LINES=[
 'This academy trains sorcerers to protect people. Start with minor curses, gather evidence, and grow stronger.',
 'Strange disappearances are increasing in Tokyo. Investigate the streets and prepare for Geto.',
 'The barriers around Shibuya are growing unstable. Protect the crossing, investigate, and confront Mahito.',
 'The underground platforms are crawling with dangerous spirits. Jogo is waiting deeper inside.',
 'Cursed vegetation is spreading. Eliminate forest spirits before challenging Hanami.',
 'The ruins are unstable. Only experienced sorcerers should face the adapting shikigami.',
 'Reach level 100, awaken Prime Gojo, and challenge the King of Curses.'
];
const TRACE_SPOTS=[[[25,21],[39,42],[62,38],[55,20],[15,40],[68,48]],[[28,17],[49,31],[61,17],[34,45],[18,31],[70,42]],[[35,27],[53,27],[70,12],[12,44],[54,43],[27,30]],[[24,22],[51,22],[67,44],[17,37],[58,10],[35,44]],[[19,23],[54,37],[57,19],[30,31],[41,42],[60,43]],[[35,16],[50,30],[65,34],[31,43],[31,45],[68,14]],[[35,18],[59,33],[14,34],[57,45],[43,31],[71,45]]];
const palette=[
 {earth:'#456b52',floor:'#8a9a7f',wall:'#333f4a',edge:'#1c3041',light:'#a8c3a2'},
 {earth:'#535468',floor:'#7b7c93',wall:'#282c49',edge:'#1b2039',light:'#b8aeca'},
 {earth:'#3e4661',floor:'#737a90',wall:'#252942',edge:'#1b2239',light:'#f9b3d0'},
 {earth:'#404b55',floor:'#7e808c',wall:'#283440',edge:'#1c2a3c',light:'#a9c9d0'},
 {earth:'#3a6750',floor:'#698873',wall:'#263a31',edge:'#203b39',light:'#b0ddad'},
 {earth:'#65545b',floor:'#98817e',wall:'#46343d',edge:'#382c35',light:'#ebafa2'},
 {earth:'#483140',floor:'#79505b',wall:'#2f2031',edge:'#281423',light:'#e8889f'}
];
let frame=0;const seed=(a,b,c)=>{let x=Math.sin(a*22.871+b*81.217+c*13.933)*43758.23;return x-Math.floor(x)};
function save(){if(!interior){state.x=Math.floor(P.x/T);state.y=Math.floor(P.y/T);}try{localStorage.setItem('jjk-cursed-grind-v23',JSON.stringify(state));}catch{/* Local file/preview browsers can deny storage. Gameplay continues. */}}
function maxHP(){return 105+state.level*6+state.def*11;}
function power(){return 9+state.level*.85+state.str*1.7+(state.hero==='gojo_prime'?48:0);}
P.hp=maxHP();
function notice(t,sec=2.2){$('notice').textContent=t;$('notice').classList.add('show');toastTimer=now+sec;}
function hud(){const max=C.xpNeed(state.level),fraction=state.level>=C.MAX_LEVEL?1:state.xp/max;$('heroName').textContent=state.hero==='gojo_prime'?'PRIME GOJO':state.hero.toUpperCase();$('levelName').textContent='LV '+state.level+(state.level>=C.MAX_LEVEL?' · MAX LEVEL':' · '+STAGE_NAMES[state.zone]);$('hpFill').style.width=clamp(P.hp/maxHP()*100,0,100)+'%';$('xpFill').style.width=clamp(fraction*100,0,100)+'%';$('vitals').textContent=Math.ceil(P.hp)+' / '+maxHP()+' HP · '+(state.level>=100?'MAX XP':Math.floor(state.xp)+' / '+max+' XP');$('coins').textContent=state.coins.toLocaleString();$('zoneName').textContent=Z[state.zone].name;
 const q=state.quest;
 if(q){$('questName').textContent=q.boss?'⚠ BOSS: '+Z[q.stage].bossName:q.name;$('questObjective').textContent=q.boss?'Defeat the boss · '+(q.done?'RETURN TO NPC':'LEVEL '+Z[q.stage].bossLevel+' REQUIRED'):q.done?'RETURN TO QUEST GIVER TO CLAIM REWARDS':(q.kind==='collect'?`Investigate traces ${q.kills}/${q.target}`:`Exorcise ${q.kills}/${q.target} ${Z[q.stage].mobName}`)+' · +'+q.xp+' XP / +'+q.coins+' 🪙';}
 else {$('questName').textContent='NO ACTIVE CONTRACT';$('questObjective').textContent='Speak to the glowing NPC to accept a quest';}
}
function idx(x,y){return y*MW+x;}
function mset(tiles,x,y,t){if(x>=0&&y>=0&&x<MW&&y<MH)tiles[idx(x,y)]=t;}
function box(tiles,x,y,w,h,t){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)mset(tiles,xx,yy,t);}
function path(tiles,x1,y1,x2,y2,width=5){if(x1===x2)box(tiles,x1-Math.floor(width/2),Math.min(y1,y2),width,Math.abs(y2-y1)+1,2);else if(y1===y2)box(tiles,Math.min(x1,x2),y1-Math.floor(width/2),Math.abs(x2-x1)+1,width,2);}
function makeMap(stage){const tiles=new Uint8Array(MW*MH),buildings=[],decor=[];tiles.fill(1);const z=Z[stage],rand=(x,y)=>seed(x,y,stage*100);
 const bld=(x,y,w,h,n)=>{box(tiles,x,y,w,h,4);buildings.push({x,y,w,h,name:n||''});};
 const tree=(x,y)=>{if(x>=2&&y>=2&&x<MW-2&&y<MH-2&&tiles[idx(x,y)]===1)mset(tiles,x,y,5);};
 const puddle=(x,y,w,h)=>box(tiles,x,y,w,h,6);
 // The zones have varied topology: buildings block movement, plazas form intersections,
 // secondary lanes connect courtyards, and detours around obstacles remain open.
 if(stage===0){
  // Academy campus: deliberate courtyard and branching paths, no full-screen rectangle roads.
  // Tile types: 1 grass, 2 stone path, 3 courtyard, 4 roof/walls, 5 trees, 6 water, 7 bridge.
  tiles.fill(1);
  const brush=(x,y,r,t)=>{for(let iy=-r;iy<=r;iy++)for(let ix=-r;ix<=r;ix++)if(ix*ix+iy*iy<=r*r+1)mset(tiles,Math.round(x+ix),Math.round(y+iy),t);};
  const route=(nodes,r=2,t=2)=>{for(let i=1;i<nodes.length;i++){let [x0,y0]=nodes[i-1],[x1,y1]=nodes[i],steps=Math.ceil(Math.hypot(x1-x0,y1-y0)*3);for(let k=0;k<=steps;k++){let v=k/Math.max(1,steps);brush(x0+(x1-x0)*v,y0+(y1-y0)*v,r,t);}}};
  const patio=(x,y,w,h)=>box(tiles,x,y,w,h,3);
  const house=(id,x,y,w,h,name)=>{bld(x,y,w,h,name);const b=buildings[buildings.length-1];b.art=id;b.door=[x+Math.floor(w/2),y+h];mset(tiles,b.door[0],y+h-1,3);brush(b.door[0],y+h,1,3);};
  // Two natural springs, a stream with actual bridge crossings and a shaded forest edge.
  for(let y=7;y<52;y++){const x=Math.round(73+Math.sin(y*.22)*1.8);for(let xx=x;xx<x+3;xx++)mset(tiles,xx,y,6);}
  for(let y=0;y<55;y++){if(y<17||y>47){const x=Math.floor(4+Math.sin(y*.18)*1.3);if(x>2)mset(tiles,x,y,6);}}
  // Winding routes connect the training yard, northern campus, gardens and shrine.
  route([[9,18],[16,21],[26,22],[38,23],[48,23],[55,27],[52,31]],1,2);
  route([[38,23],[38,17],[41,17]],2,2);
  route([[26,22],[22,29],[21,35],[25,42],[32,48],[42,50]],2,2);
  route([[41,21],[50,16],[56,16],[62,23],[64,35],[62,39],[63,46],[70,48]],2,2);
  route([[52,31],[46,37],[39,42],[36,48],[44,52]],2,2);
  route([[13,18],[8,25],[9,34],[7,42],[14,48],[26,48]],1,2);
  route([[14,19],[13,11],[20,7],[31,10],[41,17]],1,2);
  route([[42,50],[51,47],[64,46],[74,46]],1,2);
  route([[21,35],[15,40]],1,2);
  route([[55,27],[55,20],[67,19]],1,2);
  patio(29,20,17,7);box(tiles,33,24,4,3,1);box(tiles,41,24,3,2,1);
  patio(7,16,10,6);route([[9,21],[11,24],[15,28],[19,31]],1,2);box(tiles,8,24,7,5,1);
  patio(34,29,9,6);box(tiles,38,31,3,3,1);
  patio(46,27,11,9);
  // Buildings have individually illustrated Japanese roofs and real entrance triggers.
  house('academy',28,5,26,11,'JUJUTSU HIGH');
  house('dojo',1,7,12,8,'TRAINING DOJO');
  house('dorm',58,4,14,8,'DORMITORY');
  house('library',58,12,14,9,'CURSED ARCHIVE');
  house('medic',31,40,12,8,'MEDICAL WING');
  house('shop',12,37,11,8,'SORCERER SHOP');
  house('shrine',46,42,10,7,'ANCIENT SHRINE');
  // Restore walkable loops and accessible quest positions after constructing footprints.
  for(const [x,y] of [[9,18],[11,18],[25,21],[39,42],[62,38],[55,20],[15,40],[68,48],[37,22],[51,24],[66,42],[45,47],[23,38],[12,34],[57,48],[52,31],[7,42],[44,52],[74,46]])brush(x,y,1,3);
  route([[9,18],[25,21],[37,22],[51,24],[52,31]],1,2);
  route([[9,18],[12,34],[15,40],[23,38],[39,42],[44,52]],1,2);
  route([[52,31],[62,38],[66,42],[68,48],[74,46]],1,2);
  route([[52,31],[45,47],[57,48],[68,48]],1,2);
  for(let y of [20,35])for(let x=72;x<=77;x++)mset(tiles,x,y,7);
  const scenery=(x,y,type)=>{decor.push({x,y,type});};
  // Hand-placed groves and campus gardens rather than random decorations everywhere.
  const groves=[[3,5,24,7],[3,48,23,7],[50,2,8,10],[67,41,11,13],[47,34,12,10],[1,25,6,16]];
  for(let k=0;k<groves.length;k++){const [gx,gy,gw,gh]=groves[k];for(let j=0;j<30;j++){
    const tx=gx+Math.floor(rand(j+k*53,12)*gw),ty=gy+Math.floor(rand(j+k*53,34)*gh);
    if(tx>=2&&ty>=2&&tx<MW-3&&ty<MH-3&&tiles[idx(tx,ty)]===1){mset(tiles,tx,ty,5);scenery(tx,ty,j%8===0?'sakura':'pine');}
  }}
  const fixed=[
   [24,19,'torii'],[41,19,'lantern'],[48,20,'lantern'],[9,21,'bench'],[14,23,'bench'],[18,24,'bush'],[7,27,'flowerbed'],[15,29,'flowerbed'],[20,18,'lantern'],[22,25,'sakura'],[14,13,'lantern'],
   [7,29,'sakura'],[13,31,'sakura'],[32,20,'flowerbed'],[47,20,'flowerbed'],[26,28,'flowerbed'],
   [33,31,'sakura'],[44,31,'sakura'],[35,26,'flowerbed'],[41,27,'flowerbed'],[29,26,'lantern'],[49,26,'lantern'],
   [55,38,'lantern'],[58,26,'vending'],[54,50,'shrinegate'],[61,45,'bush'],[72,48,'stone'],
   [8,44,'stone'],[6,39,'pond'],[24,49,'sakura'],[36,36,'bench'],[33,34,'flowerbed'],
   [44,52,'chest'],[7,42,'chest'],[74,46,'chest'],[59,24,'stone'],[69,25,'lantern']
  ];
  for(const [x,y,type] of fixed)scenery(x,y,type);
  for(let i=0;i<115;i++){
   const tx=2+Math.floor(rand(i,391)*75),ty=2+Math.floor(rand(i,392)*52);
   if(tiles[idx(tx,ty)]===1&&rand(i,400)>.53)scenery(tx,ty,rand(i,15)>.45?'bush':'flowerbed');
  }
 }else if(stage===1){
  box(tiles,0,0,80,56,1);for(const x of [13,30,49,68])path(tiles,x,2,x,53,6);for(const y of [17,32,47])path(tiles,1,y,78,y,7);
  for(let by=2;by<52;by+=15)for(let bx=1;bx<75;bx+=18){if((bx+by)%4===0)continue;bld(bx+3,by+3,9,7,['SHOP','APARTMENTS','WAREHOUSE'][Math.floor(rand(bx,by)*3)]);}
  box(tiles,9,13,13,12,3);box(tiles,53,13,18,15,3);
 }else if(stage===2){
  for(let i=0;i<MW*MH;i++)tiles[i]=1;
  for(const x of [12,34,53,71])path(tiles,x,0,x,55,8);
  for(const y of [11,27,43])path(tiles,0,y,79,y,9);
  // Shibuya scramble intersection has four diagonal pedestrian crossings.
  box(tiles,27,20,16,16,3);
  for(let y=3;y<52;y+=16)for(let x=3;x<78;x+=19){if(x>24&&x<44&&y>17&&y<37)continue;bld(x,y,Math.min(12,78-x),9,['109 BUILDING','NEON MALL','ARCADE','HOTEL','OFFICE'][Math.floor(rand(x,y)*5)]);}
  for(let k=0;k<13;k++){const u=18+k*3;for(let v=0;v<4;v++){mset(tiles,27+k,22+v,7);mset(tiles,39-k,32+v,7);}}
  box(tiles,55,33,17,13,3);box(tiles,15,18,12,12,3);
  // Secondary narrow streets and alleys; the main crossing is not the only route.
  path(tiles,23,11,23,26,2);path(tiles,24,43,24,52,3);path(tiles,34,17,53,17,2);
  path(tiles,46,27,46,43,2);path(tiles,58,11,58,27,2);path(tiles,62,27,62,43,2);
  path(tiles,12,20,34,20,2);path(tiles,53,36,70,36,2);
  // Night-city street furniture and little exploratory details.
  for(const [x,y,type] of [[10,17,'vending'],[18,27,'lantern'],[26,13,'vending'],[30,38,'lantern'],[39,19,'lantern'],[44,26,'vending'],[56,42,'vending'],[67,28,'lantern'],[71,44,'lantern'],[15,43,'bench'],[63,12,'vending']])decor.push({x,y,type});
 }else if(stage===3){
  tiles.fill(4);box(tiles,3,8,74,40,2);for(const y of [12,22,36,45])path(tiles,5,y,73,y,5);
  for(const x of [9,30,51,69])path(tiles,x,8,x,46,5);for(let x=15;x<67;x+=11){box(tiles,x,27,5,2,8);box(tiles,x,30,5,2,8);}bld(37,10,8,8,'TICKET GATES');box(tiles,33,10,18,13,3);
  for(let x=10;x<77;x+=15)box(tiles,x,39,4,4,4);
 }else if(stage===4){
  tiles.fill(1);box(tiles,9,13,18,19,3);box(tiles,40,30,25,14,3);path(tiles,20,23,20,43,6);path(tiles,20,42,53,42,6);path(tiles,20,19,57,19,5);path(tiles,57,19,57,39,6);path(tiles,30,20,30,33,5);path(tiles,30,33,53,33,5);
  puddle(34,9,11,6);puddle(10,39,12,8);for(let i=0;i<175;i++){tree(Math.floor(rand(i,3)*78),Math.floor(rand(i,6)*53));}box(tiles,49,28,16,13,3);
 }else if(stage===5){
  tiles.fill(1);for(const x of [13,31,48,67])path(tiles,x,3,x,52,6);for(const y of [14,31,45])path(tiles,2,y,77,y,7);
  for(let y=4;y<52;y+=16)for(let x=3;x<77;x+=17){if(rand(x,y)>.21)bld(x+2,y+2,9,8,'RUINED TOWER');}
  box(tiles,8,12,17,14,3);box(tiles,53,29,20,18,3);for(let i=0;i<50;i++)if(rand(i,77)>.5)mset(tiles,3+Math.floor(rand(i,21)*74),4+Math.floor(rand(i,22)*48),8);
 }else{
  tiles.fill(1);for(const x of [12,35,59])path(tiles,x,8,x,51,6);for(const y of [18,34,46])path(tiles,7,y,73,y,6);box(tiles,45,21,23,23,3);bld(49,8,16,7,'MALEVOLENT SHRINE');for(let i=0;i<80;i++)tree(2+Math.floor(rand(i,9)*75),3+Math.floor(rand(i,13)*50));
  box(tiles,9,18,12,10,3);
 }
 // Place a guaranteed accessible NPC clearing and boss clearing.
 const n=NPCS[z.id];box(tiles,n.x-2,n.y-2,5,5,3);const [bx,by]=BOSS_POS[z.id];box(tiles,bx-4,by-4,9,9,3);
 for(let i=0;i<125;i++){let x=2+Math.floor(rand(i,89)*76),y=2+Math.floor(rand(i,98)*52);if(tiles[idx(x,y)]===1)decor.push({x,y,type:rand(i,4)>.7?'flowers':'crack'});}
 return {tiles,buildings,decor};
}
const MAPS=Z.map((_,i)=>makeMap(i));
function tile(tx,ty){if(interior){if(tx<0||ty<0||tx>=MW||ty>=MH)return 4;return interior.tiles[idx(tx,ty)];}if(tx<0||ty<0||tx>=MW||ty>=MH)return 4;return world.tiles[idx(tx,ty)];}
function canStep(x,y){const tx=Math.floor(x/T),ty=Math.floor(y/T);return ![4,5,6,8].includes(tile(tx,ty));}
function stepTowards(x,y,dx,dy){if(canStep(x+dx,y))x+=dx;if(canStep(x,y+dy))y+=dy;return {x,y};}
function resetPos(){const n=NPCS[Z[state.zone].id];P.x=clamp((state.x+.5)*T,16,MAXX-16);P.y=clamp((state.y+.5)*T,16,MAXY-16);if(!canStep(P.x,P.y)){P.x=(n.x+3)*T;P.y=(n.y+3)*T;}P.hp=Math.min(P.hp,maxHP());}
function changeZone(i){if(interior)exitInterior();if(!C.canVisit(state,i)){notice('LOCKED: BEAT THE PREVIOUS BOSS AND REACH LV '+Z[i].min);return false;}state.zone=i;world=MAPS[i];const n=NPCS[Z[i].id];P.x=(n.x+4.5)*T;P.y=(n.y+4.5)*T;state.x=Math.floor(P.x/T);state.y=Math.floor(P.y/T);mobs=spawnMobs(i);save();hud();notice('WELCOME TO '+Z[i].name,3);return true;}
function spawnMobs(stage){const z=Z[stage],arr=[];let anchors=[];
 if(stage===0)anchors=[[37,22],[51,24],[66,42],[45,47],[23,38],[12,34],[57,48]];
 if(stage===1)anchors=[[28,17],[48,27],[62,16],[34,45],[17,33],[70,42],[53,48]];
 if(stage===2)anchors=[[34,27],[53,28],[70,15],[40,45],[12,43],[21,27],[57,42]];
 if(stage===3)anchors=[[24,23],[53,23],[67,42],[36,44],[17,35],[57,11],[15,12]];
 if(stage===4)anchors=[[50,19],[44,36],[60,34],[24,19],[32,35],[54,44],[70,48]];
 if(stage===5)anchors=[[37,15],[51,31],[67,34],[24,45],[43,43],[67,17],[57,46]];
 if(stage===6)anchors=[[42,18],[65,33],[35,44],[55,46],[17,35],[45,31],[68,47]];
 for(let i=0;i<7;i++){let [tx,ty]=anchors[i];if(!canStepStage(stage,tx,ty)){for(let k=0;k<7;k++){if(canStepStage(stage,tx+k,ty+k)){tx+=k;ty+=k;break;}}}arr.push({id:i,kind:z.mob,x:(tx+.5)*T,y:(ty+.5)*T,homeX:(tx+.5)*T,homeY:(ty+.5)*T,hp:70+stage*80,max:70+stage*80,alive:true,respawn:0,aggro:0,attack:0,stun:0});}
 return arr;
}
function canStepStage(stage,x,y){return ![4,5,6,8].includes(MAPS[stage].tiles[idx(clamp(x,0,MW-1),clamp(y,0,MH-1))]);}
function sprite(id,fr,x,y,w,h,flip=false){let pic=(id==='mahoraga'?maho:imgs[id])||imgs.curse;g.save();if(flip){g.translate(x+w,0);g.scale(-1,1);x=0;}if(pic&&pic.complete&&pic.naturalWidth){if(id==='mahoraga')g.drawImage(pic,clamp(fr%3,0,2)*256,Math.floor(fr/3)%3*256,256,256,x,y,w,h);else g.drawImage(pic,(fr%6)*116,Math.floor(fr/6)%5*128,116,128,x,y,w,h);}else{g.fillStyle=id==='mahito'?'#77a9bb':id==='jogo'?'#e87338':id==='hanami'?'#6f986d':id==='finger'?'#857c99':'#aab5c7';g.fillRect(x+w*.25,y,w*.5,h);g.fillStyle='#1e2538';g.fillRect(x+w*.24,y+h*.5,w*.52,h*.5);}g.restore();}
function rect(x,y,w,h,col){g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));}
function write(s,x,y,color='#fff',font=15,align='center'){g.font='bold '+font+'px monospace';g.textAlign=align;g.lineWidth=3;g.strokeStyle='#0b1124';g.strokeText(s,Math.round(x),Math.round(y));g.fillStyle=color;g.fillText(s,Math.round(x),Math.round(y));}
const cam={x:0,y:0};
function enterInterior(b){
 interior={b,fromX:P.x,fromY:P.y,tiles:new Uint8Array(MW*MH)};
 interior.tiles.fill(4);box(interior.tiles,27,17,26,21,40);box(interior.tiles,28,18,24,19,3);
 // Interior perimeter walls; altar, displays and shelves are real collision obstacles.
 for(let x=29;x<52;x+=4){if(b.art==='library')box(interior.tiles,x,19,2,3,4);else if(b.art==='dojo')box(interior.tiles,x,19,1,2,4);}
 box(interior.tiles,35,23,5,3,4);box(interior.tiles,44,24,3,2,4);
 P.x=39*T;P.y=34*T;clearInputs();notice('ENTERED '+b.name+' — PRESS E BY THE SOUTH EXIT',2.8);
}
function exitInterior(){if(!interior)return;P.x=interior.fromX;P.y=interior.fromY;interior=null;save();notice('RETURNED TO CAMPUS');}
function drawInterior(){
 cam.x=clamp(P.x-SW/2,0,MAXX-SW);cam.y=clamp(P.y-SH/2,0,MAXY-SH);
 rect(0,0,SW,SH,'#101724');
 for(let y=15;y<40;y++)for(let x=25;x<55;x++){
  let q=tile(x,y),ti=q===40?40:q===3?6:21;
  let xx=Math.round(x*T-cam.x),yy=Math.round(y*T-cam.y);
  if(tilesArt.complete&&tilesArt.naturalWidth)g.drawImage(tilesArt,(ti%12)*32,Math.floor(ti/12)*32,32,32,xx,yy,32,32);
  else rect(xx,yy,32,32,q===3?'#baa289':'#303342');
 }
 const outX=39*T-cam.x,outY=35*T-cam.y;
 rect(outX-26,outY-7,52,17,'#574638');rect(outX-19,outY-4,38,11,'#e0b884');
 write('EXIT',outX,outY+24,'#f3dfaf',13);
 let xx=P.x-cam.x,yy=P.y-cam.y;
 sprite(state.hero==='gojo_prime'?'gojo_final':(state.skin||state.hero),4+Math.floor(now*7)%6,xx-44,yy-88,88,92,face<0);
 write(interior.b.name,SW/2,45,'#ffdf9a',23);
 write('EXPLORE THE BUILDING · E NEAR EXIT',SW/2,SH-25,'#e6ceaa',14);
}
function mapDraw(){if(interior){drawInterior();return;}const stage=state.zone,cols=palette[stage];cam.x=clamp(P.x-SW/2,0,MAXX-SW);cam.y=clamp(P.y-SH/2,0,MAXY-SH);
 const x0=Math.floor(cam.x/T),y0=Math.floor(cam.y/T),x1=Math.min(MW,x0+34),y1=Math.min(MH,y0+20);
 rect(0,0,SW,SH,cols.earth);
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
  const q=tile(x,y),px=x*T-cam.x,py=y*T-cam.y,r=seed(x,y,stage);
  if((stage===0||stage===2)&&tilesArt.complete&&tilesArt.naturalWidth){
    if(stage===2){
      const ti=q===1?(r>.66?37:38):q===2?(r>.6?27:38):q===3?(r>.55?28:29):q===4?47:q===5?32:q===6?11:q===7?38:q===8?30:38;
      g.drawImage(tilesArt,(ti%12)*32,Math.floor(ti/12)*32,32,32,Math.round(px),Math.round(py),32,32);
      if(q===7){rect(px+2,py+8,28,6,'#ecece1');rect(px+2,py+23,28,5,'#e7ddd4');}
      if(q===2&&((x+y)%11===0))rect(px+15,py+16,2,2,'#c0af8e');
      continue;
    }
    let ti=q===1?(r>.7?2:r>.28?0:1):q===2?(r>.6?3:4):q===3?(r>.65?6:7):q===4?21:q===5?1:q===6?(Math.floor(now*1.8+x+y)%2?11:12):q===7?13:q===8?30:8;
    g.drawImage(tilesArt,(ti%12)*32,Math.floor(ti/12)*32,32,32,Math.round(px),Math.round(py),32,32);
    continue;
  }
  rect(px,py,T,T,q===4?cols.wall:q===5?stage===4?'#244c35':'#2f5850':q===6?'#34566c':q===8?'#292f35':q===3?'#ac9b91':q===2?cols.floor:cols.earth);
  if(q===2||q===3){if((x+y)%3===0)rect(px+2,py+2,2,2,'#eeeeee22');if(q===3&&x%4===0)rect(px+2,py+29,28,2,'#e9e3d130');}
  if(q===1&&r>.76)rect(px+6,py+20,3,2,'#b4cf9499');
  if(q===4){rect(px,py,32,3,cols.light);if((x+y)%3===0){rect(px+8,py+11,14,14,stage===2?'#db86bd':'#6c8fa0');rect(px+11,py+13,9,10,'#ffebb744');}}
  if(q===5){rect(px+12,py+17,7,12,'#3e342c');rect(px+4,py+4,25,22,stage===4?'#26553e':'#397349');rect(px+8,py,19,14,'#4d9360');rect(px+13,py+3,5,6,'#85bb75');}
  if(q===6){rect(px+5,py+13,24,10,'#588e9b');}
  if(q===7){rect(px+3,py+4,26,7,'#f8f5e4');rect(px+3,py+17,26,7,'#f8f5e4');}
  if(q===8){rect(px+2,py+8,27,4,'#aeb4b9');rect(px+2,py+23,27,3,'#aeb4b9');}
 }
 // Pixel facade signs only where buildings are visible.
 for(const b of world.buildings){let x=(b.x+b.w/2)*T-cam.x,y=b.y*T-cam.y;if(x<-(b.w*T)||x>SW+b.w*T||y<-b.h*T||y>SH)continue;
  if(stage===0&&b.art&&buildingArt[b.art]?.complete&&buildingArt[b.art].naturalWidth){g.drawImage(buildingArt[b.art],Math.round(b.x*T-cam.x),Math.round(y),b.w*T,b.h*T);}
  else if(stage===2&&cityArt[{ '109 BUILDING':'neon','NEON MALL':'kado','ARCADE':'arcade','HOTEL':'hotel','OFFICE':'office' }[b.name]]?.complete){let pic=cityArt[{ '109 BUILDING':'neon','NEON MALL':'kado','ARCADE':'arcade','HOTEL':'hotel','OFFICE':'office' }[b.name]];if(pic.naturalWidth)g.drawImage(pic,Math.round(b.x*T-cam.x),Math.round(y),b.w*T,b.h*T);}
  else if(b.name){rect(x-55,y+8,110,20,'#222437');write(b.name,x,y+23,stage===2?'#faafd9':'#d3d5dc',11);}
 }
 // Special-world accents and multiple roads, rather than a single linear strip.
 if(stage===2){for(const [tx,ty] of [[34,24],[12,11],[52,43],[70,27]]){const x=tx*T-cam.x,y=ty*T-cam.y;rect(x-9,y,26,74,'#27283b');rect(x-5,y+5,18,16,'#f0d989');rect(x-5,y+29,18,16,'#e45ea4');}}
 if(stage===0){for(const [x,y] of [[24,18],[55,33],[39,42]]){let px=x*T-cam.x,py=y*T-cam.y;rect(px,py,36,8,'#a78059');rect(px+3,py+8,5,18,'#49342c');rect(px+28,py+8,5,18,'#49342c');}}
 // Draw NPCs, enemies, boss markers, player. Painter's order is by feet position.
 let actors=[];
 if((stage===0||stage===2))for(const ob of world.decor){
   if(!decoArt[ob.type]?.complete||!decoArt[ob.type].naturalWidth)continue;
   if((ob.type==='chest'&&state.worldFinds.includes('forest-cache')&&ob.x===7)||
      (ob.type==='chest'&&state.worldFinds.includes('ancient-offering')&&ob.x===44)||
      (ob.type==='chest'&&state.worldFinds.includes('archive-cache')&&ob.x===74))continue;
   const sx=(ob.x+.5)*T-cam.x,sy=(ob.y+.7)*T-cam.y;
   if(sx< -60||sx>SW+60||sy< -100||sy>SH+70)continue;
   const size=(ob.type==='pine'||ob.type==='sakura')?70:ob.type==='torii'||ob.type==='shrinegate'?78:ob.type==='flowerbed'?38:ob.type==='bush'?43:ob.type==='lantern'?50:44;
   actors.push({y:(ob.y+.7)*T,draw:()=>g.drawImage(decoArt[ob.type],Math.round(sx-size/2),Math.round(sy-size*.83),size,size)});
 }
 const npc=NPCS[Z[stage].id];actors.push({y:(npc.y+.5)*T,draw:()=>{const x=(npc.x+.5)*T-cam.x,y=(npc.y+.5)*T-cam.y;g.fillStyle='#ffd87645';g.fillRect(x-20,y-6,40,9);sprite(npc.id,0,x-35,y-72,70,73);write('!',x,y-83,'#ffdd78',25);write(npc.label,x,y-94,'#ffe7b5',11);}});
 const [bx,by]=BOSS_POS[Z[stage].id];actors.push({y:by*T,draw:()=>{const x=(bx+.5)*T-cam.x,y=(by+.5)*T-cam.y;const unlocked=state.level>=Z[stage].bossLevel;g.strokeStyle=unlocked?'#f67893':'#a19c9c';g.lineWidth=4;g.strokeRect(x-46,y-33,92,66);g.fillStyle=unlocked?'#ed687944':'#8f98a244';g.fillRect(x-43,y-30,86,60);const boss=Z[stage].boss;sprite(boss==='mahoraga'?'mahoraga':boss==='geto'?'geto':boss,Math.floor(now*3)%3,x-(boss==='mahoraga'?58:37),y-(boss==='mahoraga'?112:72),boss==='mahoraga'?116:75,boss==='mahoraga'?119:76);write(unlocked?'⚔ BOSS: '+Z[stage].bossName:'🔒 LV '+Z[stage].bossLevel,x,y-127,'#ffafba',12);}});
 if(state.quest?.kind==='collect'&&!state.quest.done&&state.quest.stage===state.zone){
 const traces=TRACE_SPOTS[stage];for(let i=0;i<traces.length;i++){if(i>=state.quest.target||state.quest.traceIds?.includes(i))continue;const [tx,ty]=traces[i],x=(tx+.5)*T-cam.x,y=(ty+.5)*T-cam.y;g.globalAlpha=.8+.2*Math.sin(now*4+i);rect(x-7,y-18,14,23,'#995cdd');rect(x-3,y-13,6,12,'#fff0b2');write('✦',x,y-22,'#f8dd83',15);g.globalAlpha=1;}
 }
 for(const m of mobs){if(!m.alive)continue;actors.push({y:m.y,draw:()=>{let x=m.x-cam.x,y=m.y-cam.y;sprite(m.kind,Math.floor(now*5)%2,x-34,y-69,68,73,m.x>P.x);rect(x-29,y-80,58,5,'#371e32');rect(x-29,y-80,58*m.hp/m.max,5,'#f1768c');write(Z[stage].mobName,x,y-89,'#e9b2c1',10);}});}
 actors.push({y:P.y,draw:()=>{let x=P.x-cam.x,y=P.y-cam.y,sk=state.skin||state.hero;if(state.hero==='gojo_prime')sk='gojo_final';g.fillStyle='#090e1888';g.beginPath();g.ellipse(x,y,20,7,0,0,Math.PI*2);g.fill();sprite(sk,attackFlash>0?12:(controls.left||controls.right||controls.up||controls.down)?4+Math.floor(now*8)%6:Math.floor(now*2)%2,x-44,y-89,88,91,face<0);write(state.hero==='gojo_prime'?'★ PRIME GOJO ★':state.hero.toUpperCase(),x,y-100,state.hero==='gojo_prime'?'#ffe4a6':'#9aebf5',12);}});
 actors.sort((a,b)=>a.y-b.y);for(const a of actors)a.draw();
 for(const f of fx){if(f.z!==stage)continue;let x=f.x-cam.x,y=f.y-cam.y;g.globalAlpha=Math.max(0,1-f.life/.65);g.strokeStyle=f.color||'#ffdc86';g.lineWidth=5;g.beginPath();g.arc(x,y,8+f.life*58,0,Math.PI*2);g.stroke();g.globalAlpha=1;}
 const np={x:(npc.x+.5)*T,y:(npc.y+.5)*T},bp={x:(bx+.5)*T,y:(by+.5)*T};let t=hypot(P,np)<85?'E / TALK TO '+npc.id.toUpperCase():hypot(P,bp)<97?'E / CHALLENGE '+Z[stage].bossName:'';if(!t&&state.quest?.kind==='collect'&&!state.quest.done){for(let i=0;i<state.quest.target;i++){const pt=TRACE_SPOTS[stage][i];if(!pt||state.quest.traceIds?.includes(i))continue;if(hypot(P,{x:(pt[0]+.5)*T,y:(pt[1]+.5)*T})<80)t='E / COLLECT CURSED TRACE';}}if(stage===0){
  for(const sec of SCHOOL_SECRET)if(!state.worldFinds.includes(sec.id)&&Math.hypot(P.x-(sec.x+.5)*T,P.y-(sec.y+.5)*T)<67)t='E / DISCOVER '+sec.label;
  for(const b of world.buildings)if(b.door&&Math.hypot(P.x-(b.door[0]+.5)*T,P.y-(b.door[1]+.5)*T)<72)t='E / ENTER '+b.name;
 }
 if(t)write(t,SW/2,SH-22,'#ffe9b4',18);
 // Show camera section, area level, guide arrow.
 // Location is already shown in the compact top HUD; don't cover the game world with duplicate lettering.
 // Compact pixel minimap shows the winding roads, safe NPC, boss, and the player's position.
 const mx=SW-192,my=54,ms=2;rect(mx-6,my-22,172,137,'#090f24dd');write('DISTRICT MAP',mx+80,my-8,'#bedaf0',12);
 for(let yy=0;yy<MH;yy++)for(let xx=0;xx<MW;xx++){
  const tt=world.tiles[idx(xx,yy)];rect(mx+xx*ms,my+yy*ms,2,2,tt===4?'#293048':tt===5?'#276a47':tt===6?'#205879':tt===3?'#b29c91':tt===2?'#7588a0':tt===8?'#171d32':'#4c6857');
 }
 rect(mx+npc.x*ms-2,my+npc.y*ms-2,5,5,'#ffdf81');rect(mx+bx*ms-2,my+by*ms-2,5,5,'#ff7188');
 if(state.quest?.kind==='collect'&&!state.quest.done)for(let i=0;i<state.quest.target;i++){if(state.quest.traceIds?.includes(i))continue;const pt=TRACE_SPOTS[stage][i];if(pt)rect(mx+pt[0]*ms,my+pt[1]*ms,3,3,'#e0aaff');}
 if(stage===0)for(const sc of SCHOOL_SECRET)if(state.worldFinds.includes(sc.id))rect(mx+sc.x*ms-1,my+sc.y*ms-1,4,4,'#ffe4a5');
 rect(mx+Math.floor(P.x/T)*ms-2,my+Math.floor(P.y/T)*ms-2,6,6,'#a7f8ff');
 let target=np;const quest=state.quest;
 if(quest&&!quest.done&&quest.stage===state.zone){
  if(quest.boss)target=bp;
  else if(quest.kind==='collect'){
   const options=TRACE_SPOTS[stage].slice(0,quest.target).map((pt,i)=>({pt,i})).filter(o=>!quest.traceIds?.includes(o.i));
   if(options.length){options.sort((a,b)=>hypot(P,{x:a.pt[0]*T,y:a.pt[1]*T})-hypot(P,{x:b.pt[0]*T,y:b.pt[1]*T}));target={x:(options[0].pt[0]+.5)*T,y:(options[0].pt[1]+.5)*T};}
  }else{
   const enemies=mobs.filter(m=>m.alive);
   enemies.sort((a,b)=>hypot(P,a)-hypot(P,b));if(enemies.length)target=enemies[0];
  }
 }
 let dx=target.x-P.x,dy=target.y-P.y;if(Math.hypot(dx,dy)>210){let a=Math.atan2(dy,dx);write('◆',clamp(SW/2+Math.cos(a)*360,44,SW-45),clamp(SH/2+Math.sin(a)*170,48,SH-70),'#ffd26f',27);}
}
function getQuest(){if(state.quest&&state.quest.stage!==state.zone){notice('RETURN TO '+Z[state.quest.stage].name+' FOR YOUR QUEST');return;}
 if(state.quest){if(state.quest.done){const q=state.quest;const lv=C.earn(state,q.xp,q.coins);if(q.boss){if(!state.cleared.includes(Z[q.stage].boss))state.cleared.push(Z[q.stage].boss);if(q.stage===6){state.sukunaDown=true;notice('YOU DEFEATED SUKUNA! ENDGAME CLEARED',5);}else notice('BOSS CLEARED! NEXT REGION UNLOCKED',4);}else notice('CONTRACT COMPLETE +'+q.xp+' XP +'+q.coins+' COINS'+(lv?' • LV +'+lv:''),3);state.quest=null;P.hp=Math.min(maxHP(),P.hp+maxHP()*.25);save();hud();return;}notice('FINISH THE CONTRACT BEFORE CLAIMING REWARDS');return;}
 const stage=state.zone,z=Z[stage],cycle=state.cycles[stage];let bounty=state.level>=z.bossLevel&&!state.cleared.includes(z.boss);
 const q=bounty?C.bossFor(stage):C.questFor(stage,cycle);state.quest={...q,boss:bounty,kills:0,traceIds:[],done:false};state.cycles[stage]++;save();hud();notice(bounty?'BOSS CONTRACT: '+z.bossName:'NEW CONTRACT: '+q.name,3);
}
function interact(){if(mode==='arena'){dodge();return;}
 if(interior){if(Math.hypot(P.x-39*T,P.y-35*T)<105)exitInterior();else notice('GO TO THE EXIT AT THE SOUTH END');return;}
 if(state.zone===0){
  for(const sec of SCHOOL_SECRET){if(state.worldFinds.includes(sec.id))continue;
    if(Math.hypot(P.x-(sec.x+.5)*T,P.y-(sec.y+.5)*T)<77){state.worldFinds.push(sec.id);state.coins+=sec.coins;save();hud();notice('SECRET FOUND! '+sec.label+' +'+sec.coins+' COINS',3.5);return;}
  }
  for(const b of world.buildings)if(b.door&&Math.hypot(P.x-(b.door[0]+.5)*T,P.y-(b.door[1]+.5)*T)<77){enterInterior(b);return;}
 }
 const z=Z[state.zone],npc=NPCS[z.id],point={x:(npc.x+.5)*T,y:(npc.y+.5)*T},[bx,by]=BOSS_POS[z.id],bp={x:(bx+.5)*T,y:(by+.5)*T};
 if(hypot(P,point)<95){if(state.quest?.done)getQuest();else panel('npc');return;}
 if(state.quest?.kind==='collect'&&!state.quest.done&&state.quest.stage===state.zone){
  const traces=TRACE_SPOTS[state.zone];for(let i=0;i<Math.min(traces.length,state.quest.target);i++){
   if(state.quest.traceIds?.includes(i))continue;const [tx,ty]=traces[i],pos={x:(tx+.5)*T,y:(ty+.5)*T};if(hypot(P,pos)<77){state.quest.traceIds.push(i);state.quest.kills++;fx.push({x:pos.x,y:pos.y,life:0,z:state.zone,color:'#f5da91'});if(state.quest.kills>=state.quest.target){state.quest.done=true;notice('ALL TRACES COLLECTED! RETURN TO THE NPC',3);}else notice('CURSED TRACE '+state.quest.kills+' / '+state.quest.target);save();hud();return;}}}
 
 if(hypot(P,bp)<105){if(state.level<z.bossLevel){notice('BOSS REQUIRES LEVEL '+z.bossLevel);return;}if(!state.quest?.boss||state.quest.stage!==state.zone){notice('TAKE A BOSS CONTRACT FROM YOUR QUEST GIVER');return;}startBoss();return;}
 notice('GET CLOSE TO THE GOLD ! QUEST GIVER OR RED BOSS MARKER');
}
function kill(m){m.alive=false;m.respawn=now+8;const stage=state.zone;const rewardXP=Math.round(22*Math.pow(1.51,stage)),rewardCoin=Math.round(13*Math.pow(1.45,stage));let lv=C.earn(state,rewardXP,rewardCoin);if(state.quest&&!state.quest.boss&&state.quest.stage===stage&&!state.quest.done){state.quest.kills++;if(state.quest.kills>=state.quest.target){state.quest.done=true;notice('CONTRACT DONE! RETURN TO THE QUEST GIVER',3);}}if(lv){P.hp=Math.min(maxHP(),P.hp+maxHP()*.25);notice('LEVEL '+state.level+'! +3 STAT POINTS',3);}fx.push({x:m.x,y:m.y,life:0,z:stage,color:'#fbb1c8'});save();hud();}
function punch(skill=0){if(modal)return;if(mode==='arena'){battleAttack(skill);return;}if(cooldown>0)return;
 if(skill>0){if(spellCD>0)return;if(P.ce<12+skill*8){notice('NOT ENOUGH CURSED ENERGY');return;}P.ce-=12+skill*8;spellCD=.35+skill*.14;}
 cooldown=skill?.32:.23;attackFlash=.19;
 const range=skill?105+skill*22:84,damage=power()*(skill?1.22+skill*.44:1);
 let target=null,closest=Infinity;for(const m of mobs){if(!m.alive)continue;const d=hypot(P,m);if(d<range&&d<closest){target=m;closest=d;}}
 if(target){target.hp=Math.max(0,target.hp-damage);target.stun=.18+skill*.07;target.aggro=2.1;fx.push({x:target.x,y:target.y,life:0,z:state.zone,color:skill?'#ad9af5':'#ffddbb'});if(target.hp<=0)kill(target);}else if(skill)notice('TECHNIQUE MISSED',.9);
}
function heal(){if(mode==='arena'){if(battle&&state.heals>0&&!battle.healLock){state.heals--;battle.playerHP=Math.min(battle.playerMax,battle.playerHP+battle.playerMax*.38);battle.healLock=12;save();notice('HEALED 38% HP',1.3);}else notice('NO POTIONS OR HEAL IS ON COOLDOWN',1.3);return;}
 if(state.heals>0&&P.hp<maxHP()){state.heals--;P.hp=Math.min(maxHP(),P.hp+maxHP()*.48);save();notice('USED CURSED MEDICINE',1.3);hud();}else notice('NO POTIONS OR HP IS FULL',1.1);
}
function dodge(){if(mode==='arena'){if(battle&&battle.dodge<=0&&battle.energy>=16){battle.energy-=16;battle.dodge=.48;battle.px=clamp(battle.px+(battle.ex>battle.px?-125:125),48,976);notice('DODGED!',.6);}return;}
 if(P.ce<13)return;P.ce-=13;globalInvul=.38;let vx=(controls.right?1:0)-(controls.left?1:0),vy=(controls.down?1:0)-(controls.up?1:0);if(!vx&&!vy)vx=face;for(let i=0;i<6;i++){let next=stepTowards(P.x,P.y,vx*13,vy*13);P.x=next.x;P.y=next.y;}}
const BOSS_MOVESET={
 finger:[['SWIPE',14,175,.65],['ROAR SMASH',22,220,.85]],
 geto:[['CURSE SWARM',23,340,.86],['SPIRIT GRASP',19,185,.62],['MAXIMUM UZUMAKI',38,415,1.4]],
 mahito:[['SOUL TOUCH',25,150,.52],['SHAPE SHIFT',32,250,.81],['DOMAIN SURGE',38,390,1.3]],
 jogo:[['LAVA BURST',26,240,.67],['VOLCANIC BLAST',40,420,1.2],['EMBER DASH',19,155,.45]],
 hanami:[['ROOT SPEARS',26,280,.77],['WOODEN PRISON',34,370,1.1],['CURSED BUDS',20,175,.48]],
 mahoraga:[['SWORD OF EXTERMINATION',29,205,.72],['ADAPTATION WHEEL',0,0,.94],['GROUND SLAM',38,285,1.15],['BACKHAND',24,150,.49],['ADAPTIVE RUSH',32,350,.69],['FLYING SLASH',44,520,1.35]],
 heian:[['CLEAVE',37,180,.56],['DISMANTLE',43,400,.76],['MALEVOLENT SHRINE',56,880,1.5],['WORLD CUTTING SLASH',66,900,1.65]]
};
const bossSprite={finger:'finger',geto:'geto',mahito:'mahito',jogo:'jogo',hanami:'hanami',mahoraga:'mahoraga',heian:'heian'};
function startBoss(){const stage=state.zone,id=Z[stage].boss,bosslvl=Z[stage].bossLevel,hp=Math.round(400+bosslvl*31+stage*100+(id==='mahoraga'?880:0)+(id==='heian'?1550:0));
 mode='arena';$('questHud').hidden=true;$('hint').hidden=true;battle={id,level:bosslvl,px:245,ex:755,playerHP:maxHP(),playerMax:maxHP(),energy:100,hp,max:hp,timer:1.5,warn:0,warning:null,stun:0,guard:false,guardAt:0,dodge:0,healLock:0,damageCD:0,abilityCD:0,attackIndex:0,phase:1,adapt:0,adaptUntil:0,movePose:0,poseUntil:0,face:1};$('bossHud').hidden=false;hud();notice('BOSS CHALLENGE! PARRY, DODGE AND TIME YOUR SKILLS!',3);}
function battleAttack(skill){if(!battle||battle.damageCD>0)return;const b=battle;if(skill){if(b.abilityCD>0||b.energy<12+skill*9)return;b.energy-=12+skill*9;b.abilityCD=.28+skill*.17;}
 b.damageCD=skill?.32:.19;attackFlash=.2;const range=skill?315:112,distance=Math.abs(b.ex-b.px);if(distance>range){if(skill)notice('OUT OF RANGE',.7);return;}
 let dmg=power()*(skill?1.25+skill*.58:1);if(b.id==='mahoraga'&&now<b.adaptUntil)dmg*=.42;let crit=skill===4&&Math.random()<.27;if(crit)dmg*=1.65;
 b.hp=Math.max(0,b.hp-dmg);b.stun=skill>=3?.24:.10;fx.push({x:b.ex,y:350,life:0,z:-1,color:skill?'#a487ff':'#ffb5a3'});if(b.hp<=0)bossWin();}
function bossWin(){const b=battle;state.wins++;if(state.quest?.boss&&state.quest.stage===state.zone)state.quest.done=true;const reward=Math.round(65*Math.pow(1.5,state.zone)),gold=Math.round(130*Math.pow(1.5,state.zone));const lv=C.earn(state,reward,gold);mode='world';battle=null;$('bossHud').hidden=true;$('questHud').hidden=false;$('hint').hidden=false;P.hp=Math.max(35,maxHP()*.65);notice('BOSS DEFEATED! RETURN TO NPC · +'+reward+' XP'+(lv?' · LEVEL UP!':''),4);save();hud();}
function bossLose(){state.defeats++;mode='world';battle=null;$('bossHud').hidden=true;$('questHud').hidden=false;$('hint').hidden=false;P.hp=maxHP();const n=NPCS[Z[state.zone].id];P.x=(n.x+3)*T;P.y=(n.y+3)*T;notice('DEFEATED! TRAIN, UPGRADE STATS, AND RETRY',3.2);save();hud();}
function tickBoss(dt){const b=battle;if(!b)return;b.damageCD=Math.max(0,b.damageCD-dt);b.abilityCD=Math.max(0,b.abilityCD-dt);b.healLock=Math.max(0,b.healLock-dt);b.stun=Math.max(0,b.stun-dt);b.dodge=Math.max(0,b.dodge-dt);b.energy=clamp(b.energy+dt*(7+state.energy*.1),0,100);
 b.px=clamp(b.px+((controls.right?1:0)-(controls.left?1:0))*dt*(225+state.level*.35),45,979);b.face=b.ex>b.px?1:-1;
 if(b.stun<=0){let gap=b.px-b.ex;if(Math.abs(gap)>128)b.ex+=Math.sign(gap)*dt*(82+state.zone*22);else if(Math.abs(gap)<70)b.ex-=Math.sign(gap)*dt*52;}b.ex=clamp(b.ex,80,950);
 if(controls.guard&&!b.guard){b.guard=true;b.guardAt=now;}if(!controls.guard)b.guard=false;
 if(b.hp<b.max*.59&&b.phase===1){b.phase=2;b.timer=.8;notice('PHASE TWO! BOSS ATTACKS FASTER',2.3);}
 if(b.id==='heian'&&b.hp<b.max*.25&&b.phase===2){b.phase=3;b.timer=.45;notice('FINAL PHASE! WORLD CUTTING SLASH',2.3);}
 if(b.warn>0){b.warn-=dt;if(b.warn<=0){const m=b.warning,reach=Math.abs(b.px-b.ex);if(m&&m[0]==='ADAPTATION WHEEL'){b.adapt=Math.min(3,b.adapt+1);b.adaptUntil=now+6;b.hp=Math.min(b.max,b.hp+b.max*.025);notice('MAHORAGA ADAPTED! DAMAGE REDUCED',1.4);}
 else if(m){if(m[0]==='ADAPTIVE RUSH')b.ex=clamp(b.ex+(b.px>b.ex?185:-185),55,950);if(b.dodge<=0&&reach<m[2]){const raw=m[1]+state.zone*2;if(b.guard){if(now-b.guardAt<.38){b.stun=1.2;b.hp=Math.max(0,b.hp-power()*3.2);notice('PERFECT PARRY! COUNTER!',.8);if(b.hp<=0){bossWin();return;}}
 else{b.playerHP-=Math.max(1,Math.round(raw*.13-state.def*.45));notice('BLOCKED!',.6);}}
 else{b.playerHP-=Math.max(2,Math.round(raw-state.def*.33));notice('HIT BY '+m[0],1.3);}}
 if(b.playerHP<=0){bossLose();return;}}
 b.warning=null;}}
 if(b.warn<=0&&b.stun<=0){b.timer-=dt;if(b.timer<=0){const moves=BOSS_MOVESET[b.id],m=moves[b.attackIndex++%moves.length];b.warning=m;b.warn=m[3]*(b.phase===2?.87:b.phase===3?.74:1);b.timer=b.warn+(b.phase===1?1.7:1.15);b.movePose=b.id==='mahoraga'?Math.min(8,3+(b.attackIndex-1)%6):12+(b.attackIndex%4);b.poseUntil=now+1.15;notice(b.id.toUpperCase()+': '+m[0],Math.max(.6,b.warn));}}
 $('bossHp').style.width=b.hp/b.max*100+'%';$('bossPhase').textContent='HP '+Math.ceil(b.hp)+' / '+b.max+' · PHASE '+b.phase+(b.id==='mahoraga'?' · ADAPT '+b.adapt:'/2');
}
function drawArena(){const b=battle;if(!b)return;const z=state.zone;
 rect(0,0,SW,SH,z>=5?'#302031':'#21304a');for(let i=0;i<24;i++){let x=i*58,h=150+Math.floor(seed(i,13,z)*180);rect(x,410-h,57,h,z===3?'#344258':'#303751');for(let j=0;j<h/26;j++)rect(x+8,422-h+j*24,9,12,j%3===0?'#d5a0b466':'#8199b366');}
 rect(0,420,SW,156,'#4c5365');for(let i=0;i<SW;i+=44){rect(i,422,40,3,'#bfc6d244');rect(i,475,40,2,'#18233899');}
 let playerSkin=state.hero==='gojo_prime'?'gojo_final':state.skin||state.hero;
 sprite(playerSkin,attackFlash>0?12:controls.left||controls.right?5+Math.floor(now*7)%5:0,b.px-82,276,164,150,b.face<0);
 const boss=bossSprite[b.id],scale=b.id==='mahoraga'?1.9:b.id==='heian'?1.4:1.18,bw=160*scale,bh=147*scale,fr=b.id==='mahoraga'?((b.warn>0||now<b.poseUntil)?b.movePose:Math.floor(now*2)%3):(b.warn>0?14:0);
 sprite(boss,fr,b.ex-bw/2,422-bh,bw,bh,b.ex>b.px);
 if(b.warn>0&&b.warning){rect(Math.max(0,b.ex-b.warning[2]),395,Math.min(SW,b.warning[2]*2),25,'#df455080');write(b.warning[0],SW/2,104,'#ffe9b7',24);write('BLOCK JUST BEFORE IMPACT · DODGE TO ESCAPE',SW/2,131,'#f7d7ce',14);}
 if(b.id==='mahoraga'){g.strokeStyle=now<b.adaptUntil?'#ffe88e':'#aa87ff';g.lineWidth=5;g.beginPath();g.arc(b.ex,165,64,now*1.2,now*1.2+5.5);g.stroke();}
 for(const f of fx){if(f.z!==-1)continue;g.globalAlpha=1-f.life/.65;g.strokeStyle=f.color;g.lineWidth=7;g.beginPath();g.arc(f.x,350,35+f.life*95,0,Math.PI*2);g.stroke();g.globalAlpha=1;}
 if(b.guard){g.strokeStyle=now-b.guardAt<.38?'#ffeaa0':'#a4d5fa';g.lineWidth=7;g.beginPath();g.arc(b.px,340,73,-.9,1.9);g.stroke();}
 write(state.hero==='gojo_prime'?'PRIME GOJO':state.hero.toUpperCase(),b.px,264,'#a5e8ff',15);write(Z[state.zone].bossName,b.ex,Math.max(180,406-bh),'#ffabb5',16);
 rect(30,25,295,20,'#281d2e');rect(30,25,295*Math.max(0,b.playerHP/b.playerMax),20,'#58dfa7');write('YOUR HP: '+Math.ceil(b.playerHP)+' / '+b.playerMax,177,40,'#fff',14);rect(30,50,200,9,'#192638');rect(30,50,200*b.energy/100,9,'#83d2ef');write('CE '+Math.ceil(b.energy)+'%  ·  POTIONS '+state.heals,238,60,'#c9eaf6',11,'left');
 write('J ATTACK · 1-4 SKILLS · F BLOCK/PARRY · SPACE DODGE · H HEAL',SW/2,555,'#e5e7f4',13);
}
function goNearNpc(){const n=NPCS[Z[state.zone].id];P.x=(n.x+3)*T;P.y=(n.y+3)*T;}
function panel(type){modal=true;clearInputs();$('sheet').hidden=false;$('panelTitle').textContent=({npc:'QUEST GIVER',map:'TRAVEL THE WORLD',journal:'QUEST LOG',shop:'SORCERER SHOP & SKINS',stats:'TRAINING & STATS'})[type];const body=$('panelBody');let html='';
 if(type==='npc'){
  const stage=state.zone,npc=NPCS[Z[stage].id],q=state.quest,offer=state.level>=Z[stage].bossLevel&&!state.cleared.includes(Z[stage].boss)?C.bossFor(stage):C.questFor(stage,state.cycles[stage]);
  html=`<div class="card"><strong>${npc.id.toUpperCase()} · QUEST GIVER</strong><p>${NPC_LINES[stage]}</p><small>${q?'ACTIVE CONTRACT':'NEW CONTRACT AVAILABLE'}</small><h3>${q?q.name:offer.name}</h3><p>${q?(q.boss?'Defeat the boss':q.kind==='collect'?'Find cursed traces':'Defeat roaming curses'):'REWARD: +'+offer.xp+' XP · +'+offer.coins+' COINS'}</p><small>${q?(q.done?'Return here to collect your rewards!':q.kills+' / '+q.target+' completed'):''}</small><button data-accept>${q?'CLOSE QUEST INFO':'ACCEPT CONTRACT'}</button></div>`;
 }else if(type==='map'){html=`<section id="mapSheet"><div class="cartography-toolbar"><b>REGION ATLAS · ${Z[state.zone].name}</b><span><button data-zoom="out">−</button> <button data-zoom="in">+</button></span></div><div id="mapCanvasWrap"><canvas id="mapCanvas" width="960" height="672" aria-label="Real world map of the current region"></canvas></div><div class="mapLegend">✦ CYAN: YOUR POSITION · GOLD: QUEST NPC · RED: BOSS · SECRET CACHE: ONLY AFTER DISCOVERY</div><small id="rpgFogNotice">Undiscovered areas are shaded. Explore paths to reveal them.</small></section><p>Travel gates require a minimum level and the previous boss trophy. Your quest progress is preserved.</p><div class="cardgrid">`+Z.map((z,i)=>{const able=C.canVisit(state,i);return `<div class="card ${able?'':'locked'}"><b>${STAGE_NAMES[i]}</b><strong>${z.name}</strong><small>LV ${z.min}+ • BOSS LV ${z.bossLevel}: ${z.bossName}</small><span class="pill ${state.cleared.includes(z.boss)?'gold':''}">${state.cleared.includes(z.boss)?'★ BOSS DEFEATED':able?'OPEN AREA':'🔒 LOCKED'}</span><button data-zone="${i}" ${able?'':'disabled'}>${state.zone===i?'YOU ARE HERE':'TRAVEL HERE'}</button></div>`;}).join('')+'</div>';
 }else if(type==='journal'){
  html='<p>Repeat quest contracts to level up and earn coins. At the region boss level, take a boss contract and claim the trophy to unlock the next region.</p><div class="card"><strong>ACTIVE QUEST</strong><p>'+(state.quest?(state.quest.boss?'BOSS: ':'' )+state.quest.name:'No contract. Talk to the glowing quest NPC in this zone.')+'</p><small>'+(state.quest?state.quest.done?'READY TO TURN IN':(state.quest.boss?'Defeat '+Z[state.quest.stage].bossName:state.quest.kills+' / '+state.quest.target+' exorcisms'):'Press E by the NPC')+'</small></div><div class="cardgrid">'+Z.map((z,i)=>`<div class="card"><strong>${z.name}</strong><small>Grinding: ${z.mobName}</small><small>Boss: ${z.bossName} • Level ${z.bossLevel}</small><span class="pill">${state.cleared.includes(z.boss)?'BOSS TROPHY EARNED':'NOT YET CLEARED'}</span></div>`).join('')+'</div>';
 }else if(type==='stats'){
  html='<p>Each level gives 3 stat points. Higher Strength increases your damage; Defense improves survival; Energy strengthens cursed-energy recovery.</p><strong>UNSPENT POINTS: '+state.points+'</strong>'+[['str','STRENGTH','Increases attack damage'],['def','DEFENSE','Improves max HP and damage resistance'],['energy','CURSED ENERGY','Faster energy regeneration']].map(([k,l,d])=>`<div class="statline"><div><strong>${l} · ${state[k]}</strong><br><small>${d}</small></div><button data-stat="${k}" ${state.points?'':'disabled'}>+1</button></div>`).join('')+'<button data-buyheal>BUY 1 HEAL POTION · 130 COINS (H)</button><span>Potions held: '+state.heals+'</span>';
 }else if(type==='shop'){
  html='<p>Earn coins from quests and bosses. Unlock characters and skins with the required level and coins. Curse bosses are enemies, not playable fighters.</p><h3>PLAYABLE SORCERERS</h3><div class="cardgrid">'+C.HEROES.map(h=>{const owned=state.owned.includes(h.id);return `<div class="card"><img src="${portraitURL(h.id==='gojo_prime'?'gojo_final':h.id)}" alt="${h.name}"><strong>${h.name}</strong><small>REQUIRES LV ${h.min} · ${h.cost? h.cost+' COINS':'MAX LEVEL REWARD'}</small><button data-hero="${h.id}">${owned?(state.hero===h.id?'EQUIPPED':'EQUIP'):h.final?'UNLOCK AT LV 100':'BUY & UNLOCK'}</button></div>`;}).join('')+'</div><h3>SKIN WARDROBE</h3><div class="cardgrid">'+C.SKINS.map(s=>`<div class="card"><img src="${portraitURL(s.id)}" alt="${s.name}"><strong>${s.name}</strong><small>LV ${s.min} · ${s.cost} COINS</small><button data-skin="${s.id}">${state.skins.includes(s.id)?'EQUIP':'BUY SKIN'}</button></div>`).join('')+'</div>';
 }
 body.innerHTML=html;
 if(type==='map')initAtlasPanel();
 const accept=body.querySelector('[data-accept]');if(accept)accept.onclick=()=>{closePanel();if(!state.quest)getQuest();};
 body.querySelectorAll('[data-zone]').forEach(btn=>btn.onclick=()=>{if(changeZone(Number(btn.dataset.zone)))closePanel();});
 body.querySelectorAll('[data-stat]').forEach(btn=>btn.onclick=()=>{if(state.points){state.points--;state[btn.dataset.stat]++;P.hp=Math.min(P.hp,maxHP());save();hud();panel('stats');}});
 body.querySelectorAll('[data-hero]').forEach(btn=>btn.onclick=()=>{let id=btn.dataset.hero;if(state.owned.includes(id)){state.hero=id;state.skin='';save();hud();panel('shop');return;}const result=C.buyHero(state,id);if(result==='OK'){state.hero=id;state.skin='';save();hud();panel('shop');notice(id==='gojo_prime'?'PRIME GOJO AWAKENED!':'NEW SORCERER UNLOCKED',2);}else notice(result==='LEVEL'?'NEED A HIGHER LEVEL':result==='COINS'?'NOT ENOUGH COINS':result,2);});
 body.querySelectorAll('[data-skin]').forEach(btn=>btn.onclick=()=>{const id=btn.dataset.skin,k=C.SKINS.find(s=>s.id===id);if(state.skins.includes(id)){state.hero=k.hero;state.skin=id;save();hud();panel('shop');return;}const result=C.buySkin(state,id);if(result==='OK'){state.hero=k.hero;state.skin=id;save();hud();panel('shop');notice('SKIN UNLOCKED!',2);}else notice({LEVEL:'NEED A HIGHER LEVEL',COINS:'NEED MORE COINS',HERO:'UNLOCK THE FIGHTER FIRST'}[result]||result,2);});
 const bh=body.querySelector('[data-buyheal]');if(bh)bh.onclick=()=>{if(state.coins<130)notice('NOT ENOUGH COINS');else{state.coins-=130;state.heals++;save();hud();panel('stats');notice('POTION BOUGHT!');}};
}
function drawAtlas(){
 const canvas=$('mapCanvas');if(!canvas)return;
 const ctx=canvas.getContext('2d');const size=12;canvas.width=MW*size;canvas.height=MH*size;
 ctx.imageSmoothingEnabled=false;ctx.fillStyle='#243343';ctx.fillRect(0,0,canvas.width,canvas.height);
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
  const tile=world.tiles[idx(x,y)],r=seed(x,y,state.zone);
  const ti=state.zone===0?(tile===1?(r>.65?0:2):tile===2?3:tile===3?6:tile===4?14:tile===5?1:tile===6?11:tile===7?13:30):
   (tile===1?37:tile===2?27:tile===3?28:tile===4?47:tile===5?32:tile===6?11:tile===7?6:30);
  if(tilesArt.complete&&tilesArt.naturalWidth)ctx.drawImage(tilesArt,(ti%12)*T,Math.floor(ti/12)*T,T,T,x*size,y*size,size,size);
  else{ctx.fillStyle=tile===2?'#adac97':tile===4?'#30384f':tile===3?'#c6ad8a':'#40684c';ctx.fillRect(x*size,y*size,size,size);}
  const cx=Math.floor(x/8),cy=Math.floor(y/8);
  if(!state.worldSeen.includes(state.zone+':'+cx+':'+cy)){
   ctx.fillStyle='#141923b7';ctx.fillRect(x*size,y*size,size,size);
  }
 }
 const n=NPCS[Z[state.zone].id],[bx,by]=BOSS_POS[Z[state.zone].id];
 for(const [x,y,col] of [[n.x,n.y,'#ffdb8c'],[bx,by,'#ee8093'],[Math.floor(P.x/T),Math.floor(P.y/T),'#93f2ff']]){ctx.fillStyle='#101624';ctx.fillRect(x*size-3,y*size-3,18,18);ctx.fillStyle=col;ctx.fillRect(x*size,y*size,12,12);}
 for(const sc of state.zone===0?SCHOOL_SECRET:[])if(state.worldFinds.includes(sc.id)){
  ctx.fillStyle='#f9d589';ctx.fillRect(sc.x*size+2,sc.y*size+2,8,8);
 }
}
let atlasZoom=1;
function initAtlasPanel(){
 const wrap=$('mapCanvasWrap'),can=$('mapCanvas');atlasZoom=1;drawAtlas();
 if(!can||!wrap)return;
 const zoom=()=>{can.style.width=Math.round(720*atlasZoom)+'px';can.style.height=Math.round(504*atlasZoom)+'px';};zoom();
 document.querySelectorAll('[data-zoom]').forEach(btn=>btn.onclick=()=>{atlasZoom=clamp(atlasZoom*(btn.dataset.zoom==='in'?1.4:.714),.65,3.1);zoom();});
 if(!tilesArt.complete)tilesArt.addEventListener('load',drawAtlas,{once:true});
}
function closePanel(){modal=false;$('sheet').hidden=true;cv.focus({preventScroll:true});}
function clearInputs(){Object.keys(controls).forEach(k=>controls[k]=false);if(battle)battle.guard=false;}
function updateWorld(dt){const dx=(controls.right?1:0)-(controls.left?1:0),dy=(controls.down?1:0)-(controls.up?1:0),d=Math.hypot(dx,dy)||1;let speed=194+Math.min(32,state.level*.25),p=stepTowards(P.x,P.y,dx/d*speed*dt,dy/d*speed*dt);P.x=p.x;P.y=p.y;if(dx)face=dx>0?1:-1;
 if(interior)return;
 const fogKey=state.zone+':'+Math.floor(P.x/T/8)+':'+Math.floor(P.y/T/8);
 if(!state.worldSeen.includes(fogKey))state.worldSeen.push(fogKey);
 if(globalInvul>0)globalInvul-=dt;P.ce=clamp(P.ce+dt*(7+state.energy*.18),0,100);
 for(const m of mobs){if(!m.alive){if(now>m.respawn){m.alive=true;m.hp=m.max;m.x=m.homeX;m.y=m.homeY;}continue;}m.stun=Math.max(0,m.stun-dt);m.attack=Math.max(0,m.attack-dt);let gap=Math.hypot(m.x-P.x,m.y-P.y);if(gap<185&&m.stun<=0){let a=Math.atan2(P.y-m.y,P.x-m.x),spd=(65+state.zone*9)*dt;if(gap>54){let next=stepTowards(m.x,m.y,Math.cos(a)*spd,Math.sin(a)*spd);m.x=next.x;m.y=next.y;}if(gap<72&&m.attack<=0){m.attack=1.6;if(!controls.guard&&globalInvul<=0){P.hp-=Math.max(2,(7+state.zone*3.2)-state.def*.48);fx.push({x:P.x,y:P.y,z:state.zone,life:0,color:'#e97889'});}else if(controls.guard){P.hp-=1;}if(P.hp<=0){goNearNpc();P.hp=maxHP();notice('KNOCKED OUT! RETURNED TO QUEST GIVER',2.2);}}}}
 if(now>coinTimer){coinTimer=now+6;save();}hud();
}
function frameLoop(t){const dt=Math.min(.05,(t-last)/1000||.016);last=t;now+=dt;frame++;cooldown=Math.max(0,cooldown-dt);spellCD=Math.max(0,spellCD-dt);attackFlash=Math.max(0,attackFlash-dt);for(const f of fx)f.life+=dt;fx=fx.filter(f=>f.life<.65);
 if(toastTimer&&now>toastTimer){$('notice').classList.remove('show');toastTimer=0;}
 if(started&&!modal){if(mode==='world')updateWorld(dt);else tickBoss(dt);}
 if(started){if(mode==='world')mapDraw();else drawArena();}
 else{rect(0,0,SW,SH,'#0b1323');}
 requestAnimationFrame(frameLoop);
}
const keys={a:'left',arrowleft:'left',d:'right',arrowright:'right',w:'up',arrowup:'up',s:'down',arrowdown:'down',f:'guard'};
window.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;let k=e.key.toLowerCase();if(keys[k]){controls[keys[k]]=true;if(mode==='arena'&&keys[k]==='guard'&&battle&&!battle.guard){battle.guard=true;battle.guardAt=now;}e.preventDefault();}if(e.repeat||!started)return;if(k==='escape'){if(modal)closePanel();return;}if(modal)return;if(k==='e'){interact();e.preventDefault();}else if(k==='j'){punch();e.preventDefault();}else if(['1','2','3','4'].includes(k)){punch(Number(k));e.preventDefault();}else if(k===' '){dodge();e.preventDefault();}else if(k==='h'){heal();}else if(k==='m')panel('map');else if(k==='q')panel('journal');else if(k==='r')panel('shop');});
window.addEventListener('keyup',e=>{let k=e.key.toLowerCase();if(keys[k]){controls[keys[k]]=false;if(k==='f'&&battle)battle.guard=false;}});
window.addEventListener('blur',clearInputs);
$('view').addEventListener('contextmenu',e=>e.preventDefault());$('view').addEventListener('selectstart',e=>e.preventDefault());$('view').addEventListener('dragstart',e=>e.preventDefault());$('view').addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
$('controls').addEventListener('touchmove',e=>e.preventDefault(),{passive:false});$('controls').addEventListener('contextmenu',e=>e.preventDefault());$('controls').addEventListener('selectstart',e=>e.preventDefault());
for(const btn of $('controls').querySelectorAll('button')){
 btn.addEventListener('pointerdown',e=>{e.preventDefault();btn.classList.add('held');try{btn.setPointerCapture(e.pointerId);}catch{}let hold=btn.dataset.hold;if(hold){controls[hold]=true;if(hold==='guard'&&battle&&!battle.guard){battle.guard=true;battle.guardAt=now;}}else{const action=btn.dataset.act;if(action==='interact')interact();else if(action==='punch')punch();else if(action?.startsWith('skill'))punch(Number(action.substring(5)));else if(action==='dash')dodge();else if(action==='heal')heal();}});
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])btn.addEventListener(ev,e=>{e.preventDefault();btn.classList.remove('held');if(btn.dataset.hold){controls[btn.dataset.hold]=false;if(btn.dataset.hold==='guard'&&battle)battle.guard=false;}});
}
cv.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button===0&&started&&!modal){e.preventDefault();punch();}});
$('play').onclick=()=>{started=true;$('intro').hidden=true;cv.focus({preventScroll:true});hud();notice('WELCOME! TALK TO GOJO FOR REPEATABLE QUESTS',3);};
document.querySelectorAll('[data-panel]').forEach(btn=>btn.addEventListener('click',()=>panel(btn.dataset.panel)));$('close').onclick=closePanel;$('sheet').addEventListener('pointerdown',e=>{if(e.target===$('sheet'))closePanel();});
$('questToggle').onclick=()=>{const box=$('questHud'),hidden=box.classList.toggle('collapsed');$('questToggle').textContent=hidden?'+':'−';$('questToggle').setAttribute('aria-label',hidden?'Expand quest tracker':'Collapse quest tracker');};
$('menuToggle').onclick=()=>{const nav=$('gameNav'),open=nav.classList.toggle('open');$('menuToggle').setAttribute('aria-expanded',String(open));};
$('gameNav').addEventListener('click',()=>{$('gameNav').classList.remove('open');$('menuToggle').setAttribute('aria-expanded','false');});
function initialWorld(){world=MAPS[state.zone];resetPos();mobs=spawnMobs(state.zone);hud();}
initialWorld();
window.__RPG_TEST={snapshot:()=>({level:state.level,coins:state.coins,zone:state.zone,quest:state.quest,owned:[...state.owned],cleared:[...state.cleared],mode,battle:battle?{id:battle.id,hp:battle.hp,playerHP:battle.playerHP,phase:battle.phase}:null}),maps:MAPS.map(m=>({walkable:[...m.tiles].filter(t=>![4,5,6,8].includes(t)).length,buildings:m.buildings.length})),teleport:(x,y)=>{P.x=x*T;P.y=y*T;},schoolTile:(x,y)=>MAPS[0].tiles[idx(x,y)],indoors:()=>Boolean(interior),changeZone,interact,acceptQuest:getQuest};
requestAnimationFrame(frameLoop);
})();
