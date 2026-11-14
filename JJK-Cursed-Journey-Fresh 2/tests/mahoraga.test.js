'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const s=fs.readFileSync('public/adventure.js','utf8');
const moves=s.slice(s.indexOf('const MAHORAGA_MOVES=['),s.indexOf('const touched='));
const fn=s.slice(s.indexOf('function resolveMahoragaMove(b){'),s.indexOf('function updateFight(dt){'));
const c={Math,sceneTime:11,clamp:(x,l,h)=>Math.max(l,Math.min(h,x)),save:{level:5,quest:11},fx:[],log:[],toast(message){c.lastMessage=message;},returnExplore(){c.won=true;},battle:null};
vm.createContext(c);vm.runInContext(moves+'\n'+fn,c);
const defs=vm.runInContext('MAHORAGA_MOVES',c);
assert.equal(defs.length,6,'six boss moves');
assert.equal(new Set(defs.map(m=>m.id)).size,6);
function makeBoss(move){const b={move,px:420,enemyX:470,enemyHP:210,enemyMax:400,hp:220,phase:1,guard:false,guardStart:0,stun:0,invincible:0,adaptStacks:0,armorUntil:0};c.battle=b;return b;}
for(const m of defs){
 c.fx.length=0;let b=makeBoss(m);vm.runInContext(`resolveMahoragaMove(battle)`,c);
 assert.equal(b.attackPose,m.pose,`pose for ${m.id}`);
 if(m.id==='wheel'){assert(b.armorUntil>11);assert(b.enemyHP>210);assert(c.fx.some(f=>f.type==='wheel'));}
 else{assert(b.hp<220,`real damage for ${m.id}`);if(m.id==='rush')assert.notEqual(b.enemyX,470,'rush repositions');}
}
for(const m of defs.filter(x=>x.damage>0)){
 const b=makeBoss(m);b.guard=true;b.guardStart=10.9;
 vm.runInContext('resolveMahoragaMove(battle)',c);
 assert.equal(b.hp,220,'perfect parry prevents damage: '+m.id);assert(b.stun>0,'parry stuns boss');
}
for(const m of defs.filter(x=>x.damage>0)){
 const b=makeBoss(m);b.invincible=.15;
 vm.runInContext('resolveMahoragaMove(battle)',c);
 assert.equal(b.hp,220,'dash immunity works for '+m.id);
}
assert.equal(fs.existsSync('public/sprites/mahoraga_boss.png'),true);
console.log('PASS six distinct Mahoraga moves, attack poses, real damage, adaptation buff, timed parries, dodge invulnerability');
