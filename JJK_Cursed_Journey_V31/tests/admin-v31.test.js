'use strict';
const assert=require('node:assert/strict');
const MAYHEM=require('../public/admin-mayhem.js');
const coop=require('../coop-server.js');
process.env.ADMIN_KEY='LONG_TEST_SECRET_FOR_MAYHEM_31';
const mock=(id)=>({playerId:id,displayName:id,closed:false,coopAdmin:false,adminFailures:0,log:[],send(msg){this.log.push(msg);},last(type){return this.log.filter(x=>x.type===type).at(-1);}});
const a=mock('MAYHEM_OWNER'),b=mock('MAYHEM_GUEST');const send=(p,msg)=>coop.receive(p,msg);
send(a,{type:'coopCreate',code:'MAYHEM31',capacity:2});send(b,{type:'coopJoin',code:'MAYHEM31'});
const room=coop.rooms.get('MAYHEM31');assert(room);
// All V31 privileges require the server secret, never a client-provided admin flag.
for(const action of ['weather','weatherClear','bossForm','event','clearMayhem']){
 send(b,{type:'coopAdminAction',action,weather:'golden_hour',event:'jackpot',hero:'heian',duration:300});
 assert.equal(b.last('coopError').message,'Admin permission required',action);
}
send(a,{type:'coopAuth',key:'LONG_TEST_SECRET_FOR_MAYHEM_31'});assert(a.last('coopAdminOK'));
assert.equal(MAYHEM.XP_FACTORS.length,15);
for(const n of [2,4,6,8,10,12,14,16,18,20,22,24,26,28,30]){
 send(a,{type:'coopAdminAction',action:'xpBoost',factor:n,duration:300});
 assert.equal(room.xpBoost,n,`${n}× XP was not activated`);
 assert(room.xpBoostUntil>Date.now());
}
send(a,{type:'coopAdminAction',action:'xpBoost',factor:3,duration:300});assert.equal(a.last('coopError').message,'Choose even XP boosts 2x–30x for 1, 5, 10 or 30 minutes');
send(a,{type:'coopAdminAction',action:'xpBoost',factor:30,duration:1800});assert.equal(room.xpBoost,30);
room.xpBoost=1;room.xpBoostUntil=0;
assert.equal(Object.keys(MAYHEM.WEATHER).length,10);
for(const [id,weather] of Object.entries(MAYHEM.WEATHER)){
 send(a,{type:'coopAdminAction',action:'weather',weather:id,duration:300});
 assert.equal(room.weather.id,id);assert.equal(coop.publicRoom(room).weather.detail,weather.detail);
 assert.equal(coop.publicRoom(room).weather.coins,weather.coins);
}
// XP and coin rewards are server-authoritative and boosted by the active weather.
send(a,{type:'coopAdminAction',action:'weather',weather:'golden_hour',duration:300});
const beforeCoins=room.coins;const beforeXp=room.xp;
send(a,{type:'coopMobKill',zone:0,mobId:3});
assert.equal(room.coins-beforeCoins,13*5,'Golden Hour must give fivefold coin rewards');
assert(room.xp>beforeXp,'Weather XP perk should produce XP');
send(a,{type:'coopAdminAction',action:'weather',weather:'none',duration:300});assert.equal(a.last('coopError').message,'Choose one of 10 weathers and a valid duration');
// Real boss forms change all teammates' heroes and server-side boss damage.
send(a,{type:'coopAdminAction',action:'weatherClear'});assert.equal(room.weather,null);
send(a,{type:'coopAdminAction',action:'boss',boss:'jogo',zone:0});assert.equal(room.boss.id,'jogo');
send(a,{type:'coopBossPosition',x:755});
const member=room.members.get(a.playerId);member.lastHit=0;let hp=room.boss.hp;
send(a,{type:'coopBossAttack',skill:0});const normalDamage=hp-room.boss.hp;assert(normalDamage>0);
send(a,{type:'coopAdminAction',action:'bossForm',hero:'heian',scope:'all',duration:300});
assert.equal(room.members.get(b.playerId).form.hero,'heian');
assert.equal(coop.publicRoom(room).players.find(x=>x.id===b.playerId).hero,'heian');
assert.equal(b.last('coopBossForm').hero,'heian');
member.lastHit=0;hp=room.boss.hp;send(a,{type:'coopBossAttack',skill:0});
assert(hp-room.boss.hp>=normalDamage*2.5,'The transformed player must deal ~2.75x damage');
member.form.until=Date.now()-1;coop.heartbeat();assert(a.last('coopBossFormEnd'));
// Temporary events must be validated and reflected in the room state.
room.boss=null;for(const m of room.members.values())m.inBattle=false;
assert.equal(Object.keys(MAYHEM.EVENTS).length,10);
for(const id of Object.keys(MAYHEM.EVENTS)){
 room.boss=null;room.bossRush=[];
 send(a,{type:'coopAdminAction',action:'event',event:id,duration:300});
 assert.equal(room.event.id,id,id+' event missing');assert(coop.publicRoom(room).event);
 assert(a.last('coopAnnouncement'),id+' event should announce to players');
}
send(a,{type:'coopAdminAction',action:'event',event:'fake_event',duration:300});assert.equal(a.last('coopError').message,'Choose a mayhem event and duration');
// Three boss waves should start automatically and finish with a real party reward.
room.boss=null;room.bossRush=[];
send(a,{type:'coopAdminAction',action:'event',event:'boss_rush',duration:300});
for(const boss of ['finger','jogo','heian']){
 assert.equal(room.boss.id,boss);
 send(a,{type:'coopBossPosition',x:room.boss.ex});
 member.lastHit=0;room.boss.hp=1;
 send(a,{type:'coopBossAttack',skill:0});
}
assert.equal(room.boss,null);assert.equal(room.bossRush.length,0);
assert(a.log.some(m=>m.type==='coopAward'&&m.reason==='BOSS RUSH FINAL REWARD'));
// Expiry and clear must restore base world state and not wipe the shared level.
const levelBefore=room.level;
send(a,{type:'coopAdminAction',action:'clearMayhem'});
assert.equal(room.weather,null);assert.equal(room.event,null);assert.equal(room.xpBoost,1);assert.equal(room.coinBoost,1);assert.equal(room.level,levelBefore);
assert.equal(room.members.get(b.playerId).form,null);
send(a,{type:'coopAdminAction',action:'weather',weather:'sakura_bloom',duration:60});room.weather.until=Date.now()-1;coop.heartbeat();assert.equal(room.weather,null);
send(a,{type:'coopLeave'});send(b,{type:'coopLeave'});assert.equal(coop.rooms.has('MAYHEM31'),false);
console.log('PASS V31: 15 XP multipliers, 10 weather perks, 10 events, boss forms/damage, boss rush, security, expiration and cleanup');
