'use strict';
const assert=require('node:assert/strict');
const B=require('../public/building-stories.js');
const C=require('../public/rpg-core.js');
const keys=Object.keys(B.profiles);
assert(keys.length>=18,'unique story profiles');
for(const [name,story] of Object.entries(B.profiles)){
 assert.equal(story.answers.length,3,name+' must have 3 puzzle options');
 assert(story.correct>=0&&story.correct<3,name+' valid correct answer');
 assert(story.line.length>25&&story.clue.length>25&&story.rumor.length>15,name+' meaningful NPC and clue');
 assert(typeof story.sprite==='string'&&story.sprite.length>1,name+' NPC art');
}
const ids=new Set();
for(let stage=0;stage<7;stage++)for(let i=0;i<8;i++){
 const p=B.info({name:keys[i],x:i+10,y:stage+11},stage);
 assert(!ids.has(p.id),'each building has a unique saved secret');ids.add(p.id);
 assert(B.choose(p,p.correct),p.name+' correct option accepted');
 assert(!B.choose(p,(p.correct+1)%3),p.name+' incorrect option rejected');
 assert(p.bonusXP>0&&p.bonusCoins>0);
}
const s=C.initial();s.buildingFinds=['0:28:5'];
const restored=C.sanitize(JSON.parse(JSON.stringify(s)));
assert.deepEqual(restored.buildingFinds,['0:28:5'],'solo story secrets survive save/load');
console.log('PASS V29 unique NPC dialogues, riddle choices, saved building secrets, repeat-safe reward identifiers');
