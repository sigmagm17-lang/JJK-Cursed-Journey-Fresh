'use strict';
const assert=require('node:assert/strict');
const coop=require('../coop-server.js');
const C=require('../public/rpg-core.js');
process.env.ADMIN_KEY='TEST_ONLY_16_CHARACTER_KEY_DO_NOT_USE';
function fake(name){return {playerId:name,displayName:name,closed:false,coopAdmin:false,adminFailures:0,log:[],send(m){this.log.push(m);},last(type){return this.log.filter(a=>a.type===type).at(-1);}};}
const host=fake('OWNER'),friend=fake('FRIEND');
const send=(p,m)=>coop.receive(p,m);
send(host,{type:'coopCreate',code:'SUKUNA99',capacity:2});
assert.equal(host.last('coopJoined').room.code,'SUKUNA99');
send(friend,{type:'coopJoin',code:'SUKUNA99'});
assert.equal(friend.last('coopJoined').room.players.length,2);
assert.equal(coop.multiplier(2),2.2);
assert.equal(coop.multiplier(5),3);
assert.equal(coop.multiplier(6),3.4);
send(friend,{type:'coopAdminAction',action:'xp',amount:5000});
assert.equal(friend.last('coopError').message,'Admin permission required');
send(host,{type:'coopAuth',key:'BAD_PASSWORD'});
assert.equal(host.last('coopError').message,'Incorrect admin password');
send(host,{type:'coopAuth',key:'TEST_ONLY_16_CHARACTER_KEY_DO_NOT_USE'});
assert(host.last('coopAdminOK'));
send(host,{type:'coopAdminAction',action:'xp',amount:5000});
let r=coop.rooms.get('SUKUNA99');
assert.ok(r.level>1);
assert.equal(friend.last('coopState').room.level,r.level);
const levelBeforeBoss=r.level;
send(host,{type:'coopAdminAction',action:'boss',boss:'heian',zone:0});
assert.equal(r.boss.id,'heian');assert.equal(r.boss.zone,0);
assert.equal(friend.last('coopBossStart').boss.id,'heian');
// Server-shared boss damage; do not accept client-selected damage/hp.
send(friend,{type:'coopBossPosition',x:745});
send(host,{type:'coopBossPosition',x:745});
const before=r.boss.hp;
send(friend,{type:'coopBossAttack',skill:4,damage:999999999,hp:0});
assert.ok(r.boss.hp<before&&r.boss.hp>before-500);
// Only admin can morph or spawn a boss.
send(friend,{type:'coopAdminAction',action:'morph',scope:'all',hero:'sukuna',duration:60});
assert.equal(friend.last('coopError').message,'Admin permission required');
send(host,{type:'coopAdminAction',action:'morph',scope:'all',hero:'sukuna',duration:60});
assert.equal(friend.last('coopMorph').hero,'sukuna');
assert.equal(r.members.get(friend.playerId).morph.hero,'sukuna');
// Force a short local defeat to verify the group wins and receives the same level.
r.boss.hp=1;r.members.get(host.playerId).lastHit=0;
send(host,{type:'coopBossAttack',skill:0});
assert.equal(r.boss,null);
assert(r.cleared.has('heian'));
assert(host.last('coopBossWon'));assert(friend.last('coopBossWon'));
assert.equal(host.last('coopState').room.level,friend.last('coopState').room.level);
// Validated mob exorcisms produce shared XP only once for a given mob and cooldown.
const oldXp=r.xp;
send(host,{type:'coopMobKill',zone:0,mobId:1});
const nextXp=r.xp;
send(friend,{type:'coopMobKill',zone:0,mobId:1});
assert.equal(r.xp,nextXp);
// Room owner is not automatically the admin; ADMIN_KEY auth is required.
send(host,{type:'coopLeave'});assert.equal(coop.rooms.get('SUKUNA99').host,friend.playerId);
assert.equal(friend.coopAdmin,false);
send(friend,{type:'coopLeave'});assert.equal(coop.rooms.has('SUKUNA99'),false);
const maxHost=fake('BIG_HOST');send(maxHost,{type:'coopCreate',code:'MAXSIX',capacity:6});
const group=[maxHost];for(let i=1;i<6;i++){const u=fake('PERSON'+i);send(u,{type:'coopJoin',code:'MAXSIX'});group.push(u);}
assert.equal(coop.rooms.get('MAXSIX').members.size,6);
const extra=fake('SEVENTH');send(extra,{type:'coopJoin',code:'MAXSIX'});assert.equal(extra.last('coopError').message,'That code is full');
send(maxHost,{type:'coopAuth',key:'TEST_ONLY_16_CHARACTER_KEY_DO_NOT_USE'});
send(maxHost,{type:'coopAdminAction',action:'morph',scope:'all',hero:'dagon',duration:60});
for(const p of group)assert.equal(coop.rooms.get('MAXSIX').members.get(p.playerId).morph.hero,'dagon');
for(const m of coop.rooms.get('MAXSIX').members.values())m.morph.until=Date.now()-1;
coop.heartbeat();for(const p of group)assert(p.last('coopMorphEnd'));
for(const p of group)send(p,{type:'coopLeave'});
assert(!coop.rooms.has('MAXSIX'));
console.log('PASS co-op rooms, shared XP, boss, admin security, timed morph, room cleanup');
