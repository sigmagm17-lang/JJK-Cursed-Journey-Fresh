'use strict';
const assert = require('node:assert/strict');
const coop = require('../coop-server.js');
process.env.ADMIN_KEY='V30_TEST_KEY_NOT_FOR_PRODUCTION';
const mk=id=>({playerId:id,displayName:id,closed:false,coopAdmin:false,adminFailures:0,log:[],send(v){this.log.push(v);},last(type){return this.log.filter(m=>m.type===type).at(-1);}});
const send=(p,m)=>coop.receive(p,m);
const owner=mk('OWNER30'),guest=mk('GUEST30');
send(owner,{type:'coopCreate',code:'V30TEST',capacity:2});send(guest,{type:'coopJoin',code:'V30TEST'});
const r=coop.rooms.get('V30TEST');
// Access check applied to every privileged power.
for(const action of ['coins','level','teleport','heal','energy','xpBoost','coinBoost','bossHeal','bossSmite','announce']){
 send(guest,{type:'coopAdminAction',action,amount:1000,level:50,zone:2,factor:3,duration:60,percent:25,message:'hello'});
 assert.equal(guest.last('coopError').message,'Admin permission required',action);
}
send(owner,{type:'coopAuth',key:'V30_TEST_KEY_NOT_FOR_PRODUCTION'});assert(owner.last('coopAdminOK'));
send(owner,{type:'coopAdminAction',action:'coins',amount:1234});assert.equal(r.coins,1234);assert.equal(guest.last('coopAward').coins,1234);
send(owner,{type:'coopAdminAction',action:'level',level:50});assert.equal(r.level,50);assert.equal(guest.last('coopState').room.level,50);
send(owner,{type:'coopAdminAction',action:'teleport',zone:6});assert.equal(guest.last('coopTeleport').zone,6);assert.equal(r.members.get('GUEST30').zone,6);
send(owner,{type:'coopAdminAction',action:'heal'});assert.equal(guest.last('coopRestore').kind,'hp');
send(owner,{type:'coopAdminAction',action:'energy'});assert.equal(guest.last('coopRestore').kind,'energy');assert.equal(r.members.get('GUEST30').energy,100);
send(owner,{type:'coopAdminAction',action:'xpBoost',factor:4,duration:60});assert.equal(r.xpBoost,4);assert(r.xpBoostUntil>Date.now());
send(owner,{type:'coopAdminAction',action:'coinBoost',factor:2,duration:60});assert.equal(r.coinBoost,2);assert(r.coinBoostUntil>Date.now());
// A normal quest/mob reward receives the multiplier while active.
const coinsBefore=r.coins;
send(owner,{type:'coopMobKill',zone:6,mobId:1});assert(r.coins>coinsBefore);
assert.equal(owner.last('coopAward').coins,Math.round(Math.round(13*Math.pow(1.45,6))*2));
send(owner,{type:'coopAdminAction',action:'boss',boss:'heian',zone:6});assert(r.boss);
send(owner,{type:'coopAdminAction',action:'teleport',zone:0});assert.equal(owner.last('coopError').message,'Finish the boss battle before teleporting');
send(owner,{type:'coopAdminAction',action:'bossSmite',percent:25});assert(r.boss.hp<r.boss.max);
send(owner,{type:'coopAdminAction',action:'bossHeal'});assert.equal(r.boss.hp,r.boss.max);
send(owner,{type:'coopAdminAction',action:'announce',message:'RUN FROM SUKUNA!'});assert.equal(guest.last('coopAnnouncement').message,'ADMIN: RUN FROM SUKUNA!');
// Inputs are validated server-side.
send(owner,{type:'coopAdminAction',action:'bossSmite',percent:999});assert.equal(owner.last('coopError').message,'Choose 25% or 50% boss damage');
send(owner,{type:'coopAdminAction',action:'level',level:-2});assert.equal(owner.last('coopError').message,'Select a level from 1 to 100');
send(owner,{type:'coopAdminAction',action:'xpBoost',factor:999,duration:60});assert.equal(owner.last('coopError').message,'Choose even XP boosts 2x–30x for 1, 5, 10 or 30 minutes');
// Expiration reverts multipliers and broadcasts the update.
r.xpBoostUntil=Date.now()-1;r.coinBoostUntil=Date.now()-1;coop.heartbeat();assert.equal(r.xpBoost,1);assert.equal(r.coinBoost,1);
send(owner,{type:'coopLeave'});send(guest,{type:'coopLeave'});
assert(!coop.rooms.has('V30TEST'));
console.log('PASS V30: ten extra admin powers, access control, validation, XP and coin events, boss state, room cleanup');
