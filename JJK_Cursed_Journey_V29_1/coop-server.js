'use strict';
// Private-code cooperative story rooms. The server controls shared XP, level,
// boss HP, admin permissions and timed morphs; clients never grant themselves XP.
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const C = require('./public/rpg-core.js');
const MAX_ROOMS = 150;
const rooms = new Map();
const sprites = new Set(fs.readdirSync(path.join(__dirname,'public','sprites')).filter(x=>x.endsWith('.png')).map(x=>x.slice(0,-4)));
const bossNames = {finger:'Finger Bearer',geto:'Geto',mahito:'Mahito',jogo:'Jogo',hanami:'Hanami',mahoraga:'Mahoraga',heian:'Sukuna (Heian)',sukuna:'Sukuna',kenjaku:'Kenjaku',dagon:'Dagon'};
const BOSSES=Object.keys(bossNames);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const number=(v,a,b)=>Number.isFinite(Number(v))?clamp(Number(v),a,b):a;
const validCode=c=>/^[A-Z0-9]{4,12}$/.test(c);
const text=(s,max=16)=>String(s??'').replace(/[^\p{L}\p{N} _-]/gu,'').trim().slice(0,max);
const safeSend=(peer,data)=>{if(!peer.closed)peer.send(data);};
const sendRoom=(r,data)=>{for(const p of r.members.values())safeSend(p.peer,data);};
const msgError=(p,message)=>safeSend(p,{type:'coopError',message});
const need=(l)=>C.xpNeed(l);
function multiplier(n){return ({1:1,2:2.2,3:2.4,4:2.7,5:3.0,6:3.4})[clamp(n,1,6)];}
function publicRoom(r){return {code:r.code,capacity:r.capacity,host:r.host,players:[...r.members.values()].map(m=>({id:m.id,name:m.name,zone:m.zone,hero:displayHero(m),x:m.x,y:m.y,battleX:m.battleX,inBattle:m.inBattle})),level:r.level,xp:r.xp,coins:r.coins,cleared:[...r.cleared],xpMultiplier:multiplier(r.members.size),boss:r.boss&&publicBoss(r.boss)};}
const publicBoss=b=>({id:b.id,name:bossNames[b.id],zone:b.zone,hp:Math.round(b.hp),max:b.max,ex:Math.round(b.ex),phase:b.hp<b.max*.28?3:b.hp<b.max*.6?2:1});
function push(r){sendRoom(r,{type:'coopState',room:publicRoom(r)});}
function award(r,xp,coins,reason){const mult=multiplier(r.members.size);r.xp+=Math.round(Math.max(0,xp)/mult);r.coins+=Math.round(Math.max(0,coins));let ups=0;while(r.level<100&&r.xp>=need(r.level)){r.xp-=need(r.level);r.level++;ups++;}if(r.level===100)r.xp=0;sendRoom(r,{type:'coopAward',reason,xp:Math.round(xp/mult),coins:Math.round(coins),levelUps:ups});push(r);}
function displayHero(m){return m.morph?.hero||m.hero;}
function randCode(){let c;do{c=crypto.randomBytes(4).toString('hex').toUpperCase().slice(0,7);}while(rooms.has(c));return c;}
function exit(peer){const r=peer.coopRoom;if(!r)return;const member=r.members.get(peer.playerId);peer.coopRoom=null;r.members.delete(peer.playerId);peer.coopAdmin=false;if(!r.members.size){rooms.delete(r.code);return;}if(r.host===peer.playerId)r.host=r.members.keys().next().value;if(member?.inBattle&&r.boss&&![...r.members.values()].some(m=>m.inBattle))r.boss=null;push(r);}
function join(peer,r){if(peer.coopRoom)exit(peer);if(r.members.size>=r.capacity)return msgError(peer,'That code is full');let m={peer,id:peer.playerId,name:text(peer.displayName)||'SORCERER',hero:'yuji',zone:0,x:360,y:620,battleX:245,inBattle:false,morph:null,lastHit:0,lastSpell:0,energy:100,energyAt:Date.now(),lastMob:0,quest:null,cycles:Array(7).fill(0)};r.members.set(m.id,m);peer.coopRoom=r;peer.coopAdmin=false;safeSend(peer,{type:'coopJoined',id:m.id,room:publicRoom(r)});if(r.boss){m.zone=r.boss.zone;m.inBattle=true;m.battleX=190+(r.members.size-1)*110;safeSend(peer,{type:'coopBossStart',boss:publicBoss(r.boss)});}push(r);}
function create(peer,message){const capacity=Number(message.capacity);if(!Number.isInteger(capacity)||capacity<1||capacity>6)return msgError(peer,'Choose 1 to 6 players');if(rooms.size>=MAX_ROOMS)return msgError(peer,'All rooms busy');const c=String(message.code||'').toUpperCase().trim()||randCode();if(!validCode(c))return msgError(peer,'Use 4–12 letters or numbers for a room code');if(rooms.has(c))return msgError(peer,'That room code is already taken');const r={code:c,capacity,host:peer.playerId,members:new Map(),level:1,xp:0,coins:0,cleared:new Set(),boss:null,deadMobs:new Map()};rooms.set(c,r);join(peer,r);}
function isAdminKeyCorrect(key){const expected=process.env.ADMIN_KEY||'';if(expected.length<12||typeof key!=='string'||key.length>256)return false;const a=crypto.createHash('sha256').update(key).digest(),b=crypto.createHash('sha256').update(expected).digest();return crypto.timingSafeEqual(a,b);}
function authenticate(peer,msg){if(!peer.coopRoom)return msgError(peer,'Join or create a room first');if(peer.adminFailures>=6)return msgError(peer,'Too many tries. Reconnect later.');if(isAdminKeyCorrect(msg.key)){peer.coopAdmin=true;safeSend(peer,{type:'coopAdminOK'});}else{peer.adminFailures=(peer.adminFailures||0)+1;msgError(peer,'Incorrect admin password');}}
function bossStart(r,id,zone){if(!BOSSES.includes(id)||!Number.isInteger(zone)||zone<0||zone>=C.ZONES.length)return false;const size=r.members.size,stage=C.ZONES.findIndex(z=>z.boss===id),level=stage>=0?C.ZONES[stage].bossLevel:50;const max=Math.round((400+level*31+Math.max(0,stage)*100+(id==='mahoraga'?880:0)+(id==='heian'?1550:0))*(1+.55*(size-1)));r.boss={id,zone,hp:max,max,ex:755};for(const [i,m] of [...r.members.values()].entries()){m.zone=zone;m.inBattle=true;m.battleX=170+i*125;m.energy=100;m.energyAt=Date.now();m.lastHit=0;m.lastSpell=0;}sendRoom(r,{type:'coopBossStart',boss:publicBoss(r.boss)});push(r);return true;}
function hitBoss(peer,r,m,skill){const b=r.boss;if(!b||!m.inBattle||m.zone!==b.zone)return;skill=Number(skill);if(![0,1,2,3,4].includes(skill))return;const now=Date.now();const cd=skill?300:190;if(now-m.lastHit<cd)return;m.energy=clamp(m.energy+(now-m.energyAt)/1000*8,0,100);m.energyAt=now;if(skill){const cost=12+skill*9;if(m.energy<cost||now-m.lastSpell<280+skill*170)return;m.energy-=cost;m.lastSpell=now;}m.lastHit=now;const range=skill?315:112;if(Math.abs(m.battleX-b.ex)>range)return;const power=9+r.level*.85;const damage=Math.round(power*(skill?1.25+skill*.58:1));b.hp=Math.max(0,b.hp-damage);sendRoom(r,{type:'coopBossHit',by:m.name,damage,boss:publicBoss(b)});
 if(b.hp===0){const zone=b.zone,id=b.id;r.cleared.add(id);r.boss=null;for(const p of r.members.values())p.inBattle=false;sendRoom(r,{type:'coopBossWon',id,zone});award(r,Math.round(90*Math.pow(1.5,zone)),Math.round(130*Math.pow(1.5,zone)),'BOSS: '+bossNames[id]);}}
function userQuest(r,m,msg){const zone=Number(msg.zone);if(!Number.isInteger(zone)||zone<0||zone>=7||m.quest)return;const stage=C.ZONES[zone],boss=Boolean(msg.boss),cycle=m.cycles[zone];const q=boss?C.bossFor(zone):C.questFor(zone,cycle);m.quest={zone,boss,target:boss?1:q.target,progress:0,done:false,xp:q.xp,coins:q.coins,cycle};m.cycles[zone]++;safeSend(m.peer,{type:'coopQuestProgress',progress:0,done:false});}
function mobKilled(peer,r,m,msg){const zone=Number(msg.zone),id=Number(msg.mobId),now=Date.now();if(m.inBattle||zone!==m.zone||!Number.isInteger(id)||id<0||id>=7||now-m.lastMob<180)return;m.lastMob=now;const key=zone+':'+id;if((r.deadMobs.get(key)||0)>now)return;r.deadMobs.set(key,now+8_000);
 for(const a of r.members.values())if(a.quest&&a.quest.zone===zone&&!a.quest.boss&&!a.quest.done){a.quest.progress++;if(a.quest.progress>=a.quest.target)a.quest.done=true;safeSend(a.peer,{type:'coopQuestProgress',progress:a.quest.progress,done:a.quest.done});}
 award(r,Math.round(22*Math.pow(1.51,zone)),Math.round(13*Math.pow(1.45,zone)),m.name+' EXORCISED CURSE');}
function claimQuest(peer,r,m){const q=m.quest;if(!q||!q.done)return msgError(peer,'Finish your contract before claiming it');m.quest=null;safeSend(peer,{type:'coopQuestClaimed'});award(r,q.xp,q.coins,m.name+' COMPLETED CONTRACT');}
function adminAction(peer,r,m,msg){if(!peer.coopAdmin)return msgError(peer,'Admin permission required');const action=String(msg.action||'');if(action==='xp'){
 const amount=Number(msg.amount);if(!Number.isInteger(amount)||amount<1||amount>1_000_000)return msgError(peer,'Choose between 1 and 1,000,000 XP');award(r,amount,0,'ADMIN XP DROP');sendRoom(r,{type:'coopAnnouncement',message:'ADMIN XP EVENT: +'+amount.toLocaleString()+' BASE XP'});return;}
 if(action==='boss'){if(r.boss)return msgError(peer,'Finish the current boss first');const id=String(msg.boss),zone=Number(msg.zone);if(!bossStart(r,id,zone))return msgError(peer,'Invalid boss or map');sendRoom(r,{type:'coopAnnouncement',message:'ADMIN SUMMONED '+bossNames[id]+'!'});return;}
 if(action==='morph'){const hero=String(msg.hero||''),duration=Number(msg.duration),scope=String(msg.scope||'all');if(!sprites.has(hero)&&hero!=='gojo_prime')return msgError(peer,'Unknown character');if(![0,60,300,600,1800].includes(duration))return msgError(peer,'Choose an available duration');if(!['all','self'].includes(scope))return msgError(peer,'Invalid morph scope');const until=duration?Date.now()+duration*1000:0;const targets=scope==='all'?[...r.members.values()]:[m];for(const p of targets)p.morph={hero,until};sendRoom(r,{type:'coopMorph',targets:targets.map(p=>p.id),hero,until});push(r);return;}
 msgError(peer,'Unknown admin action');}
function receive(peer,msg){const type=String(msg.type||'');if(type==='coopCreate')return create(peer,msg);if(type==='coopJoin'){const c=String(msg.code||'').toUpperCase().trim();const r=rooms.get(c);return r?join(peer,r):msgError(peer,'No active room with that code');}if(type==='coopLeave'){exit(peer);safeSend(peer,{type:'coopLeft'});return;}
 if(type==='coopAuth')return authenticate(peer,msg);
 const r=peer.coopRoom;if(!r)return msgError(peer,'Create or join a room first');const m=r.members.get(peer.playerId);if(!m)return;
 if(type==='coopAdminAction')return adminAction(peer,r,m,msg);
 if(type==='coopName'){m.name=text(msg.name)||'SORCERER';push(r);return;}
 if(type==='coopPosition'){const zone=Number(msg.zone);if(!Number.isInteger(zone)||zone<0||zone>=7||m.inBattle)return;m.zone=zone;m.x=Math.round(number(msg.x,0,2560));m.y=Math.round(number(msg.y,0,1792));const hero=String(msg.hero);if(C.HEROES.some(h=>h.id===hero))m.hero=hero;sendRoom(r,{type:'coopPosition',id:m.id,zone:m.zone,x:m.x,y:m.y,hero:displayHero(m)});return;}
 if(type==='coopBossPosition'){if(!m.inBattle||!r.boss)return;m.battleX=number(msg.x,45,979);return;}
 if(type==='coopMobKill')return mobKilled(peer,r,m,msg);
 if(type==='coopQuestAccept')return userQuest(r,m,msg);
 if(type==='coopQuestClaim')return claimQuest(peer,r,m);
 if(type==='coopBossStart'){if(r.boss)return msgError(peer,'A boss fight is already in progress');const zone=Number(msg.zone);const z=C.ZONES[zone];if(!z||z.boss!==msg.boss||m.zone!==zone)return msgError(peer,'Go to that region to challenge its boss');return bossStart(r,z.boss,zone);}
 if(type==='coopBossAttack')return hitBoss(peer,r,m,msg.skill);
}
function disconnect(peer){exit(peer);}
function heartbeat(){const now=Date.now();for(const r of rooms.values()){
 let expired=false;for(const m of r.members.values())if(m.morph?.until&&m.morph.until<=now){m.morph=null;sendRoom(r,{type:'coopMorphEnd',targets:[m.id]});expired=true;}if(expired)push(r);
 for(const [key,expiry] of r.deadMobs)if(expiry<now)r.deadMobs.delete(key);
 if(r.boss){const b=r.boss;const nearest=[...r.members.values()].filter(p=>p.inBattle).sort((a,z)=>Math.abs(a.battleX-b.ex)-Math.abs(z.battleX-b.ex))[0];if(nearest){const gap=nearest.battleX-b.ex;if(Math.abs(gap)>130)b.ex=clamp(b.ex+Math.sign(gap)*9,80,950);}sendRoom(r,{type:'coopBossState',boss:publicBoss(b),players:[...r.members.values()].map(m=>({id:m.id,battleX:m.battleX,inBattle:m.inBattle}))});}
}}
module.exports={receive,disconnect,heartbeat,rooms,publicRoom,multiplier};
